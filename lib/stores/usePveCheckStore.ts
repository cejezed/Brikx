"use client";

import { create } from "zustand";
import type { PveCheckIntakeData, PveCheckResult, PveDocStats } from "@/types/pveCheck";

// ============================================================================
// STEP NAVIGATION
// ============================================================================

export type PveCheckStep = "intake" | "upload" | "analyzing" | "results";

// ============================================================================
// STATE SLICES
// ============================================================================

type StepState = {
  step: PveCheckStep;
};

type UploadState = {
  documentId: string | null;
  documentName: string | null;
  docStats: PveDocStats | null;
  textHash: string | null;
  uploadedFile: File | null;
};

type AnalyzeState = {
  intake: PveCheckIntakeData | null;
  result: PveCheckResult | null;
  resultId: string | null;
};

type RequestState = {
  isUploading: boolean;
  isAnalyzing: boolean;
  error: string | null;
};

// ============================================================================
// STORE
// ============================================================================

type PveCheckStore = StepState &
  UploadState &
  AnalyzeState &
  RequestState & {
    reset: () => void;
    setStep: (step: PveCheckStep) => void;
    setIntake: (intake: PveCheckIntakeData) => void;
    uploadDocument: (file: File) => Promise<void>;
    analyze: () => Promise<void>;
  };

const INITIAL_STATE: StepState & UploadState & AnalyzeState & RequestState = {
  step: "intake",
  documentId: null,
  documentName: null,
  docStats: null,
  textHash: null,
  uploadedFile: null,
  intake: null,
  result: null,
  resultId: null,
  isUploading: false,
  isAnalyzing: false,
  error: null,
};

export const usePveCheckStore = create<PveCheckStore>((set, get) => ({
  ...INITIAL_STATE,

  reset: () => set({ ...INITIAL_STATE }),

  setStep: (step) => set({ step }),

  setIntake: (intake) => set({ intake }),

  uploadDocument: async (file: File) => {
    set({ isUploading: true, error: null, uploadedFile: file });
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/pve-check/upload", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Upload mislukt");
      }

      set({
        documentId: payload.documentId,
        documentName: payload.documentName,
        docStats: payload.docStats,
        textHash: payload.textHash,
        step: "analyzing",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload mislukt";
      set({ error: message, uploadedFile: null });
    } finally {
      set({ isUploading: false });
    }
  },

  analyze: async () => {
    const { documentId, intake } = get();
    if (!documentId || !intake) {
      set({ error: "Document en intake zijn verplicht voor analyse." });
      return;
    }

    set({ isAnalyzing: true, error: null, step: "analyzing" });
    try {
      const response = await fetch("/api/pve-check/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ documentId, intake }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Analyse mislukt");
      }

      set({
        result: payload.result,
        resultId: payload.resultId,
        step: "results",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Analyse mislukt";
      set({ error: message, step: "upload" });
    } finally {
      set({ isAnalyzing: false });
    }
  },
}));

export default usePveCheckStore;
