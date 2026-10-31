/* 历史互动馆 · 第 15 课 中国特色社会主义进入新时代（只做时间轴与成就配对） */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();
  var NOW = 2026;

  var FIELDS = {
    space: '载人航天', moon: '月球探测', nav: '卫星导航', traffic: '交通工程', sport: '体育盛会'
  };

  /* ========== 时间轴 ========== */
  var EVENTS = [
    { id: 'sz5', y: 2003, label: '神舟五号', f: 'space', note: '2003 年 10 月，神舟五号载人飞船发射成功，航天员杨利伟成为第一个进入太空的中国人。我国成为世界上第三个独立掌握载人航天技术的国家。' },
    { id: 'ce1', y: 2007, label: '嫦娥一号', f: 'moon', note: '2007 年 10 月，嫦娥一号探月卫星发射，我国的探月工程迈出第一步。' },
    { id: 'oly', y: 2008, label: '北京奥运会', f: 'sport', note: '2008 年 8 月，第 29 届夏季奥运会在北京举办。' },
    { id: 'sz7', y: 2008, label: '神舟七号', f: 'space', note: '2008 年 9 月，神舟七号飞行，航天员翟志刚完成中国人第一次太空出舱活动。' },
    { id: 'sz9', y: 2012, label: '神舟九号', f: 'space', note: '2012 年 6 月，神舟九号与天宫一号完成载人交会对接。' },
    { id: 'fxh', y: 2017, label: '复兴号', f: 'traffic', note: '2017 年 6 月，我国自主研发的复兴号动车组在京沪高铁正式运营。' },
    { id: 'gzao', y: 2018, label: '港珠澳大桥', f: 'traffic', note: '2018 年 10 月，连接香港、珠海、澳门的港珠澳大桥开通。' },
    { id: 'ce4', y: 2019, label: '嫦娥四号', f: 'moon', note: '2019 年 1 月，嫦娥四号在月球背面软着陆，这是人类探测器第一次在月球背面软着陆。' },
    { id: 'bd3', y: 2020, label: '北斗三号', f: 'nav', note: '2020 年 7 月，北斗三号全球卫星导航系统建成开通。' },
    { id: 'ce5', y: 2020, label: '嫦娥五号', f: 'moon', note: '2020 年 12 月，嫦娥五号带着月球样品返回地球。' },
    { id: 'wao', y: 2022, label: '北京冬奥会', f: 'sport', note: '2022 年 2 月，第 24 届冬季奥运会在北京举办，北京成为世界上第一个“双奥之城”。' },
    { id: 'kjz', y: 2022, label: '空间站建成', f: 'space', note: '2022 年，问天、梦天两个实验舱先后与天和核心舱对接，中国空间站全面建成。' }
  ];
  function evById(id) { return EVENTS.filter(function (e) { return e.id === id; })[0] || null; }
  var year = Math.round(L.num(st.y, 2003, 2003, 2022));
  var sel = evById(st.e) && evById(st.e).y === year ? st.e : null;
  var tl = L.$('#tl'), yIn = L.$('#year-in');

  function eventsOf(y) { return EVENTS.filter(function (e) { return e.y === y; }); }
  function before(y) { var b = null; EVENTS.forEach(function (e) { if (e.y < y) b = e; }); return b; }
  function current() {
    if (sel) return evById(sel);
    var list = eventsOf(year);
    return list.length ? list[0] : null;
  }
  function drawTL() {
    var cur = current();
    var ax = L.timeline(tl, {
      from: 2002, to: 2023, step: 5,
      events: EVENTS.map(function (e) {
        var on = cur && cur.id === e.id;
        return { id: e.id, y: e.y, label: e.label, on: on, color: on ? '#a4492b' : (e.y === year ? '#b0623f' : '#7d4d3c') };
      }),
      pick: function (id) { var e = evById(id); setYear(e.y, id); }
    });
    var x = ax.X(year);
    S('line', { x1: x, y1: 8, x2: x, y2: ax.base + 26, stroke: '#c2603f', 'stroke-width': 1.6, 'stroke-dasharray': '4 3' }, tl);
    S('path', { d: 'M' + (x - 6) + ' 4h12l-6 8z', fill: '#c2603f' }, tl);
  }
  function setYear(y, id) {
    year = y; sel = id || null;
    yIn.value = year; L.paintRange(yIn);
    render();
  }
  function render() {
    drawTL();
    var list = eventsOf(year), cur = current();
    L.$('#year-out').textContent = L.yr(year);
    L.$('#per-badge').textContent = L.century(year);
    L.$('#r-ago').innerHTML = L.span(year, NOW) + '<small>年前</small>';
    L.$('#r-field').textContent = cur ? FIELDS[cur.f] : '—';
    L.$('#r-event').textContent = list.length ? list.map(function (e) { return e.label; }).join('、') : '这一年没有选进时间轴的大事';
    var t;
    if (cur) t = cur.note;
    else { var b = before(year); t = b ? '往前最近的一件是 ' + L.yr(b.y) + '的' + b.label + '。' : ''; }
    if (list.length > 1) t += ' 这一年有 ' + list.length + ' 件大事，点时间轴上的另一个标签可以切换。';
    L.$('#r-text').innerHTML = t;
    L.$$('#field-table tr').forEach(function (tr) { tr.classList.toggle('on', !!cur && tr.dataset.f === cur.f); });
    save();
  }
  L.bindRange(yIn, function (v) { year = v; sel = null; render(); });
  yIn.value = year; L.paintRange(yIn);

  /* ========== 成就配对 ========== */
  var ITEMS = [
    { n: '神舟五号', f: 'space', y: 2003, t: '我国第一艘载人的神舟飞船。航天员杨利伟乘坐它进入太空，在太空飞行约 21 小时后安全返回。' },
    { n: '嫦娥五号', f: 'moon', y: 2020, t: '嫦娥工程是我国的探月工程。嫦娥五号在月球上采集样品，并把月球样品带回了地球。' },
    { n: '北斗三号', f: 'nav', y: 2020, t: '北斗是我国自己建设的卫星导航系统。北斗三号全球卫星导航系统建成开通，能为全球用户提供定位、导航、授时服务。' },
    { n: '复兴号', f: 'traffic', y: 2017, t: '我国自主研发的高速动车组，2017 年在京沪高铁正式运营。它跑在铁轨上，属于交通工程里的高铁。' },
    { n: '港珠澳大桥', f: 'traffic', y: 2018, t: '连接香港、珠海、澳门的跨海大桥，2018 年开通。和复兴号一样，属于交通工程。' },
    { n: '中国空间站', f: 'space', y: 2022, t: '由天和核心舱和问天、梦天两个实验舱组成，2022 年全面建成，航天员可以在里面长期工作和生活。它和神舟飞船一样属于载人航天。' }
  ];
  var FORDER = ['space', 'moon', 'nav', 'traffic', 'sport'];
  var linked = [], pickI = -1, focusI = 0, wrong = null, msg = '';
  String(st.p || '').split('').forEach(function (c) { var i = +c; if (i >= 0 && i < ITEMS.length && linked.indexOf(i) < 0) linked.push(i); });
  var pair = L.$('#pair');
  var LX = 14, LW = 128, RX = 258, RW = 128, BH = 28;
  function ly(i) { return 18 + i * 37; }
  function ry(k) { return 26 + k * 44; }
  function pbox(x, y, w, label, sub, o, onClick, aria) {
    var g = S('g', { class: 'svg-hit', tabindex: 0, role: 'button', 'aria-label': aria || label }, pair);
    S('rect', { x: x, y: y, width: w, height: BH, rx: 9, fill: o.fill, stroke: o.stroke, 'stroke-width': o.sw || 1.5 }, g);
    S('text', { x: x + (sub ? 12 : w / 2), y: y + 18.5, 'text-anchor': sub ? 'start' : 'middle', 'font-size': 12.5, 'font-weight': 700, fill: o.color || '#4a3a32', text: label }, g);
    if (sub) S('text', { x: x + w - 10, y: y + 18, 'text-anchor': 'end', 'font-size': 11, 'font-weight': 600, fill: o.subColor || '#2f6a4a', text: sub }, g);
    g.addEventListener('click', onClick);
    g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } });
    return g;
  }
  function drawPair() {
    pair.innerHTML = '';
    var d = S('defs', {}, pair), cp = S('clipPath', { id: 'pair-clip' }, d);
    S('rect', { x: 0, y: 0, width: 400, height: 250, rx: 14 }, cp);
    var bg = S('g', { 'clip-path': 'url(#pair-clip)' }, pair);
    S('rect', { x: 0, y: 0, width: 400, height: 250, fill: '#fbf8f5' }, bg);
    S('text', { x: LX + LW / 2, y: 12, 'text-anchor': 'middle', 'font-size': 10, fill: '#8a7a70', text: '成就' }, bg);
    S('text', { x: RX + RW / 2, y: 18, 'text-anchor': 'middle', 'font-size': 10, fill: '#8a7a70', text: '领域' }, bg);
    // 连线
    linked.forEach(function (i) {
      var k = FORDER.indexOf(ITEMS[i].f);
      S('line', { x1: LX + LW, y1: ly(i) + BH / 2, x2: RX, y2: ry(k) + BH / 2, stroke: '#5f8f6a', 'stroke-width': 2.2 }, bg);
    });
    if (wrong) {
      var wk = FORDER.indexOf(wrong.f);
      S('line', { x1: LX + LW, y1: ly(wrong.i) + BH / 2, x2: RX, y2: ry(wk) + BH / 2, stroke: '#c2603f', 'stroke-width': 2, 'stroke-dasharray': '5 4' }, bg);
    }
    if (pickI >= 0) S('circle', { cx: LX + LW, cy: ly(pickI) + BH / 2, r: 4.5, fill: '#a4492b' }, bg);
    var all = linked.length === ITEMS.length;
    ITEMS.forEach(function (it, i) {
      var ok = linked.indexOf(i) >= 0, on = i === pickI;
      pbox(LX, ly(i), LW, it.n, ok && all ? String(it.y) : (ok ? '✓' : null),
        { fill: on ? '#a4492b' : (ok ? '#e8f1e6' : '#fff'), stroke: on ? '#a4492b' : (ok ? '#9cc09a' : '#d6c6bb'), color: on ? '#fff' : '#4a3a32' },
        function () {
          focusI = i; wrong = null;
          if (ok) { pickI = -1; msg = ''; }
          else { pickI = pickI === i ? -1 : i; msg = pickI >= 0 ? '已选中“' + it.n + '”，再点右边一个领域。' : ''; }
          drawPair();
        }, it.n + (ok ? '，已连对' : ''));
    });
    FORDER.forEach(function (f, k) {
      var hasLink = linked.some(function (i) { return ITEMS[i].f === f; });
      pbox(RX, ry(k), RW, FIELDS[f], null,
        { fill: hasLink ? '#f1e2d9' : '#fff', stroke: pickI >= 0 ? '#a4492b' : '#d6c6bb', sw: pickI >= 0 ? 1.8 : 1.5 },
        function () {
          if (pickI < 0) { msg = '先点左边的一项成就，再点领域。'; wrong = null; drawPair(); return; }
          var it = ITEMS[pickI];
          focusI = pickI;
          if (it.f === f) { linked.push(pickI); wrong = null; msg = ''; }
          else {
            wrong = { i: pickI, f: f };
            msg = '“' + it.n + '”不属于' + FIELDS[f] + '。' + hintOf(it) ;
          }
          pickI = -1;
          drawPair();
        }, '领域：' + FIELDS[f]);
    });
    if (all) S('text', { x: 200, y: 244, 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': 700, fill: '#2f6a4a', text: '全部连对！年份已经亮出来了' }, pair);
    else S('text', { x: 200, y: 244, 'text-anchor': 'middle', 'font-size': 9.5, fill: '#a0908a', text: '注意：右边有一个领域用不上，有一个领域要连两项' }, pair);

    var it = ITEMS[focusI], done = linked.indexOf(focusI) >= 0;
    L.$('#a-name').textContent = it.n;
    L.$('#a-badge').textContent = done ? it.y + ' 年' : '还没连上';
    L.$('#a-score').innerHTML = linked.length + '<small> / ' + ITEMS.length + '</small>';
    L.$('#a-field').textContent = done ? FIELDS[it.f] : '？';
    L.$('#a-text').innerHTML = msg || (done ? it.t : '点左边的“' + it.n + '”，再点它所属的领域。');
    save();
  }
  function hintOf(it) {
    return {
      space: '想一想：它是送人上太空、让人在太空生活的吗？',
      moon: '提示：“嫦娥”这个名字来自奔月的神话。',
      nav: '提示：手机地图定位用的就是它。',
      traffic: '提示：它是让人在地面上来往更方便的。'
    }[it.f];
  }
  L.$('#pair-reset').addEventListener('click', function () { linked = []; pickI = -1; wrong = null; msg = ''; focusI = 0; drawPair(); });

  /* ========== 排序 ========== */
  var GROUPS = {
    space: {
      name: '载人航天这条线',
      items: [
        { label: '神舟五号：中国人第一次进入太空', y: 2003 },
        { label: '神舟七号：中国人第一次太空出舱', y: 2008 },
        { label: '神舟九号与天宫一号载人交会对接', y: 2012 },
        { label: '天和核心舱发射', y: 2021 },
        { label: '中国空间站全面建成', y: 2022 }
      ],
      ok: '顺序正是“三步走”：先载人飞船（神舟五号），再出舱、对接，最后建空间站（天和核心舱 → 全面建成）。每一步都是下一步的基础。',
      bad: '想一想：不会出舱、不会对接，能建空间站吗？先“上得去、回得来”，再“出得去、接得上”，最后“住得下”。'
    },
    mix: {
      name: '盛会与工程',
      items: [
        { label: '北京举办夏季奥运会', y: 2008 },
        { label: '复兴号在京沪高铁正式运营', y: 2017 },
        { label: '港珠澳大桥开通', y: 2018 },
        { label: '北斗三号全球卫星导航系统建成开通', y: 2020 },
        { label: '北京举办冬季奥运会', y: 2022 }
      ],
      ok: '2008 夏奥 → 2017 复兴号 → 2018 港珠澳大桥 → 2020 北斗三号 → 2022 冬奥。两届奥运会正好一头一尾，相隔 14 年。',
      bad: '先抓住一头一尾：2008 年夏季奥运会最早，2022 年冬季奥运会最晚，中间三项再按年份排。'
    }
  };
  var grp = st.g === 'mix' ? 'mix' : 'space';
  var ordDone = false, ordOk = false, ordRight = 0, ordCtl = null;
  function buildOrder() {
    ordDone = false; ordOk = false; ordRight = 0;
    var G = GROUPS[grp], box = L.$('#ord');
    delete box.dataset.done;
    ordCtl = L.order(box, G.items, function (ok, picked) {
      ordDone = true; ordOk = ok;
      var sorted = G.items.slice().sort(function (a, b) { return a.y - b.y; });
      ordRight = picked.filter(function (idx, k) { return G.items[idx].y === sorted[k].y; }).length;
      showOrder();
    });
    showOrder();
  }
  function showOrder() {
    var G = GROUPS[grp];
    var first = G.items.slice().sort(function (a, b) { return a.y - b.y; })[0];
    L.$('#ord-name').textContent = G.name;
    L.$('#ord-badge').textContent = ordDone ? (ordOk ? '全部排对' : '有错，再试') : '还没排完';
    L.$('#ord-score').innerHTML = ordDone ? ordRight + '<small> / ' + G.items.length + '</small>' : '—';
    L.$('#ord-first').textContent = ordDone ? first.y + ' 年 · ' + first.label.split('：')[0] : '排完才显示';
    L.$('#ord-text').innerHTML = ordDone ? (ordOk ? G.ok : G.bad + ' 按“重新排”再来一次。') : '按你认为的时间顺序，从最早到最晚依次点击。点错了可以再点一下取消。';
    save();
  }
  L.chips(L.$('#ord-chips'), [{ label: '载人航天', value: 'space' }, { label: '盛会与工程', value: 'mix' }], grp, function (v) { grp = v; buildOrder(); });
  L.$('#ord-reset').addEventListener('click', function () { buildOrder(); });

  function save() { L.setState({ y: year, e: sel, p: linked.join(''), g: grp }); }

  render();
  drawPair();
  buildOrder();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '把年份调到港珠澳大桥开通的那一年',
      desc: '拖动时间轴下面的滑块，或者直接点时间轴上的事件。',
      label: '在时间轴里操作',
      button: '检查年份',
      check: function () {
        if (year === 2018) return { ok: true, msg: '2018 年 10 月，连接香港、珠海、澳门的港珠澳大桥开通，距今 ' + L.span(2018, NOW) + ' 年。' };
        if (year === 2017) return { ok: false, msg: '2017 年是复兴号正式运营。港珠澳大桥再晚一年。' };
        return { ok: false, msg: '现在是 ' + L.yr(year) + '。港珠澳大桥开通在复兴号运营之后、嫦娥四号着陆之前。' };
      }
    },
    {
      level: 'base',
      title: '把第一个中国人送上太空的是',
      desc: '2003 年 10 月，航天员杨利伟进入太空。',
      options: ['神舟五号载人飞船', '神舟一号飞船', '嫦娥一号卫星', '天宫一号'],
      answer: 0,
      hint: '要找第一艘“载人”的神舟飞船。',
      explain: '2003 年<b>神舟五号</b>把杨利伟送上太空，我国成为世界上第三个独立掌握载人航天技术的国家。神舟一号没有载人；嫦娥一号是探月卫星；天宫一号是后来用来练习交会对接的目标飞行器。'
    },
    {
      level: 'base',
      title: '2017 年在京沪高铁正式运营的“复兴号”是',
      desc: '看看工作台右边“按领域看这些大事”的表格。',
      options: ['我国自主研发的高速动车组', '我国的卫星导航系统', '我国的探月卫星', '我国的空间站核心舱'],
      answer: 0,
      hint: '它跑在铁轨上。',
      explain: '<b>复兴号</b>是我国自主研发的高速动车组，属于交通工程。卫星导航系统是北斗；探月卫星是嫦娥；空间站核心舱是天和。'
    },
    {
      level: 'mid',
      title: '把六项成就全部连到正确的领域',
      desc: '在“成就配对”里，先点左边的成就，再点右边的领域，直到六项全部连对。',
      label: '在成就配对图里操作',
      button: '检查配对',
      check: function () {
        if (linked.length === ITEMS.length) return { ok: true, msg: '神舟五号、中国空间站 → 载人航天；嫦娥五号 → 月球探测；北斗三号 → 卫星导航；复兴号、港珠澳大桥 → 交通工程。' };
        var left = ITEMS.filter(function (it, i) { return linked.indexOf(i) < 0; }).map(function (it) { return it.n; });
        return { ok: false, msg: '已连对 ' + linked.length + ' 项，还剩：' + left.join('、') + '。记住有一个领域要连两项。' };
      }
    },
    {
      level: 'mid',
      title: '把“载人航天这条线”排对',
      desc: '在“排一排：谁先谁后”里选“载人航天”，从最早到最晚依次点完五项，要全部排对。',
      label: '在排序题里操作',
      button: '检查排序',
      check: function () {
        if (grp !== 'space') return { ok: false, msg: '先在“选一组”里切换到“载人航天”。' };
        if (!ordDone) return { ok: false, msg: '五项还没有全部点完。' };
        if (!ordOk) return { ok: false, msg: '有 ' + (5 - ordRight) + ' 项位置不对。按“重新排”再来：先上太空，再出舱、对接，最后建空间站。' };
        return { ok: true, msg: '2003 神舟五号 → 2008 神舟七号 → 2012 神舟九号 → 2021 天和核心舱 → 2022 空间站全面建成。' };
      }
    },
    {
      level: 'mid',
      title: '港珠澳大桥连接的是',
      desc: '它就在深圳附近，是家乡一带常考的内容。',
      options: ['香港、珠海、澳门', '香港、深圳、珠海', '深圳、香港、广州', '珠海、澳门、中山'],
      answer: 0,
      hint: '名字里的三个字就是答案。',
      explain: '“港珠澳”就是<b>香港、珠海、澳门</b>。其他选项都不是这座桥连接的三地，答题时直接从名字拆字就不会错。'
    },
    {
      level: 'trap',
      title: '下列成就与所属领域对应正确的是',
      desc: '名字和领域最容易张冠李戴。',
      options: ['北斗——卫星导航', '嫦娥——载人航天', '神舟——月球探测', '复兴号——卫星导航'],
      answer: 0,
      hint: '手机地图定位用的是哪一个？',
      explain: '<b>北斗</b>是我国的卫星导航系统。嫦娥是探月工程，不是载人航天；神舟是载人飞船，不是探月；复兴号是高速动车组，属于交通工程。'
    },
    {
      level: 'trap',
      title: '北京被称为“双奥之城”，是因为',
      desc: '注意两届奥运会的季节。',
      options: ['2008 年举办夏季奥运会，2022 年举办冬季奥运会', '2008 年和 2022 年都举办夏季奥运会', '2008 年举办冬季奥运会，2022 年举办夏季奥运会', '2008 年举办奥运会，2018 年举办冬奥会'],
      answer: 0,
      hint: '北京 2008 年那届，比赛里有游泳、田径。',
      explain: '北京 <b>2008 年举办第 29 届夏季奥运会</b>，<b>2022 年举办第 24 届冬季奥运会</b>，是世界上第一个既办过夏奥又办过冬奥的城市。季节对调或年份写成 2018 年都是错的。'
    }
  ]);
})();
