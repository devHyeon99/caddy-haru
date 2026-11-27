import { Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service.js';
import { users } from '../database/schema.js';
import { toUserId, type UserId } from '../common/user-id.js';

export interface UserRecord {
  id: UserId;
  createdAt: Date;
}

/** 사용자 조회·생성 (FR-040, data-model §3.1) */
@Injectable()
export class UsersRepository {
  constructor(private readonly database: DatabaseService) {}

  /**
   * 카카오 회원번호로 사용자를 찾고, 없으면 만든다 (AC-040-1 처음 로그인, AC-040-2 같은 계정 재사용).
   * `UNIQUE (provider, provider_user_id)`로 동시 로그인에도 계정이 하나만 생긴다.
   * 충돌 시 아무 값도 바꾸지 않는 UPDATE로 기존 행의 id를 돌려받는다.
   */
  async upsertKakaoUser(kakaoUserId: string): Promise<UserId> {
    const [row] = await this.database.db
      .insert(users)
      .values({ provider: 'kakao', providerUserId: kakaoUserId })
      .onConflictDoUpdate({
        target: [users.provider, users.providerUserId],
        set: { provider: sql`excluded.provider` },
      })
      .returning({ id: users.id });
    if (!row) throw new Error('사용자 upsert 결과가 없습니다');
    return toUserId(row.id);
  }

  /** 자기 자신만 조회 — userId는 세션에서 온 값 (NFR-003) */
  async findById(userId: UserId): Promise<UserRecord | null> {
    const [row] = await this.database.db
      .select({ id: users.id, createdAt: users.createdAt })
      .from(users)
      .where(eq(users.id, userId));
    return row ? { id: toUserId(row.id), createdAt: row.createdAt } : null;
  }
}
