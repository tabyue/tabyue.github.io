/* 物理互动馆 · 第 12 课 简单机械 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();
  // 每个钩码 50 g，g 取 10 N/kg，重 0.5 N；杠杆上相邻两格相距 5 cm

  function clipDefs(el, id, w, h) {
    var defs = S('defs', {}, el), cp = S('clipPath', { id: id }, defs);
    S('rect', { x: 0, y: 0, width: w, height: h, rx: 14 }, cp);
    return defs;
  }
  function setText(el, h) { if (el._t !== h) { el._t = h; el.innerHTML = h; } }
  // 从 (x, y) 往下挂 n 个钩码
  function masses(g, x, y, n) {
    if (n <= 0) return;
    S('line', { x1: x, y1: y, x2: x, y2: y + 9, stroke: '#6b6478', 'stroke-width': 1.2 }, g);
    for (var k = 0; k < n; k++) {
      S('rect', { x: x - 8, y: y + 9 + k * 11, width: 16, height: 10, rx: 2, fill: '#b9a8c9', stroke: '#5b5568', 'stroke-width': 1 }, g);
    }
  }

  /* ========== ① 杠杆的平衡条件 ========== */
  var HOOK = 0.5, CM = 5, MAXA = 12;          // 钩码重 0.5 N，一格 5 cm，不平衡时转到 12° 的挡块
  var lc = Math.round(L.num(st.lc, 2, 0, 6)), lp = Math.round(L.num(st.lp, 3, 1, 6));
  var rc = Math.round(L.num(st.rc, 3, 0, 6)), rp = Math.round(L.num(st.rp, 2, 1, 6));
  var nut = Math.round(L.num(st.k, 0, -2, 2));
  var lever = L.$('#lever'), leverDefs = clipDefs(lever, 'lever-clip', 400, 250);
  var CX = 200, CY = 96, GP = 28;              // 支点、每格 28 px
  var ang = 0, levAnim = null;

  // 以“一个钩码挂在第 1 格”= 0.5 N × 0.05 m = 0.025 N·m 为单位，用整数比较，避免小数误差
  function q1() { return lc * lp; }
  function q2() { return rc * rp; }
  function net() { return q2() - q1() + nut; }   // 正：右端重；螺母每偏一档相当于一个单位
  function target() { var n = net(); return n === 0 ? 0 : (n > 0 ? MAXA : -MAXA); }
  function balanced() { return net() === 0; }

  function drawLever() {
    lever.innerHTML = ''; lever.appendChild(leverDefs);
    S('rect', { x: 0, y: 0, width: 400, height: 250, rx: 14, fill: '#fbfaf7' }, lever);
    var g = S('g', { 'clip-path': 'url(#lever-clip)' }, lever);
    S('rect', { x: 0, y: 238, width: 400, height: 12, fill: '#e8e1d3' }, g);
    S('rect', { x: 150, y: 230, width: 100, height: 8, rx: 2, fill: '#cfc9da' }, g);
    S('rect', { x: CX - 3, y: CY, width: 6, height: 230 - CY, fill: '#a39cb3' }, g);
    S('line', { x1: 14, y1: CY, x2: 386, y2: CY, stroke: '#c9c3d6', 'stroke-dasharray': '4 4' }, g);
    // 杠杆整体绕支点转
    var bar = S('g', { transform: 'rotate(' + ang.toFixed(2) + ' ' + CX + ' ' + CY + ')' }, g);
    S('line', { x1: CX - 196, y1: CY, x2: CX + 196, y2: CY, stroke: '#8a8598', 'stroke-width': 2 }, bar);
    S('rect', { x: CX - 172, y: CY - 5, width: 344, height: 10, rx: 3, fill: '#efe6d2', stroke: '#b59c6e', 'stroke-width': 1.2 }, bar);
    for (var i = -6; i <= 6; i++) {
      var x = CX + i * GP;
      S('circle', { cx: x, cy: CY, r: i === 0 ? 4 : 2.2, fill: i === 0 ? '#5a4097' : '#b59c6e' }, bar);
      if (i !== 0) S('text', { x: x, y: CY - 9, 'font-size': 9, 'text-anchor': 'middle', fill: '#8a7a58', text: Math.abs(i) }, bar);
    }
    [-1, 1].forEach(function (s) {
      S('rect', { x: CX + s * 181 + nut * 4 - 4, y: CY - 6, width: 8, height: 12, rx: 1.5, fill: nut === 0 ? '#7a6aa8' : '#c2603f' }, bar);
    });
    S('text', { x: CX, y: CY + 20, 'font-size': 9, 'text-anchor': 'middle', fill: '#5a4097', text: '支点 O' }, g);
    // 钩码竖直挂在挂点下面
    var c = Math.cos(ang * Math.PI / 180), sn = Math.sin(ang * Math.PI / 180);
    function hookPt(lx) { return [CX + lx * c - 5 * sn, CY + lx * sn + 5 * c]; }
    if (lc > 0) { var pL = hookPt(-lp * GP); masses(g, pL[0], pL[1], lc); }
    if (rc > 0) { var pR = hookPt(rp * GP); masses(g, pR[0], pR[1], rc); }
    S('text', { x: 14, y: 22, 'font-size': 10, fill: '#5a4097', 'font-weight': 600, text: 'F₁ = ' + L.fmt(lc * HOOK, 1) + ' N' }, g);
    S('text', { x: 386, y: 22, 'font-size': 10, 'text-anchor': 'end', fill: '#5a4097', 'font-weight': 600, text: 'F₂ = ' + L.fmt(rc * HOOK, 1) + ' N' }, g);
    var n = net(), done = Math.abs(ang - target()) < 0.01;
    S('text', { x: CX, y: 22, 'font-size': 11, 'text-anchor': 'middle', fill: n === 0 ? '#3f8a6a' : '#c2603f', 'font-weight': 600, text: !done ? '转动中…' : (n === 0 ? '水平平衡' : (n > 0 ? '右端下沉' : '左端下沉')) }, g);
  }

  function settle() {
    var tg = target();
    if (levAnim) { levAnim.stop(); levAnim = null; }
    if (L.REDUCED || Math.abs(tg - ang) < 0.01) { ang = tg; drawLever(); return; }
    levAnim = L.loop(function (dt) {
      var d = tg - ang, step = 45 * dt;
      if (Math.abs(d) <= step) { ang = tg; levAnim = null; drawLever(); return false; }
      ang += d > 0 ? step : -step;
      drawLever();
    });
  }

  var NUT_NAME = ['偏左 2 档', '偏左 1 档', '在中间', '偏右 1 档', '偏右 2 档'];
  function readLever() {
    var n = net(), tg = target(), tilt = tg !== 0, cs = Math.cos(tg * Math.PI / 180);
    var F1 = lc * HOOK, F2 = rc * HOOK, l1 = lp * CM, l2 = rp * CM, k = tilt ? cs : 1;
    L.$('#nut-out').textContent = NUT_NAME[nut + 2];
    L.$('#lc-out').textContent = lc + ' 个';
    L.$('#rc-out').textContent = rc + ' 个';
    L.$('#lp-out').textContent = '第 ' + lp + ' 格';
    L.$('#rp-out').textContent = '第 ' + rp + ' 格';
    L.$('#lv-badge').textContent = n === 0 ? '水平平衡' : (n > 0 ? '右端下沉' : '左端下沉');
    function arm(l, has) {
      if (!has) return '—';
      return tilt ? '≈' + L.fmt(l * cs, 1) + '<small>cm（歪了）</small>' : L.qty(l, 'cm', 0);
    }
    L.$('#lv-F1').innerHTML = L.qty(F1, 'N', 1);
    L.$('#lv-F2').innerHTML = L.qty(F2, 'N', 1);
    L.$('#lv-L1').innerHTML = arm(l1, lc > 0);
    L.$('#lv-L2').innerHTML = arm(l2, rc > 0);
    L.$('#lv-M1').innerHTML = L.qty(F1 * l1 * k / 100, 'N·m', 3);
    L.$('#lv-M2').innerHTML = L.qty(F2 * l2 * k / 100, 'N·m', 3);
    var t, empty = lc + rc === 0;
    if (nut !== 0 && empty) {
      t = '还没挂钩码，杠杆自己就' + (n > 0 ? '右' : '左') + '端下沉了，说明平衡螺母没调好。螺母要往<b>翘起来的那一端</b>拧：' + (n > 0 ? '右低左调，向左拧' : '左低右调，向右拧') + '，直到杠杆在水平位置静止。';
    } else if (nut !== 0) {
      t = '平衡螺母不在中间，杠杆自己就不平衡，这时比较 F₁l₁ 和 F₂l₂ 会得出错误结论。应该先把钩码都取下（个数调成 0），调好螺母再挂。<b>挂上钩码以后不能再拧螺母。</b>';
    } else if (empty) {
      t = '杠杆已经在水平位置平衡，可以开始实验了。在两边挂上钩码试试。';
    } else if (n === 0) {
      t = 'F₁l₁ = F₂l₂ = ' + L.fmt(F1 * l1 / 100, 3) + ' N·m，杠杆在水平位置平衡。钩码的拉力竖直向下，正好和水平的杠杆垂直，力臂就等于“格数 × 5 cm”，<b>能从刻度上直接读出来</b>，这就是实验前要先调到水平平衡的原因。';
    } else {
      var heavy = n > 0 ? '右边' : '左边', light = n > 0 ? '左边' : '右边';
      t = 'F₁l₁ ' + (n > 0 ? '&lt;' : '&gt;') + ' F₂l₂，' + heavy.charAt(0) + '端下沉。杠杆一歪，钩码的拉力还是竖直向下，力臂变成支点到竖直挂线的距离，比刻度上读到的短，<b>没法直接读</b>。';
      if ((n > 0 && lc === 0) || (n < 0 && rc === 0)) t += light + '一个钩码也没挂，先挂上几个。';
      else t += '想让它平衡：' + light + '多挂钩码或往外挪，或者把' + heavy + '的钩码往里挪。';
    }
    setText(L.$('#lv-text'), t);
    save();
  }
  function leverChanged() { settle(); readLever(); }
  var nutIn = L.$('#nut-in'), lcIn = L.$('#lc-in'), lpIn = L.$('#lp-in'), rcIn = L.$('#rc-in'), rpIn = L.$('#rp-in');
  nutIn.value = nut; lcIn.value = lc; lpIn.value = lp; rcIn.value = rc; rpIn.value = rp;
  L.bindRange(nutIn, function (v) { nut = v; leverChanged(); });
  L.bindRange(lcIn, function (v) { lc = v; leverChanged(); });
  L.bindRange(lpIn, function (v) { lp = v; leverChanged(); });
  L.bindRange(rcIn, function (v) { rc = v; leverChanged(); });
  L.bindRange(rpIn, function (v) { rp = v; leverChanged(); });
  function setLever(o) {
    if ('k' in o) { nut = o.k; nutIn.value = nut; L.paintRange(nutIn); }
    if ('lc' in o) { lc = o.lc; lcIn.value = lc; L.paintRange(lcIn); }
    if ('rc' in o) { rc = o.rc; rcIn.value = rc; L.paintRange(rcIn); }
    leverChanged();
  }

  // 实验记录表
  var recs = [];
  function drawRecs() {
    var tb = L.$('#rec-body');
    tb.innerHTML = '';
    if (!recs.length) { L.html('tr', { html: '<td colspan="5" style="color:var(--muted)">还没有记录</td>' }, tb); return; }
    recs.forEach(function (r, i) {
      L.html('tr', { html: '<td>' + (i + 1) + '</td><td class="n">' + L.fmt(r[0], 1) + '</td><td class="n">' + r[1] + '</td><td class="n">' + L.fmt(r[2], 1) + '</td><td class="n">' + r[3] + '</td>' }, tb);
    });
  }
  L.$('#rec-add').addEventListener('click', function () {
    var msg = L.$('#rec-msg'), t;
    if (nut !== 0) t = '平衡螺母还没调好，这组数据不能用。';
    else if (lc === 0 || rc === 0) t = '两边都要挂上钩码再记录。';
    else if (!balanced()) t = '杠杆还没在水平位置平衡，现在记下来的数据没有意义。';
    else {
      var r = [lc * HOOK, lp * CM, rc * HOOK, rp * CM];
      var dup = recs.some(function (x) { return x.join() === r.join(); });
      if (dup) t = '这一组已经记过了，换一组不同的钩码个数或位置。';
      else {
        recs.push(r);
        if (recs.length > 5) recs.shift();
        t = recs.length < 3 ? '已经记了 ' + recs.length + ' 组，再换几组不同的数据。'
          : '已有 ' + recs.length + ' 组：每一组都满足 <b>F₁ × l₁ = F₂ × l₂</b>。换不同的数据多做几次，得到的结论才有普遍性，不是碰巧。';
      }
    }
    msg.innerHTML = t;
    drawRecs();
  });
  L.$('#rec-clear').addEventListener('click', function () { recs = []; L.$('#rec-msg').textContent = ''; drawRecs(); });

  /* ========== ② 力臂 ========== */
  var armSvg = L.$('#arm'), armDefs = clipDefs(armSvg, 'arm-clip', 400, 230);
  var OX = 170, OY = 100, GP2 = 24, F2A = 2, L2A = 15;   // 阻力：4 个钩码共 2 N，挂在左边第 3 格（15 cm）
  var SCL = 84;                                          // 测力计从挂点到拉环的长度（px）
  var pos = [3, 4, 6].indexOf(+st.p) >= 0 ? +st.p : 4;
  var tht = Math.round(L.num(st.t, 0, -60, 60));         // 偏离竖直向下的角度，正：向外歪，负：向支点歪

  function l1() { return pos * CM * Math.cos(tht * Math.PI / 180); }
  function F1() { return F2A * L2A / l1(); }
  function kind() { var d = l1() - L2A; return Math.abs(d) < 0.05 ? 'eq' : (d > 0 ? 'save' : 'cost'); }

  function drawArm() {
    armSvg.innerHTML = ''; armSvg.appendChild(armDefs);
    S('rect', { x: 0, y: 0, width: 400, height: 230, rx: 14, fill: '#fbfaf7' }, armSvg);
    var g = S('g', { 'clip-path': 'url(#arm-clip)' }, armSvg);
    S('rect', { x: 0, y: 222, width: 400, height: 8, fill: '#e8e1d3' }, g);
    S('rect', { x: OX - 40, y: 214, width: 80, height: 8, rx: 2, fill: '#cfc9da' }, g);
    S('rect', { x: OX - 3, y: OY, width: 6, height: 214 - OY, fill: '#a39cb3' }, g);
    var px = OX + pos * GP2, py = OY;
    var a = tht * Math.PI / 180, dx = Math.sin(a), dy = Math.cos(a);
    // 杠杆
    S('rect', { x: OX - 152, y: OY - 5, width: 304, height: 10, rx: 3, fill: '#efe6d2', stroke: '#b59c6e', 'stroke-width': 1.2 }, g);
    for (var i = -6; i <= 6; i++) {
      var x = OX + i * GP2;
      S('circle', { cx: x, cy: OY, r: i === 0 ? 4 : 2.2, fill: i === 0 ? '#5a4097' : '#b59c6e' }, g);
      if (i !== 0 && i !== -3 && i !== pos) S('text', { x: x, y: OY + 17, 'font-size': 9, 'text-anchor': 'middle', fill: '#8a7a58', text: Math.abs(i) }, g);
    }
    S('text', { x: OX - 8, y: OY + 17, 'font-size': 9, 'text-anchor': 'end', fill: '#5a4097', text: 'O' }, g);
    // 阻力：钩码和阻力臂
    var hx = OX - 3 * GP2;
    masses(g, hx, OY + 5, 4);
    S('text', { x: hx - 12, y: OY + 34, 'font-size': 10, 'text-anchor': 'end', fill: '#3f8a6a', 'font-weight': 600, text: 'F₂' }, g);
    var by = OY - 20;
    S('path', { d: 'M' + hx + ' ' + (by - 4) + 'V' + (by + 4) + 'M' + hx + ' ' + by + 'H' + OX + 'M' + OX + ' ' + (by - 4) + 'V' + (by + 4), fill: 'none', stroke: '#3f8a6a', 'stroke-width': 1.6 }, g);
    S('text', { x: (hx + OX) / 2, y: by - 6, 'font-size': 10, 'text-anchor': 'middle', fill: '#3f8a6a', 'font-weight': 600, text: 'l₂' }, g);
    // 弹簧测力计（沿拉力方向转）
    var sg = S('g', { transform: 'rotate(' + (-tht) + ' ' + px + ' ' + py + ')' }, g);
    S('line', { x1: px, y1: py + 4, x2: px, y2: py + 20, stroke: '#6b6478', 'stroke-width': 1.4 }, sg);
    S('rect', { x: px - 9, y: py + 20, width: 18, height: 54, rx: 4, fill: '#f4f1fa', stroke: '#8a7fb0', 'stroke-width': 1.3 }, sg);
    for (var q = 0; q <= 5; q++) S('line', { x1: px - 6, y1: py + 26 + q * 8, x2: px + (q % 5 === 0 ? 2 : -1), y2: py + 26 + q * 8, stroke: '#8a7fb0', 'stroke-width': 1 }, sg);
    var pyF = py + 26 + Math.min(F1(), 5) * 8;
    S('path', { d: 'M' + (px + 7) + ' ' + (pyF - 3) + 'L' + (px - 1) + ' ' + pyF + 'L' + (px + 7) + ' ' + (pyF + 3) + 'z', fill: '#c2603f' }, sg);
    S('line', { x1: px, y1: py + 74, x2: px, y2: py + SCL - 6, stroke: '#6b6478', 'stroke-width': 1.4 }, sg);
    // 力的作用线（虚线）和力臂
    S('line', { x1: px - dx * 260, y1: py - dy * 260, x2: px + dx * 260, y2: py + dy * 260, stroke: '#c2603f', 'stroke-width': 1, 'stroke-dasharray': '5 4', opacity: 0.75 }, g);
    var tt = (OX - px) * dx, fx = px + dx * tt, fy = py + dy * tt;
    S('line', { x1: OX, y1: OY, x2: fx, y2: fy, stroke: '#c2603f', 'stroke-width': 2.6, 'stroke-linecap': 'round' }, g);
    var ux = OX - fx, uy = OY - fy, ul = Math.hypot(ux, uy) || 1; ux /= ul; uy /= ul;
    var vs = tt < 0 ? 1 : -1, vx = dx * vs, vy = dy * vs, m = 7;
    S('path', { d: 'M' + (fx + ux * m) + ' ' + (fy + uy * m) + 'L' + (fx + ux * m + vx * m) + ' ' + (fy + uy * m + vy * m) + 'L' + (fx + vx * m) + ' ' + (fy + vy * m), fill: 'none', stroke: '#c2603f', 'stroke-width': 1.2 }, g);
    var nx = uy, ny = -ux; if (ny > 0) { nx = -nx; ny = -ny; }
    S('text', { x: (OX + fx) / 2 + nx * 11, y: (OY + fy) / 2 + ny * 11 + 3, 'font-size': 10, 'text-anchor': 'middle', fill: '#c2603f', 'font-weight': 600, text: 'l₁' }, g);
    // 角上的数值
    S('text', { x: 14, y: 20, 'font-size': 10, fill: '#3f8a6a', 'font-weight': 600, text: '阻力 F₂ = 2 N' }, g);
    S('text', { x: 14, y: 34, 'font-size': 10, fill: '#3f8a6a', 'font-weight': 600, text: '阻力臂 l₂ = 15 cm' }, g);
    S('text', { x: 386, y: 20, 'font-size': 10, 'text-anchor': 'end', fill: '#c2603f', 'font-weight': 600, text: '动力 F₁ = ' + L.fmt(F1(), 2) + ' N' }, g);
    S('text', { x: 386, y: 34, 'font-size': 10, 'text-anchor': 'end', fill: '#c2603f', 'font-weight': 600, text: '动力臂 l₁ = ' + L.fmt(l1(), 1) + ' cm' }, g);
    // 拉环（可拖）
    var rx = px + dx * SCL, ry = py + dy * SCL;
    var hg = S('g', { id: 'arm-handle', class: 'pt', tabindex: 0, role: 'slider', 'aria-label': '拉力方向', 'aria-valuenow': tht, 'aria-valuemin': -60, 'aria-valuemax': 60 }, g);
    S('circle', { cx: rx, cy: ry, r: 16, fill: 'transparent' }, hg);
    S('circle', { cx: rx, cy: ry, r: 6, fill: '#fff', stroke: '#5a4097', 'stroke-width': 2 }, hg);
    S('text', { x: rx, y: ry + 20, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#7a6aa8', text: '↔ 拖我' }, hg);
    bindArmHandle(hg);
  }

  var armDrag = false;
  function bindArmHandle(el) {
    el.addEventListener('pointerdown', function (e) { armDrag = true; try { armSvg.setPointerCapture(e.pointerId); } catch (err) {} e.preventDefault(); });
    el.addEventListener('keydown', function (e) {
      var k = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[e.key];
      if (!k) return;
      e.preventDefault();
      setTht(tht + k);
      L.$('#arm-handle').focus();
    });
  }
  armSvg.addEventListener('pointermove', function (e) {
    if (!armDrag) return;
    var p = L.svgPoint(armSvg, e), px = OX + pos * GP2;
    setTht(Math.atan2(p.x - px, Math.max(p.y - OY, 1)) * 180 / Math.PI);
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (n) { armSvg.addEventListener(n, function () { armDrag = false; }); });

  var angIn = L.$('#ang-in');
  angIn.value = tht;
  L.bindRange(angIn, function (v) { tht = v; armChanged(); });
  function setTht(v) {
    tht = Math.round(L.clamp(v, -60, 60));
    angIn.value = tht; L.paintRange(angIn);
    armChanged();
  }
  L.chips(L.$('#pos-chips'), [{ label: '第 3 格（15 cm）', value: '3' }, { label: '第 4 格（20 cm）', value: '4' }, { label: '第 6 格（30 cm）', value: '6' }], String(pos), function (v) { pos = +v; armChanged(); });

  var KIND = { save: '省力杠杆', eq: '等臂杠杆', cost: '费力杠杆' };
  function readArm() {
    var l = l1(), F = F1(), k = kind(), d = pos * CM, t;
    L.$('#ang-out').textContent = tht === 0 ? '0°（竖直）' : Math.abs(tht) + '°（' + (tht < 0 ? '向支点歪' : '向外歪') + '）';
    L.$('#arm-badge').textContent = KIND[k];
    L.$('#arm-F').innerHTML = L.qty(F, 'N', 2);
    L.$('#arm-l1').innerHTML = L.qty(l, 'cm', 1);
    L.$('#arm-F2').innerHTML = L.qty(F2A, 'N', 0);
    L.$('#arm-l2').innerHTML = L.qty(L2A, 'cm', 0);
    L.$$('#kind-table tbody tr').forEach(function (tr) { tr.classList.toggle('on', tr.dataset.k === k); });
    if (tht === 0) t = '竖直向下拉，拉力和杠杆垂直，动力臂就等于支点到挂点的距离 ' + d + ' cm。由 F₁l₁ = F₂l₂：F₁ = 2 N × 15 cm ÷ ' + d + ' cm = ' + L.fmt(F, 2) + ' N。';
    else t = '斜着拉 ' + Math.abs(tht) + '°：挂点没动，支点到挂点还是 ' + d + ' cm，可力的作用线离支点近了，动力臂缩短为 ' + L.fmt(l, 1) + ' cm，示数变大到 ' + L.fmt(F, 2) + ' N。<b>拉得越斜，力臂越短，越费力。</b>';
    t += k === 'save' ? '现在 l₁ &gt; l₂，是省力杠杆。' : (k === 'eq' ? '现在 l₁ = l₂，是等臂杠杆，拉力正好等于钩码重。' : '现在 l₁ &lt; l₂，变成了费力杠杆。');
    setText(L.$('#arm-text'), t);
    save();
  }
  function armChanged() { drawArm(); readArm(); }

  /* ========== ③ 滑轮组 ========== */
  var pul = L.$('#pul'), pulDefs = clipDefs(pul, 'pul-clip', 400, 260);
  var nRope = [2, 3, 4].indexOf(+st.n) >= 0 ? +st.n : 2;
  var Gw = Math.round(L.num(st.g, 12, 4, 40) / 2) * 2;
  var Gd = Math.round(L.num(st.gd, 2, 0.5, 6) * 2) / 2;
  var hh = Math.round(L.num(st.h, 0.2, 0.1, 0.4) * 20) / 20;
  var prog = 0, pulAnim = null;
  var R = 12, X0 = 150, FY = 40, GROUND = 234, MY0 = GROUND - 52, PX = 90, HUP = 140, HDN = 60;   // 轮半径、第一段绳的位置、定滑轮高度、地面；1 m = 90 px；手的起始高度

  function Fp() { return (Gw + Gd) / nRope; }
  function sp() { return nRope * hh; }
  function eta() { return Gw / (Gw + Gd); }

  function wheel(g, cx, cy) {
    S('circle', { cx: cx, cy: cy, r: R, fill: '#fdfbf7', stroke: '#7a6aa8', 'stroke-width': 1.6 }, g);
    S('circle', { cx: cx, cy: cy, r: 2.2, fill: '#7a6aa8' }, g);
  }
  function drawPul() {
    pul.innerHTML = ''; pul.appendChild(pulDefs);
    S('rect', { x: 0, y: 0, width: 400, height: 260, rx: 14, fill: '#fbfaf7' }, pul);
    var g = S('g', { 'clip-path': 'url(#pul-clip)' }, pul);
    S('rect', { x: 124, y: 0, width: 150, height: 12, fill: '#d9d3e3' }, g);
    S('rect', { x: 0, y: GROUND, width: 400, height: 260 - GROUND, fill: '#e8e1d3' }, g);
    var up = nRope === 3, my = MY0 - prog * hh * PX, ds = prog * sp() * PX;
    var xs = [], i, lines = up ? 3 : nRope + 1;
    for (i = 0; i < lines; i++) xs.push(X0 + i * 2 * R);
    var mov = [], fix = [];
    if (up) { mov = [xs[0] + R]; fix = [xs[1] + R]; }
    else for (i = 0; i < nRope / 2; i++) { mov.push(xs[2 * i] + R); fix.push(xs[2 * i + 1] + R); }
    // 定滑轮框和吊杆
    var fl = fix[0] - R - 4, fr = fix[fix.length - 1] + R + 4;
    S('line', { x1: (fl + fr) / 2, y1: 12, x2: (fl + fr) / 2, y2: FY - R - 4, stroke: '#8a8598', 'stroke-width': 3 }, g);
    S('rect', { x: fl, y: FY - R - 4, width: fr - fl, height: 2 * R + 8, rx: 5, fill: '#ece8f2', stroke: '#a39cb3' }, g);
    // 动滑轮框（n = 3 时多一个系绳子的挂钩）
    var ml = mov[0] - R - 4, mr = up ? xs[2] + 4 : mov[mov.length - 1] + R + 4, mc = (ml + mr) / 2;
    S('rect', { x: ml, y: my - R - 4, width: mr - ml, height: 2 * R + 8, rx: 5, fill: '#ece8f2', stroke: '#a39cb3' }, g);
    fix.forEach(function (cx) { wheel(g, cx, FY); });
    mov.forEach(function (cx) { wheel(g, cx, my); });
    S('text', { x: fr + 6, y: FY + 4, 'font-size': 9, fill: '#7a6aa8', text: '定滑轮' }, g);
    S('text', { x: ml - 6, y: my + 4, 'font-size': 9, 'text-anchor': 'end', fill: '#7a6aa8', text: nRope === 4 ? '动滑轮 ×2' : '动滑轮' }, g);
    // 绳子
    var handY, d, A = ' A' + R + ' ' + R + ' 0 0 ';
    if (up) {
      handY = HUP - ds;
      d = 'M' + xs[0] + ' ' + handY + 'L' + xs[0] + ' ' + my + A + '0 ' + xs[1] + ' ' + my + 'L' + xs[1] + ' ' + FY + A + '1 ' + xs[2] + ' ' + FY + 'L' + xs[2] + ' ' + (my - R - 2);
    } else {
      handY = HDN + ds;
      d = 'M' + xs[0] + ' 12';
      for (i = 0; i < nRope / 2; i++) d += 'L' + xs[2 * i] + ' ' + my + A + '0 ' + xs[2 * i + 1] + ' ' + my + 'L' + xs[2 * i + 1] + ' ' + FY + A + '1 ' + xs[2 * i + 2] + ' ' + FY;
      d += 'L' + xs[nRope] + ' ' + handY;
    }
    S('path', { d: d, fill: 'none', stroke: '#8a6a3a', 'stroke-width': 2, 'stroke-linejoin': 'round' }, g);
    if (up) S('circle', { cx: xs[2], cy: my - R - 2, r: 2.5, fill: '#8a6a3a' }, g);
    else S('circle', { cx: xs[0], cy: 13, r: 2.5, fill: '#8a6a3a' }, g);
    // 数一数吊着动滑轮的绳子
    for (i = 0; i < nRope; i++) {
      S('circle', { cx: xs[i], cy: my - 28, r: 6.5, fill: '#5a4097' }, g);
      S('text', { x: xs[i], y: my - 25, 'font-size': 9, 'text-anchor': 'middle', fill: '#fff', 'font-weight': 600, text: i + 1 }, g);
    }
    // 重物
    S('line', { x1: mc, y1: my + R + 4, x2: mc, y2: my + 22, stroke: '#6b6478', 'stroke-width': 1.6 }, g);
    S('rect', { x: mc - 22, y: my + 22, width: 44, height: 30, rx: 3, fill: '#5f6670', stroke: '#454b55' }, g);
    S('text', { x: mc, y: my + 41, 'font-size': 10, 'text-anchor': 'middle', fill: '#fff', 'font-weight': 600, text: Gw + ' N' }, g);
    // 绳子自由端：手和拉力
    var hx = up ? xs[0] : xs[nRope], h0 = up ? HUP : HDN;
    S('line', { x1: hx - 9, y1: h0, x2: hx + 9, y2: h0, stroke: '#c2603f', 'stroke-width': 1, 'stroke-dasharray': '2 2' }, g);
    S('rect', { x: hx - 7, y: handY - 4, width: 14, height: 8, rx: 3, fill: '#f2c9a0', stroke: '#b07a4a' }, g);
    if (up) L.arrow(g, hx, handY - 5, hx, handY - 27, { color: '#c2603f', width: 2.2, head: 7 });
    else L.arrow(g, hx, handY + 5, hx, handY + 27, { color: '#c2603f', width: 2.2, head: 7 });
    S('text', { x: up ? hx - 9 : hx + 9, y: up ? handY - 14 : handY + 22, 'font-size': 10, 'text-anchor': up ? 'end' : 'start', fill: '#c2603f', 'font-weight': 600, text: 'F = ' + L.fmt(Fp(), 2) + ' N' }, g);
    S('text', { x: up ? hx - 9 : hx + 9, y: handY + 4, 'font-size': 9, 'text-anchor': up ? 'end' : 'start', fill: '#8a8598', text: '绳子自由端' }, g);
    // 左边两根柱子：h 和 s 同一比例
    [[34, hh, prog * hh, 'h', '#5f6670'], [74, sp(), prog * sp(), 's', '#c2603f']].forEach(function (b) {
      var full = b[1] * PX, now = b[2] * PX;
      S('rect', { x: b[0], y: GROUND - full, width: 18, height: full, fill: 'none', stroke: b[4], 'stroke-dasharray': '3 3' }, g);
      if (now > 0) S('rect', { x: b[0], y: GROUND - now, width: 18, height: now, fill: b[4], opacity: 0.75 }, g);
      S('text', { x: b[0] + 9, y: GROUND - full - 5, 'font-size': 9, 'text-anchor': 'middle', fill: b[4], 'font-weight': 600, text: L.fmt(b[1], 2) + ' m' }, g);
      S('text', { x: b[0] + 9, y: GROUND + 15, 'font-size': 10, 'text-anchor': 'middle', fill: b[4], 'font-weight': 600, text: b[3] }, g);
    });
    S('text', { x: 118, y: GROUND + 15, 'font-size': 9, fill: '#8a8598', text: '物体升高 h，绳端拉出 s' }, g);
  }

  function readPul() {
    var F = Fp(), s = sp(), Wy = Gw * hh, We = Gd * hh, Wz = F * s;
    L.$('#g-out').textContent = Gw + ' N';
    L.$('#gd-out').textContent = L.fmt(Gd, 1) + ' N';
    L.$('#h-out').textContent = L.fmt(hh, 2) + ' m';
    L.$('#pul-badge').textContent = 'n = ' + nRope + ' 段';
    L.$('#pul-F').innerHTML = L.qty(F, 'N', 2);
    L.$('#pul-s').innerHTML = L.qty(s, 'm', 2);
    L.$('#pul-Wy').innerHTML = L.qty(Wy, 'J', 2);
    L.$('#pul-We').innerHTML = L.qty(We, 'J', 2);
    L.$('#pul-Wz').innerHTML = L.qty(Wz, 'J', 2);
    L.$('#pul-eta').innerHTML = L.fmt(eta() * 100, 1) + '<small>%</small>';
    var t = nRope + ' 段绳子一起吊着动滑轮和物体，拉力 F = (G物 + G动) ÷ n = (' + Gw + ' N + ' + L.fmt(Gd, 1) + ' N) ÷ ' + nRope + ' = ' + L.fmt(F, 2) + ' N';
    if (nRope === 4) t += '（这里 G动 是两个动滑轮的总重）';
    t += '。代价是：物体升高 ' + L.fmt(hh, 2) + ' m，绳子自由端要拉出 s = nh = ' + L.fmt(s, 2) + ' m。';
    t += '总功 ' + L.fmt(Wz, 2) + ' J 里，只有 ' + L.fmt(Wy, 2) + ' J 用来提物体，另外 ' + L.fmt(We, 2) + ' J 花在提动滑轮上，η = ' + L.fmt(eta() * 100, 1) + '%。';
    t += nRope === 3 ? '这种绕法绳子从动滑轮引出，人要<b>向上</b>拉。' : '最后一段绳子从定滑轮绕下来，人<b>向下</b>拉，改变了力的方向。';
    setText(L.$('#pul-text'), t);
    save();
  }
  function pulChanged() { drawPul(); readPul(); }
  function stopPul() { if (pulAnim) pulAnim.stop(); pulAnim = null; }
  function liftGo() {
    stopPul();
    if (prog >= 1) prog = 0;
    if (L.REDUCED) { prog = 1; drawPul(); return; }
    pulAnim = L.loop(function (dt) {
      prog = Math.min(1, prog + dt / 2.2);
      drawPul();
      if (prog >= 1) { pulAnim = null; return false; }
    });
  }
  function liftReset() { stopPul(); prog = 0; drawPul(); }
  L.chips(L.$('#n-chips'), [{ label: 'n = 2', value: '2' }, { label: 'n = 3', value: '3' }, { label: 'n = 4', value: '4' }], String(nRope), function (v) { nRope = +v; pulChanged(); });
  var gIn = L.$('#g-in'), gdIn = L.$('#gd-in'), hIn = L.$('#h-in');
  gIn.value = Gw; gdIn.value = Gd; hIn.value = hh;
  L.bindRange(gIn, function (v) { Gw = v; pulChanged(); });
  L.bindRange(gdIn, function (v) { Gd = v; pulChanged(); });
  L.bindRange(hIn, function (v) { hh = Math.round(v * 20) / 20; pulChanged(); });
  L.$('#lift-go').addEventListener('click', liftGo);
  L.$('#lift-reset').addEventListener('click', liftReset);

  var ready = false;
  function save() {
    if (!ready) return;
    L.setState({ lc: lc, lp: lp, rc: rc, rp: rp, k: nut, p: pos, t: tht, n: nRope, g: Gw, gd: Gd, h: hh });
  }

  leverChanged();
  drawRecs();
  armChanged();
  drawPul();
  ready = true;
  readPul();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '两边挂不同个数的钩码，让杠杆在水平位置平衡',
      desc: '在“杠杆的平衡条件”里操作：平衡螺母要在中间，左右两边的钩码个数不能一样多。',
      label: '在杠杆模型里操作',
      button: '检查是否平衡',
      check: function () {
        if (nut !== 0) return { ok: false, msg: '平衡螺母没在中间，杠杆自己就不平衡。先把钩码取下，调好螺母再挂。' };
        if (lc === 0 || rc === 0) return { ok: false, msg: '两边都要挂上钩码。' };
        if (lc === rc) return { ok: false, msg: '两边钩码一样多，只要挂在同一格就平衡了，太简单。换成个数不同的试试。' };
        if (!balanced()) return { ok: false, msg: '现在 F₁l₁ = ' + L.fmt(q1() * 0.025, 3) + ' N·m，F₂l₂ = ' + L.fmt(q2() * 0.025, 3) + ' N·m，不相等。钩码多的一边要挂得离支点<b>近</b>一些。' };
        return { ok: true, msg: '左边 ' + L.fmt(lc * HOOK, 1) + ' N × ' + lp * CM + ' cm = 右边 ' + L.fmt(rc * HOOK, 1) + ' N × ' + rp * CM + ' cm，F₁l₁ = F₂l₂。力大的一边力臂短，力小的一边力臂长。' };
      }
    },
    {
      level: 'base',
      title: '下列工具中，属于费力杠杆的是',
      desc: '想一想用的时候，手离支点近，还是被夹、被撬的东西离支点近。',
      options: ['镊子', '撬棒', '羊角锤（拔钉子）', '钢丝钳'],
      answer: 0,
      hint: '比较动力臂和阻力臂：手用力的地方离支点远，还是近？',
      explain: '镊子的支点在尾部，手捏在中间，被夹的东西在尖端，动力臂<b>小于</b>阻力臂，是费力杠杆，好处是手动一点、尖端就动很多，省距离。撬棒、羊角锤、钢丝钳都是手离支点远，动力臂大于阻力臂，是省力杠杆。'
    },
    {
      level: 'base',
      title: '旗杆顶上装的是定滑轮，它的作用是',
      desc: '升旗时，人在下面往下拉绳子，旗子往上升。',
      options: ['不省力，但能改变力的方向', '能省一半的力', '既能省力，又能改变力的方向', '能省距离'],
      answer: 0,
      hint: '定滑轮的轴固定不动，它相当于一个什么样的杠杆？',
      explain: '定滑轮实质是<b>等臂杠杆</b>，不省力，但能把向下拉变成向上提，<b>改变了力的方向</b>。“省一半的力”是动滑轮的特点；定滑轮也不省距离，绳子拉多长，旗子就升多高。'
    },
    {
      level: 'mid',
      title: '让弹簧测力计的示数正好是 3 N',
      desc: '在“力臂”模型里选挂点、改拉力方向，让杠杆水平平衡时测力计示数为 3 N。提示：F₁ × l₁ 要等于 2 N × 15 cm。',
      label: '在力臂模型里操作',
      button: '检查测力计示数',
      check: function () {
        var F = F1();
        if (Math.abs(F - 3) < 0.05) return { ok: true, msg: '动力臂 l₁ = ' + L.fmt(l1(), 1) + ' cm，F₁ = 2 N × 15 cm ÷ ' + L.fmt(l1(), 1) + ' cm ≈ 3 N。支点到挂点的距离是 ' + pos * CM + ' cm，力臂却只有约 10 cm，因为你是斜着拉的。' };
        if (F < 3) return { ok: false, msg: '现在示数 ' + L.fmt(F, 2) + ' N，还不到 3 N，说明动力臂还太长（' + L.fmt(l1(), 1) + ' cm）。拉得再斜一些，或者挂得离支点近一些。' };
        return { ok: false, msg: '现在示数 ' + L.fmt(F, 2) + ' N，超过 3 N 了，动力臂太短（' + L.fmt(l1(), 1) + ' cm）。拉得正一点。' };
      }
    },
    {
      level: 'mid',
      title: '用 n = 3 的滑轮组把 240 N 的物体匀速提升 2 m，拉力是 100 N。机械效率是',
      desc: '先算绳子自由端移动的距离，再分别算有用功和总功。',
      options: ['80%', '120%', '240%', '41.7%'],
      answer: 0,
      hint: '总功是拉力乘绳子自由端移动的距离 s，而 s 不等于 h。机械效率能超过 100% 吗？',
      explain: 's = nh = 3 × 2 m = 6 m。W有 = Gh = 240 N × 2 m = 480 J，W总 = Fs = 100 N × 6 m = 600 J，η = 480 J ÷ 600 J = <b>80%</b>。120% 是把 s 算成了 4 m，240% 是把 s 当成了 h，机械效率不可能超过 100%；41.7% 是用 F ÷ G 算的，完全弄反了。'
    },
    {
      level: 'mid',
      title: '动滑轮重保持 2 N，让机械效率达到 90% 以上',
      desc: '在“滑轮组”模型里操作。动滑轮重不许改，其他随便调。',
      label: '在滑轮组模型里操作',
      button: '检查机械效率',
      check: function () {
        if (Gd !== 2) return { ok: false, msg: '题目要求动滑轮重保持 2 N，先把它调回 2 N。' };
        if (eta() < 0.9 - 1e-9) return { ok: false, msg: '现在 η = ' + L.fmt(eta() * 100, 1) + '%。换绳子段数 n 或改提升高度 h 都没用，η 不变。想一想：怎样让有用功占的比例更大？' };
        return { ok: true, msg: 'G物 = ' + Gw + ' N 时，η = ' + Gw + ' ÷ (' + Gw + ' + 2) = ' + L.fmt(eta() * 100, 1) + '%。动滑轮重不变时，<b>物重越大，额外功占的比例越小，效率越高</b>。' };
      }
    },
    {
      level: 'trap',
      title: '杠杆在水平位置平衡。把测力计从竖直向下拉改成斜向下拉，挂点不变，杠杆仍在水平位置平衡，测力计的示数将',
      desc: '可以在“力臂”模型里拖一拖拉环看看。',
      options: ['变大', '变小', '不变', '先变小后变大'],
      answer: 0,
      hint: '力臂是支点到哪里的距离？到挂点，还是到力的作用线？',
      explain: '支点到挂点的距离没变，但力臂是支点到<b>力的作用线</b>的垂直距离，斜着拉时变短了。阻力和阻力臂不变，由 F₁l₁ = F₂l₂，l₁ 变小，F₁ 就<b>变大</b>。选“不变”，是把力臂当成了支点到作用点的距离。'
    },
    {
      level: 'trap',
      title: '同样的滑轮，把绕法从 n = 2 改成 n = 3，提起同一个重物（不计绳重和摩擦），下列说法正确的是',
      desc: '可以在“滑轮组”模型里切换 n，盯着拉力和机械效率看。',
      options: ['更省力，机械效率不变', '更省力，机械效率变高', '更省力，而且省了功', '拉力不变，机械效率变高'],
      answer: 0,
      hint: '有用功 G物h 和额外功 G动h 会因为绕法变了而改变吗？',
      explain: 'F = (G物 + G动) ÷ n，n 变大，拉力变小，<b>更省力</b>；但有用功 G物h、额外功 G动h 都没变，η = G物 ÷ (G物 + G动) <b>不变</b>。省了力，绳子就要多拉（s = nh），总功一点没少，任何机械都不省功。'
    }
  ]);
})();
