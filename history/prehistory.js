/* 历史互动馆 · 第 1 课 史前时期与中华文明起源 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();

  /* ========== 距今时间轴：每格十倍 / 真实比例 ========== */
  var OLD = 2000000, HI = Math.log(OLD) / Math.LN10, LO = 3;   // 左端距今 200 万年，右端距今 1000 年
  var X0 = 24, W = 352, BASE = 166, DAY = 1700000;
  var XIA = L.span(-2070, 2026), QIN = L.span(-221, 2026);
  var EVENTS = [
    { id: 'ym', a: 1700000, b: 1700000, label: '元谋人', note: '云南元谋发现的元谋人，距今约 170 万年，是我国境内已知最早的古人类。' },
    { id: 'bj', a: 700000, b: 200000, rep: 500000, label: '北京人', note: '北京人生活在北京周口店一带，前后延续了几十万年。他们会制造和使用打制石器，会使用天然火。' },
    { id: 'sd', a: 30000, b: 30000, label: '山顶洞人', note: '山顶洞人也在周口店，会磨制骨针、缝制衣服，还用穿孔的兽牙、贝壳做装饰品。' },
    { id: 'hmd', a: 7000, b: 7000, label: '河姆渡', note: '浙江余姚的河姆渡遗址距今约 7000 年，居民种水稻，住干栏式房屋。' },
    { id: 'lz', a: 5300, b: 4300, rep: 5000, label: '良渚古城', note: '良渚古城遗址距今约 5300～4300 年，有城墙、宫殿基址和大型水利工程。' },
    { id: 'xia', a: XIA, b: XIA, label: '夏朝建立', note: '约公元前 2070 年，禹建立夏朝，这是下一课的内容。' },
    { id: 'qin', a: QIN, b: QIN, label: '秦统一', note: '公元前 221 年秦统一六国。和远古比，这几乎是“刚刚”发生的事。' }
  ];
  EVENTS.forEach(function (e) { if (!e.rep) e.rep = e.a; });

  var mode = st.sc === 'lin' ? 'lin' : 'log';
  var N = Math.round(L.num(st.n, 1700000, 1000, OLD));
  var tl = L.$('#tl'), nIn = L.$('#n-in');

  function lg(n) { return Math.log(n) / Math.LN10; }
  function X(n) { return mode === 'log' ? X0 + (HI - lg(n)) / (HI - LO) * W : X0 + (OLD - n) / OLD * W; }
  function vOf(n) { return Math.round((HI - lg(n)) / (HI - LO) * 1000); }
  function nOf(v) {
    var n = Math.pow(10, HI - v / 1000 * (HI - LO));
    return n >= 10000 ? +n.toPrecision(2) : Math.round(n / 100) * 100;
  }
  function fmtN(n) {
    if (n >= 10000) return '约 ' + L.fmt(+(n / 10000).toPrecision(3), 1) + ' 万年';
    return '约 ' + n + ' 年';
  }
  function eraOf(n) { return n > 10000 ? '旧石器时代' : (n > XIA ? '新石器时代' : '夏朝以后'); }
  function hit(n) {
    var best = null, bd = Infinity;
    EVENTS.forEach(function (e) {
      var d = (n <= e.a && n >= e.b) ? 0 : Math.min(Math.abs(lg(n) - lg(e.a)), Math.abs(lg(n) - lg(e.b)));
      if (d < 0.05 && d < bd) { bd = d; best = e; }
    });
    return best;
  }
  function textW(t) { var w = 0; for (var i = 0; i < t.length; i++) w += t.charCodeAt(i) > 255 ? 11.5 : 6.4; return w; }

  function drawTL() {
    tl.innerHTML = '';
    var defs = S('defs', {}, tl), cp = S('clipPath', { id: 'tl-clip' }, defs);
    S('rect', { x: 0, y: 0, width: 400, height: 240, rx: 12 }, cp);
    var g = S('g', { 'clip-path': 'url(#tl-clip)' }, tl);
    S('rect', { x: 0, y: 0, width: 400, height: 240, fill: '#fbf8f5' }, g);
    // 时代色带
    var eraY = BASE + 34;
    [[OLD, 10000, '旧石器时代（打制石器）', '旧石器', '#ece0d4'], [10000, XIA, '新石器时代', '新石器', '#e2cdb9'], [XIA, mode === 'log' ? 1000 : 1, '夏朝以后', '夏以后', '#d9bfa8']].forEach(function (b) {
      var x0 = X(b[0]), x1 = X(b[1]), w = x1 - x0;
      S('rect', { x: x0, y: eraY, width: Math.max(1.5, w), height: 18, rx: 4, fill: b[4], stroke: '#fff' }, g);
      var lab = textW(b[2]) * 0.92 + 6 < w ? b[2] : (b[3].length * 10.5 + 4 < w ? b[3] : '');
      if (lab) S('text', { x: (x0 + x1) / 2, y: eraY + 13, 'text-anchor': 'middle', 'font-size': lab === b[2] ? 10.5 : 10, 'font-weight': 600, fill: '#5a4036', text: lab }, g);
    });
    // 轴与刻度
    S('line', { x1: X0 - 8, y1: BASE, x2: X0 + W + 8, y2: BASE, stroke: '#9a8a80', 'stroke-width': 1.6 }, g);
    S('path', { d: 'M' + (X0 + W + 10) + ' ' + BASE + 'l-7 -4v8z', fill: '#9a8a80' }, g);
    var ticks = mode === 'log'
      ? [[1000000, '100万年'], [100000, '10万年'], [10000, '1万年'], [1000, '1000年']]
      : [[2000000, '200万年'], [1500000, '150万年'], [1000000, '100万年'], [500000, '50万年'], [1, '今天']];
    if (mode === 'log') {
      for (var d = 3; d <= 6; d++) for (var k = 2; k <= 9; k++) {
        var v = k * Math.pow(10, d);
        if (v <= OLD) S('line', { x1: X(v), y1: BASE + 6, x2: X(v), y2: BASE + 9, stroke: '#c4b6ac' }, g);
      }
    }
    ticks.forEach(function (t) {
      var x = X(t[0]);
      S('line', { x1: x, y1: BASE + 6, x2: x, y2: BASE + 13, stroke: '#9a8a80' }, g);
      S('text', { x: Math.min(x, 384), y: BASE + 25, 'text-anchor': x > 370 ? 'end' : 'middle', 'font-size': 10, fill: '#7a6a62', text: t[1] }, g);
    });
    S('text', { x: 392, y: 14, 'text-anchor': 'end', 'font-size': 10, fill: '#a0908a', text: '越往右离今天越近 →' }, g);

    // 事件
    var on = hit(N), rows = [], crowd = [];
    var lineG = S('g', {}, g), textG = S('g', {}, g);
    var evs = EVENTS.map(function (e) { return { e: e, x: (X(e.a) + X(e.b)) / 2 }; });
    evs.forEach(function (it) {
      var e = it.e;
      if (e.a !== e.b) S('line', { x1: X(e.a), y1: BASE, x2: X(e.b), y2: BASE, stroke: on === e ? '#c2603f' : '#c9a58c', 'stroke-width': 7, 'stroke-linecap': 'round', opacity: 0.8 }, lineG);
      if (mode === 'lin' && e.a < 100000) { crowd.push(e); return; }
      var w = textW(e.label) + 8, x0 = Math.max(4, Math.min(it.x - w / 2, 396 - w)), r;
      for (r = 0; r < 5; r++) {
        var clash = (rows[r] || []).some(function (b) { return x0 < b[1] && x0 + w > b[0]; });
        if (!clash) break;
      }
      (rows[r] = rows[r] || []).push([x0, x0 + w]);
      var ty = BASE - 20 - r * 20, c = on === e ? '#a4492b' : '#7d4d3c';
      function go() { setN(e.rep); }
      S('line', { x1: it.x, y1: BASE - 7, x2: it.x, y2: ty + 4, stroke: c, opacity: 0.45 }, lineG);
      var dot = S('circle', { cx: it.x, cy: BASE, r: on === e ? 6 : 4.5, fill: c, stroke: '#fff', 'stroke-width': 1.5, class: 'svg-hit' }, textG);
      dot.addEventListener('click', go);
      var hg = S('g', { class: 'svg-hit', tabindex: 0, role: 'button', 'aria-label': e.label }, textG);
      S('rect', { x: x0 + 1, y: ty - 12, width: w - 2, height: 16, rx: 3, fill: '#fbf8f5' }, hg);
      S('text', { x: x0 + w / 2, y: ty, 'text-anchor': 'middle', 'font-size': 11.5, 'font-weight': on === e ? 700 : 500, fill: c, text: e.label, stroke: '#fbf8f5', 'stroke-width': 4, 'paint-order': 'stroke' }, hg);
      hg.addEventListener('click', go);
      hg.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); go(); } });
    });
    if (crowd.length) {
      var cx = X(30000);
      S('rect', { x: cx - 3, y: BASE - 9, width: X0 + W - cx + 6, height: 18, rx: 4, fill: 'none', stroke: '#c2603f', 'stroke-dasharray': '3 2' }, g);
      S('line', { x1: cx, y1: BASE - 10, x2: cx - 30, y2: 66, stroke: '#c2603f' }, g);
      S('text', { x: cx - 32, y: 48, 'text-anchor': 'end', 'font-size': 11.5, 'font-weight': 700, fill: '#a4492b', text: '山顶洞人、河姆渡、良渚、' }, g);
      S('text', { x: cx - 32, y: 64, 'text-anchor': 'end', 'font-size': 11.5, 'font-weight': 700, fill: '#a4492b', text: '夏朝、秦统一……全挤在这一小条' }, g);
    }
    // 游标
    var x = X(N);
    S('line', { x1: x, y1: 22, x2: x, y2: BASE + 8, stroke: '#c2603f', 'stroke-width': 1.6, 'stroke-dasharray': '4 3' }, g);
    S('path', { d: 'M' + (x - 6) + ' 18h12l-6 8z', fill: '#c2603f' }, g);
  }

  function clock(n) {
    if (n > DAY) return '零点以前';
    var s = Math.round((1 - n / DAY) * 86400), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
    function p(v) { return (v < 10 ? '0' : '') + v; }
    return p(h) + ':' + p(m) + ':' + p(sec);
  }
  function setN(n) { N = n; nIn.value = vOf(n); L.paintRange(nIn); render(); }
  function render() {
    drawTL();
    var e = hit(N);
    L.$('#n-out').textContent = '距今' + fmtN(N);
    L.$('#era-badge').textContent = eraOf(N);
    L.$('#r-n').textContent = fmtN(N);
    L.$('#r-clock').textContent = clock(N);
    function wan(v) { return v >= 10000 ? L.fmt(v / 10000) + ' 万' : String(v); }
    L.$('#r-who').textContent = e ? e.label + (e.a !== e.b ? '（距今约 ' + wan(e.a) + '～' + wan(e.b) + ' 年）' : '') : '课本里这附近没有标出的遗址';
    var t = e ? e.note : '';
    if (N > DAY) t += '元谋人还没有出现。';
    else if (N >= 4000) t += '从这时到今天，大约是“秦统一到今天”的 <b>' + Math.round(N / QIN) + ' 倍</b>长。';
    else t += '已经进入有王朝的时代，后面就可以用公元纪年了。';
    if (mode === 'lin') t += '真实比例下，山顶洞人以后的事全挤在最右边，根本看不清。';
    L.$('#r-text').innerHTML = t;
    save();
  }
  L.bindRange(nIn, function (v) { N = nOf(v); render(); });
  nIn.value = vOf(N); L.paintRange(nIn);
  L.chips(L.$('#scale-chips'), [{ label: '每格十倍', value: 'log' }, { label: '真实比例', value: 'lin' }], mode, function (v) { mode = v; render(); });

  /* ========== 三处遗址：住、用、吃 ========== */
  var SITES = {
    bj: { n: '北京人', b: '北京周口店', age: '旧石器时代', area: '华北', env: '距今约 70 万～20 万年 · 还不会种庄稼', cap: ['天然山洞', '打制石器', '采集、狩猎'],
      t: '北京人住在天然山洞里，用打制石器砍砸、切割，靠采集果实和打猎获得食物。他们会使用天然火，用来烧烤食物、取暖和驱赶野兽，还能长时间保存火种。' },
    hmd: { n: '河姆渡', b: '浙江余姚', age: '新石器时代', area: '长江流域', env: '南方：气候温暖潮湿、多雨', cap: ['干栏式房屋', '骨耜（翻土）', '水稻'],
      t: '南方潮湿多雨，河姆渡人把房子架在木桩上，叫<b>干栏式房屋</b>，能防潮、通风，还能防野兽。他们用骨耜翻土，种植<b>水稻</b>，遗址里出土了大量稻谷遗存。' },
    bp: { n: '半坡', b: '陕西西安', age: '新石器时代', area: '黄河流域', env: '北方：气候比较干燥、寒冷', cap: ['半地穴式房屋', '磨制石器', '粟（小米）'],
      t: '北方比较干燥寒冷，半坡人把房子的一部分挖到地面以下，叫<b>半地穴式房屋</b>，冬天更保暖。他们用磨制石器耕作，种植<b>粟</b>，还会制作彩陶，比如人面鱼纹彩陶盆。' }
  };
  var site = SITES[st.s] ? st.s : 'hmd';
  var siteSvg = L.$('#site');
  function P(d, o) { o.d = d; return S('path', o, siteSvg); }
  function drawHouse(k, cx, cy) {
    if (k === 'bj') {
      P('M' + (cx - 52) + ' ' + (cy + 40) + 'Q' + (cx - 46) + ' ' + (cy - 38) + ' ' + cx + ' ' + (cy - 40) + 'Q' + (cx + 48) + ' ' + (cy - 36) + ' ' + (cx + 52) + ' ' + (cy + 40) + 'Z', { fill: '#cbb8a6' });
      P('M' + (cx - 24) + ' ' + (cy + 40) + 'Q' + (cx - 22) + ' ' + (cy - 10) + ' ' + cx + ' ' + (cy - 12) + 'Q' + (cx + 22) + ' ' + (cy - 10) + ' ' + (cx + 24) + ' ' + (cy + 40) + 'Z', { fill: '#5a4036' });
      P('M' + (cx - 9) + ' ' + (cy + 40) + 'Q' + (cx - 7) + ' ' + (cy + 26) + ' ' + cx + ' ' + (cy + 18) + 'Q' + (cx + 7) + ' ' + (cy + 28) + ' ' + (cx + 9) + ' ' + (cy + 40) + 'Z', { fill: '#e07a3c' });
      P('M' + (cx - 4) + ' ' + (cy + 40) + 'Q' + (cx - 3) + ' ' + (cy + 32) + ' ' + cx + ' ' + (cy + 28) + 'Q' + (cx + 3) + ' ' + (cy + 33) + ' ' + (cx + 4) + ' ' + (cy + 40) + 'Z', { fill: '#f3c35b' });
    } else if (k === 'hmd') {
      for (var i = 0; i < 3; i++) P('M' + (cx - 54) + ' ' + (cy + 36 + i * 6) + 'q9 -4 18 0t18 0t18 0t18 0t18 0t18 0', { fill: 'none', stroke: '#9cb9c9', 'stroke-width': 1.4 });
      [-38, -13, 13, 38].forEach(function (dx) { S('line', { x1: cx + dx, y1: cy + 4, x2: cx + dx, y2: cy + 46, stroke: '#8a6a4a', 'stroke-width': 3 }, siteSvg); });
      S('rect', { x: cx - 46, y: cy, width: 92, height: 7, rx: 2, fill: '#a07a58' }, siteSvg);
      S('rect', { x: cx - 36, y: cy - 22, width: 72, height: 22, fill: '#dcbf96' }, siteSvg);
      S('rect', { x: cx - 8, y: cy - 16, width: 14, height: 16, fill: '#8a6a4a' }, siteSvg);
      P('M' + (cx - 50) + ' ' + (cy - 20) + 'L' + cx + ' ' + (cy - 48) + 'L' + (cx + 50) + ' ' + (cy - 20) + 'Z', { fill: '#8a6a4a' });
      [-40, -20, 24, 44].forEach(function (dx, j) { S('line', { x1: cx + dx, y1: cy - 58 + j % 2 * 5, x2: cx + dx - 3, y2: cy - 51 + j % 2 * 5, stroke: '#7fa3b8', 'stroke-width': 1.4, 'stroke-linecap': 'round' }, siteSvg); });
    } else {
      S('rect', { x: cx - 32, y: cy + 16, width: 64, height: 24, fill: '#e8d9c6', stroke: '#c9b39a', 'stroke-dasharray': '3 2' }, siteSvg);
      S('line', { x1: cx - 58, y1: cy + 16, x2: cx + 58, y2: cy + 16, stroke: '#8a6a4a', 'stroke-width': 2 }, siteSvg);
      S('rect', { x: cx - 58, y: cy + 17, width: 26, height: 26, fill: '#d8c3a8' }, siteSvg);
      S('rect', { x: cx + 32, y: cy + 17, width: 26, height: 26, fill: '#d8c3a8' }, siteSvg);
      P('M' + (cx - 44) + ' ' + (cy + 16) + 'L' + cx + ' ' + (cy - 44) + 'L' + (cx + 44) + ' ' + (cy + 16) + 'Z', { fill: '#b08a62' });
      S('rect', { x: cx - 7, y: cy - 2, width: 14, height: 18, fill: '#6b4e38' }, siteSvg);
      S('text', { x: cx + 45, y: cy + 34, 'font-size': 9.5, fill: '#6b4e38', 'text-anchor': 'middle', text: '地下' }, siteSvg);
      P('M' + (cx - 54) + ' ' + (cy - 40) + 'q8 -5 16 0t16 0', { fill: 'none', stroke: '#a8b4bc', 'stroke-width': 1.4 });
      P('M' + (cx + 22) + ' ' + (cy - 52) + 'q8 -5 16 0t16 0', { fill: 'none', stroke: '#a8b4bc', 'stroke-width': 1.4 });
    }
  }
  function drawTool(k, cx, cy) {
    if (k === 'bj') {
      P('M' + (cx - 22) + ' ' + (cy + 20) + 'L' + (cx - 27) + ' ' + (cy - 4) + 'L' + (cx - 12) + ' ' + (cy - 26) + 'L' + (cx + 7) + ' ' + (cy - 30) + 'L' + (cx + 24) + ' ' + (cy - 12) + 'L' + (cx + 27) + ' ' + (cy + 10) + 'L' + (cx + 10) + ' ' + (cy + 26) + 'Z', { fill: '#aaa49c', stroke: '#6f6a64', 'stroke-width': 1.4, 'stroke-linejoin': 'round' });
      P('M' + (cx - 12) + ' ' + (cy - 26) + 'L' + (cx - 2) + ' ' + (cy - 2) + 'L' + (cx + 24) + ' ' + (cy - 12) + 'M' + (cx - 2) + ' ' + (cy - 2) + 'L' + (cx - 22) + ' ' + (cy + 20) + 'M' + (cx - 2) + ' ' + (cy - 2) + 'L' + (cx + 10) + ' ' + (cy + 26), { fill: 'none', stroke: '#86807a' });
    } else if (k === 'hmd') {
      S('line', { x1: cx + 26, y1: cy - 44, x2: cx - 2, y2: cy + 2, stroke: '#8a6a4a', 'stroke-width': 4, 'stroke-linecap': 'round' }, siteSvg);
      P('M' + (cx - 16) + ' ' + cy + 'L' + (cx + 10) + ' ' + cy + 'L' + (cx + 7) + ' ' + (cy + 38) + 'Q' + (cx - 3) + ' ' + (cy + 46) + ' ' + (cx - 12) + ' ' + (cy + 38) + 'Z', { fill: '#efe4cf', stroke: '#b9a07a', 'stroke-width': 1.4 });
      S('circle', { cx: cx - 6, cy: cy + 12, r: 2.6, fill: '#b9a07a' }, siteSvg);
      S('circle', { cx: cx + 1, cy: cy + 12, r: 2.6, fill: '#b9a07a' }, siteSvg);
    } else {
      P('M' + (cx - 12) + ' ' + (cy - 30) + 'L' + (cx + 12) + ' ' + (cy - 30) + 'Q' + (cx + 20) + ' ' + (cy + 8) + ' ' + (cx + 22) + ' ' + (cy + 28) + 'Q' + cx + ' ' + (cy + 38) + ' ' + (cx - 22) + ' ' + (cy + 28) + 'Q' + (cx - 20) + ' ' + (cy + 8) + ' ' + (cx - 12) + ' ' + (cy - 30) + 'Z', { fill: '#9ea7a3', stroke: '#66706c', 'stroke-width': 1.4 });
      P('M' + (cx - 6) + ' ' + (cy - 24) + 'Q' + (cx - 10) + ' ' + (cy + 6) + ' ' + (cx - 12) + ' ' + (cy + 24), { fill: 'none', stroke: '#d6dcd9', 'stroke-width': 3, 'stroke-linecap': 'round' });
    }
  }
  function drawFood(k, cx, cy) {
    if (k === 'bj') {
      S('line', { x1: cx - 30, y1: cy - 26, x2: cx + 4, y2: cy - 4, stroke: '#7a5a3a', 'stroke-width': 2 }, siteSvg);
      [[-18, -14], [-8, -8], [-22, -4], [-4, -18]].forEach(function (p) { S('circle', { cx: cx + p[0], cy: cy + p[1], r: 5, fill: '#b5473a' }, siteSvg); });
      S('rect', { x: cx - 12, y: cy + 18, width: 34, height: 7, rx: 3, fill: '#efe4cf', stroke: '#b9a07a', transform: 'rotate(-18 ' + (cx + 5) + ' ' + (cy + 21) + ')' }, siteSvg);
      [[-12, 24], [-10, 31], [22, 13], [24, 20]].forEach(function (p) { S('circle', { cx: cx + p[0], cy: cy + p[1], r: 4, fill: '#efe4cf', stroke: '#b9a07a' }, siteSvg); });
    } else if (k === 'hmd') {
      [-16, 0, 16].forEach(function (dx, i) {
        var bx = cx + dx, tx = bx + 22 - i * 4, ty = cy - 22 + i * 4;
        P('M' + bx + ' ' + (cy + 42) + 'Q' + (bx - 2) + ' ' + (cy - 14) + ' ' + tx + ' ' + ty, { fill: 'none', stroke: '#7d8f4a', 'stroke-width': 1.8 });
        for (var j = 0; j < 5; j++) S('ellipse', { cx: tx - 2 - j * 3.2, cy: ty + 6 + j * 5, rx: 2.6, ry: 4.2, fill: '#d9b24c', transform: 'rotate(-30 ' + (tx - 2 - j * 3.2) + ' ' + (ty + 6 + j * 5) + ')' }, siteSvg);
      });
    } else {
      [-14, 10].forEach(function (dx) {
        var bx = cx + dx;
        P('M' + bx + ' ' + (cy + 42) + 'Q' + (bx + 2) + ' ' + (cy - 6) + ' ' + (bx + 10) + ' ' + (cy - 22), { fill: 'none', stroke: '#7d8f4a', 'stroke-width': 2 });
        S('ellipse', { cx: bx + 15, cy: cy - 10, rx: 7, ry: 20, fill: '#e2b94e', stroke: '#c39a32', transform: 'rotate(-28 ' + (bx + 15) + ' ' + (cy - 10) + ')' }, siteSvg);
      });
    }
  }
  function drawSite() {
    siteSvg.innerHTML = '';
    var d = S('defs', {}, siteSvg), cp = S('clipPath', { id: 'site-clip' }, d);
    S('rect', { x: 0, y: 0, width: 400, height: 230, rx: 12 }, cp);
    var root = siteSvg;
    siteSvg = S('g', { 'clip-path': 'url(#site-clip)' }, root);
    S('rect', { x: 0, y: 0, width: 400, height: 230, fill: '#fbf6ef' }, siteSvg);
    var s = SITES[site];
    ['住', '用', '吃'].forEach(function (h, i) {
      var x = 8 + i * 130, cx = x + 61;
      S('rect', { x: x, y: 8, width: 122, height: 166, rx: 10, fill: '#fff', stroke: '#eadfd4' }, siteSvg);
      S('text', { x: x + 12, y: 27, 'font-size': 12.5, 'font-weight': 700, fill: '#a4492b', text: h }, siteSvg);
      [drawHouse, drawTool, drawFood][i](site, cx, 92);
      S('text', { x: cx, y: 160, 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: '#4a3a32', text: s.cap[i] }, siteSvg);
    });
    S('rect', { x: 8, y: 184, width: 384, height: 38, rx: 10, fill: '#f1e7dc' }, siteSvg);
    S('text', { x: 200, y: 207, 'text-anchor': 'middle', 'font-size': 12, fill: '#5a4036', text: s.n + ' · ' + s.area + ' · ' + s.env }, siteSvg);
    siteSvg = root;
    L.$('#site-name').textContent = s.n;
    L.$('#site-badge').textContent = s.b;
    L.$('#site-age').textContent = s.age;
    L.$('#site-area').textContent = s.area;
    L.$('#site-text').innerHTML = s.t;
    L.$$('#site-table tbody tr').forEach(function (tr) { tr.classList.toggle('on', tr.dataset.k === site); });
    save();
  }
  L.chips(L.$('#site-chips'), [{ label: '北京人', value: 'bj' }, { label: '河姆渡', value: 'hmd' }, { label: '半坡', value: 'bp' }], site, function (v) { site = v; drawSite(); });

  /* ========== 史料分类 ========== */
  var SRC = [
    ['北京周口店出土的北京人头盖骨化石', 'a', '当时留下的实物，是一手史料。'],
    ['河姆渡遗址出土的炭化稻谷', 'a', '考古发掘出的实物，证明河姆渡人种水稻。'],
    ['博物馆画的干栏式房屋复原图', 'b', '复原图是后人根据遗迹研究画出来的，属于二手史料。'],
    ['黄帝打败蚩尤的故事', 'c', '这是流传下来的传说，有历史的影子，但不能当作信史。'],
    ['半坡遗址出土的人面鱼纹彩陶盆', 'a', '半坡人亲手做的陶器，是一手史料。'],
    ['大禹治水、三过家门而不入的故事', 'c', '传说故事，反映了先民治理水患的经历，但细节无法证实。'],
    ['良渚古城遗址出土的玉琮', 'a', '高等级墓葬里的玉礼器，说明当时已经有了地位很高的统治者。']
  ];
  var SRC_OPT = [['a', '一手实物'], ['b', '二手研究'], ['c', '传说']];
  function initSrc() {
    L.$('#src-score').textContent = '已答 0 / ' + SRC.length;
    L.match('#src-list', '#src-score', SRC, SRC_OPT, function (it) { return it[2]; });
    // 一行放下：材料在左，按钮在右，说明另起一行
    L.$$('#src-list .choice-row').forEach(function (r) {
      r.style.flexDirection = 'row'; r.style.flexWrap = 'wrap'; r.style.alignItems = 'center'; r.style.padding = '9px 12px';
      r.children[0].style.flex = '1 1 170px'; r.children[1].style.flex = 'none'; r.children[2].style.flexBasis = '100%'; r.children[2].style.margin = '0';
    });
  }
  L.$('#src-reset').addEventListener('click', initSrc);
  function srcStat() {
    var rows = L.$$('#src-list .choice-row');
    return { done: rows.filter(function (r) { return r.dataset.done; }).length, right: rows.filter(function (r) { return r.classList.contains('correct'); }).length, n: rows.length };
  }

  function save() { L.setState({ n: N, sc: mode, s: site }); }

  render();
  drawSite();
  initSrc();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '把时间轴拖到北京人生活的年代',
      desc: '拖动滑块，或者直接点时间轴上的“北京人”。北京人生活在距今约 70 万～20 万年。',
      label: '在时间轴里操作',
      button: '检查年代',
      check: function () {
        if (N <= 700000 && N >= 200000) return { ok: true, msg: '现在是距今' + fmtN(N) + '，正是北京人生活的年代，属于旧石器时代。压缩成一天的话，大约在 ' + clock(N) + '。' };
        if (N > 700000) return { ok: false, msg: '现在是距今' + fmtN(N) + '，比北京人还早。往右（往今天的方向）拖一点。' };
        return { ok: false, msg: '现在是距今' + fmtN(N) + '，比北京人晚了。距今数字越大越早，要往左拖。' };
      }
    },
    {
      level: 'base',
      title: '我国境内已知最早的古人类是',
      desc: '可以回到时间轴上看看最左边是谁。',
      options: ['元谋人', '北京人', '山顶洞人', '河姆渡人'],
      answer: 0,
      hint: '距今数字最大的那一个最早。',
      explain: '<b>元谋人</b>距今约 170 万年，是我国境内已知最早的古人类。北京人距今约 70 万～20 万年，山顶洞人距今约 3 万年，河姆渡人距今约 7000 年，都晚得多。'
    },
    {
      level: 'base',
      title: '种植水稻、住干栏式房屋的是',
      desc: '想一想南方和北方的环境。',
      options: ['河姆渡居民', '半坡居民', '北京人', '山顶洞人'],
      answer: 0,
      hint: '水稻喜欢温暖多水的地方，房子要架高防潮。',
      explain: '<b>河姆渡居民</b>在长江流域，种水稻、住干栏式房屋。半坡居民在黄河流域，种粟、住半地穴式房屋；北京人和山顶洞人还不会种庄稼。'
    },
    {
      level: 'mid',
      title: '找出适合北方干冷气候的房子',
      desc: '在“住哪里、用什么、吃什么”里切换遗址，找到那种一部分挖在地面以下、冬天更保暖的房子。',
      label: '在遗址对比图里操作',
      button: '检查我选的遗址',
      check: function () {
        if (site === 'bp') return { ok: true, msg: '半坡的<b>半地穴式房屋</b>一部分在地下，保暖；对应的作物是粟。南方的河姆渡则把房子架高，防潮。' };
        if (site === 'hmd') return { ok: false, msg: '干栏式房屋是架高防潮的，适合南方潮湿多雨，不是这个。' };
        return { ok: false, msg: '北京人住的是天然山洞，还不会自己盖房子。再换一个遗址看看。' };
      }
    },
    {
      level: 'mid',
      title: '给七条材料分类，至少分对 6 条',
      desc: '在“这是证据还是故事”里，给每条材料选一个类别。分错了可以按“重新分类”。',
      label: '在史料分类里操作',
      button: '检查分类',
      check: function () {
        var s = srcStat();
        if (s.done < s.n) return { ok: false, msg: '还有 ' + (s.n - s.done) + ' 条没分类。' };
        if (s.right >= s.n - 1) return { ok: true, msg: '分对了 ' + s.right + ' / ' + s.n + '。记住：遗址里挖出来的东西是一手史料，复原图是后人加工的二手史料，黄帝、大禹的故事是传说。' };
        return { ok: false, msg: '只分对了 ' + s.right + ' 条。想一想：这东西是当时留下的，还是后人做的，还是口口相传的故事？按“重新分类”再试一次。' };
      }
    },
    {
      level: 'mid',
      title: '良渚古城遗址的重要意义在于',
      desc: '它有城墙、宫殿基址、大型水利工程和玉琮等礼器。',
      options: ['实证了中华五千多年文明史', '证明人类最早起源于中国', '是我国境内最早的古人类遗址', '它就是夏朝的都城'],
      answer: 0,
      hint: '看年代：距今约 5300～4300 年。',
      explain: '良渚古城遗址距今约 5300～4300 年，城墙、宫殿、水利工程和礼器说明已经出现王权，<b>实证了中华五千多年文明史</b>。最早的古人类是元谋人；夏朝约公元前 2070 年建立，比良渚晚；“人类起源于中国”也不是教材的结论。'
    },
    {
      level: 'trap',
      title: '对“黄帝战蚩尤”“大禹治水”的正确认识是',
      desc: '这是本课最容易混的地方：传说和史实。',
      options: ['它们是传说，有历史的影子，但不能直接当作信史', '它们是一手史料，完全可信', '它们全是编造的，没有任何价值', '考古已经证明故事的每个细节都是真的'],
      answer: 0,
      hint: '传说能提供线索，但要靠考古来印证。',
      explain: '传说是口口相传、后来才写下来的，<b>反映了历史的影子，但不等于信史</b>。说它“完全可信”或“细节都被证明”都太绝对；说它“毫无价值”也不对，它能帮我们了解先民的生活和观念。'
    },
    {
      level: 'trap',
      title: '关于北京人用火，下列说法正确的是',
      desc: '小心别把“使用火”和“自己生火”混为一谈。',
      options: ['会使用天然火，并能长时间保存火种', '会钻木取火', '还完全不会用火', '会用火烧制彩陶'],
      answer: 0,
      hint: '北京人遗址的灰烬层说明他们能长时间保存火种。',
      explain: '北京人<b>会使用天然火</b>，并能长时间保存火种，但教材没有说他们会自己取火，“钻木取火”是错的。彩陶是新石器时代半坡等地居民制作的，和北京人无关。'
    }
  ]);
})();
