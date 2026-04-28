import json, os

learn_dir = "data/learn"
files = sorted(f for f in os.listdir(learn_dir) if f.endswith('.json'))

print(f"{'Module':<45} {'Sec':>4} {'Chars':>7} {'Status'}")
print("-" * 75)

total_sec = 0
total_chars = 0
results = []

for f in files:
    path = os.path.join(learn_dir, f)
    with open(path, 'r', encoding='utf-8') as fh:
        data = json.load(fh)
    sections = data.get('sections', [])
    n = len(sections)
    chars = sum(len(s.get('content', '')) for s in sections)
    total_sec += n
    total_chars += chars
    
    # Determine status
    if chars >= 80000:
        status = "OK"
    elif chars >= 50000:
        status = "FAIR"
    else:
        status = "NEEDS WORK"
    
    name = data.get('title', f.replace('.json', ''))
    results.append((name, f, n, chars, status))
    print(f"{name:<45} {n:>4} {chars:>7} {status}")

print("-" * 75)
print(f"{'TOTAL':<45} {total_sec:>4} {total_chars:>7}")
print()

# Summary by status
ok = [r for r in results if r[4] == "OK"]
fair = [r for r in results if r[4] == "FAIR"]
needs = [r for r in results if r[4] == "NEEDS WORK"]
print(f"OK (>=80K): {len(ok)} modules")
print(f"FAIR (50-80K): {len(fair)} modules")
print(f"NEEDS WORK (<50K): {len(needs)} modules")
print()
for name, f, n, chars, status in needs:
    print(f"  {f:<45} {n:>3} sec / {chars:>5} chars")
