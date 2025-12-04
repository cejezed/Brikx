// app/wizard/page.tsx
"use client";

import React from "react";
import Footer from "@/components/Footer";
import WizardLayout from "@/components/wizard/WizardLayout";
import WizardMobileMenu from "@/components/wizard/WizardMobileMenu";

export default function WizardPage() {
  return (
    <>
      <WizardMobileMenu />

      <main className="bg-white flex justify-center min-h-[calc(100vh-60px)] p-0 xl:py-8 xl:pb-[44px]">
        <div className="w-full max-w-[1552px] px-0 xl:px-4 h-[calc(100vh-60px)] xl:h-[calc(100vh-60px-2rem-44px)]">
          <WizardLayout />
        </div>
      </main>

      <div className="hidden xl:block">
        <Footer />
      </div>
    </>
  );
}
