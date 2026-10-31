/* 物理互动馆 · 第 11 课 功和机械能 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();
  var G = 10;   // g 取 10 N/kg
  var ready = false;

  /* 每张图一个 clipPath：人、箱子、小车、钢球跑出画布时都裁掉 */
  function clipDefs(el, id, w, h) {
    var defs = S('defs', {}, el), cp = S('clipPath', { id: id }, defs);
    S('rect', { x: 0, y: 0, width: w, height: h, rx: 14 }, cp);
    return defs;
  }
  /* 动画时读数每帧都在算，文字没变就不重写，免得读屏软件一直播报 */
  function setText(el, h) { if (el._t !== h) { el._t = h; el.innerHTML = h; } }
  function sgn(v) { return v > 0 ? 1 : (v < 0 ? -1 : 0); }

  /* ========== ① 做功判断与计算 ========== */
  var SC = {
    lift: { name: '举起杠铃', F: 1000, s: 2, t: 2, sMax: 2, sStep: 0.1 },
    carry: { name: '提着水桶水平走', F: 100, s: 4, t: 5, sMax: 5, sStep: 0.1 },
    stuck: { name: '推箱子没推动', F: 300, s: 0, t: 5, sMax: 5, sStep: 0.1, noS: true },
    ball: { name: '足球离脚后在空中飞', F: 0, s: 15, t: 2, sMax: 20, sStep: 0.5, noF: true },
    push: { name: '推着箱子前进', F: 200, s: 4, t: 8, sMax: 5, sStep: 0.1 }
  };
  var WORDER = ['lift', 'carry', 'stuck', 'ball', 'push'];
  var CHIP = { lift: '举起杠铃', carry: '提桶水平走', stuck: '推箱子没推动', ball: '踢出去的足球', push: '推着箱子前进' };
  var sc = SC[st.w] ? st.w : 'lift';
  var wf = Math.round(L.num(st.F, SC[sc].F, 0, 1000) / 10) * 10;
  var ws = L.num(st.s, SC[sc].s, 0, SC[sc].sMax);
  var wt = Math.round(L.num(st.t, SC[sc].t, 1, 20));
  var wp = 0, wAnim = null;
  var work = L.$('#work'), workDefs = clipDefs(work, 'work-clip', 400, 240);
  var FIn = L.$('#F-in'), sIn = L.$('#s-in'), tIn = L.$('#t-in');
  var FC = '#c2603f', MC = '#5a4097', INK = '#4a4458';

  function effF() { return SC[sc].noF ? 0 : wf; }          // 足球离脚后，脚对球没有力
  function moved() { return SC[sc].noS ? 0 : ws; }         // 没推动，移动距离为 0
  function along() { return sc === 'carry' ? 0 : moved(); } // 提桶：力向上，移动是水平的
  function workJ() { return effF() * along(); }
  function powerW() { return workJ() / wt; }

  /* 简笔小人：脚踩在 (x, foot)，hands 是两只手的位置 */
  function person(g, x, foot, o) {
    o = o || {};
    var lean = o.lean || 0, sh = [x + lean, foot - 78], hip = [x, foot - 45];
    function seg(a, b, w) { S('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: INK, 'stroke-width': w || 3, 'stroke-linecap': 'round' }, g); }
    seg(hip, [x - 9, foot]);
    seg(hip, o.kick ? [x + 22, foot - 10] : [x + 9, foot]);
    seg(hip, sh, 3.4);
    (o.hands || [[sh[0] - 12, foot - 48], [sh[0] + 12, foot - 48]]).forEach(function (hd) { seg(sh, hd, 2.6); });
    S('circle', { cx: x + lean * 1.25, cy: foot - 91, r: 9, fill: '#f2d4b8', stroke: '#c99a72', 'stroke-width': 1.2 }, g);
  }
  function box(g, x, y, w, h, label) {
    S('rect', { x: x, y: y, width: w, height: h, rx: 3, fill: '#e6c995', stroke: '#9c7a4a', 'stroke-width': 1.2 }, g);
    S('path', { d: 'M' + (x + 6) + ' ' + (y + 6) + 'L' + (x + w - 6) + ' ' + (y + h - 6) + 'M' + (x + w - 6) + ' ' + (y + 6) + 'L' + (x + 6) + ' ' + (y + h - 6), stroke: '#c9a46f', 'stroke-width': 1 }, g);
    if (label) S('text', { x: x + w / 2, y: y + h / 2 + 4, 'font-size': 10, 'text-anchor': 'middle', fill: '#7a5a2e', 'font-weight': 600, text: label }, g);
  }
  function sArrow(g, x1, x2) { if (x2 - x1 > 8) L.arrow(g, x1, 220, x2, 220, { color: MC, width: 2, head: 7, label: 's', lx: 4, ly: 4 }); }

  function drawWork() {
    work.innerHTML = ''; work.appendChild(workDefs);
    S('rect', { x: 0, y: 0, width: 400, height: 240, rx: 14, fill: '#fbfaf7' }, work);
    var g = S('g', { 'clip-path': 'url(#work-clip)' }, work);
    S('rect', { x: 0, y: 200, width: 400, height: 40, fill: '#ece6da' }, g);
    S('line', { x1: 0, y1: 200, x2: 400, y2: 200, stroke: '#c9bda6', 'stroke-width': 1.5 }, g);
    var c = SC[sc], p = wp, trav, x, bx;
    if (sc === 'lift') {
      var cx = 200, y0 = 150, by;
      trav = ws / c.sMax * 78; by = y0 - trav * p;
      if (p > 0) S('line', { x1: 128, y1: y0, x2: 272, y2: y0, stroke: '#b8b2c6', 'stroke-dasharray': '4 4' }, g);
      person(g, cx, 200, { hands: [[cx - 22, by], [cx + 22, by]] });
      S('line', { x1: cx - 64, y1: by, x2: cx + 64, y2: by, stroke: '#6b6478', 'stroke-width': 3 }, g);
      [-1, 1].forEach(function (k) {
        S('rect', { x: cx + k * 52 - 4, y: by - 17, width: 8, height: 34, rx: 2, fill: '#5b5368' }, g);
        S('rect', { x: cx + k * 60 - 3, y: by - 11, width: 6, height: 22, rx: 2, fill: '#7a7088' }, g);
      });
      S('text', { x: cx - 72, y: by + 4, 'font-size': 10, 'text-anchor': 'end', fill: '#6b6478', text: '杠铃重 ' + wf + ' N' }, g);
      if (wf > 0) L.arrow(g, cx + 84, by, cx + 84, by - 42, { color: FC, width: 2.4, head: 8, label: 'F' });
      if (trav * p > 8) L.arrow(g, cx + 112, y0, cx + 112, by, { color: MC, width: 2, head: 7, label: 's', lx: 5, ly: 10 });
    } else if (sc === 'carry') {
      trav = ws / c.sMax * 250; x = 60 + trav * p;
      var hx = x + 18, hy = 140;
      person(g, x, 200, { hands: [[x - 12, 152], [hx, hy]] });
      S('path', { d: 'M' + (hx - 11) + ' ' + (hy + 12) + 'Q' + hx + ' ' + (hy - 12) + ' ' + (hx + 11) + ' ' + (hy + 12), fill: 'none', stroke: '#6b6478', 'stroke-width': 1.4 }, g);
      S('path', { d: 'M' + (hx - 13) + ' ' + (hy + 12) + 'h26l-3 26h-20z', fill: '#9fc3de', stroke: '#5f87a8', 'stroke-width': 1.2 }, g);
      if (wf > 0) L.arrow(g, hx, hy, hx, hy - 44, { color: FC, width: 2.4, head: 8, label: 'F 向上' });
      sArrow(g, 78, hx);
      S('text', { x: 200, y: 236, 'font-size': 9.5, 'text-anchor': 'middle', fill: MC, text: '水桶水平移动，和提力方向垂直' }, g);
    } else if (sc === 'stuck') {
      bx = 150 + (wAnim ? Math.sin(wp * 260) * 0.9 : 0);
      box(g, bx, 130, 92, 70, '很重的箱子');
      person(g, 118, 200, { lean: 12, hands: [[bx, 152], [bx, 162]] });
      if (wf > 0) L.arrow(g, bx, 118, bx + 52, 118, { color: FC, width: 2.4, head: 8, label: 'F' });
      S('text', { x: bx + 46, y: 224, 'font-size': 11, 'text-anchor': 'middle', fill: MC, 'font-weight': 600, text: '纹丝不动：s = 0' }, g);
    } else if (sc === 'ball') {
      trav = ws / c.sMax * 280;
      var x0 = 84, apex = 30 + 80 * ws / c.sMax, d = '';
      for (var i = 0; i <= 30; i++) { var q = i / 30; d += (i ? 'L' : 'M') + (x0 + trav * q).toFixed(1) + ' ' + (192 - 4 * apex * q * (1 - q)).toFixed(1); }
      if (trav > 4) S('path', { d: d, fill: 'none', stroke: '#b8b2c6', 'stroke-width': 1.2, 'stroke-dasharray': '4 4' }, g);
      person(g, 50, 200, { kick: true, hands: [[36, 150], [66, 144]] });
      var px = x0 + trav * p, py = 192 - 4 * apex * p * (1 - p);
      S('circle', { cx: px, cy: py, r: 8, fill: '#fff', stroke: '#3e3550', 'stroke-width': 1.4 }, g);
      S('path', { d: 'M' + px + ' ' + (py - 3.5) + 'l3.3 2.4-1.3 3.9h-4l-1.3-3.9z', fill: '#3e3550' }, g);
      S('text', { x: px, y: py - 14, 'font-size': 10, 'text-anchor': 'middle', fill: FC, 'font-weight': 600, text: '脚的力 = 0' }, g);
      if (p > 0 && p < 1) L.arrow(g, px, py + 10, px, py + 32, { color: '#8a8598', width: 1.6, head: 6, label: 'G', lx: 4, ly: 2, fs: 9.5 });
      sArrow(g, x0, x0 + trav * p);
    } else {
      trav = ws / c.sMax * 190; bx = 140 + trav * p;
      if (p > 0) S('rect', { x: 140, y: 140, width: 60, height: 60, rx: 3, fill: 'none', stroke: '#b8b2c6', 'stroke-dasharray': '4 3' }, g);
      box(g, bx, 140, 60, 60, '箱子');
      person(g, bx - 32, 200, { lean: 12, hands: [[bx, 160], [bx, 168]] });
      if (wf > 0) L.arrow(g, bx, 126, bx + 50, 126, { color: FC, width: 2.4, head: 8, label: 'F' });
      sArrow(g, 140, bx);
    }
    // 计时和已做的功
    S('text', { x: 14, y: 24, 'font-size': 11, fill: MC, 'font-weight': 600, text: p > 0 ? '计时 ' + L.fmt(p * wt, 1) + ' s' : '点「开始」看做功过程' }, g);
    if (p > 0) S('text', { x: 14, y: 40, 'font-size': 10.5, fill: '#6b6478', text: '人已做功 ' + L.fmt(workJ() * p, 0) + ' J' }, g);
    S('text', { x: 386, y: 24, 'font-size': 10.5, 'text-anchor': 'end', fill: '#8a8598', text: c.name }, g);
  }

  function readWork() {
    var c = SC[sc], Fe = effF(), sa = along(), W = workJ(), P = powerW();
    L.$('#F-out').textContent = c.noF ? '0 N（球已离开脚）' : wf + ' N';
    L.$('#s-out').textContent = c.noS ? '0 m（没推动）' : L.fmt(ws, 1) + ' m';
    L.$('#t-out').textContent = wt + ' s';
    L.$('#w-badge').textContent = W > 0 ? '做功' : '不做功';
    L.$('#w-F').innerHTML = L.qty(Fe, 'N', 0);
    L.$('#w-s').innerHTML = sc === 'carry' ? '0<small>m（水平走了 ' + L.fmt(ws, 1) + ' m）</small>' : L.qty(sa, 'm', 1);
    L.$('#w-W').innerHTML = L.qty(W, 'J', 0);
    L.$('#w-P').innerHTML = L.qty(P, 'W', 1);
    var ok = { force: Fe > 0, dist: sa > 0 };
    L.$$('#w-cond li').forEach(function (li) {
      var yes = ok[li.dataset.c];
      li.className = yes ? 'yes' : 'no';
      li.querySelector('i').textContent = yes ? '✓' : '✗';
    });
    L.$('#w-formula').innerHTML =
      '<span class="step"><var>W</var> = <var>F</var><var>s</var> = ' + Fe + ' N × ' + L.fmt(sa, 1) + ' m = <b>' + L.fmt(W, 0) + ' J</b></span>' +
      '<span class="step"><var>P</var> = <var>W</var> / <var>t</var> = ' + L.fmt(W, 0) + ' J ÷ ' + wt + ' s = <b>' + L.fmt(P, 1) + ' W</b></span>';
    L.$$('#w-table tbody tr').forEach(function (tr) { tr.classList.toggle('on', tr.dataset.r === sc); });
    var t;
    if (sc === 'carry') t = '手对水桶的力<b>竖直向上</b>，水桶却是<b>水平</b>移动的，在力的方向上没有移动距离，所以提力<b>不做功</b>。手酸是肌肉在用力，不等于做了功。';
    else if (sc === 'stuck') t = '用了 ' + wf + ' N 的力，可箱子没动，s = 0，所以<b>不做功</b>。再累也是“劳而无功”。';
    else if (sc === 'ball') t = '球离开脚以后，脚对球已经没有力了，球是靠<b>惯性</b>往前飞的，人对球<b>不做功</b>。（球在空中还受重力，那是重力做不做功的问题，跟人无关。）';
    else if (Fe === 0) t = '力是 0，就谈不上做功。把力调大一些。';
    else if (sa === 0) t = '有力，但物体没有移动，s = 0，<b>不做功</b>。把距离调大一些。';
    else {
      t = (sc === 'lift' ? '举力向上，杠铃也向上移动了 ' + L.fmt(sa, 1) + ' m（匀速举起时，举力等于杠铃的重力）' : '推力向前，箱子也向前移动了 ' + L.fmt(sa, 1) + ' m') +
        '，两个因素都有，<b>做了功</b>。功率 ' + L.fmt(P, 1) + ' W，就是<b>每秒做功 ' + L.fmt(P, 1) + ' J</b>。把时间调短，功不变，功率变大——做功更快了。';
    }
    setText(L.$('#w-text'), t);
    save();
  }

  function applyCfg() {
    var c = SC[sc];
    sIn.max = c.sMax; sIn.step = c.sStep;
    ws = +(Math.round(L.clamp(ws, 0, c.sMax) / c.sStep) * c.sStep).toFixed(1);
    sIn.value = c.noS ? 0 : ws;
    FIn.value = c.noF ? 0 : wf;
    tIn.value = wt;
    sIn.disabled = !!c.noS; FIn.disabled = !!c.noF;
    L.$('#s-r1').textContent = L.fmt(c.sMax / 2, 1) + ' m';
    L.$('#s-r2').textContent = c.sMax + ' m';
    [FIn, sIn, tIn].forEach(L.paintRange);
  }
  function wStop() { if (wAnim) wAnim.stop(); wAnim = null; }
  function wReset() { wStop(); wp = 0; drawWork(); readWork(); }
  function wGo() {
    wStop(); wp = 0;
    if (L.REDUCED) { wp = 1; drawWork(); readWork(); return; }
    var D = L.clamp(wt * 0.4, 1.2, 6);   // 动画时长（真实秒），计时按 t 等比例换算
    wAnim = L.loop(function (dt) {
      wp = Math.min(1, wp + dt / D);
      drawWork();
      if (wp >= 1) { wAnim = null; readWork(); return false; }
    });
  }
  L.chips(L.$('#w-chips'), WORDER.map(function (k) { return { label: CHIP[k], value: k }; }), sc, function (v) {
    sc = v; wf = SC[v].F; ws = SC[v].s; wt = SC[v].t;
    applyCfg(); wReset();
  });
  L.bindRange(FIn, function (v) { wf = v; wReset(); });
  L.bindRange(sIn, function (v) { ws = v; wReset(); });
  L.bindRange(tIn, function (v) { wt = v; wReset(); });
  L.$('#w-go').addEventListener('click', wGo);
  L.$('#w-reset').addEventListener('click', wReset);

  /* ========== ② 过山车：机械能的转化 ========== */
  var M = 200;                 // 小车连同乘客 200 kg
  var AF = 1.0;                // 有摩擦时：阻力产生的减速度 1 m/s²（即阻力 200 N）
  var SLOW = 0.8, EMAX = M * G * 10;
  /* 轨道高度（m），水平方向 0～20 m：左墙 → 谷底 → 4 m 小山 → 谷底 → 右墙，接缝处都是平滑的 */
  function trackH(x) {
    if (x <= 5) return 10.5 * (1 - Math.sin(Math.PI / 2 * x / 5));
    if (x <= 15) return 2 * (1 - Math.cos(2 * Math.PI * (x - 5) / 10));
    return 10.5 * (1 - Math.cos(Math.PI / 2 * (x - 15) / 5));
  }
  /* 预先算好“沿轨道的路程 → 位置”的表，小车按路程运动 */
  var NT = 800, TX = [], TH = [], TS = [];
  (function () {
    for (var i = 0; i <= NT; i++) {
      var xx = 20 * i / NT, hh = trackH(xx);
      TS.push(i ? TS[i - 1] + Math.hypot(xx - TX[i - 1], hh - TH[i - 1]) : 0);
      TX.push(xx); TH.push(hh);
    }
  })();
  var STOT = TS[NT];
  function at(sv) {
    sv = L.clamp(sv, 0, STOT);
    var lo = 0, hi = NT;
    while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (TS[mid] <= sv) lo = mid; else hi = mid; }
    var ds = TS[hi] - TS[lo] || 1, f = (sv - TS[lo]) / ds;
    return { x: L.lerp(TX[lo], TX[hi], f), h: L.lerp(TH[lo], TH[hi], f), k: (TH[hi] - TH[lo]) / ds };   // k = 坡度 dh/ds
  }
  function sOfH(h) {   // 左墙上高度为 h 的点
    for (var i = 1; i <= NT; i++) if (TH[i] <= h) return L.lerp(TS[i - 1], TS[i], (TH[i - 1] - h) / (TH[i - 1] - TH[i]));
    return 0;
  }
  var PXM = 17.5;   // 水平方向 1 m = 17.5 px，右边留出高度刻度
  function CX(x) { return 14 + x * PXM; }
  function CY(h) { return 208 - h * 16; }
  var trackD = '';
  for (var ti = 0; ti <= 240; ti++) { var tx = 20 * ti / 240; trackD += (ti ? 'L' : 'M') + CX(tx).toFixed(1) + ' ' + CY(trackH(tx)).toFixed(1); }

  var hH = Math.round(L.num(st.H, 8, 2, 10) * 2) / 2;
  var fr = st.fr === '1';
  var co = null, coAnim = null, coDrag = false, coVisible = true;
  var coSvg = L.$('#coaster'), coDefs = clipDefs(coSvg, 'co-clip', 400, 240);
  S('rect', { x: 0, y: 0, width: 400, height: 240, rx: 14, fill: '#fbfaf7' }, coSvg);
  var coG = S('g', { 'clip-path': 'url(#co-clip)' }, coSvg);
  var coLayer = S('g', {}, coG);
  /* 小车只建一次，重画背景时不动它，键盘焦点不会丢 */
  var carG = S('g', { class: 'pt', tabindex: 0, role: 'slider', 'aria-label': '过山车释放高度', 'aria-valuemin': 2, 'aria-valuemax': 10 }, coG);
  S('rect', { x: -20, y: -34, width: 40, height: 40, fill: 'transparent' }, carG);
  S('circle', { cx: 0, cy: -21, r: 4, fill: '#f2d4b8', stroke: '#c99a72' }, carG);
  S('rect', { x: -13, y: -17, width: 26, height: 11, rx: 3, fill: '#c2603f' }, carG);
  S('circle', { cx: -8, cy: -4, r: 3.2, fill: '#3e3550' }, carG);
  S('circle', { cx: 8, cy: -4, r: 3.2, fill: '#3e3550' }, carG);

  function drawCo() {
    coLayer.innerHTML = '';
    var g = coLayer;
    for (var x = 0.5; x < 20; x += 1) S('line', { x1: CX(x), y1: CY(trackH(x)), x2: CX(x), y2: 208, stroke: '#e3dfea', 'stroke-width': 1.5 }, g);
    S('rect', { x: 0, y: 208, width: 400, height: 32, fill: '#ece6da' }, g);
    // 高度刻度（右侧）
    for (var h = 0; h <= 10; h += 2) {
      S('line', { x1: 386, y1: CY(h), x2: 392, y2: CY(h), stroke: '#a39cb3' }, g);
      S('text', { x: 398, y: CY(h) + 3, 'font-size': 9, 'text-anchor': 'end', fill: '#8a8598', text: h }, g);
    }
    S('text', { x: 396, y: 232, 'font-size': 9, 'text-anchor': 'end', fill: '#8a8598', text: '高度 m' }, g);
    S('path', { d: trackD, fill: 'none', stroke: fr ? '#9b8f7a' : '#7a6aa8', 'stroke-width': 4, 'stroke-linejoin': 'round' }, g);
    S('path', { d: trackD, fill: 'none', stroke: '#fff', 'stroke-width': 1, opacity: 0.6, 'stroke-dasharray': fr ? '2 3' : null }, g);
    // 出发高度
    S('line', { x1: CX(0), y1: CY(hH), x2: CX(20), y2: CY(hH), stroke: '#c2603f', 'stroke-dasharray': '5 4', opacity: 0.7 }, g);
    S('text', { x: 300, y: CY(hH) - 5, 'font-size': 10, 'text-anchor': 'middle', fill: '#a4492b', 'font-weight': 600, text: '出发高度 ' + L.fmt(hH, 1) + ' m' }, g);
    S('text', { x: CX(10), y: CY(4) + 18, 'font-size': 10, 'text-anchor': 'middle', fill: '#5a4097', text: '小山 4 m' }, g);
    S('text', { x: 200, y: 20, 'font-size': 10.5, 'text-anchor': 'middle', fill: fr ? '#9c5231' : '#5a4097', 'font-weight': 600, text: fr ? '有摩擦的轨道' : '无摩擦（理想）轨道' }, g);
    if (co.phase === 'ready') S('text', { x: CX(at(co.s).x) + 18, y: CY(hH) - 22, 'font-size': 9.5, fill: '#7a6aa8', text: '↕ 拖我' }, g);
  }
  function placeCar() {
    var a = at(co.s), dx = Math.sqrt(Math.max(0, 1 - a.k * a.k));
    var ang = Math.atan2(-16 * a.k, PXM * dx) * 180 / Math.PI;
    carG.setAttribute('transform', 'translate(' + CX(a.x).toFixed(1) + ' ' + CY(a.h).toFixed(1) + ') rotate(' + ang.toFixed(1) + ')');
    carG.setAttribute('aria-valuenow', hH);
  }

  function coStep(dt) {
    var n = 12, h = dt * SLOW / n;
    for (var k = 0; k < n; k++) {
      var a = at(co.s), acc = -G * a.k;          // 重力沿轨道方向的分量
      if (fr) {
        if (Math.abs(co.v) < 0.03 && Math.abs(acc) <= AF) { co.v = 0; co.phase = 'stop'; return; }   // 静摩擦能拉住：停下
        acc -= AF * (co.v !== 0 ? sgn(co.v) : sgn(acc));
      }
      co.v += acc * h;
      var s1 = L.clamp(co.s + co.v * h, 0, STOT);
      if (fr) { var lost = M * AF * Math.abs(s1 - co.s); co.E -= lost; co.Q += lost; }
      co.s = s1;
      // 跑得快时用能量把速度校准一下，机械能不会因为数值误差慢慢漂移；转折点附近速度很小，交给积分自己掉头
      if (Math.abs(co.v) > 0.5) {
        var need = co.E - M * G * at(co.s).h;
        if (need > 0) co.v = sgn(co.v) * Math.sqrt(2 * need / M);
      }
    }
  }
  function coStop() { if (coAnim) coAnim.stop(); coAnim = null; }
  function coReset() {
    coStop();
    co = { s: sOfH(hH), v: 0, E: M * G * hH, Q: 0, phase: 'ready' };
    drawCo(); placeCar(); readCo();
  }
  function coGo() {
    coReset();
    co.phase = 'run';
    drawCo(); readCo();
    if (L.REDUCED) {   // 减少动态效果：直接跳到结果（无摩擦：到达另一侧最高点；有摩擦：停下）
      for (var i = 0; i < 40000 && co.phase === 'run'; i++) { coStep(1 / 60); if (!fr && i > 10 && co.v < 0) break; }
      placeCar(); readCo(); return;
    }
    coAnim = L.loop(function (dt) {
      if (!coVisible) return;
      coStep(dt);
      placeCar(); readCo();
      if (co.phase === 'stop') { coAnim = null; return false; }
    });
  }
  function setH(v) {
    hH = Math.round(L.clamp(v, 2, 10) * 2) / 2;
    HIn.value = hH; L.paintRange(HIn);
    coReset();
  }

  function bar(id, val) {
    L.$('#' + id + '-fill').style.width = L.clamp(val / EMAX * 100, 0, 100).toFixed(1) + '%';
    L.$('#' + id + '-val').textContent = L.fmt(val, 0) + ' J';
  }
  function readCo() {
    var a = at(co.s), Em = Math.max(0, co.E), Ep = Math.min(M * G * a.h, Em), Ek = Em - Ep, v = Math.sqrt(2 * Ek / M);
    L.$('#H-out').textContent = L.fmt(hH, 1) + ' m';
    L.$('#co-h').innerHTML = L.qty(a.h, 'm', 1);
    L.$('#co-v').innerHTML = L.qty(v, 'm/s', 1);
    bar('ek', Ek); bar('ep', Ep); bar('em', Em); bar('q', co.Q);
    var down = a.k * co.v < -0.02, up = a.k * co.v > 0.02, badge, t;
    var E0 = L.fmt(M * G * hH, 0);
    if (co.phase === 'ready') {
      badge = '准备出发';
      t = '小车停在 ' + L.fmt(hH, 1) + ' m 高处，速度为 0，动能为 0，只有重力势能 ' + E0 + ' J，所以机械能 = ' + E0 + ' J。';
      if (hH <= 4) t += '出发点不比小山高，猜猜它能翻过去吗？';
    } else if (co.phase === 'stop') {
      badge = '停下了';
      t = '小车最后停在谷底。出发时的 ' + E0 + ' J 机械能几乎<b>全部变成了内能</b>，轨道、车轮和空气都变热了一点。机械能没了，能量的总量却没有少。';
    } else {
      badge = down ? '势能 → 动能' : (up ? '动能 → 势能' : '转折点');
      if (down) t = '下坡：高度降低，速度变大，<b>重力势能转化为动能</b>。';
      else if (up) t = '上坡：速度变小，高度升高，<b>动能转化为重力势能</b>。';
      else t = '在这一点上转换方向。';
      if (fr) t += '有摩擦：小车克服阻力做功，<b>机械能越来越少</b>，少掉的部分变成了内能，所以它一次比一次爬得低。';
      else if (hH <= 4) t += '没有摩擦，机械能保持 ' + E0 + ' J 不变。但它不够翻过 4 m 的小山（需要 8000 J），只能在左边谷里来回滚。';
      else t += '没有摩擦，动能 + 重力势能始终等于 ' + E0 + ' J，<b>机械能守恒</b>，小车总能回到出发时的高度。';
    }
    L.$('#co-badge').textContent = badge;
    setText(L.$('#co-text'), t);
    save();
  }

  carG.addEventListener('pointerdown', function (e) { coStop(); coDrag = true; try { coSvg.setPointerCapture(e.pointerId); } catch (err) {} e.preventDefault(); });
  carG.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { setH(hH + 0.5); e.preventDefault(); }
    if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { setH(hH - 0.5); e.preventDefault(); }
  });
  coSvg.addEventListener('pointermove', function (e) { if (coDrag) setH((208 - L.svgPoint(coSvg, e).y) / 16); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (n) { coSvg.addEventListener(n, function () { coDrag = false; }); });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { coVisible = es[0].isIntersecting; }).observe(coSvg);

  var HIn = L.$('#H-in');
  HIn.value = hH;
  L.bindRange(HIn, function (v) { hH = v; coReset(); });
  L.chips(L.$('#fr-chips'), [{ label: '无摩擦（理想）', value: '0' }, { label: '有摩擦', value: '1' }], fr ? '1' : '0', function (v) { fr = v === '1'; coReset(); });
  L.$('#co-go').addEventListener('click', coGo);
  L.$('#co-reset').addEventListener('click', coReset);

  /* ========== ③ 钢球撞木块：动能的影响因素 ========== */
  var keSvg = L.$('#ke'), keDefs = clipDefs(keSvg, 'ke-clip', 400, 220);
  var kh = [10, 20, 30].indexOf(+st.kh) >= 0 ? +st.kh : 20;     // 释放高度 cm
  var km = st.km === '200' ? 200 : 100;                          // 钢球质量 g
  var keRec = {};                                                // 'h-m' → 木块被推动的距离 cm
  var KB = 170, KY = 176, KP = 4;      // 斜面底端；斜面 45°，高度每 1 cm 对应 4 px
  var DPX = 5.5, BLK0 = 186;           // 水平面上 1 cm = 5.5 px；木块起点（左边缘）
  var KSLOW = 0.25, SIN45 = Math.SQRT1_2;
  var kr = null, keAnim = null;

  function ballR() { return km === 200 ? 9 : 7; }        // 同种钢材，质量是 2 倍，半径约 1.26 倍
  function keV() { return Math.sqrt(2 * G * kh / 100); } // 斜面光滑：v = √(2gh)，与质量无关
  function keDist() { return km / 1000 * G * kh / 100 * 50; }   // 钢球动能 mgh（J）× 50 cm/J

  function drawKe() {
    keSvg.innerHTML = ''; keSvg.appendChild(keDefs);
    S('rect', { x: 0, y: 0, width: 400, height: 220, rx: 14, fill: '#fbfaf7' }, keSvg);
    var g = S('g', { 'clip-path': 'url(#ke-clip)' }, keSvg);
    S('path', { d: 'M' + (KB - 33 * KP) + ' ' + (KY - 33 * KP) + 'L' + KB + ' ' + KY + 'L' + (KB - 33 * KP) + ' ' + KY + 'z', fill: '#efe4cf', stroke: '#c9a873', 'stroke-width': 1.2 }, g);
    S('rect', { x: 0, y: KY, width: 400, height: 10, fill: '#ead6ae', stroke: '#c9b79a', 'stroke-width': 1 }, g);
    [10, 20, 30].forEach(function (h) {
      var x = KB - h * KP, y = KY - h * KP;
      S('circle', { cx: x, cy: y, r: 2.2, fill: h === kh ? '#5a4097' : '#b8b2c6' }, g);
      S('text', { x: x - 4, y: y + 13, 'font-size': 9, 'text-anchor': 'end', fill: h === kh ? '#5a4097' : '#8a8598', 'font-weight': h === kh ? 600 : null, text: h + ' cm' }, g);
    });
    // 刻度尺：从木块原来的位置量起
    for (var c = 0; c <= 30; c += 5) {
      var x = BLK0 + c * DPX, big = c % 10 === 0;
      S('line', { x1: x, y1: KY + 12, x2: x, y2: KY + (big ? 20 : 16), stroke: '#a39cb3', 'stroke-width': 1 }, g);
      if (big) S('text', { x: x, y: KY + 31, 'font-size': 9, 'text-anchor': 'middle', fill: '#8a8598', text: c }, g);
    }
    S('text', { x: 394, y: KY + 31, 'font-size': 9, 'text-anchor': 'end', fill: '#8a8598', text: 'cm' }, g);
    // 木块
    var bx = BLK0 + kr.d * DPX;
    if (kr.d > 0.3) S('rect', { x: BLK0, y: KY - 22, width: 34, height: 22, fill: 'none', stroke: '#b8b2c6', 'stroke-dasharray': '3 3' }, g);
    S('rect', { x: bx, y: KY - 22, width: 34, height: 22, rx: 2, fill: '#d9b98a', stroke: '#9c7a4a', 'stroke-width': 1.2 }, g);
    S('text', { x: bx + 17, y: KY - 8, 'font-size': 9, 'text-anchor': 'middle', fill: '#7a5a2e', text: '木块' }, g);
    if (kr.phase === 'done') {
      S('line', { x1: BLK0, y1: KY - 30, x2: bx, y2: KY - 30, stroke: '#a4492b', 'stroke-width': 1.2 }, g);
      S('text', { x: (BLK0 + bx) / 2, y: KY - 35, 'font-size': 10, 'text-anchor': 'middle', fill: '#a4492b', 'font-weight': 600, text: L.fmt(kr.d, 0) + ' cm' }, g);
    }
    // 钢球
    var r = ballR(), cx, cy;
    if (kr.phase === 'ready' || kr.phase === 'ramp') { cx = KB - kr.hc * KP + r * SIN45; cy = KY - kr.hc * KP - r * SIN45; }
    else if (kr.phase === 'roll') { cx = kr.bx; cy = KY - r; }
    else { cx = bx - r; cy = KY - r; }
    S('circle', { cx: cx, cy: cy, r: r, fill: '#9aa3b2', stroke: '#5b6475', 'stroke-width': 1.2 }, g);
    S('circle', { cx: cx - r * 0.35, cy: cy - r * 0.35, r: r * 0.3, fill: '#e8ebf0' }, g);
    S('text', { x: 14, y: 22, 'font-size': 10.5, fill: '#5a4097', 'font-weight': 600, text: '钢球 ' + km + ' g，从 ' + kh + ' cm 高处滚下' }, g);
  }

  function keStep(dt) {
    dt *= KSLOW;
    if (kr.phase === 'ramp') {
      kr.v += G * SIN45 * dt;
      kr.hc = kh - (kr.v * kr.v / (2 * G)) * 100;      // 下降的高度 = v²/(2g)
      if (kr.hc <= 0) { kr.hc = 0; kr.v = keV(); kr.phase = 'roll'; kr.bx = KB + ballR() * SIN45; }
    } else if (kr.phase === 'roll') {
      kr.bx += kr.v * 100 * DPX * dt;
      if (kr.bx >= BLK0 - ballR()) { kr.phase = 'push'; kr.d = 0; }
    } else if (kr.phase === 'push') {
      var D = keDist() / 100, a = keV() * keV() / (2 * D);   // 木块受恒定摩擦力 → 匀减速
      kr.v = Math.max(0, kr.v - a * dt);
      kr.d = (keV() * keV() - kr.v * kr.v) / (2 * a) * 100;
      if (kr.v <= 0) { kr.d = keDist(); kr.phase = 'done'; keRec[kh + '-' + km] = kr.d; }
    }
  }
  function keStop() { if (keAnim) keAnim.stop(); keAnim = null; }
  function keReset() { keStop(); kr = { phase: 'ready', hc: kh, v: 0, bx: 0, d: 0 }; drawKe(); readKe(); }
  function keGo() {
    keReset();
    kr.phase = 'ramp';
    if (L.REDUCED) { kr.phase = 'done'; kr.d = keDist(); keRec[kh + '-' + km] = kr.d; drawKe(); readKe(); return; }
    keAnim = L.loop(function (dt) {
      keStep(dt);
      drawKe(); readKe();
      if (kr.phase === 'done') { keAnim = null; return false; }
    });
  }

  function readKe() {
    L.$('#ke-h').innerHTML = L.qty(kh, 'cm', 0);
    L.$('#ke-m').innerHTML = L.qty(km, 'g', 0);
    L.$('#ke-v').innerHTML = L.qty(keV(), 'm/s', 2);
    L.$('#ke-d').innerHTML = kr.phase === 'done' ? L.qty(kr.d, 'cm', 0) : '—';
    L.$('#ke-badge').textContent = { ready: '准备', ramp: '滚下斜面', roll: '滚向木块', push: '推动木块', done: '停下' }[kr.phase];
    L.$$('#ke-table tbody tr').forEach(function (tr) {
      tr.classList.toggle('on', +tr.dataset.h === kh);
      L.$$('td.n', tr).forEach(function (td) {
        var v = keRec[tr.dataset.h + '-' + td.dataset.m];
        td.textContent = v === undefined ? '—' : L.fmt(v, 0) + ' cm';
      });
    });
    var t;
    if (kr.phase === 'ready') t = km + ' g 的钢球停在 ' + kh + ' cm 高处。点「放手」，看它把木块推多远。';
    else if (kr.phase === 'ramp') t = '钢球加速滚下，<b>重力势能转化为动能</b>。';
    else if (kr.phase === 'roll') t = '到达水平面时速度是 ' + L.fmt(keV(), 2) + ' m/s。从同一高度滚下，不管钢球大小，这个速度都一样。';
    else if (kr.phase === 'push') t = '钢球撞上木块，推着木块前进，克服摩擦做功。';
    else {
      t = '木块被推动 ' + L.fmt(kr.d, 0) + ' cm。';
      var both = keRec[kh + '-100'] !== undefined && keRec[kh + '-200'] !== undefined;
      var hs = [10, 20, 30].filter(function (h) { return keRec[h + '-' + km] !== undefined; }).length;
      if (both) t += '同一高度（速度相同），200 g 钢球推得更远：<b>速度相同时，质量越大，动能越大</b>。';
      if (hs >= 2) t += '同一个钢球，高度越高，到达水平面的速度越大，推得越远：<b>质量相同时，速度越大，动能越大</b>。';
      if (!both && hs < 2) t += '每次只改一个量（高度或钢球），再做一次比一比。';
    }
    setText(L.$('#ke-text'), t);
    save();
  }

  L.chips(L.$('#kh-chips'), [{ label: '10 cm', value: '10' }, { label: '20 cm', value: '20' }, { label: '30 cm', value: '30' }], String(kh), function (v) { kh = +v; keReset(); });
  L.chips(L.$('#km-chips'), [{ label: '100 g 小钢球', value: '100' }, { label: '200 g 大钢球', value: '200' }], String(km), function (v) { km = +v; keReset(); });
  L.$('#ke-go').addEventListener('click', keGo);
  L.$('#ke-reset').addEventListener('click', keReset);

  function save() {
    if (!ready) return;
    L.setState({ w: sc, F: wf, s: ws, t: wt, H: hH, fr: fr ? 1 : 0, kh: kh, km: km });
  }

  applyCfg();
  wReset();
  coReset();
  keReset();
  ready = true;
  save();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '让推力对箱子做 1200 J 的功',
      desc: '在做功模型里选“推着箱子前进”，调力 F 和距离 s，使推力做的功正好是 1200 J。',
      label: '在做功模型里操作',
      button: '检查功的大小',
      check: function () {
        if (sc !== 'push') return { ok: false, msg: '先选“推着箱子前进”这个情景。' };
        var W = workJ();
        if (Math.abs(W - 1200) > 0.5) return { ok: false, msg: '现在 W = Fs = ' + wf + ' N × ' + L.fmt(ws, 1) + ' m = ' + L.fmt(W, 0) + ' J，' + (W < 1200 ? '还不够' : '多了') + '。想一想：' + L.fmt(ws, 1) + ' m 的话，力要多大？' };
        return { ok: true, msg: 'W = Fs = ' + wf + ' N × ' + L.fmt(ws, 1) + ' m = 1200 J。300 N × 4 m、400 N × 3 m、600 N × 2 m 都行：力和距离的乘积一样，功就一样。' };
      }
    },
    {
      level: 'base',
      title: '下列情景中，人对物体做了功的是',
      desc: '对照做功的两个必要因素逐个检查。',
      options: ['把杠铃从地上举过头顶', '提着水桶在水平路面上匀速走', '用力推箱子，箱子没动', '足球离开脚后在空中飞行'],
      answer: 0,
      hint: '两个因素缺一不可：有力作用在物体上，物体还要沿这个力的方向移动距离。',
      explain: '举杠铃时力向上、杠铃也向上移动，<b>做了功</b>。提桶水平走，力向上而移动方向是水平的，不做功；推箱子没推动，s = 0，不做功；足球离脚后脚对球没有力了，球靠惯性飞，人不做功。'
    },
    {
      level: 'base',
      title: '功率的单位 1 W 表示',
      desc: '想一想功率的公式 P = W/t。',
      options: ['1 s 内做功 1 J', '做了 1 J 的功', '用 1 N 的力推物体', '物体在 1 s 内移动了 1 m'],
      answer: 0,
      hint: 'P = W/t，所以 1 W = 1 J/s。',
      explain: '1 W = 1 J/s，就是<b>每秒做功 1 J</b>。“做了 1 J 的功”只说了做功多少，没说用了多长时间；1 N 是力的大小，1 s 移动 1 m 是速度，都不是功率。'
    },
    {
      level: 'mid',
      title: '让过山车刚好能翻过中间的小山',
      desc: '在过山车里选“无摩擦（理想）”，把释放高度调到能翻过 4 m 的小山、但不超过 5 m。可以点「放手」验证。',
      label: '在过山车模型里操作',
      button: '检查释放高度',
      check: function () {
        if (fr) return { ok: false, msg: '现在是有摩擦的轨道，先换成“无摩擦（理想）”。' };
        if (hH <= 4) return { ok: false, msg: '出发高度 ' + L.fmt(hH, 1) + ' m 不比小山高。没有摩擦时，小车最多只能爬回出发时的高度，翻不过 4 m 的山。' };
        if (hH > 5) return { ok: false, msg: '这样能翻过去，但高度超过 5 m 了。再调低一些。' };
        return { ok: true, msg: '出发时机械能 ' + L.fmt(M * G * hH, 0) + ' J，在 4 m 山顶的重力势能是 200 kg × 10 N/kg × 4 m = 8000 J，还剩 ' + L.fmt(M * G * (hH - 4), 0) + ' J 动能，所以能冲过去。换成有摩擦再试试，5 m 就不够了。' };
      }
    },
    {
      level: 'mid',
      title: '用钢球实验比较质量对动能的影响',
      desc: '在“钢球撞木块”里，让 100 g 和 200 g 两个钢球从<b>同一高度</b>各放一次。',
      label: '在钢球撞木块模型里操作',
      button: '检查实验记录',
      check: function () {
        var hit = [10, 20, 30].filter(function (h) { return keRec[h + '-100'] !== undefined && keRec[h + '-200'] !== undefined; })[0];
        if (hit) return { ok: true, msg: '从 ' + hit + ' cm 高处：100 g 推动 ' + L.fmt(keRec[hit + '-100'], 0) + ' cm，200 g 推动 ' + L.fmt(keRec[hit + '-200'], 0) + ' cm。同一高度到达水平面的速度相同，质量大的推得远，动能大。' };
        var n = Object.keys(keRec).length;
        if (!n) return { ok: false, msg: '还没有记录，先点「放手」做实验。' };
        return { ok: false, msg: '两个钢球还没在同一高度都做过。高度不同，速度也不同，就没法只比质量。保持高度不变，只换钢球。' };
      }
    },
    {
      level: 'mid',
      title: '举重运动员在 2 s 内把重 1500 N 的杠铃举高 2 m，他对杠铃做功的功率是',
      desc: '先算功，再算功率。',
      options: ['1500 W', '3000 W', '750 W', '6000 W'],
      answer: 0,
      hint: 'W = Fs，P = W/t，两步走。',
      explain: 'W = Fs = 1500 N × 2 m = 3000 J，P = W/t = 3000 J ÷ 2 s = <b>1500 W</b>。3000 W 是把功当成了功率；750 W 是直接拿力除以时间；6000 W 是把时间乘了进去。'
    },
    {
      level: 'trap',
      title: '甲机器的功率比乙机器大，说明',
      desc: '注意功率和功的区别。',
      options: ['甲做功一定比乙快', '甲做功一定比乙多', '甲做功用的时间一定比乙少', '甲一定比乙省力'],
      answer: 0,
      hint: '功率表示什么？做功多少 W = Pt，还和时间有关。',
      explain: '功率表示做功的<b>快慢</b>，功率大就是做功快。做功多少 W = Pt，还要看干了多久：功率大的机器只干一会儿，做的功可能反而少。用时长短也要看做多少功；省不省力和功率无关。'
    },
    {
      level: 'trap',
      title: '跳伞运动员打开降落伞后匀速下降，这个过程中他的',
      desc: '把动能、重力势能分开想，再加起来。',
      options: ['动能不变，重力势能减小，机械能减小', '动能不变，重力势能不变，机械能不变', '动能增大，重力势能减小，机械能不变', '动能减小，重力势能减小，机械能减小'],
      answer: 0,
      hint: '匀速：速度不变；下降：高度变小。机械能 = 动能 + 势能。',
      explain: '质量和速度都不变，动能<b>不变</b>；高度降低，重力势能<b>减小</b>；加起来机械能<b>减小</b>，减少的部分克服空气阻力变成了内能。“动能增大、机械能不变”是把它当成了没有阻力的下落；匀速时速度不变，动能也不会减小。'
    }
  ]);
})();
