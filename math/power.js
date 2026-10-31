/* 第 7 课 · 幂的运算与整式乘除（北师大版七下第一章） */
(function () {
  'use strict';
  var M = window.Mx, st = M.getState();

  /* ---------- 模型一：幂的运算法则 ---------- */
  var m = M.num(st.m, 3, 1, 6), n = M.num(st.n, 2, 1, 6), rule = st.r || 'mul';
  var RULES = {
    mul: { name: '同底数幂相乘', law: 'aᵐ · aⁿ = aᵐ⁺ⁿ', calc: function (p, q) { return p + q; }, sym: '+' },
    pow: { name: '幂的乘方', law: '(aᵐ)ⁿ = aᵐⁿ', calc: function (p, q) { return p * q; }, sym: '×' },
    div: { name: '同底数幂相除', law: 'aᵐ ÷ aⁿ = aᵐ⁻ⁿ', calc: function (p, q) { return p - q; }, sym: '−' }
  };

  function showRule() {
    var r = RULES[rule], k = r.calc(m, n);
    var s = M.$('#pw-fig');
    s.innerHTML = '';
    var S = M.svg, bw = 15, y0 = 30;
    /* 把 a 一个个画出来，直观看出为什么指数要相加 */
    function row(count, label, y, color) {
      S('text', { x: 8, y: y + 11, 'font-size': 10.5, fill: '#6b7385', text: label }, s);
      for (var i = 0; i < Math.min(count, 18); i++) {
        S('rect', { x: 74 + i * bw, y: y, width: bw - 2.5, height: 15, rx: 2.5, fill: color, stroke: '#5d7cb0', 'stroke-width': .9 }, s);
        S('text', { x: 74 + i * bw + 6.2, y: y + 11, 'text-anchor': 'middle', 'font-size': 9, fill: '#2f4473', text: 'a' }, s);
      }
      if (count > 18) S('text', { x: 74 + 18 * bw + 4, y: y + 11, 'font-size': 10, fill: '#6b7385', text: '…共 ' + count + ' 个' }, s);
    }
    if (rule === 'mul') {
      row(m, 'a' + '^' + m + ' =', y0, '#cfdaee');
      row(n, 'a' + '^' + n + ' =', y0 + 26, '#f0d9cd');
      S('line', { x1: 8, y1: y0 + 50, x2: 300, y2: y0 + 50, stroke: '#dfe3ea' }, s);
      row(k, '合起来', y0 + 58, '#dfe8d8');
    } else if (rule === 'pow') {
      for (var j = 0; j < Math.min(n, 4); j++) row(m, j === 0 ? '每组 ' + m + ' 个' : '', y0 + j * 22, '#cfdaee');
      S('text', { x: 8, y: y0 + 22 * Math.min(n, 4) + 16, 'font-size': 10.5, fill: '#6b7385', text: '共 ' + n + ' 组，每组 ' + m + ' 个 → ' + k + ' 个 a' }, s);
    } else {
      row(m, '分子 ' + m + ' 个', y0, '#cfdaee');
      row(n, '约掉 ' + n + ' 个', y0 + 26, '#efefef');
      S('line', { x1: 8, y1: y0 + 50, x2: 300, y2: y0 + 50, stroke: '#dfe3ea' }, s);
      row(Math.max(k, 0), '剩下', y0 + 58, '#dfe8d8');
    }

    M.$('#pw-name').textContent = r.name;
    M.$('#pw-law').textContent = r.law;
    M.$('#pw-expr').innerHTML = rule === 'mul' ? 'a' + M.sup(m) + ' · a' + M.sup(n) + ' = a' + M.sup(m + ' + ' + n) + ' = <b>a' + M.sup(k) + '</b>'
      : rule === 'pow' ? '(a' + M.sup(m) + ')' + M.sup(n) + ' = a' + M.sup(m + ' × ' + n) + ' = <b>a' + M.sup(k) + '</b>'
      : 'a' + M.sup(m) + ' ÷ a' + M.sup(n) + ' = a' + M.sup(m + ' − ' + n) + ' = <b>a' + M.sup(k) + '</b>' + (k === 0 ? '（= 1）' : (k < 0 ? '（负指数，初中一般要求 m > n）' : ''));
    M.$('#pw-tip').innerHTML = rule === 'mul'
      ? '指数是「a 的个数」。' + m + ' 个 a 再乘 ' + n + ' 个 a，当然是 ' + k + ' 个 a 连乘。所以<b>底数不变，指数相加</b>。'
      : rule === 'pow'
      ? '(a' + M.sup(m) + ')' + M.sup(n) + ' 是 ' + n + ' 个 a' + M.sup(m) + ' 相乘，每个里面有 ' + m + ' 个 a，一共 ' + m + ' × ' + n + ' = ' + k + ' 个。所以<b>底数不变，指数相乘</b>。'
      : '分子有 ' + m + ' 个 a，分母有 ' + n + ' 个 a，约分后还剩 ' + (m - n) + ' 个。所以<b>底数不变，指数相减</b>。' + (m === n ? '当 m = n 时结果是 a⁰ = 1（a ≠ 0）。' : '');
    M.setState({ m: m, n: n, r: rule, u: uu, v: vv });
  }

  /* ---------- 模型二：面积拼图证明乘法公式 ---------- */
  var uu = M.num(st.u, 5, 1, 8), vv = M.num(st.v, 3, 1, 8), formula = st.f || 'sq';

  function showArea() {
    var s = M.$('#ar-fig');
    s.innerHTML = '';
    var S = M.svg, ox = 20, oy = 20;
    /* 单位长度随 a、b 自动缩放，图形始终放得进 300×230 的画布 */
    var unit = formula === 'sq'
      ? Math.min(22, 180 / (uu + vv))
      : Math.min(22, 230 / (Math.max(uu, vv) + 24 / 22 + (uu + vv) * 0.62 + 1), 190 / Math.max(uu, vv));
    var A = uu * unit, B = vv * unit;
    if (formula === 'sq') {
      /* (a+b)² = a² + 2ab + b² */
      S('rect', { x: ox, y: oy, width: A, height: A, fill: '#cfdaee', stroke: '#5d7cb0' }, s);
      S('rect', { x: ox + A, y: oy, width: B, height: A, fill: '#e8dcc8', stroke: '#5d7cb0' }, s);
      S('rect', { x: ox, y: oy + A, width: A, height: B, fill: '#e8dcc8', stroke: '#5d7cb0' }, s);
      S('rect', { x: ox + A, y: oy + A, width: B, height: B, fill: '#f0d4cb', stroke: '#5d7cb0' }, s);
      S('text', { x: ox + A / 2, y: oy + A / 2 + 4, 'text-anchor': 'middle', 'font-size': 12, fill: '#2f4473', text: 'a²' }, s);
      S('text', { x: ox + A + B / 2, y: oy + A / 2 + 4, 'text-anchor': 'middle', 'font-size': 11, fill: '#7a6334', text: 'ab' }, s);
      S('text', { x: ox + A / 2, y: oy + A + B / 2 + 4, 'text-anchor': 'middle', 'font-size': 11, fill: '#7a6334', text: 'ab' }, s);
      S('text', { x: ox + A + B / 2, y: oy + A + B / 2 + 4, 'text-anchor': 'middle', 'font-size': 11, fill: '#8a4530', text: 'b²' }, s);
      S('text', { x: ox + (A + B) / 2, y: oy + A + B + 18, 'text-anchor': 'middle', 'font-size': 11, fill: '#4a5568', text: 'a + b = ' + (uu + vv) }, s);
      var tot = (uu + vv) * (uu + vv);
      M.$('#ar-law').innerHTML = '(a + b)' + M.sup(2) + ' = a' + M.sup(2) + ' + 2ab + b' + M.sup(2);
      M.$('#ar-calc').innerHTML = '大正方形边长 ' + (uu + vv) + '，面积 <b>' + tot + '</b><br>' +
        '四块加起来：' + (uu * uu) + ' + 2 × ' + (uu * vv) + ' + ' + (vv * vv) + ' = <b>' + tot + '</b> ✓';
      M.$('#ar-tip').innerHTML = '中间两块长方形面积都是 ab，所以是 <b>2ab</b>，不是 ab。把 (a+b)² 写成 a² + b² 是最常见的错误，' +
        '看图就明白：少算了中间两块 ' + (2 * uu * vv) + ' 的面积。';
    } else {
      /* (a+b)(a−b) = a² − b²：从 a² 里挖掉 b²，再把剩下的拼成长方形 */
      var a2 = Math.max(uu, vv) * unit, b2 = Math.min(uu, vv) * unit;
      S('rect', { x: ox, y: oy, width: a2, height: a2, fill: '#cfdaee', stroke: '#5d7cb0' }, s);
      S('rect', { x: ox + a2 - b2, y: oy + a2 - b2, width: b2, height: b2, fill: '#f0d4cb', stroke: '#c2603f', 'stroke-dasharray': '4 3' }, s);
      S('text', { x: ox + a2 / 2 - b2 / 2, y: oy + a2 / 2, 'text-anchor': 'middle', 'font-size': 12, fill: '#2f4473', text: 'a² 挖掉 b²' }, s);
      var big = Math.max(uu, vv), sml = Math.min(uu, vv);
      S('rect', { x: ox + a2 + 24, y: oy, width: (big + sml) * unit * 0.62, height: (big - sml) * unit, fill: '#dfe8d8', stroke: '#5d7cb0' }, s);
      S('text', { x: ox + a2 + 24 + (big + sml) * unit * 0.31, y: oy + (big - sml) * unit / 2 + 4, 'text-anchor': 'middle', 'font-size': 10.5, fill: '#43704f', text: '(a+b)(a−b)' }, s);
      M.$('#ar-law').innerHTML = '(a + b)(a − b) = a' + M.sup(2) + ' − b' + M.sup(2);
      M.$('#ar-calc').innerHTML = 'a = ' + big + '，b = ' + sml + '<br>' +
        '左：' + big + '² − ' + sml + '² = ' + (big * big - sml * sml) + '<br>' +
        '右：(' + big + '+' + sml + ')(' + big + '−' + sml + ') = ' + (big + sml) + ' × ' + (big - sml) + ' = <b>' + (big * big - sml * sml) + '</b> ✓';
      M.$('#ar-tip').innerHTML = '把挖掉 b² 后剩下的「L 形」剪开再拼，正好是一个长 (a+b)、宽 (a−b) 的长方形，面积当然相等。' +
        '这就是<b>平方差公式</b>，用它算 ' + (big * 10 + sml) + ' × ' + (big * 10 - sml) + ' 这种题特别快。';
    }
    M.setState({ m: m, n: n, r: rule, u: uu, v: vv, f: formula });
  }

  /* ---------- 装配 ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    M.chips(M.$('#pw-chips'), Object.keys(RULES).map(function (k) { return { label: RULES[k].name, value: k }; }), rule, function (v) { rule = v; showRule(); });
    M.bindRange(M.$('#pw-m'), function (v) { m = v; showRule(); })();
    M.bindRange(M.$('#pw-n'), function (v) { n = v; showRule(); })();

    M.chips(M.$('#ar-chips'), [{ label: '完全平方公式', value: 'sq' }, { label: '平方差公式', value: 'df' }], formula, function (v) { formula = v; showArea(); });
    M.bindRange(M.$('#ar-a'), function (v) { uu = v; showArea(); })();
    M.bindRange(M.$('#ar-b'), function (v) { vv = v; showArea(); })();

    M.match('#pm-list', '#pm-score', [
      ['a³ · a⁴', 'a7', '同底数幂相乘，指数相加：3 + 4 = 7'],
      ['(a³)⁴', 'a12', '幂的乘方，指数相乘：3 × 4 = 12'],
      ['a¹² ÷ a⁴', 'a8', '同底数幂相除，指数相减：12 − 4 = 8'],
      ['a³ + a³', 'other', '这是合并同类项，等于 2a³，不是 a⁶'],
      ['(a²)³ · a', 'a7', '先算 (a²)³ = a⁶，再乘 a 得 a⁷'],
      ['(2a)³', 'other', '积的乘方要每个因式都乘方：8a³']
    ], [['a7', 'a⁷'], ['a8', 'a⁸'], ['a12', 'a¹²'], ['other', '都不是']], function (it, ok) { return it[2]; });

    M.quiz([
      {
        level: 'base',
        title: '把完全平方公式的图调成 a = 6、b = 2',
        desc: '切到「完全平方公式」，把两个滑块调好，看看四块面积分别是多少。',
        label: '在面积图里调滑块',
        button: '检查 a 和 b',
        check: function () {
          if (formula !== 'sq') return { ok: false, msg: '先切到「完全平方公式」。' };
          if (uu !== 6 || vv !== 2) return { ok: false, msg: '现在 a = ' + uu + '、b = ' + vv + '，再调一调。' };
          return { ok: true, msg: '(6+2)² = 64；四块是 36 + 2×12 + 4 = 64。中间两块各 12，加起来 24，正是公式里的 2ab。' };
        }
      },
      {
        level: 'base',
        title: '计算 a² · a³',
        desc: '同底数幂相乘，底数不变、指数相加。',
        options: ['a⁵', 'a⁶', '2a⁵', 'a⁹'],
        answer: 0,
        hint: '2 + 3 等于几？',
        explain: 'a² · a³ = a²⁺³ = <b>a⁵</b>。展开数一数：2 个 a 再乘 3 个 a，一共 5 个 a。'
      },
      {
        level: 'base',
        title: '计算 (x + 3)(x − 3)',
        desc: '两数之和乘两数之差，用平方差公式。',
        options: ['x² − 9', 'x² + 9', 'x² − 6x + 9', 'x² − 3'],
        answer: 0,
        hint: '套 a² − b²，这里 a = x、b = 3。',
        explain: '(x+3)(x−3) = x² − 3² = <b>x² − 9</b>。看到「和 × 差」就想平方差，不用展开硬乘。'
      },
      {
        level: 'mid',
        title: '(a + b)² 等于 a² + b² 吗？',
        desc: '看上面的面积图想一想。',
        options: ['不等于，还差中间的 2ab', '等于，平方可以分开算', '只有 a = b 时才不等', '只有 a、b 都是正数时才相等'],
        answer: 0,
        hint: '面积图里一共有四块，a² 和 b² 只占两块。',
        explain: '(a+b)² = a² + 2ab + b²。漏掉 2ab 是最常见的错误，图上中间两块长方形就是被漏掉的部分。'
      },
      {
        level: 'mid',
        title: '102 × 98 用平方差公式怎么算？',
        desc: '把它写成 (100 + 2)(100 − 2)。',
        options: ['100² − 2² = 9996', '100² + 2² = 10004', '100 × 98 = 9800', '102² − 2 = 10402'],
        answer: 0,
        hint: 'a = 100，b = 2，套 a² − b²。',
        explain: '(100+2)(100−2) = 100² − 2² = 10000 − 4 = 9996。看到「两数之和乘两数之差」就想平方差，心算会快很多。'
      },
      {
        level: 'mid',
        title: '计算 (2a)³',
        desc: '积的乘方，每个因式都要乘方。',
        options: ['8a³', '2a³', '6a³', '8a'],
        answer: 0,
        hint: '2 和 a 都要三次方。',
        explain: '(2a)³ = 2³ · a³ = <b>8a³</b>。只把字母乘方、忘记系数，写成 2a³ 是高频错误。'
      },
      {
        level: 'mid',
        title: '展开 (a + 3)²',
        desc: '完全平方公式：首平方、尾平方、积的 2 倍放中间。',
        options: ['a² + 6a + 9', 'a² + 9', 'a² + 3a + 9', 'a² + 9a + 9'],
        answer: 0,
        hint: '中间项是 2 × a × 3。',
        explain: '(a+3)² = a² + 2·a·3 + 3² = <b>a² + 6a + 9</b>。中间项 6a 最容易漏，面积图上它正是两块长方形。'
      },
      {
        level: 'trap',
        title: 'a³ + a³ 等于多少？',
        desc: '注意这里是加法，不是乘法。',
        options: ['2a³', 'a⁶', 'a⁹', '2a⁶'],
        answer: 0,
        hint: '两个相同的东西相加，是几个？',
        explain: '这是<b>合并同类项</b>：a³ + a³ = <b>2a³</b>。只有<b>乘法</b>才把指数相加（a³·a³ = a⁶）。加法和乘法混淆是本章第一大坑。'
      }
    ]);
  });
})();
