/* 历史互动馆 · 第 21 课 第一次工业革命与马克思主义 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();
  var NOW = 2026;
  var INK = '#4a3a32', MUTE = '#8a7a70', RED = '#a4492b', BROWN = '#7d4d3c', BG = '#fbf6ef';

  /* ========== 发明链 ========== */
  var INV = [
    { n: '珍妮机', who: '哈格里夫斯', yr: '1765 年前后', x: 70, y: 56, solve: '织布变快以后，棉纱不够用了。', need: '纱多了，机器也越来越多，需要比人力更强的动力。', t: '英国织工哈格里夫斯发明的纺纱机，一个人能同时纺多根纱，大大提高了效率。工业革命就从棉纺织业开始。', edge: '缺动力' },
    { n: '瓦特蒸汽机', who: '瓦特', yr: '1785 年投入使用', x: 200, y: 56, solve: '水力要靠河流，工厂只能建在河边。', need: '工厂多了，原料和产品都要运，水路陆路都要更快。', t: '瓦特改良的蒸汽机 1785 年投入使用，开始用于纺织等行业。工厂不必再依赖河流，人类进入蒸汽时代。', edge: '缺运力' },
    { n: '汽船', who: '富尔顿', yr: '1807 年', x: 330, y: 56, solve: '帆船要看风，水上运输不稳定。', need: '水路通了，可陆路还靠马车，也要变快。', t: '美国人富尔顿发明的汽船试航成功，把蒸汽动力用到水上，水上运输不必再靠风力。', edge: '陆路慢' },
    { n: '蒸汽机车', who: '史蒂芬孙', yr: '1814 年', x: 268, y: 170, solve: '陆上马车运量小、速度慢。', need: '机车要跑得好，还需要专门修筑的铁路。', t: '英国人史蒂芬孙发明了蒸汽机车，陆路运输开始用上蒸汽动力。', edge: '要铁轨' },
    { n: '第一条铁路', who: '英国', yr: '1825 年', x: 132, y: 170, solve: '机车有了专门的轨道，运输能力大增。', need: '这一环带动了炼铁、采煤等行业，也加快了人员和货物流动。', t: '1825 年，世界上第一条铁路在英国通车。此后铁路迅速发展，工业革命走向深入。', edge: '' }
  ];
  var inv = Math.round(L.num(st.i, 0, 0, INV.length - 1)), visited = {};
  visited[inv] = true;
  var chain = L.$('#chain');
  function setInv(i) { inv = i; visited[i] = true; renderChain(); }
  function drawChain() {
    chain.innerHTML = '';
    S('rect', { x: 0, y: 0, width: 400, height: 248, rx: 14, fill: BG }, chain);
    S('text', { x: 14, y: 22, 'font-size': 11, fill: MUTE, text: '顺着箭头走：上一环的新需求，逼出下一环' }, chain);
    /* 连线 */
    var W = 96, H = 56;
    INV.forEach(function (it, i) {
      if (i === INV.length - 1) return;
      var nx = INV[i + 1], lit = i < inv, x1, y1, x2, y2;
      if (it.y === nx.y) { x1 = it.x + (nx.x > it.x ? W / 2 : -W / 2); x2 = nx.x - (nx.x > it.x ? W / 2 : -W / 2); y1 = y2 = it.y; }
      else { x1 = it.x - 18; y1 = it.y + H / 2; x2 = nx.x + 18; y2 = nx.y - H / 2; }
      L.arrow(chain, x1, y1, x2, y2, { color: lit ? RED : '#cdb7a8', width: lit ? 2.4 : 1.6, head: 8 });
      var lx = (x1 + x2) / 2, ly = (y1 + y2) / 2, flat = it.y === nx.y;
      S('text', { x: lx + (flat ? 0 : 24), y: flat ? ly - 8 : ly + 4, 'text-anchor': 'middle', 'font-size': 9.5, fill: lit ? RED : MUTE, 'font-weight': lit ? 700 : 500, text: it.edge, stroke: BG, 'stroke-width': 3, 'paint-order': 'stroke' }, chain);
    });
    INV.forEach(function (it, i) {
      var on = i === inv, seen = !!visited[i];
      var g = S('g', { class: 'svg-hit', tabindex: 0, role: 'button', 'aria-label': it.n }, chain);
      S('rect', { x: it.x - W / 2, y: it.y - H / 2, width: W, height: H, rx: 11, fill: on ? BROWN : (seen ? '#f6e4da' : '#fff'), stroke: on ? BROWN : (seen ? RED : '#cdb7a8'), 'stroke-width': on ? 2 : 1.4 }, g);
      S('text', { x: it.x, y: it.y - 5, 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: on ? '#fff' : INK, text: it.n }, g);
      S('text', { x: it.x, y: it.y + 9, 'text-anchor': 'middle', 'font-size': 10, fill: on ? '#f3e4da' : MUTE, text: it.who }, g);
      S('text', { x: it.x, y: it.y + 22, 'text-anchor': 'middle', 'font-size': 9.5, fill: on ? '#f3e4da' : MUTE, text: it.yr }, g);
      g.addEventListener('click', function () { setInv(i); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setInv(i); } });
    });
    var seen = Object.keys(visited).length;
    S('text', { x: 200, y: 232, 'text-anchor': 'middle', 'font-size': 11, fill: BROWN, 'font-weight': 600, text: '已看 ' + seen + ' / ' + INV.length + ' 环' }, chain);
  }
  function renderChain() {
    var it = INV[inv];
    L.$('#inv-name').textContent = it.n;
    L.$('#inv-badge').textContent = it.yr;
    L.$('#inv-solve').textContent = it.solve;
    L.$('#inv-need').textContent = it.need;
    L.$('#inv-text').textContent = it.t;
    L.$('#chain-next').textContent = inv === INV.length - 1 ? '从头再走' : '下一环';
    L.$$('#inv-table tbody tr').forEach(function (tr) { tr.classList.toggle('on', +tr.dataset.i === inv); });
    drawChain();
    save();
  }
  L.$('#chain-next').addEventListener('click', function () { setInv(inv === INV.length - 1 ? 0 : inv + 1); });
  L.$('#chain-reset').addEventListener('click', function () { visited = {}; setInv(0); });

  /* ========== 手工工场与工厂 ========== */
  var DIMS = [
    { id: 'power', n: '动力', a: '以人力为主', b: '蒸汽机等机器动力' },
    { id: 'tool', n: '工具', a: '手工工具', b: '成排的机器' },
    { id: 'place', n: '规模', a: '规模有限', b: '规模大，可以集中到城市' },
    { id: 'people', n: '工人', a: '手工艺人分工合作', b: '工人跟着机器和时钟干活' },
    { id: 'out', n: '产量', a: '比较有限', b: '大幅提高' }
  ];
  var facT = st.m === 'b' ? 'b' : 'a';
  var dim = DIMS.filter(function (d) { return d.id === st.d; })[0] ? st.d : 'power';
  var fSvg = L.$('#fac');
  function drawFac() {
    fSvg.innerHTML = '';
    S('rect', { x: 0, y: 0, width: 400, height: 214, rx: 14, fill: BG }, fSvg);
    var hi = function (id) { return dim === id ? RED : BROWN; };
    S('rect', { x: 14, y: 46, width: 372, height: 128, rx: 10, fill: '#fff', stroke: dim === 'place' ? RED : '#cdb7a8', 'stroke-width': dim === 'place' ? 2.4 : 1.4 }, fSvg);
    if (facT === 'a') {
      S('text', { x: 200, y: 30, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: INK, text: '手工工场：工人靠双手和工具' }, fSvg);
      [70, 150, 230, 310].forEach(function (x, i) {
        /* 工人（圆头 + 身体）与工作台 */
        S('circle', { cx: x, cy: 76, r: 8, fill: hi('people') }, fSvg);
        S('path', { d: 'M' + (x - 10) + ' 106v-10a10 10 0 0 1 20 0v10z', fill: hi('people') }, fSvg);
        S('rect', { x: x - 22, y: 112, width: 44, height: 8, rx: 2, fill: '#c9a26d' }, fSvg);
        S('line', { x1: x + 8, y1: 95, x2: x + 18, y2: 110, stroke: hi('tool'), 'stroke-width': dim === 'tool' ? 3.4 : 2 }, fSvg);
        S('text', { x: x, y: 140, 'text-anchor': 'middle', 'font-size': 10.5, fill: MUTE, text: ['工序一', '工序二', '工序三', '工序四'][i] }, fSvg);
        if (i < 3) L.arrow(fSvg, x + 26, 116, x + 52, 116, { color: '#b9a89c', width: 1.4, head: 6 });
      });
      S('text', { x: 200, y: 162, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': dim === 'power' ? 700 : 500, fill: dim === 'power' ? RED : MUTE, text: '动力以人力为主' }, fSvg);
    } else {
      S('text', { x: 200, y: 30, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: INK, text: '工厂：一台动力带动整排机器' }, fSvg);
      S('rect', { x: 28, y: 68, width: 62, height: 84, rx: 8, fill: hi('power') }, fSvg);
      S('text', { x: 59, y: 106, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: '#fff', text: '蒸汽' }, fSvg);
      S('text', { x: 59, y: 122, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: '#fff', text: '机' }, fSvg);
      S('line', { x1: 90, y1: 74, x2: 372, y2: 74, stroke: hi('power'), 'stroke-width': 3 }, fSvg);
      [130, 192, 254, 316].forEach(function (x) {
        S('line', { x1: x, y1: 74, x2: x, y2: 96, stroke: hi('power'), 'stroke-width': 1.8 }, fSvg);
        S('rect', { x: x - 22, y: 96, width: 44, height: 26, rx: 4, fill: dim === 'tool' ? '#f6e4da' : '#f1ece6', stroke: hi('tool'), 'stroke-width': dim === 'tool' ? 2.2 : 1.3 }, fSvg);
        S('circle', { cx: x, cy: 109, r: 7, fill: 'none', stroke: hi('tool'), 'stroke-width': 1.5 }, fSvg);
        S('circle', { cx: x, cy: 135, r: 5, fill: hi('people') }, fSvg);
        S('path', { d: 'M' + (x - 7) + ' 155v-7a7 7 0 0 1 14 0v7z', fill: hi('people') }, fSvg);
      });
    }
    var d = DIMS.filter(function (x) { return x.id === dim; })[0];
    S('text', { x: 200, y: 198, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: RED, text: d.n + '：' + (facT === 'a' ? d.a : d.b) }, fSvg);
  }
  function renderFac() {
    var d = DIMS.filter(function (x) { return x.id === dim; })[0];
    L.$('#fac-name').textContent = facT === 'a' ? '手工工场' : '工厂';
    L.$('#fac-badge').textContent = facT === 'a' ? '靠手和工具' : '靠机器和动力';
    L.$('#dim-label').textContent = d.n;
    L.$('#dim-val').textContent = facT === 'a' ? d.a : d.b;
    L.$$('#dim-body tr').forEach(function (tr) { tr.classList.toggle('on', tr.dataset.d === dim); });
    drawFac();
    save();
  }
  DIMS.forEach(function (d) {
    var tr = L.html('tr', {}, L.$('#dim-body'));
    tr.dataset.d = d.id;
    L.html('td', { text: d.n }, tr);
    L.html('td', { text: d.a }, tr);
    L.html('td', { text: d.b }, tr);
  });
  L.chips(L.$('#fac-chips'), [{ label: '手工工场', value: 'a' }, { label: '工厂', value: 'b' }], facT, function (v) { facT = v; renderFac(); });
  L.chips(L.$('#dim-chips'), DIMS.map(function (d) { return { label: d.n, value: d.id }; }), dim, function (v) { dim = v; renderFac(); });

  /* ========== 工人运动与马克思主义时间轴 ========== */
  var EVENTS = [
    { id: 'ly', y: 1831, label: '里昂工人起义', note: '法国里昂的工人举行起义，是欧洲早期工人运动之一。' },
    { id: 'xz', y: 1836, label: '宪章运动开始', note: '英国工人发起宪章运动，要求获得政治权利，一直持续到 1848 年。' },
    { id: 'xl', y: 1844, label: '西里西亚起义', note: '德意志西里西亚的纺织工人举行起义。三次工人运动都缺少科学理论的指导。' },
    { id: 'tm', y: 1847, label: '共产主义者同盟', note: '马克思、恩格斯参与创建共产主义者同盟，并受委托起草它的纲领。' },
    { id: 'gc', y: 1848, label: '《共产党宣言》', note: '马克思和恩格斯合著的《共产党宣言》发表，标志着马克思主义诞生。' },
    { id: 'gj', y: 1864, label: '第一国际', note: '国际工人协会（第一国际）在伦敦成立，马克思是它的实际领导者之一。' },
    { id: 'zb', y: 1867, label: '《资本论》第一卷', note: '马克思的《资本论》第一卷出版，揭示了资本主义剥削的秘密。' },
    { id: 'pl', y: 1871, label: '巴黎公社', note: '巴黎人民起义并建立巴黎公社，这是世界上第一个无产阶级政权，前后存在 72 天。公社失败后，公社委员鲍狄埃写下了《国际歌》的歌词。' },
    { id: 'js', y: 1876, label: '第一国际解散', note: '第一国际宣布解散，但它传播了马克思主义，促进了各国工人的联合。' }
  ];
  var year = Math.round(L.num(st.y, 1848, 1830, 1880));
  var tl = L.$('#tl'), yIn = L.$('#year-in');
  function nearest(y) {
    var best = null;
    EVENTS.forEach(function (e) { if (Math.abs(e.y - y) <= 1 && (!best || Math.abs(e.y - y) < Math.abs(best.y - y))) best = e; });
    return best;
  }
  function drawTL() {
    var ev = nearest(year);
    var ax = L.timeline(tl, {
      from: 1830, to: 1880, step: 10,
      era: [{ from: 1831, to: 1847, label: '工人运动兴起', color: '#ead8c6' }, { from: 1848, to: 1876, label: '理论诞生与实践', color: '#f0d9cc' }],
      events: EVENTS.map(function (e) { var on = ev && ev.id === e.id; return { id: e.id, y: e.y, label: e.label, on: on, color: on ? RED : BROWN }; }),
      pick: function (id) { setYear(EVENTS.filter(function (x) { return x.id === id; })[0].y); }
    });
    /* 文字放到引线之上，游标放到事件之下 */
    L.$$('text', ax.layer).forEach(function (t) { ax.layer.appendChild(t); });
    var x = ax.X(year);
    tl.insertBefore(S('line', { x1: x, y1: 8, x2: x, y2: ax.base + 50, stroke: '#c2603f', 'stroke-width': 1.6, 'stroke-dasharray': '4 3' }), ax.layer);
    S('path', { d: 'M' + (x - 6) + ' 4h12l-6 8z', fill: '#c2603f' }, tl);
  }
  function setYear(y) { year = y; yIn.value = y; L.paintRange(yIn); renderTL(); }
  function renderTL() {
    drawTL();
    var ev = nearest(year);
    L.$('#year-out').textContent = L.yr(year);
    L.$('#r-badge').textContent = L.century(year);
    L.$('#r-ago').innerHTML = L.span(year, NOW) + '<small>年前</small>';
    L.$('#r-event').textContent = ev ? (ev.y === year ? '' : '约 ' + ev.y + ' 年：') + ev.label : '这一年没有课本大事';
    var t;
    if (ev) t = ev.note;
    else if (year < 1848) t = '工业革命继续推进，工人的处境很艰难，工人运动开始出现。';
    else if (year < 1864) t = '马克思主义已经诞生，正在工人中传播，各国工人还缺少国际性的组织。';
    else t = '工人有了国际性的组织，马克思主义指导下的实践不断展开。';
    L.$('#r-text').textContent = t;
    save();
  }
  L.bindRange(yIn, function (v) { year = v; renderTL(); });
  yIn.value = year; L.paintRange(yIn);

  /* 排序 */
  var ordOk = null;
  var ordCtl = L.order(L.$('#ord'), [
    { label: '法国里昂工人起义', y: 1831 },
    { label: '《共产党宣言》发表', y: 1848 },
    { label: '第一国际成立', y: 1864 },
    { label: '巴黎公社建立', y: 1871 }
  ], function (ok) {
    ordOk = ok;
    L.$('#ord-msg').textContent = ok ? '排对了：先有工人反抗，再有理论，接着有组织，然后有政权。' : '顺序有误，看看每一项右边的年份，再按“重新排”。';
  });
  L.$('#ord-reset').addEventListener('click', function () { ordCtl.reset(); ordOk = null; L.$('#ord-msg').textContent = ''; });

  function save() { L.setState({ i: inv, m: facT, d: dim, y: year }); }

  renderChain();
  renderFac();
  renderTL();

  /* ========== 课本逐课要点（顺序对应新教材九上第 19～22 课） ========== */
  L.keypoints('#keypoints', [
    '18 世纪 60 年代首先在<b>英国的棉纺织业</b>开始；哈格里夫斯发明珍妮机；瓦特改良的蒸汽机 1785 年投入使用，进入<b>蒸汽时代</b>；富尔顿汽船（1807）、史蒂芬孙蒸汽机车（1814）、1825 年第一条铁路通车。工厂成为主要生产组织形式，形成<b>工业资产阶级和工业无产阶级</b>。',
    '里昂工人起义、英国宪章运动、西里西亚纺织工人起义缺少科学理论指导；1848 年马克思、恩格斯发表<b>《共产党宣言》</b>，标志<b>马克思主义诞生</b>，号召“全世界无产者，联合起来！”',
    '1864 年<b>第一国际</b>在伦敦成立，马克思是实际领导者之一；1871 年<b>巴黎公社</b>建立，是世界上第一个无产阶级政权，存在 72 天，公职人员由选举产生、可随时撤换。',
    '活动课：了解《国际歌》诞生于巴黎公社失败之后（公社委员鲍狄埃作词，后由狄盖特谱曲）；可以朗读、学唱歌词，结合巴黎公社和《共产党宣言》说一说歌词表达了怎样的思想和精神。'
  ]);

  /* ========== 大题训练 ========== */
  L.essay('#essay', {
    title: '马克思主义的诞生与国际工人运动',
    materials: [
      { label: '材料一', text: '资产阶级的灭亡和无产阶级的胜利是同样不可避免的。……全世界无产者，联合起来！', src: '——马克思、恩格斯《共产党宣言》（1848 年）' },
      { label: '材料二', text: '起来，饥寒交迫的奴隶！起来，全世界受苦的人！', src: '——《国际歌》中文歌词（原作者为巴黎公社委员鲍狄埃）' }
    ],
    parts: [
      {
        ask: '(1) 根据材料一，概括《共产党宣言》的主要观点，并指出它的发表有什么意义。', score: 4, type: 'sum',
        points: [
          { t: '资产阶级必然灭亡、无产阶级必然胜利（资本主义必然灭亡、社会主义必然胜利）', s: 1 },
          { t: '号召全世界无产者联合起来', s: 1 },
          { t: '标志着马克思主义诞生', s: 1 },
          { t: '为无产阶级的斗争提供了科学理论指导', s: 1 }
        ],
        model: '观点：资产阶级的灭亡和无产阶级的胜利是同样不可避免的；号召全世界无产者联合起来。意义：1848 年《共产党宣言》发表，标志着马克思主义诞生，国际工人运动从此有了科学理论的指导。'
      },
      {
        ask: '(2) 材料二的歌词诞生于哪一事件之后？结合所学，用史实说明马克思主义诞生后国际工人运动的发展。', score: 4, type: 'fact',
        points: [
          { t: '诞生于巴黎公社失败之后（1871 年）', s: 1 },
          { t: '1864 年第一国际在伦敦成立，马克思是实际领导者之一', s: 1 },
          { t: '第一国际传播马克思主义，促进各国工人联合', s: 1 },
          { t: '1871 年巴黎公社建立，是世界上第一个无产阶级政权', s: 1 }
        ],
        model: '《国际歌》歌词诞生于 1871 年巴黎公社失败之后。马克思主义诞生后，1864 年国际工人协会（第一国际）在伦敦成立，马克思是实际领导者之一，它传播了马克思主义，促进了各国工人的联合；1871 年巴黎人民建立巴黎公社，这是世界上第一个无产阶级政权，是无产阶级建立政权的伟大尝试。'
      },
      {
        ask: '(3) 围绕“工业革命与马克思主义的诞生”，自拟一个观点，结合史实加以阐述。（要求：观点正确，史论结合，条理清楚）', score: 8, type: 'essay',
        points: [
          { t: '观点明确、正确，如“工业革命为马克思主义的诞生准备了条件”', s: 2 },
          { t: '用工业革命带来的社会变化论证（工厂、两大对立阶级、工人生活困苦）', s: 2 },
          { t: '用工人运动和《共产党宣言》论证（三大工人运动缺少理论指导，1848 年宣言发表）', s: 2 },
          { t: '有结论回扣观点，条理清楚（可提到理论指导第一国际、巴黎公社的实践）', s: 2 }
        ],
        model: '观点：工业革命为马克思主义的诞生准备了条件。论证：18 世纪 60 年代工业革命从英国开始，工厂成为主要生产组织形式，社会形成工业资产阶级和工业无产阶级两大对立阶级，工人工作时间长、工资低。法国里昂工人起义、英国宪章运动、德意志西里西亚纺织工人起义相继发生，却都缺少科学理论的指导。马克思和恩格斯总结工人运动的经验，1848 年发表《共产党宣言》，马克思主义诞生。结论：马克思主义是工业革命后阶级矛盾和工人运动发展的产物，它又指导了第一国际和巴黎公社的实践。'
      }
    ]
  });

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '找到让工厂不必再靠近河流的那一环',
      desc: '在发明链里点开它，看“解决了什么问题”。',
      label: '在发明链里操作',
      button: '检查我点的发明',
      check: function () {
        if (inv === 1) return { ok: true, msg: '瓦特改良的蒸汽机提供了不依赖河流的动力，工厂可以建到城市，人类进入蒸汽时代。' };
        return { ok: false, msg: '“' + INV[inv].n + '”解决的是：' + INV[inv].solve + ' 再找找解决动力问题的那一环。' };
      }
    },
    {
      level: 'base',
      title: '标志着马克思主义诞生的是',
      desc: '可以在时间轴上找一找 1848 年。',
      options: ['《共产党宣言》发表', '《资本论》第一卷出版', '第一国际成立', '巴黎公社建立'],
      answer: 0,
      hint: '“诞生”要看最早系统阐述这一理论的文献。',
      explain: '1848 年<b>《共产党宣言》发表</b>标志马克思主义诞生。《资本论》第一卷 1867 年才出版；第一国际是工人组织；巴黎公社是政权实践。'
    },
    {
      level: 'base',
      title: '第一次工业革命最早开始于',
      desc: '要同时答对国家和行业。',
      options: ['英国的棉纺织业', '英国的钢铁业', '美国的棉纺织业', '法国的交通运输业'],
      answer: 0,
      hint: '回到发明链，看第一环是什么机器。',
      explain: '工业革命 18 世纪 60 年代首先在<b>英国的棉纺织业</b>开始，第一环就是珍妮机。钢铁业不是它的起点；美国、法国都晚于英国。'
    },
    {
      level: 'mid',
      title: '看工厂的动力从哪里来',
      desc: '在对比图里切换到“工厂”，并选择“动力”这个角度。',
      label: '在工厂对比图里操作',
      button: '检查',
      check: function () {
        if (facT !== 'b') return { ok: false, msg: '先切换到“工厂”。' };
        if (dim !== 'power') return { ok: false, msg: '再把角度选成“动力”。' };
        return { ok: true, msg: '一台蒸汽机通过传动装置带动整排机器，这正是手工工场做不到的。' };
      }
    },
    {
      level: 'mid',
      title: '把四件事从早到晚排好',
      desc: '在“排一排”里依次点击。排错了就按“重新排”。',
      label: '在排序题里操作',
      button: '检查顺序',
      check: function () {
        if (ordOk === true) return { ok: true, msg: '里昂工人起义（1831）→《共产党宣言》（1848）→第一国际（1864）→巴黎公社（1871）。' };
        if (ordOk === false) return { ok: false, msg: '顺序不对，按“重新排”再来一次。' };
        return { ok: false, msg: '还没排完，四项都要点到。' };
      }
    },
    {
      level: 'mid',
      title: '工业革命后，社会逐渐形成的两大对立阶级是',
      desc: '想想工厂里谁拥有机器，谁靠工资生活。',
      options: ['工业资产阶级和工业无产阶级', '地主阶级和农民阶级', '奴隶主阶级和奴隶阶级', '贵族和僧侣'],
      answer: 0,
      hint: '这两个阶级都和“工业”有关。',
      explain: '工厂主是<b>工业资产阶级</b>，工人是<b>工业无产阶级</b>。地主和农民属于封建社会；奴隶主和奴隶属于奴隶社会；贵族和僧侣是旧等级。'
    },
    {
      level: 'trap',
      title: '关于蒸汽机，下列说法正确的是',
      desc: '注意看动词。',
      options: ['瓦特改良了蒸汽机，改良后的蒸汽机 1785 年投入使用', '蒸汽机是瓦特最早发明的', '瓦特改良蒸汽机之后才有了珍妮机', '蒸汽机最早用于驱动飞机'],
      answer: 0,
      hint: '在瓦特之前，已经有人造出蒸汽机了。',
      explain: '瓦特是<b>改良</b>，不是最早发明。珍妮机出现在 1765 年前后，比瓦特蒸汽机投入使用更早；飞机是后来第二次工业革命时期的事。'
    },
    {
      level: 'trap',
      title: '巴黎公社的地位，正确的说法是',
      desc: '“第一个”后面跟什么，要看清楚。',
      options: ['世界上第一个无产阶级政权', '世界上第一个社会主义国家', '世界上第一个国际工人组织', '第一个资产阶级共和国'],
      answer: 0,
      hint: '公社只存在了 72 天，是一次政权的尝试。',
      explain: '巴黎公社是<b>第一个无产阶级政权</b>。第一个社会主义国家要到十月革命以后才出现；国际工人组织说的是第一国际；它也不是资产阶级政权。'
    }
  ]);
})();
