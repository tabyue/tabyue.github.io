/* 物理互动馆 · 第 8 课 运动和力 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();
  var G = 10;   // g 取 10 N/kg

  /* 每张图一个 clipPath：小车、钩码、测力计跑出画布时都裁掉 */
  function clipDefs(el, id, w, h) {
    var defs = S('defs', {}, el), cp = S('clipPath', { id: id }, defs);
    S('rect', { x: 0, y: 0, width: w, height: h, rx: 14 }, cp);
    return defs;
  }
  /* 动画时读数每帧都在算，文字没变就不重写，免得读屏软件一直播报 */
  function setText(el, h) { if (el._t !== h) { el._t = h; el.innerHTML = h; } }

  /* ========== ① 斜面小车：阻力对运动的影响 ========== */
  var SURF = {
    towel: { name: '毛巾', short: '毛', k: 2.5, drag: '最大', top: '#e2cba9' },
    cotton: { name: '棉布', short: '棉', k: 5, drag: '较大', top: '#ddd5ec' },
    wood: { name: '木板', short: '木', k: 11, drag: '较小', top: '#ecd8b0' },
    ideal: { name: '理想光滑面', short: '', k: Infinity, drag: '零', top: '#e3eef8' }
  };
  var ORDER = ['towel', 'cotton', 'wood', 'ideal'];
  var surf = SURF[st.s] ? st.s : 'towel';
  var hcm = Math.round(L.num(st.h, 10, 5, 15));
  var BX = 130, BY = 172;      // 斜面底端
  var PX = 8, PY = 7;          // 斜面上：高度每 1 cm 对应水平 8 px、竖直 7 px
  var KX = 1.5;                // 水平面上 1 cm = 1.5 px
  var SLOW = 0.45;             // 慢放
  var SIN = 7 / Math.hypot(7, 8), ANG = Math.atan2(7, 8) * 180 / Math.PI;
  var rec = {}, run = { phase: 'ready', sr: 0, x: 0, v: 0 };
  var ramp = L.$('#ramp'), rampDefs = clipDefs(ramp, 'ramp-clip', 400, 230), carG = null, rampAnim = null;

  function rampLen() { return hcm / 100 / SIN; }          // 斜面上滑过的长度（m）
  function v0() { return Math.sqrt(2 * G * hcm / 100); }   // 斜面阻力不计：v = √(2gh)
  function slideCm() { return SURF[surf].k * hcm; }

  function texture(g) {
    var x;
    if (surf === 'towel') for (x = 133; x < 400; x += 6) S('circle', { cx: x, cy: 178, r: 1.7, fill: 'none', stroke: '#b8956a', 'stroke-width': 0.8 }, g);
    else if (surf === 'cotton') for (x = 130; x < 400; x += 6) S('line', { x1: x, y1: 184, x2: x + 6, y2: 172, stroke: '#b4a8d2', 'stroke-width': 0.8 }, g);
    else if (surf === 'wood') [176, 180].forEach(function (y) { S('path', { d: 'M130 ' + y + 'Q200 ' + (y - 2) + ' 270 ' + y + 'T410 ' + y, fill: 'none', stroke: '#cfb27e', 'stroke-width': 0.8 }, g); });
    else S('line', { x1: 134, y1: 174.5, x2: 400, y2: 174.5, stroke: '#fff', 'stroke-width': 1.5, opacity: 0.9 }, g);
  }

  function drawRamp() {
    ramp.innerHTML = ''; ramp.appendChild(rampDefs);
    S('rect', { x: 0, y: 0, width: 400, height: 230, rx: 14, fill: '#fbfaf7' }, ramp);
    var g = S('g', { 'clip-path': 'url(#ramp-clip)' }, ramp);
    // 斜面
    S('path', { d: 'M10 67L130 172L10 172z', fill: '#efe4cf', stroke: '#c9a873', 'stroke-width': 1.2 }, g);
    S('rect', { x: 4, y: BY, width: BX - 4, height: 12, fill: '#efe4cf' }, g);
    // 水平面
    S('rect', { x: BX, y: BY, width: 275, height: 12, fill: SURF[surf].top, stroke: '#c9b79a', 'stroke-width': 1 }, g);
    texture(g);
    S('rect', { x: 4, y: 184, width: 400, height: 5, fill: '#ddd6c8' }, g);
    // 刻度尺：从斜面底端量起
    for (var c = 0; c <= 170; c += 10) {
      var x = BX + c * KX, big = c % 50 === 0;
      S('line', { x1: x, y1: 191, x2: x, y2: big ? 199 : 195, stroke: '#a39cb3', 'stroke-width': 1 }, g);
      if (big) S('text', { x: x, y: 210, 'font-size': 9, 'text-anchor': 'middle', fill: '#8a8598', text: c }, g);
    }
    S('text', { x: 394, y: 210, 'font-size': 9, 'text-anchor': 'end', fill: '#8a8598', text: 'cm' }, g);
    // 已做过的记录
    ORDER.forEach(function (k) {
      if (k === 'ideal' || rec[k] === undefined) return;
      var mx = BX + rec[k] * KX;
      S('line', { x1: mx, y1: BY - 4, x2: mx, y2: 190, stroke: '#a4492b', 'stroke-width': 1.2, 'stroke-dasharray': '3 2' }, g);
      S('text', { x: mx, y: 223, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#a4492b', 'font-weight': 600, text: SURF[k].short }, g);
    });
    // 释放处
    var rx = BX - hcm * PX, ry = BY - hcm * PY;
    S('line', { x1: rx, y1: ry, x2: rx, y2: BY, stroke: '#7a6aa8', 'stroke-width': 1, 'stroke-dasharray': '3 3' }, g);
    S('circle', { cx: rx, cy: ry, r: 2.5, fill: '#5a4097' }, g);
    S('text', { x: rx + 14, y: ry - 28, 'font-size': 10, fill: '#5a4097', 'font-weight': 600, text: '释放处 h = ' + hcm + ' cm' }, g);
    if (run.phase === 'done' && surf === 'ideal') S('text', { x: 392, y: 160, 'font-size': 10, 'text-anchor': 'end', fill: '#a4492b', 'font-weight': 600, text: '→ 以 ' + L.fmt(v0(), 2) + ' m/s 一直滑下去' }, g);
    // 小车：原点在两轮着地处的中点
    carG = S('g', {}, g);
    S('rect', { x: -12, y: -16, width: 24, height: 10, rx: 3, fill: '#7a6aa8' }, carG);
    S('rect', { x: -5, y: -21, width: 11, height: 6, rx: 2, fill: '#b3a7d0' }, carG);
    S('circle', { cx: -7, cy: -4, r: 4, fill: '#3e3550' }, carG);
    S('circle', { cx: 7, cy: -4, r: 4, fill: '#3e3550' }, carG);
    placeCar();
  }
  function placeCar() {
    var x, y, a;
    if (run.phase === 'ready' || run.phase === 'ramp') {
      var f = run.sr / rampLen(), rx = BX - hcm * PX, ry = BY - hcm * PY;
      x = rx + (BX - rx) * f; y = ry + (BY - ry) * f; a = ANG;
    } else { x = BX + run.x * 100 * KX; y = BY; a = 0; }
    carG.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + a.toFixed(1) + ')');
  }

  function rampStep(dt) {
    dt *= SLOW;
    if (run.phase === 'ramp') {
      run.v += G * SIN * dt; run.sr += run.v * dt;
      if (run.sr >= rampLen()) { run.sr = rampLen(); run.phase = 'flat'; run.v = v0(); run.x = 0; }
    } else if (run.phase === 'flat') {
      if (surf === 'ideal') {
        run.x += run.v * dt;      // 没有阻力：速度不变
        if (BX + run.x * 100 * KX > 430) { run.phase = 'done'; rec.ideal = true; }
      } else {
        var s = slideCm() / 100, a = v0() * v0() / (2 * s);   // 阻力恒定 → 匀减速
        run.v = Math.max(0, run.v - a * dt);
        run.x = (v0() * v0() - run.v * run.v) / (2 * a);
        if (run.v <= 0) { run.x = s; run.phase = 'done'; rec[surf] = slideCm(); }
      }
    }
  }
  function stopRamp() { if (rampAnim) rampAnim.stop(); rampAnim = null; }
  function resetRamp() { stopRamp(); run = { phase: 'ready', sr: 0, x: 0, v: 0 }; drawRamp(); readRamp(); }
  function rampGo() {
    stopRamp();
    run = { phase: 'ramp', sr: 0, x: 0, v: 0 };
    if (L.REDUCED) {   // 减少动态效果：直接给结果
      run.phase = 'done';
      if (surf === 'ideal') { run.v = v0(); run.x = 3; rec.ideal = true; } else { run.v = 0; run.x = slideCm() / 100; rec[surf] = slideCm(); }
      drawRamp(); readRamp(); return;
    }
    drawRamp(); readRamp();
    rampAnim = L.loop(function (dt) {
      rampStep(dt);
      if (run.phase === 'done') { rampAnim = null; drawRamp(); readRamp(); return false; }
      placeCar(); readRamp();
    });
  }

  function readRamp() {
    var sf = SURF[surf];
    L.$('#h-out').textContent = hcm + ' cm';
    L.$('#ramp-badge').textContent = sf.name;
    L.$('#v0-out').innerHTML = L.qty(v0(), 'm/s', 2);
    L.$('#vnow-out').innerHTML = L.qty(run.v, 'm/s', 2);
    L.$('#drag-out').textContent = sf.drag;
    L.$('#s-out').innerHTML = run.phase !== 'done' ? '—' : (surf === 'ideal' ? '停不下来' : L.qty(slideCm(), 'cm', 1));
    L.$$('#run-table tbody tr').forEach(function (tr) {
      var k = tr.dataset.s;
      tr.classList.toggle('on', k === surf);
      tr.lastElementChild.textContent = rec[k] === undefined ? '—' : (k === 'ideal' ? '一直滑下去' : L.fmt(rec[k], 1) + ' cm');
    });
    var t;
    if (run.phase === 'ready') t = '小车停在 h = ' + hcm + ' cm 处。点「放手」，看它在' + sf.name + '上能滑多远。';
    else if (run.phase === 'ramp') t = '小车沿斜面加速滑下。从同一高度出发，到达水平面时的速度都是 ' + L.fmt(v0(), 2) + ' m/s。';
    else if (run.phase === 'flat') t = surf === 'ideal' ? '没有任何阻力，速度<b>一点也不减小</b>，小车在做匀速直线运动。' : '小车在' + sf.name + '上受到阻力，速度越来越小。';
    else if (surf === 'ideal') t = '小车滑出了画面。在理想光滑面上，它会以 ' + L.fmt(v0(), 2) + ' m/s 的速度<b>永远做匀速直线运动</b>——这正是牛顿第一定律推理出的结论。';
    else {
      t = '在' + sf.name + '上滑行 ' + L.fmt(slideCm(), 1) + ' cm 后停下。';
      t += (rec.towel !== undefined && rec.cotton !== undefined && rec.wood !== undefined)
        ? '三种表面都做过了：<b>阻力越小，速度减小得越慢，滑得越远</b>。再试试理想光滑面。'
        : '换一种表面，从同一高度再放一次，比一比。';
    }
    setText(L.$('#ramp-text'), t);
    save();
  }

  L.chips(L.$('#surf-chips'), ORDER.map(function (k) { return { label: SURF[k].name, value: k }; }), surf, function (v) { surf = v; resetRamp(); });
  var hIn = L.$('#h-in');
  hIn.value = hcm;
  L.bindRange(hIn, function (v) { hcm = v; rec = {}; resetRamp(); });
  L.$('#ramp-go').addEventListener('click', rampGo);
  L.$('#ramp-reset').addEventListener('click', resetRamp);

  /* ========== ② 二力平衡：小卡片 ========== */
  var cardSvg = L.$('#card'), cardDefs = clipDefs(cardSvg, 'card-clip', 400, 230);
  var W1 = 0.5;                       // 每个钩码重 0.5 N（50 g）
  var nl = Math.round(L.num(st.l, 2, 1, 5)), nr = Math.round(L.num(st.r, 3, 1, 5));
  var tw = Math.round(L.num(st.a, 0, 0, 45) / 5) * 5, cut = st.c === '1';
  var CY = 67, PLX = 46, PRX = 354, PR = 9, HOLE = 26, DXMAX = 55, GAPMAX = 80;
  var cs = null, cardAnim = null;

  function drawCard() {
    cardSvg.innerHTML = ''; cardSvg.appendChild(cardDefs);
    S('rect', { x: 0, y: 0, width: 400, height: 230, rx: 14, fill: '#fbfaf7' }, cardSvg);
    var g = S('g', { 'clip-path': 'url(#card-clip)' }, cardSvg);
    S('rect', { x: 0, y: 218, width: 400, height: 12, fill: '#e8e1d3' }, g);
    // 支架和滑轮
    [[PLX, 1], [PRX, -1]].forEach(function (p) {
      var rodX = p[0] + 6 * p[1];
      S('line', { x1: rodX, y1: CY + PR, x2: rodX, y2: 218, stroke: '#a39cb3', 'stroke-width': 3 }, g);
      S('circle', { cx: p[0], cy: CY + PR, r: PR, fill: '#eceaf1', stroke: '#8a8598', 'stroke-width': 1.5 }, g);
      S('circle', { cx: p[0], cy: CY + PR, r: 2, fill: '#8a8598' }, g);
    });
    // 钩码：卡片往右走，左边钩码被提起、右边钩码下降；剪开后两边都下降
    var lDrop = cut ? cs.gap / 2 : -cs.dx, rDrop = cut ? cs.gap / 2 : cs.dx;
    function hang(x, n, drop, side) {
      var top = 100 + drop;
      S('line', { x1: x, y1: CY + PR, x2: x, y2: top + 5, stroke: '#6b6478', 'stroke-width': 1.2 }, g);
      for (var i = 0; i < n; i++) S('rect', { x: x - 7, y: top + 5 + i * 11, width: 14, height: 10, rx: 2, fill: '#c8b27a', stroke: '#8d7a45', 'stroke-width': 1 }, g);
      S('text', { x: x + side * 10, y: top + 14, 'font-size': 9, 'text-anchor': side < 0 ? 'end' : 'start', fill: '#6b6478', text: L.fmt(n * W1, 1) + ' N' }, g);
    }
    hang(PLX - PR, nl, lDrop, -1);
    hang(PRX + PR, nr, rDrop, 1);
    // 卡片
    var cx = 200 + (cut ? 0 : cs.dx), a = cs.ang * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
    var half = cut ? cs.gap / 2 : 0;
    var hl = [cx - (HOLE + half) * ca, CY - (HOLE + half) * sa], hr = [cx + (HOLE + half) * ca, CY + (HOLE + half) * sa];
    S('line', { x1: hl[0], y1: hl[1], x2: PLX, y2: CY, stroke: '#6b6478', 'stroke-width': 1.2 }, g);
    S('line', { x1: hr[0], y1: hr[1], x2: PRX, y2: CY, stroke: '#6b6478', 'stroke-width': 1.2 }, g);
    var cg = S('g', { transform: 'translate(' + cx.toFixed(1) + ' ' + CY + ') rotate(' + cs.ang.toFixed(1) + ')' }, g);
    if (cut) {
      S('rect', { x: -32 - half, y: -23, width: 31, height: 46, rx: 4, fill: '#fff6dc', stroke: '#c9a873', 'stroke-width': 1.4 }, cg);
      S('rect', { x: 1 + half, y: -23, width: 31, height: 46, rx: 4, fill: '#fff6dc', stroke: '#c9a873', 'stroke-width': 1.4 }, cg);
      if (cs.gap < 1) S('text', { x: 0, y: 36, 'font-size': 9, 'text-anchor': 'middle', fill: '#a4492b', text: '已剪开' }, cg);
    } else {
      S('rect', { x: -32, y: -23, width: 64, height: 46, rx: 4, fill: '#fff6dc', stroke: '#c9a873', 'stroke-width': 1.4 }, cg);
      S('text', { x: 0, y: 14, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#8d7a45', text: '小卡片' }, cg);
    }
    S('circle', { cx: -HOLE - half, cy: 0, r: 2.5, fill: '#fff', stroke: '#8a8598' }, cg);
    S('circle', { cx: HOLE + half, cy: 0, r: 2.5, fill: '#fff', stroke: '#8a8598' }, cg);
    // 力的作用线：扭转后两条线错开了
    var ends = [[hl, PLX, nl * W1, '#c2603f', 'F₁'], [hr, PRX, nr * W1, '#3f8a6a', 'F₂']];
    if (Math.abs(cs.ang) > 0.5) ends.forEach(function (p) {
      var h = p[0], tx = p[1] - h[0], ty = CY - h[1], len = Math.hypot(tx, ty) || 1;
      S('line', { x1: h[0] - tx / len * 200, y1: h[1] - ty / len * 200, x2: h[0] + tx / len * 200, y2: h[1] + ty / len * 200, stroke: p[3], 'stroke-width': 1, 'stroke-dasharray': '4 4', opacity: 0.55 }, g);
    });
    // 两个拉力（1 N = 30 px）；标签放在卡片外侧，不压住卡片
    ends.forEach(function (p, i) {
      var h = p[0], tx = p[1] - h[0], ty = CY - h[1], len = Math.hypot(tx, ty) || 1, Lf = p[2] * 30;
      L.arrow(g, h[0], h[1], h[0] + tx / len * Lf, h[1] + ty / len * Lf, { color: p[3], width: 2.4, head: 8 });
      var edge = cx + (i ? 1 : -1) * (36 + half + 14 * Math.abs(sa));
      S('text', { x: edge, y: Math.min(h[1], CY) - 12, 'font-size': 10, 'text-anchor': i ? 'start' : 'end', fill: p[3], 'font-weight': 600, text: p[4] + ' = ' + L.fmt(p[2], 1) + ' N' }, g);
    });
    if (cs.settled) S('text', { x: 200, y: 160, 'font-size': 11, 'text-anchor': 'middle', fill: '#5a4097', 'font-weight': 600, text: '松手后：' + outcome().short }, g);
  }

  function conds() { return { same: !cut, equal: nl === nr, opp: true, line: tw === 0 }; }
  function balanced() { var c = conds(); return c.same && c.equal && c.opp && c.line; }
  function outcome() {
    var dir = nr > nl ? '右' : '左';
    if (cut) return { short: '两半各自被拉走', text: '剪开后变成两个物体，每一半只受一个力，被各自拉走。二力平衡要求两个力<b>作用在同一物体上</b>。' };
    if (nl !== nr && tw) return { short: '先转回来，再向' + dir + '加速', text: '两个力既不相等，又不在同一直线上：卡片先转回来，同时被拉向' + dir + '边，越走越快。' };
    if (nl !== nr) return { short: '向' + dir + '加速运动', text: '两个力不相等，合力 ' + L.fmt(Math.abs(nr - nl) * W1, 1) + ' N、方向向' + dir + '，卡片向' + dir + '<b>加速运动</b>，运动状态改变了。' };
    if (tw) return { short: '转回来后才静止', text: '两个力大小相等、方向相反，但<b>不在同一直线上</b>，卡片会转回来，直到两根线在同一直线上才停住。' };
    return { short: '保持静止', text: '卡片静止不动：两个力作用在同一物体上，<b>大小相等、方向相反、作用在同一直线上</b>，彼此平衡，合力为零。' };
  }

  function stopCard() { if (cardAnim) cardAnim.stop(); cardAnim = null; }
  function resetCard() {
    stopCard();
    cs = { dx: 0, vx: 0, ang: tw, va: 0, gap: 0, vg: 0, released: false, settled: false };
    drawCard(); readCard();
  }
  function settleCard() {
    cardAnim = null;
    cs.ang = 0; cs.va = 0; cs.settled = true;
    if (cut) cs.gap = GAPMAX; else if (nr !== nl) cs.dx = DXMAX * (nr > nl ? 1 : -1);
    drawCard(); readCard();
  }
  function cardGo() {
    resetCard();
    cs.released = true;
    if (L.REDUCED) { settleCard(); return; }
    var t = 0;
    readCard();
    cardAnim = L.loop(function (dt) {
      t += dt;
      var Fl = nl * W1, Fr = nr * W1;
      if (cut) { cs.vg += (Fl + Fr) * 60 * dt; cs.gap = Math.min(GAPMAX, cs.gap + cs.vg * dt); }
      else {
        cs.vx += (Fr - Fl) * 120 * dt; cs.dx += cs.vx * dt;
        if (Math.abs(cs.dx) >= DXMAX) { cs.dx = DXMAX * (cs.dx > 0 ? 1 : -1); cs.vx = 0; }
      }
      // 两力不共线时会转回来（带一点阻尼）
      cs.va += (-(Fl + Fr) * 14 * cs.ang - 3.2 * cs.va) * dt; cs.ang += cs.va * dt;
      var moved = cut ? cs.gap >= GAPMAX : (Fr === Fl || Math.abs(cs.dx) >= DXMAX);
      if ((moved && Math.abs(cs.ang) < 0.4 && Math.abs(cs.va) < 1) || t > 6) { settleCard(); return false; }
      drawCard();
    });
  }

  function readCard() {
    L.$('#nl-out').textContent = nl + ' 个';
    L.$('#nr-out').textContent = nr + ' 个';
    L.$('#tw-out').textContent = tw + '°';
    var c = conds(), ok = balanced(), net = (nr - nl) * W1;
    L.$('#bal-badge').textContent = ok ? '能静止' : '不能静止';
    L.$('#bal-f1').innerHTML = L.qty(nl * W1, 'N', 1);
    L.$('#bal-f2').innerHTML = L.qty(nr * W1, 'N', 1);
    if (cut) L.$('#bal-net').innerHTML = '—<small>已成两个物体，各受一个力</small>';
    else if (net === 0) L.$('#bal-net').innerHTML = '0<small>N（' + L.fmt(nr * W1, 1) + ' N − ' + L.fmt(nl * W1, 1) + ' N）</small>';
    else L.$('#bal-net').innerHTML = L.fmt(Math.abs(net), 1) + '<small>N，向' + (net > 0 ? '右' : '左') + '（' + L.fmt(Math.max(nl, nr) * W1, 1) + ' N − ' + L.fmt(Math.min(nl, nr) * W1, 1) + ' N）</small>';
    L.$$('#cond-list li').forEach(function (li) {
      var yes = c[li.dataset.c];
      li.className = yes ? 'yes' : 'no';
      li.querySelector('i').textContent = yes ? '✓' : '✗';
    });
    var t;
    if (cs.settled) t = outcome().text;
    else if (cs.released) t = '卡片在动……';
    else if (ok) t = '四个条件都满足。猜一猜：松手后卡片会怎样？点「松手」验证。';
    else {
      var miss = [];
      if (!c.same) miss.push('同一物体');
      if (!c.equal) miss.push('大小相等');
      if (!c.line) miss.push('同一直线');
      t = '还差“' + miss.join('”“') + '”。先猜猜松手后卡片会怎样，再点「松手」。';
    }
    setText(L.$('#bal-text'), t);
    save();
  }

  var nlIn = L.$('#nl-in'), nrIn = L.$('#nr-in'), twIn = L.$('#tw-in'), cutBtn = L.$('#cut-btn');
  nlIn.value = nl; nrIn.value = nr; twIn.value = tw;
  L.bindRange(nlIn, function (v) { nl = v; resetCard(); });
  L.bindRange(nrIn, function (v) { nr = v; resetCard(); });
  L.bindRange(twIn, function (v) { tw = v; resetCard(); });
  function paintCut() { cutBtn.setAttribute('aria-pressed', String(cut)); cutBtn.textContent = cut ? '把卡片粘回去' : '剪开卡片'; }
  cutBtn.addEventListener('click', function () { cut = !cut; paintCut(); resetCard(); });
  L.$('#card-go').addEventListener('click', cardGo);
  L.$('#card-reset').addEventListener('click', resetCard);
  paintCut();

  /* ========== ③ 滑动摩擦力 ========== */
  var fric = L.$('#fric'), fricDefs = clipDefs(fric, 'fric-clip', 400, 200);
  var FS = { wood: { name: '木板', mu: 0.3 }, towel: { name: '毛巾', mu: 0.6 } };
  var LAY = { flat: { name: '平放', h: 30, dd: 9, area: 60 }, side: { name: '侧放', h: 60, dd: 4.5, area: 30 } };  // 木块 10 cm × 6 cm × 3 cm
  var fs = FS[st.m] ? st.m : 'wood';
  var nw = Math.round(L.num(st.w, 0, 0, 2));
  var lay = LAY[st.o] ? st.o : 'flat';
  var pull = Math.round(L.num(st.F, 0, 0, 6) * 10) / 10;
  var GB = 4, GW = 2;                 // 木块重 4 N，每个砝码重 2 N
  var X0 = 24, XMAX = 120, PXM = 100; // 木块起点、最远位移（px），到头时测力计和手仍在画面里；1 m = 100 px
  var blk = { x: 0, v: 0, end: false }, fricAnim = null;

  function press() { return GB + nw * GW; }
  function fk() { return Math.round(FS[fs].mu * press() * 10) / 10; }
  /* still：拉不动；even：匀速；accel：加速 */
  function fmode() { return pull < fk() - 0.05 ? 'still' : (pull <= fk() + 0.05 ? 'even' : 'accel'); }
  function sliding() { return !blk.end && (fmode() !== 'still' || blk.v > 0); }

  function drawFric() {
    fric.innerHTML = ''; fric.appendChild(fricDefs);
    S('rect', { x: 0, y: 0, width: 400, height: 200, rx: 14, fill: '#fbfaf7' }, fric);
    var g = S('g', { 'clip-path': 'url(#fric-clip)' }, fric);
    // 木板桌面
    S('rect', { x: 0, y: 140, width: 400, height: 18, fill: '#ead6ae', stroke: '#c9a873', 'stroke-width': 1 }, g);
    for (var i = 0; i < 3; i++) { var yy = 145 + i * 4; S('path', { d: 'M0 ' + yy + 'Q100 ' + (yy - 2) + ' 200 ' + yy + 'T400 ' + yy, fill: 'none', stroke: '#d4b98a', 'stroke-width': 0.8 }, g); }
    var top = 140;
    if (fs === 'towel') {
      top = 134;
      S('rect', { x: 0, y: 134, width: 400, height: 6, fill: '#e2cba9' }, g);
      for (var x = 3; x < 400; x += 6) S('circle', { cx: x, cy: 137, r: 1.6, fill: 'none', stroke: '#b8956a', 'stroke-width': 0.8 }, g);
    }
    var ly = LAY[lay], bx = X0 + blk.x, h = ly.h, dd = ly.dd, by = top - h;
    // 木块（斜二测画出顶面和右侧面）
    S('path', { d: 'M' + bx + ' ' + by + 'l' + dd + ' ' + (-dd) + 'h100l' + (-dd) + ' ' + dd + 'z', fill: '#d9b98a', stroke: '#9c7a4a', 'stroke-width': 1 }, g);
    S('path', { d: 'M' + (bx + 100) + ' ' + by + 'l' + dd + ' ' + (-dd) + 'v' + h + 'l' + (-dd) + ' ' + dd + 'z', fill: '#c9a46f', stroke: '#9c7a4a', 'stroke-width': 1 }, g);
    S('rect', { x: bx, y: by, width: 100, height: h, fill: '#e6c995', stroke: '#9c7a4a', 'stroke-width': 1 }, g);
    S('text', { x: bx + 50, y: by + h / 2 + 4, 'font-size': 10, 'text-anchor': 'middle', fill: '#7a5a2e', text: '木块 4 N（' + ly.name + '）' }, g);
    // 砝码
    for (var k = 0; k < nw; k++) {
      var wy = by - dd / 2 + 2 - 15 * (k + 1);
      S('rect', { x: bx + 50 + dd / 2 - 13, y: wy, width: 26, height: 14, rx: 3, fill: '#c8b27a', stroke: '#8d7a45', 'stroke-width': 1 }, g);
      S('text', { x: bx + 50 + dd / 2, y: wy + 10, 'font-size': 9, 'text-anchor': 'middle', fill: '#5b4a22', text: '2 N' }, g);
    }
    // 线和弹簧测力计（0 刻度在右端，挂钩被拉得越远示数越大）
    var sy = by + h / 2, hookX = bx + 100, sx = hookX + 18, Z = sx + 90, U = 13;
    S('line', { x1: hookX, y1: sy, x2: sx, y2: sy, stroke: '#6b6478', 'stroke-width': 1.3 }, g);
    S('rect', { x: sx, y: sy - 10, width: 100, height: 20, rx: 4, fill: '#f4f1fa', stroke: '#8a7fb0', 'stroke-width': 1.3 }, g);
    for (var q = 0; q <= 12; q++) {
      var tx = Z - q * U / 2;
      S('line', { x1: tx, y1: sy - 10, x2: tx, y2: sy - (q % 2 ? 6 : 3), stroke: '#8a7fb0', 'stroke-width': 1 }, g);
      if (q % 2 === 0) S('text', { x: tx, y: sy + 8, 'font-size': 9, 'text-anchor': 'middle', fill: '#5a4097', text: q / 2 }, g);
    }
    var px = Z - pull * U;
    S('path', { d: 'M' + px + ' ' + (sy - 10) + 'v6', stroke: '#c2603f', 'stroke-width': 2 }, g);
    S('path', { d: 'M' + (px - 3) + ' ' + (sy - 4) + 'h6l-3 4z', fill: '#c2603f' }, g);
    S('text', { x: sx + 50, y: sy - 14, 'font-size': 9, 'text-anchor': 'middle', fill: '#8a8598', text: '弹簧测力计（N）' }, g);
    S('circle', { cx: sx + 106, cy: sy, r: 5, fill: 'none', stroke: '#8a7fb0', 'stroke-width': 1.5 }, g);
    S('rect', { x: sx + 110, y: sy - 9, width: 22, height: 18, rx: 8, fill: '#f2d4b8', stroke: '#c99a72', 'stroke-width': 1 }, g);
    // 摩擦力：作用在木块底面，方向与相对运动（或运动趋势）方向相反
    var f = sliding() ? fk() : (blk.end ? 0 : pull);
    if (f > 0) {
      L.arrow(g, bx + 50, top + 9, bx + 50 - f * 13, top + 9, { color: '#a4492b', width: 2.2, head: 7 });
      S('text', { x: bx + 50, y: 176, 'font-size': 10, 'text-anchor': 'middle', fill: '#a4492b', 'font-weight': 600, text: (sliding() ? '滑动摩擦力 f = ' : '静摩擦力 f = ') + L.fmt(f, 1) + ' N' }, g);
    }
    if (blk.v > 0) {
      var vy = by - dd - nw * 15 - 10;
      L.arrow(g, bx + 30, vy, bx + 70, vy, { color: '#5a4097', width: 1.8, head: 7, label: 'v', lx: 4, ly: 4 });
    }
  }

  function fricStep(dt) {
    if (blk.end) return false;
    var md = fmode(), m = press() / G;
    if (md === 'even') { if (blk.v < 0.3) blk.v = 0.3; }        // 先让它动起来，再保持匀速
    else blk.v = Math.max(0, blk.v + (pull - fk()) / m * 0.3 * dt);  // 加速或减速（慢放）
    blk.x += blk.v * PXM * dt;
    if (blk.x >= XMAX) { blk.x = XMAX; blk.v = 0; blk.end = true; }
    return blk.v > 0;
  }
  function ensureFric() {
    if (L.REDUCED || fricAnim || blk.end) return;
    if (fmode() === 'still' && blk.v <= 0) return;
    fricAnim = L.loop(function (dt) {
      var moving = fricStep(dt);
      drawFric(); readFric();
      if (!moving) { fricAnim = null; return false; }
    });
  }
  function readFric() {
    var md = fmode(), f = fk(), ly = LAY[lay];
    L.$('#pull-out').textContent = L.fmt(pull, 1) + ' N';
    L.$('#fc-read').innerHTML = L.qty(pull, 'N', 1);
    L.$('#fc-press').innerHTML = L.qty(press(), 'N', 0);
    L.$('#fc-area').innerHTML = L.qty(ly.area, 'cm²', 0);
    var sl = sliding();
    L.$('#fc-f-label').textContent = sl ? '滑动摩擦力' : '静摩擦力';
    L.$('#fc-f').innerHTML = L.qty(sl ? f : (blk.end ? 0 : pull), 'N', 1);
    var badge, t;
    if (blk.end) { badge = '到头了'; t = '木块已经拉到头了，点「放回起点」再拉一次。'; }
    else if (md === 'still' && blk.v > 0) { badge = '减速'; t = '拉力小于滑动摩擦力，木块越来越慢，最后会停下。'; }
    else if (md === 'still') {
      badge = '静止';
      t = pull === 0 ? '还没用力。慢慢加大拉力，看木块什么时候被拉动。'
        : '拉力 ' + L.fmt(pull, 1) + ' N 还拉不动木块。木块静止，受到的<b>静摩擦力</b>和拉力平衡，也是 ' + L.fmt(pull, 1) + ' N。';
    } else if (md === 'even') {
      badge = '匀速直线';
      t = '木块做<b>匀速直线运动</b>，拉力和滑动摩擦力是一对平衡力：f = F = ' + L.fmt(f, 1) + ' N，这时示数就是摩擦力。压力 ' + press() + ' N、接触面是' + FS[fs].name + '，平放、侧放都是这个值。';
    } else {
      badge = '加速';
      t = '拉力 ' + L.fmt(pull, 1) + ' N 大于滑动摩擦力 ' + L.fmt(f, 1) + ' N，木块<b>加速</b>。示数不等于摩擦力——所以实验必须匀速拉。';
    }
    L.$('#fc-badge').textContent = badge;
    setText(L.$('#fc-text'), t);
    save();
  }
  function fricChanged() { drawFric(); readFric(); ensureFric(); }

  L.chips(L.$('#fs-chips'), [{ label: '木板', value: 'wood' }, { label: '毛巾', value: 'towel' }], fs, function (v) { fs = v; fricChanged(); });
  L.chips(L.$('#wt-chips'), [{ label: '不加', value: '0' }, { label: '1 个（2 N）', value: '1' }, { label: '2 个（4 N）', value: '2' }], String(nw), function (v) { nw = +v; fricChanged(); });
  L.chips(L.$('#lay-chips'), [{ label: '平放 60 cm²', value: 'flat' }, { label: '侧放 30 cm²', value: 'side' }], lay, function (v) { lay = v; fricChanged(); });
  var pullIn = L.$('#pull-in');
  pullIn.value = pull;
  L.bindRange(pullIn, function (v) { pull = v; fricChanged(); });
  L.$('#fc-reset').addEventListener('click', function () {
    if (fricAnim) fricAnim.stop();
    fricAnim = null; blk = { x: 0, v: 0, end: false };
    fricChanged();
  });

  function save() {
    if (!cs) return;
    L.setState({ s: surf, h: hcm, l: nl, r: nr, a: tw, c: cut ? 1 : 0, m: fs, w: nw, o: lay, F: pull });
  }

  resetCard();
  drawRamp(); readRamp();
  fricChanged();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '同一高度下，把三种表面都做一遍',
      desc: '在斜面小车里依次选毛巾、棉布、木板，每次都点「放手」。中途别改高度，否则记录会清空。',
      label: '在斜面小车里操作',
      button: '检查实验记录',
      check: function () {
        var miss = ['towel', 'cotton', 'wood'].filter(function (k) { return rec[k] === undefined; }).map(function (k) { return SURF[k].name; });
        if (miss.length) return { ok: false, msg: '记录里还差：' + miss.join('、') + '。每次都从 h = ' + hcm + ' cm 放手，做完再来检查。' };
        return { ok: true, msg: '毛巾 ' + L.fmt(rec.towel, 1) + ' cm、棉布 ' + L.fmt(rec.cotton, 1) + ' cm、木板 ' + L.fmt(rec.wood, 1) + ' cm：阻力越小，滑得越远。再推想一步——没有阻力会怎样？选“理想光滑面”看看。' };
      }
    },
    {
      level: 'base',
      title: '牛顿第一定律：一切物体在没有受到力的作用时，总保持',
      desc: '“总保持”后面要填完整。',
      options: ['静止状态或匀速直线运动状态', '静止状态', '匀速直线运动状态', '速度越来越小，最后停下'],
      answer: 0,
      hint: '原来静止的物体会怎样？原来运动的又会怎样？两种情况都要包括。',
      explain: '原来静止的物体不受力，继续<b>静止</b>；原来运动的物体不受力，就以那一刻的速度<b>匀速直线运动</b>下去。只写一种不完整；“越来越慢”恰恰是受了阻力的结果。'
    },
    {
      level: 'base',
      title: '让小卡片松手后保持静止',
      desc: '在“二力平衡”里调好两边钩码和扭转角度（不要剪开），可以点「松手」验证。',
      label: '在二力平衡模型里操作',
      button: '检查卡片能否静止',
      check: function () {
        if (cut) return { ok: false, msg: '卡片被剪开了，两个力不再作用在同一物体上。先点「把卡片粘回去」。' };
        if (nl !== nr) return { ok: false, msg: '两边拉力不相等（' + L.fmt(nl * W1, 1) + ' N 和 ' + L.fmt(nr * W1, 1) + ' N），卡片会被拉向力大的一边。' };
        if (tw !== 0) return { ok: false, msg: '大小相等了，但卡片扭了 ' + tw + '°，两个力不在同一直线上，松手后它会转回来。' };
        return { ok: true, msg: '同一物体、大小相等、方向相反、作用在同一直线上，四个条件都满足，两个力彼此平衡，合力为零。' };
      }
    },
    {
      level: 'mid',
      title: '实验中让小车每次从斜面同一高度由静止滑下，目的是',
      desc: '想一想：要研究的是哪个因素的影响？其他条件应该怎样？',
      options: ['使小车到达水平面时的速度相同', '使小车在水平面上受到的阻力相同', '使小车在水平面上滑行的距离相同', '使小车的惯性变大'],
      answer: 0,
      hint: '研究的是“阻力”的影响，那么除了阻力，别的条件都应该一样。',
      explain: '这是<b>控制变量法</b>：同一高度滑下，到达水平面的速度相同，滑行距离不同就只能是阻力不同造成的。阻力不同、距离不同正是要观察的结果，不能让它们相同；惯性只与质量有关，跟高度无关。'
    },
    {
      level: 'mid',
      title: '测出毛巾上加 1 个砝码时的滑动摩擦力',
      desc: '在“滑动摩擦力”里选毛巾、加 1 个砝码，调拉力让木块做匀速直线运动。',
      label: '在滑动摩擦力模型里操作',
      button: '检查读数',
      check: function () {
        if (fs !== 'towel') return { ok: false, msg: '接触面还不是毛巾。' };
        if (nw !== 1) return { ok: false, msg: '木块上要放 1 个砝码，现在是 ' + nw + ' 个。' };
        var md = fmode();
        if (md === 'still') return { ok: false, msg: '拉力 ' + L.fmt(pull, 1) + ' N 还拉不动木块，再大一点。' };
        if (md === 'accel') return { ok: false, msg: '木块在加速，示数 ' + L.fmt(pull, 1) + ' N 比摩擦力大。把拉力调小一些，直到木块匀速运动。' };
        return { ok: true, msg: '匀速时拉力与滑动摩擦力平衡，f = F = ' + L.fmt(fk(), 1) + ' N。同样压力 6 N 在木板上只有 1.8 N：接触面越粗糙，摩擦力越大。' };
      }
    },
    {
      level: 'mid',
      title: '同一直线上，向东 3 N 和向西 5 N 的两个力作用在同一物体上，合力是',
      desc: '先判断两个力同向还是反向。',
      options: ['2 N，方向向西', '2 N，方向向东', '8 N，方向向西', '8 N，方向向东'],
      answer: 0,
      hint: '方向相反的两个力，合力等于“大减小”，方向跟大的那个力走。',
      explain: '两个力方向相反，合力 F = 5 N − 3 N = <b>2 N</b>，方向与较大的力相同，<b>向西</b>。只有两个力同向时才相加得 8 N。'
    },
    {
      level: 'trap',
      title: '把木块从平放改成侧放，仍水平匀速拉动，测力计示数会',
      desc: '侧放时接触面积只有平放的一半。可以在模型里试一试。',
      options: ['不变', '变大', '变小，变成原来的一半', '无法判断'],
      answer: 0,
      hint: '滑动摩擦力和哪两个因素有关？接触面积是其中之一吗？',
      explain: '滑动摩擦力只与<b>压力大小</b>和<b>接触面的粗糙程度</b>有关。侧放后压力还是木块的重力，接触面材料也没变，所以摩擦力不变，匀速拉动时示数也<b>不变</b>。“面积小了摩擦就小”是最常见的误会。'
    },
    {
      level: 'trap',
      title: '汽车紧急刹车时，乘客身体向前倾。下面说法正确的是',
      desc: '注意关于惯性的说法。',
      options: ['乘客具有惯性，上身要保持原来的运动状态', '乘客受到惯性的作用', '乘客受到一个向前的惯性力', '刹车时乘客的惯性变小了'],
      answer: 0,
      hint: '惯性是力吗？能说“受到”吗？惯性大小又由什么决定？',
      explain: '刹车时脚随车减速，上身<b>由于惯性</b>还要保持原来的速度向前，所以前倾。惯性是物体的属性，不是力，不能说“受到惯性”“惯性力”；惯性大小只与质量有关，刹车不会改变它。'
    }
  ]);
})();
