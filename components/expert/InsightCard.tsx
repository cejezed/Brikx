// components/expert/InsightCard.tsx
// Card component voor individuele insight

import type { Insight } from '@/lib/insights/types';

interface InsightCardProps {
  insight: Insight;
  compact?: boolean;
}

export function InsightCard({ insight, compact = false }: InsightCardProps) {
  const severityStyles = {
    info: 'bg-blue-50/60 backdrop-blur-md border-blue-200/50 text-blue-900',
    tip: 'bg-emerald-50/60 backdrop-blur-md border-emerald-200/50 text-emerald-900',
    warning: 'bg-orange-50/60 backdrop-blur-md border-orange-200/50 text-orange-900',
    critical: 'bg-red-50/60 backdrop-blur-md border-red-200/50 text-red-900',
  };

  return (
    <div className={`
      rounded-xl border-2 text-xs shadow-sm transition-all duration-200 hover:shadow-md
      ${severityStyles[insight.severity]}
      ${compact ? 'p-2' : 'p-3'}
    `}>
      {!compact && insight.title && (
        <h4 className="font-semibold mb-1.5 leading-tight">
          {insight.title}
        </h4>
      )}

      <p className="leading-relaxed whitespace-pre-line">
        {insight.content}
      </p>

      {insight.metadata?.frequency && insight.metadata.frequency >= 5 && (
        <p className="text-[10px] opacity-70 mt-2">
          Gebaseerd op {insight.metadata.frequency} vergelijkbare projecten
        </p>
      )}

      {insight.confidence < 0.8 && (
        <p className="text-[10px] opacity-60 mt-1.5 italic">
          Deze tip is indicatief – raadpleeg een expert voor uw specifieke situatie
        </p>
      )}
    </div>
  );
}
