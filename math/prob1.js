/* 第 9 课 · 概率初步（北师大版七下第三章） */
(function () {
  'use strict';
  var M = window.Mx, st = M.getState();

  /* ---------- 模型一：抛硬币，频率稳定到概率 ---------- */
  var tosses = 0, heads = 0, trail = [], ax = null;
  var EXP = { coin: 0.5, dice6: 1 / 6, diceBig: 0.5 };
  var kind = st.k || 'coin';
  var KINDS = {
    coin: { name: '抛硬币，看正面', p: 0.5, run: function () { return Math.random() < 0.5; }, label: '正面朝上' },
    dice6: { name: '掷骰子，看 6 点', p: 1 / 6, run: function () { return Math.floor(Math.random() * 6) + 1 === 6; }, label: '掷出 6 点' },
    diceBig: { name: '掷骰子，看大于 3', p: 0.5, run: function () { return Math.floor(Math.random() * 6) + 1 > 3; }, label: '点数大于 3' }
  };

  function reset() { tosses = 0; heads = 0; trail = []; drawTrail(); }

  function run(n) {
    var k = KINDS[kind];
    for (var i = 0; i < n; i++) {
      tosses++;
      if (k.run()) heads++;
      /* 只记录关键点，画出来才不会太密 */
      if (tosses <= 60 || tosses % Math.max(1, Math.floor(tosses / 60)) === 0) trail.push([tosses, heads / tosses]);
    }
    if (trail.length > 400) trail = trail.filter(function (_, i) { return i % 2 === 0; });
    drawTrail();
  }

  function drawTrail() {
    var k = KINDS[kind];
    var el = M.$('#cn-fig');
    ax = M.axes(el, {
      xmin: 0, xmax: Math.max(50, tosses), ymin: 0, ymax: 1,
      xstep: Math.max(10, Math.round(Math.max(50, tosses) / 5)), ystep: 0.25,
      labelStep: Math.max(10, Math.round(Math.max(50, tosses) / 5)), ylabelStep: 0.25,
      left: 36, bottom: 24, top: 10, xlabel: '试验次数', ylabel: '频率'
    });
    var S = M.svg, L = ax.layer;
    /* 理论概率的水平虚线 */
    S('line', { x1: ax.X(ax.xmin), y1: ax.Y(k.p), x2: ax.X(ax.xmax), y2: ax.Y(k.p), stroke: '#c2603f', 'stroke-width': 1.6, 'stroke-dasharray': '6 4' }, L);
    S('text', { x: ax.X(ax.xmax) - 4, y: ax.Y(k.p) - 5, 'text-anchor': 'end', 'font-size': 10, fill: '#a4492b', text: '理论概率 ' + M.fmt(k.p, 3) }, L);
    if (trail.length > 1) {
      S('polyline', {
        points: trail.map(function (p) { return M.fmt(ax.X(p[0]), 1) + ',' + M.fmt(ax.Y(p[1]), 1); }).join(' '),
        fill: 'none', stroke: '#3a5a93', 'stroke-width': 1.8
      }, L);
      var last = trail[trail.length - 1];
      S('circle', { cx: ax.X(last[0]), cy: ax.Y(last[1]), r: 4, fill: '#3a5a93' }, L);
    }
    var f = tosses ? heads / tosses : 0;
    M.$('#cn-n').textContent = tosses;
    M.$('#cn-hit').textContent = heads;
    M.$('#cn-freq').textContent = tosses ? M.fmt(f * 100, 1) + '%' : '—';
    M.$('#cn-p').textContent = M.fmt(k.p * 100, 1) + '%';
    M.$('#cn-diff').textContent = tosses ? M.fmt(Math.abs(f - k.p) * 100, 1) + ' 个百分点' : '—';
    M.$('#cn-text').innerHTML = tosses === 0 ? '点下面的按钮开始试验。'
      : tosses < 50 ? '次数还少，频率上下乱跳是正常的。<b>次数越多，折线越贴近红色虚线</b>，多点几次「做 100 次」看看。'
      : '做了 ' + tosses + ' 次，频率 ' + M.fmt(f * 100, 1) + '%，和理论值 ' + M.fmt(k.p * 100, 1) + '% 相差 ' + M.fmt(Math.abs(f - k.p) * 100, 1) + ' 个百分点。' +
        '<b>频率会在概率附近摆动并逐渐稳定</b>，但永远不会完全等于它——这正是「用频率估计概率」的道理。';
    M.setState({ k: kind });
  }

  /* ---------- 模型二：等可能事件的概率 ---------- */
  /* 一个袋子里放红、黄、蓝球，改数量看概率 */
  var ball = { r: 3, y: 2, b: 1 };

  function showBag() {
    var s = M.$('#bg-fig');
    s.innerHTML = '';
    var S = M.svg, total = ball.r + ball.y + ball.b;
    var COL = { r: '#c2603f', y: '#e3c05a', b: '#5d7cb0' };
    var i = 0, k;
    S('path', { d: 'M40 36h180v76a30 30 0 0 1-30 30H70a30 30 0 0 1-30-30z', fill: '#f3f5f8', stroke: '#8795b5', 'stroke-width': 1.6 }, s);
    for (k in ball) {
      for (var j = 0; j < ball[k]; j++) {
        var col = i % 7, row = (i / 7) | 0;
        S('circle', { cx: 60 + col * 24, cy: 62 + row * 24, r: 10, fill: COL[k], stroke: '#fff', 'stroke-width': 1.5 }, s);
        i++;
      }
    }
    var tb = M.$('#bg-table tbody');
    tb.innerHTML = '';
    [['r', '红球'], ['y', '黄球'], ['b', '蓝球']].forEach(function (p) {
      var tr = M.html('tr', {}, tb);
      M.html('td', { html: '<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + COL[p[0]] + '"></span> ' + p[1] }, tr);
      M.html('td', { class: 'n', text: ball[p[0]] + ' 个' }, tr);
      M.html('td', { class: 'n', html: M.frac(ball[p[0]], total) + ' = ' + M.fmt(ball[p[0]] / total * 100, 1) + '%' }, tr);
    });
    M.$('#bg-total').textContent = total + ' 个';
    M.$('#bg-sum').innerHTML = '三个概率加起来：' + M.fmt(100, 0) + '%，这是必然事件。' +
      '摸到<b>绿球</b>的概率是 0（不可能事件），摸到<b>任意一种颜色</b>的概率是 1（必然事件）。';
    M.$('#bg-text').innerHTML = '每个球被摸到的机会相同，一共 ' + total + ' 个球，所以 P(红) = ' + M.frac(ball.r, total) + '。' +
      '<b>等可能</b>是前提——如果红球特别大、更容易摸到，就不能这样算了。';
  }

  /* ---------- 模型三：事件的可能性排序 ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    M.chips(M.$('#cn-chips'), Object.keys(KINDS).map(function (k) { return { label: KINDS[k].name, value: k }; }), kind, function (v) { kind = v; reset(); });
    M.$('#cn-1').addEventListener('click', function () { run(1); });
    M.$('#cn-100').addEventListener('click', function () { run(100); });
    M.$('#cn-1000').addEventListener('click', function () { run(1000); });
    M.$('#cn-reset').addEventListener('click', reset);
    drawTrail();

    ['r', 'y', 'b'].forEach(function (k) {
      M.bindRange(M.$('#bg-' + k), function (v) { ball[k] = v; showBag(); });
    });
    showBag();

    M.match('#ev-list', '#ev-score', [
      ['太阳从东边升起', 'sure', '一定会发生，是必然事件，概率为 1'],
      ['掷一枚骰子，点数是 7', 'never', '不可能发生，概率为 0'],
      ['明天深圳下雨', 'maybe', '可能发生也可能不发生，是随机事件'],
      ['任意两个奇数相加得偶数', 'sure', '奇+奇=偶一定成立，是必然事件'],
      ['抛硬币连抛 3 次都是正面', 'maybe', '有可能，概率是 1/8，仍是随机事件'],
      ['从只装红球的袋子里摸出黑球', 'never', '袋里没有黑球，是不可能事件']
    ], [['sure', '必然事件'], ['maybe', '随机事件'], ['never', '不可能事件']], function (it, ok) { return it[2]; });

    M.quiz([
      {
        level: 'base',
        title: '做够 500 次，看频率稳在哪',
        desc: '点几次「做 100 次」，让总次数达到 500 以上。',
        label: '在抛硬币模型里操作',
        button: '检查试验次数',
        check: function () {
          if (tosses < 500) return { ok: false, msg: '现在才 ' + tosses + ' 次，再多做几轮。' };
          var f = heads / tosses, k = KINDS[kind];
          return { ok: true, msg: '做了 ' + tosses + ' 次，频率 ' + M.fmt(f * 100, 1) + '%，理论概率 ' + M.fmt(k.p * 100, 1) + '%，相差 ' + M.fmt(Math.abs(f - k.p) * 100, 1) + ' 个百分点。次数越多越接近，但通常不会刚好相等。' };
        }
      },
      {
        level: 'base',
        title: '「太阳从东方升起」是什么事件？',
        desc: '一定会发生的事件叫什么？',
        options: ['必然事件，概率为 1', '随机事件，概率为 0.5', '不可能事件，概率为 0', '无法判断'],
        answer: 0,
        hint: '它每天都会发生。',
        explain: '一定发生的是<b>必然事件</b>，概率为 <b>1</b>；一定不发生的是不可能事件，概率为 0；其余都是随机事件，概率在 0 和 1 之间。'
      },
      {
        level: 'base',
        title: '掷一枚骰子，点数是奇数的概率是？',
        desc: '骰子有 6 个面，奇数有几个？',
        options: ['1/2', '1/3', '1/6', '3'],
        answer: 0,
        hint: '奇数是 1、3、5，共 3 个。',
        explain: '3 ÷ 6 = <b>1/2</b>。等可能事件的概率 = 符合条件的结果数 ÷ 所有可能结果数。'
      },
      {
        level: 'mid',
        title: '抛硬币连续 5 次都是正面，第 6 次正面的概率是？',
        desc: '想想硬币会不会「记得」前面抛过什么。',
        options: ['还是 1/2', '小于 1/2，该出反面了', '大于 1/2，正面手感好', '无法确定'],
        answer: 0,
        hint: '每次抛硬币都是独立的。',
        explain: '硬币没有记忆，每一次正面的概率都是 1/2。觉得「连出正面后该出反面」是著名的<b>赌徒谬误</b>。'
      },
      {
        level: 'mid',
        title: '袋里 3 红 2 黄 1 蓝，摸到黄球的概率是？',
        desc: '可以在上面把滑块调成 3、2、1 验证。',
        options: ['1/3', '1/2', '1/6', '2/5'],
        answer: 0,
        hint: '黄球个数 ÷ 总数。',
        explain: '一共 6 个球，黄球 2 个，P(黄) = 2/6 = 1/3。注意分母是<b>总球数</b>，不是其他颜色的个数。'
      },
      {
        level: 'mid',
        title: '袋里有 4 个红球、6 个白球，摸到红球的概率是？',
        desc: '分母是总球数，不是另一种颜色的个数。',
        options: ['2/5', '2/3', '4/6', '1/4'],
        answer: 0,
        hint: '一共 10 个球。',
        explain: '4 ÷ 10 = <b>2/5</b>。常见错误是写成 4/6（拿红球比白球），<b>分母必须是总数</b>。'
      },
      {
        level: 'mid',
        title: '抛硬币 1000 次，正面出现 508 次，正面的概率约是？',
        desc: '频率可以用来估计概率。',
        options: ['0.5', '508', '0.508 且一定不是 0.5', '无法估计'],
        answer: 0,
        hint: '理论值是多少？频率在它附近摆动。',
        explain: '频率 0.508 很接近 <b>0.5</b>，说明正面的概率就是 0.5。频率每次都会有小幅波动，<b>试验次数越多越接近概率</b>，但通常不会刚好相等。'
      },
      {
        level: 'trap',
        title: '概率是 1/2 的事件，做 10 次一定发生 5 次吗？',
        desc: '想想你上面抛 10 次硬币的实际结果。',
        options: ['不一定，概率说的是大量重复后的规律', '一定，这就是概率的意思', '一定不会是 5 次', '只有抛硬币才不一定'],
        answer: 0,
        hint: '回到上面，只做 10 次试试看结果稳不稳。',
        explain: '概率描述的是<b>大量重复试验后的稳定趋势</b>，不是对单次或少数几次的保证。抛 10 次出现 3 次正面完全正常，抛 10000 次才会明显接近一半。'
      }
    ]);
  });
})();
