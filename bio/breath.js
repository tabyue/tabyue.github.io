/* 第 9 课 · 人体的呼吸与废物排出 */
(function () {
  'use strict';
  var B = window.Bio, S = B.svg, H = B.html;
  var st = B.getState();
  var dia = Math.max(0, Math.min(100, parseInt(st.d, 10)));
  if (isNaN(dia)) dia = 70;

  /* —— 钟罩模型 —— */
  function inhale() { return dia >= 50; }
  function drawBell() {
    var svg = B.$('#br-svg'); svg.innerHTML = '';
    var down = dia / 100, baseY = 168 + down * 34, r = 24 + down * 16;
    S('rect', { x: 0, y: 0, width: 400, height: 230, rx: 12, fill: '#f6f8f2' }, svg);
    // 钟罩
    S('path', { d: 'M120 168V70Q120 34 160 30H240Q280 34 280 70V168', fill: '#ffffff', 'fill-opacity': .6, stroke: '#9fb39a', 'stroke-width': 3 }, svg);
    // 气管和支气管（玻璃管）
    S('path', { d: 'M200 6V74M200 74L172 100M200 74L228 100', stroke: '#8a9a82', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, svg);
    // 气球（肺）
    [172, 228].forEach(function (cx, i) {
      S('ellipse', { cx: cx + (i ? 1 : -1) * down * 4, cy: 100 + r, rx: r * 0.8, ry: r, fill: '#f2b8a8', stroke: '#c9796a', 'stroke-width': 1.6 }, svg);
    });
    // 橡皮膜（膈）
    S('path', { d: 'M120 168Q200 ' + (baseY + (baseY - 168)) + ' 280 168', fill: 'none', stroke: '#b98a5a', 'stroke-width': 4 }, svg);
    S('path', { d: 'M200 ' + baseY + 'V' + (baseY + 18), stroke: '#7a4520', 'stroke-width': 2.4 }, svg);
    S('circle', { cx: 200, cy: baseY + 22, r: 5, fill: '#7a4520' }, svg);
    // 气流箭头
    var into = inhale();
    S('path', { d: into ? 'M222 4L208 16M208 16l2 -9M208 16l9 -1' : 'M208 16L222 4M222 4l-2 9M222 4l-9 1', stroke: into ? '#2f7f97' : '#b0663a', 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' }, svg);
    S('text', { x: 232, y: 18, 'font-size': 12, 'font-weight': 700, fill: into ? '#2f7f97' : '#b0663a', text: into ? '空气进入' : '气体排出' }, svg);
    [['钟罩 = 胸廓', 300, 70], ['气球 = 肺', 300, 120], ['橡皮膜 = 膈', 300, 168]].forEach(function (t) { S('text', { x: t[1], y: t[2], 'font-size': 11.5, fill: '#5d6f63', text: t[0] }, svg); });
    S('text', { x: 16, y: 26, 'font-size': 11, fill: '#6f8268', text: '玻璃管 = 气管、支气管' }, svg);
    // 读数
    B.$('#br-out').textContent = dia >= 50 ? '向下拉' : '回升';
    B.$('#br-title').textContent = into ? '吸气' : '呼气';
    B.$('#br-badge').textContent = into ? '膈肌收缩' : '膈肌舒张';
    var rows = into
      ? [['膈肌', '收缩，膈顶部<b>下降</b>'], ['胸廓', '上下径增大，容积<b>扩大</b>'], ['肺', '随之<b>扩张</b>'], ['肺内气压', '<b>低于</b>外界大气压，气体进入肺']]
      : [['膈肌', '舒张，膈顶部<b>回升</b>'], ['胸廓', '上下径缩小，容积<b>缩小</b>'], ['肺', '随之<b>回缩</b>'], ['肺内气压', '<b>高于</b>外界大气压，气体排出']];
    B.$('#br-list').innerHTML = rows.map(function (x) { return '<li><b>' + x[0] + '</b><span>' + x[1] + '</span></li>'; }).join('');
    B.setState({ d: dia });
  }
  var rg = B.$('#br-range'); rg.value = dia;
  B.bindRange(rg, function (v) { dia = v; drawBell(); });

  /* —— 气体成分 —— */
  var GAS = [['氮气', 78, 78], ['氧气', 21, 16], ['二氧化碳', 0.03, 4], ['水', 0.07, 1.1]];
  var box = B.$('#gas-bars');
  GAS.forEach(function (g) {
    var row = H('div', { style: 'margin:8px 0' }, box);
    H('div', { html: '<b style="font-size:14.5px">' + g[0] + '</b>', style: 'margin-bottom:4px' }, row);
    [['吸入', g[1], '#7fb3c4'], ['呼出', g[2], '#c58a4f']].forEach(function (x) {
      var line = H('div', { style: 'display:grid;grid-template-columns:36px 1fr 52px;gap:8px;align-items:center;font-size:13.5px;color:#5d6f63;margin:2px 0' }, row);
      H('span', { text: x[0] }, line);
      var tr = H('div', { style: 'height:10px;background:#f0f3eb;border-radius:5px;overflow:hidden' }, line);
      H('div', { style: 'height:100%;border-radius:5px;background:' + x[2] + ';width:' + Math.max(1.2, x[1] / 78 * 100) + '%' }, tr);
      H('em', { text: x[1] + '%', style: 'font-style:normal;text-align:right;font-variant-numeric:tabular-nums' }, line);
    });
  });

  /* —— 尿的形成 —— */
  var SUB = ['血细胞', '大分子蛋白质', '葡萄糖', '水', '无机盐', '尿素'];
  var STA = {
    blood: { n: '血浆（进入肾小球前）', has: [1, 1, 1, 1, 1, 1], t: '血液从入球小动脉流进<b>肾小球</b>，里面什么都有。' },
    pri: { n: '原尿（肾小囊里）', has: [0, 0, 1, 1, 1, 1], t: '经过<b>肾小球的过滤</b>：血细胞和大分子蛋白质过不去，其余的水、葡萄糖、无机盐、尿素等进入肾小囊，形成原尿。每天约 <b>180 升</b>。' },
    uri: { n: '尿液（流出肾小管）', has: [0, 0, 0, 1, 1, 1], t: '经过<b>肾小管的重吸收</b>：全部葡萄糖、大部分水和部分无机盐被送回血液，剩下的水、无机盐和尿素形成尿液。每天只有约 <b>1.5 升</b>，尿素浓度明显升高。' }
  };
  var ur = STA[st.u] ? st.u : 'pri';
  B.chips(B.$('#ur-chips'), [{ label: '① 血浆', value: 'blood' }, { label: '② 原尿', value: 'pri' }, { label: '③ 尿液', value: 'uri' }], ur, function (v) { ur = v; drawUr(); });
  function drawUr() {
    var h = '<thead><tr><th>物质</th>' + ['blood', 'pri', 'uri'].map(function (k) { return '<th' + (k === ur ? ' style="color:var(--green)"' : '') + '>' + STA[k].n.replace(/（.*）/, '') + '</th>'; }).join('') + '</tr></thead><tbody>';
    SUB.forEach(function (s, i) {
      h += '<tr><td>' + s + '</td>' + ['blood', 'pri', 'uri'].map(function (k) { var y = STA[k].has[i]; return '<td style="text-align:center;' + (k === ur ? 'background:#ecf4e6;' : '') + 'color:' + (y ? '#2f6a4a' : '#b0a494') + '">' + (y ? '有' : '—') + '</td>'; }).join('') + '</tr>';
    });
    B.$('#ur-table').innerHTML = h + '</tbody>';
    B.$('#ur-text').innerHTML = '<b>' + STA[ur].n + '</b>　' + STA[ur].t;
  }

  drawBell(); drawUr();

  B.quiz([
      {
      level: 'base',
      title: '让模型处于“吸气”状态',
      desc: '拖动滑块拉动橡皮膜，模拟<b>吸气</b>。',
      check: function () { return inhale() ? { ok: true, msg: '膈肌收缩、膈顶下降，胸廓扩大，肺扩张，气体进入。' } : { ok: false, msg: '现在是呼气状态。吸气时膈应该怎样运动？' }; }
    },
      {
        level: 'base',
        title: '气体交换的主要场所是？',
        desc: '肺的最小单位。',
        options: ['肺泡', '气管', '支气管', '鼻腔'],
        answer: 0,
        hint: '哪里被毛细血管包绕？',
        explain: '<b>肺泡</b>数量极多、壁薄（一层细胞）、外面缠绕大量毛细血管，是<b>气体交换的主要场所</b>。'
      },
      {
        level: 'base',
        title: '人体形成尿液的器官是？',
        desc: '泌尿系统的主要器官。',
        options: ['肾脏', '膀胱', '输尿管', '尿道'],
        answer: 0,
        hint: '哪里有肾小球和肾小管？',
        explain: '<b>肾脏</b>形成尿液；输尿管<b>输送</b>、膀胱<b>暂存</b>、尿道<b>排出</b>。肾脏的结构单位是<b>肾单位</b>。'
      },
      {
        level: 'base',
        title: '呼吸道的作用是？',
        desc: '不只是通道。',
        options: ['保证气流通畅并清洁、湿润、温暖空气', '进行气体交换', '产生氧气', '分解有机物'],
        answer: 0,
        hint: '鼻毛和黏液起什么作用？',
        explain: '呼吸道<b>保证气流通畅</b>，并对吸入空气进行<b>清洁、湿润、温暖</b>处理。<b>气体交换只在肺泡进行</b>。'
      },
      {
      level: 'mid',
      title: '正常人的尿液里没有葡萄糖，是因为——',
      desc: '原尿里有葡萄糖，尿液里却没有，原因是：',
      options: ['肾小管重吸收了全部葡萄糖', '肾小球不让葡萄糖通过', '膀胱吸收了葡萄糖', '葡萄糖变成了尿素'],
      answer: 0,
      hint: '切换“原尿”和“尿液”，看葡萄糖在哪一步消失。',
      explain: '葡萄糖能通过肾小球进入原尿，再被肾小管全部重吸收回血液。'
    },
      {
      level: 'mid',
      title: '为什么口对口人工呼吸有效？',
      desc: '施救者呼出的气体能帮助病人，主要因为：',
      options: ['呼出气体中仍含有较多氧气', '呼出气体中二氧化碳最多', '呼出气体是温暖的', '呼出气体中没有氮气'],
      answer: 0,
      hint: '看一看呼出气体里氧气的比例。',
      explain: '呼出气体中氧气约占 16%，足以帮助病人获得氧气。'
    },
      {
        level: 'mid',
        title: '吸气时，膈肌和肋间肌的状态是？',
        desc: '胸腔容积要变大。',
        options: ['收缩，膈顶下降，胸腔扩大', '舒张，膈顶上升', '收缩，胸腔缩小', '舒张，胸腔扩大'],
        answer: 0,
        hint: '胸腔变大，气压变小，气体才进来。',
        explain: '吸气时<b>肋间肌和膈肌收缩</b>，肋骨上提、<b>膈顶下降</b>，<b>胸腔容积扩大</b>、肺内气压低于外界，气体被压入。呼气时相反。'
      },
      {
        level: 'mid',
        title: '尿的形成包括哪两个主要过程？',
        desc: '先滤过再回收。',
        options: ['肾小球的滤过和肾小管的重吸收', '只有滤过', '只有重吸收', '分泌和排泄'],
        answer: 0,
        hint: '原尿和尿液的差别在哪？',
        explain: '① <b>肾小球（和肾小囊内壁）的滤过</b>形成原尿；② <b>肾小管的重吸收</b>把全部葡萄糖、大部分水和部分无机盐送回血液，剩下的成为尿液。'
      },
      {
        level: 'mid',
        title: '正常人的尿液中不含葡萄糖，原因是？',
        desc: '它在哪一步被收回了。',
        options: ['被肾小管全部重吸收', '肾小球不滤过葡萄糖', '葡萄糖在膀胱被分解', '血液中没有葡萄糖'],
        answer: 0,
        hint: '原尿里有没有葡萄糖？',
        explain: '原尿中<b>含有葡萄糖</b>，但流经肾小管时被<b>全部重吸收</b>回血液，所以正常尿液中<b>不含葡萄糖</b>。尿中出现葡萄糖可能提示糖尿病。'
      },
      {
        level: 'mid',
        title: '人体排出废物的途径不包括？',
        desc: '找出不属于排泄的那一项。',
        options: ['排便', '排尿', '呼气', '出汗'],
        answer: 0,
        hint: '粪便是细胞产生的代谢废物吗？',
        explain: '<b>排便</b>排出的是食物残渣，不属于<b>排泄</b>（排泄指排出细胞代谢废物）。排泄的三条途径是：<b>排尿、呼气、出汗</b>。'
      },
      {
        level: 'trap',
        title: '肺泡壁和毛细血管壁都只有一层细胞，这体现了什么？',
        desc: '生物学的核心观点。',
        options: ['结构与功能相适应', '生物都很脆弱', '进化不完善', '这是巧合'],
        answer: 0,
        hint: '薄壁对气体交换有什么好处？',
        explain: '体现<b>结构与功能相适应</b>：壁薄（仅一层细胞）<b>有利于气体快速扩散</b>。这个观点贯穿整个生物学，答简答题时经常用得上。'
      }
    ]);
})();
