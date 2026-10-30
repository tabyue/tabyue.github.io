/* 第 4 课 · 线、角与基本平面图形（北师大版七上第四章） */
(function () {
  'use strict';
  var M = window.Mx, st = M.getState();

  /* ---------- 模型一：线段上的点 ---------- */
  /* A 在 0，B 在 10，C 可拖动 */
  var cPos = M.num(st.c, 3.5, 0, 10);

  var seg = null;
  function initSeg() {
    var el = M.$('#sg-fig');
    seg = M.numline(el, { min: 0, max: 10, step: 1, labelStep: 1, y: 60, pad: 30 });
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'application');
    el.setAttribute('aria-label', '线段 AB：拖动点 C');
    var down = false;
    function go(e) {
      var p = M.svgPoint(el, e);
      cPos = Math.round(M.clamp(seg.ix(p.x), 0, 10) * 2) / 2;
      showSeg(); e.preventDefault();
    }
    el.addEventListener('pointerdown', function (e) { down = true; try { el.setPointerCapture(e.pointerId); } catch (err) {} go(e); });
    el.addEventListener('pointermove', function (e) { if (down) go(e); });
    el.addEventListener('pointerup', function () { down = false; });
    el.addEventListener('keydown', function (e) {
      var d = { ArrowLeft: -0.5, ArrowRight: 0.5 }[e.key];
      if (d === undefined) return;
      e.preventDefault(); cPos = M.clamp(cPos + d, 0, 10); showSeg();
    });
  }

  function showSeg() {
    var S = M.svg, L = seg.layer;
    L.innerHTML = '';
    var yA = seg.y;
    S('line', { x1: seg.X(0), y1: yA, x2: seg.X(10), y2: yA, stroke: '#3a5a93', 'stroke-width': 4, 'stroke-linecap': 'round' }, L);
    S('line', { x1: seg.X(0), y1: yA - 20, x2: seg.X(cPos), y2: yA - 20, stroke: '#c2603f', 'stroke-width': 3 }, L);
    S('line', { x1: seg.X(cPos), y1: yA - 34, x2: seg.X(10), y2: yA - 34, stroke: '#3f7d6a', 'stroke-width': 3 }, L);
    S('text', { x: seg.X(cPos / 2), y: yA - 25, 'text-anchor': 'middle', 'font-size': 10.5, fill: '#a4492b', text: 'AC=' + M.fmt(cPos) }, L);
    S('text', { x: seg.X((cPos + 10) / 2), y: yA - 39, 'text-anchor': 'middle', 'font-size': 10.5, fill: '#2f6a57', text: 'CB=' + M.fmt(10 - cPos) }, L);
    [[0, 'A', '#3a5a93'], [10, 'B', '#3a5a93'], [cPos, 'C', '#c2603f']].forEach(function (p) {
      S('circle', { cx: seg.X(p[0]), cy: yA, r: 6, fill: p[2], stroke: '#fff', 'stroke-width': 2 }, L);
      S('text', { x: seg.X(p[0]), y: yA + 22, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, fill: p[2], text: p[1] }, L);
    });
    M.$('#sg-ac').textContent = M.fmt(cPos);
    M.$('#sg-cb').textContent = M.fmt(10 - cPos);
    M.$('#sg-sum').textContent = '10';
    var mid = Math.abs(cPos - 5) < 1e-9;
    M.$('#sg-mid').textContent = mid ? '是中点' : '不是中点';
    M.$('#sg-text').innerHTML = mid
      ? 'C 正好是 AB 的<b>中点</b>：AC = CB = 5，也就是 AC = <span class="frac"><i>1</i><i>2</i></span>AB。'
      : '不管 C 在哪里，<b>AC + CB = AB</b> 始终成立（现在 ' + M.fmt(cPos) + ' + ' + M.fmt(10 - cPos) + ' = 10）。' +
        '把 C 拖到 5 的位置，它就成了中点。';
    M.setState({ c: cPos, ang: angle, n: nGon });
  }

  /* ---------- 模型二：角 ---------- */
  var angle = M.num(st.ang, 55, 0, 180);

  function showAngle() {
    var s = M.$('#ag-fig');
    s.innerHTML = '';
    var S = M.svg, ox = 150, oy = 140, R = 104;
    var rad = angle * Math.PI / 180;
    var bx = ox + R, by = oy;
    var ax = ox + R * Math.cos(rad), ay = oy - R * Math.sin(rad);
    /* 角的弧线 */
    var r2 = 34;
    var d = 'M' + (ox + r2) + ' ' + oy + 'A' + r2 + ' ' + r2 + ' 0 0 0 ' + (ox + r2 * Math.cos(rad)) + ' ' + (oy - r2 * Math.sin(rad));
    S('path', { d: d, fill: 'none', stroke: '#c2603f', 'stroke-width': 2 }, s);
    S('line', { x1: ox, y1: oy, x2: bx, y2: by, stroke: '#3a5a93', 'stroke-width': 3, 'stroke-linecap': 'round' }, s);
    S('line', { x1: ox, y1: oy, x2: ax, y2: ay, stroke: '#3a5a93', 'stroke-width': 3, 'stroke-linecap': 'round' }, s);
    /* 角平分线 */
    if (M.$('#ag-bis').checked) {
      var hr = rad / 2;
      S('line', { x1: ox, y1: oy, x2: ox + R * 0.82 * Math.cos(hr), y2: oy - R * 0.82 * Math.sin(hr), stroke: '#3f7d6a', 'stroke-width': 2, 'stroke-dasharray': '6 4' }, s);
      S('text', { x: ox + 56 * Math.cos(hr), y: oy - 56 * Math.sin(hr) - 5, 'font-size': 10, fill: '#2f6a57', text: M.fmt(angle / 2) + '°' }, s);
    }
    S('circle', { cx: ox, cy: oy, r: 4.5, fill: '#2f3b52' }, s);
    S('text', { x: ox - 12, y: oy + 16, 'font-size': 12, fill: '#2f3b52', text: 'O' }, s);
    S('text', { x: bx + 4, y: by + 4, 'font-size': 12, fill: '#3a5a93', text: 'B' }, s);
    S('text', { x: ax + (angle > 100 ? -14 : 6), y: ay - 4, 'font-size': 12, fill: '#3a5a93', text: 'A' }, s);
    S('text', { x: ox + 46 * Math.cos(rad / 2), y: oy - 46 * Math.sin(rad / 2) + 4, 'font-size': 12, 'font-weight': 700, fill: '#a4492b', text: M.fmt(angle) + '°' }, s);

    /* 度分秒 */
    var deg = Math.floor(angle), minf = (angle - deg) * 60, mn = Math.floor(minf), sec = Math.round((minf - mn) * 60);
    M.$('#ag-deg').textContent = M.fmt(angle) + '°';
    M.$('#ag-dms').textContent = deg + '° ' + mn + '′ ' + sec + '″';
    var kind = angle === 0 ? '零角' : angle < 90 ? '锐角' : angle === 90 ? '直角' : angle < 180 ? '钝角' : '平角';
    M.$('#ag-kind').textContent = kind;
    M.$('#ag-comp').innerHTML = angle < 90 ? (90 - M.fmt(angle)) + '°' : '<span style="color:#8a8f9c">没有余角</span>';
    M.$('#ag-supp').innerHTML = angle < 180 ? M.fmt(180 - angle) + '°' : '<span style="color:#8a8f9c">没有补角</span>';
    M.$('#ag-text').innerHTML = '两个角的和是 90° 叫<b>互为余角</b>，和是 180° 叫<b>互为补角</b>。' +
      (angle >= 90 ? '现在这个角不小于 90°，所以它<b>没有余角</b>（余角必须是正角）。' :
        '现在 ' + M.fmt(angle) + '° 的余角是 ' + M.fmt(90 - angle) + '°、补角是 ' + M.fmt(180 - angle) + '°，补角总比余角大 90°。');
    M.setState({ c: cPos, ang: angle, n: nGon });
  }

  /* ---------- 模型三：正多边形 ---------- */
  var nGon = M.num(st.n, 6, 3, 12);

  function showGon() {
    var s = M.$('#pg-fig');
    s.innerHTML = '';
    var S = M.svg, n = nGon, ox = 150, oy = 115, R = 88, pts = [], i;
    for (i = 0; i < n; i++) {
      var th = -Math.PI / 2 + i * 2 * Math.PI / n;
      pts.push([ox + R * Math.cos(th), oy + R * Math.sin(th)]);
    }
    /* 从一个顶点出发的对角线 */
    for (i = 2; i < n - 1; i++) {
      S('line', { x1: pts[0][0], y1: pts[0][1], x2: pts[i][0], y2: pts[i][1], stroke: '#c2603f', 'stroke-width': 1.3, 'stroke-dasharray': '4 3' }, s);
    }
    S('polygon', { points: pts.map(function (p) { return M.fmt(p[0], 1) + ',' + M.fmt(p[1], 1); }).join(' '), fill: '#eaeff8', stroke: '#3a5a93', 'stroke-width': 2, 'fill-opacity': .55 }, s);
    pts.forEach(function (p, k) {
      S('circle', { cx: p[0], cy: p[1], r: 3.6, fill: k === 0 ? '#c2603f' : '#5d7cb0' }, s);
    });

    var diagFrom = n - 3, diagAll = n * (n - 3) / 2, tri = n - 2;
    var inner = (n - 2) * 180, each = inner / n;
    M.$('#pg-n').textContent = n;
    M.$('#pg-diag1').textContent = diagFrom + ' 条';
    M.$('#pg-diag').textContent = diagAll + ' 条';
    M.$('#pg-tri').textContent = tri + ' 个';
    M.$('#pg-inner').textContent = inner + '°';
    M.$('#pg-each').textContent = M.fmt(each, 2) + '°';
    M.$('#pg-outer').textContent = '360°';
    M.$('#pg-formula').innerHTML =
      '从一个顶点出发，不能连自己和相邻两点，所以有 <b><var>n</var> − 3 = ' + diagFrom + '</b> 条对角线；<br>' +
      '每个顶点都这样连，但每条对角线被数了两次，所以总共 <b><var>n</var>(<var>n</var> − 3) ÷ 2 = ' + diagAll + '</b> 条；<br>' +
      '这些对角线把它分成 <b><var>n</var> − 2 = ' + tri + '</b> 个三角形，所以内角和 = <b>(<var>n</var> − 2) × 180° = ' + inner + '°</b>。';
    M.$('#pg-note').innerHTML = '不管 <var>n</var> 是多少，<b>外角和永远是 360°</b>。所以正 ' + n + ' 边形每个外角是 360° ÷ ' + n + ' = ' + M.fmt(360 / n, 2) + '°，' +
      '每个内角 180° − ' + M.fmt(360 / n, 2) + '° = ' + M.fmt(each, 2) + '°，和上面算的一致。';
    M.setState({ c: cPos, ang: angle, n: nGon });
  }

  /* ---------- 装配 ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    initSeg(); showSeg();
    M.bindRange(M.$('#ag-range'), function (v) { angle = v; showAngle(); })();
    M.$('#ag-bis').addEventListener('change', showAngle);
    M.$$('#ag-presets button').forEach(function (b) {
      b.addEventListener('click', function () {
        var v = +b.dataset.a;
        M.$('#ag-range').value = v; angle = v; M.paintRange(M.$('#ag-range')); showAngle();
      });
    });
    M.bindRange(M.$('#pg-range'), function (v) { nGon = v; showGon(); })();

    M.quiz([
      {
        level: 'base',
        title: '把 C 拖成 AB 的中点',
        desc: '拖动线段上的点 C，让 AC = CB。',
        label: '在线段上拖动 C',
        button: '检查 C 的位置',
        check: function () {
          if (Math.abs(cPos - 5) > 1e-9) return { ok: false, msg: '现在 AC = ' + M.fmt(cPos) + '、CB = ' + M.fmt(10 - cPos) + '，还不相等。' };
          return { ok: true, msg: 'AC = CB = 5，C 是中点，可以写成 AC = CB = ½AB，或者 AB = 2AC。' };
        }
      },
      {
        level: 'base',
        title: '一个角是 50°，它的补角是多少？',
        desc: '互为补角的两个角相加等于 180°。',
        options: ['130°', '40°', '50°', '310°'],
        answer: 0,
        hint: '180° 减去 50°。',
        explain: '180° − 50° = <b>130°</b>。余角用 90° 减（这里是 40°），补角用 180° 减，两个别记混。'
      },
      {
        level: 'base',
        title: '下列说法正确的是？',
        desc: '注意直线、射线、线段的区别。',
        options: ['两点确定一条直线', '两点确定一条射线', '线段可以延长到无限', '直线有两个端点'],
        answer: 0,
        hint: '想想各自有几个端点、能不能延伸。',
        explain: '<b>两点确定一条直线</b>。直线没有端点、可向两端无限延伸；射线有 1 个端点；线段有 2 个端点、长度固定。'
      },
      {
        level: 'mid',
        title: '一个角是 35°，它的补角比余角大多少？',
        desc: '可以把上面的滑块调到 35° 对照着看。',
        options: ['90°', '35°', '55°', '145°'],
        answer: 0,
        hint: '补角 = 180° − 角，余角 = 90° − 角，相减看看。',
        explain: '补角 145°，余角 55°，相差 90°。其实 (180° − <var>x</var>) − (90° − <var>x</var>) = 90°，<b>与这个角多大无关</b>，永远差 90°。'
      },
      {
        level: 'mid',
        title: '正八边形每个内角是多少度？',
        desc: '把多边形滑块拖到 8 验证一下。',
        options: ['135°', '120°', '144°', '140°'],
        answer: 0,
        hint: '先算内角和 (n−2)×180°，再除以 n。',
        explain: '内角和 (8−2) × 180° = 1080°，每个内角 1080° ÷ 8 = 135°。也可以用外角：360° ÷ 8 = 45°，180° − 45° = 135°。'
      },
      {
        level: 'mid',
        title: '正五边形的每个内角是多少度？',
        desc: '把上面的多边形滑块拖到 5 验证。',
        options: ['108°', '72°', '120°', '540°'],
        answer: 0,
        hint: '内角和 (5−2)×180°，再除以 5。',
        explain: '内角和 = (5−2) × 180° = 540°，每个内角 540° ÷ 5 = <b>108°</b>。540° 是<b>内角和</b>不是单个内角，这是常见的选项陷阱。'
      },
      {
        level: 'mid',
        title: 'C 是线段 AB 的中点，AB = 12，则 AC 等于？',
        desc: '中点把线段分成相等的两段。',
        options: ['6', '12', '24', '3'],
        answer: 0,
        hint: 'AC = CB = AB ÷ 2。',
        explain: 'AC = ½AB = <b>6</b>。中点的三种写法要会互换：AC = CB、AC = ½AB、AB = 2AC。'
      },
      {
        level: 'trap',
        title: '六边形从一个顶点出发有 3 条对角线，那它一共有几条对角线？',
        desc: '上面把滑块拖到 6，对比两个数据。',
        options: ['9 条', '3 条', '18 条', '6 条'],
        answer: 0,
        hint: '每个顶点都能引出 3 条，但每条会被两端各数一次。',
        explain: '6 个顶点 × 3 条 = 18，但<b>每条对角线被数了两次</b>，所以是 18 ÷ 2 = <b>9</b> 条。公式 n(n−3)/2 里的「÷2」就是为了去掉重复。'
      }
    ]);
  });
})();
