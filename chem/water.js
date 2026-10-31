/* 化学互动馆 · 第 4 课 自然界的水 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();

  /* ========== 电解水 ========== */
  var elec = L.$('#elec');
  var tm = L.num(st.t, 0, 0, 10);
  var test = '', eAnim = null, eT = 0;
  var TOPY = 44, PX = 6.6;              // 1 mL = 6.6 px
  var timeIn = L.$('#time-in');
  timeIn.value = tm;
  var edefs = S('defs', {}, elec);
  S('rect', { x: 0, y: 0, width: 400, height: 250, rx: 14 }, S('clipPath', { id: 'elec-clip' }, edefs));
  S('path', { d: 'M96 204V44Q96 38 102 38H118Q124 38 124 44V190H172V62H188V190H236V44Q236 38 242 38H258Q264 38 264 44V204Z' }, S('clipPath', { id: 'hof-clip' }, edefs));
  function hH() { return 2 * tm; }
  function hO() { return tm; }

  function flame(parent, x, y, s, c1, c2) {
    var g = S('g', { transform: 'translate(' + x + ' ' + y + ') scale(' + s + ')' }, parent);
    S('path', { d: 'M0 -16C7 -7 7 3 0 9C-7 3 -7 -7 0 -16Z', fill: c1, opacity: 0.9 }, g);
    S('path', { d: 'M0 -5C3 -1 3 4 0 8C-3 4 -3 -1 0 -5Z', fill: c2 }, g);
  }

  function drawElec() {
    elec.innerHTML = ''; elec.appendChild(edefs);
    var g = S('g', { 'clip-path': 'url(#elec-clip)' }, elec);
    S('rect', { x: 0, y: 0, width: 400, height: 250, rx: 14, fill: '#fbfaf7' }, g);
    var LIQ = '#cfe8f2', GAS = '#f7fbfc';
    var gl = hH() * PX, go = hO() * PX;
    var midY = 150 - (gl + go) * 0.48;
    var w = S('g', { 'clip-path': 'url(#hof-clip)' }, g);
    S('rect', { x: 90, y: 30, width: 180, height: 180, fill: LIQ }, w);
    S('rect', { x: 96, y: 36, width: 28, height: TOPY - 36 + gl, fill: GAS }, w);
    S('rect', { x: 236, y: 36, width: 28, height: TOPY - 36 + go, fill: GAS }, w);
    S('rect', { x: 172, y: 36, width: 16, height: Math.max(0, midY - 36), fill: GAS }, w);
    // 气泡
    if (eAnim) {
      for (var i = 0; i < 6; i++) {
        var by = 186 - ((eT * 60 + i * 23) % Math.max(10, 186 - TOPY - gl));
        S('circle', { cx: 104 + (i % 3) * 6, cy: by, r: 1.8, fill: '#fff', stroke: '#7fb6cf', 'stroke-width': 0.8 }, w);
      }
      for (i = 0; i < 3; i++) {
        var oy = 186 - ((eT * 45 + i * 37) % Math.max(10, 186 - TOPY - go));
        S('circle', { cx: 246 + (i % 2) * 8, cy: oy, r: 1.8, fill: '#fff', stroke: '#7fb6cf', 'stroke-width': 0.8 }, w);
      }
    }
    // 玻璃外壳
    S('path', { d: 'M96 204V44Q96 38 102 38H118Q124 38 124 44V190H172V62M188 62V190H236V44Q236 38 242 38H258Q264 38 264 44V204H96', fill: 'none', stroke: '#7f9fc0', 'stroke-width': 1.8 }, g);
    S('path', { d: 'M172 62Q160 52 166 36Q172 24 180 24Q188 24 194 36Q200 52 188 62', fill: midY < 62 ? LIQ : '#f7fbfc', stroke: '#7f9fc0', 'stroke-width': 1.8 }, g);
    // 液面线
    S('line', { x1: 96, y1: TOPY + gl, x2: 124, y2: TOPY + gl, stroke: '#7fb6cf' }, g);
    S('line', { x1: 236, y1: TOPY + go, x2: 264, y2: TOPY + go, stroke: '#7fb6cf' }, g);
    // 刻度
    for (var v = 0; v <= 20; v += 2) {
      var y = TOPY + v * PX, big = v % 4 === 0;
      S('line', { x1: 96, y1: y, x2: 96 + (big ? 7 : 4), y2: y, stroke: '#5f8796' }, g);
      S('line', { x1: 264, y1: y, x2: 264 - (big ? 7 : 4), y2: y, stroke: '#5f8796' }, g);
      if (big) {
        S('text', { x: 91, y: y + 3.5, 'font-size': 9, 'text-anchor': 'end', fill: '#5f8796', text: v }, g);
        S('text', { x: 269, y: y + 3.5, 'font-size': 9, fill: '#5f8796', text: v }, g);
      }
    }
    S('text', { x: 300, y: 112, 'font-size': 9, fill: '#5f8796', text: '单位：mL' }, g);
    // 活塞
    [[110, test === 'h'], [250, test === 'o']].forEach(function (s) {
      S('line', { x1: s[0], y1: 38, x2: s[0], y2: 20, stroke: '#7f9fc0', 'stroke-width': 4 }, g);
      S('line', { x1: s[0], y1: 38, x2: s[0], y2: 20, stroke: '#f7fbfc', 'stroke-width': 1.8 }, g);
      S('rect', s[1] ? { x: s[0] - 3, y: 22, width: 6, height: 12, rx: 1.5, fill: '#5d6b70' } : { x: s[0] - 7, y: 25, width: 14, height: 6, rx: 1.5, fill: '#5d6b70' }, g);
    });
    // 电极、导线、电源
    S('rect', { x: 106, y: 166, width: 8, height: 24, fill: '#4f5658' }, g);
    S('rect', { x: 246, y: 166, width: 8, height: 24, fill: '#4f5658' }, g);
    S('path', { d: 'M110 190V232H166', fill: 'none', stroke: '#6b6b6b', 'stroke-width': 1.6 }, g);
    S('path', { d: 'M250 190V232H180', fill: 'none', stroke: '#6b6b6b', 'stroke-width': 1.6 }, g);
    S('line', { x1: 168, y1: 225, x2: 168, y2: 239, stroke: '#3d4446', 'stroke-width': 4 }, g);
    S('line', { x1: 178, y1: 218, x2: 178, y2: 246, stroke: '#3d4446', 'stroke-width': 1.6 }, g);
    S('text', { x: 158, y: 224, 'font-size': 12, 'text-anchor': 'middle', fill: '#3d4446', 'font-weight': 700, text: '−' }, g);
    S('text', { x: 190, y: 224, 'font-size': 12, 'text-anchor': 'middle', fill: '#c2603f', 'font-weight': 700, text: '+' }, g);
    S('text', { x: 64, y: 182, 'font-size': 11, 'text-anchor': 'middle', fill: '#3d4446', 'font-weight': 600, text: '负极' }, g);
    S('text', { x: 296, y: 182, 'font-size': 11, 'text-anchor': 'middle', fill: '#c2603f', 'font-weight': 600, text: '正极' }, g);
    if (tm > 0.3) {
      S('text', { x: 110, y: TOPY + gl / 2 + 4, 'font-size': 10, 'text-anchor': 'middle', fill: '#2c736f', 'font-weight': 600, text: gl > 14 ? '气体' : '' }, g);
      S('text', { x: 250, y: TOPY + go / 2 + 4, 'font-size': 10, 'text-anchor': 'middle', fill: '#2c736f', 'font-weight': 600, text: go > 14 ? '气体' : '' }, g);
    }
    // 检验
    if (test === 'h' && hH() >= 1) {
      flame(g, 110, 8, 0.9, '#9cc3ee', '#d9ebfb');
      S('text', { x: 98, y: 14, 'font-size': 10, 'text-anchor': 'end', fill: '#3f6fa6', 'font-weight': 600, text: '淡蓝色火焰' }, g);
    }
    if (test === 'o' && hO() >= 1) {
      S('line', { x1: 312, y1: -4, x2: 254, y2: 18, stroke: '#b07a45', 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
      flame(g, 252, 13, 0.62, '#f2a43a', '#ffe08a');
      S('text', { x: 300, y: 30, 'font-size': 10, fill: '#a4492b', 'font-weight': 600, text: '木条复燃' }, g);
    }
    elecReadout();
  }

  function elecReadout() {
    L.$('#time-out').textContent = L.fmt(tm, 1) + ' min';
    L.$('#h2-out').innerHTML = tm > 0 ? L.qty(hH(), 'mL', 1) : '—';
    L.$('#o2-out').innerHTML = tm > 0 ? L.qty(hO(), 'mL', 1) : '—';
    L.$('#ratio-out').textContent = tm > 0 ? '2 : 1' : '—';
    var r = '还没检验', t;
    if (test === 'h') r = hH() >= 1 ? '燃烧 → 氢气' : '气体太少';
    if (test === 'o') r = hO() >= 1 ? '复燃 → 氧气' : '气体太少';
    L.$('#test-out').textContent = r;
    L.$('#elec-badge').textContent = eAnim ? '通电中' : tm === 0 ? '未通电' : '氢二氧一';
    if (tm === 0) t = '接通直流电源后，两个电极上都会冒出气泡，气体把管里的水往下压，水被挤到中间的长管里。';
    else {
      t = '通电 ' + L.fmt(tm, 1) + ' 分钟：负极 ' + L.fmt(hH(), 1) + ' mL，正极 ' + L.fmt(hO(), 1) + ' mL，负极的气体总是正极的 <b>2 倍</b>。口诀：<b>正氧负氢，氢二氧一</b>。';
      if (test === 'h') t += hH() >= 1 ? ' 打开负极活塞点燃，气体燃烧，产生<b>淡蓝色火焰</b>，是氢气。' : ' 管里的气体太少，先多通一会儿电。';
      else if (test === 'o') t += hO() >= 1 ? ' 打开正极活塞，带火星的木条<b>复燃</b>，是氧气。' : ' 管里的气体太少，先多通一会儿电。';
    }
    L.$('#elec-text').innerHTML = t;
    save();
  }
  L.bindRange(timeIn, function (v) { if (eAnim) { eAnim.stop(); eAnim = null; } tm = v; drawElec(); });
  L.$('#elec-run').addEventListener('click', function () {
    if (eAnim) eAnim.stop();
    if (tm >= 10) tm = 0;
    test = '';
    if (L.REDUCED) { eAnim = null; tm = 10; timeIn.value = tm; L.paintRange(timeIn); drawElec(); return; }
    eAnim = L.loop(function (dt, t) {
      eT = t; tm = Math.min(10, tm + dt * 1.6);
      timeIn.value = tm; L.paintRange(timeIn);
      if (tm >= 10) { eAnim = null; drawElec(); return false; }
      drawElec();
    });
  });
  L.$('#test-h').addEventListener('click', function () { if (eAnim) { eAnim.stop(); eAnim = null; } test = 'h'; drawElec(); });
  L.$('#test-o').addEventListener('click', function () { if (eAnim) { eAnim.stop(); eAnim = null; } test = 'o'; drawElec(); });

  /* ========== 化合价写化学式 ========== */
  var CATS = [
    { id: 'Na', sym: 'Na', v: 1, name: '钠' }, { id: 'K', sym: 'K', v: 1, name: '钾' },
    { id: 'Mg', sym: 'Mg', v: 2, name: '镁' }, { id: 'Ca', sym: 'Ca', v: 2, name: '钙' },
    { id: 'Al', sym: 'Al', v: 3, name: '铝' }, { id: 'Fe3', sym: 'Fe', v: 3, name: '铁' },
    { id: 'Fe2', sym: 'Fe', v: 2, name: '亚铁' }, { id: 'Cu', sym: 'Cu', v: 2, name: '铜' },
    { id: 'NH4', sym: 'NH4', v: 1, name: '铵', poly: true, root: '铵根' }
  ];
  var ANS = [
    { id: 'Cl', sym: 'Cl', v: -1, pre: '氯化' }, { id: 'O', sym: 'O', v: -2, pre: '氧化' },
    { id: 'OH', sym: 'OH', v: -1, pre: '氢氧化', poly: true, root: '氢氧根' }, { id: 'NO3', sym: 'NO3', v: -1, pre: '硝酸', poly: true, root: '硝酸根' },
    { id: 'SO4', sym: 'SO4', v: -2, pre: '硫酸', poly: true, root: '硫酸根' }, { id: 'CO3', sym: 'CO3', v: -2, pre: '碳酸', poly: true, root: '碳酸根' }
  ];
  function find(list, id) { return list.filter(function (x) { return x.id === id; })[0]; }
  var cat = find(CATS, st.ca) || find(CATS, 'Al');
  var an = find(ANS, st.an) || find(ANS, 'Cl');
  function vstr(v) { return (v > 0 ? '+' : '−') + Math.abs(v); }
  function part(ion, k, raw) {
    if (ion.poly && (k > 1 || raw)) return '(' + ion.sym + ')' + (k > 1 || raw ? k : '');
    return ion.sym + (k > 1 || raw ? k : '');
  }
  function combo() {
    var a = cat.v, b = -an.v, g = L.gcd(a, b);
    var nc = b / g, na = a / g;
    var no = cat.id === 'NH4' && (an.id === 'O' || an.id === 'OH');
    var rare = an.id === 'CO3' && (cat.id === 'Al' || cat.id === 'Fe3' || cat.id === 'Cu');
    return { a: a, b: b, g: g, nc: nc, na: na, raw: part(cat, b, true) + part(an, a, true), f: part(cat, nc) + part(an, na), name: an.pre + cat.name, no: no, rare: rare };
  }
  function fText(parent, x, y, str, size, fill) {
    var t = S('text', { x: x, y: y, 'font-size': size, 'text-anchor': 'middle', 'font-weight': 700, fill: fill || '#1f302e' }, parent);
    var down = false;
    str.replace(/(\d+)|([^\d]+)/g, function (all, d, o) {
      if (d) { S('tspan', { 'font-size': Math.round(size * 0.6), dy: down ? 0 : Math.round(size * 0.28), fill: d === '1' ? '#a3adac' : null, text: d }, t); down = true; }
      else { S('tspan', { dy: down ? -Math.round(size * 0.28) : 0, text: o }, t); down = false; }
      return all;
    });
    return t;
  }
  var fx = L.$('#fx');
  var fdefs = S('defs', {}, fx);
  S('rect', { x: 0, y: 0, width: 400, height: 220, rx: 14 }, S('clipPath', { id: 'fx-clip' }, fdefs));
  function drawFx() {
    fx.innerHTML = ''; fx.appendChild(fdefs);
    var g = S('g', { 'clip-path': 'url(#fx-clip)' }, fx);
    S('rect', { x: 0, y: 0, width: 400, height: 220, rx: 14, fill: '#fbfaf7' }, g);
    var c = combo(), lab = { 'font-size': 10.5, fill: '#6b7877' };
    S('text', Object.assign({ x: 14, y: 52, text: '① 写符号、标化合价' }, lab), g);
    S('text', Object.assign({ x: 14, y: 138, text: '② 交叉写个数' }, lab), g);
    S('text', Object.assign({ x: 14, y: 196, text: '③ 约简、检查' }, lab), g);
    S('text', { x: 190, y: 26, 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, fill: '#c2603f', text: vstr(cat.v) }, g);
    S('text', { x: 290, y: 26, 'font-size': 14, 'text-anchor': 'middle', 'font-weight': 700, fill: '#3f6fa6', text: vstr(an.v) }, g);
    fText(g, 190, 60, cat.sym, 26);
    fText(g, 290, 60, an.sym, 26);
    if (c.no) {
      S('text', { x: 240, y: 140, 'font-size': 13, 'text-anchor': 'middle', fill: '#c2603f', 'font-weight': 600, text: '这两种不组成初中常见的化合物' }, g);
      return fxReadout(c);
    }
    L.arrow(g, 198, 32, 272, 120, { color: '#c2603f', width: 1.4, head: 7, dash: '4 3' });
    L.arrow(g, 282, 32, 208, 120, { color: '#3f6fa6', width: 1.4, head: 7, dash: '4 3' });
    S('text', { x: 318, y: 98, 'font-size': 10, fill: '#6b7877', text: '数值交叉' }, g);
    fText(g, 240, 146, c.raw, 24);
    if (c.g > 1) S('text', { x: 330, y: 146, 'font-size': 10.5, fill: '#a4492b', text: '÷ ' + c.g + ' 约简' }, g);
    if (c.a === 1 || c.b === 1) S('text', { x: 330, y: c.g > 1 ? 160 : 146, 'font-size': 10, fill: '#8a9796', text: '“1”省略不写' }, g);
    fText(g, 240, 204, c.f, 30, '#2c736f');
    fxReadout(c);
  }
  function fxReadout(c) {
    var nm = L.$('#fx-name'), badge = L.$('#fx-badge'), f = L.$('#fx-formula'), sum = L.$('#fx-sum'), t;
    if (c.no) {
      nm.textContent = '写不出常见化合物'; badge.textContent = '不这样写'; f.textContent = '—'; sum.textContent = '—';
      t = an.id === 'O' ? '没有“氧化铵”这种物质。铵根是一个原子团，初中只和酸根组成铵盐，如 NH<sub>4</sub>Cl、(NH<sub>4</sub>)<sub>2</sub>SO<sub>4</sub>。' : 'NH<sub>4</sub><sup>+</sup> 遇到 OH<sup>−</sup> 会生成氨水（NH<sub>3</sub>·H<sub>2</sub>O），初中不写“氢氧化铵”。';
      L.$('#fx-text').innerHTML = t; save(); return;
    }
    nm.textContent = c.name;
    badge.textContent = c.rare ? '不常见' : '能写出';
    f.innerHTML = L.chem(c.f);
    sum.innerHTML = '(' + vstr(c.a) + ') × ' + c.nc + ' + (' + vstr(-c.b) + ') × ' + c.na + ' = 0';
    t = L.chem(cat.sym) + (cat.poly ? '（' + cat.root + '）' : '') + ' 显 ' + vstr(c.a) + ' 价，' + L.chem(an.sym) + (an.poly ? '（' + an.root + '）' : '') + ' 显 ' + vstr(-c.b) + ' 价。把对方化合价的数值交叉写成自己的个数，得到 ' + L.chem(c.raw) + '。';
    if (c.g > 1) t += ' 两个数都能被 ' + c.g + ' 整除，约简成 <b>' + L.chem(c.f) + '</b>。';
    if ((cat.poly && c.nc > 1) || (an.poly && c.na > 1)) t += ' 原子团个数大于 1，<b>要加括号</b>，括号外写个数。';
    if (cat.id === 'Fe2') t += ' 铁显 +2 价时读“<b>亚铁</b>”。';
    if (cat.id === 'Fe3') t += ' 铁显 +3 价时直接读“铁”。';
    if (an.id === 'O') t += ' 它由两种元素组成，其中一种是氧，属于<b>氧化物</b>。';
    if (c.rare) t += cat.id === 'Cu' ? ' 按化合价能写出这个式子，但这种物质很少见（铜器上的铜绿是碱式碳酸铜）。' : ' 按化合价能写出这个式子，但这种物质在水中不能稳定存在，初中不会考它。';
    L.$('#fx-text').innerHTML = t;
    save();
  }
  L.chips(L.$('#cat-chips'), CATS.map(function (x) { return { label: L.chem(x.sym) + '（' + vstr(x.v) + (x.id === 'Fe3' ? '，铁' : x.id === 'Fe2' ? '，亚铁' : '') + '）', value: x.id }; }), cat.id, function (v) { cat = find(CATS, v); drawFx(); });
  L.chips(L.$('#an-chips'), ANS.map(function (x) { return { label: L.chem(x.sym) + '（' + vstr(x.v) + '）', value: x.id }; }), an.id, function (v) { an = find(ANS, v); drawFx(); });

  /* ========== 净水 ========== */
  var STEPS = [
    ['原水', '刚从河里打来的水：浑浊、发黄，还有点异味。'],
    ['沉降', '加入<b>明矾</b>，它溶于水后生成的胶状物能吸附悬浮杂质，让它们<b>沉降</b>到杯底。'],
    ['过滤', '用滤纸和漏斗把<b>难溶性</b>杂质全部挡住。注意：溶解在水里的东西能穿过滤纸。'],
    ['吸附', '<b>活性炭</b>疏松多孔，能吸附水中的色素和异味。这是物理变化。'],
    ['蒸馏', '把水加热变成水蒸气，再冷凝成水，杂质留在烧瓶里。得到的<b>蒸馏水</b>是纯净物。']
  ];
  var ps = Math.round(L.num(st.s, 0, 0, 4));
  var boiled = st.b === '1', soap = false;
  var rnd = (function () { var s = 7; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })();
  var MUD = [], FINE = [], IONS = [];
  for (var i = 0; i < 12; i++) MUD.push([52 + rnd() * 136, 80 + rnd() * 110, 2.6 + rnd() * 2.4]);
  for (i = 0; i < 30; i++) FINE.push([50 + rnd() * 140, 76 + rnd() * 124]);
  for (i = 0; i < 24; i++) IONS.push([50 + rnd() * 140, 78 + rnd() * 124]);
  function ionCount() { return ps >= 4 ? 0 : boiled ? 6 : 24; }

  var stepBox = L.$('#pure-steps'), stepEls = [];
  STEPS.forEach(function (s, k) {
    if (k) L.html('i', { text: '→' }, stepBox);
    var sp = L.html('span', { role: 'button', tabindex: '0', text: s[0] }, stepBox);
    function go() { ps = k; soap = false; drawPure(); }
    sp.addEventListener('click', go);
    sp.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    stepEls.push(sp);
  });

  var pure = L.$('#pure');
  var pdefs = S('defs', {}, pure);
  S('rect', { x: 0, y: 0, width: 400, height: 230, rx: 14 }, S('clipPath', { id: 'pure-clip' }, pdefs));
  S('path', { d: 'M44 60V204Q44 212 52 212H188Q196 212 196 204V60Z' }, S('clipPath', { id: 'cup-clip' }, pdefs));

  function drawIcon(g) {
    var ix = 300;
    if (ps === 0) {
      S('path', { d: 'M250 120Q275 100 300 120T350 120', fill: 'none', stroke: '#9c8a5a', 'stroke-width': 2 }, g);
      S('text', { x: ix, y: 150, 'font-size': 10.5, 'text-anchor': 'middle', fill: '#6b7877', text: '河水、湖水都是混合物' }, g);
    } else if (ps === 1) {
      S('rect', { x: 284, y: 92, width: 32, height: 26, rx: 4, fill: '#eef2f4', stroke: '#9aa7a6' }, g);
      S('text', { x: ix, y: 110, 'font-size': 10.5, 'text-anchor': 'middle', fill: '#5c6968', text: '明矾' }, g);
      L.arrow(g, 300, 124, 300, 150, { color: '#9aa7a6', width: 1.4, head: 6 });
      S('text', { x: ix, y: 168, 'font-size': 10.5, 'text-anchor': 'middle', fill: '#6b7877', text: '静置，杂质沉到杯底' }, g);
    } else if (ps === 2) {
      S('path', { d: 'M266 82H334L306 118V146H294V118Z', fill: '#f4f8fa', stroke: '#7f9fc0', 'stroke-width': 1.5 }, g);
      S('path', { d: 'M272 86H328L300 116Z', fill: '#fff', stroke: '#b9c1c6', 'stroke-dasharray': '2 1.5' }, g);
      S('line', { x1: 286, y1: 60, x2: 292, y2: 104, stroke: '#9aa7a6', 'stroke-width': 2.4 }, g);
      S('text', { x: ix, y: 168, 'font-size': 10.5, 'text-anchor': 'middle', fill: '#6b7877', text: '玻璃棒引流' }, g);
      S('text', { x: ix, y: 184, 'font-size': 10.5, 'text-anchor': 'middle', fill: '#6b7877', text: '一贴二低三靠' }, g);
    } else if (ps === 3) {
      for (var k = 0; k < 6; k++) S('rect', { x: 276 + (k % 3) * 17, y: 98 + Math.floor(k / 3) * 17, width: 14, height: 14, rx: 3, fill: '#3b3b3b' }, g);
      S('text', { x: ix, y: 152, 'font-size': 10.5, 'text-anchor': 'middle', fill: '#6b7877', text: '活性炭：疏松多孔' }, g);
    } else {
      S('circle', { cx: 278, cy: 120, r: 20, fill: '#f4f8fa', stroke: '#7f9fc0', 'stroke-width': 1.5 }, g);
      S('path', { d: 'M290 104L344 132', stroke: '#7f9fc0', 'stroke-width': 6, fill: 'none' }, g);
      S('path', { d: 'M290 104L344 132', stroke: '#f4f8fa', 'stroke-width': 3, fill: 'none' }, g);
      S('path', { d: 'M266 150Q278 140 290 150', fill: '#f2a43a' }, g);
      for (var d = 0; d < 3; d++) S('circle', { cx: 350, cy: 140 + d * 10, r: 2.2, fill: '#8cc6de' }, g);
      S('text', { x: ix, y: 186, 'font-size': 10.5, 'text-anchor': 'middle', fill: '#6b7877', text: '加热→汽化→冷凝' }, g);
    }
  }

  function drawPure() {
    pure.innerHTML = ''; pure.appendChild(pdefs);
    var g = S('g', { 'clip-path': 'url(#pure-clip)' }, pure);
    S('rect', { x: 0, y: 0, width: 400, height: 230, rx: 14, fill: '#fbfaf7' }, g);
    var tint = ['#d6c58f', '#ddd2a6', '#e7e1bd', '#d6edf5', '#e2f3f9'][ps];
    var cup = S('g', { 'clip-path': 'url(#cup-clip)' }, g);
    S('rect', { x: 40, y: 72, width: 160, height: 142, fill: tint }, cup);
    if (ps <= 1) {
      MUD.forEach(function (m, k) {
        var y = ps === 0 ? m[1] : 204 - (k % 3) * 3;
        S('ellipse', { cx: m[0], cy: y, rx: m[2], ry: m[2] * 0.75, fill: '#8a6a44' }, cup);
      });
      FINE.forEach(function (f, k) {
        var y = ps === 1 && k % 10 < 7 ? 207 - (k % 4) * 2 : f[1];
        S('circle', { cx: f[0], cy: y, r: 1.6, fill: '#8f8a7c' }, cup);
      });
    }
    var nI = ionCount();
    for (var k = 0; k < nI; k++) S('circle', { cx: IONS[k][0], cy: IONS[k][1], r: 1.5, fill: '#3f6fa6', opacity: 0.75 }, cup);
    if (boiled && ps < 4) S('rect', { x: 44, y: 207, width: 152, height: 5, fill: '#e9e6dc' }, cup);
    if (soap) {
      var hard = nI > 6;
      var nb = hard ? 5 : nI > 0 ? 14 : 22;
      for (k = 0; k < nb; k++) S('circle', { cx: 52 + (k * 37) % 136, cy: 70 - (k % 3) * 5, r: 4 + (k % 3), fill: '#fff', stroke: '#b9c9cf' }, cup);
      if (hard) for (k = 0; k < 6; k++) S('ellipse', { cx: 60 + k * 22, cy: 76, rx: 7, ry: 2.4, fill: '#cfcab9' }, cup);
    }
    S('path', { d: 'M44 50V204Q44 212 52 212H188Q196 212 196 204V50', fill: 'none', stroke: '#7f9fc0', 'stroke-width': 1.8 }, g);
    if (ps <= 2) for (k = 0; k < 3; k++) S('path', { d: 'M' + (90 + k * 30) + ' 44q4 -6 0 -12t0 -12', fill: 'none', stroke: '#b6a777', 'stroke-width': 1.4 }, g);
    if (ps <= 2) S('text', { x: 120, y: 16, 'font-size': 10, 'text-anchor': 'middle', fill: '#8a7a4c', text: '有异味' }, g);
    if (nI) S('text', { x: 120, y: 226, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#3f6fa6', text: '蓝点：溶解的钙、镁化合物（实际看不见）' }, g);
    if (boiled && ps < 4) S('text', { x: 200, y: 208, 'font-size': 9.5, fill: '#8a8576', text: '← 水垢' }, g);
    S('text', { x: 300, y: 40, 'font-size': 12, 'text-anchor': 'middle', 'font-weight': 700, fill: '#2c736f', text: (ps ? '第 ' + ps + ' 步 · ' : '') + STEPS[ps][0] }, g);
    drawIcon(g);
    pureReadout();
  }

  function pureReadout() {
    stepEls.forEach(function (sp, k) { sp.className = k === ps ? 'on' : k < ps ? 'done' : ''; });
    L.$('#pure-badge').textContent = STEPS[ps][0];
    var nI = ionCount();
    L.$('#pure-kind').textContent = ps >= 4 ? '纯净物' : '混合物';
    L.$('#pure-hard').textContent = !soap ? '加肥皂水试试' : nI > 6 ? '硬水' : nI > 0 ? '硬度降低了' : '软水';
    var items = [
      ['泥沙等大颗粒', ps >= 1 ? (ps === 1 ? '沉到杯底' : '已除去') : '还在', ps >= 2],
      ['难溶性小颗粒', ps >= 2 ? '已除去' : '还在', ps >= 2],
      ['色素和异味', ps >= 3 ? '已除去' : '还在', ps >= 3],
      ['可溶性钙、镁化合物', ps >= 4 ? '已除去' : boiled ? '减少了' : '还在', ps >= 4]
    ];
    L.$('#pure-list').innerHTML = items.map(function (it) { return '<li class="' + (it[2] ? 'yes' : 'no') + '"><i>' + (it[2] ? '✓' : '✗') + '</i><span>' + it[0] + '：' + it[1] + '</span></li>'; }).join('');
    var t = STEPS[ps][1];
    if (boiled && ps < 4) t += ' 刚才<b>煮沸</b>过：一部分可溶性钙、镁化合物变成沉淀（水垢），水的硬度降低了。';
    if (soap) t += nI > 6 ? ' 加肥皂水振荡：<b>泡沫少、浮渣多</b>，是硬水。' : nI > 0 ? ' 加肥皂水振荡：泡沫明显变多，硬度降低了。' : ' 加肥皂水振荡：<b>泡沫多、浮渣少</b>，是软水。';
    L.$('#pure-text').innerHTML = t;
    L.$('#pure-next').disabled = ps >= 4;
    save();
  }
  L.$('#pure-next').addEventListener('click', function () { if (ps < 4) { ps++; soap = false; drawPure(); } });
  L.$('#pure-soap').addEventListener('click', function () { soap = true; drawPure(); });
  L.$('#pure-boil').addEventListener('click', function () { boiled = true; soap = false; drawPure(); });
  L.$('#pure-reset').addEventListener('click', function () { ps = 0; boiled = false; soap = false; drawPure(); });

  function save() { L.setState({ t: L.fmt(tm, 1), ca: cat.id, an: an.id, s: ps, b: boiled ? '1' : '' }); }

  drawElec();
  drawFx();
  drawPure();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '让负极收集到 10 mL 气体',
      desc: '拖动通电时间，让负极玻璃管里正好有 10 mL 气体。这时正极有多少？',
      label: '在电解水装置上操作',
      button: '检查气体体积',
      check: function () {
        if (Math.abs(hH() - 10) > 0.25) return { ok: false, msg: '现在负极是 ' + L.fmt(hH(), 1) + ' mL。' + (hH() < 10 ? '再多通一会儿电。' : '通电时间长了一点。') };
        return { ok: true, msg: '负极 10 mL 氢气，正极只有 ' + L.fmt(hO(), 1) + ' mL 氧气，正好 2 : 1。' };
      }
    },
    {
      level: 'base',
      title: '电解水时，与电源正极相连的玻璃管中产生的气体',
      desc: '记口诀：正氧负氢。',
      options: ['能使带火星的木条复燃', '能燃烧，产生淡蓝色火焰', '体积是负极气体的 2 倍', '是氢气'],
      answer: 0,
      hint: '正极连的是哪种气体？它有什么性质？',
      explain: '正极产生<b>氧气</b>，能支持燃烧，使带火星的木条复燃。能燃烧、产生淡蓝色火焰的是负极的氢气；体积是对方 2 倍的也是氢气，氧气只有氢气的一半。'
    },
    {
      level: 'base',
      title: '生活中区分硬水和软水，最简便的方法是',
      desc: '可以在“净水四步”里点“加肥皂水振荡”看看。',
      options: ['加肥皂水，振荡后观察泡沫多少', '观察水是否清澈透明', '加活性炭', '加明矾'],
      answer: 0,
      hint: '硬水和软水看上去都是透明的，要靠什么才能分出来？',
      explain: '加肥皂水振荡，<b>泡沫多、浮渣少</b>的是软水，泡沫少、浮渣多的是硬水。硬水软水都可能很清澈，看不出来；活性炭除色素异味，明矾帮助沉降，都不能区分。'
    },
    {
      level: 'mid',
      title: '用交叉法写出硫酸铝的化学式',
      desc: '铝显 +3 价，硫酸根显 −2 价。在“交叉法”里选出它们。',
      label: '在交叉法模型里操作',
      button: '检查化学式',
      check: function () {
        if (cat.id !== 'Al') return { ok: false, msg: '正价部分选“铝”（Al，+3）。' };
        if (an.id !== 'SO4') return { ok: false, msg: '负价部分选“硫酸根”（SO<sub>4</sub>，−2）。' };
        return { ok: true, msg: '交叉得 ' + L.chem('Al2(SO4)3') + '，2 和 3 不能再约。硫酸根有 3 个，要加括号。检验：(+3)×2 + (−2)×3 = 0。' };
      }
    },
    {
      level: 'mid',
      title: '把硬水变软，并用肥皂水证明',
      desc: '在“净水四步”里想办法降低水的硬度，然后加肥皂水振荡，看到泡沫明显变多。',
      label: '在净水模型里操作',
      button: '检查这杯水',
      check: function () {
        if (!soap) return { ok: false, msg: '处理完以后，要点“加肥皂水振荡”来检验。' };
        if (ionCount() > 6) return { ok: false, msg: '泡沫少、浮渣多，还是硬水。过滤和吸附都除不掉溶解的钙、镁化合物，试试<b>煮沸</b>或做到<b>蒸馏</b>。' };
        return { ok: true, msg: ps >= 4 ? '蒸馏除去了可溶性钙、镁化合物，得到软水。实验室常用蒸馏。' : '煮沸使一部分钙、镁化合物变成水垢沉下来，硬度降低了。生活中常用煮沸。' };
      }
    },
    {
      level: 'mid',
      title: '过滤后发现滤液仍然浑浊，可能的原因是',
      desc: '回想“一贴二低三靠”。',
      options: ['滤纸破损', '滤纸没有紧贴漏斗内壁', '活性炭放得太少', '滤纸边缘低于漏斗边缘'],
      answer: 0,
      hint: '什么情况下浑浊的液体会不经过滤纸直接流下去？',
      explain: '<b>滤纸破损</b>或液面高于滤纸边缘，浑水会不经过滤直接流下，滤液就浑浊。滤纸没贴紧只会让过滤变慢；活性炭与过滤无关；滤纸边缘低于漏斗边缘正是规范要求。'
    },
    {
      level: 'trap',
      title: '通过电解水实验，可以得出的结论是',
      desc: '注意“组成”和“构成”、“元素”和“物质”的说法。',
      options: ['水由氢元素和氧元素组成', '水由氢气和氧气组成', '水由两个氢原子和一个氧原子构成', '水分子由氢分子和氧原子构成'],
      answer: 0,
      hint: '水是一种纯净物，里面有没有氢气？宏观物质能用“几个原子”来描述吗？',
      explain: '生成物含氢、氧两种元素，所以<b>水由氢元素和氧元素组成</b>。水里没有氢气和氧气，它们是新生成的；“两个氢原子和一个氧原子”说的是<b>一个水分子</b>，不是宏观的水；水分子里也没有氢分子。'
    },
    {
      level: 'trap',
      title: '下列化学式书写正确的是',
      desc: '可以在“交叉法”里一个个试。',
      options: ['Al(OH)<sub>3</sub>（氢氧化铝）', 'AlOH<sub>3</sub>（氢氧化铝）', 'FeSO<sub>4</sub>（硫酸铁）', 'Mg<sub>2</sub>O<sub>2</sub>（氧化镁）'],
      answer: 0,
      hint: '原子团个数大于 1 要怎样？铁 +2 和 +3 怎么读？能约简的要不要约？',
      explain: '氢氧根有 3 个，要写成 <b>Al(OH)<sub>3</sub></b>；AlOH<sub>3</sub> 漏了括号，意思变成 3 个氢原子。FeSO<sub>4</sub> 里铁是 +2 价，应读<b>硫酸亚铁</b>，硫酸铁是 Fe<sub>2</sub>(SO<sub>4</sub>)<sub>3</sub>。Mg<sub>2</sub>O<sub>2</sub> 没有约简，应为 MgO。'
    }
  ]);
})();
