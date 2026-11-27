import { Controller, Get, Header } from '@nestjs/common';
import type { HealthResponse } from '@caddy-haru/shared';

/**
 * A1 GET /api/health — 서버 깨어 있음 확인 (NFR-002, api-spec.md A1)
 * 규칙: DB·세션에 접근하지 않는다 (architecture §5.2, CLAUDE.md §7).
 * 이 컨트롤러는 어떤 Provider도 주입받지 않는다 → DB 의존성을 가질 수 없다.
 */
@Controller('health')
export class HealthController {
  private readonly version = (process.env.GIT_SHA ?? process.env.RENDER_GIT_COMMIT ?? 'dev').slice(
    0,
    7,
  );

  @Get()
  @Header('Cache-Control', 'no-store')
  get(): HealthResponse {
    return {
      status: 'ok',
      version: this.version,
      uptimeSec: Math.floor(process.uptime()),
    };
  }
}
