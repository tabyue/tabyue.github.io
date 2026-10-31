/* 历史互动馆 · 第 13 课 新中国的成立与社会主义建设 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();
  var NOW = 2026;

  /* ========== 1949—1976 时间轴 ========== */
  var PER = [
    { from: 1949, to: 1956, name: '过渡时期', color: '#ead8c6' },
    { from: 1957, to: 1976, name: '探索建设道路', color: '#efe4dc' }
  ];
  var EVENTS = [
    { id: 'found', y: 1949, label: '新中国成立', note: '1949 年 10 月 1 日，中华人民共和国中央人民政府成立，在北京天安门广场举行开国大典。' },
    { id: 'korea', y: 1950, label: '抗美援朝', note: '1950 年 10 月，中国人民志愿军赴朝作战，抗美援朝、保家卫国。1953 年 7 月朝鲜停战协定签字，抗美援朝战争取得胜利。' },
    { id: 'land', y: 1952, label: '土改完成', note: '1950 年颁布《中华人民共和国土地改革法》。到 1952 年底，除部分少数民族地区外，全国大陆基本完成土地改革，农民获得了土地。' },
    { id: 'plan', y: 1953, label: '一五开始', note: '1953 年开始实施第一个五年计划，集中主要力量发展重工业；同年提出过渡时期总路线。' },
    { id: 'const', y: 1954, label: '第一部宪法', note: '1954 年 9 月，第一届全国人民代表大会第一次会议通过《中华人民共和国宪法》，这是我国第一部社会主义类型的宪法。' },
    { id: 'trans', y: 1956, label: '三大改造完成', note: '1956 年底，三大改造基本完成，社会主义制度在我国基本建立。' },
    { id: 'eight', y: 1956, label: '中共八大', note: '1956 年 9 月召开中国共产党第八次全国代表大会，提出党和全国人民的主要任务是集中力量发展社会生产力。' },
    { id: 'abomb', y: 1964, label: '第一颗原子弹', note: '1964 年 10 月，我国第一颗原子弹爆炸成功。' },
    { id: 'hbomb', y: 1967, label: '第一颗氢弹', note: '1967 年 6 月，我国第一颗氢弹爆炸成功。' },
    { id: 'sat', y: 1970, label: '东方红一号', note: '1970 年 4 月，我国第一颗人造地球卫星“东方红一号”发射成功。' }
  ];
  var CR = '1966—1976 年的“文化大革命”，使党、国家和人民遭到新中国成立以来最严重的挫折和损失。';
  var year = Math.round(L.num(st.y, 1949, 1949, 1976));
  var tl = L.$('#tl'), yIn = L.$('#year-in');

  function perOf(y) { for (var i = 0; i < PER.length; i++) if (y >= PER[i].from && y <= PER[i].to) return PER[i]; return PER[PER.length - 1]; }
  function sameYear(y) { return EVENTS.filter(function (e) { return e.y === y; }); }
  function nearest(y) {
    var best = null;
    EVENTS.forEach(function (e) { if (Math.abs(e.y - y) <= 2 && (!best || Math.abs(e.y - y) < Math.abs(best.y - y))) best = e; });
    return best;
  }
  function drawTL() {
    var hits = sameYear(year);
    var ax = L.timeline(tl, {
      from: 1948, to: 1977, step: 4,
      era: [{ from: 1949, to: 1956.9, label: '过渡时期', color: '#ead8c6' }, { from: 1956.9, to: 1976.9, label: '探索社会主义建设道路', color: '#efe4dc' }],
      events: EVENTS.map(function (e) { var on = hits.indexOf(e) >= 0; return { id: e.id, y: e.y, label: e.label, on: on, color: on ? '#a4492b' : '#7d4d3c' }; }),
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
    var p = perOf(year), hits = sameYear(year), ev = nearest(year);
    L.$('#year-out').textContent = L.yr(year);
    L.$('#per-badge').textContent = p.name;
    L.$('#r-since').innerHTML = year === 1949 ? '成立当年' : (year - 1949) + '<small>年</small>';
    L.$('#r-ago').innerHTML = L.span(year, NOW) + '<small>年前</small>';
    var t;
    if (hits.length) {
      L.$('#r-event').textContent = hits.map(function (e) { return e.label; }).join('、');
      t = hits.map(function (e) { return e.note; }).join(' ');
    } else if (ev) {
      L.$('#r-event').textContent = '约 ' + L.yr(ev.y) + '：' + ev.label;
      t = ev.note;
    } else {
      L.$('#r-event').textContent = '这几年没有放进时间轴的大事';
      t = '';
    }
    if (year >= 1966) t += (t ? ' ' : '') + CR;
    if (!t) t = year <= 1956 ? '过渡时期：从新中国成立到 1956 年社会主义改造基本完成。' : '社会主义制度建立后，党和人民开始探索适合中国国情的社会主义建设道路。';
    L.$('#r-text').innerHTML = t;
    L.$('#row-yh').classList.toggle('on', year >= 1953 && year <= 1957);
    L.$('#row-sg').classList.toggle('on', year >= 1953 && year <= 1956);
    L.$('#row-rd').classList.toggle('on', year === 1954);
    save();
  }
  L.bindRange(yIn, function (v) { year = v; render(); });
  yIn.value = year; L.paintRange(yIn);

  /* ========== 三大改造配对 ========== */
  var OBJ = [
    { k: 'agr', n: '农业', sub: '个体农民', ans: 'coop', y: 40,
      ok: '<b>农业</b>：引导个体农民走互助合作道路，从互助组到初级农业生产合作社，再到高级农业生产合作社。',
      bad: '农民是一家一户的个体劳动者，国家是引导他们<b>组织起来</b>，不是“赎买”。' },
    { k: 'hand', n: '手工业', sub: '个体手工业者', ans: 'coop', y: 100,
      ok: '<b>手工业</b>：引导个体手工业者走合作化道路，组织手工业合作社。',
      bad: '手工业者和农民一样是个体劳动者，走的也是<b>合作化</b>道路。' },
    { k: 'cap', n: '资本主义工商业', sub: '私营工厂、商店', ans: 'buy', y: 160,
      ok: '<b>资本主义工商业</b>：国家采取和平赎买的政策，通过公私合营逐步改造。1956 年出现了全行业公私合营的高潮。',
      bad: '私营工厂、商店的主人是资本家，国家对他们采取的是<b>和平赎买</b>政策，不是合作化。' }
  ];
  var WAYS = { coop: { n: '合作化道路', sub: '组织起来，建立合作社', y: 70 }, buy: { n: '和平赎买', sub: '公私合营', y: 140 } };
  var sel = {}, lastK = null;
  (st.t || '').split('').forEach(function (c, i) { if (OBJ[i] && (c === 'c' || c === 'b')) sel[OBJ[i].k] = c === 'c' ? 'coop' : 'buy'; });
  var trans = L.$('#trans');
  function tBox(x, y, w, h, title, sub, o) {
    S('rect', { x: x - w / 2, y: y - h / 2, width: w, height: h, rx: 10, fill: o.fill, stroke: o.stroke, 'stroke-width': o.sw || 1.4 }, trans);
    S('text', { x: x, y: y - 2, 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: '#4a3a32', text: title }, trans);
    S('text', { x: x, y: y + 13, 'text-anchor': 'middle', 'font-size': 10, fill: '#8a7a70', text: sub }, trans);
  }
  function rightCount() { return OBJ.filter(function (o) { return sel[o.k] === o.ans; }).length; }
  function drawTrans() {
    trans.innerHTML = '';
    var d = S('defs', {}, trans), cp = S('clipPath', { id: 'trans-clip' }, d);
    S('rect', { x: 0, y: 0, width: 400, height: 230, rx: 14 }, cp);
    var g = S('g', { 'clip-path': 'url(#trans-clip)' }, trans);
    S('rect', { x: 0, y: 0, width: 400, height: 230, fill: '#fbf8f5' }, g);
    S('text', { x: 80, y: 13, 'text-anchor': 'middle', 'font-size': 10, fill: '#a0908a', text: '改造对象' }, g);
    S('text', { x: 310, y: 13, 'text-anchor': 'middle', 'font-size': 10, fill: '#a0908a', text: '改造方式' }, g);
    OBJ.forEach(function (o) {
      var w = sel[o.k];
      if (!w) return;
      var good = w === o.ans;
      S('path', { d: 'M146 ' + o.y + 'C190 ' + o.y + ' 196 ' + WAYS[w].y + ' 239 ' + WAYS[w].y, fill: 'none', stroke: good ? '#2f6a4a' : '#c2603f', 'stroke-width': 2.2, 'stroke-dasharray': good ? null : '5 4' }, trans);
    });
    OBJ.forEach(function (o) {
      var w = sel[o.k], good = w === o.ans;
      tBox(80, o.y, 130, 44, o.n, o.sub, { fill: '#fff', stroke: !w ? '#cdb7a8' : (good ? '#2f6a4a' : '#c2603f'), sw: o.k === lastK ? 2.4 : 1.4 });
    });
    Object.keys(WAYS).forEach(function (k) {
      var used = OBJ.some(function (o) { return sel[o.k] === k; });
      tBox(310, WAYS[k].y, 140, 46, WAYS[k].n, WAYS[k].sub, { fill: used ? '#f4ebe8' : '#fff', stroke: '#7d4d3c', sw: used ? 2 : 1.4 });
    });
    var n = rightCount(), done = Object.keys(sel).length;
    if (n === 3) {
      S('rect', { x: 20, y: 192, width: 360, height: 28, rx: 9, fill: '#e8f1e6', stroke: '#b9d3b0' }, trans);
      S('text', { x: 200, y: 210.5, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: '#2f6a4a', text: '1956 年底基本完成：私有制 → 社会主义公有制' }, trans);
    } else {
      S('text', { x: 200, y: 211, 'text-anchor': 'middle', 'font-size': 11, fill: '#8a7a70', text: done ? '已连 ' + done + ' 条，选对 ' + n + ' 条（虚线是选错的）' : '在下面给三个对象各选一种方式' }, trans);
    }
    L.$('#t-score').innerHTML = n + '<small> / 3</small>';
    var t;
    if (n === 3) t = '三个都对了！到 1956 年底，三大改造基本完成，我国生产资料私有制转变为社会主义公有制，<b>社会主义制度基本建立</b>。';
    else if (lastK) { var o = OBJ.filter(function (x) { return x.k === lastK; })[0]; t = sel[o.k] === o.ans ? o.ok : o.bad; }
    else t = '1953—1956 年，国家对农业、手工业和资本主义工商业进行社会主义改造，简称“三大改造”。三种对象，用了两种不同的方式。';
    L.$('#t-text').innerHTML = t;
    L.$('#t-name').textContent = lastK ? OBJ.filter(function (x) { return x.k === lastK; })[0].n : '三大改造';
    save();
  }
  var WAY_OPTS = [{ label: '合作化道路', value: 'coop' }, { label: '和平赎买（公私合营）', value: 'buy' }];
  var tChips = {};
  OBJ.forEach(function (o) {
    tChips[o.k] = L.chips(L.$('#c-' + o.k), WAY_OPTS, sel[o.k] || '', function (v) { sel[o.k] = v; lastK = o.k; drawTrans(); });
  });
  L.$('#trans-reset').addEventListener('click', function () {
    sel = {}; lastK = null;
    OBJ.forEach(function (o) { tChips[o.k].set(''); });
    drawTrans();
  });

  /* ========== “一五”计划逐年推进 ========== */
  var ACH = [
    { id: 'angang', y: 1953, n: '鞍山钢铁公司三大工程', sub: '建成投产', f: '钢铁', t: '1953 年，鞍山钢铁公司的大型轧钢厂、无缝钢管厂和七号炼铁高炉三大工程建成投产。钢铁是造机器、修铁路、架桥梁的基础材料。' },
    { id: 'road', y: 1954, n: '川藏、青藏公路', sub: '通车', f: '交通', t: '1954 年，川藏公路和青藏公路通车，加强了西藏同内地的联系。' },
    { id: 'faw', y: 1956, n: '长春第一汽车制造厂', sub: '第一辆国产汽车', f: '汽车', t: '1956 年，长春第一汽车制造厂生产出我国第一辆国产汽车（解放牌载重汽车），结束了我国不能制造汽车的历史。' },
    { id: 'sac', y: 1956, n: '沈阳飞机制造厂', sub: '第一架喷气式飞机', f: '航空', t: '1956 年，沈阳飞机制造厂试制成功我国第一架喷气式飞机。' },
    { id: 'bridge', y: 1957, n: '武汉长江大桥', sub: '建成通车', f: '交通', t: '1957 年，武汉长江大桥建成通车。它是长江上的第一座大桥，公路、铁路两用，把大江南北连了起来。' }
  ];
  var ROWY = { 1953: 24, 1954: 66, 1955: 108, 1956: 150, 1957: 192 };
  var planYear = Math.round(L.num(st.p, 1953, 1953, 1957)), planPos = planYear, planAnim = null;
  var pick = ACH.filter(function (a) { return a.id === st.a; })[0] || ACH[0];
  if (pick.y > planYear) pick = ACH[0];
  var plan = L.$('#plan');
  function drawPlan() {
    plan.innerHTML = '';
    var d = S('defs', {}, plan), cp = S('clipPath', { id: 'plan-clip' }, d);
    S('rect', { x: 0, y: 0, width: 400, height: 230, rx: 14 }, cp);
    var g = S('g', { 'clip-path': 'url(#plan-clip)' }, plan);
    S('rect', { x: 0, y: 0, width: 400, height: 230, fill: '#fbf8f5' }, g);
    var ax = 46, y0 = ROWY[1953], y1 = ROWY[1957];
    S('line', { x1: ax, y1: y0, x2: ax, y2: y1, stroke: '#e3d6cc', 'stroke-width': 6, 'stroke-linecap': 'round' }, g);
    var yNow = y0 + (planPos - 1953) / 4 * (y1 - y0);
    S('line', { x1: ax, y1: y0, x2: ax, y2: yNow, stroke: '#a4492b', 'stroke-width': 6, 'stroke-linecap': 'round' }, g);
    [1953, 1954, 1955, 1956, 1957].forEach(function (yy) {
      var lit = yy <= planPos + 1e-6;
      S('circle', { cx: ax, cy: ROWY[yy], r: 6, fill: lit ? '#a4492b' : '#fff', stroke: '#a4492b', 'stroke-width': 2 }, g);
      S('text', { x: ax - 12, y: ROWY[yy] + 4, 'text-anchor': 'end', 'font-size': 11, 'font-weight': yy === planYear ? 700 : 500, fill: lit ? '#7d4d3c' : '#a0908a', text: String(yy) }, g);
    });
    S('text', { x: 72, y: ROWY[1955] + 4, 'font-size': 10.5, fill: '#a0908a', text: '（图中没有列这一年的成果）' }, g);
    ACH.forEach(function (a) {
      var two = ACH.filter(function (b) { return b.y === a.y; }), idx = two.indexOf(a);
      var x0 = 64, w = 326;
      if (two.length === 2) { w = 160; x0 = 64 + idx * 166; }
      var lit = a.y <= planPos + 1e-6, on = a === pick, cy = ROWY[a.y];
      var hit = S('g', { class: 'svg-hit', tabindex: 0, role: 'button', 'aria-label': a.n }, g);
      S('rect', { x: x0, y: cy - 17, width: w, height: 34, rx: 9, fill: lit ? (on ? '#f4ebe8' : '#fff') : '#f3efec', stroke: lit ? '#7d4d3c' : '#ddd2ca', 'stroke-width': on ? 2.2 : 1.2, 'stroke-dasharray': lit ? null : '4 3' }, hit);
      S('text', { x: x0 + 10, y: cy - 2, 'font-size': 12, 'font-weight': 700, fill: lit ? '#4a3a32' : '#b3a69e', text: a.n }, hit);
      S('text', { x: x0 + 10, y: cy + 11.5, 'font-size': 10, fill: lit ? '#8a5a3a' : '#b3a69e', text: lit ? a.sub + ' · ' + a.f : '还没到这一年' }, hit);
      function choose() { stopPlan(); pick = a; if (a.y > planYear) { planYear = a.y; planPos = a.y; } drawPlan(); }
      hit.addEventListener('click', choose);
      hit.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(); } });
    });
    var lit = ACH.filter(function (a) { return a.y <= planYear; }).length;
    L.$('#p-name').textContent = pick.n;
    L.$('#p-badge').textContent = pick.y + ' 年 · ' + pick.f;
    L.$('#p-year').textContent = L.yr(planYear);
    L.$('#p-count').innerHTML = lit + '<small> / 5</small>';
    L.$('#p-text').innerHTML = pick.t + (planYear === 1957 ? '到 1957 年底，“一五”计划<b>超额完成</b>，我国开始改变工业落后的面貌，向社会主义工业化迈进。' : '');
    L.$('#plan-go').textContent = planYear === 1957 ? '从头再推进一遍' : '推进一年';
    save();
  }
  function stopPlan() { if (planAnim) { planAnim.stop(); planAnim = null; planPos = planYear; } }
  L.$('#plan-go').addEventListener('click', function () {
    stopPlan();
    if (planYear === 1957) { planYear = 1953; planPos = 1953; pick = ACH[0]; drawPlan(); return; }
    planYear += 1;
    var news = ACH.filter(function (a) { return a.y === planYear; });
    if (news.length) pick = news[0];
    if (L.REDUCED) { planPos = planYear; drawPlan(); return; }
    planAnim = L.loop(function (dt) {
      planPos = Math.min(planYear, planPos + dt * 2.5);
      drawPlan();
      if (planPos >= planYear) { planAnim = null; return false; }
    });
  });
  L.$('#plan-reset').addEventListener('click', function () { stopPlan(); planYear = 1953; planPos = 1953; pick = ACH[0]; drawPlan(); });

  function save() {
    L.setState({ y: year, t: OBJ.map(function (o) { return sel[o.k] === 'coop' ? 'c' : (sel[o.k] === 'buy' ? 'b' : '-'); }).join(''), p: planYear, a: pick.id });
  }

  render();
  drawTrans();
  drawPlan();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '把年份调到中华人民共和国成立的那一年',
      desc: '在时间轴下面拖动滑块，或者直接点时间轴上的事件。',
      label: '在时间轴里操作',
      button: '检查年份',
      check: function () {
        if (year === 1949) return { ok: true, msg: '1949 年 10 月 1 日举行开国大典，中华人民共和国中央人民政府成立。它属于 20 世纪，距今 ' + L.span(1949, NOW) + ' 年。' };
        return { ok: false, msg: '现在是' + L.yr(year) + '。新中国成立在抗美援朝（1950 年）之前，要往最左边拖。' };
      }
    },
    {
      level: 'base',
      title: '1954 年第一届全国人民代表大会通过的《中华人民共和国宪法》是',
      desc: '注意它和 1949 年《共同纲领》的区别。',
      options: ['我国第一部社会主义类型的宪法', '起临时宪法作用的文件', '我国第一部土地法', '过渡时期总路线'],
      answer: 0,
      hint: '1949 年的哪份文件只是“临时”起宪法作用？',
      explain: '1954 年宪法是我国<b>第一部社会主义类型的宪法</b>。起临时宪法作用的是 1949 年政协会议通过的《共同纲领》；土地改革法是 1950 年颁布的；过渡时期总路线是 1953 年提出的。'
    },
    {
      level: 'base',
      title: '下列成就中，属于“一五”计划期间取得的是',
      desc: '“一五”计划是 1953—1957 年。',
      options: ['长春第一汽车制造厂生产出第一辆国产汽车', '第一颗原子弹爆炸成功', '第一颗人造地球卫星发射成功', '第一颗氢弹爆炸成功'],
      answer: 0,
      hint: '先看年份，哪一项落在 1953—1957 年之间？',
      explain: '一汽在 <b>1956 年</b>生产出第一辆国产汽车，属于“一五”计划成就。原子弹（1964 年）、氢弹（1967 年）、人造卫星（1970 年）都在“一五”计划完成以后。'
    },
    {
      level: 'mid',
      title: '把三大改造的对象和方式全部配对正确',
      desc: '在“三大改造：谁用什么方式改”里，给农业、手工业、资本主义工商业各选一种方式。',
      label: '在三大改造配对图里操作',
      button: '检查配对',
      check: function () {
        var n = rightCount();
        if (n === 3) return { ok: true, msg: '农业、手工业走合作化道路，资本主义工商业采取和平赎买政策、实行公私合营。1956 年底三大改造基本完成，社会主义制度在我国基本建立。' };
        if (Object.keys(sel).length < 3) return { ok: false, msg: '还有对象没选方式，三个都要选。' };
        if (sel.cap !== 'buy') return { ok: false, msg: '资本主义工商业的主人是资本家，国家对他们用的是<b>和平赎买</b>。' };
        return { ok: false, msg: '农民和手工业者都是个体劳动者，走的是<b>合作化</b>道路。' };
      }
    },
    {
      level: 'mid',
      title: '找到 1956 年试制成功我国第一架喷气式飞机的工厂',
      desc: '在“逐年推进‘一五’计划”里推进到 1956 年，点选那一项成就。',
      label: '在“一五”计划图里操作',
      button: '检查我选的成就',
      check: function () {
        if (pick.id === 'sac') return { ok: true, msg: '沈阳飞机制造厂在 1956 年试制成功我国第一架喷气式飞机。同一年，长春第一汽车制造厂生产出第一辆国产汽车，两件事别记混。' };
        if (pick.id === 'faw') return { ok: false, msg: '一汽造的是<b>汽车</b>，再看看同一年的另一项。' };
        if (planYear < 1956) return { ok: false, msg: '现在才推进到' + L.yr(planYear) + '，先推进到 1956 年。' };
        return { ok: false, msg: '你选的是“' + pick.n + '”。造飞机的工厂在 1956 年那一行。' };
      }
    },
    {
      level: 'mid',
      title: '1956 年底三大改造基本完成，标志着',
      desc: '这是这两个单元最重要的结论。',
      options: ['社会主义制度在我国基本建立', '中华人民共和国成立', '第一个五年计划开始实施', '土地改革基本完成'],
      answer: 0,
      hint: '“改造”改的是什么？改完以后私有制变成了什么？',
      explain: '三大改造基本完成，生产资料私有制转变为社会主义公有制，<b>社会主义制度在我国基本建立</b>，我国进入社会主义初级阶段。新中国成立是 1949 年，“一五”计划开始于 1953 年，土地改革 1952 年底基本完成。'
    },
    {
      level: 'trap',
      title: '国家对资本主义工商业进行社会主义改造，采取的方式是',
      desc: '三大改造里最容易配错的一项。',
      options: ['和平赎买，实行公私合营', '走合作化道路，建立合作社', '组织互助组、初级社、高级社', '实行土地改革，平分土地'],
      answer: 0,
      hint: '合作化是给个体劳动者的，资本家的工厂、商店用的是另一种办法。',
      explain: '对资本主义工商业采取<b>和平赎买</b>政策，通过公私合营逐步改造。合作化道路是农业和手工业的改造方式；互助组、初级社、高级社是农业合作化的步骤；土地改革是 1950—1952 年的事，和三大改造不是一回事。'
    },
    {
      level: 'trap',
      title: '新中国成立初期，起临时宪法作用的是',
      desc: '不要和 1954 年的宪法混在一起。',
      options: ['《中国人民政治协商会议共同纲领》', '1954 年《中华人民共和国宪法》', '《中华人民共和国土地改革法》', '《中华民国临时约法》'],
      answer: 0,
      hint: '1949 年 9 月政协第一届全体会议通过了什么？',
      explain: '1949 年 9 月，政协第一届全体会议通过《共同纲领》，<b>起临时宪法的作用</b>。1954 年宪法是第一部社会主义类型的宪法，是正式宪法；土地改革法是关于土地制度的法律；《中华民国临时约法》是辛亥革命后 1912 年颁布的。'
    }
  ]);
})();
