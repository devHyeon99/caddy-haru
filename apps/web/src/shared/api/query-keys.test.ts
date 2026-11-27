import { describe, expect, it } from 'vitest';
import { keysToInvalidateAfterRoundChange, queryKeys } from './query-keys';

describe('keysToInvalidateAfterRoundChange (AC-001-1, AC-003-4)', () => {
  it('그 달의 라운드·통계와 그날의 라운드를 무효화한다', () => {
    expect(keysToInvalidateAfterRoundChange('2026-12-03')).toEqual([
      queryKeys.roundsByMonth('2026-12'),
      queryKeys.roundsByDate('2026-12-03'),
      queryKeys.monthlyStats('2026-12'),
    ]);
  });
});
