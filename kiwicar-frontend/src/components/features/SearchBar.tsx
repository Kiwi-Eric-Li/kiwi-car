import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { cn } from '@/utils';
import { useFilterStore } from '@/stores/filterStore';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  onSearch?: (query: string) => void;
  navigateOnSearch?: boolean;
}

export default function SearchBar({
  placeholder = 'Search make, model, or keyword...',
  className,
  autoFocus = false,
  onSearch,
  navigateOnSearch = false,
}: SearchBarProps) {
  const [value, setValue] = useState('');
  const { setFilter } = useFilterStore();
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const query = value.trim();

      if (onSearch) {
        onSearch(query);
      } else {
        setFilter('keyword', query);
        if (navigateOnSearch) {
          navigate(`/buy?q=${encodeURIComponent(query)}`);
        }
      }
    },
    [value, onSearch, setFilter, navigateOnSearch, navigate]
  );

  const handleClear = useCallback(() => {
    setValue('');
    setFilter('keyword', '');
    onSearch?.('');
  }, [onSearch, setFilter]);

  return (
    <form onSubmit={handleSubmit} className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={cn(
            'w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 bg-white',
            'text-gray-900 placeholder-gray-400',
            'focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500',
            'transition-colors'
          )}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
}
