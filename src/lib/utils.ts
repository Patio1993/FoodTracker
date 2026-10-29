import { format } from "date-fns";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/**
 * Today's date as yyyy-MM-dd in the user's local time zone. toISOString() would
 * give the UTC date, which is still "yesterday" for the first hours of a local day.
 */
export function todayLocal(): string {
  return format(new Date(), "yyyy-MM-dd");
}
