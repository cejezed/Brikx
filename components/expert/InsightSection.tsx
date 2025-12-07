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
  const borderColor = severity === 'warning'
    ? 'border-orange-100'
    : 'border-emerald-100';

  const bgColor = severity === 'warning'
    ? 'bg-gradient-to-br from-orange-50/80 to-orange-100/80'
    : 'bg-emerald-50/80';

  const iconBgColor = severity === 'warning'
    ? 'bg-orange-600 text-white'
    : 'bg-emerald-600 text-white';

  const textColor = severity === 'warning'
    ? 'text-orange-800'
    : 'text-emerald-800';

  const accentColor = severity === 'warning'
    ? 'bg-orange-200/50'
    : 'bg-emerald-200/50';

  return (
    <div className={`border rounded-2xl p-5 shadow-sm relative overflow-hidden group backdrop-blur-sm ${borderColor} ${bgColor}`}>
      {/* Glowing effect */}
      <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700 ${accentColor}`}></div>

      <div className="flex items-center gap-2 mb-3 relative z-10">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-sm ${iconBgColor}`}>
          {icon ? (
            <span className="text-sm">{icon}</span>
          ) : (
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
            </svg>
          )}
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${textColor}`}>{title}</span>
      </div>

      <div className="space-y-2 relative z-10">
        {children}
      </div>
    </div>
  );
}
