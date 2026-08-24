# -*- coding: utf-8 -*-
"""站点数据健康巡检（可重复运行，建议每轮更新后必跑）。

用法：
    python tools/health_check.py            # 全量巡检
    python tools/health_check.py --quiet    # 只输出问题与结论

覆盖的问题类型（均为真实踩过的坑）：
  1. JSON 解析失败
  2. id 重复
  3. 内容重复：url / github 仓库 / arXiv id / 标题高相似
  4. category 越界 —— 前端只渲染白名单内的分类，越界条目在页面上完全不可见
  5. totalItems 与实际条数不一致
  6. 开源项目缺详情 JSON 或缺报告页（「完整报告」按钮会 404）
  7. 论文缺 detail 文件 / 缺 keyInsights+impact（卡片会退化成「暂无解读」）
  8. learn 模块与 learn-split 分片数量不一致
  9. 学习章节内链指向不存在的论文或章节
 10. 正文使用 ASCII 双引号（本站规范用「」，仅告警不失败）
"""
import argparse
import difflib
import glob
import io
import json
import os
import re
import sys
from collections import Counter, defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

TITLE_SIM_THRESHOLD = 0.86

fails = []
warns = []
QUIET = False


def out(*a):
    if not QUIET:
        print(*a)


def load(path):
    return json.load(io.open(path, encoding='utf-8'))


def norm_title(t):
    t = (t or '').lower()
    t = re.sub(r'[\s\u3000]+', '', t)
    t = re.sub(r'[（）()\[\]【】《》「」:：,，.。/·—\-—_、|]+', '', t)
    return t


def check_json_parse(log):
    files = sorted(glob.glob('data/**/*.json', recursive=True))
    bad = []
    for f in files:
        try:
            load(f)
        except Exception as e:
            bad.append((f, str(e)[:90]))
    log('[1] JSON 解析: %d 个文件, %d 失败' % (len(files), len(bad)))
    for f, e in bad:
        out('    FAIL', f, e)
        fails.append('json parse: ' + f)


DATASETS = [
    ('data/news.json', 'news'),
    ('data/papers-index.json', 'papers'),
    ('data/opensource.json', 'projects'),
    ('data/jobs.json', 'jobs'),
]


def check_ids(log):
    log('[2] id 唯一性:')
    for path, key in DATASETS:
        arr = load(path)[key]
        dups = {k: v for k, v in Counter(x['id'] for x in arr).items() if v > 1}
        log('    %-10s %4d 条  dups=%s' % (key, len(arr), dups or 0))
        if dups:
            fails.append('%s id 重复 %s' % (key, dups))


def report_exact_dups(label, values):
    dups = {k: v for k, v in Counter(v for v in values if v).items() if v > 1}
    out('    %-18s dups=%d %s' % (label, len(dups), list(dups)[:3]))
    if dups:
        fails.append('%s 重复 %s' % (label, list(dups)[:5]))


def report_similar_titles(label, items):
    """标题高相似才算重复；同公司不同事件的前缀撞车不再误报。"""
    buckets = defaultdict(list)
    for it in items:
        n = norm_title(it['title'])
        buckets[n[:6]].append((it['id'], n, it['title']))
    pairs = []
    for group in buckets.values():
        for i in range(len(group)):
            for j in range(i + 1, len(group)):
                r = difflib.SequenceMatcher(None, group[i][1], group[j][1]).ratio()
                if r >= TITLE_SIM_THRESHOLD:
                    pairs.append((group[i][0], group[j][0], round(r, 3)))
    out('    %-18s 高相似标题对=%d %s' % (label, len(pairs), pairs[:3]))
    if pairs:
        fails.append('%s 标题高相似 %s' % (label, pairs[:5]))


def ngrams(s, n=3):
    s = re.sub(r'[\s\u3000]+', '', s or '')
    return {s[i:i + n] for i in range(max(0, len(s) - n + 1))}


def report_same_event(label, items, threshold=0.40):
    """同一天、正文高度重叠 —— 同一事件被不同媒体重复收录的典型形态，
    标题措辞往往差很远，靠标题相似度抓不到。

    用包含度（交集 / 较短一方）而非 Jaccard：短讯被长稿覆盖时 Jaccard 会被长度差稀释。"""
    by_date = defaultdict(list)
    for it in items:
        by_date[it.get('date', '')].append(it)
    pairs = []
    for date, group in by_date.items():
        if len(group) < 2:
            continue
        grams = {it['id']: ngrams(it.get('title', '') + it.get('summary', '')) for it in group}
        for i in range(len(group)):
            for j in range(i + 1, len(group)):
                a, b = grams[group[i]['id']], grams[group[j]['id']]
                if not a or not b:
                    continue
                cont = len(a & b) / min(len(a), len(b))
                if cont >= threshold:
                    pairs.append((group[i]['id'], group[j]['id'], round(cont, 2)))
    out('    %-18s 同日高重叠对=%d %s' % (label, len(pairs), pairs[:5]))
    if pairs:
        fails.append('%s 疑似同一事件重复 %s' % (label, pairs[:8]))


def check_content_dups(log):
    log('[3] 内容查重:')
    news = load('data/news.json')['news']
    papers = load('data/papers-index.json')['papers']
    projects = load('data/opensource.json')['projects']
    report_exact_dups('news url', [x.get('url') for x in news])
    report_similar_titles('news 标题', news)
    report_same_event('news 同日同事件', news)
    report_exact_dups('os repo', [(x.get('github') or '').lower().rstrip('/') for x in projects])
    report_exact_dups('papers arxiv', [re.sub(r'.*abs/', '', x.get('arxiv') or '') for x in papers])
    report_similar_titles('papers 标题', papers)


def check_categories(log):
    """前端只渲染 / 只能筛出白名单内的分类，越界即等于内容丢失。"""
    log('[4] category 白名单:')
    specs = [
        ('data/opensource.json', 'projects', 'categories', True),
        ('data/news.json', 'news', 'categories', False),
        ('data/models.json', 'models', 'categories', False),
        ('data/datasets.json', 'datasets', 'categories', False),
    ]
    for path, key, catkey, hard in specs:
        d = load(path)
        cats = d.get(catkey) or []
        valid = {c['id'] if isinstance(c, dict) else c for c in cats} - {'all', '全部'}
        bad = [x.get('id') or x.get('name') for x in d.get(key, []) if x.get('category') not in valid]
        log('    %-12s 越界 %d %s' % (os.path.basename(path), len(bad), bad[:6]))
        if bad:
            msg = '%s 有 %d 条 category 越界（前端不可见/筛不出）' % (os.path.basename(path), len(bad))
            (fails if hard else warns).append(msg)


def check_total_items(log):
    log('[5] totalItems 一致性:')
    for path, key in DATASETS:
        d = load(path)
        if 'totalItems' not in d:
            continue
        actual = len(d[key])
        ok = d['totalItems'] == actual
        log('    %-12s totalItems=%s actual=%d %s' % (os.path.basename(path), d['totalItems'], actual, 'ok' if ok else 'MISMATCH'))
        if not ok:
            fails.append('%s totalItems=%s 与实际 %d 不一致' % (os.path.basename(path), d['totalItems'], actual))


def check_opensource_assets(log):
    log('[6] 开源项目详情/报告覆盖:')
    projects = load('data/opensource.json')['projects']
    no_detail = [p['id'] for p in projects if not os.path.exists('data/opensource/%s.json' % p['id'])]
    no_report = [p['id'] for p in projects if not os.path.exists('data/opensource/reports/%s.html' % p['id'])]
    log('    缺详情 JSON: %d %s' % (len(no_detail), no_detail[:8]))
    log('    缺报告页:   %d %s' % (len(no_report), no_report[:8]))
    if no_report:
        fails.append('开源报告页缺失 %s' % no_report[:8])
    if no_detail:
        warns.append('开源详情 JSON 缺失 %d 条' % len(no_detail))


def check_papers_assets(log):
    log('[7] 论文详情覆盖:')
    papers = load('data/papers-index.json')['papers']
    no_detail = [p['id'] for p in papers if not os.path.exists('data/papers/%s.json' % p['id'])]
    no_ki = [p['id'] for p in papers if not p.get('keyInsights') or not p.get('impact')]
    log('    缺 detail 文件: %d %s' % (len(no_detail), no_detail[:8]))
    log('    缺 keyInsights/impact: %d %s' % (len(no_ki), no_ki[:8]))
    if no_detail:
        warns.append('论文 detail 缺失 %s' % no_detail[:8])
    if no_ki:
        warns.append('论文缺 keyInsights/impact %d 条（卡片显示暂无解读）' % len(no_ki))


def check_learn_split(log):
    log('[8] learn / learn-split 一致性:')
    bad = []
    for f in sorted(glob.glob('data/learn/*.json')):
        mid = os.path.basename(f)[:-5]
        n = len(load(f)['sections'])
        secs = glob.glob('data/learn-split/%s/sec-*.json' % mid)
        if len(secs) != n:
            bad.append((mid, n, len(secs)))
    log('    不一致模块: %d %s' % (len(bad), bad))
    if bad:
        fails.append('learn-split 不一致 %s' % bad)


def check_internal_links(log):
    log('[9] 学习章节内链:')
    papers = {x['id'] for x in load('data/papers-index.json')['papers']}
    modules = {os.path.basename(f)[:-5]: len(load(f)['sections'])
               for f in sorted(glob.glob('data/learn/*.json'))}
    broken = []
    for mid, n in modules.items():
        d = load('data/learn/%s.json' % mid)
        for i, sec in enumerate(d['sections']):
            c = sec.get('content') or ''
            for pid in set(re.findall(r'/papers/(p\d+)', c)):
                if pid not in papers:
                    broken.append(('%s#%d' % (mid, i), 'paper', pid))
            for mod, idx in set(re.findall(r'/learn/([a-z0-9-]+)/(\d+)', c)):
                if mod not in modules:
                    broken.append(('%s#%d' % (mid, i), 'module', mod))
                elif int(idx) >= modules[mod]:
                    broken.append(('%s#%d' % (mid, i), 'index', '%s/%s' % (mod, idx)))
    log('    失效内链: %d %s' % (len(broken), broken[:8]))
    if broken:
        fails.append('失效内链 %d 处 %s' % (len(broken), broken[:5]))


def check_ascii_quotes(log):
    log('[10] ASCII 双引号（规范用「」，仅告警）:')
    hits = []
    for path, key in DATASETS:
        for x in load(path)[key]:
            for f in ('summary', 'description', 'tldr', 'impact'):
                if '"' in (x.get(f) or ''):
                    hits.append('%s.%s' % (x['id'], f))
    log('    命中: %d %s' % (len(hits), hits[:8]))
    if hits:
        warns.append('ASCII 双引号 %d 处（历史遗留）' % len(hits))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--quiet', action='store_true')
    args = ap.parse_args()
    global QUIET
    QUIET = args.quiet
    log = out

    for fn in (check_json_parse, check_ids, check_content_dups, check_categories,
               check_total_items, check_opensource_assets, check_papers_assets,
               check_learn_split, check_internal_links, check_ascii_quotes):
        fn(log)

    print()
    print('=' * 60)
    if warns:
        print('告警 %d 项:' % len(warns))
        for w in warns:
            print('  - ' + w)
    if fails:
        print('巡检结果: FAIL —— %d 项必修问题' % len(fails))
        for f in fails:
            print('  ! ' + f)
    else:
        print('巡检结果: ALL OK')
    print('=' * 60)
    return 1 if fails else 0


if __name__ == '__main__':
    sys.exit(main())
