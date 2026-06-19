import { describe, expect, it } from "vitest";
import {
  formatCompactIncome,
  formatWon,
  getMonthCells,
  sumIncome,
  type RoundEntry,
} from "./calendar";

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

describe("calendar utilities", () => {
  it("builds a Sunday-first calendar grid", () => {
    const cells = getMonthCells(2026, 5);

    expect(cells).toHaveLength(35);
    expect(cells[1]?.dateKey).toBe("2026-06-01");
    expect(cells[30]?.dateKey).toBe("2026-06-30");
  });

  it("sums caddie and over fees", () => {
    expect(sumIncome(entries)).toBe(320_000);
  });

  it("formats Korean won amounts", () => {
    expect(formatWon(320_000)).toBe("320,000원");
    expect(formatCompactIncome(320_000)).toBe("32만");
    expect(formatCompactIncome(155_000)).toBe("15.5만");
  });
});
