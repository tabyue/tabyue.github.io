/* 第 12 课 · 人体的呼吸与废物排出 */
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
    H('div', { html: '<b style="font-size:12.5px">' + g[0] + '</b>', style: 'margin-bottom:4px' }, row);
    [['吸入', g[1], '#7fb3c4'], ['呼出', g[2], '#c58a4f']].forEach(function (x) {
      var line = H('div', { style: 'display:grid;grid-template-columns:36px 1fr 52px;gap:8px;align-items:center;font-size:11.5px;color:#5d6f63;margin:2px 0' }, row);
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
      title: '让模型处于“吸气”状态',
      desc: '拖动滑块拉动橡皮膜，模拟<b>吸气</b>。',
      check: function () { return inhale() ? { ok: true, msg: '膈肌收缩、膈顶下降，胸廓扩大，肺扩张，气体进入。' } : { ok: false, msg: '现在是呼气状态。吸气时膈应该怎样运动？' }; }
    },
    {
      title: '正常人的尿液里没有葡萄糖，是因为——',
      desc: '原尿里有葡萄糖，尿液里却没有，原因是：',
      options: ['肾小管重吸收了全部葡萄糖', '肾小球不让葡萄糖通过', '膀胱吸收了葡萄糖', '葡萄糖变成了尿素'],
      answer: 0,
      hint: '切换“原尿”和“尿液”，看葡萄糖在哪一步消失。',
      explain: '葡萄糖能通过肾小球进入原尿，再被肾小管全部重吸收回血液。'
    },
    {
      title: '为什么口对口人工呼吸有效？',
      desc: '施救者呼出的气体能帮助病人，主要因为：',
      options: ['呼出气体中仍含有较多氧气', '呼出气体中二氧化碳最多', '呼出气体是温暖的', '呼出气体中没有氮气'],
      answer: 0,
      hint: '看一看呼出气体里氧气的比例。',
      explain: '呼出气体中氧气约占 16%，足以帮助病人获得氧气。'
    }
  ]);
})();
