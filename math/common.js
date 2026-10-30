/* 数学互动馆 · 公共脚本：课程目录、翻页、分享、链接状态、坐标系与作图、小练习 */
(function () {
  'use strict';

  var LESSONS = [
    { id: 'solids', file: 'solids.html', no: 1, title: '立体图形与三视图', book: '七上' },
    { id: 'rational', file: 'rational.html', no: 2, title: '有理数与数轴', book: '七上' },
    { id: 'algebra', file: 'algebra.html', no: 3, title: '代数式与整式加减', book: '七上' },
    { id: 'plane', file: 'plane.html', no: 4, title: '线、角与基本平面图形', book: '七上' },
    { id: 'equation', file: 'equation.html', no: 5, title: '一元一次方程', book: '七上' },
    { id: 'data1', file: 'data1.html', no: 6, title: '数据的收集与表示', book: '七上' },
    { id: 'power', file: 'power.html', no: 7, title: '幂的运算与整式乘除', book: '七下' },
    { id: 'parallel', file: 'parallel.html', no: 8, title: '相交线与平行线', book: '七下' },
    { id: 'prob1', file: 'prob1.html', no: 9, title: '概率初步', book: '七下' },
    { id: 'triangle', file: 'triangle.html', no: 10, title: '三角形与全等', book: '七下' },
    { id: 'symmetry', file: 'symmetry.html', no: 11, title: '轴对称、平移与旋转', book: '七下' },
    { id: 'variable', file: 'variable.html', no: 12, title: '变量之间的关系', book: '七下' },
    { id: 'pythag', file: 'pythag.html', no: 13, title: '勾股定理', book: '八上' },
    { id: 'real', file: 'real.html', no: 14, title: '实数与二次根式', book: '八上' },
    { id: 'coord', file: 'coord.html', no: 15, title: '位置与坐标', book: '八上' },
    { id: 'linear', file: 'linear.html', no: 16, title: '一次函数', book: '八上' },
    { id: 'system', file: 'system.html', no: 17, title: '二元一次方程组', book: '八上' },
    { id: 'data2', file: 'data2.html', no: 18, title: '数据的分析', book: '八上' },
    { id: 'proof', file: 'proof.html', no: 19, title: '证明与三角形的证明', book: '八上' },
    { id: 'inequal', file: 'inequal.html', no: 20, title: '不等式与不等式组', book: '八下' },
    { id: 'factor', file: 'factor.html', no: 21, title: '因式分解', book: '八下' },
    { id: 'fraction', file: 'fraction.html', no: 22, title: '分式与分式方程', book: '八下' },
    { id: 'para', file: 'para.html', no: 23, title: '平行四边形与特殊平行四边形', book: '八下' },
    { id: 'quad', file: 'quad.html', no: 24, title: '一元二次方程', book: '九上' },
    { id: 'prob2', file: 'prob2.html', no: 25, title: '概率的进一步认识', book: '九上' },
    { id: 'similar', file: 'similar.html', no: 26, title: '图形的相似', book: '九上' },
    { id: 'inverse', file: 'inverse.html', no: 27, title: '反比例函数', book: '九上' },
    { id: 'trig', file: 'trig.html', no: 28, title: '直角三角形的边角关系', book: '九下' },
    { id: 'quadfun', file: 'quadfun.html', no: 29, title: '二次函数', book: '九下' },
    { id: 'circle', file: 'circle.html', no: 30, title: '圆', book: '九下' }
  ];

  var NS = 'http://www.w3.org/2000/svg';

  function svg(tag, attrs, parent) {
    var el = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) {
      if (attrs[k] === null || attrs[k] === undefined) continue;
      if (k === 'text') el.textContent = attrs[k];
      else el.setAttribute(k, attrs[k]);
    }
    if (parent) parent.appendChild(el);
    return el;
  }

  function html(tag, attrs, parent) {
    var el = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (attrs[k] === null || attrs[k] === undefined) continue;
      if (k === 'text') el.textContent = attrs[k];
      else if (k === 'html') el.innerHTML = attrs[k];
      else if (k === 'class') el.className = attrs[k];
      else el.setAttribute(k, attrs[k]);
    }
    if (parent) parent.appendChild(el);
    return el;
  }

  function $(s, root) { return (root || document).querySelector(s); }
  function $$(s, root) { return Array.prototype.slice.call((root || document).querySelectorAll(s)); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* —— 数字排版 —— */
  /* 去掉浮点尾巴：0.30000000000000004 -> 0.3 */
  function fmt(n, d) {
    if (!isFinite(n)) return '—';
    var s = (+n).toFixed(d === undefined ? 4 : d);
    if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
    if (s === '-0') s = '0';
    return s;
  }
  /* 最简分数：gcd 约分，分母为 1 时只显示整数 */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }
  function frac(a, b) {
    if (b < 0) { a = -a; b = -b; }
    var g = gcd(a, b); a /= g; b /= g;
    if (b === 1) return String(a);
    return (a < 0 ? '-' : '') + '<span class="frac"><i>' + Math.abs(a) + '</i><i>' + b + '</i></span>';
  }
  /* 带符号的项，用于拼公式：sign(3) -> ' + 3'，sign(-3) -> ' − 3' */
  function sign(n, unit) {
    var s = n < 0 ? ' − ' : ' + ';
    return s + fmt(Math.abs(n)) + (unit || '');
  }
  function sup(n) { return '<sup>' + n + '</sup>'; }
  function sqrt(inner) { return '<span class="radical">√<span>' + inner + '</span></span>'; }

  /* —— 链接里的状态：#a=1&b=2 —— */
  function getState() {
    var out = {};
    var h = location.hash.replace(/^#/, '');
    if (!h) return out;
    h.split('&').forEach(function (p) {
      var i = p.indexOf('=');
      if (i < 0) return;
      try { out[decodeURIComponent(p.slice(0, i))] = decodeURIComponent(p.slice(i + 1)); } catch (e) {}
    });
    return out;
  }
  var stateTimer = null;
  function setState(obj) {
    clearTimeout(stateTimer);
    stateTimer = setTimeout(function () {
      var parts = [];
      for (var k in obj) if (obj[k] !== undefined && obj[k] !== null && obj[k] !== '') parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]));
      var url = location.pathname + location.search + (parts.length ? '#' + parts.join('&') : '');
      try { history.replaceState(null, '', url); } catch (e) {}
    }, 120);
  }
  function num(v, dflt, min, max) {
    var n = parseFloat(v);
    if (!isFinite(n)) return dflt;
    if (min !== undefined) n = clamp(n, min, max);
    return n;
  }

  /* 滑块左侧填色 */
  function paintRange(input) {
    var min = +input.min, max = +input.max, v = +input.value;
    input.style.setProperty('--position', ((v - min) / (max - min) * 100) + '%');
  }
  function bindRange(input, fn) {
    var run = function () { paintRange(input); fn(+input.value); };
    input.addEventListener('input', run);
    paintRange(input);
    return run;
  }

  /* 一组按钮单选 */
  function chips(container, items, value, onChange) {
    container.innerHTML = '';
    var btns = items.map(function (it) {
      var b = html('button', { type: 'button', html: it.label, 'aria-pressed': String(it.value === value) }, container);
      b.dataset.value = it.value;
      b.addEventListener('click', function () { set(it.value, true); });
      return b;
    });
    function set(v, fire) {
      value = v;
      btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.value === String(v))); });
      if (fire && onChange) onChange(v);
    }
    return { set: set, get: function () { return value; } };
  }

  /* —— 坐标系 ——
     axes(svgEl, {xmin,xmax,ymin,ymax, left,right,top,bottom, xstep,ystep, xlabel,ylabel, grid})
     返回 { X(x), Y(y), ix(px), iy(py), layer, w, h } ；X/Y 把数学坐标换成画布坐标 */
  function axes(el, o) {
    o = o || {};
    var vb = (el.getAttribute('viewBox') || '0 0 400 300').split(/\s+/).map(Number);
    var w = vb[2], h = vb[3];
    var L = o.left === undefined ? 34 : o.left, R = o.right === undefined ? 12 : o.right;
    var T = o.top === undefined ? 12 : o.top, B = o.bottom === undefined ? 26 : o.bottom;
    var xmin = o.xmin === undefined ? -5 : o.xmin, xmax = o.xmax === undefined ? 5 : o.xmax;
    var ymin = o.ymin === undefined ? -5 : o.ymin, ymax = o.ymax === undefined ? 5 : o.ymax;
    var X = function (x) { return L + (x - xmin) / (xmax - xmin) * (w - L - R); };
    var Y = function (y) { return h - B - (y - ymin) / (ymax - ymin) * (h - T - B); };
    var ix = function (px) { return xmin + (px - L) / (w - L - R) * (xmax - xmin); };
    var iy = function (py) { return ymin + (h - B - py) / (h - T - B) * (ymax - ymin); };
    el.innerHTML = '';
    var xs = o.xstep || 1, ys = o.ystep || 1, i;
    var g = svg('g', { class: 'ax-grid' }, el);
    if (o.grid !== false) {
      for (i = Math.ceil(xmin / xs) * xs; i <= xmax + 1e-9; i += xs) svg('line', { x1: X(i), y1: Y(ymin), x2: X(i), y2: Y(ymax), stroke: '#dfe3ea', 'stroke-width': 1 }, g);
      for (i = Math.ceil(ymin / ys) * ys; i <= ymax + 1e-9; i += ys) svg('line', { x1: X(xmin), y1: Y(i), x2: X(xmax), y2: Y(i), stroke: '#dfe3ea', 'stroke-width': 1 }, g);
    }
    var a = svg('g', { class: 'ax-axis' }, el);
    var y0 = clamp(0, ymin, ymax), x0 = clamp(0, xmin, xmax);
    svg('line', { x1: X(xmin), y1: Y(y0), x2: X(xmax), y2: Y(y0), stroke: '#5b6475', 'stroke-width': 1.6 }, a);
    svg('line', { x1: X(x0), y1: Y(ymin), x2: X(x0), y2: Y(ymax), stroke: '#5b6475', 'stroke-width': 1.6 }, a);
    svg('path', { d: 'M' + X(xmax) + ' ' + Y(y0) + 'l-6 -3.4v6.8z', fill: '#5b6475' }, a);
    svg('path', { d: 'M' + X(x0) + ' ' + Y(ymax) + 'l-3.4 6h6.8z', fill: '#5b6475' }, a);
    var t = svg('g', { class: 'ax-text' }, el);
    var lab = o.labelStep || xs;
    for (i = Math.ceil(xmin / lab) * lab; i <= xmax + 1e-9; i += lab) {
      if (Math.abs(i) < 1e-9) continue;
      svg('text', { x: X(i), y: Y(y0) + 14, 'text-anchor': 'middle', 'font-size': 10, fill: '#6b7385', text: fmt(i) }, t);
    }
    var ylab = o.ylabelStep || ys;
    for (i = Math.ceil(ymin / ylab) * ylab; i <= ymax + 1e-9; i += ylab) {
      if (Math.abs(i) < 1e-9) continue;
      svg('text', { x: X(x0) - 6, y: Y(i) + 3.5, 'text-anchor': 'end', 'font-size': 10, fill: '#6b7385', text: fmt(i) }, t);
    }
    svg('text', { x: X(x0) - 6, y: Y(y0) + 14, 'text-anchor': 'end', 'font-size': 10, fill: '#6b7385', text: 'O' }, t);
    svg('text', { x: X(xmax) - 2, y: Y(y0) + 18, 'text-anchor': 'end', 'font-size': 11, fill: '#5b6475', 'font-style': 'italic', text: o.xlabel || 'x' }, t);
    svg('text', { x: X(x0) + 8, y: Y(ymax) + 10, 'font-size': 11, fill: '#5b6475', 'font-style': 'italic', text: o.ylabel || 'y' }, t);
    return { X: X, Y: Y, ix: ix, iy: iy, layer: svg('g', {}, el), el: el, w: w, h: h, xmin: xmin, xmax: xmax, ymin: ymin, ymax: ymax };
  }

  /* 函数作图：返回 path 的 d。跳过无定义与跨出画布的点（反比例函数在 x=0 断开） */
  function curve(ax, fn, from, to, steps) {
    from = from === undefined ? ax.xmin : from;
    to = to === undefined ? ax.xmax : to;
    steps = steps || 240;
    var d = '', pen = false, pad = (ax.ymax - ax.ymin) * 0.6;
    for (var i = 0; i <= steps; i++) {
      var x = from + (to - from) * i / steps, y = fn(x);
      if (!isFinite(y) || y > ax.ymax + pad || y < ax.ymin - pad) { pen = false; continue; }
      d += (pen ? 'L' : 'M') + fmt(ax.X(x), 2) + ' ' + fmt(ax.Y(y), 2);
      pen = true;
    }
    return d;
  }

  /* 画布坐标：把指针事件换算成 viewBox 里的坐标 */
  function svgPoint(el, evt) {
    var r = el.getBoundingClientRect();
    var vb = (el.getAttribute('viewBox') || '0 0 400 300').split(/\s+/).map(Number);
    return { x: (evt.clientX - r.left) / r.width * vb[2], y: (evt.clientY - r.top) / r.height * vb[3] };
  }

  /* 可拖动点：按下并移动时持续回调数学坐标；也支持方向键 */
  function drag(ax, handle, onMove, keyStep) {
    var el = ax.el, on = false;
    function go(e) { var p = svgPoint(el, e); onMove(ax.ix(p.x), ax.iy(p.y)); }
    handle.style.cursor = 'grab';
    handle.addEventListener('pointerdown', function (e) {
      on = true; try { handle.setPointerCapture(e.pointerId); } catch (err) {}
      handle.style.cursor = 'grabbing'; go(e); e.preventDefault();
    });
    handle.addEventListener('pointermove', function (e) { if (on) { go(e); e.preventDefault(); } });
    handle.addEventListener('pointerup', function () { on = false; handle.style.cursor = 'grab'; });
    handle.addEventListener('pointercancel', function () { on = false; });
    el.addEventListener('pointerdown', function (e) { if (e.target === el || e.target.classList.contains('hit')) go(e); });
    if (keyStep) {
      handle.setAttribute('tabindex', '0');
      handle.addEventListener('keydown', function (e) {
        var k = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
        if (!k) return;
        e.preventDefault(); keyStep(k[0], k[1]);
      });
    }
  }

  /* 数轴：numline(svgEl, {min,max,step}) 返回 { X(x), ix(px), layer } */
  function numline(el, o) {
    o = o || {};
    var vb = (el.getAttribute('viewBox') || '0 0 400 90').split(/\s+/).map(Number);
    var w = vb[2], h = vb[3], pad = o.pad === undefined ? 24 : o.pad;
    var min = o.min === undefined ? -5 : o.min, max = o.max === undefined ? 5 : o.max;
    var y = o.y === undefined ? h * 0.56 : o.y;
    var X = function (x) { return pad + (x - min) / (max - min) * (w - pad * 2); };
    var ix = function (px) { return min + (px - pad) / (w - pad * 2) * (max - min); };
    el.innerHTML = '';
    svg('line', { x1: X(min), y1: y, x2: X(max), y2: y, stroke: '#5b6475', 'stroke-width': 1.8 }, el);
    svg('path', { d: 'M' + X(max) + ' ' + y + 'l-7 -4v8z', fill: '#5b6475' }, el);
    var step = o.step || 1;
    for (var i = Math.ceil(min / step) * step; i <= max + 1e-9; i += step) {
      var big = Math.abs(i % (o.labelStep || step)) < 1e-9;
      svg('line', { x1: X(i), y1: y - (big ? 6 : 3), x2: X(i), y2: y + (big ? 6 : 3), stroke: '#8d95a6', 'stroke-width': 1.2 }, el);
      if (big) svg('text', { x: X(i), y: y + 20, 'text-anchor': 'middle', 'font-size': 11, fill: '#6b7385', text: fmt(i) }, el);
    }
    return { X: X, ix: ix, y: y, el: el, layer: svg('g', {}, el), min: min, max: max, w: w, h: h };
  }

  /* —— 课程目录与翻页 —— */
  function renderNav() {
    var id = document.body.dataset.module;
    var nav = $('#course-nav');
    if (nav) {
      nav.innerHTML = '';
      html('a', { href: 'index.html', html: '<b>首页</b>全部课程' }, nav);
      LESSONS.forEach(function (l) {
        var a = html('a', { href: l.file, html: '<b>' + l.no + '</b>' + l.title }, nav);
        if (l.id === id) { a.setAttribute('aria-current', 'page'); setTimeout(function () { a.scrollIntoView({ block: 'nearest', inline: 'center' }); }, 0); }
      });
    }
    var pager = $('#pager');
    if (pager) {
      var i = -1;
      LESSONS.forEach(function (l, k) { if (l.id === id) i = k; });
      pager.innerHTML = '';
      if (i > 0) html('a', { href: LESSONS[i - 1].file, html: '← 上一课<strong>' + LESSONS[i - 1].title + '</strong>' }, pager);
      if (i >= 0 && i < LESSONS.length - 1) html('a', { class: 'next', href: LESSONS[i + 1].file, html: '下一课 →<strong>' + LESSONS[i + 1].title + '</strong>' }, pager);
      else html('a', { class: 'next', href: 'index.html', html: '回到首页 →<strong>全部 ' + LESSONS.length + ' 课</strong>' }, pager);
    }
  }

  /* —— 分享 —— */
  function copyText(t) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(t);
    return new Promise(function (res, rej) {
      var ta = html('textarea', {}, document.body);
      ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0';
      ta.select();
      try { document.execCommand('copy') ? res() : rej(); } catch (e) { rej(e); }
      ta.remove();
    });
  }
  function openShare() {
    var url = location.href;
    var back = html('div', { class: 'modal-backdrop', role: 'dialog', 'aria-modal': 'true', 'aria-label': '分享' }, document.body);
    var box = html('div', { class: 'share-dialog' }, back);
    html('button', { class: 'close', type: 'button', 'aria-label': '关闭', text: '×' }, box).addEventListener('click', close);
    html('p', { class: 'eyebrow', text: '数学互动馆 · 分享' }, box);
    html('h2', { text: '把这一页发给同学' }, box);
    html('p', { text: '链接会带上你现在调好的参数，对方打开看到的图和你一样。' }, box);
    html('label', { for: 'share-url', text: '链接' }, box);
    var inp = html('input', { id: 'share-url', readonly: 'readonly' }, box);
    inp.value = url;
    var st = html('p', { class: 'copy-status', 'aria-live': 'polite' }, box);
    var btn = html('button', { class: 'primary', type: 'button', text: '复制链接' }, box);
    btn.addEventListener('click', function () {
      copyText(url).then(function () { st.textContent = '已复制，粘贴到微信发给好友吧。'; }, function () { inp.select(); st.textContent = '请长按上面的链接手动复制。'; });
    });
    html('div', { class: 'wechat-tip', text: '在微信里打开时，也可以点右上角「…」直接转发给朋友。' }, box);
    html('p', { class: 'share-disclaimer', text: '本站免登录，不收集任何个人信息。' }, box);
    document.body.classList.add('modal-open');
    back.addEventListener('click', function (e) { if (e.target === back) close(); });
    document.addEventListener('keydown', esc);
    btn.focus();
    function esc(e) { if (e.key === 'Escape') close(); }
    function close() { back.remove(); document.body.classList.remove('modal-open'); document.removeEventListener('keydown', esc); }
  }
  function bindShare() {
    $$('[data-share]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.dataset.share === 'copy') {
          copyText(location.href).then(function () { var o = b.innerHTML; b.textContent = '已复制 ✓'; setTimeout(function () { b.innerHTML = o; }, 1600); }, openShare);
        } else if (navigator.share && /Mobi|Android|iPhone/i.test(navigator.userAgent)) {
          navigator.share({ title: document.title, url: location.href }).catch(function () {});
        } else openShare();
      });
    });
  }

  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* —— 小练习引擎 ——
     { title, desc, label, button, setup(), check() -> {ok, msg} }   检查模型当前状态
     { title, desc, label, options:[...], answer, hint, explain }     选择题（选项每次打乱） */
  function quiz(items) {
    var i = 0, done = 0;
    var stepEl = $('#quiz-step'), titleEl = $('#quiz-title'), descEl = $('#quiz-description'), labelEl = $('#quiz-label');
    var optsEl = $('#quiz-options'), checkBtn = $('#check-answer'), fb = $('#quiz-feedback'), nextBtn = $('#next-question');
    if (!titleEl) return;
    function show() {
      var q = items[i];
      stepEl.textContent = (i + 1) + ' / ' + items.length;
      titleEl.textContent = q.title;
      descEl.innerHTML = q.desc || '';
      if (labelEl) labelEl.textContent = q.label || (q.options ? '选一个答案' : '在上面的模型里动手操作');
      fb.textContent = ''; fb.className = 'feedback';
      nextBtn.hidden = true;
      if (q.options) {
        checkBtn.hidden = true;
        optsEl.hidden = false; optsEl.innerHTML = '';
        optsEl.className = 'option-grid' + (q.options.some(function (o) { return o.length > 9; }) ? ' single' : '');
        var order = q.options.map(function (o, k) { return k; });
        if (!q.keepOrder) order = shuffle(order);
        order.forEach(function (k) {
          var b = html('button', { type: 'button', html: q.options[k] }, optsEl);
          b.dataset.k = String(k);
          b.addEventListener('click', function () {
            $$('button', optsEl).forEach(function (x) { x.classList.remove('correct', 'wrong'); });
            if (k === q.answer) { b.classList.add('correct'); pass(q.explain); }
            else { b.classList.add('wrong'); fb.className = 'feedback retry'; fb.textContent = q.hint || '再想想，可以回到上面的模型里试一试。'; }
          });
        });
      } else {
        optsEl.hidden = true;
        checkBtn.hidden = false;
        checkBtn.textContent = q.button || '检查我的操作';
        if (q.setup) q.setup();
      }
    }
    function pass(msg) {
      fb.className = 'feedback success';
      fb.innerHTML = '答对了！' + (msg || '');
      done = Math.max(done, i + 1);
      nextBtn.hidden = false;
      nextBtn.textContent = i < items.length - 1 ? '下一题' : '再从第 1 题做一遍';
    }
    checkBtn.addEventListener('click', function () {
      var r = items[i].check();
      if (r.ok) pass(r.msg);
      else { fb.className = 'feedback retry'; fb.innerHTML = r.msg || '还差一点，再调一调。'; }
    });
    nextBtn.addEventListener('click', function () { i = (i + 1) % items.length; show(); });
    show();
  }

  /* —— 配对题：items=[[题干, 答案值, 说明?]]，options=[[值, 显示名]] 或 function(i) —— */
  function match(listSel, scoreSel, items, options, explain) {
    var list = $(listSel), done = 0, right = 0;
    list.innerHTML = '';
    items.forEach(function (it, i) {
      var row = html('div', { class: 'choice-row', 'data-i': String(i), style: 'flex-direction:column;align-items:stretch' }, list);
      html('p', { html: '<b>' + it[0] + '</b>' }, row);
      var box = html('div', { class: 'chips small', style: 'flex-wrap:wrap;justify-content:flex-start' }, row);
      var verdict = html('p', { class: 'verdict', hidden: 'hidden' }, row);
      var opts = typeof options === 'function' ? options(i) : options;
      opts.forEach(function (o) {
        var b = html('button', { type: 'button', html: o[1], 'aria-pressed': 'false' }, box);
        b.dataset.v = o[0];
        b.addEventListener('click', function () {
          if (row.dataset.done) return;
          row.dataset.done = '1'; done++;
          var ok = b.dataset.v === String(it[1]); if (ok) right++;
          row.classList.add(ok ? 'correct' : 'wrong'); b.setAttribute('aria-pressed', 'true');
          verdict.hidden = false;
          verdict.innerHTML = (ok ? '✓ ' : '✗ ') + (explain ? explain(it, ok) : '');
          $(scoreSel).textContent = done === items.length ? '答对 ' + right + ' / ' + items.length : '已答 ' + done + ' / ' + items.length;
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () { renderNav(); bindShare(); });

  window.Mx = {
    LESSONS: LESSONS, svg: svg, html: html, $: $, $$: $$, clamp: clamp, lerp: lerp,
    fmt: fmt, frac: frac, gcd: gcd, sign: sign, sup: sup, sqrt: sqrt, num: num,
    getState: getState, setState: setState, bindRange: bindRange, paintRange: paintRange, chips: chips,
    axes: axes, curve: curve, svgPoint: svgPoint, drag: drag, numline: numline,
    quiz: quiz, match: match, shuffle: shuffle
  };
})();
