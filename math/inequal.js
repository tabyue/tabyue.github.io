/* 第 20 课 · 不等式与不等式组（北师大版八下第二章） */
(function () {
  'use strict';
  var M = window.Mx, st = M.getState();

  /* ---------- 模型一：不等式的基本性质 ---------- */
  var a = M.num(st.a, 2, -6, 6), b = M.num(st.b, 5, -6, 6), c = M.num(st.c, -2, -5, 5);
  var opMode = st.o || 'mul';

  function showProp() {
    var nl = M.numline(M.$('#pr-fig'), { min: -20, max: 20, step: 2, labelStep: 10, y: 44 });
    var S = M.svg, L = nl.layer;
    var a2, b2, sym2;
    if (opMode === 'add') { a2 = a + c; b2 = b + c; sym2 = a2 < b2 ? '<' : (a2 > b2 ? '>' : '='); }
    else { a2 = a * c; b2 = b * c; sym2 = a2 < b2 ? '<' : (a2 > b2 ? '>' : '='); }
    [[a, b, 28, '#8d95a6', '原来'], [a2, b2, 72, '#2f5aa8', '变换后']].forEach(function (g) {
      S('line', { x1: nl.X(g[0]), y1: g[2], x2: nl.X(g[1]), y2: g[2], stroke: g[3], 'stroke-width': 2, opacity: .5 }, L);
      [[g[0], 'a'], [g[1], 'b']].forEach(function (p, i) {
        S('circle', { cx: nl.X(p[0]), cy: g[2], r: 5.5, fill: g[3] }, L);
        S('text', { x: nl.X(p[0]), y: g[2] - 9, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 700, fill: g[3], text: p[1] + (g[4] === '原来' ? '' : "'") + '=' + M.fmt(p[0]) }, L);
      });
      S('text', { x: 6, y: g[2] + 4, 'font-size': 10, fill: g[3], text: g[4] }, L);
    });
    var sym = a < b ? '<' : (a > b ? '>' : '=');
    M.$('#pr-before').innerHTML = M.fmt(a) + ' <b>' + sym + '</b> ' + M.fmt(b);
    M.$('#pr-after').innerHTML = opMode === 'add'
      ? M.fmt(a) + M.sign(c) + ' <b>' + sym2 + '</b> ' + M.fmt(b) + M.sign(c) + '　即　' + M.fmt(a2) + ' ' + sym2 + ' ' + M.fmt(b2)
      : M.fmt(a) + ' × (' + M.fmt(c) + ') <b>' + sym2 + '</b> ' + M.fmt(b) + ' × (' + M.fmt(c) + ')　即　' + M.fmt(a2) + ' ' + sym2 + ' ' + M.fmt(b2);
    var flipped = sym !== '=' && sym2 !== '=' && sym !== sym2;
    M.$('#pr-flip').textContent = flipped ? '方向变了！' : '方向没变';
    M.$('#pr-text').innerHTML = opMode === 'add'
      ? '不等式两边同时<b>加或减</b>同一个数，方向<b>永远不变</b>。这和等式一样。'
      : (c > 0 ? '乘的是<b>正数</b>（' + M.fmt(c) + '），方向<b>不变</b>。'
        : c === 0 ? '乘以 0 后两边都变成 0，不等号变成等号——所以不等式两边<b>不能乘 0</b>。'
        : '乘的是<b>负数</b>（' + M.fmt(c) + '），不等号<b>必须反过来</b>！这是不等式和等式最大的区别，也是最容易出错的地方。');
    M.setState({ a: a, b: b, c: c, o: opMode, k: kIdx });
  }

  /* ---------- 模型二：解集画在数轴上 ---------- */
  var SOLS = [
    { id: 'gt', label: 'x > 2', test: function (x) { return x > 2; }, pts: [[2, false]], ray: 'right' },
    { id: 'ge', label: 'x ≥ 2', test: function (x) { return x >= 2; }, pts: [[2, true]], ray: 'right' },
    { id: 'lt', label: 'x < -1', test: function (x) { return x < -1; }, pts: [[-1, false]], ray: 'left' },
    { id: 'both', label: '−1 < x ≤ 3', test: function (x) { return x > -1 && x <= 3; }, pts: [[-1, false], [3, true]], ray: 'mid' },
    { id: 'none', label: 'x > 3 且 x < −1', test: function () { return false; }, pts: [[-1, false], [3, false]], ray: 'none' }
  ];
  var solIdx = 0;

  function showSol() {
    var it = SOLS[solIdx];
    var nl = M.numline(M.$('#sl-fig'), { min: -6, max: 6, step: 1, labelStep: 1, y: 50 });
    var S = M.svg, L = nl.layer;
    /* 把解集涂出来 */
    var lo = -6, hi = 6, step = 0.05, segs = [], cur = null;
    for (var x = lo; x <= hi + 1e-9; x += step) {
      if (it.test(x)) { if (!cur) cur = [x, x]; else cur[1] = x; }
      else if (cur) { segs.push(cur); cur = null; }
    }
    if (cur) segs.push(cur);
    segs.forEach(function (sg) {
      S('line', { x1: nl.X(sg[0]), y1: nl.y - 13, x2: nl.X(sg[1]), y2: nl.y - 13, stroke: '#2f5aa8', 'stroke-width': 6, 'stroke-linecap': 'butt', opacity: .8 }, L);
      /* 箭头表示延伸到无穷 */
      if (sg[1] > hi - 0.1) S('path', { d: 'M' + nl.X(hi) + ' ' + (nl.y - 13) + 'l-9 -5v10z', fill: '#2f5aa8' }, L);
      if (sg[0] < lo + 0.1) S('path', { d: 'M' + nl.X(lo) + ' ' + (nl.y - 13) + 'l9 -5v10z', fill: '#2f5aa8' }, L);
    });
    it.pts.forEach(function (p) {
      S('circle', { cx: nl.X(p[0]), cy: nl.y - 13, r: 5.5, fill: p[1] ? '#2f5aa8' : '#fff', stroke: '#2f5aa8', 'stroke-width': 2 }, L);
      S('text', { x: nl.X(p[0]), y: nl.y - 24, 'text-anchor': 'middle', 'font-size': 10, fill: '#2f5aa8', text: M.fmt(p[0]) }, L);
    });
    if (!segs.length) S('text', { x: nl.X(0), y: nl.y - 24, 'text-anchor': 'middle', 'font-size': 11, fill: '#a4422c', text: '空集：没有数能同时满足' }, L);
    M.$('#sl-label').textContent = it.label;
    M.$('#sl-text').innerHTML = it.id === 'none'
      ? '两个条件<b>互相矛盾</b>，没有数能同时满足，这个不等式组<b>无解</b>。在数轴上就是两段涂色<b>没有公共部分</b>。'
      : '<b>实心点</b>表示取得到（≥、≤），<b>空心点</b>表示取不到（&gt;、&lt;）。' +
        (it.id === 'both' ? '不等式组的解集是两个解集的<b>公共部分</b>，画在数轴上一目了然。' : '箭头表示朝那个方向一直延伸下去。');
  }

  /* ---------- 模型三：不等式与一次函数 ---------- */
  var kIdx = M.num(st.k, 2, -3, 3), bIdx = M.num(st.d, -4, -6, 6);

  function showFun() {
    var ax = M.axes(M.$('#fn-fig'), {
      xmin: -6, xmax: 6, ymin: -8, ymax: 8, xstep: 1, ystep: 2,
      labelStep: 2, ylabelStep: 4, left: 28, right: 10, top: 10, bottom: 22
    });
    var S = M.svg, L = ax.layer;
    /* y > 0 的那一段涂色 */
    if (kIdx !== 0) {
      var x0 = -bIdx / kIdx;
      var from = kIdx > 0 ? x0 : ax.xmin, to = kIdx > 0 ? ax.xmax : x0;
      if (to > from) {
        S('rect', { x: ax.X(from), y: ax.Y(8), width: ax.X(to) - ax.X(from), height: ax.Y(0) - ax.Y(8), fill: '#dbe4f4', opacity: .7 }, L);
      }
      S('line', { x1: ax.X(x0), y1: ax.Y(-8), x2: ax.X(x0), y2: ax.Y(8), stroke: '#c2603f', 'stroke-width': 1.4, 'stroke-dasharray': '5 4' }, L);
      S('circle', { cx: ax.X(x0), cy: ax.Y(0), r: 5, fill: '#c2603f', stroke: '#fff', 'stroke-width': 1.6 }, L);
      S('text', { x: ax.X(x0), y: ax.Y(0) + 17, 'text-anchor': 'middle', 'font-size': 10.5, fill: '#a4492b', text: 'x = ' + M.fmt(x0, 2) }, L);
    }
    S('path', { d: M.curve(ax, function (x) { return kIdx * x + bIdx; }), fill: 'none', stroke: '#2f5aa8', 'stroke-width': 2.6 }, L);
    M.$('#fn-expr').innerHTML = 'y = ' + (kIdx === 1 ? '' : (kIdx === -1 ? '−' : M.fmt(kIdx))) + 'x' + (bIdx === 0 ? '' : M.sign(bIdx));
    if (kIdx === 0) {
      M.$('#fn-sol').textContent = bIdx > 0 ? '全体实数' : '无解';
      M.$('#fn-text').innerHTML = 'k = 0 时图象是水平线，y 恒等于 ' + M.fmt(bIdx) + '，所以 y &gt; 0 ' + (bIdx > 0 ? '恒成立' : '永远不成立') + '。';
    } else {
      var x0b = -bIdx / kIdx;
      M.$('#fn-sol').innerHTML = 'x ' + (kIdx > 0 ? '&gt;' : '&lt;') + ' ' + M.fmt(x0b, 2);
      M.$('#fn-text').innerHTML = '解不等式 ' + (kIdx === 1 ? '' : M.fmt(kIdx)) + 'x' + (bIdx === 0 ? '' : M.sign(bIdx)) + ' &gt; 0，' +
        '就是在图象上找<b>直线在 x 轴上方</b>的那一段（蓝色区域）。' +
        '直线与 x 轴交于 x = ' + M.fmt(x0b, 2) + '，' +
        (kIdx > 0 ? '直线从左下往右上，所以交点<b>右边</b>才在上方。' : '直线从左上往右下，所以交点<b>左边</b>才在上方。') +
        (kIdx < 0 ? '这也解释了为什么两边除以负数要变号。' : '');
    }
    M.setState({ a: a, b: b, c: c, o: opMode, k: kIdx, d: bIdx });
  }

  document.addEventListener('DOMContentLoaded', function () {
    M.chips(M.$('#pr-chips'), [{ label: '两边同加 c', value: 'add' }, { label: '两边同乘 c', value: 'mul' }], opMode, function (v) { opMode = v; showProp(); });
    M.bindRange(M.$('#pr-a'), function (v) { a = v; showProp(); });
    M.bindRange(M.$('#pr-b'), function (v) { b = v; showProp(); });
    M.bindRange(M.$('#pr-c'), function (v) { c = v; showProp(); });
    showProp();
    M.chips(M.$('#sl-chips'), SOLS.map(function (x, i) { return { label: x.label, value: String(i) }; }), '0', function (v) { solIdx = +v; showSol(); });
    showSol();
    M.bindRange(M.$('#fn-k'), function (v) { kIdx = v; showFun(); });
    M.bindRange(M.$('#fn-b'), function (v) { bIdx = v; showFun(); });
    showFun();

    M.quiz([
      {
        level: 'base',
        title: '让不等号方向反过来',
        desc: '选「两边同乘 c」，把 c 调成负数看看。',
        label: '在性质模型里操作',
        button: '检查现在的操作',
        check: function () {
          if (opMode !== 'mul') return { ok: false, msg: '先选「两边同乘 c」。' };
          if (c >= 0) return { ok: false, msg: '现在 c = ' + M.fmt(c) + '，把它调成<b>负数</b>。' };
          if (a === b) return { ok: false, msg: 'a 和 b 相等时是等号，把它们调成不相等。' };
          return { ok: true, msg: '两边同乘负数，不等号<b>必须变向</b>。这是不等式区别于等式的关键，解不等式时漏了变号就全错。' };
        }
      },
      {
        level: 'base',
        title: '由 a > b 可以得到？',
        desc: '两边同加同一个数，方向不变。',
        options: ['a + 3 > b + 3', 'a + 3 < b + 3', 'a + 3 = b + 3', '无法确定'],
        answer: 0,
        hint: '加减不改变不等号方向。',
        explain: '两边同加 3，不等号<b>方向不变</b>：a + 3 &gt; b + 3。加减法这一点和等式完全一样。'
      },
      {
        level: 'base',
        title: '解不等式 x + 2 < 5',
        desc: '两边同减 2。',
        options: ['x < 3', 'x > 3', 'x < 7', 'x > 7'],
        answer: 0,
        hint: '只做减法，不变号。',
        explain: 'x &lt; 5 − 2 = <b>3</b>。这里只用到加减，不等号方向不变。'
      },
      {
        level: 'mid',
        title: '解集 x ≥ 2 在数轴上怎么画？',
        desc: '注意端点是实心还是空心。',
        options: ['2 处画实心点，向右画箭头', '2 处画空心点，向右画箭头', '2 处画实心点，向左画箭头', '2 处画空心点，向左画箭头'],
        answer: 0,
        hint: '「≥」包含等于，端点取得到。',
        explain: '≥ 和 ≤ 用<b>实心点</b>（取得到），&gt; 和 &lt; 用<b>空心点</b>（取不到）。x ≥ 2 表示 2 及其右边所有数。'
      },
      {
        level: 'mid',
        title: '由 −2x > 6 可以得到什么？',
        desc: '两边同除以 −2。',
        options: ['x < −3', 'x > −3', 'x > 3', 'x < 3'],
        answer: 0,
        hint: '除以负数，不等号要反向。',
        explain: '两边同除以 <b>−2（负数）</b>，不等号变向：x &lt; −3。如果忘了变号写成 x &gt; −3，答案就完全反了。'
      },
      {
        level: 'mid',
        title: '解不等式 3x ≥ 12',
        desc: '两边同除以 3（正数）。',
        options: ['x ≥ 4', 'x ≤ 4', 'x ≥ 36', 'x ≤ 36'],
        answer: 0,
        hint: '除以正数，方向不变。',
        explain: 'x ≥ <b>4</b>。除以<b>正数</b>方向不变；端点 4 取得到，数轴上画<b>实心点</b>。'
      },
      {
        level: 'mid',
        title: '不等式组 x > 1 且 x < 4 的解集是？',
        desc: '取两个解集的公共部分。',
        options: ['1 < x < 4', 'x > 1', 'x < 4', '无解'],
        answer: 0,
        hint: '在数轴上画出来，看重叠的那一段。',
        explain: '公共部分是 <b>1 &lt; x &lt; 4</b>。口诀：「大大取大、小小取小、大小小大中间找、小大大小无解了」。'
      },
      {
        level: 'trap',
        title: '解不等式 −3x > 9',
        desc: '两边要除以 −3，注意方向。',
        options: ['x < −3', 'x > −3', 'x < 3', 'x > 3'],
        answer: 0,
        hint: '除以负数，不等号必须掉头。',
        explain: '两边同除以 <b>−3（负数）</b>，不等号<b>变向</b>：x &lt; <b>−3</b>。忘记变号写成 x &gt; −3 是本章最大的失分点。'
      }
    ]);
  });
})();
