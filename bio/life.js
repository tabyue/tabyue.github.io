/* 第 1 课 · 生物的特征与细胞分裂 */
(function () {
  'use strict';
  var B = window.Bio, S = B.svg, H = B.html;
  var st = B.getState();
  var kind = st.k === 'plant' ? 'plant' : 'animal';
  var step = 0;
  var n = Math.max(0, Math.min(10, parseInt(st.n, 10) || 3));
  var lvKind = st.lv === 'plant' ? 'plant' : 'animal';

  /* —— 细胞分裂步进 —— */
  var STEPS = {
    animal: [
      '一个动物细胞：外面是细胞膜，中间是细胞核。',
      '细胞核里的<b>染色体先复制</b>，数目加倍，然后平均分成两份。',
      '细胞核一分为二。细胞膜从细胞中部<b>向内凹陷</b>。',
      '细胞膜继续向内凹陷，<b>缢裂</b>成两个新细胞。新细胞和原细胞的染色体数目相同。'],
    plant: [
      '一个植物细胞：最外面是细胞壁，里面是细胞膜和细胞核。',
      '细胞核里的<b>染色体先复制</b>，数目加倍，然后平均分成两份。',
      '细胞核一分为二。在原来细胞的中央开始形成新的细胞膜。',
      '中央形成新的<b>细胞膜和细胞壁</b>，一个细胞变成两个。新细胞和原细胞的染色体数目相同。']
  };
  B.chips(B.$('#div-kind'), [{ label: '动物细胞', value: 'animal' }, { label: '植物细胞', value: 'plant' }], kind, function (v) { kind = v; step = 0; drawDiv(); save(); });

  function nucleus(g, cx, cy, split) {
    var chrom = split ? 4 : 2;
    S('circle', { cx: cx, cy: cy, r: 16, fill: '#efe3c8', stroke: '#b98a5a', 'stroke-width': 1.4 }, g);
    for (var i = 0; i < chrom; i++) {
      var a = i / chrom * Math.PI * 2;
      S('path', { d: 'M' + (cx + Math.cos(a) * 5 - 3) + ' ' + (cy + Math.sin(a) * 5) + 'l6 -3', stroke: '#9c4f2c', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, g);
    }
  }
  function drawDiv() {
    var svg = B.$('#div-svg'); svg.innerHTML = '';
    var plant = kind === 'plant', cy = 96;
    S('rect', { x: 0, y: 0, width: 400, height: 200, rx: 12, fill: '#f6f8f2' }, svg);
    var wall = plant ? { fill: '#e2edd5', stroke: '#6f8a58' } : { fill: '#fbe9e1', stroke: '#c98a74' };
    if (step < 3) {
      var w = step === 2 ? 150 : 120;
      if (plant) S('rect', { x: 200 - w / 2 - 8, y: cy - 58, width: w + 16, height: 116, rx: 6, fill: 'none', stroke: '#6f8a58', 'stroke-width': 3 }, svg);
      if (plant || step < 2) S(plant ? 'rect' : 'ellipse', plant ? { x: 200 - w / 2, y: cy - 50, width: w, height: 100, rx: 4, fill: wall.fill, stroke: wall.stroke, 'stroke-width': 1.6 } : { cx: 200, cy: cy, rx: w / 2, ry: 52, fill: wall.fill, stroke: wall.stroke, 'stroke-width': 1.6 }, svg);
      else S('path', { d: 'M200 ' + (cy - 52) + 'C150 ' + (cy - 60) + ' 118 ' + (cy - 40) + ' 118 ' + cy + 'C118 ' + (cy + 40) + ' 150 ' + (cy + 60) + ' 200 ' + (cy + 52) + 'C188 ' + (cy + 30) + ' 188 ' + (cy - 30) + ' 200 ' + (cy - 52) + 'C212 ' + (cy - 30) + ' 212 ' + (cy + 30) + ' 200 ' + (cy + 52) + 'C250 ' + (cy + 60) + ' 282 ' + (cy + 40) + ' 282 ' + cy + 'C282 ' + (cy - 40) + ' 250 ' + (cy - 60) + ' 200 ' + (cy - 52) + 'Z', fill: wall.fill, stroke: wall.stroke, 'stroke-width': 1.6 }, svg);
      if (step === 2 && plant) S('path', { d: 'M200 ' + (cy - 50) + 'v100', stroke: '#6f8a58', 'stroke-width': 2, 'stroke-dasharray': '5 4' }, svg);
      if (step === 2) { nucleus(svg, 165, cy, false); nucleus(svg, 235, cy, false); }
      else nucleus(svg, 200, cy, step === 1);
    } else {
      [118, 282].forEach(function (cx) {
        if (plant) {
          S('rect', { x: cx - 64, y: cy - 58, width: 128, height: 116, rx: 6, fill: 'none', stroke: '#6f8a58', 'stroke-width': 3 }, svg);
          S('rect', { x: cx - 56, y: cy - 50, width: 112, height: 100, rx: 4, fill: wall.fill, stroke: wall.stroke, 'stroke-width': 1.6 }, svg);
        } else S('ellipse', { cx: cx, cy: cy, rx: 58, ry: 50, fill: wall.fill, stroke: wall.stroke, 'stroke-width': 1.6 }, svg);
        nucleus(svg, cx, cy, false);
      });
    }
    S('text', { x: 16, y: 186, 'font-size': 12, fill: '#6f8268', text: '第 ' + (step + 1) + ' / 4 步' + (step === 1 ? ' · 染色体已复制' : '') }, svg);
    B.$('#div-text').innerHTML = STEPS[kind][step];
    B.$('#div-prev').disabled = step === 0;
    B.$('#div-next').textContent = step === 3 ? '重新开始' : '下一步 →';
  }
  B.$('#div-next').addEventListener('click', function () { step = step === 3 ? 0 : step + 1; drawDiv(); });
  B.$('#div-prev').addEventListener('click', function () { if (step > 0) step--; drawDiv(); });

  /* —— 连续分裂 —— */
  function drawN() {
    var cells = Math.pow(2, n);
    B.$('#n-cells').textContent = cells.toLocaleString('zh-CN') + ' 个';
    B.$('#n-badge').textContent = '2 的 ' + n + ' 次方';
    B.$('#n-text').innerHTML = n === 0 ? '还没分裂，只有 1 个细胞。' : '1 个细胞连续分裂 ' + n + ' 次，得到 2<sup>' + n + '</sup> = <b>' + cells + '</b> 个细胞。不管分裂多少次，每个人体细胞里都是 <b>46 条</b>（23 对）染色体。';
    save();
  }
  B.bindRange(B.$('#n-range'), function (v) { n = v; drawN(); });
  B.$('#n-range').value = n; B.paintRange(B.$('#n-range'));

  /* —— 结构层次 —— */
  var LEVELS = {
    animal: [['细胞', '人体细胞，如神经细胞、肌肉细胞、红细胞。'], ['组织', '细胞分化形成组织：上皮组织、肌肉组织、结缔组织（如血液、骨）、神经组织。'], ['器官', '不同组织按一定次序结合在一起，如胃、心脏、皮肤。'], ['系统', '能共同完成一种或几种生理功能的多个器官组合起来，如消化系统、呼吸系统。人体共有八大系统。'], ['动物体', '各个系统协调配合，形成一个完整的人或动物。']],
    plant: [['细胞', '荔枝叶片里的叶肉细胞、表皮细胞。'], ['组织', '分生组织、保护组织（如表皮）、营养组织（如果肉）、输导组织（如叶脉里的导管和筛管）等。'], ['器官', '绿色开花植物有根、茎、叶（营养器官）和花、果实、种子（生殖器官）。荔枝的果实就是一个器官。'], ['植物体', '由六大器官直接构成，<b>没有“系统”这一层</b>。']]
  };
  var lvPick = 0;
  B.chips(B.$('#lv-kind'), [{ label: '动物（人）', value: 'animal' }, { label: '植物（荔枝）', value: 'plant' }], lvKind, function (v) { lvKind = v; lvPick = 0; drawLv(); save(); });
  function drawLv() {
    var box = B.$('#lv-steps'); box.innerHTML = '';
    LEVELS[lvKind].forEach(function (l, i) {
      if (i) H('i', { text: '→' }, box);
      var sp = H('span', { text: l[0], class: i === lvPick ? 'on' : '', role: 'button', tabindex: '0' }, box);
      sp.style.cursor = 'pointer';
      sp.dataset.i = i;
      var go = function () { lvPick = i; drawLv(); };
      sp.addEventListener('click', go);
      sp.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    var L = LEVELS[lvKind][lvPick];
    B.$('#lv-info').innerHTML = '<b>' + L[0] + '</b>　' + L[1];
  }

  /* —— 是不是生物 —— */
  var ITEMS = [['珊瑚虫', 'y', '能摄取营养、能繁殖'], ['钟乳石', 'n', '会变大，但不需要营养、不呼吸'], ['蘑菇', 'y', '是真菌，能生长繁殖'], ['扫地机器人', 'n', '会动，但不能生长和繁殖'],
    ['流感病毒', 'y', '没有细胞结构，但能在活细胞里繁殖'], ['电脑病毒', 'n', '只是一段程序'], ['休眠的种子', 'y', '里面的胚是活的，条件适宜就能萌发'], ['火焰', 'n', '会“蔓延”，但不是生命']];
  B.match('#lf-list', '#lf-score', B.shuffle(ITEMS).slice(0, 6), [['y', '是生物'], ['n', '不是生物']], function (it) { return it[0] + (it[1] === 'y' ? '是生物：' : '不是生物：') + it[2] + '。'; });

  function save() { B.setState({ k: kind, n: n, lv: lvKind }); }

  drawDiv(); drawN(); drawLv();

  B.quiz([
    {
      title: '分裂出 8 个细胞',
      desc: '拖动右边的“连续分裂次数”，让 1 个细胞分裂成 <b>8 个</b>。',
      check: function () { return n === 3 ? { ok: true, msg: '2 × 2 × 2 = 8，分裂 3 次。' } : { ok: false, msg: '现在是 ' + Math.pow(2, n) + ' 个。每分裂一次，细胞数目翻一倍。' }; }
    },
    {
      title: '植物体比动物体少了哪一层？',
      desc: '切换“动物”和“植物”，比一比两条结构层次。',
      options: ['系统', '组织', '器官', '细胞'],
      answer: 0,
      hint: '把两条路线并排看看。',
      explain: '植物体由器官直接构成植物体，没有系统这一层。'
    },
    {
      title: '病毒为什么算生物？',
      desc: '病毒没有细胞结构，却被归为生物，主要因为：',
      options: ['它能在活细胞里繁殖后代', '它的个体很小', '它会让人生病', '它能在空气里飘'],
      answer: 0,
      hint: '想想生物的特征里哪一条病毒有。',
      explain: '病毒离开活细胞就不能生活，但在活细胞里能利用细胞里的物质繁殖，具有生物的基本特征。'
    }
  ]);
})();
