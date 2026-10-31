/* 历史互动馆 · 第 11 课 中华民族的抗日战争 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();
  var NOW = 2026;

  /* ========== 十四年抗战时间轴（按月） ========== */
  function M(y, m) { return y * 12 + m - 1; }              // 月份编号
  function yOf(mi) { return Math.floor(mi / 12); }
  function moOf(mi) { return mi % 12 + 1; }
  function fx(mi) { return yOf(mi) + (mi % 12 + 0.5) / 12; } // 时间轴上的位置（月中）
  function fx0(mi) { return yOf(mi) + (mi % 12) / 12; }     // 月初
  function ym(mi) { return yOf(mi) + ' 年 ' + moOf(mi) + ' 月'; }
  var MIN = M(1931, 7), MAX = M(1945, 12);
  var START = M(1931, 9), FULL = M(1937, 7), HOLD = M(1938, 10), LATE = M(1944, 1), WIN = M(1945, 8);

  var EVENTS = [
    { id: 'jyb', m: M(1931, 9), label: '九一八事变', show: '1931 年 9 月 18 日', note: '日本关东军炸毁沈阳北郊柳条湖附近的一段铁路，反诬中国军队所为，随即进攻沈阳。中国人民抗日战争由此开始，也揭开了世界反法西斯战争的序幕。' },
    { id: 'yej', m: M(1935, 12), label: '一二·九运动', show: '1935 年 12 月 9 日', note: '日本加紧侵略华北，北平学生举行抗日救亡示威游行，掀起了全国抗日救亡运动的新高潮。' },
    { id: 'xian', m: M(1936, 12), label: '西安事变', show: '1936 年 12 月 12 日', note: '张学良、杨虎城在西安扣押蒋介石，要求停止内战、一致抗日。事变和平解决，成为时局转换的枢纽，十年内战基本结束。' },
    { id: 'qq', m: M(1937, 7), label: '七七事变', show: '1937 年 7 月 7 日', note: '日军在北平西南的卢沟桥附近挑起事变，中国守军奋起抵抗。七七事变标志着全民族抗战开始。' },
    { id: 'sh', m: M(1937, 8), label: '淞沪会战', show: '1937 年 8 月 13 日起', note: '中国军队在上海一带与日军激战约三个月，粉碎了日本“三个月灭亡中国”的狂妄计划。' },
    { id: 'pxg', m: M(1937, 9), label: '平型关大捷', show: '1937 年 9 月', note: '八路军一一五师在山西平型关伏击日军，这是全民族抗战以来中国军队的第一个大胜仗，打破了“日军不可战胜”的神话。' },
    { id: 'nj', m: M(1937, 12), label: '南京大屠杀', show: '1937 年 12 月 13 日起', note: '日军攻占南京后，在 6 周时间里疯狂屠杀中国平民和放下武器的士兵，遇难同胞 30 万以上。每年 12 月 13 日是南京大屠杀死难者国家公祭日。' },
    { id: 'tez', m: M(1938, 3), label: '台儿庄战役', show: '1938 年 3—4 月', note: '李宗仁指挥中国军队在山东台儿庄一带与日军激战，取得重大胜利，鼓舞了全国军民的抗战信心。' },
    { id: 'wh', m: M(1938, 10), label: '广州武汉失守', show: '1938 年 10 月', note: '日军占领广州、武汉，抗日战争进入战略相持阶段。' },
    { id: 'bt', m: M(1940, 8), label: '百团大战', show: '1940 年 8 月起', note: '八路军在华北发动的大规模进攻战役，是抗战期间八路军主动出击日军规模最大的一次战役，坚定了全国军民抗战胜利的信心。' },
    { id: 'win', m: M(1945, 8), label: '日本投降', show: '1945 年 8 月 15 日', note: '日本宣布无条件投降，9 月 2 日签署投降书。中国人民抗日战争取得胜利。' }
  ];
  var month = Math.round(L.num(st.m, START, MIN, MAX));
  var tl = L.$('#tl'), mIn = L.$('#mon-in');

  function nearest(mi) {
    var best = null;
    EVENTS.forEach(function (e) { if (Math.abs(e.m - mi) <= 2 && (!best || Math.abs(e.m - mi) < Math.abs(best.m - mi))) best = e; });
    return best;
  }
  function phaseOf(mi) { return mi < START ? -1 : mi < FULL ? 0 : mi <= WIN ? 1 : 2; }
  function drawTL() {
    var ev = nearest(month);
    var ax = L.timeline(tl, {
      from: 1931, to: 1946, step: 2,
      era: [
        { from: fx0(START), to: fx0(FULL), label: '局部抗战', color: '#efe2d6' },
        { from: fx0(FULL), to: fx0(WIN + 1), label: '全民族抗战', color: '#e6cfbf' }
      ],
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
    var ph = phaseOf(month), ev = nearest(month);
    L.$('#mon-out').textContent = ym(month);
    L.$('#phase-badge').textContent = ['事变前夕', '局部抗战', '全民族抗战', '抗战胜利'][ph + 1];
    L.$('#r-nth').innerHTML = ph < 0 ? '还没开始' : ph === 2 ? '已经胜利' : '第 ' + (Math.floor((month - START) / 12) + 1) + ' <small>年</small>';
    L.$('#r-ago').innerHTML = L.span(yOf(month), NOW) + '<small>年前</small>';
    L.$('#r-event').textContent = ev ? (ev.m === month ? '' : '约 ' + ev.show + '：') + ev.label : '前后两个月没有课本里的大事';
    var t = ev ? ev.note + ' ' : '';
    if (ph < 0) t += '这时日本正在策划侵占中国东北，局部抗战还没有开始。';
    else if (ph === 0) t += '这是<b>局部抗战</b>时期：东北、华北等地军民奋起抵抗，全国抗日救亡运动不断高涨。';
    else if (ph === 2) t += '1945 年 9 月 3 日被定为中国人民抗日战争胜利纪念日；10 月 25 日中国政府在台北接受日军投降，台湾回归中国。';
    else if (month < HOLD) t += '全民族抗战的<b>战略防御阶段</b>：正面战场组织多次大会战，八路军、新四军开赴敌后。';
    else if (month < LATE) t += '1938 年 10 月以后进入<b>战略相持阶段</b>，敌后战场逐渐成为抗日的主战场。';
    else t += '抗战后期，中国军民逐步转入反攻，胜利越来越近。';
    L.$('#r-text').innerHTML = t;
    [0, 1, 2].forEach(function (k) { L.$('#ph-' + k).classList.toggle('on', k === ph); });
    save();
  }
  L.bindRange(mIn, function (v) { month = v; render(); });
  mIn.value = month; L.paintRange(mIn);

  /* ========== 两个战场 ========== */
  var BATTLES = [
    { id: 'sh', n: '淞沪会战', side: 'front', x: 105, y: 158, when: '1937 年', stage: 'def', who: '国民党军队', t: '1937 年 8 月 13 日起，中国军队在上海一带苦战约三个月，粉碎了日本“三个月灭亡中国”的狂妄计划。' },
    { id: 'tez', n: '台儿庄战役', side: 'front', x: 105, y: 194, when: '1938 年', stage: 'def', who: '国民党军队', t: '1938 年春，李宗仁指挥中国军队在山东台儿庄一带与日军激战，取得重大胜利，鼓舞了全国军民。' },
    { id: 'wh', n: '武汉会战', side: 'front', x: 105, y: 230, when: '1938 年', stage: 'def', who: '国民党军队', t: '1938 年中国军队在武汉外围与日军进行大规模会战，消耗了日军大量兵力。10 月武汉失守，此后抗战进入战略相持阶段。' },
    { id: 'pxg', n: '平型关大捷', side: 'back', x: 295, y: 158, when: '1937 年', stage: 'def', who: '八路军', t: '1937 年 9 月，八路军一一五师在山西平型关伏击日军，取得全民族抗战以来中国军队的第一个大胜仗。' },
    { id: 'gen', n: '敌后根据地', side: 'back', x: 295, y: 194, when: '1937 年起', stage: 'both', who: '八路军、新四军', t: '八路军、新四军深入敌后，发动群众，建立了晋察冀等抗日根据地，在日军后方开展游击战，牵制了大量日军。' },
    { id: 'bt', n: '百团大战', side: 'back', x: 295, y: 230, when: '1940 年', stage: 'hold', who: '八路军', t: '1940 年 8 月起，八路军在华北发动大规模进攻战役，这是抗战期间八路军主动出击日军规模最大的一次战役。' }
  ];
  var stage = st.s === 'hold' ? 'hold' : 'def';
  var battle = BATTLES.filter(function (b) { return b.id === st.b; })[0] || BATTLES[0];
  var bf = L.$('#bf');
  function bfBox(x, y, w, h, label, sub, o) {
    o = o || {};
    S('rect', { x: x - w / 2, y: y - h / 2, width: w, height: h, rx: 9, fill: o.fill || '#fff', stroke: o.stroke || '#cdb7a8', 'stroke-width': o.sw || 1.4 }, o.p || bf);
    S('text', { x: x, y: y + (sub ? -2 : 4.5), 'text-anchor': 'middle', 'font-size': o.fs || 12.5, 'font-weight': 700, fill: o.color || '#4a3a32', text: label }, o.p || bf);
    if (sub) S('text', { x: x, y: y + 13, 'text-anchor': 'middle', 'font-size': 10, fill: o.subColor || '#8a7a70', text: sub }, o.p || bf);
  }
  function drawBF() {
    bf.innerHTML = '';
    var d = S('defs', {}, bf), cp = S('clipPath', { id: 'bf-clip' }, d);
    S('rect', { x: 0, y: 0, width: 400, height: 270, rx: 14 }, cp);
    var g = S('g', { 'clip-path': 'url(#bf-clip)' }, bf);
    S('rect', { x: 0, y: 0, width: 400, height: 270, fill: '#fbf8f5' }, g);
    var hold = stage === 'hold';
    // 统一战线
    bfBox(200, 28, 236, 38, '抗日民族统一战线', '1937 年 9 月国共第二次合作，正式形成', { p: g, stroke: '#7d4d3c', sw: 2 });
    S('path', { d: 'M150 47 L105 70 M250 47 L295 70', stroke: '#b9a89c', 'stroke-width': 1.6, fill: 'none' }, g);
    // 两个战场
    var fMain = !hold, bMain = hold;
    bfBox(105, 92, 150, 40, '正面战场', '国民党军队为主', { p: g, stroke: fMain ? '#a4492b' : '#cdb7a8', sw: fMain ? 2.4 : 1.4, fill: fMain ? '#f8ece6' : '#fff' });
    bfBox(295, 92, 150, 40, '敌后战场', '八路军、新四军等', { p: g, stroke: bMain ? '#a4492b' : '#cdb7a8', sw: bMain ? 2.4 : 1.4, fill: bMain ? '#f8ece6' : '#fff' });
    L.arrow(g, 184, 86, 214, 86, { color: '#7d4d3c', width: 1.6, head: 7 });
    L.arrow(g, 216, 98, 186, 98, { color: '#7d4d3c', width: 1.6, head: 7 });
    S('text', { x: 200, y: 120, 'text-anchor': 'middle', 'font-size': 10.5, fill: '#7d4d3c', 'font-weight': 600, text: '相互配合' }, g);
    if (fMain) S('text', { x: 105, y: 130, 'text-anchor': 'middle', 'font-size': 10.5, fill: '#a4492b', 'font-weight': 700, text: '组织多次大会战' }, g);
    if (bMain) S('text', { x: 295, y: 130, 'text-anchor': 'middle', 'font-size': 10.5, fill: '#a4492b', 'font-weight': 700, text: '逐渐成为主战场' }, g);
    // 战役节点
    BATTLES.forEach(function (b) {
      var inStage = b.stage === 'both' || b.stage === stage, on = b.id === battle.id;
      var hit = S('g', { class: 'svg-hit', tabindex: 0, role: 'button', 'aria-label': b.n, opacity: inStage ? 1 : 0.4 }, g);
            bfBox(b.x, b.y, 144, 26, b.n + '  ' + b.when, null, { p: hit, fs: 12, stroke: on ? '#a4492b' : '#d9c9be', sw: on ? 2.2 : 1.2, fill: on ? '#fff4ee' : '#fff', color: on ? '#a4492b' : '#4a3a32' });
      function pick() { battle = b; drawBF(); }
      hit.style.cursor = 'pointer';
      hit.addEventListener('click', pick);
      hit.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    });
    var front = battle.side === 'front';
    L.$('#bt-name').textContent = battle.n;
    L.$('#bt-badge').textContent = battle.when;
    L.$('#bt-side').textContent = front ? '正面战场' : '敌后战场';
    L.$('#bt-who').textContent = battle.who;
    L.$('#bt-text').innerHTML = battle.t;
    L.$('#stage-text').innerHTML = hold
      ? '<b>战略相持阶段（1938 年 10 月以后）</b>：日军把主要兵力转向敌后，<b>敌后战场逐渐成为抗日的主战场</b>；正面战场继续抗击日军。中国共产党在全民族抗战中发挥了中流砥柱作用。'
      : '<b>战略防御阶段（1937 年 7 月—1938 年 10 月）</b>：正面战场组织淞沪、太原、徐州、武汉等多次大会战；八路军、新四军开赴敌后，开辟敌后战场。';
    save();
  }
  L.chips(L.$('#stage-chips'), [{ label: '战略防御', value: 'def' }, { label: '战略相持', value: 'hold' }], stage, function (v) { stage = v; drawBF(); });

  /* ========== 排序 ========== */
  var ORD = [
    { label: '九一八事变', y: 1931.71, show: '1931 年 9 月' },
    { label: '西安事变', y: 1936.96, show: '1936 年 12 月' },
    { label: '七七事变', y: 1937.54, show: '1937 年 7 月' },
    { label: '南京大屠杀', y: 1937.96, show: '1937 年 12 月' },
    { label: '台儿庄战役', y: 1938.25, show: '1938 年 3—4 月' },
    { label: '百团大战', y: 1940.63, show: '1940 年 8 月起' }
  ];
  var ordOk = false;
  function makeOrder() {
    ordOk = false;
    L.$('#ord-badge').textContent = '还没排';
    L.$('#ord-text').innerHTML = '先想想：哪件事是 14 年抗战的起点？哪件事标志着全民族抗战开始？';
    L.order(L.$('#ord'), ORD, function (ok) {
      ordOk = ok;
      L.$('#ord-badge').textContent = ok ? '全对' : '有错';
      L.$('#ord-text').innerHTML = ok
        ? '九一八事变（起点）→ 西安事变（内战基本结束）→ 七七事变（全民族抗战开始）→ 南京大屠杀 → 台儿庄战役 → 百团大战。记住两个“分界点”：<b>1931</b> 和 <b>1937</b>。'
        : '橙色的位置不对，看看每项后面的年月。七七事变和南京大屠杀都在 1937 年，要比月份：7 月在 12 月前面。按“打乱重来”再试一次。';
    });
  }
  L.$('#ord-reset').addEventListener('click', makeOrder);

  function save() { L.setState({ m: month, s: stage, b: battle.id }); }

  render();
  drawBF();
  makeOrder();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '把滑块调到全民族抗战开始的那个月',
      desc: '在时间轴下面拖动滑块，或者点时间轴上的事件。',
      label: '在时间轴里操作',
      button: '检查月份',
      check: function () {
        if (month === FULL) return { ok: true, msg: '1937 年 7 月 7 日七七事变（卢沟桥事变），全民族抗战开始。这时 14 年抗战已经进行到第 6 年。' };
        if (month === START) return { ok: false, msg: '1931 年 9 月是九一八事变，是 14 年抗战的<b>起点</b>（局部抗战），还不是全民族抗战。' };
        return { ok: false, msg: '现在是' + ym(month) + '。全民族抗战从卢沟桥的枪声开始，比西安事变晚半年多。' };
      }
    },
    {
      level: 'base',
      title: '中国人民抗日战争的起点是',
      desc: '教材的说法是“14 年抗战”。',
      options: ['1931 年九一八事变', '1937 年七七事变', '1936 年西安事变', '1937 年淞沪会战'],
      answer: 0,
      hint: '从 1945 年往前数 14 年。',
      explain: '<b>九一八事变</b>是中国人民抗日战争的起点，从 1931 年到 1945 年共 14 年。七七事变是<b>全民族抗战</b>的开始；西安事变是推动国共再次合作的转折；淞沪会战是全民族抗战初期正面战场的大会战。'
    },
    {
      level: 'base',
      title: '全民族抗战以来中国军队的第一个大胜仗是',
      desc: '可以在两个战场图里点一点各个战役。',
      options: ['平型关大捷', '台儿庄战役', '百团大战', '淞沪会战'],
      answer: 0,
      hint: '1937 年 9 月，八路军一一五师在山西打的伏击战。',
      explain: '<b>平型关大捷</b>（1937 年 9 月）打破了“日军不可战胜”的神话。台儿庄战役在 1938 年，是正面战场的重大胜利；百团大战在 1940 年；淞沪会战粉碎了“三个月灭亡中国”的计划，但不是一场大捷。'
    },
    {
      level: 'mid',
      title: '找出战略相持阶段敌后战场规模最大的主动出击',
      desc: '在“两个战场”里先切到<b>战略相持</b>，再点出那场战役。',
      label: '在两个战场图里操作',
      button: '检查',
      check: function () {
        if (stage !== 'hold') return { ok: false, msg: '先把阶段切换到“战略相持”，看看哪个战场逐渐成为主战场。' };
        if (battle.id !== 'bt') return { ok: false, msg: '现在选的是“' + battle.n + '”。要找的是 1940 年八路军在华北发动的那一场。' };
        return { ok: true, msg: '百团大战（1940 年 8 月起）是抗战期间八路军主动出击日军规模最大的一次战役。相持阶段，敌后战场逐渐成为抗日的主战场。' };
      }
    },
    {
      level: 'mid',
      title: '把 6 件抗战大事排对顺序',
      desc: '在“给抗战大事排先后”里点满 6 个，要全部排对。排错了按“打乱重来”。',
      label: '在排序题里操作',
      button: '检查排序',
      check: function () {
        if (ordOk) return { ok: true, msg: '1931 九一八 → 1936 西安事变 → 1937 七七事变 → 1937 南京大屠杀 → 1938 台儿庄 → 1940 百团大战。' };
        return { ok: false, msg: '还没有全部排对。先找起点（1931 年），再注意 1937 年的两件事：7 月在 12 月前。' };
      }
    },
    {
      level: 'mid',
      title: '西安事变和平解决的意义是',
      desc: '1936 年 12 月，张学良、杨虎城在西安扣押蒋介石，要求停止内战、一致抗日。',
      options: ['成为时局转换的枢纽，十年内战基本结束', '标志着全民族抗战开始', '标志着抗日民族统一战线正式形成', '标志着中国人民抗日战争开始'],
      answer: 0,
      hint: '它发生在七七事变之前，起的是“转折”作用。',
      explain: '西安事变和平解决，成为<b>时局转换的枢纽</b>，十年内战基本结束，为国共再次合作创造了条件。全民族抗战开始的标志是七七事变；统一战线正式形成是 1937 年 9 月；抗战的起点是九一八事变。'
    },
    {
      level: 'trap',
      title: '中国人民抗日战争胜利纪念日是哪一天',
      desc: '1945 年有好几个重要日子，别记混。',
      options: ['9 月 3 日', '8 月 15 日', '9 月 2 日', '10 月 25 日'],
      answer: 0,
      hint: '是签署投降书的第二天。',
      explain: '<b>9 月 3 日</b>是抗战胜利纪念日。8 月 15 日是日本宣布无条件投降；9 月 2 日是日本签署投降书；10 月 25 日是中国政府在台北接受日军投降、台湾回归中国的日子。'
    },
    {
      level: 'trap',
      title: '关于“14 年抗战”和“8 年”，说法正确的是',
      desc: '这是本课最容易混淆的地方。',
      options: ['14 年抗战从 1931 年算起，其中 1937 年起是全民族抗战', '抗日战争只从 1937 年算起，共 8 年', '14 年抗战从 1937 年算起', '全民族抗战从 1931 年九一八事变开始'],
      answer: 0,
      hint: '一个是起点，一个是“全民族”开始。',
      explain: '中国人民抗日战争是<b>14 年抗战</b>：1931 年九一八事变开始局部抗战，1937 年七七事变开始<b>全民族抗战</b>，到 1945 年胜利。只说“8 年”就把 1931—1937 年东北等地军民的抗战漏掉了；全民族抗战的起点是七七事变，不是九一八事变。'
    }
  ]);
})();
