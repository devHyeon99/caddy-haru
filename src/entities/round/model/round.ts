export type PaymentMethod = "cash" | "transfer";

export type RoundEntry = {
  id: string;
  workDate: string;
  caddieFee: number;
  overFee: number;
  nineFee: number;
  paymentMethod: PaymentMethod;
  memo?: string;
};

export function getRoundIncome(entry: RoundEntry) {
  return entry.caddieFee + entry.overFee + entry.nineFee;
}

export function sumIncome(entries: RoundEntry[]) {
  return entries.reduce((sum, entry) => sum + getRoundIncome(entry), 0);
}

export function countNineRounds(entries: RoundEntry[]) {
  return entries.filter((entry) => entry.nineFee > 0).length;
}
