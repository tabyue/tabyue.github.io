/* 第 22 课 · 分式与分式方程（北师大版八下第五章） */
(function () {
  'use strict';
  var M = window.Mx, st = M.getState();

  /* ---------- 模型一：分式什么时候有意义 ---------- */
  var FRACS = [
    { id: 'a', num: '1', den: 'x − 2', bad: [2], why: '分母 x − 2 = 0 时，即 x = 2 时没有意义。' },
    { id: 'b', num: 'x + 1', den: 'x² − 4', bad: [2, -2], why: '分母 x² − 4 = (x+2)(x−2)，x = 2 或 x = −2 时都为 0。' },
    { id: 'c', num: 'x − 3', den: 'x² + 1', bad: [], why: '分母 x² + 1 恒大于 0，所以<b>任何实数</b> x 都有意义。' },
    { id: 'd', num: 'x² − 9', den: 'x − 3', bad: [3], why: '虽然约分后得 x + 3，但<b>原分式</b>在 x = 3 时分母为 0，仍然没有意义。' }
  ];
  var fIdx = M.num(st.f, 0, 0, 3), xv = M.num(st.x, 1, -5, 5);

  function denVal(id, x) {
    if (id === 'a') return x - 2;
    if (id === 'b') return x * x - 4;
    if (id === 'c') return x * x + 1;
    return x - 3;
  }
  function numVal(id, x) {
    if (id === 'a') return 1;
    if (id === 'b') return x + 1;
    if (id === 'c') return x - 3;
    return x * x - 9;
  }

  function showFrac() {
    var f = FRACS[fIdx];
    var nl = M.numline(M.$('#df-fig'), { min: -5, max: 5, step: 0.5, labelStep: 1, y: 52 });
    var S = M.svg, L = nl.layer;
    /* 无意义的点打叉 */
    f.bad.forEach(function (bx) {
      S('line', { x1: nl.X(bx) - 7, y1: nl.y - 7, x2: nl.X(bx) + 7, y2: nl.y + 7, stroke: '#c2603f', 'stroke-width': 2.6 }, L);
      S('line', { x1: nl.X(bx) + 7, y1: nl.y - 7, x2: nl.X(bx) - 7, y2: nl.y + 7, stroke: '#c2603f', 'stroke-width': 2.6 }, L);
      S('text', { x: nl.X(bx), y: nl.y - 14, 'text-anchor': 'middle', 'font-size': 10, fill: '#a4492b', text: 'x≠' + bx }, L);
    });
    var isBad = Math.abs(denVal(f.id, xv)) < 1e-9;
    S('circle', { cx: nl.X(xv), cy: nl.y, r: 6, fill: isBad ? '#c2603f' : '#2f5aa8', stroke: '#fff', 'stroke-width': 2 }, L);
    S('text', { x: nl.X(xv), y: nl.y + 24, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: isBad ? '#a4492b' : '#2f5aa8', text: 'x=' + M.fmt(xv) }, L);

    M.$('#df-expr').innerHTML = '<span class="frac"><i>' + f.num + '</i><i>' + f.den + '</i></span>';
    M.$('#df-den').textContent = M.fmt(denVal(f.id, xv));
    M.$('#df-val').innerHTML = isBad ? '<b style="color:#a4422c">没有意义</b>' : M.fmt(numVal(f.id, xv) / denVal(f.id, xv), 4);
    M.$('#df-cond').innerHTML = f.bad.length ? 'x ≠ ' + f.bad.join(' 且 x ≠ ') : '任何实数都可以';
    M.$('#df-text').innerHTML = f.why + '<br><b>分式有意义的条件是分母不为 0</b>——这是分式最核心的一条，列条件时千万别用分子。' +
      (f.id === 'd' ? '这一例特别要注意：约分<b>不能</b>改变原来的取值范围。' : '');
    M.setState({ f: fIdx, x: xv, e: eqIdx });
  }

  /* ---------- 模型二：分式方程与增根 ---------- */
  var EQS = [
    { id: 'ok', show: '<span class="frac"><i>2</i><i>x</i></span> = <span class="frac"><i>3</i><i>x − 1</i></span>',
      steps: ['两边同乘 x(x − 1)', '2(x − 1) = 3x', '2x − 2 = 3x', 'x = −2'],
      root: -2, bad: [0, 1], verdict: 'x = −2 代入分母：x = −2 ≠ 0，x − 1 = −3 ≠ 0，<b>是原方程的解</b>。' },
    { id: 'extra', show: '<span class="frac"><i>1</i><i>x − 2</i></span> = <span class="frac"><i>3</i><i>x² − 4</i></span>',
      steps: ['两边同乘 (x+2)(x−2)', 'x + 2 = 3', 'x = 1'],
      root: 1, bad: [2, -2], verdict: 'x = 1 代入分母都不为 0，<b>是原方程的解</b>。' },
    { id: 'extra2', show: '<span class="frac"><i>x</i><i>x − 3</i></span> − 2 = <span class="frac"><i>3</i><i>x − 3</i></span>',
      steps: ['两边同乘 (x − 3)', 'x − 2(x − 3) = 3', 'x − 2x + 6 = 3', 'x = 3'],
      root: 3, bad: [3], verdict: 'x = 3 使分母 x − 3 = 0！这是<b>增根</b>，必须舍去，所以原方程<b>无解</b>。' }
  ];
  var eqIdx = M.num(st.e, 0, 0, 2), sIdx = 0;

  function showEq() {
    var e = EQS[eqIdx];
    var bar = M.$('#eq-steps');
    bar.innerHTML = '';
    e.steps.forEach(function (t, i) {
      var sp = M.html('span', { text: '第 ' + (i + 1) + ' 步', role: 'button', tabindex: '0', class: i === sIdx ? 'on' : (i < sIdx ? 'done' : '') }, bar);
      sp.addEventListener('click', function () { sIdx = i; showEq(); });
      sp.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); sIdx = i; showEq(); } });
      if (i < e.steps.length - 1) M.html('i', { text: '›' }, bar);
    });
    if (sIdx >= e.steps.length) sIdx = e.steps.length - 1;
    M.$('#eq-show').innerHTML = e.show;
    M.$('#eq-now').innerHTML = e.steps[sIdx];
    M.$('#eq-root').textContent = 'x = ' + e.root;
    var isExtra = e.bad.indexOf(e.root) >= 0;
    M.$('#eq-check').innerHTML = (isExtra ? '✗ ' : '✓ ') + e.verdict;
    M.$('#eq-bad').textContent = e.bad.join('、');
    M.$('#eq-text').innerHTML = '解分式方程要<b>去分母</b>变成整式方程，但这一步可能<b>扩大解的范围</b>——' +
      '原方程里分母不能为 0，整式方程却没有这个限制。所以<b>必须检验</b>：把解代回原方程的分母，' +
      '使分母为 0 的解叫<b>增根</b>，要舍去。' + (isExtra ? '本题的 x = ' + e.root + ' 正是增根。' : '');
    M.setState({ f: fIdx, x: xv, e: eqIdx });
  }

  document.addEventListener('DOMContentLoaded', function () {
    M.chips(M.$('#df-chips'), FRACS.map(function (f, i) {
      return { label: '<span class="frac"><i>' + f.num + '</i><i>' + f.den + '</i></span>', value: String(i) };
    }), String(fIdx), function (v) { fIdx = +v; showFrac(); });
    M.bindRange(M.$('#df-range'), function (v) { xv = v; showFrac(); })();
    M.chips(M.$('#eq-chips'), EQS.map(function (e, i) { return { label: '第 ' + (i + 1) + ' 题', value: String(i) }; }), String(eqIdx), function (v) { eqIdx = +v; sIdx = 0; showEq(); });
    showEq();

    M.quiz([
      {
        title: '找出会产生增根的那道方程',
        desc: '三道题逐个点开，看哪道解出来的 x 让分母变成 0。',
        label: '在分式方程里切换题目',
        button: '检查选的题',
        check: function () {
          var e = EQS[eqIdx];
          if (e.bad.indexOf(e.root) < 0) return { ok: false, msg: '第 ' + (eqIdx + 1) + ' 题解出 x = ' + e.root + '，代入分母不为 0，不是增根。再看看别的题。' };
          return { ok: true, msg: '第 3 题解出 x = 3，但 x − 3 = 0，所以这是<b>增根</b>，原方程<b>无解</b>。分式方程解完<b>一定要检验</b>。' };
        }
      },
      {
        title: '分式 1/(x−2) 什么时候有意义？',
        desc: '可以在上面的数轴上看看哪个点被打了叉。',
        options: ['x ≠ 2', 'x > 2', 'x ≠ 0', '任何实数'],
        answer: 0,
        hint: '分式有意义的条件只看分母。',
        explain: '分母 x − 2 ≠ 0，即 <b>x ≠ 2</b>。注意条件只跟<b>分母</b>有关，和分子是几没有关系。'
      },
      {
        title: '为什么解分式方程必须检验？',
        desc: '想想去分母这一步做了什么。',
        options: ['去分母可能产生原方程不允许的解（增根）', '因为计算容易出错', '因为老师要求写检验', '为了凑步骤分'],
        answer: 0,
        hint: '原方程要求分母不为 0，整式方程没有这个限制。',
        explain: '去分母后得到的整式方程，解的范围<b>比原方程大</b>。使分母为 0 的解叫增根，必须舍去。这是分式方程特有的步骤，不是形式主义。'
      }
    ]);
  });
})();
