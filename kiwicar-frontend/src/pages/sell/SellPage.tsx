import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useListingWizardStore } from '@/stores/listingWizardStore';
import { useAuthStore } from '@/stores/authStore';
import { ProgressStepper } from '@/components/features';
import Step1Plate from './Step1Plate';
import Step2Details from './Step2Details';
import Step3Photos from './Step3Photos';
import Step4Description from './Step4Description';
import Step5Price from './Step5Price';
import Step6Review from './Step6Review';

const STEPS = [
  { number: 1, title: 'Plate Lookup', shortTitle: 'Plate' },
  { number: 2, title: 'Vehicle Details', shortTitle: 'Details' },
  { number: 3, title: 'Photos', shortTitle: 'Photos' },
  { number: 4, title: 'Description', shortTitle: 'Desc' },
  { number: 5, title: 'Pricing', shortTitle: 'Price' },
  { number: 6, title: 'Review', shortTitle: 'Review' },
];

export default function SellPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { step, setStep, nextStep, prevStep, canProceedToStep } = useListingWizardStore();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/sell' } });
    }
  }, [isAuthenticated, navigate]);

  const handleNext = () => {
    nextStep();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    prevStep();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStepClick = (targetStep: number) => {
    // Only allow going to steps that have been completed or the current step
    if (targetStep <= step || canProceedToStep(targetStep)) {
      setStep(targetStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleEditStep = (targetStep: number) => {
    setStep(targetStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <ProgressStepper
            steps={STEPS}
            currentStep={step}
            onStepClick={handleStepClick}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="mx-auto max-w-4xl px-4 py-8 pb-16">
        {step === 1 && <Step1Plate onNext={handleNext} />}
        {step === 2 && <Step2Details onNext={handleNext} onBack={handleBack} />}
        {step === 3 && <Step3Photos onNext={handleNext} onBack={handleBack} />}
        {step === 4 && <Step4Description onNext={handleNext} onBack={handleBack} />}
        {step === 5 && <Step5Price onNext={handleNext} onBack={handleBack} />}
        {step === 6 && <Step6Review onBack={handleBack} onEditStep={handleEditStep} />}
      </div>
    </div>
  );
}
