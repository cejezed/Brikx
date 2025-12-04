interface ProgressHeaderProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

export default function ProgressHeader({
  currentStep,
  totalSteps,
  stepTitles,
}: ProgressHeaderProps) {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="mb-4 sm:mb-8">
      {/* Step circles */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;

          return (
            <div key={step} className="flex flex-col items-center flex-1">
              <div
                className={`
                  w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center
                  text-xs sm:text-base font-semibold transition-all duration-300
                  ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                        ? 'bg-stone-800 text-white ring-2 sm:ring-4 ring-stone-200'
                        : 'bg-stone-200 text-stone-500'
                  }
                `}
              >
                {isCompleted ? (
                  <svg
                    className="w-3 h-3 sm:w-5 sm:h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <span>{step}</span>
                )}
              </div>
              <p
                className={`
                  text-[9px] sm:text-xs mt-1 sm:mt-2 text-center max-w-[60px] sm:max-w-[80px] leading-tight
                  ${isCurrent ? 'text-stone-800 font-medium' : 'text-stone-500'}
                `}
              >
                {stepTitles[step - 1]}
              </p>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-stone-200 rounded-full h-1.5 sm:h-2">
        <div
          className="bg-emerald-600 h-1.5 sm:h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
