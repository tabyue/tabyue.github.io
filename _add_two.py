import json

def add_section(file, title, content_file):
    with open(f'data/learn/{file}.json',encoding='utf-8') as f:
        d=json.load(f)
    with open(content_file,encoding='utf-8') as f:
        content=f.read()
    new_sec={
        "title": title,
        "difficulty": "高级",
        "content": content,
        "lastUpdated": "2026-05-29T10:46"
    }
    d['sections'].append(new_sec)
    d['lastUpdated']="2026-05-29T10:46"
    with open(f'data/learn/{file}.json','w',encoding='utf-8') as f:
        json.dump(d,f,ensure_ascii=False,indent=2)
    total=sum(len(s.get("content","")) for s in d['sections'])
    print(f'{file}: {len(d["sections"])} sec, {total//1000}K, +{len(content)} chars')

add_section('desktop-arm-project',
    "Wall-OSS-0.5 桌面机械臂零样本部署实战：4090 + SO-100 + 50 episodes",
    '_desktop_sec.md')

add_section('computer-vision',
    "VLA 时代的视觉编码器：从 ViT/SigLIP 到 Vision-Aligned RVQ",
    '_cv_sec.md')

# learning-path 更新
with open('data/learning-path.json',encoding='utf-8') as f:
    lp=json.load(f)

for si,s in enumerate(lp['stages']):
    for mi,m in enumerate(s.get('modules',[])):
        nm=m.get('name','')
        if '桌面机械臂' in nm:
            print(f'lp module: {nm} | before={m.get("lastUpdated")}')
            m['lastUpdated']='2026-05-29T10:46'
            print(f'  after={m["lastUpdated"]}')
        elif '计算机视觉' in nm or 'computer' in nm.lower():
            print(f'lp module: {nm} | before={m.get("lastUpdated")}')
            m['lastUpdated']='2026-05-29T10:46'
            print(f'  after={m["lastUpdated"]}')

lp['lastUpdated']='2026-05-29T10:46'
with open('data/learning-path.json','w',encoding='utf-8') as f:
    json.dump(lp,f,ensure_ascii=False,indent=2)
print('done')
