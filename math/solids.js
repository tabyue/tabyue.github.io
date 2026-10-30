/* 第 1 课 · 立体图形与三视图（北师大版七上第一章、九上第五章） */
(function () {
  'use strict';
  var M = window.Mx, st = M.getState();

  /* ---------- 模型一：常见几何体的面、棱、顶点 ---------- */
  /* f 面数、e 棱数、v 顶点数；曲面体不适用欧拉公式，用 euler:false 标出 */
  var BODIES = [
    { id: 'cube', name: '正方体', f: 6, e: 12, v: 8, euler: true, kind: '柱体',
      net: '六个全等的正方形', cut: ['三角形', '四边形', '五边形', '六边形'],
      note: '六个面都是正方形，12 条棱一样长。' },
    { id: 'cuboid', name: '长方体', f: 6, e: 12, v: 8, euler: true, kind: '柱体',
      net: '三组两两全等的长方形', cut: ['三角形', '四边形', '五边形', '六边形'],
      note: '也是四棱柱。相对的两个面全等，相对的棱平行且相等。' },
    { id: 'prism3', name: '三棱柱', f: 5, e: 9, v: 6, euler: true, kind: '柱体',
      net: '两个三角形 + 三个长方形', cut: ['三角形', '四边形', '五边形'],
      note: '上下两个底面是全等三角形，侧面都是长方形。' },
    { id: 'pyr4', name: '四棱锥', f: 5, e: 8, v: 5, euler: true, kind: '锥体',
      net: '一个四边形 + 四个三角形', cut: ['三角形', '四边形'],
      note: '只有一个底面，侧面都是三角形，所有侧棱交于一个顶点。' },
    { id: 'cyl', name: '圆柱', f: 3, e: 2, v: 0, euler: false, kind: '柱体',
      net: '两个圆 + 一个长方形', cut: ['圆', '长方形', '椭圆'],
      note: '侧面是曲面，展开后是长方形，它的长等于底面圆的周长。' },
    { id: 'cone', name: '圆锥', f: 2, e: 1, v: 1, euler: false, kind: '锥体',
      net: '一个圆 + 一个扇形', cut: ['圆', '三角形', '椭圆'],
      note: '侧面展开是扇形，扇形的弧长等于底面圆的周长。' },
    { id: 'sphere', name: '球', f: 1, e: 0, v: 0, euler: false, kind: '球体',
      net: '展不开（无法摊成平面图形）', cut: ['圆'],
      note: '不管从哪个方向截，截面都是圆。' }
  ];

  var bodyId = st.b || 'cube';

  function drawBody(b) {
    var s = M.$('#bd-fig'), g;
    s.innerHTML = '';
    var S = M.svg;
    /* 简笔示意：可见棱实线、被挡住的棱虚线 */
    function dash(d) { return S('path', { d: d, fill: 'none', stroke: '#8795b5', 'stroke-width': 1.4, 'stroke-dasharray': '4 4' }, g); }
    function solid(d, fill) { return S('path', { d: d, fill: fill || 'none', stroke: '#3a5a93', 'stroke-width': 1.8, 'stroke-linejoin': 'round' }, g); }
    g = S('g', {}, s);
    if (b.id === 'cube' || b.id === 'cuboid') {
      var w = b.id === 'cube' ? 70 : 100, h = 70, dx = 30, dy = -24;
      var x = 50, y = 130;
      solid('M' + x + ' ' + y + 'h' + w + 'v' + -h + 'h' + -w + 'z', '#eaeff8');
      solid('M' + (x + w) + ' ' + y + 'l' + dx + ' ' + dy + 'v' + -h + 'l' + -dx + ' ' + -dy, '#dde5f3');
      solid('M' + x + ' ' + (y - h) + 'l' + dx + ' ' + dy + 'h' + w + 'l' + -dx + ' ' + -dy, '#f2f5fb');
      dash('M' + x + ' ' + y + 'l' + dx + ' ' + dy + 'h' + w);
      dash('M' + (x + dx) + ' ' + (y + dy) + 'v' + -h);
    } else if (b.id === 'prism3') {
      solid('M60 130h90l-26-84h-38z', '#eaeff8');
      solid('M150 130l28-22-26-84-28 22z', '#dde5f3');
      solid('M60 130l28-22h90l-28 22z', '#f2f5fb');
      dash('M60 130l28-22v0');
      dash('M88 108l26 84');
    } else if (b.id === 'pyr4') {
      solid('M70 132h100l-24-18H94z', '#e4ebf6');
      solid('M70 132l50-86 50 86', '#eaeff8');
      solid('M120 46l26 68', '#dde5f3');
      dash('M94 114h52');
      dash('M120 46v68');
    } else if (b.id === 'cyl') {
      solid('M62 56h116v66H62z', '#eaeff8');
      M.svg('ellipse', { cx: 120, cy: 56, rx: 58, ry: 15, fill: '#f2f5fb', stroke: '#3a5a93', 'stroke-width': 1.8 }, g);
      M.svg('path', { d: 'M62 122a58 15 0 0 0 116 0', fill: 'none', stroke: '#3a5a93', 'stroke-width': 1.8 }, g);
      dash('M62 122a58 15 0 0 1 116 0');
    } else if (b.id === 'cone') {
      solid('M120 40 62 122h116z', '#eaeff8');
      M.svg('path', { d: 'M62 122a58 15 0 0 0 116 0', fill: 'none', stroke: '#3a5a93', 'stroke-width': 1.8 }, g);
      dash('M62 122a58 15 0 0 1 116 0');
      dash('M120 40v97');
    } else {
      M.svg('circle', { cx: 120, cy: 86, r: 52, fill: '#eaeff8', stroke: '#3a5a93', 'stroke-width': 1.8 }, g);
      M.svg('ellipse', { cx: 120, cy: 86, rx: 52, ry: 16, fill: 'none', stroke: '#8795b5', 'stroke-width': 1.3, 'stroke-dasharray': '4 4' }, g);
    }
  }

  function showBody() {
    var b = null;
    BODIES.forEach(function (x) { if (x.id === bodyId) b = x; });
    drawBody(b);
    M.$('#bd-name').textContent = b.name;
    M.$('#bd-kind').textContent = b.kind;
    M.$('#bd-f').textContent = b.f;
    M.$('#bd-e').textContent = b.e;
    M.$('#bd-v').textContent = b.v;
    M.$('#bd-net').textContent = b.net;
    M.$('#bd-cut').textContent = b.cut.join('、');
    var ev = M.$('#bd-euler');
    if (b.euler) {
      ev.innerHTML = '顶点 ' + b.v + ' − 棱 ' + b.e + ' + 面 ' + b.f + ' = <b>' + (b.v - b.e + b.f) + '</b>，正好是 2。';
    } else {
      ev.innerHTML = '它有曲面，不是多面体，<b>欧拉公式不适用</b>。';
    }
    M.$('#bd-note').textContent = b.note;
    save();
  }

  /* ---------- 模型二：搭小方块，看三视图 ---------- */
  /* H[r][c] = 该位置摆几层（0~3）。r 越大越靠前（靠近观察者） */
  var H = [[1, 2, 1], [0, 1, 0], [0, 2, 0]];
  if (st.h && /^[0-3]{9}$/.test(st.h)) {
    H = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (var i = 0; i < 9; i++) H[(i / 3) | 0][i % 3] = +st.h[i];
  }

  /* 主视图：从前面看，每一列取该列的最高层数 */
  function frontView() {
    return [0, 1, 2].map(function (c) {
      return Math.max(H[0][c], H[1][c], H[2][c]);
    });
  }
  /* 左视图：从左面看，每一行取该行的最高层数（行从后到前） */
  function sideView() {
    return [0, 1, 2].map(function (r) {
      return Math.max(H[r][0], H[r][1], H[r][2]);
    });
  }
  /* 俯视图：从上往下看，只看有没有方块 */
  function topView() {
    return H.map(function (row) { return row.map(function (v) { return v > 0 ? 1 : 0; }); });
  }
  function total() {
    var n = 0;
    H.forEach(function (row) { row.forEach(function (v) { n += v; }); });
    return n;
  }

  function grid(el, cells, label) {
    el.innerHTML = '';
    var S = M.svg, cs = 20, pad = 6;
    cells.forEach(function (cell) {
      S('rect', {
        x: pad + cell.x * cs, y: pad + cell.y * cs, width: cs - 2, height: cs - 2, rx: 2.5,
        fill: cell.on ? '#9fb4d8' : '#f1f3f7', stroke: cell.on ? '#5d7cb0' : '#e2e5ea', 'stroke-width': 1
      }, el);
    });
    if (label) S('text', { x: pad, y: pad + 3 * cs + 13, 'font-size': 10.5, fill: '#6b7385', text: label }, el);
  }

  function drawBlocks() {
    var s = M.$('#bl-fig');
    s.innerHTML = '';
    /* 先画进一个组，画完按实际范围整体平移到画布中央，空多少格都不会偏 */
    var wrap = M.svg('g', {}, s);
    var S = function (tag, attrs, parent) { return M.svg(tag, attrs, parent || wrap); };
    var ox = 112, oy = 116, cw = 26, ch = 15, cz = 20;
    /* 画顺序：先后排再前排、先低层再高层，后画的盖住先画的 */
    for (var r = 0; r < 3; r++) {
      for (var c = 2; c >= 0; c--) {
        for (var k = 0; k < H[r][c]; k++) {
          var x = ox + (c - r) * cw, y = oy + (c + r) * ch * 0.5 - k * cz;
          var g = S('g', {});
          S('path', { d: 'M' + x + ' ' + y + 'l' + cw + ' ' + -ch + 'l' + cw + ' ' + ch + 'l' + -cw + ' ' + ch + 'z', fill: '#cfdaee', stroke: '#5d7cb0', 'stroke-width': 1.1, 'stroke-linejoin': 'round' }, g);
          S('path', { d: 'M' + x + ' ' + y + 'v' + cz + 'l' + cw + ' ' + ch + 'v' + -cz + 'z', fill: '#eaeff8', stroke: '#5d7cb0', 'stroke-width': 1.1, 'stroke-linejoin': 'round' }, g);
          S('path', { d: 'M' + (x + cw) + ' ' + (y + ch) + 'v' + cz + 'l' + cw + ' ' + -ch + 'v' + -cz + 'z', fill: '#aec0dd', stroke: '#5d7cb0', 'stroke-width': 1.1, 'stroke-linejoin': 'round' }, g);
        }
      }
    }
    if (!wrap.childElementCount) {
      M.svg('text', { x: 115, y: 92, 'text-anchor': 'middle', 'font-size': 12, fill: '#8d95a6', text: '点下面的格子放方块' }, s);
      return;
    }
    try {
      var b = wrap.getBBox();
      wrap.setAttribute('transform', 'translate(' + M.fmt(115 - (b.x + b.width / 2), 1) + ',' + M.fmt(88 - (b.y + b.height / 2), 1) + ')');
    } catch (e) {}
  }

  function showBlocks() {
    drawBlocks();
    var f = frontView(), sd = sideView(), tp = topView(), cells;
    /* 主视图：第 c 列从底往上堆 f[c] 格 */
    cells = [];
    for (var c = 0; c < 3; c++) for (var y = 0; y < 3; y++) cells.push({ x: c, y: y, on: f[c] >= 3 - y });
    grid(M.$('#v-front'), cells);
    /* 左视图：从左往右对应「后 → 前」 */
    cells = [];
    for (var r = 0; r < 3; r++) for (y = 0; y < 3; y++) cells.push({ x: r, y: y, on: sd[r] >= 3 - y });
    grid(M.$('#v-side'), cells);
    /* 俯视图：上面一行是后排 */
    cells = [];
    for (r = 0; r < 3; r++) for (c = 0; c < 3; c++) cells.push({ x: c, y: r, on: tp[r][c] === 1 });
    grid(M.$('#v-top'), cells);
    M.$('#bl-total').textContent = total() + ' 个';
    M.$('#bl-high').textContent = Math.max.apply(null, f) + ' 层';
    M.$('#bl-text').innerHTML = '主视图是<b>每一列最高几层</b>（' + f.join('、') + '），左视图是<b>每一排最高几层</b>（' + sd.join('、') +
      '），俯视图只看<b>哪里有方块</b>。所以不同的搭法可能有一样的主视图。';
    M.$$('#bl-grid button').forEach(function (b) {
      var r = +b.dataset.r, c = +b.dataset.c;
      b.textContent = H[r][c] ? String(H[r][c]) : '';
      b.setAttribute('aria-pressed', String(H[r][c] > 0));
    });
    save();
  }

  function save() {
    var h = '';
    H.forEach(function (row) { row.forEach(function (v) { h += v; }); });
    M.setState({ b: bodyId, h: h });
  }

  /* ---------- 模型三：影子（平行投影与中心投影） ---------- */
  var lightMode = st.l || 'sun', lightX = M.num(st.lx, 60, 10, 230);

  function showLight() {
    var s = M.$('#lt-fig');
    s.innerHTML = '';
    var S = M.svg, ground = 150, poles = [[80, 56], [150, 36]];
    S('line', { x1: 10, y1: ground, x2: 290, y2: ground, stroke: '#8795b5', 'stroke-width': 1.6 }, s);
    var shadows = [];
    poles.forEach(function (p) {
      var px = p[0], ph = p[1], sx;
      if (lightMode === 'sun') {
        /* 平行投影：光线方向一致，影长 = 高 × 固定比例 */
        var k = (lightX - 10) / 220 * 1.6 + 0.3;
        sx = px + ph * k;
      } else {
        /* 中心投影：灯在 (lightX, 14)，影子端点由相似三角形决定 */
        var lx = lightX, ly = 14, top = ground - ph;
        sx = lx + (px - lx) * (ground - ly) / (top - ly);
      }
      shadows.push(Math.abs(sx - px));
      S('path', { d: 'M' + px + ' ' + ground + 'L' + sx + ' ' + ground, stroke: '#8795b5', 'stroke-width': 7, 'stroke-linecap': 'round', opacity: .5 }, s);
      S('line', { x1: px, y1: ground, x2: px, y2: ground - ph, stroke: '#3a5a93', 'stroke-width': 5, 'stroke-linecap': 'round' }, s);
      if (lightMode === 'sun') {
        S('line', { x1: px - (sx - px), y1: ground - ph * 2, x2: sx, y2: ground, stroke: '#e0b23f', 'stroke-width': 1.2, 'stroke-dasharray': '5 4' }, s);
      } else {
        S('line', { x1: lightX, y1: 14, x2: sx, y2: ground, stroke: '#e0b23f', 'stroke-width': 1.2, 'stroke-dasharray': '5 4' }, s);
      }
    });
    if (lightMode === 'sun') {
      S('circle', { cx: 262, cy: 26, r: 13, fill: '#f2c94c' }, s);
      S('text', { x: 262, y: 52, 'text-anchor': 'middle', 'font-size': 10, fill: '#8a7330', text: '太阳' }, s);
    } else {
      S('circle', { cx: lightX, cy: 14, r: 7, fill: '#f2c94c' }, s);
      S('text', { x: lightX, y: 32, 'text-anchor': 'middle', 'font-size': 10, fill: '#8a7330', text: '灯' }, s);
    }
    var r1 = shadows[0] / 56, r2 = shadows[1] / 36;
    M.$('#lt-ratio').textContent = M.fmt(r1, 2) + ' : ' + M.fmt(r2, 2);
    M.$('#lt-text').innerHTML = lightMode === 'sun'
      ? '太阳离得很远，照过来的光<b>可以看成平行的</b>，这叫平行投影。此时同一时刻、同一地点，<b>影长和物高成正比</b>——两根杆子的「影长 ÷ 高」几乎相等，所以可以用它测量旗杆的高度。'
      : '灯是一个点，光线<b>从一点发散出去</b>，这叫中心投影。离灯近的杆子影子短、离得远的影子长，<b>影长和物高不成正比</b>，所以不能用来测高。';
    M.$('#lt-kind').textContent = lightMode === 'sun' ? '平行投影' : '中心投影';
    M.setState({ b: bodyId, l: lightMode, lx: lightX });
  }

  /* ---------- 装配 ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    M.chips(M.$('#bd-chips'), BODIES.map(function (b) { return { label: b.name, value: b.id }; }), bodyId, function (v) { bodyId = v; showBody(); });
    showBody();

    var gridEl = M.$('#bl-grid');
    for (var r = 0; r < 3; r++) for (var c = 0; c < 3; c++) {
      var b = M.html('button', { type: 'button', 'aria-label': '第 ' + (r + 1) + ' 排第 ' + (c + 1) + ' 列，点一下加一层' }, gridEl);
      b.dataset.r = r; b.dataset.c = c;
      b.addEventListener('click', function () {
        var rr = +this.dataset.r, cc = +this.dataset.c;
        H[rr][cc] = (H[rr][cc] + 1) % 4;
        showBlocks();
      });
    }
    M.$('#bl-clear').addEventListener('click', function () {
      H = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
      showBlocks();
    });
    showBlocks();

    M.chips(M.$('#lt-chips'), [{ label: '太阳光', value: 'sun' }, { label: '路灯', value: 'lamp' }], lightMode, function (v) { lightMode = v; showLight(); });
    M.bindRange(M.$('#lt-range'), function (v) { lightX = v; showLight(); })();

    M.quiz([
      {
        title: '搭一个主视图是「2 1 2」的几何体',
        desc: '在上面的方块网格里点一点，让<b>主视图</b>从左到右分别是 2 层、1 层、2 层。',
        label: '在方块网格里动手搭',
        button: '检查我搭的',
        check: function () {
          var f = frontView();
          if (f[0] === 2 && f[1] === 1 && f[2] === 2) {
            return { ok: true, msg: '一共用了 ' + total() + ' 个小方块。注意：满足这个主视图的搭法有很多种，小方块的个数也不唯一。' };
          }
          return { ok: false, msg: '现在的主视图是 ' + f.join('、') + '，还不是 2、1、2。主视图看的是<b>每一列最高几层</b>。' };
        }
      },
      {
        title: '哪个几何体的欧拉公式算不出 2？',
        desc: '多面体都满足「顶点 − 棱 + 面 = 2」。下面哪一个<b>不是</b>多面体？',
        options: ['三棱柱', '四棱锥', '圆柱', '长方体'],
        answer: 2,
        hint: '多面体的每个面都是平的。再想想哪个有曲面。',
        explain: '圆柱有曲面（侧面），不是多面体，所以欧拉公式不适用。它也没有顶点。'
      },
      {
        title: '用影子测旗杆，为什么要在太阳下量？',
        desc: '切到上面的「路灯」看看两根杆子的「影长 ÷ 高」还相等吗。',
        options: ['太阳光可以看成平行的，影长与物高成正比', '太阳比灯亮，看得更清楚', '灯光下影子太短，不好测量', '太阳在正上方，影子最准'],
        answer: 0,
        hint: '关键不是亮不亮，而是光线是不是平行的。',
        explain: '太阳离地球很远，光线近似平行，同一时刻影长与物高成正比，于是「旗杆高 ÷ 旗杆影长 = 标杆高 ÷ 标杆影长」。灯光是中心投影，这个比例不成立。'
      }
    ]);
  });
})();
