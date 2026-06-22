import { describe, expect, it } from "vitest";
import { sumIncome, type RoundEntry } from "./round";

const entries: RoundEntry[] = [
  {
    id: "round-1",
    workDate: "2026-06-18",
    caddieFee: 150_000,
    overFee: 20_000,
    paymentMethod: "cash",
  },
  {
    id: "round-2",
    workDate: "2026-06-18",
    caddieFee: 150_000,
    overFee: 0,
    paymentMethod: "transfer",
  },
];

describe("round income", () => {
  it("sums caddie and over fees", () => {
    expect(sumIncome(entries)).toBe(320_000);
  });
});
