# -*- coding: utf-8 -*-
import json,io,sys
sys.stdout.reconfigure(encoding='utf-8')
d=json.load(open('data/learn/ai-infra.json',encoding='utf-8'))
print('lastUpdated',d.get('lastUpdated'))
for s in d['sections']:
    if len(s.get('content',''))<3000:
        print('---',s.get('shortTitle'),'|',s.get('title'),'|',len(s.get('content','')),'|tier',s.get('tier'))
        print(s.get('content','')[:900])
