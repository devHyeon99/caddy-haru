// 세션 수명 정책 (ADR-0004, api-spec §1.2)
const DAY_MS = 24 * 60 * 60 * 1000;

/** 세션·쿠키 수명 30일 */
export const SESSION_TTL_MS = 30 * DAY_MS;
export const SESSION_MAX_AGE_SEC = SESSION_TTL_MS / 1000;
/** 남은 기간이 15일 미만이면 요청 시 30일로 연장(슬라이딩) */
export const SESSION_RENEW_BELOW_MS = 15 * DAY_MS;
/** OAuth state 쿠키 10분 */
export const OAUTH_STATE_MAX_AGE_SEC = 10 * 60;

export function needsRenewal(expiresAt: Date, now: Date): boolean {
  return expiresAt.getTime() - now.getTime() < SESSION_RENEW_BELOW_MS;
}

export function newExpiry(now: Date): Date {
  return new Date(now.getTime() + SESSION_TTL_MS);
}
