/* 物理互动馆 · 第 14 课 内能的利用 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();

  /* —— 小工具：科学记数法、颜色混合 —— */
  var SUPS = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  function sciParts(x, d) {
    d = d === undefined ? 2 : d;
    if (!x) return ['0', 0];
    var e = Math.floor(Math.log(Math.abs(x)) / Math.LN10 + 1e-9);
    var m = L.fmt(x / Math.pow(10, e), d);
    if (Math.abs(+m) >= 10) { e += 1; m = L.fmt(x / Math.pow(10, e), d); }
    return [m, e];
  }
  function sciH(x, d) { var p = sciParts(x, d); return p[1] === 0 ? p[0] : p[0] + '×10' + L.sup(p[1]); }
  function sciT(x, d) {
    var p = sciParts(x, d);
    return p[1] === 0 ? p[0] : p[0] + '×10' + String(p[1]).split('').map(function (c) { return SUPS[+c]; }).join('');
  }
  function mix(a, b, t) {
    var pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16), out = [];
    [16, 8, 0].forEach(function (s) { out.push(Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t)); });
    return 'rgb(' + out.join(',') + ')';
  }

  /* ========== 四冲程内燃机 ========== */
  var eng = L.$('#engine');
  var CX = 150, CY = 214, CR = 26, ROD = 84;      // 曲轴中心、曲柄半径、连杆长
  var HEAD = 64, WL = 106, WR = 194, PH = 28;     // 汽缸顶内表面、汽缸内壁、活塞高
  var NAMES = ['吸气冲程', '压缩冲程', '做功冲程', '排气冲程'];
  var SHORT = ['吸气', '压缩', '做功', '排气'];
  var SC = ['#7fa7d6', '#8b7bbf', '#e07b3c', '#a9a4b1'];
  var SCT = ['#3f6fa8', '#5a4097', '#b4521f', '#6d6876'];
  var ang = L.num(st.a, 0, 0, 720);
  var kind = st.k === 'diesel' ? 'diesel' : 'petrol';

  function strokeOf(a) { return Math.min(3, Math.floor(a / 180)); }
  function phaseOf(a) { return a >= 720 ? 1 : (a % 180) / 180; }
  function pinY(a) {
    var t = a * Math.PI / 180, s = Math.sin(t);
    return CY - (CR * Math.cos(t) + Math.sqrt(ROD * ROD - CR * CR * s * s));
  }

  // 气体小颗粒：固定的伪随机位置，压缩时自然挤在一起
  var PTS = [];
  (function () {
    var s = 11;
    function r() { s = (s * 9301 + 49297) % 233280; return s / 233280; }
    for (var i = 0; i < 28; i++) PTS.push([r(), r()]);
  })();

  var defs = S('defs', {}, eng);
  S('rect', { x: 0, y: 0, width: 400, height: 260, rx: 14 }, S('clipPath', { id: 'engine-clip' }, defs));
  S('rect', { x: WL, y: HEAD, width: WR - WL, height: 120 }, S('clipPath', { id: 'chamber-clip' }, defs));

  function valve(g, x, open) {
    var d = open ? 7 : 0;
    S('rect', { x: x - 1.6, y: 26, width: 3.2, height: 33 + d, fill: '#7d768f' }, g);
    S('path', { d: 'M' + (x - 10) + ' ' + (64 + d) + 'H' + (x + 10) + 'L' + (x + 5) + ' ' + (59 + d) + 'H' + (x - 5) + 'Z', fill: open ? '#e7b04a' : '#a8a1b8', stroke: '#6f6884', 'stroke-width': 1 }, g);
  }

  function drawEngine() {
    eng.innerHTML = ''; eng.appendChild(defs);
    S('rect', { x: 0, y: 0, width: 400, height: 260, rx: 14, fill: '#fbfaf7' }, eng);
    var g = S('g', { 'clip-path': 'url(#engine-clip)' }, eng);
    var k = strokeOf(ang), ph = phaseOf(ang), diesel = kind === 'diesel', i;
    var t = ang * Math.PI / 180, py = pinY(ang), top = py - 12;

    // 飞轮
    S('circle', { cx: CX, cy: CY, r: 40, fill: '#ece9f1', stroke: '#b9b1cc', 'stroke-width': 1.5 }, g);
    for (i = 0; i < 3; i++) {
      var a2 = t + i * 2 * Math.PI / 3;
      S('line', { x1: CX, y1: CY, x2: CX + 35 * Math.sin(a2), y2: CY - 35 * Math.cos(a2), stroke: '#d6d0e2', 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
    }
    // 汽缸内腔
    S('rect', { x: WL, y: HEAD, width: WR - WL, height: 116, fill: '#f4f2f7' }, g);
    // 气体
    var n = PTS.length, vis = n, fill, dot;
    if (k === 0) { fill = diesel ? '#eef1f5' : '#e3ecf8'; dot = diesel ? '#9fadc0' : '#6f97c9'; vis = Math.round(n * ph); }
    else if (k === 1) { fill = diesel ? mix('#eef1f5', '#f4d9c2', ph) : mix('#e3ecf8', '#c6d6ef', ph); dot = diesel ? '#9fadc0' : '#6f97c9'; }
    else if (k === 2) { fill = mix('#f6b375', '#efe3d6', ph); dot = ph < 0.5 ? '#d0632d' : '#b9876a'; }
    else { fill = '#e8e5ea'; dot = '#958f9c'; vis = Math.round(n * (1 - ph)); }
    var gas = S('g', { 'clip-path': 'url(#chamber-clip)' }, g);
    S('rect', { x: WL, y: HEAD, width: WR - WL, height: top - HEAD, fill: fill }, gas);
    for (i = 0; i < vis; i++) {
      S('circle', { cx: WL + 6 + PTS[i][0] * (WR - WL - 12), cy: HEAD + 5 + PTS[i][1] * (top - HEAD - 10), r: 2.2, fill: dot }, gas);
    }
    // 点火 / 喷油 / 燃烧
    if (!diesel && ang >= 345 && ang <= 372) {
      for (i = 0; i < 8; i++) {
        var aa = i * Math.PI / 4;
        S('line', { x1: 150 + 3 * Math.cos(aa), y1: HEAD + 5 + 3 * Math.sin(aa), x2: 150 + 9 * Math.cos(aa), y2: HEAD + 5 + 9 * Math.sin(aa), stroke: '#f2b705', 'stroke-width': 2, 'stroke-linecap': 'round' }, gas);
      }
    }
    if (diesel && ang >= 340 && ang <= 372) {
      for (i = -2; i <= 2; i++) {
        var as = i * 0.38;
        S('line', { x1: 150, y1: HEAD + 2, x2: 150 + 18 * Math.sin(as), y2: HEAD + 2 + 18 * Math.cos(as), stroke: '#c9962e', 'stroke-width': 2, 'stroke-dasharray': '2 2.5' }, gas);
      }
    }
    if (k === 2 && ph < 0.3) S('circle', { cx: 150, cy: HEAD + 8, r: 10 + ph * 160, fill: '#ffd36b', opacity: 0.85 * (1 - ph / 0.3) }, gas);

    // 连杆与曲柄
    var cpx = CX + CR * Math.sin(t), cpy = CY - CR * Math.cos(t);
    S('line', { x1: CX, y1: py, x2: cpx, y2: cpy, stroke: '#9a93ad', 'stroke-width': 7, 'stroke-linecap': 'round' }, g);
    S('line', { x1: CX, y1: CY, x2: cpx, y2: cpy, stroke: '#6f6884', 'stroke-width': 9, 'stroke-linecap': 'round' }, g);
    S('circle', { cx: cpx, cy: cpy, r: 3.2, fill: '#fbfaf7' }, g);
    S('circle', { cx: CX, cy: CY, r: 5, fill: '#4f4862' }, g);
    // 活塞
    S('rect', { x: WL + 1, y: top, width: WR - WL - 2, height: PH, rx: 3, fill: '#bab3c8', stroke: '#8d86a0', 'stroke-width': 1.2 }, g);
    S('line', { x1: WL + 1, y1: top + 6, x2: WR - 1, y2: top + 6, stroke: '#8d86a0', 'stroke-width': 1 }, g);
    S('line', { x1: WL + 1, y1: top + 10, x2: WR - 1, y2: top + 10, stroke: '#8d86a0', 'stroke-width': 1 }, g);
    S('circle', { cx: CX, cy: py, r: 4, fill: '#6f6884' }, g);
    // 汽缸壁与汽缸盖
    S('rect', { x: 96, y: HEAD, width: 10, height: 116, fill: '#c9c3d4' }, g);
    S('rect', { x: 194, y: HEAD, width: 10, height: 116, fill: '#c9c3d4' }, g);
    S('rect', { x: 92, y: 40, width: 116, height: 24, fill: '#bdb6ca' }, g);
    S('rect', { x: 50, y: 45, width: 42, height: 11, fill: k === 0 ? fill : '#efedf3', stroke: '#bdb6ca' }, g);
    S('rect', { x: 208, y: 45, width: 24, height: 11, fill: k === 3 ? fill : '#efedf3', stroke: '#bdb6ca' }, g);
    S('path', { d: 'M92 45H124L138 64H114L104 56H92Z', fill: k === 0 ? fill : '#efedf3' }, g);
    S('path', { d: 'M208 45H176L162 64H186L196 56H208Z', fill: k === 3 ? fill : '#efedf3' }, g);
    valve(g, 126, k === 0);
    valve(g, 174, k === 3);
    if (k === 0) L.arrow(g, 54, 50.5, 88, 50.5, { color: diesel ? '#7f8ea3' : '#3f6fa8', width: 2, head: 7 });
    if (k === 3) L.arrow(g, 210, 50.5, 236, 50.5, { color: '#6d6876', width: 2, head: 7 });
    // 火花塞 / 喷油嘴
    if (!diesel) {
      S('rect', { x: 147, y: 16, width: 6, height: 8, fill: '#8d86a0' }, g);
      S('rect', { x: 144.5, y: 24, width: 11, height: 16, rx: 2, fill: '#efe9d8', stroke: '#a39b86' }, g);
      S('line', { x1: 150, y1: 40, x2: 150, y2: HEAD + 3, stroke: '#6f6884', 'stroke-width': 2 }, g);
    } else {
      S('rect', { x: 144, y: 18, width: 12, height: 22, rx: 2, fill: '#c7cdd6', stroke: '#8792a3' }, g);
      S('path', { d: 'M146 40H154L151 ' + (HEAD + 2) + 'H149Z', fill: '#8792a3' }, g);
    }
    // 部件名
    var lab = { 'font-size': 9.5, fill: '#7a7488' };
    S('text', Object.assign({ x: 118, y: 20, 'text-anchor': 'end', text: '进气门' }, lab), g);
    S('text', Object.assign({ x: 150, y: 12, 'text-anchor': 'middle', text: diesel ? '喷油嘴' : '火花塞' }, lab), g);
    S('text', Object.assign({ x: 182, y: 20, text: '排气门' }, lab), g);
    S('text', Object.assign({ x: 90, y: 84, 'text-anchor': 'end', text: '汽缸' }, lab), g);
    S('text', Object.assign({ x: 90, y: top + 18, 'text-anchor': 'end', text: '活塞' }, lab), g);
    S('text', Object.assign({ x: 104, y: 196, 'text-anchor': 'end', text: '连杆' }, lab), g);
    S('text', Object.assign({ x: 104, y: 236, 'text-anchor': 'end', text: '曲轴' }, lab), g);
    S('text', Object.assign({ x: 196, y: 248, text: '飞轮' }, lab), g);

    // 右侧信息栏
    var ix = 252;
    S('text', { x: ix, y: 30, 'font-size': 10, fill: '#8a8598', text: '曲轴转角 ' + Math.round(ang) + '° · 飞轮第 ' + (ang < 360 ? 1 : 2) + ' 圈' }, g);
    S('text', { x: ix, y: 60, 'font-size': 18, 'font-weight': 700, fill: SCT[k], text: NAMES[k] }, g);
    for (i = 0; i < 4; i++) {
      var bx = ix + i * 35;
      S('rect', { x: bx, y: 72, width: 33, height: 12, rx: 3, fill: '#efedf3' }, g);
      var w = i < k ? 33 : i === k ? 33 * ph : 0;
      if (w > 0) S('rect', { x: bx, y: 72, width: w, height: 12, rx: 3, fill: SC[i], opacity: i === k ? 1 : 0.45 }, g);
      S('text', { x: bx + 16.5, y: 98, 'font-size': 10, 'text-anchor': 'middle', fill: i === k ? SCT[i] : '#9d98a8', 'font-weight': i === k ? 700 : 400, text: SHORT[i] }, g);
    }
    var down = k % 2 === 0;
    L.arrow(g, ix + 10, down ? 114 : 148, ix + 10, down ? 148 : 114, { color: '#6f6884', width: 2.2, head: 9 });
    S('text', { x: ix + 26, y: 135, 'font-size': 11, fill: '#4f4862', text: down ? '活塞向下运动' : '活塞向上运动' }, g);
    var boxFill = k === 1 ? '#e6e1f3' : k === 2 ? '#fbe3d1' : '#f1eff5';
    S('rect', { x: ix, y: 162, width: 140, height: 44, rx: 9, fill: boxFill }, g);
    var l1 = ['不对外做功', '机械能 → 内能', '内能 → 机械能', '不对外做功'][k];
    var l2 = ['靠飞轮惯性吸进' + (diesel ? '空气' : '混合物'), '活塞压缩气体，温度升高', '燃气推动活塞，对外做功', '靠飞轮惯性排出废气'][k];
    S('text', { x: ix + 10, y: 180, 'font-size': 12, 'font-weight': 700, fill: SCT[k], text: l1 }, g);
    S('text', { x: ix + 10, y: 197, 'font-size': 9.5, fill: '#6d6876', text: l2 }, g);
    if ((!diesel && ang >= 345 && ang <= 372) || (diesel && ang >= 340 && ang <= 372)) {
      S('text', { x: ix, y: 228, 'font-size': 10.5, 'font-weight': 600, fill: '#b4521f', text: diesel ? '喷油：柴油遇热空气自燃' : '点火：火花塞产生电火花' }, g);
    }
    engineReadout(k);
  }

  var lastKey = '';
  var ENERGY = ['无（靠飞轮惯性）', '机械能 → 内能', '内能 → 机械能', '无（靠飞轮惯性）'];
  function engineText(k) {
    var diesel = kind === 'diesel';
    if (k === 0) return diesel
      ? '进气门打开、排气门关闭，活塞<b>向下</b>运动。柴油机这时只吸进<b>空气</b>，柴油要等到压缩冲程末尾才由喷油嘴喷进来。'
      : '进气门打开、排气门关闭，活塞<b>向下</b>运动，汽缸里空间变大，把<b>汽油和空气的混合物</b>吸进来。这一冲程不对外做功，靠飞轮的惯性带着转。';
    if (k === 1) return diesel
      ? '两个气门都关闭，活塞<b>向上</b>把空气压缩得比汽油机还厉害，空气温度升得很高，超过柴油的燃点：<b>机械能转化为内能</b>。'
      : '两个气门都关闭，活塞<b>向上</b>压缩混合物，气体被压得越来越紧，内能增大、温度升高：<b>机械能转化为内能</b>。';
    if (k === 2) return diesel
      ? '压缩冲程末尾，<b>喷油嘴</b>喷出雾状柴油，一碰到高温空气就自己燃烧（<b>压燃式</b>，不需要火花塞），燃气推动活塞<b>向下</b>：<b>内能转化为机械能</b>。'
      : '压缩冲程末尾，<b>火花塞</b>产生电火花，混合物猛烈燃烧，高温高压的燃气推动活塞<b>向下</b>：<b>内能转化为机械能</b>。四个冲程里只有这一个对外做功。';
    return '排气门打开，活塞<b>向上</b>把燃烧后的废气推出汽缸。废气温度还很高，带走了大量内能，这是热机效率不高的主要原因。';
  }
  function engineReadout(k) {
    L.$('#ang-out').textContent = Math.round(ang) + '°';
    L.$('#stroke-badge').textContent = NAMES[k];
    L.$('#inv-out').textContent = k === 0 ? '打开' : '关闭';
    L.$('#exv-out').textContent = k === 3 ? '打开' : '关闭';
    L.$('#piston-out').textContent = k % 2 === 0 ? '向下' : '向上';
    L.$('#turn-out').textContent = ang < 360 ? '第 1 圈' : '第 2 圈';
    L.$('#energy-out').textContent = ENERGY[k];
    var key = k + kind;
    if (key !== lastKey) {
      lastKey = key;
      L.$('#engine-text').innerHTML = engineText(k);
      L.$$('#stroke-table tbody tr').forEach(function (tr) { tr.classList.toggle('on', +tr.dataset.s === k); });
    }
    save();
  }

  var angIn = L.$('#ang-in'), playBtn = L.$('#play-btn');
  angIn.value = ang;
  var playing = false, anim = null;
  function setPlaying(on) {
    playing = on;
    if (!on && anim) { anim.stop(); anim = null; }
    playBtn.textContent = L.REDUCED ? '下一冲程' : (on ? '暂停' : '播放');
    playBtn.setAttribute('aria-pressed', String(on));
  }
  function setAng(a) {
    ang = L.clamp(a, 0, 720);
    angIn.value = ang; L.paintRange(angIn);
    drawEngine();
  }
  L.bindRange(angIn, function (v) { setPlaying(false); ang = v; drawEngine(); });
  playBtn.addEventListener('click', function () {
    if (L.REDUCED) { setAng(((strokeOf(ang) + 1) % 4) * 180 + 90); return; }
    if (playing) { setPlaying(false); return; }
    if (ang >= 720) ang = 0;
    setPlaying(true);
    anim = L.loop(function (dt) {
      if (!playing) return false;
      if (document.hidden) return;
      var a = ang + dt * 120;           // 每秒 120°：一个冲程 1.5 s，比真实慢几十倍
      if (a >= 720) a -= 720;
      setAng(a);
    });
  });
  L.$('#reset-btn').addEventListener('click', function () { setPlaying(false); setAng(0); });
  L.chips(L.$('#type-chips'), [{ label: '汽油机（火花塞点火）', value: 'petrol' }, { label: '柴油机（压燃式）', value: 'diesel' }], kind, function (v) { kind = v; drawEngine(); });
  setPlaying(false);

  /* ========== 转速换算时间轴 ========== */
  var tl = L.$('#timeline'), rpmIn = L.$('#rpm-in');
  var rpm = Math.round((L.num(st.n, 1800, 1200, 3000) - 1200) / 120) * 120 + 1200;
  rpmIn.value = rpm;
  var tdefs = S('defs', {}, tl);
  S('rect', { x: 0, y: 0, width: 400, height: 200, rx: 14 }, S('clipPath', { id: 'tl-clip' }, tdefs));
  function drawTimeline() {
    tl.innerHTML = ''; tl.appendChild(tdefs);
    S('rect', { x: 0, y: 0, width: 400, height: 200, rx: 14, fill: '#fbfaf7' }, tl);
    var g = S('g', { 'clip-path': 'url(#tl-clip)' }, tl);
    var X0 = 60, W = 326, n = rpm / 60, w = W / n, i;
    S('text', { x: 14, y: 24, 'font-size': 11, 'font-weight': 600, fill: '#5a4097', text: '把 1 秒钟摊开来看（' + rpm + ' r/min = ' + n + ' r/s）' }, g);
    var lab = { 'font-size': 10, fill: '#6d6876' };
    S('text', Object.assign({ x: 14, y: 55, text: '飞轮转圈' }, lab), g);
    S('text', Object.assign({ x: 14, y: 95, text: '冲程' }, lab), g);
    S('text', Object.assign({ x: 14, y: 135, text: '做功' }, lab), g);
    for (i = 0; i < n; i++) S('rect', { x: X0 + i * w, y: 42, width: Math.max(0.5, w - 0.6), height: 18, fill: i % 2 ? '#c9bfe0' : '#e2dcef' }, g);
    for (i = 0; i < 2 * n; i++) S('rect', { x: X0 + i * w / 2, y: 82, width: Math.max(0.5, w / 2 - 0.6), height: 18, fill: SC[i % 4] }, g);
    for (i = 0; i < n / 2; i++) {
      var cx = X0 + (4 * i + 2.5) * w / 2;
      S('circle', { cx: cx, cy: 131, r: Math.min(4, w * 0.42), fill: '#e07b3c' }, g);
    }
    S('line', { x1: X0, y1: 156, x2: X0 + W, y2: 156, stroke: '#8d86a0', 'stroke-width': 1.4 }, g);
    for (i = 0; i <= 4; i++) {
      var x = X0 + W * i / 4;
      S('line', { x1: x, y1: 152, x2: x, y2: 160, stroke: '#8d86a0', 'stroke-width': 1.2 }, g);
      S('text', { x: x, y: 172, 'font-size': 9.5, 'text-anchor': i === 0 ? 'start' : i === 4 ? 'end' : 'middle', fill: '#8a8598', text: L.fmt(i / 4, 2) + ' s' }, g);
    }
    for (i = 0; i < 4; i++) {
      var lx = X0 + i * 62;
      S('rect', { x: lx, y: 182, width: 10, height: 10, rx: 2, fill: SC[i] }, g);
      S('text', { x: lx + 14, y: 191, 'font-size': 9.5, fill: '#6d6876', text: SHORT[i] + '冲程' }, g);
    }
    rpmReadout();
  }
  function rpmReadout() {
    var n = rpm / 60;
    L.$('#rpm-out').textContent = rpm + ' r/min';
    L.$('#rps-out').innerHTML = n + '<small>圈</small>';
    L.$('#cyc-out').innerHTML = n / 2 + '<small>个</small>';
    L.$('#strk-out').innerHTML = 2 * n + '<small>个</small>';
    L.$('#work-out').innerHTML = n / 2 + '<small>次</small>';
    L.$('#rpm-text').innerHTML = rpm + ' r/min ÷ 60 = <b>' + n + ' r/s</b>。飞轮转 2 圈完成 1 个工作循环，所以每秒 ' + n + ' ÷ 2 = <b>' + n / 2 + ' 个循环</b>；每个循环 4 个冲程、做功 1 次，于是每秒<b>完成 ' + 2 * n + ' 个冲程、对外做功 ' + n / 2 + ' 次</b>。一个冲程只要 ' + L.fmt(1000 / (2 * n), 1) + ' ms，所以上面的动画是放慢了很多很多倍的。';
    save();
  }
  L.bindRange(rpmIn, function (v) { rpm = v; drawTimeline(); });

  /* ========== 热值与效率：能量流向 ========== */
  var FUELS = { petrol: ['汽油', 4.6e7], diesel: ['柴油', 4.3e7], alcohol: ['酒精', 3.0e7], wood: ['干木柴', 1.2e7] };
  var fuel = FUELS[st.fu] ? st.fu : 'petrol';
  var mass = Math.round(L.num(st.m, 0.5, 0.1, 2) * 10) / 10;
  var eta = Math.round(L.num(st.e, 25, 10, 50));
  var LOSS = [['废气带走', 0.5, '#a9a4b1'], ['散热损失', 0.36, '#7fa7d6'], ['克服摩擦等', 0.14, '#c9a873']];
  var flow = L.$('#flow'), mIn = L.$('#m-in'), etaIn = L.$('#eta-in');
  mIn.value = mass; etaIn.value = eta;
  var fdefs = S('defs', {}, flow);
  S('rect', { x: 0, y: 0, width: 400, height: 230, rx: 14 }, S('clipPath', { id: 'flow-clip' }, fdefs));

  function drawFlow() {
    flow.innerHTML = ''; flow.appendChild(fdefs);
    S('rect', { x: 0, y: 0, width: 400, height: 230, rx: 14, fill: '#fbfaf7' }, flow);
    var g = S('g', { 'clip-path': 'url(#flow-clip)' }, flow);
    var q = FUELS[fuel][1], Q = mass * q;
    var parts = [['有用功', eta / 100, '#5a4097']].concat(LOSS.map(function (l) { return [l[0], (1 - eta / 100) * l[1], l[2]]; }));
    var H = 150, x0 = 16, x1 = 92, x2 = 230, x3 = 252, top = 40, gap = 8;
    S('text', { x: 16, y: 26, 'font-size': 11, 'font-weight': 600, fill: '#8a5a22', text: mass + ' kg ' + FUELS[fuel][0] + '完全燃烧放出 Q放 = ' + sciT(Q) + ' J' }, g);
    S('rect', { x: x0, y: top, width: x1 - x0, height: H, rx: 4, fill: '#e9a25c' }, g);
    S('text', { x: (x0 + x1) / 2, y: top + H / 2 - 4, 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle', fill: '#fff', text: 'Q放' }, g);
    S('text', { x: (x0 + x1) / 2, y: top + H / 2 + 14, 'font-size': 11, 'text-anchor': 'middle', fill: '#fff', text: '100%' }, g);
    var yin = top, yout = top + H / 2 - (H + 3 * gap) / 2, mx = (x1 + x2) / 2, labels = [];
    parts.forEach(function (p, i) {
      var h = H * p[1], a0 = yin, a1 = yin + h, b0 = yout, b1 = yout + h;
      var d = 'M' + x1 + ' ' + a0 + 'C' + mx + ' ' + a0 + ' ' + mx + ' ' + b0 + ' ' + x2 + ' ' + b0 + 'L' + x3 + ' ' + b0 + 'L' + x3 + ' ' + b1 + 'L' + x2 + ' ' + b1 + 'C' + mx + ' ' + b1 + ' ' + mx + ' ' + a1 + ' ' + x1 + ' ' + a1 + 'Z';
      S('path', { d: d, fill: p[2], opacity: i === 0 ? 0.92 : 0.6 }, g);
      labels.push({ y: (b0 + b1) / 2, p: p });
      yin = a1; yout = b1 + gap;
    });
    labels[0].y = Math.max(labels[0].y, 42);
    for (var i = 1; i < labels.length; i++) labels[i].y = Math.max(labels[i].y, labels[i - 1].y + 28);
    var over = labels[labels.length - 1].y - 210;
    if (over > 0) labels.forEach(function (l) { l.y -= over; });
    labels.forEach(function (l, i) {
      S('text', { x: 258, y: l.y - 2, 'font-size': 10.5, 'font-weight': i === 0 ? 700 : 600, fill: i === 0 ? '#5a4097' : '#5f5a6b', text: l.p[0] + ' ' + L.fmt(l.p[1] * 100, 1) + '%' }, g);
      S('text', { x: 258, y: l.y + 11, 'font-size': 9.5, fill: '#8a8598', text: sciT(Q * l.p[1]) + ' J' }, g);
    });
    flowReadout(q, Q);
  }
  function flowReadout(q, Q) {
    var W = Q * eta / 100;
    L.$('#m-out').textContent = mass + ' kg';
    L.$('#eta-out').textContent = eta + '%';
    L.$('#fuel-badge').textContent = FUELS[fuel][0];
    L.$('#q-out').innerHTML = (fuel === 'wood' ? '约 ' : '') + sciH(q) + '<small>J/kg</small>';
    L.$('#Q-out').innerHTML = sciH(Q) + '<small>J</small>';
    L.$('#W-out').innerHTML = sciH(W) + '<small>J</small>';
    L.$('#loss-out').innerHTML = sciH(Q - W) + '<small>J</small>';
    var tip;
    if (eta > 45) tip = '效率调到 ' + eta + '% 已经超过现实中热机能达到的水平了（柴油机约 30%～45%）。';
    else if (fuel === 'petrol') tip = '汽油机的效率一般只有 20%～30%。';
    else if (fuel === 'diesel') tip = '柴油机压缩程度更大，效率约 30%～45%，比汽油机高。';
    else if (fuel === 'wood') tip = '早期的蒸汽机烧木柴和煤，效率只有 6%～15%。';
    else tip = '酒精的热值比汽油小，同样质量放出的热量更少。';
    L.$('#fuel-text').innerHTML = 'Q放 = mq = ' + mass + ' kg × ' + sciH(q) + ' J/kg = <b>' + sciH(Q) + ' J</b>；W = ηQ放 = ' + eta + '% × ' + sciH(Q) + ' J = <b>' + sciH(W) + ' J</b>。四股能量加起来正好 100%，一点没少，这就是<b>能量守恒</b>。' + tip + ' 改变质量，Q放 跟着变，但<b>热值 q 不变</b>。';
    save();
  }
  L.chips(L.$('#fuel-chips'), Object.keys(FUELS).map(function (k) { return { label: FUELS[k][0], value: k }; }), fuel, function (v) { fuel = v; drawFlow(); });
  L.bindRange(mIn, function (v) { mass = Math.round(v * 10) / 10; drawFlow(); });
  L.bindRange(etaIn, function (v) { eta = v; drawFlow(); });

  function save() { L.setState({ a: Math.round(ang), k: kind, n: rpm, fu: fuel, m: mass, e: eta }); }

  drawEngine();
  drawTimeline();
  drawFlow();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '转到“内能变成机械能”的那个冲程',
      desc: '在汽缸图里转动曲轴，停在把燃气的内能转化为活塞机械能的冲程上。',
      label: '在汽缸图里转动曲轴',
      button: '检查这个冲程',
      check: function () {
        var k = strokeOf(ang);
        if (k === 2 && ang < 720) return { ok: true, msg: '这是做功冲程：两个气门关闭，高温高压燃气推动活塞向下，内能转化为机械能。' };
        if (k === 1) return { ok: false, msg: '现在是压缩冲程，活塞向上压气体，能量转化方向正好相反（机械能→内能）。再往后转半圈。' };
        return { ok: false, msg: '现在是' + NAMES[k] + '，它靠飞轮惯性完成，不对外做功。找两个气门都关闭、活塞<b>向下</b>运动的那个冲程。' };
      }
    },
    {
      level: 'base',
      title: '柴油机和汽油机在构造上的一个区别是',
      desc: '可以在汽缸图里切换“汽油机 / 柴油机”对比汽缸顶部。',
      options: ['柴油机汽缸顶部是喷油嘴，汽油机是火花塞', '柴油机汽缸顶部是火花塞，汽油机是喷油嘴', '柴油机没有进气门', '柴油机一个工作循环只有两个冲程'],
      answer: 0,
      hint: '柴油机是“压燃式”，它需要火花塞吗？',
      explain: '汽油机靠<b>火花塞</b>点燃混合物；柴油机把空气压缩到很高温度，再由<b>喷油嘴</b>喷入柴油，柴油自己燃烧（压燃式），不需要火花塞。两者都是四冲程，都有进气门和排气门。'
    },
    {
      level: 'base',
      title: '酒精的热值是 3.0×10<sup>7</sup> J/kg，完全燃烧 0.2 kg 酒精放出多少热量？',
      desc: '可以在能量流向图里选酒精、把质量调到 0.2 kg 验证。',
      options: ['6×10<sup>6</sup> J', '6×10<sup>7</sup> J', '1.5×10<sup>8</sup> J', '6×10<sup>5</sup> J'],
      answer: 0,
      hint: '用 Q放 = mq，注意 10 的指数怎么变。',
      explain: 'Q放 = mq = 0.2 kg × 3.0×10<sup>7</sup> J/kg = <b>6×10<sup>6</sup> J</b>。0.2 × 3 = 0.6，0.6×10<sup>7</sup> 写成科学记数法就是 6×10<sup>6</sup>；选 6×10<sup>7</sup> 是忘了 0.2 不是 2；1.5×10<sup>8</sup> 是错把乘法做成了除法。'
    },
    {
      level: 'mid',
      title: '让这台汽油机每秒对外做功 15 次',
      desc: '在“转速换算”里调飞轮转速。先想好：做功 15 次，飞轮每秒要转几圈？',
      label: '在转速换算图里调转速',
      button: '检查转速',
      check: function () {
        var w = rpm / 120;
        if (rpm === 1800) return { ok: true, msg: '做功 15 次 → 15 个循环 → 飞轮转 30 圈/秒 → 30 × 60 = <b>1800 r/min</b>。' };
        return { ok: false, msg: '现在每秒做功 ' + w + ' 次。倒着推：做功 1 次飞轮转 2 圈，所以每秒要转 30 圈，再换成每分钟。' };
      }
    },
    {
      level: 'mid',
      title: '飞轮转速是 2400 r/min 的单缸四冲程汽油机，1 s 内',
      desc: '可以把转速调到 2400 r/min 数一数。',
      options: ['完成 80 个冲程，对外做功 20 次', '完成 40 个冲程，对外做功 40 次', '完成 40 个冲程，对外做功 10 次', '完成 160 个冲程，对外做功 40 次'],
      answer: 0,
      hint: '先换成每秒转几圈，再用“2 圈 1 循环、4 冲程、做功 1 次”。',
      explain: '2400 r/min = 40 r/s，40 圈 = <b>20 个工作循环</b>，每个循环 4 个冲程、做功 1 次，所以完成 <b>80 个冲程、做功 20 次</b>。“做功 40 次”是把转数当成了做功次数；“160 个冲程”是以为 1 圈就有 4 个冲程。'
    },
    {
      level: 'mid',
      title: '用效率 30% 的汽油机输出 1.38×10<sup>7</sup> J 的有用功',
      desc: '在能量流向图里选汽油、把效率调到 30%，再算一算需要完全燃烧多少千克汽油，把质量调好。',
      label: '在能量流向图里操作',
      button: '检查我的设置',
      check: function () {
        if (fuel !== 'petrol') return { ok: false, msg: '题目说的是汽油机，先选“汽油”。' };
        if (eta !== 30) return { ok: false, msg: '效率现在是 ' + eta + '%，调到 30%。' };
        if (Math.abs(mass - 1) < 1e-6) return { ok: true, msg: 'Q放 = W ÷ η = 1.38×10<sup>7</sup> J ÷ 30% = 4.6×10<sup>7</sup> J，m = Q放 ÷ q = 4.6×10<sup>7</sup> J ÷ 4.6×10<sup>7</sup> J/kg = <b>1 kg</b>。' };
        return { ok: false, msg: '现在有用功是 ' + sciH(mass * 4.6e7 * 0.3) + ' J。先用 Q放 = W ÷ η 求出需要放出多少热量，再用 m = Q放 ÷ q 求质量。' };
      }
    },
    {
      level: 'trap',
      title: '关于燃料的热值，下面说法正确的是',
      desc: '热值只跟什么有关？',
      options: ['一瓶汽油用掉一半，剩下汽油的热值不变', '燃料燃烧得越充分，它的热值越大', '燃料的质量越大，它的热值越大', '热值大的燃料燃烧时放出的热量一定多'],
      answer: 0,
      hint: '热值是燃料本身的一种性质，像密度一样。',
      explain: '热值只由燃料的<b>种类</b>决定，用掉一半<b>热值不变</b>。燃烧得充分，只是实际放出的热量多，热值本身不变；质量大放热多，但热值不变；放热多少还要看质量和是否完全燃烧，热值大不代表放热一定多。'
    },
    {
      level: 'trap',
      title: '汽油机的压缩冲程中，汽缸内的气体',
      desc: '想一想活塞是谁推谁。',
      options: ['内能增大、温度升高，机械能转化为内能', '内能减小，内能转化为机械能', '推动活塞向下运动，对外做功', '从打开的进气门被吸进汽缸'],
      answer: 0,
      hint: '压缩冲程里是活塞对气体做功，还是气体对活塞做功？',
      explain: '压缩冲程里两个气门都关闭，<b>活塞向上对气体做功</b>，气体内能增大、温度升高，是<b>机械能转化为内能</b>。“内能转化为机械能、推动活塞向下”说的是做功冲程；“从进气门吸入”是吸气冲程。'
    }
  ]);
})();
