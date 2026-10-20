# -*- coding: utf-8 -*-
import json,sys
sys.stdout.reconfigure(encoding='utf-8')
lp=json.load(open('data/learning-path.json',encoding='utf-8'))
TS='2026-10-20T10:20'
n=0
def walk(o):
    global n
    if isinstance(o,dict):
        nm=o.get('name')
        if isinstance(nm,str) and 'Agent' in nm and o.get('lastUpdated')!=TS:
            print('  bump:',nm,'|',o.get('lastUpdated'),'->',TS)
            o['lastUpdated']=TS; n+=1
        for v in o.values(): walk(v)
    elif isinstance(o,list):
        for v in o: walk(v)
walk(lp)
json.dump(lp,open('data/learning-path.json','w',encoding='utf-8'),ensure_ascii=False,indent=2)
print('补充同步 =',n)
