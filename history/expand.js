/* 历史互动馆 · 第 22 课 殖民地人民的反抗与资本主义扩展 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();
  var NOW = 2026;

  /* ========== 横向时间轴：世界与中国 ========== */
  var C_WORLD = '#7d4d3c', C_WORLD_ON = '#a4492b', C_CN = '#2f6470', C_CN_ON = '#1d4c57';
  var EVENTS = [
    { id: 'perry', y: 1853, label: '美舰叩关日本', note: '美国舰队开到日本，用武力迫使日本打开国门，日本的民族危机加深。' },
    { id: 'india', y: 1857, label: '印度民族大起义', note: '印度人民反抗英国殖民统治的大起义爆发，坚持到 1859 年失败。' },
    { id: 'yuan', y: 1860, label: '火烧圆明园', cn: true, note: '第二次鸦片战争（1856—1860 年）中，英法联军洗劫并焚毁了圆明园。' },
    { id: 'ru', y: 1861, label: '俄国废除农奴制', note: '沙皇亚历山大二世签署法令，废除农奴制。' },
    { id: 'uswar', y: 1861, label: '美国内战爆发', note: '南方挑起内战，林肯领导北方作战。' },
    { id: 'yangwu', y: 1861, label: '洋务运动兴起', cn: true, note: '19 世纪 60 年代起，洋务派以“自强”“求富”为口号，学习西方技术，兴办近代工业。' },
    { id: 'decl', y: 1862, label: '解放黑人奴隶宣言', note: '林肯政府颁布《宅地法》和《解放黑人奴隶宣言》，北方战局逐渐好转。' },
    { id: 'tp', y: 1864, label: '太平天国运动失败', cn: true, note: '天京陷落，太平天国运动失败。' },
    { id: 'usend', y: 1865, label: '美国内战结束', note: '北方取得胜利，国家统一得到维护，黑人奴隶制被废除。' },
    { id: 'meiji', y: 1868, label: '明治维新开始', note: '倒幕派推翻幕府统治，明治天皇建立新政府，开始改革。' },
    { id: 'han', y: 1871, label: '废藩置县', note: '日本废除各地的藩，改设府县，官员由中央任命，加强了中央集权。' }
  ];
  var year = Math.round(L.num(st.y, 1861, 1850, 1875));
  var tl = L.$('#tl'), yIn = L.$('#year-in');

  /* 某一组（世界/中国）里离这一年最近的事件；同一年有几件就全返回 */
  function near(y, cn) {
    var best = 99, out = [];
    EVENTS.forEach(function (e) {
      if (!!e.cn !== cn) return;
      var d = Math.abs(e.y - y);
      if (d > 2) return;
      if (d < best) { best = d; out = [e]; } else if (d === best) out.push(e);
    });
    return out;
  }
  function decade(y) { return L.century(y) + ' ' + (Math.floor(y % 100 / 10) * 10) + ' 年代'; }
  function drawTL() {
    var on = near(year, false).concat(near(year, true)).map(function (e) { return e.id; });
    var ax = L.timeline(tl, {
      from: 1850, to: 1875, step: 5,
      era: [
        { from: 1857, to: 1859, label: '', color: '#efe3d6' },
        { from: 1861, to: 1865, label: '美国内战', color: '#ead8c6' },
        { from: 1868, to: 1875, label: '明治维新 →', color: '#e6d3c0' }
      ],
      events: EVENTS.map(function (e) {
        var hit = on.indexOf(e.id) >= 0;
        return { id: e.id, y: e.y, label: e.label, on: hit, color: e.cn ? (hit ? C_CN_ON : C_CN) : (hit ? C_WORLD_ON : C_WORLD) };
      }),
      pick: function (id) { var e = EVENTS.filter(function (x) { return x.id === id; })[0]; setYear(e.y); }
    });
    var x = ax.X(year);
    S('line', { x1: x, y1: 8, x2: x, y2: ax.base + 50, stroke: '#c2603f', 'stroke-width': 1.6, 'stroke-dasharray': '4 3' }, tl);
    S('path', { d: 'M' + (x - 6) + ' 4h12l-6 8z', fill: '#c2603f' }, tl);
    /* 图例放右上角 */
    S('circle', { cx: 300, cy: 14, r: 4.5, fill: C_WORLD }, tl);
    S('text', { x: 308, y: 18, 'font-size': 11, fill: C_WORLD, text: '世界' }, tl);
    S('circle', { cx: 346, cy: 14, r: 4.5, fill: C_CN }, tl);
    S('text', { x: 354, y: 18, 'font-size': 11, fill: C_CN, text: '中国' }, tl);
  }
  function setYear(y) { year = y; yIn.value = year; L.paintRange(yIn); render(); }
  function listText(arr) {
    if (!arr.length) return '这两年课本里没有大事';
    return arr.map(function (e) { return (e.y === year ? '' : L.yr(e.y) + '：') + e.label; }).join('；');
  }
  function render() {
    drawTL();
    var w = near(year, false), c = near(year, true);
    L.$('#year-out').textContent = L.yr(year);
    L.$('#dec-badge').textContent = decade(year);
    L.$('#r-cent').textContent = L.century(year);
    L.$('#r-ago').innerHTML = L.span(year, NOW) + '<small>年前</small>';
    L.$('#r-world').textContent = listText(w);
    L.$('#r-cn').textContent = listText(c);
    var t = w.concat(c).map(function (e) { return e.note; }).join(' ');
    if (year === 1861) t += ' <b>1861 年是本课的“交汇点”</b>：俄国、美国、中国同一年都有大事发生。';
    else if (!t) t = '拖到 1861 年附近看看，那几年世界和中国都特别“热闹”。';
    L.$('#r-text').innerHTML = t;
    save();
  }
  L.bindRange(yIn, function (v) { year = v; render(); });
  yIn.value = year; L.paintRange(yIn);

  /* ========== 三场变革对比器 ========== */
  var RF = [
    {
      k: 'ru', n: '俄国', full: '俄国 1861 年改革', time: '1861 年', bar: '农奴制', way: '自上而下改革', who: '沙皇亚历山大二世',
      bg: '19 世纪中期，俄国还实行农奴制，农奴被拴在地主的土地上，工厂招不到自由劳动力。克里米亚战争（1853—1856 年）失败暴露了俄国的落后，各地农民不断反抗，沙皇决定改革。',
      ms: '1861 年，亚历山大二世签署法令，宣布<b>废除农奴制</b>：农奴获得人身自由，可以自由出卖劳动力；农民可以赎买一块份地，但要交很高的赎金。',
      rs: '大量自由劳动力进入工厂，俄国走上了<b>资本主义发展道路</b>。',
      lim: '改革是沙皇为了维护统治搞的，保留了<b>大量农奴制残余</b>，农民负担仍然很重。'
    },
    {
      k: 'us', n: '美国', full: '美国内战', time: '1861—1865 年', bar: '黑人奴隶制', way: '南北内战', who: '总统林肯',
      bg: '北方发展资本主义工商业，需要自由劳动力、原料和国内市场；南方是使用黑人奴隶的种植园经济。<b>两种经济制度的矛盾</b>越来越尖锐。1860 年林肯当选总统，1861 年南方挑起内战。',
      ms: '1862 年，林肯政府颁布《宅地法》和<b>《解放黑人奴隶宣言》</b>，调动了农民和黑人的积极性，北方逐渐扭转战局；1865 年北方取得胜利。',
      rs: '维护了国家统一，<b>废除了黑人奴隶制</b>，为资本主义经济迅速发展扫清了障碍。它被看作美国的第二次资产阶级革命。',
      lim: '奴隶制虽然废除了，黑人在社会上仍然长期受到<b>种族歧视</b>。'
    },
    {
      k: 'jp', n: '日本', full: '日本明治维新', time: '1868 年起', bar: '幕府统治', way: '自上而下改革', who: '明治天皇与新政府',
      bg: '19 世纪中期，日本由幕府统治，实行闭关锁国，等级森严。1853 年美国舰队用武力打开日本国门，民族危机加深。倒幕派推翻幕府，1868 年明治天皇建立新政府。',
      ms: '政治上<b>废藩置县</b>，加强中央集权；经济上允许土地买卖、改革税制、推行<b>殖产兴业</b>；社会生活上提倡<b>文明开化</b>，大力发展近代教育。',
      rs: '日本走上发展资本主义的道路，逐渐成为<b>亚洲强国</b>，摆脱了沦为殖民地的危机。',
      lim: '保留了<b>大量封建残余</b>，后来走上了<b>对外侵略扩张</b>的道路。'
    }
  ];
  var ASP = [{ value: 'bg', label: '背景' }, { value: 'ms', label: '措施' }, { value: 'rs', label: '结果' }, { value: 'lim', label: '局限' }];
  var cur = Math.round(L.num(st.c, 0, 0, 2));
  var asp = ASP.some(function (a) { return a.value === st.a; }) ? st.a : 'bg';
  var cleared = [0, 1, 2].map(function (i) { return (st.k || '').charAt(i) === '1'; });
  var fall = cleared.map(function (c) { return c ? 1 : 0; });   // 石头被搬走的动画进度
  var rfAnim = null, rf = L.$('#rf');
  var COLX = [70, 200, 330];

  function rbox(g, x, y, w, h, label, sub, o) {
    o = o || {};
    S('rect', { x: x - w / 2, y: y - h / 2, width: w, height: h, rx: 9, fill: o.fill || '#fff', stroke: o.stroke || '#cdb7a8', 'stroke-width': o.sw || 1.4, 'stroke-dasharray': o.dash || null }, g);
    S('text', { x: x, y: y + (sub ? -2 : 4.5), 'text-anchor': 'middle', 'font-size': o.fs || 12.5, 'font-weight': 700, fill: o.color || '#4a3a32', text: label }, g);
    if (sub) S('text', { x: x, y: y + 13, 'text-anchor': 'middle', 'font-size': 10, fill: o.subColor || '#8a7a70', text: sub }, g);
  }
  function drawRF() {
    rf.innerHTML = '';
    var d = S('defs', {}, rf), cp = S('clipPath', { id: 'rf-clip' }, d);
    S('rect', { x: 0, y: 0, width: 400, height: 250, rx: 14 }, cp);
    var g = S('g', { 'clip-path': 'url(#rf-clip)' }, rf);
    S('rect', { x: 0, y: 0, width: 400, height: 250, fill: '#fbf8f5' }, g);
    var n = cleared.filter(Boolean).length;
    RF.forEach(function (r, i) {
      var x = COLX[i], sel = i === cur, done = cleared[i];
      if (sel) S('rect', { x: x - 62, y: 4, width: 124, height: 186, rx: 12, fill: '#f3e8e1' }, g);
      var hit = S('g', { class: 'svg-hit', tabindex: 0, role: 'button', 'aria-label': r.full }, g);
      S('rect', { x: x - 62, y: 4, width: 124, height: 186, fill: 'transparent' }, hit);
      rbox(hit, x, 30, 104, 38, r.n, r.time, { stroke: sel ? '#7d4d3c' : '#cdb7a8', sw: sel ? 2 : 1.4 });
      /* 竖向通道：石头搬走后变成实线 */
      S('line', { x1: x, y1: 49, x2: x, y2: 200, stroke: done ? '#2f6a4a' : '#d8c8bc', 'stroke-width': done ? 2.4 : 1.6, 'stroke-dasharray': done ? null : '4 4' }, hit);
      rbox(hit, x, 156, 104, 36, r.way, r.who, { fs: 12, stroke: done ? '#2f6a4a' : '#cdb7a8', color: done ? '#2f6a4a' : '#4a3a32' });
      /* 障碍石头 */
      var f = fall[i];
      var stone = S('g', { transform: 'translate(' + (f * 26) + ' ' + (f * 10) + ') rotate(' + (f * 14) + ' ' + x + ' 96)', opacity: 1 - f * 0.78 }, hit);
      S('path', { d: 'M' + (x - 48) + ' 112 l8 -26 l22 -8 l40 2 l20 12 l6 20 z', fill: '#e9d3c6', stroke: '#a4492b', 'stroke-width': 1.6 }, stone);
      S('text', { x: x, y: 94, 'text-anchor': 'middle', 'font-size': 9.5, fill: '#a4492b', text: '障碍' }, stone);
      S('text', { x: x, y: 108, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: '#7a3420', text: r.bar }, stone);
      if (done && f >= 1) S('text', { x: x - 24, y: 130, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: '#2f6a4a', text: '已扫除', stroke: '#fbf8f5', 'stroke-width': 3, 'paint-order': 'stroke' }, hit);
      hit.addEventListener('click', function () { pickRF(i); });
      hit.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickRF(i); } });
    });
    /* 汇合：资本主义发展 */
    rbox(g, 200, 222, 360, 40, n === 3 ? '三条路都通了：资本主义迅速发展' : '资本主义发展（已扫清 ' + n + ' / 3 条路）', n === 3 ? '为资本主义发展扫清了障碍' : '按“扫除障碍”把石头搬走', { fill: n === 3 ? '#e8f1e6' : '#fff', stroke: n === 3 ? '#2f6a4a' : '#cdb7a8', color: n === 3 ? '#2f6a4a' : '#4a3a32', sw: n === 3 ? 2 : 1.4 });
    var r = RF[cur];
    L.$('#rf-name').textContent = r.full;
    L.$('#rf-badge').textContent = r.time;
    L.$('#rf-way').textContent = r.way;
    L.$('#rf-bar').textContent = r.bar;
    L.$('#rf-text').innerHTML = '<b>' + ASP.filter(function (a) { return a.value === asp; })[0].label + '：</b>' + r[asp];
    var go = L.$('#rf-go');
    go.disabled = cleared[cur];
    go.textContent = cleared[cur] ? r.n + '的障碍已扫除' : '扫除' + r.n + '的障碍';
    save();
  }
  function pickRF(i) { cur = i; rfChips.set(String(i)); drawRF(); }
  var rfChips = L.chips(L.$('#rf-chips'), RF.map(function (r, i) { return { label: r.n, value: String(i) }; }), String(cur), function (v) { cur = +v; drawRF(); });
  L.chips(L.$('#asp-chips'), ASP, asp, function (v) { asp = v; drawRF(); });
  L.$('#rf-go').addEventListener('click', function () {
    var i = cur;
    if (cleared[i]) return;
    cleared[i] = true;
    if (rfAnim) rfAnim.stop();
    if (L.REDUCED) { fall[i] = 1; drawRF(); return; }
    rfAnim = L.loop(function (dt) {
      fall[i] = Math.min(1, fall[i] + dt * 1.6);
      drawRF();
      if (fall[i] >= 1) { rfAnim = null; return false; }
    });
  });
  L.$('#rf-reset').addEventListener('click', function () {
    if (rfAnim) { rfAnim.stop(); rfAnim = null; }
    cleared = [false, false, false]; fall = [0, 0, 0]; drawRF();
  });

  /* ========== 明治维新措施分类 ========== */
  var MJ = [
    ['废藩置县，地方官员改由中央政府任命', 'zz', '废掉各地的藩、改设府县，地方大权收归中央，属于<b>政治</b>方面，加强了中央集权。'],
    ['推行“殖产兴业”，由政府扶植、创办近代企业', 'jj', '用国家力量带动近代工业，属于<b>经济</b>方面。'],
    ['提倡“文明开化”，学习西方的生活方式', 'sh', '穿西服、吃西餐、改历法等，属于<b>社会生活</b>方面。'],
    ['允许土地自由买卖', 'jj', '土地可以买卖，地主和农民的关系按市场来，属于<b>经济</b>方面。'],
    ['大力发展近代教育，派留学生去欧美学习', 'sh', '教育是“文明开化”的重要内容，按教材归入<b>社会生活</b>方面。'],
    ['改革税制，统一用货币缴纳地税', 'jj', '国家有了稳定的财政收入，属于<b>经济</b>方面。']
  ];
  var MJ_OPT = [['zz', '政治'], ['jj', '经济'], ['sh', '社会生活']];
  var MJ_SHORT = ['废藩置县', '殖产兴业', '文明开化', '土地买卖', '近代教育', '改革税制'];
  function mjCount() { return { done: L.$$('#mj-list .choice-row[data-done]').length, right: L.$$('#mj-list .choice-row.correct').length }; }
  function mjInit() {
    L.match('#mj-list', '#mj-score', MJ, MJ_OPT, function (it, ok) { return ok ? it[2] : '不对。' + it[2]; });
    L.$('#mj-score').textContent = '已答 0 / ' + MJ.length;
    mjText();
  }
  function mjText() {
    var c = mjCount(), t, picks = { zz: [], jj: [], sh: [] };
    L.$$('#mj-list .choice-row').forEach(function (row, i) {
      var b = row.querySelector('button[aria-pressed="true"]');
      if (b) picks[b.dataset.v].push(MJ_SHORT[i]);
    });
    ['zz', 'jj', 'sh'].forEach(function (k) { L.$('#mj-' + k).textContent = picks[k].length ? picks[k].join('、') : '—'; });
    if (c.done < MJ.length) t = '记口诀：<b>政治废藩、经济殖产、社会开化</b>。分完后看看哪一类最多——日本最着急的，是把经济和工业搞上去。';
    else if (c.right === MJ.length) t = '全对！6 条里有 <b>3 条是经济方面</b>，说明明治维新的重心是发展资本主义经济，“殖产兴业”是关键词。';
    else t = '答对 ' + c.right + ' 条。看看标红的那几条下面的说明，再按“重新分一遍”。';
    L.$('#mj-text').innerHTML = t;
  }
  L.$('#mj-list').addEventListener('click', function (e) { if (e.target.closest('button')) mjText(); });
  L.$('#mj-reset').addEventListener('click', mjInit);

  function save() { L.setState({ y: year, c: cur, a: asp, k: cleared.map(function (c) { return c ? 1 : 0; }).join('') }); }

  render();
  drawRF();
  mjInit();

  /* ========== 课本逐课要点（顺序对应新教材九下第 1～4 课） ========== */
  L.keypoints('#keypoints', [
    '拉丁美洲：1804 年<b>海地</b>独立，是拉美第一个独立国家；墨西哥伊达尔哥起义；<b>玻利瓦尔</b>、圣马丁领导南美独立战争，19 世纪 20 年代拉美大部分地区独立。亚洲：1857—1859 年<b>印度民族大起义</b>反抗英国殖民统治，章西女王是起义中的女英雄。',
    '19 世纪中期俄国实行农奴制，克里米亚战争失败暴露落后；1861 年沙皇<b>亚历山大二世</b>签署法令<b>废除农奴制</b>，农奴获得人身自由，可赎买份地。俄国走上资本主义道路，但保留大量农奴制残余。',
    '根本原因是南北两种经济制度的矛盾；1861 年内战爆发，<b>林肯</b>领导北方，1862 年颁布《宅地法》和<b>《解放黑人奴隶宣言》</b>，1865 年北方胜利。维护了国家统一，废除了奴隶制，被看作美国第二次资产阶级革命。',
    '1868 年明治天皇建立新政府开始改革：政治上<b>废藩置县</b>；经济上允许土地买卖、改革税制、<b>殖产兴业</b>；社会生活上<b>文明开化</b>、发展近代教育。日本走上资本主义道路、成为亚洲强国，但保留大量封建残余，走上对外侵略扩张道路。'
  ]);

  /* ========== 大题训练 ========== */
  L.essay('#essay', {
    title: '19 世纪中期的改革与资本主义扩展',
    materials: [
      { label: '材料一', text: '1861 年，沙皇亚历山大二世签署法令，宣布废除农奴制。农奴获得人身自由，可以自由出卖劳动力，还可以赎买一块份地，但赎金很高。', src: '——据统编版九年级下册第 2 课整理' },
      { label: '材料二', text: '明治政府废藩置县，加强中央集权；允许土地自由买卖，改革税制；推行“殖产兴业”，扶植近代企业；提倡“文明开化”，发展近代教育。', src: '——据统编版九年级下册第 4 课整理' }
    ],
    parts: [
      {
        ask: '(1) 根据材料一、二，分别概括俄国 1861 年改革和日本明治维新的主要措施。', score: 4, type: 'sum',
        points: [
          { t: '俄国：废除农奴制，农奴获得人身自由', s: 1 },
          { t: '俄国：农民可以赎买份地', s: 1 },
          { t: '日本：政治上废藩置县，加强中央集权', s: 1 },
          { t: '日本：经济上殖产兴业、允许土地买卖、改革税制；社会生活上文明开化、发展教育', s: 1 }
        ],
        model: '俄国：废除农奴制，农奴获得人身自由；农民可以赎买份地。日本：政治上废藩置县；经济上允许土地买卖、改革税制、殖产兴业；社会生活上提倡文明开化、发展近代教育。'
      },
      {
        ask: '(2) 结合所学，比较两场改革的相同点。', score: 4, type: 'compare',
        points: [
          { t: '都是自上而下的改革（由沙皇、天皇的新政府推行）', s: 1 },
          { t: '都使国家走上资本主义发展道路', s: 1 },
          { t: '都是学习、发展资本主义以摆脱落后/危机的结果', s: 1 },
          { t: '都不彻底，保留了大量封建（农奴制）残余', s: 1 }
        ],
        model: '都是由最高统治者推动的自上而下的改革；都是在国家落后、危机加深的背景下进行的；都使国家走上了资本主义发展道路；都不彻底，俄国保留大量农奴制残余，日本保留大量封建残余。'
      },
      {
        ask: '(3) 围绕“19 世纪中期的变革与资本主义的扩展”，自拟一个观点，结合俄国、美国、日本中至少两国的史实加以阐述。（要求：观点正确，史论结合，条理清楚）', score: 8, type: 'essay',
        points: [
          { t: '观点明确、正确，例如“19 世纪中期的变革扫除了资本主义发展的障碍”', s: 2 },
          { t: '用一个国家的史实论证（如俄国 1861 年废除农奴制）', s: 2 },
          { t: '用另一个国家的史实论证（如美国内战废除奴隶制、日本明治维新）', s: 2 },
          { t: '有结论回扣观点，条理清楚', s: 2 }
        ],
        model: '观点：19 世纪中期的变革扫除了资本主义发展的障碍，使资本主义制度在更大范围内扩展。论证：①1861 年俄国废除农奴制，大量自由劳动力进入工厂，俄国走上资本主义道路；②1861—1865 年美国内战，林肯政府颁布《解放黑人奴隶宣言》，北方胜利后废除奴隶制、维护统一，资本主义迅速发展；③1868 年起日本明治维新，废藩置县、殖产兴业，日本成为亚洲强国。结论：方式虽有改革和内战之分，但都顺应了资本主义发展的要求，推动了国家的近代化。'
      }
    ]
  });
  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '把年份调到俄国废除农奴制、美国内战爆发的那一年',
      desc: '在横向时间轴下面拖动滑块，或者直接点时间轴上的事件。',
      label: '在时间轴里操作',
      button: '检查年份',
      check: function () {
        if (year === 1861) return { ok: true, msg: '1861 年：俄国废除农奴制，美国内战爆发，中国的洋务运动也在这一时期兴起。它属于 19 世纪 60 年代。' };
        if (year === 1865) return { ok: false, msg: '1865 年是美国内战<b>结束</b>的年份，要找的是开始的那一年。' };
        if (year === 1868) return { ok: false, msg: '1868 年是日本明治维新开始，再往前找几年。' };
        return { ok: false, msg: '现在是' + L.yr(year) + '。找时间轴上“俄国废除农奴制”和“美国内战爆发”挨在一起的那一年。' };
      }
    },
    {
      level: 'base',
      title: '1861 年俄国改革最核心的内容是',
      desc: '想一想俄国资本主义被什么挡住了路。',
      options: ['废除农奴制', '废藩置县', '颁布《解放黑人奴隶宣言》', '推行“殖产兴业”'],
      answer: 0,
      hint: '俄国的“石头”是什么？在对比器里选“俄国”看看。',
      explain: '沙皇亚历山大二世签署法令，<b>废除农奴制</b>，农奴获得人身自由。废藩置县和殖产兴业是日本明治维新的措施；《解放黑人奴隶宣言》是美国内战中林肯政府颁布的。'
    },
    {
      level: 'base',
      title: '1857—1859 年印度民族大起义反抗的是',
      desc: '起义中涌现出女英雄章西女王。',
      options: ['英国的殖民统治', '西班牙的殖民统治', '美国的殖民统治', '日本的殖民统治'],
      answer: 0,
      hint: '19 世纪中期，印度是哪个国家的殖民地？',
      explain: '印度当时是<b>英国</b>的殖民地，印度民族大起义反抗的是英国殖民统治。西班牙的殖民地主要在拉丁美洲，拉美独立运动反抗的才是西班牙等国。'
    },
    {
      level: 'mid',
      title: '把三个国家的障碍都扫除',
      desc: '在“三场变革”对比器里，依次选俄国、美国、日本，各按一次“扫除障碍”，让底下的三条路都通。',
      label: '在三场变革对比器里操作',
      button: '检查三条路',
      check: function () {
        var left = RF.filter(function (r, i) { return !cleared[i]; }).map(function (r) { return r.n; });
        if (!left.length) return { ok: true, msg: '农奴制、黑人奴隶制、幕府统治都被扫除了。三场变革方式不同，共同作用都是<b>为资本主义发展扫清了障碍</b>。' };
        return { ok: false, msg: '还有' + left.join('、') + '的障碍没扫除。先在“国家”里选它，再按“扫除障碍”。' };
      }
    },
    {
      level: 'mid',
      title: '把明治维新的 6 条措施全部分对',
      desc: '在“明治维新的措施，各归哪一类”里给每条措施选类别。分错了可以按“重新分一遍”。',
      label: '在措施分类里操作',
      button: '检查分类',
      check: function () {
        var c = mjCount();
        if (c.done < MJ.length) return { ok: false, msg: '还有 ' + (MJ.length - c.done) + ' 条没分。' };
        if (c.right === MJ.length) return { ok: true, msg: '政治：废藩置县；经济：殖产兴业、允许土地买卖、改革税制；社会生活：文明开化、发展近代教育。' };
        return { ok: false, msg: '错了 ' + (MJ.length - c.right) + ' 条。提示：和“钱、土地、工厂”有关的是经济；和“穿衣吃饭、上学”有关的是社会生活。按“重新分一遍”再试。' };
      }
    },
    {
      level: 'mid',
      title: '美国内战中，林肯政府在 1862 年颁布、使北方扭转战局的文件是',
      desc: '它和《宅地法》同一年颁布。',
      options: ['《解放黑人奴隶宣言》', '《独立宣言》', '《权利法案》', '1787 年宪法'],
      answer: 0,
      hint: '这份文件和“奴隶制”有关。',
      explain: '1862 年林肯政府颁布<b>《解放黑人奴隶宣言》</b>和《宅地法》，调动了黑人和农民的积极性，北方逐渐扭转战局。《独立宣言》是 1776 年独立战争时期发表的；1787 年宪法和《权利法案》都是建国初期的文件。'
    },
    {
      level: 'trap',
      title: '关于美国内战，下列说法正确的是',
      desc: '小心把它和美国独立战争混在一起。',
      options: ['它维护了国家统一，废除了黑人奴隶制', '它使美国摆脱了英国的殖民统治', '它的领导人是华盛顿', '它发生在 18 世纪后期'],
      answer: 0,
      hint: '内战是“美国人和美国人”打，独立战争是“美国人和英国人”打。',
      explain: '美国内战（1861—1865 年）由<b>林肯</b>领导，<b>维护了国家统一，废除了奴隶制</b>。摆脱英国殖民统治、由华盛顿领导、发生在 18 世纪后期的，是美国<b>独立战争</b>。'
    },
    {
      level: 'trap',
      title: '俄国 1861 年改革和日本明治维新的共同点是',
      desc: '两场改革都由国家最高统治者推动。',
      options: ['都是自上而下的改革，都保留了封建残余', '都是通过内战推翻了旧政权', '都彻底废除了封建制度', '都是反抗殖民统治的民族起义'],
      answer: 0,
      hint: '想想谁发起的改革，改得彻不彻底。',
      explain: '俄国改革由沙皇发起，明治维新由天皇的新政府推行，都是<b>自上而下的改革</b>，都使国家走上资本主义道路，但都<b>不彻底</b>：俄国保留大量农奴制残余，日本保留大量封建残余。通过内战解决问题的是美国；反抗殖民统治的是印度、拉美。'
    }
  ]);
})();
