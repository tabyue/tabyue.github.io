/* 物理互动馆 · 第 13 课 内能 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();

  /* ========== 比热容：相同加热器加热水和沙子（或食用油） ========== */
  var QPM = 2100;            // 加热器每分钟放出的热量（J），假设全部被吸收
  var T0 = 25, TMAX = 6;     // 初温（℃）、最长加热时间（min）
  var MAT = {
    water: { name: '水', c: 4200, cTxt: '4.2×10³', color: '#3f78b5', fill: '#d6e7f6' },
    sand: { name: '沙子', c: 920, cTxt: '0.92×10³', color: '#b07a22', fill: '#ead6a8' },
    oil: { name: '食用油', c: 2000, cTxt: '2×10³', color: '#a58a12', fill: '#f3e3a0' }
  };
  var mat = st.m === 'oil' ? 'oil' : 'sand';
  var kg = ['0.1', '0.2', '0.3'].indexOf(st.kg) >= 0 ? +st.kg : 0.2;
  var tm = Math.round(L.num(st.t, 0, 0, TMAX) * 10) / 10;
  var cap = L.$('#cap');

  function tempOf(k, t) { return T0 + QPM * t / (MAT[k].c * kg); }

  function drawCup(g, k, y, t) {
    var M = MAT[k], x = 12, w = 66, h = 84, T = tempOf(k, t), heating = t > 0;
    S('rect', { x: x + 1, y: y + 22, width: w - 2, height: h - 23, fill: M.fill }, g);
    if (k === 'sand') {
      for (var i = 0; i < 26; i++) S('circle', { cx: x + 5 + (i * 23) % (w - 10), cy: y + 28 + (i * 37) % (h - 34), r: 1.1, fill: '#b9935a' }, g);
    }
    // 电加热器：伸进杯里的金属棒，底部是电热丝
    S('rect', { x: x + 16, y: y - 8, width: 5, height: h - 12, rx: 2, fill: '#a39cb3' }, g);
    S('path', { d: 'M' + (x + 18.5) + ' ' + (y + h - 22) + 'q8 3 0 6q-8 3 0 6q8 3 0 6q-8 3 0 6', fill: 'none', stroke: heating ? '#d0503a' : '#8d86a0', 'stroke-width': 2 }, g);
    // 杯子
    S('path', { d: 'M' + x + ' ' + y + 'V' + (y + h) + 'H' + (x + w) + 'V' + y, fill: 'none', stroke: '#7f9fc0', 'stroke-width': 1.8 }, g);
    // 温度计：液柱高度跟着温度走（0～180 ℃）
    var tx = x + w - 13, bulb = y + h - 8, top = y - 10;
    var col = bulb - 4 - L.clamp(T, 0, 180) / 180 * (bulb - 4 - top);
    S('rect', { x: tx - 3, y: top, width: 6, height: bulb - top, rx: 3, fill: '#fff', stroke: '#b8b2c6' }, g);
    S('rect', { x: tx - 1.2, y: col, width: 2.4, height: bulb - col, fill: '#d0503a' }, g);
    S('circle', { cx: tx, cy: bulb, r: 4, fill: '#d0503a' }, g);
    // 文字
    S('text', { x: x + w + 8, y: y + 18, 'font-size': 11, fill: M.color, 'font-weight': 700, text: M.name + ' · ' + L.fmt(kg * 1000, 0) + ' g' }, g);
    S('text', { x: x + w + 8, y: y + 40, 'font-size': 14, fill: '#3b3548', 'font-weight': 700, text: L.fmt(T, 1) + ' ℃' }, g);
    S('text', { x: x + w + 8, y: y + 56, 'font-size': 10, fill: '#6b7385', text: '升高 ' + L.fmt(T - T0, 1) + ' ℃' }, g);
    S('text', { x: x + w + 8, y: y + 70, 'font-size': 9.5, fill: '#8a8598', text: 'c ' + (k === 'water' ? '= ' : '≈ ') + M.cTxt }, g);
  }

  function drawCap() {
    var ax = L.axes(cap, { xmin: 0, xmax: TMAX, ymin: 0, ymax: 180, xstep: 1, ystep: 30, left: 182, right: 14, top: 16, bottom: 30, xlabel: ' ', ylabel: ' ' });
    var bg = S('rect', { x: 0, y: 0, width: 400, height: 260, rx: 14, fill: '#fbfaf7' });
    cap.insertBefore(bg, cap.firstChild);
    var defs = S('defs', {}, cap), cp = S('clipPath', { id: 'cap-clip' }, defs);
    S('rect', { x: ax.X(0), y: ax.Y(180) - 2, width: ax.X(TMAX) - ax.X(0) + 4, height: ax.Y(0) - ax.Y(180) + 3 }, cp);
    S('text', { x: ax.X(0) + 6, y: 12, 'font-size': 9.5, fill: '#6b7385', text: '温度 / ℃' }, cap);
    S('text', { x: ax.X(TMAX), y: 256, 'font-size': 9.5, 'text-anchor': 'end', fill: '#6b7385', text: '加热时间 / min' }, cap);
    var g = S('g', { 'clip-path': 'url(#cap-clip)' }, cap);
    ['water', mat].forEach(function (k) {
      if (tm > 0) S('path', { d: L.curve(ax, function (t) { return tempOf(k, t); }, 0, tm, 60), fill: 'none', stroke: MAT[k].color, 'stroke-width': 2.6, 'stroke-linecap': 'round' }, g);
      var px = ax.X(tm), py = ax.Y(Math.min(tempOf(k, tm), 181));
      if (tm > 0) S('line', { x1: ax.X(0), y1: py, x2: px, y2: py, stroke: MAT[k].color, 'stroke-dasharray': '3 3', opacity: 0.55 }, g);
      S('circle', { cx: px, cy: py, r: 4.5, fill: MAT[k].color, stroke: '#fff', 'stroke-width': 1.5 }, g);
      var right = tm < 4.4, ly = L.clamp(py + (k === 'water' ? 14 : -8), 26, 222);
      S('text', { x: px + (right ? 8 : -8), y: ly, 'font-size': 10.5, 'text-anchor': right ? 'start' : 'end', fill: MAT[k].color, 'font-weight': 700, text: MAT[k].name }, g);
    });
    if (tm === 0) S('text', { x: (ax.X(0) + ax.X(TMAX)) / 2, y: ax.Y(110), 'font-size': 11, 'text-anchor': 'middle', fill: '#8a8598', text: '按“开始加热”或拖动时间' }, cap);
    var app = S('g', {}, cap);
    drawCup(app, 'water', 30, tm);
    drawCup(app, mat, 152, tm);
    S('text', { x: 12, y: 254, 'font-size': 9.5, fill: '#8a8598', text: '两个加热器规格相同' }, app);
    capReadout();
  }

  function capReadout() {
    var Q = Math.round(QPM * tm), M = MAT[mat];
    var dw = QPM * tm / (4200 * kg), dk = QPM * tm / (M.c * kg), ratio = 4200 / M.c;
    L.$('#ct-out').textContent = L.fmt(tm, 1) + ' min';
    L.$('#c-t').innerHTML = L.fmt(tm, 1) + '<small>min</small>';
    L.$('#c-q').innerHTML = Q + '<small>J</small>';
    L.$('#c-dw').innerHTML = L.fmt(dw, 1) + '<small>℃</small>';
    L.$('#c-oname').textContent = M.name;
    L.$('#c-do').innerHTML = L.fmt(dk, 1) + '<small>℃</small>';
    L.$('#c-badge').textContent = tm === 0 ? '还没加热' : M.name + '升温快';
    L.$('#c-formula').innerHTML =
      '<span class="step"><em>Q</em> = 2100 J/min × ' + L.fmt(tm, 1) + ' min = <b>' + Q + ' J</b></span>' +
      '<span class="step">Δ<em>t</em><sub>水</sub> = <em>Q</em> ÷ (<em>c</em><em>m</em>) = ' + Q + ' J ÷ (4.2×10³ J/(kg·℃) × ' + kg + ' kg) ≈ <b>' + L.fmt(dw, 1) + ' ℃</b></span>' +
      '<span class="step">Δ<em>t</em><sub>' + M.name + '</sub> = ' + Q + ' J ÷ (' + M.cTxt + ' J/(kg·℃) × ' + kg + ' kg) ≈ <b>' + L.fmt(dk, 1) + ' ℃</b></span>';
    var t;
    if (tm === 0) t = '两杯都是 25 ℃。加热器相同，所以无论加热多久，两杯<b>吸收的热量总是相同</b>。猜一猜：谁的温度会先升上去？';
    else {
      t = '加热 ' + L.fmt(tm, 1) + ' min，两杯各吸收了 ' + Q + ' J 热量。' + M.name + '升高了 ' + L.fmt(dk, 1) + ' ℃，水只升高了 ' + L.fmt(dw, 1) + ' ℃，' + M.name + '升温约是水的 <b>' + L.fmt(ratio, 1) + ' 倍</b>。吸收同样多的热量，水的温度变化小，说明<b>水的比热容大</b>。';
      if (mat === 'sand') t += '海边的沙滩中午烫脚、海水却还凉，就是这个道理。';
      else t += '食用油升温快，所以炒菜时油很快就热了。';
    }
    L.$('#c-text').innerHTML = t;
    L.$$('#c-table tbody tr').forEach(function (tr) { tr.classList.toggle('on', tr.dataset.m === 'water' || tr.dataset.m === mat); });
    save();
  }

  var ctIn = L.$('#ct-in'), cPlay = L.$('#c-play'), cAnim = null;
  ctIn.value = tm;
  L.bindRange(ctIn, function (v) { stopCap(); tm = v; drawCap(); });
  function setTm(v) { tm = L.clamp(v, 0, TMAX); ctIn.value = tm; L.paintRange(ctIn); drawCap(); }
  function stopCap() {
    if (cAnim) { cAnim.stop(); cAnim = null; setTm(Math.round(tm * 10) / 10); }
    cPlay.textContent = tm > 0 && tm < TMAX ? '继续加热' : '开始加热';
  }
  cPlay.addEventListener('click', function () {
    if (cAnim) { stopCap(); return; }
    if (tm >= TMAX) setTm(0);
    if (L.REDUCED) { setTm(TMAX); stopCap(); return; }
    cPlay.textContent = '暂停';
    cAnim = L.loop(function (dt) {
      var nt = tm + dt * 0.5;            // 动画里 1 秒 = 加热 0.5 分钟
      if (nt >= TMAX) { cAnim = null; setTm(TMAX); cPlay.textContent = '开始加热'; return false; }
      setTm(nt);
    });
  });
  L.$('#c-reset').addEventListener('click', function () { stopCap(); setTm(0); cPlay.textContent = '开始加热'; });
  L.chips(L.$('#mat-chips'), [{ label: '沙子（c 约 0.92×10³）', value: 'sand' }, { label: '食用油（c 约 2×10³，近似）', value: 'oil' }], mat, function (v) { mat = v; drawCap(); });
  L.chips(L.$('#mass-chips'), [{ label: '100 g', value: '0.1' }, { label: '200 g', value: '0.2' }, { label: '300 g', value: '0.3' }], String(kg), function (v) { kg = +v; drawCap(); });

  /* ========== 分子热运动：墨水扩散 ========== */
  var mol = L.$('#mol');
  var mMode = st.mm === 'lead' ? 'lead' : 'diff';
  var CUPS = [
    { name: '左杯', x0: 34, x1: 176, T: Math.round(L.num(st.tl, 15, 5, 90)), ink: [], wat: [] },
    { name: '右杯', x0: 224, x1: 366, T: Math.round(L.num(st.tr, 80, 5, 90)), ink: [], wat: [] }
  ];
  var WY0 = 66, WY1 = 202;          // 水面、杯底：粒子只在这中间活动
  var NI = 70, NW = 26, MT_MAX = 90;
  var mt = 0, dropped = false, mAnim = null, lastShow = -1;

  // 水的黏度（Vogel 经验公式，单位 Pa·s）。扩散快慢 ∝ 绝对温度 ÷ 黏度
  function eta(Tk) { return 2.414e-5 * Math.pow(10, 247.8 / (Tk - 140)); }
  function diffRel(T) { var k = T + 273.15; return (k / eta(k)) / (288.15 / eta(288.15)); }
  function Dpx(T) { return 11 * diffRel(T); }      // 画布上的扩散系数（像素²/秒，示意）
  function vMol(T) { return 18 + 1.5 * T; }        // 水分子示意速度：差别做了夸大
  function gauss() { var u = 1 - Math.random(), v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function mix(a, b, p) { p = L.clamp(p, 0, 1); return 'rgb(' + a.map(function (v, i) { return Math.round(v + (b[i] - v) * p); }).join(',') + ')'; }
  function warmth(T) { return (T - 5) / 85; }
  function waterName(T) { return T < 35 ? '冷水' : T < 55 ? '温水' : '热水'; }

  function initWater(c) {
    c.wat = [];
    for (var i = 0; i < NW; i++) c.wat.push({ x: L.lerp(c.x0 + 4, c.x1 - 4, Math.random()), y: L.lerp(WY0 + 4, WY1 - 4, Math.random()), a: Math.random() * 6.283 });
  }
  function dropInk(c) {
    var cx = (c.x0 + c.x1) / 2;
    c.ink = [];
    for (var i = 0; i < NI; i++) c.ink.push({ x: cx + gauss() * 3, y: WY0 + 7 + Math.abs(gauss()) * 3 });
  }
  function spreadOf(c) {
    if (!c.ink.length) return 0;
    var n = c.ink.length, mx = 0, my = 0, vx = 0, vy = 0, i;
    for (i = 0; i < n; i++) { mx += c.ink[i].x; my += c.ink[i].y; }
    mx /= n; my /= n;
    for (i = 0; i < n; i++) { vx += Math.pow(c.ink[i].x - mx, 2); vy += Math.pow(c.ink[i].y - my, 2); }
    var W = c.x1 - c.x0, H = WY1 - WY0;
    return L.clamp(Math.sqrt((vx / n / (W * W / 12) + vy / n / (H * H / 12)) / 2), 0, 1);
  }
  function bounce(v, lo, hi) { if (v < lo) v = 2 * lo - v; if (v > hi) v = 2 * hi - v; return L.clamp(v, lo, hi); }
  function step(dt) {
    CUPS.forEach(function (c) {
      var s = Math.sqrt(2 * Dpx(c.T) * dt), v = vMol(c.T) * dt;
      c.ink.forEach(function (p) { p.x = bounce(p.x + gauss() * s, c.x0 + 2, c.x1 - 2); p.y = bounce(p.y + gauss() * s, WY0 + 2, WY1 - 2); });
      c.wat.forEach(function (p) {
        p.a += gauss() * 0.5;
        var nx = p.x + Math.cos(p.a) * v, ny = p.y + Math.sin(p.a) * v;
        if (nx < c.x0 + 3 || nx > c.x1 - 3) { p.a = Math.PI - p.a; nx = L.clamp(nx, c.x0 + 3, c.x1 - 3); }
        if (ny < WY0 + 3 || ny > WY1 - 3) { p.a = -p.a; ny = L.clamp(ny, WY0 + 3, WY1 - 3); }
        p.x = nx; p.y = ny;
      });
    });
  }

  var BLUE = [227, 238, 248], WARM = [248, 228, 216], COLD_T = [63, 120, 181], HOT_T = [194, 80, 58];
  function buildDiff() {
    mol.innerHTML = '';
    var defs = S('defs', {}, mol), cp = S('clipPath', { id: 'mol-clip' }, defs);
    CUPS.forEach(function (c) { S('rect', { x: c.x0, y: WY0, width: c.x1 - c.x0, height: WY1 - WY0 }, cp); });
    S('rect', { x: 0, y: 0, width: 400, height: 230, rx: 14, fill: '#fbfaf7' }, mol);
    CUPS.forEach(function (c) {
      c.waterEl = S('rect', { x: c.x0, y: WY0, width: c.x1 - c.x0, height: WY1 - WY0 }, mol);
      S('path', { d: 'M' + (c.x0 - 2) + ' 44V' + (WY1 + 2) + 'H' + (c.x1 + 2) + 'V44', fill: 'none', stroke: '#7f9fc0', 'stroke-width': 2 }, mol);
      c.labEl = S('text', { x: (c.x0 + c.x1) / 2, y: 222, 'font-size': 11, 'text-anchor': 'middle', 'font-weight': 700 }, mol);
      // 滴管：还没滴的时候，墨水挂在滴管口
      c.dropEl = S('g', {}, mol);
      var cx = (c.x0 + c.x1) / 2;
      S('rect', { x: cx - 4, y: 8, width: 8, height: 26, rx: 2, fill: '#eef3f8', stroke: '#8d86a0' }, c.dropEl);
      S('rect', { x: cx - 6, y: 4, width: 12, height: 8, rx: 3, fill: '#8d86a0' }, c.dropEl);
      S('path', { d: 'M' + cx + ' 37c3 4 3 7 0 8c-3-1-3-4 0-8z', fill: '#3b2a6b' }, c.dropEl);
    });
    var g = S('g', { 'clip-path': 'url(#mol-clip)' }, mol);
    CUPS.forEach(function (c) {
      if (!c.wat.length) initWater(c);
      c.wEls = c.wat.map(function () { return S('circle', { r: 2.3, fill: '#8db8e0', opacity: 0.75 }, g); });
      c.iEls = [];
      for (var i = 0; i < NI; i++) c.iEls.push(S('circle', { r: 2.5, fill: '#3b2a6b', opacity: 0.85 }, g));
    });
    S('text', { x: 200, y: 20, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#5f8fbf', text: '浅蓝：水分子' }, mol);
    S('text', { x: 200, y: 34, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#3b2a6b', text: '深紫：墨水' }, mol);
    looks();
    render();
  }
  function looks() {
    CUPS.forEach(function (c) {
      if (!c.waterEl) return;
      c.waterEl.setAttribute('fill', mix(BLUE, WARM, warmth(c.T)));
      c.labEl.setAttribute('fill', mix(COLD_T, HOT_T, warmth(c.T)));
      c.labEl.textContent = c.name + ' · ' + c.T + ' ℃ ' + waterName(c.T);
      c.dropEl.style.display = dropped ? 'none' : '';
    });
  }
  function render() {
    if (mMode !== 'diff') return;
    CUPS.forEach(function (c) {
      c.wat.forEach(function (p, i) { c.wEls[i].setAttribute('cx', p.x.toFixed(1)); c.wEls[i].setAttribute('cy', p.y.toFixed(1)); });
      c.iEls.forEach(function (el, i) {
        var p = c.ink[i];
        if (!p) { el.style.display = 'none'; return; }
        el.style.display = '';
        el.setAttribute('cx', p.x.toFixed(1)); el.setAttribute('cy', p.y.toFixed(1));
      });
    });
  }

  var dropBtn = L.$('#m-drop'), pauseBtn = L.$('#m-pause');
  function stopMol() { if (mAnim) { mAnim.stop(); mAnim = null; } pauseBtn.textContent = dropped && mt < MT_MAX ? '继续' : '暂停'; }
  function runMol() {
    if (L.REDUCED) {
      for (var k = 0; k < 200; k++) step(0.05);   // 减少动态效果：直接算出 10 s 后的样子
      mt += 10; render(); molReadout(); stopMol(); return;
    }
    pauseBtn.textContent = '暂停';
    mAnim = L.loop(function (dt) {
      step(dt); mt += dt; render();
      var tick = Math.floor(mt * 4);
      if (tick !== lastShow) { lastShow = tick; molReadout(); }
      if (mt >= MT_MAX) { mAnim = null; molReadout(); stopMol(); return false; }
    });
  }
  dropBtn.addEventListener('click', function () {
    stopMol();
    dropped = true; mt = 0;
    CUPS.forEach(dropInk);
    dropBtn.textContent = '重新滴墨水';
    looks(); render(); molReadout();
    runMol();
  });
  pauseBtn.addEventListener('click', function () {
    if (mAnim) { stopMol(); return; }
    if (dropped && mt < MT_MAX) runMol();
  });
  [['#tl-in', '#tl-out', 0], ['#tr-in', '#tr-out', 1]].forEach(function (r) {
    var inp = L.$(r[0]);
    inp.value = CUPS[r[2]].T;
    L.bindRange(inp, function (v) { CUPS[r[2]].T = v; L.$(r[1]).textContent = v + ' ℃'; looks(); molReadout(); });
    L.$(r[1]).textContent = CUPS[r[2]].T + ' ℃';
  });

  /* ========== 分子间引力：压紧的铅柱 ========== */
  var pressed = st.lp === '1';
  var hooks = Math.round(L.num(st.hk, 1, 0, 4));
  function buildLead() {
    mol.innerHTML = '';
    var defs = S('defs', {}, mol);
    var cpa = S('clipPath', { id: 'lead-clip' }, defs);
    S('rect', { x: 0, y: 0, width: 400, height: 230, rx: 14 }, cpa);
    var cpz = S('clipPath', { id: 'lead-zoom' }, defs);
    S('circle', { cx: 318, cy: 104, r: 58 }, cpz);
    S('rect', { x: 0, y: 0, width: 400, height: 230, rx: 14, fill: '#fbfaf7' }, mol);
    var root = S('g', { 'clip-path': 'url(#lead-clip)' }, mol);
    // 铁架台
    S('rect', { x: 28, y: 214, width: 230, height: 8, rx: 3, fill: '#bdb6ca' }, root);
    S('rect', { x: 46, y: 12, width: 6, height: 204, fill: '#a39cb3' }, root);
    S('rect', { x: 46, y: 12, width: 150, height: 5, fill: '#a39cb3' }, root);
    S('line', { x1: 180, y1: 17, x2: 180, y2: 30, stroke: '#5b6475', 'stroke-width': 1.5 }, root);
    function block(x, y, label) {
      S('rect', { x: x, y: y, width: 56, height: 50, rx: 4, fill: '#8e939c', stroke: '#6d727c' }, root);
      S('rect', { x: x + 6, y: y + 4, width: 6, height: 42, rx: 2, fill: '#b9bdc4', opacity: 0.7 }, root);
      if (label) S('text', { x: x + 28, y: y + 29, 'font-size': 10, 'text-anchor': 'middle', fill: '#fff', text: label }, root);
    }
    function hook(x, y) {
      S('line', { x1: x + 11, y1: y - 3, x2: x + 11, y2: y, stroke: '#5b6475' }, root);
      S('rect', { x: x, y: y, width: 22, height: 13, rx: 2, fill: '#d9b878', stroke: '#9c7d45' }, root);
    }
    block(152, 30, '铅柱');
    var i;
    if (pressed) {
      block(152, 80, '铅柱');
      S('line', { x1: 152, y1: 80, x2: 208, y2: 80, stroke: '#6d727c', 'stroke-width': 0.8 }, root);
      if (hooks) S('line', { x1: 180, y1: 130, x2: 180, y2: 137, stroke: '#5b6475', 'stroke-width': 1.5 }, root);
      for (i = 0; i < hooks; i++) hook(169, 140 + i * 16);
      if (hooks) S('text', { x: 196, y: 152 + (hooks - 1) * 16, 'font-size': 10, fill: '#7a6a45', text: hooks + ' 个钩码' }, root);
    } else {
      S('path', { d: 'M152 80l7 -3 7 3 7 -2 7 2 7 -3 7 3 7 -2 6 2', fill: 'none', stroke: '#6d727c' }, root);
      block(150, 164, '');
      for (i = 0; i < hooks; i++) hook(58 + i * 23, 201);
      L.arrow(root, 132, 90, 132, 150, { color: '#a4492b', width: 1.6, dash: '4 3' });
      S('text', { x: 126, y: 122, 'font-size': 10, 'text-anchor': 'end', fill: '#a4492b', 'font-weight': 600, text: '掉下来' }, root);
    }
    // 放大看接触面
    S('path', { d: 'M208 80L264 74M208 80L270 136', fill: 'none', stroke: '#c9c2d6', 'stroke-dasharray': '3 3' }, root);
    S('circle', { cx: 318, cy: 104, r: 58, fill: '#fff', stroke: '#5a4097', 'stroke-width': 1.4 }, root);
    var z = S('g', { 'clip-path': 'url(#lead-zoom)' }, root), gap = pressed ? 0 : 26, sp = 14;
    for (var row = 0; row < 5; row++) {
      for (var col = -5; col <= 5; col++) {
        var xx = 318 + col * sp + (row % 2 ? sp / 2 : 0);
        var up = 104 - gap / 2 - sp / 2 - row * sp, dn = 104 + gap / 2 + sp / 2 + row * sp;
        var edge = row === 0;
        if (!(edge && !pressed && (col + 6) % 3 === 0)) S('circle', { cx: xx, cy: up, r: 5.5, fill: edge && pressed ? '#c98e7a' : '#9aa0aa' }, z);
        if (!(edge && !pressed && (col + 7) % 3 === 0)) S('circle', { cx: xx, cy: dn, r: 5.5, fill: edge && pressed ? '#c98e7a' : '#9aa0aa' }, z);
      }
    }
    S('text', { x: 318, y: 180, 'font-size': 10, 'text-anchor': 'middle', fill: '#5a4097', 'font-weight': 600, text: '放大看接触面' }, root);
    S('text', { x: 318, y: 194, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#6b7385', text: pressed ? '分子挨得很近，互相吸引' : '大部分分子离得太远' }, root);
  }

  var MODE_SUB = {
    diff: ['墨水没人搅也会自己散开，这就是<b>扩散</b>。调好两杯水温，点“滴入墨水”，比比哪杯散得快。', '墨水在两杯水中扩散的动画'],
    lead: ['把两块铅柱的底面削平、压紧，下面挂钩码，看它们能不能“粘”在一起。右边的圆圈把接触面放大到分子的尺度。', '两块铅柱压紧后吊起钩码的示意图']
  };
  function setMode(v) {
    stopMol();
    mMode = v;
    L.$('#diff-ctl').hidden = v !== 'diff';
    L.$('#lead-ctl').hidden = v !== 'lead';
    L.$('#mol-sub').innerHTML = MODE_SUB[v][0];
    mol.setAttribute('aria-label', MODE_SUB[v][1]);
    if (v === 'diff') buildDiff(); else buildLead();
    molReadout();
  }
  function setK(n, k, v) { L.$('#m-k' + n).textContent = k; L.$('#m-v' + n).innerHTML = v; }
  function molReadout() {
    var t;
    if (mMode === 'lead') {
      L.$('#m-title').textContent = '两块铅柱';
      L.$('#m-badge').textContent = pressed ? '拉不开' : '掉下来了';
      setK(1, '接触面', pressed ? '削平、压紧' : '只是贴着');
      setK(2, '下面挂了', hooks + '<small>个钩码</small>');
      setK(3, '分子间距离', pressed ? '很近' : '大多太远');
      setK(4, '结果', pressed ? '吊得住' : '掉下来');
      L.$('#m-v1').style.fontSize = L.$('#m-v3').style.fontSize = L.$('#m-v4').style.fontSize = '18px';
      t = pressed
        ? '底面削平、削干净再用力压紧，接触面上很多分子挨得非常近，彼此<b>吸引</b>，下面' + (hooks ? '挂上 ' + hooks + ' 个钩码' : '那块铅') + '也拉不开。这说明<b>分子间存在引力</b>。'
        : '只是轻轻贴着，接触面坑坑洼洼，真正挨得很近的分子很少，大部分分子离得太远，引力微弱得可以忽略，下面那块铅连自己的重力都拉不住' + (hooks ? '，挂了钩码更不用说' : '') + '。';
      t += ' 分子间同时还有<b>斥力</b>：固体、液体很难被压缩，就是斥力在起作用。';
      L.$('#m-text').innerHTML = t;
      save();
      return;
    }
    ['#m-v1', '#m-v3', '#m-v4'].forEach(function (s) { L.$(s).style.fontSize = ''; });
    var A = CUPS[0], B = CUPS[1], sa = spreadOf(A), sb = spreadOf(B);
    L.$('#m-title').textContent = '两杯水对比';
    setK(1, '左杯水温', A.T + '<small>℃</small>');
    setK(2, '右杯水温', B.T + '<small>℃</small>');
    setK(3, '左杯墨水散开', dropped ? Math.round(sa * 100) + '<small>%</small>' : '—');
    setK(4, '右杯墨水散开', dropped ? Math.round(sb * 100) + '<small>%</small>' : '—');
    var hot = A.T > B.T ? A : B, cold = hot === A ? B : A, same = Math.abs(A.T - B.T) < 3;
    var r = diffRel(hot.T) / diffRel(cold.T);
    if (!dropped) {
      L.$('#m-badge').textContent = '等你滴墨水';
      t = '两杯水的温度可以分别调。先猜一猜：哪杯里的墨水散得快？再点“滴入墨水”。';
    } else {
      L.$('#m-badge').textContent = same ? '差不多快' : hot.name + '散得快';
      t = '已过 ' + Math.floor(mt) + ' s。';
      if (same) t += '两杯水温差不多，墨水散开的快慢也差不多。';
      else t += hot.name + ' ' + hot.T + ' ℃，水温高，分子运动更剧烈，墨水散得更快（按水温估算，约是' + cold.name + '的 ' + L.fmt(r, 1) + ' 倍）。';
      t += '没人搅拌，墨水也会自己散开，说明分子在不停地做<b>无规则运动</b>；温度越高运动越剧烈，所以叫<b>热运动</b>。';
      if (L.REDUCED) t += '（已开启“减少动态效果”，每点一次直接显示 10 s 后的样子。）';
    }
    L.$('#m-text').innerHTML = t;
    save();
  }
  L.chips(L.$('#mol-mode'), [{ label: '墨水扩散', value: 'diff' }, { label: '压紧铅块', value: 'lead' }], mMode, setMode);
  L.chips(L.$('#lead-chips'), [{ label: '轻轻贴在一起', value: '0' }, { label: '削平后用力压紧', value: '1' }], pressed ? '1' : '0', function (v) { pressed = v === '1'; buildLead(); molReadout(); });
  L.$('#hook-add').addEventListener('click', function () { hooks = Math.min(4, hooks + 1); buildLead(); molReadout(); });
  L.$('#hook-del').addEventListener('click', function () { hooks = Math.max(0, hooks - 1); buildLead(); molReadout(); });

  /* ========== 改变内能的两种方式：分类小游戏 ========== */
  var way = L.$('#way');
  var SKIN = '#f1d2b6', SKIN_S = '#c99a78', HOT = '#d0503a';
  function waves(g, x, y, c) { S('path', { d: 'M' + x + ' ' + y + 'c-4-4 4-6 0-10s4-6 0-10', fill: 'none', stroke: c || HOT, 'stroke-width': 1.6, 'stroke-linecap': 'round' }, g); }
  function person(g, x, y) {
    S('circle', { cx: x, cy: y, r: 9, fill: SKIN, stroke: SKIN_S }, g);
    S('path', { d: 'M' + x + ' ' + (y + 9) + 'v30M' + (x - 14) + ' ' + (y + 20) + 'h28M' + x + ' ' + (y + 39) + 'l-10 16M' + x + ' ' + (y + 39) + 'l10 16', fill: 'none', stroke: '#6d727c', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, g);
  }
  var ICON = {
    rub: function (g) {
      S('ellipse', { cx: 94, cy: 100, rx: 15, ry: 32, fill: SKIN, stroke: SKIN_S, transform: 'rotate(-10 94 100)' }, g);
      S('ellipse', { cx: 114, cy: 100, rx: 15, ry: 32, fill: SKIN, stroke: SKIN_S, transform: 'rotate(10 114 100)' }, g);
      L.arrow(g, 66, 116, 66, 80, { color: '#5a4097', width: 1.8 }); L.arrow(g, 142, 80, 142, 116, { color: '#5a4097', width: 1.8 });
      waves(g, 98, 60); waves(g, 112, 60);
    },
    sun: function (g) {
      S('circle', { cx: 66, cy: 70, r: 17, fill: '#f2b705' }, g);
      for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4; S('line', { x1: 66 + Math.cos(a) * 22, y1: 70 + Math.sin(a) * 22, x2: 66 + Math.cos(a) * 29, y2: 70 + Math.sin(a) * 29, stroke: '#f2b705', 'stroke-width': 2, 'stroke-linecap': 'round' }, g); }
      L.arrow(g, 96, 84, 122, 98, { color: '#d08a2c', width: 1.6, dash: '4 3' });
      person(g, 140, 92);
    },
    piston: function (g) {
      S('rect', { x: 90, y: 50, width: 28, height: 96, rx: 3, fill: '#eef3f8', stroke: '#7f9fc0', 'stroke-width': 1.6 }, g);
      S('rect', { x: 91, y: 92, width: 26, height: 53, fill: '#f8e2d4' }, g);
      S('line', { x1: 104, y1: 36, x2: 104, y2: 84, stroke: '#6d727c', 'stroke-width': 3 }, g);
      S('rect', { x: 90, y: 32, width: 28, height: 6, rx: 2, fill: '#6d727c' }, g);
      S('rect', { x: 92, y: 84, width: 24, height: 9, rx: 2, fill: '#8d86a0' }, g);
      [97, 104, 111].forEach(function (x) { S('circle', { cx: x, cy: 138, r: 4, fill: '#fff', stroke: '#b8b2c6' }, g); });
      S('path', { d: 'M104 136c-5-5-3-10 0-14c3 4 5 9 0 14z', fill: '#f2a43a' }, g);
      L.arrow(g, 134, 40, 134, 84, { color: '#5a4097', width: 1.8 });
      S('text', { x: 140, y: 66, 'font-size': 9.5, fill: '#5a4097', text: '迅速下压' }, g);
    },
    ice: function (g) {
      S('path', { d: 'M76 56L132 56L124 146L84 146Z', fill: '#fff', stroke: '#7f9fc0', 'stroke-width': 1.6 }, g);
      S('path', { d: 'M78 74L130 74L124 145L84 145Z', fill: '#e8c48c' }, g);
      S('rect', { x: 90, y: 78, width: 16, height: 16, rx: 3, fill: '#eef6fc', stroke: '#8fb4d4', transform: 'rotate(-12 98 86)' }, g);
      S('rect', { x: 106, y: 92, width: 15, height: 15, rx: 3, fill: '#eef6fc', stroke: '#8fb4d4', transform: 'rotate(14 113 99)' }, g);
      S('line', { x1: 116, y1: 40, x2: 106, y2: 130, stroke: '#c2603f', 'stroke-width': 3 }, g);
      L.arrow(g, 90, 128, 98, 104, { color: HOT, width: 1.4, head: 6 }); L.arrow(g, 120, 130, 114, 112, { color: HOT, width: 1.4, head: 6 });
    },
    drill: function (g) {
      S('rect', { x: 56, y: 128, width: 96, height: 16, rx: 3, fill: '#c9a873', stroke: '#9c7d45' }, g);
      S('rect', { x: 100, y: 46, width: 8, height: 84, rx: 3, fill: '#b08550' }, g);
      S('path', { d: 'M84 70a20 6 0 1 0 40 0', fill: 'none', stroke: '#5a4097', 'stroke-width': 1.8 }, g);
      L.arrow(g, 120, 74, 125, 68, { color: '#5a4097', width: 1.8, head: 7 });
      waves(g, 92, 124, '#9aa0aa'); waves(g, 118, 124, '#9aa0aa');
      S('circle', { cx: 104, cy: 128, r: 5, fill: '#f2a43a', opacity: 0.7 }, g);
    },
    bag: function (g) {
      S('rect', { x: 62, y: 70, width: 72, height: 62, rx: 18, fill: '#e6876b', stroke: '#b45a43' }, g);
      S('rect', { x: 88, y: 60, width: 20, height: 12, rx: 2, fill: '#b45a43' }, g);
      S('rect', { x: 110, y: 94, width: 54, height: 26, rx: 12, fill: SKIN, stroke: SKIN_S }, g);
      waves(g, 80, 62); waves(g, 120, 62);
    },
    wire: function (g) {
      S('circle', { cx: 104, cy: 92, r: 10, fill: '#f2a43a', opacity: 0.45 }, g);
      S('path', { d: 'M56 124L104 92L152 124', fill: 'none', stroke: '#7d8494', 'stroke-width': 4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, g);
      L.arrow(g, 58, 110, 58, 82, { color: '#5a4097', width: 1.8 }); L.arrow(g, 150, 82, 150, 110, { color: '#5a4097', width: 1.8 });
      waves(g, 104, 78);
      S('text', { x: 104, y: 146, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#5a4097', text: '来回弯折' }, g);
    },
    stove: function (g) {
      S('rect', { x: 64, y: 138, width: 80, height: 8, rx: 2, fill: '#5b6475' }, g);
      [82, 104, 126].forEach(function (x) { S('path', { d: 'M' + x + ' 136c-6-6-4-11 0-16c4 5 6 10 0 16z', fill: '#4f8fd8' }, g); });
      S('rect', { x: 68, y: 86, width: 72, height: 34, rx: 4, fill: '#b9bec8', stroke: '#7d8494' }, g);
      S('rect', { x: 60, y: 82, width: 88, height: 6, rx: 3, fill: '#7d8494' }, g);
      waves(g, 90, 76, '#9aa0aa'); waves(g, 118, 76, '#9aa0aa');
    },
    slide: function (g) {
      S('path', { d: 'M48 58L66 58L148 138L160 138', fill: 'none', stroke: '#5a9fd4', 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
      S('line', { x1: 50, y1: 60, x2: 50, y2: 146, stroke: '#8d93a0', 'stroke-width': 3 }, g);
      S('circle', { cx: 98, cy: 70, r: 8, fill: SKIN, stroke: SKIN_S }, g);
      S('path', { d: 'M98 78l6 14l14 2', fill: 'none', stroke: '#c2603f', 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
      waves(g, 116, 106); waves(g, 126, 114);
      L.arrow(g, 72, 76, 92, 96, { color: '#5a4097', width: 1.6 });
    },
    egg: function (g) {
      S('path', { d: 'M60 96Q104 162 148 96Z', fill: '#dceaf6', stroke: '#7f9fc0', 'stroke-width': 1.6 }, g);
      S('ellipse', { cx: 104, cy: 108, rx: 12, ry: 15, fill: '#fbf4e6', stroke: '#c9a873' }, g);
      L.arrow(g, 118, 108, 134, 104, { color: HOT, width: 1.4, head: 6 }); L.arrow(g, 90, 108, 74, 104, { color: HOT, width: 1.4, head: 6 });
      waves(g, 104, 86);
    }
  };
  var WAYS = [
    { id: 'rub', name: '搓手取暖', kind: 'work', A: ['机械能', '双手来回搓'], B: ['内能', '手变热'], text: '两只手互相摩擦，克服摩擦力<b>做功</b>，机械能<b>转化</b>为内能，手的温度升高。' },
    { id: 'sun', name: '冬天晒太阳觉得暖和', kind: 'heat', A: ['高温物体', '太阳'], B: ['低温物体', '人'], text: '太阳温度比人高得多，能量从太阳<b>转移</b>到人身上，人的内能增加。没有谁在“使劲”，靠的是温度差，这是<b>热传递</b>。' },
    { id: 'piston', name: '压缩空气使棉花燃烧', kind: 'work', A: ['机械能', '迅速下压活塞'], B: ['内能', '筒内空气变热'], text: '迅速压下活塞，活塞对筒内空气<b>做功</b>，空气内能增大、温度升高，达到棉花的着火点，棉花就燃烧起来。机械能<b>转化</b>为内能。' },
    { id: 'ice', name: '冰块放进饮料，饮料变凉', kind: 'heat', A: ['高温物体', '饮料'], B: ['低温物体', '冰块'], text: '饮料温度高、冰块温度低，热量从饮料<b>转移</b>给冰块：饮料内能减少、变凉；冰块吸热熔化，内能增加。传过去的是热量，不是“冷”。' },
    { id: 'drill', name: '钻木取火', kind: 'work', A: ['机械能', '来回钻木头'], B: ['内能', '木头变热'], text: '木棒和木板反复摩擦，克服摩擦<b>做功</b>，机械能<b>转化</b>为内能，木头温度升到着火点就燃烧起来。' },
    { id: 'bag', name: '用热水袋暖手', kind: 'heat', A: ['高温物体', '热水袋'], B: ['低温物体', '手'], text: '热水袋温度比手高，热量从热水袋<b>转移</b>到手上：手的内能增加，热水袋的内能减少，慢慢变凉。' },
    { id: 'wire', name: '反复弯折铁丝，弯折处发烫', kind: 'work', A: ['机械能', '反复弯折'], B: ['内能', '弯折处变热'], text: '手反复弯折铁丝，对铁丝<b>做功</b>，弯折处内能增加、温度升高，机械能<b>转化</b>为内能。' },
    { id: 'stove', name: '用燃气灶烧水', kind: 'heat', A: ['高温物体', '火焰'], B: ['低温物体', '锅和水'], text: '火焰温度很高，热量通过锅底<b>转移</b>到水里，水的内能增加、温度升高，这是<b>热传递</b>。（燃气燃烧本身是化学能转化为内能，下一课再讲。）' },
    { id: 'slide', name: '从滑梯上滑下，屁股发热', kind: 'work', A: ['机械能', '往下滑'], B: ['内能', '裤子滑梯变热'], text: '往下滑时克服摩擦<b>做功</b>，一部分机械能<b>转化</b>为内能，裤子和滑梯表面都会变热。' },
    { id: 'egg', name: '煮熟的鸡蛋放进冷水里变凉', kind: 'heat', A: ['高温物体', '热鸡蛋'], B: ['低温物体', '冷水'], text: '鸡蛋温度高、冷水温度低，热量从鸡蛋<b>转移</b>到冷水里：鸡蛋内能减少、变凉，水的内能增加。' }
  ];
  var wi = Math.round(L.num(st.wi, 0, 0, WAYS.length - 1));
  var wAns = [];
  function wStats() {
    var done = 0, right = 0;
    WAYS.forEach(function (w, k) { if (wAns[k]) { done++; if (wAns[k] === w.kind) right++; } });
    return { done: done, right: right };
  }
  function box(g, x, y, lines, c) {
    S('rect', { x: x, y: y, width: 78, height: 50, rx: 10, fill: '#fff', stroke: c, 'stroke-width': 1.6 }, g);
    S('text', { x: x + 39, y: y + 20, 'font-size': 10, 'text-anchor': 'middle', fill: '#6b7385', text: lines[0] }, g);
    S('text', { x: x + 39, y: y + 37, 'font-size': 11, 'text-anchor': 'middle', fill: c, 'font-weight': 700, text: lines[1] }, g);
  }
  function drawWay() {
    var w = WAYS[wi], ans = wAns[wi];
    way.innerHTML = '';
    var defs = S('defs', {}, way), cp = S('clipPath', { id: 'way-clip' }, defs);
    S('rect', { x: 0, y: 0, width: 400, height: 220, rx: 14 }, cp);
    S('rect', { x: 0, y: 0, width: 400, height: 220, rx: 14, fill: '#fbfaf7' }, way);
    var root = S('g', { 'clip-path': 'url(#way-clip)' }, way);
    S('rect', { x: 12, y: 12, width: 186, height: 196, rx: 12, fill: '#fff', stroke: '#e0dce8' }, root);
    S('text', { x: 24, y: 30, 'font-size': 10, fill: '#8a8598', text: '场景 ' + (wi + 1) + ' / ' + WAYS.length }, root);
    ICON[w.id](S('g', {}, root));
    S('text', { x: 105, y: 176, 'font-size': 12, 'text-anchor': 'middle', fill: '#3b3548', 'font-weight': 700, text: w.name }, root);
    S('text', { x: 105, y: 196, 'font-size': 10, 'text-anchor': 'middle', fill: '#8a8598', text: ans ? '' : '做功？还是热传递？' }, root);
    if (!ans) {
      S('text', { x: 299, y: 112, 'font-size': 46, 'text-anchor': 'middle', fill: '#d9d3e4', 'font-weight': 700, text: '?' }, root);
      S('text', { x: 299, y: 146, 'font-size': 10.5, 'text-anchor': 'middle', fill: '#8a8598', text: '先点下面的按钮判断' }, root);
      S('text', { x: 299, y: 162, 'font-size': 10.5, 'text-anchor': 'middle', fill: '#8a8598', text: '再看能量怎么走' }, root);
    } else {
      var ok = ans === w.kind, isWork = w.kind === 'work', c = isWork ? '#5a4097' : '#c2603f';
      S('text', { x: 299, y: 32, 'font-size': 12, 'text-anchor': 'middle', fill: ok ? '#2f6a4a' : '#a4492b', 'font-weight': 700, text: ok ? '✓ 判断正确：' + (isWork ? '做功' : '热传递') : '✗ 应该是：' + (isWork ? '做功' : '热传递') }, root);
      box(root, 212, 60, w.A, isWork ? '#7a6aa8' : '#c2603f');
      box(root, 308, 60, w.B, isWork ? '#c2603f' : '#3f78b5');
      L.arrow(root, 292, 85, 306, 85, { color: c, width: 2.4, head: 8 });
      S('text', { x: 299, y: 54, 'font-size': 11, 'text-anchor': 'middle', fill: c, 'font-weight': 700, text: isWork ? '转化' : '转移' }, root);
      S('text', { x: 299, y: 136, 'font-size': 10.5, 'text-anchor': 'middle', fill: '#3b3548', text: isWork ? '能量换了一种形式' : '能量换了一个地方' }, root);
      S('text', { x: 299, y: 154, 'font-size': 10, 'text-anchor': 'middle', fill: '#6b7385', text: isWork ? '机械能 → 内能' : '内能从高温物体 → 低温物体' }, root);
      S('text', { x: 299, y: 172, 'font-size': 10, 'text-anchor': 'middle', fill: '#6b7385', text: isWork ? '关键词：摩擦、压缩、弯折' : '关键词：有温度差' }, root);
    }
    wayReadout();
  }
  function wayReadout() {
    var w = WAYS[wi], ans = wAns[wi], s = wStats();
    L.$('#w-name').textContent = w.name;
    L.$('#w-done').innerHTML = s.done + '<small>/ ' + WAYS.length + '</small>';
    L.$('#w-right').innerHTML = s.right + '<small>个</small>';
    if (!ans) {
      L.$('#w-badge').textContent = '待判断';
      L.$('#w-kind').textContent = '？';
      L.$('#w-energy').textContent = '？';
      L.$('#w-text').innerHTML = '想一想：是有东西在“使劲”（摩擦、压缩、弯折）让它变热，还是靠<b>温度差</b>，让能量从热的物体跑到冷的物体？';
    } else {
      var isWork = w.kind === 'work';
      L.$('#w-badge').textContent = ans === w.kind ? '判断正确' : '再记一下';
      L.$('#w-kind').textContent = isWork ? '做功' : '热传递';
      L.$('#w-energy').textContent = isWork ? '转化' : '转移';
      var t = w.text;
      if (s.done === WAYS.length) t += '<br><b>十个场景全部分完，答对 ' + s.right + ' 个。</b>' + (s.right >= 8 ? '做功看“使劲”，热传递看“温差”，你已经分得很清楚了。' : '可以点“重新分类”再来一遍。');
      L.$('#w-text').innerHTML = t;
    }
    save();
  }
  function answer(k) { if (!wAns[wi]) wAns[wi] = k; drawWay(); }
  L.$('#w-work').addEventListener('click', function () { answer('work'); });
  L.$('#w-heat').addEventListener('click', function () { answer('heat'); });
  L.$('#w-next').addEventListener('click', function () {
    // 优先跳到还没分类的场景
    for (var k = 1; k <= WAYS.length; k++) { var j = (wi + k) % WAYS.length; if (!wAns[j]) { wi = j; drawWay(); return; } }
    wi = (wi + 1) % WAYS.length; drawWay();
  });
  L.$('#w-restart').addEventListener('click', function () { wAns = []; wi = 0; drawWay(); });

  function save() { L.setState({ m: mat, kg: kg, t: L.fmt(tm, 1), mm: mMode, tl: CUPS[0].T, tr: CUPS[1].T, lp: pressed ? 1 : 0, hk: hooks, wi: wi }); }

  drawCap();
  stopCap();
  setMode(mMode);
  drawWay();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '让水和沙子各吸收 6300 J 热量',
      desc: '“和水比的”选沙子，把加热时间调到两杯各吸收 6300 J 热量的时刻（加热器每分钟放出 2100 J），再看谁升温多。',
      label: '在比热容实验里操作',
      button: '检查加热时间',
      check: function () {
        var Q = QPM * tm;
        if (mat !== 'sand') return { ok: false, msg: '先把“和水比的”换成<b>沙子</b>。' };
        if (Math.abs(tm - 3) < 0.051) return { ok: true, msg: '加热 3 min，Q = 2100 J/min × 3 min = 6300 J。质量都是 ' + L.fmt(kg * 1000, 0) + ' g 时，水升高 ' + L.fmt(6300 / (4200 * kg), 1) + ' ℃，沙子升高 ' + L.fmt(6300 / (920 * kg), 1) + ' ℃。吸收的热量相同，沙子升温约是水的 4.6 倍。' };
        return { ok: false, msg: '现在两杯各吸收了 ' + Math.round(Q) + ' J，' + (Q < 6300 ? '还不够' : '已经超过了') + '。6300 J ÷ 2100 J/min = 几分钟？' };
      }
    },
    {
      level: 'base',
      title: '让左杯的墨水散得比右杯快',
      desc: '在“墨水扩散”里，把左杯调到 70 ℃ 以上、右杯调到 20 ℃ 以下，点“滴入墨水”（或“重新滴墨水”），等几秒再检查。',
      label: '在墨水扩散模型里操作',
      button: '检查两杯墨水',
      check: function () {
        if (mMode !== 'diff') return { ok: false, msg: '先在“看什么”里选<b>墨水扩散</b>。' };
        var A = CUPS[0], B = CUPS[1];
        if (A.T < 70 || B.T > 20) return { ok: false, msg: '左杯现在 ' + A.T + ' ℃、右杯 ' + B.T + ' ℃。把左杯调到 70 ℃ 以上，右杯调到 20 ℃ 以下。' };
        if (!dropped || mt < 3) return { ok: false, msg: '温度调好了。点“' + (dropped ? '重新滴墨水' : '滴入墨水') + '”，等至少 3 秒再检查。' };
        if (spreadOf(A) <= spreadOf(B)) return { ok: false, msg: '墨水是在温度调好之前滴的吧？点“重新滴墨水”再观察一次。' };
        return { ok: true, msg: '左杯水温高，分子无规则运动更剧烈，墨水扩散得更快。<b>温度越高，分子热运动越剧烈</b>，和是哪个杯子无关。' };
      }
    },
    {
      level: 'base',
      title: '关于内能，下列说法正确的是',
      desc: '想一想：分子会不会有“停下来”的时候？',
      options: ['一切物体在任何温度下都有内能', '0 ℃ 的冰没有内能', '静止在桌上的书没有内能', '温度低的物体一定比温度高的物体内能小'],
      answer: 0,
      hint: '内能是所有分子热运动的动能和分子势能的总和。分子什么时候停止运动？',
      explain: '分子永远在做无规则运动，所以<b>一切物体在任何温度下都有内能</b>，0 ℃ 的冰也有。书静止不动，说的是机械能里的动能为零，分子照样在动，内能不为零。内能还和质量、状态有关，温度低的物体内能不一定小。'
    },
    {
      level: 'mid',
      title: '把十个场景全部分类，至少答对 8 个',
      desc: '在“做功，还是热传递？”里逐个判断，每个场景只算第一次的选择。',
      label: '在分类小游戏里操作',
      button: '检查分类结果',
      check: function () {
        var s = wStats();
        if (s.done < WAYS.length) return { ok: false, msg: '还有 ' + (WAYS.length - s.done) + ' 个场景没分类。点“下一个场景”继续。' };
        if (s.right < 8) return { ok: false, msg: '十个场景答对 ' + s.right + ' 个。记住：靠摩擦、压缩、弯折“使劲”是<b>做功</b>；靠温度差让能量从热的跑到冷的是<b>热传递</b>。点“重新分类”再来一遍。' };
        return { ok: true, msg: '十个答对 ' + s.right + ' 个。做功是其他形式的能<b>转化</b>为内能，热传递是内能从高温物体<b>转移</b>到低温物体，两种方式改变内能的效果相同。' };
      }
    },
    {
      level: 'mid',
      title: '质量 2 kg 的水，温度从 20 ℃ 升高到 70 ℃，吸收的热量是',
      desc: 'c<sub>水</sub> = 4.2×10³ J/(kg·℃)。',
      options: ['4.2×10⁵ J', '5.88×10⁵ J', '1.68×10⁵ J', '2.1×10⁵ J'],
      answer: 0,
      hint: '先算升高了多少摄氏度：Δt = 70 ℃ − 20 ℃。',
      explain: 'Q = cmΔt = 4.2×10³ J/(kg·℃) × 2 kg × (70 ℃ − 20 ℃) = <b>4.2×10⁵ J</b>。5.88×10⁵ J 是把末温 70 ℃ 当成了 Δt；1.68×10⁵ J 是把初温 20 ℃ 当成了 Δt；2.1×10⁵ J 是漏乘了质量 2 kg。'
    },
    {
      level: 'mid',
      title: '深圳靠海，昼夜温差比内陆城市小，主要原因是',
      desc: '回想水和沙子的加热实验。',
      options: ['水的比热容比砂石大，吸收或放出同样多的热量，温度变化小', '海水的密度比砂石大', '海边的太阳光比内陆弱', '海水的温度比砂石高，所以内能大'],
      answer: 0,
      hint: '质量相同、吸放热相同，Δt = Q ÷ (cm)，c 大的温度变化怎样？',
      explain: '水的<b>比热容大</b>：白天吸收同样多的热量，海水升温少；夜里放出同样多的热量，海水降温也少，所以沿海昼夜温差小。这和密度无关；海边阳光并不比内陆弱；“温度高内能就大”本身也不成立，而且和温差大小无关。'
    },
    {
      level: 'trap',
      title: '下列关于热量的说法，正确的是',
      desc: '注意“热量”这个词能跟哪些动词搭配。',
      options: ['热传递时，热量从高温物体传向低温物体', '温度高的物体含有的热量多', '一杯水温度越高，具有的热量越多', '热量总是从内能大的物体传给内能小的物体'],
      answer: 0,
      hint: '热量是在热传递<b>过程中</b>传递的能量，能说物体“含有”它吗？热传递看的是温度还是内能？',
      explain: '热量是<b>过程量</b>，只能说“吸收”或“放出”热量，不能说“含有”“具有”热量，所以第二、三项都错。热传递的条件是有<b>温度差</b>，热量从高温物体传向低温物体；内能大的物体温度不一定高（一大桶温水对一小杯开水），所以最后一项也错。'
    },
    {
      level: 'trap',
      title: '下列说法正确的是',
      desc: '温度、热量、内能三者的关系，最容易张冠李戴。',
      options: ['物体吸收热量，温度不一定升高', '物体温度升高，一定是吸收了热量', '物体内能增加，温度一定升高', '温度高的物体，内能一定大'],
      answer: 0,
      hint: '回想第 3 课物态变化：冰熔化、水沸腾时一直吸热，温度怎样？',
      explain: '晶体熔化、液体沸腾时一直<b>吸热</b>，内能增加，温度却<b>不变</b>，所以“吸热温度不一定升高”是对的，“内能增加温度一定升高”是错的。温度升高也可能是<b>做功</b>造成的（搓手），不一定吸了热。内能还和质量、状态有关，温度高的物体内能不一定大。'
    }
  ]);
})();
