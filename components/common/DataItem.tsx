'use client';

import React from 'react';

interface DataItemProps {
  label: string;
  value?: string | number | boolean | null | undefined;
  children?: React.ReactNode;
  className?: string;
}

export default function DataItem({
  label,
  value,
  children,
  className = '',
}: DataItemProps) {
  // Handle various value types
  let displayValue: string | React.ReactNode = '—';

  if (children) {
    displayValue = children;
  } else if (value !== null && value !== undefined && value !== '') {
    if (typeof value === 'boolean') {
      displayValue = value ? 'Ja' : 'Nee';
    } else {
      displayValue = String(value);
    }
  }

  return (
    <div className={`py-2 text-sm ${className}`}>
      <dt className="font-medium text-slate-600">{label}</dt>
      <dd className="text-slate-900 mt-0.5">
        {displayValue}
      </dd>
    </div>
  );
}