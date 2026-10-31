/* 历史互动馆 · 第 26 课 二战后的世界与和平发展 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();
  var NOW = 2026;

  /* ========== 冷战与战后世界时间轴 ========== */
  var ERAS = [
    { from: 1945, to: 1947, name: '战后初期', band: '', color: '#efe7df' },
    { from: 1947, to: 1955, name: '两极形成', band: '形成', color: '#e3cfc2' },
    { from: 1955, to: 1991, name: '两极对峙', band: '两极对峙', color: '#ead8c6' },
    { from: 1991, to: 2005, name: '多极化趋势', band: '多极化趋势', color: '#d8e4d4' }
  ];
  var EVENTS = [
    { id: 'un', y: 1945, label: '联合国成立', note: '二战快结束时，《联合国宪章》生效，联合国正式成立，目的是维护国际和平与安全。' },
    { id: 'truman', y: 1947, label: '杜鲁门主义', k: 'pol', note: '美国总统杜鲁门提出要援助“自由国家”，遏制共产主义。杜鲁门主义的出台标志着<b>冷战开始</b>。' },
    { id: 'marshall', y: 1947, label: '马歇尔计划', k: 'eco', note: '美国提出马歇尔计划，用经济援助复兴西欧，同时拉拢西欧对抗苏联。这是冷战在经济上的表现。' },
    { id: 'nato', y: 1949, label: '北约成立', k: 'mil', note: '美国和西欧等国成立北大西洋公约组织，这是美国一方的军事集团。同年苏联一方成立了经济互助委员会。' },
    { id: 'warsaw', y: 1955, label: '华约成立', k: 'mil', note: '苏联和东欧国家成立华沙条约组织。北约和华约对峙，<b>两极格局形成</b>。' },
    { id: 'bandung', y: 1955, label: '万隆会议', note: '第一次没有殖民国家参加的亚非国际会议。周恩来提出“求同存异”的方针，推动会议取得成功。' },
    { id: 'africa', y: 1960, label: '非洲独立年', note: '这一年有 17 个非洲国家获得独立，被称为“非洲独立年”。亚非拉国家的崛起冲击着两极格局。' },
    { id: 'seat', y: 1971, label: '中国恢复席位', note: '第 26 届联合国大会通过决议，恢复中华人民共和国在联合国的一切合法权利。' },
    { id: 'ussr', y: 1991, label: '苏联解体', note: '1991 年 12 月苏联解体，<b>两极格局结束</b>，世界格局朝着多极化方向发展。' },
    { id: 'eu', y: 1993, label: '欧盟成立', note: '欧洲共同体发展为欧洲联盟，欧洲一体化进一步加强，欧盟成为世界重要力量。' },
    { id: 'wto', y: 1995, label: '世贸组织成立', note: '世界贸易组织成立，取代关税及贸易总协定，推动贸易自由化，是经济全球化的重要表现。' },
    { id: 'join', y: 2001, label: '中国加入世贸', note: '中国正式加入世界贸易组织，进一步融入世界经济。' }
  ];
  var year = Math.round(L.num(st.y, 1947, 1945, 2005));
  var tl = L.$('#tl'), yIn = L.$('#year-in');

  function eraOf(y) {
    for (var i = ERAS.length - 1; i >= 0; i--) if (y >= ERAS[i].from) return ERAS[i];
    return ERAS[0];
  }
  /* 这一年的事件；没有就找前后 2 年内最近的（同一年可能有两件） */
  function nearby(y) {
    var best = null;
    EVENTS.forEach(function (e) {
      var d = Math.abs(e.y - y);
      if (d <= 2 && (best === null || d < Math.abs(best - y))) best = e.y;
    });
    return best === null ? [] : EVENTS.filter(function (e) { return e.y === best; });
  }
  function drawTL() {
    var near = nearby(year), onIds = near.map(function (e) { return e.id; });
    var ax = L.timeline(tl, {
      from: 1945, to: 2005, step: 10,
      era: ERAS.map(function (e) { return { from: e.from, to: e.to, label: e.band, color: e.color }; }),
      events: EVENTS.map(function (e) {
        var on = onIds.indexOf(e.id) >= 0;
        return { id: e.id, y: e.y, label: e.label, on: on, color: on ? '#a4492b' : '#7d4d3c' };
      }),
      pick: function (id) { setYear(EVENTS.filter(function (x) { return x.id === id; })[0].y); }
    });
    var x = ax.X(year);
    S('line', { x1: x, y1: 8, x2: x, y2: ax.base + 50, stroke: '#c2603f', 'stroke-width': 1.6, 'stroke-dasharray': '4 3' }, tl);
    S('path', { d: 'M' + (x - 6) + ' 4h12l-6 8z', fill: '#c2603f' }, tl);
    /* 标签提到最上层，白色描边能盖住引导线和游标，文字不被线穿过 */
    L.$$('text', ax.layer).forEach(function (t) { tl.appendChild(t); });
  }
  function setYear(y) {
    year = y;
    yIn.value = y; L.paintRange(yIn);
    renderTL();
  }
  function eraText(y) {
    if (y < 1947) return '美苏刚从盟友变成对手，矛盾正在加深。';
    if (y < 1955) return '美苏各自拉起阵营，两极对峙的局面正在形成。';
    if (y < 1991) return '两大军事集团对峙。冷战虽然没有让美苏直接开战，但局部地区仍有热战。六七十年代起，多极化趋势开始出现。';
    return '两极格局已经结束，美国是唯一的超级大国，世界朝着多极化方向发展。';
  }
  function renderTL() {
    drawTL();
    var near = nearby(year);
    L.$('#year-out').textContent = L.yr(year);
    L.$('#era-badge').textContent = eraOf(year).name;
    L.$('#r-cent').textContent = L.century(year);
    L.$('#r-ago').innerHTML = L.span(year, NOW) + '<small>年前</small>';
    L.$('#r-event').textContent = near.length
      ? (near[0].y === year ? '' : near[0].y + ' 年：') + near.map(function (e) { return e.label; }).join('、')
      : '这几年没有本课列出的大事';
    L.$('#r-text').innerHTML = near.length ? near.map(function (e) { return e.note; }).join(' ') : eraText(year);
    var keys = near.map(function (e) { return e.k; });
    if (near.length && near[0].y === 1949) keys.push('eco');
    L.$$('#bloc-table tbody tr').forEach(function (tr) { tr.classList.toggle('on', keys.indexOf(tr.dataset.k) >= 0); });
    save();
  }
  L.bindRange(yIn, function (v) { year = v; renderTL(); });
  yIn.value = year; L.paintRange(yIn);

  /* ========== 世界格局示意 ========== */
  var POLES = {
    bi: {
      label: '两极对峙（1955 年前后）', short: '两极对峙', shape: '美苏两极对峙',
      lead: '北约和华约都成立后，主要国家分别站到美苏两边。',
      nodes: [
        { id: 'us', n: '美国', x: 110, y: 82, r: 42, c: '#7d4d3c', t: '二战后最强的资本主义国家。用杜鲁门主义、马歇尔计划和北约遏制苏联，拉拢西欧。' },
        { id: 'su', n: '苏联', x: 290, y: 82, r: 42, c: '#a4492b', t: '军事力量强大，是社会主义阵营的中心。和东欧国家组成华约、经济互助委员会。' },
        { id: 'we', n: '西欧', x: 54, y: 196, r: 28, c: '#9a8a80', t: '战后经济困难，接受马歇尔计划，加入北约，在政治和军事上依靠美国。' },
        { id: 'jp', n: '日本', x: 160, y: 196, r: 25, c: '#9a8a80', t: '二战战败国，战后被美军占领，后来成为美国在亚洲的盟友。' },
        { id: 'ee', n: '东欧', x: 290, y: 196, r: 28, c: '#b98b78', t: '东欧社会主义国家和苏联站在一起，加入华约和经济互助委员会。' }
      ],
      links: [['us', 'su', 'hot'], ['us', 'we'], ['us', 'jp'], ['su', 'ee']]
    },
    loose: {
      label: '受到冲击（六七十年代）', short: '受到冲击', shape: '两极仍在，多极化趋势开始出现',
      lead: '美苏仍在争霸，但新的力量已经长了起来。',
      nodes: [
        { id: 'us', n: '美国', x: 118, y: 72, r: 36, c: '#7d4d3c', t: '仍是超级大国，但越南战争等使它的实力相对下降，不能再说一不二。' },
        { id: 'su', n: '苏联', x: 282, y: 72, r: 36, c: '#a4492b', t: '继续和美国争霸，但经济体制的问题越来越明显。' },
        { id: 'we', n: '西欧', x: 52, y: 184, r: 32, c: '#5b8a70', t: '1967 年欧洲共同体成立，西欧走向联合，在国际事务中更有分量。' },
        { id: 'jp', n: '日本', x: 150, y: 196, r: 29, c: '#5b8a70', t: '经济快速发展，1968 年成为资本主义世界第二经济大国。' },
        { id: 'cn', n: '中国', x: 250, y: 196, r: 29, c: '#5b8a70', t: '1971 年恢复在联合国的合法席位，国际地位明显提高。' },
        { id: 'tw', n: '第三世界', x: 348, y: 184, r: 34, c: '#5b8a70', fs: 11.5, t: '亚非拉国家纷纷独立，成为国际舞台上的重要力量。' }
      ],
      links: [['us', 'su', 'hot'], ['us', 'we', 'thin'], ['us', 'jp', 'thin']]
    },
    multi: {
      label: '苏联解体后（1991 年后）', short: '多极化趋势', shape: '一超多强，走向多极化',
      lead: '两极结束后，世界朝多极化方向发展，但这是趋势，还没有最终完成。',
      nodes: [
        { id: 'us', n: '美国', x: 200, y: 92, r: 42, c: '#7d4d3c', t: '苏联解体后唯一的超级大国，想主导世界事务，但一家已经说了不算。' },
        { id: 'eu', n: '欧盟', x: 60, y: 62, r: 34, c: '#5b8a70', t: '1993 年成立，欧洲一体化的成果，是世界重要的政治、经济力量。' },
        { id: 'ru', n: '俄罗斯', x: 340, y: 62, r: 34, c: '#5b8a70', t: '继承了苏联的大部分实力，仍是军事大国，在国际事务中有重要影响。' },
        { id: 'jp', n: '日本', x: 70, y: 190, r: 30, c: '#5b8a70', t: '世界经济大国，谋求成为政治大国。' },
        { id: 'cn', n: '中国', x: 330, y: 190, r: 34, c: '#5b8a70', t: '改革开放后综合国力不断增强，在国际事务中发挥着越来越重要的作用。' },
        { id: 'dv', n: '发展中国家', x: 200, y: 204, r: 34, c: '#8a9a70', fs: 10.5, t: '广大发展中国家的力量也在增强，是推动多极化的重要力量。' }
      ],
      links: [['us', 'eu', 'thin'], ['us', 'ru', 'thin'], ['us', 'jp', 'thin'], ['us', 'cn', 'thin'], ['us', 'dv', 'thin'], ['eu', 'jp', 'thin'], ['ru', 'cn', 'thin'], ['jp', 'dv', 'thin'], ['dv', 'cn', 'thin']]
    }
  };
  var poleMode = POLES[st.g] ? st.g : 'bi';
  var poleSel = st.n || null;
  var poleSvg = L.$('#pole');
  function nodeById(p, id) { return p.nodes.filter(function (x) { return x.id === id; })[0]; }
  function pickNode(id) { poleSel = id; renderPole(); }
  function renderPole() {
    var p = POLES[poleMode];
    if (!nodeById(p, poleSel)) poleSel = null;
    poleSvg.innerHTML = '';
    S('rect', { x: 0, y: 0, width: 400, height: 270, rx: 14, fill: '#fbf8f5' }, poleSvg);
    p.links.forEach(function (l) {
      var a = nodeById(p, l[0]), b = nodeById(p, l[1]), hot = l[2] === 'hot', thin = l[2] === 'thin';
      S('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: hot ? '#c2603f' : thin ? '#c9b9ad' : '#9a8a80', 'stroke-width': hot ? 3.4 : thin ? 1.3 : 2, 'stroke-dasharray': thin ? '4 4' : null }, poleSvg);
      if (hot) S('text', { x: (a.x + b.x) / 2, y: a.y - 8, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: '#a4492b', text: '对峙' }, poleSvg);
    });
    p.nodes.forEach(function (nd) {
      var on = nd.id === poleSel;
      var g = S('g', { class: 'svg-hit', tabindex: 0, role: 'button', 'aria-label': nd.n, style: 'cursor:pointer' }, poleSvg);
      S('circle', { cx: nd.x, cy: nd.y, r: nd.r, fill: nd.c, stroke: on ? '#352a26' : '#fff', 'stroke-width': on ? 3 : 2 }, g);
      S('text', { x: nd.x, y: nd.y + 5, 'text-anchor': 'middle', 'font-size': nd.fs || 13.5, 'font-weight': 700, fill: '#fff', text: nd.n }, g);
      g.addEventListener('click', function () { pickNode(nd.id); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickNode(nd.id); } });
    });
    S('text', { x: 200, y: 258, 'text-anchor': 'middle', 'font-size': 10, fill: '#8a7a70', text: '示意图：圆圈大小和位置不表示实际国力、地理位置和疆域' }, poleSvg);
    var sel = nodeById(p, poleSel);
    L.$('#p-name').textContent = sel ? sel.n : p.short;
    L.$('#p-badge').textContent = p.short;
    L.$('#p-shape').textContent = p.shape;
    L.$('#p-text').textContent = sel ? sel.t : p.lead + ' 点一个圆圈看看它的情况。';
    save();
  }
  L.chips(L.$('#pole-chips'), Object.keys(POLES).map(function (k) { return { label: POLES[k].label, value: k }; }), poleMode, function (v) { poleMode = v; poleSel = null; renderPole(); });

  /* ========== 通用：带重试的判断行 ========== */
  function judgeRow(list, text, opts, answer, why, onRight) {
    var done = false;
    var row = L.html('div', { class: 'choice-row', style: 'flex-direction:column;align-items:stretch' }, list);
    L.html('p', { html: '<b>' + text + '</b>' }, row);
    var box = L.html('div', { class: 'chips small', style: 'flex-wrap:wrap;justify-content:flex-start' }, row);
    var verdict = L.html('p', { class: 'verdict', hidden: 'hidden' }, row);
    opts.forEach(function (o) {
      var b = L.html('button', { type: 'button', text: o[1], 'aria-pressed': 'false' }, box);
      b.addEventListener('click', function () {
        if (done) return;
        L.$$('button', box).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        verdict.hidden = false;
        if (o[0] === answer) {
          done = true;
          row.classList.remove('wrong'); row.classList.add('correct');
          verdict.innerHTML = '✓ ' + why;
          onRight();
        } else {
          row.classList.add('wrong');
          verdict.innerHTML = '✗ 不对，再选一次。';
        }
      });
    });
  }

  /* ========== 联合国与世贸组织配对 ========== */
  var ORGS = [['un', '联合国'], ['wto', '世贸组织']];
  var ORG_ITEMS = [
    ['2001 年，中国正式加入', 'wto', '中国入世的时间，要和 1971 年区分开。'],
    ['1945 年成立', 'un', '二战快结束时成立。'],
    ['主要宗旨是维护国际和平与安全', 'un', '这是联合国最重要的宗旨。'],
    ['1995 年成立，前身是关税及贸易总协定', 'wto', '它取代了关贸总协定。'],
    ['1971 年，中华人民共和国恢复合法席位', 'un', '注意是“恢复”，不是第一次加入。'],
    ['推动贸易自由化，调解成员之间的贸易争端', 'wto', '它管的是国际贸易规则。'],
    ['设有安全理事会，中、法、俄、英、美是常任理事国', 'un', '安理会负责维护国际和平与安全。'],
    ['是推动经济全球化的重要国际经济组织', 'wto', '它和世界银行、国际货币基金组织一样，都与全球经济往来有关。']
  ];
  var orgDone = 0;
  ORG_ITEMS.forEach(function (it) {
    judgeRow(L.$('#org-list'), it[0], ORGS, it[1], it[2], function () {
      orgDone++;
      L.$('#org-badge').textContent = '已配对 ' + orgDone + ' / ' + ORG_ITEMS.length;
    });
  });

  /* ========== 经济全球化天平 ========== */
  var GLOB = [
    ['资金、技术和人才在全球流动，推动世界经济增长', 'good', '生产要素流动得更快，经济有了新动力。'],
    ['世界发展更不平衡，南北差距可能拉大', 'bad', '发达国家往往占有更多优势。'],
    ['消费者能买到来自世界各地的商品，选择更多', 'good', '你用的手机，零件可能来自很多国家。'],
    ['发展中国家的一些产业受到外来竞争的冲击', 'bad', '本国产业如果竞争力弱，压力就很大。'],
    ['发展中国家可以引进外国资金和先进技术', 'good', '这是发展中国家的重要机遇。'],
    ['一国的金融危机更容易传到其他国家', 'bad', '各国连得越紧，风险也越容易传导。']
  ];
  var goodN = 0, badN = 0;
  var scaleSvg = L.$('#scale');
  function drawScale() {
    scaleSvg.innerHTML = '';
    S('rect', { x: 0, y: 0, width: 400, height: 150, rx: 14, fill: '#fbf8f5' }, scaleSvg);
    var a = L.clamp(goodN - badN, -3, 3) * 4 * Math.PI / 180;
    var px = 200, py = 34, h = 118;
    var dx = h * Math.cos(a), dy = h * Math.sin(a);
    var lx = px - dx, ly = py + dy, rx = px + dx, ry = py - dy;
    S('path', { d: 'M' + (px - 26) + ' 142h52l-20 -8v-92h-12v92z', fill: '#c9b9ad' }, scaleSvg);
    S('line', { x1: lx, y1: ly, x2: rx, y2: ry, stroke: '#7d4d3c', 'stroke-width': 4, 'stroke-linecap': 'round' }, scaleSvg);
    S('circle', { cx: px, cy: py, r: 6, fill: '#7d4d3c' }, scaleSvg);
    [[lx, ly, '有利', goodN, '#2f6a4a', '#e8f1e6'], [rx, ry, '不利', badN, '#a4492b', '#fbeee6']].forEach(function (d) {
      S('line', { x1: d[0], y1: d[1], x2: d[0] - 40, y2: d[1] + 30, stroke: '#9a8a80' }, scaleSvg);
      S('line', { x1: d[0], y1: d[1], x2: d[0] + 40, y2: d[1] + 30, stroke: '#9a8a80' }, scaleSvg);
      S('rect', { x: d[0] - 46, y: d[1] + 30, width: 92, height: 32, rx: 8, fill: d[5], stroke: d[4] }, scaleSvg);
      S('text', { x: d[0], y: d[1] + 51, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: d[4], text: d[2] + ' ' + d[3] }, scaleSvg);
    });
    var n = goodN + badN;
    L.$('#glob-badge').textContent = '已放 ' + n + ' / ' + GLOB.length;
    L.$('#glob-text').innerHTML = n === GLOB.length
      ? '天平平了：经济全球化<b>既是机遇，也是挑战</b>。它是不可阻挡的历史趋势，我们要积极参与，趋利避害。'
      : '不要急着说它好或不好，先把两边都放上去。';
  }
  GLOB.forEach(function (it) {
    judgeRow(L.$('#glob-list'), it[0], [['good', '有利'], ['bad', '不利']], it[1], it[2], function () {
      if (it[1] === 'good') goodN++; else badN++;
      drawScale();
    });
  });

  function save() { L.setState({ y: year, g: poleMode, n: poleSel }); }

  renderTL();
  renderPole();
  drawScale();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '把年份调到两极格局结束的那一年',
      desc: '拖动时间轴下面的滑块，或者点时间轴上的事件。',
      label: '在时间轴里操作',
      button: '检查年份',
      check: function () {
        if (year === 1991) return { ok: true, msg: '1991 年 12 月苏联解体，两极格局结束。这一年属于 20 世纪，距今 ' + L.span(1991, NOW) + ' 年。' };
        return { ok: false, msg: '现在是' + L.yr(year) + '。想一想，两极中的“一极”是什么时候不存在的？' };
      }
    },
    {
      level: 'base',
      title: '冷战开始的标志是',
      desc: '可以把时间轴拖到 1947 年看一看。',
      options: ['杜鲁门主义的出台', '马歇尔计划的提出', '北约的成立', '华约的成立'],
      answer: 0,
      hint: '这是美国总统提出的政策，时间在 1947 年 3 月。',
      explain: '<b>杜鲁门主义</b>的出台标志冷战开始。马歇尔计划是冷战在经济上的表现；北约和华约是军事集团，两者都成立后，两极格局才形成。'
    },
    {
      level: 'base',
      title: '1960 年被称为“非洲独立年”，是因为',
      desc: '亚非拉国家是战后世界的新力量。',
      options: ['这一年有 17 个非洲国家获得独立', '这一年整个非洲全部独立', '这一年召开了万隆会议', '这一年南非结束了种族隔离制度'],
      answer: 0,
      hint: '和这一年独立的国家数量有关。',
      explain: '1960 年有 <b>17 个</b>非洲国家独立。那时非洲还没有全部独立；万隆会议是 1955 年；南非结束种族隔离制度是 20 世纪 90 年代的事。'
    },
    {
      level: 'mid',
      title: '看看 1991 年后的俄罗斯',
      desc: '在世界格局图里切换到<b>苏联解体后</b>，再点“俄罗斯”这个圆圈。',
      label: '在世界格局示意图里操作',
      button: '检查',
      check: function () {
        if (poleMode !== 'multi') return { ok: false, msg: '先把时期切换到“苏联解体后（1991 年后）”。' };
        if (poleSel !== 'ru') return { ok: false, msg: '再点一下“俄罗斯”这个圆圈，看右边的说明。' };
        return { ok: true, msg: '苏联解体后，俄罗斯继承了它的大部分实力，是多极化趋势中的重要力量之一。' };
      }
    },
    {
      level: 'mid',
      title: '把联合国和世贸组织配对完',
      desc: '在“联合国和世贸组织配对”里，把 8 条都配对正确。',
      label: '在配对区里操作',
      button: '检查配对',
      check: function () {
        if (orgDone === ORG_ITEMS.length) return { ok: true, msg: '记牢两组年份：联合国 1945 年成立、中国 1971 年恢复席位；世贸组织 1995 年成立、中国 2001 年加入。' };
        return { ok: false, msg: '现在配对了 ' + orgDone + ' / ' + ORG_ITEMS.length + ' 条。一条讲和平安全，一条讲贸易，先从这里分。' };
      }
    },
    {
      level: 'mid',
      title: '把经济全球化的天平放平',
      desc: '把 6 条说法都放上天平，看看最后是不是一边倒。',
      label: '在经济全球化天平里操作',
      button: '检查天平',
      check: function () {
        if (goodN + badN === GLOB.length) return { ok: true, msg: '利和弊都存在，所以结论是“既是机遇，也是挑战”，答题时不要只写一面。' };
        return { ok: false, msg: '还有 ' + (GLOB.length - goodN - badN) + ' 条没有放好。' };
      }
    },
    {
      level: 'trap',
      title: '关于中国和联合国，下列说法正确的是',
      desc: '注意看动词和年份。',
      options: ['1971 年恢复在联合国的合法席位', '1971 年第一次加入联合国', '2001 年恢复在联合国的合法席位', '1971 年加入世界贸易组织'],
      answer: 0,
      hint: '中国是联合国的创始会员国，所以不是“第一次加入”。',
      explain: '中国是联合国创始会员国，1971 年是<b>恢复</b>中华人民共和国的合法席位，不是第一次加入。2001 年是中国加入世贸组织的时间，两件事不要混。'
    },
    {
      level: 'trap',
      title: '关于冷战后的世界格局，下列说法正确的是',
      desc: '这是这一课最常见的坑。',
      options: ['美国是唯一的超级大国，世界朝多极化方向发展', '多极格局已经最终形成', '世界回到了美苏两极对峙', '美国已经可以独自决定一切国际事务'],
      answer: 0,
      hint: '一个词记住：趋势。',
      explain: '多极化是<b>趋势</b>，并没有最终形成。苏联已经解体，不可能再有美苏两极；美国虽然是唯一的超级大国，也无法独自决定一切。'
    }
  ]);
})();
