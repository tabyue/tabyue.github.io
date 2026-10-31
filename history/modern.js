/* 历史互动馆 · 第 19 课 走向近代：文艺复兴与新航路 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();
  var INK = '#4a3a32', MUTE = '#8a7a70', RED = '#a4492b', BROWN = '#7d4d3c', LINE = '#d9cabd', BG = '#fbf6ef';

  /* ========== 四位航海家（示意节点图，不画任何大陆轮廓） ========== */
  var NODES = {
    E: { x: 195, y: 46, n: '欧洲', dx: 0, dy: -13 },
    W: { x: 183, y: 108, n: '非洲西海岸', dx: 12, dy: 4, anchor: 'start' },
    C: { x: 205, y: 172, n: '好望角', dx: 0, dy: 22 },
    I: { x: 305, y: 102, n: '印度', dx: 0, dy: -13 },
    A: { x: 92, y: 84, n: '美洲', dx: 0, dy: -13 },
    S: { x: 60, y: 160, n: '美洲南端海峡', dx: 12, dy: 2, anchor: 'start' },
    P: { x: 354, y: 172, n: '菲律宾', dx: 0, dy: -13 }
  };
  var NAVS = {
    dias: { name: '迪亚士', btn: '迪亚士', year: '1487 年', who: '葡萄牙', dir: '向南', arr: '非洲南端的好望角', route: ['E', 'W', 'C'], t: '葡萄牙航海家。他沿非洲西海岸一路南下，到达好望角。这条路再往前，就有希望绕到印度，为后来的达·伽马探明了方向。' },
    colu: { name: '哥伦布', btn: '哥伦布', year: '1492 年', who: '西班牙', dir: '向西', arr: '美洲', route: ['E', 'A'], t: '意大利航海家，得到西班牙王室支持。他相信地球是圆的，一直向西想去东方，结果到达了美洲。他以为那里是亚洲，所以把当地人叫作“印第安人”。' },
    gama: { name: '达·伽马', btn: '达·伽马', year: '1497—1498 年', who: '葡萄牙', dir: '向南再向东', arr: '印度', route: ['E', 'W', 'C', 'I'], t: '葡萄牙航海家。他 1497 年从葡萄牙出发，绕过好望角，1498 年到达印度，走通了从欧洲直达印度的海路。' },
    mage: { name: '麦哲伦船队', btn: '麦哲伦', year: '1519—1522 年', who: '西班牙', dir: '一直向西', arr: '环球一周，回到西班牙', route: ['E', 'A', 'S', 'P', 'C', 'E'], t: '麦哲伦是葡萄牙人，为西班牙效力。船队穿过美洲南端的海峡进入太平洋。1521 年麦哲伦在菲律宾战死，余下的船员继续航行，1522 年回到西班牙，完成人类首次环球航行，用实践证明了地球是圆的。' }
  };
  var navId = NAVS[st.n] ? st.n : 'dias', prog = 1, navAnim = null;
  var nv = L.$('#nv');

  function routePts(route) {
    var pts = [[NODES[route[0]].x, NODES[route[0]].y]];
    for (var i = 1; i < route.length; i++) {
      var a = NODES[route[i - 1]], b = NODES[route[i]];
      if (route[i - 1] === 'S' && route[i] === 'P') {
        /* 穿越太平洋：在图的下方走一条弧线 */
        var cx = 207, cy = 292;
        for (var k = 1; k <= 28; k++) {
          var t = k / 28, u = 1 - t;
          pts.push([u * u * a.x + 2 * u * t * cx + t * t * b.x, u * u * a.y + 2 * u * t * cy + t * t * b.y]);
        }
      } else pts.push([b.x, b.y]);
    }
    return pts;
  }
  function cut(pts, p) {
    var total = 0, i;
    for (i = 1; i < pts.length; i++) total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    var want = total * p, out = [pts[0]];
    for (i = 1; i < pts.length; i++) {
      var d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      if (want >= d) { out.push(pts[i]); want -= d; continue; }
      var f = d ? want / d : 0;
      out.push([pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f]);
      break;
    }
    return out;
  }
  function toPath(pts) { return 'M' + pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('L'); }
  /* 走过了路线上的第几个节点（用于点亮节点） */
  function reached(route, id) {
    if (route.indexOf(id) < 0) return false;
    var n = NODES[id];
    return cut(routePts(route), prog).some(function (p) { return Math.hypot(p[0] - n.x, p[1] - n.y) < 1; });
  }
  function drawNav() {
    nv.innerHTML = '';
    var d = S('defs', {}, nv), cp = S('clipPath', { id: 'nv-clip' }, d);
    S('rect', { x: 0, y: 0, width: 400, height: 250, rx: 14 }, cp);
    var g = S('g', { 'clip-path': 'url(#nv-clip)' }, nv);
    S('rect', { x: 0, y: 0, width: 400, height: 250, fill: BG }, g);
    S('text', { x: 14, y: 22, 'font-size': 11, fill: MUTE, text: '← 向西' }, g);
    S('text', { x: 386, y: 22, 'text-anchor': 'end', 'font-size': 11, fill: MUTE, text: '向东 →' }, g);
    /* 全部航线的淡底 */
    ['dias', 'colu', 'gama', 'mage'].forEach(function (k) {
      S('path', { d: toPath(routePts(NAVS[k].route)), fill: 'none', stroke: LINE, 'stroke-width': 1.5, 'stroke-dasharray': '5 5' }, g);
    });
    S('text', { x: 207, y: 222, 'text-anchor': 'middle', 'font-size': 11, fill: MUTE, text: '太平洋', stroke: BG, 'stroke-width': 3, 'paint-order': 'stroke' }, g);
    /* 当前航线 */
    var nav = NAVS[navId], pts = cut(routePts(nav.route), prog);
    if (pts.length > 1) S('path', { d: toPath(pts), fill: 'none', stroke: RED, 'stroke-width': 3, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, g);
    Object.keys(NODES).forEach(function (id) {
      var n = NODES[id], lit = reached(nav.route, id);
      S('circle', { cx: n.x, cy: n.y, r: lit ? 7 : 5.5, fill: lit ? RED : '#fff', stroke: lit ? RED : '#b9a89c', 'stroke-width': 2 }, g);
      S('text', { x: n.x + n.dx, y: n.y + n.dy, 'text-anchor': n.anchor || 'middle', 'font-size': 12, 'font-weight': lit ? 700 : 500, fill: lit ? RED : INK, text: n.n, stroke: BG, 'stroke-width': 3, 'paint-order': 'stroke' }, g);
    });
    if (navId === 'mage' && prog >= 1) S('text', { x: 354, y: 144, 'text-anchor': 'middle', 'font-size': 10, fill: RED, text: '麦哲伦战死处', stroke: BG, 'stroke-width': 3, 'paint-order': 'stroke' }, g);
    /* 小船 */
    var h = pts[pts.length - 1];
    if (prog < 1) S('path', { d: 'M' + (h[0] - 8) + ' ' + (h[1] + 1) + 'h16l-4 6h-8zM' + h[0] + ' ' + (h[1] - 11) + 'l7 10h-7z', fill: BROWN, stroke: '#fff', 'stroke-width': 0.8 }, g);
    S('text', { x: 14, y: 240, 'font-size': 13, 'font-weight': 700, fill: BROWN, text: nav.name + ' · ' + nav.year }, g);
  }
  function renderNav() {
    var nav = NAVS[navId];
    L.$('#nv-name').textContent = nav.name;
    L.$('#nv-badge').textContent = nav.year;
    L.$('#nv-who').textContent = nav.who;
    L.$('#nv-dir').textContent = nav.dir;
    L.$('#nv-arr').textContent = nav.arr;
    L.$('#nv-text').textContent = nav.t;
    L.$$('#nv-table tbody tr').forEach(function (tr) { tr.classList.toggle('on', tr.dataset.n === navId); });
    drawNav();
    save();
  }
  function sail() {
    if (navAnim) { navAnim.stop(); navAnim = null; }
    if (L.REDUCED) { prog = 1; drawNav(); return; }
    prog = 0;
    var speed = navId === 'mage' ? 0.28 : 0.7;
    navAnim = L.loop(function (dt) {
      prog = Math.min(1, prog + dt * speed);
      drawNav();
      if (prog >= 1) { navAnim = null; return false; }
    });
  }
  L.chips(L.$('#nv-chips'), Object.keys(NAVS).map(function (k) { return { label: NAVS[k].btn, value: k }; }), navId, function (v) { navId = v; renderNav(); sail(); });
  L.$('#nv-go').addEventListener('click', sail);

  /* ========== 因果链：想去 + 能去 → 开辟 → 影响 ========== */
  var FACS = [
    { id: 'gold', kind: 'want', label: '寻金热', lines: ['寻金热'], x: 52, t: '欧洲商品经济发展，需要更多货币。《马可·波罗行纪》又把东方写得十分富庶，欧洲人一心想到东方寻找黄金，这就是“寻金热”。' },
    { id: 'road', kind: 'want', label: '商路受阻', lines: ['商路受阻'], x: 150, t: '奥斯曼帝国控制了东西方之间的传统商路，欧洲商人做东方生意变得困难，于是想找一条新路。' },
    { id: 'ship', kind: 'can', label: '造船和航海技术', lines: ['造船和', '航海技术'], x: 250, t: '欧洲的造船技术和航海技术进步了，中国传入的指南针也用于航海，远洋航行才有了可能。' },
    { id: 'earth', kind: 'can', label: '地圆学说', lines: ['地圆学说'], x: 348, t: '地圆学说认为地球是圆的，那么一直向西也能到东方。这给了航海家向未知海域出发的信心。' }
  ];
  var IMPACTS = [
    { x: 70, lines: ['主要商路转到', '大西洋沿岸'] },
    { x: 200, lines: ['世界开始连成', '一个整体'], key: true },
    { x: 330, lines: ['殖民掠夺开始', '亚非美受难'] }
  ];
  var bits = String(st.f || '');
  var facOn = {}; FACS.forEach(function (f, i) { facOn[f.id] = bits.charAt(i) === '1'; });
  var impact = bits.charAt(4) === '1', facLast = null, facWarn = '';
  var chain = L.$('#chain'), facBtns = {};

  function count(kind) { return FACS.filter(function (f) { return f.kind === kind && facOn[f.id]; }).length; }
  function allOn() { return count('want') === 2 && count('can') === 2; }
  function multi(parent, x, y, lines, attrs) {
    var y0 = y - (lines.length - 1) * 7.5;
    lines.forEach(function (t, i) {
      var a = { x: x, y: y0 + i * 15 + 4, 'text-anchor': 'middle', 'font-size': 11.5, text: t };
      for (var k in attrs) a[k] = attrs[k];
      S('text', a, parent);
    });
  }
  function toggleFac(f) {
    facOn[f.id] = !facOn[f.id];
    facLast = f; facWarn = '';
    if (!allOn()) impact = false;
    renderChain();
  }
  function drawChain() {
    chain.innerHTML = '';
    S('rect', { x: 0, y: 0, width: 400, height: 262, rx: 14, fill: BG }, chain);
    S('text', { x: 101, y: 20, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: BROWN, text: '为什么想去（原因）' }, chain);
    S('text', { x: 299, y: 20, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: BROWN, text: '凭什么能去（条件）' }, chain);
    var go = allOn();
    FACS.forEach(function (f) {
      var on = facOn[f.id];
      L.arrow(chain, f.x, 66, 200 + (f.x - 200) * 0.3, 100, { color: on ? RED : '#d6c8bc', width: on ? 2 : 1.4, head: 7 });
      var hit = S('g', { class: 'svg-hit', tabindex: 0, role: 'button', 'aria-label': f.label, 'aria-pressed': String(on) }, chain);
      S('rect', { x: f.x - 46, y: 30, width: 92, height: 36, rx: 9, fill: on ? '#f6e4da' : '#fff', stroke: on ? RED : '#cdb7a8', 'stroke-width': on ? 2 : 1.3 }, hit);
      multi(hit, f.x, 48, f.lines, { 'font-weight': on ? 700 : 500, fill: on ? RED : INK });
      hit.addEventListener('click', function () { toggleFac(f); });
      hit.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleFac(f); } });
    });
    S('rect', { x: 118, y: 102, width: 164, height: 46, rx: 11, fill: go ? BROWN : '#fff', stroke: go ? BROWN : '#cdb7a8', 'stroke-width': 1.6 }, chain);
    S('text', { x: 200, y: 122, 'text-anchor': 'middle', 'font-size': 13.5, 'font-weight': 700, fill: go ? '#fff' : INK, text: '新航路开辟' }, chain);
    S('text', { x: 200, y: 139, 'text-anchor': 'middle', 'font-size': 10.5, fill: go ? '#f3e4da' : MUTE, text: go ? '船队可以出发了' : '因素还没凑齐' }, chain);
    IMPACTS.forEach(function (m) {
      L.arrow(chain, 200 + (m.x - 200) * 0.45, 148, m.x, 192, { color: impact ? RED : '#e3d8ce', width: impact ? 2 : 1.3, head: 7, dash: impact ? null : '4 4' });
      S('rect', { x: m.x - 60, y: 194, width: 120, height: 48, rx: 10, fill: impact ? (m.key ? '#a4492b' : '#f6e4da') : '#fff', stroke: impact ? RED : '#e3d8ce', 'stroke-width': m.key && impact ? 2 : 1.3, 'stroke-dasharray': impact ? null : '4 4' }, chain);
      if (impact) multi(chain, m.x, 218, m.lines, { 'font-weight': m.key ? 700 : 500, fill: m.key ? '#fff' : INK });
      else S('text', { x: m.x, y: 222, 'text-anchor': 'middle', 'font-size': 18, fill: '#d6c8bc', text: '?' }, chain);
    });
    S('text', { x: 200, y: 256, 'text-anchor': 'middle', 'font-size': 10.5, fill: MUTE, text: impact ? '三项影响同时存在，评价时要两面都说' : '影响：凑齐因素后按“看影响”' }, chain);
  }
  function renderChain() {
    var w = count('want'), c = count('can'), go = allOn();
    L.$('#fac-want').innerHTML = w + ' <small>/ 2</small>';
    L.$('#fac-can').innerHTML = c + ' <small>/ 2</small>';
    L.$('#fac-badge').textContent = impact ? '影响已展开' : (go ? '可以出发' : '还不能');
    FACS.forEach(function (f) { facBtns[f.id].setAttribute('aria-pressed', String(facOn[f.id])); });
    var t;
    if (facWarn) t = facWarn;
    else if (impact) t = '船开出去以后，世界不再是互相隔绝的几块。欧洲的主要商路和贸易中心转到大西洋沿岸；各大洲联系加强，世界<b>开始</b>连成一个整体；亚非美人民却遭受殖民掠夺。';
    else if (facLast && facOn[facLast.id]) t = facLast.t;
    else if (go) t = '四个因素都有了。按“看影响”，看看船开出去以后世界变成什么样。';
    else if (w && !c) t = '已经有了“想去”的理由，可是没有好船和信心，还是去不了。';
    else if (c && !w) t = '已经有了“能去”的本事，可是还缺少冒险出海的理由。';
    else if (w || c) t = '想去和能去都有了一点，再把另外的因素打开。';
    else t = '先点开一个因素，看看它起了什么作用。';
    L.$('#fac-text').innerHTML = t;
    L.$('#fac-go').textContent = impact ? '收起影响' : '看影响';
    drawChain();
    save();
  }
  FACS.forEach(function (f) {
    var b = L.html('button', { type: 'button', text: f.label, 'aria-pressed': 'false' }, L.$('#fac-chips'));
    b.addEventListener('click', function () { toggleFac(f); });
    facBtns[f.id] = b;
  });
  L.$('#fac-go').addEventListener('click', function () {
    if (impact) { impact = false; facWarn = ''; renderChain(); return; }
    if (!allOn()) { facWarn = '四个因素还没凑齐，船队出不了海。先把“想去”和“能去”都打开。'; renderChain(); return; }
    impact = true; facWarn = ''; renderChain();
  });
  L.$('#fac-reset').addEventListener('click', function () {
    FACS.forEach(function (f) { facOn[f.id] = false; });
    impact = false; facLast = null; facWarn = '';
    renderChain();
  });

  /* ========== 三角贸易（三点示意） ========== */
  var TRI = { eu: { x: 312, y: 44, n: '欧洲' }, af: { x: 312, y: 192, n: '非洲' }, am: { x: 70, y: 118, n: '美洲' } };
  var LEGS = [
    { from: 'eu', to: 'af', name: '第一段 · 出程', route: '欧洲 → 非洲', cargo: '枪支、酒、纺织品等廉价工业品', t: '商船从欧洲出发，把廉价工业品运到非洲，用它们换取被抓捕的黑人。' },
    { from: 'af', to: 'am', name: '第二段 · 中程', route: '非洲 → 美洲', cargo: '被贩卖的黑人奴隶', t: '黑人被当成货物塞进拥挤的船舱，运往美洲，许多人死在途中。活下来的人被卖到种植园和矿山做苦工。这是三段里最黑暗的一段。' },
    { from: 'am', to: 'eu', name: '第三段 · 归程', route: '美洲 → 欧洲', cargo: '金银、蔗糖、棉花、烟草等', t: '商船再把美洲的金银和种植园产品运回欧洲出售。一趟航行三段都赚钱，所以殖民者乐此不疲，非洲却因此失去了大量人口。' }
  ];
  var leg = Math.round(L.num(st.t, 0, 0, 2)), legProg = 1, triAnim = null;
  var tri = L.$('#tri');
  function drawTri() {
    tri.innerHTML = '';
    S('rect', { x: 0, y: 0, width: 400, height: 236, rx: 14, fill: BG }, tri);
    LEGS.forEach(function (l, i) {
      var a = TRI[l.from], b = TRI[l.to], dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy), ux = dx / len, uy = dy / len, on = i === leg;
      L.arrow(tri, a.x + ux * 20, a.y + uy * 20, b.x - ux * 20, b.y - uy * 20, { color: on ? RED : '#cdb7a8', width: on ? 3 : 1.8, head: 11 });
    });
    function lab(x, y, a, lines, on) {
      lines.forEach(function (t, i) { S('text', { x: x, y: y + i * 15, 'text-anchor': a, 'font-size': 11.5, 'font-weight': on ? 700 : 500, fill: on ? RED : MUTE, text: t, stroke: BG, 'stroke-width': 3, 'paint-order': 'stroke' }, tri); });
    }
    lab(324, 104, 'start', ['枪支、酒、', '纺织品等', '工业品'], leg === 0);
    lab(176, 196, 'middle', ['被贩卖的黑人奴隶'], leg === 1);
    lab(170, 54, 'middle', ['金银、蔗糖、棉花、烟草等'], leg === 2);
    Object.keys(TRI).forEach(function (k) {
      var n = TRI[k];
      S('circle', { cx: n.x, cy: n.y, r: 18, fill: '#fff', stroke: BROWN, 'stroke-width': 2 }, tri);
      S('text', { x: n.x, y: n.y + 4.5, 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: INK, text: n.n }, tri);
    });
    var l = LEGS[leg], a0 = TRI[l.from], b0 = TRI[l.to];
    if (legProg < 1) {
      var x = a0.x + (b0.x - a0.x) * legProg, y = a0.y + (b0.y - a0.y) * legProg;
      S('path', { d: 'M' + (x - 8) + ' ' + (y + 1) + 'h16l-4 6h-8zM' + x + ' ' + (y - 11) + 'l7 10h-7z', fill: BROWN, stroke: '#fff', 'stroke-width': 0.8 }, tri);
    }
  }
  function renderTri() {
    var l = LEGS[leg];
    L.$('#tri-leg').textContent = l.name;
    L.$('#tri-from').textContent = l.route;
    L.$('#tri-cargo').textContent = l.cargo;
    L.$('#tri-text').textContent = l.t;
    drawTri();
    save();
  }
  L.$('#tri-go').addEventListener('click', function () {
    if (triAnim) { triAnim.stop(); triAnim = null; }
    leg = (leg + 1) % 3;
    if (L.REDUCED) { legProg = 1; renderTri(); return; }
    legProg = 0; renderTri();
    triAnim = L.loop(function (dt) {
      legProg = Math.min(1, legProg + dt * 1.1);
      drawTri();
      if (legProg >= 1) { triAnim = null; return false; }
    });
  });

  /* ========== 文艺复兴配对 ========== */
  var WORKS = [['shen', '《神曲》'], ['mona', '《蒙娜丽莎》'], ['ham', '《哈姆雷特》']];
  var REN = [
    ['但丁（意大利诗人）', 'shen', '《神曲》是长诗，但丁借游历地狱、炼狱和天堂的故事，批判教会的腐败。'],
    ['达·芬奇（意大利画家）', 'mona', '《蒙娜丽莎》画的是现实中的女子，笑容自然，让人看到真实的人。'],
    ['莎士比亚（英国戏剧家）', 'ham', '《哈姆雷特》是悲剧，主人公的思考和挣扎写出了人的复杂内心。']
  ];
  function initMatch() {
    L.$('#ren-score').textContent = '已答 0 / 3';
    L.match('#ren-list', '#ren-score', REN, WORKS, function (it, ok) { return (ok ? '' : '不对。') + it[2]; });
  }
  L.$('#ren-reset').addEventListener('click', initMatch);

  function save() {
    var f = FACS.map(function (x) { return facOn[x.id] ? '1' : '0'; }).join('') + (impact ? '1' : '0');
    L.setState({ n: navId, f: f, t: leg });
  }

  renderNav();
  renderChain();
  renderTri();
  initMatch();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '选出第一个从欧洲走海路到达印度的航海家',
      desc: '在“四位航海家”里切换，看谁的航线一直走到印度。',
      label: '在航线图里操作',
      button: '检查我选的人',
      check: function () {
        if (navId === 'gama') return { ok: true, msg: '达·伽马 1497 年出发，绕过好望角，1498 年到达印度。' };
        if (navId === 'dias') return { ok: false, msg: '迪亚士只到好望角，还要有人接着往前走。' };
        if (navId === 'colu') return { ok: false, msg: '哥伦布向西到的是美洲，他只是以为到了亚洲。' };
        return { ok: false, msg: '麦哲伦船队走的是环球路线。再找一位专门向东到印度的航海家。' };
      }
    },
    {
      level: 'base',
      title: '文艺复兴的核心思想是',
      desc: '想想但丁、达·芬奇、莎士比亚的作品都在关注谁。',
      options: ['人文主义', '地圆学说', '君主专制', '基督教神学'],
      answer: 0,
      hint: '这个词里就藏着答案：它把“人”放在中心。',
      explain: '核心是<b>人文主义</b>，肯定人的价值和尊严。地圆学说是地理观念，不是文艺复兴的核心；君主专制是政治制度；基督教神学正是人文主义批判的对象。'
    },
    {
      level: 'base',
      title: '把三位人物和作品全部配对正确',
      desc: '在“文艺复兴：人物配作品”里操作。配错了可以按“重新配一次”。',
      label: '在配对区里操作',
      button: '检查配对',
      check: function () {
        var right = L.$$('#ren-list .choice-row.correct').length, wrong = L.$$('#ren-list .choice-row.wrong').length;
        if (right === 3) return { ok: true, msg: '但丁《神曲》、达·芬奇《蒙娜丽莎》、莎士比亚《哈姆雷特》。它们都关注现实中的人，体现了人文主义。' };
        if (wrong) return { ok: false, msg: '有配错的，先按“重新配一次”再试。' };
        return { ok: false, msg: '还有人没配，三位都选完再检查。' };
      }
    },
    {
      level: 'mid',
      title: '把新航路开辟的因果链走完',
      desc: '在因果链里打开全部四个因素，再按“看影响”。',
      label: '在因果链里操作',
      button: '检查因果链',
      check: function () {
        if (!allOn()) return { ok: false, msg: '现在“想去”' + count('want') + ' 个、“能去”' + count('can') + ' 个，四个因素都要打开。' };
        if (!impact) return { ok: false, msg: '因素凑齐了，再按“看影响”。' };
        return { ok: true, msg: '原因是寻金热和商路受阻，条件是造船航海技术和地圆学说，最重要的影响是世界开始连成一个整体。' };
      }
    },
    {
      level: 'mid',
      title: '找到三角贸易里运送黑人奴隶的一段',
      desc: '在三角贸易示意图里按“下一段”，停在那一段再检查。',
      label: '在三角贸易图里操作',
      button: '检查我停在哪',
      check: function () {
        if (leg === 1) return { ok: true, msg: '中程：从非洲到美洲。黑人被当作货物运走，这是三角贸易最罪恶的一段。' };
        return { ok: false, msg: '现在是“' + LEGS[leg].route + '”，运的是' + LEGS[leg].cargo + '。继续按“下一段”。' };
      }
    },
    {
      level: 'mid',
      title: '新航路开辟后，欧洲主要商路发生的变化是',
      desc: '想想船现在从哪里出发、驶向哪里。',
      options: ['从地中海沿岸转到大西洋沿岸', '从大西洋沿岸转到地中海沿岸', '从太平洋沿岸转到印度洋沿岸', '商路完全消失'],
      answer: 0,
      hint: '新航路是向大西洋方向开出去的。',
      explain: '航线通向大西洋，主要商路和贸易中心就从<b>地中海沿岸转到大西洋沿岸</b>。第二项把方向说反了；太平洋沿岸不是当时欧洲的商路中心；商路没有消失，而是扩大了。'
    },
    {
      level: 'trap',
      title: '关于首次环球航行，下列说法正确的是',
      desc: '注意“麦哲伦”和“麦哲伦船队”的区别。',
      options: ['麦哲伦死于菲律宾，他的船队完成了环球航行', '麦哲伦本人完整走完了全程', '哥伦布完成了首次环球航行', '这次航行是向东出发的'],
      answer: 0,
      hint: '回到航线图，选麦哲伦，看图上标的地方。',
      explain: '麦哲伦 1521 年在菲律宾战死，<b>余下的船员</b>继续航行，1522 年回到西班牙。所以不能说他本人走完全程。哥伦布到的是美洲；这支船队是一直<b>向西</b>出发的。'
    },
    {
      level: 'trap',
      title: '“文艺复兴”这个名字容易让人误会，它实际上是',
      desc: '别只看字面意思。',
      options: ['借复兴古典文化，宣传人文主义的思想文化运动', '原样恢复古希腊、古罗马的社会制度', '一场推翻国王的政治革命', '一场反对一切宗教的战争'],
      answer: 0,
      hint: '它的主战场是文学、艺术和思想。',
      explain: '文艺复兴<b>不是简单复古</b>，而是借古典文化宣传人文主义。它没有恢复古代的社会制度，也不是政治革命或战争，主要发生在思想文化领域。'
    }
  ]);
})();
