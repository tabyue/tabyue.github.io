/* 历史互动馆 · 第 25 课 经济大危机和第二次世界大战 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();
  var NOW = 2026;
  var START = 1937;

  /* ========== 时间轴：滑块的单位是“月”，m = 0 表示 1937 年 1 月 ========== */
  function ym(y, mo) { return (y - START) * 12 + mo - 1; }
  function yearOf(m) { return START + Math.floor(m / 12); }
  function monthOf(m) { return m % 12 + 1; }
  function ymText(m) { return yearOf(m) + ' 年 ' + monthOf(m) + ' 月'; }
  var MAX_M = ym(1945, 9);

  var PHASES = [
    { from: 0, to: ym(1939, 8), name: '爆发前', band: '战前扩张', color: '#efe7df' },
    { from: ym(1939, 9), to: ym(1942, 6), name: '爆发与扩大', band: '爆发与扩大', color: '#e3cfc2' },
    { from: ym(1942, 7), to: ym(1943, 2), name: '转折', band: '', color: '#d9a58a' },
    { from: ym(1943, 3), to: MAX_M, name: '反攻与胜利', band: '反攻与胜利', color: '#d8e4d4' }
  ];
  /* dot: true 的画在时间轴上（最多 12 个）；其余只在读数里出现 */
  var EVENTS = [
    { id: 'lugou', m: ym(1937, 7), label: '七七事变', cn: true, dot: true, note: '日本发动七七事变，全民族抗战开始。这时欧洲还没有开战，中国已经在抵抗法西斯侵略。' },
    { id: 'austria', m: ym(1938, 3), label: '德国吞并奥地利', note: '德国吞并奥地利，开始在欧洲对外扩张。英法没有实际阻止。' },
    { id: 'munich', m: ym(1938, 9), label: '慕尼黑协定', dot: true, note: '英、法、德、意签订慕尼黑协定，把捷克斯洛伐克的苏台德区割给德国，是绥靖政策的顶点。' },
    { id: 'poland', m: ym(1939, 9), label: '德国突袭波兰', dot: true, note: '9 月 1 日德国突袭波兰，9 月 3 日英法对德宣战，第二次世界大战全面爆发。' },
    { id: 'france', m: ym(1940, 6), label: '法国投降', note: '德军绕过马奇诺防线攻入法国，法国投降。' },
    { id: 'baituan', m: ym(1940, 8), label: '百团大战', cn: true, dot: true, note: '八路军在华北发动百团大战，这是抗战时期八路军主动出击日军的一次大规模战役。' },
    { id: 'ussr', m: ym(1941, 6), label: '苏德战争', dot: true, note: '德国撕毁条约，进攻苏联，苏德战争爆发，二战规模进一步扩大。' },
    { id: 'pearl', m: ym(1941, 12), label: '太平洋战争', dot: true, note: '日本偷袭美国海军基地珍珠港，太平洋战争爆发，美国参战，二战规模达到最大。' },
    { id: 'un', m: ym(1942, 1), label: '联合国家宣言', dot: true, note: '美、英、苏、中等 26 国在华盛顿签署《联合国家宣言》，世界反法西斯同盟正式形成。' },
    { id: 'midway', m: ym(1942, 6), label: '中途岛海战', note: '中途岛海战中美军重创日本海军，太平洋战场的形势开始转变。' },
    { id: 'stalin', m: ym(1942, 7), label: '斯大林格勒战役', dot: true, note: '斯大林格勒战役从 1942 年 7 月打到 1943 年 2 月，苏军获胜，成为苏德战场的转折点，也是二战的重要转折点。' },
    { id: 'italy', m: ym(1943, 9), label: '意大利投降', note: '意大利投降，法西斯同盟开始瓦解。' },
    { id: 'normandy', m: ym(1944, 6), label: '诺曼底登陆', dot: true, note: '盟军在法国诺曼底登陆，开辟欧洲第二战场，德国陷入东西两面夹击。' },
    { id: 'germany', m: ym(1945, 5), label: '德国投降', dot: true, note: '苏军攻克柏林后，德国宣布无条件投降，欧洲战事结束。' },
    { id: 'japan', m: ym(1945, 8), label: '日本宣布投降', dot: true, note: '8 月 15 日日本宣布无条件投降。中国军民也在这时展开全面反攻。' },
    { id: 'sign', m: ym(1945, 9), label: '签署投降书', dot: true, note: '9 月 2 日日本签署投降书，二战结束。中国人民抗日战争取得胜利，这是近代以来中国反抗外敌入侵第一次取得完全胜利的民族解放战争。' }
  ];
  var CHINA = [
    { to: ym(1937, 6), t: '局部抗战（1931 年九一八事变起）' },
    { to: ym(1938, 9), t: '全民族抗战开始，战略防御' },
    { to: ym(1943, 12), t: '相持阶段，与日军长期作战' },
    { to: ym(1945, 7), t: '敌后战场开始局部反攻' },
    { to: MAX_M, t: '全面反攻，抗日战争胜利' }
  ];
  var month = Math.round(L.num(st.m, ym(1939, 9), 0, MAX_M));
  var view = st.v === 'w' ? 'w' : 'all';
  var tl = L.$('#tl'), mIn = L.$('#month-in');

  function phaseIndex(m) { for (var i = 0; i < PHASES.length; i++) if (m <= PHASES[i].to) return i; return PHASES.length - 1; }
  function chinaAt(m) { for (var i = 0; i < CHINA.length; i++) if (m <= CHINA[i].to) return CHINA[i].t; return ''; }
  function latest(m, cn) {
    var best = null;
    EVENTS.forEach(function (e) { if (!!e.cn === cn && e.m <= m) best = e; });
    return best;
  }
  function frac(m) { return START + m / 12; }
  function setMonth(m) {
    month = m;
    mIn.value = m; L.paintRange(mIn);
    renderTL();
  }
  function drawTL() {
    var world = latest(month, false), cn = latest(month, true);
    var ax = L.timeline(tl, {
      from: START, to: 1946, step: 1,
      era: PHASES.map(function (p) { return { from: frac(p.from), to: frac(p.to + 1), label: p.band, color: p.color }; }),
      events: EVENTS.filter(function (e) { return e.dot && (view === 'all' || !e.cn); }).map(function (e) {
        var on = (world && world.id === e.id) || (cn && cn.id === e.id);
        return { id: e.id, y: frac(e.m), label: e.label, on: on, color: e.cn ? (on ? '#1f6b43' : '#2f6a4a') : (on ? '#a4492b' : '#7d4d3c') };
      }),
      pick: function (id) { setMonth(EVENTS.filter(function (x) { return x.id === id; })[0].m); }
    });
    /* “转折”这段色带太窄，公共函数不写字，这里补一个小字 */
    var p = PHASES[2], x0 = ax.X(frac(p.from)), x1 = ax.X(frac(p.to + 1));
    S('text', { x: (x0 + x1) / 2, y: ax.base + 45, 'text-anchor': 'middle', 'font-size': 9.5, 'font-weight': 600, fill: '#5a4036', text: '转折' }, tl);
    var x = ax.X(frac(month));
    S('line', { x1: x, y1: 8, x2: x, y2: ax.base + 50, stroke: '#c2603f', 'stroke-width': 1.6, 'stroke-dasharray': '4 3' }, tl);
    S('path', { d: 'M' + (x - 6) + ' 4h12l-6 8z', fill: '#c2603f' }, tl);
    /* 标签提到最上层，白色描边能盖住引导线和游标，文字不被线穿过 */
    L.$$('text', ax.layer).forEach(function (t) { tl.appendChild(t); });
  }
  function renderTL() {
    drawTL();
    var p = phaseIndex(month), world = latest(month, false), cn = latest(month, true), y = yearOf(month);
    L.$('#month-out').textContent = ymText(month);
    L.$('#phase-badge').textContent = PHASES[p].name;
    L.$('#r-cent').textContent = L.century(y);
    L.$('#r-ago').innerHTML = L.span(y, NOW) + '<small>年前</small>';
    L.$('#r-world').textContent = world ? ymText(world.m) + '：' + world.label : '欧洲还没有全面开战';
    L.$('#r-china').textContent = chinaAt(month);
    var hit = EVENTS.filter(function (e) { return e.m === month; })[0];
    var t;
    if (hit) t = hit.note;
    else if (cn && (!world || cn.m > world.m)) t = cn.note;
    else if (world) t = world.note;
    else t = '法西斯国家已经在扩张：1931 年日本发动九一八事变，1935 年意大利侵略埃塞俄比亚，德国也在重整军备。';
    L.$('#r-text').textContent = t;
    L.$$('#phase-table tbody tr').forEach(function (tr) { tr.classList.toggle('on', +tr.dataset.p === p); });
    save();
  }
  L.bindRange(mIn, function (v) { month = v; renderTL(); });
  mIn.value = month; L.paintRange(mIn);
  L.chips(L.$('#view-chips'), [{ label: '世界 + 中国战场', value: 'all' }, { label: '只看世界', value: 'w' }], view, function (v) { view = v; renderTL(); });

  /* ========== 大危机连锁反应 ========== */
  var NODES = [
    { n: '股市崩溃', x: 58, y: 42, fix: '' },
    { n: '银行倒闭', x: 198, y: 42, fix: '整顿金融' },
    { n: '工厂关门', x: 338, y: 42, fix: '调整工业' },
    { n: '工人失业', x: 338, y: 146, fix: '以工代赈' },
    { n: '购买力下降', x: 198, y: 146, fix: '社会保障' }
  ];
  var FREE_TEXT = [
    '1929 年 10 月，美国纽约股市暴跌，股票大幅贬值，很多人一下子破产。大危机从这里开始。',
    '不少人买股票的钱是借来的，还不上贷款；存款人又抢着取钱。大批银行撑不住，倒闭了。',
    '银行倒了，工厂借不到钱，生产出来的东西又卖不掉，只好减产、关门。',
    '工厂关门，工人丢了工作，失业人数急剧增加。',
    '没有工资，就买不起东西。商品堆在仓库里，不是没有东西，而是人们没钱买。'
  ];
  var LOOP_TEXT = [
    '东西更卖不掉了，<b>更多工厂关门</b>。这一轮比上一轮更糟。',
    '又有一批工人失业。危机还通过贸易和资金往来，传到了其他资本主义国家。',
    '购买力继续下降，圈又转回了工厂。没有外力，它自己很难停下来。'
  ];
  var DEAL_TEXT = [
    '1933 年罗斯福就任总统，局面已经很糟。现在由政府出手，按“推一下”看新政怎么一环环修。',
    '<b>整顿金融</b>：颁布《紧急银行法》，整顿银行，人们重新敢把钱存进去。新政就从这里开始。',
    '<b>调整工业</b>：颁布《全国工业复兴法》，让各工业部门订立公平竞争的规章，减少盲目生产。',
    '<b>以工代赈</b>：政府兴建公共工程，失业者去干活、领工资，比单纯发救济更能恢复信心。',
    '<b>社会保障</b>：颁布《社会保障法》，建立养老金和失业保险。人们有了保障，购买力逐渐回升。新政缓和了危机，但没有改变资本主义制度。'
  ];
  var FREE_MAX = 10, DEAL_MAX = 4;
  var mode = st.c === 'deal' ? 'deal' : 'free';
  var step = Math.round(L.num(st.s, 0, 0, mode === 'deal' ? DEAL_MAX : FREE_MAX));
  var sawRound2 = mode === 'free' && step >= 5;
  var chainAnim = null, chainDot = null;
  var chainSvg = L.$('#chain');

  /* 不干预时：step 0～4 走完五环，之后在工厂、失业、购买力三环之间循环 */
  function nodeOf(s) { return s <= 4 ? s : 2 + (s - 2) % 3; }
  function roundOf(s) { return s < 2 ? 0 : 1 + Math.floor((s - 2) / 3); }
  function gaugeValue() { return mode === 'deal' ? 25 + step * 15 : 90 - step * 7.5; }
  function gaugeWord(v) {
    if (mode === 'deal') return step === 0 ? '跌到谷底' : step < 3 ? '开始回升' : '明显好转';
    return v >= 70 ? '开始下滑' : v >= 45 ? '明显变差' : v >= 25 ? '很差' : '跌到谷底';
  }
  function chainArrow(x1, y1, x2, y2, on, green) {
    L.arrow(chainSvg, x1, y1, x2, y2, { color: green ? '#2f6a4a' : on ? '#a4492b' : '#c9b9ad', width: on ? 2.4 : 1.6 });
  }
  function drawChain() {
    chainSvg.innerHTML = '';
    var deal = mode === 'deal';
    var cur = deal ? step : nodeOf(step), round = roundOf(step);
    S('rect', { x: 0, y: 0, width: 400, height: 262, rx: 14, fill: deal ? '#f6f9f3' : '#fbf8f5' }, chainSvg);
    var touched = function (i) { return deal || i <= step; };
    var fixed = function (i) { return deal && i >= 1 && i <= step; };
    chainArrow(106, 42, 150, 42, !deal && step >= 1);
    chainArrow(246, 42, 290, 42, step >= 2, deal && step >= 2);
    chainArrow(338, 66, 338, 122, step >= 3, deal && step >= 3);
    chainArrow(290, 146, 246, 146, step >= 4, deal && step >= 4);
    chainArrow(236, 122, 298, 66, deal ? step >= 4 : step >= 5, deal && step >= 4);
    S('text', { x: 256, y: 92, 'text-anchor': 'end', 'font-size': 11, 'font-weight': 600, fill: deal ? (step >= 4 ? '#2f6a4a' : '#a0908a') : (step >= 5 ? '#a4492b' : '#a0908a'), text: deal ? '工厂复工' : '更多工厂关门' }, chainSvg);
    NODES.forEach(function (nd, i) {
      var isCur = deal ? (i === cur && step > 0) : i === cur;
      var isFixed = fixed(i), hurt = touched(i) && !isFixed;
      var stroke = isFixed ? '#2f6a4a' : hurt ? '#a4492b' : '#cdb7a8';
      var fill = isFixed ? '#e8f1e6' : hurt ? '#fbeee6' : '#fff';
      S('rect', { x: nd.x - 46, y: nd.y - 24, width: 92, height: 48, rx: 10, fill: fill, stroke: stroke, 'stroke-width': isCur ? 3 : 1.4 }, chainSvg);
      var sub = deal ? (nd.fix ? (isFixed ? nd.fix : '等待修复') : '已经发生') : '';
      S('text', { x: nd.x, y: nd.y + (sub ? -2 : 5), 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: '#4a3a32', text: nd.n }, chainSvg);
      if (sub) S('text', { x: nd.x, y: nd.y + 14, 'text-anchor': 'middle', 'font-size': 10.5, fill: isFixed ? '#2f6a4a' : '#8a7a70', 'font-weight': isFixed ? 700 : 400, text: sub }, chainSvg);
    });
    /* 左下角：轮数 */
    S('text', { x: 58, y: 132, 'text-anchor': 'middle', 'font-size': 11, fill: '#8a7a70', text: deal ? '已修复' : '恶性循环' }, chainSvg);
    S('text', { x: 58, y: 162, 'text-anchor': 'middle', 'font-size': 24, 'font-weight': 700, fill: deal ? '#2f6a4a' : '#a4492b', text: deal ? step + ' / 4' : (round ? '第 ' + round + ' 轮' : '未成圈') }, chainSvg);
    /* 景气长条 */
    var v = gaugeValue();
    S('text', { x: 20, y: 204, 'font-size': 11, fill: '#6f6663', text: '经济景气（示意）' }, chainSvg);
    S('rect', { x: 20, y: 211, width: 360, height: 14, rx: 7, fill: '#eee6df' }, chainSvg);
    S('rect', { x: 20, y: 211, width: 360 * v / 100, height: 14, rx: 7, fill: deal ? '#5b9470' : '#c2603f' }, chainSvg);
    S('text', { x: 200, y: 246, 'text-anchor': 'middle', 'font-size': 10, fill: '#8a7a70', text: '箭头表示因果，长条只是示意，不是真实统计数据' }, chainSvg);
    if (chainDot) S('circle', { cx: chainDot[0], cy: chainDot[1], r: 6, fill: deal ? '#2f6a4a' : '#a4492b', stroke: '#fff', 'stroke-width': 2 }, chainSvg);
  }
  function renderChain() {
    drawChain();
    var deal = mode === 'deal', v = gaugeValue();
    if (deal) {
      L.$('#c-name').textContent = step === 0 ? '政府出手' : NODES[step].fix;
      L.$('#c-badge').textContent = '修复 ' + step + ' / ' + DEAL_MAX;
      L.$('#c-round').textContent = step === 0 ? '新政开始前' : '修到“' + NODES[step].n + '”';
      L.$('#c-text').innerHTML = DEAL_TEXT[step];
    } else {
      var i = nodeOf(step), r = roundOf(step);
      L.$('#c-name').textContent = step >= 5 && i === 2 ? '更多工厂关门' : NODES[i].n;
      L.$('#c-badge').textContent = '第 ' + (i + 1) + ' 环';
      L.$('#c-round').textContent = r === 0 ? '危机刚开始' : '第 ' + r + ' 轮循环';
      var t = step <= 4 ? FREE_TEXT[step] : LOOP_TEXT[(step - 5) % 3];
      if (step >= FREE_MAX) t += ' 已经转了三轮还停不下来，切到“国家干预”试试。';
      L.$('#c-text').innerHTML = t;
    }
    L.$('#c-gauge').textContent = gaugeWord(v);
    var max = deal ? DEAL_MAX : FREE_MAX;
    var go = L.$('#chain-go');
    go.disabled = step >= max;
    go.style.opacity = step >= max ? '.5' : '';
    go.textContent = step >= max ? (deal ? '这一轮修完了' : '圈还在转') : (deal ? '修下一环' : '推一下');
    save();
  }
  function stopChain() { if (chainAnim) { chainAnim.stop(); chainAnim = null; } chainDot = null; }
  function commitStep() {
    step++;
    if (mode === 'free' && step >= 5) sawRound2 = true;
    chainDot = null; chainAnim = null;
    renderChain();
  }
  L.$('#chain-go').addEventListener('click', function () {
    if (chainAnim) return;
    var deal = mode === 'deal';
    if (step >= (deal ? DEAL_MAX : FREE_MAX)) return;
    var a = deal ? NODES[step] : NODES[nodeOf(step)];
    var b = deal ? NODES[step + 1] : NODES[nodeOf(step + 1)];
    if (L.REDUCED || (deal && step === 0)) { commitStep(); return; }
    var t = 0;
    chainAnim = L.loop(function (dt) {
      t = Math.min(1, t + dt * 2.6);
      if (t >= 1) { commitStep(); return false; }
      chainDot = [L.lerp(a.x, b.x, t), L.lerp(a.y, b.y, t)];
      drawChain();
    });
  });
  L.$('#chain-reset').addEventListener('click', function () { stopChain(); step = 0; renderChain(); });
  L.chips(L.$('#mode-chips'), [{ label: '不干预', value: 'free' }, { label: '国家干预（罗斯福新政）', value: 'deal' }], mode, function (v) { stopChain(); mode = v; step = 0; renderChain(); });

  /* ========== 罗斯福新政分类 ========== */
  var CATS = ['整顿金融', '调整工业', '调整农业', '以工代赈', '社会保障'];
  var MEASURES = [
    { t: '建立养老金和失业保险制度', c: 4, why: '这是 1935 年《社会保障法》的内容，给老人和失业者兜底。' },
    { t: '颁布《紧急银行法》，整顿银行，恢复人们的信心', c: 0, why: '新政就是从整顿金融开始的。' },
    { t: '兴建公共工程（如田纳西河流域工程），让失业者干活领工资', c: 3, why: '用工作代替单纯的救济，既解决失业，也刺激了消费。' },
    { t: '颁布《农业调整法》，减少耕地和产量，给农民补贴，提高农产品价格', c: 2, why: '农产品太多卖不出价，政府就引导减产。' },
    { t: '颁布《全国工业复兴法》，让各工业部门订立公平竞争的规章', c: 1, why: '目的是防止盲目生产和恶性竞争。' }
  ];
  var dealOk = MEASURES.map(function () { return false; });
  function dealCount() { return dealOk.filter(Boolean).length; }
  function renderDeal() {
    var n = dealCount();
    L.$('#deal-badge').textContent = '已归类 ' + n + ' / ' + MEASURES.length;
    L.$('#deal-text').innerHTML = n === MEASURES.length
      ? '五类全归好了。它们有一个共同点：都是<b>政府出手</b>管经济。所以新政的特点是<b>加强国家对经济的干预和指导</b>，它缓和了危机，但没有改变资本主义制度。'
      : '把左边的措施都归好类，再想想：这些措施是谁在做？它们有什么共同点？';
  }
  var dealList = L.$('#deal-list');
  MEASURES.forEach(function (m, i) {
    var row = L.html('div', { class: 'choice-row', style: 'flex-direction:column;align-items:stretch' }, dealList);
    L.html('p', { html: '<b>' + m.t + '</b>' }, row);
    var box = L.html('div', { class: 'chips small', style: 'flex-wrap:wrap;justify-content:flex-start' }, row);
    var verdict = L.html('p', { class: 'verdict', hidden: 'hidden' }, row);
    CATS.forEach(function (c, k) {
      var b = L.html('button', { type: 'button', text: c, 'aria-pressed': 'false' }, box);
      b.addEventListener('click', function () {
        if (dealOk[i]) return;
        L.$$('button', box).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        verdict.hidden = false;
        if (k === m.c) {
          dealOk[i] = true;
          row.classList.remove('wrong'); row.classList.add('correct');
          verdict.innerHTML = '✓ ' + m.why;
        } else {
          row.classList.add('wrong');
          verdict.innerHTML = '✗ 再想想：这项措施主要是针对哪个方面的？';
        }
        renderDeal();
      });
    });
  });

  /* ========== 排序 ========== */
  var orderOk = false;
  var ORDER = [
    { label: '经济大危机爆发', y: 1929 },
    { label: '希特勒在德国上台', y: 1933 },
    { label: '慕尼黑协定签订', y: 1938 },
    { label: '德国突袭波兰', y: 1939 },
    { label: '太平洋战争爆发', y: 1941 },
    { label: '诺曼底登陆', y: 1944 },
    { label: '日本签署投降书', y: 1945 }
  ];
  var orderMsg = L.$('#order-msg');
  var orderGame = L.order(L.$('#order'), ORDER, function (ok) {
    orderOk = ok;
    orderMsg.innerHTML = ok ? '顺序全对。危机在前，法西斯上台，绥靖纵容，最后才是全面战争。' : '橙色的位置不对，看看显示出来的年份，再排一次。';
  });
  L.$('#order-reset').addEventListener('click', function () { orderGame.reset(); orderOk = false; orderMsg.textContent = ''; });

  function save() { L.setState({ m: month, v: view, c: mode, s: step }); }

  renderTL();
  renderChain();
  renderDeal();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '把时间调到二战全面爆发的那个月',
      desc: '在时间轴下面拖动滑块，或者直接点时间轴上的事件。',
      label: '在时间轴里操作',
      button: '检查月份',
      check: function () {
        if (month === ym(1939, 9)) return { ok: true, msg: '1939 年 9 月 1 日德国突袭波兰，3 日英法对德宣战，二战全面爆发。' };
        if (month < ym(1939, 9)) return { ok: false, msg: '现在是' + ymText(month) + '，还要往后。慕尼黑协定之后一年，战争才全面爆发。' };
        return { ok: false, msg: '现在是' + ymText(month) + '，已经过了。往前找德国突袭波兰。' };
      }
    },
    {
      level: 'base',
      title: '罗斯福新政最突出的特点是',
      desc: '想想分类台上那五类措施，都是谁在出手。',
      options: ['加强国家对经济的干预和指导', '让市场完全自由，政府不管', '废除资本主义制度', '把所有工厂收归国有'],
      answer: 0,
      hint: '整顿银行、调整工农业、兴建公共工程，都是政府在做。',
      explain: '新政的特点是<b>加强国家对经济的干预和指导</b>。“政府不管”恰恰是新政要改变的做法；新政没有废除资本主义制度，也没有把工厂全部收归国有。'
    },
    {
      level: 'base',
      title: '在世界反法西斯战争中，中国战场的地位是',
      desc: '把中国抗战放到世界大战里看。',
      options: ['世界反法西斯战争的东方主战场', '欧洲第二战场', '太平洋战争的唯一战场', '与世界大战没有联系的局部战场'],
      answer: 0,
      hint: '中国牵制和抗击了大量日军，位置在世界的东方。',
      explain: '中国战场是<b>世界反法西斯战争的东方主战场</b>。欧洲第二战场是 1944 年诺曼底登陆开辟的；太平洋战场主要是美日交战；中国抗战和世界反法西斯战争紧密相连。'
    },
    {
      level: 'mid',
      title: '比较“不干预”和“国家干预”',
      desc: '先在<b>不干预</b>状态下推到第 2 轮循环，再切到<b>国家干预</b>，把四环都修好。',
      label: '在连锁反应推进器里操作',
      button: '检查',
      check: function () {
        if (!sawRound2) return { ok: false, msg: '先选“不干预”，一直推到左下角显示“第 2 轮”。' };
        if (mode !== 'deal') return { ok: false, msg: '看到恶性循环了。现在切到“国家干预（罗斯福新政）”。' };
        if (step < DEAL_MAX) return { ok: false, msg: '继续按“修下一环”，现在修好了 ' + step + ' / ' + DEAL_MAX + '。' };
        return { ok: true, msg: '不干预时，圈越转越糟；政府从金融、工业、就业、保障几处同时出手，才缓和了危机。' };
      }
    },
    {
      level: 'mid',
      title: '把五项新政措施全部归类',
      desc: '在“罗斯福新政分类台”里，给每项措施选对类别。',
      label: '在新政分类台里操作',
      button: '检查分类',
      check: function () {
        var n = dealCount();
        if (n === MEASURES.length) return { ok: true, msg: '金融、工业、农业、以工代赈、社会保障，五类都对。考试常问某项措施属于哪一方面。' };
        return { ok: false, msg: '现在归对了 ' + n + ' / ' + MEASURES.length + ' 项，继续。先看措施针对的是谁：银行、工厂、农民、失业者，还是所有需要保障的人。' };
      }
    },
    {
      level: 'mid',
      title: '被称为二战重要转折点的战役是',
      desc: '可以把时间轴拖到 1942 年 7 月看一看。',
      options: ['斯大林格勒战役', '诺曼底登陆', '偷袭珍珠港', '德国突袭波兰'],
      answer: 0,
      hint: '这场战役之后，苏军由防御转入反攻。',
      explain: '<b>斯大林格勒战役</b>（1942 年 7 月—1943 年 2 月）是苏德战场的转折点，也是二战的重要转折点。诺曼底登陆是开辟第二战场；偷袭珍珠港引发太平洋战争；突袭波兰是战争全面爆发。'
    },
    {
      level: 'trap',
      title: '世界反法西斯同盟正式形成的标志是',
      desc: '小心两个名字很像的东西。',
      options: ['1942 年签署《联合国家宣言》', '1945 年联合国成立', '1941 年太平洋战争爆发', '1938 年慕尼黑协定'],
      answer: 0,
      hint: '同盟要在打仗的时候结成，战争还没结束。',
      explain: '<b>1942 年 1 月《联合国家宣言》</b>标志同盟形成。联合国是 1945 年战争快结束时才成立的国际组织，两者不要混。太平洋战争爆发是同盟形成的背景；慕尼黑协定是绥靖政策的顶点。'
    },
    {
      level: 'trap',
      title: '关于罗斯福新政，下列说法正确的是',
      desc: '这是这一课最常见的坑。',
      options: ['缓和了危机，但没有改变资本主义制度', '彻底消除了资本主义的经济危机', '改变了美国的资本主义制度', '使美国走上了法西斯道路'],
      answer: 0,
      hint: '新政是在原有制度内部做的调整。',
      explain: '新政缓和了危机，是资本主义制度内部的<b>调整</b>，制度本身没变，经济危机也没有被彻底消除。美国没有走上法西斯道路，走这条路的是德国、日本和意大利。'
    }
  ]);
})();
