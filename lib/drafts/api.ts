// lib/drafts/api.ts
// Build v2.0 — drafts API helpers (frontend). Defensief & store-los waar mogelijk.

import { useWizardState } from "@/lib/stores/useWizardState";

/** ===== Types ===== */
export type Archetype =
  | "nieuwbouw"
  | "verbouwing"
  | "aanbouw"
  | "renovatie"
  | "interieur"
  | string;

export type DraftRow = {
  id: string;
  title: string;
  updated_at: string;   // ISO string
  created_at?: string;  // ISO string
};

export type DraftPayload = {
  triage: Record<string, any> | undefined;
  archetype: Archetype | null;
  chapterFlow: string[];
  currentChapter: string | null;
  chapterAnswers: Record<string, any>;
  stateVersion?: number;
};

/** ===== Local helpers ===== */
function inferArchetypeFromTriage(triage: any): Archetype | null {
  if (triage && typeof triage.archetype === "string" && triage.archetype.trim()) {
    return triage.archetype as Archetype;
  }
  const pt = triage?.projectType;
  const list: string[] = Array.isArray(pt) ? pt : pt ? [pt] : [];
  for (const v of list) {
    const k = String(v).toLowerCase();
    if (["nieuwbouw", "verbouwing", "aanbouw", "renovatie", "interieur"].includes(k)) {
      return k as Archetype;
    }
  }
  return null;
}

/** Bouw een payload uit de huidige wizard-store (defensief). */
export function buildDraftPayload(): DraftPayload {
  const s = useWizardState.getState() as any;

  const triage = s?.triage;
  const archetype = inferArchetypeFromTriage(triage);

  return {
    triage,
    archetype,
    chapterFlow: Array.isArray(s?.chapterFlow) ? s.chapterFlow : [],
    currentChapter: typeof s?.currentChapter === "string" ? s.currentChapter : null,
    chapterAnswers: (s?.chapterAnswers as Record<string, any>) ?? {},
    stateVersion: typeof s?.stateVersion === "number" ? s.stateVersion : undefined,
  };
}

/** ===== Network helpers (verwacht bestaande Next.js API routes) ===== */
/** Lijst alle drafts in de huidige (anonieme) sessie. */
export async function listDrafts(endpoint = "/api/drafts/list"): Promise<DraftRow[]> {
  const res = await fetch(endpoint, { method: "GET" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`listDrafts failed: ${res.status} ${res.statusText} ${text}`);
  }
  const rows = (await res.json().catch(() => [])) as DraftRow[];
  return Array.isArray(rows) ? rows : [];
}

/** Genereer payload en sla op; retourneert de aangemaakte/gewijzigde row. */
export async function saveCurrentWizardAsDraft(
  title?: string,
  endpoint = "/api/drafts/save"
): Promise<DraftRow> {
  const payload = buildDraftPayload();

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, payload }),
    keepalive: true,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`saveDraft failed: ${res.status} ${res.statusText} ${text}`);
  }
  // backend mag DraftRow of {row: DraftRow} teruggeven – beide ondersteunen
  const data = await res.json().catch(() => ({}));
  const row: DraftRow = (data?.row ?? data) as DraftRow;
  if (!row || !row.id) throw new Error("saveDraft: ongeldige serverrespons");
  return row;
}

/** Verwijder een draft op id. */
export async function deleteDraft(id: string, endpoint = "/api/drafts/delete"): Promise<void> {
  const url = `${endpoint}?id=${encodeURIComponent(id)}`;
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`deleteDraft failed: ${res.status} ${res.statusText} ${text}`);
  }
}

/** Hernoem een draft. */
export async function updateDraft(
  id: string,
  title: string,
  endpoint = "/api/drafts/update"
): Promise<void> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, title }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`updateDraft failed: ${res.status} ${res.statusText} ${text}`);
  }
}

/** Laad een draftpayload en zet ‘m terug in de wizard-store. */
export async function loadDraftIntoWizard(
  id: string,
  endpoint = "/api/drafts/load"
): Promise<DraftPayload> {
  const url = `${endpoint}?id=${encodeURIComponent(id)}`;
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`loadDraft failed: ${res.status} ${res.statusText} ${text}`);
  }
  const payload = (await res.json().catch(() => ({}))) as Partial<DraftPayload>;

  // Defensieve toepassing op de store
  const store = useWizardState.getState() as any;
  const patchTriage = store?.patchTriage as ((d: Record<string, any>) => void) | undefined;
  const patchChapterAnswer = store?.patchChapterAnswer as
    | ((chapter: string, delta: Record<string, any>) => void)
    | undefined;
  const goToChapter = store?.goToChapter as ((ch: string) => void) | undefined;
  const setChapterFlow = store?.setChapterFlow as ((flow: string[]) => void) | undefined;

  if (payload.triage && typeof patchTriage === "function") {
    patchTriage(payload.triage);
  }
  if (payload.chapterAnswers && typeof patchChapterAnswer === "function") {
    for (const [chapter, delta] of Object.entries(payload.chapterAnswers)) {
      patchChapterAnswer(chapter, delta as Record<string, any>);
    }
  }
  if (Array.isArray(payload.chapterFlow) && typeof setChapterFlow === "function") {
    setChapterFlow(payload.chapterFlow);
  }
  if (payload.currentChapter && typeof goToChapter === "function") {
    goToChapter(payload.currentChapter);
  }

  // Geef een volledig, veilige payload terug aan de aanroeper
  return {
    triage: payload.triage ?? {},
    archetype: payload.archetype ?? inferArchetypeFromTriage(payload.triage) ?? null,
    chapterFlow: Array.isArray(payload.chapterFlow) ? payload.chapterFlow : [],
    currentChapter:
      typeof payload.currentChapter === "string" ? payload.currentChapter : null,
    chapterAnswers: payload.chapterAnswers ?? {},
    stateVersion:
      typeof payload.stateVersion === "number" ? payload.stateVersion : undefined,
  };
}

/** Eenvoudige helpers die je evt. elders nog gebruikt (compat-laag) */
export async function saveDraft(endpoint = "/api/drafts/save") {
  const row = await saveCurrentWizardAsDraft(undefined, endpoint);
  return { id: row.id, ok: true };
}

export async function loadDraft(endpoint = "/api/drafts/load") {
  // zonder id heeft dit weinig zin; bewaar voor backward-compat als noop
  const res = await fetch(endpoint, { method: "GET" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`loadDraft failed: ${res.status} ${res.statusText} ${text}`);
  }
  return (await res.json().catch(() => ({}))) as Partial<DraftPayload>;
}
