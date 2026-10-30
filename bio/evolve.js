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
      level: 'base',
      title: '让深色桦尺蛾超过一半',
      desc: '从开始状态出发，选择合适的环境，让<b>深色</b>个体超过 50%。',
      check: function () { return p > 0.5 ? { ok: true, msg: '在被熏黑的树干上，深色个体存活和繁殖得更多，比例一代代升高。' } : { ok: false, msg: '现在深色只占 ' + Math.round(p * 100) + '%。想想什么环境对深色个体有利。' }; }
    },
      {
      level: 'base',
      title: '把植物的进化顺序排完',
      desc: '在“按出现的先后排一排”里选“植物”，按顺序点完。',
      check: function () { return od === 'plant' && got.length === SEQ.plant.length ? { ok: true, msg: '藻类 → 苔藓 → 蕨类 → 裸子植物 → 被子植物。' } : { ok: false, msg: '选“植物”，从最早出现的开始点完五个。' }; }
    },
      {
        level: 'base',
        title: '研究生物进化最直接、最重要的证据是？',
        desc: '保存在岩层里。',
        options: ['化石', '细胞结构', '生活习性', '个体大小'],
        answer: 0,
        hint: '能看到古代生物的遗体遗迹。',
        explain: '<b>化石</b>是最直接、最重要的证据。<b>越古老的地层中化石越简单、低等</b>，越晚近的地层中越复杂、高等。'
      },
      {
        level: 'base',
        title: '达尔文提出的进化学说核心是？',
        desc: '四个字。',
        options: ['自然选择', '用进废退', '神创论', '拉马克学说'],
        answer: 0,
        hint: '适者生存，不适者被淘汰。',
        explain: '<b>自然选择</b>学说：生物普遍存在<b>变异</b>，通过<b>生存斗争</b>实现<b>适者生存、不适者被淘汰</b>。'
      },
      {
        level: 'base',
        title: '生物进化的总体趋势是？',
        desc: '三个「由……到……」。',
        options: ['由简单到复杂、由低等到高等、由水生到陆生', '由复杂到简单', '由陆生到水生', '没有规律'],
        answer: 0,
        hint: '从化石的分布能看出什么？',
        explain: '<b>由简单到复杂、由低等到高等、由水生到陆生</b>。这是从化石证据中总结出的总体趋势。'
      },
      {
      level: 'mid',
      title: '保护生物多样性最有效的措施',
      desc: '下面哪一项是保护生物多样性最有效的措施？',
      options: ['建立自然保护区', '把动物都迁到动物园', '禁止一切开发利用', '大量引进外来物种'],
      answer: 0,
      hint: '保护生物的同时，也要保护它们生活的环境。',
      explain: '建立自然保护区属于就地保护，能保护生物和它们的栖息地。'
    },
      {
        level: 'mid',
        title: '长颈鹿的长颈是怎么形成的？按达尔文的观点解释。',
        desc: '注意是选择而不是锻炼。',
        options: ['变异本来就存在，长颈个体更易生存而被保留', '因为经常伸长脖子吃树叶', '因为需要长颈所以长出来', '因为基因突然全部改变'],
        answer: 0,
        hint: '是先有变异还是先有需要？',
        explain: '<b>变异先存在</b>（有长颈也有短颈），食物短缺时<b>长颈个体更易获得食物而生存繁殖</b>，长颈基因逐代积累。<b>不是因为「经常伸脖子」</b>——那是拉马克的「用进废退」观点，不被现代生物学接受。'
      },
      {
        level: 'mid',
        title: '滥用抗生素会导致细菌耐药性增强，原因是？',
        desc: '抗生素起了什么作用。',
        options: ['抗生素对细菌的变异进行了选择', '抗生素使细菌产生了耐药基因', '细菌主动学会了抵抗', '细菌数量变多了'],
        answer: 0,
        hint: '耐药的变异是本来就有还是被创造的？',
        explain: '细菌中本来就<b>存在耐药性变异</b>，抗生素起<b>选择作用</b>：不耐药的被杀死，<b>耐药的存活并大量繁殖</b>。<b>抗生素是「选择者」而不是「创造者」</b>。'
      },
      {
        level: 'mid',
        title: '保护生物多样性最有效的措施是？',
        desc: '保护它们的家。',
        options: ['建立自然保护区', '把动物关进动物园', '进行人工繁殖', '制定法律'],
        answer: 0,
        hint: '就地保护和迁地保护哪个更根本？',
        explain: '<b>建立自然保护区（就地保护）</b>最有效，因为它保护了<b>物种及其赖以生存的栖息环境</b>。动物园、植物园属于<b>迁地保护</b>，是补充手段。'
      },
      {
        level: 'mid',
        title: '外来物种入侵会造成什么后果？',
        desc: '想想本地物种的处境。',
        options: ['威胁本地物种，破坏生态平衡', '增加生物多样性', '对生态没有影响', '一定能提高产量'],
        answer: 0,
        hint: '入侵种往往缺少天敌。',
        explain: '外来入侵种常<b>缺少天敌</b>而大量繁殖，<b>挤占本地物种的生存空间、破坏生态平衡</b>，反而<b>降低</b>生物多样性（如水葫芦、薇甘菊）。'
      },
      {
        level: 'trap',
        title: '「生物为了适应环境而主动产生有利变异」，这种说法对吗？',
        desc: '变异有没有方向？',
        options: ['不对，变异是不定向的，环境只起选择作用', '完全正确', '对，生物能按需变异', '对，但只有植物可以'],
        answer: 0,
        hint: '是先有变异还是先有环境压力？',
        explain: '<b>变异是不定向的</b>（随机产生，有利有害），<b>环境只起选择作用</b>，把有利变异保留下来。生物<b>不能「为了需要」主动产生</b>某种变异——这是进化论最核心也最容易说错的一点。'
      }
    ]);
})();
