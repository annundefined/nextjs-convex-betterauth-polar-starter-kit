import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility for merging Tailwind CSS classes conditionally.
 * Combines clsx (for conditional classes) with tailwind-merge (to handle conflicts).
 *
 * Example: cn("p-4", isActive && "bg-blue-500", "p-2") → "p-2 bg-blue-500"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
