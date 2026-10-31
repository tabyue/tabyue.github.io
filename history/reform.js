/* 历史互动馆 · 第 14 课 改革开放与中国特色社会主义 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();
  var NOW = 2026;

  /* ========== 1978—2001 时间轴 ========== */
  var EVENTS = [
    { id: 'plenum', y: 1978, label: '十一届三中全会', note: '1978 年 12 月，中共十一届三中全会召开，重新确立解放思想、实事求是的思想路线，把工作中心转移到经济建设上来，作出实行改革开放的伟大决策，开启了改革开放和社会主义现代化建设新时期。' },
    { id: 'sez', y: 1980, label: '设立经济特区', note: '1980 年，在深圳、珠海、汕头、厦门设立经济特区，深圳成为对外开放的窗口。' },
    { id: 'const82', y: 1982, label: '现行宪法', note: '1982 年，五届全国人大五次会议通过了新的《中华人民共和国宪法》，也就是现行宪法。' },
    { id: 'city14', y: 1984, label: '14 个沿海城市', note: '1984 年，开放大连、天津、上海、广州等 14 个沿海港口城市。' },
    { id: 'cut', y: 1985, label: '裁军百万', note: '1985 年，中央军委决定裁减军队员额 100 万，人民解放军走上中国特色精兵之路。' },
    { id: 'c13', y: 1987, label: '中共十三大', note: '1987 年中共十三大系统阐述了社会主义初级阶段理论，提出了党在社会主义初级阶段的基本路线：“一个中心、两个基本点”。' },
    { id: 'pudong', y: 1990, label: '开发浦东', note: '1990 年，开发开放上海浦东。' },
    { id: 'south', y: 1992, label: '南方谈话', note: '1992 年初，邓小平视察南方，发表重要谈话（南方谈话）。' },
    { id: 'c14', y: 1992, label: '中共十四大', note: '1992 年中共十四大明确提出，我国经济体制改革的目标是建立社会主义市场经济体制。' },
    { id: 'hk', y: 1997, label: '香港回归', note: '1997 年 7 月 1 日，中国政府恢复对香港行使主权，香港特别行政区成立。' },
    { id: 'mo', y: 1999, label: '澳门回归', note: '1999 年 12 月 20 日，中国政府恢复对澳门行使主权，澳门特别行政区成立。' },
    { id: 'wto', y: 2001, label: '加入世贸组织', note: '2001 年，我国加入世界贸易组织，对外开放进入新的阶段。' }
  ];
  /* 没放进时间轴、但滑到这一年要提一句的事 */
  var NOTE_Y = {
    1978: '这一年还开展了关于真理标准问题的讨论，为十一届三中全会的召开作了思想准备。同年冬，安徽凤阳县小岗村的农民率先把土地承包到户，拉开了农村改革的序幕。',
    1982: '同年召开的中共十二大提出“走自己的道路，建设有中国特色的社会主义”。',
    1984: '同年中共十二届三中全会以后，经济体制改革的重点由农村转向城市，城市改革以国有企业改革为中心环节。',
    1985: '1985 年起，把长江三角洲、珠江三角洲、闽南厦漳泉三角地区开辟为沿海经济开放区。',
    1988: '1988 年，海南建省并设立海南经济特区。',
    1997: '同年中共十五大把邓小平理论确立为党的指导思想，提出依法治国的基本方略。',
    2001: '这一年，上海合作组织成立；亚太经济合作组织（APEC）领导人非正式会议在上海举行。'
  };
  var year = Math.round(L.num(st.y, 1978, 1978, 2001));
  var tl = L.$('#tl'), yIn = L.$('#year-in');

  function sameYear(y) { return EVENTS.filter(function (e) { return e.y === y; }); }
  function nearest(y) {
    var best = null;
    EVENTS.forEach(function (e) { if (Math.abs(e.y - y) <= 2 && (!best || Math.abs(e.y - y) < Math.abs(best.y - y))) best = e; });
    return best;
  }
  function drawTL() {
    var hits = sameYear(year);
    var ax = L.timeline(tl, {
      from: 1977, to: 2002, step: 4,
      era: [{ from: 1978, to: 2001.9, label: '改革开放和社会主义现代化建设新时期', color: '#ead8c6' }],
      events: EVENTS.map(function (e) { var on = hits.indexOf(e) >= 0; return { id: e.id, y: e.y, label: e.label, on: on, color: on ? '#a4492b' : '#7d4d3c' }; }),
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
    var hits = sameYear(year), ev = nearest(year), t;
    L.$('#year-out').textContent = L.yr(year);
    L.$('#cent-badge').textContent = L.century(year);
    L.$('#r-since').innerHTML = year === 1978 ? '开启当年' : (year - 1978) + '<small>年</small>';
    L.$('#r-ago').innerHTML = L.span(year, NOW) + '<small>年前</small>';
    if (hits.length) {
      L.$('#r-event').textContent = hits.map(function (e) { return e.label; }).join('、');
      t = hits.map(function (e) { return e.note; }).join(' ');
    } else if (ev) {
      L.$('#r-event').textContent = '约 ' + L.yr(ev.y) + '：' + ev.label;
      t = ev.note;
    } else {
      L.$('#r-event').textContent = '这几年没有放进时间轴的大事';
      t = '';
    }
    if (NOTE_Y[year]) t += (t ? ' ' : '') + NOTE_Y[year];
    if (year === 2000) t += (t ? ' ' : '') + '注意：2000 年属于 20 世纪的最后一年，2001 年才是 21 世纪的第一年。';
    else if (year === 2001) t += ' 2001 年是 21 世纪的第一年。';
    L.$('#r-text').innerHTML = t;
    L.$('#row-one').classList.toggle('on', year === 1997 || year === 1999);
    L.$('#row-two').classList.toggle('on', year === 1997 || year === 1999);
    L.$('#row-hk').classList.toggle('on', year === 1997);
    L.$('#row-mo').classList.toggle('on', year === 1999);
    save();
  }
  L.bindRange(yIn, function (v) { year = v; render(); });
  yIn.value = year; L.paintRange(yIn);
  [['#row-hk', 1997], ['#row-mo', 1999]].forEach(function (r) {
    var tr = L.$(r[0]);
    tr.addEventListener('click', function () { setYear(r[1]); });
    tr.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setYear(r[1]); } });
  });

  /* ========== 深圳之窗：对外开放格局 ========== */
  var LAYERS = [
    { n: '经济特区', y: '1980 年', r: 30, fill: '#a4492b', ink: '#fff',
      t: '1980 年，在广东的深圳、珠海、汕头和福建的厦门设立经济特区；1988 年又设立海南经济特区。经济特区实行特殊的经济政策和灵活措施，吸引外资，引进先进技术和管理经验，成为对外开放的<b>窗口</b>。深圳从一个边陲小镇发展成为现代化城市。' },
    { n: '沿海开放城市', y: '1984 年', r: 60, fill: '#e2bfa6', ink: '#5a3a2c',
      t: '1984 年，进一步开放大连、秦皇岛、天津、烟台、青岛、连云港、南通、上海、宁波、温州、福州、广州、湛江、北海 <b>14 个沿海港口城市</b>。' },
    { n: '沿海经济开放区', y: '1985 年起', r: 92, fill: '#eed9c8', ink: '#5a3a2c',
      t: '1985 年起，把长江三角洲、珠江三角洲、闽南厦漳泉三角地区开辟为<b>沿海经济开放区</b>，后来又扩大到辽东半岛、山东半岛等地。1990 年，开发开放上海浦东。' },
    { n: '内地', y: '20 世纪 90 年代以后', r: 0, fill: '#f7efe7', ink: '#5a3a2c',
      t: '20 世纪 90 年代以后，对外开放逐步从沿海扩展到沿江、沿边和内陆地区，形成“经济特区—沿海开放城市—沿海经济开放区—内地”<b>全方位、多层次、宽领域</b>的对外开放格局。' }
  ];
  var stage = Math.round(L.num(st.o, 1, 0, 4)), openPos = stage, openAnim = null;
  var open = L.$('#open'), CX = 130, CY = 122;
  function drawOpen() {
    open.innerHTML = '';
    var d = S('defs', {}, open), cp = S('clipPath', { id: 'open-clip' }, d);
    S('rect', { x: 0, y: 0, width: 400, height: 240, rx: 14 }, cp);
    var g = S('g', { 'clip-path': 'url(#open-clip)' }, open);
    S('rect', { x: 0, y: 0, width: 400, height: 240, fill: '#fbf8f5' }, g);
    function lit(k) { return L.clamp(openPos - k, 0, 1); }
    function hitOf(k, label) {
      var h = S('g', { class: 'svg-hit', tabindex: 0, role: 'button', 'aria-label': label }, g);
      function go() { stopOpen(); stage = k + 1; openPos = stage; drawOpen(); }
      h.addEventListener('click', go);
      h.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      return h;
    }
    // 内地：整块底色
    var h4 = hitOf(3, '内地');
    S('rect', { x: 8, y: 8, width: 244, height: 224, rx: 12, fill: '#fff', stroke: stage === 4 ? '#7d4d3c' : '#e3d6cc', 'stroke-width': stage === 4 ? 2 : 1.2, 'stroke-dasharray': lit(3) ? null : '5 4' }, h4);
    S('rect', { x: 8, y: 8, width: 244, height: 224, rx: 12, fill: LAYERS[3].fill, opacity: lit(3) }, h4);
    S('text', { x: CX, y: 23, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: lit(3) ? '#7d4d3c' : '#b3a69e', text: '内地（沿江、沿边、内陆）' }, h4);
    [2, 1, 0].forEach(function (k) {
      var Lr = LAYERS[k], on = stage === k + 1, a = lit(k);
      var h = hitOf(k, Lr.n);
      S('circle', { cx: CX, cy: CY, r: Lr.r, fill: '#fff', stroke: on ? '#7d4d3c' : (a ? '#c9a991' : '#d8ccc3'), 'stroke-width': on ? 2.4 : 1.3, 'stroke-dasharray': a ? null : '5 4' }, h);
      S('circle', { cx: CX, cy: CY, r: Lr.r, fill: Lr.fill, opacity: a }, h);
      if (k === 0) S('text', { x: CX, y: CY + 4, 'text-anchor': 'middle', 'font-size': 11.5, 'font-weight': 700, fill: a > 0.5 ? '#fff' : '#b3a69e', text: Lr.n }, h);
      else S('text', { x: CX, y: CY - (LAYERS[k - 1].r + Lr.r) / 2 + 4, 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': 700, fill: a > 0.5 ? Lr.ink : '#b3a69e', text: Lr.n }, h);
    });
    // 右侧台阶：开放的先后
    S('text', { x: 330, y: 24, 'text-anchor': 'middle', 'font-size': 10.5, fill: '#8a7a70', text: '开放的先后（从下往上）' }, g);
    LAYERS.forEach(function (Lr, k) {
      var y = 190 - k * 46, x = 270 + k * 0, a = lit(k), on = stage === k + 1;
      var h = hitOf(k, Lr.y + ' ' + Lr.n);
      S('rect', { x: x, y: y, width: 120, height: 36, rx: 8, fill: a ? '#fff' : '#f3efec', stroke: on ? '#7d4d3c' : (a ? '#c9a991' : '#ddd2ca'), 'stroke-width': on ? 2.2 : 1.2 }, h);
      S('rect', { x: x, y: y, width: 6, height: 36, rx: 3, fill: a ? (k === 0 ? '#a4492b' : '#c9a991') : '#ddd2ca' }, h);
      S('text', { x: x + 14, y: y + 14, 'font-size': 10, fill: a ? '#8a5a3a' : '#b3a69e', text: Lr.y }, h);
      S('text', { x: x + 14, y: y + 29, 'font-size': 11.5, 'font-weight': 700, fill: a ? '#4a3a32' : '#b3a69e', text: Lr.n }, h);
      if (k < 3) S('path', { d: 'M330 ' + (y - 9) + 'l-5 5h10z', fill: lit(k + 1) ? '#a4492b' : '#d8ccc3' }, g);
    });
    var cur = LAYERS[Math.max(0, stage - 1)];
    L.$('#o-name').textContent = stage ? cur.n : '还没有开放';
    L.$('#o-badge').textContent = stage ? cur.y : '1978 年';
    L.$('#o-step').innerHTML = stage + '<small> / 4</small>';
    L.$('#o-text').innerHTML = stage ? cur.t : '1978 年十一届三中全会作出实行改革开放的决策。对外开放从哪里开始？按“向外推进一层”看看。';
    L.$('#open-go').textContent = stage === 4 ? '从头再看一遍' : (stage === 0 ? '先设立经济特区' : '向外推进一层');
    save();
  }
  function stopOpen() { if (openAnim) { openAnim.stop(); openAnim = null; openPos = stage; } }
  L.$('#open-go').addEventListener('click', function () {
    stopOpen();
    if (stage === 4) { stage = 0; openPos = 0; }
    stage += 1;
    if (L.REDUCED) { openPos = stage; drawOpen(); return; }
    openAnim = L.loop(function (dt) {
      openPos = Math.min(stage, openPos + dt * 2);
      drawOpen();
      if (openPos >= stage) { openAnim = null; return false; }
    });
  });
  L.$('#open-reset').addEventListener('click', function () { stopOpen(); stage = 0; openPos = 0; drawOpen(); });

  /* ========== 家庭联产承包责任制前后对比 ========== */
  var mode = st.f === 'before' ? 'before' : 'after';
  var harvested = st.h === '1', hv = harvested ? 1 : 0, hvAnim = null;
  var farm = L.$('#farm');
  function person(x, y, c, parent) {
    S('circle', { cx: x, cy: y - 7, r: 3.6, fill: c }, parent);
    S('path', { d: 'M' + (x - 5) + ' ' + (y + 6) + 'q5 -12 10 0z', fill: c }, parent);
  }
  function fBox(x, y, w, h, text, o, parent) {
    S('rect', { x: x, y: y, width: w, height: h, rx: 8, fill: o.fill, stroke: o.stroke, 'stroke-width': 1.3 }, parent);
    S('text', { x: x + w / 2, y: y + h / 2 + 4, 'text-anchor': 'middle', 'font-size': o.fs || 11.5, 'font-weight': 700, fill: o.ink, text: text }, parent);
  }
  function drawFarm() {
    farm.innerHTML = '';
    var d = S('defs', {}, farm), cp = S('clipPath', { id: 'farm-clip' }, d);
    S('rect', { x: 0, y: 0, width: 400, height: 230, rx: 14 }, cp);
    var g = S('g', { 'clip-path': 'url(#farm-clip)' }, farm);
    S('rect', { x: 0, y: 0, width: 400, height: 230, fill: '#fbf8f5' }, g);
    // 第一行：土地归谁
    S('rect', { x: 12, y: 10, width: 376, height: 34, rx: 9, fill: '#fff', stroke: '#cdb7a8' }, g);
    S('text', { x: 24, y: 31.5, 'font-size': 12, 'font-weight': 700, fill: '#4a3a32', text: '土地：归集体所有' }, g);
    S('rect', { x: 268, y: 17, width: 110, height: 20, rx: 10, fill: '#e8f1e6' }, g);
    S('text', { x: 323, y: 31, 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': 700, fill: '#2f6a4a', text: '改革前后都没变' }, g);
    // 第二行：谁来经营
    if (mode === 'before') {
      S('rect', { x: 12, y: 54, width: 376, height: 88, rx: 9, fill: '#f3ebe4', stroke: '#cdb7a8' }, g);
      S('text', { x: 200, y: 72, 'text-anchor': 'middle', 'font-size': 11.5, 'font-weight': 700, fill: '#5a3a2c', text: '生产队：集体统一经营、统一劳动' }, g);
      for (var r0 = 0; r0 < 3; r0++) S('line', { x1: 26, y1: 84 + r0 * 7, x2: 374, y2: 84 + r0 * 7, stroke: '#d8c7a6', 'stroke-width': 1.4, 'stroke-dasharray': '6 4' }, g);
      for (var i = 0; i < 14; i++) person(40 + i * 25.5, 124, '#9a7a68', g);
    } else {
      for (var k = 0; k < 4; k++) {
        var x0 = 12 + k * 95;
        S('rect', { x: x0, y: 54, width: 89, height: 88, rx: 9, fill: '#f6efe2', stroke: '#c9a991' }, g);
        S('text', { x: x0 + 44.5, y: 72, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: '#5a3a2c', text: '第 ' + (k + 1) + ' 户承包' }, g);
        for (var r1 = 0; r1 < 3; r1++) S('line', { x1: x0 + 10, y1: 84 + r1 * 7, x2: x0 + 79, y2: 84 + r1 * 7, stroke: '#d8c7a6', 'stroke-width': 1.4, 'stroke-dasharray': '6 4' }, g);
        for (var j = 0; j < 3; j++) person(x0 + 22 + j * 22, 124, '#a4492b', g);
      }
    }
    // 第三行：收成怎么分
    var boxes = mode === 'before'
      ? [[12, 60, '收成'], [86, 150, '集体统一分配'], [250, 138, '分到每个社员']]
      : [[12, 60, '收成'], [86, 90, '交够国家的'], [190, 90, '留足集体的'], [294, 94, '剩下都是自己的']];
    boxes.forEach(function (b, n) {
      var a = n === 0 ? 1 : L.clamp(hv * (boxes.length - 1) - (n - 1), 0, 1);
      var shown = a > 0.5;
      fBox(b[0], 160, b[1], 34, b[2], { fill: shown ? (n === boxes.length - 1 && mode === 'after' ? '#e8f1e6' : '#fff') : '#f3efec', stroke: shown ? '#c9a991' : '#ddd2ca', ink: shown ? '#4a3a32' : '#b3a69e', fs: 11 }, g);
      if (n > 0) {
        var px = boxes[n - 1][0] + boxes[n - 1][1];
        L.arrow(g, px + 2, 177, b[0] - 2, 177, { color: shown ? '#a4492b' : '#d8ccc3', width: 1.6, head: 6 });
      }
    });
    S('text', { x: 200, y: 216, 'text-anchor': 'middle', 'font-size': 10.5, fill: '#8a7a70', text: harvested ? (mode === 'after' ? '多劳多得：农民的生产积极性提高了' : '统一分配：分配上存在平均主义') : '按“秋收分粮”看看收成怎么分（示意，不表示实际比例）' }, g);
    var after = mode === 'after';
    L.$('#f-name').textContent = after ? '家庭联产承包责任制' : '改革前的农村';
    L.$('#f-badge').textContent = after ? '1978 年起 · 小岗村率先' : '集体统一经营';
    L.$('#f-who').textContent = after ? '农户家庭承包经营' : '集体统一经营';
    L.$('#f-share').textContent = after ? '交够国家的，留足集体的，剩下都是自己的' : '集体统一分配';
    L.$('#f-text').innerHTML = after
      ? '在土地仍归集体所有的前提下，农户以家庭为单位承包土地、自主经营，完成国家和集体的任务后，剩下的归自己。这一改革<b>调动了农民的生产积极性，解放了农村生产力</b>。'
      : '改革前，土地由集体统一经营、统一劳动、统一分配，分配上存在平均主义，农民的生产积极性不高。';
    save();
  }
  function stopHv() { if (hvAnim) { hvAnim.stop(); hvAnim = null; } }
  L.chips(L.$('#farm-chips'), [{ label: '改革前', value: 'before' }, { label: '实行承包制后', value: 'after' }], mode, function (v) { stopHv(); mode = v; harvested = false; hv = 0; drawFarm(); });
  L.$('#harvest-btn').addEventListener('click', function () {
    stopHv();
    harvested = true; hv = 0;
    if (L.REDUCED) { hv = 1; drawFarm(); return; }
    hvAnim = L.loop(function (dt) {
      hv = Math.min(1, hv + dt * 0.9);
      drawFarm();
      if (hv >= 1) { hvAnim = null; return false; }
    });
  });

  function save() { L.setState({ y: year, o: stage, f: mode, h: harvested && hv >= 1 ? 1 : '' }); }

  render();
  drawOpen();
  drawFarm();

  /* ========== 课本逐课要点（顺序对应新教材八下第 8～14 课） ========== */
  L.keypoints('#keypoints', [
    '1978 年<b>真理标准问题的讨论</b>为转折作了思想准备；1978 年 12 月<b>中共十一届三中全会</b>重新确立解放思想、实事求是的思想路线，把工作中心转移到经济建设上来，作出实行改革开放的伟大决策，是新中国成立以来党的历史上具有深远意义的伟大转折。',
    '改革从农村开始：小岗村率先包产到户，<b>家庭联产承包责任制</b>在全国推行（土地仍归集体所有），调动了农民的生产积极性。对外开放从<b>经济特区</b>起步：1980 年设立深圳、珠海、汕头、厦门经济特区。',
    '1982 年中共十二大提出“建设有中国特色的社会主义”，同年通过现行宪法；1984 年起改革重点转向城市，以<b>国有企业改革</b>为中心环节；1984 年开放 14 个沿海港口城市，1985 年起开辟沿海经济开放区，1988 年设立海南经济特区。',
    '1987 年<b>中共十三大</b>系统阐述社会主义初级阶段理论，提出党在社会主义初级阶段的基本路线，核心是“<b>一个中心、两个基本点</b>”：以经济建设为中心，坚持四项基本原则，坚持改革开放。',
    '1990 年开发开放上海浦东；1992 年初<b>邓小平南方谈话</b>；1992 年<b>中共十四大</b>明确经济体制改革的目标是建立<b>社会主义市场经济体制</b>。',
    '1997 年<b>中共十五大</b>把邓小平理论确立为党的指导思想，提出依法治国基本方略；“一国两制”下，<b>1997 年 7 月 1 日</b>中国政府恢复对香港行使主权、<b>1999 年 12 月 20 日</b>恢复对澳门行使主权；2001 年我国加入世界贸易组织。',
    '国防：1985 年决定裁减军队员额 100 万，走中国特色精兵之路。外交：坚持独立自主的和平外交政策，2001 年<b>上海合作组织</b>成立，同年 APEC 领导人非正式会议在上海举行。'
  ]);

  /* ========== 大题训练 ========== */
  L.essay('#essay', {
    title: '改革开放的起步与推进',
    materials: [
      { label: '材料一', text: '1978 年冬，安徽凤阳县小岗村的农民率先把集体的土地承包到户。实行家庭联产承包责任制后，土地仍归集体所有，农户以家庭为单位承包经营，“交够国家的，留足集体的，剩下都是自己的”。', src: '——据统编版八年级下册第 9 课整理' },
      { label: '材料二', text: '1980 年，我国在深圳、珠海、汕头、厦门设立经济特区；1984 年，开放 14 个沿海港口城市；1985 年起，开辟沿海经济开放区；1990 年，开发开放上海浦东。此后对外开放逐步扩展到内地。', src: '——据统编版八年级下册第 9、10、12 课整理' }
    ],
    parts: [
      {
        ask: '(1) 根据材料一，概括家庭联产承包责任制的主要特点。', score: 4, type: 'sum',
        points: [
          { t: '土地仍归集体所有（所有权没变）', s: 1 },
          { t: '以家庭为单位承包经营（经营方式变了）', s: 1 },
          { t: '先完成国家和集体的任务', s: 1 },
          { t: '剩下的归农民自己，多劳多得（分配方式变了）', s: 1 }
        ],
        model: '土地仍归集体所有；农户以家庭为单位承包经营；交够国家的、留足集体的，剩下的归自己，多劳多得。'
      },
      {
        ask: '(2) 根据材料二，概括我国对外开放的特点。', score: 4, type: 'sum',
        points: [
          { t: '先设经济特区试点，再推广（由点到面）', s: 1 },
          { t: '由沿海向内地推进', s: 1 },
          { t: '开放范围逐步扩大、循序渐进（特区→沿海城市→沿海经济开放区→内地）', s: 1 },
          { t: '逐步形成全方位、多层次、宽领域的对外开放格局', s: 1 }
        ],
        model: '先在经济特区试点，再逐步推广，由点到面；由沿海到内地，循序渐进地扩大开放范围；逐步形成“经济特区—沿海开放城市—沿海经济开放区—内地”全方位、多层次、宽领域的对外开放格局。'
      },
      {
        ask: '(3) 以深圳为例或结合全国的史实，围绕“改革开放”自拟一个观点，加以阐述。（要求：观点正确，史论结合，条理清楚）', score: 8, type: 'essay',
        points: [
          { t: '观点明确、正确，例如“改革开放是决定当代中国命运的关键一招”或“改革开放推动了中国的发展”', s: 2 },
          { t: '用改革的史实论证（如十一届三中全会、家庭联产承包责任制、国企改革、社会主义市场经济体制）', s: 2 },
          { t: '用开放的史实论证（如深圳等经济特区、对外开放格局、2001 年加入世贸组织）', s: 2 },
          { t: '有结论回扣观点，条理清楚', s: 2 }
        ],
        model: '观点：改革开放推动了中国经济的快速发展。论证：1978 年十一届三中全会作出改革开放的伟大决策；农村实行家庭联产承包责任制，调动了农民积极性；城市以国企改革为中心环节，1992 年中共十四大确立建立社会主义市场经济体制的目标。对外开放从 1980 年设立深圳等经济特区起步，深圳从边陲小镇发展成为现代化城市；开放由沿海到内地，2001 年我国加入世界贸易组织。结论：改革开放解放和发展了社会生产力，是中国走向富强的必由之路。'
      }
    ]
  });

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '把年份调到深圳等地设立经济特区的那一年',
      desc: '在时间轴下面拖动滑块，或者直接点时间轴上的事件。',
      label: '在时间轴里操作',
      button: '检查年份',
      check: function () {
        if (year === 1980) return { ok: true, msg: '1980 年，在深圳、珠海、汕头、厦门设立经济特区，距今 ' + L.span(1980, NOW) + ' 年。' };
        if (year === 1984) return { ok: false, msg: '1984 年开放的是 <b>14 个沿海港口城市</b>，经济特区比它早几年。' };
        if (year === 1988) return { ok: false, msg: '1988 年设立的是海南经济特区，深圳等第一批特区更早。' };
        return { ok: false, msg: '现在是' + L.yr(year) + '。经济特区在十一届三中全会（1978 年）之后、开放 14 个沿海城市（1984 年）之前。' };
      }
    },
    {
      level: 'base',
      title: '作出实行改革开放伟大决策的会议是',
      desc: '它开启了改革开放和社会主义现代化建设新时期。',
      options: ['中共十一届三中全会', '中共八大', '中共十四大', '第一届全国人民代表大会第一次会议'],
      answer: 0,
      hint: '时间是 1978 年 12 月。',
      explain: '1978 年 12 月的<b>中共十一届三中全会</b>作出实行改革开放的伟大决策。中共八大在 1956 年；中共十四大在 1992 年，明确了建立社会主义市场经济体制的目标；第一届全国人大第一次会议在 1954 年，通过了第一部宪法。'
    },
    {
      level: 'base',
      title: '中国政府恢复对香港行使主权的时间是',
      desc: '可以在时间轴上找一找，或看“一国两制”表。',
      options: ['1997 年 7 月 1 日', '1999 年 12 月 20 日', '1984 年 10 月 1 日', '2001 年 12 月 11 日'],
      answer: 0,
      hint: '香港比澳门早回归两年。',
      explain: '<b>1997 年 7 月 1 日</b>中国政府恢复对香港行使主权，香港特别行政区成立。1999 年 12 月 20 日是澳门回归；2001 年 12 月是我国加入世界贸易组织。'
    },
    {
      level: 'mid',
      title: '把对外开放推进到 1984 年开放的那一层',
      desc: '在“深圳之窗”里从经济特区往外推进，停在 1984 年开放的那一层。',
      label: '在对外开放格局图里操作',
      button: '检查开放层次',
      check: function () {
        if (stage === 2) return { ok: true, msg: '1984 年开放了 14 个沿海港口城市，这是对外开放的第二层。顺序是：经济特区 → 沿海开放城市 → 沿海经济开放区 → 内地。' };
        if (stage < 2) return { ok: false, msg: '现在停在“' + (stage ? LAYERS[stage - 1].n : '还没开放') + '”，再往外推进。' };
        return { ok: false, msg: '推过头了，现在是“' + LAYERS[stage - 1].n + '”。1984 年那一层在它里面，可以直接点右边的台阶。' };
      }
    },
    {
      level: 'mid',
      title: '看看实行承包制以后收成怎么分',
      desc: '在“农村改革”图里切换到“实行承包制后”，再按“秋收分粮”，等收成分完。',
      label: '在农村改革对比图里操作',
      button: '检查',
      check: function () {
        if (mode !== 'after') return { ok: false, msg: '先切换到“实行承包制后”。' };
        if (!harvested || hv < 1) return { ok: false, msg: '再按一下“秋收分粮”，等三格都亮起来。' };
        return { ok: true, msg: '交够国家的，留足集体的，剩下都是自己的。注意最上面一行：土地<b>仍归集体所有</b>，变的是经营方式和分配方式。' };
      }
    },
    {
      level: 'mid',
      title: '党在社会主义初级阶段基本路线的核心“一个中心、两个基本点”中，“一个中心”是',
      desc: '1987 年中共十三大提出。',
      options: ['以经济建设为中心', '以阶级斗争为纲', '以国有企业改革为中心', '以对外开放为中心'],
      answer: 0,
      hint: '十一届三中全会把工作中心转移到了哪里？',
      explain: '“一个中心”是<b>以经济建设为中心</b>，两个基本点是坚持四项基本原则、坚持改革开放。“以阶级斗争为纲”正是十一届三中全会停止使用的口号；国有企业改革是城市经济体制改革的中心环节，不是基本路线的中心；对外开放属于“两个基本点”中的改革开放。'
    },
    {
      level: 'trap',
      title: '关于家庭联产承包责任制，下列说法正确的是',
      desc: '最常见的坑：土地到底归谁？',
      options: ['土地等生产资料仍归集体所有', '把土地分给农民私人所有', '农民不再向国家和集体承担任务', '最早在城市推行'],
      answer: 0,
      hint: '“承包”是承包经营，不是把地变成私人的。',
      explain: '实行家庭联产承包责任制，<b>土地仍归集体所有</b>，农户以家庭为单位承包经营。“交够国家的，留足集体的”说明农民仍要完成国家和集体的任务；这项改革在农村推行，城市改革以国有企业改革为中心环节。'
    },
    {
      level: 'trap',
      title: '关于“一国两制”，下列说法正确的是',
      desc: '注意“最初为什么提出”和“首先在哪里实践”。',
      options: ['最初是为解决台湾问题提出的，首先运用于解决香港、澳门问题', '最初是为解决香港问题提出的', '香港、澳门回归后改行社会主义制度', '大陆也实行资本主义制度'],
      answer: 0,
      hint: '提出它的初衷和第一次用上它，不是同一个地方。',
      explain: '“一国两制”<b>最初是为解决台湾问题提出的，首先运用于解决香港、澳门问题</b>。按照“一国两制”，国家的主体坚持社会主义制度，香港、澳门保持原有的资本主义制度长期不变，所以后两项都说反了。'
    }
  ]);
})();
