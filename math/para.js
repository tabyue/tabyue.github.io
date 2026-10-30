/* 第 23 课 · 平行四边形与特殊平行四边形（北师大版八下第六章、九上第一章） */
(function () {
  'use strict';
  var M = window.Mx, st = M.getState();

  /* ---------- 模型一：一个可变的四边形 ----------
     用「邻边比」和「夹角」两个参数，就能走遍平行四边形 → 矩形 → 菱形 → 正方形 */
  var ratio = M.num(st.r, 1.7, 1, 2.6), ang = M.num(st.a, 62, 30, 90);

  function showShape() {
    var s = M.$('#sh-fig');
    s.innerHTML = '';
    var S = M.svg;
    var b = 108, a = b / ratio;           /* 两条邻边长度 */
    var r = ang * Math.PI / 180;
    var A = [0, 0], B = [b, 0], D = [a * Math.cos(r), -a * Math.sin(r)];
    var C = [B[0] + D[0], B[1] + D[1]];
    var pts = [A, B, C, D];
    /* 居中 */
    var xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; });
    var ox = 150 - (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2;
    var oy = 100 - (Math.min.apply(null, ys) + Math.max.apply(null, ys)) / 2;
    var P = pts.map(function (p) { return [p[0] + ox, p[1] + oy]; });

    var isRect = Math.abs(ang - 90) < 0.6;
    var isRhom = Math.abs(ratio - 1) < 0.03;
    var isSq = isRect && isRhom;
    var col = isSq ? '#3f7d6a' : (isRect || isRhom ? '#5d7cb0' : '#8795b5');
    S('polygon', { points: P.map(function (p) { return M.fmt(p[0], 1) + ',' + M.fmt(p[1], 1); }).join(' '), fill: isSq ? '#e8f0e6' : '#eaeff8', stroke: col, 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, s);
    /* 两条对角线 */
    S('line', { x1: P[0][0], y1: P[0][1], x2: P[2][0], y2: P[2][1], stroke: '#c2603f', 'stroke-width': 1.6, 'stroke-dasharray': '5 4' }, s);
    S('line', { x1: P[1][0], y1: P[1][1], x2: P[3][0], y2: P[3][1], stroke: '#3f7d6a', 'stroke-width': 1.6, 'stroke-dasharray': '5 4' }, s);
    var mid = [(P[0][0] + P[2][0]) / 2, (P[0][1] + P[2][1]) / 2];
    S('circle', { cx: mid[0], cy: mid[1], r: 3.6, fill: '#2f3b52' }, s);
    ['A', 'B', 'C', 'D'].forEach(function (nm, i) {
      S('text', { x: P[i][0] + (i === 0 || i === 3 ? -13 : 9), y: P[i][1] + (i < 2 ? 15 : -7), 'font-size': 12, 'font-weight': 700, fill: '#2f3b52', text: nm }, s);
    });

    var d1 = Math.hypot(P[2][0] - P[0][0], P[2][1] - P[0][1]);
    var d2 = Math.hypot(P[3][0] - P[1][0], P[3][1] - P[1][1]);
    var perp = Math.abs(ratio - 1) < 0.03;
    var name = isSq ? '正方形' : (isRect ? '矩形' : (isRhom ? '菱形' : '一般平行四边形'));
    M.$('#sh-name').textContent = name;
    M.$('#sh-sides').textContent = M.fmt(a, 1) + ' 与 ' + M.fmt(b, 1);
    M.$('#sh-ang-out').textContent = M.fmt(ang) + '° / ' + M.fmt(180 - ang) + '°';
    M.$('#sh-d1').textContent = M.fmt(d1, 1);
    M.$('#sh-d2').textContent = M.fmt(d2, 1);
    var ul = M.$('#sh-props');
    ul.innerHTML = '';
    [
      ['对边平行且相等', true, '所有平行四边形都有'],
      ['对角相等、邻角互补', true, '所有平行四边形都有'],
      ['对角线互相平分', true, '所有平行四边形都有'],
      ['四个角都是直角', isRect, '矩形才有'],
      ['对角线相等', Math.abs(d1 - d2) < 1.5, '矩形才有'],
      ['四条边都相等', isRhom, '菱形才有'],
      ['对角线互相垂直', perp, '菱形才有'],
      ['对角线平分一组对角', perp, '菱形才有']
    ].forEach(function (p) {
      var li = M.html('li', { class: p[1] ? 'yes' : 'no' }, ul);
      M.html('i', { text: p[1] ? '✓' : '✗' }, li);
      M.html('span', { html: p[0] + '<span class="note" style="font-size:11px"> · ' + p[2] + '</span>' }, li);
    });
    M.$('#sh-text').innerHTML = isSq
      ? '四边相等 + 四角都是直角，这是<b>正方形</b>——它<b>既是矩形又是菱形</b>，同时拥有两边的全部性质。'
      : isRect ? '把角调成 90°，就从平行四边形变成了<b>矩形</b>，多出来的性质是<b>对角线相等</b>。再把邻边调成相等就是正方形。'
      : isRhom ? '把邻边调成相等，就变成了<b>菱形</b>，多出来的性质是<b>对角线互相垂直、并且平分一组对角</b>。再把角调成 90° 就是正方形。'
      : '现在是<b>一般的平行四边形</b>：对边平行且相等、对角线互相平分。' +
        '把<b>夹角调到 90°</b> 得到矩形，把<b>邻边比调到 1</b> 得到菱形，两个都调就是正方形。';
    M.setState({ r: ratio, a: ang, j: judgeIdx });
  }

  /* ---------- 模型二：判定条件够不够 ---------- */
  var JUDGE = [
    { t: '两组对边分别平行', ok: true, why: '这是平行四边形的<b>定义</b>。' },
    { t: '两组对边分别相等', ok: true, why: '可以用全等三角形证明，是常用判定。' },
    { t: '一组对边平行且相等', ok: true, why: '注意是<b>同一组</b>对边既平行又相等。' },
    { t: '一组对边平行，另一组对边相等', ok: false, why: '不行！可能画出<b>等腰梯形</b>。这是最经典的陷阱。' },
    { t: '对角线互相平分', ok: true, why: '两条对角线互相平分，四边形一定是平行四边形。' },
    { t: '两组对角分别相等', ok: true, why: '由内角和可推出对边平行。' },
    { t: '对角线相等', ok: false, why: '不行！等腰梯形的对角线也相等，但它不是平行四边形。' },
    { t: '一组对边相等，一组对角相等', ok: false, why: '条件不够，可以构造出反例。' }
  ];
  var judgeIdx = 0;

  function showJudge() {
    var j = JUDGE[judgeIdx];
    var s = M.$('#jd-fig');
    s.innerHTML = '';
    var S = M.svg;
    if (j.ok) {
      S('polygon', { points: '40,110 160,110 200,40 80,40', fill: '#e8f0e6', stroke: '#3f7d6a', 'stroke-width': 2.2 }, s);
      S('text', { x: 120, y: 140, 'text-anchor': 'middle', 'font-size': 11, fill: '#2f6a4a', text: '一定是平行四边形' }, s);
    } else {
      /* 画出反例 */
      if (j.t.indexOf('对角线相等') >= 0 || j.t.indexOf('另一组对边相等') >= 0) {
        S('polygon', { points: '40,110 200,110 165,40 75,40', fill: '#f7e9e3', stroke: '#c2603f', 'stroke-width': 2.2 }, s);
        S('text', { x: 120, y: 140, 'text-anchor': 'middle', 'font-size': 11, fill: '#a4422c', text: '反例：等腰梯形也满足' }, s);
      } else {
        S('polygon', { points: '40,110 180,110 150,40 60,52', fill: '#f7e9e3', stroke: '#c2603f', 'stroke-width': 2.2 }, s);
        S('text', { x: 120, y: 140, 'text-anchor': 'middle', 'font-size': 11, fill: '#a4422c', text: '反例：这个四边形也满足' }, s);
      }
    }
    M.$('#jd-cond').textContent = j.t;
    M.$('#jd-ok').innerHTML = j.ok ? '<b style="color:#2f6a4a">能判定 ✓</b>' : '<b style="color:#a4422c">不能判定 ✗</b>';
    M.$('#jd-why').innerHTML = j.why;
  }

  /* ---------- 模型三：三角形中位线 ---------- */
  var midT = M.num(st.m, 150, 70, 240);

  function showMid() {
    var s = M.$('#md-fig');
    s.innerHTML = '';
    var S = M.svg;
    var B = [50, 150], C = [250, 150], A = [midT, 42];
    var D = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
    var E = [(A[0] + C[0]) / 2, (A[1] + C[1]) / 2];
    S('polygon', { points: [A, B, C].map(function (p) { return M.fmt(p[0], 1) + ',' + M.fmt(p[1], 1); }).join(' '), fill: '#eaeff8', stroke: '#3a5a93', 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, s);
    S('line', { x1: D[0], y1: D[1], x2: E[0], y2: E[1], stroke: '#c2603f', 'stroke-width': 2.6 }, s);
    [['A', A, 0, -10], ['B', B, -13, 6], ['C', C, 10, 6], ['D', D, -15, 0], ['E', E, 10, 0]].forEach(function (p) {
      S('circle', { cx: p[1][0], cy: p[1][1], r: 3.2, fill: '#2f3b52' }, s);
      S('text', { x: p[1][0] + p[2], y: p[1][1] + p[3], 'font-size': 11.5, 'font-weight': 700, fill: '#2f3b52', text: p[0] }, s);
    });
    var de = Math.hypot(E[0] - D[0], E[1] - D[1]), bc = Math.hypot(C[0] - B[0], C[1] - B[1]);
    M.$('#md-de').textContent = M.fmt(de, 1);
    M.$('#md-bc').textContent = M.fmt(bc, 1);
    M.$('#md-ratio').textContent = M.fmt(de / bc, 3);
    M.$('#md-text').innerHTML = '不管顶点 A 怎么动，<b>DE 永远等于 BC 的一半</b>，而且永远和 BC <b>平行</b>。' +
      '这就是<b>三角形中位线定理</b>：连接三角形两边中点的线段，平行于第三边且等于第三边的一半。' +
      '证明它正好要用到平行四边形的判定。';
    M.setState({ r: ratio, a: ang, m: midT });
  }

  document.addEventListener('DOMContentLoaded', function () {
    M.bindRange(M.$('#sh-ratio'), function (v) { ratio = v; showShape(); });
    M.bindRange(M.$('#sh-ang'), function (v) { ang = v; showShape(); });
    M.$$('#sh-presets button').forEach(function (b) {
      b.addEventListener('click', function () {
        ratio = +b.dataset.r; ang = +b.dataset.a;
        M.$('#sh-ratio').value = ratio; M.$('#sh-ang').value = ang;
        M.paintRange(M.$('#sh-ratio')); M.paintRange(M.$('#sh-ang'));
        showShape();
      });
    });
    showShape();
    M.chips(M.$('#jd-chips'), JUDGE.map(function (j, i) { return { label: '第 ' + (i + 1) + ' 组', value: String(i) }; }), '0', function (v) { judgeIdx = +v; showJudge(); });
    showJudge();
    M.bindRange(M.$('#md-range'), function (v) { midT = v; showMid(); })();

    M.quiz([
      {
        title: '把四边形变成菱形（但不是正方形）',
        desc: '菱形要求四条边相等，但角不是 90°。',
        label: '在四边形模型里调滑块',
        button: '检查现在的形状',
        check: function () {
          var isRhom = Math.abs(ratio - 1) < 0.03, isRect = Math.abs(ang - 90) < 0.6;
          if (!isRhom) return { ok: false, msg: '现在邻边比是 ' + M.fmt(ratio, 2) + '，要调到 1（四边相等）。' };
          if (isRect) return { ok: false, msg: '四边相等了，但角是 90°，这成了正方形。把角调离 90°。' };
          return { ok: true, msg: '这是<b>菱形</b>：四边相等，对角线互相垂直并且平分一组对角，但对角线<b>不相等</b>。' };
        }
      },
      {
        title: '「一组对边平行，另一组对边相等」能判定平行四边形吗？',
        desc: '可以在上面点开第 4 组看反例。',
        options: ['不能，等腰梯形也满足', '能，这是基本判定', '能，但要加条件', '只有锐角时能'],
        answer: 0,
        hint: '想想等腰梯形的两腰。',
        explain: '<b>等腰梯形</b>正好满足「一组对边平行、另一组对边相等」，但它不是平行四边形。正确的判定是「<b>一组对边平行<u>且</u>相等</b>」——必须是同一组。'
      },
      {
        title: '三角形两边中点连线长 5，第三边多长？',
        desc: '可以拖上面的顶点验证这个比例。',
        options: ['10', '5', '2.5', '无法确定'],
        answer: 0,
        hint: '中位线等于第三边的一半。',
        explain: '中位线 = 第三边 ÷ 2，所以第三边 = 5 × 2 = <b>10</b>。另外中位线还<b>平行于</b>第三边，这一点常被忽略。'
      }
    ]);
  });
})();
