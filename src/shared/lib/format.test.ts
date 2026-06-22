import { describe, expect, it } from "vitest";
import { formatCompactIncome, formatWon } from "./format";

describe("currency formatting", () => {
  it("formats Korean won amounts", () => {
    expect(formatWon(320_000)).toBe("320,000원");
    expect(formatCompactIncome(320_000)).toBe("32만");
    expect(formatCompactIncome(155_000)).toBe("15.5만");
  });
});
