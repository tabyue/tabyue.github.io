/* 历史互动馆 · 第 4 课 三国两晋南北朝：分立与交融 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();
  var NOW = 2026;

  /* ========== 时间轴与并存政权 ========== */
  // rows：对应右侧“四个阶段”表格的行（可以同时高亮两行）
  var PER = [
    { from: 190, to: 219, name: '东汉末年', rows: [], note: '东汉末年军阀混战。200 年官渡之战，曹操打败袁绍，逐渐统一北方。' },
    { from: 220, to: 265, name: '三国', rows: [0], note: '魏、蜀、吴三国鼎立。263 年魏灭蜀。' },
    { from: 266, to: 279, name: '西晋与吴并存', rows: [0, 1], note: '西晋已经建立，但江东的吴还在，三国时期要到 280 年吴亡才结束。' },
    { from: 280, to: 316, name: '西晋', rows: [1], note: '西晋结束了分裂局面，但统治腐朽，发生“八王之乱”，316 年西晋灭亡。这一时期匈奴、鲜卑、羯、氐、羌等北方各族不断内迁，与汉族错居杂处。' },
    { from: 317, to: 419, name: '东晋·十六国', rows: [2], note: '南方是东晋，定都建康；北方各族先后建立了许多政权，史称“十六国”。' },
    { from: 420, to: 588, name: '南北朝', rows: [3], note: '南方宋、齐、梁、陈四朝合称南朝，都城都在建康；北方以北魏为代表，后来分裂为东魏、西魏，又被北齐、北周取代，合称北朝。' },
    { from: 589, to: 600, name: '隋', rows: [], note: '隋朝统一南北，结束了长期分裂的局面。' }
  ];
  // 政权存续年份（含首尾），side：s 南方 / n 北方 / 空 = 不分南北
  var REG = [
    { n: '东汉', from: 190, to: 219 },
    { n: '魏', from: 220, to: 265 }, { n: '蜀', from: 221, to: 262 }, { n: '吴', from: 222, to: 279 },
    { n: '西晋', from: 266, to: 316 },
    { n: '东晋', from: 317, to: 419, side: 's' },
    { n: '十六国诸政权', from: 304, to: 438, side: 'n' },
    { n: '北魏', from: 386, to: 533, side: 'n' },
    { n: '宋', from: 420, to: 478, side: 's' }, { n: '齐', from: 479, to: 501, side: 's' },
    { n: '梁', from: 502, to: 556, side: 's' }, { n: '陈', from: 557, to: 589, side: 's' },
    { n: '东魏', from: 534, to: 549, side: 'n' }, { n: '西魏', from: 535, to: 556, side: 'n' },
    { n: '北齐', from: 550, to: 576, side: 'n' }, { n: '北周', from: 557, to: 580, side: 'n' },
    { n: '隋', from: 581, to: 588, side: 'n' }, { n: '隋', from: 589, to: 600 }
  ];
  var EVENTS = [
    { id: 'chibi', y: 208, label: '赤壁之战', note: '曹操率军南下，孙权、刘备联军在赤壁大败曹军，奠定了三国鼎立的基础。' },
    { id: 'wei', y: 220, label: '曹丕称帝', note: '曹丕称帝，国号魏，定都洛阳，东汉灭亡。' },
    { id: 'shu', y: 221, label: '刘备称帝', note: '刘备在成都称帝，国号汉，史称蜀。' },
    { id: 'wu', y: 222, label: '孙权称王', note: '孙权称王，229 年称帝，国号吴，定都建业。魏、蜀、吴三国鼎立的局面形成。' },
    { id: 'xijin', y: 266, label: '西晋建立', note: '司马炎夺取魏的政权，建立西晋，定都洛阳。' },
    { id: 'tong', y: 280, label: '西晋统一', note: '西晋灭吴，结束了三国分立的局面。' },
    { id: 'dongjin', y: 317, label: '东晋建立', note: '西晋灭亡后的第二年，司马睿在建康建立东晋。' },
    { id: 'feishui', y: 383, label: '淝水之战', note: '前秦大军南下，东晋在淝水以少胜多。前秦战败后，北方又陷入分裂。' },
    { id: 'nan', y: 420, label: '南朝开始', note: '刘裕建立宋，东晋灭亡，南朝开始。' },
    { id: 'bwei', y: 439, label: '北魏统一北方', note: '鲜卑族拓跋部建立的北魏统一了黄河流域。' },
    { id: 'qian', y: 494, label: '孝文帝迁都', note: '北魏孝文帝把都城从平城迁到洛阳，推行一系列改革。' },
    { id: 'sui', y: 589, label: '隋统一', note: '隋灭陈，南北重新统一。' }
  ];
  var YMIN = 190, YMAX = 600;
  var year = Math.round(L.num(st.y, 208, YMIN, YMAX));
  var tl = L.$('#tl'), yIn = L.$('#year-in');
  var ERA = [
    { from: 220, to: 280, label: '三国', color: '#e3cfc2' },
    { from: 280, to: 316, label: '西晋', color: '#ead8c6' },
    { from: 317, to: 420, label: '东晋十六国', color: '#e6d3c0' },
    { from: 420, to: 589, label: '南北朝', color: '#efe0d2' },
    { from: 589, to: 600, label: '', color: '#d9bfae' }
  ];

  function perOf(y) { for (var i = 0; i < PER.length; i++) if (y >= PER[i].from && y <= PER[i].to) return PER[i]; return null; }
  function regOf(y) {
    var all = [], s = [], n = [];
    REG.forEach(function (r) {
      if (y < r.from || y > r.to) return;
      if (r.side === 's') s.push(r.n); else if (r.side === 'n') n.push(r.n); else all.push(r.n);
    });
    if (s.length && n.length) return (all.length ? all.join('、') + '；' : '') + '南方：' + s.join('、') + '；北方：' + n.join('、');
    return all.concat(s, n).join('、');
  }
  function nearest(y) {
    var best = null;
    EVENTS.forEach(function (e) { if (Math.abs(e.y - y) <= 4 && (!best || Math.abs(e.y - y) < Math.abs(best.y - y))) best = e; });
    return best;
  }
  function drawTL() {
    var ev = nearest(year);
    var ax = L.timeline(tl, {
      from: YMIN, to: YMAX, step: 50,
      era: ERA,
      events: EVENTS.map(function (e) { var on = ev && ev.id === e.id; return { id: e.id, y: e.y, label: e.label, on: on, color: on ? '#a4492b' : '#7d4d3c' }; }),
      pick: function (id) { var e = EVENTS.filter(function (x) { return x.id === id; })[0]; setYear(e.y); }
    });
    var x = ax.X(year);
    S('line', { x1: x, y1: 8, x2: x, y2: ax.base + 50, stroke: '#c2603f', 'stroke-width': 1.6, 'stroke-dasharray': '4 3' }, tl);
    S('path', { d: 'M' + (x - 6) + ' 4h12l-6 8z', fill: '#c2603f' }, tl);
  }
  function setYear(y) {
    year = L.clamp(y, YMIN, YMAX);
    yIn.value = year; L.paintRange(yIn);
    render();
  }
  function render() {
    drawTL();
    var p = perOf(year), ev = nearest(year);
    L.$('#year-out').textContent = L.yr(year);
    L.$('#dyn-badge').textContent = p ? p.name : '—';
    L.$('#r-cent').textContent = L.century(year);
    L.$('#r-ago').innerHTML = L.span(year, NOW) + '<small>年前</small>';
    L.$('#r-reg').textContent = regOf(year) || '—';
    L.$('#r-event').textContent = ev ? (ev.y === year ? '' : '附近 ') + L.yr(ev.y) + '：' + ev.label : '这几年没有课本里的大事';
    L.$('#r-text').innerHTML = (ev ? ev.note + ' ' : '') + (p ? '<b>' + p.name + '</b>：' + p.note : '');
    L.$$('#era-table tr').forEach(function (tr, i) { tr.classList.toggle('on', !!p && p.rows.indexOf(i) >= 0); });
    save();
  }
  L.bindRange(yIn, function (v) { year = v; render(); });
  yIn.value = year; L.paintRange(yIn);

  /* ========== 孝文帝改革分类 ========== */
  var XW = [
    ['把都城从平城迁到洛阳', 'qd', '洛阳在中原，迁都便于控制黄河流域，也方便学习汉族文化。这是改革的第一步。', '迁都洛阳'],
    ['规定官员在朝廷上必须说汉语', 'fs', '鲜卑人原来说鲜卑语，改说汉语属于<b>改鲜卑旧俗</b>。', '说汉语'],
    ['官员和家属改穿汉族服装', 'fs', '服饰是生活习俗，属于<b>改鲜卑旧俗</b>。', '穿汉服'],
    ['鲜卑贵族改用汉姓，皇族拓跋氏改姓元', 'fs', '姓氏也是习俗，属于<b>改鲜卑旧俗</b>。孝文帝自己就从拓跋宏改名元宏。', '改汉姓'],
    ['鼓励鲜卑贵族与汉族贵族通婚', 'fs', '婚姻习俗变了，两族成了亲戚，属于<b>改鲜卑旧俗</b>。', '通婚'],
    ['采用汉族的官制和律令', 'zd', '官制是怎样设官，律令是法律，属于<b>学汉族制度</b>。', '官制律令'],
    ['学习汉族的礼法，尊崇孔子', 'zd', '礼法和尊孔是学习汉族的制度和思想文化，属于<b>学汉族制度礼法</b>。', '礼法尊孔']
  ];
  var XW_OPT = [['qd', '迁都'], ['fs', '改鲜卑旧俗'], ['zd', '学汉族制度礼法']];
  function xwCount() { return { done: L.$$('#xw-list .choice-row[data-done]').length, right: L.$$('#xw-list .choice-row.correct').length }; }
  function xwInit() {
    L.match('#xw-list', '#xw-score', XW, XW_OPT, function (it, ok) { return (ok ? '' : '不对。') + it[2]; });
    L.$('#xw-score').textContent = '已答 0 / ' + XW.length;
    xwText();
  }
  function xwText() {
    var c = xwCount(), picks = { qd: [], fs: [], zd: [] }, t;
    L.$$('#xw-list .choice-row').forEach(function (row, i) {
      var b = row.querySelector('button[aria-pressed="true"]');
      if (b) picks[b.dataset.v].push(XW[i][3]);
    });
    ['qd', 'fs', 'zd'].forEach(function (k) { L.$('#xw-' + k).textContent = picks[k].length ? picks[k].join('、') : '—'; });
    L.$('#xw-badge').textContent = '答对 ' + c.right + ' / ' + XW.length;
    var rows = L.$$('#xw-list .choice-row');
    L.$$('#xw-cmp tr').forEach(function (tr, i) { tr.classList.toggle('on', !!rows[i] && rows[i].classList.contains('correct')); });
    if (c.done < XW.length) t = '先想清楚：哪一条是“换地方”，哪些是改<b>日常习俗</b>（语言、服饰、姓氏、婚姻），哪些是学<b>制度和礼法</b>。';
    else if (c.right === XW.length) t = '全对！迁都是第一步；说汉语、穿汉服、改汉姓、通婚改的是<b>风俗</b>；用汉族官制律令、学礼法改的是<b>制度</b>。改革的作用：<b>加速了北方民族交融</b>，促进了北魏的发展。';
    else t = '答对 ' + c.right + ' 条。看看分错那几行下面的说明，再按“重新分一遍”。';
    L.$('#xw-text').innerHTML = t;
  }
  L.$('#xw-list').addEventListener('click', function (e) { if (e.target.closest('button')) xwText(); });
  L.$('#xw-reset').addEventListener('click', xwInit);

  /* ========== 江南开发因果链 ========== */
  var JN = [
    { x: 200, y: 22, w: 190, h: 30, t: '北方长期战乱', c: '#9a8a80' },
    { x: 84, y: 74, w: 154, h: 40, t: '北方人口大量南迁', sub: '带来劳动力和生产技术', c: '#b07a3e' },
    { x: 84, y: 126, w: 154, h: 40, t: '江南自然条件优越', sub: '气候温暖湿润，水源充足', c: '#b07a3e' },
    { x: 84, y: 178, w: 154, h: 40, t: '南方社会相对安定', sub: '战乱比北方少', c: '#b07a3e' },
    { x: 298, y: 100, w: 164, h: 44, t: '江南得到开发', sub: '农业、手工业发展起来', c: '#a4492b' },
    { x: 298, y: 190, w: 164, h: 44, t: '为经济重心南移', sub: '奠定基础', c: '#7d4d3c' }
  ];
  var JN_T = [
    '<b>背景</b>：东汉末年以来，北方战乱不断，很多百姓没法安心种地。按“下一环”看看接下来发生了什么。',
    '<b>原因①</b>：北方人口大量南迁，给江南带来了大量<b>劳动力</b>和先进的<b>生产技术</b>。这是最重要的一条。',
    '<b>原因②</b>：江南自然条件优越，气候温暖湿润，水源充足；原来人少地多，还有大片土地没有开垦。',
    '<b>原因③</b>：和战乱不断的北方比，南方<b>社会相对安定</b>，人们能安心生产。',
    '<b>结果</b>：江南得到开发。南北人民一起兴修水利、开垦荒地，农业发展很快，手工业也发展起来。',
    '<b>影响</b>：江南经济逐渐发展起来，为后来我国古代<b>经济重心南移奠定了基础</b>。注意：经济重心南移到南宋才最终完成。'
  ];
  var jnStep = Math.round(L.num(st.j, 0, 0, JN.length - 1));
  var jnSvg = L.$('#jn');
  function jnBox(g, n, on) {
    S('rect', { x: n.x - n.w / 2, y: n.y - n.h / 2, width: n.w, height: n.h, rx: 9, fill: on ? '#fff' : '#f6f1ed', stroke: on ? n.c : '#d9cdc4', 'stroke-width': on ? 1.8 : 1.2, 'stroke-dasharray': on ? null : '4 3' }, g);
    if (!on) { S('text', { x: n.x, y: n.y + 5, 'text-anchor': 'middle', 'font-size': 13, fill: '#b9a89c', text: '？' }, g); return; }
    S('text', { x: n.x, y: n.y + (n.sub ? -2 : 4.5), 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: n.c, text: n.t }, g);
    if (n.sub) S('text', { x: n.x, y: n.y + 13, 'text-anchor': 'middle', 'font-size': 10.5, fill: '#7a6a62', text: n.sub }, g);
  }
  function drawJn() {
    jnSvg.innerHTML = '';
    var d = S('defs', {}, jnSvg), cp = S('clipPath', { id: 'jn-clip' }, d);
    S('rect', { x: 0, y: 0, width: 400, height: 236, rx: 14 }, cp);
    var g = S('g', { 'clip-path': 'url(#jn-clip)' }, jnSvg);
    S('rect', { x: 0, y: 0, width: 400, height: 236, fill: '#fbf8f5' }, g);
    // 连线：先画，盒子盖在上面
    if (jnStep >= 1) L.arrow(g, 140, 37, 110, 52, { color: '#b9a89c', width: 1.6 });
    [1, 2, 3].forEach(function (i) {
      if (jnStep >= 4) L.arrow(g, JN[i].x + JN[i].w / 2, JN[i].y, JN[4].x - JN[4].w / 2 - 2, JN[4].y + (i - 2) * 10, { color: '#c9a26d', width: 1.6 });
    });
    if (jnStep >= 5) L.arrow(g, JN[4].x, JN[4].y + JN[4].h / 2, JN[5].x, JN[5].y - JN[5].h / 2 - 2, { color: '#7d4d3c', width: 1.8 });
    JN.forEach(function (n, i) { jnBox(g, n, i <= jnStep); });
    L.$('#jn-text').innerHTML = JN_T[jnStep];
    L.$('#jn-next').textContent = jnStep >= JN.length - 1 ? '已经到最后一环' : '下一环';
    L.$('#jn-next').disabled = jnStep >= JN.length - 1;
    save();
  }
  L.$('#jn-next').addEventListener('click', function () { if (jnStep < JN.length - 1) { jnStep++; drawJn(); } });
  L.$('#jn-reset').addEventListener('click', function () { jnStep = 0; drawJn(); });

  /* ========== 科技文化名人 ========== */
  var REN = [
    { w: '圆周率', n: '祖冲之', era: '南朝', f: '数学', t: '<b>祖冲之</b>，南朝数学家。他算出圆周率在 3.1415926 和 3.1415927 之间，把圆周率精确到小数点后第七位，这一成就领先世界近一千年。' },
    { w: '《齐民要术》', n: '贾思勰', era: '北魏', f: '农学', t: '<b>贾思勰</b>，北魏农学家。《齐民要术》总结了黄河中下游地区农牧业生产经验，是我国现存最早的一部完整的农书。' },
    { w: '《水经注》', n: '郦道元', era: '北魏', f: '地理', t: '<b>郦道元</b>，北魏地理学家。他给古书《水经》作注，写成《水经注》，记录了许多河流流经地区的山川、城镇、物产和历史故事。' },
    { w: '《兰亭序》', n: '王羲之', era: '东晋', f: '书法', t: '<b>王羲之</b>，东晋书法家，被后人尊称为“书圣”。他的《兰亭序》被誉为“天下第一行书”，今天看到的是后人的摹本。' },
    { w: '《洛神赋图》', n: '顾恺之', era: '东晋', f: '绘画', t: '<b>顾恺之</b>，东晋画家，擅长画人物，讲究传神。代表作有《洛神赋图》《女史箴图》，今天看到的都是后人的摹本。' }
  ];
  var renSel = Math.round(L.num(st.w, -1, -1, REN.length - 1));
  var renTb = L.$('#ren-table');
  REN.forEach(function (r) {
    var tr = L.html('tr', {}, renTb);
    [r.n, r.era, r.f].forEach(function (s) { L.html('td', { text: s }, tr); });
  });
  function drawRen() {
    L.$$('#ren-table tr').forEach(function (tr, i) { tr.classList.toggle('on', i === renSel); });
    L.$('#ren-text').innerHTML = renSel < 0 ? '先点上面任意一部作品或成就。小窍门：这五个人里，<b>两个北魏、两个东晋、一个南朝</b>。' : REN[renSel].t;
    save();
  }
  L.chips(L.$('#ren-chips'), REN.map(function (r, i) { return { label: r.w, value: String(i) }; }), String(renSel), function (v) { renSel = +v; drawRen(); });

  function save() { L.setState({ y: year, j: jnStep, w: renSel >= 0 ? renSel : '' }); }

  render();
  xwInit();
  drawJn();
  drawRen();

  /* ========== 课本逐课要点（顺序对应新教材七上第 16～20 课） ========== */
  L.keypoints('#keypoints', [
    '200 年官渡之战曹操打败袁绍；208 年<b>赤壁之战</b>奠定三国鼎立的基础；220 年曹丕建魏（洛阳），221 年刘备建蜀（成都），222 年孙权称王、229 年称帝建吴（建业）。诸葛亮开发西南；孙吴开发江南，230 年卫温率船队到达<b>夷洲（今台湾）</b>。',
    '266 年司马炎建立<b>西晋</b>，280 年灭吴统一全国；西晋统治腐朽，发生“八王之乱”，316 年灭亡。匈奴、鲜卑、羯、氐、羌等<b>北方各族内迁</b>，与汉族错居杂处。',
    '317 年司马睿在建康建立<b>东晋</b>；383 年<b>淝水之战</b>东晋以少胜多打败前秦；420 年起宋、齐、梁、陈合称<b>南朝</b>。北方人口南迁带来劳动力和技术，加上自然条件优越、社会相对安定，<b>江南得到开发</b>。',
    '439 年<b>北魏</b>统一黄河流域；孝文帝 494 年迁都洛阳，推行说汉语、穿汉服、改汉姓、与汉族通婚、采用汉族官制律令等改革，<b>加速了北方民族交融</b>；北魏后来分裂为东魏、西魏，又被北齐、北周取代。',
    '<b>祖冲之</b>把圆周率精确到小数点后第七位；贾思勰《齐民要术》是现存最早的完整农书；郦道元《水经注》；“书圣”王羲之；顾恺之擅长人物画；<b>云冈石窟、龙门石窟</b>是石窟艺术的代表。'
  ]);

  /* ========== 大题训练 ========== */
  L.essay('#essay', {
    title: '政权分立与民族交融',
    materials: [
      { label: '材料一', text: '西晋时期，匈奴、鲜卑、羯、氐、羌等北方少数民族不断内迁，与汉族错居杂处。东汉末年以来，北方人口大量南迁，与南方各族人民一起开发江南。', src: '——据统编版七年级上册第 17、18 课整理' },
      { label: '材料二', text: '北魏孝文帝把都城从平城迁到洛阳，规定官员在朝廷上必须使用汉语，改穿汉族服装；鲜卑贵族改用汉姓，皇族拓跋氏改姓元；鼓励鲜卑贵族与汉族贵族通婚；采用汉族的官制和律令，学习汉族礼法，尊崇孔子。', src: '——据统编版七年级上册第 19 课整理' }
    ],
    parts: [
      {
        ask: '(1) 根据材料二，概括北魏孝文帝改革的主要措施。', score: 4, type: 'sum',
        points: [
          { t: '迁都洛阳', s: 1 },
          { t: '说汉语、穿汉服', s: 1 },
          { t: '改汉姓、与汉族通婚', s: 1 },
          { t: '采用汉族官制律令，学习汉族礼法', s: 1 }
        ],
        model: '迁都洛阳；在朝廷使用汉语、改穿汉服；改用汉姓，鼓励与汉族贵族通婚；采用汉族的官制和律令，学习汉族礼法、尊崇孔子。'
      },
      {
        ask: '(2) 结合所学，分析孝文帝迁都洛阳、推行改革的原因。', score: 4, type: 'why',
        points: [
          { t: '北魏统一黄河流域，统治汉族人口多、农耕经济发达的地区', s: 1 },
          { t: '鲜卑原有的制度和习俗难以有效治理中原', s: 1 },
          { t: '都城平城偏北，不便控制中原', s: 1 },
          { t: '便于学习汉族先进文化，巩固北魏统治', s: 1 }
        ],
        model: '北魏统一黄河流域后，统治的地区汉族人口多、农耕经济发达，鲜卑原有的制度和习俗难以有效治理；都城平城偏北，不便控制中原；为了学习汉族先进文化、巩固统治，孝文帝迁都洛阳并推行改革。'
      },
      {
        ask: '(3) 结合材料和所学，围绕“三国两晋南北朝时期的民族交融”，自拟一个观点并加以阐述。（要求：观点正确，史论结合，条理清楚）', score: 8, type: 'essay',
        points: [
          { t: '观点明确、正确，如“政权分立时期，民族交融仍在不断加深”', s: 2 },
          { t: '用北方的史实论证：北方各族内迁、孝文帝改革', s: 2 },
          { t: '用南方的史实论证：北方人口南迁，与南方各族共同开发江南', s: 2 },
          { t: '有结论回扣观点，条理清楚', s: 2 }
        ],
        model: '观点：三国两晋南北朝时期虽然政权分立，但民族交融不断加深。论证：①西晋时，匈奴、鲜卑、羯、氐、羌等族内迁，与汉族错居杂处，相互影响；②北魏孝文帝迁都洛阳，推行说汉语、穿汉服、改汉姓、与汉族通婚等改革，加速了北方民族交融；③北方人口大量南迁，与南方各族人民一起开发江南。结论：民族交融为隋唐的统一和繁荣奠定了基础，也推动了统一多民族国家的发展。'
      }
    ]
  });

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '把年份调到西晋统一全国的那一年',
      desc: '在时间轴下面拖动滑块，或者直接点时间轴上的事件。',
      label: '在时间轴里操作',
      button: '检查年份',
      check: function () {
        if (year === 280) return { ok: true, msg: '280 年西晋灭吴，统一全国。看右边：这一年起只剩下西晋一个政权，属于 3 世纪。' };
        if (year === 266) return { ok: false, msg: '266 年是西晋<b>建立</b>的年份，这时吴还在。统一要等到灭吴那一年。' };
        if (year < 266) return { ok: false, msg: '现在是' + L.yr(year) + '，西晋还没建立呢，往右拖。' };
        return { ok: false, msg: '现在是' + L.yr(year) + '。看右边“同时存在的政权”：从哪一年开始只剩西晋一个？' };
      }
    },
    {
      level: 'base',
      title: '奠定三国鼎立基础的战役是',
      desc: '这场战役中，孙权和刘备联合起来对抗曹操。',
      options: ['赤壁之战', '官渡之战', '淝水之战', '长平之战'],
      answer: 0,
      hint: '208 年，曹操南下，在长江边被火攻打败。',
      explain: '208 年<b>赤壁之战</b>，孙刘联军大败曹军，曹操退回北方，奠定了三国鼎立的基础。官渡之战（200 年）是曹操打败袁绍、统一北方；淝水之战（383 年）是东晋打败前秦；长平之战是战国时秦国打败赵国。'
    },
    {
      level: 'base',
      title: '我国现存最早的一部完整的农书是',
      desc: '可以在“点一部作品”那张表里找一找。',
      options: ['《齐民要术》', '《水经注》', '《兰亭序》', '《洛神赋图》'],
      answer: 0,
      hint: '作者是北魏的贾思勰。',
      explain: '北魏贾思勰的<b>《齐民要术》</b>是我国现存最早的一部完整的农书。《水经注》是郦道元的地理著作，《兰亭序》是王羲之的书法作品，《洛神赋图》是顾恺之的绘画作品。'
    },
    {
      level: 'mid',
      title: '把孝文帝改革的 7 条措施全部分类正确',
      desc: '在“孝文帝改革”里每行点一个类别。分错了就按“重新分一遍”。',
      label: '在孝文帝改革分类里操作',
      button: '检查分类',
      check: function () {
        var c = xwCount();
        if (c.done < XW.length) return { ok: false, msg: '还有 ' + (XW.length - c.done) + ' 条没分。' };
        if (c.right < XW.length) return { ok: false, msg: '分了 ' + XW.length + ' 条，对了 ' + c.right + ' 条。语言、服饰、姓氏、婚姻都是<b>习俗</b>；官制、律令、礼法是<b>制度</b>。按“重新分一遍”再来。' };
        return { ok: true, msg: '迁都 1 条，改旧俗 4 条，学制度礼法 2 条。这些措施加速了北方民族交融。' };
      }
    },
    {
      level: 'mid',
      title: '把江南开发的因果链展开到“结果”这一环，停在那里',
      desc: '在因果链里按“下一环”。三个原因之后是结果，结果之后才是影响。如果点过头了，按“从头再来”。',
      label: '在江南开发因果链里操作',
      button: '检查展开到哪了',
      check: function () {
        if (jnStep === 4) return { ok: true, msg: '三个原因（人口南迁、自然条件优越、社会相对安定）共同导致了<b>江南得到开发</b>。答原因题时，三点要答全。' };
        if (jnStep === 5) return { ok: false, msg: '点过头了，现在显示的是<b>影响</b>。按“从头再来”，停在结果那一环。' };
        return { ok: false, msg: '现在展开到第 ' + (jnStep + 1) + ' 环，三个原因还没全部出来，继续按“下一环”。' };
      }
    },
    {
      level: 'mid',
      title: '北魏孝文帝改革最主要的作用是',
      desc: '想想改革前后，鲜卑族和汉族的关系有什么变化。',
      options: ['加速了北方民族交融', '使北魏统一了黄河流域', '结束了南北分裂', '完成了经济重心南移'],
      answer: 0,
      hint: '说汉语、穿汉服、改汉姓、通婚，都让两个民族越来越接近。',
      explain: '孝文帝改革<b>加速了北方民族交融</b>，促进了北魏的发展。北魏统一黄河流域是 439 年，在孝文帝改革之前；结束南北分裂的是 589 年隋灭陈；经济重心南移到南宋才完成。'
    },
    {
      level: 'trap',
      title: '下列说法正确的是',
      desc: '每个选项都有一个时间或地点的小陷阱。',
      options: ['赤壁之战奠定了三国鼎立的基础', '赤壁之战一结束，魏、蜀、吴三国就同时建立了', '西晋 266 年一建立就统一了全国', '孝文帝把都城从洛阳迁到平城'],
      answer: 0,
      hint: '赤壁之战是 208 年，魏建立是 220 年。',
      explain: '赤壁之战（208 年）<b>奠定了基础</b>，魏、蜀、吴是 220—222 年才相继建立的。西晋 266 年建立，280 年灭吴才统一。孝文帝是从<b>平城迁到洛阳</b>，方向说反了。'
    },
    {
      level: 'trap',
      title: '关于江南开发，下列说法正确的是',
      desc: '注意“开发”和“经济重心南移”不是一回事。',
      options: ['为后来经济重心南移奠定了基础', '标志着我国经济重心南移已经完成', '主要原因是南方战乱不断', '和北方人口南迁没有关系'],
      answer: 0,
      hint: '经济重心南移到哪个朝代才最终完成？',
      explain: '魏晋南北朝时江南得到开发，只是为经济重心南移<b>奠定了基础</b>，南移到<b>南宋</b>才最终完成。江南开发的原因之一恰恰是南方<b>社会相对安定</b>，而北方人口南迁带来了劳动力和技术，是重要原因。'
    }
  ]);
})();
