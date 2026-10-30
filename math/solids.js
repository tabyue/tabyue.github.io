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

  /* ---------- 三维投影 ----------
     先绕 y 轴转 yaw、再绕 x 轴转 pitch，然后正交投影。
     凸多面体用背面剔除决定哪些面看得见：法向量朝向观察者的才画。
     一条棱只要属于某个可见面就是实线，否则是被挡住的虚线。 */
  var YAW = 34 * Math.PI / 180, PITCH = 20 * Math.PI / 180;

  function rot(p) {
    var x = p[0] * Math.cos(YAW) + p[2] * Math.sin(YAW);
    var z = -p[0] * Math.sin(YAW) + p[2] * Math.cos(YAW);
    var y = p[1] * Math.cos(PITCH) - z * Math.sin(PITCH);
    return [x, y, p[1] * Math.sin(PITCH) + z * Math.cos(PITCH)];
  }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }

  /* 几何体的三维顶点与面（面上的顶点按环绕顺序给出，朝向自动判定） */
  function mesh(id) {
    var i, V = [], F = [];
    if (id === 'cube' || id === 'cuboid') {
      var a = id === 'cube' ? 1 : 1.45, b = id === 'cube' ? 1 : 0.86, c = id === 'cube' ? 1 : 0.78;
      V = [[-a, -b, -c], [a, -b, -c], [a, b, -c], [-a, b, -c], [-a, -b, c], [a, -b, c], [a, b, c], [-a, b, c]];
      F = [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [2, 3, 7, 6], [1, 2, 6, 5], [0, 3, 7, 4]];
    } else if (id === 'prism3') {
      /* 三棱柱：横截面是三角形，沿 z 方向拉伸 */
      var h = 1.15, w = 1.25, d = 1.0;
      V = [[0, h, -d], [-w, -h * 0.7, -d], [w, -h * 0.7, -d],
           [0, h, d], [-w, -h * 0.7, d], [w, -h * 0.7, d]];
      F = [[0, 1, 2], [3, 4, 5], [0, 1, 4, 3], [1, 2, 5, 4], [2, 0, 3, 5]];
    } else if (id === 'pyr4') {
      /* 四棱锥：底面是正方形，顶点在正上方 */
      var e = 1.15, hh = 1.35;
      V = [[-e, -hh * 0.55, -e], [e, -hh * 0.55, -e], [e, -hh * 0.55, e], [-e, -hh * 0.55, e], [0, hh, 0]];
      F = [[0, 1, 2, 3], [0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4]];
    }
    return { V: V, F: F };
  }

  function drawPoly(s, id) {
    var S = M.svg, m = mesh(id), V = m.V, F = m.F;
    var P = V.map(rot);
    /* 自动缩放，使图形填满画布 */
    var xs = P.map(function (p) { return p[0]; }), ys = P.map(function (p) { return p[1]; });
    var minx = Math.min.apply(null, xs), maxx = Math.max.apply(null, xs);
    var miny = Math.min.apply(null, ys), maxy = Math.max.apply(null, ys);
    var k = Math.min(150 / (maxx - minx), 118 / (maxy - miny));
    var ox = 120 - (minx + maxx) / 2 * k, oy = 86 + (miny + maxy) / 2 * k;
    function px(i) { return [ox + P[i][0] * k, oy - P[i][1] * k]; }

    /* 背面剔除：法向量指向观察者（+z）的面才可见 */
    var vis = F.map(function (f) {
      var n = cross(sub(P[f[1]], P[f[0]]), sub(P[f[2]], P[f[1]]));
      /* 法向量要朝外：与「面心 − 体心」同向 */
      var cen = [0, 0, 0];
      f.forEach(function (i) { cen[0] += P[i][0] / f.length; cen[1] += P[i][1] / f.length; cen[2] += P[i][2] / f.length; });
      if (dot(n, cen) < 0) { n = [-n[0], -n[1], -n[2]]; }
      return n[2] > 0;
    });

    /* 棱：属于任一可见面就是实线，否则虚线 */
    var edge = {};
    F.forEach(function (f, fi) {
      for (var i = 0; i < f.length; i++) {
        var a = f[i], b = f[(i + 1) % f.length], key = Math.min(a, b) + '-' + Math.max(a, b);
        edge[key] = edge[key] || { a: Math.min(a, b), b: Math.max(a, b), vis: false };
        if (vis[fi]) edge[key].vis = true;
      }
    });
    /* 可见面从远到近画 */
    var order = [];
    F.forEach(function (f, fi) {
      if (!vis[fi]) return;
      var z = 0;
      f.forEach(function (i) { z += P[i][2] / f.length; });
      order.push({ f: f, z: z });
    });
    order.sort(function (p, q) { return p.z - q.z; });
    var FILL = ['#eaeff8', '#dde5f3', '#cfdaee', '#f2f5fb', '#e4ebf6'];
    order.forEach(function (o, i) {
      S('polygon', {
        points: o.f.map(function (idx) { var p = px(idx); return M.fmt(p[0], 1) + ',' + M.fmt(p[1], 1); }).join(' '),
        fill: FILL[i % FILL.length], stroke: '#3a5a93', 'stroke-width': 1.8, 'stroke-linejoin': 'round'
      }, s);
    });
    /* 被挡住的棱画在最上面，按课本习惯用虚线表示「看不见但确实存在」 */
    for (var key in edge) {
      if (edge[key].vis) continue;
      var p1 = px(edge[key].a), p2 = px(edge[key].b);
      S('line', { x1: M.fmt(p1[0], 1), y1: M.fmt(p1[1], 1), x2: M.fmt(p2[0], 1), y2: M.fmt(p2[1], 1), stroke: '#8795b5', 'stroke-width': 1.4, 'stroke-dasharray': '5 4' }, s);
    }
  }

  function drawBody(b) {
    var s = M.$('#bd-fig'), g;
    s.innerHTML = '';
    var S = M.svg;
    function dash(d) { return S('path', { d: d, fill: 'none', stroke: '#8795b5', 'stroke-width': 1.4, 'stroke-dasharray': '5 4' }, g); }
    function solid(d, fill) { return S('path', { d: d, fill: fill || 'none', stroke: '#3a5a93', 'stroke-width': 1.8, 'stroke-linejoin': 'round' }, g); }
    g = S('g', {}, s);
    if (b.id === 'cube' || b.id === 'cuboid' || b.id === 'prism3' || b.id === 'pyr4') {
      drawPoly(g, b.id);
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
        level: 'base',
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
        level: 'base',
        title: '正方体有几条棱？',
        desc: '上面点开正方体，看数据卡上的棱数。',
        options: ['12 条', '8 条', '6 条', '4 条'],
        answer: 0,
        hint: '上面一圈 4 条、下面一圈 4 条、竖着 4 条。',
        explain: '正方体有 <b>12 条棱、8 个顶点、6 个面</b>。注意别把棱（12）和顶点（8）记反了。'
      },
      {
        level: 'base',
        title: '圆柱的侧面展开后是什么图形？',
        desc: '想象把易拉罐的商标撕下来铺平。',
        options: ['长方形', '扇形', '三角形', '圆'],
        answer: 0,
        hint: '沿着一条高剪开再铺平。',
        explain: '圆柱侧面展开是<b>长方形</b>，它的长等于底面圆的周长 2πr。<b>圆锥</b>侧面展开才是扇形，两个别搞混。'
      },
      {
        level: 'mid',
        title: '哪个几何体的欧拉公式算不出 2？',
        desc: '多面体都满足「顶点 − 棱 + 面 = 2」。下面哪一个<b>不是</b>多面体？',
        options: ['三棱柱', '四棱锥', '圆柱', '长方体'],
        answer: 2,
        hint: '多面体的每个面都是平的。再想想哪个有曲面。',
        explain: '圆柱有曲面（侧面），不是多面体，所以欧拉公式不适用。它也没有顶点。'
      },
      {
        level: 'mid',
        title: '用影子测旗杆，为什么要在太阳下量？',
        desc: '切到上面的「路灯」看看两根杆子的「影长 ÷ 高」还相等吗。',
        options: ['太阳光可以看成平行的，影长与物高成正比', '太阳比灯亮，看得更清楚', '灯光下影子太短，不好测量', '太阳在正上方，影子最准'],
        answer: 0,
        hint: '关键不是亮不亮，而是光线是不是平行的。',
        explain: '太阳离地球很远，光线近似平行，同一时刻影长与物高成正比，于是「旗杆高 ÷ 旗杆影长 = 标杆高 ÷ 标杆影长」。灯光是中心投影，这个比例不成立。'
      },
      {
        level: 'mid',
        title: '用一个平面去截正方体，不可能得到下面哪种截面？',
        desc: '正方体只有 6 个面，截面最多能有几条边？',
        options: ['七边形', '六边形', '五边形', '三角形'],
        answer: 0,
        hint: '截面每多一条边，就要多切到一个面。',
        explain: '截面的每条边都来自切到的一个面，正方体只有 <b>6 个面</b>，所以截面最多 <b>六边形</b>，不可能是七边形。'
      },
      {
        level: 'mid',
        title: '一个几何体的主视图和左视图都是长方形，俯视图是圆，它是？',
        desc: '从三个方向分别想一想。',
        options: ['圆柱', '圆锥', '正方体', '球'],
        answer: 0,
        hint: '俯视图是圆，说明从上往下看是个圆面。',
        explain: '<b>圆柱</b>立着放时，正面和侧面看都是长方形，从上往下看是圆。圆锥的主视图是三角形，球的三个视图都是圆。'
      },
      {
        level: 'trap',
        title: '主视图是「2 1 2」的几何体，小方块的个数唯一吗？',
        desc: '回到上面的方块模型，试试在后排多放几个。',
        options: ['不唯一，后排可以藏方块', '唯一，一定是 5 个', '唯一，一定是 8 个', '只有给出俯视图才可能不唯一'],
        answer: 0,
        hint: '主视图只记录每一列的最高层数。',
        explain: '主视图只看<b>每列最高几层</b>，后面藏多少个都看不出来。所以三视图<b>不能唯一确定</b>一个几何体，必须三个视图一起看，而且小方块个数仍可能有多种。'
      }
    ]);
  });
})();
