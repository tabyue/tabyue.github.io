/* 物理互动馆 · 第 2 课 声现象 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();

  /* ========== 波形：音调、响度、音色 ========== */
  var TONES = {
    fork: { name: '音叉', h: [1] },
    flute: { name: '长笛', h: [1, 0.28, 0.08] },
    piano: { name: '钢琴', h: [1, 0.6, 0.35, 0.22, 0.12] },
    violin: { name: '小提琴', h: [1, -0.5, 0.33, -0.25, 0.2, -0.17, 0.14, -0.12] }
  };
  var fq = Math.round(L.num(st.f, 400, 200, 1000) / 50) * 50;
  var amp = Math.round(L.num(st.a, 3, 1, 5));
  var dist = Math.round(L.num(st.d, 1, 1, 5) * 2) / 2;
  var tone = TONES[st.tn] ? st.tn : 'fork';
  var last = 'pitch';
  var wave = L.$('#wave');
  var WX0 = 34, WX1 = 390, WY = 112, CELL = 18;   // 横轴 0～10 ms；纵向 1 格 = 18 px

  function shape(name) {
    var h = TONES[name].h, peak = 0, i, x, v;
    function raw(p) { var s = 0; for (var n = 0; n < h.length; n++) s += h[n] * Math.sin((n + 1) * p); return s; }
    for (i = 0; i < 400; i++) { v = Math.abs(raw(i / 400 * Math.PI * 2)); if (v > peak) peak = v; }
    return function (p) { return raw(p) / peak; };
  }
  function eff() { return amp / dist; }
  function pitchLv() { return fq <= 350 ? '低' : fq <= 650 ? '中' : '高'; }
  function loudLv() { var e = eff(); return e >= 3 ? '大' : e >= 1.2 ? '适中' : '小'; }

  function drawWave() {
    wave.innerHTML = '';
    var defs = S('defs', {}, wave), cp = S('clipPath', { id: 'wave-clip' }, defs);
    S('rect', { x: WX0, y: 14, width: WX1 - WX0, height: 196 }, cp);
    S('rect', { x: 0, y: 0, width: 400, height: 230, rx: 14, fill: '#fbfaf7' }, wave);
    var k, y;
    for (k = -5; k <= 5; k++) {
      y = WY - k * CELL;
      S('line', { x1: WX0, y1: y, x2: WX1, y2: y, stroke: k === 0 ? '#8d95a6' : '#e6e3ec', 'stroke-width': k === 0 ? 1.4 : 1 }, wave);
    }
    for (k = 0; k <= 10; k += 2) {
      var x = WX0 + k / 10 * (WX1 - WX0);
      S('line', { x1: x, y1: 14, x2: x, y2: 210, stroke: '#eeebf2' }, wave);
      S('text', { x: k === 10 ? x + 4 : x, y: 224, 'font-size': 9.5, 'text-anchor': k === 10 ? 'end' : 'middle', fill: '#8a8598', text: k + (k === 10 ? ' ms' : '') }, wave);
    }
    S('line', { x1: WX0, y1: 14, x2: WX0, y2: 210, stroke: '#5b6475', 'stroke-width': 1.4 }, wave);
    S('text', { x: WX1 - 2, y: 26, 'font-size': 9.5, 'text-anchor': 'end', fill: '#6b7385', text: '横轴：时间' }, wave);
    var A = eff() * CELL, fn = shape(tone), d = '', n = 600;
    for (var i = 0; i <= n; i++) {
      var tms = i / n * 10, px = WX0 + i / n * (WX1 - WX0);
      d += (i ? 'L' : 'M') + px.toFixed(1) + ' ' + (WY - A * fn(2 * Math.PI * fq * tms / 1000)).toFixed(1);
    }
    var g = S('g', { 'clip-path': 'url(#wave-clip)' }, wave);
    S('line', { x1: WX0, y1: WY - A, x2: WX1, y2: WY - A, stroke: '#c2603f', 'stroke-dasharray': '3 4', opacity: 0.7 }, g);
    S('line', { x1: WX0, y1: WY + A, x2: WX1, y2: WY + A, stroke: '#c2603f', 'stroke-dasharray': '3 4', opacity: 0.7 }, g);
    S('path', { d: d, fill: 'none', stroke: '#5a4097', 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, g);
    // 振动一次的宽度
    var Tpx = (1000 / fq) / 10 * (WX1 - WX0);
    S('path', { d: 'M' + (WX0 + 2) + ' 24v-6H' + (WX0 + Tpx) + 'v6', fill: 'none', stroke: '#3f8a6a', 'stroke-width': 1.4 }, g);
    S('text', { x: WX0 + Tpx + 5, y: 24, 'font-size': 9.5, fill: '#3f8a6a', text: '振动一次 ' + L.fmt(1000 / fq, 2) + ' ms' }, g);
    S('text', { x: WX0 - 4, y: WY - A + 3.5, 'font-size': 9.5, 'text-anchor': 'end', fill: '#a4492b', text: '振幅' }, wave);
    S('text', { x: WX0 - 4, y: WY + 3.5, 'font-size': 9.5, 'text-anchor': 'end', fill: '#6b7385', text: '0' }, wave);
    waveReadout();
  }

  function waveReadout() {
    var p = pitchLv(), l = loudLv(), e = eff();
    L.$('#f-out').textContent = fq + ' Hz';
    L.$('#a-out').textContent = amp + ' 格';
    L.$('#d-out').textContent = L.fmt(dist, 1) + ' m';
    L.$('#tone-badge').textContent = TONES[tone].name;
    L.$('#f-stat').innerHTML = fq + '<small>Hz</small>';
    L.$('#pitch-stat').textContent = p === '中' ? '中等' : (p === '高' ? '较高' : '较低');
    L.$('#amp-stat').innerHTML = L.fmt(e, 2) + '<small>格</small>';
    L.$('#loud-stat').textContent = l;
    L.$('#wave-kind').textContent = '音调' + (p === '中' ? '中等' : p === '高' ? '较高' : '较低') + ' · 响度' + l + ' · ' + TONES[tone].name;
    var t;
    if (last === 'pitch') t = '每秒振动 ' + fq + ' 次，频率是 ' + fq + ' Hz。频率越高，屏幕上的波挤得越<b>密</b>，音调越高、声音越尖。人耳一般能听到 20 Hz～20000 Hz 的声音。';
    else if (last === 'loud') t = '发声体振幅 ' + amp + ' 格，你站在 ' + L.fmt(dist, 1) + ' m 外，传到耳边的振幅约 ' + L.fmt(e, 2) + ' 格。<b>振幅越大、离得越近，响度越大</b>。注意波的疏密没变，所以音调没变。';
    else t = {
      fork: '音叉发出的声音很“纯”，波形是光滑的正弦曲线，常用来校准音调。',
      flute: '长笛的波形接近光滑曲线，只多了一点点小起伏，听起来清亮、柔和。',
      piano: '钢琴的波形在每次振动里多了几个“小鼓包”。频率和振幅都没变，变的是<b>波的形状</b>，也就是音色。',
      violin: '小提琴的波形像一排斜斜的锯齿，听起来明亮、有点“沙”。不同乐器的材料和结构不同，<b>音色</b>就不同。'
    }[tone];
    L.$('#wave-text').innerHTML = t;
    L.$$('#trait-table tbody tr').forEach(function (tr) { tr.classList.toggle('on', tr.dataset.r === last); });
    save();
  }

  var fIn = L.$('#f-in'), aIn = L.$('#a-in'), dIn = L.$('#d-in');
  fIn.value = fq; aIn.value = amp; dIn.value = dist;
  L.bindRange(fIn, function (v) { fq = v; last = 'pitch'; drawWave(); });
  L.bindRange(aIn, function (v) { amp = v; last = 'loud'; drawWave(); });
  L.bindRange(dIn, function (v) { dist = v; last = 'loud'; drawWave(); });
  L.chips(L.$('#tone-chips'), [{ label: '音叉', value: 'fork' }, { label: '长笛', value: 'flute' }, { label: '钢琴', value: 'piano' }, { label: '小提琴', value: 'violin' }], tone, function (v) { tone = v; last = 'timbre'; drawWave(); });

  // 听一听：用浏览器自带的声音合成，不需要任何音频文件。三个模型共用一个音频上下文
  var ac = null, playBtn = L.$('#wave-play');
  function audio() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!ac) ac = new AC();
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }
  /* 一声“啪”：短促的噪声脉冲，vol 越小越轻，用于回声 */
  function clap(at, vol) {
    var len = Math.floor(ac.sampleRate * 0.09), buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    var src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    src.buffer = buf; f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = 0.8;
    g.gain.value = vol;
    src.connect(f); f.connect(g); g.connect(ac.destination);
    src.start(at);
  }
  playBtn.addEventListener('click', function () {
    if (!audio()) { playBtn.textContent = '这个浏览器不能播放声音'; playBtn.disabled = true; return; }
    try {
      var h = TONES[tone].h, re = new Float32Array(h.length + 1), im = new Float32Array(h.length + 1);
      for (var n = 0; n < h.length; n++) im[n + 1] = h[n];
      var osc = ac.createOscillator(), g = ac.createGain(), now = ac.currentTime;
      osc.setPeriodicWave(ac.createPeriodicWave(re, im));
      osc.frequency.value = fq;
      var vol = 0.03 + 0.2 * eff() / 5;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(vol, now + 0.03);
      if (tone === 'piano') g.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);
      else { g.gain.setValueAtTime(vol, now + 0.85); g.gain.exponentialRampToValueAtTime(0.0001, now + 1.0); }
      osc.connect(g); g.connect(ac.destination);
      osc.start(now); osc.stop(now + 1.05);
    } catch (e) { playBtn.textContent = '这个浏览器不能播放声音'; }
  });

  /* ========== 声速与回声测距 ========== */
  var MED = {
    air: { name: '空气', v: 340, src: '人', wall: '山崖', bg: '#f3f6fb' },
    water: { name: '水', v: 1500, src: '声呐', wall: '海底', bg: '#e3eef7' },
    steel: { name: '钢', v: 5200, src: '敲击', wall: '钢管另一端', bg: '#e6e8ee' }
  };
  var med = MED[st.m] ? st.m : 'air';
  var et = Math.round(L.num(st.e, 2, 0.1, 6) * 10) / 10;
  var echo = L.$('#echo'), echoAnim = null, pulse = -1;   // pulse: 0～1 表示一个来回的进度，-1 表示没在发声
  var EX0 = 64, EX1 = 352;

  function drawEcho() {
    echo.innerHTML = '';
    var defs = S('defs', {}, echo), cp = S('clipPath', { id: 'echo-clip' }, defs);
    S('rect', { x: EX0, y: 30, width: EX1 - EX0, height: 128 }, cp);
    var M = MED[med];
    S('rect', { x: 0, y: 0, width: 400, height: 200, rx: 14, fill: '#fbfaf7' }, echo);
    S('rect', { x: EX0, y: 30, width: EX1 - EX0, height: 128, fill: M.bg }, echo);
    S('text', { x: (EX0 + EX1) / 2, y: 22, 'font-size': 10, 'text-anchor': 'middle', fill: '#6b7385', text: '介质：' + M.name + (med === 'air' ? '（15 ℃）' : '') + '　声速约 ' + M.v + ' m/s' }, echo);
    // 声源
    S('rect', { x: 26, y: 78, width: 30, height: 32, rx: 6, fill: '#5a4097' }, echo);
    S('path', { d: 'M56 84l8 -8v36l-8 -8z', fill: '#7a6aa8' }, echo);
    S('text', { x: 41, y: 98, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#fff', 'font-weight': 600, text: M.src }, echo);
    // 障碍物
    S('rect', { x: EX1, y: 30, width: 18, height: 128, fill: '#b9b2c7' }, echo);
    for (var k = 0; k < 8; k++) S('line', { x1: EX1, y1: 40 + k * 16, x2: EX1 + 18, y2: 30 + k * 16, stroke: '#9b93ab' }, echo);
    S('text', { x: EX1 + 9, y: 172, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#6b7385', text: M.wall }, echo);
    // 去、回
    L.arrow(echo, EX0 + 20, 58, EX1 - 20, 58, { color: '#d08a2c', width: 1.4, head: 7, dash: '5 4' });
    S('text', { x: (EX0 + EX1) / 2, y: 52, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#a8641c', text: '去：用时 t ÷ 2' }, echo);
    L.arrow(echo, EX1 - 20, 134, EX0 + 20, 134, { color: '#5a4097', width: 1.4, head: 7, dash: '5 4' });
    S('text', { x: (EX0 + EX1) / 2, y: 150, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#5a4097', text: '回：用时 t ÷ 2' }, echo);
    // 声波脉冲
    if (pulse >= 0) {
      var g = S('g', { 'clip-path': 'url(#echo-clip)', fill: 'none', 'stroke-width': 2.2, 'stroke-linecap': 'round' }, echo);
      var go = pulse < 0.5, x = go ? EX0 + pulse * 2 * (EX1 - EX0) : EX1 - (pulse - 0.5) * 2 * (EX1 - EX0), dir = go ? 1 : -1;
      for (var j = 0; j < 3; j++) {
        var xx = x - dir * j * 9;
        S('path', { d: 'M' + xx.toFixed(1) + ' 74Q' + (xx + dir * 12).toFixed(1) + ' 94 ' + xx.toFixed(1) + ' 114', stroke: go ? '#d08a2c' : '#5a4097', opacity: 1 - j * 0.3 }, g);
      }
    }
    if (pulse >= 1) S('text', { x: 41, y: 70, 'font-size': 10, 'text-anchor': 'middle', fill: '#5a4097', 'font-weight': 700, text: '听到回声！' }, echo);
    // 距离标注
    L.arrow(echo, (EX0 + EX1) / 2 - 42, 186, EX0 + 2, 186, { color: '#6b7385', width: 1.2, head: 6 });
    L.arrow(echo, (EX0 + EX1) / 2 + 42, 186, EX1 - 2, 186, { color: '#6b7385', width: 1.2, head: 6 });
    S('text', { x: (EX0 + EX1) / 2, y: 190, 'font-size': 10.5, 'text-anchor': 'middle', fill: '#3b3548', 'font-weight': 600, text: 's = ' + L.fmt(dist2(), 0) + ' m' }, echo);
  }
  function dist2() { return MED[med].v * et / 2; }
  function echoReadout() {
    var M = MED[med], s = dist2();
    L.$('#echo-out').textContent = L.fmt(et, 1) + ' s';
    L.$('#echo-badge').textContent = M.name;
    L.$('#echo-v').innerHTML = M.v + '<small>m/s</small>';
    L.$('#echo-s').innerHTML = L.fmt(s, 0) + '<small>m</small>';
    L.$('#echo-calc').textContent = 's = vt ÷ 2 = ' + M.v + ' m/s × ' + L.fmt(et, 1) + ' s ÷ 2 = ' + L.fmt(s, 0) + ' m';
    var t;
    if (med === 'air') t = '声音一去一回，所以要<b>除以 2</b>。人耳要把回声和原声分开，两者至少要相隔 0.1 s，对应离障碍物至少 340 × 0.1 ÷ 2 = 17 m；再近，回声和原声混在一起，会让原声听起来更响亮。';
    else if (med === 'water') t = '声音在水里比在空气里快 4 倍多。轮船上的<b>声呐</b>向海底发出超声波，接收回波就能测出海有多深，还能发现鱼群和暗礁。';
    else t = '声音在钢里约 5200 m/s，是空气中的 15 倍多。在一根很长的钢管一端敲一下，另一端的人会听到<b>两次</b>响声：先到的是从钢管传来的，后到的是从空气传来的。';
    L.$('#echo-text').innerHTML = t;
    save();
  }
  function stopEcho() { if (echoAnim) { echoAnim.stop(); echoAnim = null; } }
  function updEcho() { stopEcho(); pulse = -1; drawEcho(); echoReadout(); }
  var echoIn = L.$('#echo-in');
  echoIn.value = et;
  L.bindRange(echoIn, function (v) { et = v; updEcho(); });
  L.chips(L.$('#med-chips'), [{ label: '空气 15 ℃', value: 'air' }, { label: '水', value: 'water' }, { label: '钢', value: 'steel' }], med, function (v) { med = v; updEcho(); });
  L.$('#echo-go').addEventListener('click', function () {
    stopEcho();
    try {
      if (audio()) {
        var now = ac.currentTime + 0.02;
        clap(now, 0.9);                 // 发出的声音
        clap(now + et, 0.35);           // 经过 t 秒，听到较轻的回声
      }
    } catch (e) {}
    if (L.REDUCED) { pulse = 1; drawEcho(); return; }
    var el = 0;
    pulse = 0;
    echoAnim = L.loop(function (dt) {
      el += dt; pulse = Math.min(1, el / et); drawEcho();
      if (pulse >= 1) { echoAnim = null; return false; }
    });
  });

  /* ========== 真空罩 ========== */
  var jar = L.$('#jar');
  var pump = Math.round(L.num(st.p, 0, 0, 100));
  var ringing = false, ringAnim = null, ph = 0, jarVisible = true;
  var dots = (function () {
    var out = [], seed = 7;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    while (out.length < 90) {
      var x = 116 + rnd() * 168, y = 34 + rnd() * 156;
      var inside = y >= 96 ? true : Math.pow((x - 200) / 84, 2) + Math.pow((y - 96) / 64, 2) <= 1;
      var nearBell = Math.abs(x - 200) < 30 && y > 96 && y < 196;
      if (inside && !nearBell) out.push([x, y, rnd() * 6.28]);
    }
    return out;
  })();
  function airFrac() { return 1 - pump / 100; }
  function bellWord() {
    if (!ringing) return '没在响';
    var a = airFrac();
    if (a >= 0.95) return '很响';
    if (a >= 0.7) return '较响';
    if (a >= 0.4) return '变小了';
    if (a >= 0.15) return '很小';
    if (a > 0) return '几乎听不到';
    return '听不到';
  }
  function drawJar() {
    jar.innerHTML = '';
    var defs = S('defs', {}, jar), cp = S('clipPath', { id: 'jar-clip' }, defs);
    S('rect', { x: 0, y: 0, width: 400, height: 230, rx: 14 }, cp);
    S('rect', { x: 0, y: 0, width: 400, height: 230, rx: 14, fill: '#fbfaf7' }, jar);
    var a = airFrac(), w = S('g', { 'clip-path': 'url(#jar-clip)' }, jar);
    // 声波圈（罩外的强弱跟剩余空气有关）
    if (ringing && a > 0) {
      for (var k = 0; k < 5; k++) {
        var r = 30 + ((ph * 40 + k * 36) % 180);
        S('circle', { cx: 200, cy: 128, r: r.toFixed(1), fill: 'none', stroke: '#d08a2c', 'stroke-width': 2, opacity: (a * (1 - r / 210)).toFixed(2) }, w);
      }
    }
    // 空气粒子
    var n = Math.round(dots.length * a);
    for (var i = 0; i < n; i++) {
      var d = dots[i], j = ringing ? 1.6 : 0.6;
      S('circle', { cx: (d[0] + Math.sin(ph * 5 + d[2]) * j).toFixed(1), cy: (d[1] + Math.cos(ph * 4 + d[2]) * j).toFixed(1), r: 2.4, fill: '#7f9fc0', opacity: 0.75 }, w);
    }
    // 电铃
    S('line', { x1: 200, y1: 196, x2: 200, y2: 150, stroke: '#8a8598', 'stroke-width': 3 }, w);
    S('path', { d: 'M178 150a22 22 0 0 1 44 0z', fill: '#d9b45a', stroke: '#a88531' }, w);
    var hx = ringing ? Math.sin(ph * 40) * 5 : 0;
    S('line', { x1: 236, y1: 176, x2: 214 + hx, y2: 146, stroke: '#5b6475', 'stroke-width': 2 }, w);
    S('circle', { cx: 214 + hx, cy: 144, r: 4.5, fill: '#5b6475' }, w);
    S('rect', { x: 230, y: 176, width: 14, height: 20, rx: 2, fill: '#cfc9da', stroke: '#a39cb3' }, w);
    // 玻璃罩、底盘、抽气管
    S('path', { d: 'M112 196V96a88 68 0 0 1 176 0V196', fill: 'rgba(223,233,243,0.35)', stroke: '#7f9fc0', 'stroke-width': 2.2 }, w);
    S('rect', { x: 92, y: 196, width: 216, height: 10, rx: 3, fill: '#a39cb3' }, w);
    S('path', { d: 'M300 206V214H340', fill: 'none', stroke: '#8a8598', 'stroke-width': 4 }, w);
    S('rect', { x: 340, y: 196, width: 50, height: 26, rx: 5, fill: '#e6e2ec', stroke: '#a39cb3' }, w);
    S('text', { x: 365, y: 213, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#5b6475', text: '抽气机' }, w);
    S('text', { x: 200, y: 20, 'font-size': 10, 'text-anchor': 'middle', fill: '#6b7385', text: '玻璃罩（蓝点表示空气）' }, w);
    S('text', { x: 20, y: 40, 'font-size': 10, fill: '#a8641c', text: ringing ? '铃声：' + bellWord() : '电铃没响' }, w);
  }
  function jarReadout() {
    var wd = bellWord();
    L.$('#pump-out').textContent = pump + '%';
    L.$('#air-stat').innerHTML = (100 - pump) + '<small>%</small>';
    L.$('#bell-stat').textContent = wd;
    L.$('#jar-badge').textContent = wd;
    var t;
    if (!ringing) t = '先按“让电铃响起来”，再拖动滑块抽气。';
    else if (pump === 0) t = '罩里充满空气，铃声通过空气、玻璃罩传到外面，听得很清楚。';
    else if (pump < 95) t = '抽走的空气越多，铃声越小。透过玻璃还能看见小锤一直在敲——发声体<b>仍在振动</b>，只是能传声的空气越来越少。把空气放回去，铃声又会变大。';
    else if (pump < 100) t = '空气几乎抽光，铃声已经很难听到。真实的抽气机抽不成绝对真空，罩里总会剩一点空气，所以还能隐约听到一点。';
    else t = '这是<b>推理</b>出来的理想情况：如果罩里一点空气都没有，就完全听不到铃声。由“空气越少声音越小”进一步推理，得出结论：<b>真空不能传声</b>。';
    L.$('#jar-text').innerHTML = t;
    save();
  }
  var pumpIn = L.$('#pump-in'), ringBtn = L.$('#ring-btn');
  pumpIn.value = pump;
  L.bindRange(pumpIn, function (v) { pump = v; drawJar(); jarReadout(); updBell(); });
  /* 电铃声：两个略带金属感的音叠在一起，每秒被小锤敲约 14 下；总音量跟着罩里剩下的空气变 */
  var bell = null;
  function bellVol() { return 0.22 * Math.pow(1 - pump / 100, 1.6); }
  function startBell() {
    if (!audio()) return;
    try {
      var master = ac.createGain(), trem = ac.createGain(), lfo = ac.createOscillator(), lfoAmp = ac.createGain();
      master.gain.value = 0;
      master.gain.setTargetAtTime(bellVol(), ac.currentTime, 0.05);
      trem.gain.value = 0.55;
      lfo.frequency.value = 14; lfoAmp.gain.value = 0.45;
      lfo.connect(lfoAmp); lfoAmp.connect(trem.gain);
      var oscs = [[1250, 'triangle', 1], [2680, 'sine', 0.35]].map(function (o) {
        var osc = ac.createOscillator(), g = ac.createGain();
        osc.type = o[1]; osc.frequency.value = o[0]; g.gain.value = o[2];
        osc.connect(g); g.connect(trem); osc.start(); return osc;
      });
      trem.connect(master); master.connect(ac.destination); lfo.start();
      bell = { master: master, stop: function () { var t = ac.currentTime; master.gain.setTargetAtTime(0, t, 0.04); setTimeout(function () { oscs.concat([lfo]).forEach(function (o) { try { o.stop(); } catch (e) {} }); master.disconnect(); }, 300); } };
    } catch (e) { bell = null; }
  }
  function stopBell() { if (bell) { bell.stop(); bell = null; } }
  function updBell() { if (bell) bell.master.gain.setTargetAtTime(bellVol(), ac.currentTime, 0.08); }
  function stopRing() { ringing = false; stopBell(); if (ringAnim) { ringAnim.stop(); ringAnim = null; } ringBtn.textContent = '让电铃响起来'; drawJar(); jarReadout(); }
  ringBtn.addEventListener('click', function () {
    if (ringing) { stopRing(); return; }
    ringing = true; ringBtn.textContent = '关掉电铃'; jarReadout();
    startBell();
    ringAnim = L.loop(function (dt) { ph += dt; if (jarVisible) drawJar(); });
  });
  /* 离开页面或切到后台时把铃声关掉，免得一直响 */
  document.addEventListener('visibilitychange', function () { if (document.hidden && ringing) stopRing(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { jarVisible = es[0].isIntersecting; }).observe(jar);

  function save() { L.setState({ f: fq, a: amp, d: dist, tn: tone, m: med, e: et, p: pump }); }

  drawWave();
  drawEcho(); echoReadout();
  drawJar(); jarReadout();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '调出一个“又尖又小声”的声音',
      desc: '在波形模型里调一调：音调要高，响度要小。',
      label: '在波形模型里操作',
      button: '检查这个声音',
      check: function () {
        var p = pitchLv(), l = loudLv();
        if (p !== '高' && l !== '小') return { ok: false, msg: '音调和响度都还不对。“尖”看频率，“小声”看振幅和距离。' };
        if (p !== '高') return { ok: false, msg: '响度已经够小了，但音调还不够高。把<b>频率</b>调大一些，让波更密。' };
        if (l !== '小') return { ok: false, msg: '音调够高了，但声音还不够小。把<b>振幅</b>调小，或者<b>站远一点</b>。' };
        return { ok: true, msg: '频率 ' + fq + ' Hz，波很密，音调高；传到耳边的振幅只有 ' + L.fmt(eff(), 2) + ' 格，响度小。音调和响度是两回事，可以分别调。' };
      }
    },
    {
      level: 'base',
      title: '声音是由什么产生的？',
      desc: '说话时摸一摸喉咙，敲鼓时在鼓面上撒些纸屑。',
      options: ['物体的振动', '空气的流动', '人耳的感觉', '物体的发热'],
      answer: 0,
      hint: '摸喉咙、看纸屑，你感觉到、看到的都是什么？',
      explain: '一切正在发声的物体都在<b>振动</b>，振动停止，发声也停止。空气是传声的介质，不是声音的来源；人耳只是接收声音。'
    },
    {
      level: 'base',
      title: '15 ℃ 时声音在空气中的传播速度约为',
      desc: '这个数要记住，计算题经常用。',
      options: ['340 m/s', '3×10⁸ m/s', '1500 m/s', '5200 m/s'],
      answer: 0,
      hint: '回声模型里选“空气 15 ℃”看看。',
      explain: '15 ℃ 空气中声速约 <b>340 m/s</b>。3×10⁸ m/s 是光在真空中的速度；1500 m/s 约是水中的声速；5200 m/s 是钢中的声速。'
    },
    {
      level: 'mid',
      title: '用声呐测海深',
      desc: '轮船上的声呐向海底发出超声波，经过 4 s 收到回波。在回声模型里把介质和时间设好，读出海深。',
      label: '在回声模型里操作',
      button: '检查我的设置',
      check: function () {
        if (med !== 'water') return { ok: false, msg: '超声波是在<b>海水</b>里传播的，介质要选“水”。' };
        if (Math.abs(et - 4) > 0.05) return { ok: false, msg: '介质对了。把时间 t 调到 <b>4 s</b>，这是一去一回的总时间。' };
        return { ok: true, msg: 's = vt ÷ 2 = 1500 m/s × 4 s ÷ 2 = <b>3000 m</b>。4 s 是声波到海底再回来的总时间，所以要除以 2。' };
      }
    },
    {
      level: 'mid',
      title: '在摩托车上安装消声器，是在哪里减弱噪声？',
      desc: '消声器装在排气管上，让排出的气流发出的声音变小。',
      options: ['在声源处', '在传播过程中', '在人耳处', '不能减弱噪声'],
      answer: 0,
      hint: '噪声是从哪里发出来的？消声器装在哪里？',
      explain: '排气管就是发出噪声的地方，消声器让它发出的声音变小，是<b>在声源处</b>减弱噪声。路边的隔音墙是在传播过程中减弱，戴耳塞是在人耳处减弱。'
    },
    {
      level: 'mid',
      title: '用真空罩实验推理出结论',
      desc: '让电铃响起来，把罩里的空气抽到几乎没有（抽气程度不少于 95%）。',
      label: '在真空罩模型里操作',
      button: '检查实验',
      check: function () {
        if (!ringing) return { ok: false, msg: '电铃还没响。先按“让电铃响起来”。' };
        if (pump < 95) return { ok: false, msg: '铃声' + bellWord() + '，再继续抽气，看看声音会怎样。' };
        return { ok: true, msg: '空气越少，铃声越小。实际抽不成绝对真空，但可以<b>推理</b>：如果完全没有空气，就听不到铃声——<b>真空不能传声</b>。' };
      }
    },
    {
      level: 'trap',
      title: '“引吭高歌”中的“高”，指的是声音的',
      desc: '“引吭”就是放开喉咙。',
      options: ['响度大', '音调高', '音色好', '频率高'],
      answer: 0,
      hint: '放开喉咙大声唱，是声音变尖了，还是变大了？',
      explain: '“引吭高歌”是放开喉咙<b>大声</b>唱，指<b>响度大</b>。“女高音”的高才是音调高（频率高）。生活用语里的“高、低”要看它说的是大小还是尖细。'
    },
    {
      level: 'trap',
      title: '能不能用超声波测出地球到月球的距离？',
      desc: '声呐能用超声波测海深，那测月球行不行？',
      options: ['不能，地月之间几乎是真空，声音无法传播', '能，超声波频率高、传得远', '能，只要声音足够响', '不能，因为超声波人耳听不见'],
      answer: 0,
      hint: '声音传播需要什么条件？',
      explain: '超声波也是声音，传播需要介质。地球和月球之间几乎是<b>真空</b>，声音传不过去，所以不能用。频率高、声音响都不能让声音穿过真空；人耳听不见也不是原因，仪器能接收超声波。实际测地月距离用的是激光。'
    }
  ]);
})();
