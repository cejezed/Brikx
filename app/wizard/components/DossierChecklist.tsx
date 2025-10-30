// app/wizard/components/DossierChecklist.tsx
'use client';

import { useState } from 'react';
import { useWizardState } from '@/lib/stores/useWizardState';
import type { ChapterKey } from '@/types/wizard';

export interface DocumentStatus {
  moodboard: boolean | null;
  existingDrawings: boolean | null;
  kavelpaspoort: boolean | null;
  existingPermits: boolean | null;
}

interface DossierChecklistProps {
  onComplete: (status: DocumentStatus) => void;
  isLoading?: boolean;
}

const architectTips = {
  moodboard: {
    yes: 'Uitstekend! Dit helpt de architect jouw stijl goed te begrijpen.',
    no: 'Een moodboard kan je later alsnog samenstellen via Pinterest of Houzz.',
  },
  existingDrawings: {
    yes: 'Perfect! Dit scheelt veel werk en zorgt voor nauwkeurige offertes.',
    no: 'Dit is belangrijk. Je kunt deze tekeningen opvragen bij het gemeentearchief.',
  },
  kavelpaspoort: {
    yes: 'Uitstekend! Dit geeft duidelijkheid over bouwmogelijkheden.',
    no: 'Dit is belangrijk voordat het ontwerpproces start. Je kunt dit bij je gemeente opvragen.',
  },
  existingPermits: {
    yes: 'Goed! Dit bespaard tijd bij navraag bij gemeente.',
    no: 'Geen probleem. Een grensmeting door het Kadaster kan verstandig zijn.',
  },
};

export default function DossierChecklist({
  onComplete,
  isLoading = false,
}: DossierChecklistProps) {
  // ✅ FIX: Read from useWizardState (your actual store)
  const triage = useWizardState((s) => s.triage);
  const projectType = triage.projectType;

  const [status, setStatus] = useState<DocumentStatus>({
    moodboard: null,
    existingDrawings: null,
    kavelpaspoort: null,
    existingPermits: null,
  });

  // ✅ FIX: Use correct project type values from your triage
  const isRenovation = projectType === 'renovatie' || projectType === 'verbouwing_binnen';
  const isNewBuild = projectType === 'nieuwbouw';

  const totalSteps = 2 + (isRenovation ? 1 : 0) + (isNewBuild ? 1 : 0);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showTip, setShowTip] = useState(false);

  const handleChoice = (choiceId: string) => {
    const answer = choiceId === 'yes';

    switch (currentStep) {
      case 1:
        setStatus((s) => ({ ...s, moodboard: answer }));
        setFeedback(architectTips.moodboard[answer ? 'yes' : 'no']);
        setShowTip(true);
        setTimeout(() => setCurrentStep(2), 2500);
        break;

      case 2:
        if (isRenovation) {
          setStatus((s) => ({ ...s, existingDrawings: answer }));
          setFeedback(
            architectTips.existingDrawings[answer ? 'yes' : 'no']
          );
          setShowTip(true);
          setTimeout(() => setCurrentStep(3), 2500);
        } else if (isNewBuild) {
          setStatus((s) => ({ ...s, kavelpaspoort: answer }));
          setFeedback(architectTips.kavelpaspoort[answer ? 'yes' : 'no']);
          setShowTip(true);
          setTimeout(() => setCurrentStep(3), 2500);
        }
        break;

      case 3:
        setStatus((s) => ({ ...s, existingPermits: answer }));
        setFeedback(architectTips.existingPermits[answer ? 'yes' : 'no']);
        setShowTip(true);
        setTimeout(
          () => onComplete({ ...status, existingPermits: answer }),
          2500
        );
        break;
    }
  };

  const getQuestion = () => {
    switch (currentStep) {
      case 1:
        return 'Heeft u een moodboard met visuele inspiratie?';
      case 2:
        if (isRenovation)
          return 'Heeft u bouwtekeningen van de bestaande situatie?';
        if (isNewBuild)
          return 'Heeft u het kavelpaspoort of omgevingsinformatie?';
        return '';
      case 3:
        return 'Zijn er nog andere relevante documenten?';
      default:
        return '';
    }
  };

  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#1A3E4C] mb-2">
          📋 Dossier Checklist
        </h2>
        <p className="text-gray-600 text-sm">
          Welke documenten hebt u al beschikbaar?
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-gray-600">
            Vraag {currentStep} van {totalSteps}
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

      {getQuestion() && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {getQuestion()}
          </h3>

          {!showTip && (
            <div className="flex gap-3">
              <button
                onClick={() => handleChoice('yes')}
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-green-900 font-medium transition disabled:opacity-50"
              >
                ✅ Ja, die heb ik
              </button>
              <button
                onClick={() => handleChoice('no')}
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-900 font-medium transition disabled:opacity-50"
              >
                ❌ Nee, nog niet
              </button>
            </div>
          )}

          {showTip && feedback && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 leading-relaxed">
                💡 <strong>Tip van de Architect:</strong> {feedback}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}