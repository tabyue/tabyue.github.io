/* 历史互动馆 · 大题怎么答 */
(function () {
  'use strict';
  var L = window.Lab, H = L.html;

  /* ========== 六种问法 ========== */
  var TYPES = {
    sum: {
      name: '概括题', ask: '“根据材料，概括……”',
      steps: ['看清设问：概括的是“特点”“措施”还是“变化”。', '圈出材料里的关键词，一句话往往就是一个点。', '用自己的话缩短，分①②③写，不照抄整句。'],
      demo: '材料：“（秦始皇）一法度衡石丈尺，车同轨，书同文字。”——《史记》<br>问：概括秦始皇巩固统一的措施。<br>答：①统一法律；②统一度量衡；③统一车轨；④统一文字。'
    },
    why: {
      name: '原因题', ask: '“分析……的原因”',
      steps: ['先从材料里找直接原因。', '再结合所学补根本原因，常见角度：政治、经济、思想文化、外部因素、人民群众。', '根本原因往往从“经济”或“制度”找。'],
      demo: '问：清朝实行闭关政策的原因。<br>答：①根本原因：自给自足的自然经济占主导；②担心国家领土主权受西方殖民者侵犯；③怕沿海人民和外国人交往危及统治。'
    },
    effect: {
      name: '影响 / 意义题', ask: '“说明……的影响（意义）”',
      steps: ['分对象写：对本国、对世界、对后世。', '问“意义”只写积极的；问“影响”还要想想消极的一面。', '常用词：推动、促进、标志、奠定基础、打击、阻碍。'],
      demo: '问：新航路开辟的影响。<br>答：①积极：世界开始连成一个整体，促进了欧洲资本主义的发展；②消极：开始了殖民掠夺，给亚非拉人民带来深重灾难。'
    },
    fact: {
      name: '用史实说明', ask: '“用史实说明……”“举例说明……”',
      steps: ['史实 = 具体的时间 + 人物/国家 + 事件。', '一条史实对应一个观点，写两三条。', '只写“国家很重视”“发展很快”这类空话不给分。'],
      demo: '问：用史实说明汉武帝巩固了大一统。<br>答：①政治：颁布推恩令，削弱诸侯王；②思想：罢黜百家，尊崇儒术；③经济：统一铸造五铢钱，盐铁官营。'
    },
    compare: {
      name: '比较题', ask: '“比较……的异同”',
      steps: ['先写相同点（目的、性质、结果）。', '不同点要“对着写”：前者……，后者……。', '最后可以一句话点出差异的原因。'],
      demo: '问：比较分封制和郡县制。<br>答：相同：都是管理地方的制度。不同：分封制下诸侯世袭，郡县制下官员由皇帝任免、不世袭；前者容易形成割据，后者加强了中央集权。'
    },
    essay: {
      name: '历史小论文', ask: '“围绕……自拟一个观点，并加以阐述”（常见 8 分）',
      steps: ['观点：一句话，正确、明确，不要写成问句或口号。', '论证：两三条史实，最好来自不同时期或不同国家，每条都要说清和观点的关系。', '结论：一句话回扣观点，可以联系今天。', '常见给分思路：观点 2 分、史实论证 4 分、结论与条理 2 分。'],
      demo: '观点：改革是推动社会进步的重要动力。<br>论证：①商鞅变法使秦国富强，为统一奠定基础；②北魏孝文帝改革促进了民族交融；③1978 年起改革开放，我国经济快速发展。<br>结论：顺应时代潮流的改革能推动社会进步。'
    }
  };
  var tKey = 'essay';
  function showType() {
    var t = TYPES[tKey], box = L.$('#type-box');
    box.innerHTML = '<p class="lead" style="margin:0 0 8px"><b>' + t.name + '</b>　常见问法：' + t.ask + '</p>' +
      '<ol class="method-steps">' + t.steps.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>' +
      '<div class="essay-model"><b>示范</b><br>' + t.demo + '</div>';
  }
  L.chips(L.$('#type-chips'), Object.keys(TYPES).map(function (k) { return { label: TYPES[k].name, value: k }; }), tKey, function (v) { tKey = v; showType(); });
  showType();

  /* ========== 小论文搭建器 ========== */
  var VIEWS = [
    { t: '改革是推动社会进步的重要动力。', ok: 2, why: '观点正确、明确，能统领全文。' },
    { t: '历史上的改革都成功了。', ok: 0, why: '说得太绝对，戊戌变法就失败了，观点错误不给分。' },
    { t: '古代有很多改革。', ok: 1, why: '只是陈述现象，没有表明态度，不算一个完整的观点，最多给 1 分。' }
  ];
  var FACTS = [
    { t: '战国时商鞅变法，奖励耕战、推行县制，使秦国逐渐富强。', ok: true },
    { t: '北魏孝文帝迁都洛阳、推行汉化措施，促进了民族交融。', ok: true },
    { t: '1868 年起日本明治维新，日本走上发展资本主义的道路。', ok: true },
    { t: '1978 年中共十一届三中全会作出改革开放的决策，我国经济快速发展。', ok: true },
    { t: '秦始皇修筑长城，抵御匈奴。', ok: false, why: '这是巩固统一的措施，不是改革，和观点无关。' },
    { t: '明朝郑和七次下西洋。', ok: false, why: '是对外交往的史实，证明不了“改革推动进步”。' },
    { t: '赤壁之战奠定三国鼎立的基础。', ok: false, why: '是战争，和改革无关。' }
  ];
  var ENDS = [
    { t: '历史证明，顺应时代潮流的改革能推动社会进步；今天我们也要坚定不移地深化改革。', ok: 2, why: '回扣观点并有所升华。' },
    { t: '以上就是几次改革。', ok: 0, why: '只是收尾，没有回扣观点，不给分。' },
    { t: '所以改革非常重要。', ok: 1, why: '回扣了观点，但太单薄，一般只给 1 分。' }
  ];
  var pickV = -1, pickF = [], pickE = -1;
  function opt(container, list, isMulti, getOn, onClick) {
    container.innerHTML = '';
    list.forEach(function (x, i) {
      var lab = H('label', { class: 'essay-point' + (getOn(i) ? ' on' : '') }, container);
      var inp = H('input', { type: isMulti ? 'checkbox' : 'radio', name: container.id }, lab);
      inp.checked = getOn(i);
      H('span', { text: x.t }, lab);
      inp.addEventListener('change', function () { onClick(i); });
    });
  }
  function drawPick() {
    opt(L.$('#pick-view'), VIEWS, false, function (i) { return pickV === i; }, function (i) { pickV = i; drawPick(); });
    opt(L.$('#pick-facts'), FACTS, true, function (i) { return pickF.indexOf(i) >= 0; }, function (i) {
      var k = pickF.indexOf(i); if (k >= 0) pickF.splice(k, 1); else pickF.push(i); drawPick();
    });
    opt(L.$('#pick-end'), ENDS, false, function (i) { return pickE === i; }, function (i) { pickE = i; drawPick(); });
  }
  function build() {
    var out = L.$('#build-out');
    if (pickV < 0 || pickE < 0 || !pickF.length) { out.innerHTML = '<p class="essay-warn" style="margin-top:12px">三步都要选：一个观点、至少一条史实、一句结论。</p>'; return; }
    var v = VIEWS[pickV], e = ENDS[pickE];
    var good = pickF.filter(function (i) { return FACTS[i].ok; }), bad = pickF.filter(function (i) { return !FACTS[i].ok; });
    var factScore = Math.min(4, good.length * 2) - (bad.length ? 1 : 0);
    if (factScore < 0) factScore = 0;
    var total = v.ok + factScore + e.ok;
    var txt = '<b>观点：</b>' + v.t + '<br><b>论证：</b>' + pickF.slice().sort(function (a, b) { return a - b; }).map(function (i, k) { return '①②③④⑤⑥⑦'[k] + FACTS[i].t; }).join('') + '<br><b>结论：</b>' + e.t;
    var notes = ['观点 ' + v.ok + ' / 2 分：' + v.why];
    notes.push('史实论证 ' + factScore + ' / 4 分：用对了 ' + good.length + ' 条' + (good.length < 2 ? '，至少要两条才能拿满' : '') + (bad.length ? '；' + bad.map(function (i) { return '“' + FACTS[i].t.slice(0, 10) + '…”' + FACTS[i].why; }).join('；') + '，扣 1 分' : ''));
    notes.push('结论 ' + e.ok + ' / 2 分：' + e.why);
    out.innerHTML = '<div class="essay-model" style="margin-top:14px">' + txt + '</div>' +
      '<ul class="fact-list" style="margin-top:10px">' + notes.map(function (n) { return '<li>' + n + '</li>'; }).join('') + '</ul>' +
      '<div class="essay-sum">这篇小论文约得 <b>' + total + '</b> / 8 分' + (total === 8 ? '　观点、史实、结论都到位了。' : '　照着上面的提示改一改再试。') + '</div>';
  }
  L.$('#build-go').addEventListener('click', build);
  L.$('#build-reset').addEventListener('click', function () { pickV = -1; pickF = []; pickE = -1; drawPick(); L.$('#build-out').innerHTML = ''; });
  drawPick();
})();
