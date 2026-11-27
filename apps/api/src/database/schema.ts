// Drizzle 스키마 — data-model.md §4 목표 DDL과 일치해야 한다 (ADR-0003).
// 제약 이름도 §4(= PostgreSQL 기본 이름)와 같게 지정한다. T-I10이 실제 DB와 비교한다.
// golf_clubs·rounds는 해당 기능 구현 때 추가한다.
import { sql } from 'drizzle-orm';
import {
  check,
  customType,
  foreignKey,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';

/** drizzle-orm 0.45에는 bytea 컬럼이 없어 직접 정의한다 (node-postgres는 bytea를 Buffer로 준다) */
const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType: () => 'bytea',
});

const timestamptz = (name: string) => timestamp(name, { withTimezone: true, mode: 'date' });

// users (FR-040, data-model §3.1)
export const users = pgTable(
  'users',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    provider: text('provider').notNull().default('kakao'),
    /** 카카오 회원번호 — 64비트 정수라 문자열로 저장 (architecture §4.1) */
    providerUserId: text('provider_user_id').notNull(),
    createdAt: timestamptz('created_at').notNull().defaultNow(),
    updatedAt: timestamptz('updated_at').notNull().defaultNow(),
  },
  (t) => [
    check('users_provider_check', sql`${t.provider} = 'kakao'`),
    unique('users_provider_user_key').on(t.provider, t.providerUserId), // AC-040-2
  ],
);

// sessions (ADR-0004, data-model §3.2)
export const sessions = pgTable(
  'sessions',
  {
    /** 쿠키 토큰의 SHA-256 해시. 원본 토큰은 저장하지 않는다 */
    tokenHash: bytea('token_hash').primaryKey(),
    userId: integer('user_id').notNull(),
    expiresAt: timestamptz('expires_at').notNull(),
    createdAt: timestamptz('created_at').notNull().defaultNow(),
  },
  (t) => [
    check('sessions_token_hash_check', sql`octet_length(${t.tokenHash}) = 32`),
    foreignKey({
      name: 'sessions_user_id_fkey',
      columns: [t.userId],
      foreignColumns: [users.id],
    }).onDelete('cascade'),
    index('sessions_user_id_idx').on(t.userId),
  ],
);
