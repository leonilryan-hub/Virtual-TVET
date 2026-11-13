/* Virtual TVET - protected LMS player (service worker)
   Developed by LEONIL RYAN L. DELA PEÑA, Senior TESD Specialist, RTC-Cebu

   Serves the pages of an open simulator from  .../Virtual-TVET/lms-run/<id>/...
   Nothing is stored here or on the phone: every file is asked from the open campus page,
   which decrypts it in memory only while the learner's access is active. */
"use strict";
const SCOPE = new URL("./lms-run/", self.location).href;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

function lockedPage(text) {
  const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Access expired</title><body style="margin:0;font-family:Segoe UI,Roboto,sans-serif;background:#0b2a5b;color:#fff;display:grid;place-items:center;min-height:100vh;text-align:center">
<div style="padding:24px;max-width:420px"><div style="font-size:54px">🔒</div><h2 style="margin:6px 0">Access expired</h2>
<p style="line-height:1.5">${text}</p><p style="font-size:12px;color:#f2b705;margin-top:18px">Virtual TVET Campus · RTC-Cebu</p></div></body>`;
  return new Response(html, { status: 403, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

// the campus pages of this site (windows in this folder that are not simulator pages)
const BASE = new URL("./", self.location).href;
async function campusClients() {
  const list = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  return list.filter(c => c.url.startsWith(BASE) && !c.url.startsWith(SCOPE));
}

function askOne(client, msg) {
  return new Promise(resolve => {
    const ch = new MessageChannel();
    const t = setTimeout(() => resolve({ ok: false, silent: true }), 15000);
    ch.port1.onmessage = e => { clearTimeout(t); resolve(e.data || { ok: false }); };
    client.postMessage(msg, [ch.port2]);
  });
}
// ask every open campus tab; use the first one that can open the file
function ask(clients, msg) {
  return new Promise(resolve => {
    let left = clients.length, first = null;
    clients.forEach(c => askOne(c, msg).then(r => {
      if (r.ok) { resolve(r); return; }
      if (!r.silent && !first) first = r;
      if (--left === 0) resolve(first || { ok: false });
    }));
  });
}

self.addEventListener("fetch", event => {
  const url = event.request.url;
  if (!url.startsWith(SCOPE) || event.request.method !== "GET") return; // fonts, the records server, etc. pass straight through
  event.respondWith(serve(event.request));
});

async function serve(req) {
  const u = new URL(req.url);
  const rest = decodeURIComponent(u.pathname.slice(new URL(SCOPE).pathname.length)); // <id>/<path>
  const slash = rest.indexOf("/");
  const id = slash < 0 ? rest : rest.slice(0, slash);
  let path = slash < 0 ? "" : rest.slice(slash + 1);
  if (!path || path.endsWith("/")) path += "index.html";
  const clients = await campusClients();
  if (!clients.length) return lockedPage("Open this simulator from the Virtual TVET campus, after entering your PIN.");
  const r = await ask(clients, { type: "vt-lms-file", id, path });
  if (!r.ok) {
    if (r.missing) return new Response("Not found", { status: 404 });
    return lockedPage(r.error || "Your campus access is locked. Open the campus, enter your PIN, and scan your trainer's QR code if asked.");
  }
  const body = r.data; // ArrayBuffer
  const headers = { "Content-Type": r.type || "application/octet-stream", "Cache-Control": "no-store", "Accept-Ranges": "bytes",
    "X-Content-Type-Options": "nosniff" };
  const range = req.headers.get("range");
  const size = body.byteLength;
  if (range) { // videos ask for parts of the file
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    if (m) {
      let start = m[1] === "" ? Math.max(0, size - Number(m[2])) : Number(m[1]);
      let end = m[1] !== "" && m[2] !== "" ? Math.min(Number(m[2]), size - 1) : size - 1;
      if (start >= size || start > end) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
      headers["Content-Range"] = `bytes ${start}-${end}/${size}`;
      headers["Content-Length"] = String(end - start + 1);
      return new Response(body.slice(start, end + 1), { status: 206, headers });
    }
  }
  headers["Content-Length"] = String(size);
  return new Response(body, { status: 200, headers });
}
