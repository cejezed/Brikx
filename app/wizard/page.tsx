// app/wizard/page.tsx
"use client";

import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WizardLayout from "@/components/wizard/WizardLayout";

export default function WizardPage() {
  return (
    <>
      <Header />

      <main className="bg-white" style={{
        minHeight: 'calc(100vh - 60px)',
        display: 'flex',
        justifyContent: 'center',
        padding: '2rem 0'
      }}>
        <div className="w-full max-w-[1552px] px-4" style={{
          height: 'calc(100vh - 60px - 4rem)'
        }}>
          <WizardLayout />
        </div>
      </main>

      <Footer />
    </>
  );
}
