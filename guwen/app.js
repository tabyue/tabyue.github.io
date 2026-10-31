/* 古诗文小站 · 主程序：首页筛选、单篇（读 / 逐句默写 / 理解性默写 / 字词 / 断句 / 翻译）、随机默写、易错字、按主题默写
   数据在 data-*.js，统一放进 window.GW；页面状态只存在网址 # 里，不保存任何学习记录 */
(function () {
  'use strict';
  var GW = window.GW || [];
  var BY = {};
  GW.forEach(function (p) { BY[p.id] = p; });
  var app = document.getElementById('app');
  var THEMES = ['思乡', '送别', '边塞', '爱国', '山水', '田园', '志向', '哲理', '咏物', '闲适', '怀古', '民生', '爱情'];

  /* ---------- 小工具 ---------- */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function el(tag, attrs, parent) {
    var e = document.createElement(tag);
    for (var k in attrs || {}) {
      if (k === 'html') e.innerHTML = attrs[k];
      else if (k === 'text') e.textContent = attrs[k];
      else if (attrs[k] !== null && attrs[k] !== undefined) e.setAttribute(k, attrs[k]);
    }
    if (parent) parent.appendChild(e);
    return e;
  }
  function clean(s) { return String(s).replace(/^¶/, ''); }
  /* 比较时去掉标点、空格和引号，只比汉字和字母数字 */
  function norm(s) { return String(s).replace(/[¶\s，。？！；：、“”‘’"'《》（）()〈〉·…—,.?!;:]/g, ''); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function setHash(h) { if (location.hash !== h) location.hash = h; else route(); }
  function kindName(k) { return k === '文' ? '文言文' : k; }
  function shortTitle(p) { return p.title.replace(/[《》]/g, ''); }

  /* 逐字比较：用最长公共子序列标出写错和漏写的字 */
  function diff(user, ans) {
    var a = norm(user), b = norm(ans), n = a.length, m = b.length, dp = [];
    for (var i = 0; i <= n; i++) { dp[i] = []; for (var j = 0; j <= m; j++) dp[i][j] = 0; }
    for (i = n - 1; i >= 0; i--) for (j = m - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    var ua = [], ba = [];
    i = 0; j = 0;
    while (i < n || j < m) {
      if (i < n && j < m && a[i] === b[j]) { ua.push([a[i], 1]); ba.push([b[j], 1]); i++; j++; }
      else if (j < m && (i >= n || dp[i][j + 1] >= dp[i + 1][j])) { ba.push([b[j], 0]); j++; }
      else { ua.push([a[i], 0]); i++; }
    }
    return { ok: a === b && a.length > 0, user: ua, ans: ba, empty: !a.length };
  }
  function diffHtml(d, hard) {
    var hs = (hard || []).join('');
    var u = d.user.map(function (c) { return c[1] ? esc(c[0]) : '<i class="bad">' + esc(c[0]) + '</i>'; }).join('');
    var a = d.ans.map(function (c) { return c[1] ? esc(c[0]) : '<i class="miss' + (hs.indexOf(c[0]) >= 0 ? ' hardc' : '') + '">' + esc(c[0]) + '</i>'; }).join('');
    return '<div class="df"><span class="df-l">你写的</span><span class="df-t">' + (u || '（空）') + '</span></div><div class="df"><span class="df-l">正确</span><span class="df-t">' + a + '</span></div>';
  }

  /* 一道填空：问题 + 输入框 + 检查；返回 { check() } 方便批量检查 */
  function blank(parent, o) {
    var box = el('div', { class: 'bk' }, parent);
    el('div', { class: 'bk-q', html: o.q }, box);
    var row = el('div', { class: 'bk-row' }, box);
    var inp = el('input', { class: 'bk-in', type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', placeholder: o.ph || '写下这一句', 'aria-label': '答案' }, row);
    var btn = el('button', { class: 'bk-go', type: 'button', text: '检查' }, row);
    var out = el('div', { class: 'bk-out' }, box);
    var done = null;
    function check(reveal) {
      var d = diff(inp.value, o.ans);
      if (d.empty && !reveal) { out.innerHTML = '<p class="hint">先写一写，再检查。想不起来可以点“看答案”。</p>'; return null; }
      done = d.ok;
      box.classList.toggle('ok', d.ok); box.classList.toggle('no', !d.ok);
      if (d.ok) out.innerHTML = '<p class="good">✓ 写对了' + (o.from ? '　<span class="from">' + o.from + '</span>' : '') + '</p>';
      else out.innerHTML = diffHtml(d, o.hard) + (o.from ? '<p class="from">' + o.from + '</p>' : '');
      return d.ok;
    }
    btn.addEventListener('click', function () { check(false); });
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.isComposing) check(false); });
    var see = el('button', { class: 'bk-see', type: 'button', text: '看答案' }, row);
    see.addEventListener('click', function () { check(true); });
    return { check: check, ok: function () { return done; }, input: inp };
  }

  /* 诗词按联分行、文言文按 ¶ 分段 */
  function groups(p) {
    var out = [], cur = [];
    if (p.kind === '文') {
      p.lines.forEach(function (l, i) { if (l.charAt(0) === '¶' && cur.length) { out.push(cur); cur = []; } cur.push(i); });
    } else {
      /* 一联两句为一行：遇到句末标点且已凑够偶数句才换行（“岱宗夫如何？齐鲁青未了。”是一联） */
      p.lines.forEach(function (l, i) { cur.push(i); if ((/[。？！；]["”’]?$/.test(l) && cur.length % 2 === 0) || cur.length >= 4) { out.push(cur); cur = []; } });
    }
    if (cur.length) out.push(cur);
    return out;
  }

  /* 默写题：给上句写下句
     · 诗：同一联里的上下句（groups 分出的一行）
     · 词、曲：任意相邻两句（词里“天下英雄谁敌手？曹刘。生子当如孙仲谋。”这种跨问号的也常考）
     · 文言文：只取名句里相邻的两句，不跨段 */
  function pairs(p) {
    var out = [], ok = {}, grp = {};
    (p.ming || p.lines.map(function (_, i) { return i; })).forEach(function (i) { ok[i] = 1; });
    groups(p).forEach(function (g, k) { g.forEach(function (i) { grp[i] = k; }); });
    for (var i = 0; i < p.lines.length - 1; i++) {
      if (!ok[i] || !ok[i + 1]) continue;
      if (p.lines[i + 1].charAt(0) === '¶') continue;
      if (p.kind === '诗' && grp[i] !== grp[i + 1]) continue;
      out.push([i, i + 1]);
    }
    return out;
  }
  function pairQ(p, pr, dir) {
    var a = clean(p.lines[pr[0]]), b = clean(p.lines[pr[1]]);
    var q = dir ? '<span class="gap">＿＿＿＿</span>' + esc(b) : esc(a) + '<span class="gap">＿＿＿＿</span>';
    /* 给出的那一句太短（如“曹刘。”）时，把再前面一句也带上做提示 */
    if (!dir && norm(a).length <= 3 && pr[0] > 0 && p.lines[pr[0]].charAt(0) !== '¶') q = '<span class="ctx">' + esc(clean(p.lines[pr[0] - 1])) + '</span>' + q;
    return { q: q, ans: dir ? a : b, hard: p.hard, from: '《' + shortTitle(p) + '》' + p.author };
  }

  /* ---------- 首页 ---------- */
  var filt = { kind: 'all', theme: '', q: '' };
  function home() {
    document.title = '古诗文小站 · 初中古诗文默写与文言文';
    app.innerHTML = '';
    var hero = el('section', { class: 'hub-hero' }, app);
    el('p', { class: 'eyebrow', html: '初中语文 <span>/</span> 统编版教材原文' }, hero);
    el('h1', { text: '背得准，写得对' }, hero);
    el('p', { class: 'subtitle', text: '默写丢分，多半不是没背，而是写错一个字。这里收了课标推荐背诵的 40 首古诗词曲和 24 篇课内文言文，每一句都能当场默写，写完马上标出错在哪个字。' }, hero);
    el('div', { class: 'hub-promise', html: '<span>40 首古诗词曲</span><span>24 篇文言文</span><span>写错的字标红</span><span>免登录、不保存记录</span>' }, hero);

    var tools = el('section', { class: 'gw-tools' }, app);
    [['#/drill', '随机默写', '像考试一样，6 个空，给上句写下句'], ['#/hard', '易错字', '把最容易写错的字单独练'], ['#/theme/思乡', '按主题默写', '思乡、送别、志向……理解性默写']].forEach(function (t) {
      el('a', { class: 'gw-tool', href: t[0], html: '<b>' + t[1] + '</b><span>' + t[2] + '</span><em>开始 →</em>' }, tools);
    });

    var bar = el('section', { class: 'card panel gw-filter' }, app);
    var r1 = el('div', { class: 'chips small', id: 'f-kind' }, bar);
    [['all', '全部 ' + GW.length], ['poem', '古诗词曲 ' + GW.filter(function (p) { return p.kind !== '文'; }).length], ['wen', '文言文 ' + GW.filter(function (p) { return p.kind === '文'; }).length]].forEach(function (k) {
      var b = el('button', { type: 'button', text: k[1], 'aria-pressed': String(filt.kind === k[0]) }, r1);
      b.addEventListener('click', function () { filt.kind = k[0]; home(); });
    });
    var r2 = el('div', { class: 'chips small', style: 'margin-top:8px' }, bar);
    [''].concat(THEMES).forEach(function (t) {
      var b = el('button', { type: 'button', text: t || '不限主题', 'aria-pressed': String(filt.theme === t) }, r2);
      b.addEventListener('click', function () { filt.theme = t; home(); });
    });
    var sr = el('input', { class: 'bk-in gw-search', type: 'search', placeholder: '搜篇名、作者或诗句，如“明月”', value: filt.q, 'aria-label': '搜索' }, bar);
    sr.addEventListener('input', function () { filt.q = sr.value; drawList(); });

    var list = el('section', { class: 'gw-list', 'aria-label': '篇目' }, app);
    function drawList() {
      list.innerHTML = '';
      var q = norm(filt.q);
      var items = GW.filter(function (p) {
        if (filt.kind === 'poem' && p.kind === '文') return false;
        if (filt.kind === 'wen' && p.kind !== '文') return false;
        if (filt.theme && p.themes.indexOf(filt.theme) < 0) return false;
        if (q && norm(p.title + p.author + p.lines.join('')).indexOf(q) < 0) return false;
        return true;
      });
      if (!items.length) { el('p', { class: 'note', text: '没有找到。换个关键词试试。' }, list); return; }
      items.forEach(function (p) {
        var first = clean(p.lines[0]) + (p.lines[1] && p.lines[0].length < 8 ? clean(p.lines[1]) : '');
        el('a', { class: 'gw-item', href: '#/p/' + p.id, html: '<span class="gw-k">' + kindName(p.kind) + '</span><b>' + esc(p.title) + '</b><span class="gw-a">' + esc(p.dyn) + ' · ' + esc(p.author) + '</span><span class="gw-f">' + esc(first) + '</span>' }, list);
      });
    }
    drawList();

    var ex = el('section', { class: 'section' }, app);
    el('div', { class: 'exam-card', html: '<h3><i>深圳中考</i> 语文里的古诗文</h3><ul>' +
      '<li><b>古诗文默写</b>：2026 年深圳中考语文是 6 个空的直接性默写，给出上句写下句，篇目都在课内。</li>' +
      '<li><b>文言文阅读</b>：常见题型有加点词意思辨析、句子翻译、用“/”给句子断句。</li>' +
      '<li><b>怎么练</b>：先“读原文”，再“逐句默写”。写错的字会标红，蓝色背景的是这一篇的易错字。</li></ul>' +
      '<div class="q"><b>小提示</b>　默写考的是“写对字”，不是“背得熟”。每天写 5～10 句，比反复朗读更有效。</div>' }, ex);
  }

  /* ---------- 单篇 ---------- */
  var MODES_POEM = [['read', '读原文'], ['mo', '逐句默写'], ['li', '理解性默写']];
  var MODES_WEN = [['read', '读原文'], ['mo', '名句默写'], ['li', '理解性默写'], ['ci', '字词'], ['duan', '断句'], ['yi', '翻译']];
  function piece(id, mode) {
    var p = BY[id];
    if (!p) return home();
    document.title = shortTitle(p) + ' · 古诗文小站';
    var modes = p.kind === '文' ? MODES_WEN : MODES_POEM;
    if (!modes.some(function (m) { return m[0] === mode; })) mode = 'read';
    app.innerHTML = '';
    var idx = GW.indexOf(p);
    el('a', { class: 'gw-back', href: '#/', text: '← 全部篇目' }, app);
    var head = el('div', { class: 'page-heading' }, app);
    el('p', { class: 'eyebrow', html: kindName(p.kind) + ' <span>/</span> ' + p.themes.join('、') }, head);
    el('h1', { text: p.title }, head);
    el('p', { class: 'subtitle', text: p.dyn + ' · ' + p.author }, head);
    var tabs = el('div', { class: 'chips gw-tabs', role: 'tablist' }, app);
    modes.forEach(function (m) {
      var b = el('button', { type: 'button', text: m[1], role: 'tab', 'aria-pressed': String(m[0] === mode) }, tabs);
      b.addEventListener('click', function () { setHash('#/p/' + id + '/' + m[0]); });
    });
    var body = el('section', { class: 'card panel gw-body' }, app);
    ({ read: readView, mo: moView, li: liView, ci: ciView, duan: duanView, yi: yiView })[mode](p, body);
    var nav = el('nav', { class: 'pager' }, app);
    if (idx > 0) el('a', { href: '#/p/' + GW[idx - 1].id + '/' + mode, html: '← 上一篇<strong>' + esc(GW[idx - 1].title) + '</strong>' }, nav);
    if (idx < GW.length - 1) el('a', { class: 'next', href: '#/p/' + GW[idx + 1].id + '/' + mode, html: '下一篇 →<strong>' + esc(GW[idx + 1].title) + '</strong>' }, nav);
    window.scrollTo(0, 0);
  }

  function markHard(text, hard, on) {
    var t = esc(text);
    if (!on || !hard || !hard.length) return t;
    var list = hard.slice().sort(function (a, b) { return b.length - a.length; });
    var re = new RegExp('(' + list.map(function (h) { return h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|') + ')', 'g');
    return t.replace(re, '<mark>$1</mark>');
  }
  function readView(p, body) {
    var mode = 'all', showHard = true;
    var bar = el('div', { class: 'gw-readbar' }, body);
    var chips = el('div', { class: 'chips small' }, bar);
    var opts = [['all', '全文'], ['half', '遮住下句'], ['first', '只留首字']];
    var btns = opts.map(function (o) {
      var b = el('button', { type: 'button', text: o[1], 'aria-pressed': String(o[0] === mode) }, chips);
      b.addEventListener('click', function () { mode = o[0]; btns.forEach(function (x, k) { x.setAttribute('aria-pressed', String(opts[k][0] === mode)); }); draw(); });
      return b;
    });
    var hb = el('button', { type: 'button', class: 'gw-hardbtn', text: '标出易错字：开' }, bar);
    hb.addEventListener('click', function () { showHard = !showHard; hb.textContent = '标出易错字：' + (showHard ? '开' : '关'); draw(); });
    var text = el('div', { class: 'gw-text' + (p.kind === '文' ? ' wen' : ' poem') }, body);
    var tip = el('p', { class: 'note' }, body);
    function draw() {
      text.innerHTML = '';
      groups(p).forEach(function (g) {
        var para = el('p', { class: 'gw-para' }, text);
        g.forEach(function (i, k) {
          var raw = clean(p.lines[i]);
          var hide = (mode === 'half' && k % 2 === 1) || mode === 'first';
          var s = el('span', { class: 'gw-l' + (p.ming && p.ming.indexOf(i) >= 0 ? ' ming' : '') + (hide ? ' hid' : '') }, para);
          if (hide) {
            var punct = raw.match(/[，。？！；：、“”‘’]+$/);
            var core = punct ? raw.slice(0, raw.length - punct[0].length) : raw;
            var lead = mode === 'first' ? core.charAt(0) : '';
            s.innerHTML = esc(lead) + '<span class="mask">' + core.slice(lead.length).replace(/./g, '口') + '</span>' + esc(punct ? punct[0] : '');
            s.title = '点一下显示这一句';
            s.addEventListener('click', function () { s.classList.remove('hid'); s.innerHTML = markHard(raw, p.hard, showHard); });
          } else s.innerHTML = markHard(raw, p.hard, showHard);
        });
      });
      tip.innerHTML = mode === 'all' ? (p.kind === '文' ? '带下划线的是常考名句，' : '') + '标黄的字是这一篇的易错字：' + p.hard.map(esc).join('、') + '。' : '先在心里背出被遮住的部分，再点一下那一句对答案。';
    }
    draw();
  }

  function batch(body, list, opts) {
    var hold = el('div', {}, body);
    var items = list.map(function (o) { return blank(hold, o); });
    var row = el('div', { class: 'btn-row' }, body);
    var all = el('button', { class: 'big-btn', type: 'button', text: '全部检查' }, row);
    var sum = el('p', { class: 'gw-sum' }, body);
    all.addEventListener('click', function () {
      var right = 0, wrote = 0;
      items.forEach(function (it) { var r = it.check(false); if (r !== null) { wrote++; if (r) right++; } });
      sum.innerHTML = '写了 ' + wrote + ' / ' + items.length + ' 个空，写对 <b>' + right + '</b> 个。' + (right === items.length ? '全对！' : wrote < items.length ? '还有没写的空。' : '红色是写错的字，蓝色是漏掉的字。');
    });
    if (opts && opts.again) { var ag = el('button', { class: 'ghost-btn', type: 'button', text: opts.againText || '换一组' }, row); ag.addEventListener('click', opts.again); }
    return items;
  }

  function moView(p, body) {
    var ps = pairs(p);
    el('p', { class: 'panel-sub', text: p.kind === '文' ? '只考常考名句：给出上句，写出下句；也有给下句写上句的。' : '给出上句写下句，或者给出下句写上句。写完按回车或“检查”。' }, body);
    var pick = shuffle(ps).slice(0, Math.min(8, ps.length)).sort(function (a, b) { return a[0] - b[0]; });
    batch(body, pick.map(function (pr) { return pairQ(p, pr, Math.random() < 0.3 ? 1 : 0); }), { again: function () { body.innerHTML = ''; moView(p, body); } });
  }
  function liView(p, body) {
    el('p', { class: 'panel-sub', text: '理解性默写：根据提示写出原句。需要写两句的，两句连着写就行，标点写不写都可以。' }, body);
    if (!p.understand || !p.understand.length) { el('p', { class: 'note', text: '这一篇暂时没有理解性默写题。' }, body); return; }
    batch(body, p.understand.map(function (u) {
      return { q: esc(u.ask), ans: u.ans.map(function (i) { return clean(p.lines[i]); }).join(''), hard: p.hard, ph: u.ans.length > 1 ? '写出 ' + u.ans.length + ' 句' : '写出这一句' };
    }));
  }

  function ciView(p, body) {
    var words = p.words || [];
    el('p', { class: 'panel-sub', text: '先看句子里标出的字，自己想一想它的意思，再点“看意思”。想测一测就点下面的“选一选”。' }, body);
    var chips = el('div', { class: 'chips small' }, body);
    var mode = 'card';
    [['card', '看一看'], ['quiz', '选一选']].forEach(function (m) {
      var b = el('button', { type: 'button', text: m[1], 'aria-pressed': String(m[0] === mode) }, chips);
      b.addEventListener('click', function () { mode = m[0]; Array.prototype.forEach.call(chips.children, function (x) { x.setAttribute('aria-pressed', String(x === b)); }); draw(); });
    });
    var box = el('div', { style: 'margin-top:12px' }, body);
    function sentence(w) { return esc(clean(p.lines[w.at])).replace(esc(w.w), '<mark class="w">' + esc(w.w) + '</mark>'); }
    function draw() {
      box.innerHTML = '';
      if (mode === 'card') {
        words.forEach(function (w) {
          var c = el('div', { class: 'ci' }, box);
          el('div', { class: 'ci-s', html: sentence(w) }, c);
          var b = el('button', { type: 'button', class: 'ci-btn', text: '看意思' }, c);
          var m = el('div', { class: 'ci-m', html: '<b>' + esc(w.w) + '</b>　' + esc(w.s) }, c);
          m.hidden = true;
          b.addEventListener('click', function () { m.hidden = !m.hidden; b.textContent = m.hidden ? '看意思' : '收起'; });
        });
      } else {
        var right = 0, done = 0, sum = null;
        shuffle(words).forEach(function (w) {
          var c = el('div', { class: 'ci' }, box);
          el('div', { class: 'ci-s', html: sentence(w) + '　<span class="from">“' + esc(w.w) + '”的意思是：</span>' }, c);
          var others = shuffle(words.filter(function (x) { return x.s !== w.s; })).slice(0, 3).map(function (x) { return x.s; });
          var opts = shuffle([w.s].concat(others));
          var row = el('div', { class: 'ci-opts' }, c);
          var answered = false;
          opts.forEach(function (o) {
            var b = el('button', { type: 'button', text: o }, row);
            b.addEventListener('click', function () {
              if (answered) return;
              answered = true; done++;
              if (o === w.s) { right++; b.classList.add('ok'); } else { b.classList.add('no'); Array.prototype.forEach.call(row.children, function (x) { if (x.textContent === w.s) x.classList.add('ok'); }); }
              sum.innerHTML = '已答 ' + done + ' / ' + words.length + '，答对 <b>' + right + '</b>';
            });
          });
        });
        sum = el('p', { class: 'gw-sum', text: '每题点一个选项。' }, box);
      }
    }
    draw();
  }

  function duanView(p, body) {
    el('p', { class: 'panel-sub', text: '点两个字之间的空隙加一条“/”，再点一下取消。断好了按“检查”。' }, body);
    (p.duan || []).forEach(function (d, k) {
      var c = el('div', { class: 'dn' }, body);
      el('div', { class: 'dn-h', text: '第 ' + (k + 1) + ' 句　（断 ' + (d.ans.split('/').length - 1) + ' 处）' }, c);
      var row = el('div', { class: 'dn-row' }, c);
      var cuts = {}, ansCut = {}, pos = 0;
      d.ans.split('').forEach(function (ch) { if (ch === '/') ansCut[pos] = 1; else pos++; });
      var chars = d.raw.split('');
      function draw(show) {
        row.innerHTML = '';
        chars.forEach(function (ch, i) {
          el('span', { class: 'dn-c', text: ch }, row);
          if (i < chars.length - 1) {
            var g = el('button', { type: 'button', class: 'dn-g' + (cuts[i + 1] ? ' on' : '') + (show ? (ansCut[i + 1] ? (cuts[i + 1] ? ' right' : ' missed') : (cuts[i + 1] ? ' wrong' : '')) : ''), 'aria-label': '在“' + ch + '”后面断开', text: cuts[i + 1] || (show && ansCut[i + 1]) ? '/' : '·' }, row);
            g.addEventListener('click', function () { if (cuts[i + 1]) delete cuts[i + 1]; else cuts[i + 1] = 1; draw(false); res.innerHTML = ''; });
          }
        });
      }
      draw(false);
      var brow = el('div', { class: 'btn-row' }, c);
      var go = el('button', { type: 'button', class: 'bk-go', text: '检查' }, brow);
      var res = el('p', { class: 'dn-res' }, c);
      go.addEventListener('click', function () {
        var miss = 0, wrong = 0;
        Object.keys(ansCut).forEach(function (x) { if (!cuts[x]) miss++; });
        Object.keys(cuts).forEach(function (x) { if (!ansCut[x]) wrong++; });
        draw(true);
        res.innerHTML = !miss && !wrong ? '<span class="good">✓ 断对了：' + esc(d.ans) + '</span>' : '<span class="badt">' + (wrong ? '多断了 ' + wrong + ' 处（红色）' : '') + (wrong && miss ? '，' : '') + (miss ? '漏了 ' + miss + ' 处（蓝色）' : '') + '</span>　正确：' + esc(d.ans);
      });
    });
  }

  function yiView(p, body) {
    el('p', { class: 'panel-sub', text: '先自己说一说或写一写这句话的意思，再点“看翻译”对照。重点字词要翻译到位。' }, body);
    (p.trans || []).forEach(function (t) {
      var c = el('div', { class: 'ci' }, body);
      el('div', { class: 'ci-s', text: t.src }, c);
      el('textarea', { class: 'bk-in', rows: 2, placeholder: '写下你的翻译（不会保存）' }, c);
      var b = el('button', { type: 'button', class: 'ci-btn', text: '看翻译' }, c);
      var m = el('div', { class: 'ci-m', text: t.tr }, c);
      m.hidden = true;
      b.addEventListener('click', function () { m.hidden = !m.hidden; b.textContent = m.hidden ? '看翻译' : '收起'; });
    });
  }

  /* ---------- 随机默写 ---------- */
  var scope = 'all';
  function drill() {
    document.title = '随机默写 · 古诗文小站';
    app.innerHTML = '';
    el('a', { class: 'gw-back', href: '#/', text: '← 全部篇目' }, app);
    var head = el('div', { class: 'page-heading' }, app);
    el('h1', { text: '随机默写' }, head);
    el('p', { class: 'subtitle', text: '像中考一样：6 个空，给出上句写下句，每个空都标了出处。' }, head);
    var chips = el('div', { class: 'chips small' }, app);
    [['all', '全部篇目'], ['poem', '只考古诗词曲'], ['wen', '只考文言文']].forEach(function (s) {
      var b = el('button', { type: 'button', text: s[1], 'aria-pressed': String(scope === s[0]) }, chips);
      b.addEventListener('click', function () { scope = s[0]; drill(); });
    });
    var body = el('section', { class: 'card panel gw-body', style: 'margin-top:12px' }, app);
    var pool = [];
    GW.forEach(function (p) {
      if (scope === 'poem' && p.kind === '文') return;
      if (scope === 'wen' && p.kind !== '文') return;
      pairs(p).forEach(function (pr) { pool.push([p, pr]); });
    });
    var used = {}, pick = [];
    shuffle(pool).forEach(function (x) { if (pick.length < 6 && !used[x[0].id]) { used[x[0].id] = 1; pick.push(x); } });
    batch(body, pick.map(function (x) { return pairQ(x[0], x[1], 0); }), { again: drill, againText: '再来一组' });
  }

  /* ---------- 易错字 ---------- */
  function hardDrill() {
    document.title = '易错字 · 古诗文小站';
    app.innerHTML = '';
    el('a', { class: 'gw-back', href: '#/', text: '← 全部篇目' }, app);
    var head = el('div', { class: 'page-heading' }, app);
    el('h1', { text: '易错字' }, head);
    el('p', { class: 'subtitle', text: '每句挖掉一个最容易写错的字，补上它。中考默写错一个字，这一空就没分了。' }, head);
    var body = el('section', { class: 'card panel gw-body' }, app);
    var pool = [];
    GW.forEach(function (p) {
      (p.hard || []).forEach(function (h) {
        for (var i = 0; i < p.lines.length; i++) {
          if ((!p.ming || p.ming.indexOf(i) >= 0) && clean(p.lines[i]).indexOf(h) >= 0) { pool.push({ p: p, i: i, h: h }); break; }
        }
      });
    });
    var pick = shuffle(pool).slice(0, 10);
    batch(body, pick.map(function (x) {
      var line = clean(x.p.lines[x.i]);
      /* 只给一个短分句不好回忆，带上前一句做提示 */
      var prev = x.i > 0 && x.p.lines[x.i].charAt(0) !== '¶' ? '<span class="ctx">' + esc(clean(x.p.lines[x.i - 1])) + '</span>' : '';
      var q = prev + esc(line).replace(esc(x.h), '<span class="gap">' + x.h.replace(/./g, '＿') + '</span>');
      return { q: q, ans: x.h, hard: [x.h], ph: '补上 ' + x.h.length + ' 个字', from: '《' + shortTitle(x.p) + '》' };
    }), { again: hardDrill, againText: '换一组' });
    el('p', { class: 'note', text: '题库共 ' + pool.length + ' 个易错字，每次随机抽 10 个。' }, body);
  }

  /* ---------- 按主题 ---------- */
  function themeView(t) {
    if (THEMES.indexOf(t) < 0) t = '思乡';
    document.title = t + ' · 按主题默写 · 古诗文小站';
    app.innerHTML = '';
    el('a', { class: 'gw-back', href: '#/', text: '← 全部篇目' }, app);
    var head = el('div', { class: 'page-heading' }, app);
    el('h1', { text: '按主题默写' }, head);
    el('p', { class: 'subtitle', text: '中考常把同一主题的名句串在一起考。选一个主题，把相关篇目的理解性默写一起练。' }, head);
    var chips = el('div', { class: 'chips small' }, app);
    THEMES.forEach(function (x) {
      var n = GW.filter(function (p) { return p.themes.indexOf(x) >= 0; }).length;
      var b = el('button', { type: 'button', text: x + ' ' + n, 'aria-pressed': String(x === t) }, chips);
      b.addEventListener('click', function () { setHash('#/theme/' + x); });
    });
    var body = el('section', { class: 'card panel gw-body', style: 'margin-top:12px' }, app);
    var list = [];
    GW.forEach(function (p) {
      if (p.themes.indexOf(t) < 0) return;
      (p.understand || []).forEach(function (u) { list.push({ q: esc(u.ask), ans: u.ans.map(function (i) { return clean(p.lines[i]); }).join(''), hard: p.hard, from: '《' + shortTitle(p) + '》' + p.author }); });
    });
    var pick = shuffle(list).slice(0, 8);
    el('p', { class: 'panel-sub', text: '「' + t + '」主题共 ' + list.length + ' 道题，每次随机 ' + pick.length + ' 道。' }, body);
    batch(body, pick, { again: function () { themeView(t); }, againText: '换一组' });
  }

  /* ---------- 路由 ---------- */
  function route() {
    var h = decodeURIComponent(location.hash.replace(/^#\/?/, '')).split('/');
    if (h[0] === 'p') piece(h[1], h[2]);
    else if (h[0] === 'drill') drill();
    else if (h[0] === 'hard') hardDrill();
    else if (h[0] === 'theme') themeView(h[1]);
    else home();
  }
  window.addEventListener('hashchange', route);
  document.addEventListener('DOMContentLoaded', route);

  /* 分享：复制当前网址 */
  var sb = document.getElementById('share');
  if (sb) sb.addEventListener('click', function () {
    var url = location.href, done = function () { sb.lastChild.textContent = '已复制'; setTimeout(function () { sb.lastChild.textContent = '分享'; }, 1600); };
    if (navigator.share) navigator.share({ title: document.title, url: url }).catch(function () {});
    else if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(url).then(done);
    else { var t = el('textarea', { style: 'position:fixed;opacity:0' }, document.body); t.value = url; t.select(); try { document.execCommand('copy'); done(); } catch (e) {} t.remove(); }
  });
})();
