// app/wizard/page.tsx
"use client";

import React from "react";
import WizardLayout from "@/components/wizard/WizardLayout";

export default function WizardPage() {
  return (
    <div className="min-h-[100dvh] w-full flex flex-col bg-slate-50">
      <main className="flex-1 w-full relative min-h-0">
        <div className="h-full w-full p-0 lg:p-6 flex items-center justify-center">
          <WizardLayout />
        </div>
      </main>
    </div>
  );
}
