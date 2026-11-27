import path from 'node:path';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';
import type { TestProject } from 'vitest/node';

/**
 * DB 테스트 준비 (test-plan §1): 테스트 전용 DB를 비우고 drizzle/ 마이그레이션을 처음부터 적용한다.
 * → 생성된 SQL이 실제 PostgreSQL 17에서 그대로 동작하는지도 함께 검증된다 (ADR-0003).
 * - CI: TEST_DATABASE_URL 필수. 연결 실패 = 테스트 실패
 * - 실행 위치는 apps/api (pnpm --filter @caddy-haru/api test)
 * - 로컬: 기본값은 docker compose의 db에 caddy_haru_test DB. 연결이 안 되면 DB 테스트만 건너뛴다
 */
export const DEFAULT_TEST_DATABASE_URL =
  'postgres://caddy_haru:caddy_haru@localhost:5432/caddy_haru_test';

declare module 'vitest' {
  export interface ProvidedContext {
    testDatabaseUrl: string | null;
  }
}

export default async function setup(project: TestProject): Promise<void> {
  const url = process.env.TEST_DATABASE_URL ?? DEFAULT_TEST_DATABASE_URL;
  try {
    await ensureDatabase(url);
    const pool = new pg.Pool({ connectionString: url, max: 1 });
    try {
      await pool.query(
        'DROP SCHEMA IF EXISTS public CASCADE; DROP SCHEMA IF EXISTS drizzle CASCADE; CREATE SCHEMA public;',
      );
      await migrate(drizzle(pool), { migrationsFolder: path.resolve(process.cwd(), 'drizzle') });
    } finally {
      await pool.end();
    }
    project.provide('testDatabaseUrl', url);
  } catch (err) {
    if (process.env.CI) throw err;
    console.warn(
      `[test] DB 테스트를 건너뜁니다 (docker compose up -d db 로 켜세요): ${String(err)}`,
    );
    project.provide('testDatabaseUrl', null);
  }
}

/** 테스트 DB가 없으면 만든다 (docker 이미지의 POSTGRES_USER는 superuser) */
async function ensureDatabase(url: string): Promise<void> {
  const target = new URL(url);
  const dbName = target.pathname.slice(1);
  const admin = new URL(url);
  admin.pathname = '/postgres';
  const client = new pg.Client({
    connectionString: admin.toString(),
    connectionTimeoutMillis: 3000,
  });
  await client.connect();
  try {
    const { rowCount } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [
      dbName,
    ]);
    if (!rowCount) await client.query(`CREATE DATABASE "${dbName.replaceAll('"', '""')}"`);
  } finally {
    await client.end();
  }
}
