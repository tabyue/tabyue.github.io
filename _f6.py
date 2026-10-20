# -*- coding: utf-8 -*-
import json,glob,os,sys
sys.stdout.reconfigure(encoding='utf-8')
lp=json.load(open('data/learning-path.json',encoding='utf-8'))
# 收集本轮改过的模块 name -> lastUpdated
bump={}
for p in sorted(glob.glob('data/learn/*.json')):
    d=json.load(open(p,encoding='utf-8'))
    lu=d.get('lastUpdated') or ''
    if lu.startswith('2026-10-20'):
        bump[(d.get('name') or '').strip()]=lu
n=0
def walk(o):
    global n
    if isinstance(o,dict):
        nm=(o.get('name') or '').strip() if isinstance(o.get('name'),str) else None
        if nm in bump and o.get('lastUpdated')!=bump[nm]:
            o['lastUpdated']=bump[nm]; n+=1
        for v in o.values(): walk(v)
    elif isinstance(o,list):
        for v in o: walk(v)
walk(lp)
lp['lastUpdated']='2026-10-20T10:20'
json.dump(lp,open('data/learning-path.json','w',encoding='utf-8'),ensure_ascii=False,indent=2)
print('本轮改过的模块数 =',len(bump))
print('learning-path 已同步 lastUpdated 的模块数 =',n)
miss=[k for k in bump if k not in json.dumps(lp,ensure_ascii=False)]
print('未匹配上的:',miss)
