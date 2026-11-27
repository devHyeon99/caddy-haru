import { randomUUID } from 'node:crypto';
import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

/**
 * 요청마다 무작위 ID → `X-Request-Id` 헤더, 에러 본문의 requestId (api-spec §1.3).
 * 모든 API 응답에 `Cache-Control: no-store` — 로그아웃 후 뒤로 가기·공용 캐시에 데이터가 남지 않게 (AC-040-3).
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    req.requestId = randomUUID();
    res.setHeader('X-Request-Id', req.requestId);
    res.setHeader('Cache-Control', 'no-store');
    next();
  }
}
