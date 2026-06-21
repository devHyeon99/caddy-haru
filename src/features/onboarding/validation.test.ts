import { describe, expect, it } from "vitest";
import { validateOnboarding } from "./validation";

describe("validateOnboarding", () => {
  it("normalizes a valid profile", () => {
    expect(validateOnboarding("  레이크 골프클럽  ", "150,000")).toEqual({
      success: true,
      data: { courseName: "레이크 골프클럽", defaultCaddieFee: 150_000 },
    });
  });

  it("rejects an empty course name", () => {
    expect(validateOnboarding("  ", "150000")).toEqual({
      success: false,
      error: "골프장 이름을 100자 이내로 입력해 주세요.",
    });
  });

  it("rejects an invalid fee", () => {
    expect(validateOnboarding("레이크 골프클럽", "15만원")).toEqual({
      success: false,
      error: "기본 캐디피를 숫자로 입력해 주세요.",
    });
  });
});
