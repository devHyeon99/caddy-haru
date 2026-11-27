import type { ErrorCode } from '@caddy-haru/shared';

/** 에러 코드별 HTTP 상태와 기본 메시지 — api-spec.md §2.3 (ADR-0008) */
export const ERROR_DEFINITIONS: Record<ErrorCode, { status: number; message: string }> = {
  VALIDATION_FAILED: { status: 400, message: '입력값을 확인해 주세요.' },
  INVALID_JSON: { status: 400, message: '요청 형식이 올바르지 않습니다.' },
  UNAUTHENTICATED: { status: 401, message: '다시 로그인해 주세요.' },
  FORBIDDEN_ORIGIN: { status: 403, message: '허용되지 않은 요청입니다.' },
  FORBIDDEN_PROXY: { status: 403, message: '허용되지 않은 요청입니다.' },
  ROUND_NOT_FOUND: { status: 404, message: '라운드를 찾을 수 없습니다.' },
  GOLF_CLUB_NOT_FOUND: { status: 404, message: '골프장을 찾을 수 없습니다.' },
  NOT_FOUND: { status: 404, message: '요청한 주소를 찾을 수 없습니다.' },
  DUPLICATE_ROUND: { status: 409, message: '이미 같은 부 기록이 있습니다.' },
  DUPLICATE_GOLF_CLUB_NAME: { status: 409, message: '이미 같은 이름의 골프장이 있습니다.' },
  NINE_EXT_SLOT1_ONLY: { status: 422, message: '나인추가는 1부에만 기록할 수 있습니다.' },
  NINE_EXT_FEE_WITHOUT_COUNT: {
    status: 422,
    message: '나인추가 횟수가 0이면 나인추가 금액을 입력할 수 없습니다.',
  },
  GOLF_CLUB_HIDDEN: { status: 422, message: '숨긴 골프장은 선택할 수 없습니다.' },
  DATE_RANGE_TOO_LONG: { status: 422, message: '기간은 최대 1년까지 선택할 수 있습니다.' },
  INTERNAL_ERROR: { status: 500, message: '잠시 후 다시 시도해 주세요.' },
};

/**
 * 도메인·요청 오류. 응답 본문은 전역 예외 필터(ApiExceptionFilter) 한 곳에서만 만든다 (ADR-0008).
 * Service·Guard·Middleware는 이 예외만 던진다.
 */
export class AppError extends Error {
  readonly status: number;

  constructor(
    readonly code: ErrorCode,
    message?: string,
  ) {
    super(message ?? ERROR_DEFINITIONS[code].message);
    this.status = ERROR_DEFINITIONS[code].status;
  }
}
