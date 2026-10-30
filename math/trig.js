/* 第 28 课 · 直角三角形的边角关系（北师大版九下第一章） */
(function () {
  'use strict';
  var M = window.Mx, st = M.getState();

  /* ---------- 模型一：角一变，三个比值跟着变 ---------- */
  var ang = M.num(st.a, 37, 5, 85);

  function showTri() {
    var s = M.$('#tg-fig');
    s.innerHTML = '';
    var S = M.svg;
    var r = ang * Math.PI / 180;
    var adj = 150, opp = adj * Math.tan(r), hyp = adj / Math.cos(r);
    /* 控制高度不超画布 */
    var sc = Math.min(1, 120 / opp);
    adj *= sc; opp *= sc; hyp *= sc;
    var ox = 40, oy = 160;
    var A = [ox, oy], B = [ox + adj, oy], C = [ox + adj, oy - opp];
    S('polygon', { points: [A, B, C].map(function (p) { return M.fmt(p[0], 1) + ',' + M.fmt(p[1], 1); }).join(' '), fill: '#eaeff8', stroke: '#3a5a93', 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, s);
    S('path', { d: 'M' + (B[0] - 12) + ' ' + B[1] + 'v-12h12', fill: 'none', stroke: '#5d7cb0', 'stroke-width': 1.3 }, s);
    var ar = 32;
    S('path', { d: 'M' + (A[0] + ar) + ' ' + A[1] + 'A' + ar + ' ' + ar + ' 0 0 0 ' + M.fmt(A[0] + ar * Math.cos(r), 1) + ' ' + M.fmt(A[1] - ar * Math.sin(r), 1), fill: 'none', stroke: '#c2603f', 'stroke-width': 2 }, s);
    S('text', { x: A[0] + 40, y: A[1] - 10, 'font-size': 11, 'font-weight': 700, fill: '#a4492b', text: M.fmt(ang) + '°' }, s);
    S('text', { x: (A[0] + B[0]) / 2, y: oy + 16, 'text-anchor': 'middle', 'font-size': 10.5, fill: '#4a5568', text: '邻边 ' + M.fmt(adj, 1) }, s);
    S('text', { x: B[0] + 6, y: (B[1] + C[1]) / 2, 'font-size': 10.5, fill: '#4a5568', text: '对边 ' + M.fmt(opp, 1) }, s);
    S('text', { x: (A[0] + C[0]) / 2 - 22, y: (A[1] + C[1]) / 2 - 6, 'font-size': 10.5, fill: '#3f7d6a', text: '斜边 ' + M.fmt(hyp, 1) }, s);
    S('text', { x: A[0] - 12, y: A[1] + 5, 'font-size': 12, 'font-weight': 700, fill: '#2f3b52', text: 'A' }, s);

    var sin = Math.sin(r), cos = Math.cos(r), tan = Math.tan(r);
    M.$('#tg-ang').textContent = M.fmt(ang) + '°';
    M.$('#tg-sin').innerHTML = M.fmt(sin, 4);
    M.$('#tg-cos').innerHTML = M.fmt(cos, 4);
    M.$('#tg-tan').innerHTML = M.fmt(tan, 4);
    M.$('#tg-def').innerHTML =
      'sin A = <span class="frac"><i>对边</i><i>斜边</i></span> = <span class="frac"><i>' + M.fmt(opp, 1) + '</i><i>' + M.fmt(hyp, 1) + '</i></span>　' +
      'cos A = <span class="frac"><i>邻边</i><i>斜边</i></span>　' +
      'tan A = <span class="frac"><i>对边</i><i>邻边</i></span>';
    M.$('#tg-text').innerHTML = '三角函数值<b>只跟角的大小有关</b>，跟三角形画多大无关——把三角形整体放大两倍，三条边都变两倍，比值不变。' +
      '这正是相似三角形的性质。<br>' +
      '还可以验证：sin²A + cos²A = ' + M.fmt(sin * sin + cos * cos, 6) + '（恒等于 1，这其实就是勾股定理），' +
      'tan A = sin A ÷ cos A = ' + M.fmt(sin / cos, 4) + '。';
    M.setState({ a: ang, h: eye });
  }

  /* ---------- 模型二：特殊角的值 ---------- */
  function showSpecial() {
    var tb = M.$('#sp-table tbody');
    tb.innerHTML = '';
    [[30, '1/2', '√3/2', '√3/3'], [45, '√2/2', '√2/2', '1'], [60, '√3/2', '1/2', '√3']].forEach(function (row) {
      var r = row[0] * Math.PI / 180;
      var tr = M.html('tr', {}, tb);
      M.html('td', { class: 'n', text: row[0] + '°' }, tr);
      M.html('td', { class: 'n', html: row[1] + '<span class="note" style="font-size:10px"> ≈' + M.fmt(Math.sin(r), 3) + '</span>' }, tr);
      M.html('td', { class: 'n', html: row[2] + '<span class="note" style="font-size:10px"> ≈' + M.fmt(Math.cos(r), 3) + '</span>' }, tr);
      M.html('td', { class: 'n', html: row[3] + '<span class="note" style="font-size:10px"> ≈' + M.fmt(Math.tan(r), 3) + '</span>' }, tr);
    });
    M.$('#sp-text').innerHTML = '这三个角的值必须<b>背下来</b>。记忆法：sin 30°、sin 45°、sin 60° 依次是 ' +
      M.sqrt(1) + '/2、' + M.sqrt(2) + '/2、' + M.sqrt(3) + '/2，分子里的数依次是 1、2、3；cos 正好反过来。';
  }

  /* ---------- 模型三：测量楼高 ---------- */
  var eye = M.num(st.h, 30, 10, 70), dist = M.num(st.d, 50, 20, 120);

  function showMeasure() {
    var s = M.$('#ms-fig');
    s.innerHTML = '';
    var S = M.svg;
    var r = eye * Math.PI / 180;
    var h = dist * Math.tan(r) + 1.6;
    var k = Math.min(1.6, 120 / (h || 1));
    var ox = 30, oy = 165;
    var bx = ox + dist * 1.6;
    S('line', { x1: 10, y1: oy, x2: 300, y2: oy, stroke: '#8795b5', 'stroke-width': 2 }, s);
    /* 观测者 */
    S('line', { x1: ox, y1: oy, x2: ox, y2: oy - 1.6 * k * 6, stroke: '#3a5a93', 'stroke-width': 3.5, 'stroke-linecap': 'round' }, s);
    /* 楼 */
    var bh = Math.min(h * k * 6, 135);
    S('rect', { x: bx - 16, y: oy - bh, width: 32, height: bh, fill: '#dfe4ec', stroke: '#5d7cb0', 'stroke-width': 1.6 }, s);
    /* 视线 */
    S('line', { x1: ox, y1: oy - 1.6 * k * 6, x2: bx, y2: oy - bh, stroke: '#c2603f', 'stroke-width': 1.6, 'stroke-dasharray': '5 4' }, s);
    S('line', { x1: ox, y1: oy - 1.6 * k * 6, x2: bx, y2: oy - 1.6 * k * 6, stroke: '#8795b5', 'stroke-width': 1.1, 'stroke-dasharray': '3 3' }, s);
    S('path', { d: 'M' + (ox + 26) + ' ' + (oy - 1.6 * k * 6) + 'A26 26 0 0 0 ' + M.fmt(ox + 26 * Math.cos(r), 1) + ' ' + M.fmt(oy - 1.6 * k * 6 - 26 * Math.sin(r), 1), fill: 'none', stroke: '#c2603f', 'stroke-width': 1.6 }, s);
    S('text', { x: ox + 32, y: oy - 1.6 * k * 6 - 8, 'font-size': 10, fill: '#a4492b', text: M.fmt(eye) + '°' }, s);
    S('text', { x: (ox + bx) / 2, y: oy + 15, 'text-anchor': 'middle', 'font-size': 10, fill: '#6b7385', text: dist + ' m' }, s);
    S('text', { x: bx + 22, y: oy - bh / 2, 'font-size': 10.5, 'font-weight': 700, fill: '#2f5aa8', text: M.fmt(h, 1) + ' m' }, s);

    M.$('#ms-h').textContent = M.fmt(h, 2) + ' m';
    M.$('#ms-eq').innerHTML = 'tan ' + M.fmt(eye) + '° = <span class="frac"><i>楼高 − 1.6</i><i>' + dist + '</i></span>　→　' +
      '楼高 = ' + dist + ' × tan ' + M.fmt(eye) + '° + 1.6 = <b>' + M.fmt(h, 2) + '</b> m';
    M.$('#ms-text').innerHTML = '站在离楼 ' + dist + ' 米处，<b>仰角</b>量得 ' + M.fmt(eye) + '°，就能算出楼高。' +
      '<b>别忘了加上眼睛离地的 1.6 米</b>——算出来的 ' + M.fmt(dist * Math.tan(r), 2) + ' 米只是楼顶比眼睛高出的部分，这是这类题最常见的失分点。' +
      '已知邻边求对边，<b>用 tan 最直接</b>。';
    M.setState({ a: ang, h: eye, d: dist });
  }

  document.addEventListener('DOMContentLoaded', function () {
    M.bindRange(M.$('#tg-range'), function (v) { ang = v; showTri(); })();
    showSpecial();
    M.bindRange(M.$('#ms-eye'), function (v) { eye = v; showMeasure(); })();
    M.bindRange(M.$('#ms-dist'), function (v) { dist = v; showMeasure(); })();

    M.quiz([
      {
        title: '把角调到 45°，看 tan 等于多少',
        desc: '拖动角度滑块到 45°。',
        label: '在直角三角形模型里调角',
        button: '检查角度',
        check: function () {
          if (ang !== 45) return { ok: false, msg: '现在是 ' + M.fmt(ang) + '°，调到 45°。' };
          return { ok: true, msg: 'tan 45° = 1，因为此时<b>对边等于邻边</b>（等腰直角三角形）。sin 45° = cos 45° = √2/2 ≈ 0.707。' };
        }
      },
      {
        title: '把直角三角形放大 2 倍，sin A 怎么变？',
        desc: '想想三角函数是边的什么。',
        options: ['不变，因为是比值', '变成 2 倍', '变成一半', '无法确定'],
        answer: 0,
        hint: '对边和斜边都变 2 倍，比值呢？',
        explain: '三角函数是<b>两边的比值</b>，三条边同时放大 2 倍，比值不变。所以 sin A 只跟<b>角的大小</b>有关，与三角形大小无关。'
      },
      {
        title: '离楼 50 米，仰角 30°，眼高 1.6 米，楼高约多少？',
        desc: '可以在上面把滑块调成 50 和 30。',
        options: ['约 30.5 米', '约 28.9 米', '约 25 米', '约 86.6 米'],
        answer: 0,
        hint: '先算 50 × tan30°，再加 1.6。',
        explain: '50 × tan30° = 50 × 0.577 ≈ 28.9 米，这是楼顶<b>高出眼睛</b>的部分，再加眼高 1.6 米，楼高约 <b>30.5 米</b>。漏加眼高就会选 28.9。'
      }
    ]);
  });
})();
