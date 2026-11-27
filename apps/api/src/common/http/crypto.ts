import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

/** 무작위 32바이트 → base64url (세션 토큰, OAuth state — ADR-0004) */
export function randomToken(): string {
  return randomBytes(32).toString('base64url');
}

/** 세션 토큰의 SHA-256 해시 — DB에는 이 값만 저장한다 (ADR-0004) */
export function sha256(value: string): Buffer {
  return createHash('sha256').update(value, 'utf8').digest();
}

/** 상수 시간 문자열 비교. 길이가 달라도 시간 차이가 나지 않게 해시를 비교한다 */
export function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(sha256(a), sha256(b));
}
