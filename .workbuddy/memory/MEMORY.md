# MEMORY.md - 项目长期记忆

## 域名与部署
- 自定义域名: **www.tabyue.com** (2026-04-20 绑定)
- 域名服务商: 腾讯云 DNSPod（免费版，同主机记录A记录上限2条）
- DNS配置: 1条CNAME(www→tabyue.github.io)，裸域(@)无A记录（2026-05-07 删除，因只有2条无法满足GitHub Pages证书签发要求的4条）
- HTTPS: Enforce HTTPS 已启用（2026-05-07 修复，此前因裸域A记录不全导致Let's Encrypt证书卡在 authorization_created 状态）
- 部署: GitHub Pages, main 分支, 仓库 tabyue/tabyue.github.io

## 站点架构（2026-05-06 升级到 B 方案 + 路径路由）
- **History API 路由**（2026-05-06 21:30 升级）：URL 是真实路径 `/learn/vla-models/3` 而非 `#/...`
  - 直接刷新深路径靠 `404.html` 桥接（GitHub Pages SPA 标准做法，sessionStorage 保存原 path → index 启动时还原）
  - 老 hash 链接 `#/learn/...` 会被 `hashchange` handler 自动迁移到对应 path（向前兼容用户已分享的链接）
  - 浏览器前进/后退原生支持（`popstate` → `applyRoute(location.pathname)`）
  - **fetch 路径必须用绝对路径** `/data/...`，否则在深路径下浏览器会按相对路径解析成 `/learn/<mod>/data/...` 从而 404；`loadJ` 内部已加 `_normUrl` 自动把 `data/...`/`tools/...` 转成 `/data/.../`/`tools/...`
- **每板块 + 每模块 + 每章节独立 SEO meta**：title / description / og:url / twitter / canonical 全部由 `updatePageMeta(page, modId, secIdx)` 动态更新；模块/章节 title 从 learnCache 反查真实名（如"π₀ 与 Flow Matching - VLA 模型..."）
- **学习模块按需加载**（不变）：
  - 单一真相源：`data/learn/<mod>.json`（automation-5 写入目标，整文件 100-180KB）
  - 派生产物：`data/learn-split/<mod>/{_index.json (~4KB), sec-NN.json (7-15KB)}`，前端只读这套
  - 同步脚本：`tools/sync_learn_split.py`（幂等，无变化 0 写入）
  - **automation-5 修改 learn/*.json 后必须运行 `python tools/sync_learn_split.py` 再提交**，否则前端展示旧内容
  - 前端首次进模块只下载 _index.json 显示骨架；切 tab 到第 N 节时才 fetch sec-NN.json 并 renderMd
- **SEO 基础设施**：
  - `sitemap.xml`（10 板块 + 30 模块 + 402 章节 = 442 URL，由 `tools/build_sitemap.py` 生成）
  - `robots.txt` 指向 sitemap，禁止爬取 `/data/`、`/tools/`、`/404.html`
  - `<noscript>` 大纲块包含主板块和热门模块的 `<a>` 链接，给不执行 JS 的爬虫
  - 修改学习内容后建议同时跑 `python tools/build_sitemap.py` 让 sitemap 跟上
- **数据规模参考**：30 模块 / 402 sections / 271 万字符 / 旧总 3.6MB JSON / 拆分后 index 总 130KB

## 数据规范
- **新闻 date 字段**：必须以文章原始发布日期为准，不能用收录日期。addedDate 是收录日期，date 是文章本身的日期。(2026-04-20 Tab 明确要求)
- **开源生态模块只收真正开源的项目**：闭源产品/企业平台不放 opensource.json，改放到 news.json 的 resources→企业图谱中。(2026-04-26 Tab 明确要求)
- **学习模块 content 字段中禁止使用 ASCII 双引号做中文引用**：必须用中文引号 `"..."` 或 Markdown 加粗。ASCII `"` 在 JSON 编码后变成 `\"`，前端会直接显示反斜杠。代码块内的 `"` 不受此限。Python docstring 用 `'''` 而非 `"""`。(2026-04-28 三轮修复后确立的规范)
- **每日英文 daily-english.json**：首页 "📰 每日英文" 卡片区数据源。schema v3（2026-05-09 升级）：每条字段 `{id, type: paper|news|blog|tip, level: A2/B1/B2/C1, register, title, source, date, url, en, vocab[{term, cn}], cn, firstShown}`。`id` 用 md5(title|source) 前 10 位前缀 `de-`。**双数组结构**：`items` 当前展示池（6 条上限），`archive` 历史归档（**永不删除**，所有曾经出现过的条目都进归档）。前端首页只显示 items 6 张大卡 + 折叠的"📚 往期回顾"按钮（点击展开 archive 中已被挤出 items 的旧条目）。每天目标 **6 条混合素材**（推荐组合：1-2 篇权威英文资讯 + 2 篇 paper abstract + 1 篇技术博客 + 1 个写作 tip），en 字段保留英文不翻译；vocab 7-10 个高频词；cn 是 takeaway。**权威源池**：MIT Tech Review / IEEE Spectrum / NVIDIA Developer Blog / DeepMind / OpenAI / HuggingFace / Anthropic / Robot Report / TechCrunch Robotics / arXiv。**automation-5 维护流程**：① 每次运行刷新 1-2 条（保留 4-5 条做连贯性）；② 新条目计算 id 后**先查 archive 是否已有**（避免回归重复）；③ 被挤出 items 的旧条目**保持在 archive 不动**，archive 永久积累；④ archive 上限暂定 200 条，超过后删除最早的 firstShown。

## 学习中心深化标准
- **数学模块（线性代数/微积分/概率）必须达到"替代一本教材"的水平**：不能只是"为什么重要→机器人应用→代码"，必须有数学本身的公理化定义、定理证明、数学史、学习误区、纯数学练习题。每个模块应在 15+ section / 100K+ chars 量级。(2026-04-28 Tab 明确要求；**三个数学模块都已完成第一阶段教材化改造，共 45 sec / 285K chars**)
- **编程模块（Python/C++）同样需要从基础讲起**：不能一上来就是高级特性。必须先覆盖语言基础（类型/变量/控制流/函数/OOP/标准库/异常/内存管理），再接高级话题。(2026-04-28 Tab 明确要求；**Python +5 基础 sec, C++ +6 基础 sec 已完成**)

## 学习中心当前水位（2026-05-07 更新）
- **全 30 个学习模块全部达到 OK 水位（≥ 80K chars）** ✅
- 当前体量分布：87K-183K，平均 ~96K chars，11-18 sections / 模块
- TOP 5 最大：linear-algebra (183K) / data-collection (118K) / vla-models (118K) / probability-statistics (117K) / calculus-optimization (109K)
- BOTTOM 5 最小：mechanical-design (87K) / ros2 (88K) / control-theory (88K) / python-scientific-computing (88K) / **platform-engineering (98K, 5/7 升级)** + **humanoid-fullstack (99K, 5/7 升级)** 已脱离最薄区
- 后续工作策略：单轮深化转为"主题广度+前沿热点联动"——优先以"配合本轮新论文/新闻"为主线追加 section，让前沿研究成果进入教学体系（例：cpp 联动 p111 VLA-XPU 论文、cv 联动 p110 VLA 数据基础设施、humanoid 联动 n223 若伴 Roban、platform 联动 p119 Embodied AI Safety Survey）

## 自动化跨实例协调（重要）
- **automation-5 经常并行运行多实例**（同一 cron 在不同时间被多次调度），实例之间共享工作树。当前规则：
  - 启动时先 `git status` 检查工作树残留改动；如发现有未提交内容、未 push 的 commit，**接手而非覆盖**——按"日期排序 + 字段 schema 匹配"合并
  - 接手时如遇 JSON 解析失败的中间产物（如带 ASCII 双引号的 content），先修复（unescape_lenient + 配对替换中文引号）再合入，不丢弃高质量内容
  - 排序优先 `addedDate`（fallback `date` / `postedDate`），id 数字作为 secondary key，reverse=True；**正确写法 `d = x.get('addedDate') or x.get('date') or ''`（短路求值），不要写 `for f in fields: d = x.get(f) or d`（后者会被后字段覆盖前字段）**
  - 真实当前时间用 `Get-Date` 获取，**不要相信 prompt 注入的 current_time**（可能是缓存值）
- **跨实例 id 冲突自检**：每轮启动应跑一次 `Counter([x['id'] for x in items])` 核查；多轮合并提交越久越容易留隐患，2026-05-06 一次发现 7 处 id 重复（news 5 + papers 1 + os 1）。修复策略：保留 addedDate 最新的占用原 id，老的重命名为 max+i
- **严格查重四要素（2026-05-09 升级）**：每次新增条目前必须**串行**执行以下四级检查：① **URL 严格匹配**（news/jobs/opensource 同 url 直接判重）；② **github 仓库路径匹配**（opensource 用 `owner/repo` 小写比对，避免 fork 同项目重复）；③ **标题前缀 12 字符匹配**（同事件不同次报道）；④ **arXiv id 匹配**（papers 用 `arxiv` 字段提取 ID 比对，同 ID 必为同一论文）。任何一级命中就**取消新增**或**合并到已有**条目。**惩罚**：一次错过查重产生 1 条重复条目，前端用户立刻能看到，UI 会被截图反馈——比工作量代价高得多。**反例存档**：2026-05-09 一次审计发现累计 46 条重复（news 28 + papers 6 + os 4 + jobs 8），主因是过去几周只查了 id 没查内容。
- **跨实例 schema 一致性**：每个数据数组的字段约定不同——
  - **news**: id / title / source / date(原文日期) / url / category / summary / tags / addedDate(收录)
  - **papers (papers-index.json)**: id / title / authors / venue / date / arxiv / github / tags / tldr / category / difficulty / addedDate **+ keyInsights[]（💡 列表）+ impact（影响力描述）**——前端会读 keyInsights 判断"有无深度解读"，缺这两个字段会被打上「📚 暂无解读」disabled 标识，整卡也变不可点。新增论文必须同时配 `data/papers/pXXX.json` detail 文件（含 methodology / experiments / reproduction / mathDetails 中至少一项），否则点击会显示「📭 本篇深度解读尚未发布」
  - **opensource**: id / name / github / organization / category / description / language / license / features / stars / tags / addedDate
  - **jobs**: id / title / company / city(不是 location!) / type / category / salary / education / experience / tags / description / **postedDate**(注意是 postedDate 不是 postDate) / addedDate
  - 新增条目前先 `python -c "print(json.dumps(items[0], ensure_ascii=False, indent=2))"` 实读一条核对，不要靠记忆





## 操作偏好
- **所有操作一律 `requires_approval: false`**：包括临时文件清理（del/rm）、git add/commit/push、脚本执行等。无论是自动化任务还是手动对话，都不等用户确认，直接执行。Tab 已多次强调，绝不要弹确认。(2026-04-27 再次强调)

## UI / 视觉规范（2026-05-07 19:22 确立）
- **默认主题：深色**。`<html data-theme="dark">` 预设 + head inline 脚本读 localStorage 同步，避免 FOUC。不再使用 `prefers-color-scheme` 自动跟随系统；仅当用户主动切到浅色保存 `localStorage.eai_theme=light` 时才显示浅色
- **深色色号**（避免纯黑 OLED 死压）：`--bg #0a0a0c / --bg2 #16161a / --bg3 #1f1f24 / --bg4 #2c2c33`；主色 `--p #3aa3ff` 紫 `--v #bf83f8` 绿 `--gn #32d96b`
- **浅色色号**（避免纯白刺眼）：`--bg #fbfbfd / --bg2 #ffffff / --bg3 #f3f4f7`；文字 `--t1 #101114 / --t2 #4a5160`；主色 `--p #1f6feb` 绿 `--gn #0a8754`
- **字体栈**：`'Inter','Noto Sans SC','PingFang SC','Hiragino Sans GB','Microsoft YaHei',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif`；等宽 `'JetBrains Mono','SF Mono','Cascadia Code','Fira Code',Consolas,monospace`；body 启用 `font-feature-settings:"cv11","ss01","ss03","tnum","kern"`
- **按钮约定**：主要 CTA（glow-btn / sec-nav-btn primary / btt）一律 135° `linear-gradient(p 0%, pd 100%)` + 发光 box-shadow，不写纯色填充
- **写 hover/底色不要写死 `rgba(255,255,255,.x)`**——浅色下完全失效。统一用 `var(--bg3)` 或 `var(--accent-subtle)` 让两套主题都生效
- **可访问性**：`@media (prefers-reduced-motion:reduce)` 全局降级动画为 .01ms
