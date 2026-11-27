// API 에러 응답 형식 — ADR-0008, api-spec.md §2.2·§2.3

export const ERROR_CODES = [
  'VALIDATION_FAILED',
  'INVALID_JSON',
  'UNAUTHENTICATED',
  'FORBIDDEN_ORIGIN',
  'FORBIDDEN_PROXY',
  'ROUND_NOT_FOUND',
  'GOLF_CLUB_NOT_FOUND',
  'NOT_FOUND',
  'DUPLICATE_ROUND',
  'DUPLICATE_GOLF_CLUB_NAME',
  'NINE_EXT_SLOT1_ONLY',
  'NINE_EXT_FEE_WITHOUT_COUNT',
  'GOLF_CLUB_HIDDEN',
  'DATE_RANGE_TOO_LONG',
  'INTERNAL_ERROR',
] as const;
export type ErrorCode = (typeof ERROR_CODES)[number];

export type FieldErrorCode =
  'REQUIRED' | 'INVALID_TYPE' | 'INVALID_FORMAT' | 'OUT_OF_RANGE' | 'TOO_LONG' | 'UNKNOWN_FIELD';

export interface ApiError {
  error: {
    code: ErrorCode;
    message: string;
    fields?: { field: string; code: FieldErrorCode | ErrorCode; message: string }[];
    requestId: string;
  };
}
