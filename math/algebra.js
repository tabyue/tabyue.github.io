/* 第 3 课 · 代数式与整式加减（北师大版七上第三章） */
(function () {
  'use strict';
  var M = window.Mx, st = M.getState();

  /* ---------- 模型一：代数式求值 ---------- */
  var x = M.num(st.x, 3, -5, 5);
  var EXPRS = [
    { s: '2<var>x</var> + 3', f: function (t) { return 2 * t + 3; }, step: function (t) { return '2 × (' + M.fmt(t) + ') + 3'; } },
    { s: '<var>x</var>' + M.sup(2), f: function (t) { return t * t; }, step: function (t) { return '(' + M.fmt(t) + ')' + M.sup(2); } },
    { s: '−<var>x</var>' + M.sup(2), f: function (t) { return -(t * t); }, step: function (t) { return '−(' + M.fmt(t) + ')' + M.sup(2); } },
    { s: '(−<var>x</var>)' + M.sup(2), f: function (t) { return t * t; }, step: function (t) { return '(−(' + M.fmt(t) + '))' + M.sup(2); } },
    { s: '3 − 2<var>x</var>', f: function (t) { return 3 - 2 * t; }, step: function (t) { return '3 − 2 × (' + M.fmt(t) + ')'; } }
  ];

  function showVal() {
    var tb = M.$('#ev-table tbody');
    tb.innerHTML = '';
    EXPRS.forEach(function (e) {
      var tr = M.html('tr', {}, tb);
      M.html('td', { html: e.s }, tr);
      M.html('td', { class: 'n', html: e.step(x) }, tr);
      M.html('td', { class: 'n', html: '<b>' + M.fmt(e.f(x)) + '</b>' }, tr);
    });
    M.$('#ev-x').textContent = M.fmt(x);
    var same = EXPRS[1].f(x) === EXPRS[2].f(x);
    M.$('#ev-tip').innerHTML = '把 <var>x</var> 换成 <b>' + M.fmt(x) + '</b> 代进去算。注意 −<var>x</var>² 和 (−<var>x</var>)² ：' +
      (same ? '当 <var>x</var> = 0 时两者都是 0，这是唯一相等的情况。' : '现在分别是 ' + M.fmt(EXPRS[2].f(x)) + ' 和 ' + M.fmt(EXPRS[3].f(x)) + '，<b>永远互为相反数</b>（x=0 除外）。') +
      '代入负数时，一定要给它加上括号。';
    M.setState({ x: x, n: nStick });
  }

  /* ---------- 模型二：合并同类项 ---------- */
  /* 同类项：所含字母相同，并且相同字母的指数也相同 */
  var TERMS = [
    { t: '3<var>a</var>', k: 'a', c: 3 },
    { t: '−2<var>a</var>', k: 'a', c: -2 },
    { t: '5<var>b</var>', k: 'b', c: 5 },
    { t: '<var>a</var>' + M.sup(2), k: 'a2', c: 1 },
    { t: '−4<var>b</var>', k: 'b', c: -4 },
    { t: '2<var>a</var>' + M.sup(2), k: 'a2', c: 2 },
    { t: '7<var>a</var>', k: 'a', c: 7 },
    { t: '−<var>a</var>' + M.sup(2), k: 'a2', c: -1 }
  ];
  var GROUPS = [['a', '<var>a</var> 项'], ['a2', '<var>a</var>' + M.sup(2) + ' 项'], ['b', '<var>b</var> 项']];
  var placed = {};

  function showMerge() {
    var box = M.$('#mg-pool');
    box.innerHTML = '';
    TERMS.forEach(function (it, i) {
      if (placed[i]) return;
      var b = M.html('button', { type: 'button', html: it.t, class: pickIdx === i ? 'on' : '' }, box);
      b.dataset.i = i;
      b.setAttribute('aria-pressed', String(pickIdx === i));
      b.addEventListener('click', function () { pickIdx = pickIdx === i ? -1 : i; showMerge(); });
    });
    if (!box.children.length) M.html('span', { class: 'note', text: '全部归好了，看看下面合并的结果。' }, box);

    GROUPS.forEach(function (g) {
      var cell = M.$('#mg-' + g[0]);
      var items = [], sum = 0, n = 0;
      TERMS.forEach(function (it, i) {
        if (placed[i] === g[0]) { items.push(it.t); if (it.k === g[0]) { sum += it.c; n++; } }
      });
      var wrong = [];
      TERMS.forEach(function (it, i) { if (placed[i] === g[0] && it.k !== g[0]) wrong.push(it.t); });
      cell.innerHTML = items.length ? items.join(' <i>+</i> ') : '<span class="note">点上面的项，再点这里</span>';
      var res = M.$('#mg-res-' + g[0]);
      if (!items.length) { res.innerHTML = ''; return; }
      if (wrong.length) {
        res.innerHTML = '<span style="color:#a4422c">这里混进了不同类的项：' + wrong.join('、') + '，不能合并。</span>';
      } else {
        var label = g[0] === 'a' ? '<var>a</var>' : (g[0] === 'b' ? '<var>b</var>' : '<var>a</var>' + M.sup(2));
        res.innerHTML = '合并后 = <b>' + (sum === 0 ? '0' : (sum === 1 ? '' : (sum === -1 ? '−' : M.fmt(sum))) + label) + '</b>' +
          (n > 1 ? '（系数相加：' + termSum(g[0]) + '）' : '');
      }
    });
    var all = Object.keys(placed).length === TERMS.length;
    var ok = all && TERMS.every(function (it, i) { return placed[i] === it.k; });
    M.$('#mg-verdict').innerHTML = !all ? '还有 ' + (TERMS.length - Object.keys(placed).length) + ' 项没归位。'
      : (ok ? '✓ 全部归类正确！原式 = ' + finalExpr() : '✗ 有项归错了，看看上面标红的提示。');
  }

  function termSum(k) {
    var parts = [];
    TERMS.forEach(function (it, i) { if (placed[i] === k && it.k === k) parts.push(it.c < 0 ? '(' + it.c + ')' : String(it.c)); });
    var s = 0;
    TERMS.forEach(function (it, i) { if (placed[i] === k && it.k === k) s += it.c; });
    return parts.join(' + ') + ' = ' + s;
  }
  function finalExpr() {
    var s = { a: 0, a2: 0, b: 0 };
    TERMS.forEach(function (it) { s[it.k] += it.c; });
    var out = [];
    if (s.a2) out.push((s.a2 === 1 ? '' : (s.a2 === -1 ? '−' : s.a2)) + '<var>a</var>' + M.sup(2));
    if (s.a) out.push((s.a > 0 && out.length ? '+ ' : '') + (s.a === 1 ? '' : (s.a === -1 ? '−' : s.a)) + '<var>a</var>');
    if (s.b) out.push((s.b > 0 && out.length ? '+ ' : '') + (s.b === 1 ? '' : (s.b === -1 ? '−' : s.b)) + '<var>b</var>');
    return '<b>' + out.join(' ') + '</b>';
  }

  var pickIdx = -1;

  /* ---------- 模型三：火柴棒规律 ---------- */
  var nStick = M.num(st.n, 4, 1, 12);

  function showStick() {
    var s = M.$('#st-fig');
    s.innerHTML = '';
    var S = M.svg, n = nStick, side = 26, x0 = 14, y0 = 34;
    var fit = Math.min(side, (300 - 28) / n);
    for (var i = 0; i < n; i++) {
      var x = x0 + i * fit;
      S('rect', { x: x, y: y0, width: fit, height: fit, fill: '#eaeff8', stroke: '#5d7cb0', 'stroke-width': 1.6 }, s);
      /* 竖边：每个正方形只新增右边一条 */
      S('line', { x1: x, y1: y0, x2: x, y2: y0 + fit, stroke: '#c2603f', 'stroke-width': 2.4 }, s);
    }
    S('line', { x1: x0 + n * fit, y1: y0, x2: x0 + n * fit, y2: y0 + fit, stroke: '#c2603f', 'stroke-width': 2.4 }, s);
    S('text', { x: 14, y: y0 + fit + 20, 'font-size': 10.5, fill: '#a4492b', text: '竖的 ' + (n + 1) + ' 根' }, s);
    S('text', { x: 14, y: y0 + fit + 34, 'font-size': 10.5, fill: '#4a6b9c', text: '横的 ' + (2 * n) + ' 根（上下各 ' + n + ' 根）' }, s);

    var total = 3 * n + 1;
    M.$('#st-count').textContent = n + ' 个 → ' + total + ' 根';
    M.$('#st-formula').innerHTML = '每多搭一个正方形，只要再加 <b>3</b> 根（上、下、右各一根）。<br>' +
      '第 1 个用 4 根，往后每个 +3，所以第 <var>n</var> 个一共 <b>3<var>n</var> + 1</b> 根。<br>' +
      '代入 <var>n</var> = ' + n + '：3 × ' + n + ' + 1 = <b>' + total + '</b> 根。';
    M.$('#st-other').innerHTML = '换个角度数也对：竖的 (<var>n</var>+1) 根 + 横的 2<var>n</var> 根 = <b>3<var>n</var> + 1</b>，' +
      '两种数法得到同一个式子，这就是「用字母表示规律」的好处。';
    M.setState({ x: x, n: nStick });
  }

  /* ---------- 装配 ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    M.bindRange(M.$('#ev-range'), function (v) { x = v; showVal(); })();

    GROUPS.forEach(function (g) {
      M.$('#mg-' + g[0]).addEventListener('click', function () {
        if (pickIdx < 0) return;
        placed[pickIdx] = g[0];
        pickIdx = -1;
        showMerge();
      });
    });
    M.$('#mg-reset').addEventListener('click', function () { placed = {}; pickIdx = -1; showMerge(); });
    showMerge();

    M.bindRange(M.$('#st-range'), function (v) { nStick = v; showStick(); })();

    M.quiz([
      {
        level: 'base',
        title: '把 x 调到 −2，看 −x² 是多少',
        desc: '拖动上面的滑块，把 <var>x</var> 调成 −2。',
        label: '在代数式求值里调滑块',
        button: '检查 x 的值',
        check: function () {
          if (x !== -2) return { ok: false, msg: '现在 <var>x</var> = ' + M.fmt(x) + '，再调到 −2。' };
          return { ok: true, msg: '此时 <var>x</var>² = 4，而 −<var>x</var>² = −4。代入负数时括号不能省：(−2)² = 4，不是 −4。' };
        }
      },
      {
        level: 'base',
        title: '合并同类项：5a + 3a − 2a',
        desc: '同类项合并，只把系数相加减。',
        options: ['6a', '6a³', '10a', '6'],
        answer: 0,
        hint: '(5 + 3 − 2) 等于几？字母部分不变。',
        explain: '(5 + 3 − 2)a = <b>6a</b>。合并同类项时<b>字母和指数一个都不改</b>，只算系数。'
      },
      {
        level: 'base',
        title: '当 x = 3 时，代数式 2x + 1 的值是？',
        desc: '把 x 换成 3 代进去算。',
        options: ['7', '6', '9', '4'],
        answer: 0,
        hint: '2 × 3 + 1。',
        explain: '2 × 3 + 1 = <b>7</b>。代数式求值就是「<b>代入 + 计算</b>」两步，代入负数时记得加括号。'
      },
      {
        level: 'mid',
        title: '下面哪一组是同类项？',
        desc: '同类项要求：字母相同，并且<b>相同字母的指数也相同</b>。',
        options: ['3<var>a</var>' + M.sup(2) + ' 与 −<var>a</var>' + M.sup(2), '2<var>a</var> 与 2<var>b</var>', '<var>a</var>' + M.sup(2) + ' 与 <var>a</var>' + M.sup(3), '3<var>xy</var> 与 3<var>x</var>'],
        answer: 0,
        hint: '只看系数相同是不够的，要看字母和指数。',
        explain: '3<var>a</var>² 与 −<var>a</var>² 的字母都是 <var>a</var>、指数都是 2，是同类项，合并得 2<var>a</var>²。系数是否相同无关紧要。'
      },
      {
        level: 'mid',
        title: '照这样搭 10 个正方形要几根火柴？',
        desc: '可以把上面的滑块拖到 10 数一数，再用公式验证。',
        options: ['31 根', '30 根', '40 根', '33 根'],
        answer: 0,
        hint: '第一个用 4 根，之后每个加 3 根。',
        explain: '3<var>n</var> + 1 = 3 × 10 + 1 = 31 根。常见错误是直接算 10 × 4 = 40，那会把公用的竖边重复数一次。'
      },
      {
        level: 'mid',
        title: '去括号：3 − 2(x − 1) 等于？',
        desc: '括号前是负号，里面每一项都要变号。',
        options: ['5 − 2x', '1 − 2x', '5 + 2x', '−2x − 1'],
        answer: 0,
        hint: '−2 乘进去：−2 × x = −2x，−2 × (−1) = +2。',
        explain: '3 − 2x + 2 = <b>5 − 2x</b>。括号前是负号（或负系数）时，<b>括号里每一项都要变号</b>，漏掉第二项是最常见的错。'
      },
      {
        level: 'mid',
        title: '照这样搭 n 个三角形需要几根火柴？（第 1 个用 3 根，以后每个加 2 根）',
        desc: '和上面火柴棒搭正方形是同一个思路。',
        options: ['2n + 1', '3n', '2n + 3', '3n − 1'],
        answer: 0,
        hint: '每次加 2，所以 n 的系数是 2；第 1 个用 3 根反推常数。',
        explain: '每次加 2 根 → 2n；第 1 个 3 根 → 2×1 + 1 = 3，所以常数是 1，答案 <b>2n + 1</b>。找规律先看「<b>每次增加多少</b>」，那就是 n 的系数。'
      },
      {
        level: 'trap',
        title: '搭 10 个正方形，为什么不是 10 × 4 = 40 根？',
        desc: '回到上面的火柴棒模型，数数中间共用的竖边。',
        options: ['相邻正方形共用一条边，被重复数了', '因为第一个正方形只用 3 根', '因为火柴长度不同', '其实 40 根是对的'],
        answer: 0,
        hint: '两个正方形挨在一起时，中间那条边属于谁？',
        explain: '相邻两个正方形<b>共用一条竖边</b>，按 10×4 算会把 9 条公共边各多数一次：40 − 9 = <b>31</b> 根，正是 3n + 1 的结果。遇到拼接类规律题，先问「哪里重复了」。'
      }
    ]);
  });
})();
