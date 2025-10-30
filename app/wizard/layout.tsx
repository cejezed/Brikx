'use client';

import React from 'react';

// Gebruik je eigen provider (shadcn) of de shim hieronder
import { ToastProvider } from '@/components/ui/toast';
import { ToasterShim as Toaster } from '@/components/ui/toast'; // vervang door jouw <Toaster /> indien aanwezig

export default function WizardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <Toaster />
      {children}
    </ToastProvider>
  );
}
