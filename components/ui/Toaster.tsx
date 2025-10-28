"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastVariant = "default" | "success" | "warning" | "error";
export type ToastOptions = {
  id?: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type ToastInternal = ToastOptions & { id: string };

type ToastContextType = {
  show: (opts: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastInternal[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (opts: ToastOptions) => {
      const id = opts.id ?? `t-${Math.random().toString(36).slice(2, 9)}`;
      const t: ToastInternal = {
        id,
        title: opts.title,
        description: opts.description,
        variant: opts.variant ?? "default",
        durationMs: opts.durationMs ?? 3500,
      };
      setToasts((list) => [...list, t]);
      window.setTimeout(() => remove(id), t.durationMs);
    },
    [remove]
  );

  const value = useMemo<ToastContextType>(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onClose={remove} />
    </ToastContext.Provider>
  );
}

function badge(variant: ToastVariant) {
  switch (variant) {
    case "success": return "bg-green-600 text-white";
    case "warning": return "bg-amber-500 text-black";
    case "error": return "bg-red-600 text-white";
    default: return "bg-gray-900 text-white";
  }
}

function ToastViewport({ toasts, onClose }: { toasts: ToastInternal[]; onClose: (id: string) => void }) {
  return (
    <div
      className="fixed z-50 right-4 bottom-4 w-[340px] max-w-[90vw] space-y-2"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`rounded-xl shadow-lg border ${badge(t.variant!)} p-3`}
          role="status"
        >
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium">{t.title}</p>
              {t.description && <p className="text-xs mt-0.5 opacity-90">{t.description}</p>}
            </div>
            <button
              className="text-xs underline opacity-90 hover:opacity-100"
              onClick={() => onClose(t.id)}
              aria-label="Sluiten"
            >
              Sluiten
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
