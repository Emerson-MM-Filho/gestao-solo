/**
 * Date generation utilities for historical order data
 */

/**
 * Generate a random date within a range of days ago
 */
export function randomDateInPast(maxDaysAgo: number, minDaysAgo = 0): Date {
  const now = new Date();
  const maxMs = maxDaysAgo * 24 * 60 * 60 * 1000;
  const minMs = minDaysAgo * 24 * 60 * 60 * 1000;
  const randomMs = minMs + Math.random() * (maxMs - minMs);

  const date = new Date(now.getTime() - randomMs);

  // Add random hours/minutes for realistic distribution
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  date.setSeconds(0);
  date.setMilliseconds(0);

  return date;
}

/**
 * Generate random date between two dates
 */
export function randomDateBetween(start: Date, end: Date): Date {
  const startMs = start.getTime();
  const endMs = end.getTime();
  const randomMs = startMs + Math.random() * (endMs - startMs);
  return new Date(randomMs);
}

/**
 * Get date ranges for seeding
 */
export function getDateRanges(daysInPast: number) {
  const now = new Date();
  const past = new Date(now.getTime() - daysInPast * 24 * 60 * 60 * 1000);

  return {
    now,
    past,
    daysAgo: daysInPast,
  };
}

/**
 * Convert date to ISO string for Supabase
 */
export function toISOString(date: Date): string {
  return date.toISOString();
}
