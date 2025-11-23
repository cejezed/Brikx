// /lib/expert/getExpertTips.ts
// ✅ v3.9: Centrale tip-aggregator voor ExpertCorner
// Combineert: statische rules, TECHNIEK_TIPS, RAG resultaten
// Toegevoegd: category property voor UI badges

import staticRules, { type TipItem } from "@/components/expert/rules";
import { TECHNIEK_TIPS } from "./techniektips";
import { isFocusedOn } from "@/lib/wizard/focusKeyHelper";
import type { ChapterKey } from "@/types/project";

// ============================================================================
// Types
// ============================================================================

export type TipCategory = "basis" | "techniek" | "leefstijl" | "rag";

export interface CategorizedTip extends TipItem {
  category: TipCategory;
}

export interface ExpertTipResult {
  staticTips: CategorizedTip[];
  techniekTips: CategorizedTip[];
  allTips: CategorizedTip[];
}

// ============================================================================
// TECHNIEK_TIPS naar CategorizedTip converteren
// ============================================================================

function convertTechniekTips(fieldId: string): CategorizedTip[] {
  const tips = TECHNIEK_TIPS[fieldId];
  if (!tips || !Array.isArray(tips)) return [];

  return tips.map((text, index) => ({
    id: `tech_${fieldId}_${index}`,
    text,
    severity: "info" as const,
    category: "techniek" as const,
  }));
}

// ============================================================================
// Alle techniek velden ophalen voor een focus key
// ============================================================================

function getTechniekTipsForField(focusKey: string): CategorizedTip[] {
  const [chapter, fieldId] = focusKey.split(":");

  // Alleen techniek chapter krijgt TECHNIEK_TIPS
  if (chapter !== "techniek") return [];
  if (!fieldId) return [];

  // Direct match
  const directTips = convertTechniekTips(fieldId);
  if (directTips.length > 0) return directTips;

  // Mapping van veldnamen naar TECHNIEK_TIPS keys
  const fieldMapping: Record<string, string[]> = {
    // Ventilatie
    ventilationAmbition: ["ventilationAmbition", "ventilatie"],
    ventilatie: ["ventilatie", "ventilationAmbition"],

    // Verwarming
    heatingAmbition: ["heatingAmbition", "verwarming"],
    verwarming: ["verwarming", "heatingAmbition"],
    gasaansluiting: ["gasaansluiting", "verwarming"],
    afgiftesysteem: ["afgiftesysteem", "verwarming"],

    // Koeling
    coolingAmbition: ["coolingAmbition", "koeling"],
    koeling: ["koeling", "coolingAmbition"],

    // PV / Energie
    pvAmbition: ["pvAmbition", "pvConfiguratie"],
    pvConfiguratie: ["pvConfiguratie", "pvAmbition"],
    zonnepanelen: ["pvAmbition", "pvConfiguratie"],

    // Batterij / EV
    batterijVoorziening: ["batterijVoorziening"],
    evVoorziening: ["evVoorziening"],
    thuisbatterij: ["batterijVoorziening"],
    evLaadpunt: ["evVoorziening"],

    // Bouwmethode
    currentState: ["currentState"],
    buildMethod: ["buildMethod"],
    bouwmethode: ["buildMethod"],

    // Overig
    notes: ["notes"],
    showAdvanced: ["showAdvanced"],
  };

  const mappedKeys = fieldMapping[fieldId] ?? [];
  const mappedTips: CategorizedTip[] = [];

  for (const key of mappedKeys) {
    mappedTips.push(...convertTechniekTips(key));
  }

  return mappedTips;
}

// ============================================================================
// Hoofd export: Haal alle tips op voor een focus key
// ============================================================================

export function getExpertTips(focusKey: string | null): ExpertTipResult {
  if (!focusKey) {
    return { staticTips: [], techniekTips: [], allTips: [] };
  }

  const [chapter, fieldId] = focusKey.split(":");
  if (!chapter || !fieldId) {
    return { staticTips: [], techniekTips: [], allTips: [] };
  }

  // 1. Statische rules ophalen en categoriseren
  const chapterRules = (staticRules as Record<string, TipItem[]>)[chapter] ?? [];
  const staticTips: CategorizedTip[] = chapterRules
    .filter((tip) => isFocusedOn(focusKey, chapter as ChapterKey, tip.id))
    .map((tip) => ({
      ...tip,
      category: "basis" as const, // Statische rules krijgen categorie "basis"
    }));

  // 2. TECHNIEK_TIPS ophalen (alleen voor techniek chapter)
  const techniekTips = getTechniekTipsForField(focusKey);

  // 3. Combineer alles (static eerst, dan techniek)
  const allTips = [...staticTips, ...techniekTips];

  return {
    staticTips,
    techniekTips,
    allTips,
  };
}

// ============================================================================
// Helper: Haal tips op voor een specifiek chapter + veld
// ============================================================================

export function getExpertTipsForChapter(
  chapter: ChapterKey,
  fieldId: string
): ExpertTipResult {
  return getExpertTips(`${chapter}:${fieldId}`);
}

// ============================================================================
// Helper: Zoek tips die matchen met een query string
// ============================================================================

export function searchExpertTips(query: string, chapter?: ChapterKey): CategorizedTip[] {
  const queryLower = query.toLowerCase();
  const results: CategorizedTip[] = [];

  // Doorzoek statische rules
  const chapters = chapter ? [chapter] : Object.keys(staticRules);

  for (const ch of chapters) {
    const chapterRules = (staticRules as Record<string, TipItem[]>)[ch] ?? [];
    for (const tip of chapterRules) {
      if (tip.text.toLowerCase().includes(queryLower)) {
        results.push({
          ...tip,
          category: "basis" as const,
        });
      }
    }
  }

  // Doorzoek TECHNIEK_TIPS (alleen als chapter undefined of "techniek")
  if (!chapter || chapter === "techniek") {
    for (const [fieldId, tips] of Object.entries(TECHNIEK_TIPS)) {
      for (const [index, text] of tips.entries()) {
        if (text.toLowerCase().includes(queryLower)) {
          results.push({
            id: `tech_${fieldId}_${index}`,
            text,
            severity: "info",
            category: "techniek" as const,
          });
        }
      }
    }
  }

  return results;
}
