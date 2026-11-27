import { describe, expect, it } from 'vitest';
import { isRoundSlot } from './domain.js';

describe('isRoundSlot (FR-005)', () => {
  it('1·2·3부만 허용', () => {
    expect([1, 2, 3].every(isRoundSlot)).toBe(true);
    expect([0, 4, 1.5, '1', null].some(isRoundSlot)).toBe(false);
  });
});
