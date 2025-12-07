"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

export type Toast = {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | string;
  duration?: number; // ms
  action?: React.ReactNode;
};

type ToastCtx = {
  toasts: Toast[];
  toast: (t: Omit<Toast, "id">) => { id: string };
  dismiss: (id: string) => void;
  dismissAll: () => void;
};

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const api = useMemo<ToastCtx>(() => {
    return {
      toasts,
      toast: ({ title, description, variant = "default", duration = 3500, action }) => {
        const id = crypto?.randomUUID?.() ?? String(Date.now() + Math.random());
        const t: Toast = { id, title, description, variant, duration, action };
        setToasts((prev) => [...prev, t]);
        if (duration > 0) {
          setTimeout(() => {
            setToasts((prev) => prev.filter((x) => x.id !== id));
          }, duration);
        }
        // Log naar console i.p.v. crashen als er geen UI is
        if (process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.debug("[toast]", { title, description, variant });
        }
        return { id };
      },
      dismiss: (id: string) => setToasts((prev) => prev.filter((x) => x.id !== id)),
      dismissAll: () => setToasts([]),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toasts]);

  return (
    <Ctx.Provider value={api}>
      {children}
      {/* Eenvoudige overlay UI (mag je weghalen/aanpassen) */}
      <div className="pointer-events-none fixed inset-0 z-[9999] flex flex-col items-end gap-2 p-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              "pointer-events-auto w-full max-w-sm rounded-lg border px-4 py-3 shadow-lg bg-white",
              t.variant === "destructive" ? "border-red-200" : "border-gray-200",
            ].join(" ")}
          >
            {t.title && <div className="text-sm font-semibold">{t.title}</div>}
            {t.description && <div className="mt-1 text-sm text-gray-600">{t.description}</div>}
            {t.action && <div className="mt-2">{t.action}</div>}
            <div className="mt-2 flex justify-end">
              <button
                onClick={() => api.dismiss(t.id)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Sluiten
              </button>
            </div>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  // Als iemand per ongeluk useToast buiten de provider gebruikt: val veilig terug
  if (!ctx) {
    // eslint-disable-next-line no-console
    console.warn("useToast used without <ToastProvider>. Using no-op shim.");
    const noop = () => ({ id: "noop" });
    return { toasts: [] as Toast[], toast: noop, dismiss: () => { }, dismissAll: () => { } };
  }
  return ctx;
}
