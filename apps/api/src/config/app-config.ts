import { Injectable } from '@nestjs/common';

/**
 * 환경 변수 (architecture §8.1).
 * 규칙: 값이 없어도 앱은 뜬다 — `/api/health`는 DB·카카오 설정 없이 200이어야 한다 (architecture §5.2).
 * 값이 필요한 곳에서 `require*()`로 읽고, 없으면 그때 실패한다.
 */
@Injectable()
export class AppConfig {
  constructor(private readonly env: NodeJS.ProcessEnv = process.env) {}

  /** Neon pooled 연결 문자열 (런타임) */
  databaseUrl(): string {
    return this.required('DATABASE_URL');
  }

  /** 프록시 비밀 — 없으면 undefined, 미들웨어가 모든 요청을 거부한다(fail closed) */
  proxySecret(): string | undefined {
    return this.env.PROXY_SECRET || undefined;
  }

  /** 앱 도메인 (Origin 검사 기준) — 없으면 undefined, 상태 변경 요청을 모두 거부한다 */
  appOrigin(): string | undefined {
    const value = this.env.APP_ORIGIN;
    return value ? new URL(value).origin : undefined; // 끝의 '/' 등을 정규화
  }

  kakao(): { clientId: string; clientSecret: string; redirectUri: string } {
    return {
      clientId: this.required('KAKAO_CLIENT_ID'),
      clientSecret: this.required('KAKAO_CLIENT_SECRET'),
      redirectUri: this.required('KAKAO_REDIRECT_URI'),
    };
  }

  private required(name: string): string {
    const value = this.env[name];
    if (!value) throw new Error(`환경 변수 ${name}이(가) 설정되지 않았습니다`);
    return value;
  }
}
