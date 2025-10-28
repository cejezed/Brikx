"use client";

import React from "react";

type Props = {
  /** 0–100 */
  value: number;
  size?: number;          // px
  stroke?: number;        // px
  label?: string;         // bv. "Stap 3/9"
  subtitle?: string;      // bv. "Voortgang"
  className?: string;
};

export default function CircularProgress({
  value,
  size = 88,
  stroke = 8,
  label,
  subtitle,
  className = "",
}: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const dash = (pct / 100) * c;

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        <circle cx={size/2} cy={size/2} r={r} stroke="#e5e7eb" strokeWidth={stroke} fill="none" />
        <circle
          cx={size/2}
          cy={size/2}
          r={r}
          stroke="var(--brx-accent)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          transform={`rotate(-90 ${size/2} ${size/2})`}
        />
        <text
          x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
          fontSize={Math.max(12, size * 0.22)} fontWeight={600} fill="#111827"
        >
          {pct}%
        </text>
      </svg>

      <div className="leading-tight">
        {subtitle && <div className="text-[11px] text-gray-500">{subtitle}</div>}
        {label && <div className="text-sm font-semibold text-[var(--brx-ink)]">{label}</div>}
      </div>
    </div>
  );
}
