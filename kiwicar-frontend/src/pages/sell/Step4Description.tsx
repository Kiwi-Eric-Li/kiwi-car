import { useState } from 'react';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/utils';
import { useListingWizardStore } from '@/stores/listingWizardStore';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';

interface Step4DescriptionProps {
  onNext: () => void;
  onBack: () => void;
}

const MIN_CHARS = 50;
const RECOMMENDED_MIN = 200;
const RECOMMENDED_MAX = 1000;

export default function Step4Description({ onNext, onBack }: Step4DescriptionProps) {
  const {
    description,
    setDescription,
    aiDescriptionGenerated,
    setAiDescriptionGenerated,
    vehicleDetails,
    photos,
  } = useListingWizardStore();

  const [isGenerating, setIsGenerating] = useState(false);

  const charCount = description.length;
  const canContinue = charCount >= MIN_CHARS;
  const isInRecommendedRange = charCount >= RECOMMENDED_MIN && charCount <= RECOMMENDED_MAX;

  const generateAIDescription = async () => {
    setIsGenerating(true);

    // Simulate AI generation delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate mock AI description based on vehicle details
    const aiText = `This well-maintained ${vehicleDetails?.year} ${vehicleDetails?.make} ${vehicleDetails?.model} is a fantastic opportunity for anyone looking for a reliable ${vehicleDetails?.bodyType?.toLowerCase() || 'vehicle'}.

Key Features:
• ${vehicleDetails?.fuelType} engine - efficient and economical
• ${vehicleDetails?.transmission} transmission - smooth and responsive
• ${vehicleDetails?.color} exterior in excellent condition
• Current odometer: ${vehicleDetails?.mileage?.toLocaleString()} km

This ${vehicleDetails?.make} has been regularly serviced and well cared for. The interior is clean and tidy, with all features in working order. Perfect for daily commuting or family use.

${photos.length} high-quality photos included to show the true condition of this vehicle. Don't miss this opportunity to own a quality ${vehicleDetails?.make}!

Feel free to contact me for more information or to arrange a viewing. Serious buyers only.`;

    setDescription(aiText);
    setAiDescriptionGenerated(true);
    setIsGenerating(false);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Describe your car
        </h1>
        <p className="text-gray-600">
          A good description helps buyers understand what makes your car special
        </p>
      </div>

      <Card>
        {/* AI Generate Button */}
        {!aiDescriptionGenerated && !description && (
          <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border border-primary-100">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary-600" />
                  Generate with AI
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Let our AI write a professional description based on your vehicle details
                </p>
              </div>
              <Button
                onClick={generateAIDescription}
                isLoading={isGenerating}
                disabled={isGenerating}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate
              </Button>
            </div>
          </div>
        )}

        {/* Regenerate button (shown after AI generation) */}
        {aiDescriptionGenerated && (
          <div className="flex items-center justify-between mb-4 p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">AI-generated description</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={generateAIDescription}
              isLoading={isGenerating}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Regenerate
            </Button>
          </div>
        )}

        {/* Description Textarea */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Describe your car's condition, features, service history, and any extras included..."
            rows={12}
            className={cn(
              'w-full px-4 py-3 border rounded-lg resize-none',
              'focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500',
              charCount < MIN_CHARS && charCount > 0
                ? 'border-red-300'
                : 'border-gray-300'
            )}
          />

          {/* Character count */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {charCount < MIN_CHARS ? (
                <span className="text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {MIN_CHARS - charCount} more characters needed
                </span>
              ) : !isInRecommendedRange ? (
                <span className="text-yellow-600">
                  Recommended: {RECOMMENDED_MIN}-{RECOMMENDED_MAX} characters
                </span>
              ) : (
                <span className="text-green-600">Great length!</span>
              )}
            </div>
            <span className={cn(
              charCount < MIN_CHARS ? 'text-red-600' : 'text-gray-500'
            )}>
              {charCount} characters
            </span>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-800 mb-2">Tips for a great description:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Be honest about the condition - buyers appreciate transparency</li>
            <li>• Mention recent services, new parts, or repairs</li>
            <li>• Highlight standout features (low km, one owner, full service history)</li>
            <li>• Include any extras (roof rack, winter tyres, tow bar)</li>
            <li>• Mention why you're selling (upgrading, moving overseas, etc.)</li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mt-6">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button
            onClick={onNext}
            disabled={!canContinue}
            className="flex-1"
          >
            Continue
          </Button>
        </div>
      </Card>
    </div>
  );
}
