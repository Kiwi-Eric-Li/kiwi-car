import { CheckCircle, AlertCircle, Calendar, Gauge, Fuel, Car, Shield } from 'lucide-react';
import { cn } from '@/utils';
import { formatDate, formatMileage } from '@/utils/format';
import Card, { CardContent } from '@/components/common/Card';
import type { VehicleInfo } from '@/types';

interface VehicleInfoCardProps {
  vehicle: VehicleInfo;
  className?: string;
}

export default function VehicleInfoCard({ vehicle, className }: VehicleInfoCardProps) {

  return (
    <Card className={cn('overflow-hidden', className)} padding="none">
      {/* Header with plate */}
      <div className="bg-gray-900 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Plate Number</p>
            <p className="text-3xl font-bold tracking-wider">{vehicle.plate}</p>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary-400" />
            <span className="text-xs text-gray-400">
              Official<br />NZTA Data
            </span>
          </div>
        </div>
      </div>

      {/* Vehicle Details */}
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <InfoItem
            icon={Car}
            label="Make & Model"
            value={`${vehicle.make} ${vehicle.model}`}
          />
          <InfoItem
            icon={Calendar}
            label="Year"
            value={String(vehicle.year)}
          />
          <InfoItem
            icon={Fuel}
            label="Fuel Type"
            value={vehicle.fuelType}
          />
          <InfoItem
            label="Body Type"
            value={vehicle.bodyType}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <InfoItem
            label="Color"
            value={vehicle.color}
          />
          {vehicle.engineSize && (
            <InfoItem
              label="Engine"
              value={vehicle.engineSize}
            />
          )}
          {vehicle.firstRegisteredNZ && (
            <InfoItem
              label="First Registered in NZ"
              value={formatDate(vehicle.firstRegisteredNZ)}
            />
          )}
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* WOF Status */}
          <StatusCard
            title="WOF Status"
            status={vehicle.wofStatus}
            expiry={vehicle.wofExpiry}
          />

          {/* Rego Status */}
          <StatusCard
            title="Registration Status"
            status={vehicle.regoStatus}
            expiry={vehicle.regoExpiry}
          />
        </div>

        {/* Odometer History */}
        {vehicle.odometerHistory && vehicle.odometerHistory.length > 0 && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Odometer History
            </h3>
            <div className="space-y-3">
              {vehicle.odometerHistory.map((reading, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatMileage(reading.reading)}
                    </p>
                    <p className="text-sm text-gray-500">{reading.source}</p>
                  </div>
                  <p className="text-sm text-gray-500">{formatDate(reading.date)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface InfoItemProps {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

function InfoItem({ icon: Icon, label, value }: InfoItemProps) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="font-medium text-gray-900 flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-gray-400" />}
        {value}
      </p>
    </div>
  );
}

interface StatusCardProps {
  title: string;
  status: 'current' | 'expired' | 'unknown';
  expiry?: string;
}

function StatusCard({ title, status, expiry }: StatusCardProps) {
  const isCurrent = status === 'current';

  return (
    <div
      className={cn(
        'p-4 rounded-lg border',
        isCurrent
          ? 'bg-green-50 border-green-200'
          : 'bg-red-50 border-red-200'
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <div className="flex items-center gap-2">
            {isCurrent ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <span
              className={cn(
                'font-semibold',
                isCurrent ? 'text-green-700' : 'text-red-700'
              )}
            >
              {isCurrent ? 'Current' : 'Expired'}
            </span>
          </div>
        </div>
        {expiry && (
          <div className="text-right">
            <p className="text-xs text-gray-500">
              {isCurrent ? 'Expires' : 'Expired'}
            </p>
            <p className="font-medium text-gray-900">{formatDate(expiry)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
