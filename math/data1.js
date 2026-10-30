/* 第 6 课 · 数据的收集与表示（北师大版七上第六章） */
(function () {
  'use strict';
  var M = window.Mx, st = M.getState();

  /* ---------- 模型一：抽样 ----------
     总体 200 个点，其中 支持 A 的真实比例固定为 0.62。
     抽 n 个看样本比例，体会「样本越大越接近总体」。 */
  var TRUE_P = 0.62, N = 200;
  var pop = [];
  (function build() {
    /* 固定总体：前 124 个支持 A，再打乱位置（用固定种子，保证每次打开一样） */
    var seed = 20261030;
    function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
    for (var i = 0; i < N; i++) pop.push(i < Math.round(TRUE_P * N) ? 1 : 0);
    for (i = N - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = pop[i]; pop[i] = pop[j]; pop[j] = t; }
  })();

  var sampleN = M.num(st.n, 20, 5, 200), picked = [], history = [];

  function doSample() {
    var idx = [];
    for (var i = 0; i < N; i++) idx.push(i);
    for (i = N - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = idx[i]; idx[i] = idx[j]; idx[j] = t; }
    picked = idx.slice(0, sampleN);
    var yes = 0;
    picked.forEach(function (k) { yes += pop[k]; });
    history.push(yes / sampleN);
    if (history.length > 8) history.shift();
    showSample();
  }

  function showSample() {
    var s = M.$('#sm-fig');
    s.innerHTML = '';
    var S = M.svg, cols = 20, cell = 14, ox = 10, oy = 10;
    var inSample = {};
    picked.forEach(function (k) { inSample[k] = 1; });
    for (var i = 0; i < N; i++) {
      var c = i % cols, r = (i / cols) | 0;
      S('circle', {
        cx: ox + c * cell + 6, cy: oy + r * cell + 6, r: inSample[i] ? 5.4 : 4,
        fill: inSample[i] ? (pop[i] ? '#c2603f' : '#3f7d6a') : '#dfe3ea',
        stroke: inSample[i] ? '#fff' : 'none', 'stroke-width': 1.2
      }, s);
    }
    var yes = 0;
    picked.forEach(function (k) { yes += pop[k]; });
    var p = picked.length ? yes / picked.length : 0;
    M.$('#sm-n').textContent = picked.length || sampleN;
    M.$('#sm-p').textContent = picked.length ? M.fmt(p * 100, 1) + '%' : '—';
    M.$('#sm-true').textContent = M.fmt(TRUE_P * 100, 1) + '%';
    M.$('#sm-err').textContent = picked.length ? M.fmt(Math.abs(p - TRUE_P) * 100, 1) + ' 个百分点' : '—';
    var hb = M.$('#sm-hist');
    hb.innerHTML = '';
    history.forEach(function (h, i) {
      var row = M.html('div', { class: 'bar-item' }, hb);
      M.html('span', { text: '第 ' + (i + 1) + ' 次' }, row);
      var tr = M.html('div', { class: 'track' }, row);
      M.html('div', { class: 'fill', style: 'width:' + M.fmt(h * 100, 1) + '%;background:' + (Math.abs(h - TRUE_P) < 0.05 ? '#8fae8a' : '#d4a373') }, tr);
      M.html('em', { text: M.fmt(h * 100, 1) + '%' }, row);
    });
    M.$('#sm-text').innerHTML = picked.length
      ? '每次抽样结果都不一样，这叫<b>抽样误差</b>。' + (sampleN >= 100
        ? '样本占了总体一半以上，结果已经相当接近 62%。'
        : '样本只有 ' + sampleN + ' 个（总体 200 个），多点几次「重新抽一次」，你会看到结果上下跳动得挺厉害。把样本调大，跳动就变小。')
      : '点下面的按钮抽一次样。<b>红点</b>表示抽到的人支持 A，<b>绿点</b>表示不支持，灰点是没被抽到的。';
    M.setState({ n: sampleN, g: gap, c: chartKind });
  }

  /* ---------- 模型二：同一组数据，三种统计图 ---------- */
  var WAY = [
    { name: '步行', v: 12 }, { name: '自行车', v: 8 }, { name: '公交', v: 14 },
    { name: '地铁', v: 16 }, { name: '家长送', v: 10 }
  ];
  var MONTH = [8, 9, 13, 18, 24, 28, 29, 28, 27, 23, 17, 11];
  var chartKind = st.c || 'bar';

  function showChart() {
    var s = M.$('#ch-fig');
    s.innerHTML = '';
    var S = M.svg, total = 0;
    WAY.forEach(function (w) { total += w.v; });
    var COL = ['#5d7cb0', '#c2603f', '#3f7d6a', '#d4a373', '#8d86c0'];
    if (chartKind === 'bar') {
      var bw = 40, gapx = 16, ox = 36, base = 150;
      WAY.forEach(function (w, i) {
        var h = w.v / 20 * 112;
        S('rect', { x: ox + i * (bw + gapx), y: base - h, width: bw, height: h, rx: 3, fill: COL[i] }, s);
        S('text', { x: ox + i * (bw + gapx) + bw / 2, y: base - h - 5, 'text-anchor': 'middle', 'font-size': 10.5, fill: '#4a5568', text: w.v }, s);
        S('text', { x: ox + i * (bw + gapx) + bw / 2, y: base + 14, 'text-anchor': 'middle', 'font-size': 10, fill: '#6b7385', text: w.name }, s);
      });
      S('line', { x1: 26, y1: base, x2: 310, y2: base, stroke: '#8795b5', 'stroke-width': 1.4 }, s);
      S('text', { x: 26, y: 24, 'font-size': 10, fill: '#6b7385', text: '人数' }, s);
    } else if (chartKind === 'pie') {
      var cx = 108, cy = 86, R = 72, ang = -Math.PI / 2;
      WAY.forEach(function (w, i) {
        var sweep = w.v / total * Math.PI * 2, e = ang + sweep;
        var x1 = cx + R * Math.cos(ang), y1 = cy + R * Math.sin(ang);
        var x2 = cx + R * Math.cos(e), y2 = cy + R * Math.sin(e);
        S('path', { d: 'M' + cx + ' ' + cy + 'L' + M.fmt(x1, 1) + ' ' + M.fmt(y1, 1) + 'A' + R + ' ' + R + ' 0 ' + (sweep > Math.PI ? 1 : 0) + ' 1 ' + M.fmt(x2, 1) + ' ' + M.fmt(y2, 1) + 'z', fill: COL[i], stroke: '#fff', 'stroke-width': 1.5 }, s);
        var mid = ang + sweep / 2;
        S('text', { x: cx + R * 0.66 * Math.cos(mid), y: cy + R * 0.66 * Math.sin(mid) + 3.5, 'text-anchor': 'middle', 'font-size': 10, fill: '#fff', 'font-weight': 700, text: M.fmt(w.v / total * 100, 0) + '%' }, s);
        ang = e;
      });
      WAY.forEach(function (w, i) {
        S('rect', { x: 206, y: 24 + i * 22, width: 11, height: 11, rx: 2, fill: COL[i] }, s);
        S('text', { x: 223, y: 34 + i * 22, 'font-size': 10.5, fill: '#4a5568', text: w.name + ' ' + w.v + ' 人' }, s);
      });
    } else {
      var ox2 = 30, base2 = 146, w2 = 274, pts = [];
      MONTH.forEach(function (t, i) {
        pts.push([ox2 + i * (w2 / 11), base2 - (t - 5) / 28 * 112]);
      });
      S('polyline', { points: pts.map(function (p) { return M.fmt(p[0], 1) + ',' + M.fmt(p[1], 1); }).join(' '), fill: 'none', stroke: '#c2603f', 'stroke-width': 2.2 }, s);
      pts.forEach(function (p, i) {
        S('circle', { cx: p[0], cy: p[1], r: 3, fill: '#c2603f' }, s);
        if (i % 2 === 0) S('text', { x: p[0], y: base2 + 14, 'text-anchor': 'middle', 'font-size': 9.5, fill: '#6b7385', text: (i + 1) + '月' }, s);
      });
      S('line', { x1: 22, y1: base2, x2: 310, y2: base2, stroke: '#8795b5', 'stroke-width': 1.4 }, s);
      S('text', { x: 22, y: 22, 'font-size': 10, fill: '#6b7385', text: '气温 °C' }, s);
    }
    var tips = {
      bar: ['条形统计图', '容易看出<b>每一项的具体数量</b>，也方便两两比较。上面一眼能看出地铁最多（16 人）。', '想知道「谁多谁少、差多少」时用它。'],
      pie: ['扇形统计图', '清楚地表示<b>各部分占总体的百分比</b>，整个圆代表总数。各扇形圆心角 = 百分比 × 360°。', '想知道「各占几成」时用它。但它看不出具体人数，也不适合比较两组数据。'],
      line: ['折线统计图', '能看出数据<b>随时间变化的趋势</b>——深圳气温从 1 月升到 7 月再降回去。', '想知道「怎么变化的」时用它。']
    };
    var t = tips[chartKind];
    M.$('#ch-name').textContent = t[0];
    M.$('#ch-good').innerHTML = t[1];
    M.$('#ch-when').innerHTML = t[2];
    M.$('#ch-data').textContent = chartKind === 'line' ? '深圳月平均气温（1991–2020 气候标准值，℃）' : '某班 60 人上学方式调查';
    M.setState({ n: sampleN, g: gap, c: chartKind });
  }

  /* ---------- 模型三：频数分布，组距会改变图形 ---------- */
  var SCORE = [62, 95, 78, 83, 71, 66, 88, 91, 74, 59, 80, 85, 77, 68, 93, 72, 81, 64, 76, 89,
               70, 84, 97, 61, 79, 86, 73, 92, 67, 82, 75, 90, 65, 87, 94, 69, 78, 83, 71, 96];
  var gap = M.num(st.g, 10, 5, 20);

  function showFreq() {
    var s = M.$('#fq-fig');
    s.innerHTML = '';
    var S = M.svg, lo = 55, hi = 100;
    var bins = [], k = Math.ceil((hi - lo) / gap), i;
    for (i = 0; i < k; i++) bins.push({ a: lo + i * gap, b: lo + (i + 1) * gap, n: 0 });
    SCORE.forEach(function (v) {
      var j = Math.min(k - 1, Math.floor((v - lo) / gap));
      if (j >= 0) bins[j].n++;
    });
    var maxN = Math.max.apply(null, bins.map(function (b) { return b.n; }));
    var ox = 34, base = 148, bw = (286 - ox) / k;
    bins.forEach(function (b, idx) {
      var h = b.n / Math.max(maxN, 1) * 112;
      S('rect', { x: ox + idx * bw, y: base - h, width: bw - 2, height: h, fill: '#5d7cb0', stroke: '#fff', 'stroke-width': 1 }, s);
      if (b.n) S('text', { x: ox + idx * bw + bw / 2 - 1, y: base - h - 5, 'text-anchor': 'middle', 'font-size': 10, fill: '#4a5568', text: b.n }, s);
      S('text', { x: ox + idx * bw + bw / 2 - 1, y: base + 13, 'text-anchor': 'middle', 'font-size': 9, fill: '#6b7385', text: b.a }, s);
    });
    S('line', { x1: 26, y1: base, x2: 300, y2: base, stroke: '#8795b5', 'stroke-width': 1.4 }, s);
    S('text', { x: 26, y: 22, 'font-size': 10, fill: '#6b7385', text: '频数（人）' }, s);

    var tb = M.$('#fq-table tbody');
    tb.innerHTML = '';
    bins.forEach(function (b) {
      var tr = M.html('tr', {}, tb);
      M.html('td', { class: 'n', text: b.a + ' ≤ x < ' + b.b }, tr);
      M.html('td', { class: 'n', text: b.n }, tr);
      M.html('td', { class: 'n', text: M.fmt(b.n / SCORE.length * 100, 1) + '%' }, tr);
    });
    M.$('#fq-gap').textContent = gap + ' 分';
    M.$('#fq-k').textContent = k + ' 组';
    M.$('#fq-text').innerHTML = '一共 ' + SCORE.length + ' 个数据，极差 = ' + (Math.max.apply(null, SCORE) - Math.min.apply(null, SCORE)) + ' 分。' +
      '组距取 <b>' + gap + ' 分</b>时分成 ' + k + ' 组。' +
      (gap <= 5 ? '组距太小，组数多、每组人数少，图形<b>忽高忽低</b>，看不出整体形状。'
        : gap >= 18 ? '组距太大，只剩 ' + k + ' 组，<b>细节全被抹平</b>了。'
        : '这个组距比较合适，能看出中间多、两头少的形状。') +
      '所有频率加起来一定等于 <b>100%</b>。';
    M.setState({ n: sampleN, g: gap, c: chartKind });
  }

  /* ---------- 装配 ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    M.bindRange(M.$('#sm-range'), function (v) { sampleN = v; doSample(); });
    M.$('#sm-go').addEventListener('click', doSample);
    M.$('#sm-clear').addEventListener('click', function () { history = []; picked = []; showSample(); });
    doSample();

    M.chips(M.$('#ch-chips'), [{ label: '条形图', value: 'bar' }, { label: '扇形图', value: 'pie' }, { label: '折线图', value: 'line' }], chartKind, function (v) { chartKind = v; showChart(); });
    showChart();

    M.bindRange(M.$('#fq-range'), function (v) { gap = v; showFreq(); })();

    M.match('#dt-list', '#dt-score', [
      ['要知道全班每人的身高，好订校服', 'all', '人数少、必须准确到每个人，用普查。'],
      ['要估计深圳中学生的近视率', 'sample', '对象太多，普查成本高，用抽样调查。'],
      ['检测一批灯泡能亮多少小时', 'sample', '检测会毁掉灯泡，只能抽样。'],
      ['统计本班期中考试的平均分', 'all', '数据就在手上，直接普查。'],
      ['调查全国人口的年龄构成', 'all', '人口普查是国家行为，十年一次，要求全面准确。'],
      ['了解一锅汤咸不咸', 'sample', '尝一勺就够了，这就是抽样。']
    ], [['all', '普查'], ['sample', '抽样调查']], function (it, ok) { return it[2]; });

    M.quiz([
      {
        level: 'base',
        title: '把样本调到 150 人，再抽一次',
        desc: '先拖动样本容量滑块到 150（或更多），再点「重新抽一次」。',
        label: '在抽样模型里操作',
        button: '检查样本容量',
        check: function () {
          if (!picked.length) return { ok: false, msg: '还没抽样，点一下「重新抽一次」。' };
          if (picked.length < 150) return { ok: false, msg: '现在样本只有 ' + picked.length + ' 个，把滑块调到 150 以上再抽。' };
          var yes = 0;
          picked.forEach(function (k) { yes += pop[k]; });
          return { ok: true, msg: '样本比例 ' + M.fmt(yes / picked.length * 100, 1) + '%，真实值 62%，差得很小。<b>样本容量越大，估计越可靠</b>，这是抽样调查的基本道理。' };
        }
      },
      {
        level: 'base',
        title: '要了解一批炮弹的杀伤半径，应采用？',
        desc: '想想这种检测会对被测对象造成什么。',
        options: ['抽样调查', '普查', '两者都行', '两者都不行'],
        answer: 0,
        hint: '测完以后炮弹还在吗？',
        explain: '检测具有<b>破坏性</b>，普查会把整批炮弹都打光，只能<b>抽样调查</b>。类似的还有灯泡寿命、火柴质量。'
      },
      {
        level: 'base',
        title: '某班 50 人，喜欢数学的有 20 人，所占频率是？',
        desc: '频率 = 频数 ÷ 总数。',
        options: ['0.4', '20', '0.2', '2.5'],
        answer: 0,
        hint: '20 ÷ 50。',
        explain: '20 ÷ 50 = <b>0.4</b>（即 40%）。注意区分：<b>频数</b>是个数 20，<b>频率</b>是占比 0.4。'
      },
      {
        level: 'mid',
        title: '想看「深圳一年气温怎么变」，用哪种图？',
        desc: '可以在上面切换三种图对比一下。',
        options: ['折线统计图', '条形统计图', '扇形统计图', '频数分布直方图'],
        answer: 0,
        hint: '问的是「怎么变化」，也就是趋势。',
        explain: '折线统计图最能反映<b>随时间变化的趋势</b>。条形图适合比较大小，扇形图适合看各部分占总体的百分比。'
      },
      {
        level: 'mid',
        title: '扇形统计图里，占 25% 的扇形圆心角是多少度？',
        desc: '整个圆是 360°，代表全部数据。',
        options: ['90°', '25°', '45°', '72°'],
        answer: 0,
        hint: '圆心角 = 百分比 × 360°。',
        explain: '25% × 360° = 90°。反过来，看到 90° 的扇形就知道它占四分之一。'
      },
      {
        level: 'mid',
        title: '要反映深圳一周每天的最高气温变化，最合适的统计图是？',
        desc: '问的是「变化」。',
        options: ['折线统计图', '扇形统计图', '条形统计图', '频数分布直方图'],
        answer: 0,
        hint: '哪种图最能看出升降趋势？',
        explain: '<b>折线统计图</b>最能反映随时间变化的趋势。条形图适合比大小，扇形图适合看各部分占总体的比例。'
      },
      {
        level: 'mid',
        title: '一组数据最大值 98、最小值 56，若组距取 10，应分成几组？',
        desc: '先算极差，再除以组距向上取整。',
        options: ['5 组', '4 组', '42 组', '10 组'],
        answer: 0,
        hint: '极差 = 98 − 56 = 42，42 ÷ 10 = 4.2。',
        explain: '极差 42 ÷ 组距 10 = 4.2，<b>不够整除就进一位</b>，分成 <b>5 组</b>。组数 = 极差 ÷ 组距后向上取整。'
      },
      {
        level: 'trap',
        title: '为了解全校学生视力，下面哪种抽样最合理？',
        desc: '抽样的关键不是人多，而是每个人机会均等。',
        options: ['从每个年级随机抽取相同比例的学生', '只调查戴眼镜的同学', '只调查九年级学生', '调查校篮球队全体队员'],
        answer: 0,
        hint: '哪种办法不会偏向某一类人？',
        explain: '只有<b>按年级随机分层抽取</b>才有代表性。只问戴眼镜的会高估近视率，只问九年级或篮球队则样本偏向特定人群——<b>样本再大，有偏就没用</b>。'
      }
    ]);
  });
})();
