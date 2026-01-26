import { Check } from 'lucide-react';
import { cn } from '@/utils';

interface Step {
  number: number;
  title: string;
  shortTitle?: string;
}

interface ProgressStepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

export default function ProgressStepper({
  steps,
  currentStep,
  onStepClick,
  className,
}: ProgressStepperProps) {
  return (
    <nav aria-label="Progress" className={className}>
      {/* Desktop view */}
      <ol className="hidden md:flex items-center">
        {steps.map((step, index) => (
          <li
            key={step.number}
            className={cn('relative', index !== steps.length - 1 && 'flex-1')}
          >
            <div className="flex items-center">
              <button
                onClick={() => onStepClick?.(step.number)}
                disabled={!onStepClick}
                className={cn(
                  'relative flex items-center justify-center',
                  onStepClick && 'cursor-pointer'
                )}
              >
                <span
                  className={cn(
                    'h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                    step.number < currentStep &&
                      'bg-primary-600 text-white',
                    step.number === currentStep &&
                      'bg-primary-600 text-white ring-4 ring-primary-100',
                    step.number > currentStep &&
                      'bg-gray-100 text-gray-500'
                  )}
                >
                  {step.number < currentStep ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    step.number
                  )}
                </span>
                <span
                  className={cn(
                    'absolute -bottom-6 whitespace-nowrap text-sm font-medium',
                    step.number <= currentStep ? 'text-primary-600' : 'text-gray-500'
                  )}
                >
                  {step.title}
                </span>
              </button>

              {/* Connector line */}
              {index !== steps.length - 1 && (
                <div className="flex-1 mx-4">
                  <div
                    className={cn(
                      'h-0.5 w-full',
                      step.number < currentStep ? 'bg-primary-600' : 'bg-gray-200'
                    )}
                  />
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>

      {/* Mobile view */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-primary-600">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-sm text-gray-500">
            {steps[currentStep - 1]?.title}
          </span>
        </div>
        <div className="flex gap-1">
          {steps.map((step) => (
            <div
              key={step.number}
              className={cn(
                'h-2 flex-1 rounded-full transition-colors',
                step.number <= currentStep ? 'bg-primary-600' : 'bg-gray-200'
              )}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}
