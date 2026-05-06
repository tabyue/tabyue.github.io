# Automation-5 Memory: 具身智能门户每6小时更新

> ⚠️ **强制规则（2026-05-06 起）**：每次修改 `data/learn/<mod>.json`（追加/修改 sections）后，**必须** 在提交前运行 `python tools/sync_learn_split.py` 同步生成 `data/learn-split/<mod>/{_index.json, sec-NN.json}`。前端走 B 方案按需加载——若不同步，用户看到的章节内容会停在旧版本。脚本是幂等的，无变化时不会改任何文件。

## 2026-05-06T20:45 执行记录

**更新概要：**
- 投稿箱：无新投稿（gh issue list --state open 返回空数组）
- **接手上轮残留**：上轮 4d35965 commit 后留下 3 个未跑完的临时文件（_apply.cjs / _check.cjs / _new_section.json），其中 _new_section.json 是为 embodied-agent.json 准备的高质量 11K chars section「VLA 长程任务推理范式：从 CoT 到 IVLR、Anticipation 与 Action Reasoning」（联动本站 p113-p116 四篇 5 月 VLA 论文），但因 content 内含 ASCII `"长程任务"` 双引号导致 JSON 解析失败，上轮中断
- **修复 + 合并**：用 Python 脚本 unescape 容错解析→识别 2 处 raw ASCII 双引号→替换为中文引号 `"..."` → 重新生成 _new_section_fixed.json → 跑 _apply2.cjs 合入 → embodied-agent 81K → **91K（11 sec, 9441 chars 增量）**；3 处 lastUpdated 同步：embodied-agent.json 顶层+section + learning-path 中 stage7「具身Agent实战项目」节点
- **重复 id 大修**：发现并修复 7 处 id 冲突：
  - news n218×3 / n219×2 / n220×3（合并冲突遗留：5/6 上轮新增 + 4/30 上上轮新增 + 4/01/4/18 老条目同一 id）
  - papers p115×2 (MolmoAct2 vs RoboWM-Bench)
  - opensource os082×2 (MolmoAct2 vs AGIBOT WORLD 2026)
  - 修复策略：保留 addedDate 最新的占用原 id，老的重命名为 max_id+i (n223-n227, p117, os083)
- 新闻 +2（n221/n222）：临港双展首日 12 家企业签约入驻+具身智能产业联盟启动（中科院软件所+穿山甲机器人等 12 家联合）+ 科创板日报《2026 至今 345 亿融资全景》（资本从整机向零部件/具身大脑/RaaS 三方向扩散，4 月 12 家创业公司停止运营开启淘汰赛）
- 论文 +1（p118）：VILAS 全开源低成本 VLA 平台（arXiv 2605.02037，5/4 上线）—— 单臂 BOM <$1500 + 3D 打印软体末端 + OpenVLA/Pi-0/GR00T 三大开放 VLA 微调脚本 + 70 任务 250 万帧数据集，OpenVLA-7B fine-tune 成功率 81.3% 与 ALOHA（10K USD）持平，推动 \"低成本 VLA 四件套\" 格局
- 开源 +1（os084）：VILAS Platform GitHub 仓库（hardware 类，MIT）
- 招聘 +1（j106）：上海临港具身智能产业联盟联合招聘（12 家入驻企业 + 中科院软件所，5 大方向 100+ 岗位）
- 全数据排序：news/papers/opensource/jobs 按 `addedDate`（fallback `postedDate`/`date`）+ id 数字 secondary key 倒序重排，所有 2026-05-06 条目正确置顶
- 临时清理：12 个本轮 _*.{cjs,py,json} 全部删除
- 数据校验：147 JSON 全部 OK

**当前数据编号水位：** news→n227 (229 条), papers→p118 (107 条), opensource→os084 (77 条), jobs→j106 (106 条)
**Git:** 4d35965→f42a750, pushed to main (7 files +187/-15, 含新建 papers/p118.json)

**踩坑教训：**
- **JSON content 里 ASCII 双引号是头号陷阱**：上轮把 `"长程任务"` 写成 ASCII `"长程任务"`，整个 JSON 文件无法解析。必须用中文引号 `"..."` 或反斜杠转义 `\"...\"`（项目规范早有强调）。修复方式：unescape_lenient 函数容错解析→识别非合法 ASCII 引号位置→配对替换为左/右中文引号
- **排序逻辑里 fallback 字段顺序很关键**：`d = x.get('addedDate') or x.get('date') or ''` 是正确的（短路求值，addedDate 优先）；如果写成 `for f in ['addedDate','date']: d = x.get(f) or d` 会被后面字段覆盖前面字段（papers p102/p103 的 addedDate=2026-04-29 但 date=2026-06，导致它们错误地排到顶部）
- **跨实例 id 冲突自检**：每轮启动应跑一次 `Counter([x['id'] for x in items])` 检查重复，越是合并提交越容易留隐患。本轮发现 5/6 上轮 + 4/30 上上轮 + 更老条目共占用同一 id n218/n219/n220 三组重复，并不是单次合并失误而是多轮叠加
- **memory.md 字段名记错代价大**：之前 memory 写"jobs schema 用 city/postDate/addedDate"，但实际字段是 `postedDate` 不是 `postDate`。新增 j106 前已对照 j105 完整 schema 校核避免再次出错。memory 文件本身的错误也要修

## 2026-05-06T20:16 执行记录

**更新概要：**
- 投稿箱：无新投稿（gh issue list 返回空）
- 工作区接手 5月5日 19:38 实例未提交残留：n210-n217（8 条新闻）、p113-p116（4 篇论文）、os081/os082、j102/j103，伴随 13 个 `_*.{js,cjs,py}` 临时脚本未清理。本轮策略：保留所有合理增量 + 添加自己的 5月1日补量 + 整体排序 + 全量清理 + 一次性 commit
- 新闻 +4（n206-n209）：杭州条例 5/1 施行（全国首部具身智能机器人地方法规）+ NVIDIA Isaac GR00T N1.7 开源 Reasoning VLA + 国家电网《2026 年具身智能发展规划》68 亿采购 + Menlo Asimov v1 开源人形机器人 CAD/BOM 全开放
- 论文 +2（p110/p111）：VLA Datasets, Benchmarks, Data Engines 综述（arXiv 2604.23001，把 VLA 竞争从模型端拉回数据端的纲领性综述）+ Characterizing VLA Models across XPUs（arXiv 2604.24447，5×6 端侧硬件部署决策表）
- 开源 +2（os062/os063）：NVIDIA Isaac GR00T N1.7（Open Reasoning VLA / EA + Hugging Face）+ OpenArm 7-DOF 全开源机械臂（CAD/PCB/固件 + MuJoCo+ROS2 仿真，单臂 < 2000 美元）
- 招聘 +2（j100/j101）：杭州具身智能产业联盟首批落地企业 + 猎聘《2026 机器人领域人才报告》驱动批量岗位（人形赛道职位同比 +215.8%、平均年薪 40.6 万）
- 学习深化 ×2 → **30/30 OK**：
  - `cpp-fundamentals` 79.4K → 86.4K，+1 sec「C++ 端侧 ML 推理：把 VLA 模型塞进机器人本体」(7K chars/9 节)——为何 Python 不行的指标对比 + ONNX Runtime C++ 完整骨架 + INT4/INT8 量化决策 + zero-copy 内存池 + SPSC ring buffer 多流并行 + 6 类 XPU 部署对照表（联动 p111 论文）+ 5 大工程陷阱
  - `computer-vision` 78.5K → 82.3K，+1 sec「VLA 时代的视觉数据引擎：数据配方、跨本体对齐与标注自动化」(3.8K chars/9 节)——四层数据基础设施 + EmbodiedMidtrain 配方公式 + 跨本体结构/表征双对齐 + GPT-4V 自动标注代码 + 数据可追溯矩阵 4 维加权（联动 p110 综述）+ HDF5/WebDataset/LeRobot/RLDS 格式对比
  - **里程碑：30/30 学习模块全部 ≥80K chars 全部达 OK** ✅
- 数据排序：news/papers/opensource/jobs 按 `addedDate`（fallback `postDate`/`date`）+ id 数字 secondary key 倒序重排，最新内容置顶
- jobs schema 修正：之前我加的 j100/j101 用了 `location/postedDate`，被 5月5实例改成正确的 `city/postDate/addedDate/education` schema
- 3 处 lastUpdated 同步：cpp-fundamentals 顶层+sec + computer-vision 顶层+sec + learning-path 对应模块
- 临时清理：13 个 5月5实例残留 + 本轮 12 个全部删除（_q.py 也清掉）
- 数据层校验：125 JSON + papers 子目录全部 OK

**当前数据编号水位：** news→n217（224 条）, papers→p116（106 条）, opensource→os082（76 条）, jobs→j103（103 条）
**Git:** 9beb8e7→（本轮待提交），将 push to main

**踩坑教训：**
- **prompt 注入的 current_time 不可信**：本次启动时 prompt 显示 `Friday, May 1, 2026 05:37`，实际系统时间是 5月6日 20:16，差 5 天。任何写入 lastUpdated 字段前必须 `Get-Date` 确认真实时间
- **prepend 之前先看顶部 id**：本轮启动时基于 memory 文件最新一条（4月30 7:30）以为水位是 n205，prepend 了 n206-n209，结果发现文件顶部已经有 n210-n217（5月5实例添加），需要重新按 addedDate 排序才能保证顺序正确
- **跨实例 schema 一致性**：每个数据数组的字段约定不同。jobs 用 `city/postDate/addedDate/education`，opensource 用 `addedDate`，news 用 `addedDate+date`。新增条目前必读一条已存在条目核对
- **PowerShell 多 python -c 链编码切换**：连续多个 `python -c "..."` 中间会出现 GBK→UTF-8 切换错误。统一改写到 _xxx.py 文件用 `python _xxx.py`
- **删除文件需用 Remove-Item / Force / SilentlyContinue**：PowerShell 的 `del` alias 对带 `-Force` 不识别，必须用全名 `Remove-Item`

## 2026-05-05T13:30 执行记录

**更新概要：**
- 投稿箱：无新投稿（gh issue list 返回空）
- 工作区接手并行实例大量未提交改动 + 85 个临时脚本，本轮策略：合并提交 + 全量临时清理
- 新闻 ×0：Meta-ARI 收购（5/1）已被并行实例先收为 n213，本轮防重逻辑触发
- 论文 +1（p113）：MemoryVLA (ICLR 2026 Spotlight) - 海马体启发的感知-认知双层记忆库 VLA，LIBERO-Long 38%→76%，模块化 LoRA 适配现有 OpenVLA/Pi0/GR00T
- 开源 +1（os081）：MemoryVLA 官方仓库 github.com/shihao1895/MemoryVLA（注：os062-os080 已被并行实例占用，本轮跳号）
- 招聘 +1（j102）：Meta Superintelligence Labs 收购 ARI 后首批公开招聘，USD 250-450K + RSU
- 学习深化 ×2（FAIR→OK，是本轮重头戏）：
  - `data/learn/physics-simulation.json` 77K→116K，+1 sec「GPU 大规模并行仿真：从单环境到 Isaac Lab 4096 并行 PPO 工程实战」(15K chars)——CPU vs GPU 仿真器范式跨越/Isaac Lab 完整 PPO 训练代码骨架/N=1~8192 实测吞吐表/5 大隐藏陷阱（reset 不可批量/numpy 切换/dt 过小/DR 必须批量/sim2real 兜底）/2026-Q2 Isaac Lab vs MJX vs Genesis vs Brax vs Newton 五器对比/100K 并行扩展路径/5 题练习
  - `data/learn/platform-engineering.json` 79K→116K，+1 sec「边缘端推理服务化与机器人 OTA 灰度发布：把策略安全送进 1 万台机器人」(16K chars)——5 层流水线架构图/Model Registry signed manifest YAML/TensorRT INT8 校准实测表 (FP32→INT8 latency 95→14ms 损失 4%) /灰度 5 阶段 PLAN + CanaryController/边缘 Runtime 双策略 hot-swap C++ 代码/Watchdog 五项异常检测/影子模式数据闭环/EU AI Act + 杭州人形机器人条例合规/Tesla/Figure/智元/NVIDIA 行业标杆 OTA 表/6 大踩坑 + 5 题练习
- 3 处 lastUpdated 同步：physics-simulation 顶层+section + learning-path stage4.modules[0]「物理仿真引擎」；platform-engineering 顶层+section + learning-path stage5.modules[2]「MLOps与持续交付」（首次发现 stage5.module0「模型训练与推理优化」≠ platform-engineering，已修正）
- 临时清理：85 个旧脚本（`_*.{js,cjs,py,json}`）+ 本轮新增的 15 个全部删除
- 数据层校验：138/138 JSON 全部格式正确

**当前数据编号水位：** news→n215, papers→p113, opensource→os081, jobs→j102
**Git:** 52bfb89→9beb8e7（43 文件 +1377/-343），pushed to main

**踩坑教训：**
- 并行实例占用了 os062-os080（CLI-Anything 等非 VLA 项目），本轮 os065 失败后改用 max+1=os081，新规：插入新 id 前先 `Math.max(...nums)+1`，不要假设连号
- learning-path 的 module 字段是 `name` 不是 `title`，且第 6 阶段（"系统工程与部署"）的 modules[0] 是「模型训练与推理优化」，modules[2] 才是「MLOps与持续交付」对应 platform-engineering，不要按下标盲改
- PowerShell `node -e "..."` 中的 `||` 运算符会被解析为 token 分隔符（`x.y || z` → `x.y ; z`）。所有调试脚本一律写 `_xxx.js` 文件再 `node _xxx.js`
- web_search 显示 Tab 自己的本地脚本 PowerShell 输出格式，`#< CLIXML` 包装属于正常输出，不影响功能

## 2026-04-29T17:50 执行记录

**更新概要：**
- 投稿箱：无新投稿
- 发现工作区有并行实例（另一个 automation-5，timestamp 标记为 2026-04-30T07:30）完成但**未提交**的大量改动（news +4/papers +2/opensource +1/jobs +2/vla-models +1 sec），本轮策略：**接手未提交改动 + 叠加自己的学习模块深化 + 合并一次性提交**，避免工作区残留。
- 新闻/论文/开源/招聘：**本轮跳过**（并行实例已推进到 n205/p109/os061/j099，避免冲突）
- 学习深化 ×2：
  - `data/learn/sim-to-real.json` +1 sec「领域不变特征学习：让策略"看不见"仿真与真实的差别」(14.4K chars)——DANN/CORAL/对比式三范式对比+GRL数学原理+完整PyTorch DANN视觉策略代码+CORAL实现+Sim-to-Real三方法定量对比表(基线42%→DANN+DR 83%→真实微调89%)+DINOv2基础模型零样本对齐趋势+6道练习题。sim-to-real.json 95K→110K，9 sec
  - `data/learn/world-models-llm.json` +1 sec「自回归视频世界模型：从 VideoGPT 到 V-JEPA 2 与 Cosmos」(12.6K chars)——VideoGPT→MAGVIT→Cosmos-1 技术脉络+LFQ Tokenizer 原理+完整 PyTorch 实现+Cosmos 14B 架构拆解+V-JEPA 2 对比式路线+World Model + MPC 闭环代码+三代对比表+2026 工程化建议+6道练习题。world-models-llm.json 108K→121K，9 sec
- 3处 lastUpdated 同步：sim-to-real.json 顶层 + section + learning-path.json; world-models-llm.json 顶层 + section + learning-path.json
- 清理临时脚本：_newsec.json、_apply.js、_inspect.js、_batchB.json（遗留）
- **合并提交**：本轮 + 并行实例未提交改动统一 commit push

**当前数据编号水位：** news→n205, papers→p109, opensource→os061, jobs→j099
**Git:** 73c4897→（本轮待提交）, pushed to main

**教训：**
- PowerShell 下 `node -e "...&&..."` 里的 `&&` 和 `||` 会被解析为 token 分隔符导致语法错误。应该把脚本写到独立 `_xxx.js` 再 `node _xxx.js`，或在 node 脚本里用 `;`/if 替代逻辑运算符
- 并行实例（两个 automation-5 几乎同时运行）留下 uncommitted 改动时，合并提交 > 放弃改动。判断依据：数据格式正确 + 内容独立于本轮产出 + 有对应的 memory/daily 记录佐证

## 2026-04-30T07:30 执行记录

**更新概要：**
- 投稿箱：无新投稿（gh issue list 返回空数组）
- 新闻 +4（n202-n205）：腾讯 HY-Embodied-0.5-X 开源（Robotics X×混元 MoT-2B 10评测7项端侧第一/电网场景）、星动纪元超2亿美元新一轮+无界动力天使+超2亿（3-4月密集融资兑现）、广东省AI对接大会（自变量WALL-B+华为昇腾+腾讯智能体，深圳/广州/佛山公共训练场）、arXiv GazeVLA（注视意图瓶颈/OOD +22%/数据效率×20）
- 论文 +2（p108-p109）：GazeVLA(2604.22615 VLIA 四阶段跨本体不变量) + EmbodiedMidtrain(2604.20012 VLM→VLA 中训练配方/LIBERO +9%且GQA回退<1%)
- 开源 +1（os061）：HY-Embodied-0.5-X（Tencent-Hunyuan GitHub / 端侧 2B MoT / Jetson Orin 18Hz INT4 量化）
- 招聘 +2（j098-j099）：星动纪元融资后5方向扩招（50-100K×16薪+期权）、无界动力与ZF LIFETEC合作社招
- 学习深化 ×1：`data/learn/vla-models.json` +1 sec「VLA 训练三阶段完整配方」(11.3K chars/10 小节)，把 HY-Embodied/GazeVLA/EmbodiedMidtrain 三个2026-04热点统一到"三阶段范式 vs 传统两阶段"主线，含数据配方表+完整训练代码骨架+ VLIA 四阶段扩展+选型决策树+5 大工程陷阱；vla-models.json 从 98K → 116K，FAIR→OK 水位
- 3处 lastUpdated 同步：learn/vla-models.json 顶层 + 新 section 对象 + learning-path.json 4 个 VLA 相关节点
- 清理临时脚本：_insert.js、_addsec.js、_learnstat.js、_ls.js、_val.js、_dbg.js

**当前数据编号水位：** news→n205, papers→p109, opensource→os061, jobs→j099

**踩坑教训：** 不要在独立 JSON 文件里手写 `\"..\"` 表示中文引用——会被 JSON.parse 当作字符串结束。应改用中文引号 `"..."`（项目规范），或把 content 放 JS 源文件用模板字符串注入。

## 2026-04-30T01:12 执行记录

**更新概要：**
- 投稿箱：无新投稿（gh issue list 返回空）
- 清理遗留：上轮未跟踪的 _batchB.json 已删除
- 新闻 +4（n198-n201）：教育部发布2026本科专业目录新增具身智能专业/9所高校首批获批（北邮/上交/浙大等）、第三届中国具身智能与人形机器人产业大会北京开幕（中关村/千位嘉宾/万亿赛道/十五五）、它石智航4.55亿美元Pre-A融资（高瓴红杉联合领投/刷新中国具身智能单轮纪录/估值180亿）、WholeBodyVLA开源（ICLR 2026/智元Agibot X2/大空间loco-manipulation/端到端闭环）
- 论文 +2（p106-p107）：p106 WholeBodyVLA（OpenDriveLab/统一隐空间动作/loco-manipulation RL精调/任务成功率42%→73%/样本效率3.1倍）、p107 VLA-Forget（ACL 2026 KnowFM/VLA机器学习遗忘首批系统工作/比率感知选择性编辑+层选择性遗忘/量化恢复-55%）
- 开源 +1（os060）：WholeBodyVLA OpenDriveLab官方仓库（github.com/OpenDriveLab/WholebodyVLA）
- 招聘 +1（j097）：它石智航融资后大规模扩招（校招+社招+期权/全身协同/VLA/仿真系统）
- 学习模块深化 ×1：embodied-agent 新增第10个 section「整体式 VLA vs 分层 LLM+Skill：具身智能体架构选型与统一隐空间融合」（11.5K chars）——三条路线精确定义+12维决策表+路线A/B/C数学+代码骨架+融合架构+选型决策树+5大工程陷阱破解+练习题+延伸阅读，联动WholeBodyVLA/VLA-Forget/Libra-VLA/M²-VLA
- 3处 lastUpdated 同步：learn/embodied-agent.json 顶层 + learning-path.json 顶层 + 新 section 对象 + learning-path 中"具身Agent实战项目"模块补 lastUpdated 字段

**当前数据编号水位：** news→n201, papers→p107, opensource→os060, jobs→j097
**Git:** d7d71ea→73c4897, pushed to main

## 2026-04-29T12:00 执行记录

**更新概要：**
- 投稿箱：无新投稿
- 新闻 +4：电网百亿采购引爆资本市场/申昊科技等涨停/工程化交付元年深度分析、Libra-VLA(异步粗细双系统VLA)、M²-VLA(层混合+元技能增强泛化)、CES Asia 2026定位电网级方案首发平台
- 论文 +2：Libra-VLA(arXiv 2604.24921/Coarse-to-Fine Dual-System/认知科学双系统启发)、M²-VLA(arXiv 2604.24182/MoL跨层特征聚合+MSM元技能分解)
- 招聘 +2：电力机器人赛道(申昊科技/亿嘉和/咸亨国际扩招)、苏州具身智能产业集群联合招聘
- 学习模块深化 ×1：桌面机械臂项目新增"力控与柔顺操作：让桌面机械臂学会温柔"section（阻抗控制数学原理+1D仿真擦桌子+力/位混合控制+选择矩阵+桌面臂力感知方案对比+Foca-VLA力控VLA前沿方向）

**当前数据编号水位：** news→n197, papers→p105, opensource→os059, jobs→j096
**Git:** 79403ee→034744c, pushed to main


## 2026-04-29T11:48 执行记录

**更新概要：**
- 投稿箱：无新投稿
- 新闻 +4：第三届中国具身智能产业大会北京开幕(灵心巧手万台量产/全球80%份额)、苏州产业生态大会(十大新产品+十大新场景+12项标准)、China Daily深度报道(Embodied AI quantum leap)、CONNECT 2026硅谷全球峰会(MagicLab人形机器人)
- 论文 +2：Foca-VLA(CVPR 2026/力-位混合控制VLA/接触丰富操作)、MM-ACT(CVPR 2026/统一token空间三模态VLA)
- 招聘 +2：灵心巧手(北京/灵巧手万台量产)、苏州具身智能企业集群(产业大会释放需求)
- 学习模块深化 ×1：深度学习基础新增"Flow Matching：从扩散模型到机器人策略生成的新范式"section（Diffusion vs FM数学对比+条件流匹配损失推导+完整Python实现+π0架构解析+推理效率对比实验+CVPR 2026 Foca-VLA力感知VLA前沿）

**当前数据编号水位：** news→n193, papers→p103, opensource→os059, jobs→j094
**Git:** 7b9f405→79403ee, pushed to main

## 2026-04-28T20:50 执行记录

**更新概要：**
- 投稿箱：无新投稿（gh issue list 返回空数组）
- 发现数据文件已被并行轮次（7a02653）推进至 news→n187, papers→p099, opensource→os058, jobs→j091
- 本轮检测并**修复 7 组 papers 重复**（合并冲突遗留）：p028/p032/p036/p038/p072/p077/p092 全部删除，保留较新编号
- 新闻 +2（n188-n189）：星动纪元超2亿美元融资（顺丰领投/集齐四大产业资本）、国家电网68亿采购8500台具身智能设备（四大场景/百亿市场启动）
- 论文 +2（p100-p101）：Agent-World（人大×字节Seed/1978环境+19822工具/MCP统一接口）、X2-N（智元可变形轮腿人形机器人/双模式运动+灵巧操作）
- 开源 +1（os059）：Agent-World 真实工具环境合成与Agent训练平台
- 招聘 +1（j092）：星动纪元融资后大规模扩招
- 学习模块深化 ×1：mechanical-design 新增"伺服驱动与关节模组"section（61K/13sec）——FOC完整链路/Clarke-Park变换/三环带宽设计/编码器选型/总线协议/关节模组量产/故障诊断/BOM成本
- 清理临时脚本：_topids.js, _dups.js, _dedup.js, _insert.js, _learnstat.js, _ls.js, _addsec.js, _addsec2.js, _sec.json, _batchA.json, _q.py

**当前数据编号水位：** news→n189, papers→p101, opensource→os059, jobs→j092
**Git:** 7a02653→7b9f405, pushed to main

**教训：** JS 字符串中嵌套 ASCII `"..."` 会破坏 JS 语法。写中文内容的 section 应该用「...」书名号或直接把 section 数据放到独立 JSON 文件中再用 node 读取，避免引号冲突。

## 2026-04-28T14:41 执行记录

**更新概要：**
- 投稿箱：无新投稿
- 本轮为收尾提交：上一轮(14:25)遗留2个临时脚本(_add_section.py, _count_sections.py)，清理后统一提交推送
- 确认所有数据文件JSON有效

**当前数据编号水位：** news→n183, papers→p097, opensource→os058, jobs→j089
**Git:** d3eea25→6c740bb, pushed to main

## 2026-04-28T14:25 执行记录

**更新概要：**
- 投稿箱：无新投稿（gh issue list 无 "[投稿]" 标题）
- 发现工作区存在并行实例遗留的未提交改动（news/papers/jobs/opensource/learn/robot-dynamics），本轮策略为"验证+增量补充+合并提交"，避免并发冲突
- 并行实例已贡献：news +4（n180-n183：具身智能大会密集期/CONNECT 2026硅谷/第三届北京具身智能人形机器人产业大会/魔法原子Magic Atom硅谷大会发布世界模型+灵巧手+人形机器人）、papers +2（p096 ABot-M0 高德动作流形学习/p097 Awesome Robot Foundation Models 2025-2026综述）、jobs +2（j088 苏州多企业联合/j089 魔法原子全球扩招）、opensource 修复至 os057、robot-dynamics 新增"浮基动力学与人形机器人全身动力学"section
- 本轮增量：opensource +1（os058 ABot-M0 高德AMAP CV Lab动作流形学习VLA基座/UniACT统一数据管线/"一脑多形"跨本体/GitHub amap-cvlab/ABot-Manipulation）、修复 p096 缺失的 github 字段与 authors（Alibaba AMAP CV Lab）
- 清理临时脚本：_add_section.py、_count_sections.py、_update.py

**当前数据编号水位：** news→n183, papers→p097, opensource→os058, jobs→j089
**Git:** 34de9d6→d3eea25, pushed to main

## 2026-04-28T12:08 执行记录

**更新概要：**
- 投稿箱：无新投稿
- 新闻 +4（n176-n179）：清华大学具身智能与机器人研究院(EIR)官网上线(校友创企近20家)、第一财经深度特斯拉Optimus V3量产(弗里蒙特百万产能/Model S X停产让路)、破壳机器人天使轮(清华许华哲/云启+小米战投/C端家庭场景)、CONNECT 2026硅谷全球具身智能创新峰会(MagicLab人形机器人/中国出海)
- 论文 +2（p094-p095）：FastGrasp(arXiv 2604.12879/全身控制+移动抓取+触觉反馈/CVAE)、Tactile-Driven HRL(触觉驱动层次化RL/接触丰富灵巧操作)
- 开源 +0：本轮无新开源项目
- 招聘 +2（j086-j087）：破壳机器人首批招聘(北京/家庭具身智能)、MagicLab硅谷双总部招聘(CONNECT峰会后扩张)
- 学习模块深化 ×1：云边协同新增"联邦学习与隐私保护：多机器人协同训练的数据治理"section（FedAvg完整实现+DP-FedAvg差分隐私+Non-IID/FedProx+跨本体联邦+部署架构+通信优化+工程清单）
- 清理临时文件：_chk.py, _chk2.py, _val.py, _add_fl.py

**当前数据编号水位：** news→n179, papers→p095, opensource→os057, jobs→j087
**Git:** 3d670ba→0183713, pushed to main

## 2026-04-27T23:30 执行记录（与并行实例合并提交至04-28）

**更新概要：**
- 投稿箱：无新投稿
- 新闻 +4（n168-n171）：ISO《人形机器人数据集》全球首个国际标准立项(中国主导)、民生周刊/中关村论坛海淀AI+(产业化布局加速)、人民网"具身智能产业加速跑"(半马+乒乓球+产业落地)、苏州具身智能产业生态大会(53项目签约/200+场景/创新平台)
- 论文 +2（p090-p091）：Tactile-Reactive Gripper with Active Palm(Nature Comm Eng/低自由度灵巧操作)、Evolvable Embodied Agent(arXiv 2604.13533/LLM长短期反思自进化)
- 开源 +0：本轮无新开源项目
- 招聘 +2（j082-j083）：北京人形机器人9岗直招(具身大模型/嵌入式)、苏州产业大会16+家企业全链招聘
- 学习模块深化 ×1：具身Agent系统新增"LLM驱动的自进化操作Agent"section（Evolvable Agent联动/长短期反思架构图/完整Python实现/方法对比表/前沿方向）
- ⚠️ 本轮23:30开始，del命令被拒绝导致中断；并行实例将修改合并提交(daaa97b)并推送
- 水位被并行实例额外推进至n175/p093/j085

**当前数据编号水位：** news→n175, papers→p093, opensource→os055, jobs→j085
**Git:** daaa97b, pushed to main

## 2026-04-27T16:05 执行记录（跨时段至04-28T12:00推送）

**更新概要：**
- 投稿箱：无新投稿
- 新闻 +4（n164-n167）：第三届中国具身智能与人形机器人产业大会4月28-29日北京海淀(2000+精英/尹周平院士/量产元年)、非夕科技汉诺威工博会"加速具身智能革命"(自适应机器人/欧洲布局)、CVPR 2026 ManipArena真机操作挑战赛(20项推理密集型双臂任务/中山大学+自变量)、FingerViP指尖视觉灵巧操作新范式(arXiv 2604.21331/指尖微型相机/解决遮挡瓶颈)
- 论文 +2（p088-p089）：FingerViP(arXiv 2604.21331/指尖视觉感知/多视角融合/遮挡感知注意力/成功率40%→80%+)、ManipArena(CVPR 2026/首个大规模真机操作基准/20任务/当前SOTA仅30-50%)
- 开源 +0：本轮无新开源项目
- 招聘 +2（j080-j081）：非夕科技全球扩招(上海/力控+AI/欧洲市场)、第三届产业大会人才对接专场(北京/20+企业/全产业链)
- 学习模块深化 ×1：3D视觉点云新增"多视角视觉融合与主动感知(Active Perception)"section（FingerViP联动/遮挡感知注意力数学+完整PyTorch实现/ActivePerceptionPlanner信息增益规划/多系统应用对比表/工程考量）
- ⚠️ 本轮16:05开始执行，中间被中断（del命令被拒绝），04-28T12:00恢复并推送
- 清理临时文件：_check_state.py

**当前数据编号水位：** news→n167, papers→p089, opensource→os055, jobs→j081
**Git:** a9e24fa→a7f9190, pushed to main

## 2026-04-27T09:56 执行记录（本轮实际新增内容补充说明）

**说明：** 本轮与00:27轮次共享工作目录，修改被合并提交。以下是本轮09:56实际新增的内容：
- 新闻 +4（n156-n159）：IEEE RAM 2026灵巧操作综述(全栈操作能力)、新华社AI嵌入工业体系全流程(汉诺威深度观察/物理AI→工业智能体→自治化)、一汽自研智能机器人北京车展首秀(传统央企入局具身智能)、汽车之家"机器人接管北京车展"(车展第4天新物种抢占C位)
- 论文 +2（p084-p085）：VLA-World(arXiv 2604.09059/统一预测想象与反思推理/自动驾驶→通用具身)、ETac(arXiv 2604.20295/轻量触觉仿真/指数衰减+PointNet/84.45%灵巧抓取)
- 招聘 +2（j076-j077）：一汽智能机器人研发(北京/央企/AI算法+运控)、北京人形机器人创新中心(国家级平台/9岗在招/亦庄)
- 学习模块深化 ×1：物理仿真新增"触觉仿真与软体物理：灵巧操作的隐藏维度"section（GelSight/DIGIT工作原理+弹性体连续介质力学+FEM vs数据驱动对比+ETac架构解析+指数衰减传播+PointNet残差修正完整代码+触觉四大应用+前沿趋势表）

**当前数据编号水位：** news→n159, papers→p085, opensource→os055, jobs→j077
**Git:** 0fcbca8→0df2791, pushed to main

## 2026-04-27T11:20 执行记录

**更新概要：**
- 投稿箱：无新投稿
- 新闻 +4：人民日报汉诺威工博会国际视点(50国3000家/中国展商700+/工业AI三进行时)、新华社记者手记人形机器人从会跳舞到能干活(产线磨合期)、卡诺普RHM-T1W轮式人形汉诺威全球首发(1.9m/咏春/拟港股上市)、特斯拉Q1财报+250亿美元capex全面押注AI与Optimus(上海首批50台量产交付)
- 论文 +2：Mask World Model/MWM(arXiv 2604.19683/语义掩码替代像素预测/鲁棒策略学习)、IEEE RAM灵巧操作综述(从机械编程到具身智能/夹爪到多指手演进)
- 开源 +0：本轮无新开源项目
- 招聘 +2：智平方(深圳/百亿估值/GOVLA/校招社招)、卡诺普(成都/RHM-T1W后扩招/运动控制AI算法)
- 学习模块深化 ×1：物理仿真新增"视频世界模型：从物理引擎到可学习仿真器"section（传统仿真vs视频世界模型/三大架构对比/MWM语义掩码范式转变/隐空间世界模型完整实现/MaskWorldModel代码/鲁棒性对比分析/传统vs世界模型选型指南/前沿方向表）
- ⚠️ 本轮跨两个时段完成(00:27开始→11:20提交)，中间被中断；期间并行轮次(09:56)已推进水位到n159/p085/j077，本轮修改与并行轮次修改合并提交
- 清理临时文件：_debug_json.py, _fix_json.py

**当前数据编号水位：** news→n159, papers→p085, opensource→os055, jobs→j077
**Git:** 2cfa6cc→0fcbca8, pushed to main

## 2026-04-26T21:59 执行记录

**更新概要：**
- 投稿箱：无新投稿
- 新闻 +4：北京车展聚焦物理AI(38万㎡/车企集体入局人形机器人/造车到造人)、自变量WALL-B世界统一模型发布(WUM架构/家庭场景/35天入驻/B轮20亿)、Samsung DAM-VLA(手臂-夹爪解耦VLA/动态路由)、AIRS电力场景具身智能实习(国网南网100亿方向)
- 论文 +2：DAM-VLA(arXiv 2603.00926/Samsung/解耦双Diffusion Head+VLM动作路由)、WALL-B(自变量/WUM架构/原生多模态融合/家庭场景)
- 开源 +0：本轮无新开源项目
- 招聘 +2：AIRS深圳(电力场景具身智能实习)、安克创新(多方向校招社招实习)
- 学习模块：本轮跳过（上轮17:05已深化模仿学习模块）

**当前数据编号水位：** news→n151, papers→p081, opensource→os055, jobs→j073
**Git:** 95b4920→dec5a22, pushed to main
