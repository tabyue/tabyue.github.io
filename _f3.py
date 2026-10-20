# -*- coding: utf-8 -*-
import json, sys, os
sys.stdout.reconfigure(encoding='utf-8')
TS = '2026-10-20T10:20'
D = 'data/learn/ai-infra.json'

ADD = {}

ADD['数据集格式标准'] = r'''
## 为什么具身数据的格式统一这么难

图像数据集可以约定「一个文件夹一类图」，因为样本之间彼此独立。具身数据不行：一条样本是**一段时间上的多模态流**——RGB-D 图像、关节角、末端位姿、力矩、夹爪状态、语言指令，而且它们的采样率还不一样（相机 30 Hz，关节编码器 500 Hz，力矩 1000 Hz）。所以所谓「格式标准」，本质上要解决四件事：

1. **时间对齐**：不同频率的信号怎么落到同一条时间轴上。通常做法是选定观测帧为主轴，高频信号做降采样或滑窗聚合（取均值/末值）。
2. **语义切分**：哪一段属于哪个子任务，成功与失败的分界在哪。没有这个标注，数据就只能整条用，做不了失败归因。
3. **本体无关性**：同一条数据换一台机器人还能不能用（关节从 7 自由度变 6 自由度怎么办）。
4. **可流式读取**：数据集动辄数 TB，不能要求先下载完再训练，必须支持边下边训。

前两点决定训练代码怎么写，后两点决定数据能不能跨团队复用。LeRobot、RLDS、Open-X-Embodiment 三家的分歧，几乎全在后两点上。

## 三种格式的结构对比

| 维度 | LeRobot | RLDS | Open-X-Embodiment |
|---|---|---|---|
| 推动方 | Hugging Face | Google DeepMind | Stanford + Google |
| 底层存储 | Parquet + MP4 | TFRecord（TFDS 体系） | 基于 RLDS 的再封装 |
| episode 组织 | 一个 episode 一个分片 | TFDS 的 episode steps | 统一 20+ 种本体的 RLDS |
| 图像编码 | MP4 / H.264 视频 | 原始字节序列 | 同 RLDS |
| 上手成本 | 低（pip 装完即用） | 中（要进 TF 生态） | 高（要理解归一化约定） |
| 当前定位 | 日常工具 | 稳定维护 | 作为数据集发布规范 |

## 选型决策

- **新项目起步 → LeRobot**。它把「录数据 → 训练 → 回放」做成一条命令链，社区预训练权重也最多，遇到问题最容易搜到答案。
- **已经在 TFDS 体系里重度投入 → RLDS**。硬迁 LeRobot 的收益抵不上重写数据管道的代价，继续用即可。
- **要做跨本体预训练/迁移 → 用 OXE 的语义约定，但存储仍建议 LeRobot**。OXE 最有价值的不是文件结构，而是它规定了「夹爪开合统一归一到 0-1」「末端位姿统一表达在基座坐标系」「动作统一为末端增量而非绝对关节角」这类约定。把这套约定照搬进自己的 LeRobot 数据集，比强行套它的文件结构划算得多。

## 最小可运行：先用假数据打通管道

下面这段代码不依赖真机，直接用随机数据生成一个合法数据集，用来验证你的训练侧能读通。**先用假数据打通管道，再接真机**，能省掉大半调试时间：

```python
import numpy as np
from lerobot.common.datasets.lerobot_dataset import LeRobotDataset

features = {
    "observation.image": {"dtype": "video", "shape": (3, 224, 224), "names": ["c", "h", "w"]},
    "observation.state": {"dtype": "float32", "shape": (7,),
                          "names": ["j0","j1","j2","j3","j4","j5","gripper"]},
    "action": {"dtype": "float32", "shape": (7,),
               "names": ["j0","j1","j2","j3","j4","j5","gripper"]},
}

ds = LeRobotDataset.create(repo_id="debug/debug", fps=30, root="data/debug", features=features)
T = 60
img = np.random.randint(0, 255, (T, 224, 224, 3), dtype=np.uint8)
state = np.random.randn(T, 7).astype(np.float32)

for t in range(T):
    ds.add_frame({
        "observation.image": img[t],
        "observation.state": state[t],
        "action": state[t],
        "task": "pick up the cup",
    })
ds.save_episode()
print(ds[0]["observation.state"].shape)   # 应该打出 (7,)
```

跑通之后，把 `add_frame` 里的随机数替换成真机读数即可，其余代码不用动。

## 三个高频坑

- **帧率不一致**：相机 30 Hz、关节 500 Hz，落库前必须对齐到同一时间轴。忘了对齐，训练出来的动作会「慢半拍」，表现为机器人总是追不上目标。
- **夹爪单位不统一**：有的本体夹爪是 0-255，有的是 0-1，有的是行程毫米。落库前统一归一到 0-1，并在 feature 的 names 里写清楚，否则跨本体训练时模型会学到一个量纲错乱的动作头。
- **视频压缩吃掉细节**：LeRobot 默认用 H.264 压视频，软性材质形变、高光反射、细小文字这类信息会被压掉。做精密插拔、读标签这类任务时，建议关掉视频压缩或把码率调高。

'''

ADD['可观测性'] = r'''
## 具身系统要观测的东西和 Web 服务不一样

Web 后端的三件套是 metrics / logs / traces，具身系统同样要，但**关注的具体指标完全不同**。Web 关心 QPS 和 p99 延迟，机器人关心的是「这一轮任务到底哪一环掉了链子」。一套能用的具身可观测性至少要覆盖这四层：

| 层级 | 关键指标 | 掉了会怎样 |
|---|---|---|
| 感知层 | 相机丢帧率、时间戳抖动、点云有效点数 | 模型看到的是上一秒的世界，动作永远慢半拍 |
| 推理层 | 单次推理耗时 p50/p95/p99、动作块生成间隔 | 控制频率掉到 10 Hz 以下，轨迹开始抖 |
| 执行层 | 指令下发到本体确认的往返延迟、跟踪误差 | 规划得再好，执行跟不上也是白搭 |
| 任务层 | episode 成功率、子任务耗时分布、失败原因标签 | 只知道「失败了」，不知道为什么失败 |

**任务层指标是最容易被漏掉、但价值最高的**。每一条 episode 结束时都要落一条结构化记录：任务名、成功与否、耗时、失败阶段标签（抓取滑脱 / 放置偏移 / 规划失败 / 超时）。没有这个标签，你手上就只有一条不断波动的成功率曲线，无从下手优化。

## 延迟要拆开埋点，不要只记一个总数

新手最容易犯的错是只记「从收图到发出动作」这一个总耗时。这个数字涨了，你不知道是模型变慢了还是通信变慢了。正确做法是分段打点：

```python
import time, logging

log = logging.getLogger("embodied")

class EpisodeTracer:
    def __init__(self, episode_id):
        self.id = episode_id
        self.t0 = time.perf_counter()
        self.marks = []

    def mark(self, name):
        self.marks.append((name, (time.perf_counter() - self.t0) * 1000))

    def close(self, success, fail_stage=None):
        total = (time.perf_counter() - self.t0) * 1000
        prev = 0.0
        segs = []
        for name, t in self.marks:
            segs.append(f"{name}={t - prev:.1f}ms")
            prev = t
        log.info("episode=%s success=%s total=%.1fms %s stage=%s",
                 self.id, success, total, " ".join(segs), fail_stage)

# 用法
tr = EpisodeTracer("ep-0042")
# ... 收图
tr.mark("capture")
# ... 前处理
tr.mark("preprocess")
# ... 模型推理
tr.mark("inference")
# ... 动作后处理 + 下发
tr.mark("dispatch")
tr.close(success=False, fail_stage="grasp_slip")
```

日志里出现 `inference=180.0ms` 而其它段都是个位数，问题就明确定位在模型；反过来如果 `dispatch` 段异常地长，那瓶颈在通信或本体固件，优化模型一点用没有。

## 用 OpenTelemetry 把链路串起来

单机调试用上面的 logger 就够了，但真实系统里感知、推理、执行往往跑在不同进程甚至不同机器上，需要 trace id 把它们串起来。最小接入只需要三步：

```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter

trace.set_tracer_provider(TracerProvider())
trace.get_tracer_provider().add_span_processor(
    BatchSpanProcessor(ConsoleSpanExporter())
)
tracer = trace.get_tracer(__name__)

with tracer.start_as_current_span("control_step") as span:
    span.set_attribute("robot_id", "arm-01")
    span.set_attribute("fps_target", 30)
    # ... 一个控制周期的全部工作
```

接上 Jaeger 或 Grafana Tempo 之后，一次失败的抓取可以回溯出「哪一帧的图像时间戳异常 → 推理线程被抢占 → 动作块延迟 200 ms 下发」，这类跨进程的因果链靠单进程日志是看不出来的。

## 怎么判断可观测性做到位了

给自己提三个问题，答不上来就说明还没做够：

1. 成功率从 62% 掉到 48%，能不能在 10 分钟内说出是哪一类失败变多了？
2. 线上偶发的轨迹抖动，能不能拿到抖动发生前 2 秒的完整传感器时序？
3. 换了一版模型权重，能不能对比出新旧两版在同一批任务上的分段耗时差异？
'''

ADD['LoRA 与 PEFT'] = r'''
## LoRA 到底改了什么

全参数微调要更新整个权重矩阵 $W \in \mathbb{R}^{d \times k}$，对 7B 模型来说就是 70 亿个可训练参数，优化器状态（Adam 的一阶二阶动量）再乘 2，显存直接翻三倍。LoRA 的做法是**冻住 $W$ 不动，只在旁边挂一个低秩增量**：

$$W' = W + \Delta W = W + B A, \quad A \in \mathbb{R}^{r \times k},\; B \in \mathbb{R}^{d \times r}$$

其中 $r \ll \min(d, k)$。前向传播时 $h = W' x = Wx + B(Ax)$，训练只更新 $A$ 和 $B$。以 $d=k=4096$、$r=16$ 为例，可训练参数从 1677 万降到 13 万，约 0.8%。

实现上还有两个关键细节：

- **缩放系数** $\frac{\alpha}{r}$。增量前面会乘一个缩放，$\alpha$ 通常固定为 16 或 32。这意味着**调 $r$ 的时候要同步看 $\alpha$**，否则有效学习率会变。
- **初始化**：$A$ 用高斯随机初始化，$B$ 初始化为全零。这样训练开始时 $\Delta W = 0$，模型行为与原模型完全一致，不会一上来就被打乱。

## rank 怎么选

| rank | 可训练参数占比 | 适用场景 |
|---|---|---|
| 4-8 | ~0.2% | 风格/格式迁移这类浅层适配 |
| 16 | ~0.8% | **工业界默认起点**，多数下游任务够用 |
| 32-64 | 1.5%-3% | 任务与原模型预训练分布差异大（如从通用对话迁到力控插拔） |
| 128+ | >6% | 这时候应该考虑直接全参微调，LoRA 不再省资源 |

实践建议：**从 r=16 起步，看验证集损失；如果欠拟合就翻倍到 32、64**。不要一上来就开 128，那是把 LoRA 当全参微调用，白付了额外的前向开销。

## target_modules 比 rank 更影响效果

很多人只调 rank，忽略了「往哪些矩阵里注入 LoRA」这件事，而后者的边际收益往往更大。Transformer 一个注意力层有 $W_q, W_k, W_v, W_o$ 四个矩阵，MLP 里还有 $W_{gate}, W_{up}, W_{down}$。经验：

- **最小可用**：只注 $W_q, W_v$。这是最早的 LoRA 论文配置，能跑但上限低。
- **推荐默认**：$W_q, W_k, W_v, W_o$ 四个全注。成本增加不多，效果明显更好。
- **任务难度大时**：再把 MLP 的 $W_{up}, W_{down}$ 加上。具身场景里如果涉及新的动作空间或新的传感器模态，通常要到这里。

## VLA 微调的特殊之处

VLA 模型比纯 LLM 多一个**动作头（action head）**，微调时有个容易踩的分歧：

- 动作头通常是随机初始化的（预训练时没有），所以**动作头必须全参数训练**，不能套 LoRA。LoRA 只加在视觉编码器和语言主干上。
- 视觉编码器对 LoRA 的敏感度低于语言主干。如果显存紧张，优先保住语言主干的 rank，视觉侧可以降到 8。
- 动作头输出的是连续值且维度低（7-14 维），**不要用 FP16 存它的梯度**，抖动会被放大成可见的轨迹颤动。

## 可运行代码

```python
import torch
from peft import LoraConfig, get_peft_model
from transformers import AutoModelForCausalLM

model = AutoModelForCausalLM.from_pretrained("your/vla-backbone", torch_dtype=torch.bfloat16)

lora_cfg = LoraConfig(
    r=16,
    lora_alpha=32,
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM",
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
)
model = get_peft_model(model, lora_cfg)

trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
total = sum(p.numel() for p in model.parameters())
print(f"可训练参数 {trainable/1e6:.2f}M / 总参数 {total/1e9:.2f}B = {100*trainable/total:.3f}%")

# 动作头要单独放开
for n, p in model.named_parameters():
    if "action_head" in n:
        p.requires_grad = True
```

## 合并与部署

训练完如果只是自己用，可以直接存 adapter（几十 MB，便于版本管理）；要上生产建议**合并回原权重**，避免推理时额外的矩阵乘开销：

```python
merged = model.merge_and_unload()          # 得到与原始结构完全一致的模型
merged.save_pretrained("vla-merged")
```

合并后的模型和普通模型没有任何区别，可以直接走你原有的量化、导出、部署流程。
'''

ADD['数据闭环与主动学习'] = r'''
## 闭环不是「多采点数据」，是「采对数据」

很多团队的理解是：模型不行 → 多采数据 → 再训。这条路的效率极低，因为机器人数据的采集成本是图像数据的几百倍（要人操作真机、要场景复现、要标注结果）。主动学习解决的是同一个问题的另一面：**在给定的采集预算下，挑出信息量最大的那部分数据**。

一个完整的数据闭环有四个环节，缺任何一环都转不起来：

1. **部署与采集**：模型上线跑任务，自动记录成功/失败以及完整传感器流。
2. **挖掘**：从海量数据里挑出「值得标注/值得重训」的样本。
3. **标注与回流**：给这些样本打标签，并入训练集。
4. **重训与验证**：重新训练，在固定的评测集上对比，确认真的变好了再上线。

第 2 步是主动学习的主战场，第 4 步是最常被跳过的一步——跳过它，你就无法判断这轮闭环到底是正收益还是负收益。

## 三种采样策略

| 策略 | 做法 | 优点 | 缺点 |
|---|---|---|---|
| 不确定性采样 | 挑模型预测熵最大的样本 | 简单，对分类任务有效 | 具身动作是连续值，不好直接算熵 |
| 委员会投票 | 训多个模型，挑分歧最大的样本 | 对回归任务也有效 | 训练成本乘 N |
| 核心集（coreset） | 挑能让训练集覆盖特征空间最广的样本 | 不容易被离群点带偏 | 计算距离开销大 |

具身场景里最实用的其实是第四种，也是工程上最朴素的一种：**失败优先采样**。

## 为什么「失败优先」在具身场景特别有效

图像分类里，模型不确定的样本往往在决策边界附近，标注它收益最高。但机器人任务的失败分布是**长尾且聚集**的：80% 的失败集中在 2-3 个具体环节（比如「夹爪碰到杯子边缘时滑脱」「放到桌面时高度估计偏高 5 mm」）。这些样本模型往往还挺「自信」——它 confidently 做了一个错误的动作。

所以按模型不确定性挑，反而会挑到一堆罕见姿态的样本，而漏掉真正高频的失败模式。正确做法是**按实测失败标签采样**，再按失败模式分层：

```python
import json
from collections import Counter

def select_for_retrain(episodes, budget=200):
    # 只看失败样本
    fails = [e for e in episodes if not e["success"]]
    # 按失败阶段分层
    by_stage = {}
    for e in fails:
        by_stage.setdefault(e["fail_stage"], []).append(e)

    print("失败模式分布:")
    for stage, group in sorted(by_stage.items(), key=lambda kv: -len(kv[1])):
        print(f"  {stage:20s} {len(group):4d} 条  {100*len(group)/len(fails):.1f}%")

    # 按各模式占比分配预算，但给每个模式保底 10 条，防止长尾模式永远采不到
    picked = []
    n_stage = len(by_stage)
    for stage, group in by_stage.items():
        quota = max(10, int(budget * len(group) / len(fails)))
        # 组内优先选耗时短的：短失败通常原因更单纯，标注起来也快
        group.sort(key=lambda e: e["duration_s"])
        picked.extend(group[:quota])

    return picked[:budget]

episodes = json.load(open("logs/episodes.json"))
picked = select_for_retrain(episodes, budget=200)
print(f"选中 {len(picked)} 条重训样本")
```

## 别忘了保留一份固定的评测集

这是数据闭环里最容易被忽略、代价最大的坑。如果重训后你在「新采的那批数据」上评测，几乎一定会看到指标上升——因为模型刚见过它们。必须在闭环建立的第一天就**冻结一份评测集**（比如 50 个固定初始条件的任务），之后每轮重训只在它上面比。

评测集要满足两点：

- **初始条件可复现**：物体摆放位姿、光照、起始关节角全部记录成配置，真机上用同样的配置复位。
- **覆盖各失败模式**：不能全是简单样本，否则很快饱和到 100%，失去区分度。

## 闭环节奏

一周一轮是常见节奏，再快会让评测集过拟合，再慢则迭代次数不够。每轮闭环结束时应该能回答三个问题：本轮新增多少样本？评测集成功率变化多少？哪个失败模式的占比下降了多少？答不出第三个，说明你的失败标签体系还没建起来，这才是当下最该补的东西。
'''

d = json.load(open(D, encoding='utf-8'))
MARK = '## 跳转入口'
n = 0
for s in d['sections']:
    st = s.get('shortTitle') or ''
    for key, add in ADD.items():
        if key in st and len(s.get('content', '')) < 3000 and key not in s.get('_filled', ''):
            c = s['content']
            i = c.find(MARK)
            if i < 0:
                c = c + '\n' + add
            else:
                c = c[:i] + add + '\n' + c[i:]
            s['content'] = c
            s['chars'] = len(c)
            s['lastUpdated'] = TS
            s['estimatedMinutes'] = max(s.get('estimatedMinutes') or 0, 14)
            n += 1
            print('[填空] %-16s %d -> %d 字' % (st, len(c) - len(add), len(c)))
            break
d['lastUpdated'] = TS
json.dump(d, open(D, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('填空节数 =', n)
