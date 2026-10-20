# -*- coding: utf-8 -*-
"""
修复 shortTitle 截断 bug。

原实现（tools/restructure_learn.py:short_of）的分隔符集合含 ASCII 连字符 '-'，
而 KV-Cache / Sim-to-Real / Wall-OSS / CLF-RL / 3D-aware / Hand-in-the-Loop
这类术语里连字符遍地都是，导致标题被切成 "KV" / "Sim" / "Real" / "Wall" 等
无意义碎片。本脚本只重新生成 shortTitle，不动正文、不动顺序。
"""
import json, os, sys, re, glob
sys.stdout.reconfigure(encoding='utf-8')

# 分隔符：中文/全角标点 + 冒号 + 竖线；**不含 ASCII 连字符**
SPLIT = re.compile(r'[：:｜|｜—–（(]')
# 去掉 emoji 与常见装饰
EMOJI = re.compile('[\U0001F000-\U0001FAFF\u2600-\u27BF\uFE0F\u2B00-\u2BFF\u2190-\u21FF]+')
# 「（2026-05 新增）」类时间标记
TIME_MARK = re.compile(r'[（(]\s*20\d\d\s*[-年.\/]\s*\d{0,2}\s*月?\s*[^）)]*[）)]')

LIMIT = 22


def clean(t):
    t = EMOJI.sub('', t or '').strip()
    t = TIME_MARK.sub('', t).strip()
    return t.strip(' ：:｜|-–—')


def short_of(title, limit=LIMIT):
    """取主标题：只在中文/全角标点处切，不在 ASCII 连字符处切。"""
    t = clean(title)
    if not t:
        return ''
    head = SPLIT.split(t, 1)[0].strip()
    if not head:
        head = t
    # 碎片检测：太短，或纯 ASCII 且 <=3 字符（如 KV / Sim / 3D）
    def is_fragment(s):
        if len(s) < 4:
            return True
        if re.fullmatch(r'[A-Za-z0-9 .]{1,3}', s):
            return True
        return False
    if is_fragment(head):
        head = t
    if len(head) > limit:
        # 尽量在自然断点处收：空格 / 顿号 / 逗号 / 斜杠
        cut = head[:limit]
        m = list(re.finditer(r'[\s、,，/]', cut))
        if m and m[-1].end() >= limit * 0.55:
            cut = cut[:m[-1].end()].strip()
        head = cut.rstrip('、,，/ ') + '…'
    return head


def variants(title):
    """碰撞时依次退让：主标题 -> 完整标题（逐级放宽长度）"""
    t = clean(title)
    out = []
    for lim in (LIMIT, 26, 30, 36, 44):
        s = short_of(title, lim)
        if s not in out:
            out.append(s)
    # 最后兜底：完整标题（不截断）
    if t not in out:
        out.append(t)
    return out


changed = []
collisions_fixed = []
for f in sorted(glob.glob('data/learn/*.json')):
    d = json.load(open(f, encoding='utf-8'))
    mid = d.get('id')
    secs = d['sections']
    used = {}
    touched = False
    for s in secs:
        old = (s.get('shortTitle') or '').strip()
        title = s.get('title') or ''
        for cand in variants(title):
            if cand and cand not in used:
                new = cand
                break
        else:
            new = old
        used[new] = True
        if new != old:
            changed.append((mid, old, new))
            s['shortTitle'] = new
            touched = True
    if touched:
        with open(f, 'w', encoding='utf-8') as fh:
            json.dump(d, fh, ensure_ascii=False, indent=2)

print(f'修复章节标题 {len(changed)} 个：')
for mid, old, new in changed:
    print(f'  [{mid}] "{old}"  ->  "{new}"')
print(f'\ntotal = {len(changed)}')
