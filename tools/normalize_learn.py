# -*- coding: utf-8 -*-
"""学习中心章节规范化守卫（幂等，每轮新增/修改章节后必跑）

与一次性的 restructure_learn.py 分工：那个负责「重排顺序」，这个负责「写入规范」。
只做 4 件不改变章节顺序的事：

  1. 标题剥离时间/新增标记 —— 前端已用 isFrontier 徽章展示「前沿」，标题里再写一遍
     既冗余又让标题超长（侧栏/卡片都会被截断）。剥下来的内容存进 frontierTag。
  2. 标题剥离残留序号（「26. xxx」）与 emoji。
  3. 删除正文开头与章节标题重复的 # 行 —— 前端会单独渲染 h1，重复会连显两遍。
  4. 解开正文中被反引号包裹的 markdown 链接（不改代码围栏内示例）。
     越界内链交给结构守卫报告，不能擅自收敛到大纲页掩盖问题。
     renderMd 先保护行内代码再处理链接，
     `[文字](/learn/x/1)` 会原样渲染成裸 markdown 文本，不可点击。

同时补齐 shortTitle / estimatedMinutes / chars（新章节常漏）。
不碰 tier / difficulty / 章节顺序 —— 那些由人或重排工具决定。

用法：
    python tools/normalize_learn.py --dry   # 只报告
    python tools/normalize_learn.py         # 执行（之后记得跑 sync_learn_split.py）
"""
import argparse
import io
import json
import os
import re
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LEARN = os.path.join(ROOT, 'data', 'learn')

EMOJI = re.compile('[\U0001F000-\U0001FAFF\u2600-\u27BF\u2B00-\u2BFF\uFE0F]')
# 尾部时间标记，括号与非括号两种写法都要覆盖：
#   「...（2026-10 前沿）」「...（2026-08 新增）」「...，2026-10 新增」「... 2026-10 最新突破」
TAG_PAREN = re.compile(r'\s*[（(]\s*20\d\d\s*[-年./]?\s*\d{0,2}\s*月?\s*'
                       r'(?:前沿|新增|最新突破|最新|更新)?\s*[^）)]{0,12}[）)]\s*$')
TAG_PLAIN = re.compile(r'\s*[，,、]?\s*20\d\d\s*[-年./]?\s*\d{0,2}\s*月?\s*'
                       r'(?:前沿|新增|最新突破|最新|更新)\s*$')
LEAD_NUM = re.compile(r'^\d+\.\s+')
SPLIT_RE = re.compile(r'[：:｜|—–（(]')
LINK_ZERO = re.compile(r'/learn/([a-z0-9-]+)/0\b')
# 被反引号包住的 markdown 链接：前端把行内代码先保护起来，于是链接永远不会生效
BACKTICKED_LINK = re.compile(r'`(\[[^\]\n]{1,80}\]\((?:/|https?://)[^)\s]+\))`')


def clean_title(t):
    """返回 (clean, tag)。tag 为被剥离的时间标记（无则空串）。"""
    tag = ''
    for _ in range(3):           # 可能叠了多层
        m = TAG_PAREN.search(t) or TAG_PLAIN.search(t)
        if not m:
            break
        tag = m.group(0).strip(' ，,、（）()') or tag
        t = t[:m.start()].rstrip()
    t = EMOJI.sub('', t)
    t = LEAD_NUM.sub('', t)
    t = re.sub(r'\s{2,}', ' ', t).strip(' -—·|，,')
    return t, tag


def _is_fragment(s):
    """切出来的主标题太短/像半个词，说明不该切"""
    return len(s) < 4 or s.endswith(('的', '与', '和', '从', '把'))


def short_of(t, limit=22):
    head = SPLIT_RE.split(t, maxsplit=1)[0].strip()
    if not head or _is_fragment(head):
        head = t
    if len(head) > limit:
        head = head[:limit] + '…'
    return head


def map_prose(content, transform):
    """Transform only prose, preserving fenced code examples byte for byte."""
    out, chunk, fence = [], [], None
    for line in content.splitlines(keepends=True):
        marker = re.match(r'^ {0,3}(?:>[ \t]?)*(`{3,}|~{3,})(.*)$', line.rstrip('\r\n'))
        if fence is None and marker:
            if chunk:
                out.append(transform(''.join(chunk)))
                chunk = []
            fence = marker.group(1)
            out.append(line)
        elif fence is not None:
            out.append(line)
            if marker and marker.group(1)[0] == fence[0] and len(marker.group(1)) >= len(fence) and not marker.group(2).strip():
                fence = None
        else:
            chunk.append(line)
    if chunk:
        out.append(transform(''.join(chunk)))
    return ''.join(out)


def est_minutes(content):
    chunks = []
    map_prose(content, lambda text: chunks.append(text) or text)
    text = '\n'.join(chunks)
    code = max(0, len(content) - sum(len(t) for t in chunks))
    cn = len(re.findall(r'[\u4e00-\u9fa5]', text))
    en = len(re.findall(r'[A-Za-z]{2,}', text))
    return max(3, int(round(cn / 400 + en / 220 + code / 900)))


def strip_dup_heading(content, title):
    """正文开头若重复章节标题则删掉该行。标题已剥离时间标记，
    所以这里对正文标题也要同样剥离后再比，否则比不中。"""
    lines = content.split('\n')
    i = 0
    while i < len(lines) and not lines[i].strip():
        i += 1
    if i >= len(lines):
        return content, False
    m = re.match(r'^#{1,3}\s+(.+)$', lines[i].strip())
    if not m:
        return content, False
    head, _ = clean_title(m.group(1))
    norm = lambda s: re.sub(r'[\s:：\-—]', '', s)
    ch, ct = norm(head), norm(title)
    if not ct:
        return content, False
    same = ch == ct or (ct in ch and len(ch) - len(ct) <= 4) or \
           (ch in ct and len(ct) - len(ch) <= 4)
    if not same:
        return content, False
    rest = lines[i + 1:]
    while rest and not rest[0].strip():
        rest = rest[1:]
    return '\n'.join(rest), True


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--dry', action='store_true')
    ap.add_argument('--resync-minutes', action='store_true',
                    help='按 400 字/分钟统一重算全部章节阅读时长（会覆盖已有值）')
    args = ap.parse_args()

    st = Counter()
    changes = []
    mods = {}
    for f in sorted(os.listdir(LEARN)):
        if f.endswith('.json'):
            with io.open(os.path.join(LEARN, f), encoding='utf-8') as stream:
                mods[f[:-5]] = json.load(stream)

    for mid, d in mods.items():
        for i, s in enumerate(d.get('sections', [])):
            raw = s.get('title', '')
            ct, tag = clean_title(raw)
            if ct != raw:
                st['title_cleaned'] += 1
                changes.append('[标题] %s#%d\n    旧: %s\n    新: %s' % (mid, i, raw, ct))
                s['title'] = ct
                if tag:
                    s['frontierTag'] = tag
                    s['isFrontier'] = True

            c = s.get('content', '') or ''
            c2, stripped = strip_dup_heading(c, s['title'])
            if stripped:
                st['dup_heading'] += 1
                changes.append('[去重复标题] %s#%d — %s' % (mid, i, s['title'][:40]))
                c = c2

            # Never silently turn an invalid chapter number into a module link.
            # Report through verify_learn_structure.py and resolve using actual titles.

            # 解开反引号包裹的链接
            def _unwrap(m):
                st['backtick_link'] += 1
                changes.append('[解反引号] %s#%d  %s' % (mid, i, m.group(1)[:60]))
                return m.group(1)
            c = map_prose(c, lambda chunk: BACKTICKED_LINK.sub(_unwrap, chunk))

            if c != (s.get('content') or ''):
                s['content'] = c

            # 补齐派生字段 —— 只补缺失，不覆盖已有值。
            # shortTitle 可能是人工精选用来区分同名章节的（如「扩散模型的崛起」
            # 刻意区别于另一章「Diffusion Policy」），机械重算会让侧栏撞名。
            if not s.get('shortTitle'):
                s['shortTitle'] = short_of(s['title'])
                st['shortTitle_filled'] += 1
            chars = len(s.get('content') or '')
            if s.get('chars') != chars:
                s['chars'] = chars
                st['chars_synced'] += 1
            if not s.get('estimatedMinutes'):
                s['estimatedMinutes'] = est_minutes(s.get('content') or '')
                st['minutes_filled'] += 1

    report = '\n'.join(changes) if changes else '(无需改动)'
    print(report)
    print('\n统计: ' + ('  '.join('%s=%d' % kv for kv in sorted(st.items())) or '无变化'))

    # --- 只读体检：阅读时长口径一致性 ---
    # 站点存量有两套口径（自动化 ~113 字/分钟 vs 重构脚本 400 字/分钟），
    # 同一本「书」里 9000 字的章节有的标 12 分钟有的标 80 分钟，用户会困惑。
    # 这里只报告不自动改 —— 改哪一套是产品决策。
    odd = []
    for mid, d in mods.items():
        for i, s in enumerate(d.get('sections', [])):
            ch, em = s.get('chars') or 0, s.get('estimatedMinutes') or 0
            if ch > 1500 and em > 0:
                wpm = ch / em
                if wpm < 200:            # 明显偏慢口径
                    odd.append((wpm, '%s#%d %d字/%d分钟=%d字每分' % (mid, i, ch, em, wpm)))
    if odd:
        odd.sort()
        print('\n[体检] 阅读时长口径偏慢的章节: %d 处（站点主口径约 400 字/分钟）' % len(odd))
        for _, x in odd[:6]:
            print('   ' + x)
        print('   → 如需统一，跑 tools/normalize_learn.py --resync-minutes')

    if args.dry:
        print('\nDRY RUN，未写盘')
        return
    if args.resync_minutes:
        n = 0
        for mid, d in mods.items():
            for s in d.get('sections', []):
                em = est_minutes(s.get('content') or '')
                if s.get('estimatedMinutes') != em:
                    s['estimatedMinutes'] = em
                    n += 1
        st['minutes_resynced'] = n
        print('\n已按 400 字/分钟统一重算 %d 处阅读时长' % n)
    if not st:
        print('\n无变化，未写盘')
        return
    for mid, d in mods.items():
        with io.open(os.path.join(LEARN, mid + '.json'), 'w', encoding='utf-8') as stream:
            stream.write(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
    print('\n已写入 %d 个模块 —— 记得跑 tools/sync_learn_split.py' % len(mods))


if __name__ == '__main__':
    main()
