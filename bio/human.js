/* 第 7 课 · 人的生殖、青春期与营养 */
(function () {
  'use strict';
  var B = window.Bio, H = B.html;
  var st = B.getState();

  /* —— 从受精到分娩 —— */
  var STEPS = [
    ['精子', '男性的<b>睾丸</b>产生精子，精子有长长的尾，能游动。'],
    ['卵细胞', '女性的<b>卵巢</b>产生卵细胞。卵细胞是人体最大的细胞，含有较多的营养物质。'],
    ['受精', '精子和卵细胞在<b>输卵管</b>里相遇结合，形成<b>受精卵</b>——新生命从这里开始。'],
    ['分裂', '受精卵一边进行细胞分裂，一边向子宫移动，逐渐发育成胚泡。'],
    ['怀孕', '胚泡移入<b>子宫</b>，附着在子宫内膜上，这就是怀孕。'],
    ['胎儿', '胚胎在子宫里继续发育成胎儿，通过<b>胎盘和脐带</b>从母体获得营养物质和氧气，产生的废物也通过胎盘由母体排出。'],
    ['分娩', '怀孕到第 <b>38 周</b>左右，胎儿发育成熟，从母体阴道产出，叫分娩。']
  ];
  var rp = 0;
  function drawRp() {
    var box = B.$('#rp-steps'); box.innerHTML = '';
    STEPS.forEach(function (s, i) {
      if (i) H('i', { text: '→' }, box);
      var sp = H('span', { text: s[0], class: i === rp ? 'on' : (i < rp ? 'on v' : '') }, box);
      sp.style.cursor = 'pointer';
      sp.addEventListener('click', function () { rp = i; drawRp(); });
    });
    B.$('#rp-info').innerHTML = '<b>第 ' + (rp + 1) + ' 步 · ' + STEPS[rp][0] + '</b>　' + STEPS[rp][1];
    B.$('#rp-prev').disabled = rp === 0;
    B.$('#rp-next').textContent = rp === STEPS.length - 1 ? '从头再看' : '下一步 →';
  }
  B.$('#rp-next').addEventListener('click', function () { rp = rp === STEPS.length - 1 ? 0 : rp + 1; drawRp(); });
  B.$('#rp-prev').addEventListener('click', function () { if (rp) rp--; drawRp(); });

  /* —— 青春期 —— */
  B.$('#pb-list').innerHTML = [
    ['身高突增', '是青春期形态发育的显著特点。'],
    ['神经系统和心、肺功能明显增强', '学习、运动能力都在提高，要合理安排作息。'],
    ['性器官迅速发育', '男孩出现遗精，女孩出现月经，都是正常的生理现象。'],
    ['第二性征出现', '男孩长胡须、喉结突出、声音变粗；女孩乳房发育、声调变高。'],
    ['心理变化', '有了独立意识，也容易出现矛盾心理。遇到困惑可以和家长、老师交流。']
  ].map(function (x) { return '<li><b>' + x[0] + '</b><span>' + x[1] + '</span></li>'; }).join('');

  /* —— 配一份午餐 —— */
  var FOODS = [
    { id: 'rice', n: '米饭', g: 'grain' }, { id: 'corn', n: '玉米（粗粮）', g: 'grain' },
    { id: 'veg', n: '炒青菜', g: 'veg' }, { id: 'tomato', n: '番茄炒蛋', g: 'veg', g2: 'meat' },
    { id: 'fish', n: '清蒸鱼', g: 'meat' }, { id: 'chick', n: '炸鸡腿', g: 'meat', bad: 'oil' },
    { id: 'tofu', n: '豆腐', g: 'bean' }, { id: 'milk', n: '一盒牛奶', g: 'bean' },
    { id: 'fruit', n: '一个苹果', g: 'fruit' }, { id: 'fries', n: '炸薯条', g: 'grain', bad: 'oil' },
    { id: 'cola', n: '一罐可乐', bad: 'sugar' }
  ];
  var GROUPS = [['grain', '谷薯类'], ['veg', '蔬菜'], ['fruit', '水果'], ['meat', '鱼禽蛋肉'], ['bean', '奶类和大豆']];
  var picked = {};
  (st.ln || 'rice,veg,fish').split(',').forEach(function (id) { if (FOODS.some(function (f) { return f.id === id; })) picked[id] = true; });
  var lnBox = B.$('#ln-chips');
  FOODS.forEach(function (f) {
    var b = H('button', { type: 'button', text: f.n, 'aria-pressed': String(!!picked[f.id]) }, lnBox);
    b.dataset.id = f.id;
    b.addEventListener('click', function () { picked[f.id] = !picked[f.id]; b.setAttribute('aria-pressed', String(picked[f.id])); drawLn(); });
  });
  function lunch() {
    var have = {}, bad = {}, n = 0;
    FOODS.forEach(function (f) { if (!picked[f.id]) return; n++; if (f.g) have[f.g] = 1; if (f.g2) have[f.g2] = 1; if (f.bad) bad[f.bad] = 1; });
    var miss = GROUPS.filter(function (g) { return !have[g[0]]; });
    return { n: n, miss: miss, bad: bad, score: GROUPS.length - miss.length - (bad.oil ? 1 : 0) - (bad.sugar ? 1 : 0) };
  }
  function drawLn() {
    var r = lunch();
    var txt;
    if (!r.n) txt = '还没选。点上面的食物配一份午餐。';
    else {
      txt = '覆盖了 <b>' + (GROUPS.length - r.miss.length) + ' / 5</b> 类食物。';
      if (r.miss.length) txt += '还缺：' + r.miss.map(function (g) { return g[1]; }).join('、') + '。';
      else txt += '五类食物都有了，搭配很全面。';
      if (r.bad.oil) txt += '<br>油炸食品脂肪多，建议少吃。';
      if (r.bad.sugar) txt += '<br>含糖饮料添加糖多，建议用白开水代替。';
    }
    B.$('#ln-result').innerHTML = txt;
    B.$('#ln-score').textContent = r.n ? '· 评分 ' + Math.max(0, r.score) + ' / 5' : '';
    B.setState({ ln: FOODS.filter(function (f) { return picked[f.id]; }).map(function (f) { return f.id; }).join(',') });
  }

  /* —— 营养缺乏症 —— */
  var NUT = [['va', '维生素 A'], ['vb1', '维生素 B₁'], ['vc', '维生素 C'], ['vd', '维生素 D 或钙'], ['iodine', '碘'], ['iron', '铁']];
  var nname = function (v) { return NUT.filter(function (x) { return x[0] === v; })[0][1]; };
  var DISEASE = [['夜盲症（傍晚看不清东西）', 'va', '多吃动物肝脏、胡萝卜'], ['脚气病（神经炎、食欲不振）', 'vb1', '多吃粗粮、豆类'], ['坏血病（牙龈出血）', 'vc', '多吃新鲜蔬菜和水果'],
    ['佝偻病、骨质疏松', 'vd', '多晒太阳，多喝牛奶'], ['地方性甲状腺肿（大脖子病）', 'iodine', '食用加碘盐、多吃海带'], ['贫血（乏力、头晕）', 'iron', '多吃瘦肉、动物血、菠菜']];
  B.match('#df-list', '#df-score', B.shuffle(DISEASE), function () { return B.shuffle(NUT).slice(0, 6); }, function (it) { return it[0].replace(/（.*）/, '') + '：缺' + nname(it[1]) + '，' + it[2] + '。'; });

  drawRp(); drawLn();

  B.quiz([
    {
      title: '受精发生在哪里？',
      desc: '精子和卵细胞结合形成受精卵的部位是：',
      options: ['输卵管', '子宫', '卵巢', '阴道'],
      answer: 0,
      hint: '回到上面的步骤，看“受精”那一步。',
      explain: '受精在输卵管里完成，胚胎发育的主要场所才是子宫。'
    },
    {
      title: '配一份五类食物齐全、没有油炸和含糖饮料的午餐',
      desc: '在“配一份午餐”里点选，让谷薯类、蔬菜、水果、鱼禽蛋肉、奶类和大豆都有，而且<b>不选</b>炸鸡腿、炸薯条和可乐。',
      check: function () { var r = lunch(); if (r.bad.oil || r.bad.sugar) return { ok: false, msg: '去掉油炸食品和含糖饮料。' }; if (r.miss.length) return { ok: false, msg: '还缺：' + r.miss.map(function (g) { return g[1]; }).join('、') + '。' }; return { ok: true, msg: '这就是“食物多样、合理搭配”。' }; }
    },
    {
      title: '人体最主要的供能物质',
      desc: '下面哪一类是人体生命活动所需能量的最主要来源？',
      options: ['糖类', '蛋白质', '维生素', '无机盐'],
      answer: 0,
      hint: '米饭、面条里含量最多的是什么？',
      explain: '糖类是最主要的供能物质；脂肪是备用能源；维生素和无机盐不提供能量。'
    }
  ]);
})();
