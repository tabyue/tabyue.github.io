/* 历史互动馆 · 第 7 课 明清（至鸦片战争前） */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();
  var NOW = 2026;

  /* ========== 时间轴 ========== */
  var DYN = [
    { from: 1350, to: 1367, name: '元', color: '#e9e4df' },
    { from: 1368, to: 1643, name: '明', color: '#ead8c6' },
    { from: 1644, to: 1850, name: '清', color: '#e3cfc2' }
  ];
  /* k：和右边“清朝怎样巩固统一多民族国家”表格里哪一行有关 */
  var EVENTS = [
    { id: 'ming', y: 1368, label: '明朝建立', note: '朱元璋在应天（今南京）称帝，建立明朝，他就是明太祖。同年明军攻占大都，结束了元朝在全国的统治。' },
    { id: 'cx', y: 1380, label: '废丞相', note: '明太祖废除丞相，由六部直接对皇帝负责，皇权大大加强。' },
    { id: 'zh1', y: 1405, label: '郑和首下西洋', note: '郑和第一次率船队从刘家港出海下西洋。到 1433 年，他先后七次远航。' },
    { id: 'zh7', y: 1433, label: '七下西洋结束', note: '郑和船队第七次远航归来，七下西洋到此结束，前后历时近 30 年。' },
    { id: 'qing', y: 1644, label: '明亡·清军入关', note: '李自成领导的农民军攻入北京，明朝灭亡；同年清军入关，后来定都北京。' },
    { id: 'zcg', y: 1662, label: '郑成功收复台湾', k: 'tw', note: '郑成功率军打败侵占台湾的荷兰殖民者，收复台湾。' },
    { id: 'tw', y: 1683, label: '清朝统一台湾', k: 'tw', note: '清军进入台湾，郑氏政权归顺，清朝统一台湾。' },
    { id: 'twf', y: 1684, label: '设台湾府', k: 'tw', note: '清朝设置台湾府，隶属福建省，加强了中央对台湾地区的管辖。' },
    { id: 'nbc', y: 1689, label: '《尼布楚条约》', k: 'db', note: '中俄签订《尼布楚条约》，从法律上肯定了黑龙江和乌苏里江流域包括库页岛在内的广大地区都是中国的领土。' },
    { id: 'zzdc', y: 1727, label: '设驻藏大臣', k: 'xz', note: '清朝设驻藏大臣，代表中央与达赖、班禅共同管理西藏事务。' },
    { id: 'gz', y: 1757, label: '一口通商', note: '清政府下令只开放广州一处对外通商，由朝廷特许的广州十三行统一经营对外贸易。' },
    { id: 'yp', y: 1840, label: '鸦片战争', note: '英国发动鸦片战争，这是中国近代史的开端。本课讲到这里为止，后面的内容在八年级上册。' }
  ];
  var year = Math.round(L.num(st.y, 1368, 1350, 1850));
  var tl = L.$('#tl'), yIn = L.$('#year-in');
  var bjRows = L.$$('#bj-table tr'), bjOn = null, bjManual = false;

  function nearest(y) {
    var best = null;
    EVENTS.forEach(function (e) { if (Math.abs(e.y - y) <= 3 && (!best || Math.abs(e.y - y) < Math.abs(best.y - y))) best = e; });
    return best;
  }
  function period(y) {
    if (y < 1368) return '元';
    if (y < 1616) return '明';
    if (y < 1636) return '明 · 东北有后金';
    if (y < 1644) return '明 · 东北有清';
    return '清';
  }
  function drawTL() {
    var ev = nearest(year);
    var ax = L.timeline(tl, {
      from: 1350, to: 1850, step: 50,
      era: DYN.map(function (d) { return { from: d.from, to: d.to, label: d.name, color: d.color }; }),
      events: EVENTS.map(function (e) { var on = ev && ev.id === e.id; return { id: e.id, y: e.y, label: e.label, on: on, color: on ? '#a4492b' : '#7d4d3c' }; }),
      pick: function (id) { var e = EVENTS.filter(function (x) { return x.id === id; })[0]; setYear(e.y); }
    });
    /* 事件密集处引线会压住先画的标签：把文字挪到最上层，靠白色描边盖住引线 */
    L.$$('text', ax.layer).forEach(function (t) { ax.layer.appendChild(t); });
    var x = ax.X(year);
    S('line', { x1: x, y1: 8, x2: x, y2: ax.base + 50, stroke: '#c2603f', 'stroke-width': 1.6, 'stroke-dasharray': '4 3' }, tl);
    S('path', { d: 'M' + (x - 6) + ' 4h12l-6 8z', fill: '#c2603f' }, tl);
  }
  function setYear(y) {
    year = y; bjManual = false;
    yIn.value = year; L.paintRange(yIn);
    render();
  }
  function paintBj() { bjRows.forEach(function (tr) { tr.classList.toggle('on', tr.dataset.k === bjOn); }); }
  function render() {
    drawTL();
    var ev = nearest(year);
    L.$('#year-out').textContent = L.yr(year);
    L.$('#dyn-badge').textContent = period(year);
    L.$('#r-cent').textContent = L.century(year);
    L.$('#r-ago').innerHTML = L.span(year, NOW) + '<small>年前</small>';
    L.$('#r-event').textContent = ev ? (ev.y === year ? '' : '约 ' + L.yr(ev.y) + '：') + ev.label : '这几年没有课本里的大事';
    var t = ev ? ev.note : '';
    if (!t) {
      if (year < 1368) t = '元朝末年，社会矛盾尖锐，各地爆发农民起义。';
      else if (year < 1405) t = '明朝初年，明太祖废丞相、设锦衣卫，皇权大大加强。';
      else if (year < 1433) t = '郑和七下西洋期间（1405—1433 年），船队到过亚非 30 多个国家和地区。';
      else if (year < 1644) t = '明朝中后期。科举实行八股取士；戚继光在东南沿海抗击倭寇。';
      else if (year < 1662) t = '清军入关以后，逐步统一全国。';
      else if (year < 1757) t = '清朝前期，统一多民族国家得到巩固和发展。雍正帝时设立军机处。';
      else if (year < 1840) t = '清朝只开放广州一处对外通商，国门越关越紧；这时英国已经开始了工业革命。';
      else t = '鸦片战争以后的历史放到八年级上册学习。';
    }
    L.$('#r-text').innerHTML = t;
    if (!bjManual) bjOn = ev && ev.k ? ev.k : null;
    paintBj();
    save();
  }
  L.bindRange(yIn, function (v) { year = v; bjManual = false; render(); });
  yIn.value = year; L.paintRange(yIn);
  /* 点表格的一行：高亮它，并把年份跳到相关的大事 */
  var BJ_YEAR = { tw: 1684, db: 1689, xz: 1727 };
  bjRows.forEach(function (tr) {
    function pick() {
      var k = tr.dataset.k;
      if (BJ_YEAR[k]) { setYear(BJ_YEAR[k]); }
      bjOn = k; bjManual = true; paintBj();
    }
    tr.style.cursor = 'pointer';
    tr.tabIndex = 0;
    tr.addEventListener('click', pick);
    tr.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
  });

  /* ========== 君主专制的强化：措施 → 作用 ========== */
  var ZZ = [
    { k: 'cx', n: '废丞相', dyn: '明', who: '明太祖', act: '废除丞相，由六部直接对皇帝负责', eff: '皇权空前加强', cost: '政务全压在皇帝一人身上',
      t: '丞相原本帮皇帝处理全国政务，权力很大。明太祖废除丞相以后，六部尚书直接听命于皇帝。从秦朝开始设立的丞相制度从此被废除。' },
    { k: 'jyw', n: '设锦衣卫', dyn: '明', who: '明太祖', act: '设锦衣卫，负责侦察、逮捕、审讯', eff: '监视官员和百姓', cost: '特务横行，人人自危',
      t: '锦衣卫是皇帝直接指挥的特务机构，可以直接逮捕、审讯官员和百姓。后来明成祖又设东厂，特务统治更加严密。' },
    { k: 'bg', n: '八股取士', dyn: '明', who: '明朝', act: '科举只从四书五经出题，用八股文的固定格式作答', eff: '控制读书人的思想', cost: '束缚思想，摧残人才',
      t: '考生只能按朱熹的注释来解释四书五经，不许发挥自己的见解。读书人一门心思背书、套格式，思想被牢牢束缚。' },
    { k: 'jjc', n: '设军机处', dyn: '清', who: '雍正帝', act: '设军机处，军机大臣跪受笔录，按皇帝旨意拟写文书', eff: '君主专制达到顶峰', cost: '大臣只会听命，不敢有主见',
      t: '军政大事完全由皇帝裁决。军机大臣跪着记下皇帝的命令，写成文书，经皇帝审阅后传达给中央各部和地方执行。军机大臣没有决定权。' },
    { k: 'wzy', n: '大兴文字狱', dyn: '清', who: '康熙、雍正、乾隆三朝', act: '从文人的诗文里摘取字句，罗织罪名', eff: '从思想上严密控制知识分子', cost: '社会恐怖，摧残人才，禁锢思想',
      t: '文人写诗作文稍不留神就会获罪，于是不敢议论时事。文字狱严重阻碍了思想、学术的发展和进步。' }
  ];
  var zzSel = Math.round(L.num(st.z, 0, 0, ZZ.length - 1));
  var zzSvg = L.$('#zz'), PX = [48, 124, 200, 276, 352];
  function zBox(g, x, y, w, h, label, sub, o) {
    o = o || {};
    S('rect', { x: x - w / 2, y: y - h / 2, width: w, height: h, rx: 8, fill: o.fill || '#fff', stroke: o.stroke || '#7d4d3c', 'stroke-width': o.sw || 1.4, 'stroke-dasharray': o.dash || null }, g);
    S('text', { x: x, y: y + (sub ? -2 : 4.5), 'text-anchor': 'middle', 'font-size': o.fs || 12.5, 'font-weight': 700, fill: o.color || '#4a3a32', text: label }, g);
    if (sub) S('text', { x: x, y: y + 12, 'text-anchor': 'middle', 'font-size': 9.5, fill: o.subColor || '#8a7a70', text: sub }, g);
  }
  function zArrow(g, x1, y1, x2, y2, o) { o = o || {}; L.arrow(g, x1, y1, x2, y2, { color: o.color || '#7d4d3c', width: 1.6, head: 7, dash: o.dash }); }
  function zNote(g, x, y, t, anchor, c) { S('text', { x: x, y: y, 'text-anchor': anchor || 'middle', 'font-size': 10, fill: c || '#a4492b', text: t, stroke: '#fff', 'stroke-width': 3, 'paint-order': 'stroke' }, g); }
  function drawZz() {
    zzSvg.innerHTML = '';
    var cp = S('clipPath', { id: 'zz-clip' }, S('defs', {}, zzSvg));
    S('rect', { x: 0, y: 0, width: 400, height: 240, rx: 14 }, cp);
    var g = S('g', { 'clip-path': 'url(#zz-clip)' }, zzSvg);
    S('rect', { x: 0, y: 0, width: 400, height: 240, fill: '#fbf8f5' }, g);
    // 朝代括号
    [[12, 236, '明朝'], [240, 388, '清朝']].forEach(function (b) {
      S('path', { d: 'M' + b[0] + ' 22V17H' + b[1] + 'V22', fill: 'none', stroke: '#cdb7a8', 'stroke-width': 1.2 }, g);
      S('text', { x: (b[0] + b[1]) / 2, y: 13, 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': 600, fill: '#8a6a5a', text: b[2] }, g);
    });
    // 五项措施按时间排开
    ZZ.forEach(function (z, i) {
      var on = i === zzSel, done = i <= zzSel;
      var hit = S('g', { class: 'svg-hit', tabindex: 0, role: 'button', 'aria-label': z.n }, g);
      S('rect', { x: PX[i] - 35, y: 26, width: 70, height: 24, rx: 12, fill: done ? '#7d4d3c' : '#f3ece7', stroke: on ? '#c2603f' : (done ? '#7d4d3c' : '#dccdc2'), 'stroke-width': on ? 2.4 : 1.2 }, hit);
      S('text', { x: PX[i], y: 42, 'text-anchor': 'middle', 'font-size': 11.5, 'font-weight': on ? 700 : 600, fill: done ? '#fff' : '#7d4d3c', text: z.n }, hit);
      hit.addEventListener('click', function () { setZz(i); });
      hit.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setZz(i); } });
    });
    S('path', { d: 'M' + (PX[zzSel] - 6) + ' 54h12l-6 7z', fill: '#c2603f' }, g);
    // 结构示意
    var d = S('g', {}, g);
    S('rect', { x: 8, y: 62, width: 384, height: 138, rx: 12, fill: '#fff', stroke: '#eadfd4' }, d);
    var k = ZZ[zzSel].k;
    if (k === 'cx') {
      S('line', { x1: 200, y1: 70, x2: 200, y2: 192, stroke: '#eadfd4', 'stroke-dasharray': '4 4' }, d);
      zNote(d, 22, 134, '以前', 'start', '#8a7a70');
      zNote(d, 214, 134, '以后', 'start', '#a4492b');
      zBox(d, 108, 88, 76, 26, '皇帝');
      zArrow(d, 108, 101, 108, 115, { color: '#b9a89c' });
      zBox(d, 108, 130, 76, 26, '丞相', null, { stroke: '#b9a89c' });
      zArrow(d, 108, 143, 108, 160, { color: '#b9a89c' });
      zBox(d, 108, 176, 96, 28, '六部', null, { stroke: '#b9a89c' });
      zBox(d, 300, 88, 76, 26, '皇帝', null, { sw: 2.2 });
      zArrow(d, 300, 101, 300, 160, { color: '#a4492b' });
      zNote(d, 292, 134, '直接负责', 'end');
      zBox(d, 356, 130, 50, 24, '丞相', null, { stroke: '#d8ccc4', color: '#b8aaa0', dash: '3 3', fs: 11.5 });
      S('path', { d: 'M336 120l40 20M376 120l-40 20', stroke: '#c2603f', 'stroke-width': 1.8 }, d);
      zBox(d, 300, 176, 96, 28, '六部');
    } else if (k === 'jyw') {
      zBox(d, 200, 88, 90, 28, '皇帝', null, { sw: 2.2 });
      zArrow(d, 200, 102, 200, 116);
      zBox(d, 200, 132, 150, 32, '锦衣卫', '皇帝直接指挥的特务机构', { fill: '#fbeee6', stroke: '#c2603f' });
      zArrow(d, 160, 148, 118, 164, { color: '#c2603f', dash: '4 3' });
      zArrow(d, 240, 148, 282, 164, { color: '#c2603f', dash: '4 3' });
      zBox(d, 100, 180, 96, 26, '官员');
      zBox(d, 300, 180, 96, 26, '百姓');
      zNote(d, 200, 184, '侦察 · 逮捕 · 审讯');
    } else if (k === 'bg') {
      zBox(d, 200, 88, 90, 28, '皇帝', null, { sw: 2.2 });
      zArrow(d, 200, 102, 200, 116);
      zBox(d, 200, 132, 190, 32, '科举：八股取士', '四书五经出题 · 固定格式作答', { fill: '#f6ebe4' });
      zArrow(d, 200, 150, 200, 166);
      zBox(d, 200, 182, 230, 28, '读书人', '只能按朱熹的注释答，不许有自己的见解');
    } else if (k === 'jjc') {
      zBox(d, 200, 88, 120, 30, '皇帝', '军政大事一人裁决', { sw: 2.2 });
      zArrow(d, 200, 103, 200, 116);
      zBox(d, 200, 132, 170, 32, '军机处', '军机大臣跪受笔录', { fill: '#f6ebe4' });
      zArrow(d, 150, 148, 112, 164);
      zArrow(d, 250, 148, 288, 164);
      zNote(d, 200, 172, '传达执行', 'middle', '#8a6a5a');
      zBox(d, 100, 180, 104, 26, '中央各部');
      zBox(d, 300, 180, 104, 26, '地方机构');
    } else {
      zBox(d, 200, 88, 90, 28, '皇帝', null, { sw: 2.2 });
      zArrow(d, 200, 102, 200, 116);
      zBox(d, 200, 132, 170, 32, '文字狱', '从诗文里摘字句定罪', { fill: '#fbeee6', stroke: '#c2603f' });
      zArrow(d, 200, 150, 200, 166, { color: '#c2603f' });
      zBox(d, 200, 182, 210, 28, '文人', '不敢议论时事，思想被禁锢');
    }
    // 皇权集中程度
    S('text', { x: 16, y: 225, 'font-size': 11, fill: '#6f6663', text: '皇权集中程度' }, g);
    for (var i = 0; i < ZZ.length; i++) S('rect', { x: 100 + i * 58, y: 215, width: 52, height: 12, rx: 6, fill: i <= zzSel ? '#a4492b' : '#ebe3dc' }, g);
  }
  function renderZz() {
    drawZz();
    var z = ZZ[zzSel];
    L.$('#zz-name').textContent = z.n;
    L.$('#zz-badge').textContent = z.dyn + ' · ' + z.who;
    L.$('#zz-act').textContent = z.act;
    L.$('#zz-eff').textContent = z.eff;
    L.$('#zz-cost').textContent = z.cost;
    L.$('#zz-text').innerHTML = z.t + (zzSel === 3 ? ' 军机处的设立，标志着君主专制<b>达到顶峰</b>。' : '');
    zzChips.set(z.k);
    save();
  }
  function setZz(i) { zzSel = i; renderZz(); }
  var zzChips = L.chips(L.$('#zz-chips'), ZZ.map(function (z) { return { label: z.n, value: z.k }; }), ZZ[zzSel].k, function (v) {
    ZZ.forEach(function (z, i) { if (z.k === v) zzSel = i; });
    renderZz();
  });

  /* ========== 郑和下西洋（站点先后示意，不是地图） ========== */
  var STOPS = [
    { n: '南京 · 刘家港', sv: '南京·刘家港', b: '起点', x: 346, y: 62, up: true,
      t: '船队从当时的都城南京出发，在刘家港（今江苏太仓）集结后出海。第一次下西洋就有两万七千多人，光是大型宝船就有六十多艘，最大的长四十多丈。' },
    { n: '占城', b: '今越南中南部', x: 304, y: 118,
      t: '船队进入南海，先到占城。占城和中国往来很早，北宋时引进的“占城稻”就来自这里。' },
    { n: '爪哇', b: '今印度尼西亚', x: 252, y: 156,
      t: '爪哇岛在今天的印度尼西亚。船队每到一处，都要访问当地首领、表达通好的愿望，再和当地居民交换货物。' },
    { n: '满剌加', b: '今马来西亚马六甲', x: 214, y: 96, up: true,
      t: '满剌加扼守马六甲海峡，是船队往返南海和印度洋的重要停靠地。郑和下西洋以后，满剌加的国王曾到中国访问。' },
    { n: '锡兰山', b: '今斯里兰卡', x: 166, y: 150,
      t: '过了马六甲海峡就进入印度洋。锡兰山就是今天的斯里兰卡，是印度洋上的岛国。' },
    { n: '古里', b: '今印度西南沿海', x: 124, y: 88, up: true,
      t: '古里是印度洋沿岸的商业大港，郑和第一次下西洋就到达了这里。' },
    { n: '忽鲁谟斯', b: '今伊朗霍尔木兹一带', x: 78, y: 144,
      t: '忽鲁谟斯在波斯湾口，是西亚的重要港口。在后来的几次远航中，船队到达了这里和更远的地方。' },
    { n: '红海沿岸和非洲东海岸', sv: '非洲东海岸', sub: '和红海沿岸', b: '最远处', x: 40, y: 76, up: true,
      t: '这是郑和船队到达的最远的地方。七下西洋，船队到过亚非 30 多个国家和地区，增进了中国与亚非国家的了解和友好往来，是世界航海史上的壮举。' }
  ];
  var stop = Math.round(L.num(st.r, 0, 0, STOPS.length - 1)), roadAnim = null, roadPos = stop;
  var road = L.$('#road');
  function drawRoad() {
    road.innerHTML = '';
    var cp = S('clipPath', { id: 'road-clip' }, S('defs', {}, road));
    S('rect', { x: 0, y: 0, width: 400, height: 220, rx: 14 }, cp);
    var g = S('g', { 'clip-path': 'url(#road-clip)' }, road);
    S('rect', { x: 0, y: 0, width: 400, height: 220, fill: '#f6f8f7' }, g);
    var path = 'M' + STOPS.map(function (s) { return s.x + ' ' + s.y; }).join('L');
    S('path', { d: path, fill: 'none', stroke: '#dde6e4', 'stroke-width': 9, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, g);
    S('path', { d: path, fill: 'none', stroke: '#8fb0ad', 'stroke-width': 2, 'stroke-dasharray': '6 5', 'stroke-linejoin': 'round' }, g);
    var k = Math.floor(roadPos), f = roadPos - k, pts = STOPS.slice(0, k + 1).map(function (s) { return [s.x, s.y]; });
    if (k < STOPS.length - 1 && f > 0) pts.push([STOPS[k].x + (STOPS[k + 1].x - STOPS[k].x) * f, STOPS[k].y + (STOPS[k + 1].y - STOPS[k].y) * f]);
    if (pts.length > 1) S('path', { d: 'M' + pts.map(function (p) { return p.join(' '); }).join('L'), fill: 'none', stroke: '#a4492b', 'stroke-width': 3, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, g);
    STOPS.forEach(function (s, i) {
      var on = i === stop, passed = i <= roadPos + 1e-6;
      var hit = S('g', { class: 'svg-hit', tabindex: 0, role: 'button', 'aria-label': s.n }, g);
      S('circle', { cx: s.x, cy: s.y, r: on ? 9 : 6.5, fill: passed ? '#a4492b' : '#fff', stroke: '#a4492b', 'stroke-width': 2 }, hit);
      var ty = s.up ? s.y - 16 : s.y + 25, sy = s.up ? s.y - 30 : s.y + 38;
      var lab = { 'text-anchor': 'middle', stroke: '#f6f8f7', 'stroke-width': 3, 'paint-order': 'stroke' };
      S('text', Object.assign({ x: s.x, y: ty, 'font-size': 12, 'font-weight': on ? 700 : 600, fill: '#4a3a32', text: s.sv || s.n }, lab), hit);
      S('text', Object.assign({ x: s.x, y: sy, 'font-size': 9.5, fill: '#8a7a70', text: s.sub || s.b }, lab), hit);
      function go() { stopRoad(); stop = i; roadPos = i; drawRoad(); }
      hit.addEventListener('click', go);
      hit.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    // 船
    if (roadAnim) {
      var cx = pts[pts.length - 1][0], cy = pts[pts.length - 1][1];
      S('path', { d: 'M' + (cx - 9) + ' ' + (cy - 1) + 'h18l-4 6h-10z M' + cx + ' ' + (cy - 1) + 'v-11l7 8z', fill: '#7d4d3c' }, g);
    }
    S('text', { x: 14, y: 210, 'font-size': 10, fill: '#a0908a', text: '← 往西' }, g);
    S('text', { x: 200, y: 210, 'text-anchor': 'middle', 'font-size': 10, fill: '#a0908a', text: '示意，不表示实际地理位置和疆域' }, g);
    S('text', { x: 386, y: 210, 'text-anchor': 'end', 'font-size': 10, fill: '#a0908a', text: '往东 →' }, g);
    var s = STOPS[stop];
    L.$('#st-name').textContent = s.n;
    L.$('#st-badge').textContent = (stop + 1) + ' / ' + STOPS.length + ' · ' + s.b;
    L.$('#st-text').innerHTML = s.t;
    L.$('#road-go').textContent = stop === STOPS.length - 1 ? '再航行一遍' : (stop === 0 ? '从刘家港起航' : '继续往西航行');
    save();
  }
  function stopRoad() { if (roadAnim) { roadAnim.stop(); roadAnim = null; } }
  L.$('#road-go').addEventListener('click', function () {
    stopRoad();
    if (stop === STOPS.length - 1) { stop = 0; roadPos = 0; }
    var target = stop + 1;
    if (L.REDUCED) { stop = target; roadPos = target; drawRoad(); return; }
    roadAnim = L.loop(function (dt) {
      roadPos = Math.min(target, roadPos + dt * 1.2);
      if (roadPos >= target) { stop = target; roadAnim = null; drawRoad(); return false; }
      drawRoad();
    });
  });
  L.$('#road-reset').addEventListener('click', function () { stopRoad(); stop = 0; roadPos = 0; drawRoad(); });

  function save() { L.setState({ y: year, z: zzSel, r: stop }); }

  render();
  renderZz();
  drawRoad();

  /* ========== 课本逐课要点（顺序对应新教材七下第 15～21 课） ========== */
  L.keypoints('#keypoints', [
    '1368 年朱元璋建立<b>明朝</b>，定都应天（今南京）；明太祖<b>废丞相</b>，由六部直接对皇帝负责，设<b>锦衣卫</b>；科举实行<b>八股取士</b>；明成祖迁都北京。',
    '1405—1433 年<b>郑和</b>七次下西洋，到过亚非 30 多个国家和地区，最远到达非洲东海岸和红海沿岸；明朝中期<b>戚继光</b>抗倭，基本解除东南沿海倭患；16 世纪中期葡萄牙殖民者攫取了在澳门的居住权。',
    '1616 年努尔哈赤建立<b>后金</b>，1636 年皇太极改国号为<b>清</b>；明朝后期政治腐败，李自成提出“均田免赋”，1644 年攻入北京，明朝灭亡；同年清军入关，后定都北京。',
    '1662 年<b>郑成功</b>收复台湾，1684 年设<b>台湾府</b>，隶属福建省；雅克萨之战后，1689 年中俄签订<b>《尼布楚条约》</b>；册封达赖、班禅，1727 年设<b>驻藏大臣</b>；平定准噶尔部和大小和卓叛乱，设<b>伊犁将军</b>。',
    '雍正帝设<b>军机处</b>，君主专制达到顶峰；康熙、雍正、乾隆三朝大兴<b>文字狱</b>；1757 年只开放广州一处对外通商，由广州十三行经营，<b>闭关政策</b>有一定自卫作用，但使中国逐渐落伍于世界潮流。',
    '玉米、甘薯等高产作物从美洲传入并推广；景德镇是瓷都；晋商、徽商等商帮活跃；明朝中后期江南出现“机户出资，机工出力”的雇佣关系；清朝前期人口增长，乾隆后期超过 3 亿。',
    '李时珍<b>《本草纲目》</b>、宋应星<b>《天工开物》</b>、徐光启《农政全书》、徐霞客《徐霞客游记》；小说《三国演义》《水浒传》《西游记》《红楼梦》；京剧在清朝形成；北京故宫、明长城是建筑代表；思想家有王守仁、黄宗羲、顾炎武、王夫之。',
    '活动课：选一个传统节日（如春节、清明、端午、中秋），查一查它的起源、各朝代的习俗变化和今天的过法，体会传统节日的传承。'
  ]);

  /* ========== 大题训练 ========== */
  L.essay('#essay', {
    title: '明清时期的统一与闭关',
    materials: [
      { label: '材料一', text: '1684 年，清朝设台湾府，隶属福建省；1689 年，中俄签订《尼布楚条约》，从法律上肯定了黑龙江和乌苏里江流域包括库页岛在内的广大地区都是中国的领土；清朝册封达赖喇嘛和班禅额尔德尼，1727 年设驻藏大臣；乾隆帝平定大小和卓叛乱后，设伊犁将军管辖新疆。', src: '——据统编版七年级下册第 18 课整理' },
      { label: '材料二', text: '天朝物产丰盈，无所不有，原不藉外夷货物以通有无。', src: '——1793 年乾隆帝给英国国王的信' }
    ],
    parts: [
      {
        ask: '(1) 根据材料一，概括清朝巩固边疆的措施。', score: 4, type: 'sum',
        points: [
          { t: '台湾：设台湾府，隶属福建省', s: 1 },
          { t: '东北：签订《尼布楚条约》，明确东段边界', s: 1 },
          { t: '西藏：册封达赖、班禅，设驻藏大臣', s: 1 },
          { t: '新疆：平定大小和卓叛乱，设伊犁将军', s: 1 }
        ],
        model: '设台湾府，隶属福建省；与俄国签订《尼布楚条约》；册封达赖喇嘛和班禅额尔德尼，设驻藏大臣；平定大小和卓叛乱，设伊犁将军管辖新疆。'
      },
      {
        ask: '(2) 根据材料二并结合所学，分析清朝实行闭关政策的原因。', score: 4, type: 'why',
        points: [
          { t: '自给自足的自然经济占主导地位（根本原因）', s: 1 },
          { t: '统治者认为“天朝”物产丰富，不需要外国货物（材料）', s: 1 },
          { t: '担心西方殖民者侵犯国家领土主权', s: 1 },
          { t: '害怕沿海人民与外国人交往，危及清朝统治', s: 1 }
        ],
        model: '中国以自给自足的自然经济为主，这是根本原因；统治者认为“天朝”物产丰富，不需要和外国通商；担心西方殖民者到中国沿海活动，侵犯国家领土主权；还害怕沿海人民与外国人交往，联合起来反抗清朝的统治。'
      },
      {
        ask: '(3) 结合材料和所学，围绕“明清时期（至鸦片战争前）的中国”，自拟一个观点并加以阐述。（要求：观点正确，史论结合，条理清楚）', score: 8, type: 'essay',
        points: [
          { t: '观点明确、正确，如“清朝前期统一多民族国家得到巩固，但逐渐落伍于世界”', s: 2 },
          { t: '用统一与边疆治理的史实论证：设台湾府、《尼布楚条约》、驻藏大臣、伊犁将军', s: 2 },
          { t: '用专制强化或闭关政策的史实论证：军机处、文字狱、一口通商，同时西方开始工业革命', s: 2 },
          { t: '有结论回扣观点，条理清楚', s: 2 }
        ],
        model: '观点：清朝前期统一多民族国家得到巩固和发展，但中国逐渐落伍于世界潮流。论证：①清朝设台湾府，签订《尼布楚条约》，设驻藏大臣和伊犁将军，加强了对边疆地区的管辖；②同时，雍正帝设军机处，君主专制达到顶峰，大兴文字狱禁锢思想；1757 年只开放广州一处通商，而 18 世纪 60 年代英国已经开始工业革命。结论：清朝前期巩固统一的功绩值得肯定，但专制和闭关使中国逐渐落后于西方，为近代遭受列强侵略埋下了隐患。'
      }
    ]
  });

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '把年份调到清朝设台湾府的那一年',
      desc: '在时间轴下面拖动滑块，或者点时间轴上的事件、点右边表格里“台湾”那一行。',
      label: '在时间轴里操作',
      button: '检查年份',
      check: function () {
        if (year === 1684) return { ok: true, msg: '1684 年清朝设台湾府，隶属福建省，加强了中央对台湾地区的管辖。它属于 17 世纪，距今 ' + L.span(1684, NOW) + ' 年。' };
        if (year === 1662) return { ok: false, msg: '1662 年是郑成功从荷兰殖民者手中<b>收复</b>台湾，还不是设府。' };
        if (year === 1683) return { ok: false, msg: '1683 年是清军进入台湾、<b>统一</b>台湾。设台湾府还要再晚一年。' };
        return { ok: false, msg: '现在是 ' + L.yr(year) + '。设台湾府在 17 世纪 80 年代，紧挨着“清朝统一台湾”。' };
      }
    },
    {
      level: 'base',
      title: '废除丞相、由六部直接对皇帝负责的是',
      desc: '可以在“皇帝的权力是怎样一步步收紧的”里点“废丞相”看看。',
      options: ['明太祖朱元璋', '明成祖朱棣', '清朝康熙帝', '清朝雍正帝'],
      answer: 0,
      hint: '这是明朝刚建立不久的事。',
      explain: '<b>明太祖</b>废除丞相，权分六部。明成祖迁都北京、派郑和下西洋；康熙帝时收复台湾、签订《尼布楚条约》；雍正帝设立军机处。'
    },
    {
      level: 'base',
      title: '1689 年中俄两国签订的条约是',
      desc: '它从法律上肯定了黑龙江和乌苏里江流域包括库页岛在内的广大地区都是中国的领土。',
      options: ['《尼布楚条约》', '《南京条约》', '澶渊之盟', '绍兴和议'],
      answer: 0,
      hint: '康熙帝时，雅克萨之战以后签订的。',
      explain: '1689 年中俄签订<b>《尼布楚条约》</b>。《南京条约》是 1842 年鸦片战争后签订的；澶渊之盟是北宋和辽；绍兴和议是南宋和金。'
    },
    {
      level: 'mid',
      title: '跟着郑和船队航行到最远的地方',
      desc: '在“跟着郑和船队下西洋”里按“起航”一站站往西走，走到终点。',
      label: '在郑和下西洋示意图里操作',
      button: '检查船队到了哪',
      check: function () {
        if (stop === STOPS.length - 1) return { ok: true, msg: '郑和船队最远到达<b>红海沿岸和非洲东海岸</b>，到过亚非 30 多个国家和地区。' };
        if (stop === 5) return { ok: false, msg: '古里是第一次下西洋就到过的地方，但还不是最远的，继续往西。' };
        return { ok: false, msg: '现在在“' + STOPS[stop].n + '”，还要继续往西航行。' };
      }
    },
    {
      level: 'mid',
      title: '选出标志君主专制达到顶峰的那项措施',
      desc: '在“皇帝的权力是怎样一步步收紧的”里点选一项措施。',
      label: '在君主专制示意图里操作',
      button: '检查我选的措施',
      check: function () {
        var k = ZZ[zzSel].k;
        if (k === 'jjc') return { ok: true, msg: '雍正帝设<b>军机处</b>，军政大事完全由皇帝裁决，军机大臣只能跪受笔录、传达旨意，君主专制达到顶峰。' };
        if (k === 'cx') return { ok: false, msg: '废丞相让明朝皇权空前加强，但“达到顶峰”说的是清朝的一项措施。' };
        if (k === 'wzy') return { ok: false, msg: '文字狱是从<b>思想</b>上控制知识分子。题目问的是政治机构方面的标志。' };
        return { ok: false, msg: '“' + ZZ[k === 'jyw' ? 1 : 2].n + '”是明朝的措施。往清朝那边找。' };
      }
    },
    {
      level: 'mid',
      title: '乾隆帝说“天朝物产丰盈，无所不有，原不藉外夷货物以通有无”。清朝闭关政策的根本原因是',
      desc: '这是 1793 年乾隆帝给英国国王的信里的话。',
      options: ['自给自足的自然经济占主导地位', '西方殖民者已经占领了中国沿海', '清朝的商品经济已经超过西方', '中国已经开始了工业革命'],
      answer: 0,
      hint: '“不需要外国货”背后，是怎样的经济？',
      explain: '中国以<b>自给自足的自然经济</b>为主，统治者认为不需要和外国做买卖，这是根本原因；担心领土主权受侵犯、怕沿海人民与外国人交往危及统治也是原因。当时西方殖民者没有占领中国沿海；开始工业革命的是英国，不是中国。'
    },
    {
      level: 'trap',
      title: '1662 年，郑成功收复台湾，打败的是',
      desc: '注意别和后面的鸦片战争、雅克萨之战搞混。',
      options: ['荷兰殖民者', '英国殖民者', '葡萄牙殖民者', '沙俄侵略者'],
      answer: 0,
      hint: '这个国家在 17 世纪上半叶侵占了台湾。',
      explain: '郑成功打败的是侵占台湾的<b>荷兰殖民者</b>。英国是 1840 年发动鸦片战争；沙俄是康熙帝时在雅克萨之战中被打败的；葡萄牙殖民者和收复台湾这件事无关。'
    },
    {
      level: 'trap',
      title: '关于清朝的“闭关政策”，下列说法正确的是',
      desc: '这是本课最容易被出成判断题的地方。',
      options: ['它是严格限制对外贸易，1757 年后仍保留广州一处通商', '它是完全断绝和外国的一切往来', '它让中国赶上了世界潮流', '它是郑和下西洋以后明朝立即实行的'],
      answer: 0,
      hint: '“只开放广州一处”说明还有一处是开着的。',
      explain: '闭关政策是<b>严格限制</b>对外贸易，不是完全断绝：1757 年后还保留广州一处，由广州十三行统一经营。它虽有一定自卫作用，却使中国逐渐落伍于世界潮流；这是清朝的政策，和郑和下西洋相隔三百多年。'
    }
  ]);
})();
