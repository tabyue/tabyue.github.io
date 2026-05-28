"""从 data/opensource/{id}.json 生成独立 HTML 报告（支持浏览器在线阅读 + Ctrl+P 打印为 PDF）"""
import json, sys
from pathlib import Path
import markdown
from markdown.extensions.tables import TableExtension
from markdown.extensions.fenced_code import FencedCodeExtension

ROOT = Path('c:/Users/tabyue/WorkBuddy/Embodied-AI-Knowledge-Hub/tabyue.github.io')

def generate_report_html(project_id):
    detail_file = ROOT / f'data/opensource/{project_id}.json'
    if not detail_file.exists():
        print(f'ERROR: {detail_file} not found')
        return None
    
    detail = json.load(open(detail_file, encoding='utf-8'))
    
    # 从 opensource.json 获取项目基本信息
    os_data = json.load(open(ROOT / 'data/opensource.json', encoding='utf-8'))
    project = next((p for p in os_data['projects'] if p['id'] == project_id), {})
    
    # 组装 Markdown
    md_parts = []
    md_parts.append(f"# {project.get('name', project_id)}\n")
    md_parts.append(f"## 深度分析报告\n")
    md_parts.append(f"> **GitHub**: [{project.get('github', '')}]({project.get('github', '')})  \n")
    md_parts.append(f"> **Stars**: {project.get('stars', '')} · **License**: {project.get('license', '')} · **收录日期**: {project.get('addedDate', '')}  \n")
    md_parts.append(f"> **组织**: {project.get('organization', project.get('org', ''))}  \n")
    md_parts.append(f"> **报告生成**: 具身智能知识门户 www.tabyue.com · {__import__('datetime').date.today()}\n\n---\n\n")
    
    # 按 section 顺序渲染
    sections = ['overview', 'architecture', 'algorithms', 'models', 'environments', 
                'codeWalkthrough', 'keyPapers', 'quickStart', 'performance', 
                'industryAdoption', 'comparison', 'teamAndCommunity']
    
    for key in sections:
        if key in detail and detail[key]:
            md_parts.append(detail[key])
            md_parts.append("\n\n---\n\n")
    
    md_content = '\n'.join(md_parts)
    
    # Markdown → HTML
    html_body = markdown.markdown(md_content, extensions=[
        TableExtension(),
        FencedCodeExtension(),
        'markdown.extensions.toc',
    ])
    
    # 完整 HTML 文件（含打印优化 CSS）
    title = project.get('name', project_id)
    full_html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title} — 深度分析报告 | 具身智能知识门户</title>
<style>
:root {{
    --bg: #0a0a0c; --bg2: #16161a; --bg3: #1f1f24; --bg4: #2c2c33;
    --t1: #f0f0f5; --t2: #b8b8c8; --t3: #7a7a8c;
    --p: #3aa3ff; --gn: #32d974; --pk: #ff6b9d;
}}
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
body {{
    font-family: 'Inter', -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif;
    background: var(--bg); color: var(--t1);
    line-height: 1.7; padding: 40px 20px;
    max-width: 900px; margin: 0 auto;
}}
h1 {{ font-size: 1.8rem; color: var(--p); margin: 32px 0 12px; }}
h2 {{ font-size: 1.4rem; color: var(--t1); margin: 28px 0 12px; border-bottom: 1px solid var(--bg4); padding-bottom: 6px; }}
h3 {{ font-size: 1.15rem; color: var(--t2); margin: 20px 0 8px; }}
h4 {{ font-size: 1rem; color: var(--t2); margin: 16px 0 6px; }}
p {{ margin: 8px 0; }}
a {{ color: var(--p); text-decoration: none; }}
a:hover {{ text-decoration: underline; }}
strong {{ color: var(--p); font-weight: 600; }}
code {{
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 0.85em; background: var(--bg3);
    padding: 2px 6px; border-radius: 3px; color: #e0e0e0;
}}
pre {{
    background: #1e1e2e; color: #cdd6f4;
    padding: 16px 20px; border-radius: 8px;
    overflow-x: auto; font-size: 0.82rem; line-height: 1.5;
    margin: 12px 0; border: 1px solid var(--bg4);
}}
pre code {{ background: none; padding: 0; color: inherit; }}
table {{ border-collapse: collapse; width: 100%; margin: 16px 0; font-size: 0.88rem; }}
th {{ background: var(--bg3); color: var(--p); padding: 10px 12px; text-align: left; font-weight: 600; }}
td {{ border: 1px solid var(--bg4); padding: 8px 12px; }}
tr:nth-child(even) {{ background: var(--bg2); }}
blockquote {{
    border-left: 3px solid var(--p); padding: 8px 16px;
    color: var(--t2); margin: 12px 0; background: var(--bg2); border-radius: 0 6px 6px 0;
}}
hr {{ border: none; border-top: 1px solid var(--bg4); margin: 24px 0; }}
ul, ol {{ padding-left: 24px; margin: 8px 0; }}
li {{ margin: 4px 0; }}

/* 顶部工具栏 */
.toolbar {{
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: var(--bg2); border-bottom: 1px solid var(--bg4);
    padding: 10px 20px; display: flex; align-items: center; gap: 12px;
}}
.toolbar a, .toolbar button {{
    padding: 6px 14px; border-radius: 6px; font-size: 0.85rem;
    cursor: pointer; text-decoration: none; border: none;
}}
.toolbar .btn-back {{ background: var(--bg3); color: var(--t2); }}
.toolbar .btn-back:hover {{ background: var(--bg4); }}
.toolbar .btn-print {{ background: var(--p); color: #fff; }}
.toolbar .btn-print:hover {{ opacity: 0.9; }}
.toolbar .title {{ flex: 1; font-size: 0.9rem; color: var(--t3); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }}

body {{ padding-top: 60px; }}

/* 打印样式 */
@media print {{
    :root {{ --bg: #fff; --bg2: #f8f9fa; --bg3: #eee; --bg4: #ddd; --t1: #1a1a1a; --t2: #333; --t3: #666; --p: #0056b3; }}
    body {{ background: #fff; color: #1a1a1a; padding: 0; max-width: 100%; font-size: 10pt; }}
    .toolbar {{ display: none; }}
    pre {{ background: #f4f4f4; color: #333; border: 1px solid #ddd; font-size: 8pt; }}
    code {{ background: #f0f0f0; color: #333; }}
    table {{ font-size: 9pt; }}
    th {{ background: #0056b3; color: #fff; }}
    td {{ border-color: #ccc; }}
    tr:nth-child(even) {{ background: #f8f9fa; }}
    h1 {{ color: #0056b3; }}
    strong {{ color: #0056b3; }}
    a {{ color: #0056b3; }}
    blockquote {{ background: #f8f9fa; border-left-color: #0056b3; }}
    @page {{ size: A4; margin: 1.5cm; }}
}}
</style>
</head>
<body>
<div class="toolbar">
    <a href="/" class="btn-back">← 返回门户</a>
    <span class="title">{title} — 深度分析报告</span>
    <button class="btn-print" onclick="window.print()">🖨️ 打印 / 保存 PDF</button>
</div>
{html_body}
<footer style="margin-top:40px;padding:20px 0;border-top:1px solid var(--bg4);text-align:center;font-size:0.8rem;color:var(--t3)">
    具身智能知识门户 · www.tabyue.com · 本报告由 AI 自动生成，仅供学习研究参考
</footer>
</body>
</html>"""
    
    output_path = ROOT / f'data/opensource/reports/{project_id}.html'
    output_path.write_text(full_html, encoding='utf-8')
    
    print(f'HTML report generated: {output_path} ({output_path.stat().st_size / 1024:.1f} KB)')
    return output_path

if __name__ == '__main__':
    pid = sys.argv[1] if len(sys.argv) > 1 else 'os115'
    generate_report_html(pid)
