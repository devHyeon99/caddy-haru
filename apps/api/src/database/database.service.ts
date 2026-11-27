import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { AppConfig } from '../config/app-config.js';
import * as schema from './schema.js';

export type Db = NodePgDatabase<typeof schema>;

/**
 * DB 연결 (ADR-0003, architecture §5.2).
 * 규칙: 서버 시작 시 연결하지 않는다. `db`를 처음 읽을 때 Pool을 만들고, Pool은 첫 쿼리 때 실제로 연결한다.
 * → `/api/health`와 서버 깨우기가 Neon을 깨우지 않는다.
 */
@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private pool: pg.Pool | undefined;
  private instance: Db | undefined;

  constructor(private readonly config: AppConfig) {}

  get db(): Db {
    if (!this.instance) {
      this.pool = new pg.Pool({
        connectionString: this.config.databaseUrl(),
        // Render 무료(512MB)·Neon 무료 연결 한도에 맞춰 작게
        max: 5,
        idleTimeoutMillis: 30_000,
      });
      this.instance = drizzle(this.pool, { schema });
    }
    return this.instance;
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool?.end();
  }
}
