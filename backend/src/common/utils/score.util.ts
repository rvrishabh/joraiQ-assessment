/** Accuracy as a percentage with two decimals. Zero questions score 0. */
export function toAccuracy(correct: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((correct / total) * 10000) / 100;
}

export interface Rankable {
  correctCount: number;
  totalQuestions: number;
  submittedAt: Date;
}

/**
 * Standard competition ranking: equal accuracy shares a rank and the next
 * distinct score skips ahead (100, 90, 90, 80 -> 1, 2, 2, 4). Ties are
 * listed earliest submission first.
 */
export function rankEntries<T extends Rankable>(
  entries: T[],
): Array<T & { accuracy: number; rank: number }> {
  const scored = entries
    .map((e) => ({ ...e, accuracy: toAccuracy(e.correctCount, e.totalQuestions) }))
    .sort(
      (a, b) =>
        b.accuracy - a.accuracy ||
        a.submittedAt.getTime() - b.submittedAt.getTime(),
    );

  return scored.map((entry) => ({
    ...entry,
    rank: scored.filter((o) => o.accuracy > entry.accuracy).length + 1,
  }));
}
