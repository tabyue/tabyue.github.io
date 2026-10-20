# -*- coding: utf-8 -*-
import json,glob,os,sys
sys.stdout.reconfigure(encoding='utf-8')
lp=json.load(open('data/learning-path.json',encoding='utf-8'))
print('top keys:',list(lp.keys())[:8])
names=[]
def walk(o):
    if isinstance(o,dict):
        if 'name' in o and isinstance(o['name'],str): names.append(o['name'])
        for v in o.values(): walk(v)
    elif isinstance(o,list):
        for v in o: walk(v)
walk(lp)
print('names count',len(names))
print(names[:40])
print('---- learn 顶层字段 ----')
d=json.load(open('data/learn/ai-infra.json',encoding='utf-8'))
print({k:v for k,v in d.items() if k!='sections'})
