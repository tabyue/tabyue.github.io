"""
build_sitemap.py — 生成 sitemap.xml 和 robots.txt

抓取：
  - 10 个一级板块路径
  - data/learning-path.json 中的 30 个学习模块
  - data/learn-split/<mod>/_index.json 中的 sectionsMeta（章节深链接）

输出到仓库根目录的 sitemap.xml 和 robots.txt。
"""
import json
import os
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = 'https://www.tabyue.com'
TODAY = date.today().isoformat()

SECTIONS = [
    ('/', 'daily', '1.0'),
    ('/learn', 'daily', '0.9'),
    ('/papers', 'daily', '0.9'),
    ('/opensource', 'daily', '0.8'),
    ('/news', 'daily', '0.9'),
    ('/jobs', 'daily', '0.7'),
    ('/models', 'weekly', '0.7'),
    ('/datasets', 'weekly', '0.7'),
    ('/hardware', 'weekly', '0.7'),
    ('/glossary', 'weekly', '0.6'),
]


def url_entry(loc, lastmod, changefreq, priority):
    return (f'  <url>\n'
            f'    <loc>{SITE}{loc}</loc>\n'
            f'    <lastmod>{lastmod}</lastmod>\n'
            f'    <changefreq>{changefreq}</changefreq>\n'
            f'    <priority>{priority}</priority>\n'
            f'  </url>\n')


def main():
    out = ['<?xml version="1.0" encoding="UTF-8"?>\n',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n']

    # 1) 一级板块
    for path, freq, prio in SECTIONS:
        out.append(url_entry(path, TODAY, freq, prio))

    # 2) 学习模块（从 learning-path.json 列出有效模块 id）
    lp_path = os.path.join(ROOT, 'data', 'learning-path.json')
    valid_mods = []
    if os.path.exists(lp_path):
        lp = json.load(open(lp_path, encoding='utf-8'))
        for stage in lp.get('stages', []):
            for m in stage.get('modules', []):
                if m.get('name'):
                    mid = m['name'].replace('/', '-').replace(' ', '-').replace('(', '-').replace(')', '-').lower()
                    valid_mods.append(mid)

    # 3) 学习模块路径 + 章节深链接
    split_dir = os.path.join(ROOT, 'data', 'learn-split')
    learn_count = 0
    sec_count = 0
    if os.path.isdir(split_dir):
        for mod in sorted(os.listdir(split_dir)):
            mod_dir = os.path.join(split_dir, mod)
            if not os.path.isdir(mod_dir):
                continue
            idx_path = os.path.join(mod_dir, '_index.json')
            if not os.path.exists(idx_path):
                continue
            d = json.load(open(idx_path, encoding='utf-8'))
            mod_lastmod = (d.get('lastUpdated') or TODAY)[:10]
            # 模块入口
            out.append(url_entry(f'/learn/{mod}', mod_lastmod, 'weekly', '0.7'))
            learn_count += 1
            # 各章节
            for i, sec in enumerate(d.get('sectionsMeta', []), 1):
                sec_lastmod = (sec.get('lastUpdated') or mod_lastmod or TODAY)[:10]
                out.append(url_entry(f'/learn/{mod}/{i}', sec_lastmod, 'weekly', '0.6'))
                sec_count += 1

    out.append('</urlset>\n')
    sitemap_path = os.path.join(ROOT, 'sitemap.xml')
    open(sitemap_path, 'w', encoding='utf-8').write(''.join(out))
    print(f'sitemap.xml: {len(SECTIONS)} sections + {learn_count} modules + {sec_count} chapters')

    # robots.txt
    robots_path = os.path.join(ROOT, 'robots.txt')
    robots = (
        'User-agent: *\n'
        'Allow: /\n'
        'Disallow: /data/\n'
        'Disallow: /tools/\n'
        'Disallow: /404.html\n'
        '\n'
        f'Sitemap: {SITE}/sitemap.xml\n'
    )
    open(robots_path, 'w', encoding='utf-8').write(robots)
    print(f'robots.txt: ok')


if __name__ == '__main__':
    main()
