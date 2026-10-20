# -*- coding: utf-8 -*-
import json, os, sys, glob
sys.stdout.reconfigure(encoding='utf-8')
out = []
files = sorted(glob.glob('data/learn/*.json'))
rows = []
for f in files:
    d = json.load(open(f, encoding='utf-8'))
    secs = d.get('sections', [])
    total = sum(len(s.get('content', '')) for s in secs)
    rows.append((total, d.get('id'), d.get('name'), len(secs), d.get('lastUpdated')))
rows.sort()
out.append('=== modules sorted by size ===')
for t, mid, name, n, lu in rows:
    out.append(f"{t/1000:7.1f}K | {mid:<30} | {name} | {n} secs | {lu}")

targets = ['sim-to-real', '3d-vision-pointcloud', 'physics-simulation', 'control-theory',
           'sensors-hardware', 'computer-vision', 'desktop-arm-project', 'academic-english',
           'data-collection', 'embodied-data-engineering']
out.append('')
out.append('=== target section lists ===')
for mid in targets:
    try:
        d = json.load(open(f'data/learn/{mid}.json', encoding='utf-8'))
    except Exception as e:
        out.append(f'ERR {mid} {e}'); continue
    out.append(f'== {mid} | {d.get("name")} | {len(d["sections"])} secs | lastUpdated={d.get("lastUpdated")}')
    for i, s in enumerate(d['sections']):
        out.append(f'   [{i}] t={s.get("tier")} | {s.get("shortTitle")} | {len(s.get("content",""))}c')
    out.append('   sec keys: ' + ','.join(sorted(d['sections'][0].keys())))

out.append('')
out.append('=== learning-path module names ===')
lp = json.load(open('data/learning-path.json', encoding='utf-8'))
out.append('lp top keys: ' + ','.join(lp.keys()))
for st in lp.get('stages', []):
    out.append(' stage: ' + str(st.get('name')) + ' | ' + str(st.get('id')))
    for m in st.get('modules', []):
        out.append('    - ' + str(m.get('name')) + ' | lu=' + str(m.get('lastUpdated')))
open('_ls2_out.txt', 'w', encoding='utf-8').write('\n'.join(out))
print('written _ls2_out.txt', len(out), 'lines')
