import json, os
d = "data/learn"
for f in sorted(os.listdir(d)):
    if f.endswith(".json"):
        with open(os.path.join(d, f), encoding="utf-8") as fp:
            data = json.load(fp)
        print(f"{f}: {len(data.get('sections', []))} sections")
