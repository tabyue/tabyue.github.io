/* 第 12 课 · 健康地生活 */
(function () {
  'use strict';
  var B = window.Bio;

  /* —— 心肺复苏按压节奏 —— */
  var taps = [], count = 0, rounds = 0, lastRate = 0, metro = null, hitTarget = false;
  var tapBtn = B.$('#cpr-tap');
  function rateNow() {
    if (taps.length < 4) return 0;
    var recent = taps.slice(-7), sum = 0;
    for (var i = 1; i < recent.length; i++) sum += recent[i] - recent[i - 1];
    return Math.round(60000 / (sum / (recent.length - 1)));
  }
  function drawCpr() {
    var r = lastRate;
    B.$('#cpr-rate').innerHTML = r ? r + '<small> 次/分</small>' : '—';
    B.$('#cpr-count').textContent = count + ' / 30';
    var title, text;
    if (!taps.length) { title = '还没开始'; text = '连续点按至少 4 次，就能算出你的按压频率。'; }
    else if (!r) { title = '继续按'; text = '再按几下，正在计算频率……'; }
    else if (r < 100) { title = '太慢了'; text = '现在约 ' + r + ' 次/分，<b>再快一点</b>。可以打开节拍提示跟着按。'; }
    else if (r > 120) { title = '太快了'; text = '现在约 ' + r + ' 次/分，<b>稍微慢一点</b>。太快时胸廓来不及充分回弹，心脏充血不足。'; }
    else { title = '节奏正好'; text = '约 ' + r + ' 次/分，在 100—120 次/分之间。每次按压后要让胸廓<b>完全回弹</b>。'; hitTarget = true; }
    if (count === 30) { title = '做 2 次人工呼吸'; text = '已按压 30 次。开放气道，进行 <b>2 次人工呼吸</b>，然后继续下一轮按压。已完成 ' + rounds + ' 轮。'; }
    B.$('#cpr-title').textContent = title;
    B.$('#cpr-text').innerHTML = text;
  }
  tapBtn.addEventListener('click', function () {
    var t = performance.now();
    if (taps.length && t - taps[taps.length - 1] > 2500) { taps = []; }
    if (count === 30) { count = 0; taps = []; }
    taps.push(t); if (taps.length > 20) taps.shift();
    count++; if (count === 30) rounds++;
    lastRate = rateNow();
    tapBtn.animate && tapBtn.animate([{ transform: 'scale(.96)' }, { transform: 'scale(1)' }], { duration: 160 });
    drawCpr();
  });
  B.$('#cpr-reset').addEventListener('click', function () { taps = []; count = 0; rounds = 0; lastRate = 0; drawCpr(); });
  B.$('#cpr-metro').addEventListener('click', function () {
    var b = B.$('#cpr-metro');
    if (metro) { clearInterval(metro); metro = null; b.setAttribute('aria-pressed', 'false'); b.textContent = '打开节拍提示'; tapBtn.style.outline = ''; return; }
    var on = false;
    metro = setInterval(function () { on = !on; tapBtn.style.outline = on ? '4px solid #f4c56b' : ''; }, 60000 / 110 / 2);
    b.setAttribute('aria-pressed', 'true'); b.textContent = '关闭节拍提示（110 次/分）';
  });
  window.addEventListener('pagehide', function () { if (metro) clearInterval(metro); });

  /* —— 预防传染病 —— */
  var WAYS = [['src', '控制传染源'], ['route', '切断传播途径'], ['host', '保护易感人群']];
  var wname = function (v) { return WAYS.filter(function (w) { return w[0] === v; })[0][1]; };
  var PREV = [['把流感病人隔离治疗', 'src'], ['给患狂犬病的狗进行处理', 'src'], ['教室开窗通风、定期消毒', 'route'], ['勤洗手、戴口罩', 'route'],
    ['清除积水、灭蚊，预防登革热', 'route'], ['按时接种疫苗', 'host'], ['加强体育锻炼，增强体质', 'host'], ['不喝生水，饭前便后洗手', 'route']];
  B.match('#pv-list', '#pv-score', B.shuffle(PREV).slice(0, 6), WAYS, function (it) { return it[0] + '：' + wname(it[1]) + '。'; });

  /* —— 三道防线 —— */
  var LINES = [['1', '第一道防线'], ['2', '第二道防线'], ['3', '第三道防线']];
  var DEF = [['皮肤阻挡病原体进入', '1'], ['呼吸道黏膜上的纤毛清扫异物', '1'], ['唾液、泪液中的溶菌酶杀菌', '2'],
    ['吞噬细胞吞噬病菌', '2'], ['淋巴细胞产生抗体', '3'], ['接种疫苗后获得免疫', '3']];
  B.match('#df-list', '#df-score', B.shuffle(DEF), LINES, function (it) { return it[0] + '：' + LINES[+it[1] - 1][1] + (it[1] === '3' ? '（特异性免疫）' : '（非特异性免疫）') + '。'; });

  drawCpr();

  B.quiz([
      {
      level: 'base',
      title: '按出正确的节奏',
      desc: '在“按压”按钮上连续点按，让频率保持在 <b>100—120 次/分</b>。',
      check: function () { return hitTarget ? { ok: true, msg: '这个节奏大约每秒按 2 次。真实按压深度为 5—6 厘米。' } : { ok: false, msg: lastRate ? '现在约 ' + lastRate + ' 次/分，还没进入 100—120 的范围。' : '先在“按压”按钮上连续点几下。' }; }
    },
      {
        level: 'base',
        title: '传染病流行的三个基本环节是？',
        desc: '缺一不可。',
        options: ['传染源、传播途径、易感人群', '病原体、传染源、药物', '细菌、病毒、真菌', '预防、治疗、康复'],
        answer: 0,
        hint: '切断任何一环都能阻止流行。',
        explain: '<b>传染源、传播途径、易感人群</b>。预防措施对应为<b>控制传染源、切断传播途径、保护易感人群</b>。'
      },
      {
        level: 'base',
        title: '引起传染病的生物叫？',
        desc: '注意和「传染源」区分。',
        options: ['病原体', '传染源', '易感人群', '抗体'],
        answer: 0,
        hint: '细菌、病毒、寄生虫统称什么？',
        explain: '<b>病原体</b>（细菌、病毒、寄生虫等）。<b>传染源</b>是指能散播病原体的<b>人或动物</b>，两个概念别混。'
      },
      {
        level: 'base',
        title: '人体的第一道防线是？',
        desc: '最外层的屏障。',
        options: ['皮肤和黏膜', '体液中的杀菌物质', '免疫器官和免疫细胞', '抗体'],
        answer: 0,
        hint: '哪一层直接挡在外面？',
        explain: '第一道：<b>皮肤和黏膜</b>；第二道：<b>体液中的杀菌物质和吞噬细胞</b>；第三道：<b>免疫器官和免疫细胞</b>（产生抗体）。'
      },
      {
      level: 'mid',
      title: '接种疫苗属于哪一类预防措施？',
      desc: '给儿童接种疫苗，在预防传染病的措施中属于：',
      options: ['保护易感人群', '控制传染源', '切断传播途径', '消灭病原体'],
      answer: 0,
      hint: '接种的是健康的人。',
      explain: '接种疫苗让易感人群获得免疫力，属于保护易感人群。'
    },
      {
      level: 'mid',
      title: '为什么得过麻疹的人一般不会再得？',
      desc: '这种免疫属于：',
      options: ['特异性免疫，体内产生了抵抗麻疹病毒的抗体', '非特异性免疫，皮肤变得更坚固', '第一道防线起作用', '第二道防线起作用'],
      answer: 0,
      hint: '这种免疫只对麻疹病毒有效。',
      explain: '患病后淋巴细胞产生抗体并形成记忆，属于第三道防线的特异性免疫。'
    },
      {
        level: 'mid',
        title: '接种疫苗属于哪种措施？',
        desc: '从三个环节判断。',
        options: ['保护易感人群', '控制传染源', '切断传播途径', '消灭病原体'],
        answer: 0,
        hint: '打疫苗是让人产生抵抗力。',
        explain: '接种疫苗使人产生相应<b>抗体</b>，属于<b>保护易感人群</b>。隔离病人是<b>控制传染源</b>，消毒、戴口罩是<b>切断传播途径</b>。'
      },
      {
        level: 'mid',
        title: '接种疫苗获得的免疫属于？',
        desc: '针对特定病原体。',
        options: ['特异性免疫', '非特异性免疫', '先天性免疫', '不属于免疫'],
        answer: 0,
        hint: '它只对某一种病原体有效。',
        explain: '<b>特异性免疫</b>（后天获得，只针对<b>特定</b>病原体）。皮肤黏膜、吞噬细胞的防御是<b>非特异性免疫</b>（生来就有，对多种病原体都起作用）。'
      },
      {
        level: 'mid',
        title: '发现有人煤气中毒，首先应该？',
        desc: '现场急救的第一步。',
        options: ['迅速打开门窗通风并把人移到空气新鲜处', '立即喂水', '原地等待救护车', '给他盖上被子'],
        answer: 0,
        hint: '先要脱离危险环境。',
        explain: '首先<b>通风并迅速转移到空气新鲜处</b>，同时拨打 120。急救题的共同原则是<b>先脱离危险源，再施救</b>。'
      },
      {
        level: 'mid',
        title: '关于吸烟酗酒，下列说法正确的是？',
        desc: '从危害角度判断。',
        options: ['都会损害健康，青少年更应远离', '少量吸烟无害', '饮酒能增强体质', '吸烟能提神所以有益'],
        answer: 0,
        hint: '烟草中的有害物质有哪些？',
        explain: '烟草含<b>尼古丁、焦油、一氧化碳</b>等有害物质，酗酒损害<b>肝脏和神经系统</b>。青少年身体仍在发育，危害更大。'
      },
      {
        level: 'trap',
        title: '「传染源」和「病原体」是一回事吗？',
        desc: '注意两者的定义。',
        options: ['不是，病原体是致病的生物，传染源是散播它的人或动物', '是一回事', '病原体是人，传染源是细菌', '两者都指病毒'],
        answer: 0,
        hint: '流感病人和流感病毒，哪个是传染源？',
        explain: '<b>病原体</b>是引起疾病的<b>生物</b>（如流感病毒）；<b>传染源</b>是<b>散播病原体的人或动物</b>（如流感病人）。这两个概念年年考、年年错。'
      }
    ]);
})();
