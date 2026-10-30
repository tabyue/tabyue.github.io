/* 第 5 课 · 植物的一生与蒸腾作用 */
(function () {
  'use strict';
  var B = window.Bio, S = B.svg;
  var st = B.getState();
  var pick = function (v, opts, d) { return opts.indexOf(v) >= 0 ? v : d; };
  var cfg = {
    water: pick(st.w, ['dry', 'ok', 'flood'], 'ok'),
    temp: pick(st.t, ['cold', 'ok'], 'ok'),
    air: pick(st.a, ['no', 'ok'], 'ok'),
    light: pick(st.l, ['dark', 'ok'], 'ok'),
    self: pick(st.s, ['ok', 'dead'], 'ok')
  };
  function save() { B.setState({ w: cfg.water, t: cfg.temp, a: cfg.air, l: cfg.light, s: cfg.self }); }
  function bind(sel, key, items) { B.chips(B.$(sel), items, cfg[key], function (v) { cfg[key] = v; drawSeed(); save(); }); }
  bind('#sd-water', 'water', [{ label: '干燥', value: 'dry' }, { label: '适量', value: 'ok' }, { label: '完全淹没', value: 'flood' }]);
  bind('#sd-temp', 'temp', [{ label: '冰箱里（约 4℃）', value: 'cold' }, { label: '室温（约 25℃）', value: 'ok' }]);
  bind('#sd-air', 'air', [{ label: '抽成真空', value: 'no' }, { label: '充足', value: 'ok' }]);
  bind('#sd-light', 'light', [{ label: '黑暗', value: 'dark' }, { label: '有光', value: 'ok' }]);
  bind('#sd-self', 'self', [{ label: '饱满、活的', value: 'ok' }, { label: '胚被虫蛀坏', value: 'dead' }]);

  function seedResult() {
    var why = [];
    if (cfg.self === 'dead') why.push('胚已经被破坏，种子是死的');
    if (cfg.water === 'dry') why.push('缺少水分，种子不能吸水膨胀');
    if (cfg.water === 'flood' || cfg.air === 'no') why.push('缺少空气，种子无法进行呼吸作用');
    if (cfg.temp === 'cold') why.push('温度太低，种子内的生命活动很微弱');
    return why;
  }
  function drawSeed() {
    var why = seedResult(), ok = why.length === 0;
    var svg = B.$('#sd-svg'); svg.innerHTML = '';
    S('rect', { x: 0, y: 0, width: 400, height: 170, rx: 12, fill: cfg.light === 'dark' ? '#3a4a42' : '#f6f8f2' }, svg);
    // 瓶子
    S('rect', { x: 140, y: 26, width: 120, height: 130, rx: 12, fill: '#ffffff', opacity: .55, stroke: '#9fb39a', 'stroke-width': 2 }, svg);
    var soilTop = 118;
    if (cfg.water === 'flood') S('rect', { x: 142, y: 56, width: 116, height: 98, rx: 10, fill: '#9cc5d3', opacity: .8 }, svg);
    S('rect', { x: 142, y: soilTop, width: 116, height: 36, rx: 8, fill: cfg.water === 'dry' ? '#e6d6b4' : '#c9b382' }, svg);
    if (cfg.water === 'ok') for (var i = 0; i < 6; i++) S('circle', { cx: 152 + i * 19, cy: soilTop + 10, r: 2, fill: '#7fb3c4' }, svg);
    // 种子
    S('ellipse', { cx: 200, cy: soilTop - 4, rx: 15, ry: 9, fill: cfg.self === 'dead' ? '#9b8d7a' : '#c58a4f', stroke: '#8a5a2c', 'stroke-width': 1.2 }, svg);
    if (cfg.self === 'dead') S('circle', { cx: 206, cy: soilTop - 6, r: 3, fill: '#5b4a3a' }, svg);
    if (ok) {
      S('path', { d: 'M200 ' + (soilTop - 10) + 'C199 ' + (soilTop - 40) + ' 201 ' + (soilTop - 58) + ' 200 ' + (soilTop - 70), stroke: '#4f7a48', 'stroke-width': 3.2, fill: 'none', 'stroke-linecap': 'round' }, svg);
      S('path', { d: 'M200 ' + (soilTop - 66) + 'q-20 -12 -30 4q18 6 30 -4z', fill: '#7fae6b' }, svg);
      S('path', { d: 'M200 ' + (soilTop - 66) + 'q20 -12 30 4q-18 6 -30 -4z', fill: '#7fae6b' }, svg);
      S('path', { d: 'M196 ' + (soilTop + 2) + 'q-6 14 -2 28M204 ' + (soilTop + 2) + 'q8 12 6 26', stroke: '#e8dcc3', 'stroke-width': 2, fill: 'none' }, svg);
    }
    if (cfg.air === 'no') S('text', { x: 200, y: 44, 'text-anchor': 'middle', 'font-size': 11, fill: cfg.light === 'dark' ? '#d6e2dc' : '#7a4520', text: '真空' }, svg);
    var c2 = cfg.light === 'dark' ? '#d6e2dc' : '#6f8268';
    S('text', { x: 16, y: 24, 'font-size': 12, fill: c2, text: (cfg.temp === 'cold' ? '❄ 约 4℃' : '约 25℃') + (cfg.light === 'dark' ? ' · 黑暗' : ' · 有光') }, svg);
    B.$('#sd-title').textContent = ok ? '种子萌发了' : '种子没有萌发';
    B.$('#sd-badge').textContent = ok ? '萌发' : '不萌发';
    B.$('#sd-text').innerHTML = ok
      ? '适量的水分、适宜的温度、充足的空气都满足了，胚也是活的。' + (cfg.light === 'dark' ? '<b>即使在黑暗里</b>，种子也能萌发——光照不是萌发的必要条件。' : '把光照改成“黑暗”试试，种子还会不会萌发？')
      : '没有萌发，因为：' + why.join('；') + '。';
  }

  /* —— 蒸腾作用 —— */
  var tr = { light: 70, temp: 28, hum: 75, wind: 30 };
  function tScore() {
    var tf = tr.temp < 30 ? (tr.temp - 5) / 25 : 1 - (tr.temp - 30) / 40; // 30℃ 左右最强，过高时气孔部分关闭
    var s = 0.36 * (tr.light / 100) + 0.24 * Math.max(0, tf) + 0.25 * (1 - (tr.hum - 20) / 80) + 0.15 * (tr.wind / 100);
    return Math.round(Math.max(0.03, Math.min(1, s)) * 100);
  }
  function drawTr() {
    var v = tScore();
    B.$('#tr-light-o').textContent = tr.light < 15 ? '几乎没有' : tr.light + '%';
    B.$('#tr-temp-o').textContent = tr.temp + '℃';
    B.$('#tr-hum-o').textContent = tr.hum + '%';
    B.$('#tr-wind-o').textContent = tr.wind < 10 ? '无风' : tr.wind < 50 ? '微风' : '大风';
    B.$('#tr-bar').style.width = v + '%';
    var level = v >= 66 ? '强' : v >= 36 ? '中等' : '弱';
    B.$('#tr-text').innerHTML = '蒸腾作用：<b>' + level + '</b>（相对值 ' + v + '）。' +
      (tr.light < 15 ? '光照弱时气孔大多关闭，蒸腾作用很弱。' : tr.hum > 85 ? '空气很潮湿（像深圳的回南天），水分不容易散失。' : tr.temp > 34 ? '太热时，部分气孔会关闭来减少失水。' : '光照强、空气干燥、有风，都会让蒸腾作用加强。');
  }
  ['light', 'temp', 'hum', 'wind'].forEach(function (k) {
    var el = B.$('#tr-' + k); el.value = tr[k];
    B.bindRange(el, function (v) { tr[k] = v; drawTr(); });
  });

  /* —— 花与果实 —— */
  var PARTS = [['子房', 'fruit'], ['子房壁', 'peel'], ['胚珠', 'seed'], ['珠被', 'coat'], ['受精卵', 'embryo']];
  var TO = [['fruit', '果实'], ['peel', '果皮'], ['seed', '种子'], ['coat', '种皮'], ['embryo', '胚']];
  var tname = function (v) { return TO.filter(function (t) { return t[0] === v; })[0][1]; };
  B.match('#fr-list', '#fr-score', B.shuffle(PARTS), TO, function (it) { return it[0] + ' → ' + tname(it[1]) + (it[0] === '子房壁' ? '（荔枝的红色外壳）' : it[0] === '胚珠' ? '（荔枝的核）' : '') + '。'; });

  drawSeed(); drawTr();

  B.quiz([
      {
      level: 'base',
      title: '让种子在黑暗中萌发',
      desc: '把光照设为<b>黑暗</b>，同时调好其他条件，让种子萌发。',
      check: function () {
        if (cfg.light !== 'dark') return { ok: false, msg: '先把光照改成“黑暗”。' };
        var w = seedResult();
        return w.length ? { ok: false, msg: '还没萌发：' + w[0] + '。' } : { ok: true, msg: '黑暗中也能萌发，说明光照不是种子萌发的必要条件。' };
      }
    },
      {
      level: 'base',
      title: '把蒸腾作用调到“强”',
      desc: '拖动光照、温度、湿度、风，让蒸腾作用达到<b>强</b>。',
      check: function () { var v = tScore(); return v >= 66 ? { ok: true, msg: '光照充足、温度适宜、空气干燥、有风时，蒸腾作用最强。' } : { ok: false, msg: '现在相对值是 ' + v + '，再想想哪些条件能让水分散失得更快。' }; }
    },
      {
        level: 'base',
        title: '种子萌发需要的外界条件是？',
        desc: '三个缺一不可。',
        options: ['适宜的温度、一定的水分、充足的空气', '阳光、土壤、肥料', '只需要水', '只需要温度'],
        answer: 0,
        hint: '光是不是必需的？',
        explain: '需要<b>适宜的温度、一定的水分、充足的空气</b>三个外界条件。<b>光不是必需的</b>——很多种子在土里黑暗中照样萌发。'
      },
      {
        level: 'base',
        title: '植物吸收水分和无机盐的主要部位是？',
        desc: '根的哪个区域。',
        options: ['根尖的成熟区（根毛区）', '根冠', '分生区', '伸长区'],
        answer: 0,
        hint: '哪里有大量根毛？',
        explain: '<b>成熟区（根毛区）</b>有大量根毛，大大增加吸收面积，是吸收水分和无机盐的<b>主要部位</b>。'
      },
      {
        level: 'base',
        title: '植物体内运输水分和无机盐的结构是？',
        desc: '在茎里向上运输。',
        options: ['导管', '筛管', '形成层', '表皮'],
        answer: 0,
        hint: '水往上走还是往下走？',
        explain: '<b>导管</b>自下而上运输<b>水分和无机盐</b>；<b>筛管</b>自上而下运输<b>有机物</b>。两者方向和内容都不同。'
      },
      {
      level: 'mid',
      title: '花生的“红衣”是什么发育来的？',
      desc: '花生仁外面那层红色的薄皮是种皮，它是由什么发育来的？',
      options: ['珠被', '子房壁', '受精卵', '花瓣'],
      answer: 0,
      hint: '种子外面的种皮，对应胚珠外面的哪一层？',
      explain: '珠被发育成种皮；花生的壳才是子房壁发育成的果皮。'
    },
      {
        level: 'mid',
        title: '移栽植物时往往要剪去部分枝叶，目的是？',
        desc: '减少水分散失。',
        options: ['降低蒸腾作用，提高成活率', '减轻重量便于搬运', '促进光合作用', '防止虫害'],
        answer: 0,
        hint: '刚移栽的根受损，吸水能力下降。',
        explain: '剪去部分枝叶可<b>降低蒸腾作用</b>、减少水分散失，在根系受损、吸水能力弱时<b>提高成活率</b>。'
      },
      {
        level: 'mid',
        title: '蒸腾作用的主要器官和「门户」分别是？',
        desc: '水从哪里跑掉。',
        options: ['叶；气孔', '根；根毛', '茎；导管', '花；花瓣'],
        answer: 0,
        hint: '叶片上那些小孔叫什么？',
        explain: '蒸腾作用主要通过<b>叶</b>进行，水分以水蒸气形式从<b>气孔</b>散失。气孔由<b>保卫细胞</b>控制开闭。'
      },
      {
        level: 'mid',
        title: '蒸腾作用对植物自身的意义不包括？',
        desc: '找出不相关的那一项。',
        options: ['为光合作用提供二氧化碳', 'promoting水分和无机盐的向上运输', '降低叶片温度', '增加大气湿度'],
        answer: 0,
        hint: '二氧化碳是通过什么进入的？',
        explain: '蒸腾作用能<b>促进水和无机盐向上运输、降低叶温、增加大气湿度</b>。二氧化碳进入叶片靠的是<b>扩散</b>，不是蒸腾作用提供的。'
      },
      {
        level: 'mid',
        title: '植物生长需要量最多的三种无机盐是？',
        desc: '化肥袋上常见的三个字母。',
        options: ['含氮、含磷、含钾的无机盐', '含铁、含锌、含铜的', '含钙、含镁、含硫的', '含碘、含硒、含氟的'],
        answer: 0,
        hint: '氮磷钾分别促进什么？',
        explain: '<b>氮（促枝叶繁茂）、磷（促开花结果、根系发达）、钾（促茎秆健壮）</b>需要量最多，是化肥的主要成分。'
      },
      {
        level: 'trap',
        title: '把植物放在黑暗处，蒸腾作用会完全停止吗？',
        desc: '想想气孔的开闭。',
        options: ['不会完全停止，但会明显减弱', '会完全停止', '反而更强', '完全不受影响'],
        answer: 0,
        hint: '夜间气孔大多关闭，但不是全部。',
        explain: '黑暗中气孔<b>大部分关闭</b>，蒸腾作用<b>明显减弱但不会完全停止</b>。「完全停止」说得太绝对——生物题里凡是出现「完全」「全部」「一定」都要警惕。'
      }
    ]);
})();
