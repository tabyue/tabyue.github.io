/* 第 27 课 · 反比例函数（北师大版九上第六章） */
(function () {
  'use strict';
  var M = window.Mx, st = M.getState();

  /* ---------- 模型一：k 决定双曲线在哪两个象限 ---------- */
  var k = M.num(st.k, 6, -12, 12), px = M.num(st.x, 2, -8, 8);
  var ax = null;

  function showHyp() {
    if (k === 0) k = 1;
    ax = M.axes(M.$('#hy-fig'), {
      xmin: -8, xmax: 8, ymin: -8, ymax: 8, xstep: 1, ystep: 1,
      labelStep: 2, ylabelStep: 2, left: 28, right: 10, top: 10, bottom: 22
    });
    var S = M.svg, L = ax.layer;
    /* 两支分别画，x=0 处断开 */
    S('path', { d: M.curve(ax, function (x) { return k / x; }, 0.02, 8, 300), fill: 'none', stroke: '#2f5aa8', 'stroke-width': 2.6 }, L);
    S('path', { d: M.curve(ax, function (x) { return k / x; }, -8, -0.02, 300), fill: 'none', stroke: '#2f5aa8', 'stroke-width': 2.6 }, L);
    /* 点 P 与它围成的矩形 */
    if (px !== 0) {
      var py = k / px;
      if (Math.abs(py) <= 8) {
        S('rect', {
          x: Math.min(ax.X(0), ax.X(px)), y: Math.min(ax.Y(0), ax.Y(py)),
          width: Math.abs(ax.X(px) - ax.X(0)), height: Math.abs(ax.Y(py) - ax.Y(0)),
          fill: '#f0d4cb', opacity: .55, stroke: '#c2603f', 'stroke-width': 1.3, 'stroke-dasharray': '4 3'
        }, L);
        S('circle', { cx: ax.X(px), cy: ax.Y(py), r: 6, fill: '#c2603f', stroke: '#fff', 'stroke-width': 2 }, L);
        S('text', { x: ax.X(px) + 9, y: ax.Y(py) - 8, 'font-size': 10.5, 'font-weight': 700, fill: '#a4492b', text: '(' + M.fmt(px) + ', ' + M.fmt(py, 2) + ')' }, L);
      }
    }
    M.$('#hy-expr').innerHTML = 'y = <span class="frac"><i>' + M.fmt(k) + '</i><i>x</i></span>';
    M.$('#hy-quad').textContent = k > 0 ? '第一、三象限' : '第二、四象限';
    M.$('#hy-trend').textContent = k > 0 ? '每支上 y 随 x 增大而减小' : '每支上 y 随 x 增大而增大';
    M.$('#hy-area').innerHTML = px === 0 ? '—' : '|xy| = |' + M.fmt(px) + ' × ' + M.fmt(k / px, 2) + '| = <b>' + M.fmt(Math.abs(k)) + '</b>';
    M.$('#hy-text').innerHTML = '把点 P 沿曲线拖动（改 x），你会发现<b>红色矩形的面积始终是 |k| = ' + M.fmt(Math.abs(k)) + '</b>，' +
      '因为 xy = k 恒成立。这就是「<b>k 的几何意义</b>」，考试里非常常用。<br>' +
      '另外要注意：k &gt; 0 时虽然每一支上 y 都随 x 增大而减小，但<b>必须说「在每一支上」</b>——' +
      '从第三象限跨到第一象限时 y 反而变大了。';
    M.setState({ k: k, x: px, v: vIdx });
  }

  /* ---------- 模型二：实际例子，总量一定时的反比例 ---------- */
  var vIdx = M.num(st.v, 60, 20, 180);
  var DIST = 360;

  function showTrip() {
    var a2 = M.axes(M.$('#tp-fig'), {
      xmin: 0, xmax: 200, ymin: 0, ymax: 20, xstep: 20, ystep: 4,
      labelStep: 50, ylabelStep: 4, left: 34, bottom: 24, top: 12,
      xlabel: '速度 v（km/时）', ylabel: 't（时）'
    });
    var S = M.svg, L = a2.layer;
    S('path', { d: M.curve(a2, function (v) { return DIST / v; }, 18, 200, 300), fill: 'none', stroke: '#2f5aa8', 'stroke-width': 2.6 }, L);
    var t = DIST / vIdx;
    if (t <= 20) {
      S('line', { x1: a2.X(vIdx), y1: a2.Y(0), x2: a2.X(vIdx), y2: a2.Y(t), stroke: '#c2603f', 'stroke-width': 1.2, 'stroke-dasharray': '4 3' }, L);
      S('line', { x1: a2.X(0), y1: a2.Y(t), x2: a2.X(vIdx), y2: a2.Y(t), stroke: '#c2603f', 'stroke-width': 1.2, 'stroke-dasharray': '4 3' }, L);
      S('circle', { cx: a2.X(vIdx), cy: a2.Y(t), r: 5.5, fill: '#c2603f', stroke: '#fff', 'stroke-width': 1.8 }, L);
    }
    M.$('#tp-v').textContent = vIdx + ' km/时';
    M.$('#tp-t').textContent = M.fmt(t, 2) + ' 小时';
    M.$('#tp-expr').innerHTML = 't = <span class="frac"><i>' + DIST + '</i><i>v</i></span>';
    M.$('#tp-text').innerHTML = '路程固定 ' + DIST + ' km 时，时间和速度成<b>反比例</b>：速度翻倍，时间减半。' +
      '注意图象<b>不会碰到坐标轴</b>——速度再大，时间也只会越来越接近 0 而永远到不了 0；' +
      '速度也不可能是 0（那样永远到不了）。所以反比例函数的 x 和 y 都<b>不能取 0</b>。';
    M.setState({ k: k, x: px, v: vIdx });
  }

  document.addEventListener('DOMContentLoaded', function () {
    M.bindRange(M.$('#hy-k'), function (v) { k = v || 1; showHyp(); });
    M.bindRange(M.$('#hy-x'), function (v) { px = v; showHyp(); });
    showHyp();
    M.bindRange(M.$('#tp-range'), function (v) { vIdx = v; showTrip(); })();

    M.match('#cm-list', '#cm-score', [
      ['y = 3x', 'pos', '正比例函数，图象是过原点的直线'],
      ['y = 3/x', 'inv', '反比例函数，图象是双曲线'],
      ['y = 3x + 1', 'other', '一次函数，但不是正比例（不过原点）'],
      ['xy = 5', 'inv', '可化成 y = 5/x，是反比例函数'],
      ['y = x²', 'other', '二次函数'],
      ['y = −2/x', 'inv', 'k = −2 的反比例函数，图象在二、四象限'],
      ['面积一定时，长与宽', 'inv', '长 × 宽 = 定值，成反比例'],
      ['单价一定时，总价与数量', 'pos', '总价 = 单价 × 数量，成正比例']
    ], [['pos', '正比例'], ['inv', '反比例'], ['other', '都不是']], function (it, ok) { return it[2]; });

    M.quiz([
      {
        level: 'base',
        title: '把 k 调成负数，看图象跑到哪',
        desc: '拖动 k 滑块让它小于 0。',
        label: '在双曲线模型里调 k',
        button: '检查 k 的符号',
        check: function () {
          if (k > 0) return { ok: false, msg: '现在 k = ' + M.fmt(k) + '，调成负数试试。' };
          return { ok: true, msg: 'k &lt; 0 时双曲线在<b>第二、四象限</b>，每一支上 y 随 x 增大而<b>增大</b>。k 的正负决定了图象在哪两个象限。' };
        }
      },
      {
        level: 'base',
        title: '下面哪个是反比例函数？',
        desc: '形式是 y = k/x（k ≠ 0）。',
        options: ['y = 3/x', 'y = 3x', 'y = 3x + 1', 'y = x²'],
        answer: 0,
        hint: '自变量要在分母上。',
        explain: '<b>y = 3/x</b> 是反比例函数，也可写成 xy = 3。y = 3x 是正比例，y = 3x + 1 是一次函数，y = x² 是二次函数。'
      },
      {
        level: 'base',
        title: '反比例函数 y = 6/x 的图象在哪两个象限？',
        desc: 'k 的正负决定象限。',
        options: ['第一、三象限', '第二、四象限', '第一、二象限', '四个象限都有'],
        answer: 0,
        hint: 'k = 6 > 0。',
        explain: 'k &gt; 0 时图象在<b>第一、三象限</b>；k &lt; 0 时在第二、四象限。记忆：k 的符号 = x 与 y 乘积的符号。'
      },
      {
        level: 'mid',
        title: '反比例函数图象上任一点与两轴围成的矩形面积是？',
        desc: '拖动点 P 看红色矩形的面积变不变。',
        options: ['恒等于 |k|', '随点的位置变化', '等于 k²', '等于 2|k|'],
        answer: 0,
        hint: '矩形面积 = |x| × |y|，而 xy = k。',
        explain: '面积 = |x|·|y| = |xy| = <b>|k|</b>，与点的位置<b>无关</b>。这是反比例函数最常考的性质，叫「k 的几何意义」。'
      },
      {
        level: 'mid',
        title: 'y = 6/x 的图象上，为什么 x 不能等于 0？',
        desc: '想想分母为 0 会怎样。',
        options: ['分母不能为 0，所以图象永远碰不到 y 轴', '因为 0 不是正数', '可以等于 0，只是图上没画', '因为 k 是正数'],
        answer: 0,
        hint: '回忆分式有意义的条件。',
        explain: '分母 x ≠ 0，所以图象<b>永远不与 y 轴相交</b>；同理 y = 6/x 也取不到 0，图象也不与 x 轴相交。它只会无限接近两条坐标轴。'
      },
      {
        level: 'mid',
        title: '点 (2, 3) 在反比例函数 y = k/x 上，k 等于？',
        desc: '把点代入，或者直接用 k = xy。',
        options: ['6', '1.5', '5', '2/3'],
        answer: 0,
        hint: 'k = x · y。',
        explain: 'k = 2 × 3 = <b>6</b>。反比例函数的 <b>k = xy</b>，图象上任何一点的横纵坐标之积都等于 k。'
      },
      {
        level: 'mid',
        title: '反比例函数图象上一点向两轴作垂线，围成矩形面积是？',
        desc: '上面拖动点 P，看红色矩形的面积变不变。',
        options: ['|k|，与点的位置无关', '随点的位置变化', 'k²', '2|k|'],
        answer: 0,
        hint: '面积 = |x| × |y|，而 xy = k。',
        explain: '面积 = |x|·|y| = |xy| = <b>|k|</b>，<b>与点的位置无关</b>。这就是「k 的几何意义」，是反比例函数最常考的性质。'
      },
      {
        level: 'trap',
        title: 'k > 0 时，说「y 随 x 增大而减小」对吗？',
        desc: '试试 x = −1 和 x = 1 两个点，看 y 谁大。',
        options: ['不完整，必须加「在每一支上」', '完全正确', '完全错误', '只有 x > 0 时才成立'],
        answer: 0,
        hint: '这两个点在不在同一支曲线上？',
        explain: '必须说<b>「在每一支上」</b>。取 x = −1 得 y = −k，取 x = 1 得 y = k，x 增大 y 反而增大了——因为<b>跨过了两支</b>。比较大小前先确认两点在不在同一支。'
      }
    ]);
  });
})();
