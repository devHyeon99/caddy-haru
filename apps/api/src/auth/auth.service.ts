import { Injectable, Logger } from '@nestjs/common';
import type { LoginErrorCode } from '@caddy-haru/shared';
import { randomToken, safeEqual, sha256 } from '../common/http/crypto.js';
import type { UserId } from '../common/user-id.js';
import { UsersRepository, type UserRecord } from '../users/users.repository.js';
import { KakaoClient } from './kakao.client.js';
import { newExpiry, needsRenewal } from './session-policy.js';
import { SessionsRepository } from './sessions.repository.js';

export type LoginError = LoginErrorCode;

export type CallbackResult = { ok: true; sessionToken: string } | { ok: false; error: LoginError };

export interface CallbackQuery {
  code?: string;
  state?: string;
  error?: string;
}

/** 카카오 로그인·DB 세션 (FR-040, ADR-0004, architecture §4) */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly kakao: KakaoClient,
    private readonly users: UsersRepository,
    private readonly sessions: SessionsRepository,
  ) {}

  /** B1: state 생성 + 카카오 인가 주소 */
  startLogin(): { state: string; url: string } {
    const state = randomToken();
    return { state, url: this.kakao.authorizeUrl(state) };
  }

  /** B2: 콜백 처리 → 새 세션 토큰 (AC-040-1·2·5) */
  async completeLogin(
    query: CallbackQuery,
    stateCookie: string | undefined,
  ): Promise<CallbackResult> {
    if (query.error) {
      if (query.error !== 'access_denied')
        this.logger.warn({ msg: '카카오 오류 응답', error: query.error });
      return { ok: false, error: query.error === 'access_denied' ? 'cancelled' : 'kakao' };
    }
    // CSRF 방어: 쿼리 state == 쿠키 state (상수 시간 비교)
    if (!query.state || !stateCookie || !safeEqual(query.state, stateCookie)) {
      return { ok: false, error: 'state' };
    }
    if (!query.code) return { ok: false, error: 'kakao' };

    let kakaoUserId: string;
    try {
      kakaoUserId = await this.kakao.fetchUserId(query.code);
    } catch (err) {
      this.logger.error({
        msg: '카카오 로그인 실패',
        reason: err instanceof Error ? err.message : 'unknown',
      });
      return { ok: false, error: 'kakao' };
    }

    const now = new Date();
    const userId = await this.users.upsertKakaoUser(kakaoUserId);
    await this.sessions.deleteExpired(userId, now);
    const sessionToken = randomToken();
    await this.sessions.create(userId, sha256(sessionToken), newExpiry(now));
    return { ok: true, sessionToken };
  }

  /**
   * 세션 토큰 → 사용자. 남은 기간이 15일 미만이면 연장하고 `renewed: true` (ADR-0004 슬라이딩).
   * 없거나 만료면 null.
   */
  async authenticate(sessionToken: string): Promise<{ userId: UserId; renewed: boolean } | null> {
    const now = new Date();
    const hash = sha256(sessionToken);
    const session = await this.sessions.findValid(hash, now);
    if (!session) return null;
    if (!needsRenewal(session.expiresAt, now)) return { userId: session.userId, renewed: false };
    await this.sessions.extend(hash, newExpiry(now));
    return { userId: session.userId, renewed: true };
  }

  /** B3: 세션 행 삭제 (AC-040-3). 이미 없어도 성공 */
  async logout(sessionToken: string | undefined): Promise<void> {
    if (sessionToken) await this.sessions.delete(sha256(sessionToken));
  }

  /** B4 */
  me(userId: UserId): Promise<UserRecord | null> {
    return this.users.findById(userId);
  }
}
