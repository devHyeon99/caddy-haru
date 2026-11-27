import 'reflect-metadata';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import pg from 'pg';
import { AppModule } from '../../src/app.module.js';
import { configureApp } from '../../src/app.js';
import { KakaoClient, KakaoError } from '../../src/auth/kakao.client.js';

export const TEST_ENV = {
  PROXY_SECRET: 'test-proxy-secret',
  APP_ORIGIN: 'https://caddy-haru.test',
  KAKAO_CLIENT_ID: 'test-client-id',
  KAKAO_CLIENT_SECRET: 'test-client-secret',
  KAKAO_REDIRECT_URI: 'https://caddy-haru.test/api/auth/kakao/callback',
} as const;

/** 가짜 카카오: 인가 코드 → 회원번호 표. 표에 없는 코드는 실패 */
export class FakeKakaoClient {
  readonly users = new Map<string, string>();

  authorizeUrl(state: string): string {
    return `https://kauth.kakao.com/oauth/authorize?state=${encodeURIComponent(state)}`;
  }

  async fetchUserId(code: string): Promise<string> {
    const id = this.users.get(code);
    if (!id) throw new KakaoError('가짜 카카오: 알 수 없는 코드');
    return id;
  }
}

export interface TestApp {
  app: INestApplication;
  kakao: FakeKakaoClient;
  pool: pg.Pool;
  close(): Promise<void>;
}

/** 실제 PostgreSQL + 가짜 카카오로 앱 전체를 메모리에서 띄운다 */
export async function createTestApp(databaseUrl: string): Promise<TestApp> {
  Object.assign(process.env, TEST_ENV, { DATABASE_URL: databaseUrl });
  const kakao = new FakeKakaoClient();
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(KakaoClient)
    .useValue(kakao)
    .compile();
  const app = configureApp(moduleRef.createNestApplication({ logger: false }));
  await app.init();
  const pool = new pg.Pool({ connectionString: databaseUrl, max: 2 });
  return {
    app,
    kakao,
    pool,
    async close() {
      await pool.end();
      await app.close();
    },
  };
}

/** 테스트마다 데이터만 비운다 (스키마는 global-setup이 만든다) */
export async function truncateAll(pool: pg.Pool): Promise<void> {
  await pool.query('TRUNCATE users, sessions RESTART IDENTITY CASCADE');
}
