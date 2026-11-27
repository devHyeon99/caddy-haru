import pg from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, inject, it } from 'vitest';
import { truncateAll } from './support/test-app.js';

// data-model.md §4 DDL ↔ 실제 DB (마이그레이션 drizzle/*.sql을 global-setup이 적용한 결과)
const url = inject('testDatabaseUrl');

describe.skipIf(!url)('users·sessions 스키마 (실제 PostgreSQL)', () => {
  let pool: pg.Pool;

  beforeAll(() => {
    pool = new pg.Pool({ connectionString: url!, max: 1 });
  });
  afterAll(async () => {
    await pool.end();
  });
  beforeEach(async () => {
    await truncateAll(pool);
  });

  const hash = (byte: number, length = 32) => Buffer.alloc(length, byte);
  const insertUser = async (kakaoId: string) =>
    (
      await pool.query<{ id: number }>(
        'INSERT INTO users (provider_user_id) VALUES ($1) RETURNING id',
        [kakaoId],
      )
    ).rows[0]!.id;

  it('T-I10 제약·인덱스 이름이 data-model §4와 같다 (users·sessions)', async () => {
    const { rows: constraints } = await pool.query<{ conname: string; table: string }>(
      `SELECT conname, conrelid::regclass::text AS table FROM pg_constraint
       WHERE conrelid IN ('users'::regclass, 'sessions'::regclass) ORDER BY conname`,
    );
    expect(constraints.map((c) => c.conname)).toEqual([
      'sessions_pkey',
      'sessions_token_hash_check',
      'sessions_user_id_fkey',
      'users_pkey',
      'users_provider_check',
      'users_provider_user_key',
    ]);
    const { rows: indexes } = await pool.query<{ indexname: string }>(
      `SELECT indexname FROM pg_indexes WHERE tablename IN ('users', 'sessions') ORDER BY indexname`,
    );
    expect(indexes.map((i) => i.indexname)).toEqual([
      'sessions_pkey',
      'sessions_user_id_idx',
      'users_pkey',
      'users_provider_user_key',
    ]);
    // FK는 ON DELETE CASCADE (confdeltype 'c')
    const { rows: fk } = await pool.query<{ confdeltype: string }>(
      `SELECT confdeltype FROM pg_constraint WHERE conname = 'sessions_user_id_fkey'`,
    );
    expect(fk[0]!.confdeltype).toBe('c');
  });

  it('T-I11 같은 카카오 회원번호는 한 계정만 (AC-040-2), provider는 kakao만', async () => {
    await insertUser('1234567890');
    await expect(insertUser('1234567890')).rejects.toMatchObject({
      constraint: 'users_provider_user_key',
    });
    await expect(
      pool.query(`INSERT INTO users (provider, provider_user_id) VALUES ('naver', '1')`),
    ).rejects.toMatchObject({ constraint: 'users_provider_check' });
    // 2^63-1 회원번호도 문자열 그대로 저장 (architecture §4.1)
    const id = await insertUser('9223372036854775807');
    const { rows } = await pool.query('SELECT provider_user_id FROM users WHERE id = $1', [id]);
    expect(rows[0].provider_user_id).toBe('9223372036854775807');
  });

  it('T-I12 세션 토큰 해시는 32바이트만, 사용자를 지우면 세션도 지워진다', async () => {
    const userId = await insertUser('1');
    const insertSession = (h: Buffer) =>
      pool.query(
        `INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, now() + interval '30 days')`,
        [h, userId],
      );
    await expect(insertSession(hash(1, 31))).rejects.toMatchObject({
      constraint: 'sessions_token_hash_check',
    });
    await insertSession(hash(2));
    await expect(
      pool.query(`INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, 999, now())`, [
        hash(3),
      ]),
    ).rejects.toMatchObject({ constraint: 'sessions_user_id_fkey' });

    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    const { rowCount } = await pool.query('SELECT 1 FROM sessions');
    expect(rowCount).toBe(0);
  });
});
