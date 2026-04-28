import json
for name in ["linear-algebra", "calculus-optimization", "probability-statistics"]:
    d = json.load(open(f"data/learn/{name}.json", "r", encoding="utf-8"))
    total = sum(len(s.get("content", "")) for s in d["sections"])
    print(f"\n=== {name} ({len(d['sections'])} sec, {total:,} chars) ===")
    for i, s in enumerate(d["sections"], 1):
        c = len(s.get("content", ""))
        mark = " [SHALLOW]" if c < 5500 else ""
        title = s['title'].encode('ascii','replace').decode('ascii')
        print(f"  {i:2d}. {title} ({c:,}){mark}")
