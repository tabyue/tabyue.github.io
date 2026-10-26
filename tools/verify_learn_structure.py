# -*- coding: utf-8 -*-
"""学习中心结构体检（2026-10-13 重构后的规则守卫，建议每轮新增章节后必跑）

校验项：
  1. 章节必备元数据：title / shortTitle / difficulty / tier / estimatedMinutes
  2. difficulty 口径只能是 入门 / 中级 / 高级
  3. tier 单调不减（大纲页按 tier 分组渲染，非单调会导致章节顺序错乱）
  4. 前沿章节必须集中在模块尾部（不能插到开头）
  5. 标题规范：无 emoji / 无「2026-xx 新增」类时间标记 / 无残留序号
  6. 正文开头不得重复章节标题
  7. 内链 /learn/<mod>/<idx> 不得越界
  8. learn 与 learn-split 分片数量、元数据一致

用法：python tools/verify_learn_structure.py
退出码 1 表示有必修问题。
"""
import io
import json
import os
import re
import sys
from collections import Counter
from normalize_learn import BACKTICKED_LINK, map_prose
from sync_learn_split import reading_metadata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LEARN = os.path.join(ROOT, 'data', 'learn')
SPLIT = os.path.join(ROOT, 'data', 'learn-split')

EMOJI = re.compile('[\U0001F000-\U0001FAFF\u2600-\u27BF\u2B00-\u2BFF\uFE0F]')
TAG_TAIL = re.compile(r'[（(]\s*20\d\d\s*[-年.]?\s*\d{0,2}\s*月?[^）)]*[）)]\s*$')
LEAD_NUM = re.compile(r'^\d+\.\s+')
LINK = re.compile(r'/learn/([a-z0-9-]+)/(\d+)')
VALID_DIFF = {'入门', '中级', '高级'}
REQUIRED = ('title', 'shortTitle', 'difficulty', 'tier', 'estimatedMinutes')
# 大纲页卡片依赖的字段，缺了会静默降级成「中级 / 0 分钟」
META_KEYS = ('shortTitle', 'difficulty', 'tier', 'estimatedMinutes')

fails, warns = [], []


def read_json(path):
    with io.open(path, encoding='utf-8') as stream:
        return json.load(stream)


def main():
    fails.clear()
    warns.clear()
    mods = {}
    for f in sorted(os.listdir(LEARN)):
        if f.endswith('.json'):
            mods[f[:-5]] = read_json(os.path.join(LEARN, f))

    total = sum(len(d.get('sections', [])) for d in mods.values())
    print('模块 %d，章节 %d' % (len(mods), total))

    # --- 1/2/5/6 逐章节检查 ---
    miss, bad_diff, bad_title, dup_head = [], [], [], []
    dc = Counter()
    for mid, d in mods.items():
        for i, s in enumerate(d.get('sections', [])):
            tag = '%s#%d' % (mid, i)
            for k in REQUIRED:
                if s.get(k) in (None, ''):
                    miss.append('%s.%s' % (tag, k))
            dv = s.get('difficulty')
            dc[dv] += 1
            if dv not in VALID_DIFF:
                bad_diff.append('%s=%s' % (tag, dv))
            t = s.get('title', '')
            why = []
            if EMOJI.search(t):
                why.append('emoji')
            if TAG_TAIL.search(t) or '新增' in t:
                why.append('时间/新增标记')
            if LEAD_NUM.match(t):
                why.append('残留序号')
            if why:
                bad_title.append('%s %s → %s' % (tag, '/'.join(why), t[:40]))
            # 正文开头重复标题
            c = (s.get('content') or '').lstrip()
            m = re.match(r'^#{1,3}\s+(.+)$', c.split('\n', 1)[0] if c else '')
            if m:
                ch = re.sub(r'[\s:：\-—]', '', EMOJI.sub('', m.group(1)))
                ct = re.sub(r'[\s:：\-—]', '', t)
                if ch == ct or (ct and ct in ch and len(ch) - len(ct) <= 4):
                    dup_head.append(tag)

    print('[1] 必备元数据缺失: %d %s' % (len(miss), miss[:6]))
    print('[2] difficulty 分布: %s' % dict(dc))
    print('    口径越界: %d %s' % (len(bad_diff), bad_diff[:6]))
    print('[5] 标题规范问题: %d' % len(bad_title))
    for x in bad_title[:8]:
        print('      ', x)
    print('[6] 正文开头重复标题: %d %s' % (len(dup_head), dup_head[:6]))
    if miss:
        fails.append('章节元数据缺失 %d 处（大纲页会降级）%s' % (len(miss), miss[:5]))
    if bad_diff:
        fails.append('difficulty 口径越界 %s' % bad_diff[:5])
    if bad_title:
        fails.append('标题规范问题 %d 处 %s' % (len(bad_title), bad_title[:3]))
    if dup_head:
        fails.append('正文重复标题 %d 处 %s' % (len(dup_head), dup_head[:5]))

    # --- 3 tier 单调 ---
    not_mono = []
    for mid, d in mods.items():
        ts = [s.get('tier', 1) for s in d.get('sections', [])]
        bad = [i for i in range(len(ts) - 1) if ts[i] > ts[i + 1]]
        if bad:
            not_mono.append((mid, ['%d:T%s>T%s' % (i, ts[i], ts[i + 1]) for i in bad[:3]]))
    print('[3] tier 非单调模块: %d' % len(not_mono))
    for mid, b in not_mono:
        print('      ', mid, b)
    if not_mono:
        fails.append('tier 非单调 %s（大纲页章节顺序会错乱）' % [m for m, _ in not_mono])

    # --- 4 前沿章节位置 ---
    front_bad = []
    for mid, d in mods.items():
        secs = d.get('sections', [])
        fi = [i for i, s in enumerate(secs) if s.get('isFrontier')]
        if not fi or len(secs) < 4:
            continue
        avg = sum(i / (len(secs) - 1) for i in fi) / len(fi)
        if avg < 0.55:
            front_bad.append((mid, round(avg, 2), fi[:5]))
    print('[4] 前沿章节未集中在尾部: %d %s' % (len(front_bad), front_bad[:4]))
    if front_bad:
        warns.append('前沿章节位置偏前 %s' % [m for m, _, _ in front_bad])

    # --- 7 内链 ---
    broken = []
    for mid, d in mods.items():
        for i, s in enumerate(d.get('sections', [])):
            for m2, idx in set(LINK.findall(s.get('content') or '')):
                if m2 not in mods:
                    broken.append('%s#%d → 未知模块 %s' % (mid, i, m2))
                elif not (1 <= int(idx) <= len(mods[m2]['sections'])):
                    broken.append('%s#%d → %s/%s 越界(共%d)' % (mid, i, m2, idx, len(mods[m2]['sections'])))
    print('[7] 失效内链: %d %s' % (len(broken), broken[:6]))
    if broken:
        fails.append('失效内链 %d 处 %s' % (len(broken), broken[:5]))

    # --- 8 split 一致性（含元数据） ---
    split_bad = []
    for mid, d in mods.items():
        ip = os.path.join(SPLIT, mid, '_index.json')
        if not os.path.exists(ip):
            split_bad.append('%s 缺 _index.json' % mid)
            continue
        idx = read_json(ip)
        sm = idx.get('sectionsMeta') or []
        secs = d.get('sections', [])
        if len(sm) != len(secs):
            split_bad.append('%s 分片数 %d != %d' % (mid, len(sm), len(secs)))
            continue
        for i, (a, b) in enumerate(zip(sm, secs)):
            if a.get('title') != b.get('title'):
                split_bad.append('%s#%d 标题不一致' % (mid, i))
                break
            for k in META_KEYS:
                if b.get(k) not in (None, '', False) and a.get(k) != b.get(k):
                    split_bad.append('%s#%d 元数据 %s 未同步（跑 sync_learn_split.py）' % (mid, i, k))
                    break
            else:
                continue
            break
    print('[8] learn-split 一致性问题: %d %s' % (len(split_bad), split_bad[:6]))
    if split_bad:
        fails.append('learn-split 不一致 %s' % split_bad[:5])

    # --- 9 Catalog counts, derived browsing/search metadata and module guidance ---
    derived_bad, guidance_bad = [], []
    catalog = read_json(os.path.join(ROOT, 'data', 'learning-path.json'))
    entries = [m for stage in catalog.get('stages', []) for m in stage.get('modules', [])]
    ids = [m.get('id') for m in entries]
    if len(ids) != len(set(ids)) or set(ids) != set(mods):
        derived_bad.append('catalog IDs must cover every module exactly once')
    for entry in entries:
        mid = entry.get('id')
        if mid not in mods:
            continue
        d = mods[mid]
        secs = d['sections']
        ix = read_json(os.path.join(SPLIT, mid, '_index.json'))
        sm = ix.get('sectionsMeta') or []
        reading = sum(reading_metadata(s.get('content') or '')['readingMinutes'] for s in secs)
        chars = sum(len(s.get('content') or '') for s in secs)
        if entry.get('sectionCount') != len(secs) or entry.get('readingMinutes') != reading or entry.get('chars') != chars:
            derived_bad.append(mid + ': catalog counts/reading estimate stale')
        if ix.get('readingMinutes') != reading or ix.get('chars') != chars:
            derived_bad.append(mid + ': module reading estimate stale')
        if entry.get('lastUpdated') != d.get('lastUpdated'):
            derived_bad.append(mid + ': catalog lastUpdated stale')
        for i, (sec, meta) in enumerate(zip(secs, sm), 1):
            expected = reading_metadata(sec.get('content') or '')
            if any(meta.get(k) != v for k, v in expected.items()):
                derived_bad.append('%s/%d: browsing/search metadata stale' % (mid, i))
            if sec.get('tier') not in (0, 1, 2, 3):
                guidance_bad.append('%s/%d: invalid tier' % (mid, i))
            prose = []
            map_prose(sec.get('content') or '', lambda chunk: prose.append(chunk) or chunk)
            if BACKTICKED_LINK.search('\n'.join(prose)):
                guidance_bad.append('%s/%d: prose link wrapped in backticks' % (mid, i))
        for key in ('prerequisites', 'learningObjectives', 'studyGuide'):
            values = d.get(key)
            if values is not None and (not isinstance(values, list) or not values or
                    any(not isinstance(v, str) or not v.strip() for v in values)):
                guidance_bad.append('%s: invalid %s' % (mid, key))
            if ix.get(key) != values:
                derived_bad.append('%s: %s missing from split' % (mid, key))
        def strings(value):
            if isinstance(value, str):
                yield value
            elif isinstance(value, list):
                for child in value:
                    yield from strings(child)
            elif isinstance(value, dict):
                for child in value.values():
                    yield from strings(child)
        for text in strings({k: v for k, v in d.items() if k != 'sections'}):
            for target, number in LINK.findall(text):
                if target not in mods or not (1 <= int(number) <= len(mods[target]['sections'])):
                    guidance_bad.append('%s: invalid guidance link /learn/%s/%s' % (mid, target, number))
    print('[9] 目录计数/浏览估算/搜索索引问题: %d %s' % (len(derived_bad), derived_bad[:5]))
    print('[10] 导学内链/字段/正文链接问题: %d %s' % (len(guidance_bad), guidance_bad[:5]))
    if derived_bad:
        fails.append('派生数据未同步 %s' % derived_bad[:5])
    if guidance_bad:
        fails.append('导学或正文链接问题 %s' % guidance_bad[:5])

    print('\n' + '=' * 60)
    for w in warns:
        print('告警: ' + w)
    if fails:
        print('结构体检: FAIL —— %d 项' % len(fails))
        for f in fails:
            print('  ! ' + f)
    else:
        print('结构体检: ALL OK')
    print('=' * 60)
    return 1 if fails else 0


if __name__ == '__main__':
    sys.exit(main())
