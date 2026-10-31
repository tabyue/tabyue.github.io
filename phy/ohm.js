/* 物理互动馆 · 第 17 课 欧姆定律 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();
  var INK = '#3d3650', WIRE = '#5b5470', BG = '#fbfaf7';

  /* ========== 电路元件符号 ========== */
  function wire(g, pts, o) {
    o = o || {};
    return S('path', { d: 'M' + pts.map(function (p) { return p[0] + ' ' + p[1]; }).join('L'), fill: 'none', stroke: o.color || WIRE, 'stroke-width': o.w || 1.8, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, g);
  }
  function node(g, x, y) { S('circle', { cx: x, cy: y, r: 2.8, fill: WIRE }, g); }
  function resistor(g, cx, cy, w) {
    w = w || 44;
    S('rect', { x: cx - w / 2, y: cy - 7, width: w, height: 14, fill: '#fff', stroke: INK, 'stroke-width': 1.6 }, g);
  }
  function meter(g, cx, cy, ch) {
    S('circle', { cx: cx, cy: cy, r: 11, fill: '#fff', stroke: INK, 'stroke-width': 1.6 }, g);
    S('text', { x: cx, y: cy + 4.5, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: INK, text: ch }, g);
  }
  /* 电池：导线水平，长细线是正极，短粗线是负极 */
  function cell(g, cx, cy) {
    S('rect', { x: cx - 6, y: cy - 4, width: 12, height: 8, fill: BG }, g);
    S('line', { x1: cx - 3, y1: cy - 12, x2: cx - 3, y2: cy + 12, stroke: INK, 'stroke-width': 1.6 }, g);
    S('line', { x1: cx + 3, y1: cy - 6, x2: cx + 3, y2: cy + 6, stroke: INK, 'stroke-width': 3.6 }, g);
  }
  function switchClosed(g, x1, x2, y) {
    S('rect', { x: x1, y: y - 4, width: x2 - x1, height: 8, fill: BG }, g);
    S('line', { x1: x1, y1: y, x2: x2, y2: y - 2.5, stroke: INK, 'stroke-width': 1.8, 'stroke-linecap': 'round' }, g);
    S('circle', { cx: x1, cy: y, r: 2.4, fill: '#fff', stroke: INK, 'stroke-width': 1.4 }, g);
    S('circle', { cx: x2, cy: y, r: 2.4, fill: '#fff', stroke: INK, 'stroke-width': 1.4 }, g);
  }
  function lampSym(g, cx, cy, r, glow) {
    if (glow > 0.01) S('circle', { cx: cx, cy: cy, r: r + 3 + 8 * glow, fill: '#f7c948', opacity: 0.2 + 0.35 * glow }, g);
    S('circle', { cx: cx, cy: cy, r: r, fill: glow > 0.01 ? '#fff4c9' : '#fff', stroke: INK, 'stroke-width': 1.6 }, g);
    var d = r * 0.707;
    S('path', { d: 'M' + (cx - d) + ' ' + (cy - d) + 'L' + (cx + d) + ' ' + (cy + d) + 'M' + (cx + d) + ' ' + (cy - d) + 'L' + (cx - d) + ' ' + (cy + d), stroke: INK, 'stroke-width': 1.4 }, g);
  }

  /* 探究电路和伏安法电路共用：电源、开关、滑动变阻器在下，电流表、被测元件在上，电压表并在被测元件两端 */
  function drawLoop(el, o) {
    el.innerHTML = '';
    var defs = S('defs', {}, el), cp = S('clipPath', { id: o.clip }, defs);
    S('rect', { x: 0, y: 0, width: 400, height: 230, rx: 14 }, cp);
    S('rect', { x: 0, y: 0, width: 400, height: 230, rx: 14, fill: BG }, el);
    var g = S('g', { 'clip-path': 'url(#' + o.clip + ')' }, el);
    var T = 82, B = 186, LX = 40, RX = 344;
    var xs = 310 - o.frac * 80;               // 滑片位置：接入的是滑片到右端这一段
    wire(g, [[206, B], [LX, B], [LX, T], [RX, T], [RX, B], [310, B]]);
    wire(g, [[160, T], [160, 36], [240, 36], [240, T]]);
    wire(g, [[xs, B - 26], [206, B - 26], [206, B]]);
    node(g, 160, T); node(g, 240, T);
    meter(g, 96, T, 'A');
    meter(g, 200, 36, 'V');
    if (o.load === 'lamp') lampSym(g, 200, T, 12, o.glow || 0); else resistor(g, 200, T, 44);
    cell(g, 96, B);
    switchClosed(g, 146, 172, B);
    S('rect', { x: 230, y: B - 6, width: 80, height: 12, fill: '#fff' }, g);
    S('rect', { x: xs, y: B - 6, width: 310 - xs, height: 12, fill: '#e4def1' }, g);
    S('rect', { x: 230, y: B - 6, width: 80, height: 12, fill: 'none', stroke: INK, 'stroke-width': 1.6 }, g);
    L.arrow(g, xs, B - 26, xs, B - 6.5, { color: INK, width: 1.6, head: 7 });
    // 文字
    var TC = '#5b5470';
    S('text', { x: 96, y: T + 27, 'font-size': 11, 'text-anchor': 'middle', fill: '#a4492b', 'font-weight': 600, text: o.itext }, g);
    S('text', { x: 250, y: 40, 'font-size': 11, fill: '#5a4097', 'font-weight': 600, text: o.utext }, g);
    S('text', { x: 200, y: T + 27, 'font-size': 11, 'text-anchor': 'middle', fill: TC, text: o.loadLabel }, g);
    S('text', { x: 96, y: B + 28, 'font-size': 10.5, 'text-anchor': 'middle', fill: TC, text: o.srcLabel }, g);
    S('text', { x: 159, y: B - 10, 'font-size': 10.5, 'text-anchor': 'middle', fill: TC, text: 'S' }, g);
    S('text', { x: 270, y: B + 22, 'font-size': 10.5, 'text-anchor': 'middle', fill: TC, text: o.rheoLabel }, g);
    S('text', { x: 392, y: 222, 'font-size': 9, 'text-anchor': 'end', fill: '#8a8598', text: '浅紫色是变阻器接入电路的部分' }, g);
  }

  /* ========== ① 探究 I 与 U、R ========== */
  var US = 6, RMAX = 50;
  var COLORS = { 5: '#c2603f', 10: '#5a4097', 20: '#3f8a6a' };
  var R = [5, 10, 20].indexOf(+st.r) >= 0 ? +st.r : 10;
  var Rp = Math.round(L.num(st.p, 20, 0, RMAX) * 2) / 2;
  var pts = { 5: [], 10: [], 20: [] };
  var change = null;                          // 记录最近一次换电阻：{from, to, u0}
  var circ = L.$('#ohm-circ'), iu = L.$('#iu');
  function cur() { var I = US / (R + Rp); return { I: I, U: I * R, Up: I * Rp }; }

  function drawOhm() {
    var c = cur();
    drawLoop(circ, {
      clip: 'ohm-clip', load: 'R', frac: Rp / RMAX,
      itext: 'I = ' + L.fmt(c.I, 2) + ' A', utext: 'U = ' + L.fmt(c.U, 2) + ' V',
      loadLabel: 'R = ' + R + ' Ω', srcLabel: '电源 6 V', rheoLabel: 'R′ = ' + L.fmt(Rp, 1) + ' Ω'
    });
    L.$('#rp-out').textContent = L.fmt(Rp, 1) + ' Ω';
    L.$('#ohm-badge').textContent = 'R = ' + R + ' Ω';
    L.$('#u-read').innerHTML = L.qty(c.U, 'V', 2);
    L.$('#i-read').innerHTML = L.qty(c.I, 'A', 2);
    L.$('#ui-read').innerHTML = L.qty(R, 'Ω', 1);
    L.$('#up-read').innerHTML = L.qty(c.Up, 'V', 2);
    var t;
    if (change && change.to === R && Math.abs(c.U - change.u0) > 0.03) {
      t = '刚才把 R 从 ' + change.from + ' Ω 换成 ' + R + ' Ω，滑片没动，电压表示数却从 ' + L.fmt(change.u0, 2) + ' V 变成了 ' + L.fmt(c.U, 2) + ' V。要研究电流和电阻的关系，得<b>移动滑片，让电压回到 ' + L.fmt(change.u0, 2) + ' V</b>，这就是控制变量。';
    } else if (change && change.to === R) {
      t = '换电阻后电压又回到了 ' + L.fmt(change.u0, 2) + ' V，现在可以公平比较：电压一定时，' + change.from + ' Ω 时电流 ' + L.fmt(change.u0 / change.from, 2) + ' A，' + R + ' Ω 时电流 ' + L.fmt(c.I, 2) + ' A——<b>电阻越大，电流越小</b>，电流与电阻成反比。';
    } else {
      t = 'R 一直是 ' + R + ' Ω。R′ 调大，电路中电流变小，R 分到的电压也变小；但 U ÷ I 始终等于 ' + R + ' Ω。<b>电阻一定时，电流与电压成正比。</b>';
    }
    L.$('#ohm-text').innerHTML = t;
    drawIU();
    save();
  }

  function drawIU() {
    var XM = 6.5, YM = 1.3;
    var ax = L.axes(iu, { xmin: 0, xmax: XM, ymin: 0, ymax: YM, xstep: 1, ystep: 0.2, xlabel: ' ', ylabel: 'I / A', left: 36, right: 16, top: 16, bottom: 26 });
    S('text', { x: ax.X(XM), y: ax.Y(0) - 7, 'font-size': 11, 'text-anchor': 'end', fill: '#5b6475', 'font-style': 'italic', text: 'U / V' }, ax.layer);
    var defs = S('defs', {}, iu), cp = S('clipPath', { id: 'iu-clip' }, defs);
    S('rect', { x: ax.X(0), y: ax.Y(YM), width: ax.X(XM) - ax.X(0), height: ax.Y(0) - ax.Y(YM) }, cp);
    var g = S('g', { 'clip-path': 'url(#iu-clip)' }, ax.layer);
    [20, 10, 5].forEach(function (r) {
      var p = pts[r];
      if (p.length >= 2) {
        S('line', { x1: ax.X(0), y1: ax.Y(0), x2: ax.X(XM), y2: ax.Y(XM / r), stroke: COLORS[r], 'stroke-width': 1.8, opacity: 0.85 }, g);
        var ue = Math.min(XM, YM * r);
        S('text', { x: ax.X(ue) - 4, y: ax.Y(ue / r) - 6, 'font-size': 10.5, 'text-anchor': 'end', fill: COLORS[r], 'font-weight': 700, text: r + ' Ω' }, ax.layer);
      }
      p.forEach(function (q) { S('circle', { cx: ax.X(q.U), cy: ax.Y(q.I), r: 3.6, fill: COLORS[r] }, g); });
    });
    var c = cur();
    S('line', { x1: ax.X(c.U), y1: ax.Y(0), x2: ax.X(c.U), y2: ax.Y(c.I), stroke: COLORS[R], 'stroke-dasharray': '3 3', opacity: 0.6 }, g);
    S('line', { x1: ax.X(0), y1: ax.Y(c.I), x2: ax.X(c.U), y2: ax.Y(c.I), stroke: COLORS[R], 'stroke-dasharray': '3 3', opacity: 0.6 }, g);
    S('circle', { cx: ax.X(c.U), cy: ax.Y(c.I), r: 5, fill: '#fff', stroke: COLORS[R], 'stroke-width': 2 }, g);
    var n = [5, 10, 20].map(function (r) { return r + ' Ω：' + pts[r].length + ' 个点'; }).join('　');
    var lines = [5, 10, 20].filter(function (r) { return pts[r].length >= 2; }).length;
    L.$('#iu-note').innerHTML = n + (lines >= 2 ? '<br>几条直线都过原点，<b>电阻越大，直线越平</b>：同样的电压，大电阻里的电流小。' : '<br>每种电阻记两个以上不同电压的点，再换一种电阻比一比。');
  }

  var rpIn = L.$('#rp-in');
  rpIn.value = Rp;
  L.bindRange(rpIn, function (v) { Rp = v; drawOhm(); });
  L.chips(L.$('#r-chips'), [{ label: '5 Ω', value: '5' }, { label: '10 Ω', value: '10' }, { label: '20 Ω', value: '20' }], String(R), function (v) {
    var u0 = cur().U;
    change = { from: R, to: +v, u0: u0 };
    R = +v; drawOhm();
  });
  L.$('#rec-btn').addEventListener('click', function () {
    var c = cur(), p = pts[R];
    var same = p.some(function (q) { return Math.abs(q.U - c.U) < 0.05; });
    if (same) { L.$('#ohm-text').innerHTML = '这个电压已经记过了。拖一下滑片，换个电压再记。'; return; }
    p.push({ U: c.U, I: c.I });
    if (p.length > 8) p.shift();
    drawIU();
  });
  L.$('#clear-btn').addEventListener('click', function () { pts = { 5: [], 10: [], 20: [] }; drawIU(); });

  /* ========== ② 伏安法测电阻 ========== */
  var VA_US = 3, VA_RMAX = 20, RX = 12;
  var vaMode = st.m === 'lamp' ? 'lamp' : 'rx';
  var Rpv = Math.round(L.num(st.q, 10, 0, VA_RMAX) * 2) / 2;
  var rows = [];
  var vaMsg = '';
  var va = L.$('#va');
  function lampR(U) { return 4 + 2.4 * U; }   // 灯丝越热电阻越大（简化模型）
  function vaSolve() {
    if (vaMode === 'rx') { var I = VA_US / (RX + Rpv); return { U: I * RX, I: I }; }
    var lo = 0, hi = VA_US;
    for (var k = 0; k < 50; k++) {
      var m = (lo + hi) / 2;
      if (m + Rpv * m / lampR(m) > VA_US) hi = m; else lo = m;
    }
    var U = (lo + hi) / 2;
    return { U: U, I: U / lampR(U) };
  }
  function vaRead() {
    var s = vaSolve();
    return { U: Math.round(s.U * 10 + 1e-9) / 10, I: Math.round(s.I * 100 + 1e-9) / 100, P: s.U * s.I };
  }
  function avgR() { return rows.reduce(function (a, r) { return a + r.U / r.I; }, 0) / rows.length; }

  function drawVA() {
    var r = vaRead();
    drawLoop(va, {
      clip: 'va-clip', load: vaMode === 'lamp' ? 'lamp' : 'R', glow: L.clamp(r.P / 0.75, 0, 1), frac: Rpv / VA_RMAX,
      itext: 'I = ' + r.I.toFixed(2) + ' A', utext: 'U = ' + r.U.toFixed(1) + ' V',
      loadLabel: vaMode === 'lamp' ? '小灯泡 2.5 V' : 'Rx = ?', srcLabel: '电源 3 V', rheoLabel: 'R′ = ' + L.fmt(Rpv, 1) + ' Ω'
    });
    L.$('#rpv-out').textContent = L.fmt(Rpv, 1) + ' Ω';
    L.$('#va-badge').textContent = vaMode === 'lamp' ? '测小灯泡' : '测定值电阻';
    L.$('#va-u').innerHTML = r.U.toFixed(1) + '<small>V</small>';
    L.$('#va-i').innerHTML = r.I.toFixed(2) + '<small>A</small>';
    L.$('#va-r').innerHTML = r.I > 0 ? L.qty(r.U / r.I, 'Ω', 1) : '—';
    var body = L.$('#va-body');
    body.innerHTML = '';
    rows.forEach(function (w, k) {
      L.html('tr', { html: '<td>' + (k + 1) + '</td><td class="n">' + w.U.toFixed(1) + '</td><td class="n">' + w.I.toFixed(2) + '</td><td class="n">' + (w.U / w.I).toFixed(1) + '</td>' }, body);
    });
    if (rows.length === 3) {
      L.html('tr', { class: 'on', html: vaMode === 'rx'
        ? '<td>平均值</td><td colspan="3">R = (' + rows.map(function (w) { return L.fmt(w.U / w.I, 1); }).join(' + ') + ') ÷ 3 ≈ <b>' + avgR().toFixed(1) + ' Ω</b></td>'
        : '<td>平均值</td><td colspan="3">不求平均：灯丝温度不同，电阻本来就不同</td>' }, body);
    }
    var t = vaMsg ? vaMsg + ' ' : '';
    vaMsg = '';
    if (vaMode === 'lamp' && r.U > 2.55) t += '电压已经超过小灯泡的额定电压 2.5 V，灯特别亮，时间长了可能烧坏，应把滑片往阻值大的方向移。';
    if (rows.length < 3) t += '已记 ' + rows.length + ' 组。移动滑片，换一个电压再记下一组。';
    else if (vaMode === 'rx') t += '三次算出的电阻略有差别，这是读数带来的误差。取<b>平均值 ' + avgR().toFixed(1) + ' Ω</b> 作为结果，误差更小。（模型里 Rx 的真实值是 12 Ω。）';
    else t += '三次结果差别明显，而且<b>电压越高，算出的电阻越大</b>：灯越亮，灯丝温度越高，电阻越大。这不是误差，所以不能求平均值。';
    L.$('#va-text').innerHTML = t;
    save();
  }
  var rpvIn = L.$('#rpv-in');
  rpvIn.value = Rpv;
  L.bindRange(rpvIn, function (v) { Rpv = v; drawVA(); });
  L.chips(L.$('#va-chips'), [{ label: '定值电阻 Rx', value: 'rx' }, { label: '小灯泡', value: 'lamp' }], vaMode, function (v) { vaMode = v; rows = []; drawVA(); });
  L.$('#va-rec').addEventListener('click', function () {
    var r = vaRead();
    var k = -1;
    rows.forEach(function (w, j) { if (Math.abs(w.U - r.U) < 0.05) k = j; });
    if (k >= 0) vaMsg = '这一组和第 ' + (k + 1) + ' 次的电压一样，换个电压再记。';
    else { rows.push({ U: r.U, I: r.I }); if (rows.length > 3) rows.shift(); }
    drawVA();
  });
  L.$('#va-clear').addEventListener('click', function () { rows = []; drawVA(); });

  /* ========== ③ 串联分压、并联分流 ========== */
  var spMode = st.s === 'p' ? 'p' : 's';
  var R1 = Math.round(L.num(st.a, 10, 1, 30)), R2 = Math.round(L.num(st.b, 20, 1, 30));
  var Usp = Math.round(L.num(st.u, 6, 1.5, 12) * 2) / 2;
  var sp = L.$('#sp');
  function spCalc() {
    if (spMode === 's') {
      var Rt = R1 + R2, I = Usp / Rt;
      return { R: Rt, I: I, U1: I * R1, U2: I * R2, I1: I, I2: I };
    }
    var Rp2 = R1 * R2 / (R1 + R2);
    return { R: Rp2, I: Usp / Rp2, U1: Usp, U2: Usp, I1: Usp / R1, I2: Usp / R2 };
  }
  function bar(g, y, a, b, la, lb, ca, cb) {
    var x0 = 50, w = 300, wa = w * a / (a + b);
    S('rect', { x: x0, y: y, width: wa, height: 16, fill: ca }, g);
    S('rect', { x: x0 + wa, y: y, width: w - wa, height: 16, fill: cb }, g);
    S('rect', { x: x0, y: y, width: w, height: 16, fill: 'none', stroke: '#fff', 'stroke-width': 1, rx: 3 }, g);
    if (wa > 54) S('text', { x: x0 + wa / 2, y: y + 12, 'font-size': 10.5, 'text-anchor': 'middle', fill: '#fff', 'font-weight': 600, text: la }, g);
    if (w - wa > 54) S('text', { x: x0 + wa + (w - wa) / 2, y: y + 12, 'font-size': 10.5, 'text-anchor': 'middle', fill: '#fff', 'font-weight': 600, text: lb }, g);
  }
  function drawSP() {
    var c = spCalc();
    sp.innerHTML = '';
    var defs = S('defs', {}, sp), cp = S('clipPath', { id: 'sp-clip' }, defs);
    S('rect', { x: 0, y: 0, width: 400, height: 220, rx: 14 }, cp);
    S('rect', { x: 0, y: 0, width: 400, height: 220, rx: 14, fill: BG }, sp);
    var g = S('g', { 'clip-path': 'url(#sp-clip)' }, sp);
    var CU = '#5a4097', CI = '#c2603f', TX = { 'font-size': 11, 'text-anchor': 'middle', fill: '#5b5470' };
    if (spMode === 's') {
      var T = 62, B = 160, LX = 50, RX = 350;
      wire(g, [[LX, T], [RX, T], [RX, B], [LX, B], [LX, T]]);
      resistor(g, 140, T, 50); resistor(g, 260, T, 50);
      cell(g, 200, B);
      S('text', { x: 140, y: T + 27, 'font-size': 11, 'text-anchor': 'middle', fill: TX.fill, text: 'R₁ = ' + R1 + ' Ω' }, g);
      S('text', { x: 260, y: T + 27, 'font-size': 11, 'text-anchor': 'middle', fill: TX.fill, text: 'R₂ = ' + R2 + ' Ω' }, g);
      S('text', { x: 140, y: T - 15, 'font-size': 11.5, 'text-anchor': 'middle', fill: CU, 'font-weight': 700, text: 'U₁ = ' + L.fmt(c.U1, 2) + ' V' }, g);
      S('text', { x: 260, y: T - 15, 'font-size': 11.5, 'text-anchor': 'middle', fill: CU, 'font-weight': 700, text: 'U₂ = ' + L.fmt(c.U2, 2) + ' V' }, g);
      L.arrow(g, RX, 92, RX, 128, { color: CI, width: 1.8, head: 7 });
      S('text', { x: RX - 8, y: 114, 'font-size': 11, 'text-anchor': 'end', fill: CI, 'font-weight': 600, text: 'I = ' + L.fmt(c.I, 2) + ' A' }, g);
      S('text', { x: 200, y: B + 24, 'font-size': 10.5, 'text-anchor': 'middle', fill: TX.fill, text: '电源 U = ' + L.fmt(Usp, 1) + ' V' }, g);
      bar(g, 194, c.U1, c.U2, 'U₁ ' + L.fmt(c.U1, 2) + ' V', 'U₂ ' + L.fmt(c.U2, 2) + ' V', '#7a64b0', '#b3a5d6');
    } else {
      var LX2 = 60, RX2 = 340, T1 = 44, T2 = 104, B2 = 160;
      wire(g, [[LX2, T1], [RX2, T1]]);
      wire(g, [[LX2, T2], [RX2, T2]]);
      wire(g, [[LX2, T1], [LX2, B2], [RX2, B2], [RX2, T1]]);
      node(g, LX2, T2); node(g, RX2, T2);
      resistor(g, 200, T1, 50); resistor(g, 200, T2, 50);
      cell(g, 200, B2);
      S('text', { x: 200, y: T1 + 25, 'font-size': 11, 'text-anchor': 'middle', fill: TX.fill, text: 'R₁ = ' + R1 + ' Ω' }, g);
      S('text', { x: 200, y: T2 + 25, 'font-size': 11, 'text-anchor': 'middle', fill: TX.fill, text: 'R₂ = ' + R2 + ' Ω' }, g);
      L.arrow(g, 92, T1, 126, T1, { color: CI, width: 1.8, head: 7 });
      L.arrow(g, 92, T2, 126, T2, { color: CI, width: 1.8, head: 7 });
      S('text', { x: 92, y: T1 - 8, 'font-size': 11, fill: CI, 'font-weight': 600, text: 'I₁ = ' + L.fmt(c.I1, 2) + ' A' }, g);
      S('text', { x: 92, y: T2 - 8, 'font-size': 11, fill: CI, 'font-weight': 600, text: 'I₂ = ' + L.fmt(c.I2, 2) + ' A' }, g);
      L.arrow(g, LX2, B2 - 8, LX2, T2 + 14, { color: CI, width: 1.8, head: 7 });
      S('text', { x: LX2 + 8, y: 140, 'font-size': 11, fill: CI, 'font-weight': 600, text: 'I = ' + L.fmt(c.I, 2) + ' A' }, g);
      S('text', { x: 290, y: T1 - 8, 'font-size': 11, 'text-anchor': 'middle', fill: CU, 'font-weight': 700, text: 'U₁ = ' + L.fmt(Usp, 1) + ' V' }, g);
      S('text', { x: 290, y: T2 - 8, 'font-size': 11, 'text-anchor': 'middle', fill: CU, 'font-weight': 700, text: 'U₂ = ' + L.fmt(Usp, 1) + ' V' }, g);
      S('text', { x: 200, y: B2 + 24, 'font-size': 10.5, 'text-anchor': 'middle', fill: TX.fill, text: '电源 U = ' + L.fmt(Usp, 1) + ' V' }, g);
      bar(g, 194, c.I1, c.I2, 'I₁ ' + L.fmt(c.I1, 2) + ' A', 'I₂ ' + L.fmt(c.I2, 2) + ' A', '#c2603f', '#e3a58c');
    }
    L.$('#r1-out').textContent = R1 + ' Ω';
    L.$('#r2-out').textContent = R2 + ' Ω';
    L.$('#us-out').textContent = L.fmt(Usp, 1) + ' V';
    L.$('#sp-badge').textContent = spMode === 's' ? '串联' : '并联';
    L.$('#sp-r').innerHTML = L.qty(c.R, 'Ω', 2);
    L.$('#sp-i').innerHTML = L.qty(c.I, 'A', 2);
    L.$('#sp-u1').innerHTML = L.qty(c.U1, 'V', 2);
    L.$('#sp-u2').innerHTML = L.qty(c.U2, 'V', 2);
    L.$('#sp-i1').innerHTML = L.qty(c.I1, 'A', 2);
    L.$('#sp-i2').innerHTML = L.qty(c.I2, 'A', 2);
    var gg = L.gcd(R1, R2), a = R1 / gg, b = R2 / gg;
    L.$('#sp-text').innerHTML = spMode === 's'
      ? '串联只有一条路，<b>I₁ = I₂</b>。电压按电阻分：U₁ : U₂ = R₁ : R₂ = ' + a + ' : ' + b + '，电阻大的分得多。总电阻 R = R₁ + R₂ = ' + (R1 + R2) + ' Ω，比任何一个都大。'
      : '并联各支路都接在电源两端，<b>U₁ = U₂ = U</b>。电流按电阻反着分：I₁ : I₂ = R₂ : R₁ = ' + b + ' : ' + a + '，电阻小的支路电流大。总电阻 R = R₁R₂ ÷ (R₁ + R₂) ≈ ' + L.fmt(c.R, 2) + ' Ω，比最小的 ' + Math.min(R1, R2) + ' Ω 还小。';
    save();
  }
  L.chips(L.$('#sp-chips'), [{ label: '串联', value: 's' }, { label: '并联', value: 'p' }], spMode, function (v) { spMode = v; drawSP(); });
  var r1In = L.$('#r1-in'), r2In = L.$('#r2-in'), usIn = L.$('#us-in');
  r1In.value = R1; r2In.value = R2; usIn.value = Usp;
  L.bindRange(r1In, function (v) { R1 = v; drawSP(); });
  L.bindRange(r2In, function (v) { R2 = v; drawSP(); });
  L.bindRange(usIn, function (v) { Usp = v; drawSP(); });

  function save() { L.setState({ r: R, p: Rp, m: vaMode, q: Rpv, s: spMode, a: R1, b: R2, u: Usp }); }

  drawOhm();
  drawVA();
  drawSP();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '用 10 Ω 电阻，让电压表示数为 3 V',
      desc: '在第一个电路里选 10 Ω 的定值电阻，拖动滑动变阻器，让 R 两端电压正好是 3 V，看看电流是多少。',
      label: '在“探究电流与电压、电阻的关系”里操作',
      button: '检查电表读数',
      check: function () {
        var c = cur();
        if (R !== 10) return { ok: false, msg: '现在接的是 ' + R + ' Ω，先换成 10 Ω。' };
        if (Math.abs(c.U - 3) < 0.03) return { ok: true, msg: '电流 I = U/R = 3 V ÷ 10 Ω = 0.3 A。变阻器接入 ' + L.fmt(Rp, 1) + ' Ω，分走了另外 3 V。' };
        if (c.U > 3) return { ok: false, msg: '电压是 ' + L.fmt(c.U, 2) + ' V，偏大了。把 R′ 调<b>大</b>一些，让变阻器多分点电压。' };
        return { ok: false, msg: '电压是 ' + L.fmt(c.U, 2) + ' V，偏小了。把 R′ 调<b>小</b>一些。' };
      }
    },
    {
      level: 'base',
      title: '某导体两端电压 6 V 时，通过它的电流是 0.3 A，它的电阻是',
      desc: '用欧姆定律的变形式。',
      options: ['20 Ω', '1.8 Ω', '0.05 Ω', '2 Ω'],
      answer: 0,
      hint: 'R = U ÷ I，电压除以电流。',
      explain: 'R = U/I = 6 V ÷ 0.3 A = <b>20 Ω</b>。1.8 Ω 是把 U 和 I 乘起来了；0.05 Ω 是 I 除以 U，把式子倒过来了。'
    },
    {
      level: 'base',
      title: '电阻一定时，通过导体的电流与它两端的电压',
      desc: '可以在 I–U 图上看看同一种颜色的点。',
      options: ['成正比', '成反比', '没有关系', '电流越大，电压越小'],
      answer: 0,
      hint: '同一个电阻，电压翻倍，电流怎么变？I–U 图像是一条什么样的线？',
      explain: '电阻一定时，I–U 图像是过原点的直线，<b>电流与电压成正比</b>。注意要说“电流与电压成正比”，不说“电压与电流成正比”：电压是形成电流的原因。'
    },
    {
      level: 'mid',
      title: '换成 20 Ω 后，让电压仍然保持 2 V',
      desc: '探究电流与电阻的关系时，要让每个电阻两端电压都是 2 V。把定值电阻换成 20 Ω，再调变阻器。',
      label: '在“探究电流与电压、电阻的关系”里操作',
      button: '检查是否控制住了电压',
      check: function () {
        var c = cur();
        if (R !== 20) return { ok: false, msg: '先把定值电阻换成 20 Ω。' };
        if (Math.abs(c.U - 2) < 0.03) return { ok: true, msg: '电压保持 2 V，电流 I = 2 V ÷ 20 Ω = 0.1 A。变阻器要分 4 V，接入 R′ = 4 V ÷ 0.1 A = 40 Ω。电阻变大，变阻器也得跟着调大。' };
        if (c.U > 2) return { ok: false, msg: '电压表示数是 ' + L.fmt(c.U, 2) + ' V，比 2 V 大。换大电阻后它分到的电压变多了，要把 R′ <b>调大</b>。' };
        return { ok: false, msg: '电压表示数是 ' + L.fmt(c.U, 2) + ' V，比 2 V 小，把 R′ 调小一点。' };
      }
    },
    {
      level: 'mid',
      title: '用伏安法测出 Rx，记三组数据',
      desc: '在“伏安法测电阻”里选定值电阻 Rx，移动滑片，记下三组不同电压下的数据，表格会算出平均值。',
      label: '在“伏安法测电阻”里操作',
      button: '检查实验记录',
      check: function () {
        if (vaMode !== 'rx') return { ok: false, msg: '这题要测的是定值电阻 Rx，先切回“定值电阻 Rx”。' };
        if (rows.length < 3) return { ok: false, msg: '表里只有 ' + rows.length + ' 组数据。每次移动滑片换一个电压，再按“记录一组”。' };
        return { ok: true, msg: '平均值 R ≈ ' + avgR().toFixed(1) + ' Ω。多测几次求平均，可以减小读数带来的误差。' };
      }
    },
    {
      level: 'mid',
      title: '把一个 10 Ω 电阻和一个 1000 Ω 电阻并联，总电阻',
      desc: '可以在第三个电路里用并联、R₁ 小 R₂ 大的情况感受一下。',
      options: ['小于 10 Ω', '等于 1010 Ω', '在 10 Ω 和 1000 Ω 之间', '约等于 505 Ω'],
      answer: 0,
      hint: '并联相当于导体变粗了还是变长了？',
      explain: '1/R = 1/10 Ω + 1/1000 Ω，R ≈ 9.9 Ω，<b>比最小的 10 Ω 还小</b>。1010 Ω 是串联的算法；505 Ω 是把两个电阻取平均，并联不能这样算。'
    },
    {
      level: 'trap',
      title: '由 I = U/R 变形得到 R = U/I，下列说法正确的是',
      desc: '想清楚电阻由什么决定。',
      options: ['导体的电阻与它两端的电压、通过的电流无关', '导体的电阻与它两端的电压成正比', '导体的电阻与通过它的电流成反比', '导体两端电压为零时，电阻也为零'],
      answer: 0,
      hint: '电阻由导体的材料、长度、横截面积和温度决定。电压变了，这些变了吗？',
      explain: '电阻是导体本身的性质，<b>与电压、电流无关</b>。电压翻倍，电流也翻倍，U/I 不变。没加电压时电阻照样存在，所以 D 也错。R = U/I 只是计算电阻的方法。'
    },
    {
      level: 'trap',
      title: '测小灯泡电阻，三次算出 6.4 Ω、8.3 Ω、10.0 Ω，正确的做法是',
      desc: '三次实验电压依次升高，灯越来越亮。可以在“伏安法测电阻”里换成小灯泡试一试。',
      options: ['如实记录，说明灯丝电阻随温度升高而增大，不求平均值', '求平均值约 8.2 Ω，作为小灯泡的电阻', '去掉最大值和最小值，取 8.3 Ω', '数据有错，重新测到三次结果相同为止'],
      answer: 0,
      hint: '三次结果是忽大忽小，还是随电压升高一直变大？',
      explain: '电阻随电压升高<b>一直变大</b>，这是灯丝温度升高造成的，不是误差，<b>不能求平均</b>。求平均只适用于定值电阻：它的电阻不变，几次结果的差别来自读数误差。'
    }
  ]);
})();
