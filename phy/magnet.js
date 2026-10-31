/* 物理互动馆 · 第 20 课 电与磁 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();

  function head(g, x, y, ang, color, size) {
    var s = size || 6, c = Math.cos(ang), n = Math.sin(ang);
    S('path', { d: 'M' + (x + c * s).toFixed(1) + ' ' + (y + n * s).toFixed(1) + 'L' + (x - c * s - n * s * 0.6).toFixed(1) + ' ' + (y - n * s + c * s * 0.6).toFixed(1) + 'L' + (x - c * s + n * s * 0.6).toFixed(1) + ' ' + (y - n * s - c * s * 0.6).toFixed(1) + 'z', fill: color }, g);
  }
  function halo(o) { o['paint-order'] = 'stroke'; o.stroke = '#fbfaf7'; o['stroke-width'] = 3; o['stroke-linejoin'] = 'round'; return o; }
  function makeClip(svgEl, id, w, h) {
    var d = S('defs', {}, svgEl), c = S('clipPath', { id: id }, d);
    S('rect', { x: 0, y: 0, width: w, height: h, rx: 14 }, c);
    S('rect', { x: 0, y: 0, width: w, height: h, rx: 14, fill: '#fbfaf7' }, svgEl);
    return S('g', { 'clip-path': 'url(#' + id + ')' }, svgEl);
  }

  /* ========== 通电螺线管 ========== */
  var coil = L.$('#coil');
  var cBody = makeClip(coil, 'coil-clip', 400, 250);
  var cTop = S('g', {}, coil);
  var dir = st.d === 'R' ? 'R' : 'L';
  var wind = st.w === 'B' ? 'B' : 'A';
  var on = st.s !== '0';
  var showLines = st.ln !== '0';
  var X0 = 135, X1 = 265, CY = 110, RT = 22, TURNS = 8, WY = 215;
  var CPTS = [[56, 110], [344, 110], [200, 44], [96, 50], [304, 50], [200, 174]];

  function nLeft() { return (wind === 'A') === (dir === 'L'); }   // 正面导线电流向上 ⇔ N 极在左端
  function field(x, y, nl) {
    var pN = nl ? X0 : X1, pS = nl ? X1 : X0;
    var dx1 = x - pN, dy1 = y - CY, r1 = Math.pow(dx1 * dx1 + dy1 * dy1 + 30, 1.5);
    var dx2 = x - pS, dy2 = y - CY, r2 = Math.pow(dx2 * dx2 + dy2 * dy2 + 30, 1.5);
    return [dx1 / r1 - dx2 / r2, dy1 / r1 - dy2 / r2];
  }
  function trace(a, nl) {
    var pN = nl ? X0 : X1, pS = nl ? X1 : X0;
    var x = pN + 6 * Math.cos(a), y = CY + 6 * Math.sin(a), pts = [[x, y]], closed = false;
    for (var k = 0; k < 900; k++) {
      var b = field(x, y, nl), m = Math.hypot(b[0], b[1]);
      if (!m) break;
      var hx = x + 1.5 * b[0] / m, hy = y + 1.5 * b[1] / m;
      var b2 = field(hx, hy, nl), m2 = Math.hypot(b2[0], b2[1]);
      x += 3 * b2[0] / m2; y += 3 * b2[1] / m2;
      pts.push([x, y]);
      if (Math.hypot(x - pS, y - CY) < 6) { closed = true; break; }
      if (x < -60 || x > 460 || y < -60 || y > 310) break;
    }
    return { pts: pts, closed: closed };
  }

  var needles = CPTS.map(function (p) {
    var g = S('g', { transform: 'translate(' + p[0] + ' ' + p[1] + ')' }, cTop);
    S('circle', { r: 13, fill: '#fff', stroke: '#b8b2c6', 'stroke-width': 1.2 }, g);
    var n = S('g', {}, g);
    S('path', { d: 'M11 0L0 -3.6L0 3.6z', fill: '#c2603f' }, n);
    S('path', { d: 'M-11 0L0 -3.6L0 3.6z', fill: '#8fa2bd' }, n);
    S('circle', { r: 1.6, fill: '#4b425e' }, n);
    return { el: n, a: -90, t: -90 };
  });
  function setNeedle(n) { n.el.setAttribute('transform', 'rotate(' + n.a.toFixed(1) + ')'); }
  function needleTargets() {
    var nl = nLeft();
    return CPTS.map(function (p) {
      if (!on) return -90;
      var b = field(p[0], p[1], nl);
      return Math.atan2(b[1], b[0]) * 180 / Math.PI;
    });
  }
  var needleLoop = null;
  function moveNeedles(instant) {
    var t = needleTargets();
    needles.forEach(function (n, k) { n.t = t[k]; if (instant || L.REDUCED) { n.a = n.t; setNeedle(n); } });
    if (instant || L.REDUCED || needleLoop) return;
    needleLoop = L.loop(function (dt) {
      var busy = false;
      needles.forEach(function (n) {
        var d = ((n.t - n.a + 540) % 360) - 180;
        if (Math.abs(d) > 0.3) { busy = true; n.a += d * Math.min(1, dt * 6); } else n.a = n.t;
        setNeedle(n);
      });
      if (!busy) { needleLoop = null; return false; }
    });
  }

  function drawCoil(instant) {
    cBody.innerHTML = '';
    var nl = nLeft(), frontUp = nl;
    var CU = '#b8742e', IC = '#c2603f';
    S('text', { x: 14, y: 22, 'font-size': 10, fill: '#8a8598', text: '↑ 北' }, cBody);
    // 磁感线（画在最下面）
    if (on && showLines) {
      var lg = S('g', { fill: 'none', stroke: '#9b8cc4', 'stroke-width': 1.1, opacity: 0.85 }, cBody);
      var out = nl ? Math.PI : 0;
      [0, 0.35, -0.35, 0.8, -0.8, 1.25, -1.25, 1.7, -1.7, 2.15, -2.15].forEach(function (da) {
        var r = trace(out + da, nl), p = r.pts;
        if (p.length < 3) return;
        S('path', { d: 'M' + p.map(function (q) { return q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join('L') }, lg);
        var k = 0, i;
        if (r.closed) { for (i = 1; i < p.length; i++) if (Math.abs(p[i][1] - CY) > Math.abs(p[k][1] - CY)) k = i; }
        else { var len = 0; for (i = 1; i < p.length; i++) { len += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); if (len > 60) { k = i; break; } } }
        if (k < 1 || k > p.length - 3) return;
        var q0 = p[k], q1 = p[k + 2];
        if (q0[0] < 4 || q0[0] > 396 || q0[1] < 4 || q0[1] > 246) return;
        head(cBody, q0[0], q0[1], Math.atan2(q1[1] - q0[1], q1[0] - q0[0]), '#7a6aa8', 4.5);
      });
    }
    // 管身
    S('rect', { x: X0, y: CY - RT, width: X1 - X0, height: 2 * RT, rx: 4, fill: '#ece7f3', 'fill-opacity': 0.9, stroke: '#b9b0cc' }, cBody);
    if (on && showLines) {
      [CY - 9, CY + 9].forEach(function (y) {
        S('line', { x1: nl ? X1 - 6 : X0 + 6, y1: y, x2: nl ? X0 + 6 : X1 - 6, y2: y, stroke: '#9b8cc4', 'stroke-width': 1, 'stroke-dasharray': '3 3' }, cBody);
        head(cBody, 200 + (nl ? -30 : 30), y, nl ? Math.PI : 0, '#7a6aa8', 4);
      });
    }
    var p = (X1 - X0) / TURNS, top = CY - RT - 2, bot = CY + RT + 2;
    var y0 = wind === 'A' ? bot : top, y1 = wind === 'A' ? top : bot;
    var k;
    for (k = 0; k < TURNS; k++) {
      var xa = X0 + k * p;
      S('line', { x1: xa + p / 2, y1: y1, x2: xa + p, y2: y0, stroke: CU, 'stroke-width': 1.6, opacity: 0.4, 'stroke-dasharray': '2 2' }, cBody);
    }
    for (k = 0; k < TURNS; k++) {
      var xb = X0 + k * p;
      S('line', { x1: xb, y1: y0, x2: xb + p / 2, y2: y1, stroke: CU, 'stroke-width': 2.6, 'stroke-linecap': 'round' }, cBody);
      if (on && k % 2 === 1) {
        var ang = Math.atan2(y1 - y0, p / 2);
        if (dir === 'R') ang += Math.PI;
        head(cBody, xb + p / 4, (y0 + y1) / 2, ang, IC, 4.5);
      }
    }
    // 引线、电源、开关
    var wire = { fill: 'none', stroke: '#6f6880', 'stroke-width': 1.6, 'stroke-linejoin': 'round' };
    S('path', Object.assign({ d: 'M' + X0 + ' ' + y0 + 'H110V' + WY + 'H195' }, wire), cBody);
    S('path', Object.assign({ d: 'M' + X1 + ' ' + y0 + 'H290V' + WY + 'H272' }, wire), cBody);
    S('line', Object.assign({ x1: 205, y1: WY, x2: 240, y2: WY }, wire), cBody);
    var plusLeft = dir === 'L';
    var xl = plusLeft ? 195 : 205, xs = plusLeft ? 205 : 195;
    S('line', { x1: xl, y1: WY - 12, x2: xl, y2: WY + 12, stroke: '#4b425e', 'stroke-width': 2 }, cBody);
    S('line', { x1: xs, y1: WY - 6, x2: xs, y2: WY + 6, stroke: '#4b425e', 'stroke-width': 4 }, cBody);
    S('text', { x: xl, y: WY - 16, 'font-size': 11, 'text-anchor': 'middle', fill: '#a4492b', 'font-weight': 700, text: '+' }, cBody);
    S('text', { x: xs, y: WY - 16, 'font-size': 11, 'text-anchor': 'middle', fill: '#4b425e', 'font-weight': 700, text: '−' }, cBody);
    S('text', { x: 200, y: WY + 26, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#8a8598', text: '电源' }, cBody);
    S('circle', { cx: 240, cy: WY, r: 2.4, fill: '#4b425e' }, cBody);
    S('circle', { cx: 272, cy: WY, r: 2.4, fill: '#4b425e' }, cBody);
    S('line', { x1: 240, y1: WY, x2: on ? 272 : 266, y2: on ? WY : WY - 15, stroke: '#4b425e', 'stroke-width': 2, 'stroke-linecap': 'round' }, cBody);
    S('text', { x: 256, y: WY + 26, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#8a8598', text: on ? '开关闭合' : '开关断开' }, cBody);
    if (on) {
      // 导线上的电流方向：从电源正极流出
      head(cBody, 110, 170, dir === 'L' ? -Math.PI / 2 : Math.PI / 2, IC, 5);
      head(cBody, 290, 170, dir === 'L' ? Math.PI / 2 : -Math.PI / 2, IC, 5);
      S('text', halo({ x: 100, y: 174, 'font-size': 10, 'text-anchor': 'end', fill: IC, 'font-weight': 600, text: 'I' }), cBody);
      // 两极与大拇指
      var nx = nl ? X0 : X1, sx = nl ? X1 : X0;
      S('text', halo({ x: nx, y: top - 9, 'font-size': 14, 'text-anchor': 'middle', fill: '#c2603f', 'font-weight': 700, text: 'N' }), cBody);
      S('text', halo({ x: sx, y: top - 9, 'font-size': 14, 'text-anchor': 'middle', fill: '#5a7aa6', 'font-weight': 700, text: 'S' }), cBody);
      L.arrow(cBody, nl ? 232 : 168, CY, nl ? X0 + 10 : X1 - 10, CY, { color: '#5a4097', width: 4, head: 12 });
      S('text', halo({ x: 200, y: CY + 4, 'font-size': 10, 'text-anchor': 'middle', fill: '#473969', 'font-weight': 700, text: '大拇指' }), cBody);
    }
    moveNeedles(instant);
    coilReadout();
  }

  function coilReadout() {
    var nl = nLeft();
    L.$('#coil-badge').textContent = on ? 'N 极在' + (nl ? '左端' : '右端') : '没有磁性';
    L.$('#pole-out').textContent = on ? (nl ? '左端' : '右端') : '无';
    L.$('#front-out').textContent = on ? (nl ? '向上 ↑' : '向下 ↓') : '无电流';
    L.$('#hand-out').textContent = on ? '四指顺着电流方向弯，大拇指指向' + (nl ? '左端' : '右端') : '没有电流，不用握';
    var r = dir === 'L' ? (wind === 'A' ? 'none' : 'wind') : (wind === 'A' ? 'dir' : 'both');
    L.$$('#coil-table tbody tr').forEach(function (tr) { tr.classList.toggle('on', tr.dataset.r === r); });
    var t;
    if (!on) t = '开关断开，螺线管里没有电流，也就<b>没有磁性</b>。小磁针只受地磁场的作用，N 极都指向北方。';
    else t = '电流从' + (dir === 'L' ? '左' : '右') + '端流入，螺线管正面导线里的电流' + (nl ? '向上' : '向下') + '。用<b>右手</b>握住螺线管，让四指指向电流的方向，大拇指所指的' + (nl ? '左' : '右') + '端就是 N 极。外部小磁针的 N 极顺着磁感线，<b>从 N 极出来、回到 S 极</b>。';
    L.$('#coil-text').innerHTML = t;
    save();
  }
  L.chips(L.$('#dir-chips'), [{ label: '从左端流入', value: 'L' }, { label: '从右端流入', value: 'R' }], dir, function (v) { dir = v; drawCoil(); });
  L.chips(L.$('#wind-chips'), [{ label: '绕法甲', value: 'A' }, { label: '绕法乙', value: 'B' }], wind, function (v) { wind = v; drawCoil(); });
  L.chips(L.$('#sw-chips'), [{ label: '闭合', value: '1' }, { label: '断开', value: '0' }], on ? '1' : '0', function (v) { on = v === '1'; drawCoil(); });
  L.chips(L.$('#line-chips'), [{ label: '显示', value: '1' }, { label: '隐藏', value: '0' }], showLines ? '1' : '0', function (v) { showLines = v === '1'; drawCoil(); });

  /* ========== 电磁铁 ========== */
  var em = L.$('#em');
  var eBody = makeClip(em, 'em-clip', 400, 240);
  var nT = Math.round(L.num(st.n, 100, 50, 200) / 50) * 50;
  var cur = Math.round(L.num(st.i, 0.8, 0, 1.5) * 10) / 10;
  var core = st.c !== '0';
  var nIn = L.$('#n-in'), iIn = L.$('#i-in');
  nIn.value = nT; iIn.value = cur;

  function strength() { return nT * cur * (core ? 1 : 0.05); }
  function pins() { return Math.min(15, Math.floor(strength() / 20 + 1e-9)); }

  function drawEm() {
    eBody.innerHTML = '';
    var wire = { fill: 'none', stroke: '#6f6880', 'stroke-width': 1.5, 'stroke-linejoin': 'round' };
    // 铁架台
    S('rect', { x: 20, y: 224, width: 70, height: 8, rx: 3, fill: '#d9d4e2' }, eBody);
    S('line', { x1: 40, y1: 224, x2: 40, y2: 18, stroke: '#a39cb3', 'stroke-width': 4 }, eBody);
    S('line', { x1: 40, y1: 22, x2: 212, y2: 22, stroke: '#a39cb3', 'stroke-width': 4 }, eBody);
    S('line', { x1: 200, y1: 22, x2: 200, y2: 36, stroke: '#a39cb3', 'stroke-width': 3 }, eBody);
    // 铁芯或空心纸筒
    if (core) {
      S('rect', { x: 190, y: 36, width: 20, height: 112, rx: 2, fill: '#8d8a96' }, eBody);
      S('text', { x: 222, y: 152, 'font-size': 10, fill: '#5d586a', text: '铁芯' }, eBody);
    } else {
      S('rect', { x: 190, y: 36, width: 20, height: 112, rx: 2, fill: '#f4efe4', stroke: '#cfc4ad' }, eBody);
      S('text', { x: 222, y: 152, 'font-size': 10, fill: '#5d586a', text: '空心纸筒（无铁芯）' }, eBody);
    }
    // 线圈
    var turns = nT / 10, y0 = 46, y1 = 136;
    for (var k = 0; k < turns; k++) {
      var y = y0 + (y1 - y0) * k / (turns - 1);
      S('line', { x1: 185, y1: y + 2, x2: 215, y2: y - 2, stroke: '#b8742e', 'stroke-width': 2.2, 'stroke-linecap': 'round' }, eBody);
    }
    S('text', { x: 222, y: 92, 'font-size': 10, fill: '#8a5a22', text: nT + ' 匝' }, eBody);
    // 电路：上引线 → 电流表 → 电源 → 滑动变阻器 → 下引线
    S('path', Object.assign({ d: 'M186 46H140V200H165V134H186' }, wire), eBody);
    S('circle', { cx: 140, cy: 80, r: 12, fill: '#fff', stroke: '#6f6880', 'stroke-width': 1.5 }, eBody);
    S('text', { x: 140, y: 84, 'font-size': 11, 'text-anchor': 'middle', fill: '#4b425e', 'font-weight': 700, text: 'A' }, eBody);
    S('text', { x: 124, y: 84, 'font-size': 10, 'text-anchor': 'end', fill: '#c2603f', 'font-weight': 600, text: 'I = ' + L.fmt(cur, 1) + ' A' }, eBody);
    S('rect', { x: 128, y: 112, width: 24, height: 12, fill: '#fbfaf7' }, eBody);
    S('line', { x1: 128, y1: 113, x2: 152, y2: 113, stroke: '#4b425e', 'stroke-width': 2 }, eBody);
    S('line', { x1: 134, y1: 122, x2: 146, y2: 122, stroke: '#4b425e', 'stroke-width': 4 }, eBody);
    S('text', { x: 124, y: 122, 'font-size': 9.5, 'text-anchor': 'end', fill: '#8a8598', text: '电源' }, eBody);
    S('rect', { x: 132, y: 150, width: 16, height: 30, rx: 2, fill: '#efeaf5', stroke: '#6f6880', 'stroke-width': 1.3 }, eBody);
    var sy = 178 - (cur / 1.5) * 26;
    L.arrow(eBody, 112, sy, 131, sy, { color: '#5a4097', width: 1.6, head: 6 });
    S('text', { x: 108, y: 168, 'font-size': 9.5, 'text-anchor': 'end', fill: '#8a8598', text: '变阻器' }, eBody);
    // 盘子里剩下的大头针
    S('path', { d: 'M150 218Q200 232 250 218L246 226Q200 238 154 226z', fill: '#e6e2ec', stroke: '#b9b0cc' }, eBody);
    var n = pins(), rest = Math.max(4, 16 - n);
    for (k = 0; k < rest; k++) {
      var px = 160 + (k * 23) % 66, py = 217 + (k % 3) * 2.5, a = ((k * 47) % 60 - 30) * Math.PI / 180;
      S('line', { x1: px, y1: py, x2: px + 18 * Math.cos(a), y2: py + 18 * Math.sin(a) * 0.3, stroke: '#7c8597', 'stroke-width': 1.3, 'stroke-linecap': 'round' }, eBody);
    }
    // 吸起的大头针
    for (k = 0; k < n; k++) {
      var row = Math.floor(k / 5), col = k % 5;
      var hx = 200 + (col - 2) * 6 + (row % 2 ? 3 : 0), hy = 149 + row * 19, tilt = (col - 2) * 9 * Math.PI / 180;
      S('line', { x1: hx, y1: hy, x2: hx + 19 * Math.sin(tilt), y2: hy + 19 * Math.cos(tilt), stroke: '#5f6879', 'stroke-width': 1.4, 'stroke-linecap': 'round' }, eBody);
      S('circle', { cx: hx + 19 * Math.sin(tilt), cy: hy + 19 * Math.cos(tilt), r: 1.7, fill: '#5f6879' }, eBody);
    }
    if (cur === 0) S('text', halo({ x: 200, y: 182, 'font-size': 11, 'text-anchor': 'middle', fill: '#a4492b', 'font-weight': 600, text: '断电：磁性消失' }), eBody);
    emReadout(n);
  }
  function emReadout(n) {
    var s = strength(), level;
    if (s === 0) level = '没有磁性';
    else if (n === 0) level = '很弱';
    else if (n <= 4) level = '较弱';
    else if (n <= 9) level = '中等';
    else if (n <= 13) level = '较强';
    else level = '很强';
    L.$('#n-out').textContent = nT + ' 匝';
    L.$('#i-out').textContent = L.fmt(cur, 1) + ' A';
    L.$('#pin-out').innerHTML = n + '<small>枚</small>';
    L.$('#mag-out').textContent = level;
    L.$('#em-badge').textContent = s === 0 ? '断电 · 无磁性' : '通电 · 有磁性';
    var t;
    if (s === 0) t = '电流为 0，电磁铁<b>没有磁性</b>，一枚也吸不住。这正是电磁铁比永磁体好用的地方：磁性的有无，通断电就能控制。';
    else if (!core) t = '没有铁芯，线圈的磁性很弱，几乎吸不起大头针。插入铁芯后，铁芯被磁化，和线圈的磁场叠加，<b>磁性大大增强</b>。';
    else t = '匝数 ' + nT + ' 匝、电流 ' + L.fmt(cur, 1) + ' A，吸起 ' + n + ' 枚。匝数一定时，<b>电流越大磁性越强</b>；电流一定时，<b>匝数越多磁性越强</b>。磁性看不见，用吸起大头针的多少来反映，这叫转换法。';
    L.$('#em-text').innerHTML = t;
    save();
  }
  L.bindRange(nIn, function (v) { nT = v; drawEm(); });
  L.bindRange(iIn, function (v) { cur = Math.round(v * 10) / 10; drawEm(); });
  L.chips(L.$('#core-chips'), [{ label: '有铁芯', value: '1' }, { label: '无铁芯', value: '0' }], core ? '1' : '0', function (v) { core = v === '1'; drawEm(); });

  /* ========== 电磁继电器 ========== */
  var relay = L.$('#relay');
  var rBody = makeClip(relay, 'relay-clip', 400, 200);
  var rOn = st.r === '1';
  function drawRelay() {
    rBody.innerHTML = '';
    var wire = { fill: 'none', stroke: '#6f6880', 'stroke-width': 1.4, 'stroke-linejoin': 'round' };
    var PX = 70, PY = 95, LEN = 165, ang = rOn ? 0 : -6 * Math.PI / 180;
    function bar(d) { return [PX + d * Math.cos(ang), PY + d * Math.sin(ang)]; }
    var end = bar(LEN), sp = bar(32);
    // 工作电路（高压）
    S('path', Object.assign({ d: 'M' + PX + ' ' + PY + 'V24H360V172H235V110' }, wire), rBody);
    S('rect', { x: 340, y: 128, width: 40, height: 14, fill: '#fbfaf7' }, rBody);
    S('line', { x1: 346, y1: 129, x2: 374, y2: 129, stroke: '#4b425e', 'stroke-width': 2 }, rBody);
    S('line', { x1: 352, y1: 139, x2: 368, y2: 139, stroke: '#4b425e', 'stroke-width': 4 }, rBody);
    S('text', { x: 336, y: 138, 'font-size': 9.5, 'text-anchor': 'end', fill: '#8a8598', text: '工作电源' }, rBody);
    if (rOn) S('circle', { cx: 360, cy: 66, r: 20, fill: '#f8e3a0', opacity: 0.6 }, rBody);
    S('circle', { cx: 360, cy: 66, r: 11, fill: rOn ? '#f6cf5a' : '#f1efe9', stroke: '#8a8598', 'stroke-width': 1.3 }, rBody);
    S('path', { d: 'M353 66l4-4 3 4 3-4 4 4', fill: 'none', stroke: rOn ? '#b5651d' : '#a39cb3', 'stroke-width': 1.2 }, rBody);
    S('text', { x: 336, y: 70, 'font-size': 9.5, 'text-anchor': 'end', fill: '#8a8598', text: '电灯' }, rBody);
    S('text', { x: 300, y: 188, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#8a5a22', text: '工作电路' }, rBody);
    // 静触点
    S('rect', { x: 229, y: 100, width: 12, height: 10, rx: 2, fill: '#c9a873' }, rBody);
    S('text', { x: 246, y: 120, 'font-size': 9.5, fill: '#8a8598', text: '触点' }, rBody);
    // 电磁铁
    S('rect', { x: 125, y: 100, width: 20, height: 50, rx: 2, fill: '#8d8a96' }, rBody);
    for (var k = 0; k < 7; k++) S('line', { x1: 121, y1: 106 + k * 6.5 + 2, x2: 149, y2: 106 + k * 6.5 - 2, stroke: '#b8742e', 'stroke-width': 2 }, rBody);
    S('text', { x: 154, y: 136, 'font-size': 9.5, fill: '#5d586a', text: '电磁铁' }, rBody);
    // 控制电路（低压）
    S('path', Object.assign({ d: 'M128 150V182H136M146 182H152M172 182H178V160H142V150' }, wire), rBody);
    S('line', { x1: 136, y1: 175, x2: 136, y2: 189, stroke: '#4b425e', 'stroke-width': 2 }, rBody);
    S('line', { x1: 142, y1: 178, x2: 142, y2: 186, stroke: '#4b425e', 'stroke-width': 3.5 }, rBody);
    S('line', { x1: 142, y1: 182, x2: 146, y2: 182, stroke: '#6f6880', 'stroke-width': 1.4 }, rBody);
    S('circle', { cx: 152, cy: 182, r: 2, fill: '#4b425e' }, rBody);
    S('circle', { cx: 172, cy: 182, r: 2, fill: '#4b425e' }, rBody);
    S('line', { x1: 152, y1: 182, x2: rOn ? 172 : 168, y2: rOn ? 182 : 170, stroke: '#4b425e', 'stroke-width': 1.8, 'stroke-linecap': 'round' }, rBody);
    S('text', { x: 92, y: 186, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#5a4097', text: '控制电路' }, rBody);
    // 弹簧
    var zz = 'M' + sp[0].toFixed(1) + ' ' + sp[1].toFixed(1), top = 42, n = 8;
    for (k = 1; k <= n; k++) zz += 'L' + (sp[0] + (k % 2 ? 5 : -5)).toFixed(1) + ' ' + (sp[1] + (top - sp[1]) * k / (n + 1)).toFixed(1);
    zz += 'L' + sp[0].toFixed(1) + ' ' + top;
    S('path', { d: zz, fill: 'none', stroke: '#7a6aa8', 'stroke-width': 1.3 }, rBody);
    S('line', { x1: sp[0] - 12, y1: top, x2: sp[0] + 12, y2: top, stroke: '#a39cb3', 'stroke-width': 3 }, rBody);
    S('text', { x: sp[0] + 10, y: 62, 'font-size': 9.5, fill: '#8a8598', text: '弹簧' }, rBody);
    // 衔铁（绕支点转动）
    S('line', { x1: PX, y1: PY, x2: end[0], y2: end[1], stroke: '#8d8a96', 'stroke-width': 7 }, rBody);
    S('circle', { cx: end[0], cy: end[1] + 4, r: 3.5, fill: '#c9a873' }, rBody);
    S('circle', { cx: PX, cy: PY, r: 4, fill: '#fff', stroke: '#4b425e', 'stroke-width': 1.5 }, rBody);
    S('text', { x: 196, y: end[1] - 9, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#5d586a', text: '衔铁' }, rBody);
    if (rOn) S('text', halo({ x: 135, y: 92, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#c2603f', 'font-weight': 600, text: '吸下' }), rBody);
    L.$('#relay-text').innerHTML = rOn
      ? '控制电路一接通，电磁铁有了磁性，把<b>衔铁吸下来</b>，动触点和静触点接触，工作电路接通，电灯亮了。'
      : '控制电路断开，电磁铁没有磁性，<b>弹簧把衔铁拉起</b>，触点分开，工作电路断开，电灯不亮。人只接触低压的控制电路，更安全，还能实现远距离控制和自动控制。';
    save();
  }
  L.chips(L.$('#relay-chips'), [{ label: '断开', value: '0' }, { label: '闭合', value: '1' }], rOn ? '1' : '0', function (v) { rOn = v === '1'; drawRelay(); });

  /* ========== 电动机与发电机 ========== */
  var motor = L.$('#motor');
  var mBody = makeClip(motor, 'motor-clip', 400, 250);
  var mode = st.m === 'gen' ? 'gen' : 'motor';
  var curSign = st.ci === '-1' ? -1 : 1;
  var poleL = st.p !== 'R';                       // true：N 极在左
  var comm = st.cm !== '0';
  var spd = L.num(st.v, 1, 0, 3);
  var closed = st.lp !== '0';
  var theta = 0, omega = 0, running = false, s1 = 0, gi = 0, nudged = false;
  var spdIn = L.$('#spd-in'); spdIn.value = spd;

  function bSign() { return poleL ? 1 : -1; }
  function motorDir() { return -curSign * bSign(); }  // +1：θ 增大 = 俯视顺时针

  function drawMotor() {
    mBody.innerHTML = '';
    var b = bSign();
    // 磁体
    [[16, poleL ? 'N' : 'S'], [324, poleL ? 'S' : 'N']].forEach(function (m) {
      var isN = m[1] === 'N';
      S('rect', { x: m[0], y: 62, width: 60, height: 104, rx: 6, fill: isN ? '#e4a08b' : '#9fb8d8' }, mBody);
      S('text', { x: m[0] + 30, y: 123, 'font-size': 26, 'text-anchor': 'middle', fill: '#fff', 'font-weight': 700, text: m[1] }, mBody);
    });
    // 磁感线：N → S
    [78, 98, 118, 138, 156].forEach(function (y) {
      S('line', { x1: 78, y1: y, x2: 322, y2: y, stroke: '#b8b2c6', 'stroke-width': 1, 'stroke-dasharray': '4 4' }, mBody);
      head(mBody, b > 0 ? 112 : 108, y, b > 0 ? 0 : Math.PI, '#9b8cc4', 4.5);
      head(mBody, b > 0 ? 292 : 288, y, b > 0 ? 0 : Math.PI, '#9b8cc4', 4.5);
    });
    S('text', { x: 200, y: 26, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#8a8598', text: '虚线是磁感线：磁体外部从 N 极到 S 极' }, mBody);
    // 转轴
    S('line', { x1: 200, y1: 40, x2: 200, y2: 200, stroke: '#a39cb3', 'stroke-width': 3 }, mBody);
    // 线圈
    var R = 70, YT = 72, YB = 158, KZ = 0.2, c = Math.cos(theta), s = Math.sin(theta);
    var A = { x: 200 + R * c, z: R * s, n: 'ab' }, B = { x: 200 - R * c, z: -R * s, n: 'cd' };
    function pt(q, y) { return (q.x).toFixed(1) + ' ' + (y + KZ * q.z).toFixed(1); }
    S('path', { d: 'M' + pt(A, YT) + 'L' + pt(B, YT) + 'L' + pt(B, YB) + 'L' + pt(A, YB) + 'z', fill: '#e9c79a', 'fill-opacity': 0.22, stroke: 'none' }, mBody);
    var sides = A.z < B.z ? [A, B] : [B, A];
    var CU = '#b8742e';
    S('line', { x1: A.x, y1: YT + KZ * A.z, x2: B.x, y2: YT + KZ * B.z, stroke: CU, 'stroke-width': 2.6 }, mBody);
    S('line', { x1: A.x, y1: YB + KZ * A.z, x2: B.x, y2: YB + KZ * B.z, stroke: CU, 'stroke-width': 2.6 }, mBody);
    var iA = mode === 'motor' ? s1 : (Math.abs(gi) > 0.06 ? (gi > 0 ? 1 : -1) : 0);
    sides.forEach(function (q, k) {
      var front = k === 1;
      S('line', { x1: q.x, y1: YT + KZ * q.z, x2: q.x, y2: YB + KZ * q.z, stroke: CU, 'stroke-width': front ? 4 : 2.6, opacity: front ? 1 : 0.75 }, mBody);
      var mid = (YT + YB) / 2 + KZ * q.z, up = (q === A ? iA : -iA);
      if (up) L.arrow(mBody, q.x + 9, mid + up * 13, q.x + 9, mid - up * 13, { color: '#c2603f', width: 1.8, head: 7 });
      S('text', halo({ x: q.x, y: YT + KZ * q.z - 6, 'font-size': 10, 'text-anchor': 'middle', fill: '#8a5a22', 'font-weight': 600, text: q.n }), mBody);
    });
    // 换向器 / 滑环 与电刷
    var useComm = mode === 'motor' && comm;
    S('path', { d: 'M196 ' + YB + 'L196 176M204 ' + YB + 'L204 ' + (useComm ? 176 : 188), stroke: CU, 'stroke-width': 1.5, fill: 'none' }, mBody);
    var wire = { fill: 'none', stroke: '#6f6880', 'stroke-width': 1.5, 'stroke-linejoin': 'round' };
    var yR = useComm ? 182 : 192;
    if (useComm) {
      S('ellipse', { cx: 200, cy: 182, rx: 13, ry: 6, fill: '#d9a35f', stroke: '#8a5a22', 'stroke-width': 1 }, mBody);
      var gx = 200 + 12 * Math.sin(theta);
      S('line', { x1: gx, y1: 176.5, x2: gx, y2: 187.5, stroke: '#fbfaf7', 'stroke-width': 2 }, mBody);
      S('text', { x: 232, y: 172, 'font-size': 9.5, fill: '#8a5a22', text: '换向器' }, mBody);
    } else {
      S('ellipse', { cx: 200, cy: 179, rx: 12, ry: 4.5, fill: '#d9a35f', stroke: '#8a5a22', 'stroke-width': 1 }, mBody);
      S('ellipse', { cx: 200, cy: 192, rx: 12, ry: 4.5, fill: '#d9a35f', stroke: '#8a5a22', 'stroke-width': 1 }, mBody);
      S('text', { x: 232, y: 172, 'font-size': 9.5, fill: '#8a5a22', text: '两个滑环' }, mBody);
    }
    S('rect', { x: 176, y: 176, width: 10, height: 8, fill: '#5d586a' }, mBody);
    S('rect', { x: 213, y: yR - 4, width: 10, height: 8, fill: '#5d586a' }, mBody);
    S('text', { x: 150, y: 172, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#8a8598', text: '电刷' }, mBody);
    S('path', Object.assign({ d: 'M176 180H150V228H182' }, wire), mBody);
    if (mode === 'gen' && !closed) {
      S('path', Object.assign({ d: 'M223 ' + yR + 'H250V200M250 214V228H218' }, wire), mBody);
      S('circle', { cx: 250, cy: 200, r: 2, fill: '#4b425e' }, mBody);
      S('circle', { cx: 250, cy: 214, r: 2, fill: '#4b425e' }, mBody);
      S('line', { x1: 250, y1: 214, x2: 261, y2: 203, stroke: '#4b425e', 'stroke-width': 1.8, 'stroke-linecap': 'round' }, mBody);
      S('text', { x: 266, y: 212, 'font-size': 9.5, fill: '#a4492b', text: '断开' }, mBody);
    } else {
      S('path', Object.assign({ d: 'M223 ' + yR + 'H250V228H218' }, wire), mBody);
    }
    if (mode === 'motor') {
      var pl = curSign > 0;
      S('rect', { x: 182, y: 218, width: 36, height: 20, fill: '#fbfaf7' }, mBody);
      S('line', { x1: 182, y1: 228, x2: 194, y2: 228, stroke: '#6f6880', 'stroke-width': 1.5 }, mBody);
      S('line', { x1: 206, y1: 228, x2: 218, y2: 228, stroke: '#6f6880', 'stroke-width': 1.5 }, mBody);
      S('line', { x1: pl ? 194 : 206, y1: 218, x2: pl ? 194 : 206, y2: 238, stroke: '#4b425e', 'stroke-width': 2 }, mBody);
      S('line', { x1: pl ? 206 : 194, y1: 223, x2: pl ? 206 : 194, y2: 233, stroke: '#4b425e', 'stroke-width': 4 }, mBody);
      S('text', { x: pl ? 188 : 212, y: 215, 'font-size': 10, 'text-anchor': 'middle', fill: '#a4492b', 'font-weight': 700, text: '+' }, mBody);
      S('text', { x: 200, y: 248, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#8a8598', text: running ? '电源（已接通）' : '电源（未接通）' }, mBody);
    } else {
      S('circle', { cx: 200, cy: 228, r: 17, fill: '#fff', stroke: '#6f6880', 'stroke-width': 1.5 }, mBody);
      for (var t = -5; t <= 5; t++) {
        var ta = (t * 10 - 90) * Math.PI / 180;
        S('line', { x1: 200 + 11 * Math.cos(ta), y1: 236 + 11 * Math.sin(ta), x2: 200 + (t % 5 ? 13 : 15) * Math.cos(ta), y2: 236 + (t % 5 ? 13 : 15) * Math.sin(ta), stroke: '#8a8598', 'stroke-width': 0.8 }, mBody);
      }
      var na = (L.clamp(gi, -1, 1) * 50 - 90) * Math.PI / 180;
      S('line', { x1: 200, y1: 236, x2: 200 + 14 * Math.cos(na), y2: 236 + 14 * Math.sin(na), stroke: '#c2603f', 'stroke-width': 1.6, 'stroke-linecap': 'round' }, mBody);
      S('circle', { cx: 200, cy: 236, r: 1.8, fill: '#4b425e' }, mBody);
      S('text', { x: 224, y: 246, 'font-size': 9.5, fill: '#8a8598', text: '电流表（零刻度在中间）' }, mBody);
    }
    // 俯视小图
    var IX = 70, IY = 212, IR = 22;
    S('rect', { x: 6, y: 174, width: 128, height: 70, rx: 9, fill: '#fff', stroke: '#e0dbe8' }, mBody);
    S('text', { x: 12, y: 186, 'font-size': 9, fill: '#8a8598', text: '俯视图' }, mBody);
    S('text', { x: 20, y: 216, 'font-size': 11, 'text-anchor': 'middle', fill: poleL ? '#c2603f' : '#5a7aa6', 'font-weight': 700, text: poleL ? 'N' : 'S' }, mBody);
    S('text', { x: 120, y: 216, 'font-size': 11, 'text-anchor': 'middle', fill: poleL ? '#5a7aa6' : '#c2603f', 'font-weight': 700, text: poleL ? 'S' : 'N' }, mBody);
    S('circle', { cx: IX, cy: IY, r: IR, fill: 'none', stroke: '#d9d4e2', 'stroke-dasharray': '2 3' }, mBody);
    var ax = IX + IR * c, ay = IY + IR * s, bx = IX - IR * c, by = IY - IR * s;
    S('line', { x1: ax, y1: ay, x2: bx, y2: by, stroke: CU, 'stroke-width': 2.4 }, mBody);
    S('circle', { cx: ax, cy: ay, r: 2.6, fill: CU }, mBody);
    S('text', { x: ax + (c >= 0 ? 4 : -4), y: ay + (s >= 0 ? 10 : -4), 'font-size': 9, 'text-anchor': c >= 0 ? 'start' : 'end', fill: '#8a5a22', text: 'ab' }, mBody);
    if (mode === 'motor' && s1) {
      var fy = -s1 * b * 13;
      L.arrow(mBody, ax, ay, ax, ay + fy, { color: '#5a4097', width: 1.6, head: 6 });
      L.arrow(mBody, bx, by, bx, by - fy, { color: '#5a4097', width: 1.6, head: 6 });
      S('text', { x: 130, y: 240, 'font-size': 9, 'text-anchor': 'end', fill: '#5a4097', text: '紫色箭头：受力' }, mBody);
    }
  }

  var mLoop = null;
  function step(dt) {
    var b = bSign();
    if (mode === 'motor') {
      s1 = running ? (comm ? curSign * (Math.cos(theta) >= 0 ? 1 : -1) : curSign) : 0;
      var acc = -40 * s1 * b * Math.cos(theta) - 3.5 * omega;
      omega += acc * dt; theta = (theta + omega * dt) % (2 * Math.PI);
      gi = 0;
      return Math.abs(omega) > 0.004 || Math.abs(acc) > 0.02;
    }
    s1 = 0;
    var target = running ? 2 * Math.PI * spd : 0;
    omega += (target - omega) * Math.min(1, dt * 4);
    if (!running && Math.abs(omega) < 0.01) omega = 0;
    theta = (theta + omega * dt) % (2 * Math.PI);
    gi = closed ? omega / (6 * Math.PI) * Math.cos(theta) * b : 0;
    return running || omega !== 0;
  }
  function tick(dt) {
    var busy = step(dt);
    drawMotor();
    needleText();
    return busy;
  }
  function needleText() {
    if (mode === 'gen') L.$('#mg-dir').textContent = Math.abs(gi) < 0.02 ? '不偏转' : (gi > 0 ? '偏右 ' : '偏左 ') + L.fmt(Math.abs(gi) * 5, 1) + ' 格';
  }
  function ensureLoop() {
    if (L.REDUCED) {
      // 减少动态效果：不转动，只把此刻的受力 / 电流画出来
      if (mode === 'gen' && running && spd > 0) { theta = 0; omega = 2 * Math.PI * spd; gi = closed ? spd / 3 * bSign() : 0; s1 = 0; drawMotor(); }
      else { step(0); drawMotor(); }
      needleText();
      return;
    }
    if (mLoop) return;
    mLoop = L.loop(function (dt) {
      if (!tick(dt)) { mLoop = null; return false; }
    });
  }

  function mgReadout() {
    var gen = mode === 'gen';
    L.$('#motor-ctl').hidden = gen;
    L.$('#gen-ctl').hidden = !gen;
    L.$('#run-btn').textContent = gen ? (running ? '停止摇动' : '开始摇动') : (running ? '断开电源' : '接通电源');
    L.$('#mg-badge').textContent = gen ? '发电机' : '电动机';
    L.$('#mg-energy').textContent = gen ? '机械能 → 电能' : '电能 → 机械能';
    L.$('#mg-k').textContent = gen ? '电流表指针' : '转动方向（俯视）';
    L.$('#mg-why').textContent = gen ? '电磁感应：切割磁感线产生感应电流' : '通电线圈在磁场中受力转动';
    L.$('#spd-out').textContent = L.fmt(spd, 1) + ' 圈/秒';
    var t;
    if (!gen) {
      var d = motorDir() > 0 ? '顺时针' : '逆时针';
      L.$('#mg-dir').textContent = !running ? '未通电' : (comm ? d : '摆几下就停');
      if (!running) t = '还没通电，线圈不受力。接通电源后，ab 边和 cd 边电流方向相反，受力方向也相反，线圈就会转起来。';
      else if (comm) t = '线圈俯视' + d + '转动。每当它刚转过平衡位置（线圈平面与磁感线垂直），换向器就把电流反向，受力也反向，于是能<b>一直朝一个方向转</b>。只改电流方向或只对调磁极，转向就反过来；两个都改，转向不变。' + (nudged ? ' 刚才线圈正好停在平衡位置，受力在一条直线上转不起来，模型替你“拨了一下”。' : '');
      else t = '去掉换向器，线圈转过平衡位置后，受力反过来把它往回拉，于是<b>来回摆几下，停在平衡位置</b>。所以直流电动机必须有换向器。';
    } else {
      if (!running || spd === 0) { t = '线圈不动，没有切割磁感线，就没有感应电流，指针停在中间。'; if (!running) L.$('#mg-dir').textContent = '不偏转'; }
      else if (!closed) t = '线圈在转，ab、cd 两边也在切割磁感线，但<b>电路断开</b>，形成不了电流，指针不动。产生感应电流要求<b>闭合电路</b>的一部分导体切割磁感线。';
      else t = '线圈转一圈，ab 边一会儿向前、一会儿向后切割磁感线，电流方向改变两次，指针<b>左右摆动</b>，这种电流叫交变电流。转得越快，摆得越大。我国电网的交流电频率是 50 Hz，电流方向每秒改变 100 次。';
    }
    L.$('#mg-text').innerHTML = t;
    save();
  }
  function changed() { mgReadout(); ensureLoop(); }
  L.chips(L.$('#mode-chips'), [{ label: '电动机', value: 'motor' }, { label: '发电机', value: 'gen' }], mode, function (v) { mode = v; running = false; omega = 0; s1 = 0; gi = 0; nudged = false; changed(); });
  L.chips(L.$('#pole-chips'), [{ label: '左 N 右 S', value: 'L' }, { label: '左 S 右 N', value: 'R' }], poleL ? 'L' : 'R', function (v) { poleL = v === 'L'; changed(); });
  L.chips(L.$('#cur-chips'), [{ label: '正向', value: '1' }, { label: '反向', value: '-1' }], String(curSign), function (v) { curSign = +v; changed(); });
  L.chips(L.$('#comm-chips'), [{ label: '有', value: '1' }, { label: '无', value: '0' }], comm ? '1' : '0', function (v) { comm = v === '1'; changed(); });
  L.chips(L.$('#loop-chips'), [{ label: '闭合', value: '1' }, { label: '断开', value: '0' }], closed ? '1' : '0', function (v) { closed = v === '1'; changed(); });
  L.bindRange(spdIn, function (v) { spd = v; changed(); });
  L.$('#run-btn').addEventListener('click', function () {
    running = !running;
    nudged = false;
    if (running && mode === 'motor' && comm && Math.abs(Math.cos(theta)) < 0.06 && Math.abs(omega) < 0.05) { theta += 0.3 * motorDir(); nudged = true; }
    changed();
  });
  L.$('#reset-btn').addEventListener('click', function () { running = false; theta = 0; omega = 0; s1 = 0; gi = 0; nudged = false; changed(); drawMotor(); });

  function save() {
    L.setState({ d: dir, w: wind, s: on ? 1 : 0, ln: showLines ? 1 : 0, n: nT, i: cur, c: core ? 1 : 0, r: rOn ? 1 : 0, m: mode, ci: curSign, p: poleL ? 'L' : 'R', cm: comm ? 1 : 0, v: spd, lp: closed ? 1 : 0 });
  }

  drawCoil(true);
  drawEm();
  drawRelay();
  mgReadout();
  drawMotor();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '让螺线管的右端变成 N 极',
      desc: '在第一张图里改电流方向或绕法，让通电螺线管的<b>右端</b>成为 N 极。',
      label: '在通电螺线管里操作',
      button: '检查磁极',
      check: function () {
        if (!on) return { ok: false, msg: '开关还断开着，螺线管没有电流，也就没有磁极。先把开关闭合。' };
        if (nLeft()) return { ok: false, msg: '现在 N 极在左端。电流方向和绕法，<b>只改其中一个</b>，N 极就会换到另一端。' };
        return { ok: true, msg: '右手握住螺线管，四指顺着正面导线里向下的电流，大拇指指向右端，右端就是 N 极。右边小磁针的 N 极也被“推”向了右方。' };
      }
    },
    {
      level: 'base',
      title: '最早发现“电流周围存在磁场”的科学家是',
      desc: '他把导线平行放在小磁针上方，一通电，小磁针就偏转了。',
      options: ['奥斯特', '法拉第', '安培', '欧姆'],
      answer: 0,
      hint: '这是“电生磁”，不是“磁生电”。',
      explain: '1820 年<b>奥斯特</b>发现电流的磁效应。法拉第发现的是电磁感应（磁生电），安培总结了通电螺线管的极性规律（安培定则），欧姆研究的是电流与电压、电阻的关系。'
    },
    {
      level: 'base',
      title: '关于地磁场，下列说法正确的是',
      desc: '想一想：指南针的 N 极为什么指向地理北方？',
      options: ['地磁北极在地理南极附近', '地磁北极在地理北极附近', '地磁两极和地理两极完全重合', '地球周围的磁感线是真实存在的'],
      answer: 0,
      hint: '异名磁极相互吸引。指南针的 N 极被吸向的那一端，应该是地磁的什么极？',
      explain: '指南针 N 极指北，说明地理北极附近是<b>地磁南极</b>，反过来地磁北极在地理南极附近。两组极并不重合，有磁偏角；磁感线是假想的，不是真实存在的。'
    },
    {
      level: 'mid',
      title: '让电磁铁吸起至少 12 枚大头针',
      desc: '调匝数、电流和铁芯。想一想：哪几个因素要一起用上？',
      label: '在电磁铁里操作',
      button: '数一数大头针',
      check: function () {
        var n = pins();
        if (n >= 12) return { ok: true, msg: '吸起了 ' + n + ' 枚。有铁芯、匝数多、电流大，三个条件一起用上，磁性才够强。' };
        if (!core) return { ok: false, msg: '没有铁芯时磁性很弱。先把<b>铁芯</b>插进去。' };
        if (cur === 0) return { ok: false, msg: '电流是 0，电磁铁没有磁性。把电流调大。' };
        if (nT < 200) return { ok: false, msg: '现在只吸起 ' + n + ' 枚。光靠调电流还不够，把<b>线圈匝数</b>也加上去。' };
        return { ok: false, msg: '现在吸起 ' + n + ' 枚，匝数已经最多了，再把<b>电流</b>调大一些。' };
      }
    },
    {
      level: 'mid',
      title: '让电动机的线圈俯视顺时针一直转',
      desc: '在“电动机”模式下接通电源，让线圈<b>俯视时顺时针</b>持续转动（看右下角的读数或左下角的俯视图）。',
      label: '在电动机里操作',
      button: '检查转向',
      check: function () {
        if (mode !== 'motor') return { ok: false, msg: '先把模式切换到“电动机”。' };
        if (!running) return { ok: false, msg: '还没接通电源，线圈不受力。点“接通电源”。' };
        if (!comm) return { ok: false, msg: '没有换向器，线圈只会摆几下就停在平衡位置，不能一直转。把换向器装上。' };
        if (motorDir() < 0) return { ok: false, msg: '现在是逆时针。改变<b>电流方向</b>或<b>对调磁极</b>中的一个，转向就会反过来。两个都改等于没改。' };
        return { ok: true, msg: '顺时针转起来了。电动机的转向由电流方向和磁场方向共同决定，改变其中一个，转向就反过来。' };
      }
    },
    {
      level: 'mid',
      title: '下列设备中，利用电磁感应原理工作的是',
      desc: '对着它说话，声音让膜片带着线圈在磁场中振动，线圈里就产生随声音变化的电流。',
      options: ['动圈式话筒', '电动机', '电磁起重机', '扬声器'],
      answer: 0,
      hint: '电磁感应是“动 → 电”：有运动，产生了电流。',
      explain: '<b>动圈式话筒</b>是线圈在磁场中运动产生感应电流，属于电磁感应。电动机和扬声器是通电线圈在磁场中受力（“电 → 动”）；电磁起重机利用的是电流的磁效应。'
    },
    {
      level: 'trap',
      title: '关于磁感线，下列说法正确的是',
      desc: '撒铁屑能看到磁场的分布，但这和“磁感线”是不是一回事？',
      options: ['磁感线是为了描述磁场而假想的曲线', '磁感线就是铁屑排成的那些真实的线', '磁体内部的磁感线也是从 N 极到 S 极', '磁感线越密的地方磁场越弱'],
      answer: 0,
      hint: '磁场是真实存在的，磁感线呢？',
      explain: '磁场真实存在，但<b>磁感线是人们为了形象描述磁场而画出的假想曲线</b>。铁屑只是显示了磁场的分布；磁体外部磁感线从 N 极到 S 极，内部则从 S 极回到 N 极，形成闭合曲线；磁感线越密，磁场越强。'
    },
    {
      level: 'trap',
      title: '闭合电路中的一段导体在磁场中运动，一定会产生感应电流吗？',
      desc: '可以在“发电机”模式里试试断开电路、或者让转速为 0。',
      options: ['不一定，要做切割磁感线运动才行', '一定会，只要导体在磁场中运动', '一定会，只要磁场足够强', '不会，导体必须静止才行'],
      answer: 0,
      hint: '导体顺着磁感线方向移动时，有没有“切”到磁感线？',
      explain: '条件有两个：<b>电路闭合</b>，且导体做<b>切割磁感线</b>运动。如果导体沿着磁感线的方向运动，没有切割，就不会产生感应电流；磁场再强也一样。'
    }
  ]);
})();
