/* 化学互动馆 · 第 5 课 化学反应的定量关系 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();

  /* —— 化学式工具 —— */
  var SUBS = '₀₁₂₃₄₅₆₇₈₉';
  function U(s) { return String(s).replace(/([A-Za-z\)])(\d+)/g, function (m, a, d) { return a + d.replace(/\d/g, function (c) { return SUBS[c]; }); }); }
  function eqSign(c) {
    var w = c ? Math.max(1.8, c.length * 0.7 + 0.5) : 1.4;
    return '<span style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;margin:0 .35em;line-height:1">' +
      '<span style="font-size:.6em;min-height:1.1em;color:#2c736f">' + (c || '') + '</span>' +
      '<span style="display:block;width:' + w + 'em;height:.32em;border-top:1.5px solid currentColor;border-bottom:1.5px solid currentColor"></span>' +
      '<span style="font-size:.6em;min-height:1.1em"></span></span>';
  }
  function eq(s) {
    return s.split(' ').map(function (t) {
      if (t === '+') return ' + ';
      if (t === '=') return eqSign('');
      if (t === '→') return '<span style="margin:0 .45em;color:#8a9796">⟶</span>';
      var m = t.match(/^=(.+)=$/);
      if (m) return eqSign(m[1]);
      return L.chem(t);
    }).join('');
  }
  L.$$('[data-eq]').forEach(function (el) { el.innerHTML = eq(el.dataset.eq); });

  /* ========== ① 配平小游戏 ========== */
  var RX = {
    h2: { label: '氢气燃烧', cond: '点燃', L: [{ f: 'H2', a: { H: 2 } }, { f: 'O2', a: { O: 2 } }], R: [{ f: 'H2O', a: { H: 2, O: 1 } }],
      hint: '先看氧：左边 O<sub>2</sub> 有 2 个 O，右边 H<sub>2</sub>O 只有 1 个，所以 H<sub>2</sub>O 前写 2；这时右边有 4 个 H，H<sub>2</sub> 前也写 2。' },
    ch4: { label: '甲烷燃烧', cond: '点燃', L: [{ f: 'CH4', a: { C: 1, H: 4 } }, { f: 'O2', a: { O: 2 } }], R: [{ f: 'CO2', a: { C: 1, O: 2 } }, { f: 'H2O', a: { H: 2, O: 1 } }],
      hint: '碳已经平了。再配氢：左边 4 个 H，每个 H<sub>2</sub>O 只有 2 个，H<sub>2</sub>O 前写 2；最后数右边的 O：2 + 2 = 4 个，O<sub>2</sub> 前写 2。' },
    p: { label: '红磷燃烧', cond: '点燃', L: [{ f: 'P', a: { P: 1 } }, { f: 'O2', a: { O: 2 } }], R: [{ f: 'P2O5', a: { P: 2, O: 5 } }],
      hint: '用最小公倍数法配氧：左边 O 是 2 的倍数，右边是 5 的倍数，最小公倍数是 10。所以 O<sub>2</sub> 前写 5，P<sub>2</sub>O<sub>5</sub> 前写 2，再让 P 对齐。' },
    fe: { label: '铁丝燃烧', cond: '点燃', L: [{ f: 'Fe', a: { Fe: 1 } }, { f: 'O2', a: { O: 2 } }], R: [{ f: 'Fe3O4', a: { Fe: 3, O: 4 } }],
      hint: '铁丝在氧气里燃烧生成的是四氧化三铁 Fe<sub>3</sub>O<sub>4</sub>。右边有 4 个 O，O<sub>2</sub> 前写 2；右边有 3 个 Fe，Fe 前写 3。' },
    al: { label: '铝燃烧', cond: '点燃', L: [{ f: 'Al', a: { Al: 1 } }, { f: 'O2', a: { O: 2 } }], R: [{ f: 'Al2O3', a: { Al: 2, O: 3 } }],
      hint: '氧的个数 2 和 3 的最小公倍数是 6：O<sub>2</sub> 前写 3，Al<sub>2</sub>O<sub>3</sub> 前写 2，这时右边有 4 个 Al，Al 前写 4。' },
    eth: { label: '酒精燃烧', cond: '点燃', L: [{ f: 'C2H5OH', a: { C: 2, H: 6, O: 1 } }, { f: 'O2', a: { O: 2 } }], R: [{ f: 'CO2', a: { C: 1, O: 2 } }, { f: 'H2O', a: { H: 2, O: 1 } }],
      hint: '先配 C 和 H：2 个 C 需要 2 个 CO<sub>2</sub>，6 个 H 需要 3 个 H<sub>2</sub>O。右边 O 一共 2×2 + 3 = 7 个，酒精自己带了 1 个，还差 6 个，所以 O<sub>2</sub> 前写 3。' },
    kmn: { label: '加热高锰酸钾', cond: '△', L: [{ f: 'KMnO4', a: { K: 1, Mn: 1, O: 4 } }], R: [{ f: 'K2MnO4', a: { K: 2, Mn: 1, O: 4 } }, { f: 'MnO2', a: { Mn: 1, O: 2 } }, { f: 'O2', a: { O: 2 }, up: true }],
      hint: '先配钾：右边 K<sub>2</sub>MnO<sub>4</sub> 里有 2 个 K，所以 KMnO<sub>4</sub> 前写 2。再数一数 Mn 和 O，会发现已经全平了。生成的氧气要标“↑”。' }
  };
  var RX_ORDER = ['h2', 'ch4', 'p', 'fe', 'al', 'eth', 'kmn'];
  var COL = { H: ['#ffffff', '#7d8a89', '#33403f'], O: ['#e0604c', '#b8432f', '#fff'], C: ['#4a4f55', '#2e3236', '#fff'], Fe: ['#a8714a', '#7a4e30', '#fff'],
    Al: ['#c9d1d8', '#8e99a4', '#33403f'], P: ['#e39a3b', '#b5741f', '#fff'], K: ['#9b7cc4', '#6f53a0', '#fff'], Mn: ['#d07ca2', '#a8547c', '#fff'] };

  var rxKey = RX[st.rx] ? st.rx : 'ch4';
  var coef = [];
  function species() { var r = RX[rxKey]; return r.L.concat(r.R); }
  function resetCoef(fromState) {
    var n = species().length, arr = fromState ? String(fromState).split(',') : [];
    coef = [];
    for (var i = 0; i < n; i++) coef.push(Math.round(L.num(arr[i], 1, 1, 9)));
  }
  resetCoef(st.c);

  function elems() {
    var out = [];
    species().forEach(function (sp) { for (var e in sp.a) if (out.indexOf(e) < 0) out.push(e); });
    return out;
  }
  function counts() {
    var r = RX[rxKey], c = { L: {}, R: {} };
    elems().forEach(function (e) { c.L[e] = 0; c.R[e] = 0; });
    r.L.forEach(function (sp, i) { for (var e in sp.a) c.L[e] += coef[i] * sp.a[e]; });
    r.R.forEach(function (sp, i) { for (var e in sp.a) c.R[e] += coef[r.L.length + i] * sp.a[e]; });
    return c;
  }
  function status() {
    var c = counts(), es = elems();
    var bad = es.filter(function (e) { return c.L[e] !== c.R[e]; });
    var g = coef.reduce(function (a, b) { return L.gcd(a, b); });
    return { c: c, es: es, bad: bad, balanced: !bad.length, minimal: g === 1, done: !bad.length && g === 1 };
  }

  var termsEl = L.$('#bal-terms'), valEls = [];
  var BTN = 'width:34px;height:22px;border-radius:7px;background:#e6f2f1;color:#2c736f;font-size:17px;line-height:1;font-weight:700;padding:0';
  function buildTerms() {
    termsEl.innerHTML = ''; valEls = [];
    var r = RX[rxKey];
    species().forEach(function (sp, i) {
      if (i > 0) L.html('span', { text: i === r.L.length ? '⟶' : '+', 'aria-hidden': 'true', style: 'font-size:18.5px;color:#8a9796;padding:0 2px' }, termsEl);
      var box = L.html('div', { style: 'display:flex;flex-direction:column;align-items:center;gap:3px;background:#f4f7f6;border:1px solid var(--line);border-radius:12px;padding:4px 6px' }, termsEl);
      var plus = L.html('button', { type: 'button', text: '+', 'aria-label': '增加 ' + sp.f + ' 前的化学计量数', style: BTN }, box);
      var mid = L.html('div', { style: 'display:flex;align-items:baseline;gap:2px;font-family:var(--font-ui)' }, box);
      valEls[i] = L.html('b', { style: 'font-size:20.5px;color:#c2603f;min-width:12px;text-align:right;font-variant-numeric:tabular-nums' }, mid);
      L.html('span', { html: L.chem(sp.f), style: 'font-size:18.5px' }, mid);
      var minus = L.html('button', { type: 'button', text: '−', 'aria-label': '减少 ' + sp.f + ' 前的化学计量数', style: BTN }, box);
      plus.addEventListener('click', function () { setCoef(i, coef[i] + 1); });
      minus.addEventListener('click', function () { setCoef(i, coef[i] - 1); });
    });
  }
  function setCoef(i, v) { coef[i] = L.clamp(v, 1, 9); hintOn = false; updateBal(); }

  var atomsSvg = L.$('#atoms');
  var aDefs = S('defs', {}, atomsSvg);
  S('rect', { x: 0, y: 0, width: 400, height: 230, rx: 14 }, S('clipPath', { id: 'atoms-clip' }, aDefs));
  function dots(g, n, x0, cy, dir, e) {
    var cols = 12, sp = 7, rows = Math.max(1, Math.ceil(n / cols));
    var top = cy - (rows - 1) * sp / 2;
    for (var i = 0; i < n; i++) {
      var c = i % cols, r = Math.floor(i / cols);
      S('circle', { cx: x0 + dir * c * sp, cy: top + r * sp, r: 2.9, fill: COL[e][0], stroke: COL[e][1], 'stroke-width': 0.9 }, g);
    }
  }
  function drawAtoms(s) {
    atomsSvg.innerHTML = ''; atomsSvg.appendChild(aDefs);
    S('rect', { x: 0, y: 0, width: 400, height: 230, rx: 14, fill: '#fbfaf7' }, atomsSvg);
    var g = S('g', { 'clip-path': 'url(#atoms-clip)' }, atomsSvg);
    S('text', { x: 110, y: 20, 'font-size': 11, 'text-anchor': 'middle', fill: '#546160', 'font-weight': 600, text: '反应物一边（左）' }, g);
    S('text', { x: 290, y: 20, 'font-size': 11, 'text-anchor': 'middle', fill: '#546160', 'font-weight': 600, text: '生成物一边（右）' }, g);
    var n = s.es.length, rowH = Math.min(62, 176 / n), y0 = 30 + (176 - rowH * n) / 2;
    s.es.forEach(function (e, k) {
      var cy = y0 + rowH * k + rowH / 2, l = s.c.L[e], r = s.c.R[e], ok = l === r;
      S('rect', { x: 8, y: y0 + rowH * k + 3, width: 384, height: rowH - 6, rx: 10, fill: ok ? '#edf5ee' : '#fbf1ea' }, g);
      dots(g, l, 172, cy, -1, e);
      dots(g, r, 228, cy, 1, e);
      S('circle', { cx: 200, cy: cy - 7, r: 12, fill: COL[e][0], stroke: COL[e][1], 'stroke-width': 1.5 }, g);
      S('text', { x: 200, y: cy - 3, 'font-size': e.length > 1 ? 10 : 11.5, 'text-anchor': 'middle', 'font-weight': 700, fill: COL[e][2], text: e }, g);
      S('text', { x: 200, y: cy + 17, 'font-size': 10, 'text-anchor': 'middle', 'font-weight': 600, fill: ok ? '#2f6a4a' : '#a4492b', text: ok ? '相等' : (l > r ? '左多 ' : '右多 ') + Math.abs(l - r) }, g);
      S('text', { x: 22, y: cy + 5, 'font-size': 14, 'font-weight': 700, fill: '#33403f', text: l }, g);
      S('text', { x: 378, y: cy + 5, 'font-size': 14, 'font-weight': 700, 'text-anchor': 'end', fill: '#33403f', text: r }, g);
    });
    var msg = s.done ? '每种原子左右一样多，配平了' : s.balanced ? '原子数相等了，但化学计量数还能约分' : '一个圆点 = 一个原子';
    S('text', { x: 200, y: 222, 'font-size': 10.5, 'text-anchor': 'middle', fill: s.done ? '#2f6a4a' : '#7a8786', 'font-weight': s.done ? 700 : 400, text: msg }, g);
  }

  var hintOn = false;
  function eqString(s) {
    var r = RX[rxKey], sp = species();
    function side(arr, off) {
      return arr.map(function (x, i) { var c = coef[off + i]; return (c > 1 ? c : '') + x.f + (s.done && x.up ? '↑' : ''); }).join(' + ');
    }
    return side(r.L, 0) + (s.done ? ' =' + r.cond + '= ' : ' → ') + side(r.R, r.L.length);
  }
  function updateBal() {
    var s = status(), r = RX[rxKey];
    coef.forEach(function (c, i) { valEls[i].textContent = c; valEls[i].style.color = c === 1 ? '#a7b3b2' : '#c2603f'; });
    drawAtoms(s);
    var sumL = 0, sumR = 0;
    s.es.forEach(function (e) { sumL += s.c.L[e]; sumR += s.c.R[e]; });
    L.$('#bal-left').innerHTML = sumL + '<small>个</small>';
    L.$('#bal-right').innerHTML = sumR + '<small>个</small>';
    L.$('#bal-diff').textContent = s.bad.length ? s.bad.map(function (e) { return e + '（左 ' + s.c.L[e] + '，右 ' + s.c.R[e] + '）'; }).join('　') : (s.minimal ? '没有，全部对齐了' : '都对齐了，但还能约分');
    L.$('#bal-badge').textContent = s.done ? '已配平' : s.balanced ? '要约成最简' : '未配平';
    L.$('#bal-eq').innerHTML = eq(eqString(s));
    var tb = L.$('#atom-table tbody');
    tb.innerHTML = '';
    s.es.forEach(function (e) {
      var ok = s.c.L[e] === s.c.R[e];
      L.html('tr', { class: ok ? '' : null, html: '<td><b>' + e + '</b></td><td class="n">' + s.c.L[e] + '</td><td class="n">' + s.c.R[e] + '</td><td style="color:' + (ok ? '#2f6a4a' : '#a4492b') + ';font-weight:600">' + (ok ? '✓ 相等' : '✗ 差 ' + Math.abs(s.c.L[e] - s.c.R[e])) + '</td>' }, tb);
    });
    var t;
    if (hintOn) t = '<b>提示：</b>' + r.hint;
    else if (s.done) t = '配平了！把短线改成等号，写上条件“' + r.cond + '”' + (species().some(function (x) { return x.up; }) ? '，反应物里没有气体而生成了氧气，所以 O<sub>2</sub> 后面标“↑”' : '') + '。注意：从头到尾你只改了化学式<b>前面</b>的数字，化学式本身一个字都没动。';
    else if (s.balanced) t = '每种原子都相等了，可这几个化学计量数还有公因数 ' + coef.reduce(function (a, b) { return L.gcd(a, b); }) + '。化学方程式要用<b>最简整数比</b>，把它们都除以公因数。';
    else t = '数一数：' + s.bad.map(function (e) { return e + ' 原子' + (s.c.L[e] > s.c.R[e] ? '左边多' : '右边多'); }).join('，') + '。只能改化学式<b>前面</b>的化学计量数，不能动右下角的小数字。卡住了可以点“给我一点提示”。';
    L.$('#bal-text').innerHTML = t;
    save();
  }
  L.chips(L.$('#rx-chips'), RX_ORDER.map(function (k) { return { label: RX[k].label, value: k }; }), rxKey, function (v) {
    rxKey = v; hintOn = false; resetCoef(); buildTerms(); updateBal();
  });
  L.$('#bal-hint').addEventListener('click', function () { hintOn = !hintOn; updateBal(); });
  L.$('#bal-reset').addEventListener('click', function () { hintOn = false; resetCoef(); updateBal(); });

  /* ========== ② 质量守恒天平 ========== */
  var EXP = {
    p: { label: '红磷燃烧（密闭）', m0: 150, dm: 0 },
    open: { label: '碳酸钠＋盐酸（敞口）', m0: 120, dm: 2.2 },
    closed: { label: '碳酸钠＋盐酸（密闭）', m0: 135, dm: 0 }
  };
  var expKey = EXP[st.ex] ? st.ex : 'p';
  var prog = 0, tNow = 0, runner = null;
  var scaleSvg = L.$('#scale');
  var sDefs = S('defs', {}, scaleSvg);
  S('rect', { x: 0, y: 0, width: 400, height: 250, rx: 14 }, S('clipPath', { id: 'scale-clip' }, sDefs));
  var PX = 200, PY = 186, ARM = 112;
  function massNow() { var e = EXP[expKey]; return e.m0 - e.dm * prog; }

  var GLASS = { fill: '#e9f2f6', 'fill-opacity': 0.75, stroke: '#7f9fc0', 'stroke-width': 1.5 };
  function attrs(base, extra) { var o = {}, k; for (k in base) o[k] = base[k]; for (k in extra) o[k] = extra[k]; return o; }
  function flaskD(x, y) {
    return 'M' + (x - 9) + ' ' + (y - 76) + 'L' + (x - 9) + ' ' + (y - 52) + 'L' + (x - 36) + ' ' + (y - 4) + 'Q' + (x - 37) + ' ' + y + ' ' + (x - 32) + ' ' + y +
      'L' + (x + 32) + ' ' + y + 'Q' + (x + 37) + ' ' + y + ' ' + (x + 36) + ' ' + (y - 4) + 'L' + (x + 9) + ' ' + (y - 52) + 'L' + (x + 9) + ' ' + (y - 76);
  }
  function flame(g, x, y, h) {
    var k = 1 + 0.12 * Math.sin(tNow * 22);
    S('path', { d: 'M' + x + ' ' + (y - h * k) + 'C' + (x + h * 0.45) + ' ' + (y - h * 0.4) + ' ' + (x + h * 0.4) + ' ' + y + ' ' + x + ' ' + y + 'C' + (x - h * 0.4) + ' ' + y + ' ' + (x - h * 0.45) + ' ' + (y - h * 0.4) + ' ' + x + ' ' + (y - h * k) + 'z', fill: '#f2a43a', stroke: '#d97a1f', 'stroke-width': 0.8 }, g);
    S('path', { d: 'M' + x + ' ' + (y - h * 0.55) + 'C' + (x + h * 0.2) + ' ' + (y - h * 0.25) + ' ' + (x + h * 0.18) + ' ' + y + ' ' + x + ' ' + y + 'C' + (x - h * 0.18) + ' ' + y + ' ' + (x - h * 0.2) + ' ' + (y - h * 0.25) + ' ' + x + ' ' + (y - h * 0.55) + 'z', fill: '#ffe08a' }, g);
  }
  function bubbles(g, x, y, w, h, n) {
    for (var i = 0; i < n; i++) {
      var ph = (tNow * 0.9 + i / n) % 1, bx = x + ((i * 37) % 100) / 100 * w;
      S('circle', { cx: bx + Math.sin(tNow * 5 + i) * 1.5, cy: y - ph * h, r: 1.6 + (i % 3) * 0.6, fill: 'none', stroke: '#6f9fb9', 'stroke-width': 0.9 }, g);
    }
  }
  function balloon(g, x, y, r, tilt) {
    S('ellipse', { cx: x, cy: y - r, rx: r * 0.88, ry: r, fill: '#e8735f', 'fill-opacity': 0.9, stroke: '#c0503d', 'stroke-width': 1, transform: tilt ? 'rotate(' + tilt + ' ' + x + ' ' + y + ')' : null }, g);
  }
  function apparatus(g, x, y) {
    var running = prog > 0 && prog < 1;
    if (expKey === 'p') {
      var smoke = prog <= 0 ? 0 : prog < 0.45 ? prog / 0.45 * 0.85 : 0.85 - (prog - 0.45) * 0.5;
      S('path', attrs(GLASS, { d: flaskD(x, y) }), g);
      if (smoke > 0) S('path', { d: flaskD(x, y) + 'z', fill: '#cfd6d6', opacity: smoke }, g);
      S('rect', { x: x - 31, y: y - 8, width: 62, height: 6, rx: 2, fill: '#e3cf9c' }, g);
      var pr = prog < 0.6 ? 6 - prog * 5 : 3;
      S('ellipse', { cx: x, cy: y - 10, rx: pr, ry: pr * 0.5, fill: '#c2453a' }, g);
      if (prog > 0.02 && prog < 0.6) flame(g, x, y - 11, 13 * (1 - prog * 0.8));
      S('line', { x1: x, y1: y - 104, x2: x, y2: y - 16, stroke: '#9fb6c9', 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
      S('rect', { x: x - 11, y: y - 86, width: 22, height: 12, rx: 2, fill: '#8a6a4d' }, g);
      var bump = prog <= 0 ? 0 : prog < 0.3 ? prog / 0.3 : Math.max(0, 1 - (prog - 0.3) / 0.4);
      var shrink = prog > 0.7 ? (prog - 0.7) / 0.3 : 0;
      balloon(g, x, y - 102, 8 + 9 * bump - 3 * shrink);
      S('text', { x: x + 40, y: y - 6, 'font-size': 9, fill: '#7a6a4d', text: '细沙' }, g);
      S('text', { x: x + 16, y: y - 112, 'font-size': 9, fill: '#a4492b', text: '小气球' }, g);
    } else if (expKey === 'open') {
      var bd = 'M' + (x - 36) + ' ' + (y - 70) + 'L' + (x - 34) + ' ' + (y - 66) + 'L' + (x - 34) + ' ' + (y - 3) + 'Q' + (x - 34) + ' ' + y + ' ' + (x - 31) + ' ' + y + 'L' + (x + 31) + ' ' + y + 'Q' + (x + 34) + ' ' + y + ' ' + (x + 34) + ' ' + (y - 3) + 'L' + (x + 34) + ' ' + (y - 68);
      S('path', attrs(GLASS, { d: bd }), g);
      if (prog > 0) {
        S('rect', { x: x - 33, y: y - 22, width: 66, height: 21, rx: 3, fill: '#cfe6f0', opacity: 0.9 }, g);
        if (running) bubbles(g, x - 28, y - 3, 56, 18, 12);
        S('rect', { x: x + 6, y: y - 56, width: 12, height: 40, rx: 5, fill: '#f4f8fa', stroke: '#8fa9bd', transform: 'rotate(-58 ' + (x + 12) + ' ' + (y - 16) + ')' }, g);
      } else {
        S('path', { d: 'M' + (x - 30) + ' ' + (y - 1) + 'Q' + (x - 14) + ' ' + (y - 14) + ' ' + (x + 2) + ' ' + (y - 1) + 'z', fill: '#f6f6f2', stroke: '#c3cbcb' }, g);
        S('rect', { x: x + 10, y: y - 58, width: 12, height: 56, rx: 5, fill: '#f4f8fa', stroke: '#8fa9bd' }, g);
        S('rect', { x: x + 11.5, y: y - 30, width: 9, height: 26, rx: 4, fill: '#cfe6f0' }, g);
      }
      if (running) {
        [-14, 0, 14].forEach(function (dx, i) {
          var ph = (tNow * 0.8 + i * 0.33) % 1, yy = y - 72 - ph * 40;
          L.arrow(g, x + dx, yy + 14, x + dx + Math.sin(ph * 6) * 3, yy, { color: '#8a9796', width: 1.4, head: 5 });
        });
        S('text', { x: x, y: y - 120, 'font-size': 10, 'text-anchor': 'middle', fill: '#6b7877', 'font-weight': 600, text: U('CO2') + ' 跑进空气' }, g);
      }
      S('text', { x: x - 40, y: y - 74, 'font-size': 9, fill: '#546160', text: '敞口' }, g);
    } else {
      S('path', attrs(GLASS, { d: flaskD(x, y) }), g);
      var liq = 'M' + (x - 25) + ' ' + (y - 22) + 'L' + (x + 25) + ' ' + (y - 22) + 'L' + (x + 35) + ' ' + (y - 3) + 'L' + (x - 35) + ' ' + (y - 3) + 'z';
      S('path', { d: liq, fill: '#cfe6f0', opacity: 0.9 }, g);
      if (running) bubbles(g, x - 22, y - 4, 44, 18, 10);
      if (prog > 0) {
        var rb = 10 + 15 * Math.min(1, prog * 1.4);
        balloon(g, x, y - 74, rb);
      } else {
        S('path', { d: 'M' + (x - 8) + ' ' + (y - 76) + 'Q' + (x - 40) + ' ' + (y - 74) + ' ' + (x - 36) + ' ' + (y - 52) + 'Q' + (x - 22) + ' ' + (y - 50) + ' ' + (x + 8) + ' ' + (y - 76) + 'z', fill: '#e8735f', 'fill-opacity': 0.9, stroke: '#c0503d' }, g);
        S('circle', { cx: x - 30, cy: y - 58, r: 2, fill: '#fff' }, g); S('circle', { cx: x - 25, cy: y - 61, r: 1.6, fill: '#fff' }, g);
        S('text', { x: x - 56, y: y - 82, 'font-size': 9, fill: '#a4492b', text: '气球里装碳酸钠' }, g);
      }
      S('rect', { x: x - 10, y: y - 78, width: 20, height: 5, rx: 2, fill: '#c0503d' }, g);
      S('text', { x: x + 38, y: y - 10, 'font-size': 9, fill: '#3f6f8a', text: '稀盐酸' }, g);
    }
  }
  function drawScale() {
    scaleSvg.innerHTML = ''; scaleSvg.appendChild(sDefs);
    S('rect', { x: 0, y: 0, width: 400, height: 250, rx: 14, fill: '#fbfaf7' }, scaleSvg);
    var g = S('g', { 'clip-path': 'url(#scale-clip)' }, scaleSvg);
    var e = EXP[expKey], t = L.clamp((massNow() - e.m0) * 0.045, -0.1, 0.1);
    var lx = PX - ARM * Math.cos(t), ly = PY + ARM * Math.sin(t), rx = PX + ARM * Math.cos(t), ry = PY - ARM * Math.sin(t);
    S('path', { d: 'M118 242L282 242L268 228L132 228z', fill: '#dde2e1', stroke: '#aab3b2' }, g);
    S('rect', { x: 194, y: PY, width: 12, height: 228 - PY, fill: '#c4cbca' }, g);
    S('line', { x1: lx, y1: ly, x2: rx, y2: ry, stroke: '#7d8a89', 'stroke-width': 6, 'stroke-linecap': 'round' }, g);
    S('circle', { cx: PX, cy: PY, r: 6, fill: '#5e6b6a' }, g);
    [[lx, ly], [rx, ry]].forEach(function (p) {
      S('line', { x1: p[0], y1: p[1], x2: p[0], y2: p[1] - 10, stroke: '#7d8a89', 'stroke-width': 3 }, g);
      S('path', { d: 'M' + (p[0] - 52) + ' ' + (p[1] - 13) + 'L' + (p[0] + 52) + ' ' + (p[1] - 13) + 'L' + (p[0] + 44) + ' ' + (p[1] - 8) + 'L' + (p[0] - 44) + ' ' + (p[1] - 8) + 'z', fill: '#b9c2c1', stroke: '#8e9a99' }, g);
    });
    var ag = S('g', { transform: 'translate(' + lx + ' ' + (ly - 13) + ') scale(1.22) translate(' + (-lx) + ' ' + (-(ly - 13)) + ')' }, g);
    apparatus(ag, lx, ly - 13);
    // 砝码
    var wx = rx, wy = ry - 13;
    [[-16, 26, 22], [14, 18, 15]].forEach(function (w) {
      S('rect', { x: wx + w[0] - w[1] / 2, y: wy - w[2], width: w[1], height: w[2], rx: 3, fill: '#c9a24b', stroke: '#9c7a2e' }, g);
      S('rect', { x: wx + w[0] - 3, y: wy - w[2] - 5, width: 6, height: 5, rx: 2, fill: '#c9a24b', stroke: '#9c7a2e' }, g);
    });
    S('text', { x: rx, y: ry + 14, 'font-size': 10, 'text-anchor': 'middle', fill: '#6b7877', text: '砝码 ' + L.fmt(e.m0, 1) + ' g' }, g);
    var level = Math.abs(t) < 1e-6;
    S('text', { x: 200, y: 22, 'font-size': 12, 'text-anchor': 'middle', 'font-weight': 700, fill: level ? '#2f6a4a' : '#a4492b', text: level ? (prog >= 1 ? '反应结束：天平仍然平衡' : '天平平衡') : '左盘变轻，向上翘起' }, g);
  }
  function readScale() {
    var e = EXP[expKey], m = massNow(), d = m - e.m0;
    L.$('#m-before').innerHTML = L.qty(e.m0, 'g', 1);
    L.$('#m-now').innerHTML = L.qty(m, 'g', 1);
    L.$('#m-diff').textContent = Math.abs(d) < 1e-9 ? '没有变化，天平平衡' : '少了 ' + L.fmt(-d, 1) + ' g，左盘上翘';
    L.$('#scale-badge').textContent = prog > 0 && prog < 1 ? '反应中' : Math.abs(d) < 1e-9 ? '平衡' : '不平衡';
    var ph = prog <= 0 ? 0 : prog < 1 ? 1 : 2, t;
    if (expKey === 'p') t = [
      '锥形瓶底铺一层细沙（防止瓶底局部受热炸裂），放入红磷，塞紧橡胶塞，玻璃管上端系一个小气球。点“开始反应”，用红热的玻璃管引燃红磷。',
      '红磷燃烧，产生大量<b>白烟</b>（五氧化二磷固体小颗粒），放出热量。瓶内气体受热膨胀，气球先鼓起来，它起<b>缓冲气压</b>的作用，防止橡胶塞被冲开。',
      '冷却后气球比开始时还瘪，因为瓶里的氧气被消耗了。但天平<b>仍然平衡</b>：参加反应的红磷和氧气的质量总和，等于生成的五氧化二磷的质量。' + eq('4P + 5O2 =点燃= 2P2O5')][ph];
    else if (expKey === 'open') t = [
      '烧杯里放 5.3 g 碳酸钠粉末，小试管里装足量的稀盐酸，一起放在天平左盘上调平。开始后把稀盐酸倒进烧杯。',
      '立刻冒出大量气泡，这是二氧化碳。烧杯是敞口的，气体一边生成一边跑进空气里，左盘越来越轻。',
      '5.3 g 碳酸钠全部反应，放出 2.2 g 二氧化碳跑掉了，左盘变轻上翘。<b>这并不违背质量守恒定律</b>：把跑掉的 CO<sub>2</sub> 也算上，总质量一点没少。' + eq('Na2CO3 + 2HCl = 2NaCl + H2O + CO2↑')][ph];
    else t = [
      '同样的药品，这次把 5.3 g 碳酸钠粉末装进气球，套在盛稀盐酸的锥形瓶口，整个装置是密闭的。开始后把气球里的粉末抖进瓶中。',
      '瓶里冒出气泡，生成的二氧化碳被气球兜住，一点也跑不掉，气球慢慢鼓起来。',
      '天平仍然平衡：生成的气体也被称了进去，反应前后总质量相等。（严格地说，气球胀大后受到空气的浮力，真实实验的读数会略小一点，那是浮力造成的，不是质量少了；这里忽略浮力。）'][ph];
    L.$('#scale-text').innerHTML = t;
    L.$('#scale-run').textContent = prog >= 1 ? '再做一次' : prog > 0 ? '反应中…' : '开始反应';
  }
  function stopScale() { if (runner) { runner.stop(); runner = null; } }
  function runScale() {
    if (runner) return;
    if (prog >= 1) prog = 0;
    if (L.REDUCED) { prog = 1; drawScale(); readScale(); return; }
    runner = L.loop(function (dt, t) {
      tNow = t; prog = Math.min(1, prog + dt / 4.5);
      drawScale(); readScale();
      if (prog >= 1) { runner = null; drawScale(); readScale(); return false; }
    });
  }
  L.chips(L.$('#exp-chips'), Object.keys(EXP).map(function (k) { return { label: EXP[k].label, value: k }; }), expKey, function (v) {
    stopScale(); expKey = v; prog = 0; drawScale(); readScale(); save();
  });
  L.$('#scale-run').addEventListener('click', runScale);
  L.$('#scale-reset').addEventListener('click', function () { stopScale(); prog = 0; drawScale(); readScale(); });

  /* —— 微观：2H2 + O2 → 2H2O —— */
  var micro = L.$('#micro');
  var mDefs = S('defs', {}, micro);
  S('rect', { x: 0, y: 0, width: 400, height: 200, rx: 14 }, S('clipPath', { id: 'micro-clip' }, mDefs));
  var ATOMS = [
    ['H', [58, 64], [168, 52], [281, 84]], ['H', [82, 64], [232, 52], [319, 84]],
    ['H', [58, 140], [168, 152], [281, 154]], ['H', [82, 140], [232, 152], [319, 154]],
    ['O', [140, 89], [180, 102], [300, 66]], ['O', [140, 115], [220, 102], [300, 136]]
  ];
  var mp = 0, microRun = null;
  function ease(t) { return t * t * (3 - 2 * t); }
  function drawMicro() {
    micro.innerHTML = ''; micro.appendChild(mDefs);
    S('rect', { x: 0, y: 0, width: 400, height: 200, rx: 14, fill: '#fbfaf7' }, micro);
    var g = S('g', { 'clip-path': 'url(#micro-clip)' }, micro);
    var p = mp / 100;
    // 分子轮廓：反应前、反应后
    var a0 = Math.max(0, 1 - p / 0.25), a1 = Math.max(0, (p - 0.75) / 0.25);
    if (a0 > 0) {
      [[70, 64, 30, 16], [70, 140, 30, 16], [140, 102, 19, 30]].forEach(function (o) { S('ellipse', { cx: o[0], cy: o[1], rx: o[2], ry: o[3], fill: 'none', stroke: '#9fb3b1', 'stroke-dasharray': '3 3', opacity: a0 }, g); });
    }
    if (a1 > 0) {
      [[300, 74], [300, 144]].forEach(function (o) { S('ellipse', { cx: o[0], cy: o[1], rx: 34, ry: 24, fill: 'none', stroke: '#9fb3b1', 'stroke-dasharray': '3 3', opacity: a1 }, g); });
    }
    var order = ATOMS.slice().sort(function (a, b) { return a[0] === 'O' ? -1 : 1; });
    order.forEach(function (at) {
      var pos;
      if (p < 0.5) { var t = ease(p / 0.5); pos = [L.lerp(at[1][0], at[2][0], t), L.lerp(at[1][1], at[2][1], t)]; }
      else { var u = ease((p - 0.5) / 0.5); pos = [L.lerp(at[2][0], at[3][0], u), L.lerp(at[2][1], at[3][1], u)]; }
      var isO = at[0] === 'O';
      S('circle', { cx: pos[0], cy: pos[1], r: isO ? 14 : 9.5, fill: isO ? '#e0604c' : '#ffffff', stroke: isO ? '#b8432f' : '#7d8a89', 'stroke-width': 1.4 }, g);
      S('text', { x: pos[0], y: pos[1] + 4, 'font-size': isO ? 11 : 9.5, 'text-anchor': 'middle', 'font-weight': 700, fill: isO ? '#fff' : '#33403f', text: at[0] }, g);
    });
    var cap = p < 0.3 ? '反应前：2 个氢分子 + 1 个氧分子' : p < 0.7 ? '分子拆开，变成 4 个氢原子和 2 个氧原子' : '原子重新组合：2 个水分子';
    S('text', { x: 200, y: 190, 'font-size': 11, 'text-anchor': 'middle', fill: '#33403f', 'font-weight': 600, text: cap }, g);
    S('text', { x: 70, y: 24, 'font-size': 10, 'text-anchor': 'middle', fill: '#7a8786', text: '2' + U('H2') + ' + ' + U('O2') }, g);
    S('text', { x: 300, y: 24, 'font-size': 10, 'text-anchor': 'middle', fill: '#7a8786', text: '2' + U('H2O') }, g);
    L.$('#micro-out').textContent = Math.round(mp) + '%';
    L.$('#mi-atoms').textContent = '4 / 2';
    L.$('#mi-mols').innerHTML = p < 0.3 ? '3<small>个</small>' : p < 0.7 ? '0<small>（全拆开了）</small>' : '2<small>个</small>';
    L.$('#micro-text').innerHTML = p < 0.3 ? '现在还是氢分子和氧分子。数一数：H 原子 4 个，O 原子 2 个。'
      : p < 0.7 ? '分子拆开了，可原子一个没少：还是 4 个 H、2 个 O。原子是化学变化中的最小粒子。'
      : '原子重新组合成水分子。原子种类、数目、质量都没变，所以总质量不变；分子却从 3 个变成了 2 个。';
  }
  var microIn = L.$('#micro-in');
  L.bindRange(microIn, function (v) { if (microRun) { microRun.stop(); microRun = null; } mp = v; drawMicro(); });
  L.$('#micro-play').addEventListener('click', function () {
    if (microRun) return;
    if (mp >= 100) mp = 0;
    if (L.REDUCED) { mp = 100; microIn.value = mp; L.paintRange(microIn); drawMicro(); return; }
    microRun = L.loop(function (dt) {
      mp = Math.min(100, mp + dt * 30);
      microIn.value = mp; L.paintRange(microIn); drawMicro();
      if (mp >= 100) { microRun = null; return false; }
    });
  });

  /* ========== ③ 利用化学方程式计算 ========== */
  var CALC = {
    kmn: { label: '加热高锰酸钾', eq: '2KMnO4 =△= K2MnO4 + MnO2 + O2↑', gk: '2', g: 'KMnO4', gName: '高锰酸钾', t: 'O2', tName: '氧气', mrG: 316, mrGtxt: '2 × 158 = 316', mrT: 32, mrTtxt: '32', min: 1, max: 40, step: 0.1, def: 31.6,
      L: [['KMnO4', 1, '#8e5fb0']], R: [['K2MnO4', 197 / 316, '#3f7f9a'], ['MnO2', 87 / 316, '#4f565c'], ['O2', 32 / 316, '#c2603f']],
      note: '比例 316 : 32 由方程式决定，用多少高锰酸钾都不变' },
    caco3: { label: '碳酸钙与稀盐酸', eq: 'CaCO3 + 2HCl = CaCl2 + H2O + CO2↑', gk: '', g: 'CaCO3', gName: '碳酸钙', t: 'CO2', tName: '二氧化碳', mrG: 100, mrGtxt: '100', mrT: 44, mrTtxt: '44', min: 1, max: 50, step: 0.5, def: 10,
      L: [['CaCO3', 1, '#a89f8c'], ['HCl', 0.73, '#5e9e98']], R: [['CaCl2', 1.11, '#6f8fb6'], ['H2O', 0.18, '#79b3d4'], ['CO2', 0.44, '#c2603f']],
      note: 'HCl 指稀盐酸里参加反应的氯化氢，没反应的那部分不算' }
  };
  var ck = CALC[st.ck] ? st.ck : 'kmn';
  var cm = L.num(st.cm, CALC[ck].def, CALC[ck].min, CALC[ck].max);
  var calcStep = Math.round(L.num(st.cs, 1, 1, 6));
  var calcSvg = L.$('#calc');
  var cDefs = S('defs', {}, calcSvg);
  S('rect', { x: 0, y: 0, width: 400, height: 210, rx: 14 }, S('clipPath', { id: 'calc-clip' }, cDefs));
  var calcIn = L.$('#calc-in');
  function setupSlider() {
    var c = CALC[ck];
    calcIn.min = c.min; calcIn.max = c.max; calcIn.step = c.step; calcIn.value = cm;
    L.paintRange(calcIn);
    L.$('#calc-label').textContent = c.gName + '的质量';
    L.$('#calc-r0').textContent = c.min + ' g'; L.$('#calc-r2').textContent = c.max + ' g';
    L.$('#calc-xl').innerHTML = '生成' + c.tName + '的质量';
  }
  function targetMass() { var c = CALC[ck]; return cm * c.mrT / c.mrG; }
  function drawCalc() {
    calcSvg.innerHTML = ''; calcSvg.appendChild(cDefs);
    S('rect', { x: 0, y: 0, width: 400, height: 210, rx: 14, fill: '#fbfaf7' }, calcSvg);
    var g = S('g', { 'clip-path': 'url(#calc-clip)' }, calcSvg), c = CALC[ck];
    var total = 0;
    function row(parts, y, title) {
      var sum = 0, x = 30;
      parts.forEach(function (p) { sum += p[1]; });
      total = cm * sum;
      S('text', { x: 30, y: y - 8, 'font-size': 11, fill: '#546160', 'font-weight': 600, text: title + '：共 ' + L.fmt(total, 2) + ' g' }, g);
      parts.forEach(function (p) {
        var w = 340 * p[1] / sum, hot = p[0] === c.t;
        S('rect', { x: x + 0.5, y: y, width: Math.max(1, w - 1), height: 28, rx: 6, fill: p[2], stroke: hot ? '#8f3d22' : 'none', 'stroke-width': hot ? 1.5 : 0 }, g);
        if (w > 26) S('text', { x: x + w / 2, y: y + 18, 'font-size': 10.5, 'text-anchor': 'middle', 'font-weight': 600, fill: '#fff', text: U(p[0]) }, g);
        S('text', { x: x + w / 2, y: y + 42, 'font-size': 10, 'text-anchor': 'middle', fill: hot ? '#a4492b' : '#546160', 'font-weight': hot ? 700 : 400, text: L.fmt(cm * p[1], 2) + ' g' }, g);
        x += w;
      });
    }
    row(c.L, 34, '参加反应的物质');
    row(c.R, 112, '生成的物质');
    S('text', { x: 200, y: 180, 'font-size': 10.5, 'text-anchor': 'middle', fill: '#2f6a4a', 'font-weight': 600, text: '两根条一样长：参加反应的质量总和 = 生成物的质量总和' }, g);
    S('text', { x: 200, y: 198, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#7a8786', text: c.note }, g);
  }
  var STEP_NAMES = ['设', '写', '找', '列', '求', '答'];
  var stepsEl = L.$('#calc-steps');
  STEP_NAMES.forEach(function (n, i) {
    if (i > 0) L.html('i', { text: '›', 'aria-hidden': 'true' }, stepsEl);
    var sp = L.html('span', { role: 'button', tabindex: '0', text: n }, stepsEl);
    function go() { calcStep = i + 1; updateCalc(); }
    sp.addEventListener('click', go);
    sp.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });
  function fr(a, b) { return '<span class="frac"><i>' + a + '</i><i>' + b + '</i></span>'; }
  function updateCalc() {
    var c = CALC[ck], x = targetMass(), mT = L.fmt(cm, 2) + ' g';
    var exact = Math.abs(x * 100 - Math.round(x * 100)) < 1e-6, xs = L.fmt(x, 2) + ' g';
    L.$('#calc-out').textContent = mT;
    L.$('#calc-x').innerHTML = L.qty(x, 'g', 2);
    L.$('#calc-ratio').innerHTML = L.chem(c.gk + c.g) + ' : ' + L.chem(c.t) + ' = ' + c.mrG + ' : ' + c.mrT;
    var lines = [
      '<b>设</b>　生成' + c.tName + '的质量为 <em>x</em>。',
      '<b>写</b>　' + eq(c.eq),
      '<b>找</b>　<span style="display:inline-grid;grid-template-columns:auto auto;column-gap:36px;vertical-align:top;text-align:center;line-height:1.6"><span>' + L.chem(c.gk + c.g) + '</span><span>' + L.chem(c.t) + '</span><span>' + c.mrGtxt + '</span><span>' + c.mrTtxt + '</span><span>' + mT + '</span><span><em>x</em></span></span>',
      '<b>列</b>　' + fr(c.mrG, c.mrT) + ' = ' + fr(mT, '<em>x</em>'),
      '<b>求</b>　<em>x</em> = ' + fr(c.mrT + ' × ' + mT, c.mrG) + (exact ? ' = ' : ' ≈ ') + '<b>' + xs + '</b>',
      '<b>答</b>　生成' + c.tName + '的质量' + (exact ? '为 ' : '约为 ') + xs + '。'
    ];
    L.$('#calc-work').innerHTML = lines.slice(0, calcStep).map(function (l) { return '<span class="step" style="text-align:left">' + l + '</span>'; }).join('');
    L.$$('span', stepsEl).forEach(function (sp, i) { sp.className = i + 1 === calcStep ? 'on' : i + 1 < calcStep ? 'done' : ''; });
    L.$('#calc-badge').textContent = '第 ' + calcStep + ' 步 · ' + STEP_NAMES[calcStep - 1];
    var tips = [
      '<b>设</b>未知数：x 本身就代表“质量”，后面<b>不带单位</b>。',
      '<b>写</b>出配平的化学方程式。方程式没配平，后面的比例就全错了。',
      '<b>找</b>出相关物质的相对分子质量<b>乘以化学计量数</b>，写在化学式下面；再把已知量和 x 写在下一行，同一种物质上下对齐。' + (ck === 'kmn' ? '这里高锰酸钾前面有个 2，所以是 2 × 158。' : '只需要找碳酸钙和二氧化碳这两列，别的物质不用管。'),
      '<b>列</b>比例式：上下两行对应成比例。已知量要带单位，并且必须是<b>纯净物</b>的质量。',
      '<b>求</b>解：交叉相乘再除，单位 g 保留下来。',
      '<b>答</b>：用一句话回答题目问的问题。六步写完整，计算题的格式分才拿得到。'
    ];
    L.$('#calc-text').innerHTML = tips[calcStep - 1];
    L.$('#calc-next').textContent = calcStep >= 6 ? '从头再看' : '下一步';
    drawCalc();
    save();
  }
  L.bindRange(calcIn, function (v) { cm = v; updateCalc(); });
  L.chips(L.$('#calc-chips'), [{ label: CALC.kmn.label, value: 'kmn' }, { label: CALC.caco3.label, value: 'caco3' }], ck, function (v) {
    ck = v; cm = CALC[v].def; setupSlider(); updateCalc();
  });
  L.$('#calc-next').addEventListener('click', function () { calcStep = calcStep >= 6 ? 1 : calcStep + 1; updateCalc(); });
  L.$('#calc-all').addEventListener('click', function () { calcStep = 6; updateCalc(); });

  function save() { L.setState({ rx: rxKey, c: coef.join(','), ex: expKey, ck: ck, cm: cm, cs: calcStep }); }

  buildTerms();
  updateBal();
  drawScale(); readScale();
  drawMicro();
  setupSlider();
  updateCalc();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '把甲烷燃烧的方程式配平',
      desc: '天然气的主要成分是甲烷。在配平小游戏里选“甲烷燃烧”，调化学计量数，直到左右每种原子都一样多。',
      label: '在配平小游戏里操作',
      button: '检查配平',
      check: function () {
        if (rxKey !== 'ch4') return { ok: false, msg: '先在上面的“反应”里选<b>甲烷燃烧</b>。' };
        var s = status();
        if (s.done) return { ok: true, msg: eq('CH4 + 2O2 =点燃= CO2 + 2H2O') + '<br>先配氢：4 个 H 需要 2 个 H<sub>2</sub>O；再数右边的 O：2 + 2 = 4 个，所以 O<sub>2</sub> 前写 2。' };
        if (s.balanced) return { ok: false, msg: '原子都对齐了，但化学计量数还能约分，化成最简整数比再试。' };
        return { ok: false, msg: '还有 ' + s.bad.join('、') + ' 原子左右不相等。提示：先把氢配平，最后再配氧。' };
      }
    },
    {
      level: 'base',
      title: '化学反应前后，一定不变的是',
      desc: '回想上面“拆开再重组”的动画。',
      options: ['原子的种类和数目', '分子的种类', '分子的数目', '物质的种类'],
      answer: 0,
      hint: '动画里拆开又拼上的“积木”是什么？它的块数变了没有？',
      explain: '化学反应是分子拆成原子、原子重新组合，<b>原子的种类、数目、质量都不变</b>。分子种类、物质种类一定变；分子数目可能变（2H<sub>2</sub> + O<sub>2</sub> 是 3 个分子，生成的 2H<sub>2</sub>O 只有 2 个）。'
    },
    {
      level: 'base',
      title: '4 g 氢气恰好完全燃烧，需要氧气多少克？',
      desc: '方程式：' + eq('2H2 + O2 =点燃= 2H2O') + '（H 1，O 16）',
      options: ['32 g', '16 g', '8 g', '4 g'],
      answer: 0,
      hint: '先算质量比：2H<sub>2</sub> 是 2 × 2 = 4，O<sub>2</sub> 是 32。',
      explain: '质量比 H<sub>2</sub> : O<sub>2</sub> : H<sub>2</sub>O = 4 : 32 : 36。4 g 氢气正好对应 <b>32 g</b> 氧气，生成 36 g 水。选 16 g 是忘了氢气前的化学计量数 2，或者把 O<sub>2</sub> 算成了 16。'
    },
    {
      level: 'mid',
      title: '让天平“不平衡”，再说说为什么',
      desc: '在“天平称一称”里选一个实验做完，让反应结束后天平不再平衡。',
      label: '在天平实验里操作',
      button: '检查天平',
      check: function () {
        if (expKey === 'open' && prog >= 1) return { ok: true, msg: '敞口烧杯里生成的 2.2 g 二氧化碳跑进了空气，没被称到，所以左盘变轻。这<b>不违背</b>质量守恒定律，把逸出的气体算上，总质量不变。' };
        if (expKey === 'open') return { ok: false, msg: '实验选对了，点“开始反应”，等反应做完再检查。' };
        return { ok: false, msg: '这个实验是密闭的，生成的物质跑不掉，天平一直平衡。想一想：哪个实验有气体能跑出去？' };
      }
    },
    {
      level: 'mid',
      title: '要制取 1.6 g 氧气，需要加热多少克高锰酸钾？',
      desc: '在“按比例算”里选“加热高锰酸钾”，拖动滑块，让生成氧气的质量正好是 1.6 g。',
      label: '在方程式计算里操作',
      button: '检查用量',
      check: function () {
        if (ck !== 'kmn') return { ok: false, msg: '先选“加热高锰酸钾”这个反应。' };
        var x = targetMass();
        if (Math.abs(cm - 15.8) < 0.05) return { ok: true, msg: '316 : 32 = m : 1.6 g，所以 m = 316 × 1.6 g ÷ 32 = <b>15.8 g</b>。' };
        return { ok: false, msg: '现在生成氧气 ' + L.fmt(x, 2) + ' g，' + (x > 1.6 ? '多了，高锰酸钾要少一些。' : '少了，高锰酸钾要多一些。') + '质量比是 316 : 32，大约 10 g 高锰酸钾出 1 g 氧气。' };
      }
    },
    {
      level: 'mid',
      title: '某物质在氧气中燃烧，只生成二氧化碳和水，则该物质',
      desc: '想一想：生成物里有哪些元素？其中哪些可能来自氧气？',
      options: ['一定含碳、氢元素，可能含氧元素', '一定含碳、氢、氧三种元素', '只含碳、氢两种元素', '一定含碳元素，可能含氢元素'],
      answer: 0,
      hint: '反应前后元素种类不变。生成物里的 O 有没有可能全部来自氧气？',
      explain: '生成物里有 C、H、O 三种元素。C 和 H 只能来自这种物质，所以<b>一定含碳、氢</b>；O 可能全部来自氧气，也可能有一部分来自这种物质，所以只能说<b>可能含氧</b>（要确定，还得称质量计算）。'
    },
    {
      level: 'trap',
      title: '小明把 H₂ + O₂ → H₂O “配平”成 H₂ + O₂ = H₂O₂，错在哪？',
      desc: '他说：“你看，左右都是 2 个 H、2 个 O，平了。”',
      options: ['改了化学式，H₂O₂ 已经不是水了', '只是漏写了反应条件，其他都对', '化学计量数应该写在右下角', '没有错，两边原子个数相等'],
      answer: 0,
      hint: '配平时允许改的是哪个位置的数字？',
      explain: '配平只能改化学式<b>前面</b>的化学计量数，不能改右下角的数字。H<sub>2</sub>O<sub>2</sub> 是过氧化氢，根本不是氢气燃烧的产物，违背了客观事实。正确写法：' + eq('2H2 + O2 =点燃= 2H2O') + '。漏写条件也是错，但不是主要问题。'
    },
    {
      level: 'trap',
      title: '6 g 碳在 20 g 氧气中充分燃烧，生成二氧化碳多少克？',
      desc: eq('C + O2 =点燃= CO2') + '（C 12，O 16）',
      options: ['22 g', '26 g', '20 g', '14 g'],
      answer: 0,
      hint: '20 g 氧气全都参加反应了吗？先按质量比算算 6 g 碳需要多少氧气。',
      explain: '质量比 C : O<sub>2</sub> : CO<sub>2</sub> = 12 : 32 : 44。6 g 碳只能和 16 g 氧气反应，生成 <b>22 g</b> 二氧化碳，剩下 4 g 氧气没参加反应。选 26 g 就是把没参加反应的氧气也算进去了，质量守恒说的是“<b>参加反应</b>的各物质质量总和”。'
    }
  ]);
})();
