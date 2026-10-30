/* 第 13 课 · 勾股定理（北师大版八上第一章） */
(function () {
  'use strict';
  var M = window.Mx, st = M.getState();

  /* ---------- 模型一：三个正方形的面积 ---------- */
  var a = M.num(st.a, 3, 1, 8), b = M.num(st.b, 4, 1, 8);

  function showSq() {
    var s = M.$('#sq-fig');
    s.innerHTML = '';
    var S = M.svg;
    var c = Math.sqrt(a * a + b * b);
    /* 让三个正方形都放得下：按最大边定缩放 */
    var k = 150 / (a + b + c);
    var A = a * k, B = b * k;
    /* 直角顶点放在 (ox, oy)，两直角边分别向左和向下 */
    var ox = 118 + B / 2, oy = 128;
    var P = { C: [ox, oy], A: [ox - B, oy], B: [ox, oy - A] };
    /* 斜边正方形：由 A、B 两点向外翻 */
    var dx = P.B[0] - P.A[0], dy = P.B[1] - P.A[1];
    var sqC = [P.A, P.B, [P.B[0] + dy, P.B[1] - dx], [P.A[0] + dy, P.A[1] - dx]];
    S('polygon', { points: sqC.map(function (p) { return M.fmt(p[0], 1) + ',' + M.fmt(p[1], 1); }).join(' '), fill: '#f0d4cb', stroke: '#c2603f', 'stroke-width': 1.6 }, s);
    /* a 边（竖直）的正方形往左、b 边（水平）的正方形往下 */
    S('rect', { x: ox - B - A, y: oy - A, width: A, height: A, fill: '#cfdaee', stroke: '#5d7cb0', 'stroke-width': 1.6 }, s);
    S('rect', { x: ox - B, y: oy, width: B, height: B, fill: '#dfe8d8', stroke: '#5f8a5a', 'stroke-width': 1.6 }, s);
    S('polygon', { points: [P.A, P.B, P.C].map(function (p) { return M.fmt(p[0], 1) + ',' + M.fmt(p[1], 1); }).join(' '), fill: '#fff', stroke: '#2f3b52', 'stroke-width': 2 }, s);
    /* 直角标记 */
    S('path', { d: 'M' + (ox - 10) + ' ' + oy + 'v-10h10', fill: 'none', stroke: '#2f3b52', 'stroke-width': 1.3 }, s);
    S('text', { x: ox - B - A / 2, y: oy - A / 2 + 4, 'text-anchor': 'middle', 'font-size': 11, fill: '#2f4473', text: 'a²=' + (a * a) }, s);
    S('text', { x: ox - B / 2, y: oy + B / 2 + 4, 'text-anchor': 'middle', 'font-size': 11, fill: '#3d6b38', text: 'b²=' + (b * b) }, s);
    var cc = [(sqC[0][0] + sqC[2][0]) / 2, (sqC[0][1] + sqC[2][1]) / 2];
    S('text', { x: cc[0], y: cc[1] + 4, 'text-anchor': 'middle', 'font-size': 11, fill: '#a4492b', text: 'c²=' + M.fmt(a * a + b * b) }, s);

    M.$('#sq-a').textContent = a;
    M.$('#sq-b').textContent = b;
    M.$('#sq-c').textContent = M.fmt(c, 3);
    M.$('#sq-eq').innerHTML = 'a' + M.sup(2) + ' + b' + M.sup(2) + ' = ' + (a * a) + ' + ' + (b * b) + ' = <b>' + (a * a + b * b) + '</b> = c' + M.sup(2);
    var exact = Math.abs(c - Math.round(c)) < 1e-9;
    M.$('#sq-text').innerHTML = '两个小正方形的面积加起来，正好等于大正方形的面积，这就是<b>勾股定理</b>：直角三角形两直角边的平方和等于斜边的平方。' +
      (exact ? '现在 ' + a + '、' + b + '、' + c + ' 都是整数，这样的三个数叫<b>勾股数</b>（常见的有 3-4-5、6-8-10、5-12-13）。'
             : '现在斜边 c = ' + M.sqrt(a * a + b * b) + ' ≈ ' + M.fmt(c, 3) + '，不是整数——这很正常，大多数情况下斜边都是无理数。');
    M.setState({ a: a, b: b, x: lad });
  }

  /* ---------- 模型二：逆定理，判断是不是直角三角形 ---------- */
  var TESTS = [
    [3, 4, 5], [6, 8, 10], [5, 12, 13], [2, 3, 4], [7, 24, 25], [4, 5, 6], [8, 15, 17], [5, 5, 7]
  ];

  function showTest() {
    var tb = M.$('#iv-table tbody');
    tb.innerHTML = '';
    TESTS.forEach(function (t) {
      var s2 = t.slice().sort(function (p, q) { return p - q; });
      var left = s2[0] * s2[0] + s2[1] * s2[1], right = s2[2] * s2[2];
      var isRight = left === right;
      var tr = M.html('tr', {}, tb);
      M.html('td', { class: 'n', text: t.join('、') }, tr);
      M.html('td', { class: 'n', text: s2[0] + '²+' + s2[1] + '²=' + left }, tr);
      M.html('td', { class: 'n', text: s2[2] + '²=' + right }, tr);
      M.html('td', { html: isRight ? '<b style="color:#2f6a4a">直角</b>' : (left > right ? '锐角' : '钝角') }, tr);
    });
    M.$('#iv-text').innerHTML = '把三边从小到大排好，比较 <b>a² + b²</b> 和 <b>c²</b>：相等就是直角三角形（这叫勾股定理的<b>逆定理</b>）；' +
      'a² + b² 大于 c² 是锐角三角形，小于则是钝角三角形。注意要先找出<b>最长边</b>当 c。';
  }

  /* ---------- 模型三：梯子滑动 ---------- */
  var lad = M.num(st.x, 1.5, 0.5, 4.8);
  var LAD = 5;   /* 梯子长 5 米 */

  function showLadder() {
    var s = M.$('#ld-fig');
    s.innerHTML = '';
    var S = M.svg, k = 30, ox = 46, oy = 176;
    var h = Math.sqrt(LAD * LAD - lad * lad);
    S('line', { x1: ox, y1: oy, x2: ox, y2: oy - 5.4 * k, stroke: '#8795b5', 'stroke-width': 5 }, s);
    S('line', { x1: ox, y1: oy, x2: ox + 5.4 * k, y2: oy, stroke: '#8795b5', 'stroke-width': 5 }, s);
    S('line', { x1: ox + lad * k, y1: oy, x2: ox, y2: oy - h * k, stroke: '#c2603f', 'stroke-width': 4, 'stroke-linecap': 'round' }, s);
    S('path', { d: 'M' + (ox + 11) + ' ' + oy + 'v-11h-11', fill: 'none', stroke: '#5d7cb0', 'stroke-width': 1.3 }, s);
    S('text', { x: ox + lad * k / 2, y: oy + 15, 'text-anchor': 'middle', 'font-size': 10.5, fill: '#4a5568', text: '底端离墙 ' + M.fmt(lad, 2) + ' m' }, s);
    S('text', { x: ox - 6, y: oy - h * k / 2, 'text-anchor': 'end', 'font-size': 10.5, fill: '#4a5568', text: M.fmt(h, 2) + ' m' }, s);
    S('text', { x: ox + lad * k / 2 + 18, y: oy - h * k / 2 - 6, 'font-size': 10.5, fill: '#a4492b', text: '梯长 5 m' }, s);
    M.$('#ld-h').textContent = M.fmt(h, 2) + ' m';
    M.$('#ld-eq').innerHTML = M.fmt(lad, 2) + M.sup(2) + ' + h' + M.sup(2) + ' = 5' + M.sup(2) + '　→　h = ' + M.sqrt('25 − ' + M.fmt(lad * lad, 2)) + ' = <b>' + M.fmt(h, 2) + '</b>';
    M.$('#ld-text').innerHTML = '梯子、墙和地面围成一个直角三角形，<b>梯长是斜边</b>（永远最长）。' +
      '底端每往外挪一点，顶端下滑的距离<b>并不相同</b>：底端从 0.5 挪到 1.5 米，顶端只降了 ' +
      M.fmt(Math.sqrt(25 - 0.25) - Math.sqrt(25 - 2.25), 2) + ' 米；但从 3.5 挪到 4.5 米，顶端要降 ' +
      M.fmt(Math.sqrt(25 - 12.25) - Math.sqrt(25 - 20.25), 2) + ' 米。这就是为什么梯子越斜越危险。';
    M.setState({ a: a, b: b, x: lad });
  }

  document.addEventListener('DOMContentLoaded', function () {
    M.bindRange(M.$('#sq-ra'), function (v) { a = v; showSq(); })();
    M.bindRange(M.$('#sq-rb'), function (v) { b = v; showSq(); })();
    showTest();
    M.bindRange(M.$('#ld-range'), function (v) { lad = v; showLadder(); })();

    M.quiz([
      {
        title: '调出一组勾股数：5、12、13',
        desc: '把两条直角边调成 5 和 12，看斜边是不是整数。',
        label: '在面积图里调滑块',
        button: '检查两条直角边',
        check: function () {
          var okk = (a === 5 && b === 12) || (a === 12 && b === 5);
          if (!okk) return { ok: false, msg: '现在是 ' + a + ' 和 ' + b + '，调成 5 和 12（顺序随意）。' };
          return { ok: true, msg: '25 + 144 = 169 = 13²，斜边正好 13。5-12-13 是常见的勾股数，和 3-4-5、8-15-17 一样值得记住。' };
        }
      },
      {
        title: '三角形三边是 8、15、17，它是什么三角形？',
        desc: '用逆定理算一算，先找最长边。',
        options: ['直角三角形', '锐角三角形', '钝角三角形', '不能确定'],
        answer: 0,
        hint: '比较 8² + 15² 和 17²。',
        explain: '64 + 225 = 289 = 17²，满足逆定理，是<b>直角三角形</b>，而且 17 所对的角是直角。'
      },
      {
        title: '直角三角形两边是 3 和 4，第三边一定是 5 吗？',
        desc: '想想 4 有没有可能是斜边。',
        options: ['不一定，也可能是 √7', '一定是 5', '一定是 7', '无法计算'],
        answer: 0,
        hint: '题目没说 3 和 4 都是直角边。',
        explain: '若 3、4 都是直角边，斜边是 5；但若 4 是<b>斜边</b>，另一直角边就是 √(16−9) = √7。没指明哪条是斜边时要分两种情况。'
      }
    ]);
  });
})();
