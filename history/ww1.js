/* 历史互动馆 · 第 24 课 第一次世界大战和战后初期的世界 */
(function () {
  'use strict';
  var L = window.Lab, S = L.svg;
  var st = L.getState();
  var NOW = 2026;
  var CP = '#a4492b', EP = '#2f6470';   // 同盟国赭红，协约国青色

  /* ========== 按月时间轴 ========== */
  /* 滑块值 m：0 = 1913 年 1 月，131 = 1923 年 12 月 */
  function idx(y, mo) { return (y - 1913) * 12 + (mo - 1); }
  function ymOf(m) { return { y: 1913 + Math.floor(m / 12), mo: m % 12 + 1 }; }
  function fy(y, mo) { return y + (mo - 0.5) / 12; }   // 画在时间轴上的位置
  var EVENTS = [
    { id: 'sara', y: 1914, mo: 6, label: '萨拉热窝事件', show: '1914 年 6 月 28 日', note: '奥匈帝国皇位继承人斐迪南大公在萨拉热窝被塞尔维亚青年刺杀，这是一战的<b>导火线</b>。' },
    { id: 'war', y: 1914, mo: 7, label: '一战爆发', show: '1914 年 7 月 28 日', note: '奥匈帝国对塞尔维亚宣战，德、俄、法、英等国相继卷入，第一次世界大战爆发。' },
    { id: 'ita', y: 1915, mo: 5, label: '意大利参战', note: '原属三国同盟的意大利，转到协约国一方作战。' },
    { id: 'verdun', y: 1916, mo: 2, label: '凡尔登战役', show: '1916 年 2 月起', note: '德军进攻法国要塞凡尔登，双方伤亡惨重，被称为“凡尔登绞肉机”。' },
    { id: 'usa', y: 1917, mo: 4, label: '美国参战', note: '美国加入协约国一方，协约国力量大增。' },
    { id: 'oct', y: 1917, mo: 11, label: '十月革命', show: '1917 年 11 月 7 日', note: '俄历 10 月 25 日，列宁领导彼得格勒武装起义，建立了世界上第一个社会主义国家。' },
    { id: 'end', y: 1918, mo: 11, label: '一战结束', note: '德国投降，协约国获胜，第一次世界大战结束。' },
    { id: 'paris', y: 1919, mo: 1, label: '巴黎和会', note: '战胜国在巴黎召开和会，6 月签订对德和约《凡尔赛条约》。中国收回山东权益的要求被拒绝。' },
    { id: 'may4', y: 1919, mo: 5, label: '五四运动', show: '1919 年 5 月 4 日', note: '巴黎和会上中国外交失败的消息传回，北京学生集会游行，五四运动爆发。' },
    { id: 'nep', y: 1921, mo: 3, label: '新经济政策', note: '苏俄改行新经济政策，以粮食税代替余粮收集制。' },
    { id: 'wash', y: 1921, mo: 11, label: '华盛顿会议', show: '1921 年 11 月—1922 年 2 月', note: '美、英、法、日、中等九国参加，签订《九国公约》。' },
    { id: 'ussr', y: 1922, mo: 12, label: '苏联成立', show: '1922 年 12 月', note: '俄罗斯、乌克兰、白俄罗斯、外高加索联邦等联合成立苏维埃社会主义共和国联盟。' }
  ];
  EVENTS.forEach(function (e) { e.m = idx(e.y, e.mo); });
  var WAR0 = idx(1914, 7), WAR1 = idx(1918, 11);
  var month = Math.round(L.num(st.m, idx(1919, 5), 0, 131));
  var tl = L.$('#tl'), mIn = L.$('#month-in');

  function nearest(m) {
    var best = null;
    EVENTS.forEach(function (e) { if (Math.abs(e.m - m) <= 2 && (!best || Math.abs(e.m - m) < Math.abs(best.m - m))) best = e; });
    return best;
  }
  function mtext(m) { var t = ymOf(m); return t.y + ' 年 ' + t.mo + ' 月'; }
  function decade(y) { var r = y % 100; return L.century(y) + ' ' + Math.floor(r / 10) * 10 + ' 年代'; }
  function drawTL() {
    var ev = nearest(month);
    var ax = L.timeline(tl, {
      from: 1913, to: 1924, step: 1,
      era: [
        { from: 1913, to: fy(1914, 7.9), label: '战前', color: '#efe7df' },
        { from: fy(1914, 7.9), to: fy(1918, 11.4), label: '第一次世界大战', color: '#ecd3c6' },
        { from: fy(1918, 11.4), to: 1924, label: '战后初期', color: '#dce8e8' }
      ],
      events: EVENTS.map(function (e) {
        var on = ev && ev.id === e.id;
        return { id: e.id, y: fy(e.y, e.mo), label: e.label, on: on, color: on ? '#a4492b' : '#7d4d3c' };
      }),
      pick: function (id) { setMonth(EVENTS.filter(function (x) { return x.id === id; })[0].m); }
    });
    var t = ymOf(month), x = ax.X(fy(t.y, t.mo));
    tl.insertBefore(S('line', { x1: x, y1: 8, x2: x, y2: ax.base + 50, stroke: '#c2603f', 'stroke-width': 1.6, 'stroke-dasharray': '4 3' }), ax.layer);
    S('path', { d: 'M' + (x - 6) + ' 4h12l-6 8z', fill: '#c2603f' }, tl);
  }
  function setMonth(m) { month = m; mIn.value = month; L.paintRange(mIn); render(); }
  function render() {
    drawTL();
    var ev = nearest(month), t = ymOf(month);
    L.$('#month-out').textContent = mtext(month);
    L.$('#ph-badge').textContent = month < WAR0 ? '一战爆发前' : (month <= WAR1 ? '第一次世界大战中' : '战后初期');
    L.$('#r-dec').textContent = decade(t.y);
    L.$('#r-ago').innerHTML = L.span(t.y, NOW) + '<small>年前</small>';
    L.$('#r-ev').textContent = ev ? (ev.m === month ? '' : (ev.show || ev.y + ' 年 ' + ev.mo + ' 月') + '：') + ev.label : '这几个月没有课本里的大事';
    var s = ev ? ev.note + ' ' : '';
    if (month < WAR0) s += '大战还没爆发，但三国同盟和三国协约已经对峙多年，双方都在扩军备战。';
    else if (month <= WAR1) s += '这是大战爆发后的第 <b>' + (month - WAR0 + 1) + '</b> 个月。一战从 1914 年打到 1918 年，前后四年多。';
    else if (month <= idx(1922, 2)) s += '大战结束了，战胜国通过巴黎和会和华盛顿会议重新安排世界，形成<b>凡尔赛—华盛顿体系</b>。';
    else s += '凡尔赛—华盛顿体系已经形成，战胜国之间暂时稳定下来，但矛盾并没有消失。';
    L.$('#r-text').innerHTML = s;
    L.$('#row-start').classList.toggle('on', month >= idx(1914, 6) && month <= idx(1914, 12));
    L.$('#row-turn').classList.toggle('on', t.y === 1917);
    L.$('#row-end').classList.toggle('on', t.y === 1918);
    L.$('#row-after').classList.toggle('on', month >= idx(1919, 1) && month <= idx(1922, 2));
    save();
  }
  L.bindRange(mIn, function (v) { month = v; render(); });
  mIn.value = month; L.paintRange(mIn);

  /* ========== 两大军事集团关系图 ========== */
  var STAGES = {
    pre: { name: '1914 年以前', badge: '结成两大集团', cp: '德、奥匈、意（三国同盟）', ep: '英、法、俄（三国协约）', mid: ['双方扩军备战', '欧洲分成两大阵营'],
      text: '1882 年德、奥匈、意结成<b>三国同盟</b>；1907 年英、法、俄形成<b>三国协约</b>。两大军事集团拼命扩军备战，欧洲笼罩在战争阴云下。' },
    war: { name: '1914 年', badge: '大战爆发', cp: '德、奥匈等', ep: '英、法、俄等', mid: ['萨拉热窝事件', '→ 大战爆发'],
      text: '萨拉热窝事件后，奥匈帝国对塞尔维亚宣战，德国站在奥匈一边，俄、法、英相继参战。打仗的两方叫<b>同盟国</b>和<b>协约国</b>。意大利这时宣布中立，没有跟着德国参战。' },
    ita: { name: '1915 年', badge: '意大利换边', cp: '德、奥匈等', ep: '英、法、俄、意等', mid: ['意大利转到', '协约国一方'],
      text: '意大利虽然是三国同盟的成员，却在 1915 年转到<b>协约国</b>一方作战。所以别把“三国同盟”和一战中的“同盟国”完全画等号。' },
    us: { name: '1917—1918 年', badge: '协约国获胜', cp: '德、奥匈等', ep: '英、法、意、美、中等', mid: ['美国参战', '协约国获胜'],
      text: '1917 年美国参战，协约国力量大增；同年中国也对德宣战。俄国十月革命后，1918 年退出战争。1918 年 11 月德国投降，协约国获胜。' }
  };
  var STAGE_ORDER = ['pre', 'war', 'ita', 'us'];
  var COUNTRY = {
    de: { t: '德国', x: 68, top: true, n: '同盟国的核心。经济发展快，殖民地却少，要求重新瓜分世界，和英国争夺海上霸权。1918 年 11 月德国投降，一战结束。' },
    ah: { t: '奥匈帝国', x: 166, top: true, n: '和俄国争夺巴尔干半岛。1914 年皇位继承人在萨拉热窝被刺，随后对塞尔维亚宣战，大战爆发。' },
    it: { t: '意大利', x: 232, top: true, n: '1882 年和德、奥匈结成三国同盟。大战爆发时宣布中立，1915 年转到协约国一方作战。' },
    uk: { t: '英国', x: 36, n: '老牌殖民大国，殖民地最多。德国要和它争夺海上霸权和殖民地，英德矛盾是最主要的矛盾。' },
    fr: { t: '法国', x: 101, n: '1871 年普法战争失败后，阿尔萨斯和洛林被德国夺走，法国一直想收回，法德矛盾很深。凡尔登战役就发生在法国。' },
    ru: { t: '俄国', x: 166, n: '和奥匈帝国争夺巴尔干，支持塞尔维亚。1917 年十月革命后，新生的苏维埃政权在 1918 年退出了战争。' },
    us: { t: '美国', x: 298, n: '大战初期没有参战，1917 年 4 月加入协约国一方，协约国力量大增。战后在巴黎和会、华盛顿会议上都很有分量。' },
    cn: { t: '中国', x: 364, n: '1917 年 8 月对德国、奥匈宣战，站在协约国一方，还派出大批华工到欧洲做后勤工作。所以战后中国是战胜国，参加了巴黎和会。' }
  };
  var CONF = {
    ud: { a: 'de', b: 'uk', t: '英德矛盾', n: '德国要和英国争夺<b>海上霸权和殖民地</b>，这是帝国主义国家之间<b>最主要的矛盾</b>。' },
    fd: { a: 'de', b: 'fr', t: '法德矛盾', n: '普法战争后德国夺走了法国的<b>阿尔萨斯和洛林</b>，法国一直想收回失地。' },
    ra: { a: 'ah', b: 'ru', t: '俄奥矛盾', n: '俄国和奥匈帝国都想控制<b>巴尔干半岛</b>，那里民族矛盾复杂，被称为“欧洲火药桶”。' }
  };
  var stage = STAGES[st.s] ? st.s : 'pre';
  var conf = st.cf === '1';
  var alSel = (COUNTRY[st.a] || CONF[st.a]) ? st.a : '';
  var itPos = stage === 'ita' || stage === 'us' ? 1 : 0, itAnim = null;
  var al = L.$('#al'), TOPY = 56, BOTY = 196, BW = 60, BH = 34;
  function visible(id) { return (id !== 'us' && id !== 'cn') || stage === 'us'; }
  function posOf(id) {
    var c = COUNTRY[id];
    if (id === 'it') return { x: c.x, y: L.lerp(TOPY, BOTY, itPos) };
    return { x: c.x, y: c.top ? TOPY : BOTY };
  }
  function subOf(id) {
    if (id === 'it') return stage === 'pre' ? '三国同盟' : (stage === 'war' ? '宣布中立' : '1915 年参战');
    if (id === 'ru') return stage === 'us' ? '1918 年退出' : (stage === 'pre' ? '三国协约' : '协约国');
    if (id === 'us' || id === 'cn') return '1917 年参战';
    if (id === 'de') return '同盟核心';
    if (id === 'ah') return stage === 'pre' ? '三国同盟' : '同盟国';
    return stage === 'pre' ? '三国协约' : '协约国';
  }
  function select(id) { alSel = alSel === id ? '' : id; drawAL(); }
  function hitBind(el, id, label) {
    el.setAttribute('class', 'svg-hit'); el.setAttribute('tabindex', '0'); el.setAttribute('role', 'button'); el.setAttribute('aria-label', label);
    el.addEventListener('click', function () { select(id); });
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(id); } });
  }
  function drawAL() {
    al.innerHTML = '';
    var d = S('defs', {}, al), cp = S('clipPath', { id: 'al-clip' }, d);
    S('rect', { x: 0, y: 0, width: 400, height: 240, rx: 14 }, cp);
    var g = S('g', { 'clip-path': 'url(#al-clip)' }, al);
    S('rect', { x: 0, y: 0, width: 400, height: 240, fill: '#fbf8f5' }, g);
    S('rect', { x: 2, y: 6, width: 396, height: 86, rx: 12, fill: '#f8ebe4', stroke: '#e6c4b4' }, g);
    S('rect', { x: 2, y: 154, width: 396, height: 82, rx: 12, fill: '#e8f1f1', stroke: '#bcd5d6' }, g);
    var pre = stage === 'pre';
    S('text', { x: 14, y: 22, 'font-size': 11.5, 'font-weight': 700, fill: CP, text: pre ? '三国同盟（1882 年）' : '同盟国一方' }, g);
    S('text', { x: 14, y: 230, 'font-size': 11.5, 'font-weight': 700, fill: EP, text: pre ? '三国协约（1907 年形成）' : '协约国一方' }, g);
    // 三对主要矛盾
    if (conf) {
      Object.keys(CONF).forEach(function (k) {
        var c = CONF[k], a = posOf(c.a), b = posOf(c.b), on = alSel === k, main = k === 'ud';
        var y1 = a.y + BH / 2, y2 = b.y - BH / 2;
        var hg = S('g', {}, g);
        S('line', { x1: a.x, y1: y1, x2: b.x, y2: y2, stroke: 'transparent', 'stroke-width': 14 }, hg);
        S('line', { x1: a.x, y1: y1, x2: b.x, y2: y2, stroke: '#c0392b', 'stroke-width': on ? 3.2 : (main ? 2.6 : 1.8), 'stroke-dasharray': '6 4' }, hg);
        var ly = 126, lx = a.x + (b.x - a.x) * (ly - y1) / (y2 - y1), left = b.x < a.x;
        S('text', { x: lx + (left ? -6 : 6), y: ly + 4, 'text-anchor': left ? 'end' : 'start', 'font-size': 11, 'font-weight': on || main ? 700 : 600, fill: '#b03a2a', text: c.t, stroke: '#fbf8f5', 'stroke-width': 3, 'paint-order': 'stroke' }, hg);
        hitBind(hg, k, c.t);
      });
    }
    // 中间的阶段提示
    var mid = STAGES[stage].mid;
    S('text', { x: 336, y: 118, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: '#7d4d3c', text: mid[0] }, g);
    S('text', { x: 336, y: 134, 'text-anchor': 'middle', 'font-size': 11, fill: '#7d4d3c', text: mid[1] }, g);
    // 意大利换边的路线
    if (!pre && stage !== 'war') S('path', { d: 'M232 ' + (TOPY + BH / 2) + 'V' + (BOTY - BH / 2), stroke: '#c9a26d', 'stroke-width': 1.4, 'stroke-dasharray': '3 3', fill: 'none' }, g);
    Object.keys(COUNTRY).forEach(function (id) {
      if (!visible(id)) return;
      var p = posOf(id), on = alSel === id, inEP = id === 'it' ? itPos > 0.5 : !COUNTRY[id].top;
      var quit = id === 'ru' && stage === 'us', fresh = id === 'us' || id === 'cn' || (id === 'it' && itPos > 0.5);
      var c = inEP ? EP : CP;
      var hg = S('g', { opacity: quit ? 0.55 : 1 }, g);
      S('rect', { x: p.x - BW / 2, y: p.y - BH / 2, width: BW, height: BH, rx: 8, fill: fresh ? '#fff8e6' : '#fff', stroke: on ? c : (fresh ? '#d9b25c' : '#cdbfb5'), 'stroke-width': on ? 2.6 : 1.4, 'stroke-dasharray': quit ? '4 3' : null }, hg);
      S('text', { x: p.x, y: p.y - 1, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: c, text: COUNTRY[id].t }, hg);
      S('text', { x: p.x, y: p.y + 12, 'text-anchor': 'middle', 'font-size': 9.5, fill: '#8a7a70', text: subOf(id) }, hg);
      hitBind(hg, id, COUNTRY[id].t);
    });
    S('text', { x: 392, y: 148, 'text-anchor': 'end', 'font-size': 9.5, fill: '#a0908a', text: '关系示意，不表示地理位置' }, g);
    var S0 = STAGES[stage], sel = COUNTRY[alSel] || CONF[alSel];
    L.$('#al-name').textContent = sel ? sel.t : S0.name;
    L.$('#al-badge').textContent = sel ? (CONF[alSel] ? (alSel === 'ud' ? '最主要的矛盾' : '主要矛盾之一') : S0.name) : S0.badge;
    L.$('#al-cp').textContent = S0.cp;
    L.$('#al-ep').textContent = S0.ep;
    L.$('#al-text').innerHTML = sel ? sel.n : S0.text;
    L.$('#al-conf').textContent = conf ? '收起矛盾连线' : '看三对主要矛盾';
    save();
  }
  function setStage(v) {
    stage = v;
    if (alSel && COUNTRY[alSel] && !visible(alSel)) alSel = '';
    var target = v === 'ita' || v === 'us' ? 1 : 0;
    if (itAnim) { itAnim.stop(); itAnim = null; }
    if (L.REDUCED || itPos === target) { itPos = target; drawAL(); return; }
    itAnim = L.loop(function (dt) {
      itPos = target > itPos ? Math.min(target, itPos + dt * 1.6) : Math.max(target, itPos - dt * 1.6);
      drawAL();
      if (itPos === target) { itAnim = null; return false; }
    });
  }
  L.chips(L.$('#al-chips'), STAGE_ORDER.map(function (k) { return { label: STAGES[k].name, value: k }; }), stage, setStage);
  L.$('#al-conf').addEventListener('click', function () { conf = !conf; if (!conf && CONF[alSel]) alSel = ''; drawAL(); });

  /* ========== 巴黎和会与中国 ========== */
  var PC = [
    { x: 70, y: 50, t: '中国参战', s: '1917 年 · 协约国一方', n: '1917 年 8 月，北洋政府对德国、奥匈宣战，中国站到协约国一方，还派出大批华工到欧洲做后勤工作。' },
    { x: 200, y: 50, t: '以战胜国参会', s: '1919 年 1 月 · 巴黎', n: '1919 年 1 月，战胜国在法国巴黎召开和会。中国以战胜国身份参加，提出收回德国在山东的各项权益等正当要求。' },
    { x: 330, y: 50, t: '山东问题', s: '德国权益转给日本', bad: true, n: '和会被英、法、美三国操纵，不顾中国也是战胜国，决定把德国在山东的权益转让给日本。中国的外交失败了。' },
    { x: 330, y: 160, t: '五四运动', s: '1919 年 5 月 4 日', n: '消息传回国内，1919 年 5 月 4 日北京学生集会游行，喊出“外争主权，内除国贼”的口号，五四运动爆发。' },
    { x: 200, y: 160, t: '拒绝签字', s: '1919 年 6 月', n: '在全国人民的压力下，中国代表最终<b>拒绝在《凡尔赛条约》上签字</b>。' },
    { x: 70, y: 160, t: '华盛顿会议', s: '1921—1922 年', n: '华盛顿会议期间中日签订条约，日本把山东归还中国，但在山东仍保留许多特权。会上签订的《九国公约》，使中国又回到几个帝国主义国家<b>共同支配</b>的局面。' }
  ];
  var pcStep = Math.round(L.num(st.p, 0, 0, PC.length - 1)), pcView = pcStep, pc = L.$('#pc');
  function drawPC() {
    pc.innerHTML = '';
    var d = S('defs', {}, pc), cp = S('clipPath', { id: 'pc-clip' }, d);
    S('rect', { x: 0, y: 0, width: 400, height: 230, rx: 14 }, cp);
    var g = S('g', { 'clip-path': 'url(#pc-clip)' }, pc);
    S('rect', { x: 0, y: 0, width: 400, height: 230, fill: '#fbf8f5' }, g);
    var bw = 112, bh = 50;
    for (var i = 0; i < PC.length - 1; i++) {
      var a = PC[i], b = PC[i + 1], shown = i + 1 <= pcStep, c = shown ? '#7d4d3c' : '#d3c6bc', o = { color: c, width: 1.8, head: 8, dash: shown ? null : '4 4' };
      if (a.y === b.y) { var dir = b.x > a.x ? 1 : -1; L.arrow(g, a.x + dir * bw / 2, a.y, b.x - dir * (bw / 2 + 2), b.y, o); }
      else L.arrow(g, a.x, a.y + bh / 2, b.x, b.y - bh / 2 - 2, o);
    }
    PC.forEach(function (n, i) {
      var shown = i <= pcStep, on = i === pcView;
      var hit = S('g', { class: 'svg-hit', tabindex: shown ? 0 : -1, role: 'button', 'aria-label': shown ? n.t : '还没推到这一步' }, g);
      S('rect', { x: n.x - bw / 2, y: n.y - bh / 2, width: bw, height: bh, rx: 10, fill: !shown ? '#f6f1ec' : (n.bad ? '#fbeee6' : '#fff'), stroke: !shown ? '#d8cbc1' : (on ? '#7d4d3c' : (n.bad ? '#e0b6a6' : '#cdb7a8')), 'stroke-width': on ? 2.4 : 1.4, 'stroke-dasharray': shown ? null : '4 4' }, hit);
      S('text', { x: n.x, y: n.y - 2, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: !shown ? '#b5a79d' : (n.bad ? '#a4492b' : '#4a3a32'), text: shown ? n.t : '？' }, hit);
      if (shown) S('text', { x: n.x, y: n.y + 15, 'text-anchor': 'middle', 'font-size': 10, fill: '#8a7a70', text: n.s }, hit);
      S('text', { x: n.x - bw / 2 + 6, y: n.y - bh / 2 + 12, 'font-size': 9.5, fill: '#a0908a', text: String(i + 1) }, hit);
      function go() { if (i <= pcStep) { pcView = i; drawPC(); } }
      hit.addEventListener('click', go);
      hit.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    S('text', { x: 200, y: 220, 'text-anchor': 'middle', 'font-size': 10, fill: '#a0908a', text: '示意图：箭头表示事情一步步发展' }, g);
    var n = PC[pcView];
    L.$('#pc-text').innerHTML = '<b>第 ' + (pcView + 1) + ' 步 · ' + n.t + '：</b>' + n.n;
    var nx = L.$('#pc-next');
    nx.disabled = pcStep >= PC.length - 1;
    nx.textContent = pcStep >= PC.length - 1 ? '已经推到最后一步' : '下一步';
    save();
  }
  L.$('#pc-next').addEventListener('click', function () { if (pcStep < PC.length - 1) { pcStep++; pcView = pcStep; drawPC(); } });
  L.$('#pc-reset').addEventListener('click', function () { pcStep = 0; pcView = 0; drawPC(); });

  /* ========== 战时共产主义与新经济政策 ========== */
  var SV = {
    wc: { name: '战时共产主义', badge: '1918 年起', grain: '余粮收集制', trade: '取消自由贸易，实物配给', biz: '大中小企业都收归国有',
      text: '国内战争和外国武装干涉时期，苏俄要把粮食集中起来保证前线。农民除了口粮和种子，<b>余粮全部交给国家</b>。它帮苏俄打赢了战争，但战后继续实行，农民很不满。',
      more: '多种出来的粮食也要上交，农民觉得多干也白干，生产积极性下降。' },
    nep: { name: '新经济政策', badge: '1921 年起', grain: '以粮食税代替余粮收集制', trade: '允许自由贸易', biz: '允许多种经济成分并存，私人可经营一些小企业',
      text: '1921 年列宁提出新经济政策。农民交够<b>固定的粮食税</b>后，剩下的归自己，可以拿到市场上卖；还允许多种经济成分并存，国民经济逐渐恢复。',
      more: '多种出来的粮食<b>全归农民自己</b>，这就是“多种多得”，农民积极性大大提高。' }
  };
  var pol = st.v === 'nep' ? 'nep' : 'wc', more = st.mo === '1', sv = L.$('#sv');
  function seg(x, w, fill, label, color, lw) {
    S('rect', { x: x, y: 28, width: w, height: 30, fill: fill, stroke: '#fff', 'stroke-width': 1.5 }, sv);
    if (label) S('text', { x: x + (lw || w) / 2, y: 47.5, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 600, fill: color || '#4a3a32', text: label }, sv);
  }
  function drawSV() {
    sv.innerHTML = '';
    S('rect', { x: 0, y: 0, width: 400, height: 104, rx: 12, fill: '#fbf8f5' }, sv);
    S('text', { x: 16, y: 18, 'font-size': 11, fill: '#7a6a62', text: '一户农民一年收的粮食' + (more ? '（多种了一些）' : '') }, sv);
    var x0 = 16, base = 96, tax = 84, extra = more ? 92 : 0, rest = pol === 'wc' ? 176 : 92;
    seg(x0, base, '#e9dccf', '口粮、种子');
    if (pol === 'wc') {
      seg(x0 + base, 176 + extra, '#d7a08a', '余粮全部上交国家', '#fff', 176);
    } else {
      seg(x0 + base, tax, '#d7a08a', '粮食税', '#fff');
      seg(x0 + base + tax, rest + extra, '#8fb8b0', '归自己，可以卖', '#fff', rest);
    }
    if (more) {
      var ex = x0 + base + 176;
      S('rect', { x: ex, y: 25, width: extra, height: 36, fill: 'none', stroke: '#c2603f', 'stroke-width': 1.6, 'stroke-dasharray': '4 3', rx: 3 }, sv);
      S('text', { x: ex + extra / 2, y: 76, 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 700, fill: pol === 'wc' ? '#a4492b' : '#2f6a4a', text: pol === 'wc' ? '多出来的也上交' : '多出来的归自己' }, sv);
    }
    S('text', { x: 16, y: 96, 'font-size': 9.5, fill: '#a0908a', text: '示意图：长短只表示“谁拿走哪一部分”，不代表具体数量' }, sv);
    var P = SV[pol];
    L.$('#sv-name').textContent = P.name;
    L.$('#sv-badge').textContent = P.badge;
    L.$('#sv-grain').textContent = P.grain;
    L.$('#sv-trade').textContent = P.trade;
    L.$('#sv-biz').textContent = P.biz;
    L.$('#sv-text').innerHTML = P.text + (more ? ' ' + P.more : '');
    L.$('#sv-more').textContent = more ? '回到平常的收成' : '如果农民多种一些';
    save();
  }
  L.chips(L.$('#sv-chips'), [{ label: '战时共产主义', value: 'wc' }, { label: '新经济政策', value: 'nep' }], pol, function (v) { pol = v; drawSV(); });
  L.$('#sv-more').addEventListener('click', function () { more = !more; drawSV(); });

  function save() { L.setState({ m: month, s: stage, cf: conf ? 1 : '', a: alSel, p: pcStep, v: pol, mo: more ? 1 : '' }); }

  render();
  drawAL();
  drawPC();
  drawSV();

  /* ========== 练习 ========== */
  L.quiz([
    {
      level: 'base',
      title: '把时间轴调到十月革命胜利的那个月',
      desc: '拖动时间轴下面的滑块（一格一个月），或者直接点时间轴上的事件。',
      label: '在时间轴里操作',
      button: '检查月份',
      check: function () {
        var t = ymOf(month);
        if (t.y === 1917 && t.mo === 11) return { ok: true, msg: '1917 年 11 月 7 日（俄历 10 月 25 日），列宁领导彼得格勒武装起义，十月革命胜利。同一年 4 月，美国刚刚参战。' };
        if (t.y === 1917 && t.mo === 10) return { ok: false, msg: '叫“十月革命”是因为俄国当时用的旧历是 10 月 25 日，换成公历是 <b>11 月 7 日</b>。再往后拨一个月。' };
        if (t.y !== 1917) return { ok: false, msg: '现在是 ' + mtext(month) + '。十月革命发生在 <b>1917 年</b>，和美国参战是同一年。' };
        return { ok: false, msg: '年份对了，是 1917 年。再找找月份：在美国参战（4 月）之后好几个月。' };
      }
    },
    {
      level: 'base',
      title: '第一次世界大战的导火线是',
      desc: '“导火线”是直接点燃战争的那件事。',
      options: ['萨拉热窝事件', '凡尔登战役', '美国参战', '巴黎和会'],
      answer: 0,
      hint: '发生在 1914 年 6 月，大战爆发之前。',
      explain: '1914 年 6 月奥匈帝国皇位继承人在萨拉热窝被刺，这就是<b>萨拉热窝事件</b>，一个月后大战爆发。凡尔登战役（1916 年）和美国参战（1917 年）发生在战争中，巴黎和会在战后。'
    },
    {
      level: 'base',
      title: '三国协约的成员是',
      desc: '可以在关系图里切到“1914 年以前”看看下面那一队。',
      options: ['英国、法国、俄国', '德国、奥匈帝国、意大利', '英国、法国、美国', '德国、奥匈帝国、俄国'],
      answer: 0,
      hint: '“协约”那一队里有一个老牌殖民大国、一个和德国有世仇的国家，还有一个和奥匈争巴尔干的国家。',
      explain: '<b>三国协约：英、法、俄</b>（1907 年形成）；三国同盟是德、奥匈、意（1882 年）。美国 1917 年才参战，不是三国协约成员；俄国和奥匈是对头，不在一队。'
    },
    {
      level: 'mid',
      title: '看看意大利在一战中实际站在哪一队',
      desc: '在“两大军事集团”关系图里切换阶段，切到意大利真正参战以后，等它移到它实际作战的一方。',
      label: '在关系图里操作',
      button: '检查意大利在哪',
      check: function () {
        if (stage === 'pre') return { ok: false, msg: '1914 年以前，意大利还在三国同盟里。往后切换阶段看看。' };
        if (stage === 'war') return { ok: false, msg: '1914 年大战刚爆发时，意大利宣布中立。再往后切一个阶段。' };
        if (itPos < 1) return { ok: false, msg: '意大利正在移动，等它停下来再检查。' };
        return { ok: true, msg: '意大利原是<b>三国同盟</b>成员，1915 年却转到<b>协约国</b>一方作战。所以“三国同盟”和一战中的“同盟国”不能完全画等号。' };
      }
    },
    {
      level: 'mid',
      title: '让农民“多种多得”',
      desc: '在“苏俄两种经济政策”一栏里，选出能让农民多种多得的那种政策，再按“如果农民多种一些”，看多出来的粮食归谁。',
      label: '在粮食分配图里操作',
      button: '检查',
      check: function () {
        if (pol !== 'nep') return { ok: false, msg: '现在是战时共产主义：多种出来的粮食也要作为余粮上交。换另一种政策试试。' };
        if (!more) return { ok: false, msg: '政策选对了，再按“如果农民多种一些”，看多出来的粮食去了哪里。' };
        return { ok: true, msg: '新经济政策<b>以粮食税代替余粮收集制</b>：交够固定的税，多出来的都归农民，可以拿去卖，所以农民愿意多种，经济逐渐恢复。' };
      }
    },
    {
      level: 'mid',
      title: '五四运动爆发的直接原因是',
      desc: '可以在“巴黎和会与中国”里一步步推一遍。',
      options: ['中国在巴黎和会上外交失败', '萨拉热窝事件', '华盛顿会议签订《九国公约》', '十月革命胜利'],
      answer: 0,
      hint: '五四运动发生在 1919 年 5 月，那时候哪场会议正在开？',
      explain: '巴黎和会拒绝了中国收回山东权益的要求，要把德国在山东的权益转给日本，<b>中国外交失败</b>的消息传回国内，五四运动爆发。萨拉热窝事件是一战导火线；《九国公约》在 1922 年，比五四运动晚；十月革命对中国有影响，但不是五四运动的直接原因。'
    },
    {
      level: 'trap',
      title: '世界上第一个社会主义国家是怎样诞生的',
      desc: '注意区分“诞生”和“联合成立苏联”。',
      options: ['1917 年十月革命胜利', '1922 年苏联成立', '1871 年巴黎公社成立', '1918 年第一次世界大战结束'],
      answer: 0,
      hint: '苏联是后来几个苏维埃共和国联合起来组成的。',
      explain: '<b>1917 年十月革命胜利</b>，建立了世界上第一个社会主义国家（苏维埃俄国）。1922 年是俄罗斯、乌克兰等<b>联合成立苏联</b>，不是第一次诞生；巴黎公社是无产阶级建立政权的第一次尝试，没有成为长期存在的国家；一战结束和这件事无关。'
    },
    {
      level: 'trap',
      title: '下列属于苏俄新经济政策内容的是',
      desc: '这一题专考两种政策别配反。',
      options: ['以粮食税代替余粮收集制', '实行余粮收集制', '取消自由贸易，实行实物配给制', '把大中小企业全部收归国有'],
      answer: 0,
      hint: '新经济政策是 1921 年对战时共产主义的“纠正”。',
      explain: '新经济政策的核心是<b>以粮食税代替余粮收集制</b>，还允许自由贸易和多种经济成分并存。余粮收集制、取消自由贸易和实物配给、企业全部收归国有，都是<b>战时共产主义</b>的内容。'
    }
  ]);
})();
