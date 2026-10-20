# -*- coding: utf-8 -*-
import json,sys
sys.stdout.reconfigure(encoding='utf-8')
for mid in ['imitation-learning','sim-to-real','reinforcement-learning','control-theory']:
    d=json.load(open('data/learn/%s.json'%mid,encoding='utf-8'))
    seen={}
    for i,s in enumerate(d['sections']):
        st=s.get('shortTitle') or ''
        seen.setdefault(st,[]).append((i,s.get('title'),len(s.get('content',''))))
    print('==',mid)
    for st,v in seen.items():
        if len(v)>1:
            for i,t,c in v: print('   [%2d] short=%r title=%r  %d字'%(i,st,t,c))
