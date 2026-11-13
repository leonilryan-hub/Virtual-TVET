// Virtual TVET - small QR code maker (byte mode, error correction level M, versions 1-15)
// Based on the QR Code standard (ISO/IEC 18004). No internet or library needed.
// Developed by LEONIL RYAN L. DELA PENA, Senior TESD Specialist, RTC-Cebu
(function () {
  "use strict";
  var ECC_M = [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24];
  var BLK_M = [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10];

  function rawModules(v) {
    var r = (16 * v + 128) * v + 64;
    if (v >= 2) { var n = Math.floor(v / 7) + 2; r -= (25 * n - 10) * n - 55; if (v >= 7) r -= 36; }
    return r;
  }
  function dataCodewords(v) { return Math.floor(rawModules(v) / 8) - ECC_M[v] * BLK_M[v]; }
  function gmul(x, y) { var z = 0; for (var i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> i) & 1) * x; } return z & 255; }
  function rsDivisor(deg) {
    var r = []; for (var i = 0; i < deg - 1; i++) r.push(0); r.push(1);
    var root = 1;
    for (i = 0; i < deg; i++) {
      for (var j = 0; j < r.length; j++) { r[j] = gmul(r[j], root); if (j + 1 < r.length) r[j] ^= r[j + 1]; }
      root = gmul(root, 2);
    }
    return r;
  }
  function rsRemainder(data, div) {
    var r = div.map(function () { return 0; });
    data.forEach(function (b) {
      var f = b ^ r.shift(); r.push(0);
      div.forEach(function (c, i) { r[i] ^= gmul(c, f); });
    });
    return r;
  }
  function utf8(s) { return Array.from(new TextEncoder().encode(s)); }

  function make(text) {
    var bytes = utf8(text), ver = 0;
    for (var v = 1; v <= 15; v++) {
      var cap = dataCodewords(v) * 8, need = 4 + (v < 10 ? 8 : 16) + bytes.length * 8;
      if (need <= cap) { ver = v; break; }
    }
    if (!ver) throw new Error("Text too long for QR code");
    var size = ver * 4 + 17;
    // bits
    var bits = [];
    var put = function (val, n) { for (var i = n - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
    put(4, 4); put(bytes.length, ver < 10 ? 8 : 16); bytes.forEach(function (b) { put(b, 8); });
    var capBits = dataCodewords(ver) * 8;
    put(0, Math.min(4, capBits - bits.length));
    put(0, (8 - bits.length % 8) % 8);
    for (var pad = 0xEC; bits.length < capBits; pad ^= 0xEC ^ 0x11) put(pad, 8);
    var data = [];
    for (var i = 0; i < bits.length; i += 8) { var x = 0; for (var j = 0; j < 8; j++) x = (x << 1) | bits[i + j]; data.push(x); }
    // ECC + interleave
    var nb = BLK_M[ver], ecl = ECC_M[ver], raw = Math.floor(rawModules(ver) / 8);
    var nShort = nb - raw % nb, shortLen = Math.floor(raw / nb), div = rsDivisor(ecl), blocks = [];
    for (i = 0, j = 0; i < nb; i++) {
      var d = data.slice(j, j + shortLen - ecl + (i < nShort ? 0 : 1)); j += d.length;
      var e = rsRemainder(d, div); if (i < nShort) d.push(0); blocks.push(d.concat(e));
    }
    var cw = [];
    for (i = 0; i < blocks[0].length; i++) blocks.forEach(function (b, k) { if (i !== shortLen - ecl || k >= nShort) cw.push(b[i]); });

    // matrix
    var M = [], F = [];
    for (i = 0; i < size; i++) { M.push(new Array(size).fill(false)); F.push(new Array(size).fill(false)); }
    var fn = function (x, y, dark) { M[y][x] = dark; F[y][x] = true; };
    for (i = 0; i < size; i++) { fn(6, i, i % 2 === 0); fn(i, 6, i % 2 === 0); }
    var finder = function (cx, cy) {
      for (var dy = -4; dy <= 4; dy++) for (var dx = -4; dx <= 4; dx++) {
        var dist = Math.max(Math.abs(dx), Math.abs(dy)), xx = cx + dx, yy = cy + dy;
        if (xx >= 0 && xx < size && yy >= 0 && yy < size) fn(xx, yy, dist !== 2 && dist !== 4);
      }
    };
    finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
    var pos = [];
    if (ver > 1) {
      var na = Math.floor(ver / 7) + 2, step = Math.ceil((ver * 4 + 4) / (na * 2 - 2)) * 2;
      pos = [6]; for (var p = size - 7; pos.length < na; p -= step) pos.splice(1, 0, p);
      for (i = 0; i < na; i++) for (j = 0; j < na; j++) {
        if ((i === 0 && j === 0) || (i === 0 && j === na - 1) || (i === na - 1 && j === 0)) continue;
        for (var dy2 = -2; dy2 <= 2; dy2++) for (var dx2 = -2; dx2 <= 2; dx2++) fn(pos[i] + dx2, pos[j] + dy2, Math.max(Math.abs(dx2), Math.abs(dy2)) !== 1);
      }
    }
    var format = function (mask) {
      var dat = (0 << 3) | mask, rem = dat; // level M = 00
      for (var i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
      var b = ((dat << 10) | rem) ^ 0x5412, bit = function (i) { return ((b >>> i) & 1) !== 0; };
      for (i = 0; i <= 5; i++) fn(8, i, bit(i));
      fn(8, 7, bit(6)); fn(8, 8, bit(7)); fn(7, 8, bit(8));
      for (i = 9; i < 15; i++) fn(14 - i, 8, bit(i));
      for (i = 0; i < 8; i++) fn(size - 1 - i, 8, bit(i));
      for (i = 8; i < 15; i++) fn(8, size - 15 + i, bit(i));
      fn(8, size - 8, true);
    };
    format(0);
    if (ver >= 7) {
      var rem = ver; for (i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25);
      var vb = (ver << 12) | rem;
      for (i = 0; i < 18; i++) { var c = ((vb >>> i) & 1) !== 0, a = size - 11 + i % 3, bb = Math.floor(i / 3); fn(a, bb, c); fn(bb, a, c); }
    }
    // codewords
    var k = 0;
    for (var right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (var vert = 0; vert < size; vert++) for (j = 0; j < 2; j++) {
        var xx = right - j, up = ((right + 1) & 2) === 0, yy = up ? size - 1 - vert : vert;
        if (!F[yy][xx] && k < cw.length * 8) { M[yy][xx] = ((cw[k >>> 3] >>> (7 - (k & 7))) & 1) !== 0; k++; }
      }
    }
    var maskFn = [
      function (x, y) { return (x + y) % 2 === 0; }, function (x, y) { return y % 2 === 0; },
      function (x) { return x % 3 === 0; }, function (x, y) { return (x + y) % 3 === 0; },
      function (x, y) { return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; },
      function (x, y) { return x * y % 2 + x * y % 3 === 0; },
      function (x, y) { return (x * y % 2 + x * y % 3) % 2 === 0; },
      function (x, y) { return ((x + y) % 2 + x * y % 3) % 2 === 0; }
    ];
    var applyMask = function (m) { for (var y = 0; y < size; y++) for (var x = 0; x < size; x++) if (!F[y][x] && maskFn[m](x, y)) M[y][x] = !M[y][x]; };
    var penalty = function () {
      var s = 0, y, x, dark = 0;
      var line = function (get) {
        for (var a = 0; a < size; a++) {
          var run = 1, str = "";
          for (var b = 0; b < size; b++) {
            var v = get(a, b); str += v ? "1" : "0";
            if (b > 0) { if (v === get(a, b - 1)) { run++; if (run === 5) s += 3; else if (run > 5) s++; } else run = 1; }
          }
          var re = /(?=(10111010000|00001011101))/g; while (re.exec(str)) { s += 40; re.lastIndex++; }
        }
      };
      line(function (a, b) { return M[a][b]; }); line(function (a, b) { return M[b][a]; });
      for (y = 0; y < size - 1; y++) for (x = 0; x < size - 1; x++) { var c0 = M[y][x]; if (c0 === M[y][x + 1] && c0 === M[y + 1][x] && c0 === M[y + 1][x + 1]) s += 3; }
      for (y = 0; y < size; y++) for (x = 0; x < size; x++) if (M[y][x]) dark++;
      s += Math.floor(Math.abs(dark * 20 - size * size * 10) / (size * size)) * 10;
      return s;
    };
    var best = 0, bestP = Infinity;
    for (var m = 0; m < 8; m++) { applyMask(m); format(m); var pp = penalty(); if (pp < bestP) { bestP = pp; best = m; } applyMask(m); }
    applyMask(best); format(best);
    return { size: size, version: ver, modules: M };
  }

  function draw(canvas, text, opt) {
    opt = opt || {};
    var q = make(text), border = opt.border === undefined ? 4 : opt.border;
    var px = opt.size || canvas.width || 300;
    var n = q.size + border * 2, scale = Math.max(1, Math.floor(px / n));
    canvas.width = canvas.height = n * scale;
    var g = canvas.getContext("2d");
    g.fillStyle = opt.light || "#ffffff"; g.fillRect(0, 0, canvas.width, canvas.height);
    g.fillStyle = opt.dark || "#000000";
    for (var y = 0; y < q.size; y++) for (var x = 0; x < q.size; x++) if (q.modules[y][x]) g.fillRect((x + border) * scale, (y + border) * scale, scale, scale);
    return q;
  }

  window.VTQR = { make: make, draw: draw };
})();
