# -*- coding: utf-8 -*-
import json, sys
sys.stdout.reconfigure(encoding='utf-8')
TS = '2026-10-20T10:20'
D = 'data/learn/ai-infra.json'

ADD = {}

ADD['分布式训练'] = r'''
## 先算清楚：你到底卡在哪

分布式训练有 DDP、ZeRO、TP、PP 四种手段，新手容易一上来就想「全用上」。正确顺序是先算一张账，确定自己卡在哪个瓶颈。以 7B 参数的 VLA 模型、混合精度训练为例，单卡显存大致由四块组成：

| 组成部分 | 计算方式（7B 模型） | 大小 |
|---|---|---|
| 模型权重（bf16） | 7B × 2 字节 | 14 GB |
| 梯度（bf16） | 7B × 2 字节 | 14 GB |
| 优化器状态（Adam fp32 动量+方差） | 7B × 4 × 2 字节 | 56 GB |
| 主权重副本（fp32） | 7B × 4 字节 | 28 GB |
| **合计** | | **112 GB** |

再加上激活值（和 batch size、序列长度正相关，通常 10-30 GB），单卡 80 GB 的 A100/H100 是装不下的。这张表直接告诉你对策：

- **如果总需求略超单卡**（比如 90 GB vs 80 GB）：先试着减小 batch size、开梯度检查点（activation checkpointing），激活值那块能压掉 70%。这比上分布式便宜得多。
- **如果优化器状态是主要开销**（上面例子里它占 56 GB，一半）：上 ZeRO Stage 1/2，把优化器状态切到多卡。
- **如果模型本身就装不下**：ZeRO Stage 3，把参数也切分。
- **如果单节点 8 卡还装不下**：才需要跨节点的 TP + PP。

## 四种并行手段的定位

| 手段 | 切什么 | 通信量 | 什么时候用 |
|---|---|---|---|
| DDP（数据并行） | 数据，模型每卡一份 | 梯度 all-reduce，中等 | **永远先试这个**，模型能塞进单卡时的首选 |
| ZeRO-1/2/3 | 优化器状态 / 梯度 / 参数 | 随 stage 递增 | 单卡放不下，但还想保持数据并行的简单性 |
| TP（张量并行） | 单层内的矩阵按列/行切开 | 极大（每层都要通信） | 单卡放不下一层，且卡间有 NVLink |
| PP（流水线并行） | 按层切，不同卡放不同层 | 小（只在段边界传激活） | 层数多、跨节点扩展时 |

关键判据：**TP 的通信量最大，只在节点内用**（NVLink 带宽 900 GB/s 撑得住）；一旦跨节点（以太网 100 Gbps 级别），TP 的通信开销会吃掉全部收益，此时应该用 PP。

## 最小可运行：torchrun 起 DDP

```bash
# 单机 8 卡
torchrun --standalone --nproc_per_node=8 train_vla.py \
    --data data/lerobot_debug \
    --batch_size 4 --grad_accum 8
```

```python
import os, torch
import torch.distributed as dist
from torch.nn.parallel import DistributedDataParallel as DDP

def setup():
    dist.init_process_group("nccl")
    local_rank = int(os.environ["LOCAL_RANK"])
    torch.cuda.set_device(local_rank)
    return local_rank

local_rank = setup()
model = build_vla().cuda()
model = DDP(model, device_ids=[local_rank], find_unused_parameters=True)

# 数据要用 DistributedSampler，否则 8 张卡会看到同一批数据
sampler = torch.utils.data.DistributedSampler(dataset, shuffle=True)
loader = torch.utils.data.DataLoader(dataset, batch_size=4, sampler=sampler)

for epoch in range(epochs):
    sampler.set_epoch(epoch)      # 别忘了这行，否则每个 epoch 的 shuffle 完全一样
    for batch in loader:
        loss = model(batch)
        loss.backward()
        optimizer.step(); optimizer.zero_grad()
```

三个必踩的坑：`DistributedSampler` 忘了加 → 8 卡退化成 1 卡的效果；`sampler.set_epoch()` 忘了调 → 每个 epoch 数据顺序相同；`find_unused_parameters` 没开 → VLA 里视觉塔或动作头某些分支不参与损失时会直接报 DDP 错误。

## FSDP 还是 DeepSpeed

两者都能做 ZeRO 等价的事，选择主要看团队：

- **PyTorch 原生项目 → FSDP**。不用引第三方依赖，和 torch 生态（torch.compile、DTensor）配合最好。
- **要成熟的 offload / 混合精度策略、要训超大 MoE → DeepSpeed**。它的社区踩坑记录更多，配置也更细（ZeRO-Offload 能把优化器状态卸到 CPU 内存）。

对 7B 及以下的 VLA 模型，FSDP 通常就够，配置也更短：

```python
from torch.distributed.fsdp import FullyShardedDataParallel as FSDP
from torch.distributed.fsdp import ShardingStrategy, MixedPrecision

mp = MixedPrecision(param_dtype=torch.bfloat16, reduce_dtype=torch.float32,
                    buffer_dtype=torch.bfloat16)
model = FSDP(model, sharding_strategy=ShardingStrategy.FULL_SHARD,  # 等价于 ZeRO-3
             mixed_precision=mp, device_id=local_rank)
```

注意 `reduce_dtype=float32`：虽然参数用 bf16 存，但梯度归约要保留 fp32，否则小 batch 长序列训练时会出现loss 不下降却查不出原因的问题。
'''

ADD['模型量化与压缩'] = r'''
## 量化的数学：把浮点映射成整数

量化的本质是一个仿射映射，把浮点区间 $[r_{\min}, r_{\max}]$ 映射到整数区间 $[-2^{b-1}, 2^{b-1}-1]$：

$$q = \text{round}\left(\frac{r}{s}\right) + z, \quad s = \frac{r_{\max} - r_{\min}}{2^b - 1}, \quad z = \text{round}\left(-\frac{r_{\min}}{s}\right)$$

反量化时 $r \approx s(q - z)$。这里有两个自由度决定了量化损失的大小：

- **是否对称**：$z=0$ 是对称量化（区间关于 0 对称），计算快但需要截断单边；$z \neq 0$ 是非对称量化，能利用整个整数范围，精度更好但多一次加法。权重量化通常用对称（权重分布本来就近零对称），激活量化常用非对称（ReLU 之后全是正数）。
- **粒度**：per-tensor（整层一个 $s$）最省但最糙；per-channel（每个输出通道一个 $s$）精度显著更好，是权重量化的事实标准；per-token 用在激活上。

## PTQ 还是 QAT

| | PTQ（训练后量化） | QAT（量化感知训练） |
|---|---|---|
| 需要数据 | 几百条校准样本 | 完整训练集 |
| 耗时 | 分钟级 | 完整微调流程 |
| 精度损失 | INT8 通常 <1% | 可做到接近无损 |
| INT4 表现 | 损失明显 | 仍可接受 |

**结论：先上 PTQ，只有精度卡死时才上 QAT。** 大部分 VLA 部署场景 INT8 PTQ 就够，省下的时间是实打实的。

## VLA 的分层精度策略（重要）

这是具身模型和纯 LLM 量化最大的区别：**VLA 的不同模块对量化的敏感度差了一个数量级**。统一用 INT8 会明显掉点，正确做法是分层配精度：

| 模块 | 建议精度 | 原因 |
|---|---|---|
| 视觉编码器（ViT） | INT8，且保留 per-channel | 对量化最敏感，图像特征的小扰动会被放大成错误的抓取点；实在要压就上 INT8 而非 INT4 |
| 语言主干 | INT8，激进场景 INT4 + AWQ | 容忍度比视觉塔高 |
| 动作头 | **FP16 保留，不要量化** | 输出维度只有 7-14 维，量化省不了几 KB，但引入的抖动会直接变成可见的轨迹颤动 |
| KV Cache | INT8 或 FP8 | 显存大头，量化收益明显 |

一句话记忆：**感知宁可多花显存，动作头一分不省**。

## 可运行代码

```python
import torch
from transformers import AutoModelForCausalLM, BitsAndBytesConfig

# 4-bit 加载做推理/微调基座（QLoRA 的基础）
bnb = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",          # NF4 比纯 fp4 对正态分布权重更友好
    bnb_4bit_use_double_quant=True,     # 对量化常数再做一次量化，再省约 0.4 bit/参数
    bnb_4bit_compute_dtype=torch.bfloat16,
)
model = AutoModelForCausalLM.from_pretrained("your/vla", quantization_config=bnb,
                                             device_map="auto")
print(model.get_memory_footprint() / 1e9, "GB")
```

要做真正的部署量化（导出成 TensorRT / ONNX 的 INT8 引擎），走 PTQ 校准：

```python
import torch
from torch.ao.quantization import get_default_qconfig_mapping, prepare, convert

model.eval()
qconfig_mapping = get_default_qconfig_mapping("x86")   # 服务端用 x86，Jetson 用 fbgemm/qnn
example = torch.randn(1, 3, 224, 224)
prepared = torch.ao.quantization.quantize_fx.prepare_fx(model, qconfig_mapping, (example,))

# 用几百条真实观测做校准，这一步决定 r_min/r_max 定得好不好
for batch in calib_loader:
    prepared(batch)
quantized = torch.ao.quantization.quantize_fx.convert_fx(prepared)
```

## 校准集的讲究

PTQ 的效果几乎完全取决于校准集。三条经验：

1. **必须用真实分布的数据**，不能用随机数。用随机数校准出来的 $r_{\max}$ 会离谱，量化后模型直接变傻。
2. **几百条就够**，1000 条以上收益饱和。
3. **要覆盖失败工况**：不只喂成功任务的图像，还要有遮挡、反光、暗光这些边界情况，否则这些场景下的激活会溢出被截断。

## 量化之外：结构化剪枝与蒸馏

如果 INT8 还塞不下，下一步通常是蒸馏而不是继续压精度——把大模型的能力蒸到一个 1-2B 的小模型上，再对小模型做 INT8，总体收益远好于把大模型压到 INT4。具体做法见跳转入口里的蒸馏章节。
'''

ADD['K8s'] = r'''
## 机器人团队为什么也需要 CI/CD

一个常见误解是：CI/CD 是 Web 团队的专利，机器人团队靠人工调试就行。但只要你同时满足下面两条里的任意一条，就必须有 CI：

- **多于一个人改同一份代码**（哪怕是改 ROS 节点或模型配置）；
- **代码要跑在真机上，而真机时间宝贵**。

真机调试一小时的成本，远高于让 CI 跑一小时仿真。核心思路是把真机时间留给「只有真机才能验证的事」（接触力学、真实传感器噪声、本体个体差异），把所有能在仿真里验证的事全部前移到 CI。

## 容器化的三个实际收益

1. **环境可复现**。ROS2 + CUDA + PyTorch + 自定义驱动的版本组合极难手工复现，Dockerfile 写一次，团队所有人拿到的是同一份环境。
2. **开发机与本体解耦**。开发机装 Ubuntu 22.04 + ROS2 Humble，本体上可能是 20.04 + Foxy，容器把这套差异隔离掉。
3. **回滚就是换镜像 tag**。出问题时 `docker run` 换回上一个 tag，比现场卸载重装快一个数量级。

## 分层 Dockerfile：改一行代码不要重下 2 GB 依赖

```dockerfile
# 第一层：系统依赖，几乎不变
FROM ros:humble-ros-base AS sysdeps
RUN apt-get update && apt-get install -y --no-install-recommends \
    ros-humble-moveit ros-humble-realtime-tools python3-pip \
    && rm -rf /var/lib/apt/lists/*

# 第二层：Python 依赖，按周变
FROM sysdeps AS pydeps
COPY requirements.txt /tmp/
RUN pip3 install --no-cache-dir -r /tmp/requirements.txt

# 第三层：业务代码，天天变（放在最后，命中缓存）
FROM pydeps AS app
WORKDIR /ws
COPY src/ /ws/src/
RUN cd /ws && colcon build --symlink-install
CMD ["bash", "-c", "source /ws/install/setup.bash && ros2 launch bringup robot.launch.py"]
```

关键是把**变化频率最低的层放最前面**。反过来写（先 COPY 代码再装依赖）的话，你改一行 Python 就会触发整条依赖重装，一次 CI 从 2 分钟变成 20 分钟。

## 把仿真回归测试塞进 CI

这是具身项目 CI 最有价值的部分。思路是：准备 10-20 个有确定判据的仿真任务（导航到点是否到达、抓取是否成功、插拔是否入孔），每次 PR 都跑一遍：

```yaml
# .github/workflows/sim-regression.yml
name: sim-regression
on: [pull_request]
jobs:
  regression:
    runs-on: ubuntu-latest
    container:
      image: ghcr.io/your-org/embodied-sim:humble
    steps:
      - uses: actions/checkout@v4
      - name: Build
        run: cd /ws && colcon build --symlink-install
      - name: Run sim suite (headless)
        run: |
          source /ws/install/setup.bash
          python3 -m pytest tests/sim -q --junitxml=report.xml
        env:
          MUJOCO_GL: egl          # 无头渲染，CI 机器没有显示器
      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: sim-report
          path: report.xml
```

三个要点：

- **`MUJOCO_GL=egl`**（或 osmesa）是无头渲染的关键，不加这行所有渲染类测试都会挂。
- **判据必须是确定性的数值**，不能只打印「看起来没问题」。例如 `assert final_dist_to_goal < 0.05`。
- **允许 flaky 但要有标记**：接触仿真本身有数值随机性，对偶发失败的用例打 `@pytest.mark.flaky(reruns=3)`，同时记录失败率，别直接删掉——它往往在提示物理参数有问题。

## K8s 到底要不要上

对多数机器人团队，**答案是不要上**。K8s 解决的是「大量无状态服务的编排与弹性伸缩」，而机器人系统是有状态的、节点数是个位数、延迟敏感。上一套 K8s 的运维成本远超收益。

真正需要 K8s 的只有一种场景：**你要同时调度几十上百个仿真实例做大规模数据生成/强化学习**。这时候用 K8s Job 或者更轻量的 Ray / Slurm 来批量起仿真容器才划算。真机侧用 docker compose + systemd 就够了。

## 最小可用的部署配置

```yaml
# docker-compose.yml —— 真机侧这套就够用
services:
  perception:
    image: registry.internal/vla-perception:v1.4.2
    runtime: nvidia
    network_mode: host          # ROS2 DDS 多播需要 host 网络
    restart: unless-stopped
    environment:
      - ROS_DOMAIN_ID=42
  control:
    image: registry.internal/arm-control:v1.4.2
    network_mode: host
    restart: unless-stopped
    devices:
      - /dev/ttyUSB0:/dev/ttyUSB0   # 串口直连本体
    environment:
      - ROS_DOMAIN_ID=42
```

`network_mode: host` 是 ROS2 部署的高频坑：默认的 bridge 网络会挡住 DDS 的多播发现，表现为「容器起来了但互相看不见节点」。
'''

ADD['云边端协同'] = r'''
## 三层各自该干什么

云、边、端的划分不是按「算力大小」，而是按**任务的时间常数**：

| 层级 | 时间常数 | 适合承担 | 不适合承担 |
|---|---|---|---|
| 云端 | 分钟-天 | 大模型训练、跨机队数据聚合、任务级规划、长期记忆 | 任何实时回路 |
| 边缘（工控机/边缘服务器） | 10-100 ms | 感知推理、动作块生成、局部地图、多机协调 | 长周期学习 |
| 本体端（MCU/实时核） | 1-10 ms | 关节伺服、力控回路、安全急停、传感器同步 | 任何非确定性计算 |

判据很清晰：**延迟要求低于 100 ms 的不能上云，低于 10 ms 的不能出本体**。反过来，不需要实时性又吃算力的（训练、重规划、检索）就该全部上云，不要占用边缘的宝贵算力。

## 任务切分的一个实操判据

面对一个具体功能不知道放哪层时，问自己两个问题：

1. **这个计算如果卡了 500 ms，机器人会出事吗？** 会 → 不能上云。
2. **这个计算的结果能被复用多久？** 几分钟以上 → 上云做，缓存到边缘。

举例：

- 「理解用户说的『把桌上的蓝色杯子放到收纳盒里』」→ 需要大模型，卡了也不会让机器人摔倒，**上云**，结果缓存下来。
- 「根据当前深度图决定夹爪往哪伸」→ 卡 100 ms 就抓偏，**边缘**。
- 「读取力矩传感器并做阻抗控制」→ 卡 1 ms 就振荡，**本体端**。

## 断网时怎么办

这是云边协同设计里最容易被漏掉的一条。**必须假设网络随时会断**，并且定义清楚断网后的降级行为：

- **云端不可达**：边缘用最后一次缓存的规划继续执行已分解好的子任务；子任务执行完还没恢复，就进入安全待机而不是乱动。
- **边缘不可达**（边缘宕机）：本体端的实时核必须能独立执行安全停机，不能依赖上层发指令。
- **恢复后的状态同步**：重连后要有明确的状态机，决定是「继续未完成的子任务」还是「重新规划」。最安全的默认策略是**重新规划**——环境在断网期间很可能已经变了。

```python
class CloudLink:
    def __init__(self, timeout_s=1.5):
        self.timeout_s = timeout_s
        self.cache = {}

    def plan(self, instruction, observation):
        try:
            result = self._call_cloud(instruction, observation)
            self.cache[instruction] = result      # 缓存，断网时兜底
            return result, "cloud"
        except Exception as e:
            if instruction in self.cache:
                return self.cache[instruction], "cache"   # 降级：用缓存规划
            return self._local_fallback(observation), "local"   # 再降级：本地保守策略

    def _local_fallback(self, obs):
        # 本地兜底只做「安全」的事：停在当前位姿待机
        return {"action": "hold", "reason": "cloud_unreachable"}
```

注意降级顺序是**云 → 缓存 → 安全待机**，不要设计成「降级到本地小模型硬撑」。后者在真实工况下容易造成半吊子的失败动作，比老老实实停下来更危险。

## OTA 升级：灰度与回滚

机器人 OTA 和普通 App 升级最大的区别是**升级失败的物理代价**——一台升级失败的机器人可能会做出危险动作。所以流程上必须有三道保险：

1. **灰度分批**：先 1 台 → 5 台 → 20% → 全量，每批之间留观察窗口（至少跑完一轮完整任务）。
2. **双分区 A/B**：新版本写入备用分区，启动失败自动回退到原分区，永远保留一个可用的系统。
3. **健康检查门**：升级后自动跑一组自检（关节回零、传感器读数范围、急停按钮有效性），任一不过就自动回滚。

```bash
# A/B 分区升级的典型流程
ota_ctl stage --image v1.5.0.tar --slot B      # 写入备用分区 B
ota_ctl verify --slot B                        # 校验签名 + 完整性
ota_ctl boot --slot B --trial                  # 试运行，标记为 trial
# 设备重启进入 B，跑自检；自检通过则：
ota_ctl commit --slot B                        # 永久切到 B
# 若自检失败或 trial 超时未 commit，下次重启自动回到 A
```

## 版本兼容：模型和控制程序要一起管

具身系统有个额外的复杂度：**模型权重和控制程序是耦合的**。换了动作头的输出定义（比如从 7 维关节角改成 6 维末端位姿），旧的模型权重就完全不能用了。所以 OTA 的制品不能只管代码，必须把「代码版本 + 模型版本 + 配置版本」打成一个原子包，一起升级、一起回滚。包里要写清兼容矩阵，升级前先校验。
'''

d = json.load(open(D, encoding='utf-8'))
MARK = '## 跳转入口'
n = 0
for s in d['sections']:
    st = s.get('shortTitle') or ''
    if len(s.get('content', '')) >= 3000:
        continue
    for key, add in ADD.items():
        if key in st:
            c = s['content']
            i = c.find(MARK)
            c = c + '\n' + add if i < 0 else c[:i] + add + '\n' + c[i:]
            s['content'] = c
            s['chars'] = len(c)
            s['lastUpdated'] = TS
            s['estimatedMinutes'] = max(s.get('estimatedMinutes') or 0, 14)
            n += 1
            print('[填空] %-18s -> %d 字' % (st, len(c)))
            break
d['lastUpdated'] = TS
json.dump(d, open(D, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('填空节数 =', n)
