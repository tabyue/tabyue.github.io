import json
import urllib.request
import urllib.error
import ssl

data = json.load(open('data/opensource.json', 'r', encoding='utf-8'))
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

bad = []
for i, p in enumerate(data['projects']):
    gh = p.get('github', '')
    url = p.get('url', '')
    pid = p.get('id', f'idx_{i}')
    name = p.get('name', '?')[:40]
    link = gh if gh else url
    if not link:
        bad.append((pid, name, 'NO_LINK'))
        continue
    try:
        req = urllib.request.Request(link, method='HEAD', headers={'User-Agent': 'Mozilla/5.0'})
        urllib.request.urlopen(req, timeout=10, context=ctx)
    except urllib.error.HTTPError as e:
        if e.code == 404:
            bad.append((pid, name, f'404: {link}'))
    except Exception:
        pass

if bad:
    print(f"Still {len(bad)} bad links:")
    for pid, name, info in bad:
        print(f"  {pid} | {name} | {info}")
else:
    print("All links OK! No more 404s.")
