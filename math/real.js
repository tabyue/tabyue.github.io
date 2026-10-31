/* 第 14 课 · 实数与二次根式（北师大版八上第二章） */
(function () {
  'use strict';
  var M = window.Mx, st = M.getState();

  /* ---------- 模型一：在数轴上作出 √n ----------
     用直角三角形：直角边 1 和 √(n−1)，斜边就是 √n（螺旋法） */
  var nn = M.num(st.n, 2, 2, 10);

  function showRoot() {
    var s = M.$('#rt-fig');
    s.innerHTML = '';
    var S = M.svg, k = 56, oy = 150, ox = 34;
    var r = Math.sqrt(nn);
    /* 数轴 */
    S('line', { x1: 14, y1: oy, x2: 316, y2: oy, stroke: '#5b6475', 'stroke-width': 1.8 }, s);
    for (var i = 0; i <= 4; i++) {
      S('line', { x1: ox + i * k, y1: oy - 5, x2: ox + i * k, y2: oy + 5, stroke: '#8d95a6', 'stroke-width': 1.2 }, s);
      S('text', { x: ox + i * k, y: oy + 19, 'text-anchor': 'middle', 'font-size': 10.5, fill: '#6b7385', text: i }, s);
    }
    /* 直角三角形：底边 √(n−1)，高 1 */
    var base = Math.sqrt(nn - 1);
    S('polygon', {
      points: [[ox, oy], [ox + base * k, oy], [ox + base * k, oy - k]]
        .map(function (p) { return M.fmt(p[0], 1) + ',' + M.fmt(p[1], 1); }).join(' '),
      fill: '#eaeff8', stroke: '#3a5a93', 'stroke-width': 1.8
    }, s);
    S('path', { d: 'M' + (ox + base * k - 9) + ' ' + oy + 'v-9h9', fill: 'none', stroke: '#5d7cb0', 'stroke-width': 1.2 }, s);
    S('text', { x: ox + base * k / 2, y: oy - 6, 'text-anchor': 'middle', 'font-size': 10, fill: '#3a5a93', text: M.fmt(base, 2) }, s);
    S('text', { x: ox + base * k + 6, y: oy - k / 2, 'font-size': 10, fill: '#3a5a93', text: '1' }, s);
    /* 以原点为圆心、斜边为半径画弧，交数轴于 √n */
    S('path', {
      d: 'M' + (ox + base * k) + ' ' + (oy - k) + 'A' + M.fmt(r * k, 1) + ' ' + M.fmt(r * k, 1) + ' 0 0 1 ' + M.fmt(ox + r * k, 1) + ' ' + oy,
      fill: 'none', stroke: '#c2603f', 'stroke-width': 1.5, 'stroke-dasharray': '5 4'
    }, s);
    S('line', { x1: ox, y1: oy, x2: ox + base * k, y2: oy - k, stroke: '#c2603f', 'stroke-width': 2.2 }, s);
    S('circle', { cx: ox + r * k, cy: oy, r: 5, fill: '#c2603f', stroke: '#fff', 'stroke-width': 1.6 }, s);
    S('text', { x: ox + r * k, y: oy - 12, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: '#a4492b', text: '√' + nn }, s);

    M.$('#rt-n').textContent = nn;
    M.$('#rt-val').innerHTML = M.sqrt(nn) + ' ≈ ' + M.fmt(Math.sqrt(nn), 6);
    var isSq = Math.abs(Math.sqrt(nn) - Math.round(Math.sqrt(nn))) < 1e-12;
    M.$('#rt-kind').textContent = isSq ? '有理数' : '无理数';
    M.$('#rt-text').innerHTML = isSq
      ? '<b>' + nn + ' 是完全平方数</b>，所以 √' + nn + ' = ' + Math.round(Math.sqrt(nn)) + '，是整数（有理数）。'
      : '√' + nn + ' 是<b>无理数</b>——它是无限不循环小数，写不成分数。但它在数轴上有<b>确定的位置</b>：' +
        '用直角边 1 和 √' + (nn - 1) + ' 作直角三角形，斜边就是 √' + nn + '，再用圆规把它量到数轴上。' +
        '这说明<b>每个实数都对应数轴上一个点</b>。';
    M.$('#rt-between').innerHTML = '估算大小：' + (Math.floor(Math.sqrt(nn))) + '² = ' + Math.pow(Math.floor(Math.sqrt(nn)), 2) +
      ' &lt; ' + nn + ' &lt; ' + Math.pow(Math.ceil(Math.sqrt(nn)), 2) + ' = ' + Math.ceil(Math.sqrt(nn)) + '²，' +
      '所以 ' + Math.floor(Math.sqrt(nn)) + ' &lt; √' + nn + ' &lt; ' + Math.ceil(Math.sqrt(nn)) + '。';
    M.setState({ n: nn, x: xv });
  }

  /* ---------- 模型二：平方根与立方根 ---------- */
  var xv = M.num(st.x, 8, -27, 27);

  function showRootKind() {
    var tb = M.$('#kd-table tbody');
    tb.innerHTML = '';
    var rows = [
      ['平方 x²', M.fmt(xv * xv), ''],
      ['算术平方根 √x', xv < 0 ? '无意义' : M.fmt(Math.sqrt(xv), 4), xv < 0 ? '负数没有平方根' : '只取非负的那个'],
      ['平方根 ±√x', xv < 0 ? '无意义' : (xv === 0 ? '0' : '±' + M.fmt(Math.sqrt(xv), 4)), xv > 0 ? '正数有两个平方根，互为相反数' : ''],
      ['立方根 ∛x', M.fmt(Math.cbrt(xv), 4), '任何数都有唯一的立方根，符号与原数相同']
    ];
    rows.forEach(function (r) {
      var tr = M.html('tr', {}, tb);
      M.html('td', { html: r[0] }, tr);
      M.html('td', { class: 'n', html: '<b>' + r[1] + '</b>' }, tr);
      M.html('td', { html: '<span class="note" style="font-size:13px">' + r[2] + '</span>' }, tr);
    });
    M.$('#kd-x').textContent = M.fmt(xv);
    M.$('#kd-text').innerHTML = xv < 0
      ? '<b>负数没有平方根</b>（任何数的平方都不是负数），但<b>有立方根</b>：∛(' + M.fmt(xv) + ') = ' + M.fmt(Math.cbrt(xv), 4) + '。这是平方根和立方根最大的区别。'
      : xv === 0 ? '0 的平方根和立方根都是 0。'
      : '正数有<b>两个</b>平方根（±' + M.fmt(Math.sqrt(xv), 4) + '），但<b>算术平方根</b>只指正的那个。符号 √ 本身表示算术平方根，所以 √' + M.fmt(xv) + ' = ' + M.fmt(Math.sqrt(xv), 4) + '，不带 ±。';
    M.setState({ n: nn, x: xv });
  }

  /* ---------- 模型三：二次根式化简 ---------- */
  var SIMP = [
    { raw: '√12', a: 12 }, { raw: '√18', a: 18 }, { raw: '√48', a: 48 },
    { raw: '√50', a: 50 }, { raw: '√75', a: 75 }, { raw: '√8', a: 8 }
  ];

  function simplify(n) {
    /* 提出最大的完全平方因数 */
    var best = 1;
    for (var i = 2; i * i <= n; i++) if (n % (i * i) === 0) best = i;
    return { out: best, in_: n / (best * best) };
  }

  function showSimp() {
    var tb = M.$('#sp-table tbody');
    tb.innerHTML = '';
    SIMP.forEach(function (it) {
      var r = simplify(it.a);
      var tr = M.html('tr', {}, tb);
      M.html('td', { class: 'n', html: M.sqrt(it.a) }, tr);
      M.html('td', { class: 'n', html: M.sqrt(r.out * r.out + ' × ' + r.in_) }, tr);
      M.html('td', { class: 'n', html: '<b>' + (r.out === 1 ? '' : r.out) + M.sqrt(r.in_) + '</b>' }, tr);
      M.html('td', { class: 'n', text: M.fmt(Math.sqrt(it.a), 4) }, tr);
    });
    M.$('#sp-text').innerHTML = '化简的办法：把被开方数拆成「<b>最大的完全平方数</b> × 剩下的」，再把平方数开出来。' +
      '例如 √48 = √(16×3) = 4√3。<b>最简二次根式</b>要求被开方数里不再含有能开得尽的因数，分母里也不能有根号。';
  }

  document.addEventListener('DOMContentLoaded', function () {
    M.bindRange(M.$('#rt-range'), function (v) { nn = v; showRoot(); })();
    M.bindRange(M.$('#kd-range'), function (v) { xv = v; showRootKind(); })();
    showSimp();

    M.match('#nm-list', '#nm-score', [
      ['√9', 'rat', '√9 = 3，是整数，属于有理数'],
      ['√2', 'irr', '无限不循环小数，无理数'],
      ['π', 'irr', '圆周率是无理数，3.14 只是近似值'],
      ['<span class="frac"><i>22</i><i>7</i></span>', 'rat', '分数一定是有理数（它≈3.1429，不等于 π）'],
      ['0.333…（循环）', 'rat', '循环小数能写成分数 1/3，是有理数'],
      ['∛8', 'rat', '∛8 = 2，是有理数'],
      ['−√5', 'irr', '√5 是无理数，取相反数仍是无理数'],
      ['0', 'rat', '0 是整数，属于有理数']
    ], [['rat', '有理数'], ['irr', '无理数']], function (it, ok) { return it[2]; });

    M.quiz([
      {
        level: 'base',
        title: '把 n 调到 5，看 √5 在数轴上的位置',
        desc: '拖动滑块到 5，看看是怎么作出来的。',
        label: '在数轴作图里调滑块',
        button: '检查 n',
        check: function () {
          if (nn !== 5) return { ok: false, msg: '现在 n = ' + nn + '，调到 5。' };
          return { ok: true, msg: '用直角边 1 和 2 作直角三角形，斜边正好是 √5 ≈ 2.236。因为 2² = 4 &lt; 5 &lt; 9 = 3²，所以 2 &lt; √5 &lt; 3。' };
        }
      },
      {
        level: 'base',
        title: '√16 等于多少？',
        desc: '根号表示算术平方根。',
        options: ['4', '±4', '8', '256'],
        answer: 0,
        hint: '算术平方根只取正的那个。',
        explain: '√16 = <b>4</b>。注意：16 的<b>平方根</b>是 ±4，但<b>算术平方根</b>（带根号写出来的）只取正值 4。'
      },
      {
        level: 'base',
        title: '下面哪个数是无理数？',
        desc: '无理数是无限不循环小数。',
        options: ['√3', '0.5', '−7', '2/3'],
        answer: 0,
        hint: '哪个写不成分数？',
        explain: '<b>√3</b> ≈ 1.732… 无限不循环，是无理数。0.5、−7、2/3 都能写成分数，是有理数。'
      },
      {
        level: 'mid',
        title: '−8 有平方根吗？有立方根吗？',
        desc: '可以把上面的滑块拖到 −8 看看。',
        options: ['没有平方根，立方根是 −2', '平方根是 ±2√2，没有立方根', '两个都有', '两个都没有'],
        answer: 0,
        hint: '想想什么数的平方会是负数。',
        explain: '任何数的平方都 ≥ 0，所以负数<b>没有平方根</b>；但 (−2)³ = −8，所以 ∛(−8) = −2。立方根对正负数都有定义。'
      },
      {
        level: 'mid',
        title: '√48 化成最简二次根式是？',
        desc: '找出 48 里最大的完全平方因数。',
        options: ['4√3', '2√12', '16√3', '√48 已经最简'],
        answer: 0,
        hint: '48 = 16 × 3，而 16 = 4²。',
        explain: '√48 = √(16×3) = 4√3。写成 2√12 不算最简，因为 12 里还含有完全平方因数 4。'
      },
      {
        level: 'mid',
        title: '估算 √10 在哪两个整数之间？',
        desc: '找出它前后最近的完全平方数。',
        options: ['3 和 4', '2 和 3', '4 和 5', '9 和 10'],
        answer: 0,
        hint: '3² = 9，4² = 16。',
        explain: '9 &lt; 10 &lt; 16，所以 <b>3 &lt; √10 &lt; 4</b>。估算无理数就找它夹在哪两个完全平方数中间。'
      },
      {
        level: 'mid',
        title: '化简 √18',
        desc: '提出最大的完全平方因数。',
        options: ['3√2', '9√2', '2√3', '√18 已最简'],
        answer: 0,
        hint: '18 = 9 × 2。',
        explain: '√18 = √(9×2) = <b>3√2</b>。化简就是把能开得尽的因数开出来，被开方数里不能再含完全平方因数。'
      },
      {
        level: 'trap',
        title: '−4 有平方根吗？',
        desc: '想想什么数的平方会等于 −4。',
        options: ['没有，负数没有平方根', '有，是 ±2', '有，是 −2', '有，是 2'],
        answer: 0,
        hint: '任何实数的平方都是多少？',
        explain: '任何数的平方都 <b>≥ 0</b>，所以负数<b>没有平方根</b>。但负数<b>有立方根</b>：∛(−8) = −2。平方根和立方根的这个差别年年考。'
      }
    ]);
  });
})();
