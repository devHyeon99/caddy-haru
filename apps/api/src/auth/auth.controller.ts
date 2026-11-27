import { Controller, Get, HttpCode, Post, Query, Req, Res } from '@nestjs/common';
import type { MeResponse } from '@caddy-haru/shared';
import type { Request, Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import { AppError } from '../common/errors.js';
import {
  clearCookie,
  OAUTH_STATE_COOKIE,
  parseCookies,
  serializeCookie,
  SESSION_COOKIE,
} from '../common/http/cookies.js';
import type { UserId } from '../common/user-id.js';
import { AuthService } from './auth.service.js';
import { OAUTH_STATE_MAX_AGE_SEC, SESSION_MAX_AGE_SEC } from './session-policy.js';

/** 인증 엔드포인트 B1~B4 (FR-040, api-spec §6) */
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /** B1 카카오 로그인 시작 — SPA가 페이지 이동으로 호출 */
  @Public()
  @Get('kakao/login')
  login(@Res() res: Response): void {
    const { state, url } = this.auth.startLogin();
    res.append('Set-Cookie', serializeCookie(OAUTH_STATE_COOKIE, state, OAUTH_STATE_MAX_AGE_SEC));
    res.redirect(302, url);
  }

  /** B2 카카오 콜백 — 응답은 항상 302 (AC-040-1·2·5) */
  @Public()
  @Get('kakao/callback')
  async callback(
    @Query('code') code: unknown,
    @Query('state') state: unknown,
    @Query('error') error: unknown,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const stateCookie = parseCookies(req.headers.cookie).get(OAUTH_STATE_COOKIE);
    const result = await this.auth.completeLogin(
      { code: asString(code), state: asString(state), error: asString(error) },
      stateCookie,
    );
    res.append('Set-Cookie', clearCookie(OAUTH_STATE_COOKIE)); // 모든 경우에 지운다
    if (!result.ok) {
      res.redirect(302, `/login?error=${result.error}`);
      return;
    }
    res.append(
      'Set-Cookie',
      serializeCookie(SESSION_COOKIE, result.sessionToken, SESSION_MAX_AGE_SEC),
    );
    res.redirect(302, '/');
  }

  /**
   * B3 로그아웃 — `@Public()`: 세션이 이미 만료됐어도 쿠키 정리는 성공해야 한다 (api-spec B3).
   * Origin 검사는 미들웨어가 한다(POST). 항상 204 (AC-040-3)
   */
  @Public()
  @Post('logout')
  @HttpCode(204)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    await this.auth.logout(parseCookies(req.headers.cookie).get(SESSION_COOKIE));
    res.append('Set-Cookie', clearCookie(SESSION_COOKIE));
  }

  /** B4 내 정보 — 카카오 회원번호는 응답에 넣지 않는다 */
  @Get('me')
  async me(@CurrentUser() userId: UserId): Promise<MeResponse> {
    const user = await this.auth.me(userId);
    // 세션은 있는데 사용자가 없음 = CASCADE로 함께 지워졌어야 하므로 사실상 발생하지 않는다
    if (!user) throw new AppError('UNAUTHENTICATED');
    return { id: user.id, createdAt: user.createdAt.toISOString() };
  }
}

/** 쿼리 값이 배열(`?code=a&code=b`)·객체면 무시한다 */
function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}
