import { describe, expect, it } from "vitest";
import {
  isMissingRefreshTokenError,
  isSupabaseAuthCookie,
} from "./auth-cookie";

describe("isSupabaseAuthCookie", () => {
  it.each([
    "sb-projectref-auth-token",
    "sb-projectref-auth-token.0",
    "sb-projectref-auth-token.12",
  ])("recognizes %s", (name) => {
    expect(isSupabaseAuthCookie(name)).toBe(true);
  });

  it.each(["theme", "sb-projectref-code-verifier", "auth-token"])(
    "ignores %s",
    (name) => {
      expect(isSupabaseAuthCookie(name)).toBe(false);
    },
  );
});

describe("isMissingRefreshTokenError", () => {
  it("recognizes the stale refresh token error", () => {
    expect(
      isMissingRefreshTokenError({ code: "refresh_token_not_found" }),
    ).toBe(true);
  });

  it("ignores unrelated errors", () => {
    expect(isMissingRefreshTokenError({ code: "network_error" })).toBe(false);
  });
});
