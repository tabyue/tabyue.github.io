/* 第 2 课 · 有理数与数轴（北师大版七上第二章） */
(function () {
  'use strict';
  var M = window.Mx, st = M.getState();

  /* ---------- 模型一：数轴上的两个点 ---------- */
  /* a、b 以 0.5 为步长，范围 −6~6 */
  var a = M.num(st.a, -2.5, -6, 6), b = M.num(st.b, 4, -6, 6);
  var opMode = st.op || 'add';
  var OPS = {
    add: { label: 'a + b', calc: function (x, y) { return x + y; }, sym: '+' },
    sub: { label: 'a − b', calc: function (x, y) { return x - y; }, sym: '−' },
    mul: { label: 'a × b', calc: function (x, y) { return x * y; }, sym: '×' },
    div: { label: 'a ÷ b', calc: function (x, y) { return y === 0 ? NaN : x / y; }, sym: '÷' }
  };

  function snap(v) { return Math.round(v * 2) / 2; }

  /* 数轴只建一次，拖动时只重画 layer，监听器不会被销毁 */
  var nl = null, active = 'a';

  function initLine() {
    var el = M.$('#nl-fig');
    nl = M.numline(el, { min: -6, max: 6, step: 0.5, labelStep: 1, y: 54 });
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'application');
    el.setAttribute('aria-label', '数轴：拖动 a、b 两个点，或用方向键移动选中的点');
    var down = false;
    function go(e, pick) {
      var p = M.svgPoint(el, e), v = snap(M.clamp(nl.ix(p.x), -6, 6));
      if (pick) active = Math.abs(nl.ix(p.x) - a) <= Math.abs(nl.ix(p.x) - b) ? 'a' : 'b';
      if (active === 'a') a = v; else b = v;
      show();
      e.preventDefault();
    }
    el.addEventListener('pointerdown', function (e) {
      down = true;
      el.setPointerCapture && el.setPointerCapture(e.pointerId);
      go(e, true);
    });
    el.addEventListener('pointermove', function (e) { if (down) go(e, false); });
    el.addEventListener('pointerup', function () { down = false; });
    el.addEventListener('pointercancel', function () { down = false; });
    el.addEventListener('keydown', function (e) {
      var d = { ArrowLeft: -0.5, ArrowRight: 0.5 }[e.key];
      if (d === undefined) return;
      e.preventDefault();
      if (active === 'a') a = snap(M.clamp(a + d, -6, 6)); else b = snap(M.clamp(b + d, -6, 6));
      show();
    });
  }

  function drawLine() {
    var S = M.svg, L = nl.layer;
    L.innerHTML = '';
    /* 相反数用空心点标出 */
    [[-a, '#c2603f'], [-b, '#3f7d6a']].forEach(function (p) {
      S('circle', { cx: nl.X(p[0]), cy: nl.y, r: 5, fill: '#fff', stroke: p[1], 'stroke-width': 2, 'stroke-dasharray': '3 2' }, L);
    });
    /* 绝对值：从 0 到 a 的线段 */
    S('line', { x1: nl.X(0), y1: nl.y - 22, x2: nl.X(a), y2: nl.y - 22, stroke: '#c2603f', 'stroke-width': 2.4, opacity: .55 }, L);
    S('text', { x: nl.X(a / 2), y: nl.y - 27, 'text-anchor': 'middle', 'font-size': 10.5, fill: '#a4492b', text: '|a|=' + M.fmt(Math.abs(a)) }, L);
    function dot(val, color, name, dy) {
      S('circle', { cx: nl.X(val), cy: nl.y, r: 6.5, fill: color, stroke: active === name ? '#2f3b52' : '#fff', 'stroke-width': active === name ? 2.6 : 2 }, L);
      S('text', { x: nl.X(val), y: nl.y + dy, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: color, text: name + '=' + M.fmt(val) }, L);
    }
    dot(a, '#c2603f', 'a', 26);
    dot(b, '#3f7d6a', 'b', 42);
  }

  function show() {
    drawLine();
    var op = OPS[opMode], r = op.calc(a, b);
    M.$('#r-a').innerHTML = M.fmt(a);
    M.$('#r-opp').innerHTML = M.fmt(-a);
    M.$('#r-abs').innerHTML = M.fmt(Math.abs(a));
    M.$('#r-rec').innerHTML = a === 0 ? '不存在' : M.frac(a < 0 ? -2 : 2, Math.abs(a) * 2);
    M.$('#r-cmp').innerHTML = a < b ? 'a &lt; b' : (a > b ? 'a &gt; b' : 'a = b');
    M.$('#r-res').innerHTML = isFinite(r) ? M.fmt(r) : '不能除';
    M.$('#r-expr').innerHTML = '(' + M.fmt(a) + ') ' + op.sym + ' (' + M.fmt(b) + ') = <b>' + (isFinite(r) ? M.fmt(r) : '无意义') + '</b>';

    var tip = '';
    if (opMode === 'add') {
      tip = a * b < 0
        ? '异号两数相加：取<b>绝对值大的那个数的符号</b>，再用大绝对值减小绝对值。|' + M.fmt(a) + '|=' + M.fmt(Math.abs(a)) + '，|' + M.fmt(b) + '|=' + M.fmt(Math.abs(b)) + '。'
        : '同号两数相加：符号不变，绝对值相加。';
    } else if (opMode === 'sub') {
      tip = '减去一个数，等于<b>加上它的相反数</b>：' + M.fmt(a) + ' − (' + M.fmt(b) + ') = ' + M.fmt(a) + ' + (' + M.fmt(-b) + ')。';
    } else if (opMode === 'mul') {
      tip = (a === 0 || b === 0) ? '有一个因数是 0，积就是 0。'
        : (a * b > 0 ? '同号得<b>正</b>，再把绝对值相乘。' : '异号得<b>负</b>，再把绝对值相乘。');
    } else {
      tip = b === 0 ? '<b>0 不能作除数</b>，这个式子没有意义。'
        : '除以一个数等于乘它的倒数；符号规律和乘法一样：同号得正、异号得负。';
    }
    M.$('#r-tip').innerHTML = tip;
    M.setState({ a: a, b: b, op: opMode, n: nIdx, e: eIdx });
  }

  /* ---------- 模型二：乘方里的符号陷阱 ---------- */
  var nIdx = M.num(st.n, -3, -5, 5), eIdx = M.num(st.e, 2, 2, 5);

  function showPow() {
    var n = nIdx, k = eIdx;
    /* (−3)² 与 −3² 完全不同：前者底数是 −3，后者底数是 3，负号在最后 */
    var withParen = Math.pow(n, k);
    var noParen = n < 0 ? -Math.pow(Math.abs(n), k) : Math.pow(n, k);
    M.$('#p-paren').innerHTML = '(' + M.fmt(n) + ')' + M.sup(k) + ' = <b>' + M.fmt(withParen) + '</b>';
    M.$('#p-noparen').innerHTML = (n < 0 ? '−' + M.fmt(Math.abs(n)) : M.fmt(n)) + M.sup(k) + ' = <b>' + M.fmt(noParen) + '</b>';
    M.$('#p-expand').innerHTML = '(' + M.fmt(n) + ')' + M.sup(k) + ' 是 ' + k + ' 个 (' + M.fmt(n) + ') 相乘：' +
      new Array(k + 1).join('(' + M.fmt(n) + ')×').slice(0, -1) + ' = ' + M.fmt(withParen);
    var same = withParen === noParen;
    M.$('#p-verdict').innerHTML = same
      ? '这时两个结果<b>相同</b>（底数是正数，或指数是偶数时负号刚好抵消）。'
      : '两个结果<b>不一样</b>！括号把负号也括进了底数，没有括号时负号留在最外面。';
    M.$('#p-rule').innerHTML = n < 0
      ? '负数的 <b>' + (k % 2 === 0 ? '偶' : '奇') + '</b> 次方是 <b>' + (k % 2 === 0 ? '正' : '负') + '</b> 数。'
      : '正数的任何次方都是正数。';
    M.setState({ a: a, b: b, op: opMode, n: nIdx, e: eIdx });
  }

  /* ---------- 模型三：科学记数法 ---------- */
  var SCI = [
    { label: '深圳常住人口', v: 17798000, unit: '人' },
    { label: '深圳面积', v: 1997470000, unit: '平方米' },
    { label: '地球到太阳', v: 149600000000, unit: '米' },
    { label: '一张纸的厚度', v: 0.0001, unit: '米' },
    { label: '新冠病毒直径', v: 0.00000012, unit: '米' }
  ];
  var sciIdx = 0;

  function showSci() {
    var it = SCI[sciIdx], v = it.v;
    /* a × 10^n，其中 1 ≤ |a| < 10 */
    var n = Math.floor(Math.log10(Math.abs(v)));
    var aa = v / Math.pow(10, n);
    M.$('#s-raw').textContent = (v < 1 ? v.toFixed(Math.max(0, -n + 2)) : v.toLocaleString('en-US')) + ' ' + it.unit;
    M.$('#s-sci').innerHTML = M.fmt(aa, 3) + ' × 10' + M.sup(n) + ' ' + it.unit;
    M.$('#s-n').textContent = n;
    M.$('#s-tip').innerHTML = n > 0
      ? '原数的整数位是 ' + (n + 1) + ' 位，所以 <b>n = 位数 − 1 = ' + n + '</b>。'
      : '小数点后第 ' + (-n) + ' 位上才出现第一个非零数字，所以 <b>n = −' + (-n) + '</b>。表示较小的数时 n 是负数。';
  }

  /* ---------- 装配 ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    M.chips(M.$('#op-chips'), Object.keys(OPS).map(function (k) { return { label: OPS[k].label, value: k }; }), opMode, function (v) { opMode = v; show(); });
    M.chips(M.$('#pt-chips'), [{ label: '选中 a', value: 'a' }, { label: '选中 b', value: 'b' }], active, function (v) { active = v; show(); });
    initLine();
    show();

    M.bindRange(M.$('#p-base'), function (v) { nIdx = v; showPow(); })();
    M.bindRange(M.$('#p-exp'), function (v) { eIdx = v; showPow(); })();

    M.chips(M.$('#s-chips'), SCI.map(function (s, i) { return { label: s.label, value: String(i) }; }), '0', function (v) { sciIdx = +v; showSci(); });
    showSci();

    M.match('#neg-list', '#neg-score', [
      ['(−2)³', 'neg', '底数是 −2，奇次方得负：−8'],
      ['(−2)⁴', 'pos', '底数是 −2，偶次方得正：16'],
      ['−2⁴', 'neg', '底数是 2，先算 2⁴=16，再加负号：−16'],
      ['(−1)⁹⁹', 'neg', '−1 的奇次方总是 −1'],
      ['−(−3)²', 'neg', '先算 (−3)²=9，外面还有负号：−9'],
      ['(−0.5)²', 'pos', '负数的偶次方得正：0.25']
    ], [['pos', '结果是正数'], ['neg', '结果是负数']], function (it, ok) {
      return it[2];
    });

    M.quiz([
      {
        title: '把 a 拖到 −3，b 拖到 1.5',
        desc: '拖动数轴上的两个点（也可以点中后用左右方向键微调），让 <var>a</var> = −3、<var>b</var> = 1.5。',
        label: '在数轴上拖动',
        button: '检查两个点',
        check: function () {
          if (a === -3 && b === 1.5) {
            return { ok: true, msg: '此时 a + b = −1.5、a − b = −4.5、a × b = −4.5。注意 a + b 和 a × b 恰好相等只是巧合。' };
          }
          return { ok: false, msg: '现在 a = ' + M.fmt(a) + '、b = ' + M.fmt(b) + '，再调一调（每格 0.5）。' };
        }
      },
      {
        title: '−3² 等于多少？',
        desc: '可以在上面把底数调到 −3、指数调到 2 对照着看。',
        options: ['−9', '9', '−6', '6'],
        answer: 0,
        hint: '没有括号时，乘方只管住 3，负号留在最外面。',
        explain: '−3² 表示 −(3²) = −9。而 (−3)² = 9，括号把负号也括进了底数，两者不同。'
      },
      {
        title: '哪个数的绝对值最大？',
        desc: '绝对值就是数轴上这个点到原点的距离，与方向无关。',
        options: ['−5.2', '4.9', '0', '−3'],
        answer: 0,
        hint: '比的是到原点的距离，不是数本身的大小。',
        explain: '|−5.2| = 5.2 最大。注意 −5.2 是四个数里<b>最小</b>的，但绝对值<b>最大</b>——负数越小，绝对值越大。'
      }
    ]);
  });
})();
