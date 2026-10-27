# -*- coding: utf-8 -*-
"""学习中心正文内容体检（只读，可每轮重复跑）。

与 verify_learn_structure.py 分工：那个查结构/元数据，这个查「正文写得对不对」。
检查项（均为确定性规则，不做主观评价）：

  F1 代码围栏未闭合            —— 后续整章都会被渲染成代码
  F2 Python 代码块语法错误      —— ast.parse；跳过明显的伪代码/片段（含 ... 占位、>>> 交互）
  F3 公式解析失败               —— 用与站点同版本 KaTeX（node）离线渲染，throwOnError
  F4 表格列数不一致             —— 某行列数与表头不同，渲染错位
  F5 占位/待补文本              —— TODO/TBD/xxx 编号/「待补充」/(#) 空锚点
  F6 章内重复段落               —— 同章出现 ≥120 字完全相同的段落
  F7 练习无答案                 —— 有「练习」小节但全章没有答案/提示/参考
  F8 空小节                     —— 标题后紧跟同级或更高级标题，中间无内容
  F9 $ 符号未配对               —— 正文（非代码）中奇数个 $，公式会吞掉后文

用法：
    python tools/audit_learn_content.py                  # 全量，报告写 .workbuddy/validation/learn-content-audit.json
    python tools/audit_learn_content.py --module ros2    # 只查一个模块
    python tools/audit_learn_content.py --no-katex       # 跳过公式检查（无 node/katex 时）
退出码：存在 F1/F2/F3/F4/F9 等硬缺陷时为 1。
"""
import argparse
import ast
import io
import json
import os
import re
import shutil
import subprocess
import sys
from collections import Counter, defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LEARN = os.path.join(ROOT, 'data', 'learn')
OUT = os.path.join(ROOT, '.workbuddy', 'validation', 'learn-content-audit.json')
HARD = {'F1', 'F2', 'F3', 'F4', 'F9', 'F10'}

FENCE_OPEN = re.compile(r'^ {0,3}((?:>[ \t]?)*)(`{3,}|~{3,})(.*)$')
PLACEHOLDER = re.compile(
    r'(\bTODO\b|\bTBD\b|\bFIXME\b|待补充|待完善|此处补充|arXiv\s*\d{4}\.x{2,}|\]\(#\))', re.I)
ANSWER_HINT = re.compile(r'(参考答案|答案|解答|提示|思路|Answer|Solution|Hint)', re.I)
EXERCISE_HEAD = re.compile(r'^#{1,6}\s*.*(练习|习题|思考题|Exercise)', re.M)


def split_blocks(content):
    """返回 (prose_text, code_blocks[(lang, code, line_no)], unclosed_line_or_None)。"""
    lines = content.replace('\r\n', '\n').split('\n')
    prose, blocks = [], []
    i = 0
    while i < len(lines):
        m = FENCE_OPEN.match(lines[i])
        if not m:
            prose.append(lines[i])
            i += 1
            continue
        prefix, fence, info = m.group(1), m.group(2), m.group(3)
        lang = (info.strip().split() or ['text'])[0].lower()
        start = i
        body = []
        i += 1
        closed = False
        while i < len(lines):
            line = re.sub(r'^ {0,3}(?:>[ \t]?)+', '', lines[i]) if prefix else lines[i]
            c = re.match(r'^ {0,3}(`{3,}|~{3,})[ \t]*$', line)
            if c and c.group(1)[0] == fence[0] and len(c.group(1)) >= len(fence):
                closed = True
                break
            body.append(line)
            i += 1
        if not closed:
            return '\n'.join(prose), blocks, start + 1
        blocks.append((lang, '\n'.join(body), start + 1))
        prose.append('%%CODE%%')
        i += 1
    return '\n'.join(prose), blocks, None


def strip_inline_code(text):
    return re.sub(r'`[^`\n]*`', '', text)


def python_like(lang):
    return lang in ('python', 'py', 'python3')


def looks_like_fragment(code):
    s = code.strip()
    return (not s or '>>>' in s or re.search(r'^\s*\.\.\.\s*$', s, re.M) is not None
            or re.search(r'#\s*\.\.\.', s) is not None or '<' in s.split('\n')[0][:2])


def check_python(code):
    try:
        ast.parse(code)
        return None
    except SyntaxError as e:
        # 允许伪代码里的 `...` 省略号段落、类型注解占位
        if looks_like_fragment(code):
            return None
        return 'line %s: %s' % (e.lineno, e.msg)


def extract_math(prose):
    """抽出 $$...$$ 与 $...$ 公式，顺序与站点 renderMd 一致（先块后行内）。"""
    t = strip_inline_code(prose)
    out = []
    for m in re.finditer(r'\$\$([\s\S]*?)\$\$', t):
        out.append((m.group(1).strip(), True))
    t2 = re.sub(r'\$\$[\s\S]*?\$\$', ' ', t)
    for m in re.finditer(r'\$([^\$\n]+?)\$', t2):
        out.append((m.group(1).strip(), False))
    rest = re.sub(r'\$([^\$\n]+?)\$', ' ', t2)
    # 货币/环境变量写法 $5、$HOME 不算公式；只统计孤立的 $
    lone = len(re.findall(r'(?<![\\\w])\$(?![\d{A-Z_])', rest))
    return out, lone


def site_cells(row):
    """与 index.html renderMd 表格规则一致：l.split('|').filter(x=>x.trim())。
    站点不识别 \\| 转义，单元格里任何 | （含 $|x|$、\\|x\\|）都会被切开。"""
    return [c for c in row.split('|') if c.strip()]


def table_issues(prose):
    issues = []
    lines = prose.split('\n')
    i = 0
    while i < len(lines):
        if lines[i].strip().startswith('|') and i + 1 < len(lines) and re.match(r'^\s*\|[\s:\-|]+\|\s*$', lines[i + 1]):
            n = len(site_cells(lines[i].strip()))
            j = i + 2
            while j < len(lines) and lines[j].strip().startswith('|'):
                row = lines[j].strip()
                cells = site_cells(row)
                if len(cells) != n:
                    issues.append('表头%d列，第%d行%d列: %s' % (n, j - i - 1, len(cells), row[:60]))
                j += 1
            i = j
        else:
            i += 1
    return issues


def empty_sections(prose):
    issues = []
    lines = [l for l in prose.split('\n')]
    heads = [(i, len(m.group(1)), m.group(2).strip()) for i, l in enumerate(lines)
             for m in [re.match(r'^(#{1,6})\s+(.+)$', l.strip())] if m]
    for (i, lv, title), nxt in zip(heads, heads[1:] + [(len(lines), 0, '')]):
        j, nlv, _ = nxt
        body = '\n'.join(lines[i + 1:j]).strip()
        if not body and nlv <= lv and j < len(lines):
            issues.append(title[:40])
    return issues


def dup_paragraphs(prose):
    paras = [re.sub(r'\s+', ' ', p).strip() for p in re.split(r'\n\s*\n', prose)]
    c = Counter(p for p in paras if len(p) >= 120 and not p.startswith('|'))
    return [p[:60] for p, n in c.items() if n > 1]


def run_katex(formulas):
    """formulas: list[(key, tex, display)] -> dict key->error"""
    node = shutil.which('node') or os.path.join(os.path.expanduser('~'), '.workbuddy', 'binaries', 'node',
                                                   'versions', '22.22.2-6', 'node.exe')
    katex_dir = os.path.join(os.path.expanduser('~'), '.workbuddy', 'binaries', 'node', 'workspace',
                             'node_modules', 'katex')
    if not os.path.exists(katex_dir):
        raise RuntimeError('未找到 KaTeX：' + katex_dir)
    script = (
        "const k=require(%s);let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{"
        "const out={};for(const [key,tex,disp] of JSON.parse(d)){try{k.renderToString(tex,"
        "{displayMode:disp,throwOnError:true,strict:false})}catch(e){out[key]=String(e.message).slice(0,160)}}"
        "process.stdout.write(JSON.stringify(out))})" % json.dumps(katex_dir.replace('\\', '/')))
    r = subprocess.run([node, '-e', script], input=json.dumps(formulas).encode('utf-8'),
                       capture_output=True, timeout=300)
    if r.returncode:
        raise RuntimeError(r.stderr.decode('utf-8', 'replace')[:400])
    return json.loads(r.stdout.decode('utf-8'))


def code_artifacts(lang, code):
    """二次转义/换行丢失的痕迹：复制出来的代码无法运行，任何语言都算。"""
    out = []
    if re.search(r'\\"\\"\\"|\\\'\\\'\\\'', code):
        out.append('三引号被转义为 \\"\\"\\"')
    if re.search(r'[^\s\\]\\n {2,}\S', code) and lang not in ('text', 'markdown', 'md'):
        out.append('字面 \\n 代替换行')
    m = re.search(r'^\s*(?:import|from)\s+[\w.]+(?:\s+import\s+[\w, ]+?)?(?:\s+as\s+\w+?)?(def|class)\s+\w+\(', code, re.M)
    if m:
        out.append('import 与 %s 粘在同一行' % m.group(1))
    return out


def audit(mods, use_katex=True):
    findings = defaultdict(list)   # code -> [ {mod, sec, title, detail} ]
    formulas = []
    for mid, d in mods.items():
        for si, s in enumerate(d.get('sections', []), 1):
            c = s.get('content') or ''
            loc = {'mod': mid, 'sec': si, 'title': s.get('title', '')[:40]}
            prose, blocks, unclosed = split_blocks(c)
            if unclosed:
                findings['F1'].append({**loc, 'detail': '第%d行起的代码围栏未闭合' % unclosed})
                continue
            for lang, code, ln in blocks:
                for a in code_artifacts(lang, code):
                    findings['F10'].append({**loc, 'detail': '代码块@%d [%s] %s' % (ln, lang, a)})
                if python_like(lang):
                    err = check_python(code)
                    if err:
                        findings['F2'].append({**loc, 'detail': '代码块@%d %s' % (ln, err)})
            maths, lone = extract_math(prose)
            if lone % 2 == 1:
                findings['F9'].append({**loc, 'detail': '正文有 %d 个孤立 $' % lone})
            for k, (tex, disp) in enumerate(maths):
                formulas.append(('%s|%d|%d' % (mid, si, k), tex, disp))
            for t in table_issues(prose):
                findings['F4'].append({**loc, 'detail': t})
            for m in PLACEHOLDER.finditer(strip_inline_code(prose)):
                ctx = prose[max(0, m.start() - 20):m.end() + 20].replace('\n', ' ')
                findings['F5'].append({**loc, 'detail': ctx})
            for p in dup_paragraphs(prose):
                findings['F6'].append({**loc, 'detail': p})
            if EXERCISE_HEAD.search(prose):
                tail = prose[EXERCISE_HEAD.search(prose).start():]
                if not ANSWER_HINT.search(tail) and not any(ANSWER_HINT.search(b[1]) for b in blocks):
                    findings['F7'].append({**loc, 'detail': '有练习但无答案/提示'})
            for t in empty_sections(prose):
                findings['F8'].append({**loc, 'detail': t})
    if use_katex and formulas:
        tex_of = {k: tex for k, tex, _ in formulas}
        for key, err in run_katex(formulas).items():
            mid, si, _ = key.split('|')
            title = mods[mid]['sections'][int(si) - 1].get('title', '')[:40]
            findings['F3'].append({'mod': mid, 'sec': int(si), 'title': title,
                                   'detail': '%s  ⟵  %s' % (err, tex_of[key][:80])})
    return findings, len(formulas)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--module')
    ap.add_argument('--no-katex', action='store_true')
    args = ap.parse_args()
    mods = {}
    for f in sorted(os.listdir(LEARN)):
        if f.endswith('.json') and (not args.module or f[:-5] == args.module):
            with io.open(os.path.join(LEARN, f), encoding='utf-8') as fh:
                mods[f[:-5]] = json.load(fh)
    findings, nform = audit(mods, not args.no_katex)
    secs = sum(len(d['sections']) for d in mods.values())
    names = {'F1': '代码围栏未闭合', 'F2': 'Python语法错误', 'F3': '公式解析失败', 'F4': '表格列数不一致',
             'F5': '占位/待补文本', 'F6': '章内重复段落', 'F7': '练习无答案', 'F8': '空小节', 'F9': '$未配对',
             'F10': '代码转义残留'}
    print('模块 %d，章节 %d，公式 %d' % (len(mods), secs, nform))
    for code in sorted(names, key=lambda c: int(c[1:])):
        items = findings.get(code, [])
        flag = '!' if code in HARD and items else ' '
        print('%s %s %-10s %4d  章节数 %d' % (flag, code, names[code], len(items),
                                            len({(x['mod'], x['sec']) for x in items})))
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with io.open(OUT, 'w', encoding='utf-8') as fh:
        json.dump({'modules': len(mods), 'sections': secs, 'formulas': nform,
                   'findings': {k: v for k, v in sorted(findings.items())}}, fh, ensure_ascii=False, indent=1)
    print('report -> ' + os.path.relpath(OUT, ROOT).replace('\\', '/'))
    return 1 if any(findings.get(c) for c in HARD) else 0


if __name__ == '__main__':
    sys.exit(main())
