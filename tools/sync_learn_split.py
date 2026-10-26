"""
sync_learn_split.py — 学习模块拆分同步工具

把 data/learn/<mod>.json (单整文件) 同步到 data/learn-split/<mod>/{_index.json, sec-NN.json}
前端按需加载（B 方案）。

用法：
  python tools/sync_learn_split.py            # 全量重建
  python tools/sync_learn_split.py vla-models # 只同步指定模块

automation-5 在每次写完 learn/*.json 后应在最后调用一次本脚本（无参=全量同步）。
脚本是幂等的，可重复运行；只有内容变化的文件才会被重写（mtime 不变以减少 git diff 噪声）。
"""
import json
import os
import sys
import shutil
import re
from normalize_learn import est_minutes, map_prose


def plain_text(text):
    text = re.sub(r'!?\[([^\]]+)\]\([^\n]*?\)', r'\1', text)
    text = re.sub(r'https?://\S+|<[^>]+>', '', text)
    return re.sub(r'\s+', ' ', text.replace('`', '').replace('**', '')).strip()


def reading_metadata(content):
    """Derived browsing estimate and searchable outline; never overwrite study estimates."""
    prose = []
    map_prose(content, lambda chunk: prose.append(chunk) or chunk)
    text = '\n'.join(prose)
    headings = list(dict.fromkeys(plain_text(m) for m in
        re.findall(r'^\s{0,3}#{1,6}\s+(.+?)\s*#*\s*$', text, re.M)))
    paragraphs = [plain_text(p) for p in re.split(r'\n\s*\n', text)
                  if p.strip() and not re.match(r'^\s*(?:#|\||\$|---|>)', p)]
    summary = next((p[:180] for p in paragraphs if len(p) >= 20), '')
    return {'readingMinutes': est_minutes(content), 'headings': headings, 'summary': summary}

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(ROOT, 'data', 'learn')
DST_DIR = os.path.join(ROOT, 'data', 'learn-split')


def read_json(path):
    with open(path, encoding='utf-8') as stream:
        return json.load(stream)


def write_if_changed(path, obj):
    """只在内容变化时写入。返回 True=有变化。"""
    new_text = json.dumps(obj, ensure_ascii=False, indent=2)
    if os.path.exists(path):
        with open(path, encoding='utf-8') as stream:
            old = stream.read()
        if old == new_text:
            return False
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as stream:
        stream.write(new_text)
    return True


def sync_module(mod_id):
    src = os.path.join(SRC_DIR, mod_id + '.json')
    if not os.path.exists(src):
        print(f'  [skip] {mod_id}: src not found')
        return 0
    d = read_json(src)
    out_dir = os.path.join(DST_DIR, mod_id)
    os.makedirs(out_dir, exist_ok=True)

    sections = d.get('sections', [])
    sec_meta = []
    written = 0

    # 写 sections
    valid_sec_files = set()
    for i, sec in enumerate(sections, 1):
        sec_id = f'sec-{i:02d}'
        sec_path = os.path.join(out_dir, sec_id + '.json')
        valid_sec_files.add(sec_id + '.json')
        if write_if_changed(sec_path, sec):
            written += 1
        # 元信息要够前端直接渲染「模块大纲」卡片（难度/时长/分层），
        # 缺一个就会出现大纲页时长为 0、全部落到默认难度的静默降级。
        m = {
            'id': sec_id,
            'title': sec.get('title', ''),
            'lastUpdated': sec.get('lastUpdated', ''),
            'chars': len(sec.get('content', '')),
        }
        for k in ('shortTitle', 'difficulty', 'estimatedMinutes', 'isFrontier', 'isBrief'):
            if sec.get(k) not in (None, '', False):
                m[k] = sec[k]
        if sec.get('tier') is not None:
            m['tier'] = sec['tier']
        m.update(reading_metadata(sec.get('content') or ''))
        sec_meta.append(m)

    # 清理失效的旧 sec-NN.json（如某模块从 14 节改到 11 节）
    for fn in os.listdir(out_dir):
        if fn.startswith('sec-') and fn.endswith('.json') and fn not in valid_sec_files:
            os.remove(os.path.join(out_dir, fn))
            written += 1

    # 写 _index.json：复制非 sections 字段 + 加 sectionsMeta
    index_obj = {k: v for k, v in d.items() if k != 'sections'}
    index_obj['sectionsMeta'] = sec_meta
    index_obj['readingMinutes'] = sum(s['readingMinutes'] for s in sec_meta)
    index_obj['readingEstimateMethod'] = 'browse-v1: Chinese 400 chars/min; English 220 words/min; code 900 chars/min; excludes practice'
    index_obj['chars'] = sum(s['chars'] for s in sec_meta)
    if write_if_changed(os.path.join(out_dir, '_index.json'), index_obj):
        written += 1

    if written:
        print(f'  [sync] {mod_id}: {len(sections)} sections, {written} files updated')
    return written


def sync_catalog():
    """Publish real IDs and chapter counts into the existing learning-path catalog."""
    path = os.path.join(ROOT, 'data', 'learning-path.json')
    catalog = read_json(path)
    sources = {fn[:-5]: read_json(os.path.join(SRC_DIR, fn))
               for fn in sorted(os.listdir(SRC_DIR)) if fn.endswith('.json')}
    names = {d['name']: mid for mid, d in sources.items()}
    aliases = {'云边端协同架构': 'cloud-edge-collaboration',
               'MLOps与持续交付': 'platform-engineering',
               '具身Agent实战项目': 'embodied-agent'}
    seen = set()
    for stage in catalog.get('stages', []):
        for module in stage.get('modules', []):
            mid = module.get('id') or names.get(module['name']) or aliases.get(module['name'])
            if mid not in sources or mid in seen:
                raise ValueError('Unknown or duplicate learning module: ' + str(module.get('name')))
            seen.add(mid)
            source = sources[mid]
            sections = source.get('sections', [])
            module.update(id=mid, name=source['name'], sectionCount=len(sections),
                          readingMinutes=sum(est_minutes(s.get('content') or '') for s in sections),
                          chars=sum(len(s.get('content') or '') for s in sections))
            if source.get('lastUpdated'):
                module['lastUpdated'] = source['lastUpdated']
            if source.get('studyGuide'):
                module['weeklyPlan'] = source.get('weeklyPlan', module.get('weeklyPlan', ''))
    if seen != set(sources):
        raise ValueError('Learning modules missing from catalog: ' + repr(set(sources) - seen))
    catalog['lastUpdated'] = max((d.get('lastUpdated') or '' for d in sources.values()), default='')
    # Preserve this file's existing one-space indentation to keep changes reviewable.
    text = json.dumps(catalog, ensure_ascii=False, indent=1) + '\n'
    with open(path, encoding='utf-8') as f:
        old = f.read()
    if old != text:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(text)
        print(f'  [catalog] synchronized {len(sources)} module IDs, counts and browsing estimates')


def main():
    if len(sys.argv) > 1:
        mods = sys.argv[1:]
    else:
        mods = [fn[:-5] for fn in sorted(os.listdir(SRC_DIR)) if fn.endswith('.json')]

    # 清理 split 目录里 source 不存在的模块
    if os.path.isdir(DST_DIR) and len(sys.argv) == 1:
        src_set = set(mods)
        for d in os.listdir(DST_DIR):
            if os.path.isdir(os.path.join(DST_DIR, d)) and d not in src_set:
                shutil.rmtree(os.path.join(DST_DIR, d))
                print(f'  [drop] {d}: removed (no source)')

    total_changed = 0
    for m in mods:
        total_changed += sync_module(m)
    sync_catalog()
    print(f'\nDone. {len(mods)} modules processed, {total_changed} files written.')


if __name__ == '__main__':
    main()
