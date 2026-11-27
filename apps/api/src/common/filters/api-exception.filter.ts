import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { ApiError, ErrorCode } from '@caddy-haru/shared';
import type { Request, Response } from 'express';
import { AppError, ERROR_DEFINITIONS } from '../errors.js';

/**
 * 전역 예외 필터 — 모든 4xx·5xx 본문을 `{ error: { code, message, fields?, requestId } }`로 만든다 (ADR-0008).
 * 응답 본문을 만드는 곳은 여기 한 곳뿐이다. 로그에는 requestId·경로·상태·code·사용자 ID만 남긴다(본문·쿠키 금지).
 */
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ApiError');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const { status, code, message } = toError(exception);
    const requestId = req.requestId ?? '';
    const body: ApiError = { error: { code, message, requestId } };

    const log = {
      requestId,
      method: req.method,
      path: req.path,
      status,
      code,
      userId: req.user?.id,
    };
    if (status >= 500)
      this.logger.error(log, exception instanceof Error ? exception.stack : undefined);
    else this.logger.warn(log);

    if (res.headersSent) return;
    res.status(status).setHeader('Cache-Control', 'no-store').json(body);
  }
}

function toError(exception: unknown): { status: number; code: ErrorCode; message: string } {
  if (exception instanceof AppError) {
    return { status: exception.status, code: exception.code, message: exception.message };
  }
  if (exception instanceof HttpException) {
    const code = HTTP_TO_CODE[exception.getStatus()];
    if (code)
      return { status: exception.getStatus(), code, message: ERROR_DEFINITIONS[code].message };
  }
  const internal = ERROR_DEFINITIONS.INTERNAL_ERROR;
  return {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    code: 'INTERNAL_ERROR',
    message: internal.message,
  };
}

/** Nest가 직접 던지는 예외(정의되지 않은 경로 등) → 에러 코드 */
const HTTP_TO_CODE: Partial<Record<number, ErrorCode>> = {
  400: 'VALIDATION_FAILED',
  401: 'UNAUTHENTICATED',
  404: 'NOT_FOUND',
};
