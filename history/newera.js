/* 历史互动馆 · 第 15 课 中国特色社会主义进入新时代（时间轴、成就配对、排序） */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();
  var NOW = 2026;

  var FIELDS = {
    dev: '国家发展', space: '载人航天', moon: '月球探测', nav: '卫星导航', traffic: '交通工程', sport: '体育盛会'
  };

  /* ========== 时间轴（国家发展的节点只用教材口径的表述） ========== */
  var EVENTS = [
    { id: 'c16', y: 2002, label: '中共十六大', f: 'dev', note: '2002 年，中国共产党第十六次全国代表大会召开，提出全面建设小康社会的奋斗目标。' },
    { id: 'sz5', y: 2003, label: '神舟五号', f: 'space', note: '2003 年 10 月，神舟五号载人飞船发射成功，航天员杨利伟成为第一个进入太空的中国人。我国成为世界上第三个独立掌握载人航天技术的国家。' },
    { id: 'c17', y: 2007, label: '中共十七大', f: 'dev', note: '2007 年，中国共产党第十七次全国代表大会召开，对夺取全面建设小康社会新胜利作出部署。' },
    { id: 'oly', y: 2008, label: '北京奥运会', f: 'sport', note: '2008 年 8 月，第 29 届夏季奥运会在北京举办。' },
    { id: 'c18', y: 2012, label: '中共十八大', f: 'dev', note: '2012 年，中国共产党第十八次全国代表大会召开。党的十八大以来，中国特色社会主义进入新时代；提出实现中华民族伟大复兴的中国梦。' },
    { id: 'c19', y: 2017, label: '中共十九大', f: 'dev', note: '2017 年，中国共产党第十九次全国代表大会召开，作出中国特色社会主义进入新时代的重大政治论断。' },
    { id: 'gzao', y: 2018, label: '港珠澳大桥', f: 'traffic', note: '2018 年 10 月，连接香港、珠海、澳门的港珠澳大桥开通。' },
    { id: 'tp', y: 2020, label: '脱贫攻坚目标完成', f: 'dev', note: '2020 年，我国脱贫攻坚目标任务如期完成，现行标准下农村贫困人口全部脱贫，贫困县全部摘帽。' },
    { id: 'xk', y: 2021, label: '全面建成小康社会', f: 'dev', note: '2021 年，我国实现第一个百年奋斗目标，在中华大地上全面建成了小康社会，历史性地解决了绝对贫困问题。' },
    { id: 'wao', y: 2022, label: '北京冬奥会', f: 'sport', note: '2022 年 2 月，第 24 届冬季奥运会在北京举办，北京成为世界上第一个“双奥之城”。' },
    { id: 'c20', y: 2022, label: '中共二十大', f: 'dev', note: '2022 年，中国共产党第二十次全国代表大会召开，提出以中国式现代化全面推进中华民族伟大复兴。' },
    { id: 'kjz', y: 2022, label: '空间站建成', f: 'space', note: '2022 年，问天、梦天两个实验舱先后与天和核心舱对接，中国空间站全面建成。' }
  ];
  /* 没放进时间轴、但滑到这一年要提一句的事 */
  var NOTE_Y = {
    2005: '2005 年，全国人大通过《反分裂国家法》。',
    2006: '2006 年起，我国全面取消农业税；同年青藏铁路全线通车，中非合作论坛北京峰会召开。',
    2007: '同年 10 月，嫦娥一号探月卫星发射，探月工程迈出第一步。',
    2008: '同年 9 月，神舟七号航天员翟志刚完成中国人第一次太空出舱活动。',
    2010: '2010 年，上海世界博览会举办；我国经济总量跃居世界第二。',
    2012: '同年，神舟九号与天宫一号完成载人交会对接；我国第一艘航空母舰辽宁舰交付海军。',
    2013: '2013 年，我国提出共建“一带一路”倡议。',
    2014: '2014 年，我国提出总体国家安全观；同年亚太经合组织领导人非正式会议在北京举行。',
    2015: '2015 年，全国人大常委会通过新的《中华人民共和国国家安全法》。',
    2016: '2016 年，二十国集团领导人峰会在杭州举行。',
    2017: '同年 6 月，我国自主研发的复兴号动车组在京沪高铁正式运营。',
    2019: '2019 年 1 月，嫦娥四号在月球背面软着陆。',
    2020: '同年，北斗三号全球卫星导航系统建成开通，嫦娥五号带回月球样品。',
    2021: '2021 年起，我国开启全面建设社会主义现代化国家新征程，向第二个百年奋斗目标进军。'
  };
  function evById(id) { return EVENTS.filter(function (e) { return e.id === id; })[0] || null; }
  var year = Math.round(L.num(st.y, 2003, 2002, 2022));
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
      from: 2001, to: 2023, step: 5,
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
    if (NOTE_Y[year]) t += (t ? ' ' : '') + NOTE_Y[year];
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
    },
    dev: {
      name: '从全面建设到全面建成',
      items: [
        { label: '中共十六大提出全面建设小康社会的奋斗目标', y: 2002 },
        { label: '中共十八大召开', y: 2012 },
        { label: '中共十九大召开', y: 2017 },
        { label: '全面建成小康社会，实现第一个百年奋斗目标', y: 2021 },
        { label: '中共二十大召开', y: 2022 }
      ],
      ok: '2002 十六大 → 2012 十八大 → 2017 十九大 → 2021 全面建成小康社会 → 2022 二十大。党的全国代表大会每五年召开一次，记住 2002 年，后面每次加 5 就行。',
      bad: '小窍门：党的全国代表大会每五年开一次，2002、2007、2012、2017、2022 年。全面建成小康社会在 2021 年，夹在十九大和二十大之间。'
    }
  };
  var grp = GROUPS[st.g] ? st.g : 'space';
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
  L.chips(L.$('#ord-chips'), [{ label: '载人航天', value: 'space' }, { label: '盛会与工程', value: 'mix' }, { label: '国家发展', value: 'dev' }], grp, function (v) { grp = v; buildOrder(); });
  L.$('#ord-reset').addEventListener('click', function () { buildOrder(); });

  function save() { L.setState({ y: year, e: sel, p: linked.join(''), g: grp }); }

  render();
  drawPair();
  buildOrder();

  /* ========== 课本逐课要点（顺序对应新教材八下第 15～24 课） ========== */
  L.keypoints('#keypoints', [
    '2002 年<b>中共十六大</b>提出全面建设小康社会的奋斗目标；坚持以人为本、全面协调可持续的<b>科学发展观</b>；2006 年起全面取消农业税。',
    '2007 年<b>中共十七大</b>对夺取全面建设小康社会新胜利作出部署；2008 年北京举办夏季奥运会，2010 年上海举办世博会；2010 年我国经济总量跃居世界第二。',
    '国防：2003 年<b>神舟五号</b>载人飞行，我国成为第三个独立掌握载人航天技术的国家；2012 年第一艘航空母舰辽宁舰交付海军。外交：坚持独立自主的和平外交政策，积极参与多边合作，2006 年中非合作论坛北京峰会召开。',
    '2012 年<b>中共十八大</b>召开，中国特色社会主义进入新时代；提出实现中华民族伟大复兴的<b>中国梦</b>；统筹推进“五位一体”总体布局、协调推进“四个全面”战略布局。2017 年<b>中共十九大</b>作出中国特色社会主义进入新时代的重大政治论断。',
    '贯彻创新、协调、绿色、开放、共享的<b>新发展理念</b>；实施精准扶贫，打赢脱贫攻坚战，<b>2020 年</b>现行标准下农村贫困人口全部脱贫，贫困县全部摘帽。',
    '2014 年提出<b>总体国家安全观</b>，2015 年通过新的国家安全法；坚持“<b>一国两制</b>”，保持香港、澳门长期繁荣稳定；坚持一个中国原则和“九二共识”，2005 年通过《反分裂国家法》；台湾是中国领土不可分割的一部分。',
    '倡导构建<b>人类命运共同体</b>；2013 年提出共建“<b>一带一路</b>”倡议；2014 年 APEC 领导人非正式会议在北京举行，2016 年二十国集团领导人峰会在杭州举行。',
    '<b>2021 年</b>中国共产党成立 100 周年之际，我国实现第一个百年奋斗目标，在中华大地上<b>全面建成了小康社会</b>，历史性地解决了绝对贫困问题。',
    '2022 年<b>中共二十大</b>召开，提出以中国式现代化全面推进中华民族伟大复兴；两步走：到 <b>2035 年</b>基本实现社会主义现代化，到本世纪中叶建成社会主义现代化强国。',
    '活动课：围绕“新时代社会生活的巨大变化”，可以从衣食住行、通信、出行（如高铁、港珠澳大桥）、购物支付等方面，采访家人、收集老照片，对比今昔并制作小年表；深圳同学可以调查身边社区的变化。'
  ]);

  /* ========== 大题训练 ========== */
  L.essay('#essay', {
    title: '从全面建设到全面建成小康社会',
    materials: [
      { label: '材料一', text: '2002 年，中共十六大提出全面建设小康社会的奋斗目标。2006 年起，我国全面取消农业税。2007 年，中共十七大对夺取全面建设小康社会新胜利作出部署。', src: '——据统编版八年级下册第 15、16 课整理' },
      { label: '材料二', text: '党的十八大以来，我国实施精准扶贫，打赢脱贫攻坚战。2020 年，现行标准下农村贫困人口全部脱贫，贫困县全部摘帽。2021 年，我国实现第一个百年奋斗目标，全面建成了小康社会。', src: '——据统编版八年级下册第 19、22 课整理' }
    ],
    parts: [
      {
        ask: '(1) 根据材料一、二，按时间顺序概括我国建设小康社会的历程。', score: 4, type: 'sum',
        points: [
          { t: '2002 年中共十六大提出全面建设小康社会的奋斗目标', s: 1 },
          { t: '2007 年中共十七大部署夺取全面建设小康社会新胜利', s: 1 },
          { t: '十八大以来实施精准扶贫，2020 年脱贫攻坚目标任务完成', s: 1 },
          { t: '2021 年全面建成小康社会，实现第一个百年奋斗目标', s: 1 }
        ],
        model: '2002 年中共十六大提出全面建设小康社会的奋斗目标；2007 年中共十七大部署夺取全面建设小康社会新胜利；党的十八大以来实施精准扶贫，2020 年现行标准下农村贫困人口全部脱贫；2021 年全面建成小康社会，实现第一个百年奋斗目标。'
      },
      {
        ask: '(2) 结合所学，从航天、交通、体育盛会中任选两个方面，各举一例说明 21 世纪以来我国取得的成就（写出时间和事件）。', score: 4, type: 'fact',
        points: [
          { t: '第一个方面的史实，时间正确', s: 1 },
          { t: '第一个方面的史实，事件正确（如 2003 年神舟五号、2022 年空间站全面建成）', s: 1 },
          { t: '第二个方面的史实，时间正确', s: 1 },
          { t: '第二个方面的史实，事件正确（如 2018 年港珠澳大桥开通、2008 年北京奥运会、2022 年北京冬奥会）', s: 1 }
        ],
        model: '航天：2003 年神舟五号载人飞船发射成功，杨利伟成为第一个进入太空的中国人；2022 年中国空间站全面建成。交通：2017 年复兴号在京沪高铁正式运营；2018 年港珠澳大桥开通。体育盛会：2008 年北京举办夏季奥运会，2022 年北京举办冬季奥运会。（任选两个方面，每例写清时间和事件。）'
      },
      {
        ask: '(3) 结合所学，说明全面建成小康社会的历史意义。', score: 4, type: 'effect',
        points: [
          { t: '实现了第一个百年奋斗目标', s: 1 },
          { t: '历史性地解决了绝对贫困问题', s: 1 },
          { t: '为开启全面建设社会主义现代化国家新征程奠定了基础', s: 1 },
          { t: '为世界减贫事业作出了贡献', s: 1 }
        ],
        model: '我国实现了第一个百年奋斗目标，历史性地解决了绝对贫困问题；为开启全面建设社会主义现代化国家新征程、向第二个百年奋斗目标进军奠定了基础；也为世界减贫事业作出了贡献。'
      }
    ]
  });

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
        if (year === 2017) return { ok: false, msg: '2017 年是复兴号正式运营、中共十九大召开。港珠澳大桥再晚一年。' };
        return { ok: false, msg: '现在是 ' + L.yr(year) + '。港珠澳大桥开通在中共十九大之后、脱贫攻坚目标任务完成之前。' };
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
      title: '2021 年，我国实现的第一个百年奋斗目标是',
      desc: '注意和第二个百年奋斗目标区分。',
      options: ['全面建成小康社会', '基本实现社会主义现代化', '建成社会主义现代化强国', '提出全面建设小康社会'],
      answer: 0,
      hint: '这一年也是中国共产党成立 100 周年。',
      explain: '2021 年我国实现第一个百年奋斗目标，<b>全面建成了小康社会</b>。基本实现社会主义现代化是到 2035 年的目标；建成社会主义现代化强国是到本世纪中叶的目标；“全面建设小康社会”是 2002 年中共十六大提出的奋斗目标。'
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
      title: '2013 年，我国提出的促进沿线国家共同发展的倡议是',
      desc: '它是构建人类命运共同体的重要实践。',
      options: ['共建“一带一路”', '和平共处五项原则', '“求同存异”方针', '“一国两制”'],
      answer: 0,
      hint: '名字让人想起古代的丝绸之路。',
      explain: '2013 年我国提出共建<b>“一带一路”</b>倡议。和平共处五项原则是 1953 年底首次提出的；“求同存异”是 1955 年万隆会议上提出的；“一国两制”是为实现祖国统一提出的，不是对外合作倡议。'
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
      title: '2002 年中共十六大提出的奋斗目标是',
      desc: '一字之差，最容易错。',
      options: ['全面建设小康社会', '全面建成小康社会', '基本实现社会主义现代化', '建成社会主义现代化强国'],
      answer: 0,
      hint: '2002 年是“开始建设”，还是已经“建成”了？',
      explain: '2002 年十六大提出的是<b>全面建设小康社会</b>的奋斗目标；到 2021 年才宣告<b>全面建成</b>了小康社会。“基本实现社会主义现代化”“建成社会主义现代化强国”是 2035 年和本世纪中叶的目标。'
    }
  ]);
})();
