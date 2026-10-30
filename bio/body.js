/* 第 8 课 · 消化与血液循环 */
(function () {
  'use strict';
  var B = window.Bio, S = B.svg;
  var st = B.getState();
  var ART_C = '#cf5a4a', VEN_C = '#7a6fb4', PLAIN = '#bfa9a2';

  /* —— 血液循环 —— */
  var ROWS = {
    brain: { y: 290, lane: 'svc', name: '脑' },
    arm: { y: 315, lane: 'svc', name: '上肢' },
    gut: { y: 350, lane: 'ivc', name: '小肠' },
    kidney: { y: 375, lane: 'ivc', name: '肾' },
    leg: { y: 400, lane: 'ivc', name: '下肢' }
  };
  var LANE = { svc: { x: 100, entry: 190, name: '上腔静脉' }, ivc: { x: 70, entry: 162, name: '下腔静脉' } };
  var FROM = [
    { id: 'arm', label: '手臂静脉打点滴' },
    { id: 'leg', label: '脚踝静脉注射' },
    { id: 'gut', label: '小肠吸收的葡萄糖' },
    { id: 'lung', label: '肺里吸进的氧气' }
  ];
  var TO = [
    { id: 'brain', label: '脑' }, { id: 'arm', label: '上肢（手臂伤口）' }, { id: 'gut', label: '小肠' },
    { id: 'kidney', label: '肾' }, { id: 'leg', label: '下肢' }, { id: 'lung', label: '肺' }
  ];
  var from = FROM.some(function (f) { return f.id === st.from; }) ? st.from : 'gut';
  var to = TO.some(function (t) { return t.id === st.to; }) ? st.to : 'brain';
  var colored = true;

  var circ = B.$('#circ');
  var vesselEls = [];
  function vessel(pts, kind, w) {
    var d = 'M' + pts.map(function (p) { return p.join(' '); }).join('L');
    var el = S('path', { d: d, fill: 'none', stroke: kind === 'a' ? ART_C : VEN_C, 'stroke-width': w || 6, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', opacity: 0.85 }, circ);
    el.dataset.kind = kind; vesselEls.push(el);
    return el;
  }
  function text(x, y, t, o) {
    var a = { x: x, y: y, 'font-size': 10, fill: '#455d48', text: t, stroke: '#fff', 'stroke-width': 3, 'paint-order': 'stroke' };
    for (var k in o || {}) a[k] = o[k];
    return S('text', a, circ);
  }
  var defs = S('defs', {}, circ);
  function grad(id, c1, c2) {
    var g = S('linearGradient', { id: id, x1: 0, x2: 1, y1: 0, y2: 0 }, defs);
    S('stop', { offset: '0%', 'stop-color': c1 }, g); S('stop', { offset: '100%', 'stop-color': c2 }, g);
  }
  grad('g-lung', VEN_C, ART_C); grad('g-body', VEN_C, ART_C);
  grad('g-plain', PLAIN, PLAIN);

  var chamberEls = {};
  function drawCirc() {
    circ.innerHTML = ''; circ.appendChild(defs); vesselEls = []; chamberEls = {};
    S('rect', { x: 0, y: 0, width: 400, height: 440, rx: 14, fill: '#fbfcf8' }, circ);
    text(16, 22, '肺循环', { 'font-size': 11, 'font-weight': 650, fill: '#396b57' });
    text(16, 432, '体循环', { 'font-size': 11, 'font-weight': 650, fill: '#396b57' });
    S('path', { d: 'M10 140H390', stroke: '#e3e8df', 'stroke-dasharray': '3 4' }, circ);
    // 1. 血管
    vessel([[180, 214], [200, 214], [200, 120], [150, 120], [150, 60]], 'v');
    vessel([[250, 60], [250, 130], [233, 130], [233, 160]], 'a');
    vessel([[240, 228], [340, 228], [340, 400]], 'a');
    vessel([[100, 315], [100, 190], [150, 190]], 'v');
    vessel([[70, 400], [70, 162], [150, 162]], 'v');
    Object.keys(ROWS).forEach(function (k) {
      var r = ROWS[k], lx = LANE[r.lane].x;
      vessel([[340, r.y], [250, r.y]], 'a', 4.5);
      vessel([[170, r.y], [lx, r.y]], 'v', 4.5);
    });
    // 2. 路线（压在血管上、器官和心脏下面）
    trail = S('path', { fill: 'none', stroke: '#b97342', 'stroke-width': 2.2, 'stroke-dasharray': '5 4', opacity: 0.9, 'stroke-linejoin': 'round' }, circ);
    progress = S('path', { fill: 'none', stroke: '#203b35', 'stroke-width': 2, opacity: 0.75, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, circ);
    // 3. 毛细血管
    var lung = S('rect', { x: 130, y: 30, width: 140, height: 30, rx: 15, fill: 'url(#g-lung)', opacity: 0.9 }, circ);
    lung.dataset.kind = 'cap'; vesselEls.push(lung);
    text(200, 49, '肺部毛细血管', { 'text-anchor': 'middle', fill: '#fff', stroke: 'none', 'font-size': 11, 'font-weight': 600 });
    Object.keys(ROWS).forEach(function (k) {
      var r = ROWS[k];
      var cap = S('rect', { x: 170, y: r.y - 8, width: 80, height: 16, rx: 8, fill: 'url(#g-body)', opacity: 0.9 }, circ);
      cap.dataset.kind = 'cap'; vesselEls.push(cap);
      text(196, r.y + 3.5, r.name, { 'text-anchor': 'middle', fill: '#fff', stroke: 'none', 'font-size': 10, 'font-weight': 600 });
    });
    // 4. 心脏四个腔
    var heart = S('g', {}, circ);
    [['右心房', 140, 150, 46, 'v'], ['左心房', 206, 150, 46, 'a'], ['右心室', 140, 200, 56, 'v'], ['左心室', 206, 200, 56, 'a']].forEach(function (c) {
      var r = S('rect', { x: c[1], y: c[2], width: 54, height: c[3], rx: 9, fill: c[4] === 'a' ? '#f6d9d3' : '#e2def3', stroke: c[4] === 'a' ? '#cf5a4a' : '#7a6fb4', 'stroke-width': c[0] === '左心室' ? 3.2 : 1.6 }, heart);
      r.dataset.kind = 'ch-' + c[4]; r.dataset.sw = c[0] === '左心室' ? 3.2 : 1.6; vesselEls.push(r); chamberEls[c[0]] = r;
      S('text', { x: c[1] + 27, y: c[2] + c[3] / 2 + 4, 'font-size': 11, 'text-anchor': 'middle', fill: '#40594b', 'font-weight': 600, text: c[0] }, heart);
    });
    [[167, 198], [233, 198]].forEach(function (p) { S('path', { d: 'M' + (p[0] - 6) + ' ' + (p[1] - 3) + 'L' + (p[0] + 6) + ' ' + (p[1] - 3) + 'L' + p[0] + ' ' + (p[1] + 3) + 'z', fill: '#9aa596' }, heart); });
    // 5. 文字
    text(175, 113, '肺动脉', { 'text-anchor': 'middle' });
    text(256, 100, '肺静脉');
    text(346, 262, '主动脉');
    text(106, 274, '上腔静脉');
    text(64, 274, '下腔静脉', { 'text-anchor': 'end' });
    text(200, 276, '心脏', { 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 650, fill: '#8f3b2c' });
    text(210, 425, '全身各处的毛细血管', { 'text-anchor': 'middle', fill: '#8b9784' });
    dot = S('circle', { r: 6.5, fill: VEN_C, stroke: '#fff', 'stroke-width': 2 }, circ);
    applyColor();
  }
  var trail, progress, dot;

  function applyColor() {
    vesselEls.forEach(function (el) {
      var k = el.dataset.kind;
      if (k === 'a' || k === 'v') el.setAttribute('stroke', colored ? (k === 'a' ? ART_C : VEN_C) : PLAIN);
      else if (k === 'cap') el.setAttribute('fill', colored ? (el.getAttribute('y') === '30' ? 'url(#g-lung)' : 'url(#g-body)') : 'url(#g-plain)');
      else if (k === 'ch-a' || k === 'ch-v') { el.setAttribute('fill', colored ? (k === 'ch-a' ? '#f6d9d3' : '#e2def3') : '#efe9e6'); el.setAttribute('stroke', colored ? (k === 'ch-a' ? ART_C : VEN_C) : PLAIN); }
    });
  }

  var VEIN = { brain: '脑部静脉', arm: '上肢静脉', gut: '小肠静脉', kidney: '肾静脉', leg: '下肢静脉' };
  var ARTN = { brain: '脑部动脉', arm: '上肢动脉', gut: '小肠动脉', kidney: '肾动脉', leg: '下肢动脉' };
  var CAPN = { brain: '脑部毛细血管', arm: '上肢毛细血管', gut: '小肠毛细血管', kidney: '肾脏毛细血管', leg: '下肢毛细血管' };

  function route(f, t) {
    var s = [];
    if (f === 'lung' && t === 'lung') return null;
    if (f !== 'lung') {
      var r = ROWS[f], L = LANE[r.lane];
      if (f === 'gut') s.push({ n: '小肠绒毛（吸收）', pts: [[236, r.y], [170, r.y]], b: 'v' });
      s.push({ n: VEIN[f], pts: [[f === 'gut' ? 170 : 166, r.y], [L.x, r.y]], b: 'v' });
      s.push({ n: L.name, pts: [[L.x, r.y], [L.x, L.entry], [150, L.entry]], b: 'v' });
      s.push({ n: '右心房', pts: [[150, L.entry], [167, 173]], b: 'v', heart: true });
      s.push({ n: '右心室', pts: [[167, 173], [167, 228]], b: 'v', heart: true });
      s.push({ n: '肺动脉', pts: [[167, 228], [200, 214], [200, 120], [150, 120], [150, 60]], b: 'v' });
      s.push({ n: '肺部毛细血管', pts: [[150, 60], [150, 45], [200, 45]], b: 'v' });
      if (t === 'lung') return s;
      s.push({ n: '肺静脉', pts: [[200, 45], [250, 45], [250, 60], [250, 130], [233, 130], [233, 150]], b: 'a' });
    } else {
      s.push({ n: '肺泡周围毛细血管', pts: [[200, 45], [250, 45], [250, 60]], b: 'a' });
      s.push({ n: '肺静脉', pts: [[250, 60], [250, 130], [233, 130], [233, 150]], b: 'a' });
    }
    var ty = ROWS[t].y;
    s.push({ n: '左心房', pts: [[233, 150], [233, 173]], b: 'a', heart: true });
    s.push({ n: '左心室', pts: [[233, 173], [233, 228]], b: 'a', heart: true });
    s.push({ n: '主动脉', pts: [[233, 228], [340, 228], [340, ty]], b: 'a' });
    s.push({ n: ARTN[t], pts: [[340, ty], [250, ty]], b: 'a' });
    s.push({ n: CAPN[t], pts: [[250, ty], [236, ty]], b: 'a' });
    return s;
  }

  var steps = null, flat = [], total = 0, playing = false, finished = false, raf = 0;
  function build() {
    steps = route(from, to);
    flat = []; total = 0;
    var stepsEl = B.$('#steps'); stepsEl.innerHTML = '';
    if (!steps) {
      trail.setAttribute('d', ''); progress.setAttribute('d', ''); dot.style.display = 'none';
      B.$('#r-heart').textContent = '—'; B.$('#r-now').textContent = '—'; B.$('#loop-badge').textContent = '换个终点';
      B.$('#r-text').textContent = '氧气就是在肺里进入血液的，起点和终点都是肺，就不用跑了。换个终点吧。';
      B.$('#play').disabled = true;
      save(); return;
    }
    B.$('#play').disabled = false;
    steps.forEach(function (s, i) {
      s.start = total;
      for (var j = 1; j < s.pts.length; j++) {
        var a = s.pts[j - 1], b = s.pts[j], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        flat.push({ a: a, b: b, d0: total, len: len, kind: s.b, step: i });
        total += len;
      }
      s.end = total;
      if (i) B.html('i', { text: '→' }, stepsEl);
      s.el = B.html('span', { text: s.n, class: (s.heart ? 'heart ' : '') + (s.b === 'v' ? 'v' : '') }, stepsEl);
    });
    var d = '';
    flat.forEach(function (f, i) { d += (i ? '' : 'M' + f.a.join(' ')) + 'L' + f.b.join(' '); });
    trail.setAttribute('d', d);
    progress.setAttribute('d', '');
    var hearts = steps.filter(function (s) { return s.n === '右心房' || s.n === '左心房'; }).length;
    B.$('#r-heart').innerHTML = hearts + '<small>次</small>';
    B.$('#loop-badge').textContent = from === 'lung' ? '肺循环 → 体循环' : to === 'lung' ? '体循环 → 肺循环' : '体循环 → 肺循环 → 体循环';
    finished = false;
    setAt(0);
    B.$('#r-text').textContent = '点“让血液流起来”，看它怎么走。';
    save();
  }
  function setAt(dist) {
    var seg = flat[0], k;
    for (k = 0; k < flat.length; k++) { if (flat[k].d0 + flat[k].len >= dist) { seg = flat[k]; break; } seg = flat[k]; }
    var f = seg.len ? B.clamp((dist - seg.d0) / seg.len, 0, 1) : 1;
    var x = seg.a[0] + (seg.b[0] - seg.a[0]) * f, y = seg.a[1] + (seg.b[1] - seg.a[1]) * f;
    dot.style.display = '';
    dot.setAttribute('cx', x.toFixed(1)); dot.setAttribute('cy', y.toFixed(1));
    dot.setAttribute('fill', colored ? (seg.kind === 'a' ? ART_C : VEN_C) : '#8a7a74');
    // 已走过的路
    var d = 'M' + flat[0].a.join(' ');
    for (var i = 0; i < flat.length && flat[i].d0 < dist; i++) {
      if (flat[i].d0 + flat[i].len <= dist) d += 'L' + flat[i].b.join(' ');
      else d += 'L' + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    progress.setAttribute('d', dist > 0 ? d : '');
    var cur = 0;
    steps.forEach(function (s, i) { var on = s.start <= dist + 0.01; s.el.classList.toggle('on', on); if (on) cur = i; });
    B.$('#r-now').textContent = steps[cur].n;
    for (var nm in chamberEls) {
      var el = chamberEls[nm], hit = steps[cur].n === nm;
      el.setAttribute('stroke-width', hit ? 4 : el.dataset.sw);
      el.style.filter = hit ? 'drop-shadow(0 0 5px #b97342)' : '';
    }
  }
  function summary() {
    var fl = FROM.find(function (x) { return x.id === from; }).label, tl = TO.find(function (x) { return x.id === to; }).label;
    var hearts = steps.filter(function (s) { return s.n === '右心房' || s.n === '左心房'; }).length;
    var msg = '从“' + fl + '”到“' + tl + '”，经过心脏 ' + hearts + ' 次。';
    if (from === 'arm' || from === 'leg') msg += '药物最先到达心脏的<b>右心房</b>，要先去肺里转一圈，再回到左心，才被送到全身。';
    if (from === 'gut') msg += '葡萄糖从小肠进入血液后，先回到右心房，经过肺循环，再由左心室泵入主动脉送出去。';
    if (from === 'lung') msg += '氧气在肺里进入血液，血液变成鲜红的动脉血，经肺静脉回到左心房，再送往全身。';
    if (to === 'lung' && from !== 'lung') msg += '治疗肺炎的药物经过心脏一次（右心房、右心室）就能到肺。';
    B.$('#r-text').innerHTML = msg;
  }
  function play() {
    if (!steps) return;
    cancelAnimationFrame(raf);
    var t0 = performance.now(), speed = 150;
    playing = true; finished = false;
    B.$('#play').textContent = '流动中…';
    (function tick(now) {
      var dist = (now - t0) / 1000 * speed;
      if (dist >= total) { setAt(total); playing = false; finished = true; B.$('#play').textContent = '▶ 再流一遍'; summary(); return; }
      setAt(dist);
      raf = requestAnimationFrame(tick);
    })(t0);
  }
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) {
    play = function () { if (!steps) return; setAt(total); finished = true; summary(); };
  }
  B.$('#play').addEventListener('click', function () { play(); });
  var colorBtn = B.$('#color-toggle');
  colorBtn.addEventListener('click', function () {
    colored = !colored; colorBtn.setAttribute('aria-pressed', String(colored)); applyColor();
    if (steps) { var cur = playing ? null : (finished ? total : 0); if (cur !== null) setAt(cur); }
  });
  var fromChips = B.chips(B.$('#from-chips'), FROM.map(function (f) { return { label: f.label, value: f.id }; }), from, function (v) { from = v; cancelAnimationFrame(raf); playing = false; B.$('#play').textContent = '▶ 让血液流起来'; build(); });
  var toChips = B.chips(B.$('#to-chips'), TO.map(function (t) { return { label: t.label, value: t.id }; }), to, function (v) { to = v; cancelAnimationFrame(raf); playing = false; B.$('#play').textContent = '▶ 让血液流起来'; build(); });

  /* —— 消化曲线 —— */
  var dig = B.$('#dig');
  var ORG = [
    { n: '口腔', x0: 40, x1: 92, juice: '唾液', t: '牙齿把食物嚼碎，舌头搅拌。唾液里的<b>唾液淀粉酶</b>能把一部分淀粉分解成麦芽糖——所以馒头越嚼越甜。' },
    { n: '咽和食道', x0: 92, x1: 128, juice: '没有消化液', t: '只是食物的通道，靠肌肉的蠕动把食物往下推，<b>不消化也不吸收</b>。' },
    { n: '胃', x0: 128, x1: 196, juice: '胃液', t: '胃液里有<b>蛋白酶</b>，开始初步消化蛋白质。胃能吸收<b>少量的水和酒精</b>。' },
    { n: '小肠', x0: 196, x1: 330, juice: '肠液 · 胰液 · 胆汁', t: '消化和吸收的<b>主要场所</b>。肠液和胰液里有多种消化酶，胆汁虽然没有酶，却能把脂肪乳化成小颗粒。三种营养物质在这里被彻底消化，然后被吸收。' },
    { n: '大肠', x0: 330, x1: 390, juice: '基本不消化', t: '没有消化功能，能吸收<b>少量的水、无机盐和部分维生素</b>，剩下的形成粪便排出。' }
  ];
  var Y_TOP = 26, Y_BOT = 186;
  function ss(a, b, x) { var t = B.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  var NUT = {
    starch: { n: '淀粉', c: '#b97342', f: function (x) { return 100 - 30 * ss(46, 86, x) - 70 * ss(206, 300, x); } },
    protein: { n: '蛋白质', c: '#4f8da0', f: function (x) { return 100 - 38 * ss(134, 190, x) - 62 * ss(206, 292, x); } },
    fat: { n: '脂肪', c: '#8a7bb8', f: function (x) { return 100 - 100 * ss(212, 314, x); } }
  };
  var nutSel = 'all', curveEls = {};
  function vy(v) { return Y_BOT - v / 100 * (Y_BOT - Y_TOP); }
  function drawDig() {
    dig.innerHTML = '';
    ORG.forEach(function (o, i) {
      S('rect', { x: o.x0, y: Y_TOP - 6, width: o.x1 - o.x0, height: Y_BOT - Y_TOP + 6, fill: i % 2 ? '#f3f6ee' : '#fafbf7' }, dig);
      S('text', { x: (o.x0 + o.x1) / 2, y: Y_BOT + 16, 'font-size': o.n.length > 3 ? 9 : 10.5, 'text-anchor': 'middle', fill: '#5f7259', text: o.n }, dig);
      S('text', { x: (o.x0 + o.x1) / 2, y: Y_BOT + 30, 'font-size': 10, 'text-anchor': 'middle', fill: '#a0ad99', text: 'ABCDE'[i] }, dig);
    });
    S('path', { d: 'M40 ' + Y_TOP + 'V' + Y_BOT + 'H390', stroke: '#c9d3c3', fill: 'none' }, dig);
    [0, 50, 100].forEach(function (v) { S('text', { x: 35, y: vy(v) + 3, 'font-size': 9, 'text-anchor': 'end', fill: '#8b9784', text: v + '%' }, dig); });
    S('text', { x: 44, y: 14, 'font-size': 9.5, fill: '#8b9784', text: '还没被消化的比例' }, dig);
    var lg = S('g', { 'font-size': 10 }, dig);
    Object.keys(NUT).forEach(function (k, i) {
      S('rect', { x: 230 + i * 56, y: 7, width: 12, height: 3, fill: NUT[k].c }, lg);
      S('text', { x: 246 + i * 56, y: 12, fill: '#5f6f58', text: NUT[k].n }, lg);
    });
    Object.keys(NUT).forEach(function (k, i) {
      var d = '';
      for (var x = 40; x <= 390; x += 2) d += (x === 40 ? 'M' : 'L') + x + ' ' + (vy(NUT[k].f(x)) + (i - 1) * 1.6).toFixed(1);
      curveEls[k] = S('path', { d: d, fill: 'none', stroke: NUT[k].c, 'stroke-width': 2.6, 'stroke-linecap': 'round' }, dig);
    });
    digCursor = S('path', { stroke: '#203b35', 'stroke-dasharray': '2 3' }, dig);
    digDots = Object.keys(NUT).map(function (k) { return S('circle', { r: 4, fill: NUT[k].c, stroke: '#fff', 'stroke-width': 1.5 }, dig); });
  }
  var digCursor, digDots;
  var posIn = B.$('#pos');
  if (isFinite(+st.p) && st.p !== undefined) posIn.value = B.clamp(+st.p, 0, 100);
  function organAt(x) { for (var i = 0; i < ORG.length; i++) if (x < ORG[i].x1 || i === ORG.length - 1) return i; }
  function renderDig() {
    var x = 40 + (+posIn.value) / 100 * 350;
    var oi = organAt(x), o = ORG[oi];
    digCursor.setAttribute('d', 'M' + x + ' ' + (Y_TOP - 6) + 'V' + Y_BOT);
    Object.keys(NUT).forEach(function (k, i) {
      var v = NUT[k].f(x);
      digDots[i].setAttribute('cx', x); digDots[i].setAttribute('cy', vy(v) + (i - 1) * 1.6);
      B.$('#r-' + k).innerHTML = Math.round(v) + '<small>%</small>';
      var on = nutSel === 'all' || nutSel === k;
      curveEls[k].setAttribute('opacity', on ? 1 : 0.18);
      digDots[i].setAttribute('opacity', on ? 1 : 0.2);
    });
    B.$('#pos-out').textContent = o.n;
    B.$('#organ-name').textContent = o.n;
    B.$('#juice-badge').textContent = o.juice;
    B.$('#organ-text').innerHTML = o.t;
    save();
  }
  B.chips(B.$('#nut-chips'), [{ label: '全部', value: 'all' }, { label: '淀粉', value: 'starch' }, { label: '蛋白质', value: 'protein' }, { label: '脂肪', value: 'fat' }], 'all', function (v) { nutSel = v; renderDig(); });
  B.bindRange(posIn, renderDig);

  function save() { B.setState({ from: from, to: to, p: posIn.value }); }

  drawCirc();
  build();
  drawDig();
  renderDig();

  /* —— 小练习 —— */
  B.quiz([
    {
      title: '葡萄糖怎么到达大脑？',
      desc: '我们吃的米饭被消化成葡萄糖，大脑最需要它。在右边选“小肠吸收的葡萄糖”和“脑”，让血液流到终点。',
      check: function () {
        if (from !== 'gut' || to !== 'brain') return { ok: false, msg: '先选好起点“小肠吸收的葡萄糖”和终点“脑”。' };
        if (!finished) return { ok: false, msg: '路线选对了，点“让血液流起来”，等它流到终点。' };
        return { ok: true, msg: '小肠 → 下腔静脉 → 右心房 → 右心室 → 肺 → 左心房 → 左心室 → 主动脉 → 脑，一共经过心脏 2 次。' };
      }
    },
    {
      title: '蛋白质从哪里开始被消化？',
      desc: '在“食物在哪里被消化”的图里拖动滑块，停在<b>蛋白质开始被消化</b>的器官。',
      check: function () {
        var x = 40 + (+posIn.value) / 100 * 350, o = ORG[organAt(x)];
        if (o.n === '胃') return { ok: true, msg: '胃液里有蛋白酶，蛋白质在胃里开始被初步消化，到小肠里才被彻底分解成氨基酸。' };
        return { ok: false, msg: '现在停在' + o.n + '。看蓝色的“蛋白质”曲线，它从哪里开始往下降？' };
      }
    },
    {
      title: '打点滴的药先到心脏哪个腔？',
      desc: '小明手臂静脉打点滴。药物进入血液后，最先到达心脏的：',
      options: ['右心房', '右心室', '左心房', '左心室'],
      answer: 0,
      hint: '可以在上面选“手臂静脉打点滴”，看它进入心脏的第一个腔。',
      explain: '上肢静脉 → 上腔静脉 → 右心房。所有从全身回来的血，都先回到右心房。'
    }
  ]);
})();
