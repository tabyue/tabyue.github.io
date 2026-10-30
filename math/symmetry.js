/* 第 11 课 · 轴对称、平移与旋转（北师大版七下第五章、八下第三章） */
(function () {
  'use strict';
  var M = window.Mx, st = M.getState();

  /* 一个「F 形」的顶点，用来看三种变换 —— F 不对称，变换后一眼能看出方向 */
  var SHAPE = [[0, 0], [0, 4], [3, 4], [3, 3], [1, 3], [1, 2.4], [2.4, 2.4], [2.4, 1.4], [1, 1.4], [1, 0]];

  var mode = st.m || 'flip';
  var tx = M.num(st.tx, 3, -6, 6), ty = M.num(st.ty, 0, -4, 4);
  var rot = M.num(st.r, 90, -180, 180);
  var axis = st.ax || 'y';

  var ax = null;
  function initAxes() {
    ax = M.axes(M.$('#tf-fig'), {
      xmin: -7, xmax: 7, ymin: -5, ymax: 5, xstep: 1, ystep: 1,
      labelStep: 2, ylabelStep: 2, left: 26, right: 10, top: 10, bottom: 22
    });
  }

  function map(p) {
    var x = p[0], y = p[1];
    if (mode === 'flip') {
      if (axis === 'y') return [-x, y];
      if (axis === 'x') return [x, -y];
      return [y, x];          /* 关于直线 y = x 对称 */
    }
    if (mode === 'move') return [x + tx, y + ty];
    var r = rot * Math.PI / 180;
    return [x * Math.cos(r) - y * Math.sin(r), x * Math.sin(r) + y * Math.cos(r)];
  }

  function poly(pts, fill, stroke, dash) {
    return M.svg('polygon', {
      points: pts.map(function (p) { return M.fmt(ax.X(p[0]), 1) + ',' + M.fmt(ax.Y(p[1]), 1); }).join(' '),
      fill: fill, stroke: stroke, 'stroke-width': 2, 'stroke-linejoin': 'round',
      'stroke-dasharray': dash || null
    }, ax.layer);
  }

  function show() {
    initAxes();
    var S = M.svg, L = ax.layer;
    /* 对称轴 / 旋转中心的提示 */
    if (mode === 'flip') {
      var a = { y: [[0, -5], [0, 5]], x: [[-7, 0], [7, 0]], d: [[-5, -5], [5, 5]] }[axis];
      S('line', { x1: ax.X(a[0][0]), y1: ax.Y(a[0][1]), x2: ax.X(a[1][0]), y2: ax.Y(a[1][1]), stroke: '#c2603f', 'stroke-width': 2, 'stroke-dasharray': '7 5' }, L);
    } else if (mode === 'turn') {
      S('circle', { cx: ax.X(0), cy: ax.Y(0), r: 5, fill: 'none', stroke: '#c2603f', 'stroke-width': 2 }, L);
    }
    var moved = SHAPE.map(map);
    poly(SHAPE, '#e9edf4', '#8795b5', '5 4');
    poly(moved, '#cfdaee', '#2f5aa8');
    /* 对应点连线，看清楚「点怎么走的」 */
    [0, 2, 6].forEach(function (i) {
      S('line', {
        x1: ax.X(SHAPE[i][0]), y1: ax.Y(SHAPE[i][1]), x2: ax.X(moved[i][0]), y2: ax.Y(moved[i][1]),
        stroke: '#c2603f', 'stroke-width': 1, 'stroke-dasharray': '3 3', opacity: .75
      }, L);
      S('circle', { cx: ax.X(moved[i][0]), cy: ax.Y(moved[i][1]), r: 2.8, fill: '#c2603f' }, L);
    });

    var p0 = SHAPE[2], p1 = moved[2];
    var tb = M.$('#tf-table tbody');
    tb.innerHTML = '';
    [0, 2, 6].forEach(function (i) {
      var tr = M.html('tr', {}, tb);
      M.html('td', { class: 'n', text: '(' + M.fmt(SHAPE[i][0]) + ', ' + M.fmt(SHAPE[i][1]) + ')' }, tr);
      M.html('td', { class: 'n', text: '(' + M.fmt(map(SHAPE[i])[0], 2) + ', ' + M.fmt(map(SHAPE[i])[1], 2) + ')' }, tr);
    });

    var name, rule, keep;
    if (mode === 'flip') {
      name = '轴对称（翻折）';
      rule = axis === 'y' ? '关于 y 轴对称：<b>(x, y) → (−x, y)</b>，横坐标变号。'
        : axis === 'x' ? '关于 x 轴对称：<b>(x, y) → (x, −y)</b>，纵坐标变号。'
        : '关于直线 y = x 对称：<b>(x, y) → (y, x)</b>，两个坐标交换。';
      keep = '形状和大小不变，但<b>方向翻过来了</b>（像照镜子）。对称轴是任意一对对应点连线的<b>垂直平分线</b>。';
    } else if (mode === 'move') {
      name = '平移';
      rule = '向' + (tx >= 0 ? '右' : '左') + '平移 ' + Math.abs(tx) + '、向' + (ty >= 0 ? '上' : '下') + '平移 ' + Math.abs(ty) +
        '：<b>(x, y) → (x ' + (tx >= 0 ? '+ ' : '− ') + Math.abs(tx) + ', y ' + (ty >= 0 ? '+ ' : '− ') + Math.abs(ty) + ')</b>。';
      keep = '形状、大小、<b>方向都不变</b>。所有点沿同一方向移动同样的距离，对应点连线<b>互相平行且相等</b>（图中三条红虚线）。';
    } else {
      name = '旋转';
      rule = '绕原点' + (rot >= 0 ? '逆' : '顺') + '时针旋转 ' + Math.abs(rot) + '°。' +
        (Math.abs(rot) === 180 ? '旋转 180° 又叫<b>中心对称</b>：(x, y) → (−x, −y)。' : '');
      keep = '形状和大小不变，<b>整体转了一个角度</b>。每个点到旋转中心的距离不变，对应点与中心连线的夹角都等于旋转角。';
    }
    M.$('#tf-name').textContent = name;
    M.$('#tf-rule').innerHTML = rule;
    M.$('#tf-keep').innerHTML = keep;
    M.setState({ m: mode, tx: tx, ty: ty, r: rot, ax: axis });
  }

  /* ---------- 模型二：对称轴条数 ---------- */
  var FIGS = [
    { id: 'eq', name: '等边三角形', n: 3, order: 3, center: false, draw: 'poly3' },
    { id: 'iso', name: '等腰三角形', n: 1, order: 1, center: false, draw: 'iso' },
    { id: 'sq', name: '正方形', n: 4, order: 4, center: true, draw: 'poly4' },
    { id: 'rect', name: '长方形', n: 2, order: 2, center: true, draw: 'rect' },
    { id: 'para', name: '平行四边形', n: 0, order: 2, center: true, draw: 'para' },
    { id: 'cir', name: '圆', n: Infinity, order: Infinity, center: true, draw: 'cir' }
  ];
  var figId = 'sq';

  function showFig() {
    var f = null;
    FIGS.forEach(function (x) { if (x.id === figId) f = x; });
    var s = M.$('#ax-fig');
    s.innerHTML = '';
    var S = M.svg, cx = 110, cy = 92, R = 62;
    function pts(n, rot0) {
      var out = [];
      for (var i = 0; i < n; i++) {
        var t = rot0 + i * 2 * Math.PI / n;
        out.push([cx + R * Math.cos(t), cy + R * Math.sin(t)]);
      }
      return out;
    }
    var P;
    if (f.draw === 'poly3') P = pts(3, -Math.PI / 2);
    else if (f.draw === 'poly4') P = pts(4, -Math.PI / 4);
    else if (f.draw === 'iso') P = [[cx, cy - R], [cx + R * 0.8, cy + R * 0.6], [cx - R * 0.8, cy + R * 0.6]];
    else if (f.draw === 'rect') P = [[cx - R, cy - R * 0.55], [cx + R, cy - R * 0.55], [cx + R, cy + R * 0.55], [cx - R, cy + R * 0.55]];
    else if (f.draw === 'para') P = [[cx - R + 18, cy - R * 0.5], [cx + R, cy - R * 0.5], [cx + R - 18, cy + R * 0.5], [cx - R, cy + R * 0.5]];
    if (f.draw === 'cir') {
      S('circle', { cx: cx, cy: cy, r: R, fill: '#eaeff8', stroke: '#3a5a93', 'stroke-width': 2.2 }, s);
      for (var i = 0; i < 6; i++) {
        var t = i * Math.PI / 6;
        S('line', { x1: cx - R * Math.cos(t), y1: cy - R * Math.sin(t), x2: cx + R * Math.cos(t), y2: cy + R * Math.sin(t), stroke: '#c2603f', 'stroke-width': 1.1, 'stroke-dasharray': '5 4' }, s);
      }
    } else {
      S('polygon', { points: P.map(function (p) { return M.fmt(p[0], 1) + ',' + M.fmt(p[1], 1); }).join(' '), fill: '#eaeff8', stroke: '#3a5a93', 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, s);
      /* 对称轴：顶点↔对边中点 或 对边中点↔对边中点 */
      var lines = [];
      if (f.id === 'eq') P.forEach(function (p, k) { var m2 = mid(P[(k + 1) % 3], P[(k + 2) % 3]); lines.push([p, m2]); });
      if (f.id === 'iso') lines.push([P[0], mid(P[1], P[2])]);
      if (f.id === 'sq') { lines.push([P[0], P[2]]); lines.push([P[1], P[3]]); lines.push([mid(P[0], P[1]), mid(P[2], P[3])]); lines.push([mid(P[1], P[2]), mid(P[3], P[0])]); }
      if (f.id === 'rect') { lines.push([mid(P[0], P[1]), mid(P[2], P[3])]); lines.push([mid(P[1], P[2]), mid(P[3], P[0])]); }
      lines.forEach(function (l) {
        S('line', { x1: ext(l[0], l[1])[0], y1: ext(l[0], l[1])[1], x2: ext(l[1], l[0])[0], y2: ext(l[1], l[0])[1], stroke: '#c2603f', 'stroke-width': 1.3, 'stroke-dasharray': '5 4' }, s);
      });
    }
    if (f.center) S('circle', { cx: cx, cy: cy, r: 3.6, fill: '#3f7d6a' }, s);
    M.$('#ax-name').textContent = f.name;
    M.$('#ax-n').textContent = f.n === Infinity ? '无数条' : f.n + ' 条';
    M.$('#ax-center').textContent = f.center ? '是' : '不是';
    M.$('#ax-text').innerHTML = f.n === 0
      ? '平行四边形<b>不是</b>轴对称图形（沿任何一条直线折叠都不能重合），但它<b>是</b>中心对称图形——绕中心转 180° 能和自己重合。这两个概念要分清。'
      : f.id === 'cir' ? '圆有<b>无数条</b>对称轴，每一条直径所在的直线都是；它也是中心对称图形。'
      : f.name + '有 <b>' + f.n + ' 条</b>对称轴' + (f.center ? '，同时也是中心对称图形（绿点是对称中心）。' : '，但<b>不是</b>中心对称图形。') ;
  }
  function mid(a, b) { return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; }
  function ext(a, b) { return [a[0] + (a[0] - b[0]) * 0.22, a[1] + (a[1] - b[1]) * 0.22]; }

  /* ---------- 装配 ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    M.chips(M.$('#tf-chips'), [{ label: '轴对称', value: 'flip' }, { label: '平移', value: 'move' }, { label: '旋转', value: 'turn' }], mode, function (v) {
      mode = v;
      M.$('#tf-flip').hidden = v !== 'flip';
      M.$('#tf-move').hidden = v !== 'move';
      M.$('#tf-turn').hidden = v !== 'turn';
      show();
    });
    M.chips(M.$('#tf-axis'), [{ label: '关于 y 轴', value: 'y' }, { label: '关于 x 轴', value: 'x' }, { label: '关于 y = x', value: 'd' }], axis, function (v) { axis = v; show(); });
    M.bindRange(M.$('#tf-tx'), function (v) { tx = v; show(); });
    M.bindRange(M.$('#tf-ty'), function (v) { ty = v; show(); });
    M.bindRange(M.$('#tf-rot'), function (v) { rot = v; show(); });
    M.$('#tf-flip').hidden = mode !== 'flip';
    M.$('#tf-move').hidden = mode !== 'move';
    M.$('#tf-turn').hidden = mode !== 'turn';
    show();

    M.chips(M.$('#ax-chips'), FIGS.map(function (f) { return { label: f.name, value: f.id }; }), figId, function (v) { figId = v; showFig(); });
    showFig();

    M.quiz([
      {
        title: '把 F 关于 y 轴翻过去',
        desc: '选「轴对称」，再选「关于 y 轴」，看坐标怎么变。',
        label: '在变换模型里操作',
        button: '检查现在的变换',
        check: function () {
          if (mode !== 'flip' || axis !== 'y') return { ok: false, msg: '先选「轴对称」，再选「关于 y 轴」。' };
          return { ok: true, msg: '规律是 (x, y) → (−x, y)：<b>横坐标变号，纵坐标不变</b>。表格里 (3, 4) 变成了 (−3, 4)。' };
        }
      },
      {
        title: '平行四边形是轴对称图形吗？',
        desc: '可以在下面的图形里点开看看。',
        options: ['不是，但它是中心对称图形', '是，有 2 条对称轴', '是，有 4 条对称轴', '既不是轴对称也不是中心对称'],
        answer: 0,
        hint: '试试沿对角线折一下，两半能重合吗？',
        explain: '一般的平行四边形沿任何直线折叠都不能重合，所以不是轴对称图形；但绕中心转 180° 能重合，是<b>中心对称图形</b>。长方形、菱形才两者都是。'
      },
      {
        title: '点 (2, −5) 关于原点中心对称的点是？',
        desc: '中心对称就是绕原点旋转 180°。',
        options: ['(−2, 5)', '(−2, −5)', '(2, 5)', '(5, −2)'],
        answer: 0,
        hint: '旋转 180° 时两个坐标都变号。',
        explain: '(x, y) → (−x, −y)，所以是 (−2, 5)。对比：关于 x 轴是 (2, 5)，关于 y 轴是 (−2, −5)，三个别搞混。'
      }
    ]);
  });
})();
