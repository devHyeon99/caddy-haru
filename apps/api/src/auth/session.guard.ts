import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator.js';
import { AppError } from '../common/errors.js';
import { parseCookies, serializeCookie, SESSION_COOKIE } from '../common/http/cookies.js';
import { AuthService } from './auth.service.js';
import { SESSION_MAX_AGE_SEC } from './session-policy.js';

/**
 * 전역 Guard: 쿠키 `__Host-sid` → 세션 → `request.user` (architecture §4.3, NFR-003).
 * 1) `@Public()`이면 **DB 조회 없이** 통과 (`/api/health`, §5.2)
 * 2) 세션 없음·만료 → 401 UNAUTHENTICATED (AC-040-4)
 * 3) 남은 기간 15일 미만이면 연장 + Set-Cookie (ADR-0004)
 */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auth: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean | undefined>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<Request>();
    const token = parseCookies(req.headers.cookie).get(SESSION_COOKIE);
    if (!token) throw new AppError('UNAUTHENTICATED');

    const result = await this.auth.authenticate(token);
    if (!result) throw new AppError('UNAUTHENTICATED');

    if (result.renewed) {
      context
        .switchToHttp()
        .getResponse<Response>()
        .append('Set-Cookie', serializeCookie(SESSION_COOKIE, token, SESSION_MAX_AGE_SEC));
    }
    req.user = { id: result.userId };
    return true;
  }
}
