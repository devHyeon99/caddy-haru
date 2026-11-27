// 계산식 — 프론트·백이 같은 함수를 쓴다 (architecture §3.3, data-model §5, NFR-005)
// 부동소수를 쓰지 않는다: 환산 라운드 수는 "반 라운드" 정수로 다룬다.

/** 나인추가 기본 금액 = ⌊캐디피 ÷ 2⌋ × 횟수 (원 단위 내림) — FR-008, AC-008-1·3·9 */
export function defaultNineExtFee(caddyFee: number, nineExtCount: number): number {
  return Math.floor(caddyFee / 2) * nineExtCount;
}

/** 라운드 수입 = 캐디피 + 나인추가 금액 + 오버피 — AC-008-2, AC-N005-2 */
export function roundIncome(round: {
  caddyFee: number;
  nineExtFee: number;
  overFee: number;
}): number {
  return round.caddyFee + round.nineExtFee + round.overFee;
}

/** 라운드 1건의 반 라운드 수 = 2 + 나인추가 횟수 (라운드 1건 = 2, 나인추가 1회 = +1) — Q-024 */
export function roundHalfUnits(nineExtCount: number): number {
  return 2 + nineExtCount;
}

/**
 * 라운드당 평균 = 수입 합계 ÷ (반 라운드 수 ÷ 2), 원 단위 반올림 — FR-011, AC-011-1·2·3·5
 * 정수 연산 (2a + b) div (2b), a = 수입 × 2, b = 반 라운드 수. 라운드가 없으면 null("-" 표시).
 */
export function averagePerRound(incomeTotal: number, halfUnitsTotal: number): number | null {
  if (halfUnitsTotal <= 0) return null;
  const a = incomeTotal * 2;
  const b = halfUnitsTotal;
  return Math.floor((2 * a + b) / (2 * b));
}

/** 반 라운드 수 → 화면 표시 "2", "1.5", "2.5" — api-spec §1.1, ui-design §1.2 */
export function formatRoundCount(halfUnits: number): string {
  const whole = Math.floor(halfUnits / 2);
  return halfUnits % 2 === 0 ? String(whole) : `${whole}.5`;
}
