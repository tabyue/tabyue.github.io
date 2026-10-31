/* 第 27 课 · 概率的进一步认识（北师大版九上第六章） */
(function () {
  'use strict';
  var M = window.Mx, st = M.getState();

  /* ---------- 模型一：树状图 / 表格列出所有结果 ---------- */
  var SCENES = [
    { id: 'coin2', name: '抛两枚硬币', opts: [['正', '反'], ['正', '反']],
      want: function (r) { return r[0] === r[1]; }, wantText: '两枚一样' },
    { id: 'dice2', name: '掷两个骰子', opts: [['1', '2', '3', '4', '5', '6'], ['1', '2', '3', '4', '5', '6']],
      want: function (r) { return +r[0] + +r[1] === 7; }, wantText: '点数和为 7' },
    { id: 'ball', name: '两袋各摸一球', opts: [['红', '黄'], ['红', '黄', '蓝']],
      want: function (r) { return r[0] === r[1]; }, wantText: '颜色相同' },
    { id: 'purple', name: '配紫色', opts: [['红', '蓝', '白'], ['红', '蓝']],
      want: function (r) { return (r[0] === '红' && r[1] === '蓝') || (r[0] === '蓝' && r[1] === '红'); }, wantText: '配成紫色（红+蓝）' }
  ];
  var sIdx = M.num(st.s, 0, 0, 3), view = st.v || 'tree';

  function allOutcomes(sc) {
    var out = [];
    sc.opts[0].forEach(function (x) { sc.opts[1].forEach(function (y) { out.push([x, y]); }); });
    return out;
  }

  function showScene() {
    var sc = SCENES[sIdx], all = allOutcomes(sc);
    var hit = all.filter(sc.want);
    var s = M.$('#tr-fig');
    s.innerHTML = '';
    var S = M.svg;
    if (view === 'tree') {
      var n1 = sc.opts[0].length, n2 = sc.opts[1].length;
      var x0 = 26, x1 = 108, x2 = 196;
      var H = 190, pad = 14;
      S('circle', { cx: x0, cy: H / 2, r: 5, fill: '#3a5a93' }, s);
      S('text', { x: x0, y: H / 2 - 11, 'text-anchor': 'middle', 'font-size': 9.5, fill: '#6b7385', text: '开始' }, s);
      sc.opts[0].forEach(function (a, i) {
        var y1 = pad + (H - 2 * pad) * (i + 0.5) / n1;
        S('line', { x1: x0, y1: H / 2, x2: x1, y2: y1, stroke: '#8795b5', 'stroke-width': 1.3 }, s);
        S('circle', { cx: x1, cy: y1, r: 4, fill: '#5d7cb0' }, s);
        S('text', { x: x1, y: y1 - 7, 'text-anchor': 'middle', 'font-size': 10, fill: '#2f4473', text: a }, s);
        sc.opts[1].forEach(function (b, j) {
          var y2 = pad + (H - 2 * pad) * (i * n2 + j + 0.5) / (n1 * n2);
          var isHit = sc.want([a, b]);
          S('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: isHit ? '#c2603f' : '#c7cdd8', 'stroke-width': isHit ? 1.8 : 1.1 }, s);
          S('text', { x: x2 + 6, y: y2 + 3.5, 'font-size': 9.5, 'font-weight': isHit ? 700 : 400, fill: isHit ? '#a4492b' : '#8d95a6', text: a + b }, s);
        });
      });
    } else {
      var cw = Math.min(42, 250 / sc.opts[1].length), ch = Math.min(26, 170 / sc.opts[0].length);
      var ox = 52, oy = 30;
      sc.opts[1].forEach(function (b, j) {
        S('text', { x: ox + j * cw + cw / 2, y: oy - 6, 'text-anchor': 'middle', 'font-size': 10, fill: '#6b7385', text: b }, s);
      });
      sc.opts[0].forEach(function (a, i) {
        S('text', { x: ox - 8, y: oy + i * ch + ch / 2 + 4, 'text-anchor': 'end', 'font-size': 10, fill: '#6b7385', text: a }, s);
        sc.opts[1].forEach(function (b, j) {
          var isHit = sc.want([a, b]);
          S('rect', { x: ox + j * cw, y: oy + i * ch, width: cw - 2, height: ch - 2, rx: 3, fill: isHit ? '#f0d4cb' : '#eef1f6', stroke: isHit ? '#c2603f' : '#dfe3ea' }, s);
          S('text', { x: ox + j * cw + cw / 2 - 1, y: oy + i * ch + ch / 2 + 3, 'text-anchor': 'middle', 'font-size': 9, 'font-weight': isHit ? 700 : 400, fill: isHit ? '#a4492b' : '#8d95a6', text: a + b }, s);
        });
      });
    }
    M.$('#tr-all').textContent = all.length + ' 种';
    M.$('#tr-hit').textContent = hit.length + ' 种';
    M.$('#tr-p').innerHTML = M.frac(hit.length, all.length) + ' ≈ ' + M.fmt(hit.length / all.length * 100, 1) + '%';
    M.$('#tr-want').textContent = sc.wantText;
    M.$('#tr-text').innerHTML = '两步试验要<b>把所有结果不重不漏地列出来</b>，再数有几种符合要求。' +
      '一共 ' + sc.opts[0].length + ' × ' + sc.opts[1].length + ' = <b>' + all.length + '</b> 种等可能结果，符合的有 ' + hit.length + ' 种。' +
      (sc.id === 'coin2' ? '注意「正反」和「反正」是<b>两种不同</b>的结果，不能合并成一种——这是最常见的错误。' : '') +
      (sc.id === 'dice2' ? '点数和为 7 共 6 种，概率 1/6，是两个骰子里<b>最容易出现</b>的和。' : '');
    M.setState({ s: sIdx, v: view });
  }

  /* ---------- 模型二：用频率估计概率（摸球估计总数） ---------- */
  var TOTAL = 400, WHITE = 60;   /* 袋中实际 400 个球，其中 60 个白球（未知） */
  var drawn = 0, whiteSeen = 0, trail = [];

  function doDraw(n) {
    for (var i = 0; i < n; i++) {
      drawn++;
      if (Math.random() < WHITE / TOTAL) whiteSeen++;
      /* 只记录关键点，折线才不会太密 */
      if (drawn <= 60 || drawn % Math.max(1, Math.floor(drawn / 60)) === 0) trail.push([drawn, whiteSeen / drawn]);
    }
    if (trail.length > 300) trail = trail.filter(function (_, i) { return i % 2 === 0; });
    showEstimate();
  }

  function showEstimate() {
    var p = drawn ? whiteSeen / drawn : 0;
    var est = drawn ? Math.round(p * TOTAL) : 0;
    var ax = M.axes(M.$('#es-fig'), {
      /* 刚开始摸几次时频率可能是 0.5、1，纵轴上限跟着放大，折线不会冲出坐标区 */
      xmin: 0, xmax: Math.max(50, drawn), ymin: 0, ymax: Math.max(0.4, Math.ceil(Math.max.apply(null, trail.map(function (q) { return q[1]; }).concat([0])) * 10) / 10),
      xstep: Math.max(10, Math.round(Math.max(50, drawn) / 5)), ystep: 0.1,
      labelStep: Math.max(10, Math.round(Math.max(50, drawn) / 5)), ylabelStep: 0.1,
      left: 36, bottom: 24, top: 10, xlabel: '摸的次数', ylabel: '白球频率'
    });
    var S = M.svg, L = ax.layer;
    S('line', { x1: ax.X(0), y1: ax.Y(WHITE / TOTAL), x2: ax.X(ax.xmax), y2: ax.Y(WHITE / TOTAL), stroke: '#c2603f', 'stroke-width': 1.5, 'stroke-dasharray': '6 4' }, L);
    S('text', { x: ax.X(ax.xmax) - 4, y: ax.Y(WHITE / TOTAL) - 5, 'text-anchor': 'end', 'font-size': 10, fill: '#a4492b', text: '真实比例 ' + M.fmt(WHITE / TOTAL, 3) }, L);
    if (trail.length > 1) {
      S('polyline', { points: trail.map(function (q) { return M.fmt(ax.X(q[0]), 1) + ',' + M.fmt(ax.Y(q[1]), 1); }).join(' '), fill: 'none', stroke: '#2f5aa8', 'stroke-width': 1.8 }, L);
    }
    M.$('#es-n').textContent = drawn;
    M.$('#es-w').textContent = whiteSeen;
    M.$('#es-p').textContent = drawn ? M.fmt(p * 100, 1) + '%' : '—';
    M.$('#es-est').textContent = drawn ? est + ' 个' : '—';
    M.$('#es-text').innerHTML = drawn < 50
      ? '摸的次数太少，估计很不准。多摸几次看看。'
      : '摸了 ' + drawn + ' 次，白球出现 ' + whiteSeen + ' 次，频率 ' + M.fmt(p * 100, 1) + '%。' +
        '袋里一共 400 个球，估计白球约 <b>' + est + '</b> 个（真实是 ' + WHITE + ' 个）。' +
        '<b>当概率不好直接算时，就用大量重复试验的频率去估计它</b>——估算池塘里有多少鱼用的就是这个办法。';
  }
  document.addEventListener('DOMContentLoaded', function () {
    M.chips(M.$('#tr-chips'), SCENES.map(function (x, i) { return { label: x.name, value: String(i) }; }), String(sIdx), function (v) { sIdx = +v; showScene(); });
    M.chips(M.$('#tr-view'), [{ label: '树状图', value: 'tree' }, { label: '表格', value: 'table' }], view, function (v) { view = v; showScene(); });
    showScene();
    M.$('#es-10').addEventListener('click', function () { doDraw(10); });
    M.$('#es-100').addEventListener('click', function () { doDraw(100); });
    M.$('#es-reset').addEventListener('click', function () { drawn = 0; whiteSeen = 0; trail = []; showEstimate(); });
    doDraw(10);   /* 先摸 10 次，页面一打开就有东西看 */

    M.quiz([
      {
        level: 'base',
        title: '抛两枚硬币，两枚一样的概率是多少？',
        desc: '切到「抛两枚硬币」，数一数树状图。',
        label: '在树状图里看',
        button: '检查选的场景',
        check: function () {
          if (SCENES[sIdx].id !== 'coin2') return { ok: false, msg: '先点「抛两枚硬币」。' };
          return { ok: true, msg: '四种等可能结果：正正、正反、反正、反反。两枚一样的有 2 种，概率 2/4 = <b>1/2</b>。<b>「正反」和「反正」要算两种</b>，当成一种就会错算成 1/3。' };
        }
      },
      {
        level: 'base',
        title: '抛两枚硬币，一共有几种等可能的结果？',
        desc: '上面切到「抛两枚硬币」数一数树状图。',
        options: ['4 种', '3 种', '2 种', '8 种'],
        answer: 0,
        hint: '正正、正反、反正、反反。',
        explain: '共 <b>4 种</b>：正正、正反、反正、反反。关键是「正反」和「反正」算<b>两种不同</b>的结果。'
      },
      {
        level: 'base',
        title: '列举两步试验的所有结果，可以用什么工具？',
        desc: '上面提供了两种看法。',
        options: ['树状图或表格', '只能用树状图', '只能用表格', '只能靠心算'],
        answer: 0,
        hint: '上面可以在两种视图之间切换。',
        explain: '<b>树状图和表格</b>都行。结果多时表格更清楚，步骤多时树状图更直观，目的都是<b>不重不漏</b>地列全。'
      },
      {
        level: 'mid',
        title: '掷两个骰子，点数和为 7 的概率是？',
        desc: '可以切到「掷两个骰子」数一数。',
        options: ['1/6', '1/12', '1/36', '7/36'],
        answer: 0,
        hint: '一共 36 种结果，和为 7 的有几种？',
        explain: '和为 7 的有 (1,6)(2,5)(3,4)(4,3)(5,2)(6,1) 共 6 种，概率 6/36 = <b>1/6</b>。7 是两个骰子最容易出现的和。'
      },
      {
        level: 'mid',
        title: '估计池塘里有多少鱼，用的是什么方法？',
        desc: '和上面摸球估计白球个数是一个道理。',
        options: ['用频率估计概率', '直接数出来', '用树状图列举', '用平均数'],
        answer: 0,
        hint: '捞一网做标记，放回去再捞一网看比例。',
        explain: '先捞一批做记号放回，再捞一批看<b>有记号的占比</b>，用这个频率估计「有记号的鱼占全部鱼的概率」，反推总数。这就是<b>用频率估计概率</b>。'
      },
      {
        level: 'mid',
        title: '掷两个骰子，点数和为 7 的概率是？',
        desc: '上面切到「掷两个骰子」数一数标红的结果。',
        options: ['1/6', '1/12', '7/36', '1/36'],
        answer: 0,
        hint: '36 种结果里有 6 种。',
        explain: '和为 7 的有 (1,6)(2,5)(3,4)(4,3)(5,2)(6,1) 共 6 种，概率 6/36 = <b>1/6</b>。7 是两个骰子<b>最容易出现</b>的和。'
      },
      {
        level: 'mid',
        title: '要估计池塘里有多少条鱼，可以用什么方法？',
        desc: '和上面摸球估计白球个数是同一个思路。',
        options: ['捞一批做标记放回，再捞一批看标记比例', '把水抽干数', '只数岸边看得见的', '按池塘面积估算'],
        answer: 0,
        hint: '标记的鱼占全部鱼的比例，可以用频率估计。',
        explain: '这是<b>用频率估计概率</b>的经典应用：第二批中带标记的比例 ≈ 标记鱼占总数的比例，由此反推总数。'
      },
      {
        level: 'trap',
        title: '抛两枚硬币，「一正一反」的概率是 1/3 吗？',
        desc: '上面把树状图展开，仔细数一数。',
        options: ['不是，是 1/2，因为「一正一反」包含两种结果', '是 1/3', '是 1/4', '是 2/3'],
        answer: 0,
        hint: '「正反」和「反正」要分开算。',
        explain: '总共 4 种等可能结果，「一正一反」包含<b>正反、反正两种</b>，概率 2/4 = <b>1/2</b>。把它们当成一种、以为只有三种结果，是本章最经典的错误。'
      }
    ]);
  });
})();
