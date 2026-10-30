/* 第 2 课 · 显微镜与细胞 */
(function () {
  'use strict';
  var B = window.Bio, S = B.svg;
  var st = B.getState();

  /* —— 状态 —— */
  var state = {
    sp: ['onion', 'cheek', 'letter'].indexOf(st.sp) >= 0 ? st.sp : 'onion',
    eye: [5, 10, 16].indexOf(+st.e) >= 0 ? +st.e : 10,
    obj: [4, 10, 40].indexOf(+st.o) >= 0 ? +st.o : 10,
    ap: st.ap === 'small' ? 'small' : 'big',
    mir: st.mi === 'flat' ? 'flat' : 'concave',
    focus: isFinite(+st.f) && st.f !== undefined ? B.clamp(+st.f, 0, 100) : 56,
    px: isFinite(+st.px) ? +st.px : 0,
    py: isFinite(+st.py) ? +st.py : 0
  };
  var R = 128, CX = 200, CY = 150;      // 视野半径与圆心（像素）
  var K = 256 / 180000;                 // 每微米多少像素 ÷ 放大倍数：10×10 时视野直径 1.8 mm
  var FOCUS_TARGET = { 4: 50, 10: 56, 40: 62 };
  var FOCUS_SENS = { 4: 0.06, 10: 0.1, 40: 0.2 };

  /* —— 伪随机，保证每次画出来一样 —— */
  function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }

  /* —— 生成三种装片（单位：微米） —— */
  var specimens = {};
  (function makeOnion() {
    var r = rng(7), walls = '', nuclei = '', centers = [];
    var rx = 2600, ry = 1800;
    for (var y = -ry; y < ry; ) {
      var h = 56 + r() * 14;
      var x = -rx - r() * 300;
      while (x < rx) {
        var w = 220 + r() * 170;
        var cx = x + w / 2, cy = y + h / 2;
        if ((cx * cx) / (rx * rx) + (cy * cy) / (ry * ry) < 1) {
          walls += 'M' + x.toFixed(0) + ' ' + y.toFixed(0) + 'h' + w.toFixed(0) + 'v' + h.toFixed(0) + 'h' + (-w).toFixed(0) + 'z';
          var nx = x + w * (0.25 + r() * 0.5), ny = y + h * (0.35 + r() * 0.3), nr = 9 + r() * 3;
          nuclei += 'M' + (nx - nr).toFixed(1) + ' ' + ny.toFixed(1) + 'a' + nr.toFixed(1) + ' ' + (nr * 0.8).toFixed(1) + ' 0 1 0 ' + (2 * nr).toFixed(1) + ' 0a' + nr.toFixed(1) + ' ' + (nr * 0.8).toFixed(1) + ' 0 1 0 ' + (-2 * nr).toFixed(1) + ' 0z';
          centers.push([cx, cy]);
        }
        x += w;
      }
      y += h;
    }
    specimens.onion = { walls: walls, nuclei: nuclei, centers: centers, name: '洋葱鳞片叶内表皮', unit: '个细胞' };
  })();
  (function makeCheek() {
    var r = rng(19), walls = '', nuclei = '', centers = [];
    var clumps = [];
    for (var c = 0; c < 14; c++) clumps.push([(r() - 0.5) * 3600, (r() - 0.5) * 2600, 160 + r() * 260]);
    for (var i = 0; i < 520; i++) {
      var cl = clumps[i % clumps.length];
      var a = r() * Math.PI * 2, d = Math.sqrt(r()) * cl[2];
      var cx = cl[0] + Math.cos(a) * d, cy = cl[1] + Math.sin(a) * d;
      var rad = 26 + r() * 12, n = 7, pts = [];
      var rot = r() * 6.28;
      for (var k = 0; k < n; k++) {
        var aa = rot + k / n * Math.PI * 2, rr = rad * (0.78 + r() * 0.34);
        pts.push((cx + Math.cos(aa) * rr).toFixed(0) + ' ' + (cy + Math.sin(aa) * rr * 0.86).toFixed(0));
      }
      walls += 'M' + pts.join('L') + 'z';
      var nr = 4 + r() * 1.5;
      nuclei += 'M' + (cx - nr).toFixed(1) + ' ' + cy.toFixed(1) + 'a' + nr + ' ' + nr + ' 0 1 0 ' + 2 * nr + ' 0a' + nr + ' ' + nr + ' 0 1 0 ' + (-2 * nr) + ' 0z';
      centers.push([cx, cy]);
    }
    specimens.cheek = { walls: walls, nuclei: nuclei, centers: centers, name: '人的口腔上皮', unit: '个细胞' };
  })();
  specimens.letter = { name: '写着字母 b 的玻片', centers: [[0, 0]], unit: '' };

  /* —— 画视野 —— */
  var field = B.$('#field');
  var defs = S('defs', {}, field);
  var clip = S('clipPath', { id: 'fov' }, defs);
  S('circle', { cx: CX, cy: CY, r: R }, clip);
  var filt = S('filter', { id: 'blur', x: '-10%', y: '-10%', width: '120%', height: '120%' }, defs);
  var blurEl = S('feGaussianBlur', { stdDeviation: 0 }, filt);
  var grad = S('radialGradient', { id: 'vign' }, defs);
  S('stop', { offset: '70%', 'stop-color': '#000', 'stop-opacity': 0 }, grad);
  S('stop', { offset: '100%', 'stop-color': '#000', 'stop-opacity': 0.22 }, grad);

  S('rect', { x: 0, y: 0, width: 400, height: 300, rx: 16, fill: '#2a312c' }, field);
  S('circle', { cx: CX, cy: CY, r: R + 9, fill: '#3b443d' }, field);
  var view = S('g', { 'clip-path': 'url(#fov)' }, field);
  S('circle', { cx: CX, cy: CY, r: R, fill: '#fbfaf2' }, view);
  var specOuter = S('g', { filter: 'url(#blur)' }, view);
  var spec = S('g', {}, specOuter);
  var wallsEl = S('path', { fill: '#f1e7c3', 'fill-opacity': 0.75, stroke: '#a4935e', 'stroke-width': 1.1, 'vector-effect': 'non-scaling-stroke' }, spec);
  var nucEl = S('path', { fill: '#9c6334', 'fill-opacity': 0.85 }, spec);
  var letterEl = S('text', { x: 0, y: 0, 'font-size': 1500, 'font-family': 'Georgia, "Times New Roman", serif', 'font-weight': 700, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: '#3c3a34', text: 'b' }, spec);
  var dark = S('circle', { cx: CX, cy: CY, r: R, fill: '#0c100d', 'fill-opacity': 0 }, view);
  S('circle', { cx: CX, cy: CY, r: R, fill: 'url(#vign)' }, view);
  S('circle', { cx: CX, cy: CY, r: R, fill: 'none', stroke: '#141815', 'stroke-width': 3 }, field);
  var hint = S('text', { x: CX, y: 290, 'text-anchor': 'middle', 'font-size': 11, fill: '#b8c2b4' }, field);
  S('text', { x: 16, y: 24, 'font-size': 11, fill: '#9aa596', text: '视野' }, field);
  var magText = S('text', { x: 384, y: 24, 'text-anchor': 'end', 'font-size': 11, fill: '#9aa596' }, field);

  /* —— 控件 —— */
  var chipsSp = B.chips(B.$('#sp-chips'), [{ label: '洋葱表皮', value: 'onion' }, { label: '口腔上皮', value: 'cheek' }, { label: '字母 b', value: 'letter' }], state.sp, function (v) { state.sp = v; state.px = 0; state.py = 0; render(); });
  var chipsEye = B.chips(B.$('#eye-chips'), [5, 10, 16].map(function (v) { return { label: v + '×', value: String(v) }; }), String(state.eye), function (v) { state.eye = +v; render(); });
  var chipsObj = B.chips(B.$('#obj-chips'), [4, 10, 40].map(function (v) { return { label: v + '×' + (v === 40 ? ' 高倍' : v === 4 ? ' 低倍' : ''), value: String(v) }; }), String(state.obj), function (v) { state.obj = +v; render(); });
  var chipsAp = B.chips(B.$('#ap-chips'), [{ label: '小光圈', value: 'small' }, { label: '大光圈', value: 'big' }], state.ap, function (v) { state.ap = v; render(); });
  var chipsMir = B.chips(B.$('#mir-chips'), [{ label: '平面镜', value: 'flat' }, { label: '凹面镜', value: 'concave' }], state.mir, function (v) { state.mir = v; render(); });
  var focusIn = B.$('#focus');
  focusIn.value = state.focus;
  B.bindRange(focusIn, function (v) { state.focus = v; render(); });

  B.$$('#pad button').forEach(function (b) {
    b.addEventListener('click', function () {
      var d = b.dataset.d.split(',').map(Number);
      if (d[0] === 0 && d[1] === 0) { state.px = 0; state.py = 0; }
      else {
        var step = 26 / scale();
        state.px += d[0] * step; state.py += d[1] * step;
      }
      render();
    });
  });

  function mag() { return state.eye * state.obj; }
  function scale() { return mag() * K; }
  function brightness() {
    var ap = state.ap === 'big' ? 1 : 0.55, mi = state.mir === 'concave' ? 1 : 0.6;
    var ob = { 4: 1, 10: 0.62, 40: 0.32 }[state.obj], ey = { 5: 1, 10: 0.92, 16: 0.82 }[state.eye];
    return Math.min(1, ap * mi * ob * ey * 1.6);
  }
  function blur() { return Math.abs(state.focus - FOCUS_TARGET[state.obj]) * FOCUS_SENS[state.obj]; }
  function imageOffset() { var s = scale(); return [-s * state.px, -s * state.py]; }

  function posWord(dx, dy) {
    if (Math.hypot(dx, dy) > R + 30) return '看不到';
    return dirWord(dx, dy);
  }
  function dirWord(dx, dy) {
    var h = dx < -16 ? '左' : dx > 16 ? '右' : '', v = dy < -16 ? '上' : dy > 16 ? '下' : '';
    if (!h && !v) return '中央';
    return h + v + '方';
  }

  function render() {
    var s = scale();
    spec.setAttribute('transform', 'translate(' + CX + ',' + CY + ') rotate(180) scale(' + s + ') translate(' + state.px + ',' + state.py + ')');
    var sp = specimens[state.sp];
    var isLetter = state.sp === 'letter';
    wallsEl.setAttribute('d', isLetter ? '' : sp.walls);
    nucEl.setAttribute('d', isLetter ? '' : sp.nuclei);
    letterEl.style.display = isLetter ? '' : 'none';
    if (state.sp === 'cheek') { wallsEl.setAttribute('fill', '#ecdcc9'); wallsEl.setAttribute('stroke', '#b29a7f'); }
    else { wallsEl.setAttribute('fill', '#f1e7c3'); wallsEl.setAttribute('stroke', '#a4935e'); }

    var b = brightness(), bl = blur();
    dark.setAttribute('fill-opacity', ((1 - b) * 0.88).toFixed(3));
    blurEl.setAttribute('stdDeviation', Math.min(bl, 6).toFixed(2));

    // 数视野里的细胞
    var count = 0;
    sp.centers.forEach(function (c) {
      var x = -s * (c[0] + state.px), y = -s * (c[1] + state.py);
      if (x * x + y * y < R * R) count++;
    });
    var off = imageOffset();
    var where;
    if (isLetter) where = posWord(off[0], off[1]);
    else if (!count) where = '看不到';
    else where = Math.hypot(off[0], off[1]) < R * 0.6 ? '中央' : '组织偏' + dirWord(off[0], off[1]).replace('方', '');

    var m = mag();
    B.$('#r-mag').innerHTML = m + '<small>×</small>';
    B.$('#mag-badge').textContent = m + ' 倍';
    magText.textContent = state.eye + '× 目镜 × ' + state.obj + '× 物镜';
    B.$('#r-count').innerHTML = isLetter ? '<small style="margin:0">（字母玻片）</small>' : (count > 0 ? '约 ' + count + '<small>个</small>' : '0<small>个</small>');
    var lightWord = b < 0.22 ? '很暗' : b < 0.4 ? '偏暗' : b < 0.75 ? '合适' : '明亮';
    B.$('#r-light').textContent = lightWord;
    B.$('#r-pos').textContent = where;
    var clear = bl < 0.6;
    B.$('#focus-out').textContent = clear ? '清晰' : bl < 2 ? '有点模糊' : '很模糊';

    var tips = [];
    if (!clear) tips.push('画面模糊，转动细准焦螺旋把它调清楚。');
    if (b < 0.4) tips.push('视野太暗，试试换大光圈或凹面镜。');
    if (isLetter && Math.hypot(off[0], off[1]) < R) tips.push('玻片上写的是“b”，视野里看到的却是“q”——上下左右都颠倒了。');
    if (!isLetter && count > 0 && m >= 400) tips.push('高倍镜下细胞又大又少，能看清细胞核（被碘液染成深色的小点）。');
    if (!isLetter && count > 0 && m <= 50) tips.push('低倍镜下看到的范围大，细胞又多又小。');
    if (!tips.length) tips.push('试试换镜头，或者按右边的箭头移动玻片。');
    B.$('#r-text').textContent = tips.join('');
    hint.textContent = sp.name + ' · 放大 ' + m + ' 倍';

    B.setState({ sp: state.sp, e: state.eye, o: state.obj, ap: state.ap, mi: state.mir, f: state.focus, px: Math.round(state.px), py: Math.round(state.py) });
  }

  function syncControls() {
    chipsSp.set(state.sp); chipsEye.set(String(state.eye)); chipsObj.set(String(state.obj));
    chipsAp.set(state.ap); chipsMir.set(state.mir);
    focusIn.value = state.focus; B.paintRange(focusIn);
  }

  /* —— 细胞结构图 —— */
  var PARTS = {
    wall: ['细胞壁', '植物细胞最外面的一层“硬壳”，起<b>保护和支持</b>作用，让植物能挺立。动物细胞没有细胞壁。'],
    membrane: ['细胞膜', '紧贴在里面的一层很薄的膜，像小区门口的<b>门卫</b>：让有用的物质进来，把废物排出去，<b>控制物质进出</b>。'],
    cyto: ['细胞质', '细胞膜里面、细胞核外面的部分，是会缓缓流动的。很多生命活动都在这里进行。'],
    nucleus: ['细胞核', '里面有<b>遗传物质</b>，是细胞的“指挥中心”，控制着细胞的生长、发育和遗传。用碘液染色时，细胞核染得最深。'],
    vacuole: ['液泡', '装着<b>细胞液</b>，里面溶解着糖分、色素等。西瓜的甜味、柠檬的酸味、花瓣的颜色，很多都来自液泡。'],
    chloro: ['叶绿体', '进行<b>光合作用</b>的地方，把光能转变成化学能储存在有机物里。只有植物<b>绿色部分</b>的细胞才有。'],
    mito: ['线粒体', '进行<b>呼吸作用</b>的地方，把有机物里的能量释放出来，供细胞使用。植物细胞和动物细胞都有。']
  };
  var cellfig = B.$('#cellfig');
  var cellType = 'plant', selected = null, partEls = {};
  B.chips(B.$('#cell-chips'), [{ label: '植物细胞（叶肉细胞）', value: 'plant' }, { label: '动物细胞（口腔上皮细胞）', value: 'animal' }], 'plant', function (v) { cellType = v; drawCell(); });

  function part(key, el) {
    el.classList.add('svg-hit');
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', PARTS[key][0]);
    var go = function (e) { e.stopPropagation(); select(key); };
    el.addEventListener('click', go);
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(e); } });
    (partEls[key] = partEls[key] || []).push(el);
    return el;
  }
  function label(x, y, tx, ty, text, key) {
    var g = S('g', {}, cellfig);
    S('path', { d: 'M' + x + ' ' + y + 'L' + tx + ' ' + ty, stroke: '#a7b59f', 'stroke-width': 1 }, g);
    S('circle', { cx: x, cy: y, r: 2.2, fill: '#6f8466' }, g);
    var t = S('text', { x: tx + (tx > 200 ? 4 : -4), y: ty + 4, 'font-size': 12, 'text-anchor': tx > 200 ? 'start' : 'end', fill: '#455d48', text: text }, g);
    t.style.cursor = 'pointer';
    t.addEventListener('click', function () { select(key); });
    g.dataset.key = key;
    return g;
  }
  function drawCell() {
    cellfig.innerHTML = ''; partEls = {};
    if (cellType === 'plant') {
      part('wall', S('rect', { x: 110, y: 30, width: 180, height: 180, rx: 14, fill: '#d9e6c8', stroke: '#7d9a6a', 'stroke-width': 7 }, cellfig));
      part('membrane', S('rect', { x: 117, y: 37, width: 166, height: 166, rx: 10, fill: 'none', stroke: '#9fb796', 'stroke-width': 2.2 }, cellfig));
      part('cyto', S('rect', { x: 119, y: 39, width: 162, height: 162, rx: 9, fill: '#eef4e2' }, cellfig));
      part('vacuole', S('path', { d: 'M150 70C190 56 252 62 258 108S240 178 196 178 140 160 138 124 130 78 150 70z', fill: '#d8ebf0', stroke: '#9cc0cc', 'stroke-width': 1.5 }, cellfig));
      part('nucleus', S('circle', { cx: 145, cy: 172, r: 16, fill: '#c69a74', stroke: '#9c6334', 'stroke-width': 1.5 }, cellfig));
      S('circle', { cx: 148, cy: 169, r: 5, fill: '#9c6334', 'pointer-events': 'none' }, cellfig);
      [[134, 52, 20], [262, 66, -30], [270, 150, 70], [232, 190, 10], [178, 192, -10], [128, 106, 80], [200, 48, 0]].forEach(function (c) {
        part('chloro', S('ellipse', { cx: c[0], cy: c[1], rx: 10, ry: 5.5, transform: 'rotate(' + c[2] + ' ' + c[0] + ' ' + c[1] + ')', fill: '#7fae6a', stroke: '#4e7f45', 'stroke-width': 1 }, cellfig));
      });
      [[250, 186, 40], [126, 140, -20]].forEach(function (c) {
        part('mito', S('ellipse', { cx: c[0], cy: c[1], rx: 7, ry: 3.6, transform: 'rotate(' + c[2] + ' ' + c[0] + ' ' + c[1] + ')', fill: '#e2a77a', stroke: '#b97342', 'stroke-width': 1 }, cellfig));
      });
      label(110, 60, 70, 40, '细胞壁', 'wall');
      label(118, 92, 70, 84, '细胞膜', 'membrane');
      label(128, 160, 70, 130, '细胞质', 'cyto');
      label(140, 182, 70, 196, '细胞核', 'nucleus');
      label(220, 110, 330, 110, '液泡', 'vacuole');
      label(262, 66, 330, 48, '叶绿体', 'chloro');
      label(250, 186, 330, 196, '线粒体', 'mito');
    } else {
      part('membrane', S('path', { d: 'M130 72C168 30 252 36 280 82S292 176 248 200 140 214 116 166 104 102 130 72z', fill: 'none', stroke: '#b29a7f', 'stroke-width': 3 }, cellfig));
      part('cyto', S('path', { d: 'M132 74C168 34 250 40 277 83S289 174 246 197 142 210 119 165 108 103 132 74z', fill: '#f4e9dc' }, cellfig));
      part('nucleus', S('circle', { cx: 198, cy: 124, r: 22, fill: '#c69a74', stroke: '#9c6334', 'stroke-width': 1.5 }, cellfig));
      S('circle', { cx: 202, cy: 120, r: 6, fill: '#9c6334', 'pointer-events': 'none' }, cellfig);
      [[150, 110, 30], [252, 92, -20], [240, 172, 50], [160, 178, -40]].forEach(function (c) {
        part('mito', S('ellipse', { cx: c[0], cy: c[1], rx: 8, ry: 4, transform: 'rotate(' + c[2] + ' ' + c[0] + ' ' + c[1] + ')', fill: '#e2a77a', stroke: '#b97342', 'stroke-width': 1 }, cellfig));
      });
      label(130, 72, 70, 50, '细胞膜', 'membrane');
      label(140, 150, 70, 150, '细胞质', 'cyto');
      label(214, 132, 330, 132, '细胞核', 'nucleus');
      label(252, 92, 330, 70, '线粒体', 'mito');
      S('text', { x: 200, y: 232, 'text-anchor': 'middle', 'font-size': 11, fill: '#8b9784', text: '没有细胞壁、没有叶绿体，也没有大液泡' }, cellfig);
    }
    if (selected && partEls[selected]) highlight(selected); else if (selected) select(null);
  }
  function highlight(key) {
    for (var k in partEls) partEls[k].forEach(function (el) { el.style.filter = k === key ? 'drop-shadow(0 0 4px #b97342)' : ''; });
  }
  function select(key) {
    selected = key;
    var box = B.$('#part-info');
    if (!key) { box.innerHTML = '<h3>点一点左边的细胞</h3><p>每个部分都有自己的工作。</p>'; highlight(null); return; }
    box.innerHTML = '<h3>' + PARTS[key][0] + '</h3><p>' + PARTS[key][1] + '</p>';
    highlight(key);
  }
  drawCell();
  render();

  /* —— 小练习 —— */
  B.quiz([
    {
      title: '让视野里的细胞最多',
      desc: '装片选“洋葱表皮”，换一换目镜和物镜，找到能看到<b>最多细胞</b>的组合。',
      check: function () {
        if (state.sp === 'letter') return { ok: false, msg: '先把装片换成洋葱表皮或口腔上皮。' };
        if (state.eye === 5 && state.obj === 4) return { ok: true, msg: '5× × 4× = 20 倍，是这里最小的放大倍数：看到的范围最大，细胞最多、也最小。' };
        return { ok: false, msg: '现在是 ' + mag() + ' 倍。放大倍数越小，看到的细胞越多。' };
      }
    },
    {
      title: '把物像移到视野中央',
      desc: '已经换成“字母 b”玻片，字母跑到了视野的<b>左下方</b>。用右边的箭头移动玻片，把它移到正中央。',
      setup: function () {
        state.sp = 'letter'; state.eye = 10; state.obj = 4; state.focus = FOCUS_TARGET[4];
        var s = scale(); state.px = 70 / s; state.py = -62 / s;
        syncControls(); render();
      },
      check: function () {
        if (state.sp !== 'letter') return { ok: false, msg: '请用“字母 b”玻片做这道题。' };
        var off = imageOffset();
        if (Math.hypot(off[0], off[1]) < 22) return { ok: true, msg: '像在左下，玻片就往左下移。你也发现了：玻片上写的是 b，看到的却是 q。' };
        return { ok: false, msg: '字母现在在视野的' + posWord(off[0], off[1]) + '。记住：像偏哪边，玻片就往哪边移。' };
      }
    },
    {
      title: '换高倍镜后，调亮、调清楚',
      desc: '装片换回洋葱表皮。把物镜换成 <b>40×</b>，然后想办法让视野<b>亮度合适</b>，细胞<b>清晰</b>。',
      setup: function () {
        state.sp = 'onion'; state.px = 0; state.py = 0; state.ap = 'small'; state.mir = 'flat'; state.focus = FOCUS_TARGET[10];
        syncControls(); render();
      },
      check: function () {
        if (state.obj !== 40) return { ok: false, msg: '先把物镜换成 40×。' };
        if (brightness() < 0.4) return { ok: false, msg: '视野还是太暗。高倍镜下进光少，要用大光圈和凹面镜。' };
        if (blur() >= 0.6) return { ok: false, msg: '亮度够了，但还模糊。慢慢拖动细准焦螺旋。' };
        return { ok: true, msg: '高倍镜下：用大光圈 + 凹面镜调亮，只调细准焦螺旋调清楚。' };
      }
    }
  ]);
})();
