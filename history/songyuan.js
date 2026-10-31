/* 历史互动馆 · 第 6 课 辽宋夏金元：民族关系与社会变化 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();
  var NOW = 2026;

  /* ========== 政权并立时间轴 ========== */
  /* 每条泳道一个（组）政权；to 为该政权存在的最后一年 */
  var LANES = [
    { key: 'liao', bars: [{ from: 916, to: 1125, label: '辽（契丹）', reg: '辽', color: '#dcc8b0' }] },
    { key: 'song', bars: [
      { from: 900, to: 959, label: '五代十国', reg: '五代十国', color: '#e9e4df' },
      { from: 960, to: 1126, label: '北宋', reg: '北宋', color: '#e3c2ae' },
      { from: 1127, to: 1276, label: '南宋', reg: '南宋', color: '#d9b09a' },
      { from: 1277, to: 1279, label: '', reg: '南宋残部（抗元）', color: '#efdcd0' }
    ] },
    { key: 'xia', bars: [{ from: 1038, to: 1227, label: '西夏（党项）', reg: '西夏', color: '#d6cdb8' }] },
    { key: 'jin', bars: [{ from: 1115, to: 1234, label: '金（女真）', reg: '金', color: '#cfd6c4' }] },
    { key: 'yuan', bars: [
      { from: 1206, to: 1270, label: '蒙古', reg: '蒙古', color: '#cdd4dc' },
      { from: 1271, to: 1300, label: '元', reg: '元', color: '#b9c4cf' }
    ] }
  ];
  var EVENTS = [
    { id: 'liao', y: 916, label: '辽建立', note: '契丹首领耶律阿保机统一契丹各部，建立契丹政权，后来改国号为辽。' },
    { id: 'song', y: 960, label: '北宋建立', note: '赵匡胤（宋太祖）发动陈桥兵变，建立北宋，定都东京（今河南开封）。' },
    { id: 'cy', y: 1005, label: '澶渊之盟', note: '1004 年辽军南下打到澶州城下，宋真宗亲征。1005 年双方议和，宋每年给辽钱物，称为“岁币”。此后宋辽长期保持和平。' },
    { id: 'xia', y: 1038, label: '西夏建立', note: '党项首领元昊称帝，国号大夏，定都兴庆府，史称西夏。' },
    { id: 'sx', y: 1044, label: '宋夏和议', note: '北宋与西夏议和：元昊向宋称臣，宋每年给西夏钱物，称为“岁赐”。' },
    { id: 'jin', y: 1115, label: '金建立', note: '女真首领阿骨打建立金，都城在会宁。金后来在 1125 年灭辽。' },
    { id: 'nans', y: 1127, label: '北宋亡·南宋立', note: '金军攻破东京，北宋灭亡；同年赵构建立南宋，后来定都临安（今浙江杭州）。' },
    { id: 'sx2', y: 1141, label: '绍兴和议', note: '南宋与金达成“绍兴和议”：宋向金称臣，东以淮水、西以大散关为界，每年向金纳贡。宋金对峙局面形成。' },
    { id: 'mg', y: 1206, label: '蒙古建立', note: '铁木真统一蒙古各部，建立蒙古政权，被尊为“成吉思汗”。' },
    { id: 'yuan', y: 1271, label: '元建立', note: '忽必烈定国号为元，次年定都大都（今北京）。' },
    { id: 'la', y: 1276, label: '元军占临安', note: '元军攻入南宋都城临安，南宋灭亡。文天祥等人继续抗元。' },
    { id: 'tong', y: 1279, label: '元完成统一', note: '元朝攻灭南宋残部，完成全国统一，结束了长期多个政权并立的局面。' }
  ];
  var year = Math.round(L.num(st.y, 1005, 900, 1300));
  var tl = L.$('#tl'), yIn = L.$('#year-in');

  function regimes(y) {
    var out = [];
    LANES.forEach(function (ln) { ln.bars.forEach(function (b) { if (y >= b.from && y <= b.to) out.push(b.reg); }); });
    return out;
  }
  function has(y, r) { return regimes(y).indexOf(r) >= 0; }
  function period(y) {
    if (y < 916) return '五代十国';
    if (y < 960) return '辽与五代并立';
    if (y < 1038) return '辽、北宋并立';
    if (y < 1115) return '辽、北宋、西夏并立';
    if (y < 1127) return '金崛起';
    if (y < 1206) return '金、南宋、西夏并立';
    if (y < 1271) return '蒙古兴起';
    if (y <= 1276) return '元与南宋';
    if (y < 1279) return '元灭南宋残部';
    if (y === 1279) return '元朝完成统一';
    return '元朝统一';
  }
  function nearest(y) {
    var best = null;
    EVENTS.forEach(function (e) { if (Math.abs(e.y - y) <= 3 && (!best || Math.abs(e.y - y) < Math.abs(best.y - y))) best = e; });
    return best;
  }
  function drawTL() {
    var ev = nearest(year);
    var ax = L.timeline(tl, {
      from: 900, to: 1300, step: 50, base: 150,
      events: EVENTS.map(function (e) { var on = ev && ev.id === e.id; return { id: e.id, y: e.y, label: e.label, on: on, color: on ? '#a4492b' : '#7d4d3c' }; }),
      pick: function (id) { var e = EVENTS.filter(function (x) { return x.id === id; })[0]; setYear(e.y); }
    });
    /* 泳道：每个政权一条色带，竖线穿过的就是这一年并立的政权 */
    var top = 184, h = 18, gap = 3;
    var cp = S('clipPath', { id: 'lane-clip' }, S('defs', {}, tl));
    S('rect', { x: ax.X(900), y: top - 2, width: ax.X(1300) - ax.X(900), height: 5 * (h + gap) + 4 }, cp);
    var g = S('g', { 'clip-path': 'url(#lane-clip)' }, tl);
    LANES.forEach(function (ln, i) {
      var y = top + i * (h + gap);
      S('rect', { x: ax.X(900), y: y, width: ax.X(1300) - ax.X(900), height: h, fill: '#f7f3ef' }, g);
      ln.bars.forEach(function (b) {
        var x0 = ax.X(b.from), x1 = ax.X(b.to + 1), on = year >= b.from && year <= b.to;
        S('rect', { x: x0, y: y, width: Math.max(2, x1 - x0 - 1), height: h, rx: 4, fill: b.color, opacity: on ? 1 : 0.5, stroke: on ? '#7d4d3c' : 'none', 'stroke-width': 1.2 }, g);
        if (b.label && x1 - x0 > b.label.length * 11 + 6) S('text', { x: (x0 + x1) / 2, y: y + 13, 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': on ? 700 : 500, fill: '#4a3a32', text: b.label }, g);
      });
    });
    var x = ax.X(year);
    S('line', { x1: x, y1: 8, x2: x, y2: top + 5 * (h + gap), stroke: '#c2603f', 'stroke-width': 1.6, 'stroke-dasharray': '4 3' }, tl);
    S('path', { d: 'M' + (x - 6) + ' 4h12l-6 8z', fill: '#c2603f' }, tl);
  }
  function setYear(y) {
    year = y;
    yIn.value = year; L.paintRange(yIn);
    render();
  }
  function render() {
    drawTL();
    var ev = nearest(year), regs = regimes(year);
    L.$('#year-out').textContent = L.yr(year);
    L.$('#dyn-badge').textContent = period(year);
    L.$('#r-cent').textContent = L.century(year);
    L.$('#r-ago').innerHTML = L.span(year, NOW) + '<small>年前</small>';
    L.$('#r-reg').textContent = regs.join('、') + (regs.length > 1 ? '（' + regs.length + ' 个）' : '');
    L.$('#r-event').textContent = ev ? (ev.y === year ? '' : '约 ' + L.yr(ev.y) + '：') + ev.label : '这几年没有课本里的大事';
    var t = ev ? ev.note : '';
    if (!t) {
      if (year >= 1006 && year < 1038) t = '澶渊之盟以后，宋辽边境长期和平，双方在榷场里做生意。';
      else if (year >= 1045 && year < 1115) t = '辽、北宋、西夏三足并立，议和以后边境贸易兴旺。';
      else if (year >= 1142 && year < 1206) t = '绍兴和议以后，南宋与金隔着淮水—大散关一线对峙。南方经济继续发展。';
      else if (year >= 1207 && year < 1271) t = '蒙古先后灭西夏（1227 年）、灭金（1234 年），与南宋对峙。';
      else if (year > 1279) t = '元朝完成统一，推行行省制度，“省”一直沿用到今天。';
      else t = year + ' 年属于 ' + L.century(year) + '。';
    }
    L.$('#r-text').innerHTML = t;
    save();
  }
  L.bindRange(yIn, function (v) { year = v; render(); });
  yIn.value = year; L.paintRange(yIn);

  /* ========== 宋初加强中央集权 ========== */
  /* up：资源从地方收到中央；down：中央往地方派人 */
  var CZ = [
    { k: 'bing', n: '收兵权', dir: 'up', off: ['武将掌兵', '各管一摊'], on: ['禁军精兵', '归皇帝调动'],
      before: '武将、节度使', after: '皇帝（精兵编入禁军）',
      t: '宋太祖解除了一批高级将领的兵权（课本里“杯酒释兵权”的故事），又把地方精兵编入中央禁军。对应赵普说的“<b>收其精兵</b>”。' },
    { k: 'guan', n: '文臣做知州', dir: 'down', off: ['武将当长官', '节度使'], on: ['文臣知州', '三年一换'],
      before: '武将（节度使）', after: '中央派的文臣，三年一换',
      t: '派<b>文臣</b>担任各州长官（知州），三年一换。文官手里没有兵，又不在一个地方久待，很难形成割据势力。对应“<b>稍夺其权</b>”。' },
    { k: 'tong', n: '设通判', dir: 'down', off: ['无人牵制', ''], on: ['通判', '分知州的权'],
      before: '没有人', after: '通判，和知州互相牵制',
      t: '各州设<b>通判</b>，和知州一起处理政务，分掉知州的一部分权力，还能监督知州。地方长官的权力被一分为二，也是“夺其权”。' },
    { k: 'cai', n: '设转运使', dir: 'up', off: ['钱粮截留', '留在地方'], on: ['财赋', '大部分运往中央'],
      before: '地方自己截留', after: '大部分运往中央',
      t: '设<b>转运使</b>，把地方的财赋大部分运往中央。地方没有钱，就养不起自己的军队。对应“<b>制其钱谷</b>”。' }
  ];
  var czOn = {}, czLast = null;
  String(st.m || '').split('.').forEach(function (k) { CZ.forEach(function (c) { if (c.k === k) czOn[k] = true; }); });
  var czSvg = L.$('#cz'), CX = [101, 184, 267, 350];
  function czCount() { return CZ.filter(function (c) { return czOn[c.k]; }).length; }
  function czToken(g, x, y, lines, o) {
    S('rect', { x: x - 38, y: y - 17, width: 76, height: 34, rx: 8, fill: o.fill, stroke: o.stroke, 'stroke-width': 1.4, 'stroke-dasharray': o.dash || null }, g);
    S('text', { x: x, y: y + (lines[1] ? -2 : 4.5), 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: o.color, text: lines[0] }, g);
    if (lines[1]) S('text', { x: x, y: y + 12, 'text-anchor': 'middle', 'font-size': 9.5, fill: o.sub || o.color, text: lines[1] }, g);
  }
  function drawCz() {
    czSvg.innerHTML = '';
    var cp = S('clipPath', { id: 'cz-clip' }, S('defs', {}, czSvg));
    S('rect', { x: 0, y: 0, width: 400, height: 236, rx: 14 }, cp);
    var g = S('g', { 'clip-path': 'url(#cz-clip)' }, czSvg);
    var n = czCount();
    S('rect', { x: 0, y: 0, width: 400, height: 236, fill: '#fbf8f5' }, g);
    // 中央、地方两条带
    S('rect', { x: 8, y: 10, width: 384, height: 50, rx: 10, fill: n ? '#f3e6dd' : '#f6f1ec', stroke: '#7d4d3c', 'stroke-width': 1 + n * 0.5 }, g);
    S('rect', { x: 8, y: 146, width: 384, height: 50, rx: 10, fill: '#f6f1ec', stroke: '#cdb7a8', 'stroke-width': 1.2 }, g);
    S('text', { x: 34, y: 33, 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: '#7d4d3c', text: '中央' }, g);
    S('text', { x: 34, y: 48, 'text-anchor': 'middle', 'font-size': 9.5, fill: '#8a7a70', text: '皇帝' }, g);
    S('text', { x: 34, y: 169, 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: '#5a4036', text: '地方' }, g);
    S('text', { x: 34, y: 184, 'text-anchor': 'middle', 'font-size': 9.5, fill: '#8a7a70', text: '各州' }, g);
    CZ.forEach(function (c, i) {
      var x = CX[i], on = !!czOn[c.k];
      if (on) {
        if (c.dir === 'up') L.arrow(g, x, 144, x, 63, { color: '#a4492b', width: 2, head: 8 });
        else L.arrow(g, x, 62, x, 143, { color: '#7d4d3c', width: 2, head: 8 });
      } else S('line', { x1: x, y1: 62, x2: x, y2: 144, stroke: '#dcd0c6', 'stroke-width': 1.4, 'stroke-dasharray': '4 4' }, g);
      S('text', { x: x, y: 107, 'text-anchor': 'middle', 'font-size': 11.5, 'font-weight': on ? 700 : 500, fill: on ? '#a4492b' : '#a0908a', text: c.n, stroke: '#fbf8f5', 'stroke-width': 4, 'paint-order': 'stroke' }, g);
      S('text', { x: x, y: 121, 'text-anchor': 'middle', 'font-size': 9.5, fill: on ? '#8a6a5a' : '#b8aaa0', text: on ? (c.dir === 'up' ? '收上来' : '派下去') : '未推行', stroke: '#fbf8f5', 'stroke-width': 4, 'paint-order': 'stroke' }, g);
      var hot = { fill: '#fff', stroke: '#7d4d3c', color: '#7d4d3c', sub: '#8a6a5a' };
      if (!on) czToken(g, x, 171, c.off, c.k === 'tong' ? { fill: 'none', stroke: '#cdb7a8', color: '#a0908a', dash: '4 3' } : { fill: '#fbeee6', stroke: '#e0b6a6', color: '#a4422c', sub: '#b0705a' });
      else if (c.dir === 'up') czToken(g, x, 35, c.on, hot);
      else czToken(g, x, 171, c.on, hot);
    });
    // 底部：进度或利弊
    if (n < 4) {
      S('text', { x: 16, y: 222, 'font-size': 11, fill: '#6f6663', text: '中央集权程度' }, g);
      for (var k = 0; k < 4; k++) S('rect', { x: 100 + k * 72, y: 212, width: 66, height: 12, rx: 6, fill: k < n ? '#a4492b' : '#ebe3dc' }, g);
    } else {
      S('rect', { x: 8, y: 204, width: 186, height: 26, rx: 13, fill: '#eaf4ec', stroke: '#a9c6a4' }, g);
      S('text', { x: 101, y: 221, 'text-anchor': 'middle', 'font-size': 11.5, 'font-weight': 700, fill: '#2f6a4a', text: '利：社会安定，难以割据' }, g);
      S('rect', { x: 202, y: 204, width: 190, height: 26, rx: 13, fill: '#fbeee6', stroke: '#e0b6a6' }, g);
      S('text', { x: 297, y: 221, 'text-anchor': 'middle', 'font-size': 11.5, 'font-weight': 700, fill: '#a4422c', text: '弊：冗官冗兵冗费，积贫积弱' }, g);
    }
  }
  function renderCz() {
    drawCz();
    var n = czCount(), get = function (k) { var c = CZ.filter(function (x) { return x.k === k; })[0]; return czOn[k] ? c.after : c.before; };
    L.$('#cz-name').textContent = n === 0 ? '宋太祖刚即位' : (n < 4 ? '正在收权' : '中央集权大大加强');
    L.$('#cz-badge').textContent = '已推行 ' + n + ' / 4';
    L.$('#cz-bing').textContent = get('bing');
    L.$('#cz-guan').textContent = get('guan');
    L.$('#cz-tong').textContent = get('tong');
    L.$('#cz-cai').textContent = get('cai');
    var t;
    if (n === 0) t = '唐朝后期到五代，<b>节度使</b>（地方军政长官）手握兵权、财权和地方行政权，不听中央的。五代五十多年换了五个朝代。宋太祖赵匡胤自己就是靠陈桥兵变当上皇帝的，最怕别人照着学。';
    else if (n === 4) t = '兵、权、钱都收到中央，武将很难再割据，社会比较安定，这是<b>利</b>。但长期“重文轻武”，军队战斗力减弱；官员和军队越来越多，开支越来越大，形成冗官、冗兵、冗费，北宋逐渐<b>积贫积弱</b>，这是<b>弊</b>。';
    else {
      var c = CZ.filter(function (x) { return x.k === czLast; })[0];
      t = (c && czOn[c.k] ? c.t : (c ? '撤回了“' + c.n + '”，' + (c.dir === 'up' ? '这部分又留在地方了。' : '地方又回到原来的样子。') : '')) + ' 还有 ' + (4 - n) + ' 项没推行。';
    }
    L.$('#cz-text').innerHTML = t;
    czBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(!!czOn[b.dataset.value])); });
    save();
  }
  var czBox = L.$('#cz-chips');
  var czBtns = CZ.map(function (c) {
    var b = L.html('button', { type: 'button', text: c.n, 'aria-pressed': 'false' }, czBox);
    b.dataset.value = c.k;
    b.addEventListener('click', function () { czOn[c.k] = !czOn[c.k]; czLast = c.k; renderCz(); });
    return b;
  });

  /* ========== 经济重心南移（天平示意） ========== */
  var NM = [
    { n: '起点', b: '秦汉时期', N: 5, S: 1, ns: '经济重心，农业发达', ss: '地广人稀，开发较少',
      t: '秦汉时期，黄河流域是全国经济最发达的地区。长江以南自然条件不错，但人口少，很多地方还没有开发。' },
    { n: '北方人南迁', b: '魏晋南北朝', N: 5, S: 2, ns: '战乱频繁，人口外流', ss: '江南得到开发',
      t: '西晋末年以后北方长期战乱，大批北方人民南迁，带去了<b>劳动力和先进的生产技术</b>；南方战乱相对少，江南地区得到开发。' },
    { n: '南移开始', b: '唐朝中后期', N: 4, S: 3, ns: '安史之乱后战乱不断', ss: '相对安定，发展加快',
      t: '安史之乱（唐朝由盛转衰的大战乱）以后，北方又陷入长期动荡，又有大批人口南迁。南方相对安定，经济发展超过以往，<b>经济重心开始南移</b>。' },
    { n: '南方追上来', b: '北宋', N: 4, S: 4, ns: '仍然重要', ss: '推广占城稻',
      t: '北宋时，从越南引进的<b>占城稻</b>（耐旱、早熟、产量高）在南方推广。南方雨水充足、气候温暖，自然条件优越，农业技术也在进步。' },
    { n: '南移完成', b: '南宋', N: 3, S: 5, ns: '宋金对峙，屡遭战乱', ss: '“苏湖熟，天下足”',
      t: '北宋灭亡后，又一次大批北方人南迁。南宋时太湖流域的苏州、湖州一带成了全国重要的粮仓，流传“<b>苏湖熟，天下足</b>”的说法，<b>经济重心南移完成</b>。' }
  ];
  var nmStep = Math.round(L.num(st.n, 0, 0, NM.length - 1));
  var nmSvg = L.$('#nm'), nmStepsEl = L.$('#nm-steps');
  function nmTarget(k) { return (NM[k].S - NM[k].N) * 4; }   /* 度，正数表示南方（右边）沉下去 */
  var nmAng = nmTarget(nmStep), nmAnim = null;
  function drawNm() {
    nmSvg.innerHTML = '';
    var cp = S('clipPath', { id: 'nm-clip' }, S('defs', {}, nmSvg));
    S('rect', { x: 0, y: 0, width: 400, height: 226, rx: 14 }, cp);
    var g = S('g', { 'clip-path': 'url(#nm-clip)' }, nmSvg);
    S('rect', { x: 0, y: 0, width: 400, height: 226, fill: '#fbf8f5' }, g);
    var s = NM[nmStep], px = 200, py = 64, half = 130, r = nmAng * Math.PI / 180;
    var heavy = nmAng > 0.5 ? '南方' : (nmAng < -0.5 ? '北方' : '南北相当');
    S('text', { x: 200, y: 24, 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: '#7d4d3c', text: s.b + ' · ' + (heavy === '南北相当' ? '南北差不多' : '经济重心偏向' + heavy) }, g);
    // 支架
    S('path', { d: 'M200 64L200 196', stroke: '#9a8a80', 'stroke-width': 3 }, g);
    S('rect', { x: 166, y: 194, width: 68, height: 8, rx: 4, fill: '#9a8a80' }, g);
    var lx = px - half * Math.cos(r), ly = py - half * Math.sin(r), rx = px + half * Math.cos(r), ry = py + half * Math.sin(r);
    S('line', { x1: lx, y1: ly, x2: rx, y2: ry, stroke: '#7d4d3c', 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
    S('circle', { cx: px, cy: py, r: 6, fill: '#7d4d3c' }, g);
    function pan(x, y, cnt, color, label, sub) {
      var by = y + 76;
      S('path', { d: 'M' + x + ' ' + y + 'L' + (x - 40) + ' ' + by + 'M' + x + ' ' + y + 'L' + (x + 40) + ' ' + by, stroke: '#b9a89c', 'stroke-width': 1.2 }, g);
      for (var i = 0; i < cnt; i++) S('rect', { x: x - 15, y: by - 12 * (i + 1), width: 30, height: 11, rx: 2.5, fill: color, stroke: '#fff', 'stroke-width': 1 }, g);
      S('path', { d: 'M' + (x - 44) + ' ' + by + 'Q' + x + ' ' + (by + 16) + ' ' + (x + 44) + ' ' + by + 'Z', fill: '#e6d6c4', stroke: '#b9a89c' }, g);
      S('text', { x: x, y: 213, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: '#4a3a32', text: label }, g);
    }
    pan(lx, ly, s.N, '#c9a26d', '北方 · 黄河流域');
    pan(rx, ry, s.S, '#6f9a7a', '南方 · 长江流域');
  }
  function goNm(k) {
    nmStep = k;
    var target = nmTarget(k);
    if (nmAnim) { nmAnim.stop(); nmAnim = null; }
    if (L.REDUCED) nmAng = target;
    else nmAnim = L.loop(function (dt) {
      var d = target - nmAng, stepA = dt * 30;
      if (Math.abs(d) <= stepA) { nmAng = target; drawNm(); nmAnim = null; return false; }
      nmAng += d > 0 ? stepA : -stepA; drawNm();
    });
    renderNm();
  }
  function renderNm() {
    drawNm();
    nmStepsEl.innerHTML = '';
    NM.forEach(function (c, k) {
      if (k) L.html('i', { text: '→' }, nmStepsEl);
      var sp = L.html('span', { text: c.n, role: 'button', tabindex: '0', class: k === nmStep ? 'on' : (k < nmStep ? 'done' : null) }, nmStepsEl);
      sp.addEventListener('click', function () { goNm(k); });
      sp.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goNm(k); } });
    });
    var s = NM[nmStep];
    L.$('#nm-name').textContent = s.n;
    L.$('#nm-badge').textContent = s.b;
    L.$('#nm-n').textContent = s.ns;
    L.$('#nm-s').textContent = s.ss;
    L.$('#nm-text').innerHTML = s.t;
    L.$('#nm-next').textContent = nmStep === NM.length - 1 ? '再看一遍' : '下一步：' + NM[nmStep + 1].n;
    save();
  }
  L.$('#nm-next').addEventListener('click', function () { goNm(nmStep === NM.length - 1 ? 0 : nmStep + 1); });
  L.$('#nm-reset').addEventListener('click', function () { goNm(0); });

  /* ========== 元朝管理表：点一行高亮 ========== */
  var yRows = L.$$('#yuan-table tr');
  var yuanOn = Math.round(L.num(st.v, -1, -1, yRows.length - 1));
  function paintYuan() { yRows.forEach(function (tr, i) { tr.classList.toggle('on', i === yuanOn); }); save(); }
  yRows.forEach(function (tr, i) {
    tr.style.cursor = 'pointer';
    tr.tabIndex = 0;
    tr.addEventListener('click', function () { yuanOn = yuanOn === i ? -1 : i; paintYuan(); });
    tr.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); yuanOn = yuanOn === i ? -1 : i; paintYuan(); } });
  });

  function save() {
    L.setState({ y: year, m: CZ.filter(function (c) { return czOn[c.k]; }).map(function (c) { return c.k; }).join('.'), n: nmStep, v: yuanOn >= 0 ? yuanOn : '' });
  }

  render();
  renderCz();
  renderNm();
  paintYuan();

  /* ========== 课本逐课要点（顺序对应新教材七下第 8～14 课） ========== */
  L.keypoints('#keypoints', [
    '960 年赵匡胤发动陈桥兵变，建立<b>北宋</b>，定都东京；宋太祖收兵权、派文臣任知州、设通判、设转运使，加强中央集权；推行<b>重文轻武</b>，社会安定，但形成冗官、冗兵、冗费，“积贫积弱”。',
    '916 年耶律阿保机建契丹政权（后称辽）；1005 年宋辽订立<b>澶渊之盟</b>，宋给辽“岁币”，此后长期和平；1038 年元昊建<b>西夏</b>，1044 年宋夏议和，宋给“岁赐”；双方在边境设<b>榷场</b>贸易。',
    '1115 年阿骨打建<b>金</b>，1125 年灭辽，1127 年灭北宋；赵构建立<b>南宋</b>，定都临安；<b>岳飞</b>率岳家军抗金；1141 年宋金“<b>绍兴和议</b>”，形成宋金对峙。',
    '1206 年铁木真建立蒙古政权（成吉思汗）；1271 年忽必烈定国号为元；1276 年元军攻占临安，南宋灭亡，文天祥坚持抗元；1279 年元朝完成统一。推行<b>行省制度</b>；设宣政院管辖西藏，设澎湖巡检司管辖澎湖和琉球（今台湾）；回族逐渐形成。',
    '北宋引进<b>占城稻</b>；南宋“<b>苏湖熟，天下足</b>”，经济重心南移完成；景德镇逐渐成为瓷都；北宋前期四川出现<b>交子</b>，是世界上最早的纸币；城市繁荣，出现“瓦子”。',
    '宋元海外贸易发达，<b>广州、泉州</b>是重要港口，宋朝设市舶司管理海外贸易；指南针用于航海；元朝时意大利人<b>马可·波罗</b>来华，《马可·波罗行纪》让欧洲人更了解中国。',
    '北宋<b>毕昇</b>发明活字印刷术，沈括《梦溪笔谈》有记载；火药广泛用于军事；司马光主持编写《资治通鉴》；宋词有苏轼、辛弃疾、李清照，元曲有关汉卿《窦娥冤》；元朝郭守敬编订《授时历》。'
  ]);

  /* ========== 大题训练 ========== */
  L.essay('#essay', {
    title: '宋代的政治与经济重心南移',
    materials: [
      { label: '材料一', text: '惟稍夺其权，制其钱谷，收其精兵，则天下自安矣。', src: '——宋初大臣赵普对宋太祖语，见李焘《续资治通鉴长编》' },
      { label: '材料二', text: '北宋时，从越南引进的占城稻在南方推广；景德镇逐渐成为著名的瓷都；广州、泉州的海外贸易十分兴盛。南宋时，太湖流域成为全国重要的粮仓，民间流传“苏湖熟，天下足”的说法。', src: '——据统编版七年级下册第 12、13 课整理' }
    ],
    parts: [
      {
        ask: '(1) 根据材料一并结合所学，写出宋太祖落实这三条建议的措施，并评价这些措施的影响。', score: 6, type: 'effect',
        points: [
          { t: '“收其精兵”：收回将领兵权，精兵编入禁军', s: 1 },
          { t: '“稍夺其权”：派文臣任知州（三年一换），设通判', s: 1 },
          { t: '“制其钱谷”：设转运使，地方财赋收归中央', s: 1 },
          { t: '积极：加强了中央集权，结束了武将割据，社会比较安定', s: 1 },
          { t: '消极：军队战斗力减弱；冗官、冗兵、冗费，财政负担加重，积贫积弱', s: 2 }
        ],
        model: '措施：收回将领兵权，精兵编入中央禁军；派文臣担任知州，三年一换，并设通判牵制知州；设转运使，把地方财赋大部分运往中央。影响：加强了中央集权，武将难以割据，社会比较安定；但重文轻武使军队战斗力减弱，官员和军队越来越多，开支越来越大，北宋逐渐积贫积弱。'
      },
      {
        ask: '(2) 根据材料二，概括宋代南方经济发展的表现。', score: 4, type: 'sum',
        points: [
          { t: '农业：推广占城稻', s: 1 },
          { t: '太湖流域成为全国重要粮仓（“苏湖熟，天下足”）', s: 1 },
          { t: '手工业：景德镇成为瓷都', s: 1 },
          { t: '商业：广州、泉州海外贸易兴盛', s: 1 }
        ],
        model: '农业上推广占城稻，太湖流域成为全国重要粮仓（“苏湖熟，天下足”）；手工业上景德镇成为著名瓷都；商业上广州、泉州的海外贸易兴盛。'
      },
      {
        ask: '(3) 结合所学，分析我国古代经济重心南移的原因。', score: 4, type: 'why',
        points: [
          { t: '北方战乱频繁，南方相对安定', s: 1 },
          { t: '北方人口大量南迁，带来劳动力和先进生产技术', s: 1 },
          { t: '南方自然条件优越（气候温暖、雨水充足）', s: 1 },
          { t: '南北人民共同开发，农业技术进步、引进良种', s: 1 }
        ],
        model: '北方战乱频繁，南方相对安定；北方人口大量南迁，带来了劳动力和先进的生产技术；南方自然条件优越，气候温暖、雨水充足；南北人民共同努力，引进占城稻等良种，农业技术不断进步。'
      }
    ]
  });

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '把年份调到北宋建立的那一年',
      desc: '在政权并立时间轴下面拖动滑块，或者直接点时间轴上的事件。',
      label: '在时间轴里操作',
      button: '检查年份',
      check: function () {
        if (year === 960) return { ok: true, msg: '960 年赵匡胤建立北宋，定都东京（今河南开封）。这时辽已经建立 44 年了，看竖线：辽和北宋同时存在。' };
        if (year === 916) return { ok: false, msg: '916 年是契丹政权（辽）建立，比北宋早。再往右找找。' };
        if (year === 1127) return { ok: false, msg: '1127 年是北宋灭亡、南宋建立。北宋建立要早得多。' };
        return { ok: false, msg: '现在是 ' + L.yr(year) + '。北宋建立在 10 世纪中期，比澶渊之盟早四十多年。' };
      }
    },
    {
      level: 'base',
      title: '1005 年订立“澶渊之盟”的双方是',
      desc: '可以在时间轴上点“澶渊之盟”看说明。',
      options: ['北宋和辽', '北宋和西夏', '南宋和金', '南宋和蒙古'],
      answer: 0,
      hint: '1005 年时，南宋、金、蒙古都还没出现。',
      explain: '澶渊之盟是<b>北宋与辽</b>议和，宋每年给辽“岁币”。北宋和西夏是 1044 年议和（“岁赐”）；南宋和金是 1141 年“绍兴和议”；1005 年时南宋、金、蒙古都还不存在。'
    },
    {
      level: 'base',
      title: '北宋时发明活字印刷术的是',
      desc: '宋代科技：活字印刷、指南针用于航海、火药武器。',
      options: ['毕昇', '沈括', '蔡伦', '郭守敬'],
      answer: 0,
      hint: '有一个人是“记载”它的，不是发明它的。',
      explain: '北宋平民<b>毕昇</b>发明活字印刷术。沈括在《梦溪笔谈》里记载了这项发明；蔡伦是东汉人，改进了造纸术；郭守敬是元朝天文学家。'
    },
    {
      level: 'mid',
      title: '只落实赵普说的“制其钱谷”',
      desc: '在“当一回宋太祖”里，<b>只推行</b>和“制其钱谷”（控制地方的钱粮）对应的那一项措施，其余三项都不推行。',
      label: '在宋初集权模型里操作',
      button: '检查我推行的措施',
      check: function () {
        var n = czCount();
        if (!czOn.cai) return { ok: false, msg: '“钱谷”就是钱粮财赋。哪项措施把地方的钱运到中央？' + (n ? '先把别的措施点掉。' : '') };
        if (n > 1) return { ok: false, msg: '“设转运使”对了，但还多推行了 ' + (n - 1) + ' 项。题目要求只推行一项。' };
        return { ok: true, msg: '设转运使，把地方财赋大部分运往中央，地方就养不起私兵。“收其精兵”对应收兵权，“稍夺其权”对应文臣做知州、设通判。' };
      }
    },
    {
      level: 'mid',
      title: '把天平调到经济重心“开始南移”的时期',
      desc: '在“经济重心南移”里按“下一步”或直接点步骤。',
      label: '在南移天平里操作',
      button: '检查时期',
      check: function () {
        if (nmStep === 2) return { ok: true, msg: '唐朝中后期，安史之乱后北方战乱，南方相对安定，经济重心开始南移；到<b>南宋</b>时南移完成。' };
        if (nmStep === 4) return { ok: false, msg: '南宋是南移<b>完成</b>，题目问的是<b>开始</b>。往前退几步。' };
        if (nmStep === 1) return { ok: false, msg: '魏晋南北朝时江南得到开发，但经济重心还在北方，还没开始南移。' };
        return { ok: false, msg: '现在是“' + NM[nmStep].b + '”。想想安史之乱发生在哪个朝代。' };
      }
    },
    {
      level: 'mid',
      title: '南宋时民间流传“苏湖熟，天下足”，它反映了',
      desc: '苏、湖指今天太湖流域的苏州、湖州一带。',
      options: ['太湖流域成为全国重要粮仓，经济重心南移完成', '北方黄河流域仍是全国最重要的产粮区', '元朝在江南设立了行省', '占城稻是在南宋时才引进的'],
      answer: 0,
      hint: '“熟”说的是庄稼，“天下足”说的是全国。',
      explain: '苏湖一带丰收，全国的粮食就够了，说明<b>江南成为全国重要粮仓</b>，标志着<b>经济重心南移完成</b>。这时北方屡遭战乱，不再是最重要的产粮区；占城稻是北宋时引进的；行省是元朝的制度，和这句话无关。'
    },
    {
      level: 'trap',
      title: '关于元朝对边疆地区的管辖，下列说法正确的是',
      desc: '可以对照“元朝怎样管理辽阔的国土”那张表，点一行会高亮。',
      options: ['设宣政院管理西藏地区的军政事务', '设驻藏大臣管理西藏地区', '设台湾府管辖台湾', '设西域都护管辖新疆地区'],
      answer: 0,
      hint: '另外三个机构分别是清朝、清朝和西汉设的。',
      explain: '元朝设<b>宣政院</b>，管理全国佛教事务和西藏地区的军政事务；设<b>澎湖巡检司</b>管辖澎湖和琉球（今台湾）。驻藏大臣、台湾府都是<b>清朝</b>设的；西域都护是<b>西汉</b>设的。'
    },
    {
      level: 'trap',
      title: '把年份调到元朝完成统一的那一年',
      desc: '注意：南宋灭亡和元朝完成统一不是同一年。',
      label: '在时间轴里操作',
      button: '检查年份',
      check: function () {
        if (year === 1279) return { ok: true, msg: '1279 年元朝攻灭南宋残余势力，完成统一。1276 年是元军攻占临安、南宋灭亡；1271 年是忽必烈定国号为元。' };
        if (year === 1276) return { ok: false, msg: '1276 年是元军攻占临安，<b>南宋灭亡</b>，可南宋残部还在抗元。完成统一还要再晚几年。' };
        if (year === 1271) return { ok: false, msg: '1271 年是忽必烈定国号为元，这时南宋还在。' };
        return { ok: false, msg: '现在是 ' + L.yr(year) + '。元朝完成统一在 13 世纪后期，看时间轴最右边那几个事件。' };
      }
    }
  ]);
})();
