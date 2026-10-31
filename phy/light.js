/* 物理互动馆 · 第 4 课 光现象 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();
  var RAD = Math.PI / 180;
  var RAY = '#d08a2c', RAY2 = '#5a4097', NORM = '#7a6aa8', MUTED = '#8a8598';

  /* —— 小工具 —— */
  function clip(el, id, w, h) {
    var d = S('defs', {}, el), c = S('clipPath', { id: id }, d);
    S('rect', { x: 0, y: 0, width: w, height: h, rx: 14 }, c);
  }
  function P(cx, cy, r, a) { return [cx + r * Math.cos(a * RAD), cy + r * Math.sin(a * RAD)]; }
  function arc(parent, cx, cy, r, a1, a2, color) {
    var p1 = P(cx, cy, r, a1), p2 = P(cx, cy, r, a2);
    S('path', { d: 'M' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1) + 'A' + r + ' ' + r + ' 0 0 1 ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1), fill: 'none', stroke: color, 'stroke-width': 1.4 }, parent);
  }
  function txt(parent, x, y, s, o) {
    o = o || {};
    return S('text', { x: x, y: y, 'font-size': o.fs || 10, 'text-anchor': o.anchor || 'middle', fill: o.fill || MUTED, 'font-weight': o.bold ? 600 : null, text: s }, parent);
  }
  /* 一条光线：线段 + 中间一个小箭头表示光的传播方向 */
  function ray(g, x1, y1, x2, y2, o) {
    o = o || {};
    var c = o.color || RAY, w = o.w || 2;
    S('line', { x1: x1.toFixed(1), y1: y1.toFixed(1), x2: x2.toFixed(1), y2: y2.toFixed(1), stroke: c, 'stroke-width': w, 'stroke-dasharray': o.dash || null, opacity: o.op || null, 'stroke-linecap': 'round' }, g);
    if (o.arrow === false) return;
    var t = o.at || 0.5, len = Math.hypot(x2 - x1, y2 - y1) || 1, ux = (x2 - x1) / len, uy = (y2 - y1) / len;
    var mx = x1 + (x2 - x1) * t, my = y1 + (y2 - y1) * t;
    var a = L.arrow(g, mx - ux * 5, my - uy * 5, mx + ux * 6, my + uy * 6, { color: c, width: w, head: 8 });
    if (o.op) a.setAttribute('opacity', o.op);
  }
  function eye(parent, x, y, dir) {
    var g = S('g', {}, parent);
    S('path', { d: 'M' + (x - 10) + ' ' + y + 'Q' + x + ' ' + (y - 8) + ' ' + (x + 10) + ' ' + y + 'Q' + x + ' ' + (y + 8) + ' ' + (x - 10) + ' ' + y + 'z', fill: '#fff', stroke: '#5b6475', 'stroke-width': 1.4 }, g);
    S('circle', { cx: x + 3 * (dir || 1), cy: y, r: 3, fill: '#3d3650' }, g);
    return g;
  }
  function source(parent, x, y) {
    var g = S('g', {}, parent);
    for (var k = 0; k < 8; k++) {
      var a = k * 45 * RAD;
      S('line', { x1: x + Math.cos(a) * 10, y1: y + Math.sin(a) * 10, x2: x + Math.cos(a) * 14, y2: y + Math.sin(a) * 14, stroke: '#e0a040', 'stroke-width': 1.5, 'stroke-linecap': 'round' }, g);
    }
    S('circle', { cx: x, cy: y, r: 7.5, fill: '#f2a43a', stroke: '#d17a1f', 'stroke-width': 1.2 }, g);
    return g;
  }
  /* 可拖动元素：pointer 拖动 + 方向键 */
  function draggable(svgEl, onMove) {
    var on = false;
    svgEl.addEventListener('pointermove', function (e) { if (on) { onMove(L.svgPoint(svgEl, e)); e.preventDefault(); } });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (n) { svgEl.addEventListener(n, function () { on = false; }); });
    return function bind(el, onKey) {
      el.addEventListener('pointerdown', function (e) { on = true; try { svgEl.setPointerCapture(e.pointerId); } catch (err) {} e.preventDefault(); });
      el.addEventListener('keydown', function (e) {
        var k = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[e.key];
        if (!k) return;
        onKey(k, e.key); e.preventDefault();
      });
    };
  }

  /* ========== ① 光的反射 ========== */
  var refl = L.$('#refl');
  var I = L.num(st.i, 40, 0, 80);
  var mode = st.m === 'diffuse' ? 'diffuse' : 'mirror';
  var rev = st.rv === '1';
  var OX = 200, OY = 188, RL = 175;
  var OFFS = [-84, -42, 0, 42, 84], TILT = [-17, 12, 8, 16, -12];
  /* 漫反射：每一小块表面朝向不同；入射角很大时把倾斜收小一点，免得光照到小块背面 */
  function tiltAt(k) { return mode === 'diffuse' ? TILT[k] * (1 - I / 110) : 0; }
  function localI() { return I + tiltAt(2); }

  var bindRefl = draggable(refl, function (p) {
    var a = Math.atan2(OX - p.x, OY - p.y) / RAD;
    if (p.y >= OY) a = p.x < OX ? 80 : 0;
    setI(a);
  });

  function drawRefl() {
    refl.innerHTML = '';
    clip(refl, 'refl-clip', 400, 250);
    S('rect', { x: 0, y: 0, width: 400, height: 250, rx: 14, fill: '#fbfaf7' }, refl);
    var k, x;
    // 反射面
    if (mode === 'mirror') {
      S('rect', { x: 14, y: OY, width: 372, height: 7, fill: '#dfe9f3', stroke: '#7f9fc0', 'stroke-width': 1.2 }, refl);
      for (x = 22; x < 386; x += 10) S('line', { x1: x, y1: OY + 7, x2: x - 7, y2: OY + 15, stroke: '#a39cb3', 'stroke-width': 1 }, refl);
      txt(refl, 386, OY + 32, '平面镜：表面光滑', { anchor: 'end' });
    } else {
      var pts = [[14, OY + 4]];
      OFFS.forEach(function (off, j) {
        var t = tiltAt(j) * RAD, hx = OX + off;
        pts.push([hx - 15 * Math.cos(t), OY - 15 * Math.sin(t)]);
        pts.push([hx + 15 * Math.cos(t), OY + 15 * Math.sin(t)]);
      });
      pts.push([386, OY + 4]);
      var d = 'M' + pts.map(function (q) { return q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join('L') + 'L386 ' + (OY + 20) + 'L14 ' + (OY + 20) + 'z';
      S('path', { d: d, fill: '#ece6dc', stroke: '#b59f84', 'stroke-width': 1.2, 'stroke-linejoin': 'round' }, refl);
      txt(refl, 386, OY + 32, '粗糙表面：放大看是许多朝向不同的小块', { anchor: 'end' });
    }
    // 光线
    var g = S('g', { 'clip-path': 'url(#refl-clip)' }, refl);
    var dx = Math.sin(I * RAD), dy = Math.cos(I * RAD), main = null;
    for (k = 0; k < OFFS.length; k++) {
      var hx = OX + OFFS[k], hy = OY, t = tiltAt(k) * RAD;
      var nx = Math.sin(t), ny = -Math.cos(t), dot = dx * nx + dy * ny;
      var rx = dx - 2 * dot * nx, ry = dy - 2 * dot * ny;
      var sx = hx - dx * RL, sy = hy - dy * RL, ex = hx + rx * RL, ey = hy + ry * RL;
      var isMain = k === 2, o = { w: isMain ? 2.2 : 1.4, op: isMain ? null : 0.5 };
      if (!rev) { ray(g, sx, sy, hx, hy, o); ray(g, hx, hy, ex, ey, o); }
      else { ray(g, ex, ey, hx, hy, o); ray(g, hx, hy, sx, sy, o); }
      if (mode === 'diffuse' && !isMain) S('line', { x1: hx, y1: hy, x2: hx + nx * 30, y2: hy + ny * 30, stroke: NORM, 'stroke-width': 1, 'stroke-dasharray': '3 3', opacity: 0.75 }, g);
      if (isMain) main = { t: tiltAt(k), nx: nx, ny: ny, rx: rx, ry: ry };
    }
    // 法线与两个角
    var tm = main.t, il = I + tm;
    S('line', { x1: OX, y1: OY, x2: OX + main.nx * 160, y2: OY + main.ny * 160, stroke: NORM, 'stroke-width': 1.3, 'stroke-dasharray': '5 4' }, g);
    txt(refl, OX + main.nx * 160 + 4, OY + main.ny * 160 + 4, '法线', { anchor: 'start', fill: NORM });
    if (il > 0.5) {
      arc(refl, OX, OY, 34, -90 - I, -90 + tm, RAY);
      arc(refl, OX, OY, 38, -90 + tm, -90 + tm + il, RAY2);
      var pi = P(OX, OY, 64, -90 - I / 2 + tm / 2), pr = P(OX, OY, 64, -90 + tm + il / 2);
      txt(refl, pi[0] - (il < 24 ? 14 : 0), pi[1] + 3, 'i=' + L.fmt(il, 0) + '°', { fill: '#a8641c', bold: true });
      txt(refl, pr[0] + (il < 24 ? 14 : 0), pr[1] + 3, 'r=' + L.fmt(il, 0) + '°', { fill: RAY2, bold: true });
    } else {
      txt(refl, OX + 6, OY - 60, 'i = r = 0°', { anchor: 'start', fill: RAY2, bold: true });
    }
    if (mode === 'mirror' && I > 4) {
      arc(refl, OX, OY, 22, -180, -90 - I, MUTED);
      var pm = P(OX, OY, 30, (-180 - 90 - I) / 2);
      txt(refl, pm[0] - 2, pm[1] + 3, L.fmt(90 - I, 0) + '°', { anchor: 'end', fs: 9 });
    }
    S('circle', { cx: OX, cy: OY, r: 2.5, fill: '#5a6e86' }, refl);
    txt(refl, OX + 6, OY + 14, 'O', { anchor: 'start', fill: '#5a6e86' });
    // 光源 / 拖动点
    var hxp = OX - dx * 150, hyp = OY - dy * 150;
    if (rev) {
      var sx2 = OX + main.rx * 150, sy2 = OY + main.ry * 150;
      source(refl, sx2, sy2);
      txt(refl, sx2, sy2 - 18, '光源（倒过来）', { fill: '#a8641c' });
    }
    var hg = S('g', { class: 'pt', tabindex: 0, role: 'slider', 'aria-label': '入射角', 'aria-valuenow': I, 'aria-valuemin': 0, 'aria-valuemax': 80 }, refl);
    S('circle', { cx: hxp, cy: hyp, r: 18, fill: 'transparent' }, hg);
    if (!rev) source(hg, hxp, hyp);
    else S('circle', { cx: hxp, cy: hyp, r: 8, fill: '#fff', stroke: RAY, 'stroke-width': 2 }, hg);
    txt(hg, hxp, hyp + (I > 60 ? -20 : 26), rev ? '拖我' : '光源 · 拖我', { fill: '#7a6aa8' });
    bindRefl(hg, function (k) { setI(I - k); });
    readRefl(il);
  }

  var iIn = L.$('#i-in');
  iIn.value = I;
  L.bindRange(iIn, function (v) { I = v; drawRefl(); });
  function setI(v) {
    I = Math.round(L.clamp(v, 0, 80));
    iIn.value = I; L.paintRange(iIn);
    drawRefl();
  }
  L.chips(L.$('#mode-chips'), [{ label: '镜面反射', value: 'mirror' }, { label: '漫反射', value: 'diffuse' }], mode, function (v) { mode = v; drawRefl(); });
  L.chips(L.$('#dir-chips'), [{ label: '光从光源射出', value: '0' }, { label: '光路可逆：倒过来射', value: '1' }], rev ? '1' : '0', function (v) { rev = v === '1'; drawRefl(); });

  function readRefl(il) {
    var a = L.fmt(il, 0);
    L.$('#i-out').textContent = I + '°';
    L.$('#refl-badge').textContent = mode === 'mirror' ? '镜面反射' : '漫反射';
    L.$('#rl-i').innerHTML = a + '<small>°</small>';
    L.$('#rl-r').innerHTML = a + '<small>°</small>';
    L.$('#rl-m').innerHTML = mode === 'mirror' ? L.fmt(90 - I, 0) + '<small>°</small>' : '—';
    L.$('#rl-ir').innerHTML = L.fmt(2 * il, 0) + '<small>°</small>';
    var t;
    if (mode === 'mirror') {
      if (I === 0) t = '光垂直射到镜面上，入射角是 0°，反射角也是 0°，光<b>沿原路返回</b>。';
      else t = '入射角 ' + a + '°，反射角也是 ' + a + '°。注意入射光线与<b>镜面</b>的夹角是 ' + L.fmt(90 - I, 0) + '°，那不是入射角。一束平行光照到光滑镜面上，反射后仍然<b>平行</b>，只有站在那个方向的人才觉得刺眼。';
    } else {
      t = '粗糙表面的每一小块朝向不同，法线也各不相同。中间这条光线照到的小块，法线歪了 ' + L.fmt(Math.abs(tiltAt(2)), 0) + '°，相对这条法线，入射角 = 反射角 = ' + a + '°。每条光线都<b>遵守反射定律</b>，只是射向了四面八方。';
    }
    if (rev) t += ' 现在让光沿原来的反射光线倒着射回去，它正好沿原来的入射光线射出——<b>光路可逆</b>。';
    L.$('#refl-text').innerHTML = t;
    var items = [
      '反射光线、入射光线和法线在<b>同一平面</b>内',
      '反射光线和入射光线<b>分居法线两侧</b>',
      '<b>反射角等于入射角</b>：现在都是 ' + a + '°',
      rev ? '光路可逆：倒过来射，路线一点没变' : '光路可逆：点“倒过来射”验证一下',
      mode === 'diffuse' ? '漫反射的每一条光线也都遵守这些规律' : '换成“漫反射”，看规律还成不成立'
    ];
    L.$('#law-list').innerHTML = items.map(function (s) { return '<li class="yes"><i>✓</i><span>' + s + '</span></li>'; }).join('');
    save();
  }

  /* ========== ② 平面镜成像 ========== */
  var mir = L.$('#mirror');
  var D = L.num(st.d, 10, 2, 20);
  var HC = st.h === '4' ? 4 : 8;
  var MX = 200, TY = 196, KM = 8, EYE = [26, 44];

  var bindMir = draggable(mir, function (p) { setD((MX - p.x) / KM); });

  function candle(parent, x, hp, virtual) {
    var top = TY - hp, tip = top - 14;
    var col = virtual ? '#c2603f' : '#c9a873';
    S('rect', { x: x - 6, y: top, width: 12, height: hp, rx: 2, fill: virtual ? '#fbf1ec' : '#f1e3c8', stroke: col, 'stroke-width': 1.3, 'stroke-dasharray': virtual ? '4 3' : null }, parent);
    S('line', { x1: x, y1: top, x2: x, y2: top - 3, stroke: '#6b5a44', 'stroke-width': 1.2 }, parent);
    S('path', { d: 'M' + x + ' ' + tip + 'c6 6 5 12 0 13c-5-1-6-7 0-13z', fill: virtual ? 'none' : '#f2a43a', stroke: virtual ? '#c2603f' : '#d17a1f', 'stroke-width': 1.1, 'stroke-dasharray': virtual ? '3 2' : null }, parent);
    return { top: top, tip: tip };
  }

  function drawMirror() {
    mir.innerHTML = '';
    clip(mir, 'mir-clip', 400, 240);
    S('rect', { x: 0, y: 0, width: 400, height: 240, rx: 14, fill: '#fbfaf7' }, mir);
    S('rect', { x: MX, y: 0, width: 200, height: 240, fill: '#f1eef6', 'clip-path': 'url(#mir-clip)' }, mir);
    txt(mir, 388, 22, '镜子后面：没有光真的到这里', { anchor: 'end', fs: 9.5 });
    S('line', { x1: 8, y1: TY, x2: 392, y2: TY, stroke: '#cfc9da', 'stroke-width': 2 }, mir);
    // 镜子
    S('rect', { x: MX - 3, y: 30, width: 6, height: TY - 30, fill: '#dfe9f3', stroke: '#7f9fc0', 'stroke-width': 1.2 }, mir);
    for (var y = 38; y < TY; y += 10) S('line', { x1: MX + 3, y1: y, x2: MX + 9, y2: y - 6, stroke: '#a39cb3', 'stroke-width': 1 }, mir);
    txt(mir, MX, 24, '平面镜', { fill: '#5a6e86' });
    var cx = MX - D * KM, ix = MX + D * KM, hp = HC * KM;
    // 像（虚线）
    var im = candle(mir, ix, hp, true);
    var near = D < 7.5;
    txt(mir, near ? ix + 10 : ix, near ? im.tip + 8 : im.tip - 6, '像（虚像）', { fill: '#a4492b', bold: true, anchor: near ? 'start' : 'middle' });
    // 物像连线与直角记号
    S('line', { x1: cx, y1: im.top, x2: ix, y2: im.top, stroke: NORM, 'stroke-width': 1, 'stroke-dasharray': '4 3' }, mir);
    S('path', { d: 'M' + (MX - 8) + ' ' + im.top + 'V' + (im.top - 8) + 'H' + (MX - 3), fill: 'none', stroke: NORM, 'stroke-width': 1 }, mir);
    // 两条进入眼睛的光
    var g = S('g', { 'clip-path': 'url(#mir-clip)' }, mir);
    [im.tip + 3, TY - 5].forEach(function (y0) {
      var s = (ix - MX) / (ix - EYE[0]), my = y0 + (EYE[1] - y0) * s;
      ray(g, cx, y0, MX, my, { w: 1.6 });
      ray(g, MX, my, EYE[0] + 9, EYE[1] + (my - EYE[1]) * 9 / (MX - EYE[0]), { w: 1.6 });
      S('line', { x1: MX, y1: my, x2: ix, y2: y0, stroke: '#c2603f', 'stroke-width': 1.3, 'stroke-dasharray': '4 4', opacity: 0.85 }, g);
    });
    eye(mir, EYE[0], EYE[1], 1);
    txt(mir, EYE[0], EYE[1] + 20, '眼睛');
    // 尺寸线
    function dim(x1, x2, label, side) {
      S('line', { x1: x1, y1: 214, x2: x2, y2: 214, stroke: '#a39cb3', 'stroke-width': 1 }, mir);
      S('line', { x1: x1, y1: 209, x2: x1, y2: 219, stroke: '#a39cb3' }, mir);
      S('line', { x1: x2, y1: 209, x2: x2, y2: 219, stroke: '#a39cb3' }, mir);
      if (near) txt(mir, side < 0 ? x1 - 4 : x2 + 4, 231, label, { fill: '#5a4097', bold: true, anchor: side < 0 ? 'end' : 'start' });
      else txt(mir, (x1 + x2) / 2, 231, label, { fill: '#5a4097', bold: true });
    }
    dim(cx, MX, '物距 ' + L.fmt(D, 1) + ' cm', -1);
    dim(MX, ix, '像距 ' + L.fmt(D, 1) + ' cm', 1);
    // 蜡烛（可拖）
    var cg = S('g', { class: 'pt', tabindex: 0, role: 'slider', 'aria-label': '蜡烛到镜面的距离', 'aria-valuenow': D, 'aria-valuemin': 2, 'aria-valuemax': 20 }, mir);
    S('rect', { x: cx - 14, y: TY - hp - 26, width: 28, height: hp + 30, fill: 'transparent' }, cg);
    var c = candle(cg, cx, hp, false);
    txt(cg, near ? cx - 9 : cx, near ? c.tip + 8 : c.tip - 6, '↔ 拖我', { fill: '#7a6aa8', fs: 9.5, anchor: near ? 'end' : 'middle' });
    bindMir(cg, function (k, key) { setD(D + (key === 'ArrowLeft' || key === 'ArrowDown' ? 0.5 : -0.5)); });
    readMirror();
  }

  var dIn = L.$('#d-in');
  dIn.value = D;
  L.bindRange(dIn, function (v) { D = v; drawMirror(); });
  function setD(v) {
    D = Math.round(L.clamp(v, 2, 20) * 2) / 2;
    dIn.value = D; L.paintRange(dIn);
    drawMirror();
  }
  L.chips(L.$('#h-chips'), [{ label: '长蜡烛 8 cm', value: '8' }, { label: '短蜡烛 4 cm', value: '4' }], String(HC), function (v) { HC = +v; drawMirror(); });

  function readMirror() {
    L.$('#d-out').textContent = L.fmt(D, 1) + ' cm';
    L.$('#mr-u').innerHTML = L.qty(D, 'cm', 1);
    L.$('#mr-v').innerHTML = L.qty(D, 'cm', 1);
    L.$('#mr-h').innerHTML = L.qty(HC, 'cm', 0);
    L.$('#mr-h2').innerHTML = L.qty(HC, 'cm', 0);
    L.$('#mr-kind').textContent = '正立 · 等大 · 虚像';
    var t = '像到镜面 ' + L.fmt(D, 1) + ' cm，和蜡烛到镜面一样远；像和蜡烛相距 ' + L.fmt(2 * D, 1) + ' cm。';
    if (D <= 4) t += '蜡烛已经很靠近镜子，像也跟着靠近，但像高仍然是 ' + HC + ' cm——<b>像的大小只由物体决定</b>，和离镜子远近无关。';
    else t += '把蜡烛往镜子拖近，像也会同样靠近，但像高始终是 ' + HC + ' cm。人走近镜子觉得像变大，只是离得近、看起来的角度大了。';
    L.$('#mir-text').innerHTML = t;
    save();
  }

  /* ========== ③ 光的折射 ========== */
  var refr = L.$('#refr');
  var RI = L.num(st.ri, 45, 0, 80);
  var NM = st.n === 'glass' ? 'glass' : 'water';
  var RM = ['ray', 'stick', 'pool'].indexOf(st.rm) >= 0 ? st.rm : 'ray';
  var SY = 118, RX = 200, PXCM = 10, POOL_M = 43;   // 筷子图 10 px = 1 cm；水池图 43 px = 1 m
  function nIdx() { return NM === 'glass' ? 1.5 : 1.33; }
  function mName() { return NM === 'glass' ? '玻璃' : '水'; }
  function rAngle(i) { return Math.asin(Math.sin(i * RAD) / nIdx()) / RAD; }
  /* 水下一点 Q 发出的光，在水面哪一点折射后恰好进入眼睛 E（二分法） */
  function surfX(qx, qy, ex, ey) {
    var lo = qx, hi = ex, n = nIdx();
    for (var k = 0; k < 50; k++) {
      var m = (lo + hi) / 2;
      var si = (ex - m) / Math.hypot(ex - m, SY - ey), sr = (m - qx) / Math.hypot(m - qx, qy - SY);
      if (si - n * sr > 0) lo = m; else hi = m;
    }
    var px = (lo + hi) / 2;
    return { px: px, da: (px - qx) * (SY - ey) / (ex - px) };   // da：眼睛顺着折射光反向看回去，觉得在水下多深
  }

  var bindRefr = draggable(refr, function (p) {
    if (RM !== 'ray') return;
    var a = Math.atan2(RX - p.x, SY - p.y) / RAD;
    if (p.y >= SY) a = p.x < RX ? 80 : 0;
    setRI(a);
  });

  function drawRefr() {
    refr.innerHTML = '';
    clip(refr, 'refr-clip', 400, 250);
    S('rect', { x: 0, y: 0, width: 400, height: 250, rx: 14, fill: '#fbfaf7' }, refr);
    var wfill = NM === 'glass' ? '#e2ecea' : '#dcebf6', wline = NM === 'glass' ? '#88a8a2' : '#7f9fc0';
    var g = S('g', { 'clip-path': 'url(#refr-clip)' }, refr);
    if (RM === 'ray') drawRay(g, wfill, wline);
    else if (RM === 'stick') drawStick(g, wfill, wline);
    else drawPool(g, wfill, wline);
    save();
  }

  function drawRay(g, wfill, wline) {
    S('rect', { x: 0, y: SY, width: 400, height: 250 - SY, fill: wfill }, g);
    S('line', { x1: 0, y1: SY, x2: 400, y2: SY, stroke: wline, 'stroke-width': 1.5 }, g);
    txt(refr, 16, 24, '空气', { anchor: 'start', fill: '#5b6475', bold: true });
    txt(refr, 16, SY + 22, mName(), { anchor: 'start', fill: '#3f6380', bold: true });
    S('line', { x1: RX, y1: 10, x2: RX, y2: 242, stroke: NORM, 'stroke-width': 1.2, 'stroke-dasharray': '5 4' }, g);
    txt(refr, RX + 5, SY - 46, '法线', { anchor: 'start', fill: NORM });
    var i = RI, r = rAngle(i);
    var dx = Math.sin(i * RAD), dy = Math.cos(i * RAD);
    var sx = RX - dx * 98, sy = SY - dy * 98;
    ray(g, RX - dx * 170, SY - dy * 170, RX, SY, { w: 2.2, at: 0.75 });
    if (i > 0.5) ray(g, RX, SY, RX + dx * 120, SY - dy * 120, { w: 1.2, op: 0.35, at: 0.7 });
    if (i > 6) {
      S('line', { x1: RX, y1: SY, x2: RX + dx * 125, y2: SY + dy * 125, stroke: MUTED, 'stroke-width': 1.1, 'stroke-dasharray': '2 4' }, g);
      txt(refr, RX + dx * 125 + 4, SY + dy * 125 + 4, '如果不拐弯', { anchor: 'start', fs: 9 });
    }
    ray(g, RX, SY, RX + Math.sin(r * RAD) * 160, SY + Math.cos(r * RAD) * 160, { w: 2.2, color: '#2f6a8a' });
    if (i > 0.5) {
      arc(refr, RX, SY, 34, -90 - i, -90, RAY);
      arc(refr, RX, SY, 34, 90 - r, 90, '#2f6a8a');
      var pi = P(RX, SY, 62, -90 - i / 2), pr = P(RX, SY, 66, 90 - r / 2);
      txt(refr, pi[0] - (i < 24 ? 14 : 0), pi[1] + 3, 'i=' + L.fmt(i, 0) + '°', { fill: '#a8641c', bold: true });
      txt(refr, pr[0] + (r < 24 ? 18 : 0), pr[1] + 4, 'r=' + L.fmt(r, 1) + '°', { fill: '#2f6a8a', bold: true });
      if (i >= 25) txt(refr, RX + dx * 104 + 6, SY - dy * 104, '少量反射光', { anchor: 'start', fs: 9 });
    }
    S('circle', { cx: RX, cy: SY, r: 2.5, fill: '#5a6e86' }, refr);
    var hg = S('g', { class: 'pt', tabindex: 0, role: 'slider', 'aria-label': '入射角', 'aria-valuenow': RI, 'aria-valuemin': 0, 'aria-valuemax': 80 }, refr);
    S('circle', { cx: sx, cy: sy, r: 18, fill: 'transparent' }, hg);
    source(hg, sx, sy);
    txt(hg, sx + (i < 30 ? -16 : 0), sy + (i > 55 ? -20 : 26), '光源 · 拖我', { fill: '#7a6aa8', anchor: i < 30 ? 'end' : 'middle' });
    bindRefr(hg, function (k) { setRI(RI - k); });
    readRay(i, r);
  }

  /* 水下一点 → 眼睛看到的位置（反向延长线与过该点竖直线的交点，课本作图法） */
  function apparent(qx, qy, E) {
    if (qy <= SY + 0.01) return [qx, qy];
    var s = surfX(qx, qy, E[0], E[1]);
    return [qx, SY + s.da];
  }

  function drawStick(g, wfill, wline) {
    var E = [356, 30];
    var cupL = 110, cupR = 290, cupT = 70, cupB = 236;
    S('rect', { x: cupL, y: SY, width: cupR - cupL, height: cupB - SY, fill: wfill }, g);
    S('line', { x1: cupL, y1: SY, x2: cupR, y2: SY, stroke: wline, 'stroke-width': 1.5 }, g);
    S('path', { d: 'M' + cupL + ' ' + cupT + 'V' + cupB + 'H' + cupR + 'V' + cupT, fill: 'none', stroke: '#9fb4c8', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g);
    txt(refr, cupL + 8, SY + 18, mName(), { anchor: 'start', fill: '#3f6380', bold: true });
    var P0 = [170, SY], ux = Math.SQRT1_2, uy = Math.SQRT1_2;
    var top = [P0[0] - ux * 110, P0[1] - uy * 110], tipQ = [P0[0] + ux * 140, P0[1] + uy * 140];
    // 实际位置（淡、虚线）
    S('line', { x1: P0[0], y1: P0[1], x2: tipQ[0], y2: tipQ[1], stroke: '#a0714a', 'stroke-width': 4, 'stroke-dasharray': '6 5', opacity: 0.4, 'stroke-linecap': 'round' }, g);
    // 看起来的位置
    var tipA = apparent(tipQ[0], tipQ[1], E);
    S('line', { x1: P0[0], y1: P0[1], x2: tipA[0], y2: tipA[1], stroke: '#a0714a', 'stroke-width': 5, 'stroke-linecap': 'round' }, g);
    S('line', { x1: top[0], y1: top[1], x2: P0[0], y2: P0[1], stroke: '#a0714a', 'stroke-width': 5, 'stroke-linecap': 'round' }, g);
    // 从筷子尖到眼睛的一条光
    var s = surfX(tipQ[0], tipQ[1], E[0], E[1]);
    ray(g, tipQ[0], tipQ[1], s.px, SY, { w: 1.6 });
    ray(g, s.px, SY, E[0] - 8, E[1] + (SY - E[1]) * 8 / (E[0] - s.px), { w: 1.6 });
    S('line', { x1: s.px, y1: SY, x2: tipA[0], y2: tipA[1], stroke: '#c2603f', 'stroke-width': 1.3, 'stroke-dasharray': '4 4' }, g);
    S('line', { x1: s.px, y1: SY - 34, x2: s.px, y2: SY + 34, stroke: NORM, 'stroke-width': 1, 'stroke-dasharray': '3 3' }, g);
    eye(refr, E[0], E[1], -1);
    txt(refr, E[0], E[1] + 20, '眼睛');
    txt(refr, tipQ[0] - 4, tipQ[1] + 14, '实际位置', { anchor: 'end', fs: 9.5 });
    txt(refr, (P0[0] + tipA[0]) / 2 + 4, (P0[1] + tipA[1]) / 2 - 10, '看起来的位置', { anchor: 'start', fill: '#7a4f2c', fs: 9.5, bold: true });
    readStick((tipQ[1] - SY) / PXCM, (tipA[1] - SY) / PXCM);
  }

  function drawPool(g, wfill, wline) {
    var E = [322, 18], bankX = 300, bottom = 210, Q = [150, bottom - 6];
    S('rect', { x: 0, y: SY, width: bankX, height: 250 - SY, fill: wfill }, g);
    S('line', { x1: 0, y1: SY, x2: bankX, y2: SY, stroke: wline, 'stroke-width': 1.5 }, g);
    S('rect', { x: 0, y: bottom, width: bankX, height: 40, fill: '#ece2c8' }, g);
    S('path', { d: 'M' + bankX + ' ' + (SY - 8) + 'H400V250H' + bankX + 'z', fill: '#e3ddd0', stroke: '#c4baa6' }, g);
    txt(refr, 16, SY + 18, mName() === '水' ? '池水' : '玻璃', { anchor: 'start', fill: '#3f6380', bold: true });
    var s = surfX(Q[0], Q[1], E[0], E[1]), A = [Q[0], SY + s.da];
    // 实际石头 + 看到的像
    S('ellipse', { cx: Q[0], cy: Q[1], rx: 14, ry: 7, fill: '#9a8f86', stroke: '#6f665e' }, g);
    S('ellipse', { cx: A[0], cy: A[1], rx: 14, ry: 7, fill: 'none', stroke: '#c2603f', 'stroke-width': 1.3, 'stroke-dasharray': '4 3' }, g);
    ray(g, Q[0], Q[1], s.px, SY, { w: 1.8 });
    ray(g, s.px, SY, E[0] - 8, E[1] + (SY - E[1]) * 8 / (E[0] - s.px), { w: 1.8 });
    S('line', { x1: s.px, y1: SY, x2: A[0], y2: A[1], stroke: '#c2603f', 'stroke-width': 1.3, 'stroke-dasharray': '4 4' }, g);
    S('line', { x1: s.px, y1: SY - 40, x2: s.px, y2: SY + 40, stroke: NORM, 'stroke-width': 1, 'stroke-dasharray': '3 3' }, g);
    txt(refr, s.px + 4, SY - 30, '法线', { anchor: 'start', fill: NORM, fs: 9 });
    txt(refr, Q[0] - 18, Q[1] + 4, '实际的石头', { anchor: 'end', fs: 9.5 });
    txt(refr, A[0] - 18, A[1] + 4, '看到的像（虚像）', { anchor: 'end', fill: '#a4492b', fs: 9.5, bold: true });
    eye(refr, E[0], E[1], -1);
    txt(refr, E[0], E[1] + 20, '岸上的人');
    readPool((Q[1] - SY) / POOL_M, s.da / POOL_M);
  }

  var riIn = L.$('#ri-in');
  riIn.value = RI;
  L.bindRange(riIn, function (v) { RI = v; drawRefr(); });
  function setRI(v) {
    RI = Math.round(L.clamp(v, 0, 80));
    riIn.value = RI; L.paintRange(riIn);
    drawRefr();
  }
  L.chips(L.$('#n-chips'), [{ label: '水', value: 'water' }, { label: '玻璃', value: 'glass' }], NM, function (v) { NM = v; drawRefr(); });
  L.chips(L.$('#rmode-chips'), [{ label: '折射光路', value: 'ray' }, { label: '水中的筷子', value: 'stick' }, { label: '看水底', value: 'pool' }], RM, function (v) { RM = v; drawRefr(); });

  function labels(a, b, c) { L.$('#rf-l1').textContent = a; L.$('#rf-l2').textContent = b; L.$('#rf-l3').textContent = c; }
  function readRay(i, r) {
    L.$('#ri-ctl').style.display = '';
    L.$('#ri-out').textContent = L.fmt(i, 0) + '°';
    L.$('#rf-badge').textContent = '空气 → ' + mName();
    labels('入射角 i', '折射角 r', '光线偏折了（i − r）');
    L.$('#rf-i').innerHTML = L.fmt(i, 0) + '<small>°</small>';
    L.$('#rf-r').innerHTML = L.fmt(r, 1) + '<small>°</small>';
    L.$('#rf-dev').innerHTML = L.fmt(i - r, 1) + '<small>°</small>';
    var t;
    if (i < 0.5) t = '光<b>垂直</b>射入' + mName() + '中，传播方向不改变，入射角和折射角都是 0°。';
    else t = '光从空气斜射入' + mName() + '中，折射光线<b>向法线偏折</b>，折射角 ' + L.fmt(r, 1) + '° 小于入射角 ' + L.fmt(i, 0) + '°。入射角变大，折射角也跟着变大。' + (NM === 'glass' ? '换成玻璃后比水偏折得更厉害。' : '') + '如果让光从' + mName() + '里沿折射光线反着射出来，它会沿原来的入射光线回到空气里：<b>光路可逆</b>。';
    L.$('#rf-text').innerHTML = t;
  }
  function readStick(real, app) {
    L.$('#ri-ctl').style.display = 'none';
    L.$('#rf-badge').textContent = mName() + ' → 空气';
    labels('筷子尖实际深度', '看起来的深度', '看起来浅了');
    L.$('#rf-i').innerHTML = L.qty(real, 'cm', 1);
    L.$('#rf-r').innerHTML = L.qty(app, 'cm', 1);
    L.$('#rf-dev').innerHTML = L.qty(real - app, 'cm', 1);
    L.$('#rf-text').innerHTML = '水下那段筷子反射的光从' + mName() + '斜射入空气，在界面处<b>远离法线</b>偏折。眼睛顺着折射光反向看回去，觉得光来自更浅的地方，于是水下那段看起来<b>往上折</b>了。筷子本身一点没弯。';
  }
  function readPool(real, app) {
    L.$('#ri-ctl').style.display = 'none';
    L.$('#rf-badge').textContent = mName() + ' → 空气';
    labels('石头实际深度', '看起来的深度', '看起来浅了');
    L.$('#rf-i').innerHTML = L.qty(real, 'm', 1);
    L.$('#rf-r').innerHTML = L.qty(app, 'm', 1);
    L.$('#rf-dev').innerHTML = L.qty(real - app, 'm', 1);
    L.$('#rf-text').innerHTML = '岸上的人看到的“石头”是光折射后形成的<b>虚像</b>，比实际位置<b>高</b>，所以清澈的池水看起来比实际浅，不能凭眼睛判断水深就下水。同样的道理，叉鱼要朝看到的鱼的<b>下方</b>叉。斜着看得越偏，看起来就越浅。';
  }

  function save() { L.setState({ i: I, m: mode, rv: rev ? '1' : '', d: D, h: HC, ri: RI, n: NM, rm: RM }); }

  drawRefl();
  drawMirror();
  drawRefr();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '让反射光沿原路返回',
      desc: '在“光的反射”里调整光源，让反射光线正好沿着入射光线原路射回去。',
      label: '在光的反射图里操作',
      button: '检查光路',
      check: function () {
        if (mode !== 'mirror') return { ok: false, msg: '先把反射面换回“镜面反射”，粗糙表面的法线方向各不相同。' };
        if (I === 0) return { ok: true, msg: '光垂直照到镜面，入射角 0°，反射角也是 0°，反射光沿原路返回。' };
        return { ok: false, msg: '现在入射角是 ' + I + '°，反射光跑到了法线的另一侧。入射角要等于多少，两条光线才能重合？' };
      }
    },
    {
      level: 'base',
      title: '下列现象中，由光的直线传播形成的是',
      desc: '想一想光在每个现象里是一直走、碰到表面拐回来，还是穿过两种物质拐了弯。',
      options: ['小孔成像', '平静水面上的倒影', '水中的筷子看起来“折断”', '雨后的彩虹'],
      answer: 0,
      hint: '倒影是镜面成像，筷子“折断”是光从水进入空气，彩虹是阳光被小水珠分解。',
      explain: '小孔成像是光沿直线穿过小孔形成的<b>倒立实像</b>。倒影是光的<b>反射</b>（水面相当于平面镜），筷子“折断”是光的<b>折射</b>，彩虹是光的<b>色散</b>。'
    },
    {
      level: 'base',
      title: '光在真空中的传播速度约为',
      desc: '打雷时总是先看到闪电，后听到雷声。',
      options: ['3×10<sup>8</sup> m/s', '3×10<sup>5</sup> m/s', '340 m/s', '3×10<sup>8</sup> km/s'],
      answer: 0,
      hint: '注意单位：是米每秒还是千米每秒？',
      explain: '光在真空中的速度 c = <b>3×10<sup>8</sup> m/s</b>，也就是 3×10<sup>5</sup> <b>km</b>/s；340 m/s 是声音在 15 ℃ 空气中的速度。光比声音快得多，所以先看到闪电。'
    },
    {
      level: 'mid',
      title: '让反射光线和入射光线互相垂直',
      desc: '在镜面反射下调整入射角，使两条光线的夹角正好是 90°。',
      label: '在光的反射图里操作',
      button: '检查夹角',
      check: function () {
        if (mode !== 'mirror') return { ok: false, msg: '这道题用镜面反射来做，先切回“镜面反射”。' };
        if (I === 45) return { ok: true, msg: '入射角 45°，反射角也是 45°，两条光线夹角 45° + 45° = 90°。' };
        return { ok: false, msg: '现在两条光线夹角是 ' + 2 * I + '°。它等于入射角的几倍？' };
      }
    },
    {
      level: 'mid',
      title: '让蜡烛和它的像相距 12 cm',
      desc: '在“平面镜成像”里拖动蜡烛。',
      label: '在平面镜成像图里操作',
      button: '检查距离',
      check: function () {
        if (Math.abs(D - 6) < 0.01) return { ok: true, msg: '蜡烛到镜面 6 cm，像到镜面也是 6 cm，两者相距 12 cm。' };
        return { ok: false, msg: '现在蜡烛和像相距 ' + L.fmt(2 * D, 1) + ' cm。像距等于物距，所以蜡烛应该离镜面多远？' };
      }
    },
    {
      level: 'mid',
      title: '让光射进玻璃后，折射角约为 30°',
      desc: '在“光的折射”里选择玻璃，调整入射角，直到折射角约为 30°（相差不超过 0.6°）。',
      label: '在光的折射图里操作',
      button: '检查折射角',
      check: function () {
        if (RM !== 'ray') return { ok: false, msg: '先切到“折射光路”。' };
        if (NM !== 'glass') return { ok: false, msg: '题目要求光射进<b>玻璃</b>，先把介质换成玻璃。' };
        var r = rAngle(RI);
        if (Math.abs(r - 30) <= 0.6) return { ok: true, msg: '入射角 ' + RI + '° 时折射角约 ' + L.fmt(r, 1) + '°。可见光斜射入玻璃，折射角<b>小于</b>入射角，入射角得比 30° 大不少才行。' };
        return { ok: false, msg: '现在折射角是 ' + L.fmt(r, 1) + '°。' + (r < 30 ? '再把入射角调大一些。' : '把入射角调小一些。') };
      }
    },
    {
      level: 'trap',
      title: '一束光与平面镜成 40° 角射到镜面上，反射角是',
      desc: '可以在第一张图里把入射角调到相应的值看一看。',
      options: ['50°', '40°', '80°', '100°'],
      answer: 0,
      hint: '入射角是入射光线和谁的夹角？先画法线。',
      explain: '法线垂直于镜面，光线与镜面成 40°，与法线就成 90° − 40° = 50°，所以入射角是 50°，<b>反射角也是 50°</b>。40° 错把镜面当成了法线；80° 和 100° 是两条光线之间的夹角算错了。'
    },
    {
      level: 'trap',
      title: '小明向穿衣镜走近，他在镜中的像会',
      desc: '在平面镜成像图里把蜡烛往镜子拖近，看像高有没有变。',
      options: ['大小不变，离镜面越来越近', '变大，离镜面越来越近', '变小，离镜面越来越远', '大小不变，离镜面越来越远'],
      answer: 0,
      hint: '平面镜成像，像和物的大小是什么关系？和距离有没有关？',
      explain: '平面镜成的像与物体<b>大小相等</b>，与距离无关，所以像的大小不变；像距等于物距，人走近，像也走近。觉得像变大，是因为离得近、看起来的角度变大了，这是“看起来”而不是真的变大。'
    }
  ]);
})();
