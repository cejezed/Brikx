// app/wizard/page.tsx
"use client";

import React from "react";
import WizardLayout from "@/components/wizard/WizardLayout";

export default function WizardPage() {
  return (
    <div className="h-[100dvh] w-full overflow-hidden flex flex-col">
      <main className="flex-1 w-full h-full relative">
        <div className="absolute inset-0 p-0 lg:p-6 flex items-center justify-center">
          <WizardLayout />
        </div>
      </main>
    </div>
  );
}
