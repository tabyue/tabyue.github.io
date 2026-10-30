/* 第 10 课 · 反射与眼睛 */
(function () {
  'use strict';
  var B = window.Bio, S = B.svg;
  var st = B.getState();

  /* —— 反射弧 —— */
  var PARTS = [
    { id: 'rec', n: '① 感受器' }, { id: 'aff', n: '② 传入神经' }, { id: 'cen', n: '③ 神经中枢' },
    { id: 'eff', n: '④ 传出神经' }, { id: 'mus', n: '⑤ 效应器' }, { id: 'asc', n: '脊髓白质（通向大脑）' }
  ];
  var broken = {};
  (st.b || '').split(',').forEach(function (k) { if (PARTS.some(function (p) { return p.id === k; })) broken[k] = true; });
  var poked = false, running = false;

  var arc = B.$('#arc');
  var P = {
    aff: 'M38 250C110 270 205 262 256 204C266 192 279 184 292 180',
    inter: 'M292 180C299 174 299 166 292 160',
    eff: 'M292 160C270 148 228 118 158 104',
    asc: 'M318 134C322 112 322 92 316 72'
  };
  S('rect', { x: 0, y: 0, width: 400, height: 280, rx: 14, fill: '#fbfcf8' }, arc);
  // 手臂
  S('path', { d: 'M172 54L104 158L52 232', stroke: '#e3cdb5', 'stroke-width': 33, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none' }, arc);
  S('path', { d: 'M172 54L104 158L52 232', stroke: '#f4e3d1', 'stroke-width': 30, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none' }, arc);
  S('circle', { cx: 44, cy: 242, r: 15, fill: '#f4e3d1', stroke: '#e3cdb5', 'stroke-width': 1.5 }, arc);
  // 针
  S('path', { d: 'M8 276L28 258', stroke: '#8b9784', 'stroke-width': 2, 'stroke-linecap': 'round' }, arc);
  S('circle', { cx: 8, cy: 276, r: 3, fill: '#b97342' }, arc);
  // 大脑
  var brain = S('g', {}, arc);
  var brainShape = S('path', { d: 'M236 50C232 26 262 12 286 18C304 6 338 10 350 26C372 28 380 50 366 62C364 76 340 82 322 76C306 84 278 82 268 74C246 76 232 66 236 50z', fill: '#f1e6ec', stroke: '#c9adb9', 'stroke-width': 1.5 }, brain);
  S('path', { d: 'M262 40c8 6 18 0 24 6M300 30c6 8 18 6 22 14M330 52c-8 4-6 12-14 14M276 62c6-6 16-4 22-2', stroke: '#d6bfca', fill: 'none', 'stroke-width': 1.3 }, brain);
  var brainText = S('text', { x: 302, y: 48, 'font-size': 10, 'text-anchor': 'middle', fill: '#7c5a6a', text: '大脑皮层（产生痛觉）' }, brain);
  // 脊髓横切
  S('ellipse', { cx: 302, cy: 170, rx: 46, ry: 38, fill: '#f6f2e7', stroke: '#c9bea6', 'stroke-width': 1.5 }, arc);
  var gray = S('path', { d: 'M278 146c10-6 18 4 24 14 6-10 14-20 24-14 4 10-6 18-14 24 8 6 18 14 14 24-10 6-18-4-24-14-6 10-14 20-24 14-4-10 6-18 14-24-8-6-18-14-14-24z', fill: '#d5c9b1', stroke: '#b8a98c', 'stroke-width': 1 }, arc);
  S('circle', { cx: 302, cy: 170, r: 2.2, fill: '#fff' }, arc);
  // 肌肉
  var muscle = S('ellipse', { cx: 138, cy: 106, rx: 30, ry: 11, transform: 'rotate(-57 138 106)', fill: '#e2a08a', stroke: '#c07a63', 'stroke-width': 1.2 }, arc);
  // 神经
  function nerve(d, color) { return S('path', { d: d, fill: 'none', stroke: color, 'stroke-width': 3, 'stroke-linecap': 'round' }, arc); }
  var els = {
    aff: nerve(P.aff, '#4f8da0'),
    inter: nerve(P.inter, '#8a7f66'),
    eff: nerve(P.eff, '#b97342'),
    asc: nerve(P.asc, '#9a7ba8')
  };
  els.asc.setAttribute('stroke-dasharray', '1 0');
  // 神经节
  var gp = els.aff.getPointAtLength(els.aff.getTotalLength() * 0.62);
  S('ellipse', { cx: gp.x, cy: gp.y, rx: 7, ry: 4.5, fill: '#4f8da0', transform: 'rotate(-38 ' + gp.x + ' ' + gp.y + ')' }, arc);
  S('text', { x: gp.x + 10, y: gp.y + 16, 'font-size': 9, fill: '#4f8da0', text: '神经节' }, arc);
  // 感受器
  var rec = S('g', {}, arc);
  [[34, 251], [39, 255], [36, 247], [41, 250]].forEach(function (p) { S('circle', { cx: p[0], cy: p[1], r: 1.8, fill: '#4f8da0' }, rec); });
  // 文字
  function lab(x, y, t, o) { var a = { x: x, y: y, 'font-size': 10, fill: '#455d48', text: t, stroke: '#fbfcf8', 'stroke-width': 3, 'paint-order': 'stroke' }; for (var k in o || {}) a[k] = o[k]; return S('text', a, arc); }
  lab(56, 272, '① 感受器');
  lab(150, 272, '② 传入神经', { fill: '#3f7484' });
  lab(302, 226, '③ 神经中枢（灰质）', { 'text-anchor': 'middle' });
  lab(302, 240, '脊髓横切面', { 'text-anchor': 'middle', fill: '#8b9784', 'font-size': 9 });
  lab(188, 96, '④ 传出神经', { fill: '#9c6334' });
  lab(104, 84, '⑤ 效应器', { 'text-anchor': 'end' });
  lab(104, 96, '（肌肉）', { 'text-anchor': 'end', fill: '#8b9784', 'font-size': 9 });
  lab(328, 104, '白质', { fill: '#7c5a6a' });
  lab(328, 116, '向上传导', { fill: '#8b9784', 'font-size': 9 });
  var shout = lab(66, 220, '', { 'font-size': 13, 'font-weight': 700, fill: '#396b57' });
  var ouch = lab(372, 86, '', { 'font-size': 13, 'font-weight': 700, fill: '#8f3b2c', 'text-anchor': 'end' });
  // 点击区域
  var hits = {
    rec: S('circle', { cx: 38, cy: 251, r: 14, fill: 'transparent' }, arc),
    aff: S('path', { d: P.aff, stroke: 'transparent', 'stroke-width': 16, fill: 'none' }, arc),
    cen: S('path', { d: gray.getAttribute('d'), fill: 'transparent' }, arc),
    eff: S('path', { d: P.eff, stroke: 'transparent', 'stroke-width': 16, fill: 'none' }, arc),
    mus: S('ellipse', { cx: 138, cy: 106, rx: 32, ry: 14, transform: 'rotate(-57 138 106)', fill: 'transparent' }, arc),
    asc: S('path', { d: P.asc, stroke: 'transparent', 'stroke-width': 16, fill: 'none' }, arc)
  };
  var marks = {};
  var MARK_AT = { rec: [38, 251], cen: [302, 170], mus: [138, 106] };
  ['aff', 'eff', 'asc'].forEach(function (k) { var e = els[k], p = e.getPointAtLength(e.getTotalLength() * (k === 'aff' ? 0.4 : 0.5)); MARK_AT[k] = [p.x, p.y]; });
  Object.keys(hits).forEach(function (k) {
    var h = hits[k];
    h.classList.add('svg-hit'); h.style.cursor = 'pointer';
    h.setAttribute('tabindex', '0'); h.setAttribute('role', 'button');
    h.setAttribute('aria-label', PARTS.find(function (p) { return p.id === k; }).n);
    h.addEventListener('click', function () { toggle(k); });
    h.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(k); } });
    var m = S('g', { transform: 'translate(' + MARK_AT[k][0] + ',' + MARK_AT[k][1] + ')', 'pointer-events': 'none' }, arc);
    S('circle', { r: 9, fill: '#fff', stroke: '#c0703c', 'stroke-width': 1.6 }, m);
    S('path', { d: 'M-4 -4L4 4M4 -4L-4 4', stroke: '#c0703c', 'stroke-width': 2.2, 'stroke-linecap': 'round' }, m);
    marks[k] = m;
  });
  var sig1 = S('circle', { r: 5, fill: '#f4c56b', stroke: '#b97342', 'stroke-width': 1.5, opacity: 0 }, arc);
  var sig2 = S('circle', { r: 5, fill: '#f4c56b', stroke: '#9a7ba8', 'stroke-width': 1.5, opacity: 0 }, arc);

  var partBtns = {};
  PARTS.forEach(function (p) {
    var b = B.html('button', { type: 'button', text: p.n, 'aria-pressed': 'false' }, B.$('#parts'));
    b.addEventListener('click', function () { toggle(p.id); });
    partBtns[p.id] = b;
  });
  B.$('#heal').addEventListener('click', function () { broken = {}; poked = false; refresh(); });
  B.$('#poke').addEventListener('click', poke);

  function toggle(k) { if (running) return; broken[k] = !broken[k]; poked = false; refresh(); }
  function outcome() {
    var reflex = !broken.rec && !broken.aff && !broken.cen && !broken.eff && !broken.mus;
    var feel = !broken.rec && !broken.aff && !broken.cen && !broken.asc;
    return { reflex: reflex, feel: feel };
  }
  function refresh() {
    PARTS.forEach(function (p) {
      partBtns[p.id].setAttribute('aria-pressed', String(!!broken[p.id]));
      marks[p.id].style.display = broken[p.id] ? '' : 'none';
    });
    ['aff', 'eff', 'asc'].forEach(function (k) { els[k].setAttribute('stroke-dasharray', broken[k] ? '4 5' : '1 0'); els[k].setAttribute('opacity', broken[k] ? 0.5 : 1); });
    gray.setAttribute('fill', broken.cen ? '#e6ddcc' : '#d5c9b1');
    muscle.setAttribute('fill', broken.mus ? '#ecd3c8' : '#e2a08a');
    var n = Object.keys(broken).filter(function (k) { return broken[k]; });
    B.$('#arc-badge').textContent = n.length ? '弄坏了 ' + n.length + ' 处' : '反射弧完整';
    var vm = B.$('#v-move'), vf = B.$('#v-feel');
    if (!poked) {
      vm.className = 'verdict'; vf.className = 'verdict';
      vm.querySelector('strong').textContent = '—'; vf.querySelector('strong').textContent = '—';
      B.$('#arc-text').textContent = n.length ? '弄坏了：' + n.map(function (k) { return PARTS.find(function (p) { return p.id === k; }).n.replace(/^[①-⑤] /, ''); }).join('、') + '。先猜一猜，再按“扎一下手指”。' : '先按“扎一下手指”试试完整的反射弧。';
    } else {
      var o = outcome();
      vm.className = 'verdict ' + (o.reflex ? 'yes' : 'no'); vf.className = 'verdict ' + (o.feel ? 'yes' : 'no');
      vm.querySelector('strong').textContent = o.reflex ? '能缩手' : '不能缩手';
      vf.querySelector('strong').textContent = o.feel ? '会觉得痛' : '没有痛觉';
      var t;
      if (o.reflex && o.feel) t = '反射弧完整：神经冲动沿 ①→②→③→④→⑤ 传到肌肉，手缩回；同时沿脊髓白质传到大脑，才感觉到痛——所以是先缩手，后觉得痛。';
      else if (!o.reflex && o.feel) t = '冲动能传到脊髓，再沿白质传到大脑，所以<b>有痛觉</b>；但传出神经或肌肉坏了，命令到不了或执行不了，<b>不能缩手</b>。';
      else if (o.reflex && !o.feel) t = '反射弧完整，照样缩手；但通向大脑的白质断了，大脑收不到消息，<b>没有痛觉</b>。高位截瘫的病人就是这样。';
      else if (broken.rec || broken.aff) t = '感受器或传入神经坏了，冲动根本传不进脊髓：既<b>不能缩手</b>，也<b>没有痛觉</b>。';
      else t = '神经中枢坏了，冲动到这里就停了：既不能缩手，也传不到大脑，没有痛觉。';
      B.$('#arc-text').innerHTML = t;
    }
    save();
  }

  function along(el, from, to, dot, dur, done) {
    var L = el.getTotalLength(), t0 = performance.now();
    dot.setAttribute('opacity', 1);
    (function tick(now) {
      var f = Math.min(1, (now - t0) / dur), l = L * (from + (to - from) * f), p = el.getPointAtLength(l);
      dot.setAttribute('cx', p.x); dot.setAttribute('cy', p.y);
      if (f < 1) requestAnimationFrame(tick); else done && done();
    })(t0);
  }
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function poke() {
    if (running) return;
    shout.textContent = ''; ouch.textContent = ''; brainShape.setAttribute('fill', '#f1e6ec');
    muscle.setAttribute('rx', 30); muscle.setAttribute('ry', 11);
    var o = outcome();
    function finish() { running = false; poked = true; sig1.setAttribute('opacity', 0); sig2.setAttribute('opacity', 0); refresh(); }
    if (reduced) { applyEnd(o); finish(); return; }
    running = true;
    if (broken.rec) { setTimeout(finish, 400); return; }
    along(els.aff, 0, broken.aff ? 0.4 : 1, sig1, broken.aff ? 500 : 1000, function () {
      if (broken.aff || broken.cen) { setTimeout(finish, 300); return; }
      var left = 2;
      function one() { if (--left === 0) setTimeout(finish, 200); }
      along(els.inter, 0, 1, sig1, 160, function () {
        along(els.eff, 0, broken.eff ? 0.5 : 1, sig1, broken.eff ? 380 : 700, function () {
          if (!broken.eff && !broken.mus) { muscle.setAttribute('rx', 24); muscle.setAttribute('ry', 15); shout.textContent = '缩手！'; }
          one();
        });
      });
      along(els.asc, 0, broken.asc ? 0.5 : 1, sig2, broken.asc ? 900 : 1700, function () {
        if (!broken.asc) { brainShape.setAttribute('fill', '#f3c9cf'); ouch.textContent = '好痛！'; }
        one();
      });
    });
  }
  function applyEnd(o) {
    if (o.reflex) { muscle.setAttribute('rx', 24); muscle.setAttribute('ry', 15); shout.textContent = '缩手！'; }
    if (o.feel) { brainShape.setAttribute('fill', '#f3c9cf'); ouch.textContent = '好痛！'; }
  }

  /* —— 眼睛 —— */
  var eye = B.$('#eye');
  var PXMM = 6.5, LX = 244, AY = 105;
  var EYES = { normal: { n: '正常眼', d: 0.017 }, myopia: { n: '近视眼', d: 0.0184 } };
  var GLASS = { none: { n: '不戴', p: 0 }, concave: { n: '凹透镜', p: -4.5 }, convex: { n: '凸透镜', p: 4.5 } };
  var PMIN = 1 / 0.017, AMP = 10.5;
  var eyeType = EYES[st.et] ? st.et : 'normal', glass = GLASS[st.g] ? st.g : 'none';
  var distIn = B.$('#dist');
  if (isFinite(+st.d) && st.d !== undefined) distIn.value = B.clamp(+st.d, 0, 100);
  function uOf(v) { return v < 50 ? Math.pow(10, -1 + v / 50) : Math.pow(10, (v - 50) / 50 * Math.log10(20)); }
  function eyeModel() {
    var u = uOf(+distIn.value), d = EYES[eyeType].d, g = GLASS[glass].p;
    var need = 1 / d + 1 / u - g;
    var Pl = B.clamp(need, PMIN, PMIN + AMP);
    var net = Pl + g - 1 / u;
    var v = net > 0 ? 1 / net : Infinity;
    return { u: u, d: d, g: g, Pl: Pl, v: v, acc: (Pl - PMIN) / AMP, offMM: (v - d) * 1000 };
  }
  function fmtU(u) { return u < 1 ? Math.round(u * 100) + ' 厘米' : (u < 10 ? u.toFixed(1) : Math.round(u)) + ' 米'; }
  function drawEye() {
    var m = eyeModel();
    eye.innerHTML = '';
    var retX = LX + m.d * 1000 * PXMM;
    var cxE = (214 + retX) / 2, rxE = (retX - 214) / 2;
    S('rect', { x: 0, y: 0, width: 400, height: 210, rx: 14, fill: '#fbfcf8' }, eye);
    S('path', { d: 'M8 ' + AY + 'H392', stroke: '#e3e8df', 'stroke-dasharray': '2 4' }, eye);
    // 视神经
    S('path', { d: 'M' + (retX - 4) + ' ' + (AY + 10) + 'C' + (retX + 20) + ' ' + (AY + 14) + ' ' + (retX + 30) + ' ' + (AY + 26) + ' 398 ' + (AY + 30), stroke: '#e6cdb1', 'stroke-width': 12, fill: 'none', 'stroke-linecap': 'round' }, eye);
    // 眼球
    S('ellipse', { cx: cxE, cy: AY, rx: rxE, ry: 70, fill: '#fdfaf4', stroke: '#d8c8b0', 'stroke-width': 2 }, eye);
    // 视网膜（后半圈）
    var a0 = -1.15, a1 = 1.15, rp = '';
    for (var i = 0; i <= 30; i++) { var a = a0 + (a1 - a0) * i / 30; rp += (i ? 'L' : 'M') + (cxE + Math.cos(a) * (rxE - 3)).toFixed(1) + ' ' + (AY + Math.sin(a) * 67).toFixed(1); }
    S('path', { d: rp, stroke: '#d98d70', 'stroke-width': 3.5, fill: 'none' }, eye);
    // 角膜
    S('path', { d: 'M226 58C200 78 200 132 226 152', fill: '#e6f1f4', stroke: '#8fb3c0', 'stroke-width': 1.6 }, eye);
    // 虹膜
    S('rect', { x: 234, y: 66, width: 5, height: 22, rx: 2, fill: '#8a6a52' }, eye);
    S('rect', { x: 234, y: 122, width: 5, height: 22, rx: 2, fill: '#8a6a52' }, eye);
    // 睫状体
    S('ellipse', { cx: LX, cy: 76, rx: 6, ry: 4, fill: m.acc > 0.08 ? '#c26f55' : '#d9ab95' }, eye);
    S('ellipse', { cx: LX, cy: 134, rx: 6, ry: 4, fill: m.acc > 0.08 ? '#c26f55' : '#d9ab95' }, eye);
    // 晶状体
    S('ellipse', { cx: LX, cy: AY, rx: 4.5 + m.acc * 9, ry: 25, fill: '#dcebf1', stroke: '#6f9fb0', 'stroke-width': 1.6 }, eye);
    // 眼镜
    if (glass !== 'none') {
      var gx = 186;
      var d = glass === 'concave' ? 'M' + (gx - 8) + ' 72L' + (gx + 8) + ' 72Q' + (gx + 2) + ' ' + AY + ' ' + (gx + 8) + ' 138L' + (gx - 8) + ' 138Q' + (gx - 2) + ' ' + AY + ' ' + (gx - 8) + ' 72z'
                                    : 'M' + gx + ' 72Q' + (gx + 14) + ' ' + AY + ' ' + gx + ' 138Q' + (gx - 14) + ' ' + AY + ' ' + gx + ' 72z';
      S('path', { d: d, fill: '#e8f2f5', stroke: '#7fa6b3', 'stroke-width': 1.4 }, eye);
      S('text', { x: gx, y: 156, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#4e7f8d', text: GLASS[glass].n }, eye);
    }
    // 物体
    var ox = 20 + (1 - (+distIn.value) / 100) * 140;
    S('circle', { cx: ox, cy: AY, r: 5, fill: '#b97342' }, eye);
    S('text', { x: ox, y: AY - 12, 'font-size': 10, 'text-anchor': 'middle', fill: '#9c6334', text: '物体' }, eye);
    S('text', { x: ox, y: AY + 22, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#8b9784', text: fmtU(m.u) }, eye);
    // 光线
    var EXAG = 3;  // 焦点前后偏差放大 3 倍画出来，便于看清
    var Fx = isFinite(m.v) ? retX + (m.v - m.d) * 1000 * PXMM * EXAG : 1e6;
    if (Fx < LX + 30) Fx = LX + 30;
    var spot = 0;
    [-15, 0, 15].forEach(function (h) {
      var gx2 = 186;
      var ly = AY + h;
      var rays = S('g', { stroke: '#e0a64e', 'stroke-width': 1.4, fill: 'none', opacity: 0.95 }, eye);
      S('path', { d: 'M' + ox + ' ' + AY + 'L' + LX + ' ' + ly }, rays);
      var yR;
      if (Fx <= retX) {
        S('path', { d: 'M' + LX + ' ' + ly + 'L' + Fx.toFixed(1) + ' ' + AY }, rays);
        yR = AY - h * (retX - Fx) / (Fx - LX);
        S('path', { d: 'M' + Fx.toFixed(1) + ' ' + AY + 'L' + retX.toFixed(1) + ' ' + yR.toFixed(1) }, rays);
      } else {
        yR = AY + h * (1 - (retX - LX) / (Fx - LX));
        S('path', { d: 'M' + LX + ' ' + ly + 'L' + retX.toFixed(1) + ' ' + yR.toFixed(1) }, rays);
      }
      spot = Math.max(spot, Math.abs(yR - AY));
    });
    var clear = Math.abs(m.offMM) < 0.15;
    if (clear) S('circle', { cx: retX - 2, cy: AY, r: 3.5, fill: '#396b57' }, eye);
    else S('path', { d: 'M' + (retX - 2) + ' ' + (AY - spot) + 'V' + (AY + spot), stroke: '#c0703c', 'stroke-width': 4, 'stroke-linecap': 'round' }, eye);
    if (Fx < retX - 2) { S('circle', { cx: Fx, cy: AY, r: 2.6, fill: '#c0703c' }, eye); S('text', { x: Fx, y: AY - 8, 'font-size': 9, 'text-anchor': 'middle', fill: '#9c6334', text: '聚在这里' }, eye); }
    // 标注
    function t(x, y, s, o) { var a = { x: x, y: y, 'font-size': 10, fill: '#5f7259', text: s }; for (var k in o || {}) a[k] = o[k]; S('text', a, eye); }
    t(212, 50, '角膜', { 'text-anchor': 'middle' });
    t(LX + 8, 190, '晶状体', { 'text-anchor': 'middle' });
    S('path', { d: 'M' + LX + ' 131L' + (LX + 6) + ' 178', stroke: '#c9d3c3' }, eye);
    t(LX + 18, 68, '睫状体');
    t(cxE + 14, 158, '玻璃体', { fill: '#a0ad99' });
    t(retX - 6, 26, '视网膜', { 'text-anchor': 'middle', fill: '#b5654a' });
    t(392, AY + 48, '视神经', { 'text-anchor': 'end' });

    // 读数
    B.$('#dist-out').textContent = fmtU(m.u);
    B.$('#r-lens').textContent = m.acc < 0.06 ? '扁平（放松）' : m.acc < 0.5 ? '稍微变凸' : m.acc < 0.98 ? '明显变凸' : '凸到最大了';
    var pos = clear ? '视网膜上' : (Fx < retX ? '视网膜前方' : '视网膜后方');
    B.$('#r-focus').textContent = pos;
    B.$('#eye-badge').textContent = clear ? '看得清' : '看不清';
    var tx;
    if (eyeType === 'myopia' && glass === 'none') tx = clear ? '近视眼看<b>很近</b>的东西还能看清。把物体往远处拖，看看会怎样。' : '近视眼看远处：眼球前后径太长（或晶状体太凸），光线聚在视网膜<b>前方</b>，看不清。试试戴一副眼镜。';
    else if (eyeType === 'myopia' && glass === 'concave') tx = clear ? '凹透镜先把光线<b>发散</b>一点，再经过晶状体，就正好聚在视网膜上了。' : '戴上凹透镜后，远处已经能看清。东西太近时，晶状体凸到最大也不够。';
    else if (glass === 'convex') tx = '凸透镜会让光线<b>更早</b>会聚，' + (eyeType === 'myopia' ? '近视眼戴它更模糊了！近视要戴凹透镜。' : '正常的眼睛戴它也会看不清。');
    else if (eyeType === 'normal' && glass === 'concave') tx = clear ? '正常的眼睛靠晶状体多变凸一点，还能看清，但会更累。正常眼不需要戴眼镜。' : '正常的眼睛戴凹透镜，看近处会看不清。';
    else if (!clear) tx = '太近了！晶状体已经凸到最大，光线还是聚在视网膜后方。看书写字要保持<b>一尺</b>左右（约 33 厘米）。';
    else if (m.acc < 0.06) tx = '看远处时，睫状体放松，晶状体变扁，光线正好聚在视网膜上。';
    else tx = '看近处时，睫状体收缩，晶状体<b>变凸</b>，折光本领变强，光线还能聚在视网膜上。';
    B.$('#eye-text').innerHTML = tx;
    save();
  }
  B.bindRange(distIn, drawEye);
  var eyeChips = B.chips(B.$('#eye-chips'), Object.keys(EYES).map(function (k) { return { label: EYES[k].n, value: k }; }), eyeType, function (v) { eyeType = v; drawEye(); });
  var glassChips = B.chips(B.$('#glass-chips'), Object.keys(GLASS).map(function (k) { return { label: GLASS[k].n, value: k }; }), glass, function (v) { glass = v; drawEye(); });

  function save() {
    B.setState({ b: Object.keys(broken).filter(function (k) { return broken[k]; }).join(','), et: eyeType, g: glass, d: distIn.value });
  }

  refresh();
  drawEye();

  /* —— 小练习 —— */
  B.quiz([
      {
      level: 'base',
      title: '有痛觉，却不能缩手',
      desc: '弄坏反射弧里的某一部分，让这个人被扎后<b>感觉到痛，但手缩不回来</b>。弄好后按“扎一下手指”。',
      check: function () {
        var o = outcome();
        if (!poked) return { ok: false, msg: '弄坏之后，记得按“扎一下手指”看结果。' };
        if (!o.reflex && o.feel) return { ok: true, msg: '传出神经或效应器坏了：消息能传到大脑（有痛觉），但命令传不到肌肉（不能缩手）。' };
        return { ok: false, msg: '现在是“' + (o.reflex ? '能缩手' : '不能缩手') + '、' + (o.feel ? '有痛觉' : '没痛觉') + '”。想一想：哪一段坏了，消息还能到大脑？' };
      }
    },
      {
      level: 'base',
      title: '能缩手，却没有痛觉',
      desc: '先按“全部修好”，再弄坏一处，让这个人<b>照样缩手，却感觉不到痛</b>。',
      check: function () {
        var o = outcome();
        if (!poked) return { ok: false, msg: '弄坏之后，记得按“扎一下手指”。' };
        if (o.reflex && !o.feel) return { ok: true, msg: '只有通向大脑的脊髓白质断了：脊髓照样指挥缩手，但大脑收不到消息，没有痛觉。' };
        return { ok: false, msg: '提示：缩手只要脊髓就能完成，痛觉却要大脑。哪条路通向大脑？' };
      }
    },
      {
      level: 'base',
      title: '帮近视的同学看清黑板',
      desc: '在“眼睛怎么看远看近”里，选<b>近视眼</b>，把物体拖到<b>5 米以外</b>（像教室后排看黑板），再选一副眼镜让它看清楚。',
      check: function () {
        var m = eyeModel();
        if (eyeType !== 'myopia') return { ok: false, msg: '先把眼睛换成“近视眼”。' };
        if (m.u < 5) return { ok: false, msg: '物体还不够远，拖到 5 米以外。' };
        if (glass !== 'concave') return { ok: false, msg: glass === 'convex' ? '凸透镜让光线更早会聚，更模糊了。换一种。' : '光线聚在视网膜前方，需要一副眼镜把光线先“散开”一点。' };
        return { ok: true, msg: '近视眼戴凹透镜。平时注意：读写姿势端正、眼和书保持一尺、每用眼 40 分钟远眺几分钟，多到户外活动。' };
      }
    },
      {
        level: 'base',
        title: '神经系统结构和功能的基本单位是？',
        desc: '它能传导兴奋。',
        options: ['神经元', '神经', '大脑', '脊髓'],
        answer: 0,
        hint: '由细胞体和突起构成。',
        explain: '<b>神经元（神经细胞）</b>是基本单位，由<b>细胞体和突起</b>构成，能接受刺激、产生并传导兴奋。'
      },
      {
        level: 'base',
        title: '完成反射的结构基础是？',
        desc: '五个环节组成的通路。',
        options: ['反射弧', '神经元', '大脑皮层', '脊髓'],
        answer: 0,
        hint: '从感受器到效应器。',
        explain: '<b>反射弧</b>：感受器 → 传入神经 → 神经中枢 → 传出神经 → 效应器。<b>任何一环受损，反射都不能完成</b>。'
      },
      {
        level: 'base',
        title: '眼球中具有折光作用、相当于照相机镜头的是？',
        desc: '它能调节曲度。',
        options: ['晶状体', '角膜', '视网膜', '虹膜'],
        answer: 0,
        hint: '看远看近靠它变厚变薄。',
        explain: '<b>晶状体</b>相当于镜头，可<b>调节曲度</b>看清远近物体；<b>视网膜</b>相当于底片，上面有感光细胞，是<b>成像</b>的地方。'
      },
      {
        level: 'mid',
        title: '近视眼的成因和矫正方法是？',
        desc: '像落在视网膜哪里。',
        options: ['晶状体曲度过大，像落在视网膜前方，配凹透镜', '晶状体太薄，像落在后方，配凸透镜', '视网膜脱落，手术治疗', '角膜受损，配凸透镜'],
        answer: 0,
        hint: '需要让光线发散一些。',
        explain: '近视：<b>晶状体曲度过大或眼球前后径过长</b>，物像落在视网膜<b>前方</b>，需配<b>凹透镜</b>矫正。远视则相反，配凸透镜。'
      },
      {
        level: 'mid',
        title: '缩手反射的神经中枢位于？',
        desc: '这是低级反射。',
        options: ['脊髓', '大脑皮层', '小脑', '脑干'],
        answer: 0,
        hint: '手缩回来时你还没感觉到疼。',
        explain: '缩手反射是<b>非条件反射</b>，中枢在<b>脊髓</b>，所以反应极快（先缩手、后感觉疼）。<b>条件反射</b>的中枢在<b>大脑皮层</b>。'
      },
      {
        level: 'mid',
        title: '「望梅止渴」属于哪种反射？',
        desc: '它需要后天学习。',
        options: ['条件反射', '非条件反射', '不属于反射', '简单反射'],
        answer: 0,
        hint: '没吃过梅子的人会流口水吗？',
        explain: '<b>条件反射</b>（后天形成，需大脑皮层参与）。<b>吃梅子流口水</b>才是非条件反射（生来就有）。'
      },
      {
        level: 'mid',
        title: '预防近视的「三要四不看」中，正确的做法是？',
        desc: '保护用眼习惯。',
        options: ['读写姿势端正，连续用眼后远眺休息', '躺着看书', '在光线很暗处看书', '走路时看手机'],
        answer: 0,
        hint: '哪种做法减轻了眼睛负担？',
        explain: '要<b>姿势端正、保持距离、定时远眺休息</b>；不在<b>直射阳光下、光线暗处、躺卧时、走路乘车时</b>看书或手机。'
      },
      {
        level: 'trap',
        title: '反射弧中如果传出神经受损，会出现什么现象？',
        desc: '想想哪一环断了。',
        options: ['有感觉但不能运动', '没有感觉也不能运动', '有感觉也能运动', '只是反应变慢'],
        answer: 0,
        hint: '感觉由传入神经负责，运动由传出神经负责。',
        explain: '<b>传出神经受损</b>：刺激仍能沿传入神经传到神经中枢并上传大脑，所以<b>有感觉</b>；但指令传不到效应器，<b>不能运动</b>。若<b>传入神经</b>受损，则<b>既无感觉也不能运动</b>。这组对比年年考。'
      }
    ]);
})();
