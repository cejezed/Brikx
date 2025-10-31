// /lib/ai/ProModel.ts
import type { WritableStreamDefaultWriter } from "stream/web";
import type { ChapterKey, PatchEvent as PatchFromStore } from "@/lib/stores/useWizardState";
import { llmSuggest } from "@/lib/ai/llm";

// ---------- Types ----------
export type PatchEvent = PatchFromStore;
type ChatSSEEventName = "metadata" | "patch" | "navigate" | "stream" | "error" | "done";

type WizardStateShape = {
  triage?: any;
  chapterAnswers?: {
    basis?: Record<string, any>;
    wensen?: any[];
    budget?: Record<string, any>;
    ruimtes?: any[];
    techniek?: Record<string, any>;
    duurzaamheid?: Record<string, any>;
    risico?: Record<string, any>;
  };
};

type Intent = "NAVIGATIE" | "VULLEN_DATA" | "ADVIES_VRAAG" | "SMALLTALK";

// ---------- low-level SSE helpers ----------
async function write(writer: WritableStreamDefaultWriter, event: ChatSSEEventName, data: any) {
  const payload = typeof data === "string" ? data : JSON.stringify(data);
  await writer.write(`event: ${event}\n` + `data: ${payload}\n\n`);
}
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---------- A) Essentials / Nudge ----------
function essentialsMissing(ws: WizardStateShape): { missing: string[]; ok: boolean } {
  const missing: string[] = [];
  const basis = ws?.chapterAnswers?.basis ?? {};
  if (!basis.projectNaam || String(basis.projectNaam).trim() === "") {
    missing.push("basis.projectNaam");
  }
  // Uitbreiden kan later met extra essentials (locatie, bewoners, etc.)
  return { missing, ok: missing.length === 0 };
}

// ✅ Context-bewuste nudge: query wordt meegenomen
async function sendNudgeForEssentials(
  writer: WritableStreamDefaultWriter,
  missing: string[],
  query: string
) {
  await write(writer, "metadata", {
    intent: "ASK_ESSENTIALS",
    policy: "ASK_CLARIFY",
    essentials: missing,
  });

  const txt =
    `Ik wil **"${query}"** voor je verwerken. ` +
    `Maar voor ik dat kan doen mis ik nog ${missing.join(", ")}. ` +
    `Mag ik eerst de **projectNaam** noteren? (Bijv.: \`projectnaam Villa Dijk\`)`;

  await write(writer, "stream", { text: txt });
}

// ---------- B) Classify ----------
function classifyIntent(q: string): Intent {
  const s = q.toLowerCase();
  if (s.startsWith("ga naar ") || s.startsWith("open ")) return "NAVIGATIE";
  if (
    /^projectnaam\s+/i.test(q) ||
    /^locatie\s+/i.test(q) ||
    /^adres\s+/i.test(q) ||
    /^bewoners?\s+/i.test(q) ||
    /^oppervlakte\s+/i.test(q) ||
    /^budget\s+/i.test(q) ||
    /^bandbreedte\s+/i.test(q) ||
    /^eigen\s*inbreng\s+/i.test(q) ||
    /\bsl[aá]apkamer/.test(s) ||
    /\bwoonkamer/.test(s) ||
    /\bkeuken/.test(s) ||
    /\bbadkamer/.test(s) ||
    /\b(\d+)\s*(m2|m²)\b/.test(s) ||
    /^\s*±?\s*\d+(\,\d+|\.\d+)?\s*(m2|m²)?\s*$/i.test(q.trim())
  ) return "VULLEN_DATA";
  if (s.startsWith("hoe ") || s.startsWith("waarom ") || s.startsWith("wat ")) return "ADVIES_VRAAG";
  return "SMALLTALK";
}

// ---------- helpers voor deterministische parsing ----------
function parseEuro(n: string): number | null {
  const k = /k/i.test(n);
  const digits = n.replace(/[^\d]/g, "");
  if (!digits) return null;
  const base = Number(digits);
  return k ? base * 1000 : base;
}
function firstNumber(txt: string): number | null {
  const m = txt.match(/(\d+(?:[.,]\d+)?)/);
  if (!m) return null;
  const val = Number(m[1].replace(",", "."));
  return Number.isFinite(val) ? val : null;
}
function looksLikeAreaOnly(q: string): number | null {
  const clean = q.trim().toLowerCase();
  const onlyNum = clean.match(/^±?\s*(\d+(?:[.,]\d+)?)\s*$/);
  const withM2  = clean.match(/^±?\s*(\d+(?:[.,]\d+)?)\s*m(?:[\^]?\s*2|2|²)?\s*$/);
  const g = withM2 || onlyNum;
  if (!g) return null;
  const n = Number(g[1].replace(",", "."));
  if (!Number.isFinite(n)) return null;
  return Math.round(n);
}
function extractM2NearKeyword(full: string, keyword: string): number | undefined {
  const s = full.toLowerCase();
  const k = keyword.toLowerCase();
  const idx = s.indexOf(k);
  if (idx === -1) return undefined;
  const start = Math.max(0, idx - 25);
  const end = Math.min(s.length, idx + k.length + 25);
  const window = s.slice(start, end);
  const m = window.match(/(\d+(?:[.,]\d+)?)\s*m(?:[\^]?\s*2|2|²)?/);
  const n = m ? Number(m[1].replace(",", ".")) : firstNumber(window);
  if (n == null || !Number.isFinite(n)) return undefined;
  return Math.round(n);
}
function mkRoom(name: string, m2?: number) {
  return { name, type: name.toLowerCase(), group: "", m2: typeof m2 === "number" ? m2 : "", wensen: [] as string[] };
}

// ---------- D) Nuggets / RAG stub ----------
async function nuggetsAdvice(query: string, writer: WritableStreamDefaultWriter) {
  await write(writer, "metadata", { intent: "ADVIES_VRAAG", policy: "RAG" });
  const q = query.toLowerCase();

  if (q.includes("stille slaapkamer") || q.includes("geluid") || q.includes("akoestiek")) {
    const answer = [
      "🔇 **Stille slaapkamer – kernpunten**:",
      "• Plaats de slaapkamer aan de tuinzijde i.p.v. straatzijde waar mogelijk.",
      "• Kies dichte binnendeuren met valdorpel; voeg kierdichting toe.",
      "• Gevel: HR++(+) of geluidswerend glas bij drukke weg; let op juiste spouw.",
      "• Vermijd doorlopende harde vloeren; demp met ondervloer of zoneer tapijt.",
      "• Ventilatie: CO₂/vocht-gestuurd, fluisterstil (≤25 dB(A)), geen roosters direct boven bed.",
    ].join("\n");
    for (const chunk of answer.split(" ")) {
      await write(writer, "stream", { text: chunk + " " });
      await delay(6);
    }
    return;
  }

  const def = "Ik geef je graag advies, maar kun je je vraag iets concreter maken (onderwerp of kamer)?";
  for (const w of def.split(" ")) { await write(writer, "stream", { text: w + " " }); await delay(6); }
}

// ---------- C) VULLEN_DATA – deterministisch + LLM-tool ----------
async function fillDataAndEmit(
  writer: WritableStreamDefaultWriter,
  raw: string,
  ws: WizardStateShape
) {
  const q = raw.toLowerCase();
  const patches: PatchEvent[] = [];
  let navigate: ChapterKey | null = null;

  // Basis – vrije m²
  const free = looksLikeAreaOnly(raw);
  if (free != null) {
    patches.push({ chapter: "basis", delta: { path: "oppervlakteM2", operation: "set", value: free } });
    navigate = "basis";
  }
  // Basis – expliciet
  if (/^projectnaam\s+/i.test(raw)) {
    const v = raw.replace(/^projectnaam\s+/i, "").trim();
    if (v) { patches.push({ chapter: "basis", delta: { path: "projectNaam", operation: "set", value: v } }); navigate = "basis"; }
  }
  if (/^(locatie|adres)\s+/i.test(raw)) {
    const v = raw.replace(/^(locatie|adres)\s+/i, "").trim();
    if (v) { patches.push({ chapter: "basis", delta: { path: "locatie", operation: "set", value: v } }); navigate = "basis"; }
  }
  if (/^oppervlakte\s+/i.test(raw)) {
    const n = firstNumber(raw.replace(/^oppervlakte\s+/i, ""));
    if (n != null) { patches.push({ chapter: "basis", delta: { path: "oppervlakteM2", operation: "set", value: Math.round(n) } }); navigate = "basis"; }
  }
  if (/^bewoners?\s+/i.test(raw)) {
    const n = firstNumber(raw.replace(/^bewoners?\s+/i, ""));
    if (n != null) { patches.push({ chapter: "basis", delta: { path: "bewonersAantal", operation: "set", value: Math.round(n) } }); navigate = "basis"; }
  }

  // Budget
  if (/^budget\s+/i.test(raw)) {
    const n = parseEuro(raw.replace(/^budget\s+/i, ""));
    if (n != null) { patches.push({ chapter: "budget", delta: { path: "budgetTotaal", operation: "set", value: n } }); navigate = "budget"; }
  }
  if (/^bandbreedte\s+/i.test(raw)) {
    const rest = raw.replace(/^bandbreedte\s+/i, "");
    const parts = rest.split(/[–-]|tot/i).map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const min = parseEuro(parts[0]); const max = parseEuro(parts[1]);
      if (min != null || max != null) {
        patches.push({ chapter: "budget", delta: { path: "bandbreedte", operation: "set", value: [min ?? null, max ?? null] } });
        navigate = "budget";
      }
    }
  }
  if (/^eigen\s*inbreng\s+/i.test(raw)) {
    const n = parseEuro(raw.replace(/^eigen\s*inbreng\s+/i, ""));
    patches.push({ chapter: "budget", delta: { path: "eigenInbreng", operation: "set", value: n } });
    navigate = "budget";
  }

  // Ruimtes
  const addRoom = (name: string, m2?: number) => patches.push({ chapter: "ruimtes", delta: { path: "", operation: "add", value: mkRoom(name, m2) } });
  const mBed = q.match(/(\d+)\s*sl[aá]apkamer/);
  if (mBed) {
    const count = Math.max(1, parseInt(mBed[1], 10));
    for (let i = 0; i < count; i++) addRoom("Slaapkamer");
    navigate = "ruimtes";
  }
  if (q.includes("woonkamer")) {
    addRoom("Woonkamer", extractM2NearKeyword(raw, "woonkamer"));
    navigate = "ruimtes";
  }
  if (q.includes("keuken")) {
    if (q.includes("daglicht") || q.includes("licht") || q.includes("lichtkoepel") || q.includes("raam")) {
      const wish =
        /lichtkoepel/.test(q) ? "Lichtkoepel" :
        /daglicht/.test(q) ? "Daglicht" :
        /raam/.test(q) ? "Extra raam" : "Meer daglicht";
      patches.push({ chapter: "ruimtes", delta: { path: "byName:Keuken.wensen", operation: "add", value: wish } });
      navigate = "ruimtes";
    } else {
      addRoom("Keuken", extractM2NearKeyword(raw, "keuken"));
      navigate = "ruimtes";
    }
  }
  if (q.includes("badkamer")) {
    addRoom("Badkamer", extractM2NearKeyword(raw, "badkamer"));
    navigate = "ruimtes";
  }

  if (patches.length) {
    await write(writer, "metadata", { intent: "VULLEN_DATA", policy: "APPLY_OPTIMISTIC", source: "RULES" });
    for (const p of patches) await write(writer, "patch", p);
    if (navigate) await write(writer, "navigate", { chapter: navigate });
    await write(writer, "stream", { text: "Ik heb dit genoteerd in de wizard. " });
    return;
  }

  // ---------- Geen deterministische match → LLM as tool ----------
  const llm = await llmSuggest(raw, ws);
  if (llm?.patches?.length) {
    await write(writer, "metadata", { intent: "VULLEN_DATA", policy: "APPLY_WITH_INLINE_VERIFY", source: "LLM_TOOL" });
    for (const p of llm.patches) await write(writer, "patch", p);
    const nav = (llm.navigate as ChapterKey | null) ?? (llm.patches[0]?.chapter as ChapterKey);
    if (nav) await write(writer, "navigate", { chapter: nav });
    const reply = llm.reply || "Ik heb dit toegevoegd.";
    for (const w of reply.split(" ")) { await write(writer, "stream", { text: w + " " }); await delay(6); }
    return;
  }

  // LLM gaf ook niets bruikbaars → vraag verduidelijking
  await write(writer, "metadata", { intent: "ASK_CLARIFY", policy: "ASK_CLARIFY" });
  const clar = llm?.reply || "Wat wil je precies invullen (bijv. ‘woonkamer 30 m2’ of ‘bandbreedte 250k–300k’)?";
  for (const w of clar.split(" ")) { await write(writer, "stream", { text: w + " " }); await delay(6); }
}

// ---------- E) Smalltalk ----------
async function smalltalk(writer: WritableStreamDefaultWriter, q: string) {
  await write(writer, "metadata", { intent: "SMALLTALK", policy: "RESPOND" });
  const t = `Ik heb "${q}" ontvangen. Waarmee zal ik beginnen: basis, budget of ruimtes?`;
  for (const w of t.split(" ")) { await write(writer, "stream", { text: w + " " }); await delay(6); }
}

// ---------- Public API ----------
export const ProModel = {
  async runTriage(writer: WritableStreamDefaultWriter, query: string, wizardState: WizardStateShape) {
    const start = Date.now();
    const raw = String(query ?? "");
    const q = raw.trim();

    // A) Essentials (context-bewuste nudge met query echo)
    const ess = essentialsMissing(wizardState);
    if (!ess.ok) {
      await sendNudgeForEssentials(writer, ess.missing, raw);
      await write(writer, "done", { latencyMs: Date.now() - start });
      return;
    }

    // B) Classify
    const intent = classifyIntent(q);
    await write(writer, "metadata", { intent, policy: "CLASSIFIED" });

    // Navigatie
    if (intent === "NAVIGATIE") {
      const key = q.toLowerCase().replace(/^ga naar\s+|^open\s+/i, "").trim();
      const map: Record<string, ChapterKey> = {
        basis: "basis", budget: "budget", ruimtes: "ruimtes", wensen: "wensen",
        techniek: "techniek", duurzaamheid: "duurzaamheid", risico: "risico", preview: "preview",
      };
      const ch = map[key];
      if (ch) {
        await write(writer, "navigate", { chapter: ch });
        await write(writer, "stream", { text: `Ik open **${ch}**. ` });
      } else {
        await write(writer, "stream", { text: "Welk hoofdstuk wil je openen? (basis, budget, ruimtes…)" });
      }
      await write(writer, "done", { latencyMs: Date.now() - start });
      return;
    }

    // VULLEN_DATA
    if (intent === "VULLEN_DATA") {
      await fillDataAndEmit(writer, raw, wizardState);
      await write(writer, "done", { latencyMs: Date.now() - start });
      return;
    }

    // ADVIES_VRAAG
    if (intent === "ADVIES_VRAAG") {
      await nuggetsAdvice(raw, writer);
      await write(writer, "done", { latencyMs: Date.now() - start });
      return;
    }

    // SMALLTALK
    await smalltalk(writer, raw);
    await write(writer, "done", { latencyMs: Date.now() - start });
  }
};
