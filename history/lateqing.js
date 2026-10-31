/* 历史互动馆 · 第 8 课 晚清：内忧外患与救亡图存 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();
  var NOW = 2026;

  /* ========== 时间轴 ========== */
  var ERA = [
    { from: 1840, to: 1860, name: '两次鸦片战争时期', label: '两次鸦片战争', color: '#efe0d6' },
    { from: 1861, to: 1894, name: '洋务运动时期', label: '洋务运动时期', color: '#ead8c6' },
    { from: 1895, to: 1901, name: '民族危机加剧', label: '', color: '#e3cfc2' }
  ];
  var EVENTS = [
    { id: 'yapian', y: 1840, label: '鸦片战争', note: '英国以林则徐虎门销烟为借口，发动鸦片战争。鸦片战争是中国近代史的开端。' },
    { id: 'nanjing', y: 1842, label: '《南京条约》', note: '清政府战败，被迫与英国签订《南京条约》，这是中国近代史上第一个不平等条约。' },
    { id: 'jintian', y: 1851, label: '金田起义', note: '洪秀全在广西桂平金田村发动起义，建号“太平天国”。1853 年太平军攻占南京，改名天京，定为都城。' },
    { id: 'second', y: 1856, label: '第二次鸦片战争', note: '英、法在俄、美的支持下发动第二次鸦片战争，想进一步扩大在华侵略权益。' },
    { id: 'beijing', y: 1860, label: '《北京条约》', note: '英法联军攻占北京，火烧圆明园；清政府被迫签订《北京条约》。' },
    { id: 'tianjing', y: 1864, label: '天京陷落', note: '清军攻陷天京，太平天国运动失败。它沉重打击了清朝的统治。' },
    { id: 'xinjiang', y: 1884, label: '新疆建省', note: '此前左宗棠率军收复了新疆除伊犁以外的地区，伊犁后来通过谈判收回；1884 年清政府在新疆设立行省。' },
    { id: 'jiawu', y: 1894, label: '甲午战争', note: '日本发动甲午中日战争。黄海海战中，致远舰管带邓世昌英勇作战，壮烈牺牲。' },
    { id: 'maguan', y: 1895, label: '《马关条约》', note: '北洋舰队全军覆没，清政府被迫与日本签订《马关条约》，此后列强掀起瓜分中国的狂潮。' },
    { id: 'wuxu', y: 1898, label: '戊戌变法', note: '光绪帝颁布“明定国是”诏书，开始变法；慈禧太后发动政变，变法历时 103 天失败。' },
    { id: 'baguo', y: 1900, label: '八国联军侵华', note: '义和团以“扶清灭洋”为口号兴起；英、美、法、德、意、日、俄、奥八国组成联军侵华，攻占北京。' },
    { id: 'xinchou', y: 1901, label: '《辛丑条约》', note: '清政府被迫与 11 个国家签订《辛丑条约》，中国完全沦为半殖民地半封建社会。' }
  ];
  var year = Math.round(L.num(st.y, 1840, 1840, 1901));
  var tl = L.$('#tl'), yIn = L.$('#year-in');

  function eraOf(y) { for (var i = 0; i < ERA.length; i++) if (y >= ERA[i].from && y <= ERA[i].to) return ERA[i]; return null; }
  function nearest(y) {
    var best = null;
    EVENTS.forEach(function (e) { if (Math.abs(e.y - y) <= 2 && (!best || Math.abs(e.y - y) < Math.abs(best.y - y))) best = e; });
    return best;
  }
  function drawTL() {
    var ev = nearest(year);
    var ax = L.timeline(tl, {
      from: 1837, to: 1904, step: 10,
      era: ERA.map(function (d) { return { from: d.from, to: d.to + 1, label: d.label, color: d.color }; }),
      events: EVENTS.map(function (e) { var on = ev && ev.id === e.id; return { id: e.id, y: e.y, label: e.label, on: on, color: on ? '#a4492b' : '#7d4d3c' }; }),
      pick: function (id) { var e = EVENTS.filter(function (x) { return x.id === id; })[0]; setYear(e.y); }
    });
    var x = ax.X(year + 0.5);
    tl.insertBefore(S('line', { x1: x, y1: 8, x2: x, y2: ax.base + 50, stroke: '#c2603f', 'stroke-width': 1.6, 'stroke-dasharray': '4 3' }), ax.layer);
    S('path', { d: 'M' + (x - 6) + ' 4h12l-6 8z', fill: '#c2603f' }, tl);
  }
  function setYear(y) {
    year = y;
    yIn.value = year; L.paintRange(yIn);
    render();
  }
  function render() {
    drawTL();
    var d = eraOf(year), ev = nearest(year);
    L.$('#year-out').textContent = L.yr(year);
    L.$('#era-badge').textContent = d ? d.name : '—';
    L.$('#r-cent').textContent = L.century(year);
    L.$('#r-ago').innerHTML = L.span(year, NOW) + '<small>年前</small>';
    L.$('#r-event').textContent = ev ? (ev.y === year ? '' : L.yr(ev.y) + '：') + ev.label : '这几年没有课本里的大事';
    var t = ev ? ev.note + ' ' : '';
    if (year <= 1900) t += '1801～1900 年都属于 19 世纪，所以 1900 年还是 19 世纪的最后一年。';
    else t += '1901 年是 20 世纪的第一年，《辛丑条约》正好签订在 20 世纪的开头。';
    L.$('#r-text').innerHTML = t;
    save();
  }
  L.bindRange(yIn, function (v) { year = v; render(); });
  yIn.value = year; L.paintRange(yIn);

  /* ========== 不平等条约对比器 ========== */
  var HK = '1997 年 7 月 1 日，中国政府恢复对香港行使主权。';
  var TREATIES = [
    { id: 'nj', name: '《南京条约》', short: '南京', y: 1842, side: '中英', level: 25, stage: '开始沦为',
      land: '割让香港岛给英国', money: '赔款 2100 万银元', port: '开放广州、厦门、福州、宁波、上海五处为通商口岸',
      other: '英商进出口货物缴纳的税款，中国须同英国商定',
      effect: '中国近代史上第一个不平等条约。中国的领土主权、关税主权遭到破坏，中国<b>开始</b>沦为半殖民地半封建社会。',
      note: '香港岛就是这时被割让给英国的。' + HK },
    { id: 'bj', name: '《北京条约》', short: '北京', y: 1860, side: '中英、中法等', level: 45, stage: '进一步加深',
      land: '割让九龙司地方一区给英国', money: '对英、法赔款各增至白银 800 万两', port: '增开天津为商埠',
      other: '确认 1858 年《天津条约》继续有效：外国公使进驻北京，外国人可以到内地游历、通商、传教等',
      effect: '列强的侵略势力从东南沿海深入内地，中国丧失了更多主权，半殖民地化程度<b>进一步加深</b>。',
      note: '九龙司地方一区也是割让给英国。' + HK + '第二次鸦片战争期间及以后，俄国还通过一系列不平等条约，割占中国东北和西北领土 150 多万平方千米。' },
    { id: 'mg', name: '《马关条约》', short: '马关', y: 1895, side: '中日', level: 70, stage: '大大加深',
      land: '日本割占辽东半岛、台湾全岛及所有附属各岛屿、澎湖列岛', money: '赔偿日本军费白银 2 亿两', port: '开放沙市、重庆、苏州、杭州为商埠',
      other: '允许日本在通商口岸开设工厂',
      effect: '大大加深了中国半殖民地化的程度。此后列强掀起瓜分中国的狂潮，中华民族危机空前严重。',
      note: '辽东半岛后来被清政府用白银“赎回”。台湾自古以来就是中国领土不可分割的一部分；1945 年抗日战争胜利后，台湾及澎湖列岛回归中国。' },
    { id: 'xc', name: '《辛丑条约》', short: '辛丑', y: 1901, side: '中国与 11 国', level: 100, stage: '完全沦为',
      land: '没有割地', money: '赔款白银 4.5 亿两，分 39 年还清，本息共计 9.8 亿两，以海关税、盐税等作担保', port: '没有新开口岸',
      other: '划定北京东交民巷为使馆界，允许各国驻兵保护，不准中国人在界内居住；拆毁大沽炮台，允许外国在北京到山海关铁路沿线要地驻兵；清政府保证严禁人民参加反帝活动',
      effect: '清政府完全成为列强统治中国的工具（“洋人的朝廷”），中国<b>完全沦为</b>半殖民地半封建社会。',
      note: '11 国是英、美、俄、德、日、法、意、奥和比利时、西班牙、荷兰。' }
  ];
  var ASPECTS = [
    { v: 'land', label: '割地', stat: 's-land' },
    { v: 'money', label: '赔款', stat: 's-money' },
    { v: 'port', label: '通商口岸', stat: 's-port' },
    { v: 'other', label: '其他', stat: 's-other' },
    { v: 'effect', label: '影响', stat: null }
  ];
  function trOf(id) { return TREATIES.filter(function (t) { return t.id === id; })[0]; }
  var trId = trOf(st.t) ? st.t : 'nj';
  var asp = ASPECTS.some(function (a) { return a.v === st.a; }) ? st.a : 'land';
  var deep = L.$('#deep'), shown = trOf(trId).level, deepAnim = null;
  var BX0 = 34, BX1 = 366;
  function bx(level) { return BX0 + (BX1 - BX0) * level / 100; }

  function drawDeep() {
    deep.innerHTML = '';
    var d = S('defs', {}, deep), cp = S('clipPath', { id: 'deep-clip' }, d);
    S('rect', { x: 0, y: 0, width: 400, height: 150, rx: 14 }, cp);
    var g = S('g', { 'clip-path': 'url(#deep-clip)' }, deep);
    S('rect', { x: 0, y: 0, width: 400, height: 150, fill: '#fbf8f5' }, g);
    S('text', { x: 16, y: 22, 'font-size': 12.5, 'font-weight': 700, fill: '#4a3a32', text: '半殖民地化程度（示意）' }, g);
    S('rect', { x: BX0, y: 62, width: BX1 - BX0, height: 14, rx: 7, fill: '#efe4dc' }, g);
    S('rect', { x: BX0, y: 62, width: Math.max(14, bx(shown) - BX0), height: 14, rx: 7, fill: '#b5654a' }, g);
    S('text', { x: BX0 - 4, y: 98, 'font-size': 10.5, fill: '#8a7a70', text: '1840 年前' }, g);
    S('text', { x: BX0 - 4, y: 112, 'font-size': 10.5, fill: '#8a7a70', text: '封建国家' }, g);
    TREATIES.forEach(function (t, i) {
      var x = bx(t.level), on = t.id === trId, reached = t.level <= shown + 0.01, last = i === TREATIES.length - 1;
      var anchor = last ? 'end' : 'middle', tx = last ? x + 4 : x;
      var hit = S('g', { class: 'svg-hit', tabindex: 0, role: 'button', 'aria-label': t.name }, g);
      S('rect', { x: x - 30, y: 22, width: 60, height: 98, fill: 'transparent' }, hit);
      S('circle', { cx: x, cy: 69, r: on ? 9 : 6.5, fill: reached ? '#a4492b' : '#fff', stroke: '#a4492b', 'stroke-width': 2 }, hit);
      var ly = i % 2 ? 38 : 53;
      S('line', { x1: x, y1: ly + 4, x2: x, y2: 60, stroke: '#d8c8bd', 'stroke-width': 1 }, hit);
      S('text', { x: tx, y: ly, 'text-anchor': anchor, 'font-size': 12, 'font-weight': on ? 700 : 600, fill: on ? '#a4492b' : '#4a3a32', text: t.name }, hit);
      S('text', { x: tx, y: 98, 'text-anchor': anchor, 'font-size': 10.5, fill: '#8a7a70', text: t.y + ' 年' }, hit);
      S('text', { x: tx, y: 113, 'text-anchor': anchor, 'font-size': 11, 'font-weight': on ? 700 : 500, fill: reached ? '#a4492b' : '#a0908a', text: t.stage }, hit);
      hit.addEventListener('click', function () { setTreaty(t.id); });
      hit.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTreaty(t.id); } });
    });
    S('text', { x: 200, y: 140, 'text-anchor': 'middle', 'font-size': 10, fill: '#a0908a', text: '示意：只表示一步步加深的先后，不是精确数值' }, g);
  }
  function animateDeep() {
    var target = trOf(trId).level;
    if (deepAnim) { deepAnim.stop(); deepAnim = null; }
    if (L.REDUCED) { shown = target; drawDeep(); return; }
    deepAnim = L.loop(function (dt) {
      var dir = target > shown ? 1 : -1;
      shown += dir * dt * 120;
      if ((dir > 0 && shown >= target) || (dir < 0 && shown <= target)) { shown = target; deepAnim = null; drawDeep(); return false; }
      drawDeep();
    });
  }
  function renderTable() {
    var a = ASPECTS.filter(function (x) { return x.v === asp; })[0];
    L.$('#asp-head').textContent = a.label;
    var tb = L.$('#tr-table tbody');
    tb.innerHTML = '';
    TREATIES.forEach(function (t) {
      var tr = L.html('tr', { class: t.id === trId ? 'on' : null, style: 'cursor:pointer' }, tb);
      L.html('td', { html: t.name + '<br>' + t.y + ' 年' }, tr);
      L.html('td', { html: t[asp] }, tr);
      tr.addEventListener('click', function () { setTreaty(t.id); });
    });
  }
  function renderTreaty() {
    var t = trOf(trId);
    L.$('#tr-name').textContent = t.name;
    L.$('#tr-badge').textContent = t.y + ' 年 · ' + t.side;
    L.$('#tr-land').textContent = t.land;
    L.$('#tr-money').textContent = t.money;
    L.$('#tr-port').textContent = t.port;
    L.$('#tr-other').textContent = t.other;
    L.$('#tr-text').innerHTML = '<b>影响：</b>' + t.effect;
    L.$('#tr-note').innerHTML = t.note;
    ASPECTS.forEach(function (a) {
      if (!a.stat) return;
      var on = a.v === asp, box = L.$('#' + a.stat);
      box.querySelector('strong').style.color = on ? '#a4492b' : '';
      box.querySelector('span').style.fontWeight = on ? '700' : '';
    });
    var lead = L.$('#tr-text');
    lead.style.background = asp === 'effect' ? '#f6ece6' : '';
    lead.style.borderRadius = '10px';
    lead.style.padding = asp === 'effect' ? '8px 10px' : '';
    renderTable();
    save();
  }
  function setTreaty(id) { trId = id; trChips.set(id); renderTreaty(); animateDeep(); }
  var trChips = L.chips(L.$('#tr-chips'), TREATIES.map(function (t) { return { label: t.short + ' ' + t.y, value: t.id }; }), trId, function (v) { setTreaty(v); });
  L.chips(L.$('#asp-chips'), ASPECTS.map(function (a) { return { label: a.label, value: a.v }; }), asp, function (v) { asp = v; renderTreaty(); });

  /* ========== 洋务运动与戊戌变法 ========== */
  var STAGES = ['背景', '主张', '措施', '结果'];
  var PLANS = {
    yw: { name: '洋务运动', badge: '19 世纪 60—90 年代', learn: '技术（器物）', end: '甲午战争中北洋舰队全军覆没，“自强”“求富”落空',
      who: '中央：奕䜣；地方：曾国藩、李鸿章、左宗棠、张之洞', aim: '利用西方先进技术，维护清朝统治；口号“自强”“求富”',
      text: [
        '两次鸦片战争失败，太平天国运动又沉重打击了清朝统治。清政府内部一部分官员主张学习西方先进技术，他们被称为<b>洋务派</b>。',
        '洋务派的目的是<b>利用西方先进技术，维护清朝统治</b>。前期以“自强”为口号，后期以“求富”为口号。中央的代表是奕䜣，地方的代表是曾国藩、李鸿章、左宗棠、张之洞。',
        '前期创办军事工业，如安庆内军械所、江南制造总局、福州船政局；后期创办民用工业，如轮船招商局、汉阳铁厂。还筹划海防、建立新式海军，创办新式学堂，派遣留学生。',
        '甲午中日战争中，北洋舰队全军覆没，洋务运动“自强”“求富”的目标没有实现。但它引进了西方先进技术，使中国出现了第一批近代企业，迈出了中国早期现代化的步伐。'
      ] },
    wx: { name: '戊戌变法', badge: '1898 年 · 共 103 天', learn: '政治制度', end: '慈禧太后发动政变，变法失败',
      who: '维新派：康有为、梁启超、谭嗣同等；光绪帝支持', aim: '学习西方政治制度，变法图强，实行君主立宪',
      text: [
        '甲午战败、《马关条约》签订，民族危机空前严重。1895 年，康有为联合在北京参加会试的举人上书光绪帝，要求拒和、迁都、变法，史称“<b>公车上书</b>”。',
        '维新派认为只学技术不够，要<b>学习西方的政治制度</b>，变法图强，实行君主立宪。他们办报刊、建学会，宣传变法主张。',
        '1898 年 6 月，光绪帝颁布“明定国是”诏书，宣布变法：改革政府机构，任用维新人士；鼓励私人兴办工矿企业；开办<b>京师大学堂</b>；废除八股文；训练新式陆军和海军。',
        '1898 年 9 月，以慈禧太后为首的顽固派发动政变，光绪帝被囚禁，谭嗣同等“戊戌六君子”被杀害，康有为、梁启超逃往海外。新政除京师大学堂外都被废除。戊戌变法是一次资产阶级性质的改良运动，促进了思想解放。'
      ] }
  };
  var plan = PLANS[st.p] ? st.p : 'yw';
  var stage = Math.round(L.num(st.g, 0, 0, 3));
  var stair = L.$('#stair');
  function drawStair() {
    stair.innerHTML = '';
    var d = S('defs', {}, stair), cp = S('clipPath', { id: 'stair-clip' }, d);
    S('rect', { x: 0, y: 0, width: 400, height: 210, rx: 14 }, cp);
    var g = S('g', { 'clip-path': 'url(#stair-clip)' }, stair);
    S('rect', { x: 0, y: 0, width: 400, height: 210, fill: '#fbf8f5' }, g);
    S('text', { x: 16, y: 22, 'font-size': 12.5, 'font-weight': 700, fill: '#4a3a32', text: '学习西方：一层比一层深' }, g);
    var STEPS = [
      { x: 22, y: 140, level: '器物（技术）', who: '洋务运动', sub: '19 世纪 60—90 年代', key: 'yw' },
      { x: 144, y: 98, level: '政治制度', who: '戊戌变法', sub: '1898 年', key: 'wx', extra: '辛亥革命也在这一层（第 9 课）' },
      { x: 266, y: 56, level: '思想文化', who: '新文化运动', sub: '第 10 课再学', key: null }
    ];
    STEPS.forEach(function (s) {
      var on = s.key === plan, h = 190 - s.y;
      S('rect', { x: s.x, y: s.y, width: 112, height: h, rx: 8, fill: on ? '#ecd9cc' : (s.key ? '#f3ece6' : '#f4f2f0'), stroke: on ? '#a4492b' : '#d8c8bd', 'stroke-width': on ? 2 : 1.2, 'stroke-dasharray': s.key ? null : '4 3' }, g);
      S('text', { x: s.x + 56, y: s.y - 9, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: on ? '#a4492b' : (s.key ? '#4a3a32' : '#a0908a'), text: s.who }, g);
      S('text', { x: s.x + 56, y: s.y + 20, 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: s.key ? '#5a4036' : '#a0908a', text: s.level }, g);
      S('text', { x: s.x + 56, y: s.y + 36, 'text-anchor': 'middle', 'font-size': 10.5, fill: '#8a7a70', text: s.sub }, g);
      if (s.extra) {
        S('text', { x: s.x + 56, y: s.y + 62, 'text-anchor': 'middle', 'font-size': 9.5, fill: '#a0908a', text: '辛亥革命也属于' }, g);
        S('text', { x: s.x + 56, y: s.y + 75, 'text-anchor': 'middle', 'font-size': 9.5, fill: '#a0908a', text: '这一层（第 9 课）' }, g);
      }
    });
    S('text', { x: 300, y: 22, 'text-anchor': 'end', 'font-size': 10.5, fill: '#8a7a70', text: '看到第 ' + (stage + 1) + ' 步' }, g);
    STAGES.forEach(function (n, k) {
      S('circle', { cx: 314 + k * 20, cy: 18, r: 5, fill: k <= stage ? '#a4492b' : '#fff', stroke: '#a4492b', 'stroke-width': 1.4 }, g);
    });
    L.arrow(g, 110, 126, 140, 102, { color: '#c9a28c', width: 1.6, head: 7 });
    L.arrow(g, 232, 84, 262, 60, { color: '#d8c8bd', width: 1.6, head: 7, dash: '4 3' });
    S('line', { x1: 12, y1: 190, x2: 388, y2: 190, stroke: '#cdb7a8', 'stroke-width': 1.4 }, g);
    S('text', { x: 200, y: 204, 'text-anchor': 'middle', 'font-size': 10, fill: '#a0908a', text: '近代中国向西方学习，认识一步步深入' }, g);
  }
  var stepsEl = L.$('#plan-steps');
  function renderPlan() {
    var p = PLANS[plan];
    drawStair();
    stepsEl.innerHTML = '';
    STAGES.forEach(function (n, k) {
      if (k) L.html('i', { text: '→' }, stepsEl);
      var sp = L.html('span', { text: n, role: 'button', tabindex: '0', class: k === stage ? 'on' : (k < stage ? 'done' : null) }, stepsEl);
      sp.addEventListener('click', function () { stage = k; renderPlan(); });
      sp.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); stage = k; renderPlan(); } });
    });
    L.$('#plan-name').textContent = p.name;
    L.$('#plan-badge').textContent = p.badge;
    L.$('#plan-learn').textContent = p.learn;
    L.$('#plan-who').textContent = p.who;
    L.$('#plan-aim').textContent = p.aim;
    L.$('#plan-end').textContent = stage === 3 ? p.end : '按到“结果”再看';
    L.$('#plan-text').innerHTML = '<b>' + STAGES[stage] + '：</b>' + p.text[stage];
    L.$('#plan-next').textContent = stage === 3 ? (plan === 'yw' ? '接着看戊戌变法' : '回到洋务运动') : '下一步：' + STAGES[stage + 1];
    save();
  }
  var planChips = L.chips(L.$('#plan-chips'), [{ label: '洋务运动', value: 'yw' }, { label: '戊戌变法', value: 'wx' }], plan, function (v) { plan = v; stage = 0; renderPlan(); });
  L.$('#plan-next').addEventListener('click', function () {
    if (stage < 3) stage++;
    else { plan = plan === 'yw' ? 'wx' : 'yw'; stage = 0; planChips.set(plan); }
    renderPlan();
  });
  L.$('#plan-reset').addEventListener('click', function () { stage = 0; renderPlan(); });

  function save() { L.setState({ y: year, t: trId, a: asp, p: plan, g: stage }); }

  render();
  drawDeep();
  renderTreaty();
  renderPlan();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '把年份调到中国近代史开端的那一年',
      desc: '在时间轴下面拖动滑块，或者直接点时间轴上的事件。',
      label: '在时间轴里操作',
      button: '检查年份',
      check: function () {
        if (year === 1840) return { ok: true, msg: '1840 年鸦片战争爆发，这是中国近代史的开端。它属于 19 世纪，距今 ' + L.span(1840, NOW) + ' 年。' };
        if (year === 1842) return { ok: false, msg: '1842 年是《南京条约》签订。近代史的开端看的是<b>战争爆发</b>那一年，再往前一点。' };
        return { ok: false, msg: '现在是 ' + L.yr(year) + '。中国近代史从鸦片战争开始，往滑块最左边找。' };
      }
    },
    {
      level: 'base',
      title: '《南京条约》规定割让给英国的是',
      desc: '可以在“不平等条约对比器”里选《南京条约》，看“割地”一项。',
      options: ['香港岛', '九龙司地方一区', '辽东半岛', '澎湖列岛'],
      answer: 0,
      hint: '这个条约是鸦片战争后签订的第一个不平等条约。',
      explain: '《南京条约》规定<b>割让香港岛给英国</b>（1997 年中国政府恢复对香港行使主权）。九龙司地方一区是 1860 年《北京条约》割让给英国的；辽东半岛、澎湖列岛出现在 1895 年的《马关条约》里。'
    },
    {
      level: 'base',
      title: '戊戌变法中，维新派的代表人物是',
      desc: '先想清楚：哪些人是洋务派，哪些人是维新派。',
      options: ['康有为、梁启超', '曾国藩、李鸿章', '左宗棠、张之洞', '林则徐、魏源'],
      answer: 0,
      hint: '“公车上书”是谁发起的？',
      explain: '戊戌变法的代表是维新派<b>康有为、梁启超</b>，得到光绪帝支持。曾国藩、李鸿章、左宗棠、张之洞是洋务派；林则徐、魏源是鸦片战争前后“睁眼看世界”的人物。'
    },
    {
      level: 'mid',
      title: '找出“允许日本在通商口岸开设工厂”的条约',
      desc: '在“不平等条约对比器”里，把“看哪一项”切到<b>其他</b>，对着表格找，再把它选中。',
      label: '在条约对比器里操作',
      button: '检查我选的条约',
      check: function () {
        if (trId === 'mg') return { ok: true, msg: '是 1895 年的《马关条约》。允许外国在中国开设工厂，外国资本可以直接在中国办厂，对中国民族工业的打击很大。' };
        if (asp !== 'other') return { ok: false, msg: '先把“看哪一项”切到“其他”，四个条约的特殊条款就排在一张表里了。' };
        return { ok: false, msg: '你选的是' + trOf(trId).name + '。在表格里找写着“开设工厂”的那一行，点它。' };
      }
    },
    {
      level: 'mid',
      title: '看完戊戌变法的结果',
      desc: '在“救亡图存”那块切换到<b>戊戌变法</b>，按“下一步”一直看到“结果”。',
      label: '在救亡图存对比里操作',
      button: '检查',
      check: function () {
        if (plan !== 'wx') return { ok: false, msg: '先切换到“戊戌变法”。' };
        if (stage !== 3) return { ok: false, msg: '现在看到“' + STAGES[stage] + '”，继续按“下一步”，看到“结果”为止。' };
        return { ok: true, msg: '1898 年 9 月慈禧太后发动政变，变法历时 103 天失败，除京师大学堂外新政都被废除。这说明在清朝统治下走改良道路行不通。' };
      }
    },
    {
      level: 'mid',
      title: '标志着中国完全沦为半殖民地半封建社会的是',
      desc: '对比器里的进度条，哪一个条约走到了头？',
      options: ['《辛丑条约》的签订', '《南京条约》的签订', '《北京条约》的签订', '《马关条约》的签订'],
      answer: 0,
      hint: '“完全沦为”是最后一步，看 20 世纪开头那个条约。',
      explain: '1901 年<b>《辛丑条约》</b>签订，清政府完全成为“洋人的朝廷”，中国完全沦为半殖民地半封建社会。《南京条约》是“开始沦为”，《北京条约》是“进一步加深”，《马关条约》是“大大加深”。'
    },
    {
      level: 'trap',
      title: '关于洋务运动和戊戌变法，下列说法正确的是',
      desc: '两次探索都学习西方，但学的东西不一样。',
      options: ['洋务运动主要学习西方技术，戊戌变法要学习西方政治制度', '洋务运动要实行君主立宪', '戊戌变法的口号是“自强”“求富”', '两次探索都推翻了清朝统治'],
      answer: 0,
      hint: '一个办工厂、造枪炮，一个要改政府、立宪法。',
      explain: '洋务运动学习西方的<b>技术</b>，目的是维护清朝统治，口号是“自强”“求富”；戊戌变法要学习西方的<b>政治制度</b>，实行君主立宪。两者都没有推翻清朝——推翻清朝的是辛亥革命。'
    },
    {
      level: 'trap',
      title: '下列条约与内容的搭配，正确的是',
      desc: '在对比器里切换不同的“看哪一项”，四个条约放在一起比最清楚。',
      options: ['《北京条约》——割让九龙司地方一区给英国', '《南京条约》——增开天津为商埠', '《马关条约》——划定北京东交民巷为使馆界', '《辛丑条约》——开放沙市、重庆、苏州、杭州为商埠'],
      answer: 0,
      hint: '天津、东交民巷都和北京附近有关，但它们分别在两个不同的条约里。',
      explain: '<b>《北京条约》割让九龙司地方一区给英国</b>，同时增开天津为商埠。《南京条约》开放的是广州、厦门、福州、宁波、上海五口；东交民巷使馆界是《辛丑条约》的内容；开放沙市、重庆、苏州、杭州是《马关条约》的内容。'
    }
  ]);
})();
