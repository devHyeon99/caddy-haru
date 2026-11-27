import { Injectable } from '@nestjs/common';
import { AppConfig } from '../config/app-config.js';

const AUTHORIZE_URL = 'https://kauth.kakao.com/oauth/authorize';
const TOKEN_URL = 'https://kauth.kakao.com/oauth/token';
const USER_ME_URL = 'https://kapi.kakao.com/v2/user/me';
const TIMEOUT_MS = 10_000;

export class KakaoError extends Error {}

/**
 * 카카오 OAuth (FR-040, architecture §4.2).
 * 동의 항목을 요청하지 않는다(`scope` 없음) — 회원번호 `id`만 쓴다.
 * 카카오 access token은 회원번호를 얻는 데 한 번만 쓰고 저장하지 않는다 (ADR-0004).
 * 테스트는 이 클래스를 가짜로 바꾼다.
 */
@Injectable()
export class KakaoClient {
  constructor(private readonly config: AppConfig) {}

  authorizeUrl(state: string): string {
    const { clientId, redirectUri } = this.config.kakao();
    const url = new URL(AUTHORIZE_URL);
    url.search = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      state,
    }).toString();
    return url.toString();
  }

  /** 인가 코드 → 카카오 회원번호(문자열) */
  async fetchUserId(code: string): Promise<string> {
    const accessToken = await this.exchangeCode(code);
    const res = await fetch(USER_ME_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new KakaoError(`사용자 조회 실패: ${res.status}`);
    return parseKakaoUserId(await res.text());
  }

  private async exchangeCode(code: string): Promise<string> {
    const { clientId, clientSecret, redirectUri } = this.config.kakao();
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new KakaoError(`토큰 교환 실패: ${res.status}`);
    const body = (await res.json()) as { access_token?: unknown };
    if (typeof body.access_token !== 'string')
      throw new KakaoError('토큰 응답에 access_token 없음');
    return body.access_token;
  }
}

/**
 * `/v2/user/me` 응답에서 최상위 `id`를 **원문 그대로** 꺼낸다.
 * 회원번호는 64비트 정수라 `Number`로 읽으면 2^53을 넘을 때 값이 바뀐다 (architecture §4.1).
 * JSON.parse reviver의 `context.source`(Node 21+)로 숫자의 원래 글자를 얻는다.
 */
export function parseKakaoUserId(json: string): string {
  // reviver는 안쪽부터(후위 순회) 호출된다. 객체마다 id 원문을 기록해 두고, 마지막(key '')에 받은 최상위 객체의 것을 쓴다
  const idSources = new Map<object, string>();
  let root: unknown;
  JSON.parse(
    json,
    function (this: object, key: string, value: unknown, context?: { source?: string }) {
      if (key === 'id' && typeof value === 'number' && context?.source)
        idSources.set(this, context.source);
      if (key === '') root = value;
      return value;
    },
  );
  const id = root !== null && typeof root === 'object' ? idSources.get(root) : undefined;
  if (!id || !/^[1-9]\d{0,19}$/.test(id)) throw new KakaoError('회원번호 형식이 올바르지 않습니다');
  return id;
}
