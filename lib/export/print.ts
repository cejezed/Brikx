// Brikx Wizard - Robust print-to-PDF via hidden iframe
// Print pas na load + animation frame om lege pagina's te voorkomen.

import type { PvEPreview } from "@/lib/preview/buildPreview";

export function printPreviewToPdf(preview: PvEPreview) {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("sandbox", "allow-modals allow-same-origin allow-scripts");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const win = iframe.contentWindow!;
  const doc = iframe.contentDocument!;

  const style = `
    <style>
      @page { size: A4; margin: 18mm; }
      * { box-sizing: border-box; }
      html, body { height: 100%; }
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
             color: #111827; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      h1 { font-size: 20px; margin: 0 0 12px; }
      h2 { font-size: 16px; margin: 18px 0 8px; }
      p, li, td { font-size: 12px; line-height: 1.4; }
      .muted { color: #6b7280; }
      .section { margin-bottom: 12px; break-inside: avoid; }
      table { width: 100%; border-collapse: collapse; margin-top: 6px; }
      th, td { border: 1px solid #e5e7eb; padding: 6px 8px; text-align: left; }
      th { background: #f9fafb; }
      .small { font-size: 11px; }
      ul { margin: 6px 0 0 18px; padding: 0; }
    </style>
  `;

  const html = `
    <!doctype html>
    <html lang="nl">
      <head>
        <meta charset="utf-8" />
        <title>Brikx PvE</title>
        ${style}
      </head>
      <body>
        <h1>Programma van Eisen (PvE) – Brikx</h1>
        <p class="muted small">Automatisch gegenereerd</p>

        <div class="section">
          <h2>Projectbasis</h2>
          <table>
            <tbody>
              <tr><th>Type</th><td>${escapeHtml(preview.summary.projectType)}</td></tr>
              <tr><th>Ervaring</th><td>${escapeHtml(preview.summary.ervaring)}</td></tr>
              <tr><th>Intentie</th><td>${escapeHtml(preview.summary.intent)}</td></tr>
              <tr><th>Urgentie</th><td>${escapeHtml(preview.summary.urgentie)}</td></tr>
              <tr><th>Budget</th><td>${escapeHtml(preview.summary.budget)}</td></tr>
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Ruimtes (${preview.ruimtes.length})</h2>
          ${
            preview.ruimtes.length === 0
              ? `<p class="muted">Nog geen ruimtes.</p>`
              : `
                <table>
                  <thead><tr><th>Type</th><th>Categorie</th></tr></thead>
                  <tbody>
                    ${preview.ruimtes
                      .map(
                        (r) =>
                          `<tr><td>${escapeHtml(r.type || "—")}</td><td>${escapeHtml(String(r.tag))}</td></tr>`
                      )
                      .join("")}
                  </tbody>
                </table>
              `
          }
        </div>

        <div class="section">
          <h2>Wensen (${preview.wensen.length})</h2>
          ${
            preview.wensen.length === 0
              ? `<p class="muted">Nog geen wensen.</p>`
              : `
                <table>
                  <thead><tr><th>Wens</th><th>Prioriteit</th></tr></thead>
                  <tbody>
                    ${preview.wensen
                      .map(
                        (w) =>
                          `<tr><td>${escapeHtml(w.label)}</td><td>${escapeHtml(w.priority ?? "—")}</td></tr>`
                      )
                      .join("")}
                  </tbody>
                </table>
              `
          }
        </div>

        ${
          preview.techniek
            ? `
          <div class="section">
            <h2>Techniek</h2>
            <table>
              <tbody>
                <tr><th>Bouwmethode</th><td>${escapeHtml(preview.techniek.buildMethod)}</td></tr>
                <tr><th>Ventilatie</th><td>${escapeHtml(preview.techniek.ventilation)}</td></tr>
                <tr><th>Verwarming</th><td>${escapeHtml(preview.techniek.heating)}</td></tr>
                <tr><th>Koeling</th><td>${escapeHtml(preview.techniek.cooling)}</td></tr>
                <tr><th>PV</th><td>${escapeHtml(preview.techniek.pv)}</td></tr>
                <tr><th>Rc-doel</th><td>${escapeHtml(preview.techniek.insulationTargetRc ?? "—")}</td></tr>
              </tbody>
            </table>
            ${preview.techniek.notes ? `<p class="small"><strong>Toelichting / aandachtspunten:</strong> ${escapeHtml(preview.techniek.notes)}</p>` : ""}
          </div>
          `
            : ""
        }

        ${
          preview.duurzaamheid
            ? `
          <div class="section">
            <h2>Duurzaamheid</h2>
            <table>
              <tbody>
                <tr><th>Focus</th><td>${escapeHtml(preview.duurzaamheid.focus)}</td></tr>
                <tr><th>Materialen</th><td>${escapeHtml(preview.duurzaamheid.materials)}</td></tr>
                <tr><th>Regenwater</th><td>${escapeHtml(preview.duurzaamheid.rainwater)}</td></tr>
                <tr><th>Groendak</th><td>${escapeHtml(preview.duurzaamheid.greenRoof)}</td></tr>
                <tr><th>EPC/BENG</th><td>${escapeHtml(preview.duurzaamheid.epcTarget ?? "—")}</td></tr>
              </tbody>
            </table>
            ${preview.duurzaamheid.notes ? `<p class="small"><strong>Toelichting / aandachtspunten:</strong> ${escapeHtml(preview.duurzaamheid.notes)}</p>` : ""}
          </div>
          `
            : ""
        }

        ${
          preview.remarks.length
            ? `
          <div class="section">
            <h2>Aandachtspunten & toelichting</h2>
            <ul>
              ${preview.remarks.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}
            </ul>
          </div>
          `
            : ""
        }
      </body>
    </html>
  `;

  doc.open(); doc.write(html); doc.close();

  const cleanup = () => {
    try { win.removeEventListener("afterprint", cleanup); } catch {}
    requestAnimationFrame(() => { if (iframe.parentNode) iframe.parentNode.removeChild(iframe); });
  };

  const doPrint = () => {
    setTimeout(() => {
      try { win.focus(); win.print(); }
      catch {
        const fallback = window.open("", "_blank", "noopener,noreferrer,width=900,height=1200");
        if (fallback) { fallback.document.open(); fallback.document.write(html); fallback.document.close(); fallback.focus(); }
      }
    }, 50);
  };

  const onLoad = () => { win.removeEventListener("load", onLoad); requestAnimationFrame(() => requestAnimationFrame(doPrint)); };

  try {
    win.addEventListener("afterprint", cleanup);
    win.addEventListener("load", onLoad);
    setTimeout(() => {
      try { if (doc && doc.body && (doc.body.querySelector("table") || doc.body.querySelector("ul"))) doPrint(); } catch {}
    }, 300);
  } catch { doPrint(); }
}

function escapeHtml(v: unknown): string {
  return String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
