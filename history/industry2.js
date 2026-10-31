/* 历史互动馆 · 第 23 课 第二次工业革命和近代科学文化 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();
  var NOW = 2026;
  var C1 = '#7d4d3c', C1_ON = '#a4492b', C2 = '#2f6470', C2_ON = '#1d4c57';

  /* ========== 发明时间轴 ========== */
  var INV = [
    { id: 'jenny', y: 1765, g: 1, label: '珍妮机', who: '哈格里夫斯（英国织工）', note: '织工哈格里夫斯发明珍妮机，一次能纺好几根纱。工业革命从英国的棉纺织业开始。' },
    { id: 'watt', y: 1785, g: 1, label: '改良蒸汽机', who: '瓦特（英国）', note: '瓦特改良的蒸汽机投入使用，机器有了强大的新动力，人类进入“蒸汽时代”。' },
    { id: 'fulton', y: 1807, g: 1, label: '汽船', who: '富尔顿（美国）', note: '富尔顿发明汽船，轮船不再靠风和人力。' },
    { id: 'steph', y: 1814, g: 1, label: '蒸汽机车', who: '史蒂芬孙（英国）', note: '史蒂芬孙发明蒸汽机车，陆上交通进入火车时代。' },
    { id: 'siemens', y: 1866, g: 2, label: '发电机', who: '西门子（德国）', note: '西门子制成发电机。到 19 世纪 70 年代，实际可用的发电机问世，电力开始广泛应用。' },
    { id: 'bell', y: 1876, g: 2, label: '电话', who: '贝尔（美国）', note: '贝尔发明电话，人们隔着很远也能直接通话。' },
    { id: 'edison', y: 1879, g: 2, label: '电灯', who: '爱迪生（美国）', note: '爱迪生发明电灯，城市的夜晚被照亮。' },
    { id: 'benz', y: 1885, g: 2, label: '汽车', who: '卡尔·本茨（德国）', show: '1885—1886 年', note: '卡尔·本茨制成以内燃机为动力的汽车，1886 年获得专利。' },
    { id: 'wright', y: 1903, g: 2, label: '飞机', who: '莱特兄弟（美国）', note: '莱特兄弟驾驶自己制造的飞机试飞成功，人类飞上了天空。' }
  ];
  var year = Math.round(L.num(st.y, 1876, 1760, 1910));
  var tl = L.$('#tl'), yIn = L.$('#year-in');

  function nearest(y) {
    var best = null;
    INV.forEach(function (e) { if (Math.abs(e.y - y) <= 4 && (!best || Math.abs(e.y - y) < Math.abs(best.y - y))) best = e; });
    return best;
  }
  /* 年代说法：1876 → 19 世纪 70 年代；1905 → 20 世纪初；1900 → 19 世纪最后一年 */
  function decade(y) {
    var r = y % 100;
    if (r === 0) return L.century(y) + '最后一年';
    if (r < 10) return L.century(y) + '初';
    return L.century(y) + ' ' + Math.floor(r / 10) * 10 + ' 年代';
  }
  function drawTL() {
    var ev = nearest(year);
    var ax = L.timeline(tl, {
      from: 1760, to: 1910, step: 30,
      events: INV.map(function (e) {
        var on = ev && ev.id === e.id;
        return { id: e.id, y: e.y, label: e.label, on: on, color: e.g === 1 ? (on ? C1_ON : C1) : (on ? C2_ON : C2) };
      }),
      pick: function (id) { setYear(INV.filter(function (x) { return x.id === id; })[0].y); }
    });
    var x = ax.X(year);
    // 游标放在事件标签下面，标签的白边会盖住虚线
    tl.insertBefore(S('line', { x1: x, y1: 8, x2: x, y2: ax.base + 30, stroke: '#c2603f', 'stroke-width': 1.6, 'stroke-dasharray': '4 3' }), ax.layer);
    S('path', { d: 'M' + (x - 6) + ' 4h12l-6 8z', fill: '#c2603f' }, tl);
    var halo = { stroke: '#fff', 'stroke-width': 3, 'paint-order': 'stroke' };
    S('circle', { cx: 30, cy: 22, r: 4.5, fill: C1, stroke: '#fff', 'stroke-width': 1.5 }, tl);
    S('text', Object.assign({ x: 38, y: 26, 'font-size': 11, fill: C1, text: '第一次工业革命' }, halo), tl);
    S('circle', { cx: 134, cy: 22, r: 4.5, fill: C2, stroke: '#fff', 'stroke-width': 1.5 }, tl);
    S('text', Object.assign({ x: 142, y: 26, 'font-size': 11, fill: C2, text: '第二次工业革命' }, halo), tl);
  }
  function setYear(y) { year = y; yIn.value = year; L.paintRange(yIn); render(); }
  function render() {
    drawTL();
    var ev = nearest(year);
    L.$('#year-out').textContent = L.yr(year);
    L.$('#r-dec').textContent = decade(year);
    L.$('#r-ago').innerHTML = L.span(year, NOW) + '<small>年前</small>';
    L.$('#gen-badge').textContent = ev ? (ev.g === 1 ? '第一次工业革命 · 蒸汽' : '第二次工业革命 · ' + (ev.id === 'benz' || ev.id === 'wright' ? '内燃机' : '电力')) : '这几年没有课本里的发明';
    L.$('#r-inv').textContent = ev ? (ev.y === year ? '' : '约 ' + (ev.show || L.yr(ev.y)) + '：') + ev.label + '，' + ev.who : '—';
    var t = ev ? ev.note + ' ' : '';
    var r = year % 100;
    if (year >= 1760 && year <= 1769) t += '这一年在 <b>18 世纪 60 年代</b>，第一次工业革命就从这时开始。';
    else if (year >= 1870 && year <= 1879) t += '这一年在 <b>19 世纪 70 年代</b>，第二次工业革命就从这时开始。';
    else if (r === 0) t += year + ' 年属于 ' + L.century(year) + '，是这个世纪的最后一年。';
    else t += '“' + decade(year) + '”说的就是这一年所在的这几年。';
    L.$('#r-text').innerHTML = t;
    L.$('#row-1760').classList.toggle('on', year >= 1760 && year <= 1769);
    L.$('#row-1870').classList.toggle('on', year >= 1870 && year <= 1879);
    L.$('#row-1900').classList.toggle('on', year === 1900 || year === 1901);
    save();
  }
  L.bindRange(yIn, function (v) { year = v; render(); });
  yIn.value = year; L.paintRange(yIn);

  /* ========== 动力链对比器 ========== */
  var PW = {
    1: {
      name: '第一次工业革命', era: '蒸汽时代', time: '18 世纪 60 年代', power: '蒸汽', where: '英国率先开始', feat: '发明多来自工匠经验',
      nodes: [
        { id: 'coal', x: 52, y: 120, t: '煤', s: '燃料', n: '煤是蒸汽机的“粮食”，煤矿业因此迅速发展。' },
        { id: 'steam', x: 168, y: 120, t: '蒸汽机', s: '瓦特改良', n: '瓦特改良的蒸汽机 1785 年投入使用。哪里要动力，就得在哪里装蒸汽机、烧煤。' },
        { id: 'mill', x: 322, y: 52, t: '纺织工厂', s: '机器生产', n: '机器生产代替手工劳动，工厂成为主要的生产组织形式。' },
        { id: 'train', x: 322, y: 120, t: '火车', s: '史蒂芬孙', n: '1814 年史蒂芬孙发明蒸汽机车，后来铁路越修越多。' },
        { id: 'ship', x: 322, y: 188, t: '汽船', s: '富尔顿', n: '1807 年美国人富尔顿发明汽船。' }
      ],
      links: [['coal', 'steam', '烧煤'], ['steam', 'mill', '蒸汽'], ['steam', 'train', ''], ['steam', 'ship', '']]
    },
    2: {
      name: '第二次工业革命', era: '电气时代', time: '19 世纪 70 年代', power: '电力、内燃机', where: '美、德等几国同时', feat: '科学与技术紧密结合',
      nodes: [
        { id: 'fuel', x: 42, y: 72, t: '煤、水力', s: '带动发电机', n: '用烧煤或者水流的力量带动发电机转动，把“动”变成“电”。' },
        { id: 'dyn', x: 142, y: 72, t: '发电机', s: '西门子', n: '1866 年西门子制成发电机；19 世纪 70 年代实际可用的发电机问世。' },
        { id: 'grid', x: 242, y: 72, t: '电线', s: '远距离送电', n: '电能通过电线送到很远的地方，一座电厂可以供许多工厂和家庭。这是蒸汽做不到的。' },
        { id: 'lamp', x: 346, y: 26, t: '电灯', s: '爱迪生', n: '爱迪生发明电灯，城市夜晚被照亮，工厂也能在夜里生产。' },
        { id: 'motor', x: 346, y: 72, t: '电动机', s: '机器、电车', n: '电动机把电重新变成动力，带动机器和电车，小工厂也用得起。' },
        { id: 'phone', x: 346, y: 118, t: '电话', s: '贝尔', n: '1876 年贝尔发明电话，远距离通信变得方便。' },
        { id: 'oil', x: 42, y: 186, t: '石油', s: '汽油等', n: '内燃机要烧汽油、柴油等石油产品，石油工业随之兴起。' },
        { id: 'ice', x: 142, y: 186, t: '内燃机', s: '轻便高效', n: '19 世纪七八十年代，以煤气、汽油为燃料的内燃机相继问世。它比蒸汽机轻便，装得上汽车和飞机。' },
        { id: 'car', x: 346, y: 166, t: '汽车', s: '卡尔·本茨', n: '卡尔·本茨 1885 年制成以内燃机为动力的汽车，1886 年获得专利。' },
        { id: 'plane', x: 346, y: 212, t: '飞机', s: '莱特兄弟', n: '1903 年美国莱特兄弟驾驶自己制造的飞机试飞成功。' }
      ],
      links: [['fuel', 'dyn', ''], ['dyn', 'grid', '电'], ['grid', 'lamp', ''], ['grid', 'motor', ''], ['grid', 'phone', ''], ['oil', 'ice', '燃油'], ['ice', 'car', '动力'], ['ice', 'plane', '']]
    }
  };
  var gen = st.g === '1' ? 1 : 2;
  var pwNode = typeof st.n === 'string' ? st.n : '';
  var pwT = 0, pwAnim = null, pw = L.$('#pw');
  function nodeOf(id) { return PW[gen].nodes.filter(function (n) { return n.id === id; })[0]; }
  function drawPW() {
    pw.innerHTML = '';
    var P = PW[gen], c = gen === 1 ? C1 : C2, run = !!pwAnim;
    var d = S('defs', {}, pw), cp = S('clipPath', { id: 'pw-clip' }, d);
    S('rect', { x: 0, y: 0, width: 400, height: 240, rx: 14 }, cp);
    var g = S('g', { 'clip-path': 'url(#pw-clip)' }, pw);
    S('rect', { x: 0, y: 0, width: 400, height: 240, fill: gen === 1 ? '#fbf6f1' : '#f4f8f8' }, g);
    var bw = gen === 1 ? 92 : 72, bh = 34;
    P.links.forEach(function (lk) {
      var a = nodeOf(lk[0]), b = nodeOf(lk[1]);
      var x1 = a.x + bw / 2, y1 = a.y, x2 = b.x - bw / 2, y2 = b.y;
      L.arrow(g, x1, y1, x2 - 2, y2, { color: run ? c : '#b9aea6', width: run ? 2.2 : 1.6, head: 8 });
      if (lk[2]) S('text', { x: (x1 + x2) / 2, y: (y1 + y2) / 2 - 6, 'text-anchor': 'middle', 'font-size': 10, fill: '#8a7a70', text: lk[2], stroke: '#fff', 'stroke-width': 3, 'paint-order': 'stroke' }, g);
      if (run) {
        for (var k = 0; k < 3; k++) {
          var f = (pwT * 0.8 + k / 3) % 1;
          S('circle', { cx: x1 + (x2 - x1) * f, cy: y1 + (y2 - y1) * f, r: 3, fill: gen === 1 ? '#c2603f' : '#e0a826' }, g);
        }
      }
    });
    P.nodes.forEach(function (n) {
      var on = n.id === pwNode, end = !P.links.some(function (lk) { return lk[0] === n.id; });
      var lit = run && end;
      var hit = S('g', { class: 'svg-hit', tabindex: 0, role: 'button', 'aria-label': n.t }, g);
      S('rect', { x: n.x - bw / 2, y: n.y - bh / 2, width: bw, height: bh, rx: 8, fill: lit ? (gen === 1 ? '#f6e3d6' : '#fdf1cf') : '#fff', stroke: on ? c : '#cdbfb5', 'stroke-width': on ? 2.4 : 1.3 }, hit);
      S('text', { x: n.x, y: n.y - 1, 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: on ? c : '#4a3a32', text: n.t }, hit);
      S('text', { x: n.x, y: n.y + 12, 'text-anchor': 'middle', 'font-size': 9.5, fill: '#8a7a70', text: n.s }, hit);
      hit.addEventListener('click', function () { pwNode = n.id; drawPW(); });
      hit.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pwNode = n.id; drawPW(); } });
    });
    if (gen === 2) S('line', { x1: 12, y1: 146, x2: 388, y2: 146, stroke: '#d6e2e2', 'stroke-dasharray': '3 4' }, g);
    L.$('#pw-name').textContent = P.name;
    L.$('#pw-badge').textContent = P.era;
    L.$('#pw-time').textContent = P.time;
    L.$('#pw-power').textContent = P.power;
    L.$('#pw-where').textContent = P.where;
    L.$('#pw-feat').textContent = P.feat;
    var nd = nodeOf(pwNode);
    L.$('#pw-text').innerHTML = nd ? '<b>' + nd.t + '：</b>' + nd.n : (gen === 1
      ? '第一次工业革命的核心是<b>蒸汽机</b>：煤烧出蒸汽，蒸汽推动机器、火车和轮船。点方框看每一环。'
      : '第二次工业革命有<b>两条线</b>：上面是电力（发电—送电—用电），下面是内燃机（石油—内燃机—汽车、飞机）。点方框看每一环。');
    L.$('#pw-run').textContent = run ? '关掉机器' : '开动机器';
    save();
  }
  L.chips(L.$('#pw-chips'), [{ label: '第一次（蒸汽）', value: '1' }, { label: '第二次（电力、内燃机）', value: '2' }], String(gen), function (v) { gen = +v; pwNode = ''; drawPW(); });
  L.$('#pw-run').addEventListener('click', function () {
    if (pwAnim) { pwAnim.stop(); pwAnim = null; drawPW(); return; }
    pwAnim = L.loop(function (dt, t) { pwT = t; drawPW(); });
    if (L.REDUCED) { pwT = 0.3; drawPW(); }
  });

  /* ========== 城市化因果链 ========== */
  var CT = [
    { x: 70, y: 50, t: '工业迅速发展', s: '工厂集中到城市', n: '工业革命以后，工厂越办越多、越办越大，大多集中在城市和交通方便的地方。' },
    { x: 200, y: 50, t: '城市化', s: '农村人口涌入城市', n: '大量农村人口进城当工人，城市人口比重不断上升。1851 年，英国城市人口已经超过总人口的一半。' },
    { x: 330, y: 50, t: '城市问题', s: '拥挤·污染·贫富分化', n: '城市长得太快：工人住房拥挤、卫生条件差，工厂的烟尘和污水造成环境污染，贫富差距越来越大。' },
    { x: 330, y: 160, t: '想办法应对', s: '公共设施·社会保障', n: '各国改善城市规划，修建自来水、下水道等公共设施；一些国家建立社会保障制度，德国率先建立了社会保险制度。' },
    { x: 150, y: 160, t: '城市新面貌', s: '电灯·电车·电话', n: '电灯照亮街道，电车、汽车方便出行，电话方便联系，人们的生活方式发生了很大变化。' }
  ];
  var ctStep = Math.round(L.num(st.c, 0, 0, CT.length - 1)), ctView = ctStep, ct = L.$('#ct');
  function drawCT() {
    ct.innerHTML = '';
    var d = S('defs', {}, ct), cp = S('clipPath', { id: 'ct-clip' }, d);
    S('rect', { x: 0, y: 0, width: 400, height: 220, rx: 14 }, cp);
    var g = S('g', { 'clip-path': 'url(#ct-clip)' }, ct);
    S('rect', { x: 0, y: 0, width: 400, height: 220, fill: '#fbf8f5' }, g);
    var bw = 112, bh = 50;
    for (var i = 0; i < CT.length - 1; i++) {
      var a = CT[i], b = CT[i + 1], shown = i + 1 <= ctStep, c = shown ? '#7d4d3c' : '#d3c6bc';
      if (a.y === b.y) {
        var dir = b.x > a.x ? 1 : -1;
        L.arrow(g, a.x + dir * bw / 2, a.y, b.x - dir * (bw / 2 + 2), b.y, { color: c, width: 1.8, head: 8, dash: shown ? null : '4 4' });
      } else L.arrow(g, a.x, a.y + bh / 2, b.x, b.y - bh / 2 - 2, { color: c, width: 1.8, head: 8, dash: shown ? null : '4 4' });
    }
    CT.forEach(function (n, i) {
      var shown = i <= ctStep, on = i === ctView, bad = i === 2;
      var hit = S('g', { class: 'svg-hit', tabindex: shown ? 0 : -1, role: 'button', 'aria-label': shown ? n.t : '还没推到这一步' }, g);
      S('rect', { x: n.x - bw / 2, y: n.y - bh / 2, width: bw, height: bh, rx: 10, fill: !shown ? '#f6f1ec' : (bad ? '#fbeee6' : '#fff'), stroke: !shown ? '#d8cbc1' : (on ? '#7d4d3c' : (bad ? '#e0b6a6' : '#cdb7a8')), 'stroke-width': on ? 2.4 : 1.4, 'stroke-dasharray': shown ? null : '4 4' }, hit);
      S('text', { x: n.x, y: n.y - 2, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: !shown ? '#b5a79d' : (bad ? '#a4492b' : '#4a3a32'), text: shown ? n.t : '？' }, hit);
      if (shown) S('text', { x: n.x, y: n.y + 15, 'text-anchor': 'middle', 'font-size': 10, fill: '#8a7a70', text: n.s }, hit);
      S('text', { x: n.x - bw / 2 + 6, y: n.y - bh / 2 + 12, 'font-size': 9.5, fill: '#a0908a', text: String(i + 1) }, hit);
      function go() { if (i <= ctStep) { ctView = i; drawCT(); } }
      hit.addEventListener('click', go);
      hit.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    S('text', { x: 200, y: 212, 'text-anchor': 'middle', 'font-size': 10, fill: '#a0908a', text: '示意图：箭头表示“因为……所以……”' }, g);
    var n = CT[ctView];
    L.$('#ct-text').innerHTML = '<b>第 ' + (ctView + 1) + ' 步 · ' + n.t + '：</b>' + n.n;
    var nx = L.$('#ct-next');
    nx.disabled = ctStep >= CT.length - 1;
    nx.textContent = ctStep >= CT.length - 1 ? '已经推到最后一步' : '下一步';
    save();
  }
  L.$('#ct-next').addEventListener('click', function () { if (ctStep < CT.length - 1) { ctStep++; ctView = ctStep; drawCT(); } });
  L.$('#ct-reset').addEventListener('click', function () { ctStep = 0; ctView = 0; drawCT(); });

  /* ========== 科学文化名人配对 ========== */
  var SC = [
    ['牛顿（英国科学家）', 'mech', '牛顿建立了<b>经典力学</b>体系，包括三大运动定律和万有引力定律。'],
    ['达尔文（英国生物学家）', 'evo', '1859 年达尔文出版《物种起源》，提出<b>生物进化论</b>。'],
    ['爱因斯坦（物理学家）', 'rel', '20 世纪初爱因斯坦提出<b>相对论</b>，突破了经典力学的局限。'],
    ['贝多芬（德国音乐家）', 'bee', '贝多芬被称为“乐圣”，代表作有<b>《命运交响曲》</b>《英雄交响曲》等。'],
    ['梵高（荷兰画家）', 'sun', '梵高画了多幅<b>《向日葵》</b>，色彩强烈，充满激情。'],
    ['列夫·托尔斯泰（俄国作家）', 'war', '列夫·托尔斯泰的代表作有<b>《战争与和平》</b>《安娜·卡列尼娜》《复活》。']
  ];
  var SC_OPT = [['mech', '经典力学'], ['evo', '生物进化论'], ['rel', '相对论'], ['bee', '《命运交响曲》'], ['sun', '《向日葵》'], ['war', '《战争与和平》']];
  /* 每人给 3 个选项：正确的 + 2 个别人的成就，顺序打乱，避免答案排成一条斜线 */
  function scOpts(i) {
    var right = SC_OPT.filter(function (o) { return o[0] === SC[i][1]; });
    var others = L.shuffle(SC_OPT.filter(function (o) { return o[0] !== SC[i][1]; })).slice(0, 2);
    return L.shuffle(right.concat(others));
  }
  function scInit() {
    L.match('#sc-list', '#sc-score', SC, scOpts, function (it, ok) { return ok ? it[2] : '不对。' + it[2]; });
    L.$('#sc-score').textContent = '已答 0 / ' + SC.length;
  }
  L.$('#sc-reset').addEventListener('click', scInit);

  function save() { L.setState({ y: year, g: gen, n: pwNode, c: ctStep }); }

  render();
  drawPW();
  drawCT();
  scInit();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '把年份调到莱特兄弟飞机试飞成功的那一年',
      desc: '在发明时间轴下面拖动滑块，或者直接点时间轴上的“飞机”。',
      label: '在发明时间轴里操作',
      button: '检查年份',
      check: function () {
        if (year === 1903) return { ok: true, msg: '1903 年，美国莱特兄弟驾驶自己制造的飞机试飞成功。这一年属于 20 世纪初，飞机用的是<b>内燃机</b>，属于第二次工业革命的成果。' };
        if (year < 1870) return { ok: false, msg: '现在是 ' + year + ' 年，还在第一次工业革命那一段。飞机要往滑块右边找。' };
        return { ok: false, msg: '现在是 ' + year + ' 年。飞机比爱迪生的电灯（1879 年）晚二十多年，在 20 世纪初。' };
      }
    },
    {
      level: 'base',
      title: '下列发明家与发明对应正确的是',
      desc: '可以回到时间轴，点一点青色的发明核对。',
      options: ['爱迪生——电灯', '贝尔——汽车', '卡尔·本茨——电话', '莱特兄弟——蒸汽机车'],
      answer: 0,
      hint: '电话、电灯、汽车、飞机，各配一个人，别串了。',
      explain: '<b>爱迪生发明电灯</b>。电话是<b>贝尔</b>发明的，汽车是<b>卡尔·本茨</b>制成的，莱特兄弟造的是<b>飞机</b>；蒸汽机车是第一次工业革命时英国人史蒂芬孙发明的。'
    },
    {
      level: 'base',
      title: '第二次工业革命使人类进入了',
      desc: '想一想这次工业革命最突出的成就是什么。',
      options: ['“电气时代”', '“蒸汽时代”', '“信息时代”', '“石器时代”'],
      answer: 0,
      hint: '最突出的成就是电力的广泛应用。',
      explain: '第二次工业革命最突出的成就是<b>电力的广泛应用</b>，人类进入<b>“电气时代”</b>。“蒸汽时代”是第一次工业革命，标志是瓦特改良蒸汽机；“信息时代”是二战以后第三次科技革命的说法。'
    },
    {
      level: 'mid',
      title: '找出“蒸汽做不到、电力做得到”的那一环',
      desc: '在“动力从哪来，送到哪去”里切换到<b>第二次工业革命</b>，点出能把动力送到很远地方的那个方框。',
      label: '在动力链示意图里操作',
      button: '检查我点的方框',
      check: function () {
        if (gen !== 2) return { ok: false, msg: '先切换到“第二次（电力、内燃机）”。' };
        if (pwNode === 'grid') return { ok: true, msg: '电能可以通过<b>电线</b>送到远方，一座电厂供许多工厂和家庭使用。蒸汽机只能就地烧煤，动力搬不走。' };
        if (!pwNode) return { ok: false, msg: '还没有点方框。看看上面那条电力线：发电机发出的电，靠什么送出去？' };
        return { ok: false, msg: '你点的是“' + nodeOf(pwNode).t + '”。要找的是把电从电厂<b>送出去</b>的那一环。' };
      }
    },
    {
      level: 'mid',
      title: '把因果链推到“想办法应对”',
      desc: '在“工厂进城以后”里按“下一步”，推到城市问题出现以后，人们怎么应对的那一步，并让它显示在说明里。',
      label: '在因果链里操作',
      button: '检查推到哪了',
      check: function () {
        if (ctStep < 3) return { ok: false, msg: '现在只推到第 ' + (ctStep + 1) + ' 步，继续按“下一步”。' };
        if (ctView !== 3) return { ok: false, msg: '已经推过去了，点一下第 4 个方框“想办法应对”，让它显示在下面。' };
        return { ok: true, msg: '工业发展 → 城市化 → 住房拥挤、环境污染、贫富分化 → 改善公共设施、建立社会保障制度。<b>先有问题，再有应对</b>，因果顺序不能反。' };
      }
    },
    {
      level: 'mid',
      title: '与第一次工业革命相比，第二次工业革命的突出特点是',
      desc: '可以在动力链里切换两次工业革命，看“突出特点”一栏。',
      options: ['科学与技术紧密结合', '最先从英国开始', '发明大多来自工匠的实践经验', '以蒸汽机为主要动力'],
      answer: 0,
      hint: '法拉第先发现电磁感应，才有了发电机。',
      explain: '第二次工业革命中，<b>科学与技术紧密结合</b>，并且在几个国家同时发生。“最先从英国开始”“发明多来自工匠经验”“以蒸汽机为动力”说的都是<b>第一次</b>工业革命。'
    },
    {
      level: 'trap',
      title: '第二次工业革命从“19 世纪 70 年代”开始，这指的是',
      desc: '可以拖动时间轴滑块，看右边“课本上怎么说这几年”。',
      options: ['1870—1879 年', '1970—1979 年', '1770—1779 年', '1900—1909 年'],
      answer: 0,
      hint: '19 世纪是 1801—1900 年，年份开头是 18。',
      explain: '19 世纪是 1801—1900 年，所以 <b>19 世纪 70 年代是 1870—1879 年</b>。1970 年代是 20 世纪 70 年代；1770 年代是 18 世纪 70 年代。“世纪数 = 年份前两位 + 1”，别把 19 世纪当成 19××年。'
    },
    {
      level: 'trap',
      title: '下列科学家、作品与成就对应正确的是',
      desc: '这几个名字最容易串，先在右边的名人配对里试一遍。',
      options: ['达尔文——《物种起源》——生物进化论', '牛顿——相对论', '爱因斯坦——经典力学', '贝多芬——《向日葵》'],
      answer: 0,
      hint: '“进化”和“物种”是一回事。',
      explain: '1859 年<b>达尔文</b>出版《物种起源》，提出<b>生物进化论</b>。牛顿建立的是<b>经典力学</b>，相对论是<b>爱因斯坦</b>提出的，两人正好被调换了；《向日葵》是梵高的画，贝多芬是音乐家。'
    }
  ]);
})();
