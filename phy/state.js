/* 物理互动馆 · 第 3 课 物态变化 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();

  /* ========== 加热曲线：冰（晶体）与蜡（非晶体） ========== */
  var sub = st.s === 'wax' ? 'wax' : 'ice';
  var tm = Math.round(L.num(st.t, 0, 0, 25) * 4) / 4;
  var heat = L.$('#heat');
  var TMAX = 25, PX0 = 44, PX1 = 390, PYB = 226, PYT = 18, TLO = -20, THI = 110;
  function X(t) { return PX0 + t / TMAX * (PX1 - PX0); }
  function Y(T) { return PYB - (T - TLO) / (THI - TLO) * (PYB - PYT); }

  // 冰：-20→0 ℃ 用 1 min；0 ℃ 熔化 8 min；水 0→100 ℃ 用 10 min；之后沸腾
  function iceT(t) { return t < 1 ? -20 + 20 * t : t < 9 ? 0 : t < 19 ? 10 * (t - 9) : 100; }
  function waxT(t) { return 20 + 2.88 * t + 10 * Math.sin(2 * Math.PI * t / 25); }
  function temp(t) { return sub === 'ice' ? iceT(t) : waxT(t); }
  function seg(t) {
    if (sub === 'ice') return t < 1 ? 'AB' : t <= 9 ? (t === 1 ? 'AB' : 'BC') : t < 19 ? 'CD' : 'DE';
    return t < 6 ? 'w1' : t < 16 ? 'w2' : 'w3';
  }
  var SEGS = {
    ice: [
      ['AB', '0～1 min', '固态（冰）', '−20 ℃ 升到 0 ℃'],
      ['BC', '1～9 min', '固液共存（熔化）', '保持 0 ℃ 不变'],
      ['CD', '9～19 min', '液态（水）', '0 ℃ 升到 100 ℃'],
      ['DE', '19 min 以后', '液态，沸腾', '保持 100 ℃ 不变']
    ],
    wax: [
      ['w1', '0～6 min', '固态，硬', '约 ' + L.fmt(waxT(0), 0) + ' ℃ 升到 ' + L.fmt(waxT(6), 0) + ' ℃'],
      ['w2', '6～16 min', '变软、变稀', '约 ' + L.fmt(waxT(6), 0) + ' ℃ 升到 ' + L.fmt(waxT(16), 0) + ' ℃，一直在升'],
      ['w3', '16 min 以后', '液态', '继续升高']
    ]
  };
  function buildTable() {
    L.$('#seg-title').textContent = sub === 'ice' ? '冰的加热过程（晶体）' : '蜡的加热过程（非晶体）';
    var tb = L.$('#seg-table tbody');
    tb.innerHTML = '';
    SEGS[sub].forEach(function (r) {
      var tr = L.html('tr', {}, tb);
      tr.dataset.r = r[0];
      L.html('td', { html: (sub === 'ice' ? r[0] + ' 段<br>' : '') + r[1] }, tr);
      L.html('td', { text: r[2] }, tr);
      L.html('td', { text: r[3] }, tr);
    });
  }

  function drawBeaker(g, t, T) {
    S('rect', { x: 50, y: 22, width: 104, height: 92, rx: 10, fill: '#fff', stroke: '#e0dce8' }, g);
    var bx = 70, by = 36, bw = 56, bh = 56, bottom = by + bh;
    // 火焰与支架
    S('path', { d: 'M98 112c-6-5-5-10 0-15c5 5 6 10 0 15z', fill: '#f2a43a' }, g);
    S('line', { x1: 64, y1: 96, x2: 132, y2: 96, stroke: '#a39cb3', 'stroke-width': 2 }, g);
    if (sub === 'ice') {
      var melt = t < 1 ? 0 : t < 9 ? (t - 1) / 8 : 1;
      var lv = 26 * melt, boil = t >= 19;
      if (lv > 0) S('rect', { x: bx + 1, y: bottom - lv, width: bw - 2, height: lv, fill: '#cfe3f3' }, g);
      var n = Math.ceil(4 * (1 - melt) - 1e-6), size = 12 * Math.max(0.35, 1 - melt * 0.4);
      for (var i = 0; i < n; i++) {
        var cx = bx + 8 + (i % 2) * 22 + (i > 1 ? 9 : 0), cy = bottom - size - 1 - (i > 1 ? size + 1 : 0);
        S('rect', { x: cx, y: cy, width: size + 4, height: size, rx: 2.5, fill: '#eef6fc', stroke: '#8fb4d4' }, g);
      }
      if (T > 70 || boil) {
        var k = boil ? 9 : 3, seed = Math.floor(t * 8);
        for (var j = 0; j < k; j++) {
          var r = boil ? 2 + ((j + seed) % 3) : 1.3;
          var yy = boil ? bottom - 4 - ((j * 7 + seed * 3) % 22) : bottom - 3;
          S('circle', { cx: bx + 6 + ((j * 13 + seed * 5) % (bw - 12)), cy: yy, r: r, fill: '#fff', stroke: '#8fb4d4' }, g);
        }
        if (boil) S('path', { d: 'M86 30c-4-4 4-6 0-10M100 30c-4-4 4-6 0-10M114 30c-4-4 4-6 0-10', fill: 'none', stroke: '#b8c7d6', 'stroke-width': 1.5 }, g);
      }
    } else {
      var p = L.clamp((t - 6) / 10, 0, 1), q = t >= 16 ? 1 : p;
      var liq = 14 * q, h = 24 * (1 - q), w = 30 + 14 * q, rr = 2 + 10 * q;
      if (liq > 0) S('rect', { x: bx + 1, y: bottom - liq, width: bw - 2, height: liq, fill: '#f0dc96' }, g);
      if (h > 1) S('rect', { x: bx + (bw - w) / 2, y: bottom - liq - h, width: w, height: h + 1, rx: Math.min(rr, h / 2), fill: '#f6e9b8', stroke: '#c9a873' }, g);
    }
    // 杯子与温度计
    S('path', { d: 'M' + bx + ' ' + by + 'V' + bottom + 'H' + (bx + bw) + 'V' + by, fill: 'none', stroke: '#7f9fc0', 'stroke-width': 1.8 }, g);
    S('line', { x1: 120, y1: 26, x2: 120, y2: 86, stroke: '#a39cb3', 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
    S('circle', { cx: 120, cy: 87, r: 3, fill: '#c2603f' }, g);
  }

  function drawHeat() {
    heat.innerHTML = '';
    var defs = S('defs', {}, heat), cp = S('clipPath', { id: 'heat-clip' }, defs);
    S('rect', { x: PX0, y: PYT - 4, width: PX1 - PX0 + 4, height: PYB - PYT + 6 }, cp);
    S('rect', { x: 0, y: 0, width: 400, height: 250, rx: 14, fill: '#fbfaf7' }, heat);
    var T0;
    for (T0 = -20; T0 <= 110; T0 += 10) {
      var key = T0 === 0 || T0 === 100;
      S('line', { x1: PX0, y1: Y(T0), x2: PX1, y2: Y(T0), stroke: key ? '#c9c2d6' : '#ebe8f0', 'stroke-dasharray': key ? '4 3' : null }, heat);
      if (T0 % 20 === 0 || T0 === 100 || T0 === -20) {
        if (T0 !== 110) S('text', { x: PX0 - 5, y: Y(T0) + 3.5, 'font-size': 9.5, 'text-anchor': 'end', fill: '#6b7385', text: T0 }, heat);
      }
    }
    for (var m = 0; m <= 25; m += 5) S('text', { x: m === 25 ? X(m) + 4 : X(m), y: PYB + 14, 'font-size': 9.5, 'text-anchor': m === 25 ? 'end' : 'middle', fill: '#6b7385', text: m }, heat);
    S('line', { x1: PX0, y1: PYB, x2: PX1, y2: PYB, stroke: '#5b6475', 'stroke-width': 1.4 }, heat);
    S('line', { x1: PX0, y1: PYB, x2: PX0, y2: PYT - 6, stroke: '#5b6475', 'stroke-width': 1.4 }, heat);
    S('text', { x: PX0 + 4, y: 12, 'font-size': 9.5, fill: '#6b7385', text: '温度 / ℃' }, heat);
    S('text', { x: PX1 - 2, y: PYB - 6, 'font-size': 9.5, 'text-anchor': 'end', fill: '#6b7385', text: '加热时间 / min' }, heat);
    if (sub === 'ice') {
      S('text', { x: PX1 - 2, y: Y(0) - 4, 'font-size': 9.5, 'text-anchor': 'end', fill: '#7f9fc0', text: '0 ℃ 冰的熔点' }, heat);
      S('text', { x: PX1 - 2, y: Y(100) + 13, 'font-size': 9.5, 'text-anchor': 'end', fill: '#a4492b', text: '100 ℃ 水的沸点（1 标准大气压）' }, heat);
    }
    // 曲线（只画到当前时刻）
    var g = S('g', { 'clip-path': 'url(#heat-clip)' }, heat), d = '', n = Math.max(2, Math.round(tm * 12));
    for (var i = 0; i <= n; i++) { var tt = tm * i / n; d += (i ? 'L' : 'M') + X(tt).toFixed(1) + ' ' + Y(temp(tt)).toFixed(1); }
    S('path', { d: d, fill: 'none', stroke: sub === 'ice' ? '#5a4097' : '#c9932c', 'stroke-width': 2.6, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, g);
    if (sub === 'ice') {
      [[0, 'A'], [1, 'B'], [9, 'C'], [19, 'D'], [25, 'E']].forEach(function (p) {
        if (tm + 1e-9 < p[0]) return;
        var px = X(p[0]), py = Y(iceT(p[0]));
        S('circle', { cx: px, cy: py, r: 2.6, fill: '#5a4097' }, heat);
        S('text', { x: px + (p[1] === 'E' ? -4 : p[1] === 'A' ? 7 : 4), y: py + (p[1] === 'A' ? -6 : p[1] === 'D' || p[1] === 'E' ? -6 : 13), 'font-size': 10, 'text-anchor': p[1] === 'E' ? 'end' : 'start', fill: '#5a4097', 'font-weight': 700, text: p[1] }, heat);
      });
    }
    S('circle', { cx: X(tm), cy: Y(temp(tm)), r: 4.5, fill: sub === 'ice' ? '#5a4097' : '#c9932c', stroke: '#fff', 'stroke-width': 1.5 }, heat);
    drawBeaker(S('g', {}, heat), tm, temp(tm));
    heatReadout();
  }

  function heatReadout() {
    var T = temp(tm), sg = seg(tm), badge, phase, txt, flat;
    L.$('#time-out').textContent = L.fmt(tm, 2) + ' min';
    L.$('#heat-t').innerHTML = L.fmt(tm, 2) + '<small>min</small>';
    L.$('#heat-T').innerHTML = L.fmt(T, 1) + '<small>℃</small>';
    if (sub === 'ice') {
      flat = sg === 'BC' || sg === 'DE';
      if (sg === 'AB') { badge = '固态'; phase = '冰在升温'; txt = '冰还没到熔点，吸收的热量让它的温度升高。冰升温比水快，所以 AB 段比 CD 段更陡。'; }
      else if (sg === 'BC') { badge = '固液共存'; phase = '熔化：冰和水同时存在'; txt = '冰正在<b>熔化</b>：已经化掉约 ' + Math.round((tm - 1) / 8 * 100) + '%。一直在吸热，温度却<b>保持 0 ℃ 不变</b>，这个温度就是冰的熔点。冰是<b>晶体</b>。'; }
      else if (sg === 'CD') { badge = '液态'; phase = '水在升温'; txt = '冰全部化成水，吸收的热量又让温度升高。' + (T > 70 ? '杯底开始冒出小气泡，它们上升时会变小：这时还没沸腾。' : ''); }
      else { badge = '沸腾'; phase = '沸腾：水剧烈汽化'; txt = '水达到沸点 100 ℃（1 标准大气压下），内部和表面同时剧烈汽化，大气泡上升时<b>越来越大</b>。继续吸热，温度却<b>不再升高</b>。杯口的“白气”是水蒸气遇冷液化成的小水滴。'; }
    } else {
      flat = false;
      if (sg === 'w1') { badge = '固态'; phase = '蜡在升温'; txt = '蜡还是硬的固体，吸热后温度一直在升高。'; }
      else if (sg === 'w2') { badge = '变软'; phase = '蜡逐渐变软、变稀'; txt = '蜡一边变软、变稀，一边<b>继续升温</b>，曲线上找不到温度不变的平台。蜡<b>没有固定的熔点</b>，是<b>非晶体</b>。'; }
      else { badge = '液态'; phase = '蜡已熔化，继续升温'; txt = '蜡已经全部变成液体，温度仍在升高。和冰比一比：非晶体熔化时温度一直变化，晶体熔化时温度不变。'; }
    }
    L.$('#heat-q').textContent = '吸热';
    L.$('#state-badge').textContent = badge;
    L.$('#heat-phase').textContent = phase;
    L.$('#heat-trend').textContent = tm === 0 ? '刚开始' : flat ? '不变' : '升高';
    L.$('#heat-text').innerHTML = txt;
    L.$$('#seg-table tbody tr').forEach(function (tr) { tr.classList.toggle('on', tr.dataset.r === sg); });
    save();
  }

  var timeIn = L.$('#time-in'), heatBtn = L.$('#heat-play'), heatAnim = null;
  timeIn.value = tm;
  L.bindRange(timeIn, function (v) { stopHeat(); tm = v; drawHeat(); });
  function setTm(v) { tm = L.clamp(v, 0, TMAX); timeIn.value = tm; L.paintRange(timeIn); drawHeat(); }
  function stopHeat() { if (heatAnim) { heatAnim.stop(); heatAnim = null; } heatBtn.textContent = tm > 0 && tm < TMAX ? '继续加热' : '开始加热'; }
  heatBtn.addEventListener('click', function () {
    if (heatAnim) { stopHeat(); return; }
    if (tm >= TMAX) setTm(0);
    if (L.REDUCED) { setTm(TMAX); stopHeat(); return; }
    heatBtn.textContent = '暂停';
    heatAnim = L.loop(function (dt) {
      var nt = tm + dt * 2;            // 动画里 1 秒 = 加热 2 分钟
      if (nt >= TMAX) { setTm(TMAX); heatAnim = null; heatBtn.textContent = '开始加热'; return false; }
      setTm(nt);
    });
  });
  L.$('#heat-reset').addEventListener('click', function () { stopHeat(); setTm(0); heatBtn.textContent = '开始加热'; });
  L.chips(L.$('#sub-chips'), [{ label: '冰（晶体）', value: 'ice' }, { label: '蜡（非晶体）', value: 'wax' }], sub, function (v) { sub = v; stopHeat(); buildTable(); setTm(0); heatBtn.textContent = '开始加热'; });

  /* ========== 六种物态变化 ========== */
  var PC = {
    melt: { name: '熔化', from: 'solid', to: 'liquid', heat: '吸热', text: '固态变成液态。晶体熔化时温度保持在熔点不变。', eg: ['夏天的冰棒拿在手里，很快化成水', '冰块放进柠檬茶里，慢慢变小', '吃冰棒觉得凉快：冰熔化要从嘴里吸热'] },
    freeze: { name: '凝固', from: 'liquid', to: 'solid', heat: '放热', text: '液态变成固态。同一种晶体的凝固点和熔点相同，凝固时温度也不变。', eg: ['把水放进冰箱冷冻室，做成冰块', '工厂把铁水倒进模具，凝固成零件', '北方冬天在菜窖里放几桶水，水结冰时放热，菜不容易冻坏'] },
    vapor: { name: '汽化', from: 'liquid', to: 'gas', heat: '吸热', text: '液态变成气态，有<b>蒸发</b>和<b>沸腾</b>两种方式。', eg: ['台风雨过后太阳一晒，路面积水很快干了（蒸发）', '煲汤时汤水翻滚冒泡（沸腾）', '游完泳上岸被风一吹觉得冷：身上的水蒸发吸热'] },
    cond: { name: '液化', from: 'gas', to: 'liquid', heat: '放热', text: '气态变成液态。方法有两种：<b>降低温度</b>、<b>压缩体积</b>。', eg: ['回南天墙壁、瓷砖地板“出汗”：暖湿空气里的水蒸气碰到冰凉的墙面', '冰镇饮料的杯子外壁挂满小水珠', '冰棒、开水上方冒“白气”：水蒸气遇冷液化成的小水滴', '夏天开着空调的汽车，车窗玻璃<b>外侧</b>起雾'] },
    sub: { name: '升华', from: 'solid', to: 'gas', heat: '吸热', text: '固态不经过液态，<b>直接</b>变成气态。', eg: ['衣柜里的樟脑丸越放越小，最后不见了', '舞台上用干冰造“云雾”：干冰升华吸热，周围空气中的水蒸气遇冷液化成小水滴', '北方冬天冰冻的衣服也会慢慢变干'] },
    dep: { name: '凝华', from: 'gas', to: 'solid', heat: '放热', text: '气态不经过液态，<b>直接</b>变成固态。', eg: ['冰箱冷冻室内壁结的一层“霜”', '北方冬天的霜、树枝上的雾凇', '寒冷的冬天，窗玻璃<b>内侧</b>结出“冰花”'] }
  };
  var NODES = { solid: { x: 80, y: 196, name: '固态' }, liquid: { x: 320, y: 196, name: '液态' }, gas: { x: 200, y: 66, name: '气态' } };
  var PAIRS = [['solid', 'liquid', 'melt', 'freeze'], ['liquid', 'gas', 'vapor', 'cond'], ['solid', 'gas', 'sub', 'dep']];
  var pick = PC[st.pc] ? st.pc : 'melt';
  var phase = L.$('#phase'), pcChips;
  var HOT = '#c2603f', COLD = '#3f78b5';

  function nodeIcon(g, k) {
    var n = NODES[k];
    S('circle', { cx: n.x, cy: n.y, r: 32, fill: '#fff', stroke: '#c9c2d6', 'stroke-width': 1.5 }, g);
    var pts;
    if (k === 'solid') { pts = []; for (var i = -1; i <= 1; i++) for (var j = -1; j <= 1; j++) pts.push([i * 10, j * 10]); }
    else if (k === 'liquid') pts = [[-12, -6], [0, -10], [11, -4], [-6, 5], [6, 7], [-14, 10], [15, 9]];
    else pts = [[-15, -10], [12, -13], [-2, 2], [16, 10], [-13, 13]];
    pts.forEach(function (p) { S('circle', { cx: n.x + p[0], cy: n.y + p[1], r: 4, fill: '#7f9fc0' }, g); });
    S('text', { x: n.x, y: k === 'gas' ? n.y - 40 : n.y + 46, 'font-size': 11, 'text-anchor': 'middle', fill: '#3b3548', 'font-weight': 700, text: n.name }, g);
  }
  function drawPhase() {
    phase.innerHTML = '';
    var defs = S('defs', {}, phase), cp = S('clipPath', { id: 'phase-clip' }, defs);
    S('rect', { x: 0, y: 0, width: 400, height: 250, rx: 14 }, cp);
    S('rect', { x: 0, y: 0, width: 400, height: 250, rx: 14, fill: '#fbfaf7' }, phase);
    var root = S('g', { 'clip-path': 'url(#phase-clip)' }, phase);
    var cx = (80 + 320 + 200) / 3, cy = (196 + 196 + 66) / 3;
    PAIRS.forEach(function (pr) {
      var P = NODES[pr[0]], Q = NODES[pr[1]], dx = Q.x - P.x, dy = Q.y - P.y, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len;
      var nx = uy, ny = -ux, mx = (P.x + Q.x) / 2, my = (P.y + Q.y) / 2;
      if (nx * (mx - cx) + ny * (my - cy) < 0) { nx = -nx; ny = -ny; }   // 法线朝三角形外侧
      [[pr[2], 1, P, Q], [pr[3], -1, Q, P]].forEach(function (a) {
        var id = a[0], side = a[1], A = a[2], B = a[3], on = id === pick, c = PC[id].heat === '吸热' ? HOT : COLD;
        var ox = nx * 8 * side, oy = ny * 8 * side;
        var ax = (B.x - A.x) / len, ay = (B.y - A.y) / len;
        var x1 = A.x + ax * 40 + ox, y1 = A.y + ay * 40 + oy, x2 = B.x - ax * 40 + ox, y2 = B.y - ay * 40 + oy;
        var g = S('g', { class: 'pt', tabindex: 0, role: 'button', 'aria-pressed': String(on), 'aria-label': PC[id].name + '，' + PC[id].heat, style: 'cursor:pointer' }, root);
        S('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: 'transparent', 'stroke-width': 18 }, g);
        L.arrow(g, x1, y1, x2, y2, { color: c, width: on ? 3.2 : 1.8, head: on ? 10 : 8 });
        var ld = 12 + Math.abs(nx) * 14 + Math.abs(ny) * 15, lx = mx + nx * ld * side, ly = my + ny * ld * side;
        if (on) S('rect', { x: lx - 18, y: ly - 17, width: 36, height: 34, rx: 8, fill: c, opacity: 0.14 }, g);
        var tx = S('text', { x: lx, y: ly - 2, 'font-size': on ? 12 : 11, 'text-anchor': 'middle', fill: c, 'font-weight': on ? 700 : 600 }, g);
        S('tspan', { x: lx, dy: 0, text: PC[id].name }, tx);
        S('tspan', { x: lx, dy: 13, 'font-size': 10, text: PC[id].heat }, tx);
        g.addEventListener('click', function () { choose(id); });
        g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(id); } });
      });
    });
    ['solid', 'liquid', 'gas'].forEach(function (k) { nodeIcon(root, k); });
    pcReadout();
  }
  function pcReadout() {
    var p = PC[pick];
    L.$('#pc-name').textContent = p.name;
    L.$('#pc-badge').textContent = p.heat;
    L.$('#pc-from').textContent = NODES[p.from].name;
    L.$('#pc-to').textContent = NODES[p.to].name;
    L.$('#pc-text').innerHTML = p.text + (p.heat === '吸热' ? '这个过程要<b>吸热</b>。' : '这个过程会<b>放热</b>。') + '<br><b>身边的例子：</b>' + p.eg.join('；') + '。';
    save();
  }
  function choose(id) {
    pick = id; if (pcChips) pcChips.set(id);
    drawPhase();
    var el = L.$$('#phase [role=button]').filter(function (g) { return g.getAttribute('aria-pressed') === 'true'; })[0];
    if (el && document.activeElement && document.activeElement.closest && document.activeElement.closest('#phase')) el.focus();
  }
  pcChips = L.chips(L.$('#pc-chips'), Object.keys(PC).map(function (k) { return { label: PC[k].name, value: k }; }), pick, function (v) { choose(v); });

  /* ========== 温度计读数 ========== */
  var thermo = L.$('#thermo');
  var tmT = Math.round(L.num(st.tt, -6, -18, 36));
  var tmR = Math.round(L.num(st.tr, 0, -20, 40));
  var tmChecked = false;
  function TY(T) { return 186 - (T + 20) * 160 / 60; }
  function drawThermo() {
    thermo.innerHTML = '';
    var defs = S('defs', {}, thermo), cp = S('clipPath', { id: 'thermo-clip' }, defs);
    S('rect', { x: 210, y: 16, width: 170, height: 198, rx: 12 }, cp);
    S('rect', { x: 0, y: 0, width: 400, height: 230, rx: 14, fill: '#fbfaf7' }, thermo);
    var T, x0 = 92;
    // 整支温度计
    S('rect', { x: x0 - 6, y: 16, width: 12, height: 186, rx: 6, fill: '#fff', stroke: '#b8b2c6' }, thermo);
    S('circle', { cx: x0, cy: 208, r: 10, fill: '#d0503a' }, thermo);
    S('rect', { x: x0 - 2, y: TY(tmT), width: 4, height: 206 - TY(tmT), fill: '#d0503a' }, thermo);
    for (T = -20; T <= 40; T++) {
      var big = T % 10 === 0, mid = T % 5 === 0;
      S('line', { x1: x0 - 6, y1: TY(T), x2: x0 - 6 - (big ? 9 : mid ? 6 : 3.5), y2: TY(T), stroke: '#5b6475', 'stroke-width': big ? 1.2 : 0.8 }, thermo);
      if (big) S('text', { x: x0 - 18, y: TY(T) + 3.5, 'font-size': 9.5, 'text-anchor': 'end', fill: T === 0 ? '#a4492b' : '#5b6475', 'font-weight': T === 0 ? 700 : 400, text: Math.abs(T) }, thermo);
    }
    S('text', { x: x0 + 12, y: 22, 'font-size': 10, fill: '#5b6475', text: '℃' }, thermo);
    // 放大窗口
    var c = tmT, Z = 13, ZY = function (v) { return 115 - (v - c) * Z; };
    S('rect', { x: x0 + 9, y: TY(c + 7), width: 14, height: TY(c - 7) - TY(c + 7), fill: 'none', stroke: '#5a4097', 'stroke-dasharray': '3 2' }, thermo);
    S('path', { d: 'M' + (x0 + 23) + ' ' + TY(c + 7) + 'L210 16M' + (x0 + 23) + ' ' + TY(c - 7) + 'L210 214', stroke: '#c9c2d6', fill: 'none' }, thermo);
    var g = S('g', { 'clip-path': 'url(#thermo-clip)' }, thermo);
    S('rect', { x: 210, y: 16, width: 170, height: 198, fill: '#fff' }, g);
    S('rect', { x: 300, y: 0, width: 26, height: 240, fill: '#f7f6fa', stroke: '#b8b2c6' }, g);
    S('rect', { x: 307, y: ZY(tmT), width: 12, height: 240, fill: '#d0503a' }, g);
    for (T = c - 9; T <= c + 9; T++) {
      if (T < -20 || T > 40) continue;
      var b2 = T % 10 === 0, m2 = T % 5 === 0;
      S('line', { x1: 300, y1: ZY(T), x2: 300 - (b2 ? 24 : m2 ? 16 : 9), y2: ZY(T), stroke: '#5b6475', 'stroke-width': b2 ? 1.6 : 1 }, g);
      if (m2) S('text', { x: 300 - (b2 ? 28 : 20), y: ZY(T) + 4, 'font-size': 11, 'text-anchor': 'end', fill: T === 0 ? '#a4492b' : '#5b6475', 'font-weight': T === 0 ? 700 : 500, text: Math.abs(T) }, g);
    }
    if (c - 9 <= 0 && c + 9 >= 0) {
      S('line', { x1: 300, y1: ZY(0), x2: 372, y2: ZY(0), stroke: '#a4492b', 'stroke-dasharray': '3 3' }, g);
      S('text', { x: 374, y: ZY(0) - 4, 'font-size': 10, 'text-anchor': 'end', fill: '#a4492b', 'font-weight': 600, text: '0 ℃' }, g);
    }
    S('rect', { x: 334, y: 194, width: 42, height: 16, rx: 8, fill: '#fff' }, g);
    S('text', { x: 370, y: 206, 'font-size': 10, 'text-anchor': 'end', fill: '#5a4097', text: '放大看' }, g);
    S('rect', { x: 210, y: 16, width: 170, height: 198, rx: 12, fill: 'none', stroke: '#5a4097', 'stroke-width': 1.4 }, thermo);
    thermoReadout();
  }
  function say(T) { return T < 0 ? '−' + Math.abs(T) + ' ℃，读作“零下 ' + Math.abs(T) + ' 摄氏度”或“负 ' + Math.abs(T) + ' 摄氏度”' : T + ' ℃，读作“' + T + ' 摄氏度”'; }
  function tmJudge() {
    if (tmR === tmT) return { ok: true, msg: '读对了：' + say(tmT) + '。' + (tmT < 0 ? '液柱顶端在 0 ℃ 下面，所以是零下，要写负号。' : '液柱顶端在 0 ℃ 上面，是零上温度。') };
    if (tmT !== 0 && tmR === -tmT) return { ok: false, msg: '格数数对了，但<b>正负号反了</b>。看液柱顶端在 0 ℃ 的上面还是下面：在下面就是零下，要写负号。' };
    if (tmT < 0 && tmR < 0 && Math.abs(tmR - tmT) <= 3) return { ok: false, msg: '差了 ' + Math.abs(tmR - tmT) + ' ℃。零下的刻度<b>越往下数字越大</b>，从 0 ℃ 开始往下数格子，每格 1 ℃。' };
    if (Math.abs(tmR - tmT) <= 3) return { ok: false, msg: '差了 ' + Math.abs(tmR - tmT) + ' ℃。先找离液柱顶端最近的长刻度线，再一格一格数，每格 1 ℃。' };
    return { ok: false, msg: '差得比较多。先找到 0 ℃，判断液柱顶端在它上面还是下面，再从最近的长刻度线开始数格子。' };
  }
  function thermoReadout() {
    L.$('#tm-out').textContent = (tmR < 0 ? '−' + Math.abs(tmR) : tmR) + ' ℃';
    L.$('#tm-you').innerHTML = (tmR < 0 ? '−' + Math.abs(tmR) : tmR) + '<small>℃</small>';
    L.$('#tm-say').textContent = say(tmR);
    var b = L.$('#tm-badge'), tx = L.$('#tm-text');
    if (tmChecked) {
      var r = tmJudge();
      L.$('#tm-ans').innerHTML = (tmT < 0 ? '−' + Math.abs(tmT) : tmT) + '<small>℃</small>';
      b.textContent = r.ok ? '读对了' : '再看看';
      tx.innerHTML = r.msg;
    } else {
      L.$('#tm-ans').innerHTML = '<small>核对后显示</small>';
      b.textContent = '待核对';
      tx.innerHTML = '读数前先看清<b>量程和分度值</b>：这支温度计从 −20 ℃ 到 40 ℃，每小格 1 ℃。读数时视线要和液柱的上表面相平，玻璃泡不能离开被测物体。';
    }
    save();
  }
  var tmIn = L.$('#tm-in');
  function syncTm() { tmIn.value = tmR; L.paintRange(tmIn); }
  tmIn.value = tmR;
  L.bindRange(tmIn, function (v) { tmR = v; tmChecked = false; thermoReadout(); });
  L.$('#tm-minus').addEventListener('click', function () { tmR = Math.max(-20, tmR - 1); tmChecked = false; syncTm(); thermoReadout(); });
  L.$('#tm-plus').addEventListener('click', function () { tmR = Math.min(40, tmR + 1); tmChecked = false; syncTm(); thermoReadout(); });
  L.$('#tm-check').addEventListener('click', function () { tmChecked = true; thermoReadout(); });
  function newTemp(neg) {
    var old = tmT;
    do { tmT = (neg || Math.random() < 0.6) ? -1 - Math.floor(Math.random() * 17) : Math.floor(Math.random() * 37); } while (tmT === old);
    tmChecked = false; drawThermo();
  }
  L.$('#tm-new').addEventListener('click', function () { newTemp(false); });

  function save() { L.setState({ s: sub, t: L.fmt(tm, 2), pc: pick, tt: tmT, tr: tmR }); }

  buildTable();
  drawHeat();
  stopHeat();
  drawPhase();
  drawThermo();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '找到冰正在熔化的时刻',
      desc: '选“冰（晶体）”，把加热时间拖到冰正在熔化、冰和水同时存在的时候。',
      label: '在加热曲线里操作',
      button: '检查这个时刻',
      check: function () {
        if (sub !== 'ice') return { ok: false, msg: '先把加热的物质换成<b>冰</b>。' };
        if (tm > 1 && tm < 9) return { ok: true, msg: '第 ' + L.fmt(tm, 2) + ' min 处在 BC 段：冰正在熔化，<b>固液共存</b>，持续吸热但温度保持 0 ℃ 不变。' };
        if (tm <= 1) return { ok: false, msg: '这时冰还没开始熔化（或刚刚到 0 ℃）。往后拖一拖，找曲线上第一段“平台”。' };
        return { ok: false, msg: '这时冰已经全部化成水了。往前找，曲线在 0 ℃ 那条“平台”上。' };
      }
    },
    {
      level: 'base',
      title: '回南天墙壁“出汗”是哪种物态变化？',
      desc: '在“六种物态变化”图里点出对应的箭头。',
      label: '在六种物态变化图里点选',
      button: '检查我选的箭头',
      check: function () {
        if (pick === 'cond') return { ok: true, msg: '暖湿空气里的<b>水蒸气</b>碰到冰凉的墙面，放热变成小水滴，是<b>液化</b>（气态 → 液态，放热）。' };
        if (pick === 'dep') return { ok: false, msg: '墙上出现的是水珠（液态），不是霜（固态）。再想想变成了什么状态。' };
        if (pick === 'vapor') return { ok: false, msg: '方向反了。汽化是水变成水蒸气；墙上的水珠是从空气里的<b>水蒸气</b>来的。' };
        return { ok: false, msg: '先想清楚：墙上的水原来是什么状态？（提示：来自空气里看不见的水蒸气。）' };
      }
    },
    {
      level: 'base',
      title: '下列物态变化中，放热的是',
      desc: '记一个规律：从“散”到“紧”放热，从“紧”到“散”吸热。',
      options: ['凝华', '熔化', '汽化', '升华'],
      answer: 0,
      hint: '固态最“紧”，气态最“散”。哪一个是往“紧”的方向变？',
      explain: '<b>凝华</b>是气态直接变固态，放热（霜的形成）。熔化（固→液）、汽化（液→气）、升华（固→气）都是从“紧”到“散”，都要吸热。放热的还有凝固和液化。'
    },
    {
      level: 'mid',
      title: '读出一个零下温度',
      desc: '温度计已经换成一个零下的温度。注意 0 ℃ 下面的数字不带负号，用滑块写下读数后点“检查”。',
      label: '在温度计模型里操作',
      button: '检查读数',
      setup: function () { if (tmT >= 0) newTemp(true); },
      check: function () {
        return tmJudge();
      }
    },
    {
      level: 'mid',
      title: '冰和蜡熔化时，最大的不同是',
      desc: '在加热曲线里分别看看冰和蜡。',
      options: ['冰熔化时温度不变，蜡熔化时温度一直升高', '冰熔化要吸热，蜡熔化不用吸热', '冰会熔化，蜡不会熔化', '蜡的熔点比冰的熔点高'],
      answer: 0,
      hint: '比较两条曲线：哪一条有“平台”？',
      explain: '冰是晶体，熔化时<b>温度保持不变</b>（有熔点）；蜡是非晶体，边熔化边升温，<b>没有固定熔点</b>。两者熔化都要吸热；蜡也会熔化，只是慢慢变软；正因为蜡没有熔点，说“蜡的熔点比冰高”也不对。'
    },
    {
      level: 'mid',
      title: '关于蒸发和沸腾，下列说法正确的是',
      desc: '想想晾衣服和烧开水的区别。',
      options: ['蒸发在任何温度下都能发生，沸腾要达到沸点', '蒸发和沸腾都只在液体表面进行', '水沸腾时继续加热，温度会一直升高', '蒸发不需要吸热'],
      answer: 0,
      hint: '冬天湿衣服也能晾干；烧水要烧到 100 ℃ 才翻滚。',
      explain: '<b>蒸发</b>在任何温度下都能发生，只在液体表面进行；<b>沸腾</b>要达到沸点并继续吸热，在内部和表面同时进行。沸腾时温度不变；蒸发和沸腾都是汽化，都要吸热（所以蒸发有致冷作用）。'
    },
    {
      level: 'trap',
      title: '冰棒周围冒的“白气”是',
      desc: '刚从冰箱拿出的冰棒，周围飘着一缕缕“白气”。',
      options: ['空气中的水蒸气遇冷液化成的小水滴', '冰棒升华成的水蒸气', '空气中的水蒸气', '冰棒熔化成的水'],
      answer: 0,
      hint: '水蒸气看得见吗？看得见的“白气”是什么状态？',
      explain: '水蒸气是<b>看不见</b>的。冰棒很冷，周围空气中的水蒸气遇冷放热，<b>液化</b>成大量<b>小水滴</b>，才看起来像“白气”。所以“白气”是液态的小水滴，不是水蒸气，也不是冰棒升华或熔化来的。'
    },
    {
      level: 'trap',
      title: '一锅水已经沸腾（1 标准大气压），把火开得更大，水温会',
      desc: '在加热曲线的 DE 段想一想。',
      options: ['保持 100 ℃ 不变', '继续升高', '先升高再降低', '马上降低'],
      answer: 0,
      hint: '沸腾时吸收的热量用来干什么了？',
      explain: '沸腾时温度保持在沸点不变，加大火力只会让水<b>沸腾得更剧烈</b>、汽化得更快，水温仍是 100 ℃。所以煲汤时水开后改小火也一样能保持沸腾，还更省燃气。'
    }
  ]);
})();
