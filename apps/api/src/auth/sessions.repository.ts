import { Injectable } from '@nestjs/common';
import { and, eq, gt, lte } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service.js';
import { sessions } from '../database/schema.js';
import { toUserId, type UserId } from '../common/user-id.js';

export interface SessionRecord {
  userId: UserId;
  expiresAt: Date;
}

/**
 * DB 세션 (ADR-0004, data-model §3.2).
 * NFR-003 예외: 이 Repository만 userId 없이 token_hash로 조회한다 — 아직 사용자를 모르는 단계이기 때문 (architecture §3.3).
 * 인자로 받는 것은 항상 토큰의 **SHA-256 해시**다. 원본 토큰은 DB에 닿지 않는다.
 */
@Injectable()
export class SessionsRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(userId: UserId, tokenHash: Buffer, expiresAt: Date): Promise<void> {
    await this.database.db.insert(sessions).values({ tokenHash, userId, expiresAt });
  }

  /** 만료되지 않은 세션만 (만료 = `expires_at <= now()`) */
  async findValid(tokenHash: Buffer, now: Date): Promise<SessionRecord | null> {
    const [row] = await this.database.db
      .select({ userId: sessions.userId, expiresAt: sessions.expiresAt })
      .from(sessions)
      .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, now)));
    return row ? { userId: toUserId(row.userId), expiresAt: row.expiresAt } : null;
  }

  /** 슬라이딩 연장 (ADR-0004) */
  async extend(tokenHash: Buffer, expiresAt: Date): Promise<void> {
    await this.database.db
      .update(sessions)
      .set({ expiresAt })
      .where(eq(sessions.tokenHash, tokenHash));
  }

  /** 로그아웃 (AC-040-3) */
  async delete(tokenHash: Buffer): Promise<void> {
    await this.database.db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
  }

  /** 크론 대신 로그인할 때 그 사용자의 만료 세션을 지운다 (architecture §4.3) */
  async deleteExpired(userId: UserId, now: Date): Promise<void> {
    await this.database.db
      .delete(sessions)
      .where(and(eq(sessions.userId, userId), lte(sessions.expiresAt, now)));
  }
}
