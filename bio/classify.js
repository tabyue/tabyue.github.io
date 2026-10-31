/* 第 4 课 · 生物的分类 */
(function () {
  'use strict';
  var B = window.Bio, H = B.html;

  /* —— 简化的二歧式检索表 —— */
  var KEY = {
    k1: { q: '先看有没有细胞', a: ['没有细胞结构，只由蛋白质外壳和遗传物质组成', 'virus'], b: ['由细胞构成', 'k2'] },
    k2: { q: '再看细胞核', a: ['细胞里没有成形的细胞核', 'bacteria'], b: ['细胞里有成形的细胞核', 'k3'] },
    k3: { q: '能不能自己制造有机物', a: ['有叶绿体，能进行光合作用', 'k4'], b: ['没有叶绿体，不能进行光合作用', 'k7'] },
    k4: { q: '看身体有没有分化', a: ['没有根、茎、叶的分化', 'algae'], b: ['有茎和叶', 'k5'] },
    k5: { q: '看根', a: ['没有真正的根，只有假根，植株矮小', 'moss'], b: ['有真正的根，体内有输导组织', 'k6'] },
    k6: { q: '看怎么繁殖', a: ['用孢子繁殖，不结种子', 'fern'], b: ['用种子繁殖', 'k6b'] },
    k6b: { q: '看种子外面', a: ['种子裸露，外面没有果皮包被', 'gymno'], b: ['种子外面有果皮包被，形成果实', 'angio'] },
    k7: { q: '看怎么获得食物', a: ['有细胞壁，从外界吸收现成的有机物，多用孢子繁殖', 'fungi'], b: ['没有细胞壁，能主动摄取食物，一般能运动', 'k8'] },
    k8: { q: '摸一摸背部', a: ['体内没有由脊椎骨组成的脊柱', 'k9'], b: ['体内有脊柱', 'k10'] },
    k9: { q: '看身体和外壳', a: ['体表有坚韧的外骨骼，身体和附肢都分节', 'arthropod'], b: ['不是上面这样', 'otherInv'] },
    k10: { q: '看体温', a: ['体温随环境变化（变温）', 'k11'], b: ['体温恒定', 'k13'] },
    k11: { q: '看在哪儿生活、怎么呼吸', a: ['终生生活在水中，用鳃呼吸，用鳍游泳', 'fish'], b: ['不是终生生活在水中', 'k12'] },
    k12: { q: '看小时候和长大后', a: ['幼体在水中用鳃呼吸，成体用肺呼吸、皮肤辅助呼吸', 'amphibian'], b: ['用肺呼吸，体表有鳞片或甲，在陆地上产卵', 'reptile'] },
    k13: { q: '看体表和繁殖', a: ['体表被覆羽毛，前肢变成翼，卵生', 'bird'], b: ['体表通常被毛，胎生、哺乳', 'mammal'] }
  };
  var LEAF = {
    virus: '病毒', bacteria: '细菌', fungi: '真菌', algae: '藻类', moss: '苔藓植物', fern: '蕨类植物', gymno: '裸子植物', angio: '被子植物',
    arthropod: '节肢动物', otherInv: '其他无脊椎动物', fish: '鱼', amphibian: '两栖动物', reptile: '爬行动物', bird: '鸟', mammal: '哺乳动物'
  };
  var ORGS = [
    { id: 'phage', name: '噬菌体', leaf: 'virus', note: '专门侵染细菌的病毒。病毒没有细胞结构，离开活细胞就不能生活。' },
    { id: 'lacto', name: '乳酸菌', leaf: 'bacteria', note: '做酸奶、泡菜都靠它。细菌个体只有一个细胞，没有成形的细胞核，靠分裂繁殖。' },
    { id: 'yeast', name: '酵母菌', leaf: 'fungi', note: '蒸馒头、做面包、酿酒都用它。它是只有一个细胞的真菌，有成形的细胞核。' },
    { id: 'mush', name: '蘑菇', leaf: 'fungi', note: '蘑菇不是植物！它没有叶绿体，靠分解现成的有机物生活，用孢子繁殖。' },
    { id: 'kelp', name: '海带', leaf: 'algae', note: '海带看着像有“根”和“叶”，其实是没有分化的叶状体，下面的“根”叫固着器，只起固定作用。' },
    { id: 'moss', name: '葫芦藓', leaf: 'moss', note: '有茎和叶，但只有假根。苔藓植物对二氧化硫很敏感，可以用来监测空气污染。' },
    { id: 'tree-fern', name: '桫椤', leaf: 'fern', note: '深圳梧桐山、马峦山等地的山谷里能见到。桫椤是能长成“树”的蕨类植物，有“活化石”之称，是国家二级保护植物。' },
    { id: 'ginkgo', name: '银杏', leaf: 'gymno', note: '我们吃的“白果”是银杏的种子，外面没有果皮包着，所以银杏是裸子植物。' },
    { id: 'lychee', name: '荔枝', leaf: 'angio', note: '深圳南山荔枝很有名。荔枝会开花结果，种子被包在果实里，是被子植物。' },
    { id: 'crab', name: '招潮蟹', leaf: 'arthropod', note: '深圳湾红树林的滩涂上很常见。它的身体和附肢都分节，外面有坚硬的外骨骼。' },
    { id: 'worm', name: '蚯蚓', leaf: 'otherInv', note: '环节动物：身体由许多相似的环节组成，靠湿润的体壁呼吸。' },
    { id: 'snail', name: '蜗牛', leaf: 'otherInv', note: '软体动物：身体柔软，大多有贝壳保护。' },
    { id: 'seahorse', name: '海马', leaf: 'fish', note: '长得不像鱼，却是真正的鱼：终生生活在水中，用鳃呼吸、靠鳍游泳。' },
    { id: 'sala', name: '大鲵', leaf: 'amphibian', note: '俗称“娃娃鱼”，却不是鱼：幼体用鳃呼吸，成体用肺呼吸、皮肤辅助呼吸，是两栖动物。' },
    { id: 'gecko', name: '壁虎', leaf: 'reptile', note: '体表有细鳞，用肺呼吸，在陆地上产卵，卵外有坚韧的卵壳，是爬行动物。' },
    { id: 'pigeon', name: '家鸽', leaf: 'bird', note: '体表被覆羽毛，前肢变成翼，有气囊辅助肺呼吸，体温恒定。' },
    { id: 'bat', name: '蝙蝠', leaf: 'mammal', note: '会飞却不是鸟：它体表有毛，胎生、哺乳，是哺乳动物。' },
    { id: 'whale', name: '鲸', leaf: 'mammal', note: '叫“鲸鱼”却不是鱼：它用肺呼吸，要浮出水面换气，胎生、哺乳。' }
  ];

  function pathTo(leaf) {
    var out = [];
    (function dfs(k) {
      var n = KEY[k];
      for (var side of ['a', 'b']) {
        out.push([k, side]);
        var nx = n[side][1];
        if (nx === leaf) return true;
        if (KEY[nx] && dfs(nx)) return true;
        out.pop();
      }
      return false;
    })('k1');
    return out;
  }

  var st = B.getState();
  var org = ORGS.find(function (o) { return o.id === st.org; }) || ORGS[13];
  var walked = []; // 已经走对的步骤
  var finished = false;

  var orgChips = B.chips(B.$('#org-chips'), ORGS.map(function (o) { return { label: o.name, value: o.id }; }), org.id, function (v) {
    org = ORGS.find(function (o) { return o.id === v; }); reset();
  });

  var walkEl = B.$('#key-walk');
  function renderWalk() {
    var path = pathTo(org.leaf);
    walkEl.innerHTML = '';
    for (var i = 0; i <= walked.length && i < path.length; i++) {
      (function (i) {
        var k = path[i][0], node = KEY[k];
        var li = H('li', { class: 'key-item' + (i === walked.length ? ' active' : ' passed') }, walkEl);
        H('div', { class: 'q', text: '第 ' + (i + 1) + ' 步 · ' + node.q }, li);
        var opts = H('div', { class: 'opts' }, li);
        ['a', 'b'].forEach(function (side) {
          var nx = node[side][1];
          var b = H('button', { type: 'button', html: node[side][0] + '<span class="to">' + (LEAF[nx] ? '→ ' + LEAF[nx] : '→ 继续往下看') + '</span>' }, opts);
          if (i < walked.length) {
            if (walked[i] === side) b.classList.add('picked');
            b.disabled = true;
          } else {
            b.addEventListener('click', function () {
              if (side === path[i][1]) { walked.push(side); if (walked.length === path.length) finished = true; renderWalk(); }
              else {
                b.classList.add('nope');
                var fb = li.querySelector('.hint') || H('div', { class: 'feedback retry hint' }, li);
                fb.textContent = '不太对。想一想：' + org.name + '是“' + node[path[i][1]][0] + '”吗？';
              }
            });
          }
        });
      })(i);
    }
    var badge = B.$('#step-badge');
    B.$('#r-org').textContent = org.name;
    if (finished) {
      badge.textContent = '完成 · 共 ' + path.length + ' 步';
      B.$('#r-group').textContent = LEAF[org.leaf];
      B.$('#r-note').textContent = org.note;
      var done = H('li', { class: 'result-card', html: '分好了！<b>' + org.name + '</b> 属于 <b>' + LEAF[org.leaf] + '</b>。' }, walkEl);
      done.setAttribute('aria-live', 'polite');
    } else {
      badge.textContent = '第 ' + (walked.length + 1) + ' 步';
      B.$('#r-group').textContent = '？';
      B.$('#r-note').textContent = '走完检索表，这里会告诉你它为什么属于这一类。';
    }
    saveState();
  }
  function saveState() { B.setState({ org: org.id, a: ta && ta.value, b: tb && tb.value }); }
  function reset() { walked = []; finished = false; renderWalk(); }
  B.$('#reset-walk').addEventListener('click', reset);
  B.$('#auto-walk').addEventListener('click', function () {
    walked = pathTo(org.leaf).map(function (p) { return p[1]; }); finished = true; renderWalk();
  });

  /* 完整检索表 */
  (function renderFull() {
    var full = B.$('#key-full'), num = {}, n = 0;
    Object.keys(KEY).forEach(function (k) { num[k] = ++n; });
    Object.keys(KEY).forEach(function (k) {
      var node = KEY[k];
      var li = H('li', { class: 'key-item' }, full);
      ['a', 'b'].forEach(function (side) {
        var nx = node[side][1];
        H('div', { style: 'font-size:14px;line-height:1.75;color:#455d48', html: '<b style="color:var(--orange)">' + num[k] + side + '</b>　' + node[side][0] + ' …… ' + (LEAF[nx] ? '<b>' + LEAF[nx] + '</b>' : '见 ' + num[nx]) }, li);
      });
    });
  })();

  /* —— 从种到界 —— */
  var RANKS = ['界', '门', '纲', '目', '科', '属', '种'];
  var TAXA = [
    { id: 'wolf', name: '狼', t: ['动物界', '脊索动物门', '哺乳纲', '食肉目', '犬科', '犬属', '狼'] },
    { id: 'fox', name: '赤狐', t: ['动物界', '脊索动物门', '哺乳纲', '食肉目', '犬科', '狐属', '赤狐'] },
    { id: 'cat', name: '家猫', t: ['动物界', '脊索动物门', '哺乳纲', '食肉目', '猫科', '猫属', '家猫'] },
    { id: 'tiger', name: '虎', t: ['动物界', '脊索动物门', '哺乳纲', '食肉目', '猫科', '豹属', '虎'] },
    { id: 'leopard', name: '豹', t: ['动物界', '脊索动物门', '哺乳纲', '食肉目', '猫科', '豹属', '豹'] },
    { id: 'human', name: '人', t: ['动物界', '脊索动物门', '哺乳纲', '灵长目', '人科', '人属', '智人'] },
    { id: 'dove', name: '家鸽', t: ['动物界', '脊索动物门', '鸟纲', '鸽形目', '鸠鸽科', '鸽属', '原鸽'] },
    { id: 'lychee', name: '荔枝', t: ['植物界', '被子植物门', '双子叶植物纲', '无患子目', '无患子科', '荔枝属', '荔枝'] },
    { id: 'longan', name: '龙眼', t: ['植物界', '被子植物门', '双子叶植物纲', '无患子目', '无患子科', '龙眼属', '龙眼'] }
  ];
  var ta = B.$('#ta'), tb = B.$('#tb');
  TAXA.forEach(function (x) { H('option', { value: x.id, text: x.name }, ta); H('option', { value: x.id, text: x.name }, tb); });
  ta.value = TAXA.some(function (x) { return x.id === st.a; }) ? st.a : 'tiger';
  tb.value = TAXA.some(function (x) { return x.id === st.b; }) ? st.b : 'cat';
  function lowestShared() {
    var A = TAXA.find(function (x) { return x.id === ta.value; }), Bb = TAXA.find(function (x) { return x.id === tb.value; });
    var k = -1;
    for (var i = 0; i < 7; i++) { if (A.t[i] === Bb.t[i]) k = i; else break; }
    return { A: A, B: Bb, k: k };
  }
  function renderTax() {
    var r = lowestShared(), tbl = B.$('#tax');
    tbl.innerHTML = '<tr><th>等级</th><th>' + r.A.name + '</th><th>' + r.B.name + '</th></tr>';
    for (var i = 0; i < 7; i++) {
      var tr = H('tr', { class: i <= r.k ? (i === r.k ? 'same lowest' : 'same') : '' }, tbl);
      H('td', { text: RANKS[i] }, tr); H('td', { text: r.A.t[i] }, tr); H('td', { text: r.B.t[i] }, tr);
    }
    var lowEl = B.$('#r-lowest'), sharedEl = B.$('#r-shared'), txt = B.$('#r-tax'), badge = B.$('#tax-badge');
    if (r.A.id === r.B.id) {
      lowEl.textContent = '同一种'; sharedEl.innerHTML = '7<small>级</small>'; badge.textContent = '是同一种生物';
      txt.textContent = '换一个生物乙，比一比吧。';
    } else if (r.k < 0) {
      lowEl.textContent = '没有'; sharedEl.innerHTML = '0<small>级</small>'; badge.textContent = '很远';
      txt.textContent = r.A.name + '和' + r.B.name + '连“界”都不同，一个是动物、一个是植物，亲缘关系很远。';
    } else {
      lowEl.textContent = '同' + RANKS[r.k]; sharedEl.innerHTML = (r.k + 1) + '<small>级</small>';
      badge.textContent = r.k >= 5 ? '很近' : r.k >= 3 ? '比较近' : '比较远';
      txt.textContent = r.A.name + '和' + r.B.name + '同在“' + r.A.t[r.k] + '”，到“' + RANKS[r.k + 1] + '”才分开。相同的等级越小，共同特征越多，亲缘关系越近。';
    }
    saveState();
  }
  ta.addEventListener('change', renderTax); tb.addEventListener('change', renderTax);

  renderWalk();
  renderTax();

  /* —— 小练习 —— */
  B.quiz([
      {
      level: 'base',
      title: '给“娃娃鱼”分类',
      desc: '在上面挑“大鲵”（娃娃鱼），自己一步步走完检索表，看看它到底是不是鱼。',
      check: function () {
        if (org.id !== 'sala') return { ok: false, msg: '先在上面挑“大鲵”。' };
        if (!finished) return { ok: false, msg: '还没走完，继续选下去。' };
        return { ok: true, msg: '大鲵幼体用鳃呼吸、成体用肺呼吸，是两栖动物，不是鱼。' };
      }
    },
      {
      level: 'base',
      title: '找出“同属不同种”的两种生物',
      desc: '在“从种到界”里换一换生物甲和乙，找到两种<b>属相同、种不同</b>的生物。',
      check: function () {
        var r = lowestShared();
        if (r.k === 5) return { ok: true, msg: r.A.name + '和' + r.B.name + '都是' + r.A.t[5] + '的，是这里亲缘关系最近的一对。' };
        if (r.k === 6) return { ok: false, msg: '这是同一种生物，换一个。' };
        return { ok: false, msg: '现在它们最小只到“同' + (RANKS[r.k] || '—') + '”。提示：看看猫科里的大猫。' };
      }
    },
      {
        level: 'base',
        title: '生物分类的最基本单位是？',
        desc: '七个等级里最小的那个。',
        options: ['种', '界', '门', '属'],
        answer: 0,
        hint: '同种生物亲缘关系最近。',
        explain: '<b>种</b>是最基本的分类单位。同种生物<b>亲缘关系最近、共同特征最多</b>。'
      },
      {
        level: 'base',
        title: '生物分类的七个等级从大到小依次是？',
        desc: '记住这个顺序。',
        options: ['界门纲目科属种', '种属科目纲门界', '界纲门目科属种', '门界纲目属科种'],
        answer: 0,
        hint: '从「界」开始往下分。',
        explain: '<b>界 → 门 → 纲 → 目 → 科 → 属 → 种</b>。等级越小，包含的生物越少，共同特征越多。'
      },
      {
        level: 'base',
        title: '被子植物分类的主要依据是？',
        desc: '看最能体现亲缘关系的部分。',
        options: ['花、果实和种子', '叶的形状', '植株的高矮', '生活的环境'],
        answer: 0,
        hint: '哪些器官在进化上最稳定？',
        explain: '被子植物以<b>花、果实和种子</b>作为主要分类依据，因为这些生殖器官受环境影响小，最能反映亲缘关系。'
      },
      {
      level: 'mid',
      title: '蘑菇为什么不算植物？',
      desc: '蘑菇长在地上、不会动，看着像植物。它被分到真菌，最主要的原因是：',
      options: ['它没有叶绿体，不能自己制造有机物', '它长得太矮了', '它喜欢长在阴暗潮湿的地方', '它的颜色不是绿色的'],
      answer: 0,
      explain: '植物有叶绿体，能进行光合作用；蘑菇靠分解现成的有机物生活，用孢子繁殖，是真菌。'
    },
      {
        level: 'mid',
        title: '在分类等级中，「科」与「属」相比，哪个包含的生物种类更多？',
        desc: '等级越高范围越大。',
        options: ['科', '属', '一样多', '无法比较'],
        answer: 0,
        hint: '科在属的上一级。',
        explain: '<b>科</b>的等级高于属，包含的生物<b>种类更多</b>，但它们之间的<b>共同特征更少、亲缘关系更远</b>。'
      },
      {
        level: 'mid',
        title: '使用检索表对生物进行分类时，基本方法是？',
        desc: '每次做二选一。',
        options: ['根据特征逐级二选一', '按名字首字母排序', '按个体大小排列', '按发现时间排列'],
        answer: 0,
        hint: '检索表每一步给几个选项？',
        explain: '检索表采用<b>逐级二分</b>的方法：每一步根据某个特征做<b>二选一</b>，一步步缩小范围，最终确定种类。'
      },
      {
        level: 'mid',
        title: '下列哪一组生物的亲缘关系最近？',
        desc: '看它们属于同一个什么等级。',
        options: ['同属的两种生物', '同科的两种生物', '同目的两种生物', '同纲的两种生物'],
        answer: 0,
        hint: '等级越小，关系越近。',
        explain: '<b>同属</b>的等级最小，所以亲缘关系<b>最近</b>、共同特征最多。同纲则关系最远。'
      },
      {
        level: 'mid',
        title: '建立自然保护区的主要目的是？',
        desc: '保护的核心对象是什么。',
        options: ['保护生物多样性', '发展旅游业', '增加木材产量', '开发矿产'],
        answer: 0,
        hint: '最有效的保护措施是什么？',
        explain: '保护<b>生物多样性</b>（尤其是保护生态系统和珍稀物种），<b>建立自然保护区是最有效的措施</b>。'
      },
      {
        level: 'trap',
        title: '生物多样性包括哪三个层次？',
        desc: '不只是物种多。',
        options: ['生物种类、基因、生态系统的多样性', '只有物种多样性', '动物、植物、微生物', '陆地、海洋、天空'],
        answer: 0,
        hint: '除了种类多，还有什么在变化？',
        explain: '包括<b>生物种类（物种）多样性、基因（遗传）多样性、生态系统多样性</b>三个层次。只答「物种多样性」会漏掉三分之二——<b>基因多样性是根本</b>。'
      }
    ]);
})();
