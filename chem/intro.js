/* 化学互动馆 · 第 1 课 走进化学世界 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();
  var TEAL = '#2c736f', ORANGE = '#c2603f';

  function halo(o) { o['paint-order'] = 'stroke'; o.stroke = '#fbfaf7'; o['stroke-width'] = 3; o['stroke-linejoin'] = 'round'; return o; }
  function stage(svgEl, id, w, h) {
    var d = S('defs', {}, svgEl), c = S('clipPath', { id: id }, d);
    S('rect', { x: 0, y: 0, width: w, height: h, rx: 14 }, c);
    S('rect', { x: 0, y: 0, width: w, height: h, rx: 14, fill: '#fbfaf7' }, svgEl);
    return { defs: d, body: S('g', { 'clip-path': 'url(#' + id + ')' }, svgEl) };
  }

  /* ========== 物理变化还是化学变化 ========== */
  // 粒子样式：a 原子 / o2 / h2o / co2 / blob 大分子 / etoh 酒精 / rust 铁锈 / tri 其他新物质
  var CASES = [
    { id: 'melt', n: '蜡烛熔化', d: '蜡烛受热变软、化成液体，冷却后又凝固', t: 'phy', sign: '状态改变（固体 → 液体）',
      pre: [['石蜡', 'blob', '#c9b48a', 's', 12]], post: [['石蜡', 'blob', '#c9b48a', 'l', 12]],
      why: '石蜡只是从固态变成了液态，冷却后还能凝固回来，<b>还是石蜡</b>，没有生成新物质。' },
    { id: 'burn', n: '蜡烛燃烧', d: '烛焰发光、放热，蜡烛越烧越短', t: 'chem', sign: '发光、放热',
      pre: [['石蜡', 'blob', '#c9b48a', 's', 6], ['氧气 O₂', 'o2', '#d9614a', 'g', 7]], post: [['二氧化碳 CO₂', 'co2', '#4b4f58', 'g', 6], ['水 H₂O', 'h2o', '#5b9bd5', 'g', 6]],
      why: '石蜡和氧气反应，生成了<b>二氧化碳和水</b>，这是原来没有的新物质。燃烧时蜡烛也在熔化：化学变化中一定同时发生物理变化。' },
    { id: 'rust', n: '铁生锈', d: '铁钉放在潮湿的空气里，表面长出红褐色的铁锈', t: 'chem', sign: '变色（银白色 → 红褐色）',
      pre: [['铁 Fe', 'a', '#9aa1ad', 's', 9], ['氧气 O₂', 'o2', '#d9614a', 'g', 4], ['水 H₂O', 'h2o', '#5b9bd5', 'l', 4]], post: [['铁锈（主要含 Fe₂O₃）', 'rust', '#a4532c', 's', 9]],
      why: '铁和空气中的氧气、水反应，生成了<b>铁锈</b>。铁锈疏松、红褐色，和铁的颜色、性质都不同，是新物质。' },
    { id: 'ice', n: '冰融化', d: '冰块放在桌上，慢慢化成一摊水', t: 'phy', sign: '状态改变（固体 → 液体）',
      pre: [['水 H₂O（冰）', 'h2o', '#5b9bd5', 's', 12]], post: [['水 H₂O', 'h2o', '#5b9bd5', 'l', 12]],
      why: '冰和水是<b>同一种物质</b>，只是状态变了，粒子本身没变。' },
    { id: 'evap', n: '酒精挥发', d: '酒精瓶没盖好，酒精变少了，闻到酒精味', t: 'phy', sign: '液体变少，闻到气味',
      pre: [['酒精', 'etoh', '#7a8f3a', 'l', 10]], post: [['酒精（气态）', 'etoh', '#7a8f3a', 'g', 10]],
      why: '酒精从液态变成气态跑到了空气里，<b>还是酒精</b>，没有生成新物质。' },
    { id: 'rot', n: '食物腐败', d: '饭菜放久了，发馊变味，有酸臭味', t: 'chem', sign: '变色、产生异味',
      pre: [['食物中的营养物质', 'blob', '#e0a95a', 's', 8], ['氧气 O₂', 'o2', '#d9614a', 'g', 6]], post: [['有异味的新物质', 'tri', '#7d6a9a', 's', 10]],
      why: '在微生物的作用下，食物中的营养物质与氧气发生缓慢氧化，生成了<b>有酸臭味的新物质</b>。' },
    { id: 'bulb', n: '灯泡通电发光', d: '白炽灯的钨丝通电后发光、发热', t: 'phy', sign: '也发光、放热',
      pre: [['钨 W', 'a', '#8d95a6', 's', 12]], post: [['钨 W（通电发光）', 'a', '#e6a23c', 's', 12]],
      why: '钨丝通电发光，断电后还是钨丝，<b>没有生成新物质</b>。有发光、放热，不一定是化学变化。' },
    { id: 'petrol', n: '汽油燃烧', d: '汽车发动机里，汽油燃烧推动汽车前进', t: 'chem', sign: '发光、放热',
      pre: [['汽油', 'blob', '#d9c27a', 'l', 6], ['氧气 O₂', 'o2', '#d9614a', 'g', 7]], post: [['二氧化碳 CO₂', 'co2', '#4b4f58', 'g', 6], ['水 H₂O', 'h2o', '#5b9bd5', 'g', 6]],
      why: '汽油和氧气反应，生成了<b>二氧化碳和水</b>等新物质，同时放出大量的热。' },
    { id: 'juice', n: '榨橙汁', d: '把橙子放进榨汁机，榨出橙汁，剩下果渣', t: 'phy', sign: '形状改变，汁和渣分开',
      pre: [['水 H₂O', 'h2o', '#5b9bd5', 'l', 6], ['糖等', 'a', '#f0a33a', 'l', 4], ['果肉纤维', 'blob', '#c9a26a', 's', 4]], post: [['水 H₂O', 'h2o', '#5b9bd5', 'l', 6], ['糖等', 'a', '#f0a33a', 'l', 4], ['果肉纤维（果渣）', 'blob', '#c9a26a', 's', 4]],
      why: '只是把橙子里<b>本来就有</b>的水、糖等物质和果渣分开了，没有生成新物质。' },
    { id: 'brew', n: '粮食酿酒', d: '粮食经过发酵，酿出有酒香味的酒', t: 'chem', sign: '产生气体，有酒味',
      pre: [['粮食中的淀粉', 'blob', '#e8d7a8', 's', 6], ['水 H₂O', 'h2o', '#5b9bd5', 'l', 5]], post: [['酒精（乙醇）', 'etoh', '#7a8f3a', 'l', 5], ['二氧化碳 CO₂', 'co2', '#4b4f58', 'g', 4], ['水 H₂O', 'h2o', '#5b9bd5', 'l', 4]],
      why: '粮食中的淀粉经过发酵，生成了<b>酒精（乙醇）</b>等新物质，所以有了酒味。' },
    { id: 'dry', n: '干冰升华', d: '舞台上的干冰“冒白雾”，越来越少', t: 'phy', sign: '“冒白雾”、吸热',
      pre: [['二氧化碳 CO₂（干冰）', 'co2', '#4b4f58', 's', 12]], post: [['二氧化碳 CO₂（气体）', 'co2', '#4b4f58', 'g', 10]],
      why: '干冰是固态的二氧化碳，升华后变成二氧化碳气体，<b>还是二氧化碳</b>。看到的“白雾”是空气中的水蒸气遇冷液化成的小水滴，也不是新物质。' }
  ];
  var caseId = CASES.some(function (c) { return c.id === st.cs; }) ? st.cs : 'melt';
  var judged = {};
  function cur() { for (var i = 0; i < CASES.length; i++) if (CASES[i].id === caseId) return CASES[i]; }

  var chg = L.$('#change'), cS = stage(chg, 'change-clip', 400, 240), cBody = cS.body;

  function glyph(g, type, x, y, col) {
    var red = '#d9614a', dark = '#4b4f58';
    if (type === 'a') S('circle', { cx: x, cy: y, r: 4.2, fill: col, stroke: '#00000022' }, g);
    else if (type === 'o2') { S('circle', { cx: x - 2.8, cy: y, r: 3.4, fill: red }, g); S('circle', { cx: x + 2.8, cy: y, r: 3.4, fill: red }, g); }
    else if (type === 'h2o') {
      S('circle', { cx: x - 3.6, cy: y + 2.4, r: 2.3, fill: '#eef3f6', stroke: '#9aa7b3', 'stroke-width': 0.8 }, g);
      S('circle', { cx: x + 3.6, cy: y + 2.4, r: 2.3, fill: '#eef3f6', stroke: '#9aa7b3', 'stroke-width': 0.8 }, g);
      S('circle', { cx: x, cy: y, r: 3.6, fill: col }, g);
    } else if (type === 'co2') {
      S('circle', { cx: x - 5.4, cy: y, r: 2.9, fill: red }, g); S('circle', { cx: x + 5.4, cy: y, r: 2.9, fill: red }, g);
      S('circle', { cx: x, cy: y, r: 3.4, fill: dark }, g);
    } else if (type === 'blob') {
      [[-6, 1.5], [-2, -1.5], [2, 1.5], [6, -1.5]].forEach(function (p) { S('circle', { cx: x + p[0], cy: y + p[1], r: 2.7, fill: col, stroke: '#00000022' }, g); });
    } else if (type === 'etoh') {
      S('circle', { cx: x - 4.2, cy: y + 1, r: 2.7, fill: col }, g); S('circle', { cx: x, cy: y - 1.5, r: 2.7, fill: col }, g);
      S('circle', { cx: x + 4.4, cy: y + 1, r: 2.4, fill: red }, g);
    } else if (type === 'rust') {
      S('circle', { cx: x - 2.6, cy: y, r: 3.2, fill: col }, g); S('circle', { cx: x + 2.6, cy: y, r: 3.2, fill: col }, g);
      S('circle', { cx: x, cy: y - 3.4, r: 2.2, fill: red }, g);
    } else {
      S('circle', { cx: x, cy: y - 2.6, r: 2.6, fill: col }, g); S('circle', { cx: x - 3, cy: y + 2, r: 2.6, fill: col }, g); S('circle', { cx: x + 3, cy: y + 2, r: 2.4, fill: '#d9a35f' }, g);
    }
  }
  function layout(subs, bx, by, bw, bh, seed) {
    var pts = [], out = [];
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    function free(x, y) { for (var i = 0; i < pts.length; i++) if (Math.hypot(pts[i][0] - x, pts[i][1] - y) < 15) return false; return true; }
    var x0 = bx + 14, x1 = bx + bw - 14, y0 = by + 26, y1 = by + bh - 40;
    var solids = subs.filter(function (s) { return s[3] === 's'; }).length, si = 0;
    subs.forEach(function (sb) {
      var k, x, y, tries;
      if (sb[3] === 's') {
        var cols = Math.min(5, Math.ceil(Math.sqrt(sb[4] * 1.3))), rows = Math.ceil(sb[4] / cols);
        var span = (x1 - x0) / solids, cx = x0 + span * (si + 0.5), gx = 17, gy = 13;
        if (solids === 1 && subs.length > 1) cx = x0 + (x1 - x0) * 0.5;
        si++;
        for (k = 0; k < sb[4]; k++) {
          var r = Math.floor(k / cols), c = k % cols;
          x = cx + (c - (cols - 1) / 2) * gx + (r % 2 ? 3 : 0); y = y1 - r * gy;
          pts.push([x, y]); out.push([sb, x, y]);
        }
      } else {
        for (k = 0; k < sb[4]; k++) {
          tries = 0;
          do {
            x = x0 + rnd() * (x1 - x0);
            y = sb[3] === 'l' ? y1 - rnd() * (y1 - y0) * 0.5 : y0 + rnd() * (y1 - y0);
            tries++;
          } while (!free(x, y) && tries < 300);
          pts.push([x, y]); out.push([sb, x, y]);
        }
      }
    });
    return out;
  }
  function legend(g, subs, bx, by) {
    var x = bx + 10, y = by - 26;
    subs.forEach(function (sb) {
      var w = 22 + sb[0].length * 9.4;
      if (x + w > bx + 168) { x = bx + 10; y += 14; }
      glyph(g, sb[1], x + 7, y - 3, sb[2]);
      S('text', { x: x + 16, y: y + 0.5, 'font-size': 9.5, fill: '#405250', text: sb[0] }, g);
      x += w;
    });
  }
  function box(g, bx, title, subs, seed, reveal) {
    var by = 52, bw = 172, bh = 164;
    S('rect', { x: bx, y: by, width: bw, height: bh, rx: 12, fill: '#fff', stroke: '#d5e3e2' }, g);
    S('text', { x: bx + 10, y: by + 16, 'font-size': 10.5, fill: TEAL, 'font-weight': 700, text: title }, g);
    if (!reveal) {
      S('text', { x: bx + bw / 2, y: by + 84, 'font-size': 40, 'text-anchor': 'middle', fill: '#c5d8d6', 'font-weight': 700, text: '?' }, g);
      S('text', { x: bx + bw / 2, y: by + 112, 'font-size': 10, 'text-anchor': 'middle', fill: '#7c8c8b', text: '先判断，再揭晓' }, g);
      return;
    }
    layout(subs, bx, by, bw, bh, seed).forEach(function (p) { glyph(g, p[0][1], p[1], p[2], p[0][2]); });
    S('line', { x1: bx + 8, y1: by + bh - 34, x2: bx + bw - 8, y2: by + bh - 34, stroke: '#edf2f1' }, g);
    legend(g, subs, bx, by + bh);
  }
  function drawChange() {
    cBody.innerHTML = '';
    var c = cur(), j = judged[c.id], idx = CASES.indexOf(c);
    S('text', { x: 200, y: 20, 'font-size': 13, 'text-anchor': 'middle', fill: TEAL, 'font-weight': 700, text: c.n }, cBody);
    S('text', { x: 200, y: 38, 'font-size': 10, 'text-anchor': 'middle', fill: '#546160', text: c.d }, cBody);
    box(cBody, 12, '变化前（微观示意）', c.pre, 17 + idx * 31, true);
    box(cBody, 216, '变化后', c.post, 53 + idx * 29, !!j);
    L.arrow(cBody, 188, 134, 212, 134, { color: '#7c8c8b', width: 2, head: 8 });
    if (j) {
      var ok = j === c.t;
      S('text', { x: 200, y: 232, 'font-size': 10.5, 'text-anchor': 'middle', fill: ok ? TEAL : ORANGE, 'font-weight': 700, text: (c.t === 'chem' ? '变化后出现了新的粒子 → 生成了新物质 → 化学变化' : '粒子还是原来那些 → 没有新物质 → 物理变化') }, cBody);
    }
    caseReadout();
  }
  var caseChips;
  function renderCaseChips() {
    caseChips = L.chips(L.$('#case-chips'), CASES.map(function (c) {
      var j = judged[c.id];
      return { label: (j ? (j === c.t ? '✓ ' : '✗ ') : '') + c.n, value: c.id };
    }), caseId, function (v) { caseId = v; drawChange(); });
  }
  function score() {
    var n = 0, ok = 0;
    CASES.forEach(function (c) { if (judged[c.id]) { n++; if (judged[c.id] === c.t) ok++; } });
    return { n: n, ok: ok };
  }
  function caseReadout() {
    var c = cur(), j = judged[c.id], sc = score();
    L.$('#case-badge').textContent = !j ? '待判断' : (j === c.t ? '判断正确' : '再想想');
    L.$('#case-verdict').textContent = j ? (j === 'chem' ? '化学变化' : '物理变化') : '—';
    L.$('#case-new').textContent = j ? (c.t === 'chem' ? '有' : '没有') : '先判断';
    L.$('#case-sign').textContent = c.sign;
    L.$('#case-score').textContent = '已判断 ' + sc.n + ' / ' + CASES.length + ' 个，判断对 ' + sc.ok + ' 个';
    var t;
    if (!j) t = '看“变化前”的粒子，想一想：变化之后，会不会出现原来没有的粒子？';
    else if (j === c.t) t = c.why;
    else t = '不对。' + c.why + (c.t === 'phy' ? ' 别被“' + c.sign + '”迷惑，要看有没有新物质。' : '');
    L.$('#case-text').innerHTML = t;
    save();
  }
  function judge(v) { judged[caseId] = v; renderCaseChips(); drawChange(); }
  L.$('#judge-phy').addEventListener('click', function () { judge('phy'); });
  L.$('#judge-chem').addEventListener('click', function () { judge('chem'); });

  /* ========== 性质还是变化 ========== */
  var PROPS = [
    ['酒精能燃烧', 'cp', '“能燃烧”说的是酒精的本领（可燃性），要通过燃烧这个化学变化才表现出来，是化学性质。'],
    ['酒精燃烧了', 'cc', '燃烧正在发生、生成了二氧化碳和水，是化学变化。'],
    ['酒精容易挥发', 'pp', '“容易挥发”是酒精的本领，挥发时不生成新物质，是物理性质。'],
    ['酒精挥发了', 'pc', '酒精由液态变成气态，这个过程没有新物质生成，是物理变化。'],
    ['铁在潮湿的空气中容易生锈', 'cp', '“容易生锈”是铁的本领，要通过生锈这个化学变化才表现出来，是化学性质。'],
    ['水的沸点是 100 ℃（标准大气压下）', 'pp', '沸点不用发生化学变化就能测出来，是物理性质。']
  ];
  var PNAME = { pc: '物理变化', cc: '化学变化', pp: '物理性质', cp: '化学性质' };
  var propAns = {};
  function renderProps() {
    var list = L.$('#prop-list'); list.innerHTML = '';
    PROPS.forEach(function (p, i) {
      var a = propAns[i];
      var row = L.html('div', { class: 'choice-row' + (a ? (a === p[1] ? ' correct' : ' wrong') : '') }, list);
      var txt = L.html('div', { style: 'min-width:0;flex:1' }, row);
      L.html('p', { html: '<b>' + p[0] + '</b>' }, txt);
      var bx = L.html('div', { class: 'chips small', style: 'flex-wrap:wrap;justify-content:flex-end;max-width:178px;gap:5px' }, row);
      ['pc', 'cc', 'pp', 'cp'].forEach(function (k) {
        var b = L.html('button', { type: 'button', text: PNAME[k], 'aria-pressed': String(a === k) }, bx);
        b.addEventListener('click', function () { propAns[i] = k; renderProps(); });
      });
      if (a) L.html('p', { class: 'verdict', html: (a === p[1] ? '✓ ' : '✗ 应该是' + PNAME[p[1]] + '。') + p[2] }, txt);
    });
    var n = 0, ok = 0;
    PROPS.forEach(function (p, i) { if (propAns[i]) { n++; if (propAns[i] === p[1]) ok++; } });
    L.$('#prop-score').textContent = '已答 ' + n + ' / ' + PROPS.length + (n ? '，答对 ' + ok + ' 句' : '') + (ok === PROPS.length ? '。全对！' : '');
  }

  /* ========== 量筒读数 ========== */
  var cyl = L.$('#cyl'), yS = stage(cyl, 'cyl-clip', 400, 240), yBody = yS.body;
  var V0 = Math.round(L.num(st.v, 37, 36, 39));
  var eye = Math.round(L.num(st.e, 0, -80, 80) / 2) * 2;
  var CX = 150, CR = 36, EX = 340;
  var eyeIn = L.$('#eye-in'); eyeIn.value = eye;
  function Yv(v) { return 200 - (v - 30) * 12; }
  function reading() {
    var yV = Yv(V0), yE = yV - eye, yr = yV + (yE - yV) * (CR / (EX - CX));
    return 30 + (200 - yr) / 12;
  }
  function view() { return eye > 4 ? 'down' : eye < -4 ? 'up' : 'level'; }
  var eyeChips;
  function drawCyl() {
    yBody.innerHTML = '';
    var yV = Yv(V0), yE = yV - eye, r = reading(), yr = 200 - (r - 30) * 12;
    S('text', { x: 14, y: 20, 'font-size': 10, fill: '#546160', text: '量筒（局部放大）' }, yBody);
    S('rect', { x: CX - CR, y: 0, width: CR * 2, height: 240, fill: '#eef6f6', 'fill-opacity': 0.6 }, yBody);
    S('path', { d: 'M' + (CX - CR) + ' ' + (yV - 5) + 'Q' + CX + ' ' + (yV + 5) + ' ' + (CX + CR) + ' ' + (yV - 5) + 'V240H' + (CX - CR) + 'z', fill: '#bfe0f0', 'fill-opacity': 0.85 }, yBody);
    S('path', { d: 'M' + (CX - CR) + ' ' + (yV - 5) + 'Q' + CX + ' ' + (yV + 5) + ' ' + (CX + CR) + ' ' + (yV - 5), fill: 'none', stroke: '#4f8fb3', 'stroke-width': 1.5 }, yBody);
    S('line', { x1: CX - CR, y1: 0, x2: CX - CR, y2: 240, stroke: '#8fb3b0', 'stroke-width': 2 }, yBody);
    S('line', { x1: CX + CR, y1: 0, x2: CX + CR, y2: 240, stroke: '#8fb3b0', 'stroke-width': 2 }, yBody);
    for (var v = 30; v <= 46; v++) {
      var y = Yv(v), big = v % 5 === 0;
      S('line', { x1: CX + CR, y1: y, x2: CX + CR - (big ? 16 : 9), y2: y, stroke: '#3d5654', 'stroke-width': big ? 1.4 : 1 }, yBody);
      if (big) S('text', { x: CX + CR - 20, y: y + 3.5, 'font-size': 10, 'text-anchor': 'end', fill: '#2f4644', 'font-weight': 600, text: v }, yBody);
    }
    S('text', { x: CX + CR + 6, y: 12, 'font-size': 9.5, fill: '#546160', text: '单位：mL' }, yBody);
    // 凹液面最低处
    S('circle', { cx: CX, cy: yV, r: 2.4, fill: '#2f6f99' }, yBody);
    S('text', halo({ x: CX - CR - 6, y: yV + 4, 'font-size': 9.5, 'text-anchor': 'end', fill: '#2f6f99', text: '凹液面最低处' }), yBody);
    // 视线
    S('line', { x1: EX - 13, y1: yE, x2: CX, y2: yV, stroke: ORANGE, 'stroke-width': 1.5, 'stroke-dasharray': view() === 'level' ? null : '5 3' }, yBody);
    S('circle', { cx: CX + CR, cy: yr, r: 3.4, fill: ORANGE }, yBody);
    S('text', halo({ x: CX + CR + 8, y: yr + (eye >= 0 ? -7 : 14), 'font-size': 10, fill: ORANGE, 'font-weight': 700, text: '读到 ' + r.toFixed(1) }), yBody);
    // 眼睛（可拖）
    var eg = S('g', { class: 'pt', tabindex: 0, role: 'slider', 'aria-label': '眼睛的高度', 'aria-valuenow': eye, 'aria-valuemin': -80, 'aria-valuemax': 80, style: 'cursor:ns-resize' }, yBody);
    S('rect', { x: EX - 22, y: yE - 22, width: 50, height: 46, fill: 'transparent' }, eg);
    S('path', { d: 'M' + (EX - 14) + ' ' + yE + 'Q' + EX + ' ' + (yE - 10) + ' ' + (EX + 14) + ' ' + yE + 'Q' + EX + ' ' + (yE + 10) + ' ' + (EX - 14) + ' ' + yE + 'z', fill: '#fff', stroke: '#405250', 'stroke-width': 1.4 }, eg);
    S('circle', { cx: EX - 5, cy: yE, r: 4, fill: TEAL }, eg);
    S('text', { x: EX + 2, y: yE + 22, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#546160', text: '↕ 拖我' }, eg);
    eg.addEventListener('pointerdown', function (e) { yDrag = true; try { cyl.setPointerCapture(e.pointerId); } catch (err) {} e.preventDefault(); });
    eg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowUp') { setEye(eye + 2); e.preventDefault(); }
      if (e.key === 'ArrowDown') { setEye(eye - 2); e.preventDefault(); }
    });
    cylReadout(r);
  }
  var yDrag = false;
  cyl.addEventListener('pointermove', function (e) { if (yDrag) setEye(Yv(V0) - L.svgPoint(cyl, e).y, true); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (n) { cyl.addEventListener(n, function () { yDrag = false; }); });
  function setEye(v, keepFocus) {
    eye = Math.round(L.clamp(v, -80, 80) / 2) * 2;
    eyeIn.value = eye; L.paintRange(eyeIn);
    drawCyl();
    if (!keepFocus) { var p = L.$('#cyl .pt'); if (p) p.focus(); }
  }
  function cylReadout(r) {
    var vw = view(), d = r - V0;
    var name = { down: '俯视', level: '平视', up: '仰视' }[vw];
    L.$('#eye-out').textContent = name;
    L.$('#cyl-badge').textContent = name;
    L.$('#read-v').innerHTML = r.toFixed(1) + '<small>mL</small>';
    L.$('#true-v').innerHTML = V0.toFixed(1) + '<small>mL</small>';
    L.$('#err-v').textContent = vw === 'level' ? '准确' : (d > 0 ? '偏大 ' : '偏小 ') + Math.abs(d).toFixed(1) + ' mL';
    var t;
    if (vw === 'level') t = '视线与凹液面最低处保持水平，读数等于实际体积 ' + V0.toFixed(1) + ' mL。这是唯一正确的读法。';
    else if (vw === 'down') t = '<b>俯视</b>：眼睛比液面高，视线斜着往下穿过量筒壁上的刻度，碰到的刻度比液面<b>高</b>，读数<b>偏大</b>。眼睛越高，偏得越多。';
    else t = '<b>仰视</b>：眼睛比液面低，视线斜着往上穿过刻度，碰到的刻度比液面<b>低</b>，读数<b>偏小</b>。眼睛越低，偏得越多。';
    L.$('#cyl-text').innerHTML = t;
    if (eyeChips) eyeChips.set(vw);
    save();
  }
  L.bindRange(eyeIn, function (v) { eye = v; drawCyl(); });
  eyeChips = L.chips(L.$('#eye-chips'), [{ label: '俯视', value: 'down' }, { label: '平视', value: 'level' }, { label: '仰视', value: 'up' }], view(), function (v) { setEye(v === 'down' ? 60 : v === 'up' ? -60 : 0, true); });
  L.$('#new-vol').addEventListener('click', function () {
    var nv; do { nv = 36 + Math.floor(Math.random() * 4); } while (nv === V0);
    V0 = nv; drawCyl();
  });

  /* ========== 酒精灯 ========== */
  var lamp = L.$('#lamp'), lS = stage(lamp, 'lamp-clip', 400, 240), lBody = lS.body;
  var tubeClip = S('clipPath', { id: 'tube-clip' }, lS.defs);
  var tubeClipPath = S('path', {}, tubeClip);
  var lmode = st.lm === 'heat' ? 'heat' : 'flame';
  var sh = Math.round(L.num(st.h, 2, 1, 9));
  var liq = Math.round(L.num(st.q, 20, 5, 60) / 5) * 5;
  var lit = true, warn = false, phase = 'idle', burnT = 0, chars = [];
  var stickIn = L.$('#stick-in'), liqIn = L.$('#liq-in');
  stickIn.value = sh; liqIn.value = liq;
  var WICK = 172, SX0 = 96, SX1 = 204, MAG = 2.6;
  var LAYERS = { outer: { h: 112, w: 30 }, inner: { h: 82, w: 20 }, core: { h: 36, w: 9 } };
  function gshape(t) { return Math.sqrt(t) * Math.pow(1 - t, 1.1); }
  var GMAX = 0;
  for (var gi = 0; gi <= 200; gi++) GMAX = Math.max(GMAX, gshape(gi / 200));
  function hw(ly, y, lx, k) {
    var h = ly.h * k, t = (WICK - y) / h;
    if (t <= 0 || t >= 1) return 0;
    return ly.w * k * gshape(t) / GMAX;
  }
  function layerAt(x, y, lx, k) {
    var dx = Math.abs(x - lx);
    if (dx < hw(LAYERS.core, y, lx, k)) return 'core';
    if (dx < hw(LAYERS.inner, y, lx, k)) return 'inner';
    if (dx < hw(LAYERS.outer, y, lx, k)) return 'outer';
    return '';
  }
  var HEAT = { outer: 1, inner: 0.55, core: 0.12, '': 0 };
  function stickY() { return WICK - 6 - (sh - 1) * 12; }
  function crossed() {
    var y = stickY(), seen = {};
    for (var x = SX0; x <= SX1; x++) { var l = layerAt(x, y, 150, 1); if (l) seen[l] = 1; }
    return seen;
  }
  function flamePath(ly, lx, k) {
    var h = ly.h * k, R = [], Lf = [];
    for (var i = 0; i <= 40; i++) {
      var t = i / 40, y = WICK - h * t, w = ly.w * k * gshape(t) / GMAX;
      R.push((lx + w).toFixed(1) + ' ' + y.toFixed(1)); Lf.unshift((lx - w).toFixed(1) + ' ' + y.toFixed(1));
    }
    return 'M' + R.join('L') + 'L' + Lf.join('L') + 'z';
  }
  function drawLampBody(lx) {
    S('path', { d: 'M' + (lx - 40) + ' 232Q' + (lx - 46) + ' 196 ' + (lx - 12) + ' 186V180H' + (lx + 12) + 'V186Q' + (lx + 46) + ' 196 ' + (lx + 40) + ' 232z', fill: '#e6f1f0', stroke: '#8fb3b0', 'stroke-width': 1.6 }, lBody);
    S('path', { d: 'M' + (lx - 36) + ' 230Q' + (lx - 40) + ' 210 ' + (lx - 24) + ' 202H' + (lx + 24) + 'Q' + (lx + 40) + ' 210 ' + (lx + 36) + ' 230z', fill: '#cfe6ea', opacity: 0.9 }, lBody);
    S('rect', { x: lx - 9, y: 174, width: 18, height: 7, rx: 1.5, fill: '#9aa1ad' }, lBody);
    S('rect', { x: lx - 2.5, y: 168, width: 5, height: 7, fill: '#f4efe4', stroke: '#c9b48a', 'stroke-width': 0.8 }, lBody);
    S('text', { x: lx + 48, y: 226, 'font-size': 9.5, fill: '#546160', text: '酒精灯' }, lBody);
  }
  function drawFlame(lx, k) {
    S('path', { d: flamePath(LAYERS.outer, lx, k), fill: '#f4a340', 'fill-opacity': 0.72 }, lBody);
    S('path', { d: flamePath(LAYERS.inner, lx, k), fill: '#fbd36b', 'fill-opacity': 0.9 }, lBody);
    S('path', { d: flamePath(LAYERS.core, lx, k), fill: '#9fc3e0', 'fill-opacity': 0.95 }, lBody);
  }
  function charColor(c) {
    c = L.clamp(c, 0, 1);
    var a = [227, 196, 140], b = [122, 74, 34], d = [35, 26, 20], p, q, t;
    if (c < 0.5) { p = a; q = b; t = c / 0.5; } else { p = b; q = d; t = (c - 0.5) / 0.5; }
    return 'rgb(' + [0, 1, 2].map(function (i) { return Math.round(p[i] + (q[i] - p[i]) * t); }).join(',') + ')';
  }
  function drawStick(y) {
    for (var x = SX0; x < SX1; x += 2) S('rect', { x: x, y: y - 2.5, width: 2.2, height: 5, fill: charColor(chars[x - SX0] || 0) }, lBody);
  }
  function drawTakenOut(ys) {
    // 取出的火柴梗：以 x = 150 为中心横向放大，便于看清碳化的分段
    function M(x) { return 150 + (x - 150) * MAG; }
    for (var x = SX0; x < SX1; x++) S('rect', { x: M(x), y: 18, width: MAG + 0.4, height: 10, fill: charColor(chars[x - SX0] || 0) }, lBody);
    S('rect', { x: M(SX0), y: 18, width: (SX1 - SX0) * MAG, height: 10, rx: 2, fill: 'none', stroke: '#c9a26a', 'stroke-width': 0.8 }, lBody);
    S('text', { x: M(SX0), y: 12, 'font-size': 9.5, fill: '#546160', text: '取出的火柴梗（横向放大）' }, lBody);
    var runs = [], last = null;
    for (x = SX0; x <= 150; x++) {
      var l = layerAt(x, ys, 150, 1);
      if (!last || last.l !== l) { last = { l: l, a: x, b: x }; runs.push(last); } else last.b = x;
    }
    var o = runs.filter(function (r) { return r.l === 'outer'; })[0];
    var mid = layerAt(150, ys, 150, 1);
    if (o) [M((o.a + o.b) / 2), M(300 - (o.a + o.b) / 2)].forEach(function (mx) {
      S('line', { x1: mx, y1: 29, x2: mx, y2: 35, stroke: '#2f4644', 'stroke-width': 1 }, lBody);
      S('text', { x: mx, y: 45, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#2f4644', 'font-weight': 600, text: '外焰处' }, lBody);
    });
    if (mid && mid !== 'outer') {
      S('line', { x1: 150, y1: 29, x2: 150, y2: 35, stroke: '#2f4644', 'stroke-width': 1 }, lBody);
      S('text', { x: 150, y: 45, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#2f4644', 'font-weight': 600, text: mid === 'core' ? '焰心处' : '内焰处' }, lBody);
    }
  }
  function drawLamp() {
    lBody.innerHTML = '';
    if (lmode === 'flame') {
      drawLampBody(150);
      if (lit) {
        drawFlame(150, 1);
        var lab = [['外焰', 70, 'outer'], ['内焰', 112, 'inner'], ['焰心', 152, 'core']];
        lab.forEach(function (l) {
          var ly = l[1], xr = 150 + hw(LAYERS[l[2]], ly, 150, 1);
          if (l[2] === 'outer') xr = 150 + hw(LAYERS.outer, ly, 150, 1);
          S('line', { x1: xr - 2, y1: ly, x2: 262, y2: ly, stroke: '#a7b6b5', 'stroke-width': 0.8 }, lBody);
          S('text', { x: 266, y: ly + 3.5, 'font-size': 10, fill: '#405250', 'font-weight': 600, text: l[0] + (l[2] === 'outer' ? '（温度最高）' : l[2] === 'core' ? '（温度最低）' : '') }, lBody);
        });
      } else {
        S('path', { d: 'M132 182V160Q132 150 150 150Q168 150 168 160V182z', fill: '#d5e3e2', stroke: '#8fb3b0', 'stroke-width': 1.4 }, lBody);
        S('text', { x: 176, y: 160, 'font-size': 10, fill: '#405250', text: '灯帽' }, lBody);
      }
      var y = stickY();
      if (phase === 'idle') {
        S('rect', { x: 10, y: y - 2.5, width: SX1 - SX0, height: 5, rx: 2, fill: '#e3c48c' }, lBody);
        S('text', { x: 10, y: y - 8, 'font-size': 9.5, fill: '#546160', text: '火柴梗（准备好）' }, lBody);
        S('line', { x1: SX0, y1: y, x2: SX1, y2: y, stroke: '#c8d4d3', 'stroke-dasharray': '3 4' }, lBody);
      } else if (phase === 'burning') {
        drawStick(y);
      } else {
        drawTakenOut(y);
        S('line', { x1: SX0, y1: y, x2: SX1, y2: y, stroke: '#a7b6b5', 'stroke-dasharray': '3 3' }, lBody);
        S('text', { x: SX0 - 4, y: y + 3.5, 'font-size': 9.5, 'text-anchor': 'end', fill: '#7c8c8b', text: '刚才放的位置' }, lBody);
      }
      if (warn) {
        S('rect', { x: 12, y: 196, width: 82, height: 34, rx: 8, fill: '#fbe4da' }, lBody);
        S('text', { x: 53, y: 211, 'font-size': 10, 'text-anchor': 'middle', fill: '#a4492b', 'font-weight': 700, text: '危险！' }, lBody);
        S('text', { x: 53, y: 224, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#a4492b', text: '不能用嘴吹' }, lBody);
      }
    } else {
      var LX = 130, K = 0.75;
      drawLampBody(LX);
      if (lit) drawFlame(LX, K);
      var B = [134, 95], u = [Math.SQRT1_2, -Math.SQRT1_2], TL = 120, TR = 9;
      var tf = 'translate(' + B[0] + ' ' + B[1] + ') rotate(-45)';
      var tubeD = 'M0 -' + TR + 'H' + TL + 'V' + TR + 'H0A' + TR + ' ' + TR + ' 0 0 1 0 -' + TR + 'z';
      tubeClipPath.setAttribute('d', tubeD); tubeClipPath.setAttribute('transform', tf);
      var p = liq / 100, ys = B[1] + u[1] * p * TL;
      S('rect', { x: 0, y: ys, width: 400, height: 240 - ys, fill: '#bfe0f0', 'clip-path': 'url(#tube-clip)' }, lBody);
      S('path', { d: tubeD, transform: tf, fill: '#eef6f6', 'fill-opacity': 0.25, stroke: '#6f9c99', 'stroke-width': 1.6 }, lBody);
      var tg = S('g', { transform: tf }, lBody);
      S('line', { x1: TL / 3, y1: -TR - 4, x2: TL / 3, y2: TR + 4, stroke: TEAL, 'stroke-width': 1.2, 'stroke-dasharray': '2 2' }, tg);
      S('rect', { x: TL * 2 / 3 - 4, y: -TR - 3, width: 8, height: TR * 2 + 6, rx: 2, fill: '#8a8598' }, tg);
      var m3 = [B[0] + u[0] * TL / 3 - 16, B[1] + u[1] * TL / 3 - 10];
      S('text', halo({ x: m3[0], y: m3[1], 'font-size': 10, 'text-anchor': 'end', fill: TEAL, 'font-weight': 700, text: '1/3' }), lBody);
      var Cp = [B[0] + u[0] * TL * 2 / 3, B[1] + u[1] * TL * 2 / 3];
      S('line', { x1: Cp[0] + 9, y1: Cp[1] + 9, x2: Cp[0] + 80, y2: Cp[1] + 80, stroke: '#8a8598', 'stroke-width': 4, 'stroke-linecap': 'round' }, lBody);
      S('text', { x: Cp[0] + 86, y: Cp[1] + 86, 'font-size': 9.5, fill: '#546160', text: '试管夹' }, lBody);
      S('text', { x: Cp[0] + 86, y: Cp[1] + 99, 'font-size': 9.5, fill: '#546160', text: '夹在距管口约 1/3 处' }, lBody);
      var M = [B[0] + u[0] * TL, B[1] + u[1] * TL];
      S('text', { x: M[0] + 12, y: M[1] + 6, 'font-size': 9.5, fill: '#546160', text: '管口不对着自己和别人' }, lBody);
      S('text', { x: 178, y: 112, 'font-size': 9.5, fill: '#546160', text: '倾斜约 45°' }, lBody);
      S('text', { x: 14, y: 100, 'font-size': 9.5, fill: '#546160', text: '用外焰加热，' }, lBody);
      S('text', { x: 14, y: 113, 'font-size': 9.5, fill: '#546160', text: '先预热' }, lBody);
      if (p > 1 / 3) {
        S('rect', { x: 12, y: 130, width: 88, height: 34, rx: 8, fill: '#fbe4da' }, lBody);
        S('text', { x: 56, y: 145, 'font-size': 10, 'text-anchor': 'middle', fill: '#a4492b', 'font-weight': 700, text: '液体太多' }, lBody);
        S('text', { x: 56, y: 158, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#a4492b', text: '超过了 1/3' }, lBody);
      }
    }
    lampReadout();
  }
  function lampReadout() {
    var flame = lmode === 'flame';
    L.$('#flame-ctl').hidden = !flame;
    L.$('#heat-ctl').hidden = flame;
    L.$('#cap-btn').textContent = lit ? '盖上灯帽' : '用火柴点燃';
    L.$('#stick-btn').textContent = phase === 'done' ? '换根新火柴梗再做一次' : '把火柴梗平放进火焰约 1 秒';
    var cs = crossed(), names = [];
    if (cs.outer) names.push('外焰'); if (cs.inner) names.push('内焰'); if (cs.core) names.push('焰心');
    L.$('#stick-out').textContent = names.length ? '穿过' + names.join('、') : '不在火焰里';
    L.$('#liq-out').textContent = liq + ' %';
    var t;
    if (flame) {
      L.$('#lamp-ka').textContent = '碳化最重的位置';
      L.$('#lamp-kb').textContent = '酒精灯';
      L.$('#lamp-a').textContent = phase === 'done' ? '处在外焰的部分' : '—';
      L.$('#lamp-b').textContent = lit ? '燃着' : '已盖灭';
      L.$('#lamp-badge').textContent = warn ? '危险操作' : '外焰温度最高';
      if (warn) t = '<b>不能用嘴吹灭酒精灯！</b>吹气可能把火焰压进灯壶，引燃灯壶里的酒精蒸气，引起火灾甚至爆炸。要用<b>灯帽盖灭</b>。';
      else if (!lit) t = '用灯帽盖灭：盖上后火焰与空气隔绝，就熄灭了。要重新点燃，用火柴点，<b>不能拿燃着的酒精灯去点另一只</b>，以免酒精洒出引起失火。';
      else if (phase === 'idle') t = '火焰分三层：外焰、内焰、焰心。猜一猜哪一层温度最高，再把火柴梗平放进去约 1 秒，取出来看哪一段最黑。';
      else if (phase === 'burning') t = '火柴梗正在火焰里……';
      else t = '取出后看到：火柴梗处在<b>外焰</b>的部分最先变黑，内焰处次之，焰心处几乎没变。说明<b>外焰温度最高、焰心温度最低</b>，所以加热时要用外焰。外焰和空气接触最充分，燃烧最充分。' + (cs.core ? '' : ' 这次火柴梗没穿过焰心，把它放低一点再试，三层的对比更明显。');
    } else {
      var ok = liq <= 100 / 3;
      L.$('#lamp-ka').textContent = '液体体积';
      L.$('#lamp-kb').textContent = '要求';
      L.$('#lamp-a').textContent = '约占 ' + liq + ' %';
      L.$('#lamp-b').textContent = '不超过 1/3';
      L.$('#lamp-badge').textContent = ok ? '液体量合适' : '液体太多';
      if (!lit) t = '酒精灯已经盖灭了。回到“火焰与火柴梗”里，用火柴把它点燃。';
      else if (ok) t = '液体约占试管容积的 ' + liq + ' %，<b>没有超过 1/3</b>。加热时先让试管均匀受热（预热），再用外焰对准液体部位加热；试管外壁要擦干，管口不能对着自己和别人。';
      else t = '液体约占试管容积的 ' + liq + ' %，<b>超过了 1/3</b>。液体太多，沸腾时容易冲出试管伤人。倒出一些，让液体不超过试管容积的 1/3 再加热。';
    }
    L.$('#lamp-text').innerHTML = t;
    save();
  }
  var bLoop = null;
  function burn() {
    if (lmode !== 'flame') return;
    if (!lit) { L.$('#lamp-text').innerHTML = '酒精灯已经盖灭，先点燃它。'; return; }
    if (phase === 'done') { phase = 'idle'; chars = []; drawLamp(); return; }
    if (phase === 'burning') return;
    phase = 'burning'; warn = false; burnT = 0; chars = [];
    var y = stickY();
    function addHeat(dt) { for (var x = SX0; x <= SX1; x++) chars[x - SX0] = (chars[x - SX0] || 0) + HEAT[layerAt(x, y, 150, 1)] * dt; }
    if (L.REDUCED) { addHeat(1); phase = 'done'; drawLamp(); return; }
    bLoop = L.loop(function (dt) {
      var d = Math.min(dt, 1 - burnT);
      addHeat(d); burnT += d;
      if (burnT >= 1) { phase = 'done'; drawLamp(); bLoop = null; return false; }
      drawLamp();
    });
  }
  L.$('#stick-btn').addEventListener('click', burn);
  L.$('#cap-btn').addEventListener('click', function () { lit = !lit; warn = false; if (bLoop) { bLoop.stop(); bLoop = null; } phase = 'idle'; chars = []; drawLamp(); });
  L.$('#blow-btn').addEventListener('click', function () {
    if (!lit) { L.$('#lamp-text').innerHTML = '酒精灯已经盖灭了。记住：熄灭时也只能用灯帽盖灭。'; return; }
    warn = true; drawLamp();
  });
  L.bindRange(stickIn, function (v) { sh = v; if (bLoop) { bLoop.stop(); bLoop = null; } phase = 'idle'; chars = []; drawLamp(); });
  L.bindRange(liqIn, function (v) { liq = v; drawLamp(); });
  L.chips(L.$('#lamp-mode'), [{ label: '火焰与火柴梗', value: 'flame' }, { label: '给液体加热', value: 'heat' }], lmode, function (v) {
    lmode = v; warn = false; if (bLoop) { bLoop.stop(); bLoop = null; } if (phase === 'burning') phase = 'idle'; drawLamp();
  });

  function save() { L.setState({ cs: caseId, v: V0, e: eye, lm: lmode, h: sh, q: liq }); }

  renderCaseChips();
  drawChange();
  renderProps();
  drawCyl();
  drawLamp();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '把 11 个现象全部判断对',
      desc: '在“物理变化还是化学变化”里逐个选现象、作判断。判断错的可以重新判断。',
      label: '在变化卡片里操作',
      button: '检查我的判断',
      check: function () {
        var sc = score(), wrong = CASES.filter(function (c) { return judged[c.id] && judged[c.id] !== c.t; });
        if (sc.n < CASES.length) return { ok: false, msg: '还有 ' + (CASES.length - sc.n) + ' 个现象没判断。' + (wrong.length ? '已判断的里面有判断错的：' + wrong.map(function (c) { return c.n; }).join('、') + '。' : '') };
        if (wrong.length) return { ok: false, msg: '判断错了：' + wrong.map(function (c) { return c.n; }).join('、') + '。只问一句：变化后有没有<b>新物质</b>？' };
        return { ok: true, msg: '11 个全对。蜡烛燃烧、铁生锈、食物腐败、汽油燃烧、粮食酿酒生成了新物质，是化学变化；其余都只是状态或形状变了。' };
      }
    },
    {
      level: 'base',
      title: '下列变化中，属于化学变化的是',
      desc: '先想：变化后有没有生成新物质？',
      options: ['燃放烟花', '玻璃破碎', '湿衣服晾干', '灯泡通电发光'],
      answer: 0,
      hint: '玻璃碎了还是玻璃，衣服里的水只是蒸发了，钨丝发光后还是钨丝。',
      explain: '烟花里的火药燃烧，生成了新物质，是<b>化学变化</b>。玻璃破碎只是形状变了；湿衣服晾干是水的状态变了；灯泡发光是电能转化为光能和内能，钨丝没变，这三个都是物理变化。'
    },
    {
      level: 'base',
      title: '熄灭酒精灯，正确的做法是',
      desc: '可以在酒精灯模型里分别试一试“盖上灯帽”和“用嘴吹灭”。',
      options: ['用灯帽盖灭', '用嘴吹灭', '用水浇灭', '用扇子扇灭'],
      answer: 0,
      hint: '吹、扇都会让空气猛地冲向灯芯和灯壶。',
      explain: '要用<b>灯帽盖灭</b>，火焰与空气隔绝就熄灭了。用嘴吹或用扇子扇，可能把火焰压进灯壶引燃酒精蒸气；用水浇会让酒精和水四处流淌，都很危险。'
    },
    {
      level: 'mid',
      title: '让读数比实际体积大 1 mL 以上',
      desc: '在量筒里移动眼睛，造出一个“偏大 1 mL 以上”的错误读数，记住这是哪种看法。',
      label: '在量筒里操作',
      button: '检查读数',
      check: function () {
        var d = reading() - V0;
        if (d >= 1) return { ok: true, msg: '读到 ' + reading().toFixed(1) + ' mL，比实际大 ' + d.toFixed(1) + ' mL。这是<b>俯视</b>：眼睛高于液面，读数偏大。' };
        if (d < 0) return { ok: false, msg: '现在读数偏<b>小</b>，眼睛比液面低（仰视）。把眼睛往上移。' };
        if (d < 0.05) return { ok: false, msg: '现在是平视，读数准确。要让读数偏大，眼睛该往上还是往下移？' };
        return { ok: false, msg: '现在只偏大 ' + d.toFixed(1) + ' mL，眼睛再抬高一些。' };
      }
    },
    {
      level: 'mid',
      title: '下列描述中，属于化学性质的是',
      desc: '先分清是在说“本领”（性质），还是在说“过程”（变化）。',
      options: ['铁在潮湿的空气中容易生锈', '铁生锈了', '铁能被磁铁吸引', '铁是银白色的固体'],
      answer: 0,
      hint: '性质里还要再分：这种本领要不要通过化学变化才能表现出来？',
      explain: '“容易生锈”说的是本领，而且要通过生锈（化学变化）才表现出来，是<b>化学性质</b>。“铁生锈了”是在说过程，是化学变化；能被磁铁吸引、银白色固体，不用发生化学变化就能看出来，是物理性质。'
    },
    {
      level: 'mid',
      title: '用火柴梗找出温度最高的一层火焰',
      desc: '把火柴梗放在能同时穿过外焰、内焰、焰心的高度，平放进火焰约 1 秒再取出。',
      label: '在酒精灯里操作',
      button: '检查实验',
      check: function () {
        var cs = crossed();
        if (lmode !== 'flame') return { ok: false, msg: '先把实验切换到“火焰与火柴梗”。' };
        if (!lit) return { ok: false, msg: '酒精灯盖灭了，先用火柴点燃。' };
        if (!(cs.outer && cs.inner && cs.core)) return { ok: false, msg: '现在火柴梗只穿过' + ['outer', 'inner', 'core'].filter(function (k) { return cs[k]; }).map(function (k) { return { outer: '外焰', inner: '内焰', core: '焰心' }[k]; }).join('、') + '。焰心很矮，把火柴梗放<b>低</b>一些，贴近灯芯上方。' };
        if (phase !== 'done') return { ok: false, msg: '高度合适了。点“把火柴梗平放进火焰约 1 秒”，等它取出来。' };
        return { ok: true, msg: '两端（外焰处）最黑，中间（焰心处）几乎没变：<b>外焰温度最高</b>，所以加热要用外焰。' };
      }
    },
    {
      level: 'trap',
      title: '有发光、放热现象的变化，一定是化学变化吗？',
      desc: '在变化卡片里对比“蜡烛燃烧”和“灯泡通电发光”。',
      options: ['不一定，如灯泡通电发光放热是物理变化', '一定是，发光放热就说明有新物质', '一定是，只要放热就是化学变化', '一定不是，化学变化不会发光'],
      answer: 0,
      hint: '判断的依据是现象，还是有没有新物质？',
      explain: '发光、放热只是常见的伴随现象，不是判断依据。灯泡通电发光放热，钨丝没变，是<b>物理变化</b>；判断化学变化只看<b>有没有生成新物质</b>。'
    },
    {
      level: 'trap',
      title: '用量筒量取 30 mL 水，读数时仰视，实际量取的水',
      desc: '注意：这里是“量取”——按读数往量筒里倒水，倒到刻度为止。',
      options: ['大于 30 mL', '小于 30 mL', '等于 30 mL', '无法确定'],
      answer: 0,
      hint: '仰视时读数偏小。读到 30 mL 时，真实的液面在 30 mL 的上面还是下面？',
      explain: '仰视读数<b>偏小</b>：当你读到 30 mL 时，实际液面已经在 30 mL 以上了，所以实际量取的水<b>大于 30 mL</b>。反过来，俯视量取，实际量取的会小于读数。'
    }
  ]);
})();
