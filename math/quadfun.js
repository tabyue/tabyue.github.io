/* 第 29 课 · 二次函数（北师大版九下第二章） */
(function () {
  'use strict';
  var M = window.Mx, st = M.getState();

  /* ---------- 模型一：a、b、c 各管什么 ---------- */
  var a = M.num(st.a, 1, -3, 3), b = M.num(st.b, -2, -8, 8), c = M.num(st.c, -3, -9, 9);
  var form = st.f || 'gen';
  var ax = null;

  function showPara() {
    if (a === 0) a = 1;
    ax = M.axes(M.$('#pa-fig'), {
      xmin: -7, xmax: 7, ymin: -10, ymax: 10, xstep: 1, ystep: 2,
      labelStep: 2, ylabelStep: 5, left: 30, right: 10, top: 10, bottom: 22
    });
    var S = M.svg, L = ax.layer;
    var vx = -b / (2 * a), vy = a * vx * vx + b * vx + c;
    /* 对称轴 */
    S('line', { x1: ax.X(vx), y1: ax.Y(ax.ymin), x2: ax.X(vx), y2: ax.Y(ax.ymax), stroke: '#c2603f', 'stroke-width': 1.3, 'stroke-dasharray': '5 4' }, L);
    S('path', { d: M.curve(ax, function (x) { return a * x * x + b * x + c; }), fill: 'none', stroke: '#2f5aa8', 'stroke-width': 2.6 }, L);
    /* 顶点 */
    if (vy >= ax.ymin && vy <= ax.ymax) {
      S('circle', { cx: ax.X(vx), cy: ax.Y(vy), r: 6, fill: '#3f7d6a', stroke: '#fff', 'stroke-width': 2 }, L);
      S('text', { x: ax.X(vx) + 9, y: ax.Y(vy) + (a > 0 ? 15 : -9), 'font-size': 10.5, 'font-weight': 700, fill: '#2f6a57', text: '(' + M.fmt(vx, 2) + ', ' + M.fmt(vy, 2) + ')' }, L);
    }
    /* 与 y 轴交点 */
    S('circle', { cx: ax.X(0), cy: ax.Y(c), r: 4.5, fill: '#c2603f' }, L);
    /* 与 x 轴交点 */
    var d = b * b - 4 * a * c;
    if (d >= 0) {
      [(-b - Math.sqrt(d)) / (2 * a), (-b + Math.sqrt(d)) / (2 * a)].forEach(function (r0) {
        if (r0 >= ax.xmin && r0 <= ax.xmax) S('circle', { cx: ax.X(r0), cy: ax.Y(0), r: 4.5, fill: '#8d86c0' }, L);
      });
    }

    M.$('#pa-gen').innerHTML = 'y = ' + (a === 1 ? '' : (a === -1 ? '−' : M.fmt(a))) + 'x' + M.sup(2) +
      (b === 0 ? '' : M.sign(b) + 'x') + (c === 0 ? '' : M.sign(c));
    M.$('#pa-vertex').innerHTML = 'y = ' + (a === 1 ? '' : (a === -1 ? '−' : M.fmt(a))) +
      '(x ' + (vx >= 0 ? '− ' : '+ ') + M.fmt(Math.abs(vx), 2) + ')' + M.sup(2) + (vy === 0 ? '' : M.sign(vy));
    M.$('#pa-open').textContent = a > 0 ? '开口向上' : '开口向下';
    M.$('#pa-axis').innerHTML = 'x = −<span class="frac"><i>b</i><i>2a</i></span> = ' + M.fmt(vx, 3);
    M.$('#pa-vx').textContent = '(' + M.fmt(vx, 2) + ', ' + M.fmt(vy, 2) + ')';
    M.$('#pa-min').innerHTML = a > 0 ? '最小值 ' + M.fmt(vy, 2) : '最大值 ' + M.fmt(vy, 2);
    M.$('#pa-cross').textContent = d > 0 ? '2 个' : (d === 0 ? '1 个' : '0 个');
    M.$('#pa-text').innerHTML =
      '<b>a 管开口</b>：a &gt; 0 开口向上（有最小值），a &lt; 0 开口向下（有最大值）；|a| 越大开口越窄。<br>' +
      '<b>a 和 b 一起管对称轴</b>：x = −b/(2a)。a、b <b>同号</b>时对称轴在 y 轴<b>左</b>边，异号在右边（口诀「左同右异」）。<br>' +
      '<b>c 管与 y 轴的交点</b>：抛物线一定过 (0, ' + M.fmt(c) + ')。<br>' +
      '现在 Δ = ' + M.fmt(d) + '，所以与 x 轴有 <b>' + (d > 0 ? 2 : (d === 0 ? 1 : 0)) + '</b> 个交点——' +
      '这和上一册解一元二次方程是<b>同一件事</b>：交点的横坐标就是方程 ' + (a === 1 ? '' : M.fmt(a)) + 'x² ' +
      (b === 0 ? '' : M.sign(b) + 'x') + (c === 0 ? '' : M.sign(c)) + ' = 0 的根。';
    M.setState({ a: a, b: b, c: c, w: wid });
  }

  /* ---------- 模型二：最大面积问题 ---------- */
  var wid = M.num(st.w, 8, 1, 19);
  var FENCE = 40;   /* 篱笆总长 40 米，靠墙围长方形：2x + y = 40 */

  function showArea() {
    var a2 = M.axes(M.$('#ar-fig'), {
      xmin: 0, xmax: 20, ymin: 0, ymax: 220, xstep: 2, ystep: 40,
      labelStep: 5, ylabelStep: 50, left: 38, bottom: 24, top: 12,
      xlabel: '宽 x（米）', ylabel: '面积 S（m²）'
    });
    var S = M.svg, L = a2.layer;
    S('path', { d: M.curve(a2, function (x) { return x * (FENCE - 2 * x); }, 0, 20, 200), fill: 'none', stroke: '#2f5aa8', 'stroke-width': 2.6 }, L);
    var area = wid * (FENCE - 2 * wid);
    S('line', { x1: a2.X(wid), y1: a2.Y(0), x2: a2.X(wid), y2: a2.Y(area), stroke: '#c2603f', 'stroke-width': 1.2, 'stroke-dasharray': '4 3' }, L);
    S('circle', { cx: a2.X(wid), cy: a2.Y(area), r: 5.5, fill: '#c2603f', stroke: '#fff', 'stroke-width': 1.8 }, L);
    S('circle', { cx: a2.X(10), cy: a2.Y(200), r: 5, fill: '#3f7d6a' }, L);
    S('text', { x: a2.X(10) + 8, y: a2.Y(200) - 6, 'font-size': 10, fill: '#2f6a57', text: '最大 200' }, L);

    /* 画出围栏示意 */
    var s2 = M.$('#ar-plot');
    s2.innerHTML = '';
    var k = 5.4, ox = 20, oy = 100;
    var len = FENCE - 2 * wid;
    M.svg('line', { x1: 10, y1: oy, x2: 290, y2: oy, stroke: '#8795b5', 'stroke-width': 4 }, s2);
    M.svg('text', { x: 12, y: oy - 6, 'font-size': 9.5, fill: '#6b7385', text: '墙' }, s2);
    M.svg('rect', { x: ox, y: oy, width: len * k, height: wid * k, fill: '#eaeff8', stroke: '#3a5a93', 'stroke-width': 2 }, s2);
    M.svg('text', { x: ox + len * k / 2, y: oy + wid * k / 2 + 4, 'text-anchor': 'middle', 'font-size': 11, fill: '#2f4473', text: M.fmt(area) + ' m²' }, s2);
    M.svg('text', { x: ox + len * k / 2, y: oy + wid * k + 14, 'text-anchor': 'middle', 'font-size': 9.5, fill: '#4a5568', text: '长 ' + M.fmt(len) + ' m' }, s2);
    M.svg('text', { x: ox - 5, y: oy + wid * k / 2, 'text-anchor': 'end', 'font-size': 9.5, fill: '#4a5568', text: M.fmt(wid) }, s2);

    M.$('#ar-x').textContent = wid + ' 米';
    M.$('#ar-s').textContent = M.fmt(area) + ' m²';
    M.$('#ar-expr').innerHTML = 'S = x(40 − 2x) = −2x' + M.sup(2) + ' + 40x';
    M.$('#ar-text').innerHTML = '篱笆总长 40 米、一面靠墙，设宽为 x，则长是 (40 − 2x)。' +
      '面积 S = −2x² + 40x 是<b>二次函数</b>，a = −2 &lt; 0 开口向下，所以<b>有最大值</b>。' +
      '顶点在 x = −40/(2×(−2)) = <b>10</b>，最大面积 <b>200 平方米</b>。' +
      (wid === 10 ? '你正好调到了最优解。' : '现在是 ' + M.fmt(area) + ' m²，把宽调到 10 试试。') +
      '<br>注意 x 的<b>取值范围</b>是 0 &lt; x &lt; 20，超出就围不成长方形了。';
    M.setState({ a: a, b: b, c: c, w: wid });
  }

  document.addEventListener('DOMContentLoaded', function () {
    M.bindRange(M.$('#pa-a'), function (v) { a = v || 1; showPara(); });
    M.bindRange(M.$('#pa-b'), function (v) { b = v; showPara(); });
    M.bindRange(M.$('#pa-c'), function (v) { c = v; showPara(); });
    showPara();
    M.bindRange(M.$('#ar-range'), function (v) { wid = v; showArea(); })();

    M.quiz([
      {
        title: '把抛物线调成开口向下、顶点在 y 轴上',
        desc: '顶点在 y 轴上意味着对称轴 x = 0，也就是 b = 0。',
        label: '在抛物线模型里调滑块',
        button: '检查 a 和 b',
        check: function () {
          if (a >= 0) return { ok: false, msg: '现在 a = ' + M.fmt(a) + '，开口向下要求 a &lt; 0。' };
          if (b !== 0) return { ok: false, msg: 'a 对了。但对称轴是 x = ' + M.fmt(-b / (2 * a), 2) + '，要让它落在 y 轴上，需要 <b>b = 0</b>。' };
          return { ok: true, msg: 'b = 0 时对称轴就是 y 轴，顶点为 (0, ' + M.fmt(c) + ')。此时函数写成 y = ' + M.fmt(a) + 'x²' + (c ? M.sign(c) : '') + '。' };
        }
      },
      {
        title: '抛物线与 x 轴的交点，和一元二次方程什么关系？',
        desc: '想想交点处 y 等于几。',
        options: ['交点的横坐标就是方程的根', '没有关系', '交点个数总是 2 个', '交点的纵坐标是方程的根'],
        answer: 0,
        hint: '与 x 轴相交时 y = 0。',
        explain: '令 y = 0 就得到 ax² + bx + c = 0，所以<b>交点横坐标 = 方程的根</b>。Δ &gt; 0 两个交点、Δ = 0 一个、Δ &lt; 0 没有，和判别式完全对应。'
      },
      {
        title: '40 米篱笆一面靠墙围长方形，最大面积是多少？',
        desc: '可以把上面的宽调到不同值试试。',
        options: ['200 平方米', '100 平方米', '400 平方米', '160 平方米'],
        answer: 0,
        hint: '设宽 x，面积 S = x(40−2x)，求顶点。',
        explain: 'S = −2x² + 40x，顶点 x = 10，S 最大 = <b>200 平方米</b>（宽 10 米、长 20 米）。注意靠墙那边不用篱笆，所以是 2x + y = 40。'
      }
    ]);
  });
})();
