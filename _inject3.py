import json, datetime

def inject_sections(module_file, sections_file):
    with open(module_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    with open(sections_file, 'r', encoding='utf-8') as f:
        new_sections = json.load(f)
    
    now = datetime.datetime.now().strftime('%Y-%m-%dT%H:%M')
    
    for s in new_sections:
        s['lastUpdated'] = now
    
    data['sections'] = new_sections + data['sections']
    data['lastUpdated'] = now
    
    with open(module_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    total = sum(len(s.get('content', '')) for s in data['sections'])
    print(f"{module_file}: {len(data['sections'])} sections, {total} chars")

inject_sections('data/learn/platform-engineering.json', '_plat_sections.json')
inject_sections('data/learn/sensors-hardware.json', '_sensor_sections.json')
inject_sections('data/learn/robot-kinematics.json', '_kin_sections.json')
