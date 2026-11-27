// 인증 API 타입 — api-spec.md §6 (FR-040)

/** B4 `GET /api/auth/me` 응답. 카카오 회원번호는 넣지 않는다 */
export interface MeResponse {
  id: number;
  /** ISO 8601 UTC */
  createdAt: string;
}

/** B2 실패 시 `/login?error=` 값 (AC-040-5) */
export type LoginErrorCode = 'cancelled' | 'state' | 'kakao';
