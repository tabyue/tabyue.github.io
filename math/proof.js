/* 第 19 课 · 证明与三角形的证明（北师大版八上第七章、八下第一章） */
(function () {
  'use strict';
  var M = window.Mx, st = M.getState();

  /* ---------- 模型一：眼睛会骗人，所以要证明 ---------- */
  var ILL = [
    { id: 'mul', name: '两条线段一样长吗', ask: '上下两条线段哪条长？',
      truth: '一样长', why: '这是<b>缪勒—莱尔错觉</b>。两条线段其实一样长，但箭头朝外的看起来更短。量一量就知道——这正是「眼见不一定为实」。' },
    { id: 'curve', name: '两条线平行吗', ask: '中间两条横线是平行的吗？',
      truth: '平行', why: '它们<b>确实平行</b>，但背景的斜线让人觉得它们向中间弯。几何里必须靠推理，不能靠「看上去」。' },
    { id: 'circle', name: '哪个圆更大', ask: '中间两个圆哪个大？',
      truth: '一样大', why: '两个中心圆<b>一样大</b>，被大圆围着的那个显得小。这叫艾宾浩斯错觉。' }
  ];
  var illIdx = 0, illAnswered = false;

  function drawIll() {
    var it = ILL[illIdx];
    var s = M.$('#il-fig');
    s.innerHTML = '';
    var S = M.svg;
    if (it.id === 'mul') {
      [50, 110].forEach(function (y, i) {
        var x1 = 70, x2 = 230;
        S('line', { x1: x1, y1: y, x2: x2, y2: y, stroke: '#3a5a93', 'stroke-width': 2.6 }, s);
        var d = i === 0 ? 1 : -1;
        [[x1, 1], [x2, -1]].forEach(function (e) {
          S('path', { d: 'M' + e[0] + ' ' + y + 'l' + (e[1] * d * 16) + ' -11M' + e[0] + ' ' + y + 'l' + (e[1] * d * 16) + ' 11', fill: 'none', stroke: '#3a5a93', 'stroke-width': 2.2 }, s);
        });
      });
      if (illAnswered) {
        S('line', { x1: 70, y1: 28, x2: 230, y2: 28, stroke: '#c2603f', 'stroke-width': 1.4, 'stroke-dasharray': '4 3' }, s);
        S('line', { x1: 70, y1: 132, x2: 230, y2: 132, stroke: '#c2603f', 'stroke-width': 1.4, 'stroke-dasharray': '4 3' }, s);
        S('text', { x: 150, y: 22, 'text-anchor': 'middle', 'font-size': 10, fill: '#a4492b', text: '量一量：两条都是 160' }, s);
      }
    } else if (it.id === 'curve') {
      for (var i = 0; i < 26; i++) {
        var a = i * Math.PI / 13;
        S('line', { x1: 150, y1: 80, x2: 150 + 200 * Math.cos(a), y2: 80 + 200 * Math.sin(a), stroke: '#e2e6ee', 'stroke-width': 1.2 }, s);
        S('line', { x1: 150, y1: 80, x2: 150 - 200 * Math.cos(a), y2: 80 - 200 * Math.sin(a), stroke: '#e2e6ee', 'stroke-width': 1.2 }, s);
      }
      S('line', { x1: 40, y1: 56, x2: 260, y2: 56, stroke: '#2f5aa8', 'stroke-width': 3 }, s);
      S('line', { x1: 40, y1: 104, x2: 260, y2: 104, stroke: '#2f5aa8', 'stroke-width': 3 }, s);
      if (illAnswered) {
        [56, 104].forEach(function (y) {
          S('line', { x1: 40, y1: y, x2: 260, y2: y, stroke: '#c2603f', 'stroke-width': 1.2, 'stroke-dasharray': '5 4' }, s);
        });
        S('text', { x: 150, y: 136, 'text-anchor': 'middle', 'font-size': 10, fill: '#a4492b', text: '两条都是水平的，间距处处相等' }, s);
      }
    } else {
      [[85, 6, [26, 0]], [215, 6, [13, 1]]].forEach(function (g) {
        var cx = g[0], n = g[2][0] ? 6 : 8;
        var R = g[2][1] ? 14 : 30;
        for (var j = 0; j < n; j++) {
          var t = j * 2 * Math.PI / n;
          S('circle', { cx: cx + (R + 22) * Math.cos(t), cy: 80 + (R + 22) * Math.sin(t), r: R * 0.62, fill: '#dde3ee', stroke: '#b9c2d4' }, s);
        }
        S('circle', { cx: cx, cy: 80, r: 18, fill: '#9fb4d8', stroke: '#5d7cb0', 'stroke-width': 1.6 }, s);
      });
      if (illAnswered) {
        S('text', { x: 150, y: 150, 'text-anchor': 'middle', 'font-size': 10, fill: '#a4492b', text: '两个蓝圆半径都是 18，完全一样' }, s);
      }
    }
    M.$('#il-ask').textContent = it.ask;
    M.$('#il-truth').textContent = illAnswered ? it.truth : '先猜一猜';
    M.$('#il-why').innerHTML = illAnswered ? it.why : '点下面的按钮揭晓答案。';
  }

  /* ---------- 模型二：三角形内角和定理的证明 ---------- */
  var pstep = 0;
  var PSTEPS = [
    ['看到的', '三角形的三个内角加起来好像是 180°，量几个都是这样。', '但量一百个也不叫证明——总有量不到的三角形。'],
    ['作辅助线', '过顶点 A 作一条<b>平行于 BC</b> 的直线。', '辅助线是证明的关键一步：它把要证的角搬到一起。'],
    ['找相等的角', '∠1 = ∠B（<b>内错角</b>相等），∠2 = ∠C（内错角相等）。', '依据是上一课的「两直线平行，内错角相等」。'],
    ['拼成平角', '∠1 + ∠A + ∠2 = 180°（<b>平角</b>）。', '顶点 A 处的三个角正好拼成一条直线。'],
    ['得出结论', '所以 ∠B + ∠A + ∠C = 180°。', '等量代换：把 ∠1、∠2 换成 ∠B、∠C，定理就证完了。这对<b>任意</b>三角形都成立。']
  ];

  function showProof() {
    var s = M.$('#pf-fig');
    s.innerHTML = '';
    var S = M.svg;
    var A = [150, 40], B = [50, 140], C = [250, 140];
    if (pstep >= 1) {
      S('line', { x1: 24, y1: 40, x2: 276, y2: 40, stroke: '#c2603f', 'stroke-width': 2, 'stroke-dasharray': '6 4' }, s);
      S('text', { x: 272, y: 32, 'text-anchor': 'end', 'font-size': 10, fill: '#a4492b', text: '过 A 作 BC 的平行线' }, s);
    }
    S('polygon', { points: [A, B, C].map(function (p) { return p[0] + ',' + p[1]; }).join(' '), fill: '#eaeff8', stroke: '#3a5a93', 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, s);
    [['A', A, 0, -10], ['B', B, -12, 6], ['C', C, 10, 6]].forEach(function (p) {
      S('text', { x: p[1][0] + p[2], y: p[1][1] + p[3], 'font-size': 12, 'font-weight': 700, fill: '#2f3b52', text: p[0] }, s);
    });
    function arc(p, a0, a1, r, col, label, lx, ly) {
      var x0 = p[0] + r * Math.cos(a0), y0 = p[1] + r * Math.sin(a0);
      var x1 = p[0] + r * Math.cos(a1), y1 = p[1] + r * Math.sin(a1);
      S('path', { d: 'M' + M.fmt(x0, 1) + ' ' + M.fmt(y0, 1) + 'A' + r + ' ' + r + ' 0 0 1 ' + M.fmt(x1, 1) + ' ' + M.fmt(y1, 1), fill: 'none', stroke: col, 'stroke-width': 2 }, s);
      if (label) S('text', { x: p[0] + lx, y: p[1] + ly, 'font-size': 10.5, 'font-weight': 700, fill: col, text: label }, s);
    }
    /* ∠B、∠C 与 A 处的 ∠1、∠2 用同色标出 */
    var cB = '#3f7d6a', cC = '#8d86c0';
    arc(B, -Math.PI / 4, 0, 24, cB, '∠B', 26, -6);
    arc(C, Math.PI, Math.PI * 1.25, 24, cC, '∠C', -42, -6);
    arc(A, Math.PI * 0.75, Math.PI, 26, pstep >= 2 ? cB : '#8795b5', pstep >= 1 ? '∠1' : '', -42, 4);
    arc(A, 0, Math.PI * 0.25, 26, pstep >= 2 ? cC : '#8795b5', pstep >= 1 ? '∠2' : '', 30, 4);
    arc(A, Math.PI * 0.25, Math.PI * 0.75, 34, '#c2603f', '∠A', -8, 48);
    if (pstep >= 3) {
      S('text', { x: 150, y: 20, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: '#a4492b', text: '∠1 + ∠A + ∠2 = 180°（平角）' }, s);
    }
    var bar = M.$('#pf-steps');
    bar.innerHTML = '';
    PSTEPS.forEach(function (p, i) {
      var sp = M.html('span', { text: p[0], role: 'button', tabindex: '0', class: i === pstep ? 'on' : (i < pstep ? 'done' : '') }, bar);
      sp.addEventListener('click', function () { pstep = i; showProof(); });
      sp.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pstep = i; showProof(); } });
      if (i < PSTEPS.length - 1) M.html('i', { text: '›' }, bar);
    });
    M.$('#pf-say').innerHTML = PSTEPS[pstep][1];
    M.$('#pf-why').innerHTML = PSTEPS[pstep][2];
    M.setState({ s: pstep });
  }

  /* ---------- 模型三：等腰三角形与垂直平分线 ---------- */
  var topX = M.num(st.t, 150, 60, 240);

  function showIso() {
    var s = M.$('#is-fig');
    s.innerHTML = '';
    var S = M.svg, B = [60, 150], C = [240, 150], A = [topX, 46];
    var ab = Math.hypot(A[0] - B[0], A[1] - B[1]), ac = Math.hypot(A[0] - C[0], A[1] - C[1]);
    var isIso = Math.abs(ab - ac) < 1.2;
    /* 垂直平分线 */
    S('line', { x1: 150, y1: 24, x2: 150, y2: 170, stroke: '#c2603f', 'stroke-width': 1.6, 'stroke-dasharray': '6 4' }, s);
    S('text', { x: 154, y: 34, 'font-size': 9.5, fill: '#a4492b', text: 'BC 的垂直平分线' }, s);
    S('polygon', { points: [A, B, C].map(function (p) { return M.fmt(p[0], 1) + ',' + M.fmt(p[1], 1); }).join(' '), fill: isIso ? '#e8f0e6' : '#eaeff8', stroke: isIso ? '#3f7d6a' : '#3a5a93', 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, s);
    S('line', { x1: A[0], y1: A[1], x2: 150, y2: 150, stroke: '#8795b5', 'stroke-width': 1.3, 'stroke-dasharray': '4 3' }, s);
    S('circle', { cx: 150, cy: 150, r: 3.5, fill: '#8795b5' }, s);
    S('text', { x: 150, y: 166, 'text-anchor': 'middle', 'font-size': 10, fill: '#6b7385', text: 'BC 中点 D' }, s);
    [['A', A, 0, -10], ['B', B, -12, 6], ['C', C, 10, 6]].forEach(function (p) {
      S('text', { x: p[1][0] + p[2], y: p[1][1] + p[3], 'font-size': 12, 'font-weight': 700, fill: '#2f3b52', text: p[0] }, s);
    });
    M.$('#is-ab').textContent = M.fmt(ab / 18, 2);
    M.$('#is-ac').textContent = M.fmt(ac / 18, 2);
    M.$('#is-kind').textContent = isIso ? '等腰三角形' : '一般三角形';
    M.$('#is-text').innerHTML = isIso
      ? 'AB = AC，这是<b>等腰三角形</b>。此时 A 正好落在 BC 的垂直平分线上，而且 AD 同时是<b>底边上的中线、高线，也是顶角平分线</b>——这就是「<b>三线合一</b>」。'
      : 'AB ≠ AC，不是等腰三角形。<b>把顶点 A 拖到正中间</b>（垂直平分线上），两腰就相等了。' +
        '这说明：<b>到线段两端距离相等的点，都在这条线段的垂直平分线上</b>。';
    M.setState({ t: topX, s: pstep });
  }

  document.addEventListener('DOMContentLoaded', function () {
    M.chips(M.$('#il-chips'), ILL.map(function (x, i) { return { label: x.name, value: String(i) }; }), '0', function (v) { illIdx = +v; illAnswered = false; drawIll(); });
    M.$('#il-show').addEventListener('click', function () { illAnswered = true; drawIll(); });
    drawIll();
    showProof();
    M.bindRange(M.$('#is-range'), function (v) { topX = v; showIso(); })();

    M.quiz([
      {
        title: '把顶点拖到让三角形变成等腰',
        desc: '拖动滑块，让 AB = AC。',
        label: '在等腰三角形模型里拖滑块',
        button: '检查两腰',
        check: function () {
          var B = [60, 150], C = [240, 150], A = [topX, 46];
          var ab = Math.hypot(A[0] - B[0], A[1] - B[1]), ac = Math.hypot(A[0] - C[0], A[1] - C[1]);
          if (Math.abs(ab - ac) > 1.2) return { ok: false, msg: '现在 AB ≈ ' + M.fmt(ab / 18, 2) + '、AC ≈ ' + M.fmt(ac / 18, 2) + '，还不相等。把 A 拖到正中间。' };
          return { ok: true, msg: 'A 落在 BC 的垂直平分线上，所以 AB = AC。此时顶点到底边的连线<b>三线合一</b>：既是中线、又是高、还是角平分线。' };
        }
      },
      {
        title: '为什么量一百个三角形不算证明？',
        desc: '想想「证明」和「验证」的区别。',
        options: ['量再多也有没量到的三角形，证明要对所有情况成立', '因为量尺不够准', '因为一百个太少，要量一千个', '量了就算证明，老师只是要求写过程'],
        answer: 0,
        hint: '数学命题要对无穷多种情况都成立。',
        explain: '三角形有<b>无穷多个</b>，测量只能验证有限个，而且总有误差。证明是用已知的公理和定理<b>推理</b>出结论，对所有情况都成立。'
      },
      {
        title: '证明内角和时，那条辅助线起了什么作用？',
        desc: '看上面证明的第 ② ③ 步。',
        options: ['利用平行线把 ∠B、∠C 搬到顶点处拼成平角', '让三角形变成等腰的', '把三角形分成两个直角三角形', '测量更方便'],
        answer: 0,
        hint: '平行线带来了什么角的关系？',
        explain: '过 A 作 BC 的平行线后，∠1 = ∠B、∠2 = ∠C（内错角相等），于是三个内角被搬到一起拼成<b>平角</b> 180°。辅助线的作用就是<b>把分散的条件集中起来</b>。'
      }
    ]);
  });
})();
