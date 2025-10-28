'use client';

import React from 'react';
import clsx from 'clsx';

interface ProgressBarProps {
  value: number; // 0..100
  label?: string;
  className?: string;
  height?: 'sm' | 'md';
}

export default function ProgressBar({
  value,
  label,
  className = '',
  height = 'sm',
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
          <span>{label}</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div
        className={clsx(
          'w-full rounded-full bg-gray-200 overflow-hidden',
          height === 'sm' ? 'h-2' : 'h-3'
        )}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        aria-label={label || 'Voortgang'}
      >
        <div
          className="h-full bg-[#4db8ba] transition-all duration-300"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
