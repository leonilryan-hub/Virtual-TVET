/* Virtual TVET Campus - Trainee's Record Book (TRB) layout, shared by the campus and the Trainer Page.
   Developed by LEONIL RYAN L. DELA PEÑA, Senior TESD Specialist, RTC-Cebu */
(function () {
  "use strict";
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const longD = d => { if (!d) return ""; const x = new Date(d + "T12:00:00"); return isNaN(x) ? d : x.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }); };
  const shortD = d => { if (!d) return ""; const x = new Date(d + "T12:00:00"); return isNaN(x) ? d : x.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }); };
  const STATUS = { C: "Competent", R: "Ready for ICE", P: "In training", N: "Not yet competent", "": "Not started" };
  const CATS = ["Basic", "Common", "Core"];
  const CREDIT = "Developed by LEONIL RYAN L. DELA PEÑA, Senior TESD Specialist, RTC-Cebu";

  function loTitle(bank, code, i) { const b = bank && bank[code]; return b && b.los && b.los[i] ? b.los[i].title : ""; }
  function trainerName(d, id) { return id ? (d.trainers && d.trainers[String(id).toUpperCase()]) || id : ""; }
  function result(x) {
    if (x.s === "C") return "Competent";
    if (x.s === "N") return "Not yet competent";
    if (x.s === "R") return "Met in RPL (for ICE)";
    return "";
  }
  /* one unit as a table. print=true adds blank initial boxes for wet signatures */
  function unitTable(d, bank, code, print) {
    const u = d.units.find(y => y.code === code), p = d.progress[code];
    const rows = p.los.map((x, i) => {
      const marked = x.s === "C" || x.s === "N";
      return `<tr><td class="c"><b>LO${i + 1}</b></td><td class="l">${esc(loTitle(bank, code, i))}</td>
        <td class="c">${marked ? esc(shortD(x.d)) : ""}</td><td class="c ${x.s === "C" ? "ok" : x.s === "N" ? "no" : x.s === "R" ? "rpl" : ""}">${esc(result(x))}</td>
        <td class="c">${marked ? esc(x.m || "") : ""}</td><td class="c">${marked ? esc(trainerName(d, x.by)) : ""}</td>
        <td class="c">${x.ack ? "✔ " + esc(shortD(x.ack)) : ""}${print ? `<div class="box"></div>` : ""}</td>${print ? `<td class="c"><div class="box"></div></td>` : ""}</tr>`;
    }).join("");
    const unitMarked = p.s === "C" || p.s === "N";
    const unitRow = `<tr class="ur"><td class="c"><b>Unit</b></td><td class="l"><b>Unit result</b> ${p.s === "C" && p.m === "All LOs competent" ? "(all LOs competent)" : "(Institutional Competency Evaluation)"}</td>
      <td class="c">${unitMarked ? esc(shortD(p.d)) : ""}</td><td class="c ${p.s === "C" ? "ok" : p.s === "N" ? "no" : ""}"><b>${esc(STATUS[p.s || ""])}</b></td>
      <td class="c">${unitMarked && p.m !== "All LOs competent" ? esc(p.m || "") : ""}</td><td class="c">${unitMarked ? esc(trainerName(d, p.by)) : ""}</td>
      <td class="c">${p.ack ? "✔ " + esc(shortD(p.ack)) : ""}${print ? `<div class="box"></div>` : ""}</td>${print ? `<td class="c"><div class="box"></div></td>` : ""}</tr>`;
    return `<table class="trb"><thead><tr><th style="width:42px">LO</th><th>Learning outcome</th><th>Date accomplished</th><th>Result</th><th>Assessment method</th><th>Trainer</th><th>Trainee's ${print ? "initial" : "confirmation"}</th>${print ? "<th>Trainer's initial</th>" : ""}</tr></thead>
      <tbody>${rows}${unitRow}</tbody></table>`;
  }
  function counts(d) {
    const c = { C: 0, R: 0, P: 0, N: 0, "": 0 };
    d.units.forEach(u => c[d.progress[u.code].s || ""]++);
    return c;
  }
  /* the whole printable record book (opened in a new window) */
  function printDoc(d, bank, opts) {
    opts = opts || {};
    const L = d.learner, c = counts(d), n = d.units.length;
    const trainersUsed = [...new Set(d.units.flatMap(u => { const p = d.progress[u.code]; return [p.by].concat(p.los.map(x => x.by)); }).filter(Boolean))].map(id => trainerName(d, id));
    const allDates = d.units.flatMap(u => { const a = d.assess[u.code] || {}, p = d.progress[u.code]; return [a.sag, a.pre, p.d].concat(p.los.map(x => x.d)); }).filter(Boolean).sort();
    const css = `@page{size:A4;margin:14mm}*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
      body{font-family:"Segoe UI",Arial,sans-serif;color:#1b2333;margin:0;font-size:12px}
      .page{page-break-after:always;min-height:250mm;position:relative}.page:last-child{page-break-after:auto}
      h1{font-size:30px;color:#0b2a5b;margin:10px 0 4px;letter-spacing:1px}h2{font-size:16px;color:#0b2a5b;border-bottom:3px solid #f2b705;padding-bottom:4px;margin:18px 0 8px}
      h3{font-size:13px;color:#0b2a5b;margin:14px 0 5px;page-break-after:avoid;break-after:avoid}.muted{color:#5b6578}
      .cover{text-align:center;padding-top:30px}.cover .band{background:#0b2a5b;color:#fff;padding:14px;border-bottom:6px solid #f2b705;font-size:13px;letter-spacing:.5px}
      .photo{width:1.2in;height:1.2in;border:1.5px dashed #888;margin:22px auto;display:flex;align-items:center;justify-content:center;color:#888;font-size:11px}
      table.info{margin:18px auto;border-collapse:collapse;font-size:13px;min-width:70%}table.info td{border-bottom:1px solid #c9ccd3;padding:7px 10px;text-align:left}table.info td:first-child{color:#5b6578;width:38%}
      table.trb,table.sum{width:100%;border-collapse:collapse;font-size:10.5px;page-break-inside:avoid;margin-bottom:6px}
      table.trb th,table.sum th{background:#0b2a5b;color:#fff;padding:5px 4px;font-size:10px}
      table.trb td,table.sum td{border:1px solid #c9ccd3;padding:4px}td.c{text-align:center}td.l{text-align:left}
      td.ok{color:#1d6b3d;font-weight:700}td.no{color:#8a0f22;font-weight:700}td.rpl{color:#1f5fbf}tr.ur td{background:#f4f6fb}
      .box{width:44px;height:16px;border-bottom:1px solid #555;margin:2px auto 0}
      .unit{page-break-inside:avoid;margin-bottom:10px}.unit .hd{display:flex;justify-content:space-between;gap:10px;align-items:baseline}
      .sig{display:flex;gap:30px;margin-top:50px}.sig div{flex:1;border-top:1px solid #333;text-align:center;padding-top:4px;font-size:11.5px}
      .credit{position:absolute;bottom:0;left:0;right:0;text-align:center;font-size:10px;color:#5b6578}
      ul{margin:6px 0 0 18px;padding:0}li{margin:3px 0}`;
    const cover = `<div class="page cover">
      <div class="band">TECHNICAL EDUCATION AND SKILLS DEVELOPMENT AUTHORITY<br><b style="font-size:15px">${esc(d.institution)}</b></div>
      <h1 style="margin-top:40px">TRAINEE'S RECORD BOOK</h1>
      <div style="font-size:16px;font-weight:700;color:#1f5fbf">${esc(L.qualification)}</div>
      <div class="photo">Attach 1×1<br>photo</div>
      <table class="info">
        <tr><td>Name of trainee</td><td><b>${esc(L.name)}</b></td></tr>
        <tr><td>Trainee ID</td><td>${esc(L.id)}</td></tr>
        <tr><td>Address</td><td>${esc(L.address)}</td></tr>
        ${L.sex ? `<tr><td>Sex</td><td>${esc(L.sex)}</td></tr>` : ""}
        <tr><td>Date registered</td><td>${esc(longD(L.registered))}</td></tr>
        <tr><td>Training period</td><td>${allDates.length ? esc(longD(allDates[0])) + " to " + esc(longD(allDates[allDates.length - 1])) : "—"}</td></tr>
        ${L.learnerType ? `<tr><td>Learning style</td><td>${esc(L.learnerType)}</td></tr>` : ""}
        <tr><td>Trainer(s)</td><td>${esc(trainersUsed.join(", ") || "—")}</td></tr>
        ${L.tip ? `<tr><td>Training Induction Program</td><td>Attended ${esc(longD(L.tip))}</td></tr>` : ""}
        ${L.contract ? `<tr><td>Learning contract</td><td>Signed ${esc(longD(L.contract))}</td></tr>` : ""}
        ${L.jip ? `<tr><td>Job Induction Program</td><td>Completed ${esc(longD(L.jip))}</td></tr>` : ""}
      </table>
      <div class="muted">Virtual TVET Campus · printed ${esc(longD(d.today))}</div>
      <div class="credit">${esc(CREDIT)}</div></div>`;
    const rpl = `<h2>1. Pre-training assessment (Recognition of Prior Learning)</h2>
      <p class="muted">Self-Assessment Guide and pre-test taken in the Institutional Assessment Area before training.</p>
      <table class="sum"><thead><tr><th>Code</th><th>Unit of competency</th><th>Self-Assessment</th><th>Pre-test</th><th>Training gaps</th></tr></thead><tbody>
      ${d.units.map(u => { const a = d.assess[u.code] || {}, p = d.progress[u.code];
        return `<tr><td class="c">${esc(u.code)}</td><td>${esc(u.title)}</td><td class="c">${a.sag ? esc(shortD(a.sag)) + "<br>" + esc(a.sagYes) + " Yes" : "—"}</td>
          <td class="c">${a.pre ? esc(shortD(a.pre)) + "<br>" + esc(a.prePct) + "%" : "—"}</td><td class="c">${a.sag && a.pre ? esc(p.gaps || "None") : "—"}</td></tr>`; }).join("")}
      </tbody></table>`;
    const record = `<h2>2. Record of competencies</h2>
      <p class="muted">The trainer records the date each learning outcome is accomplished. The trainee initials each entry. ✔ with a date = confirmed online by the trainee.</p>
      ${CATS.map(cat => { const U = d.units.filter(u => u.cat === cat); if (!U.length) return "";
        return `<h3>${cat} competencies</h3>` + U.map(u => `<div class="unit"><div class="hd"><b>${esc(u.code)} · ${esc(u.title)}</b><span class="muted">${esc(STATUS[d.progress[u.code].s || ""])}</span></div>${unitTable(d, bank, u.code, true)}</div>`).join(""); }).join("")}`;
    const done = d.units.filter(u => d.progress[u.code].s === "C");
    const summary = `<h2>3. Summary of competencies achieved</h2>
      <table class="sum"><thead><tr><th>Code</th><th>Unit of competency</th><th>Category</th><th>Date competent</th><th>Trainer</th></tr></thead><tbody>
      ${done.length ? done.map(u => { const p = d.progress[u.code]; return `<tr><td class="c">${esc(u.code)}</td><td>${esc(u.title)}</td><td class="c">${esc(u.cat)}</td><td class="c">${esc(longD(p.d))}</td><td class="c">${esc(trainerName(d, p.by || (p.los.find(x => x.by) || {}).by))}</td></tr>`; }).join("")
        : `<tr><td colspan="5" class="c muted">No unit of competency achieved yet.</td></tr>`}
      </tbody></table>
      ${L.na && L.na.status ? `<p style="font-size:13px"><b>National Assessment (NC III):</b> ${esc(L.na.status === "NYC" ? "Not Yet Competent" : L.na.status)}${L.na.date ? " · " + esc(longD(L.na.date)) : ""}${L.na.center ? " · " + esc(L.na.center) : ""}${L.na.nc ? " · NC No. " + esc(L.na.nc) : ""}</p>` : ""}
      <p><b>${c.C} of ${n}</b> units of competency achieved · ${c.R} ready for Institutional Competency Evaluation · ${c.P + c.N} in training · ${c[""]} not started.</p>`;
    const cert = `<h2>4. Certification</h2>
      <p style="font-size:13px;line-height:1.7">This is to certify that <b>${esc(L.name)}</b> (Trainee ID ${esc(L.id)}) has achieved <b>${c.C} of ${n}</b> units of competency of <b>${esc(L.qualification)}</b>, as recorded in this Trainee's Record Book, as of ${esc(longD(d.today))}.</p>
      <div class="sig"><div>Signature of trainee<br>over printed name</div><div>Signature of trainer<br>over printed name</div><div>Head of institution</div></div>
      <p class="muted" style="margin-top:30px">${esc(CREDIT)}</p>`;
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Trainee's Record Book · ${esc(L.id)} ${esc(L.name)}</title><style>${css}</style></head><body>
      ${cover}<div class="page">${rpl}${record}</div><div class="page">${summary}${cert}</div>
      ${opts.autoPrint === false ? "" : "<script>window.onload=function(){setTimeout(function(){window.print();},350);};<\/script>"}</body></html>`;
  }
  function openPrint(d, bank, win) {
    const w = win || window.open("", "_blank");
    if (!w) return false;
    w.document.open(); w.document.write(printDoc(d, bank)); w.document.close();
    return true;
  }
  window.VTTRB = { unitTable, printDoc, openPrint, counts, STATUS, longD, shortD, trainerName };
})();
