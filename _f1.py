# -*- coding: utf-8 -*-
import json,glob,os,sys
sys.stdout.reconfigure(encoding='utf-8')
TS='2026-10-20T10:20'
# ---------- 1. tier 单调化（改 tier 值，不动数组顺序，URL 不变）----------
def isotone(t):
    out=list(t); prev=out[0]
    for i in range(1,len(out)):
        v=max(out[i],prev)
        if v-prev>1: v=prev+1
        v=min(v,3)
        out[i]=v; prev=v
    return out
changed=0
for p in sorted(glob.glob('data/learn/*.json')):
    mid=os.path.basename(p)[:-5]
    d=json.load(open(p,encoding='utf-8'))
    ts=[ (s.get('tier') or 0) for s in d['sections'] ]
    ns=isotone(ts)
    if ns!=ts:
        for s,v in zip(d['sections'],ns): s['tier']=v
        d['lastUpdated']=TS
        json.dump(d,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=2)
        changed+=1
        print('[tier] %-28s %s -> %s'%(mid,ts,ns))
print('tier 修正模块数 =',changed)
