/* 历史互动馆 · 第 16 课 文明的产生和古代亚非文明 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();
  var NOW = 2026;

  /* ========== 四大文明古国对比器 ========== */
  var CIVS = [
    { id: 'meso', name: '两河流域', full: '古代两河流域', rivers: ['幼发拉底河', '底格里斯河'], script: '楔形文字',
      feats: [{ g: 'tablet', t: '楔形文字', s: '苏美尔人·写在泥板上' }, { g: 'law', t: '《汉谟拉比法典》', s: '约公元前·18 世纪' }],
      featText: '楔形文字、《汉谟拉比法典》',
      text: '“两河”指<b>幼发拉底河和底格里斯河</b>。苏美尔人用削尖的芦苇秆在湿泥板上压出楔子形状的符号，这就是<b>楔形文字</b>。约公元前 18 世纪，古巴比伦国王汉谟拉比统一两河流域，颁布刻在石柱上的《汉谟拉比法典》，它维护的是奴隶主的利益。' },
    { id: 'egypt', name: '古代埃及', full: '古代埃及', rivers: ['尼罗河'], script: '象形文字',
      feats: [{ g: 'pyramid', t: '金字塔', s: '法老的陵墓' }, { g: 'hiero', t: '象形文字', s: '用图形·表示意思' }, { g: 'sun', t: '太阳历', s: '据尼罗河泛滥·和天象制定' }],
      featText: '金字塔、象形文字、太阳历',
      text: '古埃及依托<b>尼罗河</b>，尼罗河定期泛滥，留下肥沃的淤泥。国王叫“<b>法老</b>”，掌握最高权力。<b>金字塔</b>是法老的陵墓，其中胡夫金字塔最大，体现了法老的权力和古埃及人的建筑水平。' },
    { id: 'india', name: '古代印度', full: '古代印度', rivers: ['印度河', '恒河'], script: '印章文字（未释读）',
      feats: [{ g: 'caste', t: '种姓制度', s: '四个等级·世代相袭' }, { g: 'wheel', t: '佛教', s: '公元前 6 世纪·创立' }, { g: 'zero', t: '数字符号', s: '包括“0”在内·的 10 个' }],
      featText: '种姓制度、佛教、数字符号',
      text: '古印度依托<b>印度河、恒河</b>。雅利安人进入后形成<b>种姓制度</b>，把人分成婆罗门、刹帝利、吠舍、首陀罗四个等级。公元前 6 世纪，<b>乔达摩·悉达多</b>创立<b>佛教</b>，主张“众生平等”，反对婆罗门的特权。' },
    { id: 'china', name: '古代中国', full: '古代中国', rivers: ['黄河', '长江'], script: '甲骨文',
      feats: [{ g: 'bone', t: '甲骨文', s: '商朝·刻在龟甲兽骨上' }, { g: 'ding', t: '青铜器', s: '如商朝·后母戊鼎' }],
      featText: '甲骨文、青铜器',
      text: '中华文明在<b>黄河、长江</b>流域孕育发展（七年级学过）。商朝的<b>甲骨文</b>是已发现的我国最早的成熟文字，后母戊鼎是商朝青铜器的代表。和其他三个文明一样，它也诞生在大河流域。' }
  ];
  function civOf(id) { return CIVS.filter(function (c) { return c.id === id; })[0] || CIVS[1]; }
  var civ = civOf(st.c).id;
  var civSvg = L.$('#civ');

  /* 成就小图标，画在 (x, y) 为左上角的 30×30 方框里 */
  function glyph(g, x, y, p) {
    var ink = '#7d4d3c', clay = '#d8b896';
    if (g === 'tablet') {
      S('rect', { x: x + 3, y: y + 2, width: 24, height: 27, rx: 4, fill: clay, stroke: ink, 'stroke-width': 1.2 }, p);
      [[8, 9], [15, 9], [21, 9], [9, 17], [17, 17], [11, 24], [20, 24]].forEach(function (q) {
        S('path', { d: 'M' + (x + q[0]) + ' ' + (y + q[1] - 3) + 'l4 2.5-4 2.5z', fill: ink }, p);
      });
    } else if (g === 'law') {
      S('path', { d: 'M' + (x + 7) + ' ' + (y + 30) + 'V' + (y + 9) + 'a8 7 0 0 1 16 0V' + (y + 30) + 'z', fill: '#8c7b70', stroke: ink, 'stroke-width': 1.2 }, p);
      for (var i = 0; i < 4; i++) S('line', { x1: x + 10, y1: y + 14 + i * 4, x2: x + 20, y2: y + 14 + i * 4, stroke: '#efe4d8', 'stroke-width': 1 }, p);
    } else if (g === 'pyramid') {
      S('path', { d: 'M' + (x + 15) + ' ' + (y + 3) + 'L' + (x + 29) + ' ' + (y + 28) + 'H' + (x + 1) + 'z', fill: '#e3c38f', stroke: ink, 'stroke-width': 1.2 }, p);
      S('path', { d: 'M' + (x + 15) + ' ' + (y + 3) + 'L' + (x + 18) + ' ' + (y + 28), stroke: ink, 'stroke-width': 0.8, fill: 'none' }, p);
    } else if (g === 'hiero') {
      S('rect', { x: x + 6, y: y + 1, width: 18, height: 29, rx: 9, fill: '#fbf3e6', stroke: ink, 'stroke-width': 1.2 }, p);
      S('circle', { cx: x + 15, cy: y + 8, r: 3, fill: 'none', stroke: ink, 'stroke-width': 1.2 }, p);
      S('path', { d: 'M' + (x + 10) + ' ' + (y + 16) + 'q2.5 -3 5 0t5 0', fill: 'none', stroke: ink, 'stroke-width': 1.2 }, p);
      S('line', { x1: x + 15, y1: y + 20, x2: x + 15, y2: y + 27, stroke: ink, 'stroke-width': 1.4 }, p);
    } else if (g === 'sun') {
      S('circle', { cx: x + 15, cy: y + 15, r: 6.5, fill: '#efc46a', stroke: ink, 'stroke-width': 1.2 }, p);
      for (var k = 0; k < 8; k++) { var a = k * Math.PI / 4; S('line', { x1: x + 15 + Math.cos(a) * 9, y1: y + 15 + Math.sin(a) * 9, x2: x + 15 + Math.cos(a) * 13, y2: y + 15 + Math.sin(a) * 13, stroke: ink, 'stroke-width': 1.3 }, p); }
    } else if (g === 'caste') {
      [10, 16, 22, 28].forEach(function (w, j) { S('rect', { x: x + 15 - w / 2, y: y + 3 + j * 7, width: w, height: 5.5, rx: 1.5, fill: ['#7d4d3c', '#a6705a', '#c99a82', '#e3c7b6'][j] }, p); });
    } else if (g === 'wheel') {
      S('circle', { cx: x + 15, cy: y + 15, r: 12, fill: 'none', stroke: ink, 'stroke-width': 1.6 }, p);
      S('circle', { cx: x + 15, cy: y + 15, r: 3, fill: ink }, p);
      for (var m = 0; m < 8; m++) { var b = m * Math.PI / 4; S('line', { x1: x + 15, y1: y + 15, x2: x + 15 + Math.cos(b) * 12, y2: y + 15 + Math.sin(b) * 12, stroke: ink, 'stroke-width': 1.1 }, p); }
    } else if (g === 'zero') {
      S('text', { x: x + 15, y: y + 24, 'text-anchor': 'middle', 'font-size': 25, 'font-weight': 700, fill: ink, text: '0' }, p);
    } else if (g === 'bone') {
      S('path', { d: 'M' + (x + 5) + ' ' + (y + 8) + 'q10 -8 20 0q4 10 -2 20q-8 4 -16 0q-6 -10 -2 -20z', fill: '#efe2c8', stroke: ink, 'stroke-width': 1.2 }, p);
      S('path', { d: 'M' + (x + 11) + ' ' + (y + 10) + 'v6h4M' + (x + 19) + ' ' + (y + 11) + 'l-3 6M' + (x + 12) + ' ' + (y + 21) + 'h7', stroke: ink, 'stroke-width': 1.2, fill: 'none' }, p);
    } else if (g === 'ding') {
      S('path', { d: 'M' + (x + 9) + ' ' + (y + 8) + 'v-5M' + (x + 21) + ' ' + (y + 8) + 'v-5', stroke: ink, 'stroke-width': 2 }, p);
      S('rect', { x: x + 4, y: y + 8, width: 22, height: 13, rx: 2, fill: '#8aa192', stroke: ink, 'stroke-width': 1.2 }, p);
      S('path', { d: 'M' + (x + 8) + ' ' + (y + 21) + 'v8M' + (x + 22) + ' ' + (y + 21) + 'v8M' + (x + 15) + ' ' + (y + 21) + 'v6', stroke: ink, 'stroke-width': 2 }, p);
    }
  }

  function drawCiv() {
    var c = civOf(civ);
    civSvg.innerHTML = '';
    var d = S('defs', {}, civSvg), cp = S('clipPath', { id: 'civ-clip' }, d);
    S('rect', { x: 0, y: 0, width: 400, height: 250, rx: 14 }, cp);
    var g = S('g', { 'clip-path': 'url(#civ-clip)' }, civSvg);
    S('rect', { x: 0, y: 0, width: 400, height: 250, fill: '#fbf8f5' }, g);
    // 顶部：当前文明名称
    S('text', { x: 20, y: 32, 'font-size': 16, 'font-weight': 700, fill: '#4a3a32', text: c.full }, g);
    S('text', { x: 380, y: 32, 'text-anchor': 'end', 'font-size': 11.5, fill: '#8a7a70', text: '文字：' + c.script }, g);
    // 大河示意（波浪线，只表示“依托大河”，不是河道走向）
    S('rect', { x: 10, y: 52, width: 380, height: 168, rx: 12, fill: '#fff', stroke: '#eadfd4' }, g);
    var n = c.rivers.length;
    c.rivers.forEach(function (r, j) {
      var y = n === 1 ? 92 : 78 + j * 26, dd = 'M84 ' + y;
      for (var x = 84; x <= 348; x += 24) dd += 'q6 -5 12 0t12 0';
      S('path', { d: dd, fill: 'none', stroke: '#8fb3c9', 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0.85 }, g);
      S('text', { x: 78, y: y + 4, 'text-anchor': 'end', 'font-size': 11.5, 'font-weight': 700, fill: '#3f6d86', text: r }, g);
    });
    // 河边的农田和聚落（示意）
    [110, 170, 236, 300, 352].forEach(function (x, j) {
      var y = n === 1 ? 110 : 124;
      S('rect', { x: x - 11, y: y - (j % 2 ? 2 : 0), width: 22, height: 7, rx: 2, fill: '#cfe0b8' }, g);
      if (j % 2 === 0) S('path', { d: 'M' + (x - 5) + ' ' + (y - 4) + 'l5 -6 5 6z', fill: '#c99a82' }, g);
    });
    S('text', { x: 26, y: n === 1 ? 117 : 131, 'font-size': 10, fill: '#8a7a70', text: '农田·聚落' }, g);
    // 代表成就卡片
    var k = c.feats.length, cw = k === 2 ? 150 : 116, gap = 8, x0 = 200 - (k * cw + (k - 1) * gap) / 2;
    c.feats.forEach(function (f, j) {
      var x = x0 + j * (cw + gap), y = 146;
      S('rect', { x: x, y: y, width: cw, height: 64, rx: 10, fill: '#fbf6ef', stroke: '#e3d3c4' }, g);
      glyph(f.g, x + 6, y + 6, g);
      S('text', { x: x + 40, y: y + 22, 'font-size': f.t.length > 6 ? 12 : 12.5, 'font-weight': 700, fill: '#4a3a32', text: f.t }, g);
      f.s.split('·').forEach(function (line, q) {
        S('text', { x: x + 40, y: y + 39 + q * 14, 'font-size': 10, fill: '#8a7a70', text: line }, g);
      });
    });
    S('text', { x: 200, y: 238, 'text-anchor': 'middle', 'font-size': 10, fill: '#a0908a', text: '示意图：只表示“文明依托大河”，不表示实际地理位置和河道走向' }, g);

    L.$('#civ-name').textContent = c.full;
    L.$('#civ-badge').textContent = '大河文明 ' + (CIVS.indexOf(c) + 1) + ' / 4';
    L.$('#civ-river').textContent = c.rivers.join('、');
    L.$('#civ-script').textContent = c.script;
    L.$('#civ-feat').textContent = c.featText;
    L.$('#civ-text').innerHTML = c.text;
    L.$$('#civ-table tbody tr').forEach(function (tr) { tr.classList.toggle('on', tr.dataset.c === civ); });
    save();
  }
  function setCiv(id) { civ = id; civChips.set(id); drawCiv(); }
  var civChips = L.chips(L.$('#civ-chips'), CIVS.map(function (o) { return { label: o.name, value: o.id }; }), civ, function (v) { civ = v; drawCiv(); });

  /* ========== 距今时间尺（对数刻度） ========== */
  var TOP = 3000000, LG0 = Math.log(TOP) / Math.LN10, LG1 = 2;   // 300 万年前 → 100 年前
  var DEEP = [
    { id: 'lucy', n: 3000000, label: '露西', when: '距今约 300 万年', yr: '远在文字出现之前', note: '在非洲埃塞俄比亚发现的南方古猿化石“露西”，已经能<b>直立行走</b>。直立行走解放了双手，是从猿到人的关键一步。' },
    { id: 'bj', n: 700000, label: '北京人', when: '距今约 70 万～20 万年', yr: '远在文字出现之前', note: '北京人生活在北京周口店一带，会打制石器、使用天然火（七年级学过）。' },
    { id: 'farm', n: 10000, label: '原始农业', when: '距今约 1 万年', yr: '远在文字出现之前', note: '人类开始种植作物、驯养家畜，慢慢定居下来，有了村落。这为文明的出现打下了基础。' },
    { id: 'cune', n: 5200, label: '楔形文字', when: '距今 5000 多年', yr: '公元前 3000 多年', note: '两河流域的苏美尔人创造了楔形文字，这是世界上最早的文字之一。从这以后，才有了用文字记下来的历史。' },
    { id: 'law', n: 3770, label: '汉谟拉比法典', when: '距今约 3800 年', yr: '约公元前 18 世纪', note: '古巴比伦国王汉谟拉比颁布法典，刻在石柱上，是迄今已知的世界上第一部比较完备的成文法典。' },
    { id: 'buddha', n: 2550, label: '佛教创立', when: '距今约 2500 年', yr: '公元前 6 世纪', note: '古印度的乔达摩·悉达多创立佛教，后来传到亚洲许多地方，也传入了中国。' }
  ];
  var dv = Math.round(L.num(st.d, 0, 0, 1000));
  var deepSvg = L.$('#deep'), dIn = L.$('#deep-in');
  function lgOf(v) { return LG0 - v / 1000 * (LG0 - LG1); }
  function vOf(n) { return Math.round((LG0 - Math.log(n) / Math.LN10) / (LG0 - LG1) * 1000); }
  function yearsAgo() { return Math.pow(10, lgOf(dv)); }
  function nearDeep() {
    var lg = lgOf(dv), best = null;
    DEEP.forEach(function (e) { var dl = Math.abs(Math.log(e.n) / Math.LN10 - lg); if (dl <= 0.05 && (!best || dl < best.dl)) best = { e: e, dl: dl }; });
    return best && best.e;
  }
  function niceAgo(n) {
    if (n >= 10000) { var w = n / 10000; return '约 ' + (w >= 100 ? Math.round(w / 10) * 10 : w >= 10 ? Math.round(w) : Math.round(w * 10) / 10) + ' 万年'; }
    if (n >= 1000) return '约 ' + Math.round(n / 100) * 100 + ' 年';
    return '约 ' + Math.round(n / 10) * 10 + ' 年';
  }
  function roundAgo(n) { return n >= 1000 ? Math.round(n / 100) * 100 : Math.round(n / 10) * 10; }
  function clock(n) {
    var s = Math.round(Math.max(0, Math.min(1, 1 - n / TOP)) * 86400);
    if (s >= 86400) s = 86399;
    var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60;
    return [h, m, x].map(function (t) { return (t < 10 ? '0' : '') + t; }).join(':');
  }
  function drawDeep() {
    var ev = nearDeep();
    var ax = L.timeline(deepSvg, {
      from: -LG0, to: -LG1, step: 1000,
      events: DEEP.map(function (e) { var on = ev && ev.id === e.id; return { id: e.id, y: -Math.log(e.n) / Math.LN10, label: e.label, on: on, color: on ? '#a4492b' : '#7d4d3c' }; }),
      pick: function (id) { var e = DEEP.filter(function (x) { return x.id === id; })[0]; dv = vOf(e.n); dIn.value = dv; L.paintRange(dIn); renderDeep(); }
    });
    [[3000000, '300万'], [1000000, '100万'], [100000, '10万'], [10000, '1万'], [1000, '1000'], [100, '100']].forEach(function (t) {
      var x = ax.X(-Math.log(t[0]) / Math.LN10);
      S('line', { x1: x, y1: ax.base + 8, x2: x, y2: ax.base + 13, stroke: '#9a8a80' }, deepSvg);
      S('text', { x: x, y: ax.base + 25, 'text-anchor': 'middle', 'font-size': 10, fill: '#7a6a62', text: t[1] }, deepSvg);
    });
    S('text', { x: 36, y: 20, 'font-size': 10, fill: '#a0908a', text: '刻度单位：距今多少年（越往右越近）' }, deepSvg);
    var x = ax.X(-lgOf(dv));
    S('line', { x1: x, y1: 8, x2: x, y2: ax.base + 12, stroke: '#c2603f', 'stroke-width': 1.6, 'stroke-dasharray': '4 3' }, deepSvg);
    S('path', { d: 'M' + (x - 6) + ' 4h12l-6 8z', fill: '#c2603f' }, deepSvg);
  }
  function renderDeep() {
    drawDeep();
    var n = yearsAgo(), ev = nearDeep();
    L.$('#deep-out').textContent = ev ? ev.when : '距今' + niceAgo(n);
    L.$('#deep-badge').textContent = ev ? ev.label : '没有课本里的大事';
    var yt;
    if (ev) yt = ev.yr;
    else if (n > 12000) yt = '太早了，用“距今”表示';
    else { var y = NOW - roundAgo(n); if (y <= 0) y -= 1; yt = '约 ' + L.yr(y); }
    L.$('#deep-year').textContent = yt;
    L.$('#deep-clock').textContent = clock(ev ? ev.n : n);
    var t = ev ? ev.note : '';
    if (!ev) t = n > 10000 ? '这段漫长的时间里，人类靠采集和狩猎生活，用的是打制石器，还没有文字。' : '越往右越接近今天。距今换成公元纪年：用 2026 减去“距今”的年数，跨过公元元年还要再减 1。';
    L.$('#deep-text').innerHTML = t;
    save();
  }
  L.bindRange(dIn, function (v) { dv = v; renderDeep(); });
  dIn.value = dv; L.paintRange(dIn);

  /* ========== 大河与文明因果链 ========== */
  var CHAIN = [
    { t: '大河', s: '水源充足、定期泛滥', x: 64, y: 46, txt: '大河提供了充足的水源。像尼罗河每年定期泛滥，退水后留下一层肥沃的淤泥。' },
    { t: '土地肥沃', s: '平原开阔、便于灌溉', x: 200, y: 46, txt: '河水冲积出开阔平坦的平原，土壤肥沃，又方便引水灌溉。' },
    { t: '农业发达', s: '粮食有了剩余', x: 336, y: 46, txt: '在这样的土地上种庄稼收成好，粮食开始有<b>剩余</b>，人们可以长期定居。' },
    { t: '人口聚集', s: '出现社会分工', x: 336, y: 140, txt: '有了余粮，就能养活不种地的人：工匠、商人、祭司、管理者，村落发展成城市。' },
    { t: '治水与管理', s: '需要统一组织', x: 200, y: 140, txt: '修堤坝、挖水渠、分配土地和粮食，都需要有人统一指挥，还要记账、定规矩。' },
    { t: '国家与文字', s: '文明诞生', x: 64, y: 140, txt: '于是出现了掌握权力的统治者和国家机构，为了记录和管理又发明了文字——<b>文明</b>就这样诞生了。' }
  ];
  var ck = Math.round(L.num(st.k, 0, 0, CHAIN.length - 1));
  var chainSvg = L.$('#chain');
  function drawChain() {
    chainSvg.innerHTML = '';
    S('rect', { x: 0, y: 0, width: 400, height: 200, rx: 14, fill: '#fbf8f5' }, chainSvg);
    CHAIN.forEach(function (c, i) {
      if (i === 0) return;
      var p = CHAIN[i - 1], on = i <= ck, col = on ? '#a4492b' : '#d9c9be';
      var x1 = p.x, y1 = p.y, x2 = c.x, y2 = c.y;
      if (y1 === y2) { var dir = x2 > x1 ? 1 : -1; x1 += dir * 54; x2 -= dir * 56; }
      else { y1 += 25; y2 -= 29; }
      L.arrow(chainSvg, x1, y1, x2, y2, { color: col, width: 1.8, head: 8, dash: on ? null : '4 3' });
    });
    CHAIN.forEach(function (c, i) {
      var on = i <= ck, cur = i === ck;
      var hit = S('g', { class: 'svg-hit', tabindex: 0, role: 'button', 'aria-label': c.t }, chainSvg);
      S('rect', { x: c.x - 52, y: c.y - 24, width: 104, height: 48, rx: 10, fill: cur ? '#7d4d3c' : on ? '#fff' : '#f6f1ed', stroke: on ? '#a4492b' : '#e0d3c9', 'stroke-width': cur ? 2 : 1.3, 'stroke-dasharray': on ? null : '4 3' }, hit);
      S('text', { x: c.x, y: c.y - 3, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: cur ? '#fff' : on ? '#4a3a32' : '#b8aaa0', text: on ? c.t : '？' }, hit);
      S('text', { x: c.x, y: c.y + 14, 'text-anchor': 'middle', 'font-size': 10.5, fill: cur ? '#f3e2d8' : on ? '#8a7a70' : '#c8bcb3', text: on ? c.s : '按“下一环”揭晓' }, hit);
      S('circle', { cx: c.x - 47, cy: c.y - 19, r: 8, fill: on ? '#a4492b' : '#e0d3c9' }, hit);
      S('text', { x: c.x - 47, y: c.y - 15.5, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 700, fill: '#fff', text: String(i + 1) }, hit);
      function go() { if (i <= ck) { ck = i; drawChain(); } }
      hit.addEventListener('click', go);
      hit.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    S('text', { x: 200, y: 188, 'text-anchor': 'middle', 'font-size': 11.5, 'font-weight': 700, fill: ck === CHAIN.length - 1 ? '#2f6a4a' : '#a0908a', text: ck === CHAIN.length - 1 ? '四大文明古国都诞生在大河流域，原因就在这条链上' : '已展开 ' + (ck + 1) + ' / ' + CHAIN.length + ' 环' }, chainSvg);
    L.$('#chain-text').innerHTML = '<b>第 ' + (ck + 1) + ' 环 · ' + CHAIN[ck].t + '</b>：' + CHAIN[ck].txt;
    L.$('#chain-next').textContent = ck === CHAIN.length - 1 ? '已经到头了' : '下一环';
    L.$('#chain-next').disabled = ck === CHAIN.length - 1;
    save();
  }
  L.$('#chain-next').addEventListener('click', function () { if (ck < CHAIN.length - 1) { ck++; drawChain(); } });
  L.$('#chain-reset').addEventListener('click', function () { ck = 0; drawChain(); });

  /* ========== 成就配对 ========== */
  L.match('#match-list', '#match-score', [
    ['楔形文字（压在泥板上）', 'meso', '苏美尔人创造，属于古代两河流域。'],
    ['金字塔（法老的陵墓）', 'egypt', '金字塔是古埃及法老的陵墓，胡夫金字塔最大。'],
    ['种姓制度', 'india', '雅利安人进入印度后形成，婆罗门地位最高。'],
    ['《汉谟拉比法典》', 'meso', '古巴比伦国王汉谟拉比颁布，属于两河流域。'],
    ['甲骨文', 'china', '商朝刻在龟甲兽骨上的文字。'],
    ['包括“0”在内的 10 个数字符号', 'india', '古印度人发明，后经阿拉伯人传到欧洲，被叫作“阿拉伯数字”。']
  ], [['meso', '两河流域'], ['egypt', '埃及'], ['india', '印度'], ['china', '中国']], function (it, ok) { var nm = { meso: '两河流域', egypt: '埃及', india: '印度', china: '中国' }[it[1]]; return (ok ? '' : '应该选“' + nm + '”。') + it[2]; });

  function save() { L.setState({ c: civ, d: dv, k: ck }); }

  drawCiv();
  renderDeep();
  drawChain();

  /* ========== 课本逐课要点（顺序对应新教材九上第 1～4 课） ========== */
  L.keypoints('#keypoints', [
    '“露西”距今约 300 万年，已能<b>直立行走</b>。原始社会集体劳动、平均分配；农业、畜牧业和金属工具使产品有了剩余，出现<b>私有制</b>和阶级，<b>国家</b>产生，人类进入<b>奴隶社会</b>。',
    '“两河”指<b>幼发拉底河和底格里斯河</b>；苏美尔人创造写在泥板上的<b>楔形文字</b>；约公元前 18 世纪古巴比伦国王汉谟拉比统一两河流域，颁布<b>《汉谟拉比法典》</b>（迄今已知世界上第一部比较完备的成文法典），维护奴隶主的利益。',
    '依托<b>尼罗河</b>；国王称“<b>法老</b>”，掌握最高权力；<b>金字塔</b>是法老的陵墓，胡夫金字塔最大；创造<b>象形文字</b>，根据尼罗河泛滥和天象制定太阳历。',
    '依托<b>印度河、恒河</b>；雅利安人进入后形成<b>种姓制度</b>（婆罗门、刹帝利、吠舍、首陀罗），等级森严、世代相袭；公元前 6 世纪<b>乔达摩·悉达多</b>创立佛教；古印度人发明了包括“0”在内的数字符号。'
  ]);

  /* ========== 大题训练 ========== */
  L.essay('#essay', {
    title: '大河孕育的古代亚非文明',
    materials: [
      { label: '材料一', text: '尼罗河每年定期泛滥，洪水退去后留下肥沃的淤泥，古埃及人就在上面耕种；为了掌握泛滥的规律，他们观测天象，制定了太阳历。两河流域的苏美尔人开挖水渠、灌溉农田，还用芦苇秆在湿泥板上刻写符号记事，形成了楔形文字。', src: '——据统编版九年级上册第 2、3 课整理' },
      { label: '材料二', text: '《汉谟拉比法典》中有这样的规定（大意）：如果一个人弄瞎了自由民的眼睛，他自己的眼睛也要被弄瞎；如果弄瞎的是奴隶的眼睛，只需向奴隶的主人赔偿奴隶买价的一半。', src: '——据统编版九年级上册第 2 课整理（法典条文大意）' }
    ],
    parts: [
      {
        ask: '(1) 根据材料一，概括大河对古代文明的产生起了哪些作用。', score: 4, type: 'sum',
        points: [
          { t: '提供充足的水源和肥沃的土地', s: 1 },
          { t: '便于灌溉，促进了农业生产（耕种、开渠灌溉）', s: 1 },
          { t: '推动了历法等科学知识的产生（太阳历）', s: 1 },
          { t: '推动了文字的产生（楔形文字）', s: 1 }
        ],
        model: '大河提供了充足的水源和肥沃的土地；便于灌溉，促进了农业的发展；为了掌握河水泛滥规律，推动了历法（太阳历）等科学知识的产生；生产和管理的需要推动了文字（楔形文字）的产生。'
      },
      {
        ask: '(2) 根据材料二并结合所学，指出这部法典由谁颁布，说明它维护的是谁的利益。', score: 4, type: 'sum',
        points: [
          { t: '古巴比伦国王汉谟拉比颁布（约公元前 18 世纪）', s: 1 },
          { t: '同样的伤害，对自由民和奴隶的处罚不同', s: 1 },
          { t: '奴隶被当作主人的财产，社会等级森严、不平等', s: 1 },
          { t: '维护奴隶主阶级的利益和统治', s: 1 }
        ],
        model: '约公元前 18 世纪由古巴比伦国王汉谟拉比颁布。材料中伤害自由民要“以眼还眼”，伤害奴隶只赔给主人一半买价，说明奴隶被当作主人的财产，社会等级森严。法典维护的是奴隶主阶级的利益和统治。'
      },
      {
        ask: '(3) 围绕“大河与古代亚非文明”，自拟一个观点，结合两个文明古国的史实加以阐述。（要求：观点正确，史论结合，条理清楚）', score: 8, type: 'essay',
        points: [
          { t: '观点明确、正确，如“大河孕育了古代亚非文明”', s: 2 },
          { t: '用一个文明古国的史实论证（如古埃及：尼罗河、法老、金字塔、象形文字、太阳历）', s: 2 },
          { t: '用另一个文明古国的史实论证（如两河流域：楔形文字、《汉谟拉比法典》；或古印度：种姓制度、佛教）', s: 2 },
          { t: '有结论回扣观点，条理清楚', s: 2 }
        ],
        model: '观点：大河孕育了古代亚非文明。论证：古埃及依托尼罗河，河水定期泛滥带来肥沃土地，农业发达，出现了掌握最高权力的法老，修建了金字塔，创造了象形文字和太阳历；两河流域依托幼发拉底河和底格里斯河，苏美尔人创造楔形文字，古巴比伦国王汉谟拉比颁布了《汉谟拉比法典》。结论：大河流域水源充足、土地肥沃，农业发达，为国家和文字的产生提供了条件，所以最早的文明都诞生在大河流域。'
      }
    ]
  });

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '在对比器里找到“金字塔”所在的文明',
      desc: '在上面的四大文明古国对比器里切换，找到代表成就里有金字塔的那一个，让它保持选中。',
      label: '在对比器里操作',
      button: '检查我选的文明',
      check: function () {
        if (civ === 'egypt') return { ok: true, msg: '金字塔是古埃及<b>法老的陵墓</b>，古埃及依托的是<b>尼罗河</b>。' };
        return { ok: false, msg: '现在选的是“' + civOf(civ).full + '”，它的代表成就是' + civOf(civ).featText + '。金字塔在哪条河边？' };
      }
    },
    {
      level: 'base',
      title: '《汉谟拉比法典》属于哪个文明',
      desc: '它是迄今已知的世界上第一部比较完备的成文法典。',
      options: ['古代两河流域（古巴比伦王国）', '古代埃及', '古代印度', '古代中国'],
      answer: 0,
      hint: '汉谟拉比是哪个王国的国王？那个王国在哪两条河之间？',
      explain: '约公元前 18 世纪，<b>古巴比伦</b>国王汉谟拉比统一两河流域后颁布了这部法典。古埃及的代表是金字塔，古印度是种姓制度和佛教，古代中国是甲骨文、青铜器。'
    },
    {
      level: 'base',
      title: '四大文明古国的共同点是',
      desc: '想想对比器里每个文明下面都画了什么。',
      options: ['都诞生在大河流域', '都诞生在沿海岛屿', '都实行民主政治', '都使用同一种文字'],
      answer: 0,
      hint: '尼罗河、两河、印度河和恒河、黄河和长江……',
      explain: '四大文明古国都在<b>大河流域</b>：水源充足、土地肥沃、便于灌溉，农业发达才养得起城市和国家。它们文字各不相同；民主政治是后来古希腊雅典的特点；沿海岛屿也不对。'
    },
    {
      level: 'mid',
      title: '把时间尺拖到“露西”生活的年代',
      desc: '在距今时间尺上拖动滑块（或点事件标签），停在“露西”上。',
      label: '在距今时间尺里操作',
      button: '检查时间点',
      check: function () {
        var e = nearDeep();
        if (e && e.id === 'lucy') return { ok: true, msg: '露西距今约 <b>300 万年</b>，已能直立行走。这么久远的时间没法用公元纪年，只能说“距今”。' };
        return { ok: false, msg: '现在' + (e ? '在“' + e.label + '”，' : '是距今' + niceAgo(yearsAgo()) + '，') + '露西更早，要往<b>最左边</b>拖。' };
      }
    },
    {
      level: 'mid',
      title: '把“大河与文明”因果链展开到最后一环',
      desc: '按“下一环”，一直展开到第 6 环，看看大河最后“孕育”出了什么。',
      label: '在因果链里操作',
      button: '检查因果链',
      check: function () {
        if (ck === CHAIN.length - 1) return { ok: true, msg: '大河 → 土地肥沃 → 农业发达、粮食剩余 → 人口聚集与分工 → 需要统一治水和管理 → <b>国家与文字</b>出现。' };
        return { ok: false, msg: '现在展开到第 ' + (ck + 1) + ' 环“' + CHAIN[ck].t + '”，还要继续按“下一环”。' };
      }
    },
    {
      level: 'mid',
      title: '关于佛教的创立，下列说法正确的是',
      desc: '时间、地点、人物要一起对上。',
      options: ['公元前 6 世纪，古印度的乔达摩·悉达多创立', '公元前 18 世纪，古巴比伦的汉谟拉比创立', '公元前 6 世纪，古埃及的法老创立', '公元 6 世纪，古印度的婆罗门创立'],
      answer: 0,
      hint: '佛教主张“众生平等”，是反对婆罗门特权的。',
      explain: '佛教由古印度的<b>乔达摩·悉达多</b>（被尊称为释迦牟尼）在<b>公元前 6 世纪</b>创立。公元前 18 世纪的汉谟拉比是颁布法典的；佛教和埃及无关；“公元 6 世纪”把公元前丢了，而且佛教恰恰反对婆罗门的特权。'
    },
    {
      level: 'trap',
      title: '我们今天用的“阿拉伯数字”，最初是谁发明的',
      desc: '名字叫“阿拉伯”，但别被名字骗了。',
      options: ['古代印度人', '阿拉伯人', '古代埃及人', '两河流域的苏美尔人'],
      answer: 0,
      hint: '阿拉伯人是“快递员”，不是“发明人”。',
      explain: '包括“0”在内的 10 个数字符号是<b>古代印度人</b>发明的，后来经阿拉伯人传到欧洲，欧洲人以为是阿拉伯人发明的，才叫它“阿拉伯数字”。埃及人和苏美尔人有自己的记数方法，但不是这套符号。'
    },
    {
      level: 'trap',
      title: '在古印度种姓制度中，国王和武士属于哪一等级',
      desc: '很多同学以为国王一定在最高等级。',
      options: ['刹帝利', '婆罗门', '吠舍', '首陀罗'],
      answer: 0,
      hint: '最高等级是掌管宗教祭祀的人。',
      explain: '种姓制度从高到低是：<b>婆罗门</b>（祭司）、<b>刹帝利</b>（国王和武士）、吠舍（农民、牧民、手工业者和商人）、首陀罗（大多从事低贱职业）。国王属于第二等级<b>刹帝利</b>，不是婆罗门。'
    }
  ]);
})();
