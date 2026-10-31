/* 第 21 课 · 因式分解（北师大版八下第四章） */
(function () {
  'use strict';
  var M = window.Mx, st = M.getState();

  /* ---------- 模型一：因式分解与整式乘法互为逆运算 ---------- */
  var CASES = [
    { id: 'gcf', name: '提公因式', raw: '6a³b − 9a²b²', out: '3a²b(2a − 3b)',
      how: '每一项都含有 3a²b，把它提到括号外面。<b>公因式要提到最大</b>——系数取最大公约数 3，字母取相同字母的<b>最低次幂</b> a²b。',
      check: '把括号乘开验算：3a²b × 2a = 6a³b，3a²b × (−3b) = −9a²b²，和原式一样 ✓' },
    { id: 'diff', name: '平方差公式', raw: '4x² − 25y²', out: '(2x + 5y)(2x − 5y)',
      how: '看出它是「<b>平方 − 平方</b>」：4x² = (2x)²，25y² = (5y)²，直接套 a² − b² = (a+b)(a−b)。',
      check: '乘开：(2x)² − (5y)² = 4x² − 25y² ✓。注意只有<b>减号</b>才能用，a² + b² 在实数范围内分解不了。' },
    { id: 'sq', name: '完全平方公式', raw: 'x² + 6x + 9', out: '(x + 3)²',
      how: '首尾都是平方（x² 和 3²），中间项正好是 2 × x × 3 = 6x，符合 a² + 2ab + b² = (a+b)²。',
      check: '乘开：x² + 2·x·3 + 3² = x² + 6x + 9 ✓。<b>先验中间项</b>是不是 2ab，不是就不能套公式。' },
    { id: 'mix', name: '先提再套', raw: '2x³ − 8x', out: '2x(x + 2)(x − 2)',
      how: '先提公因式 2x 得 2x(x² − 4)，括号里还能用平方差继续分解。',
      check: '<b>分解要进行到每个因式都不能再分为止</b>——只写 2x(x² − 4) 不算做完。' },
    { id: 'wrong', name: '这是分解吗', raw: 'x² + 2x + 1 = x(x + 2) + 1', out: '不是因式分解',
      how: '右边是「乘积 + 1」，不是几个因式<b>相乘</b>的形式。因式分解的结果必须是<b>整式乘积</b>。',
      check: '正确答案是 (x + 1)²。判断标准：等号右边从头到尾是不是在做乘法。' }
  ];
  var idx = M.num(st.i, 0, 0, 4);

  function showCase() {
    var c = CASES[idx];
    var s = M.$('#fc-fig');
    s.innerHTML = '';
    var S = M.svg;
    /* 用箭头图说明「乘法 ⇄ 分解」是反着来的 */
    S('rect', { x: 18, y: 30, width: 112, height: 38, rx: 9, fill: '#eaeff8', stroke: '#5d7cb0', 'stroke-width': 1.5 }, s);
    S('rect', { x: 174, y: 30, width: 112, height: 38, rx: 9, fill: '#e8f0e6', stroke: '#3f7d6a', 'stroke-width': 1.5 }, s);
    S('text', { x: 74, y: 54, 'text-anchor': 'middle', 'font-size': 12, fill: '#2f4473', text: '和差形式' }, s);
    S('text', { x: 230, y: 54, 'text-anchor': 'middle', 'font-size': 12, fill: '#2f6a4a', text: '乘积形式' }, s);
    S('path', { d: 'M132 42h40', stroke: '#c2603f', 'stroke-width': 2, 'marker-end': 'none' }, s);
    S('path', { d: 'M172 42l-8-4v8z', fill: '#c2603f' }, s);
    S('text', { x: 152, y: 34, 'text-anchor': 'middle', 'font-size': 10, fill: '#a4492b', text: '因式分解' }, s);
    S('path', { d: 'M172 58h-40', stroke: '#8795b5', 'stroke-width': 2 }, s);
    S('path', { d: 'M132 58l8-4v8z', fill: '#8795b5' }, s);
    S('text', { x: 152, y: 76, 'text-anchor': 'middle', 'font-size': 10, fill: '#6b7385', text: '整式乘法' }, s);

    M.$('#fc-name').textContent = c.name;
    M.$('#fc-raw').innerHTML = c.raw.replace(/(\w)(\d)/g, function (m0, a2, b2) { return a2 + M.sup(b2); });
    M.$('#fc-out').innerHTML = c.out.replace(/(\w)(\d)/g, function (m0, a2, b2) { return a2 + M.sup(b2); });
    M.$('#fc-how').innerHTML = c.how;
    M.$('#fc-check').innerHTML = c.check;
    M.setState({ i: idx, x: xv });
  }

  /* ---------- 模型二：面积图看完全平方 ---------- */
  var xv = M.num(st.x, 3, 1, 7);

  function showArea() {
    var s = M.$('#ar-fig');
    s.innerHTML = '';
    var S = M.svg, ox = 26, oy = 20;
    var unit = Math.min(20, 160 / (xv + 3));  /* x 较大时整体缩小，放得进画布 */
    var X = xv * unit, B = 3 * unit;
    S('rect', { x: ox, y: oy, width: X, height: X, fill: '#cfdaee', stroke: '#5d7cb0', 'stroke-width': 1.4 }, s);
    S('rect', { x: ox + X, y: oy, width: B, height: X, fill: '#e8dcc8', stroke: '#5d7cb0', 'stroke-width': 1.4 }, s);
    S('rect', { x: ox, y: oy + X, width: X, height: B, fill: '#e8dcc8', stroke: '#5d7cb0', 'stroke-width': 1.4 }, s);
    S('rect', { x: ox + X, y: oy + X, width: B, height: B, fill: '#f0d4cb', stroke: '#5d7cb0', 'stroke-width': 1.4 }, s);
    S('text', { x: ox + X / 2, y: oy + X / 2 + 4, 'text-anchor': 'middle', 'font-size': 12, fill: '#2f4473', text: 'x²' }, s);
    S('text', { x: ox + X + B / 2, y: oy + X / 2 + 4, 'text-anchor': 'middle', 'font-size': 10, fill: '#7a6334', text: '3x' }, s);
    S('text', { x: ox + X / 2, y: oy + X + B / 2 + 4, 'text-anchor': 'middle', 'font-size': 10, fill: '#7a6334', text: '3x' }, s);
    S('text', { x: ox + X + B / 2, y: oy + X + B / 2 + 4, 'text-anchor': 'middle', 'font-size': 10, fill: '#8a4530', text: '9' }, s);
    S('text', { x: ox + (X + B) / 2, y: oy + X + B + 17, 'text-anchor': 'middle', 'font-size': 11, fill: '#4a5568', text: 'x + 3 = ' + (xv + 3) }, s);
    var total = (xv + 3) * (xv + 3);
    M.$('#ar-calc').innerHTML = 'x = ' + xv + ' 时：x² + 6x + 9 = ' + (xv * xv) + ' + ' + (6 * xv) + ' + 9 = <b>' + total + '</b><br>' +
      '(x + 3)² = ' + (xv + 3) + '² = <b>' + total + '</b> ✓';
    M.$('#ar-text').innerHTML = '四块面积加起来，正好拼成一个边长 (x + 3) 的大正方形。' +
      '所以 x² + 6x + 9 = (x + 3)²——<b>因式分解就是把「加起来的几块」重新拼成一个整体</b>。' +
      '中间两块各是 3x，合起来 6x，这就是公式里 2ab 的来历。';
    M.setState({ i: idx, x: xv });
  }

  document.addEventListener('DOMContentLoaded', function () {
    M.chips(M.$('#fc-chips'), CASES.map(function (c, i) { return { label: c.name, value: String(i) }; }), String(idx), function (v) { idx = +v; showCase(); });
    showCase();
    M.bindRange(M.$('#ar-range'), function (v) { xv = v; showArea(); })();

    M.match('#fm-list', '#fm-score', [
      ['x² − 9', 'diff', '平方差：(x+3)(x−3)'],
      ['x² + 4x + 4', 'sq', '完全平方：(x+2)²'],
      ['3x² − 6x', 'gcf', '提公因式 3x：3x(x−2)'],
      ['x² + 9', 'none', '平方<b>和</b>在实数范围内不能分解'],
      ['4a² − 12ab + 9b²', 'sq', '完全平方：(2a−3b)²'],
      ['5m²n + 10mn²', 'gcf', '提公因式 5mn：5mn(m+2n)'],
      ['x⁴ − 16', 'diff', '先平方差得 (x²+4)(x²−4)，还能继续分解'],
      ['x² + 3x + 1', 'none', '配不出完全平方，初中范围内分解不了']
    ], [['gcf', '提公因式'], ['diff', '平方差'], ['sq', '完全平方'], ['none', '分解不了']], function (it, ok) { return it[2]; });

    M.quiz([
      {
        level: 'base',
        title: '看「先提再套」那一例',
        desc: '切到「先提再套」，看看为什么不能只写一步。',
        label: '在上面点一个类型',
        button: '检查选的是哪个',
        check: function () {
          if (CASES[idx].id !== 'mix') return { ok: false, msg: '点一下「先提再套」。' };
          return { ok: true, msg: '2x³ − 8x = 2x(x² − 4) = <b>2x(x+2)(x−2)</b>。因式分解必须进行到<b>每个因式都不能再分</b>为止，停在中间只能得一半分。' };
        }
      },
      {
        level: 'base',
        title: '分解因式：x² − 16',
        desc: '这是平方减平方。',
        options: ['(x + 4)(x − 4)', '(x − 4)²', '(x + 4)²', 'x(x − 16)'],
        answer: 0,
        hint: '16 = 4²，套 a² − b²。',
        explain: 'x² − 4² = <b>(x+4)(x−4)</b>。平方差公式要求中间是<b>减号</b>，两项都是完全平方。'
      },
      {
        level: 'base',
        title: '分解因式：2x + 6',
        desc: '先找公因式。',
        options: ['2(x + 3)', '2x(1 + 3)', '(2x)(6)', '不能分解'],
        answer: 0,
        hint: '2 和 6 的最大公约数是 2。',
        explain: '提公因式 2 得 <b>2(x + 3)</b>。任何因式分解题，<b>第一步都先看有没有公因式</b>。'
      },
      {
        level: 'mid',
        title: 'x² + 2x + 1 = x(x + 2) + 1 是因式分解吗？',
        desc: '看看等号右边是不是「几个式子相乘」。',
        options: ['不是，右边不是乘积形式', '是，已经分解完了', '是，但不是最简', '无法判断'],
        answer: 0,
        hint: '因式分解的结果必须整体是乘法。',
        explain: '右边是「乘积 + 1」，不是乘积形式。正确结果是 (x + 1)²。判断口诀：<b>左边是和差，右边必须是乘积</b>。'
      },
      {
        level: 'mid',
        title: '下面哪个<b>不能</b>在实数范围内因式分解？',
        desc: '想想平方差公式要求什么符号。',
        options: ['x² + 9', 'x² − 9', 'x² + 6x + 9', '3x² − 6x'],
        answer: 0,
        hint: '平方差公式是 a² − b²，注意是减号。',
        explain: 'x² + 9 是平方<b>和</b>，在实数范围内分解不了。而 x² − 9 = (x+3)(x−3)，x² + 6x + 9 = (x+3)²，3x² − 6x = 3x(x−2)。'
      },
      {
        level: 'mid',
        title: '分解因式：x² + 10x + 25',
        desc: '首尾都是平方，检查中间项是不是 2ab。',
        options: ['(x + 5)²', '(x − 5)²', '(x + 25)²', '(x+5)(x−5)'],
        answer: 0,
        hint: '2 × x × 5 = 10x，正好对上。',
        explain: 'x² + 2·x·5 + 5² = <b>(x + 5)²</b>。套完全平方前<b>先验中间项是不是 2ab</b>，对不上就不能用。'
      },
      {
        level: 'mid',
        title: '分解因式：3x² − 12',
        desc: '先提公因式，再看能不能继续分解。',
        options: ['3(x + 2)(x − 2)', '3(x² − 4)', '(3x+6)(x−2)', '3(x − 2)²'],
        answer: 0,
        hint: '提出 3 以后，括号里是平方差。',
        explain: '3x² − 12 = 3(x² − 4) = <b>3(x+2)(x−2)</b>。<b>停在 3(x²−4) 不算做完</b>，必须分解到每个因式都不能再分。'
      },
      {
        level: 'trap',
        title: 'x² + 4 能在实数范围内分解吗？',
        desc: '注意这是平方和，不是平方差。',
        options: ['不能，平方和无法分解', '能，等于 (x+2)²', '能，等于 (x+2)(x−2)', '能，等于 (x+2)(x+2)'],
        answer: 0,
        hint: '平方差公式要求中间是减号。',
        explain: '<b>平方和 x² + 4 在实数范围内不能分解</b>。注意区别：x² − 4 = (x+2)(x−2) 可以；(x+2)² = x² + 4x + 4 多了中间项。'
      }
    ]);
  });
})();
