// lib/hooks/useExpertInsights.ts
// React Query hook voor ExpertCorner insights

import { useQuery } from '@tanstack/react-query';
import { useWizardState } from '@/lib/stores/useWizardState';
import type { InsightResponse, InsightContext } from '@/lib/insights/types';
import type { ChapterKey } from '@/types/project';

export function useExpertInsights() {
  const currentChapter = useWizardState(s => s.currentChapter);
  const focusedField = useWizardState(s => s.focusedField);
  const chapterAnswers = useWizardState(s => s.chapterAnswers);

  const context: InsightContext = {
    currentChapter: (currentChapter as ChapterKey) || 'basis',
    focusedField: focusedField ?? null,
    chapterAnswers: chapterAnswers,
  };

  return useQuery<InsightResponse>({
    queryKey: ['expert-insights', currentChapter, focusedField],
    queryFn: async () => {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to fetch insights');
      }

      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minuten
    enabled: !!currentChapter && !!chapterAnswers, // Only fetch when ready
    retry: 1, // Retry once on failure
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });
}
