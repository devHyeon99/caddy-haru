export function isSupabaseAuthCookie(name: string) {
  return /^sb-.+-auth-token(?:\.\d+)?$/.test(name);
}

export function isMissingRefreshTokenError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "refresh_token_not_found"
  );
}
