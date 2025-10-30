// components/wizard/WizardLayout.tsx
'use client';

import React from 'react';

interface WizardLayoutProps {
  left: React.ReactNode;
  middle: React.ReactNode;
  right: React.ReactNode;
}

export default function WizardLayout({ left, middle, right }: WizardLayoutProps) {
  return (
    <div className="min-h-screen px-6">
      {/* Inner 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[35%_45%_20%] gap-6 py-8">
        
        {/* LEFT COLUMN: Chat (35%) */}
        <div className="overflow-y-auto max-h-[calc(100vh-120px)] scrollbar-thin scrollbar-thumb-gray-300">
          {left}
        </div>

        {/* MIDDLE COLUMN: Canvas (50%) */}
        <div className="overflow-y-auto max-h-[calc(100vh-120px)] scrollbar-thin scrollbar-thumb-gray-300">
          {middle}
        </div>

        {/* RIGHT COLUMN: Expert Corner (15%) */}
        <div className="hidden lg:block overflow-y-auto max-h-[calc(100vh-120px)] scrollbar-thin scrollbar-thumb-gray-300">
          {right}
        </div>

      </div>

      {/* Responsive behavior */}
      <style jsx>{`
        @media (max-width: 1024px) {
          /* Tablet: 2 kolommen */
          .grid {
            grid-template-columns: 1fr 1.5fr !important;
          }
        }

        @media (max-width: 768px) {
          /* Mobile: 1 kolom, tabs selecten welke */
          .grid {
            grid-template-columns: 1fr !important;
          }
        }

        /* Scrollbar styling */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgb(209, 213, 219);
          border-radius: 3px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgb(156, 163, 175);
        }
      `}</style>
    </div>
  );
}