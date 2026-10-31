/* 物理互动馆 · 第 7 课 力 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();
  var RAD = Math.PI / 180, MUTED = '#8a8598';

  function txt(parent, x, y, s, o) {
    o = o || {};
    return S('text', { x: x, y: y, 'font-size': o.fs || 10, 'text-anchor': o.anchor || 'middle', fill: o.fill || MUTED, 'font-weight': o.bold ? 600 : null, text: s }, parent);
  }
  function clip(el, id, x, y, w, h, rx) {
    var d = S('defs', {}, el), c = S('clipPath', { id: id }, d);
    S('rect', { x: x, y: y, width: w, height: h, rx: rx || 0 }, c);
  }

  /* ========== ① 弹簧测力计 ========== */
  var sp = L.$('#spring'), fl = L.$('#fl');
  var SM = Math.round(L.num(st.sm, 200, 0, 700) / 20) * 20;   // 钩码质量 g
  var G10 = 10, MAXF = 5, KPX = 16, KCM = 1.6, Y0 = 30, SX = 100;
  function force() { return SM / 1000 * G10; }

  function drawSpring() {
    sp.innerHTML = '';
    clip(sp, 'sp-clip', 0, 0, 400, 260, 14);
    clip(sp, 'mag-clip', 212, 22, 166, 176, 10);
    S('rect', { x: 0, y: 0, width: 400, height: 260, rx: 14, fill: '#fbfaf7' }, sp);
    var F = force(), over = F > MAXF + 1e-9, Fd = Math.min(F, MAXF + 0.25), py = Y0 + Fd * KPX;
    // 铁架
    S('rect', { x: 40, y: 4, width: 120, height: 6, rx: 2, fill: '#cfc9da' }, sp);
    S('path', { d: 'M' + SX + ' 10v4', stroke: '#8a8598', 'stroke-width': 2 }, sp);
    // 外壳
    S('rect', { x: 82, y: 14, width: 36, height: 110, rx: 6, fill: '#eef1f5', stroke: '#9aa6b5', 'stroke-width': 1.3 }, sp);
    for (var k = 0; k <= 25; k++) {
      var v = k * 0.2, y = Y0 + v * KPX, big = k % 5 === 0;
      S('line', { x1: 84, y1: y, x2: big ? 93 : 89, y2: y, stroke: '#5b6475', 'stroke-width': big ? 1.1 : 0.7 }, sp);
      if (big) txt(sp, 78, y + 3, String(v), { anchor: 'end', fs: 9, fill: '#5b6475' });
    }
    txt(sp, 78, 22, 'N', { anchor: 'end', fs: 9, fill: '#5b6475' });
    // 弹簧
    var coils = 12, top = 18, bot = py - 3, d = 'M' + SX + ' ' + top;
    for (var c = 1; c <= coils * 2; c++) d += 'L' + (SX + (c % 2 ? 6 : -6)) + ' ' + (top + (bot - top) * c / (coils * 2)).toFixed(1);
    d += 'L' + SX + ' ' + bot;
    S('path', { d: d, fill: 'none', stroke: over ? '#c2603f' : '#7a6aa8', 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, sp);
    // 指针、拉杆、挂钩
    var hy = py + 96;
    S('line', { x1: SX, y1: py, x2: SX, y2: hy, stroke: '#8a939e', 'stroke-width': 2.2 }, sp);
    S('path', { d: 'M93 ' + py + 'L98 ' + (py - 3) + 'H110V' + (py + 3) + 'H98z', fill: '#c2603f' }, sp);
    S('path', { d: 'M' + SX + ' ' + hy + 'v5a5 5 0 1 1 -5 5', fill: 'none', stroke: '#5b6475', 'stroke-width': 1.8, 'stroke-linecap': 'round' }, sp);
    // 钩码
    if (SM > 0) {
      var bh = 8 + SM / 700 * 26, by = hy + 14;
      S('line', { x1: SX - 5, y1: hy + 10, x2: SX, y2: by, stroke: '#5b6475', 'stroke-width': 1 }, sp);
      S('rect', { x: SX - 13, y: by, width: 26, height: bh, rx: 3, fill: '#c9b27a', stroke: '#9c8350' }, sp);
      for (var j = 1; j * 100 < SM && j < 7; j++) S('line', { x1: SX - 13, y1: by + bh * j * 100 / SM, x2: SX + 13, y2: by + bh * j * 100 / SM, stroke: '#9c8350', 'stroke-width': 0.6 }, sp);
      txt(sp, SX + 18, by + bh / 2 + 3, SM + ' g', { anchor: 'start', fill: '#7a6430', bold: true });
    }
    // 放大镜
    S('line', { x1: 118, y1: py - 8, x2: 212, y2: 30, stroke: '#c9c3d6', 'stroke-dasharray': '3 3' }, sp);
    S('line', { x1: 118, y1: py + 8, x2: 212, y2: 190, stroke: '#c9c3d6', 'stroke-dasharray': '3 3' }, sp);
    S('rect', { x: 212, y: 22, width: 166, height: 176, rx: 10, fill: '#eef1f5', stroke: '#9aa6b5', 'stroke-width': 1.3 }, sp);
    var mg = S('g', { 'clip-path': 'url(#mag-clip)' }, sp), MC = 110;
    for (k = 0; k <= 25; k++) {
      var vv = k * 0.2, yy = MC + (vv - Fd) * 100, bg = k % 5 === 0;
      S('line', { x1: 222, y1: yy, x2: bg ? 262 : 244, y2: yy, stroke: '#5b6475', 'stroke-width': bg ? 1.6 : 1 }, mg);
      if (bg) txt(mg, 270, yy + 5, vv + ' N', { anchor: 'start', fs: 13, fill: '#3d3650', bold: true });
    }
    S('path', { d: 'M226 ' + MC + 'L238 ' + (MC - 5) + 'H372V' + (MC + 5) + 'H238z', fill: '#c2603f', opacity: 0.85 }, mg);
    txt(sp, 295, 16, '放大看指针', { fs: 9.5 });
    txt(sp, 295, 214, '每小格 0.2 N（分度值）', { fs: 9.5, fill: '#5a4097' });
    if (over) {
      S('rect', { x: 204, y: 224, width: 184, height: 26, rx: 8, fill: '#fbeee6', stroke: '#e0b6a6' }, sp);
      txt(sp, 296, 241, '超过量程！弹簧可能被拉坏', { fill: '#a4492b', bold: true });
    }
    readSpring(F, over);
    drawFL(F, over);
  }

  function drawFL(F, over) {
    var ax = L.axes(fl, { xmin: 0, xmax: 7, ymin: 0, ymax: 12, xstep: 1, ystep: 2, xlabel: ' ', ylabel: 'ΔL / cm', left: 36, right: 16, top: 16, bottom: 26 });
    S('rect', { x: ax.X(5), y: ax.Y(12), width: ax.X(7) - ax.X(5), height: ax.Y(0) - ax.Y(12), fill: '#fbeee6', opacity: 0.8 }, ax.layer);
    txt(ax.layer, ax.X(6), ax.Y(11), '超出量程', { fill: '#a4492b', fs: 9.5, bold: true });
    txt(ax.layer, ax.X(6), ax.Y(10) + 2, '不能再用', { fill: '#a4492b', fs: 9 });
    txt(fl, ax.X(7) - 2, ax.Y(0) - 6, 'F / N', { anchor: 'end', fill: '#5b6475', fs: 11 });
    S('line', { x1: ax.X(0), y1: ax.Y(0), x2: ax.X(5), y2: ax.Y(5 * KCM), stroke: '#7a6aa8', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, ax.layer);
    for (var f = 1; f <= 5; f++) S('circle', { cx: ax.X(f), cy: ax.Y(f * KCM), r: 2.5, fill: '#7a6aa8' }, ax.layer);
    if (!over && F > 0) {
      var px = ax.X(F), py = ax.Y(F * KCM);
      S('line', { x1: px, y1: ax.Y(0), x2: px, y2: py, stroke: '#c2603f', 'stroke-dasharray': '3 3' }, ax.layer);
      S('line', { x1: ax.X(0), y1: py, x2: px, y2: py, stroke: '#c2603f', 'stroke-dasharray': '3 3' }, ax.layer);
      S('circle', { cx: px, cy: py, r: 5, fill: '#fff', stroke: '#c2603f', 'stroke-width': 2.4 }, ax.layer);
      txt(ax.layer, px - 8, py - 8, L.fmt(F, 1) + ' N，' + L.fmt(F * KCM, 2) + ' cm', { anchor: 'end', fill: '#a4492b', bold: true });
    }
  }

  var smIn = L.$('#sm-in');
  smIn.value = SM;
  L.bindRange(smIn, function (v) { SM = v; drawSpring(); });

  function readSpring(F, over) {
    L.$('#sm-out').textContent = SM + ' g';
    L.$('#sp-m').innerHTML = L.qty(SM, 'g', 0);
    L.$('#sp-badge').textContent = over ? '超过量程' : (F === 0 ? '已校零' : '正常');
    var t;
    if (over) {
      L.$('#sp-f').innerHTML = '&gt; 5<small>N</small>';
      L.$('#sp-dl').innerHTML = '—';
      L.$('#sp-k').innerHTML = '—';
      t = '钩码重 ' + L.fmt(F, 1) + ' N，已经<b>超过 5 N 的量程</b>，指针被拉到了头，读不出来。继续拉，弹簧可能超过<b>弹性限度</b>，撤去拉力后回不到原长，测力计就坏了。应该换一只量程更大的测力计。';
    } else if (F === 0) {
      L.$('#sp-f').innerHTML = '0<small>N</small>';
      L.$('#sp-dl').innerHTML = '0<small>cm</small>';
      L.$('#sp-k').innerHTML = '—';
      t = '还没挂钩码，指针指在零刻度线。使用前都要先看指针是不是对准 0，没对准要先<b>校零</b>。';
    } else {
      var a = Math.floor(F + 1e-9), b = Math.round((F - a) / 0.2);
      L.$('#sp-f').innerHTML = L.qty(F, 'N', 1);
      L.$('#sp-dl').innerHTML = L.qty(F * KCM, 'cm', 2);
      L.$('#sp-k').innerHTML = L.qty(KCM, 'cm/N', 1);
      t = '拉力 F = G = mg = ' + L.fmt(SM / 1000, 2) + ' kg × 10 N/kg = <b>' + L.fmt(F, 1) + ' N</b>。指针在 ' + a + ' N 下面第 ' + b + ' 小格，分度值 0.2 N，读作 ' + L.fmt(F, 1) + ' N。弹簧伸长 ' + L.fmt(F * KCM, 2) + ' cm，伸长量 ÷ 拉力始终是 1.6 cm/N：<b>伸长量与拉力成正比</b>。';
    }
    L.$('#sp-text').innerHTML = t;
    save();
  }

  /* ========== ② 推门 ========== */
  var door = L.$('#door');
  var PTS = { near: { d: 0.1, name: '靠近门轴' }, mid: { d: 0.4, name: '门中间' }, far: { d: 0.75, name: '门把手处' } };
  var DIRS = { perp: { s: 1, name: '垂直于门板' }, slant: { s: Math.SQRT1_2, name: '斜着推（与门板成 45°）' }, along: { s: 0, name: '沿着门板推向门轴' } };
  var pt = PTS[st.pt] ? st.pt : 'mid';
  var dir = DIRS[st.dr] ? st.dr : 'perp';
  var DF = Math.round(L.num(st.df, 20, 5, 40));
  var HX = 40, HY = 168, DLEN = 280, PXM = 350, THMAX = 35;
  var theta = 0, pushed = false, doorAnim = null;
  function effect() { return DF * PTS[pt].d * DIRS[dir].s; }
  function ratio() { return effect() / (40 * 0.75); }

  function drawDoor() {
    door.innerHTML = '';
    clip(door, 'door-clip', 0, 0, 400, 240, 14);
    S('rect', { x: 0, y: 0, width: 400, height: 240, rx: 14, fill: '#fbfaf7' }, door);
    S('rect', { x: 0, y: HY + 6, width: 400, height: 240 - HY - 6, fill: '#f1eef6', 'clip-path': 'url(#door-clip)' }, door);
    txt(door, 14, 22, '俯视图', { anchor: 'start', fill: '#5b6475', bold: true });
    txt(door, 386, 22, '屋里', { anchor: 'end' });
    txt(door, 386, 232, '门外：你站在这里推门', { anchor: 'end' });
    // 墙
    S('rect', { x: 0, y: HY - 6, width: HX - 8, height: 12, fill: '#b8b2c6' }, door);
    S('rect', { x: HX + DLEN + 6, y: HY - 6, width: 400 - HX - DLEN - 6, height: 12, fill: '#b8b2c6' }, door);
    // 转开角度的弧
    var g = S('g', { 'clip-path': 'url(#door-clip)' }, door);
    S('path', { d: 'M' + (HX + DLEN) + ' ' + HY + 'A' + DLEN + ' ' + DLEN + ' 0 0 0 ' + (HX + DLEN * Math.cos(THMAX * RAD)) + ' ' + (HY - DLEN * Math.sin(THMAX * RAD)), fill: 'none', stroke: '#d9d3e3', 'stroke-dasharray': '4 4' }, g);
    if (theta > 0.5) {
      S('line', { x1: HX, y1: HY, x2: HX + DLEN, y2: HY, stroke: '#c9c3d6', 'stroke-width': 1, 'stroke-dasharray': '3 3' }, g);
      txt(door, HX + 64, HY - 10, '转开 ' + L.fmt(theta, 0) + '°', { anchor: 'start', fill: '#5a4097', bold: true });
    }
    // 门（绕门轴转）
    var dg = S('g', { transform: 'translate(' + HX + ' ' + HY + ') rotate(' + (-theta).toFixed(2) + ')' }, g);
    S('rect', { x: 0, y: -5, width: DLEN, height: 10, rx: 2, fill: '#dcc7a6', stroke: '#a8875e', 'stroke-width': 1.2 }, dg);
    S('rect', { x: 0.75 * PXM - 6, y: 5, width: 12, height: 5, rx: 2, fill: '#8a6d45' }, dg);
    Object.keys(PTS).forEach(function (k) {
      S('circle', { cx: PTS[k].d * PXM, cy: 0, r: k === pt ? 4.5 : 3, fill: k === pt ? '#c2603f' : '#fff', stroke: k === pt ? '#a4492b' : '#a39cb3', 'stroke-width': 1.2 }, dg);
    });
    var x0 = PTS[pt].d * PXM, len = 14 + DF * 1.2, ux, uy, y0 = 5;
    if (dir === 'perp') { ux = 0; uy = -1; }
    else if (dir === 'slant') { ux = Math.SQRT1_2; uy = -Math.SQRT1_2; }
    else { ux = -1; uy = 0; y0 = 0; }
    L.arrow(dg, x0 - ux * len, y0 - uy * len, x0, y0, { color: '#c2603f', width: 2.6, head: 11 });
    txt(dg, x0 - ux * len / 2 + (dir === 'along' ? 0 : 8), y0 - uy * len / 2 + (dir === 'along' ? -10 : 4), 'F = ' + DF + ' N', { anchor: dir === 'along' ? 'middle' : 'start', fill: '#a4492b', bold: true });
    // 门轴
    S('circle', { cx: HX, cy: HY, r: 6, fill: '#5b6475' }, door);
    txt(door, HX, HY + 22, '门轴', { fill: '#3d3650', bold: true });
    txt(door, HX + 0.75 * PXM, HY - 12, '门把手', { fs: 9 });
    readDoor();
  }

  function resetDoor() { if (doorAnim) doorAnim.stop(); theta = 0; pushed = false; }
  L.chips(L.$('#pt-chips'), [{ label: '靠近门轴 0.1 m', value: 'near' }, { label: '门中间 0.4 m', value: 'mid' }, { label: '门把手 0.75 m', value: 'far' }], pt, function (v) { pt = v; resetDoor(); drawDoor(); });
  L.chips(L.$('#dir-chips'), [{ label: '垂直门板', value: 'perp' }, { label: '斜着推', value: 'slant' }, { label: '沿门板推向门轴', value: 'along' }], dir, function (v) { dir = v; resetDoor(); drawDoor(); });
  var dfIn = L.$('#df-in');
  dfIn.value = DF;
  L.bindRange(dfIn, function (v) { DF = v; resetDoor(); drawDoor(); });
  L.$('#push-btn').addEventListener('click', function () {
    resetDoor();
    var tg = THMAX * ratio();
    pushed = true;
    if (L.REDUCED || tg < 0.01) { theta = tg; drawDoor(); return; }
    doorAnim = L.loop(function (dt, t) {
      var k = Math.min(1, t / 1.1);
      theta = tg * (1 - Math.pow(1 - k, 3));
      drawDoor();
      return k < 1;
    });
  });
  L.$('#close-btn').addEventListener('click', function () { resetDoor(); drawDoor(); });

  function readDoor() {
    var r = ratio();
    L.$('#df-out').textContent = DF + ' N';
    L.$('#dr-d').innerHTML = L.qty(PTS[pt].d, 'm', 2);
    L.$('#dr-f').innerHTML = L.qty(DF, 'N', 0);
    L.$('#dr-dir').textContent = DIRS[dir].name;
    L.$('#dr-eff').style.width = (r * 100).toFixed(1) + '%';
    L.$('#door-badge').textContent = r < 0.001 ? '推不动' : r < 0.25 ? '很费劲' : r < 0.6 ? '推得开' : '轻松推开';
    var t;
    if (dir === 'along') t = '力沿着门板指向门轴，用多大的力门都<b>转不起来</b>，只是把门往门轴上挤。力的<b>方向</b>不同，作用效果就不同。';
    else {
      t = '同样 ' + DF + ' N 的力，' + (pt === 'far' ? '推在门把手处，离门轴最远，门最容易转开。' : pt === 'near' ? '推在离门轴很近的地方，门很难推动，得用大得多的力。' : '推在门中间，比推门把手处费劲一些。') + '这说明力的<b>作用点</b>会影响作用效果。';
      if (dir === 'slant') t += '斜着推时，只有一部分力在“转门”，效果比垂直推差。';
      t += '力越大，效果也越明显，这是力的<b>大小</b>。';
    }
    if (pushed) t += ' 推门时，你的手也受到门的推力，物体间力的作用是<b>相互</b>的。';
    L.$('#door-text').innerHTML = t;
    save();
  }

  /* ========== ③ 重力 ========== */
  var grav = L.$('#grav');
  var PL = { e10: { name: '地球', g: 10 }, e98: { name: '地球', g: 9.8 }, moon: { name: '月球', g: 1.6 } };
  var pl = PL[st.pl] ? st.pl : 'e10';
  var GM = Math.round(L.num(st.gm, 50, 1, 60));
  var SL = Math.round(L.num(st.sl, 0, 0, 30));
  var G0 = [200, 170];

  function drawGrav() {
    grav.innerHTML = '';
    clip(grav, 'grav-clip', 0, 0, 400, 240, 14);
    var moon = pl === 'moon';
    S('rect', { x: 0, y: 0, width: 400, height: 240, rx: 14, fill: moon ? '#f0eff4' : '#fbfaf7' }, grav);
    var g = S('g', { 'clip-path': 'url(#grav-clip)' }, grav);
    var s = SL * RAD, tx = Math.cos(s), ty = Math.sin(s), nx = Math.sin(s), ny = -Math.cos(s);
    function at(dist, up) { return [G0[0] + tx * dist + nx * (up || 0), G0[1] + ty * dist + ny * (up || 0)]; }
    var a = at(-260), b = at(260);
    S('path', { d: 'M' + a[0] + ' ' + a[1] + 'L' + b[0] + ' ' + b[1] + 'L' + b[0] + ' 400L' + a[0] + ' 400z', fill: moon ? '#d9d8de' : '#e8e2d4', stroke: moon ? '#a9a7b3' : '#b9a98a', 'stroke-width': 1.5 }, g);
    if (moon) [[-150, 10, 9], [40, 22, 7], [150, 12, 10]].forEach(function (c) { var p = at(c[0], -c[1]); S('ellipse', { cx: p[0], cy: p[1], rx: c[2], ry: c[2] * 0.45, fill: '#c9c7d0' }, g); });
    // 物体
    var B = at(-70), C = at(-70, 23);
    S('rect', { x: -23, y: -46, width: 46, height: 46, rx: 3, fill: '#c8bfe0', stroke: '#7a6aa8', 'stroke-width': 1.3, transform: 'translate(' + B[0].toFixed(1) + ' ' + B[1].toFixed(1) + ') rotate(' + SL + ')' }, g);
    txt(g, C[0], C[1] - 8, GM + ' kg', { fill: '#3d3650', bold: true, fs: 10 });
    // 水平线与直角
    S('line', { x1: C[0] - 40, y1: C[1], x2: C[0] + 40, y2: C[1], stroke: '#8a8598', 'stroke-width': 1, 'stroke-dasharray': '2 3' }, g);
    S('path', { d: 'M' + (C[0] + 8) + ' ' + C[1] + 'V' + (C[1] + 8) + 'H' + C[0], fill: 'none', stroke: '#5a4097', 'stroke-width': 1 }, g);
    txt(g, C[0] + 42, C[1] + 3, '水平', { anchor: 'start', fs: 9 });
    // 垂直于斜面的方向（对照）
    if (SL >= 3) {
      S('line', { x1: C[0], y1: C[1], x2: C[0] - nx * 70, y2: C[1] - ny * 70, stroke: '#a39cb3', 'stroke-width': 1.3, 'stroke-dasharray': '5 4' }, g);
      txt(g, C[0] - nx * 70 + 6, C[1] - ny * 70 + 8, '垂直于斜面，不是重力方向', { anchor: 'start', fs: 9 });
    }
    // 重力
    var G = GM * PL[pl].g, len = 14 + G / 600 * 90;
    S('circle', { cx: C[0], cy: C[1], r: 3, fill: '#a4492b' }, g);
    L.arrow(g, C[0], C[1], C[0], C[1] + len, { color: '#c2603f', width: 2.8, head: 11 });
    txt(g, C[0] + 8, C[1] + len + 10, 'G = ' + L.fmt(G, 1) + ' N', { anchor: 'start', fill: '#a4492b', bold: true });
    txt(g, C[0] - 28, C[1] - 5, '重心', { anchor: 'end', fs: 9, fill: '#5a4097' });
    // 重垂线
    var S0 = at(90), T = at(90, 110), A = [T[0] - tx * 40, T[1] - ty * 40];
    S('line', { x1: S0[0], y1: S0[1], x2: T[0], y2: T[1], stroke: '#8a939e', 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
    S('line', { x1: T[0], y1: T[1], x2: A[0], y2: A[1], stroke: '#8a939e', 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
    S('line', { x1: A[0], y1: A[1], x2: A[0], y2: A[1] + 66, stroke: '#3d3650', 'stroke-width': 1.2 }, g);
    S('path', { d: 'M' + A[0] + ' ' + (A[1] + 64) + 'l-5 8l5 8l5-8z', fill: '#5b6475' }, g);
    txt(g, A[0] - 8, A[1] + 30, '重垂线', { anchor: 'end', fill: '#3d3650', bold: true, fs: 9.5 });
    txt(g, A[0] - 8, A[1] + 43, '始终竖直', { anchor: 'end', fs: 9 });
    txt(grav, 14, 22, moon ? '月球表面' : '地球表面', { anchor: 'start', fill: '#5b6475', bold: true });
    readGrav(G);
  }

  L.chips(L.$('#pl-chips'), [{ label: '地球（g 取 10 N/kg）', value: 'e10' }, { label: '地球（g = 9.8 N/kg）', value: 'e98' }, { label: '月球', value: 'moon' }], pl, function (v) { pl = v; drawGrav(); });
  var gmIn = L.$('#gm-in'), slIn = L.$('#sl-in');
  gmIn.value = GM; slIn.value = SL;
  L.bindRange(gmIn, function (v) { GM = v; drawGrav(); });
  L.bindRange(slIn, function (v) { SL = v; drawGrav(); });

  function readGrav(G) {
    var P = PL[pl];
    L.$('#gm-out').textContent = GM + ' kg';
    L.$('#sl-out').textContent = SL + '°';
    L.$('#gr-badge').textContent = P.name;
    L.$('#gr-m').innerHTML = L.qty(GM, 'kg', 0);
    L.$('#gr-g').innerHTML = (pl === 'moon' ? '约 ' : '') + L.qty(P.g, 'N/kg', 1);
    L.$('#gr-G').innerHTML = L.qty(G, 'N', 1);
    var t = 'G = mg = ' + GM + ' kg × ' + L.fmt(P.g, 1) + ' N/kg = <b>' + L.fmt(G, 1) + ' N</b>。';
    if (pl === 'e10') t += '题目说“g 取 10 N/kg”时这样算，方便心算。';
    else if (pl === 'e98') t += '课本上 g = 9.8 N/kg，题目没说取 10 时就用 9.8。';
    else t += '换到月球，质量还是 ' + GM + ' kg，没有变；重力却只有地球上的约六分之一（地球上 g 取 10 N/kg 时是 ' + GM * 10 + ' N）。所以航天员在月球上能轻松跳得很高。';
    if (SL > 0) t += ' 地面斜了 ' + SL + '°，重力<b>仍然竖直向下</b>，不垂直于斜面；重垂线也仍然竖直，建筑工人就用它检查墙砌得正不正。';
    else t += ' 把地面倾斜试试，重力方向和重垂线会不会跟着斜。';
    L.$('#gr-text').innerHTML = t;
    save();
  }

  function save() { L.setState({ sm: SM, pt: pt, dr: dir, df: DF, pl: pl, gm: GM, sl: SL }); }

  drawSpring();
  drawDoor();
  drawGrav();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '让弹簧测力计的读数是 2.4 N',
      desc: '调整钩码质量（g 取 10 N/kg），让放大镜里的指针正好指在 2.4 N。',
      label: '在弹簧测力计上操作',
      button: '检查读数',
      check: function () {
        var F = force();
        if (Math.abs(F - 2.4) < 1e-6) return { ok: true, msg: '钩码 240 g = 0.24 kg，G = 0.24 kg × 10 N/kg = 2.4 N。指针在 2 N 下面第 2 小格，分度值 0.2 N。' };
        return { ok: false, msg: '现在读数是 ' + (F > 5 ? '超过 5 N' : L.fmt(F, 1) + ' N') + '。想一想：2.4 N 的重力对应多少克的钩码？' };
      }
    },
    {
      level: 'base',
      title: '用手拍桌子，手会感到疼，这说明',
      desc: '想一想：手对桌子施力的同时，桌子有没有对手施力？',
      options: ['物体间力的作用是相互的', '力可以改变物体的形状', '桌子对手的力比手对桌子的力大', '只有手对桌子施加了力'],
      answer: 0,
      hint: '手疼，说明手也受到了力。这个力是谁施加的？',
      explain: '手拍桌子，手对桌子有力，桌子同时对手也有力，所以手会疼：<b>物体间力的作用是相互的</b>。这两个力是同时产生的，并没有哪个更大；手疼不是因为形变，C、D 都说错了。'
    },
    {
      level: 'base',
      title: '下列现象中，力改变了物体运动状态的是',
      desc: '运动状态包括速度的大小和运动的方向。',
      options: ['守门员把飞来的足球扑住', '用力拉弓，弓变弯', '用手捏橡皮泥，橡皮泥变扁', '压缩弹簧，弹簧变短'],
      answer: 0,
      hint: '哪个例子里物体的速度变了？其他几个是什么变了？',
      explain: '足球从运动变为静止，速度变了，是力<b>改变了物体的运动状态</b>。弓变弯、橡皮泥变扁、弹簧变短都是力使物体<b>发生了形变</b>。'
    },
    {
      level: 'mid',
      title: '只用 10 N 的力，让门转动的效果最大',
      desc: '在推门模型里把推力调到 10 N，再选作用点和方向，可以点“推一下”比较。',
      label: '在推门模型里操作',
      button: '检查推法',
      check: function () {
        if (DF !== 10) return { ok: false, msg: '先把推力大小调到 10 N，现在是 ' + DF + ' N。' };
        if (dir !== 'perp') return { ok: false, msg: dir === 'along' ? '沿门板推向门轴，门根本转不起来。换个方向。' : '斜着推只有一部分力在转门。哪个方向效果最好？' };
        if (pt !== 'far') return { ok: false, msg: '方向对了。作用点离门轴近一些还是远一些更省劲？' };
        return { ok: true, msg: '在离门轴最远的门把手处、垂直于门板推，效果最大。门把手装在远离门轴的一侧，就是这个道理。' };
      }
    },
    {
      level: 'mid',
      title: '在月球上，让物体受到的重力是 16 N',
      desc: '在重力模型里选月球（g 约 1.6 N/kg），调整质量。',
      label: '在重力模型里操作',
      button: '检查重力',
      check: function () {
        if (pl !== 'moon') return { ok: false, msg: '先把星球换成“月球”。' };
        if (GM === 10) return { ok: true, msg: 'G = mg = 10 kg × 1.6 N/kg = 16 N。同一个物体在地球上（g 取 10 N/kg）重 100 N，质量都是 10 kg。' };
        return { ok: false, msg: '现在重力是 ' + L.fmt(GM * 1.6, 1) + ' N。用 m = G ÷ g 算一算需要多少千克。' };
      }
    },
    {
      level: 'mid',
      title: '一根弹簧原长 10 cm，挂 2 N 的物体时长 12 cm。挂 5 N 的物体（未超过弹性限度）时，弹簧长度是',
      desc: '成正比的是伸长量，不是长度。',
      options: ['15 cm', '5 cm', '25 cm', '30 cm'],
      answer: 0,
      hint: '先算挂 2 N 时伸长了多少，得出每 1 N 伸长多少。',
      explain: '挂 2 N 伸长 12 − 10 = 2 cm，即每 1 N 伸长 1 cm。挂 5 N 伸长 5 cm，长度 = 10 + 5 = <b>15 cm</b>。5 cm 只是伸长量；25 cm 和 30 cm 都是把“长度”当成和拉力成正比了。'
    },
    {
      level: 'trap',
      title: '一个木块静止在斜面上，它受到的重力方向是',
      desc: '在重力模型里把地面倾斜，观察重力箭头和重垂线。',
      options: ['竖直向下', '垂直于斜面向下', '沿斜面向下', '垂直向下'],
      answer: 0,
      hint: '重力的方向会不会随支持面倾斜而改变？“垂直”要说清垂直于谁。',
      explain: '重力的方向总是<b>竖直向下</b>，和物体放在哪个面上无关。“垂直于斜面”是斜面支持力那条线的方向；“垂直向下”没说清垂直于什么，是常见的错误说法。'
    },
    {
      level: 'trap',
      title: '把一块质量 6 kg 的月球岩石带回地球，它的',
      desc: '可以在重力模型里把质量调到 6 kg，切换月球和地球比一比。',
      options: ['质量不变，重力变大', '质量变大，重力变大', '质量和重力都不变', '质量变小，重力不变'],
      answer: 0,
      hint: '质量会随位置改变吗？g 在月球和地球上一样吗？',
      explain: '质量是物体本身的属性，带到哪里都是 <b>6 kg</b>；地球上的 g 比月球大，所以重力<b>变大</b>：月球上约 6 × 1.6 = 9.6 N，地球上 6 × 9.8 = 58.8 N。'
    }
  ]);
})();
