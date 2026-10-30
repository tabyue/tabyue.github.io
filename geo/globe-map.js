/* 地球仪的真实海陆底图。
 *
 * 底图只用天地图官方瓦片（vec_w），不自己描海岸线、不画任何疆界 —— 世界级别
 * （TILEMATRIX=2）天地图本身只出海陆，正合这一课「看经纬网」的用途。
 *
 * 做法：把 4×4 张世界瓦片拼成一张 1024×1024 的墨卡托底图，再按正射投影
 * 逐像素反算回经纬度去采样，于是底图能跟着球一起转。
 * 取不到瓦片（无网络 / key 失效）就安静退回原来的纯经纬网球体。
 */
(function () {
  'use strict';

  var root = typeof window !== 'undefined' ? window : {};
  var CFG = root.GEO_MAP_CONFIG || {};
  var Z = 2, N = 1 << Z, SRC = 256 * N;          /* 1024×1024 世界墨卡托 */
  var SIN_MAXLAT = 0.9962720;                     /* sin(85.05112878°)，墨卡托的上限纬度 */
  /* 极区瓦片够不到，用底图自身的颜色补：北极是洋面，南极是陆地 */
  var CAP_N = [170, 198, 238], CAP_S = [240, 239, 233];

  /* 球体几何：必须与 model.js 的 toScreen 一致 */
  var CX = 194, CY = 160, R = 112, TILT = -14 * Math.PI / 180;
  var VBW = 400, VBH = 350;
  var CT = Math.cos(TILT), ST = Math.sin(TILT);

  /* 光照：左上前方来光，保住球体的立体感 */
  var LX = -0.42, LY = -0.50, LZ = 0.76;

  var src = null;          /* Uint8ClampedArray，拼好的底图像素 */
  var state = 'idle';      /* idle | loading | ready | failed */
  var waiting = [];

  function tileURL(x, y) {
    return 'https://t' + (x % 8) + '.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile'
      + '&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles'
      + '&TILECOL=' + x + '&TILEROW=' + y + '&TILEMATRIX=' + Z + '&tk=' + CFG.tk;
  }

  /* 拼底图。全部瓦片到齐才算成功，缺一张就当失败，免得出现空洞。 */
  function load(done) {
    if (state === 'ready') { done(true); return; }
    if (state === 'failed') { done(false); return; }
    waiting.push(done);
    if (state === 'loading') return;
    state = 'loading';
    if (!CFG.enabled || !CFG.tk) { finish(false); return; }

    var cv = document.createElement('canvas');
    cv.width = cv.height = SRC;
    var ctx = cv.getContext('2d', { willReadFrequently: true });
    var left = N * N, bad = 0, timer = setTimeout(function () { finish(false); }, 12000);

    function tick() {
      if (--left > 0 || state !== 'loading') return;
      clearTimeout(timer);
      if (bad) { finish(false); return; }
      try {
        src = ctx.getImageData(0, 0, SRC, SRC).data;   /* 跨域被污染会在这里抛错 */
      } catch (e) { finish(false); return; }
      finish(true);
    }
    for (var x = 0; x < N; x++) for (var y = 0; y < N; y++) (function (x, y) {
      var im = new Image();
      im.crossOrigin = 'anonymous';
      im.onload = function () { ctx.drawImage(im, x * 256, y * 256); tick(); };
      im.onerror = function () { bad++; tick(); };
      im.src = tileURL(x, y);
    })(x, y);
  }

  function finish(ok) {
    state = ok ? 'ready' : 'failed';
    var list = waiting; waiting = [];
    for (var i = 0; i < list.length; i++) list[i](ok);
  }

  /* ---- 绘制 ---- */
  var view = null, hi = null, lo = null, size = 0;

  function setup(canvas) {
    var box = canvas.getBoundingClientRect();
    if (!box.width) return false;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var want = Math.max(160, Math.min(Math.round(box.width * dpr), 360));
    if (view === canvas && Math.abs(want - size) < 24) return true;
    view = canvas; size = want;
    canvas.width = canvas.height = size;
    hi = buffer(size);
    lo = buffer(Math.round(size * 0.56));
    return true;
  }

  function buffer(s) {
    var cv = document.createElement('canvas');
    cv.width = cv.height = s;
    var ctx = cv.getContext('2d');
    return { cv: cv, ctx: ctx, img: ctx.createImageData(s, s), s: s };
  }

  /* 把一个 s×s 的缓冲画满：每个像素反投影回经纬度再采样底图 */
  function paintBuffer(buf, camLon, camLat) {
    var s = buf.s, out = buf.img.data;
    var e = camLat * Math.PI / 180, ce = Math.cos(e), se = Math.sin(e);
    var lon0 = camLon * Math.PI / 180;
    var inv = 2 / s, half = s / 2, TAU = Math.PI * 2, FOURPI = Math.PI * 4;
    var k = 0;
    for (var py = 0; py < s; py++) {
      var v = (py + 0.5) * inv - 1;                  /* 归一化到 [-1,1] */
      var vv = v * v;
      for (var px = 0; px < s; px++, k += 4) {
        var u = (px + 0.5) * inv - 1;
        var d2 = u * u + vv;
        if (d2 >= 1) { out[k + 3] = 0; continue; }
        var nz = Math.sqrt(1 - d2);

        /* 屏幕坐标 → 相机坐标（toScreen 的逆，倾角矩阵是自身的逆） */
        var X = u * CT + v * ST, Y = u * ST - v * CT;
        var sinLat = Y * ce + nz * se;
        var A = -Y * se + nz * ce;

        var r, g, b;
        /* 墨卡托画不到 85.05° 以上，极区用纯色补（比 asin 判纬度快得多） */
        if (sinLat > SIN_MAXLAT || sinLat < -SIN_MAXLAT) {
          var cap = sinLat > 0 ? CAP_N : CAP_S;
          r = cap[0]; g = cap[1]; b = cap[2];
        } else {
          var lon = lon0 + Math.atan2(X, A);
          lon -= TAU * Math.floor((lon + Math.PI) / TAU);   /* 归一到 [-π,π) */
          var fx = (lon / TAU + 0.5) * SRC - 0.5;
          var fy = (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / FOURPI) * SRC - 0.5;
          /* 双线性采样：底图分辨率本就不高，不插值海岸线会出台阶 */
          var x0 = Math.floor(fx), y0 = Math.floor(fy);
          var tx = fx - x0, ty = fy - y0;
          var xa = x0 % SRC; if (xa < 0) xa += SRC;         /* 经度要环绕 */
          var xb = xa + 1; if (xb >= SRC) xb = 0;
          var ya = y0 < 0 ? 0 : (y0 > SRC - 1 ? SRC - 1 : y0);
          var yb = y0 + 1 < 0 ? 0 : (y0 + 1 > SRC - 1 ? SRC - 1 : y0 + 1);
          var rA = ya * SRC, rB = yb * SRC;
          var oA = (rA + xa) << 2, oB = (rA + xb) << 2, oC = (rB + xa) << 2, oD = (rB + xb) << 2;
          var w1 = tx * (1 - ty), w0 = (1 - tx) * (1 - ty), w3 = tx * ty, w2 = (1 - tx) * ty;
          r = src[oA] * w0 + src[oB] * w1 + src[oC] * w2 + src[oD] * w3;
          g = src[oA + 1] * w0 + src[oB + 1] * w1 + src[oC + 1] * w2 + src[oD + 1] * w3;
          b = src[oA + 2] * w0 + src[oB + 2] * w1 + src[oC + 2] * w2 + src[oD + 2] * w3;
        }

        var dot = u * LX + v * LY + nz * LZ;
        var sh = 0.74 + (dot > 0 ? 0.34 * dot : 0);
        r *= sh; g *= sh; b *= sh;
        out[k] = r > 255 ? 255 : r;
        out[k + 1] = g > 255 ? 255 : g;
        out[k + 2] = b > 255 ? 255 : b;
        /* 边缘一像素做抗锯齿，免得球缘出现台阶 */
        var a = (1 - Math.sqrt(d2)) * half;
        out[k + 3] = a >= 1 ? 255 : (a <= 0 ? 0 : a * 255);
      }
    }
    buf.ctx.putImageData(buf.img, 0, 0);
  }

  function render(canvas, cam, fast) {
    if (state !== 'ready' || !setup(canvas)) return false;
    var buf = fast ? lo : hi;
    paintBuffer(buf, cam.lon, cam.lat);
    var g = canvas.getContext('2d');
    g.clearRect(0, 0, size, size);
    g.imageSmoothingEnabled = true;
    g.drawImage(buf.cv, 0, 0, size, size);
    return true;
  }

  /* 屏幕坐标（SVG 的 400×350 空间）→ 经纬度；落在球外返回 null。
     这是 paintBuffer 内联那段的参考实现，公式完全一致；
     单独导出一份，测试拿它和 model.js 的正投影做往返校验，
     万一哪天球心/半径/倾角被改动，测试会立刻失败。 */
  function invert(sx, sy, cam) {
    var u = (sx - CX) / R, v = (sy - CY) / R;
    var d2 = u * u + v * v;
    if (d2 >= 1) return null;
    var nz = Math.sqrt(1 - d2);
    var X = u * CT + v * ST, Y = u * ST - v * CT;
    var e = cam.lat * Math.PI / 180, ce = Math.cos(e), se = Math.sin(e);
    var sinLat = Y * ce + nz * se, A = -Y * se + nz * ce;
    var lon = cam.lon + Math.atan2(X, A) * 180 / Math.PI;
    lon -= 360 * Math.floor((lon + 180) / 360);
    if (sinLat > 1) sinLat = 1; else if (sinLat < -1) sinLat = -1;
    return { lon: lon, lat: Math.asin(sinLat) * 180 / Math.PI };
  }

  /* 画布要正好盖住球：球心 (194,160)、半径 112，相对 400×350 的 viewBox */
  root.GlobeMap = {
    load: load,
    render: render,
    invert: invert,
    ready: function () { return state === 'ready'; },
    geom: { cx: CX, cy: CY, r: R, tilt: TILT * 180 / Math.PI },
    box: {
      left: (CX - R) / VBW * 100, top: (CY - R) / VBH * 100,
      width: 2 * R / VBW * 100, height: 2 * R / VBH * 100
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.GlobeMap;
})();
