import { describe, expect, it } from "vitest";
import { validateOnboarding } from "./validation";

describe("validateOnboarding", () => {
  it("normalizes a valid profile (만원 단위 입력 → 원)", () => {
    expect(validateOnboarding("  레이크 골프클럽  ", "16")).toEqual({
      success: true,
      data: { courseName: "레이크 골프클럽", defaultCaddieFee: 160_000 },
    });
  });

  it("accepts a decimal 만원 fee", () => {
    expect(validateOnboarding("레이크 골프클럽", "16.5")).toEqual({
      success: true,
      data: { courseName: "레이크 골프클럽", defaultCaddieFee: 165_000 },
    });
  });

  it("rejects a fee over the 1,000만원 limit", () => {
    expect(validateOnboarding("레이크 골프클럽", "1600")).toEqual({
      success: false,
      error: "기본 캐디피는 1,000만원 이하로 입력해 주세요.",
    });
  });

  it("rejects an empty course name", () => {
    expect(validateOnboarding("  ", "160000")).toEqual({
      success: false,
      error: "골프장 이름을 100자 이내로 입력해 주세요.",
    });
  });

  it("rejects an invalid fee", () => {
    expect(validateOnboarding("레이크 골프클럽", "16만원")).toEqual({
      success: false,
      error: "기본 캐디피를 숫자로 입력해 주세요.",
    });
  });
});
