// lib/export/print.ts
// Print pas na load + animation frame om lege pagina's te voorkomen.

import type { BuildPreview } from "@/lib/preview/buildPreview";

export function printPreviewToPdf(preview: BuildPreview) {
  // 1) Maak een onzichtbare iframe
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) {
    console.warn("[printPreviewToPdf] geen document in iframe");
    return;
  }

  // 2) Basale print CSS + simpele lay-out
  const css = `
    * { box-sizing: border-box; }
    @page { size: A4; margin: 18mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; color: #0b0b0b; }
    h1 { font-size: 22px; margin: 0 0 4mm; color: #0d3d4d; }
    h2 { font-size: 16px; margin: 8mm 0 3mm; color: #0d3d4d; }
    h3 { font-size: 13px; margin: 5mm 0 2mm; color: #0d3d4d; }
    .muted { color: #666; font-size: 11px; }
    .section { margin: 5mm 0; break-inside: avoid; }
    .kv { display: grid; grid-template-columns: 38mm 1fr; gap: 2mm 6mm; font-size: 12px; }
    .kv div { padding: 1mm 0; }
    ul { padding-left: 5mm; margin: 0; }
    li { margin: 1mm 0; font-size: 12px; }
    .hr { border-top: 1px solid #e5e7eb; margin: 6mm 0; }
    .footer { position: fixed; bottom: 10mm; left: 18mm; right: 18mm; text-align: center; font-size: 10px; color: #888; }
    .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%) rotate(-25deg); font-size: 56px; color: #e0e0e0; opacity: .35; pointer-events: none; }
  `;

  const html = `
    <!doctype html>
    <html lang="nl">
      <head>
        <meta charset="utf-8" />
        <title>Brikx • PvE Preview</title>
        <style>${css}</style>
      </head>
      <body>
        <div id="root">
          <header class="section">
            <h1>Programma van Eisen – Preview</h1>
            <div class="muted">Gegenereerd door Brikx • ${new Date().toLocaleDateString("nl-NL")}</div>
          </header>

          <section class="section">
            <h2>1. Projectbasis</h2>
            <div class="kv">
              <div class="muted">Projecttype</div><div>${esc(preview.summary.projectType) || "—"}</div>
              <div class="muted">Urgentie</div><div>${esc(preview.summary.urgentie) || "—"}</div>
              <div class="muted">Budget</div><div>${esc(preview.summary.budget) || "—"}</div>
              <div class="muted">Intentie</div><div>${esc(preview.summary.intent) || "—"}</div>
              <div class="muted">Ervaring</div><div>${esc(preview.summary.ervaring) || "—"}</div>
            </div>
          </section>

          <section class="section">
            <h2>2. Ruimtes (${preview.ruimtes.length})</h2>
            ${preview.ruimtes.length === 0
              ? `<div class="muted">Nog geen ruimtes toegevoegd.</div>`
              : `<ul>${preview.ruimtes.map(r => `<li>${esc(r.type || "—")}${r.tag ? ` <span class="muted">(${esc(r.tag)})</span>` : ""}</li>`).join("")}</ul>`
            }
          </section>

          <section class="section">
            <h2>3. Wensen & Prioriteiten (MoSCoW)</h2>
            ${preview.wensen.length === 0
              ? `<div class="muted">Nog geen wensen toegevoegd.</div>`
              : `<ul>${preview.wensen.map(w => `<li>${esc(w.label)}${w.priority ? ` — <span class="muted">${prio( String(w.priority) )}</span>` : ""}</li>`).join("")}</ul>`
            }
          </section>

          ${preview.techniek && Object.keys(preview.techniek).length
            ? `
              <section class="section">
                <h2>4. Techniek & Installaties</h2>
                <ul>
                  ${Object.entries(preview.techniek).map(([k,v]) => v ? `<li><strong>${esc(k)}:</strong> ${esc(String(v))}</li>` : "").join("")}
                </ul>
              </section>
            `
            : ""
          }

          ${preview.duurzaamheid && Object.keys(preview.duurzaamheid).length
            ? `
              <section class="section">
                <h2>5. Duurzaamheid</h2>
                <ul>
                  ${Object.entries(preview.duurzaamheid).map(([k,v]) => v ? `<li><strong>${esc(k)}:</strong> ${esc(String(v))}</li>` : "").join("")}
                </ul>
              </section>
            `
            : ""
          }

          ${preview.remarks.length
            ? `
              <section class="section">
                <h2>6. Aandachtspunten & Toelichting</h2>
                <ul>
                  ${preview.remarks.map(t => `<li>${esc(t)}</li>`).join("")}
                </ul>
              </section>
            `
            : ""
          }

          <div class="hr"></div>
          <div class="footer">Brikx • Slim bouwen zonder spijt • www.brikx.nl</div>
        </div>
        <script>
          // Wacht op layout, dan print
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              try { window.focus(); window.print(); } catch (e) {}
              setTimeout(() => window.close(), 100);
            });
          });
        </script>
      </body>
    </html>
  `;

  // 3) Schrijf document en print
  doc.open();
  doc.write(html);
  doc.close();
}

/** ===== Helpers ===== */
function esc(s: string) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ✅ v3.14/v3.15: MoSCoW priority labels (consistent met lib/pve/wishPriority.ts)
function prio(p?: string) {
  switch (p) {
    case "must": return "Must-have";
    case "nice": return "Nice-to-have";
    case "optional": return "Optioneel / later";
    case "wont": return "Absoluut niet"; // ✅ v3.15
    case "future": return "Toekomst";
    case "unknown": return "Weet ik nog niet / n.v.t.";
    default: return "—";
  }
}
