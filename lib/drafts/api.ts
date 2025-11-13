// /lib/drafts/api.ts
// ============================================================================
// BRIKX Build v3.1 – Drafts API helpers (authenticated)
// - Gebruikt WizardState als bron van waarheid
// - Vereist dat backend endpoints userId uit sessie halen
// - Geen v2-legacy, geen any-magic
// ============================================================================

"use client";

import { useWizardState } from "@/lib/stores/useWizardState";
import type {
  WizardState,
  ChapterKey,
  ChapterDataMap,
} from "@/types/project";

export type DraftRow = {
  id: string;
  title: string;
  updated_at: string; // ISO
  created_at?: string;
};

// Wat we naar de server sturen
export type DraftPayload = {
  wizardState: Partial<WizardState>;
};

// ─────────────────────────────────────────────────────────────
// Snapshot van de huidige wizard-state
// ─────────────────────────────────────────────────────────────

function buildWizardSnapshot(): Partial<WizardState> {
  const s = useWizardState.getState();
  return {
    stateVersion: s.stateVersion,
    chapterAnswers: s.chapterAnswers,
    currentChapter: s.currentChapter,
    chapterFlow: s.chapterFlow,
    mode: s.mode,
    triage: s.triage,
  };
}

export function buildDraftPayload(): DraftPayload {
  return { wizardState: buildWizardSnapshot() };
}

// ─────────────────────────────────────────────────────────────
// API calls (verwachten AUTH op backend)
// ─────────────────────────────────────────────────────────────

export async function listDrafts(
  endpoint = "/api/drafts/list"
): Promise<DraftRow[]> {
  const res = await fetch(endpoint, { method: "GET" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `listDrafts failed: ${res.status} ${res.statusText} ${text}`
    );
  }
  const rows = (await res.json().catch(() => [])) as DraftRow[];
  return Array.isArray(rows) ? rows : [];
}

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
    throw new Error(
      `saveDraft failed: ${res.status} ${res.statusText} ${text}`
    );
  }

  const data = await res.json().catch(() => ({}));
  const row: DraftRow = (data?.row ?? data) as DraftRow;

  if (!row || !row.id) {
    throw new Error("saveDraft: ongeldige serverrespons");
  }

  return row;
}

export async function deleteDraft(
  id: string,
  endpoint = "/api/drafts/delete"
): Promise<void> {
  const url = `${endpoint}?id=${encodeURIComponent(id)}`;
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `deleteDraft failed: ${res.status} ${res.statusText} ${text}`
    );
  }
}

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
    throw new Error(
      `updateDraft failed: ${res.status} ${res.statusText} ${text}`
    );
  }
}

// ─────────────────────────────────────────────────────────────
// Draft laden -> wizard-store vullen
// ─────────────────────────────────────────────────────────────

export async function loadDraftIntoWizard(
  id: string,
  endpoint = "/api/drafts/load"
): Promise<DraftPayload> {
  const url = `${endpoint}?id=${encodeURIComponent(id)}`;
  const res = await fetch(url, { method: "GET" });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `loadDraft failed: ${res.status} ${res.statusText} ${text}`
    );
  }

  const raw = await res.json().catch(() => ({} as any));

  const payload: DraftPayload =
    "wizardState" in raw
      ? (raw as DraftPayload)
      : { wizardState: raw as Partial<WizardState> };

  const { wizardState } = payload;
  const store = useWizardState.getState();

  // Reset eerst naar een schone basis
  store.reset();

  // Triages & meta
  if (wizardState.triage) {
    store.setTriage(wizardState.triage);
  }

  if (Array.isArray(wizardState.chapterFlow)) {
    store.setChapterFlow(
      wizardState.chapterFlow as ChapterKey[]
    );
  }

  if (
    wizardState.chapterAnswers &&
    typeof wizardState.chapterAnswers === "object"
  ) {
    const answers =
      wizardState.chapterAnswers as Partial<ChapterDataMap>;
    for (const [chapter, data] of Object.entries(answers)) {
      if (!data) continue;
      store.updateChapterData(
        chapter as ChapterKey,
        () => data as any
      );
    }
  }

  if (wizardState.currentChapter) {
    store.setCurrentChapter(
      wizardState.currentChapter as ChapterKey
    );
  }

  if (wizardState.mode) {
    store.setMode(wizardState.mode);
  }

  return payload;
}

// Optionele korte helpers
export async function saveDraft(endpoint = "/api/drafts/save") {
  const row = await saveCurrentWizardAsDraft(undefined, endpoint);
  return { id: row.id, ok: true };
}
