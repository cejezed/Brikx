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
import { useIsPremium } from "@/lib/stores/useAccountStore"; // v3.x: Premium integratie
import { PremiumModal } from "@/components/premium"; // v3.x: Premium integratie

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
  const updateChapterData = useWizardState((s) => s.updateChapterData);

  // v3.x: Premium integratie
  const isPremium = useIsPremium();
  const projectType = basisData?.projectType;

  // Bepaal welke vragen relevant zijn
  const isVerbouw = projectType === "verbouwing" || projectType === "hybride";
  const isNieuwbouw = projectType === "nieuwbouw";

  // Local state
  const [step, setStep] = useState<ChecklistStep>("moodboard");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [premiumModalOpen, setPremiumModalOpen] = useState(false); // v3.x: Premium integratie

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
      // v3.x: Premium integratie - Toon altijd moodboard_upload stap
      // Free users krijgen link veld + disabled upload met tooltip
      // Premium users krijgen link veld + enabled upload
      setStep("moodboard_upload");
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
  const canUploadMore = uploadedImages.length < MAX_IMAGES && isPremium; // v3.x: Premium check

  const renderMoodboardUploadStep = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900">
          {isPremium ? "Upload uw moodboard afbeeldingen" : "Deel uw moodboard"}
        </h3>
        {/* Image counter - alleen voor Premium */}
        {isPremium && (
          <span className={`text-sm font-medium px-2 py-1 rounded ${
            uploadedImages.length >= MAX_IMAGES
              ? "bg-amber-100 text-amber-800"
              : "bg-gray-100 text-gray-600"
          }`}>
            {uploadedImages.length}/{MAX_IMAGES}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-4">
        {isPremium
          ? `Upload tot ${MAX_IMAGES} afbeeldingen die uw stijl en wensen weergeven.`
          : "Deel een link naar uw moodboard of inspiratie."
        }
      </p>

      {/* Link optie - voor ALLE users */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700">
          {isPremium ? "Of deel een link:" : "Link naar moodboard:"}
        </label>
        <input
          type="url"
          value={localStatus.moodboardLink || ""}
          onChange={(e) => saveToStore({ moodboardLink: e.target.value })}
          placeholder="https://pinterest.com/..."
          className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40C0C0] focus:border-transparent"
        />
      </div>

      {/* v3.x: Upload zone - Premium gating met tooltip */}
      <div className="relative">
        {/* Tooltip voor free users */}
        {!isPremium && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/80 backdrop-blur-[1px] rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center px-6 py-4">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Afbeeldingen uploaden is een Premium-functie
              </div>
              <button
                onClick={() => setPremiumModalOpen(true)}
                className="text-sm text-blue-600 hover:text-blue-700 underline font-medium"
              >
                Meer info over Premium
              </button>
            </div>
          </div>
        )}

        <div
          onClick={() => canUploadMore && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition ${
            canUploadMore
              ? "border-gray-300 cursor-pointer hover:border-[#40C0C0]"
              : "border-gray-200 bg-gray-50 cursor-not-allowed"
          } ${!isPremium ? "opacity-50" : ""}`}
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
          ) : uploadedImages.length >= MAX_IMAGES ? (
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

      {/* v3.x: Fase 5 - Success state: green check wanneer content aanwezig */}
      {(uploadedImages.length > 0 || (localStatus.moodboardLink && localStatus.moodboardLink.trim() !== '')) && (
        <div className="mt-4 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900">
              {uploadedImages.length > 0 && localStatus.moodboardLink?.trim()
                ? `${uploadedImages.length} afbeelding${uploadedImages.length > 1 ? 'en' : ''} geüpload en link toegevoegd`
                : uploadedImages.length > 0
                ? `${uploadedImages.length} afbeelding${uploadedImages.length > 1 ? 'en' : ''} geüpload`
                : 'Link toegevoegd'
              }
            </p>
            <p className="text-xs text-green-700">
              Uw moodboard wordt meegenomen in het PvE rapport
            </p>
          </div>
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

      {/* v3.x: Premium modal voor moodboard upload upsell */}
      <PremiumModal
        isOpen={premiumModalOpen}
        onClose={() => setPremiumModalOpen(false)}
        onUpgrade={() => {
          setPremiumModalOpen(false);
          // TODO: Navigate to upgrade page
        }}
        feature="moodboard"
      />
    </div>
  );
}
