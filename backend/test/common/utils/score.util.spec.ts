import { rankEntries, toAccuracy } from 'src/common/utils/score.util';

const at = (m: number) => new Date(2026, 0, 1, 10, m);

describe('toAccuracy', () => {
  it('rounds to two decimals', () => {
    expect(toAccuracy(2, 3)).toBe(66.67);
    expect(toAccuracy(4, 4)).toBe(100);
  });

  it('returns 0 when there are no questions', () => {
    expect(toAccuracy(0, 0)).toBe(0);
  });
});

describe('rankEntries', () => {
  it('gives equal accuracy the same rank and skips the next one', () => {
    const ranked = rankEntries([
      { name: 'a', correctCount: 3, totalQuestions: 4, submittedAt: at(5) },
      { name: 'b', correctCount: 4, totalQuestions: 4, submittedAt: at(9) },
      { name: 'c', correctCount: 3, totalQuestions: 4, submittedAt: at(1) },
      { name: 'd', correctCount: 1, totalQuestions: 4, submittedAt: at(2) },
    ]);

    expect(ranked.map((r) => [r.name, r.rank])).toEqual([
      ['b', 1],
      ['c', 2],
      ['a', 2],
      ['d', 4],
    ]);
  });

  it('ranks everyone first when all scores match', () => {
    const ranked = rankEntries([
      { correctCount: 2, totalQuestions: 5, submittedAt: at(1) },
      { correctCount: 2, totalQuestions: 5, submittedAt: at(2) },
    ]);
    expect(ranked.map((r) => r.rank)).toEqual([1, 1]);
  });

  it('handles an empty list', () => {
    expect(rankEntries([])).toEqual([]);
  });
});
