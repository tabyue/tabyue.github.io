/* 第 15 课 · 遗传与变异 */
(function () {
  'use strict';
  var B = window.Bio, S = B.svg, H = B.html;
  var st = B.getState();

  var TRAITS = {
    eyelid: { n: '眼皮', L: 'A', dom: '双眼皮', rec: '单眼皮', who: '孩子' },
    tongue: { n: '卷舌', L: 'B', dom: '能卷舌', rec: '不能卷舌', who: '孩子' },
    pea: { n: '豌豆茎', L: 'D', dom: '高茎', rec: '矮茎', who: '后代' }
  };
  var trait = TRAITS[st.tr] ? st.tr : 'eyelid';
  var dad = ['AA', 'Aa', 'aa'].indexOf(st.f) >= 0 ? st.f : 'Aa';
  var mom = ['AA', 'Aa', 'aa'].indexOf(st.m) >= 0 ? st.m : 'Aa';
  var sim = { dom: 0, rec: 0 };

  function letters(g) { var T = TRAITS[trait].L; return g.replace(/A/g, T).replace(/a/g, T.toLowerCase()); }
  function isDom(g) { return /A/.test(g); }
  function combine(x, y) { return (x === 'A' || y !== 'A') ? x + y : y + x; } // 大写在前
  function genoLabel(g) { return isDom(g) ? TRAITS[trait].dom : TRAITS[trait].rec; }

  var parentOpts = function () { return ['AA', 'Aa', 'aa'].map(function (g) { return { label: letters(g) + '（' + genoLabel(g) + '）', value: g }; }); };
  var dadChips, momChips;
  function makeParentChips() {
    dadChips = B.chips(B.$('#dad-chips'), parentOpts(), dad, function (v) { dad = v; render(); });
    momChips = B.chips(B.$('#mom-chips'), parentOpts(), mom, function (v) { mom = v; render(); });
  }
  B.chips(B.$('#trait-chips'), Object.keys(TRAITS).map(function (k) { return { label: TRAITS[k].n, value: k }; }), trait, function (v) { trait = v; makeParentChips(); sim = { dom: 0, rec: 0 }; render(); });
  makeParentChips();

  function frac(n) { return n === 0 ? '0' : n === 4 ? '1' : n === 2 ? '1/2' : n + '/4'; }

  function render() {
    var T = TRAITS[trait];
    var grid = B.$('#punnett'); grid.innerHTML = '';
    var dg = dad.split(''), mg = mom.split('');
    H('div', { class: 'corner', html: '卵细胞 ↓<br>精子 →' }, grid);
    dg.forEach(function (g) { H('div', { class: 'h', html: letters(g) + '<small>精子</small>' }, grid); });
    var kids = [];
    mg.forEach(function (m) {
      H('div', { class: 'h', html: letters(m) + '<small>卵细胞</small>' }, grid);
      dg.forEach(function (d) {
        var k = combine(d, m); kids.push(k);
        H('div', { class: 'cell' + (isDom(k) ? '' : ' rec'), html: letters(k) + '<small>' + genoLabel(k) + '</small>' }, grid);
      });
    });
    var nd = kids.filter(isDom).length, nr = 4 - nd;
    B.$('#dom-label').textContent = T.dom; B.$('#rec-label').textContent = T.rec;
    B.$('#sim-dom-label').textContent = T.dom; B.$('#sim-rec-label').textContent = T.rec;
    B.$('#r-dom').innerHTML = frac(nd) + '<small>（' + nd * 25 + '%）</small>';
    B.$('#r-rec').innerHTML = frac(nr) + '<small>（' + nr * 25 + '%）</small>';
    B.$('#bar-dom').style.width = nd * 25 + '%'; B.$('#bar-rec').style.width = nr * 25 + '%';
    var cnt = {}; kids.forEach(function (k) { cnt[k] = (cnt[k] || 0) + 1; });
    var order = ['AA', 'Aa', 'aa'].filter(function (k) { return cnt[k]; });
    var g = order.reduce(function (a, k) { var b = cnt[k]; while (b) { var t2 = a % b; a = b; b = t2; } return a; }, 0);
    B.$('#geno').textContent = '基因组成　' + order.map(letters).join(' : ') + ' = ' + order.map(function (k) { return cnt[k] / g; }).join(' : ');
    B.$('#g-badge').textContent = letters(dad) + ' × ' + letters(mom);
    var t, Ad = letters('A'), ad = letters('a');
    if (dad === 'Aa' && mom === 'Aa') t = '爸爸妈妈都是' + T.dom + '，但都带着一个隐性基因 ' + ad + '。如果两人都正好把 ' + ad + ' 传给孩子，孩子就是 ' + letters('aa') + '，表现为<b>' + T.rec + '</b>，机会是 1/4。';
    else if (dad === 'aa' && mom === 'aa') t = '两个人都是 ' + letters('aa') + '，只能传下去 ' + ad + '，孩子一定是' + T.rec + '。';
    else if (dad === 'AA' || mom === 'AA') t = '有一方是 ' + letters('AA') + '，传给孩子的一定是 ' + Ad + '，所以孩子一定是' + T.dom + '（但可能带着隐性基因）。';
    else t = '一方是 ' + letters('Aa') + '，另一方是 ' + letters('aa') + '：孩子是' + T.dom + '还是' + T.rec + '，各占一半。';
    B.$('#g-text').innerHTML = t;
    renderSim();
    B.setState({ tr: trait, f: dad, m: mom });
  }
  function birth() {
    var d = dad[Math.random() < 0.5 ? 0 : 1], m = mom[Math.random() < 0.5 ? 0 : 1];
    if (isDom(d + m)) sim.dom++; else sim.rec++;
  }
  function renderSim() {
    B.$('#s-dom').innerHTML = sim.dom + '<small>个</small>';
    B.$('#s-rec').innerHTML = sim.rec + '<small>个</small>';
    var n = sim.dom + sim.rec;
    B.$('#sim-note').textContent = n ? '一共生了 ' + n + ' 个，' + TRAITS[trait].rec + '占 ' + Math.round(sim.rec / n * 100) + '%。生得越多，就越接近上面算出的概率。' : '还没开始。';
  }
  B.$('#sim1').addEventListener('click', function () { birth(); renderSim(); });
  B.$('#sim100').addEventListener('click', function () { for (var i = 0; i < 100; i++) birth(); renderSim(); });
  B.$('#simreset').addEventListener('click', function () { sim = { dom: 0, rec: 0 }; renderSim(); });

  /* —— 性别决定 —— */
  var sexSvg = B.$('#sex');
  var boys = 0, girls = 0, last = null;
  function drawSex() {
    sexSvg.innerHTML = '';
    S('rect', { x: 0, y: 0, width: 400, height: 220, rx: 14, fill: '#fbfcf8' }, sexSvg);
    function pill(x, y, t, sub, fill, stroke, hi) {
      var g = S('g', { transform: 'translate(' + x + ',' + y + ')' }, sexSvg);
      S('rect', { x: -38, y: -17, width: 76, height: 34, rx: 12, fill: fill, stroke: hi ? '#b97342' : stroke, 'stroke-width': hi ? 2.6 : 1.4 }, g);
      S('text', { y: -1, 'font-size': 13, 'font-weight': 700, 'text-anchor': 'middle', fill: '#2f4a3f', text: t }, g);
      S('text', { y: 12, 'font-size': 9, 'text-anchor': 'middle', fill: '#6b7d64', text: sub }, g);
    }
    function line(x1, y1, x2, y2, hi) { S('path', { d: 'M' + x1 + ' ' + y1 + 'L' + x2 + ' ' + y2, stroke: hi ? '#b97342' : '#c9d6c1', 'stroke-width': hi ? 2.4 : 1.4 }, sexSvg); }
    var sp = last ? last.sperm : null;
    // 连线
    line(110, 50, 70, 104, sp === 'X'); line(110, 50, 160, 104, sp === 'Y');
    line(290, 50, 290, 104, !!last);
    line(70, 121, 130, 176, sp === 'X'); line(290, 121, 130, 176, sp === 'X');
    line(160, 121, 270, 176, sp === 'Y'); line(290, 121, 270, 176, sp === 'Y');
    pill(110, 34, '爸爸', '22 对 + XY', '#e7eef6', '#9fb3cc', false);
    pill(290, 34, '妈妈', '22 对 + XX', '#f6e8ee', '#d0a7b8', false);
    pill(70, 112, '精子 X', '22 条 + X', '#fff', '#c9d6c1', sp === 'X');
    pill(160, 112, '精子 Y', '22 条 + Y', '#fff', '#c9d6c1', sp === 'Y');
    pill(290, 112, '卵细胞 X', '22 条 + X', '#fff', '#c9d6c1', !!last);
    pill(130, 192, '女孩 XX', '22 对 + XX', '#f6e8ee', '#d0a7b8', sp === 'X');
    pill(270, 192, '男孩 XY', '22 对 + XY', '#e7eef6', '#9fb3cc', sp === 'Y');
    S('text', { x: 200, y: 84, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#8b9784', text: '两种精子数量相等' }, sexSvg);
    S('text', { x: 200, y: 160, 'font-size': 9.5, 'text-anchor': 'middle', fill: '#8b9784', text: '受精' }, sexSvg);
  }
  function oneFamily() { var s = Math.random() < 0.5 ? 'X' : 'Y'; if (s === 'X') girls++; else boys++; last = { sperm: s }; }
  function renderSex(msg) {
    drawSex();
    B.$('#s-boy').innerHTML = boys + '<small>个</small>'; B.$('#s-girl').innerHTML = girls + '<small>个</small>';
    if (msg) B.$('#sex-text').innerHTML = msg;
  }
  B.$('#sex1').addEventListener('click', function () {
    oneFamily();
    renderSex(last.sperm === 'X' ? '这次是<b>含 X 的精子</b>和卵细胞结合，受精卵是 XX，发育成<b>女孩</b>。' : '这次是<b>含 Y 的精子</b>和卵细胞结合，受精卵是 XY，发育成<b>男孩</b>。');
  });
  B.$('#sex100').addEventListener('click', function () {
    for (var i = 0; i < 100; i++) oneFamily();
    var n = boys + girls;
    renderSex('一共 ' + n + ' 个孩子，男孩占 ' + Math.round(boys / n * 100) + '%。生男生女取决于<b>哪种精子</b>和卵细胞结合，机会均等，所以人群中男女比例大约是 1 : 1。');
  });

  render();
  renderSex();

  B.quiz([
      {
      level: 'base',
      title: '双眼皮的爸妈，生出单眼皮的孩子',
      desc: '性状选“眼皮”，给爸爸妈妈选基因组成：两个人<b>都是双眼皮</b>，却<b>有可能</b>生出单眼皮的孩子。',
      check: function () {
        if (trait !== 'eyelid') return { ok: false, msg: '先把性状换成“眼皮”。' };
        if (dad === 'Aa' && mom === 'Aa') return { ok: true, msg: '爸妈都是 Aa：看起来是双眼皮，又都带着隐性基因 a，孩子有 1/4 的机会是 aa 单眼皮。' };
        if (!isDom(dad) || !isDom(mom)) return { ok: false, msg: '题目说爸妈都是双眼皮，aa 是单眼皮哦。' };
        return { ok: false, msg: '有一方是 AA，一定会传 A 给孩子，孩子就一定是双眼皮。' };
      }
    },
      {
      level: 'base',
      title: '让隐性性状正好占一半',
      desc: '换一换爸爸妈妈的基因组成，让孩子是<b>隐性性状</b>的概率正好是 <b>1/2</b>。',
      check: function () {
        if ((dad === 'Aa' && mom === 'aa') || (dad === 'aa' && mom === 'Aa')) return { ok: true, msg: letters('Aa') + ' × ' + letters('aa') + '：一方传 ' + letters('A') + ' 或 ' + letters('a') + ' 各一半，另一方只能传 ' + letters('a') + '，所以显性、隐性各占 1/2。' };
        return { ok: false, msg: '现在隐性性状的概率不是 1/2。提示：一方是“杂合”，另一方是“隐性纯合”。' };
      }
    },
      {
        level: 'base',
        title: '遗传物质的主要载体是？',
        desc: '细胞核里的结构。',
        options: ['染色体', '细胞膜', '线粒体', '细胞壁'],
        answer: 0,
        hint: 'DNA 主要在哪里？',
        explain: '<b>染色体</b>是遗传物质的主要载体，由 <b>DNA 和蛋白质</b>组成。<b>基因</b>是 DNA 上有遗传效应的片段。'
      },
      {
        level: 'base',
        title: '人的体细胞中染色体有多少条？',
        desc: '成对存在。',
        options: ['23 对（46 条）', '46 对', '23 条', '22 对'],
        answer: 0,
        hint: '生殖细胞里是多少？',
        explain: '体细胞中有 <b>23 对（46 条）</b>染色体，成对存在；<b>精子和卵细胞中只有 23 条</b>（每对各取一条）。'
      },
      {
        level: 'base',
        title: '决定人的性别的染色体是？',
        desc: '第 23 对。',
        options: ['性染色体 X 和 Y', '常染色体', '所有染色体', '线粒体'],
        answer: 0,
        hint: '男性是 XY 还是 XX？',
        explain: '第 23 对为<b>性染色体</b>：女性 <b>XX</b>，男性 <b>XY</b>。<b>生男生女取决于父亲提供的是 X 还是 Y 精子</b>。'
      },
      {
      level: 'mid',
      title: '生男生女由什么决定？',
      desc: '一个孩子是男孩还是女孩，主要取决于：',
      options: ['爸爸的精子里含 X 还是 Y', '妈妈的卵细胞里含 X 还是 Y', '妈妈怀孕时吃了什么', '怀孕的季节'],
      answer: 0,
      hint: '妈妈的卵细胞只有一种，都含 X。',
      explain: '卵细胞都含 X；精子有含 X 和含 Y 两种。含 Y 的精子和卵细胞结合，就是男孩。'
    },
      {
        level: 'mid',
        title: '一对夫妇生男孩的概率是多少？',
        desc: '从精子的两种类型想。',
        options: ['50%', '100%', '25%', '取决于母亲'],
        answer: 0,
        hint: '含 X 和含 Y 的精子各占一半。',
        explain: '父亲产生含 <b>X</b> 和含 <b>Y</b> 的精子各约<b>一半</b>，所以生男生女概率各为 <b>50%</b>，且<b>每一胎都是独立</b>的。'
      },
      {
        level: 'mid',
        title: '显性基因和隐性基因都存在时，表现出来的性状是？',
        desc: '显性会掩盖隐性。',
        options: ['显性性状', '隐性性状', '两者的中间型', '随机表现'],
        answer: 0,
        hint: 'Aa 表现为什么性状？',
        explain: '基因组成为 <b>Aa</b> 时表现<b>显性性状</b>。只有 <b>aa</b>（成对的隐性基因）才表现隐性性状。'
      },
      {
        level: 'mid',
        title: '下列变异中属于可遗传变异的是？',
        desc: '看变异的根源在哪。',
        options: ['由遗传物质改变引起的变异', '只因环境影响产生的变异', '后天锻炼出的肌肉', '晒黑的皮肤'],
        answer: 0,
        hint: '遗传物质变了没有？',
        explain: '由<b>遗传物质改变</b>引起的变异<b>可以遗传</b>；仅由<b>环境</b>引起、遗传物质没变的变异<b>不能遗传</b>（如晒黑、后天锻炼）。'
      },
      {
        level: 'mid',
        title: '转基因技术培育抗虫棉，利用的原理是？',
        desc: '把别的基因转进来。',
        options: ['把抗虫基因转入棉花细胞', '让棉花多晒太阳', '给棉花打农药', '选择个大的种子'],
        answer: 0,
        hint: '性状由什么控制？',
        explain: '把<b>抗虫基因</b>转入棉花细胞并表达，使其具有抗虫性状。这说明<b>基因控制生物的性状</b>。'
      },
      {
        level: 'trap',
        title: '一对夫妇已生了三个女孩，第四胎生男孩的概率是多少？',
        desc: '每一胎独立。',
        options: ['仍然是 50%', '100%', '75%', '25%'],
        answer: 0,
        hint: '前面的结果会影响后面吗？',
        explain: '仍是 <b>50%</b>。每一次生育都是<b>独立事件</b>，与之前生过几个女孩<b>没有任何关系</b>。这和抛硬币连出正面后再抛一次是同一个道理。'
      }
    ]);
})();
