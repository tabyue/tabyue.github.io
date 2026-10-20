# -*- coding: utf-8 -*-
import json,re,sys
sys.stdout.reconfigure(encoding='utf-8')
d=json.load(open('data/learn/world-models-llm.json',encoding='utf-8'))
for x in d['sections']:
    if len(x['content'])>20000:
        c=x['content']
        print('len',len(c))
        print('^##  ->',len(re.findall(r'^## ',c,re.M)))
        print('^##  ->',len(re.findall(r'^##',c,re.M)))
        print('^### ->',len(re.findall(r'^###',c,re.M)))
        print('----- first 600 -----')
        print(repr(c[:600]))
        print('----- all lines starting with # -----')
        for ln in c.split('\n'):
            if ln.lstrip().startswith('#'):
                print(ln[:60])
        break
