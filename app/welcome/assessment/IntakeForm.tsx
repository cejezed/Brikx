'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWizardState } from '@/lib/stores/useWizardState';
import type { IntakeFormData } from './types';
import { getInitialFormData } from './types';
import {
  canProceed,
  mapIntakeToBasisData,
  saveIntakeDraft,
  loadIntakeDraft,
  clearIntakeDraft,
} from './utils';
import ProgressHeader from './components/ProgressHeader';
import StepNavigation from './components/StepNavigation';
import Step1ProjectContext from './steps/Step1ProjectContext';
import Step2PlanningEnErvaring from './steps/Step2PlanningEnErvaring';
import Step3Budget from './steps/Step3Budget';
import Step4StijlEnToelichting from './steps/Step4StijlEnToelichting';
import Step5DoelPvE from './steps/Step5DoelPvE';

const STEP_TITLES = [
  'Project Context',
  'Planning',
  'Budget',
  'Stijl',
  'Doel PvE',
];

export default function IntakeForm() {
  const router = useRouter();
  const { updateChapterData, setChapterFlow, goToChapter } = useWizardState();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<IntakeFormData>(getInitialFormData());

  // Load draft on mount
  useEffect(() => {
    const draft = loadIntakeDraft();
    if (draft) {
      setFormData(draft);
    }

    // Analytics: intake started
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'intake_started');
    }
  }, []);

  // Auto-save on formData change
  useEffect(() => {
    saveIntakeDraft(formData);
  }, [formData]);

  const handleChange = (updates: Partial<IntakeFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);

      // Analytics: step completed
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'intake_step_completed', {
          step: currentStep,
        });
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    // Map to BasisData
    const basisData = mapIntakeToBasisData(formData);

    // Update wizard state
    updateChapterData('basis', () => basisData);

    // Set standard 7-chapter flow
    setChapterFlow([
      'basis',
      'ruimtes',
      'wensen',
      'budget',
      'techniek',
      'duurzaam',
      'risico',
    ]);

    // Go to basis chapter
    goToChapter('basis');

    // Clear localStorage draft
    clearIntakeDraft();

    // Analytics: intake completed
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'intake_completed');
    }

    // Navigate to wizard
    router.push('/wizard');
  };

  const canProceedNow = canProceed(currentStep, formData);

  return (
    <div className="min-h-screen bg-stone-50 py-4 sm:py-12 px-3 sm:px-4">
      <div className="max-w-3xl mx-auto">
        {/* Progress Header */}
        <ProgressHeader
          currentStep={currentStep}
          totalSteps={5}
          stepTitles={STEP_TITLES}
        />

        {/* Step Content */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-8 mb-4 sm:mb-6">
          {currentStep === 1 && (
            <Step1ProjectContext data={formData} onChange={handleChange} />
          )}
          {currentStep === 2 && (
            <Step2PlanningEnErvaring data={formData} onChange={handleChange} />
          )}
          {currentStep === 3 && (
            <Step3Budget data={formData} onChange={handleChange} />
          )}
          {currentStep === 4 && (
            <Step4StijlEnToelichting data={formData} onChange={handleChange} />
          )}
          {currentStep === 5 && (
            <Step5DoelPvE data={formData} onChange={handleChange} />
          )}
        </div>

        {/* Step Navigation */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6">
          <StepNavigation
            currentStep={currentStep}
            totalSteps={5}
            canGoNext={canProceedNow}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onComplete={handleComplete}
          />
        </div>
      </div>
    </div>
  );
}
