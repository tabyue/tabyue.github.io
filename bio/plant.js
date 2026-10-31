/* 第 6 课 · 光合作用与呼吸作用 */
(function () {
  'use strict';
  var B = window.Bio, S = B.svg;
  var st = B.getState();
  var LAT = 22.5;
  var SEASONS = { summer: { name: '夏至', decl: 23.44 }, equinox: { name: '春分/秋分', decl: 0 }, winter: { name: '冬至', decl: -23.44 } };
  var state = {
    t: isFinite(+st.t) && st.t !== undefined ? B.clamp(+st.t, 0, 24) : 14,
    season: SEASONS[st.s] ? st.s : 'summer',
    weather: st.w === 'cloudy' ? 'cloudy' : 'sunny',
    night: [15, 20, 25].indexOf(+st.n) >= 0 ? +st.n : 20
  };

  /* —— 模型 —— */
  function sunTimes(season) {
    var d = SEASONS[season].decl * Math.PI / 180, p = LAT * Math.PI / 180;
    var h = Math.acos(-Math.tan(p) * Math.tan(d)) * 180 / Math.PI / 15;
    return { rise: 12 - h, set: 12 + h, peak: Math.sin((90 - Math.abs(LAT - SEASONS[season].decl)) * Math.PI / 180) };
  }
  function model(cond) {
    var sun = sunTimes(cond.season), wf = cond.weather === 'sunny' ? 1 : 0.35;
    var Rn = { 15: 1.0, 20: 1.5, 25: 2.2 }[cond.night], Rd = 2.4;
    function light(t) { if (t <= sun.rise || t >= sun.set) return 0; return Math.sin(Math.PI * (t - sun.rise) / (sun.set - sun.rise)); }
    function at(t) {
      var L = light(t), I = L * sun.peak * wf;
      var P = 12 * I / (I + 0.6);
      var R = Rn + (Rd - Rn) * Math.sqrt(L);
      return { L: L, I: I, P: P, R: R, net: P - R };
    }
    var dt = 0.05, series = [], C = 0, A = 0, cmin = Infinity, cmax = -Infinity;
    for (var i = 0; i <= 480; i++) {
      var t = i * dt, v = at(t);
      series.push({ t: t, P: v.P, R: v.R, C: C, A: A });
      cmin = Math.min(cmin, C); cmax = Math.max(cmax, C);
      C -= v.net * dt; A += v.net * dt;
    }
    var up = null, down = null;
    for (var j = 1; j < series.length; j++) {
      var a = series[j - 1].P - series[j - 1].R, b = series[j].P - series[j].R;
      if (a < 0 && b >= 0 && up === null) up = series[j - 1].t + dt * (-a / (b - a));
      if (a >= 0 && b < 0) down = series[j - 1].t + dt * (a / (a - b));
    }
    return { sun: sun, at: at, series: series, cmin: cmin, cmax: cmax, total: A, up: up, down: down };
  }
  var BEST = model({ season: 'summer', weather: 'sunny', night: 15 }).total;
  var M = model(state);

  function hm(t) { var h = Math.floor(t + 1e-6), m = Math.round((t - h) * 60); if (m === 60) { h++; m = 0; } return h + ':' + (m < 10 ? '0' : '') + m; }
  function word(v) { return v < 0.05 ? '停止' : v < 1.5 ? '很弱' : v < 3.5 ? '较弱' : v < 5.5 ? '较强' : '很强'; }

  /* —— 场景 —— */
  var scene = B.$('#scene');
  var defs = S('defs', {}, scene);
  [['arr-c', '#b97342'], ['arr-o', '#4e8a9b']].forEach(function (m) {
    var mk = S('marker', { id: m[0], viewBox: '0 0 10 10', refX: 7, refY: 5, markerWidth: 3.2, markerHeight: 3.2, orient: 'auto-start-reverse' }, defs);
    S('path', { d: 'M0 0L10 5L0 10z', fill: m[1] }, mk);
  });
  var sky = S('rect', { x: 0, y: 0, width: 400, height: 160, rx: 14, fill: '#dbe9ef' }, scene);
  var stars = S('g', { fill: '#fff' }, scene);
  [[40, 30], [90, 18], [150, 40], [300, 22], [350, 48], [250, 14], [60, 70], [330, 90]].forEach(function (p) { S('circle', { cx: p[0], cy: p[1], r: 1.2 }, stars); });
  var cloud = S('g', { fill: '#eef1f2', opacity: 0 }, scene);
  [[70, 40, 22], [92, 34, 26], [118, 42, 20], [270, 50, 22], [296, 42, 28], [322, 52, 18]].forEach(function (c) { S('circle', { cx: c[0], cy: c[1], r: c[2] }, cloud); });
  var sunG = S('g', {}, scene);
  S('circle', { cx: 0, cy: 0, r: 20, fill: '#f4c56b', opacity: 0.25 }, sunG);
  S('circle', { cx: 0, cy: 0, r: 11, fill: '#f4c56b' }, sunG);
  var moon = S('path', { d: 'M352 30a14 14 0 1 0 12 22a11 11 0 1 1 -12 -22z', fill: '#f2ead0' }, scene);
  S('rect', { x: 0, y: 150, width: 400, height: 64, fill: '#ebe4d2' }, scene);
  S('path', { d: 'M0 150H400', stroke: '#d6ccb3' }, scene);
  // 温室
  S('rect', { x: 118, y: 48, width: 164, height: 126, rx: 6, fill: '#ffffff', 'fill-opacity': 0.22, stroke: '#a9c0c7', 'stroke-width': 1.5 }, scene);
  S('path', { d: 'M118 48L200 22L282 48', fill: '#ffffff', 'fill-opacity': 0.22, stroke: '#a9c0c7', 'stroke-width': 1.5 }, scene);
  S('text', { x: 124, y: 168, 'font-size': 9, fill: '#7d969d', text: '密闭温室' }, scene);
  // 植物
  S('path', { d: 'M184 150h32l-4 22h-24z', fill: '#c99a6e', stroke: '#9c7550' }, scene);
  S('path', { d: 'M200 150V88', stroke: '#5f8a52', 'stroke-width': 3, 'stroke-linecap': 'round' }, scene);
  var leafG = S('g', {}, scene);
  [['M200 128c-18 2-30-6-34-18 16-2 30 4 34 18z'], ['M200 116c18 0 28-10 30-22-16 0-28 8-30 22z'], ['M200 100c-14-2-22-12-22-24 14 2 22 10 22 24z'], ['M200 92c10-6 22-6 28-2-8 8-18 8-28 2z']].forEach(function (d) {
    S('path', { d: d[0], fill: '#8fbd7c', stroke: '#5f8a52', 'stroke-width': 1.2 }, leafG);
  });
  var arrC = S('path', { stroke: '#b97342', fill: 'none', 'marker-end': 'url(#arr-c)', 'stroke-linecap': 'round' }, scene);
  var arrO = S('path', { stroke: '#4e8a9b', fill: 'none', 'marker-end': 'url(#arr-o)', 'stroke-linecap': 'round' }, scene);
  var labC = S('text', { 'font-size': 11, 'font-weight': 650, fill: '#9c6334', 'text-anchor': 'middle', text: 'CO₂' }, scene);
  var labO = S('text', { 'font-size': 11, 'font-weight': 650, fill: '#3f7484', 'text-anchor': 'middle', text: 'O₂' }, scene);
  // 底部两条强度条
  S('text', { x: 16, y: 190, 'font-size': 10, fill: '#5f7259', text: '光合作用' }, scene);
  S('text', { x: 16, y: 205, 'font-size': 10, fill: '#8d683f', text: '呼吸作用' }, scene);
  S('rect', { x: 66, y: 183, width: 120, height: 7, rx: 3.5, fill: '#ddd5c0' }, scene);
  S('rect', { x: 66, y: 198, width: 120, height: 7, rx: 3.5, fill: '#ddd5c0' }, scene);
  var barP = S('rect', { x: 66, y: 183, width: 0, height: 7, rx: 3.5, fill: '#6f9e5f' }, scene);
  var barR = S('rect', { x: 66, y: 198, width: 0, height: 7, rx: 3.5, fill: '#c98552' }, scene);
  var clock = S('text', { x: 384, y: 202, 'text-anchor': 'end', 'font-size': 16, 'font-weight': 650, fill: '#5f6f58' }, scene);

  /* —— 曲线图 —— */
  var chart = B.$('#chart');
  var X0 = 34, X1 = 370, Y0 = 18, Y1 = 178;
  function cx(t) { return X0 + t / 24 * (X1 - X0); }
  function cy(v) { return Y1 - v / 8 * (Y1 - Y0); }
  var nightL = S('rect', { y: Y0, height: Y1 - Y0, fill: '#e8ecef' }, chart);
  var nightR = S('rect', { y: Y0, height: Y1 - Y0, fill: '#e8ecef' }, chart);
  S('path', { d: 'M' + X0 + ' ' + Y1 + 'H' + X1, stroke: '#c9d3c3' }, chart);
  S('path', { d: 'M' + X0 + ' ' + Y0 + 'V' + Y1, stroke: '#c9d3c3' }, chart);
  for (var h = 0; h <= 24; h += 6) S('text', { x: cx(h), y: Y1 + 15, 'font-size': 10, fill: '#8b9784', 'text-anchor': 'middle', text: h + '时' }, chart);
  S('text', { x: X0 - 4, y: Y0 + 6, 'font-size': 9, fill: '#8b9784', 'text-anchor': 'end', text: '强' }, chart);
  S('text', { x: X0 - 4, y: Y1, 'font-size': 9, fill: '#8b9784', 'text-anchor': 'end', text: '0' }, chart);
  var lineP = S('path', { fill: 'none', stroke: '#5f8f52', 'stroke-width': 2.4 }, chart);
  var lineR = S('path', { fill: 'none', stroke: '#c98552', 'stroke-width': 2.4 }, chart);
  var lineC = S('path', { fill: 'none', stroke: '#5f97a8', 'stroke-width': 2, 'stroke-dasharray': '5 4' }, chart);
  var mkUp = S('g', {}, chart), mkDown = S('g', {}, chart);
  [mkUp, mkDown].forEach(function (g) {
    S('circle', { r: 4, fill: '#fff', stroke: '#396b57', 'stroke-width': 1.6 }, g);
    S('text', { y: -10, 'font-size': 9, 'text-anchor': 'middle', fill: '#396b57', stroke: '#fff', 'stroke-width': 3, 'paint-order': 'stroke' }, g);
  });
  var cMax = S('text', { 'font-size': 9, fill: '#3f7484', 'text-anchor': 'middle', stroke: '#fff', 'stroke-width': 3, 'paint-order': 'stroke' }, chart);
  var cMin = S('text', { 'font-size': 9, fill: '#3f7484', 'text-anchor': 'middle', stroke: '#fff', 'stroke-width': 3, 'paint-order': 'stroke' }, chart);
  var cursor = S('path', { stroke: '#203b35', 'stroke-width': 1, 'stroke-dasharray': '2 3' }, chart);
  var cursorDot = S('circle', { r: 4, fill: '#5f8f52', stroke: '#fff', 'stroke-width': 1.5 }, chart);
  var legend = S('g', { 'font-size': 9.5 }, chart);
  [['#5f8f52', '光合作用', 0], ['#c98552', '呼吸作用', 64], ['#5f97a8', '温室 CO₂', 128]].forEach(function (l) {
    S('rect', { x: X0 + 8 + l[2], y: 4, width: 12, height: 3, fill: l[0] }, legend);
    S('text', { x: X0 + 24 + l[2], y: 9, fill: '#5f6f58', text: l[1] }, legend);
  });
  function cY(C) { var r = (C - M.cmin) / Math.max(1e-6, M.cmax - M.cmin); return Y1 - 24 - r * (Y1 - Y0 - 40); }
  function CatT(t) { var i = Math.round(t / 0.05); return M.series[B.clamp(i, 0, 480)].C; }

  function drawChart() {
    var dP = '', dR = '', dC = '';
    M.series.forEach(function (s, i) {
      var c = i ? 'L' : 'M';
      dP += c + cx(s.t).toFixed(1) + ' ' + cy(s.P).toFixed(1);
      dR += c + cx(s.t).toFixed(1) + ' ' + cy(s.R).toFixed(1);
      dC += c + cx(s.t).toFixed(1) + ' ' + cY(s.C).toFixed(1);
    });
    lineP.setAttribute('d', dP); lineR.setAttribute('d', dR); lineC.setAttribute('d', dC);
    nightL.setAttribute('x', X0); nightL.setAttribute('width', cx(M.sun.rise) - X0);
    nightR.setAttribute('x', cx(M.sun.set)); nightR.setAttribute('width', X1 - cx(M.sun.set));
    [[mkUp, M.up], [mkDown, M.down]].forEach(function (m) {
      if (m[1] === null) { m[0].style.display = 'none'; return; }
      m[0].style.display = '';
      var v = M.at(m[1]);
      m[0].setAttribute('transform', 'translate(' + cx(m[1]).toFixed(1) + ',' + cy(v.R).toFixed(1) + ')');
      m[0].querySelector('text').textContent = '光合=呼吸';
    });
    if (M.up !== null) { cMax.setAttribute('x', cx(M.up)); cMax.setAttribute('y', cY(CatT(M.up)) - 7); cMax.textContent = 'CO₂ 最多'; }
    if (M.down !== null) { cMin.setAttribute('x', cx(M.down)); cMin.setAttribute('y', cY(CatT(M.down)) + 14); cMin.textContent = 'CO₂ 最少'; }
    cMax.style.display = M.up === null ? 'none' : ''; cMin.style.display = M.down === null ? 'none' : '';
  }

  function mix(a, b, f) {
    var pa = [1, 3, 5].map(function (i) { return parseInt(a.substr(i, 2), 16); }), pb = [1, 3, 5].map(function (i) { return parseInt(b.substr(i, 2), 16); });
    return '#' + pa.map(function (v, i) { return Math.round(v + (pb[i] - v) * f).toString(16).padStart(2, '0'); }).join('');
  }

  function render() {
    var t = state.t, v = M.at(t), sun = M.sun;
    // 天空
    var day = v.L > 0 ? Math.min(1, v.L * 3) : 0;
    var skyDay = state.weather === 'sunny' ? '#dbe9ef' : '#d7dcdd';
    sky.setAttribute('fill', mix('#25344a', skyDay, day));
    stars.setAttribute('opacity', (1 - day).toFixed(2));
    cloud.setAttribute('opacity', state.weather === 'cloudy' ? (0.35 + 0.65 * day).toFixed(2) : 0);
    moon.setAttribute('opacity', (1 - day).toFixed(2));
    if (v.L > 0) {
      var f = (t - sun.rise) / (sun.set - sun.rise);
      sunG.setAttribute('transform', 'translate(' + (30 + 340 * f).toFixed(1) + ',' + (146 - 116 * Math.sin(Math.PI * f) * sun.peak).toFixed(1) + ')');
      sunG.style.display = '';
      sunG.setAttribute('opacity', state.weather === 'sunny' ? 1 : 0.55);
    } else sunG.style.display = 'none';
    leafG.setAttribute('opacity', 1);
    // 箭头：净交换
    var net = v.net, w = 1.6 + Math.min(Math.abs(net), 6) * 1.1;
    var inward = net > 0.05;   // 光合大于呼吸：吸收 CO₂，放出 O₂
    var balanced = Math.abs(net) <= 0.05;
    arrC.setAttribute('stroke-width', balanced ? 1.2 : w);
    arrO.setAttribute('stroke-width', balanced ? 1.2 : w);
    arrC.setAttribute('d', inward ? 'M136 104H170' : 'M170 104H136');
    arrO.setAttribute('d', inward ? 'M232 104H266' : 'M266 104H232');
    arrC.setAttribute('opacity', balanced ? 0.35 : 1); arrO.setAttribute('opacity', balanced ? 0.35 : 1);
    labC.setAttribute('x', 153); labC.setAttribute('y', 92);
    labO.setAttribute('x', 249); labO.setAttribute('y', 92);
    if (!inward && !balanced) { arrC.setAttribute('d', 'M170 104H136'); arrO.setAttribute('d', 'M266 104H232'); }
    barP.setAttribute('width', (v.P / 8 * 120).toFixed(1));
    barR.setAttribute('width', (v.R / 8 * 120).toFixed(1));
    clock.textContent = hm(t);

    // 读数
    B.$('#time-out').textContent = hm(t);
    B.$('#sun-badge').textContent = v.L > 0 ? (state.weather === 'sunny' ? '白天 · 晴' : '白天 · 阴') : '夜里';
    B.$('#r-p').textContent = word(v.P);
    B.$('#r-r').textContent = word(v.R);
    var netEl = B.$('#r-net');
    if (balanced && v.P > 0) netEl.textContent = '光合 = 呼吸，看起来不进不出';
    else if (inward) netEl.textContent = '吸收 CO₂，放出 O₂';
    else netEl.textContent = '吸收 O₂，放出 CO₂';
    var txt;
    if (v.P < 0.05) txt = '没有光，光合作用停了，只剩呼吸作用：植物消耗有机物，温室里的 CO₂ 越来越多。';
    else if (net < -0.05) txt = '有光了，但光还太弱：光合作用比呼吸作用弱，温室里的 CO₂ 还在增加。';
    else if (balanced) txt = '这一刻光合作用正好等于呼吸作用，温室里的 CO₂ 不增也不减。';
    else txt = '光合作用比呼吸作用强：植物在攒有机物，温室里的 CO₂ 在减少。';
    B.$('#r-text').textContent = txt;
    cursor.setAttribute('d', 'M' + cx(t) + ' ' + Y0 + 'V' + Y1);
    cursorDot.setAttribute('cx', cx(t)); cursorDot.setAttribute('cy', cY(CatT(t)));
    cursorDot.setAttribute('fill', '#5f97a8');
    B.$('#r-sun').textContent = hm(sun.rise) + ' / ' + hm(sun.set);
    var frac = M.total / BEST;
    B.$('#r-total').textContent = M.total > 0 ? '约最好那天的 ' + Math.round(frac * 100) + '%' : '入不敷出';
    var bar = B.$('#total-bar');
    bar.style.width = Math.max(0, Math.min(1, frac)) * 100 + '%';
    bar.style.background = frac > 0 ? '#8fae8a' : '#d9a07a';
    B.setState({ t: state.t, s: state.season, w: state.weather, n: state.night });
  }

  var timeIn = B.$('#time');
  timeIn.value = state.t;
  B.bindRange(timeIn, function (v) { state.t = v; render(); });
  function recompute() { M = model(state); drawChart(); render(); }
  var seasonChips = B.chips(B.$('#season-chips'), [{ label: '夏至', value: 'summer' }, { label: '春分/秋分', value: 'equinox' }, { label: '冬至', value: 'winter' }], state.season, function (v) { state.season = v; recompute(); });
  var weatherChips = B.chips(B.$('#weather-chips'), [{ label: '晴天', value: 'sunny' }, { label: '阴天', value: 'cloudy' }], state.weather, function (v) { state.weather = v; recompute(); });
  var nightChips = B.chips(B.$('#night-chips'), [15, 20, 25].map(function (n) { return { label: n + ' ℃', value: String(n) }; }), String(state.night), function (v) { state.night = +v; recompute(); });

  /* —— 淀粉实验 —— */
  var STEPS = [
    ['暗处理', '把天竺葵放到<b>黑暗处一昼夜</b>。目的是让叶片里原来的淀粉运走、耗尽，免得干扰实验结果。'],
    ['部分遮光', '用<b>黑纸片把叶片的一部分从上下两面遮住</b>。遮住的部分没有光，没遮的部分有光，两部分形成<b>对照</b>，唯一不同的是有没有光。'],
    ['光照', '移到阳光下照射几个小时，让没被遮住的部分进行光合作用。'],
    ['酒精脱色', '摘下叶片，去掉黑纸，放进装有酒精的小烧杯，<b>隔水加热</b>。叶绿素溶解在酒精里，叶片变成黄白色，酒精变绿。隔水加热是因为酒精容易着火，不能直接加热。'],
    ['滴加碘液', '用清水漂洗叶片，再滴上碘液。淀粉遇碘变蓝。'],
    ['看结果', '见光的部分<b>变蓝</b>，说明产生了淀粉；遮光的部分<b>不变蓝</b>。结论：<b>光是光合作用的条件，淀粉是光合作用的产物。</b>']
  ];
  var expStep = 0;
  var expChips = B.chips(B.$('#exp-chips'), STEPS.map(function (s, i) { return { label: (i + 1) + ' ' + s[0], value: String(i) }; }), '0', function (v) { expStep = +v; drawExp(); });
  var skip = B.$('#skip-dark');
  skip.addEventListener('change', drawExp);
  var LEAF = 'M0 -62C34 -62 58 -36 58 -4S36 56 0 62C-36 56 -58 28 -58 -4S-34 -62 0 -62z';
  function drawExp() {
    var svg = B.$('#exp'); svg.innerHTML = '';
    var k = expStep, skipped = skip.checked;
    var info = STEPS[k][1];
    var g = S('g', { transform: 'translate(150,105)' }, svg);
    var maskId = 'mask-cover';
    var leafFill = '#86b874', coverFill = '#86b874';
    if (k >= 3) { leafFill = '#efe4b6'; coverFill = '#efe4b6'; }
    if (k >= 4) { leafFill = '#5d5f9e'; coverFill = skipped ? '#7b77a8' : '#d9b56a'; }
    /* 暗处理：整张画布铺成暗色背景。rect 直接加在 svg 上，坐标用画布坐标，并插到最底层 */
    if (k === 0) svg.insertBefore(S('rect', { x: 0, y: 0, width: 400, height: 210, fill: '#2c3540', rx: 12 }), svg.firstChild);
    if (k === 2) {
      var sun = S('g', { transform: 'translate(200,-70)' }, g);
      S('circle', { r: 14, fill: '#f4c56b' }, sun);
      for (var a = 0; a < 8; a++) S('path', { d: 'M0 -20V-27', stroke: '#e3b04f', 'stroke-width': 2, transform: 'rotate(' + a * 45 + ')' }, sun);
      for (var r = 0; r < 4; r++) S('path', { d: 'M' + (180 - r * 14) + ' ' + (-50 + r * 12) + 'L' + (72 - r * 10) + ' ' + (-26 + r * 14), stroke: '#f4c56b', 'stroke-width': 1.5, 'stroke-dasharray': '4 4' }, g);
    }
    if (k === 3) {
      // 大烧杯（水）+ 小烧杯（酒精）
      var bk = S('g', { transform: 'translate(250,46)' }, svg);
      S('path', { d: 'M0 0v86h96V0', fill: '#e3eff3', stroke: '#8fb3c0', 'stroke-width': 1.5 }, bk);
      S('rect', { x: 1, y: 30, width: 94, height: 55, fill: '#cfe3ea' }, bk);
      S('path', { d: 'M24 18v58h48V18', fill: '#fff', stroke: '#8fb3c0', 'stroke-width': 1.5 }, bk);
      S('rect', { x: 25, y: 36, width: 46, height: 39, fill: '#9cc58a' }, bk);
      S('text', { x: 48, y: 112, 'font-size': 10, 'text-anchor': 'middle', fill: '#5f7259', text: '小烧杯里是酒精' }, bk);
      S('text', { x: 48, y: 126, 'font-size': 10, 'text-anchor': 'middle', fill: '#5f7259', text: '大烧杯里是水' }, bk);
      for (var f = 0; f < 3; f++) S('path', { d: 'M' + (28 + f * 20) + ' 96q4 -6 0 -10', stroke: '#e0905a', fill: 'none', 'stroke-width': 1.6 }, bk);
    }
    S('path', { d: LEAF, fill: leafFill, stroke: k >= 3 ? '#b8a46a' : '#5f8a52', 'stroke-width': 1.6 }, g);
    S('path', { d: 'M0 62V-62M0 -20L30 -44M0 0L36 -14M0 22L32 14M0 -20L-30 -44M0 0L-36 -14M0 22L-32 14', stroke: k >= 3 ? '#c9b77e' : '#5f8a52', 'stroke-width': 1, fill: 'none', opacity: 0.7 }, g);
    S('path', { d: 'M0 62v20', stroke: k >= 3 ? '#b8a46a' : '#5f8a52', 'stroke-width': 2 }, g);
    // 遮光区域
    var cover = { x: -44, y: -12, w: 88, h: 32 };
    if (k >= 1 && k <= 2) {
      S('rect', { x: cover.x - 4, y: cover.y - 4, width: cover.w + 8, height: cover.h + 8, rx: 3, fill: '#2b2f2c' }, g);
      S('text', { x: 0, y: cover.y + cover.h / 2 + 4, 'font-size': 10, 'text-anchor': 'middle', fill: '#cfd6cb', text: '黑纸片' }, g);
    } else if (k >= 3) {
      S('rect', { x: cover.x, y: cover.y, width: cover.w, height: cover.h, rx: 3, fill: coverFill, opacity: 0.95 }, g);
      S('rect', { x: cover.x, y: cover.y, width: cover.w, height: cover.h, rx: 3, fill: 'none', stroke: '#b8a46a', 'stroke-dasharray': '3 3' }, g);
    }
    if (k >= 4) {
      S('path', { d: 'M78 -88v18', stroke: '#8d5d33', 'stroke-width': 3 }, g);
      S('path', { d: 'M72 -96h12l-2 8h-8z', fill: '#c49a6c' }, g);
      S('circle', { cx: 78, cy: -64, r: 3, fill: '#8d5d33' }, g);
      S('text', { x: 92, y: -78, 'font-size': 10, fill: '#8d5d33', text: '碘液' }, g);
    }
    if (k >= 4) {
      var lg = S('g', { transform: 'translate(250,40)', 'font-size': 11 }, svg);
      S('rect', { x: 0, y: 0, width: 12, height: 12, rx: 3, fill: '#5d5f9e' }, lg);
      S('text', { x: 18, y: 10, fill: '#455d48', text: '变蓝：有淀粉' }, lg);
      S('rect', { x: 0, y: 22, width: 12, height: 12, rx: 3, fill: '#d9b56a' }, lg);
      S('text', { x: 18, y: 32, fill: '#455d48', text: '不变蓝（碘液的棕黄色）' }, lg);
    }
    var cap = k === 0 ? '放在黑暗处一昼夜' : k === 1 ? '上下两面都遮住' : k === 2 ? '光照几小时' : k === 3 ? '叶片褪成黄白色' : k === 4 ? '滴碘液' : '见光部分变蓝，遮光部分不变蓝';
    S('text', { x: 150, y: 202, 'font-size': 11, 'text-anchor': 'middle', fill: k === 0 ? '#cfd6cb' : '#5f7259', text: cap }, svg);
    if (skipped && k >= 4) info += ' <b style="color:#9c6334">但你跳过了暗处理：</b>叶片里原来就有淀粉，遮光的部分也变蓝了，就分不清淀粉是不是在光下新产生的，实验失败。';
    B.$('#exp-info').innerHTML = '<h3>第 ' + (k + 1) + ' 步 · ' + STEPS[k][0] + '</h3><p>' + info + '</p>';
  }

  drawChart();
  render();
  drawExp();

  function sync() { seasonChips.set(state.season); weatherChips.set(state.weather); nightChips.set(String(state.night)); timeIn.value = state.t; B.paintRange(timeIn); }

  /* —— 小练习 —— */
  B.quiz([
      {
      level: 'base',
      title: '温室里什么时候 CO₂ 最多？',
      desc: '拖动时间滑块，停在一天中温室里<b>二氧化碳最多</b>的时刻（看曲线也行，但先自己想一想原因）。',
      check: function () {
        if (M.up === null) return { ok: false, msg: '这种条件下光合作用一直赶不上呼吸作用，换成晴天再试。' };
        if (Math.abs(state.t - M.up) <= 0.5) return { ok: true, msg: '大约 ' + hm(M.up) + '。整夜只有呼吸，CO₂ 一直在增加；天亮后到光合 = 呼吸这一刻才停止增加，所以这时最多。' };
        return { ok: false, msg: '不是这个时间。提示：CO₂ 停止增加的那一刻，就是它最多的时候。' };
      }
    },
      {
      level: 'base',
      title: '植物什么时候攒的有机物最多？',
      desc: '再拖一次时间，停在这一天里植物体内<b>有机物积累得最多</b>的时刻。',
      check: function () {
        if (M.down === null) return { ok: false, msg: '这种条件下光合作用一直赶不上呼吸作用，换成晴天再试。' };
        if (Math.abs(state.t - M.down) <= 0.5) return { ok: true, msg: '大约 ' + hm(M.down) + '。从早上光合 = 呼吸开始一直在攒，到傍晚光合作用弱到等于呼吸时，攒得最多；再往后就开始消耗了。这时温室里 CO₂ 也最少。' };
        return { ok: false, msg: '提示：只要光合作用比呼吸作用强，有机物就还在增加。它什么时候停止增加？' };
      }
    },
      {
      level: 'base',
      title: '帮菜农选条件',
      desc: '在右边换一换“日子、天气、夜里温度”，找到让这一天<b>攒下的有机物最多</b>的组合。',
      check: function () {
        if (state.season === 'summer' && state.weather === 'sunny' && state.night === 15) return { ok: true, msg: '白天长、光照强，光合作用做得多；夜里温度低，呼吸作用消耗得少。大棚种菜常在夜里通风降温，就是这个道理。' };
        var miss = [];
        if (state.season !== 'summer') miss.push('哪天白天最长？');
        if (state.weather !== 'sunny') miss.push('阴天光照够吗？');
        if (state.night !== 15) miss.push('夜里温度高，呼吸作用会怎样？');
        return { ok: false, msg: '还能更多。' + miss.join('') };
      }
    },
      {
        level: 'base',
        title: '光合作用的场所是？',
        desc: '绿色植物特有的结构。',
        options: ['叶绿体', '线粒体', '细胞核', '液泡'],
        answer: 0,
        hint: '哪里含有叶绿素？',
        explain: '光合作用在<b>叶绿体</b>中进行；呼吸作用主要在<b>线粒体</b>中进行。两个场所别搞混。'
      },
      {
        level: 'base',
        title: '光合作用的原料是？',
        desc: '从空气和土壤中获取。',
        options: ['二氧化碳和水', '氧气和水', '有机物和氧气', '无机盐和水'],
        answer: 0,
        hint: '产物是有机物和氧气。',
        explain: '原料是<b>二氧化碳和水</b>，产物是<b>有机物（淀粉）和氧气</b>，条件是<b>光</b>，场所是叶绿体。'
      },
      {
        level: 'base',
        title: '呼吸作用的实质是？',
        desc: '它和光合作用相反。',
        options: ['分解有机物，释放能量', '制造有机物，储存能量', '吸收二氧化碳', '产生氧气'],
        answer: 0,
        hint: '生命活动的能量从哪来？',
        explain: '呼吸作用<b>分解有机物、释放能量</b>，为生命活动提供动力。光合作用则是<b>制造有机物、储存能量</b>。'
      },
      {
        level: 'mid',
        title: '为什么夜间不宜在卧室放大量植物？',
        desc: '夜间植物进行什么作用。',
        options: ['植物呼吸作用消耗氧气', '植物进行光合作用放出二氧化碳', '植物蒸腾作用太强', '植物会吸收热量'],
        answer: 0,
        hint: '没有光，还能光合吗？',
        explain: '夜间无光，植物<b>只进行呼吸作用</b>，<b>消耗氧气、释放二氧化碳</b>，与人争氧。注意光合作用<b>放出</b>氧气，不会消耗。'
      },
      {
        level: 'mid',
        title: '大棚种植时适当增加二氧化碳浓度，目的是？',
        desc: '提高原料供应。',
        options: ['增强光合作用，提高产量', '增强呼吸作用', '减少蒸腾作用', '防止病虫害'],
        answer: 0,
        hint: '二氧化碳是光合作用的什么？',
        explain: '二氧化碳是光合作用的<b>原料</b>，适当增加浓度可<b>增强光合作用</b>、提高产量。这叫「气肥」。'
      },
      {
        level: 'mid',
        title: '储存粮食和水果时，为什么要低温、干燥、降低氧气浓度？',
        desc: '目的是抑制什么。',
        options: ['抑制呼吸作用，减少有机物消耗', '促进光合作用', '防止蒸腾作用', '促进种子萌发'],
        answer: 0,
        hint: '呼吸作用会消耗有机物。',
        explain: '目的是<b>抑制呼吸作用</b>，减少有机物消耗，延长保鲜期。低温、干燥、低氧都能降低呼吸速率。'
      },
      {
        level: 'mid',
        title: '「绿叶在光下制造有机物」实验中，先把植物放在黑暗处一昼夜，目的是？',
        desc: '为了排除干扰。',
        options: ['耗尽叶片原有的淀粉', '让植物休息', '增强光合作用', '杀死叶绿体'],
        answer: 0,
        hint: '如果叶子里本来就有淀粉会怎样？',
        explain: '为了<b>消耗掉叶片原有的淀粉</b>，排除干扰，确保实验后检测到的淀粉<b>确实是光照下新制造的</b>。'
      },
      {
        level: 'trap',
        title: '白天植物只进行光合作用，不进行呼吸作用，对吗？',
        desc: '呼吸作用什么时候停？',
        options: ['不对，呼吸作用昼夜不停', '对，白天只光合', '对，呼吸只在夜间', '不对，白天只呼吸'],
        answer: 0,
        hint: '细胞时刻都需要能量。',
        explain: '<b>呼吸作用昼夜不停</b>，因为细胞时刻需要能量。白天光合作用<b>强于</b>呼吸作用，所以表现为<b>净放氧</b>；但不能说呼吸停止了。'
      }
    ]);
})();
