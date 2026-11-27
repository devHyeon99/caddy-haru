import { defineConfig } from 'drizzle-kit';

// 마이그레이션 SQL 생성·적용 (ADR-0003, architecture §8.2)
// - 생성: pnpm --filter @caddy-haru/api db:generate → drizzle/*.sql을 PR에서 리뷰
// - 적용: GitHub Actions(deploy-api.yml)가 DIRECT_DATABASE_URL(Neon direct, PgBouncer 경유 금지)로 실행
// - 서버 시작 시 실행 금지 (CLAUDE.md §7)
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/database/schema.ts',
  out: './drizzle',
  dbCredentials: { url: process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL ?? '' },
  strict: true,
  verbose: true,
});
