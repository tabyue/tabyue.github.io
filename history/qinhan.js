/* 历史互动馆 · 第 3 课 秦汉：大一统国家的建立 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();
  var NOW = 2026;

  /* ========== 时间轴与纪年 ========== */
  var DYN = [
    { from: -250, to: -222, name: '战国', color: '#efe7df' },
    { from: -221, to: -207, name: '秦', color: '#e3cfc2' },
    { from: -206, to: -203, name: '楚汉之争', color: '#efe7df' },
    { from: -202, to: 8, name: '西汉', color: '#ead8c6' },
    { from: 9, to: 23, name: '新', color: '#efe7df' },
    { from: 24, to: 24, name: '更始', color: '#efe7df' },
    { from: 25, to: 220, name: '东汉', color: '#e6d3c0' },
    { from: 221, to: 240, name: '三国', color: '#efe7df' }
  ];
  var EVENTS = [
    { id: 'unify', y: -221, label: '秦统一', row: 2, note: '秦王嬴政灭六国，建立中国历史上第一个统一的多民族封建国家，自称“始皇帝”。' },
    { id: 'chen', y: -209, label: '陈胜吴广起义', row: 0, note: '大泽乡起义，我国历史上第一次大规模农民起义。' },
    { id: 'qinend', y: -207, label: '秦亡', row: 1, note: '秦朝灭亡，前后只存在 15 年。' },
    { id: 'han', y: -202, label: '西汉建立', row: 3, note: '刘邦建立西汉，定都长安。' },
    { id: 'zhang1', y: -138, label: '张骞出使西域', row: 0, note: '张骞第一次出使西域，想联合大月氏夹击匈奴。' },
    { id: 'zhang2', y: -119, label: '张骞再出使', row: 1, note: '张骞第二次出使西域，加强了汉朝与西域各国的往来。' },
    { id: 'duhu', y: -60, label: '设西域都护', row: 2, note: '西汉设置西域都护，新疆地区正式归中央政权管辖。' },
    { id: 'dong', y: 25, label: '东汉建立', row: 0, note: '刘秀建立东汉，定都洛阳。' },
    { id: 'ban', y: 73, label: '班超出使', row: 1, note: '东汉班超出使西域，恢复了中原与西域的联系。' },
    { id: 'cai', y: 105, label: '蔡伦改进造纸术', row: 2, note: '东汉蔡伦改进造纸术，纸更便宜好用，逐渐普及。' },
    { id: 'huang', y: 184, label: '黄巾起义', row: 0, note: '东汉末年张角领导黄巾起义，东汉统治走向崩溃。' },
    { id: 'hanend', y: 220, label: '东汉亡', row: 1, note: '曹丕称帝，东汉灭亡，进入三国时期。' }
  ];
  var year = Math.round(L.num(st.y, -221, -250, 240));
  if (year === 0) year = 1;
  var tl = L.$('#tl'), yIn = L.$('#year-in');

  function dynOf(y) { for (var i = 0; i < DYN.length; i++) if (y >= DYN[i].from && y <= DYN[i].to) return DYN[i]; return null; }
  function nearest(y) {
    var best = null;
    EVENTS.forEach(function (e) { if (Math.abs(e.y - y) <= 6 && (!best || Math.abs(e.y - y) < Math.abs(best.y - y))) best = e; });
    return best;
  }
  function drawTL() {
    var ev = nearest(year);
    var ax = L.timeline(tl, {
      from: -250, to: 240, step: 50,
      era: DYN.filter(function (d) { return d.to - d.from >= 10; }).map(function (d) { return { from: d.from, to: d.to, label: d.name, color: d.color }; }),
      events: EVENTS.map(function (e) { return { id: e.id, y: e.y, label: e.label, row: e.row, on: ev && ev.id === e.id, color: ev && ev.id === e.id ? '#a4492b' : '#7d4d3c' }; }),
      pick: function (id) { var e = EVENTS.filter(function (x) { return x.id === id; })[0]; setYear(e.y); }
    });
    // 当前年份的游标
    var x = ax.X(year);
    S('line', { x1: x, y1: 8, x2: x, y2: ax.base + 50, stroke: '#c2603f', 'stroke-width': 1.6, 'stroke-dasharray': '4 3' }, tl);
    S('path', { d: 'M' + (x - 6) + ' 4h12l-6 8z', fill: '#c2603f' }, tl);
  }
  function setYear(y) {
    year = y === 0 ? 1 : y;
    yIn.value = year; L.paintRange(yIn);
    render();
  }
  function render() {
    drawTL();
    var d = dynOf(year), ev = nearest(year);
    L.$('#year-out').textContent = L.yr(year);
    L.$('#dyn-badge').textContent = d ? d.name : '—';
    L.$('#r-cent').textContent = L.century(year);
    L.$('#r-ago').innerHTML = L.span(year, NOW) + '<small>年前</small>';
    L.$('#r-event').textContent = ev ? (ev.y === year ? '' : '约 ' + L.yr(ev.y) + '：') + ev.label : '这几年没有课本里的大事';
    var t = ev ? ev.note + ' ' : '';
    if (year < 0) t += '公元前的年份要倒着数：数字越大，离今天越远。';
    else if (year <= 100) t += '公元 1～100 年都属于 1 世纪；跨过公元元年时，没有“公元 0 年”。';
    else t += '世纪 = 年份 ÷ 100 后向上取整，所以 ' + year + ' 年属于 ' + L.century(year) + '。';
    L.$('#r-text').innerHTML = t;
    save();
  }
  L.bindRange(yIn, function (v) { year = v === 0 ? (year < 0 ? 1 : -1) : v; if (v === 0) { yIn.value = year; L.paintRange(yIn); } render(); });
  yIn.value = year; L.paintRange(yIn);

  /* ========== 分封制与郡县制 ========== */
  var sysT = st.s === 'fen' ? 'fen' : 'jun';
  var gen = 0;   // 0 刚建立；1 传到第三代
  var sysSvg = L.$('#sys');
  function box(x, y, w, h, label, sub, o) {
    o = o || {};
    S('rect', { x: x - w / 2, y: y - h / 2, width: w, height: h, rx: 9, fill: o.fill || '#fff', stroke: o.stroke || '#cdb7a8', 'stroke-width': o.sw || 1.4, 'stroke-dasharray': o.dash || null }, sysSvg);
    S('text', { x: x, y: y + (sub ? -2 : 4.5), 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: o.color || '#4a3a32', text: label }, sysSvg);
    if (sub) S('text', { x: x, y: y + 13, 'text-anchor': 'middle', 'font-size': 10, fill: o.subColor || '#8a7a70', text: sub }, sysSvg);
  }
  function link(x1, y1, x2, y2, o) {
    o = o || {};
    S('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: o.color || '#b9a89c', 'stroke-width': o.w || 1.6, 'stroke-dasharray': o.dash || null }, sysSvg);
  }
  function drawSys() {
    sysSvg.innerHTML = '';
    S('rect', { x: 0, y: 0, width: 400, height: 230, rx: 14, fill: '#fbf8f5' }, sysSvg);
    var weak = sysT === 'fen' && gen === 1;
    if (sysT === 'fen') {
      box(200, 34, 112, 38, '周天子', '把土地和人民分出去');
      [70, 200, 330].forEach(function (x, i) {
        link(200, 53, x, 98, { dash: weak ? '4 4' : null, color: weak ? '#d9a58a' : '#b9a89c' });
        box(x, 116, 104, 38, ['齐', '鲁', '燕'][i] + '国诸侯', weak ? '自己说了算' : '世袭，向天子纳贡', { stroke: weak ? '#d9a58a' : '#cdb7a8', subColor: weak ? '#a4492b' : '#8a7a70' });
        [-26, 26].forEach(function (dx) {
          link(x, 135, x + dx, 172);
          box(x + dx, 188, 46, 28, '卿大夫', null);
        });
      });
      if (weak) {
        S('text', { x: 200, y: 224, 'text-anchor': 'middle', 'font-size': 11.5, fill: '#a4492b', 'font-weight': 700, text: '几代以后：诸侯互相攻打，天子管不住 → 春秋战国' }, sysSvg);
      }
    } else {
      box(200, 34, 112, 38, '皇帝', '最高权力集中在一人', { stroke: '#7d4d3c', sw: 2 });
      box(78, 34, 92, 34, '三公九卿', '中央官员', {});
      link(132, 34, 144, 34);
      [70, 200, 330].forEach(function (x, i) {
        link(200, 53, x, 98, { color: '#7d4d3c', w: 2 });
        box(x, 116, 104, 38, '郡守', gen === 1 ? '仍由皇帝任免' : '皇帝任免，不世袭', { stroke: '#7d4d3c' });
        [-26, 26].forEach(function (dx) {
          link(x, 135, x + dx, 172, { color: '#7d4d3c' });
          box(x + dx, 188, 46, 28, '县令', null, { stroke: '#7d4d3c' });
        });
      });
      if (gen === 1) S('text', { x: 200, y: 224, 'text-anchor': 'middle', 'font-size': 11.5, fill: '#2f6a4a', 'font-weight': 700, text: '换了几任官员，还是听皇帝的：中央集权加强' }, sysSvg);
    }
    var fen = sysT === 'fen';
    L.$('#sys-name').textContent = fen ? '分封制' : '郡县制';
    L.$('#sys-badge').textContent = fen ? '西周实行' : '秦朝推行';
    L.$('#sys-who').textContent = fen ? '天子分封亲属功臣' : '皇帝直接任免';
    L.$('#sys-heir').textContent = fen ? '能，世代相传' : '不能';
    L.$('#sys-text').innerHTML = fen
      ? (gen ? '分封的诸侯世代相传，和周天子的血缘关系越来越远，实力越来越强，最后不再听天子的话，互相兼并，进入了春秋战国的动荡时期。' : '西周把土地和人民分给亲属、功臣，让他们去各地当诸侯，替天子守护地方。刚开始很有效，巩固了西周的统治。')
      : (gen ? '郡守、县令都是皇帝派去的，干得不好就撤换，也不能传给子孙。不管过多少年，地方都要听中央的，这就是<b>中央集权</b>。郡县制被后来历代王朝沿用。' : '秦朝把全国分成若干郡，郡下设县。郡守、县令由皇帝直接任免，地方的权力集中到中央，再集中到皇帝手里。');
    L.$('#gen-btn').textContent = gen ? '回到刚建立时' : '传到第三代会怎样';
    save();
  }
  var sysChips = L.chips(L.$('#sys-chips'), [{ label: '分封制（西周）', value: 'fen' }, { label: '郡县制（秦）', value: 'jun' }], sysT, function (v) { sysT = v; gen = 0; drawSys(); });
  L.$('#gen-btn').addEventListener('click', function () { gen = gen ? 0 : 1; drawSys(); });

  /* ========== 丝绸之路 ========== */
  var STOPS = [
    { n: '长安', b: '起点', x: 372, y: 150, t: '西汉的都城，丝绸之路从这里出发。张骞就是从长安动身出使西域的。' },
    { n: '河西走廊', b: '要道', x: 312, y: 116, t: '夹在祁连山和沙漠之间的一条狭长通道。汉武帝打败匈奴后，在这里设了武威、张掖、酒泉、敦煌四郡。' },
    { n: '敦煌', b: '出关前', x: 256, y: 92, t: '河西走廊西头的重镇，往西出玉门关、阳关就进入西域。后来这里留下了著名的莫高窟。' },
    { n: '西域', b: '今新疆一带', x: 200, y: 112, t: '汉代对玉门关、阳关以西地区的统称，当时有许多小国。公元前 60 年西汉设西域都护，这里正式归中央管辖。' },
    { n: '中亚', b: '大宛、大月氏', x: 140, y: 82, t: '张骞第一次出使的目的地是大月氏，想联合它夹击匈奴。大宛出产汗血马。' },
    { n: '西亚', b: '安息', x: 84, y: 116, t: '安息位于西亚，是丝绸之路的中转站，许多中国丝绸经过这里转运到更西的地方。' },
    { n: '欧洲', b: '大秦（罗马）', x: 32, y: 86, t: '汉朝称罗马帝国为“大秦”。中国的丝绸在罗马非常受欢迎，这条路因此被后人叫作“丝绸之路”。' }
  ];
  var stop = Math.round(L.num(st.r, 0, 0, STOPS.length - 1)), roadAnim = null, roadPos = stop;
  var road = L.$('#road');
  function drawRoad() {
    road.innerHTML = '';
    var d = S('defs', {}, road), cp = S('clipPath', { id: 'road-clip' }, d);
    S('rect', { x: 0, y: 0, width: 400, height: 210, rx: 14 }, cp);
    var g = S('g', { 'clip-path': 'url(#road-clip)' }, road);
    S('rect', { x: 0, y: 0, width: 400, height: 210, fill: '#fbf6ef' }, g);
    var path = 'M' + STOPS.map(function (s) { return s.x + ' ' + s.y; }).join('L');
    S('path', { d: path, fill: 'none', stroke: '#e6d6c4', 'stroke-width': 9, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, g);
    S('path', { d: path, fill: 'none', stroke: '#c9a26d', 'stroke-width': 2, 'stroke-dasharray': '6 5', 'stroke-linejoin': 'round' }, g);
    // 已走过的部分
    var k = Math.floor(roadPos), f = roadPos - k, pts = STOPS.slice(0, k + 1).map(function (s) { return [s.x, s.y]; });
    if (k < STOPS.length - 1 && f > 0) pts.push([STOPS[k].x + (STOPS[k + 1].x - STOPS[k].x) * f, STOPS[k].y + (STOPS[k + 1].y - STOPS[k].y) * f]);
    if (pts.length > 1) S('path', { d: 'M' + pts.map(function (p) { return p.join(' '); }).join('L'), fill: 'none', stroke: '#a4492b', 'stroke-width': 3, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, g);
    STOPS.forEach(function (s, i) {
      var on = i === stop, passed = i <= roadPos + 1e-6;
      var hit = S('g', { class: 'svg-hit', tabindex: 0, role: 'button', 'aria-label': s.n }, g);
      S('circle', { cx: s.x, cy: s.y, r: on ? 9 : 6.5, fill: passed ? '#a4492b' : '#fff', stroke: '#a4492b', 'stroke-width': 2 }, hit);
      var above = i % 2 === 0;
      S('text', { x: s.x, y: s.y + (above ? -16 : 25), 'text-anchor': 'middle', 'font-size': 12, 'font-weight': on ? 700 : 600, fill: '#4a3a32', text: s.n, stroke: '#fbf6ef', 'stroke-width': 3, 'paint-order': 'stroke' }, hit);
      S('text', { x: s.x, y: s.y + (above ? -30 : 38), 'text-anchor': 'middle', 'font-size': 9.5, fill: '#8a7a70', text: s.b, stroke: '#fbf6ef', 'stroke-width': 3, 'paint-order': 'stroke' }, hit);
      hit.addEventListener('click', function () { stopRoad(); stop = i; roadPos = i; drawRoad(); });
      hit.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); stopRoad(); stop = i; roadPos = i; drawRoad(); } });
    });
    // 骆驼商队
    var cx = pts[pts.length - 1][0], cy = pts[pts.length - 1][1];
    S('text', { x: cx, y: cy + 5, 'text-anchor': 'middle', 'font-size': 14, text: '◆', fill: '#7d4d3c', opacity: roadAnim ? 1 : 0 }, g);
    S('text', { x: 14, y: 200, 'font-size': 10, fill: '#a0908a', text: '← 往西' }, g);
    S('text', { x: 386, y: 200, 'text-anchor': 'end', 'font-size': 10, fill: '#a0908a', text: '往东 →' }, g);
    var s = STOPS[stop];
    L.$('#st-name').textContent = s.n;
    L.$('#st-badge').textContent = (stop + 1) + ' / ' + STOPS.length + ' · ' + s.b;
    L.$('#st-text').innerHTML = s.t;
    L.$('#road-go').textContent = stop === STOPS.length - 1 ? '再走一遍' : (stop === 0 ? '从长安出发' : '继续往西');
    save();
  }
  function stopRoad() { if (roadAnim) { roadAnim.stop(); roadAnim = null; } }
  L.$('#road-go').addEventListener('click', function () {
    stopRoad();
    if (stop === STOPS.length - 1) { stop = 0; roadPos = 0; }
    var target = stop + 1;
    if (L.REDUCED) { stop = target; roadPos = target; drawRoad(); return; }
    roadAnim = L.loop(function (dt) {
      roadPos = Math.min(target, roadPos + dt * 1.2);
      if (roadPos >= target) { stop = target; roadAnim = null; drawRoad(); return false; }
      drawRoad();
    });
  });
  L.$('#road-reset').addEventListener('click', function () { stopRoad(); stop = 0; roadPos = 0; drawRoad(); });

  function save() { L.setState({ y: year, s: sysT, r: stop }); }

  render();
  drawSys();
  drawRoad();



  /* ========== 课本逐课要点（顺序对应新教材七上第 9～15 课） ========== */
  L.keypoints('#keypoints', [
    '公元前 221 年秦统一六国，建立第一个统一的多民族封建国家；创立皇帝制度，中央设三公九卿，地方推行<b>郡县制</b>；统一文字（小篆）、货币（圆形方孔半两钱）、度量衡；北击匈奴、修长城，南征百越、开灵渠。',
    '公元前 209 年陈胜、吴广大泽乡起义，是我国历史上第一次大规模农民起义；根本原因是秦的暴政。公元前 207 年秦亡。',
    '公元前 202 年刘邦建立西汉，定都长安；汉初休养生息，文帝、景帝时出现“<b>文景之治</b>”。',
    '汉武帝：推恩令（政治）、罢黜百家尊崇儒术并兴办太学（思想）、统一铸造五铢钱和盐铁官营（经济）、卫青霍去病北击匈奴（军事）。',
    '公元 25 年刘秀建立东汉，定都洛阳，出现“光武中兴”；东汉后期外戚宦官交替专权，184 年黄巾起义，东汉统治瓦解。',
    '张骞两次出使西域；公元前 60 年西汉设<b>西域都护</b>，新疆地区正式归中央管辖；东汉班超经营西域；丝绸之路沟通东西方。',
    '东汉蔡伦改进造纸术；张仲景《伤寒杂病论》；华佗麻沸散、五禽戏；司马迁《史记》是我国第一部纪传体通史。'
  ]);

  /* ========== 大题训练 ========== */
  L.essay('#essay', {
    title: '秦汉大一统',
    materials: [
      { label: '材料一', text: '（秦始皇）一法度衡石丈尺，车同轨，书同文字。', src: '——《史记·秦始皇本纪》' },
      { label: '材料二', text: '汉武帝颁布“推恩令”，允许诸侯王把封地分给子弟，诸侯国越分越小；接受董仲舒的建议，“罢黜百家，尊崇儒术”，在长安兴办太学；把铸币权收归中央，统一铸造五铢钱，实行盐铁官营。', src: '——据统编版七年级上册第 12 课整理' }
    ],
    parts: [
      {
        ask: '(1) 根据材料一，概括秦始皇巩固统一的措施。', score: 4, type: 'sum',
        points: [
          { t: '统一法律制度（“一法度”）', s: 1 },
          { t: '统一度量衡（“衡石丈尺”）', s: 1 },
          { t: '统一车辆轨距（“车同轨”）', s: 1 },
          { t: '统一文字（“书同文字”）', s: 1 }
        ],
        model: '统一法律；统一度量衡；统一车轨；统一文字。（每点 1 分，概括时把材料里的古文转成现代说法。）'
      },
      {
        ask: '(2) 根据材料二并结合所学，说明汉武帝从哪些方面巩固了大一统，各举一例。', score: 4, type: 'fact',
        points: [
          { t: '政治：颁布推恩令，削弱诸侯王势力', s: 1 },
          { t: '思想：罢黜百家，尊崇儒术，兴办太学', s: 1 },
          { t: '经济：统一铸造五铢钱，盐铁官营', s: 1 },
          { t: '军事：派卫青、霍去病北击匈奴（材料外，结合所学）', s: 1 }
        ],
        model: '政治上颁布推恩令，削弱诸侯王；思想上罢黜百家、尊崇儒术，兴办太学；经济上统一铸造五铢钱、盐铁官营；军事上派卫青、霍去病北击匈奴。'
      },
      {
        ask: '(3) 围绕“大一统”，自拟一个观点，结合秦汉的史实加以阐述。（要求：观点正确，史论结合，条理清楚）', score: 8, type: 'essay',
        points: [
          { t: '观点明确、正确，例如“秦汉大一统奠定了统一多民族国家的基础”', s: 2 },
          { t: '用秦朝的史实论证（如郡县制、统一文字度量衡）', s: 2 },
          { t: '用汉朝的史实论证（如推恩令、尊崇儒术、设西域都护）', s: 2 },
          { t: '有结论回扣观点，条理清楚', s: 2 }
        ],
        model: '观点：秦汉大一统奠定了中国统一多民族国家的基础。论证：秦朝统一六国，推行郡县制，统一文字、货币、度量衡，使各地联系更紧密；汉武帝颁布推恩令、尊崇儒术、统一铸币，公元前 60 年西汉设西域都护，新疆地区正式归中央管辖。结论：秦创立、汉巩固，大一统的制度和观念深刻影响了后世，维护国家统一一直是中华民族的共同追求。'
      }
    ]
  });

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '把年份调到秦统一的那一年',
      desc: '在时间轴下面拖动滑块，或者直接点时间轴上的事件。',
      label: '在时间轴里操作',
      button: '检查年份',
      check: function () {
        if (year === -221) return { ok: true, msg: '公元前 221 年，秦灭六国。它属于公元前 3 世纪，距今 ' + L.span(-221, NOW) + ' 年。' };
        if (year > 0) return { ok: false, msg: '秦统一在<b>公元前</b>，要往滑块左边拖。' };
        return { ok: false, msg: '现在是' + L.yr(year) + '。秦统一比西汉建立（公元前 202 年）早一些。' };
      }
    },
    {
      level: 'base',
      title: '秦始皇统一文字时推行的字体是',
      desc: '秦统一前，各国文字写法不一样。',
      options: ['小篆', '隶书', '楷书', '甲骨文'],
      answer: 0,
      hint: '秦朝规定的标准字体，笔画圆转匀称。',
      explain: '秦始皇以<b>小篆</b>为标准字体，在全国推行。隶书在秦朝民间也流行，后来在汉代成为通行字体；楷书出现得更晚；甲骨文是商朝的文字。'
    },
    {
      level: 'base',
      title: '下列属于汉武帝在经济方面加强中央集权的措施是',
      desc: '先分清政治、思想、经济各是哪一项。',
      options: ['盐铁官营、统一铸造五铢钱', '颁布推恩令', '罢黜百家，尊崇儒术', '派卫青、霍去病北击匈奴'],
      answer: 0,
      hint: '“钱”和“盐铁”跟什么方面有关？',
      explain: '<b>盐铁官营、统一铸造五铢钱</b>属于经济方面；推恩令是政治方面，削弱诸侯王；罢黜百家尊崇儒术是思想方面；北击匈奴是军事方面。'
    },
    {
      level: 'mid',
      title: '看看郡县制“传到第三代”',
      desc: '在“分封制和郡县制”里切换到<b>郡县制</b>，再按“传到第三代会怎样”，看地方还听不听中央的。',
      label: '在制度对比图里操作',
      button: '检查',
      check: function () {
        if (sysT !== 'jun') return { ok: false, msg: '先切换到“郡县制（秦）”。' };
        if (!gen) return { ok: false, msg: '再按一下“传到第三代会怎样”。' };
        return { ok: true, msg: '郡县制下官员由皇帝任免、不能世袭，几代以后地方仍然听中央的，加强了中央集权。分封制传几代后诸侯就不听天子了。' };
      }
    },
    {
      level: 'mid',
      title: '沿丝绸之路走到“大秦”',
      desc: '按“从长安出发”一站站往西走，走到终点欧洲（大秦）。',
      label: '在丝绸之路示意图里操作',
      button: '检查我走到哪了',
      check: function () {
        if (stop === STOPS.length - 1) return { ok: true, msg: '长安 → 河西走廊 → 敦煌 → 西域 → 中亚 → 西亚 → 欧洲（大秦）。丝绸之路是古代东西方交流的大通道。' };
        return { ok: false, msg: '现在在“' + STOPS[stop].n + '”，还要继续往西走。' };
      }
    },
    {
      level: 'mid',
      title: '新疆地区正式归中央政权管辖，标志是',
      desc: '可以在时间轴上找一找公元前 60 年。',
      options: ['西汉设置西域都护', '张骞第一次出使西域', '班超出使西域', '秦朝修筑长城'],
      answer: 0,
      hint: '“出使”只是交往，“正式管辖”要设置管理机构。',
      explain: '公元前 60 年，西汉设立<b>西域都护</b>，新疆地区从此正式归中央政权管辖。张骞出使和班超出使都是加强联系，不是设置管辖机构。'
    },
    {
      level: 'trap',
      title: '公元前 221 年到公元 220 年，一共经过了多少年？',
      desc: '注意：历史上没有“公元 0 年”。',
      options: ['440 年', '441 年', '1 年', '439 年'],
      answer: 0,
      hint: '跨越公元前后时，两个数相加后要再减 1。',
      explain: '221 + 220 = 441，但没有公元 0 年，所以要减 1，答案是 <b>440 年</b>。只要跨过公元元年，就要记得减 1。'
    },
    {
      level: 'trap',
      title: '关于造纸术，下列说法正确的是',
      desc: '这是这一课最常见的坑。',
      options: ['西汉已经有纸，东汉蔡伦改进了造纸术', '造纸术是蔡伦发明的', '造纸术是秦朝发明的', '蔡伦是西汉人'],
      answer: 0,
      hint: '考古发现了西汉时期的纸。',
      explain: '考古发现<b>西汉已经有纸</b>，东汉的蔡伦是<b>改进</b>了造纸术，用树皮、麻头、破布、旧渔网造纸，纸更便宜好用，逐渐普及。说“蔡伦发明造纸术”是错的。'
    }
  ]);
})();
