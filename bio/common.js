/* 生物互动馆 · 公共脚本：课程目录、上一课/下一课、分享、链接状态、小练习 */
(function () {
  'use strict';

  var LESSONS = [
    { id: 'life', file: 'life.html', no: 1, title: '生物的特征与细胞分裂', book: '七上' },
    { id: 'cell', file: 'cell.html', no: 2, title: '显微镜与细胞', book: '七上' },
    { id: 'groups', file: 'groups.html', no: 3, title: '植物、动物与微生物', book: '七上' },
    { id: 'classify', file: 'classify.html', no: 4, title: '生物的分类', book: '七上' },
    { id: 'grow', file: 'grow.html', no: 5, title: '植物的一生与蒸腾作用', book: '七下' },
    { id: 'plant', file: 'plant.html', no: 6, title: '光合作用与呼吸作用', book: '七下' },
    { id: 'human', file: 'human.html', no: 7, title: '生殖、青春期与营养', book: '七下' },
    { id: 'body', file: 'body.html', no: 8, title: '消化与血液循环', book: '七下' },
    { id: 'breath', file: 'breath.html', no: 9, title: '呼吸与废物排出', book: '七下' },
    { id: 'nerve', file: 'nerve.html', no: 10, title: '反射与眼睛', book: '八上' },
    { id: 'move', file: 'move.html', no: 11, title: '运动、听觉与激素', book: '八上' },
    { id: 'health', file: 'health.html', no: 12, title: '健康地生活', book: '八上' },
    { id: 'eco', file: 'eco.html', no: 13, title: '深圳湾的生态系统', book: '八上' },
    { id: 'repro', file: 'repro.html', no: 14, title: '生物的生殖和发育', book: '八下' },
    { id: 'gene', file: 'gene.html', no: 15, title: '遗传与变异', book: '八下' },
    { id: 'evolve', file: 'evolve.html', no: 16, title: '进化与多样性保护', book: '八下' }
  ];

  var NS = 'http://www.w3.org/2000/svg';

  function svg(tag, attrs, parent) {
    var el = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) {
      if (attrs[k] === null || attrs[k] === undefined) continue;
      if (k === 'text') el.textContent = attrs[k];
      else el.setAttribute(k, attrs[k]);
    }
    if (parent) parent.appendChild(el);
    return el;
  }

  function html(tag, attrs, parent) {
    var el = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (attrs[k] === null || attrs[k] === undefined) continue;
      if (k === 'text') el.textContent = attrs[k];
      else if (k === 'html') el.innerHTML = attrs[k];
      else if (k === 'class') el.className = attrs[k];
      else el.setAttribute(k, attrs[k]);
    }
    if (parent) parent.appendChild(el);
    return el;
  }

  function $(s, root) { return (root || document).querySelector(s); }
  function $$(s, root) { return Array.prototype.slice.call((root || document).querySelectorAll(s)); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* —— 链接里的状态：#a=1&b=2 —— */
  function getState() {
    var out = {};
    var h = location.hash.replace(/^#/, '');
    if (!h) return out;
    h.split('&').forEach(function (p) {
      var i = p.indexOf('=');
      if (i < 0) return;
      try { out[decodeURIComponent(p.slice(0, i))] = decodeURIComponent(p.slice(i + 1)); } catch (e) {}
    });
    return out;
  }
  var stateTimer = null;
  function setState(obj) {
    clearTimeout(stateTimer);
    stateTimer = setTimeout(function () {
      var parts = [];
      for (var k in obj) if (obj[k] !== undefined && obj[k] !== null && obj[k] !== '') parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]));
      var url = location.pathname + location.search + (parts.length ? '#' + parts.join('&') : '');
      try { history.replaceState(null, '', url); } catch (e) {}
    }, 120);
  }

  /* 滑块左侧填色 */
  function paintRange(input) {
    var min = +input.min, max = +input.max, v = +input.value;
    input.style.setProperty('--position', ((v - min) / (max - min) * 100) + '%');
  }
  function bindRange(input, fn) {
    var run = function () { paintRange(input); fn(+input.value); };
    input.addEventListener('input', run);
    paintRange(input);
    return run;
  }

  /* 一组按钮单选 */
  function chips(container, items, value, onChange) {
    container.innerHTML = '';
    var btns = items.map(function (it) {
      var b = html('button', { type: 'button', text: it.label, 'aria-pressed': String(it.value === value) }, container);
      b.dataset.value = it.value;
      b.addEventListener('click', function () { set(it.value, true); });
      return b;
    });
    function set(v, fire) {
      value = v;
      btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.value === String(v))); });
      if (fire && onChange) onChange(v);
    }
    return { set: set, get: function () { return value; } };
  }

  /* —— 课程目录与翻页 —— */
  function renderNav() {
    var id = document.body.dataset.module;
    var nav = $('#course-nav');
    if (nav) {
      nav.innerHTML = '';
      html('a', { href: 'index.html', html: '<b>首页</b>全部课程' }, nav);
      LESSONS.forEach(function (l) {
        var a = html('a', { href: l.file, html: '<b>' + l.no + '</b>' + l.title }, nav);
        if (l.id === id) { a.setAttribute('aria-current', 'page'); setTimeout(function () { a.scrollIntoView({ block: 'nearest', inline: 'center' }); }, 0); }
      });
    }
    var pager = $('#pager');
    if (pager) {
      var i = LESSONS.findIndex(function (l) { return l.id === id; });
      pager.innerHTML = '';
      if (i > 0) html('a', { href: LESSONS[i - 1].file, html: '← 上一课<strong>' + LESSONS[i - 1].title + '</strong>' }, pager);
      if (i >= 0 && i < LESSONS.length - 1) html('a', { class: 'next', href: LESSONS[i + 1].file, html: '下一课 →<strong>' + LESSONS[i + 1].title + '</strong>' }, pager);
      else html('a', { class: 'next', href: 'index.html', html: '回到首页 →<strong>全部 ' + LESSONS.length + ' 课</strong>' }, pager);
    }
  }

  /* —— 分享 —— */
  function copyText(t) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(t);
    return new Promise(function (res, rej) {
      var ta = html('textarea', {}, document.body);
      ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0';
      ta.select();
      try { document.execCommand('copy') ? res() : rej(); } catch (e) { rej(e); }
      ta.remove();
    });
  }
  function openShare() {
    var url = location.href;
    var back = html('div', { class: 'modal-backdrop', role: 'dialog', 'aria-modal': 'true', 'aria-label': '分享' }, document.body);
    var box = html('div', { class: 'share-dialog' }, back);
    html('button', { class: 'close', type: 'button', 'aria-label': '关闭', text: '×' }, box).addEventListener('click', close);
    html('p', { class: 'eyebrow', text: '生物互动馆 · 分享' }, box);
    html('h2', { text: '把这一页发给同学' }, box);
    html('p', { text: '链接会带上你现在调好的状态，对方打开看到的和你一样。' }, box);
    html('label', { for: 'share-url', text: '链接' }, box);
    var inp = html('input', { id: 'share-url', readonly: 'readonly' }, box);
    inp.value = url;
    var st = html('p', { class: 'copy-status', 'aria-live': 'polite' }, box);
    var btn = html('button', { class: 'primary', type: 'button', text: '复制链接' }, box);
    btn.addEventListener('click', function () {
      copyText(url).then(function () { st.textContent = '已复制，粘贴到微信发给好友吧。'; }, function () { inp.select(); st.textContent = '请长按上面的链接手动复制。'; });
    });
    html('div', { class: 'wechat-tip', text: '在微信里打开时，也可以点右上角「…」直接转发给朋友。' }, box);
    html('p', { class: 'share-disclaimer', text: '本站免登录，不收集任何个人信息。' }, box);
    document.body.classList.add('modal-open');
    back.addEventListener('click', function (e) { if (e.target === back) close(); });
    document.addEventListener('keydown', esc);
    btn.focus();
    function esc(e) { if (e.key === 'Escape') close(); }
    function close() { back.remove(); document.body.classList.remove('modal-open'); document.removeEventListener('keydown', esc); }
  }
  function bindShare() {
    $$('[data-share]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.dataset.share === 'copy') {
          copyText(location.href).then(function () { var o = b.innerHTML; b.textContent = '已复制 ✓'; setTimeout(function () { b.innerHTML = o; }, 1600); }, openShare);
        } else if (navigator.share && /Mobi|Android|iPhone/i.test(navigator.userAgent)) {
          navigator.share({ title: document.title, url: location.href }).catch(function () {});
        } else openShare();
      });
    });
  }

  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* —— 小练习引擎 ——
     { title, desc, label, button, setup(), check() -> {ok, msg} }   检查模型当前状态
     { title, desc, label, options:[...], answer, hint, explain }     选择题（选项每次打乱）
     可选 level: 'base' 基础 / 'mid' 提高 / 'trap' 易错（专考本课那个坑） */
  var LEVELS = { base: ['基础', 'lv-base'], mid: ['提高', 'lv-mid'], trap: ['易错', 'lv-trap'] };

  function quiz(items) {
    var i = 0;
    var first = [];    /* 每题「第一次作答」对不对，用来算自测分 */
    var solved = [];   /* 每题最终是否答对 */
    var stepEl = $('#quiz-step'), titleEl = $('#quiz-title'), descEl = $('#quiz-description'), labelEl = $('#quiz-label');
    var optsEl = $('#quiz-options'), checkBtn = $('#check-answer'), fb = $('#quiz-feedback'), nextBtn = $('#next-question');
    if (!titleEl) return;
    var card = titleEl.parentNode;

    /* 题号导航：做过的题变色，可以直接跳回去重做 */
    var nav = html('div', { class: 'quiz-nav' });
    card.insertBefore(nav, card.firstChild);
    var badge = html('span', { class: 'lv', hidden: 'hidden' });
    if (labelEl && labelEl.parentNode) labelEl.parentNode.insertBefore(badge, labelEl.nextSibling);
    var result = html('div', { class: 'quiz-result', hidden: 'hidden', role: 'status' }, card);

    function renderNav() {
      nav.innerHTML = '';
      items.forEach(function (q, k) {
        var cls = 'dot';
        if (k === i) cls += ' on';
        if (solved[k]) cls += ' ok'; else if (first[k] === false) cls += ' bad';
        var d = html('button', { type: 'button', class: cls, text: String(k + 1), 'aria-label': '第 ' + (k + 1) + ' 题' + (solved[k] ? '（已答对）' : '') }, nav);
        d.addEventListener('click', function () { i = k; show(); });
      });
    }

    function show() {
      var q = items[i];
      stepEl.textContent = (i + 1) + ' / ' + items.length;
      titleEl.textContent = q.title;
      descEl.innerHTML = q.desc || '';
      if (labelEl) labelEl.textContent = q.label || (q.options ? '选一个答案' : '在上面的模型里动手操作');
      var lv = LEVELS[q.level];
      if (lv) { badge.hidden = false; badge.textContent = lv[0]; badge.className = 'lv ' + lv[1]; }
      else badge.hidden = true;
      fb.textContent = ''; fb.className = 'feedback';
      nextBtn.hidden = true;
      result.hidden = true;
      if (q.options) {
        checkBtn.hidden = true;
        optsEl.hidden = false; optsEl.innerHTML = '';
        optsEl.className = 'option-grid' + (q.options.some(function (o) { return o.length > 9; }) ? ' single' : '');
        var order = q.options.map(function (o, k) { return k; });
        if (!q.keepOrder) order = shuffle(order);
        order.forEach(function (k) {
          var b = html('button', { type: 'button', html: q.options[k] }, optsEl);
          b.dataset.k = String(k);
          b.addEventListener('click', function () {
            $$('button', optsEl).forEach(function (x) { x.classList.remove('correct', 'wrong'); });
            if (k === q.answer) { b.classList.add('correct'); pass(q.explain); }
            else {
              b.classList.add('wrong');
              if (first[i] === undefined) first[i] = false;
              fb.className = 'feedback retry';
              fb.innerHTML = q.hint || '再想想，可以回到上面的模型里试一试。';
              renderNav();
            }
          });
        });
      } else {
        optsEl.hidden = true;
        checkBtn.hidden = false;
        checkBtn.textContent = q.button || '检查我的操作';
        if (q.setup) q.setup();
      }
      renderNav();
    }

    function pass(msg) {
      fb.className = 'feedback success';
      fb.innerHTML = '答对了！' + (msg || '');
      if (first[i] === undefined) first[i] = true;
      solved[i] = true;
      nextBtn.hidden = false;
      renderNav();
      var all = items.every(function (_, k) { return solved[k]; });
      if (all) {
        /* 全部做完：留在原地把成绩显示出来，按钮变成重做 */
        summary();
        nextBtn.textContent = '重新做一遍';
        nextBtn.dataset.restart = '1';
      } else {
        nextBtn.textContent = i < items.length - 1 ? '下一题' : '回到还没做的题';
        delete nextBtn.dataset.restart;
      }
    }

    function summary() {
      var good = 0, weak = [];
      items.forEach(function (q, k) {
        if (first[k]) good++; else weak.push(q);
      });
      var n = items.length;
      var tip;
      if (good === n) tip = '全部一次做对，这一课掌握得很扎实。';
      else if (good >= n - 2) tip = '只有少数几题卡了一下，回头把下面这几题再想一遍就好。';
      else tip = '错得有点多，建议回到上面的模型重新动手试一遍，再来做题。';
      result.hidden = false;
      result.innerHTML = '<h4>本课自测：一次做对 ' + good + ' / ' + n + '</h4><p>' + tip + '</p>' +
        (weak.length ? '<p class="weak">需要再看的：' + weak.map(function (q) {
          return '<span>' + (LEVELS[q.level] ? LEVELS[q.level][0] + '·' : '') + q.title + '</span>';
        }).join('') + '</p>' : '');
    }

    checkBtn.addEventListener('click', function () {
      var r = items[i].check();
      if (r.ok) pass(r.msg);
      else {
        if (first[i] === undefined) first[i] = false;
        fb.className = 'feedback retry';
        fb.innerHTML = r.msg || '还差一点，再调一调。';
        renderNav();
      }
    });
    nextBtn.addEventListener('click', function () {
      if (nextBtn.dataset.restart) {
        first = []; solved = []; i = 0;
        delete nextBtn.dataset.restart;
      } else {
        /* 优先跳到还没做对的题，而不是机械地 +1 */
        var next = -1, k;
        for (k = 1; k <= items.length; k++) {
          var j = (i + k) % items.length;
          if (!solved[j]) { next = j; break; }
        }
        i = next >= 0 ? next : (i + 1) % items.length;
      }
      show();
    });
    show();
  }

  /* —— 配对题：items=[[题干, 答案值, 说明?]]，options=[[值, 显示名]] 或 function(i) —— */
  function match(listSel, scoreSel, items, options, explain) {
    var list = $(listSel), done = 0, right = 0;
    list.innerHTML = '';
    items.forEach(function (it, i) {
      var row = html('div', { class: 'choice-row', 'data-i': String(i), style: 'flex-direction:column;align-items:stretch' }, list);
      html('p', { html: '<b>' + it[0] + '</b>' }, row);
      var box = html('div', { class: 'chips small', style: 'flex-wrap:wrap;justify-content:flex-start' }, row);
      var verdict = html('p', { class: 'verdict', hidden: 'hidden' }, row);
      var opts = typeof options === 'function' ? options(i) : options;
      opts.forEach(function (o) {
        var b = html('button', { type: 'button', text: o[1], 'aria-pressed': 'false' }, box);
        b.dataset.v = o[0];
        b.addEventListener('click', function () {
          if (row.dataset.done) return;
          row.dataset.done = '1'; done++;
          var ok = b.dataset.v === String(it[1]); if (ok) right++;
          row.classList.add(ok ? 'correct' : 'wrong'); b.setAttribute('aria-pressed', 'true');
          verdict.hidden = false;
          verdict.textContent = (ok ? '✓ ' : '✗ ') + (explain ? explain(it, ok) : '');
          $(scoreSel).textContent = done === items.length ? '答对 ' + right + ' / ' + items.length : '已答 ' + done + ' / ' + items.length;
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () { renderNav(); bindShare(); });

  window.Bio = { LESSONS: LESSONS, svg: svg, html: html, $: $, $$: $$, clamp: clamp, lerp: lerp, getState: getState, setState: setState, bindRange: bindRange, paintRange: paintRange, chips: chips, quiz: quiz, shuffle: shuffle, match: match };
})();
