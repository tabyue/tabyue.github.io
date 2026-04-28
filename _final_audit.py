import json, os

learn_dir = "data/learn"
all_files = sorted(f for f in os.listdir(learn_dir) if f.endswith('.json'))
results = []
grand_sec = grand_chars = 0

for f in all_files:
    with open(os.path.join(learn_dir, f), 'r', encoding='utf-8') as fh:
        data = json.load(fh)
    secs = data.get('sections', [])
    n = len(secs)
    chars = sum(len(s.get('content', '')) for s in secs)
    grand_sec += n
    grand_chars += chars
    status = "OK" if chars >= 80000 else ("FAIR" if chars >= 50000 else "LOW")
    results.append((chars, f.replace('.json',''), n, status))

results.sort()
ok = sum(1 for _,_,_,s in results if s == "OK")
fair = sum(1 for _,_,_,s in results if s == "FAIR")
low = sum(1 for _,_,_,s in results if s == "LOW")

print(f"Total: {grand_sec} sections / {grand_chars:,} chars")
print(f"OK(>=80K): {ok} | FAIR(50-80K): {fair} | LOW(<50K): {low}")
print()
for chars, name, n, status in results:
    marker = " *" if status == "FAIR" else ""
    print(f"{status:4s} {chars:>7,} {n:>3}sec  {name}{marker}")
