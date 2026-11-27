import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { KakaoClient } from './kakao.client.js';
import { SessionGuard } from './session.guard.js';
import { SessionsRepository } from './sessions.repository.js';

/** FR-040 · ADR-0004. SessionGuard는 전역 — 새 라우트는 기본이 "로그인 필요" */
@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    KakaoClient,
    SessionsRepository,
    { provide: APP_GUARD, useClass: SessionGuard },
  ],
})
export class AuthModule {}
