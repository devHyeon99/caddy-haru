/**
 * 브랜드 타입: 세션에서 나온 값만 UserId가 된다 (NFR-003, ADR-0005, architecture §3.3).
 * `toUserId`는 세션·사용자 Repository에서만 쓴다. Controller는 `@CurrentUser()`로만 꺼낸다.
 */
export type UserId = number & { readonly __brand: 'UserId' };

export function toUserId(id: number): UserId {
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error(`잘못된 사용자 ID: ${id}`);
  return id as UserId;
}

/** SessionGuard가 request에 붙이는 값 */
export interface AuthUser {
  id: UserId;
}
