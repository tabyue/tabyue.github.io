'use strict';

// 运行：node tools/test_learn_ui.cjs；可选 PLAYWRIGHT_MODULE、EDGE_PATH、LEARN_TEST_FILTER。
// 仅使用临时浏览器 context；不会连接用户浏览器或写入业务文件。
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, '.workbuddy', 'validation', 'learn-2026-10-26');
const RUN = new Date().toISOString().replace(/[:.]/g, '-');
const TIMEOUT = 10000;
const LP_KEY = 'eai_learn_progress';
const readJSON = relative => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
const ld = readJSON('data/learning-path.json');
const modules = ld.stages.flatMap(stage => stage.modules);
const indexes = Object.fromEntries(modules.map(m => [m.id, readJSON(`data/learn-split/${m.id}/_index.json`)]));
const counts = { stages: ld.stages.length, modules: modules.length, chapters: modules.reduce((n, m) => n + indexes[m.id].sectionsMeta.length, 0) };
const ros = indexes.ros2;
const result = {
  run: RUN, startedAt: new Date().toISOString(), counts,
  isolation: 'Node http 127.0.0.1 随机端口；headless Edge；每例独立临时 context；不连接用户会话',
  limitations: ['外部字体及 highlight.js 使用空响应，KaTeX 模拟不可用；不验证 CDN 本身或数学排版与语法着色。所有同源业务脚本原样运行，任何 pageerror 均失败。'],
  tests: [], screenshots: [], infrastructureErrors: [],
};
let browser;
let server;
let origin;

function loadPlaywright() {
  const candidates = [process.env.PLAYWRIGHT_MODULE, 'playwright-core', 'playwright', path.join(os.homedir(), '.workbuddy', 'binaries', 'node', 'workspace', 'node_modules', 'playwright-core')].filter(Boolean);
  const errors = [];
  for (const candidate of candidates) {
    try { return require(candidate); } catch (error) { errors.push(`${candidate}: ${error.message}`); }
  }
  throw new Error(`未找到现有 Playwright；本脚本不会安装依赖。设置 PLAYWRIGHT_MODULE。\n${errors.join('\n')}`);
}
function edgePath() {
  const candidates = [process.env.EDGE_PATH,
    process.env['ProgramFiles(x86)'] && path.join(process.env['ProgramFiles(x86)'], 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    process.env.ProgramFiles && path.join(process.env.ProgramFiles, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
  ].filter(Boolean);
  const found = candidates.find(p => fs.existsSync(p));
  if (!found) throw new Error('未找到 Edge；请设置 EDGE_PATH。本脚本不会安装或启动 GUI 浏览器。');
  return found;
}
function fingerprints() {
  const files = ['index.html', '404.html', 'data/learning-path.json'];
  for (const m of modules) {
    files.push(`data/learn-split/${m.id}/_index.json`);
    for (const sec of indexes[m.id].sectionsMeta) files.push(`data/learn-split/${m.id}/${sec.id}.json`);
  }
  return Object.fromEntries(files.map(file => [file, crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, file))).digest('hex')]));
}
function startServer() {
  const types = { '.html': 'text/html; charset=utf-8', '.json': 'application/json; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };
  server = http.createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
      const relative = pathname === '/' || pathname === '/learn' || pathname.startsWith('/learn/') ? 'index.html' : pathname.replace(/^\/+/, '');
      const absolute = path.resolve(ROOT, relative);
      if (!absolute.startsWith(ROOT + path.sep)) { res.writeHead(403); res.end(); return; }
      try {
        const body = await fs.promises.readFile(absolute);
        res.writeHead(200, { 'Content-Type': types[path.extname(absolute)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
        res.end(body);
      } catch (error) {
        if (error.code !== 'ENOENT' && error.code !== 'EISDIR') throw error;
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('未找到文件');
      }
    } catch (error) { result.infrastructureErrors.push(error.stack); res.writeHead(500); res.end('测试服务器错误'); }
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => { origin = `http://127.0.0.1:${server.address().port}`; resolve(); });
  });
}
function deferred() {
  let resolve;
  const promise = new Promise(r => { resolve = r; });
  return { promise, resolve };
}
async function deadline(promise, message) {
  let timer;
  try { return await Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(message)), TIMEOUT); })]); }
  finally { clearTimeout(timer); }
}
async function holdRequest(page, pathname) {
  const seen = deferred(), release = deferred(), finished = deferred();
  let captured = false;
  await page.route(url => url.origin === origin && url.pathname === pathname, async route => {
    captured = true;
    seen.resolve();
    await release.promise;
    try {
      await route.fulfill({ status: 200, contentType: 'application/json; charset=utf-8', body: fs.readFileSync(path.join(ROOT, pathname.slice(1))) });
      finished.resolve();
    } catch (error) { finished.resolve(error.message); }
  });
  return {
    seen: () => deadline(seen.promise, `未捕获被延迟的请求 ${pathname}`),
    release: async () => { release.resolve(); if (captured) assert.equal(await deadline(finished.promise, `请求未放行 ${pathname}`), undefined); },
  };
}
async function settleFrames(page) {
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}
async function ready(page, mod = null, section = null) {
  await page.waitForFunction(({ mod, section }) => {
    if (!window.learnTest) return false;
    const s = window.learnTest.getState();
    return document.querySelector('#pg-learn.active') && s.module === mod && s.section === section
      && document.querySelector('#learnDetail[aria-busy="false"]')
      && (mod === null ? document.querySelector('.learn-home-stage') : section === null ? document.querySelector('#learnDetail .lm-title') : document.querySelector('#secMdBody'));
  }, { mod, section });
}
async function goto(page, route, mod = null, section = null) {
  await page.goto(origin + route, { waitUntil: 'domcontentloaded' });
  await ready(page, mod, section);
}
async function navigate(page, route, mod = null, section = null) {
  await page.evaluate(async route => { history.pushState({}, '', route); await applyRoute(route); }, route);
  await ready(page, mod, section);
}
async function canonical(page, route) {
  assert.equal(new URL(page.url()).pathname, route, '浏览器 URL 必须是规范英文路径');
  assert.equal(await page.locator('#canonical-link').evaluate(el => new URL(el.href).pathname), route, 'canonical 元信息必须与路由一致');
}
async function reader(page, mod, section) {
  await ready(page, mod, section);
  await canonical(page, `/learn/${mod}/${section + 1}`);
  assert.equal((await page.locator('#learnDetail h1').innerText()).trim(), indexes[mod].sectionsMeta[section].title);
  assert.ok((await page.locator('#secMdBody').innerText()).trim().length > 50, '必须显示真实正文');
  assert.ok((await page.locator('#learnDetail > .lm-card-m').innerText()).includes(`浏览约 ${Math.ceil(indexes[mod].sectionsMeta[section].readingMinutes)} 分钟`), '正文阅读分钟必须匹配章节 readingMinutes');
  const active = await page.locator('#learnSidebar .ls-sec.active').evaluateAll(els => els.map(el => ({ mod: el.dataset.mod, sec: el.dataset.sec })));
  assert.deepEqual(active, [{ mod, sec: String(section) }], '只允许正确章节高亮，大纲不得同时高亮');
  assert.equal(await page.locator('#learnSidebar .ls-sec.active').getAttribute('aria-current'), 'page');
}
async function snapshot(page) {
  return page.evaluate(() => ({ url: location.pathname + location.search, activePage: document.querySelector('.page.active')?.id,
    state: window.learnTest?.getState(), detail: document.getElementById('learnDetail')?.innerHTML,
    progress: localStorage.getItem('eai_learn_progress'), canonical: document.getElementById('canonical-link')?.getAttribute('href') }));
}
async function overflow(page) {
  await settleFrames(page);
  const info = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const offenders = [...document.querySelectorAll('#pg-learn *')].filter(el => {
      if (!el.getClientRects().length || el.closest('pre,table,.sec-toc-body')) return false;
      const rect = el.getBoundingClientRect();
      return rect.width && (rect.right > width + 1 || rect.left < -1);
    }).slice(0, 12).map(el => ({ tag: el.tagName, id: el.id, cls: el.className, right: el.getBoundingClientRect().right, left: el.getBoundingClientRect().left }));
    return { width, scrollWidth: document.documentElement.scrollWidth, bodyWidth: document.body.scrollWidth, offenders };
  });
  assert.ok(info.scrollWidth <= info.width + 1 && info.bodyWidth <= info.width + 1, `页面横向溢出：${JSON.stringify(info)}`);
  assert.deepEqual(info.offenders, [], '非横向滚动容器不应伸出视口');
  return info;
}
async function cleanText(page) {
  const text = await page.locator('#pg-learn').innerText();
  assert.doesNotMatch(text, /\bundefined\b|\[object Object\]/, '可见页面不应显示未解析值');
}
async function screenshot(page, name) {
  await settleFrames(page);
  const file = path.join(OUT, `${RUN}-${name}.png`);
  await page.screenshot({ path: file, fullPage: false, animations: 'disabled' });
  result.screenshots.push({ name, file: path.relative(ROOT, file).replaceAll('\\', '/'), url: page.url() });
  return file;
}
async function recordProgress(page) {
  return page.evaluate(key => JSON.parse(localStorage.getItem(key) || '{}'), LP_KEY);
}
async function runCase(id, name, fn, options = {}) {
  if (process.env.LEARN_TEST_FILTER && !new RegExp(process.env.LEARN_TEST_FILTER).test(`${id} ${name}`)) return;
  const entry = { id, name, status: 'running', evidence: {}, pageerrors: [], consoleErrors: [], requestFailures: [], localHttpErrors: [], external: [] };
  result.tests.push(entry);
  const start = Date.now();
  let context, page;
  try {
    context = await browser.newContext({ viewport: options.mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
      colorScheme: options.theme || 'light', reducedMotion: 'reduce', serviceWorkers: 'block', locale: 'zh-CN', isMobile: !!options.mobile, hasTouch: !!options.mobile });
    await context.addInitScript(({ theme, progress }) => {
      localStorage.setItem('eai_theme', theme);
      if (progress && !sessionStorage.getItem('__learnUITestSeeded')) {
        localStorage.setItem('eai_learn_progress', JSON.stringify(progress));
        sessionStorage.setItem('__learnUITestSeeded', '1');
      }
    }, { theme: options.theme || 'light', progress: options.progress });
    await context.route('**/*', async route => {
      const request = route.request(), url = new URL(request.url());
      if (url.origin === origin) return route.continue();
      const optional = ['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)
        || (url.hostname === 'cdnjs.cloudflare.com' && /^\/ajax\/libs\/(highlight\.js|KaTeX)\//.test(url.pathname));
      entry.external.push({ url: request.url(), type: request.resourceType(), policy: optional ? '可选 CDN 隔离' : '禁止外部请求' });
      if (optional) return route.fulfill({ status: 200, contentType: request.resourceType() === 'script' ? 'text/javascript' : 'text/css', body: '' });
      return route.abort('blockedbyclient');
    });
    page = await context.newPage();
    page.setDefaultTimeout(TIMEOUT);
    page.setDefaultNavigationTimeout(20000);
    page.on('pageerror', error => entry.pageerrors.push({ message: error.message, stack: error.stack }));
    page.on('console', msg => { if (msg.type() === 'error') entry.consoleErrors.push({ text: msg.text(), location: msg.location() }); });
    page.on('requestfailed', req => entry.requestFailures.push({ url: req.url(), error: req.failure()?.errorText }));
    page.on('response', response => { if (response.url().startsWith(origin + '/') && response.status() >= 400) entry.localHttpErrors.push({ url: response.url(), status: response.status() }); });
    await fn(page, entry.evidence);
    await settleFrames(page);
    assert.deepEqual(entry.pageerrors, [], '所有业务 pageerror 都必须失败，不得按 CDN 错误吞掉');
    assert.deepEqual(entry.external.filter(item => item.type === 'script' && item.policy === '禁止外部请求'), [], '未声明的外部业务脚本不可静默 mock');
    const unexpectedHttp = entry.localHttpErrors.filter(item => {
      const p = new URL(item.url).pathname;
      return !(id === 'data' && p === '/data/__learn_ui_missing__.json') && !(id === 'route-404-bridge' && p.startsWith('/learn/'));
    });
    assert.deepEqual(unexpectedHttp, [], '非预期同源 HTTP 错误不得当作 CDN 问题忽略');
    const unexpectedLearnFailures = entry.requestFailures.filter(item => {
      const u = new URL(item.url);
      return u.origin === origin && /^\/data\/(learning-path\.json|learn-split\/)/.test(u.pathname)
        && !(id === 'retry-section' && u.pathname === '/data/learn-split/ros2/sec-02.json');
    });
    assert.deepEqual(unexpectedLearnFailures, [], '非预期学习数据失败不得静默通过');
    entry.status = 'passed';
  } catch (error) {
    entry.status = 'failed';
    entry.error = { message: error.message, stack: error.stack, actual: error.actual, expected: error.expected };
    if (page && !page.isClosed()) {
      try {
        entry.failure = await page.evaluate(() => ({ url: location.href, state: window.learnTest?.getState(), title: document.title,
          detail: document.getElementById('learnDetail')?.innerText.slice(0, 6000), progress: localStorage.getItem('eai_learn_progress') }));
        entry.failureScreenshot = path.relative(ROOT, await screenshot(page, `FAIL-${id}`)).replaceAll('\\', '/');
      } catch (captureError) { entry.captureError = captureError.message; }
    }
  } finally {
    if (context) await context.close();
    if (entry.pageerrors.length && entry.status === 'passed') { entry.status = 'failed'; entry.error = { message: '关闭 context 前捕获未处理 pageerror' }; }
    entry.durationMs = Date.now() - start;
    console.log(`[${entry.status === 'passed' ? '通过' : '失败'}] ${id} ${name}${entry.error ? `：${entry.error.message.split('\n')[0]}` : ''}`);
  }
}

async function tests() {
  await runCase('data', '静态服务器、动态计数与全部 readingMinutes 数据契约', async (page, evidence) => {
    await goto(page, '/learn');
    const responses = await page.evaluate(async () => {
      const urls = ['/data/learn-split/ros2/_index.json', '/data/__learn_ui_missing__.json', '/learn/ros2/1'];
      return Promise.all(urls.map(async url => { const r = await fetch(url); return { url, status: r.status, type: r.headers.get('content-type'), text: await r.text() }; }));
    });
    assert.equal(JSON.parse(responses[0].text).id, 'ros2');
    assert.equal(responses[1].status, 404, '/data 缺失文件必须真正返回 404，不能 fallback HTML');
    assert.match(responses[2].type, /text\/html/);
    assert.match(responses[2].text, /id="pg-learn"/);
    assert.deepEqual(counts, { stages: 7, modules: 32, chapters: 541 });
    for (const m of modules) {
      const ix = indexes[m.id];
      assert.equal(ix.sectionsMeta.length, m.sectionCount, `${m.id} 声明与真实章节数一致`);
      assert.ok(Number.isFinite(m.readingMinutes) && m.readingMinutes > 0, `${m.id} 缺少模块 readingMinutes`);
      for (const sec of ix.sectionsMeta) assert.ok(Number.isFinite(sec.readingMinutes) && sec.readingMinutes > 0, `${m.id}/${sec.id} 缺少 readingMinutes`);
    }
    evidence.counts = counts;
    evidence.responses = responses.map(({ text, ...rest }) => rest);
    evidence.moduleCounts = modules.map(m => ({ id: m.id, sections: indexes[m.id].sectionsMeta.length }));
  });

  for (const variant of [{ name: 'desktop-light', theme: 'light' }, { name: 'desktop-dark', theme: 'dark' }, { name: 'mobile-light', theme: 'light', mobile: true }]) {
    await runCase(`layout-${variant.name}`, '首页、VLA 大纲和 ROS2 正文响应式与主题', async (page, evidence) => {
      await goto(page, '/learn');
      assert.equal(await page.locator('html').getAttribute('data-theme'), variant.theme);
      assert.equal(await page.locator('#learnSummary').innerText(), `${counts.stages} 个阶段 · ${counts.modules} 个模块 · 共 ${counts.chapters} 章`);
      assert.equal(await page.locator('.learn-home-stage').count(), counts.stages);
      assert.equal(await page.locator('.learn-home-card').count(), counts.modules);
      await cleanText(page);
      evidence.home = await overflow(page);
      if (variant.name === 'desktop-light') await screenshot(page, 'learn-home-desktop-light');
      await navigate(page, '/learn/vla-models', 'vla-models');
      await cleanText(page);
      evidence.vla = await overflow(page);
      if (variant.name === 'desktop-dark') await screenshot(page, 'vla-overview-desktop-dark');
      await navigate(page, '/learn/ros2/1', 'ros2', 0);
      await reader(page, 'ros2', 0);
      evidence.reader = await overflow(page);
      if (variant.mobile) {
        assert.equal(await page.locator('#learnSidebar').isVisible(), false, '移动端导航默认收起');
        assert.equal(await page.locator('#learnNavToggle').getAttribute('aria-expanded'), 'false');
        await page.locator('#learnDetail h1').scrollIntoViewIfNeeded();
        const hit = await page.locator('#learnDetail h1').evaluate(el => {
          const r = el.getBoundingClientRect(), target = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
          return target === el || el.contains(target);
        });
        assert.equal(hit, true, '收起课程导航后正文标题不能被覆盖');
        await page.locator('#learnNavToggle').click();
        assert.equal(await page.locator('#learnSidebar').isVisible(), true);
        assert.equal(await page.locator('#learnNavToggle').getAttribute('aria-expanded'), 'true');
        evidence.mobileOpen = await overflow(page);
        await page.locator('#learnNavToggle').click();
        assert.equal(await page.locator('#learnSidebar').isVisible(), false);
        await page.locator('#secTocSlot summary').click();
        await page.locator('#learnDetail h1').scrollIntoViewIfNeeded();
        await screenshot(page, 'ros2-reader-mobile-light');
        // 手机端顶栏主题按钮由现有 CSS 隐藏；验证主题布局，不假设按钮可见。
        evidence.mobileThemeControlVisible = await page.locator('#themeToggle').isVisible();
        await page.evaluate(() => toggleTheme());
        await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
        evidence.mobileDark = await overflow(page);
      }
    }, variant);
  }

  await runCase('mobile-text-obstruction', '额外视觉回归：收起目录后悬浮按钮不得覆盖正文字形', async (page, evidence) => {
    await goto(page, '/learn/ros2/1', 'ros2', 0);
    await page.locator('#secTocSlot summary').click();
    await page.locator('#learnDetail h1').scrollIntoViewIfNeeded();
    await settleFrames(page);
    evidence.obstruction = await page.evaluate(() => {
      const fab = document.getElementById('inboxFab');
      const rect = fab.getBoundingClientRect();
      const walker = document.createTreeWalker(document.getElementById('secMdBody'), NodeFilter.SHOW_TEXT);
      const obscured = [];
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (!node.parentElement.getClientRects().length) continue;
        for (let i = 0; i < node.length; i++) {
          if (!node.textContent[i].trim()) continue;
          const range = document.createRange(); range.setStart(node, i); range.setEnd(node, i + 1);
          const r = range.getBoundingClientRect();
          const x = r.left + r.width / 2, y = r.top + r.height / 2;
          if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) continue;
          const hit = document.elementFromPoint(x, y);
          if (hit === fab || fab.contains(hit)) obscured.push({ character: node.textContent[i], x, y, surrounding: node.textContent.slice(Math.max(0, i - 12), i + 13) });
        }
      }
      return { scrollY, sidebarVisible: !!document.getElementById('learnSidebar').getClientRects().length,
        button: { id: fab.id, left: rect.left, top: rect.top, width: rect.width, height: rect.height }, obscured };
    });
    assert.equal(evidence.obstruction.sidebarVisible, false);
    assert.deepEqual(evidence.obstruction.obscured, [], '悬浮投稿按钮覆盖正文文字；保留失败，不修改业务文件');
  }, { mobile: true });

  await runCase('reader-code-integrity', '额外正文回归：环境准备代码块不得混入渲染器 HTML 标签', async (page, evidence) => {
    const source = readJSON('data/learn-split/ros2/sec-01.json').content;
    assert.doesNotMatch(source, /<\/?blockquote\b/, '先确认原始课程并未把这些标签作为代码示例');
    await goto(page, '/learn/ros2/1', 'ros2', 0);
    const block = page.locator('#secMdBody pre').filter({ hasText: '# 需要安装 ROS2' });
    await block.scrollIntoViewIfNeeded();
    evidence.code = await block.locator('code').innerText();
    const sourceStart = source.indexOf('> ```bash');
    evidence.sourceSnippet = source.slice(sourceStart, source.indexOf('```python', sourceStart));
    evidence.sourceFile = 'data/learn-split/ros2/sec-01.json:3';
    assert.doesNotMatch(evidence.code, /<\/?blockquote\b/, '环境准备代码块显示了原始数据中不存在的 blockquote 标签');
  });

  await runCase('route-direct', '直链、侧栏反复切换与浏览器前进后退', async (page, evidence) => {
    await goto(page, '/learn/ros2/1', 'ros2', 0);
    await reader(page, 'ros2', 0);
    for (const n of [1, 2, 0, 2]) {
      await page.locator(`#learnSidebar .ls-sec[data-mod="ros2"][data-sec="${n}"]`).click();
      await reader(page, 'ros2', n);
    }
    await page.goBack(); await reader(page, 'ros2', 0);
    await page.goForward(); await reader(page, 'ros2', 2);
    await page.locator('#learnSidebar .ls-sec[data-sec="overview"]').click();
    await ready(page, 'ros2'); await canonical(page, '/learn/ros2');
    assert.equal(await page.locator('#learnSidebar .ls-sec.active').getAttribute('data-sec'), 'overview');
    await page.goBack(); await reader(page, 'ros2', 2);
    await page.reload({ waitUntil: 'domcontentloaded' }); await reader(page, 'ros2', 2);
    evidence.final = { url: page.url(), title: await page.locator('#learnDetail h1').innerText() };
  });
  await runCase('route-alias', '旧中文 alias 和 hash 链接保留章号', async (page, evidence) => {
    const aliases = ['ros2-机器人操作系统', modules.find(m => m.id === 'ros2').name];
    evidence.routes = [];
    for (const alias of aliases) {
      await goto(page, `/learn/${encodeURIComponent(alias)}/3?source=legacy`, 'ros2', 2);
      await reader(page, 'ros2', 2);
      assert.equal(new URL(page.url()).search, '?source=legacy');
      assert.equal(await page.evaluate(alias => window.learnTest.canonicalLearnId(alias), alias), 'ros2');
      evidence.routes.push(page.url());
    }
    await goto(page, `/#/learn/${encodeURIComponent(aliases[0])}/3`, 'ros2', 2);
    await reader(page, 'ros2', 2);
    assert.equal(new URL(page.url()).hash, '');
  });
  for (const bad of ['0', '999', 'bad']) {
    await runCase(`route-invalid-${bad}`, '非法章节显式报错且能返回', async (page, evidence) => {
      await page.goto(`${origin}/learn/ros2/${bad}`, { waitUntil: 'domcontentloaded' });
      await page.locator('#learnDetail .learn-error').waitFor();
      assert.match(await page.locator('#learnDetail [role="alert"]').innerText(), /未找到指定章节/);
      assert.equal(new URL(page.url()).pathname, `/learn/ros2/${bad}`);
      assert.equal(await page.locator('#secMdBody').count(), 0);
      assert.equal(await page.locator('#learnSidebar .ls-sec.active').count(), 0);
      evidence.invalidURL = page.url();
      await page.locator('#learnDetail .learn-error a[href="/learn/ros2"]').click();
      await ready(page, 'ros2');
      await page.locator('#pg-learn .learn-tools a[href="/learn"]').click();
      await ready(page); await canonical(page, '/learn');
    });
  }
  await runCase('route-404-bridge', '实际 404.html 的 sessionStorage 深链接桥接', async (page, evidence) => {
    let served = 0;
    const bridgePath = `/learn/${encodeURIComponent('ros2-机器人操作系统')}/3`;
    await page.route(url => url.origin === origin && url.pathname === bridgePath, async route => {
      served++;
      await route.fulfill({ status: 404, contentType: 'text/html; charset=utf-8', body: fs.readFileSync(path.join(ROOT, '404.html')) });
    });
    await page.goto(origin + bridgePath + '?bridge=1', { waitUntil: 'domcontentloaded' });
    await ready(page, 'ros2', 2); await reader(page, 'ros2', 2);
    assert.equal(served, 1, '真实 404 桥接不能循环');
    assert.equal(new URL(page.url()).search, '?bridge=1');
    assert.equal(await page.evaluate(() => sessionStorage.getItem('_spaPath')), null);
    evidence.url = page.url(); evidence.served404 = served;
  });

  const legacy = {
    'ros2-机器人操作系统': { sections: [0, 2, 2, 99], visitedSections: [0, 1], visits: 5, firstVisit: 100, lastVisit: 200, lastSection: 1, totalSections: 100 },
    ros2: { sections: [1, 2], visitedSections: [2], visits: 8, firstVisit: 150, lastVisit: 300, lastSection: 2, totalSections: 100 },
    'linear-algebra': { sections: [4], visitedSections: [4], visits: 1, firstVisit: 100, lastVisit: 100, lastSection: 4 },
  };
  await runCase('progress-merge', '中英文旧记录合并去重、不清空与阅读不自动完成', async (page, evidence) => {
    await goto(page, '/learn');
    let progress = await recordProgress(page);
    assert.deepEqual(progress.ros2.sections, [0, 1, 2, 99]);
    assert.deepEqual(progress.ros2.visitedSections, [0, 1, 2]);
    assert.equal(progress.ros2.visits, 8);
    assert.equal(progress.ros2.firstVisit, 100);
    assert.equal(progress.ros2.lastSection, 2);
    assert.equal(progress['ros2-机器人操作系统'], undefined);
    assert.deepEqual(progress['linear-algebra'].sections, [4]);
    const status = await page.evaluate(() => getModuleStatus('ros2', 100));
    assert.equal(status.total, ros.sectionsMeta.length);
    assert.equal(status.completed, 3);
    assert.equal(status.pct, Math.floor(3 / ros.sectionsMeta.length * 100));
    await navigate(page, '/learn/ros2/4', 'ros2', 3);
    progress = await recordProgress(page);
    assert.deepEqual(progress.ros2.sections, [0, 1, 2, 99], '浏览新章不得写入完成记录或清空旧异常编号');
    assert.deepEqual(progress.ros2.visitedSections, [0, 1, 2, 3]);
    assert.equal(await page.locator('#secCompleteButton').getAttribute('aria-pressed'), 'false');
    await page.locator('#secCompleteButton').click();
    assert.deepEqual((await recordProgress(page)).ros2.sections, [0, 1, 2, 3, 99]);
    assert.equal(await page.locator('#secCompleteButton').getAttribute('aria-pressed'), 'true');
    await page.locator('#secCompleteButton').click();
    assert.deepEqual((await recordProgress(page)).ros2.sections, [0, 1, 2, 99]);
    await page.reload({ waitUntil: 'domcontentloaded' }); await ready(page, 'ros2', 3);
    assert.deepEqual((await recordProgress(page)).ros2.sections, [0, 1, 2, 99], '取消完成后重载不得恢复历史别名完成记录');
    assert.equal(await page.locator('#secCompleteButton').getAttribute('aria-pressed'), 'false');
    evidence.status = status; evidence.progress = await recordProgress(page);
  }, { progress: legacy });
  await runCase('progress-clamp', '完成数夹紧真实分母16，取消后状态不复活', async (page, evidence) => {
    await goto(page, '/learn/ros2/1', 'ros2', 0);
    const before = await page.evaluate(() => getModuleStatus('ros2', 1000));
    assert.equal(before.total, 16); assert.equal(before.completed, 16); assert.equal(before.pct, 100); assert.equal(before.status, 'done');
    await page.locator('#secCompleteButton').click();
    const cancelled = await page.evaluate(() => getModuleStatus('ros2', 1000));
    assert.equal(cancelled.completed, 15); assert.equal(cancelled.total, 16); assert.equal(cancelled.pct, 93); assert.equal(cancelled.status, 'learning');
    await navigate(page, '/learn');
    await navigate(page, '/learn/ros2/1', 'ros2', 0);
    await page.reload({ waitUntil: 'domcontentloaded' }); await ready(page, 'ros2', 0);
    assert.equal(await page.locator('#secCompleteButton').getAttribute('aria-pressed'), 'false');
    const after = await page.evaluate(() => getModuleStatus('ros2'));
    assert.equal(after.completed, 15); assert.equal(after.pct, 93);
    evidence.before = before; evidence.cancelled = cancelled; evidence.afterReload = after;
  }, { progress: { ros2: { sections: [...Array(40).keys(), 1, 1], visits: 1, totalSections: 1000 } } });
  await runCase('progress-resume', '阅读第3章后首页和模块大纲均续读第3章', async (page, evidence) => {
    await goto(page, '/learn/ros2/3', 'ros2', 2);
    assert.deepEqual((await recordProgress(page)).ros2.sections, []);
    await navigate(page, '/learn/vla-models', 'vla-models');
    await navigate(page, '/learn');
    assert.equal(await page.locator('.learn-resume a').getAttribute('href'), '/learn/ros2/3');
    assert.match(await page.locator('.learn-resume').innerText(), /第 3 章/);
    await navigate(page, '/learn/ros2', 'ros2');
    assert.equal(await page.locator('#learnDetail .lm-actions a.lm-btn').getAttribute('href'), '/learn/ros2/3');
    assert.match(await page.locator('#learnDetail .lm-actions a.lm-btn').innerText(), /第 3 章/);
    assert.equal(await page.evaluate(() => window.learnTest.resumeLearnSection('ros2', null, 16)), 2);
    await page.locator('#learnDetail .lm-actions a.lm-btn').click(); await reader(page, 'ros2', 2);
    evidence.progress = await recordProgress(page);
  });

  await runCase('outline-links', '学习方法及前置要求 Markdown 链接可点击 SPA 导航', async (page, evidence) => {
    await goto(page, '/learn/vla-models', 'vla-models');
    const scopes = [
      { selector: '#learnDetail .lm-block', title: '学习方法', data: indexes['vla-models'].studyGuide },
      { selector: '#learnDetail .lm-prereq', data: indexes['vla-models'].prerequisites },
    ];
    evidence.links = [];
    for (const s of scopes) {
      let scope = page.locator(s.selector);
      if (s.title) scope = scope.filter({ has: page.locator('.lm-block-h', { hasText: s.title }) });
      const expected = [...s.data.join('\n').matchAll(/\[([^\]]+)\]\((\/learn\/[^)]+)\)/g)].map(m => ({ label: m[1], href: m[2] }));
      assert.ok(expected.length > 0);
      const actual = await scope.locator('a[data-spa="1"]').evaluateAll(els => els.map(el => ({ label: el.textContent, href: el.getAttribute('href') })));
      assert.deepEqual(actual, expected);
      assert.doesNotMatch(await scope.innerText(), /\[[^\]]+\]\(\/learn\//);
      evidence.links.push(...actual);
    }
    await page.evaluate(() => { window.__learnUITestDocument = 'same-document'; });
    await page.locator('.lm-prereq a[data-spa="1"]').first().click();
    await reader(page, 'deep-learning', 0);
    assert.equal(await page.evaluate(() => window.__learnUITestDocument), 'same-document');
    await page.goBack(); await ready(page, 'vla-models');
    await page.locator('.lm-block').filter({ has: page.locator('.lm-block-h', { hasText: '学习方法' }) }).locator('a[data-spa="1"]').first().click();
    await reader(page, 'vla-models', 0);
  });
  await runCase('outline-filters', '全部、主线、前沿筛选可逆且原始章号不变', async (page, evidence) => {
    await goto(page, '/learn/vla-models', 'vla-models');
    const secs = indexes['vla-models'].sectionsMeta;
    const tier = sec => sec.tier == null ? 1 : Math.min(3, Math.max(0, Number(sec.tier) || 0));
    const cards = () => page.locator('#learnDetail .lm-card').evaluateAll(els => els.map(el => ({ href: el.getAttribute('href'), number: el.querySelector('.lm-card-idx').textContent })));
    const all = await cards();
    const before = await recordProgress(page);
    evidence.filters = [];
    for (const filter of ['main', 'frontier', 'all', 'frontier', 'all']) {
      await page.locator(`button[onclick="filterLearnOutline('${filter}')"]`).click();
      assert.equal(await page.locator(`button[onclick="filterLearnOutline('${filter}')"]`).getAttribute('aria-pressed'), 'true');
      const actual = await cards();
      const expected = secs.map((s, i) => ({ s, i })).filter(({ s }) => filter === 'all' || (filter === 'main' ? tier(s) < 3 : tier(s) === 3))
        .sort((a, b) => tier(a.s) - tier(b.s) || a.i - b.i).map(({ i }) => ({ href: `/learn/vla-models/${i + 1}`, number: String(i + 1).padStart(2, '0') }));
      assert.deepEqual(actual, expected);
      if (filter === 'all') assert.deepEqual(actual, all);
      evidence.filters.push({ filter, chapters: actual.map(x => Number(x.number)) });
    }
    assert.deepEqual(await recordProgress(page), before, '筛选不能改变完成进度');
  });
  await runCase('outline-all-metadata', '全部32模块与541章阅读分钟、难度顺序、前后模块关系', async (page, evidence) => {
    await goto(page, '/learn');
    const apiOrder = await page.evaluate(() => window.learnTest.getAllModuleIds().map(m => m.id));
    assert.deepEqual(apiOrder, modules.map(m => m.id));
    evidence.modules = [];
    const failures = [];
    for (let index = 0; index < modules.length; index++) {
      const m = modules[index], ix = indexes[m.id];
      try {
        await navigate(page, `/learn/${m.id}`, m.id);
        const data = await page.evaluate(id => ({ chips: [...document.querySelectorAll('#learnDetail .lm-meta .lm-chip')].map(el => el.textContent),
          cards: [...document.querySelectorAll('#learnDetail .lm-card')].map(el => ({ href: el.getAttribute('href'), text: el.textContent })),
          next: window.learnTest.getNextModule(id)?.id || null, prev: window.learnTest.getPrevModule(id)?.id || null,
          total: window.learnTest.learnTotal(id), minutes: window.learnTest.readingMinutes({ readingMinutes: 3.2, estimatedMinutes: 900 }) }), m.id);
        assert.equal(data.next, modules[index + 1]?.id || null); assert.equal(data.prev, modules[index - 1]?.id || null);
        assert.equal(data.total, ix.sectionsMeta.length); assert.equal(data.cards.length, ix.sectionsMeta.length);
        assert.equal(data.minutes, 4, 'readingMinutes 优先于旧估算并向上取整');
        const totalMin = Math.ceil(ix.readingMinutes || m.readingMinutes || ix.sectionsMeta.reduce((n, s) => n + s.readingMinutes, 0));
        assert.ok(data.chips.includes(`正文浏览估算：约 ${totalMin} 分钟`));
        const expectedDiff = ['入门', '中级', '高级'].map(d => ({ d, n: ix.sectionsMeta.filter(s => (s.difficulty || '中级') === d).length })).filter(x => x.n).map(x => `${x.d} ${x.n}`).join(' / ');
        assert.ok(data.chips.includes(expectedDiff), '难度统计必须固定入门、中级、高级顺序');
        for (let i = 0; i < ix.sectionsMeta.length; i++) {
          const sec = ix.sectionsMeta[i], card = data.cards.find(c => c.href === `/learn/${m.id}/${i + 1}`);
          assert.ok(card, `${m.id}/${i + 1} 卡片缺失`);
          assert.ok(card.text.includes(`浏览约 ${Math.ceil(sec.readingMinutes)} 分钟`), `${m.id}/${i + 1} 阅读分钟不匹配`);
        }
        await cleanText(page);
        evidence.modules.push({ id: m.id, count: data.cards.length, minutes: totalMin, difficulty: expectedDiff, next: data.next, prev: data.prev });
      } catch (error) { failures.push({ id: m.id, message: error.message }); }
    }
    evidence.failures = failures;
    assert.deepEqual(failures, [], '全部模块的 UI 元数据必须匹配数据');
  });
  await runCase('next-module', 'ROS2 最后一章推荐真实下一模块', async (page, evidence) => {
    const next = modules[modules.findIndex(m => m.id === 'ros2') + 1];
    await goto(page, `/learn/ros2/${ros.sectionsMeta.length}`, 'ros2', ros.sectionsMeta.length - 1);
    const link = page.locator('#learnDetail .sec-nav a.primary');
    assert.equal(await link.getAttribute('href'), `/learn/${next.id}`);
    assert.ok((await link.innerText()).includes(next.name));
    evidence.next = { id: next.id, label: await link.innerText() };
    await link.click(); await ready(page, next.id); await canonical(page, `/learn/${next.id}`);
  });

  async function assertToc(page) {
    const actual = await page.evaluate(() => {
      const headings = [...document.querySelectorAll('#secMdBody h2,#secMdBody h3,#secMdBody h4,#secMdBody h5,#secMdBody h6')].filter(el => el.textContent.trim())
        .map(el => ({ id: el.id, level: Number(el.tagName.slice(1)), title: el.textContent.trim() }));
      const toc = [...document.querySelectorAll('#secTocSlot .st-item')].map(el => ({ id: el.dataset.target, title: el.textContent.trim(),
        parent: el.parentElement.parentElement.closest('li[data-toc-item]')?.querySelector(':scope > .st-item')?.dataset.target || null }));
      return { headings, toc };
    });
    assert.ok(actual.headings.length > 0);
    const parents = actual.headings.map((heading, i) => {
      for (let j = i - 1; j >= 0; j--) if (actual.headings[j].level < heading.level) return actual.headings[j].id;
      return null;
    });
    assert.deepEqual(actual.toc, actual.headings.map((h, i) => ({ id: h.id, title: h.title, parent: parents[i] })));
    return actual;
  }
  await runCase('toc-real', '真实正文目录层次、过滤、跳转与返回目录', async (page, evidence) => {
    await goto(page, '/learn/ros2/1', 'ros2', 0);
    evidence.toc = await assertToc(page);
    const selected = evidence.toc.headings.find(h => /QoS/.test(h.title));
    assert.ok(selected);
    await page.locator('#secTocFilter').fill('QoS');
    const visible = await page.locator('#secTocSlot .st-item:visible').evaluateAll(els => els.map(el => el.dataset.target));
    const expected = new Set(evidence.toc.toc.filter(h => /qos/i.test(h.title)).map(h => h.id));
    for (const id of [...expected]) {
      let parent = evidence.toc.toc.find(h => h.id === id).parent;
      while (parent) { expected.add(parent); parent = evidence.toc.toc.find(h => h.id === parent).parent; }
    }
    assert.deepEqual([...visible].sort(), [...expected].sort());
    await page.locator('#secTocFilter').fill('__没有匹配的小节__');
    assert.equal(await page.locator('#secTocEmpty').isVisible(), true);
    assert.equal(await page.locator('#secTocSlot .st-item:visible').count(), 0);
    await page.locator('#secTocFilter').fill('');
    assert.equal(await page.locator('#secTocSlot .st-item:visible').count(), evidence.toc.headings.length);
    const beforeURL = page.url();
    await page.locator(`#secTocSlot .st-item[data-target="${selected.id}"]`).click();
    await page.waitForFunction(id => { const r = document.getElementById(id).getBoundingClientRect(); return r.top >= 60 && r.top < innerHeight / 2; }, selected.id);
    assert.equal(await page.locator(`#secTocSlot .st-item[data-target="${selected.id}"]`).getAttribute('aria-current'), 'location');
    assert.equal(page.url(), beforeURL, '小节跳转不得污染章 URL');
    await page.locator('.learn-reader-tools button[onclick="returnToSecToc()"]').click();
    await page.waitForFunction(() => { const r = document.getElementById('secTocSlot').getBoundingClientRect(); return document.activeElement?.id === 'secTocFilter' && r.top >= 60 && r.top < innerHeight / 2; });
    assert.equal(await page.locator('#secTocSlot details').getAttribute('open'), '');
  });
  await runCase('toc-h2-h6', 'h2-h6 全层级及跳级目录契约', async (page, evidence) => {
    const fixture = '# 一级样本\n\n正文一\n\n## 二级样本\n\n正文二\n\n### 三级样本\n\n正文三\n\n#### 四级样本\n\n正文四\n\n##### 五级样本\n\n正文五\n\n## 同级返回\n\n正文六\n\n##### 跳级样本\n\n正文七';
    await page.route(url => url.origin === origin && url.pathname === '/data/learn-split/ros2/sec-01.json', route => route.fulfill({ json: { ...readJSON('data/learn-split/ros2/sec-01.json'), content: fixture } }));
    await goto(page, '/learn/ros2/1', 'ros2', 0);
    evidence.fixture = '仅拦截浏览器响应，不修改磁盘数据；真实正文另有 toc-real 测试';
    evidence.toc = await assertToc(page);
    assert.deepEqual(evidence.toc.headings.map(h => h.level), [2, 3, 4, 5, 6, 3, 6]);
    const pure = await page.evaluate(() => window.learnTest.learnHeadingTree([{ id: 'a', level: 2 }, { id: 'b', level: 6 }, { id: 'c', level: 3 }, { id: 'd', level: 2 }]));
    assert.deepEqual(pure.map(n => n.id), ['a', 'd']);
    assert.deepEqual(pure[0].children.map(n => n.id), ['b', 'c']);
  });

  const keyword = '为什么需要';
  const query = `${keyword} ROS2`;
  await runCase('search', '小节关键词、AND、Enter/Escape 与恶意查询纯文本', async (page, evidence) => {
    assert.ok(ros.sectionsMeta[0].headings.some(h => h.includes(keyword)));
    assert.equal(ros.sectionsMeta[0].title.includes(keyword), false, '关键词必须来自小节而非章名');
    await goto(page, '/learn');
    await page.locator('#learnSearch').fill(query);
    await page.waitForFunction(() => window.learnTest.getState().searchLoading === false && document.querySelector('#learnSearchResults .learn-search-hit'), null, { timeout: 25000 });
    const hits = await page.locator('#learnSearchResults .learn-search-hit').evaluateAll(els => els.map(el => ({ href: el.getAttribute('href'), text: el.textContent })));
    assert.ok(hits.some(hit => hit.href === '/learn/ros2/1' && hit.text.includes(keyword)));
    for (const hit of hits) {
      const [, , mod, chapter] = hit.href.split('/');
      const row = chapter ? indexes[mod].sectionsMeta[Number(chapter) - 1] : modules.find(m => m.id === mod);
      const hay = [row.title, row.name, indexes[mod].name, ...(row.headings || []), row.summary, row.description, JSON.stringify(row.topics || [])].join(' ').toLowerCase();
      assert.ok(query.toLowerCase().split(/\s+/).every(word => hay.includes(word)), `AND 命中不合法：${hit.href}`);
    }
    evidence.hits = hits;
    await page.locator('#learnSearch').fill(`${query} __不可能同时命中__`);
    await page.waitForFunction(() => document.getElementById('learnSearchResults').textContent.includes('未找到'));
    assert.equal(await page.locator('.learn-search-hit').count(), 0);
    await page.locator('#learnSearch').fill(query);
    const first = await page.locator('.learn-search-hit').first().getAttribute('href');
    await page.locator('#learnSearch').press('Enter');
    const route = first.split('/'); await reader(page, route[2], Number(route[3]) - 1);
    await page.locator('#learnSearch').fill(query);
    await page.locator('#learnSearch').press('Escape');
    assert.equal(await page.locator('#learnSearch').inputValue(), '');
    assert.equal(await page.locator('#learnSearchResults').isVisible(), false);
    assert.equal(await page.locator('#learnSearch').evaluate(el => el === document.activeElement), true);
    const evil = '<img src=x onerror="window.__learnUIXSS=1"><script>window.__learnUIXSS=2</script>';
    await page.locator('#learnSearch').fill(evil);
    assert.ok((await page.locator('#learnSearchResults').innerText()).includes(evil));
    assert.equal(await page.locator('#learnSearchResults img, #learnSearchResults script, #learnSearchResults [onerror]').count(), 0);
    assert.equal(await page.evaluate(() => window.__learnUIXSS), undefined);
    const ranked = await page.evaluate(() => window.learnTest.rankLearnSearch([
      { title: '普通章节', headings: ['ROS2 QoS'], modId: 'ros2' }, { title: 'ROS2 QoS', headings: [], modId: 'ros2' }, { title: 'ROS2', headings: ['DDS'], modId: 'ros2' },
    ], 'ROS2 QoS').map(row => row.title));
    assert.deepEqual(ranked, ['ROS2 QoS', '普通章节']);
    evidence.maliciousQuery = evil;
  });
  await runCase('search-before-LD', '学习路径尚未 ready 时搜索聚焦输入可恢复', async (page, evidence) => {
    const gate = await holdRequest(page, '/data/learning-path.json');
    try {
      await page.goto(origin + '/learn', { waitUntil: 'domcontentloaded' });
      await gate.seen();
      await page.waitForFunction(() => !!window.learnTest);
      assert.deepEqual(await page.evaluate(() => window.learnTest.getAllModuleIds()), []);
      await page.locator('#learnSearch').focus();
      await page.locator('#learnSearch').fill(query);
      await page.waitForFunction(() => window.learnTest.getState().searchLoading);
      assert.match(await page.locator('#learnSearchResults').innerText(), /正在加载/);
      await gate.release();
      await ready(page);
      await page.waitForFunction(() => !window.learnTest.getState().searchLoading && !!document.querySelector('#learnSearchResults a[href="/learn/ros2/1"]'), null, { timeout: 25000 });
      assert.equal(await page.locator('#learnSearch').inputValue(), query);
      assert.ok(await page.locator('#learnSearchResults a[href="/learn/ros2/1"]').isVisible());
      evidence.recoveredHits = await page.locator('.learn-search-hit').count();
    } finally { await gate.release(); }
  });

  for (const kind of ['section', 'index']) {
    for (const destination of ['chapter', 'learn-home', 'site-home', 'nonlearn']) {
      await runCase(`race-${kind}-${destination}`, '延迟旧响应不得覆写新路由、DOM 或学习进度', async (page, evidence) => {
        await goto(page, '/learn/ros2/1', 'ros2', 0);
        const pathname = kind === 'section' ? '/data/learn-split/ros2/sec-02.json' : '/data/learn-split/vla-models/_index.json';
        const gate = await holdRequest(page, pathname);
        try {
          await page.evaluate(kind => {
            window.__learnUISettled = false;
            window.__learnUIPending = (kind === 'section' ? switchToSection('ros2', 1) : openLearnModule('vla-models'))
              .then(() => { window.__learnUISettled = true; });
          }, kind);
          await gate.seen();
          assert.equal(await page.locator('#learnDetail').getAttribute('aria-busy'), 'true');
          if (destination === 'chapter') await navigate(page, '/learn/ros2/3', 'ros2', 2);
          else if (destination === 'learn-home') await navigate(page, '/learn');
          else {
            const target = destination === 'site-home' ? 'home' : 'papers';
            await page.evaluate(target => go(target), target);
            await page.locator(`#pg-${target}.active`).waitFor();
            assert.equal(new URL(page.url()).pathname, target === 'home' ? '/' : '/papers');
          }
          const before = await snapshot(page);
          await gate.release();
          await page.waitForFunction(() => window.__learnUISettled === true);
          await settleFrames(page);
          const after = await snapshot(page);
          assert.deepEqual(after, before, '旧响应放行且异步任务结束后，页面/URL/进度必须完全不变');
          if (destination === 'chapter') await reader(page, 'ros2', 2);
          if (destination === 'learn-home') await ready(page);
          evidence.delayed = pathname; evidence.destination = before.url;
          evidence.before = { ...before, detail: crypto.createHash('sha256').update(before.detail).digest('hex') };
          evidence.after = { ...after, detail: crypto.createHash('sha256').update(after.detail).digest('hex') };
        } finally { await gate.release(); }
      });
    }
  }
  await runCase('retry-section', '故意中断正文请求，retry 恢复且失败不污染缓存', async (page, evidence) => {
    let attempts = 0;
    await page.route(url => url.origin === origin && url.pathname === '/data/learn-split/ros2/sec-02.json', async route => {
      attempts++;
      if (attempts === 1) return route.abort('failed');
      return route.fulfill({ status: 200, contentType: 'application/json; charset=utf-8', body: fs.readFileSync(path.join(ROOT, 'data/learn-split/ros2/sec-02.json')) });
    });
    await page.goto(origin + '/learn/ros2/2', { waitUntil: 'domcontentloaded' });
    await page.locator('#learnRetry').waitFor();
    assert.match(await page.locator('.learn-error').innerText(), /学习内容加载失败/);
    assert.equal(new URL(page.url()).pathname, '/learn/ros2/2');
    assert.equal(await page.locator('#secMdBody').count(), 0);
    assert.equal((await recordProgress(page)).ros2.visitedSections.includes(1), false);
    await page.locator('#learnRetry').click();
    await reader(page, 'ros2', 1);
    assert.equal(attempts, 2, '失败后必须重新请求，不可使用失败缓存');
    assert.equal(await page.locator('.learn-error').count(), 0);
    assert.ok((await recordProgress(page)).ros2.visitedSections.includes(1));
    assert.deepEqual((await recordProgress(page)).ros2.sections, []);
    await navigate(page, '/learn/ros2/1', 'ros2', 0);
    await navigate(page, '/learn/ros2/2', 'ros2', 1);
    assert.equal(attempts, 2, '成功后正文可以缓存');
    evidence.attempts = attempts; evidence.progress = await recordProgress(page);
  });
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  result.sourceBefore = fingerprints();
  result.testScriptSha256 = crypto.createHash('sha256').update(fs.readFileSync(__filename)).digest('hex');
  try {
    const playwright = loadPlaywright();
    await startServer();
    browser = await playwright.chromium.launch({ executablePath: edgePath(), headless: true });
    result.browser = browser.version();
    await tests();
  } catch (error) { result.infrastructureErrors.push(error.stack); }
  finally {
    try { if (browser) await browser.close(); } catch (error) { result.infrastructureErrors.push(error.stack); }
    try {
      if (server?.listening) await new Promise((resolve, reject) => { server.close(error => error ? reject(error) : resolve()); server.closeAllConnections(); });
    } catch (error) { result.infrastructureErrors.push(error.stack); }
    result.cleanup = { browserClosed: !browser?.isConnected(), serverClosed: !server?.listening };
    if (!result.cleanup.browserClosed || !result.cleanup.serverClosed) result.infrastructureErrors.push('测试资源未完整关闭');
    result.sourceAfter = fingerprints();
    result.concurrentSourceChanges = Object.keys(result.sourceBefore).filter(file => result.sourceBefore[file] !== result.sourceAfter[file]);
    result.finishedAt = new Date().toISOString();
    result.summary = { passed: result.tests.filter(t => t.status === 'passed').length, failed: result.tests.filter(t => t.status === 'failed').length,
      pageerrors: result.tests.reduce((n, t) => n + t.pageerrors.length, 0), infrastructureErrors: result.infrastructureErrors.length,
      selectedFilter: process.env.LEARN_TEST_FILTER || null, sourceStable: !result.concurrentSourceChanges.length };
    const file = path.join(OUT, `${RUN}-results.json`);
    fs.writeFileSync(file, JSON.stringify(result, null, 2) + '\n', 'utf8');
    console.log(JSON.stringify({ summary: result.summary, result: path.relative(ROOT, file).replaceAll('\\', '/'), screenshots: result.screenshots }, null, 2));
    process.exitCode = result.summary.failed || result.summary.infrastructureErrors || !result.tests.length || result.concurrentSourceChanges.length ? 1 : 0;
  }
})();
