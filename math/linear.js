/* 第 16 课 · 一次函数（北师大版八上第四章） */
(function () {
  'use strict';
  var M = window.Mx, st = M.getState();

  /* ---------- 模型一：k 和 b 分别管什么 ---------- */
  var k = M.num(st.k, 1.5, -4, 4), b = M.num(st.b, 1, -6, 6);
  var ax = null;

  function showLine() {
    ax = M.axes(M.$('#fn-fig'), {
      xmin: -8, xmax: 8, ymin: -8, ymax: 8, xstep: 1, ystep: 1,
      labelStep: 2, ylabelStep: 2, left: 28, right: 10, top: 10, bottom: 22
    });
    var S = M.svg, L = ax.layer;
    /* 对照用的 y = kx（过原点） */
    if (M.$('#fn-ref').checked) {
      S('path', { d: M.curve(ax, function (x) { return k * x; }), fill: 'none', stroke: '#b8c1d4', 'stroke-width': 1.6, 'stroke-dasharray': '6 4' }, L);
      S('text', { x: ax.X(6.4), y: ax.Y(k * 6.4) - 5, 'font-size': 10, fill: '#8d95a6', 'text-anchor': 'end', text: 'y = ' + M.fmt(k) + 'x' }, L);
    }
    S('path', { d: M.curve(ax, function (x) { return k * x + b; }), fill: 'none', stroke: '#2f5aa8', 'stroke-width': 2.6 }, L);
    /* 与 y 轴交点：标签放左侧，避开右边「向右 1 格」那组标注 */
    S('circle', { cx: ax.X(0), cy: ax.Y(b), r: 5, fill: '#c2603f', stroke: '#fff', 'stroke-width': 1.6 }, L);
    S('text', { x: ax.X(0) - 9, y: ax.Y(b) - 7, 'text-anchor': 'end', 'font-size': 10.5, fill: '#a4492b', text: '(0, ' + M.fmt(b) + ')' }, L);
    /* 与 x 轴交点 */
    if (k !== 0) {
      var x0 = -b / k;
      if (x0 >= ax.xmin && x0 <= ax.xmax) {
        S('circle', { cx: ax.X(x0), cy: ax.Y(0), r: 5, fill: '#3f7d6a', stroke: '#fff', 'stroke-width': 1.6 }, L);
        /* 再往下一行，避开 x 轴自己的刻度数字 */
        S('text', { x: ax.X(x0) + 6, y: ax.Y(0) + 30, 'font-size': 10.5, fill: '#2f6a57', text: '(' + M.fmt(x0, 2) + ', 0)' }, L);
      }
    }
    /* 画出「每向右 1 格，上升 k 格」 */
    if (k !== 0 && Math.abs(k) <= 4) {
      var x1 = 1, y1 = k * x1 + b;
      S('line', { x1: ax.X(0), y1: ax.Y(b), x2: ax.X(1), y2: ax.Y(b), stroke: '#c2603f', 'stroke-width': 1.4 }, L);
      S('line', { x1: ax.X(1), y1: ax.Y(b), x2: ax.X(1), y2: ax.Y(y1), stroke: '#c2603f', 'stroke-width': 1.4 }, L);
      S('text', { x: ax.X(1) + 5, y: ax.Y((b + y1) / 2) + 3, 'font-size': 9.5, fill: '#a4492b', text: '右 1 格，' + (k > 0 ? '上 ' : '下 ') + M.fmt(Math.abs(k)) + ' 格' }, L);
    }

    M.$('#fn-expr').innerHTML = 'y = ' + (k === 1 ? '' : (k === -1 ? '−' : M.fmt(k))) + 'x' + (b === 0 ? '' : M.sign(b));
    M.$('#fn-k-out').textContent = M.fmt(k);
    M.$('#fn-b-out').textContent = M.fmt(b);
    M.$('#fn-cross').textContent = '(0, ' + M.fmt(b) + ')';
    M.$('#fn-zero').textContent = k === 0 ? '没有（或处处为 0）' : '(' + M.fmt(-b / k, 2) + ', 0)';
    M.$('#fn-trend').textContent = k > 0 ? 'y 随 x 增大而增大' : (k < 0 ? 'y 随 x 增大而减小' : 'y 不随 x 变化');
    var quads = [];
    if (k > 0 && b > 0) quads = ['一', '二', '三'];
    else if (k > 0 && b < 0) quads = ['一', '三', '四'];
    else if (k < 0 && b > 0) quads = ['一', '二', '四'];
    else if (k < 0 && b < 0) quads = ['二', '三', '四'];
    else if (k > 0 && b === 0) quads = ['一', '三'];
    else if (k < 0 && b === 0) quads = ['二', '四'];
    M.$('#fn-quad').textContent = quads.length ? '第 ' + quads.join('、') + ' 象限' : '与 x 轴平行';
    M.$('#fn-text').innerHTML = k === 0
      ? 'k = 0 时 y 恒等于 ' + M.fmt(b) + '，图象是一条<b>水平直线</b>。这时它不再是一次函数（一次函数要求 k ≠ 0）。'
      : '<b>k 管倾斜</b>：每向右 1 格，直线就上升 ' + M.fmt(k) + ' 格（k 为负就是下降），|k| 越大线越陡。' +
        '<b>b 管上下</b>：它就是直线与 y 轴交点的纵坐标，把 y = ' + M.fmt(k) + 'x 整体' + (b >= 0 ? '上移 ' + M.fmt(b) : '下移 ' + M.fmt(-b)) + ' 格就得到现在这条线。';
    M.setState({ k: k, b: b, p: planIdx });
  }

  /* ---------- 模型二：两点确定一条直线（待定系数法） ---------- */
  var p1 = [-2, -1], p2 = [3, 4];
  var ax2 = null;

  function initTwo() {
    ax2 = M.axes(M.$('#tw-fig'), {
      xmin: -6, xmax: 6, ymin: -6, ymax: 6, xstep: 1, ystep: 1,
      labelStep: 2, ylabelStep: 2, left: 26, right: 10, top: 10, bottom: 22
    });
    var el = ax2.el, down = false, which = 0;
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'application');
    el.setAttribute('aria-label', '拖动两个点，自动求出经过它们的一次函数');
    function go(e, pick) {
      var p = M.svgPoint(el, e);
      var x = M.clamp(Math.round(ax2.ix(p.x)), -6, 6), y = M.clamp(Math.round(ax2.iy(p.y)), -6, 6);
      if (pick) {
        var d1 = Math.hypot(ax2.ix(p.x) - p1[0], ax2.iy(p.y) - p1[1]);
        var d2 = Math.hypot(ax2.ix(p.x) - p2[0], ax2.iy(p.y) - p2[1]);
        which = d1 <= d2 ? 0 : 1;
      }
      if (which === 0) p1 = [x, y]; else p2 = [x, y];
      showTwo(); e.preventDefault();
    }
    el.addEventListener('pointerdown', function (e) { down = true; try { el.setPointerCapture(e.pointerId); } catch (err) {} go(e, true); });
    el.addEventListener('pointermove', function (e) { if (down) go(e, false); });
    el.addEventListener('pointerup', function () { down = false; });
  }

  function showTwo() {
    var S = M.svg, L = ax2.layer;
    L.innerHTML = '';
    var dx = p2[0] - p1[0], dy = p2[1] - p1[1];
    var okLine = dx !== 0;
    if (okLine) {
      var kk = dy / dx, bb = p1[1] - kk * p1[0];
      S('path', { d: M.curve(ax2, function (x) { return kk * x + bb; }), fill: 'none', stroke: '#2f5aa8', 'stroke-width': 2.4 }, L);
      M.$('#tw-expr').innerHTML = 'y = ' + (kk === 1 ? '' : (kk === -1 ? '−' : M.fmt(kk, 3))) + 'x' + (bb === 0 ? '' : M.sign(bb));
      M.$('#tw-steps').innerHTML =
        '<span class="step">① 设 y = kx + b</span>' +
        '<span class="step">② 代入两点：' + M.fmt(p1[1]) + ' = ' + M.fmt(p1[0]) + 'k + b，' + M.fmt(p2[1]) + ' = ' + M.fmt(p2[0]) + 'k + b</span>' +
        '<span class="step">③ 两式相减：' + M.fmt(dy) + ' = ' + M.fmt(dx) + 'k，得 k = ' + M.frac(dy, dx) + ' = ' + M.fmt(kk, 3) + '</span>' +
        '<span class="step">④ 回代求出 b = ' + M.fmt(bb, 3) + '</span>';
      M.$('#tw-note').innerHTML = '这种「先设出式子、再代入求系数」的办法叫<b>待定系数法</b>。一次函数有 k、b 两个待定系数，所以需要<b>两个</b>点。';
    } else {
      M.$('#tw-expr').textContent = '不是函数';
      M.$('#tw-steps').innerHTML = '<span class="step">两点横坐标相同，连线是一条<b>竖直直线</b> x = ' + p1[0] + '。</span>';
      M.$('#tw-note').innerHTML = '竖直线<b>不是函数</b>——同一个 x 对应了无数个 y，不满足「一个 x 只对应一个 y」。把两点错开再看。';
      S('line', { x1: ax2.X(p1[0]), y1: ax2.Y(-6), x2: ax2.X(p1[0]), y2: ax2.Y(6), stroke: '#c2603f', 'stroke-width': 2, 'stroke-dasharray': '6 4' }, L);
    }
    [[p1, '#c2603f', 'A'], [p2, '#3f7d6a', 'B']].forEach(function (q) {
      S('circle', { cx: ax2.X(q[0][0]), cy: ax2.Y(q[0][1]), r: 6, fill: q[1], stroke: '#fff', 'stroke-width': 2 }, L);
      S('text', { x: ax2.X(q[0][0]) + 8, y: ax2.Y(q[0][1]) - 7, 'font-size': 10.5, 'font-weight': 700, fill: q[1], text: q[2] + '(' + q[0][0] + ', ' + q[0][1] + ')' }, L);
    });
  }

  /* ---------- 模型三：两种套餐哪个划算 ---------- */
  var PLANS = [
    { name: '月租 18 元 + 0.1 元/条', a: 0.1, c: 18 },
    { name: '月租 0 元 + 0.25 元/条', a: 0.25, c: 0 }
  ];
  var planIdx = M.num(st.p, 150, 0, 400);

  function showPlan() {
    var a3 = M.axes(M.$('#pl-fig'), {
      xmin: 0, xmax: 400, ymin: 0, ymax: 100, xstep: 50, ystep: 20,
      labelStep: 100, ylabelStep: 20, left: 36, bottom: 24, top: 12,
      xlabel: '短信条数', ylabel: '话费（元）'
    });
    var S = M.svg, L = a3.layer;
    var COL = ['#2f5aa8', '#c2603f'];
    PLANS.forEach(function (p, i) {
      S('path', { d: M.curve(a3, function (x) { return p.a * x + p.c; }, 0, 400), fill: 'none', stroke: COL[i], 'stroke-width': 2.4 }, L);
    });
    /* 交点：a1·x + c1 = a2·x + c2 */
    var xi = (PLANS[1].c - PLANS[0].c) / (PLANS[0].a - PLANS[1].a);
    var yi = PLANS[0].a * xi + PLANS[0].c;
    S('circle', { cx: a3.X(xi), cy: a3.Y(yi), r: 5.5, fill: '#3f7d6a', stroke: '#fff', 'stroke-width': 1.8 }, L);
    S('text', { x: a3.X(xi) + 8, y: a3.Y(yi) - 8, 'font-size': 10, fill: '#2f6a57', text: '持平：' + M.fmt(xi) + ' 条' }, L);
    S('line', { x1: a3.X(planIdx), y1: a3.Y(0), x2: a3.X(planIdx), y2: a3.Y(100), stroke: '#8d95a6', 'stroke-width': 1.2, 'stroke-dasharray': '4 3' }, L);

    var c1 = PLANS[0].a * planIdx + PLANS[0].c, c2 = PLANS[1].a * planIdx + PLANS[1].c;
    M.$('#pl-n').textContent = planIdx + ' 条';
    M.$('#pl-c1').textContent = M.fmt(c1, 2) + ' 元';
    M.$('#pl-c2').textContent = M.fmt(c2, 2) + ' 元';
    M.$('#pl-better').textContent = Math.abs(c1 - c2) < 1e-9 ? '一样' : (c1 < c2 ? '套餐一便宜' : '套餐二便宜');
    M.$('#pl-text').innerHTML = '两条直线的<b>交点</b>就是两种套餐花钱一样多的地方：' + M.fmt(xi) + ' 条。' +
      '发得<b>比它少</b>选没有月租的套餐二，发得<b>比它多</b>选月租低单价的套餐一。' +
      '图象比算式更直观——哪条线在下面，哪个就便宜。';
    M.setState({ k: k, b: b, p: planIdx });
  }

  document.addEventListener('DOMContentLoaded', function () {
    M.bindRange(M.$('#fn-k'), function (v) { k = v; showLine(); });
    M.bindRange(M.$('#fn-b'), function (v) { b = v; showLine(); });
    M.$('#fn-ref').addEventListener('change', showLine);
    showLine();
    initTwo(); showTwo();
    M.bindRange(M.$('#pl-range'), function (v) { planIdx = v; showPlan(); })();

    M.quiz([
      {
        level: 'base',
        title: '把直线调成「y 随 x 增大而减小」且过 (0, 3)',
        desc: 'k 决定增减，b 决定与 y 轴的交点。',
        label: '在一次函数模型里调滑块',
        button: '检查 k 和 b',
        check: function () {
          if (!(k < 0)) return { ok: false, msg: '现在 k = ' + M.fmt(k) + '，要让 y 随 x 增大而减小，k 必须<b>小于 0</b>。' };
          if (b !== 3) return { ok: false, msg: 'k 对了。但现在 b = ' + M.fmt(b) + '，过 (0, 3) 要求 b = 3。' };
          return { ok: true, msg: 'y = ' + M.fmt(k) + 'x + 3，k &lt; 0 所以直线从左上往右下走，且与 y 轴交于 (0, 3)。' };
        }
      },
      {
        level: 'base',
        title: '一次函数 y = 3x − 6 与 x 轴的交点是？',
        desc: '与 x 轴相交时，纵坐标 y 等于几？',
        options: ['(2, 0)', '(0, −6)', '(−2, 0)', '(6, 0)'],
        answer: 0,
        hint: '令 y = 0，解 3x − 6 = 0。',
        explain: '令 y = 0 得 3x − 6 = 0，x = 2，交点是 <b>(2, 0)</b>。而 (0, −6) 是与 <b>y 轴</b>的交点，别弄反：<b>求与 x 轴交点就令 y = 0</b>。'
      },
      {
        level: 'base',
        title: '点 (2, 5) 在直线 y = 2x + 1 上吗？',
        desc: '把 x = 2 代进去，看算出来的 y 是不是 5。',
        options: ['在，因为 2×2+1 = 5', '不在，因为 2+1 ≠ 5', '在，因为 2 和 5 都是正数', '无法判断'],
        answer: 0,
        hint: '把点的横坐标代入表达式，看纵坐标对不对得上。',
        explain: '把 x = 2 代入：y = 2×2 + 1 = 5，和点的纵坐标一致，所以<b>点在直线上</b>。判断点在不在图象上，就是看它的坐标<b>满不满足表达式</b>。'
      },
      {
        level: 'mid',
        title: '直线 y = −2x + 6 不经过哪个象限？',
        desc: '可以把 k 调成 −2、b 调成 6 看看。',
        options: ['第三象限', '第一象限', '第二象限', '第四象限'],
        answer: 0,
        hint: 'k < 0、b > 0 时，直线从左上穿到右下。',
        explain: 'k &lt; 0、b &gt; 0 的直线经过第一、二、四象限，<b>不过第三象限</b>。记法：b 决定它从 y 轴正半轴出发，k 决定它往右下走。'
      },
      {
        level: 'mid',
        title: '求经过 (1, 3) 和 (3, 7) 的一次函数',
        desc: '可以在上面把两个点拖到这两个位置。',
        options: ['y = 2x + 1', 'y = 2x − 1', 'y = x + 2', 'y = 4x − 1'],
        answer: 0,
        hint: '先用两点求 k =（y 差）÷（x 差）。',
        explain: 'k = (7−3)/(3−1) = 2；代入 (1, 3)：3 = 2 + b，得 b = 1。所以 y = 2x + 1。这就是<b>待定系数法</b>。'
      },
      {
        level: 'mid',
        title: '直线 y = 2x − 3 向上平移 5 个单位后，表达式是？',
        desc: '平移只动 b，不动 k——可以把 b 从 −3 调到 2 看看线怎么挪。',
        options: ['y = 2x + 2', 'y = 2x − 8', 'y = 7x − 3', 'y = 2x + 5'],
        answer: 0,
        hint: '上移 5 就是 b 加 5；k 决定倾斜，平移不改变倾斜。',
        explain: '上移 5：b 从 −3 变成 −3 + 5 = 2，得 <b>y = 2x + 2</b>。口诀「<b>上加下减</b>」只作用在 b 上。注意平移后两条直线<b>平行</b>（k 没变）。'
      },
      {
        level: 'trap',
        title: '直线 y = kx + 3 经过点 (−2, 0)，k 是多少？',
        desc: '这题要反过来用：已知图象上的点，求系数。',
        options: ['1.5', '−1.5', '−6', '6'],
        answer: 0,
        hint: '把 (−2, 0) 代入 y = kx + 3，解这个关于 k 的方程。',
        explain: '代入得 0 = −2k + 3，所以 2k = 3，<b>k = 1.5</b>。常见错误是算成 k = −1.5——移项时把符号弄反了。代入后要把它当成<b>关于 k 的一元一次方程</b>认真解。'
      },
      {
        level: 'trap',
        title: 'k = 2 时直线与 x 轴夹角是 45° 吗？',
        desc: '想想 k 到底是什么——是角度还是比值？',
        options: ['不是，k 是比值不是角度，k = 1 时才 45°', '是，k 越大角度越大所以是 45°', '是，任何 k > 0 都是 45°', '不是，k = 2 时夹角是 90°'],
        answer: 0,
        hint: 'k 表示「向右 1 格，上升几格」。',
        explain: 'k 是<b>上升量 ÷ 水平量</b>，不是角度。k = 1 时上升和水平相等，夹角才是 45°；k = 2 时夹角约 63°，<b>绝不是 90°</b>。把 k 当角度是这一章最常见的误解。'
      }
    ]);
  });
})();
