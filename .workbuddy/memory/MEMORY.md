# MEMORY.md - 项目长期记忆

## 域名与部署
- 自定义域名: **www.tabyue.com** (2026-04-20 绑定)
- 域名服务商: 腾讯云 DNSPod（免费版，同主机记录A记录上限2条）
- DNS配置: 2条A记录(@→185.199.108/109.153) + 1条CNAME(www→tabyue.github.io)
- 部署: GitHub Pages, main 分支, 仓库 tabyue/tabyue.github.io

## 数据规范
- **新闻 date 字段**：必须以文章原始发布日期为准，不能用收录日期。addedDate 是收录日期，date 是文章本身的日期。(2026-04-20 Tab 明确要求)

## 操作偏好
- **自动化任务（automation-5 等）中的所有操作**：`requires_approval` 一律设为 `false`，包括但不限于临时文件清理、git add/commit/push、脚本执行等。不等用户确认，直接执行。Tab 已多次强调。(2026-04-26)
