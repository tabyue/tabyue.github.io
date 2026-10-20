# -*- coding: utf-8 -*-
"""学习中心内容体检：可学性诊断"""
import json, os, sys, glob, re, collections
sys.stdout.reconfigure(encoding='utf-8')

files = sorted(glob.glob('data/learn/*.json'))
mods = []
for f in files:
    d = json.load(open(f, encoding='utf-8'))
    mods.append((os.path.basename(f), d))

L = []
def w(s=''): L.append(s)

# ---------- 1. 全局体量 ----------
tot_chars = 0; tot_secs = 0
stub = []      # <3000 太薄
wall = []      # >15000 太长
for fn, d in mods:
    for s in d['sections']:
        c = len(s.get('content', ''))
        tot_chars += c; tot_secs += 1
        if c < 3000: stub.append((d.get('id'), s.get('shortTitle'), c))
        if c > 15000: wall.append((d.get('id'), s.get('shortTitle'), c))

w('=== 1. 总体量 ===')
w(f'模块 {len(mods)} 个，章节 {tot_secs} 节，总字数 {tot_chars/1000:.1f}K，平均每节 {tot_chars/tot_secs:.0f} 字')
w(f'过薄章节(<3000字) {len(stub)} 节 = {len(stub)/tot_secs*100:.0f}%')
w(f'超长章节(>15000字) {len(wall)} 节 = {len(wall)/tot_secs*100:.0f}%')
w('')
w('--- 最薄的 15 节（标题即全部，读者点进去学不到东西）---')
for m, t, c in sorted(stub, key=lambda x: x[2])[:15]:
    w(f'   {c:>5} 字 | {m:<28} | {t}')
w('')
w('--- 最长的 12 节（单页巨石，读不完）---')
for m, t, c in sorted(wall, key=lambda x: -x[2])[:12]:
    w(f'   {c:>6} 字 | {m:<28} | {t}')

# ---------- 2. 短标题质量 ----------
w('')
w('=== 2. 章节标题（大纲页看到的就是这些）===')
bad = []
for fn, d in mods:
    for s in d['sections']:
        st = (s.get('shortTitle') or '').strip()
        ti = (s.get('title') or '').strip()
        # 疑似截断：标题过短 / 以英文单词结尾且不是常见缩写 / 与 title 前缀不符
        if len(st) <= 3 or re.fullmatch(r'[A-Za-z][A-Za-z ]{0,12}', st):
            bad.append((d.get('id'), st, ti[:60]))
        elif ti and not ti.startswith(st[:4]) and len(st) < 10:
            bad.append((d.get('id'), st, ti[:60]))
w(f'疑似被截断/不可读的标题 {len(bad)} 个：')
for m, st, ti in bad[:40]:
    w(f'   [{m}] shortTitle="{st}"   <- 原标题: {ti}')

# ---------- 3. 同模块内重复主题 ----------
w('')
w('=== 3. 同一模块内主题重复 ===')
def norm(x):
    x = (x or '').lower()
    x = re.sub(r'[^0-9a-z一-鿿]+', '', x)
    return x
dup_in = []
for fn, d in mods:
    seen = collections.defaultdict(list)
    for i, s in enumerate(d['sections']):
        seen[norm(s.get('shortTitle'))].append(i)
    for k, v in seen.items():
        if len(v) > 1 and k:
            dup_in.append((d.get('id'), k, [d['sections'][i].get('shortTitle') for i in v]))
for m, k, ts in dup_in:
    w(f'   [{m}] {ts}')

w('')
w('=== 3b. 同模块内标题高度相似（疑似同题重写）===')
SUS = ['sim', 'real', 'wall', 'domain', '可微分', '模型预测控制', '触觉', '力/力矩', '数据格式', '写作篇', '演讲篇', '闭环']
for fn, d in mods:
    hits = [s.get('shortTitle') for s in d['sections']
            if any(k in norm(s.get('shortTitle')) for k in ['sim', 'real', 'wall', 'kemobimoc预测', '可微分'])]
    if len(hits) > 1:
        w(f'   [{d.get("id")}] {hits}')

# ---------- 4. tier 排序是否真的形成梯度 ----------
w('')
w('=== 4. tier 梯度与时长 ===')
badgrad = []
for fn, d in mods:
    tiers = [s.get('tier') for s in d['sections']]
    if tiers != sorted(tiers):
        badgrad.append((d.get('id'), tiers))
w(f'tier 未单调递增的模块 {len(badgrad)} 个：')
for m, t in badgrad[:15]:
    w(f'   [{m}] {t}')

min_ = 0; miss_min = []
diffs = collections.Counter()
for fn, d in mods:
    for s in d['sections']:
        diffs[s.get('difficulty')] += 1
        if not s.get('estimatedMinutes'): miss_min.append(d.get('id'))
w('')
w('难度分布: ' + dict(diffs).__str__())
w(f'缺 estimatedMinutes 的模块数: {len(set(miss_min))}')

# ---------- 5. 内容结构（有没有小节、有没有例子、有没有练习）----------
w('')
w('=== 5. 正文结构质量 ===')
no_h2 = []; no_code = []; no_list = []
for fn, d in mods:
    for s in d['sections']:
        c = s.get('content', '')
        if '## ' not in c: no_h2.append((d.get('id'), s.get('shortTitle')))
        if '```' not in c: no_code.append((d.get('id'), s.get('shortTitle')))
        if not re.search(r'^\s*[-*|\d]\s', c, re.M): no_list.append((d.get('id'), s.get('shortTitle')))
w(f'没有二级小标题的章节 {len(no_h2)} 节 = {len(no_h2)/tot_secs*100:.0f}%  （点进去是一整块文字，无法扫读）')
w(f'没有代码块的章节 {len(no_code)} 节 = {len(no_code)/tot_secs*100:.0f}%')
w(f'没有列表/表格的章节 {len(no_list)} 节 = {len(no_list)/tot_secs*100:.0f}%')

# ---------- 6. 每模块画像 ----------
w('')
w('=== 6. 模块画像（按薄厚排序）===')
w(f'{"模块":<30}{"节":>4}{"总字数":>9}{"均":>7}{"薄":>4}{"长":>4}{"tier梯度":>9}')
rows = []
for fn, d in mods:
    secs = d['sections']
    cs = [len(s.get('content', '')) for s in secs]
    tiers = [s.get('tier') for s in secs]
    rows.append((sum(cs), d.get('id'), len(secs), sum(cs)/len(secs),
                 sum(1 for c in cs if c < 3000), sum(1 for c in cs if c > 15000),
                 'ok' if tiers == sorted(tiers) else '乱'))
for tot, mid, n, avg, ns, nl, g in sorted(rows):
    w(f'{mid:<30}{n:>4}{tot/1000:>8.1f}K{avg:>7.0f}{ns:>4}{nl:>4}{g:>9}')

open('_audit_out.txt', 'w', encoding='utf-8').write('\n'.join(L))
print('\n'.join(L))
