/* 化学互动馆 · 第 11 课 化学与社会 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg, C = L.chem;
  var st = L.getState();

  /* 重画 SVG 后把键盘焦点还给原来的元素（靠 data-k 认人） */
  function keepFocus(el, fn) {
    var a = document.activeElement, k = a && el.contains(a) ? a.getAttribute('data-k') : null;
    fn();
    if (k) { var n = el.querySelector('[data-k="' + k + '"]'); if (n && n.focus) n.focus(); }
  }
  function onActivate(el, fn) {
    el.addEventListener('click', fn);
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } });
  }
  function parseList(s, n) {
    if (s === undefined) return null;
    var out = [];
    String(s).split('.').forEach(function (p) { var k = parseInt(p, 10); if (k >= 0 && k < n && out.indexOf(k) < 0) out.push(k); });
    return out;
  }

  /* ========== ① 营养餐盘 ========== */
  var NUT = [
    { v: 'sugar', n: '糖类', energy: true, tip: '米饭' },
    { v: 'fat', n: '油脂', energy: true, tip: '花生油' },
    { v: 'protein', n: '蛋白质', energy: true, tip: '瘦肉、鸡蛋或牛奶' },
    { v: 'vit', n: '维生素', tip: '青菜或水果' },
    { v: 'min', n: '无机盐', tip: '海带汤或牛奶' },
    { v: 'water', n: '水', tip: '海带汤、牛奶或水果' }
  ];
  var FOODS = [
    { v: 'rice', n: '米饭', main: ['sugar'], also: [], text: '米饭的主要成分是淀粉，属于<b>糖类</b>。糖类是人体最主要的供能物质，人体所需能量的 60%～70% 来自糖类。' },
    { v: 'oil', n: '花生油', main: ['fat'], also: [], text: '花生油属于<b>油脂</b>。油脂是重要的供能物质，吃多了用不完，会以脂肪的形式储存起来，当“备用能源”。' },
    { v: 'meat', n: '瘦肉', main: ['protein'], also: ['min'], text: '瘦肉富含<b>蛋白质</b>，还含有铁等无机盐。蛋白质是构成细胞的基本物质，长身体、修补组织都离不开它。' },
    { v: 'egg', n: '鸡蛋', main: ['protein'], also: [], text: '鸡蛋富含<b>蛋白质</b>。蛋白质在体内先被分解成氨基酸，再被用来“搭建”身体需要的新蛋白质。' },
    { v: 'milk', n: '牛奶', main: ['protein'], also: ['min', 'water'], text: '牛奶富含<b>蛋白质</b>，还含有钙等无机盐和大量的水，是青少年补钙的好选择。' },
    { v: 'veg', n: '青菜', main: ['vit'], also: ['min'], text: '蔬菜富含<b>维生素</b>，也含有无机盐。维生素不提供能量，需要量也很少，但缺了就会生病。' },
    { v: 'fruit', n: '水果', main: ['vit'], also: ['sugar', 'water'], text: '水果富含<b>维生素</b>（比如维生素 C），还含有糖和水。缺维生素 C 会引起坏血病。' },
    { v: 'soup', n: '海带汤', main: ['min', 'water'], also: [], text: '海带含碘等<b>无机盐</b>，汤里还有大量的<b>水</b>。水是人体内含量最多的物质，营养物质和废物都要靠它运输。' }
  ];
  var picked = parseList(st.f === '-' ? '' : st.f, FOODS.length) || [0, 2];
  var lastFood = -1, lastAdd = true;

  function covered() {
    var m = {};
    NUT.forEach(function (n) { m[n.v] = []; });
    picked.slice().sort(function (a, b) { return a - b; }).forEach(function (k) {
      FOODS[k].main.concat(FOODS[k].also).forEach(function (v) { if (m[v].indexOf(k) < 0) m[v].push(k); });
    });
    return m;
  }
  function missing() { var m = covered(); return NUT.filter(function (n) { return !m[n.v].length; }); }

  function foodIcon(g, v) {
    switch (v) {
      case 'rice':
        S('path', { d: 'M-18 -1q9 -16 18 -11q9 -5 18 11z', fill: '#fffdf6', stroke: '#d8d2c0' }, g);
        S('path', { d: 'M-20 -1h40a20 15 0 0 1 -40 0z', fill: '#e2eaf0', stroke: '#93a6b3' }, g);
        break;
      case 'oil':
        S('rect', { x: -5, y: -22, width: 10, height: 6, rx: 1.5, fill: '#d0703a' }, g);
        S('rect', { x: -4, y: -17, width: 8, height: 6, fill: '#e6dfc9' }, g);
        S('rect', { x: -10, y: -12, width: 20, height: 30, rx: 5, fill: '#f3cf55', stroke: '#c9a33a' }, g);
        S('rect', { x: -7, y: -2, width: 14, height: 9, rx: 2, fill: '#fff8de' }, g);
        break;
      case 'meat':
        S('path', { d: 'M-19 4q-3 -15 12 -17q16 -3 23 9q4 12 -12 14q-18 3 -23 -6z', fill: '#c4544a', stroke: '#9c3d35' }, g);
        S('path', { d: 'M-10 -4q8 -4 16 2', fill: 'none', stroke: '#f4d9d2', 'stroke-width': 2, 'stroke-linecap': 'round' }, g);
        break;
      case 'egg':
        S('ellipse', { cx: 0, cy: 0, rx: 12, ry: 16, fill: '#fbf1df', stroke: '#d1bd98' }, g);
        break;
      case 'milk':
        S('path', { d: 'M-11 -18h22l-3 34h-16z', fill: '#ffffff', stroke: '#9fb0ba' }, g);
        S('path', { d: 'M-10.3 -9h20.6l-2.3 24h-16z', fill: '#f4f1e8' }, g);
        break;
      case 'veg':
        S('path', { d: 'M0 16C-16 6 -18 -10 -8 -18C-2 -10 0 4 0 16z', fill: '#5aa25a', stroke: '#3f7f40' }, g);
        S('path', { d: 'M0 16C16 6 18 -10 8 -18C2 -10 0 4 0 16z', fill: '#7cbf63', stroke: '#4f8f45' }, g);
        S('path', { d: 'M0 16V-6', stroke: '#e7f3d8', 'stroke-width': 1.6 }, g);
        break;
      case 'fruit':
        S('circle', { cx: 0, cy: 2, r: 14, fill: '#e0574a', stroke: '#b23e33' }, g);
        S('path', { d: 'M0 -12v-6', stroke: '#7a5a3a', 'stroke-width': 2 }, g);
        S('ellipse', { cx: 6, cy: -16, rx: 6, ry: 3, fill: '#6fae4f', transform: 'rotate(-20 6 -16)' }, g);
        break;
      case 'soup':
        S('path', { d: 'M-20 -3h40a20 15 0 0 1 -40 0z', fill: '#e6eef2', stroke: '#93a6b3' }, g);
        S('ellipse', { cx: 0, cy: -3, rx: 19, ry: 4, fill: '#d9e6c8' }, g);
        S('path', { d: 'M-12 -4q3 -3 6 0t6 0M2 -3q3 -3 6 0t6 0', fill: 'none', stroke: '#3e7a4a', 'stroke-width': 1.8, 'stroke-linecap': 'round' }, g);
        break;
    }
  }

  var plate = L.$('#plate');
  function drawPlate() {
    keepFocus(plate, function () {
      plate.innerHTML = '';
      var defs = S('defs', {}, plate);
      S('rect', { x: 0, y: 0, width: 400, height: 240, rx: 14 }, S('clipPath', { id: 'plate-clip' }, defs));
      S('rect', { x: 0, y: 0, width: 400, height: 240, rx: 14, fill: '#fbfaf6' }, plate);
      var root = S('g', { 'clip-path': 'url(#plate-clip)' }, plate);
      var m = covered();
      S('rect', { x: 10, y: 12, width: 240, height: 216, rx: 16, fill: '#f3efe6', stroke: '#ddd2bf' }, root);
      FOODS.forEach(function (f, k) {
        var cx = 46 + (k % 4) * 56, cy = k < 4 ? 62 : 158, on = picked.indexOf(k) >= 0;
        var g = S('g', { class: 'svg-hit', tabindex: 0, role: 'button', 'data-k': 'f' + k, 'aria-pressed': String(on), 'aria-label': f.n + (on ? '（已放进餐盘）' : '') }, root);
        S('circle', { cx: cx, cy: cy, r: 25, fill: on ? '#ffffff' : '#faf7f0', stroke: on ? '#2c736f' : '#d8ccb6', 'stroke-width': on ? 1.8 : 1, 'stroke-dasharray': on ? null : '3 3' }, g);
        foodIcon(S('g', { transform: 'translate(' + cx + ' ' + cy + ') scale(0.9)', opacity: on ? 1 : 0.28 }, g), f.v);
        S('text', { x: cx, y: cy + 42, 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': on ? 700 : 400, fill: on ? '#1f302e' : '#8a948f', text: f.n }, g);
        onActivate(g, function () { toggleFood(k); });
      });
      S('line', { x1: 258, y1: 20, x2: 258, y2: 222, stroke: '#e3e9e9' }, root);
      S('text', { x: 327, y: 24, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: '#1f302e', text: '六大营养素' }, root);
      NUT.forEach(function (n, j) {
        var y = 48 + j * 31, list = m[n.v], on = list.length > 0;
        S('circle', { cx: 274, cy: y, r: 8, fill: on ? '#2c736f' : '#ffffff', stroke: on ? '#2c736f' : '#c3cfce', 'stroke-width': 1.2 }, root);
        if (on) S('path', { d: 'M270 ' + y + 'l3 3l5 -6', fill: 'none', stroke: '#fff', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, root);
        S('text', { x: 288, y: y + 4, 'font-size': 11.5, 'font-weight': on ? 700 : 400, fill: on ? '#1f302e' : '#8a948f', text: n.n }, root);
        if (n.energy) S('text', { x: 392, y: y + 4, 'text-anchor': 'end', 'font-size': 9, fill: '#c2603f', text: '供能' }, root);
        var names = list.map(function (k) { return FOODS[k].n; });
        var src = on ? '来自' + (names.length > 3 ? names.slice(0, 3).join('、') + '等' : names.join('、')) : '还没有';
        S('text', { x: 288, y: y + 16, 'font-size': 9, fill: on ? '#546160' : '#b0b8b6', text: src }, root);
      });
    });
  }

  function updateMeal() {
    var miss = missing(), n = 6 - miss.length, t;
    L.$('#meal-n').innerHTML = n + '<small>/ 6</small>';
    L.$('#meal-count').innerHTML = picked.length + '<small>样</small>';
    L.$('#meal-miss').textContent = miss.length ? miss.map(function (x) { return x.n; }).join('、') : '都齐了';
    L.$('#meal-badge').textContent = !picked.length ? '空餐盘' : miss.length ? '还缺 ' + miss.length + ' 种' : '营养素齐全';
    if (lastFood >= 0) t = lastAdd ? FOODS[lastFood].text : '拿走了' + FOODS[lastFood].n + '。';
    else t = '点食物放进餐盘，看看哪些营养素亮起来。';
    if (!miss.length) t += ' 六大营养素都有了。不过“有”不等于“够”，每样都要适量，油脂和糖吃太多容易发胖。';
    else if (picked.length) t += ' 想补' + miss[0].n + '，可以加' + miss[0].tip + '。';
    L.$('#meal-text').innerHTML = t;
    save();
  }
  var foodBtns = FOODS.map(function (f, k) {
    var b = L.html('button', { type: 'button', text: f.n, 'aria-pressed': 'false' }, L.$('#food-chips'));
    b.addEventListener('click', function () { toggleFood(k); });
    return b;
  });
  function syncFoodBtns() { foodBtns.forEach(function (b, k) { b.setAttribute('aria-pressed', String(picked.indexOf(k) >= 0)); }); }
  function toggleFood(k) {
    var i = picked.indexOf(k);
    if (i >= 0) { picked.splice(i, 1); lastAdd = false; } else { picked.push(k); lastAdd = true; }
    lastFood = k;
    renderMeal();
  }
  function renderMeal() { syncFoodBtns(); drawPlate(); updateMeal(); }
  L.$('#meal-clear').addEventListener('click', function () { picked = []; lastFood = -1; renderMeal(); });

  /* 元素与健康、食品安全：配对题 */
  var ELEM_NAME = { Ca: '钙', Fe: '铁', I: '碘', Zn: '锌' };
  L.match('#elem-list', '#elem-score', [
    ['幼儿和青少年缺它易患佝偻病，老年人缺它易骨质疏松', 'Ca', '钙是人体内含量最多的金属元素，主要存在于骨骼和牙齿中。奶类、豆类、虾皮含钙较多。'],
    ['缺它会引起贫血', 'Fe', '铁是血红蛋白的成分，帮助运输氧气。动物肝脏、瘦肉、蛋、豆类含铁较多。'],
    ['缺它（或摄入过多）都会引起甲状腺肿大', 'I', '碘是甲状腺激素的重要成分。海带、紫菜、加碘盐里都有碘。'],
    ['缺它会食欲不振、生长迟缓、发育不良', 'Zn', '锌影响人体发育。海产品、瘦肉、肝脏、奶类含锌较多。']
  ], [['Ca', '钙'], ['Fe', '铁'], ['I', '碘'], ['Zn', '锌']], function (it, ok) {
    return (ok ? '' : '应该是' + ELEM_NAME[it[1]] + '。') + it[2];
  });
  L.match('#safe-list', '#safe-score', [
    ['用甲醛溶液浸泡海产品来保鲜', 'no', '甲醛会与蛋白质反应，破坏蛋白质的结构，对人体有害。'],
    ['霉变的大米淘洗干净、煮熟了再吃', 'no', '霉变食物含有黄曲霉毒素，一般的蒸煮加热破坏不了它，绝不能吃。'],
    ['把工业用盐亚硝酸钠当食盐做菜', 'no', C('亚硝酸钠 NaNO2 外观和味道都像食盐，但有毒，误食会中毒。')],
    ['用小苏打做发酵粉蒸馒头', 'yes', C('小苏打 NaHCO3 受热或遇到酸都会放出 CO2，让馒头松软多孔。')]
  ], [['yes', '安全'], ['no', '不安全']], function (it, ok) {
    return (ok ? '' : '应该是“' + (it[1] === 'yes' ? '安全' : '不安全') + '”。') + it[2];
  });

  /* ========== ② 材料分类 ========== */
  var BINS = [
    { v: 'org', l1: '有机合成', l2: '材料', col: '#c2603f' },
    { v: 'metal', l1: '金属', l2: '材料', col: '#5b6f8a' },
    { v: 'inorg', l1: '无机非金属', l2: '材料', col: '#8a7350' },
    { v: 'comp', l1: '复合', l2: '材料', col: '#2c736f' },
    { v: 'nat', l1: '天然', l2: '材料', col: '#5f8a3c' }
  ];
  var MATS = [
    { n: '塑料', c: 'org', why: '塑料是三大有机合成材料之一。', hint: '塑料是人工合成的高分子，不是天然长出来的。' },
    { n: '铝合金', c: 'metal', why: '合金是在金属中熔合了其他金属或非金属，仍然是金属材料。', hint: '合金本质上还是金属，不要因为“合”字把它当成复合材料。' },
    { n: '陶瓷', c: 'inorg', why: '陶瓷用黏土等矿物烧制而成，属于无机非金属材料。', hint: '陶瓷是用黏土高温烧出来的，不含金属单质。' },
    { n: '玻璃钢', c: 'comp', why: '玻璃钢是玻璃纤维和合成树脂复合而成的，既不是玻璃也不是钢。', hint: '玻璃钢由玻璃纤维和塑料两类材料组合而成。' },
    { n: '棉花', c: 'nat', why: '棉花是植物长出的纤维，属于天然有机高分子材料。', hint: '棉花是地里长出来的，不是工厂合成的。' },
    { n: '涤纶', c: 'org', why: '涤纶是合成纤维，属于有机合成材料。', hint: '涤纶是工厂合成的纤维，和棉、毛不一样。' },
    { n: '不锈钢', c: 'metal', why: '不锈钢是铁的合金（含铬、镍等），属于金属材料。', hint: '钢是铁的合金，合金属于哪一类？' },
    { n: '玻璃', c: 'inorg', why: '普通玻璃用石英砂、纯碱、石灰石等烧制，属于无机非金属材料。', hint: '玻璃由石英砂等矿物原料高温制成。' },
    { n: '碳纤维复合材料', s: '碳纤维复合', c: 'comp', why: '碳纤维嵌在树脂里，又轻又结实，常用在球拍、自行车、飞机上。', hint: '名字里就告诉你了：它是两类材料的组合。' },
    { n: '羊毛', c: 'nat', why: '羊毛的主要成分是蛋白质，是天然纤维，灼烧时有烧焦羽毛的气味。', hint: '羊毛是从羊身上剪下来的，不是合成的。' },
    { n: '合成橡胶', c: 'org', why: '合成橡胶是三大合成材料之一；从橡胶树上采来的天然橡胶才算天然材料。', hint: '看名字里的“合成”两个字。' },
    { n: '有机玻璃', c: 'org', why: '有机玻璃名字里有“玻璃”，其实是一种透明的塑料，属于有机合成材料。', hint: '有机玻璃不是玻璃，它是一种透明的塑料。' }
  ];
  var placed = MATS.map(function () { return false; });
  (parseList(st.mp === '-' ? '' : st.mp, MATS.length) || []).forEach(function (k) { placed[k] = true; });
  var matErr = Math.round(L.num(st.me, 0, 0, 999));
  var sel = -1, flash = null, flashTimer = null, drag = null, matMsg = '';
  var mat = L.$('#mat');
  function nPlaced() { return placed.filter(Boolean).length; }
  function binX(j) { return 12 + j * 77; }

  function drawMat() {
    keepFocus(mat, function () {
      mat.innerHTML = '';
      var defs = S('defs', {}, mat);
      S('rect', { x: 0, y: 0, width: 400, height: 260, rx: 14 }, S('clipPath', { id: 'mat-clip' }, defs));
      S('rect', { x: 0, y: 0, width: 400, height: 260, rx: 14, fill: '#fbfcfa' }, mat);
      var root = S('g', { 'clip-path': 'url(#mat-clip)' }, mat);
      MATS.forEach(function (m, k) {
        var x = 12 + (k % 4) * 96, y = 12 + Math.floor(k / 4) * 32;
        if (placed[k] || (drag && drag.moving && drag.k === k)) {
          S('rect', { x: x, y: y, width: 88, height: 26, rx: 13, fill: 'none', stroke: '#dfe6e5', 'stroke-dasharray': '3 3' }, root);
          return;
        }
        var on = sel === k;
        var g = S('g', { class: 'svg-hit', tabindex: 0, role: 'button', 'data-k': 'm' + k, 'aria-pressed': String(on), 'aria-label': m.n, style: 'touch-action:none' }, root);
        S('rect', { x: x, y: y, width: 88, height: 26, rx: 13, fill: on ? '#2c736f' : '#ffffff', stroke: on ? '#2c736f' : '#b9c7c6', 'stroke-width': 1.2 }, g);
        S('text', { x: x + 44, y: y + 17, 'text-anchor': 'middle', 'font-size': 11, fill: on ? '#ffffff' : '#1f302e', text: m.n }, g);
        g.addEventListener('pointerdown', function (e) { startDrag(k, e); });
        g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(k); } });
      });
      S('text', { x: 200, y: 118, 'text-anchor': 'middle', 'font-size': 10, fill: sel >= 0 ? '#2c736f' : '#7c8a89', 'font-weight': sel >= 0 ? 700 : 400, text: sel >= 0 ? '已选中“' + MATS[sel].n + '”，点它该去的箱子' : nPlaced() === MATS.length ? '全部分好了' : '先点一种材料，再点箱子；也可以直接拖进去' }, root);
      BINS.forEach(function (b, j) {
        var x = binX(j), y = 128, fl = flash && flash.bin === j;
        var g = S('g', { class: 'svg-hit', tabindex: 0, role: 'button', 'data-k': 'b' + j, 'aria-label': '放进' + b.l1 + b.l2 }, root);
        S('rect', { x: x, y: y, width: 70, height: 126, rx: 10, fill: fl ? (flash.ok ? '#e6f1e8' : '#fbe4dc') : '#f6f8f7', stroke: fl && !flash.ok ? '#c0392b' : b.col, 'stroke-width': fl ? 2.4 : 1.4 }, g);
        S('path', { d: 'M' + x + ' ' + (y + 30) + 'V' + (y + 10) + 'Q' + x + ' ' + y + ' ' + (x + 10) + ' ' + y + 'H' + (x + 60) + 'Q' + (x + 70) + ' ' + y + ' ' + (x + 70) + ' ' + (y + 10) + 'V' + (y + 30) + 'Z', fill: b.col }, g);
        S('text', { x: x + 35, y: y + 13, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 700, fill: '#ffffff', text: b.l1 }, g);
        S('text', { x: x + 35, y: y + 25, 'text-anchor': 'middle', 'font-size': 9.5, fill: '#ffffff', text: b.l2 }, g);
        var row = 0;
        MATS.forEach(function (m, k) {
          if (!placed[k] || m.c !== b.v) return;
          var ty = y + 38 + row * 19;
          S('rect', { x: x + 4, y: ty, width: 62, height: 16, rx: 5, fill: '#ffffff', stroke: b.col }, g);
          S('text', { x: x + 35, y: ty + 11.5, 'text-anchor': 'middle', 'font-size': 9.5, fill: '#1f302e', text: m.s || m.n }, g);
          row++;
        });
        if (fl && !flash.ok) S('text', { x: x + 35, y: y + 112, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700, fill: '#c0392b', text: '✗' }, g);
        onActivate(g, function () {
          if (sel >= 0) place(sel, j);
          else { matMsg = '先点上面的一种材料，再点箱子。'; updateMat(); }
        });
      });
      if (drag && drag.moving) {
        var gx = drag.x - 44, gy = drag.y - 13;
        S('rect', { x: gx, y: gy, width: 88, height: 26, rx: 13, fill: '#2c736f', opacity: 0.9 }, root);
        S('text', { x: gx + 44, y: gy + 17, 'text-anchor': 'middle', 'font-size': 11, fill: '#ffffff', text: MATS[drag.k].n }, root);
      }
    });
  }
  function binAt(x, y) {
    if (y < 120 || y > 256) return -1;
    for (var j = 0; j < BINS.length; j++) if (x >= binX(j) - 3 && x <= binX(j) + 73) return j;
    return -1;
  }
  function startDrag(k, e) {
    var p = L.svgPoint(mat, e);
    drag = { k: k, sx: p.x, sy: p.y, x: p.x, y: p.y, moving: false };
    try { mat.setPointerCapture(e.pointerId); } catch (err) {}
  }
  mat.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var p = L.svgPoint(mat, e);
    drag.x = p.x; drag.y = p.y;
    if (!drag.moving && Math.hypot(p.x - drag.sx, p.y - drag.sy) > 6) drag.moving = true;
    if (drag.moving) { e.preventDefault(); drawMat(); }
  });
  mat.addEventListener('pointerup', function () {
    if (!drag) return;
    var d = drag; drag = null;
    if (!d.moving) { select(d.k); return; }
    var j = binAt(d.x, d.y);
    if (j >= 0) place(d.k, j); else drawMat();
  });
  mat.addEventListener('pointercancel', function () { if (drag) { drag = null; drawMat(); } });

  function select(k) {
    sel = sel === k ? -1 : k;
    matMsg = sel >= 0 ? '选中了<b>' + MATS[k].n + '</b>，现在点它该去的箱子。' : '';
    drawMat(); updateMat();
  }
  function place(k, j) {
    var m = MATS[k], b = BINS[j];
    if (m.c === b.v) {
      placed[k] = true; sel = -1; flash = { bin: j, ok: true };
      matMsg = '<b>' + m.n + '</b> → ' + b.l1 + b.l2 + '。' + m.why;
      if (nPlaced() === MATS.length) matMsg += ' 12 种材料全部分好了！';
    } else {
      matErr++; sel = k; flash = { bin: j, ok: false };
      matMsg = '<b>' + m.n + '</b>不属于' + b.l1 + b.l2 + '，它弹回来了。' + m.hint;
    }
    clearTimeout(flashTimer);
    flashTimer = setTimeout(function () { flash = null; drawMat(); }, 750);
    drawMat(); updateMat();
  }
  function updateMat() {
    var n = nPlaced();
    L.$('#mat-ok').innerHTML = n + '<small>/ 12</small>';
    L.$('#mat-err').innerHTML = matErr + '<small>次</small>';
    L.$('#mat-badge').textContent = n === MATS.length ? '全部分好' : n === 0 ? '开始分类' : '还剩 ' + (MATS.length - n) + ' 种';
    L.$('#mat-text').innerHTML = matMsg || '五个箱子：有机合成材料、金属材料、无机非金属材料、复合材料，以及棉花、羊毛这类天然材料（天然有机高分子材料）。';
    save();
  }
  L.$('#mat-reset').addEventListener('click', function () {
    placed = MATS.map(function () { return false; }); matErr = 0; sel = -1; matMsg = '';
    drawMat(); updateMat();
  });

  /* 灼烧法鉴别纤维 */
  var BURN = {
    cotton: { n: '棉花', fiber: '#f7f3e8', near: '很快燃烧', smell: '烧纸的气味', ash: '灰白色，细软，一捏就碎', text: '棉花的主要成分是纤维素，燃烧时有<b>烧纸的气味</b>，灰烬少，灰白色、细软。' },
    wool: { n: '羊毛', fiber: '#efe2c4', near: '先卷缩再燃烧', smell: '烧焦羽毛的气味', ash: '黑褐色小球，一捏就碎', text: '羊毛的主要成分是<b>蛋白质</b>，燃烧时有<b>烧焦羽毛的气味</b>（头发烧焦也是这个味儿），灰烬是黑褐色小球，一捏就碎。' },
    poly: { n: '涤纶', fiber: '#dde9f3', near: '先熔化成小球', smell: '特殊气味', ash: '黑色硬球，捏不碎', text: '涤纶是合成纤维，靠近火焰时先<b>熔化、缩成小球</b>再燃烧，有特殊气味，留下<b>黑色硬球，捏不碎</b>。' }
  };
  var burnK = BURN[st.k] ? st.k : 'wool';
  var burn = L.$('#burn');
  function drawBurn() {
    var b = BURN[burnK];
    burn.innerHTML = '';
    var defs = S('defs', {}, burn);
    S('rect', { x: 0, y: 0, width: 400, height: 110, rx: 12 }, S('clipPath', { id: 'burn-clip' }, defs));
    S('rect', { x: 0, y: 0, width: 400, height: 110, rx: 12, fill: '#ffffff', 'fill-opacity': 0.75 }, burn);
    var root = S('g', { 'clip-path': 'url(#burn-clip)' }, burn);
    // 酒精灯与火焰
    S('path', { d: 'M44 108Q42 82 66 80Q90 82 88 108Z', fill: '#dfeaf0', stroke: '#8fa6a4' }, root);
    S('rect', { x: 60, y: 70, width: 12, height: 10, fill: '#b9c7c6' }, root);
    S('path', { d: 'M66 28C77 42 78 56 66 66C54 56 55 42 66 28Z', fill: '#f2a43a' }, root);
    S('path', { d: 'M66 42C71 50 71 58 66 63C61 58 61 50 66 42Z', fill: '#ffe08a' }, root);
    // 镊子与样品
    S('path', { d: 'M150 14L86 34M150 20L86 38', stroke: '#8a8f98', 'stroke-width': 2.2, 'stroke-linecap': 'round' }, root);
    if (burnK === 'poly') S('circle', { cx: 80, cy: 37, r: 5, fill: '#2b2f33' }, root);
    else {
      S('path', { d: 'M88 36q-6 -6 -12 -2q-6 4 -2 8q6 4 12 -2', fill: b.fiber, stroke: '#b9ae98' }, root);
      S('circle', { cx: 74, cy: 39, r: 3, fill: burnK === 'wool' ? '#4a3426' : '#9a9a92' }, root);
    }
    // 气味
    [[94, 24], [102, 18], [110, 24]].forEach(function (p) { S('path', { d: 'M' + p[0] + ' ' + p[1] + 'q3 -4 0 -8q-3 -4 0 -8', fill: 'none', stroke: '#b0b8b6', 'stroke-width': 1.3 }, root); });
    S('text', { x: 118, y: 58, 'font-size': 10.5, fill: '#1f302e', text: '靠近火焰：' + b.near }, root);
    S('text', { x: 118, y: 76, 'font-size': 10.5, 'font-weight': 700, fill: '#2c736f', text: '气味：' + b.smell }, root);
    S('text', { x: 118, y: 94, 'font-size': 10.5, fill: '#1f302e', text: '灰烬：' + b.ash }, root);
    // 灰烬
    var g = S('g', {}, root);
    if (burnK === 'cotton') {
      [[324, 66, 9, 5], [338, 70, 8, 4], [312, 72, 7, 4], [330, 76, 10, 4]].forEach(function (e) { S('ellipse', { cx: e[0], cy: e[1], rx: e[2], ry: e[3], fill: '#d9d9d2', stroke: '#bdbdb4' }, g); });
    } else if (burnK === 'wool') {
      [[318, 70], [326, 66], [334, 71], [328, 75], [340, 66], [312, 75]].forEach(function (p) { S('circle', { cx: p[0], cy: p[1], r: 3.6, fill: '#4a3426' }, g); });
    } else {
      S('circle', { cx: 326, cy: 70, r: 9, fill: '#24282c' }, g);
      S('circle', { cx: 323, cy: 67, r: 2.5, fill: '#6b737b' }, g);
    }
    S('text', { x: 326, y: 98, 'text-anchor': 'middle', 'font-size': 9.5, fill: '#546160', text: b.n + '的灰烬' }, root);
    L.$('#burn-text').innerHTML = b.text;
    save();
  }
  L.chips(L.$('#burn-chips'), [{ label: '棉花', value: 'cotton' }, { label: '羊毛', value: 'wool' }, { label: '涤纶', value: 'poly' }], burnK, function (v) { burnK = v; drawBurn(); });

  /* ========== ③ 深圳垃圾四分类 ========== */
  var TB = [
    { v: 'rec', n: '可回收物', col: '#2f6fb3' },
    { v: 'kit', n: '厨余垃圾', col: '#3f8f4f' },
    { v: 'haz', n: '有害垃圾', col: '#c0392b' },
    { v: 'oth', n: '其他垃圾', col: '#5f6b6d' }
  ];
  var TRASH = [
    { n: '废电池', c: 'haz', i: 'battery', why: '电池里含有重金属等有害物质，深圳要求各类废电池都投进有害垃圾收集容器，破损的要用透明袋封好。', hint: '电池里含有重金属，乱丢会污染土壤和水。' },
    { n: '塑料饮料瓶', c: 'rec', i: 'bottle', why: '倒空、压扁后投放，回收的塑料能重新加工成塑料制品或纤维。', hint: '干净的塑料瓶还能变成新的塑料原料。' },
    { n: '剩饭剩菜', c: 'kit', i: 'leftover', why: '易腐烂的食物残渣是厨余垃圾，经过生物处理可以变成肥料或沼气。投放前要沥干水分、去掉包装。', hint: '它很快就会腐烂发臭，属于“易腐”的那一类。' },
    { n: '用过的纸巾', c: 'oth', i: 'tissue', why: '纸巾遇水就烂，又沾了脏东西，不能再造纸，所以是其他垃圾，不是可回收物。', hint: '它是纸，但已经脏了、一泡水就烂，还能再造纸吗？' },
    { n: '过期药品', c: 'haz', i: 'medicine', why: '过期药品属于有害垃圾，深圳的社区服务中心设有过期药品回收箱。', hint: '药品放久了会变质，随意丢弃会污染环境。' },
    { n: '易拉罐', c: 'rec', i: 'can', why: '易拉罐大多是铝做的，回收再冶炼比用铝矿石炼铝节省大量能源。', hint: '它是金属做的，可以回炉再用。' },
    { n: '果皮', c: 'kit', i: 'peel', why: '瓜皮果核属于厨余垃圾，和剩饭剩菜一起处理。', hint: '它会腐烂，和剩饭剩菜是一类。' },
    { n: '废荧光灯管', c: 'haz', i: 'tube', why: '荧光灯管里含有少量汞，灯管破碎后汞会挥发，所以要完整、小心地投放。', hint: '灯管里藏着一种有毒的金属。' },
    { n: '旧报纸', c: 'rec', i: 'paper', why: '干净的废纸回收后可以重新制成纸浆再造纸，少砍树。', hint: '干净的纸还能再造纸。' },
    { n: '烟头', c: 'oth', i: 'cig', why: '烟头不能回收，也不是厨余，属于其他垃圾。一定要熄灭后再投放。', hint: '它既不能回收，也不会像食物那样被堆肥。' },
    { n: '水银温度计', c: 'haz', i: 'thermo', why: '水银就是金属汞，有毒，废水银温度计属于有害垃圾。', hint: '水银是哪种金属？它有毒吗？' },
    { n: '用过的快餐盒', c: 'oth', i: 'box', why: '沾满油污的一次性快餐盒很难再利用，深圳把它归入其他垃圾。同样是塑料，干净的塑料瓶才是可回收物。', hint: '它虽然是塑料，可已经沾满了油污。' }
  ];
  var tIdx = Math.round(L.num(st.g, 0, 0, TRASH.length));
  var tErr = Math.round(L.num(st.ge, 0, 0, 999));
  var trashMsg = '', tFlash = null, tFlashTimer = null, fly = null, shake = 0, tAnim = null, tDrag = null;
  var trash = L.$('#trash');
  function tBinX(j) { return 15 + j * 94; }

  function trashIcon(g, v) {
    switch (v) {
      case 'battery':
        S('rect', { x: -4, y: -22, width: 8, height: 4, rx: 1, fill: '#9aa3ad' }, g);
        S('rect', { x: -9, y: -18, width: 18, height: 34, rx: 3, fill: '#3b6fb0' }, g);
        S('rect', { x: -9, y: -4, width: 18, height: 10, fill: '#f2c14e' }, g);
        S('text', { x: 0, y: -8, 'text-anchor': 'middle', 'font-size': 10, fill: '#ffffff', 'font-weight': 700, text: '+' }, g);
        break;
      case 'bottle':
        S('rect', { x: -6, y: -26, width: 12, height: 5, rx: 1.5, fill: '#2f6fb3' }, g);
        S('path', { d: 'M-5 -21h10v5q8 4 8 12v22q0 4 -4 4h-18q-4 0 -4 -4v-22q0 -8 8 -12z', fill: '#cfe8f5', stroke: '#6aa9cc' }, g);
        S('rect', { x: -9, y: 0, width: 18, height: 8, fill: '#ffffff', 'fill-opacity': 0.8 }, g);
        break;
      case 'leftover':
        S('path', { d: 'M-18 -2q8 -14 18 -10q10 -6 18 10z', fill: '#c98a4b' }, g);
        S('circle', { cx: 6, cy: -7, r: 3, fill: '#6fae4f' }, g);
        S('path', { d: 'M-22 -2h44a22 17 0 0 1 -44 0z', fill: '#f0ece4', stroke: '#b9ae98' }, g);
        break;
      case 'tissue':
        S('path', { d: 'M-16 6q-6 -12 4 -18q6 -8 14 -2q12 -2 12 10q6 10 -6 14q-8 6 -16 2q-10 2 -8 -6z', fill: '#ffffff', stroke: '#b9c0c4' }, g);
        S('path', { d: 'M-8 -4l6 4l4 -6M2 6l6 -2', fill: 'none', stroke: '#c9cfd2' }, g);
        break;
      case 'medicine':
        S('rect', { x: -18, y: -14, width: 36, height: 22, rx: 3, fill: '#ffffff', stroke: '#c9b0b0' }, g);
        S('path', { d: 'M-3 -3h6M0 -6v6', stroke: '#d8475c', 'stroke-width': 2.4 }, g);
        S('rect', { x: -12, y: 10, width: 24, height: 10, rx: 5, fill: '#f3e9e9', stroke: '#c9b0b0' }, g);
        S('path', { d: 'M0 10H-7a5 5 0 0 0 0 10H0z', fill: '#d8475c' }, g);
        break;
      case 'can':
        S('rect', { x: -10, y: -18, width: 20, height: 34, rx: 3, fill: '#c9d1d8', stroke: '#8a96a2' }, g);
        S('rect', { x: -10, y: -6, width: 20, height: 10, fill: '#d8475c' }, g);
        S('ellipse', { cx: 0, cy: -18, rx: 10, ry: 3, fill: '#e3e8ec', stroke: '#8a96a2' }, g);
        break;
      case 'peel':
        S('path', { d: 'M-2 -20q-2 14 -16 22q10 3 17 -5q2 10 -4 20q12 -6 10 -22q10 8 15 6q-9 -8 -13 -21z', fill: '#f2cf4a', stroke: '#c9a32e' }, g);
        break;
      case 'tube':
        S('rect', { x: -24, y: -4, width: 48, height: 8, rx: 4, fill: '#f7f9fb', stroke: '#9aa8b4' }, g);
        S('rect', { x: -27, y: -5, width: 5, height: 10, rx: 1, fill: '#9aa3ad' }, g);
        S('rect', { x: 22, y: -5, width: 5, height: 10, rx: 1, fill: '#9aa3ad' }, g);
        S('path', { d: 'M-27 -2h-3M-27 2h-3M27 -2h3M27 2h3', stroke: '#7d8791', 'stroke-width': 1.2 }, g);
        break;
      case 'paper':
        S('rect', { x: -18, y: -15, width: 36, height: 30, fill: '#f4f1ea', stroke: '#b3aa98' }, g);
        S('rect', { x: -14, y: -11, width: 28, height: 5, fill: '#7a7468' }, g);
        [-1, 4, 9].forEach(function (y) { S('line', { x1: -14, y1: y, x2: 14, y2: y, stroke: '#b3aa98' }, g); });
        break;
      case 'cig':
        S('rect', { x: -18, y: -3, width: 26, height: 6, fill: '#ffffff', stroke: '#b9b9b9' }, g);
        S('rect', { x: 8, y: -3, width: 10, height: 6, fill: '#e2a35a' }, g);
        S('rect', { x: -21, y: -3, width: 3, height: 6, fill: '#8a8a8a' }, g);
        break;
      case 'thermo':
        S('rect', { x: -3, y: -24, width: 6, height: 38, rx: 3, fill: '#ffffff', stroke: '#9aa8b4' }, g);
        S('rect', { x: -1, y: -6, width: 2, height: 18, fill: '#aab3bc' }, g);
        S('circle', { cx: 0, cy: 16, r: 5, fill: '#b8c0c8', stroke: '#8a96a2' }, g);
        [-18, -12, -6, 0].forEach(function (y) { S('line', { x1: 3, y1: y, x2: 7, y2: y, stroke: '#9aa8b4' }, g); });
        break;
      case 'box':
        S('path', { d: 'M-22 -10h44v6h-44z', fill: '#efeae0', stroke: '#b9ae98' }, g);
        S('path', { d: 'M-20 -4h40l-4 18h-32z', fill: '#f6f3ec', stroke: '#b9ae98' }, g);
        [[-8, 4, 3], [6, 7, 2.5], [10, -1, 2]].forEach(function (c) { S('circle', { cx: c[0], cy: c[1], r: c[2], fill: '#c98a4b', opacity: 0.6 }, g); });
        break;
    }
  }

  function drawTrash() {
    keepFocus(trash, function () {
      trash.innerHTML = '';
      var defs = S('defs', {}, trash);
      S('rect', { x: 0, y: 0, width: 400, height: 240, rx: 14 }, S('clipPath', { id: 'trash-clip' }, defs));
      S('rect', { x: 0, y: 0, width: 400, height: 240, rx: 14, fill: '#fbfcfa' }, trash);
      var root = S('g', { 'clip-path': 'url(#trash-clip)' }, trash);
      // 待投放的垃圾
      if (tIdx < TRASH.length) {
        var it = TRASH[tIdx], ox = shake ? Math.sin(shake * 40) * 6 * (1 - shake / 0.4) : 0, oy = 0;
        if (tDrag && tDrag.moving) { ox = tDrag.x - tDrag.sx; oy = tDrag.y - tDrag.sy; }
        var card = S('g', { transform: 'translate(' + ox + ' ' + oy + ')', style: 'touch-action:none;cursor:grab' }, root);
        S('rect', { x: 140, y: 12, width: 120, height: 96, rx: 12, fill: '#ffffff', stroke: '#b9c7c6', 'stroke-width': 1.2 }, card);
        trashIcon(S('g', { transform: 'translate(200 50) scale(1.1)' }, card), it.i);
        S('text', { x: 200, y: 98, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: '#1f302e', text: it.n }, card);
        card.addEventListener('pointerdown', function (e) {
          var p = L.svgPoint(trash, e);
          tDrag = { sx: p.x, sy: p.y, x: p.x, y: p.y, moving: false };
          try { trash.setPointerCapture(e.pointerId); } catch (err) {}
        });
        S('text', { x: 386, y: 24, 'text-anchor': 'end', 'font-size': 10, fill: '#7c8a89', text: '第 ' + (tIdx + 1) + ' / ' + TRASH.length + ' 件' }, root);
        S('text', { x: 14, y: 24, 'font-size': 10, fill: '#7c8a89', text: '投进哪个桶？' }, root);
      } else {
        S('rect', { x: 110, y: 18, width: 180, height: 84, rx: 12, fill: '#eaf6f6' }, root);
        S('text', { x: 200, y: 54, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: '#2c736f', text: '12 件全部投完' }, root);
        S('text', { x: 200, y: 76, 'text-anchor': 'middle', 'font-size': 11, fill: '#546160', text: '投错 ' + tErr + ' 次' }, root);
      }
      // 四个桶
      TB.forEach(function (b, j) {
        var x = tBinX(j), fl = tFlash && tFlash.bin === j;
        var count = TRASH.slice(0, tIdx).filter(function (t) { return t.c === b.v; }).length;
        var g = S('g', { class: 'svg-hit', tabindex: 0, role: 'button', 'data-k': 't' + j, 'aria-label': '投进' + b.n }, root);
        S('rect', { x: x + 34, y: 126, width: 20, height: 7, rx: 3, fill: b.col }, g);
        S('rect', { x: x, y: 132, width: 88, height: 13, rx: 4, fill: b.col }, g);
        S('path', { d: 'M' + (x + 5) + ' 148H' + (x + 83) + 'L' + (x + 77) + ' 230H' + (x + 11) + 'Z', fill: b.col, 'fill-opacity': 0.92 }, g);
        S('text', { x: x + 44, y: 178, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: '#ffffff', text: b.n }, g);
        S('text', { x: x + 44, y: 214, 'text-anchor': 'middle', 'font-size': 10, fill: '#ffffff', 'fill-opacity': 0.9, text: '已投 ' + count + ' 件' }, g);
        if (fl) {
          S('path', { d: 'M' + (x + 2) + ' 146H' + (x + 86) + 'L' + (x + 79) + ' 232H' + (x + 9) + 'Z', fill: 'none', stroke: tFlash.ok ? '#f2c14e' : '#1f302e', 'stroke-width': 3, 'stroke-dasharray': tFlash.ok ? null : '5 3' }, g);
          S('text', { x: x + 44, y: 198, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700, fill: '#ffffff', text: tFlash.ok ? '✓' : '✗' }, g);
        }
        onActivate(g, function () { dropTrash(j); });
      });
      // 飞进桶里的那件
      if (fly) {
        var e = fly.t * fly.t, fx = L.lerp(200, tBinX(fly.j) + 44, e), fy = L.lerp(50, 150, e), sc = L.lerp(1.1, 0.4, e);
        trashIcon(S('g', { transform: 'translate(' + fx + ' ' + fy + ') scale(' + sc + ')', opacity: 1 - 0.5 * e }, root), TRASH[fly.k].i);
      }
    });
  }
  function runTrashAnim() {
    if (tAnim) return;
    if (L.REDUCED) { fly = null; shake = 0; drawTrash(); return; }
    tAnim = L.loop(function (dt) {
      if (fly) { fly.t += dt / 0.4; if (fly.t >= 1) fly = null; }
      if (shake) { shake += dt; if (shake >= 0.4) shake = 0; }
      drawTrash();
      if (!fly && !shake) { tAnim = null; return false; }
    });
  }
  function dropTrash(j) {
    if (tIdx >= TRASH.length) { trashMsg = '已经全部投完了，点“重新开始”再来一轮。'; updateTrash(); return; }
    var it = TRASH[tIdx], b = TB[j];
    if (it.c === b.v) {
      trashMsg = '<b>' + it.n + '</b> → ' + b.n + '。' + it.why;
      fly = { k: tIdx, j: j, t: 0 }; shake = 0;
      tIdx++;
      if (tIdx === TRASH.length) trashMsg += ' 全部投完，投错 ' + tErr + ' 次。';
    } else {
      tErr++; shake = 0.001;
      trashMsg = '<b>' + it.n + '</b>不该投进' + b.n + '。' + it.hint;
    }
    tFlash = { bin: j, ok: it.c === b.v };
    clearTimeout(tFlashTimer);
    tFlashTimer = setTimeout(function () { tFlash = null; drawTrash(); }, 750);
    drawTrash(); updateTrash(); runTrashAnim();
  }
  trash.addEventListener('pointermove', function (e) {
    if (!tDrag) return;
    var p = L.svgPoint(trash, e);
    tDrag.x = p.x; tDrag.y = p.y;
    if (!tDrag.moving && Math.hypot(p.x - tDrag.sx, p.y - tDrag.sy) > 6) tDrag.moving = true;
    if (tDrag.moving) { e.preventDefault(); drawTrash(); }
  });
  trash.addEventListener('pointerup', function () {
    if (!tDrag) return;
    var d = tDrag; tDrag = null;
    if (!d.moving) { trashMsg = '点下面的桶，或者把它拖到桶上。'; updateTrash(); return; }
    var hit = -1;
    if (d.y > 118) for (var j = 0; j < TB.length; j++) if (d.x >= tBinX(j) - 3 && d.x <= tBinX(j) + 91) hit = j;
    if (hit >= 0) dropTrash(hit); else drawTrash();
  });
  trash.addEventListener('pointercancel', function () { if (tDrag) { tDrag = null; drawTrash(); } });
  function updateTrash() {
    L.$('#trash-done').innerHTML = tIdx + '<small>/ ' + TRASH.length + '</small>';
    L.$('#trash-err').innerHTML = tErr + '<small>次</small>';
    L.$('#trash-badge').textContent = tIdx >= TRASH.length ? '全部投完' : tIdx === 0 ? '开始投放' : '还剩 ' + (TRASH.length - tIdx) + ' 件';
    L.$('#trash-text').innerHTML = trashMsg || '深圳把生活垃圾分成四类。有害垃圾里含重金属或有毒物质，必须单独收集；分对了，可回收物能变回原料，厨余垃圾能变成肥料。';
    save();
  }
  L.$('#trash-reset').addEventListener('click', function () {
    tIdx = 0; tErr = 0; trashMsg = ''; fly = null; shake = 0; tFlash = null;
    drawTrash(); updateTrash();
  });

  function save() {
    var mp = []; placed.forEach(function (p, k) { if (p) mp.push(k); });
    L.setState({ f: picked.length ? picked.join('.') : '-', mp: mp.length ? mp.join('.') : '-', me: matErr, k: burnK, g: tIdx, ge: tErr });
  }

  renderMeal();
  drawMat(); updateMat();
  drawBurn();
  drawTrash(); updateTrash();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '搭一份六大营养素都齐的午餐',
      desc: '在餐盘里放食物，让右边六种营养素全部亮起来。',
      label: '在营养餐盘里操作',
      button: '检查这份午餐',
      check: function () {
        var miss = missing();
        if (!miss.length) return { ok: true, msg: '六大营养素齐了，一共用了 ' + picked.length + ' 样食物。注意：糖类、油脂、蛋白质能供能，维生素、无机盐和水不供能，但同样不可缺。' };
        return { ok: false, msg: '还缺：' + miss.map(function (x) { return x.n; }).join('、') + '。想补' + miss[0].n + '，可以加' + miss[0].tip + '。' };
      }
    },
    {
      level: 'base',
      title: '下列食物中富含维生素的是',
      desc: '想一想：维生素主要从哪类食物中来？',
      options: ['青菜和水果', '米饭和馒头', '花生油和肥肉', '瘦肉和鸡蛋'],
      answer: 0,
      hint: '米饭、花生油、瘦肉分别主要提供哪种营养素？',
      explain: '蔬菜、水果富含<b>维生素</b>。米饭、馒头主要提供糖类，花生油、肥肉主要提供油脂，瘦肉、鸡蛋主要提供蛋白质。维生素在人体内含量很少，却能调节新陈代谢、预防疾病。'
    },
    {
      level: 'base',
      title: '食用加碘盐，主要是为了预防',
      desc: '可以先做右边的“元素与健康”配对题。',
      options: ['甲状腺肿大', '贫血', '佝偻病', '龋齿'],
      answer: 0,
      hint: '碘是哪种激素的成分？',
      explain: '碘是甲状腺激素的重要成分，缺碘会引起<b>甲状腺肿大</b>（碘过量也会）。贫血是缺铁，佝偻病是缺钙，龋齿与缺氟有关。'
    },
    {
      level: 'mid',
      title: '把 12 种材料全部分对',
      desc: '在“给材料分分类”里，把每一种材料都放进正确的箱子。',
      label: '在材料分类图里操作',
      button: '检查分类',
      check: function () {
        var n = nPlaced();
        if (n === MATS.length) return { ok: true, msg: '全部分好了' + (matErr ? '（中途放错 ' + matErr + ' 次）' : '，一次都没放错') + '。记住两个“名字骗人”的：有机玻璃是塑料，玻璃钢是复合材料。' };
        var left = MATS.filter(function (m, k) { return !placed[k]; }).map(function (m) { return m.n; });
        return { ok: false, msg: '还有 ' + left.length + ' 种没放：' + left.join('、') + '。' };
      }
    },
    {
      level: 'mid',
      title: '鉴别羊毛线和涤纶线，最简便的方法是',
      desc: '可以在右边的“灼烧鉴别”里比一比。',
      options: ['取样灼烧，闻气味', '观察颜色', '用手摸，比较软硬', '放进水里，看是否溶解'],
      answer: 0,
      hint: '羊毛的主要成分是蛋白质，蛋白质烧起来有什么特别的气味？',
      explain: '取样灼烧：有<b>烧焦羽毛气味</b>、灰烬一捏就碎的是羊毛；先熔化、有特殊气味、留下硬球的是涤纶。颜色、手感可以人为改变，两者也都不溶于水，没法区分。'
    },
    {
      level: 'mid',
      title: '完成一轮垃圾分类，投错不超过 2 次',
      desc: '在“深圳垃圾四分类”里把 12 件垃圾全部投完。',
      label: '在垃圾分类图里操作',
      button: '检查投放记录',
      check: function () {
        if (tIdx < TRASH.length) return { ok: false, msg: '还有 ' + (TRASH.length - tIdx) + ' 件没投完，继续。' };
        if (tErr > 2) return { ok: false, msg: '投完了，但错了 ' + tErr + ' 次。点“重新开始”再来一轮，记住：电池、药品、灯管、水银温度计是有害垃圾；脏了的纸巾和快餐盒是其他垃圾。' };
        return { ok: true, msg: '12 件全部投完，只错了 ' + tErr + ' 次。分类投放后，可回收物变回原料，有害垃圾单独安全处理，能少占填埋场、少污染环境。' };
      }
    },
    {
      level: 'trap',
      title: '不锈钢、铝合金属于',
      desc: '名字里的“合”字容易让人想歪。',
      options: ['金属材料', '复合材料', '有机合成材料', '无机非金属材料'],
      answer: 0,
      hint: '合金是在什么里面熔合了其他元素？',
      explain: '合金是在金属中加热熔合某些金属或非金属制成的，仍然是金属，属于<b>金属材料</b>。复合材料是两类不同材料的组合，如玻璃钢、碳纤维复合材料。有机合成材料指塑料、合成纤维、合成橡胶；无机非金属材料指陶瓷、玻璃、水泥等。'
    },
    {
      level: 'trap',
      title: '关于塑料，下列说法正确的是',
      desc: '想一想白色污染真正的原因。',
      options: ['塑料用途很广，关键是减少使用一次性塑料并回收利用', '塑料都有害，应该全部禁止使用', '把废塑料焚烧掉，就不会有任何污染', '塑料埋进土里很快就会分解'],
      answer: 0,
      hint: '白色污染是塑料本身的错，还是用完乱扔、难降解造成的？',
      explain: '塑料轻便耐用，生活离不开它。白色污染的根源是废弃塑料<b>难以降解</b>又被随意丢弃，所以要减少使用、重复使用、使用可降解塑料、回收利用。全部禁止不现实；焚烧会产生有害气体；多数塑料埋在土里很多年都不会分解。'
    }
  ]);
})();
