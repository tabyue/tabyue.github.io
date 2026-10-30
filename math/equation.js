/* 第 5 课 · 一元一次方程（北师大版七上第五章） */
(function () {
  'use strict';
  var M = window.Mx, st = M.getState();

  /* ---------- 模型一：天平解方程 ----------
     方程始终是 L.x·x + L.c = R.x·x + R.c，解不变。
     每一步「两边同时…」都保持等式成立，这正是等式的基本性质。 */
  var START = [
    { a: 3, b: 2, c: 1, d: 10, name: '3x + 2 = x + 10' },
    { a: 2, b: 5, c: 0, d: 13, name: '2x + 5 = 13' },
    { a: 4, b: -3, c: 2, d: 7, name: '4x − 3 = 2x + 7' },
    { a: 5, b: 1, c: 2, d: 13, name: '5x + 1 = 2x + 13' }
  ];
  var pick = M.num(st.q, 0, 0, 3), eq, log;

  function reset() {
    var s = START[pick];
    eq = { a: s.a, b: s.b, c: s.c, d: s.d };
    log = [s.name];
    showEq();
  }
  function solution() { return (eq.d - eq.b) / (eq.a - eq.c); }

  function eqText(e) {
    function side(xc, k) {
      var t = [];
      if (xc) t.push((xc === 1 ? '' : (xc === -1 ? '−' : M.fmt(xc))) + '<var>x</var>');
      if (k || !t.length) t.push(t.length && k > 0 ? '+ ' + M.fmt(k) : M.fmt(k));
      return t.join(' ');
    }
    return side(e.a, e.b) + ' = ' + side(e.c, e.d);
  }

  function drawScale() {
    var s = M.$('#eq-fig');
    s.innerHTML = '';
    var S = M.svg, cx = 160, beam = 74, armW = 104, plate = 128, foot = 172;
    /* 支架：从横梁中点往下收到底座 */
    S('path', { d: 'M' + (cx - 20) + ' ' + foot + 'h40l-20-' + (foot - beam) + 'z', fill: '#e4e8f0', stroke: '#8795b5', 'stroke-width': 1.3 }, s);
    S('rect', { x: cx - 34, y: foot, width: 68, height: 5, rx: 2.5, fill: '#8795b5' }, s);
    S('line', { x1: cx - armW, y1: beam, x2: cx + armW, y2: beam, stroke: '#5d7cb0', 'stroke-width': 4, 'stroke-linecap': 'round' }, s);
    S('circle', { cx: cx, cy: beam, r: 5.5, fill: '#3a5a93' }, s);
    /* 托盘：吊绳 + 盘面，东西摞在盘面上 */
    function pan(px, xc, k, label) {
      S('line', { x1: px, y1: beam, x2: px, y2: plate, stroke: '#8795b5', 'stroke-width': 1.3 }, s);
      S('rect', { x: px - 50, y: plate, width: 100, height: 5, rx: 2.5, fill: '#8795b5' }, s);
      var i, bx = px - 46, by = plate;
      for (i = 0; i < Math.abs(xc); i++) {
        S('rect', { x: bx + i * 17, y: by - 20, width: 15, height: 20, rx: 3, fill: xc > 0 ? '#9fb4d8' : '#f0d4cb', stroke: '#5d7cb0', 'stroke-width': 1 }, s);
        S('text', { x: bx + i * 17 + 7.5, y: by - 6, 'text-anchor': 'middle', 'font-size': 10, fill: '#2f4473', text: 'x' }, s);
      }
      /* 黄点每行最多 6 个，往上摞，保证不超出盘面 */
      var kx = bx + Math.abs(xc) * 17 + (xc ? 5 : 0);
      for (i = 0; i < Math.min(Math.abs(k), 18); i++) {
        var col = i % 6, row = (i / 6) | 0;
        S('circle', { cx: kx + col * 10 + 5, cy: by - 6 - row * 10.5, r: 4.4, fill: k > 0 ? '#e3c05a' : '#efe0d6', stroke: '#a98c2e', 'stroke-width': .9 }, s);
      }
      if (Math.abs(k) > 18) S('text', { x: kx + 66, y: by - 6, 'font-size': 10, fill: '#8a7330', text: '…' }, s);
      S('text', { x: px, y: plate + 22, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: '#3a5a93', text: label }, s);
    }
    pan(cx - armW + 8, eq.a, eq.b, eqSide(eq.a, eq.b));
    pan(cx + armW - 8, eq.c, eq.d, eqSide(eq.c, eq.d));
    S('text', { x: cx, y: plate + 22, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: '#2f5aa8', text: '=' }, s);
    S('text', { x: cx, y: 16, 'text-anchor': 'middle', 'font-size': 10.5, fill: '#6b7385', text: '蓝块是 1 个 x，黄点是 1' }, s);
  }
  function eqSide(xc, k) {
    var t = [];
    if (xc) t.push((xc === 1 ? '' : (xc === -1 ? '−' : xc)) + 'x');
    if (k) t.push((k > 0 && t.length ? '+' : '') + k);
    if (!t.length) t.push('0');
    return t.join(' ');
  }

  function showEq() {
    drawScale();
    M.$('#eq-now').innerHTML = eqText(eq);
    var solved = (eq.a === 1 && eq.c === 0 && eq.b === 0);
    M.$('#eq-x').innerHTML = eq.a === eq.c ? '无法确定' : M.fmt(solution());
    M.$('#eq-state').textContent = solved ? '已解出' : '还要继续';
    var ul = M.$('#eq-log');
    ul.innerHTML = '';
    log.forEach(function (t, i) {
      M.html('li', { html: (i === 0 ? '原方程：' : '') + t }, ul);
    });
    M.$('#eq-tip').innerHTML = solved
      ? '✓ 解出来了：<b>x = ' + M.fmt(eq.d) + '</b>。回头看每一步，都是「两边同时做同样的事」，这就是<b>等式的基本性质</b>。'
      : '目标是把天平变成「左边只剩 1 个 x，右边只剩数字」。每一步都必须<b>两边同时</b>做，天平才不会歪。';
    /* 按钮可用性：没有可移的项时禁用 */
    M.$('#op-movex').disabled = !eq.c;
    M.$('#op-movec').disabled = !eq.b;
    M.$('#op-div').disabled = eq.a === 1 || eq.a === 0 || eq.b !== 0 || eq.c !== 0;
    M.setState({ q: pick });
  }

  function step(txt) { log.push(txt); showEq(); }

  /* ---------- 模型二：五步解法 ---------- */
  /* (2x+1)/3 − (x−1)/2 = 1 的标准五步 */
  var STEPS = [
    ['原方程', '<span class="frac"><i>2<var>x</var>+1</i><i>3</i></span> − <span class="frac"><i><var>x</var>−1</i><i>2</i></span> = 1', '分母是 3 和 2，最小公倍数 6。'],
    ['① 去分母', '2(2<var>x</var>+1) − 3(<var>x</var>−1) = 6', '两边同乘最小公倍数 6，<b>每一项都要乘</b>——右边那个 1 最容易被漏掉；分子是多项式时还要加括号。'],
    ['② 去括号', '4<var>x</var> + 2 − 3<var>x</var> + 3 = 6', '−3(<var>x</var>−1) = −3<var>x</var> + 3，括号前是负号时<b>每一项都要变号</b>。'],
    ['③ 移项', '4<var>x</var> − 3<var>x</var> = 6 − 2 − 3', '把含 <var>x</var> 的项移到左边，常数移到右边，<b>移项要变号</b>。'],
    ['④ 合并同类项', '<var>x</var> = 1', '左边 4<var>x</var> − 3<var>x</var> = <var>x</var>，右边 6 − 2 − 3 = 1。'],
    ['⑤ 系数化为 1', '<var>x</var> = 1', '这里 <var>x</var> 的系数已经是 1，不用再除。检验：把 1 代回原方程，左边 = 1 − 0 = 1 = 右边 ✓。']
  ];
  var sIdx = 0;

  function showSteps() {
    var bar = M.$('#sp-steps');
    bar.innerHTML = '';
    STEPS.forEach(function (s, i) {
      var sp = M.html('span', { text: s[0], role: 'button', tabindex: '0', class: i === sIdx ? 'on' : (i < sIdx ? 'done' : '') }, bar);
      sp.addEventListener('click', function () { sIdx = i; showSteps(); });
      sp.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sIdx = i; showSteps(); } });
      if (i < STEPS.length - 1) M.html('i', { text: '›' }, bar);
    });
    M.$('#sp-eq').innerHTML = STEPS[sIdx][1];
    M.$('#sp-why').innerHTML = STEPS[sIdx][2];
    M.$('#sp-name').textContent = STEPS[sIdx][0];
  }

  /* ---------- 模型三：应用题建模 ---------- */
  var price = M.num(st.p, 300, 100, 800), disc = M.num(st.d, 8, 5, 9);

  function showApp() {
    /* 打 d 折后便宜了多少：原价 price，折后 price·d/10 */
    var pay = price * disc / 10, save = price - pay;
    M.$('#ap-pay').textContent = M.fmt(pay, 2) + ' 元';
    M.$('#ap-save').textContent = M.fmt(save, 2) + ' 元';
    M.$('#ap-eq').innerHTML = '设原价 <var>x</var> 元，打 ' + M.fmt(disc) + ' 折后付 <b>' + M.fmt(pay, 2) + '</b> 元：<br>' +
      '<span class="formula" style="margin:6px 0">' + M.frac(disc, 10) + ' <var>x</var> = ' + M.fmt(pay, 2) +
      '<span class="why">两边同除 ' + M.frac(disc, 10) + '，得 x = ' + M.fmt(price, 2) + '</span></span>';
    M.$('#ap-text').innerHTML = '打 <b>' + M.fmt(disc) + ' 折</b>就是按原价的 <b>' + M.fmt(disc * 10) + '%</b> 付钱，不是便宜 ' + M.fmt(disc * 10) + '%。' +
      '这里便宜了 ' + M.fmt(save, 2) + ' 元，占原价 ' + M.fmt(save / price * 100, 1) + '%。';
    M.setState({ q: pick, p: price, d: disc });
  }

  /* ---------- 装配 ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    M.chips(M.$('#eq-chips'), START.map(function (s, i) { return { label: s.name, value: String(i) }; }), String(pick), function (v) { pick = +v; reset(); });
    M.$('#op-movex').addEventListener('click', function () {
      var k = eq.c;
      eq.a -= k; eq.c -= k;
      step('两边同时减 ' + (k === 1 ? '' : k) + 'x　→　' + eqText(eq));
    });
    M.$('#op-movec').addEventListener('click', function () {
      var k = eq.b;
      eq.b -= k; eq.d -= k;
      step('两边同时' + (k > 0 ? '减 ' + k : '加 ' + (-k)) + '　→　' + eqText(eq));
    });
    M.$('#op-div').addEventListener('click', function () {
      var k = eq.a;
      eq.a = 1; eq.d = eq.d / k;
      step('两边同时除以 ' + k + '　→　' + eqText(eq));
    });
    M.$('#op-reset').addEventListener('click', reset);
    reset();

    showSteps();
    M.bindRange(M.$('#ap-price'), function (v) { price = v; showApp(); })();
    M.bindRange(M.$('#ap-disc'), function (v) { disc = v; showApp(); })();

    M.quiz([
      {
        level: 'base',
        title: '把天平上的方程解到底',
        desc: '用「两边同时…」三个按钮，把方程变成 <var>x</var> = 某个数。',
        label: '在天平上操作',
        button: '检查解出来了吗',
        check: function () {
          if (eq.a === 1 && eq.c === 0 && eq.b === 0) {
            return { ok: true, msg: '解是 <b>x = ' + M.fmt(eq.d) + '</b>，一共用了 ' + (log.length - 1) + ' 步。把它代回原方程两边都相等，说明没算错。' };
          }
          return { ok: false, msg: '现在是 ' + eqText(eq) + '，还没变成「x = 数字」。先把右边的 x 项移走，再处理常数，最后把系数化成 1。' };
        }
      },
      {
        level: 'base',
        title: '解方程 2x + 3 = 11，x 等于？',
        desc: '先移项，再把系数化为 1。',
        options: ['4', '7', '5.5', '−4'],
        answer: 0,
        hint: '两边同减 3，再同除以 2。',
        explain: '2x = 11 − 3 = 8，x = <b>4</b>。检验：2×4 + 3 = 11 ✓。解完代回原方程是最可靠的自查方式。'
      },
      {
        level: 'base',
        title: '下列哪个是一元一次方程？',
        desc: '一元：只有一个未知数；一次：未知数的最高次数是 1。',
        options: ['2x + 1 = 5', 'x² + 1 = 5', '2x + y = 5', '1/x = 5'],
        answer: 0,
        hint: '逐个看未知数的个数和次数。',
        explain: '只有 <b>2x + 1 = 5</b> 满足「一个未知数 + 最高次数 1」。x² 是二次，2x + y 是二元，1/x 的未知数在分母上是分式方程。'
      },
      {
        level: 'mid',
        title: '去分母时，最容易漏掉哪一项？',
        desc: '看上面五步解法的第 ① 步。',
        options: ['等号右边不含分母的常数项', '分子里的第一项', '分母的最小公倍数', '含 <var>x</var> 的项'],
        answer: 0,
        hint: '两边同乘一个数，是<b>每一项</b>都要乘。',
        explain: '右边的 1 也必须乘 6 变成 6。漏乘不含分母的项是去分母最常见的错误；另外分子是多项式时要记得加括号。'
      },
      {
        level: 'mid',
        title: '一件衣服打 8 折后 240 元，原价多少？',
        desc: '可以用上面的滑块试出来，也可以直接列方程。',
        options: ['300 元', '288 元', '264 元', '192 元'],
        answer: 0,
        hint: '设原价 x，列 0.8x = 240。',
        explain: '0.8<var>x</var> = 240，两边同除 0.8 得 <var>x</var> = 300 元。常见错误是算成 240 × 1.2 = 288——打折不是加回同样的百分比。'
      },
      {
        level: 'mid',
        title: '由 3x − 2 = x + 6 移项得到？',
        desc: '把含 x 的项移到左边，常数移到右边。',
        options: ['3x − x = 6 + 2', '3x + x = 6 − 2', '3x − x = 6 − 2', '3x + x = 6 + 2'],
        answer: 0,
        hint: '移项要变号：−2 移过去变 +2，x 移过来变 −x。',
        explain: '<b>3x − x = 6 + 2</b>。移项的本质是两边同加减，所以<b>跨过等号就要变号</b>。算得 2x = 8，x = 4。'
      },
      {
        level: 'mid',
        title: '某商品打 9 折后售价 180 元，原价是多少？',
        desc: '打 9 折就是按原价的 90% 卖。',
        options: ['200 元', '198 元', '162 元', '190 元'],
        answer: 0,
        hint: '设原价 x，列 0.9x = 180。',
        explain: '0.9x = 180，x = <b>200</b> 元。验算：200 × 0.9 = 180 ✓。'
      },
      {
        level: 'trap',
        title: '解 (x+1)/2 − (x−1)/3 = 1 时，去分母后正确的是？',
        desc: '两边同乘 6，注意右边的 1 也要乘。',
        options: ['3(x+1) − 2(x−1) = 6', '3(x+1) − 2(x−1) = 1', '3x+1 − 2x−1 = 6', '2(x+1) − 3(x−1) = 6'],
        answer: 0,
        hint: '最小公倍数是 6；每一项都要乘，分子是多项式要加括号。',
        explain: '两边同乘 6：<b>3(x+1) − 2(x−1) = 6</b>。两个高频错误：① 右边的 1 忘了乘变成 1；② 分子不加括号。两个坑都要躲开。'
      }
    ]);
  });
})();
