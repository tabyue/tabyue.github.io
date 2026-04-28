import json

for mod in ['platform-engineering', 'sensors-hardware', 'robot-kinematics']:
    with open(f'data/learn/{mod}.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    print(f"=== {data.get('title', mod)} ===")
    for i, s in enumerate(data['sections']):
        c = len(s.get('content', ''))
        print(f"  {i+1:2d}. {s['title']} ({c} chars)")
    print()
