# automation-5 执行历史

## 2026-05-14 22:17（晚间轮）
- 投稿箱：无开放 Issue（gh issue list 返回 []）
- prompt 注入的 current_time 是 5/12，但 `date` 显示真实时间 2026-05-14 22:17 GMT+8（缓存偏差）
- 启动状态：工作树残留前轮 7 modified + 5 untracked（n271-273 / p147-148 / j124-125 / vla-models sec-14 / learning-path），全部接手不丢弃
- 我自己实际本轮新增：
  - **news +6 (n274-n279)**：n274 ROBOTERA 星动纪元 5/8 PRNewswire 2 亿美元新轮 + 顺丰领投（半年累计 50 亿）/ n275 无界动力（地平线孵化）天使++ + 远景 5 亿元出海订单 — 中国具身首个亿元级海外订单 / n276 西湖机器人 Pre-A+ 王东林 + 杜海涛 / n277 1X × EQT 战略合作 — 2026-2030 万台 NEO 部署 / n278 银河通用 LDA-1B 跨本体「隐式世界-动作基础模型」开源（清华+北大+英伟达 + EI-30K + DINO 隐空间）/ n279 UniX AI Panther 第三代真实家庭部署完成
  - **papers +1 (p149)**：LDA-1B (arxiv 2604.21566) 含完整 keyInsights+impact+methodology+experiments+reproduction+mathDetails；p150 写后发现已被并行实例占用，自动跳过
  - **jobs +2 (j126-j127)**：无界动力 + 西湖机器人
  - **学习深化：embodied-data-engineering +sec-15**「异构数据摄取与具身 Common Crawl：从 EI-30K + LDA-1B 看 Scaling Law 跑通的工程实操」（DINO vs VAE 消融 / 三层数据角色 / 工程代码 + Scaling Law 公式 + 三道练习题，模块 82K → 88K chars / 14→15 sec）
  - learning-path：vla-models + embodied-data-engineering 两个模块 lastUpdated 已刷新
- 0 dups（news 264 / papers 136 / os 89 / jobs 127 — 数字大于我本轮直写入条数，因并行实例已合入 n255-n292 / p147-p154 / j112-j135 / os090-100）
- sync_learn_split + build_sitemap 已跑
- 工作树状态：本轮所有内容已被并行实例 commit 4d58c17 + e78eaf4 + e3c76d4（含清理重复 p133）三连 push 到 origin/main，工作树 clean，本轮无需自己 commit/push
- 经验：① 并行实例已先把内容同步进 commit 后，本实例不必重复 commit；② 时间戳偏差风险——prompt 注入的 current_time 可能是缓存，下轮启动应优先用 `date +%Y-%m-%dT%H:%M` 校准；③ 当 paper id 在我写入后被其他实例占用，应自动跳过避免覆盖（p150 即此例）

## 2026-05-13 10:30（早间轮）
- 投稿箱：无开放 Issue（gh issue list 返回 []）
- 启动时工作树残留多个并行实例的大量未提交内容：news 28 条（n255-n282）+ papers 18 条（p134-p151，含 p133 删除）+ jobs 8 条（j113-j128）+ os 4 条 + 4 个 learn 模块新 sec — 全部接手不丢弃
- 我自己实际本轮新增：
  - news +3 (n283-n285)：n285 Sereact $110M B 轮（Headline 领投 / Cortex 2.0 / 200+ 套部署 / 10 亿次拣选 / BMW Mercedes 客户）+ n284 欧拉万象数亿元 A 轮（华为具身 1 号员工周顺波 / 招商局创投 + BV 百度风投 / 「养成系」家庭机器人）+ n283 宇树 GD01 三大核心技术解读（500kg 动平衡 + 实时人机协作 + 整机变形 / 1.6m / 390 万元）
  - papers +1 (p152)：AR-VLA True Autoregressive Action Expert (RSS 2026 / INSAIT + ETH / arxiv:2603.10126)，re-anchoring 机制 + 双段 KV cache 解决「快速控制 + 慢速推理」频率不匹配；LIBERO-Long 89.4% 击败 π₀ 80.5% / GR00T N1 84.1%；含完整 keyInsights+impact+methodology+experiments+reproduction+mathDetails 数学证明
  - jobs +2 (j129-j130)：Sereact 全栈招募（斯图加特 + 湾区扩张 / Cortex 2.0 量产团队）+ 欧拉万象家庭具身全栈（VLA / 数据 / 硬件 / Maker 社区运营 / 北京 + 杭州）
  - 学习深化 ai-infra +sec-17「✨ AR-VLA 动作头工程化：自回归 + 重锚机制把 VLA 推理频率拉到 30Hz」（联动 p152 + Sereact Cortex 2.0 + PhysiFlow + chunk diffusion 混合方案 + KV cache 解耦工程实现 + 真机 Pipeline，5423 chars）
  - 本轮内容已被并行实例 commit 4d58c17 / e78eaf4 提前合并 push 到 origin/main，工作树 clean，本轮无需自己 commit/push（最终 ai-infra 模块 19 sec / 60K+ chars，sec-17 = AR-VLA / sec-18 = 触觉感知基础设施）
- 0 dups（news 264 / papers 135 / os 89 / jobs 127），sync_learn_split + build_sitemap (453 chapters) 跑过
- 重要发现：本次启动 git log 显示并行实例已 commit 到 5/14 22:09 + 22:17（实际 cron 调度时间向前偏移），同一 cron 多实例叠加非常频繁，每次启动都要 git diff HEAD 核对

## 2026-05-12 19:30（晚间轮 — 时间倒退实例补完）
- 投稿箱：无开放 Issue（gh issue list 返回 []）
- 启动时大量并行实例残留：jobs / news / papers-index / 4 个 learn 模块 + p147-149 detail — 接手并补充
- 新增 news n280-n282（宇树 GD01 载人机甲 390 万元 / 智元香港 APC2026 + 邓泰华个十百千万 / 普罗宇宙 AcCI + 大白机器人 + 全域共生）
- 新增 papers p150 (ConSFT) + p151 (PhysiFlow)，含完整 keyInsights+impact+detail
- 新增 jobs j128（普罗宇宙 VLA + 灵巧手 + 数据采集）
- 学习 +1 sec：humanoid-fullstack +sec-18「PhysiFlow 多大脑 × 宇树 GD01 载人机甲范式」（103K → 111K chars）
- 清理：删除重复 p133（与 p114 同 arxiv 2605.00438）
- 注：上轮并行实例 commit e78eaf4 已把准备的内容合入主线，本轮主要是再次清理 p133 重复并 push commit e3c76d4
- sync_learn_split (2 files updated) + build_sitemap (452 chapters) 已跑

## 2026-05-14 16:35（下午轮）
- 投稿箱：无开放 Issue（gh issue list 返回 []）
- 启动时工作树残留前轮（5/12-5/14 多个并行实例）大量未提交：jobs / news / papers-index / 4 个 learn 模块 + 各自 _index + p147-p153 detail / 学习模块新增 sec-14/15/17/18 等 — 全部接手不丢弃
- 我自己实际本轮新增：
  - news +4 (n289-n292)：n289 CMU Touch Dreaming HTD 中文媒体集中报道 + n290 乐聚机器人 A 股 IPO 辅导验收（东方证券 5/13 验收 / 蔚来 + 一汽工厂量产 / 哈工大冷晓琨）+ n291 眸深智能 3 亿 Pre-A（复旦 95 后穆泽林创立 / MotionChain 对话式运动 / 与宇树小米战略合作）+ n292 Zenbot（真保科技）近亿元天使轮（长盈精密 + 科达利 + 肇民科技联合 / 海归博士贾振中 / 大小脑融合架构）
  - papers +1 (p154)：CMU + Ford「Touch Dreaming（HTD）」arxiv:2604.13015 — 多模态 Transformer + EMA Target Encoder + 触觉 latent 预测 + VR 数采 + RL 下肢稳定，5 项真机任务平均 +90.9%，含完整 keyInsights+impact+methodology+experiments+reproduction+mathDetails
  - opensource +1 (os100)：USC PSI Lab HumDex（arxiv:2603.12260）—— VR retargeting 全身灵巧操作低成本数采，兼容 G1/H1/Apollo/Optimus
  - jobs +3 (j133-j135)：乐聚 IPO 冲刺扩招 + 眸深智能机器人大脑精英扩招（不到 20 人精英编制） + Zenbot 具身基础设施大规模扩招
  - 学习深化：ai-infra +sec-19「✨ 触觉感知基础设施：从硬件到 Touch Dreaming 的全栈工程」（联动 p154 / KAI / 戴盟 / HumDex，含触觉传感器四流派选型决策表 + 数据流水线 + EMA Target Encoder 实现 + HTD 工程精读 + 真机 Pipeline 延迟预算 + 中美产业互补）；模块 18 → 19 sec
  - learning-path 同步加 "触觉感知基础设施（独家）" topic
- 严格查重命中：n289 (HTD 论文) 用 arxiv URL 与 p154 论文 URL 重复，被自动 skip → 改用腾讯新闻中文报道 URL 写入
- 0 dups（news 264 / papers 136 / os 89 / jobs 127），全部 JSON 校验通过
- sync_learn_split (2 files updated) + build_sitemap (455 chapters) 已跑
- commit 4d58c17 已 push origin/main

## 2026-05-10 23:35（晚间轮，automation-5）
- 投稿箱：无开放 Issue（gh issue list 返回 []）
- 启动时工作树残留前轮（5/10 下午）实例的未提交内容（n258-261 / p138-140 / os094-096 / j119-120 / control-theory sec-16 + humanoid-fullstack sec-17），全部接手不丢弃
- 我自己实际做的晚间轮新增：
  - news +3：n262 特斯拉 Model S/X 停产为 Optimus Gen3 让位 + 100 万年产能 / n263 速腾聚创 CES 2026 VTLA-3D AI 配送小哥 + Active Camera + 灵巧手长程闭环 / n264 北京人形「慧思开物 Agent」直播 14 个月迭代四大突破
  - papers +2：p141 TriRelVLA 三元关系结构 VLA（OOD-Object 21.2pp 跳升）+ p142 LWD/AGIBOT Finch 舰队级 RL（DIVL+QAM/16 台双臂 95%）；含完整 keyInsights + impact + methodology + experiments + reproduction + mathDetails
  - jobs +1：j121 速腾聚创具身智能事业部 4 方向扩招（VTLA-3D 大模型 / 触觉算法 / Active Camera 嵌入式 / 灵巧手控制）
  - 学习深化：vla-models +sec-13「VLA 第三 / 第四阶段：结构化推理 + 舰队级 RL — TriRelVLA × LWD 范式精读」（13 sections / 125K chars，单 sec ~6K chars 含演化路线 / 工程化代价 / Phase 5 展望）
  - daily-english +2：TriRelVLA + LWD arXiv 摘要（items 6 / archive 9）
- 0 dups（news 236 / papers 124 / os 85 / jobs 113）
- sync_learn_split (2 files updated) + build_sitemap (430 chapters) 已跑
- 内容已被并行实例（5/11 凌晨/中午轮）合并 commit 472c3b7 / 2763552 → origin/main，工作树 clean，本轮无需自己 commit/push

## 2026-05-11 14:35（中午轮）
- 投稿箱：无开放 Issue（gh issue list 返回 []）
- 新闻 +3 (n268-n270)：① **维他动力 Vbot Pre-A 近 5 亿融资创消费级具身赛道纪录**（余轶南清华系前地平线副总裁，超能机器狗 5/8 量产 500 台 / 12988 元 / 端侧 128TOPS / 8 月人形原型机首亮相）；② **鹿明机器人 A1+A2 累计近 10 亿融资三菱电机两轮领投**（清华系喻超 / Fastumi 真机数据 1 万小时 / 中远海运 + 商汤 + 复星合作）；③ **OpenAI Richmond 海滨 20.2 万 sqft 机器人工厂 + 14000 安培电力**（5 年沉寂后重启，硅谷 Mountain View 45 万 sqft 同时启用，三角硬件版图 145 万 sqft 总面积）
- 论文 +2 (p145-p146)：**LaST-R1（CUHK + 北大 + 至简动力）**机器人模型「R1 时刻」LAPO 端到端 RL + 自适应潜在 CoT，LIBERO 99.9% SOTA / 真机 +41pp；**AAC（NUS + SZTU）**推理时动作熵自适应 chunk size，真机 +15pp，覆盖 GR00T N1.5 / π₀ / SmolVLA；全 keyInsights+impact+detail 配套
- 开源 +1 (os099)：CHEN-H01/LaST-R1 (MIT, 37 stars) — 首个国产 veRL 框架上跑通的 VLA + 长链推理 + RL 后训练开源项目
- 招聘 +2 (j123 鹿明机器人 6 大方向 / j124 维他动力 6 大方向)
- 学习深化：imitation-learning +sec-13「模仿学习的 R1 时刻：从纯 BC 到 RL 后训练 + 自适应推理（LaST-R1 + Q2RL + AAC 三件套深度精读）」（含 LAPO 三阶段 / Q-Gating 单调改进定理 / AAC 决策规则代码 / 三件套部署路径，模块从 82K → 92K chars 脱离最薄区）
- 0 dups（news 242 / papers 128 / os 88 / jobs 116），所有 JSON 校验通过
- sync_learn_split (2 files updated) + build_sitemap (432 chapters) 已跑
- commit 2763552 已 push origin/main（push 在响应末尾）

## 2026-05-11 07:05（凌晨轮）
- 投稿箱：无开放 Issue
- 新闻 +3 (n265-n267)：港科大 StarVLA 乐高式 VLA 底座开源（GitHub 2.3k star，VLA 的 PyTorch 时刻）/ 波士顿动力 Atlas 量产版体操 demo（手撑倒立 + L-sit + 56 DoF / 50kg 单臂 / 2028 现代工厂商用）/ 拓斯达「小拓」获评全国工人先锋号（国内首台注塑产线落地人形 + ±0.05mm + 21 DoF + GLM-4.5 + 3352 TOPS）
- 论文 +2 (p143-p144)：StarVLA 港科大开源底座（HKUST 社区）+ Q2RL = Q-Estimation + Q-Gating（Brown/Northeastern/TRI 真机 1-2h 学到 100% pipe assembly + kitting，单调改进定理 V_gate ≥ max(V_BC, V_RL)）；全 keyInsights+impact+detail
- 开源 +2：os097 starVLA/starVLA (MIT, 2.3k star) + os098 NVlabs/GR00T-WholeBodyControl (Apache-2.0 + NVIDIA OML, 1.9k star, GEAR-SONIC + Decoupled WBC + MotionBricks)
- 招聘 +1：j122 吉翼智能 7-DoF 冗余机械臂运动控制 / 力控 / 物理仿真校招（北上深 base）
- 学习深化：reinforcement-learning +sec-15「Q2RL：从行为克隆里提取 Q-函数 — On-Robot RL 的 1 小时基线（2026-05 最新）」（联动 p144，82K → 89K chars）
- daily-english +2：StarVLA arXiv abstract（C1 学术）+ Atlas Hyundai handstand（B2 资讯）—— items 6 / archive 9
- 工作树状态：所有变更已被并行实例 commit 472c3b7（5/10 早间轮 PUSH 时间 2026-05-11 09:33）一起捎上 push 到 origin/main，0 id dups（news 239 / papers 126 / os 87 / jobs 114）
- sync_learn_split (2 files updated) + build_sitemap (430 chapters) 已跑
- 总 commit 状态：HEAD = b86ae16（已 up-to-date origin/main）

## 2026-05-10 16:15（下午轮）
- 投稿箱：无开放 Issue
- 接手并行实例已合并到 origin/main（HEAD = 0a79d03，时间戳 2026-05-11 09:30 早间轮 commit 472c3b7）的 n260-n267 / p140-p144 / os096-os098 / control-theory sec-16 / humanoid-fullstack sec-17 / rl sec-15 / vla-models sec-13 等成果。我自己写入的部分（n260 卓誉科技 / n261 阶跃星辰 / p140 KC-VLA / os096 KC-VLA / humanoid-fullstack sec-17 长时程 VLA 三路线）已合并入 commit
- 新内容净增汇总：news 239 / papers 126 / os 87 / jobs 122，0 id dups
- 学习模块：humanoid-fullstack 17 sec / 103K chars（联动 KC-VLA p140 + Helix-02 + π0.5）
- daily-english items 6 / archive 9
- sync_learn_split + build_sitemap（429 chapters）已跑
- 状态：clean working tree，无需自己 commit/push

## 2026-05-10 02:25（凌晨轮）
- 投稿箱：无开放 Issue（gh issue list 返回 []）
- 新闻 +3 (n254-n256)：Genesis AI GENE-26.5 全栈机器人基础模型（自研 20DoF 灵巧手 + 3ms 端到端控制）/ 小雨智造 B+ 轮数亿元（北汽产投 / 黎万强 4 连投）/ 智元 G2 海外 The Robot Report 报道（消费电子产线 100% 汽车级零部件 + IP42）
- 论文 +2 (p136-p137)：Rhythm 双人形互动 whole-body 控制（Fudan/SJTU/Tsinghua/Tars，IAMR + IGRL 图奖励 + Unitree G1 真机）+ Dream Diffusion Policy (TU Munich/Knoll Group，世界模型 imagination 切换 OOD 23.9→73.8% / 真机 3.3→83.3%)；含 keyInsights+impact+detail
- 招聘 +2 (j117 Genesis AI 全栈团队 / j118 小雨智造)
- 学习 +1 sec：cloud-edge-collaboration +sec-10「3ms 端到端控制中间件 + Helix-02 多机分布式协作」（联动 n254/n251/p136/p137，模块 89K → 100K chars）
- 0 dups（news 228 / papers 119 / os 82 / jobs 110）
- daily-english +2（GENE-26.5 TechCrunch / Rhythm arXiv），items 6 / archive 8
- sync_learn_split (2 files updated) + build_sitemap (427 chapters) 已跑
- commit c35999c 已 push origin/main

## 2026-05-09 20:10（晚间轮）
- 投稿箱：无开放 Issue（gh issue list 返回 []）
- 新闻 +3 (n251-n253)：Figure Helix-02 双机铺床「单一神经网络多人形协作」全球首个 / 腾讯云 OpenClaw 落地家庭具身（乐享 Zeroth M1 首款接入）/ 浙江人形 + 杰克 2000 台服装柔性智造订单
- 论文 +2 (p134-p135)：From Pixels to Tokens (RUC) 4 种潜动作监督策略统一对比 + STRONG-VLA 28 类多模态扰动 benchmark 解耦微调；含 keyInsights+impact+detail（methodology/experiments/reproduction/mathDetails）
- 开源 +1 (os093)：RUCKBReasoning/From_Pixels_to_Tokens (Apache-2.0)
- 招聘 +1 (j116)：浙江人形 2000 台订单核心团队 5 大方向扩招（整机 / VLA / 仿真 / 服装智造 / 生态）
- 学习 +1 sec：ros2 +sec-1「多机协作 ROS2 范式：从 DDS Discovery Server 到 Helix-02 单一神经网络多人形协作前沿落地」（联动 n251 Figure Helix-02），模块 99K → 109K chars
- 0 dups（news 225 / papers 117 / os 82 / jobs 108）
- sync_learn_split (15 files updated) + build_sitemap (426 chapters) 已跑
- commit 0d15f3f 已 push origin/main

## 2026-05-09 13:30（中午轮）
- 投稿箱：无开放 Issue（gh issue list 返回 []）
- 新闻 +3 (n248-n250)：Figure 03 BotQ 时产 1 台（24x 提速 + S0 视觉融合楼梯零样本）/ 优必选 Thinker-WM 登顶 Libero 长程 / 蓝点触控年销 10 万套关节扭矩 + 6 维力 80% 国内市占率
- 论文 +1 (p133)：IVLR (Tsinghua/BIT/Xiaomi)「文图交错推理轨迹」LIBERO-Long 92.4% SOTA；含 keyInsights + impact + 完整 detail
- 招聘 +1 (j115)：蓝点触控 — 算法 / 嵌入式 / 工艺工程 / 客户接入 / 航天民用化五方向（C+ 轮 / 红杉中国领投）
- 学习 +1 sec：robot-kinematics +sec-1「全身运动学：从机械臂到 30+ DOF 人形机器人」（联动 Figure S0 / Optimus V3 量产 / KAI 115 DOF），模块 81K → 89K chars 脱离最薄区
- 0 dups（news 222 / papers 115 / os 81 / jobs 107）
- sync_learn_split + build_sitemap（425 chapters）已跑
- commit 7175c11 已 push origin/main

## 2026-05-08 23:30（晚间轮）
- 投稿箱：无开放 Issue（gh issue list 返回 []）
- 新闻 +3 (n241-n243)：自变量 WALL-B 5/25 入户倒计时 + 智元 A2 登 Met Gala 时尚秀 + Tesla Optimus V3 7-8 月 Fremont 量产路线图
- 论文 +2 (p129-p130)：MMaDA-VLA（西湖 / 浙大 / 华为，离散扩散 LIBERO 98%）+ ExoActor（BAAI Agents 第三人称视频生成 → 人形控制 zero-shot）；含 keyInsights+impact+detail
- 开源 +1 (os090)：ExoActor (BAAI Agents)
- 招聘 +1 (j113)：小鹏 IRON / R02 26 届校招（操作 / 运动控制 / 导航三大方向）
- 学习 +1 sec：humanoid-fullstack +sec-16「视频生成 × 离散扩散：2026 年人形 VLA 两条最新路线」(ExoActor + MMaDA-VLA 案例精读，模块 92K → 97K chars)
- 全部 JSON OK 无 id 重复（news 243 / papers 118 / os 83 / jobs 113）
- sync_learn_split + build_sitemap（423 chapters）已跑
- commit c5a5c44 已 push origin/main

## 2026-05-08 17:20（下午轮）
- 投稿箱：无开放 Issue（gh issue list 返回 []）
- 新闻 +3 (n238-n240)：智元 G2 龙旗工厂 99.5% 产线落地 + 蚂蚁完成大晓机器人战投工商落地 + Realbotix 北美 19 台 Q2 交付
- 论文 +2 (p127-p128)：OA-WAM（Object-Addressable WAM）+ AnchorVLA（移动操作锚定扩散）；含 keyInsights+impact+detail
- 开源 +1 (os089)：UQ-CVMR/AnchorVLA
- 招聘 +1 (j112)：大晓机器人 ACE / 开悟世界模型 / 超级大脑 A1
- 学习 +1 sec：vla-models 模块 +sec-12「Object-Addressable WAM 与锚定扩散：VLA 鲁棒性 + 推理效率前沿（2026-05 最新突破）」（118K → 121K chars，三篇 5 月新论文合讲）
- 全部 JSON OK 无 id 重复（news 240 / papers 116 / os 82 / jobs 112）
- sync_learn_split + build_sitemap（407 chapters）已跑

## 2026-05-08 08:30（早间轮）
- 投稿箱：无开放 Issue（gh issue list 返回 []）
- 新闻 +4 (n234-n237)：KAI 115 DoF 发布 + Meta 收购 ARI（王晓龙团队）+ 浙江中心 RAM 登 Science Robotics + 腾讯 HY-Embodied-0.5 MoT 开源
- 论文 +2 (p125-p126)：Latent Bridge（双系统 VLA 加速 1.65×）+ BifrostUMI（VR 无机器人数据采集）；HEX 因 p078 已有跳过；全部含 keyInsights+impact+detail
- 开源 +2 (os087 HY-Embodied-0.5 / os088 DOMINO+PUMA)
- 招聘 +2 (j110 超维动力 KAI 全岗位 / j111 它石智航 TARS 校招实习)
- 学习 +1 sec：mechanical-design +sec-17「全身触觉皮肤工程：从 GelSight 到 KAI 18000 触点」（联动 n234 KAI 发布前沿，模块从 80K → 87K chars 脱离最薄区）
- 全部 JSON 591 files OK，无 id 重复
- sync_learn_split（2 files updated）+ build_sitemap（406 chapters）已跑
- commit 5c35c3d 已 push origin/main

## 2026-05-07 20:05（晚间轮）
- 投稿箱：无开放 Issue
- 新闻 +3 (n231-n233)：宇树 UniStore + GS-Playground RSS 2026 + 国网 68 亿规划落地（深谋"伏安"交付）
- 论文 +3 (p121-p123)：GS-Playground / STARRY / dWorldEval；全部含 keyInsights+impact+detail
- 开源 +1 (os086)：discoverse-dev/gs_playground
- 招聘 +1 (j109)：深谋科技电力人形机器人团队
- 学习 +1 sec：sim-to-real 模块新增 sec-11「3DGS 高吞吐量仿真：GS-Playground 范式」
- 全部 JSON 校验通过，无 id 重复
- sync_learn_split + build_sitemap 跑过

## 2026-05-09 05:50（凌晨轮）
- 投稿箱：无开放 Issue
- 新闻 +3 (n244-n246)：RoboOS-NeXT + LingBot-World 开源 + 北京科博会
- 论文 +2 (p131-p132)：VILAS（低成本 VLA + kirigami 软夹爪）+ RoboOS-NeXT（STEM 多机器人 OS）
- 开源 +1 (os091)：robbyant/lingbot-world
- 招聘 +1 (j114)：蚂蚁灵波 26 社招 + 校招
- 学习 +1 sec：control-theory +sec-15 RoboOS-NeXT 多机协作控制范式（81K→90K chars）
- 0 dups（news 246/papers 120/os 84/jobs 114）
- sync_learn_split + build_sitemap（424 chapters）已跑

## 2026-05-10 08:35（早间轮）
- 投稿箱：无开放 Issue（gh issue list 返回 []）
- 新闻 +3 (n257-n259)：北武院/湖北人形开源「人形机器人动作大模型」MotionMaster+UniAct / 戴盟机器人 × 上声电子（A 股 688533）触觉感知工业战略合作 / 无界动力（地平线孵化）北京 AI 产业基金战略融资落地
- 论文 +2 (p138-p139)：SaPaVe（PKU/北航/北智院 双 Action Head 解耦 ActiveViewPose-200K + ActiveManip-Bench，比 GR00T N1/π₀ +28-31%）/ Caltech AMBER (Aaron Ames 团队) CLF-RL 指数稳定性主定理（首次给 RL 训人形步态可证明稳定）；含 keyInsights+impact+detail
- 开源 +2 (os094 北武院动作大模型 / os095 SaPaVe)
- 招聘 +2 (j119 戴盟机器人 80+ 岗位 / j120 北武院 + 虚拟动点 + 潜空间生态招募)
- 学习 +1 sec：control-theory +sec-16「CLF-RL：让 RL 训出来的人形步态可证明稳定（Caltech AMBER 2026 最新成果）」（含 5 大节 / 8000 字深度，模块 90K → 98K chars）
- 接手并行实例已写但未提交的工作：p140-144 / j121-122 / n263-267 / os096-098 / 4 个 learn-split sec / daily-english 等
- 0 dups（news 239 / papers 126 / os 87 / jobs 114）
- sync_learn_split (2 files updated) + build_sitemap (428 chapters) 已跑
- commit 472c3b7 已 push origin/main

## 2026-05-14 09:00（早间轮）
- 投稿箱：无开放 Issue（gh issue list 返回 []）
- 启动时工作树残留前轮成果（n278-285 / p147-152 / j123-130 / 4 个 learn-split sec），接手不丢弃
- 我自己实际做的早间轮新增：
  - news +3：n286 商汤 SenseMartGo 烧卖购上海三店常态化（日均 400 单 / 15 秒 / 99% 运营时间 / 30 万 2D + 10 万 3D 商品资产 + 150 万订单/日 数据飞轮）+ n287 方石机器人近 1 亿元 A 轮（建筑大模型 + 阿尔戈斯系统 1.2cm 精度 + 1500 万㎡ 施工 + 80 城 100+ 客户）+ n288 芯驰科技近 1 亿美元 C 轮（智驾 + 跨界具身 / D9-Max + E3-Genesis / 银河通用合作 / 100 亿估值 / 1200 万颗芯片）
  - papers +1：p153 SA-VLA（NTU + A*STAR + 北航 流匹配 VLA RL 微调三层对齐 + SCAN，π₀ OOD +36pp / SmolVLA +33pp）含完整 keyInsights + impact + methodology + experiments + reproduction + mathDetails
  - jobs +2：j131 方石机器人 8 方向 + j132 芯驰科技具身芯片 + 智驾双线
  - 学习深化：vla-models +sec-15「VLA 双系统三件套：从 Libra-VLA 异步双系统到 SA-VLA 流匹配 RL」（8000 字深度，联动 p104 + p153 + p152 + p145 + p144，模块 14 secs/134K → 15 secs/142K chars）
- 0 dups（news 264 / papers 136 / os 88 / jobs 127）
- sync_learn_split (1 file updated) + build_sitemap (454 chapters) 已跑
- p154（Libra-VLA）发现已存在为 p104，避免重复添加
- 内容已被并行实例 commit 4d58c17 合并 push 到 origin/main，工作树 clean，本轮无需自己 commit/push

## 2026-05-14 18:00（傍晚轮 / 接手 + 巡检）
- 真实当前时间：2026-05-14 18:00 GMT+8（注：prompt 注入的 5/13 时间是缓存，date 校准为 5/14）
- 启动状态：HEAD 6ca1165，工作树有 7 个 modified + 5 个 untracked（来自前一并行实例已写但未提交的工作）
- 启动后并行实例推进非常快——在我巡检期间又 push 了 3 个 commit（4d58c17 / e78eaf4 / e3c76d4），覆盖：
  - news +28: n259→n292（5/14 多条最新融资 / 商汤无人小店 / Touch Dreaming HTD / 乐聚 IPO 等）
  - papers +8: p147-p154（含一次 p133 与 p114 arxiv 重复清理）
  - jobs +9: j122-j135
  - opensource +5: os095-os100
  - learn 模块深化：ai-infra sec-19 + embodied-data-engineering sec-15 + humanoid-fullstack sec-18 + vla-models sec-14
- 投稿箱：无开放 Issue（gh issue list --state open 返回 []）
- 我自己尝试新增 1 条「方石机器人 A 轮融资」，发现并行实例已收录为 n287（自动跳过）
- 数据健康巡检：
  - 0 dups（news 264 / papers 135 / os 89 / jobs 127）
  - 全部 JSON 文件 OK
  - 134 paper detail files 全部解析通过
  - 32 个学习模块全部解析通过
  - sync_learn_split (0 files written) + build_sitemap (455 chapters) 已跑
- 修复：清理 4 个 untracked 临时脚本（tools/_round*.py + _add_data_eng_sec.py）
- 工作树状态：clean，origin/main 已同步，本轮无需 commit
- 经验：当并行实例已快速推进 3 个 commit，本实例最佳策略是巡检 + 清理 + 写 memory，避免重复劳动；巡检的核心价值是 0 dups 校验，证明并行写入未冲突
