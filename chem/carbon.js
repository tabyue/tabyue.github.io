/* 化学互动馆 · 第 6 课 碳和碳的氧化物 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();

  var SUBS = '₀₁₂₃₄₅₆₇₈₉';
  function U(s) { return String(s).replace(/([A-Za-z\)])(\d+)/g, function (m, a, d) { return a + d.replace(/\d/g, function (c) { return SUBS[c]; }); }); }
  function eqSign(c) {
    var w = c ? Math.max(1.8, c.length * 0.7 + 0.5) : 1.4;
    return '<span style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;margin:0 .35em;line-height:1">' +
      '<span style="font-size:.6em;min-height:1.1em;color:#2c736f">' + (c || '') + '</span>' +
      '<span style="display:block;width:' + w + 'em;height:.32em;border-top:1.5px solid currentColor;border-bottom:1.5px solid currentColor"></span>' +
      '<span style="font-size:.6em;min-height:1.1em"></span></span>';
  }
  function eq(s) {
    return s.split(' ').map(function (t) {
      if (t === '+') return ' + ';
      if (t === '=') return eqSign('');
      var m = t.match(/^=(.+)=$/);
      if (m) return eqSign(m[1]);
      return L.chem(t);
    }).join('');
  }
  L.$$('[data-eq]').forEach(function (el) { el.innerHTML = eq(el.dataset.eq); });
  function clipRect(svgEl, id, w, h) {
    var d = S('defs', {}, svgEl);
    S('rect', { x: 0, y: 0, width: w, height: h, rx: 14 }, S('clipPath', { id: id }, d));
    return d;
  }
  function flame(g, x, y, h, color, t) {
    var k = 1 + 0.1 * Math.sin((t || 0) * 20 + x);
    var c1 = color === 'blue' ? '#6f9fe0' : '#f2a43a', c2 = color === 'blue' ? '#cfe0fb' : '#ffe08a', st0 = color === 'blue' ? '#3f6fc0' : '#d97a1f';
    S('path', { d: 'M' + x + ' ' + (y - h * k) + 'C' + (x + h * 0.42) + ' ' + (y - h * 0.4) + ' ' + (x + h * 0.38) + ' ' + y + ' ' + x + ' ' + y + 'C' + (x - h * 0.38) + ' ' + y + ' ' + (x - h * 0.42) + ' ' + (y - h * 0.4) + ' ' + x + ' ' + (y - h * k) + 'z', fill: c1, stroke: st0, 'stroke-width': 0.8, opacity: 0.95 }, g);
    S('path', { d: 'M' + x + ' ' + (y - h * 0.5) + 'C' + (x + h * 0.18) + ' ' + (y - h * 0.22) + ' ' + (x + h * 0.16) + ' ' + y + ' ' + x + ' ' + y + 'C' + (x - h * 0.16) + ' ' + y + ' ' + (x - h * 0.18) + ' ' + (y - h * 0.22) + ' ' + x + ' ' + (y - h * 0.5) + 'z', fill: c2 }, g);
  }
  function bubbles(g, x, y, w, h, n, t, color) {
    for (var i = 0; i < n; i++) {
      var ph = ((t || 0) * 0.9 + i / n) % 1, bx = x + ((i * 37) % 100) / 100 * w;
      S('circle', { cx: bx + Math.sin((t || 0) * 5 + i) * 1.5, cy: y - ph * h, r: 1.5 + (i % 3) * 0.6, fill: 'none', stroke: color || '#6f9fb9', 'stroke-width': 0.9 }, g);
    }
  }
  function mix(c1, c2, t) {
    var a = [1, 3, 5].map(function (i) { return parseInt(c1.substr(i, 2), 16); }), b = [1, 3, 5].map(function (i) { return parseInt(c2.substr(i, 2), 16); });
    return '#' + a.map(function (v, i) { var x = Math.round(L.lerp(v, b[i], L.clamp(t, 0, 1))).toString(16); return x.length < 2 ? '0' + x : x; }).join('');
  }
  var visible = {};
  function watch(el, key) {
    visible[key] = true;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible[key] = es[0].isIntersecting; }).observe(el);
  }

  /* ========== ① 碳单质的三维结构 ========== */
  var PHI = (1 + Math.sqrt(5)) / 2;
  function bondsOf(atoms, d0, tol) {
    var out = [];
    for (var i = 0; i < atoms.length; i++) for (var j = i + 1; j < atoms.length; j++) {
      var dx = atoms[i][0] - atoms[j][0], dy = atoms[i][1] - atoms[j][1], dz = atoms[i][2] - atoms[j][2];
      if (Math.abs(Math.sqrt(dx * dx + dy * dy + dz * dz) - d0) < tol) out.push([i, j]);
    }
    return out;
  }
  function buildC60() {
    var pts = [];
    function add(a, b, c) {
      [[a, b, c], [b, c, a], [c, a, b]].forEach(function (p) {
        [1, -1].forEach(function (s0) { [1, -1].forEach(function (s1) { [1, -1].forEach(function (s2) {
          if ((p[0] === 0 && s0 < 0) || (p[1] === 0 && s1 < 0) || (p[2] === 0 && s2 < 0)) return;
          pts.push([p[0] * s0 / 2, p[1] * s1 / 2, p[2] * s2 / 2]);
        }); }); });
      });
    }
    add(0, 1, 3 * PHI); add(1, 2 + PHI, 2 * PHI); add(PHI, 2, 2 * PHI + 1);
    return { atoms: pts, bonds: bondsOf(pts, 1, 0.05), weak: [], k: 37, r: 4.6 };
  }
  function buildDiamond() {
    var a = 4 / Math.sqrt(3), base = [[0, 0, 0], [0, 0.5, 0.5], [0.5, 0, 0.5], [0.5, 0.5, 0]], pts = [];
    for (var i = -2; i <= 2; i++) for (var j = -2; j <= 2; j++) for (var k = -2; k <= 2; k++) {
      base.forEach(function (b) {
        [0, 0.25].forEach(function (o) {
          var p = [(i + b[0] + o) * a, (j + b[1] + o) * a, (k + b[2] + o) * a];
          var c = [p[0] - 0.125 * a, p[1] - 0.125 * a, p[2] - 0.125 * a];
          if (c[0] * c[0] + c[1] * c[1] + c[2] * c[2] <= 2.75 * 2.75) pts.push(c);
        });
      });
    }
    return { atoms: pts, bonds: bondsOf(pts, 1, 0.05), weak: [], k: 34, r: 5 };
  }
  function buildGraphite() {
    var pts = [], s3 = Math.sqrt(3), gap = 2.1;
    [-1, 0, 1].forEach(function (layer) {
      var shift = layer === 0 ? 1 : 0;
      for (var i = -5; i <= 5; i++) for (var j = -5; j <= 5; j++) {
        [[0, 0], [0, 1]].forEach(function (b) {
          var x = i * s3 + j * s3 / 2 + b[0], z = j * 1.5 + b[1] + shift - 0.5;
          if (x * x + z * z <= 3.3 * 3.3) pts.push([x, layer * gap, z]);
        });
      }
    });
    var weak = [];
    for (var p = 0; p < pts.length; p++) for (var q = p + 1; q < pts.length; q++) {
      if (Math.abs(Math.abs(pts[p][1] - pts[q][1]) - gap) < 0.01 && Math.abs(pts[p][0] - pts[q][0]) < 0.01 && Math.abs(pts[p][2] - pts[q][2]) < 0.01) weak.push([p, q]);
    }
    return { atoms: pts, bonds: bondsOf(pts, 1, 0.05), weak: weak, k: 30, r: 4.2 };
  }
  var MODELS = { diamond: buildDiamond(), graphite: buildGraphite(), c60: buildC60() };
  var INFO = {
    diamond: { name: '金刚石', hard: '天然最硬', cond: '不导电', use: '钻探机钻头、裁玻璃的刀、钻石首饰',
      text: '金刚石里每个碳原子都和周围 <b>4 个</b>碳原子牢牢相连，搭成一个结实的立体网，所以它是天然存在的最硬的物质。纯净的金刚石无色透明，琢磨后就是璀璨的钻石。' },
    graphite: { name: '石墨', hard: '很软，有滑腻感', cond: '导电性良好', use: '铅笔芯、电极、润滑剂',
      text: '石墨里碳原子连成一层层六边形的平面网，层与层之间连得很松（虚线），容易滑开，所以石墨很软、有滑腻感，在纸上一划就留下痕迹，可以做铅笔芯。它能导电，可用作电极。' },
    c60: { name: 'C₆₀', hard: '—', cond: '很差', use: '材料科学、超导体等方面的研究',
      text: 'C<sub>60</sub> 和前两种不一样：它是由 <b>60 个碳原子构成的分子</b>，由 12 个五边形和 20 个六边形组成，形状像足球。目前主要用于材料科学、超导体等领域的研究。' }
  };
  var allo = INFO[st.al] ? st.al : 'graphite';
  var circuit = st.ci === '1';
  var yaw = 0.6, pitch = 0.35, spinning = !L.REDUCED, tAllo = 0;
  var alloSvg = L.$('#allo');
  var alloDefs = clipRect(alloSvg, 'allo-clip', 400, 250);
  watch(alloSvg, 'allo');
  var CX = 200, CY = 112;
  function drawAllo() {
    alloSvg.innerHTML = ''; alloSvg.appendChild(alloDefs);
    S('rect', { x: 0, y: 0, width: 400, height: 250, rx: 14, fill: '#fbfaf7' }, alloSvg);
    var g = S('g', { 'clip-path': 'url(#allo-clip)' }, alloSvg);
    var M = MODELS[allo], cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    var P = M.atoms.map(function (p) {
      var x1 = p[0] * cy + p[2] * sy, z1 = -p[0] * sy + p[2] * cy;
      var y1 = p[1] * cp - z1 * sp, z2 = p[1] * sp + z1 * cp;
      return [CX + x1 * M.k, CY - y1 * M.k, z2];
    });
    var zmax = 0;
    P.forEach(function (p) { zmax = Math.max(zmax, Math.abs(p[2])); });
    var items = [];
    M.bonds.forEach(function (b) { items.push({ t: 'b', z: (P[b[0]][2] + P[b[1]][2]) / 2 - 0.01, a: P[b[0]], c: P[b[1]] }); });
    M.weak.forEach(function (b) { items.push({ t: 'w', z: (P[b[0]][2] + P[b[1]][2]) / 2 - 0.02, a: P[b[0]], c: P[b[1]] }); });
    P.forEach(function (p) { items.push({ t: 'a', z: p[2], a: p }); });
    items.sort(function (u, v) { return u.z - v.z; });
    items.forEach(function (it) {
      var depth = (it.z / (zmax || 1) + 1) / 2;
      if (it.t === 'b') S('line', { x1: it.a[0], y1: it.a[1], x2: it.c[0], y2: it.c[1], stroke: mix('#c9d0d3', '#5b6670', depth), 'stroke-width': 1.6 + depth * 1.2, 'stroke-linecap': 'round' }, g);
      else if (it.t === 'w') S('line', { x1: it.a[0], y1: it.a[1], x2: it.c[0], y2: it.c[1], stroke: '#9fb3b1', 'stroke-width': 1, 'stroke-dasharray': '2 3', opacity: 0.4 + depth * 0.5 }, g);
      else S('circle', { cx: it.a[0], cy: it.a[1], r: M.r * (0.8 + depth * 0.35), fill: mix('#d5dadc', '#3d4448', depth), stroke: mix('#e6e9ea', '#22282c', depth), 'stroke-width': 0.8 }, g);
    });
    var cap = { diamond: '每个碳原子连 4 个碳原子：立体网状结构', graphite: '层状结构：层内连得牢，层间（虚线）连得松', c60: '60 个碳原子构成一个“足球”分子' }[allo];
    S('text', { x: 200, y: 20, 'font-size': 11, 'text-anchor': 'middle', fill: '#546160', 'font-weight': 600, text: cap }, g);
    if (circuit) drawCircuit(g);
    else S('text', { x: 200, y: 240, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#8a9796', text: '按住拖动可以转动模型' }, g);
  }
  function drawCircuit(g) {
    var lit = allo === 'graphite';
    // 两个电极夹在模型两侧
    S('rect', { x: 62, y: 96, width: 8, height: 34, rx: 2, fill: '#9aa3a6' }, g);
    S('rect', { x: 330, y: 96, width: 8, height: 34, rx: 2, fill: '#9aa3a6' }, g);
    var w = { fill: 'none', stroke: '#5b6670', 'stroke-width': 1.6 };
    S('path', Object.assign({ d: 'M66 130V226H150' }, w), g);
    S('path', Object.assign({ d: 'M334 130V226H262' }, w), g);
    S('path', Object.assign({ d: 'M176 226H228' }, w), g);
    // 电池
    S('line', { x1: 150, y1: 214, x2: 150, y2: 238, stroke: '#33403f', 'stroke-width': 2.5 }, g);
    S('line', { x1: 158, y1: 219, x2: 158, y2: 233, stroke: '#33403f', 'stroke-width': 4 }, g);
    S('line', { x1: 158, y1: 226, x2: 176, y2: 226, stroke: '#5b6670', 'stroke-width': 1.6 }, g);
    S('text', { x: 154, y: 210, 'font-size': 9, 'text-anchor': 'middle', fill: '#546160', text: '电池' }, g);
    // 灯泡
    if (lit) S('circle', { cx: 245, cy: 222, r: 20, fill: '#ffe9a8', opacity: 0.6 + 0.2 * Math.sin(tAllo * 6) }, g);
    S('circle', { cx: 245, cy: 222, r: 11, fill: lit ? '#ffd65c' : '#f2f2ee', stroke: '#8a8f7a', 'stroke-width': 1.4 }, g);
    S('path', { d: 'M238 226l4-6 3 5 3-5 4 6', fill: 'none', stroke: lit ? '#c27a1f' : '#9aa3a6', 'stroke-width': 1 }, g);
    S('line', { x1: 228, y1: 226, x2: 234, y2: 226, stroke: '#5b6670', 'stroke-width': 1.6 }, g);
    S('line', { x1: 256, y1: 226, x2: 262, y2: 226, stroke: '#5b6670', 'stroke-width': 1.6 }, g);
    S('text', { x: 300, y: 246, 'font-size': 10, 'text-anchor': 'middle', fill: lit ? '#a46a1f' : '#7a8786', 'font-weight': 600, text: lit ? '灯泡亮了：能导电' : '灯泡不亮：不导电' }, g);
  }
  function readAllo() {
    var I = INFO[allo];
    L.$('#allo-badge').textContent = I.name;
    L.$('#allo-hard').textContent = I.hard;
    L.$('#allo-cond').textContent = I.cond;
    L.$('#allo-use').textContent = I.use;
    var extra = circuit ? (allo === 'graphite' ? ' 接上电路，灯泡亮了，说明石墨<b>能导电</b>。' : ' 接上电路，灯泡不亮。') : '';
    L.$('#allo-text').innerHTML = I.text + extra + ' 三种物质都只含碳元素，性质差别全来自<b>碳原子排列方式不同</b>。';
    L.$$('#allo-table tbody tr').forEach(function (tr) { tr.classList.toggle('on', tr.dataset.r === allo); });
    var cb = L.$('#allo-circuit');
    cb.setAttribute('aria-pressed', String(circuit));
    cb.textContent = circuit ? '断开电路' : '接入电路测导电';
    L.$('#allo-spin').textContent = spinning ? '暂停旋转' : '自动旋转';
    save();
  }
  L.chips(L.$('#allo-chips'), [{ label: '金刚石', value: 'diamond' }, { label: '石墨', value: 'graphite' }, { label: 'C<sub>60</sub>', value: 'c60' }], allo, function (v) { allo = v; drawAllo(); readAllo(); });
  L.$('#allo-circuit').addEventListener('click', function () { circuit = !circuit; drawAllo(); readAllo(); });
  L.$('#allo-spin').addEventListener('click', function () { spinning = !spinning; readAllo(); });
  var dragA = null;
  alloSvg.addEventListener('pointerdown', function (e) { dragA = { x: e.clientX, y: e.clientY }; try { alloSvg.setPointerCapture(e.pointerId); } catch (err) {} });
  alloSvg.addEventListener('pointermove', function (e) {
    if (!dragA) return;
    yaw += (e.clientX - dragA.x) * 0.01; pitch = L.clamp(pitch + (e.clientY - dragA.y) * 0.01, -1.4, 1.4);
    dragA = { x: e.clientX, y: e.clientY }; drawAllo();
  });
  ['pointerup', 'pointercancel'].forEach(function (n) { alloSvg.addEventListener(n, function () { dragA = null; }); });
  alloSvg.addEventListener('keydown', function (e) {
    var k = { ArrowLeft: [-0.15, 0], ArrowRight: [0.15, 0], ArrowUp: [0, -0.15], ArrowDown: [0, 0.15] }[e.key];
    if (!k) return;
    e.preventDefault(); yaw += k[0]; pitch = L.clamp(pitch + k[1], -1.4, 1.4); drawAllo();
  });
  L.loop(function (dt) {
    if (!visible.allo) return;
    tAllo += dt;
    if (spinning && !dragA) { yaw += dt * 0.45; drawAllo(); }
    else if (circuit && allo === 'graphite') drawAllo();
  });

  /* ========== ② 二氧化碳的实验室制取 ========== */
  var RG = {
    hcl: { label: '大理石 + 稀盐酸', ok: true, eq: 'CaCO3 + 2HCl = CaCl2 + H2O + CO2↑', why: '大理石（或石灰石）和稀盐酸：反应速率适中，原料便宜易得。' },
    h2so4: { label: '大理石 + 稀硫酸', ok: false, eq: 'CaCO3 + H2SO4 = CaSO4 + H2O + CO2↑', why: '生成的硫酸钙<b>微溶于水</b>，覆盖在大理石表面，阻止反应继续进行。' },
    conc: { label: '大理石 + 浓盐酸', ok: false, eq: 'CaCO3 + 2HCl = CaCl2 + H2O + CO2↑', why: '浓盐酸<b>易挥发</b>，挥发出的氯化氢混进二氧化碳里，气体不纯。' },
    na2co3: { label: '碳酸钠 + 稀盐酸', ok: false, eq: 'Na2CO3 + 2HCl = 2NaCl + H2O + CO2↑', why: '碳酸钠粉末和盐酸<b>反应太快</b>，一下子冲出来，不便于控制和收集。' }
  };
  var GEN = {
    sl: { label: '固液常温型', ok: true, why: '反应物是固体和液体，常温下就能反应，用锥形瓶 + 长颈漏斗。' },
    ss: { label: '固体加热型', ok: false, why: '这是加热固体用的（如加热高锰酸钾）。制 CO<sub>2</sub> 不用加热；而且试管口略向下倾斜，装了液体会流出来。' }
  };
  var COLL = {
    up: { label: '向上排空气法', ok: true, why: 'CO<sub>2</sub> 密度比空气大，沉在瓶底把空气往上挤出去。' },
    down: { label: '向下排空气法', ok: false, why: 'CO<sub>2</sub> 比空气重，瓶口朝下时它会从瓶口沉下去跑掉，收集不到。' },
    water: { label: '排水法', ok: false, why: 'CO<sub>2</sub> 能溶于水（还会和水反应），一般不用排水法收集。' }
  };
  var TEST = { none: '先不做', mouth: '燃着木条放瓶口', inside: '燃着木条伸进瓶里', lime: '通入澄清石灰水' };
  var rg = RG[st.rg] ? st.rg : 'hcl', gen = GEN[st.gn] ? st.gn : 'sl', col = COLL[st.co] ? st.co : 'up', test = TEST[st.te] ? st.te : 'none';
  var rp = 0, tRig = 0, rigRun = null;
  var rigSvg = L.$('#rig');
  var rigDefs = clipRect(rigSvg, 'rig-clip', 400, 220);
  S('path', { d: 'M296 120L296 128Q280 132 280 146L280 230Q280 235 285 235L339 235Q344 235 344 230L344 146Q344 132 328 128L328 120z' }, S('clipPath', { id: 'bottle-clip' }, rigDefs));
  function gasMade() { return rg === 'h2so4' ? Math.min(rp, 0.3) : rp; }
  function rate() {
    if (rp <= 0 || rp >= 1) return 0;
    if (rg === 'h2so4') return rp < 0.3 ? 1 : Math.max(0, 1 - (rp - 0.3) * 6);
    return rg === 'na2co3' ? 2 : 1;
  }
  function fillLevel() {
    var g = gasMade();
    if (col === 'up') return Math.min(1, g * 1.02);
    if (col === 'down') return Math.min(0.1, g);
    return Math.min(0.85, g * 0.85);
  }
  var GL = { fill: '#e9f2f6', 'fill-opacity': 0.7, stroke: '#7f9fc0', 'stroke-width': 1.5 };
  function gattr(extra) { var o = {}, k; for (k in GL) o[k] = GL[k]; for (k in extra) o[k] = extra[k]; return o; }
  function tube(g, pts) { S('path', { d: 'M' + pts.map(function (p) { return p[0] + ' ' + p[1]; }).join('L'), fill: 'none', stroke: '#9fb6c9', 'stroke-width': 3.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, g); }
  function splint(g, x, y, ang, burning) {
    var len = 70, ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len;
    S('line', { x1: x, y1: y, x2: ex, y2: ey, stroke: '#b5884f', 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
    S('circle', { cx: x, cy: y, r: 2.5, fill: '#4a3a2a' }, g);
    if (burning) flame(g, x, y + 2, 14, 'yellow', tRig);
    else S('path', { d: 'M' + x + ' ' + (y - 3) + 'c-4 -6 4 -10 0 -18', fill: 'none', stroke: '#a7b0b2', 'stroke-width': 1.4 }, g);
  }
  function drawRig() {
    rigSvg.innerHTML = ''; rigSvg.appendChild(rigDefs);
    S('rect', { x: 0, y: 0, width: 400, height: 220, rx: 14, fill: '#fbfaf7' }, rigSvg);
    var g = S('g', { transform: 'translate(0 -34)' }, S('g', { 'clip-path': 'url(#rig-clip)' }, rigSvg)), r = rate(), out;
    S('line', { x1: 10, y1: 236, x2: 390, y2: 236, stroke: '#d9dcd5', 'stroke-width': 2 }, g);
    // —— 发生装置 ——
    if (gen === 'sl') {
      var fx = 82;
      var fd = 'M' + (fx - 10) + ' 128L' + (fx - 10) + ' 150L' + (fx - 44) + ' 228Q' + (fx - 45) + ' 235 ' + (fx - 38) + ' 235L' + (fx + 38) + ' 235Q' + (fx + 45) + ' 235 ' + (fx + 44) + ' 228L' + (fx + 10) + ' 150L' + (fx + 10) + ' 128';
      S('path', gattr({ d: fd }), g);
      var foam = rg === 'na2co3' && rp > 0 && rp < 1 ? Math.min(1, rp * 3) : 0;
      var ly = 196 - foam * 50;
      var hw = 10 + (ly - 150) / 78 * 34;
      S('path', { d: 'M' + (fx - hw) + ' ' + ly + 'L' + (fx + hw) + ' ' + ly + 'L' + (fx + 43) + ' 233L' + (fx - 43) + ' 233z', fill: foam ? '#eef3f4' : '#d6eaf2', stroke: foam ? '#c9d6da' : 'none', opacity: 0.95 }, g);
      if (rg === 'na2co3') { if (rp === 0) S('path', { d: 'M' + (fx - 26) + ' 233Q' + fx + ' 218 ' + (fx + 26) + ' 233z', fill: '#f6f6f2', stroke: '#c3cbcb' }, g); }
      else [[-22, 226], [-6, 228], [12, 225], [26, 229]].forEach(function (m, i) {
        S('path', { d: 'M' + (fx + m[0] - 7) + ' ' + (m[1] + 6) + 'l3 -9l8 -2l5 7l-2 6z', fill: rg === 'h2so4' && rp > 0.3 ? '#e9e6dc' : '#a8a397', stroke: rg === 'h2so4' && rp > 0.3 ? '#c9c4b6' : '#7d786c', 'stroke-width': 0.8 }, g);
      });
      if (r > 0) bubbles(g, fx - 30, 230, 60, 230 - ly - 2, rg === 'na2co3' ? 22 : rg === 'h2so4' ? Math.round(10 * r) : 12, tRig);
      S('rect', { x: fx - 12, y: 120, width: 24, height: 14, rx: 2, fill: '#8a6a4d' }, g);
      // 长颈漏斗（下端在液面以下）
      S('path', { d: 'M' + (fx - 20) + ' 64L' + (fx - 2) + ' 92L' + (fx - 2) + ' 214M' + (fx + 16) + ' 64L' + (fx + 2) + ' 92L' + (fx + 2) + ' 214', fill: 'none', stroke: '#7f9fc0', 'stroke-width': 1.5 }, g);
      S('text', { x: fx - 30, y: 58, 'font-size': 9, fill: '#546160', text: '长颈漏斗' }, g);
      S('text', { x: fx + 14, y: 214, 'font-size': 8.5, fill: '#3f6f8a', text: '液封' }, g);
      if (rg === 'conc' && rp > 0) [0, 1, 2].forEach(function (i) { S('circle', { cx: fx - 4 + i * 6, cy: 58 - ((tRig * 12 + i * 7) % 18), r: 4, fill: '#e3e7e8', opacity: 0.8 }, g); });
      tube(g, [[fx + 6, 132], [fx + 6, 100]]);
      out = [fx + 6, 100];
      S('text', { x: fx, y: 248, 'font-size': 9, 'text-anchor': 'middle', fill: '#546160', text: '锥形瓶' }, g);
    } else {
      // 固体加热型：试管口略向下倾斜
      S('rect', { x: 18, y: 120, width: 5, height: 116, fill: '#b7bdb9' }, g);
      S('rect', { x: 18, y: 150, width: 92, height: 4, fill: '#b7bdb9' }, g);
      S('rect', { x: 104, y: 146, width: 10, height: 20, rx: 3, fill: '#9aa3a6' }, g);
      S('path', gattr({ d: 'M40 146Q30 150 34 158L150 168L151 156L44 140Q38 141 40 146z' }), g);
      S('path', { d: 'M38 150L120 160L120 165L36 156z', fill: '#d6eaf2', opacity: 0.95 }, g);
      [[46, 152], [62, 155], [80, 157]].forEach(function (m) { S('path', { d: 'M' + (m[0] - 5) + ' ' + (m[1] + 4) + 'l2 -6l6 -1l4 5l-2 4z', fill: '#a8a397' }, g); });
      if (rp > 0) [0, 1].forEach(function (i) { var ph = (tRig * 1.2 + i * 0.5) % 1; S('circle', { cx: 152, cy: 168 + ph * 50, r: 2.2, fill: '#bcdcea', stroke: '#6f9fb9', 'stroke-width': 0.6 }, g); });
      S('rect', { x: 148, y: 154, width: 10, height: 16, rx: 2, fill: '#8a6a4d', transform: 'rotate(5 153 162)' }, g);
      // 酒精灯
      S('path', { d: 'M60 236L66 206L102 206L108 236z', fill: '#eef3f4', stroke: '#9aa7ab' }, g);
      S('rect', { x: 80, y: 198, width: 8, height: 8, fill: '#9aa7ab' }, g);
      flame(g, 84, 198, 22, 'yellow', tRig);
      tube(g, [[156, 162], [178, 162], [178, 100]]);
      out = [178, 100];
      S('text', { x: 84, y: 248, 'font-size': 9, 'text-anchor': 'middle', fill: '#546160', text: '试管 + 酒精灯' }, g);
    }
    // —— 收集 / 检验 ——
    var f = fillLevel(), bx = 312;
    if (test === 'lime') {
      var turb = rg === 'conc' ? 0.12 * rp : Math.min(1, gasMade() * 2.2);
      tube(g, [out, [bx, out[1]], [bx, 212]]);
      S('path', gattr({ d: 'M' + (bx - 15) + ' 110L' + (bx - 15) + ' 214Q' + (bx - 15) + ' 230 ' + bx + ' 230Q' + (bx + 15) + ' 230 ' + (bx + 15) + ' 214L' + (bx + 15) + ' 110' }), g);
      S('path', { d: 'M' + (bx - 13.5) + ' 150L' + (bx + 13.5) + ' 150L' + (bx + 13.5) + ' 214Q' + (bx + 13.5) + ' 228 ' + bx + ' 228Q' + (bx - 13.5) + ' 228 ' + (bx - 13.5) + ' 214z', fill: mix('#dff0f5', '#f1f1ec', turb), stroke: 'none' }, g);
      for (var i = 0; i < Math.round(turb * 26); i++) S('circle', { cx: bx - 10 + (i * 53 % 21), cy: 156 + (i * 29 % 68), r: 1.3, fill: '#ffffff', stroke: '#d4d6cf', 'stroke-width': 0.5 }, g);
      if (r > 0) bubbles(g, bx - 4, 212, 8, 58, 6, tRig);
      tube(g, [[bx, 140], [bx, 212]]);
      S('text', { x: bx + 22, y: 170, 'font-size': 9, fill: '#546160', text: '澄清' }, g);
      S('text', { x: bx + 22, y: 182, 'font-size': 9, fill: '#546160', text: '石灰水' }, g);
    } else if (col === 'up') {
      tube(g, [out, [bx, out[1]], [bx, 226]]);
      S('path', gattr({ d: 'M' + (bx - 16) + ' 120L' + (bx - 16) + ' 128Q' + (bx - 32) + ' 132 ' + (bx - 32) + ' 146L' + (bx - 32) + ' 230Q' + (bx - 32) + ' 235 ' + (bx - 27) + ' 235L' + (bx + 27) + ' 235Q' + (bx + 32) + ' 235 ' + (bx + 32) + ' 230L' + (bx + 32) + ' 146Q' + (bx + 32) + ' 132 ' + (bx + 16) + ' 128L' + (bx + 16) + ' 120' }), g);
      if (f > 0) { var top = 235 - f * 115; S('rect', { x: bx - 33, y: top, width: 66, height: 235 - top, fill: '#a9bfc6', opacity: 0.45, 'clip-path': 'url(#bottle-clip)' }, g); S('text', { x: bx + 18, y: Math.max(top + 14, 150), 'font-size': 9, 'text-anchor': 'middle', fill: '#3f5a62', text: U('CO2') }, g); }
      tube(g, [[bx, 110], [bx, 226]]);
      S('rect', { x: bx + 4, y: 116, width: 34, height: 3, fill: '#cbd5d8', stroke: '#9aa7ab', 'stroke-width': 0.6 }, g);
      if (test === 'mouth' || test === 'inside') {
        var inside = test === 'inside';
        var burning = rp <= 0 ? true : inside ? !(f > 0.15) : !(f >= 0.98);
        if (inside) splint(g, bx - 10, 176, -1.15, burning);
        else splint(g, bx - 4, 116, -0.5, burning);
      }
    } else if (col === 'down') {
      tube(g, [out, [262, out[1]], [262, 244], [bx, 244], [bx, 130]]);
      S('path', gattr({ d: 'M' + (bx - 16) + ' 238L' + (bx - 16) + ' 230Q' + (bx - 32) + ' 226 ' + (bx - 32) + ' 212L' + (bx - 32) + ' 128Q' + (bx - 32) + ' 123 ' + (bx - 27) + ' 123L' + (bx + 27) + ' 123Q' + (bx + 32) + ' 123 ' + (bx + 32) + ' 128L' + (bx + 32) + ' 212Q' + (bx + 32) + ' 226 ' + (bx + 16) + ' 230L' + (bx + 16) + ' 238' }), g);
      if (rp > 0 && rp < 1) [0, 1].forEach(function (i) {
        var ph = (tRig + i * 0.5) % 1;
        L.arrow(g, bx - 22 + i * 44, 232 + ph * 2, bx - 30 + i * 60, 246, { color: '#8a9796', width: 1.3, head: 5 });
      });
      tube(g, [[bx, 244], [bx, 130]]);
      if (test === 'mouth' || test === 'inside') splint(g, bx + 30, 232, -0.35, true);
      S('text', { x: bx + 40, y: 150, 'font-size': 9, fill: '#a4492b', text: '瓶口朝下' }, g);
    } else {
      S('path', { d: 'M232 168L232 236L390 236L390 168', fill: '#e2f0f5', stroke: '#9aa7ab', 'stroke-width': 1.5 }, g);
      S('rect', { x: 233, y: 182, width: 156, height: 53, fill: '#cfe6f0', opacity: 0.9 }, g);
      var bt = 70, bb = 204;
      S('path', gattr({ d: 'M' + (bx - 16) + ' ' + bb + 'L' + (bx - 16) + ' ' + (bb - 8) + 'Q' + (bx - 32) + ' ' + (bb - 12) + ' ' + (bx - 32) + ' ' + (bb - 26) + 'L' + (bx - 32) + ' ' + (bt + 5) + 'Q' + (bx - 32) + ' ' + bt + ' ' + (bx - 27) + ' ' + bt + 'L' + (bx + 27) + ' ' + bt + 'Q' + (bx + 32) + ' ' + bt + ' ' + (bx + 32) + ' ' + (bt + 5) + 'L' + (bx + 32) + ' ' + (bb - 26) + 'Q' + (bx + 32) + ' ' + (bb - 12) + ' ' + (bx + 16) + ' ' + (bb - 8) + 'L' + (bx + 16) + ' ' + bb }), g);
      var wl = bt + 2 + f * 110;
      S('rect', { x: bx - 31, y: wl, width: 62, height: bb - 26 - wl + 20, fill: '#cfe6f0', opacity: 0.9 }, g);
      tube(g, [out, [262, out[1]], [262, 222], [bx, 222], [bx, 206]]);
      if (r > 0) bubbles(g, bx - 4, 204, 8, 40, 5, tRig);
      if (test === 'mouth' || test === 'inside') S('text', { x: 300, y: 60, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#a4492b', text: '排水法不用木条验满' }, g);
    }
    if (rp > 0 && rp < 1 && rg === 'na2co3') S('text', { x: 82, y: 112, 'font-size': 10, 'text-anchor': 'middle', fill: '#a4492b', 'font-weight': 600, text: '太猛了！' }, g);
  }
  function readRig() {
    var checks = [[RG[rg], '药品'], [GEN[gen], '发生装置'], [COLL[col], '收集方法']];
    var bad = 0;
    var ul = L.$('#rig-checks');
    ul.innerHTML = '';
    checks.forEach(function (c) {
      var o = c[0]; if (!o.ok) bad++;
      L.html('li', { class: o.ok ? 'yes' : 'no', html: '<i>' + (o.ok ? '✓' : '✗') + '</i><span><b>' + c[1] + '：' + o.label + '</b>　' + o.why + '</span>' }, ul);
    });
    L.$('#rig-badge').textContent = bad ? bad + ' 处要改' : '方案可行';
    var eqs = eq(RG[rg].eq);
    if (test === 'lime') eqs += '<span class="step" style="margin-top:4px">' + eq('CO2 + Ca(OH)2 = CaCO3↓ + H2O') + '</span>';
    L.$('#rig-eq').innerHTML = eqs;
    var f = fillLevel(), t;
    if (rp <= 0) t = bad ? '上面标 ✗ 的地方还有问题，可以先改好；也可以直接点“开始制取”，看看用错了会怎样。' : '药品、装置、收集方法都选对了。点“开始制取”，然后试试验满或检验。';
    else if (rp < 1) t = rg === 'na2co3' ? '碳酸钠粉末和盐酸一接触，气泡猛烈涌出，泡沫都快冲上来了。' : rg === 'h2so4' && rp > 0.3 ? '一开始有气泡，很快就越来越少，最后几乎停了：大理石表面被硫酸钙裹住了。' : rg === 'conc' ? '反应在进行，但漏斗口冒出“白雾”：浓盐酸挥发出的氯化氢遇到空气里的水蒸气形成盐酸小液滴。' : '大理石表面不断冒出气泡，气体经导管进入' + (test === 'lime' ? '澄清石灰水。' : '集气瓶。');
    else if (test === 'lime') t = rg === 'conc' ? '石灰水几乎不变浑浊：混在气体里的氯化氢会和氢氧化钙反应，也会把生成的碳酸钙溶解掉。这正是不用浓盐酸的原因。' : '澄清石灰水<b>变浑浊</b>，生成了难溶的碳酸钙，证明这种气体是二氧化碳。这叫<b>检验</b>，和验满不是一回事。';
    else if (col === 'water') t = test === 'none' ? '收集到了一部分气体，但有些 CO<sub>2</sub> 溶进了水里，所以一般不用排水法。' : '排水法收集时，看到瓶口有大气泡往外冒，就说明满了，不用木条验满。何况 CO<sub>2</sub> 一般不用排水法收集。';
    else if (col === 'down') t = 'CO<sub>2</sub> 比空气重，从朝下的瓶口沉下去跑掉了，瓶里几乎没有收集到 CO<sub>2</sub>' + (test === 'mouth' || test === 'inside' ? '，木条照常燃烧。' : '。');
    else if (test === 'mouth') t = f >= 0.98 ? '燃着的木条放在<b>集气瓶口</b>，木条熄灭，说明二氧化碳已经集满。盖好玻璃片，正放在桌上（CO<sub>2</sub> 比空气重）。' : '木条放在瓶口没有熄灭，说明瓶还没集满。CO<sub>2</sub> 是从瓶底往上“堆”的，瓶口最后才有。';
    else if (test === 'inside') t = f > 0.15 ? '木条伸进瓶里熄灭了，可这只能说明瓶里<b>有</b> CO<sub>2</sub>，不能说明<b>满</b>了' + (f < 0.98 ? '（现在其实还没满）' : '') + '。验满一定要放在<b>瓶口</b>。' : '瓶里 CO<sub>2</sub> 还很少，木条没有熄灭。';
    else t = f >= 0.98 ? '集气瓶已经装满 CO<sub>2</sub>。在“收集后”里选一种操作，再点一次“开始制取”看看验满或检验。' : '瓶里只收集到一点 CO<sub>2</sub>，反应就停了。';
    L.$('#rig-text').innerHTML = t;
    L.$('#rig-run').textContent = rp >= 1 ? '再做一次' : rp > 0 ? '制取中…' : '开始制取';
    save();
  }
  function stopRig() { if (rigRun) { rigRun.stop(); rigRun = null; } }
  function resetRig() { stopRig(); rp = 0; drawRig(); readRig(); }
  L.chips(L.$('#rg-chips'), Object.keys(RG).map(function (k) { return { label: RG[k].label, value: k }; }), rg, function (v) { rg = v; resetRig(); });
  L.chips(L.$('#gen-chips'), Object.keys(GEN).map(function (k) { return { label: GEN[k].label, value: k }; }), gen, function (v) { gen = v; resetRig(); });
  L.chips(L.$('#col-chips'), Object.keys(COLL).map(function (k) { return { label: COLL[k].label, value: k }; }), col, function (v) { col = v; resetRig(); });
  L.chips(L.$('#test-chips'), Object.keys(TEST).map(function (k) { return { label: TEST[k], value: k }; }), test, function (v) { test = v; if (v === 'lime') rp = 0; stopRig(); drawRig(); readRig(); });
  L.$('#rig-reset').addEventListener('click', resetRig);
  L.$('#rig-run').addEventListener('click', function () {
    if (rigRun) return;
    if (rp >= 1) rp = 0;
    if (L.REDUCED) { rp = 1; drawRig(); readRig(); return; }
    var dur = rg === 'na2co3' ? 1.4 : 4.5;
    rigRun = L.loop(function (dt) {
      tRig += dt; rp = Math.min(1, rp + dt / dur);
      drawRig(); readRig();
      if (rp >= 1) { rigRun = null; drawRig(); readRig(); return false; }
    });
  });

  /* ========== ③ CO 与 CO2 对比 ========== */
  var EXPS = { litmus: '紫色石蕊溶液', candle: '阶梯蜡烛', lime: '澄清石灰水', burn: '点燃', cuo: '灼热的氧化铜', body: '对人体' };
  var R = {
    co2: {
      litmus: ['紫色石蕊溶液变红', 'CO2 + H2O = H2CO3', '使石蕊变红的不是 CO<sub>2</sub> 本身，而是 CO<sub>2</sub> 和水反应生成的<b>碳酸</b>。碳酸很不稳定，把变红的溶液加热，又会变回紫色：' + eq('H2CO3 = H2O + CO2↑')],
      candle: ['下层蜡烛先熄灭，上层蜡烛后熄灭', '', '说明 CO<sub>2</sub> ① <b>密度比空气大</b>，像水一样从烧杯底往上“灌满”；② <b>不能燃烧，也不支持燃烧</b>。前一条是物理性质，后一条是化学性质，合起来让 CO<sub>2</sub> 能用来灭火。'],
      lime: ['澄清石灰水变浑浊', 'CO2 + Ca(OH)2 = CaCO3↓ + H2O', '生成了难溶于水的白色碳酸钙，这是<b>检验 CO<sub>2</sub></b> 的方法。用石灰浆抹的墙慢慢变硬，也是这个反应。'],
      burn: ['燃着的火柴熄灭，气体不能燃烧', '', 'CO<sub>2</sub> 不能燃烧，也不支持燃烧。进入久未开启的菜窖、深井前要先做<b>灯火试验</b>：那里可能积聚了大量 CO<sub>2</sub>，它虽然无毒，却不能供给呼吸。'],
      cuo: ['黑色粉末不变色；石灰水变浑浊', '', 'CO<sub>2</sub> 没有还原性，夺不走氧化铜里的氧，粉末一直是黑的。石灰水变浑浊，只是因为通进去的本来就是 CO<sub>2</sub>。'],
      body: ['本身无毒，但不能供给呼吸', '', '血红蛋白照样运送氧气，CO<sub>2</sub> 不和它抢位置。但空气中 CO<sub>2</sub> 太多时，氧气相对变少，人会头晕、窒息，所以人多的教室要常开窗。']
    },
    co: {
      litmus: ['无明显变化', '', 'CO <b>难溶于水</b>，也不和水反应，所以石蕊不变色。在煤炉边放一盆水，防不了煤气中毒。'],
      candle: ['不做这个实验', '', 'CO 的密度比空气略小，没法像 CO<sub>2</sub> 那样“倒”进烧杯；它还能燃烧、有毒，绝不能这样操作。'],
      lime: ['无明显变化', '', 'CO 不和石灰水反应。用澄清石灰水，就能把 CO 和 CO<sub>2</sub> 区分开。'],
      burn: ['气体燃烧，发出蓝色火焰，放出热量', '2CO + O2 =点燃= 2CO2', 'CO 有<b>可燃性</b>，可以作燃料。点燃前一定要<b>检验纯度</b>：CO 和空气混合，遇到明火可能发生爆炸。'],
      cuo: ['黑色粉末逐渐变红；澄清石灰水变浑浊', 'CO + CuO =△= Cu + CO2', 'CO 夺走了氧化铜里的氧，具有<b>还原性</b>，工业上用来冶炼金属。要先通 CO 排尽空气再加热（防止爆炸）；结束时先停止加热，继续通 CO 到冷却（防止铜又被氧化）；尾气里有 CO，要点燃或收集，不能直接排放。'],
      body: ['有毒', '', 'CO 极易与血液中的<b>血红蛋白</b>结合，使血红蛋白不能很好地与氧气结合，人体就会缺氧，严重时危及生命。冬天用煤炉取暖要保持通风。']
    }
  };
  var gas = st.gs === 'co' ? 'co' : 'co2', ex = EXPS[st.cx] ? st.cx : 'litmus';
  var cp = 0, tCox = 0, coxRun = null;
  var coxSvg = L.$('#cox');
  var coxDefs = clipRect(coxSvg, 'cox-clip', 400, 230);
  function testTube(g, x, top, bot, w, liqTop, color) {
    S('path', gattr({ d: 'M' + (x - w) + ' ' + top + 'L' + (x - w) + ' ' + (bot - w) + 'Q' + (x - w) + ' ' + bot + ' ' + x + ' ' + bot + 'Q' + (x + w) + ' ' + bot + ' ' + (x + w) + ' ' + (bot - w) + 'L' + (x + w) + ' ' + top }), g);
    S('path', { d: 'M' + (x - w + 1.5) + ' ' + liqTop + 'L' + (x + w - 1.5) + ' ' + liqTop + 'L' + (x + w - 1.5) + ' ' + (bot - w) + 'Q' + (x + w - 1.5) + ' ' + (bot - 1.5) + ' ' + x + ' ' + (bot - 1.5) + 'Q' + (x - w + 1.5) + ' ' + (bot - 1.5) + ' ' + (x - w + 1.5) + ' ' + (bot - w) + 'z', fill: color }, g);
  }
  function lamp(g, x, y, t) {
    S('path', { d: 'M' + (x - 22) + ' ' + (y + 34) + 'L' + (x - 16) + ' ' + (y + 6) + 'L' + (x + 16) + ' ' + (y + 6) + 'L' + (x + 22) + ' ' + (y + 34) + 'z', fill: '#eef3f4', stroke: '#9aa7ab' }, g);
    S('rect', { x: x - 4, y: y - 1, width: 8, height: 7, fill: '#9aa7ab' }, g);
    flame(g, x, y - 1, 20, 'yellow', t);
  }
  function drawCox() {
    coxSvg.innerHTML = ''; coxSvg.appendChild(coxDefs);
    S('rect', { x: 0, y: 0, width: 400, height: 230, rx: 14, fill: '#fbfaf7' }, coxSvg);
    var g = S('g', { 'clip-path': 'url(#cox-clip)' }, coxSvg), isCO2 = gas === 'co2', p = cp, run = cp > 0 && cp < 1;
    S('line', { x1: 10, y1: 216, x2: 390, y2: 216, stroke: '#d9dcd5', 'stroke-width': 2 }, g);
    var gl = isCO2 ? U('CO2') : 'CO';
    if (ex === 'litmus' || ex === 'lime') {
      var base = ex === 'litmus' ? '#9a6cc0' : '#dff0f5', end = ex === 'litmus' ? '#d64b5c' : '#f1f1ec';
      var c = isCO2 ? mix(base, end, p) : base;
      tube(g, [[60, 60], [200, 60], [200, 196]]);
      S('text', { x: 60, y: 50, 'font-size': 10, fill: '#546160', text: '通入 ' + gl }, g);
      testTube(g, 200, 80, 212, 18, 120, c);
      if (ex === 'lime' && isCO2) for (var i = 0; i < Math.round(p * 30); i++) S('circle', { cx: 188 + (i * 53 % 25), cy: 126 + (i * 29 % 78), r: 1.4, fill: '#fff', stroke: '#d4d6cf', 'stroke-width': 0.5 }, g);
      if (run) bubbles(g, 196, 196, 8, 72, 7, tCox);
      tube(g, [[200, 60], [200, 196]]);
      S('text', { x: 230, y: 160, 'font-size': 10, fill: '#546160', text: ex === 'litmus' ? '紫色石蕊溶液' : '澄清石灰水' }, g);
    } else if (ex === 'candle') {
      var bxL = 176, bxR = 316, by0 = 92, by1 = 214;
      if (isCO2) {
        var lvl = by1 - p * (by1 - by0 - 4);
        S('rect', { x: bxL + 1, y: lvl, width: bxR - bxL - 2, height: by1 - lvl, fill: '#a9bfc6', opacity: 0.4 }, g);
        // 倾倒的集气瓶
        S('path', gattr({ d: 'M70 30L150 70L140 90L60 50z', transform: 'rotate(0)' }), g);
        S('path', { d: 'M150 70L162 76L156 90L140 90z', fill: '#e9f2f6', stroke: '#7f9fc0' }, g);
        if (run) [0, 1, 2].forEach(function (i) { var ph = (tCox * 0.9 + i / 3) % 1; S('path', { d: 'M' + (158 + ph * 18) + ' ' + (88 + ph * 40) + 'q6 4 4 10', fill: 'none', stroke: '#8fa6ad', 'stroke-width': 1.3, opacity: 1 - ph }, g); });
        S('text', { x: 60, y: 22, 'font-size': 10, fill: '#546160', text: '倾倒 ' + gl }, g);
      }
      S('path', gattr({ d: 'M' + bxL + ' ' + by0 + 'L' + bxL + ' ' + by1 + 'L' + bxR + ' ' + by1 + 'L' + bxR + ' ' + by0 }), g);
      S('path', { d: 'M196 214V182H246V150H296V214', fill: '#d7dcdc', stroke: '#a3adb0' }, g);
      [[221, 182], [271, 150]].forEach(function (cd, k) {
        S('rect', { x: cd[0] - 5, y: cd[1] - 22, width: 10, height: 22, rx: 2, fill: '#f6efe0', stroke: '#c9b48a' }, g);
        var fy = cd[1] - 23, out = isCO2 && lvl !== undefined && lvl < fy + 2;
        if (out) S('path', { d: 'M' + cd[0] + ' ' + (fy - 1) + 'c-4 -6 4 -10 0 -18', fill: 'none', stroke: '#a7b0b2', 'stroke-width': 1.4 }, g);
        else flame(g, cd[0], fy, 13, 'yellow', tCox + k);
      });
      if (!isCO2) {
        S('rect', { x: 40, y: 40, width: 120, height: 60, rx: 10, fill: '#fbeee6', stroke: '#e0b6a6' }, g);
        S('text', { x: 100, y: 66, 'font-size': 12, 'text-anchor': 'middle', fill: '#a4492b', 'font-weight': 700, text: '不做这个实验' }, g);
        S('text', { x: 100, y: 84, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#a4492b', text: 'CO 有毒、可燃' }, g);
      }
    } else if (ex === 'burn') {
      S('path', gattr({ d: 'M150 214L150 120Q150 110 160 110L190 110L190 96L200 96L200 110L230 110Q240 110 240 120L240 214z' }), g);
      S('path', { d: 'M194 96L196 66L198 66L200 96', fill: '#e9f2f6', stroke: '#7f9fc0' }, g);
      S('text', { x: 195, y: 170, 'font-size': 11, 'text-anchor': 'middle', fill: '#546160', text: '装满 ' + gl }, g);
      // 火柴
      var mx = L.lerp(280, 214, Math.min(1, p * 2.5)), my = L.lerp(40, 58, Math.min(1, p * 2.5));
      S('line', { x1: mx, y1: my, x2: mx + 60, y2: my - 22, stroke: '#c9a064', 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
      S('circle', { cx: mx, cy: my, r: 3.2, fill: '#a4492b' }, g);
      var reached = p > 0.4;
      if (!isCO2 && reached) flame(g, 197, 66, 30 + 3 * Math.sin(tCox * 8), 'blue', tCox);
      if (isCO2 && reached) S('path', { d: 'M' + mx + ' ' + (my - 3) + 'c-4 -6 4 -10 0 -18', fill: 'none', stroke: '#a7b0b2', 'stroke-width': 1.4 }, g);
      else flame(g, mx, my - 1, 12, 'yellow', tCox);
      if (!isCO2 && reached) S('text', { x: 140, y: 40, 'font-size': 10, fill: '#3f6fc0', 'font-weight': 600, text: '蓝色火焰' }, g);
    } else if (ex === 'cuo') {
      tube(g, [[14, 100], [44, 100]]);
      S('text', { x: 14, y: 90, 'font-size': 10, fill: '#546160', text: gl }, g);
      S('rect', gattr({ x: 44, y: 88, width: 180, height: 24, rx: 10 }), g);
      var red = isCO2 ? 0 : p;
      S('path', { d: 'M100 111Q134 98 168 111z', fill: mix('#2d2d2d', '#b4552e', red) }, g);
      S('text', { x: 134, y: 82, 'font-size': 10, 'text-anchor': 'middle', fill: '#546160', text: red > 0.6 ? '红色的铜' : '黑色氧化铜' }, g);
      lamp(g, 134, 150, tCox);
      tube(g, [[224, 100], [270, 100], [270, 196]]);
      var turb = Math.min(1, (isCO2 ? p : Math.max(0, p - 0.15)) * 2);
      testTube(g, 270, 130, 210, 15, 156, mix('#dff0f5', '#f1f1ec', turb));
      for (var j = 0; j < Math.round(turb * 20); j++) S('circle', { cx: 260 + (j * 53 % 21), cy: 162 + (j * 29 % 42), r: 1.3, fill: '#fff', stroke: '#d4d6cf', 'stroke-width': 0.5 }, g);
      if (run) bubbles(g, 266, 196, 8, 38, 5, tCox);
      tube(g, [[270, 100], [270, 196]]);
      S('rect', { x: 253, y: 124, width: 34, height: 9, rx: 2, fill: '#8a6a4d' }, g);
      tube(g, [[270, 100], [270, 126]]);
      tube(g, [[280, 128], [280, 116], [340, 116], [340, 108]]);
      if (!isCO2 && p > 0) flame(g, 340, 106, 18, 'blue', tCox);
      S('text', { x: 340, y: 160, 'font-size': 9, 'text-anchor': 'middle', fill: '#546160', text: isCO2 ? '尾气' : '尾气点燃' }, g);
      S('text', { x: 300, y: 222, 'font-size': 9, 'text-anchor': 'middle', fill: '#546160', text: '澄清石灰水' }, g);
    } else {
      // 血红蛋白示意
      S('ellipse', { cx: 200, cy: 120, rx: 80, ry: 56, fill: '#e8a3a0', stroke: '#c46560', 'stroke-width': 1.5 }, g);
      S('text', { x: 200, y: 124, 'font-size': 12, 'text-anchor': 'middle', fill: '#7a2e2a', 'font-weight': 700, text: '血红蛋白' }, g);
      var sites = [[150, 92], [250, 92], [150, 150], [250, 150]];
      sites.forEach(function (s0, k) {
        S('circle', { cx: s0[0], cy: s0[1], r: 9, fill: '#fbe3e1', stroke: '#c46560', 'stroke-dasharray': '2 2' }, g);
        var bound = p > 0.2 + k * 0.18;
        var far = [[60, 40], [340, 40], [60, 200], [340, 200]][k];
        var tt = bound ? 1 : L.clamp((p - k * 0.18) / 0.2, 0, 1);
        var px = L.lerp(far[0], s0[0], tt), py = L.lerp(far[1], s0[1], tt);
        if (isCO2) {
          S('circle', { cx: px - 6, cy: py, r: 7, fill: '#e0604c', stroke: '#b8432f' }, g); S('circle', { cx: px + 6, cy: py, r: 7, fill: '#e0604c', stroke: '#b8432f' }, g);
          var cxp = far[0] + (k % 2 ? -40 : 40), cyp = far[1] + Math.sin(tCox * 2 + k) * 6;
          S('circle', { cx: cxp - 10, cy: cyp, r: 6, fill: '#e0604c' }, g); S('circle', { cx: cxp, cy: cyp, r: 6.5, fill: '#4a4f55' }, g); S('circle', { cx: cxp + 10, cy: cyp, r: 6, fill: '#e0604c' }, g);
        } else {
          S('circle', { cx: px - 5, cy: py, r: 6.5, fill: '#4a4f55' }, g); S('circle', { cx: px + 6, cy: py, r: 7, fill: '#e0604c', stroke: '#b8432f' }, g);
          var ox = far[0] + (k % 2 ? -42 : 42) + (bound ? (k % 2 ? 10 : -10) : 0), oy = far[1] + Math.sin(tCox * 3 + k) * 6;
          S('circle', { cx: ox - 6, cy: oy, r: 6.5, fill: '#e0604c', opacity: 0.8 }, g); S('circle', { cx: ox + 6, cy: oy, r: 6.5, fill: '#e0604c', opacity: 0.8 }, g);
        }
      });
      S('text', { x: 200, y: 214, 'font-size': 10, 'text-anchor': 'middle', fill: '#546160', text: isCO2 ? '血红蛋白运送的是氧气（O₂），CO₂ 在一旁' : 'CO 抢先占住位置，O₂ 挤不上去' }, g);
    }
  }
  function readCox() {
    var r = R[gas][ex];
    L.$('#cox-badge').textContent = gas === 'co2' ? 'CO₂' : 'CO';
    var showResult = cp >= 1 || (ex === 'candle' && gas === 'co');
    L.$('#cox-phen').textContent = showResult ? r[0] : cp > 0 ? '实验进行中…' : '点“开始实验”';
    L.$('#cox-eq').innerHTML = showResult && r[1] ? eq(r[1]) : showResult ? '<span style="font-size:15px;color:var(--muted)">这一步不需要写化学方程式</span>' : '<span style="font-size:15px;color:var(--muted)">实验做完后显示</span>';
    L.$('#cox-eq').hidden = false;
    L.$('#cox-text').innerHTML = showResult ? r[2] : '现在用的是 <b>' + (gas === 'co2' ? '二氧化碳' : '一氧化碳') + '</b>，实验：' + EXPS[ex] + '。先猜猜会发生什么，再点“开始实验”。';
    L.$('#cox-run').textContent = cp >= 1 ? '再做一次' : cp > 0 ? '实验中…' : '开始实验';
    save();
  }
  function stopCox() { if (coxRun) { coxRun.stop(); coxRun = null; } }
  function resetCox() { stopCox(); cp = 0; drawCox(); readCox(); }
  L.chips(L.$('#gas-chips'), [{ label: '二氧化碳 CO<sub>2</sub>', value: 'co2' }, { label: '一氧化碳 CO', value: 'co' }], gas, function (v) { gas = v; resetCox(); });
  L.chips(L.$('#cox-chips'), Object.keys(EXPS).map(function (k) { return { label: EXPS[k], value: k }; }), ex, function (v) { ex = v; resetCox(); });
  L.$('#cox-reset').addEventListener('click', resetCox);
  L.$('#cox-run').addEventListener('click', function () {
    if (coxRun) return;
    if (cp >= 1) cp = 0;
    if (L.REDUCED) { cp = 1; drawCox(); readCox(); return; }
    coxRun = L.loop(function (dt) {
      tCox += dt; cp = Math.min(1, cp + dt / 4);
      drawCox(); readCox();
      if (cp >= 1) {
        coxRun = null; readCox();
        // 还有火焰的场景（点燃、加热氧化铜）继续轻微闪动，换实验或重做时自动停
        var exNow = ex, gasNow = gas;
        if ((ex === 'burn' && gas === 'co') || ex === 'cuo') L.loop(function (d2) {
          if (coxRun || cp < 1 || ex !== exNow || gas !== gasNow) return false;
          if (!visible.cox) return;
          tCox += d2; drawCox();
        });
        return false;
      }
    });
  });
  watch(coxSvg, 'cox');

  function save() { L.setState({ al: allo, ci: circuit ? 1 : 0, rg: rg, gn: gen, co: col, te: test, gs: gas, cx: ex }); }

  drawAllo(); readAllo();
  drawRig(); readRig();
  drawCox(); readCox();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '让小灯泡亮起来',
      desc: '在“同是碳原子，排法不一样”里接入电路，换一换碳单质，找出能让灯泡发光的那一种。',
      label: '在碳单质模型里操作',
      button: '检查灯泡',
      check: function () {
        if (!circuit) return { ok: false, msg: '先点“接入电路测导电”，把电路接上。' };
        if (allo === 'graphite') return { ok: true, msg: '石墨导电性良好，所以干电池的电极、电车的电刷都用石墨。金刚石不导电。' };
        return { ok: false, msg: INFO[allo].name + '接上电路，灯泡不亮。换一种试试，想想铅笔芯是用什么做的。' };
      }
    },
    {
      level: 'base',
      title: '金刚石和石墨的物理性质差别很大，原因是',
      desc: '一个是最硬的钻头，一个是软软的铅笔芯。',
      options: ['碳原子的排列方式不同', '组成它们的元素不同', '碳原子的大小不同', '一个是单质，一个是化合物'],
      answer: 0,
      hint: '它们都只由碳元素组成。在模型里切换两者，比较碳原子怎么连。',
      explain: '金刚石和石墨都是由碳元素组成的单质，碳原子本身一样，区别在于<b>排列方式</b>：金刚石是立体网状，石墨是层状。元素相同，所以不是“元素不同”；两者都是单质，不是化合物。'
    },
    {
      level: 'base',
      title: '检验一瓶气体是不是二氧化碳，应该用',
      desc: '“检验”是确认气体是什么。',
      options: ['澄清石灰水', '燃着的木条', '紫色石蕊溶液', '带火星的木条'],
      answer: 0,
      hint: '燃着的木条熄灭，能说明一定是 CO₂ 吗？氮气也能让木条熄灭。',
      explain: 'CO<sub>2</sub> 能使<b>澄清石灰水变浑浊</b>，这是它的特征反应：' + eq('CO2 + Ca(OH)2 = CaCO3↓ + H2O') + '。燃着的木条熄灭，氮气也能做到，不能确定；能使石蕊变红的气体也不止一种；带火星的木条是检验氧气用的。'
    },
    {
      level: 'mid',
      title: '组装正确的装置，收集一瓶 CO₂ 并验满',
      desc: '在“组装一套制二氧化碳的装置”里选好药品、发生装置、收集方法，“收集后”选正确的验满方法，然后完成制取。',
      label: '在制取装置里操作',
      button: '检查装置',
      check: function () {
        if (!RG[rg].ok) return { ok: false, msg: '药品不对：' + RG[rg].why };
        if (!GEN[gen].ok) return { ok: false, msg: '发生装置不对：' + GEN[gen].why };
        if (!COLL[col].ok) return { ok: false, msg: '收集方法不对：' + COLL[col].why };
        if (test !== 'mouth') return { ok: false, msg: test === 'inside' ? '验满不能把木条伸进瓶里，要放在<b>瓶口</b>。' : test === 'lime' ? '通入石灰水是<b>检验</b>，题目要的是<b>验满</b>。' : '“收集后”还没选验满的方法。' };
        if (rp < 1) return { ok: false, msg: '装置都对了，点“开始制取”，等收集完成。' };
        return { ok: true, msg: '大理石 + 稀盐酸、固液常温型、向上排空气法，燃着的木条放在瓶口熄灭，说明集满了。' };
      }
    },
    {
      level: 'mid',
      title: '让一氧化碳还原氧化铜',
      desc: '在“CO 和 CO₂”里选好气体和实验，把实验做完，看到黑色粉末变红。',
      label: '在对比实验里操作',
      button: '检查实验',
      check: function () {
        if (ex !== 'cuo') return { ok: false, msg: '实验要选“灼热的氧化铜”。' };
        if (gas !== 'co') return { ok: false, msg: 'CO<sub>2</sub> 没有还原性，粉末不会变红。换成一氧化碳。' };
        if (cp < 1) return { ok: false, msg: '点“开始实验”，等实验做完。' };
        return { ok: true, msg: eq('CO + CuO =△= Cu + CO2') + '<br>CO 夺走了氧化铜里的氧，体现<b>还原性</b>。尾气里有 CO，要点燃处理。' };
      }
    },
    {
      level: 'mid',
      title: '实验室制取 CO₂ 不用稀硫酸，是因为',
      desc: '大理石和稀硫酸也能反应生成 CO₂。',
      options: ['生成的硫酸钙微溶于水，覆盖在大理石表面阻止反应', '稀硫酸易挥发，使气体不纯', '反应太剧烈，无法收集', '稀硫酸和大理石根本不反应'],
      answer: 0,
      hint: '把药品换成“大理石 + 稀硫酸”做一次，看气泡后来怎样了。',
      explain: '反应生成的硫酸钙<b>微溶</b>于水，会裹在大理石表面，把大理石和酸隔开，反应很快就停了。“易挥发”说的是浓盐酸；“太剧烈”说的是碳酸钠粉末；稀硫酸和大理石是能反应的。'
    },
    {
      level: 'trap',
      title: '用向上排空气法收集 CO₂，验满的正确做法是',
      desc: '注意“验满”和“检验”的区别。',
      options: ['把燃着的木条放在集气瓶口', '把燃着的木条伸入集气瓶中', '向瓶中倒入澄清石灰水', '把带火星的木条放在集气瓶口'],
      answer: 0,
      hint: 'CO₂ 是从瓶底往上积的，最后才到哪里？',
      explain: 'CO<sub>2</sub> 比空气重，从瓶底往上积，<b>瓶口</b>最后才有 CO<sub>2</sub>。所以燃着的木条放在瓶口熄灭，才说明满了。伸进瓶里，只要下面有 CO<sub>2</sub> 就会熄灭，说明不了满没满；倒石灰水是检验；带火星的木条是给氧气验满用的。'
    },
    {
      level: 'trap',
      title: '把 CO₂ 通入紫色石蕊溶液，溶液变红。使石蕊变红的是',
      desc: '可以在对比实验里用 CO₂ 做一次“紫色石蕊溶液”。',
      options: ['CO₂ 与水反应生成的碳酸', '二氧化碳本身', '溶液里的水', '石蕊自己变质了'],
      answer: 0,
      hint: '干燥的石蕊纸花放进干燥的 CO₂ 里，会变红吗？',
      explain: '干燥的 CO<sub>2</sub> 不能使干燥的石蕊变红；水也不能。二者反应生成的<b>碳酸</b>才使石蕊变红：' + eq('CO2 + H2O = H2CO3') + '。加热后碳酸分解，溶液又变回紫色。'
    }
  ]);
})();
