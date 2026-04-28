import json

LAST = "2026-04-28T16:52"

# ============== B1 新增 Section 1: Jordan 标准形 ==============
sec_jordan = {
    "title": "Jordan 标准形：当矩阵不可对角化",
    "lastUpdated": LAST,
    "content": r"""### 为什么需要 Jordan 标准形

\"可对角化\"是矩阵最舒服的状态——$A = P\Lambda P^{-1}$，幂次计算、微分方程求解都轻松。但**有些矩阵根本无法对角化**，最简单的例子：
$$A = \begin{pmatrix}2 & 1 \\ 0 & 2\end{pmatrix}$$

它只有一个特征值 $\lambda = 2$（代数重数 2），但对应的特征向量空间只有 1 维（几何重数 1）——缺一个特征向量，无法组成 2 维基。

**Jordan 标准形**是对这类矩阵的\"退而求其次\"——用**Jordan 块**取代纯对角的角色，得到**任何**方阵的标准化分解。

### 一、代数重数 vs 几何重数

**代数重数** $m_a(\lambda)$：$\lambda$ 在特征多项式 $\det(A - \lambda I)$ 中的重数。

**几何重数** $m_g(\lambda) = \dim\ker(A - \lambda I)$：对应特征值的线性无关特征向量个数。

**核心不等式**：
$$1 \leq m_g(\lambda) \leq m_a(\lambda)$$

- **可对角化 $\iff m_g(\lambda) = m_a(\lambda)$ 对所有特征值**
- $m_g < m_a$ → **亏损（defective）矩阵** → 不可对角化

**典型反例**：
$$A = \begin{pmatrix}2 & 1 \\ 0 & 2\end{pmatrix}: \ m_a(2) = 2,\ m_g(2) = 1 \text{（亏损）}$$

### 二、Jordan 块的定义

**$k$ 阶 Jordan 块**（特征值 $\lambda$）：
$$J_k(\lambda) = \begin{pmatrix}
\lambda & 1 & & \\
& \lambda & 1 & \\
& & \ddots & \ddots \\
& & & \lambda & 1 \\
& & & & \lambda
\end{pmatrix} \in \mathbb{R}^{k\times k}$$

对角线都是 $\lambda$，上对角线全是 1。当 $k = 1$ 时退化为标量 $\lambda$（普通对角元）。

**直觉**：Jordan 块是\"差一点就能对角化\"的矩阵——上对角那些 1 就是\"对角化缺失的部分\"。

### 三、Jordan 标准形定理

**定理**（复数域上）：任何复方阵 $A \in \mathbb{C}^{n\times n}$ 都存在可逆矩阵 $P$ 使
$$A = P J P^{-1}$$
其中 $J$ 是**Jordan 块对角矩阵**：
$$J = \text{diag}(J_{k_1}(\lambda_1), J_{k_2}(\lambda_2), \ldots, J_{k_r}(\lambda_r))$$

**Jordan 形的唯一性**：忽略 Jordan 块排列顺序，$J$ 由 $A$ 唯一确定。$(k_i, \lambda_i)$ 对叫 $A$ 的**Jordan 数据**。

**关键观察**：
- 每个 Jordan 块贡献**恰好 1 个**线性无关特征向量
- 特征值 $\lambda$ 的几何重数 = 对应 $\lambda$ 的 Jordan 块**个数**
- 特征值 $\lambda$ 的代数重数 = 对应 $\lambda$ 的所有 Jordan 块**阶数之和**
- 可对角化 $\iff$ 所有 Jordan 块都是 $1\times 1$

### 四、广义特征向量

Jordan 块结构对应 **Jordan 链**：一组向量 $v_1, v_2, \ldots, v_k$ 满足
$$Av_1 = \lambda v_1,\quad Av_i = \lambda v_i + v_{i-1}\ (i \geq 2)$$

等价地：$(A - \lambda I)v_i = v_{i-1}$，即 $v_i$ 是 $v_{i-1}$ 的\"前像\"。

**广义特征向量**：满足 $(A - \lambda I)^k v = 0$ 但 $(A - \lambda I)^{k-1} v \neq 0$ 的向量叫**$k$ 阶广义特征向量**。

**广义特征空间**：$E_\lambda^{\text{gen}} = \ker((A - \lambda I)^n)$——最终所有\"被 $(A-\lambda I)$ 反复作用降到零\"的向量。

**Cayley-Hamilton 定理**的一个推论：$\bigoplus_\lambda E_\lambda^{\text{gen}} = \mathbb{C}^n$——整个空间可以分解为各特征值的广义特征空间的直和。

### 五、计算 Jordan 形的实用步骤

对 $n\times n$ 矩阵 $A$：
1. **求特征多项式** $p_A(\lambda) = \det(\lambda I - A)$
2. **求所有特征值** $\lambda_1, \ldots, \lambda_s$ 及其代数重数 $m_a$
3. 对每个 $\lambda$：
   - 计算 $\text{rank}(A - \lambda I)^k$ 对 $k = 0, 1, 2, \ldots$
   - 差值 $\text{nullity}((A-\lambda I)^k) - \text{nullity}((A-\lambda I)^{k-1})$ 给出**$k$ 阶广义特征向量的"新增"数量**
   - 由此读出 Jordan 块结构

**$k$ 阶 Jordan 块数量公式**：
$$\#\{J_k(\lambda)\} = r_{k-1} - 2r_k + r_{k+1}$$
其中 $r_k = \text{rank}((A-\lambda I)^k)$。

```python
import numpy as np
import sympy as sp

# sympy 计算 Jordan 形
A_np = np.array([[5, 4, 2, 1],
                 [0, 1, -1, -1],
                 [-1, -1, 3, 0],
                 [1, 1, -1, 2]])
A = sp.Matrix(A_np)

P, J = A.jordan_form()
print('Jordan 标准形 J:')
sp.pprint(J)
print('\n过渡矩阵 P:')
sp.pprint(P)
print(f'\n验证 A = P J P^{{-1}}: {sp.simplify(P * J * P.inv() - A) == sp.zeros(4)}')

# 提取 Jordan 块信息
eigs = A.eigenvals()
print(f'\n特征值及代数重数: {eigs}')
for lam in eigs:
    ma = eigs[lam]
    mg = A.nullity() if lam == 0 else (A - lam*sp.eye(4)).nullity()
    print(f'  λ={lam}: 代数重数={ma}, 几何重数={mg}')
```

### 六、Jordan 形的应用 1：矩阵函数 $f(A)$

对 $A = PJP^{-1}$，定义 $f(A) = P f(J) P^{-1}$。

**对 Jordan 块的 $f$**（关键！）：
$$f(J_k(\lambda)) = \begin{pmatrix}
f(\lambda) & f'(\lambda) & \frac{f''(\lambda)}{2!} & \cdots & \frac{f^{(k-1)}(\lambda)}{(k-1)!} \\
& f(\lambda) & f'(\lambda) & \cdots & \frac{f^{(k-2)}(\lambda)}{(k-2)!} \\
& & \ddots & \ddots & \vdots \\
& & & f(\lambda) & f'(\lambda) \\
& & & & f(\lambda)
\end{pmatrix}$$

**解释**：高阶导数填充上三角——Jordan 块对应\"$\lambda$ 附近的 Taylor 展开\"。

**例**：$A^k$、$e^A$、$\sin A$、$\log A$ 都可以这样统一计算。

**指数矩阵 $e^{At}$ 与线性 ODE**：
$$\frac{dx}{dt} = Ax \Rightarrow x(t) = e^{At} x_0$$

$e^{At} = P e^{Jt} P^{-1}$，每个 Jordan 块：
$$e^{J_k(\lambda) t} = e^{\lambda t}\begin{pmatrix}1 & t & t^2/2! & \cdots & t^{k-1}/(k-1)! \\ & 1 & t & \cdots & t^{k-2}/(k-2)! \\ & & \ddots & \ddots & \vdots \\ & & & 1 & t \\ & & & & 1\end{pmatrix}$$

**这解释了线性 ODE 的\"多项式 × 指数\"解**——高重特征值给出 $t^k e^{\lambda t}$ 形式的解。

### 七、Jordan 形的应用 2：系统稳定性

**离散线性系统**：$x_{k+1} = A x_k$。稳定 $\iff A^k \to 0$。

**连续线性系统**：$\dot x = Ax$。稳定 $\iff e^{At} \to 0$ 当 $t \to \infty$。

**Jordan 形下的判据**：
- **离散稳定**：$\iff$ 所有特征值 $|\lambda| < 1$，且**有 $|\lambda| = 1$ 时对应 Jordan 块必须是 $1\times 1$**
- **连续稳定**：$\iff$ 所有特征值 $\text{Re}(\lambda) < 0$，且**有 $\text{Re}(\lambda) = 0$ 时 Jordan 块必须 $1\times 1$**

亏损情形（Jordan 块阶 ≥ 2）在临界特征值（$|\lambda|=1$ 或 $\text{Re}(\lambda)=0$）时会造成**多项式增长**，系统不稳定。

### 八、可对角化的判定

**定理**：以下命题等价：
1. $A$ 可对角化
2. 每个特征值的 $m_g = m_a$
3. 所有 Jordan 块是 $1\times 1$
4. $A$ 有 $n$ 个线性无关特征向量
5. $\mathbb{C}^n = \bigoplus_\lambda E_\lambda$（普通特征空间直和）
6. **极小多项式** $m_A(\lambda)$ 没有重根

**实对称矩阵**（Hermitian 复数情形）：**总可对角化**（甚至正交对角化）。这是实对称矩阵在数值计算中如此\"好用\"的根本原因。

**正规矩阵**（$AA^* = A^*A$）：总可被**酉矩阵**对角化（谱定理）。包含实对称、实反对称、正交矩阵等。

### 九、实 Jordan 形（避免复数）

对实矩阵，Jordan 形可能引入复特征值/特征向量。**实 Jordan 形**用 $2\times 2$ 实块代替共轭复特征值对。

复特征值对 $\lambda = a \pm bi$ 的 $1\times 1$ Jordan 块 → $2\times 2$ 实块
$$\begin{pmatrix}a & -b \\ b & a\end{pmatrix}$$

这是**旋转+缩放**矩阵——实数域上保持\"几何含义\"。

### 十、机器人学/ML 中出现的地方

| 场景 | Jordan 形的作用 |
|------|-----------------|
| 线性控制系统 $\dot x = Ax + Bu$ | 判稳定性，算状态转移矩阵 $e^{At}$ |
| 卡尔曼滤波的状态方程 | 状态转移 Φ = $e^{AT}$ 计算 |
| 马尔可夫链的渐近分析 | 过渡矩阵的高次幂 $P^k$ |
| 神经网络 RNN 的梯度消失 | 权重矩阵 $W$ 的 $W^k$ 增长/衰减速率 |
| 机器人 Lyapunov 稳定性 | 线性化系统 $A$ 的特征值 |
| PCA 与 SVD 数值问题 | 重特征值的数值处理 |

### 十一、Cayley-Hamilton 定理

**定理**：矩阵 $A$ 满足自己的特征方程：
$$p_A(A) = \det(A - \lambda I)|_{\lambda := A} = 0$$

（这里 $\lambda^k$ 换成 $A^k$，常数项 $c$ 换成 $cI$。）

**例**：$A = \begin{pmatrix}1 & 2 \\ 3 & 4\end{pmatrix}$，$p_A(\lambda) = \lambda^2 - 5\lambda - 2$。验证 $A^2 - 5A - 2I = 0$。

**用途**：
- $A$ 的幂可以用低次多项式表达：$A^n = q(A)$（$\deg q < n$）
- 计算矩阵函数的实用工具
- 控制论中的 Ackermann 公式

### 十二、极小多项式

**定义**：$m_A(\lambda)$ 是首一多项式中**次数最低**满足 $m_A(A) = 0$ 的那个。

**性质**：
- $m_A | p_A$（极小多项式整除特征多项式）
- $m_A$ 和 $p_A$ 有**相同的根集合**（重数不同）
- $m_A$ 在 $\lambda$ 处的重数 = $\lambda$ 对应的**最大 Jordan 块阶数**

**简化可对角化判据**：$A$ 可对角化 $\iff m_A$ 无重根 $\iff m_A(\lambda) = \prod (\lambda - \lambda_i)$（不同根）。

### 十三、数学练习

1. **计算 Jordan 形**：$A = \begin{pmatrix}2 & 1 & 0 \\ 0 & 2 & 0 \\ 0 & 0 & 3\end{pmatrix}$。

2. **证明**：若 $A$ 的所有特征值两两不同，则 $A$ 可对角化。

3. **Jordan 应用**：给出 $\begin{pmatrix}0 & 1 \\ 0 & 0\end{pmatrix}$ 的 $e^{At}$。

4. **Cayley-Hamilton**：验证 $A = \begin{pmatrix}0 & 1 \\ -2 & -3\end{pmatrix}$ 满足 $A^2 + 3A + 2I = 0$。用这个公式计算 $A^5$。

5. **思考**：为什么\"几乎所有\"矩阵都可对角化？在随机矩阵中亏损是\"零概率事件\"，这对数值计算有什么启示？

### 参考答案

1. 特征值 2（代数重数 2，但几何重数 1：$\ker(A-2I)$ 只含 $(1,0,0)^T$）+ 特征值 3（单根）。所以 Jordan 形是 $\text{diag}(J_2(2), J_1(3))$。

2. 每个特征值单重 → $m_a = 1 \Rightarrow m_g \leq 1$，而 $m_g \geq 1$（非零特征向量存在）→ $m_g = m_a = 1$。所有特征值几何 = 代数，可对角化。

3. $A$ 是 $2\times 2$ Jordan 块 $J_2(0)$（$\lambda = 0$）。$e^{At} = e^{0\cdot t}\begin{pmatrix}1 & t \\ 0 & 1\end{pmatrix} = \begin{pmatrix}1 & t \\ 0 & 1\end{pmatrix}$。线性增长——这说明系统\"临界稳定 + 亏损\"会导致多项式发散。

4. 直接计算 $A^2 = \begin{pmatrix}-2 & -3 \\ 6 & 7\end{pmatrix}$，$3A = \begin{pmatrix}0 & 3 \\ -6 & -9\end{pmatrix}$，$2I = \begin{pmatrix}2 & 0 \\ 0 & 2\end{pmatrix}$。和 = 0 ✓。由 $A^2 = -3A - 2I$ 迭代：$A^3 = A\cdot A^2 = -3A^2 - 2A = -3(-3A-2I) - 2A = 7A + 6I$，$A^4 = 7A^2 + 6A = -7(3A+2I) + 6A = -15A - 14I$，$A^5 = -15A^2 - 14A = -15(-3A-2I)-14A = 31A + 30I$。

5. 亏损矩阵的集合在矩阵空间中是**低维代数簇**（由判别式 $= 0$ 定义），测度为零。但在数值计算中，**接近**亏损的矩阵条件数极大——小扰动导致 Jordan 形剧变。所以数值算法必须回避\"非对称矩阵 + 重特征值\"这种组合，转用 Schur 分解等数值稳定的替代工具。
"""
}

# ============== B1 新增 Section 2: 二次型完整理论 ==============
sec_quadratic = {
    "title": "二次型完整理论：惯性定理、Sylvester 判据、Cholesky",
    "lastUpdated": LAST,
    "content": r"""### 二次型：从\"一个二次函数\"到\"一整套理论\"

**二次型**就是 $n$ 个变量的二次齐次多项式：
$$Q(x) = \sum_{i,j} a_{ij} x_i x_j = x^T A x\quad (A = A^T)$$

别看它简单——椭圆、球面、马鞍面都是二次型等值面；最小二乘、正则化、控制 Lyapunov 函数、深度学习 loss 曲面局部都是二次型。这一节建立二次型的完整理论。

### 一、二次型的矩阵表示

**关键约定**：二次型 $x^T A x$ 对应的矩阵 $A$ **强制对称化**：$A \leftarrow (A + A^T)/2$。

为什么？因为 $x^T A x = x^T A^T x$（标量转置不变），所以非对称部分贡献为零。对称化让 $A$ 唯一确定。

**例**：$Q(x, y) = 2x^2 + 3xy + y^2$。
$$A = \begin{pmatrix}2 & 3/2 \\ 3/2 & 1\end{pmatrix}$$
（注意 $3xy = x \cdot (3/2) \cdot y + y \cdot (3/2) \cdot x$）

### 二、合同变换与惯性指数

**合同变换**：$A \sim_c B \iff \exists P$ 可逆 : $B = P^T A P$。

**合同 vs 相似**：
- 相似 $B = P^{-1} A P$：保持特征值、迹、行列式
- 合同 $B = P^T A P$：保持**对称性**和**正负惯性指数**

**合同对应变量代换**：令 $y = P^{-1}x$，则 $x^T A x = (Py)^T A (Py) = y^T (P^T A P) y = y^T B y$。

**Sylvester 惯性定理**：二次型 $x^T A x$ 经可逆线性变换后，**正项/负项/零项的个数**是不变量——分别叫**正惯性指数** $p$、**负惯性指数** $q$、**零指数** $z = n - p - q$。

（这个不变量对应的\"标准形\"：$y_1^2 + \ldots + y_p^2 - y_{p+1}^2 - \ldots - y_{p+q}^2$）

### 三、二次型的五种分类

根据 $(p, q, z)$ 二次型分为五类：

| 类型 | 条件 | $Q$ 值 | 几何意义 |
|------|------|--------|---------|
| 正定 (PD) | $p = n$ | $> 0,\ \forall x \neq 0$ | 椭球面（凸） |
| 半正定 (PSD) | $p + z = n, z > 0$ | $\geq 0$ | 退化椭球（带零方向） |
| 负定 (ND) | $q = n$ | $< 0,\ \forall x \neq 0$ | 翻转椭球 |
| 半负定 (NSD) | $q + z = n, z > 0$ | $\leq 0$ | 翻转 PSD |
| 不定 (Indefinite) | $p, q \geq 1$ | 有正有负 | 鞍面（双曲） |

### 四、正定性的四大判据

**判据 1：特征值**
$$A \succ 0 \iff \text{所有特征值} > 0$$

**判据 2：Sylvester 判据（主子式）**
$A \succ 0 \iff$ 所有顺序主子式 $> 0$：
$$\det A_1 > 0,\ \det A_2 > 0,\ \ldots,\ \det A_n > 0$$
其中 $A_k$ 是 $A$ 左上角 $k\times k$ 子阵。

**半正定版**：$A \succeq 0 \iff$ 所有**主子式**（不只是顺序的，任意 $k$ 行 $k$ 列相同编号的子阵）$\geq 0$。

**判据 3：Cholesky 分解存在**
$A \succ 0 \iff A = LL^T$（$L$ 下三角且对角为正）

**判据 4：存在可逆 $B$ 使 $A = B^T B$**
这是最几何的判据——正定矩阵是\"B 的 Gram 矩阵\"。

```python
import numpy as np

def test_positive_definite(A):
    \"\"\"检测对称矩阵正定性\"\"\"
    if not np.allclose(A, A.T):
        return 'NOT symmetric'
    # 判据 1: 特征值
    eigs = np.linalg.eigvalsh(A)
    print(f'  特征值: {np.round(eigs, 4)}')
    if np.all(eigs > 0):
        label1 = 'PD'
    elif np.all(eigs >= -1e-10):
        label1 = 'PSD'
    elif np.all(eigs < 0):
        label1 = 'ND'
    else:
        label1 = 'Indefinite'
    # 判据 2: 顺序主子式
    leading_minors = [np.linalg.det(A[:k+1, :k+1]) for k in range(len(A))]
    print(f'  顺序主子式: {np.round(leading_minors, 4)}')
    # 判据 3: Cholesky
    try:
        L = np.linalg.cholesky(A)
        label3 = 'Cholesky 成功'
    except np.linalg.LinAlgError:
        label3 = 'Cholesky 失败'
    return f'{label1} ({label3})'

# 测试
for name, A in [
    ('PD 例', np.array([[2,1,0],[1,3,1],[0,1,2]])),
    ('PSD 例', np.array([[1,1,0],[1,1,0],[0,0,1]])),
    ('鞍面例', np.array([[1,0],[0,-1]])),
]:
    print(f'{name}: {test_positive_definite(np.asarray(A, dtype=float))}')
```

### 五、Cholesky 分解详解

**定理**：$A \succ 0 \iff \exists$ 唯一下三角 $L$（对角为正）使 $A = LL^T$。

**算法**（$O(n^3/3)$，比 LU 快 2 倍）：
```
for i = 1 to n:
    for j = 1 to i:
        sum = A[i][j] - sum_{k=1}^{j-1} L[i][k]*L[j][k]
        if i == j:
            L[i][i] = sqrt(sum)     # 对角元
        else:
            L[i][j] = sum / L[j][j]  # 下三角元
```

**数值稳定**：Cholesky **不需要选主元**——正定性自动保证稳定。

**应用**：
- 解 $Ax = b$（$A$ 正定）：$Ly = b$ 前代，$L^T x = y$ 后代，共 $O(n^2)$
- 从 $N(0, \Sigma)$ 采样：$\Sigma = LL^T$，$Z \sim N(0,I) \Rightarrow x = \mu + LZ$
- 卡尔曼滤波的协方差更新
- 最小二乘的正规方程 $A^T A x = A^T b$

**LDL^T 分解**（对称不定矩阵推广）：$A = LDL^T$，$D$ 块对角（$1\times 1$ 或 $2\times 2$ 块）。

### 六、二次型的标准化

**目标**：找正交变换 $y = Q^T x$ 使 $x^T A x = \sum \lambda_i y_i^2$（纯平方和）。

**谱定理**（最重要！）：实对称矩阵 $A$ 存在正交矩阵 $Q$（$Q^T Q = I$）和对角阵 $\Lambda = \text{diag}(\lambda_1, \ldots, \lambda_n)$ 使
$$A = Q\Lambda Q^T$$

令 $y = Q^T x$：
$$x^T A x = y^T \Lambda y = \sum_i \lambda_i y_i^2$$

**几何含义**：二次型的等值面是椭球/双曲面，$Q$ 是主轴方向，$\lambda_i$ 是主轴的\"刚度\"。

### 七、Rayleigh 商与最值

**Rayleigh 商**：
$$R(A, x) = \frac{x^T A x}{x^T x}$$

对实对称 $A$，**Courant-Fischer 定理**：
$$\lambda_\min = \min_{x \neq 0} R(A, x) \leq R(A, x) \leq \max_{x \neq 0} R(A, x) = \lambda_\max$$

最大值在最大特征值对应特征向量处取到，最小值在最小特征值对应特征向量处取到。

**推广（第 $k$ 大特征值）**：
$$\lambda_k = \max_{\dim S = k} \min_{x \in S, x\neq 0} R(A, x) = \min_{\dim S = n-k+1} \max_{x\in S, x\neq 0} R(A, x)$$

这个 **minimax 公式** 是特征值理论最深刻的结果，也是 PCA、谱聚类等方法的数学基础。

### 八、二次型优化

**无约束最小化** $\min x^T A x + b^T x$：
- $A \succ 0$：唯一最小 $x^* = -\frac{1}{2}A^{-1}b$
- $A \succeq 0$：最小存在当且仅当 $b \in \text{col}(A)$，最小值 $-\frac{1}{4}b^T A^+ b$
- $A$ 不定：**无下界**，问题无意义

**带等式约束** $\min x^T A x$ s.t. $x^T x = 1$：
Lagrangian $\mathcal{L} = x^T A x - \lambda(x^T x - 1)$。驻点：$Ax = \lambda x$——**特征值问题**！最小值 = $\lambda_\min$。

这就是 **PCA 的数学推导**——\"最大方差方向 = 协方差矩阵最大特征值对应的特征向量\"。

**广义特征问题** $\min x^T A x$ s.t. $x^T B x = 1$（$B \succ 0$）：
Lagrange 得 $Ax = \lambda Bx$——**广义特征值问题**。Fisher 判别分析（LDA）的数学形式。

### 九、二次型在 ML 中的出现

| 场景 | 二次型 |
|------|--------|
| 线性回归损失 | $\|y - X\beta\|^2 = (y-X\beta)^T(y-X\beta)$ |
| 岭回归 | $\|y-X\beta\|^2 + \lambda\|\beta\|^2$ |
| PCA | $\max w^T \Sigma w$ s.t. $\|w\|=1$ |
| SVM 对偶 | $\frac{1}{2}\alpha^T Q\alpha - e^T\alpha$ |
| 高斯分布指数项 | $(x-\mu)^T\Sigma^{-1}(x-\mu)$ |
| Lyapunov 函数 | $V(x) = x^T P x$ |
| Trust region | $x^T B x \leq \Delta^2$ |
| LQR 代价 | $\int (x^T Q x + u^T R u)\,dt$ |

### 十、Schur 补与二次型

**Schur 补在正定性中的应用**：对分块矩阵
$$M = \begin{pmatrix}A & B \\ B^T & C\end{pmatrix}$$

$M \succ 0 \iff A \succ 0$ 且 **Schur 补** $C - B^T A^{-1} B \succ 0$。

**应用（SDP）**：Linear Matrix Inequality（LMI）约束常用 Schur 补转化：
$$\begin{pmatrix}A & B \\ B^T & C\end{pmatrix} \succeq 0 \iff C \succeq B^T A^{-1} B$$

这是**半定规划（SDP）**的基本技术——线性化非凸约束。

### 十一、数学练习

1. **判断类型**：$Q(x, y, z) = x^2 + 4y^2 + 9z^2 + 2xy + 4xz + 6yz$。分类（PD/PSD/ND/...）。

2. **Cholesky 手算**：对 $A = \begin{pmatrix}4 & 2 \\ 2 & 5\end{pmatrix}$ 求 $L$ 使 $A = LL^T$。

3. **Sylvester 反例**：给出一个矩阵**所有顺序主子式都 $\geq 0$** 但**不是半正定**。（提示：Sylvester 判据对 PD 充要，对 PSD 不充分！）

4. **Rayleigh 商应用**：$A = \begin{pmatrix}2 & 1 \\ 1 & 3\end{pmatrix}$。用 Rayleigh 商求 $\lambda_\max$ 的数值估计（幂法的第一步）。

5. **思考**：为什么半正定是凸优化中比正定更\"宽松但常见\"的条件？（举个例子：神经网络训练损失的 Hessian 在局部极小附近什么性质？）

### 参考答案

1. 矩阵 $A = \begin{pmatrix}1&1&2\\1&4&3\\2&3&9\end{pmatrix}$。顺序主子式：1, 3, $\det A = ...$ 计算：$1\cdot(36-9) - 1\cdot(9-6) + 2\cdot(3-8) = 27 - 3 - 10 = 14 > 0$。所有 > 0 → PD。

2. $L_{11} = \sqrt{4} = 2$。$L_{21} = 2/2 = 1$。$L_{22} = \sqrt{5 - 1^2} = 2$。所以 $L = \begin{pmatrix}2 & 0 \\ 1 & 2\end{pmatrix}$。验证 $LL^T = \begin{pmatrix}4 & 2 \\ 2 & 5\end{pmatrix}$ ✓。

3. $A = \begin{pmatrix}0 & 0 \\ 0 & -1\end{pmatrix}$。顺序主子式 $0, 0 \geq 0$，但 $x = (0, 1)^T$ 时 $x^T A x = -1 < 0$。这说明 **PSD 需要所有主子式（包括非顺序的）都 $\geq 0$**，不只是顺序主子式。

4. 特征值精确：$\lambda = (5 \pm \sqrt{5})/2 \approx 3.618$ 或 $1.382$。幂法初始 $x_0 = (1,1)^T$：$R = (1,1)\cdot(3,4)/2 = 7/2 = 3.5$。接近 $\lambda_\max$。

5. 神经网络局部极小处 Hessian **半正定**（二阶必要条件）。但几乎从不**严格正定**——因为深度网络过参数化，大量方向上二阶导数严格为零（\"平坦方向\"）。这就是为什么 \"loss landscape 是平坦的\" 成为深度学习的经验观察。半正定而非正定才是常态。
"""
}

# ============== B1 新增 Section 3: 三大应用 ==============
sec_applications = {
    "title": "线性代数三大应用：差分方程、马尔可夫链、图拉普拉斯",
    "lastUpdated": LAST,
    "content": r"""### Strang 后半本的精华

前面几节建立了线性代数的完整理论。本节展示**三个在现代应用中无处不在的线性代数应用**——这是 Strang 在 MIT 18.06 中花了整整半学期讲的内容，把前面所有抽象工具都用上了。

### 一、线性差分方程

**差分方程**：$x_{k+1} = A x_k$，$A \in \mathbb{R}^{n\times n}$。

**显式解**：$x_k = A^k x_0$。

**通过对角化**：若 $A = P\Lambda P^{-1}$，
$$x_k = A^k x_0 = P \Lambda^k P^{-1} x_0$$

**长期行为**（$k \to \infty$）：
- 若 $|\lambda_i| < 1$ 对所有 $i$：$x_k \to 0$（**稳定**）
- 若 $|\lambda_i| > 1$ 对某 $i$：$x_k$ 沿对应特征向量**爆炸增长**
- 若 $|\lambda_i| = 1$ 对某 $i$：**中性**（震荡或收敛到子空间）

**光谱半径** $\rho(A) = \max_i |\lambda_i|$ 是关键量。

### 二、经典例子：Fibonacci 数列

$F_{k+1} = F_k + F_{k-1}$，$F_0 = 0, F_1 = 1$。写成矩阵形式：

$$\begin{pmatrix}F_{k+1} \\ F_k\end{pmatrix} = \begin{pmatrix}1 & 1 \\ 1 & 0\end{pmatrix}\begin{pmatrix}F_k \\ F_{k-1}\end{pmatrix}$$

$A = \begin{pmatrix}1 & 1 \\ 1 & 0\end{pmatrix}$ 的特征值：$\lambda_\pm = \frac{1 \pm \sqrt{5}}{2}$（**黄金分割率！**）

$$F_k = \frac{\lambda_+^k - \lambda_-^k}{\sqrt{5}} = \frac{1}{\sqrt 5}\left[\left(\frac{1+\sqrt 5}{2}\right)^k - \left(\frac{1-\sqrt 5}{2}\right)^k\right]$$

这就是 **Binet 公式**——从矩阵对角化推导出的封闭解。

```python
import numpy as np

# 用矩阵对角化计算 Fibonacci
A = np.array([[1, 1], [1, 0]], dtype=float)
eigs, V = np.linalg.eig(A)
print(f'特征值: {eigs}')
print(f'黄金比率 φ = {(1+np.sqrt(5))/2:.10f}')

# 对比直接递推和矩阵幂
def fib_matrix(k):
    return int(np.round((np.linalg.matrix_power(A, k) @ np.array([1, 0]))[0]))

def fib_binet(k):
    phi = (1+np.sqrt(5))/2
    return int(np.round((phi**k - (1-phi)**k) / np.sqrt(5)))

for k in [10, 30, 50]:
    print(f'F_{k}: matrix={fib_matrix(k)}, Binet={fib_binet(k)}')
```

### 三、马尔可夫链：随机性 + 线性代数

**马尔可夫链**：$x_{k+1} = P^T x_k$，其中 $P$ 是**转移矩阵**（$P_{ij}$ = 从状态 $i$ 到 $j$ 的概率）。

**转移矩阵的性质**：
- $P_{ij} \geq 0$
- $\sum_j P_{ij} = 1$（每行和为 1）
- 这样的矩阵叫**随机矩阵**（stochastic matrix）

**关键事实**：
- $\rho(P) = 1$（**光谱半径恰等于 1**）
- **1 必是特征值**，对应特征向量是全 1 向量（右特征向量 $P \mathbf{1} = \mathbf{1}$）

**稳态分布** $\pi$：$\pi^T P = \pi^T$（左特征向量，对应 $\lambda = 1$）。

**Perron-Frobenius 定理**（马尔可夫链的理论基石）：不可约+非周期随机矩阵有唯一的**严格正**稳态分布 $\pi$。长期分布独立于初始分布：
$$\lim_{k\to\infty} x_k = \pi,\quad \forall x_0 \text{ 概率分布}$$

**收敛速率** = $|\lambda_2|$（第二大特征值的绝对值）——叫**谱间隙**。间隙越大收敛越快。

### 四、Google PageRank：最著名的马尔可夫链

**问题**：给网页排名。用\"随机冲浪者\"模型：用户在页面上以概率 $d$（阻尼因子 ≈ 0.85）点击链接，以概率 $1-d$ 随机跳转。

**转移矩阵**：
$$M = d \tilde{P} + (1-d) \frac{1}{n}\mathbf{1}\mathbf{1}^T$$

其中 $\tilde{P}_{ij} = 1/L_i$ 若页 $i$ 链到 $j$，$L_i$ 是页 $i$ 的出链数。

**PageRank**：稳态分布 $\pi$（左特征向量对应 $\lambda = 1$）。

**算法（幂迭代）**：
```
x_0 = [1/n, 1/n, ..., 1/n]
repeat:
    x_{k+1} = M^T x_k
until convergence
```

$O(|E|)$ 每步（稀疏矩阵-向量乘法），远快于直接特征分解。Google 当年就是靠这个算法对整个 Web 排名。

```python
import numpy as np

def pagerank(adj, d=0.85, tol=1e-8, max_iter=100):
    \"\"\"PageRank 幂迭代\"\"\"
    n = len(adj)
    # 处理无出链页面（全零行）
    out_deg = adj.sum(axis=1)
    out_deg[out_deg == 0] = 1
    # 转移矩阵
    P_tilde = adj / out_deg[:, None]
    # 迭代
    x = np.ones(n) / n
    for it in range(max_iter):
        x_new = d * (P_tilde.T @ x) + (1 - d) / n
        if np.linalg.norm(x_new - x, 1) < tol:
            print(f'收敛于第 {it+1} 步')
            break
        x = x_new
    return x_new

# 示例：6 页的小网络
adj = np.array([
    [0, 1, 1, 0, 0, 0],
    [1, 0, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 1],
    [0, 0, 0, 1, 0, 1],
    [0, 0, 0, 0, 1, 0],
], dtype=float)

ranks = pagerank(adj)
print('PageRank:', ranks)
print('排名:', np.argsort(-ranks) + 1)
```

### 五、图论基础：图的拉普拉斯

**图** $G = (V, E)$，$|V| = n$。

**邻接矩阵** $A$：$A_{ij} = 1$ 若 $(i,j) \in E$，else 0。

**度矩阵** $D = \text{diag}(d_1, \ldots, d_n)$，$d_i = \sum_j A_{ij}$ 是顶点 $i$ 的度。

**图拉普拉斯**：
$$L = D - A$$

**归一化拉普拉斯**：
$$\mathcal{L} = I - D^{-1/2} A D^{-1/2} = D^{-1/2} L D^{-1/2}$$

### 六、拉普拉斯的谱性质

**关键定理**（图拉普拉斯）：
1. $L$ 对称半正定
2. 最小特征值 $\lambda_1 = 0$，对应特征向量 $\mathbf{1} = (1,1,\ldots,1)^T$
3. **$L$ 零特征值的重数 = 图的连通分量数**
4. 第二小特征值 $\lambda_2$ 叫 **Fiedler 值** 或 **代数连通性**

**核心公式**：
$$x^T L x = \sum_{(i,j) \in E} (x_i - x_j)^2$$

这让 $L$ 成为\"相邻节点差异\"的自然度量。

### 七、拉普拉斯的六大应用

**1. 图上的平滑性度量**：$x^T L x$ 小 = $x$ 在边相连的顶点上值相近 = $x$ 在图上\"平滑\"。

**2. 谱聚类（Spectral Clustering）**：对图的 2-划分问题，$\lambda_2$ 对应特征向量 $v_2$（Fiedler 向量）给出近似最优划分——用 $v_2$ 的符号分组。

**3. 图嵌入（Graph Embedding）**：取拉普拉斯前 $k$ 个小特征向量 $v_2, \ldots, v_{k+1}$ 作为节点的 $k$ 维嵌入坐标。

**4. 热扩散方程**：$\partial x/\partial t = -L x$，解是 $x(t) = e^{-Lt} x_0$——图上的\"热传导\"过程。

**5. 有效电阻**：电路中将每条边视作电阻 1 Ω，顶点 $i, j$ 之间的\"有效电阻\" $R_{ij} = (e_i - e_j)^T L^+ (e_i - e_j)$，其中 $L^+$ 是 Moore-Penrose 伪逆。

**6. 随机游走**：$P = D^{-1} A$ 是转移矩阵。$I - P = D^{-1}L$ ——拉普拉斯与随机游走直接联系。

### 八、Matrix-Tree 定理（拉普拉斯的奇迹）

**定理**（Kirchhoff）：连通图 $G$ 的生成树数量 = 拉普拉斯 $L$ 任意 $(n-1)\times(n-1)$ 余子式的行列式。

**等价形式**：$\tau(G) = \frac{1}{n}\prod_{k=2}^n \lambda_k$（$\lambda_k$ 是 $L$ 的特征值，$\lambda_1 = 0$ 除外）。

这是**组合问题（生成树计数）用线性代数（特征值）解决**的经典例子。

```python
import numpy as np

# 完全图 K_n 的生成树数 = n^{n-2} (Cayley 公式)
for n in [3, 4, 5]:
    A = np.ones((n, n)) - np.eye(n)  # K_n 邻接
    D = np.diag(A.sum(axis=1))
    L = D - A
    
    # 用任意余子式
    M = np.linalg.det(L[1:, 1:])  # 去掉第一行第一列
    M = round(M)
    expected = n ** (n - 2)
    print(f'K_{n}: 生成树数 = {M}, Cayley 公式: {expected}, 匹配: {M == expected}')
```

### 九、谱聚类实例（把三大应用串起来）

```python
import numpy as np
from scipy.sparse.linalg import eigsh

def spectral_cluster_2way(A):
    \"\"\"基于 Fiedler 向量的 2-聚类\"\"\"
    n = len(A)
    D = np.diag(A.sum(axis=1))
    L = D - A
    # 找第二小特征值对应的特征向量
    eigs, vecs = np.linalg.eigh(L)
    v2 = vecs[:, 1]  # Fiedler 向量
    # 按符号分组
    cluster_A = np.where(v2 >= 0)[0]
    cluster_B = np.where(v2 < 0)[0]
    return cluster_A, cluster_B, eigs[:3]

# 构造两团彼此弱连接的图（明显的 2 聚类）
A = np.block([
    [np.ones((4,4)) - np.eye(4), 0.1*np.ones((4,4))],
    [0.1*np.ones((4,4)), np.ones((4,4)) - np.eye(4)]
])
cA, cB, eigs = spectral_cluster_2way(A)
print(f'最小 3 个特征值: {np.round(eigs, 4)}')
print(f'聚类 A: {cA}')
print(f'聚类 B: {cB}')
# 特征值 0, 小正数, 较大正数 → 谱间隙明显
```

### 十、数学练习

1. **差分方程**：$x_{k+1} = \begin{pmatrix}0.5 & 0.3 \\ 0.5 & 0.7\end{pmatrix} x_k$，$x_0 = (1, 0)^T$。求 $\lim_{k\to\infty} x_k$。

2. **马尔可夫链稳态**：天气预测——晴天 → 晴天概率 0.8，雨天概率 0.2；雨天 → 晴天 0.4，雨天 0.6。求长期晴天和雨天的比例。

3. **PageRank 简化版**：3 个页面，1→2, 2→3, 3→1, 3→2。写出转移矩阵，计算稳态 PageRank。

4. **图拉普拉斯**：路径图 $P_4$（4 顶点 3 边的链）。写出 $L$，求其特征值。

5. **思考**：为什么 Google PageRank 选阻尼因子 $d = 0.85$ 而不是 1？（提示：考虑\"dangling nodes\"问题和谱间隙。）

### 参考答案

1. 转移矩阵每列和为 1（随机矩阵的转置）。稳态 $\pi$ 满足 $P^T \pi = \pi$。解 $(0.5-1)\pi_1 + 0.3\pi_2 = 0$ → $\pi_2/\pi_1 = 5/3$。加归一化：$\pi = (3/8, 5/8)^T = (0.375, 0.625)^T$。

2. 转移矩阵 $P = \begin{pmatrix}0.8 & 0.2 \\ 0.4 & 0.6\end{pmatrix}$。稳态 $\pi^T P = \pi^T$，解 $\pi = (2/3, 1/3)$。长期 2/3 时间晴天。

3. $\tilde{P} = \begin{pmatrix}0 & 1 & 0 \\ 0 & 0 & 1 \\ 1/2 & 1/2 & 0\end{pmatrix}$。$d = 0.85$。数值迭代得 $\pi \approx (0.32, 0.38, 0.30)$。

4. 路径图 $P_4$：$L = \begin{pmatrix}1&-1&0&0\\-1&2&-1&0\\0&-1&2&-1\\0&0&-1&1\end{pmatrix}$。特征值：$\{0, 2 - \sqrt 2, 2, 2+\sqrt 2\}$（这是著名\"离散拉普拉斯\"谱，对应离散正弦基）。

5. 若 $d = 1$：（a）dangling nodes（无出链的页面）使 $P$ 不是严格随机矩阵，$P^T$ 可能有特征值 0；（b）谱间隙 $|\lambda_2|$ 可能接近 1，收敛极慢。$d = 0.85$ 保证 $|\lambda_2| \leq d < 1$ 严格小于 1，让幂迭代保证以 $0.85^k$ 速率指数收敛。这是计算稳定性和商业可行性的权衡。
"""
}

# 插入到线代模块
with open("data/learn/linear-algebra.json", "r", encoding="utf-8") as f:
    la = json.load(f)

# 加到模块末尾
la["sections"].append(sec_jordan)
la["sections"].append(sec_quadratic)
la["sections"].append(sec_applications)
la["lastUpdated"] = LAST

with open("data/learn/linear-algebra.json", "w", encoding="utf-8") as f:
    json.dump(la, f, ensure_ascii=False, indent=2)

total = sum(len(s.get("content","")) for s in la["sections"])
print(f"B1 done. LA now: {len(la['sections'])} sec, {total:,} chars")
for i, s in enumerate(la["sections"], 1):
    c = len(s.get("content",""))
    title_ascii = s['title'].encode('ascii','replace').decode('ascii')
    print(f"  {i:2d}. {title_ascii} ({c:,})")
