import { describe, expect, it } from "vitest";
import { getMonthCells } from "./calendar";

describe("calendar grid", () => {
  it("builds a Sunday-first calendar grid", () => {
    const cells = getMonthCells(2026, 5);

    expect(cells).toHaveLength(35);
    expect(cells[1]?.dateKey).toBe("2026-06-01");
    expect(cells[30]?.dateKey).toBe("2026-06-30");
  });
});
