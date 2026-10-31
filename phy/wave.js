/* 物理互动馆 · 第 21 课 电磁波与能源 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();
  var C = 3e8;

  function halo(o) { o['paint-order'] = 'stroke'; o.stroke = '#fbfaf7'; o['stroke-width'] = 3; o['stroke-linejoin'] = 'round'; return o; }

  /* ========== 电磁波谱 ========== */
  // s = −lg(λ / m)：s 越大，波长越短
  var VIS_A = -Math.log10(7.6e-7), VIS_B = -Math.log10(4e-7);
  var BANDS = [
    { id: 'radio', n: '无线电波', a: -3, b: 0, col: '#9a8fc0', jump: -Math.log10(3) },
    { id: 'micro', n: '微波', a: 0, b: 3, col: '#7f9fc0', jump: -Math.log10(0.1224) },
    { id: 'ir', n: '红外线', a: 3, b: VIS_A, col: '#c98a6b', jump: -Math.log10(9.4e-7) },
    { id: 'vis', n: '可见光', a: VIS_A, b: VIS_B, col: null, jump: -Math.log10(5.5e-7) },
    { id: 'uv', n: '紫外线', a: VIS_B, b: 8, col: '#8a6fc4', jump: -Math.log10(2.54e-7) },
    { id: 'x', n: 'X 射线', a: 8, b: 11, col: '#6f7f99', jump: -Math.log10(3e-11) },
    { id: 'g', n: 'γ 射线', a: 11, b: 12, col: '#5b6475', jump: -Math.log10(2e-12) }
  ];
  var s = L.num(st.s, -Math.log10(0.1224), -3, 12);
  s = Math.round(s * 100) / 100;

  function bandOf(v) { for (var i = 0; i < BANDS.length; i++) if (v < BANDS[i].b) return BANDS[i]; return BANDS[BANDS.length - 1]; }
  function lamOf(v) { return Math.pow(10, -v); }
  function sig3(v) { return String(+v.toPrecision(3)); }
  function lamStr(lam, html) {
    var U = [[1e3, 'km'], [1, 'm'], [1e-2, 'cm'], [1e-3, 'mm'], [1e-6, 'μm'], [1e-9, 'nm'], [1e-12, 'pm']];
    for (var i = 0; i < U.length; i++) if (lam >= U[i][0] * 0.99995 || i === U.length - 1) {
      return sig3(lam / U[i][0]) + (html ? '<small>' + U[i][1] + '</small>' : ' ' + U[i][1]);
    }
  }
  function sci(x) {
    var e = Math.floor(Math.log10(x)), m = +(x / Math.pow(10, e)).toPrecision(3);
    if (m >= 10) { m = +(m / 10).toPrecision(3); e += 1; }
    if (e === 0) return L.fmt(m, 2);
    return L.fmt(m, 2) + '×10' + L.sup(e);
  }
  function fFriendly(f) {
    var U = [[1e12, 'THz'], [1e9, 'GHz'], [1e6, 'MHz'], [1e3, 'kHz']];
    if (f >= 1e15) return '';
    for (var i = 0; i < U.length; i++) if (f >= U[i][0] * 0.99995) return sig3(f / U[i][0]) + ' ' + U[i][1];
    return '';
  }
  function visColor(nm) {
    var r, g, b;
    if (nm >= 645) { r = 1; g = 0; b = 0; }
    else if (nm >= 580) { r = 1; g = (645 - nm) / 65; b = 0; }
    else if (nm >= 510) { r = (nm - 510) / 70; g = 1; b = 0; }
    else if (nm >= 490) { r = 0; g = 1; b = (510 - nm) / 20; }
    else if (nm >= 440) { r = 0; g = (nm - 440) / 50; b = 1; }
    else { r = (440 - nm) / 40 * 0.6; g = 0; b = 1; }
    var f = nm > 700 ? 0.45 + 0.55 * (760 - nm) / 60 : nm < 420 ? 0.45 + 0.55 * (nm - 400) / 20 : 1;
    function c(v) { return Math.round(255 * Math.pow(v * f, 0.8)); }
    return 'rgb(' + c(r) + ',' + c(g) + ',' + c(b) + ')';
  }
  function colorName(nm) { return nm >= 620 ? '红光' : nm >= 590 ? '橙光' : nm >= 570 ? '黄光' : nm >= 495 ? '绿光' : nm >= 450 ? '蓝光' : '紫光'; }
  function useOf(lam) {
    if (lam >= 100) return ['收音机里的中波、长波广播', '中波、长波能沿着地面绕过障碍物传得很远，收音机里的调幅（AM）广播就用它们。'];
    if (lam >= 10) return ['短波收音机、远距离通信', '短波能被高空的电离层反射，像打水漂一样“弹”到很远的地方。'];
    if (lam >= 1) return ['调频（FM）广播、电视', '收音机里的调频广播大约在 87～108 MHz，波长约 3 m。'];
    if (lam >= 0.1) return ['手机通信、Wi-Fi、微波炉', '手机、Wi-Fi 靠微波传递信息；微波炉用约 2450 MHz 的微波，让食物里的水分子剧烈运动而发热。'];
    if (lam >= 1e-3) return ['雷达、卫星通信', '波长只有几厘米、几毫米的微波方向性好，雷达和卫星通信都用它。'];
    if (lam >= 7.6e-7) return ['电视遥控器、红外测温枪、夜视仪', '一切物体都在辐射红外线，温度越高辐射越强。遥控器发出的就是看不见的红外线。'];
    if (lam >= 4e-7) return ['照明，让我们看见东西', '人眼只能看见这一小段电磁波，不同波长看起来是不同的颜色。'];
    if (lam >= 1e-8) return ['紫外线消毒灯、验钞机', '紫外线能杀死微生物，能使荧光物质发光；适量照射有助于人体合成维生素 D，过量会晒伤皮肤。'];
    if (lam >= 1e-11) return ['医院透视、拍 X 光片、安检', 'X 射线穿透本领强，能穿过人体的软组织，却不容易穿过骨骼，所以能拍出骨头的影子。'];
    return ['放射治疗、工业探伤', 'γ 射线能量很高、穿透力极强，医生用它杀死癌细胞，工厂用它检查金属内部的裂缝。'];
  }

  var spec = L.$('#spec');
  var sDefs = S('defs', {}, spec);
  var scp = S('clipPath', { id: 'spec-clip' }, sDefs);
  S('rect', { x: 0, y: 0, width: 400, height: 240, rx: 14 }, scp);
  var grad = S('linearGradient', { id: 'rainbow', x1: 0, y1: 0, x2: 1, y2: 0 }, sDefs);
  [760, 700, 650, 610, 585, 560, 520, 490, 460, 430, 400].forEach(function (nm) {
    S('stop', { offset: ((Math.log10(760) - Math.log10(nm)) / (Math.log10(760) - Math.log10(400)) * 100).toFixed(1) + '%', 'stop-color': visColor(nm) }, grad);
  });
  S('rect', { x: 0, y: 0, width: 400, height: 240, rx: 14, fill: '#fbfaf7' }, spec);
  var sBody = S('g', { 'clip-path': 'url(#spec-clip)' }, spec);
  function X(v) { return 14 + (v + 3) / 15 * 372; }
  var ZX0 = 130, ZX1 = 330, ZY = 170;
  var lamIn = L.$('#lam-in');
  lamIn.value = s;

  function drawSpec() {
    sBody.innerHTML = '';
    var bd = bandOf(s), lam = lamOf(s), nm = lam * 1e9;
    var col = bd.id === 'vis' ? visColor(nm) : bd.col;
    // 示意波形
    var wpx = 110 * Math.pow(3 / 110, (s + 3) / 15), A = 15, Y0 = 50, d = '', step = Math.min(1, wpx / 8);
    for (var x = 16; x <= 384; x += step) d += (d ? 'L' : 'M') + x.toFixed(2) + ' ' + (Y0 - A * Math.cos(2 * Math.PI * (x - 16) / wpx)).toFixed(2);
    S('path', { d: d, fill: 'none', stroke: col, 'stroke-width': wpx < 8 ? 1 : 1.8 }, sBody);
    S('text', { x: 384, y: 16, 'font-size': 9.5, 'text-anchor': 'end', fill: '#8a8598', text: '波形示意，不按比例' }, sBody);
    if (wpx >= 14) {
      S('path', { d: 'M16 20V28M' + (16 + wpx).toFixed(1) + ' 20V28M16 24H' + (16 + wpx).toFixed(1), stroke: '#5a4097', 'stroke-width': 1.2, fill: 'none' }, sBody);
      S('text', halo({ x: 16 + wpx / 2, y: 20, 'font-size': 11, 'text-anchor': 'middle', fill: '#5a4097', 'font-weight': 700, 'font-style': 'italic', text: 'λ' }), sBody);
    } else {
      S('text', { x: 16, y: 16, 'font-size': 9.5, fill: '#5a4097', text: '波长太短，波形挤成一片' }, sBody);
    }
    // 波谱色带
    BANDS.forEach(function (b) {
      var x0 = X(b.a), x1 = X(b.b);
      S('rect', { x: x0, y: 96, width: x1 - x0, height: 24, fill: b.col || 'url(#rainbow)' }, sBody);
      if (b.id === 'vis') return;
      var w = x1 - x0;
      S('text', { x: (x0 + x1) / 2, y: 112, 'font-size': w > 36 ? 10 : 9.5, 'text-anchor': 'middle', fill: '#fff', 'font-weight': 600, text: w > 36 ? b.n : 'γ' }, sBody);
    });
    S('text', { x: (X(VIS_A) + X(VIS_B)) / 2, y: 90, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#5d586a', text: '可见光' }, sBody);
    S('rect', { x: X(bd.a), y: 96, width: X(bd.b) - X(bd.a), height: 24, fill: 'none', stroke: '#312b3f', 'stroke-width': 1.6 }, sBody);
    // 刻度
    for (var k = -3; k <= 12; k++) S('line', { x1: X(k), y1: 120, x2: X(k), y2: k % 3 === 0 ? 127 : 124, stroke: '#a39cb3', 'stroke-width': 1 }, sBody);
    [[-3, '1 km'], [0, '1 m'], [3, '1 mm'], [9, '1 nm'], [12, '1 pm']].forEach(function (t) {
      S('text', { x: L.clamp(X(t[0]), 22, 378), y: 138, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#8a8598', text: t[1] }, sBody);
    });
    // 可见光放大
    S('path', { d: 'M' + X(VIS_A).toFixed(1) + ' 120L' + ZX0 + ' ' + ZY + 'M' + X(VIS_B).toFixed(1) + ' 120L' + ZX1 + ' ' + ZY, stroke: '#c8c1d6', 'stroke-width': 1, 'stroke-dasharray': '3 3', fill: 'none' }, sBody);
    S('rect', { x: ZX0, y: ZY, width: ZX1 - ZX0, height: 14, rx: 3, fill: 'url(#rainbow)' }, sBody);
    S('text', { x: ZX0, y: ZY + 27, 'font-size': 9.5, fill: '#8a8598', text: '760 nm' }, sBody);
    S('text', { x: ZX1, y: ZY + 27, 'font-size': 9.5, 'text-anchor': 'end', fill: '#8a8598', text: '400 nm' }, sBody);
    S('text', { x: (ZX0 + ZX1) / 2, y: ZY + 27, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#8a8598', text: '可见光（放大看）' }, sBody);
    S('text', { x: 16, y: 230, 'font-size': 9.5, fill: '#8a8598', text: '← 波长长，频率低' }, sBody);
    S('text', { x: 384, y: 230, 'font-size': 9.5, 'text-anchor': 'end', fill: '#8a8598', text: '波长短，频率高 →' }, sBody);
    // 指针（可拖）
    var mx = X(s), mk = S('g', { class: 'pt', style: 'cursor:ew-resize' }, sBody);
    S('rect', { x: mx - 10, y: 78, width: 20, height: 56, fill: 'transparent' }, mk);
    S('line', { x1: mx, y1: 88, x2: mx, y2: 128, stroke: '#c2603f', 'stroke-width': 2.2 }, mk);
    S('path', { d: 'M' + (mx - 6) + ' 80L' + (mx + 6) + ' 80L' + mx + ' 88z', fill: '#c2603f' }, mk);
    if (bd.id === 'vis') {
      var zx = ZX0 + (s - VIS_A) / (VIS_B - VIS_A) * (ZX1 - ZX0);
      S('line', { x1: zx, y1: ZY - 4, x2: zx, y2: ZY + 18, stroke: '#312b3f', 'stroke-width': 2 }, sBody);
    }
    specReadout(bd, lam, nm);
  }
  var bandChips;
  function specReadout(bd, lam, nm) {
    var f = C / lam, u = useOf(lam);
    L.$('#lam-out').textContent = lamStr(lam);
    L.$('#band-badge').textContent = bd.id === 'vis' ? '可见光 · ' + colorName(nm) : bd.n;
    L.$('#lam-v').innerHTML = lamStr(lam, true);
    var ff = fFriendly(f);
    L.$('#f-v').innerHTML = sci(f) + '<small>Hz</small>';
    L.$('#use-v').textContent = u[0];
    L.$('#formula').innerHTML = 'f = <b>c</b> ÷ λ = 3×10' + L.sup(8) + ' m/s ÷ ' + sci(lam) + ' m = <b>' + sci(f) + ' Hz</b>' + (ff ? '（' + ff + '）' : '');
    L.$('#spec-text').innerHTML = u[1] + (bd.id === 'vis' ? ' 现在大约是 ' + Math.round(nm) + ' nm 的<b>' + colorName(nm) + '</b>。' : '') + ' 不管波长多少，它在真空中都以 <b>3×10' + L.sup(8) + ' m/s</b> 传播。';
    L.$$('#band-table tbody tr').forEach(function (tr) { tr.classList.toggle('on', tr.dataset.r === bd.id); });
    if (bandChips) bandChips.set(bd.id);
    save();
  }
  function setS(v) {
    s = Math.round(L.clamp(v, -3, 12) * 100) / 100;
    lamIn.value = s; L.paintRange(lamIn);
    drawSpec();
  }
  L.bindRange(lamIn, function (v) { s = v; drawSpec(); });
  bandChips = L.chips(L.$('#band-chips'), BANDS.map(function (b) { return { label: b.n, value: b.id }; }), bandOf(s).id, function (id) {
    BANDS.forEach(function (b) { if (b.id === id) setS(b.jump); });
  });
  var sDrag = false, sZoom = false;
  function fromPoint(p) {
    if (sZoom) setS(VIS_A + L.clamp((p.x - ZX0) / (ZX1 - ZX0), 0, 1) * (VIS_B - VIS_A));
    else setS((p.x - 14) / 372 * 15 - 3);
  }
  spec.addEventListener('pointerdown', function (e) {
    var p = L.svgPoint(spec, e);
    if (p.y < 76 || p.y > 200) return;
    sZoom = p.y > ZY - 12 && p.x >= ZX0 - 6 && p.x <= ZX1 + 6;
    if (!sZoom && p.y > 142) return;
    sDrag = true;
    try { spec.setPointerCapture(e.pointerId); } catch (err) {}
    fromPoint(p); e.preventDefault();
  });
  spec.addEventListener('pointermove', function (e) { if (sDrag) fromPoint(L.svgPoint(spec, e)); });
  ['pointerup', 'pointercancel'].forEach(function (n) { spec.addEventListener(n, function () { sDrag = false; }); });

  /* ========== 真空罩 ========== */
  var jar = L.$('#jar');
  var jDefs = S('defs', {}, jar), jcp = S('clipPath', { id: 'jar-clip' }, jDefs);
  S('rect', { x: 0, y: 0, width: 400, height: 220, rx: 14 }, jcp);
  S('rect', { x: 0, y: 0, width: 400, height: 220, rx: 14, fill: '#fbfaf7' }, jar);
  var jBody = S('g', { 'clip-path': 'url(#jar-clip)' }, jar);
  var air = Math.round(L.num(st.a, 100, 0, 100) / 5) * 5;
  var calling = false, pumping = false, phase = 0;
  var airIn = L.$('#air-in'); airIn.value = air;
  // 罩内空气分子的位置（固定的伪随机点）
  var DOTS = [];
  (function () {
    var seed = 7;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    while (DOTS.length < 44) {
      var x = 96 + rnd() * 128, y = 46 + rnd() * 134;
      var inDome = y > 96 || Math.pow((x - 160) / 70, 2) + Math.pow((y - 96) / 58, 2) < 1;
      var onPhone = x > 140 && x < 180 && y > 124 && y < 186;
      if (inDome && !onPhone) DOTS.push([x, y]);
    }
  })();
  function airNow() { return air; }
  function airFrac() { return air / 100; }
  function drawJar() {
    jBody.innerHTML = '';
    var a = airFrac();
    // 基站
    S('path', { d: 'M30 122L40 40L50 122M33 98H47M36 72H44', fill: 'none', stroke: '#8a8598', 'stroke-width': 1.6 }, jBody);
    S('circle', { cx: 40, cy: 38, r: 3, fill: '#5a4097' }, jBody);
    S('text', { x: 40, y: 136, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#8a8598', text: '基站' }, jBody);
    // 底座、抽气机
    S('rect', { x: 68, y: 186, width: 184, height: 9, rx: 2, fill: '#d9d4e2' }, jBody);
    S('path', { d: 'M252 191H300', stroke: '#a39cb3', 'stroke-width': 4, fill: 'none' }, jBody);
    S('rect', { x: 300, y: 172, width: 62, height: 30, rx: 5, fill: '#e6e2ec', stroke: '#b9b0cc' }, jBody);
    S('text', { x: 331, y: 191, 'font-size': 10, 'text-anchor': 'middle', fill: '#5d586a', text: '抽气机' }, jBody);
    // 空气分子
    var n = Math.round(a * DOTS.length);
    for (var k = 0; k < n; k++) S('circle', { cx: DOTS[k][0], cy: DOTS[k][1], r: 1.8, fill: '#9fb8d8' }, jBody);
    // 手机与泡沫垫
    S('rect', { x: 138, y: 174, width: 44, height: 12, rx: 2, fill: '#f1e3c8' }, jBody);
    S('rect', { x: 148, y: 126, width: 24, height: 48, rx: 4, fill: '#4b425e' }, jBody);
    S('rect', { x: 151, y: 131, width: 18, height: 37, rx: 2, fill: calling ? '#8fdcb8' : '#2e2a38' }, jBody);
    if (calling) S('text', { x: 160, y: 153, 'font-size': 9, 'text-anchor': 'middle', fill: '#1f4d3a', 'font-weight': 700, text: '来电' }, jBody);
    // 电磁波：基站 → 手机，不管有没有空气
    if (calling) {
      var d = '', x0 = 46, y0 = 46, x1 = 146, y1 = 132, L2 = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / L2, uy = (y1 - y0) / L2;
      for (var t = 0; t <= L2; t += 2) {
        var w = 5 * Math.sin(t / 6 - phase * 8);
        d += (d ? 'L' : 'M') + (x0 + ux * t - uy * w).toFixed(1) + ' ' + (y0 + uy * t + ux * w).toFixed(1);
      }
      S('path', { d: d, fill: 'none', stroke: '#5a4097', 'stroke-width': 1.4 }, jBody);
      S('text', halo({ x: 108, y: 70, 'font-size': 10, fill: '#5a4097', 'font-weight': 600, text: '电磁波' }), jBody);
    }
    // 铃声：声波向右传，空气越少越弱
    if (calling && a > 0) {
      for (k = 0; k < 5; k++) {
        var r = 18 + ((phase * 70 + k * 34) % 170);
        var op = (r < 74 ? a : Math.pow(a, 1.4)) * Math.max(0, 1 - r / 175) * 0.95;
        if (op < 0.02) continue;
        var a0 = -0.6, a1 = 0.6;
        S('path', { d: 'M' + (160 + r * Math.cos(a0)).toFixed(1) + ' ' + (150 + r * Math.sin(a0)).toFixed(1) + 'A' + r + ' ' + r + ' 0 0 1 ' + (160 + r * Math.cos(a1)).toFixed(1) + ' ' + (150 + r * Math.sin(a1)).toFixed(1), fill: 'none', stroke: '#c2603f', 'stroke-width': 1.8, opacity: op.toFixed(2) }, jBody);
      }
    }
    // 玻璃罩
    S('path', { d: 'M88 186V96A72 60 0 0 1 232 96V186', fill: '#e8f1f8', 'fill-opacity': 0.35, stroke: '#8fb0d4', 'stroke-width': 2 }, jBody);
    S('rect', { x: 153, y: 28, width: 14, height: 9, rx: 2, fill: '#b9c9dc' }, jBody);
    S('text', { x: 236, y: 178, 'font-size': 9.5, fill: '#5a7aa6', text: '玻璃罩' }, jBody);
    // 罩外的耳朵
    S('path', { d: 'M352 78c14-4 24 6 22 20c-1 8-8 11-9 18c-1 6-6 9-11 7', fill: '#f4dccb', stroke: '#c79a7c', 'stroke-width': 1.5 }, jBody);
    S('path', { d: 'M358 90c6-2 10 3 8 8', fill: 'none', stroke: '#c79a7c', 'stroke-width': 1.3 }, jBody);
    S('text', { x: 362, y: 142, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#8a8598', text: '罩外听' }, jBody);
    S('text', { x: 160, y: 212, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#8a8598', text: '罩内空气 ' + Math.round(air) + ' %' }, jBody);
  }
  function loudness() {
    var air = Math.round(airNow());
    if (!calling) return '—';
    if (air >= 80) return '很清楚';
    if (air >= 50) return '变小了';
    if (air >= 20) return '很小';
    if (air > 0) return '非常微弱';
    return '几乎听不到';
  }
  function jarReadout() {
    var air = Math.round(airNow());
    L.$('#air-out').textContent = air + ' %';
    L.$('#call-btn').textContent = calling ? '挂断电话' : '给罩里的手机打电话';
    L.$('#pump-btn').textContent = air > 0 ? '一键抽气' : '放进空气';
    L.$('#jar-badge').textContent = calling ? '来电中' : '未来电';
    L.$('#snd-v').textContent = loudness();
    L.$('#sig-v').textContent = calling ? '能，屏幕亮' : '—';
    var t;
    if (!calling) t = '点“给罩里的手机打电话”。手机能不能接到电话，要看<b>电磁波</b>能不能进到罩里；你能不能听到铃声，要看<b>声音</b>能不能传出来。';
    else if (air === 100) t = '罩里充满空气，铃声很清楚，屏幕也亮了。现在开始抽气，盯住这两样东西。';
    else if (air > 0) t = '空气越来越少，铃声越来越小，可屏幕照样亮着：手机一直收得到信号。';
    else t = '空气几乎抽光了，<b>几乎听不到铃声</b>，屏幕却照样亮着。说明声音的传播需要介质，<b>真空不能传声</b>；而<b>电磁波能在真空中传播</b>。实验中总能听到一点点，是因为罩里抽不成绝对真空，声音还能从底座等固体传出来，所以“真空不能传声”是在实验基础上<b>推理</b>得出的。';
    L.$('#jar-text').innerHTML = t;
    save();
  }
  var jarVisible = true;
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { jarVisible = es[0].isIntersecting; }).observe(jar);
  var jLoop = null;
  function jarAnim() {
    if (L.REDUCED) { if (pumping) { air = air > 0 ? 0 : 100; pumping = false; syncAir(); } drawJar(); jarReadout(); return; }
    if (jLoop) return;
    jLoop = L.loop(function (dt) {
      if (pumping) {
        var target = pumpTarget, next = air + (target > air ? 1 : -1) * 35 * dt;
        if ((target > air && next >= target) || (target < air && next <= target) || target === air) { next = target; pumping = false; }
        air = Math.round(next * 10) / 10;
        syncAir();
      }
      phase += dt;
      if (jarVisible) drawJar();
      if (!calling && !pumping) { jLoop = null; drawJar(); return false; }
    });
  }
  var pumpTarget = 0;
  function syncAir() {
    airIn.value = Math.round(air / 5) * 5; L.paintRange(airIn);
    jarReadout();
  }
  L.bindRange(airIn, function (v) { pumping = false; air = v; drawJar(); jarReadout(); });
  L.$('#call-btn').addEventListener('click', function () { calling = !calling; drawJar(); jarReadout(); jarAnim(); });
  L.$('#pump-btn').addEventListener('click', function () { pumpTarget = air > 0 ? 0 : 100; pumping = true; jarAnim(); });

  /* ========== 能源分类 ========== */
  var EN = {
    sun: { n: '太阳能', src: 'a', re: 'a', w1: '直接来自太阳，属于一次能源', w2: '太阳还能照几十亿年，源源不断，属于可再生能源' },
    wind: { n: '风能', src: 'a', re: 'a', w1: '风是自然界直接就有的，属于一次能源', w2: '风会一直刮，属于可再生能源' },
    water: { n: '水能', src: 'a', re: 'a', w1: '流动的水直接来自自然界，属于一次能源', w2: '水在自然界不断循环，属于可再生能源' },
    coal: { n: '煤', src: 'a', re: 'b', w1: '直接从地下开采，属于一次能源', w2: '化石能源，要经过漫长年代才能形成，短期内不能补充，属于不可再生能源' },
    oil: { n: '石油', src: 'a', re: 'b', w1: '直接从地下开采，属于一次能源', w2: '化石能源，短期内不能补充，属于不可再生能源' },
    gas: { n: '天然气', src: 'a', re: 'b', w1: '直接从地下开采，属于一次能源', w2: '化石能源，短期内不能补充，属于不可再生能源' },
    nuke: { n: '核能', src: 'a', re: 'b', w1: '来自铀等核燃料，属于一次能源', w2: '核燃料是矿产，用一点少一点，属于不可再生能源' },
    elec: { n: '电能', src: 'b', w1: '要消耗煤、水能、核能等一次能源才能得到，属于二次能源' },
    petrol: { n: '汽油', src: 'b', w1: '是从石油里提炼出来的，属于二次能源' },
    bio: { n: '生物质能', re: 'a', w2: '来自植物、秸秆等，能一茬一茬重新长出来，属于可再生能源' }
  };
  var MODES = {
    src: { keys: ['sun', 'wind', 'water', 'coal', 'oil', 'gas', 'nuke', 'elec', 'petrol'], a: '一次能源', b: '二次能源', note: '一次能源：从自然界直接获取。二次能源：消耗一次能源才能得到。' },
    re: { keys: ['sun', 'wind', 'water', 'coal', 'oil', 'gas', 'nuke', 'bio'], a: '可再生能源', b: '不可再生能源', note: '电能、汽油是二次能源，这里只给从自然界直接获取的能源分“可再生 / 不可再生”。' }
  };
  var emode = st.em === 're' ? 're' : 'src';
  var place = { src: {}, re: {} }, checked = { src: false, re: false }, sel = null;

  function tokenBtn(key, box) {
    var p = place[emode][key], ok = p && EN[key][emode] === p;
    var mark = checked[emode] && p ? (ok ? '✓ ' : '✗ ') : '';
    var b = L.html('button', { type: 'button', text: mark + EN[key].n, 'aria-pressed': String(sel === key) }, box);
    if (checked[emode] && p && sel !== key) b.style.cssText = ok ? 'background:#e1efe3;color:#2f6a4a' : 'background:#fbe4da;color:#a4492b';
    b.addEventListener('click', function () { sel = sel === key ? null : key; renderSort(); });
  }
  function renderSort() {
    var m = MODES[emode], pool = L.$('#pool'), la = L.$('#list-a'), lb = L.$('#list-b');
    pool.innerHTML = ''; la.innerHTML = ''; lb.innerHTML = '';
    m.keys.forEach(function (k) {
      var p = place[emode][k];
      tokenBtn(k, p === 'a' ? la : p === 'b' ? lb : pool);
    });
    if (!pool.children.length) L.html('span', { text: '全部放好了，点“检查分类”。', style: 'font-size:14px;color:var(--muted);align-self:center' }, pool);
    L.$('#bin-a').textContent = '放进「' + m.a + '」';
    L.$('#bin-b').textContent = '放进「' + m.b + '」';
    L.$('#sort-note').textContent = m.note;
    sortReadout();
  }
  function result(md) {
    var m = MODES[md], done = 0, right = 0, wrong = [];
    m.keys.forEach(function (k) {
      var p = place[md][k];
      if (!p) return;
      done++;
      if (EN[k][md] === p) right++; else wrong.push(k);
    });
    return { n: m.keys.length, done: done, right: right, wrong: wrong };
  }
  function sortReadout() {
    var r = result(emode), m = MODES[emode], t;
    L.$('#sort-done').innerHTML = r.done + '<small>/ ' + r.n + '</small>';
    L.$('#sort-right').innerHTML = checked[emode] ? r.right + '<small>/ ' + r.n + '</small>' : '—';
    if (!checked[emode]) {
      L.$('#sort-badge').textContent = '还没检查';
      t = sel ? '已选中“' + EN[sel].n + '”，点一个篮子把它放进去。' : '按“' + m.a + ' / ' + m.b + '”来分。先点一个能源，再点篮子。';
    } else if (r.done < r.n) {
      L.$('#sort-badge').textContent = '还没放完';
      t = '还有 ' + (r.n - r.done) + ' 个能源没放进篮子。' + (r.wrong.length ? '已放的里面有 ' + r.wrong.length + ' 个放错了（标 ✗ 的）。' : '已放的都对。');
    } else if (!r.wrong.length) {
      L.$('#sort-badge').textContent = '全部正确';
      t = emode === 'src'
        ? '全对！太阳能、风能、水能、化石能源和核能都能从自然界直接获取，是一次能源；<b>电能</b>要靠消耗它们才能得到，<b>汽油</b>是从石油里炼出来的，都是二次能源。'
        : '全对！太阳能、风能、水能、生物质能能不断得到补充，是可再生能源；煤、石油、天然气这些<b>化石能源</b>和<b>核能</b>，用掉就很难再有，是不可再生能源。';
    } else {
      L.$('#sort-badge').textContent = '有 ' + r.wrong.length + ' 个放错';
      t = r.wrong.map(function (k) { return '<b>' + EN[k].n + '</b>：' + (emode === 'src' ? EN[k].w1 : EN[k].w2) + '。'; }).join(' ') + ' 点它，换个篮子。';
    }
    L.$('#sort-text').innerHTML = t;
    save();
  }
  function drop(bin) {
    if (!sel) { L.$('#sort-text').innerHTML = '先点上面的一个能源，再点篮子。'; return; }
    place[emode][sel] = bin; sel = null;
    renderSort();
  }
  L.$('#bin-a').addEventListener('click', function () { drop('a'); });
  L.$('#bin-b').addEventListener('click', function () { drop('b'); });
  L.$('#sort-check').addEventListener('click', function () { checked[emode] = true; sel = null; renderSort(); });
  L.$('#sort-reset').addEventListener('click', function () { place[emode] = {}; checked[emode] = false; sel = null; renderSort(); });
  L.chips(L.$('#emode-chips'), [{ label: '一次 / 二次', value: 'src' }, { label: '可再生 / 不可再生', value: 're' }], emode, function (v) { emode = v; sel = null; renderSort(); });

  function save() { L.setState({ s: s, a: Math.round(air), em: emode }); }

  drawSpec();
  drawJar();
  jarReadout();
  renderSort();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '找到微波炉用的那种电磁波',
      desc: '微波炉的电磁波频率约为 2450 MHz。在波谱上找到它所在的波段。',
      label: '在电磁波谱里操作',
      button: '检查波段',
      check: function () {
        var bd = bandOf(s);
        if (bd.id === 'micro') return { ok: true, msg: '对，是<b>微波</b>。现在波长 ' + lamStr(lamOf(s)) + '。把滑块调到约 12 cm，算出的频率就接近 2.45×10' + L.sup(9) + ' Hz。' };
        if (bd.id === 'radio') return { ok: false, msg: '现在是无线电波，频率还太低。2450 MHz = 2.45×10' + L.sup(9) + ' Hz，波长应该是十几厘米，往右拖一点。' };
        return { ok: false, msg: '现在是' + bd.n + '，频率太高了。λ = c ÷ f ≈ 0.12 m，往左拖回到厘米级的波长。' };
      }
    },
    {
      level: 'base',
      title: '电磁波在真空中的传播速度是',
      desc: '它和光在真空中的速度相同。',
      options: ['3×10<sup>8</sup> m/s', '340 m/s', '3×10<sup>5</sup> m/s', '电磁波不能在真空中传播'],
      answer: 0,
      hint: '340 m/s 是声音在 15 ℃ 空气中的速度。',
      explain: '电磁波在真空中的速度 c = <b>3×10<sup>8</sup> m/s</b>，也就是 3×10<sup>5</sup> km/s，注意单位是 km/s 而不是 m/s。340 m/s 是声速；电磁波能在真空中传播，太阳光就是穿过真空来到地球的。'
    },
    {
      level: 'base',
      title: '下列能源中，属于二次能源的是',
      desc: '二次能源：不能从自然界直接获取，要消耗一次能源才能得到。',
      options: ['电能', '太阳能', '天然气', '风能'],
      answer: 0,
      hint: '哪一种是靠烧煤、水力发电、核电站“变”出来的？',
      explain: '<b>电能</b>要靠消耗煤、水能、核能等一次能源才能得到，是二次能源。太阳能、天然气、风能都能从自然界直接获取，是一次能源。'
    },
    {
      level: 'mid',
      title: '某调频电台的频率是 100 MHz，它发出的电磁波波长是',
      desc: '可以先在波谱上把波长调到 3 m 附近，看看频率是多少。',
      options: ['3 m', '0.3 m', '30 m', '3×10<sup>6</sup> m'],
      answer: 0,
      hint: '先把 100 MHz 换成 Hz：1 MHz = 10<sup>6</sup> Hz。',
      explain: '100 MHz = 1×10<sup>8</sup> Hz，λ = c ÷ f = 3×10<sup>8</sup> m/s ÷ 1×10<sup>8</sup> Hz = <b>3 m</b>。选 3×10<sup>6</sup> m 的同学是忘了换单位，直接用 3×10<sup>8</sup> ÷ 100。'
    },
    {
      level: 'mid',
      title: '做出“看得见来电，听不见铃声”',
      desc: '给真空罩里的手机打电话，再把罩里的空气抽到 5 % 以下。',
      label: '在真空罩里操作',
      button: '检查实验',
      check: function () {
        if (!calling) return { ok: false, msg: '先点“给罩里的手机打电话”。' };
        if (air > 5) return { ok: false, msg: '罩里还有 ' + Math.round(air) + ' % 的空气，铃声还能传出来。继续抽气。' };
        return { ok: true, msg: '屏幕亮着，说明电磁波进得去；铃声几乎听不到，说明声音出不来。<b>电磁波能在真空中传播，声音不能。</b>' };
      }
    },
    {
      level: 'mid',
      title: '把能源按“可再生 / 不可再生”分对',
      desc: '在“给能源分分类”里切换到“可再生 / 不可再生”，把 8 种能源都放进篮子并检查，要求全部正确。',
      label: '在能源分类里操作',
      button: '检查分类',
      check: function () {
        var r = result('re');
        if (r.done < r.n) return { ok: false, msg: '还有 ' + (r.n - r.done) + ' 个能源没放。先把分类方法切到“可再生 / 不可再生”。' };
        if (r.wrong.length) return { ok: false, msg: '有放错的：' + r.wrong.map(function (k) { return EN[k].n; }).join('、') + '。想一想：它用掉之后，短期内还能从自然界得到补充吗？' };
        return { ok: true, msg: '全部正确。判断标准就一句话：能不能在短期内从自然界<b>源源不断</b>地得到补充。' };
      }
    },
    {
      level: 'trap',
      title: '关于不同波长的电磁波，下列说法正确的是',
      desc: '把滑块从左拖到右，留意读数里哪个量变了、哪个量没变。',
      options: ['在真空中传播速度都相同', '波长越短，传播速度越快', '频率越高，传播速度越快', '波长越长，传播速度越快'],
      answer: 0,
      hint: 'c = λf 里，哪个量是定值？',
      explain: '真空中所有电磁波的速度都是 <b>3×10<sup>8</sup> m/s</b>。波长和频率此长彼短，乘积不变；频率高、波长短并不会让它跑得更快。'
    },
    {
      level: 'trap',
      title: '关于核能，下列说法正确的是',
      desc: '深圳大鹏新区的大亚湾核电站就是利用核能发电的。',
      options: ['核电站利用可控的核裂变发电，核能是不可再生能源', '核电站利用核聚变发电', '核能是可再生能源，因为核燃料用不完', '太阳内部发生的是核裂变'],
      answer: 0,
      hint: '原子弹和氢弹分别是什么反应？哪一种已经能被人控制？',
      explain: '核电站利用<b>可控的核裂变</b>（与原子弹同类反应，但速度被控制住了）；可控核聚变还在研究中。太阳内部是<b>核聚变</b>。核燃料是矿产，用一点少一点，核能是<b>不可再生能源</b>。'
    }
  ]);
})();
