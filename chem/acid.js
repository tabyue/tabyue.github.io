/* 化学互动馆 · 第 10 课 常见的酸、碱、盐 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg, C = L.chem;
  var st = L.getState();

  function ext(a, b) { var o = {}, k; for (k in a) o[k] = a[k]; for (k in b) o[k] = b[k]; return o; }
  /* SVG 里写化学式：元素符号或右括号后面的数字做成下标 */
  function chemText(parent, x, y, s, attrs) {
    var t = S('text', ext({ x: x, y: y }, attrs || {}), parent);
    var fs = +(attrs && attrs['font-size']) || 11, segs = [], prev = '';
    for (var i = 0; i < s.length; i++) {
      var c = s.charAt(i), last = segs[segs.length - 1];
      var sub = /\d/.test(c) && (/[A-Za-z)]/.test(prev) || !!(last && last.sub && /\d/.test(prev)));
      if (last && last.sub === sub) last.t += c; else segs.push({ t: c, sub: sub });
      prev = c;
    }
    var down = false, d = fs * 0.3;
    segs.forEach(function (g) {
      var a = { text: g.t };
      if (g.sub) { a['font-size'] = fs * 0.72; if (!down) { a.dy = d; down = true; } }
      else if (down) { a.dy = -d; down = false; }
      S('tspan', a, t);
    });
    return t;
  }
  function hex(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
  function mixCol(a, b, t) {
    var x = hex(a), y = hex(b);
    return 'rgb(' + [0, 1, 2].map(function (i) { return Math.round(x[i] + (y[i] - x[i]) * t); }).join(',') + ')';
  }
  function ease(t) { return t * t * (3 - 2 * t); }
  var LIQ = '#e3eef2';

  /* ========== ① 酸碱检测台 ========== */
  var SUBS = [
    { v: 'gastric', name: '胃液', lo: 0.9, hi: 1.5, paper: 1, note: '胃液里含有盐酸，能帮助消化食物，酸性很强。' },
    { v: 'lemon', name: '柠檬汁', lo: 2, hi: 3, paper: 2, note: '柠檬里含有柠檬酸，吃起来酸就是这个原因。' },
    { v: 'vinegar', name: '食醋', lo: 3, hi: 3, approx: true, paper: 3, note: '食醋里含有醋酸（乙酸），是厨房里最常见的酸。' },
    { v: 'water', name: '纯水', lo: 7, hi: 7, paper: 7, note: '常温下纯水既不显酸性也不显碱性，pH = 7。' },
    { v: 'brine', name: '食盐水', lo: 7, hi: 7, paper: 7, note: '食盐 NaCl 属于盐，它的水溶液显中性。' },
    { v: 'soap', name: '肥皂水', lo: 10, hi: 10, approx: true, paper: 10, note: '肥皂水显碱性。被蚊虫叮咬后涂一点肥皂水，可以中和蚊虫分泌的酸性物质，减轻痛痒。' },
    { v: 'soda', name: '纯碱溶液', lo: 11, hi: 12, paper: 11, note: '纯碱是碳酸钠 Na2CO3，它属于<b>盐</b>，不是碱，可它的水溶液显碱性。' },
    { v: 'oven', name: '炉具清洁剂', lo: 12, hi: 13, paper: 12, note: '炉具清洁剂里含有氢氧化钠，碱性很强，会腐蚀皮肤，使用时要戴橡胶手套。' }
  ];
  var PHC = ['#c0262d', '#e2342b', '#ef5a2a', '#f68b2c', '#f9b233', '#f6dd3a', '#c7d93c', '#5fb848', '#2fa36b', '#21958f', '#2a7bbf', '#2d55a6', '#3d3d94', '#4b2b7f', '#3b1f63'];
  var IND_NAME = { litmus: '紫色石蕊溶液', phenol: '无色酚酞溶液', paper: 'pH 试纸' };
  var STOCK = { litmus: '#8b5fae', phenol: '#f4f6f6' };
  var KIND_CN = { acid: '酸性', neutral: '中性', base: '碱性' };

  function findSub(v) { for (var i = 0; i < SUBS.length; i++) if (SUBS[i].v === v) return SUBS[i]; return null; }
  var sub = findSub(st.s) || SUBS[1];
  var ind = IND_NAME[st.i] ? st.i : 'litmus';
  var method = ({ rod: 1, dip: 1, wet: 1 })[st.m] ? st.m : 'rod';
  var mixT = 1, dropT = 1, labAnim = null;

  function midPH(s) { return (s.lo + s.hi) / 2; }
  function kindOf(ph) { return ph < 7 ? 'acid' : ph > 7 ? 'base' : 'neutral'; }
  function indColor(i, ph) {
    if (i === 'litmus') return ph < 7 ? '#d8475c' : ph > 7 ? '#3d6fc2' : '#8b5fae';
    if (i === 'phenol') return ph > 7 ? '#ec5f9e' : LIQ;
    return LIQ;
  }
  function colorWord(i, ph) {
    if (i === 'litmus') return ph < 7 ? '变红' : ph > 7 ? '变蓝' : '紫色';
    return ph > 7 ? '变红' : '无色';
  }
  function paperRead() {
    var r = sub.paper;
    if (method === 'wet') { if (r < 7) r = Math.min(7, r + 1); else if (r > 7) r = Math.max(7, r - 1); }
    return r;
  }
  function paperName(n) { return n <= 2 ? '红色' : n <= 4 ? '橙色' : n <= 6 ? '黄色' : n === 7 ? '绿色' : n <= 10 ? '青蓝色' : '深蓝紫色'; }
  function rangeText(s) { return s.lo === s.hi ? (s.approx ? '约 ' : '') + L.fmt(s.lo, 1) : L.fmt(s.lo, 1) + '～' + L.fmt(s.hi, 1); }

  var lab = L.$('#ph-lab');
  function drawLab() {
    lab.innerHTML = '';
    var defs = S('defs', {}, lab);
    var c1 = S('clipPath', { id: 'lab-clip' }, defs);
    S('rect', { x: 0, y: 0, width: 400, height: 250, rx: 14 }, c1);
    var c2 = S('clipPath', { id: 'lab-beaker' }, defs);
    S('path', { d: 'M42 56V164Q42 170 48 170H142Q148 170 148 164V56Z' }, c2);
    S('rect', { x: 0, y: 0, width: 400, height: 250, rx: 14, fill: '#f8fbfa' }, lab);
    var root = S('g', { 'clip-path': 'url(#lab-clip)' }, lab);
    var ph = midPH(sub), kind = kindOf(ph);
    var col = ind === 'paper' ? LIQ : mixCol(LIQ, indColor(ind, ph), mixT);

    // 烧杯与溶液
    S('rect', { x: 40, y: 100, width: 110, height: 72, fill: col, 'clip-path': 'url(#lab-beaker)' }, root);
    S('line', { x1: 42, y1: 100, x2: 148, y2: 100, stroke: '#ffffff', 'stroke-opacity': 0.7, 'stroke-width': 1.5 }, root);
    for (var k = 0; k < 4; k++) S('line', { x1: 42, y1: 154 - k * 16, x2: 51, y2: 154 - k * 16, stroke: '#a9bdbb', 'stroke-width': 1 }, root);
    S('path', { d: 'M34 52H42V164Q42 170 48 170H142Q148 170 148 164V52H156', fill: 'none', stroke: '#7d9a98', 'stroke-width': 2, 'stroke-linejoin': 'round' }, root);
    S('rect', { x: 63, y: 130, width: 64, height: 19, rx: 6, fill: '#ffffff', 'fill-opacity': 0.88 }, root);
    S('text', { x: 95, y: 144, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 600, fill: '#1f302e', text: sub.name }, root);

    if (ind !== 'paper') {
      // 胶头滴管
      S('ellipse', { cx: 95, cy: 18, rx: 7, ry: 9, fill: '#6b5a7e' }, root);
      S('rect', { x: 92, y: 25, width: 6, height: 32, rx: 2, fill: STOCK[ind], stroke: '#9fb3b1' }, root);
      S('path', { d: 'M92 57L95 64L98 57Z', fill: STOCK[ind], stroke: '#9fb3b1' }, root);
      S('text', { x: 106, y: 22, 'font-size': 10, fill: '#546160', text: '滴入' + IND_NAME[ind] }, root);
      if (dropT < 1) {
        var dy = L.lerp(66, 100, dropT * dropT);
        S('circle', { cx: 95, cy: dy, r: 3.2, fill: STOCK[ind], stroke: '#8fa6a4', 'stroke-width': 0.8 }, root);
      }
      // 颜色对照
      S('text', { x: 290, y: 36, 'text-anchor': 'middle', 'font-size': 10.5, fill: '#546160', text: IND_NAME[ind] + '的颜色' }, root);
      [['acid', '酸性溶液', 4], ['neutral', '中性溶液', 7], ['base', '碱性溶液', 10]].forEach(function (c, j) {
        var cx = 226 + j * 64, on = kind === c[0];
        if (on) S('rect', { x: cx - 29, y: 44, width: 58, height: 128, rx: 10, fill: '#eaf6f6', stroke: '#2c736f', 'stroke-width': 1.5 }, root);
        S('path', { d: 'M' + (cx - 9) + ' 88V128A9 9 0 0 0 ' + (cx + 9) + ' 128V88Z', fill: indColor(ind, c[2]) }, root);
        S('path', { d: 'M' + (cx - 9) + ' 56V128A9 9 0 0 0 ' + (cx + 9) + ' 128V56', fill: 'none', stroke: '#8fa6a4', 'stroke-width': 1.5 }, root);
        S('text', { x: cx, y: 154, 'text-anchor': 'middle', 'font-size': 10, fill: '#546160', text: c[1] }, root);
        S('text', { x: cx, y: 167, 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': 600, fill: on ? '#2c736f' : '#546160', text: colorWord(ind, c[2]) }, root);
      });
    } else {
      var rd = paperRead(), pc = PHC[rd];
      S('rect', { x: 206, y: 112, width: 132, height: 20, rx: 3, fill: '#ffffff', stroke: '#b9c7c6' }, root);
      S('text', { x: 342, y: 126, 'font-size': 9.5, fill: '#546160', text: '玻璃片' }, root);
      if (method === 'dip') {
        // 试纸直接伸进烧杯
        S('rect', { x: 112, y: 64, width: 12, height: 36, fill: '#f2d77a', stroke: '#c9b98a' }, root);
        S('rect', { x: 112, y: 100, width: 12, height: 34, fill: pc, stroke: '#c9b98a', 'clip-path': 'url(#lab-beaker)' }, root);
        S('text', { x: 272, y: 66, 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 700, fill: '#c0392b', text: '✗' }, root);
        S('text', { x: 272, y: 86, 'text-anchor': 'middle', 'font-size': 10.5, fill: '#a4492b', 'font-weight': 600, text: '试纸伸进了待测液' }, root);
        S('text', { x: 272, y: 101, 'text-anchor': 'middle', 'font-size': 10, fill: '#a4492b', text: '整瓶溶液被污染' }, root);
      } else {
        S('rect', { x: 252, y: 115, width: 40, height: 14, rx: 1.5, fill: method === 'wet' ? mixCol(pc, '#ffffff', 0.35) : pc, stroke: '#c9b98a' }, root);
        S('line', { x1: 232, y1: 34, x2: 268, y2: 102, stroke: '#a9c3cf', 'stroke-width': 4, 'stroke-linecap': 'round' }, root);
        S('circle', { cx: 270, cy: 107, r: 3, fill: '#cfe0e6', stroke: '#9fb3b1', 'stroke-width': 0.8 }, root);
        S('text', { x: 240, y: 30, 'font-size': 10, fill: '#546160', text: '玻璃棒蘸取待测液' }, root);
        if (method === 'wet') {
          [[246, 110], [298, 112], [286, 134], [258, 136]].forEach(function (p) { S('circle', { cx: p[0], cy: p[1], r: 2.4, fill: '#bfe0f0', stroke: '#8fbcd4', 'stroke-width': 0.6 }, root); });
          S('text', { x: 294, y: 98, 'font-size': 10, fill: '#a4492b', 'font-weight': 600, text: '试纸先用水润湿了' }, root);
        }
      }
      // 读数格：从试纸连到比色卡
      var cxr = 20 + rd * 24;
      S('path', { d: (method === 'dip' ? 'M118 136' : 'M272 134') + 'L' + (cxr + 12) + ' 198', fill: 'none', stroke: '#7d9a98', 'stroke-width': 1.2, 'stroke-dasharray': '3 3' }, root);
    }

    // pH 色带（比色卡）
    for (var n = 0; n <= 14; n++) {
      S('rect', { x: 20 + n * 24, y: 200, width: 24, height: 14, fill: PHC[n] }, root);
      S('text', { x: 32 + n * 24, y: 228, 'text-anchor': 'middle', 'font-size': 9.5, fill: '#546160', text: n }, root);
    }
    S('rect', { x: 20, y: 200, width: 360, height: 14, rx: 2, fill: 'none', stroke: '#c9d4d3' }, root);
    if (ind === 'paper') {
      S('rect', { x: 20 + paperRead() * 24, y: 198.5, width: 24, height: 17, rx: 2, fill: 'none', stroke: '#1f302e', 'stroke-width': 2 }, root);
    } else {
      var xa = 32 + sub.lo * 24, xb = 32 + sub.hi * 24, xm = (xa + xb) / 2;
      S('path', { d: 'M' + xa + ' 196V191H' + xb + 'V196', fill: 'none', stroke: '#1f302e', 'stroke-width': 1.6 }, root);
      S('path', { d: 'M' + xm + ' 199l-4 -7h8z', fill: '#1f302e' }, root);
      S('text', { x: xm, y: 186, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 600, fill: '#1f302e', text: 'pH ' + rangeText(sub) }, root);
    }
    S('text', { x: 20, y: 243, 'font-size': 9.5, fill: '#a4492b', text: '← 酸性增强' }, root);
    S('text', { x: 200, y: 243, 'text-anchor': 'middle', 'font-size': 9.5, fill: '#3f8a4f', text: '中性' }, root);
    S('text', { x: 380, y: 243, 'text-anchor': 'end', 'font-size': 9.5, fill: '#2d55a6', text: '碱性增强 →' }, root);
  }

  function startDrop() {
    if (labAnim) { labAnim.stop(); labAnim = null; }
    if (ind === 'paper' || L.REDUCED) { mixT = 1; dropT = 1; drawLab(); return; }
    var t = 0;
    mixT = 0; dropT = 0;
    labAnim = L.loop(function (dt) {
      t += dt;
      dropT = Math.min(1, t / 0.45);
      mixT = L.clamp((t - 0.45) / 0.6, 0, 1);
      drawLab();
      if (mixT >= 1) { labAnim = null; return false; }
    });
  }

  function updateLab() {
    var ph = midPH(sub), k = kindOf(ph);
    L.$('#ph-badge').textContent = KIND_CN[k];
    L.$('#ph-val').textContent = rangeText(sub);
    L.$('#ph-kind').textContent = KIND_CN[k];
    var shown, t = sub.note;
    if (ind === 'litmus') {
      shown = '紫色石蕊' + (k === 'acid' ? '变红' : k === 'base' ? '变蓝' : '仍是紫色');
      t += ' 石蕊遇酸变红、遇碱变蓝，在中性溶液里保持紫色。';
    } else if (ind === 'phenol') {
      shown = '无色酚酞' + (k === 'base' ? '变红' : '不变色');
      t += k === 'base' ? ' 酚酞只在碱性溶液里变红。' : ' 酚酞在酸性和中性溶液里<b>都不变色</b>，所以“不变色”分不清是酸性还是中性。';
    } else {
      var rd = paperRead();
      shown = 'pH 试纸显' + paperName(rd) + '，读作 ' + rd + (rd > sub.paper ? '（偏大）' : rd < sub.paper ? '（偏小）' : '');
      t += ' 指示剂只能告诉你“是酸还是碱”，pH 试纸还能粗略告诉你“有多酸、多碱”。';
    }
    L.$('#ind-out').textContent = shown;
    L.$('#ph-text').innerHTML = C(t);
    updateMethod();
    save();
  }

  function updateMethod() {
    var ok = method === 'rod', rd = paperRead(), k = kindOf(midPH(sub)), t;
    L.$('#method-box').className = 'verdict-box ' + (ok ? 'yes' : 'no');
    L.$('#method-ok').textContent = ok ? '规范' : '不规范';
    L.$('#paper-out').textContent = ind === 'paper' ? 'pH ≈ ' + rd : '—';
    if (method === 'rod') t = '用干净、干燥的玻璃棒蘸取少量' + sub.name + '，滴在 pH 试纸上，把试纸显示的颜色与<b>标准比色卡</b>对照，读出 pH。这种试纸只能读到<b>整数</b>。';
    else if (method === 'dip') t = '试纸上的染料会溶进溶液，整瓶待测液就被<b>污染</b>了。即使读数看起来没错，这样做也是错误操作。';
    else if (k === 'acid') t = '试纸上的水把溶液稀释了，酸性变弱，测得的 pH <b>偏大</b>（' + sub.paper + ' → ' + rd + '）。';
    else if (k === 'base') t = '试纸上的水把溶液稀释了，碱性变弱，测得的 pH <b>偏小</b>（' + sub.paper + ' → ' + rd + '）。';
    else t = '中性溶液加水后还是中性，这次读数碰巧不变，但先润湿试纸仍然是错误操作。';
    if (ind !== 'paper') t = '现在用的是指示剂。点上面任意一种做法，左边会换成 pH 试纸。' + t;
    L.$('#method-text').innerHTML = t;
  }

  var subChips = L.chips(L.$('#sub-chips'), SUBS.map(function (s) { return { label: s.name, value: s.v }; }), sub.v, function (v) { sub = findSub(v); updateLab(); startDrop(); });
  var indChips = L.chips(L.$('#ind-chips'), [{ label: '紫色石蕊', value: 'litmus' }, { label: '无色酚酞', value: 'phenol' }, { label: 'pH 试纸', value: 'paper' }], ind, function (v) { ind = v; updateLab(); startDrop(); });
  L.chips(L.$('#method-chips'), [{ label: '玻璃棒蘸取，滴在试纸上', value: 'rod' }, { label: '把试纸直接伸进溶液', value: 'dip' }, { label: '先用水把试纸润湿', value: 'wet' }], method, function (v) {
    method = v;
    if (ind !== 'paper') { ind = 'paper'; indChips.set('paper'); }
    updateLab(); startDrop();
  });

  /* ========== ② 中和反应 ========== */
  var neu = L.$('#neu');
  var V = Math.round(L.num(st.v, 0, 0, 40) * 2) / 2;
  var dripAnim = null, dropPh = -1;
  var vIn = L.$('#v-in'), dripBtn = L.$('#drip-btn');
  vIn.value = V;
  /* 20 mL 氢氧化钠溶液，滴入同浓度的稀盐酸：20 mL 时恰好完全反应 */
  function pHof(v) {
    var n = (20 - v) * 0.1, c = Math.abs(n) / (20 + v);
    if (c < 1e-7) return 7;
    return n > 0 ? 14 + Math.log10(c) : -Math.log10(c);
  }
  function isEq() { return Math.abs(V - 20) < 1e-6; }

  function drawNeu() {
    var ax = L.axes(neu, { xmin: 0, xmax: 40, ymin: 0, ymax: 14, xstep: 5, ystep: 1, labelStep: 10, ylabelStep: 7, left: 186, right: 14, top: 16, bottom: 30, xlabel: ' ', ylabel: 'pH' });
    neu.insertBefore(S('rect', { x: 0, y: 0, width: 400, height: 240, rx: 14, fill: '#fbfcfa' }), neu.firstChild);
    var defs = S('defs', {}, neu);
    var cp = S('clipPath', { id: 'neu-plot' }, defs);
    S('rect', { x: ax.X(0) - 6, y: ax.Y(14) - 6, width: ax.X(40) - ax.X(0) + 12, height: ax.Y(0) - ax.Y(14) + 12 }, cp);
    var cb = S('clipPath', { id: 'neu-beaker' }, defs);
    S('path', { d: 'M40 100V196Q40 202 46 202H124Q130 202 130 196V100Z' }, cb);
    var ca = S('clipPath', { id: 'neu-all' }, defs);
    S('rect', { x: 0, y: 0, width: 400, height: 240, rx: 14 }, ca);

    var plot = S('g', { 'clip-path': 'url(#neu-plot)' }, neu);
    S('line', { x1: ax.X(0), y1: ax.Y(7), x2: ax.X(40), y2: ax.Y(7), stroke: '#7fae96', 'stroke-width': 1.2, 'stroke-dasharray': '5 4' }, plot);
    S('line', { x1: ax.X(20), y1: ax.Y(0), x2: ax.X(20), y2: ax.Y(14), stroke: '#b9c7c6', 'stroke-width': 1, 'stroke-dasharray': '2 3' }, plot);
    S('path', { d: L.curve(ax, pHof, 0, 40, 400), fill: 'none', stroke: '#c9d8d6', 'stroke-width': 1.6, 'stroke-dasharray': '3 3' }, plot);
    if (V > 0) S('path', { d: L.curve(ax, pHof, 0, V, Math.max(4, Math.round(V * 10))), fill: 'none', stroke: '#2c736f', 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, plot);
    var ph = pHof(V);
    S('circle', { cx: ax.X(V), cy: ax.Y(ph), r: 5, fill: '#c2603f', stroke: '#fff', 'stroke-width': 1.5 }, plot);
    S('text', { x: ax.X(40) - 2, y: ax.Y(7) - 5, 'text-anchor': 'end', 'font-size': 9.5, fill: '#3f8a4f', text: '中性 pH = 7' }, plot);
    S('text', { x: ax.X(20) + 5, y: ax.Y(13.2), 'font-size': 9.5, fill: '#546160', text: '恰好完全反应' }, plot);
    S('text', { x: ax.X(20), y: 236, 'text-anchor': 'middle', 'font-size': 10, fill: '#5b6475', text: '加入稀盐酸的体积 / mL' }, neu);

    // 烧杯
    var g = S('g', { 'clip-path': 'url(#neu-all)' }, neu);
    var hL = 30 + V * 1.1, top = 202 - hL;
    S('rect', { x: 40, y: top, width: 90, height: hL + 2, fill: ph > 7 ? '#f07fb1' : LIQ, 'clip-path': 'url(#neu-beaker)' }, g);
    S('line', { x1: 40, y1: top, x2: 130, y2: top, stroke: '#ffffff', 'stroke-opacity': 0.7, 'stroke-width': 1.5 }, g);
    S('path', { d: 'M34 96H40V196Q40 202 46 202H124Q130 202 130 196V96H136', fill: 'none', stroke: '#7d9a98', 'stroke-width': 2, 'stroke-linejoin': 'round' }, g);
    // 温度计（示意）
    var rel = Math.min(V, 20) / (20 + V) * 2;
    S('rect', { x: 113, y: 58, width: 7, height: 136, rx: 3.5, fill: '#ffffff', stroke: '#9fb3b1' }, g);
    S('rect', { x: 115, y: 194 - (36 + rel * 70), width: 3, height: 36 + rel * 70, fill: '#d0453a' }, g);
    S('circle', { cx: 116.5, cy: 194, r: 5.5, fill: '#d0453a' }, g);
    S('text', { x: 116.5, y: 52, 'text-anchor': 'middle', 'font-size': 9.5, fill: '#546160', text: '温度计' }, g);
    // 胶头滴管
    S('ellipse', { cx: 72, cy: 22, rx: 8, ry: 10, fill: '#6b7c95' }, g);
    S('rect', { x: 68.5, y: 30, width: 7, height: 56, rx: 2, fill: '#eef5f8', stroke: '#9fb3b1' }, g);
    S('path', { d: 'M68.5 86L72 95L75.5 86Z', fill: '#eef5f8', stroke: '#9fb3b1' }, g);
    S('text', { x: 84, y: 26, 'font-size': 10, fill: '#546160', text: '稀盐酸' }, g);
    if (dropPh >= 0) S('circle', { cx: 72, cy: L.lerp(98, top, dropPh * dropPh), r: 3, fill: '#d9e7ee', stroke: '#8fa6a4', 'stroke-width': 0.8 }, g);
    S('text', { x: 85, y: 220, 'text-anchor': 'middle', 'font-size': 10, fill: '#1f302e', text: '氢氧化钠溶液 20 mL' }, g);
    S('text', { x: 85, y: 233, 'text-anchor': 'middle', 'font-size': 9.5, fill: '#546160', text: '（滴有酚酞）' }, g);
  }

  function updateNeu() {
    var ph = pHof(V), badge, sol, temp, t;
    L.$('#v-out').textContent = L.fmt(V, 1) + ' mL';
    L.$('#neu-ph').textContent = L.fmt(ph, 1);
    L.$('#neu-color').textContent = ph > 7 ? '红色' : '无色';
    if (V < 1e-6) {
      badge = '还没加酸'; sol = 'NaOH'; temp = '室温';
      t = '烧杯里是氢氧化钠溶液，pH 约 13，酚酞显红色。拖动滑块或点“逐滴加入”开始滴盐酸。';
    } else if (V < 20 - 1e-6) {
      badge = '碱有剩余'; sol = 'NaOH、NaCl'; temp = '升高中';
      t = '滴进去的 HCl 马上和 NaOH 反应生成 NaCl 和水，但 NaOH 还没用完，溶液仍显碱性、仍是红色。pH 在变小，温度在升高——中和反应会<b>放热</b>。';
    } else if (isEq()) {
      badge = '恰好完全反应'; sol = 'NaCl'; temp = '最高';
      t = 'NaOH 正好被消耗完：pH = 7，红色恰好褪去，温度达到最高。烧杯里只剩氯化钠溶液。注意曲线在这里几乎是竖直的：前后差一滴，pH 就变化很大。';
    } else {
      badge = '酸过量'; sol = 'NaCl、HCl'; temp = '回落';
      t = '盐酸加多了，pH &lt; 7，可溶液<b>看起来还是无色</b>——酚酞在酸性溶液里也不变色。想知道酸有没有过量，得另外检验。反应停止后不再放热，继续加入的盐酸让温度慢慢回落。';
    }
    L.$('#neu-badge').textContent = badge;
    L.$('#neu-solute').innerHTML = C(sol);
    L.$('#neu-temp').textContent = temp;
    L.$('#neu-text').innerHTML = C(t);
    save();
  }
  function renderNeu() { drawNeu(); updateNeu(); }

  function stopDrip() {
    if (dripAnim) { dripAnim.stop(); dripAnim = null; }
    dropPh = -1;
    dripBtn.textContent = V >= 40 ? '已加到 40 mL' : V > 0 ? '继续滴加' : '逐滴加入';
  }
  function setV(v) {
    V = Math.round(L.clamp(v, 0, 40) * 2) / 2;
    vIn.value = V; L.paintRange(vIn);
    stopDrip(); renderNeu();
  }
  dripBtn.addEventListener('click', function () {
    if (dripAnim) { setV(V); return; }
    if (V >= 40) return;
    if (L.REDUCED) { setV(V < 20 ? 20 : V + 5); return; }
    var t = 0;
    dripBtn.textContent = '暂停';
    dripAnim = L.loop(function (dt) {
      t += dt;
      var before = V;
      V = Math.min(40, V + dt * 2.5);
      if (before < 20 && V >= 20) V = 20;
      dropPh = (t * 2.5) % 1;
      vIn.value = V; L.paintRange(vIn);
      if (V === 20 && before < 20) { stopDrip(); renderNeu(); return false; }
      if (V >= 40) { stopDrip(); renderNeu(); return false; }
      renderNeu();
    });
  });
  L.$('#neu-reset').addEventListener('click', function () { setV(0); });
  L.bindRange(vIn, function (val) { setV(val); });

  /* ========== ③ 复分解反应 ========== */
  var CH = [
    { v: 'HCl', cls: '酸', name: '稀盐酸' },
    { v: 'H2SO4', cls: '酸', name: '稀硫酸' },
    { v: 'NaOH', cls: '碱', name: '氢氧化钠溶液' },
    { v: 'Ca(OH)2', cls: '碱', name: '澄清石灰水' },
    { v: 'Na2CO3', cls: '盐', name: '碳酸钠溶液' },
    { v: 'BaCl2', cls: '盐', name: '氯化钡溶液' },
    { v: 'CuSO4', cls: '盐', name: '硫酸铜溶液', color: '#8fc1e8' },
    { v: 'NaCl', cls: '盐', name: '氯化钠溶液' },
    { v: 'KNO3', cls: '盐', name: '硝酸钾溶液' }
  ];
  /* 能反应的组合（键为两种物质在 CH 中的序号，小的在前） */
  var RX = {
    '0-2': { t: 'water', eq: 'NaOH + HCl = NaCl + H2O', say: '酸和碱发生<b>中和反应</b>，H^+ 和 OH^- 结合成水。混合时看不到明显现象，但溶液温度会升高；想“看见”它，可以先滴酚酞。' },
    '0-3': { t: 'water', eq: 'Ca(OH)2 + 2HCl = CaCl2 + 2H2O', say: '生成氯化钙和水，属于<b>中和反应</b>。没有明显现象，溶液温度升高。' },
    '0-4': { t: 'gas', eq: 'Na2CO3 + 2HCl = 2NaCl + H2O + CO2↑', say: '迅速产生大量<b>气泡</b>。交换成分后生成的碳酸不稳定，马上分解成水和二氧化碳；把气体通入澄清石灰水，石灰水变浑浊。' },
    '1-2': { t: 'water', eq: '2NaOH + H2SO4 = Na2SO4 + 2H2O', say: '生成硫酸钠和水，属于<b>中和反应</b>。没有明显现象，溶液温度升高。' },
    '1-3': { t: 'water', eq: 'Ca(OH)2 + H2SO4 = CaSO4 + 2H2O', say: '生成水，属于<b>中和反应</b>。CaSO4 微溶于水，溶液较浓时可能出现少量浑浊。工厂常用熟石灰处理含硫酸的废水，用的就是这个反应。' },
    '1-4': { t: 'gas', eq: 'Na2CO3 + H2SO4 = Na2SO4 + H2O + CO2↑', say: '产生大量<b>气泡</b>，放出的气体是二氧化碳。碳酸盐遇到酸都会这样。' },
    '1-5': { t: 'ppt', c: 'white', eq: 'BaCl2 + H2SO4 = BaSO4↓ + 2HCl', say: '立刻出现<b>白色沉淀</b>硫酸钡 BaSO4，它不溶于水，也不溶于稀盐酸。' },
    '2-6': { t: 'ppt', c: 'blue', eq: 'CuSO4 + 2NaOH = Cu(OH)2↓ + Na2SO4', say: '蓝色溶液里出现<b>蓝色絮状沉淀</b>氢氧化铜 Cu(OH)2，溶液的蓝色变浅。' },
    '3-4': { t: 'ppt', c: 'white', eq: 'Ca(OH)2 + Na2CO3 = CaCO3↓ + 2NaOH', say: '出现<b>白色沉淀</b>碳酸钙 CaCO3。工业上就是用纯碱和熟石灰反应来制取烧碱 NaOH 的。' },
    '3-6': { t: 'ppt', c: 'blue', eq: 'CuSO4 + Ca(OH)2 = Cu(OH)2↓ + CaSO4', say: '产生<b>蓝色沉淀</b> Cu(OH)2。农业上用石灰乳和硫酸铜溶液配制杀菌剂<b>波尔多液</b>。' },
    '4-5': { t: 'ppt', c: 'white', eq: 'Na2CO3 + BaCl2 = BaCO3↓ + 2NaCl', say: '出现<b>白色沉淀</b>碳酸钡 BaCO3。它和硫酸钡不一样：滴入稀盐酸会溶解，并冒出气泡。' },
    '4-6': { t: 'complex', c: 'green', say: '会产生蓝绿色沉淀，但产物是“碱式碳酸铜”一类的物质，不是简单的交换成分，初中不要求写这个方程式。换别的组合试试。' },
    '5-6': { t: 'ppt', c: 'white', eq: 'BaCl2 + CuSO4 = BaSO4↓ + CuCl2', say: '出现<b>白色沉淀</b>硫酸钡 BaSO4，上层溶液仍然是蓝色（生成的 CuCl2 溶液也显蓝色）。' }
  };
  /* 不反应的组合：交换后的产物（=开头表示含相同离子） */
  var NONE = {
    '0-1': 'acid', '2-3': 'base',
    '0-5': '=Cl^-', '0-7': '=Cl^-', '5-7': '=Cl^-', '1-6': '=SO4^2-', '2-4': '=Na^+', '2-7': '=Na^+', '4-7': '=Na^+',
    '0-6': 'CuCl2 和 H2SO4', '0-8': 'KCl 和 HNO3', '1-7': 'Na2SO4 和 HCl', '1-8': 'K2SO4 和 HNO3',
    '2-5': 'Ba(OH)2 和 NaCl', '2-8': 'KOH 和 NaNO3', '3-5': 'CaCl2 和 Ba(OH)2', '3-7': 'CaCl2 和 NaOH', '3-8': 'Ca(NO3)2 和 KOH',
    '4-8': 'K2CO3 和 NaNO3', '5-8': 'Ba(NO3)2 和 KCl', '6-7': 'CuCl2 和 Na2SO4', '6-8': 'Cu(NO3)2 和 K2SO4', '7-8': 'NaNO3 和 KCl'
  };
  var A = Math.round(L.num(st.a, 4, 0, 8)), B = Math.round(L.num(st.b, 0, 0, 8));
  function pairKey() { return Math.min(A, B) + '-' + Math.max(A, B); }
  function result() {
    if (A === B) return { t: 'same' };
    return RX[pairKey()] || { t: 'none', swap: NONE[pairKey()] };
  }

  var rnd = (function () { var s = 11; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })();
  var PARTS = [], BUBS = [], i;
  for (i = 0; i < 42; i++) PARTS.push({ x: 194 + rnd() * 102, y0: rnd(), fy: rnd(), r: 1.6 + rnd() * 1.8 });
  for (i = 0; i < 16; i++) BUBS.push({ x: 196 + rnd() * 98, ph: rnd(), r: 1.6 + rnd() * 2.2, sp: 0.7 + rnd() * 0.6 });

  var mixSvg = L.$('#mix');
  var mp = 1, mq = 1, mtime = 2.4, mixAnim = null;
  function tubePath(xc, close) { return 'M' + (xc - 13) + ' 40V137A13 13 0 0 0 ' + (xc + 13) + ' 137V40' + (close ? 'Z' : ''); }
  function drawMix() {
    var r = result();
    mixSvg.innerHTML = '';
    var defs = S('defs', {}, mixSvg);
    var ca = S('clipPath', { id: 'mix-clip' }, defs);
    S('rect', { x: 0, y: 0, width: 400, height: 230, rx: 14 }, ca);
    var cbk = S('clipPath', { id: 'mix-beaker' }, defs);
    S('path', { d: 'M186 50V190Q186 196 192 196H298Q304 196 304 190V50Z' }, cbk);
    [50, 112].forEach(function (xc, j) { S('path', { d: tubePath(xc, true) }, S('clipPath', { id: 'mix-tube' + j }, defs)); });
    S('rect', { x: 0, y: 0, width: 400, height: 230, rx: 14, fill: '#f8fbfa' }, mixSvg);
    var root = S('g', { 'clip-path': 'url(#mix-clip)' }, mixSvg);

    // 两支试管
    [A, B].forEach(function (idx, j) {
      var xc = j ? 112 : 50, c = CH[idx], rem = 66 * (1 - 0.8 * mp);
      S('rect', { x: xc - 14, y: 150 - rem, width: 28, height: rem + 2, fill: c.color || LIQ, 'clip-path': 'url(#mix-tube' + j + ')' }, root);
      S('path', { d: tubePath(xc), fill: 'none', stroke: '#7d9a98', 'stroke-width': 1.8 }, root);
      S('text', { x: xc, y: 32, 'text-anchor': 'middle', 'font-size': 9.5, fill: '#546160', text: j ? '乙' : '甲' }, root);
      chemText(root, xc, 168, c.v, { 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: '#1f302e' });
      S('text', { x: xc, y: 183, 'text-anchor': 'middle', 'font-size': 9, fill: '#546160', text: c.name }, root);
      var pill = c.cls === '酸' ? '#d8475c' : c.cls === '碱' ? '#3d6fc2' : '#7a6aa8';
      S('rect', { x: xc - 12, y: 190, width: 24, height: 15, rx: 7.5, fill: pill }, root);
      S('text', { x: xc, y: 201, 'text-anchor': 'middle', 'font-size': 9.5, fill: '#ffffff', 'font-weight': 600, text: c.cls }, root);
    });
    L.arrow(root, 136, 96, 176, 96, { color: '#8fa6a4', width: 1.6, head: 7 });
    S('text', { x: 156, y: 88, 'text-anchor': 'middle', 'font-size': 9.5, fill: '#546160', text: '混合' }, root);

    // 烧杯
    var hasCu = A === 6 || B === 6;
    var liq = LIQ;
    if (hasCu) liq = (r.c === 'blue' || r.t === 'complex') ? mixCol('#a9cfec', LIQ, 0.6 * mq) : '#a9cfec';
    var h = 12 + 80 * mp, top = 196 - h;
    var inner = S('g', { 'clip-path': 'url(#mix-beaker)' }, root);
    S('rect', { x: 186, y: top, width: 118, height: h + 2, fill: liq }, inner);
    S('line', { x1: 186, y1: top, x2: 304, y2: top, stroke: '#ffffff', 'stroke-opacity': 0.7, 'stroke-width': 1.5 }, inner);
    if ((r.t === 'ppt' || r.t === 'complex') && mq > 0) {
      var pcol = r.c === 'blue' ? '#3b7fc4' : r.c === 'green' ? '#5fa9a0' : '#fbfbf7';
      var pst = r.c === 'white' ? '#c4c6bc' : 'none';
      PARTS.forEach(function (p) {
        var y0 = top + 6 + p.y0 * (h - 20), yf = 192 - p.fy * 10 - p.r;
        S('circle', { cx: p.x, cy: L.lerp(y0, yf, ease(mq)), r: p.r * (r.c === 'white' ? 1 : 1.4), fill: pcol, stroke: pst, 'stroke-width': 0.6, opacity: Math.min(1, mq * 2.5) }, inner);
      });
    }
    if (r.t === 'gas' && mq > 0) {
      BUBS.forEach(function (b) {
        var span = h - 8, y = 192 - ((mtime * 40 * b.sp + b.ph * span) % span);
        S('circle', { cx: b.x, cy: y, r: b.r, fill: '#ffffff', 'fill-opacity': 0.55, stroke: '#7d9a98', 'stroke-width': 0.9, opacity: Math.min(1, mq * 3) }, inner);
      });
    }
    if (r.t === 'water' && mq > 0) {
      [222, 245, 268].forEach(function (x) {
        S('path', { d: 'M' + x + ' 92q4 -5 0 -10q-4 -5 0 -10', fill: 'none', stroke: '#e07b5f', 'stroke-width': 1.6, 'stroke-linecap': 'round', opacity: mq }, root);
      });
      S('text', { x: 245, y: 64, 'text-anchor': 'middle', 'font-size': 9.5, fill: '#c2603f', opacity: mq, text: '温度升高' }, root);
    }
    S('path', { d: 'M180 46H186V190Q186 196 192 196H298Q304 196 304 190V46H310', fill: 'none', stroke: '#7d9a98', 'stroke-width': 2, 'stroke-linejoin': 'round' }, root);
    var cap = { ppt: '产生' + (r.c === 'blue' ? '蓝色' : '白色') + '沉淀', complex: '产生蓝绿色沉淀', gas: '产生大量气泡', water: '无明显现象（生成了水）', none: '无明显现象（不反应）', same: '还是同一种溶液' }[r.t];
    S('text', { x: 245, y: 30, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: (r.t === 'none' || r.t === 'same') ? '#546160' : '#2c736f', opacity: mq > 0 ? 1 : 0, text: cap }, root);
    S('text', { x: 245, y: 214, 'text-anchor': 'middle', 'font-size': 9.5, fill: '#546160', text: '混合后的烧杯' }, root);

    // 三盏灯
    S('text', { x: 354, y: 48, 'text-anchor': 'middle', 'font-size': 9.5, fill: '#546160', text: '有没有生成' }, root);
    [['ppt', '↓', '沉淀'], ['gas', '↑', '气体'], ['water', '水', '水']].forEach(function (lp, j) {
      var y = 76 + j * 40, on = mq >= 1 && (r.t === lp[0] || (lp[0] === 'ppt' && r.t === 'complex'));
      S('circle', { cx: 332, cy: y, r: 11, fill: on ? '#2c736f' : '#eef2f1', stroke: on ? '#2c736f' : '#c9d4d3', 'stroke-width': 1.2 }, root);
      S('text', { x: 332, y: y + 4, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: on ? '#ffffff' : '#9aa8a7', text: lp[1] }, root);
      S('text', { x: 349, y: y + 4, 'font-size': 11, fill: on ? '#2c736f' : '#7c8a89', 'font-weight': on ? 700 : 400, text: lp[2] }, root);
    });
  }

  function playMix() {
    if (mixAnim) { mixAnim.stop(); mixAnim = null; }
    var r = result(), end = r.t === 'gas' ? 5.5 : 2.4;
    if (L.REDUCED) { mp = 1; mq = 1; mtime = 2.4; drawMix(); return; }
    var t = 0;
    mixAnim = L.loop(function (dt) {
      t += dt;
      mp = Math.min(1, t / 0.7); mq = L.clamp((t - 0.7) / 1.6, 0, 1); mtime = t;
      drawMix();
      if (t > end) { mixAnim = null; return false; }
    });
  }

  function updateMix() {
    var r = result(), a = CH[A], b = CH[B], t, sign, eq, badge;
    L.$('#mix-type').textContent = a.cls + ' + ' + b.cls;
    if (r.t === 'same') {
      badge = '同一种溶液'; sign = '—'; eq = '—';
      t = '甲、乙选的是同一种溶液，倒在一起还是它自己。换一种试试。';
    } else if (r.t === 'none') {
      badge = '不反应'; sign = '无'; eq = '不反应，不写方程式';
      var sw = r.swap;
      if (sw === 'acid') t = '两种都是酸，溶液里都含 H^+，互相交换得不到新物质，不发生反应。';
      else if (sw === 'base') t = '两种都是碱，溶液里都含 OH^-，互相交换得不到新物质，不发生反应。';
      else if (sw.charAt(0) === '=') t = '两种物质含有相同的 ' + sw.slice(1) + '，交换成分后还是原来的两种物质，不发生反应。';
      else t = '假如互换成分，会得到 ' + sw + '，它们都易溶于水，没有沉淀、气体或水生成，所以<b>不发生</b>复分解反应，两种溶液只是混在了一起。';
    } else {
      badge = '能反应';
      sign = { ppt: '沉淀 ↓', complex: '沉淀 ↓', gas: '气体 ↑', water: '水' }[r.t];
      eq = r.eq ? r.eq : '产物复杂，初中不要求';
      t = r.say;
    }
    L.$('#mix-badge').textContent = badge;
    L.$('#mix-sign').textContent = sign;
    L.$('#mix-eq').innerHTML = C(eq);
    L.$('#mix-text').innerHTML = C(t);
    save();
  }
  var chemItems = CH.map(function (c, k) { return { label: C(c.v), value: String(k) }; });
  L.chips(L.$('#a-chips'), chemItems, String(A), function (v) { A = +v; updateMix(); playMix(); });
  L.chips(L.$('#b-chips'), chemItems, String(B), function (v) { B = +v; updateMix(); playMix(); });
  L.$('#mix-btn').addEventListener('click', playMix);

  function save() { L.setState({ s: sub.v, i: ind, m: method, v: V, a: A, b: B }); }

  drawLab(); updateLab();
  renderNeu(); stopDrip();
  drawMix(); updateMix();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '让紫色石蕊变成蓝色',
      desc: '在酸碱检测台里选一种物质，用紫色石蕊溶液检测，让溶液变蓝。',
      label: '在酸碱检测台里操作',
      button: '检查颜色',
      check: function () {
        var k = kindOf(midPH(sub));
        if (ind !== 'litmus') return { ok: false, msg: '先把检测方法换成<b>紫色石蕊</b>。' };
        if (k === 'base') return { ok: true, msg: sub.name + '显碱性（pH ' + rangeText(sub) + '），紫色石蕊遇碱变蓝。' };
        if (k === 'acid') return { ok: false, msg: '现在石蕊变红了，说明' + sub.name + '显酸性。石蕊遇到哪一类溶液才变蓝？' };
        return { ok: false, msg: '中性溶液里石蕊仍是紫色。换一种 pH 大于 7 的物质。' };
      }
    },
    {
      level: 'base',
      title: '用 pH 试纸测得某溶液 pH = 3，它显',
      desc: '可以在色带上找到 3 的位置。',
      options: ['酸性', '中性', '碱性', '无法判断'],
      answer: 0,
      hint: '7 是中性的分界线。3 在 7 的哪一边？',
      explain: 'pH &lt; 7 的溶液显<b>酸性</b>，而且 pH 越小酸性越强。pH = 7 才是中性，pH &gt; 7 是碱性。'
    },
    {
      level: 'base',
      title: '让中和反应恰好完全进行',
      desc: '向滴有酚酞的氢氧化钠溶液里加稀盐酸，停在两者恰好完全反应的那一刻。',
      label: '在中和反应图里操作',
      button: '检查加入的体积',
      check: function () {
        if (isEq()) return { ok: true, msg: '加入 20 mL 时 pH = 7，红色恰好褪去，溶液里只剩 NaCl。' };
        if (V < 20) return { ok: false, msg: '溶液还是红色，说明 NaOH 还有剩余，继续滴加。' };
        return { ok: false, msg: '盐酸加多了，溶液已经显酸性。注意：酚酞在酸性溶液里也是无色，光看颜色发现不了加过量，把滑块往回拖。' };
      }
    },
    {
      level: 'mid',
      title: '加入 10 mL 稀盐酸时，烧杯里溶液的溶质是（不计酚酞）',
      desc: '可以把滑块拖到 10 mL，看看此时 pH 和颜色。',
      options: [C('NaCl 和 NaOH'), C('只有 NaCl'), C('NaCl 和 HCl'), C('NaOH 和 HCl')],
      answer: 0,
      hint: '此时溶液还是红色，说明哪种物质还有剩余？已经生成了什么？',
      explain: '加入的 HCl 已经和一部分 NaOH 反应生成了 <b>NaCl</b>，但 pH &gt; 7、溶液仍红，说明 <b>NaOH 有剩余</b>。NaOH 和 HCl 会反应，不可能同时大量存在；只有 NaCl 是恰好完全反应时的情况。'
    },
    {
      level: 'mid',
      title: '找一对能生成蓝色沉淀的溶液',
      desc: '在“两种溶液倒在一起”里选甲、乙，让烧杯里出现蓝色沉淀。',
      label: '在复分解反应图里操作',
      button: '检查这对溶液',
      check: function () {
        var k = pairKey();
        if (A !== B && (k === '2-6' || k === '3-6')) return { ok: true, msg: '蓝色沉淀是氢氧化铜 Cu(OH)<sub>2</sub>：硫酸铜提供 Cu<sup>2+</sup>，碱提供 OH<sup>−</sup>。' + C(RX[k].eq) + '。' };
        if (k === '4-6') return { ok: false, msg: '这一对出现的是蓝绿色沉淀，成分比较复杂。再找一对能生成 Cu(OH)<sub>2</sub> 的。' };
        return { ok: false, msg: '蓝色沉淀是氢氧化铜 Cu(OH)<sub>2</sub>，需要 Cu<sup>2+</sup> 和 OH<sup>−</sup> 碰在一起。哪种溶液含 Cu<sup>2+</sup>？哪些含 OH<sup>−</sup>？' };
      }
    },
    {
      level: 'mid',
      title: '稀释浓硫酸的正确操作是',
      desc: '浓硫酸溶于水时会放出大量的热。',
      options: ['把浓硫酸沿器壁慢慢注入水中，并用玻璃棒不断搅拌', '把水沿器壁慢慢倒入浓硫酸中，并不断搅拌', '把浓硫酸一下子全部倒进水里', '在量筒里加水稀释浓硫酸'],
      answer: 0,
      hint: '记住四句话：酸入水、沿器壁、慢慢倒、不断搅。',
      explain: '水的密度比浓硫酸小，如果把水倒进浓硫酸，水会浮在上面，放出的热使水沸腾，带着硫酸<b>飞溅</b>出来。所以要<b>酸入水</b>，并沿器壁慢慢倒、不断搅拌散热。量筒只能量体积，不能用来稀释溶液。'
    },
    {
      level: 'trap',
      title: '找一种不是碱、却能让酚酞变红的溶液',
      desc: '在酸碱检测台里选物质，用无色酚酞检测。',
      label: '在酸碱检测台里操作',
      button: '检查这种溶液',
      check: function () {
        if (ind !== 'phenol') return { ok: false, msg: '先把检测方法换成<b>无色酚酞</b>。' };
        if (sub.v === 'soda') return { ok: true, msg: '纯碱 Na<sub>2</sub>CO<sub>3</sub> 是<b>盐</b>，它的溶液显碱性，也能使酚酞变红。所以“能使酚酞变红”只能说明溶液显碱性，不能说明它是碱。' };
        if (sub.v === 'soap') return { ok: true, msg: '肥皂的主要成分是一种钠盐，不是碱，可肥皂水显碱性。课本里最典型的例子是纯碱 Na<sub>2</sub>CO<sub>3</sub>，也可以去试试。' };
        if (sub.v === 'oven') return { ok: false, msg: '酚酞确实变红了，但炉具清洁剂里含的就是氢氧化钠，它是碱。再找一种本身是<b>盐</b>的物质。' };
        return { ok: false, msg: '酚酞没有变红，' + sub.name + '不显碱性。' };
      }
    },
    {
      level: 'trap',
      title: '用先润湿过的 pH 试纸测稀盐酸，测得的 pH 会',
      desc: '可以在“pH 试纸怎么用才对”里点“先用水把试纸润湿”看看。',
      options: ['偏大', '偏小', '不变', '测不出来'],
      answer: 0,
      hint: '试纸上的水对盐酸做了什么？酸性变强还是变弱？',
      explain: '试纸上的水把盐酸<b>稀释</b>了，酸性变弱，pH 变大，所以测得结果<b>偏大</b>。如果测的是碱性溶液，结果会偏小；测中性溶液则不受影响。无论哪种情况，都不能先润湿试纸。'
    }
  ]);
})();
