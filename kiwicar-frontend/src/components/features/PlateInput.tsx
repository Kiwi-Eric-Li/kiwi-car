import { useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/utils';
import { isValidNZPlate, formatPlate } from '@/utils/format';
import Button from '@/components/common/Button';

interface PlateInputProps {
  onSubmit: (plate: string) => void;
  isLoading?: boolean;
  className?: string;
}

export default function PlateInput({
  onSubmit,
  isLoading = false,
  className,
}: PlateInputProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPlate(e.target.value);
    setValue(formatted);
    setError(null);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const plate = formatPlate(value);

      if (!plate) {
        setError('Please enter a plate number');
        return;
      }

      if (!isValidNZPlate(plate)) {
        setError('Please enter a valid NZ plate number');
        return;
      }

      onSubmit(plate);
    },
    [value, onSubmit]
  );

  return (
    <form onSubmit={handleSubmit} className={cn('w-full max-w-md', className)}>
      <div className="flex flex-col items-center gap-4">
        {/* NZ Plate Styled Input */}
        <div className="relative w-full">
          <div
            className={cn(
              'bg-white border-4 border-gray-800 rounded-lg px-4 py-3',
              'shadow-lg',
              error && 'border-red-500'
            )}
          >
            <input
              type="text"
              value={value}
              onChange={handleChange}
              placeholder="ABC123"
              maxLength={7}
              className={cn(
                'w-full text-center text-3xl md:text-4xl font-bold tracking-[0.25em] uppercase',
                'bg-transparent border-none outline-none',
                'placeholder:text-gray-300 placeholder:tracking-[0.25em]'
              )}
              disabled={isLoading}
            />
          </div>
          {/* NZ Flag indicator */}
          <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-8 h-8 bg-blue-700 rounded-sm">
            <span className="text-[8px] text-white font-bold">NZ</span>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}

        <Button
          type="submit"
          size="lg"
          isLoading={isLoading}
          disabled={!value}
          className="px-8"
        >
          <Search className="h-5 w-5 mr-2" />
          Look Up Vehicle
        </Button>
      </div>
    </form>
  );
}
