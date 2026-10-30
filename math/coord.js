/* 第 15 课 · 位置与坐标（北师大版八上第三章） */
(function () {
  'use strict';
  var M = window.Mx, st = M.getState();

  /* ---------- 模型一：拖一个点，看它的坐标与对称点 ---------- */
  var px = M.num(st.x, 3, -8, 8), py = M.num(st.y, 2, -6, 6);
  var ax = null;

  function initAxes() {
    ax = M.axes(M.$('#pt-fig'), {
      xmin: -8, xmax: 8, ymin: -6, ymax: 6, xstep: 1, ystep: 1,
      labelStep: 2, ylabelStep: 2, left: 26, right: 10, top: 12, bottom: 22
    });
    var el = ax.el;
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'application');
    el.setAttribute('aria-label', '平面直角坐标系：拖动点 P');
    var down = false;
    function go(e) {
      var p = M.svgPoint(el, e);
      px = M.clamp(Math.round(ax.ix(p.x)), -8, 8);
      py = M.clamp(Math.round(ax.iy(p.y)), -6, 6);
      show(); e.preventDefault();
    }
    el.addEventListener('pointerdown', function (e) { down = true; try { el.setPointerCapture(e.pointerId); } catch (err) {} go(e); });
    el.addEventListener('pointermove', function (e) { if (down) go(e); });
    el.addEventListener('pointerup', function () { down = false; });
    el.addEventListener('keydown', function (e) {
      var d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
      if (!d) return;
      e.preventDefault();
      px = M.clamp(px + d[0], -8, 8); py = M.clamp(py + d[1], -6, 6);
      show();
    });
  }

  function show() {
    var S = M.svg, L = ax.layer;
    L.innerHTML = '';
    /* 到两轴的垂线 */
    S('line', { x1: ax.X(px), y1: ax.Y(py), x2: ax.X(px), y2: ax.Y(0), stroke: '#c2603f', 'stroke-width': 1.2, 'stroke-dasharray': '4 3' }, L);
    S('line', { x1: ax.X(px), y1: ax.Y(py), x2: ax.X(0), y2: ax.Y(py), stroke: '#c2603f', 'stroke-width': 1.2, 'stroke-dasharray': '4 3' }, L);
    /* 三个对称点 */
    var syms = [[px, -py, '#3f7d6a', '关于 x 轴'], [-px, py, '#8d86c0', '关于 y 轴'], [-px, -py, '#d4a373', '关于原点']];
    if (M.$('#pt-sym').checked) {
      syms.forEach(function (q) {
        S('circle', { cx: ax.X(q[0]), cy: ax.Y(q[1]), r: 5, fill: q[2], opacity: .85 }, L);
        S('text', { x: ax.X(q[0]) + 7, y: ax.Y(q[1]) - 6, 'font-size': 9.5, fill: q[2], text: '(' + q[0] + ', ' + q[1] + ')' }, L);
      });
    }
    S('circle', { cx: ax.X(px), cy: ax.Y(py), r: 6.5, fill: '#c2603f', stroke: '#fff', 'stroke-width': 2 }, L);
    S('text', { x: ax.X(px) + 9, y: ax.Y(py) - 8, 'font-size': 12, 'font-weight': 700, fill: '#a4492b', text: 'P(' + px + ', ' + py + ')' }, L);

    var quad = px === 0 || py === 0
      ? (px === 0 && py === 0 ? '原点' : (py === 0 ? 'x 轴上' : 'y 轴上'))
      : (px > 0 ? (py > 0 ? '第一象限' : '第四象限') : (py > 0 ? '第二象限' : '第三象限'));
    M.$('#pt-coord').textContent = '(' + px + ', ' + py + ')';
    M.$('#pt-quad').textContent = quad;
    M.$('#pt-dx').textContent = Math.abs(py);
    M.$('#pt-dy').textContent = Math.abs(px);
    M.$('#pt-syms').innerHTML = '关于 x 轴：(' + px + ', ' + (-py) + ')　｜　关于 y 轴：(' + (-px) + ', ' + py + ')　｜　关于原点：(' + (-px) + ', ' + (-py) + ')';
    M.$('#pt-text').innerHTML = '坐标写成 <b>(横坐标, 纵坐标)</b>，顺序不能颠倒。' +
      '点到 <b>x 轴</b>的距离是<b>纵坐标的绝对值</b>（' + Math.abs(py) + '），到 <b>y 轴</b>的距离是<b>横坐标的绝对值</b>（' + Math.abs(px) + '）——' +
      '这两个最容易记反。' + (px === 0 || py === 0 ? '坐标轴上的点<b>不属于任何象限</b>。' : '');
    M.setState({ x: px, y: py });
  }

  /* ---------- 模型二：确定位置的两种方式 ---------- */
  var SPOTS = [
    { name: '深圳北站', x: 3, y: 4, dir: '北偏东 53°', dist: 5 },
    { name: '世界之窗', x: -4, y: 3, dir: '北偏西 53°', dist: 5 },
    { name: '深圳湾公园', x: -3, y: -4, dir: '南偏西 37°', dist: 5 },
    { name: '大梅沙', x: 4, y: -3, dir: '南偏东 53°', dist: 5 }
  ];
  var spot = 0;

  function showSpot() {
    var s = M.$('#sp-fig');
    s.innerHTML = '';
    var S = M.svg, cx = 150, cy = 108, k = 17;
    S('line', { x1: cx - 130, y1: cy, x2: cx + 130, y2: cy, stroke: '#c7cdd8', 'stroke-width': 1.2 }, s);
    S('line', { x1: cx, y1: cy - 92, x2: cx, y2: cy + 92, stroke: '#c7cdd8', 'stroke-width': 1.2 }, s);
    S('text', { x: cx + 4, y: cy - 94, 'font-size': 10, fill: '#6b7385', text: '北' }, s);
    S('text', { x: cx + 132, y: cy + 4, 'font-size': 10, fill: '#6b7385', text: '东' }, s);
    /* 同心圆表示距离 */
    [2, 4, 6].forEach(function (r) {
      S('circle', { cx: cx, cy: cy, r: r * k, fill: 'none', stroke: '#e4e8f0', 'stroke-width': 1 }, s);
    });
    var p = SPOTS[spot];
    S('line', { x1: cx, y1: cy, x2: cx + p.x * k, y2: cy - p.y * k, stroke: '#c2603f', 'stroke-width': 2 }, s);
    S('circle', { cx: cx + p.x * k, cy: cy - p.y * k, r: 6, fill: '#c2603f', stroke: '#fff', 'stroke-width': 1.8 }, s);
    S('text', { x: cx + p.x * k + (p.x > 0 ? 9 : -9), y: cy - p.y * k - 8, 'text-anchor': p.x > 0 ? 'start' : 'end', 'font-size': 11, 'font-weight': 700, fill: '#a4492b', text: p.name }, s);
    S('circle', { cx: cx, cy: cy, r: 4, fill: '#3a5a93' }, s);
    S('text', { x: cx - 8, y: cy + 15, 'text-anchor': 'end', 'font-size': 10, fill: '#3a5a93', text: '市民中心' }, s);
    M.$('#sp-xy').textContent = '(' + p.x + ', ' + p.y + ')';
    M.$('#sp-dir').textContent = p.dir + '，约 ' + p.dist + ' 个单位';
    M.$('#sp-text').innerHTML = '确定一个位置至少要<b>两个数据</b>：可以是「横坐标 + 纵坐标」，也可以是「<b>方向 + 距离</b>」。' +
      '只说「在北偏东 53°」或只说「5 公里」，都定不下来。生活中的经纬度、电影院的「几排几号」用的都是第一种。';
  }

  document.addEventListener('DOMContentLoaded', function () {
    initAxes();
    M.$('#pt-sym').addEventListener('change', show);
    M.$$('#pt-presets button').forEach(function (b) {
      b.addEventListener('click', function () {
        px = +b.dataset.x; py = +b.dataset.y; show();
      });
    });
    show();
    M.chips(M.$('#sp-chips'), SPOTS.map(function (p, i) { return { label: p.name, value: String(i) }; }), '0', function (v) { spot = +v; showSpot(); });
    showSpot();

    M.quiz([
      {
        level: 'base',
        title: '把 P 拖到第三象限',
        desc: '第三象限的点，横坐标和纵坐标都是负数。',
        label: '在坐标系里拖点',
        button: '检查 P 的位置',
        check: function () {
          if (px < 0 && py < 0) return { ok: true, msg: 'P(' + px + ', ' + py + ') 在第三象限。四个象限按<b>逆时针</b>编号：右上一、左上二、左下三、右下四。' };
          return { ok: false, msg: '现在 P(' + px + ', ' + py + ') 在' + M.$('#pt-quad').textContent + '，要让两个坐标都是负数。' };
        }
      },
      {
        level: 'base',
        title: '点 (−2, 3) 在第几象限？',
        desc: '横坐标负、纵坐标正。',
        options: ['第二象限', '第一象限', '第三象限', '第四象限'],
        answer: 0,
        hint: '左上方是第几象限？',
        explain: '横负纵正在<b>第二象限</b>。四个象限按逆时针编号：右上一、左上二、左下三、右下四。'
      },
      {
        level: 'base',
        title: '点 (0, 5) 在哪里？',
        desc: '横坐标是 0 意味着什么？',
        options: ['y 轴上', '第一象限', 'x 轴上', '原点'],
        answer: 0,
        hint: '横坐标为 0 的点都在哪条轴上？',
        explain: '横坐标为 0 的点在 <b>y 轴</b>上。注意<b>坐标轴上的点不属于任何象限</b>，这是常考的判断题。'
      },
      {
        level: 'mid',
        title: '点 (−3, 5) 到 x 轴的距离是多少？',
        desc: '到 x 轴的距离看哪个坐标？',
        options: ['5', '3', '−3', '√34'],
        answer: 0,
        hint: '想象从点向 x 轴垂直落下去有多长。',
        explain: '到 <b>x 轴</b>的距离 = |纵坐标| = 5；到 <b>y 轴</b>的距离 = |横坐标| = 3。这两个最容易记反，记住「到谁的距离就看另一个坐标」。'
      },
      {
        level: 'mid',
        title: '点 A(2, −3) 关于 y 轴的对称点是？',
        desc: '可以勾选上面的「显示对称点」看看。',
        options: ['(−2, −3)', '(2, 3)', '(−2, 3)', '(−3, 2)'],
        answer: 0,
        hint: '关于 y 轴对称，横坐标变号。',
        explain: '关于 y 轴对称：(x, y) → (−x, y)，所以是 (−2, −3)。关于 x 轴是 (2, 3)，关于原点是 (−2, 3)。'
      },
      {
        level: 'mid',
        title: '点 P(a, b) 在第四象限，则 a、b 的符号是？',
        desc: '第四象限在右下方。',
        options: ['a > 0，b < 0', 'a < 0，b > 0', 'a > 0，b > 0', 'a < 0，b < 0'],
        answer: 0,
        hint: '右边横坐标为正，下边纵坐标为负。',
        explain: '第四象限：<b>a &gt; 0、b &lt; 0</b>。反过来给符号判断象限也要会，这类题常和不等式结合考。'
      },
      {
        level: 'mid',
        title: '点 A(3, −2) 关于原点对称的点是？',
        desc: '关于原点对称，两个坐标都变号。',
        options: ['(−3, 2)', '(3, 2)', '(−3, −2)', '(2, −3)'],
        answer: 0,
        hint: '相当于绕原点旋转 180°。',
        explain: '关于原点：(x, y) → (−x, −y)，得 <b>(−3, 2)</b>。对比：关于 x 轴是 (3, 2)，关于 y 轴是 (−3, −2)。'
      },
      {
        level: 'trap',
        title: '点 (−4, 3) 到 y 轴的距离是多少？',
        desc: '到 y 轴的距离，看哪个坐标？',
        options: ['4', '3', '−4', '5'],
        answer: 0,
        hint: '从点水平走到 y 轴，走了多远？',
        explain: '到 <b>y 轴</b>的距离 = |横坐标| = <b>4</b>；到 x 轴的距离才是 |纵坐标| = 3。口诀：<b>到谁的距离，就看另一个坐标</b>，而且要取绝对值。'
      }
    ]);
  });
})();
