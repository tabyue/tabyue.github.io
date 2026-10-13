# -*- coding: utf-8 -*-
"""学习中心结构性重构（一次性，可重复运行/幂等）

做四件事：
  1. 标题规范化：去 emoji、剥离「（2026-xx 新增）」类时间标记 → frontier 字段
  2. 元数据补全：difficulty / lastUpdated / estimatedMinutes / shortTitle
  3. 按 _sort_plan 重排 sections 为教学梯度，写入 tier
  4. 同步重写正文里的 /learn/<mod>/<idx> 内链（旧索引 → 新索引）

用法：
    python tools/restructure_learn.py --dry     # 只出报告不落盘
    python tools/restructure_learn.py           # 执行
"""
import io
import json
import os
import re
import sys
import argparse
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LEARN = os.path.join(ROOT, 'data', 'learn')
PLAN = os.path.join(ROOT, 'tools', 'learn_sort_plan')

EMOJI = re.compile(
    '[\U0001F000-\U0001FAFF\u2600-\u27BF\u2B00-\u2BFF\uFE0F\u2190-\u21FF\u2700-\u27bf]'
)
# 尾部时间/来源标记： （2026-08 新增） (2026-10 前沿) （2026-05 最新突破）
TAG_TAIL = re.compile(r'\s*[（(]\s*(20\d\d)\s*[-年.]?\s*(\d{1,2})?\s*月?[^）)]*[）)]\s*$')
TAG_MID = re.compile(r'[（(]\s*(20\d\d)\s*[-年.]?\s*(\d{1,2})?\s*月?[^）)]*[）)]')
NEW_MARK = re.compile(r'[（(]?\s*(20\d\d[-年.]?\d{0,2}\s*月?\s*)?(新增|最新突破|前沿|最新)[）)]?')

BASIC_WORDS = ('入门', '基础', '概述', '概论', '简介', '什么是', '为什么需要', '全景', '导论', '概览', '第一步')
ADV_WORDS = ('深入', '进阶', '高级', '调优', '优化', '工程化', '实战', '生产级', '量产', '系统级', '深度解析')

# 难度口径统一：历史上写入过 advanced / 进阶 / 高阶 / intermediate / 前沿 等杂值
DIFF_NORM = {
    '入门': '入门', '初级': '入门', '基础': '入门', 'intro': '入门', 'beginner': '入门', 'basic': '入门',
    '中级': '中级', '进阶': '中级', 'intermediate': '中级', 'medium': '中级', '中等': '中级',
    '高级': '高级', '高阶': '高级', 'advanced': '高级', 'adv': '高级', '前沿': '高级', 'hard': '高级',
}
LEAD_NUM = re.compile(r'^\d+\.\s+')


def norm_difficulty(v, fallback):
    if isinstance(v, str):
        return DIFF_NORM.get(v.strip().lower(), DIFF_NORM.get(v.strip()))
    return None


def tier_of(s):
    """从 difficulty / 前沿标记反推 tier（用于未参与重排的模块）"""
    if s.get('isFrontier'):
        return 3
    d = s.get('difficulty')
    if d == '入门':
        return 0
    if d == '中级':
        return 1
    return 2


def clean_title(t):
    """返回 (clean_title, frontier_tag)"""
    tag = ''
    m = TAG_TAIL.search(t)
    while m:
        tag = m.group(0).strip() or tag
        t = t[:m.start()].strip()
        m = TAG_TAIL.search(t)
    t = EMOJI.sub('', t)
    t = LEAD_NUM.sub('', t)          # 去掉残留的「13. 」式序号
    t = re.sub(r'\s{2,}', ' ', t).strip(' -—·|')
    return t, tag


def short_of(t, limit=22):
    """侧边栏短标题：优先取冒号/破折号前的主标题"""
    head = re.split(r'[：:｜|｜—–\-–（(]', t, 1)[0].strip()
    if not head:
        head = t
    if len(head) > limit:
        head = head[:limit] + '…'
    return head


def guess_difficulty(t, tier):
    low = t.lower()
    if any(w in t for w in BASIC_WORDS):
        return '入门'
    if any(w in t for w in ADV_WORDS):
        return '高级'
    return {0: '入门', 1: '中级', 2: '高级', 3: '高级'}.get(tier, '中级')


def est_minutes(content):
    """估算阅读时长：正文 ~400 字/分钟（代码按 3 行/分钟折算）"""
    code = sum(len(b) for b in re.findall(r'```.*?```', content, re.S))
    text = re.sub(r'```.*?```', ' ', content, flags=re.S)
    cn = len(re.findall(r'[\u4e00-\u9fa5]', text))
    en = len(re.findall(r'[A-Za-z]{2,}', text))
    m = cn / 400 + en / 220 + (code / 900)
    return max(3, int(round(m)))


def strip_dup_heading(content, title):
    """正文开头若重复了章节标题（# 标题），删掉该行"""
    lines = content.split('\n')
    i = 0
    while i < len(lines) and not lines[i].strip():
        i += 1
    if i >= len(lines):
        return content, False
    m = re.match(r'^(#{1,3})\s+(.*)$', lines[i].strip())
    if not m:
        return content, False
    head = EMOJI.sub('', m.group(2)).strip()
    ct = re.sub(r'[\s:：\-—]', '', title)
    ch = re.sub(r'[\s:：\-—]', '', head)
    # 章节标题是正文首个小节标题的子串（如「核心通信机制」vs「ROS2 核心通信机制」）
    # 且只多了 4 个以内的修饰字 —— 视为重复，删掉；差太多说明是不同的小节，保留。
    contained = (ct in ch and len(ch) - len(ct) <= 4) or (ch in ct and len(ct) - len(ch) <= 4)
    if ch == ct or contained or ch.startswith(ct[:10]) or ct.startswith(ch[:10]):
        rest = lines[i + 1:]
        while rest and not rest[0].strip():
            rest = rest[1:]
        return '\n'.join(rest), True
    return content, False


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--dry', action='store_true')
    args = ap.parse_args()

    mods = {}
    for f in sorted(os.listdir(LEARN)):
        if f.endswith('.json'):
            mods[f[:-5]] = json.load(io.open(os.path.join(LEARN, f), encoding='utf-8'))

    report = []
    stats = Counter()
    # ---------- pass 1: 规范化 + 元数据（不依赖顺序） ----------
    for mid, d in mods.items():
        mod_upd = d.get('lastUpdated', '')
        for s in d.get('sections', []):
            raw = s.get('title', '')
            ct, tag = clean_title(raw)
            if ct != raw:
                stats['title_cleaned'] += 1
            s['title'] = ct
            if tag:
                s['frontierTag'] = tag.strip('（）() ')
                s['isFrontier'] = True
                stats['frontier_tagged'] += 1
            elif NEW_MARK.search(raw):
                s['isFrontier'] = True
                stats['frontier_tagged'] += 1
            s['shortTitle'] = short_of(ct)
            # 注意：不给章节回填模块级 lastUpdated —— 会让「🔥 本章已更新」徽章
            # 误判整模块所有章节，也会污染"按时间看新旧"的语义。缺失即表示无修订记录。
            c = s.get('content', '') or ''
            c, stripped = strip_dup_heading(c, s['title'])
            if stripped:
                s['content'] = c
                stats['dup_heading_stripped'] += 1
            s['estimatedMinutes'] = est_minutes(s['content'] or '')
            s['chars'] = len(s['content'] or '')

    # ---------- pass 2: 重排 ----------
    order_map = {}   # mid -> list of old index
    tier_map = {}    # mid -> {oldIdx: tier}
    for mid, d in mods.items():
        p = os.path.join(PLAN, mid + '.json')
        secs = d.get('sections', [])
        if not os.path.exists(p):
            continue
        plan = json.load(io.open(p, encoding='utf-8'))
        if not plan.get('changed'):
            continue
        order = plan['order']
        if d.get('sectionOrderVersion') == 2:
            # 已重排过：order 是相对原始顺序的索引，重复应用会二次错乱。
            # tier 等在上一轮已写入，这里原样保留。
            stats['reorder_skipped'] += 1
            continue
        if sorted(order) != list(range(len(secs))):
            report.append('!! %s order 非法，跳过' % mid)
            continue
        tiers = plan.get('tiers') or {}
        t2i = {}
        for tk, idxs in tiers.items():
            for i in idxs:
                t2i[i] = int(tk)
        for i, s in enumerate(secs):
            s['tier'] = t2i.get(i, 1)
            nd = norm_difficulty(s.get('difficulty'), None)
            if nd:
                if nd != s.get('difficulty'):
                    stats['difficulty_normalized'] += 1
                s['difficulty'] = nd
            else:
                s['difficulty'] = guess_difficulty(s['title'], s['tier'])
                stats['difficulty_filled'] += 1
        d['sections'] = [secs[i] for i in order]
        order_map[mid] = order
        tier_map[mid] = t2i
        d['sectionOrderVersion'] = 2
        stats['reordered'] += 1

    # 未重排模块也补 difficulty / tier
    for mid, d in mods.items():
        if mid in order_map:
            continue
        for i, s in enumerate(d.get('sections', [])):
            nd = norm_difficulty(s.get('difficulty'), None)
            if nd:
                if nd != s.get('difficulty'):
                    stats['difficulty_normalized'] += 1
                s['difficulty'] = nd
            else:
                s['difficulty'] = guess_difficulty(s['title'], 1)
                stats['difficulty_filled'] += 1
            s['tier'] = tier_of(s)

    # ---------- pass 2.5: tier==3 视为前沿；短章节标为速览/跳转 ----------
    for mid, d in mods.items():
        for s in d.get('sections', []):
            if s.get('tier') == 3:
                s['isFrontier'] = True
            if (s.get('chars') or 0) < 3000:
                s['isBrief'] = True
                stats['brief_marked'] += 1

    # ---------- pass 3: 重写内链 ----------
    # old array idx -> new array idx
    idx_map = {}
    for mid, order in order_map.items():
        idx_map[mid] = {old: new for new, old in enumerate(order)}
    LINK = re.compile(r'/learn/([a-z0-9-]+)/(\d+)')

    def fix(m):
        mod, idx = m.group(1), int(m.group(2))
        if mod not in mods:
            return m.group(0)
        if idx == 0:
            # 历史遗留的 /xxx/0（URL 章节号从 1 起），统一收敛为模块首页
            stats['link_zero_fixed'] += 1
            return '/learn/%s' % mod
        old_arr = idx - 1
        if mod in idx_map:
            new_arr = idx_map[mod].get(old_arr)
            if new_arr is None:
                return m.group(0)
            new_idx = new_arr + 1
        else:
            new_idx = idx
        if new_idx == idx:
            return m.group(0)
        stats['link_rewritten'] += 1
        return '/learn/%s/%d' % (mod, new_idx)

    for mid, d in mods.items():
        for i, s in enumerate(d.get('sections', [])):
            c = s.get('content', '') or ''
            nc = LINK.sub(fix, c)
            if nc != c:
                s['content'] = nc

    # ---------- 输出 ----------
    report.append('=' * 62)
    report.append('统计：' + '  '.join('%s=%d' % (k, v) for k, v in sorted(stats.items())))
    report.append('重排模块 %d / %d' % (len(order_map), len(mods)))
    report.append('')
    for mid in sorted(order_map):
        d = mods[mid]
        report.append('--- %s (%d 章)' % (mid, len(d['sections'])))
        for i, s in enumerate(d['sections']):
            report.append('  %2d. [T%s|%s|%2dmin] %s' % (
                i, s.get('tier', '-'), s.get('difficulty', '-'),
                s.get('estimatedMinutes', 0), s['title'][:52]))
    txt = '\n'.join(report)
    outp = os.path.join(ROOT, 'tools', '_restructure_report.txt')
    io.open(outp, 'w', encoding='utf-8').write(txt)

    if args.dry:
        print('DRY RUN ->', outp)
        return

    for mid, d in mods.items():
        p = os.path.join(LEARN, mid + '.json')
        io.open(p, 'w', encoding='utf-8').write(
            json.dumps(d, ensure_ascii=False, indent=2) + '\n')
    print('written', len(mods), 'modules -> report:', outp)


if __name__ == '__main__':
    main()
