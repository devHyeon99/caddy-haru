// 도메인 상수 — srs.md 공통 입력 규칙, api-spec.md §5(D3·D4), data-model.md §4

/** 부(1부·2부·3부) — FR-005 */
export const ROUND_SLOTS = [1, 2, 3] as const;
export type RoundSlot = (typeof ROUND_SLOTS)[number];

/** 캐디피·기본 캐디피·나인추가 금액 범위(원, 정수) — AC-001-3, AC-006-3, AC-008-4 */
export const FEE_MIN = 1;
export const FEE_MAX = 1_000_000;

/** 오버피 범위(원, 정수) — AC-002-1·3 */
export const OVER_FEE_MIN = 0;
export const OVER_FEE_MAX = 1_000_000;

/** 나인추가 — 1부만(AC-008-6·7), 최대 2회(AC-008-10) */
export const NINE_EXT_SLOT: RoundSlot = 1;
export const NINE_EXT_MAX_COUNT = 2;

/** 골프장 이름 길이(앞뒤 공백 제거 후) — data-model.md §4, api-spec.md C2, AC-004-1 */
export const GOLF_CLUB_NAME_MIN_LENGTH = 1;
export const GOLF_CLUB_NAME_MAX_LENGTH = 50;

export function isRoundSlot(value: unknown): value is RoundSlot {
  return value === 1 || value === 2 || value === 3;
}
