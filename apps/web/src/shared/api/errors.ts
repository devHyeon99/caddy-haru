import type { ApiError, ErrorCode } from '@caddy-haru/shared';

/**
 * API 호출 실패 — ADR-0008, ui-design §1.3
 * - `http`: 서버가 ADR-0008 형식(또는 다른 4xx·5xx)으로 응답했다. 화면은 `code`로만 분기한다.
 * - `unavailable`: 502·503·504·시간 초과·네트워크 오류. 조회는 깨우기 흐름 뒤 1회 재시도까지 실패한 경우,
 *   저장은 이미 보낸 요청이라 재전송하지 않은 경우("다시 저장" 배너, ui-design §4.2).
 * - `cancelled`: 사용자가 "서버 깨우는 중" 오버레이에서 [취소]·[닫기]를 눌렀다(SCR-00o).
 */
export type ApiFailureKind = 'http' | 'unavailable' | 'cancelled';

export class ApiRequestError extends Error {
  readonly kind: ApiFailureKind;
  readonly status: number | null;
  readonly detail: ApiError['error'] | null;

  constructor(
    kind: ApiFailureKind,
    status: number | null,
    detail: ApiError['error'] | null = null,
  ) {
    super(detail?.message ?? `API 요청 실패 (${kind}${status ? ` ${status}` : ''})`);
    this.name = 'ApiRequestError';
    this.kind = kind;
    this.status = status;
    this.detail = detail;
  }

  get code(): ErrorCode | null {
    return this.detail?.code ?? null;
  }

  get requestId(): string | null {
    return this.detail?.requestId ?? null;
  }
}

export function isApiError(value: unknown): value is ApiError {
  if (typeof value !== 'object' || value === null) return false;
  const error = (value as { error?: unknown }).error;
  return (
    typeof error === 'object' &&
    error !== null &&
    typeof (error as { code?: unknown }).code === 'string' &&
    typeof (error as { message?: unknown }).message === 'string'
  );
}

/** 본문이 ADR-0008 형식이면 꺼내고, 아니면(프록시 문자열 응답 등) null */
export async function readApiErrorBody(res: Response): Promise<ApiError['error'] | null> {
  try {
    const body: unknown = await res.json();
    return isApiError(body) ? body.error : null;
  } catch {
    return null;
  }
}

export function isUnauthenticated(error: unknown): boolean {
  return error instanceof ApiRequestError && error.status === 401;
}
