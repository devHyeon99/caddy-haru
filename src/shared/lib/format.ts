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
