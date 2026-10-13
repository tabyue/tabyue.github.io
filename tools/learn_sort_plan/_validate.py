import json, os, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(os.path.dirname(os.path.dirname(ROOT)), "data", "learn")
MODS = ["linear-algebra", "calculus-optimization", "probability-statistics",
        "python-scientific-computing", "cpp-fundamentals", "academic-english"]

ok = True
for m in MODS:
    n = len(json.load(open(os.path.join(DATA, m + ".json"), encoding="utf-8"))["sections"])
    plan = json.load(open(os.path.join(ROOT, m + ".json"), encoding="utf-8"))
    errs = []
    if plan.get("module") != m:
        errs.append("module 字段不匹配")
    if plan["changed"]:
        o = plan["order"]
        if len(o) != n:
            errs.append("order 长度 %d != 章节数 %d" % (len(o), n))
        if sorted(o) != list(range(n)):
            errs.append("order 不是 0..%d 的排列" % (n - 1))
        tiers = plan.get("tiers", {})
        flat = []
        for k in ["0", "1", "2", "3"]:
            flat += tiers.get(k, [])
        if sorted(flat) != list(range(n)):
            errs.append("tiers 未覆盖全部章节或不重不漏")
        if flat != o:
            errs.append("tiers 拼接与 order 不一致")
        if not plan.get("reason"):
            errs.append("缺少 reason")
    else:
        if plan.get("order") or plan.get("tiers"):
            errs.append("changed=false 时 order/tiers 应为空")
    status = "OK " if not errs else "FAIL"
    if errs:
        ok = False
    print("%s %-30s n=%2d changed=%-5s %s" % (status, m, n, plan["changed"], "; ".join(errs)))

print("\nALL PASS" if ok else "\nHAS FAILURES")
sys.exit(0 if ok else 1)
