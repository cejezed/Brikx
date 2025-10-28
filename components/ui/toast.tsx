// components/ui/toast.tsx
'use client';
import React, { createContext, useContext, useMemo, useState } from 'react';

type Toast = { id: string; title?: string; description?: string };
type Ctx = {
  toasts: Toast[];
  toast: (t: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
};

const ToastCtx = createContext<Ctx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const api = useMemo<Ctx>(() => ({
    toasts,
    toast: (t) => setToasts((arr) => [...arr, { id: Math.random().toString(36).slice(2), ...t }]),
    dismiss: (id) => setToasts((arr) => arr.filter((x) => x.id !== id)),
  }), [toasts]);

  return <ToastCtx.Provider value={api}>{children}</ToastCtx.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

// Optioneel visuele renderer
export function ToasterShim() {
  const { toasts, dismiss } = useToast();
  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {toasts.map((t) => (
        <div key={t.id} className="rounded-lg bg-black/90 text-white px-4 py-3 shadow-lg">
          {t.title && <div className="font-semibold">{t.title}</div>}
          {t.description && <div className="text-sm opacity-90">{t.description}</div>}
          <button className="mt-2 text-xs underline" onClick={() => dismiss(t.id)}>Sluiten</button>
        </div>
      ))}
    </div>
  );
}
