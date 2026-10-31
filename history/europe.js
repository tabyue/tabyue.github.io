/* 历史互动馆 · 第 17 课 古代欧洲文明 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();
  var NOW = 2026;

  /* ========== 罗马时间轴 ========== */
  var ERAS = [
    { id: 'king', from: -600, to: -510, name: '王政时代', color: '#efe7df', who: '国王统治' },
    { id: 'rep', from: -509, to: -28, name: '罗马共和国', color: '#e3cfc2', who: '执政官和元老院（贵族掌权）' },
    { id: 'emp', from: -27, to: 394, name: '罗马帝国', color: '#ead8c6', who: '元首（皇帝）独揽大权' },
    { id: 'split', from: 395, to: 475, name: '东西分治', color: '#efe7df', who: '东、西两个罗马帝国' },
    { id: 'east', from: 476, to: 500, name: '东罗马', color: '#e6d3c0', who: '西罗马已灭亡，东罗马帝国继续存在' }
  ];
  var EVENTS = [
    { id: 'rep', y: -509, label: '共和国建立', note: '罗马人赶走国王，建立罗马共和国，不再设国王。' },
    { id: 'law', y: -450, label: '十二铜表法', approx: true, note: '约公元前 450 年，罗马颁布《十二铜表法》，这是罗马第一部成文法。' },
    { id: 'soc', y: -399, label: '苏格拉底去世', note: '古希腊雅典的哲学家苏格拉底被判处死刑。他的学生柏拉图记录了他的许多思想。' },
    { id: 'alex', y: -334, label: '亚历山大东征', note: '马其顿国王亚历山大开始东征，促进了东西方文化的交流，也给东方人民带来了灾难。' },
    { id: 'sparta', y: -73, label: '斯巴达克起义', note: '罗马爆发斯巴达克领导的奴隶起义，沉重打击了罗马的统治。' },
    { id: 'caesar', y: -44, label: '恺撒遇刺', note: '恺撒独揽大权，引起元老院贵族不满，被刺杀。' },
    { id: 'aug', y: -27, label: '罗马帝国建立', note: '屋大维被元老院授予“奥古斯都”称号，建立元首制，罗马进入帝国时代。' },
    { id: 'split', y: 395, label: '帝国分裂', note: '罗马帝国分裂为东、西两部分。' },
    { id: 'west', y: 476, label: '西罗马灭亡', note: '西罗马帝国灭亡。欧洲历史从此进入中古时期（下一课）。东罗马帝国一直存在到 1453 年。' }
  ];
  var year = Math.round(L.num(st.y, -509, -600, 500));
  if (year === 0) year = 1;
  var tl = L.$('#tl'), yIn = L.$('#year-in');

  function eraOf(y) { for (var i = 0; i < ERAS.length; i++) if (y >= ERAS[i].from && y <= ERAS[i].to) return ERAS[i]; return ERAS[0]; }
  function nearest(y) {
    var best = null;
    EVENTS.forEach(function (e) { if (Math.abs(e.y - y) <= 8 && (!best || Math.abs(e.y - y) < Math.abs(best.y - y))) best = e; });
    return best;
  }
  function drawTL() {
    var ev = nearest(year);
    var ax = L.timeline(tl, {
      from: -600, to: 500, step: 200,
      era: ERAS.map(function (d) { return { from: d.from, to: d.to + 1, label: d.name, color: d.color }; }),
      events: EVENTS.map(function (e) { var on = ev && ev.id === e.id; return { id: e.id, y: e.y, label: e.label, on: on, color: on ? '#a4492b' : '#7d4d3c' }; }),
      pick: function (id) { var e = EVENTS.filter(function (x) { return x.id === id; })[0]; setYear(e.y); }
    });
    var x = ax.X(year);
    S('line', { x1: x, y1: 8, x2: x, y2: ax.base + 50, stroke: '#c2603f', 'stroke-width': 1.6, 'stroke-dasharray': '4 3' }, tl);
    S('path', { d: 'M' + (x - 6) + ' 4h12l-6 8z', fill: '#c2603f' }, tl);
  }
  function setYear(y) {
    year = y === 0 ? 1 : y;
    yIn.value = year; L.paintRange(yIn);
    render();
  }
  function render() {
    drawTL();
    var e = eraOf(year), ev = nearest(year);
    L.$('#year-out').textContent = L.yr(year);
    L.$('#era-badge').textContent = e.name;
    L.$('#r-cent').textContent = L.century(year);
    L.$('#r-ago').innerHTML = L.span(year, NOW) + '<small>年前</small>';
    L.$('#r-event').textContent = ev ? (ev.y === year ? (ev.approx ? '约 ' + L.yr(ev.y) + '：' : '') : '约 ' + L.yr(ev.y) + '：') + ev.label : '这几年没有课本里的大事';
    var t = '这时罗马由<b>' + e.who + '</b>。';
    if (ev) t = ev.note + ' ' + t;
    L.$('#r-text').innerHTML = t;
    var row = e.id === 'east' ? 'split' : e.id;
    L.$$('#rome-table tr').forEach(function (tr) { tr.classList.toggle('on', tr.dataset.e === row); });
    save();
  }
  L.bindRange(yIn, function (v) { year = v === 0 ? (year < 0 ? 1 : -1) : v; if (v === 0) { yIn.value = year; L.paintRange(yIn); } render(); });
  yIn.value = year; L.paintRange(yIn);

  /* ========== 雅典：谁能走进公民大会 ========== */
  var GATES = [
    { q: '自由人？', long: '是自由人，不是奴隶' },
    { q: '公民家庭？', long: '出身雅典公民家庭' },
    { q: '男性？', long: '是男性' },
    { q: '成年？', long: '已经成年' }
  ];
  var PEOPLE = [
    { id: 'cit', name: '成年男性公民', pass: [1, 1, 1, 1], text: '他可以参加公民大会，对战争与和平、法律等国家大事发言和投票，还可以通过<b>抽签</b>担任官职、当陪审员。' },
    { id: 'wom', name: '公民家庭的妇女', pass: [1, 1, 0, 1], text: '她是自由人，也出身公民家庭，但雅典妇女<b>没有政治权利</b>，不能参加公民大会，主要在家操持家务。' },
    { id: 'met', name: '外邦人', pass: [1, 0, 1, 1], text: '外邦人是在雅典居住、经商或做工的外来自由人。他们要纳税、服兵役，却<b>不是公民</b>，不能参加公民大会。' },
    { id: 'sla', name: '奴隶', pass: [0, 0, 0, 0], text: '奴隶被看作主人的财产，在矿山、作坊、家里干活，<b>没有任何政治权利</b>，第一关就进不去。' },
    { id: 'boy', name: '公民家的男孩', pass: [1, 1, 1, 0], text: '他出身公民家庭，又是男性，但<b>还没成年</b>，要等长大成为公民后才能参加公民大会。' }
  ];
  function personOf(id) { return PEOPLE.filter(function (p) { return p.id === id; })[0] || PEOPLE[0]; }
  function failAt(p) { for (var i = 0; i < 4; i++) if (!p.pass[i]) return i; return -1; }
  // walk：走过的站数。站 0 = 起点，站 k（1～4）= 第 k 关门前，站 5 = 进入公民大会
  var who = personOf(st.p).id, walk = 99, athAnim = null;
  var ath = L.$('#ath');
  var GX = [118, 176, 234, 292], PATH_Y = 132, HX = 354;
  var STN = [46, GX[0] - 25, GX[1] - 25, GX[2] - 25, GX[3] - 25, HX];
  function targetOf(p) { var f = failAt(p); return f < 0 ? 5 : f + 1; }
  function posX(w) {
    var k = Math.floor(w), fr = w - k;
    if (k >= 5) return HX;
    return STN[k] + (STN[k + 1] - STN[k]) * fr;
  }
  function drawAth() {
    var p = personOf(who), f = failAt(p), tg = targetOf(p);
    var w = Math.min(walk, tg), done = walk >= tg, inside = done && f < 0;
    ath.innerHTML = '';
    var d = S('defs', {}, ath), cp = S('clipPath', { id: 'ath-clip' }, d);
    S('rect', { x: 0, y: 0, width: 400, height: 230, rx: 14 }, cp);
    var g = S('g', { 'clip-path': 'url(#ath-clip)' }, ath);
    S('rect', { x: 0, y: 0, width: 400, height: 230, fill: '#fbf8f5' }, g);
    // 道路
    S('line', { x1: 34, y1: PATH_Y + 6, x2: 330, y2: PATH_Y + 6, stroke: '#e6d6c4', 'stroke-width': 10, 'stroke-linecap': 'round' }, g);
    S('text', { x: 46, y: PATH_Y + 32, 'text-anchor': 'middle', 'font-size': 10.5, fill: '#8a7a70', text: '雅典居民' }, g);
    // 公民大会（神庙式建筑示意）
    S('path', { d: 'M' + (HX - 34) + ' 92L' + HX + ' 72L' + (HX + 34) + ' 92z', fill: '#e9d9c8', stroke: '#9a7a62', 'stroke-width': 1.3 }, g);
    S('rect', { x: HX - 32, y: 92, width: 64, height: 6, fill: '#e9d9c8', stroke: '#9a7a62', 'stroke-width': 1 }, g);
    [-24, -12, 0, 12, 24].forEach(function (dx) { S('rect', { x: HX + dx - 2.5, y: 98, width: 5, height: 40, fill: inside ? '#e3efe3' : '#f3e8dc', stroke: '#9a7a62', 'stroke-width': 0.8 }, g); });
    S('rect', { x: HX - 36, y: 138, width: 72, height: 6, fill: '#e9d9c8', stroke: '#9a7a62', 'stroke-width': 1 }, g);
    S('text', { x: HX, y: 164, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: '#5a4036', text: '公民大会' }, g);
    S('text', { x: HX, y: 179, 'text-anchor': 'middle', 'font-size': 10, fill: '#8a7a70', text: '最高权力机构' }, g);
    // 四道关卡：走到门前才判定
    GATES.forEach(function (gt, i) {
      var x = GX[i], judged = w >= i + 1 - 1e-6, ok = p.pass[i] === 1;
      var col = !judged ? '#c8b8ac' : (ok ? '#4f8a5f' : '#c0533a');
      S('text', { x: x, y: 54, 'text-anchor': 'middle', 'font-size': 10, fill: '#a0908a', text: '第 ' + (i + 1) + ' 关' }, g);
      S('text', { x: x, y: 70, 'text-anchor': 'middle', 'font-size': 11.5, 'font-weight': 700, fill: '#5a4036', text: gt.q }, g);
      S('rect', { x: x - 3, y: PATH_Y - 36, width: 6, height: 50, rx: 2, fill: col }, g);
      if (judged && !ok) S('rect', { x: x - 13, y: PATH_Y - 16, width: 26, height: 6, rx: 2, fill: '#c0533a' }, g);
      if (judged) S('text', { x: x, y: PATH_Y + 32, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: col, text: ok ? '✓' : '✕' }, g);
    });
    // 行人
    var px = posX(w);
    var pc = inside ? '#4f8a5f' : (done ? '#c0533a' : '#7d4d3c');
    S('circle', { cx: px, cy: PATH_Y - 20, r: 6, fill: pc }, g);
    S('path', { d: 'M' + (px - 7) + ' ' + (PATH_Y + 6) + 'q7 -26 14 0z', fill: pc }, g);
    S('text', { x: Math.max(44, Math.min(356, px)), y: inside ? 62 : 88, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: pc, text: p.name, stroke: '#fbf8f5', 'stroke-width': 3, 'paint-order': 'stroke' }, g);
    S('text', { x: 200, y: 214, 'text-anchor': 'middle', 'font-size': 10, fill: '#a0908a', text: '示意图：只表示参加公民大会的条件，不表示人数比例和实际地点' }, g);

    L.$('#ath-name').textContent = p.name;
    L.$('#ath-badge').textContent = !done ? '正在过关…' : (f < 0 ? '能参加' : '不能参加');
    L.$('#ath-gate').textContent = !done ? '…' : (f < 0 ? '四关全过' : '第 ' + (f + 1) + ' 关：' + GATES[f].q.replace('？', ''));
    L.$('#ath-cond').innerHTML = GATES.map(function (gt, i) {
      var ok = p.pass[i] === 1;
      return '<li class="' + (ok ? 'yes' : 'no') + '"><i>' + (ok ? '✓' : '✕') + '</i><span>' + gt.long + '</span></li>';
    }).join('');
    L.$('#ath-text').innerHTML = done ? p.text : '正在一关一关地检查……';
    save();
  }
  function startWalk() {
    if (athAnim) { athAnim.stop(); athAnim = null; }
    var tg = targetOf(personOf(who));
    if (L.REDUCED) { walk = tg; drawAth(); return; }
    walk = 0;
    athAnim = L.loop(function (dt) {
      walk = L.clamp(walk + dt * 2.2, 0, tg);
      if (walk >= tg) { athAnim = null; drawAth(); return false; }
      drawAth();
    });
  }
  L.chips(L.$('#ath-chips'), PEOPLE.map(function (p) { return { label: p.name, value: p.id }; }), who, function (v) { who = v; startWalk(); });

  /* ========== 文化成就配对 ========== */
  var MATCH = [
    ['荷马史诗《伊利亚特》《奥德赛》', 'gr', '古希腊的长篇史诗，相传由盲诗人荷马整理，讲述特洛伊战争和英雄奥德修斯回乡的故事。'],
    ['苏格拉底', 'gr', '古希腊雅典的哲学家，喜欢在街头和人对话辩论，引导人思考什么是美德。他是柏拉图的老师。'],
    ['亚里士多德', 'gr', '古希腊学者，柏拉图的学生，研究过哲学、逻辑、政治、生物等许多领域。'],
    ['帕特农神庙', 'gr', '雅典卫城上供奉雅典娜女神的神庙，是古希腊建筑的代表。'],
    ['《十二铜表法》', 'ro', '约公元前 450 年罗马颁布的第一部成文法，把法律公开写出来，贵族不能再随意解释法律。'],
    ['罗马法', 'ro', '罗马在长期统治中逐步完善的法律体系，对后来欧洲许多国家的法律影响很大。'],
    ['古罗马斗兽场', 'ro', '罗马城里巨大的圆形竞技场，能容纳数万名观众，是古罗马建筑的代表。']
  ];
  var CIV = { gr: '古希腊', ro: '古罗马' };
  function buildMatch() {
    L.match('#match-list', '#match-score', MATCH, [['gr', '古希腊'], ['ro', '古罗马']], function (it, ok) {
      return (ok ? '' : '应该是<b>' + CIV[it[1]] + '</b>。') + it[2];
    });
  }
  function matchDone() { return L.$$('#match-list .choice-row[data-done]').length; }

  /* ========== 大事排序 ========== */
  var ORDER = [
    { label: '罗马共和国建立', y: -509 },
    { label: '罗马颁布《十二铜表法》', y: -450, show: '约公元前 450 年' },
    { label: '亚历山大开始东征', y: -334 },
    { label: '屋大维建立罗马帝国', y: -27 },
    { label: '罗马帝国分裂为东、西两部分', y: 395 },
    { label: '西罗马帝国灭亡', y: 476 }
  ];
  var orderOk = false, orderBox = L.$('#order-box');
  function buildOrder() {
    delete orderBox.dataset.done;
    orderOk = false;
    L.$('#order-msg').textContent = '从最早的那件开始点。';
    L.order(orderBox, ORDER, function (ok) {
      orderOk = ok;
      L.$('#order-msg').innerHTML = ok
        ? '全对！先有<b>共和国</b>（前 509），再有<b>帝国</b>（前 27）；帝国 395 年分裂，476 年西罗马灭亡。公元前的年份，数字越大越早。'
        : '橙色的几件位置不对。看看右边亮出来的年份，按“打乱重来”再排一次。提醒：公元前的数字越大越早。';
    });
  }
  L.$('#order-reset').addEventListener('click', buildOrder);

  function save() { L.setState({ y: year, p: who }); }

  render();
  drawAth();
  buildMatch();
  buildOrder();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '把年份调到罗马帝国建立的那一年',
      desc: '在罗马时间轴下面拖动滑块，或者直接点时间轴上的事件。',
      label: '在时间轴里操作',
      button: '检查年份',
      check: function () {
        if (year === -27) return { ok: true, msg: '公元前 27 年，屋大维被授予“奥古斯都”称号，建立元首制，罗马进入帝国时代。它属于公元前 1 世纪，距今 ' + L.span(-27, NOW) + ' 年。' };
        if (year === -509) return { ok: false, msg: '公元前 509 年建立的是<b>共和国</b>，帝国要晚得多。' };
        if (year > 0) return { ok: false, msg: '罗马帝国建立在<b>公元前</b>，要往滑块左边拖。' };
        return { ok: false, msg: '现在是' + L.yr(year) + '。帝国是屋大维建立的，就在恺撒遇刺（公元前 44 年）之后不久。' };
      }
    },
    {
      level: 'base',
      title: '伯利克里时代，雅典民主政治的最高权力机构是',
      desc: '想想“谁能走进去”的那座建筑。',
      options: ['公民大会', '元老院', '执政官', '国王'],
      answer: 0,
      hint: '雅典的大事由公民集会投票决定。',
      explain: '雅典的<b>公民大会</b>是最高权力机构，决定战争与和平等国家大事。元老院和执政官是<b>罗马共和国</b>的机构和官职；雅典民主时期没有国王掌权。'
    },
    {
      level: 'base',
      title: '罗马第一部成文法是',
      desc: '“成文法”就是把法律写下来、公开公布。',
      options: ['《十二铜表法》', '《汉谟拉比法典》', '《查士丁尼法典》', '荷马史诗'],
      answer: 0,
      hint: '约公元前 450 年颁布，刻在铜板上。',
      explain: '<b>《十二铜表法》</b>约公元前 450 年颁布，是罗马第一部成文法。《汉谟拉比法典》属于古巴比伦；《查士丁尼法典》是 6 世纪东罗马（拜占庭）编的，晚了一千年；荷马史诗是希腊文学作品，不是法律。'
    },
    {
      level: 'mid',
      title: '找出这个人：自由的成年男子，却进不了公民大会',
      desc: '在“雅典：谁能走进公民大会”里选一个身份，让他走完关卡。他是自由人、男性、已成年，却被拦在门外。',
      label: '在雅典模拟器里操作',
      button: '检查我选的人',
      check: function () {
        var p = personOf(who), done = walk >= targetOf(p);
        if (!done) return { ok: false, msg: '等他走完所有关卡再检查。' };
        if (who === 'met') return { ok: true, msg: '外邦人是自由人，也是成年男子，还要纳税、服兵役，但他<b>不是雅典公民</b>，卡在第 2 关。雅典民主只属于公民。' };
        if (who === 'cit') return { ok: false, msg: '成年男性公民四关全过，能参加公民大会。题目要找的是进不去的人。' };
        if (who === 'wom') return { ok: false, msg: '她是女性，题目说的是“成年男子”。' };
        if (who === 'boy') return { ok: false, msg: '他还没成年，不符合题目条件。' };
        return { ok: false, msg: '奴隶不是自由人，第一关就进不去。再换一个身份。' };
      }
    },
    {
      level: 'mid',
      title: '把六件大事按先后排对',
      desc: '在“给大事排排队”里从早到晚依次点击。排错了按“打乱重来”。',
      label: '在排序题里操作',
      button: '检查排序',
      check: function () {
        if (orderOk) return { ok: true, msg: '罗马共和国建立 → 《十二铜表法》 → 亚历山大东征 → 罗马帝国建立 → 帝国分裂 → 西罗马灭亡。' };
        if (orderBox.dataset.done) return { ok: false, msg: '还有几件顺序不对。按“打乱重来”，记住：公元前的年份数字越大越早。' };
        return { ok: false, msg: '先把六件事全部点完。' };
      }
    },
    {
      level: 'mid',
      title: '关于屋大维建立的罗马帝国，下列说法正确的是',
      desc: '可以对照右上角“罗马由谁说了算”那张表。',
      options: ['他保留元老院等共和机构的外壳，实际上独揽大权', '他自称国王，宣布废除元老院', '罗马帝国建立于公元前 509 年', '罗马帝国建立后由两名执政官共同掌权'],
      answer: 0,
      hint: '“元首制”的特点是“名义”和“实际”不一样。',
      explain: '屋大维建立<b>元首制</b>：名义上保留元老院等共和机构，实际上一人说了算。他没有称王，也没有废除元老院；公元前 509 年建立的是共和国；两名执政官掌权是共和国的特点。'
    },
    {
      level: 'trap',
      title: '关于伯利克里时代的雅典民主，下列说法正确的是',
      desc: '这是本课最容易答偏的地方。',
      options: ['只有成年男性公民能参加公民大会，有资格的人在居民中只是少数', '凡是住在雅典的成年人都能参加公民大会', '外邦人纳税、服兵役，所以也能投票', '奴隶只要成年就能参加公民大会'],
      answer: 0,
      hint: '回到雅典模拟器，把五个身份都试一遍。',
      explain: '雅典民主只属于<b>成年男性公民</b>。妇女没有政治权利；外邦人虽然纳税、服兵役，但不是公民；奴隶被当作财产，更没有权利。所以雅典民主是<b>少数人的民主</b>。'
    },
    {
      level: 'trap',
      title: '西罗马帝国灭亡是在哪一年？',
      desc: '别和帝国分裂的年份弄混。',
      options: ['476 年', '395 年', '公元前 27 年', '1453 年'],
      answer: 0,
      hint: '先分裂，后灭亡；分裂在 4 世纪末。',
      explain: '<b>476 年</b>西罗马帝国灭亡。395 年是罗马帝国<b>分裂</b>为东西两部分；公元前 27 年是罗马帝国建立；1453 年灭亡的是<b>东罗马（拜占庭）帝国</b>。'
    }
  ]);
})();
