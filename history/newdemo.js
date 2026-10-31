/* 历史互动馆 · 第 10 课 新民主主义革命的兴起 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();
  var NOW = 2026;

  /* ========== 时间轴 ========== */
  var ERA = [
    { from: 1924, to: 1927.5, label: '国民革命', color: '#ead8c6' },
    { from: 1927.6, to: 1934.7, label: '建立农村革命根据地', color: '#e6d3c0' },
    { from: 1934.8, to: 1936.8, label: '长征', color: '#e3cfc2' }
  ];
  var EVENTS = [
    { id: 'xwh', y: 1915, label: '新文化运动', note: '1915 年，陈独秀在上海创办《青年杂志》（第二年改名《新青年》），新文化运动兴起，提倡民主和科学。' },
    { id: 'ws', y: 1919, label: '五四运动', note: '巴黎和会上中国外交失败，5 月 4 日北京学生游行示威，6 月起上海工人罢工。五四运动是中国新民主主义革命的开端。' },
    { id: 'yd', y: 1921, label: '中共一大', note: '1921 年 7 月，中国共产党第一次全国代表大会在上海召开，最后一天转移到浙江嘉兴南湖的游船上进行。中国共产党诞生。1922 年中共二大在上海召开，第一次明确提出反帝反封建的民主革命纲领；1923 年 2 月京汉铁路工人大罢工，把第一次工人运动高潮推向顶峰。' },
    { id: 'hz', y: 1924, label: '国共合作', note: '1924 年 1 月，国民党一大在广州召开，标志着第一次国共合作正式形成。同年创办黄埔军校。' },
    { id: 'bf', y: 1926, label: '北伐', note: '1926 年，国民革命军从广东出师北伐，目标是打倒吴佩孚、孙传芳、张作霖等北洋军阀。叶挺独立团在汀泗桥、贺胜桥等战役中英勇作战。1927 年蒋介石、汪精卫先后发动四一二、七一五反革命政变，国民大革命失败。' },
    { id: 'nanchang', y: 1927, label: '南昌起义', note: '1927 年 8 月 1 日南昌起义，打响武装反抗国民党反动派的第一枪，标志着中国共产党独立领导革命战争、创建人民军队和武装夺取政权的开始。8 月 7 日中共中央召开八七会议，确定了实行土地革命和武装起义的方针。' },
    { id: 'qiushou', y: 1927, label: '秋收起义', note: '1927 年 9 月湘赣边界秋收起义。起义部队进攻长沙受挫后转向农村，途中进行三湾改编，到达井冈山，创建了第一个农村革命根据地。' },
    { id: 'huishi', y: 1928, label: '井冈山会师', note: '1928 年 4 月，南昌起义保留下来的部分部队与秋收起义部队在井冈山会师，组成工农革命军第四军（后改称红四军）。' },
    { id: 'gutian', y: 1929, label: '古田会议', note: '1929 年 12 月，红四军党的第九次代表大会在福建上杭古田召开（古田会议），确立了思想建党、政治建军的原则。1931 年，中华苏维埃共和国临时中央政府在江西瑞金成立。' },
    { id: 'cz', y: 1934, label: '长征开始', note: '1934 年 10 月，第五次反“围剿”失败，中央红军被迫撤离根据地，开始长征。' },
    { id: 'zy', y: 1935, label: '遵义会议', note: '1935 年 1 月遵义会议，挽救了党、挽救了红军、挽救了中国革命，是党的历史上一个生死攸关的转折点。' },
    { id: 'hn', y: 1936, label: '会宁会师', note: '1936 年 10 月，红一、二、四方面军在甘肃会宁地区会师，长征胜利结束。' }
  ];
  function evById(id) { return EVENTS.filter(function (e) { return e.id === id; })[0] || null; }
  var year = Math.round(L.num(st.y, 1919, 1915, 1936));
  var sel = evById(st.e) && evById(st.e).y === year ? st.e : null;
  var tl = L.$('#tl'), yIn = L.$('#year-in');

  function eraName(y) {
    if (y <= 1918) return '新文化运动兴起';
    if (y <= 1923) return '五四运动与建党';
    if (y <= 1926) return '国民革命';
    if (y <= 1933) return '开辟革命新道路';
    return '红军长征';
  }
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
      from: 1914, to: 1937, step: 5,
      era: ERA,
      events: EVENTS.map(function (e) {
        var on = cur && cur.id === e.id, same = e.y === year;
        return { id: e.id, y: e.y, label: e.label, on: on, color: on ? '#a4492b' : (same ? '#b0623f' : '#7d4d3c') };
      }),
      pick: function (id) { var e = evById(id); setYear(e.y, id); }
    });
    var x = ax.X(year);
    S('line', { x1: x, y1: 8, x2: x, y2: ax.base + 50, stroke: '#c2603f', 'stroke-width': 1.6, 'stroke-dasharray': '4 3' }, tl);
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
    L.$('#era-badge').textContent = eraName(year);
    L.$('#r-cent').textContent = L.century(year);
    L.$('#r-ago').innerHTML = L.span(year, NOW) + '<small>年前</small>';
    if (list.length) L.$('#r-event').textContent = list.map(function (e) { return e.label; }).join('、');
    else L.$('#r-event').textContent = '课本里没有这一年的大事';
    var t;
    if (cur) t = cur.note;
    else { var b = before(year); t = b ? '往前最近的一件是 ' + L.yr(b.y) + '的' + b.label + '。' : ''; }
    if (list.length > 1) t += ' 这一年有 ' + list.length + ' 件大事，点时间轴上的另一个标签可以切换。';
    t += ' 1901～2000 年都属于 20 世纪，所以 ' + year + ' 年属于 20 世纪。';
    L.$('#r-text').innerHTML = t;
    L.$$('#road-table tr').forEach(function (tr) {
      var e = evById(tr.dataset.id);
      tr.classList.toggle('on', !!e && (cur ? cur.id === e.id : false));
    });
    save();
  }
  L.bindRange(yIn, function (v) { year = v; sel = null; render(); });
  yIn.value = year; L.paintRange(yIn);
  L.$$('#road-table tr').forEach(function (tr) {
    tr.style.cursor = 'pointer';
    tr.addEventListener('click', function () { var e = evById(tr.dataset.id); setYear(e.y, e.id); });
  });

  /* ========== 五四运动阶段推进 ========== */
  var STAGES = [
    { n: '起因', b: '1919 年上半年', city: '巴黎和会', main: '—', way: '中国代表在和会上交涉', place: 0,
      force: [0, 0, 0],
      t: '第一次世界大战后，战胜国在巴黎召开和会。中国也是战胜国，提出收回德国在山东的各项特权等要求，却被拒绝；和会还决定把德国在山东的特权转交给日本。消息传回国内，群情激愤。' },
    { n: '5 月 4 日 · 北京', b: '1919 年 5 月 4 日', city: '北京', main: '学生', way: '游行示威、罢课', place: 1,
      force: [3, 0, 0],
      t: '5 月 4 日，北京 3000 多名学生在天安门前集会，举行游行示威，喊出“外争主权，内除国贼”“取消二十一条”等口号。北洋军阀政府派军警镇压，逮捕学生。' },
    { n: '6 月 · 上海', b: '1919 年 6 月初', city: '上海', main: '工人阶级', way: '罢工、罢市、罢课', place: 2,
      force: [3, 3, 2],
      t: '6 月 3 日起，北洋军阀政府大规模逮捕学生，激起更大的愤怒。上海工人举行罢工，商人罢市，学生罢课，运动迅速扩展到全国。运动的中心从北京转到上海，<b>工人阶级</b>登上政治舞台，成为运动的主力。' },
    { n: '结果', b: '1919 年 6 月 28 日', city: '全国', main: '工人、学生、商人等', way: '迫使政府让步', place: 3,
      force: [3, 3, 2],
      t: '北洋军阀政府被迫罢免了曹汝霖、章宗祥、陆宗舆三人的职务；6 月 28 日，中国代表拒绝在和约上签字，运动取得初步胜利。五四运动是一次彻底的反帝反封建的爱国运动，是中国新民主主义革命的开端。' }
  ];
  var ms = Math.round(L.num(st.m, 0, 0, STAGES.length - 1));
  var msSvg = L.$('#ms');
  var msSteps = L.$('#ms-steps');
  STAGES.forEach(function (s, i) {
    if (i) L.html('i', { text: '→' }, msSteps);
    var sp = L.html('span', { text: s.n }, msSteps);
    sp.style.cursor = 'pointer';
    sp.addEventListener('click', function () { ms = i; drawMs(); });
  });
  function person(g, x, y, fill) {
    S('circle', { cx: x, cy: y - 9, r: 4.2, fill: fill }, g);
    S('path', { d: 'M' + (x - 6.5) + ' ' + (y + 6) + 'q0 -11 6.5 -11q6.5 0 6.5 11z', fill: fill }, g);
  }
  function drawMs() {
    msSvg.innerHTML = '';
    var d = S('defs', {}, msSvg), cp = S('clipPath', { id: 'ms-clip' }, d);
    S('rect', { x: 0, y: 0, width: 400, height: 226, rx: 14 }, cp);
    var g = S('g', { 'clip-path': 'url(#ms-clip)' }, msSvg);
    S('rect', { x: 0, y: 0, width: 400, height: 226, fill: '#fbf8f5' }, g);
    var s = STAGES[ms];
    // 上半部分：地点节点
    var P = [{ x: 62, n: '巴黎和会', sub: '外交失败' }, { x: 170, n: '北京', sub: '学生运动' }, { x: 278, n: '上海', sub: '工人罢工' }, { x: 360, n: '全国', sub: '初步胜利' }];
    for (var i = 0; i < P.length - 1; i++) {
      var lit = s.place > i;
      L.arrow(g, P[i].x + 30, 40, P[i + 1].x - 30, 40, { color: lit ? '#a4492b' : '#d6c6bb', width: lit ? 2.2 : 1.6, head: 8 });
    }
    P.forEach(function (p, i) {
      var on = s.place === i, past = s.place > i;
      S('rect', { x: p.x - 28, y: 24, width: 56, height: 32, rx: 9, fill: on ? '#a4492b' : (past ? '#f1e2d9' : '#fff'), stroke: on || past ? '#a4492b' : '#d6c6bb', 'stroke-width': 1.5 }, g);
      S('text', { x: p.x, y: 45, 'text-anchor': 'middle', 'font-size': p.n.length > 3 ? 11 : 12.5, 'font-weight': 700, fill: on ? '#fff' : '#4a3a32', text: p.n }, g);
      S('text', { x: p.x, y: 72, 'text-anchor': 'middle', 'font-size': 10, fill: on ? '#a4492b' : '#8a7a70', 'font-weight': on ? 700 : 400, text: p.sub }, g);
    });
    // 下半部分：参加力量（示意）
    var ROWS = [{ n: '学生', c: '#b0623f' }, { n: '工人', c: '#7d4d3c' }, { n: '商人', c: '#c9a26d' }];
    S('line', { x1: 16, y1: 90, x2: 384, y2: 90, stroke: '#eadfd6' }, g);
    S('text', { x: 18, y: 106, 'font-size': 11, fill: '#8a7a70', text: '参加的力量（示意）' }, g);
    ROWS.forEach(function (r, k) {
      var y = 132 + k * 30, lv = s.force[k], main = (ms === 1 && k === 0) || (ms >= 2 && k === 1);
      S('text', { x: 50, y: y + 4, 'text-anchor': 'end', 'font-size': 12.5, 'font-weight': 700, fill: lv ? '#4a3a32' : '#bdb0a6', text: r.n }, g);
      var n = lv * 4;
      if (!n) S('text', { x: 64, y: y + 4, 'font-size': 11, fill: '#bdb0a6', text: '还没有行动' }, g);
      for (var j = 0; j < n; j++) person(g, 70 + j * 19, y + 2, r.c);
      if (main) {
        var ex = 70 + n * 19 + 4;
        S('rect', { x: ex, y: y - 10, width: 40, height: 20, rx: 10, fill: '#a4492b' }, g);
        S('text', { x: ex + 20, y: y + 4, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: '#fff', text: '主力' }, g);
      }
    });
    S('text', { x: 200, y: 218, 'text-anchor': 'middle', 'font-size': 9.5, fill: '#a0908a', text: '示意：只表示谁参加、谁是主力，不表示实际人数' }, g);

    L.$$('span', msSteps).forEach(function (sp, i) { sp.className = i === ms ? 'on' : (i < ms ? 'done' : ''); });
    L.$('#ms-name').textContent = s.n;
    L.$('#ms-badge').textContent = s.b;
    L.$('#ms-city').textContent = s.city;
    L.$('#ms-main').textContent = s.main;
    L.$('#ms-way').textContent = s.way;
    L.$('#ms-text').innerHTML = s.t;
    L.$('#ms-next').textContent = ms === STAGES.length - 1 ? '从头再看一遍' : '推进到下一阶段';
    save();
  }
  L.$('#ms-next').addEventListener('click', function () { ms = ms === STAGES.length - 1 ? 0 : ms + 1; drawMs(); });
  L.$('#ms-reset').addEventListener('click', function () { ms = 0; drawMs(); });

  /* ========== 长征示意线路 ========== */
  var STOPS = [
    { n: '瑞金', b: '1934 年 10 月', k: '被迫出发', x: 360, y: 190, up: true,
      t: '由于“左”倾错误的军事指挥，第五次反“围剿”失败。1934 年 10 月，中央红军主力 8 万多人从瑞金等地出发，被迫实行战略转移，长征开始。' },
    { n: '湘江', b: '1934 年底', k: '损失惨重', x: 296, y: 168, up: false,
      t: '红军突破国民党军的封锁线，渡过湘江，但损失惨重，由出发时的 8 万多人锐减到 3 万多人。' },
    { n: '遵义', b: '1935 年 1 月', k: '伟大转折', x: 232, y: 192, up: true,
      t: '红军攻占贵州遵义，中共中央召开遵义会议，集中解决了当时具有决定意义的军事和组织问题。遵义会议是党的历史上一个生死攸关的转折点。' },
    { n: '赤水河', b: '1935 年 1—3 月', k: '四渡赤水', x: 166, y: 168, up: false,
      t: '红军四次渡过赤水河，灵活地调动敌人，跳出了敌人的包围圈。' },
    { n: '金沙江', b: '1935 年 5 月', k: '巧渡金沙江', x: 100, y: 190, up: true,
      t: '红军巧渡金沙江，把追兵甩在了后面。' },
    { n: '大渡河', b: '1935 年 5 月', k: '飞夺泸定桥', x: 40, y: 146, up: false,
      t: '红军强渡大渡河，又飞夺泸定桥，冲过了天险。' },
    { n: '雪山', b: '1935 年 6 月', k: '爬雪山', x: 64, y: 82, up: true,
      t: '红军翻越夹金山等终年积雪的大雪山，空气稀薄、天气严寒，许多战士倒在了路上。' },
    { n: '草地', b: '1935 年 8 月', k: '过草地', x: 140, y: 104, up: false,
      t: '红军走过荒无人烟的草地，沼泽遍布，缺粮少衣，靠野菜、草根甚至皮带充饥。' },
    { n: '吴起镇', b: '1935 年 10 月', k: '到达陕北', x: 232, y: 70, up: true,
      t: '中央红军到达陕北吴起镇。注意：这时只是中央红军到达陕北，长征还没有全部结束。' },
    { n: '会宁', b: '1936 年 10 月', k: '三大主力会师', x: 336, y: 86, up: false,
      t: '红一、二、四方面军在甘肃会宁地区会师，<b>长征胜利结束</b>。长征的胜利，保存和锻炼了革命的基干力量，把中国革命的大本营转移到了西北。' }
  ];
  var stop = Math.round(L.num(st.c, 0, 0, STOPS.length - 1)), mAnim = null, mPos = stop;
  var march = L.$('#march');
  function drawMarch() {
    march.innerHTML = '';
    var d = S('defs', {}, march), cp = S('clipPath', { id: 'march-clip' }, d);
    S('rect', { x: 0, y: 0, width: 400, height: 236, rx: 14 }, cp);
    var g = S('g', { 'clip-path': 'url(#march-clip)' }, march);
    S('rect', { x: 0, y: 0, width: 400, height: 236, fill: '#fbf6ef' }, g);
    var path = 'M' + STOPS.map(function (s) { return s.x + ' ' + s.y; }).join('L');
    S('path', { d: path, fill: 'none', stroke: '#eddccb', 'stroke-width': 9, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, g);
    S('path', { d: path, fill: 'none', stroke: '#c9a26d', 'stroke-width': 2, 'stroke-dasharray': '6 5', 'stroke-linejoin': 'round' }, g);
    var k = Math.floor(mPos), f = mPos - k, pts = STOPS.slice(0, k + 1).map(function (s) { return [s.x, s.y]; });
    if (k < STOPS.length - 1 && f > 0) pts.push([STOPS[k].x + (STOPS[k + 1].x - STOPS[k].x) * f, STOPS[k].y + (STOPS[k + 1].y - STOPS[k].y) * f]);
    if (pts.length > 1) S('path', { d: 'M' + pts.map(function (p) { return p.join(' '); }).join('L'), fill: 'none', stroke: '#a4492b', 'stroke-width': 3, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, g);
    STOPS.forEach(function (s, i) {
      var on = i === stop, passed = i <= mPos + 1e-6, key = i === 2 || i === STOPS.length - 1;
      var hit = S('g', { class: 'svg-hit', tabindex: 0, role: 'button', 'aria-label': s.n + '，' + s.b }, g);
      S('circle', { cx: s.x, cy: s.y, r: on ? 9 : (key ? 7.5 : 6.5), fill: passed ? '#a4492b' : '#fff', stroke: '#a4492b', 'stroke-width': key ? 2.6 : 2 }, hit);
      S('text', { x: s.x, y: s.y + (s.up ? -16 : 25), 'text-anchor': 'middle', 'font-size': 12, 'font-weight': on ? 700 : 600, fill: '#4a3a32', text: s.n, stroke: '#fbf6ef', 'stroke-width': 3, 'paint-order': 'stroke' }, hit);
      S('text', { x: s.x, y: s.y + (s.up ? -30 : 38), 'text-anchor': 'middle', 'font-size': 9.5, fill: '#8a7a70', text: s.b, stroke: '#fbf6ef', 'stroke-width': 3, 'paint-order': 'stroke' }, hit);
      function go() { stopMarch(); stop = i; mPos = i; drawMarch(); }
      hit.addEventListener('click', go);
      hit.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    if (mAnim) { var c = pts[pts.length - 1]; S('circle', { cx: c[0], cy: c[1], r: 5, fill: '#7d4d3c', stroke: '#fff', 'stroke-width': 2 }, g); }
    S('text', { x: 14, y: 228, 'font-size': 9.5, fill: '#a0908a', text: '示意，不表示实际地理位置和路线' }, g);
    var s = STOPS[stop];
    L.$('#mc-name').textContent = s.n;
    L.$('#mc-badge').textContent = s.b;
    L.$('#mc-no').textContent = (stop + 1) + ' / ' + STOPS.length;
    L.$('#mc-key').textContent = s.k;
    L.$('#mc-text').innerHTML = s.t;
    L.$('#march-go').textContent = stop === STOPS.length - 1 ? '再走一遍' : (stop === 0 ? '从瑞金出发' : '继续前进');
    save();
  }
  function stopMarch() { if (mAnim) { mAnim.stop(); mAnim = null; } }
  L.$('#march-go').addEventListener('click', function () {
    stopMarch();
    if (stop === STOPS.length - 1) { stop = 0; mPos = 0; }
    var target = stop + 1;
    if (L.REDUCED) { stop = target; mPos = target; drawMarch(); return; }
    mAnim = L.loop(function (dt) {
      mPos = Math.min(target, mPos + dt * 1.4);
      if (mPos >= target) { stop = target; mAnim = null; drawMarch(); return false; }
      drawMarch();
    });
  });
  L.$('#march-reset').addEventListener('click', function () { stopMarch(); stop = 0; mPos = 0; drawMarch(); });

  function save() { L.setState({ y: year, e: sel, m: ms, c: stop }); }

  render();
  drawMs();
  drawMarch();

  /* ========== 课本逐课要点（顺序对应新教材八上第 11～15 课） ========== */
  L.keypoints('#keypoints', [
    '1915 年陈独秀创办《青年杂志》（后改名《新青年》），<b>新文化运动</b>兴起，提倡民主和科学，提倡白话文。1919 年巴黎和会中国外交失败，<b>5 月 4 日</b>北京学生游行；6 月起上海工人罢工，<b>工人阶级</b>登上政治舞台；中国代表拒签和约。五四运动是中国新民主主义革命的开端。',
    '十月革命后李大钊等传播马克思主义。<b>1921 年 7 月中共一大</b>在上海召开（后转到嘉兴南湖游船），中国共产党诞生，这是开天辟地的大事变。1922 年中共二大提出反帝反封建的民主革命纲领；1923 年<b>京汉铁路工人大罢工</b>，把第一次工人运动高潮推向顶峰。',
    '1924 年国民党一大在广州召开，<b>第一次国共合作</b>正式形成；创办黄埔军校。1926 年国民革命军北伐，叶挺独立团在汀泗桥、贺胜桥立功，北伐军打到长江流域。1927 年四一二、七一五反革命政变，国民大革命失败。',
    '1927 年 8 月 1 日<b>南昌起义</b>打响第一枪；八七会议确定土地革命和武装起义的方针；9 月秋收起义，三湾改编，创建<b>井冈山革命根据地</b>；1928 年井冈山会师。“工农武装割据”：土地革命、武装斗争、根据地建设。1929 年古田会议；1931 年中华苏维埃共和国临时中央政府在瑞金成立。',
    '第五次反“围剿”失败，1934 年 10 月中央红军开始<b>长征</b>。1935 年 1 月<b>遵义会议</b>事实上确立了毛泽东在党中央和红军的领导地位，挽救了党、挽救了红军、挽救了中国革命，是生死攸关的转折点。四渡赤水、飞夺泸定桥、爬雪山过草地，1936 年 10 月三大主力<b>会宁会师</b>。'
  ]);

  /* ========== 大题训练 ========== */
  L.essay('#essay', {
    title: '中国革命道路的探索',
    materials: [
      { label: '材料一', text: '国民大革命失败后，1927 年 8 月 7 日中共中央在汉口召开紧急会议（八七会议），确定了实行土地革命和武装起义的方针。毛泽东在会上提出“政权是由枪杆子中取得的”。', src: '——据统编版八年级上册第 14 课整理' },
      { label: '材料二', text: '秋收起义部队进攻长沙受挫后，毛泽东率部转向敌人力量薄弱的农村，到达井冈山。他们打土豪、分田地，建立工农民主政权，开展游击战争，创造了“工农武装割据”的局面。', src: '——据统编版八年级上册第 14 课整理' },
      { label: '材料三', text: '第五次反“围剿”失败后，中央红军被迫长征，突破湘江后由 8 万多人锐减到 3 万多人。1935 年 1 月，中共中央在遵义召开政治局扩大会议，集中解决了当时具有决定意义的军事和组织问题。', src: '——据统编版八年级上册第 15 课整理' }
    ],
    parts: [
      {
        ask: '(1) 根据材料二，概括“工农武装割据”的主要内容。', score: 3, type: 'sum',
        points: [
          { t: '土地革命（打土豪、分田地）', s: 1 },
          { t: '武装斗争（开展游击战争）', s: 1 },
          { t: '建立革命政权、建设农村革命根据地', s: 1 }
        ],
        model: '在党的领导下，以土地革命（打土豪、分田地）为中心内容，以武装斗争（游击战争）为主要形式，以农村革命根据地（建立工农民主政权）为战略阵地。'
      },
      {
        ask: '(2) 根据材料三并结合所学，说明遵义会议的历史意义。', score: 4, type: 'effect',
        points: [
          { t: '纠正了“左”倾错误，事实上确立了毛泽东在党中央和红军的领导地位', s: 2 },
          { t: '在极其危急的情况下挽救了党、挽救了红军、挽救了中国革命', s: 1 },
          { t: '是党的历史上一个生死攸关的转折点', s: 1 }
        ],
        model: '遵义会议集中解决了当时具有决定意义的军事和组织问题，事实上确立了毛泽东在党中央和红军的领导地位；在极其危急的情况下挽救了党、挽救了红军、挽救了中国革命，是党的历史上一个生死攸关的转折点。'
      },
      {
        ask: '(3) 围绕“中国共产党探索革命道路”，自拟一个观点，结合 1927—1936 年的史实加以阐述。（要求：观点正确，史论结合，条理清楚）', score: 8, type: 'essay',
        points: [
          { t: '观点明确、正确，例如“中国共产党从中国国情出发，开辟了农村包围城市、武装夺取政权的道路”', s: 2 },
          { t: '用南昌起义、八七会议等史实论证（独立掌握武装）', s: 2 },
          { t: '用井冈山根据地、工农武装割据或遵义会议、长征等史实论证', s: 2 },
          { t: '有结论回扣观点，条理清楚', s: 2 }
        ],
        model: '观点：中国共产党从中国国情出发，在挫折中开辟了农村包围城市、武装夺取政权的革命道路。论证：国民大革命失败后，党认识到必须独立掌握武装，1927 年 8 月 1 日南昌起义打响武装反抗国民党反动派的第一枪，八七会议确定土地革命和武装起义的方针；秋收起义部队进攻长沙受挫后转向农村，创建井冈山革命根据地，实行“工农武装割据”。第五次反“围剿”失败后红军被迫长征，1935 年遵义会议纠正错误，挽救了党、红军和中国革命，1936 年三大主力会宁会师。结论：中国革命必须走符合中国国情的道路，实事求是是党不断取得胜利的关键。'
      }
    ]
  });

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '把年份调到中国共产党诞生的那一年',
      desc: '拖动时间轴下面的滑块，或者直接点时间轴上的事件。',
      label: '在时间轴里操作',
      button: '检查年份',
      check: function () {
        if (year === 1921) return { ok: true, msg: '1921 年 7 月中共一大在上海召开，最后一天转到嘉兴南湖的游船上，中国共产党诞生。它属于 20 世纪，距今 ' + L.span(1921, NOW) + ' 年。' };
        if (year === 1919) return { ok: false, msg: '1919 年是五四运动。中共一大还要再往后两年。' };
        if (year === 1924) return { ok: false, msg: '1924 年是国民党一大、第一次国共合作，比中共一大晚。' };
        return { ok: false, msg: '现在是 ' + L.yr(year) + '。中共一大在五四运动之后、国共合作之前。' };
      }
    },
    {
      level: 'base',
      title: '新文化运动高举的两面大旗是',
      desc: '1915 年《青年杂志》创刊，新文化运动兴起。',
      options: ['民主和科学', '自强和求富', '民族、民权、民生', '反帝和反封建'],
      answer: 0,
      hint: '一个反对专制，一个反对迷信。',
      explain: '新文化运动提倡<b>民主和科学</b>，反对专制和迷信。“自强、求富”是洋务运动的口号；“民族、民权、民生”是孙中山的三民主义；“彻底反帝反封建”是用来评价五四运动的。'
    },
    {
      level: 'base',
      title: '“打响武装反抗国民党反动派的第一枪”指的是',
      desc: '可以看看工作台右边的“1927—1929”表格。',
      options: ['南昌起义', '秋收起义', '井冈山会师', '北伐战争'],
      answer: 0,
      hint: '8 月 1 日后来被定为中国人民解放军建军节。',
      explain: '1927 年 8 月 1 日<b>南昌起义</b>打响了第一枪，标志着中国共产党独立领导革命战争、创建人民军队和武装夺取政权的开始。秋收起义后创建了第一个农村革命根据地；井冈山会师在 1928 年；北伐是国共合作时期打北洋军阀。'
    },
    {
      level: 'mid',
      title: '推进到工人阶级成为主力的那一阶段',
      desc: '在“五四运动：从学生到工人”里，按“推进到下一阶段”，停在工人成为主力、中心转到上海的那一步。',
      label: '在五四运动推进器里操作',
      button: '检查阶段',
      check: function () {
        if (ms === 2) return { ok: true, msg: '1919 年 6 月初，上海工人罢工、商人罢市、学生罢课，中心从北京转到上海，<b>工人阶级</b>登上政治舞台，成为运动的主力。' };
        if (ms < 2) return { ok: false, msg: '现在是“' + STAGES[ms].n + '”，主力还不是工人，再往后推进。' };
        return { ok: false, msg: '“结果”这一步已经是 6 月 28 日拒签了。退回去一步，看 6 月初的上海。' };
      }
    },
    {
      level: 'mid',
      title: '沿长征示意线路走到“伟大转折”的那一站',
      desc: '按“从瑞金出发”一站站走，停在召开会议、成为转折点的地方。',
      label: '在长征示意线路里操作',
      button: '检查我走到哪了',
      check: function () {
        if (stop === 2) return { ok: true, msg: '瑞金 → 湘江 → <b>遵义</b>。1935 年 1 月遵义会议，在极其危急的情况下挽救了党、挽救了红军、挽救了中国革命。' };
        if (stop < 2) return { ok: false, msg: '现在在“' + STOPS[stop].n + '”，还要继续往前走。' };
        return { ok: false, msg: '现在在“' + STOPS[stop].n + '”，走过头了。转折点在湘江之后、四渡赤水之前。' };
      }
    },
    {
      level: 'mid',
      title: '第一次国共合作正式形成的标志是',
      desc: '可以在时间轴上点一点 1924 年。',
      options: ['1924 年国民党一大在广州召开', '1921 年中共一大召开', '1926 年北伐开始', '1924 年黄埔军校创办'],
      answer: 0,
      hint: '“标志”要找确认合作的那次会议。',
      explain: '<b>1924 年 1 月国民党一大</b>在广州召开，标志着第一次国共合作正式形成。黄埔军校是合作形成之后创办的；北伐是合作的成果；中共一大是中国共产党诞生。'
    },
    {
      level: 'trap',
      title: '红军长征胜利结束的标志是',
      desc: '这是这一课最常见的坑：两个“到达/会师”别混。',
      options: ['1936 年 10 月三大主力在会宁地区会师', '1935 年 10 月中央红军到达陕北吴起镇', '1935 年 1 月遵义会议召开', '1928 年 4 月井冈山会师'],
      answer: 0,
      hint: '“胜利结束”要等红一、二、四方面军全都会合。',
      explain: '<b>1936 年 10 月</b>红一、二、四方面军在甘肃会宁地区会师，长征胜利结束。1935 年 10 月到达吴起镇的只是中央红军；遵义会议是转折点；井冈山会师是 1928 年的事，和长征无关。'
    },
    {
      level: 'trap',
      title: '中国第一个农村革命根据地是在哪次起义之后建立的',
      desc: '“第一枪”和“第一个根据地”最容易混。',
      options: ['秋收起义', '南昌起义', '广州起义', '五四运动'],
      answer: 0,
      hint: '哪次起义的部队进攻长沙受挫后，转向农村上了井冈山？',
      explain: '<b>秋收起义</b>部队进攻长沙受挫后转向农村，到达井冈山，创建了第一个农村革命根据地。南昌起义是“第一枪”；广州起义发生在城市，起义失败；五四运动不是武装起义。'
    }
  ]);
})();
