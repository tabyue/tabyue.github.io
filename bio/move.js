/* 第 13 课 · 运动、听觉与激素调节 */
(function () {
  'use strict';
  var B = window.Bio, S = B.svg, H = B.html;
  var st = B.getState();
  var pose = st.a === 'ext' ? 'ext' : 'flex';

  /* —— 屈肘与伸肘 —— */
  B.chips(B.$('#arm-chips'), [{ label: '屈肘（弯胳膊）', value: 'flex' }, { label: '伸肘（伸直）', value: 'ext' }], pose, function (v) { pose = v; drawArm(); B.setState({ a: pose }); });
  function drawArm() {
    var svg = B.$('#arm-svg'); svg.innerHTML = '';
    var flex = pose === 'flex';
    var sh = [80, 70], el = [210, 150], hand = flex ? [170, 30] : [350, 180];
    S('rect', { x: 0, y: 0, width: 400, height: 220, rx: 12, fill: '#f6f8f2' }, svg);
    // 骨
    S('path', { d: 'M' + sh + 'L' + el, stroke: '#d8cdb4', 'stroke-width': 14, 'stroke-linecap': 'round' }, svg);
    S('path', { d: 'M' + el + 'L' + hand, stroke: '#d8cdb4', 'stroke-width': 11, 'stroke-linecap': 'round' }, svg);
    S('circle', { cx: el[0], cy: el[1], r: 10, fill: '#efe6d0', stroke: '#b9a77f', 'stroke-width': 1.5 }, svg);
    // 沿肱骨方向计算：u 是骨的方向，n 指向手臂前侧（肱二头肌一侧）
    var L = Math.hypot(el[0] - sh[0], el[1] - sh[1]), u = [(el[0] - sh[0]) / L, (el[1] - sh[1]) / L], nv = [u[1], -u[0]];
    var ang = Math.atan2(u[1], u[0]) * 180 / Math.PI;
    var at = function (t, off) { return [sh[0] + u[0] * L * t + nv[0] * off, sh[1] + u[1] * L * t + nv[1] * off]; };
    var bi = flex ? { c: at(0.55, 15), rx: 40, ry: 14 } : { c: at(0.52, 11), rx: 54, ry: 7 };
    var tri = flex ? { c: at(0.5, -11), rx: 56, ry: 6 } : { c: at(0.5, -14), rx: 44, ry: 13 };
    [[bi, flex], [tri, !flex]].forEach(function (m) {
      S('ellipse', { cx: m[0].c[0], cy: m[0].c[1], rx: m[0].rx, ry: m[0].ry, transform: 'rotate(' + ang.toFixed(1) + ' ' + m[0].c[0].toFixed(1) + ' ' + m[0].c[1].toFixed(1) + ')', fill: m[1] ? '#d9604a' : '#f0b2a4', stroke: '#a94a37', 'stroke-width': 1.4 }, svg);
    });
    // 肌腱：肱二头肌连到前臂骨，肱三头肌绕到肘后
    var biEnd = [bi.c[0] + u[0] * bi.rx, bi.c[1] + u[1] * bi.rx], triEnd = [tri.c[0] + u[0] * tri.rx, tri.c[1] + u[1] * tri.rx];
    var fx = el[0] + (hand[0] - el[0]) * 0.2, fy = el[1] + (hand[1] - el[1]) * 0.2;
    S('path', { d: 'M' + biEnd[0].toFixed(1) + ' ' + biEnd[1].toFixed(1) + 'L' + fx.toFixed(1) + ' ' + fy.toFixed(1), stroke: '#a94a37', 'stroke-width': 2.4 }, svg);
    S('path', { d: 'M' + triEnd[0].toFixed(1) + ' ' + triEnd[1].toFixed(1) + 'L' + (el[0] - nv[0] * 9).toFixed(1) + ' ' + (el[1] - nv[1] * 9).toFixed(1), stroke: '#a94a37', 'stroke-width': 2.4 }, svg);
    var bl = at(0.4, 15 + bi.ry + 14), tl = at(0.3, -14 - tri.ry - 30);
    S('text', { x: bl[0] - 40, y: bl[1], 'font-size': 12, 'font-weight': 700, fill: '#8f3b2c', text: '肱二头肌' + (flex ? '（收缩）' : '（舒张）') }, svg);
    S('text', { x: tl[0] - 20, y: tl[1] + 12, 'font-size': 12, 'font-weight': 700, fill: '#8f3b2c', text: '肱三头肌' + (flex ? '（舒张）' : '（收缩）') }, svg);
    S('text', { x: el[0] - 8, y: el[1] + 30, 'font-size': 11, fill: '#7a6a4a', text: '肘关节' }, svg);
    B.$('#arm-title').textContent = flex ? '屈肘' : '伸肘';
    B.$('#arm-bi').textContent = flex ? '收缩' : '舒张';
    B.$('#arm-tri').textContent = flex ? '舒张' : '收缩';
    B.$('#arm-text').innerHTML = flex
      ? '屈肘时，<b>肱二头肌收缩</b>，牵拉前臂的骨绕肘关节向上转动，同时肱三头肌舒张。'
      : '伸肘时，<b>肱三头肌收缩</b>，肱二头肌舒张，前臂伸直。两手自然下垂时，两块肌肉都舒张；提重物时，两块肌肉都收缩。';
  }

  /* —— 听觉形成 —— */
  var EAR = [['声波', '外界的声音以声波的形式传来。'], ['外耳道', '耳廓收集声波，经外耳道传到鼓膜。'], ['鼓膜', '鼓膜受声波刺激产生<b>振动</b>。乘飞机降落时嚼口香糖或张口，能让鼓膜内外气压平衡。'],
    ['听小骨', '三块听小骨把振动放大并传到内耳。'], ['耳蜗', '耳蜗内有对声波敏感的感觉细胞，受刺激后产生<b>神经冲动</b>。'], ['听觉神经', '神经冲动沿着听觉神经传向大脑。'], ['大脑皮层', '在大脑皮层的<b>听觉中枢</b>形成听觉——这时才真正“听到”。']];
  var ep = 0;
  function drawEar() {
    var box = B.$('#ear-steps'); box.innerHTML = '';
    EAR.forEach(function (s, i) {
      if (i) H('i', { text: '→' }, box);
      var sp = H('span', { text: s[0], class: i <= ep ? 'on' : '' }, box);
      sp.style.cursor = 'pointer';
      sp.addEventListener('click', function () { ep = i; drawEar(); });
    });
    B.$('#ear-info').innerHTML = '<b>' + EAR[ep][0] + '</b>　' + EAR[ep][1];
    B.$('#ear-next').textContent = ep === EAR.length - 1 ? '从头再走一遍' : '下一站 →';
  }
  B.$('#ear-next').addEventListener('click', function () { ep = ep === EAR.length - 1 ? 0 : ep + 1; drawEar(); });

  /* —— 激素 —— */
  var HOR = [['gh-', '幼年生长激素不足'], ['gh+', '幼年生长激素过多'], ['th-', '幼年甲状腺激素不足'], ['th+', '成年甲状腺激素过多'], ['ins-', '胰岛素分泌不足'], ['iod', '长期缺碘']];
  var hname = function (v) { return HOR.filter(function (x) { return x[0] === v; })[0][1]; };
  var ILL = [['侏儒症：身材矮小，智力正常', 'gh-'], ['巨人症：身材异常高大', 'gh+'], ['呆小症：身材矮小，智力低下', 'th-'], ['甲状腺功能亢进：心跳加快、情绪易激动、消瘦', 'th+'], ['糖尿病：血糖浓度过高', 'ins-'], ['地方性甲状腺肿（大脖子病）', 'iod']];
  B.match('#hm-list', '#hm-score', B.shuffle(ILL), function (i) { return B.shuffle(HOR); }, function (it) { return it[0].split('：')[0] + '：' + hname(it[1]) + '。'; });

  drawArm(); drawEar();

  B.quiz([
    {
      title: '让肱三头肌收缩',
      desc: '切换动作，让<b>肱三头肌</b>处于收缩状态。',
      check: function () { return pose === 'ext' ? { ok: true, msg: '伸肘时肱三头肌收缩、肱二头肌舒张。' } : { ok: false, msg: '现在是屈肘，肱三头肌在舒张。' }; }
    },
    {
      title: '听觉在哪里形成？',
      desc: '跟着上面的路线走完，听觉最终形成于：',
      options: ['大脑皮层的听觉中枢', '耳蜗', '鼓膜', '听小骨'],
      answer: 0,
      hint: '耳蜗里只有感受器，产生的是神经冲动。',
      explain: '所有的感觉都在大脑皮层形成。'
    },
    {
      title: '身材矮小、智力正常，最可能是——',
      desc: '一个人从小身材矮小，但智力正常，最可能的原因是：',
      options: ['幼年时生长激素分泌不足', '幼年时甲状腺激素分泌不足', '胰岛素分泌不足', '成年后生长激素过多'],
      answer: 0,
      hint: '呆小症是“矮小 + 智力低下”。',
      explain: '这是侏儒症，由幼年时垂体分泌的生长激素不足引起。'
    }
  ]);
})();
