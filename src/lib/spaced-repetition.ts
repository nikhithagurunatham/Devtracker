/**
 * DevTrack AI Spaced Repetition Engine
 * Implements adaptive spaced intervals based on confidence scores (1-5) and historical repetition count.
 */

export interface SpacedRepetitionResult {
  nextIntervalDays: number;
  nextRevisionDate: string; // YYYY-MM-DD
  newEaseFactor: number;
  newRepetitionCount: number;
}

/**
 * Calculates the next revision schedule given confidence (1-5) and previous state.
 */
export function calculateNextRevision(
  confidence: number,
  previousRepetitions: number = 0,
  previousIntervalDays: number = 1,
  previousEaseFactor: number = 2.5
): SpacedRepetitionResult {
  // Confidence scale:
  // 1 — Don't understand -> tomorrow (1 day)
  // 2 — Struggled -> 2 days
  // 3 — Can solve with hints -> 4 days
  // 4 — Can solve independently -> 7 days
  // 5 — Can solve quickly -> 14 days

  const baseDaysMap: Record<number, number> = {
    1: 1,
    2: 2,
    3: 4,
    4: 7,
    5: 14,
  };

  const clampedConfidence = Math.min(5, Math.max(1, Math.round(confidence)));
  const baseDays = baseDaysMap[clampedConfidence] || 1;

  let newRepetitionCount = previousRepetitions;
  let nextIntervalDays = baseDays;

  // SuperMemo SM-2 style ease factor update
  let newEaseFactor =
    previousEaseFactor +
    (0.1 - (5 - clampedConfidence) * (0.08 + (5 - clampedConfidence) * 0.02));
  if (newEaseFactor < 1.3) newEaseFactor = 1.3;

  if (clampedConfidence < 3) {
    // User struggled or didn't understand — reset repetitions and schedule very soon
    newRepetitionCount = 0;
    nextIntervalDays = baseDays;
  } else {
    // User succeeded (3, 4, 5)
    newRepetitionCount = previousRepetitions + 1;
    if (newRepetitionCount === 1) {
      nextIntervalDays = baseDays;
    } else if (newRepetitionCount === 2) {
      nextIntervalDays = Math.max(baseDays, Math.round(previousIntervalDays * 1.5));
    } else {
      nextIntervalDays = Math.round(previousIntervalDays * newEaseFactor);
    }
  }

  // Calculate future date YYYY-MM-DD
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + nextIntervalDays);
  const nextRevisionDate = targetDate.toISOString().split('T')[0];

  return {
    nextIntervalDays,
    nextRevisionDate,
    newEaseFactor: parseFloat(newEaseFactor.toFixed(2)),
    newRepetitionCount,
  };
}

export function isRevisionDue(scheduledDateStr?: string): boolean {
  if (!scheduledDateStr) return false;
  const today = new Date().toISOString().split('T')[0];
  return scheduledDateStr <= today;
}
