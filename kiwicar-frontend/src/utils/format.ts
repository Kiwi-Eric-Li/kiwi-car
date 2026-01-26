import { format, formatDistanceToNow, parseISO } from 'date-fns';

/**
 * Format price in NZD
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Format mileage with km suffix
 */
export function formatMileage(km: number): string {
  return `${new Intl.NumberFormat('en-NZ').format(km)} km`;
}

/**
 * Format date in NZ format
 */
export function formatDate(dateString: string): string {
  return format(parseISO(dateString), 'd MMM yyyy');
}

/**
 * Format date as relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(dateString: string): string {
  return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
}

/**
 * Format NZ phone number
 */
export function formatPhone(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // NZ mobile format: 021 123 4567
  if (digits.startsWith('64')) {
    const local = digits.slice(2);
    if (local.length === 9) {
      return `0${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5)}`;
    }
  }

  if (digits.startsWith('0') && digits.length === 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }

  return phone;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
}

/**
 * Validate NZ plate format
 */
export function isValidNZPlate(plate: string): boolean {
  // NZ plates: ABC123 or AB1234 or ABC12 formats
  const patterns = [
    /^[A-Z]{3}\d{3}$/,  // ABC123
    /^[A-Z]{2}\d{4}$/,  // AB1234
    /^[A-Z]{3}\d{2}$/,  // ABC12
    /^[A-Z]{1}\d{4,5}$/, // Older formats
  ];
  const upperPlate = plate.toUpperCase().replace(/\s/g, '');
  return patterns.some((pattern) => pattern.test(upperPlate));
}

/**
 * Format plate number to uppercase without spaces
 */
export function formatPlate(plate: string): string {
  return plate.toUpperCase().replace(/\s/g, '');
}
