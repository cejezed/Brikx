// app/wizard/layout.tsx
'use client';

import React from 'react';

// Gebruik óf je eigen shadcn provider, óf de shim (zelfde API)
import { ToastProvider } from '@/components/ui/toast';
import { ToasterShim as Toaster } from '@/components/ui/toast'; // of jouw eigen <Toaster />

export default function WizardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <Toaster />
      {children}
    </ToastProvider>
  );
}
