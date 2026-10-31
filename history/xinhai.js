/* 历史互动馆 · 第 9 课 辛亥革命与中华民国建立 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();
  var NOW = 2026;

  /* ========== 时间轴 ========== */
  var ERA = [
    { from: 1890, to: 1911, name: '清朝末年', color: '#efe0d6' },
    { from: 1912, to: 1920, name: '中华民国', color: '#ead8c6' }
  ];
  var EVENTS = [
    { id: 'xzh', y: 1894, label: '兴中会成立', note: '孙中山在檀香山建立兴中会，提出“驱除鞑虏，恢复中华，创立合众政府”，这是中国第一个资产阶级革命团体。' },
    { id: 'tmh', y: 1905, label: '同盟会成立', note: '孙中山在日本东京成立中国同盟会，这是第一个全国性的资产阶级革命政党。纲领是“驱除鞑虏，恢复中华，创立民国，平均地权”。' },
    { id: 'wc', y: 1911, label: '武昌起义', note: '10 月 10 日，革命党人发动武昌起义，很快控制武汉三镇，许多省份宣布独立。这一年是农历辛亥年，所以这场革命叫辛亥革命。' },
    { id: 'mg', y: 1912, label: '中华民国成立', note: '1 月 1 日，孙中山在南京就任临时大总统，中华民国成立。' },
    { id: 'tw', y: 1912, label: '清帝退位', note: '2 月 12 日，清帝溥仪被迫宣布退位，清朝统治结束。' },
    { id: 'ysk', y: 1912, label: '袁世凯窃权', note: '3 月，袁世凯在北京就任临时大总统，窃取了辛亥革命的果实。同月，孙中山颁布《中华民国临时约法》。' },
    { id: 'cd', y: 1915, label: '袁世凯称帝', note: '袁世凯接受日本“二十一条”的大部分要求；年底宣布恢复帝制。蔡锷等在云南起兵反对，1916 年袁世凯被迫取消帝制，不久病死。' },
    { id: 'fb', y: 1917, label: '张勋复辟', note: '7 月，张勋带“辫子军”进入北京，拥立溥仪复位，12 天后在全国反对声中失败。' }
  ];
  var year = Math.round(L.num(st.y, 1911, 1890, 1920));
  var tl = L.$('#tl'), yIn = L.$('#year-in');

  function eraOf(y) { for (var i = 0; i < ERA.length; i++) if (y >= ERA[i].from && y <= ERA[i].to) return ERA[i]; return null; }
  function eventsAt(y) {
    var same = EVENTS.filter(function (e) { return e.y === y; });
    if (same.length) return same;
    var best = null;
    EVENTS.forEach(function (e) { if (Math.abs(e.y - y) <= 2 && (!best || Math.abs(e.y - y) < Math.abs(best.y - y))) best = e; });
    return best ? [best] : [];
  }
  function drawTL() {
    var evs = eventsAt(year), ids = evs.map(function (e) { return e.id; });
    var ax = L.timeline(tl, {
      from: 1889, to: 1921, step: 5,
      era: ERA.map(function (d) { return { from: d.from, to: d.to + 1, label: d.name, color: d.color }; }),
      events: EVENTS.map(function (e) { var on = ids.indexOf(e.id) >= 0; return { id: e.id, y: e.y, label: e.label, on: on, color: on ? '#a4492b' : '#7d4d3c' }; }),
      pick: function (id) { var e = EVENTS.filter(function (x) { return x.id === id; })[0]; setYear(e.y); }
    });
    var x = ax.X(year);
    tl.insertBefore(S('line', { x1: x, y1: 8, x2: x, y2: ax.base + 50, stroke: '#c2603f', 'stroke-width': 1.6, 'stroke-dasharray': '4 3' }), ax.layer);
    S('path', { d: 'M' + (x - 6) + ' 4h12l-6 8z', fill: '#c2603f' }, tl);
  }
  function setYear(y) { year = y; yIn.value = year; L.paintRange(yIn); render(); }
  function render() {
    drawTL();
    var d = eraOf(year), evs = eventsAt(year);
    L.$('#year-out').textContent = L.yr(year);
    L.$('#era-badge').textContent = d ? d.name : '—';
    L.$('#r-cent').textContent = L.century(year);
    L.$('#r-ago').innerHTML = L.span(year, NOW) + '<small>年前</small>';
    if (!evs.length) L.$('#r-event').textContent = '这几年没有课本里的大事';
    else L.$('#r-event').textContent = (evs[0].y === year ? '' : L.yr(evs[0].y) + '：') + evs.map(function (e) { return e.label; }).join('、');
    var t = evs.map(function (e) { return e.note; }).join(' ');
    if (year === 1912) t += ' <b>注意顺序</b>：民国成立在先，清帝退位在后。';
    else if (year > 1911 && year < 1915) t += (t ? ' ' : '') + '民国初年，袁世凯掌握北京政府，实行独裁统治。';
    L.$('#r-text').innerHTML = t || (year <= 1900 ? '1801～1900 年属于 19 世纪，兴中会成立的 1894 年还在 19 世纪末。' : '1901～2000 年属于 20 世纪，辛亥革命发生在 20 世纪初。');
    save();
  }
  L.bindRange(yIn, function (v) { year = v; render(); });
  yIn.value = year; L.paintRange(yIn);

  /* ========== 排序 ========== */
  var ORD = [
    { label: '兴中会在檀香山成立', y: 1894 },
    { label: '中国同盟会在东京成立', y: 1905 },
    { label: '武昌起义爆发', y: 1911 },
    { label: '袁世凯宣布恢复帝制', y: 1915 },
    { label: '张勋拥立溥仪复辟', y: 1917 }
  ];
  var ordOk = false, ordGame;
  function newOrder() {
    ordOk = false;
    L.$('#ord-msg').textContent = '';
    delete L.$('#ord').dataset.done;
    ordGame = L.order(L.$('#ord'), ORD, function (ok) {
      ordOk = ok;
      L.$('#ord-msg').innerHTML = ok ? '全对！从组织革命团体，到起义成功，再到两次复辟失败，正好是这一单元的主线。' : '有几项排错了，橙色的是错的，看看右边的年份，再点“打乱重来”。';
    });
  }
  L.$('#ord-reset').addEventListener('click', newOrder);

  /* ========== 三民主义配对 ========== */
  var PHRASES = [
    { t: '驱除鞑虏，恢复中华', ans: 'nz' },
    { t: '创立民国', ans: 'nq' },
    { t: '平均地权', ans: 'ns' }
  ];
  var ISMS = [
    { v: 'nq', name: '民权主义', mean: '推翻君主专制制度，建立资产阶级共和国（“创立民国”）' },
    { v: 'ns', name: '民生主义', mean: '“平均地权”：核定地价，革命后地价上涨的部分归国家，由国民共享' },
    { v: 'nz', name: '民族主义', mean: '用革命手段推翻清朝统治（“驱除鞑虏，恢复中华”）' }
  ];
  function ismOf(v) { return ISMS.filter(function (m) { return m.v === v; })[0]; }
  var picks = String(st.m || '').split('.').slice(0, 3).map(function (v) { return ismOf(v) ? v : ''; });
  while (picks.length < 3) picks.push('');
  var pairSvg = L.$('#pair'), rowChips = [];
  function pairDone() { return picks.every(function (v) { return v; }); }
  function pairRight() { return PHRASES.filter(function (p, i) { return picks[i] === p.ans; }).length; }
  function drawPair() {
    pairSvg.innerHTML = '';
    var d = S('defs', {}, pairSvg), cp = S('clipPath', { id: 'pair-clip' }, d);
    S('rect', { x: 0, y: 0, width: 400, height: 190, rx: 14 }, cp);
    var g = S('g', { 'clip-path': 'url(#pair-clip)' }, pairSvg);
    S('rect', { x: 0, y: 0, width: 400, height: 190, fill: '#fbf8f5' }, g);
    S('text', { x: 16, y: 24, 'font-size': 12, 'font-weight': 700, fill: '#8a7a70', text: '同盟会纲领（1905 年）' }, g);
    S('text', { x: 384, y: 24, 'text-anchor': 'end', 'font-size': 12, 'font-weight': 700, fill: '#8a7a70', text: '三民主义' }, g);
    var YS = [60, 108, 156], done = pairDone();
    PHRASES.forEach(function (p, i) {
      var v = picks[i];
      if (!v) { S('text', { x: 230, y: YS[i] + 4, 'text-anchor': 'middle', 'font-size': 12, fill: '#c3b2a6', text: '？' }, g); return; }
      var j = ISMS.map(function (m) { return m.v; }).indexOf(v), ok = v === p.ans;
      var c = done ? (ok ? '#2f6a4a' : '#c2603f') : '#b5654a';
      S('path', { d: 'M190 ' + YS[i] + 'C230 ' + YS[i] + ' 232 ' + YS[j] + ' 272 ' + YS[j], fill: 'none', stroke: c, 'stroke-width': 2.4, 'stroke-dasharray': done && !ok ? '5 4' : null }, g);
      S('circle', { cx: 190, cy: YS[i], r: 4, fill: c }, g);
      S('circle', { cx: 272, cy: YS[j], r: 4, fill: c }, g);
    });
    PHRASES.forEach(function (p, i) {
      var ok = done && picks[i] === p.ans, bad = done && picks[i] !== p.ans;
      S('rect', { x: 14, y: YS[i] - 17, width: 176, height: 34, rx: 9, fill: '#fff', stroke: ok ? '#2f6a4a' : (bad ? '#c2603f' : '#cdb7a8'), 'stroke-width': ok || bad ? 1.8 : 1.3 }, g);
      S('text', { x: 102, y: YS[i] + 4.5, 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: '#4a3a32', text: p.t }, g);
    });
    ISMS.forEach(function (m, j) {
      var used = picks.indexOf(m.v) >= 0;
      S('rect', { x: 272, y: YS[j] - 17, width: 114, height: 34, rx: 9, fill: used ? '#f3e6dd' : '#fff', stroke: '#cdb7a8', 'stroke-width': 1.3 }, g);
      S('text', { x: 329, y: YS[j] + 4.5, 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: '#7d4d3c', text: m.name }, g);
    });
    S('text', { x: 200, y: 184, 'text-anchor': 'middle', 'font-size': 10, fill: '#a0908a', text: done ? (pairRight() === 3 ? '绿色实线：全部配对正确' : '橙色虚线：配错了，在下面改一改') : '三句都选完后自动判断' }, g);
  }
  function renderPair() {
    drawPair();
    var done = pairDone(), right = pairRight(), n = picks.filter(function (v) { return v; }).length;
    L.$('#pair-badge').textContent = !done ? '已配 ' + n + ' / 3' : (right === 3 ? '全部正确' : '对了 ' + right + ' / 3');
    ISMS.forEach(function (m) {
      var i = PHRASES.map(function (p) { return p.ans; }).indexOf(m.v), el = L.$('#m-' + m.v);
      if (picks[i] === m.v && done) { el.textContent = m.mean; el.style.color = '#2f6a4a'; }
      else { el.textContent = picks[i] && done ? '配错了，再想想' : '配对完成后显示'; el.style.color = picks[i] && done ? '#a4492b' : '#a0908a'; }
    });
    L.$('#pair-text').innerHTML = done && right === 3
      ? '这就是孙中山在《民报》发刊词中阐发的<b>三民主义</b>，它是同盟会的指导思想。民族主义针对清朝统治，民权主义针对君主专制制度，民生主义针对土地问题。'
      : '同盟会的纲领一共四句话、十六个字。前两句管“推翻谁”，第三句管“建立什么样的国家”，第四句管“土地怎么办”。';
    save();
  }
  var rows = L.$('#pair-rows');
  PHRASES.forEach(function (p, i) {
    var row = L.html('div', { class: 'ctl-row' }, rows);
    L.html('span', { text: p.t, style: 'min-width:150px;color:#4a3a32;font-weight:600' }, row);
    var box = L.html('div', { class: 'chips small' }, row);
    rowChips[i] = L.chips(box, ISMS.map(function (m) { return { label: m.name, value: m.v }; }), picks[i], function (v) { picks[i] = v; renderPair(); });
  });
  L.$('#pair-reset').addEventListener('click', function () {
    picks = ['', '', ''];
    rowChips.forEach(function (c) { c.set(''); });
    renderPair();
  });

  /* ========== 辛亥革命因果链 ========== */
  var CH = [
    { n: '背景', box: '清政府腐朽', sub: '保路运动', badge: '1911 年以前', who: '孙中山等革命派',
      t: '《辛丑条约》签订后，清政府成为“洋人的朝廷”，人民生活困苦。革命派建立同盟会，多次发动武装起义。1911 年，清政府宣布“铁路国有”，把铁路修筑权出卖给列强，四川等地爆发<b>保路运动</b>。' },
    { n: '爆发', box: '武昌起义', sub: '1911 年 10 月', badge: '1911 年 10 月 10 日', who: '湖北新军中的革命党人',
      t: '革命党人在武昌发动起义，很快控制了武汉三镇。随后许多省份纷纷宣布脱离清政府独立。这一年是农历辛亥年，这场革命因此叫<b>辛亥革命</b>。' },
    { n: '建国', box: '民国建立', sub: '1912 年 1—3 月', badge: '1912 年', who: '孙中山',
      t: '1912 年 1 月 1 日，孙中山在南京就任临时大总统，<b>中华民国成立</b>。2 月 12 日清帝退位，清朝统治结束。3 月颁布《中华民国临时约法》，这是中国历史上第一部具有资产阶级共和国宪法性质的法典。' },
    { n: '窃权', box: '袁世凯窃权', sub: '1912 年 3 月起', badge: '1912—1917 年', who: '袁世凯、张勋',
      t: '1912 年 3 月，袁世凯在北京就任临时大总统，<b>窃取了辛亥革命的果实</b>。他实行独裁统治，1915 年底宣布恢复帝制；1917 年张勋又拥立溥仪复辟。两次复辟都很快失败。' },
    { n: '意义', box: '', badge: '历史意义', who: '以孙中山为首的革命派',
      t: '辛亥革命<b>推翻了清朝统治，结束了中国两千多年的君主专制制度</b>，建立了中华民国，<b>使民主共和观念深入人心</b>。此后谁再想当皇帝，都会遭到全国反对。' },
    { n: '局限', box: '', badge: '历史局限', who: '袁世凯和北洋军阀',
      t: '辛亥革命<b>没有改变中国半殖民地半封建社会的性质</b>，没有完成反帝反封建的任务。袁世凯死后，北洋军阀分裂成皖系、直系、奉系等派系，割据混战，人民生活更加困苦。' }
  ];
  var chStep = Math.round(L.num(st.c, 0, 0, CH.length - 1));
  var chain = L.$('#chain');
  function chBox(g, k, x, y, w, h, title, lines, o) {
    var vis = k <= chStep, on = k === chStep;
    var hit = S('g', { class: 'svg-hit', tabindex: 0, role: 'button', 'aria-label': CH[k].n }, g);
    S('rect', { x: x, y: y, width: w, height: h, rx: 9, fill: vis ? o.fill : '#fff', stroke: on ? '#a4492b' : (vis ? o.stroke : '#d8ccc4'), 'stroke-width': on ? 2.2 : 1.3, 'stroke-dasharray': vis ? null : '4 3' }, hit);
    S('text', { x: x + w / 2, y: y + 21, 'text-anchor': 'middle', 'font-size': o.fs || 12.5, 'font-weight': 700, fill: vis ? o.color : '#b8aaa0', text: title }, hit);
    (vis ? lines : ['按“下一步”揭晓']).forEach(function (s, i) {
      S('text', { x: x + w / 2, y: y + 39 + i * 15.5, 'text-anchor': 'middle', 'font-size': 10.5, fill: vis ? '#6a5a52' : '#b8aaa0', text: s }, hit);
    });
    function go() { chStep = k; renderChain(); }
    hit.addEventListener('click', go);
    hit.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  }
  function drawChain() {
    chain.innerHTML = '';
    var d = S('defs', {}, chain), cp = S('clipPath', { id: 'chain-clip' }, d);
    S('rect', { x: 0, y: 0, width: 400, height: 236, rx: 14 }, cp);
    var g = S('g', { 'clip-path': 'url(#chain-clip)' }, chain);
    S('rect', { x: 0, y: 0, width: 400, height: 236, fill: '#fbf8f5' }, g);
    var XS = [8, 105, 202, 299], W = 92;
    for (var k = 0; k < 3; k++) L.arrow(g, XS[k] + W + 1, 44, XS[k + 1] - 1, 44, { color: k < chStep ? '#a4492b' : '#d8ccc4', width: 1.6, head: 5, headW: 3.5 });
    for (k = 0; k < 4; k++) chBox(g, k, XS[k], 16, W, 56, CH[k].box, [CH[k].sub], { fill: '#f6ebe4', stroke: '#cdb7a8', color: '#5a4036' });
    // 汇总
    var mid = chStep >= 4;
    S('path', { d: 'M54 72V88H345V72', fill: 'none', stroke: chStep >= 3 ? '#b5654a' : '#d8ccc4', 'stroke-width': 1.4 }, g);
    S('rect', { x: 140, y: 80, width: 120, height: 26, rx: 13, fill: chStep >= 3 ? '#7d4d3c' : '#e9e1db' }, g);
    S('text', { x: 200, y: 97, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: chStep >= 3 ? '#fff' : '#a0908a', text: '怎样评价辛亥革命' }, g);
    L.arrow(g, 170, 106, 104, 132, { color: mid ? '#2f6a4a' : '#d8ccc4', width: 1.6, head: 7 });
    L.arrow(g, 230, 106, 296, 132, { color: chStep >= 5 ? '#c2603f' : '#d8ccc4', width: 1.6, head: 7 });
    chBox(g, 4, 10, 134, 184, 92, '意义', ['推翻清朝统治', '结束两千多年的君主专制制度', '民主共和观念深入人心'], { fill: '#eaf4ec', stroke: '#a9c6a4', color: '#2f6a4a', fs: 13 });
    chBox(g, 5, 206, 134, 184, 92, '局限', ['没有改变中国半殖民地', '半封建社会的性质', '没有完成反帝反封建的任务'], { fill: '#fbeee6', stroke: '#e0b6a6', color: '#a4422c', fs: 13 });
  }
  var chSteps = L.$('#chain-steps');
  function renderChain() {
    drawChain();
    chSteps.innerHTML = '';
    CH.forEach(function (c, k) {
      if (k) L.html('i', { text: '→' }, chSteps);
      var sp = L.html('span', { text: c.n, role: 'button', tabindex: '0', class: k === chStep ? 'on' : (k < chStep ? 'done' : null) }, chSteps);
      sp.addEventListener('click', function () { chStep = k; renderChain(); });
      sp.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); chStep = k; renderChain(); } });
    });
    var c = CH[chStep];
    L.$('#ch-name').textContent = c.n;
    L.$('#ch-badge').textContent = c.badge;
    L.$('#ch-who').textContent = c.who;
    L.$('#ch-text').innerHTML = c.t;
    L.$('#chain-next').textContent = chStep === CH.length - 1 ? '再看一遍' : '下一步：' + CH[chStep + 1].n;
    save();
  }
  L.$('#chain-next').addEventListener('click', function () { chStep = chStep === CH.length - 1 ? 0 : chStep + 1; renderChain(); });
  L.$('#chain-reset').addEventListener('click', function () { chStep = 0; renderChain(); });

  function save() { L.setState({ y: year, m: picks.join('.'), c: chStep }); }

  render();
  newOrder();
  renderPair();
  renderChain();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '把年份调到武昌起义那一年',
      desc: '在时间轴下面拖动滑块，或者直接点时间轴上的事件。',
      label: '在时间轴里操作',
      button: '检查年份',
      check: function () {
        if (year === 1911) return { ok: true, msg: '1911 年 10 月 10 日武昌起义。这一年是农历辛亥年，所以叫辛亥革命。它属于 20 世纪，距今 ' + L.span(1911, NOW) + ' 年。' };
        if (year === 1912) return { ok: false, msg: '1912 年是中华民国成立、清帝退位。起义还要早一年。' };
        return { ok: false, msg: '现在是 ' + L.yr(year) + '。武昌起义在中华民国成立的前一年。' };
      }
    },
    {
      level: 'base',
      title: '以“驱除鞑虏，恢复中华，创立民国，平均地权”为纲领的组织是',
      desc: '它是第一个全国性的资产阶级革命政党。',
      options: ['中国同盟会', '兴中会', '强学会', '中国共产党'],
      answer: 0,
      hint: '1905 年在日本东京成立。',
      explain: '这是 1905 年成立的<b>中国同盟会</b>的纲领。兴中会（1894 年）提出的是“创立合众政府”，是第一个资产阶级革命团体；强学会是维新派的组织；中国共产党成立于 1921 年。'
    },
    {
      level: 'base',
      title: '1912 年 1 月 1 日，孙中山在南京就任临时大总统，这标志着',
      desc: '在时间轴上点 1912 年看看，这一年有三件事。',
      options: ['中华民国成立', '辛亥革命爆发', '清朝统治结束', '袁世凯窃取革命果实'],
      answer: 0,
      hint: '这一天是“建立”，不是“结束”。',
      explain: '孙中山就任临时大总统，标志着<b>中华民国成立</b>。辛亥革命爆发是 1911 年武昌起义；清朝统治结束的标志是 2 月 12 日清帝退位；袁世凯窃取果实是 3 月在北京就任临时大总统。'
    },
    {
      level: 'mid',
      title: '把同盟会纲领和三民主义全部配对正确',
      desc: '在“同盟会纲领配三民主义”里，给每一句纲领选一个“主义”。',
      label: '在配对图里操作',
      button: '检查配对',
      check: function () {
        if (!pairDone()) return { ok: false, msg: '还有纲领没选，三句都要配上。' };
        var r = pairRight();
        if (r === 3) return { ok: true, msg: '“驱除鞑虏，恢复中华”是民族主义，“创立民国”是民权主义，“平均地权”是民生主义。' };
        if (picks[1] === 'nz') return { ok: false, msg: '“创立民国”说的是建立什么样的国家，和“权力归谁”有关。' };
        return { ok: false, msg: '对了 ' + r + ' 个。提示：推翻清朝是“民族”，建立共和国是“民权”，土地问题是“民生”。' };
      }
    },
    {
      level: 'mid',
      title: '把五件事按先后排对',
      desc: '在右上方“排一排：谁先谁后”里依次点击，全部排对。排错了按“打乱重来”。',
      label: '在排序题里操作',
      button: '检查排序',
      check: function () {
        if (ordOk) return { ok: true, msg: '兴中会（1894）→ 同盟会（1905）→ 武昌起义（1911）→ 袁世凯称帝（1915）→ 张勋复辟（1917）。' };
        if (!ordGame.done()) return { ok: false, msg: '还没有全部点完，按先后顺序把五项都点一遍。' };
        return { ok: false, msg: '有几项排错了。可以先在时间轴上找到它们的年份，再按“打乱重来”。' };
      }
    },
    {
      level: 'mid',
      title: '《中华民国临时约法》的性质是',
      desc: '它在 1912 年 3 月颁布。',
      options: ['中国历史上第一部具有资产阶级共和国宪法性质的法典', '中国第一部君主立宪的宪法', '同盟会的革命纲领', '袁世凯为称帝制定的法律'],
      answer: 0,
      hint: '它规定中华民国主权属于国民全体。',
      explain: '《临时约法》是<b>中国历史上第一部具有资产阶级共和国宪法性质的法典</b>，规定中华民国主权属于国民全体。它不是君主立宪的宪法；同盟会纲领是 1905 年的十六字纲领；袁世凯后来恰恰破坏了约法。'
    },
    {
      level: 'trap',
      title: '辛亥革命结束了中国两千多年的',
      desc: '这是本课最容易写错的一个词。',
      options: ['君主专制制度', '封建社会', '半殖民地半封建社会', '列强侵略'],
      answer: 0,
      hint: '它推翻的是“皇帝”这种制度，社会性质有没有变？',
      explain: '辛亥革命结束的是<b>君主专制制度</b>（从秦朝开始的皇帝制度）。它没有改变中国半殖民地半封建社会的性质，列强侵略和封建剥削都还在，所以不能说结束了“封建社会”或“半殖民地半封建社会”。'
    },
    {
      level: 'trap',
      title: '1917 年拥立清朝末代皇帝溥仪复位的是',
      desc: '民国初年有两次复辟，主角不一样。',
      options: ['张勋', '袁世凯', '孙中山', '蔡锷'],
      answer: 0,
      hint: '袁世凯是自己想当皇帝，而且他 1916 年就病死了。',
      explain: '1917 年<b>张勋</b>带“辫子军”进京，拥立溥仪复辟，12 天后失败。袁世凯是 1915 年底<b>自己</b>称帝，1916 年取消帝制后不久病死；蔡锷是起兵反对袁世凯称帝的人。'
    }
  ]);
})();
