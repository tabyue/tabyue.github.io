/* 第 10 课 · 三角形与全等（北师大版七下第四章） */
(function () {
  'use strict';
  var M = window.Mx, st = M.getState();

  /* ---------- 模型一：三边关系 ---------- */
  var sa = M.num(st.a, 5, 1, 10), sb = M.num(st.b, 6, 1, 10), sc = M.num(st.c, 8, 1, 10);

  function canForm(x, y, z) { return x + y > z && x + z > y && y + z > x; }

  function showTri() {
    var s = M.$('#tr-fig');
    s.innerHTML = '';
    var S = M.svg, k = 17, ox = 40, oy = 150;
    var ok = canForm(sa, sb, sc);
    if (ok) {
      /* 用余弦定理定出第三点 */
      var A = { x: ox, y: oy }, B = { x: ox + sc * k, y: oy };
      var cosA = (sb * sb + sc * sc - sa * sa) / (2 * sb * sc);
      var ang = Math.acos(M.clamp(cosA, -1, 1));
      var C = { x: ox + sb * k * Math.cos(ang), y: oy - sb * k * Math.sin(ang) };
      S('polygon', { points: [A, B, C].map(function (p) { return M.fmt(p.x, 1) + ',' + M.fmt(p.y, 1); }).join(' '), fill: '#eaeff8', stroke: '#3a5a93', 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, s);
      [[A, B, 'c=' + sc, 0, 16], [A, C, 'b=' + sb, -18, 0], [B, C, 'a=' + sa, 16, 0]].forEach(function (e) {
        S('text', { x: (e[0].x + e[1].x) / 2 + e[3], y: (e[0].y + e[1].y) / 2 + e[4], 'text-anchor': 'middle', 'font-size': 11, fill: '#2f5aa8', 'font-weight': 600, text: e[2] }, s);
      });
      /* 三个内角 */
      var angA = ang * 180 / Math.PI;
      var cosB = (sa * sa + sc * sc - sb * sb) / (2 * sa * sc);
      var angB = Math.acos(M.clamp(cosB, -1, 1)) * 180 / Math.PI;
      var angC = 180 - angA - angB;
      S('text', { x: A.x + 14, y: A.y - 8, 'font-size': 10, fill: '#a4492b', text: M.fmt(angA, 0) + '°' }, s);
      S('text', { x: B.x - 24, y: B.y - 8, 'font-size': 10, fill: '#a4492b', text: M.fmt(angB, 0) + '°' }, s);
      S('text', { x: C.x - 8, y: C.y + 18, 'font-size': 10, fill: '#a4492b', text: M.fmt(angC, 0) + '°' }, s);
      M.$('#tr-angles').textContent = M.fmt(angA, 0) + '° + ' + M.fmt(angB, 0) + '° + ' + M.fmt(angC, 0) + '° = 180°';
      M.$('#tr-kind').textContent = Math.max(angA, angB, angC) > 90.5 ? '钝角三角形' : (Math.abs(Math.max(angA, angB, angC) - 90) < 0.6 ? '直角三角形' : '锐角三角形');
    } else {
      /* 拼不成：把三根小棒平放，直观看出两短边够不到 */
      var arr = [sa, sb, sc].sort(function (p, q) { return p - q; });
      S('line', { x1: ox, y1: 70, x2: ox + arr[2] * k, y2: 70, stroke: '#c2603f', 'stroke-width': 7, 'stroke-linecap': 'round' }, s);
      S('text', { x: ox + arr[2] * k / 2, y: 58, 'text-anchor': 'middle', 'font-size': 10.5, fill: '#a4492b', text: '最长边 ' + arr[2] }, s);
      S('line', { x1: ox, y1: 108, x2: ox + arr[0] * k, y2: 108, stroke: '#5d7cb0', 'stroke-width': 7, 'stroke-linecap': 'round' }, s);
      S('line', { x1: ox + arr[0] * k + 4, y1: 108, x2: ox + (arr[0] + arr[1]) * k + 4, y2: 108, stroke: '#3f7d6a', 'stroke-width': 7, 'stroke-linecap': 'round' }, s);
      S('text', { x: ox + (arr[0] + arr[1]) * k / 2, y: 128, 'text-anchor': 'middle', 'font-size': 10.5, fill: '#4a5568', text: '另两边之和 ' + (arr[0] + arr[1]) }, s);
      S('line', { x1: ox + (arr[0] + arr[1]) * k + 4, y1: 100, x2: ox + arr[2] * k, y2: 100, stroke: '#a4422c', 'stroke-width': 1.5, 'stroke-dasharray': '4 3' }, s);
      S('text', { x: ox + 10, y: 150, 'font-size': 11, fill: '#a4422c', 'font-weight': 700, text: '两根短的接起来还够不到长的，围不成三角形' }, s);
      M.$('#tr-angles').textContent = '—';
      M.$('#tr-kind').textContent = '围不成';
    }
    M.$('#tr-verdict').innerHTML = ok ? '<b style="color:#2f6a4a">能围成三角形</b>' : '<b style="color:#a4422c">围不成</b>';
    var arr2 = [sa, sb, sc].sort(function (p, q) { return p - q; });
    M.$('#tr-check').innerHTML = '只要检查<b>最短两边之和</b>是否大于最长边：' +
      arr2[0] + ' + ' + arr2[1] + ' = ' + (arr2[0] + arr2[1]) + (arr2[0] + arr2[1] > arr2[2] ? ' > ' : ' ≤ ') + arr2[2] + '，所以' + (ok ? '能' : '不能') + '。';
    M.$('#tr-range').innerHTML = '如果已知两边是 ' + sa + ' 和 ' + sb + '，那么第三边 x 必须满足 <b>' + Math.abs(sa - sb) + ' &lt; x &lt; ' + (sa + sb) + '</b>。';
    M.setState({ a: sa, b: sb, c: sc, g: cong });
  }

  /* ---------- 模型二：全等的判定条件 ---------- */
  var CONG = {
    sss: { name: 'SSS', full: '三边对应相等', ok: true, why: '三条边定死了，三角形的形状和大小就唯一确定。这也是三角形具有<b>稳定性</b>的原因。' },
    sas: { name: 'SAS', full: '两边及其夹角相等', ok: true, why: '两条边加上它们<b>夹着</b>的角，第三边随之确定。注意必须是夹角。' },
    asa: { name: 'ASA', full: '两角及其夹边相等', ok: true, why: '两个角定了，第三个角也定了；再加一条夹边，大小就确定。' },
    aas: { name: 'AAS', full: '两角及其中一角的对边相等', ok: true, why: '由两角可推出第三角，于是转化成 ASA。' },
    ssa: { name: 'SSA', full: '两边及其中一边的对角相等', ok: false, why: '角不是夹角时，可能画出<b>两个不同</b>的三角形（一个锐角、一个钝角），所以不能判定全等。' },
    aaa: { name: 'AAA', full: '三角对应相等', ok: false, why: '三个角相同只能说明形状一样，大小可以差很多——那是<b>相似</b>，不是全等。' }
  };
  var cong = st.g || 'sss';

  function showCong() {
    var c = CONG[cong];
    var s = M.$('#cg-fig');
    s.innerHTML = '';
    var S = M.svg;
    function tri(ox, oy, scale, color, fill) {
      var pts = [[ox, oy], [ox + 72 * scale, oy], [ox + 26 * scale, oy - 54 * scale]];
      S('polygon', { points: pts.map(function (p) { return M.fmt(p[0], 1) + ',' + M.fmt(p[1], 1); }).join(' '), fill: fill, stroke: color, 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, s);
      return pts;
    }
    if (cong === 'aaa') {
      tri(24, 120, 1, '#3a5a93', '#eaeff8');
      tri(128, 120, 1.5, '#c2603f', '#f7e9e3');
      S('text', { x: 60, y: 138, 'font-size': 10.5, fill: '#3a5a93', text: '三角相同' }, s);
      S('text', { x: 160, y: 138, 'font-size': 10.5, fill: '#a4492b', text: '但大小不同' }, s);
    } else if (cong === 'ssa') {
      /* 同样的两边一对角，画出两种可能 */
      S('line', { x1: 30, y1: 126, x2: 250, y2: 126, stroke: '#8795b5', 'stroke-width': 1.4 }, s);
      S('line', { x1: 60, y1: 126, x2: 128, y2: 52, stroke: '#3a5a93', 'stroke-width': 2.4 }, s);
      S('circle', { cx: 128, cy: 52, r: 68, fill: 'none', stroke: '#c2603f', 'stroke-width': 1.3, 'stroke-dasharray': '5 4' }, s);
      [78, 178].forEach(function (x, i) {
        S('line', { x1: 128, y1: 52, x2: x, y2: 126, stroke: i ? '#c2603f' : '#3f7d6a', 'stroke-width': 2.2 }, s);
        S('circle', { cx: x, cy: 126, r: 4, fill: i ? '#c2603f' : '#3f7d6a' }, s);
      });
      S('text', { x: 30, y: 150, 'font-size': 10.5, fill: '#a4492b', text: '同样的两边一对角，第三点有两个位置 → 画出两个不同的三角形' }, s);
    } else {
      var p1 = tri(28, 120, 1, '#3a5a93', '#eaeff8');
      var p2 = tri(140, 120, 1, '#3f7d6a', '#e8f0e6');
      S('text', { x: 118, y: 92, 'font-size': 16, fill: '#2f6a4a', text: '≅' }, s);
      var mark = { sss: [0, 1, 2], sas: [0, 2], asa: [0], aas: [1] }[cong] || [];
      mark.forEach(function (i) {
        var a = p1[i], b = p1[(i + 1) % 3], a2 = p2[i], b2 = p2[(i + 1) % 3];
        [[a, b], [a2, b2]].forEach(function (e) {
          S('circle', { cx: (e[0][0] + e[1][0]) / 2, cy: (e[0][1] + e[1][1]) / 2, r: 3.4, fill: '#c2603f' }, s);
        });
      });
    }
    M.$('#cg-name').textContent = c.name;
    M.$('#cg-full').textContent = c.full;
    M.$('#cg-ok').innerHTML = c.ok ? '<b style="color:#2f6a4a">能判定全等 ✓</b>' : '<b style="color:#a4422c">不能判定全等 ✗</b>';
    M.$('#cg-why').innerHTML = c.why;
    M.setState({ a: sa, b: sb, c: sc, g: cong });
  }

  /* ---------- 装配 ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    ['a', 'b', 'c'].forEach(function (k, i) {
      M.bindRange(M.$('#tr-' + k), function (v) {
        if (i === 0) sa = v; else if (i === 1) sb = v; else sc = v;
        showTri();
      });
    });
    showTri();

    M.chips(M.$('#cg-chips'), Object.keys(CONG).map(function (k) { return { label: CONG[k].name, value: k }; }), cong, function (v) { cong = v; showCong(); });
    showCong();

    M.quiz([
      {
        title: '把三边调成 2、3、8，看能不能围成',
        desc: '拖三个滑块，看结论怎么变。',
        label: '在三边关系模型里调滑块',
        button: '检查三边',
        check: function () {
          if (!(sa === 2 && sb === 3 && sc === 8) && !(sa === 8 && sb === 3 && sc === 2) && !(sa === 2 && sb === 8 && sc === 3) &&
              !(sa === 3 && sb === 2 && sc === 8) && !(sa === 8 && sb === 2 && sc === 3) && !(sa === 3 && sb === 8 && sc === 2)) {
            return { ok: false, msg: '现在是 ' + sa + '、' + sb + '、' + sc + '，把三根调成 2、3、8（顺序随意）。' };
          }
          return { ok: true, msg: '2 + 3 = 5 &lt; 8，两根短的接起来还够不到长的，围不成三角形。判断时<b>只需比较最短两边之和与最长边</b>。' };
        }
      },
      {
        title: '已知两边长 5 和 9，第三边可以是多少？',
        desc: '第三边要比两边之差大、比两边之和小。',
        options: ['6', '4', '14', '3'],
        answer: 0,
        hint: '范围是 9 − 5 < x < 9 + 5。',
        explain: '4 &lt; x &lt; 14，所以只有 6 符合。注意端点取不到：x = 4 或 14 时三点共线，围不成三角形。'
      },
      {
        title: '哪一组条件<b>不能</b>判定两个三角形全等？',
        desc: '可以在上面逐个点开看。',
        options: ['两边及其中一边的对角（SSA）', '三边（SSS）', '两角及其夹边（ASA）', '两边及其夹角（SAS）'],
        answer: 0,
        hint: '想想有没有可能画出两个不一样的三角形。',
        explain: 'SSA 不行：同样的两边和一个非夹角，可以画出两个不同的三角形。另外 AAA 也不行，那只能说明相似。'
      }
    ]);
  });
})();
