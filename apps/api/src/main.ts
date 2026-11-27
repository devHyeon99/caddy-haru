import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configureApp } from './app.js';

// 규칙: 시작할 때 DB 연결·마이그레이션을 하지 않는다 (lazy 연결, CLAUDE.md §7, architecture §5.2)
async function bootstrap(): Promise<void> {
  loadLocalEnv();
  const app = configureApp(await NestFactory.create(AppModule));
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
}

void bootstrap();

/** 로컬 개발: apps/api/.env가 있으면 읽는다 (예시는 .env.example). 운영(Render)은 대시보드 환경 변수 */
function loadLocalEnv(): void {
  if (process.env.NODE_ENV === 'production') return;
  try {
    process.loadEnvFile('.env');
  } catch {
    // .env 없음 — 환경 변수만 사용
  }
}
