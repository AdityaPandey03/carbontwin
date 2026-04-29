import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine class names *and* deduplicate conflicting Tailwind utilities
 * (e.g. `bg-primary` + `bg-emerald-600` → keeps the last one).
 */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));
