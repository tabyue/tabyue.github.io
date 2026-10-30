/* 第 16 课 · 生物的进化与多样性保护 */
(function () {
  'use strict';
  var B = window.Bio, S = B.svg, H = B.html;
  var st = B.getState();

  /* —— 桦尺蛾自然选择（按期望值计算） —— */
  var P0 = 0.05, SURV_HIDE = 0.8, SURV_SEEN = 0.4;
  var env = st.e === 'dark' ? 'dark' : 'light';
  var gen = Math.max(0, Math.min(200, parseInt(st.g, 10) || 0));
  var p = P0;
  // 链接里只记环境和代数：按“先在当前环境下过 gen 代”复现
  for (var i = 0; i < gen; i++) p = step(p, env);
  function step(q, e) {
    var sd = e === 'dark' ? SURV_HIDE : SURV_SEEN, sl = e === 'dark' ? SURV_SEEN : SURV_HIDE;
    return q * sd / (q * sd + (1 - q) * sl);
  }
  B.chips(B.$('#ev-env'), [{ label: '没有污染：浅色树干', value: 'light' }, { label: '工业污染：树干被熏黑', value: 'dark' }], env, function (v) { env = v; drawEv(); save(); });
  function moth(svg, x, y, dark) {
    var c = dark ? '#3e3d39' : '#ece6d6', s = dark ? '#2a2926' : '#c9c0aa';
    S('path', { d: 'M' + x + ' ' + y + 'q-12 -8 -14 2q4 8 14 2z', fill: c, stroke: s, 'stroke-width': .8 }, svg);
    S('path', { d: 'M' + x + ' ' + y + 'q12 -8 14 2q-4 8 -14 2z', fill: c, stroke: s, 'stroke-width': .8 }, svg);
  }
  function drawEv() {
    var svg = B.$('#ev-svg'); svg.innerHTML = '';
    var dk = env === 'dark';
    S('rect', { x: 0, y: 0, width: 400, height: 190, rx: 12, fill: dk ? '#4a4640' : '#ddd6c3' }, svg);
    for (var k = 0; k < 9; k++) S('path', { d: 'M' + (20 + k * 45) + ' 0q' + (k % 2 ? 8 : -8) + ' 95 0 190', stroke: dk ? '#3a3732' : '#c9c0aa', 'stroke-width': 3, fill: 'none', opacity: .7 }, svg);
    var N = 40, nd = Math.round(p * N), idx = [];
    for (var j = 0; j < N; j++) idx.push(j);
    idx.sort(function (a, b) { return ((a * 37) % 41) - ((b * 37) % 41); }); // 固定的“随机”排布
    for (j = 0; j < N; j++) {
      var col = j % 8, row = Math.floor(j / 8);
      moth(svg, 30 + col * 48 + (row % 2) * 18, 26 + row * 34, idx[j] < nd);
    }
    var dPct = Math.round(p * 100);
    B.$('#ev-title').textContent = '第 ' + gen + ' 代';
    B.$('#ev-badge').textContent = dk ? '树干是深色的' : '树干是浅色的';
    B.$('#ev-dark').textContent = (p > 0 && dPct < 1) ? '不到 1%' : dPct + '%';
    B.$('#ev-light').textContent = (p < 1 && dPct > 99) ? '不到 1%' : (100 - dPct) + '%';
    B.$('#ev-bar-d').style.width = dPct + '%';
    B.$('#ev-bar-l').style.width = (100 - dPct) + '%';
    B.$('#ev-text').innerHTML = (dk ? '在深色树干上，<b>深色</b>桦尺蛾不容易被鸟发现，每一代约 80% 能活下来繁殖；浅色的只有约 40%。' : '在浅色树干上，<b>浅色</b>桦尺蛾不容易被鸟发现，每一代约 80% 能活下来繁殖；深色的只有约 40%。') +
      (gen === 0 ? '点“过一代”看看。' : '过了 ' + gen + ' 代，深色个体占 <b>' + dPct + '%</b>。');
  }
  function advance(k) { for (var i = 0; i < k; i++) { p = step(p, env); gen++; } drawEv(); save(); }
  B.$('#ev-gen').addEventListener('click', function () { advance(1); });
  B.$('#ev-gen10').addEventListener('click', function () { advance(10); });
  B.$('#ev-reset').addEventListener('click', function () { p = P0; gen = 0; drawEv(); save(); });

  /* —— 进化历程排序 —— */
  var SEQ = {
    plant: ['藻类', '苔藓植物', '蕨类植物', '裸子植物', '被子植物'],
    animal: ['鱼', '两栖动物', '爬行动物', '鸟和哺乳动物']
  };
  var od = 'plant', got = [];
  B.chips(B.$('#od-chips'), [{ label: '植物', value: 'plant' }, { label: '脊椎动物', value: 'animal' }], od, function (v) { od = v; got = []; drawOd(); });
  function drawOd() {
    var box = B.$('#od-pick'); box.innerHTML = '';
    B.shuffle(SEQ[od]).forEach(function (n) {
      var b = H('button', { type: 'button', text: n }, box);
      if (got.indexOf(n) >= 0) { b.disabled = true; b.setAttribute('aria-pressed', 'true'); }
      b.addEventListener('click', function () {
        var want = SEQ[od][got.length];
        if (n === want) { got.push(n); b.disabled = true; b.setAttribute('aria-pressed', 'true'); }
        else { B.$('#od-result').className = 'feedback retry'; B.$('#od-result').textContent = n + '还不是下一个，想想谁更早出现。'; return; }
        if (got.length === SEQ[od].length) { B.$('#od-result').className = 'feedback success'; B.$('#od-result').textContent = '✓ ' + got.join(' → ') + '。从简单到复杂，从水生到陆生。'; }
        else { B.$('#od-result').className = 'feedback'; B.$('#od-result').textContent = '已排：' + got.join(' → '); }
      });
    });
    B.$('#od-result').className = 'feedback'; B.$('#od-result').textContent = got.length ? '已排：' + got.join(' → ') : '从最早出现的开始点。';
  }

  /* —— 保护措施 —— */
  var WAYS = [['insitu', '就地保护'], ['exsitu', '迁地保护'], ['bank', '建立种质资源库'], ['law', '法律保护']];
  var wn = function (v) { return WAYS.filter(function (w) { return w[0] === v; })[0][1]; };
  var CASES = [['在四川建立卧龙自然保护区保护大熊猫', 'insitu'], ['设立深圳福田红树林自然保护区', 'insitu'], ['把扬子鳄移到繁育研究中心进行人工繁殖', 'exsitu'],
    ['在植物园里引种栽培濒危植物', 'exsitu'], ['把珍稀植物的种子保存在国家种质资源库', 'bank'], ['颁布《中华人民共和国野生动物保护法》', 'law']];
  B.match('#pt-list', '#pt-score', B.shuffle(CASES), WAYS, function (it) { return wn(it[1]) + (it[1] === 'insitu' ? '，是保护生物多样性最有效的措施。' : '。'); });

  /* —— 外来入侵物种 —— */
  var INV = [['薇甘菊', 'in', '原产中南美洲，攀缘缠绕、覆盖树冠，让树木因得不到阳光而死亡，被称为“植物杀手”'],
    ['福寿螺', 'in', '原产南美洲，啃食水稻和水生植物，还可能携带广州管圆线虫'],
    ['红火蚁', 'in', '原产南美洲，叮咬人会引起灼痛和脓疱，还会破坏本地生物和农作物'],
    ['凤眼蓝（水葫芦）', 'in', '原产南美洲，在河道里疯长，堵塞水道、使水体缺氧'],
    ['红耳彩龟（巴西龟）', 'in', '原产美洲，常被随意放生，和本地龟类争夺食物和栖息地'],
    ['中华白海豚', 'no', '我国本地的国家一级保护动物，珠江口海域有分布'],
    ['桫椤', 'no', '本地的国家二级保护植物，是古老的蕨类'],
    ['黑脸琵鹭', 'no', '每年冬季来深圳湾越冬的珍稀候鸟，不是入侵物种']];
  B.match('#iv-list', '#iv-score', B.shuffle(INV).slice(0, 6), [['in', '外来入侵物种'], ['no', '本地或自然迁徙的物种']], function (it) { return it[0] + '：' + it[2] + '。'; });

  function save() { B.setState({ e: env, g: gen }); }
  drawEv(); drawOd();

  B.quiz([
    {
      title: '让深色桦尺蛾超过一半',
      desc: '从开始状态出发，选择合适的环境，让<b>深色</b>个体超过 50%。',
      check: function () { return p > 0.5 ? { ok: true, msg: '在被熏黑的树干上，深色个体存活和繁殖得更多，比例一代代升高。' } : { ok: false, msg: '现在深色只占 ' + Math.round(p * 100) + '%。想想什么环境对深色个体有利。' }; }
    },
    {
      title: '把植物的进化顺序排完',
      desc: '在“按出现的先后排一排”里选“植物”，按顺序点完。',
      check: function () { return od === 'plant' && got.length === SEQ.plant.length ? { ok: true, msg: '藻类 → 苔藓 → 蕨类 → 裸子植物 → 被子植物。' } : { ok: false, msg: '选“植物”，从最早出现的开始点完五个。' }; }
    },
    {
      title: '保护生物多样性最有效的措施',
      desc: '下面哪一项是保护生物多样性最有效的措施？',
      options: ['建立自然保护区', '把动物都迁到动物园', '禁止一切开发利用', '大量引进外来物种'],
      answer: 0,
      hint: '保护生物的同时，也要保护它们生活的环境。',
      explain: '建立自然保护区属于就地保护，能保护生物和它们的栖息地。'
    }
  ]);
})();
