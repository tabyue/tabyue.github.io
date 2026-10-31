/* 物理互动馆 · 第 9 课 压强 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();
  var G = 10;   // g 取 10 N/kg

  function clipDefs(el, id, w, h) {
    var defs = S('defs', {}, el), cp = S('clipPath', { id: id }, defs);
    S('rect', { x: 0, y: 0, width: w, height: h, rx: 14 }, cp);
    return defs;
  }
  function setText(el, h) { if (el._t !== h) { el._t = h; el.innerHTML = h; } }

  /* ========== ① 砖块压海绵 ========== */
  var BRICK_G = 20;   // 每块重 20 N
  var ORI = {
    flat: { name: '平放', x: 20, y: 5, z: 10, S: 200, dims: '20 cm × 10 cm' },
    side: { name: '侧放', x: 20, y: 10, z: 5, S: 100, dims: '20 cm × 5 cm' },
    up: { name: '竖放', x: 10, y: 20, z: 5, S: 50, dims: '10 cm × 5 cm' }
  };
  var ori = ORI[st.o] ? st.o : 'flat';
  var nb = Math.round(L.num(st.n, 1, 1, 3));
  var brick = L.$('#brick'), brickDefs = clipDefs(brick, 'brick-clip', 400, 250);
  var K = 3.2, TOPY = 200, SPL = 70, SPR = 330;   // 1 cm = 3.2 px；海绵上表面 y = 200

  function brickP(o, n) { return n * BRICK_G / (ORI[o].S / 1e4); }

  function drawBrick() {
    brick.innerHTML = ''; brick.appendChild(brickDefs);
    S('rect', { x: 0, y: 0, width: 400, height: 250, rx: 14, fill: '#fbfaf7' }, brick);
    var g = S('g', { 'clip-path': 'url(#brick-clip)' }, brick);
    var o = ORI[ori], p = brickP(ori, nb);
    var w = o.x * K, hg = o.y * K, od = o.z * K * 0.35;
    var dep = 2 + 30 * p / 12000;              // 凹陷深度（示意）
    var bx = 200 - w / 2 - od / 2;
    // 桌面
    S('rect', { x: 0, y: 238, width: 400, height: 12, fill: '#e8e1d3' }, g);
    // 海绵：顶面 + 带凹坑的正面
    S('path', { d: 'M' + SPL + ' ' + TOPY + 'L' + (SPL + 11) + ' ' + (TOPY - 11) + 'H' + (SPR + 11) + 'L' + SPR + ' ' + TOPY + 'z', fill: '#f6e59a', stroke: '#c9a93f', 'stroke-width': 1 }, g);
    S('path', { d: 'M' + (SPR + 11) + ' ' + (TOPY - 11) + 'V227L' + SPR + ' 238V' + TOPY + 'z', fill: '#e2c65e', stroke: '#c9a93f', 'stroke-width': 1 }, g);
    var front = 'M' + SPL + ' ' + TOPY + 'H' + (bx - 9) + 'Q' + (bx - 1) + ' ' + TOPY + ' ' + bx + ' ' + (TOPY + dep) + 'H' + (bx + w) + 'Q' + (bx + w + 1) + ' ' + TOPY + ' ' + (bx + w + 9) + ' ' + TOPY + 'H' + SPR + 'V238H' + SPL + 'z';
    S('path', { d: front, fill: '#f3dc74', stroke: '#c9a93f', 'stroke-width': 1.2 }, g);
    for (var i = 0; i < 26; i++) {
      var hx = SPL + 8 + (i * 37) % (SPR - SPL - 16), hy = TOPY + dep + 6 + (i * 13) % Math.max(4, 30 - dep);
      if (hy < 236) S('circle', { cx: hx, cy: hy, r: 1.6 + (i % 3) * 0.5, fill: '#dcbf55' }, g);
    }
    S('text', { x: SPL + 6, y: 232, 'font-size': 9, fill: '#8d7428', text: '海绵' }, g);
    // 砖：从下往上画，每块三个面
    for (var k = 0; k < nb; k++) {
      var yb = TOPY + dep - k * hg, yt = yb - hg;
      S('path', { d: 'M' + bx + ' ' + yt + 'l' + od + ' ' + (-od) + 'h' + w + 'l' + (-od) + ' ' + od + 'z', fill: '#dc8e6c', stroke: '#8c4a33', 'stroke-width': 1 }, g);
      S('path', { d: 'M' + (bx + w) + ' ' + yt + 'l' + od + ' ' + (-od) + 'v' + hg + 'l' + (-od) + ' ' + od + 'z', fill: '#a9573b', stroke: '#8c4a33', 'stroke-width': 1 }, g);
      S('rect', { x: bx, y: yt, width: w, height: hg, fill: '#c96f4e', stroke: '#8c4a33', 'stroke-width': 1 }, g);
      S('text', { x: bx + w / 2, y: yt + hg / 2 + 3.5, 'font-size': 9, 'text-anchor': 'middle', fill: '#fff', text: '20 N' }, g);
    }
    S('text', { x: bx - 12, y: TOPY - 32, 'font-size': 10, 'text-anchor': 'end', fill: '#5a4097', 'font-weight': 600, text: '压力 F = ' + nb * BRICK_G + ' N' }, g);
    S('text', { x: bx - 12, y: TOPY - 19, 'font-size': 9, 'text-anchor': 'end', fill: '#8a8598', text: '凹陷越深，压强越大' }, g);
    S('text', { x: 200, y: 248, 'font-size': 10, 'text-anchor': 'middle', fill: '#5a4097', text: '受力面积 S = ' + o.dims + ' = ' + o.S + ' cm²' }, g);
  }

  function readBrick() {
    var o = ORI[ori], F = nb * BRICK_G, p = brickP(ori, nb);
    L.$('#n-out').textContent = nb + ' 块';
    L.$('#br-badge').textContent = o.name + ' · ' + nb + ' 块';
    L.$('#br-F').innerHTML = L.qty(F, 'N', 0);
    L.$('#br-S').innerHTML = L.fmt(o.S / 1e4, 4) + '<small>m²</small>';
    L.$('#br-p').innerHTML = L.fmt(p, 0) + '<small>Pa（' + F + ' N ÷ ' + L.fmt(o.S / 1e4, 4) + ' m²）</small>';
    L.$$('#br-table tbody tr').forEach(function (tr) {
      tr.classList.toggle('on', tr.dataset.o === ori);
      tr.lastElementChild.textContent = L.fmt(brickP(tr.dataset.o, nb), 0) + ' Pa';
    });
    var t = o.name + ' ' + nb + ' 块：每平方米面积上受到的压力是 ' + L.fmt(p, 0) + ' N，也就是 ' + L.fmt(p, 0) + ' Pa。';
    if (ori === 'up') t += '竖放时受力面积最小，压力一样，压强最大，海绵陷得最深。';
    else if (ori === 'flat') t += '平放时受力面积最大，压强最小。';
    else t += '侧放的受力面积是平放的一半，压强就是平放的 2 倍。';
    if (nb > 1) t += ' 叠了 ' + nb + ' 块，压力变成 ' + nb + ' 倍，压强也变成 ' + nb + ' 倍。';
    setText(L.$('#br-text'), t);
    save();
  }
  function brickChanged() { drawBrick(); readBrick(); }
  L.chips(L.$('#ori-chips'), [{ label: '平放', value: 'flat' }, { label: '侧放', value: 'side' }, { label: '竖放', value: 'up' }], ori, function (v) { ori = v; brickChanged(); });
  var nIn = L.$('#n-in');
  nIn.value = nb;
  L.bindRange(nIn, function (v) { nb = v; brickChanged(); });

  /* ========== ② 液体压强计 ========== */
  var LIQ = {
    alcohol: { name: '酒精', rho: 0.8, fill: '#eef1f6' },
    water: { name: '水', rho: 1.0, fill: '#d6e8f5' },
    salt: { name: '盐水', rho: 1.1, fill: '#cfe2e6' }
  };
  var DIR = { up: '上', down: '下', side: '侧面' };
  var SHAPE = {
    straight: { name: '直筒', tl: 40, tr: 180, bl: 40, br: 180 },
    wide: { name: '上宽下窄', tl: 28, tr: 192, bl: 72, br: 148 },
    narrow: { name: '上窄下宽', tl: 76, tr: 144, bl: 30, br: 190 }
  };
  var liq = LIQ[st.q] ? st.q : 'water';
  var dir = DIR[st.dir] ? st.dir : 'down';
  var shape = SHAPE[st.sh] ? st.sh : 'straight';
  var depth = Math.round(L.num(st.d, 10, 0, 15) * 2) / 2;
  var lastCtl = '';
  var probe = L.$('#probe'), probeDefs = clipDefs(probe, 'probe-clip', 400, 240);
  var SY = 56, CB = 200, CT = 26, PK = 8, PXp = 104;   // 液面、容器底、容器口；1 cm = 8 px
  var UL = 268, UR = 328, UB = 200, RY = 120;          // U 形管左右管、弯头上沿、静止液面

  function rhoKg() { return LIQ[liq].rho * 1000; }
  function pLiquid() { return rhoKg() * G * depth / 100; }
  function dH() { return LIQ[liq].rho * depth; }      // U 形管装水：ρ水 g Δh = ρ液 g h
  function wallX(side, y) {
    var s = SHAPE[shape], t = (y - CT) / (CB - CT);
    return side < 0 ? L.lerp(s.tl, s.bl, t) : L.lerp(s.tr, s.br, t);
  }

  function drawProbe() {
    probe.innerHTML = ''; probe.appendChild(probeDefs);
    S('rect', { x: 0, y: 0, width: 400, height: 240, rx: 14, fill: '#fbfaf7' }, probe);
    var g = S('g', { 'clip-path': 'url(#probe-clip)' }, probe);
    S('rect', { x: 0, y: 206, width: 400, height: 34, fill: '#efebe3' }, g);
    // 液体和容器
    S('path', { d: 'M' + wallX(-1, SY) + ' ' + SY + 'L' + wallX(1, SY) + ' ' + SY + 'L' + wallX(1, CB) + ' ' + CB + 'L' + wallX(-1, CB) + ' ' + CB + 'z', fill: LIQ[liq].fill }, g);
    S('line', { x1: wallX(-1, SY), y1: SY, x2: wallX(1, SY), y2: SY, stroke: '#7f9fc0', 'stroke-width': 1.2 }, g);
    S('path', { d: 'M' + wallX(-1, CT) + ' ' + CT + 'L' + wallX(-1, CB) + ' ' + CB + 'L' + wallX(1, CB) + ' ' + CB + 'L' + wallX(1, CT) + ' ' + CT, fill: 'none', stroke: '#8a9bb0', 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, g);
    S('text', { x: wallX(1, SY) - 4, y: SY + 12, 'font-size': 9, 'text-anchor': 'end', fill: '#5a6e86', text: LIQ[liq].name }, g);
    // 探头
    var cy = SY + depth * PK;
    S('path', { d: 'M' + (PXp + 20) + ' 14V' + cy + 'H' + (PXp + 10), fill: 'none', stroke: '#8a8598', 'stroke-width': 3, 'stroke-linejoin': 'round' }, g);
    S('rect', { x: PXp - 10, y: cy - 7, width: 20, height: 14, rx: 2, fill: '#c9ced6', stroke: '#6f7785', 'stroke-width': 1.2 }, g);
    var film = { up: 'M' + (PXp - 10) + ' ' + (cy - 7) + 'Q' + PXp + ' ' + (cy - 4) + ' ' + (PXp + 10) + ' ' + (cy - 7),
      down: 'M' + (PXp - 10) + ' ' + (cy + 7) + 'Q' + PXp + ' ' + (cy + 4) + ' ' + (PXp + 10) + ' ' + (cy + 7),
      side: 'M' + (PXp - 10) + ' ' + (cy - 7) + 'Q' + (PXp - 7) + ' ' + cy + ' ' + (PXp - 10) + ' ' + (cy + 7) }[dir];
    S('path', { d: film, fill: 'none', stroke: '#c2603f', 'stroke-width': 2.6, 'stroke-linecap': 'round' }, g);
    // 深度标注
    if (depth > 0.4) {
      L.arrow(g, PXp - 22, SY + 1, PXp - 22, cy - 1, { color: '#5a4097', width: 1.2, head: 5 });
      L.arrow(g, PXp - 22, cy - 1, PXp - 22, SY + 1, { color: '#5a4097', width: 1.2, head: 5 });
    }
    S('text', { x: PXp + 26, y: (SY + cy) / 2 + 4, 'font-size': 10, fill: '#5a4097', 'font-weight': 600, text: 'h = ' + L.fmt(depth, 1) + ' cm' }, g);
    // 软管
    S('path', { d: 'M' + (PXp + 20) + ' 14Q' + (PXp + 20) + ' 6 ' + (PXp + 30) + ' 6H' + (UL - 10) + 'Q' + UL + ' 6 ' + UL + ' 16V30', fill: 'none', stroke: '#8a8598', 'stroke-width': 3 }, g);
    // U 形管
    var half = dH() * PK / 2, yl = RY + half, yr = RY - half;
    var u = 'M' + UL + ' 30V' + UB + 'A30 30 0 0 0 ' + UR + ' ' + UB + 'V22';
    S('path', { d: u, fill: 'none', stroke: '#9fb0c2', 'stroke-width': 14 }, g);
    S('path', { d: u, fill: 'none', stroke: '#f4f7fa', 'stroke-width': 11 }, g);
    S('path', { d: 'M' + UL + ' ' + yl + 'V' + UB + 'A30 30 0 0 0 ' + UR + ' ' + UB + 'V' + yr, fill: 'none', stroke: '#e58b8b', 'stroke-width': 10 }, g);
    // 刻度和高度差
    for (var c = 0; c <= 20; c++) {
      var ty = 40 + c * PK;
      S('line', { x1: 342, y1: ty, x2: c % 5 === 0 ? 350 : 346, y2: ty, stroke: '#a39cb3', 'stroke-width': 1 }, g);
    }
    S('line', { x1: UL - 8, y1: yl, x2: 352, y2: yl, stroke: '#a4492b', 'stroke-width': 1, 'stroke-dasharray': '3 3' }, g);
    S('line', { x1: UR - 8, y1: yr, x2: 352, y2: yr, stroke: '#a4492b', 'stroke-width': 1, 'stroke-dasharray': '3 3' }, g);
    if (half > 3) {
      L.arrow(g, 356, RY, 356, yr + 1, { color: '#a4492b', width: 1.2, head: 5 });
      L.arrow(g, 356, RY, 356, yl - 1, { color: '#a4492b', width: 1.2, head: 5 });
    }
    S('text', { x: 362, y: RY + 4, 'font-size': 10, fill: '#a4492b', 'font-weight': 600, text: 'Δh' }, g);
    S('text', { x: 362, y: RY + 16, 'font-size': 9, fill: '#a4492b', text: L.fmt(dH(), 2) + ' cm' }, g);
    S('text', { x: 338, y: 30, 'font-size': 9, fill: '#8a8598', text: 'U 形管 · 水' }, g);
  }

  function readProbe() {
    var p = pLiquid();
    L.$('#d-out').textContent = L.fmt(depth, 1) + ' cm';
    L.$('#pr-badge').textContent = LIQ[liq].name + ' · ' + SHAPE[shape].name;
    L.$('#pr-h').innerHTML = L.qty(depth, 'cm', 1);
    L.$('#pr-rho').innerHTML = L.fmt(rhoKg(), 0) + '<small>kg/m³</small>';
    L.$('#pr-p').innerHTML = L.qty(p, 'Pa', 0);
    L.$('#pr-dh').innerHTML = L.qty(dH(), 'cm', 2);
    var t;
    if (depth === 0) t = '探头在液面上，上面没有液体压着，液体压强为 0。往下放一放。';
    else {
      t = '探头在' + LIQ[liq].name + '里 ' + L.fmt(depth, 1) + ' cm 深处：p = ρgh = ' + L.fmt(rhoKg(), 0) + ' kg/m³ × 10 N/kg × ' + L.fmt(depth / 100, 3) + ' m = <b>' + L.fmt(p, 0) + ' Pa</b>。';
      if (lastCtl === 'dir') t += '橡皮膜改成朝' + DIR[dir] + '，高度差没变：<b>同一深度，液体向各个方向的压强相等</b>。';
      else if (lastCtl === 'shape') t += '换成' + SHAPE[shape].name + '的容器，高度差没变：液体压强与容器形状、液体多少<b>无关</b>。';
      else if (lastCtl === 'liq') t += '深度不变换液体：密度越大，压强越大。';
      else t += '同种液体里，探头越深，高度差越大，压强越大。';
    }
    setText(L.$('#pr-text'), t);
    save();
  }
  function probeChanged(who) { lastCtl = who; drawProbe(); readProbe(); }
  var dIn = L.$('#d-in');
  dIn.value = depth;
  L.bindRange(dIn, function (v) { depth = v; probeChanged('depth'); });
  L.chips(L.$('#liq-chips'), [{ label: '酒精 0.8 g/cm³', value: 'alcohol' }, { label: '水 1.0 g/cm³', value: 'water' }, { label: '盐水 约 1.1 g/cm³', value: 'salt' }], liq, function (v) { liq = v; probeChanged('liq'); });
  L.chips(L.$('#dir-chips'), [{ label: '朝上', value: 'up' }, { label: '朝下', value: 'down' }, { label: '朝侧面', value: 'side' }], dir, function (v) { dir = v; probeChanged('dir'); });
  L.chips(L.$('#shape-chips'), [{ label: '直筒', value: 'straight' }, { label: '上宽下窄', value: 'wide' }, { label: '上窄下宽', value: 'narrow' }], shape, function (v) { shape = v; probeChanged('shape'); });

  /* ========== ③ 流速与压强 ========== */
  var flowSvg = L.$('#flow'), flowDefs = clipDefs(flowSvg, 'flow-clip', 400, 220);
  var scene = st.sc === 'wing' ? 'wing' : 'paper';
  var speed = Math.round(L.num(st.v, 10, 1, 20));
  var blowing = false, flowAnim = null, flowVisible = true, parts = [];
  var goBtn = L.$('#flow-go');
  function ve() { return blowing ? speed : 0; }

  /* 机翼外形：上表面拱起、下表面较平 */
  function wingG(x) { var u = (x - 110) / 180; return u <= 0 || u >= 1 ? 0 : Math.sqrt(u) * (1 - u) / 0.3849; }
  /* 流线绕过机翼的弯曲程度：平滑的钟形，避免在前缘出现折角 */
  function bump(x) { return Math.exp(-Math.pow((x - 175) / 80, 2)); }
  var LANES = [
    { y: 84, f: 0.75, up: true }, { y: 60, f: 0.45, up: true }, { y: 36, f: 0.2, up: true },
    { y: 146, f: 0.6, up: false }, { y: 170, f: 0.35, up: false }, { y: 194, f: 0.15, up: false }
  ];
  function laneY(ln, x) { return ln.up ? ln.y - 30 * bump(x) * ln.f : ln.y + 6 * bump(x) * ln.f; }
  function laneV(ln, x) { return ve() * 6 * (ln.up ? 1 + 0.6 * ln.f * bump(x) : 1 - 0.25 * ln.f * bump(x)); }

  function initParts() {
    parts = [];
    var i;
    if (scene === 'paper') for (i = 0; i < 18; i++) parts.push({ u: 0.2 + ((i * 7) % 18) / 18 * 0.6, y: 30 + i * 9.4 });
    else LANES.forEach(function (ln, k) { for (i = 0; i < 7; i++) parts.push({ lane: k, x: i * 62 + k * 17 }); });
  }
  function bend() { return 30 * Math.pow(ve() / 20, 1.5); }
  function paperX(side, y) { var s = L.clamp((y - 28) / 168, 0, 1); return side < 0 ? 165 + bend() * s * s : 235 - bend() * s * s; }

  function drawFlow() {
    flowSvg.innerHTML = ''; flowSvg.appendChild(flowDefs);
    S('rect', { x: 0, y: 0, width: 400, height: 220, rx: 14, fill: '#fbfaf7' }, flowSvg);
    var g = S('g', { 'clip-path': 'url(#flow-clip)' }, flowSvg);
    var v = ve();
    if (scene === 'paper') {
      // 吸管和夹纸的横杆
      S('rect', { x: 196, y: 0, width: 8, height: 22, fill: '#f0c9c9', stroke: '#c98d8d' }, g);
      S('rect', { x: 130, y: 22, width: 140, height: 6, rx: 2, fill: '#c9c3d6' }, g);
      // 中间的气流
      if (v > 0) parts.forEach(function (p) {
        var xl = paperX(-1, p.y), xr = paperX(1, p.y), x = xl + p.u * (xr - xl);
        S('line', { x1: x, y1: p.y, x2: x, y2: p.y + 4 + v * 0.6, stroke: '#7fa7cf', 'stroke-width': 1.6, 'stroke-linecap': 'round' }, g);
      });
      // 两张纸
      var b = bend();
      S('path', { d: 'M165 28Q165 130 ' + (165 + b) + ' 196', fill: 'none', stroke: '#b9c3d0', 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
      S('path', { d: 'M235 28Q235 130 ' + (235 - b) + ' 196', fill: 'none', stroke: '#b9c3d0', 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
      // 压强箭头：外侧大气压不变；中间压强随流速变小
      var ay = 110, xl = paperX(-1, ay), xr = paperX(1, ay), xl2 = paperX(-1, ay + 14), xr2 = paperX(1, ay + 14);
      var inner = 20 * (1 - 0.75 * Math.pow(v / 20, 2));
      L.arrow(g, xl - 28, ay, xl - 4, ay, { color: '#6b6478', width: 2, head: 7 });
      L.arrow(g, xr + 28, ay, xr + 4, ay, { color: '#6b6478', width: 2, head: 7 });
      L.arrow(g, xl2 + 4 + inner, ay + 14, xl2 + 4, ay + 14, { color: '#c2603f', width: 2, head: 6 });
      L.arrow(g, xr2 - 4 - inner, ay + 14, xr2 - 4, ay + 14, { color: '#c2603f', width: 2, head: 6 });
      S('text', { x: xl - 32, y: ay + 4, 'font-size': 10, 'text-anchor': 'end', fill: '#6b6478', text: '外侧气压' }, g);
      S('text', { x: xr + 32, y: ay + 4, 'font-size': 10, fill: '#6b6478', text: '外侧气压' }, g);
      S('text', { x: 200, y: 212, 'font-size': 10, 'text-anchor': 'middle', fill: v > 0 ? '#c2603f' : '#8a8598', 'font-weight': 600, text: v > 0 ? '中间流速大、压强小 → 纸向中间靠拢' : '没吹气：里外气压相等，纸自然下垂' }, g);
    } else {
      // 流线
      LANES.forEach(function (ln) {
        var d = '';
        for (var x = 0; x <= 400; x += 10) d += (x ? 'L' : 'M') + x + ' ' + laneY(ln, x).toFixed(1);
        S('path', { d: d, fill: 'none', stroke: '#c9d6e4', 'stroke-width': 1 }, g);
      });
      if (v > 0) parts.forEach(function (p) {
        var ln = LANES[p.lane], y = laneY(ln, p.x), len = 3 + laneV(ln, p.x) * 0.1;
        S('line', { x1: p.x - len, y1: y, x2: p.x, y2: y, stroke: ln.up ? '#4f86c0' : '#93b3d3', 'stroke-width': 1.8, 'stroke-linecap': 'round' }, g);
      });
      // 机翼
      var top = '', bot = '';
      for (var i = 0; i <= 36; i++) { var x = 110 + i * 5; top += (i ? 'L' : 'M') + x + ' ' + (120 - 30 * wingG(x)).toFixed(1); }
      for (i = 36; i >= 0; i--) { x = 110 + i * 5; bot += 'L' + x + ' ' + (120 + 6 * wingG(x)).toFixed(1); }
      S('path', { d: top + bot + 'z', fill: '#dcd6ea', stroke: '#7a6aa8', 'stroke-width': 1.5 }, g);
      var lift = 70 * Math.pow(v / 20, 2);
      if (lift > 2) L.arrow(g, 190, 108, 190, 108 - lift, { color: '#c2603f', width: 2.6, head: 9, label: '升力', lx: 6, ly: 10 });
      S('text', { x: 392, y: 16, 'font-size': 10, 'text-anchor': 'end', fill: '#4f86c0', 'font-weight': 600, text: '上方：流速大、压强小' }, g);
      S('text', { x: 392, y: 214, 'font-size': 10, 'text-anchor': 'end', fill: '#6b8fb3', 'font-weight': 600, text: '下方：流速小、压强大' }, g);
      S('text', { x: 10, y: 214, 'font-size': 9, fill: '#8a8598', text: v > 0 ? '气流 →' : '没吹气' }, g);
    }
  }
  function stepFlow(dt) {
    var v = ve();
    if (scene === 'paper') parts.forEach(function (p) { p.y += v * 8 * dt; if (p.y > 200) p.y -= 170; });
    else parts.forEach(function (p) { p.x += laneV(LANES[p.lane], p.x) * dt; if (p.x > 410) p.x -= 430; });
  }
  function ensureFlow() {
    if (L.REDUCED || flowAnim || !blowing || !flowVisible) return;
    flowAnim = L.loop(function (dt) {
      if (!blowing || !flowVisible) { flowAnim = null; return false; }
      stepFlow(dt); drawFlow();
    });
  }
  function readFlow() {
    var v = ve();
    L.$('#v-out').textContent = speed + ' m/s';
    goBtn.textContent = blowing ? '停下' : '开始吹气';
    L.$('#fl-badge').textContent = v > 0 ? '吹气中' : '没吹气';
    L.$('#fl-v').innerHTML = L.qty(v, 'm/s', 0);
    L.$('#fl-low').textContent = v > 0 ? (scene === 'paper' ? '两张纸中间' : '机翼上方') : '—';
    L.$('#fl-res').textContent = v === 0 ? (scene === 'paper' ? '纸自然下垂' : '没有升力') : (scene === 'paper' ? '两张纸向中间靠拢' : '机翼受到向上的升力');
    var t;
    if (v === 0) t = scene === 'paper' ? '两张纸里外都是大气压，相互抵消，纸竖直下垂。点「开始吹气」往中间吹。' : '机翼静止在空气里，上下气压相等。点「开始吹气」让气流吹过机翼。';
    else if (scene === 'paper') t = '中间的空气流得快，压强变小；外侧空气不动，还是原来的大气压。<b>外侧压强大于中间压强</b>，把两张纸往中间推。吹得越快，靠得越拢。';
    else t = '机翼上表面拱起、下表面较平，气流经过时<b>上方流速大、压强小，下方流速小、压强大</b>，上下压强差产生向上的升力。速度越大，升力越大，飞机就是这样飞起来的。';
    setText(L.$('#fl-text'), t);
    save();
  }
  function flowChanged() { drawFlow(); readFlow(); ensureFlow(); }
  L.chips(L.$('#scene-chips'), [{ label: '向两张纸中间吹气', value: 'paper' }, { label: '机翼升力', value: 'wing' }], scene, function (v) { scene = v; initParts(); flowChanged(); });
  var vIn = L.$('#v-in');
  vIn.value = speed;
  L.bindRange(vIn, function (v) { speed = v; flowChanged(); });
  goBtn.addEventListener('click', function () { blowing = !blowing; flowChanged(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { flowVisible = es[0].isIntersecting; ensureFlow(); }).observe(flowSvg);
  }

  var ready = false;
  function save() {
    if (!ready) return;
    L.setState({ o: ori, n: nb, d: depth, q: liq, dir: dir, sh: shape, sc: scene, v: speed });
  }

  initParts();
  brickChanged();
  probeChanged('');
  ready = true;
  flowChanged();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '让砖块对海绵的压强最大',
      desc: '在“砖块压海绵”里选放法、调块数，让海绵受到的压强达到最大。',
      label: '在砖块压海绵里操作',
      button: '检查压强',
      check: function () {
        var p = brickP(ori, nb);
        if (ori === 'up' && nb === 3) return { ok: true, msg: '压力最大（60 N）、受力面积最小（0.005 m²），p = 60 N ÷ 0.005 m² = 12000 Pa = 1.2×10⁴ Pa。' };
        if (ori !== 'up') return { ok: false, msg: '现在 ' + L.fmt(p, 0) + ' Pa。压力一定时，受力面积越<b>小</b>压强越大，哪种放法着地面积最小？' };
        return { ok: false, msg: '放法对了，现在 ' + L.fmt(p, 0) + ' Pa。再想想：怎样让压力更大？' };
      }
    },
    {
      level: 'base',
      title: '下列做法中，属于增大压强的是',
      desc: '看它是在减小受力面积，还是在增大受力面积。',
      options: ['把菜刀磨得很锋利', '书包带做得比较宽', '在铁轨下面铺枕木', '载重汽车装有很多轮子'],
      answer: 0,
      hint: '压力差不多时，受力面积变小，压强就变大。',
      explain: '刀刃磨薄，受力面积变小，压强<b>增大</b>，切东西更容易。书包带宽、铺枕木、多装轮子都是增大受力面积来<b>减小</b>压强。'
    },
    {
      level: 'base',
      title: '水深 10 m 处，水产生的压强是多少？（g 取 10 N/kg）',
      desc: '水的密度 1.0×10³ kg/m³。',
      options: ['1×10' + L.sup(5) + ' Pa', '1×10' + L.sup(4) + ' Pa', '1×10' + L.sup(3) + ' Pa', '1×10' + L.sup(6) + ' Pa'],
      answer: 0,
      hint: '直接代 p = ρgh，单位都用国际单位。',
      explain: 'p = ρgh = 1.0×10³ kg/m³ × 10 N/kg × 10 m = <b>1×10⁵ Pa</b>，差不多就是一个标准大气压。潜水每下潜 10 m，水的压强大约增加一个大气压。'
    },
    {
      level: 'mid',
      title: '在盐水里让 U 形管两边液面的高度差为 11 cm',
      desc: '在“液体压强计”里选盐水，调探头深度。想想：盐水的密度是水的几倍？',
      label: '在液体压强计里操作',
      button: '检查高度差',
      check: function () {
        if (liq !== 'salt') return { ok: false, msg: '先把液体换成盐水。' };
        if (Math.abs(dH() - 11) < 0.01) return { ok: true, msg: '探头在 10 cm 深处，盐水压强 p = 1.1×10³ kg/m³ × 10 N/kg × 0.1 m = 1100 Pa。U 形管里是水，要 11 cm 的水柱才能产生同样大的压强。' };
        return { ok: false, msg: '现在高度差是 ' + L.fmt(dH(), 2) + ' cm。高度差 = 1.1 × 探头深度，那么深度应该是多少？' };
      }
    },
    {
      level: 'mid',
      title: '做托里拆利实验时，把玻璃管稍微倾斜，管内外水银面的高度差会',
      desc: '高度差指竖直方向的距离。',
      options: ['不变', '变大', '变小', '变成零'],
      answer: 0,
      hint: '大气压没变，能托住的水银柱“竖直高度”会变吗？',
      explain: '管内水银柱的压强等于大气压，p = ρgh 中的 h 是<b>竖直高度</b>。大气压不变，高度差就<b>不变</b>，仍约 760 mm。倾斜后管内水银柱的<b>长度</b>变长了，但竖直高度不变。'
    },
    {
      level: 'mid',
      title: '在火车站台候车时，人必须站在安全线以外，因为列车驶过时',
      desc: '想一想列车附近的空气是怎样流动的。',
      options: ['列车附近空气流速大、压强小，人会被压向列车', '列车附近空气流速小、压强大，人会被推开', '列车对人有吸引力', '人由于惯性会冲向列车'],
      answer: 0,
      hint: '流速大的地方压强怎样？人外侧和内侧的气压哪个大？',
      explain: '列车高速驶过，带动附近空气快速流动，<b>流速大、压强小</b>；人身后的空气流速小、压强大，这个压强差会把人往列车方向推，非常危险。'
    },
    {
      level: 'trap',
      title: '底面积相同的三个容器（直筒、上宽下窄、上窄下宽）装入同样深的水，水对容器底的压强',
      desc: '可以在压强计里换容器形状试试。',
      options: ['三个一样大', '上宽下窄的最大，因为装的水最多', '上窄下宽的最大', '直筒的最大'],
      answer: 0,
      hint: '液体压强 p = ρgh 里有容器形状吗？有液体总重吗？',
      explain: '液体压强只与<b>密度和深度</b>有关。三个容器里都是水、深度相同，所以对底部的压强<b>一样大</b>。上宽下窄的容器装的水最多，但多出来的水有一部分压在了斜壁上，没有全压在底上。'
    },
    {
      level: 'trap',
      title: '容器中水深 10 cm，A 点离容器底 2 cm。A 点受到水的压强是（g 取 10 N/kg）',
      desc: 'h 应该从哪里量起？',
      options: ['800 Pa', '200 Pa', '1000 Pa', '1200 Pa'],
      answer: 0,
      hint: 'h 是从液面往下量到 A 点的竖直距离，不是离容器底的高度。',
      explain: 'A 点的深度 h = 10 cm − 2 cm = 8 cm = 0.08 m，p = 1.0×10³ kg/m³ × 10 N/kg × 0.08 m = <b>800 Pa</b>。200 Pa 是把“离底高度”当成了深度；1000 Pa 是容器底的压强。'
    }
  ]);
})();
