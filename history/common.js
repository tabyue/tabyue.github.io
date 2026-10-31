/* 历史互动馆 · 公共脚本：课程目录、翻页、分享、链接状态、时间轴、排序、小练习（沿用数学互动馆的框架） */
(function () {
  'use strict';

  var LESSONS = [
    { id: 'prehistory', file: 'prehistory.html', no: 1, title: '史前时期与中华文明起源', book: '七上' },
    { id: 'xiashang', file: 'xiashang.html', no: 2, title: '夏商周：从王朝更替到百家争鸣', book: '七上' },
    { id: 'qinhan', file: 'qinhan.html', no: 3, title: '秦汉：大一统国家的建立', book: '七上' },
    { id: 'sanguo', file: 'sanguo.html', no: 4, title: '三国两晋南北朝：分立与交融', book: '七上' },
    { id: 'suitang', file: 'suitang.html', no: 5, title: '隋唐：繁荣与开放', book: '七下' },
    { id: 'songyuan', file: 'songyuan.html', no: 6, title: '辽宋夏金元：民族关系与社会变化', book: '七下' },
    { id: 'mingqing', file: 'mingqing.html', no: 7, title: '明清（至鸦片战争前）', book: '七下' },
    { id: 'lateqing', file: 'lateqing.html', no: 8, title: '晚清：内忧外患与救亡图存', book: '八上' },
    { id: 'xinhai', file: 'xinhai.html', no: 9, title: '辛亥革命与中华民国建立', book: '八上' },
    { id: 'newdemo', file: 'newdemo.html', no: 10, title: '新民主主义革命的兴起', book: '八上' },
    { id: 'antijapan', file: 'antijapan.html', no: 11, title: '中华民族的抗日战争', book: '八上' },
    { id: 'liberation', file: 'liberation.html', no: 12, title: '人民解放战争', book: '八上' },
    { id: 'prc', file: 'prc.html', no: 13, title: '新中国的成立与社会主义建设', book: '八下' },
    { id: 'reform', file: 'reform.html', no: 14, title: '改革开放与中国特色社会主义', book: '八下' },
    { id: 'newera', file: 'newera.html', no: 15, title: '中国特色社会主义进入新时代', book: '八下' },
    { id: 'ancient', file: 'ancient.html', no: 16, title: '文明的产生和古代亚非文明', book: '九上' },
    { id: 'europe', file: 'europe.html', no: 17, title: '古代欧洲文明', book: '九上' },
    { id: 'medieval', file: 'medieval.html', no: 18, title: '中古时期的欧洲、亚洲、非洲和美洲', book: '九上' },
    { id: 'modern', file: 'modern.html', no: 19, title: '走向近代：文艺复兴与新航路', book: '九上' },
    { id: 'revolution', file: 'revolution.html', no: 20, title: '资本主义制度的初步确立', book: '九上' },
    { id: 'industry1', file: 'industry1.html', no: 21, title: '第一次工业革命与马克思主义', book: '九上' },
    { id: 'expand', file: 'expand.html', no: 22, title: '殖民地人民的反抗与资本主义扩展', book: '九下' },
    { id: 'industry2', file: 'industry2.html', no: 23, title: '第二次工业革命和近代科学文化', book: '九下' },
    { id: 'ww1', file: 'ww1.html', no: 24, title: '第一次世界大战和战后初期的世界', book: '九下' },
    { id: 'ww2', file: 'ww2.html', no: 25, title: '经济大危机和第二次世界大战', book: '九下' },
    { id: 'postwar', file: 'postwar.html', no: 26, title: '二战后的世界与和平发展', book: '九下' }
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

  /* 函数作图：返回 path 的 d。曲线在 y 方向精确裁到坐标系的上下边界，不会画出坐标区；
     相邻两点跳变超过一个坐标范围时视为间断（反比例函数在 x=0 处断开），不连线 */
  function curve(ax, fn, from, to, steps) {
    from = from === undefined ? ax.xmin : from;
    to = to === undefined ? ax.xmax : to;
    steps = steps || 240;
    var lo = ax.ymin, hi = ax.ymax, d = '', pen = false, prev = null;
    function P(x, y) { return fmt(ax.X(x), 2) + ' ' + fmt(ax.Y(y), 2); }
    function inside(y) { return y >= lo && y <= hi; }
    for (var i = 0; i <= steps; i++) {
      var x = from + (to - from) * i / steps, y = fn(x);
      if (!isFinite(y)) { pen = false; prev = null; continue; }
      if (prev) {
        var a = inside(prev.y), b = inside(y);
        if (Math.abs(y - prev.y) > (hi - lo)) { pen = false; }
        else if (a && b) { d += (pen ? '' : 'M' + P(prev.x, prev.y)) + 'L' + P(x, y); pen = true; }
        else if (a && !b) { var e1 = y > hi ? hi : lo, t1 = (e1 - prev.y) / (y - prev.y); d += (pen ? '' : 'M' + P(prev.x, prev.y)) + 'L' + P(prev.x + (x - prev.x) * t1, e1); pen = false; }
        else if (!a && b) { var e2 = prev.y > hi ? hi : lo, t2 = (e2 - prev.y) / (y - prev.y); d += 'M' + P(prev.x + (x - prev.x) * t2, e2) + 'L' + P(x, y); pen = true; }
        else pen = false;
      }
      prev = { x: x, y: y };
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
  /* 每课对应的新教材课目：由 tools/textbook/history.md 自动生成，不要手改 */
  var COVERS = {"prehistory": ["七上第1课 远古时期的人类活动", "七上第2课 原始农业与史前社会", "七上第3课 中华文明的起源", "七上第21课 活动课 从考古发现看中华文明的起源"], "xiashang": ["七上第4课 夏商西周王朝的更替", "七上第5课 动荡变化中的春秋时期", "七上第6课 战国时期的社会变革", "七上第7课 百家争鸣", "七上第8课 夏商周时期的科技与文化"], "qinhan": ["七上第9课 秦统一中国", "七上第10课 秦末农民大起义", "七上第11课 西汉建立和“文景之治”", "七上第12课 大一统王朝的巩固", "七上第13课 东汉的兴衰", "七上第14课 丝绸之路的开通与经营西域", "七上第15课 秦汉时期的科技与文化"], "sanguo": ["七上第16课 三国鼎立", "七上第17课 西晋的短暂统一和北方各族的内迁", "七上第18课 东晋南朝政治和江南地区开发", "七上第19课 北朝政治和北方民族大交融", "七上第20课 三国两晋南北朝时期的科技与文化"], "suitang": ["七下第1课 隋朝统一与灭亡", "七下第2课 唐朝建立与“贞观之治”", "七下第3课 开元盛世", "七下第4课 安史之乱与唐朝衰亡", "七下第5课 隋唐时期的民族交往与交融", "七下第6课 隋唐时期的中外文化交流", "七下第7课 隋唐时期的科技与文化"], "songyuan": ["七下第8课 北宋的政治", "七下第9课 辽、西夏与北宋并立", "七下第10课 金与南宋的对峙", "七下第11课 元朝的建立与统一", "七下第12课 辽宋夏金元时期经济的繁荣", "七下第13课 辽宋夏金元时期的对外交流", "七下第14课 辽宋夏金元时期的科技与文化"], "mingqing": ["七下第15课 明朝的统治", "七下第16课 明朝的对外关系", "七下第17课 明朝的灭亡和清朝的建立", "七下第18课 清朝的边疆治理", "七下第19课 清朝君主专制的强化", "七下第20课 明清时期社会经济的发展", "七下第21课 明清时期的科技与文化", "七下第22课 活动课 我国传统节日的起源和传承"], "lateqing": ["八上第1课 鸦片战争", "八上第2课 第二次鸦片战争", "八上第3课 太平天国运动", "八上第4课 洋务运动和边疆危机", "八上第5课 甲午中日战争与列强瓜分中国狂潮", "八上第6课 戊戌变法", "八上第7课 义和团运动和八国联军侵华"], "xinhai": ["八上第8课 中国同盟会", "八上第9课 辛亥革命", "八上第10课 帝制复辟与军阀割据"], "newdemo": ["八上第11课 五四运动", "八上第12课 中国共产党诞生", "八上第13课 国共合作与北伐战争", "八上第14课 毛泽东开辟井冈山道路", "八上第15课 中国工农红军长征与遵义会议"], "antijapan": ["八上第16课 从九一八事变到西安事变", "八上第17课 七七事变与全民族抗战", "八上第18课 全民族抗战中的正面战场和敌后战场", "八上第19课 抗日战争的胜利"], "liberation": ["八上第20课 国民党挑起内战", "八上第21课 人民解放战争的胜利", "八上第22课 活动课 探寻红色文化的历史基因"], "prc": ["八下第1课 中华人民共和国成立", "八下第2课 巩固人民民主政权", "八下第3课 社会主义制度的建立", "八下第4课 独立自主的和平外交", "八下第5课 艰辛探索与曲折发展", "八下第6课 社会主义建设的巨大成就和先锋模范", "八下第7课 国防现代化起步和外交工作新突破"], "reform": ["八下第8课 伟大的历史转折", "八下第9课 改革开放的起步", "八下第10课 改革开放和社会主义现代化建设的全面展开", "八下第11课 社会主义初级阶段基本路线", "八下第12课 加快改革开放和社会主义现代化建设步伐", "八下第13课 中国特色社会主义事业取得新成就", "八下第14课 国防和外交工作新局面"], "newera": ["八下第15课 开始全面建设小康社会", "八下第16课 夺取全面建设小康社会新胜利", "八下第17课 推进国防军队建设和外交工作", "八下第18课 擘画中国梦宏伟蓝图", "八下第19课 决胜全面建成小康社会", "八下第20课 维护国家安全和推进祖国统一", "八下第21课 构建人类命运共同体与中国特色大国外交", "八下第22课 实现第一个百年奋斗目标", "八下第23课 开启全面建设社会主义现代化国家新征程", "八下第24课 活动课 新时代社会生活的巨大变化"], "ancient": ["九上第1课 从原始社会到奴隶社会", "九上第2课 古代两河流域", "九上第3课 古代埃及", "九上第4课 古代印度"], "europe": ["九上第5课 古代希腊", "九上第6课 古代罗马"], "medieval": ["九上第7课 法兰克王国和西欧封建制度", "九上第8课 西欧的城市和大学", "九上第9课 拜占庭帝国", "九上第10课 封建时代的日本", "九上第11课 阿拉伯帝国", "九上第12课 中古时期的非洲和美洲"], "modern": ["九上第13课 西欧经济社会发展与文艺复兴运动", "九上第14课 探寻新航路", "九上第15课 早期殖民掠夺"], "revolution": ["九上第16课 英国资产阶级革命", "九上第17课 美国的独立", "九上第18课 法国大革命和拿破仑帝国"], "industry1": ["九上第19课 第一次工业革命", "九上第20课 马克思主义的诞生", "九上第21课 第一国际和巴黎公社", "九上第22课 活动课 唱响《国际歌》"], "expand": ["九下第1课 殖民地人民的反抗斗争", "九下第2课 俄国的改革", "九下第3课 美国内战", "九下第4课 日本明治维新"], "industry2": ["九下第5课 第二次工业革命", "九下第6课 工业化国家的社会变化", "九下第7课 近代科学与文化"], "ww1": ["九下第8课 第一次世界大战", "九下第9课 一战后的国际关系", "九下第10课 列宁与十月革命", "九下第11课 苏联的社会主义建设", "九下第12课 亚非拉民族民主运动的高涨"], "ww2": ["九下第13课 资本主义经济大危机", "九下第14课 法西斯国家的侵略扩张", "九下第15课 第二次世界大战"], "postwar": ["九下第16课 冷战的发生与两极格局的形成", "九下第17课 二战后资本主义国家的变化", "九下第18课 社会主义的曲折发展与奋起", "九下第19课 亚非拉国家的成长", "九下第20课 当代世界发展的基本特点", "九下第21课 和平发展合作共赢的历史潮流", "九下第22课 活动课 时事溯源"]};

  /* 页面标题下自动加一条“对应课本”，列出本课覆盖的新教材课目 */
  function renderCovers() {
    var id = document.body.dataset.module, list = COVERS[id], head = $('.page-heading');
    if (!list || !head || $('.covers')) return;
    var box = html('div', { class: 'covers' });
    html('span', { class: 'covers-label', text: '对应新教材' }, box);
    var ul = html('div', { class: 'covers-list' }, box);
    list.forEach(function (t) { html('span', { text: t }, ul); });
    head.appendChild(box);
  }

  function renderNav() {
    var id = document.body.dataset.module;
    renderCovers();
    var nav = $('#course-nav');
    if (nav) {
      nav.innerHTML = '';
      /* 首页胶囊不放进滚动区，否则当前课一居中它就被挤出去了 */
      html('a', { class: 'nav-home', href: 'index.html', html: '<b>首页</b><span>全部 ' + LESSONS.length + ' 课</span>' }, nav);
      var track = html('div', { class: 'nav-scroll' }, nav);
      LESSONS.forEach(function (l) {
        var a = html('a', { href: l.file, html: '<b>' + l.no + '</b>' + l.title }, track);
        if (l.id === id) {
          a.setAttribute('aria-current', 'page');
          /* 只滚导航自己，不要用 scrollIntoView 连带滚动整页 */
          setTimeout(function () { track.scrollLeft = Math.max(0, a.offsetLeft - track.clientWidth / 2 + a.clientWidth / 2); }, 0);
        }
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
    html('p', { class: 'eyebrow', text: '历史互动馆 · 分享' }, box);
    html('h2', { text: '把这一页发给同学' }, box);
    html('p', { text: '链接会带上你现在的选择，对方打开看到的和你一样。' }, box);
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
     { title, desc, label, options:[...], answer, hint, explain }     选择题（选项每次打乱）
     可选 level: 'base' 基础 / 'mid' 提高 / 'trap' 易错（专考本课那个坑） */
  var LEVELS = { base: ['基础', 'lv-base'], mid: ['提高', 'lv-mid'], trap: ['易错', 'lv-trap'] };

  function quiz(items) {
    var i = 0;
    var first = [];    /* 每题「第一次作答」对不对，用来算自测分 */
    var solved = [];   /* 每题最终是否答对 */
    var stepEl = $('#quiz-step'), titleEl = $('#quiz-title'), descEl = $('#quiz-description'), labelEl = $('#quiz-label');
    var optsEl = $('#quiz-options'), checkBtn = $('#check-answer'), fb = $('#quiz-feedback'), nextBtn = $('#next-question');
    if (!titleEl) return;
    var card = titleEl.parentNode;

    /* 题号导航：做过的题变色，可以直接跳回去重做 */
    var nav = html('div', { class: 'quiz-nav' });
    card.insertBefore(nav, card.firstChild);
    var badge = html('span', { class: 'lv', hidden: 'hidden' });
    if (labelEl && labelEl.parentNode) labelEl.parentNode.insertBefore(badge, labelEl.nextSibling);
    var result = html('div', { class: 'quiz-result', hidden: 'hidden', role: 'status' }, card);

    function renderNav() {
      nav.innerHTML = '';
      items.forEach(function (q, k) {
        var cls = 'dot';
        if (k === i) cls += ' on';
        if (solved[k]) cls += ' ok'; else if (first[k] === false) cls += ' bad';
        var d = html('button', { type: 'button', class: cls, text: String(k + 1), 'aria-label': '第 ' + (k + 1) + ' 题' + (solved[k] ? '（已答对）' : '') }, nav);
        d.addEventListener('click', function () { i = k; show(); });
      });
    }

    function show() {
      var q = items[i];
      stepEl.textContent = (i + 1) + ' / ' + items.length;
      titleEl.textContent = q.title;
      descEl.innerHTML = q.desc || '';
      if (labelEl) labelEl.textContent = q.label || (q.options ? '选一个答案' : '在上面的模型里动手操作');
      var lv = LEVELS[q.level];
      if (lv) { badge.hidden = false; badge.textContent = lv[0]; badge.className = 'lv ' + lv[1]; }
      else badge.hidden = true;
      fb.textContent = ''; fb.className = 'feedback';
      nextBtn.hidden = true;
      result.hidden = true;
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
            else {
              b.classList.add('wrong');
              if (first[i] === undefined) first[i] = false;
              fb.className = 'feedback retry';
              fb.innerHTML = q.hint || '再想想，可以回到上面的模型里试一试。';
              renderNav();
            }
          });
        });
      } else {
        optsEl.hidden = true;
        checkBtn.hidden = false;
        checkBtn.textContent = q.button || '检查我的操作';
        if (q.setup) q.setup();
      }
      renderNav();
    }

    function pass(msg) {
      fb.className = 'feedback success';
      fb.innerHTML = '答对了！' + (msg || '');
      if (first[i] === undefined) first[i] = true;
      solved[i] = true;
      nextBtn.hidden = false;
      renderNav();
      var all = items.every(function (_, k) { return solved[k]; });
      if (all) {
        /* 全部做完：留在原地把成绩显示出来，按钮变成重做 */
        summary();
        nextBtn.textContent = '重新做一遍';
        nextBtn.dataset.restart = '1';
      } else {
        nextBtn.textContent = i < items.length - 1 ? '下一题' : '回到还没做的题';
        delete nextBtn.dataset.restart;
      }
    }

    function summary() {
      var good = 0, weak = [];
      items.forEach(function (q, k) {
        if (first[k]) good++; else weak.push(q);
      });
      var n = items.length;
      var tip;
      if (good === n) tip = '全部一次做对，这一课掌握得很扎实。';
      else if (good >= n - 2) tip = '只有少数几题卡了一下，回头把下面这几题再想一遍就好。';
      else tip = '错得有点多，建议回到上面的模型重新动手试一遍，再来做题。';
      result.hidden = false;
      result.innerHTML = '<h4>本课自测：一次做对 ' + good + ' / ' + n + '</h4><p>' + tip + '</p>' +
        (weak.length ? '<p class="weak">需要再看的：' + weak.map(function (q) {
          return '<span>' + (LEVELS[q.level] ? LEVELS[q.level][0] + '·' : '') + q.title + '</span>';
        }).join('') + '</p>' : '');
    }

    checkBtn.addEventListener('click', function () {
      var r = items[i].check();
      if (r.ok) pass(r.msg);
      else {
        if (first[i] === undefined) first[i] = false;
        fb.className = 'feedback retry';
        fb.innerHTML = r.msg || '还差一点，再调一调。';
        renderNav();
      }
    });
    nextBtn.addEventListener('click', function () {
      if (nextBtn.dataset.restart) {
        first = []; solved = []; i = 0;
        delete nextBtn.dataset.restart;
      } else {
        /* 优先跳到还没做对的题，而不是机械地 +1 */
        var next = -1, k;
        for (k = 1; k <= items.length; k++) {
          var j = (i + k) % items.length;
          if (!solved[j]) { next = j; break; }
        }
        i = next >= 0 ? next : (i + 1) % items.length;
      }
      show();
    });
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


  /* —— 物理/化学站补充的小工具 —— */
  /* 带箭头的线段（不依赖 marker，缩放时箭头不变形）：返回 g */
  function arrow(parent, x1, y1, x2, y2, o) {
    o = o || {};
    var c = o.color || '#5b6475', w = o.width || 2, hl = o.head || 8 + w * 1.5, hw = o.headW || hl * 0.55;
    var g = svg('g', { class: o.cls || null }, parent);
    var dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
    var bx = x2 - ux * hl, by = y2 - uy * hl;
    svg('line', { x1: x1, y1: y1, x2: bx, y2: by, stroke: c, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-dasharray': o.dash || null }, g);
    svg('path', { d: 'M' + x2 + ' ' + y2 + 'L' + (bx - uy * hw) + ' ' + (by + ux * hw) + 'L' + (bx + uy * hw) + ' ' + (by - ux * hw) + 'z', fill: c }, g);
    if (o.label) svg('text', { x: x2 + (o.lx || 6), y: y2 + (o.ly || -6), 'font-size': o.fs || 11, fill: c, 'font-weight': 600, text: o.label }, g);
    return g;
  }
  /* 逐帧动画：fn(dt秒, t秒) 返回 false 时停止；系统设置「减少动态效果」时只跑一帧 */
  var REDUCED = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  function loop(fn) {
    var last = performance.now(), t0 = last, stop = false;
    function tick(now) {
      if (stop) return;
      /* 第一帧的时间戳可能比 performance.now() 早一点，dt 会是负数；夹在 0～0.05 秒之间 */
      var dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now;
      if (fn(dt, (now - t0) / 1000) === false || REDUCED) return;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    return { stop: function () { stop = true; } };
  }
  /* 带单位的数：qty(3.456, 'm', 2) -> 3.46 m（单位前留窄空格） */
  function qty(n, u, d) { return fmt(n, d === undefined ? 2 : d) + (u ? '<small>' + u + '</small>' : ''); }
  /* 化学式下标：chem('H2SO4') -> H₂SO₄ 的 HTML（数字转 sub，^2+ 转 sup） */
  function chem(s) {
    return String(s).replace(/\^([0-9]*[+-])/g, '<sup>$1</sup>').replace(/([A-Za-z\)])(\d+)/g, '$1<sub>$2</sub>');
  }

  /* —— 历史站专用：纪年 —— 年份用整数，公元前用负数（公元前 221 年写 -221），没有公元 0 年 */
  function yr(y) { return y < 0 ? '公元前 ' + (-y) + ' 年' : y + ' 年'; }
  function yrShort(y) { return y < 0 ? '前' + (-y) : String(y); }
  /* 世纪：1840 → 19 世纪；1900 → 19 世纪（1801～1900）；前 221 → 公元前 3 世纪 */
  function century(y) { return y < 0 ? '公元前 ' + Math.ceil(-y / 100) + ' 世纪' : Math.ceil(y / 100) + ' 世纪'; }
  /* 两个年份之间隔了多少年（跨越公元前后要少算 1，因为没有公元 0 年） */
  function span(a, b) { var d = Math.abs(b - a); return (a < 0) !== (b < 0) ? d - 1 : d; }

  /* 时间轴：timeline(svgEl, { from, to, step, events:[{y, label, color, row, id}], era:[{from,to,label,color}], pick(id) })
     events 按 row（0,1,2…）上下错开；返回 { X(year), layer } */
  function timeline(el, o) {
    var vb = (el.getAttribute('viewBox') || '0 0 400 160').split(/\s+/).map(Number), w = vb[2], h = vb[3];
    var hasEra = !!(o.era && o.era.length);
    var L = 24, R = 24, base = o.base || h - (hasEra ? 56 : 34), eraY = base + 32;
    var X = function (y) { return L + (y - o.from) / (o.to - o.from) * (w - L - R); };
    el.innerHTML = '';
    /* 朝代/时期色带放在刻度下面单独一条，不和事件圆点重叠 */
    (o.era || []).forEach(function (e) {
      var x0 = X(e.from), x1 = X(e.to);
      svg('rect', { x: x0, y: eraY, width: Math.max(2, x1 - x0), height: 18, rx: 4, fill: e.color || '#efe4dc', stroke: '#fff', 'stroke-width': 1 }, el);
      if (e.label && x1 - x0 > e.label.length * 11 + 6) svg('text', { x: (x0 + x1) / 2, y: eraY + 13, 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': 600, fill: '#5a4036', text: e.label }, el);
    });
    svg('line', { x1: L - 8, y1: base, x2: w - R + 8, y2: base, stroke: '#9a8a80', 'stroke-width': 1.6 }, el);
    svg('path', { d: 'M' + (w - R + 8) + ' ' + base + 'l-7 -4v8z', fill: '#9a8a80' }, el);
    var step = o.step || 100;
    for (var t = Math.ceil(o.from / step) * step; t <= o.to; t += step) {
      if (t === 0) continue;
      svg('line', { x1: X(t), y1: base + 8, x2: X(t), y2: base + 13, stroke: '#9a8a80' }, el);
      svg('text', { x: X(t), y: base + 25, 'text-anchor': 'middle', 'font-size': 10, fill: '#7a6a62', text: yrShort(t) }, el);
    }
    if (o.from < 0 && o.to > 0) { svg('line', { x1: X(0.5), y1: base - 12, x2: X(0.5), y2: base + 12, stroke: '#c2603f', 'stroke-dasharray': '2 2' }, el); svg('text', { x: X(0.5), y: base + 25, 'text-anchor': 'middle', 'font-size': 9.5, fill: '#a4492b', text: '公元' }, el); }
    var layer = svg('g', {}, el);
    /* 标签自动分行：按位置从左到右，每个标签放到不和已有标签重叠的最低一行（不用手动指定 row） */
    function textW(t) { var w = 0; for (var i = 0; i < t.length; i++) w += t.charCodeAt(i) > 255 ? 11.5 : 6.4; return w; }
    var rowH = 21, maxRow = Math.max(1, Math.floor((base - 30) / rowH)), rows = [];
    var evs = (o.events || []).map(function (e) { return { e: e, x: X(e.y) }; }).sort(function (a, b) { return a.x - b.x; });
    evs.forEach(function (it) {
      var w = textW(it.e.label) + 8, x0 = Math.max(4, Math.min(w > 0 ? it.x - w / 2 : it.x, vb[2] - 4 - w));
      it.x0 = x0; it.w = w;
      var r = 0, best = 0, bestOver = Infinity;
      for (r = 0; r < maxRow; r++) {
        var over = (rows[r] || []).reduce(function (m, b) { return m + Math.max(0, Math.min(b[1], x0 + w) - Math.max(b[0], x0)); }, 0);
        if (over === 0) { best = r; bestOver = 0; break; }
        if (over < bestOver) { bestOver = over; best = r; }
      }
      (rows[best] = rows[best] || []).push([x0, x0 + w]);
      it.row = best;
    });
    evs.forEach(function (it) {
      var e = it.e, x = it.x, ty = base - 22 - it.row * rowH, c = e.color || '#7d4d3c';
      svg('line', { x1: x, y1: base - 8, x2: x, y2: ty + 4, stroke: c, 'stroke-width': 1, opacity: 0.45 }, layer);
      svg('circle', { cx: x, cy: base, r: e.on ? 6 : 4.5, fill: c, stroke: '#fff', 'stroke-width': 1.5 }, layer);
      var tx = svg('text', { x: it.x0 + it.w / 2, y: ty, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': e.on ? 700 : 500, fill: c, text: e.label, stroke: '#fff', 'stroke-width': 3, 'paint-order': 'stroke' }, layer);
      if (o.pick && e.id !== undefined) { tx.style.cursor = 'pointer'; tx.addEventListener('click', function () { o.pick(e.id); }); }
    });
    return { X: X, layer: layer, base: base };
  }

  /* 排序题：order(container, items:[{label, y}], onDone(ok, picked))
     依次点击，给每一项编号；点满后按 y（年份）检查顺序，对的变绿、错的变橙并显示年份 */
  function order(container, items, onDone) {
    var picked = [];
    container.innerHTML = '';
    container.classList.add('order-list');
    var shuffled = shuffle(items.map(function (it, i) { return i; }));
    var btns = shuffled.map(function (i) {
      var it = items[i];
      var b = html('button', { type: 'button', html: '<span class="n"></span><span>' + it.label + '</span><span class="yr" hidden>' + (it.show || yr(it.y)) + '</span>' }, container);
      b.dataset.i = i;
      b.addEventListener('click', function () {
        if (container.dataset.done) return;
        var k = picked.indexOf(i);
        if (k >= 0) picked.splice(k, 1); else picked.push(i);
        paint();
        if (picked.length === items.length) finish();
      });
      return b;
    });
    function paint() { btns.forEach(function (b) { var k = picked.indexOf(+b.dataset.i); b.classList.toggle('picked', k >= 0); b.querySelector('.n').textContent = k >= 0 ? k + 1 : ''; }); }
    function finish() {
      container.dataset.done = '1';
      var sorted = picked.slice().sort(function (a, b) { return items[a].y - items[b].y; });
      var ok = true;
      btns.forEach(function (b) {
        var i = +b.dataset.i, k = picked.indexOf(i), good = items[sorted[k]].y === items[i].y;
        if (!good) ok = false;
        b.classList.add(good ? 'ok' : 'bad'); b.querySelector('.yr').hidden = false;
      });
      if (onDone) onDone(ok, picked.slice());
    }
    return { reset: function () { picked = []; delete container.dataset.done; btns.forEach(function (b) { b.classList.remove('ok', 'bad'); b.querySelector('.yr').hidden = true; }); paint(); }, done: function () { return !!container.dataset.done; } };
  }

  /* —— 逐课要点：keypoints(container, ['要点…', …])
     顺序与条数必须和本课 COVERS（对应的新教材课目）一一对应，少一条就在控制台报错，方便检查覆盖是否齐全 */
  function keypoints(container, items) {
    var root = typeof container === 'string' ? $(container) : container;
    var id = document.body.dataset.module, list = COVERS[id] || [];
    if (!root) return;
    if (items.length !== list.length) console.error('keypoints 条数 ' + items.length + ' 与对应课目 ' + list.length + ' 不一致');
    root.innerHTML = '';
    var card = html('div', { class: 'card panel kp-card' }, root);
    html('h2', { text: '课本逐课要点' }, card);
    html('p', { class: 'panel-sub', text: '按新教材的课目顺序，每一课最该记住的内容。复习时可以先遮住右边，自己说一说。' }, card);
    var tb = html('table', { class: 'compare kp-table' }, html('div', { style: 'overflow-x:auto' }, card));
    var body = html('tbody', {}, tb);
    list.forEach(function (t, i) {
      var tr = html('tr', {}, body);
      var m = t.match(/^(\S+?第\d+课) (.+)$/);
      html('td', { html: m ? '<span class="kp-no">' + m[1] + '</span>' + m[2] : t }, tr);
      html('td', { html: items[i] || '<span style="color:#a4492b">待补</span>' }, tr);
    });
    var btn = html('button', { type: 'button', class: 'ghost-btn', text: '遮住右边，自测一下', style: 'margin-top:10px' }, card);
    btn.addEventListener('click', function () { card.classList.toggle('kp-hide'); btn.textContent = card.classList.contains('kp-hide') ? '显示要点' : '遮住右边，自测一下'; });
  }

  /* —— 大题（材料题）训练 ——
     essay(container, {
       title: '题目主题', score: 16,
       materials: [{ label: '材料一', text: '…', src: '——据统编版教材整理' }],
       parts: [{
         ask: '(1) 根据材料一，概括……', score: 4, type: 'sum'（sum 概括 / why 原因 / effect 影响意义 / fact 用史实说明 / compare 比较 / essay 小论文）,
         points: [{ t: '采分点：……', s: 2 }],   // 采分点，学生自己勾，分值相加 = 自评分
         model: '参考答案……'
       }]
     })
     流程：读材料 → 每问先自己写（可以只在脑子里想）→ 点“对照采分点”→ 勾出自己答到的 → 得自评分。不保存任何内容。 */
  var ESSAY_TIPS = {
    sum: '概括题：答案在材料里。先圈关键词，再用自己的话分点写，一个意思一点，不要照抄整句。',
    why: '原因题：从材料找直接原因，再结合所学补根本原因；可以按政治、经济、思想文化、外部因素几个角度想。',
    effect: '影响/意义题：先说“对谁”（对本国、对世界、对后世），再说积极的一面；题目问“影响”时，消极面也要考虑。',
    fact: '用史实说明：写具体的时间、人物、事件，一条史实对应一个观点，不能只写空话。',
    compare: '比较题：先找相同点，再找不同点；不同点要“对着写”，比如“前者……，后者……”。',
    essay: '小论文：观点一句话（正确、明确）→ 两三条史实论证（史论结合）→ 一句结论回扣观点。8 分题，观点 2 分、史实论证 4 分、结论和条理 2 分是常见给分思路。'
  };
  var ESSAY_TYPE = { sum: '概括', why: '原因', effect: '影响意义', fact: '用史实说明', compare: '比较', essay: '小论文' };
  function essay(container, q) {
    var root = typeof container === 'string' ? $(container) : container;
    if (!root) return;
    root.innerHTML = '';
    var card = html('div', { class: 'essay-card' }, root);
    var total = q.parts.reduce(function (a, p) { return a + p.score; }, 0);
    html('div', { class: 'essay-head', html: '<h2><i>大题训练</i> ' + q.title + '</h2><span class="essay-score">共 ' + total + ' 分 · <a href="method.html">大题怎么答 →</a></span>' }, card);
    html('p', { class: 'essay-lead', html: '深圳中考历史后半卷是 2 道非选择题，共 36 分。先读材料，每一问自己写一写，再点“对照采分点”，勾出你答到的点，看看能拿几分。' }, card);
    q.materials.forEach(function (m) {
      html('div', { class: 'source-card', html: '<p><b>' + m.label + '</b>　' + m.text + '</p>' + (m.src ? '<cite>' + m.src + '</cite>' : '') }, card);
    });
    var got = [];
    var sumEl;
    q.parts.forEach(function (p, k) {
      got[k] = 0;
      var box = html('div', { class: 'essay-part' }, card);
      html('div', { class: 'essay-ask', html: '<span class="essay-type">' + (ESSAY_TYPE[p.type] || '作答') + '</span>' + p.ask + '<em>（' + p.score + ' 分）</em>' }, box);
      if (p.type && ESSAY_TIPS[p.type]) {
        var tipBtn = html('button', { type: 'button', class: 'essay-tipbtn', text: '怎么答' }, box);
        var tip = html('p', { class: 'essay-tip', text: ESSAY_TIPS[p.type] }, box);
        tip.hidden = true;
        tipBtn.addEventListener('click', function () { tip.hidden = !tip.hidden; tipBtn.textContent = tip.hidden ? '怎么答' : '收起'; });
      }
      var ta = html('textarea', { class: 'essay-input', rows: p.type === 'essay' ? 6 : 3, placeholder: p.type === 'essay' ? '观点：……\n论证：①……②……\n结论：……' : '在这里写下你的答案（不会保存）' }, box);
      var go = html('button', { type: 'button', class: 'essay-go', text: '对照采分点' }, box);
      var res = html('div', { class: 'essay-result' }, box);
      res.hidden = true;
      var list = html('div', { class: 'essay-points' }, res);
      p.points.forEach(function (pt, j) {
        var lab = html('label', { class: 'essay-point' }, list);
        var cb = html('input', { type: 'checkbox' }, lab);
        html('span', { html: pt.t + ' <em>' + pt.s + ' 分</em>' }, lab);
        cb.addEventListener('change', function () {
          got[k] = 0;
          Array.prototype.forEach.call(list.querySelectorAll('input'), function (c, jj) { if (c.checked) got[k] += p.points[jj].s; });
          got[k] = Math.min(got[k], p.score);
          lab.classList.toggle('on', cb.checked);
          paint();
        });
      });
      html('div', { class: 'essay-model', html: '<b>参考答案</b>　' + p.model }, res);
      go.addEventListener('click', function () {
        res.hidden = !res.hidden;
        go.textContent = res.hidden ? '对照采分点' : '收起采分点';
        var w = res.querySelector('.essay-warn');
        if (!res.hidden && !ta.value.trim() && !w) res.insertBefore(html('p', { class: 'essay-warn', text: '还没写也没关系，但先自己想一遍再对照，记得更牢。' }), list);
      });
    });
    sumEl = html('div', { class: 'essay-sum' }, card);
    function paint() {
      var g = got.reduce(function (a, b) { return a + b; }, 0);
      sumEl.innerHTML = '自评得分 <b>' + g + '</b> / ' + total + (g === total ? '　全部答到，漂亮！' : g >= total * 0.6 ? '　大部分答到了，看看漏了哪几点。' : g > 0 ? '　对照参考答案，把漏掉的点补进笔记。' : '');
    }
    paint();
  }

  document.addEventListener('DOMContentLoaded', function () { renderNav(); bindShare(); });

  window.Lab = {
    LESSONS: LESSONS, svg: svg, html: html, $: $, $$: $$, clamp: clamp, lerp: lerp,
    fmt: fmt, frac: frac, gcd: gcd, sign: sign, sup: sup, sqrt: sqrt, num: num,
    getState: getState, setState: setState, bindRange: bindRange, paintRange: paintRange, chips: chips,
    axes: axes, curve: curve, svgPoint: svgPoint, drag: drag, numline: numline,
    quiz: quiz, match: match, shuffle: shuffle,
    arrow: arrow, loop: loop, qty: qty, chem: chem, REDUCED: REDUCED,
    yr: yr, yrShort: yrShort, century: century, span: span, timeline: timeline, order: order, essay: essay, keypoints: keypoints, COVERS: COVERS, SITE: '历史互动馆'
  };
})();
