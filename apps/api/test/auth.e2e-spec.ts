import { createHash } from 'node:crypto';
import { RequestMethod } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, ModulesContainer, Reflector } from '@nestjs/core';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants.js';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, inject, it } from 'vitest';
import { IS_PUBLIC_KEY } from '../src/common/decorators/public.decorator.js';
import { createTestApp, TEST_ENV, type TestApp, truncateAll } from './support/test-app.js';

// 인증 FR-040 · api-spec §6 B1~B4 · ADR-0004 · architecture §4·§5.1
const url = inject('testDatabaseUrl');

const ORIGIN = TEST_ENV.APP_ORIGIN;
const SECRET = TEST_ENV.PROXY_SECRET;
const DAY = 24 * 60 * 60 * 1000;

describe.skipIf(!url)('인증 E2E (실제 PostgreSQL + 가짜 카카오)', () => {
  let t: TestApp;
  const http = () => request(t.app.getHttpServer());
  /** Worker 프록시를 거친 요청처럼 비밀 헤더를 붙인다 */
  const get = (path: string) => http().get(path).set('X-Proxy-Secret', SECRET);
  const post = (path: string) =>
    http().post(path).set('X-Proxy-Secret', SECRET).set('Origin', ORIGIN);

  beforeAll(async () => {
    t = await createTestApp(url!);
  });
  afterAll(async () => {
    await t?.close();
  });
  beforeEach(async () => {
    await truncateAll(t.pool);
    t.kakao.users.clear();
  });

  /** B1 → B2 전체 흐름. 성공하면 세션 쿠키 값(`__Host-sid=…`)을 돌려준다 */
  async function login(kakaoUserId: string): Promise<{ cookie: string; token: string }> {
    const code = `code-${kakaoUserId}`;
    t.kakao.users.set(code, kakaoUserId);
    const start = await get('/api/auth/kakao/login');
    const state = new URL(start.headers.location as string).searchParams.get('state')!;
    const res = await get(
      `/api/auth/kakao/callback?code=${code}&state=${encodeURIComponent(state)}`,
    ).set('Cookie', `__Host-oauth_state=${encodeURIComponent(state)}`);
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/');
    const sid = setCookies(res).find((c) => c.startsWith('__Host-sid='))!;
    const token = decodeURIComponent(sid.split(';')[0]!.slice('__Host-sid='.length));
    return { cookie: `__Host-sid=${token}`, token };
  }

  const countRows = async (table: 'users' | 'sessions') =>
    Number((await t.pool.query(`SELECT count(*) AS n FROM ${table}`)).rows[0].n);

  describe('B1 카카오 로그인 시작', () => {
    it('302로 카카오 인가 주소, state 쿠키(HttpOnly·Secure·Lax·10분)', async () => {
      const res = await get('/api/auth/kakao/login');
      expect(res.status).toBe(302);
      const location = new URL(res.headers.location as string);
      expect(location.origin).toBe('https://kauth.kakao.com');
      const state = location.searchParams.get('state')!;
      expect(state).toMatch(/^[A-Za-z0-9_-]{43}$/); // 32바이트 base64url
      expect(setCookies(res)).toContain(
        `__Host-oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`,
      );
    });
  });

  describe('B2 카카오 콜백', () => {
    it('AC-040-1 처음 로그인하면 사용자·세션이 만들어지고 홈으로 이동한다', async () => {
      const { token } = await login('1234567890');
      expect(await countRows('users')).toBe(1);
      // 쿠키 속성 (ADR-0004)
      expect(await countRows('sessions')).toBe(1);
      // DB에는 원본 토큰이 아니라 SHA-256 해시만 (ADR-0004)
      const { rows } = await t.pool.query<{ token_hash: Buffer; expires_at: Date }>(
        'SELECT token_hash, expires_at FROM sessions',
      );
      expect(rows[0]!.token_hash.equals(createHash('sha256').update(token).digest())).toBe(true);
      const ttl = rows[0]!.expires_at.getTime() - Date.now();
      expect(ttl).toBeGreaterThan(30 * DAY - 60_000);
      expect(ttl).toBeLessThanOrEqual(30 * DAY);
    });

    it('세션 쿠키 속성: __Host-sid, HttpOnly·Secure·Lax·Path=/·30일, state 쿠키 삭제', async () => {
      t.kakao.users.set('c', '42');
      const start = await get('/api/auth/kakao/login');
      const state = new URL(start.headers.location as string).searchParams.get('state')!;
      const res = await get(`/api/auth/kakao/callback?code=c&state=${state}`).set(
        'Cookie',
        `__Host-oauth_state=${state}`,
      );
      const cookies = setCookies(res);
      expect(cookies).toContain(
        '__Host-oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0',
      );
      expect(cookies.find((c) => c.startsWith('__Host-sid='))).toMatch(
        /^__Host-sid=[A-Za-z0-9_-]{43}; HttpOnly; Secure; SameSite=Lax; Path=\/; Max-Age=2592000$/,
      );
    });

    it('AC-040-2 다시 로그인하면 같은 계정을 쓴다 (새 계정 없음)', async () => {
      const first = await login('1234567890');
      const second = await login('1234567890');
      expect(await countRows('users')).toBe(1);
      const me1 = await get('/api/auth/me').set('Cookie', first.cookie);
      const me2 = await get('/api/auth/me').set('Cookie', second.cookie);
      expect(me1.body.id).toBe(me2.body.id);
    });

    it('로그인할 때 그 사용자의 만료 세션을 지운다 (architecture §4.3)', async () => {
      await login('7');
      await t.pool.query(`UPDATE sessions SET expires_at = now() - interval '1 second'`);
      await login('7');
      expect(await countRows('sessions')).toBe(1);
    });

    it.each<[string, string, string, boolean?]>([
      ['AC-040-5 동의 취소', '?error=access_denied&state=s', 'cancelled'],
      ['state 불일치', '?code=c&state=other', 'state'],
      ['state 쿠키 없음', '?code=c&state=s', 'state', false],
      ['카카오 실패(알 수 없는 코드)', '?code=unknown&state=s', 'kakao'],
      ['카카오 기타 오류', '?error=server_error&state=s', 'kakao'],
      ['code 없음', '?state=s', 'kakao'],
    ])(
      '%s → /login?error=%s, 세션 없음, state 쿠키 삭제',
      async (_name, query, error, withCookie = true) => {
        t.kakao.users.set('c', '1');
        const req = get(`/api/auth/kakao/callback${query}`);
        if (withCookie) req.set('Cookie', '__Host-oauth_state=s');
        const res = await req;
        expect(res.status).toBe(302);
        expect(res.headers.location).toBe(`/login?error=${error}`);
        expect(setCookies(res)).toEqual([
          '__Host-oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0',
        ]);
        expect(await countRows('sessions')).toBe(0);
      },
    );
  });

  describe('B4 내 정보 · SessionGuard', () => {
    it('AC-040-2 세션이 있으면 200 { id, createdAt } — 카카오 회원번호는 없음', async () => {
      const { cookie } = await login('555');
      const res = await get('/api/auth/me').set('Cookie', cookie);
      expect(res.status).toBe(200);
      expect(res.headers['cache-control']).toBe('no-store');
      expect(res.body).toEqual({ id: expect.any(Number), createdAt: expect.stringMatching(/Z$/) });
      expect(JSON.stringify(res.body)).not.toContain('555');
    });

    it('T-E08 AC-040-4 쿠키 없이 @Public()이 아닌 모든 라우트 → 401 UNAUTHENTICATED', async () => {
      const routes = listRoutes(t).filter((r) => !r.isPublic);
      expect(routes.length).toBeGreaterThan(0);
      for (const route of routes) {
        const agent = http();
        const res = await agent[route.method](route.path.replaceAll(/:[A-Za-z]+/g, '1'))
          .set('X-Proxy-Secret', SECRET)
          .set('Origin', ORIGIN);
        expect(res.status, `${route.method.toUpperCase()} ${route.path}`).toBe(401);
        expectApiError(res, 'UNAUTHENTICATED');
      }
    });

    it('AC-040-4 없는 토큰·만료된 세션 → 401', async () => {
      const invalid = await get('/api/auth/me').set('Cookie', '__Host-sid=not-a-session');
      expect(invalid.status).toBe(401);

      const { cookie } = await login('1');
      await t.pool.query(`UPDATE sessions SET expires_at = now() - interval '1 second'`);
      const expired = await get('/api/auth/me').set('Cookie', cookie);
      expect(expired.status).toBe(401);
      expectApiError(expired, 'UNAUTHENTICATED');
    });

    it('ADR-0004 남은 기간이 15일 미만이면 30일로 연장하고 Set-Cookie, 15일 이상이면 그대로', async () => {
      const { cookie, token } = await login('1');
      const fresh = await get('/api/auth/me').set('Cookie', cookie);
      expect(fresh.headers['set-cookie']).toBeUndefined();

      await t.pool.query(`UPDATE sessions SET expires_at = now() + interval '14 days'`);
      const renewed = await get('/api/auth/me').set('Cookie', cookie);
      expect(renewed.status).toBe(200);
      expect(setCookies(renewed)).toEqual([
        `__Host-sid=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000`,
      ]);
      const { rows } = await t.pool.query<{ expires_at: Date }>('SELECT expires_at FROM sessions');
      expect(rows[0]!.expires_at.getTime() - Date.now()).toBeGreaterThan(30 * DAY - 60_000);
    });
  });

  describe('B3 로그아웃', () => {
    it('T-E09 AC-040-3 로그아웃 후 같은 쿠키로 B4 → 401, 세션 행 삭제, 쿠키 삭제', async () => {
      const { cookie } = await login('1');
      const res = await post('/api/auth/logout').set('Cookie', cookie);
      expect(res.status).toBe(204);
      expect(setCookies(res)).toEqual([
        '__Host-sid=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0',
      ]);
      expect(await countRows('sessions')).toBe(0);
      const me = await get('/api/auth/me').set('Cookie', cookie);
      expect(me.status).toBe(401);
    });

    it('세션이 없거나 만료돼도 204 (api-spec B3)', async () => {
      expect((await post('/api/auth/logout')).status).toBe(204);
      expect((await post('/api/auth/logout').set('Cookie', '__Host-sid=gone')).status).toBe(204);
    });

    it('다른 세션(다른 기기)은 남는다', async () => {
      const a = await login('1');
      const b = await login('1');
      await post('/api/auth/logout').set('Cookie', a.cookie);
      expect((await get('/api/auth/me').set('Cookie', b.cookie)).status).toBe(200);
    });
  });

  describe('Origin 검사 (architecture §4.1)', () => {
    it.each([
      ['다른 Origin', 'https://evil.example'],
      ['Origin 없음', undefined],
    ])('T-E10 %s로 POST → 403 FORBIDDEN_ORIGIN, 세션은 그대로', async (_name, origin) => {
      const { cookie } = await login('1');
      const req = http()
        .post('/api/auth/logout')
        .set('X-Proxy-Secret', SECRET)
        .set('Cookie', cookie);
      if (origin) req.set('Origin', origin);
      const res = await req;
      expect(res.status).toBe(403);
      expectApiError(res, 'FORBIDDEN_ORIGIN');
      expect(await countRows('sessions')).toBe(1);
      expect((await get('/api/auth/me').set('Cookie', cookie)).status).toBe(200);
    });

    it('GET은 Origin을 검사하지 않는다 (카카오 콜백은 다른 사이트에서 오는 GET)', async () => {
      const res = await get('/api/auth/kakao/login').set('Origin', 'https://kauth.kakao.com');
      expect(res.status).toBe(302);
    });
  });

  describe('프록시 비밀 (architecture §5.1)', () => {
    it.each([
      ['없음', undefined],
      ['틀림', 'wrong-secret'],
    ])('T-E11 X-Proxy-Secret %s → 403 FORBIDDEN_PROXY', async (_name, secret) => {
      for (const path of ['/api/auth/me', '/api/auth/kakao/login', '/api/nope']) {
        const req = http().get(path);
        if (secret) req.set('X-Proxy-Secret', secret);
        const res = await req;
        expect(res.status, path).toBe(403);
        expectApiError(res, 'FORBIDDEN_PROXY');
      }
    });

    it('T-E11 /api/health는 비밀 없이도 200 (Render 헬스 체크)', async () => {
      expect((await http().get('/api/health')).status).toBe(200);
    });
  });

  it('T-E12 정의되지 않은 경로 → 404 NOT_FOUND (ADR-0008 형식)', async () => {
    const res = await get('/api/nope');
    expect(res.status).toBe(404);
    expectApiError(res, 'NOT_FOUND');
  });
});

/** ADR-0008 에러 형식 + X-Request-Id 일치 (T-E12) */
function expectApiError(res: request.Response, code: string): void {
  expect(res.headers['content-type']).toMatch(/^application\/json/);
  expect(res.headers['cache-control']).toBe('no-store');
  expect(res.body).toEqual({
    error: { code, message: expect.any(String), requestId: res.headers['x-request-id'] },
  });
  expect(res.body.error.requestId).toMatch(/^[0-9a-f-]{36}$/);
}

function setCookies(res: request.Response): string[] {
  const value = res.headers['set-cookie'] as unknown;
  return Array.isArray(value) ? value : value ? [String(value)] : [];
}

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

/**
 * Nest에 등록된 모든 라우트와 @Public() 여부 (T-E08, 이후 T-E07 라우트 누락 감지에도 쓴다).
 * 컨트롤러 메타데이터를 직접 읽으므로 새 라우트를 만들면 자동으로 검사 대상이 된다.
 */
function listRoutes(t: TestApp): { method: HttpMethod; path: string; isPublic: boolean }[] {
  const discovery = new DiscoveryService(t.app.get(ModulesContainer));
  const scanner = new MetadataScanner();
  const reflector = t.app.get(Reflector);
  const routes: { method: HttpMethod; path: string; isPublic: boolean }[] = [];
  for (const wrapper of discovery.getControllers()) {
    const instance = wrapper.instance as object | undefined;
    if (!instance || !wrapper.metatype) continue;
    const base = String(Reflect.getMetadata(PATH_METADATA, wrapper.metatype) ?? '');
    const proto = Object.getPrototypeOf(instance) as object;
    for (const name of scanner.getAllMethodNames(proto)) {
      const handler = (proto as Record<string, unknown>)[name] as object;
      const path = Reflect.getMetadata(PATH_METADATA, handler) as string | undefined;
      const method = Reflect.getMetadata(METHOD_METADATA, handler) as RequestMethod | undefined;
      if (path === undefined || method === undefined) continue;
      const isPublic =
        reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [handler as never, wrapper.metatype]) ??
        false;
      const full = `/api/${[base, path]
        .map((p) => p.replace(/^\/|\/$/g, ''))
        .filter(Boolean)
        .join('/')}`;
      routes.push({
        method: RequestMethod[method].toLowerCase() as HttpMethod,
        path: full,
        isPublic,
      });
    }
  }
  return routes;
}
