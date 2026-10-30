/* 第 14 课 · 生物的生殖和发育 */
(function () {
  'use strict';
  var B = window.Bio, H = B.html;
  var st = B.getState();

  /* —— 发育过程 —— */
  var DEV = {
    silk: { n: '家蚕', type: '完全变态发育', badge: '有蛹期', text: '幼虫和成虫在形态结构和生活习性上差别很大。家蚕的幼虫吃桑叶、吐丝结茧，在茧里化蛹，最后羽化成蚕蛾。', st: [['卵', '受精卵，发育成幼虫。'], ['幼虫', '吃桑叶生长，要蜕皮 4 次。“春蚕到死丝方尽”，吐丝发生在幼虫末期。'], ['蛹', '不食不动，体内发生很大变化。'], ['成虫', '蚕蛾，交配后产卵。']] },
    locust: { n: '蝗虫', type: '不完全变态发育', badge: '没有蛹期', text: '若虫的形态和生活习性与成虫相似，只是身体较小、翅没有发育好。灭蝗最好在若虫（跳蝻）时期。', st: [['卵', '在土中孵化。'], ['若虫', '也叫跳蝻，形态像成虫，但翅很短、不会飞，要蜕皮 5 次。'], ['成虫', '翅发育完全，能飞，危害最大。']] },
    frog: { n: '青蛙', type: '变态发育（两栖动物）', badge: '离不开水', text: '雌雄蛙抱对，分别把卵细胞和精子排到水中，在水中完成<b>体外受精</b>。幼体和成体的形态结构、生活习性差异很大。', st: [['受精卵', '在水中发育。'], ['蝌蚪', '有尾，用鳃呼吸，生活在水中，像鱼。'], ['幼蛙', '先长后肢，再长前肢，尾逐渐缩短。'], ['成蛙', '尾消失，主要用肺呼吸，皮肤辅助呼吸，水陆两栖。']] },
    bird: { n: '鸡（鸟）', type: '体内受精，卵生', badge: '胚盘是关键', text: '鸟卵的<b>卵壳</b>和卵壳膜起保护作用；卵白提供水分和营养；卵黄是主要营养来源；<b>胚盘</b>里有细胞核，受精后发育成胚胎。', st: [['受精卵', '在母鸡体内完成受精。'], ['胚盘发育', '在适宜温度下，胚盘发育成胚胎。'], ['雏鸡', '约 21 天孵化出壳。'], ['成鸡', '性成熟后进行交配、产卵。']] }
  };
  var dv = DEV[st.dv] ? st.dv : 'silk', dvStep = 0;
  B.chips(B.$('#dv-chips'), Object.keys(DEV).map(function (k) { return { label: DEV[k].n, value: k }; }), dv, function (v) { dv = v; dvStep = 0; drawDv(); save(); });
  function drawDv() {
    var d = DEV[dv], box = B.$('#dv-steps'); box.innerHTML = '';
    d.st.forEach(function (s, i) {
      if (i) H('i', { text: '→' }, box);
      var sp = H('span', { text: s[0], class: i === dvStep ? 'on' : '', role: 'button', tabindex: '0' }, box);
      sp.style.cursor = 'pointer';
      var go = function () { dvStep = i; drawDv(); };
      sp.addEventListener('click', go);
      sp.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    B.$('#dv-info').innerHTML = '<b>' + d.st[dvStep][0] + '</b>　' + d.st[dvStep][1];
    B.$('#dv-title').textContent = d.n + '：' + d.type;
    B.$('#dv-badge').textContent = d.badge + ' · ' + d.st.length + ' 个阶段';
    B.$('#dv-text').innerHTML = d.text;
  }

  /* —— 嫁接 —— */
  var KINDS = [['wild', '野生荔枝'], ['fzx', '妃子笑'], ['nmc', '糯米糍'], ['gw', '桂味']];
  var kname = function (v) { return KINDS.filter(function (k) { return k[0] === v; })[0][1]; };
  var stock = KINDS.some(function (k) { return k[0] === st.sk; }) ? st.sk : 'wild';
  var scion = KINDS.some(function (k) { return k[0] === st.sc; }) ? st.sc : 'nmc';
  B.chips(B.$('#gf-stock'), KINDS.map(function (k) { return { label: k[1], value: k[0] }; }), stock, function (v) { stock = v; drawGf(); save(); });
  B.chips(B.$('#gf-scion'), KINDS.map(function (k) { return { label: k[1], value: k[0] }; }), scion, function (v) { scion = v; drawGf(); save(); });
  function drawGf() {
    B.$('#gf-result').innerHTML = stock === scion
      ? '砧木和接穗是同一个品种，结出的还是<b>' + kname(scion) + '</b>。'
      : '嫁接成活后，接穗上结出的荔枝是<b>' + kname(scion) + '</b>，不是' + kname(stock) + '。砧木只负责扎根、提供水和无机盐，<b>果实的性状由接穗决定</b>。';
  }

  /* —— 有性 / 无性 —— */
  var KIND2 = [['sex', '有性生殖'], ['asex', '无性生殖']];
  var REP = [['用种子繁殖水稻', 'sex'], ['剪一段月季枝条插到土里', 'asex'], ['把桃树枝条嫁接到山桃上', 'asex'], ['马铃薯块茎发芽长成新植株', 'asex'],
    ['植物组织培养快速繁殖兰花', 'asex'], ['克隆羊“多莉”的诞生', 'asex'], ['试管婴儿', 'sex'], ['青蛙抱对产卵', 'sex'], ['酵母菌出芽生殖', 'asex']];
  B.match('#sx-list', '#sx-score', B.shuffle(REP).slice(0, 7), KIND2, function (it) { return it[0] + (it[1] === 'sex' ? '：经过两性生殖细胞结合，是有性生殖。' : '：没有两性生殖细胞的结合，是无性生殖。'); });

  function save() { B.setState({ dv: dv, sk: stock, sc: scion }); }
  drawDv(); drawGf();

  B.quiz([
      {
      level: 'base',
      title: '找出有“蛹”期的动物',
      desc: '在上面切换动物，选一种发育过程中<b>有蛹期</b>的。',
      check: function () { return dv === 'silk' ? { ok: true, msg: '家蚕是完全变态发育：卵 → 幼虫 → 蛹 → 成虫。' } : { ok: false, msg: DEV[dv].n + '的发育过程里没有蛹期。' }; }
    },
      {
      level: 'base',
      title: '用“野生荔枝”做砧木、“桂味”做接穗',
      desc: '在嫁接里设置好，看看会结出什么荔枝。',
      check: function () { return stock === 'wild' && scion === 'gw' ? { ok: true, msg: '结出的是桂味。果实的性状由接穗决定。' } : { ok: false, msg: '砧木选“野生荔枝”，接穗选“桂味”。' }; }
    },
      {
        level: 'base',
        title: '有性生殖和无性生殖的根本区别是？',
        desc: '看有没有两性细胞结合。',
        options: ['有无两性生殖细胞的结合', '后代数量的多少', '繁殖速度的快慢', '是否需要阳光'],
        answer: 0,
        hint: '受精作用发生了吗？',
        explain: '根本区别是<b>有没有两性生殖细胞（精子和卵细胞）的结合</b>。有性生殖的后代具有双亲的遗传特性，变异更丰富。'
      },
      {
        level: 'base',
        title: '嫁接、扦插、压条属于哪种生殖方式？',
        desc: '没有生殖细胞结合。',
        options: ['无性生殖', '有性生殖', '孢子生殖', '出芽生殖'],
        answer: 0,
        hint: '它们能保持母本的优良性状。',
        explain: '都属于<b>无性生殖</b>（营养繁殖），优点是<b>繁殖快、能保持母本的优良性状</b>。'
      },
      {
        level: 'base',
        title: '昆虫的完全变态发育经过哪几个时期？',
        desc: '比不完全变态多一个时期。',
        options: ['卵 → 幼虫 → 蛹 → 成虫', '卵 → 幼虫 → 成虫', '卵 → 蛹 → 成虫', '幼虫 → 蛹 → 成虫'],
        answer: 0,
        hint: '家蚕和蝴蝶是哪一种？',
        explain: '<b>完全变态</b>：卵→幼虫→<b>蛹</b>→成虫（家蚕、蝴蝶、蜜蜂、苍蝇）。<b>不完全变态</b>没有蛹期：卵→若虫→成虫（蝗虫、蟋蟀）。'
      },
      {
      level: 'mid',
      title: '鸟卵中将来发育成雏鸟的是——',
      desc: '在鸟卵的结构中，含有细胞核、能发育成胚胎的部分是：',
      options: ['胚盘', '卵黄', '卵白', '气室'],
      answer: 0,
      hint: '切换到“鸡”看看说明。',
      explain: '胚盘里含有细胞核，受精后在适宜温度下发育成胚胎。'
    },
      {
        level: 'mid',
        title: '嫁接成活的关键是？',
        desc: '两部分要紧密结合。',
        options: ['接穗和砧木的形成层紧密结合', '接穗要足够长', '砧木要足够粗', '必须在冬天进行'],
        answer: 0,
        hint: '形成层有什么本领？',
        explain: '关键是使<b>接穗和砧木的形成层紧密结合</b>。形成层细胞具有<b>分裂能力</b>，才能愈合长成一体。'
      },
      {
        level: 'mid',
        title: '鸟卵中将来发育成雏鸟的结构是？',
        desc: '很小的一个白点。',
        options: ['胚盘', '卵黄', '卵白', '气室'],
        answer: 0,
        hint: '哪里含有细胞核？',
        explain: '<b>胚盘</b>内含细胞核，是胚胎发育的部位；<b>卵黄</b>提供主要营养，<b>卵白</b>提供水分和蛋白质并有保护作用。'
      },
      {
        level: 'mid',
        title: '青蛙的发育过程属于？',
        desc: '从蝌蚪到成蛙变化很大。',
        options: ['变态发育', '完全变态发育', '不完全变态发育', '直接发育'],
        answer: 0,
        hint: '蝌蚪用鳃呼吸，成蛙用肺。',
        explain: '青蛙是<b>变态发育</b>：受精卵→蝌蚪→幼蛙→成蛙，幼体与成体在<b>形态结构和生活习性上差别显著</b>（蝌蚪水中用鳃，成蛙陆上用肺兼皮肤）。'
      },
      {
        level: 'mid',
        title: '植物的开花结果过程中，必须经历的两个重要步骤是？',
        desc: '缺一不能结果。',
        options: ['传粉和受精', '光合和呼吸', '蒸腾和吸收', '分裂和分化'],
        answer: 0,
        hint: '花粉要落到哪里？',
        explain: '必须经过<b>传粉</b>（花粉落到柱头上）和<b>受精</b>（精子与卵细胞结合）。之后<b>子房发育成果实，胚珠发育成种子</b>。'
      },
      {
        level: 'trap',
        title: '扦插繁殖的后代为什么能保持母本的优良性状？',
        desc: '从遗传物质来源想。',
        options: ['后代遗传物质全部来自同一母本', '因为生长得更快', '因为经过了选择', '因为环境相同'],
        answer: 0,
        hint: '无性生殖有没有发生基因重组？',
        explain: '无性生殖的后代<b>遗传物质全部来自同一个体</b>，没有两性细胞结合带来的基因重组，所以<b>能保持母本性状</b>。这正是果树良种繁育常用嫁接扦插的原因。'
      }
    ]);
})();
