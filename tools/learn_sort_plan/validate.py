import json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODS = ['vla-models', 'world-models-llm', 'imitation-learning',
        'reinforcement-learning', 'deep-learning', 'embodied-agent']
PLAN = os.path.join(ROOT, 'tools', '_sort_plan')
ok = True

for m in MODS:
    data = json.load(open(os.path.join(ROOT, 'data', 'learn', m + '.json'), encoding='utf-8'))
    n = len(data['sections'])
    plan = json.load(open(os.path.join(PLAN, m + '.json'), encoding='utf-8'))
    errs = []
    if plan['module'] != m:
        errs.append('module 字段不符')
    if not plan['changed']:
        if plan['order'] or plan['tiers']:
            errs.append('changed=false 时 order/tiers 应为空')
        print('%-24s n=%2d changed=False  %s' % (m, n, plan['reason']))
        continue
    o = plan['order']
    if len(o) != n:
        errs.append('order 长度 %d != 章节数 %d' % (len(o), n))
    if sorted(o) != list(range(n)):
        errs.append('order 不是 0..%d 的完整排列（重复/缺失/越界）' % (n - 1))
    # tiers 必须是原索引的划分，且与 order 的 tier 分段一致
    tier_flat = []
    for k in sorted(plan['tiers'], key=int):
        tier_flat += plan['tiers'][k]
    if sorted(tier_flat) != list(range(n)):
        errs.append('tiers 未覆盖全部章节或不重不漏')
    if tier_flat != o:
        errs.append('tiers 拼接顺序与 order 不一致')
    status = 'OK' if not errs else 'FAIL'
    if errs:
        ok = False
    print('%-24s n=%2d changed=True   %s  %s' % (m, n, status, '; '.join(errs)))
    if not errs:
        titles = [data['sections'][i]['title'][:26] for i in o]
        print('    新序: ' + ' | '.join('%d:%s' % (i, t) for i, t in list(zip(o, titles))[:4]) + ' ...')

print('\n总体:', 'PASS' if ok else 'FAIL')
sys.exit(0 if ok else 1)
