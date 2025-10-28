"use client";

import { supabase } from "@/lib/supabase/client";
import { useWizardState } from "@/lib/stores/useWizardState";

export type DraftRow = {
  id: string;
  user_id: string;
  title: string;
  payload: any;
  status: "draft" | "submitted";
  created_at: string;
  updated_at: string;
};

export async function listDrafts(): Promise<DraftRow[]> {
  const { data, error } = await supabase
    .from("wizard_drafts")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data as DraftRow[];
}

export async function saveCurrentWizardAsDraft(title?: string): Promise<DraftRow> {
  const s = useWizardState.getState();
  const { data: user } = await supabase.auth.getUser();

  const payload = {
    triage: s.triage,
    archetype: s.archetype,
    chapterFlow: s.chapterFlow,
    currentChapter: s.currentChapter,
    chapterAnswers: s.chapterAnswers,
    mode: s.mode,
    tier: s.tier,
  };

  const row = {
    user_id: user.user?.id!,
    title: title?.trim() || defaultTitle(payload),
    payload,
    status: "draft" as const,
  };

  const { data, error } = await supabase.from("wizard_drafts").insert(row).select().single();
  if (error) throw error;
  return data as DraftRow;
}

export async function updateDraft(id: string, title: string, payload?: any): Promise<DraftRow> {
  const patch: Partial<DraftRow> = { title };
  if (payload) patch.payload = payload;
  const { data, error } = await supabase
    .from("wizard_drafts")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as DraftRow;
}

export async function deleteDraft(id: string): Promise<void> {
  const { error } = await supabase.from("wizard_drafts").delete().eq("id", id);
  if (error) throw error;
}

export async function loadDraftIntoWizard(id: string): Promise<void> {
  const { data, error } = await supabase.from("wizard_drafts").select("*").eq("id", id).single();
  if (error) throw error;

  const payload = (data as DraftRow).payload;
  const s = useWizardState.getState();

  s.setTriage(payload.triage);
  s.setArchetype(payload.archetype);
  s.setChapterFlow(payload.chapterFlow);
  s.goToChapter(payload.currentChapter);
  Object.entries(payload.chapterAnswers || {}).forEach(([k, v]) => s.setChapterAnswer(k as any, v));
  s.setMode(payload.mode);
}

function defaultTitle(payload: any) {
  const base = payload?.triage?.projectType ? String(payload.triage.projectType) : "Concept";
  const ts = new Date().toLocaleString("nl-NL");
  return `${base} – ${ts}`;
}
