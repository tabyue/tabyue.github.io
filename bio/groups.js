/* 第 3 课 · 植物、动物与微生物的类群 */
(function () {
  'use strict';
  var B = window.Bio, H = B.html;
  var st = B.getState();

  /* —— 植物类群 —— */
  var ORGANS = ['根', '茎', '叶', '花', '果实', '种子'];
  var PLANTS = [
    { id: 'alga', name: '藻类', has: [0, 0, 0, 0, 0, 0], eg: '海带、紫菜、水绵', note: '结构简单，没有根、茎、叶的分化，大多生活在水中。全身都能吸收水和无机盐、进行光合作用。' },
    { id: 'moss', name: '苔藓植物', has: [0, 1, 1, 0, 0, 0], eg: '葫芦藓、地钱', note: '有茎和叶，但只有<b>假根</b>，没有输导组织，长得矮小。叶只有一层细胞，可作为监测空气污染程度的<b>指示植物</b>。' },
    { id: 'fern', name: '蕨类植物', has: [1, 1, 1, 0, 0, 0], eg: '肾蕨、桫椤（深圳的山林里有野生桫椤，是国家二级保护植物）', note: '有真正的根、茎、叶，体内有<b>输导组织</b>，所以能长得比较高大。用<b>孢子</b>繁殖，生殖离不开水。' },
    { id: 'gymno', name: '裸子植物', has: [1, 1, 1, 0, 0, 1], eg: '松、杉、银杏、苏铁', note: '用<b>种子</b>繁殖，但种子是裸露的，外面<b>没有果皮</b>包被，所以不形成果实。' },
    { id: 'angio', name: '被子植物', has: [1, 1, 1, 1, 1, 1], eg: '荔枝、水稻、木棉、簕杜鹃', note: '有根、茎、叶、花、果实、种子六大器官，种子外面有<b>果皮</b>包被。是植物界种类最多、分布最广的类群。' }
  ];
  var pl = PLANTS.some(function (p) { return p.id === st.p; }) ? st.p : 'fern';
  B.chips(B.$('#pl-chips'), PLANTS.map(function (p) { return { label: p.name, value: p.id }; }), pl, function (v) { pl = v; drawPl(); B.setState({ p: pl }); });
  function drawPl() {
    var t = B.$('#pl-table'), cur = PLANTS.filter(function (p) { return p.id === pl; })[0];
    var h = '<thead><tr><th>类群</th>' + ORGANS.map(function (o) { return '<th>' + o + '</th>'; }).join('') + '</tr></thead><tbody>';
    PLANTS.forEach(function (p) {
      h += '<tr' + (p.id === pl ? ' style="background:#ecf4e6;font-weight:600"' : '') + '><td>' + p.name + '</td>' + p.has.map(function (x, i) {
        var txt = x ? '✓' : (p.id === 'moss' && i === 0 ? '假根' : '—');
        return '<td style="text-align:center;color:' + (x ? '#2f6a4a' : '#b0a494') + '">' + txt + '</td>';
      }).join('') + '</tr>';
    });
    t.innerHTML = h + '</tbody>';
    B.$('#pl-text').innerHTML = '<b>' + cur.name + '</b>　例子：' + cur.eg + '。<br>' + cur.note;
  }

  /* —— 微生物 —— */
  var MICRO = {
    bac: { n: '细菌', items: [['结构', '单细胞，有细胞壁、细胞膜、细胞质，<b>没有成形的细胞核</b>（只有 DNA 集中的区域）。'], ['繁殖', '分裂生殖，条件适宜时繁殖很快。有些能形成芽孢度过不良环境。'], ['例子', '乳酸菌、醋酸菌、大肠杆菌。']] },
    fun: { n: '真菌', items: [['结构', '细胞里有<b>真正的细胞核</b>。酵母菌是单细胞；青霉、曲霉、蘑菇是多细胞，由菌丝构成。'], ['繁殖', '大多用<b>孢子</b>繁殖，酵母菌还能出芽生殖。'], ['例子', '酵母菌、青霉、曲霉、蘑菇、木耳。']] },
    vir: { n: '病毒', items: [['结构', '个体极小，要用电子显微镜才能看到；<b>没有细胞结构</b>，由蛋白质外壳和内部的遗传物质组成。'], ['生活', '不能独立生活，只能<b>寄生在活细胞里</b>，利用细胞里的物质制造新病毒。'], ['例子', '流感病毒、新冠病毒、烟草花叶病毒、噬菌体（细菌病毒）。']] }
  };
  var mi = MICRO[st.m] ? st.m : 'bac';
  B.chips(B.$('#mi-chips'), [{ label: '细菌', value: 'bac' }, { label: '真菌', value: 'fun' }, { label: '病毒', value: 'vir' }], mi, function (v) { mi = v; drawMi(); });
  function drawMi() {
    B.$('#mi-badge').textContent = MICRO[mi].n;
    B.$('#mi-list').innerHTML = MICRO[mi].items.map(function (x) { return '<li><b>' + x[0] + '</b><span>' + x[1] + '</span></li>'; }).join('');
  }

  /* —— 动物归类 —— */
  var CLS = [['fish', '鱼'], ['amph', '两栖动物'], ['rept', '爬行动物'], ['bird', '鸟'], ['mamm', '哺乳动物'], ['inv', '无脊椎动物']];
  var name = function (v) { return CLS.filter(function (c) { return c[0] === v; })[0][1]; };
  var ANIMALS = [['鲸', 'mamm', '用肺呼吸、胎生哺乳'], ['娃娃鱼（大鲵）', 'amph', '幼体用鳃呼吸，成体用肺兼用皮肤呼吸'], ['企鹅', 'bird', '有羽毛、卵生，只是不会飞'], ['海马', 'fish', '用鳃呼吸，靠鳍游泳'],
    ['鳄鱼', 'rept', '体表有鳞片，在陆地上产卵'], ['蝙蝠', 'mamm', '会飞，但胎生哺乳'], ['章鱼', 'inv', '没有脊柱，是软体动物'], ['蚯蚓', 'inv', '没有脊柱，身体分节，是环节动物'],
    ['乌龟', 'rept', '用肺呼吸，体表有甲'], ['青蛙', 'amph', '幼体蝌蚪在水中用鳃呼吸'], ['鲨鱼', 'fish', '用鳃呼吸，是鱼'], ['蜘蛛', 'inv', '没有脊柱，体表有外骨骼，是节肢动物']];
  B.match('#an-list', '#an-score', B.shuffle(ANIMALS).slice(0, 8), CLS, function (it) { return it[0] + '属于' + name(it[1]) + '：' + it[2] + '。'; });

  /* —— 发酵食品 —— */
  var MAKERS = [['yeast', '酵母菌'], ['lactic', '乳酸菌'], ['acetic', '醋酸菌'], ['mold', '霉菌']];
  var mname = function (v) { return MAKERS.filter(function (c) { return c[0] === v; })[0][1]; };
  var FOODS = [['馒头、面包', 'yeast', '酵母菌产生二氧化碳，让面团松软多孔'], ['酸奶', 'lactic', '乳酸菌在无氧条件下把乳糖变成乳酸'], ['泡菜', 'lactic', '密封坛子里，乳酸菌产生乳酸'],
    ['米醋', 'acetic', '醋酸菌把酒精变成醋酸'], ['酱油、豆瓣酱', 'mold', '曲霉等霉菌分解大豆里的蛋白质'], ['米酒', 'yeast', '先由霉菌把淀粉分解成葡萄糖，再由酵母菌把葡萄糖变成酒精']];
  B.match('#fe-list', '#fe-score', B.shuffle(FOODS), MAKERS, function (it) { return it[0] + '：' + it[2] + '。'; });

  drawPl(); drawMi();

  B.quiz([
      {
      level: 'base',
      title: '找出“有输导组织，但没有种子”的植物类群',
      desc: '在上面的表格里点选这个类群。',
      check: function () { return pl === 'fern' ? { ok: true, msg: '蕨类植物有真正的根茎叶和输导组织，用孢子繁殖。' } : { ok: false, msg: '现在选的是' + PLANTS.filter(function (p) { return p.id === pl; })[0].name + '。找有根、茎、叶，但没有种子的那一类。' }; }
    },
      {
        level: 'base',
        title: '藻类植物的主要特征是？',
        desc: '它结构最简单。',
        options: ['结构简单，没有根茎叶的分化', '有发达的根系', '能结种子', '有输导组织'],
        answer: 0,
        hint: '海带有根茎叶吗？',
        explain: '藻类<b>没有根、茎、叶的分化</b>，全身都能吸收水分和无机盐，多生活在水中。'
      },
      {
        level: 'base',
        title: '下列属于裸子植物的是？',
        desc: '种子外面没有果皮包被。',
        options: ['松树', '桃树', '小麦', '向日葵'],
        answer: 0,
        hint: '松子外面有果肉吗？',
        explain: '<b>松树</b>是裸子植物，种子<b>裸露</b>，没有果皮包被。桃树、小麦、向日葵都是被子植物（有果实）。'
      },
      {
        level: 'base',
        title: '细菌和真菌在结构上最主要的区别是？',
        desc: '看有没有成形的细胞核。',
        options: ['细菌没有成形的细胞核，真菌有', '细菌有细胞壁，真菌没有', '细菌能繁殖，真菌不能', '没有区别'],
        answer: 0,
        hint: '哪个属于原核生物？',
        explain: '<b>细菌没有成形的细胞核</b>（原核生物），<b>真菌有成形的细胞核</b>（真核生物）。这是两者最本质的区别。'
      },
      {
      level: 'mid',
      title: '银杏的“白果”是果实吗？',
      desc: '银杏属于裸子植物。我们吃的“白果”其实是：',
      options: ['种子', '果实', '花', '叶'],
      answer: 0,
      hint: '裸子植物的种子外面没有果皮。',
      explain: '裸子植物没有果皮，不形成果实，“白果”是银杏的种子。'
    },
      {
      level: 'mid',
      title: '细菌和真菌最主要的区别',
      desc: '下面哪一项是细菌和真菌在细胞结构上最主要的区别？',
      options: ['有没有成形的细胞核', '有没有细胞壁', '有没有细胞膜', '是不是单细胞'],
      answer: 0,
      hint: '切换上面的“细菌”和“真菌”看看结构。',
      explain: '细菌没有成形的细胞核，真菌有真正的细胞核。'
    },
      {
        level: 'mid',
        title: '苔藓植物常用来作为监测空气污染的指示植物，因为？',
        desc: '它的叶很薄。',
        options: ['叶只有一层细胞，对有毒气体敏感', '它长得很高', '它有发达的根', '它能结种子'],
        answer: 0,
        hint: '有毒气体容易进入哪种结构？',
        explain: '苔藓的叶<b>只有一层细胞</b>，有毒气体容易侵入，对空气污染<b>特别敏感</b>，所以可作指示植物。'
      },
      {
        level: 'mid',
        title: '蕨类植物比苔藓植物高大，主要原因是？',
        desc: '看有没有运输结构。',
        options: ['有输导组织', '有花和果实', '有种子', '生活在水中'],
        answer: 0,
        hint: '水分和养料靠什么运上去？',
        explain: '蕨类有<b>输导组织</b>（和机械组织），能有效运输水分和养料并支撑身体，所以长得更高大。苔藓没有输导组织。'
      },
      {
        level: 'mid',
        title: '病毒的生活方式是？',
        desc: '它没有细胞结构。',
        options: ['寄生在活细胞内', '腐生在土壤中', '自己进行光合作用', '独立生活'],
        answer: 0,
        hint: '它能自己繁殖吗？',
        explain: '病毒<b>没有细胞结构</b>，只能<b>寄生在活细胞内</b>繁殖，离开活细胞通常以结晶体形式存在。'
      },
      {
        level: 'mid',
        title: '做馒头和面包时，面团膨大疏松是因为酵母菌产生了什么？',
        desc: '发酵的产物。',
        options: ['二氧化碳', '氧气', '酒精和氧气', '乳酸'],
        answer: 0,
        hint: '气体才能让面团膨起来。',
        explain: '酵母菌发酵产生<b>二氧化碳</b>，气体使面团膨大疏松（同时产生酒精，烘烤时挥发）。酸奶变酸则是<b>乳酸菌</b>产生乳酸。'
      },
      {
        level: 'trap',
        title: '「细菌都是有害的」这种说法对吗？',
        desc: '想想酸奶和豆制品。',
        options: ['不对，很多细菌对人类有益', '完全正确', '不对，细菌都是有益的', '只有真菌有害'],
        answer: 0,
        hint: '制作酸奶、泡菜靠什么？',
        explain: '<b>大多数细菌对人类有益或无害</b>：乳酸菌制酸奶泡菜、醋酸菌酿醋、根瘤菌固氮、分解者参与物质循环。<b>只有少数是致病菌</b>。'
      }
    ]);
})();
