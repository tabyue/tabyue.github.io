/* 六站通用：每课「对应教材」+「深圳中考真题」
   数据：
     textbook.js → window.TEXTBOOK = { 课id: ['八上 第一章 机械运动', …] }
     zhenti.js   → window.ZHENTI   = [ { id, year, no, type, lesson, stem, options, answer, explain, src, part } ]
   本文件不依赖各站的 common.js，只用各站 style.css 里都有的 CSS 变量（--green / --soft / --muted / --line）。
   源文件在 tools/shared/extras.js，改完用 tools/shared/sync.sh 复制到各站，不要在站点目录里单独改。 */
(function () {
  'use strict';
  function el(tag, attrs, parent) {
    var e = document.createElement(tag);
    for (var k in attrs || {}) {
      if (k === 'html') e.innerHTML = attrs[k];
      else if (k === 'text') e.textContent = attrs[k];
      else e.setAttribute(k, attrs[k]);
    }
    if (parent) parent.appendChild(e);
    return e;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  /* 题干里允许少量排版：换行 \n、上下标 ^{} _{}，其余一律转义 */
  function fmt(s) {
    return esc(s).replace(/\^\{([^}]*)\}/g, '<sup>$1</sup>').replace(/_\{([^}]*)\}/g, '<sub>$1</sub>').replace(/\n/g, '<br>');
  }

  function covers(id) {
    var tb = window.TEXTBOOK, list = tb && tb[id];
    if (!list || !list.length || document.querySelector('.covers')) return;
    var h1 = document.querySelector('main h1');
    var head = document.querySelector('.page-heading') || (h1 && h1.parentNode);
    if (!head) return;
    var box = el('div', { class: 'covers' });
    el('span', { class: 'covers-label', text: '对应教材' }, box);
    var ul = el('div', { class: 'covers-list' }, box);
    list.forEach(function (t) { el('span', { text: t }, ul); });
    head.appendChild(box);
  }

  function zhenti(id) {
    var all = window.ZHENTI || [];
    var list = all.filter(function (q) { return q.lesson === id; });
    if (!list.length) return;
    list.sort(function (a, b) { return b.year - a.year || (parseInt(a.no.replace(/\D/g, ''), 10) || 0) - (parseInt(b.no.replace(/\D/g, ''), 10) || 0); });
    var exam = document.querySelector('.exam-card');
    var anchor = exam ? (exam.closest('section') || exam) : document.querySelector('.pager, #pager');
    if (!anchor) return;
    var sec = el('section', { class: 'section zt', 'aria-label': '深圳中考真题' });
    anchor.parentNode.insertBefore(sec, anchor);
    var card = el('div', { class: 'zt-card' }, sec);
    var label = (window.ZHENTI_LABEL || '深圳中考');
    el('div', { class: 'zt-head', html: '<h2><i>真题</i> ' + esc(label) + '考过这样的题</h2><span class="zt-n">' + list.length + ' 道</span>' }, card);
    el('p', { class: 'zt-lead', text: '下面是和这一课有关的深圳' + label.replace('深圳', '') + '原题，题号对应当年试卷。先自己做，再看答案和解析。' }, card);
    list.forEach(function (q) {
      var box = el('div', { class: 'zt-q' }, card);
      var recall = /回忆/.test(q.part || '');
      var note = (q.part || '').replace(/[，、；;\s]*回忆版[，、；;\s]*/g, '，').replace(/^，+|，+$/g, '');
      var tag = el('div', { class: 'zt-tagrow' }, box);
      el('span', { class: 'zt-tag', text: q.year + ' 年' + label + ' · ' + q.no }, tag);
      if (recall) el('span', { class: 'zt-recall', text: '回忆版', title: '题干来自考后回忆整理，措辞可能与原卷略有出入' }, tag);
      if (note) el('span', { class: 'zt-note', text: note }, tag);
      el('div', { class: 'zt-stem', html: fmt(q.stem) }, box);
      var ans = el('div', { class: 'zt-ans' });
      ans.hidden = true;
      ans.innerHTML = '<b>答案</b>　' + fmt(q.answer) + (q.explain ? '<div class="zt-ex"><b>解析</b>　' + fmt(q.explain) + '</div>' : '');
      if (q.options && q.options.length) {
        var row = el('div', { class: 'zt-opts' }, box);
        var done = false;
        q.options.forEach(function (o, i) {
          var letter = 'ABCD'.charAt(i);
          var b = el('button', { type: 'button', html: '<b>' + letter + '</b> ' + fmt(o) }, row);
          b.addEventListener('click', function () {
            if (done) return;
            done = true;
            var right = String(q.answer).trim().charAt(0) === letter;
            b.classList.add(right ? 'ok' : 'no');
            if (!right) Array.prototype.forEach.call(row.children, function (x, k) { if ('ABCD'.charAt(k) === String(q.answer).trim().charAt(0)) x.classList.add('ok'); });
            ans.hidden = false;
            btn.textContent = '收起解析';
          });
        });
      }
      box.appendChild(ans);
      var btn = el('button', { type: 'button', class: 'zt-btn', text: q.options && q.options.length ? '看答案与解析' : '看答案' }, box);
      btn.addEventListener('click', function () { ans.hidden = !ans.hidden; btn.textContent = ans.hidden ? (q.options && q.options.length ? '看答案与解析' : '看答案') : '收起'; });
    });
    el('p', { class: 'zt-src', text: '说明：深圳不公开发布考试原卷，这里的题目按网上流传的考后整理卷收录，题号照整理卷；标“回忆版”的是考生回忆整理的题干，措辞可能与原卷略有出入。答案都对照过两处以上公开解析。必须看图才能作答的题没有收录。' }, card);
  }

  var css = '' +
    '.covers{display:flex;gap:10px;align-items:flex-start;margin-top:14px;flex-wrap:wrap}' +
    '.covers-label{flex:none;font-size:13px;font-weight:700;color:var(--green);background:var(--soft);border-radius:999px;padding:4px 10px}' +
    '.covers-list{display:flex;flex-wrap:wrap;gap:6px}' +
    '.covers-list span{font-size:13px;color:var(--muted);background:#fff;border:1px solid var(--line);border-radius:999px;padding:3px 10px}' +
    '.zt-card{background:#fff;border:1px solid var(--line);border-radius:20px;padding:20px 22px}' +
    '.zt-head{display:flex;justify-content:space-between;align-items:baseline;gap:10px}' +
    '.zt-head h2{margin:0;font-size:21px}' +
    '.zt-head h2 i{font-style:normal;font-size:14px;color:#fff;background:var(--green);border-radius:7px;padding:2px 8px;margin-right:6px;vertical-align:2px}' +
    '.zt-n{font-size:14px;color:var(--muted)}' +
    '.zt-lead{font-size:15px;color:var(--muted);line-height:1.8;margin:6px 0 2px}' +
    '.zt-q{border-top:1px dashed var(--line);margin-top:14px;padding-top:14px}' +
    '.zt-tagrow{display:flex;flex-wrap:wrap;gap:6px;align-items:baseline}' +
    '.zt-tag{display:inline-block;font-size:12.5px;font-weight:700;color:var(--green);background:var(--soft);border-radius:6px;padding:2px 8px}' +
    '.zt-recall{font-size:12px;font-weight:600;color:#8a6418;background:#fff4d9;border-radius:6px;padding:2px 7px}' +
    '.zt-note{flex-basis:100%;font-size:13px;color:var(--muted);line-height:1.6}' +
    '.zt-stem{font-size:16px;line-height:1.85;margin-top:8px}' +
    '.zt-stem sup,.zt-ans sup,.zt-opts sup{font-size:.7em}' +
    '.zt-opts{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}' +
    '.zt-opts button{text-align:left;font:inherit;font-size:15px;line-height:1.6;padding:9px 12px;border-radius:11px;background:#f7f8f6;border:1px solid var(--line);color:inherit;min-height:44px;cursor:pointer}' +
    '.zt-opts button b{color:var(--green);margin-right:4px}' +
    '.zt-opts button.ok{background:#e6f3e8;border-color:#9cc6a3}' +
    '.zt-opts button.no{background:#fbeae4;border-color:#e2b6a5}' +
    '.zt-btn{margin-top:10px;font:inherit;font-size:14px;border-radius:10px;padding:8px 14px;min-height:40px;background:var(--soft);color:var(--green);border:0;cursor:pointer}' +
    '.zt-ans{margin-top:10px;font-size:15px;line-height:1.85;background:#f8f9f7;border-left:4px solid var(--green);border-radius:10px;padding:10px 12px}' +
    '.zt-ex{margin-top:6px}' +
    '.zt-src{font-size:13px;color:var(--muted);margin:14px 0 0;line-height:1.7}' +
    '@media (max-width:640px){.zt-opts{grid-template-columns:1fr}.zt-card{padding:16px}}';

  function init() {
    var id = document.body && document.body.dataset.module;
    if (!id) return;
    if (!document.getElementById('extras-css')) { var st = el('style', { id: 'extras-css' }); st.textContent = css; document.head.appendChild(st); }
    covers(id);
    zhenti(id);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
