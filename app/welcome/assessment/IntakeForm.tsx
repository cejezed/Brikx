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
import Step1ProjectEssentials from './steps/Step1ProjectEssentials';
import Step2PlanningBudget from './steps/Step2PlanningBudget';
import Step3DetailsDoelen from './steps/Step3DetailsDoelen';

const STEP_TITLES = [
  'Project Essentials',
  'Planning & Budget',
  'Details & Doelen',
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
    if (currentStep < 3) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 dark:bg-gradient-to-br dark:from-[#1b273d] dark:via-[#243450] dark:to-[#2e4366] py-4 sm:py-12 px-3 sm:px-4 relative overflow-hidden">
      {/* Background atmosphere */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[60rem] h-[60rem] rounded-full mix-blend-screen filter blur-[100px] animate-blob bg-brikx-400/30 mix-blend-multiply opacity-90 dark:bg-brikx-500/12 dark:mix-blend-screen dark:opacity-70"></div>
        <div className="absolute top-[10%] right-[-10%] w-[50rem] h-[50rem] rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000 bg-blue-400/30 mix-blend-multiply opacity-85 dark:bg-indigo-500/12 dark:mix-blend-screen dark:opacity-70"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay dark:opacity-10 dark:brightness-110 dark:contrast-125"></div>
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Progress Header */}
        {/* Step Content */}
        <div className="bg-white/40 border-white/40 shadow-2xl shadow-slate-400/20 backdrop-blur-[60px] dark:bg-slate-900/40 dark:border-white/10 dark:shadow-black/50 rounded-lg sm:rounded-2xl border-2 p-4 sm:p-8 mb-4 sm:mb-6">
          {currentStep === 1 && (
            <Step1ProjectEssentials data={formData} onChange={handleChange} />
          )}
          {currentStep === 2 && (
            <Step2PlanningBudget data={formData} onChange={handleChange} />
          )}
          {currentStep === 3 && (
            <Step3DetailsDoelen data={formData} onChange={handleChange} />
          )}
        </div>

        {/* Step Navigation */}
        <div className="bg-white/40 border-white/40 shadow-2xl shadow-slate-400/20 backdrop-blur-[60px] dark:bg-slate-900/40 dark:border-white/10 dark:shadow-black/50 rounded-lg sm:rounded-2xl border-2 p-4 sm:p-6">
          <StepNavigation
            currentStep={currentStep}
            totalSteps={3}
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
