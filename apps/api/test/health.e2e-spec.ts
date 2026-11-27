import 'reflect-metadata';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.js';
import { DatabaseService } from '../src/database/database.service.js';

// A1 GET /api/health — NFR-002, api-spec.md A1
describe('GET /api/health (A1)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // DATABASE_URL이 없어도(= DB에 연결할 수 없어도) 앱이 뜨고 health가 200이어야 한다 (architecture §5.2)
    delete process.env.DATABASE_URL;
    // DB에 닿으면 바로 실패하는 가짜 (architecture §5.2: health는 세션 조회도 하지 않는다)
    const explodingDb = {
      get db(): never {
        throw new Error('/api/health가 DB에 접근했습니다');
      },
    };
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(DatabaseService)
      .useValue(explodingDb)
      .compile();
    app = configureApp(moduleRef.createNestApplication());
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('T-E01 DB 없이(DB 접근 시 실패하는 가짜) · 프록시 비밀 없이 200 · 캐시 금지 · 응답 형식', async () => {
    const res = await request(app.getHttpServer()).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.body).toEqual({ status: 'ok', version: 'dev', uptimeSec: expect.any(Number) });
  });

  it('/api 접두사 없는 경로는 404', async () => {
    const res = await request(app.getHttpServer()).get('/health');
    expect(res.status).toBe(404);
  });
});
