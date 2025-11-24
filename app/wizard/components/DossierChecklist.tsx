// /app/wizard/components/DossierChecklist.tsx
// ✅ v3.13: Dossier Checklist - Verbeterd met store integratie en premium moodboard
"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import useWizardState from "@/lib/stores/useWizardState";
import type {
  DocumentStatus,
  DocumentSourceType,
  DocumentFormat,
  BasisData,
} from "@/types/project";
import {
  compressImage,
  isValidImageFile,
  formatFileSize,
} from "@/lib/client/compressImage";

// ============================================================================
// Types & Constants
// ============================================================================

interface DossierChecklistProps {
  projectId?: string; // Voor moodboard uploads
  onComplete?: () => void;
}

type ChecklistStep =
  | "moodboard"
  | "moodboard_link"
  | "moodboard_upload"
  | "drawings"
  | "drawings_details"
  | "kavelpaspoort"
  | "kavelpaspoort_details"
  | "other_docs"
  | "complete";

const SOURCE_TYPE_LABELS: Record<DocumentSourceType, string> = {
  gemeente: "Gemeente / Bouwarchief",
  vorige_architect: "Vorige architect",
  aannemer: "Aannemer",
  eigen_tekeningen: "Zelf gemaakt",
  onbekend: "Anders / onbekend",
};

const FORMAT_OPTIONS: { value: DocumentFormat; label: string }[] = [
  { value: "pdf", label: "PDF" },
  { value: "dwg", label: "DWG / AutoCAD" },
  { value: "papier", label: "Papieren tekeningen" },
  { value: "jpg", label: "Foto's / scans" },
];

// ============================================================================
// Component
// ============================================================================

export default function DossierChecklist({
  projectId,
  onComplete,
}: DossierChecklistProps) {
  // Store access
  const basisData = useWizardState((s) => s.chapterAnswers?.basis as BasisData | undefined);
  const mode = useWizardState((s) => s.mode);
  const updateChapterData = useWizardState((s) => s.updateChapterData);

  const isPremium = mode === "PREMIUM";
  const projectType = basisData?.projectType;

  // Bepaal welke vragen relevant zijn
  const isVerbouw = projectType === "verbouwing" || projectType === "hybride";
  const isNieuwbouw = projectType === "nieuwbouw";

  // Local state
  const [step, setStep] = useState<ChecklistStep>("moodboard");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [localStatus, setLocalStatus] = useState<Partial<DocumentStatus>>({
    moodboard: null,
    moodboardLink: "",
    hasDrawings: undefined,
    sourceType: undefined,
    formats: [],
    storageLocation: "",
    kavelpaspoort: undefined,
    kavelpaspoortLocatie: "",
    hasOtherDocs: undefined,
    otherDocsDescription: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Laad bestaande data uit store
  useEffect(() => {
    if (basisData?.documentStatus) {
      setLocalStatus((prev) => ({ ...prev, ...basisData.documentStatus }));
      if (basisData.documentStatus.moodboardImages) {
        setUploadedImages(basisData.documentStatus.moodboardImages);
      }
    }
  }, [basisData?.documentStatus]);

  // Save to store helper
  const saveToStore = useCallback(
    (updates: Partial<DocumentStatus>) => {
      const newStatus = { ...localStatus, ...updates };
      setLocalStatus(newStatus);

      updateChapterData("basis", (prev) => ({
        ...prev,
        documentStatus: {
          ...prev.documentStatus,
          ...newStatus,
        } as DocumentStatus,
      }));
    },
    [localStatus, updateChapterData]
  );

  // ============================================================================
  // Moodboard Upload Handlers
  // ============================================================================

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !projectId) return;

    setError(null);
    setIsUploading(true);

    try {
      for (const file of Array.from(files)) {
        if (!isValidImageFile(file)) {
          setError(`${file.name} is geen geldig afbeeldingsformaat`);
          continue;
        }

        // Comprimeer afbeelding
        const compressed = await compressImage(file);
        console.log(
          `[Moodboard] Compressed ${file.name}: ${formatFileSize(compressed.originalSize)} → ${formatFileSize(compressed.compressedSize)}`
        );

        // Upload naar API
        const formData = new FormData();
        formData.append("file", compressed.blob, file.name);

        const response = await fetch(
          `/api/projects/${projectId}/moodboard/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const result = await response.json();

        if (result.success && result.signedUrl) {
          const newImages = [...uploadedImages, result.signedUrl];
          setUploadedImages(newImages);
          saveToStore({ moodboardImages: newImages });
        } else {
          setError(result.error || "Upload mislukt");
        }
      }
    } catch (err) {
      console.error("[Moodboard] Upload error:", err);
      setError("Er ging iets mis bij het uploaden");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = async (index: number) => {
    // TODO: Implement delete via API
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    saveToStore({ moodboardImages: newImages });
  };

  // ============================================================================
  // Step Navigation
  // ============================================================================

  const handleMoodboardChoice = (hasMoodboard: boolean) => {
    saveToStore({ moodboard: hasMoodboard });

    if (hasMoodboard) {
      // Vraag naar link of upload
      setStep(isPremium ? "moodboard_upload" : "moodboard_link");
    } else {
      // Ga naar volgende sectie
      goToNextSection();
    }
  };

  const handleMoodboardLinkSubmit = () => {
    // Link is al opgeslagen via onChange
    goToNextSection();
  };

  const handleMoodboardUploadComplete = () => {
    goToNextSection();
  };

  const goToNextSection = () => {
    if (isVerbouw) {
      setStep("drawings");
    } else if (isNieuwbouw) {
      setStep("kavelpaspoort");
    } else {
      setStep("other_docs");
    }
  };

  const handleDrawingsChoice = (hasDrawings: boolean) => {
    saveToStore({ hasDrawings });
    if (hasDrawings) {
      setStep("drawings_details");
    } else {
      // Naar kavelpaspoort of other_docs
      if (isNieuwbouw) {
        setStep("kavelpaspoort");
      } else {
        setStep("other_docs");
      }
    }
  };

  const handleDrawingsDetailsSubmit = () => {
    if (isNieuwbouw) {
      setStep("kavelpaspoort");
    } else {
      setStep("other_docs");
    }
  };

  const handleKavelpaspoortChoice = (hasKavelpaspoort: boolean) => {
    saveToStore({ kavelpaspoort: hasKavelpaspoort });
    if (hasKavelpaspoort) {
      setStep("kavelpaspoort_details");
    } else {
      setStep("other_docs");
    }
  };

  const handleKavelpaspoortDetailsSubmit = () => {
    setStep("other_docs");
  };

  const handleOtherDocsChoice = (hasOtherDocs: boolean) => {
    saveToStore({ hasOtherDocs });
    setStep("complete");
    onComplete?.();
  };

  // ============================================================================
  // Render Helpers
  // ============================================================================

  const renderYesNoButtons = (
    onYes: () => void,
    onNo: () => void,
    yesLabel = "Ja",
    noLabel = "Nee"
  ) => (
    <div className="flex gap-3 mt-4">
      <button
        onClick={onYes}
        className="flex-1 px-4 py-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-green-900 font-medium transition"
      >
        ✅ {yesLabel}
      </button>
      <button
        onClick={onNo}
        className="flex-1 px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-900 font-medium transition"
      >
        ❌ {noLabel}
      </button>
    </div>
  );

  const renderContinueButton = (onClick: () => void, label = "Doorgaan") => (
    <button
      onClick={onClick}
      className="w-full mt-4 px-4 py-3 bg-[#40C0C0] hover:bg-[#35a5a5] text-white font-medium rounded-lg transition"
    >
      {label} →
    </button>
  );

  // ============================================================================
  // Step Renders
  // ============================================================================

  const renderMoodboardStep = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Heeft u een moodboard of visuele inspiratie verzameld?
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Dit helpt om uw stijlvoorkeuren over te brengen aan de architect.
      </p>
      {renderYesNoButtons(
        () => handleMoodboardChoice(true),
        () => handleMoodboardChoice(false),
        "Ja, ik heb inspiratie",
        "Nee, nog niet"
      )}
    </div>
  );

  const renderMoodboardLinkStep = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Deel uw moodboard link
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Voeg een link toe naar uw Pinterest board, Houzz collectie, of andere
        inspiratiebron.
      </p>
      <input
        type="url"
        value={localStatus.moodboardLink || ""}
        onChange={(e) => saveToStore({ moodboardLink: e.target.value })}
        placeholder="https://pinterest.com/..."
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40C0C0] focus:border-transparent"
      />
      {renderContinueButton(handleMoodboardLinkSubmit)}
    </div>
  );

  const MAX_IMAGES = 10;
  const canUploadMore = uploadedImages.length < MAX_IMAGES;

  const renderMoodboardUploadStep = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900">
          Upload uw moodboard afbeeldingen
        </h3>
        {/* Image counter */}
        <span className={`text-sm font-medium px-2 py-1 rounded ${
          uploadedImages.length >= MAX_IMAGES
            ? "bg-amber-100 text-amber-800"
            : "bg-gray-100 text-gray-600"
        }`}>
          {uploadedImages.length}/{MAX_IMAGES}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Upload tot {MAX_IMAGES} afbeeldingen die uw stijl en wensen weergeven.
      </p>

      {/* Link optie */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700">
          Of deel een link:
        </label>
        <input
          type="url"
          value={localStatus.moodboardLink || ""}
          onChange={(e) => saveToStore({ moodboardLink: e.target.value })}
          placeholder="https://pinterest.com/..."
          className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40C0C0] focus:border-transparent"
        />
      </div>

      {/* Upload zone - disabled when max reached */}
      <div
        onClick={() => canUploadMore && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition ${
          canUploadMore
            ? "border-gray-300 cursor-pointer hover:border-[#40C0C0]"
            : "border-gray-200 bg-gray-50 cursor-not-allowed"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={!canUploadMore}
        />
        {isUploading ? (
          <p className="text-gray-600">Uploaden...</p>
        ) : !canUploadMore ? (
          <p className="text-amber-700">
            Maximum aantal afbeeldingen bereikt ({MAX_IMAGES})
          </p>
        ) : (
          <>
            <p className="text-gray-600 mb-1">
              Klik of sleep afbeeldingen hierheen
            </p>
            <p className="text-xs text-gray-400">
              JPG, PNG of WebP (max 2MB per afbeelding)
            </p>
          </>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {/* Uploaded images preview */}
      {uploadedImages.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {uploadedImages.map((url, index) => (
            <div key={index} className="relative aspect-square">
              <img
                src={url}
                alt={`Moodboard ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-sm hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {renderContinueButton(handleMoodboardUploadComplete)}
    </div>
  );

  const renderDrawingsStep = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Heeft u bouwtekeningen van de bestaande situatie?
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Denk aan plattegronden, doorsnedes of geveltekeningen. U hoeft deze niet
        te uploaden.
      </p>
      {renderYesNoButtons(
        () => handleDrawingsChoice(true),
        () => handleDrawingsChoice(false),
        "Ja, die heb ik",
        "Nee, niet beschikbaar"
      )}
    </div>
  );

  const renderDrawingsDetailsStep = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Vertel ons meer over uw tekeningen
      </h3>

      {/* Bron */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Waar komen de tekeningen vandaan?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(SOURCE_TYPE_LABELS) as DocumentSourceType[]).map(
            (type) => (
              <button
                key={type}
                onClick={() => saveToStore({ sourceType: type })}
                className={`px-3 py-2 text-sm rounded-lg border transition ${
                  localStatus.sourceType === type
                    ? "bg-[#40C0C0] text-white border-[#40C0C0]"
                    : "bg-white text-gray-700 border-gray-300 hover:border-[#40C0C0]"
                }`}
              >
                {SOURCE_TYPE_LABELS[type]}
              </button>
            )
          )}
        </div>
      </div>

      {/* Formaten */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          In welk formaat heeft u ze?
        </label>
        <div className="flex flex-wrap gap-2">
          {FORMAT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                const current = localStatus.formats || [];
                const newFormats = current.includes(opt.value)
                  ? current.filter((f) => f !== opt.value)
                  : [...current, opt.value];
                saveToStore({ formats: newFormats });
              }}
              className={`px-3 py-2 text-sm rounded-lg border transition ${
                localStatus.formats?.includes(opt.value)
                  ? "bg-[#40C0C0] text-white border-[#40C0C0]"
                  : "bg-white text-gray-700 border-gray-300 hover:border-[#40C0C0]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Locatie */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Waar bewaart u deze tekeningen?
        </label>
        <input
          type="text"
          value={localStatus.storageLocation || ""}
          onChange={(e) => saveToStore({ storageLocation: e.target.value })}
          placeholder="bijv. 'Mail van gemeente', 'Dropbox map Verbouwing'"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40C0C0] focus:border-transparent"
        />
      </div>

      {renderContinueButton(handleDrawingsDetailsSubmit)}
    </div>
  );

  const renderKavelpaspoortStep = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Heeft u een kavelpaspoort of omgevingsinformatie?
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Dit document bevat bouwmogelijkheden en restricties voor uw kavel.
      </p>
      {renderYesNoButtons(
        () => handleKavelpaspoortChoice(true),
        () => handleKavelpaspoortChoice(false),
        "Ja, beschikbaar",
        "Nee, nog niet"
      )}
    </div>
  );

  const renderKavelpaspoortDetailsStep = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Waar bewaart u het kavelpaspoort?
      </h3>
      <input
        type="text"
        value={localStatus.kavelpaspoortLocatie || ""}
        onChange={(e) => saveToStore({ kavelpaspoortLocatie: e.target.value })}
        placeholder="bijv. 'E-mail van de makelaar', 'Gemeente website'"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40C0C0] focus:border-transparent"
      />
      {renderContinueButton(handleKavelpaspoortDetailsSubmit)}
    </div>
  );

  const renderOtherDocsStep = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Heeft u nog andere relevante documenten?
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Denk aan vergunningen, bodemonderzoeken, energielabels, etc.
      </p>
      {renderYesNoButtons(
        () => {
          saveToStore({ hasOtherDocs: true });
          // Optioneel: vraag om beschrijving
          handleOtherDocsChoice(true);
        },
        () => handleOtherDocsChoice(false),
        "Ja, ik heb meer",
        "Nee, dit is alles"
      )}
    </div>
  );

  const renderCompleteStep = () => (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
      <div className="text-4xl mb-2">✅</div>
      <h3 className="text-lg font-semibold text-green-900 mb-2">
        Dossier checklist compleet!
      </h3>
      <p className="text-sm text-green-700">
        Uw documentstatus is opgeslagen. U kunt dit later altijd bijwerken.
      </p>
    </div>
  );

  // ============================================================================
  // Main Render
  // ============================================================================

  const renderCurrentStep = () => {
    switch (step) {
      case "moodboard":
        return renderMoodboardStep();
      case "moodboard_link":
        return renderMoodboardLinkStep();
      case "moodboard_upload":
        return renderMoodboardUploadStep();
      case "drawings":
        return renderDrawingsStep();
      case "drawings_details":
        return renderDrawingsDetailsStep();
      case "kavelpaspoort":
        return renderKavelpaspoortStep();
      case "kavelpaspoort_details":
        return renderKavelpaspoortDetailsStep();
      case "other_docs":
        return renderOtherDocsStep();
      case "complete":
        return renderCompleteStep();
      default:
        return null;
    }
  };

  // Calculate progress
  const totalSteps =
    1 + // moodboard
    (isVerbouw ? 1 : 0) + // drawings
    (isNieuwbouw ? 1 : 0) + // kavelpaspoort
    1; // other_docs

  const currentStepNumber = (() => {
    switch (step) {
      case "moodboard":
      case "moodboard_link":
      case "moodboard_upload":
        return 1;
      case "drawings":
      case "drawings_details":
        return 2;
      case "kavelpaspoort":
      case "kavelpaspoort_details":
        return isVerbouw ? 3 : 2;
      case "other_docs":
        return totalSteps;
      case "complete":
        return totalSteps;
      default:
        return 1;
    }
  })();

  const progress = (currentStepNumber / totalSteps) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-[#1A3E4C] mb-2">
          Dossier & Documenten
        </h2>
        <p className="text-gray-600 text-sm">
          Welke documenten heeft u al beschikbaar? U hoeft niets te uploaden.
        </p>
      </div>

      {/* Progress bar */}
      {step !== "complete" && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-600">
              Stap {currentStepNumber} van {totalSteps}
            </span>
            <span className="text-xs font-medium text-[#40C0C0]">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#40C0C0] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Current step content */}
      {renderCurrentStep()}
    </div>
  );
}
