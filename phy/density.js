/* 物理互动馆 · 第 6 课 质量与密度 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();
  var RAD = Math.PI / 180, MUTED = '#8a8598';

  function txt(parent, x, y, s, o) {
    o = o || {};
    return S('text', { x: x, y: y, 'font-size': o.fs || 10, 'text-anchor': o.anchor || 'middle', fill: o.fill || MUTED, 'font-weight': o.bold ? 600 : null, text: s }, parent);
  }

  /* ========== ① 托盘天平 ========== */
  var bal = L.$('#balance');
  var OBJ = {
    none: { name: '空盘', m: 0 },
    eraser: { name: '橡皮', m: 23.6 },
    egg: { name: '鸡蛋', m: 56.2 },
    metal: { name: '金属块 A', m: 54 }
  };
  var BOX = [[100, 1], [50, 1], [20, 2], [10, 1], [5, 1]];   // 砝码盒：面值、个数
  var WSIZE = { 100: [20, 24], 50: [16, 20], 20: [13, 16], 10: [11, 13], 5: [10, 11] };
  var ob = OBJ[st.ob] ? st.ob : 'egg';
  var cnt = (st.w || '').split('-').map(function (v, k) { return BOX[k] ? L.clamp(parseInt(v, 10) || 0, 0, BOX[k][1]) : 0; });
  while (cnt.length < BOX.length) cnt.push(0);
  cnt.length = BOX.length;
  var rider = Math.round(L.num(st.r, 0, 0, 5) * 5) / 5;
  var PX = 200, PY = 118;

  function wSum() { var s = 0; BOX.forEach(function (b, k) { s += b[0] * cnt[k]; }); return s; }
  function diff() { return wSum() + rider - OBJ[ob].m; }          // 右 − 左
  function balanced() { return Math.abs(diff()) < 0.05; }

  function drawBal() {
    bal.innerHTML = '';
    var d = S('defs', {}, bal), cp = S('clipPath', { id: 'bal-clip' }, d);
    S('rect', { x: 0, y: 0, width: 400, height: 250, rx: 14 }, cp);
    S('rect', { x: 0, y: 0, width: 400, height: 250, rx: 14, fill: '#fbfaf7' }, bal);
    var df = diff(), tilt = 6 * Math.tanh(df / 1.2), sn = Math.sin(tilt * RAD);
    // 底座、立柱
    S('rect', { x: 70, y: 214, width: 260, height: 16, rx: 5, fill: '#d9d3e3' }, bal);
    S('rect', { x: 195, y: 126, width: 10, height: 90, rx: 3, fill: '#e3deeb' }, bal);
    // 分度盘
    var R = 82;
    for (var a = -16; a <= 16; a += 4) {
      var ang = (90 + a) * RAD, c0 = a === 0;
      S('line', { x1: PX + Math.cos(ang) * (R - (c0 ? 8 : 4)), y1: PY + Math.sin(ang) * (R - (c0 ? 8 : 4)), x2: PX + Math.cos(ang) * (R + 4), y2: PY + Math.sin(ang) * (R + 4), stroke: c0 ? '#a4492b' : '#a39cb3', 'stroke-width': c0 ? 2 : 1.2 }, bal);
    }
    txt(bal, PX + 44, 210, '分度盘', { fs: 9 });
    // 指针（偏向较重的一侧）
    var phi = tilt * 2.2 * RAD;
    S('line', { x1: PX, y1: PY, x2: PX + Math.sin(phi) * R, y2: PY + Math.cos(phi) * R, stroke: '#a4492b', 'stroke-width': 2.2, 'stroke-linecap': 'round' }, bal);
    txt(bal, PX - 44, 210, '指针', { fs: 9 });
    // 托盘与物体、砝码（托盘保持水平，只上下移动）
    [[86, -1], [314, 1]].forEach(function (pp) {
      var x = pp[0], dy = (x - PX) * sn, panY = 80 + dy;
      S('line', { x1: x, y1: panY + 7, x2: x, y2: 112 + dy, stroke: '#a39cb3', 'stroke-width': 3 }, bal);
      S('path', { d: 'M' + (x - 50) + ' ' + panY + 'H' + (x + 50) + 'L' + (x + 40) + ' ' + (panY + 7) + 'H' + (x - 40) + 'z', fill: '#d7dde5', stroke: '#9aa6b5', 'stroke-width': 1.2 }, bal);
      if (pp[1] < 0) drawObj(x, panY); else drawWeights(x, panY);
    });
    // 横梁（带标尺和游码）
    var beam = S('g', { transform: 'rotate(' + tilt.toFixed(3) + ' ' + PX + ' ' + PY + ')' }, bal);
    S('rect', { x: 62, y: 106, width: 276, height: 22, rx: 4, fill: '#ece8f3', stroke: '#a39cb3', 'stroke-width': 1.2 }, beam);
    S('circle', { cx: 68, cy: 117, r: 4, fill: '#bfb6cf' }, beam);
    S('circle', { cx: 332, cy: 117, r: 4, fill: '#bfb6cf' }, beam);
    for (var k = 0; k <= 25; k++) {
      var tx = 120 + k * 6.4, big = k % 5 === 0;
      S('line', { x1: tx, y1: 106, x2: tx, y2: 106 + (big ? 8 : 4.5), stroke: '#7a6aa8', 'stroke-width': big ? 1.2 : 0.8 }, beam);
      if (big) txt(beam, tx, 125, String(k / 5), { fs: 9, fill: '#5a4097' });
    }
    txt(beam, 290, 125, 'g', { fs: 9, anchor: 'start', fill: '#5a4097' });
    var rx = 120 + rider * 32;
    S('rect', { x: rx, y: 103, width: 7, height: 26, rx: 1.5, fill: '#5a4097', opacity: 0.85 }, beam);
    S('line', { x1: rx, y1: 100, x2: rx, y2: 132, stroke: '#a4492b', 'stroke-width': 1, 'stroke-dasharray': '2 2' }, beam);
    S('circle', { cx: PX, cy: PY, r: 3.2, fill: '#5a6e86' }, bal);
    txt(bal, 112, 144, '游码读左边缘', { fs: 9, anchor: 'start', fill: '#a4492b' });
    txt(bal, 86, 244, '左盘：物体', { fs: 9 });
    txt(bal, 314, 244, '右盘：砝码', { fs: 9 });
    readBal();
  }

  function drawObj(x, y) {
    if (ob === 'eraser') S('rect', { x: x - 22, y: y - 14, width: 44, height: 14, rx: 3, fill: '#e7a3ad', stroke: '#c07a86' }, bal);
    else if (ob === 'egg') S('ellipse', { cx: x, cy: y - 17, rx: 13, ry: 17, fill: '#f3e6cf', stroke: '#cdb68e' }, bal);
    else if (ob === 'metal') S('rect', { x: x - 15, y: y - 22, width: 30, height: 22, rx: 2, fill: '#b9c0c8', stroke: '#8a939e' }, bal);
    if (ob !== 'none') txt(bal, x, y - (ob === 'egg' ? 40 : ob === 'metal' ? 28 : 20), OBJ[ob].name + '  ? g', { fill: '#5b6475', bold: true });
  }

  function drawWeights(x, y) {
    var list = [];
    BOX.forEach(function (b, k) { for (var j = 0; j < cnt[k]; j++) list.push(b[0]); });
    if (!list.length) { txt(bal, x, y - 8, '（还没有砝码）', { fs: 9 }); return; }
    var total = 0;
    list.forEach(function (m) { total += WSIZE[m][0]; });
    total += (list.length - 1) * 2;
    var cx = x - total / 2;
    list.forEach(function (m) {
      var w = WSIZE[m][0], h = WSIZE[m][1];
      S('rect', { x: cx, y: y - h, width: w, height: h, rx: 2, fill: '#d6bf86', stroke: '#9c8350' }, bal);
      S('rect', { x: cx + w * 0.3, y: y - h - 4, width: w * 0.4, height: 4, rx: 1, fill: '#c2a96c' }, bal);
      txt(bal, cx + w / 2, y - h - 7, String(m), { fs: 9, fill: '#7a6430' });
      cx += w + 2;
    });
  }

  // 砝码按钮
  var wBox = L.$('#weights'), wLabels = [];
  BOX.forEach(function (b, k) {
    var grp = L.html('div', { style: 'display:flex;align-items:center;gap:3px;background:#f2eff7;border-radius:10px;padding:3px 5px' }, wBox);
    var minus = L.html('button', { type: 'button', text: '−', 'aria-label': '取下一个 ' + b[0] + ' g 砝码', style: 'min-width:28px;min-height:30px;border-radius:8px;background:#fff;color:#5a4097;font-size:17px' }, grp);
    wLabels[k] = L.html('span', { style: 'font-size:13.5px;color:#4b425e;min-width:52px;text-align:center;font-variant-numeric:tabular-nums' }, grp);
    var plus = L.html('button', { type: 'button', text: '+', 'aria-label': '加一个 ' + b[0] + ' g 砝码', style: 'min-width:28px;min-height:30px;border-radius:8px;background:#fff;color:#5a4097;font-size:17px' }, grp);
    minus.addEventListener('click', function () { if (cnt[k] > 0) { cnt[k]--; drawBal(); } });
    plus.addEventListener('click', function () { if (cnt[k] < b[1]) { cnt[k]++; drawBal(); } });
  });
  var rIn = L.$('#rider-in');
  rIn.value = rider;
  L.bindRange(rIn, function (v) { rider = Math.round(v * 5) / 5; drawBal(); });
  L.chips(L.$('#obj-chips'), [{ label: '橡皮', value: 'eraser' }, { label: '鸡蛋', value: 'egg' }, { label: '金属块 A', value: 'metal' }, { label: '空盘', value: 'none' }], ob, function (v) { ob = v; drawBal(); });
  L.$('#w-clear').addEventListener('click', function () {
    cnt = cnt.map(function () { return 0; }); rider = 0;
    rIn.value = 0; L.paintRange(rIn); drawBal();
  });

  function readBal() {
    BOX.forEach(function (b, k) { wLabels[k].textContent = b[0] + ' g ×' + cnt[k] + (b[1] > 1 ? '/' + b[1] : ''); });
    var sum = wSum(), df = diff(), ok = balanced(), m = OBJ[ob].m;
    L.$('#rider-out').textContent = L.fmt(rider, 1) + ' g';
    L.$('#bw-sum').innerHTML = L.qty(sum, 'g', 0);
    L.$('#bw-rider').innerHTML = L.qty(rider, 'g', 1);
    L.$('#bal-badge').textContent = ok ? '平衡' : (df < 0 ? '指针偏左' : '指针偏右');
    var t;
    if (ok) {
      if (ob === 'none') {
        L.$('#bw-m').innerHTML = '空盘';
        t = '两盘都空着，天平平衡，指针指在分度盘中央。在左盘放一个物体试试。';
      } else {
        L.$('#bw-m').innerHTML = L.fmt(sum, 0) + ' + ' + L.fmt(rider, 1) + ' = ' + L.qty(sum + rider, 'g', 1);
        t = '平衡了！' + OBJ[ob].name + '的质量 = 砝码 ' + L.fmt(sum, 0) + ' g + 游码 ' + L.fmt(rider, 1) + ' g = <b>' + L.fmt(m, 1) + ' g</b>。' + (ob === 'metal' ? '记住这个数，下面用排水法测它的体积。' : '');
      }
    } else {
      L.$('#bw-m').innerHTML = '? <small>g（还没平衡）</small>';
      if (df < 0) {
        t = '指针偏左，说明<b>左盘重</b>。往右盘加砝码；如果加上最小的 5 g 砝码后指针又偏右，就取下它，改为向右<b>拨游码</b>。';
        if (-df < 5 && rider < 5) t = '指针偏左，左盘还重一点，相差不到 5 g，该向右<b>拨游码</b>了。';
      } else {
        t = '指针偏右，说明<b>右盘砝码太重</b>。取下刚加的砝码，换小一号的；如果是游码拨多了，就往左拨回来。';
      }
    }
    L.$('#bal-text').innerHTML = t;
    save();
  }

  /* ========== ② m–V 图象 ========== */
  var mv = L.$('#mv');
  var MAT = {
    water: { name: '水', rho: 1.0, color: '#2f7fbf' },
    ice: { name: '冰', rho: 0.9, color: '#7fb3d5' },
    al: { name: '铝', rho: 2.7, color: '#7a6aa8' },
    fe: { name: '铁', rho: 7.9, color: '#a4492b' }
  };
  var mat = MAT[st.mat] ? st.mat : 'water';
  var V = Math.round(L.num(st.V, 20, 1, 40));

  function drawMV() {
    var ax = L.axes(mv, { xmin: 0, xmax: 40, ymin: 0, ymax: 200, xstep: 5, ystep: 20, labelStep: 10, ylabelStep: 40, xlabel: ' ', ylabel: 'm / g', left: 40, right: 16, top: 16, bottom: 28 });
    txt(mv, ax.X(40) - 2, ax.Y(0) - 6, 'V / cm³', { anchor: 'end', fill: '#5b6475', fs: 11 });
    var d = S('defs', {}, mv), cp = S('clipPath', { id: 'mv-clip' }, d);
    S('rect', { x: ax.X(0), y: ax.Y(200), width: ax.X(40) - ax.X(0), height: ax.Y(0) - ax.Y(200) }, cp);
    var g = S('g', { 'clip-path': 'url(#mv-clip)' }, ax.layer);
    Object.keys(MAT).forEach(function (k) {
      var M = MAT[k], on = k === mat;
      S('line', { x1: ax.X(0), y1: ax.Y(0), x2: ax.X(40), y2: ax.Y(40 * M.rho), stroke: M.color, 'stroke-width': on ? 3 : 1.6, opacity: on ? 1 : 0.45, 'stroke-linecap': 'round' }, g);
      var ve = Math.min(40, 194 / M.rho), lx = ax.X(ve), ly = ax.Y(M.rho * ve);
      var o = { fill: M.color, bold: on, fs: 10 };
      if (k === 'fe') { o.anchor = 'start'; txt(ax.layer, lx + 5, ly + 10, '铁 7.9', o); }
      else if (k === 'al') { o.anchor = 'end'; txt(ax.layer, lx - 2, ly - 7, '铝 2.7', o); }
      else if (k === 'water') { o.anchor = 'end'; txt(ax.layer, lx - 2, ly - 7, '水 1.0', o); }
      else { o.anchor = 'end'; txt(ax.layer, lx - 2, ly + 14, '冰 0.9', o); }
    });
    var M = MAT[mat], m = M.rho * V;
    if (m <= 200) {
      var px = ax.X(V), py = ax.Y(m);
      S('line', { x1: px, y1: ax.Y(0), x2: px, y2: py, stroke: M.color, 'stroke-dasharray': '3 3', 'stroke-width': 1.2 }, ax.layer);
      S('line', { x1: ax.X(0), y1: py, x2: px, y2: py, stroke: M.color, 'stroke-dasharray': '3 3', 'stroke-width': 1.2 }, ax.layer);
      S('circle', { cx: px, cy: py, r: 5, fill: '#fff', stroke: M.color, 'stroke-width': 2.4 }, ax.layer);
      txt(ax.layer, px + (V > 30 ? -8 : 8), py - 8, '(' + V + ', ' + L.fmt(m, 1) + ')', { anchor: V > 30 ? 'end' : 'start', fill: '#3d3650', bold: true });
    } else {
      txt(ax.layer, ax.X(31), ax.Y(150), M.name + ' ' + L.fmt(m, 1) + ' g，超出图的范围', { fill: M.color, bold: true });
    }
    readMV(m);
  }
  var vIn = L.$('#v-in');
  vIn.value = V;
  L.bindRange(vIn, function (v) { V = v; drawMV(); });
  L.chips(L.$('#mat-chips'), [{ label: '水', value: 'water' }, { label: '冰', value: 'ice' }, { label: '铝', value: 'al' }, { label: '铁', value: 'fe' }], mat, function (v) { mat = v; drawMV(); });

  function readMV(m) {
    var M = MAT[mat];
    L.$('#v-out').textContent = V + ' cm³';
    L.$('#mv-badge').textContent = M.name;
    L.$('#mv-v').innerHTML = L.qty(V, 'cm³', 0);
    L.$('#mv-m').innerHTML = L.qty(m, 'g', 1);
    L.$('#mv-rho').innerHTML = M.rho.toFixed(1) + '<small>g/cm³</small>';
    L.$('#mv-kg').innerHTML = M.rho.toFixed(1) + '×10³<small>kg/m³</small>';
    var extra = {
      water: '1 cm³ 的水质量是 1 g，所以 1 mL 水就是 1 g，这个数很好用。',
      ice: '冰的线比水的线平一点：体积相同时，冰比水轻。水结成冰，质量不变、体积变大，所以冬天露天的水管可能被冻裂。',
      al: '铝的密度比铁小得多，同样大小轻得多，所以飞机、自行车架常用铝合金。',
      fe: '铁是图里最陡的线。同样 10 cm³，铁 79 g，铝只有 27 g，水只有 10 g。'
    }[mat];
    L.$('#mv-text').innerHTML = '体积 ' + V + ' cm³ 时，' + M.name + '的质量是 ' + L.fmt(m, 1) + ' g，m ÷ V = <b>' + M.rho.toFixed(1) + ' g/cm³</b>。拖动体积，m 跟着变，比值却一直不变。' + extra;
    save();
  }

  /* ========== ③ 排水法测密度 ========== */
  var cyl = L.$('#cyl');
  var BLK = {
    A: { m: 54, v: 20, w: 30, h: 24 },
    B: { m: 79, v: 10, w: 24, h: 18 },
    C: { m: 89, v: 10, w: 24, h: 18 }
  };
  var MATS = [['al', '铝', 2.7], ['fe', '铁', 7.9], ['cu', '铜', 8.9], ['pb', '铅', 11.3]];
  var blk = BLK[st.blk] ? st.blk : 'A';
  var eyePos = ['flat', 'high', 'low'].indexOf(st.eye) >= 0 ? st.eye : 'flat';
  var p = st.inn === '1' ? 1 : 0, target = p, anim = null;
  var V1 = 40, Y0 = 226, KY = 1.8, CL = 150, CR = 210, CX = 180, EX = 66;
  function yOf(v) { return Y0 - v * KY; }

  function level() {
    var b = BLK[blk], yl1 = yOf(V1), bottom = L.lerp(30, Y0 - 2, p);
    var frac = L.clamp((bottom - yl1) / b.h, 0, 1);
    return { v: V1 + b.v * frac, bottom: bottom };
  }

  function drawCyl() {
    cyl.innerHTML = '';
    var d = S('defs', {}, cyl), cp = S('clipPath', { id: 'cyl-clip' }, d);
    S('rect', { x: 0, y: 0, width: 400, height: 250, rx: 14 }, cp);
    S('rect', { x: 0, y: 0, width: 400, height: 250, rx: 14, fill: '#fbfaf7' }, cyl);
    var b = BLK[blk], lv = level(), yl = yOf(lv.v);
    // 量筒玻璃
    S('rect', { x: CL, y: 38, width: CR - CL, height: Y0 - 38, fill: '#f3f6f9' }, cyl);
    // 金属块（细线吊着）
    var by = lv.bottom - b.h;
    S('line', { x1: CX, y1: 0, x2: CX, y2: by, stroke: '#8a8598', 'stroke-width': 1 }, cyl);
    S('rect', { x: CX - b.w / 2, y: by, width: b.w, height: b.h, rx: 2, fill: blk === 'C' ? '#d9a77a' : '#b9c0c8', stroke: blk === 'C' ? '#a87a50' : '#8a939e' }, cyl);
    txt(cyl, CX, by + b.h / 2 + 3.5, blk, { fill: '#3d3650', bold: true, fs: 10 });
    // 水与凹液面
    S('path', { d: 'M' + CL + ' ' + (yl - 4) + 'Q' + CX + ' ' + (yl + 4) + ' ' + CR + ' ' + (yl - 4) + 'V' + Y0 + 'H' + CL + 'z', fill: '#9fc8e6', 'fill-opacity': 0.55, stroke: '#5f95bf', 'stroke-width': 1.2 }, cyl);
    // 外壁、刻度
    S('path', { d: 'M' + (CL - 4) + ' 36H' + CL + 'V' + Y0 + 'H' + CR + 'V36H' + (CR + 4), fill: 'none', stroke: '#8fa3b6', 'stroke-width': 2 }, cyl);
    S('rect', { x: CL - 22, y: Y0, width: CR - CL + 44, height: 8, rx: 3, fill: '#cfd8e2' }, cyl);
    for (var v = 0; v <= 100; v += 2) {
      var y = yOf(v), big = v % 10 === 0;
      S('line', { x1: CL, y1: y, x2: CL + (big ? 11 : 5), y2: y, stroke: '#5b6475', 'stroke-width': big ? 1.1 : 0.7 }, cyl);
      if (big && v > 0) txt(cyl, CL - 5, y + 3, String(v), { anchor: 'end', fs: 9, fill: '#5b6475' });
    }
    txt(cyl, CL - 5, 30, 'mL', { anchor: 'end', fs: 9, fill: '#5b6475' });
    // 视线
    var off = { flat: 0, high: -30, low: 30 }[eyePos], ey = yl + off;
    var yw = ey + (yl - ey) * (CL - EX) / (CX - EX);
    var g = S('g', { 'clip-path': 'url(#cyl-clip)' }, cyl);
    S('line', { x1: EX + 8, y1: ey, x2: CX, y2: yl, stroke: eyePos === 'flat' ? '#2f6a4a' : '#a4492b', 'stroke-width': 1.3, 'stroke-dasharray': '4 3' }, g);
    S('line', { x1: CL - 2, y1: yw, x2: CL + 14, y2: yw, stroke: eyePos === 'flat' ? '#2f6a4a' : '#a4492b', 'stroke-width': 2 }, g);
    var eg = S('g', {}, cyl);
    S('path', { d: 'M' + (EX - 10) + ' ' + ey + 'Q' + EX + ' ' + (ey - 8) + ' ' + (EX + 10) + ' ' + ey + 'Q' + EX + ' ' + (ey + 8) + ' ' + (EX - 10) + ' ' + ey + 'z', fill: '#fff', stroke: '#5b6475', 'stroke-width': 1.4 }, eg);
    S('circle', { cx: EX + 3, cy: ey, r: 3, fill: '#3d3650' }, eg);
    txt(cyl, EX, ey + 20, { flat: '平视', high: '俯视', low: '仰视' }[eyePos], { fill: eyePos === 'flat' ? '#2f6a4a' : '#a4492b', bold: true });
    // 右侧说明
    txt(cyl, 236, 48, '金属块 ' + blk + '：m = ' + b.m + ' g', { anchor: 'start', fill: '#3d3650', bold: true });
    txt(cyl, 236, 63, '（已用天平称好）', { anchor: 'start', fs: 9 });
    txt(cyl, 236, 84, '量程 100 mL', { anchor: 'start', fs: 9.5 });
    txt(cyl, 236, 98, '分度值 2 mL', { anchor: 'start', fs: 9.5 });
    S('line', { x1: CR + 2, y1: yl, x2: 232, y2: yl, stroke: '#5f95bf', 'stroke-width': 1, 'stroke-dasharray': '2 2' }, cyl);
    txt(cyl, 236, yl + 3.5, '凹液面底部 ' + L.fmt(lv.v, 1) + ' mL', { anchor: 'start', fs: 9.5, fill: '#3f6380' });
    readCyl(lv.v, (Y0 - yw) / KY);
  }

  function guess(rho) {
    var best = null;
    MATS.forEach(function (m) { if (Math.abs(m[2] - rho) < 0.15) best = m; });
    return best;
  }

  function readCyl(vNow, vRead) {
    var b = BLK[blk], inside = p >= 1;
    L.$('#cy-v1').innerHTML = L.qty(V1, 'mL', 0);
    L.$('#cy-v2').innerHTML = inside ? L.qty(V1 + b.v, 'mL', 0) : '—';
    L.$('#cy-v').innerHTML = inside ? L.qty(b.v, 'cm³', 0) : '—';
    var rho = b.m / b.v, gm = guess(rho);
    L.$('#cy-rho').innerHTML = inside ? L.qty(rho, 'g/cm³', 2) : '—';
    L.$('#cy-badge').textContent = inside ? (gm ? '可能是' + gm[1] : '查不到') : (p > 0 ? '正在放入' : '还没放入');
    L.$$('#mat-table tbody tr').forEach(function (tr) { tr.classList.toggle('on', inside && !!gm && tr.dataset.r === gm[0]); });
    var r = Math.round(vRead), err = r - Math.round(vNow);
    L.$('#cy-read').innerHTML = '约 ' + r + ' mL' + (eyePos === 'flat' ? '（正确）' : err > 0 ? '（偏大）' : '（偏小）');
    var t;
    if (p <= 0) t = '量筒里先倒入<b>适量</b>的水：既要能浸没金属块，放进去后水面又不能超过量程。现在 V₁ = ' + V1 + ' mL。';
    else if (!inside) t = '金属块正慢慢往下放，水面跟着升高。用细线吊着放，是为了不砸破量筒、不溅出水。';
    else t = 'V = ' + (V1 + b.v) + ' mL − ' + V1 + ' mL = ' + b.v + ' mL = ' + b.v + ' cm³，ρ = ' + b.m + ' g ÷ ' + b.v + ' cm³ = <b>' + L.fmt(rho, 2) + ' g/cm³</b>' + (gm ? '，和表里的<b>' + gm[1] + '</b>一样，它很可能是' + gm[1] + '做的。' : '。');
    if (eyePos === 'high') t += ' 现在是<b>俯视</b>，视线落在刻度偏上的地方，读数偏大。';
    if (eyePos === 'low') t += ' 现在是<b>仰视</b>，视线落在刻度偏下的地方，读数偏小。';
    L.$('#cy-text').innerHTML = t;
    L.$('#drop-btn').textContent = target >= 1 ? '把金属块提出来' : '把金属块放进量筒';
    save();
  }

  function moveTo(tg) {
    target = tg;
    if (anim) anim.stop();
    if (L.REDUCED) { p = tg; drawCyl(); return; }
    anim = L.loop(function (dt) {
      p = L.clamp(p + (tg > p ? 1 : -1) * dt / 1.4, 0, 1);
      drawCyl();
      return p !== tg;
    });
  }
  L.$('#drop-btn').addEventListener('click', function () { moveTo(target >= 1 ? 0 : 1); });
  L.chips(L.$('#blk-chips'), [{ label: 'A：54 g', value: 'A' }, { label: 'B：79 g', value: 'B' }, { label: 'C：89 g', value: 'C' }], blk, function (v) {
    if (anim) anim.stop();
    blk = v; p = 0; target = 0; drawCyl();
  });
  L.chips(L.$('#eye-chips'), [{ label: '平视', value: 'flat' }, { label: '俯视', value: 'high' }, { label: '仰视', value: 'low' }], eyePos, function (v) { eyePos = v; drawCyl(); });

  function save() {
    L.setState({ ob: ob, w: cnt.join('-'), r: rider, mat: mat, V: V, blk: blk, eye: eyePos, inn: target >= 1 && p >= 1 ? '1' : '' });
  }

  drawBal();
  drawMV();
  drawCyl();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '用天平称出金属块 A 的质量',
      desc: '把左盘换成金属块 A，按“先大后小”加减砝码，再拨游码，直到天平平衡。',
      label: '在托盘天平上操作',
      button: '检查天平',
      check: function () {
        if (ob !== 'metal') return { ok: false, msg: '先把左盘里的东西换成“金属块 A”。' };
        if (balanced()) return { ok: true, msg: '砝码 ' + wSum() + ' g + 游码 ' + L.fmt(rider, 1) + ' g = 54 g。读游码时看的是它的<b>左边缘</b>。' };
        return { ok: false, msg: diff() < 0 ? '指针偏左，左盘还重，继续加砝码或向右拨游码。' : '指针偏右，砝码加多了，换小一点的砝码或把游码往左拨。' };
      }
    },
    {
      level: 'base',
      title: '1 g/cm³ 等于多少 kg/m³？',
      desc: '1 g = 10⁻³ kg，1 cm³ = 10⁻⁶ m³。',
      options: ['1×10³ kg/m³', '1×10⁻³ kg/m³', '1 kg/m³', '1×10⁶ kg/m³'],
      answer: 0,
      hint: '把 g 换成 kg、cm³ 换成 m³，再相除。',
      explain: '1 g/cm³ = 10⁻³ kg ÷ 10⁻⁶ m³ = <b>1×10³ kg/m³</b>。所以水的密度 1.0 g/cm³ 也写成 1.0×10³ kg/m³。写成 10⁻³ 是只换了分子没换分母。'
    },
    {
      level: 'base',
      title: '用量筒读水的体积时，视线应该',
      desc: '可以在排水法的图里切换“平视、俯视、仰视”对比。',
      options: ['与凹液面的底部相平', '与凹液面边缘最高处相平', '从上往下看液面', '从下往上看液面'],
      answer: 0,
      hint: '水面是中间低、边上高的凹面，读哪一处？眼睛放在什么高度？',
      explain: '水在量筒里形成<b>凹液面</b>，读数时视线要与凹液面的<b>底部相平</b>。从上往下看（俯视）读数偏大，从下往上看（仰视）读数偏小。'
    },
    {
      level: 'mid',
      title: '在图象上找出 54 g 铝的体积',
      desc: '金属块 A 质量 54 g，如果它是铝做的，体积应该是多少？在 m–V 图象里选铝，调体积，让质量正好是 54 g。',
      label: '在 m–V 图象里操作',
      button: '检查这个点',
      check: function () {
        if (mat !== 'al') return { ok: false, msg: '先在物质里选“铝”。' };
        if (V === 20) return { ok: true, msg: 'V = m / ρ = 54 g ÷ 2.7 g/cm³ = 20 cm³。下面用排水法测一测，金属块 A 的体积是不是 20 cm³。' };
        return { ok: false, msg: '现在质量是 ' + L.fmt(2.7 * V, 1) + ' g。' + (2.7 * V < 54 ? '体积再调大一些。' : '体积调小一些。') };
      }
    },
    {
      level: 'mid',
      title: '找出哪一块是铁做的，并把它放进量筒测出密度',
      desc: '三块金属质量已经称好。逐个放进量筒，算出密度，再和右边的表比一比。',
      label: '在排水法的量筒里操作',
      button: '检查我的结论',
      check: function () {
        if (p < 1) return { ok: false, msg: '金属块还没有完全浸没在水里，先点“放进量筒”，等水面停稳。' };
        var b = BLK[blk], rho = b.m / b.v;
        if (blk === 'B') return { ok: true, msg: 'B 块：79 g ÷ 10 cm³ = 7.9 g/cm³，正是铁的密度。C 块体积也是 10 cm³，但质量 89 g，密度 8.9 g/cm³，是铜。' };
        return { ok: false, msg: blk + ' 块算出来是 ' + L.fmt(rho, 2) + ' g/cm³，不是铁（7.9 g/cm³）。换一块试试。' };
      }
    },
    {
      level: 'mid',
      title: '一个瓶子最多能装 500 g 水，这个瓶子的容积是',
      desc: '水的密度 ρ = 1.0 g/cm³。',
      options: ['500 cm³', '0.5 cm³', '5000 cm³', '500 m³'],
      answer: 0,
      hint: '已知质量和密度，求体积：V = m / ρ。',
      explain: 'V = m / ρ = 500 g ÷ 1.0 g/cm³ = <b>500 cm³</b>，也就是 500 mL。500 m³ 是单位写错了，相当于一个大游泳池那么大。'
    },
    {
      level: 'trap',
      title: '关于密度公式 ρ = m / V，下列说法正确的是',
      desc: '在 m–V 图象里拖动体积，看同一种物质的 m ÷ V 会不会变。',
      options: ['同种物质的密度与质量、体积无关', '物体的质量越大，密度越大', '物体的体积越大，密度越小', '密度与质量成正比，与体积成反比'],
      answer: 0,
      hint: '同一种物质，体积变成 2 倍，质量会怎样？比值呢？',
      explain: '同种物质，质量和体积同步变化，比值不变，所以密度与质量、体积<b>无关</b>，由物质种类和状态决定。B、C、D 都把“计算式”误当成了“决定式”。'
    },
    {
      level: 'trap',
      title: '90 g 的冰完全熔化成水后',
      desc: '冰的密度 0.9 g/cm³，水的密度 1.0 g/cm³。',
      options: ['质量仍为 90 g，体积减小了 10 cm³', '质量变小，体积变小', '质量不变，体积变大', '质量和体积都不变'],
      answer: 0,
      hint: '质量会随状态改变吗？再分别用 V = m / ρ 算冰和水的体积。',
      explain: '质量是物体本身的属性，熔化后仍是 <b>90 g</b>。冰的体积 90 ÷ 0.9 = 100 cm³，水的体积 90 ÷ 1.0 = 90 cm³，<b>体积减小 10 cm³</b>。体积变了，是因为密度变了。'
    }
  ]);
})();
