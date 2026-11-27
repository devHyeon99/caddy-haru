// 쿠키 읽기·쓰기 (ADR-0004, architecture §4.1). 의존성 없이 필요한 만큼만 구현한다.

/** 세션 쿠키 — `__Host-`: Secure + Path=/ + Domain 없음을 브라우저가 강제 */
export const SESSION_COOKIE = '__Host-sid';
/** OAuth CSRF 방지 state 쿠키 */
export const OAUTH_STATE_COOKIE = '__Host-oauth_state';

/** `Cookie` 헤더 → 이름별 값. 같은 이름이 여러 번 오면 첫 번째 값을 쓴다 */
export function parseCookies(header: string | undefined): Map<string, string> {
  const result = new Map<string, string>();
  if (!header) return result;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    const name = part.slice(0, eq).trim();
    if (!name || result.has(name)) continue;
    let value = part.slice(eq + 1).trim();
    if (value.startsWith('"') && value.endsWith('"') && value.length >= 2)
      value = value.slice(1, -1);
    try {
      result.set(name, decodeURIComponent(value));
    } catch {
      result.set(name, value);
    }
  }
  return result;
}

/**
 * `Set-Cookie` 값. 이 앱의 쿠키는 모두 `HttpOnly; Secure; SameSite=Lax; Path=/` (api-spec B1~B3).
 * SameSite=Lax: 카카오에서 돌아오는 최상위 GET에는 실리고 다른 사이트의 POST에는 안 실린다.
 */
export function serializeCookie(name: string, value: string, maxAgeSec: number): string {
  return `${name}=${encodeURIComponent(value)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAgeSec}`;
}

export function clearCookie(name: string): string {
  return serializeCookie(name, '', 0);
}
