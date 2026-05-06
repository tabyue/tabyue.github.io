# MEMORY.md - 项目长期记忆

## 域名与部署
- 自定义域名: **www.tabyue.com** (2026-04-20 绑定)
- 域名服务商: 腾讯云 DNSPod（免费版，同主机记录A记录上限2条）
- DNS配置: 2条A记录(@→185.199.108/109.153) + 1条CNAME(www→tabyue.github.io)
- 部署: GitHub Pages, main 分支, 仓库 tabyue/tabyue.github.io

## 数据规范
- **新闻 date 字段**：必须以文章原始发布日期为准，不能用收录日期。addedDate 是收录日期，date 是文章本身的日期。(2026-04-20 Tab 明确要求)
- **开源生态模块只收真正开源的项目**：闭源产品/企业平台不放 opensource.json，改放到 news.json 的 resources→企业图谱中。(2026-04-26 Tab 明确要求)
- **学习模块 content 字段中禁止使用 ASCII 双引号做中文引用**：必须用中文引号 `"..."` 或 Markdown 加粗。ASCII `"` 在 JSON 编码后变成 `\"`，前端会直接显示反斜杠。代码块内的 `"` 不受此限。Python docstring 用 `'''` 而非 `"""`。(2026-04-28 三轮修复后确立的规范)

## 学习中心深化标准
- **数学模块（线性代数/微积分/概率）必须达到"替代一本教材"的水平**：不能只是"为什么重要→机器人应用→代码"，必须有数学本身的公理化定义、定理证明、数学史、学习误区、纯数学练习题。每个模块应在 15+ section / 100K+ chars 量级。(2026-04-28 Tab 明确要求；**三个数学模块都已完成第一阶段教材化改造，共 45 sec / 285K chars**)
- **编程模块（Python/C++）同样需要从基础讲起**：不能一上来就是高级特性。必须先覆盖语言基础（类型/变量/控制流/函数/OOP/标准库/异常/内存管理），再接高级话题。(2026-04-28 Tab 明确要求；**Python +5 基础 sec, C++ +6 基础 sec 已完成**)

## 学习中心当前水位（2026-05-06 更新）
- **全 30 个学习模块全部达到 OK 水位（≥ 80K chars）** ✅：4-5 月分批次完成，最后两块 cpp-fundamentals (86.4K) 和 computer-vision (82.3K) 在 2026-05-06 automation 中完成
- 当前体量分布：82K-183K，平均 ~95K chars，11-18 sections / 模块；最大 linear-algebra (183K)，最小 cv (82K)
- 后续工作策略：单轮深化转为"主题广度+前沿热点联动"——优先以"配合本轮新论文/新闻"为主线追加 section，让前沿研究成果进入教学体系（例：cpp 联动 p111 VLA-XPU 论文、cv 联动 p110 VLA 数据基础设施综述）

## 自动化跨实例协调（重要）
- **automation-5 经常并行运行多实例**（同一 cron 在不同时间被多次调度），实例之间共享工作树。当前规则：
  - 启动时先 `git status` 检查工作树残留改动；如发现有未提交内容、未 push 的 commit，**接手而非覆盖**——按"日期排序 + 字段 schema 匹配"合并
  - 排序优先 `addedDate`（fallback `postDate`/`date`），id 数字作为 secondary key，reverse=True
  - 真实当前时间用 `Get-Date` 获取，**不要相信 prompt 注入的 current_time**（可能是缓存值）
- **跨实例 schema 一致性**：每个数据数组都有自己的字段约定（如 jobs 用 city/postDate/addedDate/education，不是 location/postedDate）。新增条目前先读一条已存在条目核对 schema





## 操作偏好
- **所有操作一律 `requires_approval: false`**：包括临时文件清理（del/rm）、git add/commit/push、脚本执行等。无论是自动化任务还是手动对话，都不等用户确认，直接执行。Tab 已多次强调，绝不要弹确认。(2026-04-27 再次强调)
