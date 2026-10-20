import json,glob,os,sys
sys.stdout.reconfigure(encoding='utf-8')
from collections import Counter
c=Counter(); tot=Counter()
for p in sorted(glob.glob('data/learn/*.json')):
    mid=os.path.basename(p)[:-5]
    d=json.load(open(p,encoding='utf-8'))
    for s in d['sections']:
        tot[mid]+=1
        if len(s.get('content',''))<3000: c[mid]+=1
for k,v in c.most_common():
    print('%-32s %2d/%-3d 节偏薄'%(k,v,tot[k]))
print('合计薄章节',sum(c.values()))
