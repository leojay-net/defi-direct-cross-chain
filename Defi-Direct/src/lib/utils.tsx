import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes conditionally.
 * Uses `clsx` to conditionally apply classes and `tailwind-merge` to prevent conflicts.
 */
export function cn(...inputs: unknown[]) {
  return twMerge(clsx(inputs));
}
