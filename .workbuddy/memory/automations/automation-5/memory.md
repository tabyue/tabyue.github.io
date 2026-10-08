# automation-5 执行记忆

## 任务
更新具身智能知识门户内容：投稿箱处理 → 学习模块正文扩展 → 新闻/论文/开源更新 → 招聘 → 资源导航 → 提交。

## 执行历史

### 2026-10-08 16:15—17:10
- 投稿箱：5 个 Issue 全部已关闭，无新投稿。
- 数据：新闻 +10（n354—n363）、论文 +5（p185—p189，含 detail）、开源 +4（os137—os140，含 detail + 报告页）、招聘 +5（j162—j166）、资源导航 r001 扩充 + 新增 r004。
- 学习：vla-models +第 25 节（部署鲁棒性与运行时保障，9.7K）、training-inference-optimization +第 17 节（推理效率三路线，10.5K）；修复 vla-models 第 6 节缺 title。
- 校验：sync_learn_split + build_sitemap（500 章节）+ health_check → ALL OK；已 push。

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
- 同日同事件查重会误报（同一天多条新条目），命中后人工复核
- PowerShell 输出必须 `Out-File -Encoding utf8`，否则 GBK 乱码
- PowerShell stdout 常被吞，诊断结果写临时文件再 Read
