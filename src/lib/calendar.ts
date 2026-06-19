export type PaymentMethod = "cash" | "transfer";

export type RoundEntry = {
  id: string;
  workDate: string;
  caddieFee: number;
  overFee: number;
  paymentMethod: PaymentMethod;
  memo?: string;
};

export type CalendarCell = {
  day: number;
  dateKey: string;
} | null;

export function toDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function getMonthCells(year: number, month: number): CalendarCell[] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: CalendarCell[] = Array.from(
    { length: firstWeekday },
    () => null,
  );

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ day, dateKey: toDateKey(year, month, day) });
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

export function getRoundIncome(entry: RoundEntry) {
  return entry.caddieFee + entry.overFee;
}

export function sumIncome(entries: RoundEntry[]) {
  return entries.reduce((sum, entry) => sum + getRoundIncome(entry), 0);
}

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
