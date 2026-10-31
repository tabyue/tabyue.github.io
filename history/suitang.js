/* 历史互动馆 · 第 5 课 隋唐：繁荣与开放 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();
  var NOW = 2026;

  /* ========== 时间轴与阶段 ========== */
  var DYN = [
    { from: 570, to: 580, name: '南北朝' },
    { from: 581, to: 617, name: '隋' },
    { from: 618, to: 907, name: '唐' },
    { from: 908, to: 920, name: '五代十国' }
  ];
  var PHASE = [
    { from: 570, to: 580, t: '南北朝后期，南北分裂' },
    { from: 581, to: 588, t: '隋朝建立，南方还有陈朝' },
    { from: 589, to: 604, t: '隋文帝时期，全国重归统一' },
    { from: 605, to: 617, t: '隋炀帝时期：开运河，后期暴政' },
    { from: 618, to: 626, t: '唐朝初年（唐高祖）' },
    { from: 627, to: 649, t: '贞观之治（唐太宗）' },
    { from: 650, to: 712, t: '唐高宗、武则天时期' },
    { from: 713, to: 741, t: '开元盛世（唐玄宗前期）' },
    { from: 742, to: 754, t: '唐玄宗后期，政治渐渐腐败' },
    { from: 755, to: 763, t: '安史之乱' },
    { from: 764, to: 907, t: '唐朝后期：藩镇割据、宦官专权' },
    { from: 908, to: 920, t: '五代十国' }
  ];
  var EVENTS = [
    { id: 'sui', y: 581, label: '隋建立', note: '杨坚建立隋朝，定都长安，他就是隋文帝。' },
    { id: 'unify', y: 589, label: '隋统一', note: '隋军南下灭陈，结束了长期的分裂局面，南北重归统一。' },
    { id: 'canal', y: 605, label: '开凿大运河', note: '从这一年起，隋炀帝陆续开通了一条纵贯南北的大运河。' },
    { id: 'tang', y: 618, label: '隋亡唐立', note: '隋炀帝在江都被部下杀死，隋朝灭亡；同年李渊建立唐朝，定都长安。' },
    { id: 'zg', y: 627, label: '贞观', note: '唐太宗改年号为“贞观”，在他的治理下出现了“贞观之治”。' },
    { id: 'xz', y: 627, label: '玄奘西行', note: '教材写作“贞观初年”，一般记为 627 年。玄奘从长安出发，西行天竺取经。' },
    { id: 'wc', y: 641, label: '文成公主入吐蕃', note: '文成公主远嫁吐蕃首领松赞干布，唐与吐蕃关系更加密切。' },
    { id: 'ky', y: 713, label: '开元', note: '唐玄宗改年号为“开元”，唐朝进入全盛的“开元盛世”。' },
    { id: 'jz', y: 754, label: '鉴真抵日', note: '鉴真第六次东渡终于成功，到达日本，传播佛法和中国文化。' },
    { id: 'as', y: 755, label: '安史之乱', note: '安禄山、史思明起兵叛乱，唐朝由盛转衰的转折点。' },
    { id: 'asend', y: 763, label: '平定', note: '历时 8 年的安史之乱被平定，但藩镇割据的局面形成了。' },
    { id: 'end', y: 907, label: '唐亡', note: '朱温灭唐，建立后梁，中国进入五代十国时期。' }
  ];
  var year = Math.round(L.num(st.y, 618, 570, 920));
  var tl = L.$('#tl'), yIn = L.$('#year-in');

  function inRange(list, y) { for (var i = 0; i < list.length; i++) if (y >= list[i].from && y <= list[i].to) return list[i]; return null; }
  function nearest(y) {
    var best = null;
    EVENTS.forEach(function (e) { if (Math.abs(e.y - y) <= 5 && (!best || Math.abs(e.y - y) < Math.abs(best.y - y))) best = e; });
    return best;
  }
  function sameYear(e) { return EVENTS.filter(function (x) { return x.y === e.y; }); }
  function drawTL() {
    var ev = nearest(year), hot = ev ? sameYear(ev).map(function (x) { return x.id; }) : [];
    var ax = L.timeline(tl, {
      from: 570, to: 920, step: 50,
      era: [
        { from: 570, to: 581, label: '', color: '#efe7df' },
        { from: 581, to: 618, label: '隋', color: '#e3cfc2' },
        { from: 618, to: 755, label: '唐前期', color: '#ead8c6' },
        { from: 755, to: 763, label: '', color: '#d9b7a3' },
        { from: 763, to: 907, label: '唐后期', color: '#e6dccf' },
        { from: 907, to: 920, label: '', color: '#efe7df' }
      ],
      events: EVENTS.map(function (e) { var on = hot.indexOf(e.id) >= 0; return { id: e.id, y: e.y, label: e.label, on: on, color: on ? '#a4492b' : '#7d4d3c' }; }),
      pick: function (id) { var e = EVENTS.filter(function (x) { return x.id === id; })[0]; setYear(e.y); }
    });
    var x = ax.X(year);
    S('line', { x1: x, y1: 8, x2: x, y2: ax.base + 50, stroke: '#c2603f', 'stroke-width': 1.6, 'stroke-dasharray': '4 3' }, tl);
    S('path', { d: 'M' + (x - 6) + ' 4h12l-6 8z', fill: '#c2603f' }, tl);
  }
  function setYear(y) {
    year = y;
    yIn.value = year; L.paintRange(yIn);
    render();
  }
  function render() {
    drawTL();
    var d = inRange(DYN, year), ph = inRange(PHASE, year), ev = nearest(year);
    L.$('#year-out').textContent = L.yr(year);
    L.$('#dyn-badge').textContent = year === 618 ? '隋→唐' : (year === 907 ? '唐→五代' : (d ? d.name : '—'));
    L.$('#r-cent').textContent = L.century(year);
    L.$('#r-ago').innerHTML = L.span(year, NOW) + '<small>年前</small>';
    L.$('#r-phase').textContent = ph ? ph.t : '—';
    var evs = ev ? sameYear(ev) : [];
    L.$('#r-event').textContent = ev ? (ev.y === year ? '' : '约 ' + L.yr(ev.y) + '：') + evs.map(function (e) { return e.label; }).join('、') : '这几年没有课本里的大事';
    var t = evs.map(function (e) { return e.note; }).join(' ');
    if (!t) {
      if (year >= 742 && year <= 754) t = '表面上还是盛世，可唐玄宗已经不再用心处理政事，节度使的兵力越来越强，危机正在积累。';
      else if (year >= 764 && year <= 906) t = '安史之乱以后，唐朝再也没有恢复到开元年间的强盛，地方藩镇不听中央号令。';
      else t = '7 世纪是 601～700 年，8 世纪是 701～800 年。' + year + ' 年属于 ' + L.century(year) + '。';
    }
    L.$('#r-text').innerHTML = t;
    L.$$('#era-table tr').forEach(function (tr) { tr.classList.toggle('on', year >= +tr.dataset.from && year <= +tr.dataset.to); });
    save();
  }
  L.bindRange(yIn, function (v) { year = v; render(); });
  yIn.value = year; L.paintRange(yIn);

  /* ========== 大运河示意 ========== */
  var N = {
    zhuo: { n: '涿郡', sub: '今北京', x: 292, y: 36, right: true },
    luo: { n: '洛阳', sub: '运河中心', x: 96, y: 112 },
    shan: { n: '山阳', sub: '今江苏淮安', x: 292, y: 138, dy: 16 },
    jiang: { n: '江都', sub: '今江苏扬州', x: 292, y: 184 },
    jing: { n: '京口', sub: '今江苏镇江', x: 292, y: 214 },
    yu: { n: '余杭', sub: '今浙江杭州', x: 292, y: 248 }
  };
  var RIVERS = [
    { t: '海河', x: 370, y: 36 }, { t: '黄河', x: 50, y: 112 }, { t: '淮河', x: 330, y: 138 },
    { t: '长江', x: 330, y: 199 }, { t: '钱塘江', x: 336, y: 248 }
  ];
  var SEGS = [
    { id: 'yong', n: '永济渠', a: 'luo', b: 'zhuo', route: '洛阳附近 → 涿郡', river: '黄河 — 海河', lx: 176, ly: 64,
      t: '大运河最北的一段，从洛阳附近一直向北通到涿郡（今北京）。南方运来的粮食和物资，可以经它送到北方。' },
    { id: 'tong', n: '通济渠', a: 'luo', b: 'shan', route: '洛阳 → 淮河', river: '黄河 — 淮河', lx: 190, ly: 142,
      t: '从洛阳出发，向东南通到淮河，把黄河和淮河连了起来。洛阳正好在永济渠和通济渠的交汇处，所以说大运河“以洛阳为中心”。' },
    { id: 'han', n: '邗沟', a: 'shan', b: 'jiang', route: '山阳 → 江都', river: '淮河 — 长江', lx: 306, ly: 165,
      t: '从山阳（今江苏淮安）到江都（今江苏扬州），连通淮河与长江。春秋时吴国就开凿过邗沟，隋朝重新疏通利用。' },
    { id: 'jn', n: '江南河', a: 'jing', b: 'yu', route: '京口 → 余杭', river: '长江 — 钱塘江', lx: 306, ly: 232,
      t: '从京口（今江苏镇江）到余杭（今浙江杭州），连通长江与钱塘江。江南的粮食、丝织品从这里装船北上。' }
  ];
  var ALL = { n: '大运河全线', route: '北达涿郡，南至余杭', river: '五大水系',
    t: '大运河以<b>洛阳</b>为中心，北达涿郡，南至余杭，全长两千多千米，连通海河、黄河、淮河、长江、钱塘江五大水系，是古代世界上最长的运河。它加强了南北交通，巩固了隋朝对全国的统治，促进了南北经济文化交流。' };
  /* 运粮船走的路线：余杭 → 京口 → 过长江 → 江都 → 山阳 → 洛阳 → 涿郡 */
  var ROUTE = ['yu', 'jing', 'jiang', 'shan', 'luo', 'zhuo'];
  var LEG = ['jn', 'cross', 'han', 'tong', 'yong'];
  var seg = ['yong', 'tong', 'han', 'jn', 'all'].indexOf(st.c) >= 0 ? st.c : 'all';
  var boat = Math.round(L.num(st.b, 0, 0, ROUTE.length - 1)), boatAnim = null;
  var canal = L.$('#canal');
  function segOf(id) { return SEGS.filter(function (s) { return s.id === id; })[0]; }
  function drawCanal() {
    canal.innerHTML = '';
    var d = S('defs', {}, canal), cp = S('clipPath', { id: 'canal-clip' }, d);
    S('rect', { x: 0, y: 0, width: 400, height: 280, rx: 14 }, cp);
    var g = S('g', { 'clip-path': 'url(#canal-clip)' }, canal);
    S('rect', { x: 0, y: 0, width: 400, height: 280, fill: '#fbf6ef' }, g);
    S('text', { x: 14, y: 20, 'font-size': 10, fill: '#a0908a', text: '↑ 北' }, g);
    S('text', { x: 14, y: 270, 'font-size': 10, fill: '#a0908a', text: '↓ 南' }, g);
    /* 过长江：江都 → 京口 用虚线表示 */
    S('line', { x1: N.jiang.x, y1: N.jiang.y, x2: N.jing.x, y2: N.jing.y, stroke: '#b8c7cf', 'stroke-width': 3, 'stroke-dasharray': '3 4' }, g);
    SEGS.forEach(function (s) {
      var A = N[s.a], B = N[s.b], on = seg === s.id || seg === 'all';
      var hit = S('g', { class: 'svg-hit', tabindex: 0, role: 'button', 'aria-label': s.n }, g);
      S('line', { x1: A.x, y1: A.y, x2: B.x, y2: B.y, stroke: 'transparent', 'stroke-width': 18 }, hit);
      S('line', { x1: A.x, y1: A.y, x2: B.x, y2: B.y, stroke: on ? '#a4492b' : '#d8c3b4', 'stroke-width': seg === s.id ? 6 : 4, 'stroke-linecap': 'round' }, hit);
      S('text', { x: s.lx, y: s.ly, 'text-anchor': s.lx > 300 ? 'start' : 'middle', 'font-size': 12, 'font-weight': 700, fill: on ? '#a4492b' : '#a99286', text: s.n, stroke: '#fbf6ef', 'stroke-width': 3, 'paint-order': 'stroke' }, hit);
      hit.addEventListener('click', function () { pickSeg(s.id); });
      hit.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickSeg(s.id); } });
    });
    RIVERS.forEach(function (r) {
      var w = r.t.length * 12 + 12;
      S('rect', { x: r.x - w / 2, y: r.y - 9, width: w, height: 18, rx: 9, fill: '#e6eff2', stroke: '#b8c7cf' }, g);
      S('text', { x: r.x, y: r.y + 4, 'text-anchor': 'middle', 'font-size': 10.5, fill: '#3f6170', text: r.t }, g);
    });
    Object.keys(N).forEach(function (k) {
      var p = N[k], center = k === 'luo';
      S('circle', { cx: p.x, cy: p.y, r: center ? 9 : 6, fill: center ? '#a4492b' : '#fff', stroke: '#a4492b', 'stroke-width': 2 }, g);
      if (center) {
        S('text', { x: p.x, y: p.y + 26, 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: '#4a3a32', text: p.n }, g);
        S('text', { x: p.x, y: p.y + 39, 'text-anchor': 'middle', 'font-size': 10, fill: '#a4492b', text: p.sub }, g);
      } else if (p.right) {
        S('text', { x: p.x + 13, y: p.y + 2, 'font-size': 12, 'font-weight': 700, fill: '#4a3a32', text: p.n }, g);
        S('text', { x: p.x + 13, y: p.y + 15, 'font-size': 9.5, fill: '#8a7a70', text: p.sub }, g);
      } else {
        var dy = p.dy || 0;
        S('text', { x: p.x - 13, y: p.y + 4 + dy, 'text-anchor': 'end', 'font-size': 12, 'font-weight': 700, fill: '#4a3a32', text: p.n, stroke: '#fbf6ef', 'stroke-width': 3, 'paint-order': 'stroke' }, g);
        S('text', { x: p.x - 13, y: p.y + 16 + dy, 'text-anchor': 'end', 'font-size': 9.5, fill: '#8a7a70', text: p.sub, stroke: '#fbf6ef', 'stroke-width': 3, 'paint-order': 'stroke' }, g);
      }
    });
    /* 运粮船 */
    var k = Math.min(Math.floor(boat), ROUTE.length - 2), f = boat - k;
    var P = N[ROUTE[k]], Q = N[ROUTE[k + 1]];
    var bx = P.x + (Q.x - P.x) * f, by = P.y + (Q.y - P.y) * f;
    S('path', { d: 'M' + (bx - 9) + ' ' + (by - 3) + 'h18l-4 7h-10z', fill: '#7d4d3c', stroke: '#fff', 'stroke-width': 1.2 }, g);
    S('path', { d: 'M' + bx + ' ' + (by - 3) + 'v-10l7 6z', fill: '#c2603f' }, g);
    S('text', { x: 46, y: 270, 'font-size': 9.5, fill: '#a0908a', text: '示意，不表示实际地理位置和疆域' }, g);

    var s = seg === 'all' ? ALL : segOf(seg);
    L.$('#cn-name').textContent = s.n;
    L.$('#cn-badge').textContent = seg === 'all' ? '四段' : '第 ' + (['yong', 'tong', 'han', 'jn'].indexOf(seg) + 1) + ' 段（自北向南）';
    L.$('#cn-route').textContent = s.route;
    L.$('#cn-river').textContent = s.river;
    L.$('#cn-text').innerHTML = s.t;
    L.$('#cn-boat').textContent = boatText();
    L.$('#boat-go').textContent = boat >= ROUTE.length - 1 ? '已到涿郡，再运一船' : (boat === 0 ? '从余杭出发，运粮北上' : '继续往北');
    save();
  }
  function boatText() {
    var i = Math.round(boat);
    if (Math.abs(boat - i) < 1e-6) return N[ROUTE[i]].n + (i === ROUTE.length - 1 ? '（终点，北达涿郡）' : i === 0 ? '（起点，南至余杭）' : '');
    var leg = LEG[Math.floor(boat)];
    return leg === 'cross' ? '正在渡过长江' : '正在' + segOf(leg).n + '上航行';
  }
  function pickSeg(id) { seg = id; canalChips.set(id); drawCanal(); }
  function stopBoat() { if (boatAnim) { boatAnim.stop(); boatAnim = null; } }
  var canalChips = L.chips(L.$('#canal-chips'), [
    { label: '永济渠', value: 'yong' }, { label: '通济渠', value: 'tong' }, { label: '邗沟', value: 'han' }, { label: '江南河', value: 'jn' }, { label: '全线', value: 'all' }
  ], seg, function (v) { seg = v; drawCanal(); });
  L.$('#boat-go').addEventListener('click', function () {
    stopBoat();
    if (boat >= ROUTE.length - 1) boat = 0;
    var target = Math.floor(boat + 1e-6) + 1;
    var leg = LEG[target - 1];
    if (leg !== 'cross') { seg = leg; canalChips.set(leg); }
    if (L.REDUCED) { boat = target; drawCanal(); return; }
    boatAnim = L.loop(function (dt) {
      boat = Math.min(target, boat + Math.max(0, dt) * 1.1);
      if (boat >= target) { boat = target; boatAnim = null; drawCanal(); return false; }
      drawCanal();
    });
  });
  L.$('#boat-reset').addEventListener('click', function () { stopBoat(); boat = 0; drawCanal(); });

  /* ========== 科举制台阶 ========== */
  var KJ = [
    { n: '隋文帝', b: '隋', tag: '分科考试', did: '开始用分科考试的方式选拔官员', mean: '选官开始看考试，不再只看门第',
      t: '魏晋南北朝时，选官主要看家世，出身普通的人很难做官。隋文帝改用分科考试选人，迈出了第一步。' },
    { n: '隋炀帝', b: '隋', tag: '设进士科', did: '正式设置进士科', mean: '科举制正式诞生',
      t: '进士科按考试成绩选拔人才。从这时起，读书人可以凭考试进入官场，这就是<b>科举制</b>。' },
    { n: '唐太宗', b: '唐', tag: '扩充国学', did: '大力扩充国学的规模', mean: '培养更多读书人，考生来源更广',
      t: '国学是朝廷办的学校。学校扩大了，读书应考的人就更多，科举能挑选的人才也更多。' },
    { n: '武则天', b: '唐', tag: '殿试·武举', did: '首创殿试，还开创了武举', mean: '皇帝亲自主考；用考试选拔武将',
      t: '殿试由皇帝在殿前亲自主持考试；武举专门用考试选拔军事人才。科举选人的方式更完善了。' },
    { n: '唐玄宗', b: '唐', tag: '考诗赋', did: '诗赋成为进士科主要的考试内容', mean: '推动了唐诗的繁荣',
      t: '想考中进士就要会作诗，读书人纷纷学诗，这是唐诗格外繁荣的原因之一。科举制隋朝创立、唐朝完善，一直沿用到清朝末年。' }
  ];
  var kj = Math.round(L.num(st.k, 0, 0, KJ.length - 1));
  var kjSvg = L.$('#kj');
  function drawKJ() {
    kjSvg.innerHTML = '';
    var d = S('defs', {}, kjSvg), cp = S('clipPath', { id: 'kj-clip' }, d);
    S('rect', { x: 0, y: 0, width: 400, height: 236, rx: 14 }, cp);
    var g = S('g', { 'clip-path': 'url(#kj-clip)' }, kjSvg);
    S('rect', { x: 0, y: 0, width: 400, height: 236, fill: '#fbf8f5' }, g);
    var base = 196, w = 66, x0 = 34;
    KJ.forEach(function (s, i) {
      var top = base - (i + 1) * 28, x = x0 + i * w, on = i === kj, done = i <= kj;
      var hit = S('g', { class: 'svg-hit', tabindex: 0, role: 'button', 'aria-label': s.n + '：' + s.did }, g);
      S('rect', { x: x, y: top, width: w - 3, height: base - top, rx: 6, fill: on ? '#a4492b' : (done ? '#d8b9a6' : '#efe4dc'), stroke: '#fff', 'stroke-width': 1.5 }, hit);
      S('text', { x: x + (w - 3) / 2, y: top + 18, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: on ? '#fff' : '#5a4036', text: s.n }, hit);
      S('text', { x: x + (w - 3) / 2, y: top - 8, 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': on ? 700 : 500, fill: done ? '#a4492b' : '#a0908a', text: s.tag }, hit);
      hit.addEventListener('click', function () { kj = i; drawKJ(); });
      hit.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); kj = i; drawKJ(); } });
    });
    /* 当前台阶上的小人：一个读书人 */
    var px = x0 + kj * w + (w - 3) / 2, py = base - (kj + 1) * 28 - 26;
    S('circle', { cx: px, cy: py - 14, r: 5, fill: '#7d4d3c' }, g);
    S('path', { d: 'M' + (px - 6) + ' ' + (py - 1) + 'q6 -9 12 0', fill: '#7d4d3c' }, g);
    /* 底部朝代括号 */
    function brace(a, b, label) {
      var xa = x0 + a * w, xb = x0 + (b + 1) * w - 3;
      S('path', { d: 'M' + xa + ' ' + (base + 6) + 'v5H' + xb + 'v-5', fill: 'none', stroke: '#b9a89c' }, g);
      S('text', { x: (xa + xb) / 2, y: base + 26, 'text-anchor': 'middle', 'font-size': 11, fill: '#7a6a62', text: label }, g);
    }
    brace(0, 1, '隋朝：创立');
    brace(2, 4, '唐朝：完善');
    S('text', { x: 14, y: 22, 'font-size': 10.5, fill: '#8a7a70', text: '以前选官看门第 → 科举选官看考试成绩' }, g);
    var s = KJ[kj];
    L.$('#kj-name').textContent = s.n;
    L.$('#kj-badge').textContent = s.b + ' · 第 ' + (kj + 1) + ' 级';
    L.$('#kj-did').textContent = s.did;
    L.$('#kj-mean').textContent = s.mean;
    L.$('#kj-text').innerHTML = s.t;
    L.$('#kj-next').textContent = kj === KJ.length - 1 ? '已到顶，再走一遍' : '下一级';
    save();
  }
  L.$('#kj-next').addEventListener('click', function () { kj = kj === KJ.length - 1 ? 0 : kj + 1; drawKJ(); });
  L.$('#kj-reset').addEventListener('click', function () { kj = 0; drawKJ(); });

  function save() { L.setState({ y: year, c: seg, b: boat === Math.round(boat) ? boat : Math.round(boat), k: kj }); }

  render();
  drawCanal();
  drawKJ();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '把年份调到唐朝建立的那一年',
      desc: '拖动时间轴下面的滑块，或者直接点时间轴上的事件。',
      label: '在时间轴里操作',
      button: '检查年份',
      check: function () {
        if (year === 618) return { ok: true, msg: '618 年，隋朝灭亡，李渊建立唐朝，定都长安。这一年属于 7 世纪，距今 ' + L.span(618, NOW) + ' 年。' };
        if (year < 618) return { ok: false, msg: '现在是 ' + L.yr(year) + '，还在隋朝或更早，往右拖一点。' };
        return { ok: false, msg: '现在是 ' + L.yr(year) + '，已经过了。唐朝建立和隋朝灭亡是同一年。' };
      }
    },
    {
      level: 'base',
      title: '隋朝大运河的中心是',
      desc: '想一想永济渠和通济渠在哪里交汇。',
      options: ['洛阳', '长安', '涿郡', '余杭'],
      answer: 0,
      hint: '大运河“北达涿郡，南至余杭”，那中心在哪？',
      explain: '大运河以<b>洛阳</b>为中心，北达涿郡，南至余杭。长安是隋唐的都城，但不是大运河的中心；涿郡和余杭是运河的北、南两端。'
    },
    {
      level: 'base',
      title: '科举制正式诞生的标志是',
      desc: '可以在“科举制台阶”里一级级看。',
      options: ['隋炀帝设置进士科', '隋文帝开始分科考试', '唐太宗扩充国学', '武则天首创殿试'],
      answer: 0,
      hint: '“开始分科考试”是第一步，但还不算正式诞生。',
      explain: '<b>隋炀帝设置进士科</b>，按考试成绩选拔人才，标志着科举制正式诞生。隋文帝分科考试是开端；唐太宗扩充国学、武则天首创殿试都是唐朝对科举制的完善。'
    },
    {
      level: 'mid',
      title: '找出连通淮河和长江的那一段运河',
      desc: '在大运河示意图里点一段河道（或点下面的按钮），看右边“连通哪两条水系”。',
      label: '在大运河示意图里操作',
      button: '检查我选的河段',
      check: function () {
        if (seg === 'han') return { ok: true, msg: '邗沟从山阳到江都，连通淮河与长江。记住自北向南的顺序：永济渠、通济渠、邗沟、江南河。' };
        if (seg === 'all') return { ok: false, msg: '现在选的是全线，要选出具体的一段。' };
        return { ok: false, msg: '你选的是' + segOf(seg).n + '，它连通的是' + segOf(seg).river + '。再往南或往北找一找。' };
      }
    },
    {
      level: 'mid',
      title: '唐朝由盛转衰的转折点是',
      desc: '在时间轴上看看 755 年前后。',
      options: ['安史之乱', '玄武门之变', '黄巢起义', '朱温灭唐'],
      answer: 0,
      hint: '这件事爆发于唐玄宗后期，打了 8 年。',
      explain: '755—763 年的<b>安史之乱</b>使唐朝由盛转衰，之后形成藩镇割据。黄巢起义发生在唐末，加速了唐朝灭亡；朱温灭唐（907 年）是唐朝的结束；玄武门之变发生在唐朝初年。'
    },
    {
      level: 'mid',
      title: '641 年文成公主入吐蕃，主要作用是',
      desc: '吐蕃是藏族的祖先，首领是松赞干布。',
      options: ['加强了唐与吐蕃的友好关系，促进了经济文化交流', '使西域正式归中央管辖', '把中国的佛经和医药传到日本', '结束了南北分裂的局面'],
      answer: 0,
      hint: '文成公主嫁给了谁？她带去了什么？',
      explain: '文成公主嫁给松赞干布，带去了中原的生产技术和文化，<b>加强了唐蕃友好关系</b>。西域正式归中央管辖是西汉设西域都护；把佛经和医药传到日本的是鉴真；结束南北分裂是 589 年隋统一。'
    },
    {
      level: 'trap',
      title: '在科举台阶上，停在“首创殿试”的那一级',
      desc: '很多同学以为殿试是隋炀帝或唐太宗开创的。点台阶或按“下一级”，停在正确的那一级。',
      label: '在科举制台阶里操作',
      button: '检查我停在哪一级',
      check: function () {
        if (kj === 3) return { ok: true, msg: '<b>武则天</b>首创殿试，还开创了武举。隋炀帝设的是进士科，唐太宗扩充的是国学。' };
        return { ok: false, msg: '现在停在“' + KJ[kj].n + '”：' + KJ[kj].did + '。殿试是唐朝的事，而且是一位女皇帝开创的。' };
      }
    },
    {
      level: 'trap',
      title: '下列人物与事迹搭配正确的是',
      desc: '一个向东，一个向西，别弄反。',
      options: ['鉴真 — 东渡日本 — 传播佛法和中国文化', '玄奘 — 东渡日本 — 传授佛经', '鉴真 — 西行天竺 — 著《大唐西域记》', '玄奘 — 出使西域 — 设西域都护'],
      answer: 0,
      hint: '《大唐西域记》是去天竺的那位高僧口述的。',
      explain: '<b>鉴真</b>东渡日本，754 年到达，传播佛法以及医药、建筑、书法等；<b>玄奘</b>西行天竺取经，口述《大唐西域记》。设西域都护是西汉的事，和玄奘无关。'
    }
  ]);
})();
