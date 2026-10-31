/* 物理互动馆 · 第 5 课 透镜及其应用 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();

  /* ========== 光具座 ========== */
  var K = 3;                 // 1 cm = 3 px
  var LX = 200, AY = 128;    // 透镜位置、主光轴高度
  var H0 = 34;               // 烛焰高（px）
  var f = [10, 15].indexOf(+st.f) >= 0 ? +st.f : 10;
  var u = L.num(st.u, 30, 4, 58);

  var bench = L.$('#bench');
  var defs = S('defs', {}, bench);
  var cp = S('clipPath', { id: 'bench-clip' }, defs);
  S('rect', { x: 0, y: 0, width: 400, height: 204 }, cp);  // 光线只画在导轨上方，不会跑出卡片

  function region() {
    if (Math.abs(u - f) < 0.3) return 'f';
    if (u < f) return 'near';
    if (Math.abs(u - 2 * f) < 0.3) return 'eq';
    if (u < 2 * f) return 'mid';
    return 'far';
  }
  function imageDist() { return Math.abs(u - f) < 1e-9 ? Infinity : u * f / (u - f); }

  function draw() {
    bench.innerHTML = ''; bench.appendChild(defs);
    S('rect', { x: 0, y: 0, width: 400, height: 250, rx: 14, fill: '#fbfaf7' }, bench);
    // 光具座导轨与刻度
    S('rect', { x: 10, y: 206, width: 380, height: 10, rx: 3, fill: '#e6e2ec' }, bench);
    for (var c = -60; c <= 60; c += 5) {
      var x = LX + c * K, big = c % 10 === 0;
      if (x < 12 || x > 388) continue;
      S('line', { x1: x, y1: 206, x2: x, y2: big ? 214 : 210, stroke: '#a39cb3', 'stroke-width': 1 }, bench);
      if (big && c !== 0) S('text', { x: x, y: 229, 'font-size': 9, 'text-anchor': 'middle', fill: '#8a8598', text: Math.abs(c) }, bench);
    }
    S('text', { x: 392, y: 242, 'font-size': 9, 'text-anchor': 'end', fill: '#8a8598', text: '单位：cm' }, bench);
    // 主光轴
    S('line', { x1: 8, y1: AY, x2: 392, y2: AY, stroke: '#b8b2c6', 'stroke-width': 1, 'stroke-dasharray': '4 4' }, bench);
    // 焦点和二倍焦距
    [[-2, '2F'], [-1, 'F'], [1, 'F'], [2, '2F']].forEach(function (p) {
      var x = LX + p[0] * f * K;
      S('circle', { cx: x, cy: AY, r: 3, fill: p[1] === 'F' ? '#c2603f' : '#7a6aa8' }, bench);
      S('text', { x: x, y: AY + 16, 'font-size': 10, 'text-anchor': 'middle', fill: p[1] === 'F' ? '#a4492b' : '#5a4097', 'font-weight': 600, text: p[1] }, bench);
    });
    // 透镜
    S('path', { d: 'M' + LX + ' ' + (AY - 74) + 'Q' + (LX + 13) + ' ' + AY + ' ' + LX + ' ' + (AY + 74) + 'Q' + (LX - 13) + ' ' + AY + ' ' + LX + ' ' + (AY - 74) + 'z', fill: '#dfe9f3', 'fill-opacity': 0.85, stroke: '#7f9fc0', 'stroke-width': 1.5 }, bench);
    S('line', { x1: LX, y1: AY + 74, x2: LX, y2: 206, stroke: '#a39cb3', 'stroke-width': 2 }, bench);
    S('text', { x: LX, y: AY - 80, 'font-size': 10, 'text-anchor': 'middle', fill: '#5a6e86', text: '凸透镜' }, bench);
    S('circle', { cx: LX, cy: AY, r: 2.2, fill: '#5a6e86' }, bench);

    var xo = LX - u * K, yo = AY - H0;
    var v = imageDist(), rg = region();
    var rays = S('g', { 'clip-path': 'url(#bench-clip)', fill: 'none', 'stroke-width': 1.5, 'stroke-linecap': 'round' }, bench);
    var C1 = '#d08a2c', C2 = '#5a4097', C3 = '#3f8a6a';
    function ray(pts, color, dash) {
      S('path', { d: 'M' + pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join('L'), stroke: color, 'stroke-dasharray': dash || null, opacity: dash ? 0.8 : 1 }, rays);
    }
    function extend(x1, y1, x2, y2, toX) { var t = (toX - x1) / (x2 - x1); return [toX, y1 + (y2 - y1) * t]; }
    // ① 平行于主光轴 → 过右焦点
    var Fr = [LX + f * K, AY];
    ray([[xo, yo], [LX, yo], extend(LX, yo, Fr[0], Fr[1], 400)], C1);
    // ② 过光心 → 方向不变
    ray([[xo, yo], extend(xo, yo, LX, AY, 400)], C2);
    // ③ 过左焦点 → 平行于主光轴（物体在焦点外才画）
    if (u > f + 0.05) {
      var Fl = [LX - f * K, AY];
      var hit = extend(xo, yo, Fl[0], Fl[1], LX);
      ray([[xo, yo], hit, [400, hit[1]]], C3);
    }
    var screenX = 392, img = null;
    if (rg === 'near') {
      // 虚像：反向延长
      var vx = LX + v * K, mh = H0 * (-v) / u;
      ray([[LX, yo], [vx, AY - mh]], C1, '4 4');
      ray([[xo, yo], [vx, AY - mh]], C2, '4 4');
      img = { x: vx, h: mh, virtual: true };
    } else if (isFinite(v)) {
      img = { x: LX + v * K, h: -H0 * v / u, virtual: false };
      if (img.x <= 390) screenX = img.x;
    }
    // 光屏
    S('rect', { x: screenX - 2, y: AY - 74, width: 4, height: 148, rx: 1.5, fill: '#cfc9da' }, bench);
    S('line', { x1: screenX, y1: AY + 74, x2: screenX, y2: 206, stroke: '#a39cb3', 'stroke-width': 2 }, bench);
    S('text', { x: Math.min(screenX, 384), y: AY - 80, 'font-size': 10, 'text-anchor': 'middle', fill: '#8a8598', text: '光屏' }, bench);
    // 像
    if (img && img.x > 4 && img.x < 398) {
      var g = S('g', { opacity: img.virtual ? 0.75 : 1 }, bench);
      var top = AY - img.h;
      S('line', { x1: img.x, y1: AY, x2: img.x, y2: top, stroke: img.virtual ? '#c2603f' : '#a4492b', 'stroke-width': 3, 'stroke-dasharray': img.virtual ? '4 3' : null }, g);
      var dir = img.h > 0 ? -1 : 1;
      S('path', { d: 'M' + (img.x - 5) + ' ' + (top - dir * 7) + 'L' + img.x + ' ' + top + 'L' + (img.x + 5) + ' ' + (top - dir * 7), fill: 'none', stroke: img.virtual ? '#c2603f' : '#a4492b', 'stroke-width': 2 }, g);
      S('text', { x: img.x + (img.virtual ? -6 : 6), y: img.h > 0 ? top - 6 : top + 14, 'font-size': 10, 'text-anchor': img.virtual ? 'end' : 'start', fill: '#a4492b', 'font-weight': 600, text: img.virtual ? '虚像' : '实像' }, g);
    }
    // 蜡烛（可拖）
    var cg = S('g', { class: 'pt', tabindex: 0, role: 'slider', 'aria-label': '蜡烛位置', 'aria-valuenow': u, 'aria-valuemin': 4, 'aria-valuemax': 58 }, bench);
    S('rect', { x: xo - 16, y: yo - 22, width: 32, height: 206 - yo + 22, fill: 'transparent' }, cg);
    S('rect', { x: xo - 5, y: yo + 10, width: 10, height: AY - yo - 10, rx: 2, fill: '#f1e3c8', stroke: '#c9a873' }, cg);
    S('path', { d: 'M' + xo + ' ' + (yo - 2) + 'c6 6 5 12 0 13c-5-1-6-7 0-13z', fill: '#f2a43a', stroke: '#d17a1f', 'stroke-width': 1 }, cg);
    S('line', { x1: xo, y1: AY, x2: xo, y2: 206, stroke: '#a39cb3', 'stroke-width': 2 }, cg);
    S('text', { x: xo, y: 200, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#7a6aa8', text: '↔ 拖我' }, cg);
    bindDrag(cg);
    readout(v, rg, img);
  }

  var dragging = false;
  function bindDrag(el) {
    el.addEventListener('pointerdown', function (e) { dragging = true; try { bench.setPointerCapture(e.pointerId); } catch (err) {} e.preventDefault(); });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { setU(u + 0.5); e.preventDefault(); }
      if (e.key === 'ArrowRight') { setU(u - 0.5); e.preventDefault(); }
    });
  }
  bench.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var p = L.svgPoint(bench, e);
    setU((LX - p.x) / K);
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (n) { bench.addEventListener(n, function () { dragging = false; }); });

  var uIn = L.$('#u-in');
  uIn.value = u;
  L.bindRange(uIn, function (val) { u = val; draw(); });
  function setU(val) {
    u = Math.round(L.clamp(val, 4, 58) * 2) / 2;
    uIn.value = u; L.paintRange(uIn);
    draw();
  }
  var fChips = L.chips(L.$('#f-chips'), [{ label: 'f = 10 cm', value: '10' }, { label: 'f = 15 cm', value: '15' }], String(f), function (val) { f = +val; draw(); });

  var USE = { far: '照相机', eq: '测焦距', mid: '投影仪', f: '不成像', near: '放大镜' };
  function readout(v, rg, img) {
    L.$('#u-out').textContent = L.fmt(u, 1) + ' cm';
    L.$('#use-badge').textContent = USE[rg];
    L.$$('#rule-table tbody tr').forEach(function (tr) { tr.classList.toggle('on', tr.dataset.r === rg); });
    var vOut = L.$('#v-out'), mOut = L.$('#m-out'), kOut = L.$('#kind-out'), t;
    if (rg === 'f') {
      vOut.textContent = '—'; mOut.textContent = '—'; kOut.textContent = '不成像';
      t = '蜡烛正好在焦点上：从烛焰发出的光经过透镜后变成<b>平行光</b>，永远交不到一起，所以不成像。';
    } else {
      var m = Math.abs(v) / u;
      mOut.innerHTML = Math.abs(m - 1) < 0.02 ? '等大' : (m > 1 ? '放大 ' + L.fmt(m, 1) + '<small>倍</small>' : '缩小到 ' + L.fmt(m, 2) + '<small>倍</small>');
      if (rg === 'near') {
        vOut.innerHTML = L.fmt(-v, 1) + '<small>cm（同侧）</small>';
        kOut.textContent = '正立 · 放大 · 虚像';
        t = '蜡烛在一倍焦距以内：光线出来后仍然散开，光屏上接不到像。从右边<b>透过透镜看</b>，能看到一个正立放大的虚像，这就是放大镜。';
      } else {
        vOut.innerHTML = L.fmt(v, 1) + '<small>cm</small>';
        kOut.textContent = rg === 'far' ? '倒立 · 缩小 · 实像' : rg === 'eq' ? '倒立 · 等大 · 实像' : '倒立 · 放大 · 实像';
        if (rg === 'far') t = '物距大于 2f：像在 f 和 2f 之间，比蜡烛小，倒过来。照相机、人眼都是这样成像的。';
        else if (rg === 'eq') t = '物距正好等于 2f：像也在另一侧 2f 处，和蜡烛一样大。实验里常用这一点来<b>测焦距</b>：f = u ÷ 2。';
        else t = '物距在 f 和 2f 之间：像跑到 2f 以外，被放大了。投影仪、幻灯机就是这样，所以胶片要<b>倒着插</b>。';
        if (img && img.x > 390) t += ' 现在像距太大，像已经跑出了光具座，光屏接不到。';
      }
    }
    L.$('#lens-text').innerHTML = t;
    save();
  }

  /* ========== 平行光通过透镜 ========== */
  var beam = L.$('#beam');
  var type = st.t === 'concave' ? 'concave' : 'convex';
  var thick = L.num(st.k, 3, 1, 5);
  var BX = 170, BY = 100;
  var thickIn = L.$('#thick-in');
  thickIn.value = thick;
  function focalCm() { return 40 / thick; }
  function drawBeam() {
    beam.innerHTML = '';
    S('rect', { x: 0, y: 0, width: 400, height: 200, rx: 14, fill: '#fbfaf7' }, beam);
    S('line', { x1: 8, y1: BY, x2: 392, y2: BY, stroke: '#b8b2c6', 'stroke-dasharray': '4 4' }, beam);
    var fc = focalCm(), fp = fc * K, bulge = 3 + thick * 3;
    if (type === 'convex') {
      S('path', { d: 'M' + BX + ' ' + (BY - 66) + 'Q' + (BX + bulge * 2) + ' ' + BY + ' ' + BX + ' ' + (BY + 66) + 'Q' + (BX - bulge * 2) + ' ' + BY + ' ' + BX + ' ' + (BY - 66) + 'z', fill: '#dfe9f3', 'fill-opacity': 0.85, stroke: '#7f9fc0', 'stroke-width': 1.5 }, beam);
    } else {
      var e = 3 + bulge * 0.9;
      S('path', { d: 'M' + (BX - e) + ' ' + (BY - 66) + 'L' + (BX + e) + ' ' + (BY - 66) + 'Q' + (BX + 2) + ' ' + BY + ' ' + (BX + e) + ' ' + (BY + 66) + 'L' + (BX - e) + ' ' + (BY + 66) + 'Q' + (BX - 2) + ' ' + BY + ' ' + (BX - e) + ' ' + (BY - 66) + 'z', fill: '#dfe9f3', 'fill-opacity': 0.85, stroke: '#7f9fc0', 'stroke-width': 1.5 }, beam);
    }
    var bd = S('defs', {}, beam), bc = S('clipPath', { id: 'beam-clip' }, bd);
    S('rect', { x: 0, y: 0, width: 400, height: 200, rx: 14 }, bc);
    var g = S('g', { fill: 'none', stroke: '#d08a2c', 'stroke-width': 1.6, 'clip-path': 'url(#beam-clip)' }, beam);
    [-48, -24, 0, 24, 48].forEach(function (h) {
      var y = BY + h;
      S('line', { x1: 14, y1: y, x2: BX, y2: y }, g);
      L.arrow(beam, 60, y, 72, y, { color: '#d08a2c', width: 1.4, head: 7 });
      var fx, ex, ey;
      if (type === 'convex') {
        fx = BX + fp;
        ex = 396; ey = y + (BY - y) * (ex - BX) / (fx - BX);
        S('line', { x1: BX, y1: y, x2: ex, y2: ey }, g);
      } else {
        fx = BX - fp;
        ex = 396; ey = BY + (y - BY) * (ex - fx) / (BX - fx);
        S('line', { x1: BX, y1: y, x2: ex, y2: ey }, g);
        if (h !== 0) S('line', { x1: BX, y1: y, x2: fx, y2: BY, stroke: '#d08a2c', 'stroke-dasharray': '3 4', opacity: 0.6 }, g);
      }
    });
    var Fx = type === 'convex' ? BX + fp : BX - fp;
    S('circle', { cx: Fx, cy: BY, r: 3.5, fill: '#c2603f' }, beam);
    S('text', { x: Fx, y: BY + 18, 'font-size': 10, 'text-anchor': 'middle', fill: '#a4492b', 'font-weight': 600, text: type === 'convex' ? 'F（实焦点）' : 'F（虚焦点）' }, beam);
    S('text', { x: BX, y: 194, 'font-size': 10, 'text-anchor': 'middle', fill: '#5a6e86', text: type === 'convex' ? '凸透镜：中间厚、边缘薄' : '凹透镜：中间薄、边缘厚' }, beam);
    // 读数
    L.$('#thick-out').textContent = ['很薄', '较薄', '中等', '较厚', '很厚'][thick - 1];
    L.$('#beam-badge').textContent = type === 'convex' ? '会聚' : '发散';
    L.$('#beam-f').innerHTML = L.fmt(fc, 1) + '<small>cm</small>';
    L.$('#beam-kind').textContent = type === 'convex' ? '实焦点' : '虚焦点';
    L.$('#beam-text').innerHTML = type === 'convex'
      ? '平行光经过凸透镜后<b>会聚</b>到一点，这一点叫焦点，光真的到过那里，所以叫实焦点。镜片越鼓，焦距越短，会聚本领越强。'
      : '平行光经过凹透镜后<b>散开</b>，好像是从透镜前方某一点发出来的。把散开的光反向延长，交于虚焦点。镜片越凹，散得越厉害。';
    save();
  }
  var typeChips = L.chips(L.$('#type-chips'), [{ label: '凸透镜', value: 'convex' }, { label: '凹透镜', value: 'concave' }], type, function (val) { type = val; drawBeam(); });
  L.bindRange(thickIn, function (val) { thick = val; drawBeam(); });

  function save() { L.setState({ u: u, f: f, t: type, k: thick }); }

  draw();
  drawBeam();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '把成像调成“照相机”',
      desc: '照相机在底片上得到的是倒立、缩小的实像。拖动蜡烛，让光屏上出现这样的像。',
      label: '在光具座上拖动蜡烛',
      button: '检查像的性质',
      check: function () {
        var rg = region();
        if (rg === 'far') return { ok: true, msg: '物距 ' + L.fmt(u, 1) + ' cm，大于 2f = ' + 2 * f + ' cm。像距落在 f 和 2f 之间，像是倒立缩小的实像。' };
        if (rg === 'near') return { ok: false, msg: '现在是放大镜的情况（正立虚像）。照相机要把物体放得<b>远</b>一些。' };
        return { ok: false, msg: '现在像还不是缩小的。想一想：物距要大于几倍焦距？' };
      }
    },
    {
      level: 'base',
      title: '把凸透镜当放大镜用',
      desc: '看书上的小字时，我们得到的是正立、放大的虚像。让蜡烛处在能成这种像的位置。',
      label: '在光具座上拖动蜡烛',
      button: '检查像的性质',
      check: function () {
        if (region() === 'near') return { ok: true, msg: '物距小于焦距，成正立放大的虚像，光屏上接不到，只能透过透镜看到。' };
        return { ok: false, msg: '现在像还是倒立的实像。放大镜要让物体离透镜比<b>焦点</b>还近。' };
      }
    },
    {
      level: 'base',
      title: '投影仪在屏幕上成的像是',
      desc: '投影仪的镜头相当于凸透镜，胶片（或芯片）离镜头比较近。',
      options: ['倒立、放大的实像', '正立、放大的实像', '倒立、缩小的实像', '正立、放大的虚像'],
      answer: 0,
      hint: '屏幕能接到像，说明是实像；凸透镜成的实像都是倒立的。',
      explain: '投影仪的物距在 f 和 2f 之间，成<b>倒立、放大的实像</b>。所以要把胶片倒着放，屏幕上的画面才是正的。'
    },
    {
      level: 'mid',
      title: 'f = 10 cm，蜡烛放在 25 cm 处，像距在哪个范围？',
      desc: '可以把焦距调成 10 cm、物距调到 25 cm 看看。',
      options: ['10 cm 到 20 cm 之间', '大于 20 cm', '小于 10 cm', '正好 20 cm'],
      answer: 0,
      hint: '25 cm 比 2f 大还是小？对应的像距在哪一段？',
      explain: 'u = 25 cm &gt; 2f = 20 cm，成倒立缩小的实像，像距满足 <b>f &lt; v &lt; 2f</b>，即 10 cm 到 20 cm 之间（准确值约 16.7 cm）。'
    },
    {
      level: 'mid',
      title: '蜡烛从很远处慢慢靠近凸透镜（仍在焦点以外），像会怎样？',
      desc: '在光具座上把蜡烛从左往右拖一遍，盯着像看。',
      options: ['像变大，像距也变大', '像变小，像距变大', '像变大，像距变小', '像的大小不变'],
      answer: 0,
      hint: '记住七个字：物近像远像变大。',
      explain: '成实像时<b>物近像远像变大</b>：物距减小，像距增大，像也变大。拍特写时镜头要往前伸，就是为了让像距变大。'
    },
    {
      level: 'mid',
      title: '挑一块会聚本领最强的透镜',
      desc: '在“凸透镜会聚，凹透镜发散”里选透镜、调厚度，让平行光会聚得最快（焦距最短）。',
      label: '在第二张图里操作',
      button: '检查这块透镜',
      check: function () {
        if (type !== 'convex') return { ok: false, msg: '凹透镜对光是发散的，不会聚。先换成凸透镜。' };
        if (thick < 5) return { ok: false, msg: '已经能会聚了，但焦距还是 ' + L.fmt(focalCm(), 1) + ' cm。镜片再鼓一些，焦距会更短。' };
        return { ok: true, msg: '凸透镜越鼓（中间和边缘厚度差越大），对光的偏折越厉害，焦距越短，会聚本领越强。' };
      }
    },
    {
      level: 'trap',
      title: '用纸挡住凸透镜的上半部分，光屏上的像会',
      desc: '原来光屏上有一个清晰的烛焰像。',
      options: ['仍然完整，只是变暗', '只剩下半部分', '只剩上半部分', '完全消失'],
      answer: 0,
      hint: '烛焰上的每一点发出的光，是只从透镜某一块通过，还是从整块透镜通过？',
      explain: '烛焰上每一点发出的光都会穿过整块透镜并会聚到同一点。挡住一半，剩下的一半照样把每一点的光会聚过去，所以像<b>仍然完整</b>，只是参与成像的光变少，<b>变暗</b>了。'
    },
    {
      level: 'trap',
      title: '光屏上已有清晰的像，在透镜前加一副近视眼镜，光屏要怎么移才能再次看清？',
      desc: '近视眼镜是凹透镜。',
      options: ['远离透镜', '靠近透镜', '不用移动', '向上移动'],
      answer: 0,
      hint: '凹透镜对光有什么作用？会让会聚点提前还是推后？',
      explain: '凹透镜对光有<b>发散</b>作用，光线会聚得更晚，像向后移，所以光屏要<b>远离透镜</b>。反过来，加远视眼镜（凸透镜）时，光屏要靠近透镜。'
    }
  ]);
})();
