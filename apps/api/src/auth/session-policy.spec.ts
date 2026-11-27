import { describe, expect, it } from 'vitest';
import { needsRenewal, newExpiry, SESSION_MAX_AGE_SEC } from './session-policy.js';

const DAY = 24 * 60 * 60 * 1000;

// ADR-0004: 30일, 남은 기간 15일 미만이면 연장
describe('session-policy', () => {
  const now = new Date('2026-12-01T00:00:00Z');

  it('수명은 30일', () => {
    expect(newExpiry(now).getTime() - now.getTime()).toBe(30 * DAY);
    expect(SESSION_MAX_AGE_SEC).toBe(2592000);
  });

  it('15일 미만 남으면 연장, 15일 이상이면 그대로', () => {
    expect(needsRenewal(new Date(now.getTime() + 15 * DAY - 1), now)).toBe(true);
    expect(needsRenewal(new Date(now.getTime() + 15 * DAY), now)).toBe(false);
    expect(needsRenewal(new Date(now.getTime() + 30 * DAY), now)).toBe(false);
  });
});
