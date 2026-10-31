/* 第 25 课 · 图形的相似（北师大版九上第三章） */
(function () {
  'use strict';
  var M = window.Mx, st = M.getState();

  /* ---------- 模型一：相似比与周长、面积的关系 ---------- */
  var kk = M.num(st.k, 1.6, 1, 3);

  function showRatio() {
    var s = M.$('#rt-fig');
    s.innerHTML = '';
    var S = M.svg;
    var base = 44, h = 34;
    function tri(ox, oy, sc, col, fill) {
      var p = [[ox, oy], [ox + base * sc, oy], [ox + base * sc * 0.42, oy - h * sc]];
      S('polygon', { points: p.map(function (q) { return M.fmt(q[0], 1) + ',' + M.fmt(q[1], 1); }).join(' '), fill: fill, stroke: col, 'stroke-width': 2, 'stroke-linejoin': 'round' }, s);
      return p;
    }
    tri(20, 150, 1, '#3a5a93', '#eaeff8');
    tri(110, 150, kk, '#c2603f', '#f7e9e3');
    S('text', { x: 20 + base / 2, y: 166, 'font-size': 10, fill: '#3a5a93', text: '原图' }, s);
    S('text', { x: 110 + base * kk / 2, y: 166, 'font-size': 10, fill: '#a4492b', text: '放大 ' + M.fmt(kk, 2) + ' 倍' }, s);

    var per = kk, ar = kk * kk;
    M.$('#rt-k').textContent = M.fmt(kk, 2);
    M.$('#rt-per').textContent = M.fmt(per, 2) + ' 倍';
    M.$('#rt-area').textContent = M.fmt(ar, 2) + ' 倍';
    M.$('#rt-text').innerHTML = '相似比是 <b>' + M.fmt(kk, 2) + '</b> 时：<br>' +
      '对应边、周长、对应<b>高</b>、对应<b>中线</b>、对应<b>角平分线</b>的比都等于相似比 <b>' + M.fmt(kk, 2) + '</b>；<br>' +
      '但<b>面积比等于相似比的平方</b> = ' + M.fmt(kk, 2) + '² = <b>' + M.fmt(ar, 2) + '</b>。<br>' +
      '边长放大 ' + M.fmt(kk, 2) + ' 倍，面积却变成了 ' + M.fmt(ar, 2) + ' 倍——这是最容易算错的地方。';
    M.$('#rt-note').innerHTML = '举例：两个相似三角形相似比 1 : 3，周长比就是 1 : 3，面积比是 <b>1 : 9</b>。';
    M.setState({ k: kk, j: judge });
  }

  /* ---------- 模型二：判定两个三角形相似 ---------- */
  var JUDGE = [
    { t: '两角分别相等（AA）', ok: true, why: '两个角相等，第三个角也相等，形状就定了。这是<b>最常用</b>的判定。' },
    { t: '两边成比例且夹角相等（SAS）', ok: true, why: '注意角必须是这两条边的<b>夹角</b>。' },
    { t: '三边成比例（SSS）', ok: true, why: '三边对应成比例，形状唯一确定。' },
    { t: '两边成比例，其中一边的对角相等', ok: false, why: '和全等里的 SSA 一样，<b>不能判定</b>——可能画出两个不同的三角形。' },
    { t: '两个角都是 60°', ok: true, why: '两角相等即可（AA），其实它们都是等边三角形，一定相似。' },
    { t: '都是直角三角形', ok: false, why: '只有一个直角相等不够，还需要另一对锐角相等或两直角边成比例。' },
    { t: '都是等腰三角形', ok: false, why: '等腰只是说两腰相等，顶角可以完全不同，<b>不一定相似</b>。' },
    { t: '都是等边三角形', ok: true, why: '每个角都是 60°，一定相似（正方形之间也一定相似）。' }
  ];
  var judge = 0;

  function showJudge() {
    var j = JUDGE[judge];
    var s = M.$('#jd-fig');
    s.innerHTML = '';
    var S = M.svg;
    function tri(ox, oy, w, hh, col, fill) {
      S('polygon', { points: [[ox, oy], [ox + w, oy], [ox + w * 0.38, oy - hh]].map(function (q) { return M.fmt(q[0], 1) + ',' + M.fmt(q[1], 1); }).join(' '), fill: fill, stroke: col, 'stroke-width': 2, 'stroke-linejoin': 'round' }, s);
    }
    if (j.ok) {
      tri(26, 120, 60, 46, '#3a5a93', '#eaeff8');
      tri(130, 120, 90, 69, '#3f7d6a', '#e8f0e6');
      S('text', { x: 120, y: 86, 'font-size': 15, fill: '#2f6a4a', text: '∽' }, s);
      S('text', { x: 120, y: 142, 'text-anchor': 'middle', 'font-size': 10.5, fill: '#2f6a4a', text: '形状相同，大小可不同' }, s);
    } else {
      tri(26, 120, 70, 40, '#c2603f', '#f7e9e3');
      tri(140, 120, 70, 76, '#c2603f', '#f7e9e3');
      S('text', { x: 120, y: 86, 'font-size': 15, fill: '#a4422c', text: '≁' }, s);
      S('text', { x: 120, y: 142, 'text-anchor': 'middle', 'font-size': 10.5, fill: '#a4422c', text: '满足条件但形状不同' }, s);
    }
    M.$('#jd-cond').textContent = j.t;
    M.$('#jd-ok').innerHTML = j.ok ? '<b style="color:#2f6a4a">一定相似 ✓</b>' : '<b style="color:#a4422c">不一定相似 ✗</b>';
    M.$('#jd-why').innerHTML = j.why;
    M.setState({ k: kk, j: judge });
  }

  /* ---------- 模型三：相似测高 ---------- */
  var stick = M.num(st.s, 1.5, 0.8, 3), shadow = M.num(st.d, 2, 1, 5);
  var TREE_SHADOW = 12;

  function showMeasure() {
    var s = M.$('#ms-fig');
    s.innerHTML = '';
    var S = M.svg, k = 13, oy = 160, ox = 20;
    var treeH = stick / shadow * TREE_SHADOW;
    /* 标杆 */
    S('line', { x1: ox + 20, y1: oy, x2: ox + 20, y2: oy - stick * k * 2.4, stroke: '#3a5a93', 'stroke-width': 4, 'stroke-linecap': 'round' }, s);
    S('line', { x1: ox + 20, y1: oy, x2: ox + 20 + shadow * k, y2: oy, stroke: '#8795b5', 'stroke-width': 5, opacity: .6 }, s);
    S('line', { x1: ox + 20, y1: oy - stick * k * 2.4, x2: ox + 20 + shadow * k, y2: oy, stroke: '#e0b23f', 'stroke-width': 1.3, 'stroke-dasharray': '4 3' }, s);
    S('text', { x: ox + 14, y: oy - stick * k * 1.2, 'text-anchor': 'end', 'font-size': 10, fill: '#3a5a93', text: M.fmt(stick, 1) + 'm' }, s);
    S('text', { x: ox + 20 + shadow * k / 2, y: oy + 14, 'text-anchor': 'middle', 'font-size': 9.5, fill: '#6b7385', text: M.fmt(shadow, 1) + 'm' }, s);
    /* 树 */
    var tx = ox + 150;
    S('line', { x1: tx, y1: oy, x2: tx, y2: oy - Math.min(treeH, 9) * k * 2.4 / 2.2, stroke: '#5f8a5a', 'stroke-width': 7, 'stroke-linecap': 'round' }, s);
    S('line', { x1: tx, y1: oy, x2: tx + TREE_SHADOW * k / 2.2, y2: oy, stroke: '#8795b5', 'stroke-width': 5, opacity: .6 }, s);
    S('line', { x1: tx, y1: oy - Math.min(treeH, 9) * k * 2.4 / 2.2, x2: tx + TREE_SHADOW * k / 2.2, y2: oy, stroke: '#e0b23f', 'stroke-width': 1.3, 'stroke-dasharray': '4 3' }, s);
    S('text', { x: tx - 8, y: oy - 40, 'text-anchor': 'end', 'font-size': 10.5, 'font-weight': 700, fill: '#3d6b38', text: '?' }, s);
    S('text', { x: tx + TREE_SHADOW * k / 4.4, y: oy + 14, 'text-anchor': 'middle', 'font-size': 9.5, fill: '#6b7385', text: TREE_SHADOW + 'm' }, s);
    S('text', { x: 250, y: 28, 'text-anchor': 'end', 'font-size': 9.5, fill: '#8a7330', text: '同一时刻的阳光' }, s);

    M.$('#ms-h').textContent = M.fmt(treeH, 2) + ' m';
    M.$('#ms-eq').innerHTML = '<span class="frac"><i>标杆高</i><i>标杆影长</i></span> = <span class="frac"><i>树高</i><i>树影长</i></span>　→　' +
      '<span class="frac"><i>' + M.fmt(stick, 1) + '</i><i>' + M.fmt(shadow, 1) + '</i></span> = <span class="frac"><i>h</i><i>' + TREE_SHADOW + '</i></span>　→　h = <b>' + M.fmt(treeH, 2) + '</b> m';
    M.$('#ms-text').innerHTML = '同一时刻阳光的方向相同，标杆和树与各自的影子构成<b>两个相似三角形</b>（两角分别相等）。' +
      '相似三角形对应边成比例，于是量出标杆高、标杆影长和树影长，就能算出够不着的树高。' +
      '这就是第 1 课说的「<b>平行投影才能测高</b>」背后的数学原理。';
    M.setState({ k: kk, s: stick, d: shadow });
  }

  document.addEventListener('DOMContentLoaded', function () {
    M.bindRange(M.$('#rt-range'), function (v) { kk = v; showRatio(); })();
    M.chips(M.$('#jd-chips'), JUDGE.map(function (j, i) { return { label: '第 ' + (i + 1) + ' 组', value: String(i) }; }), '0', function (v) { judge = +v; showJudge(); });
    showJudge();
    M.bindRange(M.$('#ms-stick'), function (v) { stick = v; showMeasure(); })();
    M.bindRange(M.$('#ms-shadow'), function (v) { shadow = v; showMeasure(); })();

    M.quiz([
      {
        level: 'base',
        title: '相似比调到 3，看面积变几倍',
        desc: '拖动相似比滑块到 3。',
        label: '在相似比模型里调滑块',
        button: '检查相似比',
        check: function () {
          if (Math.abs(kk - 3) > 1e-9) return { ok: false, msg: '现在相似比是 ' + M.fmt(kk, 2) + '，调到 3。' };
          return { ok: true, msg: '周长比 3 : 1，<b>面积比 9 : 1</b>。记住：面积比是相似比的<b>平方</b>，体积比则是立方。' };
        }
      },
      {
        level: 'base',
        title: '两个三角形相似，对应角有什么关系？',
        desc: '相似就是形状相同。',
        options: ['对应角相等', '对应角互补', '对应角都是 60°', '不一定'],
        answer: 0,
        hint: '形状相同意味着角度一样。',
        explain: '相似三角形<b>对应角相等、对应边成比例</b>。这是相似的定义，也是做题时最常用的两个结论。'
      },
      {
        level: 'base',
        title: '下面哪两个图形一定相似？',
        desc: '想想哪些图形的形状是固定的。',
        options: ['任意两个等边三角形', '任意两个等腰三角形', '任意两个矩形', '任意两个菱形'],
        answer: 0,
        hint: '哪种图形的角度完全固定？',
        explain: '等边三角形每个角都是 60°，<b>任意两个等边三角形一定相似</b>。等腰三角形顶角可以不同，矩形长宽比可以不同，菱形角度可以不同，都<b>不一定</b>相似。'
      },
      {
        level: 'mid',
        title: '两个三角形相似比 2 : 3，面积比是多少？',
        desc: '面积比是相似比的平方。',
        options: ['4 : 9', '2 : 3', '8 : 27', '√2 : √3'],
        answer: 0,
        hint: '把 2:3 各自平方。',
        explain: '面积比 = (2:3)² = <b>4 : 9</b>。常见错误是直接写 2:3。如果是立体图形，体积比才是 8:27。'
      },
      {
        level: 'mid',
        title: '两个等腰三角形一定相似吗？',
        desc: '可以在上面点开第 7 组看看。',
        options: ['不一定，顶角可能不同', '一定相似', '只有等腰直角三角形才相似', '底边相等时才相似'],
        answer: 0,
        hint: '等腰只保证两腰相等，没限制角的大小。',
        explain: '一个顶角 30°、一个顶角 120°，都是等腰三角形但形状完全不同。<b>等边</b>三角形之间才一定相似（每个角都是 60°）。'
      },
      {
        level: 'mid',
        title: '两个相似三角形相似比是 1 : 3，周长比是？',
        desc: '周长比等于相似比。',
        options: ['1 : 3', '1 : 9', '1 : 6', '3 : 1'],
        answer: 0,
        hint: '周长是长度，和边长同步变化。',
        explain: '周长比 = 相似比 = <b>1 : 3</b>。对应高、对应中线、对应角平分线的比也都等于相似比。'
      },
      {
        level: 'mid',
        title: '判定两个三角形相似，最常用的条件是？',
        desc: '哪个条件要求最少？',
        options: ['两角分别相等（AA）', '三边相等', '两边相等', '面积相等'],
        answer: 0,
        hint: '两个角定了，第三个角也就定了。',
        explain: '<b>AA（两角分别相等）</b>最常用，因为只需找两组角。另外还有 SAS（两边成比例且夹角相等）和 SSS（三边成比例）。'
      },
      {
        level: 'trap',
        title: '两个相似三角形相似比 2 : 3，面积比是？',
        desc: '上面把相似比调一调，对比周长和面积的变化。',
        options: ['4 : 9', '2 : 3', '8 : 27', '6 : 9'],
        answer: 0,
        hint: '面积比是相似比的平方。',
        explain: '面积比 = 相似比的<b>平方</b> = (2:3)² = <b>4 : 9</b>。直接写 2:3 是最常见的错误。反过来已知面积比求周长比要<b>开方</b>。'
      }
    ]);
  });
})();
