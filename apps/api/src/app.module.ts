import { type MiddlewareConsumer, Module, type NestModule, RequestMethod } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AuthModule } from './auth/auth.module.js';
import { ApiExceptionFilter } from './common/filters/api-exception.filter.js';
import { OriginCheckMiddleware } from './common/middleware/origin-check.middleware.js';
import { ProxySecretMiddleware } from './common/middleware/proxy-secret.middleware.js';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware.js';
import { ConfigModule } from './config/config.module.js';
import { DatabaseModule } from './database/database.module.js';
import { HealthModule } from './health/health.module.js';

@Module({
  imports: [ConfigModule, DatabaseModule, HealthModule, AuthModule],
  providers: [{ provide: APP_FILTER, useClass: ApiExceptionFilter }],
})
export class AppModule implements NestModule {
  /** 순서: 요청 ID → 프록시 비밀(architecture §5.1) → Origin(§4.1) → SessionGuard → Controller (§3.2) */
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(RequestIdMiddleware, ProxySecretMiddleware, OriginCheckMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
}
