# -*- coding: utf-8 -*-
import json,glob,os,sys,re
sys.stdout.reconfigure(encoding='utf-8')
rows=[]
for p in sorted(glob.glob('data/learn/*.json')):
    mid=os.path.basename(p)[:-5]
    d=json.load(open(p,encoding='utf-8'))
    s=d['sections']
    ent=[x for x in s if x.get('difficulty')=='入门']
    # 前3节难度
    head=[ (x.get('difficulty') or '?') for x in s[:3]]
    # 前3节平均字数
    hc=sum(len(x.get('content','')) for x in s[:3])/max(1,len(s[:3]))
    rows.append((mid,len(s),len(ent),'/'.join(head),int(hc)))
print('模块 | 节数 | 入门节数 | 前3节难度 | 前3节均字')
for r in sorted(rows,key=lambda r:r[2]):
    print('%-32s %3d  %3d  %-14s %6d'%r)
print()
tot=sum(r[2] for r in rows); n=sum(r[1] for r in rows)
print('入门章节 %d / %d = %.1f%%'%(tot,n,100*tot/n))
print()
# 超长章节：是否有足够二级标题
print('=== 超长章节的二级标题数（<5 个说明没法扫读）===')
for p in sorted(glob.glob('data/learn/*.json')):
    mid=os.path.basename(p)[:-5]
    d=json.load(open(p,encoding='utf-8'))
    for i,x in enumerate(d['sections']):
        c=x.get('content','')
        if len(c)>15000:
            h=len(re.findall(r'^## ',c,re.M))
            print('%6d 字 | %4d 个二级标题 | %-30s | %s'%(len(c),h,mid,(x.get('shortTitle') or '')[:26]))
