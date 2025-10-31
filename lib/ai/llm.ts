// /lib/ai/llm.ts
import OpenAI from "openai";
import type { ChapterKey } from "@/lib/stores/useWizardState";

export type LlmPatch = {
  chapter: ChapterKey;
  delta: { path: string; operation: "add" | "set" | "append" | "remove"; value?: any };
};
export type LlmResult = {
  patches?: LlmPatch[];
  navigate?: ChapterKey | null;
  reply?: string;
};

const KNOWN_CHAPTERS: ChapterKey[] = [
  "basis", "wensen", "budget", "ruimtes", "techniek", "duurzaamheid", "risico", "preview",
];

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function clampChapter(ch?: string | null): ChapterKey | null {
  if (!ch) return null;
  const c = ch.trim().toLowerCase() as ChapterKey;
  return (KNOWN_CHAPTERS as string[]).includes(c) ? (c as ChapterKey) : null;
}

export async function llmSuggest(
  query: string,
  wizardState: any
): Promise<LlmResult | null> {
  const system = [
    "Je bent een tool binnen de AI-First Triage van Brikx (Build v2.0).",
    "Je output is ÉÉN JSON-object met velden: patches[], navigate, reply.",
    "patches[] item:",
    '{ "chapter": "<basis|ruimtes|budget|wensen|techniek|duurzaamheid|risico|preview>", "delta": { "path": "<string>", "operation": "<add|set|append|remove>", "value": <any> } }',
    "Gebruik alleen bekende hoofdstukken. Als je twijfelt: geen patch.",
    "navigate is optioneel; kies het hoofd-hoofdstuk van de belangrijkste wijziging.",
    "reply is kort NL (max 1–2 zinnen).",
    "Zet m² altijd als integer. Gebruik 'byName:<Naam>.<veld>' voor ruimte-specifieke velden (bv. byName:Keuken.wensen).",
    "Voorbeelden:",
    "Input: 'daglicht in de keuken' → patches: [{chapter:'ruimtes', delta:{path:'byName:Keuken.wensen', operation:'add', value:'Daglicht'}}], navigate:'ruimtes'",
    "Input: 'budget ongeveer 250k' → patches: [{chapter:'budget', delta:{path:'budgetTotaal', operation:'set', value:250000}}], navigate:'budget'",
    "Input: 'woonkamer 30 m2' → patches: [{chapter:'ruimtes', delta:{path:'', operation:'add', value:{name:'Woonkamer', type:'woonkamer', group:'', m2:30, wensen:[]}}}], navigate:'ruimtes'",
    "Input: '200m2' → patches: [{chapter:'basis', delta:{path:'oppervlakteM2', operation:'set', value:200}}], navigate:'basis'",
    "Als niets zeker is: patches=[] en alleen reply met verduidelijkingsvraag.",
  ].join("\n");

  const user = JSON.stringify({
    query,
    context: {
      triage: wizardState?.triage ?? null,
      chapterAnswers: wizardState?.chapterAnswers ?? null,
    },
    schema: {
      patches: "Array<{chapter, delta:{path, operation, value}}>",
      navigate: "basis|wensen|budget|ruimtes|techniek|duurzaamheid|risico|preview|null",
      reply: "string (NL)",
    },
  });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    temperature: 0.2,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const raw = completion.choices?.[0]?.message?.content ?? "{}";
  let parsed: any = {};
  try { parsed = JSON.parse(raw); } catch { return null; }

  const result: LlmResult = {
    patches: Array.isArray(parsed.patches)
      ? parsed.patches.filter((p: any) => clampChapter(p?.chapter)).map((p: any) => ({
          chapter: clampChapter(p.chapter)!,
          delta: p.delta,
        }))
      : [],
    navigate: clampChapter(parsed.navigate),
    reply: typeof parsed.reply === "string" ? parsed.reply : undefined,
  };

  return result;
}
