/* 历史互动馆 · 第 18 课 中古时期的欧洲、亚洲、非洲和美洲 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();
  var NOW = 2026;

  /* ========== 中古世界时间轴 ========== */
  // 色带：同期中国朝代（只做对照）
  var CHINA = [
    { from: 400, to: 420, name: '东晋' },
    { from: 420, to: 589, name: '南北朝' },
    { from: 589, to: 618, name: '隋' },
    { from: 618, to: 907, name: '唐' },
    { from: 907, to: 960, name: '五代' },
    { from: 960, to: 1127, name: '北宋' },
    { from: 1127, to: 1279, name: '南宋' },
    { from: 1279, to: 1368, name: '元' },
    { from: 1368, to: 1500, name: '明' }
  ];
  var BAND = ['#efe7df', '#e3cfc2', '#efe7df', '#ead8c6', '#efe7df', '#e6d3c0', '#ead8c6', '#e3cfc2', '#e6d3c0'];
  var EVENTS = [
    { id: 'west', r: 'west', y: 476, label: '西罗马灭亡', note: '西罗马帝国灭亡，一般把它看作西欧中古时期的开端。东罗马帝国继续存在。' },
    { id: 'frank', r: 'west', y: 486, label: '法兰克王国建立', note: '日耳曼人的一支法兰克人，在首领克洛维带领下建立法兰克王国。' },
    { id: 'just', r: 'byz', y: 527, label: '查士丁尼即位', note: '查士丁尼成为拜占庭（东罗马）皇帝，他下令编纂法典，后人称为《查士丁尼法典》。' },
    { id: 'arab', r: 'arab', y: 630, when: '7 世纪前期', label: '阿拉伯半岛统一', note: '7 世纪前期，阿拉伯半岛基本统一，此后阿拉伯人不断对外扩张。' },
    { id: 'taika', r: 'japan', y: 646, label: '日本大化改新', note: '日本进行大化改新，学习中国唐朝的制度，建立以天皇为中心的中央集权国家。' },
    { id: 'charles', r: 'west', y: 800, label: '查理曼称帝', note: '法兰克国王查理加冕称帝，法兰克王国达到鼎盛，后人称为查理曼帝国。' },
    { id: 'verdun', r: 'west', y: 843, label: '凡尔登条约', note: '查理曼的孙子们签订《凡尔登条约》，把帝国一分为三。' },
    { id: 'bakufu', r: 'japan', y: 1192, when: '12 世纪末', label: '幕府统治', note: '12 世纪末，日本建立幕府，幕府将军掌握国家实权，天皇成为名义上的统治者，武士是幕府统治的支柱。' },
    { id: 'baghdad', r: 'arab', y: 1258, label: '蒙古攻陷巴格达', note: '蒙古军队攻陷巴格达，阿拉伯帝国灭亡。' },
    { id: 'byz', r: 'byz', y: 1453, label: '拜占庭灭亡', note: '奥斯曼土耳其攻占君士坦丁堡，拜占庭帝国（东罗马帝国）灭亡。' }
  ];
  var year = Math.round(L.num(st.y, 476, 400, 1500));
  var tl = L.$('#tl'), yIn = L.$('#year-in');

  function chinaOf(y) {
    if (y < 420) return '东晋（北方十六国）';
    if (y < 581) return '南北朝';
    if (y < 589) return '隋朝建立，南方还有陈';
    if (y < 618) return '隋';
    if (y < 907) return '唐';
    if (y < 960) return '五代十国';
    if (y < 1127) return '北宋（同时有辽、西夏等）';
    if (y < 1234) return '南宋（与金对峙）';
    if (y < 1271) return '南宋（与蒙古对峙）';
    if (y < 1279) return '元朝建立，南宋还没灭亡';
    if (y < 1368) return '元';
    return '明';
  }
  var WORLD = {
    west: function (y) {
      if (y < 476) return '西罗马帝国还在，但已经十分衰弱。';
      if (y < 486) return '西罗马帝国刚灭亡，日耳曼人建立了许多王国。';
      if (y < 800) return '法兰克王国逐渐强大起来。';
      if (y < 843) return '查理曼帝国，法兰克王国最强盛的时候。';
      if (y < 1001) return '帝国一分为三，封君封臣制度盛行，庄园是基本的经济单位。';
      return '城市兴起，市民争取自治，城市里出现了大学。';
    },
    byz: function (y) {
      if (y < 476) return '东罗马帝国（395 年罗马分裂后的东部）。';
      if (y >= 527 && y <= 565) return '查士丁尼在位，下令编纂法典。';
      if (y < 1453) return '拜占庭帝国（东罗马）继续存在，都城君士坦丁堡。';
      return '已被奥斯曼土耳其灭亡。';
    },
    arab: function (y) {
      if (y < 630) return '半岛上部落林立，还没有统一。';
      if (y < 750) return '半岛统一后，不断对外扩张。';
      if (y < 1258) return '地跨亚、非、欧三洲的阿拉伯帝国。';
      return '巴格达被蒙古军队攻陷，阿拉伯帝国已经灭亡。';
    },
    japan: function (y) {
      if (y < 646) return '大化改新以前，土地和部民由贵族私人占有。';
      if (y < 1192) return '大化改新以后，学习唐朝制度，逐步走向封建社会。';
      return '幕府统治时期：将军掌握实权，天皇是名义上的统治者，武士是统治支柱。';
    }
  };

  var WCELL = { west: '#w-west', byz: '#w-byz', arab: '#w-arab', japan: '#w-japan' };
  function nearest(y) {
    var best = null;
    EVENTS.forEach(function (e) { if (Math.abs(e.y - y) <= 8 && (!best || Math.abs(e.y - y) < Math.abs(best.y - y))) best = e; });
    return best;
  }
  function drawTL() {
    var ev = nearest(year);
    var ax = L.timeline(tl, {
      from: 400, to: 1500, step: 100,
      era: CHINA.map(function (d, i) { return { from: d.from, to: d.to, label: d.name, color: BAND[i] }; }),
      events: EVENTS.map(function (e) { var on = ev && ev.id === e.id; return { id: e.id, y: e.y, label: e.label, on: on, color: on ? '#a4492b' : '#7d4d3c' }; }),
      pick: function (id) { var e = EVENTS.filter(function (x) { return x.id === id; })[0]; setYear(e.y); }
    });
    var x = ax.X(year);
    S('line', { x1: x, y1: 8, x2: x, y2: ax.base + 50, stroke: '#c2603f', 'stroke-width': 1.6, 'stroke-dasharray': '4 3' }, tl);
    S('path', { d: 'M' + (x - 6) + ' 4h12l-6 8z', fill: '#c2603f' }, tl);
  }
  function setYear(y) {
    year = y;
    yIn.value = year; L.paintRange(yIn);
    render();
  }
  function render() {
    drawTL();
    var ev = nearest(year);
    L.$('#year-out').textContent = L.yr(year);
    L.$('#cent-badge').textContent = L.century(year);
    L.$('#r-ago').innerHTML = L.span(year, NOW) + '<small>年前</small>';
    L.$('#r-china').textContent = chinaOf(year);
    var evText = '这几年没有课本里的大事';
    if (ev) evText = (ev.when ? ev.when + '：' : (ev.y === year ? '' : '约 ' + L.yr(ev.y) + '：')) + ev.label;
    L.$('#r-event').textContent = evText;
    L.$('#r-text').innerHTML = ev ? ev.note : '拖到时间轴上的圆点附近，看看那一年发生了什么；右边的表格会同时告诉你各地的情况。';
    Object.keys(WORLD).forEach(function (k) { L.$(WCELL[k]).textContent = WORLD[k](year); });
    L.$$('#world tr').forEach(function (tr) { tr.classList.toggle('on', !!ev && ev.r === tr.dataset.r); });
    save();
  }
  L.bindRange(yIn, function (v) { year = v; render(); });
  yIn.value = year; L.paintRange(yIn);

  /* ========== 西欧封建等级 ========== */
  var TIERS = [
    { id: 'king', name: '国王', badge: '第 1 层 · 最高封君', get: '把土地分封给大封建主', duty: '保护自己的封臣',
      text: '国王是最高的封君。他把土地分封给大封建主，大封建主就成了他的封臣，要宣誓效忠、带兵为他作战。但国王只能直接管到自己的封臣。' },
    { id: 'lord', name: '大封建主', badge: '第 2 层 · 公爵、伯爵等', get: '从国王那里得到封地', duty: '效忠国王，为国王作战',
      text: '大封建主是国王的封臣，同时又把一部分土地再分封给小封建主，自己也成了封君。封臣要效忠封君、服兵役，封君要保护封臣。' },
    { id: 'knight', name: '小封建主（骑士）', badge: '第 3 层 · 最低一级封建主', get: '从大封建主那里得到封地', duty: '效忠自己的封君，服兵役',
      text: '骑士是最低一级的封建主，平时管理自己的庄园，战时骑马为封君作战。他只对把土地封给他的那位大封建主负责。' },
    { id: 'serf', name: '农奴', badge: '不属于封建主', get: '从领主那里领一小块份地', duty: '为领主服劳役，交各种捐税',
      text: '农奴没有人身自由，被束缚在庄园的土地上，不能随意离开。他们要在领主的土地上无偿劳动，还要交各种捐税。' }
  ];
  function tierOf(id) { return TIERS.filter(function (t) { return t.id === id; })[0] || TIERS[0]; }
  var tier = tierOf(st.f).id, demo = st.d === '1';
  var feud = L.$('#feud');
  var LORDS = [116, 284], KNIGHTS = [56, 156, 244, 344];
  function fbox(parent, x, y, w, h, label, sub, on, o) {
    o = o || {};
    S('rect', { x: x - w / 2, y: y - h / 2, width: w, height: h, rx: 9, fill: on ? '#f5eeeb' : '#fff', stroke: o.stroke || (on ? '#7d4d3c' : '#cdb7a8'), 'stroke-width': on || o.stroke ? 2.2 : 1.4 }, parent);
    S('text', { x: x, y: y + (sub ? -2 : 4.5), 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: '#4a3a32', text: label }, parent);
    if (sub) S('text', { x: x, y: y + 13, 'text-anchor': 'middle', 'font-size': 10, fill: o.subColor || '#8a7a70', text: sub }, parent);
  }
  function hitGroup(parent, id, label) {
    var h = S('g', { tabindex: 0, role: 'button', 'aria-label': label, style: 'cursor:pointer' }, parent);
    function go() { tier = id; demo = false; drawFeud(); }
    h.addEventListener('click', go);
    h.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    return h;
  }
  function drawFeud() {
    feud.innerHTML = '';
    var d = S('defs', {}, feud), cp = S('clipPath', { id: 'feud-clip' }, d);
    S('rect', { x: 0, y: 0, width: 400, height: 260, rx: 14 }, cp);
    var g = S('g', { 'clip-path': 'url(#feud-clip)' }, feud);
    S('rect', { x: 0, y: 0, width: 400, height: 260, fill: '#fbf8f5' }, g);
    var lc = '#b9a89c';
    LORDS.forEach(function (x) { S('line', { x1: 200, y1: 47, x2: x, y2: 75, stroke: lc, 'stroke-width': 1.6 }, g); });
    KNIGHTS.forEach(function (x, i) { var lx = LORDS[i < 2 ? 0 : 1]; S('line', { x1: lx, y1: 113, x2: x, y2: 139, stroke: lc, 'stroke-width': 1.6 }, g); });
    KNIGHTS.forEach(function (x) { S('line', { x1: x, y1: 177, x2: x, y2: 200, stroke: lc, 'stroke-width': 1.6, 'stroke-dasharray': '3 3' }, g); });
    S('text', { x: 146, y: 60, 'text-anchor': 'end', 'font-size': 10, fill: '#8a7a70', text: '↓ 分封土地' }, g);
    S('text', { x: 254, y: 60, 'font-size': 10, fill: '#8a7a70', text: '效忠、服兵役 ↑' }, g);
    fbox(hitGroup(g, 'king', '国王'), 200, 30, 96, 34, '国王', null, tier === 'king');
    LORDS.forEach(function (x) { fbox(hitGroup(g, 'lord', '大封建主'), x, 94, 108, 38, '大封建主', '公爵、伯爵等', tier === 'lord'); });
    KNIGHTS.forEach(function (x, i) {
      var red = demo && i === 0;
      fbox(hitGroup(g, 'knight', '小封建主（骑士）'), x, 158, 76, 38, '骑士', red ? '只听自己的封君' : '小封建主', tier === 'knight', red ? { stroke: '#c0533a', subColor: '#a4492b' } : null);
    });
    var sg = hitGroup(g, 'serf', '农奴');
    S('rect', { x: 18, y: 200, width: 364, height: 30, rx: 9, fill: tier === 'serf' ? '#f5eeeb' : '#f3ece4', stroke: tier === 'serf' ? '#7d4d3c' : '#dccbbb', 'stroke-width': tier === 'serf' ? 2.2 : 1.2 }, sg);
    S('text', { x: 200, y: 219.5, 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: '#4a3a32', text: '农奴：在庄园里耕种领主的土地' }, sg);
    if (demo) {
      S('path', { d: 'M200 47Q0 40 56 139', fill: 'none', stroke: '#c0533a', 'stroke-width': 2, 'stroke-dasharray': '5 4' }, g);
      S('circle', { cx: 50, cy: 76, r: 9, fill: '#fff', stroke: '#c0533a', 'stroke-width': 2 }, g);
      S('text', { x: 50, y: 80.5, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#c0533a', text: '✕' }, g);
      S('text', { x: 200, y: 250, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: '#a4492b', text: '我的附庸的附庸不是我的附庸' }, g);
    } else {
      S('text', { x: 200, y: 250, 'text-anchor': 'middle', 'font-size': 10, fill: '#a0908a', text: '结构示意：只表示等级关系，不表示人数比例' }, g);
    }
    var t = tierOf(tier);
    L.$('#fd-name').textContent = t.name;
    L.$('#fd-badge').textContent = t.badge;
    L.$('#fd-get').textContent = t.get;
    L.$('#fd-duty').textContent = t.duty;
    L.$('#fd-text').innerHTML = demo
      ? '国王想越过大封建主，直接命令骑士出兵？骑士可以不听，因为他只效忠把土地封给他的大封建主：<b>我的附庸的附庸不是我的附庸</b>。这和中国秦朝以后皇帝直接任免地方官的中央集权很不一样。'
      : t.text;
    L.$('#fd-demo').textContent = demo ? '收回命令' : '国王直接命令骑士出兵';
    save();
  }
  L.$('#fd-demo').addEventListener('click', function () {
    demo = !demo;
    if (demo) tier = 'knight';
    drawFeud();
  });

  /* ========== 成就配对 ========== */
  var REG = [['west', '西欧'], ['byz', '拜占庭'], ['arab', '阿拉伯'], ['japan', '日本'], ['africa', '非洲'], ['america', '美洲']];
  var REG_NAME = {};
  REG.forEach(function (r) { REG_NAME[r[0]] = r[1]; });
  var MATCH = [
    ['自治城市：市民选举市政官员、设立城市法庭', 'west', '西欧城市的市民通过赎买或武装斗争，从封建主手里争得了自治权。'],
    ['博洛尼亚大学', 'west', '在意大利，是欧洲最早的大学之一，以研究法学著称。'],
    ['巴黎大学', 'west', '在法国，是欧洲最早的大学之一，以研究神学著称。'],
    ['《查士丁尼法典》', 'byz', '6 世纪拜占庭皇帝查士丁尼下令编纂，保存和发展了罗马法。'],
    ['把印度人创造的数字传入欧洲', 'arab', '这就是今天说的“阿拉伯数字”：印度人创造，阿拉伯人改进并传到欧洲。'],
    ['大化改新', 'japan', '646 年日本学习唐朝制度进行的改革。'],
    ['幕府将军掌握实权，武士是统治支柱', 'japan', '12 世纪末以后日本进入幕府统治时期，天皇成为名义上的统治者。'],
    ['大津巴布韦石头城遗址', 'africa', '在非洲南部，是用石块砌成的古城遗址，说明中古时期非洲也有自己发达的文明。'],
    ['加纳、马里、桑海等国家先后兴起', 'africa', '这是中古时期西非出现的国家，说明非洲也有自己的文明发展。'],
    ['象形文字和精确的历法', 'america', '这是美洲玛雅人的成就。']
  ];
  function buildMatch() {
    L.match('#match-list', '#match-score', MATCH, REG, function (it, ok) {
      return (ok ? '' : '应该是<b>' + REG_NAME[it[1]] + '</b>。') + it[2];
    });
  }

  /* ========== 从庄园到自治城市 ========== */
  var CITY = [
    { k: '城市兴起', t: '大约 11 世纪前后，西欧农业生产发展，剩余产品多了起来。手工业者和商人聚到交通方便的地方做买卖，慢慢形成了城市。' },
    { k: '矛盾', t: '城市大多建在封建主的领地上。封建主向市民征收各种捐税，还随意干涉城市的事务，市民很不满。' },
    { k: '斗争', t: '市民联合起来：有的用金钱向封建主<b>赎买</b>自治权，有的通过<b>武装斗争</b>夺得自治权。' },
    { k: '获得自治', t: '自治城市可以<b>选举市政官员</b>、设立<b>城市法庭</b>，自己管理自己的事务。不少城市还规定，逃进城的农奴住满一定时间就能获得自由。' },
    { k: '影响', t: '城市里兴起了<b>大学</b>，如博洛尼亚大学、巴黎大学；市民阶层逐渐壮大，成为冲击封建制度的新力量。' }
  ];
  var city = Math.round(L.num(st.c, 0, 0, CITY.length - 1));
  function drawCity() {
    var box = L.$('#city-steps');
    box.innerHTML = '';
    CITY.forEach(function (c, i) {
      if (i) L.html('i', { text: '→' }, box);
      var s = L.html('span', { text: c.k, role: 'button', tabindex: '0', class: i === city ? 'on' : (i < city ? 'done' : '') }, box);
      function go() { city = i; drawCity(); }
      s.addEventListener('click', go);
      s.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    L.$('#city-text').innerHTML = '<b>' + (city + 1) + ' / ' + CITY.length + ' · ' + CITY[city].k + '</b>　' + CITY[city].t;
    L.$$('#city-table tbody tr').forEach(function (tr) { tr.classList.toggle('on', city >= 3); });
    var nb = L.$('#city-next');
    nb.disabled = city === CITY.length - 1;
    nb.textContent = city === CITY.length - 1 ? '已经走到最后' : '下一步';
    save();
  }
  L.$('#city-next').addEventListener('click', function () { if (city < CITY.length - 1) { city++; drawCity(); } });
  L.$('#city-reset').addEventListener('click', function () { city = 0; drawCity(); });

  function save() { L.setState({ y: year, f: tier, d: demo ? 1 : '', c: city }); }

  render();
  drawFeud();
  buildMatch();
  drawCity();

  /* ========== 课本逐课要点（顺序对应新教材九上第 7～12 课） ========== */
  L.keypoints('#keypoints', [
    '486 年克洛维建立<b>法兰克王国</b>；8 世纪中期“丕平献土”；800 年查理加冕称帝；843 年《凡尔登条约》三分帝国。西欧实行<b>封君封臣制度</b>，“我的附庸的附庸不是我的附庸”；庄园是基本经济单位，农奴没有人身自由。',
    '大约 11 世纪前后西欧城市兴起；市民通过<b>赎买或武装斗争</b>获得自治权，可选举市政官员、设城市法庭；市民阶层壮大。城市里出现<b>大学</b>，如意大利博洛尼亚大学、法国巴黎大学。',
    '<b>拜占庭帝国</b>即东罗马帝国，都城君士坦丁堡；6 世纪查士丁尼下令编纂法典，修建圣索菲亚大教堂；保存了古希腊罗马文化；<b>1453 年</b>被奥斯曼土耳其灭亡。',
    '<b>646 年大化改新</b>：学习唐朝制度，建立以天皇为中心的中央集权国家，日本逐步走向封建社会。12 世纪末进入<b>幕府</b>统治时期，将军掌握实权，天皇成为名义上的统治者，武士是统治支柱。',
    '7 世纪初穆罕默德创立伊斯兰教，7 世纪前期阿拉伯半岛基本统一；8 世纪中期成为地跨亚非欧三洲的<b>阿拉伯帝国</b>；1258 年蒙古攻陷巴格达，帝国灭亡。阿拉伯人把印度数字、中国造纸术等传到欧洲，是东西方文化交流的<b>桥梁</b>。',
    '非洲：西非先后出现加纳、马里、桑海等国家，东非沿海兴起商业城市，南部有<b>大津巴布韦</b>遗址。美洲：<b>玛雅人</b>创造象形文字和精确的历法，后来又有阿兹特克人、印加人建立的国家。'
  ]);

  /* ========== 大题训练 ========== */
  L.essay('#essay', {
    title: '中古时期西欧和日本的封建制度',
    materials: [
      { label: '材料一', text: '西欧国王把土地分封给大封建主，大封建主再把一部分土地分封给小封建主（骑士）。封臣要宣誓效忠封君、为封君作战，封君要保护封臣。不过封臣只对把土地封给自己的直接封君负责，所谓“我的附庸的附庸不是我的附庸”。', src: '——据统编版九年级上册第 7 课整理' },
      { label: '材料二', text: '646 年，日本进行改革，把贵族私有的土地和部民收归国家，国家定期把土地分给农民耕种；政治上仿照唐朝的制度，建立以天皇为中心的中央集权国家。', src: '——据统编版九年级上册第 10 课整理' }
    ],
    parts: [
      {
        ask: '(1) 根据材料一，概括西欧封君封臣制度的特点。', score: 4, type: 'sum',
        points: [
          { t: '层层分封土地（国王 → 大封建主 → 小封建主）', s: 1 },
          { t: '封臣效忠封君、为封君作战（服兵役）', s: 1 },
          { t: '封君要保护封臣，双方有权利和义务', s: 1 },
          { t: '封臣只对直接封君负责，国王权力有限（王权分散）', s: 1 }
        ],
        model: '土地层层分封；封臣要宣誓效忠封君并为其作战，封君要保护封臣，双方有相应的权利和义务；封臣只对自己的直接封君负责，“我的附庸的附庸不是我的附庸”，国王的权力有限。'
      },
      {
        ask: '(2) 比较材料一、材料二，指出西欧封君封臣制度与日本大化改新后的政治制度有什么不同。', score: 4, type: 'compare',
        points: [
          { t: '权力：西欧王权分散，一层管一层；日本建立以天皇为中心的中央集权', s: 2 },
          { t: '土地：西欧土地层层分封给封臣；日本把贵族私有土地收归国家，定期分给农民', s: 2 }
        ],
        model: '从权力看，西欧层层分封，王权分散，国王管不到封臣的封臣；大化改新后的日本建立了以天皇为中心的中央集权国家。从土地看，西欧把土地层层分封给封臣；日本把贵族私有的土地和部民收归国家，国家定期把土地分给农民。'
      },
      {
        ask: '(3) 结合所学，说明大化改新的历史意义。', score: 4, type: 'effect',
        points: [
          { t: '建立了以天皇为中心的中央集权国家', s: 1 },
          { t: '使日本逐步走向封建社会', s: 1 },
          { t: '是日本学习中国唐朝先进制度的结果', s: 1 },
          { t: '体现了中日之间的文化交流（善于学习外来先进文化）', s: 1 }
        ],
        model: '大化改新使日本建立了以天皇为中心的中央集权国家，日本由此逐步走向封建社会。改革是学习中国唐朝制度的结果，体现了中日文化交流，也说明善于学习外来先进文化能推动社会进步。'
      }
    ]
  });

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '把年份调到日本大化改新的那一年',
      desc: '在时间轴下面拖动滑块，或者直接点时间轴上的事件。',
      label: '在时间轴里操作',
      button: '检查年份',
      check: function () {
        if (year === 646) return { ok: true, msg: '646 年，日本大化改新。看右边“同期的中国”：这时是<b>唐朝</b>，日本正是学习唐朝的制度进行改革。它属于 7 世纪，距今 ' + L.span(646, NOW) + ' 年。' };
        if (year === 630) return { ok: false, msg: '这里是阿拉伯半岛统一，大化改新还要再往后一点点。' };
        return { ok: false, msg: '现在是' + L.yr(year) + '。大化改新在 7 世纪中期，同期中国是唐朝。' };
      }
    },
    {
      level: 'base',
      title: '486 年建立法兰克王国的是',
      desc: '他是日耳曼人的一支——法兰克人的首领。',
      options: ['克洛维', '查理曼', '查士丁尼', '屋大维'],
      answer: 0,
      hint: '查理曼是后来让法兰克王国达到鼎盛的国王。',
      explain: '<b>克洛维</b>在 486 年建立法兰克王国。查理曼是 800 年称帝的法兰克国王；查士丁尼是 6 世纪的拜占庭皇帝；屋大维是古罗马帝国的建立者。'
    },
    {
      level: 'base',
      title: '拜占庭帝国（东罗马帝国）灭亡于',
      desc: '可以在时间轴的最右边找一找。',
      options: ['1453 年', '476 年', '395 年', '843 年'],
      answer: 0,
      hint: '它比西罗马多存在了将近一千年。',
      explain: '<b>1453 年</b>奥斯曼土耳其攻占君士坦丁堡，拜占庭帝国灭亡。476 年灭亡的是<b>西</b>罗马帝国；395 年罗马帝国分裂为东西两部分；843 年是《凡尔登条约》把查理曼帝国一分为三。'
    },
    {
      level: 'mid',
      title: '点出没有人身自由的那一层',
      desc: '在“西欧封建等级”图里点一层，看右边的说明。',
      label: '在封建等级图里操作',
      button: '检查我点的',
      check: function () {
        if (tier === 'serf') return { ok: true, msg: '农奴被束缚在庄园的土地上，没有人身自由，要为领主服劳役、交各种捐税。他们<b>不属于</b>封建主等级。' };
        if (tier === 'knight') return { ok: false, msg: '骑士虽然是最低一级的封建主，但他有自己的庄园，是自由人。再往下看。' };
        return { ok: false, msg: '“' + tierOf(tier).name + '”是封建主，有自己的封地。往最底层找。' };
      }
    },
    {
      level: 'mid',
      title: '走到市民获得自治权的那一步',
      desc: '在“从庄园到自治城市”里按“下一步”，或者直接点步骤条，停在市民<b>获得自治</b>的那一步。',
      label: '在城市因果链里操作',
      button: '检查',
      check: function () {
        if (city === 3) return { ok: true, msg: '自治城市可以选举市政官员、设立城市法庭。市民是靠<b>赎买或武装斗争</b>争得自治权的，不是封建主主动送的。' };
        if (city < 3) return { ok: false, msg: '现在停在“' + CITY[city].k + '”，市民还没拿到自治权，继续往后走。' };
        return { ok: false, msg: '“影响”是自治以后的结果。点步骤条上前一步。' };
      }
    },
    {
      level: 'mid',
      title: '关于封建时代的日本，下列说法正确的是',
      desc: '看看 646 年同期的中国是哪个朝代，再把时间轴拖到 12 世纪末。',
      options: ['大化改新学习唐朝制度；12 世纪末以后幕府将军掌握实权', '大化改新学习的是古罗马的共和制度', '幕府时期天皇掌握实权，将军只是名义上的统治者', '大化改新使日本从封建社会退回奴隶社会'],
      answer: 0,
      hint: '646 年，中国正处在贞观年间；幕府时期“名义”和“实际”是分开的。',
      explain: '大化改新学习的是<b>中国唐朝</b>的制度，建立以天皇为中心的中央集权国家，使日本逐步<b>走向封建社会</b>；12 世纪末以后进入<b>幕府</b>统治，将军掌握实权，天皇只是名义上的统治者。所以“学古罗马”“天皇掌实权”“退回奴隶社会”都不对。'
    },
    {
      level: 'trap',
      title: '“我的附庸的附庸不是我的附庸”说明了什么？',
      desc: '可以在封建等级图里按“国王直接命令骑士出兵”试一试。',
      options: ['封臣只对自己的直接封君负责，国王不能直接支配封臣的封臣', '国王可以直接指挥全国所有的骑士', '农奴也是国王的附庸，要向国王宣誓效忠', '西欧和秦朝以后的中国一样实行中央集权'],
      answer: 0,
      hint: '骑士的土地是谁封给他的？',
      explain: '封君封臣是<b>一层对一层</b>的关系：骑士只效忠把土地封给他的大封建主，国王管不到他。所以国王指挥不了所有骑士；农奴不是封建主，谈不上附庸；西欧王权分散，正好和中国的中央集权相反。'
    },
    {
      level: 'trap',
      title: '关于“阿拉伯数字”，下列说法正确的是',
      desc: '名字容易让人想错。',
      options: ['印度人创造，阿拉伯人传到欧洲', '阿拉伯人创造的', '中国人创造，经丝绸之路传到欧洲', '古罗马人创造的'],
      answer: 0,
      hint: '名字来自“谁传过来的”，不是“谁发明的”。',
      explain: '这种数字是<b>印度人创造</b>的，阿拉伯人学去后加以改进，再传到欧洲，欧洲人就叫它“阿拉伯数字”。它不是阿拉伯人、中国人或罗马人创造的；古罗马用的是罗马数字。'
    }
  ]);
})();
