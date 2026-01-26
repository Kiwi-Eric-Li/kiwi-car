import { Link } from 'react-router-dom';
import { Shield, Info, ArrowRight } from 'lucide-react';
import { useVehicleLookup } from '@/hooks/useVehicleLookup';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { PlateInput, VehicleInfoCard } from '@/components/features';

export default function LookupPage() {
  const { lookup, reset, vehicle, isLoading, error, quota } = useVehicleLookup();
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary-600 to-primary-700 text-white">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm mb-6">
            <Shield className="h-4 w-4" />
            Official NZTA Data
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Free Vehicle History Check
          </h1>
          <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
            Enter any NZ plate number to instantly check WOF status, registration,
            and odometer history - all from official NZTA records.
          </p>

          {/* Plate Input */}
          <PlateInput onSubmit={lookup} isLoading={isLoading} />

          {/* Usage Quota */}
          <div className="mt-6 text-sm text-primary-200">
            {quota.remaining > 0 ? (
              <>
                <span className="font-medium">{quota.remaining}</span> of{' '}
                <span className="font-medium">{quota.limit}</span> lookups remaining today
              </>
            ) : (
              <span className="text-yellow-300">
                Daily limit reached.{' '}
                {!isAuthenticated && (
                  <Link to="/login" className="underline">
                    Sign in
                  </Link>
                )}{' '}
                for more lookups.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {vehicle && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Vehicle Information</h2>
              <Button variant="ghost" onClick={reset}>
                New Search
              </Button>
            </div>

            <VehicleInfoCard vehicle={vehicle} />

            {/* CTA */}
            <Card className="bg-primary-50 border-primary-200">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Looking to buy or sell a {vehicle.make} {vehicle.model}?
                  </h3>
                  <p className="text-gray-600">
                    Browse similar listings or list your car on KiwiCar.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link to={`/buy?makes=${vehicle.make}`}>
                    <Button variant="outline">
                      Browse {vehicle.make}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/sell">
                    <Button>Sell Your Car</Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Info Cards (shown when no results) */}
        {!vehicle && !error && (
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <InfoCard
              title="WOF Status"
              description="Check if the Warrant of Fitness is current or expired, and when it's due for renewal."
            />
            <InfoCard
              title="Registration"
              description="Verify the vehicle's registration status and expiry date to avoid surprises."
            />
            <InfoCard
              title="Odometer History"
              description="View recorded odometer readings to help identify potential clocking."
            />
          </div>
        )}

        {/* FAQ Section */}
        {!vehicle && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <FaqItem
                question="Where does this data come from?"
                answer="All vehicle information is sourced directly from the New Zealand Transport Agency (NZTA) Motor Vehicle Register, ensuring accuracy and reliability."
              />
              <FaqItem
                question="How many lookups can I do?"
                answer={`Guests can perform ${3} free lookups per day. Registered users get ${10} lookups per day. Sign up for free to get more lookups!`}
              />
              <FaqItem
                question="What plate formats are supported?"
                answer="We support all current NZ plate formats including ABC123, AB1234, and personalized plates. Simply enter the plate without spaces."
              />
              <FaqItem
                question="Can I check any vehicle?"
                answer="Yes, you can check any vehicle registered in New Zealand. This includes cars, motorcycles, trucks, and trailers."
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function InfoCard({ title, description }: { title: string; description: string }) {
  return (
    <Card className="text-center">
      <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
        <Info className="h-6 w-6 text-primary-600" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </Card>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <Card>
      <h3 className="font-semibold text-gray-900 mb-2">{question}</h3>
      <p className="text-sm text-gray-600">{answer}</p>
    </Card>
  );
}
