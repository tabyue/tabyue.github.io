/* 第 30 课 · 圆（北师大版九下第三章） */
(function () {
  'use strict';
  var M = window.Mx, st = M.getState();

  /* ---------- 模型一：圆周角与圆心角 ---------- */
  var pA = M.num(st.a, 200, 0, 359), pB = M.num(st.b, 340, 0, 359), pP = M.num(st.p, 90, 0, 359);
  var CX = 150, CY = 112, R = 86;

  function pt(deg) {
    var r = deg * Math.PI / 180;
    return [CX + R * Math.cos(r), CY - R * Math.sin(r)];
  }

  function showAngle() {
    var s = M.$('#cc-fig');
    s.innerHTML = '';
    var S = M.svg;
    S('circle', { cx: CX, cy: CY, r: R, fill: '#f5f7fb', stroke: '#5d7cb0', 'stroke-width': 2 }, s);
    var A = pt(pA), B = pt(pB), P = pt(pP), O = [CX, CY];
    /* 被 A、B 截的弧（不含 P 的那段）高亮 */
    var large = ((pB - pA + 360) % 360) > 180 ? 1 : 0;
    S('path', { d: 'M' + M.fmt(A[0], 1) + ' ' + M.fmt(A[1], 1) + 'A' + R + ' ' + R + ' 0 ' + large + ' 0 ' + M.fmt(B[0], 1) + ' ' + M.fmt(B[1], 1), fill: 'none', stroke: '#c2603f', 'stroke-width': 4 }, s);
    /* 圆心角 */
    S('line', { x1: O[0], y1: O[1], x2: A[0], y2: A[1], stroke: '#3f7d6a', 'stroke-width': 1.8 }, s);
    S('line', { x1: O[0], y1: O[1], x2: B[0], y2: B[1], stroke: '#3f7d6a', 'stroke-width': 1.8 }, s);
    /* 圆周角 */
    S('line', { x1: P[0], y1: P[1], x2: A[0], y2: A[1], stroke: '#2f5aa8', 'stroke-width': 1.8 }, s);
    S('line', { x1: P[0], y1: P[1], x2: B[0], y2: B[1], stroke: '#2f5aa8', 'stroke-width': 1.8 }, s);
    [[A, 'A', '#c2603f'], [B, 'B', '#c2603f'], [P, 'P', '#2f5aa8'], [O, 'O', '#2f3b52']].forEach(function (q) {
      S('circle', { cx: q[0][0], cy: q[0][1], r: 4.5, fill: q[2] }, s);
      S('text', { x: q[0][0] + (q[0][0] > CX ? 8 : -8), y: q[0][1] + (q[0][1] > CY ? 14 : -7), 'text-anchor': q[0][0] > CX ? 'start' : 'end', 'font-size': 11.5, 'font-weight': 700, fill: q[2], text: q[1] }, s);
    });

    /* 圆心角 = 弧 AB 对应的圆心角度数 */
    var central = (pB - pA + 360) % 360;
    if (central > 180) central = 360 - central;
    /* 圆周角 = 圆心角的一半（P 在优弧上时） */
    function angAt(p0, p1, p2) {
      var v1 = [p1[0] - p0[0], p1[1] - p0[1]], v2 = [p2[0] - p0[0], p2[1] - p0[1]];
      var c = (v1[0] * v2[0] + v1[1] * v2[1]) / (Math.hypot(v1[0], v1[1]) * Math.hypot(v2[0], v2[1]));
      return Math.acos(M.clamp(c, -1, 1)) * 180 / Math.PI;
    }
    var inscribed = angAt(P, A, B);
    M.$('#cc-central').textContent = M.fmt(central, 1) + '°';
    M.$('#cc-insc').textContent = M.fmt(inscribed, 1) + '°';
    M.$('#cc-ratio').textContent = inscribed > 0.5 ? M.fmt(central / inscribed, 3) : '—';
    var isDiam = Math.abs(central - 180) < 1.5 || Math.abs(((pB - pA + 360) % 360) - 180) < 1.5;
    M.$('#cc-text').innerHTML = '<b>同弧所对的圆周角等于圆心角的一半</b>：' + M.fmt(central, 1) + '° ÷ 2 = ' + M.fmt(central / 2, 1) + '°，' +
      '和量出来的 ' + M.fmt(inscribed, 1) + '° 一致。<br>' +
      '<b>把 P 沿着圆周拖动</b>（只要还在同一段弧上），圆周角<b>一点都不变</b>——这是圆最漂亮的性质之一。' +
      (isDiam ? '<br>现在 AB 正好是<b>直径</b>，所以圆周角是 <b>90°</b>：<b>直径所对的圆周角是直角</b>。' : '');
    M.setState({ a: pA, b: pB, p: pP, d: dist });
  }

  /* ---------- 模型二：直线和圆的位置关系 ---------- */
  var dist = M.num(st.d, 60, 0, 130);

  function showLine() {
    var s = M.$('#ln-fig');
    s.innerHTML = '';
    var S = M.svg, cx = 150, cy = 90, r = 58;
    S('circle', { cx: cx, cy: cy, r: r, fill: '#f5f7fb', stroke: '#5d7cb0', 'stroke-width': 2 }, s);
    S('circle', { cx: cx, cy: cy, r: 3.5, fill: '#2f3b52' }, s);
    S('text', { x: cx - 10, y: cy + 5, 'font-size': 11, fill: '#2f3b52', text: 'O' }, s);
    var ly = cy + dist * 0.85;
    S('line', { x1: 16, y1: ly, x2: 284, y2: ly, stroke: '#c2603f', 'stroke-width': 2.4 }, s);
    S('line', { x1: cx, y1: cy, x2: cx, y2: ly, stroke: '#3f7d6a', 'stroke-width': 1.4, 'stroke-dasharray': '4 3' }, s);
    S('text', { x: cx + 6, y: (cy + ly) / 2 + 4, 'font-size': 10, fill: '#2f6a57', text: 'd = ' + M.fmt(dist * 0.85, 1) } , s);
    S('text', { x: cx + 6, y: cy - r / 2, 'font-size': 10, fill: '#5d7cb0', text: 'r = ' + r }, s);
    var d2 = dist * 0.85;
    var kind = Math.abs(d2 - r) < 2 ? 'tangent' : (d2 < r ? 'cross' : 'apart');
    /* 交点 */
    if (kind === 'cross') {
      var dx = Math.sqrt(r * r - d2 * d2);
      [cx - dx, cx + dx].forEach(function (x) {
        S('circle', { cx: x, cy: ly, r: 4.5, fill: '#c2603f' }, s);
      });
    } else if (kind === 'tangent') {
      S('circle', { cx: cx, cy: ly, r: 5, fill: '#c2603f' }, s);
      S('path', { d: 'M' + (cx - 11) + ' ' + (ly - 11) + 'h11v11', fill: 'none', stroke: '#2f6a57', 'stroke-width': 1.4 }, s);
    }
    M.$('#ln-d').textContent = M.fmt(d2, 1);
    M.$('#ln-kind').textContent = kind === 'cross' ? '相交（2 个公共点）' : (kind === 'tangent' ? '相切（1 个公共点）' : '相离（没有公共点）');
    M.$('#ln-cmp').innerHTML = kind === 'cross' ? 'd &lt; r' : (kind === 'tangent' ? 'd = r' : 'd &gt; r');
    M.$('#ln-text').innerHTML = '把圆心到直线的距离 d 和半径 r 比一比就知道了：' +
      '<b>d &lt; r 相交、d = r 相切、d &gt; r 相离</b>。' +
      (kind === 'tangent' ? '现在正好相切，切点处<b>半径垂直于切线</b>（图上的直角标记），这是切线最重要的性质。' : '把滑块慢慢调到 d = r 看看相切的样子。');
    M.setState({ a: pA, b: pB, p: pP, d: dist });
  }

  /* ---------- 模型三：弧长与扇形面积 ---------- */
  var secA = M.num(st.s, 120, 10, 360), secR = M.num(st.r, 6, 1, 12);

  function showSector() {
    var s = M.$('#sc-fig');
    s.innerHTML = '';
    var S = M.svg, cx = 110, cy = 100, R2 = 72;
    var r = secA * Math.PI / 180;
    S('circle', { cx: cx, cy: cy, r: R2, fill: '#f5f7fb', stroke: '#c7cdd8', 'stroke-width': 1.4 }, s);
    var large = secA > 180 ? 1 : 0;
    var e = [cx + R2 * Math.cos(-r), cy + R2 * Math.sin(-r)];
    if (secA >= 359.5) {
      S('circle', { cx: cx, cy: cy, r: R2, fill: '#cfdaee', stroke: '#3a5a93', 'stroke-width': 2 }, s);
    } else {
      S('path', { d: 'M' + cx + ' ' + cy + 'L' + (cx + R2) + ' ' + cy + 'A' + R2 + ' ' + R2 + ' 0 ' + large + ' 0 ' + M.fmt(e[0], 1) + ' ' + M.fmt(e[1], 1) + 'z', fill: '#cfdaee', stroke: '#3a5a93', 'stroke-width': 2 }, s);
    }
    S('text', { x: cx + 16, y: cy - 8, 'font-size': 11, 'font-weight': 700, fill: '#2f4473', text: M.fmt(secA) + '°' }, s);
    var arc = 2 * Math.PI * secR * secA / 360;
    var area = Math.PI * secR * secR * secA / 360;
    M.$('#sc-arc').textContent = M.fmt(arc, 3);
    M.$('#sc-area').textContent = M.fmt(area, 3);
    M.$('#sc-frac').innerHTML = M.frac(Math.round(secA), 360) + ' 个圆';
    M.$('#sc-eq').innerHTML =
      '弧长 l = <span class="frac"><i>nπr</i><i>180</i></span> = <span class="frac"><i>' + M.fmt(secA) + ' × π × ' + secR + '</i><i>180</i></span> = <b>' + M.fmt(arc, 3) + '</b><br>' +
      '扇形面积 S = <span class="frac"><i>nπr' + M.sup(2) + '</i><i>360</i></span> = <b>' + M.fmt(area, 3) + '</b>　（也等于 <span class="frac"><i>1</i><i>2</i></span>lr）';
    M.$('#sc-text').innerHTML = '扇形就是圆的一部分，占了 <b>' + M.fmt(secA / 360 * 100, 1) + '%</b>。' +
      '所以弧长是整个圆周长的这个比例，扇形面积是整个圆面积的这个比例——<b>两个公式都不用死记，按比例推就行</b>。' +
      '验证：½ × l × r = ' + M.fmt(0.5 * arc * secR, 3) + '，和面积一致。';
    M.setState({ s: secA, r: secR });
  }

  document.addEventListener('DOMContentLoaded', function () {
    M.bindRange(M.$('#cc-a'), function (v) { pA = v; showAngle(); });
    M.bindRange(M.$('#cc-b'), function (v) { pB = v; showAngle(); });
    M.bindRange(M.$('#cc-p'), function (v) { pP = v; showAngle(); });
    M.$('#cc-diam').addEventListener('click', function () {
      pA = 180; pB = 0;
      M.$('#cc-a').value = 180; M.$('#cc-b').value = 0;
      M.paintRange(M.$('#cc-a')); M.paintRange(M.$('#cc-b'));
      showAngle();
    });
    showAngle();
    M.bindRange(M.$('#ln-range'), function (v) { dist = v; showLine(); })();
    M.bindRange(M.$('#sc-ang'), function (v) { secA = v; showSector(); })();
    M.bindRange(M.$('#sc-r'), function (v) { secR = v; showSector(); })();

    M.quiz([
      {
        level: 'base',
        title: '让 AB 成为直径，看圆周角变成多少',
        desc: '点「变成直径」按钮，或自己把 A、B 调成相差 180°。',
        label: '在圆周角模型里操作',
        button: '检查 A、B 的位置',
        check: function () {
          var diff = Math.abs(((pB - pA + 360) % 360) - 180);
          if (diff > 2) return { ok: false, msg: '现在 A、B 相差 ' + M.fmt((pB - pA + 360) % 360, 1) + '°，要调成 180° 才是直径。' };
          return { ok: true, msg: '圆周角正好是 <b>90°</b>。<b>直径所对的圆周角是直角</b>，反过来，90° 的圆周角所对的弦一定是直径——这常用来证明直角或找直径。' };
        }
      },
      {
        level: 'base',
        title: '同弧所对的圆周角是圆心角的多少？',
        desc: '上面拖动三个点看两个角的比值。',
        options: ['一半', '两倍', '相等', '不确定'],
        answer: 0,
        hint: '看读数里「圆心角 ÷ 圆周角」那个比值。',
        explain: '圆周角 = 圆心角的 <b>一半</b>。推论：<b>同弧所对的圆周角都相等</b>，所以把 P 沿着弧移动，角度不变。'
      },
      {
        level: 'base',
        title: '半径为 3 的圆，周长是多少？',
        desc: '周长公式 C = 2πr。',
        options: ['6π', '3π', '9π', '12π'],
        answer: 0,
        hint: '2 × π × 3。',
        explain: 'C = 2πr = <b>6π</b>。面积则是 πr² = 9π，两个公式别混。'
      },
      {
        level: 'mid',
        title: '圆心到直线距离 5，半径 5，位置关系是？',
        desc: '可以在上面把 d 调到和 r 相等。',
        options: ['相切', '相交', '相离', '无法判断'],
        answer: 0,
        hint: '比较 d 和 r 的大小。',
        explain: 'd = r 时<b>相切</b>，只有一个公共点。此时连接圆心和切点的半径<b>垂直于</b>切线。d &lt; r 相交，d &gt; r 相离。'
      },
      {
        level: 'mid',
        title: '半径 6、圆心角 120° 的扇形，弧长是多少？',
        desc: '120° 占整个圆的三分之一。',
        options: ['4π', '2π', '12π', '6π'],
        answer: 0,
        hint: '整圆周长 2πr = 12π，取三分之一。',
        explain: '120°/360° = 1/3，弧长 = 12π × 1/3 = <b>4π</b>。扇形面积 = 36π × 1/3 = 12π。按<b>比例</b>算比套公式更不容易错。'
      },
      {
        level: 'mid',
        title: '直径所对的圆周角是多少度？',
        desc: '上面点「让 AB 成为直径」看看。',
        options: ['90°', '180°', '60°', '45°'],
        answer: 0,
        hint: '直径对应的圆心角是 180°。',
        explain: '圆心角 180° 的一半 = <b>90°</b>。反过来，<b>90° 圆周角所对的弦一定是直径</b>——这常用来证直角或找圆心。'
      },
      {
        level: 'mid',
        title: '圆心到直线距离 d = 4，半径 r = 6，位置关系是？',
        desc: '比较 d 和 r 的大小。',
        options: ['相交', '相切', '相离', '无法判断'],
        answer: 0,
        hint: '4 < 6。',
        explain: 'd &lt; r 时<b>相交</b>，有两个公共点。d = r 相切，d &gt; r 相离。这是判断位置关系的唯一标准。'
      },
      {
        level: 'trap',
        title: '半径 6、圆心角 120° 的扇形面积是？',
        desc: '120° 占整个圆的三分之一。',
        options: ['12π', '4π', '36π', '24π'],
        answer: 0,
        hint: '整圆面积 πr² = 36π，取三分之一。',
        explain: '36π × (120/360) = <b>12π</b>。注意<b>弧长</b>是 4π、<b>面积</b>是 12π，两个公式极易记串。稳妥办法：先算占整圆的几分之几，再乘周长或面积。'
      }
    ]);
  });
})();
