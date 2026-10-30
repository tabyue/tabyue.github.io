/* 第 17 课 · 二元一次方程组（北师大版八上第五章） */
(function () {
  'use strict';
  var M = window.Mx, st = M.getState();

  /* ---------- 模型一：两条直线的交点就是方程组的解 ----------
     方程组： a1x + b1y = c1
             a2x + b2y = c2 */
  var E = {
    a1: M.num(st.a1, 1, -4, 4), b1: M.num(st.b1, 1, -4, 4), c1: M.num(st.c1, 5, -9, 9),
    a2: M.num(st.a2, 2, -4, 4), b2: M.num(st.b2, -1, -4, 4), c2: M.num(st.c2, 1, -9, 9)
  };
  var ax = null;

  function showSys() {
    ax = M.axes(M.$('#sy-fig'), {
      xmin: -7, xmax: 7, ymin: -7, ymax: 7, xstep: 1, ystep: 1,
      labelStep: 2, ylabelStep: 2, left: 28, right: 10, top: 10, bottom: 22
    });
    var S = M.svg, L = ax.layer;
    function draw(a, b, c, color) {
      if (b !== 0) {
        S('path', { d: M.curve(ax, function (x) { return (c - a * x) / b; }), fill: 'none', stroke: color, 'stroke-width': 2.4 }, L);
      } else if (a !== 0) {
        S('line', { x1: ax.X(c / a), y1: ax.Y(ax.ymin), x2: ax.X(c / a), y2: ax.Y(ax.ymax), stroke: color, 'stroke-width': 2.4 }, L);
      }
    }
    draw(E.a1, E.b1, E.c1, '#2f5aa8');
    draw(E.a2, E.b2, E.c2, '#c2603f');

    /* 用行列式判断解的情况 */
    var D = E.a1 * E.b2 - E.a2 * E.b1;
    var Dx = E.c1 * E.b2 - E.c2 * E.b1, Dy = E.a1 * E.c2 - E.a2 * E.c1;
    var kind, sol = null;
    if (D !== 0) { kind = 'one'; sol = [Dx / D, Dy / D]; }
    else if (Dx === 0 && Dy === 0) kind = 'many';
    else kind = 'none';

    if (sol) {
      S('circle', { cx: ax.X(sol[0]), cy: ax.Y(sol[1]), r: 6, fill: '#3f7d6a', stroke: '#fff', 'stroke-width': 2 }, L);
      S('text', { x: ax.X(sol[0]) + 9, y: ax.Y(sol[1]) - 8, 'font-size': 11, 'font-weight': 700, fill: '#2f6a57', text: '(' + M.fmt(sol[0], 2) + ', ' + M.fmt(sol[1], 2) + ')' }, L);
    }
    M.$('#sy-eq1').innerHTML = eqText(E.a1, E.b1, E.c1);
    M.$('#sy-eq2').innerHTML = eqText(E.a2, E.b2, E.c2);
    M.$('#sy-sol').innerHTML = kind === 'one' ? 'x = <b>' + M.fmt(sol[0], 3) + '</b>，y = <b>' + M.fmt(sol[1], 3) + '</b>'
      : kind === 'many' ? '有<b>无数组</b>解' : '<b>无解</b>';
    M.$('#sy-kind').textContent = kind === 'one' ? '两条直线相交' : (kind === 'many' ? '两条直线重合' : '两条直线平行');
    M.$('#sy-text').innerHTML = kind === 'one'
      ? '两条直线只有<b>一个交点</b>，交点坐标就是方程组的唯一解。把 x、y 代回两个方程，等号都成立。'
      : kind === 'many'
      ? '两个方程其实是<b>同一条直线</b>（第二个方程是第一个的倍数），直线上每个点都是解，所以有无数组解。'
      : '两条直线<b>平行</b>，永远不相交，所以方程组<b>无解</b>。这时两式的 x、y 系数成比例，但常数项不成比例。';
    /* 代入消元的步骤 */
    if (kind === 'one' && E.b1 !== 0) {
      M.$('#sy-steps').innerHTML =
        '<span class="step">① 由①式解出 y：y = ' + fracText(E.c1, E.b1) + ' − ' + fracText(E.a1, E.b1) + 'x</span>' +
        '<span class="step">② 代入②式，只剩一个未知数 x</span>' +
        '<span class="step">③ 解得 x = ' + M.fmt(sol[0], 3) + '，回代求出 y = ' + M.fmt(sol[1], 3) + '</span>' +
        '<span class="why">这叫<b>代入消元法</b>；也可以把两式相加减消去一个未知数，那叫加减消元法。核心都是「把二元变一元」。</span>';
    } else {
      M.$('#sy-steps').innerHTML = '<span class="step">这种情况没有唯一解，消元后会得到 0 = 0（无数解）或 0 = 非零数（无解）。</span>';
    }
    M.setState({ a1: E.a1, b1: E.b1, c1: E.c1, a2: E.a2, b2: E.b2, c2: E.c2, h: heads });
  }
  function eqText(a, b, c) {
    var t = [];
    if (a) t.push((a === 1 ? '' : (a === -1 ? '−' : M.fmt(a))) + 'x');
    if (b) t.push((t.length ? (b > 0 ? ' + ' : ' − ') : (b < 0 ? '−' : '')) + (Math.abs(b) === 1 ? '' : M.fmt(Math.abs(b))) + 'y');
    if (!t.length) t.push('0');
    return t.join('') + ' = ' + M.fmt(c);
  }
  function fracText(p, q) { return q === 1 ? M.fmt(p) : (p % q === 0 ? M.fmt(p / q) : M.frac(p, q)); }

  /* ---------- 模型二：鸡兔同笼 ---------- */
  var heads = M.num(st.h, 35, 5, 60), feet = M.num(st.f, 94, 10, 240);

  function showChick() {
    /* x 只鸡 + y 只兔：x + y = heads，2x + 4y = feet */
    var y = (feet - 2 * heads) / 2, x = heads - y;
    var okk = Number.isInteger(x) && Number.isInteger(y) && x >= 0 && y >= 0;
    var s = M.$('#ck-fig');
    s.innerHTML = '';
    var S = M.svg;
    if (okk) {
      var shown = Math.min(x, 20), shownY = Math.min(y, 20), i;
      for (i = 0; i < shown; i++) {
        S('text', { x: 16 + (i % 10) * 29, y: 34 + ((i / 10) | 0) * 32, 'font-size': 20, text: '🐔' }, s);
      }
      for (i = 0; i < shownY; i++) {
        S('text', { x: 16 + (i % 10) * 29, y: 104 + ((i / 10) | 0) * 32, 'font-size': 20, text: '🐰' }, s);
      }
      S('text', { x: 16, y: 150, 'font-size': 11, fill: '#4a5568', text: '鸡 ' + x + ' 只（' + (x > 20 ? '只画了 20 只' : '全部') + '），兔 ' + y + ' 只' }, s);
    } else {
      S('text', { x: 16, y: 60, 'font-size': 12, fill: '#a4422c', text: '这组头数和脚数凑不出整数答案。' }, s);
      S('text', { x: 16, y: 84, 'font-size': 11, fill: '#6b7385', text: '脚数必须是偶数，且在 2×头数 和 4×头数 之间。' }, s);
    }
    M.$('#ck-x').textContent = okk ? x + ' 只' : '—';
    M.$('#ck-y').textContent = okk ? y + ' 只' : '—';
    M.$('#ck-eq').innerHTML = '设鸡 x 只、兔 y 只：<br>' +
      '<span class="formula" style="margin:6px 0;text-align:left">' +
      '<span class="step">① x + y = ' + heads + '　（头）</span>' +
      '<span class="step">② 2x + 4y = ' + feet + '　（脚）</span>' +
      (okk ? '<span class="step">①×2 得 2x + 2y = ' + (2 * heads) + '，与②相减：2y = ' + (feet - 2 * heads) + '，y = ' + y + '</span>' : '') +
      '</span>';
    M.$('#ck-text').innerHTML = okk
      ? '用<b>加减消元</b>最快：把①式乘 2 让 x 的系数相同，再两式相减，x 就被消掉了。' +
        '检验：' + x + ' + ' + y + ' = ' + heads + ' ✓，' + (2 * x) + ' + ' + (4 * y) + ' = ' + feet + ' ✓。'
      : '脚数要是偶数，而且必须在 <b>' + (2 * heads) + '</b>（全是鸡）到 <b>' + (4 * heads) + '</b>（全是兔）之间，否则无解。';
    M.setState({ h: heads, f: feet });
  }

  document.addEventListener('DOMContentLoaded', function () {
    ['a1', 'b1', 'c1', 'a2', 'b2', 'c2'].forEach(function (key) {
      M.bindRange(M.$('#sy-' + key), function (v) { E[key] = v; showSys(); });
    });
    showSys();
    M.$('#sy-parallel').addEventListener('click', function () {
      /* 造一组平行：系数成比例、常数项不成比例 */
      E.a1 = 1; E.b1 = 1; E.c1 = 3; E.a2 = 2; E.b2 = 2; E.c2 = 1;
      ['a1', 'b1', 'c1', 'a2', 'b2', 'c2'].forEach(function (key) {
        var el = M.$('#sy-' + key); el.value = E[key]; M.paintRange(el);
      });
      showSys();
    });
    M.bindRange(M.$('#ck-head'), function (v) { heads = v; showChick(); })();
    M.bindRange(M.$('#ck-foot'), function (v) { feet = v; showChick(); })();

    M.quiz([
      {
        title: '造一个无解的方程组',
        desc: '点「变成平行」，或者自己把两条直线调成平行。',
        label: '在方程组模型里操作',
        button: '检查解的情况',
        check: function () {
          var D = E.a1 * E.b2 - E.a2 * E.b1;
          var Dx = E.c1 * E.b2 - E.c2 * E.b1, Dy = E.a1 * E.c2 - E.a2 * E.c1;
          if (D !== 0) return { ok: false, msg: '现在两条直线还相交，有唯一解。要让 x、y 的系数<b>成比例</b>（比如 1、1 和 2、2）。' };
          if (Dx === 0 && Dy === 0) return { ok: false, msg: '现在两条直线<b>重合</b>了，有无数组解。常数项不要也成同样的比例。' };
          return { ok: true, msg: '两条直线平行，方程组<b>无解</b>。判别方法：x、y 系数成比例但常数项不成比例。' };
        }
      },
      {
        title: '笼子里有 35 个头、94 只脚，兔有几只？',
        desc: '可以在上面把滑块调成 35 和 94。',
        options: ['12 只', '23 只', '17 只', '18 只'],
        answer: 0,
        hint: '设鸡 x 兔 y，列 x+y=35、2x+4y=94。',
        explain: '①×2 得 2x+2y=70，与②相减得 2y=24，y=12（兔），x=23（鸡）。验算：12+23=35 ✓，48+46=94 ✓。'
      },
      {
        title: '方程组有唯一解，对应图象上的什么？',
        desc: '想想两条直线的位置关系。',
        options: ['两条直线相交于一点', '两条直线平行', '两条直线重合', '只有一条直线'],
        answer: 0,
        hint: '解就是同时满足两个方程的点。',
        explain: '唯一解 ⟺ <b>相交</b>于一点；无解 ⟺ <b>平行</b>；无数组解 ⟺ <b>重合</b>。把方程组和图象对应起来，很多题一眼就能判断。'
      }
    ]);
  });
})();
