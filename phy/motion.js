/* 物理互动馆 · 第 1 课 机械运动 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();

  /* ========== 两辆车：速度、参照物、s–t 图象 ========== */
  var va = L.num(st.va, 5, 1, 10), vb = L.num(st.vb, 8, 0, 10), t = L.num(st.t, 0, 0, 10);
  va = Math.round(va * 2) / 2; vb = Math.round(vb * 2) / 2;
  var ref = st.ref === 'a' ? 'a' : 'g';
  var road = L.$('#road'), stEl = L.$('#st');
  var RK = 3.4;                       // 1 m = 3.4 px
  var CA = '#5a4097', CB = '#d08a2c';  // 甲紫、乙橙

  function car(parent, x, y, color, name) {
    var g = S('g', {}, parent);
    S('rect', { x: x - 30, y: y - 8, width: 30, height: 12, rx: 3, fill: color }, g);
    S('path', { d: 'M' + (x - 24) + ' ' + (y - 8) + 'l4 -7h11l5 7z', fill: color, opacity: 0.75 }, g);
    S('circle', { cx: x - 23, cy: y + 5, r: 3.6, fill: '#3b3548' }, g);
    S('circle', { cx: x - 7, cy: y + 5, r: 3.6, fill: '#3b3548' }, g);
    S('text', { x: x - 15, y: y + 2, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#fff', 'font-weight': 700, text: name }, g);
    return g;
  }

  function drawRoad() {
    road.innerHTML = '';
    var defs = S('defs', {}, road), cp = S('clipPath', { id: 'road-clip' }, defs);
    S('rect', { x: 0, y: 0, width: 400, height: 112, rx: 14 }, cp);
    S('rect', { x: 0, y: 0, width: 400, height: 112, rx: 14, fill: '#fbfaf7' }, road);
    var sa = va * t, sb = vb * t;
    var X = ref === 'g' ? function (s) { return 34 + s * RK; } : function (s) { return 200 + (s - sa) * RK; };
    var w = S('g', { 'clip-path': 'url(#road-clip)' }, road);
    var smin = ref === 'g' ? -10 : sa - 70, smax = ref === 'g' ? 120 : sa + 70, m;
    // 路边的树（每 20 m 一棵）
    for (m = Math.ceil(smin / 20) * 20; m <= smax; m += 20) {
      var tx = X(m) - 10;
      S('rect', { x: tx - 1.5, y: 18, width: 3, height: 10, fill: '#9c7b55' }, w);
      S('circle', { cx: tx, cy: 14, r: 8, fill: '#8fbf8a' }, w);
    }
    // 路面与车道线
    S('rect', { x: 0, y: 30, width: 400, height: 62, fill: '#e9e6ef' }, w);
    for (m = Math.ceil(smin / 6) * 6; m <= smax; m += 6) S('rect', { x: X(m), y: 60, width: 3 * RK, height: 2, fill: '#fff' }, w);
    // 路程刻度（以地面为准）
    for (m = Math.ceil(smin / 10) * 10; m <= smax; m += 10) {
      if (m < 0 || m > 100) continue;
      S('line', { x1: X(m), y1: 92, x2: X(m), y2: m % 20 === 0 ? 99 : 96, stroke: '#a39cb3' }, w);
      if (m % 20 === 0) S('text', { x: X(m), y: 108, 'font-size': 9, 'text-anchor': 'middle', fill: '#8a8598', text: m + (m === 100 ? ' m' : '') }, w);
    }
    // 车与速度箭头（箭头表示相对所选参照物的速度）
    var ra = ref === 'g' ? va : 0, rb = ref === 'g' ? vb : vb - va;
    car(w, X(sa), 46, CA, '甲');
    car(w, X(sb), 78, CB, '乙');
    [[sa, 46, ra, CA], [sb, 78, rb, CB]].forEach(function (c) {
      var x = X(c[0]);
      if (Math.abs(c[2]) < 0.01) { S('text', { x: x + 5, y: c[1] - 2, 'font-size': 9, fill: c[3], 'font-weight': 600, text: '静止' }, w); return; }
      if (c[2] > 0) L.arrow(w, x + 3, c[1] - 2, x + 3 + c[2] * 5, c[1] - 2, { color: c[3], width: 2, head: 6 });
      else L.arrow(w, x - 33, c[1] - 2, x - 33 + c[2] * 5, c[1] - 2, { color: c[3], width: 2, head: 6 });
    });
    // 参照物标签
    S('rect', { x: 300, y: 33, width: 96, height: 15, rx: 7, fill: '#fff', opacity: 0.9 }, road);
    S('text', { x: 348, y: 44, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#5a4097', 'font-weight': 600, text: ref === 'g' ? '参照物：地面' : '参照物：甲车' }, road);
  }

  function drawST() {
    var ax = L.axes(stEl, { xmin: 0, xmax: 10, ymin: 0, ymax: 100, xstep: 1, ystep: 10, labelStep: 2, ylabelStep: 20, xlabel: 't / s', ylabel: 's / m', left: 36, right: 18, top: 14, bottom: 24 });
    var defs = S('defs', {}, stEl), cp = S('clipPath', { id: 'st-clip' }, defs);
    S('rect', { x: ax.X(0), y: ax.Y(100) - 4, width: ax.X(10) - ax.X(0) + 4, height: ax.Y(0) - ax.Y(100) + 4 }, cp);
    var g = S('g', { 'clip-path': 'url(#st-clip)' }, ax.layer);
    S('text', { x: ax.X(1.6), y: ax.Y(93), 'font-size': 10, fill: '#8a8598', text: '同一时刻比路程：直线越陡，速度越大' }, ax.layer);
    [[va, CA], [vb, CB]].forEach(function (c) {
      S('line', { x1: ax.X(0), y1: ax.Y(0), x2: ax.X(10), y2: ax.Y(c[0] * 10), stroke: c[1], 'stroke-width': 1.2, 'stroke-dasharray': '3 4', opacity: 0.45 }, g);
      S('line', { x1: ax.X(0), y1: ax.Y(0), x2: ax.X(t), y2: ax.Y(c[0] * t), stroke: c[1], 'stroke-width': 2.6, 'stroke-linecap': 'round' }, g);
      S('circle', { cx: ax.X(t), cy: ax.Y(c[0] * t), r: 4, fill: c[1], stroke: '#fff', 'stroke-width': 1.5 }, g);
    });
    // 线尾标签
    var ya = ax.Y(va * 10), yb = ax.Y(vb * 10);
    if (va === vb) S('text', { x: ax.X(10) - 4, y: ya - 6, 'font-size': 10, 'text-anchor': 'end', fill: '#3b3548', 'font-weight': 600, text: '甲、乙重合' }, ax.layer);
    else {
      if (Math.abs(ya - yb) < 12) { if (ya < yb) { ya -= 5; yb += 7; } else { yb -= 5; ya += 7; } }
      S('text', { x: ax.X(10) - 4, y: Math.max(ya - 4, 22), 'font-size': 10, 'text-anchor': 'end', fill: CA, 'font-weight': 600, text: '甲' }, ax.layer);
      S('text', { x: ax.X(10) - 4, y: Math.max(yb - 4, 22), 'font-size': 10, 'text-anchor': 'end', fill: CB, 'font-weight': 600, text: '乙' }, ax.layer);
    }
    // 当前时刻竖线
    S('line', { x1: ax.X(t), y1: ax.Y(0), x2: ax.X(t), y2: ax.Y(100), stroke: '#b8b2c6', 'stroke-dasharray': '2 3' }, g);
  }

  function speedHtml(v) { return L.fmt(v, 1) + '<small>m/s</small><small>= ' + L.fmt(v * 3.6, 1) + ' km/h</small>'; }
  function carReadout() {
    var sa = va * t, sb = vb * t, d = sb - sa, dv = vb - va;
    L.$('#va-out').textContent = L.fmt(va, 1) + ' m/s';
    L.$('#vb-out').textContent = L.fmt(vb, 1) + ' m/s';
    L.$('#t-out').textContent = L.fmt(t, 1) + ' s';
    L.$('#va-stat').innerHTML = speedHtml(va);
    L.$('#vb-stat').innerHTML = speedHtml(vb);
    L.$('#sa-stat').innerHTML = L.qty(sa, 'm', 1);
    L.$('#sb-stat').innerHTML = L.qty(sb, 'm', 1);
    L.$('#car-badge').textContent = dv > 0 ? '乙车快' : dv < 0 ? '甲车快' : '一样快';
    var rel;
    if (ref === 'g') rel = vb === 0 ? '以地面为参照物：乙车静止' : '以地面为参照物：乙车向前，' + L.fmt(vb, 1) + ' m/s';
    else rel = dv === 0 ? '以甲车为参照物：乙车静止' : '以甲车为参照物：乙车向' + (dv > 0 ? '前' : '后') + '，' + L.fmt(Math.abs(dv), 1) + ' m/s';
    L.$('#rel-stat').textContent = rel;
    var txt = 't = ' + L.fmt(t, 1) + ' s 时，甲走了 ' + L.fmt(sa, 1) + ' m，乙走了 ' + L.fmt(sb, 1) + ' m';
    txt += t === 0 ? '，两车都在起点。' : (Math.abs(d) < 1e-9 ? '，两车并排。' : '，乙在甲' + (d > 0 ? '前面 ' : '后面 ') + L.fmt(Math.abs(d), 1) + ' m。');
    if (ref === 'g') {
      txt += dv === 0 ? ' 两条直线重合，说明速度一样。' : ' 在 s–t 图上，' + (dv > 0 ? '乙' : '甲') + '的直线更陡，所以' + (dv > 0 ? '乙' : '甲') + '更快。';
    } else {
      txt += ' 以甲车为参照物，甲车自己是<b>静止</b>的，路边的树反而以 ' + L.fmt(va, 1) + ' m/s <b>向后退</b>——坐车时觉得“树往后跑”就是这个道理。';
      txt += dv === 0 ? '乙车和甲车同速，相对甲车也静止。' : '乙车相对甲车的速度是两车速度之差 ' + L.fmt(Math.abs(dv), 1) + ' m/s。';
    }
    L.$('#car-text').innerHTML = txt;
    L.$$('#speed-table tbody tr').forEach(function (tr) {
      var v0 = { walk: 1.1, bike: 5 }[tr.dataset.r];
      tr.classList.toggle('on', !!v0 && (Math.abs(va - v0) <= 0.5 || Math.abs(vb - v0) <= 0.5));
    });
  }
  function drawCars() { drawRoad(); drawST(); carReadout(); save(); }

  var vaIn = L.$('#va-in'), vbIn = L.$('#vb-in'), tIn = L.$('#t-in'), playBtn = L.$('#car-play');
  vaIn.value = va; vbIn.value = vb; tIn.value = t;
  L.bindRange(vaIn, function (v) { va = v; drawCars(); });
  L.bindRange(vbIn, function (v) { vb = v; drawCars(); });
  L.bindRange(tIn, function (v) { stopCars(); t = v; drawCars(); });
  function setT(v) { t = L.clamp(v, 0, 10); tIn.value = t; L.paintRange(tIn); drawCars(); }
  L.chips(L.$('#ref-chips'), [{ label: '以地面为参照物', value: 'g' }, { label: '以甲车为参照物', value: 'a' }], ref, function (v) { ref = v; drawCars(); });
  var carAnim = null;
  function stopCars() { if (carAnim) { carAnim.stop(); carAnim = null; } playBtn.textContent = t > 0 && t < 10 ? '继续' : '开始'; }
  playBtn.addEventListener('click', function () {
    if (carAnim) { stopCars(); return; }
    if (t >= 10) setT(0);
    if (L.REDUCED) { setT(10); stopCars(); return; }
    playBtn.textContent = '暂停';
    carAnim = L.loop(function (dt) {
      var nt = t + dt * 2;               // 动画里 1 秒走 2 秒模拟时间
      if (nt >= 10) { setT(10); carAnim = null; playBtn.textContent = '开始'; return false; }
      setT(nt);
    });
  });
  L.$('#car-reset').addEventListener('click', function () { stopCars(); setT(0); playBtn.textContent = '开始'; });

  /* ========== 刻度尺读数 ========== */
  var ruler = L.$('#ruler');
  var RX0 = 20, RK2 = 36;            // 0 cm 在 x=20，1 cm = 36 px
  var div = st.d === 'cm' ? 'cm' : 'mm';
  var prec = [0, 1, 2].indexOf(+st.p) >= 0 ? +st.p : 1;
  var o0 = [1, 2, 3].indexOf(+st.o0) >= 0 ? +st.o0 : 2;
  var o1 = L.num(st.o1, 7.463, o0 + 2.5, 9.6);
  var rd = L.num(st.r, 0, 0, 10);
  var checked = false;
  function need() { return div === 'mm' ? 2 : 1; }
  function rnd(x, d) { var k = Math.pow(10, d); return Math.round(x * k + 1e-9) / k; }
  function RXp(c) { return RX0 + c * RK2; }

  function ticks(parent, X, from, to, top, scale) {
    var stepCm = div === 'mm' ? 0.1 : 1;
    for (var i = Math.ceil(from / stepCm - 1e-9); i * stepCm <= to + 1e-9; i++) {
      var c = rnd(i * stepCm, 1), whole = Math.abs(c - Math.round(c)) < 1e-6, half = div === 'mm' && i % 5 === 0;
      var h = (whole ? 13 : half ? 9 : 5.5) * scale;
      S('line', { x1: X(c), y1: top, x2: X(c), y2: top + h, stroke: '#5b4a2e', 'stroke-width': whole ? 1.3 : 1 }, parent);
      if (whole) S('text', { x: X(c), y: top + 13 * scale + 11, 'font-size': 10, 'text-anchor': 'middle', fill: '#5b4a2e', text: Math.round(c) }, parent);
    }
  }

  function drawRuler() {
    ruler.innerHTML = '';
    var defs = S('defs', {}, ruler), cp = S('clipPath', { id: 'mag-clip' }, defs);
    S('rect', { x: 92, y: 160, width: 216, height: 66, rx: 10 }, cp);
    S('rect', { x: 0, y: 0, width: 400, height: 232, rx: 14, fill: '#fbfaf7' }, ruler);
    // 物体
    S('rect', { x: RXp(o0), y: 64, width: (o1 - o0) * RK2, height: 44, fill: '#d9cdee', stroke: '#7a6aa8', 'stroke-width': 1 }, ruler);
    S('text', { x: RXp((o0 + o1) / 2), y: 90, 'font-size': 11, 'text-anchor': 'middle', fill: '#5a4097', 'font-weight': 600, text: '被测物体' }, ruler);
    // 尺
    S('rect', { x: 10, y: 108, width: 380, height: 40, rx: 4, fill: '#f3e7c4', stroke: '#c9a873' }, ruler);
    ticks(ruler, RXp, 0, 10, 108, 1);
    S('text', { x: 384, y: 144, 'font-size': 9, 'text-anchor': 'end', fill: '#8a7350', text: 'cm' }, ruler);
    S('text', { x: 16, y: 20, 'font-size': 10, fill: '#8a8598', text: '分度值 ' + (div === 'mm' ? '1 mm：每小格 1 mm' : '1 cm：每小格 1 cm') }, ruler);
    // 左端对齐提示
    S('line', { x1: RXp(o0), y1: 56, x2: RXp(o0), y2: 108, stroke: '#c2603f', 'stroke-dasharray': '3 3' }, ruler);
    S('text', { x: RXp(o0), y: 50, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#a4492b', text: '左端对准 ' + o0 + ' cm' }, ruler);
    // 放大镜
    var ex = RXp(o1);
    S('circle', { cx: ex, cy: 110, r: 14, fill: 'none', stroke: '#5a4097', 'stroke-width': 1.4, 'stroke-dasharray': '3 2' }, ruler);
    S('path', { d: 'M' + (ex - 10) + ' 122L100 160M' + (ex + 10) + ' 122L300 160', stroke: '#b8b2c6', fill: 'none' }, ruler);
    var win = div === 'mm' ? 1.6 : 2.2, Z = 216 / win, X = function (c) { return 200 + (c - o1) * Z; };
    var mg = S('g', { 'clip-path': 'url(#mag-clip)' }, ruler);
    S('rect', { x: 92, y: 160, width: 216, height: 66, fill: '#fff' }, mg);
    S('rect', { x: 0, y: 160, width: 200, height: 24, fill: '#d9cdee' }, mg);
    S('line', { x1: 200, y1: 160, x2: 200, y2: 184, stroke: '#7a6aa8', 'stroke-width': 1.5 }, mg);
    S('rect', { x: 80, y: 184, width: 240, height: 50, fill: '#f3e7c4' }, mg);
    ticks(mg, X, o1 - win / 2 - 0.1, o1 + win / 2 + 0.1, 184, 1.5);
    S('rect', { x: 92, y: 160, width: 216, height: 66, rx: 10, fill: 'none', stroke: '#5a4097', 'stroke-width': 1.4 }, ruler);
    S('text', { x: 86, y: 196, 'font-size': 10, 'text-anchor': 'end', fill: '#5a4097', text: '放大看' }, ruler);
    S('text', { x: 86, y: 209, 'font-size': 10, 'text-anchor': 'end', fill: '#5a4097', text: '右端' }, ruler);
    rulerReadout();
  }

  function judge() {
    var n = need(), unit = n === 2 ? 0.01 : 0.1, ans = rnd(o1 - o0, n), endR = rnd(o1, n);
    var lo = Math.floor(o1 / (n === 2 ? 0.1 : 1) + 1e-9) * (n === 2 ? 0.1 : 1);
    var between = L.fmt(lo, 1) + ' cm 和 ' + L.fmt(lo + (n === 2 ? 0.1 : 1), 1) + ' cm';
    if (prec < n) return { ok: false, msg: '少了估读的那一位。分度值是 ' + (div === 'mm' ? '1 mm' : '1 cm') + '，要估读到它的下一位，也就是 <b>' + (n === 2 ? '0.01 cm（0.1 mm）' : '0.1 cm') + '</b>。把“记录到”改一改。' };
    if (prec > n) return { ok: false, msg: '多记了一位。分度值 1 cm 的尺，只能在两条厘米线之间估读到 <b>0.1 cm</b>，再往后一位全靠瞎猜，没有意义。' };
    if (Math.abs(rd - ans) <= unit + 1e-6) return { ok: true, msg: '长度 = 末端读数 ' + endR.toFixed(n) + ' cm − 起点读数 ' + o0.toFixed(n) + ' cm = <b>' + ans.toFixed(n) + ' cm</b>。最后一位是估读的，估得差一点也算对，但这一位必须写。' };
    if (Math.abs(rd - endR) <= unit + 1e-6) return { ok: false, msg: '你写的是右端对着的刻度（末端读数）。物体左端在 ' + o0 + ' cm 处，不是 0 刻度，长度要<b>减去起点读数</b>。' };
    return { ok: false, msg: '数值差得有点多。看放大镜：右端落在 ' + between + ' 之间，先读出准确的部分，再估计它在两条线之间的几成位置，最后减去起点 ' + o0 + ' cm。' };
  }

  function rulerReadout() {
    var n = need();
    L.$('#read-out').textContent = rd.toFixed(prec) + ' cm';
    L.$('#ruler-div').innerHTML = div === 'mm' ? '1<small>mm</small>' : '1<small>cm</small>';
    L.$('#ruler-start').innerHTML = o0.toFixed(n) + '<small>cm</small>';
    L.$('#ruler-you').innerHTML = rd.toFixed(prec) + '<small>cm</small>';
    var badge = L.$('#ruler-badge'), txt = L.$('#ruler-text');
    if (checked) {
      var r = judge();
      L.$('#ruler-ans').innerHTML = rnd(o1 - o0, n).toFixed(n) + '<small>cm</small>';
      badge.textContent = r.ok ? '读对了' : '再看看';
      txt.innerHTML = r.msg;
    } else {
      L.$('#ruler-ans').innerHTML = '<small>核对后显示</small>';
      badge.textContent = '待核对';
      txt.innerHTML = div === 'mm'
        ? '这把尺每小格 1 mm。读数要<b>估读到 0.01 cm</b>（毫米的下一位），比如 5.43 cm：5.4 cm 是准确值，最后的 3 是估出来的。别忘了减去起点读数。'
        : '这把尺每小格 1 cm，只能估读到 <b>0.1 cm</b>，比如 5.4 cm：5 cm 是准确值，0.4 cm 是估出来的。同一个物体，尺越精细，记录的位数越多。';
    }
    save();
  }

  var readIn = L.$('#read-in');
  function stepOf() { return [1, 0.1, 0.01][prec]; }
  function syncRead() { readIn.step = stepOf(); readIn.value = rd; L.paintRange(readIn); }
  L.bindRange(readIn, function (v) { rd = rnd(v, prec); checked = false; rulerReadout(); });
  rd = rnd(rd, prec); syncRead();
  L.$('#read-minus').addEventListener('click', function () { rd = rnd(L.clamp(rd - stepOf(), 0, 10), prec); checked = false; syncRead(); rulerReadout(); });
  L.$('#read-plus').addEventListener('click', function () { rd = rnd(L.clamp(rd + stepOf(), 0, 10), prec); checked = false; syncRead(); rulerReadout(); });
  L.$('#ruler-check').addEventListener('click', function () { checked = true; rulerReadout(); });
  L.$('#ruler-new').addEventListener('click', function () {
    o0 = 1 + Math.floor(Math.random() * 3);
    o1 = rnd(o0 + 3 + Math.random() * 3.4, 3);
    checked = false; drawRuler();
  });
  L.chips(L.$('#div-chips'), [{ label: '1 cm', value: 'cm' }, { label: '1 mm', value: 'mm' }], div, function (v) { div = v; checked = false; drawRuler(); });
  L.chips(L.$('#prec-chips'), [{ label: '1 cm（如 5 cm）', value: '0' }, { label: '0.1 cm（如 5.4 cm）', value: '1' }, { label: '0.01 cm（如 5.43 cm）', value: '2' }], String(prec), function (v) {
    prec = +v; rd = rnd(rd, prec); checked = false; syncRead(); rulerReadout();
  });

  /* ========== 斜面测平均速度 ========== */
  var slope = L.$('#slope');
  var slopeK = st.k === 'hi' ? 'hi' : 'lo';
  var stopAt = st.m === 'end' ? 'end' : 'mid';
  var ACC = { lo: 0.1, hi: 0.2 }, ANG = { lo: 12, hi: 22 };   // 加速度 m/s²、画面倾角
  var rec = { front: null, all: null }, lastRow = null;
  var sw = 0, carS = 0, slopeAnim = null;
  var BX = 352, BY = 186, PL = 300;    // 斜面底端、全长 80 cm 对应 300 px

  function geo() {
    var a = ANG[slopeK] * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    return { c: c, s: s, deg: ANG[slopeK], ax: BX - PL * c, ay: BY - PL * s, P: function (m) { var k = m / 0.8 * PL; return [BX - PL * c + k * c, BY - PL * s + k * s]; } };
  }
  function drawSlope() {
    slope.innerHTML = '';
    var defs = S('defs', {}, slope), cp = S('clipPath', { id: 'slope-clip' }, defs);
    S('rect', { x: 0, y: 0, width: 400, height: 220, rx: 14 }, cp);
    S('rect', { x: 0, y: 0, width: 400, height: 220, rx: 14, fill: '#fbfaf7' }, slope);
    var g = geo(), w = S('g', { 'clip-path': 'url(#slope-clip)' }, slope);
    S('line', { x1: 8, y1: 192, x2: 392, y2: 192, stroke: '#cfc9da', 'stroke-width': 2 }, w);
    S('rect', { x: g.ax - 16, y: g.ay + 1, width: 24, height: 191 - g.ay, fill: '#e6e2ec', stroke: '#c9c2d6' }, w);
    S('line', { x1: g.ax - 30 * g.c, y1: g.ay - 30 * g.s, x2: BX + 6 * g.c, y2: BY + 6 * g.s, stroke: '#c9a873', 'stroke-width': 6, 'stroke-linecap': 'round' }, w);
    // A、M、B 标记
    [[0, 'A 起点'], [0.4, 'M 中点'], [0.8, 'B 底端']].forEach(function (p) {
      var q = g.P(p[0]);
      S('line', { x1: q[0] + 5 * g.s, y1: q[1] - 5 * g.c, x2: q[0] - 8 * g.s, y2: q[1] + 8 * g.c, stroke: '#7a6aa8', 'stroke-width': 1.4 }, w);
      if (p[0] === 0) { S('text', { x: g.ax - 20, y: g.ay + 28, 'font-size': 10, 'text-anchor': 'end', fill: '#5a4097', 'font-weight': 600, text: p[1] }, w); return; }
      S('text', { x: q[0] - 10 * g.s, y: q[1] + 20 * g.c, 'font-size': 10, 'text-anchor': 'middle', fill: '#5a4097', 'font-weight': 600, text: p[1] }, w);
    });
    // 金属片
    var sp = g.P(stopAt === 'mid' ? 0.4 : 0.8);
    S('line', { x1: sp[0] + 2 * g.c, y1: sp[1] + 2 * g.s, x2: sp[0] + 2 * g.c + 20 * g.s, y2: sp[1] + 2 * g.s - 20 * g.c, stroke: '#5b6475', 'stroke-width': 3.5, 'stroke-linecap': 'round' }, w);
    S('text', { x: sp[0] + 20 * g.s + 6, y: sp[1] - 22 * g.c, 'font-size': 9.5, fill: '#5b6475', text: '金属片' }, w);
    // 小车（车头在 carS 处）
    var cpos = g.P(carS), cg = S('g', { transform: 'translate(' + cpos[0].toFixed(1) + ' ' + cpos[1].toFixed(1) + ') rotate(' + g.deg + ')' }, w);
    S('rect', { x: -26, y: -16, width: 26, height: 9, rx: 2, fill: '#5a4097' }, cg);
    S('circle', { cx: -20, cy: -5.5, r: 2.8, fill: '#3b3548' }, cg);
    S('circle', { cx: -6, cy: -5.5, r: 2.8, fill: '#3b3548' }, cg);
    // 停表
    S('circle', { cx: 330, cy: 46, r: 28, fill: '#fff', stroke: '#7a6aa8', 'stroke-width': 2 }, slope);
    S('rect', { x: 325, y: 12, width: 10, height: 6, rx: 1.5, fill: '#7a6aa8' }, slope);
    S('text', { x: 330, y: 50, 'font-size': 14, 'text-anchor': 'middle', fill: '#3b3548', 'font-weight': 700, text: sw.toFixed(2) }, slope);
    S('text', { x: 330, y: 64, 'font-size': 9, 'text-anchor': 'middle', fill: '#8a8598', text: '停表 / s' }, slope);
    L.$('#slope-t').innerHTML = sw.toFixed(2) + '<small>s</small>';
  }
  function vTxt(sM, tS) { return (sM / tS).toFixed(2) + ' m/s'; }
  function slopeReadout() {
    var f = rec.front, a = rec.all, both = f !== null && a !== null;
    L.$('#ft').textContent = f !== null ? f.toFixed(2) + ' s' : '—';
    L.$('#fv').textContent = f !== null ? vTxt(0.4, f) : '—';
    L.$('#at').textContent = a !== null ? a.toFixed(2) + ' s' : '—';
    L.$('#av').textContent = a !== null ? vTxt(0.8, a) : '—';
    L.$('#bt').textContent = both ? (a - f).toFixed(2) + ' s' : '—';
    L.$('#bv').textContent = both ? vTxt(0.4, a - f) : '—';
    L.$$('#slope-table tbody tr').forEach(function (tr) { tr.classList.toggle('on', both ? tr.dataset.r === 'back' : tr.dataset.r === lastRow); });
    L.$('#slope-badge').textContent = both ? '后半程最快' : (f !== null || a !== null) ? '已测 1 段' : '还没测';
    var t;
    if (both) {
      var v1 = +(0.4 / f).toFixed(2), v2 = +(0.4 / (a - f)).toFixed(2), v3 = +(0.8 / a).toFixed(2);
      t = '后半程时间 = 全程 − 前半程 = ' + a.toFixed(2) + ' s − ' + f.toFixed(2) + ' s = ' + (a - f).toFixed(2) + ' s。比一比：<b>v前 = ' + v1.toFixed(2) + ' m/s &lt; v全 = ' + v3.toFixed(2) + ' m/s &lt; v后 = ' + v2.toFixed(2) + ' m/s</b>，小车越滑越快。注意全程平均速度不等于 (' + v1.toFixed(2) + ' + ' + v2.toFixed(2) + ') ÷ 2 = ' + ((v1 + v2) / 2).toFixed(2) + ' m/s。';
    } else if (f !== null) t = '前半程用了 ' + f.toFixed(2) + ' s。再把金属片移到<b>底端</b>测全程时间。后半程不能让小车从中点静止出发来测。';
    else if (a !== null) t = '全程用了 ' + a.toFixed(2) + ' s。再把金属片移到<b>中点</b>测前半程时间，后半程的时间用减法算。';
    else t = '把金属片放在中点，按“释放小车”，小车撞到金属片时停表停止，得到前半程的时间。';
    if (slopeK === 'hi') t += ' 现在坡度较陡，小车很快就到底，用手按停表很难测准，所以实验时斜面坡度要<b>小一些</b>。';
    L.$('#slope-text').innerHTML = t;
    save();
  }
  function stopSlope() { if (slopeAnim) { slopeAnim.stop(); slopeAnim = null; } }
  function release() {
    if (slopeAnim) return;
    var a = ACC[slopeK], target = stopAt === 'mid' ? 0.4 : 0.8, T = Math.sqrt(2 * target / a);
    carS = 0; sw = 0;
    function finish() {
      slopeAnim = null; sw = T; carS = target;
      var key = stopAt === 'mid' ? 'front' : 'all';
      rec[key] = Math.round(T * 100) / 100; lastRow = key;
      drawSlope(); slopeReadout();
    }
    if (L.REDUCED) { finish(); return; }
    slopeAnim = L.loop(function (dt) {
      sw += dt;
      if (sw >= T) { finish(); return false; }
      carS = 0.5 * a * sw * sw; drawSlope();
    });
  }
  function resetCar() { stopSlope(); carS = 0; sw = 0; drawSlope(); }
  L.chips(L.$('#slope-chips'), [{ label: '较缓', value: 'lo' }, { label: '较陡', value: 'hi' }], slopeK, function (v) {
    slopeK = v; rec = { front: null, all: null }; lastRow = null; resetCar(); slopeReadout();
  });
  L.chips(L.$('#stop-chips'), [{ label: '中点 M（测前半程）', value: 'mid' }, { label: '底端 B（测全程）', value: 'end' }], stopAt, function (v) {
    stopAt = v; resetCar(); slopeReadout();
  });
  L.$('#slope-go').addEventListener('click', function () { resetCar(); release(); });
  L.$('#slope-reset').addEventListener('click', function () { rec = { front: null, all: null }; lastRow = null; resetCar(); slopeReadout(); });

  function save() {
    L.setState({ va: va, vb: vb, t: L.fmt(t, 1), ref: ref, d: div, p: prec, o0: o0, o1: o1, r: rd, k: slopeK, m: stopAt });
  }

  drawCars();
  drawRuler();
  drawSlope();
  slopeReadout();
  stopCars();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '用 1 mm 分度值的尺正确记录物体长度',
      desc: '在“刻度尺读数”里把分度值切到 1 mm，选好记录到哪一位，用滑块写下物体长度。',
      label: '在刻度尺模型里操作',
      button: '检查我的读数',
      check: function () {
        if (div !== 'mm') return { ok: false, msg: '先把分度值切换成 <b>1 mm</b>。' };
        return judge();
      }
    },
    {
      level: 'base',
      title: '1 m/s 等于多少 km/h？',
      desc: '1 km = 1000 m，1 h = 3600 s。',
      options: ['3.6 km/h', '36 km/h', '0.36 km/h', '1000 km/h'],
      answer: 0,
      hint: '1 m/s 就是 1 秒走 1 m。1 小时有 3600 秒，能走多少千米？',
      explain: '1 m/s 表示 1 s 走 1 m，1 h = 3600 s 就走 3600 m = 3.6 km，所以 <b>1 m/s = 3.6 km/h</b>。36 是多乘了 10；0.36 是把 3600 m 换成千米时多除了 10；1000 只换了路程没换时间。'
    },
    {
      level: 'base',
      title: '坐在行驶的公交车上，看到路边的树往后退，选的参照物是',
      desc: '想一想：把谁看成“不动”，树才会往后退？',
      options: ['自己坐的公交车', '路边的树', '地面', '路边的楼房'],
      answer: 0,
      hint: '研究的是树。研究对象本身不能当自己的参照物。',
      explain: '以<b>自己坐的车</b>为参照物，车不动，树的位置相对车不断往后变。以地面或楼房为参照物，树是静止的；树也不能拿自己当参照物。'
    },
    {
      level: 'mid',
      title: '让乙车“看起来一动不动”',
      desc: '在两车模型里调速度、换参照物，让乙车相对于所选参照物静止，但两辆车都在路上跑。',
      label: '在两车模型里操作',
      button: '检查乙车',
      check: function () {
        var dv = vb - va;
        if (ref === 'g') {
          if (dv === 0) return { ok: false, msg: '两车速度已经一样了，但以地面为参照物，乙车还在跑。换一个参照物试试。' };
          return { ok: false, msg: '以地面为参照物，在路上跑的车不可能静止。想一想：拿谁当参照物，乙车的位置才不变？' };
        }
        if (dv !== 0) return { ok: false, msg: '以甲车为参照物，乙车还在以 ' + L.fmt(Math.abs(dv), 1) + ' m/s 向' + (dv > 0 ? '前' : '后') + '运动。两车速度要调得一样。' };
        return { ok: true, msg: '甲、乙同速同向行驶，以甲车为参照物，乙车的位置没有变化，是<b>静止</b>的；以地面为参照物，它们都在以 ' + L.fmt(va, 1) + ' m/s 运动。运动和静止是相对的。' };
      }
    },
    {
      level: 'mid',
      title: '甲车速度 72 km/h，乙车速度 15 m/s，谁更快？',
      desc: '先把单位换成一样的再比。',
      options: ['甲车快', '乙车快', '一样快', '单位不同，没法比'],
      answer: 0,
      hint: '72 km/h 换成 m/s 是多少？除以 3.6。',
      explain: '72 km/h = 72 ÷ 3.6 m/s = <b>20 m/s</b> &gt; 15 m/s，所以甲车快。只看数字 72 &gt; 15 不能下结论；单位不同也能比，换算成同一单位就行。'
    },
    {
      level: 'mid',
      title: '测出小车前半程、后半程和全程的平均速度',
      desc: '在斜面模型里分别测出前半程和全程的时间，表格会算出后半程。',
      label: '在斜面模型里操作',
      button: '检查实验记录',
      check: function () {
        if (rec.front === null && rec.all === null) return { ok: false, msg: '还没有测量。先把金属片放在中点，释放小车。' };
        if (rec.front === null) return { ok: false, msg: '还缺前半程。把金属片移到<b>中点 M</b> 再测一次。' };
        if (rec.all === null) return { ok: false, msg: '还缺全程。把金属片移到<b>底端 B</b> 再测一次。' };
        return { ok: true, msg: '后半程时间 ' + (rec.all - rec.front).toFixed(2) + ' s 是用“全程时间 − 前半程时间”得到的。三个平均速度中<b>后半程最大、前半程最小</b>，说明小车在做加速运动。' };
      }
    },
    {
      level: 'trap',
      title: '前一半路程速度 4 m/s，后一半路程速度 6 m/s，全程平均速度是',
      desc: '可以假设每一半路程都是 12 m 来算。',
      options: ['4.8 m/s', '5 m/s', '10 m/s', '2.4 m/s'],
      answer: 0,
      hint: '平均速度 = 总路程 ÷ 总时间，不是两个速度的平均值。',
      explain: '设每一半 12 m：前一半用 12 ÷ 4 = 3 s，后一半用 12 ÷ 6 = 2 s，总共 24 m 用 5 s，v = 24 m ÷ 5 s = <b>4.8 m/s</b>。5 m/s 是把速度直接平均了，错在慢的那段用时更长；10 m/s 把速度相加了；2.4 m/s 是把 4.8 又除了 2。'
    },
    {
      level: 'trap',
      title: '用分度值是 1 mm 的刻度尺测铅笔长度，记录正确的是',
      desc: '看小数位数：估读要到分度值的下一位。',
      options: ['17.58 cm', '17.6 cm', '17.580 cm', '18 cm'],
      answer: 0,
      hint: '1 mm = 0.1 cm，估读到它的下一位，用 cm 作单位时小数点后应有几位？',
      explain: '分度值 1 mm = 0.1 cm，要估读到 0.01 cm，用 cm 作单位时小数点后正好<b>两位</b>：17.58 cm。17.6 cm 没有估读；17.580 cm 多了一位，那一位没法估；18 cm 只读到厘米。'
    }
  ]);
})();
