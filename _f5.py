# -*- coding: utf-8 -*-
import json, glob, os, re, sys
sys.stdout.reconfigure(encoding='utf-8')
TS = '2026-10-20T10:20'
H = re.compile(r'^#{2,3}\s+(.+?)\s*$', re.M)
KEY_PRAC = ('代码', '实战', '实践', '示例', '实现', '案例', '动手', '跑一遍')
KEY_SUM = ('小结', '总结', '要点', '回顾', '本章', '练习', '参考')
n = 0
for p in sorted(glob.glob('data/learn/*.json')):
    mid = os.path.basename(p)[:-5]
    d = json.load(open(p, encoding='utf-8'))
    touched = False
    for s in d['sections']:
        c = s.get('content', '')
        if len(c) < 15000 or '本节导航' in c[:200]:
            continue
        titles = [m.group(1).strip() for m in H.finditer(c)]
        if len(titles) < 3:
            continue
        # 去掉明显是代码注释的伪标题
        titles = [t for t in titles if not t.startswith('=')]
        mins = max(8, round(len(c) / 500))
        picks = [titles[0]]
        for t in titles[1:]:
            if any(k in t for k in KEY_PRAC):
                picks.append(t); break
        for t in reversed(titles):
            if any(k in t for k in KEY_SUM):
                if t not in picks:
                    picks.append(t)
                break
        pick_s = ' → '.join('**%s**' % t for t in picks)
        nav = '> **本节导航** ｜ 约 %d 字 · %d 个小节 · 建议 %d 分钟\n>\n' % (len(c), len(titles), mins)
        nav += '> 时间有限的话，优先读：%s\n>\n' % pick_s
        nav += '> 全节结构：\n>\n'
        for i, t in enumerate(titles, 1):
            nav += '> %d. %s\n' % (i, t)
        nav += '\n'
        s['content'] = nav + c
        s['chars'] = len(s['content'])
        s['lastUpdated'] = TS
        touched = True
        n += 1
        print('[导航] %-28s %6d字 %2d小节 | %s' % (mid, len(c), len(titles), (s.get('shortTitle') or '')[:22]))
    if touched:
        d['lastUpdated'] = TS
        json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('加导航的章节数 =', n)
