import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { AppConfig } from '../../config/app-config.js';
import { AppError } from '../errors.js';
import { safeEqual } from '../http/crypto.js';

/** Render 헬스 체크는 비밀 헤더 없이 직접 들어온다 (architecture §5.2) */
const EXEMPT_PATHS = new Set(['/api/health']);

/**
 * `X-Proxy-Secret`이 Worker 프록시 값과 같아야 한다 → `*.onrender.com` 직접 요청 차단 (architecture §5.1, T-E11).
 * 서버에 PROXY_SECRET이 없으면 모두 거부한다(fail closed).
 */
@Injectable()
export class ProxySecretMiddleware implements NestMiddleware {
  constructor(private readonly config: AppConfig) {}

  use(req: Request, _res: Response, next: NextFunction): void {
    if (EXEMPT_PATHS.has(req.path)) return next();
    const expected = this.config.proxySecret();
    const actual = req.get('x-proxy-secret');
    if (!expected || !actual || !safeEqual(actual, expected)) throw new AppError('FORBIDDEN_PROXY');
    next();
  }
}
