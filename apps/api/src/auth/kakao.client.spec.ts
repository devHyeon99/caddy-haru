import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppConfig } from '../config/app-config.js';
import { KakaoClient, KakaoError, parseKakaoUserId } from './kakao.client.js';

// FR-040 카카오 OAuth (architecture §4.1·§4.2)
const config = new AppConfig({
  KAKAO_CLIENT_ID: 'rest-key',
  KAKAO_CLIENT_SECRET: 'secret',
  KAKAO_REDIRECT_URI: 'https://caddy-haru.test/api/auth/kakao/callback',
});

describe('parseKakaoUserId', () => {
  it('최상위 id를 원문 그대로 — 2^53을 넘어도 값이 바뀌지 않는다', () => {
    expect(
      parseKakaoUserId('{"id":9223372036854775807,"connected_at":"2026-11-30T00:00:00Z"}'),
    ).toBe('9223372036854775807');
    expect(parseKakaoUserId('{"id":1234567890}')).toBe('1234567890');
  });

  it('안쪽 객체의 id는 무시한다', () => {
    expect(parseKakaoUserId('{"properties":{"id":5},"id":77,"kakao_account":{"id":6}}')).toBe('77');
  });

  it.each(['{}', '{"id":"123"}', '{"id":-1}', '{"id":1.5}', '[{"id":1}]', '{"id":0}'])(
    '형식이 틀리면 KakaoError: %s',
    (json) => {
      expect(() => parseKakaoUserId(json)).toThrow(KakaoError);
    },
  );
});

describe('KakaoClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('인가 주소: client_id·redirect_uri·response_type=code·state, scope 없음 (동의 항목 없음)', () => {
    const url = new URL(new KakaoClient(config).authorizeUrl('st'));
    expect(url.origin + url.pathname).toBe('https://kauth.kakao.com/oauth/authorize');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      client_id: 'rest-key',
      redirect_uri: 'https://caddy-haru.test/api/auth/kakao/callback',
      response_type: 'code',
      state: 'st',
    });
  });

  it('코드 → 토큰 교환 → 회원번호. 토큰은 Bearer로만 쓴다', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: 'AT' }), { status: 200 }))
      .mockResolvedValueOnce(new Response('{"id":4242}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(new KakaoClient(config).fetchUserId('CODE')).resolves.toBe('4242');

    const [tokenUrl, tokenInit] = fetchMock.mock.calls[0]!;
    expect(tokenUrl).toBe('https://kauth.kakao.com/oauth/token');
    expect(tokenInit.method).toBe('POST');
    expect(Object.fromEntries(tokenInit.body as URLSearchParams)).toEqual({
      grant_type: 'authorization_code',
      client_id: 'rest-key',
      client_secret: 'secret',
      redirect_uri: 'https://caddy-haru.test/api/auth/kakao/callback',
      code: 'CODE',
    });
    const [meUrl, meInit] = fetchMock.mock.calls[1]!;
    expect(meUrl).toBe('https://kapi.kakao.com/v2/user/me');
    expect(meInit.headers).toEqual({ Authorization: 'Bearer AT' });
  });

  it.each([
    ['토큰 교환 실패', [new Response('{}', { status: 401 })]],
    ['access_token 없음', [new Response('{}', { status: 200 })]],
    [
      '사용자 조회 실패',
      [new Response('{"access_token":"AT"}', { status: 200 }), new Response('', { status: 500 })],
    ],
  ])('%s → KakaoError', async (_name, responses) => {
    const fetchMock = vi.fn();
    for (const r of responses) fetchMock.mockResolvedValueOnce(r);
    vi.stubGlobal('fetch', fetchMock);
    await expect(new KakaoClient(config).fetchUserId('CODE')).rejects.toThrow(KakaoError);
  });
});
