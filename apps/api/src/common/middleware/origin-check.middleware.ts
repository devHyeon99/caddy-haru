import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { AppConfig } from '../../config/app-config.js';
import { AppError } from '../errors.js';

const STATE_CHANGING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * CSRF 추가 방어: 상태를 바꾸는 요청은 `Origin`이 앱 도메인과 같아야 한다 (architecture §4.1, api-spec §1.2, T-E10).
 * 없거나 다르면 403 FORBIDDEN_ORIGIN. GET(카카오 콜백 포함)은 검사하지 않는다.
 */
@Injectable()
export class OriginCheckMiddleware implements NestMiddleware {
  constructor(private readonly config: AppConfig) {}

  use(req: Request, _res: Response, next: NextFunction): void {
    if (!STATE_CHANGING.has(req.method)) return next();
    const expected = this.config.appOrigin();
    const origin = req.get('origin');
    if (!expected || origin !== expected) throw new AppError('FORBIDDEN_ORIGIN');
    next();
  }
}
