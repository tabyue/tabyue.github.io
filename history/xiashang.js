/* 历史互动馆 · 第 2 课 夏商周：从王朝更替到百家争鸣 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();
  var NOW = 2026;

  /* ========== 时间轴与纪年 ========== */
  // approx：起止年份是推定的，要带“约”；row 对应右侧年代表的行
  var DYN = [
    { from: -2100, to: -2071, name: '夏以前', color: '#f3ede7', row: -1, note: '这时还是传说中的部落联盟时代，尧、舜、禹通过“禅让”推选首领。' },
    { from: -2070, to: -1601, name: '夏', color: '#e3cfc2', row: 0, range: '约前 2070—约前 1600 年', note: '夏朝是我国历史上第一个王朝。禹死后儿子启继位，世袭制代替了禅让制。' },
    { from: -1600, to: -1047, name: '商', color: '#ead8c6', row: 1, range: '约前 1600—约前 1046 年', note: '商朝留下了甲骨文和后母戊鼎等青铜器。' },
    { from: -1046, to: -771, name: '西周', color: '#e6d3c0', row: 2, range: '约前 1046—前 771 年', note: '西周定都镐京，实行分封制。公元前 771 年西周灭亡。' },
    { from: -770, to: -476, name: '春秋', color: '#efe0d2', row: 3, range: '前 770—前 476 年', note: '周王室衰微，诸侯争霸。春秋和战国合起来叫东周。' },
    { from: -475, to: -222, name: '战国', color: '#e3cfc2', row: 4, range: '前 475—前 221 年', note: '七雄兼并战争更激烈，各国纷纷变法，秦国经过商鞅变法最为富强。' },
    { from: -221, to: -200, name: '秦', color: '#d9bfae', row: -1, range: '前 221 年起', note: '秦灭六国，建立统一的国家，下一课接着讲。' }
  ];
  var EVENTS = [
    { id: 'xia', y: -2070, approx: true, label: '夏朝建立', note: '禹建立夏朝。' },
    { id: 'shang', y: -1600, approx: true, label: '商汤灭夏', note: '夏桀暴虐，商汤起兵灭夏，建立商朝。' },
    { id: 'pan', y: -1300, approx: true, label: '盘庚迁殷', note: '商王盘庚把都城迁到殷（今河南安阳一带），商朝统治从此稳定下来。' },
    { id: 'zhou', y: -1046, approx: true, label: '武王伐纣', note: '周武王在牧野之战中打败商纣王，商朝灭亡，西周建立。' },
    { id: 'east', y: -770, label: '平王东迁', note: '周平王把都城从镐京东迁到洛邑，东周开始，也是春秋时期的开始。' },
    { id: 'kong', y: -551, label: '孔子出生', note: '孔子生于春秋后期的鲁国，后来创立儒家学派。' },
    { id: 'zhan', y: -475, label: '进入战国', note: '按教材的划分，从公元前 475 年起进入战国时期。' },
    { id: 'shy', y: -356, label: '商鞅变法', note: '商鞅在秦孝公支持下开始变法。' },
    { id: 'chang', y: -260, label: '长平之战', note: '秦国在长平之战中大败赵国，此后东方六国再也无力单独抵抗秦国。' },
    { id: 'qin', y: -221, label: '秦统一', note: '秦灭六国，结束了春秋战国以来长期分裂的局面。' }
  ];
  var YMIN = -2100, YMAX = -200;
  var year = Math.round(L.num(st.y, -1046, YMIN, YMAX));
  var tl = L.$('#tl'), yIn = L.$('#year-in');

  function dynOf(y) { for (var i = 0; i < DYN.length; i++) if (y >= DYN[i].from && y <= DYN[i].to) return DYN[i]; return null; }
  function nearest(y) {
    var best = null;
    EVENTS.forEach(function (e) { if (Math.abs(e.y - y) <= 15 && (!best || Math.abs(e.y - y) < Math.abs(best.y - y))) best = e; });
    return best;
  }
  function drawTL() {
    var ev = nearest(year);
    var ax = L.timeline(tl, {
      from: YMIN, to: YMAX, step: 200,
      era: DYN.filter(function (d) { return d.row >= 0; }).map(function (d) { return { from: d.from, to: d.to, label: d.name, color: d.color }; }),
      events: EVENTS.map(function (e) {
        var on = ev && ev.id === e.id;
        return { id: e.id, y: e.y, label: (e.approx ? '约' + L.yrShort(e.y) + ' ' : '') + e.label, on: on, color: on ? '#a4492b' : (e.approx ? '#8a6a5a' : '#7d4d3c') };
      }),
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
    var d = dynOf(year), ev = nearest(year);
    var exactEv = ev && ev.y === year;
    L.$('#year-out').textContent = (exactEv && ev.approx ? '约 ' : '') + L.yr(year);
    L.$('#dyn-badge').textContent = d ? d.name : '—';
    L.$('#r-cent').textContent = L.century(year);
    L.$('#r-ago').innerHTML = (exactEv && ev.approx ? '约 ' : '') + L.span(year, NOW) + '<small>年前</small>';
    L.$('#r-event').textContent = ev ? (ev.approx ? '约 ' : '') + L.yr(ev.y) + '：' + ev.label : '这几年没有课本里的大事';
    var t = '';
    if (ev) t += ev.note + ' ';
    if (d) t += '<b>' + d.name + (d.range ? '（' + d.range + '）' : '') + '</b>：' + d.note + ' ';
    if (year < -841) t += '公元前 841 年以前，中国历史还没有确切的逐年纪年，所以夏、商和西周前期的年份都要带“约”。';
    else if (year <= -771) t += '从公元前 841 年起，中国历史有了确切的逐年纪年。';
    L.$('#r-text').innerHTML = t;
    L.$$('#era-table tr').forEach(function (tr, i) { tr.classList.toggle('on', !!d && d.row === i); });
    save();
  }
  L.bindRange(yIn, function (v) { year = v; render(); });
  yIn.value = year; L.paintRange(yIn);

  /* ========== 商鞅变法对比器 ========== */
  var BARS = [
    { k: 'farm', n: '粮食生产', base: 35, color: '#b07a3e' },
    { k: 'army', n: '军队战斗力', base: 35, color: '#a4492b' },
    { k: 'power', n: '国君集权', base: 30, color: '#7d4d3c' },
    { k: 'noble', n: '旧贵族特权', base: 85, color: '#9a8a80' }
  ];
  var MEAS = [
    { s: '废井田', n: '废井田，承认土地私有', fx: { farm: 20, noble: -10 }, t: '国家承认土地私有，允许自由买卖。农民种的是自己的地，干活更有劲；原来井田制下的土地关系被打破了。' },
    { s: '奖励耕织', n: '奖励耕织', fx: { farm: 30 }, t: '生产粮食和布帛多的人，可以免除徭役。大家都抢着多种地、多织布，秦国的粮仓越来越满。' },
    { s: '奖励军功', n: '奖励军功', fx: { army: 45, noble: -30 }, t: '按军功大小授予爵位和田宅；没有军功的旧贵族，不能再享受特权。普通人上阵立功也能升爵，士兵作战非常勇猛。' },
    { s: '推行县制', n: '推行县制', fx: { power: 45, noble: -15 }, t: '把小的乡、邑合并成县，由国君直接派官吏管理。地方不再由贵族把持，权力集中到国君手里，<b>加强了中央集权</b>。' }
  ];
  var POWER = ['比较落后', '有了起色', '明显增强', '越来越强', '战国后期最富强'];
  var syOn = String(st.m || '').split('').slice(0, 4).map(function (c) { return c === '1'; });
  while (syOn.length < 4) syOn.push(false);
  var syLast = -1, syLastOn = true, syAnim = null;
  var syCur = {};
  function syTarget() {
    var t = {};
    BARS.forEach(function (b) { t[b.k] = b.base; });
    MEAS.forEach(function (m, i) { if (syOn[i]) for (var k in m.fx) t[k] += m.fx[k]; });
    return t;
  }
  (function () { var t = syTarget(); for (var k in t) syCur[k] = t[k]; })();
  var sySvg = L.$('#sy');
  function lvl(v) { return v < 45 ? '低' : (v < 70 ? '中' : '高'); }
  function drawSy() {
    sySvg.innerHTML = '';
    var d = S('defs', {}, sySvg), cp = S('clipPath', { id: 'sy-clip' }, d);
    S('rect', { x: 0, y: 0, width: 400, height: 230, rx: 14 }, cp);
    var g = S('g', { 'clip-path': 'url(#sy-clip)' }, sySvg);
    S('rect', { x: 0, y: 0, width: 400, height: 230, fill: '#fbf8f5' }, g);
    S('text', { x: 16, y: 24, 'font-size': 12.5, 'font-weight': 700, fill: '#4a3a32', text: '秦国的状况' }, g);
    S('text', { x: 384, y: 24, 'text-anchor': 'end', 'font-size': 10, fill: '#8a7a70', text: '示意，不是统计数据' }, g);
    var X0 = 104, W = 228;
    var lastFx = syLast >= 0 ? MEAS[syLast].fx : {};
    BARS.forEach(function (b, i) {
      var y = 48 + i * 42, v = syCur[b.k], hit = lastFx[b.k] !== undefined;
      S('text', { x: 16, y: y + 12, 'font-size': 12.5, 'font-weight': hit ? 700 : 500, fill: hit ? '#a4492b' : '#4a3a32', text: b.n }, g);
      S('rect', { x: X0, y: y, width: W, height: 16, rx: 8, fill: '#efe7df' }, g);
      S('rect', { x: X0, y: y, width: Math.max(8, W * v / 100), height: 16, rx: 8, fill: b.color, opacity: b.k === 'noble' ? 0.75 : 0.9 }, g);
      var bx = X0 + W * b.base / 100;
      S('line', { x1: bx, y1: y - 4, x2: bx, y2: y + 20, stroke: '#4a3a32', 'stroke-width': 1.4, 'stroke-dasharray': '3 2' }, g);
      var arrow = hit ? (syLastOn === (lastFx[b.k] > 0) ? ' ↑' : ' ↓') : '';
      S('text', { x: X0 + W + 10, y: y + 12.5, 'font-size': 12.5, 'font-weight': 700, fill: hit ? '#a4492b' : '#5a4036', text: lvl(v) + arrow }, g);
    });
    S('line', { x1: 16, y1: 216, x2: 16, y2: 226, stroke: '#4a3a32', 'stroke-width': 1.4, 'stroke-dasharray': '3 2' }, g);
    S('text', { x: 24, y: 225, 'font-size': 10.5, fill: '#7a6a62', text: '虚线 = 变法前的水平；红字 = 刚才那项措施影响到的方面' }, g);
  }
  var syBtns = MEAS.map(function (m, i) {
    var b = L.html('button', { type: 'button', text: m.n, 'aria-pressed': String(syOn[i]) }, L.$('#sy-btns'));
    b.addEventListener('click', function () { syOn[i] = !syOn[i]; syLast = i; syLastOn = syOn[i]; syUpdate(); });
    return b;
  });
  function syUpdate() {
    syBtns.forEach(function (b, i) { b.setAttribute('aria-pressed', String(syOn[i])); });
    var n = syOn.filter(Boolean).length;
    L.$('#sy-name').textContent = n === 0 ? '变法前的秦国' : (n === 4 ? '变法后的秦国' : '推行了 ' + n + ' 项措施');
    L.$('#sy-badge').textContent = '已推行 ' + n + ' / 4';
    L.$('#sy-last').textContent = syLast < 0 ? '—' : (syLastOn ? '' : '撤回：') + MEAS[syLast].s;
    L.$('#sy-power').textContent = POWER[n];
    var t;
    if (n === 4) t = '四项全部推行：秦国经济发展，军队战斗力不断加强，发展成为<b>战国后期最富强的诸侯国</b>，为后来秦统一六国奠定了基础。旧贵族的特权被大大削弱，所以他们非常痛恨商鞅。';
    else if (syLast >= 0 && syLastOn) t = MEAS[syLast].t;
    else if (syLast >= 0) t = '撤回了“' + MEAS[syLast].s + '”，对应的方面又退回去了。';
    else t = '战国时期，各国都在变法图强。秦国在西部，原本比较落后。公元前 356 年，商鞅在秦孝公支持下开始变法。点一项措施试试。';
    L.$('#sy-text').innerHTML = t;
    var tg = syTarget();
    if (syAnim) { syAnim.stop(); syAnim = null; }
    if (L.REDUCED) { for (var k in tg) syCur[k] = tg[k]; drawSy(); save(); return; }
    syAnim = L.loop(function (dt) {
      var done = true;
      for (var k in tg) {
        var dv = tg[k] - syCur[k], stepV = dt * 120;
        if (Math.abs(dv) <= stepV) syCur[k] = tg[k]; else { syCur[k] += dv > 0 ? stepV : -stepV; done = false; }
      }
      drawSy();
      if (done) { syAnim = null; return false; }
    });
    save();
  }
  L.$('#sy-all').addEventListener('click', function () { syOn = [true, true, true, true]; syLast = -1; syUpdate(); });
  L.$('#sy-reset').addEventListener('click', function () { syOn = [false, false, false, false]; syLast = -1; syUpdate(); });

  /* ========== 百家争鸣配对 ========== */
  var BJ = [
    ['核心思想是“仁”，主张“为政以德”，兴办私学、“有教无类”', 'kz', '孔子，春秋末期鲁国人，<b>儒家</b>学派创始人。', ['儒家', '孔子', '“仁”，为政以德']],
    ['“民为贵，社稷次之，君为轻”，主张实行“仁政”', 'mz', '孟子，战国时期人，继承和发展了孔子的思想，是<b>儒家</b>代表人物。', ['儒家', '孟子', '民贵君轻，仁政']],
    ['主张“无为”，认为事物都有对立面，对立双方会相互转化', 'lz', '老子，春秋晚期人，<b>道家</b>学派创始人。', ['道家', '老子', '“无为”，对立转化']],
    ['主张“兼爱”“非攻”，反对战争', 'mozi', '墨子，<b>墨家</b>学派创始人，希望人们互相爱护、不要互相攻打。', ['墨家', '墨子', '兼爱，非攻']],
    ['主张“法治”，建立君主专制的中央集权国家', 'hf', '韩非，战国末期人，<b>法家</b>代表人物，他的主张适应了建立统一国家的需要。', ['法家', '韩非', '法治，中央集权']]
  ];
  var BJ_OPT = [['kz', '孔子'], ['mz', '孟子'], ['lz', '老子'], ['mozi', '墨子'], ['hf', '韩非']];
  function bjCount() { return { done: L.$$('#bj-list .choice-row[data-done]').length, right: L.$$('#bj-list .choice-row.correct').length }; }
  function bjInit() {
    L.match('#bj-list', '#bj-score', BJ, BJ_OPT, function (it, ok) { return (ok ? '' : '不对，是这位：') + it[2]; });
    L.$('#bj-score').textContent = '已答 0 / ' + BJ.length;
    bjText();
  }
  function bjText() {
    var c = bjCount(), rows = L.$$('#bj-list .choice-row'), tb = L.$('#bj-table');
    tb.innerHTML = '';
    BJ.forEach(function (it, i) {
      var r = rows[i], done = r && r.dataset.done, tr = L.html('tr', {}, tb);
      if (done && r.classList.contains('correct')) tr.className = 'on';
      (done ? it[3] : ['？', '？', '？']).forEach(function (s) { L.html('td', { text: s }, tr); });
    });
    L.$('#bj-badge').textContent = '答对 ' + c.right + ' / ' + BJ.length;
    var t;
    if (c.done < BJ.length) t = '先抓关键词：<b>仁</b>、<b>民贵</b>、<b>无为</b>、<b>兼爱</b>、<b>法治</b>，各对应一个人。配对后，表格里会填上他属于哪一家。';
    else if (c.right === BJ.length) t = '全对！孔子、孟子属<b>儒家</b>，老子属<b>道家</b>，墨子属<b>墨家</b>，韩非属<b>法家</b>。各家主张不同，其实都在回答同一个问题：天下动荡，该怎样治理国家。';
    else t = '答对 ' + c.right + ' 条。看看配错的那几行下面的说明，再按“重新配对”。';
    L.$('#bj-text').innerHTML = t;
  }
  L.$('#bj-list').addEventListener('click', function (e) { if (e.target.closest('button')) bjText(); });
  L.$('#bj-reset').addEventListener('click', bjInit);

  function save() { L.setState({ y: year, m: syOn.map(function (b) { return b ? 1 : 0; }).join('') }); }

  render();
  drawSy();
  syUpdate();
  bjInit();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '把年份调到周平王东迁、东周开始的那一年',
      desc: '在时间轴下面拖动滑块，或者直接点时间轴上的事件。',
      label: '在时间轴里操作',
      button: '检查年份',
      check: function () {
        if (year === -770) return { ok: true, msg: '公元前 770 年，周平王东迁洛邑，东周开始，春秋时期也从这一年算起。它属于公元前 8 世纪。' };
        if (year === -771) return { ok: false, msg: '公元前 771 年是西周灭亡的年份，平王东迁在<b>第二年</b>。公元前的年份，“第二年”数字要变小。' };
        if (year === -475) return { ok: false, msg: '公元前 475 年是进入<b>战国</b>的年份。东周开始得更早，往左拖。' };
        return { ok: false, msg: '现在是' + L.yr(year) + '。东周开始在西周之后、孔子出生之前。' };
      }
    },
    {
      level: 'base',
      title: '我国历史上“世袭制代替禅让制”，是从谁开始的？',
      desc: '“禅让”是把首领位置让给有德才的人，“世袭”是传给自己的儿子。',
      options: ['启继承了禹的王位', '禹建立夏朝', '商汤灭夏建立商朝', '周武王建立西周'],
      answer: 0,
      hint: '禹自己是通过禅让当上首领的，变化发生在他死后。',
      explain: '禹死后，他的儿子<b>启</b>继承了王位，从此<b>世袭制代替了禅让制</b>。禹建立夏朝是“第一个王朝”的标志，但禹本人是通过禅让接替舜的；商汤灭夏、武王伐纣是王朝更替，和这个变化无关。'
    },
    {
      level: 'base',
      title: '主张“兼爱”“非攻”的思想家是',
      desc: '“非攻”就是反对攻打别的国家。',
      options: ['墨子', '孔子', '老子', '韩非'],
      answer: 0,
      hint: '这一家的名字和创始人的名字是同一个字。',
      explain: '<b>墨子</b>是墨家创始人，主张“兼爱”（人与人互相爱护）、“非攻”（反对攻战）。孔子讲“仁”，老子讲“无为”，韩非讲“法治”。'
    },
    {
      level: 'mid',
      title: '只推行能“加强国君对地方控制”的那一项措施',
      desc: '在商鞅变法对比器里，先按“回到变法前”，再只打开一项措施，看“国君集权”那一条是不是变长了。',
      label: '在商鞅变法对比器里操作',
      button: '检查我推行的措施',
      check: function () {
        var n = syOn.filter(Boolean).length;
        if (n === 1 && syOn[3]) return { ok: true, msg: '推行<b>县制</b>，由国君直接派官吏管理地方，权力集中到国君手里，加强了中央集权。秦统一后推行的郡县制，就是在这个基础上发展来的。' };
        if (n === 0) return { ok: false, msg: '现在一项都没推行，点一个措施按钮。' };
        if (n > 1) return { ok: false, msg: '现在推行了 ' + n + ' 项。题目只要<b>一项</b>，先按“回到变法前”。' };
        return { ok: false, msg: '“' + MEAS[syOn.indexOf(true)].s + '”主要影响的不是国君集权。看哪一项让“国君集权”那一条变长。' };
      }
    },
    {
      level: 'mid',
      title: '把五句主张和五位思想家全部配对正确',
      desc: '在“百家争鸣”配对里每行点一个人物。配错了就按“重新配对”再来。',
      label: '在百家争鸣配对里操作',
      button: '检查配对',
      check: function () {
        var c = bjCount();
        if (c.done < BJ.length) return { ok: false, msg: '还有 ' + (BJ.length - c.done) + ' 行没配。' };
        if (c.right < BJ.length) return { ok: false, msg: '配对了 ' + BJ.length + ' 行，对了 ' + c.right + ' 行。读一读配错那行的说明，按“重新配对”再来。' };
        return { ok: true, msg: '孔子“仁”、孟子“民贵君轻”、老子“无为”、墨子“兼爱非攻”、韩非“法治”。前两位是儒家，后三位分别是道家、墨家、法家。' };
      }
    },
    {
      level: 'mid',
      title: '“为田开阡陌封疆，而赋税平。”（《史记·商君列传》）这反映的是商鞅变法的哪项内容？',
      desc: '“阡陌”是田间的小路，也是井田的分界线。',
      options: ['废井田，承认土地私有', '奖励军功，按军功授爵', '推行县制，国君派官管理', '奖励耕织，免除徭役'],
      answer: 0,
      hint: '“开阡陌”就是把田地的旧边界打开，这和土地制度有关。',
      explain: '“开阡陌封疆”就是打破井田的界线，对应<b>废井田，国家承认土地私有，允许自由买卖</b>。奖励军功讲的是爵位，推行县制讲的是地方管理，奖励耕织讲的是生产多少，都和“田界”无关。'
    },
    {
      level: 'trap',
      title: '关于东周，下列说法正确的是',
      desc: '这一课最容易混的一个概念。',
      options: ['东周包括春秋和战国两个时期', '东周就是战国时期', '东周从公元前 475 年开始', '东周是从周武王伐纣开始的'],
      answer: 0,
      hint: '东周从平王东迁算起，平王东迁是哪一年？',
      explain: '公元前 770 年平王东迁，<b>东周开始</b>；东周分成<b>春秋</b>（前 770—前 476 年）和<b>战国</b>（前 475—前 221 年）两段。公元前 475 年是战国的开始，不是东周的开始；周武王伐纣建立的是<b>西周</b>。'
    },
    {
      level: 'trap',
      title: '下列思想家与主张对应正确的是',
      desc: '孔子和孟子都是儒家，但名言不能张冠李戴。',
      options: ['孟子——民贵君轻', '孔子——民贵君轻', '老子——兼爱、非攻', '韩非——无为'],
      answer: 0,
      hint: '“民为贵，社稷次之，君为轻”出自哪部书？书名就是人名。',
      explain: '“民为贵，社稷次之，君为轻”出自《孟子》，是<b>孟子</b>的主张。孔子的核心是“仁”；“兼爱”“非攻”是墨子的；“无为”是老子的，韩非主张的是“法治”。'
    }
  ]);
})();
