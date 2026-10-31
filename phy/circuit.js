/* 物理互动馆 · 第 15 课 电流和电路 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();
  var BG = '#fbfaf7', INK = '#3f3a4f', FLOW = '#e0a33a';

  /* —— 规范电路元件符号 —— */
  function mix(a, b, t) {
    var pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16), out = [];
    [16, 8, 0].forEach(function (s) { out.push(Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t)); });
    return 'rgb(' + out.join(',') + ')';
  }
  function wire(g, pts, color, w) {
    S('polyline', { points: pts.map(function (p) { return p[0] + ',' + p[1]; }).join(' '), fill: 'none', stroke: color || INK, 'stroke-width': w || 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, g);
  }
  function node(g, x, y) { S('circle', { cx: x, cy: y, r: 3.2, fill: INK }, g); }
  // 电池（竖放，正极在上）：长细线为正极，短粗线为负极
  function battery(g, x, y) {
    S('rect', { x: x - 4, y: y - 4, width: 8, height: 8, fill: BG }, g);
    S('line', { x1: x - 15, y1: y - 5, x2: x + 15, y2: y - 5, stroke: INK, 'stroke-width': 2 }, g);
    S('line', { x1: x - 8, y1: y + 5, x2: x + 8, y2: y + 5, stroke: INK, 'stroke-width': 5 }, g);
    S('text', { x: x + 21, y: y - 4, 'font-size': 12, 'font-weight': 700, fill: '#a4492b', text: '+' }, g);
    S('text', { x: x + 21, y: y + 14, 'font-size': 12, 'font-weight': 700, fill: '#3f6fa8', text: '−' }, g);
  }
  // 灯泡 ⊗
  function lamp(g, x, y, glow) {
    if (glow > 0) {
      S('circle', { cx: x, cy: y, r: 14 + 11 * glow, fill: '#ffd75e', opacity: 0.18 + 0.3 * glow }, g);
      for (var i = 0; i < 8; i++) {
        var a = i * Math.PI / 4, r0 = 16, r1 = 16 + 8 * glow;
        S('line', { x1: x + r0 * Math.cos(a), y1: y + r0 * Math.sin(a), x2: x + r1 * Math.cos(a), y2: y + r1 * Math.sin(a), stroke: '#e8b52a', 'stroke-width': 1.6, 'stroke-linecap': 'round' }, g);
      }
    }
    S('circle', { cx: x, cy: y, r: 11, fill: glow > 0 ? mix('#fff6cf', '#ffd75e', glow) : '#fff', stroke: INK, 'stroke-width': 2 }, g);
    var d = 7.8;
    S('path', { d: 'M' + (x - d) + ' ' + (y - d) + 'L' + (x + d) + ' ' + (y + d) + 'M' + (x + d) + ' ' + (y - d) + 'L' + (x - d) + ' ' + (y + d), stroke: INK, 'stroke-width': 1.6 }, g);
  }
  function socket(g, x, y) {
    S('circle', { cx: x, cy: y, r: 11, fill: BG, stroke: '#a39cb3', 'stroke-width': 1.6, 'stroke-dasharray': '3 3' }, g);
  }
  // 开关：两个接线点 + 闸刀
  function switchH(g, x, y, closed) {
    S('rect', { x: x - 14, y: y - 3, width: 28, height: 6, fill: BG }, g);
    S('line', { x1: x - 15, y1: y, x2: closed ? x + 15 : x + 11, y2: closed ? y : y - 14, stroke: INK, 'stroke-width': 2.2, 'stroke-linecap': 'round' }, g);
    S('circle', { cx: x - 15, cy: y, r: 2.6, fill: '#fff', stroke: INK, 'stroke-width': 1.6 }, g);
    S('circle', { cx: x + 15, cy: y, r: 2.6, fill: '#fff', stroke: INK, 'stroke-width': 1.6 }, g);
  }
  function switchV(g, x, y, closed) {
    S('rect', { x: x - 3, y: y - 14, width: 6, height: 28, fill: BG }, g);
    S('line', { x1: x, y1: y - 15, x2: closed ? x : x + 14, y2: closed ? y + 15 : y + 11, stroke: INK, 'stroke-width': 2.2, 'stroke-linecap': 'round' }, g);
    S('circle', { cx: x, cy: y - 15, r: 2.6, fill: '#fff', stroke: INK, 'stroke-width': 1.6 }, g);
    S('circle', { cx: x, cy: y + 15, r: 2.6, fill: '#fff', stroke: INK, 'stroke-width': 1.6 }, g);
  }
  // 电表：圆圈里写 A 或 V
  function meterSym(g, x, y, letter) {
    S('circle', { cx: x, cy: y, r: 11, fill: '#fff', stroke: INK, 'stroke-width': 2 }, g);
    S('text', { x: x, y: y + 4.5, 'font-size': 13, 'font-weight': 700, 'text-anchor': 'middle', fill: INK, text: letter }, g);
  }
  // 电流方向的小三角
  function tri(g, x, y, dir, color) {
    var p = { r: [[4, 0], [-3, -3.5], [-3, 3.5]], l: [[-4, 0], [3, -3.5], [3, 3.5]], d: [[0, 4], [-3.5, -3], [3.5, -3]], u: [[0, -4], [-3.5, 3], [3.5, 3]] }[dir];
    S('path', { d: 'M' + p.map(function (q) { return (x + q[0]) + ' ' + (y + q[1]); }).join('L') + 'Z', fill: color || '#c98a1c' }, g);
  }
  function label(g, x, y, t, anchor, o) {
    o = o || {};
    S('text', { x: x, y: y, 'font-size': o.fs || 10.5, 'text-anchor': anchor || 'middle', fill: o.fill || '#4f4862', 'font-weight': o.fw || 600, text: t }, g);
  }
  function clip(svgEl, id, w, h) {
    var d = S('defs', {}, svgEl);
    S('rect', { x: 0, y: 0, width: w, height: h, rx: 14 }, S('clipPath', { id: id }, d));
    return d;
  }
  // 沿折线走 s 的位置
  function plen(pts) { var s = 0; for (var i = 1; i < pts.length; i++) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return s; }
  function along(pts, s) {
    for (var i = 1; i < pts.length; i++) {
      var l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      if (s <= l) { var t = s / l; return [L.lerp(pts[i - 1][0], pts[i][0], t), L.lerp(pts[i - 1][1], pts[i][1], t)]; }
      s -= l;
    }
    return pts[pts.length - 1];
  }

  /* ========== 串联 / 并联电路 ========== */
  var circ = L.$('#circ');
  var mode = st.m === 'p' ? 'p' : 's';
  var s1 = st.s1 !== '0', s2 = st.s2 === '1', pulled = st.pl === '1', shorted = st.sh === '1';
  var cdefs = clip(circ, 'circ-clip', 400, 260);
  var PATH = {
    loop: [[50, 125], [50, 50], [350, 50], [350, 210], [50, 210], [50, 135]],
    m1: [[50, 125], [50, 50], [230, 50]],
    b1: [[230, 50], [230, 210]],
    b2: [[230, 50], [350, 50], [350, 210], [230, 210]],
    m2: [[230, 210], [50, 210], [50, 135]],
    sh: [[50, 125], [50, 92], [14, 92], [14, 168], [50, 168], [50, 135]]
  };
  function cstate() {
    var o = { l1: false, l2: false, flows: [] };
    if (shorted) { o.flows.push([PATH.sh, 5, '#d0572f']); return o; }
    if (mode === 's') {
      var on = s1 && s2 && !pulled;
      o.l1 = o.l2 = on;
      if (on) o.flows.push([PATH.loop, 0.5]);
    } else {
      o.l1 = s1; o.l2 = s1 && s2 && !pulled;
      var I = (o.l1 ? 1 : 0) + (o.l2 ? 1 : 0);
      if (I) { o.flows.push([PATH.m1, I]); o.flows.push([PATH.m2, I]); }
      if (o.l1) o.flows.push([PATH.b1, 1]);
      if (o.l2) o.flows.push([PATH.b2, 1]);
    }
    return o;
  }
  var dotsG = null, T = 0;
  function hit(g, key, aria, x, y, w, h) {
    var hg = S('g', { class: 'svg-hit', tabindex: 0, role: 'button', 'aria-label': aria, 'data-k': key }, g);
    S('rect', { x: x, y: y, width: w, height: h, rx: 6, fill: 'transparent' }, hg);
    hg.addEventListener('click', function () { toggle(key); });
    hg.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(key, true); } });
  }
  function drawCirc() {
    circ.innerHTML = ''; circ.appendChild(cdefs);
    S('rect', { x: 0, y: 0, width: 400, height: 260, rx: 14, fill: BG }, circ);
    var g = S('g', { 'clip-path': 'url(#circ-clip)' }, circ);
    var o = cstate(), glow = mode === 's' ? 0.4 : 1;
    wire(g, [[50, 125], [50, 50], [350, 50], [350, 210], [50, 210], [50, 135]]);
    if (mode === 'p') { wire(g, [[230, 50], [230, 210]]); node(g, 230, 50); node(g, 230, 210); }
    if (shorted) {
      S('circle', { cx: 50, cy: 130, r: 26, fill: '#f08a5d', opacity: 0.35 }, g);
      wire(g, [[50, 92], [14, 92], [14, 168], [50, 168]], '#c2603f', 2.6);
      node(g, 50, 92); node(g, 50, 168);
    }
    dotsG = S('g', {}, g);
    battery(g, 50, 130);
    label(g, 92, 134, '电源', 'start', { fs: 10, fw: 400, fill: '#7a7488' });
    switchH(g, 130, 50, s1);
    label(g, 130, 74, 'S1');
    hit(g, 's1', '开关 S1，当前' + (s1 ? '闭合' : '断开'), 108, 26, 44, 36);
    if (mode === 's') {
      lamp(g, 250, 50, o.l1 ? glow : 0); label(g, 250, 80, 'L1');
      if (pulled) socket(g, 350, 130); else lamp(g, 350, 130, o.l2 ? glow : 0);
      label(g, 372, 134, 'L2', 'start');
      switchH(g, 200, 210, s2); label(g, 200, 234, 'S2');
      hit(g, 's2', '开关 S2，当前' + (s2 ? '闭合' : '断开'), 178, 186, 44, 36);
      if (o.flows.length) { tri(g, 190, 50, 'r'); tri(g, 350, 180, 'd'); tri(g, 120, 210, 'l'); tri(g, 50, 80, 'u'); }
    } else {
      label(g, 88, 42, '干路', 'middle', { fs: 9.5, fw: 400, fill: '#7a7488' });
      lamp(g, 230, 130, o.l1 ? glow : 0); label(g, 250, 134, 'L1', 'start');
      switchV(g, 350, 90, s2); label(g, 370, 94, 'S2', 'start');
      hit(g, 's2', '开关 S2，当前' + (s2 ? '闭合' : '断开'), 330, 68, 44, 44);
      if (pulled) socket(g, 350, 160); else lamp(g, 350, 160, o.l2 ? glow : 0);
      label(g, 370, 164, 'L2', 'start');
      label(g, 290, 42, '支路 2', 'middle', { fs: 9.5, fw: 400, fill: '#7a7488' });
      label(g, 222, 178, '支路 1', 'end', { fs: 9.5, fw: 400, fill: '#7a7488' });
      if (o.l1 || o.l2) { tri(g, 185, 50, 'r'); tri(g, 140, 210, 'l'); tri(g, 50, 80, 'u'); }
      if (o.l1) tri(g, 230, 175, 'd');
      if (o.l2) { tri(g, 290, 50, 'r'); tri(g, 350, 192, 'd'); tri(g, 290, 210, 'l'); }
    }
    if (pulled) label(g, mode === 's' ? 372 : 372, mode === 's' ? 148 : 178, '已拧下', 'start', { fs: 9, fw: 400, fill: '#a4492b' });
    if (shorted) {
      tri(g, 14, 130, 'd', '#c2603f');
      S('rect', { x: 84, y: 104, width: 130, height: 54, rx: 9, fill: '#fbeee6', stroke: '#e0b6a6' }, g);
      label(g, 149, 124, '电源短路！', 'middle', { fs: 12, fw: 700, fill: '#a4492b' });
      label(g, 149, 141, '电流很大，会烧坏电源', 'middle', { fs: 9.5, fw: 400, fill: '#8d4a32' });
      label(g, 149, 153, '甚至引起火灾', 'middle', { fs: 9.5, fw: 400, fill: '#8d4a32' });
    }
    drawDots();
    circReadout(o);
  }
  function drawDots() {
    if (!dotsG) return;
    dotsG.innerHTML = '';
    cstate().flows.forEach(function (f) {
      var len = plen(f[0]), gap = 22, off = (T * 34 * f[1]) % gap;
      for (var s = off; s < len; s += gap) {
        var p = along(f[0], s);
        S('circle', { cx: p[0], cy: p[1], r: 2.6, fill: f[2] || FLOW }, dotsG);
      }
    });
  }
  function circReadout(o) {
    L.$('#circ-badge').textContent = mode === 's' ? '串联' : '并联';
    var lit = mode === 's' ? '亮（较暗）' : '亮';
    L.$('#l1-out').textContent = o.l1 ? lit : '不亮';
    L.$('#l2-out').textContent = pulled ? '已拧下' : (o.l2 ? lit : '不亮');
    L.$('#state-out').textContent = shorted ? '电源短路（危险）' : (o.l1 || o.l2) ? '通路' : '断路';
    L.$('#path-out').textContent = shorted ? '正极 → 短路导线 → 负极，几乎不经过灯'
      : mode === 's' ? '正极 → S1 → L1 → L2 → S2 → 负极，只有一条路'
      : '正极 → S1 → 分成两路（L1 ／ S2 → L2）→ 汇合 → 负极';
    var t;
    if (shorted) t = '导线把电源两极直接连起来，电流几乎全从这根导线走，<b>两盏灯都不亮</b>，电源里的电流却非常大，会让电源和导线发热，严重时烧坏电源、引发火灾。<b>绝对不允许这样接！</b>点“撤掉短路导线”恢复。';
    else if (mode === 's') {
      if (o.l1) t = '两个开关都闭合，电流只有一条路：从正极出发依次经过 L1、L2 回到负极，两盏灯一起亮。两盏相同的灯串联时，比各自单独接在电源上暗。';
      else if (pulled) t = '把 L2 拧下来，唯一的一条路就断了，<b>L1 也跟着灭</b>。串联电路里用电器<b>相互影响</b>。';
      else t = '串联电路只有一条路，<b>任何一个开关断开</b>，整条路就断了，两盏灯都不亮。S1 在上面、S2 在下面，位置不同作用却一样：串联电路中<b>开关的位置不影响它的控制作用</b>。';
    } else {
      if (!s1) t = 'S1 在<b>干路</b>上，它一断开，两条支路都没有电流，两盏灯全灭：干路开关控制整个电路。';
      else if (!o.l2) t = 'L2 所在的支路' + (pulled ? '灯被拧下了' : '开关 S2 断开了') + '，可 <b>L1 照样亮</b>。并联电路各支路<b>互不影响</b>，家里的电灯、冰箱、电视就是这样并联的。';
      else t = '电流从正极出发，到分支点分成两股，分别经过 L1 和 L2，再汇合回到负极。仔细看：<b>干路上的小点跑得比支路快</b>，因为干路电流等于两条支路电流之和。';
    }
    L.$('#circ-text').innerHTML = t;
    L.$$('#mode-table tbody tr').forEach(function (tr) { tr.classList.toggle('on', tr.dataset.r === mode); });
    btn('#s1-btn', s1, s1 ? 'S1：闭合' : 'S1：断开');
    btn('#s2-btn', s2, s2 ? 'S2：闭合' : 'S2：断开');
    btn('#pull-btn', pulled, pulled ? '把 L2 装回去' : '拧下 L2');
    btn('#short-btn', shorted, shorted ? '撤掉短路导线' : '演示：导线直接接电源两极');
    save();
  }
  function btn(sel, on, text) { var b = L.$(sel); b.textContent = text; b.setAttribute('aria-pressed', String(on)); }
  function toggle(key, refocus) {
    if (key === 's1') s1 = !s1;
    if (key === 's2') s2 = !s2;
    if (key === 'pl') pulled = !pulled;
    if (key === 'sh') shorted = !shorted;
    drawCirc();
    if (refocus) { var el = circ.querySelector('[data-k="' + key + '"]'); if (el) el.focus(); }
  }
  L.$('#s1-btn').addEventListener('click', function () { toggle('s1'); });
  L.$('#s2-btn').addEventListener('click', function () { toggle('s2'); });
  L.$('#pull-btn').addEventListener('click', function () { toggle('pl'); });
  L.$('#short-btn').addEventListener('click', function () { toggle('sh'); });
  L.chips(L.$('#mode-chips'), [{ label: '串联', value: 's' }, { label: '并联', value: 'p' }], mode, function (v) { mode = v; drawCirc(); });

  // 小点动画：页面不可见或电路图不在视野里时不重绘
  var inView = true;
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { inView = es[0].isIntersecting; }).observe(circ);
  L.loop(function (dt) {
    if (document.hidden || !inView) return;
    T += dt; drawDots();
  });

  /* ========== 电流表测 A、B、C 三处 ========== */
  var meter = L.$('#meter');
  var mdefs = clip(meter, 'meter-clip', 400, 240);
  var SPEC = { a: ['甲', 5], b: ['乙', 10], c: ['丙', 15] };
  var U0 = 3;
  var mmode = st.mm === 'p' ? 'p' : 's';
  var pos = ['A', 'B', 'C'].indexOf(st.ap) >= 0 ? st.ap : 'A';
  var r1k = SPEC[st.r1] ? st.r1 : 'a', r2k = SPEC[st.r2] ? st.r2 : 'b';
  var range = st.rg === '3' ? 3 : 0.6;
  var rev = st.rv === '1';
  var rec = {};
  // 每个测量点：坐标、方向（电流流向）、说明
  var PTS = {
    s: { A: [80, 40, 'r', 'L1 之前'], B: [200, 40, 'r', 'L1、L2 之间'], C: [160, 200, 'l', 'L2 之后'] },
    p: { A: [90, 40, 'r', '干路'], B: [150, 155, 'd', 'L1 支路'], C: [250, 155, 'd', 'L2 支路'] }
  };
  function currents() {
    var R1 = SPEC[r1k][1], R2 = SPEC[r2k][1];
    if (mmode === 's') { var I = U0 / (R1 + R2); return { A: I, B: I, C: I, I1: I, I2: I }; }
    var I1 = U0 / R1, I2 = U0 / R2;
    return { A: I1 + I2, B: I1, C: I2, I1: I1, I2: I2 };
  }
  function meterStatus() {
    var I = currents()[pos];
    return { I: I, rev: rev, over: !rev && I > range + 1e-9, coarse: !rev && range === 3 && I <= 0.6 + 1e-9 };
  }
  function drawMeter() {
    meter.innerHTML = ''; meter.appendChild(mdefs);
    S('rect', { x: 0, y: 0, width: 400, height: 240, rx: 14, fill: BG }, meter);
    var g = S('g', { 'clip-path': 'url(#meter-clip)' }, meter);
    var c = currents(), R1 = SPEC[r1k][1], R2 = SPEC[r2k][1];
    var g1 = Math.sqrt(Math.min(1, c.I1 * c.I1 * R1 / 1.8)), g2 = Math.sqrt(Math.min(1, c.I2 * c.I2 * R2 / 1.8));
    wire(g, [[30, 115], [30, 40], [250, 40], [250, 200], [30, 200], [30, 125]]);
    if (mmode === 'p') { wire(g, [[150, 40], [150, 200]]); node(g, 150, 40); node(g, 150, 200); }
    battery(g, 30, 120);
    label(g, 56, 150, '3 V', 'start', { fs: 9.5, fw: 400, fill: '#7a7488' });
    switchH(g, 90, 200, true);
    label(g, 90, 222, 'S', 'middle', { fs: 10 });
    if (mmode === 's') {
      lamp(g, 140, 40, g1); label(g, 140, 68, 'L1（' + SPEC[r1k][0] + '）', 'middle', { fs: 10 });
      lamp(g, 250, 120, g2); label(g, 234, 124, 'L2（' + SPEC[r2k][0] + '）', 'end', { fs: 10 });
    } else {
      lamp(g, 150, 95, g1); label(g, 166, 99, 'L1（' + SPEC[r1k][0] + '）', 'start', { fs: 10 });
      lamp(g, 250, 95, g2); label(g, 234, 80, 'L2（' + SPEC[r2k][0] + '）', 'end', { fs: 10 });
    }
    var P = PTS[mmode];
    Object.keys(P).forEach(function (k) {
      var p = P[k], x = p[0], y = p[1], horiz = p[2] === 'r' || p[2] === 'l';
      var on = k === pos;
      var lx = horiz ? x : x - (on ? 16 : 10), ly = horiz ? (y === 200 ? y + (on ? 28 : 18) : y - (on ? 16 : 9)) : y + 4;
      if (on) {
        meterSym(g, x, y, 'A');
        var plus, minus;
        if (horiz) { var sgn = p[2] === 'r' ? -1 : 1; plus = [x + sgn * 15, y - 12]; minus = [x - sgn * 15, y - 12]; }
        else { plus = [x + 16, y - 7]; minus = [x + 16, y + 15]; }
        if (rev) { var tmp = plus; plus = minus; minus = tmp; }
        label(g, plus[0], plus[1], '+', 'middle', { fs: 11, fw: 700, fill: '#a4492b' });
        label(g, minus[0], minus[1], '−', 'middle', { fs: 11, fw: 700, fill: '#3f6fa8' });
      } else {
        S('circle', { cx: x, cy: y, r: 3, fill: '#5a4097' }, g);
      }
      label(g, lx, ly, k, horiz ? 'middle' : 'end', { fs: 11, fw: 700, fill: '#5a4097' });
    });
    // 电流方向
    tri(g, 30, 70, 'u'); tri(g, 115, 40, 'r');
    if (mmode === 's') { tri(g, 250, 165, 'd'); tri(g, 125, 200, 'l'); }
    else { tri(g, 150, 125, 'd'); tri(g, 210, 40, 'r'); tri(g, 250, 125, 'd'); tri(g, 120, 200, 'l'); }

    // 表盘
    var ms = meterStatus(), MX = 336, MY = 176, R = 58;
    S('rect', { x: 280, y: 70, width: 112, height: 146, rx: 12, fill: '#fff', stroke: '#d6d1df' }, g);
    label(g, MX, 88, '电流表 · 量程 0～' + range + ' A', 'middle', { fs: 9.5, fw: 600, fill: '#5a4097' });
    for (var j = 0; j <= 30; j++) {
      var a = (-50 + j * 100 / 30) * Math.PI / 180, len = j % 5 === 0 ? 8 : 4;
      S('line', { x1: MX + R * Math.sin(a), y1: MY - R * Math.cos(a), x2: MX + (R - len) * Math.sin(a), y2: MY - (R - len) * Math.cos(a), stroke: '#6f6884', 'stroke-width': j % 5 === 0 ? 1.4 : 0.8 }, g);
      if (j % 10 === 0) {
        S('text', { x: MX + 67 * Math.sin(a), y: MY - 67 * Math.cos(a) + 3, 'font-size': 9.5, 'text-anchor': 'middle', fill: range === 3 ? '#3f3a4f' : '#c3bfcb', 'font-weight': range === 3 ? 700 : 400, text: String(j / 10) }, g);
        S('text', { x: MX + 42 * Math.sin(a), y: MY - 42 * Math.cos(a) + 3, 'font-size': 9, 'text-anchor': 'middle', fill: range === 0.6 ? '#3f3a4f' : '#c3bfcb', 'font-weight': range === 0.6 ? 700 : 400, text: L.fmt(j / 50, 1) }, g);
      }
    }
    S('text', { x: MX - 34, y: MY - 2, 'font-size': 12, 'font-weight': 700, 'text-anchor': 'middle', fill: '#8a8598', text: 'A' }, g);
    var deg = ms.rev ? -56 : ms.over ? 54 : -50 + 100 * ms.I / range;
    var na = deg * Math.PI / 180, bad = ms.rev || ms.over;
    S('line', { x1: MX, y1: MY, x2: MX + 54 * Math.sin(na), y2: MY - 54 * Math.cos(na), stroke: bad ? '#c2603f' : '#3f3a4f', 'stroke-width': 1.8, 'stroke-linecap': 'round' }, g);
    S('circle', { cx: MX, cy: MY, r: 3.5, fill: '#3f3a4f' }, g);
    [['−', MX - 28, true], ['0.6', MX, range === 0.6], ['3', MX + 28, range === 3]].forEach(function (k) {
      S('circle', { cx: k[1], cy: 204, r: 4.5, fill: k[2] ? '#e7b04a' : '#d6d1df', stroke: '#8d86a0' }, g);
      label(g, k[1], 195, k[0], 'middle', { fs: 9, fw: 600, fill: '#6d6876' });
    });
    if (bad) label(g, MX, 150, ms.rev ? '反偏！' : '超量程！', 'middle', { fs: 11, fw: 700, fill: '#c2603f' });
    meterReadout(ms, c);
  }
  function meterReadout(ms, c) {
    if (!ms.rev && !ms.over) rec[pos] = ms.I;
    L.$('#m-badge').textContent = mmode === 's' ? '串联' : '并联';
    L.$('#reading-out').innerHTML = ms.rev ? '反偏' : ms.over ? '超量程' : L.fmt(ms.I, 2) + '<small>A</small>';
    L.$('#what-out').textContent = mmode === 's' ? PTS.s[pos][3] + '的电流' : (pos === 'A' ? '干路电流' : '通过 ' + (pos === 'B' ? 'L1' : 'L2') + ' 的电流');
    L.$('#rec-body').innerHTML = ['A', 'B', 'C'].map(function (k) {
      return '<tr' + (k === pos ? ' class="on"' : '') + '><td>' + k + ' 点（' + PTS[mmode][k][3] + '）</td><td class="n">' + (rec[k] === undefined ? '还没测' : L.fmt(rec[k], 2) + ' A') + '</td></tr>';
    }).join('');
    var t, n = Object.keys(rec).length;
    if (ms.rev) t = '指针<b>向左反偏</b>了：电流从“−”接线柱流了进去。电流表必须让电流<b>从“+”接线柱流入、从“−”流出</b>，把两根线对调。';
    else if (ms.over) t = '电流有 ' + L.fmt(ms.I, 2) + ' A，超过了 0.6 A，指针打到头，可能损坏电流表。要换用 <b>0～3 A</b> 量程。实际操作时，不知道电流多大就先用大量程<b>试触</b>。';
    else if (n === 3) {
      if (mmode === 's') t = 'I<sub>A</sub> = I<sub>B</sub> = I<sub>C</sub> = ' + L.fmt(c.A, 2) + ' A：串联电路中<b>电流处处相等</b>。换一换灯的规格，各处电流会一起变，但仍然相等。';
      else t = 'I<sub>A</sub> = ' + L.fmt(c.A, 2) + ' A，I<sub>B</sub> + I<sub>C</sub> = ' + L.fmt(c.B, 2) + ' A + ' + L.fmt(c.C, 2) + ' A = ' + L.fmt(c.B + c.C, 2) + ' A：并联电路中<b>干路电流等于各支路电流之和</b>。' + (r1k === r2k ? '两盏灯规格相同，所以两条支路电流相等；换成不同规格再试试。' : '两盏灯规格不同，支路电流也不同。');
    }
    else t = '已经测了 ' + n + ' 处，把电流表换到其他点继续测（换连接方式或灯的规格后要重新测）。电流表要<b>串联</b>在电路里，所以它“插”在导线中间。';
    if (ms.coarse) t += ' 现在用的是 0～3 A 量程，分度值是 0.1 A，读 ' + L.fmt(ms.I, 2) + ' A 不够准，换 0～0.6 A 量程（分度值 0.02 A）更精确。';
    L.$('#meter-text').innerHTML = t;
    btn('#rev-btn', rev, rev ? '改回“正进负出”' : '把接线柱接反');
    save();
  }
  function resetRec() { rec = {}; }
  L.chips(L.$('#mmode-chips'), [{ label: '串联', value: 's' }, { label: '并联', value: 'p' }], mmode, function (v) { mmode = v; resetRec(); drawMeter(); });
  L.chips(L.$('#pos-chips'), [{ label: 'A 点', value: 'A' }, { label: 'B 点', value: 'B' }, { label: 'C 点', value: 'C' }], pos, function (v) { pos = v; drawMeter(); });
  var specItems = Object.keys(SPEC).map(function (k) { return { label: SPEC[k][0], value: k }; });
  L.chips(L.$('#r1-chips'), specItems, r1k, function (v) { r1k = v; resetRec(); drawMeter(); });
  L.chips(L.$('#r2-chips'), specItems, r2k, function (v) { r2k = v; resetRec(); drawMeter(); });
  L.chips(L.$('#range-chips'), [{ label: '0～0.6 A', value: '0.6' }, { label: '0～3 A', value: '3' }], String(range), function (v) { range = +v; drawMeter(); });
  L.$('#rev-btn').addEventListener('click', function () { rev = !rev; drawMeter(); });

  /* ========== 两种电荷与验电器 ========== */
  var chg = L.$('#charge');
  var hdefs = clip(chg, 'charge-clip', 400, 230);
  var rod = st.rod === 'rubber' ? 'rubber' : 'glass';
  var dist = L.num(st.d, 30, 0, 100);
  var esq = Math.round(L.num(st.q, 0, -3, 3));
  var touching = false, esMsg = '', touchTimer = null;
  var distIn = L.$('#dist-in');
  distIn.value = dist;
  function rodSign() { return rod === 'glass' ? 1 : -1; }
  function signText(g, x, y, s, light) {
    S('text', { x: x, y: y + 4, 'font-size': 12, 'font-weight': 700, 'text-anchor': 'middle', fill: s > 0 ? '#c2603f' : (light ? '#cfe0ff' : '#3f6fa8'), text: s > 0 ? '+' : '−' }, g);
  }
  function drawCharge() {
    chg.innerHTML = ''; chg.appendChild(hdefs);
    S('rect', { x: 0, y: 0, width: 400, height: 230, rx: 14, fill: BG }, chg);
    var g = S('g', { 'clip-path': 'url(#charge-clip)' }, chg), i;
    S('line', { x1: 236, y1: 14, x2: 236, y2: 216, stroke: '#e2dfe8', 'stroke-dasharray': '4 4' }, g);
    label(g, 14, 22, '俯视图：用细线吊起的玻璃棒', 'start', { fs: 10.5, fill: '#5a4097' });
    label(g, 14, 36, '（已用丝绸摩擦过，带正电）', 'start', { fs: 9.5, fw: 400, fill: '#7a7488' });
    // 吊着的玻璃棒
    var PX = 96, PY = 108, half = 74, sgn = rodSign(), same = sgn === 1;
    var gap = L.lerp(110, 26, dist / 100), k = Math.pow(26 / gap, 2);
    var phi = (same ? -26 : 10) * k * Math.PI / 180;
    var ca = Math.cos(phi), sa = Math.sin(phi);
    var x1 = PX - half * ca, y1 = PY - half * sa, x2 = PX + half * ca, y2 = PY + half * sa;
    S('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: '#9fb8cc', 'stroke-width': 11, 'stroke-linecap': 'round' }, g);
    S('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: '#e3eef6', 'stroke-width': 8, 'stroke-linecap': 'round' }, g);
    [-58, -34, 30, 50, 68].forEach(function (d) { signText(g, PX + d * ca, PY + d * sa - 1, 1); });
    S('circle', { cx: PX, cy: PY, r: 4, fill: '#fff', stroke: '#6f6884', 'stroke-width': 1.6 }, g);
    S('circle', { cx: PX, cy: PY, r: 1.4, fill: '#6f6884' }, g);
    label(g, PX, PY - 12, '悬线', 'middle', { fs: 9, fw: 400, fill: '#7a7488' });
    // 手里的棒
    var RX = 166, tipY = PY + gap;
    S('rect', { x: RX - 7, y: tipY, width: 14, height: 160, rx: 7, fill: rod === 'glass' ? '#e3eef6' : '#4a4452', stroke: rod === 'glass' ? '#9fb8cc' : '#2f2a36', 'stroke-width': 1.5 }, g);
    for (i = 0; i < 3; i++) signText(g, RX, tipY + 12 + i * 16, sgn, true);
    var ly = Math.min(tipY + 26, 200);
    label(g, RX + 14, ly, rod === 'glass' ? '玻璃棒' : '橡胶棒', 'start', { fs: 10, fw: 600, fill: '#4f4862' });
    label(g, RX + 14, ly + 13, '（手持）', 'start', { fs: 9, fw: 400, fill: '#7a7488' });
    // 作用力箭头
    var fl = 6 + 22 * k;
    if (fl > 8) {
      var ax = x2 - 22;
      if (same) L.arrow(g, ax, y2 - 6, ax, y2 - 6 - fl, { color: '#c2603f', width: 2, head: 7 });
      else L.arrow(g, ax, y2 + 6, ax, y2 + 6 + fl, { color: '#3f8a6a', width: 2, head: 7 });
      label(g, ax - 6, same ? y2 - 10 : y2 + 20, same ? '排斥' : '吸引', 'end', { fs: 10, fw: 700, fill: same ? '#c2603f' : '#3f8a6a' });
    }
    // 验电器
    var EX = 318;
    label(g, EX, 22, '验电器', 'middle', { fs: 10.5, fill: '#5a4097' });
    S('rect', { x: 268, y: 96, width: 100, height: 112, rx: 14, fill: '#eef4f8', stroke: '#a9c0d0', 'stroke-width': 1.5 }, g);
    S('rect', { x: 300, y: 90, width: 36, height: 12, rx: 3, fill: '#7a6f62' }, g);
    S('line', { x1: EX, y1: 66, x2: EX, y2: 150, stroke: '#9a9180', 'stroke-width': 3 }, g);
    S('circle', { cx: EX, cy: 58, r: 10, fill: '#ddd6c4', stroke: '#9a9180', 'stroke-width': 1.5 }, g);
    var al = (esq === 0 ? 2 : 8 + 9 * Math.abs(esq)) * Math.PI / 180, FL = 42;
    [-1, 1].forEach(function (s) {
      var tx = EX + s * FL * Math.sin(al), ty = 150 + FL * Math.cos(al);
      S('line', { x1: EX, y1: 150, x2: tx, y2: ty, stroke: '#d4a72c', 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
      if (esq !== 0) signText(g, EX + s * (FL * 0.7 * Math.sin(al) + 9), 150 + FL * 0.7 * Math.cos(al), esq);
    });
    if (esq !== 0) {
      for (i = 0; i < Math.abs(esq); i++) signText(g, EX - 14 + i * 14, 40, esq);
    }
    label(g, EX, 224, esq === 0 ? '箔片合拢' : '箔片张开约 ' + Math.round(2 * (8 + 9 * Math.abs(esq))) + '°', 'middle', { fs: 9.5, fw: 400, fill: '#7a7488' });
    if (touching) {
      S('line', { x1: 380, y1: 18, x2: EX + 8, y2: 50, stroke: rod === 'glass' ? '#9fb8cc' : '#2f2a36', 'stroke-width': 9, 'stroke-linecap': 'round' }, g);
      S('line', { x1: 380, y1: 18, x2: EX + 8, y2: 50, stroke: rod === 'glass' ? '#e3eef6' : '#4a4452', 'stroke-width': 6, 'stroke-linecap': 'round' }, g);
    }
    chargeReadout(same, k);
  }
  function chargeReadout(same, k) {
    L.$('#dist-out').textContent = dist < 25 ? '较远' : dist < 60 ? '中等' : dist < 90 ? '较近' : '很近';
    L.$('#ch-badge').textContent = same ? '同种电荷 · 相互排斥' : '异种电荷 · 相互吸引';
    L.$('#rod-out').textContent = rod === 'glass' ? '正电' : '负电';
    L.$('#hang-out').textContent = '正电';
    L.$('#es-out').textContent = esq === 0 ? '不带电，箔片合拢' : (esq > 0 ? '带正电' : '带负电') + '，箔片张开';
    var t = rod === 'glass'
      ? '用丝绸摩擦玻璃棒时，玻璃棒上的一部分<b>电子转移到丝绸上</b>，玻璃棒缺了电子带<b>正电</b>。两根玻璃棒带<b>同种电荷</b>，靠近时<b>相互排斥</b>，吊着的棒被推开。'
      : '用毛皮摩擦橡胶棒时，<b>电子从毛皮转移到橡胶棒上</b>，橡胶棒多了电子带<b>负电</b>。它和带正电的玻璃棒是<b>异种电荷</b>，靠近时<b>相互吸引</b>，吊着的棒转了过来。';
    if (k > 0.5) t += '离得越近，作用越明显。';
    if (esMsg) t += ' ' + esMsg;
    L.$('#charge-text').innerHTML = t;
    save();
  }
  L.chips(L.$('#rod-chips'), [{ label: '丝绸摩擦过的玻璃棒', value: 'glass' }, { label: '毛皮摩擦过的橡胶棒', value: 'rubber' }], rod, function (v) { rod = v; esMsg = ''; drawCharge(); });
  L.bindRange(distIn, function (v) { dist = v; drawCharge(); });
  L.$('#touch-btn').addEventListener('click', function () {
    var s = rodSign(), before = esq;
    esq = L.clamp(esq + s, -3, 3);
    if (before !== 0 && before * s < 0) {
      esMsg = '验电器原来带的电和棒上的是<b>异种电荷</b>，接触后正、负电荷相互抵消（叫<b>中和</b>），' + (esq === 0 ? '现在正好不带电，<b>箔片合拢</b>。' : '张角变小了。');
    } else if (esq === before) {
      esMsg = '验电器上的电荷已经够多了，箔片张得很开。可以先“用手摸一下金属球”再试。';
    } else {
      esMsg = '验电器带上了与棒相同的电荷，两片金属箔带<b>同种电荷相互排斥</b>而张开；接触次数越多、电荷越多，张角越大。';
    }
    touching = true;
    clearTimeout(touchTimer);
    touchTimer = setTimeout(function () { touching = false; drawCharge(); }, 700);
    drawCharge();
  });
  L.$('#ground-btn').addEventListener('click', function () {
    esq = 0;
    esMsg = '人体是导体，手一摸，验电器上的电荷经过人体导入大地，箔片合拢。';
    drawCharge();
  });

  function save() {
    L.setState({ m: mode, s1: s1 ? 1 : 0, s2: s2 ? 1 : 0, pl: pulled ? 1 : 0, sh: shorted ? 1 : 0, mm: mmode, ap: pos, r1: r1k, r2: r2k, rg: range, rv: rev ? 1 : 0, rod: rod, d: dist, q: esq });
  }

  drawCirc();
  drawMeter();
  drawCharge();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '让串联电路里的两盏灯都亮起来',
      desc: '在“搭电路”里选串联，操作开关，让 L1、L2 同时发光。',
      label: '在电路图里操作开关',
      button: '检查电路',
      check: function () {
        if (mode !== 's') return { ok: false, msg: '先把连接方式切到“串联”。' };
        if (shorted) return { ok: false, msg: '电源被短路了！先点“撤掉短路导线”。' };
        if (pulled) return { ok: false, msg: 'L2 被拧下来了，串联电路的唯一通路断开，先把它装回去。' };
        if (!(s1 && s2)) return { ok: false, msg: '还有开关是断开的。串联电路只有一条路，<b>每个开关都要闭合</b>。' };
        return { ok: true, msg: 'S1、S2 都闭合，电流从正极依次经过 L1、L2 回到负极，形成通路，两盏灯一起亮。' };
      }
    },
    {
      level: 'base',
      title: '丝绸摩擦过的玻璃棒靠近一个带电小球，小球被推开了，小球带',
      desc: '可以在“两种电荷”里试试什么情况下会排斥。',
      options: ['正电', '负电', '不带电', '可能带负电，也可能不带电'],
      answer: 0,
      hint: '玻璃棒带什么电？什么样的电荷之间才会相互排斥？',
      explain: '丝绸摩擦过的玻璃棒带正电，<b>只有同种电荷才相互排斥</b>，所以小球带<b>正电</b>。如果小球带负电或不带电，都会被吸引过来，而不是被推开。'
    },
    {
      level: 'base',
      title: '关于电流表的使用，正确的是',
      desc: '想想“电流表放在 A、B、C 三处”那张图里，电流表是怎么接进电路的。',
      options: ['电流表要串联在被测电路中，电流从“+”接线柱流入', '电流表可以直接接在电源两极上测电源的电流', '电流表应该和被测的灯泡并联', '不知道电流多大时，先用小量程试触'],
      answer: 0,
      hint: '电流表本身对电流几乎没有阻碍作用，直接接在电源两极上会怎样？',
      explain: '电流表要<b>串联</b>，并且“正进负出”。它对电流几乎没有阻碍，直接接在电源两极上相当于短路，会烧坏电流表和电源；和灯泡并联也会把灯短路。试触要用<b>大量程</b>，用小量程试触可能一下就打坏指针。'
    },
    {
      level: 'mid',
      title: '在并联电路里只让 L1 亮',
      desc: '切到并联，想办法让 L1 发光、L2 不发光。',
      label: '在电路图里操作',
      button: '检查电路',
      check: function () {
        var o = cstate();
        if (mode !== 's' && !shorted && o.l1 && !o.l2) return { ok: true, msg: 'L1 所在支路接通，L2 支路断开，L1 照样亮：并联电路<b>各支路互不影响</b>。' };
        if (mode === 's') return { ok: false, msg: '串联电路里两盏灯要么一起亮、要么一起灭，做不到只亮一盏。切到“并联”。' };
        if (shorted) return { ok: false, msg: '电源被短路了，两盏灯都不会亮，先撤掉短路导线。' };
        if (!s1) return { ok: false, msg: 'S1 在<b>干路</b>上，它断开时两盏灯都不亮，要闭合它。' };
        return { ok: false, msg: '两盏灯都亮着。L2 所在的支路上有开关 S2，想想怎样只断开这一条支路。' };
      }
    },
    {
      level: 'mid',
      title: '用电流表测并联电路的干路电流',
      desc: '在“电流表放在 A、B、C 三处”里切到并联，把电流表放在干路上，接线柱和量程都要选对，让指针在刻度范围内、读数尽量准确。',
      label: '在电流表那张图里操作',
      button: '检查电流表',
      check: function () {
        var ms = meterStatus();
        if (mmode !== 'p') return { ok: false, msg: '先把连接方式切到“并联”。' };
        if (pos !== 'A') return { ok: false, msg: '现在测的是' + PTS.p[pos][3] + '的电流。并联电路的干路在分支点之前，是 A 点。' };
        if (ms.rev) return { ok: false, msg: '指针反偏了，要让电流从“+”接线柱流入。' };
        if (ms.over) return { ok: false, msg: '干路电流超过了 0.6 A，指针超出刻度，换 0～3 A 量程。' };
        if (ms.coarse) return { ok: false, msg: '干路电流只有 ' + L.fmt(ms.I, 2) + ' A，没超过 0.6 A，用 0～0.6 A 量程读数更准确。' };
        return { ok: true, msg: '干路电流 ' + L.fmt(ms.I, 2) + ' A，正好等于两条支路电流之和 ' + L.fmt(currents().B, 2) + ' A + ' + L.fmt(currents().C, 2) + ' A。' };
      }
    },
    {
      level: 'mid',
      title: '两灯并联，干路电流 0.5 A，通过 L1 的电流是 0.2 A，通过 L2 的电流是',
      desc: '并联电路干路电流和支路电流有什么关系？',
      options: ['0.3 A', '0.7 A', '0.5 A', '0.2 A'],
      answer: 0,
      hint: '干路电流 = 各支路电流之和。',
      explain: 'I = I<sub>1</sub> + I<sub>2</sub>，所以 I<sub>2</sub> = 0.5 A − 0.2 A = <b>0.3 A</b>。0.7 A 是把干路当成了支路相加；0.5 A、0.2 A 是套用了串联“处处相等”的规律。'
    },
    {
      level: 'trap',
      title: '两盏灯串联，闭合开关后一盏很亮、一盏较暗，通过它们的电流',
      desc: '可以在电流表那张图里选串联，给 L1、L2 选不同规格看看。',
      options: ['一样大', '亮的那盏大', '暗的那盏大', '靠近电源正极的那盏大'],
      answer: 0,
      hint: '串联电路只有一条路，电荷能在半路“变少”吗？',
      explain: '串联电路<b>电流处处相等</b>，所以电流<b>一样大</b>。两灯亮暗不同是因为规格不同，不是电流不同。电流也不会在经过第一盏灯后被“用掉”，所以“靠近正极的大”也不对。'
    },
    {
      level: 'trap',
      title: '用电流表测得通过两盏灯的电流相等，这两盏灯',
      desc: '在电流表那张图里，选并联、两盏灯都选“甲”，再测一测 B、C 两点。',
      options: ['可能串联，也可能并联', '一定是串联', '一定是并联', '一定有一盏灯坏了'],
      answer: 0,
      hint: '两盏规格相同的灯并联，两条支路的电流会怎样？',
      explain: '串联时电流一定相等；但两盏<b>规格相同</b>的灯并联，两条支路电流也相等。所以只凭“电流相等”不能断定是串联，<b>两种都有可能</b>。要判断，可以拧下一盏灯，看另一盏还亮不亮。'
    }
  ]);
})();
