/* 化学互动馆 · 第 9 课 溶液 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg, C = L.chem;
  var st = L.getState();

  /* SVG 里的化学式：元素符号后面的数字用 tspan 下移缩小 */
  function chemText(parent, attrs, s) {
    var t = S('text', attrs, parent), fs = +attrs['font-size'] || 10, sh = fs * 0.28, segs = [], idx = 0;
    s.replace(/([A-Za-z\)])(\d+)/g, function (all, a, d, off) {
      segs.push({ t: s.slice(idx, off + 1) }); segs.push({ t: d, sub: true });
      idx = off + all.length; return all;
    });
    segs.push({ t: s.slice(idx) });
    var down = false;
    segs.forEach(function (g) {
      if (!g.t) return;
      var dy = g.sub ? (down ? 0 : sh) : (down ? -sh : 0);
      S('tspan', { 'font-size': g.sub ? fs * 0.72 : null, dy: dy || null, text: g.t }, t);
      down = !!g.sub;
    });
    return t;
  }
  function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  function mix(a, b, t) {
    var pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16), out = '#';
    [16, 8, 0].forEach(function (s) {
      var v = Math.round(L.lerp((pa >> s) & 255, (pb >> s) & 255, L.clamp(t, 0, 1)));
      out += (v < 16 ? '0' : '') + v.toString(16);
    });
    return out;
  }
  /* 单调三次插值：曲线经过每个数据点，并且不会在两点之间“鼓包” */
  function spline(xs, ys) {
    var n = xs.length, d = [], m = [], i;
    for (i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
    m[0] = d[0]; m[n - 1] = d[n - 2];
    for (i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
    for (i = 0; i < n - 1; i++) {
      if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; }
      var a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
      if (s > 9) { var k = 3 / Math.sqrt(s); m[i] = k * a * d[i]; m[i + 1] = k * b * d[i]; }
    }
    return function (x) {
      x = L.clamp(x, xs[0], xs[n - 1]);
      var j = 0;
      while (j < n - 2 && x > xs[j + 1]) j++;
      var h = xs[j + 1] - xs[j], t = (x - xs[j]) / h, t2 = t * t, t3 = t2 * t;
      return (2 * t3 - 3 * t2 + 1) * ys[j] + (t3 - 2 * t2 + t) * h * m[j] + (-2 * t3 + 3 * t2) * ys[j + 1] + (t3 - t2) * h * m[j + 1];
    };
  }

  /* ========== 溶解度曲线 ========== */
  var TS = [0, 20, 40, 60, 80, 100];
  var SUB = {
    KNO3: { f: 'KNO3', name: '硝酸钾', ys: [13.3, 31.6, 63.9, 110, 169, 246], color: '#c2603f', max: 250, step: 1, def: 80, dp: 1 },
    NaCl: { f: 'NaCl', name: '氯化钠', ys: [35.7, 36.0, 36.6, 37.3, 38.4, 39.8], color: '#2c736f', max: 60, step: 0.5, def: 30, dp: 1 },
    CaOH2: { f: 'Ca(OH)2', name: '氢氧化钙', ys: [0.185, 0.165, 0.141, 0.116, 0.094, 0.077], color: '#6a5aa8', max: 0.3, step: 0.005, def: 0.1, dp: 3 }
  };
  Object.keys(SUB).forEach(function (k) { SUB[k].S = spline(TS, SUB[k].ys); });

  var sub = SUB[st.k] ? st.k : 'KNO3';
  var T = L.num(st.t, 60, 0, 100), w = L.num(st.w, 100, 20, 100);
  var m = L.num(st.m, SUB[sub].def, 0, SUB[sub].max);
  var solAnim = null, lastAct = null;

  function status() {
    var D = SUB[sub], c = D.S(T) * w / 100, tol = D.step / 2 + 1e-9;
    var x = m - c > tol ? m - c : 0;
    return { c: c, x: x, dis: m - x, sat: x > 0 ? 'over' : Math.abs(m - c) <= tol ? 'eq' : 'under' };
  }

  var chart = L.$('#chart');
  function drawChart() {
    var D = SUB[sub], zoom = sub === 'CaOH2';
    var ax = L.axes(chart, { xmin: 0, xmax: 100, ymin: 0, ymax: zoom ? 0.2 : 250, xstep: 10, ystep: zoom ? 0.025 : 25, labelStep: 20, ylabelStep: zoom ? 0.05 : 50, xlabel: ' ', ylabel: '溶解度/g', left: 42, top: 14, bottom: 26, right: 14 });
    S('text', { x: ax.X(100) - 2, y: ax.Y(0) - 6, 'font-size': 11, 'text-anchor': 'end', fill: '#5b6475', 'font-style': 'italic', text: '温度/℃' }, ax.layer);
    var defs = S('defs', {});
    S('rect', { x: ax.X(0), y: ax.Y(ax.ymax), width: ax.X(100) - ax.X(0), height: ax.Y(0) - ax.Y(ax.ymax) }, S('clipPath', { id: 'chart-clip' }, defs));
    chart.insertBefore(defs, chart.firstChild);
    var g = S('g', { 'clip-path': 'url(#chart-clip)' }, ax.layer);
    (zoom ? ['CaOH2'] : ['NaCl', 'KNO3']).forEach(function (k) {
      var E = SUB[k], on = k === sub;
      S('path', { d: L.curve(ax, E.S, 0, 100, 200), fill: 'none', stroke: E.color, 'stroke-width': on ? 2.6 : 1.6, opacity: on ? 1 : 0.5, 'stroke-linecap': 'round' }, g);
      if (on) TS.forEach(function (t, i) { S('circle', { cx: ax.X(t), cy: ax.Y(E.ys[i]), r: 2.4, fill: E.color }, g); });
    });
    if (zoom) {
      chemText(ax.layer, { x: ax.X(96), y: ax.Y(SUB.CaOH2.S(96)) - 10, 'font-size': 11, 'text-anchor': 'end', fill: SUB.CaOH2.color, 'font-weight': 700 }, 'Ca(OH)2');
      S('text', { x: ax.X(100), y: ax.Y(0.2) + 12, 'font-size': 9.5, 'text-anchor': 'end', fill: '#6a5aa8', text: '纵轴放大了：最高只到 0.2 g' }, ax.layer);
    } else {
      chemText(ax.layer, { x: ax.X(78) - 8, y: ax.Y(SUB.KNO3.S(78)), 'font-size': 11, 'text-anchor': 'end', fill: SUB.KNO3.color, 'font-weight': 700 }, 'KNO3');
      chemText(ax.layer, { x: ax.X(98), y: ax.Y(39.8) - 8, 'font-size': 11, 'text-anchor': 'end', fill: SUB.NaCl.color, 'font-weight': 700 }, 'NaCl');
      // 两线交点
      var lo = 0, hi = 40;
      for (var it = 0; it < 30; it++) { var mid = (lo + hi) / 2; if (SUB.KNO3.S(mid) < SUB.NaCl.S(mid)) lo = mid; else hi = mid; }
      var xc = ax.X(lo), yc = ax.Y(SUB.NaCl.S(lo));
      S('circle', { cx: xc, cy: yc, r: 3.5, fill: '#fff', stroke: '#5b6475', 'stroke-width': 1.4 }, ax.layer);
      S('text', { x: xc - 4, y: yc - 9, 'font-size': 9.5, 'text-anchor': 'end', fill: '#5b6475', text: '交点' }, ax.layer);
    }
    // 你的溶液
    var s = status(), c = m * 100 / w, over = c > ax.ymax, py = Math.min(c, ax.ymax);
    var col = s.sat === 'under' ? '#3f8a6a' : s.sat === 'eq' ? '#d08a2c' : '#c2603f';
    var x0 = ax.X(T), y0 = ax.Y(py);
    S('line', { x1: x0, y1: ax.Y(0), x2: x0, y2: y0, stroke: col, 'stroke-dasharray': '3 3', opacity: 0.7 }, g);
    S('line', { x1: ax.X(0), y1: y0, x2: x0, y2: y0, stroke: col, 'stroke-dasharray': '3 3', opacity: 0.7 }, g);
    S('circle', { cx: x0, cy: ax.Y(D.S(T)), r: 4, fill: '#fff', stroke: D.color, 'stroke-width': 2 }, g);
    S('circle', { cx: x0, cy: y0, r: 5.5, fill: col, stroke: '#fff', 'stroke-width': 2 }, g);
    var right = T < 70, below = s.sat !== 'over' && !over;
    S('text', { x: x0 + (right ? 9 : -9), y: below ? Math.min(ax.Y(0) - 6, y0 + 17) : Math.max(ax.Y(ax.ymax) + 12, y0 - 8), 'font-size': 10, 'text-anchor': right ? 'start' : 'end', fill: col, 'font-weight': 700, text: over ? '↑ 超出图（太多了）' : '你的溶液' }, ax.layer);
  }

  var beaker = L.$('#beaker');
  var crys = (function () { var r = rng(31), a = []; for (var i = 0; i < 40; i++) a.push({ u: r(), v: r(), a: r() }); return a; })();
  function drawBeaker() {
    beaker.innerHTML = '';
    var D = SUB[sub], s = status();
    var defs = S('defs', {}, beaker);
    S('rect', { x: 152, y: 14, width: 96, height: 134 }, S('clipPath', { id: 'bk-clip' }, defs));
    S('rect', { x: 0, y: 0, width: 400, height: 170, rx: 14, fill: '#fbfaf7' }, beaker);
    var g = S('g', { 'clip-path': 'url(#bk-clip)' }, beaker);
    var top = 148 - w * 1.1;
    S('rect', { x: 152, y: top, width: 96, height: 148 - top, fill: '#e2eff6' }, g);
    if (sub === 'CaOH2' && s.x > 0) S('rect', { x: 152, y: top, width: 96, height: 148 - top, fill: '#ffffff', opacity: Math.min(0.75, 0.3 + s.x / D.max) }, g);
    if (s.x > 0) {
      var k = Math.min(1, Math.sqrt(s.x / D.max)), wd = 24 + 66 * k, hp = 4 + 22 * k;
      S('path', { d: 'M' + (200 - wd / 2) + ' 148Q200 ' + (148 - 2 * hp) + ' ' + (200 + wd / 2) + ' 148z', fill: '#f7f6f0', stroke: '#c3c8cd', 'stroke-width': 0.8 }, g);
      var n = Math.round(3 + 14 * k);
      for (var i = 0; i < n; i++) {
        var cr = crys[i], cx = 200 + (cr.u - 0.5) * wd * 0.8, q = (cx - 200) / (wd / 2), hx = hp * (1 - q * q), cy = 148 - hx * cr.v * 0.85 - 1.5;
        if (sub === 'KNO3') {
          var an = cr.a * Math.PI;
          S('line', { x1: cx - Math.cos(an) * 3.5, y1: cy - Math.sin(an) * 3.5, x2: cx + Math.cos(an) * 3.5, y2: cy + Math.sin(an) * 3.5, stroke: '#a8b0b8', 'stroke-width': 1.2 }, g);
        } else if (sub === 'NaCl') S('rect', { x: cx - 1.7, y: cy - 1.7, width: 3.4, height: 3.4, fill: '#ffffff', stroke: '#a8b0b8', 'stroke-width': 0.7 }, g);
        else S('circle', { cx: cx, cy: cy, r: 1.3, fill: '#d9d9d2' }, g);
      }
    }
    // 温度计
    S('rect', { x: 234, y: 18, width: 6, height: 122, rx: 3, fill: '#ffffff', stroke: '#b5c0c5', 'stroke-width': 0.8 }, beaker);
    S('rect', { x: 235.5, y: 140 - T * 1.0, width: 3, height: T * 1.0 + 2, fill: '#d0573a' }, beaker);
    S('circle', { cx: 237, cy: 143, r: 4.5, fill: '#d0573a' }, beaker);
    // 烧杯
    S('path', { d: 'M146 12L150 16V150H250V16L254 12', fill: 'none', stroke: '#9fb0b8', 'stroke-width': 2, 'stroke-linejoin': 'round' }, beaker);
    for (var v = 20; v <= 100; v += 20) S('line', { x1: 150, y1: 148 - v * 1.1, x2: 158, y2: 148 - v * 1.1, stroke: '#b5c0c5' }, beaker);
    // 标注
    var dp = D.dp;
    S('text', { x: 22, y: 50, 'font-size': 10, fill: '#7b8a89', text: '水' }, beaker);
    S('text', { x: 22, y: 66, 'font-size': 14, 'font-weight': 700, fill: '#1f302e', text: L.fmt(w, 0) + ' g' }, beaker);
    S('text', { x: 22, y: 90, 'font-size': 10, fill: '#7b8a89', text: '温度' }, beaker);
    S('text', { x: 22, y: 106, 'font-size': 14, 'font-weight': 700, fill: '#d0573a', text: Math.round(T) + ' ℃' }, beaker);
    var lab = S('text', { x: 22, y: 130, 'font-size': 10, fill: '#7b8a89' }, beaker);
    S('tspan', { text: '加入 ' }, lab);
    chemText(beaker, { x: 22, y: 146, 'font-size': 13, 'font-weight': 700, fill: '#1f302e' }, L.fmt(m, dp) + ' g ' + D.f);
    S('text', { x: 266, y: 108, 'font-size': 10, fill: '#7b8a89', text: '杯底固体' }, beaker);
    S('text', { x: 266, y: 126, 'font-size': 15, 'font-weight': 700, fill: s.x > 0 ? '#c2603f' : '#3f8a6a', text: L.fmt(s.x, dp) + ' g' }, beaker);
    if (sub === 'CaOH2' && s.x > 0) S('text', { x: 266, y: 142, 'font-size': 9.5, fill: '#6a5aa8', text: '溶液浑浊' }, beaker);
    if (w < 99.5) S('text', { x: 200, y: 164, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#7b8a89', text: '已蒸发掉 ' + L.fmt(100 - w, 0) + ' g 水' }, beaker);
  }

  function readSol() {
    var D = SUB[sub], s = status(), dp = D.dp, Tr = Math.round(T);
    L.$('#t-out').textContent = Tr + ' ℃';
    L.$('#m-out').textContent = L.fmt(m, dp) + ' g';
    L.$('#sat-badge').textContent = { under: '不饱和', eq: '恰好饱和', over: '饱和 · 有剩余' }[s.sat];
    L.$('#sol-s').innerHTML = L.fmt(D.S(T), dp) + '<small>g</small>';
    L.$('#sol-d').innerHTML = L.fmt(s.dis, dp) + '<small>g</small>';
    L.$('#sol-x').innerHTML = L.fmt(s.x, dp) + '<small>g</small>';
    L.$('#sol-w').innerHTML = L.fmt(s.dis / (s.dis + w) * 100, sub === 'CaOH2' ? 3 : 1) + '<small>%</small>';
    var nm = C(D.f), cv = L.fmt(s.c, dp), est = TS.indexOf(Tr) >= 0 && Math.abs(T - Tr) < 1e-6 ? '' : '（按曲线估读）';
    var head = Tr + ' ℃ 时，' + L.fmt(w, 0) + ' g 水最多能溶 ' + cv + ' g ' + nm + est + '。';
    var t;
    if (s.sat === 'under') t = head + '现在只加了 ' + L.fmt(m, dp) + ' g，还能再溶 ' + L.fmt(s.c - m, dp) + ' g，是<b>不饱和溶液</b>，点在曲线下方。';
    else if (s.sat === 'eq') t = head + '加进去的正好全溶完、再也溶不下了，是<b>恰好饱和</b>的溶液，点落在曲线上。';
    else t = head + '多出来的 ' + L.fmt(s.x, dp) + ' g 溶不了，沉在杯底。上面的清液是<b>饱和溶液</b>，点在曲线上方。';
    if (w < 99.5) t += ' 水已蒸发到 ' + L.fmt(w, 0) + ' g，图上的点按“每 100 g 水”折算。';
    if (sub === 'CaOH2') t += ' ' + nm + ' 很特别：温度越高，溶得越少。';
    L.$('#sol-text').innerHTML = t;
  }

  var tIn = L.$('#t-in'), mIn = L.$('#m-in');
  function setupM() {
    var D = SUB[sub];
    mIn.min = 0; mIn.max = D.max; mIn.step = D.step; mIn.value = m;
    L.$('#m-mid').textContent = L.fmt(D.max / 2, 3) + ' g';
    L.$('#m-max').textContent = L.fmt(D.max, 3) + ' g';
    L.paintRange(mIn);
  }
  function refreshSol() { drawChart(); drawBeaker(); readSol(); save(); }
  function stopSol() { if (solAnim) { solAnim.stop(); solAnim = null; } }
  function msg(h) { L.$('#cryst-text').innerHTML = h; }
  function setVar(key, v) {
    if (key === 'T') { T = v; tIn.value = Math.round(v); L.paintRange(tIn); }
    else w = v;
  }
  function animTo(key, target, rate, done) {
    stopSol();
    if (L.REDUCED) { setVar(key, target); refreshSol(); done(); return; }
    solAnim = L.loop(function (dt) {
      var cur = key === 'T' ? T : w;
      var nx = cur > target ? Math.max(target, cur - rate * dt) : Math.min(target, cur + rate * dt);
      setVar(key, nx); refreshSol();
      if (nx === target) { solAnim = null; done(); return false; }
    });
  }

  tIn.value = T; setupM();
  L.bindRange(tIn, function (v) { stopSol(); T = v; refreshSol(); });
  L.bindRange(mIn, function (v) { stopSol(); m = v; refreshSol(); });
  L.chips(L.$('#sub-chips'), [{ label: C('KNO3'), value: 'KNO3' }, { label: 'NaCl', value: 'NaCl' }, { label: C('Ca(OH)2') + '（放大看）', value: 'CaOH2' }], sub, function (v) {
    stopSol(); sub = v; m = SUB[sub].def; w = 100; lastAct = null;
    setupM(); msg(''); refreshSol();
  });

  L.$('#cool-btn').addEventListener('click', function () {
    var D = SUB[sub], T0 = Math.round(T), target = T > 20 ? 20 : 0, d0 = status().dis, dp = D.dp, nm = C(D.f);
    if (T <= 0) { msg('已经是 0 ℃ 了，再冷水就要结冰，没法再降温。'); return; }
    msg('正在降温……');
    animTo('T', target, 30, function () {
      var s1 = status(), out = d0 - s1.dis, t;
      lastAct = { type: 'cool', sub: sub, out: out };
      if (sub === 'CaOH2') t = nm + ' 温度越低溶得越多：降到 ' + target + ' ℃ 后没有晶体析出' + (out < -1e-9 ? '，杯底的固体反而少了 ' + L.fmt(-out, dp) + ' g' : '') + '。想让它析出，要<b>升温</b>。';
      else if (out > D.step / 2) t = '从 ' + T0 + ' ℃ 降到 ' + target + ' ℃：溶解的 ' + nm + ' 从 ' + L.fmt(d0, dp) + ' g 变成 ' + L.fmt(s1.dis, dp) + ' g，<b>析出 ' + L.fmt(out, dp) + ' g 晶体</b>。' +
        (sub === 'KNO3' ? nm + ' 的溶解度受温度影响大，适合用<b>降温结晶</b>。' : 'NaCl 的溶解度受温度影响很小，降温析出得很少，海水晒盐靠的是<b>蒸发</b>。');
      else t = '降到 ' + target + ' ℃ 后溶液还没饱和（最多能溶 ' + L.fmt(s1.c, dp) + ' g），没有晶体析出。先多加些溶质，让它在高温时饱和，再降温。';
      msg(t);
    });
  });
  L.$('#evap-btn').addEventListener('click', function () {
    var D = SUB[sub], dp = D.dp, nm = C(D.f);
    if (w <= 20.5) { msg('水已经只剩 20 g 了，点“重置”再来。'); return; }
    var w0 = w, target = Math.max(20, w - 50), d0 = status().dis;
    msg('正在蒸发水（温度保持 ' + Math.round(T) + ' ℃）……');
    animTo('w', target, 40, function () {
      var s1 = status(), out = d0 - s1.dis, t;
      lastAct = { type: 'evap', sub: sub, out: out };
      if (out > D.step / 2) t = '蒸发掉 ' + L.fmt(w0 - target, 0) + ' g 水：能溶 ' + nm + ' 的“座位”跟着变少，<b>析出 ' + L.fmt(out, dp) + ' g 晶体</b>。' +
        (sub === 'NaCl' ? 'NaCl 这种溶解度受温度影响小的物质，最适合用<b>蒸发结晶</b>。' : '');
      else t = '蒸发掉 ' + L.fmt(w0 - target, 0) + ' g 水后溶液还没饱和，没有晶体析出。可以继续蒸发。';
      msg(t);
    });
  });
  L.$('#sol-reset').addEventListener('click', function () {
    stopSol(); T = 60; w = 100; m = SUB[sub].def; lastAct = null;
    tIn.value = T; L.paintRange(tIn); setupM();
    msg('提示：' + C('KNO3') + ' 在 60 ℃ 加到 110 g 正好饱和，然后点“降温结晶”。');
    refreshSol();
  });

  /* ========== 溶质质量分数与稀释 ========== */
  var dil = L.$('#dil');
  var aS = L.num(st.a, 10, 1, 40), aW = L.num(st.b, 90, 20, 300), snap = null, dilAnim = null;
  var dots = (function () { var r = rng(41), a = []; for (var i = 0; i < 40; i++) a.push({ u: r(), v: r() }); return a; })();
  var CAP20 = 0.36;   // 20 ℃ 时 NaCl 溶解度 36.0 g，即每克水最多溶 0.36 g
  function dcalc() {
    var cp = aW * CAP20, dis = Math.min(aS, cp);
    return { cp: cp, dis: dis, rest: aS - dis, sol: dis + aW, frac: dis / (dis + aW) * 100 };
  }
  function drawDil() {
    dil.innerHTML = '';
    var r = dcalc();
    var defs = S('defs', {}, dil);
    S('rect', { x: 62, y: 20, width: 156, height: 178 }, S('clipPath', { id: 'dil-clip' }, defs));
    S('rect', { x: 0, y: 0, width: 400, height: 220, rx: 14, fill: '#fbfaf7' }, dil);
    var g = S('g', { 'clip-path': 'url(#dil-clip)' }, dil);
    var h = r.sol / 340 * 168, top = 198 - h;
    S('rect', { x: 62, y: top, width: 156, height: h, fill: '#e2eff6' }, g);
    var nd = Math.round(r.dis);
    for (var i = 0; i < nd && i < dots.length; i++) S('circle', { cx: 68 + dots[i].u * 144, cy: top + 5 + dots[i].v * Math.max(0, h - 10), r: 2.6, fill: '#2c736f' }, g);
    if (r.rest > 0.001) {
      var wd = 20 + r.rest * 3, hp = 3 + r.rest * 0.6;
      S('path', { d: 'M' + (140 - wd / 2) + ' 198Q140 ' + (198 - 2 * hp) + ' ' + (140 + wd / 2) + ' 198z', fill: '#f7f6f0', stroke: '#b9bfc5' }, g);
      S('text', { x: 140, y: 196 - hp * 1.2 - 6, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#c2603f', text: '溶不了的 ' + L.fmt(r.rest, 1) + ' g' }, g);
    }
    S('path', { d: 'M56 16L60 20V200H220V20L224 16', fill: 'none', stroke: '#9fb0b8', 'stroke-width': 2, 'stroke-linejoin': 'round' }, dil);
    S('text', { x: 140, y: 214, 'font-size': 10.5, 'text-anchor': 'middle', fill: '#4c5d5c', text: '溶质 ' + L.fmt(r.dis, 1) + ' g + 水 ' + L.fmt(aW, 1) + ' g = 溶液 ' + L.fmt(r.sol, 1) + ' g' }, dil);
    S('text', { x: 64, y: 12, 'font-size': 9.5, fill: '#2c736f', text: '● = 1 g 溶解了的 NaCl' }, dil);
    // 质量分数柱（0～30%）
    var BX = 290, BT = 30, BH = 168, FY = function (f) { return BT + BH - f / 30 * BH; };
    S('text', { x: BX + 12, y: 18, 'font-size': 10, 'text-anchor': 'middle', fill: '#4c5d5c', 'font-weight': 600, text: '质量分数' }, dil);
    S('rect', { x: BX, y: BT, width: 24, height: BH, rx: 5, fill: '#edf3f2' }, dil);
    S('rect', { x: BX, y: FY(r.frac), width: 24, height: BT + BH - FY(r.frac), rx: 5, fill: '#2c736f' }, dil);
    [0, 10, 20, 30].forEach(function (f) {
      S('line', { x1: BX + 24, y1: FY(f), x2: BX + 29, y2: FY(f), stroke: '#9aa6a5' }, dil);
      S('text', { x: BX + 32, y: FY(f) + 3.5, 'font-size': 9.5, fill: '#7b8a89', text: f + '%' }, dil);
    });
    S('text', { x: BX + 12, y: FY(r.frac) - 5, 'font-size': 10.5, 'text-anchor': 'middle', 'font-weight': 700, fill: '#2c736f', text: L.fmt(r.frac, 1) + '%' }, dil);
    if (snap) {
      S('line', { x1: BX - 4, y1: FY(snap.frac), x2: BX + 28, y2: FY(snap.frac), stroke: '#c2603f', 'stroke-dasharray': '3 2', 'stroke-width': 1.4 }, dil);
      S('text', { x: BX - 6, y: FY(snap.frac) + 3.5, 'font-size': 9.5, 'text-anchor': 'end', fill: '#c2603f', text: '原 ' + L.fmt(snap.frac, 1) + '%' }, dil);
    }
  }
  function exact2(f) { return Math.abs(f * 100 - Math.round(f * 100)) < 1e-6; }
  function readDil() {
    var r = dcalc();
    L.$('#a-out').textContent = L.fmt(aS, 0) + ' g';
    L.$('#b-out').textContent = L.fmt(aW, 0) + ' g';
    L.$('#dil-badge').textContent = L.fmt(r.frac, 1) + '%';
    L.$('#dil-sol').innerHTML = L.fmt(r.sol, 1) + '<small>g</small>';
    L.$('#dil-frac').innerHTML = L.fmt(r.frac, 2) + '<small>%</small>';
    var f;
    if (snap) {
      f = L.fmt(snap.sol, 1) + ' g × ' + L.fmt(snap.frac, 2) + '%' + (exact2(snap.frac) && exact2(r.frac) ? ' = ' : ' ≈ ') + L.fmt(r.sol, 1) + ' g × ' + L.fmt(r.frac, 2) + '%' +
        '<span class="why">两边都等于 ' + L.fmt(r.dis, 1) + ' g：稀释前后溶质质量不变</span>';
    } else {
      f = L.fmt(r.dis, 1) + ' g ÷ (' + L.fmt(r.dis, 1) + ' g + ' + L.fmt(aW, 1) + ' g) × 100%' + (exact2(r.frac) ? ' = ' : ' ≈ ') + L.fmt(r.frac, 2) + '%';
    }
    L.$('#dil-formula').innerHTML = f;
    var t;
    if (r.rest > 0.001) t = '20 ℃ 时 ' + L.fmt(aW, 0) + ' g 水最多溶 ' + L.fmt(r.cp, 1) + ' g NaCl，还有 ' + L.fmt(r.rest, 1) + ' g 溶不了。溶液已经饱和，溶质只能算溶解了的那部分。20 ℃ 时 NaCl 溶液最浓也就约 26.5%。';
    else if (snap) t = '加水后溶液变多、变稀了，但<b>溶质一点没少</b>：图里的小点还是那么多，只是分散到了更多的水里。';
    else t = '溶质质量分数 = 溶质质量 ÷ 溶液质量 × 100%。注意分母是<b>溶液</b>（溶质 + 水），不是水。';
    L.$('#dil-text').innerHTML = t;
  }
  function refreshDil() { drawDil(); readDil(); save(); }
  var aIn = L.$('#a-in'), bIn = L.$('#b-in');
  aIn.value = aS; bIn.value = aW;
  L.bindRange(aIn, function (v) { if (dilAnim) { dilAnim.stop(); dilAnim = null; } snap = null; aS = v; refreshDil(); });
  L.bindRange(bIn, function (v) { if (dilAnim) { dilAnim.stop(); dilAnim = null; } snap = null; aW = v; refreshDil(); });
  L.$('#dil-add').addEventListener('click', function () {
    if (aW >= 300) { L.$('#dil-text').innerHTML = '水已经加到 300 g 的上限了，点“重置”再试。'; return; }
    var r = dcalc();
    if (!snap && r.rest <= 0.001) snap = { sol: r.sol, frac: r.frac };
    var target = Math.min(300, aW + 50);
    if (dilAnim) dilAnim.stop();
    function fin() { aW = target; bIn.value = aW; L.paintRange(bIn); refreshDil(); }
    if (L.REDUCED) { fin(); return; }
    dilAnim = L.loop(function (dt) {
      aW = Math.min(target, aW + dt * 80);
      bIn.value = Math.round(aW / 5) * 5; L.paintRange(bIn);
      refreshDil();
      if (aW >= target) { dilAnim = null; fin(); return false; }
    });
  });
  L.$('#dil-reset').addEventListener('click', function () {
    if (dilAnim) { dilAnim.stop(); dilAnim = null; }
    snap = null; aS = 10; aW = 90;
    aIn.value = aS; bIn.value = aW; L.paintRange(aIn); L.paintRange(bIn);
    refreshDil();
  });

  /* ========== 配制 50 g 6% NaCl：读量筒 ========== */
  var prep = L.$('#prep');
  var EYE = { level: { V: 47, ey: 85 }, up: { V: 50, ey: 135 }, down: { V: 44, ey: 35 } };
  var eye = EYE[st.e] ? st.e : 'level';
  function vy(V) { return 120 - (V - 40) * 5; }
  function drawPrep() {
    prep.innerHTML = '';
    var E = EYE[eye], ly = vy(E.V);
    var defs = S('defs', {}, prep);
    S('rect', { x: 0, y: 0, width: 400, height: 150, rx: 14 }, S('clipPath', { id: 'prep-clip' }, defs));
    S('rect', { x: 0, y: 0, width: 400, height: 150, rx: 14, fill: '#fbfaf7' }, prep);
    var g = S('g', { 'clip-path': 'url(#prep-clip)' }, prep);
    S('path', { d: 'M201 ' + (ly - 3) + 'Q230 ' + (ly + 3) + ' 259 ' + (ly - 3) + 'V140H201z', fill: '#d9eaf4' }, g);
    S('path', { d: 'M201 ' + (ly - 3) + 'Q230 ' + (ly + 3) + ' 259 ' + (ly - 3), fill: 'none', stroke: '#6f9fbc', 'stroke-width': 1.2 }, g);
    S('path', { d: 'M200 6V140H260V6', fill: 'none', stroke: '#9fb0b8', 'stroke-width': 2 }, g);
    S('rect', { x: 184, y: 140, width: 92, height: 6, rx: 2, fill: '#c3ccd1' }, g);
    for (var V = 38; V <= 56; V++) {
      var big = V % 5 === 0;
      S('line', { x1: 200, y1: vy(V), x2: 200 + (big ? 12 : 6), y2: vy(V), stroke: '#7b8a89', 'stroke-width': big ? 1.2 : 0.8 }, g);
      if (big) S('text', { x: 196, y: vy(V) + 3.5, 'font-size': 9.5, 'text-anchor': 'end', fill: '#6b7877', text: V }, g);
    }
    // 视线：眼睛 → 47 mL 刻度 → 凹液面最低处
    var ex = 100, k = (vy(47) - E.ey) / (200 - ex);
    S('line', { x1: ex + 10, y1: E.ey + k * 10, x2: 252, y2: E.ey + k * 152, stroke: '#d08a2c', 'stroke-width': 1.4, 'stroke-dasharray': '5 3' }, g);
    S('circle', { cx: 200, cy: vy(47), r: 3, fill: '#d08a2c' }, g);
    S('circle', { cx: 230, cy: ly, r: 3, fill: '#2c736f' }, g);
    S('path', { d: 'M' + (ex - 12) + ' ' + E.ey + 'Q' + ex + ' ' + (E.ey - 9) + ' ' + (ex + 12) + ' ' + E.ey + 'Q' + ex + ' ' + (E.ey + 9) + ' ' + (ex - 12) + ' ' + E.ey + 'z', fill: '#fff', stroke: '#4c5d5c', 'stroke-width': 1.3 }, g);
    S('circle', { cx: ex + 3, cy: E.ey, r: 3.2, fill: '#2f3a3a' }, g);
    S('text', { x: 270, y: 50, 'font-size': 10, fill: '#a4692b', text: '读数：47 mL' }, g);
    S('text', { x: 270, y: 66, 'font-size': 10, fill: '#2c736f', 'font-weight': 700, text: '实际：' + E.V + ' mL' }, g);
    S('text', { x: 270, y: 82, 'font-size': 9.5, fill: '#7b8a89', text: eye === 'level' ? '视线与凹液面最低处相平' : eye === 'up' ? '仰视：读数偏小' : '俯视：读数偏大' }, g);
    var fr = 3 / (3 + E.V) * 100;
    L.$('#prep-water').textContent = E.V + ' mL';
    L.$('#prep-frac').textContent = L.fmt(fr, 1) + '%';
    L.$('#prep-wbox').className = 'verdict-box ' + (eye === 'level' ? 'yes' : 'no');
    L.$('#prep-fbox').className = 'verdict-box ' + (eye === 'level' ? 'yes' : 'no');
    L.$('#prep-text').innerHTML = eye === 'level'
      ? '视线与凹液面最低处保持水平，量得 47 mL 水：3 g ÷ (3 g + 47 g) × 100% = 6%，正好。'
      : eye === 'up'
        ? '仰视时视线从下往上斜，刻度线比液面低，读出 47 mL 时实际已经约 50 mL（图中按多 3 mL 示意）。水多了：3 ÷ 53 × 100% ≈ 5.7%，<b>偏小</b>。'
        : '俯视时视线从上往下斜，读出 47 mL 时实际只有约 44 mL（图中按少 3 mL 示意）。水少了：3 ÷ 47 × 100% ≈ 6.4%，<b>偏大</b>。';
    save();
  }
  L.chips(L.$('#eye-chips'), [{ label: '平视', value: 'level' }, { label: '仰视', value: 'up' }, { label: '俯视', value: 'down' }], eye, function (v) { eye = v; drawPrep(); });

  /* ========== 溶解时的温度变化 ========== */
  var heatSvg = L.$('#heat');
  var HEAT = {
    NaOH: { f: 'NaOH', dT: 25, word: '放热', feel: '发烫',
      text: '氢氧化钠溶于水<b>放出大量的热</b>，温度升高约 25 ℃，烧杯外壁发烫。NaOH 还有强烈的腐蚀性，不能用手直接拿。' },
    NH4NO3: { f: 'NH4NO3', dT: -7, word: '吸热', feel: '发凉',
      text: '硝酸铵溶于水<b>吸收热量</b>，温度降低约 7 ℃，烧杯外壁摸着发凉。有的“速冷冰袋”就是利用这一点。' },
    NaCl: { f: 'NaCl', dT: -1.5, word: '基本不变', feel: '没什么变化',
      text: '氯化钠溶于水，温度<b>基本不变</b>（估算只降约 1.5 ℃，手摸不出来）。' }
  };
  var hs = HEAT[st.h] ? st.h : 'NaOH', hp = 0, added = false, heatAnim = null, stirT = 0;
  var hparts = (function () { var r = rng(53), a = []; for (var i = 0; i < 30; i++) a.push({ u: r(), v: r(), th: r() * 0.7 }); return a; })();
  function ease(p) { return 1 - (1 - p) * (1 - p); }
  function heatT() { return 20 + HEAT[hs].dT * ease(hp); }
  function TY(t) { return 172 - t * 2.4; }
  function drawHeat() {
    heatSvg.innerHTML = '';
    var H = HEAT[hs], Tc = heatT(), d = Tc - 20;
    var defs = S('defs', {}, heatSvg);
    S('rect', { x: 112, y: 40, width: 136, height: 154 }, S('clipPath', { id: 'heat-clip' }, defs));
    S('rect', { x: 0, y: 0, width: 400, height: 220, rx: 14 }, S('clipPath', { id: 'heat-card' }, defs));
    S('rect', { x: 0, y: 0, width: 400, height: 220, rx: 14, fill: '#fbfaf7' }, heatSvg);
    var card = S('g', { 'clip-path': 'url(#heat-card)' }, heatSvg);
    if (Math.abs(d) > 2) S('rect', { x: 102, y: 34, width: 156, height: 170, rx: 12, fill: 'none', stroke: d > 0 ? '#f0a070' : '#8fc0ea', 'stroke-width': 8, opacity: Math.min(0.6, Math.abs(d) / 20) }, card);
    var g = S('g', { 'clip-path': 'url(#heat-clip)' }, card);
    var tint = d > 0 ? mix('#e2eff6', '#f8e1d1', d / 25) : mix('#e2eff6', '#d2e6f8', -d / 7);
    S('rect', { x: 112, y: 90, width: 136, height: 106, fill: tint }, g);
    if (added) {
      var left = 1 - hp;
      if (left > 0.02) S('path', { d: 'M' + (150 - 22 * left) + ' 194Q150 ' + (194 - 22 * left) + ' ' + (150 + 22 * left) + ' 194z', fill: '#f7f6f0', stroke: '#b9bfc5' }, g);
      hparts.forEach(function (p) {
        var t = L.clamp((hp - p.th) * 3, 0, 1);
        if (t <= 0) return;
        S('circle', { cx: L.lerp(150, 118 + p.u * 92, t), cy: L.lerp(190, 98 + p.v * 92, t), r: 1.8, fill: '#7a8a9a', opacity: 0.75 - 0.45 * t }, g);
      });
    }
    var sw = added && hp < 1 ? Math.sin(stirT * 8) * 10 : 0;
    S('line', { x1: 168 + sw, y1: 26, x2: 186 + sw * 0.3, y2: 190, stroke: '#b9c4c9', 'stroke-width': 3, 'stroke-linecap': 'round' }, card);
    S('path', { d: 'M104 36L110 40V198H250V40L256 36', fill: 'none', stroke: '#9fb0b8', 'stroke-width': 2, 'stroke-linejoin': 'round' }, card);
    // 温度计
    S('rect', { x: 222, y: 20, width: 8, height: 160, rx: 4, fill: '#ffffff', stroke: '#9fb0b8', 'stroke-width': 0.8 }, card);
    S('rect', { x: 224, y: TY(Tc), width: 4, height: 182 - TY(Tc), fill: '#d0573a' }, card);
    S('circle', { cx: 226, cy: 184, r: 7, fill: '#d0573a' }, card);
    for (var t = 0; t <= 50; t += 10) {
      S('line', { x1: 230, y1: TY(t), x2: 236, y2: TY(t), stroke: '#7b8a89' }, card);
      S('text', { x: 265, y: TY(t) + 3.5, 'font-size': 9.5, fill: '#7b8a89', text: t }, card);
    }
    S('text', { x: 265, y: 34, 'font-size': 9.5, fill: '#7b8a89', text: '℃' }, card);
    S('text', { x: 296, y: 96, 'font-size': 22, 'font-weight': 700, fill: d > 2 ? '#c2603f' : d < -2 ? '#3a78b8' : '#1f302e', text: L.fmt(Tc, 1) + ' ℃' }, card);
    S('text', { x: 296, y: 116, 'font-size': 10, fill: '#6b7877', text: added && hp > 0.6 ? '手摸外壁：' + H.feel : '起始 20 ℃' }, card);
    // 药品
    if (!added) {
      S('path', { d: 'M22 196H92L86 190H28z', fill: '#efe9da' }, card);
      S('path', { d: 'M38 191Q57 172 76 191z', fill: '#f7f6f0', stroke: '#b9bfc5' }, card);
      chemText(card, { x: 57, y: 166, 'font-size': 12, 'text-anchor': 'middle', 'font-weight': 700, fill: '#1f302e' }, '10 g ' + H.f);
    } else chemText(card, { x: 57, y: 166, 'font-size': 12, 'text-anchor': 'middle', 'font-weight': 700, fill: '#7b8a89' }, H.f + ' 已加入');
    S('text', { x: 180, y: 214, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#6b7877', text: '100 g 水' }, card);
  }
  function readHeat() {
    var H = HEAT[hs], Tc = heatT(), d = Tc - 20;
    L.$('#heat-badge').textContent = !added ? '还没加' : hp < 1 ? '溶解中' : H.word;
    L.$('#heat-t').innerHTML = L.fmt(Tc, 1) + '<small>℃</small>';
    L.$('#heat-dt').innerHTML = (d > 0.05 ? '+' : d < -0.05 ? '−' : '') + L.fmt(Math.abs(d), 1) + '<small>℃</small>';
    L.$('#heat-text').innerHTML = !added ? '先选一种物质，再点“加入 10 g 并搅拌”。'
      : hp < 1 ? '正在溶解，温度计的液柱' + (H.dT > 3 ? '在上升' : H.dT < -3 ? '在下降' : '几乎不动') + '……'
        : H.text;
    save();
  }
  function heatReset() { if (heatAnim) { heatAnim.stop(); heatAnim = null; } added = false; hp = 0; drawHeat(); readHeat(); }
  L.chips(L.$('#heat-chips'), [{ label: '氢氧化钠 NaOH', value: 'NaOH' }, { label: '硝酸铵 ' + C('NH4NO3'), value: 'NH4NO3' }, { label: '氯化钠 NaCl', value: 'NaCl' }], hs, function (v) { hs = v; heatReset(); });
  L.$('#heat-go').addEventListener('click', function () {
    if (heatAnim) heatAnim.stop();
    added = true; hp = 0;
    if (L.REDUCED) { hp = 1; drawHeat(); readHeat(); return; }
    heatAnim = L.loop(function (dt) {
      hp = Math.min(1, hp + dt / 3.5); stirT += dt;
      drawHeat(); readHeat();
      if (hp >= 1) { heatAnim = null; return false; }
    });
  });
  L.$('#heat-reset').addEventListener('click', heatReset);

  function save() { L.setState({ k: sub, t: Math.round(T), m: m, w: Math.round(w), a: aS, b: Math.round(aW), e: eye, h: hs }); }

  msg('提示：' + C('KNO3') + ' 在 60 ℃ 加到 110 g 正好饱和，然后点“降温结晶”。');
  refreshSol();
  refreshDil();
  drawPrep();
  drawHeat(); readHeat();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '调出 20 ℃ 时恰好饱和的 NaCl 溶液',
      desc: '在溶解度曲线里选 NaCl，把温度调到 20 ℃，加入适量 NaCl，让它刚好饱和、杯底没有固体（水保持 100 g）。',
      label: '在溶解度曲线里操作',
      button: '检查这杯溶液',
      check: function () {
        if (sub !== 'NaCl') return { ok: false, msg: '先在“溶质”里选 NaCl。' };
        if (Math.round(T) !== 20) return { ok: false, msg: '温度要调到 20 ℃，现在是 ' + Math.round(T) + ' ℃。' };
        if (w < 99.5) return { ok: false, msg: '水被蒸发过了，先点“重置”让水回到 100 g。' };
        var s = status();
        if (s.sat === 'under') return { ok: false, msg: '还没饱和，还能再溶 ' + L.fmt(s.c - m, 1) + ' g。看看曲线：20 ℃ 时 100 g 水最多溶多少？' };
        if (s.sat === 'over') return { ok: false, msg: '加多了，杯底剩了 ' + L.fmt(s.x, 1) + ' g 固体。“恰好饱和”要正好溶完。' };
        return { ok: true, msg: '20 ℃ 时 NaCl 的溶解度是 36.0 g，100 g 水里放 36 g 正好饱和。这杯溶液的质量分数是 36 ÷ 136 × 100% ≈ 26.5%，不是 36%。' };
      }
    },
    {
      level: 'base',
      title: '“20 ℃ 时 KNO₃ 的溶解度是 31.6 g”，意思是',
      desc: '溶解度的定义有四个要素。',
      options: ['20 ℃ 时，100 g 水中最多能溶解 31.6 g ' + C('KNO3'), '100 g ' + C('KNO3') + ' 溶液中含有 31.6 g ' + C('KNO3'), '20 ℃ 时，100 g 水中溶解了 31.6 g ' + C('KNO3'), '31.6 g ' + C('KNO3') + ' 溶于水就能达到饱和'],
      answer: 0,
      hint: '检查四样东西：温度、100 g 什么、是否饱和、单位。',
      explain: '溶解度要四样齐全：一定温度、100 g <b>溶剂</b>、达到<b>饱和</b>、单位是 g。“100 g 溶液”把溶剂错成了溶液；“溶解了 31.6 g”没说是最多能溶的量（不一定饱和）；最后一项既没有温度，也没有溶剂的量。'
    },
    {
      level: 'base',
      title: '让烧杯外壁摸起来变凉',
      desc: '在“溶解时的温度变化”里选一种物质加进水里，让溶液温度明显降低。',
      label: '在温度变化实验里操作',
      button: '检查温度计',
      check: function () {
        if (!added || hp < 1) return { ok: false, msg: '选好物质后点“加入 10 g 并搅拌”，等它溶解完。' };
        if (hs === 'NH4NO3') return { ok: true, msg: C('NH4NO3') + ' 溶于水吸热，温度降到约 13 ℃。NaOH 正好相反，溶于水放热；NaCl 溶于水温度基本不变。' };
        if (hs === 'NaOH') return { ok: false, msg: 'NaOH 溶于水<b>放热</b>，外壁是烫的。换一种试试。' };
        return { ok: false, msg: 'NaCl 溶于水温度基本不变，摸不出凉。换一种试试。' };
      }
    },
    {
      level: 'mid',
      title: '用降温结晶得到 KNO₃ 晶体',
      desc: '在溶解度曲线里配好一杯 ' + C('KNO3') + ' 溶液，再用烧杯下面的“降温结晶”让它析出晶体。',
      label: '在溶解度曲线和烧杯里操作',
      button: '检查烧杯',
      check: function () {
        if (lastAct && lastAct.type === 'cool' && lastAct.sub === 'KNO3' && lastAct.out > 0.5) return { ok: true, msg: '析出了 ' + L.fmt(lastAct.out, 1) + ' g 晶体。' + C('KNO3') + ' 的溶解度随温度降低大幅减小，冷却热饱和溶液就能得到大量晶体。' };
        if (sub !== 'KNO3') return { ok: false, msg: '先在“溶质”里选 ' + C('KNO3') + '。' };
        if (lastAct && lastAct.type === 'cool') return { ok: false, msg: '降温后没有析出。先在高温时把溶液调到饱和或接近饱和（比如 60 ℃ 加 110 g），再降温。' };
        return { ok: false, msg: '调好溶液后，点烧杯下面的“降温结晶”。' };
      }
    },
    {
      level: 'mid',
      title: '把 100 g 10% 的 NaCl 溶液稀释成 5%',
      desc: '在“溶质质量分数与稀释”里，先调成 10 g NaCl + 90 g 水，再只加水，把它稀释成 5%。',
      label: '在稀释实验里操作',
      button: '检查质量分数',
      check: function () {
        var r = dcalc();
        if (aS !== 10) return { ok: false, msg: '溶质要保持 10 g。稀释只加水，不加 NaCl。' };
        if (Math.abs(r.frac - 5) < 0.01) return { ok: true, msg: '水从 90 g 加到 190 g，溶液变成 200 g：100 g × 10% = 200 g × 5%，溶质都是 10 g，所以要加 100 g 水。' };
        if (r.frac > 5) return { ok: false, msg: '还不够稀，现在是 ' + L.fmt(r.frac, 2) + '%，继续加水。' };
        return { ok: false, msg: '加多了，现在是 ' + L.fmt(r.frac, 2) + '%。把水调回去一些。' };
      }
    },
    {
      level: 'mid',
      title: '60 ℃ 时 210 g KNO₃ 饱和溶液降温到 20 ℃，析出晶体多少克？',
      desc: C('KNO3') + ' 的溶解度：60 ℃ 时 110 g，20 ℃ 时 31.6 g。可以在曲线上验证。',
      options: ['78.4 g', '110 g', '31.6 g', '141.6 g'],
      answer: 0,
      hint: '先算 210 g 饱和溶液里有多少水、多少 ' + C('KNO3') + '。降温时水的质量变不变？',
      explain: '60 ℃ 时 210 g 饱和溶液 = 100 g 水 + 110 g ' + C('KNO3') + '。降到 20 ℃，这 100 g 水只能溶 31.6 g，析出 110 g − 31.6 g = <b>78.4 g</b>。110 g 是原来溶解的总量，31.6 g 是剩在溶液里的量，都不是析出的量。'
    },
    {
      level: 'trap',
      title: '下列说法正确的是',
      desc: '每一项都是常见的坑。',
      options: ['饱和溶液不一定是浓溶液', '均一、稳定的液体一定是溶液', '用洗洁精洗掉油污，是因为油污溶解在洗洁精里', C('Ca(OH)2') + ' 的饱和溶液降温后会析出晶体'],
      answer: 0,
      hint: '想想 ' + C('Ca(OH)2') + ' 有多难溶，水算不算溶液，洗洁精去油叫什么作用。',
      explain: C('Ca(OH)2') + ' 很难溶，20 ℃ 时 100 g 水才溶 0.165 g，它的饱和溶液很稀，所以<b>饱和不一定浓</b>。水也均一、稳定，但它是纯净物，不是溶液；洗洁精去油是<b>乳化</b>，汽油去油才是溶解；' + C('Ca(OH)2') + ' 降温溶解度变大，不会析出晶体。'
    },
    {
      level: 'trap',
      title: '配制 6% 的 NaCl 溶液，量水时仰视读数，结果会',
      desc: '其他操作都正确。可以在“配制溶液”里切换视线看看。',
      options: ['质量分数偏小', '质量分数偏大', '质量分数不变', '无法判断'],
      answer: 0,
      hint: '仰视读出 47 mL 的时候，量筒里实际的水比 47 mL 多还是少？',
      explain: '仰视时读数<b>偏小</b>，实际量取的水比读数多，溶剂多了，质量分数就<b>偏小</b>。俯视正好相反：实际水少，质量分数偏大。别把“读数偏小”和“结果偏小”混成一回事，要一步步推。'
    }
  ]);
})();
