import json
d = json.load(open('data/news.json', 'r', encoding='utf-8'))
print('news first:', d['news'][0]['id'], d['news'][0]['title'][:50])
d2 = json.load(open('data/papers-index.json', 'r', encoding='utf-8'))
print('papers first:', d2['papers'][0]['id'], d2['papers'][0]['title'][:50])
d3 = json.load(open('data/jobs.json', 'r', encoding='utf-8'))
print('jobs first:', d3['jobs'][0]['id'], d3['jobs'][0]['title'][:50])
d4 = json.load(open('data/opensource.json', 'r', encoding='utf-8'))
print('os first:', d4['projects'][0]['id'], d4['projects'][0]['name'][:50])
d5 = json.load(open('data/learn/humanoid-fullstack.json', 'r', encoding='utf-8'))
print('humanoid sections:', len(d5['sections']))
for s in d5['sections']:
    print(f"  - {s['title'][:60]}")
