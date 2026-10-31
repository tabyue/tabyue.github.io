/* 历史互动馆 · 第 20 课 资本主义制度的初步确立 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();
  var NOW = 2026;
  var INK = '#4a3a32', MUTE = '#8a7a70', RED = '#a4492b', BROWN = '#7d4d3c', BG = '#fbf6ef';
  var CN = { en: '英国', us: '美国', fr: '法国' };
  var COLOR = { en: '#7d4d3c', us: '#3f6a78', fr: '#a4492b' };

  /* ========== 时间轴 ========== */
  var EVENTS = [
    { id: 'e1640', c: 'en', y: 1640, label: '英国革命开始', note: '国王查理一世为筹集军费重新召开议会，议会和国王的矛盾激化，英国资产阶级革命开始。' },
    { id: 'e1649', c: 'en', y: 1649, label: '处死查理一世', note: '英国国王查理一世被处死，英国宣布成立共和国。' },
    { id: 'e1688', c: 'en', y: 1688, label: '光荣革命', note: '议会迎请荷兰执政威廉到英国，赶走了国王詹姆士二世。这次政变几乎没有流血，史称“光荣革命”。' },
    { id: 'e1689', c: 'en', y: 1689, label: '《权利法案》', note: '议会通过《权利法案》，限制国王权力，成为君主立宪制的法律基础。' },
    { id: 'e1775', c: 'us', y: 1775, label: '莱克星顿枪声', note: '北美民兵在莱克星顿打响反抗英军的第一枪，独立战争开始。' },
    { id: 'e1776', c: 'us', y: 1776, label: '《独立宣言》', note: '大陆会议通过《独立宣言》，宣告美利坚合众国诞生。' },
    { id: 'e1783', c: 'us', y: 1783, label: '英国承认独立', note: '英国被迫承认美国独立，独立战争结束。' },
    { id: 'e1787', c: 'us', y: 1787, label: '美国宪法', note: '制定 1787 年宪法，确立联邦制和三权分立。' },
    { id: 'e1789', c: 'fr', y: 1789, label: '攻占巴士底狱', note: '巴黎人民攻占巴士底狱，法国大革命爆发。同年通过《人权宣言》。' },
    { id: 'e1792', c: 'fr', y: 1792, label: '第一共和国', note: '法兰西第一共和国成立。' },
    { id: 'e1804', c: 'fr', y: 1804, label: '拿破仑称帝', note: '拿破仑建立法兰西第一帝国，同年颁布《拿破仑法典》。' },
    { id: 'e1815', c: 'fr', y: 1815, label: '滑铁卢战败', note: '拿破仑在滑铁卢战败，帝国彻底崩溃。' }
  ];
  var ERAS = [
    { from: 1640, to: 1689, label: '英国', color: '#ead8c6' },
    { from: 1775, to: 1787, label: '', color: '#d5e2e6' },
    { from: 1789, to: 1815, label: '法国', color: '#f0d9cc' }
  ];
  var year = Math.round(L.num(st.y, 1689, 1640, 1815));
  var filter = CN[st.c] ? st.c : 'all';
  var tl = L.$('#tl'), yIn = L.$('#year-in');

  function nearest(y) {
    var best = null;
    EVENTS.forEach(function (e) { if (Math.abs(e.y - y) <= 2 && (!best || Math.abs(e.y - y) < Math.abs(best.y - y))) best = e; });
    return best;
  }
  function phase(y) {
    if (y <= 1689) return '英国革命时期';
    if (y < 1775) return '革命间歇';
    if (y <= 1787) return '美国独立时期';
    if (y < 1789) return '美国制宪之后';
    return '法国大革命与帝国';
  }
  function drawTL() {
    var ev = nearest(year);
    var ax = L.timeline(tl, {
      from: 1640, to: 1815, step: 25,
      era: ERAS,
      events: EVENTS.filter(function (e) { return filter === 'all' || e.c === filter; }).map(function (e) {
        var on = ev && ev.id === e.id;
        return { id: e.id, y: e.y, label: e.label, on: on, color: COLOR[e.c] };
      }),
      pick: function (id) {
        var e = EVENTS.filter(function (x) { return x.id === id; })[0];
        setYear(e.y);
        setCmp(e.c);
      }
    });
    /* 文字放到引线之上，游标放到事件之下，三国事件挤在一起时也读得清 */
    L.$$('text', ax.layer).forEach(function (t) { ax.layer.appendChild(t); });
    var x = ax.X(year);
    S('text', { x: ax.X(1781), y: ax.base + 45, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 600, fill: '#2e5361', text: '美国' }, tl);
    tl.insertBefore(S('line', { x1: x, y1: 8, x2: x, y2: ax.base + 50, stroke: '#c2603f', 'stroke-width': 1.6, 'stroke-dasharray': '4 3' }), ax.layer);
    S('path', { d: 'M' + (x - 6) + ' 4h12l-6 8z', fill: '#c2603f' }, tl);
  }
  function setYear(y) {
    year = y;
    yIn.value = y; L.paintRange(yIn);
    renderTL();
  }
  function renderTL() {
    drawTL();
    var ev = nearest(year);
    L.$('#year-out').textContent = L.yr(year);
    L.$('#tl-badge').textContent = ev ? CN[ev.c] : phase(year);
    L.$('#r-cent').textContent = L.century(year);
    L.$('#r-ago').innerHTML = L.span(year, NOW) + '<small>年前</small>';
    L.$('#r-event').textContent = ev ? (ev.y === year ? '' : '约 ' + L.yr(ev.y) + '：') + ev.label : '这几年没有课本里的大事';
    var t;
    if (ev) t = ev.note;
    else if (year < 1689) t = '英国革命还在进行，国王和议会之间的斗争反反复复。';
    else if (year < 1775) t = '英国已是君主立宪制，北美十三个殖民地的经济慢慢发展起来，和英国的矛盾越来越大。';
    else if (year < 1789) t = '北美人民正在为独立而战，或者忙着建立新的国家。';
    else t = '法国的政体一变再变：从君主制到共和国，再到拿破仑帝国。';
    L.$('#r-text').textContent = t;
    save();
  }
  L.bindRange(yIn, function (v) { year = v; renderTL(); });
  yIn.value = year; L.paintRange(yIn);
  L.chips(L.$('#tl-chips'), [{ label: '全部', value: 'all' }, { label: '英国', value: 'en' }, { label: '美国', value: 'us' }, { label: '法国', value: 'fr' }], filter, function (v) {
    filter = v;
    if (v !== 'all') setCmp(v);
    renderTL();
  });

  /* ========== 三国对比器 ========== */
  var PATHS = {
    en: {
      regime: '君主立宪制',
      steps: [['1640', '革命开始'], ['1688', '光荣革命'], ['1689', '《权利法案》', 'doc'], ['结果', '君主立宪制', 'end']],
      t: '英国走的是妥协的路：国王保留下来，但权力被法律限制，真正的权力逐渐转到议会手里。'
    },
    us: {
      regime: '联邦制共和国',
      steps: [['1775', '莱克星顿枪声'], ['1776', '《独立宣言》', 'doc'], ['1783', '英国承认独立'], ['1787', '宪法', 'doc'], ['结果', '联邦制·三权分立', 'end']],
      t: '美国先打赢了摆脱英国的独立战争，再用 1787 年宪法把各州联合起来。总统由选举产生，国家没有国王。'
    },
    fr: {
      regime: '共和国 → 帝国',
      steps: [['1789', '攻占巴士底狱'], ['1789', '《人权宣言》', 'doc'], ['1792', '第一共和国', 'end'], ['1804', '拿破仑帝国', 'end'], ['1804', '《拿破仑法典》', 'doc']],
      t: '法国的路最曲折：推翻君主专制，建立共和国，后来拿破仑又称帝。不过《人权宣言》的原则和《拿破仑法典》巩固了革命成果。'
    }
  };
  var cmpC = PATHS[st.m] ? st.m : 'en';
  var cmpSvg = L.$('#cmp');
  function drawCmp() {
    cmpSvg.innerHTML = '';
    S('rect', { x: 0, y: 0, width: 400, height: 236, rx: 14, fill: BG }, cmpSvg);
    var p = PATHS[cmpC], n = p.steps.length, c = COLOR[cmpC];
    var top = 20, h = 30, gap = n === 4 ? 16 : 10, stepH = h + gap, x0 = 76, w = 300;
    p.steps.forEach(function (s, i) {
      var y = top + i * stepH, kind = s[2];
      if (i < n - 1) L.arrow(cmpSvg, x0 + w / 2, y + h + 1, x0 + w / 2, y + stepH - 1, { color: '#b9a89c', width: 1.6, head: 6 });
      S('text', { x: 64, y: y + 20, 'text-anchor': 'end', 'font-size': 12, 'font-weight': 700, fill: MUTE, text: s[0] === '结果' ? '结果' : s[0] + ' 年' }, cmpSvg);
      S('rect', { x: x0, y: y, width: w, height: h, rx: 8, fill: kind === 'end' ? c : (kind === 'doc' ? '#f6e4da' : '#fff'), stroke: kind ? c : '#cdb7a8', 'stroke-width': kind ? 1.8 : 1.3 }, cmpSvg);
      S('text', { x: x0 + w / 2, y: y + 20, 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': kind ? 700 : 500, fill: kind === 'end' ? '#fff' : (kind === 'doc' ? RED : INK), text: s[1] }, cmpSvg);
    });
    S('text', { x: 390, y: 229, 'text-anchor': 'end', 'font-size': 10, fill: MUTE, text: '红字是文献，深色块是政治制度' }, cmpSvg);
  }
  function renderCmp() {
    var p = PATHS[cmpC];
    L.$('#cmp-name').textContent = CN[cmpC];
    L.$('#cmp-badge').textContent = p.regime;
    L.$('#cmp-text').textContent = p.t;
    L.$$('#cmp-table tbody tr').forEach(function (tr) { tr.classList.toggle('on', tr.dataset.c === cmpC); });
    drawCmp();
    save();
  }
  var cmpChips = L.chips(L.$('#cmp-chips'), [{ label: '英国', value: 'en' }, { label: '美国', value: 'us' }, { label: '法国', value: 'fr' }], cmpC, function (v) { cmpC = v; renderCmp(); });
  function setCmp(v) { cmpC = v; cmpChips.set(v); renderCmp(); }

  /* ========== 《权利法案》滑块（条形长短为示意） ========== */
  var POWERS = [
    { k: '自己制定、废止法律', q: '法律要议会同意', t: '国王不能再自己立法、废法或中止法律，必须经过议会同意。' },
    { k: '自己决定征税', q: '征税要议会同意', t: '钱袋子也被管住了：没有议会同意，国王不能征税。' },
    { k: '自己决定养常备军', q: '常备军要议会同意', t: '和平时期，没有议会同意，国王不能维持常备军。枪杆子也受到了约束。' },
    { k: '干预议员选举和言论', q: '议员选举、言论自由', t: '议员的选举应该是自由的，议员在议会里的言论也受到保护，国王不能随意干预。' }
  ];
  var pow = Math.round(L.num(st.p, 0, 0, 4));
  var pSvg = L.$('#pow'), pIn = L.$('#pow-in');
  function drawPow() {
    pSvg.innerHTML = '';
    S('rect', { x: 0, y: 0, width: 400, height: 216, rx: 14, fill: BG }, pSvg);
    S('text', { x: 100, y: 20, 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: BROWN, text: '国王自己说了算' }, pSvg);
    S('text', { x: 300, y: 20, 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 700, fill: '#3f6a78', text: '由法律和议会约束' }, pSvg);
    POWERS.forEach(function (it, i) {
      var y = 30 + i * 34, moved = i < pow, latest = i === pow - 1;
      S('rect', { x: 14, y: y, width: 172, height: 28, rx: 8, fill: moved ? 'none' : '#fff', stroke: moved ? '#e3d8ce' : BROWN, 'stroke-width': moved ? 1 : 1.5, 'stroke-dasharray': moved ? '4 4' : null }, pSvg);
      S('rect', { x: 214, y: y, width: 172, height: 28, rx: 8, fill: moved ? (latest ? '#d5e2e6' : '#eaf1f3') : 'none', stroke: moved ? '#3f6a78' : '#e3d8ce', 'stroke-width': moved ? 1.5 : 1, 'stroke-dasharray': moved ? null : '4 4' }, pSvg);
      if (moved) {
        S('text', { x: 300, y: y + 18.5, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': latest ? 700 : 500, fill: '#2e5361', text: it.q }, pSvg);
        L.arrow(pSvg, 188, y + 14, 212, y + 14, { color: latest ? RED : '#b9c9ce', width: 1.8, head: 7 });
      } else {
        S('text', { x: 100, y: y + 18.5, 'text-anchor': 'middle', 'font-size': 12, fill: INK, text: it.k }, pSvg);
      }
    });
    /* 示意条：国王始终保留一截，表示王位还在 */
    var kw = 260 - pow * 50, pw = 60 + pow * 50;
    S('text', { x: 14, y: 182, 'font-size': 11.5, fill: BROWN, 'font-weight': 700, text: '国王' }, pSvg);
    S('rect', { x: 50, y: 172, width: kw, height: 12, rx: 6, fill: '#b98a72' }, pSvg);
    S('text', { x: 14, y: 203, 'font-size': 11.5, fill: '#3f6a78', 'font-weight': 700, text: '议会' }, pSvg);
    S('rect', { x: 50, y: 193, width: pw, height: 12, rx: 6, fill: '#7fa3af' }, pSvg);
    S('text', { x: 386, y: 182, 'text-anchor': 'end', 'font-size': 10, fill: MUTE, text: '示意，非数据' }, pSvg);
  }
  function renderPow() {
    L.$('#pow-out').textContent = pow + ' 条';
    L.$('#pow-name').textContent = pow === 0 ? '《权利法案》之前' : (pow === 4 ? '《权利法案》之后' : '拆开看第 ' + pow + ' 条');
    L.$('#pow-badge').textContent = pow === 0 ? '国王专断' : (pow === 4 ? '君主立宪制' : '权力受限中');
    L.$('#pow-king').innerHTML = (4 - pow) + '<small>件</small>';
    L.$('#pow-text').textContent = pow === 0
      ? '这四件大事，国王都想自己决定。向右拖动滑块，看《权利法案》怎么约束他。'
      : (pow === 4
        ? '这四件事国王都不能独断了，可是王位还在。国王的权力受到法律限制，议会成为权力的中心，君主立宪制逐步确立。'
        : POWERS[pow - 1].t + ' 这些规定是 1689 年一起通过的，这里只是拆开来看。');
    drawPow();
    save();
  }
  L.bindRange(pIn, function (v) { pow = v; renderPow(); });
  pIn.value = pow; L.paintRange(pIn);

  function save() { L.setState({ y: year, c: filter === 'all' ? '' : filter, m: cmpC, p: pow }); }

  renderTL();
  renderCmp();
  renderPow();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '把年份调到《权利法案》通过的那一年',
      desc: '拖动时间轴下面的滑块，或者直接点事件。',
      label: '在时间轴里操作',
      button: '检查年份',
      check: function () {
        if (year === 1689) return { ok: true, msg: '1689 年，属于 17 世纪，距今 ' + L.span(1689, NOW) + ' 年。它紧接在 1688 年“光荣革命”之后。' };
        if (year === 1688) return { ok: false, msg: '1688 年是“光荣革命”，《权利法案》还要再晚一年。' };
        return { ok: false, msg: '现在是' + L.yr(year) + '。《权利法案》是英国的文献，往时间轴左边找。' };
      }
    },
    {
      level: 'base',
      title: '法国大革命爆发的标志是',
      desc: '可以在时间轴上找一找 1789 年。',
      options: ['巴黎人民攻占巴士底狱', '莱克星顿的枪声', '“光荣革命”', '拿破仑称帝'],
      answer: 0,
      hint: '巴士底狱在巴黎，曾是君主专制的象征。',
      explain: '1789 年<b>攻占巴士底狱</b>标志法国大革命爆发。莱克星顿枪声是美国独立战争的开始；“光荣革命”发生在英国；拿破仑称帝是 1804 年。'
    },
    {
      level: 'base',
      title: '为英国君主立宪制奠定法律基础的文献是',
      desc: '先想哪个国家是君主立宪制，再想它的文献。',
      options: ['《权利法案》', '《独立宣言》', '《人权宣言》', '《拿破仑法典》'],
      answer: 0,
      hint: '这份文献 1689 年由英国议会通过。',
      explain: '<b>《权利法案》</b>限制了国王权力，是君主立宪制的法律基础。《独立宣言》是美国的；《人权宣言》和《拿破仑法典》都是法国的。'
    },
    {
      level: 'mid',
      title: '把《权利法案》的规定全部落实',
      desc: '把“国王的权力”滑块拖到最右边，看国王还能自己决定几件事。',
      label: '在王权滑块里操作',
      button: '检查滑块',
      check: function () {
        if (pow === 4) return { ok: true, msg: '这四件事国王都不能独断了，但王位还在。这正是“留下国王，用法律管住国王”。' };
        return { ok: false, msg: '现在只落实了 ' + pow + ' 条，继续向右拖。' };
      }
    },
    {
      level: 'mid',
      title: '找出确立联邦制和三权分立的国家',
      desc: '在“三国革命对比器”里选中它，看表格哪一行高亮。',
      label: '在对比器里操作',
      button: '检查我选的国家',
      check: function () {
        if (cmpC === 'us') return { ok: true, msg: '美国 1787 年宪法确立了联邦制和三权分立，立法、行政、司法分别由国会、总统、最高法院掌握。' };
        if (cmpC === 'en') return { ok: false, msg: '英国确立的是君主立宪制，换一个国家试试。' };
        return { ok: false, msg: '法国的主要文献是《人权宣言》和《拿破仑法典》，换一个国家试试。' };
      }
    },
    {
      level: 'mid',
      title: '下列文献与国家的对应，全部正确的是',
      desc: '三份文献分别属于三个国家。',
      options: ['《权利法案》—英国，《独立宣言》—美国，《人权宣言》—法国', '《权利法案》—美国，《独立宣言》—英国，《人权宣言》—法国', '《权利法案》—英国，《独立宣言》—法国，《人权宣言》—美国', '《权利法案》—法国，《独立宣言》—美国，《人权宣言》—英国'],
      answer: 0,
      hint: '“独立”是摆脱英国统治，所以它属于谁？',
      explain: '<b>《权利法案》是英国的，《独立宣言》是美国的，《人权宣言》是法国的</b>。其余三项都把至少两份文献的国家配错了。'
    },
    {
      level: 'trap',
      title: '美利坚合众国诞生的标志是',
      desc: '这几件事都和美国有关，年份也很接近。',
      options: ['1776 年《独立宣言》发表', '1775 年莱克星顿枪声', '1783 年英国承认美国独立', '1787 年宪法制定'],
      answer: 0,
      hint: '问的是“诞生”，也就是谁宣告成立了一个新国家。',
      explain: '<b>1776 年《独立宣言》</b>宣告美国诞生。1775 年是独立战争开始；1783 年是英国承认独立；1787 年是制定宪法，确立联邦制。'
    },
    {
      level: 'trap',
      title: '关于《权利法案》之后的英国，说法正确的是',
      desc: '别因为“革命”两个字就以为国王没了。',
      options: ['国王依然存在，但权力受到法律限制', '废除了国王，建立了共和国', '国王的权力比以前更大了', '确立了三权分立的总统制'],
      answer: 0,
      hint: '回到王权滑块，拖到最右边，看“国王还在吗”。',
      explain: '英国<b>保留国王</b>，用法律限制王权，这就是君主立宪制。1649 年曾短暂成立共和国，但《权利法案》时已经有国王了；三权分立和总统制是美国的。'
    }
  ]);
})();
