/* 物理互动馆 · 第 16 课 电压与电阻 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();
  var BG = '#fbfaf7', INK = '#3f3a4f', HOT = '#e8892b';

  /* —— 规范电路元件符号 —— */
  function mix(a, b, t) {
    var pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16), out = [];
    [16, 8, 0].forEach(function (s) { out.push(Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t)); });
    return 'rgb(' + out.join(',') + ')';
  }
  function wire(g, pts, color, w) {
    S('polyline', { points: pts.map(function (p) { return p[0] + ',' + p[1]; }).join(' '), fill: 'none', stroke: color || INK, 'stroke-width': w || 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, g);
  }
  function node(g, x, y) { S('circle', { cx: x, cy: y, r: 3, fill: INK }, g); }
  // n 节电池竖放，正极在上：每节长细线为正极、短粗线为负极
  function battery(g, x, y, n, o) {
    n = n || 1; o = o || {};
    var step = o.gap || 14, span = (n - 1) * step, y0 = y - span / 2, lx = o.left ? x - 24 : x + 19;
    S('rect', { x: x - 4, y: y0 - 5, width: 8, height: span + 10, fill: BG }, g);
    for (var i = 0; i < n; i++) {
      var yc = y0 + i * 14;
      S('line', { x1: x - 14, y1: yc - 4, x2: x + 14, y2: yc - 4, stroke: INK, 'stroke-width': 2 }, g);
      S('line', { x1: x - 7, y1: yc + 4, x2: x + 7, y2: yc + 4, stroke: INK, 'stroke-width': 5 }, g);
      if (i < n - 1) S('line', { x1: x, y1: yc + 4, x2: x, y2: yc + step - 4, stroke: INK, 'stroke-width': 2 }, g);
    }
    S('text', { x: lx, y: y0 + (o.left ? 2 : -2), 'font-size': 12, 'font-weight': 700, fill: '#a4492b', text: '+' }, g);
    S('text', { x: lx, y: y0 + span + (o.left ? 10 : 14), 'font-size': 12, 'font-weight': 700, fill: '#3f6fa8', text: '−' }, g);
  }
  function lamp(g, x, y, glow) {
    if (glow > 0.02) {
      S('circle', { cx: x, cy: y, r: 14 + 11 * glow, fill: '#ffd75e', opacity: 0.15 + 0.3 * glow }, g);
      for (var i = 0; i < 8; i++) {
        var a = i * Math.PI / 4, r1 = 16 + 8 * glow;
        S('line', { x1: x + 16 * Math.cos(a), y1: y + 16 * Math.sin(a), x2: x + r1 * Math.cos(a), y2: y + r1 * Math.sin(a), stroke: '#e8b52a', 'stroke-width': 1.6, 'stroke-linecap': 'round', opacity: 0.4 + 0.6 * glow }, g);
      }
    }
    S('circle', { cx: x, cy: y, r: 11, fill: glow > 0.02 ? mix('#fff6cf', '#ffd75e', glow) : '#fff', stroke: INK, 'stroke-width': 2 }, g);
    var d = 7.8;
    S('path', { d: 'M' + (x - d) + ' ' + (y - d) + 'L' + (x + d) + ' ' + (y + d) + 'M' + (x + d) + ' ' + (y - d) + 'L' + (x - d) + ' ' + (y + d), stroke: INK, 'stroke-width': 1.6 }, g);
  }
  function switchH(g, x, y) {
    S('rect', { x: x - 14, y: y - 3, width: 28, height: 6, fill: BG }, g);
    S('line', { x1: x - 15, y1: y, x2: x + 15, y2: y, stroke: INK, 'stroke-width': 2.2 }, g);
    S('circle', { cx: x - 15, cy: y, r: 2.6, fill: '#fff', stroke: INK, 'stroke-width': 1.6 }, g);
    S('circle', { cx: x + 15, cy: y, r: 2.6, fill: '#fff', stroke: INK, 'stroke-width': 1.6 }, g);
  }
  function meterSym(g, x, y, letter) {
    S('circle', { cx: x, cy: y, r: 11, fill: '#fff', stroke: INK, 'stroke-width': 2 }, g);
    S('text', { x: x, y: y + 4.5, 'font-size': 13, 'font-weight': 700, 'text-anchor': 'middle', fill: INK, text: letter }, g);
  }
  function resistorH(g, x, y, w) {
    S('rect', { x: x - w / 2, y: y - 6, width: w, height: 12, fill: '#fff', stroke: INK, 'stroke-width': 2 }, g);
  }
  function label(g, x, y, t, anchor, o) {
    o = o || {};
    S('text', { x: x, y: y, 'font-size': o.fs || 10.5, 'text-anchor': anchor || 'middle', fill: o.fill || '#4f4862', 'font-weight': o.fw || 600, text: t }, g);
  }
  function clip(svgEl, id, w, h) {
    var d = S('defs', {}, svgEl);
    S('rect', { x: 0, y: 0, width: w, height: h, rx: 14 }, S('clipPath', { id: id }, d));
    return d;
  }
  function brightWord(b) { return b > 0.8 ? '很亮' : b > 0.5 ? '较亮' : b > 0.25 ? '较暗' : '很暗'; }
  function ohm(R) { return R < 1 ? L.fmt(R, 3) : L.fmt(R, 1); }

  /* ========== 影响电阻大小的因素 ========== */
  var MAT = { nicr: ['镍铬合金', 1.0e-6, '#8d8a96'], cu: ['铜', 1.7e-8, '#c77a3b'] };
  var AREA = ['0.1', '0.2'];
  var mat = MAT[st.mt] ? st.mt : 'nicr';
  var len = Math.round(L.num(st.ln, 0.5, 0.2, 1) * 10) / 10;
  var area = AREA.indexOf(st.ar) >= 0 ? st.ar : '0.1';
  var ref = { mat: MAT[st.rm] ? st.rm : 'nicr', len: Math.round(L.num(st.rl, 0.5, 0.2, 1) * 10) / 10, area: AREA.indexOf(st.ra) >= 0 ? st.ra : '0.1' };
  var U1 = 3, RL1 = 5;
  function resOf(c) { return MAT[c.mat][1] * c.len / (+c.area * 1e-6); }
  function cur() { return { mat: mat, len: len, area: area }; }
  var wsvg = L.$('#wire'), lenIn = L.$('#len-in');
  lenIn.value = len;
  var wdefs = clip(wsvg, 'wire-clip', 400, 240);
  function drawWire() {
    wsvg.innerHTML = ''; wsvg.appendChild(wdefs);
    S('rect', { x: 0, y: 0, width: 400, height: 240, rx: 14, fill: BG }, wsvg);
    var g = S('g', { 'clip-path': 'url(#wire-clip)' }, wsvg);
    var R = resOf(cur()), I = U1 / (RL1 + R), b = I * I * RL1 / (U1 * U1 / RL1);
    // 电路图
    wire(g, [[40, 55], [40, 24], [360, 24], [360, 96], [40, 96], [40, 65]]);
    battery(g, 40, 60, 2);
    switchH(g, 110, 24);
    lamp(g, 200, 24, Math.sqrt(b));
    meterSym(g, 290, 24, 'A');
    label(g, 290, 50, '电流表', 'middle', { fs: 9.5, fw: 400, fill: '#7a7488' });
    label(g, 200, 54, '灯泡', 'middle', { fs: 9.5, fw: 400, fill: '#7a7488' });
    resistorH(g, 200, 96, 52);
    node(g, 160, 96); node(g, 240, 96);
    label(g, 160, 86, 'M', 'middle', { fs: 10 }); label(g, 240, 86, 'N', 'middle', { fs: 10 });
    label(g, 200, 116, '待测导线', 'middle', { fs: 9.5, fw: 400, fill: '#7a7488' });
    // 放大的导线
    S('rect', { x: 16, y: 128, width: 368, height: 98, rx: 10, fill: '#f5efe4', stroke: '#e0d3bd' }, g);
    var x0 = 40, x1 = 40 + len * 330, th = area === '0.1' ? 3 : 5.5;
    S('line', { x1: x0, y1: 168, x2: x1, y2: 168, stroke: MAT[mat][2], 'stroke-width': th, 'stroke-linecap': 'round' }, g);
    [[x0, 'M'], [x1, 'N']].forEach(function (p) {
      S('rect', { x: p[0] - 6, y: 160, width: 12, height: 16, rx: 3, fill: '#c9a873', stroke: '#9a7d4c' }, g);
      label(g, p[0], 154, p[1], 'middle', { fs: 10 });
    });
    label(g, 384 - 8, 146, MAT[mat][0] + ' · ' + area + ' mm²', 'end', { fs: 10, fill: MAT[mat][2] === '#8d8a96' ? '#5f5a6b' : '#9c5a26' });
    S('line', { x1: 40, y1: 196, x2: 370, y2: 196, stroke: '#a39b86', 'stroke-width': 1 }, g);
    for (var i = 0; i <= 10; i++) {
      var x = 40 + i * 33;
      S('line', { x1: x, y1: 196, x2: x, y2: i % 2 ? 200 : 203, stroke: '#a39b86', 'stroke-width': 1 }, g);
      if (i % 2 === 0) S('text', { x: x, y: 215, 'font-size': 9, 'text-anchor': 'middle', fill: '#8a7d63', text: L.fmt(i / 10, 1) + (i === 10 ? ' m' : '') }, g);
    }
    wireReadout(R, I, b);
  }
  var FACTOR = { mat: '材料', len: '长度', area: '横截面积' };
  function diffs() { var c = cur(), out = []; ['mat', 'len', 'area'].forEach(function (k) { if (String(c[k]) !== String(ref[k])) out.push(k); }); return out; }
  function show(k, c) { return k === 'mat' ? MAT[c.mat][0] : k === 'len' ? c.len + ' m' : c.area + ' mm²'; }
  function wireReadout(R, I, b) {
    var Rr = resOf(ref), ratio = R / Rr;
    L.$('#len-out').textContent = len + ' m';
    L.$('#r-badge').textContent = MAT[mat][0];
    L.$('#r-out').innerHTML = ohm(R) + '<small>Ω</small>';
    L.$('#i-out').innerHTML = L.fmt(I, 2) + '<small>A</small>';
    L.$('#lamp-out').textContent = brightWord(b);
    L.$('#ratio-out').innerHTML = Math.abs(ratio - 1) < 1e-9 ? '一样' : L.fmt(ratio, ratio < 0.1 ? 3 : 2) + '<small>倍</small>';
    var t = MAT[mat][0] + '导线长 ' + len + ' m、横截面积 ' + area + ' mm²，电阻约 ' + ohm(R) + ' Ω，电流 ' + L.fmt(I, 2) + ' A。';
    t += mat === 'cu'
      ? '铜的电阻非常小，接上它和直接用导线连差不多，灯几乎一样亮——所以<b>导线用铜</b>，而电阻丝和探究实验用<b>镍铬合金</b>，效果才明显。'
      : '同种材料，导线<b>越长</b>电阻越大，<b>越粗</b>电阻越小。';
    L.$('#wire-text').innerHTML = t;
    var c = cur(), d = diffs();
    L.$('#cv-body').innerHTML = ['mat', 'len', 'area'].map(function (k) {
      return '<tr' + (d.indexOf(k) >= 0 ? ' class="on"' : '') + '><td>' + FACTOR[k] + '</td><td>' + show(k, ref) + '</td><td>' + show(k, c) + '</td></tr>';
    }).join('');
    var v;
    if (!d.length) v = '现在这根和对照导线完全一样。改动<b>一个</b>量，看电阻怎么变。';
    else if (d.length > 1) v = '同时改了' + d.map(function (k) { return '“' + FACTOR[k] + '”'; }).join('、') + '，电阻变了也说不清是谁造成的。把多改的改回去，<b>每次只改一个量</b>。';
    else {
      var k = d[0], up = R > Rr;
      if (k === 'len') v = '只改变了<b>长度</b>（' + ref.len + ' m → ' + len + ' m），电阻' + (up ? '变大' : '变小') + '：材料、横截面积相同时，<b>导体越长，电阻越大</b>。';
      else if (k === 'area') v = '只改变了<b>横截面积</b>（' + ref.area + ' → ' + area + ' mm²），电阻' + (up ? '变大' : '变小') + '：材料、长度相同时，<b>横截面积越大，电阻越小</b>。';
      else v = '只改变了<b>材料</b>，电阻变成原来的 ' + L.fmt(ratio, ratio < 0.1 ? 3 : 1) + ' 倍：长度、横截面积相同时，镍铬合金的电阻比铜<b>大得多</b>，电阻与材料有关。';
    }
    L.$('#cv-out').innerHTML = v;
    save();
  }
  L.chips(L.$('#mat-chips'), [{ label: '镍铬合金', value: 'nicr' }, { label: '铜', value: 'cu' }], mat, function (v) { mat = v; drawWire(); });
  L.chips(L.$('#area-chips'), [{ label: '0.1 mm²（细）', value: '0.1' }, { label: '0.2 mm²（粗）', value: '0.2' }], area, function (v) { area = v; drawWire(); });
  L.bindRange(lenIn, function (v) { len = Math.round(v * 10) / 10; drawWire(); });
  L.$('#ref-btn').addEventListener('click', function () { ref = cur(); drawWire(); });

  /* ========== 滑动变阻器调光台灯 ========== */
  var RMAX = 20, U2 = 6, RL2 = 10;
  var CONN = ['AC', 'BD', 'CD', 'AB'];
  var conn = CONN.indexOf(st.cn) >= 0 ? st.cn : 'AC';
  var pp = L.num(st.p, 50, 0, 100);
  var rsvg = L.$('#rheo'), pIn = L.$('#p-in');
  pIn.value = pp;
  var rdefs = clip(rsvg, 'rheo-clip', 400, 250);
  var CX0 = 72, CX1 = 328;
  function rIn() { var f = pp / 100; return conn === 'AC' ? RMAX * f : conn === 'BD' ? RMAX * (1 - f) : conn === 'CD' ? 0 : RMAX; }
  function valid() { return conn === 'AC' || conn === 'BD'; }
  function drawRheo() {
    rsvg.innerHTML = ''; rsvg.appendChild(rdefs);
    S('rect', { x: 0, y: 0, width: 400, height: 250, rx: 14, fill: BG }, rsvg);
    var g = S('g', { 'clip-path': 'url(#rheo-clip)' }, rsvg), i;
    var R = rIn(), I = U2 / (RL2 + R), b = I * I * RL2 / (U2 * U2 / RL2), xp = CX0 + (CX1 - CX0) * pp / 100;
    // —— 电路图 ——
    wire(g, [[50, 52], [50, 22], [350, 22], [350, 92]]);
    wire(g, [[50, 62], [50, 92]]);
    battery(g, 50, 57, 4, { gap: 10, left: true });
    label(g, 76, 60, '6 V', 'start', { fs: 9.5, fw: 400, fill: '#7a7488' });
    switchH(g, 120, 22);
    lamp(g, 240, 22, Math.sqrt(b));
    var sx = 172 + 56 * pp / 100;
    if (conn === 'CD') {
      wire(g, [[50, 92], [350, 92]]);
      label(g, 200, 84, '相当于一根导线', 'middle', { fs: 9.5, fw: 600, fill: '#a4492b' });
    } else if (conn === 'AB') {
      wire(g, [[50, 92], [172, 92]]); wire(g, [[228, 92], [350, 92]]);
      resistorH(g, 200, 92, 56);
      label(g, 200, 78, '相当于 20 Ω 定值电阻', 'middle', { fs: 9.5, fw: 600, fill: '#a4492b' });
    } else {
      var tail = conn === 'AC' ? 290 : 110;
      if (conn === 'AC') { wire(g, [[50, 92], [172, 92]]); wire(g, [[290, 92], [350, 92]]); }
      else { wire(g, [[50, 92], [110, 92]]); wire(g, [[228, 92], [350, 92]]); }
      wire(g, [[sx, 110], [tail, 110], [tail, 92]]);
      resistorH(g, 200, 92, 56);
      L.arrow(g, sx, 110, sx, 99, { color: INK, width: 2, head: 6 });
      node(g, tail, 92);
      label(g, 200, 78, '滑动变阻器', 'middle', { fs: 9.5, fw: 400, fill: '#7a7488' });
    }
    // —— 实物 ——
    S('rect', { x: 46, y: 128, width: 14, height: 88, rx: 3, fill: '#cdc7d8' }, g);
    S('rect', { x: 340, y: 128, width: 14, height: 88, rx: 3, fill: '#cdc7d8' }, g);
    S('rect', { x: 62, y: 178, width: 276, height: 28, rx: 6, fill: '#efe6d6', stroke: '#cdbb9b' }, g);
    var hot = conn === 'AC' ? [CX0, xp] : conn === 'BD' ? [xp, CX1] : conn === 'AB' ? [CX0, CX1] : null;
    if (hot) S('rect', { x: hot[0], y: 176, width: Math.max(0, hot[1] - hot[0]), height: 32, rx: 4, fill: HOT, opacity: 0.32 }, g);
    for (i = CX0; i <= CX1; i += 4) S('line', { x1: i, y1: 179, x2: i + 1.5, y2: 205, stroke: hot && i >= hot[0] - 0.1 && i <= hot[1] + 0.1 ? '#b8611a' : '#8d8a96', 'stroke-width': 1.4 }, g);
    S('rect', { x: 52, y: 136, width: 296, height: 6, rx: 3, fill: '#9a93ad' }, g);
    var bar = conn === 'AC' ? [52, xp] : conn === 'BD' ? [xp, 348] : conn === 'CD' ? [52, 348] : null;
    if (bar) S('line', { x1: bar[0], y1: 139, x2: bar[1], y2: 139, stroke: HOT, 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
    // 接线柱
    var TERM = { A: [40, 196], B: [360, 196], C: [40, 139], D: [360, 139] };
    Object.keys(TERM).forEach(function (k) {
      var t = TERM[k], on = conn.indexOf(k) >= 0;
      if (k === 'A' || k === 'B') S('line', { x1: t[0], y1: t[1], x2: k === 'A' ? CX0 : CX1, y2: 192, stroke: on && hot ? HOT : '#8d8a96', 'stroke-width': 1.6 }, g);
      S('circle', { cx: t[0], cy: t[1], r: 6, fill: on ? HOT : '#c9a873', stroke: on ? '#a85a17' : '#9a7d4c', 'stroke-width': on ? 2 : 1 }, g);
      label(g, t[0] + (k === 'A' || k === 'C' ? -12 : 12), t[1] + 4, k, 'middle', { fs: 11, fw: 700, fill: on ? '#a85a17' : '#6d6876' });
    });
    // 滑片
    var sg = S('g', { class: 'pt', tabindex: 0, role: 'slider', 'aria-label': '滑片 P 的位置', 'aria-valuenow': Math.round(pp), 'aria-valuemin': 0, 'aria-valuemax': 100 }, g);
    S('rect', { x: xp - 18, y: 118, width: 36, height: 64, fill: 'transparent' }, sg);
    S('line', { x1: xp, y1: 146, x2: xp, y2: 179, stroke: valid() ? HOT : '#6f6884', 'stroke-width': 3 }, sg);
    S('rect', { x: xp - 11, y: 130, width: 22, height: 18, rx: 4, fill: '#6f6884', stroke: '#4f4862' }, sg);
    S('circle', { cx: xp, cy: 139, r: 6, fill: 'none', stroke: 'transparent', 'stroke-width': 2 }, sg);
    label(g, xp, 125, 'P ↔', 'middle', { fs: 10, fw: 700, fill: '#5a4097' });
    var why = conn === 'AC' ? '接入电路：A 到 P 这段电阻丝' : conn === 'BD' ? '接入电路：P 到 B 这段电阻丝' : conn === 'CD' ? '电流只走金属杆，电阻丝没接入' : '整根电阻丝都接入，滑片不起作用';
    label(g, 200, 238, why, 'middle', { fs: 10, fw: 600, fill: '#a85a17' });
    bindSlider(sg);
    rheoReadout(R, I, b);
  }
  var dragging = false;
  function bindSlider(el) {
    el.addEventListener('pointerdown', function (e) { dragging = true; try { rsvg.setPointerCapture(e.pointerId); } catch (err) {} e.preventDefault(); });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { setP(pp - 2, true); e.preventDefault(); }
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { setP(pp + 2, true); e.preventDefault(); }
    });
  }
  rsvg.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var p = L.svgPoint(rsvg, e);
    setP((p.x - CX0) / (CX1 - CX0) * 100);
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (n) { rsvg.addEventListener(n, function () { dragging = false; }); });
  function setP(v, refocus) {
    pp = Math.round(L.clamp(v, 0, 100));
    pIn.value = pp; L.paintRange(pIn);
    drawRheo();
    if (refocus) { var el = rsvg.querySelector('.pt'); if (el) el.focus(); }
  }
  function rheoReadout(R, I, b) {
    L.$('#p-out').textContent = Math.round(pp) + '%';
    L.$('#rh-badge').textContent = valid() ? '一上一下 · 能调光' : conn === 'CD' ? '两个都接上面 · 相当于导线' : '两个都接下面 · 相当于定值电阻';
    L.$('#rp-out').innerHTML = L.fmt(R, 1) + '<small>Ω</small>';
    L.$('#ip-out').innerHTML = L.fmt(I, 2) + '<small>A</small>';
    L.$('#lamp2-out').textContent = brightWord(b) + (valid() ? '（可以调）' : '（调不了）');
    var t;
    if (conn === 'AC') t = '接 A、C：电流从 A 进入电阻丝，走到滑片 P，再经金属杆到 C。接入电路的是 <b>A 到 P 这一段</b>。滑片向<b>右</b>（向 B）移，这段变长，电阻变大，电流变小，灯变暗；向左移则变亮。';
    else if (conn === 'BD') t = '接 B、D：接入电路的是 <b>P 到 B 这一段</b>。滑片向<b>左</b>（向 A）移，这段变长，电阻变大，灯变暗；向右移则变亮。哪一段接入，要看<b>下面</b>接的是哪个接线柱。';
    else if (conn === 'CD') t = '同时接上面两个接线柱，电流只走金属杆，<b>电阻丝一点也没接入</b>，相当于一根导线：灯最亮，但移动滑片不起任何作用。';
    else t = '同时接下面两个接线柱，整根电阻丝都接入电路，相当于一个 <b>20 Ω 的定值电阻</b>：灯很暗，移动滑片也调不了。';
    if (valid() && R >= RMAX - 1e-9) t += ' 现在阻值最大，闭合开关前就应该把滑片放在这里，保护电路。';
    if (valid() && R < 1e-9) t += ' 现在接入的电阻为 0，灯最亮。';
    L.$('#rheo-text').innerHTML = t;
    save();
  }
  L.bindRange(pIn, function (v) { pp = v; drawRheo(); });
  L.chips(L.$('#conn-chips'), [{ label: 'A、C（一上一下）', value: 'AC' }, { label: 'B、D（一上一下）', value: 'BD' }, { label: 'C、D（两个上）', value: 'CD' }, { label: 'A、B（两个下）', value: 'AB' }], conn, function (v) { conn = v; drawRheo(); });

  /* ========== 电压规律 ========== */
  var vsvg = L.$('#volt');
  var vdefs = clip(vsvg, 'volt-clip', 400, 230);
  var vmode = st.vm === 'p' ? 'p' : 's';
  var vpos = ['L1', 'L2', 'U'].indexOf(st.vp) >= 0 ? st.vp : 'L1';
  var cells = Math.round(L.num(st.nc, 2, 1, 3));
  var R2 = [5, 10, 20].indexOf(+st.r2) >= 0 ? +st.r2 : 10;
  var R1 = 10, vrec = {};
  function volts() {
    var U = 1.5 * cells;
    if (vmode === 's') return { U: U, L1: U * R1 / (R1 + R2), L2: U * R2 / (R1 + R2) };
    return { U: U, L1: U, L2: U };
  }
  var VWHAT = { L1: 'L1 两端的电压', L2: 'L2 两端的电压', U: '电源两端的电压（总电压）' };
  function drawVolt() {
    vsvg.innerHTML = ''; vsvg.appendChild(vdefs);
    S('rect', { x: 0, y: 0, width: 400, height: 230, rx: 14, fill: BG }, vsvg);
    var g = S('g', { 'clip-path': 'url(#volt-clip)' }, vsvg);
    var v = volts(), PM = 4.5 * 4.5 / 5;
    var span = (cells - 1) * 14, bTop = 125 - span / 2 - 8, bBot = 125 + span / 2 + 8;
    function glowOf(u, r) { return Math.sqrt(Math.min(1, u * u / r / PM)); }
    wire(g, [[50, bTop], [50, 50], [vmode === 's' ? 350 : 320, 50], [vmode === 's' ? 350 : 320, 200], [50, 200], [50, bBot]]);
    battery(g, 50, 125, cells);
    label(g, 84, 129, L.fmt(v.U, 1) + ' V', 'start', { fs: 9.5, fw: 400, fill: '#7a7488' });
    var vp, signs;
    if (vmode === 's') {
      lamp(g, 150, 50, glowOf(v.L1, R1)); label(g, 150, 78, 'L1（10 Ω）', 'middle', { fs: 10 });
      lamp(g, 270, 50, glowOf(v.L2, R2)); label(g, 270, 78, 'L2（' + R2 + ' Ω）', 'middle', { fs: 10 });
      switchH(g, 200, 200); label(g, 200, 220, 'S', 'middle', { fs: 10 });
      if (vpos === 'L1') { vp = [[120, 50], [120, 20], [180, 20], [180, 50]]; signs = [[132, 13], [168, 13]]; }
      else if (vpos === 'L2') { vp = [[240, 50], [240, 20], [300, 20], [300, 50]]; signs = [[252, 13], [288, 13]]; }
    } else {
      wire(g, [[190, 50], [190, 200]]); node(g, 190, 50); node(g, 190, 200);
      switchH(g, 110, 50); label(g, 110, 40, 'S', 'middle', { fs: 10 });
      lamp(g, 190, 125, glowOf(v.L1, R1)); label(g, 208, 129, 'L1（10 Ω）', 'start', { fs: 10 });
      lamp(g, 320, 125, glowOf(v.L2, R2)); label(g, 338, 129, 'L2', 'start', { fs: 10 });
      label(g, 338, 143, R2 + ' Ω', 'start', { fs: 9.5, fw: 400 });
      if (vpos === 'L1') { vp = [[190, 92], [160, 92], [160, 158], [190, 158]]; signs = [[150, 108], [150, 150]]; }
      else if (vpos === 'L2') { vp = [[320, 92], [290, 92], [290, 158], [320, 158]]; signs = [[280, 108], [280, 150]]; }
    }
    if (vpos === 'U') { vp = [[50, 80], [18, 80], [18, 170], [50, 170]]; signs = [[8, 108], [8, 150]]; }
    wire(g, vp, '#5a4097', 1.8);
    node(g, vp[0][0], vp[0][1]); node(g, vp[3][0], vp[3][1]);
    var mx = (vp[1][0] + vp[2][0]) / 2, my = (vp[1][1] + vp[2][1]) / 2;
    meterSym(g, mx, my, 'V');
    label(g, signs[0][0], signs[0][1] + 4, '+', 'middle', { fs: 11, fw: 700, fill: '#a4492b' });
    label(g, signs[1][0], signs[1][1] + 4, '−', 'middle', { fs: 11, fw: 700, fill: '#3f6fa8' });
    voltReadout(v);
  }
  function voltReadout(v) {
    var val = v[vpos];
    vrec[vpos] = val;
    L.$('#v-badge').textContent = vmode === 's' ? '串联' : '并联';
    L.$('#vread-out').innerHTML = L.fmt(val, 2) + '<small>V</small>';
    L.$('#vwhat-out').textContent = VWHAT[vpos];
    var NAME = { L1: 'L1 两端 U<sub>1</sub>', L2: 'L2 两端 U<sub>2</sub>', U: '电源两端 U' };
    L.$('#vrec-body').innerHTML = ['L1', 'L2', 'U'].map(function (k) {
      return '<tr' + (k === vpos ? ' class="on"' : '') + '><td>' + NAME[k] + '</td><td class="n">' + (vrec[k] === undefined ? '还没测' : L.fmt(vrec[k], 2) + ' V') + '</td></tr>';
    }).join('');
    var n = Object.keys(vrec).length, t;
    if (n === 3) {
      if (vmode === 's') t = 'U<sub>1</sub> + U<sub>2</sub> = ' + L.fmt(v.L1, 2) + ' V + ' + L.fmt(v.L2, 2) + ' V = ' + L.fmt(v.U, 2) + ' V，正好等于电源电压：串联电路中<b>电源两端电压等于各用电器两端电压之和</b>。' + (R2 === R1 ? '两盏灯电阻相同，电压平分；换个 L2 的电阻试试。' : '电阻大的那盏灯分到的电压多。');
      else t = 'U<sub>1</sub> = U<sub>2</sub> = U = ' + L.fmt(v.U, 2) + ' V：并联电路中<b>各支路用电器两端的电压相等</b>，都等于电源电压。家里每个用电器两端都是 220 V，就是这个道理。';
    } else t = '已经测了 ' + n + ' 个，把电压表换到别处继续测（换连接方式、电池或 L2 后要重新测）。电压表<b>并联</b>在被测部分两端，所以它跨在元件旁边。';
    t += ' 电源是 ' + cells + ' 节干电池串联，1.5 V × ' + cells + ' = ' + L.fmt(v.U, 1) + ' V。';
    if (val > 3) t += '这个读数超过 3 V，要用电压表的 <b>0～15 V</b> 量程。';
    L.$('#volt-text').innerHTML = t;
    save();
  }
  function resetV() { vrec = {}; }
  L.chips(L.$('#vmode-chips'), [{ label: '串联', value: 's' }, { label: '并联', value: 'p' }], vmode, function (v) { vmode = v; resetV(); drawVolt(); });
  L.chips(L.$('#vpos-chips'), [{ label: 'L1', value: 'L1' }, { label: 'L2', value: 'L2' }, { label: '电源（总电压）', value: 'U' }], vpos, function (v) { vpos = v; drawVolt(); });
  L.chips(L.$('#cell-chips'), [{ label: '1 节', value: '1' }, { label: '2 节', value: '2' }, { label: '3 节', value: '3' }], String(cells), function (v) { cells = +v; resetV(); drawVolt(); });
  L.chips(L.$('#r2-chips'), [{ label: '5 Ω', value: '5' }, { label: '10 Ω', value: '10' }, { label: '20 Ω', value: '20' }], String(R2), function (v) { R2 = +v; resetV(); drawVolt(); });

  function save() {
    L.setState({ mt: mat, ln: len, ar: area, rm: ref.mat, rl: ref.len, ra: ref.area, cn: conn, p: Math.round(pp), vm: vmode, vp: vpos, nc: cells, r2: R2 });
  }

  drawWire();
  drawRheo();
  drawVolt();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '让台灯最亮，而且还能继续调光',
      desc: '在滑动变阻器图里选接线柱、拖滑片：灯要最亮，同时滑片移动时亮度还能改变。',
      label: '在滑动变阻器图里操作',
      button: '检查台灯',
      check: function () {
        if (conn === 'CD') return { ok: false, msg: '接 C、D 时灯确实最亮，可它相当于一根导线，<b>移动滑片调不了光</b>。要“一上一下”。' };
        if (conn === 'AB') return { ok: false, msg: '接 A、B 相当于一个 20 Ω 的定值电阻，既不亮也调不了。要“一上一下”。' };
        if (rIn() < 1e-9) return { ok: true, msg: '一上一下接法，滑片移到' + (conn === 'AC' ? ' A 端' : ' B 端') + '，接入的电阻丝长度为 0，电阻最小、电流最大，灯最亮；往回滑又能调暗。' };
        return { ok: false, msg: '接法对了，但现在还接入了 ' + L.fmt(rIn(), 1) + ' Ω。想想把滑片移到哪一端，接入的电阻丝最短。' };
      }
    },
    {
      level: 'base',
      title: '对人体安全的电压是',
      desc: '记住三个常用电压：一节干电池、家庭电路、安全电压。',
      options: ['不高于 36 V', '等于 36 V', '220 V', '不低于 36 V'],
      answer: 0,
      hint: '是一个“上限”，不是某一个固定值。',
      explain: '对人体安全的电压是<b>不高于 36 V</b>，36 V 是上限，比它低都算安全，所以“等于 36 V”说法不对。220 V 是家庭电路电压，对人体很危险。'
    },
    {
      level: 'base',
      title: '关于电压表的使用，正确的是',
      desc: '和电流表对比着想。',
      options: ['电压表要与被测电路并联', '电压表要串联在被测电路中', '电压表不能直接接在电源两极上', '电流可以从电压表的“−”接线柱流入'],
      answer: 0,
      hint: '测“两端”的电压，表就得跨在两端。',
      explain: '电压表要<b>并联</b>在被测电路两端，电流也要“正进负出”。电压表对电流的阻碍非常大，可以直接接在电源两极上测电源电压——不能直接接电源两极的是<b>电流表</b>。'
    },
    {
      level: 'mid',
      title: '用控制变量法证明：电阻和导线长度有关',
      desc: '在“导线的电阻跟什么有关”里操作。可以先点“把现在这根记为对照”，然后只改一个量，让检查表显示“只改变了长度”。',
      label: '在导线那张图里操作',
      button: '检查我的对比',
      check: function () {
        var d = diffs();
        if (d.length === 1 && d[0] === 'len') return { ok: true, msg: '材料和横截面积都没变，只有长度从 ' + ref.len + ' m 变成 ' + len + ' m，电阻跟着' + (len > ref.len ? '变大' : '变小') + '，说明导体电阻与长度有关。' };
        if (!d.length) return { ok: false, msg: '现在和对照导线一模一样，还没改长度呢。拖动“长度”滑块。' };
        if (d.indexOf('len') < 0) return { ok: false, msg: '你改的是' + d.map(function (k) { return FACTOR[k]; }).join('、') + '，这次要研究的是<b>长度</b>。' };
        return { ok: false, msg: '除了长度，你还改了' + d.filter(function (k) { return k !== 'len'; }).map(function (k) { return FACTOR[k]; }).join('、') + '。把它改回和对照一样，<b>只留长度不同</b>。' };
      }
    },
    {
      level: 'mid',
      title: '让电压表测 L2，读数正好是 1 V',
      desc: '在“电压表测 L1、L2 和电源”里操作。用串联电路，可以改干电池节数和 L2 的电阻。',
      label: '在电压表那张图里操作',
      button: '检查电压表',
      check: function () {
        var v = volts();
        if (vmode !== 's') return { ok: false, msg: '并联时每条支路的电压都等于电源电压（1.5 V 的整数倍），凑不出 1 V。切到串联。' };
        if (vpos !== 'L2') return { ok: false, msg: '电压表现在测的是' + VWHAT[vpos] + '，要测 L2。' };
        if (Math.abs(v.L2 - 1) < 0.005) return { ok: true, msg: 'U<sub>2</sub> = 1 V，U<sub>1</sub> = ' + L.fmt(v.L1, 2) + ' V，加起来正好是电源电压 ' + L.fmt(v.U, 1) + ' V。串联时电阻大的灯分到的电压多。' };
        return { ok: false, msg: '现在 U<sub>2</sub> = ' + L.fmt(v.L2, 2) + ' V。串联时总电压按电阻大小分给两盏灯，试着换换电池节数或 L2 的电阻。' };
      }
    },
    {
      level: 'mid',
      title: 'L1、L2 串联在 6 V 的电源上，L1 两端电压是 2.5 V，L2 两端电压是',
      desc: '串联电路电压的规律是什么？',
      options: ['3.5 V', '6 V', '2.5 V', '8.5 V'],
      answer: 0,
      hint: 'U = U<sub>1</sub> + U<sub>2</sub>。',
      explain: '串联电路 U = U<sub>1</sub> + U<sub>2</sub>，所以 U<sub>2</sub> = 6 V − 2.5 V = <b>3.5 V</b>。6 V 是套用了并联的规律；2.5 V 是以为两灯电压一定相等；8.5 V 是把减法做成了加法。'
    },
    {
      level: 'trap',
      title: '关于导体的电阻，下列说法正确的是',
      desc: '电阻由谁决定？',
      options: ['导体两端电压为零时，它的电阻不为零', '导体两端电压越大，它的电阻越大', '通过导体的电流为零时，它的电阻也为零', '铜导线的电阻一定比镍铬合金导线的电阻小'],
      answer: 0,
      hint: '电阻是导体本身的性质，不接电源它还在吗？',
      explain: '电阻由材料、长度、横截面积（和温度）决定，<b>与电压、电流无关</b>，所以电压为零时电阻照样存在。“电压越大电阻越大”“电流为零电阻为零”都把电阻当成了由电压、电流决定。最后一项没说长度和粗细，一根很长很细的铜线，电阻也可能比一根短粗的镍铬合金线大。'
    },
    {
      level: 'trap',
      title: '滑动变阻器同时接下面两个接线柱 A、B，移动滑片时灯泡',
      desc: '可以在滑动变阻器图里选“A、B（两个下）”，再拖拖滑片。',
      options: ['亮度不变，而且比较暗', '向右移变亮', '向右移变暗', '亮度不变，而且最亮'],
      answer: 0,
      hint: '电流有没有经过滑片？接入的电阻丝长度会变吗？',
      explain: '接 A、B 时，电流从电阻丝一端流到另一端，<b>整根电阻丝都接入</b>，不经过滑片，相当于一个最大阻值的定值电阻，所以灯<b>较暗且亮度不变</b>。“不变而且最亮”是接 C、D（两个上）的情况。'
    }
  ]);
})();
