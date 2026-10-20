# -*- coding: utf-8 -*-
"""学习中心正文写入公共逻辑（临时脚本用）"""
import json, sys, os
sys.stdout.reconfigure(encoding='utf-8')
D = 'data'

# learn/*.json 的模块名 -> learning-path.json 中的模块名（精确匹配即可，此处保留别名兜底）
ALIAS = {
    'sim-to-real': ['Sim-to-Real 迁移', 'Sim-to-Real'],
    'physics-simulation': ['物理仿真引擎'],
    'sensors-hardware': ['传感器与硬件接口'],
    'computer-vision': ['计算机视觉基础'],
    '3d-vision-pointcloud': ['3D 视觉与点云'],
    'control-theory': ['控制理论'],
    'desktop-arm-project': ['桌面级机械臂项目'],
    'imitation-learning': ['模仿学习'],
    'embodied-agent': ['具身Agent实战项目', '具身Agent'],
    'platform-engineering': ['MLOps与持续交付', 'MLOps'],
    'cloud-edge-collaboration': ['云边端协同架构', '云边'],
}


def insert_section(mid, sec, ts):
    """把一节插到该模块 tier3 区块末尾，并同步 3 处 lastUpdated。"""
    p = f'{D}/learn/{mid}.json'
    d = json.load(open(p, encoding='utf-8'))
    secs = d['sections']
    for s in secs:
        if s.get('shortTitle') == sec['shortTitle']:
            print('  SKIP exists:', mid, sec['shortTitle'])
            return False
    idx = len(secs)
    for i, s in enumerate(secs):
        if (s.get('tier') or 0) >= 3:
            idx = i + 1
    sec['chars'] = len(sec['content'])
    secs.insert(idx, sec)
    d['lastUpdated'] = ts
    with open(p, 'w', encoding='utf-8') as f:
        json.dump(d, f, ensure_ascii=False, indent=2)

    lp_p = f'{D}/learning-path.json'
    lp = json.load(open(lp_p, encoding='utf-8'))
    hit = 0
    for st in lp.get('stages', []):
        for m in st.get('modules', []):
            nm = m.get('name', '')
            for a in ALIAS.get(mid, []):
                if a == nm or a in nm or nm in a:
                    m['lastUpdated'] = ts
                    hit += 1
                    break
    if not hit:
        print('  WARN: learning-path 未命中', mid, ALIAS.get(mid))
    lp['lastUpdated'] = ts
    with open(lp_p, 'w', encoding='utf-8') as f:
        json.dump(lp, f, ensure_ascii=False, indent=1)
    print(f'  OK {mid:<24} [idx {idx}] {sec["shortTitle"]}  {len(sec["content"])} chars')
    return True


def mk(title, short, minutes, content, ts, tier=3, diff='高级'):
    return dict(title=title, shortTitle=short, tier=tier, difficulty=diff,
                estimatedMinutes=minutes, isFrontier=True, isBrief=False,
                lastUpdated=ts, content=content)
