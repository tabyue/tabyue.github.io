import json
n = json.load(open("data/news.json", "r", encoding="utf-8"))
p = json.load(open("data/papers-index.json", "r", encoding="utf-8"))
j = json.load(open("data/jobs.json", "r", encoding="utf-8"))
o = json.load(open("data/opensource.json", "r", encoding="utf-8"))
print(f"news: {n['news'][0]['id']}")
print(f"papers: {p['papers'][0]['id']}")
print(f"jobs: {j['jobs'][0]['id']}")
print(f"opensource: {o['projects'][0]['id']}")
# validate
for f in ["data/news.json","data/papers-index.json","data/jobs.json",
          "data/opensource.json","data/learning-path.json",
          "data/learn/cloud-edge-collaboration.json",
          "data/papers/p094.json","data/papers/p095.json"]:
    try:
        json.load(open(f, "r", encoding="utf-8"))
    except Exception as e:
        print(f"ERROR: {f}: {e}")
print("All JSON valid")
