/**
 * SM-2 Spaced Repetition Algorithm
 *
 * Implements the SuperMemo 2 algorithm for optimal review scheduling.
 * Based on: https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method
 *
 * Key concepts:
 * - Quality (0-5): How well the user recalled the item
 * - Easiness Factor (EF): How easy the item is to remember (2.5 default)
 * - Interval: Days until next review
 * - Repetition: Number of successful consecutive reviews
 */

// ============================================================================
// Types
// ============================================================================

/**
 * SM-2 calculation input
 */
export interface SM2Input {
  quality: number; // 0-5 (user rating)
  easinessFactor: number; // Current EF (typically 1.3 - 2.5)
  interval: number; // Current interval in days
  repetition: number; // Number of consecutive successful reviews
}

/**
 * SM-2 calculation output
 */
export interface SM2Output {
  easinessFactor: number; // New EF
  interval: number; // New interval in days
  repetition: number; // New repetition count
  nextReviewDate: string; // ISO date string for next review
}

/**
 * Quality rating mapping for user-friendly interface
 */
export enum ReviewQuality {
  COMPLETE_BLACKOUT = 0, // Total failure to recall
  INCORRECT = 1, // Incorrect response, correct answer remembered
  INCORRECT_EASY = 2, // Incorrect, but correct answer seemed easy
  CORRECT_DIFFICULT = 3, // Correct with serious difficulty
  CORRECT_HESITATION = 4, // Correct with some hesitation
  PERFECT = 5 // Perfect recall, no hesitation
}

/**
 * Simplified quality levels for user interface
 */
export enum SimpleQuality {
  HARD = 0, // Maps to quality 3
  MEDIUM = 1, // Maps to quality 4
  EASY = 2 // Maps to quality 5
}

// ============================================================================
// Core SM-2 Algorithm
// ============================================================================

/**
 * Calculate next review schedule using SM-2 algorithm
 *
 * @param input - Current state (quality, EF, interval, repetition)
 * @returns Next state (new EF, interval, repetition, next review date)
 */
export function calculateSM2(input: SM2Input): SM2Output {
  const { quality, easinessFactor, interval, repetition } = input;

  // Validate input
  if (quality < 0 || quality > 5) {
    throw new Error(`Quality must be between 0 and 5, got ${quality}`);
  }

  if (easinessFactor < 1.3) {
    throw new Error(`Easiness factor must be >= 1.3, got ${easinessFactor}`);
  }

  // Calculate new easiness factor
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const newEF = Math.max(
    1.3,
    easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  let newRepetition: number;
  let newInterval: number;

  // Quality < 3 means failure to recall
  if (quality < 3) {
    // Reset repetition count, start over
    newRepetition = 0;
    newInterval = 1; // Review again tomorrow
  } else {
    // Successful recall
    newRepetition = repetition + 1;

    // Calculate new interval based on repetition count
    if (newRepetition === 1) {
      newInterval = 1; // First review: 1 day
    } else if (newRepetition === 2) {
      newInterval = 6; // Second review: 6 days
    } else {
      // Subsequent reviews: multiply previous interval by EF
      newInterval = Math.round(interval * newEF);
    }
  }

  // Calculate next review date
  const nextReviewDate = getNextReviewDate(newInterval);

  return {
    easinessFactor: newEF,
    interval: newInterval,
    repetition: newRepetition,
    nextReviewDate
  };
}

/**
 * Calculate next review date from current date + interval
 *
 * @param intervalDays - Number of days until next review
 * @returns ISO date string (YYYY-MM-DD)
 */
export function getNextReviewDate(intervalDays: number): string {
  const today = new Date();
  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + intervalDays);

  return nextDate.toISOString().split('T')[0]; // YYYY-MM-DD
}

// ============================================================================
// Simplified Interface for UI
// ============================================================================

/**
 * Convert simple quality rating (Hard/Medium/Easy) to SM-2 quality (0-5)
 *
 * Mapping:
 * - Hard (0) → Quality 3 (correct with difficulty)
 * - Medium (1) → Quality 4 (correct with hesitation)
 * - Easy (2) → Quality 5 (perfect recall)
 */
export function simpleQualityToSM2(simpleQuality: SimpleQuality): number {
  const mapping: Record<SimpleQuality, number> = {
    [SimpleQuality.HARD]: 3,
    [SimpleQuality.MEDIUM]: 4,
    [SimpleQuality.EASY]: 5
  };

  return mapping[simpleQuality];
}

/**
 * High-level function for updating review schedule
 *
 * @param simpleQuality - User rating (Hard/Medium/Easy)
 * @param currentEF - Current easiness factor
 * @param currentInterval - Current interval in days
 * @param currentRepetition - Current repetition count
 * @returns Updated schedule
 */
export function updateReviewSchedule(
  simpleQuality: SimpleQuality,
  currentEF: number = 2.5,
  currentInterval: number = 1,
  currentRepetition: number = 0
): SM2Output {
  const quality = simpleQualityToSM2(simpleQuality);

  return calculateSM2({
    quality,
    easinessFactor: currentEF,
    interval: currentInterval,
    repetition: currentRepetition
  });
}

// ============================================================================
// Initial Schedule Creation
// ============================================================================

/**
 * Create initial review schedule for a new artwork
 *
 * @returns Initial schedule (EF=2.5, interval=1, repetition=0, review today)
 */
export function createInitialSchedule(): SM2Output {
  const today = new Date().toISOString().split('T')[0];

  return {
    easinessFactor: 2.5,
    interval: 1,
    repetition: 0,
    nextReviewDate: today // Review immediately for first time
  };
}

// ============================================================================
// Statistics and Analysis
// ============================================================================

/**
 * Estimate number of reviews needed to reach long-term memory
 *
 * Typically 5-7 successful reviews with increasing intervals
 *
 * @param currentRepetition - Current repetition count
 * @returns Estimated reviews remaining
 */
export function estimateReviewsToMastery(currentRepetition: number): number {
  const MASTERY_THRESHOLD = 7; // After 7 successful reviews, consider "mastered"
  return Math.max(0, MASTERY_THRESHOLD - currentRepetition);
}

/**
 * Calculate retention probability based on days since last review
 *
 * Simple exponential decay model (not part of original SM-2)
 *
 * @param daysSinceReview - Days since last review
 * @param easinessFactor - Current EF (higher = easier to remember)
 * @returns Estimated retention probability (0-1)
 */
export function estimateRetention(
  daysSinceReview: number,
  easinessFactor: number
): number {
  // Decay rate inversely proportional to EF
  // Easier items decay slower
  const decayRate = 0.1 / easinessFactor;

  return Math.exp(-decayRate * daysSinceReview);
}

/**
 * Get recommended daily review limit
 *
 * SM-2 works best with consistent daily reviews (5-10 items per day)
 *
 * @param totalItems - Total number of items in collection
 * @returns Recommended daily review count
 */
export function getRecommendedDailyLimit(totalItems: number): number {
  // For 328 artworks, recommended ~5-10 per day
  if (totalItems <= 100) return 5;
  if (totalItems <= 300) return 8;
  return 10;
}
