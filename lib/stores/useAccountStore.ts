// lib/stores/useAccountStore.ts
// v3.x: Premium integratie – Account/subscription state management
// Bron van waarheid voor free vs premium

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type AccountPlan = "free" | "premium";

interface AccountState {
  plan: AccountPlan;
  isLoading: boolean;
}

interface AccountActions {
  setPlan: (plan: AccountPlan) => void;
  setLoading: (isLoading: boolean) => void;
  fetchPlan: () => Promise<void>;
}

type AccountStore = AccountState & AccountActions;

export const useAccountStore = create<AccountStore>()(
  persist(
    (set) => ({
      // State
      plan: "free",
      isLoading: false,

      // Actions
      setPlan: (plan) => set({ plan }),
      setLoading: (isLoading) => set({ isLoading }),

      // Fetch plan from /api/me (server-side auth check)
      fetchPlan: async () => {
        set({ isLoading: true });
        try {
          const response = await fetch("/api/me");
          if (response.ok) {
            const data = await response.json();
            set({ plan: data.plan || "free" });
          } else {
            // Als niet ingelogd of error → free
            set({ plan: "free" });
          }
        } catch (error) {
          console.error("[AccountStore] Failed to fetch plan:", error);
          set({ plan: "free" });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "brikx-account-storage",
      storage: createJSONStorage(() => localStorage),
      // Alleen plan persisten, isLoading niet
      partialize: (state) => ({ plan: state.plan }),
    }
  )
);

// Helper hook voor makkelijke plan checks
export const useIsPremium = (): boolean => {
  const plan = useAccountStore((state) => state.plan);
  return plan === "premium";
};

export default useAccountStore;
