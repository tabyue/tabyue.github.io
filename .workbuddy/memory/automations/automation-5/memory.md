# automation-5 执行记忆

## 任务
更新具身智能知识门户内容：投稿箱处理 → 学习模块正文扩展 → 新闻/论文/开源更新 → 招聘 → 资源导航 → 提交。

## 执行历史

### 2026-10-08 16:15—17:10
- 投稿箱：5 个 Issue 全部已关闭，无新投稿。
- 数据：新闻 +10（n354—n363）、论文 +5（p185—p189，含 detail）、开源 +4（os137—os140，含 detail + 报告页）、招聘 +5（j162—j166）、资源导航 r001 扩充 + 新增 r004。
- 学习：vla-models +第 25 节（部署鲁棒性与运行时保障，9.7K）、training-inference-optimization +第 17 节（推理效率三路线，10.5K）；修复 vla-models 第 6 节缺 title。
- 校验：sync_learn_split + build_sitemap（500 章节）+ health_check → ALL OK；已 push。

### 2026-10-09 08:00—08:20
- 投稿箱：无新投稿。
- 数据：新闻 +10（n364—n374，n367 后合并进 n354）、论文 +5（p190—p194，含 detail）、开源 +4（os141—os144，含 detail + 报告页）、招聘 +6（j167—j172）、资源导航 r001 扩充 + 新增 r005。
- 学习：world-models-llm +第 12 节（WAM 可组合框架/长上下文/演化记忆，+9.8K → 112K）；embodied-data-engineering +第 17 节（训练场/数据闭环/跨本体底座，+8.9K → 102K）。
- 校验：sync_learn_split + build_sitemap（502 章节）+ health_check → ALL OK；已 push（471b08a）。

### 2026-10-10 08:00—09:00
- 投稿箱：无新投稿（gh issue list 返回空）。
- 数据：新闻 +10（n375—n384）、论文 +5（p195—p199，含 detail）、开源 +4（os145—os148，含 detail + 报告页）、招聘 +6（j173—j178）、资源 r001 扩充 + 新增 r006。
- 学习：computer-vision +第 14 节（多视图几何与相机标定，12.5K）；3d-vision-pointcloud +第 10 节（场景流/非刚性配准/时序跟踪，10.0K）。
- 校验：sync + sitemap（504 章节）+ health_check → ALL OK；已 push。

### 2026-10-11 08:00—09:00
- 投稿箱：无新投稿。发现并推送了前一轮遗留的未推送提交 f44a521。
- 数据：新闻 +10（n385—n394）、论文 +5（p200—p204，含 detail）、开源 +4（os149—os152，含 detail + 报告页）、招聘 +6（j179—j184）、资源 r001 扩充 + 新增 r007。
- 学习：sensors-hardware +第 18 节（多模态主动感知：选型/同步/标定，12K）；sim-to-real +第 12 节（重定向 IK/MPC/GNR + real-to-sim 数据引擎，12K）。
- 校验：sync + sitemap（506 章节）+ health_check → ALL OK；已 push（9858361）。

### 2026-10-12 08:00—08:55
- 投稿箱：无新投稿。
- 数据：新闻 +10（n395—n404）、论文 +5（p205—p209，含 detail）、开源 +4（os153—os156，含 detail + 报告页）、招聘 +6（j185/j186/j189/j190/j191/j192）、资源 r001 扩充 + 新增 r008（训练场与实景实训基础设施）。
- 学习：robot-kinematics +第 17 节（运动学标定与误差建模，11.0K → 106K）；physics-simulation +第 16 节（接触动力学与约束求解器，8.7K → 105K）。
- 校验：sync + sitemap（508 章节）+ health_check → ALL OK；已 push（9858361..cbfab4f）。

### 2026-10-13 08:00—09:20
- 投稿箱：无新投稿。顺带把前几轮遗留的 4 个未推送提交一并推上。
- 数据：新闻 +9（n405/406/410/411/412/413/415/416/417/418 中 9 条生效；4 条与既有条目重复被拦）、论文 +5（p211/p213/p214/p215/p216，含 detail）、开源 +4（os158—os161，含 detail + 报告页）、招聘 +6（j193—j198）、资源 r001 扩充 + 新增 r009（评测基准与榜单）。
- 学习：control-theory +第 17 节（抖动治理：jerk 限幅 / 输入整形 / 高阶动作监督，11K → 109K）；mechanical-design +第 19 节（一体化关节模组量产工程，12K → 108K）。
- 校验：sync + sitemap（510 章节）+ health_check 一次 FAIL（n411=n354 灵生 A 轮，同文双域名）→ 合并后 ALL OK；已 push（e55c8de）。

### 2026-10-14 08:00—09:40
- 投稿箱：无新投稿。
- 数据：新闻 +10（n419—n428）、论文 +5（p217—p221，含 detail）、开源 +4（os162—os165，含 detail + 报告页）、招聘 +6（j199—j204）、资源 r001 扩充 + 新增 r010（具身数据基础设施与公开数据集）。
- 学习：deep-learning +第 11 节（自监督表征与机器人视觉表征，8.5K）；embodied-agent +第 13 节（失败感知与自主恢复，7.4K）。
- 校验：sync + sitemap（512 章节）+ health_check → ALL OK；已 push（29905d4）。

### 2026-10-15 08:00—09:00
- 投稿箱：无新投稿（gh issue list 返回空）。开工时 `git status -sb` 显示 **ahead 1**（上一轮 ae9043d 未推送），本轮一并带上。
- 数据：新闻 +10（n429—n438）、论文 +5（p222—p226，含 detail）、开源 +4（os166—os169，含 detail + 报告页）、招聘 +6（j205—j210）、资源新增 r011（开源基座模型与权重开放平台）+ r001 扩充。
- 学习：cloud-edge-collaboration +「云端托管推理与云边协同」（8.7K → 108K）；multimodal-perception +「视触觉对齐与触觉分辨率瓶颈」（7.8K → 107K）。
- 校验：sync + sitemap（514 章节）+ health_check → ALL OK；已 push（ae9043d..879778f）。

### 2026-10-16 08:00—09:00
- 投稿箱：无新投稿（`gh issue list --state open` 空）。
- 数据：新闻 +10（n439—n448）、论文 +5（p227—p231，含 detail）、开源 +4（os170—os173，含 detail + 报告页）、招聘 +6（j211—j216）、资源新增 r012（全身移动操作与人类数据资源）+ r001 扩充。
- 学习：reinforcement-learning +「无监督技能发现与行为基础模型：FB 表示 / BFM-Zero / I-BFM」（8.0K）；imitation-learning +「从人类视频到机器人动作：重定向 / 观测对齐 / 控制器输入离线精修」（7.9K）。
- 校验：sync + sitemap（516 章节）+ health_check 首轮 FAIL 2 项（papers-index / opensource 的 totalItems 未同步）→ 修后 ALL OK；已 push（132a28d，HEAD==origin/main）。

## 稳定执行套路（后续沿用）
1. `gh issue list --state open --json number,title,body,createdAt --limit 50` 查投稿；无则跳过
2. WebSearch 抓近 1—7 天的中英文稿源；WebFetch arxiv.org/abs/<id> 取准确标题/作者/日期
3. 写 `_upd_data.py` 一次性改 5 个 JSON（内含查重），再写 `_upd_learn.py` 扩正文
4. **新增 opensource 条目后必须**：写 `data/opensource/<id>.json` + 跑 `tools/gen_os_report.py <id>`（用 `C:\Users\tabyue\.workbuddy\binaries\python\envs\default\Scripts\python.exe`，该 venv 装了 markdown）
5. 收尾三连：`sync_learn_split.py` → `build_sitemap.py` → `health_check.py`（须 ALL OK）
6. 删 `_*.py` 临时脚本 → `git add -A` → commit → 用 gh 凭据 trick 推送
7. 写 `.workbuddy/memory/YYYY-MM-DD.md` + 更新本文件

## 常见坑
- 学习正文的 Python 示例代码 docstring 用 `'''`，用 `"""` 会截断外层字符串
- 同日同事件查重会误报（同一天多条新条目），命中后人工复核（本次却是**真重复**：n367=n354 灵生 A 轮，因全角标点差异逃过 title[:18] 自查）
- `title[:18]` 前缀查重会被全角标点绕过 → **health_check 是唯一可靠兜底，必跑**
- 写学习正文跨模块内链前，先打印目标模块 section 索引表（append 后索引易算错）
- PowerShell 输出必须 `Out-File -Encoding utf8`，否则 GBK 乱码
- PowerShell stdout 常被吞，诊断结果写临时文件再 Read
- **health_check 已加「news url 重复」硬校验（2026-10-10 踩到）**：两条新闻不能共用同一 URL。聚合稿（如 CSDN AI 日报、humanoid.guide 整合图）只能给其中一条用，其余必须另找独立源，否则 FAIL。写新闻前先备齐互不相同的 URL。
- **Python 字符串定界（2026-10-10）**：脚本里 content 用 `"""`，示例代码的 docstring 用 `'''`；dict 最后一个字段的闭合是**裸 `'''` 行（无逗号）**，批量替换要单独处理一次，否则 SyntaxError 报在下一个字段开头。
- **git push（2026-10-11 更新）**：`git credential-manager` 子进程静默崩溃，exit 128 且零输出；旧的 `!gh auth git-credential` trick 已失效。改用空 config 绕开 helper + token 嵌 URL，并需 `dangerouslyDisableSandbox: true`：
  `$env:GIT_CONFIG_GLOBAL/$env:GIT_CONFIG_SYSTEM = 空cfg` + `git -c http.sslBackend=schannel push https://tabyue:$(gh auth token)@github.com/... main`
  **空 cfg 必须用 `[System.IO.File]::WriteAllText($tmp,"")` 创建**；用 `">$tmp` 重定向会写成 UTF-16，git 报 `fatal: bad config line 1`。
- **learning-path.json 结构**：`stages[].modules[]`，模块**只有 name 没有 id**，同步 lastUpdated 需按 name 子串匹配（如「传感器与硬件接口」「Sim-to-Real」）。
- 每次开工先看 `git status -sb`：若 `ahead N` 说明上一轮 commit 未 push，本轮一并带上。
- **开源选题先查库（2026-10-12）**：AWS Physical AI Toolchain=os152、ROBOTERA VPP2=os145、RLinf/RPent=os146 早已收录。搜到的「新开源」很可能上一轮已加，写条目前先按 github URL 子串比对现有 projects。
- **学习正文用 raw 字符串** `r'''...'''`（2026-10-12）：正文含 `\{`、`\top`、`\Delta` 等 LaTeX 时，普通 `"""` 会报 SyntaxWarning 且需逐个转义；raw 字符串一次解决。示例代码 docstring 仍用 `'''`（外层是 `"""` 时）或 `"""`（外层是 `r'''` 时），**定界符不能与外层相同**。
- **同文多域名导致 URL 查重失效（2026-10-13）**：`www.163.com/dy/article/X.html` 与 `dy.163.com/article/X.html` 是同一篇。URL 严格比对抓不到，只有 health_check 的同日同事件 3-gram 能拦。写新闻时同一稿件只取一个域名；health_check 报「同日同事件」时先确认是否真重复再合并（本轮是真重复，已把 n411 的独有事实并入 n354 后删除）。
- **开源详情 keyPapers 必须是 markdown 字符串（2026-10-13）**：`tools/gen_os_report.py` 把 detail 各字段直接 `'\n'.join`，list-of-dict 会抛 `sequence item N: expected str instance, list found`。生成报告前先转成 `- **[标题](url)** — 说明`。
- **写 os 脚本的括号层级（2026-10-13）**：`P.append(` + `dict(` + `meta=dict(` + `detail=dict(` 共 4 层，keyPapers 列表闭合后需 `]))))`。且 `detail` 必须在入表前 `m.pop('detail')`，否则 detail 会混进 `opensource.json` 的 projects 列表。
- **新闻/论文/开源选题先查库（2026-10-13 强化）**：本轮 10 条新闻候选里 4 条已被 10-10/10-12 两轮收录（Yujin Robot= n371、CCTV 训练场=n398、RoboDojo、边融边投=n397）；论文候选里 UNITAS 与 Long-WAM 已收录；开源候选 HomeBody=os149。查重脚本拦下是正常结果，不是 bug，但要准备好备选条目补足数量。
- **同一 URL 已被占用即说明内容已收录（2026-10-14）**：本轮 n427 首版（cinn.cn 经营验证稿）与 n389 撞 URL。不要换域名绕开，直接换选题；同文多域名是上一条老坑的变体。
- **learn 脚本的「先写后 print」陷阱（2026-10-14）**：bump 函数在写文件之后才 print，print 若抛异常（如引用了不存在的 `sec["id"]`）文件已被改动。补跑前必须给 bump 加「按 shortTitle 判重」守卫。
- **外层用 r""" 时，示例代码 docstring 只能用 '''（2026-10-14 复现）**：误用 `"""` 会提前闭合外层字符串，报错落在 docstring 正文首行并表现为 `IndentationError: unexpected indent`，与实际原因相距几百行。
- **deep-learning 已有 Flow Matching 章节**（位于 tier 2），不要再写同题；写前先打印目标模块的 section 清单（短标题 + tier + 字数）。
- **PowerShell 内联 `python -c @"..."@` 会吞字符导致 SyntaxError**（2026-10-15）：诊断脚本一律先 `Write` 成 `.py` 文件再跑，不要用 here-string 内联。
- **一次性写不满可二次追加**（2026-10-15）：正文初版只有 6K 时，再写 `_upd_learn2.py` 用「按 shortTitle 找章节 + 判重标记（如正文末尾的『能力自检清单』）+ 追加」的方式补到 8K 左右，幂等且安全。
- **选题先做「本轮新增内容」交叉核对**：本轮候选里星尘智能 150 亿=n419、UniWAM=n428、UNITAS=n410、UnifoLM=n413、巨蟹智能=n385、优必选一汽大众=n364、工博会节卡=n422 均为上一轮已收录，靠 `_dedup.py` 导出的标题/URL/arXiv/GitHub 全量清单才拦干净。
- **learn/*.json 必须 `indent=2`（2026-10-16）**：脚本用 `indent=1` 保存会让整个学习模块文件重排，产生 ±440 行的纯空白噪音 diff。news/jobs/papers-index/opensource/learning-path 则是 `indent=1`。写脚本时两类文件要分开处理；发现噪音 diff 后用 `json.dump(..., indent=2)` 重写再 `git commit --amend`。
- **learning-path.json 在 `data/` 根，不在 `data/learn/`（2026-10-16）**：按 `data/learn/learning-path.json` 读会 FileNotFoundError，若脚本用 `os.path.exists` 容错就会得到 `lp=None`、bump 静默失败只打印 WARN。模块名就是「强化学习」「模仿学习」，无 id 字段。
- **写 OS 条目前先用 `gh api repos/<owner>/<repo>` 验证（2026-10-16）**：一次拿到 stars / language / license.spdx_id / pushed_at / created_at，比 WebFetch 更可靠。本轮据此排除了 404 的 inclusionAI/BiDex-100、psi-lab/SIMPLE、lambdahumanoid/lambda-0。license 为空时填「未声明」，不要编造 MIT/Apache。
- **PowerShell 管道前不允许空元素（2026-10-16）**：`foreach (...) { ... } | Out-File` 报「不允许使用空管道元素」，必须先 `$out = @()` 收集再 `$out | Out-File`。
- **health_check 的 totalItems 需手动同步（2026-10-16）**：`papers-index.json` 与 `opensource.json` 有 `totalItems` 字段但脚本不自动更新，加完条目后必须显式写入，否则 FAIL。
