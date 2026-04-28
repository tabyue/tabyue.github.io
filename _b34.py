import json

# 注入微积分新 section
with open("_calc_new.json", "r", encoding="utf-8") as f:
    new_secs = json.load(f)

with open("data/learn/calculus-optimization.json", "r", encoding="utf-8") as f:
    calc = json.load(f)

# 追加到末尾
for s in new_secs:
    calc["sections"].append(s)

# 同时扩充浅 section
LAST = "2026-04-28T17:22"
for i, s in enumerate(calc["sections"]):
    c = len(s.get("content", ""))
    if c < 5500:
        title = s["title"]
        # 追加通用补充
        extra = ""
        if "梯度与 Jacobian" in title:
            extra = (
                "\n\n### Hessian 矩阵与二阶信息\n\n"
                "**Hessian** $H_{ij} = \\partial^2 f / \\partial x_i \\partial x_j$ 是梯度的 Jacobian。\n\n"
                "**正定 Hessian → 局部最小**；不定 → 鞍点。\n\n"
                "**牛顿法**用 Hessian 做二阶优化：$x \\leftarrow x - H^{-1}\\nabla f$，二次收敛但每步 $O(n^3)$。\n\n"
                "**Gauss-Newton**（最小二乘特化）：$J^TJ$ 近似 Hessian，避免算二阶导。\n\n"
                "**Fisher 信息矩阵** = 期望 Hessian（对数似然），自然梯度下降的基础。\n\n"
                "### 练习补充\n\n"
                "6. 对 Rosenbrock 函数计算梯度和 Hessian，验证在 $(1,1)$ 处 Hessian 正定。\n\n"
                "7. 实现 Gauss-Newton 法拟合非线性函数 $y = ae^{bx}$。"
            )
        elif "轨迹优化" in title:
            extra = (
                "\n\n### iLQR / DDP：非线性轨迹优化\n\n"
                "CVXPY 只能处理凸问题。非线性系统用 **iLQR**（iterative LQR）/ **DDP**（Differential Dynamic Programming）：\n"
                "- 在当前轨迹上做 Taylor 二阶展开 → 局部 LQR 子问题\n"
                "- 前向模拟 + 后向 Riccati → 更新轨迹\n"
                "- 迭代直到收敛\n\n"
                "这是 Drake / MuJoCo 中轨迹优化的标准算法。\n\n"
                "### 时间最优轨迹\n\n"
                "最小时间轨迹：$\\min T$ s.t. 动力学 + 约束。变量代换 $s(t)$（路径参数化）后变为凸问题（Bobrow/Slotine 1985）。\n\n"
                "### 练习补充\n\n"
                "6. 用 CasADi 实现一个 2-link 机械臂的 iLQR 轨迹优化。\n\n"
                "7. 实现时间最优路径跟踪（给定笛卡尔路径，找最快关节轨迹）。"
            )
        elif "李群" in title:
            extra = (
                "\n\n### 李群优化算法\n\n"
                "在 SE(3) 上优化（如 SLAM 后端/手眼标定）不能直接用欧几里得梯度——需要**李代数上的 retraction**：\n"
                "$T \\leftarrow T \\cdot \\exp(\\alpha \\xi)$，其中 $\\xi \\in \\mathfrak{se}(3)$ 是切向量。\n\n"
                "**Ceres Solver 的 LocalParameterization** 和 **GTSAM 的 on-manifold optimization** 都用这个思路。\n\n"
                "### Adjoint 表示\n\n"
                "$\\text{Ad}_T: \\mathfrak{se}(3) \\to \\mathfrak{se}(3)$ 描述坐标系变换对速度/力的作用。Spatial Jacobian 和 Body Jacobian 通过 Adjoint 互转。\n\n"
                "### 练习补充\n\n"
                "6. 用指数映射实现 SE(3) 上的梯度下降：$\\min \\|T \\cdot p - p_{target}\\|^2$。\n\n"
                "7. 验证 $\\log(\\exp(\\xi_1)\\exp(\\xi_2)) \\approx \\xi_1 + \\xi_2 + \\frac{1}{2}[\\xi_1, \\xi_2]$（BCH 公式一阶）。"
            )
        elif "SOCP" in title:
            extra = (
                "\n\n### 二阶锥约束的几何意义\n\n"
                "**二阶锥**：$\\{(x, t) : \\|x\\| \\leq t\\}$（冰淇淋锥）。\n\n"
                "SOCP 比 QP 更强但比 SDP 弱：LP ⊂ QP ⊂ SOCP ⊂ SDP。\n\n"
                "### 机器人力分配详解\n\n"
                "多点接触时，要在摩擦锥内分配法向力和切向力。摩擦锥 $\\|f_t\\| \\leq \\mu f_n$ 天然是二阶锥约束。\n\n"
                "**线性化摩擦锥**（多边形近似）变为 LP，但不精确。SOCP 保持锥约束的精确形式。\n\n"
                "### 练习补充\n\n"
                "6. 用 CVXPY 实现一个双足站立的力分配问题（2 个接触点，摩擦锥约束）。\n\n"
                "7. 对比 LP 近似 vs SOCP 精确摩擦锥的力分配精度。"
            )

        if extra:
            calc["sections"][i]["content"] += extra
            calc["sections"][i]["lastUpdated"] = LAST

calc["lastUpdated"] = LAST
with open("data/learn/calculus-optimization.json", "w", encoding="utf-8") as f:
    json.dump(calc, f, ensure_ascii=False, indent=2)

total = sum(len(s.get("content","")) for s in calc["sections"])
print(f"Calc-opt: {len(calc['sections'])} sec, {total:,} chars")
