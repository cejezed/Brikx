interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onComplete: () => void;
}

export default function StepNavigation({
  currentStep,
  totalSteps,
  canGoNext,
  onPrevious,
  onNext,
  onComplete,
}: StepNavigationProps) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 mt-4 sm:mt-8 pt-4 sm:pt-6 border-t border-stone-200">
      <button
        type="button"
        onClick={onPrevious}
        disabled={isFirstStep}
        className={`
          px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base
          ${
            isFirstStep
              ? 'opacity-0 pointer-events-none'
              : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
          }
        `}
      >
        ← Vorige
      </button>

      <div className="text-xs sm:text-sm text-stone-500 order-first sm:order-none">
        Stap {currentStep} van {totalSteps}
      </div>

      {isLastStep ? (
        <button
          type="button"
          onClick={onComplete}
          disabled={!canGoNext}
          className={`
            px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold transition-all text-sm sm:text-base w-full sm:w-auto
            ${
              canGoNext
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg'
                : 'bg-stone-300 text-stone-500 cursor-not-allowed'
            }
          `}
        >
          Start met PvE →
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          className={`
            px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all text-sm sm:text-base w-full sm:w-auto
            ${
              canGoNext
                ? 'bg-stone-800 text-white hover:bg-stone-900'
                : 'bg-stone-300 text-stone-500 cursor-not-allowed'
            }
          `}
        >
          Volgende →
        </button>
      )}
    </div>
  );
}
