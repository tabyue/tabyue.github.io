/* 第 18 课 · 数据的分析（北师大版八上第六章，含新教材的箱线图） */
(function () {
  'use strict';
  var M = window.Mx, st = M.getState();

  /* ---------- 模型一：平均数、中位数、众数谁更靠谱 ---------- */
  /* 一组可调的数据：9 个人的月收入（千元），最后一个可以拖成「老板」 */
  var vals = [4, 5, 5, 6, 6, 6, 7, 8, 9];
  var boss = M.num(st.b, 9, 5, 60);

  function stats(arr) {
    var a = arr.slice().sort(function (p, q) { return p - q; });
    var n = a.length;
    var mean = a.reduce(function (s, v) { return s + v; }, 0) / n;
    var med = n % 2 ? a[(n - 1) / 2] : (a[n / 2 - 1] + a[n / 2]) / 2;
    var cnt = {}, best = null, bestN = 0;
    a.forEach(function (v) { cnt[v] = (cnt[v] || 0) + 1; if (cnt[v] > bestN) { bestN = cnt[v]; best = v; } });
    var modes = Object.keys(cnt).filter(function (k2) { return cnt[k2] === bestN; }).map(Number);
    var vari = a.reduce(function (s, v) { return s + (v - mean) * (v - mean); }, 0) / n;
    return { sorted: a, mean: mean, med: med, mode: bestN > 1 ? modes : null, vari: vari, sd: Math.sqrt(vari) };
  }

  function cur() { return vals.slice(0, 8).concat([boss]); }

  function showStats() {
    var arr = cur(), r = stats(arr);
    var s = M.$('#st-fig');
    s.innerHTML = '';
    var S = M.svg, ox = 24, base = 148, w = 288;
    var max = Math.max(60, Math.max.apply(null, arr));
    var kx = w / max;
    /* 每个人画一个点 */
    S('line', { x1: ox, y1: base, x2: ox + w, y2: base, stroke: '#8795b5', 'stroke-width': 1.4 }, s);
    arr.forEach(function (v, i) {
      S('circle', { cx: ox + v * kx, cy: base - 14 - (i % 3) * 13, r: 5.5, fill: i === 8 ? '#c2603f' : '#5d7cb0', opacity: .9 }, s);
    });
    [[r.mean, '#c2603f', '平均数'], [r.med, '#3f7d6a', '中位数']].forEach(function (m, i) {
      S('line', { x1: ox + m[0] * kx, y1: base - 76, x2: ox + m[0] * kx, y2: base + 4, stroke: m[1], 'stroke-width': 2, 'stroke-dasharray': '5 4' }, s);
      S('text', { x: ox + m[0] * kx, y: base - 80 + i * 0, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 700, fill: m[1], text: m[2] + ' ' + M.fmt(m[0], 2) }, s);
    });
    for (var t = 0; t <= max; t += 10) {
      S('text', { x: ox + t * kx, y: base + 16, 'text-anchor': 'middle', 'font-size': 9.5, fill: '#6b7385', text: t }, s);
    }
    M.$('#st-mean').textContent = M.fmt(r.mean, 2);
    M.$('#st-med').textContent = M.fmt(r.med, 2);
    M.$('#st-mode').textContent = r.mode ? r.mode.join('、') : '无';
    M.$('#st-var').textContent = M.fmt(r.vari, 2);
    M.$('#st-boss').textContent = boss + ' 千元';
    M.$('#st-text').innerHTML = boss > 20
      ? '老板的收入涨到 ' + boss + ' 千元后，<b>平均数被拉到 ' + M.fmt(r.mean, 2) + '</b>，比 9 个人里 8 个人的收入都高——这时用平均数说「人均收入」就很误导。' +
        '而<b>中位数始终是 ' + M.fmt(r.med, 2) + '</b>，不受极端值影响，更能代表「中间水平」。'
      : '现在没有特别极端的数据，平均数（' + M.fmt(r.mean, 2) + '）和中位数（' + M.fmt(r.med, 2) + '）比较接近。' +
        '<b>把老板那个点往右拖</b>，你会看到平均数被拉走，中位数却几乎不动。';
    M.setState({ b: boss, g: groupIdx });
  }

  /* ---------- 模型二：箱线图（五数概括） ---------- */
  var GROUPS = [
    { name: '甲班', data: [62, 68, 71, 73, 75, 76, 78, 79, 80, 82, 83, 85, 86, 88, 91] },
    { name: '乙班', data: [51, 58, 64, 69, 72, 75, 77, 80, 83, 86, 89, 92, 95, 97, 99] }
  ];
  var groupIdx = M.num(st.g, 0, 0, 1);

  function five(a) {
    var s = a.slice().sort(function (p, q) { return p - q; }), n = s.length;
    function q(p) {
      var pos = (n - 1) * p, lo = Math.floor(pos), hi = Math.ceil(pos);
      return s[lo] + (s[hi] - s[lo]) * (pos - lo);
    }
    return { min: s[0], q1: q(0.25), med: q(0.5), q3: q(0.75), max: s[n - 1] };
  }

  function showBox() {
    var s = M.$('#bx-fig');
    s.innerHTML = '';
    var S = M.svg, ox = 30, w = 272, lo = 45, hi = 105;
    var kx = w / (hi - lo);
    S('line', { x1: ox, y1: 136, x2: ox + w, y2: 136, stroke: '#8795b5', 'stroke-width': 1.3 }, s);
    for (var t = 50; t <= 100; t += 10) {
      S('line', { x1: ox + (t - lo) * kx, y1: 132, x2: ox + (t - lo) * kx, y2: 140, stroke: '#8d95a6', 'stroke-width': 1 }, s);
      S('text', { x: ox + (t - lo) * kx, y: 153, 'text-anchor': 'middle', 'font-size': 9.5, fill: '#6b7385', text: t }, s);
    }
    GROUPS.forEach(function (g, i) {
      var f = five(g.data), y = 46 + i * 54, h = 26;
      var col = i === 0 ? '#5d7cb0' : '#c2603f';
      function X(v) { return ox + (v - lo) * kx; }
      /* 须 */
      S('line', { x1: X(f.min), y1: y + h / 2, x2: X(f.q1), y2: y + h / 2, stroke: col, 'stroke-width': 1.4 }, s);
      S('line', { x1: X(f.q3), y1: y + h / 2, x2: X(f.max), y2: y + h / 2, stroke: col, 'stroke-width': 1.4 }, s);
      S('line', { x1: X(f.min), y1: y + 4, x2: X(f.min), y2: y + h - 4, stroke: col, 'stroke-width': 1.6 }, s);
      S('line', { x1: X(f.max), y1: y + 4, x2: X(f.max), y2: y + h - 4, stroke: col, 'stroke-width': 1.6 }, s);
      /* 箱 */
      S('rect', { x: X(f.q1), y: y, width: X(f.q3) - X(f.q1), height: h, fill: i === 0 ? '#dbe4f4' : '#f7e2da', stroke: col, 'stroke-width': 1.6 }, s);
      S('line', { x1: X(f.med), y1: y, x2: X(f.med), y2: y + h, stroke: col, 'stroke-width': 2.4 }, s);
      S('text', { x: ox - 6, y: y + h / 2 + 4, 'text-anchor': 'end', 'font-size': 11, 'font-weight': 700, fill: col, text: g.name }, s);
      if (i === groupIdx) {
        [['最小值', f.min], ['Q₁', f.q1], ['中位数', f.med], ['Q₃', f.q3], ['最大值', f.max]].forEach(function (p, j) {
          S('text', { x: X(p[1]), y: y - 6 - (j % 2) * 11, 'text-anchor': 'middle', 'font-size': 9, fill: col, text: M.fmt(p[1], 1) }, s);
        });
      }
    });
    var f0 = five(GROUPS[groupIdx].data), g = GROUPS[groupIdx];
    var r0 = stats(GROUPS[0].data), r1 = stats(GROUPS[1].data);
    M.$('#bx-name').textContent = g.name;
    M.$('#bx-min').textContent = M.fmt(f0.min, 1);
    M.$('#bx-q1').textContent = M.fmt(f0.q1, 1);
    M.$('#bx-med').textContent = M.fmt(f0.med, 1);
    M.$('#bx-q3').textContent = M.fmt(f0.q3, 1);
    M.$('#bx-max').textContent = M.fmt(f0.max, 1);
    M.$('#bx-iqr').textContent = M.fmt(f0.q3 - f0.q1, 1);
    M.$('#bx-text').innerHTML = '箱线图用<b>五个数</b>概括一组数据：最小值、下四分位数 Q₁、中位数、上四分位数 Q₃、最大值。' +
      '<b>箱子装着中间一半的数据</b>（从 Q₁ 到 Q₃），箱子越短说明中间这半人越集中。' +
      '两班平均分很接近（甲 ' + M.fmt(r0.mean, 1) + '、乙 ' + M.fmt(r1.mean, 1) + '），' +
      '但乙班的箱子和须都更长、方差更大（甲 ' + M.fmt(r0.vari, 1) + '、乙 ' + M.fmt(r1.vari, 1) + '），说明<b>乙班成绩更分散、不够稳定</b>。';
    M.setState({ b: boss, g: groupIdx });
  }

  document.addEventListener('DOMContentLoaded', function () {
    M.bindRange(M.$('#st-range'), function (v) { boss = v; showStats(); })();
    M.chips(M.$('#bx-chips'), GROUPS.map(function (g, i) { return { label: g.name, value: String(i) }; }), String(groupIdx), function (v) { groupIdx = +v; showBox(); });
    showBox();

    M.match('#ch-list', '#ch-score', [
      ['想知道班里「中间水平」的同学考多少分', 'med', '中位数不受个别极高或极低分影响'],
      ['想知道哪个鞋码进货最多', 'mode', '众数就是出现次数最多的那个'],
      ['想比较两个班谁的成绩更整齐', 'var', '方差越小越整齐'],
      ['计算全班总分再分摊到每人', 'mean', '这就是平均数的定义'],
      ['一个班有位同学考了满分、其余都很低，想反映多数人水平', 'med', '有极端值时中位数更有代表性'],
      ['统计最受欢迎的社团', 'mode', '看哪个选项出现最多，用众数']
    ], [['mean', '平均数'], ['med', '中位数'], ['mode', '众数'], ['var', '方差']], function (it, ok) { return it[2]; });

    M.quiz([
      {
        level: 'base',
        title: '把老板的收入拖到 50 千元以上',
        desc: '看平均数和中位数谁被拉走了。',
        label: '在收入模型里拖滑块',
        button: '检查现在的数据',
        check: function () {
          if (boss < 50) return { ok: false, msg: '现在是 ' + boss + ' 千元，再往右拖到 50 以上。' };
          var r = stats(cur());
          return { ok: true, msg: '平均数变成 ' + M.fmt(r.mean, 2) + '，中位数还是 ' + M.fmt(r.med, 2) + '。<b>平均数怕极端值，中位数不怕</b>——所以报道收入时常用中位数。' };
        }
      },
      {
        level: 'base',
        title: '数据 3、5、5、7、10 的众数是？',
        desc: '众数是出现次数最多的那个数。',
        options: ['5', '7', '6', '5.5'],
        answer: 0,
        hint: '哪个数出现了两次？',
        explain: '5 出现两次，其余各一次，众数是 <b>5</b>。注意众数可能不止一个，也可能没有。'
      },
      {
        level: 'base',
        title: '数据 2、4、6、8、10 的平均数是？',
        desc: '所有数之和除以个数。',
        options: ['6', '5', '30', '4'],
        answer: 0,
        hint: '(2+4+6+8+10) ÷ 5。',
        explain: '30 ÷ 5 = <b>6</b>。这组数据的中位数也是 6——当数据均匀分布时，两者常常相等。'
      },
      {
        level: 'mid',
        title: '两组数据平均分相同，方差大的说明什么？',
        desc: '看上面两个班的箱线图。',
        options: ['成绩更分散，不够稳定', '成绩更好', '人数更多', '中位数更大'],
        answer: 0,
        hint: '方差衡量的是「离平均数有多远」。',
        explain: '方差越大，数据<b>越分散</b>。平均分一样时，方差小的那组更整齐稳定。体育选拔、产品质量检验都看这个。'
      },
      {
        level: 'mid',
        title: '箱线图里的「箱子」装的是多少数据？',
        desc: '箱子从 Q₁ 到 Q₃。',
        options: ['中间 50% 的数据', '全部数据', '中间 25% 的数据', '最高的 50%'],
        answer: 0,
        hint: 'Q₁ 以下占 25%，Q₃ 以上占 25%。',
        explain: 'Q₁ 到 Q₃ 之间正好是<b>中间一半</b>的数据，这段长度叫四分位距。箱子越短，中间这半数据越集中。'
      },
      {
        level: 'mid',
        title: '数据 1、3、5、7 的中位数是？',
        desc: '偶数个数据时，中位数取中间两个的平均数。',
        options: ['4', '3', '5', '3.5'],
        answer: 0,
        hint: '中间两个是 3 和 5。',
        explain: '(3 + 5) ÷ 2 = <b>4</b>。<b>偶数个数据要取中间两个的平均数</b>，这一点经常被忽略。另外求中位数前<b>必须先排序</b>。'
      },
      {
        level: 'mid',
        title: '两名射手平均成绩相同，要选稳定的那个，应比较？',
        desc: '稳定说的是波动大小。',
        options: ['方差，选方差小的', '平均数，选大的', '众数，选大的', '中位数，选大的'],
        answer: 0,
        hint: '哪个统计量衡量数据的离散程度？',
        explain: '比较<b>方差</b>，方差越小越稳定。平均数相同时，正是靠方差分高下——体育选拔、产品质检都用这个思路。'
      },
      {
        level: 'trap',
        title: '某公司平均月薪 1.2 万，能说明多数员工月薪 1.2 万吗？',
        desc: '上面把老板的收入拖高，看平均数怎么变。',
        options: ['不能，少数高薪会把平均数拉高', '能，平均数就代表多数人', '不能，因为平均数算错了', '能，只要人数够多'],
        answer: 0,
        hint: '平均数对极端值敏感吗？',
        explain: '<b>平均数容易被极端值拉偏</b>。只要有少数高管拿高薪，平均数就会远高于多数人的实际工资。这种情况下<b>中位数</b>更能代表「中间水平」。'
      }
    ]);
  });
})();
