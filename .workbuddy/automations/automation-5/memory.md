# automation-5 执行历史

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
