/**
 * Random utility functions for seeding
 */

/**
 * Pick random element from array
 */
export function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Pick multiple unique random elements
 * Uses proper Fisher-Yates shuffle for uniform distribution
 */
export function pickRandomMany<T>(array: T[], count: number): T[] {
  return shuffle(array).slice(0, Math.min(count, array.length));
}

/**
 * Random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Random float between min and max
 */
export function randomFloat(min: number, max: number, decimals = 2): number {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
}

/**
 * Random boolean with probability (0-1)
 */
export function randomBool(probability = 0.5): boolean {
  return Math.random() < probability;
}

/**
 * Weighted random selection
 */
export function weightedRandom<T extends string>(
  weights: Record<T, number>,
): T {
  const entries = Object.entries(weights) as Array<[T, number]>;
  const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let random = Math.random() * totalWeight;

  for (const [key, weight] of entries) {
    random -= weight;
    if (random <= 0) {
      return key;
    }
  }

  return entries[0][0]; // Fallback
}

/**
 * Shuffle array in place
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
