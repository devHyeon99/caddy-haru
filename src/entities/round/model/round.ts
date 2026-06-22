export type PaymentMethod = "cash" | "transfer";

export type RoundEntry = {
  id: string;
  workDate: string;
  caddieFee: number;
  overFee: number;
  paymentMethod: PaymentMethod;
  memo?: string;
};

export function getRoundIncome(entry: RoundEntry) {
  return entry.caddieFee + entry.overFee;
}

export function sumIncome(entries: RoundEntry[]) {
  return entries.reduce((sum, entry) => sum + getRoundIncome(entry), 0);
}
