/* 物理互动馆 · 第 18 课 电功率 */
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
  function label(g, x, y, text, o) {
    o = o || {};
    return S('text', { x: x, y: y, 'font-size': o.fs || 11, 'text-anchor': o.anchor || 'middle', fill: o.color || '#5b5470', 'font-weight': o.bold ? 700 : null, 'paint-order': 'stroke', stroke: BG, 'stroke-width': 3, 'stroke-linejoin': 'round', text: text }, g);
  }
  function lampSym(g, cx, cy, r, glow) {
    if (glow > 0.01) {
      S('circle', { cx: cx, cy: cy, r: r + 6 + 26 * glow, fill: '#f7c948', opacity: 0.12 + 0.18 * Math.min(glow, 1) }, g);
      S('circle', { cx: cx, cy: cy, r: r + 2 + 12 * glow, fill: '#f7c948', opacity: 0.2 + 0.3 * Math.min(glow, 1) }, g);
    }
    S('circle', { cx: cx, cy: cy, r: r, fill: '#fff', stroke: INK, 'stroke-width': 1.6 }, g);
    if (glow > 0.01) S('circle', { cx: cx, cy: cy, r: r - 0.8, fill: '#ffd54a', opacity: Math.min(1, 0.25 + 0.75 * glow) }, g);
    var d = r * 0.707;
    S('path', { d: 'M' + (cx - d) + ' ' + (cy - d) + 'L' + (cx + d) + ' ' + (cy + d) + 'M' + (cx + d) + ' ' + (cy - d) + 'L' + (cx - d) + ' ' + (cy + d), stroke: INK, 'stroke-width': 1.4 }, g);
  }
  /* 交流电源：圆圈里画“~” */
  function acSource(g, cx, cy) {
    S('circle', { cx: cx, cy: cy, r: 13, fill: '#fff', stroke: INK, 'stroke-width': 1.6 }, g);
    S('path', { d: 'M' + (cx - 7) + ' ' + cy + 'q3.5 -6 7 0t7 0', fill: 'none', stroke: INK, 'stroke-width': 1.6 }, g);
  }
  function cell(g, cx, cy) {
    S('rect', { x: cx - 6, y: cy - 4, width: 12, height: 8, fill: BG }, g);
    S('line', { x1: cx - 3, y1: cy - 12, x2: cx - 3, y2: cy + 12, stroke: INK, 'stroke-width': 1.6 }, g);
    S('line', { x1: cx + 3, y1: cy - 6, x2: cx + 3, y2: cy + 6, stroke: INK, 'stroke-width': 3.6 }, g);
  }
  function switchH(g, x1, x2, y, closed) {
    S('rect', { x: x1, y: y - 4, width: x2 - x1, height: 8, fill: BG }, g);
    S('line', { x1: x1, y1: y, x2: closed ? x2 : x2 - 4, y2: closed ? y - 2.5 : y - 13, stroke: INK, 'stroke-width': 1.8, 'stroke-linecap': 'round' }, g);
    S('circle', { cx: x1, cy: y, r: 2.4, fill: '#fff', stroke: INK, 'stroke-width': 1.4 }, g);
    S('circle', { cx: x2, cy: y, r: 2.4, fill: '#fff', stroke: INK, 'stroke-width': 1.4 }, g);
  }
  function meterSym(g, cx, cy, ch) {
    S('circle', { cx: cx, cy: cy, r: 11, fill: '#fff', stroke: INK, 'stroke-width': 1.6 }, g);
    S('text', { x: cx, y: cy + 4.5, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: INK, text: ch }, g);
  }
  function canvas(el, h, id) {
    el.innerHTML = '';
    var defs = S('defs', {}, el), cp = S('clipPath', { id: id }, defs);
    S('rect', { x: 0, y: 0, width: 400, height: h, rx: 14 }, cp);
    S('rect', { x: 0, y: 0, width: 400, height: h, rx: 14, fill: BG }, el);
    return S('g', { 'clip-path': 'url(#' + id + ')' }, el);
  }

  /* ========== ① 额定功率与实际功率 ========== */
  var R1 = 220 * 220 / 40, R2 = 220 * 220 / 100;   // 1210 Ω、484 Ω
  var lm = st.lm === 'p' ? 'p' : 's';
  var LU = Math.round(L.num(st.lu, 220, 0, 240) / 5) * 5;
  var lampEl = L.$('#lamp');
  function lampCalc() {
    if (lm === 's') {
      var I = LU / (R1 + R2);
      return { U1: I * R1, U2: I * R2, I1: I, I2: I, P1: I * I * R1, P2: I * I * R2 };
    }
    return { U1: LU, U2: LU, I1: LU / R1, I2: LU / R2, P1: LU * LU / R1, P2: LU * LU / R2 };
  }
  function glowOf(P) { return L.clamp(Math.sqrt(P / 100), 0, 1.2); }
  function drawLamp() {
    var c = lampCalc();
    var g = canvas(lampEl, 230, 'lamp-clip');
    if (lm === 's') {
      var T = 70, B = 180, LX = 50, RX = 350;
      wire(g, [[LX, T], [RX, T], [RX, B], [LX, B], [LX, T]]);
      acSource(g, 200, B);
      lampSym(g, 145, T, 14, glowOf(c.P1));
      lampSym(g, 255, T, 14, glowOf(c.P2));
      label(g, 145, T + 34, 'L₁ 220 V 40 W');
      label(g, 255, T + 34, 'L₂ 220 V 100 W');
      label(g, 145, T + 50, '实际 ' + L.fmt(c.P1, 1) + ' W', { color: '#a4492b', bold: true });
      label(g, 255, T + 50, '实际 ' + L.fmt(c.P2, 1) + ' W', { color: '#a4492b', bold: true });
      label(g, 200, B + 32, '电源 U = ' + LU + ' V', { fs: 10.5 });
      L.arrow(g, RX, 100, RX, 140, { color: '#c2603f', width: 1.8, head: 7 });
      label(g, RX - 8, 124, 'I = ' + L.fmt(c.I1, 3) + ' A', { anchor: 'end', color: '#c2603f', fs: 10.5 });
    } else {
      var T1 = 52, T2 = 122, B2 = 186, LX2 = 50, RX2 = 350;
      wire(g, [[LX2, T1], [RX2, T1]]);
      wire(g, [[LX2, T2], [RX2, T2]]);
      wire(g, [[LX2, T1], [LX2, B2], [RX2, B2], [RX2, T1]]);
      node(g, LX2, T2); node(g, RX2, T2);
      acSource(g, 200, B2);
      lampSym(g, 150, T1, 14, glowOf(c.P1));
      lampSym(g, 150, T2, 14, glowOf(c.P2));
      label(g, 214, T1 - 6, 'L₁ 220 V 40 W', { anchor: 'start' });
      label(g, 214, T1 + 12, '实际 ' + L.fmt(c.P1, 1) + ' W', { anchor: 'start', color: '#a4492b', bold: true });
      label(g, 214, T2 - 6, 'L₂ 220 V 100 W', { anchor: 'start' });
      label(g, 214, T2 + 12, '实际 ' + L.fmt(c.P2, 1) + ' W', { anchor: 'start', color: '#a4492b', bold: true });
      label(g, 200, B2 + 32, '电源 U = ' + LU + ' V（两盏灯两端电压都等于它）', { fs: 10.5 });
    }
    L.$('#lu-out').textContent = LU + ' V';
    L.$('#p1').innerHTML = L.qty(c.P1, 'W', 1);
    L.$('#p2').innerHTML = L.qty(c.P2, 'W', 1);
    L.$('#u1').innerHTML = L.qty(c.U1, 'V', 1);
    L.$('#u2').innerHTML = L.qty(c.U2, 'V', 1);
    L.$('#i1').innerHTML = L.qty(c.I1, 'A', 3);
    L.$('#i2').innerHTML = L.qty(c.I2, 'A', 3);
    L.$('#t-p1').textContent = L.fmt(c.P1, 1) + ' W';
    L.$('#t-p2').textContent = L.fmt(c.P2, 1) + ' W';
    var b1 = c.P1 > c.P2 + 1e-9, b2 = c.P2 > c.P1 + 1e-9;
    L.$('#row-l1').classList.toggle('on', b1);
    L.$('#row-l2').classList.toggle('on', b2);
    L.$('#lamp-badge').textContent = LU === 0 ? '都不亮' : b1 ? 'L₁（40 W）更亮' : 'L₂（100 W）更亮';
    var t;
    if (LU === 0) t = '电源电压为 0，电路里没有电流，两盏灯都不亮。';
    else if (lm === 's') t = '串联时电流处处相同（I ≈ ' + L.fmt(c.I1, 3) + ' A），由 P = I²R，电阻大的 L₁ 实际功率大，所以<b>标着 40 W 的 L₁ 反而更亮</b>。两盏灯的电压都达不到 220 V，都比正常发光时暗。';
    else if (LU === 220) t = '并联在 220 V 上，两盏灯两端都是额定电压，<b>都正常发光</b>：实际功率等于额定功率，100 W 的 L₂ 更亮。';
    else if (LU < 220) t = '并联时两盏灯电压相同，由 P = U²/R，电阻小的 L₂ 实际功率大，更亮。电压低于 220 V，两盏灯的实际功率都<b>小于</b>额定功率。';
    else t = '电压超过了额定电压 220 V，两盏灯的实际功率都<b>大于</b>额定功率，灯特别亮，但灯丝容易烧断。';
    L.$('#lamp-text').innerHTML = t;
    save();
  }
  L.chips(L.$('#lamp-chips'), [{ label: '串联', value: 's' }, { label: '并联', value: 'p' }], lm, function (v) { lm = v; drawLamp(); });
  var luIn = L.$('#lu-in');
  luIn.value = LU;
  L.bindRange(luIn, function (v) { LU = v; drawLamp(); });

  /* ========== ② 电能表 ========== */
  var APPS = [
    { v: 'led', name: 'LED 灯', P: 10, tip: '照明用 LED 灯代替白炽灯，亮度差不多，功率却小得多；人走灯灭。' },
    { v: 'tv', name: '电视机', P: 100, tip: '不看时关机后再断开电源，长时间待机也在耗电。' },
    { v: 'fridge', name: '电冰箱', P: 150, tip: '少开门、开门时间短一点；热饭菜放凉了再放进去。', note: '150 W 是压缩机工作时的功率。冰箱是断断续续工作的，一天实际用电比 150 W × 24 h 少得多。' },
    { v: 'cooker', name: '电饭锅', P: 800, tip: '饭煮好后及时断电，不要长时间保温。' },
    { v: 'ac', name: '空调', P: 1000, tip: '制冷温度别调得太低，设在 26 ℃ 左右；关好门窗，定期清洗滤网。' },
    { v: 'kettle', name: '电热水壶', P: 1500, tip: '用多少水就烧多少水，烧开就断电。' }
  ];
  var START = 1385.6, PRICE = 0.6, IMP = 3000;
  var ap = APPS.some(function (a) { return a.v === st.ap; }) ? st.ap : 'ac';
  var th = Math.round(L.num(st.t, 2, 0.1, 10) * 10) / 10;
  var meterEl = L.$('#meter');
  function app() { for (var i = 0; i < APPS.length; i++) if (APPS[i].v === ap) return APPS[i]; return APPS[0]; }
  function energy() { return app().P / 1000 * th; }   // kW·h
  /* 电能表只显示到 0.1 kW·h，不足 0.1 的部分不进位 */
  function readStr(x) { return (Math.floor(x * 10 + 1e-6) / 10).toFixed(1); }
  function sci(x) {
    if (x <= 0) return '0';
    var e = Math.floor(Math.log10(x)), m = x / Math.pow(10, e);
    if (+m.toFixed(2) >= 10) { m /= 10; e += 1; }
    return L.fmt(m, 2) + '×10<sup>' + e + '</sup>';
  }
  function drawMeter() {
    var a = app(), W = energy(), g = canvas(meterEl, 210, 'meter-clip');
    // 电能表
    S('rect', { x: 18, y: 16, width: 172, height: 180, rx: 10, fill: '#f1eff6', stroke: '#a39cb3', 'stroke-width': 1.4 }, g);
    S('text', { x: 104, y: 36, 'font-size': 12, 'text-anchor': 'middle', fill: INK, 'font-weight': 700, text: '电能表' }, g);
    var rd = readStr(START + W), ds = ('00000' + rd.split('.')[0]).slice(-5) + rd.split('.')[1];
    for (var i = 0; i < 6; i++) {
      var x = 29 + i * 24 + (i === 5 ? 6 : 0);
      S('rect', { x: x, y: 46, width: 22, height: 30, rx: 3, fill: i === 5 ? '#fbe3dc' : '#fff', stroke: '#8a8598', 'stroke-width': 1 }, g);
      S('text', { x: x + 11, y: 67, 'font-size': 17, 'text-anchor': 'middle', fill: i === 5 ? '#a4492b' : INK, 'font-weight': 600, text: ds.charAt(i) }, g);
    }
    S('circle', { cx: 151, cy: 72, r: 1.8, fill: INK }, g);
    S('text', { x: 104, y: 94, 'font-size': 11, 'text-anchor': 'middle', fill: INK, text: 'kW·h' }, g);
    S('text', { x: 104, y: 114, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#5b5470', text: '220 V  10(40) A  50 Hz' }, g);
    S('text', { x: 104, y: 130, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#5b5470', text: IMP + ' imp/(kW·h)' }, g);
    S('circle', { cx: 46, cy: 151, r: 5, fill: '#e2553a' }, g);
    S('circle', { cx: 46, cy: 151, r: 9, fill: '#e2553a', opacity: 0.18 }, g);
    S('text', { x: 60, y: 155, 'font-size': 9.5, fill: '#5b5470', text: '脉冲指示灯' }, g);
    S('text', { x: 104, y: 182, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#8a8598', text: '用电前示数 ' + START.toFixed(1) + ' kW·h' }, g);
    // 导线
    wire(g, [[190, 96], [232, 96]], { color: '#c2603f' });
    wire(g, [[190, 112], [232, 112]], { color: '#3d6fb0' });
    // 家电
    S('rect', { x: 232, y: 30, width: 150, height: 140, rx: 12, fill: '#fff', stroke: '#a39cb3', 'stroke-width': 1.4 }, g);
    S('text', { x: 307, y: 62, 'font-size': 15, 'text-anchor': 'middle', fill: INK, 'font-weight': 700, text: a.name }, g);
    S('text', { x: 307, y: 84, 'font-size': 11, 'text-anchor': 'middle', fill: '#5a4097', text: 'P = ' + a.P + ' W = ' + L.fmt(a.P / 1000, 3) + ' kW' }, g);
    S('rect', { x: 248, y: 104, width: 118, height: 10, rx: 5, fill: '#ece8f5' }, g);
    S('rect', { x: 248, y: 104, width: 118 * th / 10, height: 10, rx: 5, fill: '#8f7cc0' }, g);
    S('text', { x: 248, y: 130, 'font-size': 9.5, fill: '#8a8598', text: '0 h' }, g);
    S('text', { x: 366, y: 130, 'font-size': 9.5, 'text-anchor': 'end', fill: '#8a8598', text: '10 h' }, g);
    S('text', { x: 307, y: 152, 'font-size': 11, 'text-anchor': 'middle', fill: INK, text: '工作 t = ' + L.fmt(th, 1) + ' h' }, g);
    S('text', { x: 307, y: 194, 'font-size': 11, 'text-anchor': 'middle', fill: '#a4492b', 'font-weight': 600, text: 'W = Pt = ' + L.fmt(a.P / 1000, 3) + ' kW × ' + L.fmt(th, 1) + ' h = ' + L.fmt(W, 3) + ' kW·h' }, g);
    // 读数
    L.$('#t-out').textContent = L.fmt(th, 1) + ' h';
    L.$('#app-badge').textContent = a.name + ' ' + a.P + ' W';
    L.$('#w-kwh').innerHTML = L.qty(W, 'kW·h', 3);
    L.$('#w-j').innerHTML = sci(W * 3.6e6) + '<small>J</small>';
    L.$('#w-imp').innerHTML = Math.round(W * IMP) + '<small>次</small>';
    L.$('#w-fee').innerHTML = L.qty(W * PRICE, '元', 2);
    L.$('#app-text').innerHTML = '电能表示数从 ' + START.toFixed(1) + ' 走到 ' + readStr(START + W) + '（只显示到 0.1 kW·h）。1 度电能让' + a.name + '工作 ' + L.fmt(1000 / a.P, 2) + ' h。' + (a.note ? a.note : '') + '<br><b>节约用电小建议</b>：' + a.tip;
    save();
  }
  L.chips(L.$('#app-chips'), APPS.map(function (a) { return { label: a.name, value: a.v }; }), ap, function (v) { ap = v; drawMeter(); });
  var tIn = L.$('#t-in');
  tIn.value = th;
  L.bindRange(tIn, function (v) { th = Math.round(v * 10) / 10; drawMeter(); });

  /* ========== ③ 焦耳定律 ========== */
  var jm = st.jm === 'I' ? 'I' : 'R';
  var JI = Math.round(L.num(st.ji, 1, 0.5, 1.5) * 10) / 10;
  var jt = 0, Q1 = 0, Q2 = 0, running = false, runId = 0, stopMsg = '';
  var SPEED = 10, TMAX = 120, QFULL = 1200, HMAX = 70;
  var jEl = L.$('#joule'), runBtn = L.$('#j-run');
  function rate1() { return JI * JI * 5; }
  function rate2() { return jm === 'R' ? JI * JI * 10 : (JI / 2) * (JI / 2) * 5; }
  function advance(ds) {
    ds = Math.min(ds, TMAX - jt);
    if (ds <= 0) return;
    jt += ds; Q1 += rate1() * ds; Q2 += rate2() * ds;
    if (jt >= TMAX - 1e-6) { running = false; stopMsg = '已通电 ' + TMAX + ' s，自动断电。'; }
    else if (Math.max(Q1, Q2) >= QFULL) { running = false; stopMsg = '液面差快到顶了，已自动断电。'; }
  }
  function heatColor(q) {
    var k = L.clamp(q / QFULL, 0, 1);
    var r = Math.round(L.lerp(107, 214, k)), gg = Math.round(L.lerp(95, 80, k)), b = Math.round(L.lerp(127, 44, k));
    return 'rgb(' + r + ',' + gg + ',' + b + ')';
  }
  function box(g, x, q, rText, iText) {
    var cx = x + 35;
    S('rect', { x: x, y: 140, width: 70, height: 56, rx: 6, fill: '#eef5fb', stroke: '#8fa6bd', 'stroke-width': 1.6 }, g);
    S('rect', { x: x + 1, y: 141, width: 68, height: 54, rx: 5, fill: '#f3a35c', opacity: Math.min(0.45, q / QFULL * 0.45) }, g);
    var d = 'M' + (cx - 24) + ' 172';
    for (var k = 1; k <= 8; k++) d += 'L' + (cx - 24 + k * 6) + ' ' + (172 + (k === 8 ? 0 : (k % 2 ? -6 : 6)));
    S('path', { d: d, fill: 'none', stroke: heatColor(q), 'stroke-width': 2, 'stroke-linejoin': 'round' }, g);
    wire(g, [[x, 172], [cx - 24, 172]]);
    wire(g, [[cx + 24, 172], [x + 70, 172]]);
    S('text', { x: cx, y: 156, 'font-size': 10.5, 'text-anchor': 'middle', fill: INK, 'font-weight': 700, text: rText }, g);
    S('text', { x: cx, y: 191, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#5b5470', text: iText }, g);
  }
  function utube(g, cx, xa, xb, q) {
    var r = (xb - xa) / 2, h = Math.min(HMAX, q / QFULL * HMAX), base = 90;
    var la = base + h / 2, lb = base - h / 2;
    S('path', { d: 'M' + cx + ' 140V34H' + xa + 'V46', fill: 'none', stroke: '#b9c3cf', 'stroke-width': 3.5, 'stroke-linejoin': 'round' }, g);
    var glass = 'M' + xa + ' 46V132A' + r + ' ' + r + ' 0 0 0 ' + xb + ' 132V40';
    S('path', { d: glass, fill: 'none', stroke: '#b9c3cf', 'stroke-width': 12 }, g);
    S('path', { d: glass, fill: 'none', stroke: '#f4f7fa', 'stroke-width': 9 }, g);
    S('path', { d: 'M' + xa + ' ' + la.toFixed(1) + 'V132A' + r + ' ' + r + ' 0 0 0 ' + xb + ' 132V' + lb.toFixed(1), fill: 'none', stroke: '#d9534f', 'stroke-width': 9, opacity: 0.85 }, g);
    if (h > 2) {
      S('line', { x1: xa - 6, y1: la, x2: xb + 12, y2: la, stroke: '#8a8598', 'stroke-dasharray': '2 2' }, g);
      S('line', { x1: xb + 6, y1: lb, x2: xb + 12, y2: lb, stroke: '#8a8598' }, g);
      L.arrow(g, xb + 10, (la + lb) / 2, xb + 10, lb + 0.5, { color: '#8a8598', width: 1, head: 4 });
      L.arrow(g, xb + 10, (la + lb) / 2, xb + 10, la - 0.5, { color: '#8a8598', width: 1, head: 4 });
      S('text', { x: xb + 15, y: (la + lb) / 2 + 4, 'font-size': 10, fill: '#5b5470', text: 'Δh' }, g);
    }
  }
  function drawJ() {
    var g = canvas(jEl, 260, 'joule-clip');
    utube(g, 65, 124, 158, Q1);
    utube(g, 245, 304, 338, Q2);
    // 电路
    wire(g, [[30, 172], [14, 172], [14, 240], [386, 240], [386, 172], [280, 172]]);
    wire(g, [[100, 172], [210, 172]]);
    if (jm === 'I') {
      wire(g, [[190, 172], [190, 214], [300, 214], [300, 172]]);
      node(g, 190, 172); node(g, 300, 172);
      S('rect', { x: 225, y: 207, width: 40, height: 14, fill: '#fff', stroke: INK, 'stroke-width': 1.6 }, g);
      S('text', { x: 245, y: 234, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#5b5470', text: '外接 5 Ω' }, g);
    }
    box(g, 30, Q1, '5 Ω', '电流 I');
    box(g, 210, Q2, jm === 'R' ? '10 Ω' : '5 Ω', jm === 'R' ? '电流 I' : '电流 I/2');
    cell(g, 200, 240);
    switchH(g, 120, 146, 240, running);
    meterSym(g, 70, 240, 'A');
    S('text', { x: 86, y: 233, 'font-size': 10, fill: '#a4492b', 'font-weight': 600, text: 'I = ' + L.fmt(JI, 1) + ' A' }, g);
    S('text', { x: 133, y: 256, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#5b5470', text: running ? '开关闭合' : '开关断开' }, g);
    S('text', { x: 65, y: 26, 'font-size': 10, 'text-anchor': 'middle', fill: '#5b5470', text: '左容器' }, g);
    S('text', { x: 245, y: 26, 'font-size': 10, 'text-anchor': 'middle', fill: '#5b5470', text: '右容器' }, g);
    updateJ();
  }
  function updateJ() {
    L.$('#ji-out').textContent = L.fmt(JI, 1) + ' A';
    L.$('#j-t').innerHTML = L.qty(jt, 's', 0);
    L.$('#j-q1').innerHTML = L.qty(Q1, 'J', 0);
    L.$('#j-q2').innerHTML = L.qty(Q2, 'J', 0);
    L.$('#j-ratio').textContent = Q1 > 0 ? (jm === 'R' ? '1 : 2' : '4 : 1') : '—';
    L.$('#j-badge').textContent = running ? '通电中' : jt > 0 ? '已断电' : '未通电';
    runBtn.textContent = running ? '暂停' : (L.REDUCED ? '通电 30 s' : (jt > 0 ? '继续通电' : '通电'));
    runBtn.disabled = !!stopMsg;
    var t;
    if (jm === 'R') {
      t = jt === 0
        ? '两段电阻丝<b>串联</b>：电流相同、通电时间相同，只有电阻不同（5 Ω 和 10 Ω）。按“通电”看看哪边液面高度差大。'
        : 'Q = I²Rt：电流和时间都相同，右边电阻是左边的 2 倍，产生的热量也是 2 倍（' + L.fmt(Q1, 0) + ' J 对 ' + L.fmt(Q2, 0) + ' J），<b>电阻越大，产生的热量越多</b>。';
    } else {
      t = jt === 0
        ? '两个容器里都是 5 Ω，但右边容器外又并联了一个 5 Ω 电阻，分走一半电流。电阻相同、时间相同，只有<b>电流</b>不同。'
        : '右边电阻丝的电流只有左边的一半，热量却只有左边的 (1/2)² = <b>1/4</b>（' + L.fmt(Q1, 0) + ' J 对 ' + L.fmt(Q2, 0) + ' J）。热量跟电流的<b>二次方</b>成正比，电流对电热的影响特别大。';
    }
    if (stopMsg) t += ' ' + stopMsg + '按“断电并重置”可以再做一次。';
    L.$('#j-text').innerHTML = t;
  }
  function resetJ() { running = false; runId++; jt = 0; Q1 = 0; Q2 = 0; stopMsg = ''; drawJ(); }
  runBtn.addEventListener('click', function () {
    if (running) { running = false; runId++; drawJ(); return; }
    if (stopMsg) return;
    if (L.REDUCED) { advance(30); drawJ(); return; }
    running = true;
    var id = ++runId;
    drawJ();
    L.loop(function (dt) {
      if (!running || id !== runId) return false;
      advance(dt * SPEED);
      drawJ();
      if (!running) return false;
    });
  });
  L.$('#j-reset').addEventListener('click', resetJ);
  L.chips(L.$('#j-chips'), [{ label: '比电阻：5 Ω 和 10 Ω 串联', value: 'R' }, { label: '比电流：右边外并 5 Ω', value: 'I' }], jm, function (v) { jm = v; resetJ(); save(); });
  var jiIn = L.$('#ji-in');
  jiIn.value = JI;
  L.bindRange(jiIn, function (v) { JI = Math.round(v * 10) / 10; drawJ(); save(); });

  function save() { L.setState({ lm: lm, lu: LU, ap: ap, t: th, jm: jm, ji: JI }); }

  drawLamp();
  drawMeter();
  drawJ();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '让两盏灯都正常发光',
      desc: '在第一张电路图里选连接方式、调电源电压，让 L₁ 和 L₂ 都正常发光（实际功率等于额定功率）。',
      label: '在“额定功率与实际功率”里操作',
      button: '检查两盏灯',
      check: function () {
        if (lm !== 'p') return { ok: false, msg: '串联时两盏灯分电压，谁都拿不到 220 V。想一想，什么接法能让每盏灯两端都是电源电压？' };
        if (LU !== 220) return { ok: false, msg: '已经并联了，现在电压是 ' + LU + ' V。要让两盏灯两端都正好是<b>额定电压</b>。' };
        return { ok: true, msg: '并联在 220 V 上，两盏灯两端电压都等于额定电压，实际功率分别是 40 W 和 100 W，都正常发光。家里的电灯都是这样并联的。' };
      }
    },
    {
      level: 'base',
      title: '1 kW·h 等于多少焦耳？',
      desc: '1 kW·h 就是功率 1 kW 的用电器工作 1 h 消耗的电能。',
      options: ['3.6×10⁶ J', '3.6×10³ J', '1000 J', '3600 J'],
      answer: 0,
      hint: '把 1 kW 换成 1000 W，把 1 h 换成 3600 s，再相乘。',
      explain: 'W = Pt = 1000 W × 3600 s = <b>3.6×10⁶ J</b>。3600 J 是把 1 kW 当成了 1 W；3.6×10³ J 是忘了把 h 换成 s。'
    },
    {
      level: 'base',
      title: '灯泡的亮暗由什么决定？',
      desc: '想想第一张图里，标着 40 W 的灯为什么有时比 100 W 的还亮。',
      options: ['灯的实际功率', '灯的额定功率', '灯的额定电压', '电流的方向'],
      answer: 0,
      hint: '铭牌上的数是“正常工作时”的数，灯不一定在正常工作。',
      explain: '灯的亮度由<b>实际功率</b>决定，实际功率越大越亮。额定功率、额定电压是铭牌上固定的数，只说明正常工作时的情况；电流方向与亮度无关。'
    },
    {
      level: 'mid',
      title: '让一件家电正好用掉 1 度电',
      desc: '在“电能表”里选家电、调使用时间，让消耗的电能正好是 1 kW·h。',
      label: '在“电能表：用了几度电”里操作',
      button: '检查用电量',
      check: function () {
        var W = energy(), a = app();
        if (Math.abs(W - 1) < 1e-6) return { ok: true, msg: a.name + '功率 ' + L.fmt(a.P / 1000, 3) + ' kW，工作 ' + L.fmt(th, 1) + ' h，W = Pt = 1 kW·h = 3.6×10⁶ J，电能表指示灯闪了 3000 次。' };
        var need = 1000 / a.P;
        if (need > 10) return { ok: false, msg: a.name + '功率太小，1 度电要用 ' + L.fmt(need, 0) + ' h，滑块不够长。换一件功率大的家电。' };
        var exact = Math.abs(need * 10 - Math.round(need * 10)) < 1e-6;
        return { ok: false, msg: '现在是 ' + L.fmt(W, 3) + ' kW·h。' + a.name + '要用 t = W/P = 1 kW·h ÷ ' + L.fmt(a.P / 1000, 3) + ' kW ' + (exact ? '= ' : '≈ ') + L.fmt(need, 2) + ' h' + (exact ? '，把时间调过去。' : '，滑块调不到这么精确，换一件家电试试。') };
      }
    },
    {
      level: 'mid',
      title: '“220 V 100 W”的灯正常发光时，灯丝电阻是',
      desc: '额定电压和额定功率都知道，选一个合适的公式。',
      options: ['484 Ω', '2.2 Ω', '0.45 Ω', '22000 Ω'],
      answer: 0,
      hint: '由 P = U²/R 得 R = U²/P。',
      explain: 'R = U²/P = (220 V)² ÷ 100 W = <b>484 Ω</b>。2.2 是 U 除以 P；0.45 是额定电流（单位是 A，不是电阻）；22000 是 U 乘 P。'
    },
    {
      level: 'mid',
      title: '让左边电阻丝产生的热量正好是右边的 4 倍',
      desc: '在“焦耳定律”里选装置、通电，让 Q左 : Q右 = 4 : 1。',
      label: '在“焦耳定律：谁产生的热量多”里操作',
      button: '检查热量之比',
      check: function () {
        if (jm === 'R') return { ok: false, msg: '这套装置电阻是 5 Ω 和 10 Ω，Q左 : Q右 = 1 : 2，右边多。要让电阻相同而<b>电流</b>不同才行。' };
        if (Q1 <= 0) return { ok: false, msg: '装置选对了，按“通电”让它产生热量。' };
        return { ok: true, msg: '右边容器外并联的 5 Ω 分走一半电流，右边电流是 I/2。由 Q = I²Rt，热量是 (1/2)² = 1/4，所以 Q左 : Q右 = 4 : 1。' };
      }
    },
    {
      level: 'trap',
      title: '把“220 V 40 W”和“220 V 100 W”两盏灯串联在 220 V 电路中',
      desc: '按灯丝电阻不变计算。',
      options: ['“220 V 40 W”的灯更亮', '“220 V 100 W”的灯更亮', '两盏灯一样亮', '两盏灯都正常发光'],
      answer: 0,
      hint: '串联时电流相同，比实际功率要用 P = I²R。哪盏灯电阻大？',
      explain: '40 W 的灯电阻 1210 Ω，比 100 W 的 484 Ω 大。串联电流相同，由 P = I²R，<b>40 W 的灯实际功率大，更亮</b>（约 20.4 W 对 8.2 W）。两盏灯各分到的电压都不足 220 V，所以都不能正常发光。'
    },
    {
      level: 'trap',
      title: '电炉丝热得发红，和它相连的导线却几乎不热，主要原因是',
      desc: '电炉丝和导线是串联的。',
      options: ['电流相同，导线的电阻比电炉丝小得多', '通过导线的电流比电炉丝小', '通过导线的电流比电炉丝大', '导线产生的热量多，但散热快'],
      answer: 0,
      hint: '串联电路里电流处处相等，Q = I²Rt 里还剩哪个量不同？',
      explain: '导线和电炉丝<b>串联，电流和通电时间都相同</b>，导线电阻比电炉丝小得多，由 Q = I²Rt，导线产生的热量少得多。说电流不同是错的，串联电流处处相等。'
    }
  ]);
})();
