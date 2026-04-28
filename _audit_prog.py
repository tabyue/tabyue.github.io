import json
for name in ["python-scientific-computing", "cpp-fundamentals"]:
    d = json.load(open(f"data/learn/{name}.json", "r", encoding="utf-8"))
    total = sum(len(s.get("content", "")) for s in d["sections"])
    print(f"\n=== {d['name']} ({len(d['sections'])} sec, {total:,} chars) ===")
    for i, s in enumerate(d["sections"], 1):
        c = len(s.get("content", ""))
        print(f"  {i:2d}. {s['title']} ({c:,})")
