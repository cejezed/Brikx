'use client';

import { ToastProvider, ToasterShim } from "@/components/ui/toast";

export default function RootProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <ToasterShim />
    </ToastProvider>
  );
}
