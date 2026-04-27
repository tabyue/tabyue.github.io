# -*- coding: utf-8 -*-
import json, glob, sys
sys.stdout.reconfigure(encoding='utf-8')

updated = [
    'calculus-optimization', 'probability-statistics', 'python-scientific-computing',
    'physics-simulation', 'platform-engineering', 'desktop-arm-project',
    'mobile-robot-navigation', 'embodied-agent', 'vla-models', 'ros2',
    'control-theory', 'robot-dynamics', 'mechanical-design', 'reinforcement-learning',
    'cloud-edge-collaboration', 'sim-to-real', 'embodied-data-engineering',
    'training-inference-optimization', 'humanoid-fullstack', '3d-vision-pointcloud'
]

files = glob.glob('data/learn/*.json')
not_updated = []
for f in sorted(files):
    d = json.load(open(f, 'r', encoding='utf-8'))
    name = f.replace('data\\learn\\', '').replace('.json', '')
    n = len(d.get('sections', []))
    lu = d.get('lastUpdated', '?')
    mod_name = d.get('name', '')
    is_upd = name in updated
    if not is_upd:
        not_updated.append((name, mod_name, n, lu))
        print(f'TODO  {name:42s} {n}sec  {lu}  {mod_name}')
    else:
        print(f'DONE  {name:42s} {n}sec  {lu}  {mod_name}')

print(f'\nNot updated: {len(not_updated)} modules')
print(f'Already updated: {len(files) - len(not_updated)} modules')
