export function formatWon(value: number) {
  return `${new Intl.NumberFormat("ko-KR").format(value)}원`;
}

export function formatCompactIncome(value: number) {
  if (value === 0) return "";
  if (value % 10_000 === 0) return `${value / 10_000}만`;
  return `${(value / 10_000).toFixed(1)}만`;
}

export function parseWonInput(value: string) {
  const amount = Number(value.replace(/[^0-9]/g, ""));
  return Number.isFinite(amount) ? amount : 0;
}

/** "만원" 단위 입력값(소수 허용)을 원 단위 정수로 변환. "15" → 150000, "15.5" → 155000 */
export function parseManInput(value: string): number {
  const num = Number(value.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(num)) return 0;
  return Math.round(num * 10_000);
}

/** 원 단위 정수를 "만원" 입력 표시용 문자열로 변환. 150000 → "15", 155000 → "15.5" */
export function formatManValue(won: number): string {
  if (won === 0) return "";
  return String(won / 10_000);
}
