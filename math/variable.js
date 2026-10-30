/* 第 12 课 · 变量之间的关系（北师大版七下第六章） */
(function () {
  'use strict';
  var M = window.Mx, st = M.getState();

  /* ---------- 模型一：同一个关系，三种表示 ----------
     深圳某共享单车：起步 1.5 元含 15 分钟，之后每 10 分钟 1 元（不足按 10 分钟算）
     为了让初中生看清「变量」，这里用更简单的匀速行驶模型。 */
  var speed = M.num(st.v, 60, 20, 120);   // km/h
  var tNow = M.num(st.t, 2, 0, 5);        // 小时

  var ax = null;
  function showRel() {
    /* 表格 */
    var tb = M.$('#rl-table tbody');
    tb.innerHTML = '';
    [0, 1, 2, 3, 4, 5].forEach(function (t) {
      var tr = M.html('tr', { class: Math.abs(t - tNow) < 0.26 ? 'on' : '' }, tb);
      M.html('td', { class: 'n', text: t + ' 时' }, tr);
      M.html('td', { class: 'n', text: M.fmt(speed * t) + ' km' }, tr);
    });
    /* 图象 */
    ax = M.axes(M.$('#rl-fig'), {
      xmin: 0, xmax: 5, ymin: 0, ymax: 620, xstep: 1, ystep: 100,
      labelStep: 1, ylabelStep: 200, left: 40, bottom: 24, top: 12,
      xlabel: 't（时）', ylabel: 's（km）'
    });
    var S = M.svg, L = ax.layer;
    S('path', { d: M.curve(ax, function (t) { return speed * t; }, 0, 5), fill: 'none', stroke: '#2f5aa8', 'stroke-width': 2.4 }, L);
    var y = speed * tNow;
    S('line', { x1: ax.X(tNow), y1: ax.Y(0), x2: ax.X(tNow), y2: ax.Y(y), stroke: '#c2603f', 'stroke-width': 1.2, 'stroke-dasharray': '4 3' }, L);
    S('line', { x1: ax.X(0), y1: ax.Y(y), x2: ax.X(tNow), y2: ax.Y(y), stroke: '#c2603f', 'stroke-width': 1.2, 'stroke-dasharray': '4 3' }, L);
    S('circle', { cx: ax.X(tNow), cy: ax.Y(y), r: 5, fill: '#c2603f', stroke: '#fff', 'stroke-width': 1.6 }, L);

    M.$('#rl-expr').innerHTML = '<b>s = ' + M.fmt(speed) + 't</b>';
    M.$('#rl-t').textContent = M.fmt(tNow) + ' 时';
    M.$('#rl-s').textContent = M.fmt(y) + ' km';
    M.$('#rl-indep').textContent = 't（时间）';
    M.$('#rl-dep').textContent = 's（路程）';
    M.$('#rl-text').innerHTML = '时间 <var>t</var> 自己变，路程 <var>s</var> 跟着它变，所以 <var>t</var> 是<b>自变量</b>、<var>s</var> 是<b>因变量</b>。' +
      '速度 ' + M.fmt(speed) + ' 在这个过程里不变，叫<b>常量</b>。' +
      '把速度调一下，你会看到图象的<b>陡峭程度</b>跟着变——速度越大，线越陡。';
    M.setState({ v: speed, t: tNow, s: story });
  }

  /* ---------- 模型二：看图说故事 ---------- */
  var STORIES = [
    { id: 'walk', name: '上学路上', pts: [[0, 0], [10, 800], [14, 800], [24, 2000]],
      xmax: 26, ymax: 2200, xl: '时间（分）', yl: '离家距离（米）',
      tell: '前 10 分钟匀速走了 800 米；中间 4 分钟<b>图象是水平的，说明没动</b>（在等红灯或买早餐）；最后 10 分钟又走了 1200 米，比前面<b>更陡，所以走得更快</b>。' },
    { id: 'back', name: '去超市又回家', pts: [[0, 0], [8, 600], [18, 600], [30, 0]],
      xmax: 32, ymax: 800, xl: '时间（分）', yl: '离家距离（米）',
      tell: '走了 8 分钟到 600 米处的超市；在超市待了 10 分钟；最后 12 分钟<b>图象下降，说明在往回走</b>，回到家距离变成 0。' },
    { id: 'tank', name: '水池放水', pts: [[0, 40], [6, 40], [16, 10], [22, 10]],
      xmax: 24, ymax: 46, xl: '时间（分）', yl: '水深（cm）',
      tell: '前 6 分钟水深没变（还没开闸）；中间 10 分钟从 40 cm 降到 10 cm，<b>每分钟降 3 cm</b>；最后水深不再变化（放完了或关闸了）。' }
  ];
  var story = st.s || 'walk';

  function showStory() {
    var sObj = null;
    STORIES.forEach(function (x) { if (x.id === story) sObj = x; });
    var a = M.axes(M.$('#sy-fig'), {
      xmin: 0, xmax: sObj.xmax, ymin: 0, ymax: sObj.ymax,
      xstep: sObj.xmax > 28 ? 4 : 2, ystep: sObj.ymax > 1000 ? 400 : (sObj.ymax > 100 ? 200 : 10),
      labelStep: sObj.xmax > 28 ? 8 : 4, ylabelStep: sObj.ymax > 1000 ? 800 : (sObj.ymax > 100 ? 200 : 20),
      left: 44, bottom: 24, top: 12, xlabel: sObj.xl, ylabel: sObj.yl
    });
    var S = M.svg, L = a.layer;
    S('polyline', {
      points: sObj.pts.map(function (p) { return M.fmt(a.X(p[0]), 1) + ',' + M.fmt(a.Y(p[1]), 1); }).join(' '),
      fill: 'none', stroke: '#2f5aa8', 'stroke-width': 2.6, 'stroke-linejoin': 'round'
    }, L);
    sObj.pts.forEach(function (p) {
      S('circle', { cx: a.X(p[0]), cy: a.Y(p[1]), r: 3.6, fill: '#2f5aa8' }, L);
    });
    M.$('#sy-tell').innerHTML = sObj.tell;
    M.$('#sy-key').innerHTML = '读图三看：<b>看升降</b>（上升=变大，水平=不变，下降=变小）、<b>看陡缓</b>（越陡变化越快）、<b>看起止点</b>（开始和结束各是多少）。';
    M.setState({ v: speed, t: tNow, s: story });
  }

  /* ---------- 装配 ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    M.bindRange(M.$('#rl-v'), function (v) { speed = v; showRel(); })();
    M.bindRange(M.$('#rl-t'), function (v) { tNow = v; showRel(); });
    M.chips(M.$('#sy-chips'), STORIES.map(function (s) { return { label: s.name, value: s.id }; }), story, function (v) { story = v; showStory(); });
    showStory();

    M.quiz([
      {
        level: 'base',
        title: '把速度调成 80，看 3 小时走多远',
        desc: '拖速度滑块到 80 km/h，再把时间滑块拖到 3。',
        label: '在三种表示模型里调滑块',
        button: '检查两个滑块',
        check: function () {
          if (speed !== 80) return { ok: false, msg: '速度现在是 ' + M.fmt(speed) + '，调到 80。' };
          if (Math.abs(tNow - 3) > 1e-9) return { ok: false, msg: '时间现在是 ' + M.fmt(tNow) + ' 时，调到 3。' };
          return { ok: true, msg: 's = 80 × 3 = 240 km。表格、关系式、图象说的是<b>同一件事</b>，只是表达方式不同：表格给出几个具体值，关系式最精确，图象最能看出趋势。' };
        }
      },
      {
        level: 'base',
        title: '正方形边长 a、周长 C = 4a，谁是自变量？',
        desc: '谁变在先，谁跟着变？',
        options: ['a 是自变量，C 是因变量', 'C 是自变量，a 是因变量', '4 是自变量', '两个都是自变量'],
        answer: 0,
        hint: '是边长决定周长，还是周长决定边长？',
        explain: '边长 <b>a 是自变量</b>，周长 C 随它变化，是<b>因变量</b>；4 在整个过程中不变，是<b>常量</b>。'
      },
      {
        level: 'base',
        title: '下面哪种方式最适合精确算出任意时刻的值？',
        desc: '表格、关系式、图象各有长处。',
        options: ['关系式', '表格', '图象', '三种都一样'],
        answer: 0,
        hint: '哪种能代入任意一个数去算？',
        explain: '<b>关系式</b>最精确，任意自变量都能算出结果；表格只给出有限几组；图象最能看趋势但读数有误差。'
      },
      {
        level: 'mid',
        title: '图象里有一段是水平的，说明什么？',
        desc: '看「上学路上」那张图中间那段。',
        options: ['离家距离没变，人停下来了', '人在匀速前进', '人在往回走', '人走得更快了'],
        answer: 0,
        hint: '水平意味着纵坐标不随时间变化。',
        explain: '水平段表示因变量<b>不随时间改变</b>，也就是距离没变——人停住了。下降段才表示往回走。'
      },
      {
        level: 'mid',
        title: '在 s = 60t 里，哪个是自变量？',
        desc: '谁变在先，谁跟着变？',
        options: ['t', 's', '60', 's 和 t 都是'],
        answer: 0,
        hint: '时间自己流逝，路程跟着时间走。',
        explain: '<var>t</var> 是自变量，<var>s</var> 是因变量，60 是常量。判断方法：<b>谁被谁决定</b>——路程由时间决定，所以时间是自变量。'
      },
      {
        level: 'mid',
        title: '图象中有一段向下倾斜，说明因变量怎么变？',
        desc: '向下走意味着纵坐标在减小。',
        options: ['随自变量增大而减小', '随自变量增大而增大', '保持不变', '先增后减'],
        answer: 0,
        hint: '看纵坐标是往上还是往下。',
        explain: '下降段表示因变量<b>在减小</b>。在「离家距离」图里就是往回走，在「水深」图里就是水在变少。'
      },
      {
        level: 'mid',
        title: '汽车以 60 km/时 行驶，4 小时走多远？',
        desc: '关系式 s = 60t。',
        options: ['240 km', '64 km', '15 km', '600 km'],
        answer: 0,
        hint: '把 t = 4 代进去。',
        explain: 's = 60 × 4 = <b>240 km</b>。关系式的好处就是代入即可，不用查表也不用看图。'
      },
      {
        level: 'trap',
        title: '一张「离家距离—时间」图上有一段水平线，表示什么？',
        desc: '水平意味着纵坐标没有变化。',
        options: ['人停下来了，距离没变', '人在匀速前进', '人在往回走', '人走得特别慢'],
        answer: 0,
        hint: '匀速前进的图象是斜线还是水平线？',
        explain: '水平段表示离家距离<b>完全没变</b>——人停住了。匀速前进对应的是一条<b>向上的斜线</b>。把水平误读成「匀速」是读图最常见的错误。'
      }
    ]);
  });
})();
