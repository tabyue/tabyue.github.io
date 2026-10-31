/* 化学互动馆 · 第 8 课 金属和金属材料 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg, C = L.chem;
  var st = L.getState();

  /* 方程式里的长等号，反应条件写在上方 */
  function EQ(c) {
    return '<span style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;margin:0 .35em;line-height:1">' +
      '<small style="font-size:.62em;min-height:1em">' + (c || '&nbsp;') + '</small>' +
      '<span style="display:block;width:2.4em;height:4px;border-top:1.5px solid currentColor;border-bottom:1.5px solid currentColor"></span>' +
      '<small style="font-size:.62em;min-height:1em">&nbsp;</small></span>';
  }
  function eqn(e) { return C(e[0]) + EQ(e[1]) + C(e[2]); }

  /* SVG 里的化学式：元素符号后面的数字用 tspan 下移缩小 */
  function chemText(parent, attrs, s) {
    var t = S('text', attrs, parent), fs = +attrs['font-size'] || 10, sh = fs * 0.28, segs = [], idx = 0;
    s.replace(/([A-Za-z\)])(\d+)/g, function (all, a, d, off) {
      segs.push({ t: s.slice(idx, off + 1) }); segs.push({ t: d, sub: true });
      idx = off + all.length; return all;
    });
    segs.push({ t: s.slice(idx) });
    var down = false;
    segs.forEach(function (g) {
      if (!g.t) return;
      var dy = g.sub ? (down ? 0 : sh) : (down ? -sh : 0);
      S('tspan', { 'font-size': g.sub ? fs * 0.72 : null, dy: dy || null, text: g.t }, t);
      down = !!g.sub;
    });
    return t;
  }
  function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  function mix(a, b, t) {
    var pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16), out = '#';
    [16, 8, 0].forEach(function (s) {
      var v = Math.round(L.lerp((pa >> s) & 255, (pb >> s) & 255, L.clamp(t, 0, 1)));
      out += (v < 16 ? '0' : '') + v.toString(16);
    });
    return out;
  }

  /* ========== 试管实验台 ========== */
  var SERIES = ['K', 'Ca', 'Na', 'Mg', 'Al', 'Zn', 'Fe', 'Sn', 'Pb', '(H)', 'Cu', 'Hg', 'Ag', 'Pt', 'Au'];
  var CLEAR = '#e4f0f5', BLUE = '#5aa6db', GREEN = '#cde6a9', CUBLUE = '#86bde6';
  var METALS = {
    Mg: { name: '镁', look: '镁条', fill: '#dfe3e8', idx: 3 },
    Zn: { name: '锌', look: '锌片', fill: '#b5bcc4', idx: 5 },
    Fe: { name: '铁', look: '铁钉', fill: '#7f8790', idx: 6 },
    Cu: { name: '铜', look: '铜丝', fill: '#c06a3a', idx: 10 },
    Ag: { name: '银', look: '银丝', fill: '#e6e8ec', idx: 12 }
  };
  var SOLS = {
    HCl: { label: '稀盐酸', svg: '稀盐酸', color: CLEAR, cname: '无色', idx: 9 },
    H2SO4: { label: '稀硫酸', svg: '稀硫酸', color: CLEAR, cname: '无色', idx: 9 },
    CuSO4: { label: C('CuSO4') + ' 溶液', svg: 'CuSO4 溶液', color: BLUE, cname: '蓝色', idx: 10 },
    AgNO3: { label: C('AgNO3') + ' 溶液', svg: 'AgNO3 溶液', color: CLEAR, cname: '无色', idx: 12 },
    FeSO4: { label: C('FeSO4') + ' 溶液', svg: 'FeSO4 溶液', color: GREEN, cname: '浅绿色', idx: 6 }
  };
  var RED = '#b4482a', SILVER = '#eef0f3', BLACK = '#34363a';
  var ACID = {
    Mg: { dur: 2.4, rate: 46, obs: '反应<b>非常剧烈</b>：镁条表面冒出大量气泡，很快变细，试管外壁发烫。溶液仍是无色。' },
    Zn: { dur: 3.8, rate: 18, obs: '锌片表面<b>持续冒出气泡</b>，快慢适中，锌片慢慢变小。溶液仍是无色。实验室就用锌和稀硫酸制取氢气。' },
    Fe: { dur: 6, rate: 6, obs: '铁钉表面<b>慢慢冒出少量气泡</b>，溶液由无色逐渐变成<b>浅绿色</b>，这是亚铁离子（Fe<sup>2+</sup>）的颜色。' }
  };
  var RX = {
    MgHCl: { eq: ['Mg + 2HCl', '', 'MgCl2 + H2↑'], end: CLEAR, endName: '无色', gas: 'Mg' },
    MgH2SO4: { eq: ['Mg + H2SO4', '', 'MgSO4 + H2↑'], end: CLEAR, endName: '无色', gas: 'Mg' },
    MgCuSO4: { eq: ['Mg + CuSO4', '', 'MgSO4 + Cu'], end: CLEAR, endName: '接近无色', dep: RED, obs: '镁条表面析出<b>红色固体</b>（铜），溶液的蓝色逐渐变浅。镁特别活泼，实际还可能看到少量气泡，初中不要求解释。' },
    MgAgNO3: { eq: ['Mg + 2AgNO3', '', 'Mg(NO3)2 + 2Ag'], end: CLEAR, endName: '无色', dep: SILVER, obs: '镁条表面析出<b>银白色固体</b>（银），溶液仍是无色。' },
    MgFeSO4: { eq: ['Mg + FeSO4', '', 'MgSO4 + Fe'], end: CLEAR, endName: '无色', dep: BLACK, obs: '镁条表面析出<b>黑色固体</b>（很细的铁粉），溶液由浅绿色逐渐变成无色。' },
    ZnHCl: { eq: ['Zn + 2HCl', '', 'ZnCl2 + H2↑'], end: CLEAR, endName: '无色', gas: 'Zn' },
    ZnH2SO4: { eq: ['Zn + H2SO4', '', 'ZnSO4 + H2↑'], end: CLEAR, endName: '无色', gas: 'Zn' },
    ZnCuSO4: { eq: ['Zn + CuSO4', '', 'ZnSO4 + Cu'], end: CLEAR, endName: '无色', dep: RED, obs: '锌片表面析出<b>红色固体</b>（铜），溶液的蓝色逐渐变浅，直到无色。' },
    ZnAgNO3: { eq: ['Zn + 2AgNO3', '', 'Zn(NO3)2 + 2Ag'], end: CLEAR, endName: '无色', dep: SILVER, obs: '锌片表面析出<b>银白色固体</b>（银），溶液仍是无色。' },
    ZnFeSO4: { eq: ['Zn + FeSO4', '', 'ZnSO4 + Fe'], end: CLEAR, endName: '无色', dep: BLACK, obs: '锌片表面析出<b>黑色固体</b>（铁粉），溶液由浅绿色逐渐变成无色。' },
    FeHCl: { eq: ['Fe + 2HCl', '', 'FeCl2 + H2↑'], end: GREEN, endName: '浅绿色', gas: 'Fe' },
    FeH2SO4: { eq: ['Fe + H2SO4', '', 'FeSO4 + H2↑'], end: GREEN, endName: '浅绿色', gas: 'Fe' },
    FeCuSO4: { eq: ['Fe + CuSO4', '', 'FeSO4 + Cu'], end: GREEN, endName: '浅绿色', dep: RED, obs: '铁钉表面析出<b>红色固体</b>（铜），溶液由蓝色逐渐变成<b>浅绿色</b>。古书里“曾青得铁则化为铜”说的就是它，这是湿法炼铜的原理。' },
    FeAgNO3: { eq: ['Fe + 2AgNO3', '', 'Fe(NO3)2 + 2Ag'], end: GREEN, endName: '浅绿色', dep: SILVER, obs: '铁钉表面析出<b>银白色固体</b>（银），溶液由无色逐渐变成浅绿色。' },
    CuAgNO3: { eq: ['Cu + 2AgNO3', '', 'Cu(NO3)2 + 2Ag'], end: CUBLUE, endName: '蓝色', dep: SILVER, obs: '铜丝表面覆盖一层<b>银白色固体</b>（银），溶液由无色逐渐变成<b>蓝色</b>（生成了硝酸铜）。' }
  };
  function symOf(i) { return i === 9 ? 'H' : SERIES[i]; }

  var metal = METALS[st.m] ? st.m : 'Fe', sol = SOLS[st.s] ? st.s : 'CuSO4';
  var prog = 0, running = false, bubbles = [], tubeAnim = null, tested = {};
  var bumps = (function () { var r = rng(5), a = []; for (var i = 0; i < 34; i++) a.push({ y: r(), s: r() < 0.5 ? -1 : 1, r: 1.3 + r() * 1.9, th: r() * 0.85 }); return a; })();
  var brnd = rng(19);

  var tube = L.$('#tube');
  var TX = 200, TT = 66, TB = 238, TW = 26, LY = 124, SB = 222;
  function tubeD(inset) {
    var w = TW - inset;
    return 'M' + (TX - w) + ' ' + TT + 'V' + (TB - TW) + 'A' + w + ' ' + w + ' 0 0 0 ' + (TX + w) + ' ' + (TB - TW) + 'V' + TT;
  }
  function stripHalf() {
    var rx = RX[metal + sol], base = metal === 'Fe' ? 4 : metal === 'Cu' || metal === 'Ag' ? 2.5 : 6;
    var shrink = rx && rx.gas ? prog * (metal === 'Mg' ? 0.7 : metal === 'Zn' ? 0.35 : 0.15) : 0;
    return { top: base, low: base * (1 - shrink) };
  }

  function drawTube() {
    tube.innerHTML = '';
    var defs = S('defs', {}, tube);
    S('path', { d: tubeD(2) + 'Z' }, S('clipPath', { id: 'tube-clip' }, defs));
    S('rect', { x: 0, y: 0, width: 400, height: 250, rx: 14 }, S('clipPath', { id: 'tube-card' }, defs));
    S('rect', { x: 0, y: 0, width: 400, height: 250, rx: 14, fill: '#fbfaf7' }, tube);
    var M = METALS[metal], X = SOLS[sol], rx = RX[metal + sol];
    // 活动性顺序条
    var cw = 372 / 15;
    SERIES.forEach(function (sym, i) {
      var x = 14 + i * cw, me = i === M.idx, tg = i === X.idx && !me;
      S('rect', { x: x + 1, y: 10, width: cw - 2, height: 24, rx: 5, fill: me ? '#2c736f' : tg ? '#f8e3d6' : '#edf3f2', stroke: tg ? '#c2603f' : 'none', 'stroke-width': 1.4 }, tube);
      S('text', { x: x + cw / 2, y: 26, 'font-size': 10.5, 'text-anchor': 'middle', fill: me ? '#fff' : tg ? '#a4492b' : '#4c5d5c', 'font-weight': me || tg ? 700 : 500, text: sym }, tube);
    });
    S('text', { x: 14, y: 48, 'font-size': 9.5, fill: '#7b8a89', text: '← 活动性强' }, tube);
    S('text', { x: 386, y: 48, 'font-size': 9.5, 'text-anchor': 'end', fill: '#7b8a89', text: '活动性弱 →' }, tube);
    var verdict = M.idx === X.idx ? '同一种金属，不置换' : (metal + ' 在 ' + symOf(X.idx) + (M.idx < X.idx ? ' 前面：能置换' : ' 后面：不能置换'));
    S('text', { x: 200, y: 48, 'font-size': 10.5, 'text-anchor': 'middle', 'font-weight': 700, fill: rx ? '#2c736f' : '#a4492b', text: verdict }, tube);

    // 试管
    var liquid = mix(X.color, rx ? rx.end : X.color, prog);
    var inner = S('g', { 'clip-path': 'url(#tube-clip)' }, tube);
    S('rect', { x: TX - TW, y: LY, width: TW * 2, height: TB - LY + 2, fill: liquid }, inner);
    S('rect', { x: TX - TW, y: LY, width: TW * 2, height: 3, fill: '#ffffff', opacity: 0.55 }, inner);
    // 金属
    var hw = stripHalf(), mc = M.fill;
    if (metal === 'Fe') S('rect', { x: TX - 11, y: 76, width: 22, height: 6, rx: 2, fill: '#6e767f' }, inner);
    S('rect', { x: TX - hw.top, y: metal === 'Fe' ? 82 : 78, width: hw.top * 2, height: LY - (metal === 'Fe' ? 82 : 78), fill: mc, stroke: '#7d858d', 'stroke-width': 0.6 }, inner);
    if (metal === 'Fe') S('path', { d: 'M' + (TX - hw.low) + ' ' + LY + 'V' + SB + 'L' + TX + ' ' + (SB + 9) + 'L' + (TX + hw.low) + ' ' + SB + 'V' + LY + 'z', fill: mc, stroke: '#666e76', 'stroke-width': 0.6 }, inner);
    else S('rect', { x: TX - hw.low, y: LY, width: hw.low * 2, height: SB - LY, rx: 1, fill: mc, stroke: '#7d858d', 'stroke-width': 0.6 }, inner);
    // 析出的金属
    if (rx && rx.dep && prog > 0) {
      S('rect', { x: TX - hw.low - 1, y: LY + 2, width: hw.low * 2 + 2, height: SB - LY - 2, fill: rx.dep, opacity: Math.min(0.92, prog * 1.2), stroke: rx.dep === SILVER ? '#b7bcc4' : 'none', 'stroke-width': 0.6 }, inner);
      bumps.forEach(function (b) {
        if (prog < b.th) return;
        S('circle', { cx: TX + b.s * (hw.low + 0.6), cy: LY + 6 + b.y * (SB - LY - 8), r: b.r * Math.min(1, (prog - b.th) * 4), fill: rx.dep, stroke: rx.dep === SILVER ? '#b7bcc4' : 'none', 'stroke-width': 0.5 }, inner);
      });
    }
    // 气泡
    bubbles.forEach(function (b) { S('circle', { cx: b.x, cy: b.y, r: b.r, fill: '#ffffff', 'fill-opacity': 0.75, stroke: '#7fa7ba', 'stroke-width': 0.8 }, inner); });
    // 玻璃
    S('path', { d: tubeD(0), fill: 'none', stroke: '#9fb0b8', 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, tube);
    S('line', { x1: TX - TW + 6, y1: TT + 10, x2: TX - TW + 6, y2: TB - TW - 6, stroke: '#ffffff', 'stroke-width': 2, opacity: 0.8 }, tube);
    S('ellipse', { cx: TX, cy: TT, rx: TW + 2, ry: 3, fill: 'none', stroke: '#9fb0b8', 'stroke-width': 1.6 }, tube);
    // 标注
    S('text', { x: 28, y: 92, 'font-size': 10, fill: '#7b8a89', text: '金属' }, tube);
    S('text', { x: 28, y: 110, 'font-size': 14, fill: '#1f302e', 'font-weight': 700, text: M.look + ' ' + metal }, tube);
    S('line', { x1: 100, y1: 104, x2: TX - hw.top - 2, y2: 104, stroke: '#b7c2c1', 'stroke-width': 1, 'stroke-dasharray': '3 3' }, tube);
    S('text', { x: 262, y: 150, 'font-size': 10, fill: '#7b8a89', text: '溶液' }, tube);
    chemText(tube, { x: 262, y: 168, 'font-size': 13, fill: '#1f302e', 'font-weight': 700 }, X.svg);
    var cTxt = X.cname;
    if (prog > 0 && rx && rx.endName !== X.cname) cTxt = X.cname + ' → ' + rx.endName;
    else if (prog > 0) cTxt = '仍是' + X.cname;
    S('text', { x: 262, y: 186, 'font-size': 10.5, fill: '#4c5d5c', text: '颜色：' + cTxt }, tube);
    S('line', { x1: 258, y1: 160, x2: TX + TW + 2, y2: 160, stroke: '#b7c2c1', 'stroke-width': 1, 'stroke-dasharray': '3 3' }, tube);
    if (rx && rx.gas && running) S('text', { x: 262, y: 206, 'font-size': 10.5, fill: '#a4492b', 'font-weight': 600, text: metal === 'Mg' ? '冒出大量气泡，放热' : '冒出气泡（H₂）' }, tube);
  }

  function readout() {
    var M = METALS[metal], X = SOLS[sol], rx = RX[metal + sol];
    L.$('#react-badge').textContent = rx ? '能反应' : '不反应';
    L.$('#react-pos').textContent = M.idx === X.idx ? '同一种金属' : metal + ' 在 ' + symOf(X.idx) + (M.idx < X.idx ? ' 前' : ' 后');
    L.$('#react-type').textContent = rx ? '置换反应' : '不发生反应';
    L.$('#react-eq').innerHTML = rx ? eqn(rx.eq) : '<span style="color:#8a8f8e;font-size:15px">不发生反应，没有化学方程式</span>';
    var t;
    if (prog === 0 && !running) {
      t = rx ? '按活动性顺序，' + M.name + '<b>能</b>和' + X.label + '反应。点“开始反应”看看现象。'
        : '按活动性顺序，' + M.name + '<b>不能</b>和' + X.label + '反应。点“开始反应”验证一下。';
    } else if (rx) {
      t = rx.gas ? ACID[rx.gas].obs : rx.obs;
    } else if (M.idx === X.idx) {
      t = M.look + '放进含同种金属的溶液，谈不上谁置换谁，<b>无明显现象</b>。';
    } else if (X.idx === 9) {
      t = metal + ' 排在 (H) 后面，不能置换出酸里的氢，<b>没有气泡</b>，无明显现象。';
    } else {
      t = metal + ' 排在 ' + symOf(X.idx) + ' 后面，没本事把 ' + symOf(X.idx) + ' 换出来，<b>无明显现象</b>。';
    }
    L.$('#react-text').innerHTML = t;
    save();
  }

  function startReact() {
    if (tubeAnim) tubeAnim.stop();
    prog = 0; bubbles = []; running = true;
    tested[metal + '|' + sol] = true; renderRec();
    var rx = RX[metal + sol];
    var dur = rx ? (rx.gas ? ACID[rx.gas].dur : 4.5) : 1.2;
    if (L.REDUCED) { prog = 1; running = false; drawTube(); readout(); return; }
    readout();
    var acc = 0;
    tubeAnim = L.loop(function (dt) {
      if (running) {
        prog = Math.min(1, prog + dt / dur);
        if (rx && rx.gas) {
          acc += dt * ACID[rx.gas].rate * (1 - prog * 0.4);
          var hw = stripHalf().low;
          while (acc >= 1) {
            acc -= 1;
            bubbles.push({ x: TX + (brnd() < 0.5 ? -1 : 1) * (hw + 1.5 + brnd() * 3), y: LY + 14 + brnd() * (SB - LY - 14), r: 1.4 + brnd() * 1.8, v: 45 + brnd() * 45 });
          }
        }
        if (prog >= 1) running = false;
      }
      bubbles.forEach(function (b) { b.y -= b.v * dt; b.x += (brnd() - 0.5) * 0.8; });
      bubbles = bubbles.filter(function (b) { return b.y > LY + 2; });
      drawTube();
      if (!running && !bubbles.length) { tubeAnim = null; readout(); return false; }
    });
  }
  function resetReact() {
    if (tubeAnim) { tubeAnim.stop(); tubeAnim = null; }
    prog = 0; running = false; bubbles = [];
    drawTube(); readout();
  }

  var metalChips = L.chips(L.$('#metal-chips'), Object.keys(METALS).map(function (k) { return { label: METALS[k].name + ' ' + k, value: k }; }), metal, function (v) { metal = v; resetReact(); renderRec(); });
  var solChips = L.chips(L.$('#sol-chips'), Object.keys(SOLS).map(function (k) { return { label: SOLS[k].label, value: k }; }), sol, function (v) { sol = v; resetReact(); renderRec(); });
  L.$('#react-go').addEventListener('click', startReact);
  L.$('#react-reset').addEventListener('click', resetReact);

  var SHORT = { HCl: '稀盐酸', H2SO4: '稀硫酸', CuSO4: C('CuSO4'), AgNO3: C('AgNO3'), FeSO4: C('FeSO4') };
  function renderRec() {
    var tb = L.$('#rec-table'), h = '<thead><tr><th></th>';
    Object.keys(SOLS).forEach(function (s) { h += '<th>' + SHORT[s] + '</th>'; });
    h += '</tr></thead><tbody>';
    Object.keys(METALS).forEach(function (m) {
      h += '<tr><td>' + METALS[m].name + ' ' + m + '</td>';
      Object.keys(SOLS).forEach(function (s) {
        var key = m + '|' + s, cur = m === metal && s === sol, done = tested[key], ok = !!RX[m + s];
        var mark = done ? (ok ? '✓' : '✗') : '·';
        var col = done ? (ok ? '#2c736f' : '#a4492b') : '#9aa6a5';
        h += '<td style="padding:4px 2px"><button type="button" data-m="' + m + '" data-s="' + s + '" aria-label="' + METALS[m].name + '和' + SOLS[s].label.replace(/<[^>]+>/g, '') + (done ? (ok ? '：能反应' : '：不反应') : '：还没做') + '" style="width:100%;min-height:28px;border-radius:7px;font-size:15px;font-weight:700;color:' + col + ';background:' + (cur ? '#def2f0' : 'transparent') + ';outline:' + (cur ? '1.5px solid #2c736f' : 'none') + '">' + mark + '</button></td>';
      });
      h += '</tr>';
    });
    tb.innerHTML = h + '</tbody>';
    L.$$('button', tb).forEach(function (b) {
      b.addEventListener('click', function () {
        metal = b.dataset.m; sol = b.dataset.s;
        metalChips.set(metal); solChips.set(sol);
        resetReact(); renderRec();
      });
    });
  }

  /* ========== 铁生锈 ========== */
  var rustSvg = L.$('#rust');
  var days = L.num(st.d, 7, 0, 14), water = st.w === 'salt' ? 'salt' : 'pure', rustAnim = null;
  var RC = [80, 200, 320], RT = 26, RB = 186, RW = 22, WL = 118;
  var spots = (function () {
    var r = rng(11), a = [];
    for (var i = 0; i < 48; i++) {
      var g = (r() + r() + r() - 1.5) * 36;
      a.push({ y: L.clamp(WL + g, 56, 174), u: r() * 2 - 1, r: 1.5 + r() * 2.6, th: r() * 0.9 });
    }
    return a;
  })();
  function rustLevel(d) { return 1 - Math.exp(-d / (water === 'salt' ? 3 : 7)); }
  function rustWord(lv) { return lv < 0.04 ? '没有生锈' : lv < 0.3 ? '开始生锈' : lv < 0.7 ? '明显生锈' : '锈得很厉害'; }
  function rtD(cx, inset) {
    var w = RW - inset;
    return 'M' + (cx - w) + ' ' + RT + 'V' + (RB - RW) + 'A' + w + ' ' + w + ' 0 0 0 ' + (cx + w) + ' ' + (RB - RW) + 'V' + RT;
  }
  function nail(g, cx, top, bot, lv) {
    var body = mix('#8a9097', '#8f5532', lv * 0.35);
    S('rect', { x: cx - 8, y: top, width: 16, height: 4, rx: 1.5, fill: '#737a82' }, g);
    S('path', { d: 'M' + (cx - 3) + ' ' + (top + 4) + 'V' + bot + 'L' + cx + ' ' + (bot + 7) + 'L' + (cx + 3) + ' ' + bot + 'V' + (top + 4) + 'z', fill: body, stroke: '#666e76', 'stroke-width': 0.6 }, g);
    if (lv <= 0) return;
    spots.forEach(function (s) {
      if (s.y < top + 4 || s.y > bot + 3 || lv < s.th) return;
      S('circle', { cx: cx + s.u * 3.2, cy: s.y, r: s.r * Math.min(1, (lv - s.th) * 3 + 0.3), fill: '#a4532b', opacity: Math.min(0.9, (lv - s.th) * 3 + 0.25) }, g);
    });
  }
  function drawRust(dd) {
    rustSvg.innerHTML = '';
    var defs = S('defs', {}, rustSvg);
    RC.forEach(function (cx, i) { S('path', { d: rtD(cx, 2) + 'Z' }, S('clipPath', { id: 'rt-clip-' + i }, defs)); });
    S('rect', { x: 0, y: 0, width: 400, height: 230, rx: 14, fill: '#fbfaf7' }, rustSvg);
    var lv = rustLevel(dd);
    RC.forEach(function (cx, i) {
      var g = S('g', { 'clip-path': 'url(#rt-clip-' + i + ')' }, rustSvg);
      if (i === 0) S('rect', { x: cx - RW, y: WL, width: RW * 2, height: RB - WL + 2, fill: water === 'salt' ? '#dfeae6' : '#e2eff6' }, g);
      if (i === 1) {
        S('rect', { x: cx - RW, y: 56, width: RW * 2, height: RB - 54, fill: '#e2eff6' }, g);
        S('rect', { x: cx - RW, y: 46, width: RW * 2, height: 10, fill: '#efcf6e', opacity: 0.9 }, g);
      }
      if (i === 2) {
        var r = rng(3);
        for (var k = 0; k < 26; k++) S('circle', { cx: cx - 18 + r() * 36, cy: 166 + r() * 20, r: 2.6 + r() * 1.6, fill: '#f6f4ec', stroke: '#c9c3ae', 'stroke-width': 0.7 }, g);
      }
      if (i === 0) nail(g, cx, 50, 174, lv);
      else if (i === 1) nail(g, cx, 64, 172, 0);
      else nail(g, cx, 44, 152, 0);
      S('path', { d: rtD(cx, 0), fill: 'none', stroke: '#9fb0b8', 'stroke-width': 2, 'stroke-linejoin': 'round' }, rustSvg);
    });
    // 塞子与标注
    S('path', { d: 'M296 12H344L341 32H299z', fill: '#5f666b' }, rustSvg);
    S('text', { x: 106, y: WL + 4, 'font-size': 9, fill: '#5a7f92', text: '← 水面' }, rustSvg);
    S('text', { x: 226, y: 55, 'font-size': 9, fill: '#9b7a1f', text: '← 植物油' }, rustSvg);
    S('text', { x: 346, y: 26, 'font-size': 9, fill: '#5f666b', text: '塞紧' }, rustSvg);
    if (lv > 0.3) S('text', { x: 106, y: WL + 18, 'font-size': 9, fill: '#a4532b', text: '锈得最多' }, rustSvg);
    var cap = [['① 水 + 空气', water === 'salt' ? '一半浸在食盐水里' : '一半浸在蒸馏水里'], ['② 只有水', '煮沸的蒸馏水 + 油封'], ['③ 只有空气', '干燥剂 + 塞紧']];
    RC.forEach(function (cx, i) {
      S('text', { x: cx, y: 205, 'font-size': 10.5, 'text-anchor': 'middle', 'font-weight': 700, fill: '#1f302e', text: cap[i][0] }, rustSvg);
      S('text', { x: cx, y: 220, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#6b7877', text: cap[i][1] }, rustSvg);
    });
    S('text', { x: 346, y: 178, 'font-size': 9, fill: '#8a8470', text: '← 干燥剂' }, rustSvg);
    rustRead(dd, lv);
  }
  function rustRead(dd, lv) {
    var d = Math.round(dd);
    L.$('#day-out').textContent = d + ' 天';
    L.$('#rust-badge').textContent = '第 ' + d + ' 天';
    L.$('#rust-1').textContent = rustWord(lv);
    L.$('#rust-23').textContent = '都不生锈';
    var t;
    if (d === 0) t = '刚放进去，三根铁钉都亮闪闪的。拖动滑块，看看几天后的样子。';
    else t = '第 ' + d + ' 天：只有①号铁钉生锈，而且<b>水面附近</b>锈得最厉害，那里水和氧气都最充足。②号碰不到氧气，③号碰不到水，都不生锈。所以铁生锈要<b>同时接触氧气和水</b>。';
    if (d > 0 && water === 'salt') t += ' 换成食盐水后锈得明显更快：深圳潮湿，海边空气里还带着盐分，铁栏杆特别容易锈。';
    L.$('#rust-text').innerHTML = t;
    save();
  }
  var dayIn = L.$('#day-in');
  dayIn.value = days;
  L.bindRange(dayIn, function (v) { if (rustAnim) { rustAnim.stop(); rustAnim = null; } days = v; drawRust(days); });
  L.chips(L.$('#water-chips'), [{ label: '蒸馏水', value: 'pure' }, { label: '食盐水（模拟海边）', value: 'salt' }], water, function (v) { water = v; drawRust(days); });
  L.$('#rust-play').addEventListener('click', function () {
    if (rustAnim) rustAnim.stop();
    if (L.REDUCED) { days = 14; dayIn.value = 14; L.paintRange(dayIn); drawRust(14); return; }
    var dd = 0;
    rustAnim = L.loop(function (dt) {
      dd = Math.min(14, dd + dt * 2.8);
      days = Math.round(dd); dayIn.value = days; L.paintRange(dayIn);
      drawRust(dd);
      if (dd >= 14) { rustAnim = null; return false; }
    });
  });
  L.$('#rust-reset').addEventListener('click', function () {
    if (rustAnim) { rustAnim.stop(); rustAnim = null; }
    days = 0; dayIn.value = 0; L.paintRange(dayIn); drawRust(0);
  });

  /* ========== 模拟炼铁 ========== */
  var ironSvg = L.$('#iron');
  var co = false, heat = false, coT = 0, hot = 0, ip = 0, faults = {}, gasT = 0, ironAnim = null;
  var lrnd = rng(23), limeB = [];
  function ironDone() { return ip >= 1 && !co && !heat && hot <= 0.02; }
  function ironOk() { return ironDone() && !faults.early && !faults.reox; }
  function stepIron(dt) {
    if (co) coT += dt;
    hot = heat ? Math.min(1, hot + dt / 1.6) : Math.max(0, hot - dt / 3.2);
    if (heat && co && coT > 2 && hot > 0.6 && ip < 1) ip = Math.min(1, ip + dt / 4.5);
    if (!co && hot > 0.35 && ip > 0) faults.reox = true;
    gasT += dt;
    if (co) { if (lrnd() < dt * 9) limeB.push({ x: 300 + (lrnd() - 0.5) * 6, y: 190, v: 40 + lrnd() * 30 }); }
    limeB.forEach(function (b) { b.y -= b.v * dt; });
    limeB = limeB.filter(function (b) { return b.y > 140; });
  }
  function drawIron() {
    ironSvg.innerHTML = '';
    var defs = S('defs', {}, ironSvg);
    S('rect', { x: 0, y: 0, width: 400, height: 220, rx: 14 }, S('clipPath', { id: 'iron-clip' }, defs));
    S('path', { d: 'M289 116V188A15 15 0 0 0 319 188V116Z' }, S('clipPath', { id: 'lime-clip' }, defs));
    S('rect', { x: 0, y: 0, width: 400, height: 220, rx: 14, fill: '#fbfaf7' }, ironSvg);
    var g = S('g', { 'clip-path': 'url(#iron-clip)' }, ironSvg);
    // 进气
    S('line', { x1: 6, y1: 81, x2: 36, y2: 81, stroke: '#9fb0b8', 'stroke-width': 4 }, g);
    if (co) S('line', { x1: 6, y1: 81, x2: 36, y2: 81, stroke: '#2c736f', 'stroke-width': 2, 'stroke-dasharray': '4 5', 'stroke-dashoffset': -gasT * 30 }, g);
    S('text', { x: 10, y: 70, 'font-size': 11, 'font-weight': 700, fill: co ? '#2c736f' : '#7b8a89', text: 'CO →' }, g);
    // 硬质玻璃管
    S('rect', { x: 40, y: 70, width: 212, height: 22, rx: 11, fill: '#eef5f8', stroke: '#9fb0b8', 'stroke-width': 1.6 }, g);
    if (hot > 0) S('rect', { x: 100, y: 70, width: 90, height: 22, rx: 11, fill: '#f5a35c', opacity: hot * 0.35 }, g);
    S('path', { d: 'M114 91Q145 76 176 91z', fill: mix('#9c3b22', '#2a2a2a', ip) }, g);
    S('rect', { x: 34, y: 68, width: 10, height: 26, rx: 2, fill: '#6c7377' }, g);
    S('rect', { x: 248, y: 68, width: 10, height: 26, rx: 2, fill: '#6c7377' }, g);
    chemText(g, { x: 145, y: 60, 'font-size': 10.5, 'text-anchor': 'middle', fill: ip > 0.5 ? '#2a2a2a' : '#9c3b22', 'font-weight': 600 }, ip > 0.5 ? '黑色铁粉（Fe）' : 'Fe2O3（红棕色）');
    S('text', { x: 62, y: 108, 'font-size': 9, fill: '#7b8a89', text: '硬质玻璃管' }, g);
    // 导管到石灰水
    S('path', { d: 'M258 81H300V182', fill: 'none', stroke: '#9fb0b8', 'stroke-width': 3 }, g);
    var lime = S('g', { 'clip-path': 'url(#lime-clip)' }, g);
    S('rect', { x: 289, y: 140, width: 30, height: 64, fill: '#e6f1f5' }, lime);
    S('rect', { x: 289, y: 140, width: 30, height: 64, fill: '#ffffff', opacity: ip * 0.85 }, lime);
    limeB.forEach(function (b) { S('circle', { cx: b.x, cy: b.y, r: 2, fill: 'none', stroke: '#7fa7ba', 'stroke-width': 0.8 }, lime); });
    S('path', { d: 'M289 116V188A15 15 0 0 0 319 188V116', fill: 'none', stroke: '#9fb0b8', 'stroke-width': 1.8 }, g);
    S('rect', { x: 286, y: 108, width: 36, height: 9, rx: 2, fill: '#6c7377' }, g);
    S('text', { x: 304, y: 214, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#6b7877', text: ip > 0.3 ? '石灰水变浑浊' : '澄清石灰水' }, g);
    // 尾气处理
    S('path', { d: 'M312 110V98H362V60', fill: 'none', stroke: '#9fb0b8', 'stroke-width': 3 }, g);
    if (co) {
      var fl = 1 + Math.sin(gasT * 14) * 0.08;
      S('path', { d: 'M362 58c-6-4-5-12 0-' + (16 * fl).toFixed(1) + 'c5 ' + (4 * fl).toFixed(1) + ' 6 12 0 ' + (16 * fl).toFixed(1) + 'z', fill: '#7fa6e6', opacity: 0.85 }, g);
    }
    S('text', { x: 362, y: 30, 'font-size': 9.5, 'text-anchor': 'middle', fill: co ? '#3a5fa8' : '#7b8a89', text: co ? '尾气点燃' : '尾气处理' }, g);
    // 酒精喷灯
    S('rect', { x: 141, y: 114, width: 8, height: 40, fill: '#9aa3ab' }, g);
    S('path', { d: 'M126 196L132 154H158L164 196z', fill: '#c6cdd3', stroke: '#9aa3ab' }, g);
    if (heat) {
      var f2 = 1 + Math.sin(gasT * 11) * 0.06;
      S('path', { d: 'M145 112c-9-6-8-14 0-' + (20 * f2).toFixed(1) + 'c8 ' + (6 * f2).toFixed(1) + ' 9 14 0 ' + (20 * f2).toFixed(1) + 'z', fill: '#f2a43a', opacity: 0.9 }, g);
      S('path', { d: 'M145 112c-4-3-4-8 0-12c4 4 4 9 0 12z', fill: '#6f95e0' }, g);
    }
    S('text', { x: 145, y: 212, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#6b7877', text: '酒精喷灯' }, g);
  }
  function ironRead() {
    var t, warn = '';
    L.$('#iron-temp').textContent = hot < 0.02 ? '室温' : heat ? (hot < 1 ? '升温中' : '高温') : '冷却中';
    L.$('#iron-p').innerHTML = Math.round(ip * 100) + '<small>%</small>';
    if (!co && !heat && ip === 0 && hot === 0) t = '玻璃管里是红棕色的 ' + C('Fe2O3') + ' 粉末。先想好：通气和加热，哪个先来？';
    else if (heat && !co) t = '只加热、不通 CO，' + C('Fe2O3') + ' 不会变成铁。';
    else if (co && !heat && ip === 0) t = coT < 2 ? 'CO 正在把装置里的空气赶出去……' : '空气已经排干净，多余的 CO 在右边被点燃。现在可以加热了。';
    else if (heat && co && ip < 1) t = hot < 0.6 ? '玻璃管正在升温……' : '高温下 CO 夺走 ' + C('Fe2O3') + ' 里的氧：红棕色粉末逐渐<b>变黑</b>（生成铁粉），澄清石灰水<b>变浑浊</b>（' + C('Ca(OH)2 + CO2') + EQ('') + C('CaCO3↓ + H2O') + '）。';
    else if (ip >= 1 && heat) t = '粉末全变黑了。下一步先停哪个：加热还是 CO？';
    else if (ip > 0 && !heat && co && hot > 0.02) t = '停止加热，<b>继续通 CO</b>，让铁在 CO 的保护下慢慢冷却……';
    else if (ip > 0 && !heat && co) t = ip >= 1 ? '玻璃管已经冷却，可以停止通 CO 了。' : '反应没完成就停止加热了，粉末还没全变黑。';
    else if (ip >= 1 && !co && !heat && hot > 0.02) t = '玻璃管正在冷却……';
    else if (ironDone()) t = ironOk() ? '完成！顺序完全正确：先通 CO 排尽空气，再加热；反应完先停止加热，冷却后再停 CO。' : '粉末变成了铁，但操作中有错误，看上面的提醒。';
    else t = '实验进行到一半就停了。点“重置”重新来一次。';
    if (faults.early) warn += '<b style="color:#a4492b">危险：</b>装置里的空气还没排干净就加热，CO 和空气混合受热可能<b>爆炸</b>。应该先通 CO 一会儿再加热。<br>';
    if (faults.reox) warn += '<b style="color:#a4492b">错了：</b>玻璃管还很烫就停了 CO，空气会进来把刚生成的铁重新氧化，石灰水也可能倒吸进热的玻璃管。<br>';
    L.$('#iron-text').innerHTML = warn + t;
    L.$('#iron-badge').textContent = faults.early || faults.reox ? '操作有误' : ironOk() ? '炼铁成功' : (co || heat || hot > 0 || ip > 0) ? '进行中' : '准备';
    var stage;
    if (ironDone()) stage = 4;
    else if (ip >= 1) stage = heat ? 2 : 3;
    else if (heat || ip > 0) stage = 1;
    else stage = co && coT >= 2 ? 1 : 0;
    L.$$('#iron-steps span').forEach(function (s, i) { s.className = i < stage ? 'done' : i === stage ? 'on' : ''; });
    L.$('#co-on').disabled = co;
    L.$('#co-off').disabled = !co;
    L.$('#heat-on').disabled = heat;
    L.$('#heat-off').disabled = !heat;
  }
  function ironRun() {
    if (L.REDUCED) { for (var k = 0; k < 240; k++) stepIron(0.05); drawIron(); ironRead(); return; }
    if (ironAnim) return;
    ironAnim = L.loop(function (dt) {
      stepIron(dt); drawIron(); ironRead();
      if (!co && !heat && hot <= 0 && !limeB.length) { ironAnim = null; return false; }
    });
  }
  L.$('#co-on').addEventListener('click', function () { co = true; coT = 0; ironRead(); ironRun(); });
  L.$('#heat-on').addEventListener('click', function () { if (!co || coT < 2) faults.early = true; heat = true; ironRead(); ironRun(); });
  L.$('#heat-off').addEventListener('click', function () { heat = false; ironRead(); ironRun(); });
  L.$('#co-off').addEventListener('click', function () { if (hot > 0.35 && ip > 0) faults.reox = true; co = false; ironRead(); ironRun(); });
  L.$('#iron-reset').addEventListener('click', function () {
    if (ironAnim) { ironAnim.stop(); ironAnim = null; }
    co = false; heat = false; coT = 0; hot = 0; ip = 0; faults = {}; limeB = [];
    drawIron(); ironRead();
  });

  /* ========== 合金 vs 纯金属 ========== */
  var ALLOY = {
    brass: { max: 1200, bars: [['黄铜', 930, '约 930 ℃', 1], ['纯铜', 1083, '1083 ℃']],
      text: '黄铜是铜和锌的合金。两块金属片互相刻划，<b>纯铜片上留下明显划痕</b>，黄铜片上几乎看不出，说明合金<b>硬度更大</b>。黄铜的熔点随含锌多少在 900～950 ℃ 之间，比纯铜低（图中取约 930 ℃）。' },
    solder: { max: 360, bars: [['焊锡', 183, '183 ℃', 1], ['锡', 232, '232 ℃'], ['铅', 327, '327 ℃']],
      text: '焊锡是锡和铅的合金，熔点只有约 183 ℃，<b>比锡和铅都低</b>，电烙铁一碰就化，适合焊接电路元件。它也比纯锡、纯铅更硬。' }
  };
  var pair = ALLOY[st.p] ? st.p : 'brass';
  function drawAlloy() {
    var A = ALLOY[pair], box = L.$('#alloy-bars');
    box.innerHTML = '';
    A.bars.forEach(function (b) {
      var it = L.html('div', { class: 'bar-item' }, box);
      L.html('span', { text: b[0] }, it);
      var tr = L.html('div', { class: 'track' }, it);
      L.html('div', { class: 'fill', style: 'width:' + (b[1] / A.max * 100).toFixed(1) + '%;background:' + (b[3] ? '#2c736f' : '#a9d2cf') }, tr);
      L.html('em', { text: b[2] }, it);
    });
    L.$('#alloy-text').innerHTML = '熔点对比。' + A.text;
    save();
  }
  L.chips(L.$('#alloy-chips'), [{ label: '黄铜 vs 纯铜', value: 'brass' }, { label: '焊锡 vs 锡、铅', value: 'solder' }], pair, function (v) { pair = v; drawAlloy(); });

  function save() { L.setState({ m: metal, s: sol, d: days, w: water, p: pair }); }

  drawTube(); readout(); renderRec();
  drawRust(days);
  drawIron(); ironRead();
  drawAlloy();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '让铁钉“穿”上一层铜',
      desc: '在试管实验台里选好金属和溶液并开始反应，让铁钉表面析出红色的铜，同时溶液变成浅绿色。',
      label: '在试管实验台里操作',
      button: '检查试管',
      check: function () {
        if (metal === 'Fe' && sol === 'CuSO4' && prog >= 1) return { ok: true, msg: 'Fe 排在 Cu 前面：' + eqn(RX.FeCuSO4.eq) + '。溶液由蓝变浅绿，说明生成的是硫酸<b>亚铁</b>（+2 价）。' };
        if (metal === 'Fe' && sol === 'CuSO4') return { ok: false, msg: '组合选对了，点“开始反应”，等反应结束再检查。' };
        if (sol !== 'CuSO4') return { ok: false, msg: '想析出铜，溶液里得先含有铜元素。看看哪种溶液里有 Cu。' };
        return { ok: false, msg: '题目说的是<b>铁钉</b>，而且溶液要变成浅绿色（亚铁离子的颜色），金属换成铁试试。' };
      }
    },
    {
      level: 'base',
      title: '铁和稀盐酸反应的化学方程式，正确的是',
      desc: '可以在实验台里选“铁 Fe + 稀盐酸”看看。',
      options: [eqn(['Fe + 2HCl', '', 'FeCl2 + H2↑']), eqn(['2Fe + 6HCl', '', '2FeCl3 + 3H2↑']), eqn(['Fe + 2HCl', '', 'FeCl2 + H2']), eqn(['Fe + 2HCl', '点燃', 'FeCl2 + H2↑'])],
      answer: 0,
      hint: '溶液变成浅绿色，说明生成的是 +2 价的亚铁盐；再检查气体符号和反应条件。',
      explain: '铁发生置换反应只生成 +2 价的<b>氯化亚铁</b> ' + C('FeCl2') + '，所以写 ' + C('FeCl3') + ' 的错；反应物里没有气体，生成的 ' + C('H2') + ' 要标 ↑；这个反应常温就能进行，不需要点燃。'
    },
    {
      level: 'base',
      title: '对比①号和②号试管，能说明铁生锈需要什么？',
      desc: '①号铁钉一半浸在蒸馏水里，上面是空气；②号浸没在煮沸过的蒸馏水里，上面用植物油封住。',
      options: ['需要氧气（空气）', '需要水', '需要二氧化碳', '需要光照'],
      answer: 0,
      hint: '两支试管里都有水，它们唯一的不同是什么？',
      explain: '①和②都有水，区别只在于②号用煮沸的水（除去溶解的氧气）加油封隔绝了空气，结果①锈、②不锈，说明生锈<b>需要氧气</b>。想证明需要水，要对比①和③。'
    },
    {
      level: 'mid',
      title: '设计一个实验，证明铜比银活泼',
      desc: '在试管实验台里选一种金属和一种溶液，做一次反应来证明。',
      label: '在试管实验台里操作',
      button: '检查实验',
      check: function () {
        if (prog < 1) return { ok: false, msg: '先选好组合，点“开始反应”，等反应结束再检查。' };
        if (metal === 'Cu' && sol === 'AgNO3') return { ok: true, msg: '铜丝表面析出银、溶液变蓝：' + eqn(RX.CuAgNO3.eq) + '。铜能把银换出来，说明 Cu 比 Ag 活泼。' };
        if (metal === 'Ag' && sol === 'CuSO4') return { ok: true, msg: '银放进 ' + C('CuSO4') + ' 溶液不反应，说明 Ag 换不出 Cu，同样证明 Cu 比 Ag 活泼。' };
        if (metal === 'Cu' || metal === 'Ag') return { ok: false, msg: '这一组看不出铜和银谁强。要么用铜去碰含银的溶液，要么用银去碰含铜的溶液。' };
        return { ok: false, msg: '实验里要同时出现铜和银：一个当金属，另一个在溶液里。' };
      }
    },
    {
      level: 'mid',
      title: '判断 X、Y、Z 三种金属的活动性',
      desc: 'X、Y 分别放入稀硫酸，只有 X 表面冒气泡；把 Y 放入 Z 的硝酸盐溶液中，Y 表面析出 Z。',
      options: ['X &gt; Y &gt; Z', 'Y &gt; X &gt; Z', 'Z &gt; Y &gt; X', 'X &gt; Z &gt; Y'],
      answer: 0,
      hint: '第一句说明谁在氢前、谁在氢后；第二句说明 Y 和 Z 谁在前。',
      explain: 'X 能置换出氢、Y 不能，所以 X 在 (H) 前、Y 在 (H) 后，X &gt; Y；Y 能把 Z 换出来，所以 Y &gt; Z。合起来 <b>X &gt; Y &gt; Z</b>。'
    },
    {
      level: 'mid',
      title: '按正确顺序完成一次模拟炼铁',
      desc: '在“模拟炼铁”里点按钮，把 ' + C('Fe2O3') + ' 全部还原成铁，并且整个过程不能出现安全问题。',
      label: '在模拟炼铁装置里操作',
      button: '检查操作',
      check: function () {
        if (faults.early) return { ok: false, msg: '你在空气还没排尽时就加热了，可能爆炸。点“重置”，先通 CO 一会儿再加热。' };
        if (faults.reox) return { ok: false, msg: '玻璃管还烫的时候就停了 CO。点“重置”重来：停止加热后要继续通 CO，直到冷却。' };
        if (ip < 1) return { ok: false, msg: '粉末还没全部变黑，反应没完成。' };
        if (!ironDone()) return { ok: false, msg: '反应完成了，但实验还没收尾：酒精喷灯和 CO 都要关，而且顺序有讲究。' };
        return { ok: true, msg: '先通 CO 后加热，先停加热后停 CO。“CO 早出晚归，酒精喷灯迟到早退”。' };
      }
    },
    {
      level: 'trap',
      title: '铝比铁活泼，可铝锅却比铁锅更耐腐蚀，原因是',
      desc: '在活动性顺序里 Al 排在 Fe 前面。',
      options: ['铝表面生成一层致密的氧化铝薄膜，阻止里面的铝继续被氧化', '铝不活泼，常温下不和氧气反应', '铝锅出厂时表面都涂了防锈油', '铁锈能保护铁，而铝没有这样的保护层'],
      answer: 0,
      hint: '铝常温下就和氧气反应，问题在于生成的东西是什么样子的。',
      explain: '铝在常温下就和氧气反应：4Al + 3' + C('O2') + ' = 2' + C('Al2O3') + '，生成的氧化铝薄膜<b>致密</b>，把里面的铝保护起来。说铝不活泼是错的；铁锈疏松多孔，非但不保护铁，还会加快生锈。'
    },
    {
      level: 'trap',
      title: '关于合金，下列说法正确的是',
      desc: '想想黄铜、焊锡、生铁和钢。',
      options: ['合金属于金属材料，是混合物', '合金是几种金属形成的化合物', '合金的熔点一般比组成它的纯金属高', '合金里一定只含金属，不含非金属'],
      answer: 0,
      hint: '合金是“熔合”在一起，不是发生化学反应生成新物质。',
      explain: '合金是金属中熔合了其他金属或非金属，属于<b>混合物</b>，和纯金属一起统称<b>金属材料</b>。它的熔点一般<b>更低</b>（焊锡 183 ℃ 低于锡和铅）；生铁和钢里都含碳，碳是非金属。'
    }
  ]);
})();
