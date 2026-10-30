/* 第 13 课 · 深圳湾的生态系统 */
(function () {
  'use strict';
  var B = window.Bio, S = B.svg, H = B.html;
  var st = B.getState();

  var SP = {
    mangrove: { n: '红树', x: 70, y: 250, prod: true, note: '秋茄、桐花树等红树植物，能在海水里生长，是红树林的主角。落叶还能被分解者分解。' },
    algae: { n: '藻类', x: 250, y: 250, prod: true, note: '滩涂和海水里的硅藻等藻类，个子小，数量多，也是生产者。' },
    sesarmid: { n: '相手蟹', x: 40, y: 180, note: '专吃红树的落叶和嫩芽，是红树林里的“清道夫”。' },
    fiddler: { n: '招潮蟹', x: 140, y: 180, note: '雄蟹有一只特别大的螯，退潮时在滩涂上刮食藻类。' },
    zoo: { n: '浮游动物', x: 245, y: 180, note: '很小的动物，随水漂流，吃藻类。' },
    mudskipper: { n: '弹涂鱼', x: 345, y: 180, note: '会在泥滩上“跳”的鱼，大弹涂鱼主要刮食滩涂上的藻类。' },
    fish: { n: '小鱼', x: 215, y: 110, note: '吃浮游动物的小鱼，是很多水鸟的食物。' },
    egret: { n: '白鹭', x: 105, y: 40, note: '华南最常见的水鸟之一，深圳一年四季都能见到，吃小鱼、螃蟹。' },
    spoonbill: { n: '黑脸琵鹭', x: 305, y: 40, note: '国家一级保护野生动物，每年冬天飞到深圳湾越冬，用像琵琶一样的扁嘴在浅水里扫着找鱼。' }
  };
  var EAT = [ // [被吃的, 吃它的]
    ['mangrove', 'sesarmid'], ['algae', 'fiddler'], ['algae', 'zoo'], ['algae', 'mudskipper'],
    ['zoo', 'fish'], ['sesarmid', 'egret'], ['fiddler', 'egret'], ['fish', 'egret'], ['fish', 'spoonbill'], ['mudskipper', 'spoonbill']
  ];
  var removed = st.rm && SP[st.rm] ? st.rm : null;
  var sel = SP[st.sel] ? st.sel : null;

  function prey(k) { return EAT.filter(function (e) { return e[1] === k && e[0] !== removed; }).map(function (e) { return e[0]; }); }
  function preds(k) { return EAT.filter(function (e) { return e[0] === k && e[1] !== removed; }).map(function (e) { return e[1]; }); }
  function chains() {
    var out = [];
    Object.keys(SP).forEach(function (k) {
      if (!SP[k].prod || k === removed) return;
      (function walk(path) {
        var last = path[path.length - 1], next = preds(last);
        if (!next.length) { if (path.length > 1) out.push(path.slice()); return; }
        next.forEach(function (n) { path.push(n); walk(path); path.pop(); });
      })([k]);
    });
    return out;
  }
  var _rm = removed; removed = null;
  var ALL = chains();   // 完整食物网里的全部食物链
  removed = _rm;
  var chainSel = isFinite(+st.ch) && st.ch !== undefined && ALL[+st.ch] ? +st.ch : null;

  /* —— 画食物网 —— */
  var web = B.$('#web');
  var defs = S('defs', {}, web);
  var mk = S('marker', { id: 'arrow', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto' }, defs);
  S('path', { d: 'M0 1L10 5L0 9z', fill: '#8fa585' }, mk);
  var mk2 = S('marker', { id: 'arrow-on', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto' }, defs);
  S('path', { d: 'M0 1L10 5L0 9z', fill: '#b97342' }, mk2);

  S('rect', { x: 0, y: 0, width: 400, height: 330, rx: 14, fill: '#fbfcf8' }, web);
  S('path', { d: 'M0 214C60 206 120 222 200 214S330 206 400 216V290H0z', fill: '#e7eef0' }, web);
  S('path', { d: 'M0 270C80 262 160 276 240 268S360 262 400 270V290H0z', fill: '#d9e6ea' }, web);
  [['第四营养级', 40], ['第三营养级', 110], ['第二营养级', 180], ['第一营养级', 250]].forEach(function (l) {
    S('text', { x: 396, y: l[1] - 18, 'font-size': 8.5, 'text-anchor': 'end', fill: '#a8b4a2', text: l[0] }, web);
  });
  var edgeEls = [];
  function nodeW(k) { return SP[k].n.length * 12 + 20; }
  EAT.forEach(function (e) {
    var a = SP[e[0]], b = SP[e[1]];
    var dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy);
    var x1 = a.x + dx / L * 15, y1 = a.y + dy / L * 15, x2 = b.x - dx / L * 16, y2 = b.y - dy / L * 16;
    var p = S('path', { d: 'M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + 'L' + x2.toFixed(1) + ' ' + y2.toFixed(1), stroke: '#8fa585', 'stroke-width': 1.6, 'marker-end': 'url(#arrow)' }, web);
    edgeEls.push({ e: e, el: p });
  });
  var nodeEls = {};
  Object.keys(SP).forEach(function (k) {
    var s = SP[k], w = nodeW(k);
    var g = S('g', { class: 'node', transform: 'translate(' + s.x + ',' + s.y + ')', tabindex: 0, role: 'button', 'aria-label': s.n }, web);
    var r = S('rect', { x: -w / 2, y: -13, width: w, height: 26, rx: 13, fill: s.prod ? '#dcebd2' : '#fff', stroke: s.prod ? '#8fb07f' : '#c9d6c1', 'stroke-width': 1.4 }, g);
    S('text', { y: 4.5, 'font-size': 12, 'text-anchor': 'middle', fill: '#2f4a3f', 'font-weight': 600, text: s.n }, g);
    var x = S('path', { d: 'M' + (-w / 2 + 2) + ' -11L' + (w / 2 - 2) + ' 11M' + (w / 2 - 2) + ' -11L' + (-w / 2 + 2) + ' 11', stroke: '#c0703c', 'stroke-width': 1.6, opacity: 0 }, g);
    g.addEventListener('click', function () { pick(k); });
    g.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); pick(k); } });
    nodeEls[k] = { g: g, r: r, x: x };
  });
  S('rect', { x: 10, y: 296, width: 235, height: 26, rx: 9, fill: '#f3ede2' }, web);
  S('text', { x: 20, y: 313, 'font-size': 10, fill: '#7a6a52', text: '分解者：细菌、真菌——把遗体、落叶分解掉' }, web);
  S('rect', { x: 252, y: 296, width: 138, height: 26, rx: 9, fill: '#eaf0f2' }, web);
  S('text', { x: 260, y: 313, 'font-size': 10, fill: '#4e7f8d', text: '非生物：阳光、水、泥沙' }, web);

  /* —— 食物链列表 —— */
  var chainBtns = [];
  function renderChains() {
    var box = B.$('#chains'); box.innerHTML = ''; chainBtns = [];
    ALL.forEach(function (c, i) {
      var alive = !removed || c.indexOf(removed) < 0;
      var b = H('button', { type: 'button', 'aria-pressed': String(chainSel === i), html: c.map(function (k) { return SP[k].n; }).join(' → ') + (alive ? '' : '<span class="small-tag">断了</span>') }, box);
      b.addEventListener('click', function () { chainSel = chainSel === i ? null : i; render(); });
      chainBtns.push({ b: b, c: c, alive: alive });
    });
  }

  function levelsOf(k) {
    var lv = {};
    ALL.forEach(function (c) { var i = c.indexOf(k); if (i >= 0) lv[i + 1] = true; });
    return Object.keys(lv).map(Number).sort();
  }
  var CN = ['', '一', '二', '三', '四', '五'];
  function pick(k) { sel = sel === k ? null : k; render(); }

  function render() {
    renderChains();
    var focusChain = chainSel !== null ? ALL[chainSel] : null;
    var inChains = sel ? ALL.filter(function (c) { return c.indexOf(sel) >= 0; }) : [];
    // 节点
    Object.keys(SP).forEach(function (k) {
      var n = nodeEls[k], on;
      if (focusChain) on = focusChain.indexOf(k) >= 0;
      else if (sel) on = k === sel || inChains.some(function (c) { return c.indexOf(k) >= 0; });
      else on = true;
      n.g.setAttribute('opacity', k === removed ? 0.35 : on ? 1 : 0.32);
      n.r.setAttribute('stroke', k === sel ? '#b97342' : SP[k].prod ? '#8fb07f' : '#c9d6c1');
      n.r.setAttribute('stroke-width', k === sel ? 2.6 : 1.4);
      n.x.setAttribute('opacity', k === removed ? 1 : 0);
    });
    edgeEls.forEach(function (ed) {
      var a = ed.e[0], b = ed.e[1], on;
      if (focusChain) { var i = focusChain.indexOf(a); on = i >= 0 && focusChain[i + 1] === b; }
      else if (sel) on = inChains.some(function (c) { var i = c.indexOf(a); return i >= 0 && c[i + 1] === b; });
      else on = false;
      var gone = a === removed || b === removed;
      ed.el.setAttribute('stroke', on ? '#b97342' : '#8fa585');
      ed.el.setAttribute('stroke-width', on ? 2.6 : 1.6);
      ed.el.setAttribute('marker-end', on ? 'url(#arrow-on)' : 'url(#arrow)');
      ed.el.setAttribute('opacity', gone ? 0.15 : (focusChain || sel) && !on ? 0.3 : 1);
      ed.el.setAttribute('stroke-dasharray', gone ? '3 4' : '');
    });
    chainBtns.forEach(function (x) { x.b.classList.toggle('dim', !!sel && x.c.indexOf(sel) < 0 && chainSel === null); });

    // 选中的生物
    var rm = B.$('#remove'), rs = B.$('#restore'), eff = B.$('#effects');
    if (!sel) {
      B.$('#sel-name').textContent = '选一种生物'; B.$('#sel-role').textContent = '—';
      B.$('#r-chains').textContent = '—'; B.$('#r-level').textContent = '—';
      B.$('#sel-text').textContent = '点左边食物网里的一种生物。';
      rm.disabled = true;
    } else {
      var s = SP[sel], lv = levelsOf(sel);
      B.$('#sel-name').textContent = s.n;
      B.$('#sel-role').textContent = s.prod ? '生产者' : lv.map(function (l) { return CN[l - 1] + '级消费者'; }).join(' / ');
      B.$('#r-chains').innerHTML = inChains.length + '<small>条</small>';
      B.$('#r-level').textContent = lv.map(function (l) { return '第' + CN[l]; }).join('、');
      var eats = EAT.filter(function (e) { return e[1] === sel; }).map(function (e) { return SP[e[0]].n; });
      var eaten = EAT.filter(function (e) { return e[0] === sel; }).map(function (e) { return SP[e[1]].n; });
      var comp = {};
      EAT.filter(function (e) { return e[1] === sel; }).forEach(function (e) { EAT.forEach(function (f) { if (f[0] === e[0] && f[1] !== sel) comp[SP[f[1]].n] = true; }); });
      var t = s.note + ' ';
      if (eats.length) t += '它吃' + eats.join('、') + '；';
      if (eaten.length) t += '它被' + eaten.join('、') + '吃；';
      if (Object.keys(comp).length) t += '和' + Object.keys(comp).join('、') + '是<b>竞争</b>关系（抢同一种食物）。';
      B.$('#sel-text').innerHTML = t.replace(/；$/, '。');
      rm.disabled = !!removed;
      rm.textContent = '拿走' + s.n;
    }
    rs.hidden = !removed;
    if (removed) {
      eff.hidden = false; eff.innerHTML = '';
      var r = SP[removed];
      H('li', { html: '拿走了<b>' + r.n + '</b>，经过它的 ' + ALL.filter(function (c) { return c.indexOf(removed) >= 0; }).length + ' 条食物链都断了。' }, eff);
      EAT.filter(function (e) { return e[0] === removed; }).forEach(function (e) {
        var other = EAT.filter(function (f) { return f[1] === e[1] && f[0] !== removed; });
        H('li', { html: '<b>' + SP[e[1]].n + '</b>：' + (other.length ? '少了一种食物，数量可能减少，但还能吃' + other.map(function (f) { return SP[f[0]].n; }).join('、') + '。' : '失去了全部食物，会大量减少甚至离开。') }, eff);
      });
      EAT.filter(function (e) { return e[1] === removed; }).forEach(function (e) {
        H('li', { html: '<b>' + SP[e[0]].n + '</b>：少了一个天敌，短时间内数量会增加；多了以后食物不够，又会慢慢减少。' }, eff);
      });
      H('li', { html: '生态系统有一定的<b>自我调节能力</b>，但这种能力是有限的。' }, eff);
    } else eff.hidden = true;

    // 能量金字塔
    var pyr = B.$('#pyramid'); pyr.innerHTML = '';
    var e = +B.$('#eff').value / 100;
    B.$('#eff-out').textContent = Math.round(e * 100) + '%';
    if (!focusChain) { B.$('#py-sub').textContent = '先在左边选一条食物链。'; }
    else {
      B.$('#py-sub').textContent = '假设' + SP[focusChain[0]].n + '固定了 10000 千焦的太阳能：';
      var E = 10000;
      focusChain.forEach(function (k, i) {
        var row = H('div', { class: 'pyramid-row' }, pyr);
        H('span', { text: SP[k].n }, row);
        var tr = H('div', { class: 'track' }, row);
        var w = Math.max(1.5, E / 10000 * 100);
        H('div', { class: 'fill', style: 'width:' + w + '%;background:' + (i ? '#c9a27a' : '#8fae8a') }, tr);
        H('em', { text: (E >= 10 ? Math.round(E) : E.toFixed(1)) + ' 千焦' }, row);
        E *= e;
      });
      var row = H('div', { class: 'pyramid-row', style: 'margin-top:12px' }, pyr);
      H('span', { text: '有毒物质', style: 'color:#9c6334' }, row);
      var tr = H('div', { class: 'track', style: 'display:flex;gap:3px;background:transparent' }, row);
      focusChain.forEach(function (k, i) { H('div', { style: 'flex:1;border-radius:4px;background:#c0703c;opacity:' + (0.18 + i / (focusChain.length - 1) * 0.82).toFixed(2) }, tr); });
      H('em', { text: '越来越多' }, row);
    }
    B.setState({ sel: sel || '', ch: chainSel === null ? '' : chainSel, rm: removed || '' });
  }

  B.$('#remove').addEventListener('click', function () { if (sel) { removed = sel; render(); } });
  B.$('#restore').addEventListener('click', function () { removed = null; render(); });
  B.bindRange(B.$('#eff'), render);
  render();

  B.quiz([
    {
      title: '数一数有几条食物链',
      desc: '看左边的食物网（先别拿走任何生物）。从生产者数起，一直数到没有箭头再指出去为止，一共有几条食物链？',
      options: ['4 条', '5 条', '6 条', '7 条'],
      answer: 1,
      hint: '每条都要从红树或藻类开始，一直走到最顶端。下面的列表可以帮你核对。',
      explain: '从红树出发 1 条，从藻类出发 4 条，一共 5 条。'
    },
    {
      title: '找出最长的食物链',
      desc: '在食物链列表里点出<b>最长</b>的一条（营养级最多）。',
      check: function () {
        if (chainSel === null) return { ok: false, msg: '先在左边的列表里点一条食物链。' };
        var c = ALL[chainSel];
        if (c.length === 4) return { ok: true, msg: c.map(function (k) { return SP[k].n; }).join(' → ') + '，有 4 个营养级。看右边：传到第四级，能量只剩 10～80 千焦了。' };
        return { ok: false, msg: '这条只有 ' + c.length + ' 个营养级，还有更长的。' };
      }
    },
    {
      title: '污染物最后跑到了谁身上？',
      desc: '如果深圳湾的海水被难以分解的重金属污染了，下面哪种生物体内的重金属含量可能最高？',
      options: ['藻类', '浮游动物', '小鱼', '黑脸琵鹭'],
      answer: 3,
      hint: '有毒物质在生物体内很难排出，会沿着食物链一级一级积累。',
      explain: '有毒物质沿食物链积累（生物富集），营养级越高积累越多。所以保护黑脸琵鹭，也要保护好深圳湾的水。'
    }
  ]);
})();
