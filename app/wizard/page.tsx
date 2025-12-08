// app/wizard/page.tsx
"use client";

import React from "react";
import WizardLayout from "@/components/wizard/WizardLayout";

export default function WizardPage() {
  return (
    <div className="min-h-[100dvh] w-full flex flex-col bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 text-slate-900 dark:bg-gradient-to-br dark:from-[#040914] dark:via-[#0a1326] dark:to-[#0F172A] dark:text-slate-100 transition-colors duration-500">
      <main className="flex-1 w-full relative min-h-0">
        <div className="h-full w-full p-0 lg:p-6 flex items-stretch justify-center">
          <WizardLayout />
        </div>
      </main>
    </div>
  );
}
