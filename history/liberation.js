/* 历史互动馆 · 第 12 课 人民解放战争 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();
  var NOW = 2026;

  /* ========== 1945—1949 时间轴（按月） ========== */
  function M(y, m) { return y * 12 + m - 1; }
  function yOf(mi) { return Math.floor(mi / 12); }
  function fx(mi) { return yOf(mi) + (mi % 12 + 0.5) / 12; }
  function fx0(mi) { return yOf(mi) + (mi % 12) / 12; }
  function ym(mi) { return yOf(mi) + ' 年 ' + (mi % 12 + 1) + ' 月'; }
  var MIN = M(1945, 8), MAX = M(1949, 10);
  var WAR = M(1946, 6), COUNTER = M(1947, 7), DECIDE = M(1948, 9), DEC_END = M(1949, 1), RIVER = M(1949, 4), PRC = M(1949, 10);

  var EVENTS = [
    { id: 'cq', m: M(1945, 8), label: '重庆谈判', show: '1945 年 8 月 28 日起', note: '抗战胜利后，为争取和平，毛泽东等中共代表赴重庆，与国民党进行谈判。' },
    { id: 'sx', m: M(1945, 10), label: '《双十协定》', show: '1945 年 10 月 10 日', note: '国共双方签订《政府与中共代表会谈纪要》，即《双十协定》，同意长期合作、避免内战。' },
    { id: 'nz', m: M(1946, 6), label: '全面内战爆发', show: '1946 年 6 月', note: '国民党军队大举围攻中原解放区，全面内战爆发。' },
    { id: 'ya', m: M(1947, 3), label: '撤离延安', show: '1947 年 3 月', note: '国民党军队改为重点进攻陕北和山东解放区，中共中央主动撤离延安。' },
    { id: 'dbs', m: M(1947, 6), label: '挺进大别山', show: '1947 年 6 月底起', note: '刘伯承、邓小平率领晋冀鲁豫野战军主力强渡黄河，千里跃进大别山，揭开了战略反攻（也称战略进攻）的序幕。' },
    { id: 'ls', m: M(1948, 9), label: '辽沈战役', show: '1948 年 9—11 月', note: '三大战役中最先开始的一场，解放了东北全境。' },
    { id: 'hh', m: M(1948, 11), label: '淮海战役', show: '1948 年 11 月—1949 年 1 月', note: '以徐州为中心展开，长江中下游以北的广大地区获得解放。' },
    { id: 'pj', m: M(1948, 12), label: '平津战役', show: '1948 年 11 月底—1949 年 1 月', note: '攻克天津，北平和平解放，华北地区基本解放。' },
    { id: 'nj', m: M(1949, 4), label: '南京解放', show: '1949 年 4 月 23 日', note: '4 月 21 日人民解放军发起渡江战役，4 月 23 日解放南京，统治中国 22 年的国民党政权覆灭。' },
    { id: 'prc', m: M(1949, 10), label: '新中国成立', show: '1949 年 10 月 1 日', note: '中华人民共和国成立，下一课详细讲。' }
  ];
  var PH = [
    { from: WAR, to: COUNTER - 1, name: '战略防御', short: '防御', color: '#efe2d6' },
    { from: COUNTER, to: DECIDE - 1, name: '战略反攻', short: '反攻', color: '#ead7c8' },
    { from: DECIDE, to: DEC_END, name: '战略决战', short: '决战', color: '#e3c9b6' },
    { from: RIVER, to: PRC - 1, name: '渡江与进军', short: '渡江', color: '#ead7c8' }
  ];
  var month = Math.round(L.num(st.m, MIN, MIN, MAX));
  var tl = L.$('#tl'), mIn = L.$('#mon-in');

  function nearest(mi) {
    var best = null;
    EVENTS.forEach(function (e) { if (Math.abs(e.m - mi) <= 1 && (!best || Math.abs(e.m - mi) < Math.abs(best.m - mi))) best = e; });
    return best;
  }
  function phaseOf(mi) { for (var i = 0; i < PH.length; i++) if (mi >= PH[i].from && mi <= PH[i].to) return i; return -1; }
  function badgeOf(mi) {
    var p = phaseOf(mi);
    if (mi === M(1947, 6)) return '转入反攻';
    if (p >= 0) return PH[p].name;
    if (mi < WAR) return '争取和平';
    if (mi < RIVER) return '准备渡江';
    return '新中国成立';
  }
  function drawTL() {
    var ev = nearest(month);
    var ax = L.timeline(tl, {
      from: 1945, to: 1950, step: 1,
      era: PH.map(function (p) { return { from: fx0(p.from), to: fx0(p.to + 1), label: p.short, color: p.color }; }),
      events: EVENTS.map(function (e) { var on = ev && ev.id === e.id; return { id: e.id, y: fx(e.m), label: e.label, on: on, color: on ? '#a4492b' : '#7d4d3c' }; }),
      pick: function (id) { setMonth(EVENTS.filter(function (x) { return x.id === id; })[0].m); }
    });
    var x = ax.X(fx(month));
    tl.insertBefore(S('line', { x1: x, y1: 8, x2: x, y2: ax.base + 50, stroke: '#c2603f', 'stroke-width': 1.6, 'stroke-dasharray': '4 3' }), ax.layer);
    S('path', { d: 'M' + (x - 6) + ' 4h12l-6 8z', fill: '#c2603f' }, tl);
  }
  function setMonth(mi) {
    month = mi;
    mIn.value = month; L.paintRange(mIn);
    render();
  }
  function render() {
    drawTL();
    var p = phaseOf(month), ev = nearest(month);
    L.$('#mon-out').textContent = ym(month);
    L.$('#phase-badge').textContent = badgeOf(month);
    var k = month - WAR + 1;
    L.$('#r-war').innerHTML = month < WAR ? '还没爆发' : month >= RIVER ? '南京已解放' : (k >= 12 ? Math.floor(k / 12) + ' <small>年</small> ' + (k % 12 ? k % 12 + ' <small>个月</small>' : '') : k + ' <small>个月</small>');
    L.$('#r-ago').innerHTML = L.span(yOf(month), NOW) + '<small>年前</small>';
    L.$('#r-event').textContent = ev ? (ev.m === month ? '' : '约 ' + ev.show + '：') + ev.label : '前后一个月没有课本里的大事';
    var t = ev ? ev.note + ' ' : '';
    if (month < WAR) t += '抗战刚胜利，人民渴望和平。中国共产党为争取和平建国作出努力。';
    else if (p === 0) t += '<b>战略防御</b>：人民解放军以歼灭敌人有生力量为主要目标，不在乎一城一地的得失。';
    else if (p === 1) t += '<b>战略反攻</b>：解放军把战争引向国民党统治区。';
    else if (p === 2) t += '<b>战略决战</b>：三大战役基本上消灭了国民党军队的主力。';
    else if (month < RIVER) t += '三大战役结束后，人民解放军在长江北岸集结，准备渡江。';
    else if (month < PRC) t += '南京解放后，人民解放军继续向全国进军。';
    L.$('#r-text').innerHTML = t;
    [0, 1, 2, 3].forEach(function (i) { L.$('#ph-' + i).classList.toggle('on', i === p); });
    save();
  }
  L.bindRange(mIn, function (v) { month = v; render(); });
  mIn.value = month; L.paintRange(mIn);

  /* ========== 三大战役甘特图 ========== */
  // 天数从 1948 年 9 月 1 日记为 0，到 1949 年 2 月 28 日
  var DAYS = 181, GX0 = 74, GX1 = 386;
  var MONTHS = [[0, '1948.9'], [30, '10 月'], [61, '11 月'], [91, '12 月'], [122, '1949.1'], [153, '2 月']];
  var BT = [
    { id: 'ls', n: '辽沈战役', s: 11, e: 62, time: '1948.9.12—11.2', where: '东北 · 东北野战军', t: '三大战役中最先开始。解放军先攻克锦州，关闭了国民党军队从东北退回关内的大门，最后<b>解放东北全境</b>。' },
    { id: 'hh', n: '淮海战役', s: 66, e: 131, time: '1948.11.6—1949.1.10', where: '以徐州为中心 · 华东野战军、中原野战军', t: '以徐州为中心展开。大批民工推着小车支援前线，<b>长江中下游以北的广大地区获得解放</b>。' },
    { id: 'pj', n: '平津战役', s: 89, e: 152, time: '1948.11.29—1949.1.31', where: '北平、天津、张家口一带 · 东北野战军和华北军区部队', t: '解放军攻克天津，<b>北平和平解放</b>，使古都北平免遭战火破坏，<b>华北地区基本解放</b>。' }
  ];
  var sel = BT.filter(function (b) { return b.id === st.c; })[0] || BT[0];
  var gantt = L.$('#gantt');
  function GX(d) { return GX0 + d / DAYS * (GX1 - GX0); }
  function drawGantt() {
    gantt.innerHTML = '';
    var d = S('defs', {}, gantt), cp = S('clipPath', { id: 'g-clip' }, d);
    S('rect', { x: 0, y: 0, width: 400, height: 230, rx: 14 }, cp);
    var g = S('g', { 'clip-path': 'url(#g-clip)' }, gantt);
    S('rect', { x: 0, y: 0, width: 400, height: 230, fill: '#fbf8f5' }, g);
    MONTHS.forEach(function (m) {
      S('line', { x1: GX(m[0]), y1: 34, x2: GX(m[0]), y2: 186, stroke: '#e6dbd2', 'stroke-width': 1 }, g);
      S('text', { x: GX(m[0]) + 3, y: 26, 'font-size': 10.5, fill: '#8a7a70', text: m[1] }, g);
    });
    // 淮海、平津同时进行的时段
    S('rect', { x: GX(89), y: 92, width: GX(131) - GX(89), height: 94, fill: '#f3e3d8', opacity: 0.8 }, g);
    S('text', { x: (GX(89) + GX(131)) / 2, y: 202, 'text-anchor': 'middle', 'font-size': 10.5, fill: '#a4492b', 'font-weight': 600, text: '这段时间淮海、平津同时进行' }, g);
    S('path', { d: 'M' + GX(89) + ' 188v4M' + GX(131) + ' 188v4', stroke: '#a4492b' }, g);
    BT.forEach(function (b, i) {
      var y = 64 + i * 48, on = b.id === sel.id;
      var hit = S('g', { class: 'svg-hit', tabindex: 0, role: 'button', 'aria-label': b.n }, g);
      S('text', { x: 12, y: y + 4.5, 'font-size': 12.5, 'font-weight': 700, fill: on ? '#a4492b' : '#4a3a32', text: b.n }, hit);
      S('rect', { x: GX(b.s), y: y - 14, width: GX(b.e + 1) - GX(b.s), height: 28, rx: 7, fill: on ? '#a4492b' : '#e3c9b6', stroke: on ? '#7d4d3c' : '#cdb3a4', 'stroke-width': 1.2 }, hit);
      S('text', { x: (GX(b.s) + GX(b.e + 1)) / 2, y: y + 4, 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': 600, fill: on ? '#fff' : '#5a4036', text: (b.e - b.s + 1) + ' 天' }, hit);
      function pick() { sel = b; chipsBT.set(b.id); drawGantt(); }
      hit.style.cursor = 'pointer';
      hit.addEventListener('click', pick);
      hit.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    });
    S('text', { x: 200, y: 222, 'text-anchor': 'middle', 'font-size': 10, fill: '#a0908a', text: '横条长度 = 战役持续的天数' }, g);
    var k = BT.indexOf(sel);
    L.$('#bt-name').textContent = sel.n;
    L.$('#bt-badge').textContent = '第 ' + (k + 1) + ' 场开始';
    L.$('#bt-time').textContent = sel.time;
    L.$('#bt-days').innerHTML = (sel.e - sel.s + 1) + '<small>天</small>';
    L.$('#bt-where').textContent = sel.where;
    L.$('#bt-text').innerHTML = sel.t + ' 三大战役合起来，<b>基本上消灭了国民党军队的主力</b>，加速了全国解放的进程。';
    BT.forEach(function (b) { L.$('#cmp-' + b.id).classList.toggle('on', b.id === sel.id); });
    save();
  }
  var chipsBT = L.chips(L.$('#bt-chips'), BT.map(function (b) { return { label: b.n, value: b.id }; }), sel.id, function (v) { sel = BT.filter(function (b) { return b.id === v; })[0]; drawGantt(); });

  /* ========== 战略阶段推进 ========== */
  var STAGES = [
    { n: '战略防御', b: '1946.6—1947.6', who: '国民党军队', where: '解放区', t: '国民党军队先全面进攻，后改为重点进攻陕北和山东解放区。人民解放军<b>以歼灭敌人有生力量为主要目标</b>，不以保守或夺取地方为主要目标；1947 年 3 月中共中央主动撤离延安。' },
    { n: '战略反攻', b: '1947.6 底起', who: '人民解放军', where: '国民党统治区', t: '刘伯承、邓小平率领晋冀鲁豫野战军主力<b>千里跃进大别山</b>，揭开了战略反攻（也称战略进攻）的序幕。从此，解放军把战争引向国民党统治区。' },
    { n: '战略决战', b: '1948.9—1949.1', who: '人民解放军', where: '东北、华东、华北', t: '辽沈、淮海、平津<b>三大战役</b>，基本上消灭了国民党军队的主力，大大加速了全国解放的进程。' },
    { n: '渡江战役', b: '1949.4', who: '人民解放军', where: '长江以南', t: '国民党政府拒绝签署国内和平协定。4 月 21 日人民解放军发起渡江战役，<b>4 月 23 日解放南京</b>，统治中国 22 年的国民党政权覆灭。此后解放军向全国进军。' }
  ];
  var sg = Math.round(L.num(st.g, 0, 0, STAGES.length - 1));
  var stSvg = L.$('#stage');
  function zone(g, x, w, label, fill) {
    S('rect', { x: x, y: 40, width: w, height: 120, rx: 12, fill: fill, stroke: '#e0d2c6' }, g);
    S('text', { x: x + w / 2, y: 30, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: '#5a4036', text: label }, g);
  }
  function tag(g, x, y, t, c) {
    var w = t.length * 12 + 14;
    S('rect', { x: x - w / 2, y: y - 12, width: w, height: 22, rx: 11, fill: '#fff', stroke: c, 'stroke-width': 1.4 }, g);
    S('text', { x: x, y: y + 3.5, 'text-anchor': 'middle', 'font-size': 11.5, 'font-weight': 700, fill: c, text: t }, g);
  }
  function drawStage() {
    stSvg.innerHTML = '';
    var d = S('defs', {}, stSvg), cp = S('clipPath', { id: 's-clip' }, d);
    S('rect', { x: 0, y: 0, width: 400, height: 210, rx: 14 }, cp);
    var g = S('g', { 'clip-path': 'url(#s-clip)' }, stSvg);
    S('rect', { x: 0, y: 0, width: 400, height: 210, fill: '#fbf8f5' }, g);
    zone(g, 14, 176, '解放区', '#f6ece4');
    zone(g, 210, 176, '国民党统治区', '#f1eeea');
    var red = '#a4492b', grey = '#7a6f69';
    if (sg === 0) {
      L.arrow(g, 290, 100, 120, 100, { color: grey, width: 4, head: 14 });
      S('text', { x: 300, y: 88, 'text-anchor': 'middle', 'font-size': 11, fill: grey, 'font-weight': 600, text: '国民党军队进攻' }, g);
      tag(g, 90, 134, '在解放区内歼敌', red);
    } else if (sg === 1) {
      L.arrow(g, 110, 100, 268, 100, { color: red, width: 4, head: 14 });
      S('text', { x: 150, y: 88, 'text-anchor': 'middle', 'font-size': 11, fill: red, 'font-weight': 600, text: '解放军转入反攻' }, g);
      tag(g, 300, 100, '大别山', red);
      S('text', { x: 298, y: 136, 'text-anchor': 'middle', 'font-size': 10.5, fill: '#8a7a70', text: '战争引向国民党统治区' }, g);
    } else if (sg === 2) {
      L.arrow(g, 50, 100, 160, 100, { color: red, width: 5, head: 15 });
      tag(g, 200, 66, '辽沈', red); tag(g, 200, 100, '淮海', red); tag(g, 200, 134, '平津', red);
      S('text', { x: 100, y: 136, 'text-anchor': 'middle', 'font-size': 10.5, fill: '#8a7a70', text: '三场大决战' }, g);
    } else {
      S('path', { d: 'M300 44 q8 14 0 28 q-8 14 0 28 q8 14 0 28 q-8 14 0 28', fill: 'none', stroke: '#8fb3c9', 'stroke-width': 6, 'stroke-linecap': 'round' }, g);
      S('text', { x: 300, y: 176, 'text-anchor': 'middle', 'font-size': 10.5, fill: '#5d87a0', text: '长江（示意）' }, g);
      L.arrow(g, 110, 100, 336, 100, { color: red, width: 4, head: 14 });
      tag(g, 356, 132, '南京', red);
      S('text', { x: 150, y: 88, 'text-anchor': 'middle', 'font-size': 11, fill: red, 'font-weight': 600, text: '渡过长江' }, g);
    }
    S('text', { x: 200, y: 198, 'text-anchor': 'middle', 'font-size': 10, fill: '#a0908a', text: '示意：只表示进攻方向，不表示实际地理位置和疆域' }, g);
    var s = STAGES[sg];
    L.$('#sg-name').textContent = s.n;
    L.$('#sg-badge').textContent = s.b;
    L.$('#sg-who').textContent = s.who;
    L.$('#sg-where').textContent = s.where;
    L.$('#sg-text').innerHTML = s.t;
    var steps = L.$('#stage-steps');
    steps.innerHTML = '';
    STAGES.forEach(function (x, i) {
      if (i) L.html('i', { text: '→' }, steps);
      var sp = L.html('span', { text: x.n, role: 'button', tabindex: '0', class: i === sg ? 'on' : i < sg ? 'done' : null }, steps);
      sp.addEventListener('click', function () { sg = i; drawStage(); });
      sp.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sg = i; drawStage(); } });
    });
    L.$('#stage-next').textContent = sg === STAGES.length - 1 ? '再看一遍' : '下一阶段 →';
    save();
  }
  L.$('#stage-next').addEventListener('click', function () { sg = sg === STAGES.length - 1 ? 0 : sg + 1; drawStage(); });
  L.$('#stage-reset').addEventListener('click', function () { sg = 0; drawStage(); });

  function save() { L.setState({ m: month, c: sel.id, g: sg }); }

  render();
  drawGantt();
  drawStage();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '把滑块调到南京解放的那个月',
      desc: '在时间轴下面拖动滑块，或者点时间轴上的事件。',
      label: '在时间轴里操作',
      button: '检查月份',
      check: function () {
        if (month === RIVER) return { ok: true, msg: '1949 年 4 月 21 日发起渡江战役，4 月 23 日解放南京，统治中国 22 年的国民党政权覆灭。' };
        if (month === PRC) return { ok: false, msg: '1949 年 10 月是新中国成立。南京解放比它早将近半年。' };
        return { ok: false, msg: '现在是' + ym(month) + '。南京解放在三大战役结束之后、新中国成立之前。' };
      }
    },
    {
      level: 'base',
      title: '重庆谈判后，国共双方签订的是',
      desc: '1945 年 10 月 10 日签订。',
      options: ['《双十协定》', '《中国土地法大纲》', '《中华民国临时约法》', '《共同纲领》'],
      answer: 0,
      hint: '名字和签订日期有关。',
      explain: '重庆谈判后签订《政府与中共代表会谈纪要》，因为在 10 月 10 日签订，称<b>《双十协定》</b>。《中国土地法大纲》是 1947 年土地改革的文件；《中华民国临时约法》是辛亥革命后颁布的；《共同纲领》是 1949 年 9 月通过的。'
    },
    {
      level: 'base',
      title: '揭开人民解放军战略反攻序幕的是',
      desc: '1947 年 6 月底。',
      options: ['刘邓大军千里跃进大别山', '辽沈战役', '渡江战役', '重庆谈判'],
      answer: 0,
      hint: '刘伯承、邓小平率领晋冀鲁豫野战军主力强渡黄河。',
      explain: '<b>千里跃进大别山</b>揭开了战略反攻（也称战略进攻）的序幕。辽沈战役是战略决战的开始；渡江战役在 1949 年；重庆谈判在内战爆发之前。'
    },
    {
      level: 'mid',
      title: '找出使“长江中下游以北的广大地区获得解放”的那场战役',
      desc: '在三大战役对比图里点出它。',
      label: '在三大战役对比图里操作',
      button: '检查',
      check: function () {
        if (sel.id === 'hh') return { ok: true, msg: '淮海战役以徐州为中心，历时 66 天，长江中下游以北的广大地区获得解放。也是“小车推出来”的那场战役。' };
        if (sel.id === 'ls') return { ok: false, msg: '辽沈战役的结果是解放东北全境。' };
        return { ok: false, msg: '平津战役的结果是北平和平解放、华北基本解放。' };
      }
    },
    {
      level: 'mid',
      title: '把阶段推进到“三大战役”所在的阶段',
      desc: '在“从防御到渡江”里按“下一阶段”往前推。',
      label: '在阶段推进图里操作',
      button: '检查阶段',
      check: function () {
        if (sg === 2) return { ok: true, msg: '1948 年 9 月—1949 年 1 月是<b>战略决战</b>阶段，三大战役基本上消灭了国民党军队的主力。' };
        if (sg < 2) return { ok: false, msg: '现在是“' + STAGES[sg].n + '”，还要往后推。' };
        return { ok: false, msg: '渡江战役在三大战役之后，往回退一步。' };
      }
    },
    {
      level: 'mid',
      title: '三大战役的共同意义是',
      desc: '想一想三场战役合起来做成了什么。',
      options: ['基本上消灭了国民党军队的主力，加速了全国解放的进程', '标志着国民党政权覆灭', '标志着全面内战爆发', '揭开了战略反攻的序幕'],
      answer: 0,
      hint: '“战略决战”决的是双方的主力。',
      explain: '三大战役<b>基本上消灭了国民党军队的主力</b>，加速了全国解放的进程。国民党政权覆灭的标志是南京解放；全面内战爆发是 1946 年围攻中原解放区；战略反攻的序幕是挺进大别山。'
    },
    {
      level: 'trap',
      title: '关于三大战役的时间，说法正确的是',
      desc: '可以在甘特图里看横条的位置。',
      options: ['辽沈战役最先开始，淮海和平津有一段时间同时进行', '三场战役依次进行，一场打完才开始下一场', '淮海战役最先开始', '平津战役最先结束'],
      answer: 0,
      hint: '看图里的阴影部分。',
      explain: '辽沈战役（1948.9.12—11.2）<b>最先开始</b>；淮海（11.6—1.10）和平津（11.29—1.31）有一段时间<b>同时进行</b>。三场不是一场接一场；最先结束的是辽沈，最后结束的是平津。'
    },
    {
      level: 'trap',
      title: '标志着统治中国 22 年的国民党政权覆灭的是',
      desc: '别和新中国成立弄混。',
      options: ['1949 年 4 月南京解放', '1949 年 10 月中华人民共和国成立', '1949 年 1 月北平和平解放', '1948 年 11 月辽沈战役结束'],
      answer: 0,
      hint: '国民党政府的首都在哪里？',
      explain: '1949 年 4 月 23 日人民解放军解放<b>南京</b>，标志着国民党政权覆灭。新中国成立是 10 月 1 日，是另一件大事；北平和平解放、辽沈战役结束都属于战略决战阶段。'
    }
  ]);
})();
