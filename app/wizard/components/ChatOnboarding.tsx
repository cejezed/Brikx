// app/wizard/components/ChatOnboarding.tsx
// v3.x: META_TOOLING - Onboarding component voor lege chat

"use client";

import React from "react";
import type { ChapterKey, WizardState } from "@/types/project";
import { getChapterLabel } from "@/lib/ai/toolHelp";

interface ChatOnboardingProps {
  currentChapter: ChapterKey;
  progress: number; // 0-100
  onQuickReply: (message: string) => void;
}

export function ChatOnboarding({
  currentChapter,
  progress,
  onQuickReply,
}: ChatOnboardingProps) {
  const quickReplies = getQuickRepliesForChapter(currentChapter);

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
      {/* Robot icon */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
          <svg
            className="w-7 h-7 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-lg text-gray-900">
            Hoi! Ik ben Jules 👋
          </h3>
          <p className="text-sm text-gray-600">Je digitale bouwcoach</p>
        </div>
      </div>

      {/* Welcome message */}
      <p className="text-sm text-gray-700 mb-4 leading-relaxed">
        Ik help je stap voor stap naar een professioneel{" "}
        <strong>Programma van Eisen (PvE)</strong>.
        <br />
        Vertel in je eigen woorden je budget, ruimtes, wensen en zorgen – ik
        vul de wizard automatisch mee.
      </p>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-gray-600">
            Voortgang wizard
          </span>
          <span className="text-xs font-semibold text-blue-600">
            {progress}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current chapter */}
      <div className="mb-4 p-3 bg-white rounded-md border border-blue-100">
        <p className="text-xs text-gray-500 mb-1">Je bent nu bij:</p>
        <p className="text-sm font-semibold text-gray-900">
          {getChapterLabel(currentChapter)}
        </p>
      </div>

      {/* Quick replies */}
      {quickReplies.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-600 mb-2">
            Start met een van deze vragen:
          </p>
          {quickReplies.map((reply, idx) => (
            <button
              key={idx}
              onClick={() => onQuickReply(reply)}
              className="w-full text-left px-3 py-2 text-sm bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-md transition-colors"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Help link */}
      <button
        onClick={() => onQuickReply("Hoe werkt deze wizard?")}
        className="mt-4 text-xs text-blue-600 hover:text-blue-700 underline"
      >
        Meer uitleg over de wizard →
      </button>
    </div>
  );
}

// ============================================================================
// HELPER: Calculate wizard progress
// ============================================================================

export function calculateProgress(wizardState: WizardState): number {
  const chapterAnswers = wizardState.chapterAnswers || {};

  // All 7 chapters
  const allChapters: ChapterKey[] = [
    "basis",
    "ruimtes",
    "wensen",
    "budget",
    "techniek",
    "duurzaam",
    "risico",
  ];

  let completedCount = 0;

  for (const chapter of allChapters) {
    const data = chapterAnswers[chapter];
    if (data && Object.keys(data).length > 0) {
      completedCount++;
    }
  }

  return Math.round((completedCount / allChapters.length) * 100);
}

// ============================================================================
// HELPER: Get quick replies for chapter
// ============================================================================

function getQuickRepliesForChapter(chapter: ChapterKey): string[] {
  const replies: Record<ChapterKey, string[]> = {
    basis: [
      "Wat moet ik hier invullen?",
      "Ik wil een aanbouw van 30m²",
      "Budget is ongeveer €100.000",
    ],
    ruimtes: [
      "3 slaapkamers en 1 badkamer",
      "Open keuken-woonkamer van 50m²",
      "Welke m² zijn gebruikelijk?",
    ],
    wensen: [
      "Vloerverwarming is essentieel",
      "We willen geen open trap",
      "Hoe prioriteer ik mijn wensen?",
    ],
    budget: [
      "Budget is €150k tot €180k",
      "Wat zijn verborgen kosten?",
      "Hoeveel buffer moet ik aanhouden?",
    ],
    techniek: [
      "We willen van het gas af",
      "All-electric warmtepomp met vloerverwarming",
      "Wat is een WTW-installatie?",
    ],
    duurzaam: [
      "We willen A++ halen",
      "Welke isolatiewaarden zijn verstandig?",
      "Zonnepanelen: hoeveel heb ik nodig?",
    ],
    risico: [
      "Hoe voorkom ik budgetoverschrijding?",
      "Wat kan er misgaan bij een aanbouw?",
      "Hoe mitigeer ik planningrisico's?",
    ],
  };

  return replies[chapter] || [];
}
