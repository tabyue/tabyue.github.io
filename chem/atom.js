/* 化学互动馆 · 第 3 课 物质构成的奥秘 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();

  /* 前 20 号元素：符号、名称、相对原子质量、最常见原子的中子数、类别 */
  var EL = [null,
    ['H', '氢', 1, 0, 'non'], ['He', '氦', 4, 2, 'noble'], ['Li', '锂', 7, 4, 'metal'], ['Be', '铍', 9, 5, 'metal'],
    ['B', '硼', 11, 6, 'non'], ['C', '碳', 12, 6, 'non'], ['N', '氮', 14, 7, 'non'], ['O', '氧', 16, 8, 'non'],
    ['F', '氟', 19, 10, 'non'], ['Ne', '氖', 20, 10, 'noble'], ['Na', '钠', 23, 12, 'metal'], ['Mg', '镁', 24, 12, 'metal'],
    ['Al', '铝', 27, 14, 'metal'], ['Si', '硅', 28, 14, 'non'], ['P', '磷', 31, 16, 'non'], ['S', '硫', 32, 16, 'non'],
    ['Cl', '氯', 35.5, 18, 'non'], ['Ar', '氩', 40, 22, 'noble'], ['K', '钾', 39, 20, 'metal'], ['Ca', '钙', 40, 20, 'metal']
  ];
  var CAT = { metal: ['金属', '#f6e6d8', '#e6b48f'], non: ['非金属', '#e1f1ec', '#86c0b0'], noble: ['稀有气体', '#e9e7f6', '#a8a3d6'] };
  var GAS = { 1: 1, 2: 1, 7: 1, 8: 1, 9: 1, 10: 1, 17: 1, 18: 1 };
  /* 初中常见的简单离子所带电荷 */
  var ION = { 1: 1, 3: 1, 4: 2, 11: 1, 12: 2, 13: 3, 19: 1, 20: 2, 7: -3, 8: -2, 9: -1, 15: -3, 16: -2, 17: -1 };
  var SUPC = { '1': '¹', '2': '²', '3': '³', '+': '⁺', '-': '⁻' };

  function chargeStr(q) { var a = Math.abs(q); return (a > 1 ? a : '') + (q > 0 ? '+' : '-'); }
  function ionHTML(sym, q) { return q === 0 ? sym : L.chem(sym + '^' + chargeStr(q)).replace('-</sup>', '−</sup>'); }
  function ionText(sym, q) { return q === 0 ? sym : sym + chargeStr(q).split('').map(function (c) { return SUPC[c] || c; }).join(''); }
  function shells(e) { var out = [], caps = [2, 8, 8, 2]; for (var i = 0; i < 4 && e > 0; i++) { var c = Math.min(e, caps[i]); out.push(c); e -= c; } return out; }

  /* ========== 原子组装台 ========== */
  var p = Math.round(L.num(st.p, 11, 1, 20));
  function nRange() { var c = EL[p][3]; return [Math.max(0, c - 3), c + 3]; }
  function eRange() { return [Math.max(0, p - 3), Math.min(20, p + 3)]; }
  var n = Math.round(L.num(st.n, EL[p][3], nRange()[0], nRange()[1]));
  var e = Math.round(L.num(st.e, p, eRange()[0], eRange()[1]));

  var atomSvg = L.$('#atom');
  var adefs = S('defs', {}, atomSvg);
  S('rect', { x: 0, y: 0, width: 400, height: 250, rx: 14 }, S('clipPath', { id: 'atom-clip' }, adefs));
  var CX = 122, CY = 124, R = [34, 53, 72, 91];

  function drawAtom() {
    atomSvg.innerHTML = ''; atomSvg.appendChild(adefs);
    var g = S('g', { 'clip-path': 'url(#atom-clip)' }, atomSvg);
    S('rect', { x: 0, y: 0, width: 400, height: 250, rx: 14, fill: '#fbfaf7' }, g);
    S('text', { x: CX, y: 18, 'font-size': 10, 'text-anchor': 'middle', fill: '#6b7877', text: '原子模型（原子核被放大了很多）' }, g);
    var sh = shells(e);
    R.forEach(function (r, i) {
      S('circle', { cx: CX, cy: CY, r: r, fill: 'none', stroke: i < sh.length ? '#b9cfcd' : '#e8eeec', 'stroke-width': 1.2, 'stroke-dasharray': i < sh.length ? null : '3 4' }, g);
    });
    // 原子核：质子与中子交错排列
    var total = p + n, dots = [];
    for (var k = 0; k < total; k++) {
      var isP = Math.floor((k + 1) * p / total) > Math.floor(k * p / total);
      var rr = 2.9 * Math.sqrt(k + 0.5), an = k * 2.39996;
      dots.push([CX + rr * Math.cos(an), CY + rr * Math.sin(an), isP]);
    }
    for (k = dots.length - 1; k >= 0; k--) S('circle', { cx: dots[k][0].toFixed(1), cy: dots[k][1].toFixed(1), r: 3.6, fill: dots[k][2] ? '#d9654b' : '#a9b4b3', stroke: '#fff', 'stroke-width': 0.8 }, g);
    // 核外电子
    sh.forEach(function (c, i) {
      for (var j = 0; j < c; j++) {
        var a = -Math.PI / 2 + i * 0.5 + j * 2 * Math.PI / c;
        S('circle', { cx: (CX + R[i] * Math.cos(a)).toFixed(1), cy: (CY + R[i] * Math.sin(a)).toFixed(1), r: 4, fill: '#2c736f', stroke: '#fff', 'stroke-width': 1 }, g);
      }
    });
    // 图例
    [['#d9654b', '质子'], ['#a9b4b3', '中子'], ['#2c736f', '电子']].forEach(function (it, i) {
      S('circle', { cx: 22 + i * 58, cy: 238, r: 4, fill: it[0] }, g);
      S('text', { x: 30 + i * 58, y: 241.5, 'font-size': 10, fill: '#5c6968', text: it[1] }, g);
    });

    // 结构示意图
    var DX = 272, DY = 110, q = p - e, el = EL[p];
    S('line', { x1: 240, y1: 30, x2: 240, y2: 226, stroke: '#e3e9e9' }, g);
    S('text', { x: 320, y: 24, 'font-size': 10, 'text-anchor': 'middle', fill: '#6b7877', text: q === 0 ? '原子结构示意图' : '离子结构示意图' }, g);
    S('circle', { cx: DX, cy: DY, r: 17, fill: '#fff', stroke: '#5b6475', 'stroke-width': 1.4 }, g);
    S('text', { x: DX, y: DY + 4.5, 'font-size': 12.5, 'text-anchor': 'middle', 'font-weight': 700, fill: '#c2603f', text: '+' + p }, g);
    sh.forEach(function (c, i) {
      var x = 296 + i * 22;
      S('path', { d: 'M' + x + ' ' + (DY - 22) + 'Q' + (x + 12) + ' ' + DY + ' ' + x + ' ' + (DY + 22), fill: 'none', stroke: '#5b6475', 'stroke-width': 1.4 }, g);
      S('text', { x: x + 6, y: DY + 4.5, 'font-size': 12, 'text-anchor': 'middle', 'font-weight': 700, fill: '#2c736f', stroke: '#fbfaf7', 'stroke-width': 3, 'paint-order': 'stroke', text: c }, g);
    });
    S('text', { x: 320, y: 160, 'font-size': 13, 'text-anchor': 'middle', 'font-weight': 700, fill: '#1f302e', text: el[1] + (q === 0 ? '原子 ' : '离子 ') + ionText(el[0], q) }, g);
    var info = outerInfo();
    S('text', { x: 320, y: 180, 'font-size': 10.5, 'text-anchor': 'middle', fill: '#5c6968', text: info[0] }, g);
    S('text', { x: 320, y: 196, 'font-size': 10.5, 'text-anchor': 'middle', fill: info[2] ? '#2c736f' : '#5c6968', text: info[1] }, g);
    atomReadout(info);
  }

  /* 最外层电子的说明：[第一行, 第二行, 是否稳定结构, 段落] */
  function outerInfo() {
    var sh = shells(e), q = p - e, el = EL[p];
    if (!sh.length) return ['核外没有电子', '只剩一个质子', false, '氢原子失去唯一的电子，就只剩下一个质子，这就是 H<sup>+</sup>。'];
    var out = sh[sh.length - 1];
    var stable = (sh.length === 1 && out === 2) || out === 8;
    var l1 = '最外层 ' + out + ' 个电子';
    if (q === 0) {
      if (stable) return [l1, '相对稳定结构', true, '最外层已经“满”了（' + (sh.length === 1 ? '只有一层时 2 个' : '8 个') + '），是<b>相对稳定结构</b>，所以稀有气体的化学性质很不活泼。'];
      if (el[4] === 'metal' || p === 1) return [l1, '容易失去 ' + out + ' 个电子', false, '最外层只有 ' + out + ' 个电子，在化学反应中容易<b>失去</b>它们，变成 ' + ionHTML(el[0], out) + '。试试把电子减掉 ' + out + ' 个。'];
      if (out >= 5) return [l1, '容易得到 ' + (8 - out) + ' 个电子', false, '最外层有 ' + out + ' 个电子，在化学反应中容易<b>得到</b> ' + (8 - out) + ' 个电子凑满 8 个，变成 ' + ionHTML(el[0], out - 8) + '。试试把电子加上 ' + (8 - out) + ' 个。'];
      return [l1, '不容易得失电子', false, '最外层有 ' + out + ' 个电子，既不容易得到也不容易失去，初中不讨论它的离子。'];
    }
    if (ION[p] === q) return [l1, '相对稳定结构', true, '这是初中常见的离子，最外层达到了<b>相对稳定结构</b>。'];
    return [l1, '不常见的微粒', false, ION[p] ? '这种离子不常见。' + el[1] + '元素常见的离子是 ' + ionHTML(el[0], ION[p]) + '。' : el[1] + '元素在初中一般不形成简单离子。'];
  }

  function atomReadout(info) {
    var el = EL[p], q = p - e, sh = shells(e);
    L.$('#p-out').textContent = p; L.$('#n-out').textContent = n; L.$('#e-out').textContent = e;
    L.$('#p-dec').disabled = p <= 1; L.$('#p-inc').disabled = p >= 20;
    L.$('#n-dec').disabled = n <= nRange()[0]; L.$('#n-inc').disabled = n >= nRange()[1];
    L.$('#e-dec').disabled = e <= eRange()[0]; L.$('#e-inc').disabled = e >= eRange()[1];
    L.$('#el-out').innerHTML = el[1] + ' <small>' + el[0] + '</small>';
    L.$('#z-out').textContent = p;
    L.$('#mass-out').innerHTML = '≈ ' + (p + n);
    L.$('#kind-out').innerHTML = q === 0 ? '原子' : ionHTML(el[0], q) + '<small>' + (q > 0 ? '阳离子' : '阴离子') + '</small>';
    L.$('#shell-out').textContent = sh.length ? sh.join('、') : '没有电子';
    L.$('#atom-badge').textContent = q === 0 ? '原子' : q > 0 ? '阳离子' : '阴离子';
    var t = q === 0
      ? '质子数 = 电子数 = ' + p + '，正负电荷抵消，原子<b>不显电性</b>。'
      : '质子 ' + p + ' 个、电子 ' + e + ' 个，电子' + (q > 0 ? '少了 ' + q : '多了 ' + (-q)) + ' 个，带 ' + Math.abs(q) + ' 个单位' + (q > 0 ? '正' : '负') + '电荷，写作 <b>' + ionHTML(el[0], q) + '</b>。质子数没变，<b>仍是' + el[1] + '元素</b>。';
    t += ' ' + info[3];
    var c = el[3];
    if (n !== c) {
      if (p === 1 && n <= 2) t += ' 中子数是 ' + n + '：自然界确实有这种氢原子。质子数还是 1，所以<b>仍然是氢元素</b>。';
      else t += ' 中子数和最常见的' + el[1] + '原子（' + c + ' 个）不同，但质子数没变，<b>仍然是' + el[1] + '元素</b>，只是相对原子质量变成约 ' + (p + n) + '。这样的原子不一定能稳定存在，这里只作演示。';
    } else if (p === 17) t += ' 周期表上氯的相对原子质量是 35.5，因为自然界的氯是中子数为 18 和 20 的两种原子混在一起。';
    L.$('#atom-text').innerHTML = t;
    var key = el[0] + (q === 0 ? '' : chargeStr(q));
    presets.set(PRESET.some(function (x) { return x.value === key; }) && n === c ? key : '');
    save();
  }

  function setP(v) { p = L.clamp(v, 1, 20); n = EL[p][3]; e = p; drawAtom(); }
  L.$('#p-dec').addEventListener('click', function () { setP(p - 1); });
  L.$('#p-inc').addEventListener('click', function () { setP(p + 1); });
  L.$('#n-dec').addEventListener('click', function () { n = Math.max(nRange()[0], n - 1); drawAtom(); });
  L.$('#n-inc').addEventListener('click', function () { n = Math.min(nRange()[1], n + 1); drawAtom(); });
  L.$('#e-dec').addEventListener('click', function () { e = Math.max(eRange()[0], e - 1); drawAtom(); });
  L.$('#e-inc').addEventListener('click', function () { e = Math.min(eRange()[1], e + 1); drawAtom(); });
  var PRESET = [
    { label: 'H', value: 'H', z: 1, q: 0 }, { label: 'C', value: 'C', z: 6, q: 0 }, { label: 'O', value: 'O', z: 8, q: 0 },
    { label: 'Na', value: 'Na', z: 11, q: 0 }, { label: 'Cl', value: 'Cl', z: 17, q: 0 },
    { label: L.chem('Na^+'), value: 'Na+', z: 11, q: 1 }, { label: 'Cl<sup>−</sup>', value: 'Cl-', z: 17, q: -1 }, { label: L.chem('Mg^2+'), value: 'Mg2+', z: 12, q: 2 }
  ];
  var presets = L.chips(L.$('#preset-chips'), PRESET, '', function (v) {
    var it = PRESET.filter(function (x) { return x.value === v; })[0];
    p = it.z; n = EL[p][3]; e = p - it.q; drawAtom();
  });

  /* ========== 分子运动：浓氨水与酚酞 ========== */
  var mol = L.$('#mol');
  var mdefs = S('defs', {}, mol);
  S('rect', { x: 0, y: 0, width: 400, height: 230, rx: 14 }, S('clipPath', { id: 'mol-clip' }, mdefs));
  S('rect', { x: 21, y: 31, width: 258, height: 181 }, S('clipPath', { id: 'bell-clip' }, mdefs));
  var T = Math.round(L.num(st.T, 20, 5, 60));
  var tempIn = L.$('#temp-in');
  tempIn.value = T;
  var parts = [], absorbed = 0, simT = 0, spawnAcc = 0, finish = null, NEED = 18;
  var BELL = { x0: 24, x1: 276, y0: 35, y1: 209 };
  var BA = { x0: 50, x1: 110, top: 128, liq: 150 }, BB = { x0: 190, x1: 250, top: 128, liq: 150 };
  function speed() { return 20 + 1.6 * T; }
  function mix(a, b, k) {
    var pa = [1, 3, 5].map(function (i) { return parseInt(a.substr(i, 2), 16); });
    var pb = [1, 3, 5].map(function (i) { return parseInt(b.substr(i, 2), 16); });
    return 'rgb(' + pa.map(function (v, i) { return Math.round(v + (pb[i] - v) * k); }).join(',') + ')';
  }
  function spawn(dt) {
    spawnAcc += dt * (1.5 + T * 0.12);
    while (spawnAcc >= 1) {
      spawnAcc -= 1;
      if (parts.length < 80) parts.push({ x: 56 + Math.random() * 48, y: 147, a: -Math.PI / 2 + (Math.random() - 0.5) * 1.6 });
    }
  }
  function inside(b, x, y) { return x > b.x0 && x < b.x1 && y > b.top; }
  function step(dt) {
    var v = speed();
    for (var i = parts.length - 1; i >= 0; i--) {
      var q = parts[i];
      if (Math.random() < dt * 4) q.a += (Math.random() - 0.5) * 2.6;
      var nx = q.x + Math.cos(q.a) * v * dt, ny = q.y + Math.sin(q.a) * v * dt;
      if (nx < BELL.x0 || nx > BELL.x1) { nx = L.clamp(nx, BELL.x0, BELL.x1); q.a = Math.PI - q.a; }
      if (ny < BELL.y0 || ny > BELL.y1) { ny = L.clamp(ny, BELL.y0, BELL.y1); q.a = -q.a; }
      var gone = false;
      [BA, BB].forEach(function (b) {
        if (gone) return;
        var inN = inside(b, nx, ny), inO = inside(b, q.x, q.y);
        if (inN !== inO && (inO ? ny > b.top : q.y > b.top)) { nx = q.x; q.a = Math.PI - q.a; inN = inO; }
        if (inN && (b === BB ? ny > b.top + 8 : ny > b.liq)) {
          if (b === BB) { gone = true; absorbed++; if (absorbed >= NEED && !finish) finish = { t: simT, T: T, skip: false }; }
          else { ny = b.liq; if (Math.sin(q.a) > 0) q.a = -q.a; }
        }
      });
      if (gone) parts.splice(i, 1);
      else { q.x = nx; q.y = ny; }
    }
  }
  function beaker(g, x0, liquid, label) {
    S('rect', { x: x0 + 1, y: 150, width: 58, height: 61, fill: liquid }, g);
    S('path', { d: 'M' + x0 + ' 128V206Q' + x0 + ' 212 ' + (x0 + 6) + ' 212H' + (x0 + 54) + 'Q' + (x0 + 60) + ' 212 ' + (x0 + 60) + ' 206V128', fill: 'none', stroke: '#8fb0bf', 'stroke-width': 1.6 }, g);
    S('text', { x: x0 + 30, y: 226, 'font-size': 10, 'text-anchor': 'middle', fill: '#5c6968', text: label }, g);
  }
  function drawMol() {
    mol.innerHTML = ''; mol.appendChild(mdefs);
    var g = S('g', { 'clip-path': 'url(#mol-clip)' }, mol);
    S('rect', { x: 0, y: 0, width: 400, height: 230, rx: 14, fill: '#fbfaf7' }, g);
    S('rect', { x: 8, y: 212, width: 384, height: 3, fill: '#d9e1e0' }, g);
    var k = Math.min(1, absorbed / NEED);
    beaker(g, 50, '#eef5f8', 'A 浓氨水');
    beaker(g, 190, mix('#e6f2f7', '#ea6f9f', k), 'B 酚酞溶液');
    beaker(g, 310, '#e6f2f7', 'C 酚酞溶液');
    var pg = S('g', { 'clip-path': 'url(#bell-clip)' }, g);
    parts.forEach(function (q) { S('circle', { cx: q.x.toFixed(1), cy: q.y.toFixed(1), r: 2.6, fill: '#4f6fb3' }, pg); });
    S('path', { d: 'M20 212V44Q20 30 34 30H266Q280 30 280 44V212', fill: 'none', stroke: '#8fb0bf', 'stroke-width': 2 }, g);
    S('text', { x: 150, y: 22, 'font-size': 10, 'text-anchor': 'middle', fill: '#5c6968', text: '大烧杯罩住 A 和 B' }, g);
    S('circle', { cx: 300, cy: 30, r: 3, fill: '#4f6fb3' }, g);
    S('text', { x: 308, y: 33.5, 'font-size': 10, fill: '#5c6968', text: '氨分子（示意）' }, g);
    molReadout(k);
  }
  function molReadout(k) {
    L.$('#temp-out').textContent = T + ' ℃';
    L.$('#speed-out').textContent = T < 15 ? '较慢' : T < 35 ? '中等' : T < 50 ? '较快' : '很快';
    L.$('#time-out').innerHTML = L.qty(simT, 's', 0);
    L.$('#c-out').textContent = '无色';
    L.$('#b-out').textContent = k === 0 ? '无色' : k < 1 ? '渐渐变红' : '红色';
    L.$('#mol-badge').textContent = k === 0 ? 'B 还没变色' : k < 1 ? 'B 正在变红' : 'B 变红了';
    var t;
    if (k === 0) t = 'A 和 B 并没有接触，可浓氨水里的<b>氨分子</b>不停地跑出来，在大烧杯里四处乱窜。温度越高，它们跑得越快。';
    else if (k < 1) t = '已经有氨分子钻进 B，溶进水里形成氨水，氨水能使酚酞溶液变红。颜色越来越深，说明进去的氨分子越来越多。';
    else {
      t = 'B 变红了，C 始终无色。C 说明空气本身不能让酚酞变红，B 变红是因为氨分子<b>运动</b>到了 B 中。';
      if (finish && !finish.skip) t += ' 这次在 ' + finish.T + ' ℃ 下用了约 ' + L.fmt(finish.t, 0) + ' 秒。' + (finish.T < 40 ? '把温度调高再做一次，会快得多。' : '温度高，分子运动快，所以变红得快。');
    }
    L.$('#mol-text').innerHTML = t;
    save();
  }
  var molVisible = true, molAnim = null;
  function runMol() {
    if (molAnim || !molVisible || document.hidden) return;
    molAnim = L.loop(function (dt) {
      if (!molVisible || document.hidden) { molAnim = null; return false; }
      simT += dt; spawn(dt); step(dt); drawMol();
    });
    if (L.REDUCED) molAnim = null;
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { molVisible = es[0].isIntersecting; if (molVisible) runMol(); }).observe(mol);
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) runMol(); });
  L.bindRange(tempIn, function (v) { T = v; if (!molAnim) drawMol(); });
  L.$('#mol-reset').addEventListener('click', function () { parts = []; absorbed = 0; simT = 0; spawnAcc = 0; finish = null; drawMol(); runMol(); });
  L.$('#mol-skip').addEventListener('click', function () {
    for (var i = parts.length; i < 50; i++) parts.push({ x: 30 + Math.random() * 240, y: 40 + Math.random() * 80, a: Math.random() * 6.28 });
    if (absorbed < NEED) { absorbed = NEED; finish = { t: simT, T: T, skip: true }; }
    drawMol();
  });

  /* ========== 元素周期表前 20 号 ========== */
  var z = Math.round(L.num(st.z, 8, 1, 20));
  var grid = L.$('#pt-grid'), cells = [];
  function pos(k) { if (k === 1) return [1, 1]; if (k === 2) return [1, 8]; if (k <= 10) return [2, k - 2]; if (k <= 18) return [3, k - 10]; return [4, k - 18]; }
  for (var k = 1; k <= 20; k++) (function (k) {
    var el = EL[k], ps = pos(k);
    var b = L.html('button', { type: 'button', 'aria-pressed': String(k === z), 'aria-label': el[1] + ' ' + el[0] + '，原子序数 ' + k,
      html: '<small style="display:block;font-size:11.5px;opacity:.75">' + k + '</small><b style="display:block;font-size:17px;font-family:var(--font-ui)">' + el[0] + '</b><span style="display:block;font-size:12px">' + el[1] + '</span>' }, grid);
    b.style.cssText = 'grid-row:' + ps[0] + ';grid-column:' + ps[1] + ';padding:4px 0;border-radius:9px;background:' + CAT[el[4]][1] + ';color:#1f302e;line-height:1.25;min-height:54px;border:2px solid transparent;font-family:var(--font-ui)';
    b.addEventListener('click', function () { z = k; showPT(); });
    cells[k] = b;
  })(k);

  var cell = L.$('#pt-cell');
  function drawCell() {
    var el = EL[z];
    cell.innerHTML = '';
    S('rect', { x: 0, y: 0, width: 400, height: 130, rx: 12 }, S('clipPath', { id: 'cell-clip' }, S('defs', {}, cell)));
    var g = S('g', { 'clip-path': 'url(#cell-clip)' }, cell);
    S('rect', { x: 0, y: 0, width: 400, height: 130, rx: 12, fill: '#fbfaf7' }, g);
    S('rect', { x: 150, y: 12, width: 100, height: 106, rx: 6, fill: CAT[el[4]][1], stroke: CAT[el[4]][2], 'stroke-width': 1.6 }, g);
    S('text', { x: 158, y: 36, 'font-size': 15, fill: '#1f302e', text: z }, g);
    S('text', { x: 242, y: 38, 'font-size': 20, 'text-anchor': 'end', 'font-weight': 700, fill: '#1f302e', text: el[0] }, g);
    S('text', { x: 200, y: 80, 'font-size': 21, 'text-anchor': 'middle', fill: '#1f302e', text: el[1] }, g);
    S('text', { x: 200, y: 108, 'font-size': 14, 'text-anchor': 'middle', fill: '#1f302e', text: el[2] }, g);
    var a = { stroke: '#9aa7a6', 'stroke-width': 1 }, tl = { 'font-size': 10.5, fill: '#2c736f', 'font-weight': 600 };
    S('line', Object.assign({ x1: 132, y1: 31, x2: 155, y2: 31 }, a), g);
    S('text', Object.assign({ x: 128, y: 35, 'text-anchor': 'end', text: '原子序数（= 质子数）' }, tl), g);
    S('line', Object.assign({ x1: 132, y1: 75, x2: 178, y2: 75 }, a), g);
    S('text', Object.assign({ x: 128, y: 79, 'text-anchor': 'end', text: '元素名称' }, tl), g);
    S('line', Object.assign({ x1: 246, y1: 31, x2: 268, y2: 31 }, a), g);
    S('text', Object.assign({ x: 272, y: 35, text: '元素符号' }, tl), g);
    S('line', Object.assign({ x1: 222, y1: 103, x2: 268, y2: 103 }, a), g);
    S('text', Object.assign({ x: 272, y: 107, text: '相对原子质量' }, tl), g);
    S('text', { x: 272, y: 121, 'font-size': 9.5, fill: '#6b7877', text: '（单位是“1”，不写 g）' }, g);
  }
  var EXTRA = { 1: '原子序数最小，最常见的氢原子没有中子。', 6: '相对原子质量就是以一种碳原子质量的 1/12 为标准比出来的。', 7: '空气中含量最多的元素。', 8: '地壳中含量最多的元素。', 13: '地壳中含量最多的金属元素。', 14: '地壳中含量第二的元素。', 20: '人体中含量最多的金属元素，骨骼和牙齿里很多。', 17: '相对原子质量 35.5 不是整数，因为自然界的氯是两种氯原子的混合。' };
  function showPT() {
    var el = EL[z], sh = shells(z);
    cells.forEach(function (b, k) { if (!b) return; b.setAttribute('aria-pressed', String(k === z)); b.style.borderColor = k === z ? '#2c736f' : 'transparent'; });
    L.$('#pt-name').textContent = el[1] + ' ' + el[0];
    L.$('#pt-badge').textContent = CAT[el[4]][0];
    L.$('#pt-z').textContent = z;
    L.$('#pt-mass').textContent = el[2];
    L.$('#pt-shell').textContent = sh.join('、');
    var t;
    if (el[4] === 'metal') t = '名字带“钅”字旁，是<b>金属</b>元素。最外层 ' + sh[sh.length - 1] + ' 个电子，容易失去。';
    else if (el[4] === 'noble') t = '“气”字头，常温下是气体。最外层 ' + sh[sh.length - 1] + ' 个电子，是相对稳定结构，属于<b>稀有气体</b>元素，化学性质很不活泼。';
    else t = (GAS[z] ? '“气”字头，单质常温下是气体' : '“石”字旁，单质常温下是固体') + '，属于<b>非金属</b>元素。';
    t += ' 原子有 ' + sh.length + ' 层电子，正好排在第 ' + sh.length + ' 行（周期）。' + (EXTRA[z] || '');
    L.$('#pt-text').innerHTML = t;
    drawCell();
    save();
  }
  L.$('#pt-build').addEventListener('click', function () {
    setP(z);
    atomSvg.scrollIntoView({ behavior: L.REDUCED ? 'auto' : 'smooth', block: 'center' });
  });

  function save() { L.setState({ p: p, n: n, e: e, T: T, z: z }); }

  drawAtom();
  drawMol();
  showPT();
  runMol();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '搭一个最常见的钠原子',
      desc: '钠是 11 号元素，相对原子质量约为 23。在组装台上把质子、中子、电子都调好。',
      label: '在原子组装台上操作',
      button: '检查我的原子',
      check: function () {
        if (p !== 11) return { ok: false, msg: '现在是' + EL[p][1] + '元素。钠的原子序数是 11，质子数就该是 11。' };
        if (n !== 12) return { ok: false, msg: '相对原子质量 ≈ 质子数 + 中子数，23 − 11 = ？现在中子是 ' + n + ' 个。' };
        if (e !== 11) return { ok: false, msg: '原子不显电性，电子数要等于质子数。现在电子是 ' + e + ' 个。' };
        return { ok: true, msg: '11 个质子、12 个中子、11 个电子，排成 2、8、1。最外层只有 1 个电子，容易失去。' };
      }
    },
    {
      level: 'base',
      title: '决定元素种类的是原子的',
      desc: '想想组装台上改哪个数，元素名称才会变。',
      options: ['质子数（核电荷数）', '中子数', '最外层电子数', '相对原子质量'],
      answer: 0,
      hint: '在组装台上分别改中子数、电子数，元素名称变了吗？',
      explain: '元素是<b>质子数相同</b>的一类原子的总称，所以质子数决定元素种类。中子数变了还是同种元素；最外层电子数决定的是化学性质（容易得还是失电子）；相对原子质量由质子数和中子数共同决定。'
    },
    {
      level: 'base',
      title: '下列元素符号书写正确的是',
      desc: '记住“一大二小”。',
      options: ['Ca（钙）', 'CA（钙）', 'cl（氯）', 'NA（钠）'],
      answer: 0,
      hint: '两个字母的符号，哪个大写、哪个小写？',
      explain: '元素符号由两个字母组成时，<b>第一个大写、第二个小写</b>：Ca、Cl、Na。写成 CA、NA 就变成两个元素符号连在一起了，cl 第一个字母没有大写。'
    },
    {
      level: 'mid',
      title: '把氯原子变成氯离子',
      desc: '氯原子最外层有 7 个电子，容易得到电子形成相对稳定结构。在组装台上做出 Cl<sup>−</sup>。',
      label: '在原子组装台上操作',
      button: '检查这个微粒',
      check: function () {
        if (p !== 17) return { ok: false, msg: '先把质子数调成 17（或点“快速搭”里的 Cl）。' };
        var q = p - e;
        if (q === 0) return { ok: false, msg: '现在还是氯原子。氯离子是氯原子<b>得到</b>电子形成的，加电子试试。' };
        if (q > 0) return { ok: false, msg: '你减少了电子，变成了带正电的微粒。氯原子是<b>得到</b>电子。' };
        if (q < -1) return { ok: false, msg: '电子加多了。最外层凑满 8 个就够了，只需得到 1 个。' };
        return { ok: true, msg: '17 个质子、18 个电子，排成 2、8、8，带 1 个单位负电荷。质子数没变，所以仍是氯元素。' };
      }
    },
    {
      level: 'mid',
      title: '在较高温度下让 B 烧杯变红',
      desc: '把温度调到 40 ℃ 以上，点“重新开始”，等 B 自己变红（不要用“直接看结果”）。',
      label: '在分子运动实验里操作',
      button: '检查实验',
      check: function () {
        if (!finish) return { ok: false, msg: 'B 还没完全变红，再等一会儿。' + (T < 40 ? '温度还低于 40 ℃。' : '') };
        if (finish.skip) return { ok: false, msg: '“直接看结果”不算数。点“重新开始”，让分子自己跑过去。' };
        if (finish.T < 40) return { ok: false, msg: '这次是在 ' + finish.T + ' ℃ 下完成的。把温度调到 40 ℃ 以上，再点“重新开始”。' };
        return { ok: true, msg: '在 ' + finish.T + ' ℃ 下用了约 ' + L.fmt(finish.t, 0) + ' 秒就变红了。温度越高，分子运动越快。' };
      }
    },
    {
      level: 'mid',
      title: '夏天自行车轮胎打得太足容易爆胎，用分子的观点解释是',
      desc: '温度升高，轮胎里的气体会怎样？',
      options: ['温度升高，分子间的间隔变大', '温度升高，分子的体积变大', '温度升高，分子的数目变多', '温度升高，分子变成了别的分子'],
      answer: 0,
      hint: '分子本身会不会被“晒大”？',
      explain: '受热时分子运动加快，<b>分子之间的间隔变大</b>，气体体积膨胀，所以容易爆胎。分子本身的大小不变，数目也不会凭空变多；这是物理变化，分子种类没变。'
    },
    {
      level: 'trap',
      title: '化学变化中的最小粒子是',
      desc: '想想氧化汞分解时，什么被拆开了，什么没被拆开。',
      options: ['原子', '分子', '质子', '电子'],
      answer: 0,
      hint: '化学变化中，哪种粒子“可分”，哪种“不可分”？',
      explain: '化学变化中<b>分子可分，原子不可分</b>，原子只是重新组合，所以原子是化学变化中的最小粒子。注意前提是“化学变化中”：原子本身还能再分成原子核和电子，但这在化学变化里不会发生。'
    },
    {
      level: 'trap',
      title: '关于镁原子 Mg 和镁离子 Mg<sup>2+</sup>，下列说法正确的是',
      desc: '可以在组装台上点“快速搭”里的 Mg<sup>2+</sup>，再把电子加回 12 个对比。',
      options: ['质子数相同，属于同种元素', '核外电子数相同', '化学性质相同', '两者的质量相差很大'],
      answer: 0,
      hint: '镁原子变成镁离子时，改变的是哪种粒子？',
      explain: 'Mg 失去 2 个电子变成 Mg<sup>2+</sup>，<b>质子数都是 12</b>，属于同种元素。电子数一个是 12、一个是 10，不相同；最外层电子数不同，化学性质也不同；电子质量很小，两者质量几乎相等。'
    }
  ]);
})();
