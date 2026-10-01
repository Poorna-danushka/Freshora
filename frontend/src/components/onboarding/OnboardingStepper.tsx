interface OnboardingStepperProps {
  steps: string[];
  current: number;
}

export function OnboardingStepper({ steps, current }: OnboardingStepperProps) {
  return (
    <nav aria-label="Application progress" className="mb-8">
      <ol className="hidden md:flex items-center gap-2">
        {steps.map((label, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <li key={label} className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    done || active ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                  aria-current={active ? 'step' : undefined}
                >
                  {index + 1}
                </span>
                <span className={`text-sm font-semibold truncate ${active ? 'text-gray-900' : 'text-gray-500'}`}>
                  {label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-px flex-1 ${done ? 'bg-primary-400' : 'bg-gray-200'}`} />
              )}
            </li>
          );
        })}
      </ol>
      <div className="md:hidden">
        <p className="text-sm font-semibold text-gray-900">
          Step {current + 1} of {steps.length} — {steps[current]}
        </p>
        <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full bg-primary-500 transition-all"
            style={{ width: `${((current + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </nav>
  );
}
