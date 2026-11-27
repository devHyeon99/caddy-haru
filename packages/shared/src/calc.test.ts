import { describe, expect, it } from 'vitest';
import {
  averagePerRound,
  defaultNineExtFee,
  formatRoundCount,
  roundHalfUnits,
  roundIncome,
} from './calc.js';

describe('defaultNineExtFee (FR-008)', () => {
  it('AC-008-1: 캐디피 160,000 · 1회 → 80,000', () => {
    expect(defaultNineExtFee(160_000, 1)).toBe(80_000);
  });
  it('AC-008-3: 캐디피 160,000 · 2회 → 160,000', () => {
    expect(defaultNineExtFee(160_000, 2)).toBe(160_000);
  });
  it('AC-008-9: 캐디피 155,555 · 1회 → 77,777 (원 단위 내림)', () => {
    expect(defaultNineExtFee(155_555, 1)).toBe(77_777);
  });
  it('AC-008-5: 캐디피 150,000 → 1회당 75,000', () => {
    expect(defaultNineExtFee(150_000, 2)).toBe(150_000);
  });
  it('AC-008-8: 0회 → 0', () => {
    expect(defaultNineExtFee(160_000, 0)).toBe(0);
  });
});

describe('roundIncome · roundHalfUnits', () => {
  it('AC-008-2: 160,000 + 80,000 + 20,000 = 260,000, 환산 1.5라운드', () => {
    expect(roundIncome({ caddyFee: 160_000, nineExtFee: 80_000, overFee: 20_000 })).toBe(260_000);
    expect(formatRoundCount(roundHalfUnits(1))).toBe('1.5');
  });
  it('AC-008-3: 나인추가 2회 → 환산 2라운드', () => {
    expect(formatRoundCount(roundHalfUnits(2))).toBe('2');
  });
});

describe('averagePerRound (FR-011)', () => {
  it('AC-011-1: 510,000 ÷ 3라운드 = 170,000', () => {
    expect(averagePerRound(510_000, 6)).toBe(170_000);
  });
  it('AC-011-5: 420,000 ÷ 2.5라운드 = 168,000', () => {
    expect(averagePerRound(420_000, 5)).toBe(168_000);
  });
  it('AC-011-2: 라운드 0건 → null ("-" 표시, 0으로 나누기 없음)', () => {
    expect(averagePerRound(0, 0)).toBeNull();
  });
  it('AC-011-3: 나누어떨어지지 않으면 원 단위 반올림', () => {
    // 100,001 ÷ 2라운드 = 50,000.5 → 50,001 (반올림)
    expect(averagePerRound(100_001, 4)).toBe(50_001);
    // 100,000 ÷ 3라운드 = 33,333.33… → 33,333
    expect(averagePerRound(100_000, 6)).toBe(33_333);
    // 200,000 ÷ 3라운드 = 66,666.66… → 66,667
    expect(averagePerRound(200_000, 6)).toBe(66_667);
  });
});

describe('formatRoundCount', () => {
  it.each([
    [0, '0'],
    [2, '1'],
    [3, '1.5'],
    [4, '2'],
    [5, '2.5'],
  ])('반 라운드 %i → "%s"', (half, text) => {
    expect(formatRoundCount(half)).toBe(text);
  });
});
