/* 第 24 课 · 一元二次方程（北师大版九上第二章） */
(function () {
  'use strict';
  var M = window.Mx, st = M.getState();

  /* ---------- 模型一：判别式决定有几个根 ---------- */
  var a = M.num(st.a, 1, -3, 3), b = M.num(st.b, -2, -8, 8), c = M.num(st.c, -3, -9, 9);

  function showDisc() {
    if (a === 0) a = 1;
    var ax = M.axes(M.$('#dc-fig'), {
      xmin: -6, xmax: 6, ymin: -10, ymax: 10, xstep: 1, ystep: 2,
      labelStep: 2, ylabelStep: 5, left: 30, right: 10, top: 10, bottom: 22
    });
    var S = M.svg, L = ax.layer;
    S('path', { d: M.curve(ax, function (x) { return a * x * x + b * x + c; }), fill: 'none', stroke: '#2f5aa8', 'stroke-width': 2.6 }, L);
    var d = b * b - 4 * a * c;
    var roots = [];
    if (d > 0) roots = [(-b - Math.sqrt(d)) / (2 * a), (-b + Math.sqrt(d)) / (2 * a)];
    else if (d === 0) roots = [-b / (2 * a)];
    roots.forEach(function (r) {
      if (r >= ax.xmin && r <= ax.xmax) {
        S('circle', { cx: ax.X(r), cy: ax.Y(0), r: 5.5, fill: '#c2603f', stroke: '#fff', 'stroke-width': 1.8 }, L);
        S('text', { x: ax.X(r), y: ax.Y(0) + 18, 'text-anchor': 'middle', 'font-size': 10.5, fill: '#a4492b', text: M.fmt(r, 2) }, L);
      }
    });
    /* 顶点 */
    var vx = -b / (2 * a), vy = a * vx * vx + b * vx + c;
    S('circle', { cx: ax.X(vx), cy: ax.Y(vy), r: 4, fill: '#3f7d6a' }, L);

    M.$('#dc-eq').innerHTML = (a === 1 ? '' : (a === -1 ? '−' : M.fmt(a))) + 'x' + M.sup(2) +
      (b === 0 ? '' : M.sign(b) + 'x') + (c === 0 ? '' : M.sign(c)) + ' = 0';
    M.$('#dc-d').innerHTML = 'Δ = b' + M.sup(2) + ' − 4ac = ' + M.fmt(b) + M.sup(2) + ' − 4×' + M.fmt(a) + '×' + M.fmt(c) + ' = <b>' + M.fmt(d) + '</b>';
    M.$('#dc-n').textContent = d > 0 ? '两个不相等的实数根' : (d === 0 ? '两个相等的实数根' : '没有实数根');
    M.$('#dc-roots').innerHTML = d > 0 ? 'x₁ = ' + M.fmt(roots[0], 3) + '，x₂ = ' + M.fmt(roots[1], 3)
      : (d === 0 ? 'x₁ = x₂ = ' + M.fmt(roots[0], 3) : '无实数根');
    M.$('#dc-text').innerHTML = d > 0
      ? '<b>Δ &gt; 0</b>：抛物线与 x 轴有<b>两个</b>交点，方程有两个不相等的实数根。'
      : d === 0 ? '<b>Δ = 0</b>：抛物线与 x 轴<b>正好相切</b>于一点，方程有两个相等的实数根（也说只有一个根）。'
      : '<b>Δ &lt; 0</b>：抛物线与 x 轴<b>没有交点</b>，方程在实数范围内无解。注意不是「无意义」，只是实数里找不到。';
    if (d >= 0) {
      M.$('#dc-vieta').innerHTML = '根与系数的关系：x₁ + x₂ = −b/a = <b>' + M.fmt(-b / a, 3) + '</b>，x₁·x₂ = c/a = <b>' + M.fmt(c / a, 3) + '</b>' +
        '（验算：' + M.fmt(roots[0] + (roots[1] === undefined ? roots[0] : roots[1]), 3) + '，' +
        M.fmt(roots[0] * (roots[1] === undefined ? roots[0] : roots[1]), 3) + '）';
    } else {
      M.$('#dc-vieta').innerHTML = '没有实数根时，根与系数的关系在实数范围内不适用。';
    }
    M.setState({ a: a, b: b, c: c, p: pIdx });
  }

  /* ---------- 模型二：配方法 ---------- */
  var pIdx = M.num(st.p, 6, -8, 8);

  function showComplete() {
    /* x² + px + q = 0，用配方法 */
    var q = -7, half = pIdx / 2;
    var s = M.$('#cp-fig');
    s.innerHTML = '';
    var S = M.svg, unit = 13, ox = 30, oy = 24;
    var X = 5 * unit, H = Math.abs(half) * unit;
    /* x² 的大正方形 + 两块 (p/2)x 的长方形 + 补上的 (p/2)² */
    S('rect', { x: ox, y: oy, width: X, height: X, fill: '#cfdaee', stroke: '#5d7cb0', 'stroke-width': 1.3 }, s);
    S('text', { x: ox + X / 2, y: oy + X / 2 + 4, 'text-anchor': 'middle', 'font-size': 12, fill: '#2f4473', text: 'x²' }, s);
    if (H > 0) {
      S('rect', { x: ox + X, y: oy, width: H, height: X, fill: '#e8dcc8', stroke: '#5d7cb0', 'stroke-width': 1.3 }, s);
      S('rect', { x: ox, y: oy + X, width: X, height: H, fill: '#e8dcc8', stroke: '#5d7cb0', 'stroke-width': 1.3 }, s);
      S('rect', { x: ox + X, y: oy + X, width: H, height: H, fill: '#f0d4cb', stroke: '#c2603f', 'stroke-width': 1.5, 'stroke-dasharray': '4 3' }, s);
      S('text', { x: ox + X + H / 2, y: oy + X / 2 + 4, 'text-anchor': 'middle', 'font-size': 9, fill: '#7a6334', text: M.fmt(Math.abs(half)) + 'x' }, s);
      S('text', { x: ox + X + H / 2, y: oy + X + H / 2 + 4, 'text-anchor': 'middle', 'font-size': 9, fill: '#8a4530', text: M.fmt(half * half) }, s);
      S('text', { x: ox + X + H + 8, y: oy + X + H / 2 + 4, 'font-size': 10, fill: '#a4492b', text: '← 补上这块' }, s);
    }
    M.$('#cp-eq').innerHTML = 'x' + M.sup(2) + M.sign(pIdx) + 'x ' + M.sign(q) + ' = 0';
    M.$('#cp-steps').innerHTML =
      '<span class="step">① 移常数：x' + M.sup(2) + M.sign(pIdx) + 'x = ' + M.fmt(-q) + '</span>' +
      '<span class="step">② 两边加 (' + M.frac(pIdx, 2) + ')' + M.sup(2) + ' = ' + M.fmt(half * half) + '：x' + M.sup(2) + M.sign(pIdx) + 'x + ' + M.fmt(half * half) + ' = ' + M.fmt(-q + half * half) + '</span>' +
      '<span class="step">③ 左边成为完全平方：(x ' + (half >= 0 ? '+ ' : '− ') + M.fmt(Math.abs(half)) + ')' + M.sup(2) + ' = ' + M.fmt(-q + half * half) + '</span>' +
      '<span class="step">④ 开平方：x ' + (half >= 0 ? '+ ' : '− ') + M.fmt(Math.abs(half)) + ' = ±' + M.sqrt(M.fmt(-q + half * half)) + '</span>';
    var rhs = -q + half * half;
    M.$('#cp-root').innerHTML = rhs >= 0
      ? 'x = ' + M.fmt(-half, 3) + ' ± ' + M.fmt(Math.sqrt(rhs), 3) + '，即 ' + M.fmt(-half - Math.sqrt(rhs), 3) + ' 或 ' + M.fmt(-half + Math.sqrt(rhs), 3)
      : '右边是负数，无实数根';
    M.$('#cp-text').innerHTML = '配方法的关键是<b>加上一次项系数一半的平方</b>——图上那块虚线小方块，正好把「L 形」补成一个完整的正方形。' +
      '补了多少，<b>两边都要加多少</b>，等式才不变。';
    M.setState({ a: a, b: b, c: c, p: pIdx });
  }

  /* ---------- 模型三：应用题 ---------- */
  var area = M.num(st.s, 60, 20, 140);

  function showApp() {
    /* 长比宽多 4 米，面积 S，求宽：x(x+4) = S */
    var d = 16 + 4 * area;
    var w = (-4 + Math.sqrt(d)) / 2;
    var s = M.$('#ap-fig');
    s.innerHTML = '';
    var S = M.svg, k = 11, ox = 24, oy = 22;
    S('rect', { x: ox, y: oy, width: (w + 4) * k, height: w * k, fill: '#eaeff8', stroke: '#3a5a93', 'stroke-width': 2 }, s);
    S('text', { x: ox + (w + 4) * k / 2, y: oy + w * k / 2 + 4, 'text-anchor': 'middle', 'font-size': 12, fill: '#2f4473', text: M.fmt(area) + ' m²' }, s);
    S('text', { x: ox + (w + 4) * k / 2, y: oy + w * k + 16, 'text-anchor': 'middle', 'font-size': 10.5, fill: '#4a5568', text: '长 ' + M.fmt(w + 4, 2) + ' m' }, s);
    S('text', { x: ox - 6, y: oy + w * k / 2, 'text-anchor': 'end', 'font-size': 10.5, fill: '#4a5568', text: '宽 ' + M.fmt(w, 2) }, s);
    M.$('#ap-eq').innerHTML = '设宽 x 米，则长 (x + 4) 米：<br>x(x + 4) = ' + M.fmt(area) + '，即 x' + M.sup(2) + ' + 4x − ' + M.fmt(area) + ' = 0';
    M.$('#ap-root').innerHTML = 'Δ = 16 + ' + M.fmt(4 * area) + ' = ' + M.fmt(d) + '，x = <b>' + M.fmt(w, 3) + '</b> 或 ' + M.fmt((-4 - Math.sqrt(d)) / 2, 3);
    M.$('#ap-text').innerHTML = '方程算出两个根，但<b>负根要舍去</b>——宽不可能是负数。' +
      '实际问题里一定要检查根是否<b>符合实际意义</b>：长度、人数、天数都不能是负的，人数还必须是整数。';
    M.setState({ s: area });
  }

  document.addEventListener('DOMContentLoaded', function () {
    M.bindRange(M.$('#dc-a'), function (v) { a = v || 1; showDisc(); });
    M.bindRange(M.$('#dc-b'), function (v) { b = v; showDisc(); });
    M.bindRange(M.$('#dc-c'), function (v) { c = v; showDisc(); });
    showDisc();
    M.bindRange(M.$('#cp-range'), function (v) { pIdx = v; showComplete(); })();
    M.bindRange(M.$('#ap-range'), function (v) { area = v; showApp(); })();

    M.quiz([
      {
        title: '调出一个没有实数根的方程',
        desc: '让判别式 Δ = b² − 4ac 小于 0。',
        label: '在判别式模型里调滑块',
        button: '检查判别式',
        check: function () {
          var d = b * b - 4 * a * c;
          if (d >= 0) return { ok: false, msg: '现在 Δ = ' + M.fmt(d) + ' ≥ 0，还有实数根。试试让 a 和 c 同号、b 小一些。' };
          return { ok: true, msg: 'Δ = ' + M.fmt(d) + ' &lt; 0，抛物线与 x 轴<b>没有交点</b>，方程没有实数根。' };
        }
      },
      {
        title: '配方时两边要加什么？',
        desc: '看上面图里那块虚线小方块。',
        options: ['一次项系数一半的平方', '一次项系数的平方', '常数项的一半', '二次项系数的平方'],
        answer: 0,
        hint: '图上补的那块小正方形边长是多少？',
        explain: '加上 (p/2)²，左边才能凑成完全平方 (x + p/2)²。<b>两边都要加</b>，等式才成立。'
      },
      {
        title: '长比宽多 4 米、面积 60 平方米，宽是多少？',
        desc: '可以把上面的面积滑块调到 60。',
        options: ['6 米', '10 米', '8 米', '−10 米'],
        answer: 0,
        hint: '列 x(x+4) = 60，解出正根。',
        explain: 'x² + 4x − 60 = 0，(x+10)(x−6) = 0，得 x = 6 或 x = −10。宽不能为负，<b>舍去 −10</b>，所以宽 6 米、长 10 米。'
      }
    ]);
  });
})();
