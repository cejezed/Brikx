import type { PveExportModel, PveRoom, PveWish, PveRisk, PveTechEntry } from "./exportModel";

const logoSvg = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 32"><rect width="120" height="32" rx="6" fill="#0f172a"/><text x="16" y="22" fill="#38bdf8" font-size="14" font-family="Arial, sans-serif" font-weight="700">BRIKX</text></svg>`
);
const logoDataUri = `data:image/svg+xml,${logoSvg}`;

const escapeHtml = (v: string) =>
  v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const formatCurrency = (n?: number) => (typeof n === "number" ? `€ ${n.toLocaleString("nl-NL")}` : "Niet ingevuld");
const formatRange = (range?: [number?, number?]) =>
  range && (range[0] || range[1])
    ? `${range[0] ? formatCurrency(range[0]) : "?"} – ${range[1] ? formatCurrency(range[1]) : "?"}`
    : "Niet ingevuld";

const renderList = (items: string[]) =>
  items.length === 0
    ? `<p class="muted">Niet ingevuld</p>`
    : `<ul class="bullet-list">${items.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`;

const renderRooms = (rooms: PveRoom[]) => {
  if (rooms.length === 0) {
    return `<p class="muted">Geen ruimtes gespecificeerd.</p>`;
  }
  return `
    <table class="data-table">
      <thead>
        <tr>
          <th style="width:40%">Ruimte</th>
          <th style="width:12%">Aantal</th>
          <th style="width:16%">Opp. (m²)</th>
          <th style="width:32%">Bijzonderheden</th>
        </tr>
      </thead>
      <tbody>
        ${rooms
      .map(
        (r) => `
          <tr>
            <td><strong>${escapeHtml(r.name)}</strong></td>
            <td class="center">${r.count ?? 1}</td>
            <td class="right">${typeof r.area === "number" ? r.area : "-"}</td>
            <td class="muted">${escapeHtml(r.notes || "Niet ingevuld")}</td>
          </tr>`
      )
      .join("")}
      </tbody>
    </table>
  `;
};

const renderWishes = (wishes: PveWish[]) => {
  if (wishes.length === 0) {
    return `<p class="muted">Nog geen wensen opgegeven.</p>`;
  }
  return `
    <table class="data-table">
      <thead>
        <tr>
          <th style="width:18%">Prioriteit</th>
          <th style="width:20%">Categorie</th>
          <th style="width:62%">Beschrijving</th>
        </tr>
      </thead>
      <tbody>
        ${wishes
      .map(
        (w) => `
            <tr>
              <td>${escapeHtml(w.priority || "Niet ingevuld")}</td>
              <td>${escapeHtml(w.category || "Niet ingevuld")}</td>
              <td>${escapeHtml(w.text)}</td>
            </tr>`
      )
      .join("")}
      </tbody>
    </table>
  `;
};

const renderTech = (entries: PveTechEntry[]) => {
  if (!entries.length) return `<p class="muted">Nog niet gespecificeerd.</p>`;
  return `
    <div class="pill-grid">
      ${entries
      .map(
        (e) => `
          <div class="pill">
            <div class="pill-label">${escapeHtml(e.label)}</div>
            <div class="pill-value">${escapeHtml(e.value)}</div>
          </div>`
      )
      .join("")}
    </div>
  `;
};

const renderRisks = (risks: PveRisk[]) => {
  if (!risks.length) return `<p class="muted">Nog geen risico's ingevoerd.</p>`;
  return risks
    .map(
      (r) => `
      <div class="card risk">
        <div class="risk-header">
          <strong>${escapeHtml(r.type)}</strong>
          <span class="badge">Risico</span>
        </div>
        <p>${escapeHtml(r.description)}</p>
        <p class="muted">Gevolg: ${escapeHtml(r.consequence || "Niet ingevuld")}</p>
        <p class="muted">Mitigatie: ${escapeHtml(r.mitigation || "Niet ingevuld")}</p>
      </div>`
    )
    .join("");
};

const baseStyles = `
  @page { margin: 0; }
  body { font-family: 'Arial', sans-serif; color: #0f172a; font-size: 12px; line-height: 1.6; margin: 0; }
  h1 { font-size: 28px; margin: 0 0 8px; }
  h2 { font-size: 16px; margin: 24px 0 8px; text-transform: uppercase; letter-spacing: 0.08em; }
  h3 { font-size: 13px; margin: 12px 0 6px; }
  p { margin: 0 0 10px; }
  .muted { color: #64748b; }
  .cover { padding: 120px 48px 64px 48px; background: linear-gradient(135deg, #0f172a 0%, #111827 50%, #0ea5e9 100%); color: #e2e8f0; }
  .cover-card { background: #0b1220; border: 1px solid #1f2937; border-radius: 12px; padding: 24px; }
  .chip { font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: #67e8f9; }
  .cover-title { font-size: 42px; font-weight: 800; margin: 12px 0; }
  .cover-meta { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 16px; }
  .meta-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
  .meta-value { font-size: 14px; font-weight: 700; color: #e2e8f0; }
  .logo { width: 120px; height: 32px; margin-bottom: 12px; }
  .section { margin-bottom: 16px; }
  .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; background: #fff; }
  .grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .bullet-list { padding-left: 16px; margin: 0; }
  .bullet-list li { margin-bottom: 6px; }
  .data-table { width: 100%; border-collapse: collapse; margin: 6px 0 10px; }
  .data-table th { background: #0f172a; color: #fff; font-size: 11px; text-align: left; padding: 8px; }
  .data-table td { border-bottom: 1px solid #e2e8f0; padding: 8px; font-size: 11px; vertical-align: top; }
  .data-table .center { text-align: center; }
  .data-table .right { text-align: right; }
  .pill-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; }
  .pill { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; background: #f8fafc; }
  .pill-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; margin-bottom: 4px; }
  .pill-value { font-size: 12px; font-weight: 600; color: #0f172a; }
  .badge { padding: 4px 8px; border-radius: 999px; background: #f1f5f9; color: #0f172a; font-size: 10px; }
  .risk { border-color: #f97316; background: #fff7ed; }
  .risk-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
  .budget { background: #0f172a; color: #e2e8f0; border-color: #0f172a; }
  .budget-highlight { font-size: 22px; font-weight: 800; color: #67e8f9; margin: 4px 0; }
  .next-steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; }
  .page { padding: 0 48px 12px 48px; }
`;

export function renderCoverHtml(model: PveExportModel): string {
  return `<!doctype html>
<html lang="nl">
<head>
  <meta charset="utf-8" />
  <title>PvE ${escapeHtml(model.projectName)}</title>
  <style>${baseStyles}</style>
</head>
<body>
  <section class="cover">
    <img src="${logoDataUri}" class="logo" />
    <div class="chip">Programma van Eisen</div>
    <div class="cover-title">${escapeHtml(model.projectName)}</div>
    <div class="cover-card">
      <h2 style="color:#e2e8f0; margin:0 0 12px;">Projectgegevens</h2>
      <div class="cover-meta">
        <div>
          <div class="meta-label">Projecttype</div>
          <div class="meta-value">${escapeHtml(model.projectType || "Niet ingevuld")}</div>
        </div>
        <div>
          <div class="meta-label">Locatie</div>
          <div class="meta-value">${escapeHtml(model.location || "Niet ingevuld")}</div>
        </div>
        <div>
          <div class="meta-label">Datum</div>
          <div class="meta-value">${escapeHtml(model.date)}</div>
        </div>
        <div>
          <div class="meta-label">Template</div>
          <div class="meta-value">${escapeHtml(model.templateVersion)}</div>
        </div>
      </div>
    </div>
  </section>
</body>
</html>`;
}

export function renderBodyHtml(model: PveExportModel): string {
  return `<!doctype html>
<html lang="nl">
<head>
  <meta charset="utf-8" />
  <title>PvE ${escapeHtml(model.projectName)}</title>
  <style>${baseStyles}</style>
</head>
<body>

  <section class="page">
    <h2>01. Context</h2>
    <div class="card">
      <p>${escapeHtml(model.context.description)}</p>
      <div class="grid-2">
        <div>
          <div class="muted" style="text-transform:uppercase; letter-spacing:0.05em;">Ervaring</div>
          <strong>${escapeHtml(model.context.experience)}</strong>
        </div>
        <div>
          <div class="muted" style="text-transform:uppercase; letter-spacing:0.05em;">Planning</div>
          <strong>${escapeHtml(model.context.planning)}</strong>
        </div>
      </div>
    </div>
  </section>

  <section class="page">
    <h2>02. Samenvatting Wensen</h2>
    <div class="card">
      ${renderList(model.summaryWishes)}
    </div>
  </section>

  <section class="page">
    <h2>03. Ruimtelijk Programma</h2>
    <div class="card">
      ${renderRooms(model.rooms)}
    </div>
  </section>

  <section class="page">
    <h2>04. MoSCoW Wensen</h2>
    <div class="card">
      ${renderWishes(model.wishes)}
    </div>
  </section>

  <section class="page">
    <h2>05. Budget</h2>
    <div class="card budget">
      <div class="muted">Indicatief budget</div>
      <div class="budget-highlight">${formatCurrency(model.budget.total)}</div>
      <div>Bandbreedte: ${formatRange(model.budget.range)}</div>
      <div>Eigen inbreng: ${formatCurrency(model.budget.ownContribution)}</div>
      <div>Buffer: ${formatCurrency(model.budget.contingency)}</div>
      <div class="muted" style="margin-top:6px;">${escapeHtml(model.budget.notes || "Nog geen notities toegevoegd.")}</div>
    </div>
  </section>

  <section class="page">
    <h2>06. Techniek & Duurzaamheid</h2>
    <div class="card">
      <h3>Techniek</h3>
      ${renderTech(model.techniek)}
      <h3 style="margin-top:12px;">Duurzaamheid</h3>
      ${renderTech(model.duurzaam)}
    </div>
  </section>

  <section class="page">
    <h2>07. Risico's</h2>
    ${renderRisks(model.risks)}
  </section>

  <section class="page">
    <h2>08. Vervolgstappen</h2>
    <div class="next-steps">
      ${model.nextSteps
      .map(
        (step) => `
        <div class="card">
          <p>${escapeHtml(step)}</p>
        </div>`
      )
      .join("")}
    </div>
  </section>
</body>
</html>`;
}

export function renderHeaderTemplate(model: PveExportModel): string {
  return `
  <style>
    * { box-sizing: border-box; }
    .pdf-header { 
      font-family: Arial, sans-serif; 
      font-size: 10px; 
      color: #0f172a; 
      width: 100%; 
      padding: 0 48px;
    }
    .pdf-header .row { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      border-bottom: 1px solid #e2e8f0; 
      padding: 10px 0; 
      width: 100%;
    }
    .pdf-header img { width: 80px; height: 24px; flex-shrink: 0; }
    .title { 
      font-weight: 700; 
      font-size: 10px; 
      text-transform: uppercase; 
      letter-spacing: 0.05em; 
      margin-left: 20px;
      text-align: right;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  </style>
  <div class="pdf-header">
    <div class="row">
      <img src="${logoDataUri}" />
      <div class="title">Programma van Eisen · ${escapeHtml(model.projectName)}</div>
    </div>
  </div>`;
}

export function renderFooterTemplate(): string {
  return `
  <style>
    * { box-sizing: border-box; }
    .pdf-footer { 
      font-family: Arial, sans-serif; 
      font-size: 9px; 
      color: #71717a; 
      width: 100%; 
      padding: 0 48px;
    }
    .pdf-footer .row { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      border-top: 1px solid #e2e8f0; 
      padding: 10px 0; 
      width: 100%;
    }
    .disclaimer { font-style: italic; opacity: 0.8; }
    .page-info { font-weight: bold; }
  </style>
  <div class="pdf-footer">
    <div class="row">
      <div class="disclaimer">Disclaimer: indicatief PvE gegenereerd door Brikx Coaching Software.</div>
      <div class="page-info">Pagina <span class="pageNumber"></span></div>
    </div>
  </div>`;
}
