import type { INestApplication } from '@nestjs/common';

/** main.ts와 E2E 테스트가 같은 설정을 쓰도록 한 곳에 모은다 (architecture §3) */
export function configureApp(app: INestApplication): INestApplication {
  app.setGlobalPrefix('api');
  // Cloudflare Pages Functions 프록시 뒤에 있으므로 클라이언트 IP·프로토콜은 프록시 헤더를 믿는다 (architecture §5.1)
  const http = app.getHttpAdapter().getInstance() as { set?: (k: string, v: unknown) => void };
  http.set?.('trust proxy', true);
  return app;
}
