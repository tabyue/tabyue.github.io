/* 化学互动馆 · 第 7 课 燃烧与能源（教材第七单元 能源的合理利用与开发） */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();

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
      var m = t.match(/^=(.+)=$/);
      if (m) return eqSign(m[1]);
      return L.chem(t);
    }).join('');
  }
  L.$$('[data-eq]').forEach(function (el) { el.innerHTML = eq(el.dataset.eq); });
  function clipRect(svgEl, id, w, h) {
    var d = S('defs', {}, svgEl);
    S('rect', { x: 0, y: 0, width: w, height: h, rx: 14 }, S('clipPath', { id: id }, d));
    return d;
  }
  function mix(c1, c2, t) {
    var a = [1, 3, 5].map(function (i) { return parseInt(c1.substr(i, 2), 16); }), b = [1, 3, 5].map(function (i) { return parseInt(c2.substr(i, 2), 16); });
    return '#' + a.map(function (v, i) { var x = Math.round(L.lerp(v, b[i], L.clamp(t, 0, 1))).toString(16); return x.length < 2 ? '0' + x : x; }).join('');
  }
  function flame(g, x, y, h, t, kind) {
    var k = 1 + 0.1 * Math.sin((t || 0) * 18 + x * 0.3), w = h * 0.42;
    var c = kind === 'blue' ? ['#6f9fe0', '#cfe0fb', '#3f6fc0'] : ['#f2a43a', '#ffe08a', '#d97a1f'];
    S('path', { d: 'M' + x + ' ' + (y - h * k) + 'C' + (x + w) + ' ' + (y - h * 0.4) + ' ' + (x + w * 0.9) + ' ' + y + ' ' + x + ' ' + y + 'C' + (x - w * 0.9) + ' ' + y + ' ' + (x - w) + ' ' + (y - h * 0.4) + ' ' + x + ' ' + (y - h * k) + 'z', fill: c[0], stroke: c[2], 'stroke-width': 0.8, opacity: 0.95 }, g);
    S('path', { d: 'M' + x + ' ' + (y - h * 0.5) + 'C' + (x + w * 0.45) + ' ' + (y - h * 0.22) + ' ' + (x + w * 0.4) + ' ' + y + ' ' + x + ' ' + y + 'C' + (x - w * 0.4) + ' ' + y + ' ' + (x - w * 0.45) + ' ' + (y - h * 0.22) + ' ' + x + ' ' + (y - h * 0.5) + 'z', fill: c[1] }, g);
  }
  function smoke(g, x, y, t) { S('path', { d: 'M' + x + ' ' + y + 'c-4 -6 4 -10 0 -18', fill: 'none', stroke: '#a7b0b2', 'stroke-width': 1.4, opacity: 0.8 }, g); }
  var visible = {};
  function watch(el, key) {
    visible[key] = true;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible[key] = es[0].isIntersecting; }).observe(el);
  }

  /* ========== ① 燃烧条件探究 ========== */
  var T = L.num(st.t, 80, 20, 90), o2 = st.o === '1';
  var pho = L.$('#pho');
  var phoDefs = clipRect(pho, 'pho-clip', 400, 250);
  watch(pho, 'pho');
  var tPho = 0;
  function state() {
    var hot = T >= 40;
    return { cuW: hot, cuR: false, waW: hot && o2 };
  }
  function drawPho() {
    pho.innerHTML = ''; pho.appendChild(phoDefs);
    S('rect', { x: 0, y: 0, width: 400, height: 250, rx: 14, fill: '#fbfaf7' }, pho);
    var g = S('g', { 'clip-path': 'url(#pho-clip)' }, pho), s = state(), h = (T - 20) / 70;
    S('line', { x1: 10, y1: 238, x2: 390, y2: 238, stroke: '#d9dcd5', 'stroke-width': 2 }, g);
    // 烧杯与热水
    var bx0 = 70, bx1 = 300, top = 100, bot = 236;
    S('rect', { x: bx0 + 2, y: top + 14, width: bx1 - bx0 - 4, height: bot - top - 16, fill: mix('#d9ecf3', '#f3dccf', h), opacity: 0.95 }, g);
    S('path', { d: 'M' + (bx0 - 4) + ' ' + top + 'L' + bx0 + ' ' + (top + 4) + 'L' + bx0 + ' ' + (bot - 4) + 'Q' + bx0 + ' ' + bot + ' ' + (bx0 + 4) + ' ' + bot + 'L' + (bx1 - 4) + ' ' + bot + 'Q' + bx1 + ' ' + bot + ' ' + bx1 + ' ' + (bot - 4) + 'L' + bx1 + ' ' + top, fill: 'none', stroke: '#7f9fc0', 'stroke-width': 1.6 }, g);
    if (T >= 55) [110, 255].forEach(function (x, i) { var ph = (tPho * 0.4 + i * 0.5) % 1; S('path', { d: 'M' + x + ' ' + (top - 6 - ph * 14) + 'q-4 -5 0 -10', fill: 'none', stroke: '#c5cfd2', 'stroke-width': 1.3, opacity: (1 - ph) * (T - 50) / 40 }, g); });
    // 铜片
    S('rect', { x: 52, y: top - 6, width: 266, height: 6, rx: 1.5, fill: '#c8794a', stroke: '#9a5530', 'stroke-width': 0.8 }, g);
    S('text', { x: 185, y: top - 12, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#7a5a3a', text: '薄铜片' }, g);
    // 铜片上的白磷、红磷
    var wx = 108, rx = 262, py = top - 6;
    S('path', { d: 'M' + (wx - 8) + ' ' + py + 'q2 -8 8 -8q6 0 8 8z', fill: s.cuW ? '#f7e9b5' : '#f4efd2', stroke: '#b9ad7a' }, g);
    S('path', { d: 'M' + (rx - 8) + ' ' + py + 'q2 -8 8 -8q6 0 8 8z', fill: '#c2453a', stroke: '#8f2e26' }, g);
    if (s.cuW) {
      flame(g, wx, py - 6, 26, tPho);
      for (var i = 0; i < 6; i++) { var ph = (tPho * 0.35 + i / 6) % 1; S('circle', { cx: wx + Math.sin(i * 2 + tPho) * 8 + ph * 18, cy: py - 34 - ph * 60, r: 5 + ph * 9, fill: '#eceeee', opacity: 0.85 * (1 - ph) }, g); }
      S('text', { x: wx + 40, y: 28, 'font-size': 9.5, fill: '#7a8786', text: '大量白烟' }, g);
    }
    S('text', { x: wx, y: py + 22, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#546160', 'font-weight': 600, text: '白磷' }, g);
    S('text', { x: rx, y: py + 22, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#546160', 'font-weight': 600, text: '红磷' }, g);
    // 水中的白磷
    var ux = 185, uy = bot - 4;
    S('path', { d: 'M' + (ux - 9) + ' ' + uy + 'q2 -9 9 -9q7 0 9 9z', fill: '#f4efd2', stroke: '#b9ad7a' }, g);
    S('text', { x: ux + 16, y: uy - 2, 'font-size': 9.5, fill: '#546160', 'font-weight': 600, text: '水中白磷' }, g);
    if (s.waW) flame(g, ux, uy - 8, 22, tPho + 1);
    // 氧气导管
    if (o2) {
      S('path', { d: 'M24 30L24 54L150 54L150 ' + (uy - 6) + 'L' + (ux - 12) + ' ' + (uy - 6), fill: 'none', stroke: '#9fb6c9', 'stroke-width': 3.5, 'stroke-linejoin': 'round' }, g);
      S('text', { x: 24, y: 24, 'font-size': 9.5, fill: '#3f6f8a', 'font-weight': 600, text: '通入 ' + U('O2') }, g);
      for (var b = 0; b < 8; b++) { var pb = (tPho * 0.8 + b / 8) % 1; S('circle', { cx: ux - 8 + Math.sin(b * 3 + tPho * 4) * 4, cy: uy - 8 - pb * (uy - top - 30), r: 1.8 + (b % 3) * 0.5, fill: 'none', stroke: '#6f9fb9', 'stroke-width': 0.9 }, g); }
    }
    // 温度计
    var tx = 336, tTop = 40, tBot = 214, colTop = tBot - 10 - (T - 0) / 100 * (tBot - tTop - 20);
    S('rect', { x: tx - 5, y: tTop, width: 10, height: tBot - tTop, rx: 5, fill: '#f6f8f9', stroke: '#9aa7ab' }, g);
    S('rect', { x: tx - 2, y: colTop, width: 4, height: tBot - colTop, fill: '#d0533f' }, g);
    S('circle', { cx: tx, cy: tBot + 4, r: 7, fill: '#d0533f', stroke: '#9aa7ab' }, g);
    [20, 40, 60, 80].forEach(function (v) {
      var y = tBot - 10 - v / 100 * (tBot - tTop - 20);
      S('line', { x1: tx + 5, y1: y, x2: tx + 10, y2: y, stroke: '#9aa7ab' }, g);
      S('text', { x: tx + 13, y: y + 3, 'font-size': 9, fill: v === 40 ? '#a4492b' : '#7a8786', 'font-weight': v === 40 ? 700 : 400, text: v + (v === 40 ? ' 着火点' : '') }, g);
    });
    S('text', { x: tx, y: tTop - 6, 'font-size': 10, 'text-anchor': 'middle', fill: '#a4492b', 'font-weight': 700, text: T + ' ℃' }, g);
  }
  function readPho() {
    var s = state(), n = (s.cuW ? 1 : 0) + (s.waW ? 1 : 0);
    L.$('#temp-out').textContent = T + ' ℃';
    L.$('#temp-stat').innerHTML = T + '<small>℃</small>';
    L.$('#burn-count').innerHTML = n ? n + '<small>处</small>' : '没有';
    L.$('#burn-badge').textContent = n === 2 ? '两块白磷都在燃烧' : n === 1 ? '铜片上的白磷在燃烧' : '都不燃烧';
    var Y = '<span style="color:#2f6a4a;font-weight:600">✓</span>', N = '<span style="color:#a4492b;font-weight:600">✗</span>';
    var rows = [
      ['铜片上的白磷', Y, Y + ' 空气', T >= 40 ? Y + ' 已达 40 ℃' : N + ' 未到 40 ℃', s.cuW],
      ['铜片上的红磷', Y, Y + ' 空气', N + ' 未到约 240 ℃', false],
      ['水中的白磷', Y, o2 ? Y + ' 通了氧气' : N + ' 被水隔绝', T >= 40 ? Y + ' 已达 40 ℃' : N + ' 未到 40 ℃', s.waW]
    ];
    var tb = L.$('#cond-table tbody');
    tb.innerHTML = '';
    rows.forEach(function (r) {
      L.html('tr', { class: r[4] ? 'on' : null, html: '<td>' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td><td>' + r[3] + '</td><td><b style="color:' + (r[4] ? '#a4492b' : '#7a8786') + '">' + (r[4] ? '燃烧' : '不燃烧') + '</b></td>' }, tb);
    });
    var t;
    if (T < 40) t = '水温 ' + T + ' ℃，还没达到白磷的着火点（40 ℃），' + (o2 ? '即使通了氧气，' : '') + '三处都不燃烧。把水温调高试试。';
    else if (!o2) t = '铜片上的白磷燃烧，产生大量白烟；红磷不燃烧，热水最多 100 ℃，远没到它的着火点（约 240 ℃）；水里的白磷温度够了，却不燃烧，因为它<b>没有接触氧气</b>。现在给它通入氧气试试。';
    else t = '通入氧气后，水里的白磷也燃烧起来了！和铜片上的白磷一对比，说明燃烧需要<b>与氧气接触</b>；而红磷始终不燃烧，说明<b>温度要达到着火点</b>。';
    L.$('#burn-text').innerHTML = t;
    save();
  }
  var tempIn = L.$('#temp-in');
  tempIn.value = T;
  L.bindRange(tempIn, function (v) { T = v; drawPho(); readPho(); });
  L.chips(L.$('#o2-chips'), [{ label: '不通氧气', value: '0' }, { label: '通入氧气', value: '1' }], o2 ? '1' : '0', function (v) { o2 = v === '1'; drawPho(); readPho(); });

  /* ========== ② 灭火原理配对 ========== */
  var PR = { o2: '隔绝氧气', fuel: '清除或隔离可燃物', temp: '降温到着火点以下' };
  var SC = [
    { k: 'pan', label: '油锅着火盖锅盖', ans: 'o2', why: '锅盖把油和空气隔开，火就灭了。千万不能用水浇：油比水轻，会浮在水面上继续燃烧，还会溅出来。' },
    { k: 'forest', label: '森林火灾开隔离带', ans: 'fuel', why: '把大火前方的一片树木砍掉、清走，火烧到隔离带就没有可燃物了。' },
    { k: 'wood', label: '用水浇灭柴火', ans: 'temp', why: '水蒸发时吸收大量的热，使温度降到木柴的着火点以下。降低的是温度，木柴的着火点没有变。' },
    { k: 'lamp', label: '灯帽盖灭酒精灯', ans: 'o2', why: '灯帽罩住火焰，隔绝了氧气。熄灭酒精灯不能用嘴吹。' },
    { k: 'gas', label: '关闭燃气阀门', ans: 'fuel', why: '阀门一关，燃气（可燃物）不再送过来，火焰自然熄灭。燃气泄漏时也要先关阀门。' },
    { k: 'candle', label: '吹灭生日蜡烛', ans: 'temp', why: '吹出的气流带走热量，使温度降到着火点以下。' }
  ];
  var scKey = SC.some(function (s) { return s.k === st.sc; }) ? st.sc : 'pan';
  var res = {}, lastPick = {};
  var ext = L.$('#ext');
  var extDefs = clipRect(ext, 'ext-clip', 400, 230);
  function cur() { return SC.filter(function (s) { return s.k === scKey; })[0]; }
  function drawScene(g, s, out) {
    var t = 0;
    if (s.k === 'pan') {
      S('rect', { x: 40, y: 176, width: 160, height: 40, rx: 4, fill: '#d7dcdc', stroke: '#a3adb0' }, g);
      S('path', { d: 'M60 160Q60 176 76 176L164 176Q180 176 180 160z', fill: '#4f565c' }, g);
      S('line', { x1: 180, y1: 164, x2: 216, y2: 156, stroke: '#4f565c', 'stroke-width': 6, 'stroke-linecap': 'round' }, g);
      if (out) { S('path', { d: 'M54 158Q120 112 186 158z', fill: '#9aa3a6', stroke: '#6b7680' }, g); S('circle', { cx: 120, cy: 128, r: 5, fill: '#6b7680' }, g); }
      else { flame(g, 100, 160, 44, t); flame(g, 126, 160, 56, t + 1); flame(g, 150, 160, 40, t + 2); }
    } else if (s.k === 'forest') {
      S('rect', { x: 10, y: 196, width: 210, height: 22, fill: '#d9e3c9' }, g);
      if (out) S('rect', { x: 96, y: 196, width: 40, height: 22, fill: '#c8b48e' }, g);
      [24, 54, 84, 114, 148, 178, 208].forEach(function (x, i) {
        var cut = out && x > 96 && x < 136;
        S('rect', { x: x - 3, y: cut ? 190 : 170, width: 6, height: cut ? 8 : 28, fill: '#8a6a4d' }, g);
        if (cut) return;
        var burning = i < 3 || (!out && i < 6);
        S('path', { d: 'M' + x + ' 120L' + (x + 16) + ' 172L' + (x - 16) + ' 172z', fill: burning ? '#6f6a55' : '#5e9a5a' }, g);
        if (burning) flame(g, x, 150, 34, t + i);
      });
      if (out) S('text', { x: 116, y: 212, 'font-size': 9, 'text-anchor': 'middle', fill: '#7a5a3a', text: '隔离带' }, g);
    } else if (s.k === 'wood') {
      [[70, 190, 20], [150, 190, -20], [110, 180, 0]].forEach(function (l) { S('rect', { x: l[0] - 36, y: l[1], width: 72, height: 12, rx: 6, fill: '#8a6a4d', transform: 'rotate(' + l[2] * 0.3 + ' ' + l[0] + ' ' + l[1] + ')' }, g); });
      if (out) {
        S('path', { d: 'M24 40L60 34L64 58L28 62z', fill: '#7f9fc0' }, g);
        S('path', { d: 'M62 44Q110 60 110 170', fill: 'none', stroke: '#8fbad3', 'stroke-width': 6, 'stroke-linecap': 'round', opacity: 0.8 }, g);
        [90, 120, 140].forEach(function (x) { S('path', { d: 'M' + x + ' 170q-6 -10 0 -20q6 -10 0 -20', fill: 'none', stroke: '#c5cfd2', 'stroke-width': 2 }, g); });
      } else { flame(g, 90, 182, 46, t); flame(g, 116, 182, 62, t + 1); flame(g, 140, 182, 44, t + 2); }
    } else if (s.k === 'lamp') {
      S('path', { d: 'M70 214L82 150L158 150L170 214z', fill: '#eef3f4', stroke: '#9aa7ab', 'stroke-width': 1.5 }, g);
      S('rect', { x: 110, y: 136, width: 20, height: 14, fill: '#9aa7ab' }, g);
      if (out) S('path', { d: 'M102 152L104 104Q120 92 136 104L138 152z', fill: '#cfe0e6', stroke: '#7f9fc0', 'stroke-width': 1.5, opacity: 0.95 }, g);
      else flame(g, 120, 136, 48, t);
      S('text', { x: 120, y: 190, 'font-size': 10, 'text-anchor': 'middle', fill: '#546160', text: '酒精' }, g);
    } else if (s.k === 'gas') {
      S('rect', { x: 30, y: 180, width: 180, height: 34, rx: 5, fill: '#d7dcdc', stroke: '#a3adb0' }, g);
      S('ellipse', { cx: 120, cy: 172, rx: 40, ry: 8, fill: '#5e6b6a' }, g);
      S('path', { d: 'M10 140H50V176', fill: 'none', stroke: '#c9a24b', 'stroke-width': 6 }, g);
      S('rect', { x: 22, y: out ? 120 : 132, width: out ? 8 : 24, height: out ? 24 : 8, rx: 3, fill: '#d0533f' }, g);
      S('text', { x: 26, y: 112, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#a4492b', text: out ? '阀门已关' : '阀门' }, g);
      if (!out) [92, 106, 120, 134, 148].forEach(function (x, i) { flame(g, x, 166, 22, t + i, 'blue'); });
    } else {
      S('rect', { x: 50, y: 196, width: 140, height: 18, rx: 6, fill: '#f3d3c9' }, g);
      S('rect', { x: 112, y: 120, width: 16, height: 76, rx: 3, fill: '#f6efe0', stroke: '#c9b48a' }, g);
      S('line', { x1: 120, y1: 120, x2: 120, y2: 112, stroke: '#33403f', 'stroke-width': 1.5 }, g);
      if (out) { [0, 1, 2].forEach(function (i) { S('path', { d: 'M' + (30 + i * 4) + ' ' + (96 + i * 12) + 'q20 -6 50 0', fill: 'none', stroke: '#9fb3b1', 'stroke-width': 1.6 }, g); }); smoke(g, 120, 110); }
      else flame(g, 120, 112, 30, t);
    }
    S('text', { x: 115, y: 26, 'font-size': 11.5, 'text-anchor': 'middle', fill: '#33403f', 'font-weight': 700, text: s.label }, g);
  }
  function drawExt(flash) {
    ext.innerHTML = ''; ext.appendChild(extDefs);
    S('rect', { x: 0, y: 0, width: 400, height: 230, rx: 14, fill: '#fbfaf7' }, ext);
    var g = S('g', { 'clip-path': 'url(#ext-clip)' }, ext), s = cur(), out = res[s.k] === 'ok';
    drawScene(g, s, out);
    S('line', { x1: 226, y1: 20, x2: 226, y2: 210, stroke: '#e2e5dd', 'stroke-dasharray': '3 4' }, g);
    // 燃烧三角形
    var A = [300, 50], B = [242, 162], C = [358, 162];
    var sides = { o2: [A, B, '氧气', -1], temp: [A, C, '温度达到着火点', 1], fuel: [B, C, '可燃物', 0] };
    Object.keys(sides).forEach(function (k) {
      var sd = sides[k], cut = out && s.ans === k, warn = flash === k;
      var col = cut ? '#a4492b' : warn ? '#d9a13a' : '#2c736f';
      if (cut) {
        var mx = (sd[0][0] + sd[1][0]) / 2, my = (sd[0][1] + sd[1][1]) / 2;
        S('line', { x1: sd[0][0], y1: sd[0][1], x2: L.lerp(sd[0][0], mx, 0.75), y2: L.lerp(sd[0][1], my, 0.75), stroke: col, 'stroke-width': 5, 'stroke-linecap': 'round' }, g);
        S('line', { x1: sd[1][0], y1: sd[1][1], x2: L.lerp(sd[1][0], mx, 0.75), y2: L.lerp(sd[1][1], my, 0.75), stroke: col, 'stroke-width': 5, 'stroke-linecap': 'round' }, g);
        S('text', { x: mx, y: my + 5, 'font-size': 14, 'text-anchor': 'middle', fill: col, 'font-weight': 700, text: '✗' }, g);
      } else S('line', { x1: sd[0][0], y1: sd[0][1], x2: sd[1][0], y2: sd[1][1], stroke: col, 'stroke-width': warn ? 6 : 5, 'stroke-linecap': 'round' }, g);
      var lx = (sd[0][0] + sd[1][0]) / 2 + sd[3] * 14, ly = (sd[0][1] + sd[1][1]) / 2 + (sd[3] === 0 ? 22 : 0);
      var lines = k === 'temp' ? ['温度达到', '着火点'] : [sd[2]];
      lines.forEach(function (tx, li) { S('text', { x: lx, y: ly + li * 13 - (lines.length - 1) * 6, 'font-size': 10.5, 'text-anchor': sd[3] < 0 ? 'end' : sd[3] > 0 ? 'start' : 'middle', fill: col, 'font-weight': 600, text: tx }, g); });
    });
    if (out) smoke(g, 300, 132); else flame(g, 300, 140, 40, 0);
    S('text', { x: 300, y: 212, 'font-size': 10.5, 'text-anchor': 'middle', fill: out ? '#2f6a4a' : '#7a8786', 'font-weight': 600, text: out ? '断了一条边，火灭了' : '三条边都在，火在烧' }, g);
  }
  function readExt(msg) {
    var n = SC.filter(function (s) { return res[s.k] === 'ok'; }).length;
    L.$('#ext-badge').textContent = '已扑灭 ' + n + ' / ' + SC.length;
    var s = cur();
    L.$('#ext-text').innerHTML = msg || (res[s.k] === 'ok' ? '<b>' + s.label + '</b>：' + PR[s.ans] + '。' + s.why : '<b>' + s.label + '</b>：这种做法拿掉的是燃烧三角形的哪一条边？在下面选一个灭火原理。');
    var ul = L.$('#ext-list');
    ul.innerHTML = '';
    SC.forEach(function (x) {
      var ok = res[x.k] === 'ok', bad = !ok && lastPick[x.k];
      L.html('li', { class: ok ? 'yes' : bad ? 'no' : null, html: '<i>' + (ok ? '✓' : bad ? '✗' : '·') + '</i><span>' + x.label + (ok ? ' → ' + PR[x.ans] : bad ? '（选了“' + PR[lastPick[x.k]] + '”，再想想）' : '') + '</span>' }, ul);
    });
    save();
  }
  L.chips(L.$('#sc-chips'), SC.map(function (s) { return { label: s.label, value: s.k }; }), scKey, function (v) { scKey = v; prChips.set(res[v] === 'ok' ? cur().ans : ''); drawExt(); readExt(); });
  var prChips = L.chips(L.$('#pr-chips'), Object.keys(PR).map(function (k) { return { label: PR[k], value: k }; }), '', function (v) {
    var s = cur();
    if (v === s.ans) { res[s.k] = 'ok'; drawExt(); readExt(); }
    else {
      lastPick[s.k] = v;
      var hint = { o2: '这种做法并没有把火和空气隔开。', fuel: '这种做法并没有把可燃物拿走。', temp: '这种做法主要不是靠降温。' }[v];
      drawExt(v); readExt('<b>' + s.label + '</b>：' + hint + '再看看它到底拿掉了哪一条边。');
    }
  });

  /* ========== ③ 甲烷燃烧与能源 ========== */
  var ratio = L.num(st.r, 2.4, 1, 3);
  var fl = L.$('#flame');
  var flDefs = clipRect(fl, 'flame-clip', 400, 230);
  watch(fl, 'flame');
  var tFl = 0;
  function lack() { return L.clamp((2 - ratio) / 1, 0, 1); }
  function drawFlame() {
    fl.innerHTML = ''; fl.appendChild(flDefs);
    S('rect', { x: 0, y: 0, width: 400, height: 230, rx: 14, fill: '#fbfaf7' }, fl);
    var g = S('g', { 'clip-path': 'url(#flame-clip)' }, fl), k = lack(), t = tFl;
    // 锅
    S('path', { d: 'M110 40L290 40L280 76Q278 84 268 84L132 84Q122 84 120 76z', fill: '#9aa3a6', stroke: '#6b7680', 'stroke-width': 1.5 }, g);
    S('path', { d: 'M126 80Q200 92 274 80L268 84L132 84z', fill: '#1e2226', opacity: k * 0.9 }, g);
    S('path', { d: 'M124 78L276 78', stroke: '#1e2226', 'stroke-width': 6, opacity: k * 0.85 }, g);
    if (k > 0) S('text', { x: 300, y: 82, 'font-size': 9.5, fill: '#33403f', text: '锅底发黑' }, g);
    // 灶头
    S('rect', { x: 60, y: 186, width: 280, height: 32, rx: 6, fill: '#d7dcdc', stroke: '#a3adb0' }, g);
    S('rect', { x: 150, y: 168, width: 100, height: 14, rx: 4, fill: '#5e6b6a' }, g);
    // 进风口
    var open = (ratio - 1) / 2;
    S('rect', { x: 72, y: 194, width: 46, height: 16, rx: 3, fill: '#3d4448' }, g);
    S('rect', { x: 72, y: 194, width: 46 * (1 - open), height: 16, rx: 3, fill: '#a3adb0' }, g);
    S('text', { x: 95, y: 226, 'font-size': 9, 'text-anchor': 'middle', fill: '#546160', text: '进风口' }, g);
    // 火焰
    [160, 180, 200, 220, 240].forEach(function (x, i) {
      var h = 44 + k * 34 + Math.sin(t * 9 + i) * (2 + k * 6);
      if (k < 0.02) flame(g, x, 168, h * 0.8, t + i, 'blue');
      else {
        flame(g, x + Math.sin(t * 5 + i) * k * 4, 168, h, t + i, k > 0.3 ? 'yellow' : 'blue');
        if (k <= 0.3) flame(g, x, 168, h * 0.55, t + i + 0.5, 'yellow');
      }
    });
    // 黑烟（炭黑）
    if (k > 0) for (var i = 0; i < Math.round(6 + k * 18); i++) {
      var ph = (t * 0.5 + i / (6 + k * 18)) % 1;
      S('circle', { cx: 160 + (i * 37 % 80) + Math.sin(t * 3 + i) * 5, cy: 120 - ph * 34, r: 1.5 + ph * 3, fill: '#2a2e31', opacity: (1 - ph) * (0.3 + k * 0.6) }, g);
    }
    S('text', { x: 200, y: 22, 'font-size': 11, 'text-anchor': 'middle', 'font-weight': 700, fill: k < 0.02 ? '#3f6fc0' : '#a46a1f', text: k < 0.02 ? '蓝色火焰：完全燃烧' : '黄色火焰、冒黑烟：不完全燃烧' }, g);
  }
  function readFlame() {
    var k = lack();
    L.$('#o2r-out').textContent = L.fmt(ratio, 1) + ' : 1';
    if (k < 0.02) {
      L.$('#flame-badge').textContent = '完全燃烧';
      L.$('#flame-color').textContent = '蓝色';
      L.$('#harm-out').textContent = '几乎没有';
      L.$('#prod-out').innerHTML = '二氧化碳 CO<sub>2</sub> 和水 H<sub>2</sub>O';
      L.$('#flame-eq').innerHTML = eq('CH4 + 2O2 =点燃= CO2 + 2H2O');
      L.$('#flame-text').innerHTML = '方程式告诉我们：1 个甲烷分子要 <b>2 个</b>氧分子才能烧完全。现在氧气给得' + (ratio > 2.05 ? '比 2 倍还多' : '刚好够') + '，燃料里的碳全部变成 CO<sub>2</sub>，放出的热量最多。';
    } else {
      L.$('#flame-badge').textContent = k > 0.45 ? '严重不完全燃烧' : '不完全燃烧';
      L.$('#flame-color').textContent = k > 0.3 ? '黄色，冒黑烟' : '发黄';
      L.$('#harm-out').innerHTML = '有毒的 CO、炭黑';
      L.$('#prod-out').innerHTML = 'CO<sub>2</sub>、H<sub>2</sub>O，还有 CO 和炭黑（C）';
      L.$('#flame-eq').innerHTML = '<span class="step">' + eq('CH4 + 2O2 =点燃= CO2 + 2H2O') + '<span class="why">完全燃烧要求 O₂ : CH₄ 至少 2 : 1</span></span>' +
        (ratio <= 1.55 ? '<span class="step">' + eq('2CH4 + 3O2 =点燃= 2CO + 4H2O') + '<span class="why">氧气不足时的一种情况：碳变成了有毒的 CO</span></span>' : '');
      L.$('#flame-text').innerHTML = '氧气不够，一部分碳没能变成 CO<sub>2</sub>，而是变成了有毒的 <b>CO</b> 和黑色的<b>炭黑</b>。这样既浪费燃料、放热少，又污染空气。家里燃气灶火焰发黄、锅底发黑，就要<b>调大进风口</b>。';
    }
    save();
  }
  var o2rIn = L.$('#o2r-in');
  o2rIn.value = ratio;
  L.bindRange(o2rIn, function (v) { ratio = v; drawFlame(); readFlame(); });

  var EN = {
    coal: ['煤', '化石燃料 · 不可再生', '煤被称为“工业的粮食”，主要含<b>碳</b>元素。燃烧时会产生二氧化硫、二氧化氮等污染物，它们溶于雨水会形成<b>酸雨</b>。把煤隔绝空气加强热，可以得到焦炭、煤焦油、煤气等有用的物质，这是化学变化。'],
    oil: ['石油', '化石燃料 · 不可再生', '石油被称为“工业的血液”，主要含<b>碳、氢</b>元素。利用各成分的沸点不同把它们分离，可以得到汽油、煤油、柴油、石蜡、沥青等，这个过程是<b>物理变化</b>。'],
    ngas: ['天然气', '化石燃料 · 不可再生', '天然气的主要成分是甲烷（' + L.chem('CH4') + '），是比较清洁的化石燃料。海底埋藏的“可燃冰”主要含有甲烷水合物，被看作未来的新能源。'],
    h2: ['氢气', '新能源 · 最清洁', '氢气燃烧只生成水：' + eq('2H2 + O2 =点燃= 2H2O') + '。它热值高、产物无污染，是最清洁的燃料。目前还没有广泛使用，主要是因为<b>制取成本高、贮存困难</b>。'],
    solar: ['太阳能', '新能源 · 可再生', '太阳能取之不尽。可以用太阳能热水器把水烧热，也可以用太阳能电池把光能直接转化为电能。'],
    wind: ['风能', '新能源 · 可再生', '风力发电把风的能量转化为电能，不消耗燃料、不排放污染物。正在开发利用的新能源还有地热能、潮汐能、生物质能、核能等。']
  };
  var en = EN[st.e] ? st.e : 'ngas';
  function readEnergy() {
    L.$('#energy-badge').textContent = EN[en][1];
    L.$('#energy-info').innerHTML = EN[en][2];
    save();
  }
  L.chips(L.$('#energy-chips'), Object.keys(EN).map(function (k) { return { label: EN[k][0], value: k }; }), en, function (v) { en = v; readEnergy(); });

  function save() { L.setState({ t: T, o: o2 ? 1 : 0, sc: scKey, r: ratio, e: en }); }

  drawPho(); readPho();
  drawExt(); readExt();
  drawFlame(); readFlame();
  readEnergy();

  /* 火焰、白烟、黑烟的轻微动画：只在画面可见时重绘 */
  L.loop(function (dt) {
    var s = state();
    if (visible.pho && (s.cuW || o2 || T >= 55)) { tPho += dt; drawPho(); }
    if (visible.flame) { tFl += dt; drawFlame(); }
  });

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '只让铜片上的白磷燃烧',
      desc: '调节热水温度、选择是否通氧气，让铜片上的白磷燃烧，而水中的白磷不燃烧。',
      label: '在燃烧条件实验里操作',
      button: '检查现象',
      check: function () {
        var s = state();
        if (s.cuW && !s.waW) return { ok: true, msg: '水温 ' + T + ' ℃ 达到了白磷的着火点；铜片上的白磷接触空气，燃烧了；水中的白磷被水隔绝了氧气，不燃烧。' };
        if (!s.cuW) return { ok: false, msg: '水温 ' + T + ' ℃，还没到白磷的着火点 40 ℃。把水温调高。' };
        return { ok: false, msg: '现在水中的白磷也在燃烧，因为通了氧气。先把氧气关掉。' };
      }
    },
    {
      level: 'base',
      title: '铜片上的白磷燃烧而红磷不燃烧，说明',
      desc: '两者都在铜片上，接触空气，温度相同。',
      options: ['燃烧需要温度达到可燃物的着火点', '燃烧需要氧气', '红磷不是可燃物', '燃烧需要热水'],
      answer: 0,
      hint: '两者唯一的不同是什么？白磷着火点约 40 ℃，红磷约 240 ℃。',
      explain: '白磷和红磷都接触空气、温度一样，区别在于<b>着火点</b>：热水能让温度超过白磷的着火点，却远低于红磷的。所以说明燃烧需要温度达到着火点。红磷也是可燃物，温度够了一样能燃烧。'
    },
    {
      level: 'base',
      title: '下列能源中，不属于化石燃料的是',
      desc: '化石燃料是古代生物遗骸经过漫长地质年代形成的。',
      options: ['氢气', '煤', '石油', '天然气'],
      answer: 0,
      hint: '三大化石燃料是哪三种？',
      explain: '<b>煤、石油、天然气</b>是三大化石燃料，都是不可再生能源。氢气属于新能源，燃烧只生成水，是最清洁的燃料。'
    },
    {
      level: 'mid',
      title: '让水里的白磷也燃烧起来',
      desc: '水里的白磷泡在热水中。想办法让它在水下燃烧。',
      label: '在燃烧条件实验里操作',
      button: '检查现象',
      check: function () {
        var s = state();
        if (s.waW) return { ok: true, msg: '水温达到着火点，又通入了氧气，三个条件都满足，白磷在水下也能燃烧。这说明“水”本身不是关键，关键是隔绝了氧气。' };
        if (!o2) return { ok: false, msg: '水里的白磷缺的是什么？试试给它通入氧气。' };
        return { ok: false, msg: '氧气有了，可水温只有 ' + T + ' ℃，没到白磷的着火点。' };
      }
    },
    {
      level: 'mid',
      title: '把六个火场全部扑灭',
      desc: '在“灭火：拿掉三角形的一条边”里，给每个火场选对灭火原理。',
      label: '在灭火配对里操作',
      button: '检查灭火记录',
      check: function () {
        var left = SC.filter(function (s) { return res[s.k] !== 'ok'; });
        if (!left.length) return { ok: true, msg: '隔绝氧气：盖锅盖、灯帽盖灭；清除或隔离可燃物：隔离带、关阀门；降温到着火点以下：浇水、吹蜡烛。' };
        return { ok: false, msg: '还有 ' + left.length + ' 个火场没扑灭：' + left.map(function (s) { return s.label; }).join('、') + '。' };
      }
    },
    {
      level: 'mid',
      title: '把燃气灶调成蓝色火焰',
      desc: '妈妈说锅底总是发黑。在“燃气灶：氧气够不够”里调节进风口，让甲烷完全燃烧。',
      label: '在燃气灶模型里操作',
      button: '检查火焰',
      check: function () {
        if (lack() < 0.02) return { ok: true, msg: eq('CH4 + 2O2 =点燃= CO2 + 2H2O') + '<br>氧气与甲烷的分子个数比至少 2 : 1，甲烷才能完全燃烧，火焰呈蓝色，不再生成 CO 和炭黑。' };
        return { ok: false, msg: '火焰还在发黄，说明氧气不够。看看方程式里 O<sub>2</sub> 前面的化学计量数是几，把进风口调大。' };
      }
    },
    {
      level: 'trap',
      title: '用水浇灭着火的木柴，主要原理是',
      desc: '注意每个选项的措辞。',
      options: ['使温度降到木柴的着火点以下', '降低了木柴的着火点', '隔绝了空气', '清除了可燃物'],
      answer: 0,
      hint: '着火点是木柴本身的性质，浇水能改变它吗？',
      explain: '水蒸发吸热，使<b>温度降到着火点以下</b>。着火点是物质本身的属性，一般不会改变，所以“降低着火点”是错的。木柴还在，所以也不是清除可燃物。'
    },
    {
      level: 'trap',
      title: '晚上回家闻到很浓的燃气味，首先应该',
      desc: '燃气和空气混合后，遇到火花可能爆炸。',
      options: ['关闭燃气阀门，打开门窗通风', '马上开灯检查哪里漏气', '打开排气扇把燃气抽走', '在屋里打电话报修'],
      answer: 0,
      hint: '开灯、开排气扇、打电话，有什么共同的危险？',
      explain: '先<b>关闭阀门</b>，切断可燃物来源，再<b>开窗通风</b>，降低燃气浓度。开灯、开排气扇、在屋里打电话，都可能产生<b>电火花</b>，引燃燃气发生爆炸。到屋外安全的地方再打电话报修。'
    }
  ]);
})();
