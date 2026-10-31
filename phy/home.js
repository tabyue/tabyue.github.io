/* 物理互动馆 · 第 19 课 家庭电路与安全用电 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();
  var INK = '#3d3650', WIRE = '#5b5470', BG = '#fbfaf7';
  var CF = '#c2603f', CN = '#3d6fb0', CE = '#5f9a3a';   // 火线、零线、地线的颜色

  function wire(g, pts, o) {
    o = o || {};
    return S('path', { d: 'M' + pts.map(function (p) { return p[0] + ' ' + p[1]; }).join('L'), fill: 'none', stroke: o.color || WIRE, 'stroke-width': o.w || 1.8, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', 'stroke-dasharray': o.dash || null, opacity: o.op || null }, g);
  }
  function node(g, x, y, c) { S('circle', { cx: x, cy: y, r: 2.8, fill: c || WIRE }, g); }
  function text(g, x, y, t, o) {
    o = o || {};
    return S('text', { x: x, y: y, 'font-size': o.fs || 10, 'text-anchor': o.anchor || 'middle', fill: o.color || '#5b5470', 'font-weight': o.bold ? 700 : null, text: t }, g);
  }
  function lampSym(g, cx, cy, r, on) {
    if (on) S('circle', { cx: cx, cy: cy, r: r + 9, fill: '#f7c948', opacity: 0.35 }, g);
    S('circle', { cx: cx, cy: cy, r: r, fill: on ? '#ffe27a' : '#fff', stroke: INK, 'stroke-width': 1.6 }, g);
    var d = r * 0.707;
    S('path', { d: 'M' + (cx - d) + ' ' + (cy - d) + 'L' + (cx + d) + ' ' + (cy + d) + 'M' + (cx + d) + ' ' + (cy - d) + 'L' + (cx - d) + ' ' + (cy + d), stroke: INK, 'stroke-width': 1.4 }, g);
  }
  /* 竖直放置的开关：上下两个接线柱 */
  function switchV(g, x, y1, y2, closed) {
    S('rect', { x: x - 4, y: y1, width: 14, height: y2 - y1, fill: BG }, g);
    S('line', { x1: x, y1: y1, x2: closed ? x + 2.5 : x + 11, y2: closed ? y2 : y2 - 4, stroke: INK, 'stroke-width': 1.8, 'stroke-linecap': 'round' }, g);
    S('circle', { cx: x, cy: y1, r: 2.4, fill: '#fff', stroke: INK, 'stroke-width': 1.4 }, g);
    S('circle', { cx: x, cy: y2, r: 2.4, fill: '#fff', stroke: INK, 'stroke-width': 1.4 }, g);
  }
  function switchH(g, x1, x2, y, closed) {
    S('rect', { x: x1, y: y - 4, width: x2 - x1, height: 8, fill: BG }, g);
    S('line', { x1: x1, y1: y, x2: closed ? x2 : x2 - 4, y2: closed ? y - 2.5 : y - 12, stroke: INK, 'stroke-width': 1.8, 'stroke-linecap': 'round' }, g);
    S('circle', { cx: x1, cy: y, r: 2.4, fill: '#fff', stroke: INK, 'stroke-width': 1.4 }, g);
    S('circle', { cx: x2, cy: y, r: 2.4, fill: '#fff', stroke: INK, 'stroke-width': 1.4 }, g);
  }
  function fuse(g, x1, x2, y, blown, copper) {
    S('rect', { x: x1, y: y - 5, width: x2 - x1, height: 10, fill: '#fff', stroke: INK, 'stroke-width': 1.5 }, g);
    if (copper) S('line', { x1: x1 - 2, y1: y, x2: x2 + 2, y2: y, stroke: '#c87533', 'stroke-width': 2.6 }, g);
    else if (blown) {
      S('line', { x1: x1 - 2, y1: y, x2: (x1 + x2) / 2 - 4, y2: y, stroke: INK, 'stroke-width': 1.5 }, g);
      S('line', { x1: (x1 + x2) / 2 + 4, y1: y, x2: x2 + 2, y2: y, stroke: INK, 'stroke-width': 1.5 }, g);
    } else S('line', { x1: x1 - 2, y1: y, x2: x2 + 2, y2: y, stroke: INK, 'stroke-width': 1.5 }, g);
  }
  function groundSym(g, x, y, c) {
    S('line', { x1: x, y1: y, x2: x, y2: y + 10, stroke: c, 'stroke-width': 1.8 }, g);
    [[9, 10], [6, 14], [3, 18]].forEach(function (p) { S('line', { x1: x - p[0], y1: y + p[1], x2: x + p[0], y2: y + p[1], stroke: c, 'stroke-width': 1.8 }, g); });
  }
  function canvas(el, h, id) {
    el.innerHTML = '';
    var defs = S('defs', {}, el), cp = S('clipPath', { id: id }, defs);
    S('rect', { x: 0, y: 0, width: 400, height: h, rx: 14 }, cp);
    S('rect', { x: 0, y: 0, width: 400, height: h, rx: 14, fill: BG }, el);
    return S('g', { 'clip-path': 'url(#' + id + ')' }, el);
  }

  /* ========== ① 家庭电路与试电笔 ========== */
  var FY = 60, NY = 82, EY = 104;               // 火线、零线、地线的高度
  var wiring = st.w === 'bad' ? 'bad' : 'ok';
  var closed = st.sw === '1';
  var finger = st.fg === '1';
  var NAMES = { L: '火线', N: '零线', E: '地线', lamp: '灯座上端接线处', sl: '插座左孔', sr: '插座右孔', se: '插座上孔' };
  var probe = NAMES[st.pt] ? st.pt : null;
  var FAULTS = [
    { id: 'swN', btn: '开关接在零线一侧', err: true, why: '开关应接在<b>火线</b>和电灯之间。现在开关一断开，灯虽然灭了，灯座却还连着火线，换灯泡会触电。' },
    { id: 'skt', btn: '插座左孔接了火线', err: true, why: '三孔插座应该“<b>左零右火</b>”，现在左右接反了。' },
    { id: 'gnd', btn: '插座上孔没接地线', err: true, why: '上孔要接<b>地线</b>，金属外壳的用电器漏电时，电流才能流入大地。' },
    { id: 'meter', btn: '电能表在总开关前', err: false, why: '这是对的：进户线先接电能表，计量全部用电，再接总开关。' },
    { id: 'fuse', btn: '保险装置接在火线上', err: false, why: '这是对的：保险装置要接在火线上，它断开后，后面的用电器就和火线断开了。' }
  ];
  var marks = {};
  var house = L.$('#house');
  var bad = function () { return wiring === 'bad'; };
  function lampTopY() { return bad() ? 122 : 158; }
  function points() {
    return [
      { id: 'L', x: 300, y: FY }, { id: 'N', x: 300, y: NY }, { id: 'E', x: 300, y: EY },
      { id: 'lamp', x: 240, y: lampTopY() - 8 },
      { id: 'se', x: 340, y: 174 }, { id: 'sl', x: 328, y: 194 }, { id: 'sr', x: 352, y: 194 }
    ];
  }
  function liveAt(id) {
    if (id === 'L') return true;
    if (id === 'lamp') return bad() ? true : closed;
    if (id === 'sl') return bad();
    if (id === 'sr') return !bad();
    return false;
  }
  function drawPen(g, p, glow) {
    var ang = (p.id === 'sl' || p.id === 'sr' || p.id === 'se') ? -145 : -35;
    var pg = S('g', { transform: 'translate(' + p.x + ' ' + p.y + ') rotate(' + ang + ')', 'pointer-events': 'none' }, g);
    S('line', { x1: 0, y1: 0, x2: 10, y2: 0, stroke: '#7d7889', 'stroke-width': 2.2, 'stroke-linecap': 'round' }, pg);
    S('rect', { x: 10, y: -5.5, width: 52, height: 11, rx: 3, fill: '#e6e1ef', stroke: '#7a6aa8', 'stroke-width': 1.2, opacity: 0.96 }, pg);
    S('rect', { x: 14, y: -2.5, width: 9, height: 5, fill: '#6b5f7f' }, pg);
    if (glow) S('circle', { cx: 33, cy: 0, r: 11, fill: '#ff6a3d', opacity: 0.35 }, pg);
    S('rect', { x: 27, y: -3.5, width: 12, height: 7, rx: 2, fill: glow ? '#ff6a3d' : '#f4f1f8', stroke: '#a39cb3', 'stroke-width': 1 }, pg);
    S('path', { d: 'M41 0l2 -3l2 6l2 -6l2 6l2 -6l2 6l2 -3', fill: 'none', stroke: '#8a8598', 'stroke-width': 1 }, pg);
    S('rect', { x: 62, y: -5.5, width: 7, height: 11, rx: 1.5, fill: '#a7a2b2', stroke: '#7d7889', 'stroke-width': 1 }, pg);
    if (finger) S('ellipse', { cx: 77, cy: 0, rx: 9, ry: 6.5, fill: '#f1c7a5', stroke: '#c99a78', 'stroke-width': 1 }, pg);
  }
  function ring(g, cx, cy, rx, ry) { S('ellipse', { cx: cx, cy: cy, rx: rx, ry: ry, fill: 'none', stroke: '#d1402a', 'stroke-width': 2, 'stroke-dasharray': '5 3' }, g); }

  function drawHouse() {
    var focusId = document.activeElement && document.activeElement.getAttribute ? document.activeElement.getAttribute('data-pt') : null;
    var g = canvas(house, 260, 'house-clip');
    // 进户线与干路
    wire(g, [[6, FY], [392, FY]], { color: CF, w: 2.2 });
    wire(g, [[6, NY], [392, NY]], { color: CN, w: 2.2 });
    wire(g, [[176, EY], [392, EY]], { color: CE, w: 2.2 });
    groundSym(g, 176, EY, CE);
    text(g, 6, FY - 6, '火线', { anchor: 'start', color: CF, bold: true });
    text(g, 6, NY - 6, '零线', { anchor: 'start', color: CN, bold: true });
    text(g, 190, EY - 6, '地线', { anchor: 'start', color: CE, bold: true });
    // 电能表
    S('rect', { x: 30, y: 48, width: 40, height: 46, rx: 4, fill: '#fff', stroke: INK, 'stroke-width': 1.5 }, g);
    text(g, 50, 75, 'kW·h', { fs: 9.5, color: INK });
    text(g, 50, 116, '电能表', { fs: 9.5 });
    // 总开关（双刀）
    switchH(g, 86, 110, FY, true);
    switchH(g, 86, 110, NY, true);
    S('line', { x1: 98, y1: FY - 1, x2: 98, y2: NY - 1, stroke: INK, 'stroke-dasharray': '2 2' }, g);
    text(g, 98, 116, '总开关', { fs: 9.5 });
    // 保险装置
    fuse(g, 124, 152, FY, false, false);
    text(g, 138, 116, '保险装置', { fs: 9.5 });
    // 电灯与开关
    var top = lampTopY();
    if (!bad()) {
      wire(g, [[240, FY], [240, 124]]);
      wire(g, [[240, 148], [240, 218], [264, 218], [264, NY]]);
      switchV(g, 240, 124, 148, closed);
      lampSym(g, 240, 170, 12, closed);
      text(g, 220, 140, '开关', { anchor: 'end', fs: 9.5 });
      text(g, 220, 174, '电灯', { anchor: 'end', fs: 9.5 });
    } else {
      wire(g, [[240, FY], [240, 160]]);
      wire(g, [[240, 184], [240, 218], [264, 218], [264, NY]]);
      lampSym(g, 240, 134, 12, closed);
      switchV(g, 240, 160, 184, closed);
      text(g, 220, 138, '电灯', { anchor: 'end', fs: 9.5 });
      text(g, 220, 176, '开关', { anchor: 'end', fs: 9.5 });
    }
    node(g, 240, FY); node(g, 264, NY);
    // 三孔插座
    var tN = 326, tE = 340, tL = 354;
    wire(g, [[tN, 160], [tN, NY]], { color: CN });
    wire(g, [[tL, 160], [tL, FY]], { color: CF });
    node(g, tN, NY, CN); node(g, tL, FY, CF);
    if (!bad()) { wire(g, [[tE, 160], [tE, EY]], { color: CE }); node(g, tE, EY, CE); }
    else { wire(g, [[tE, 160], [tE, 128]], { color: CE }); S('circle', { cx: tE, cy: 128, r: 2.4, fill: '#fff', stroke: CE, 'stroke-width': 1.4 }, g); }
    S('rect', { x: 314, y: 160, width: 52, height: 50, rx: 8, fill: '#fff', stroke: INK, 'stroke-width': 1.5 }, g);
    // 插座内部接线：左孔、右孔分别连到哪根线
    var leftFrom = bad() ? tL : tN, rightFrom = bad() ? tN : tL;
    wire(g, [[leftFrom, 160], [328, 188]], { color: bad() ? CF : CN, w: 1.2, op: 0.7 });
    wire(g, [[rightFrom, 160], [352, 188]], { color: bad() ? CN : CF, w: 1.2, op: 0.7 });
    if (!bad()) wire(g, [[tE, 160], [tE, 169]], { color: CE, w: 1.2, op: 0.7 });
    S('rect', { x: 338, y: 169, width: 4, height: 10, rx: 1, fill: INK }, g);
    S('rect', { x: 326, y: 189, width: 4, height: 10, rx: 1, fill: INK, transform: 'rotate(25 328 194)' }, g);
    S('rect', { x: 350, y: 189, width: 4, height: 10, rx: 1, fill: INK, transform: 'rotate(-25 352 194)' }, g);
    text(g, 340, 226, '三孔插座', { fs: 9.5 });
    if (!bad()) {
      text(g, 318, 206, '零', { fs: 9, color: CN, anchor: 'start' });
      text(g, 362, 206, '火', { fs: 9, color: CF, anchor: 'end' });
      text(g, 347, 175, '地', { fs: 9, color: CE, anchor: 'start' });
    }
    // 标出已找到的错误
    if (bad()) {
      if (marks.swN) ring(g, 244, 158, 18, 40);
      if (marks.skt) ring(g, 340, 186, 34, 30);
      if (marks.gnd) ring(g, 340, 132, 12, 18);
      if (marks.meter) ring(g, 50, 71, 24, 29);
      if (marks.fuse) ring(g, 138, FY, 22, 14);
    }
    // 测试点
    points().forEach(function (p) {
      var hit = S('g', { class: 'svg-hit', tabindex: 0, role: 'button', 'data-pt': p.id, 'aria-label': '用试电笔测' + NAMES[p.id] }, g);
      S('circle', { cx: p.x, cy: p.y, r: 8, fill: 'transparent', stroke: p.id === probe ? '#5a4097' : '#9c8fc2', 'stroke-width': p.id === probe ? 2 : 1.2, 'stroke-dasharray': '3 2' }, hit);
      hit.addEventListener('click', function () { setProbe(p.id); });
      hit.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setProbe(p.id); } });
    });
    if (probe) {
      var pp = points().filter(function (p) { return p.id === probe; })[0];
      drawPen(g, pp, liveAt(probe) && finger);
    }
    if (focusId) { var f = house.querySelector('[data-pt="' + focusId + '"]'); if (f) f.focus(); }
    readHouse();
  }
  function setProbe(id) { probe = id; drawHouse(); }

  function readHouse() {
    var live = probe ? liveAt(probe) : false, glow = live && finger;
    L.$('#pen-badge').textContent = !probe ? '还没测' : glow ? '氖管发光' : '氖管不亮';
    L.$('#pen-at').textContent = probe ? NAMES[probe] : '—';
    L.$('#pen-live').textContent = probe ? (live ? '是，带电' : '否') : '—';
    L.$('#lamp-state').textContent = closed ? '亮' : '灭';
    var t;
    if (!probe) t = '点图上的虚线圈，把试电笔笔尖放上去。';
    else if (glow) t = '<b>氖管发光</b>：这里和火线相连。电流从笔尖经过笔里阻值很大的电阻、氖管，再经过人体流入大地，电流非常小，人没有危险。';
    else if (live) t = '这里其实<b>带电</b>，但手没有接触笔尾金属体，电流没有通路，氖管不亮——这样会把火线误当成零线，<b>非常危险</b>。';
    else if (finger) t = '氖管不亮：这里没有和火线直接相连。零线、地线和大地之间几乎没有电压。';
    else t = '氖管不亮。不过手没有接触笔尾金属体，这次测量本来就不可靠，按下“手接触笔尾金属体”再测。';
    if (probe === 'lamp' && !closed) {
      t += bad() ? ' 注意：<b>开关已经断开，灯座却还带电</b>！因为开关接在零线一侧，灯一直连着火线，这时换灯泡会触电。'
        : ' 开关断开后，电灯就和火线断开了，这时换灯泡是安全的。';
    }
    L.$('#pen-text').innerHTML = t;
    L.$('#sw-btn').textContent = closed ? '断开灯的开关' : '闭合灯的开关';
    var fb = L.$('#finger-btn');
    fb.setAttribute('aria-pressed', String(finger));
    fb.textContent = '手接触笔尾金属体：' + (finger ? '是' : '否');
    // 找错误
    var btns = L.$$('#fault-btns button');
    btns.forEach(function (b) { b.disabled = !bad(); b.setAttribute('aria-pressed', String(!!marks[b.dataset.value])); });
    var list = L.$('#fault-list'), note = L.$('#fault-note');
    list.innerHTML = '';
    if (!bad()) {
      L.$('#fault-sub').innerHTML = '现在是正确接法。切换到“找错误”的电路，再点下面你认为<b>接错了</b>的地方。';
      note.textContent = '';
    } else {
      L.$('#fault-sub').innerHTML = '这张图里藏着 <b>3 处</b>错误。点下面你认为接错的地方，再点一次可以取消。';
      var found = 0, wrong = 0;
      FAULTS.forEach(function (f) {
        if (!marks[f.id]) return;
        if (f.err) found++; else wrong++;
        L.html('li', { class: f.err ? 'yes' : 'no', html: '<i>' + (f.err ? '✓' : '✗') + '</i><span>' + f.why + '</span>' }, list);
      });
      note.innerHTML = '已找到 ' + found + ' / 3 处错误' + (wrong ? '，有 ' + wrong + ' 处其实是对的，再点一次取消' : '') + (found === 3 && !wrong ? '。全部找对了！' : '。');
    }
    save();
  }
  L.chips(L.$('#wire-chips'), [{ label: '正确接法', value: 'ok' }, { label: '找错误', value: 'bad' }], wiring, function (v) { wiring = v; marks = {}; drawHouse(); });
  L.$('#sw-btn').addEventListener('click', function () { closed = !closed; drawHouse(); });
  L.$('#finger-btn').addEventListener('click', function () { finger = !finger; drawHouse(); });
  FAULTS.forEach(function (f) {
    var b = L.html('button', { type: 'button', text: f.btn, 'aria-pressed': 'false' }, L.$('#fault-btns'));
    b.dataset.value = f.id;
    b.addEventListener('click', function () { marks[f.id] = !marks[f.id]; drawHouse(); });
  });

  /* ========== ② 电流过大 ========== */
  var U = 220, IMAX = 32;
  var APPS = [
    { n: '照明灯', P: 100 }, { n: '电视机', P: 150 }, { n: '电冰箱', P: 150 }, { n: '微波炉', P: 1000 },
    { n: '电水壶', P: 1500 }, { n: '电磁炉', P: 2000 }, { n: '空调', P: 2500 }, { n: '热水器', P: 3000 }
  ];
  var on = APPS.map(function (a, k) { return (st.on || '').charAt(k) === '1'; });
  var dev = ['breaker', 'fuse', 'copper'].indexOf(st.dv) >= 0 ? st.dv : 'breaker';
  var cut = false, cutWhy = '', short = false, ovMsg = '';
  var over = L.$('#over');
  function totalP() { return APPS.reduce(function (s, a, k) { return s + (on[k] ? a.P : 0); }, 0); }
  function evaluate() {
    var I = short ? Infinity : totalP() / U;
    if (!cut && dev !== 'copper' && (short || I > IMAX)) { cut = true; cutWhy = short ? 'short' : 'over'; }
  }
  function drawOver() {
    var g = canvas(over, 240, 'over-clip');
    var P = totalP(), I = short ? Infinity : P / U, powered = !cut;
    var hot = dev === 'copper' && (short || I > IMAX);
    var FT = 36, NT = 190, lastX = 186 + 7 * 28;
    if (hot) {
      S('line', { x1: 0, y1: FT, x2: lastX, y2: FT, stroke: '#ff5a2a', 'stroke-width': 9, opacity: 0.3 }, g);
      S('line', { x1: 0, y1: NT, x2: lastX, y2: NT, stroke: '#ff5a2a', 'stroke-width': 9, opacity: 0.3 }, g);
    }
    wire(g, [[0, FT], [lastX, FT]], { color: hot ? '#e2401f' : CF, w: 2.2 });
    wire(g, [[0, NT], [lastX, NT]], { color: hot ? '#e2401f' : CN, w: 2.2 });
    text(g, 6, FT - 7, '火线', { anchor: 'start', color: CF, bold: true });
    text(g, 6, NT - 7, '零线', { anchor: 'start', color: CN, bold: true });
    text(g, 14, 118, 'U = 220 V', { anchor: 'start', fs: 10.5 });
    // 保护装置
    if (dev === 'breaker') switchH(g, 64, 96, FT, !cut);
    else fuse(g, 64, 96, FT, cut, dev === 'copper');
    var dname = dev === 'breaker' ? '空气开关 32 A' : dev === 'fuse' ? '保险丝 32 A' : '铜丝（错误做法）';
    text(g, 80, 20, dname, { fs: 9.5, color: dev === 'copper' ? '#a4492b' : '#5b5470', bold: dev === 'copper' });
    if (cut) text(g, 80, 58, dev === 'breaker' ? '已跳闸' : '已熔断', { fs: 10, color: '#d1402a', bold: true });
    // 电流显示
    S('rect', { x: 104, y: 46, width: 62, height: 20, rx: 4, fill: '#312b3f' }, g);
    text(g, 135, 60, powered ? (short ? 'I 极大' : 'I = ' + L.fmt(I, 1) + ' A') : 'I = 0 A', { fs: 10.5, color: '#9ff0b8', bold: true });
    if (hot) { text(g, 100, 150, '导线过热！', { fs: 13, color: '#d1402a', bold: true }); text(g, 100, 166, '可能引起火灾', { fs: 10, color: '#d1402a' }); }
    // 短路
    if (short) {
      wire(g, [[168, FT], [168, 92], [160, 100], [176, 110], [160, 120], [176, 130], [168, 138], [168, NT]], { color: '#d1402a', w: 2.4 });
      node(g, 168, FT); node(g, 168, NT);
      text(g, 154, 116, '短路', { anchor: 'end', fs: 11, color: '#d1402a', bold: true });
    }
    // 各用电器支路
    APPS.forEach(function (a, k) {
      var x = 186 + k * 28, work = on[k] && powered;
      node(g, x, FT); node(g, x, NT);
      wire(g, [[x, FT], [x, 54]]);
      switchV(g, x, 54, 74, on[k]);
      wire(g, [[x, 74], [x, 94]]);
      wire(g, [[x, 154], [x, NT]]);
      var bx = S('g', { class: 'svg-hit' }, g);
      S('rect', { x: x - 12, y: 94, width: 24, height: 60, rx: 4, fill: work ? '#ffe9a8' : '#fff', stroke: work ? '#d08a2c' : INK, 'stroke-width': 1.4 }, bx);
      a.n.split('').forEach(function (ch, j, arr) { text(bx, x, 124 - (arr.length - 1) * 6 + j * 12 + 3.5, ch, { fs: 10, color: INK }); });
      bx.addEventListener('click', function () { toggle(k); });
    });
    // 电流条
    var bx0 = 40, bw = 320, frac = short ? 1 : Math.min(I, 50) / 50;
    S('rect', { x: bx0, y: 206, width: bw, height: 10, rx: 5, fill: '#ece8f5' }, g);
    if (powered || dev === 'copper') S('rect', { x: bx0, y: 206, width: bw * (powered ? frac : 0), height: 10, rx: 5, fill: (short || I > IMAX) ? '#d1402a' : I > 25 ? '#e0a03a' : '#8f7cc0' }, g);
    var mx = bx0 + bw * IMAX / 50;
    S('line', { x1: mx, y1: 201, x2: mx, y2: 221, stroke: INK, 'stroke-width': 1.6 }, g);
    text(g, mx, 232, '32 A', { fs: 9.5, color: INK });
    text(g, bx0, 232, '0', { fs: 9.5 });
    text(g, bx0 + bw, 232, '50 A', { fs: 9.5 });
    text(g, bx0 - 4, 215, '干路', { fs: 9.5, anchor: 'end' });
    readOver(P, I);
  }
  function readOver(P, I) {
    L.$('#ov-p').innerHTML = L.qty(P, 'W', 0);
    L.$('#ov-i').innerHTML = cut ? '0<small>A</small>' : short ? '极大' : L.qty(I, 'A', 1);
    L.$('#ov-max').innerHTML = L.qty(U * IMAX, 'W', 0);
    var state, t;
    if (cut) {
      state = dev === 'breaker' ? '空气开关跳闸' : '保险丝熔断';
      if (cutWhy === 'short') t = '火线和零线被导线直接连在一起，电流几乎不经过用电器，电阻极小，<b>电流非常大</b>，保护装置立刻切断电路。要先找到短路的地方排除故障，再' + (dev === 'breaker' ? '复位' : '换上同规格的保险丝') + '。';
      else t = '打开的用电器总功率 ' + P + ' W，电流 ' + L.fmt(P / U, 1) + ' A 超过了 32 A，' + (dev === 'breaker' ? '空气开关<b>自动断开（跳闸）</b>' : '保险丝发热<b>熔断</b>') + '，全家断电。先关掉几个大功率用电器，再按“' + L.$('#reset-btn').textContent + '”。';
    } else if (dev === 'copper' && short) {
      state = '短路，极度危险'; t = '短路了，铜丝却不会熔断，巨大的电流让导线迅速发热，<b>极易起火</b>。这就是绝不能用铜丝、铁丝代替保险丝的原因。';
    } else if (dev === 'copper' && I > IMAX) {
      state = '导线过热，危险'; t = '电流已经 ' + L.fmt(I, 1) + ' A，超过 32 A。铜丝熔点高，<b>不会熔断</b>，导线越来越热，可能烧坏绝缘皮、引起火灾！';
    } else {
      state = '正常供电';
      var n = on.filter(Boolean).length;
      t = n === 0 ? '所有用电器都关着，干路没有电流。点上面的按钮（或图里的方框）逐个打开用电器。'
        : '打开了 ' + n + ' 个用电器，总功率 ' + P + ' W，干路电流 I = P总 ÷ U = ' + P + ' W ÷ 220 V ≈ ' + L.fmt(I, 1) + ' A，没超过 32 A。' + (I > 25 ? '已经接近上限，再开一个大功率用电器就可能跳闸。' : '');
      if (dev === 'copper') t += ' 现在电流不大，看起来没事，但铜丝起不到保护作用，试试“制造短路”。';
    }
    if (ovMsg) { t = ovMsg + ' ' + t; ovMsg = ''; }
    L.$('#ov-state').textContent = state;
    L.$('#ov-badge').textContent = state;
    L.$('#ov-text').innerHTML = t;
    L.$$('#app-btns button').forEach(function (b, k) { b.setAttribute('aria-pressed', String(on[k])); });
    save();
  }
  function toggle(k) { on[k] = !on[k]; evaluate(); drawOver(); }
  APPS.forEach(function (a, k) {
    var b = L.html('button', { type: 'button', text: a.n + ' ' + a.P + ' W', 'aria-pressed': String(on[k]) }, L.$('#app-btns'));
    b.addEventListener('click', function () { toggle(k); });
  });
  function resetLabel() { L.$('#reset-btn').textContent = dev === 'breaker' ? '排除故障后复位' : dev === 'fuse' ? '排除故障，换同规格保险丝' : '排除短路故障'; }
  L.chips(L.$('#dev-chips'), [{ label: '空气开关', value: 'breaker' }, { label: '保险丝', value: 'fuse' }, { label: '用铜丝代替（错误）', value: 'copper' }], dev, function (v) {
    dev = v; cut = false; short = false; resetLabel(); evaluate(); drawOver();
  });
  L.$('#short-btn').addEventListener('click', function () { short = true; evaluate(); drawOver(); });
  L.$('#reset-btn').addEventListener('click', function () {
    var was = cut;
    short = false; cut = false; evaluate();
    if (was && cut) ovMsg = '一复位又断开了：总功率还是太大。';
    drawOver();
  });
  L.$('#off-btn').addEventListener('click', function () { on = on.map(function () { return false; }); evaluate(); drawOver(); });
  resetLabel();

  /* ========== ③ 会不会触电 ========== */
  var SC = [
    { id: 'one', label: '站在地上摸火线', shock: true, text: '<b>单线触电</b>：人站在地上，脚和大地连通。电流从火线经过手、身体、脚流入大地。' },
    { id: 'stool', label: '站木凳上只摸火线', shock: false, text: '不触电：干燥的木凳是绝缘体，电流找不到从人体流到大地的路。但这<b>非常危险</b>：另一只手一碰到墙、零线或别人，马上就会触电。' },
    { id: 'two', label: '站木凳上，双手分别摸火线和零线', shock: true, text: '<b>双线触电</b>：电流从火线经过一只手、身体、另一只手流到零线。脚下的木凳隔断了大地，也挡不住这条路。' },
    { id: 'bird1', label: '小鸟站在一根电线上', shock: false, text: '不触电：小鸟两只脚之间只是很短一段导线，电阻极小，两脚之间的<b>电压几乎为零</b>，几乎没有电流流过小鸟。' },
    { id: 'bird2', label: '大鸟同时碰到两根线', shock: true, text: '触电：大鸟脚踩零线、翅膀碰到火线，身体把火线和零线连通了，220 V 的电压加在它身上。所以高压线之间要隔开足够远。' },
    { id: 'shell', label: '外壳漏电，没接地线', shock: true, text: '触电：洗衣机内部火线的绝缘皮破了，碰到金属外壳，外壳带电。外壳没接地，人一摸，电流就经过人体流入大地。' },
    { id: 'earth', label: '外壳漏电，接了地线', shock: false, text: '一般不会触电：外壳通过地线和大地相连，漏电的电流几乎全部沿地线流入大地，人体中几乎没有电流；同时漏电保护器会迅速切断电源。' }
  ];
  var sc = SC.some(function (s) { return s.id === st.sc; }) ? st.sc : 'one';
  var guesses = {};
  var shock = L.$('#shock');
  function scene() { for (var i = 0; i < SC.length; i++) if (SC[i].id === sc) return SC[i]; return SC[0]; }
  var FL = 34, NL = 58, GY = 200;
  function person(g, x, foot, hands) {
    var sh = foot - 78;
    S('circle', { cx: x, cy: foot - 96, r: 9, fill: '#fff', stroke: INK, 'stroke-width': 1.8 }, g);
    wire(g, [[x, foot - 87], [x, foot - 44]], { color: INK, w: 2.2 });
    wire(g, [[x - 10, foot], [x, foot - 44], [x + 10, foot]], { color: INK, w: 2.2 });
    var arms = hands.slice();
    if (arms.length < 2) arms.push([x - 16, sh + 34]);
    arms.forEach(function (h) { wire(g, [[x, sh], [h[0], h[1]]], { color: INK, w: 2.2 }); });
  }
  function lead(g, x, y, color) {
    wire(g, [[x, color === CF ? FL : NL], [x, y]], { color: color, w: 2 });
    S('circle', { cx: x, cy: y, r: 3.5, fill: '#f2a43a', stroke: '#c46a1c', 'stroke-width': 1 }, g);
  }
  function stool(g, x, top) {
    S('rect', { x: x - 26, y: top, width: 52, height: 7, rx: 2, fill: '#c9a873', stroke: '#9b7a45', 'stroke-width': 1 }, g);
    wire(g, [[x - 20, top + 7], [x - 22, GY]], { color: '#9b7a45', w: 3 });
    wire(g, [[x + 20, top + 7], [x + 22, GY]], { color: '#9b7a45', w: 3 });
  }
  function washer(g, earthed) {
    wire(g, [[262, FL], [262, 120]], { color: CF, w: 2 });
    wire(g, [[290, NL], [290, 120]], { color: CN, w: 2 });
    node(g, 262, FL, CF); node(g, 290, NL, CN);
    S('rect', { x: 250, y: 120, width: 70, height: 80, rx: 6, fill: '#eef1f5', stroke: INK, 'stroke-width': 1.6 }, g);
    S('circle', { cx: 285, cy: 164, r: 20, fill: '#dfe9f3', stroke: '#7f9fc0', 'stroke-width': 1.5 }, g);
    S('path', { d: 'M262 128l-6 8h6l-6 9', fill: 'none', stroke: '#d1402a', 'stroke-width': 1.8 }, g);
    text(g, 285, 216, '漏电：火线碰到外壳', { fs: 9, color: '#d1402a' });
    if (earthed) {
      wire(g, [[320, 182], [346, 182], [346, GY - 4]], { color: CE, w: 2 });
      text(g, 352, 176, '地线', { fs: 9.5, color: CE, anchor: 'start', bold: true });
    }
  }
  function path(g, pts, color) { wire(g, pts, { color: color || '#e0402a', w: 3, dash: '6 4' }); }
  function drawShock() {
    var g = canvas(shock, 220, 'shock-clip');
    S('rect', { x: 0, y: GY, width: 400, height: 20, fill: '#e8e1d0' }, g);
    for (var hx = 6; hx < 400; hx += 12) S('line', { x1: hx, y1: GY + 4, x2: hx + 8, y2: GY + 14, stroke: '#cfc4ab', 'stroke-width': 1 }, g);
    text(g, 30, GY + 15, '大地', { fs: 9.5, color: '#8a7a55' });
    wire(g, [[0, FL], [400, FL]], { color: CF, w: 2.4 });
    wire(g, [[0, NL], [400, NL]], { color: CN, w: 2.4 });
    text(g, 10, FL - 6, '火线', { anchor: 'start', color: CF, bold: true });
    text(g, 10, NL - 6, '零线', { anchor: 'start', color: CN, bold: true });
    var s = scene(), shown = guesses[sc] !== undefined;
    if (sc === 'one') {
      lead(g, 232, 96, CF); person(g, 200, GY, [[232, 96]]);
      if (shown) path(g, [[232, FL], [232, 96], [200, 122], [200, 156], [190, GY], [190, GY + 12]]);
    } else if (sc === 'stool' || sc === 'two') {
      stool(g, 200, 168);
      lead(g, 232, 70, CF);
      if (sc === 'two') { lead(g, 168, 70, CN); person(g, 200, 168, [[232, 70], [168, 70]]); }
      else person(g, 200, 168, [[232, 70]]);
      if (shown && sc === 'two') path(g, [[232, FL], [232, 70], [200, 90], [168, 70], [168, NL]]);
      if (shown && sc === 'stool') text(g, 290, 186, '木凳绝缘：没有通路', { fs: 10, color: '#2f6a4a', bold: true });
    } else if (sc === 'bird1') {
      S('ellipse', { cx: 200, cy: 25, rx: 11, ry: 6.5, fill: '#8a6d4f' }, g);
      S('circle', { cx: 211, cy: 19, r: 4.5, fill: '#8a6d4f' }, g);
      S('path', { d: 'M215 18l5 1.5l-5 1.5z', fill: '#e0a03a' }, g);
      S('path', { d: 'M189 24l-9 -3l3 6z', fill: '#6f563e' }, g);
      wire(g, [[196, 30], [194, FL]], { color: '#6f563e', w: 1.6 });
      wire(g, [[204, 30], [206, FL]], { color: '#6f563e', w: 1.6 });
      if (shown) {
        S('line', { x1: 194, y1: FL, x2: 206, y2: FL, stroke: '#2f6a4a', 'stroke-width': 5, opacity: 0.45 }, g);
        text(g, 200, 92, '两只脚之间这一小段导线，电压几乎为零', { fs: 10, color: '#2f6a4a', bold: true });
      }
    } else if (sc === 'bird2') {
      S('ellipse', { cx: 200, cy: 47, rx: 16, ry: 8, fill: '#5b6b7a' }, g);
      S('circle', { cx: 186, cy: 41, r: 5, fill: '#5b6b7a' }, g);
      S('path', { d: 'M181 40l-6 1.5l6 1.5z', fill: '#e0a03a' }, g);
      S('path', { d: 'M204 42L220 ' + FL + 'L228 42z', fill: '#46525e' }, g);
      wire(g, [[196, 54], [195, NL]], { color: '#46525e', w: 1.6 });
      wire(g, [[204, 54], [205, NL]], { color: '#46525e', w: 1.6 });
      text(g, 236, 24, '翅膀碰到火线', { fs: 9.5, anchor: 'start' });
      if (shown) {
        path(g, [[220, FL], [208, 44], [200, 52], [200, NL]]);
        text(g, 200, 100, '鸟的身体把火线和零线连通了', { fs: 10, color: '#d1402a', bold: true });
      }
    } else {
      var earthed = sc === 'earth';
      washer(g, earthed);
      if (earthed) groundSym(g, 346, GY - 4, CE);
      person(g, 200, GY, [[250, 150]]);
      if (shown && !earthed) path(g, [[262, FL], [262, 128], [250, 150], [200, 122], [200, 156], [190, GY], [190, GY + 12]]);
      if (shown && earthed) {
        path(g, [[262, FL], [262, 128], [300, 182], [346, 182], [346, GY + 10]], CE);
        text(g, 95, 130, '电流沿地线流入大地', { fs: 10, color: '#2f6a4a', bold: true });
      }
    }
    readShock(s, shown);
  }
  function readShock(s, shown) {
    var mine = L.$('#v-mine'), real = L.$('#v-real');
    mine.className = 'verdict-box'; real.className = 'verdict-box';
    if (!shown) {
      mine.querySelector('strong').textContent = '—';
      real.querySelector('strong').textContent = '？';
      L.$('#sc-text').innerHTML = '情景：<b>' + s.label + '</b>。先想一想：人体（或鸟的身体）有没有把火线和大地、或者火线和零线连起来？然后点下面的按钮。';
    } else {
      var g = guesses[sc], ok = (g === 'yes') === s.shock;
      mine.querySelector('strong').textContent = (g === 'yes' ? '会触电' : '不会触电') + (ok ? ' ✓' : ' ✗');
      mine.classList.add(ok ? 'yes' : 'no');
      real.querySelector('strong').textContent = s.shock ? '会触电' : '不会触电';
      L.$('#sc-text').innerHTML = (ok ? '判断正确。' : '判断错了。') + s.text;
    }
    var n = 0, right = 0;
    SC.forEach(function (x) { if (guesses[x.id] !== undefined) { n++; if ((guesses[x.id] === 'yes') === x.shock) right++; } });
    L.$('#sc-score').textContent = '已判断 ' + n + ' / ' + SC.length + (n ? ' · 答对 ' + right : '');
    save();
  }
  L.chips(L.$('#sc-chips'), SC.map(function (s) { return { label: s.label, value: s.id }; }), sc, function (v) { sc = v; drawShock(); });
  L.$('#guess-yes').addEventListener('click', function () { guesses[sc] = 'yes'; drawShock(); });
  L.$('#guess-no').addEventListener('click', function () { guesses[sc] = 'no'; drawShock(); });

  function save() {
    L.setState({ w: wiring, sw: closed ? 1 : 0, fg: finger ? 1 : 0, pt: probe, on: on.map(function (b) { return b ? 1 : 0; }).join(''), dv: dev, sc: sc });
  }

  evaluate();
  drawHouse();
  drawOver();
  drawShock();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '用试电笔找出三孔插座里接火线的孔',
      desc: '在“正确接法”的电路里，把试电笔笔尖放到插座的孔上，用正确的握法让氖管发光。',
      label: '在“家庭电路：用试电笔找火线”里操作',
      button: '检查试电笔',
      check: function () {
        if (bad()) return { ok: false, msg: '先切回“正确接法”的电路。' };
        if (['sl', 'sr', 'se'].indexOf(probe) < 0) return { ok: false, msg: '把笔尖放到三孔插座的某个孔上（点插座里的虚线圈）。' };
        if (!liveAt(probe)) return { ok: false, msg: NAMES[probe] + '不和火线相连，氖管不会亮，换一个孔。' };
        if (!finger) return { ok: false, msg: '笔尖放对了，可是氖管不亮：手没有接触<b>笔尾金属体</b>，电流没有通路。' };
        return { ok: true, msg: '右孔接火线，氖管发光。三孔插座“左零右火上接地”。用试电笔时手要接触笔尾金属体，但不能碰笔尖。' };
      }
    },
    {
      level: 'base',
      title: '我国家庭电路的电压和各用电器的连接方式是',
      desc: '想想家里的电灯、电视能不能各自单独开关。',
      options: ['220 V，各用电器并联', '220 V，各用电器串联', '36 V，各用电器并联', '380 V，各用电器串联'],
      answer: 0,
      hint: '如果是串联，关掉电视，电灯会怎样？',
      explain: '家庭电路电压是 <b>220 V</b>，各用电器<b>并联</b>，所以它们能单独工作、互不影响，而且两端电压都是 220 V。36 V 是一般情况下对人体的安全电压上限，不是家庭电路电压。'
    },
    {
      level: 'base',
      title: '三孔插座上面那个孔接的是',
      desc: '对应三脚插头最长的那只脚。',
      options: ['地线', '火线', '零线', '什么也不接'],
      answer: 0,
      hint: '这个孔是为有金属外壳的用电器准备的。',
      explain: '三孔插座“左零右火上接地”，上孔接<b>地线</b>。三脚插头最长的脚连着用电器的金属外壳，插进去后外壳就和大地相连，漏电时电流从地线流走。'
    },
    {
      level: 'mid',
      title: '找出电路里的 3 处错误',
      desc: '切换到“找错误”的电路，在右边“找错误”里标出全部 3 处接错的地方，不要误标正确的地方。',
      label: '在“家庭电路”和“找错误”里操作',
      button: '检查我找的错误',
      check: function () {
        if (!bad()) return { ok: false, msg: '先把电路切换到“找错误”。' };
        var miss = FAULTS.filter(function (f) { return f.err && !marks[f.id]; }).length;
        var wrong = FAULTS.filter(function (f) { return !f.err && marks[f.id]; });
        if (wrong.length) return { ok: false, msg: '“' + wrong[0].btn + '”其实是对的，取消它。' };
        if (miss) return { ok: false, msg: '还有 ' + miss + ' 处没找到。看看开关在哪根线一侧、插座两个孔各连着什么颜色的线、上孔有没有接到地线。' };
        return { ok: true, msg: '三处都找到了：开关要接火线；插座左零右火；上孔要接地。可以用试电笔测一测“灯座上端”，断开开关后它还带电。' };
      }
    },
    {
      level: 'mid',
      title: '打开尽量多的电器，但不能跳闸',
      desc: '在“电流过大会怎样”里用空气开关，打开用电器，让干路电流超过 25 A 但不超过 32 A。',
      label: '在“电流过大会怎样”里操作',
      button: '检查干路电流',
      check: function () {
        if (dev !== 'breaker') return { ok: false, msg: '保护装置请选“空气开关”。' };
        if (cut) return { ok: false, msg: '已经跳闸了。关掉一些电器，再按“排除故障后复位”。' };
        if (short) return { ok: false, msg: '电路里还有短路，先排除。' };
        var I = totalP() / U;
        if (I <= 25) return { ok: false, msg: '现在干路电流 ' + L.fmt(I, 1) + ' A，还不到 25 A，再打开一些。最大总功率是 220 V × 32 A = 7040 W。' };
        return { ok: true, msg: '总功率 ' + totalP() + ' W，电流 ' + L.fmt(I, 1) + ' A，没超过 32 A。再开一个大功率电器就会跳闸，所以大功率电器要错开使用。' };
      }
    },
    {
      level: 'mid',
      title: '发现有人触电，应该首先',
      desc: '既要救人，也要保证自己安全。',
      options: ['切断电源，或用干燥的木棍挑开电线', '马上用手把他拉开', '赶紧往他身上泼水', '用铁棍把电线挑开'],
      answer: 0,
      hint: '人体、水、铁都是导体。',
      explain: '要<b>先切断电源</b>，来不及时用干燥木棍等绝缘体挑开电线。直接用手拉，救人的人也会触电；水和铁棍都能导电，同样危险。'
    },
    {
      level: 'trap',
      title: '电灯的开关接在了零线上。断开开关、灯熄灭后去换灯泡，会怎样？',
      desc: '可以在“找错误”的电路里断开开关，用试电笔测“灯座上端接线处”。',
      options: ['仍可能触电，因为灯座还和火线相连', '不会触电，因为灯已经熄灭', '不会触电，因为开关已经断开', '只有手湿的时候才会触电'],
      answer: 0,
      hint: '灯熄灭只说明电路断了，灯座有没有和火线断开？',
      explain: '开关接在零线一侧时，断开开关只是断开了零线，<b>灯座仍然和火线相连</b>，人碰到就可能单线触电。所以开关必须接在火线和电灯之间。'
    },
    {
      level: 'trap',
      title: '保险丝熔断后，能不能用一段铜丝代替？',
      desc: '可以在“电流过大会怎样”里把保护装置换成铜丝，再制造短路看看。',
      options: ['不能，铜丝熔点高，电流过大时不会熔断，起不到保护作用', '能，铜丝导电好，比保险丝更安全', '能，只要铜丝够细就行', '不能，因为铜丝电阻太大，会让电路断开'],
      answer: 0,
      hint: '保险丝靠什么切断电路？铜丝能做到吗？',
      explain: '保险丝用电阻较大、<b>熔点较低</b>的材料，电流过大时自己先熔断。铜丝熔点高、电阻小，短路时也<b>不会熔断</b>，导线会过热引起火灾。铜丝电阻很小，说它“电阻太大”也不对。'
    }
  ]);
})();
