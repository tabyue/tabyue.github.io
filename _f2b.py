# -*- coding: utf-8 -*-
import json,sys,re
sys.stdout.reconfigure(encoding='utf-8')
TS='2026-10-20T10:20'
p='data/learn/imitation-learning.json'
d=json.load(open(p,encoding='utf-8'))
for s in d['sections']:
    if s.get('title')=='Diffusion Policy': continue
    if s.get('shortTitle')=='Diffusion Policy':
        s['shortTitle']='扩散模型的崛起'; s['lastUpdated']=TS
        print('改:',s['title'],'->','扩散模型的崛起')
d['lastUpdated']=TS
json.dump(d,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=2)
print('ok')
