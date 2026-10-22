# MEMORY.md - 项目长期记忆（具身智能知识门户 tabyue.github.io）

## 部署与域名
- 域名 **www.tabyue.com**（腾讯云 DNSPod，CNAME www→tabyue.github.io；裸域无 A 记录）
- GitHub Pages，main 分支，仓库 tabyue/tabyue.github.io；Enforce HTTPS 已启用
- sitemap.xml 由 `tools/build_sitemap.py` 生成（2026-10-08: 10 板块 + 32 模块 + 500 章节）；robots.txt 禁爬 /data/ /tools/ /404.html

## 站点架构
- **History API 路由**：真实路径 `/learn/vla-models/3`；深路径刷新靠 `404.html` + sessionStorage 桥接；老 hash 链接自动迁移；`popstate` → `applyRoute`
- **fetch 必须用绝对路径** `/data/...`（深路径下相对路径会解析成 `/learn/<mod>/data/...` 404）；`loadJ` 内 `_normUrl` 自动转换
- **SEO**：`updatePageMeta(page, modId, secIdx)` 动态写 title/description/og/canonical；`<noscript>` 大纲给爬虫
- **学习模块**：真相源 `data/learn/<mod>.json` → 派生 `data/learn-split/<mod>/{_index.json, sec-NN.json}`，前端只读后者。**改动 learn 后必跑 `python tools/sync_learn_split.py` 再提交**
- **renderMd 链接**：`[txt](/path)` 生成 `data-spa="1"` 走 SPA 跳转；外部链接 `target="_blank"`。文档里做模块间跳转用这套语法
- **UI 规范**：默认深色（`#0a0a0c/#16161a/#1f1f24/#2c2c33`，主色 `#3aa3ff`）；顶层容器统一 `max-width:1400px`；hover 底色用 `var(--bg3)` 别写死 rgba(255,...)

## 数据规范（踩坑代价排序）
1. **category 必须取自前端白名单，禁止自创**——越界项目在页面上**完全不可见**（不报错、不影响校验，纯静默失效）
   - opensource（8）: `simulation / ai-model / framework / locomotion / perception / hardware / data-tools / ai-agent-framework`
   - news（6）: `融资创投 / 技术突破 / 产业动态 / 政策标准 / 学术研究 / 全球视野`
   - jobs.category（5）: `算法研究 / 工程开发 / 硬件机械 / 产品运营 / 实习`；jobs.type: `社招 / 校招 / 实习`（不写「全职」）
   - 细分信息放 tags
2. **新闻 `date` = 文章原始发布日期**，`addedDate` = 收录日期（2026-04-20 Tab 明确）
3. **content 字段禁用 ASCII 双引号做中文引用**（会变成 `\"`）；代码块内不限；**Python 脚本里写学习正文时，示例代码的 docstring 必须用 `'''` 而非 `"""`**，否则会提前终止外层 `u"""..."""` 字符串
4. **前端渲染模板认的字段名才是真 schema**：新增/改字段前先读 index.html 的渲染模板（曾因 `p.org` vs `organization` 导致 45% 卡片显示 undefined）
5. **opensource 只收真正开源的项目**；闭源产品放 news.json 的 resources→企业图谱
6. **新增 opensource 条目必须同时产出两件产物**，否则 health_check FAIL：
   - `data/opensource/<id>.json`（overview / architecture / quickStart / performance / comparison / keyPapers）
   - `data/opensource/reports/<id>.html` — 用 `tools/gen_os_report.py <id>` 生成（依赖 `markdown` 包；已装在 venv `C:\Users\tabyue\.workbuddy\binaries\python\envs\default\Scripts\python.exe`，用该解释器跑）
   - 缺报告页 = 前端「完整报告」按钮 404
7. **每日英文 daily-english.json**：双数组 `items`（展示池 6 条）+ `archive`（永不删除）；每条 `{id(de-md5前10位), type, level, register, title, source, date, url, en, vocab[], cn, firstShown}`；每次刷新 1-2 条，新条目先查 archive 防回归

## 各数组字段约定
- **news**: id / title / source / date / url / category / summary / tags / addedDate
- **papers**: id / title / authors / venue / date / arxiv / github / tags / tldr / category / difficulty / addedDate + **keyInsights[] + impact**（缺了前端打「📚 暂无解读」且整卡不可点）+ 必须配 `data/papers/pXXX.json`（methodology/experiments/reproduction/mathDetails）
- **opensource**: id / name / github / organization / **org** / category / description / language / license / features / stars / tags / addedDate
- **jobs**: id / title / company / **city（不是 location）** / type / category / salary / education / experience / tags / description / **postedDate + postDate 都要写** / addedDate / url / source
- 新增前先 `json.dumps(items[0])` 实读一条核对，别靠记忆

## 查重（每次新增必做，串行）
① URL 严格匹配 ② github `owner/repo` 小写比对 ③ arXiv id 比对 ④ 标题相似度 ⑤ **同日同事件：按 date 分组 + title+summary 字符 3-gram 包含度 ≥ 0.4**
- ③④ 既漏检又误报：同事件不同媒体措辞差异极大；同公司不同事件会撞前缀
- ⚠️ ⑤ 在**同一天有多条新条目**时会误报（2026-10-08 一次误杀 Counterpoint 出货条目）。命中后必须人工复核再决定是否跳过
- 合并重复：保留信息最全的一条 → 把被删条目的独有事实追加进 summary → tags/source 取并集 → 删 detail 与报告页 → 更新 totalItems

## 提交前必跑
```
python tools/normalize_learn.py        # learn 有改动时：标题/正文/派生字段规范化
python tools/fix_learn_links.py --dry  # 有修正项再去掉 --dry
python tools/sync_learn_split.py      # learn 有改动时
python tools/build_sitemap.py         # 章节数变化时
python tools/health_check.py          # 必须 ALL OK
python tools/verify_learn_structure.py # 必须 ALL OK（结构守卫，查 health_check 查不到的）
```
health_check 覆盖：JSON 解析 / id 唯一 / 内容查重 / category 白名单 / totalItems / 开源详情+报告页 / 论文 detail+keyInsights / learn-split 一致性 / 全量章节内链 / ASCII 双引号
- **收尾清理临时脚本必须用 `git rm`，不能只 `Remove-Item`**：`git add -A` 会把根目录 `_*.py` 临时脚本一起提交进仓库（2026-10-20 中招）。保留 `_add_two.py` / `_cv_sec.md` / `_desktop_sec.md`（历史 tracked，误删过）
- 学习中心体检脚本思路（可复用）：按模块统计 节数/总字数/均字数/薄章(<3000)/长章(>15000)/tier单调性/入门占比/前3节难度与字数/二级标题数

## 学习中心
- **32 模块，核心原则：内容完整性 > 字数**（2026-05-29 Tab 明确，不要盲目追 100K）
- 现状（2026-10-08）：vla-models 226K/25 sec、humanoid-fullstack 137K、ai-infra 111K/24 sec；最薄 ~93K（embodied-data-engineering）；sitemap 500 章节
- 策略：**配合本轮新论文/新闻联动追加 section**，让前沿成果进入教学体系
- 「AI Infra 具身基础设施」(id=ai-infra) 是混合型模块：A 类跳转章节（仅简介+深链）/ B 类跨模块整合 / C 类独家内容，设计原则是 0 内容重复。**2026-10-20 已把 8 个 A 类残章（546-795 字）补到 2786-3727 字**——纯跳转空页太劝退，跳转入口保留但前面必须有能独立学到的正文
- **`tools/restructure_learn.py:short_of()` 的切分字符集禁止再包含 ASCII 连字符 `-`**（2026-10-20 已修）。含它会把 `KV-Cache`→`KV`、`Sim-to-Real`→`Sim`、`Wall-OSS`→`Wall`、`CLF-RL`→`CLF`、`Newton-Euler`→`Newton` 切成碎片，大纲页/侧边栏直接不可读。现用 `SPLIT_RE=[：:｜|—–（(]` + `_is_fragment()` 回退
- **章节顺序约束（硬）**：大纲页按 tier 分组渲染、组内保持数组原序。`/learn/<mod>/<n>` 的 n 就是数组下标，所以
  1. **tier 必须单调不减**——非单调会让大纲页章节顺序错乱（academic-english / cloud-edge / world-models-llm 曾中招，用 isotonic 抬升修正，只改 tier 值不动顺序）
  2. **新增章节只能在末尾 append，禁止插到中间/开头**——插中间会让后续编号全部平移，站内硬编码内链 `/learn/x/N` 集体失效 → health_check [9] FAIL
  3. 要改善某模块开局的陡峭度，**原地扩写第 1 节**，不要插入新章节
- 数学与编程模块要求教材级（公理化定义、定理证明、数学史、误区、习题）
- **模块/章节命名要 ASCII 友好**，避免 emoji 与中文括号污染 modId
- 每轮深化后必须同步 3 处 lastUpdated：learn/*.json 顶层 + learning-path.json 对应模块（modules[].lastUpdated，用 `name` 匹配）+ 新增 section 自身
- **2026-10-13 结构性重构**：29/32 模块章节已按 tier(0基础/1核心/2进阶/3前沿) 重排为教学梯度，全部章节有 difficulty(入门/中级/高级)/estimatedMinutes/shortTitle/isFrontier/isBrief。**以后新增章节一律 append 到对应 tier 的位置（前沿专题放尾部），禁止再 unshift 到开头**。重排工具 `tools/restructure_learn.py`（幂等，输入 `tools/learn_sort_plan/`）；前端 `/learn/<mod>` 现在是模块大纲页，`/learn/<mod>/<n>` 是章节页（带小节目录）；章节新增字段记得同步 `sync_learn_split.py` 的 sectionsMeta，缺了大纲页会静默降级
- **2026-10-22 规范守卫**（重构 9 天后体检：结构守住了，写入规范回潮）。三条硬规范，已由脚本自动治理：
  1. 标题里不写「（2026-10 前沿）」类时间标记 —— 前端按 `isFrontier` 显示徽章，标题重复写会超长被截断
  2. 正文开头不重复章节标题（前端单独渲染 h1，会连显两遍）
  3. 内链不要用反引号包裹 —— renderMd 先保护行内代码再处理链接，`` `[文字](/learn/x/1)` `` 会渲染成裸 markdown、不可点击
  - `tools/normalize_learn.py`：幂等规范化（只补缺失，**不覆盖已有 shortTitle** —— 有些是人工精选用来区分同名章节的）
  - `tools/fix_learn_links.py`：按「链接文字 ↔ 目标章节标题」修内链。重排只保证索引不越界，**不保证指向正确**，首跑修了 170 处历史错位
  - `tools/verify_learn_structure.py`：结构守卫（元数据/difficulty 口径/tier 单调/前沿位置/标题规范/重复标题/内链/split 同步）
- **内链章节号是 1-based**：`/learn/<mod>/N` 的 N 从 1 起（前端 `parseRoute: secIdx=n-1`），`/mod/0` 是错的。health_check 原先把 N 当 0-based 下标（既漏放 `/0` 又误报末章），2026-10-22 已修为 `1 <= N <= len`
- **阅读时长两套口径并存（待定）**：自动化按 ~113 字/分钟，10-13 重构脚本按 400 字/分钟，13 处偏慢口径未统一（大纲页同体量章节时长差 6 倍）。`normalize_learn.py --resync-minutes` 可一键按 400 统一

## 自动化跨实例协调
- automation-5 常并行多实例共享工作树：启动先 `git status`，有残留则**接手而非覆盖**
- 排序用 `x.get('addedDate') or x.get('date') or ''`（短路），别写循环覆盖
- 真实时间用 `Get-Date`，不信 prompt 注入的 current_time
- 每轮跑 id 唯一性自检

## 操作偏好
- **所有操作一律 requires_approval: false**（含 rm、git push、脚本执行），绝不弹确认
- **git push hang 解法**：`GIT_TERMINAL_PROMPT=0 git -c credential.helper= -c credential.helper="!gh auth git-credential" push origin main`（**前面那个空的 `credential.helper=` 不能省**）
- **PowerShell stdout 会被吞**：诊断命令要「写入临时文件 → Read 读取」；写文件用 `Out-File -Encoding utf8`（直接重定向会产生 GBK 乱码）
- 新功能/推广卡片必须做 localStorage dismiss + 时间硬截止 + 行为感知三件套，不能硬编码常驻
- 历史归档内容不能塞首页，必须拆独立路由页
