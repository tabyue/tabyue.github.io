/* 化学互动馆 · 第 2 课 空气和氧气 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();

  /* 方程式里写在等号上方的反应条件 */
  function cond(c) {
    return '<span style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;margin:0 .3em;line-height:1"><small style="font-size:.62em;margin-bottom:2px">' + c + '</small><span style="display:block;width:2.6em;height:4px;border-top:1.5px solid;border-bottom:1.5px solid"></span></span>';
  }
  function eq(l, c, r) { return L.chem(l) + ' ' + cond(c) + ' ' + L.chem(r); }
  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  /* ========== 红磷燃烧测定氧气含量 ========== */
  var ERR = [
    { id: 'few', label: '红磷不足', d: -6, why: '红磷太少，瓶里的氧气没有被耗尽' },
    { id: 'leak', label: '装置漏气', d: -5, why: '冷却时外面的空气钻进瓶里，补上了一部分空位' },
    { id: 'hot', label: '没冷却就打开止水夹', d: -7, why: '剩下的气体还热着、仍在膨胀，气压没降到最低' },
    { id: 'loose', label: '止水夹没夹紧', d: 6, why: '燃烧时瓶内气体受热膨胀，从导管跑出去一部分' },
    { id: 'slow', label: '点燃后伸入太慢', d: 5, why: '伸进去时瓶口的空气受热膨胀，先跑出去一部分' }
  ];
  var errs = (st.e || '').split(',').filter(function (k) { return ERR.some(function (x) { return x.id === k; }); });
  function hasE(k) { return errs.indexOf(k) >= 0; }
  function measured() {
    var m = 21;
    ERR.forEach(function (x) { if (hasE(x.id)) m += x.d; });
    return L.clamp(m, 5, 40);
  }

  var jar = L.$('#jar');
  var jdefs = S('defs', {}, jar);
  var JAR_D = 'M50 66Q50 58 58 58H80V44H140V58H162Q170 58 170 66V212Q170 222 160 222H60Q50 222 50 212Z';
  S('path', { d: JAR_D }, S('clipPath', { id: 'jar-clip' }, jdefs));
  S('rect', { x: 262, y: 100, width: 96, height: 124 }, S('clipPath', { id: 'beaker-clip' }, jdefs));
  S('rect', { x: 0, y: 0, width: 400, height: 250, rx: 14 }, S('clipPath', { id: 'jarbox-clip' }, jdefs));

  var W0 = 204, TOP = 60, SPACE = W0 - TOP;     // 水面以上 144 px，分成 5 份
  var DUR = { burn: 3.2, cool: 2.6, open: 2.4 };
  var ph = 'ready', pt = 0, anim = null, tNow = 0;

  function riseNow() {
    var full = SPACE * measured() / 100;
    if (ph === 'open') return full * ease(pt);
    if (ph === 'done') return full;
    return 0;
  }
  function smokeNow() {
    if (ph === 'burn') return Math.min(1, pt * 1.6);
    if (ph === 'cool') return hasE('hot') ? 1 - 0.3 * pt : 1 - pt;
    if (ph === 'open') return hasE('hot') ? 0.7 * (1 - pt) : 0;
    return 0;
  }

  function drawJar() {
    jar.innerHTML = ''; jar.appendChild(jdefs);
    var g0 = S('g', { 'clip-path': 'url(#jarbox-clip)' }, jar);
    S('rect', { x: 0, y: 0, width: 400, height: 250, rx: 14, fill: '#fbfaf7' }, g0);
    S('rect', { x: 10, y: 224, width: 380, height: 6, rx: 3, fill: '#e3e9e9' }, g0);
    var rise = riseNow(), wy = W0 - rise;
    var open = ph === 'open' || ph === 'done';

    // 集气瓶里面：白烟、水
    var inner = S('g', { 'clip-path': 'url(#jar-clip)' }, g0);
    var sm = smokeNow();
    if (sm > 0) S('rect', { x: 40, y: 40, width: 140, height: 190, fill: '#cdd2cd', opacity: (0.78 * sm).toFixed(2) }, inner);
    S('rect', { x: 40, y: wy, width: 140, height: 232 - wy, fill: '#bfe0ee' }, inner);
    S('line', { x1: 40, y1: wy, x2: 180, y2: wy, stroke: '#7fb6cf', 'stroke-width': 1.2 }, inner);
    S('path', { d: JAR_D, fill: 'none', stroke: '#8fb0bf', 'stroke-width': 2 }, g0);
    // 5 等份刻度
    for (var k = 1; k <= 4; k++) {
      var y = W0 - k * SPACE / 5;
      S('line', { x1: 50, y1: y, x2: 64, y2: y, stroke: '#5f8796', 'stroke-width': 1.2 }, g0);
    }
    for (k = 1; k <= 5; k++) S('text', { x: 44, y: W0 - (k - 0.5) * SPACE / 5 + 3.5, 'font-size': 10, 'text-anchor': 'end', fill: '#5f8796', text: k }, g0);
    S('line', { x1: 50, y1: W0, x2: 64, y2: W0, stroke: '#5f8796', 'stroke-width': 1.2, 'stroke-dasharray': '2 2' }, g0);

    // 导管、止水夹、烧杯
    var by = 150 + rise * 0.9;
    S('rect', { x: 262, y: by, width: 96, height: 226 - by, fill: '#bfe0ee' }, S('g', { 'clip-path': 'url(#beaker-clip)' }, g0));
    S('path', { d: 'M262 104V216Q262 224 270 224H350Q358 224 358 216V104', fill: 'none', stroke: '#8fb0bf', 'stroke-width': 2 }, g0);
    S('text', { x: 340, y: 216, 'font-size': 10, fill: '#5f8796', 'text-anchor': 'middle', text: '水' }, g0);
    var TUBE = 'M126 52V20H300V206';
    S('path', { d: TUBE, fill: 'none', stroke: '#9fb4be', 'stroke-width': 6, 'stroke-linejoin': 'round' }, g0);
    S('path', { d: TUBE, fill: 'none', stroke: open ? '#8cc6de' : '#f4f8f9', 'stroke-width': 3, 'stroke-linejoin': 'round' }, g0);
    var gap = open ? 11 : hasE('loose') ? 6 : 2.5;
    S('rect', { x: 206, y: 20 - gap - 5, width: 16, height: 5, rx: 1.5, fill: '#5d6b70' }, g0);
    S('rect', { x: 206, y: 20 + gap, width: 16, height: 5, rx: 1.5, fill: '#5d6b70' }, g0);
    S('text', { x: 214, y: 48, 'font-size': 10, 'text-anchor': 'middle', fill: '#5d6b70', text: open ? '止水夹（已打开）' : hasE('loose') ? '止水夹（没夹紧）' : '止水夹（夹紧）' }, g0);

    // 橡胶塞、燃烧匙、红磷
    S('rect', { x: 76, y: 32, width: 68, height: 14, rx: 3, fill: '#8b7b6b' }, g0);
    S('line', { x1: 96, y1: 10, x2: 96, y2: 128, stroke: '#8a8f96', 'stroke-width': 2 }, g0);
    S('path', { d: 'M85 127Q96 139 107 127Z', fill: '#a0a5ab' }, g0);
    var pr = 5;
    if (ph === 'burn') pr = hasE('few') ? 5 * (1 - pt) : 5 - 2 * pt;
    else if (ph !== 'ready') pr = hasE('few') ? 0 : 3;
    if (pr > 0.3) S('circle', { cx: 96, cy: 126, r: pr.toFixed(1), fill: '#c0392b' }, g0);
    if (ph === 'ready') S('text', { x: 110, y: 130, 'font-size': 10, fill: '#a4492b', text: '红磷' }, g0);
    if (ph === 'burn') {
      var fs = pt > 0.85 ? (1 - pt) / 0.15 : 1;
      fs *= 1 + 0.12 * Math.sin(tNow * 22);
      var fg = S('g', { transform: 'translate(96 124) scale(' + fs.toFixed(2) + ')' }, g0);
      S('path', { d: 'M0 -20C8 -12 8 -4 0 0C-8 -4 -8 -12 0 -20Z', fill: '#f2a43a' }, fg);
      S('path', { d: 'M0 -11C4 -7 4 -3 0 0C-4 -3 -4 -7 0 -11Z', fill: '#ffe08a' }, fg);
      S('text', { x: 112, y: 112, 'font-size': 10, fill: '#8a8f96', text: '大量白烟' }, g0);
    }

    // 各种失误的“证据”
    var warn = '#c2603f';
    if (ph === 'burn' && hasE('slow') && pt < 0.5) {
      L.arrow(g0, 80, 40, 60, 24, { color: warn, width: 1.6, head: 6 });
      L.arrow(g0, 86, 34, 78, 12, { color: warn, width: 1.6, head: 6 });
      S('text', { x: 56, y: 16, 'font-size': 10, 'text-anchor': 'end', fill: warn, text: '空气逸出' }, g0);
    }
    if (ph === 'burn' && hasE('loose')) {
      for (var i = 0; i < 5; i++) {
        var bY = 204 - ((tNow * 40 + i * 12) % 52);
        S('circle', { cx: 300 + Math.sin(i * 2 + tNow * 5) * 3, cy: bY, r: 2.4, fill: '#fff', stroke: '#6aa3bd' }, S('g', { 'clip-path': 'url(#beaker-clip)' }, g0));
      }
      S('text', { x: 310, y: 140, 'font-size': 10, fill: warn, text: '气体从导管冒出' }, g0);
    }
    if (ph === 'cool' && hasE('leak')) {
      L.arrow(g0, 22, 22, 72, 38, { color: warn, width: 1.6, head: 6 });
      S('text', { x: 12, y: 14, 'font-size': 10, fill: warn, text: '空气漏进来' }, g0);
    }
    if (ph === 'done') {
      S('line', { x1: 170, y1: wy, x2: 186, y2: wy, stroke: '#2c736f', 'stroke-width': 1.4 }, g0);
      S('text', { x: 188, y: wy + 4, 'font-size': 10.5, fill: '#2c736f', 'font-weight': 600, text: '水到这里（' + measured() + '%）' }, g0);
    }
    var STEP = { ready: '准备：红磷放在燃烧匙里', burn: '① 燃烧：止水夹夹紧', cool: hasE('hot') ? '② 还没冷却就……' : '② 冷却到室温', open: '③ 打开止水夹，水进入瓶中', done: '④ 水不再流动，读数' };
    S('text', { x: 200, y: 244, 'font-size': 11, 'text-anchor': 'middle', fill: '#2c736f', 'font-weight': 600, text: STEP[ph] }, g0);
    jarReadout();
  }

  function jarReadout() {
    var m = measured(), done = ph === 'done';
    var P = { ready: '等于外界大气压', burn: '升高（放热，气体受热膨胀）', cool: hasE('hot') ? '还偏高（气体没冷却）' : '降低（氧气被消耗，又冷却了）', open: '小于外界大气压，水被压进来', done: '与外界大气压相等' };
    L.$('#p-out').textContent = P[ph];
    L.$('#o2-out').innerHTML = done ? m + '<small>%</small>' : '—';
    L.$('#water-out').innerHTML = done ? (errs.length ? '约 ' + L.fmt(m * 5 / 100, 1) + '<small>份</small>' : '约 1<small>份（1/5）</small>') : '—';
    var badge = '进行中';
    if (ph === 'ready') badge = '未开始';
    else if (done) badge = !errs.length ? '约 1/5' : m < 20 ? '偏小' : m > 22 ? '偏大' : '凑巧接近';
    L.$('#jar-badge').textContent = badge;
    var t;
    if (ph === 'ready') t = '点燃红磷后立即伸入瓶中、塞紧塞子。猜一猜：最后水能进去几份？' + (errs.length ? ' 你打开了 ' + errs.length + ' 个误差开关，结果会和正确值不一样。' : '');
    else if (ph === 'burn') t = '红磷燃烧，产生大量<b>白烟</b>，放出热量。瓶内气体受热膨胀，气压升高，所以止水夹必须夹紧。' + (hasE('loose') ? ' <b>止水夹没夹紧</b>，热气体正从导管冒出去。' : '') + (hasE('slow') ? ' <b>伸入太慢</b>，瓶口有空气受热跑了出去。' : '');
    else if (ph === 'cool') t = hasE('hot') ? '火焰刚灭，瓶里还很热，你就要打开止水夹了。这时剩下的气体还在膨胀，占的地方偏大。' : '火焰熄灭，白烟慢慢消失。瓶里的氧气被消耗掉，冷却后气压变小。' + (hasE('leak') ? ' <b>装置漏气</b>，外面的空气正钻进瓶里。' : '');
    else if (ph === 'open') t = '打开止水夹，外面的大气压把烧杯里的水压进集气瓶，补上氧气空出来的地方。';
    else if (!errs.length) t = '水进入集气瓶，约占原来空气体积的 <b>1/5</b>，说明<b>氧气约占空气体积的 1/5</b>。水不再往上涨，说明剩下的气体（主要是氮气）不能燃烧、也不支持燃烧，并且难溶于水。';
    else {
      var lo = errs.filter(function (k) { return ERR.filter(function (x) { return x.id === k; })[0].d < 0; });
      var hi = errs.filter(function (k) { return lo.indexOf(k) < 0; });
      var why = errs.map(function (k) { return ERR.filter(function (x) { return x.id === k; })[0].why; }).join('；');
      t = '测得 ' + m + '%，' + (m < 20 ? '比 21% <b>偏小</b>' : m > 22 ? '比 21% <b>偏大</b>' : '看上去接近 21%') + '。原因：' + why + '。';
      if (lo.length && hi.length) t += ' 偏小和偏大的错误同时出现，会互相抵消一部分，但这样的数据并不可靠。';
    }
    L.$('#jar-text').innerHTML = t;
    save();
  }

  function startJar() {
    if (anim) anim.stop();
    ph = 'burn'; pt = 0;
    if (L.REDUCED) { anim = null; ph = 'done'; pt = 1; drawJar(); return; }
    anim = L.loop(function (dt, t) {
      tNow = t;
      var d = ph === 'cool' && hasE('hot') ? 0.5 : DUR[ph];
      pt += dt / d;
      if (pt >= 1) {
        pt = 0;
        ph = ph === 'burn' ? 'cool' : ph === 'cool' ? 'open' : 'done';
        if (ph === 'done') { pt = 1; anim = null; drawJar(); return false; }
      }
      drawJar();
    });
  }
  function resetJar() { if (anim) anim.stop(); anim = null; ph = 'ready'; pt = 0; drawJar(); }
  L.$('#jar-run').addEventListener('click', startJar);
  L.$('#jar-reset').addEventListener('click', resetJar);

  var errBox = L.$('#err-chips');
  ERR.forEach(function (x) {
    var b = L.html('button', { type: 'button', text: x.label, 'aria-pressed': String(hasE(x.id)) }, errBox);
    b.addEventListener('click', function () {
      var i = errs.indexOf(x.id);
      if (i >= 0) errs.splice(i, 1); else errs.push(x.id);
      b.setAttribute('aria-pressed', String(i < 0));
      resetJar();
    });
  });

  /* ========== 催化剂：两条曲线 ========== */
  var cat = L.$('#cat');
  var vol = st.v === '20' ? 20 : 10;
  var tc = L.num(st.tc, 2, 0, 30);
  var K1 = 1.2, K0 = 0.15;           // 每分钟的“快慢系数”（示意）
  function vmax() { return vol * 8; }
  function vW(t) { return vmax() * (1 - Math.exp(-K1 * t)); }
  function vN(t) { return vmax() * (1 - Math.exp(-K0 * t)); }
  var tIn = L.$('#t-in');
  tIn.value = tc;

  function drawCat() {
    var ax = L.axes(cat, { xmin: 0, xmax: 30, ymin: 0, ymax: 180, xstep: 5, ystep: 40, xlabel: ' ', ylabel: 'V(O₂) / mL', left: 40, top: 14, bottom: 34 });
    cat.insertBefore(S('rect', { x: 0, y: 0, width: 400, height: 230, rx: 14, fill: '#fbfaf7' }), cat.firstChild);
    var cp = S('clipPath', { id: 'cat-clip' }, S('defs', {}, cat));
    S('rect', { x: ax.X(0), y: ax.Y(180), width: ax.X(30) - ax.X(0), height: ax.Y(0) - ax.Y(180) }, cp);
    var g = S('g', { 'clip-path': 'url(#cat-clip)', fill: 'none', 'stroke-linecap': 'round' }, ax.layer);
    var vm = vmax();
    S('line', { x1: ax.X(0), y1: ax.Y(vm), x2: ax.X(30), y2: ax.Y(vm), stroke: '#8a9796', 'stroke-dasharray': '4 4' }, g);
    S('path', { d: L.curve(ax, vW), stroke: '#2c736f', 'stroke-width': 1.5, opacity: 0.25, 'stroke-dasharray': '3 4' }, g);
    S('path', { d: L.curve(ax, vN), stroke: '#c2603f', 'stroke-width': 1.5, opacity: 0.25, 'stroke-dasharray': '3 4' }, g);
    if (tc > 0) {
      S('path', { d: L.curve(ax, vW, 0, tc), stroke: '#2c736f', 'stroke-width': 2.6 }, g);
      S('path', { d: L.curve(ax, vN, 0, tc), stroke: '#c2603f', 'stroke-width': 2.6 }, g);
    }
    S('line', { x1: ax.X(tc), y1: ax.Y(0), x2: ax.X(tc), y2: ax.Y(180), stroke: '#a5b1b0', 'stroke-dasharray': '2 3' }, g);
    S('circle', { cx: ax.X(tc), cy: ax.Y(vW(tc)), r: 4.5, fill: '#2c736f', stroke: '#fff', 'stroke-width': 1.5 }, g);
    S('circle', { cx: ax.X(tc), cy: ax.Y(vN(tc)), r: 4.5, fill: '#c2603f', stroke: '#fff', 'stroke-width': 1.5 }, g);
    S('text', { x: ax.X(30), y: ax.Y(0) + 28, 'font-size': 10.5, 'text-anchor': 'end', fill: '#5b6475', 'font-style': 'italic', text: 't / min' }, ax.layer);
    var lab = S('g', { 'font-size': 10.5, 'font-weight': 600 }, ax.layer);
    S('text', { x: ax.X(30) - 4, y: ax.Y(vm) - 6, 'text-anchor': 'end', fill: '#5c6968', 'font-weight': 400, text: '最终都是 ' + vm + ' mL' }, lab);
    S('text', { x: ax.X(3.4), y: ax.Y(vm) + 15, fill: '#2c736f', text: '加 MnO₂' }, lab);
    S('text', { x: ax.X(13), y: ax.Y(vN(13)) + 18, fill: '#c2603f', text: '不加' }, lab);
    catReadout();
  }

  function catReadout() {
    var vm = vmax(), w = vW(tc), n = vN(tc);
    L.$('#t-out').textContent = L.fmt(tc, 1) + ' min';
    L.$('#cat-with').innerHTML = L.qty(w, 'mL', 0);
    L.$('#cat-no').innerHTML = L.qty(n, 'mL', 0);
    L.$('#cat-mno2').textContent = tc === 0 ? '1 g（刚加入）' : '1 g → 1 g';
    var b, t;
    if (tc === 0) { b = '还没开始'; t = '两份溶液完全一样，只差一小撮二氧化锰。拖动时间滑块，看谁先放出氧气。'; }
    else if (w < vm * 0.99) { b = '加 MnO₂ 的快'; t = '同一时刻，加了二氧化锰的那份已经放出 ' + L.fmt(w, 0) + ' mL 氧气，不加的只有 ' + L.fmt(n, 0) + ' mL。曲线越陡，反应越快。'; }
    else if (n < vm * 0.99) { b = '一份已停止'; t = '加二氧化锰的那份已经反应完，曲线变平，不再增加。不加的那份还在慢慢放氧气，曲线仍在往上爬，但它的终点也是 ' + vm + ' mL。'; }
    else { b = '产量相同'; t = '两条曲线最后停在<b>同一高度</b>：过氧化氢的量一样，生成的氧气就一样多。二氧化锰只改变了速率，不能增加生成物的质量。'; }
    L.$('#cat-badge').textContent = b;
    L.$('#cat-text').innerHTML = t;
    save();
  }
  L.bindRange(tIn, function (val) { tc = val; drawCat(); });
  L.chips(L.$('#vol-chips'), [{ label: '10 mL', value: '10' }, { label: '20 mL', value: '20' }], String(vol), function (val) { vol = +val; drawCat(); });
  var catAnim = null;
  L.$('#cat-play').addEventListener('click', function () {
    if (catAnim) catAnim.stop();
    tc = 0;
    if (L.REDUCED) { tc = 30; tIn.value = tc; L.paintRange(tIn); drawCat(); return; }
    catAnim = L.loop(function (dt) {
      tc = Math.min(30, tc + dt * 5);
      tIn.value = tc; L.paintRange(tIn);
      drawCat();
      if (tc >= 30) { catAnim = null; return false; }
    });
  });

  /* ========== 制取氧气 ========== */
  var prep = L.$('#prep');
  var drug = st.d === 'h' ? 'h' : 'k';
  var gen = st.g === 'B' ? 'B' : 'A';
  var col = ['water', 'up', 'down'].indexOf(st.c) >= 0 ? st.c : 'water';
  var burnK = ['c', 's', 'fe', 'p'].indexOf(st.b) >= 0 ? st.b : 'fe';
  var pp = 0, tested = false, pAnim = null, pT = 0;
  function genOk() { return (drug === 'k' && gen === 'A') || (drug === 'h' && gen === 'B'); }
  function colOk() { return col !== 'down'; }
  function gotO2() { return genOk() && colOk() && pp >= 1; }

  var pdefs = S('defs', {}, prep);
  S('rect', { x: 0, y: 0, width: 400, height: 240, rx: 14 }, S('clipPath', { id: 'prep-clip' }, pdefs));
  var FLASK = 'M86 104V122L52 204Q49 214 60 214H140Q151 214 148 204L114 122V104Z';
  S('path', { d: FLASK }, S('clipPath', { id: 'flask-clip' }, pdefs));
  S('path', { d: 'M222 150V214H388V150Z' }, S('clipPath', { id: 'trough-clip' }, pdefs));
  var BOT_INV = 'M306 196V186Q296 184 296 174V78Q296 70 304 70H336Q344 70 344 78V174Q344 184 334 186V196Z';
  S('path', { d: BOT_INV }, S('clipPath', { id: 'botinv-clip' }, pdefs));
  var BOT_UP = 'M306 96V106Q296 108 296 118V206Q296 214 304 214H336Q344 214 344 206V118Q344 108 334 106V96Z';
  S('path', { d: BOT_UP }, S('clipPath', { id: 'botup-clip' }, pdefs));

  function tube(parent, d) {
    S('path', { d: d, fill: 'none', stroke: '#9fb4be', 'stroke-width': 5, 'stroke-linejoin': 'round' }, parent);
    S('path', { d: d, fill: 'none', stroke: '#f4f8f9', 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, parent);
  }
  function flame(parent, x, y, s) {
    var g = S('g', { transform: 'translate(' + x + ' ' + y + ') scale(' + s.toFixed(2) + ')' }, parent);
    S('path', { d: 'M0 -27C12 -12 12 4 0 27C-12 4 -12 -12 0 -27Z', fill: '#f2a43a', opacity: 0.9 }, g);
    S('path', { d: 'M0 -6C5 0 5 8 0 20C-5 8 -5 0 0 -6Z', fill: '#ffe08a' }, g);
  }
  var LBL = { 'font-size': 11, 'text-anchor': 'middle', fill: '#2c736f', 'font-weight': 600 };

  function drawA(root, running) {
    S('text', Object.assign({ x: 96, y: 18, text: 'A · 固体加热型' }, LBL), root);
    S('rect', { x: 12, y: 208, width: 100, height: 6, rx: 2, fill: '#9aa3a2' }, root);
    S('rect', { x: 20, y: 60, width: 4, height: 148, fill: '#9aa3a2' }, root);
    S('rect', { x: 22, y: 99, width: 66, height: 3, fill: '#9aa3a2' }, root);
    var tg = S('g', { transform: 'translate(36 96) rotate(6)' }, root);
    S('path', { d: 'M124 -11H11A11 11 0 0 0 11 11H124', fill: '#eef5f9', stroke: '#7f9fc0', 'stroke-width': 1.6 }, tg);
    if (drug === 'k') {
      S('path', { d: 'M6 5H70V10H11Q6 9 6 5Z', fill: '#4b2a57' }, tg);
      S('ellipse', { cx: 112, cy: 0, rx: 5.5, ry: 9, fill: '#fff', stroke: '#b9c1c6', 'stroke-dasharray': '2 1.5' }, tg);
      S('text', { x: 104, y: -16, 'font-size': 9.5, fill: '#5c6968', text: '棉花' }, tg);
      S('text', { x: 20, y: -16, 'font-size': 9.5, fill: '#4b2a57', text: '高锰酸钾' }, tg);
    } else {
      S('path', { d: 'M5 0H124V10H11Q5 8 5 0Z', fill: '#bfe0ee' }, tg);
      S('circle', { cx: 163, cy: 124, r: 2.5, fill: '#8cc6de' }, root);
      S('circle', { cx: 165, cy: 136, r: 2, fill: '#8cc6de' }, root);
      S('text', { x: 100, y: 66, 'font-size': 10.5, 'text-anchor': 'middle', fill: '#c2603f', 'font-weight': 600, text: '液体会从试管口流出！' }, root);
    }
    S('rect', { x: 120, y: -10, width: 10, height: 20, rx: 2, fill: '#8b7b6b' }, tg);
    // 酒精灯
    S('path', { d: 'M50 214Q48 186 62 180H78Q92 186 90 214Z', fill: '#eaf1f4', stroke: '#8fb0bf', 'stroke-width': 1.4 }, root);
    S('rect', { x: 64, y: 172, width: 12, height: 8, fill: '#a7b4b8' }, root);
    S('line', { x1: 70, y1: 164, x2: 70, y2: 172, stroke: '#6b6b6b', 'stroke-width': 1.5 }, root);
    if (running && drug === 'k') flame(root, 70, 139, 1 + 0.06 * Math.sin(pT * 24));
    S('text', { x: 70, y: 232, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#5c6968', text: '酒精灯' }, root);
    return { x: 165, y: 110 };
  }

  function drawB(root, running) {
    S('text', Object.assign({ x: 100, y: 18, text: 'B · 固液常温型' }, LBL), root);
    var fg = S('g', { 'clip-path': 'url(#flask-clip)' }, root);
    if (drug === 'h') {
      S('rect', { x: 40, y: 172, width: 120, height: 50, fill: '#bfe0ee' }, fg);
      for (var i = 0; i < 9; i++) S('ellipse', { cx: 70 + i * 7, cy: 210 - (i % 2) * 2, rx: 3, ry: 2, fill: '#2e2e2e' }, fg);
      if (running) for (i = 0; i < 6; i++) {
        var yy = 206 - ((pT * 30 + i * 6) % 34);
        S('circle', { cx: 112 + (i % 3) * 8, cy: yy, r: 2, fill: '#fff', stroke: '#6aa3bd' }, fg);
      }
    } else {
      S('path', { d: 'M62 214Q100 200 138 214Z', fill: '#4b2a57' }, fg);
    }
    S('path', { d: FLASK, fill: 'none', stroke: '#7f9fc0', 'stroke-width': 1.6 }, root);
    S('rect', { x: 82, y: 96, width: 36, height: 12, rx: 2, fill: '#8b7b6b' }, root);
    S('path', { d: 'M74 34H110L96 56H88Z', fill: '#eef5f9', stroke: '#7f9fc0', 'stroke-width': 1.4 }, root);
    S('line', { x1: 92, y1: 56, x2: 92, y2: 204, stroke: '#7f9fc0', 'stroke-width': 4 }, root);
    S('line', { x1: 92, y1: 56, x2: 92, y2: 204, stroke: '#f4f8f9', 'stroke-width': 1.8 }, root);
    S('text', { x: 116, y: 46, 'font-size': 9.5, fill: '#5c6968', text: '长颈漏斗' }, root);
    S('text', { x: 100, y: 232, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#5c6968', text: drug === 'h' ? '锥形瓶：二氧化锰 + 过氧化氢溶液' : '锥形瓶：高锰酸钾' }, root);
    tube(root, 'M108 98V80');
    return { x: 108, y: 80 };
  }

  function drawPrep() {
    prep.innerHTML = ''; prep.appendChild(pdefs);
    var root = S('g', { 'clip-path': 'url(#prep-clip)' }, prep);
    S('rect', { x: 0, y: 0, width: 400, height: 240, rx: 14, fill: '#fbfaf7' }, root);
    S('rect', { x: 8, y: 214, width: 384, height: 6, rx: 3, fill: '#e3e9e9' }, root);
    var running = pAnim !== null;
    var src = gen === 'A' ? drawA(root, running) : drawB(root, running);
    var flow = running && genOk();
    var fill = genOk() ? (colOk() ? pp : 0.12 * pp) : 0;
    var O2C = '#d7ecf7';

    if (tested) {
      S('text', Object.assign({ x: 320, y: 18, text: '检验：瓶正放在桌上' }, LBL), root);
      tube(root, 'M' + src.x + ' ' + src.y + 'H236');
      var bg = S('g', { 'clip-path': 'url(#botup-clip)' }, root);
      if (gotO2()) S('rect', { x: 290, y: 90, width: 60, height: 130, fill: O2C }, bg);
      S('path', { d: BOT_UP, fill: 'none', stroke: '#7f9fc0', 'stroke-width': 1.6 }, root);
      S('rect', { x: 330, y: 92, width: 30, height: 3, fill: '#a9c3cf' }, root);
      S('line', { x1: 378, y1: 34, x2: 322, y2: 124, stroke: '#b07a45', 'stroke-width': 4, 'stroke-linecap': 'round' }, root);
      if (gotO2()) flame(root, 319, 118, 0.62);
      else S('circle', { cx: 322, cy: 124, r: 3, fill: '#c0392b', opacity: 0.6 }, root);
      S('text', { x: 300, y: 234, 'font-size': 10.5, 'text-anchor': 'middle', fill: gotO2() ? '#2c736f' : '#c2603f', 'font-weight': 600, text: gotO2() ? '木条复燃：是氧气' : '木条没有复燃' }, root);
      return prepReadout();
    }

    if (col === 'water') {
      S('text', Object.assign({ x: 305, y: 18, text: '排水法' }, LBL), root);
      S('rect', { x: 222, y: 160, width: 166, height: 54, fill: '#bfe0ee' }, S('g', { 'clip-path': 'url(#trough-clip)' }, root));
      tube(root, 'M' + src.x + ' ' + src.y + 'H252V208H318V192');
      var gy = 74 + fill * 104;
      var ig = S('g', { 'clip-path': 'url(#botinv-clip)' }, root);
      S('rect', { x: 290, y: 66, width: 60, height: 140, fill: '#bfe0ee' }, ig);
      if (fill > 0) S('rect', { x: 290, y: 66, width: 60, height: gy - 66, fill: O2C }, ig);
      S('path', { d: BOT_INV, fill: 'none', stroke: '#7f9fc0', 'stroke-width': 1.6 }, root);
      S('path', { d: 'M222 150V214H388V150', fill: 'none', stroke: '#8fb0bf', 'stroke-width': 1.8 }, root);
      if (flow) for (var i = 0; i < 5; i++) {
        var yy = 190 - ((pT * 50 + i * 9) % Math.max(12, 190 - gy));
        S('circle', { cx: 318 + Math.sin(i * 1.7 + pT * 6) * 3, cy: yy, r: 2.3, fill: '#fff', stroke: '#6aa3bd' }, ig);
      }
      if (fill > 0.05) S('text', { x: 320, y: 70 + (gy - 66) / 2 + 8, 'font-size': 10.5, 'text-anchor': 'middle', fill: '#2c736f', text: 'O₂' }, root);
      S('text', { x: 300, y: 234, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#5c6968', text: '集气瓶装满水，倒立在水槽中' }, root);
    } else if (col === 'up') {
      S('text', Object.assign({ x: 305, y: 18, text: '向上排空气法' }, LBL), root);
      var ug = S('g', { 'clip-path': 'url(#botup-clip)' }, root);
      if (fill > 0) S('rect', { x: 290, y: 210 - fill * 106, width: 60, height: fill * 106 + 6, fill: O2C }, ug);
      tube(root, 'M' + src.x + ' ' + src.y + 'H240V64H320V204');
      S('path', { d: BOT_UP, fill: 'none', stroke: '#7f9fc0', 'stroke-width': 1.6 }, root);
      S('rect', { x: 288, y: 92, width: 26, height: 3, fill: '#a9c3cf' }, root);
      if (flow) { L.arrow(root, 308, 200, 308, 214 - fill * 106 - 4, { color: '#5f8796', width: 1.2, head: 5 }); }
      if (flow) L.arrow(root, 350, 104, 362, 84, { color: '#8a9796', width: 1.2, head: 5, label: '空气被排出', fs: 9.5, lx: -30, ly: -6 });
      if (fill > 0.12) S('text', { x: 332, y: 208, 'font-size': 10.5, 'text-anchor': 'middle', fill: '#2c736f', text: 'O₂' }, root);
      S('text', { x: 300, y: 234, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#5c6968', text: '瓶口向上，导管伸到瓶底' }, root);
    } else {
      S('text', Object.assign({ x: 305, y: 18, text: '向下排空气法' }, LBL), root);
      tube(root, 'M' + src.x + ' ' + src.y + 'H240V196H320V76');
      var INV2 = 'M306 168V158Q296 156 296 146V68Q296 60 304 60H336Q344 60 344 68V146Q344 156 334 158V168';
      S('path', { d: INV2, fill: 'none', stroke: '#7f9fc0', 'stroke-width': 1.6 }, root);
      S('line', { x1: 344, y1: 110, x2: 384, y2: 110, stroke: '#9aa3a2', 'stroke-width': 3 }, root);
      S('line', { x1: 384, y1: 40, x2: 384, y2: 214, stroke: '#9aa3a2', 'stroke-width': 3 }, root);
      if (flow) {
        L.arrow(root, 304, 162, 296, 190, { color: '#c2603f', width: 1.5, head: 6 });
        L.arrow(root, 336, 162, 344, 190, { color: '#c2603f', width: 1.5, head: 6 });
      }
      S('text', { x: 300, y: 234, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#c2603f', text: '氧气比空气重，会从瓶口往下跑掉' }, root);
    }
    prepReadout();
  }

  var NOTE_GEN = {
    kA: '试管口<b>略向下倾斜</b>，防止冷凝水倒流到热的试管底部使试管炸裂；试管口放<b>一团棉花</b>，防止加热时试管内的粉末进入导管。',
    hB: '长颈漏斗下端要<b>伸到液面以下</b>，防止生成的氧气从漏斗口逸出。这种方法不用加热，更节能。',
    kB: '高锰酸钾是固体，必须<b>加热</b>才会分解。锥形瓶这套是“固体 + 液体、常温”用的，放进去不会产生氧气。',
    hA: '过氧化氢溶液是液体，常温下加二氧化锰就能分解，不用加热；这套试管口向下倾斜的装置是给固体加热用的，液体会流出来。'
  };
  var NOTE_COL = {
    water: '氧气<b>不易溶于水</b>，可以用排水法，收集到的氧气<b>比较纯</b>。等导管口气泡<b>连续、均匀</b>地冒出时再收集。',
    up: '氧气密度比空气<b>略大</b>，可以用向上排空气法，收集到的氧气<b>比较干燥</b>。验满：带火星的木条放在<b>瓶口</b>。',
    down: '向下排空气法适合密度比空气小的气体。氧气比空气重，会从瓶口往下跑掉，收集不到。'
  };
  function prepReadout() {
    L.$('#prep-gen').innerHTML = genOk() ? '✓ 选对了' : '✗ 不合适';
    L.$('#prep-col').innerHTML = col === 'down' ? '✗ 收集不到' : col === 'water' ? '✓ 排水法' : '✓ 向上排空气';
    L.$('#prep-eq').innerHTML = drug === 'k' ? eq('2KMnO4', '△', 'K2MnO4 + MnO2 + O2↑') : eq('2H2O2', L.chem('MnO2'), '2H2O + O2↑');
    var b;
    if (tested) b = gotO2() ? '木条复燃' : '没有复燃';
    else if (pAnim) b = genOk() ? '收集中' : '没有气体';
    else if (pp >= 1) b = !genOk() ? '装置不对' : !colOk() ? '收集不到' : '已集满';
    else b = '待制取';
    L.$('#prep-badge').textContent = b;
    var t = NOTE_GEN[drug + gen] + ' ' + NOTE_COL[col];
    if (drug === 'k' && col === 'water') t += ' 实验结束时<b>先把导管移出水面，再熄灭酒精灯</b>，防止水倒吸。';
    if (tested && !gotO2()) t = (pp < 1 ? '还没收集满，先点“开始制取”。' : !genOk() ? '发生装置不对，根本没产生氧气，木条当然不会复燃。' : '这瓶里几乎都是空气，氧气早就从瓶口跑掉了。') + ' ' + t;
    else if (tested) t = '带火星的木条伸入瓶中，<b>复燃</b>了——氧气能支持燃烧。注意：是木条在燃烧，氧气自己并不燃烧。';
    L.$('#prep-text').innerHTML = t;
    save();
  }

  function resetPrep() { if (pAnim) pAnim.stop(); pAnim = null; pp = 0; tested = false; drawPrep(); }
  L.chips(L.$('#drug-chips'), [{ label: '高锰酸钾', value: 'k' }, { label: '过氧化氢溶液 + 二氧化锰', value: 'h' }], drug, function (v) { drug = v; resetPrep(); });
  L.chips(L.$('#gen-chips'), [{ label: 'A 固体加热型', value: 'A' }, { label: 'B 固液常温型', value: 'B' }], gen, function (v) { gen = v; resetPrep(); });
  L.chips(L.$('#col-chips'), [{ label: '排水法', value: 'water' }, { label: '向上排空气法', value: 'up' }, { label: '向下排空气法', value: 'down' }], col, function (v) { col = v; resetPrep(); });
  L.$('#prep-run').addEventListener('click', function () {
    if (pAnim) pAnim.stop();
    pp = 0; tested = false;
    if (L.REDUCED) { pAnim = null; pp = 1; drawPrep(); return; }
    pAnim = L.loop(function (dt, t) {
      pT = t; pp = Math.min(1, pp + dt / 4);
      if (pp >= 1) { pAnim = null; drawPrep(); return false; }
      drawPrep();
    });
  });
  L.$('#prep-test').addEventListener('click', function () {
    if (pAnim) { pAnim.stop(); pAnim = null; }
    tested = true; drawPrep();
  });

  var BURN = {
    c: ['C + O2', 'CO2', '木炭在空气里只是发红；在氧气里燃烧得更旺，<b>发出白光</b>，放出热量，生成能使澄清石灰水变浑浊的气体。'],
    s: ['S + O2', 'SO2', '硫在空气里发出微弱的<b>淡蓝色</b>火焰，在氧气里发出明亮的<b>蓝紫色</b>火焰，放出热量，生成有刺激性气味的气体。瓶底放少量水，吸收二氧化硫，减少污染。'],
    fe: ['3Fe + 2O2', 'Fe3O4', '铁丝在空气里不能燃烧，只会红热；在氧气里<b>剧烈燃烧、火星四射</b>，放出大量热，生成黑色固体。瓶底要先放<b>少量水或细沙</b>，防止高温熔融物溅落，使瓶底炸裂。'],
    p: ['4P + 5O2', '2P2O5', '红磷燃烧产生大量<b>白烟</b>（五氧化二磷固体小颗粒），放出热量。注意是“烟”不是“雾”：烟是固体小颗粒，雾是小液滴。']
  };
  function burnShow() {
    var b = BURN[burnK];
    L.$('#burn-eq').innerHTML = eq(b[0], '点燃', b[1]);
    L.$('#burn-text').innerHTML = b[2];
    save();
  }
  L.chips(L.$('#burn-chips'), [{ label: '木炭', value: 'c' }, { label: '硫', value: 's' }, { label: '铁丝', value: 'fe' }, { label: '红磷', value: 'p' }], burnK, function (v) { burnK = v; burnShow(); });

  function save() { L.setState({ e: errs.join(','), v: vol, tc: L.fmt(tc, 1), d: drug, g: gen, c: col, b: burnK }); }

  drawJar();
  drawCat();
  drawPrep();
  burnShow();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '做一次没有失误的测定',
      desc: '把“故意出错”的开关全部关掉，点燃红磷，等水不再流动后检查。',
      label: '在集气瓶实验里操作',
      button: '检查实验结果',
      check: function () {
        if (errs.length) return { ok: false, msg: '还开着 ' + errs.length + ' 个误差开关。先把它们全部点灭，再重新做一次。' };
        if (ph !== 'done') return { ok: false, msg: ph === 'ready' ? '还没开始，点“点燃红磷，开始实验”。' : '实验还在进行，等水停止流入再检查。' };
        return { ok: true, msg: '水进入了约 1 份，也就是原来空气体积的 1/5，说明氧气约占空气体积的 1/5。' };
      }
    },
    {
      level: 'base',
      title: '空气中体积分数约为 21% 的气体是',
      desc: '看看右边“空气的成分”。',
      options: ['氧气', '氮气', '二氧化碳', '稀有气体'],
      answer: 0,
      hint: '体积分数最大的是氮气，约 78%，第二是谁？',
      explain: '按体积计算，<b>氧气约占 21%</b>，氮气约 78%，稀有气体约 0.94%，二氧化碳约 0.03%。'
    },
    {
      level: 'base',
      title: '怎样检验一瓶气体是不是氧气？',
      desc: '可以在“制氧台”里点“用带火星的木条检验”看看。',
      options: ['把带火星的木条伸入瓶中，看是否复燃', '把燃着的木条伸入瓶中，看是否熄灭', '闻气味', '倒入澄清石灰水，看是否变浑浊'],
      answer: 0,
      hint: '氧气能支持燃烧，什么样的木条最能显出这一点？',
      explain: '氧气能支持燃烧，<b>带火星的木条伸入后复燃</b>，就说明是氧气。燃着的木条熄灭只能说明这种气体不支持燃烧；氧气无色无味，闻不出来；澄清石灰水是用来检验二氧化碳的。'
    },
    {
      level: 'mid',
      title: '故意让结果偏大',
      desc: '只打开会让结果<b>偏大</b>的误差开关，把实验做完，让测得的氧气体积分数明显大于 21%。',
      label: '在集气瓶实验里操作',
      button: '检查测得的数据',
      check: function () {
        if (ph !== 'done') return { ok: false, msg: '先选好开关，再把实验做完（等水停止流动）。' };
        var m = measured();
        var bad = errs.filter(function (k) { return ['few', 'leak', 'hot'].indexOf(k) >= 0; });
        if (bad.length) return { ok: false, msg: '你还开着会让结果偏小的开关（' + bad.map(function (k) { return ERR.filter(function (x) { return x.id === k; })[0].label; }).join('、') + '）。偏大的原因是瓶里的气体“多跑出去了”。' };
        if (m <= 22) return { ok: false, msg: '现在测得 ' + m + '%，没有偏大。想一想：哪些操作会让瓶里原有的空气跑出去？' };
        return { ok: true, msg: '测得 ' + m + '%。止水夹没夹紧、伸入太慢，都会让瓶里的空气（连氮气一起）受热跑出去，冷却后进去的水就多了。' };
      }
    },
    {
      level: 'mid',
      title: '用高锰酸钾制取一瓶氧气，并检验它',
      desc: '在制氧台里选对药品、发生装置和收集方法，制取完成后用带火星的木条检验，让木条复燃。',
      label: '在制氧台里操作',
      button: '检查这瓶氧气',
      check: function () {
        if (drug !== 'k') return { ok: false, msg: '药品要选高锰酸钾。' };
        if (gen !== 'A') return { ok: false, msg: '高锰酸钾是固体，需要加热，应该选 A 固体加热型。' };
        if (col === 'down') return { ok: false, msg: '氧气密度比空气大，不能用向下排空气法。' };
        if (!(pp >= 1)) return { ok: false, msg: '装置选对了，点“开始制取”，等瓶子集满。' };
        if (!tested) return { ok: false, msg: '已经集满了，再点“用带火星的木条检验”。' };
        return { ok: true, msg: '固体加热型 + ' + (col === 'water' ? '排水法' : '向上排空气法') + '，木条复燃。别忘了：试管口略向下倾斜、放一团棉花' + (col === 'water' ? '，结束时先撤导管再熄灯。' : '。') };
      }
    },
    {
      level: 'mid',
      title: '做铁丝在氧气中燃烧的实验时，集气瓶底要先放少量水或细沙，目的是',
      desc: '可以在“在氧气里烧”里点“铁丝”看看。',
      options: ['防止高温熔融物溅落，使瓶底炸裂', '吸收生成的有毒气体', '让铁丝燃烧得更旺', '降低瓶内氧气的浓度'],
      answer: 0,
      hint: '铁丝燃烧时火星四射，掉下来的东西温度有多高？',
      explain: '铁丝燃烧放出大量热，溅落的熔融物温度很高，直接落在玻璃上会使<b>瓶底炸裂</b>，所以先铺一层水或细沙。吸收有毒气体是<b>硫</b>燃烧时瓶底放水的目的（吸收二氧化硫）；水和沙子不会让燃烧更旺，也不会改变氧气浓度。'
    },
    {
      level: 'trap',
      title: '关于催化剂，下列说法正确的是',
      desc: '回想两条曲线最后停在哪里。',
      options: ['能改变反应速率，本身的质量和化学性质在反应前后不变', '加入二氧化锰能使过氧化氢生成更多的氧气', '二氧化锰是所有反应的催化剂', '催化剂只能加快反应速率'],
      answer: 0,
      hint: '“一变两不变”分别指什么？产量会变吗？',
      explain: '催化剂“一变”是<b>反应速率</b>，“两不变”是自身的<b>质量</b>和<b>化学性质</b>。它<b>不能增加</b>生成物的质量，两条曲线终点一样高；二氧化锰只是某些反应的催化剂；“改变”速率也包括减慢。'
    },
    {
      level: 'trap',
      title: '下列关于氧气的说法正确的是',
      desc: '小心“支持燃烧”和“能燃烧”的区别。',
      options: ['氧气能使带火星的木条复燃，说明氧气能支持燃烧', '氧气具有可燃性，可以作燃料', '鱼能在水中生活，说明氧气易溶于水', '空气中氧气的质量分数约为 21%'],
      answer: 0,
      hint: '复燃的是木条还是氧气？21% 是按什么算的？',
      explain: '带火星的木条复燃，烧起来的是木条，说明氧气<b>能支持燃烧</b>，但氧气本身<b>不能燃烧</b>，没有可燃性，不能作燃料。氧气<b>不易溶于水</b>，水里溶解的那一点点氧气就够鱼呼吸；21% 是<b>体积分数</b>，不是质量分数。'
    }
  ]);
})();
