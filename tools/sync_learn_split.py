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

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(ROOT, 'data', 'learn')
DST_DIR = os.path.join(ROOT, 'data', 'learn-split')


def write_if_changed(path, obj):
    """只在内容变化时写入。返回 True=有变化。"""
    new_text = json.dumps(obj, ensure_ascii=False, indent=2)
    if os.path.exists(path):
        old = open(path, encoding='utf-8').read()
        if old == new_text:
            return False
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, 'w', encoding='utf-8').write(new_text)
    return True


def sync_module(mod_id):
    src = os.path.join(SRC_DIR, mod_id + '.json')
    if not os.path.exists(src):
        print(f'  [skip] {mod_id}: src not found')
        return 0
    d = json.load(open(src, encoding='utf-8'))
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
        sec_meta.append({
            'id': sec_id,
            'title': sec.get('title', ''),
            'lastUpdated': sec.get('lastUpdated', ''),
            'chars': len(sec.get('content', '')),
        })

    # 清理失效的旧 sec-NN.json（如某模块从 14 节改到 11 节）
    for fn in os.listdir(out_dir):
        if fn.startswith('sec-') and fn.endswith('.json') and fn not in valid_sec_files:
            os.remove(os.path.join(out_dir, fn))
            written += 1

    # 写 _index.json：复制非 sections 字段 + 加 sectionsMeta
    index_obj = {k: v for k, v in d.items() if k != 'sections'}
    index_obj['sectionsMeta'] = sec_meta
    if write_if_changed(os.path.join(out_dir, '_index.json'), index_obj):
        written += 1

    if written:
        print(f'  [sync] {mod_id}: {len(sections)} sections, {written} files updated')
    return written


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
    print(f'\nDone. {len(mods)} modules processed, {total_changed} files written.')


if __name__ == '__main__':
    main()
