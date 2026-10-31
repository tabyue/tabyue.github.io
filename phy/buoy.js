/* 物理互动馆 · 第 10 课 浮力 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();
  // g 取 10 N/kg：1 g 物体重 0.01 N；1 cm³ 液体（密度 ρ g/cm³）重 0.01ρ N

  function clipDefs(el, id, w, h) {
    var defs = S('defs', {}, el), cp = S('clipPath', { id: id }, defs);
    S('rect', { x: 0, y: 0, width: w, height: h, rx: 14 }, cp);
    return defs;
  }
  function setText(el, h) { if (el._t !== h) { el._t = h; el.innerHTML = h; } }

  var LIQ = {
    alcohol: { name: '酒精', rho: 0.8, fill: '#eef1f6' },
    water: { name: '水', rho: 1.0, fill: '#d6e8f5' },
    salt: { name: '盐水', rho: 1.1, fill: '#cfe2e6' }
  };
  var LIQ_ITEMS = [{ label: '酒精 0.8 g/cm³', value: 'alcohol' }, { label: '水 1.0 g/cm³', value: 'water' }, { label: '盐水 约 1.1 g/cm³', value: 'salt' }];

  /* ========== ① 称重法 + 溢水杯 ========== */
  var GAL = 2.7, VB = 100, BASE = 20, HB = 5;   // 铝块：2.7 N，100 cm³，底面 20 cm²，高 5 cm
  var liq1 = LIQ[st.q] ? st.q : 'water';
  var dep = Math.round(L.num(st.d, 0, 0, 8) * 2) / 2;
  var weigh = L.$('#weigh'), weighDefs = clipDefs(weigh, 'weigh-clip', 400, 260);
  var WY = 168, PK = 10, BXc = 112, HOOK = 32;  // 液面（与溢水口相平）、1 cm = 10 px、铝块中线、挂钩线长

  function vPai() { return BASE * Math.min(dep, HB); }
  function fBuoy() { return LIQ[liq1].rho * vPai() * 0.01; }
  function fShow() { return GAL - fBuoy(); }

  function drawWeigh() {
    weigh.innerHTML = ''; weigh.appendChild(weighDefs);
    S('rect', { x: 0, y: 0, width: 400, height: 260, rx: 14, fill: '#fbfaf7' }, weigh);
    var g = S('g', { 'clip-path': 'url(#weigh-clip)' }, weigh);
    // 铁架台
    S('line', { x1: 24, y1: 4, x2: 24, y2: 256, stroke: '#a39cb3', 'stroke-width': 4 }, g);
    S('line', { x1: 24, y1: 5, x2: 132, y2: 5, stroke: '#a39cb3', 'stroke-width': 4 }, g);
    S('rect', { x: 0, y: 252, width: 400, height: 8, fill: '#e8e1d3' }, g);
    var bot = WY + dep * PK, top = bot - HB * PK, bodyTop = top - HOOK - 70;
    // 测力计：0～3 N，1 N = 18 px
    S('line', { x1: BXc, y1: 5, x2: BXc, y2: bodyTop - 11, stroke: '#6b6478', 'stroke-width': 1.2 }, g);
    S('circle', { cx: BXc, cy: bodyTop - 6, r: 5, fill: 'none', stroke: '#8a7fb0', 'stroke-width': 1.5 }, g);
    S('rect', { x: BXc - 14, y: bodyTop, width: 28, height: 70, rx: 4, fill: '#f4f1fa', stroke: '#8a7fb0', 'stroke-width': 1.3 }, g);
    for (var q = 0; q <= 15; q++) {
      var ty = bodyTop + 8 + q * 3.6;
      S('line', { x1: BXc + 2, y1: ty, x2: BXc + (q % 5 === 0 ? 10 : 6), y2: ty, stroke: '#8a7fb0', 'stroke-width': 1 }, g);
      if (q % 5 === 0) S('text', { x: BXc - 3, y: ty + 3, 'font-size': 9, 'text-anchor': 'end', fill: '#5a4097', text: q / 5 }, g);
    }
    S('text', { x: BXc + 18, y: bodyTop + 66, 'font-size': 9, fill: '#8a8598', text: '单位 N' }, g);
    var py = bodyTop + 8 + fShow() * 18;
    S('path', { d: 'M' + (BXc + 12) + ' ' + (py - 3.5) + 'L' + (BXc + 3) + ' ' + py + 'L' + (BXc + 12) + ' ' + (py + 3.5) + 'z', fill: '#c2603f' }, g);
    S('line', { x1: BXc, y1: bodyTop + 70, x2: BXc, y2: top, stroke: '#6b6478', 'stroke-width': 1.2 }, g);
    S('text', { x: BXc - 18, y: bodyTop + 14, 'font-size': 9, 'text-anchor': 'end', fill: '#5a4097', text: '示数 ' + L.fmt(fShow(), 2) + ' N' }, g);
    // 小桶：接排开的液体
    S('path', { d: 'M188 200V250H238V200', fill: 'none', stroke: '#8a9bb0', 'stroke-width': 2 }, g);
    var vh = vPai() * 0.4;
    if (vh > 0) S('rect', { x: 189, y: 250 - vh, width: 48, height: vh, fill: LIQ[liq1].fill, stroke: '#7f9fc0', 'stroke-width': 0.8 }, g);
    S('text', { x: 244, y: 224, 'font-size': 9, fill: '#5a6e86', text: '← 小桶：排开的' + LIQ[liq1].name }, g);
    S('text', { x: 244, y: 238, 'font-size': 9, fill: '#5a6e86', text: L.fmt(vPai(), 0) + ' cm³，重 ' + L.fmt(fBuoy(), 2) + ' N' }, g);
    // 铝块
    S('rect', { x: BXc - 25, y: top, width: 50, height: HB * PK, rx: 2, fill: '#a7b0ba', stroke: '#6f7785', 'stroke-width': 1.2 }, g);
    S('text', { x: BXc, y: top + 29, 'font-size': 10, 'text-anchor': 'middle', fill: '#fff', 'font-weight': 600, text: '铝块' }, g);
    // 溢水杯里的液体（盖在铝块上，浸入部分看起来在液体里）
    S('rect', { x: 62, y: WY, width: 110, height: 250 - WY, fill: LIQ[liq1].fill, opacity: 0.62 }, g);
    S('line', { x1: 62, y1: WY, x2: 196, y2: WY, stroke: '#7f9fc0', 'stroke-width': 1.2 }, g);
    S('path', { d: 'M62 120V250H172V' + (WY - 4), fill: 'none', stroke: '#8a9bb0', 'stroke-width': 2.4 }, g);
    S('path', { d: 'M172 ' + (WY - 4) + 'L198 ' + (WY + 8) + 'M172 ' + (WY + 4) + 'L196 ' + (WY + 14), fill: 'none', stroke: '#8a9bb0', 'stroke-width': 1.6 }, g);
    S('text', { x: 178, y: 140, 'font-size': 9, fill: '#5a6e86', text: '溢水杯（装满）' }, g);
    // 浮力箭头
    if (fBuoy() > 0) {
      L.arrow(g, 76, bot, 76, bot - fBuoy() * 34, { color: '#c2603f', width: 2.2, head: 7 });
      S('text', { x: 70, y: bot - fBuoy() * 17 + 3, 'font-size': 10, 'text-anchor': 'end', fill: '#c2603f', 'font-weight': 600, text: 'F浮' }, g);
    }
    // 深度标注
    if (dep > 0) S('text', { x: BXc + 30, y: bot - 4, 'font-size': 9, fill: '#5a4097', text: '浸入 ' + L.fmt(dep, 1) + ' cm' }, g);
  }

  var fh = L.$('#fh');
  function drawGraph() {
    var ax = L.axes(fh, { xmin: 0, xmax: 8, ymin: 0, ymax: 3, xstep: 1, ystep: 0.5, ylabelStep: 1, xlabel: ' ', ylabel: 'F/N', left: 30, bottom: 24 });
    S('text', { x: ax.X(8), y: ax.Y(0) - 6, 'font-size': 10, 'text-anchor': 'end', fill: '#5b6475', 'font-style': 'italic', text: 'h/cm' }, ax.layer);
    var defs = S('defs', {}, fh), cp = S('clipPath', { id: 'fh-clip' }, defs);
    S('rect', { x: ax.X(0) - 6, y: ax.Y(3) - 6, width: ax.X(8) - ax.X(0) + 12, height: ax.Y(0) - ax.Y(3) + 12 }, cp);
    var g = S('g', { 'clip-path': 'url(#fh-clip)' }, ax.layer);
    var rho = LIQ[liq1].rho, fb = rho * VB * 0.01;
    function pts(arr) { return 'M' + arr.map(function (p) { return ax.X(p[0]).toFixed(1) + ' ' + ax.Y(p[1]).toFixed(1); }).join('L'); }
    S('line', { x1: ax.X(5), y1: ax.Y(0), x2: ax.X(5), y2: ax.Y(3), stroke: '#c9c3d6', 'stroke-dasharray': '3 3' }, g);
    S('path', { d: pts([[0, GAL], [5, GAL - fb], [8, GAL - fb]]), fill: 'none', stroke: '#5a4097', 'stroke-width': 2.2 }, g);
    S('path', { d: pts([[0, 0], [5, fb], [8, fb]]), fill: 'none', stroke: '#c2603f', 'stroke-width': 2.2 }, g);
    S('circle', { cx: ax.X(dep), cy: ax.Y(fShow()), r: 4.5, fill: '#5a4097', stroke: '#fff', 'stroke-width': 1.5 }, g);
    S('circle', { cx: ax.X(dep), cy: ax.Y(fBuoy()), r: 4.5, fill: '#c2603f', stroke: '#fff', 'stroke-width': 1.5 }, g);
    S('text', { x: ax.X(5) + 3, y: ax.Y(3) + 10, 'font-size': 9, fill: '#8a8598', text: '刚好浸没' }, g);
  }

  function readWeigh() {
    var fb = fBuoy(), nm = LIQ[liq1].name;
    L.$('#dep-out').textContent = L.fmt(dep, 1) + ' cm';
    L.$('#wg-badge').textContent = dep === 0 ? '未浸入' : (dep < HB ? '部分浸入' : '浸没');
    L.$('#wg-G').innerHTML = L.qty(GAL, 'N', 2);
    L.$('#wg-F').innerHTML = L.qty(fShow(), 'N', 2);
    L.$('#wg-fb').innerHTML = L.qty(fb, 'N', 2);
    L.$('#wg-gp').innerHTML = L.qty(fb, 'N', 2);
    L.$('#wg-v').innerHTML = L.fmt(vPai(), 0) + '<small>cm³ = ' + L.fmt(vPai(), 0) + ' × 10⁻⁶ m³</small>';
    var t;
    if (dep === 0) t = '铝块还在液面上方，测力计示数就是它的重力 G = 2.7 N（质量 270 g）。慢慢往下放。';
    else if (dep < HB) t = '铝块浸入 ' + L.fmt(dep, 1) + ' cm，排开' + nm + ' ' + L.fmt(vPai(), 0) + ' cm³。示数降到 ' + L.fmt(fShow(), 2) + ' N，说明液体向上托它 F浮 = 2.7 N − ' + L.fmt(fShow(), 2) + ' N = ' + L.fmt(fb, 2) + ' N；小桶里接到的' + nm + '也正好重 ' + L.fmt(fb, 2) + ' N：<b>F浮 = G排</b>。';
    else t = '铝块已<b>完全浸没</b>，V排 = 100 cm³ 不再增加，浮力保持 ' + L.fmt(fb, 2) + ' N' + (dep > HB ? '。再往下放示数也不变：<b>浸没后浮力与深度无关</b>。' : '，这时 V排 = V物。');
    setText(L.$('#wg-text'), t);
    save();
  }
  function weighChanged() { drawWeigh(); drawGraph(); readWeigh(); }
  var depIn = L.$('#dep-in');
  depIn.value = dep;
  L.bindRange(depIn, function (v) { dep = v; weighChanged(); });
  L.chips(L.$('#liq1-chips'), LIQ_ITEMS, liq1, function (v) { liq1 = v; weighChanged(); });

  /* ========== ② 浮沉条件 ========== */
  var sinkSvg = L.$('#sink'), sinkDefs = clipDefs(sinkSvg, 'sink-clip', 400, 240);
  var rho = Math.round(L.num(st.r, 0.6, 0.2, 2) * 20) / 20;
  var liq2 = LIQ[st.q2] ? st.q2 : 'water';
  var SY2 = 60, BOT = 225, SIDE = 40, Y0 = 120, FK = 30;   // 液面、底、物块边长（px）、起始上沿、受力图 1 N = 30 px
  var obj = null, sinkAnim = null;

  function rl() { return LIQ[liq2].rho; }
  function frac(y) { return L.clamp((y + SIDE - SY2) / SIDE, 0, 1); }
  function fbAt(y) { return rl() * frac(y); }        // 100 cm³ 浸没时浮力 = ρ液（g/cm³）N
  function gObj() { return rho; }                    // 100 cm³ 物块重 = ρ物（g/cm³）N
  function cmpRho() { return Math.abs(rho - rl()) < 1e-6 ? 0 : (rho < rl() ? -1 : 1); }
  function yFloat() { return SY2 - SIDE + SIDE * rho / rl(); }

  function objColor() {
    var t = L.clamp((rho - 0.2) / 1.8, 0, 1);
    var a = [232, 207, 154], b = [95, 102, 112];
    return 'rgb(' + a.map(function (c, i) { return Math.round(L.lerp(c, b[i], t)); }).join(',') + ')';
  }
  function drawSink() {
    sinkSvg.innerHTML = ''; sinkSvg.appendChild(sinkDefs);
    S('rect', { x: 0, y: 0, width: 400, height: 240, rx: 14, fill: '#fbfaf7' }, sinkSvg);
    var g = S('g', { 'clip-path': 'url(#sink-clip)' }, sinkSvg);
    S('rect', { x: 0, y: 228, width: 400, height: 12, fill: '#e8e1d3' }, g);
    var y = obj.y, cx = 200;
    if (obj.held) {
      S('line', { x1: cx, y1: 0, x2: cx, y2: y, stroke: '#8a8598', 'stroke-width': 3 }, g);
      S('text', { x: cx + 8, y: 16, 'font-size': 9, fill: '#8a8598', text: '细杆按住' }, g);
    }
    S('rect', { x: cx - SIDE / 2, y: y, width: SIDE, height: SIDE, rx: 2, fill: objColor(), stroke: '#5b5568', 'stroke-width': 1.2 }, g);
    S('text', { x: cx, y: y + 24, 'font-size': 9, 'text-anchor': 'middle', fill: rho > 1.1 ? '#fff' : '#4b425e', text: L.fmt(rho, 2) }, g);
    // 液体盖在物块上
    S('rect', { x: 71, y: SY2, width: 258, height: BOT - SY2, fill: LIQ[liq2].fill, opacity: 0.6 }, g);
    S('line', { x1: 71, y1: SY2, x2: 329, y2: SY2, stroke: '#7f9fc0', 'stroke-width': 1.2 }, g);
    S('path', { d: 'M70 30V' + BOT + 'H330V30', fill: 'none', stroke: '#8a9bb0', 'stroke-width': 2.4 }, g);
    S('text', { x: 324, y: SY2 + 14, 'font-size': 9, 'text-anchor': 'end', fill: '#5a6e86', text: LIQ[liq2].name + ' ' + rl().toFixed(1) + ' g/cm³' }, g);
    // 受力示意：单独画在水槽右侧，物块在哪儿都不会被裁掉
    var F = fbAt(y), Gw = gObj(), onBot = y + SIDE >= BOT - 0.01, N = onBot ? Math.max(0, Gw - F) : 0;
    var IX = 366, IY = 130, lf = Math.max(F * FK, 9), ln = Math.max(N * FK, 9);
    S('text', { x: IX, y: 70, 'font-size': 9, 'text-anchor': 'middle', fill: '#8a8598', text: '受力示意' }, g);
    S('rect', { x: IX - 7, y: IY - 7, width: 14, height: 14, rx: 2, fill: objColor(), stroke: '#5b5568' }, g);
    if (F > 0.001) L.arrow(g, IX - 4, IY, IX - 4, IY - lf, { color: '#c2603f', width: 2.2, head: 7 });
    if (F > 0.001) S('text', { x: IX - 9, y: IY - lf + 8, 'font-size': 10, 'text-anchor': 'end', fill: '#c2603f', 'font-weight': 600, text: 'F浮' }, g);
    if (N > 0.001) {
      L.arrow(g, IX + 4, IY, IX + 4, IY - ln, { color: '#3f8a6a', width: 2.2, head: 7 });
      S('text', { x: IX + 9, y: IY - ln + 8, 'font-size': 10, fill: '#3f8a6a', 'font-weight': 600, text: 'N' }, g);
    }
    L.arrow(g, IX, IY, IX, IY + Gw * FK, { color: '#5a4097', width: 2.2, head: 7 });
    S('text', { x: IX + 6, y: IY + Gw * FK - 2, 'font-size': 10, fill: '#5a4097', 'font-weight': 600, text: 'G' }, g);
    if (obj.settled) S('text', { x: 80, y: 48, 'font-size': 11, fill: '#5a4097', 'font-weight': 600, text: stateName() }, g);
  }
  function stateName() {
    if (obj.held) return '按住中';
    if (!obj.settled) return obj.v > 0 ? '上浮中' : '下沉中';
    var c = cmpRho();
    return c < 0 ? '漂浮' : (c === 0 ? '悬浮' : '沉底');
  }
  function stopSink() { if (sinkAnim) sinkAnim.stop(); sinkAnim = null; }
  function resetSink() { stopSink(); obj = { y: Y0, v: 0, held: true, settled: false }; drawSink(); readSink(); }
  function settleSink() {
    sinkAnim = null;
    var c = cmpRho();
    obj.settled = true; obj.v = 0;
    if (c < 0) obj.y = yFloat(); else if (c > 0) obj.y = BOT - SIDE;
    drawSink(); readSink();
  }
  function sinkGo() {
    stopSink();
    obj = { y: Y0, v: 0, held: false, settled: false };
    if (cmpRho() === 0 || L.REDUCED) { settleSink(); return; }
    sinkAnim = L.loop(function (dt) {
      var F = fbAt(obj.y), Gw = gObj(), v = 160 * (F - Gw) / Math.max(F, Gw);
      if (frac(obj.y) >= 1 && Math.abs(v) < 25) v = v > 0 ? 25 : -25;   // 浸没时净力很小也别慢得看不出来
      v = L.clamp(v, -90, 90);
      obj.v = v; obj.y -= v * dt;
      var c = cmpRho();
      if ((c > 0 && obj.y + SIDE >= BOT) || (c < 0 && Math.abs(obj.y - yFloat()) < 0.3)) { settleSink(); return false; }
      drawSink(); readSink();
    });
  }
  function readSink() {
    var Gw = gObj(), Fm = rl(), F = fbAt(obj.y), c = cmpRho();
    L.$('#rho-out').textContent = L.fmt(rho, 2) + ' g/cm³';
    L.$('#sk-badge').textContent = stateName();
    L.$('#sk-G').innerHTML = L.qty(Gw, 'N', 2);
    L.$('#sk-Fmax').innerHTML = L.qty(Fm, 'N', 2);
    L.$('#sk-Fnow').innerHTML = L.qty(F, 'N', 2);
    L.$('#sk-cmp').textContent = 'ρ物 ' + (c < 0 ? '<' : c === 0 ? '=' : '>') + ' ρ液';
    var t;
    if (obj.held) t = '物块被按在液体中央，完全浸没：F浮 = ρ液 g V = ' + L.fmt(Fm, 2) + ' N，重力 G = ' + L.fmt(Gw, 2) + ' N。比一比两个力，猜猜松手后会怎样，再点「松手」。';
    else if (!obj.settled) t = obj.v > 0 ? 'F浮 &gt; G，物块<b>上浮</b>……' : 'F浮 &lt; G，物块<b>下沉</b>……';
    else if (c < 0) t = '最后<b>漂浮</b>在液面：只有 ' + L.fmt(rho / rl() * 100, 0) + '% 浸在液体里，F浮 = G = ' + L.fmt(Gw, 2) + ' N。浸入的比例正好等于 ρ物 ÷ ρ液。';
    else if (c === 0) t = '<b>悬浮</b>：物块完全浸没，停在液体里不上也不下。F浮 = G = ' + L.fmt(Gw, 2) + ' N，因为 ρ物 = ρ液。换个深度按住再松手，它照样停住。';
    else t = '<b>沉底</b>：F浮 = ' + L.fmt(Fm, 2) + ' N &lt; G = ' + L.fmt(Gw, 2) + ' N，容器底还给它 ' + L.fmt(Gw - Fm, 2) + ' N 的支持力 N，三个力平衡：F浮 + N = G。';
    setText(L.$('#sk-text'), t);
    save();
  }
  var rhoIn = L.$('#rho-in');
  rhoIn.value = rho;
  L.bindRange(rhoIn, function (v) { rho = Math.round(v * 20) / 20; resetSink(); });
  L.chips(L.$('#liq2-chips'), LIQ_ITEMS, liq2, function (v) { liq2 = v; resetSink(); });
  L.$('#sink-go').addEventListener('click', sinkGo);
  L.$('#sink-reset').addEventListener('click', resetSink);

  /* ========== ③ 自制密度计 ========== */
  var meter = L.$('#meter'), meterDefs = clipDefs(meter, 'meter-clip', 400, 240);
  var rl3 = Math.round(L.num(st.m, 1, 0.8, 1.2) * 100) / 100;
  var MM = 6, SA = 0.5, LEN = 20, MK = 7, SY3 = 80;   // 6 g、0.5 cm²、吸管长 20 cm、1 cm = 7 px

  function immerse(r) { return MM / r / SA; }   // 漂浮：ρ液 g S L = m g → L = m /(ρ液 S)
  function liqName(r) {
    if (Math.abs(r - 0.8) < 0.005) return '酒精';
    if (Math.abs(r - 1) < 0.005) return '水';
    if (Math.abs(r - 1.03) < 0.005) return '海水';
    return '未知液体';
  }
  function drawMeter() {
    meter.innerHTML = ''; meter.appendChild(meterDefs);
    S('rect', { x: 0, y: 0, width: 400, height: 240, rx: 14, fill: '#fbfaf7' }, meter);
    var g = S('g', { 'clip-path': 'url(#meter-clip)' }, meter);
    S('rect', { x: 0, y: 230, width: 400, height: 10, fill: '#e8e1d3' }, g);
    var t = (rl3 - 0.8) / 0.4, fill = 'rgb(' + Math.round(L.lerp(238, 196, t)) + ',' + Math.round(L.lerp(242, 222, t)) + ',' + Math.round(L.lerp(247, 228, t)) + ')';
    var Lc = immerse(rl3), sb = SY3 + Lc * MK, stp = sb - LEN * MK;
    // 吸管（在液体后面画）
    S('rect', { x: 195, y: stp, width: 10, height: LEN * MK, rx: 2, fill: '#fdf7ee', stroke: '#c9a873', 'stroke-width': 1.2 }, g);
    S('rect', { x: 195, y: sb - 12, width: 10, height: 12, rx: 2, fill: '#7a6f66' }, g);
    [0.8, 0.9, 1.0, 1.1, 1.2].forEach(function (r, i) {
      var my = sb - immerse(r) * MK, left = i % 2 === 0;
      S('line', { x1: 195, y1: my, x2: 205, y2: my, stroke: '#a4492b', 'stroke-width': 1 }, g);
      S('text', { x: left ? 191 : 209, y: my + 3, 'font-size': 9, 'text-anchor': left ? 'end' : 'start', fill: '#a4492b', text: r.toFixed(1) }, g);
    });
    // 量筒和液体
    S('rect', { x: 151, y: SY3, width: 98, height: 228 - SY3, fill: fill, opacity: 0.62 }, g);
    S('line', { x1: 151, y1: SY3, x2: 249, y2: SY3, stroke: '#7f9fc0', 'stroke-width': 1.2 }, g);
    S('path', { d: 'M150 40V228H250V40', fill: 'none', stroke: '#8a9bb0', 'stroke-width': 2.4 }, g);
    // 浸入深度
    L.arrow(g, 138, SY3 + 1, 138, sb - 1, { color: '#5a4097', width: 1.2, head: 5 });
    L.arrow(g, 138, sb - 1, 138, SY3 + 1, { color: '#5a4097', width: 1.2, head: 5 });
    S('text', { x: 132, y: (SY3 + sb) / 2 + 4, 'font-size': 10, 'text-anchor': 'end', fill: '#5a4097', 'font-weight': 600, text: '浸入 ' + L.fmt(Lc, 1) + ' cm' }, g);
    // 读数
    S('line', { x1: 205, y1: SY3, x2: 262, y2: SY3, stroke: '#c2603f', 'stroke-width': 1, 'stroke-dasharray': '3 2' }, g);
    S('text', { x: 266, y: SY3 + 4, 'font-size': 11, fill: '#c2603f', 'font-weight': 600, text: '读数 ' + rl3.toFixed(2) + ' g/cm³' }, g);
    S('text', { x: 266, y: 150, 'font-size': 9, fill: '#8a8598', text: '刻度：上小下大' }, g);
    S('text', { x: 266, y: 163, 'font-size': 9, fill: '#8a8598', text: '　　　上疏下密' }, g);
  }
  function readMeter() {
    var Lc = immerse(rl3);
    L.$('#rl-out').textContent = rl3.toFixed(2) + ' g/cm³';
    L.$('#mt-badge').textContent = liqName(rl3);
    L.$('#mt-L').innerHTML = L.qty(Lc, 'cm', 1);
    L.$('#mt-v').innerHTML = L.qty(Lc * SA, 'cm³', 1);
    L.$('#mt-F').innerHTML = L.qty(MM * 0.01, 'N', 2);
    L.$('#mt-read').innerHTML = rl3.toFixed(2) + '<small>g/cm³</small>';
    var t = '密度计总是<b>漂浮</b>，F浮 = G = 0.06 N，换什么液体都不变。这杯液体密度 ' + rl3.toFixed(2) + ' g/cm³，要排开 ' + L.fmt(Lc * SA, 1) + ' cm³ 才够，浸入 ' + L.fmt(Lc, 1) + ' cm。';
    t += rl3 < 1 ? '这种液体密度比水小，浸得比在水里深。' : (rl3 > 1 ? '这种液体密度比水大，浸得比在水里浅。' : '');
    t += '密度越大浸得越浅，所以刻度<b>上小下大</b>；V排 与 ρ液 成反比，刻度还<b>上疏下密</b>。';
    setText(L.$('#mt-text'), t);
    save();
  }
  var rlIn = L.$('#rl-in');
  rlIn.value = rl3;
  L.bindRange(rlIn, function (v) { rl3 = Math.round(v * 100) / 100; drawMeter(); readMeter(); });

  var ready = false;
  function save() {
    if (!ready) return;
    L.setState({ d: dep, q: liq1, r: rho, q2: liq2, m: rl3 });
  }

  weighChanged();
  resetSink();
  drawMeter();
  ready = true;
  readMeter();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '把铝块完全浸没在水中，读出浮力',
      desc: '在“称重法”里选水，把铝块往下放，直到它整个浸在水里。',
      label: '在称重法模型里操作',
      button: '检查是否浸没',
      check: function () {
        if (liq1 !== 'water') return { ok: false, msg: '先把液体换成水。' };
        if (dep < HB) return { ok: false, msg: '铝块高 5 cm，现在只浸入 ' + L.fmt(dep, 1) + ' cm，还没完全浸没。' };
        return { ok: true, msg: '示数从 2.7 N 变成 1.7 N，F浮 = 2.7 N − 1.7 N = 1 N。按阿基米德原理算：ρ水 g V排 = 1.0×10³ kg/m³ × 10 N/kg × 10⁻⁴ m³ = 1 N，两种方法结果一样。' };
      }
    },
    {
      level: 'base',
      title: '一个物体在空气中称重 5 N，浸在水中时测力计示数是 3 N，它受到的浮力是',
      desc: '用称重法。',
      options: ['2 N', '3 N', '5 N', '8 N'],
      answer: 0,
      hint: '浮力把物体往上托，所以示数变小了。变小了多少，浮力就是多少。',
      explain: 'F浮 = G − F示 = 5 N − 3 N = <b>2 N</b>。3 N 是示数，5 N 是重力，8 N 是把两者错误地相加了。'
    },
    {
      level: 'base',
      title: '浮力的方向总是',
      desc: '不管容器是正放还是斜放。',
      options: ['竖直向上', '垂直于容器底向上', '竖直向下', '与物体运动方向相反'],
      answer: 0,
      hint: '浮力来自液体上下表面的压力差，“竖直”和“垂直”是一回事吗？',
      explain: '浮力的方向总是<b>竖直向上</b>，与重力方向相反。容器斜放时，“垂直于容器底”就不是竖直方向了；浮力也与物体怎么运动无关。'
    },
    {
      level: 'mid',
      title: '让物块悬浮在水中',
      desc: '在“浮沉条件”里选水，调物块的密度，点「松手」验证它停在水中不动。',
      label: '在浮沉条件模型里操作',
      button: '检查是否悬浮',
      check: function () {
        if (liq2 !== 'water') return { ok: false, msg: '先把液体换成水。' };
        var c = cmpRho();
        if (c < 0) return { ok: false, msg: '物块密度 ' + L.fmt(rho, 2) + ' g/cm³ 比水小，会上浮直到漂浮。把密度调大一点。' };
        if (c > 0) return { ok: false, msg: '物块密度 ' + L.fmt(rho, 2) + ' g/cm³ 比水大，会沉底。把密度调小一点。' };
        return { ok: true, msg: 'ρ物 = ρ水 = 1.0 g/cm³，浸没时 F浮 = G = 1 N，物块可以停在水中任意深度，这就是悬浮。' };
      }
    },
    {
      level: 'mid',
      title: '体积 200 cm³ 的实心铁块浸没在水中，受到的浮力是（g 取 10 N/kg）',
      desc: '铁的密度 7.9 g/cm³，这个条件有用吗？',
      options: ['2 N', '0.2 N', '20 N', '15.8 N'],
      answer: 0,
      hint: '浮力看的是液体密度和排开液体的体积，不是铁的密度。',
      explain: '浸没时 V排 = V物 = 200 cm³ = 2×10⁻⁴ m³，F浮 = ρ水 g V排 = 1.0×10³ kg/m³ × 10 N/kg × 2×10⁻⁴ m³ = <b>2 N</b>。15.8 N 是铁块的重力，铁的密度在这里是“干扰条件”。'
    },
    {
      level: 'mid',
      title: '让密度计浸入液体的深度正好是 10 cm',
      desc: '在“自制密度计”里调液体密度。提示：浸入深度 = 12 ÷ ρ液（cm）。',
      label: '在自制密度计里操作',
      button: '检查浸入深度',
      check: function () {
        var Lc = immerse(rl3);
        if (Math.abs(Lc - 10) < 0.02) return { ok: true, msg: 'ρ液 = 1.2 g/cm³ 时浸入 10 cm，比在水中（12 cm）浅。液体密度越大，需要排开的体积越小，浸得越浅。' };
        return { ok: false, msg: '现在浸入 ' + L.fmt(Lc, 1) + ' cm。想让它浮得更' + (Lc > 10 ? '高（浸得更浅），液体密度要更大' : '低（浸得更深），液体密度要更小') + '。' };
      }
    },
    {
      level: 'trap',
      title: '铝块浸没在水中后，继续往下放（不碰杯底），它受到的浮力',
      desc: '可以在称重法里把铝块从 5 cm 放到 8 cm 看看。',
      options: ['不变', '变大', '变小', '先变大后变小'],
      answer: 0,
      hint: '浸没以后，排开水的体积还会变吗？',
      explain: '浸没后 V排 = V物 不再变化，ρ水 也不变，所以浮力<b>不变</b>。从压力差看：上下表面的深度增加得一样多，压力差不变。“越深浮力越大”只适用于还没浸没、V排 还在增大的过程。'
    },
    {
      level: 'trap',
      title: '同一个鸡蛋：在清水中沉底，加盐后悬浮，再加盐后漂浮。三种情况下鸡蛋受到的浮力',
      desc: '鸡蛋的重力一直没变。',
      options: ['沉底时最小，悬浮和漂浮时一样大', '三次一样大', '漂浮时最大', '悬浮时最大'],
      answer: 0,
      hint: '分别用浮沉条件：沉底时 F浮 和 G 什么关系？悬浮、漂浮时呢？',
      explain: '沉底时 F浮 &lt; G；悬浮和漂浮时都是 F浮 = G。所以<b>沉底时最小，悬浮和漂浮一样大</b>。漂浮时盐水更浓，但鸡蛋露出了一部分，V排 变小，浮力并没有变大。'
    }
  ]);
})();
