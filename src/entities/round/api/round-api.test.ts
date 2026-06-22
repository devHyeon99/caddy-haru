import { describe, expect, it } from "vitest";
import { mapRoundEntry, toRoundEntryPayload } from "./round-api";

describe("round entry mapping", () => {
  it("maps a database row to the calendar model", () => {
    expect(
      mapRoundEntry({
        id: "round-1",
        work_date: "2026-06-21",
        caddie_fee: 150_000,
        over_fee: 20_000,
        payment_method: "cash",
        memo: null,
      }),
    ).toEqual({
      id: "round-1",
      workDate: "2026-06-21",
      caddieFee: 150_000,
      overFee: 20_000,
      paymentMethod: "cash",
      memo: undefined,
    });
  });

  it("builds a database payload with a course snapshot", () => {
    expect(
      toRoundEntryPayload(
        {
          workDate: "2026-06-21",
          caddieFee: 150_000,
          overFee: 0,
          paymentMethod: "transfer",
        },
        "레이크 골프클럽",
      ),
    ).toEqual({
      work_date: "2026-06-21",
      caddie_fee: 150_000,
      over_fee: 0,
      payment_method: "transfer",
      course_name_snapshot: "레이크 골프클럽",
      memo: null,
    });
  });
});
