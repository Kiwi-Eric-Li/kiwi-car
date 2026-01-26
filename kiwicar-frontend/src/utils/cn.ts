import { clsx, type ClassValue } from 'clsx';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
