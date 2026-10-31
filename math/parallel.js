/* 第 8 课 · 相交线与平行线（北师大版七下第二章） */
(function () {
  'use strict';
  var M = window.Mx, st = M.getState();

  /* ---------- 模型一：三线八角 ----------
     两条直线被第三条截，拖动下面那条线的倾斜角，看八个角怎么变。 */
  var tilt = M.num(st.t, 0, -28, 28);   // 下面那条线相对水平的倾角（0 就是平行）
  var cut = M.num(st.c, 58, 25, 85);    // 截线与水平线的夹角
  var show8 = st.s || 'cor';

  var GROUPS = {
    cor: { name: '同位角', pairs: [[1, 5], [2, 6], [3, 7], [4, 8]], rule: '平行时相等', pos: '在截线同旁、被截两线的同一侧' },
    alt: { name: '内错角', pairs: [[3, 6], [4, 5]], rule: '平行时相等', pos: '在截线两旁、两条被截线之间' },
    sam: { name: '同旁内角', pairs: [[3, 5], [4, 6]], rule: '平行时互补（和是 180°）', pos: '在截线同旁、两条被截线之间' }
  };

  function showAngles() {
    var s = M.$('#pl-fig');
    s.innerHTML = '';
    var S = M.svg, W = 320, y1 = 54, y2 = 142, cx = 160;
    /* 截线与直线 b 的夹角 = cut − tilt。它太小时截线几乎和 b 平行，交点会跑到很远（角度甚至变成负数），
       所以把 b 的倾角限制在让这个夹角不小于 30° 的范围内 */
    var tMax = cut - 30, tMin = cut - 150;
    if (tilt > tMax || tilt < tMin) {
      tilt = M.clamp(tilt, tMin, tMax);
      var tr0 = M.$('#pl-tilt'); if (tr0) { tr0.value = tilt; M.paintRange(tr0); }
    }
    var tr = tilt * Math.PI / 180, cr = cut * Math.PI / 180;
    /* 直线 a 水平；直线 b 倾斜 tilt；截线 c 过中心，与水平成 cut */
    function lineB(x) { return y2 + (x - cx) * Math.tan(tr); }
    /* 截线与 a、b 的交点 */
    var dx = 1 / Math.tan(cr);
    var pA = { x: cx + (y1 - 110) * dx, y: y1 };
    /* 截线 x = cx + (y − 110)·dx，直线 b 为 y = y2 + (x − cx)·k。
       代入得 y = y2 + (y − 110)·dx·k ⇒ y(1 − dx·k) = y2 − 110·dx·k */
    var pB = (function () {
      var k = Math.tan(tr);
      var yy = (y2 - 110 * dx * k) / (1 - dx * k);
      return { x: cx + (yy - 110) * dx, y: yy };
    })();
    S('line', { x1: 10, y1: y1, x2: W - 10, y2: y1, stroke: '#3a5a93', 'stroke-width': 2.4 }, s);
    S('line', { x1: 10, y1: lineB(10), x2: W - 10, y2: lineB(W - 10), stroke: '#3a5a93', 'stroke-width': 2.4 }, s);
    var topY = 8, botY = 190;
    S('line', { x1: cx + (topY - 110) * dx, y1: topY, x2: cx + (botY - 110) * dx, y2: botY, stroke: '#c2603f', 'stroke-width': 2.2 }, s);
    S('text', { x: W - 8, y: y1 - 6, 'text-anchor': 'end', 'font-size': 11, fill: '#3a5a93', 'font-style': 'italic', text: 'a' }, s);
    /* b 的标签：从右往左找线 b 上第一个既在画布内、又离 a 足够远的位置 */
    var bx = W - 10;
    while (bx > 30 && !(lineB(bx) > y1 + 22 && lineB(bx) < 184)) bx -= 6;
    S('text', { x: bx + 2, y: lineB(bx) - 6, 'text-anchor': bx > W - 20 ? 'end' : 'middle', 'font-size': 11, fill: '#3a5a93', 'font-style': 'italic', text: 'b' }, s);
    S('text', { x: cx + (botY - 110) * dx + 6, y: botY - 2, 'font-size': 11, fill: '#c2603f', 'font-style': 'italic', text: 'c' }, s);

    /* 八个角的度数：截线与 a 成 cut，与 b 成 cut − tilt */
    var A = cut, B = cut - tilt;
    var ang = { 1: 180 - A, 2: A, 3: A, 4: 180 - A, 5: 180 - B, 6: B, 7: B, 8: 180 - B };
    var hl = {};
    GROUPS[show8].pairs.forEach(function (p) { hl[p[0]] = 1; hl[p[1]] = 1; });
    /* 标号位置：1 左上 2 右上 3 左下 4 右下（相对交点） */
    var off = 26;
    [[1, pA, -1, -1], [2, pA, 1, -1], [3, pA, -1, 1], [4, pA, 1, 1],
     [5, pB, -1, -1], [6, pB, 1, -1], [7, pB, -1, 1], [8, pB, 1, 1]].forEach(function (q) {
      var num = q[0], p = q[1], sx = q[2], sy = q[3];
      var x = p.x + sx * off * 0.95, y = p.y + sy * off * 0.72;
      if (hl[num]) S('circle', { cx: x, cy: y, r: 12.5, fill: '#f3dcd6' }, s);
      S('text', { x: x, y: y + 4, 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': hl[num] ? 700 : 400, fill: hl[num] ? '#a4422c' : '#6b7385', text: num }, s);
    });
    S('circle', { cx: pA.x, cy: pA.y, r: 3.4, fill: '#2f3b52' }, s);
    S('circle', { cx: pB.x, cy: pB.y, r: 3.4, fill: '#2f3b52' }, s);

    var g = GROUPS[show8];
    var tb = M.$('#pl-table tbody');
    tb.innerHTML = '';
    g.pairs.forEach(function (p) {
      var tr2 = M.html('tr', {}, tb);
      M.html('td', { text: '∠' + p[0] + ' 与 ∠' + p[1] }, tr2);
      M.html('td', { class: 'n', text: M.fmt(ang[p[0]], 1) + '° / ' + M.fmt(ang[p[1]], 1) + '°' }, tr2);
      var d = show8 === 'sam' ? ang[p[0]] + ang[p[1]] : ang[p[0]] - ang[p[1]];
      M.html('td', { class: 'n', html: show8 === 'sam' ? '和 ' + M.fmt(d, 1) + '°' : (Math.abs(d) < 0.05 ? '<b style="color:#2f6a4a">相等</b>' : '差 ' + M.fmt(Math.abs(d), 1) + '°') }, tr2);
    });
    var par = Math.abs(tilt) < 0.01;
    M.$('#pl-name').textContent = g.name;
    M.$('#pl-pos').textContent = g.pos;
    M.$('#pl-par').textContent = par ? 'a ∥ b' : 'a 与 b 不平行';
    M.$('#pl-text').innerHTML = par
      ? '现在两条直线<b>平行</b>，所以' + g.name + '<b>' + g.rule + '</b>。这是平行线的<b>性质</b>：先有平行，才有角的关系。'
      : '现在两条直线<b>不平行</b>（相差 ' + M.fmt(Math.abs(tilt), 1) + '°），' + g.name + '就' + (show8 === 'sam' ? '不是 180°' : '不相等') + '了。' +
        '反过来，如果量出' + g.name + '' + (show8 === 'sam' ? '互补' : '相等') + '，就能<b>判定</b>两直线平行。';
    M.setState({ t: tilt, c: cut, s: show8 });
  }

  /* ---------- 模型二：对顶角与邻补角 ---------- */
  var vang = M.num(st.v, 50, 5, 175);

  function showVert() {
    var s = M.$('#vt-fig');
    s.innerHTML = '';
    var S = M.svg, cx = 150, cy = 92, R = 84;
    var r = vang * Math.PI / 180;
    S('line', { x1: cx - R, y1: cy, x2: cx + R, y2: cy, stroke: '#3a5a93', 'stroke-width': 2.4 }, s);
    S('line', { x1: cx - R * Math.cos(r), y1: cy + R * Math.sin(r), x2: cx + R * Math.cos(r), y2: cy - R * Math.sin(r), stroke: '#3a5a93', 'stroke-width': 2.4 }, s);
    function arc(a0, a1, rr, color) {
      var x0 = cx + rr * Math.cos(a0), y0 = cy - rr * Math.sin(a0);
      var x1 = cx + rr * Math.cos(a1), y1 = cy - rr * Math.sin(a1);
      S('path', { d: 'M' + M.fmt(x0, 1) + ' ' + M.fmt(y0, 1) + 'A' + rr + ' ' + rr + ' 0 0 0 ' + M.fmt(x1, 1) + ' ' + M.fmt(y1, 1), fill: 'none', stroke: color, 'stroke-width': 2.2 }, s);
      var mid = (a0 + a1) / 2;
      S('text', { x: cx + (rr + 13) * Math.cos(mid), y: cy - (rr + 13) * Math.sin(mid) + 4, 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': 700, fill: color, text: M.fmt(Math.abs(a1 - a0) * 180 / Math.PI, 0) + '°' }, s);
    }
    arc(0, r, 30, '#c2603f');
    arc(Math.PI, Math.PI + r, 30, '#c2603f');
    arc(r, Math.PI, 46, '#3f7d6a');
    arc(Math.PI + r, Math.PI * 2, 46, '#3f7d6a');
    S('circle', { cx: cx, cy: cy, r: 3.6, fill: '#2f3b52' }, s);
    M.$('#vt-a').textContent = M.fmt(vang) + '°';
    M.$('#vt-b').textContent = M.fmt(180 - vang) + '°';
    M.$('#vt-text').innerHTML = '红色的两个角是<b>对顶角</b>，永远相等（都是 ' + M.fmt(vang) + '°）；' +
      '红角和绿角是<b>邻补角</b>，加起来永远是 180°（' + M.fmt(vang) + '° + ' + M.fmt(180 - vang) + '° = 180°）。' +
      '不管怎么转，这两条规律都成立。';
    M.setState({ t: tilt, c: cut, s: show8, v: vang });
  }

  /* ---------- 装配 ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    M.chips(M.$('#pl-chips'), Object.keys(GROUPS).map(function (k) { return { label: GROUPS[k].name, value: k }; }), show8, function (v) { show8 = v; showAngles(); });
    M.bindRange(M.$('#pl-tilt'), function (v) { tilt = v; showAngles(); })();
    M.bindRange(M.$('#pl-cut'), function (v) { cut = v; showAngles(); })();
    M.$('#pl-snap').addEventListener('click', function () {
      M.$('#pl-tilt').value = 0; tilt = 0; M.paintRange(M.$('#pl-tilt')); showAngles();
    });
    M.bindRange(M.$('#vt-range'), function (v) { vang = v; showVert(); })();

    M.quiz([
      {
        level: 'base',
        title: '把两条直线调成平行，看内错角',
        desc: '先选「内错角」，再把倾斜角调成 0（或点「变成平行」）。',
        label: '在三线八角模型里操作',
        button: '检查现在的状态',
        check: function () {
          if (show8 !== 'alt') return { ok: false, msg: '先点「内错角」。' };
          if (Math.abs(tilt) > 0.01) return { ok: false, msg: '现在两条线还差 ' + M.fmt(Math.abs(tilt), 1) + '°，没平行。' };
          return { ok: true, msg: '两直线平行时内错角相等：∠3 = ∠6、∠4 = ∠5。记住顺序——<b>先平行，才有相等</b>；反过来用就是判定。' };
        }
      },
      {
        level: 'base',
        title: '两条直线相交，对顶角有什么关系？',
        desc: '上面转动一下那两条直线看看。',
        options: ['相等', '互补', '互余', '不一定'],
        answer: 0,
        hint: '对顶角是「顶对着顶」的那一对。',
        explain: '<b>对顶角相等</b>，这与两直线是否平行无关，任何时候都成立。相邻的两个角（邻补角）才是互补。'
      },
      {
        level: 'base',
        title: '两直线平行，同位角有什么关系？',
        desc: '上面点「变成平行」，再看同位角那一组。',
        options: ['相等', '互补', '互余', '无法确定'],
        answer: 0,
        hint: '平行时，这组角像被平移过去一样。',
        explain: '两直线平行时<b>同位角相等</b>、内错角相等、<b>同旁内角互补</b>。三条性质要一起记牢。'
      },
      {
        level: 'mid',
        title: '「同位角相等，两直线平行」是性质还是判定？',
        desc: '想想条件和结论哪个在前。',
        options: ['判定（由角相等推出平行）', '性质（由平行推出角相等）', '既是性质也是判定', '都不是，是定义'],
        answer: 0,
        hint: '看这句话的前半句是条件还是结论。',
        explain: '由「角相等」推出「平行」是<b>判定</b>；由「平行」推出「角相等」是<b>性质</b>。两句话长得像，方向正好相反，考试最爱在这里设陷阱。'
      },
      {
        level: 'mid',
        title: '两条直线相交，其中一个角是 130°，其余三个角分别是？',
        desc: '可以在上面的模型里调到 130° 看看。',
        options: ['130°、50°、50°', '130°、130°、130°', '50°、50°、50°', '130°、50°、130°'],
        answer: 0,
        hint: '对顶角相等，邻补角互补。',
        explain: '它的对顶角也是 130°，两个邻补角都是 180° − 130° = 50°。四个角两两相等，和为 360°。'
      },
      {
        level: 'mid',
        title: '两直线平行，一个同旁内角是 70°，另一个是？',
        desc: '同旁内角在截线同旁、两条被截线之间。',
        options: ['110°', '70°', '20°', '130°'],
        answer: 0,
        hint: '同旁内角互补，和是 180°。',
        explain: '180° − 70° = <b>110°</b>。注意同位角和内错角是<b>相等</b>，只有同旁内角是<b>互补</b>，别套错。'
      },
      {
        level: 'mid',
        title: '要证明两直线平行，下面哪个条件可以用？',
        desc: '判定是「由角的关系推出平行」。',
        options: ['内错角相等', '对顶角相等', '邻补角互补', '两条直线都很长'],
        answer: 0,
        hint: '对顶角相等和邻补角互补任何时候都成立，说明不了平行。',
        explain: '<b>内错角相等 → 两直线平行</b>，这是判定。而对顶角相等、邻补角互补对任意相交直线都成立，<b>不能</b>用来判定平行。'
      },
      {
        level: 'trap',
        title: '「两直线平行，内错角相等」这句话是？',
        desc: '看清楚哪半句是条件、哪半句是结论。',
        options: ['性质（由平行推出角相等）', '判定（由角相等推出平行）', '定义', '既是性质也是判定'],
        answer: 0,
        hint: '前半句「两直线平行」是已知条件。',
        explain: '条件是平行、结论是角相等，所以是<b>性质</b>。反过来「内错角相等，两直线平行」才是<b>判定</b>。两句话长得像、方向相反，写证明时用错方向就全错。'
      }
    ]);
  });
})();
