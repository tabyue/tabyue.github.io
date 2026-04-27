import json
try:
    with open('data/learn/physics-simulation.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    print('JSON valid')
except json.JSONDecodeError as e:
    with open('data/learn/physics-simulation.json', 'r', encoding='utf-8') as f:
        s = f.read()
    pos = e.pos
    print(f'Error at pos {pos}')
    print(f'Context: ...{repr(s[pos-30:pos+30])}...')
    # Find unescaped quotes in the problematic area
    for i in range(max(0, pos-50), min(len(s), pos+50)):
        if s[i] == '"':
            print(f'  Quote at {i}: ...{repr(s[i-5:i+10])}...')
