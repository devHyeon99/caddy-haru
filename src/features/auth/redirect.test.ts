import { describe, expect, it } from "vitest";
import { getSafeRedirectPath } from "./redirect";

describe("getSafeRedirectPath", () => {
  it("accepts relative application paths", () => {
    expect(getSafeRedirectPath("/onboarding")).toBe("/onboarding");
  });

  it("rejects absolute and protocol-relative URLs", () => {
    expect(getSafeRedirectPath("https://example.com")).toBe("/");
    expect(getSafeRedirectPath("//example.com")).toBe("/");
  });

  it("uses the home page when no path is supplied", () => {
    expect(getSafeRedirectPath(null)).toBe("/");
  });
});
