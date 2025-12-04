// components/expert/InsightSection.tsx
// Reusable section wrapper voor insights

interface InsightSectionProps {
  title: string;
  icon?: string;
  severity?: 'info' | 'warning';
  children: React.ReactNode;
}

export function InsightSection({
  title,
  icon,
  severity = 'info',
  children
}: InsightSectionProps) {
  const headerColor = severity === 'warning'
    ? 'text-orange-700'
    : 'text-slate-700';

  return (
    <div className="space-y-2">
      <h3 className={`text-[10px] font-semibold uppercase tracking-wide ${headerColor} flex items-center gap-1.5`}>
        {icon && <span className="text-sm">{icon}</span>}
        {title}
      </h3>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}
