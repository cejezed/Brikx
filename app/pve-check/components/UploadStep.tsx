"use client";

import { useCallback, useState } from "react";
import { usePveCheckStore } from "@/lib/stores/usePveCheckStore";

function formatAnalyseDoel(value?: string): string {
  if (value === "aannemer") return "aannemer";
  return "architect";
}

export function UploadStep() {
  const { uploadDocument, isUploading, error, documentName, setStep, intake } =
    usePveCheckStore();
  const [dragActive, setDragActive] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      await uploadDocument(file);
      // After upload, auto-start analyze
      const store = usePveCheckStore.getState();
      if (store.documentId && !store.error) {
        store.analyze();
      }
    },
    [uploadDocument],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Upload je PvE</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          PDF of DOCX, max 10 MB, max 40 pagina&apos;s.
        </p>
        {intake && (
          <p className="text-xs text-slate-400 mt-1">
            Project: {intake.archetype} ({intake.projectType}) &mdash;{" "}
            {intake.locatie} &mdash; Doel: {formatAnalyseDoel(intake.analyseDoel)}
          </p>
        )}
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer
          ${
            dragActive
              ? "border-[#0d3d4d] bg-[#0d3d4d]/5"
              : "border-slate-300 dark:border-slate-600 hover:border-slate-400"
          }
          ${isUploading ? "opacity-60 pointer-events-none" : ""}
        `}
      >
        <input
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="space-y-2">
            <Spinner />
            <p className="text-sm text-slate-500">Uploaden en analyseren...</p>
          </div>
        ) : documentName ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-green-600">
              Geupload: {documentName}
            </p>
            <p className="text-xs text-slate-400">
              Sleep een nieuw bestand om opnieuw te uploaden
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-base font-medium text-slate-600 dark:text-slate-300">
              Sleep je PvE hierheen
            </p>
            <p className="text-sm text-slate-400">of klik om te selecteren</p>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={() => setStep("intake")}
        className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
      >
        &larr; Terug naar intake
      </button>
    </div>
  );
}

function Spinner() {
  return (
    <div className="mx-auto w-8 h-8 border-2 border-[#0d3d4d] border-t-transparent rounded-full animate-spin" />
  );
}
