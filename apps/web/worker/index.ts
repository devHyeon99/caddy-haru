// Cloudflare Worker — 정적 파일(SPA) + /api/* → Render(NestJS) 프록시
// architecture §5.1, ADR-0002(2026-11-27 개정: Pages → Workers 정적 자산), ADR-0004
// 규칙: 상태·로직 없음. redirect는 따라가지 않고(OAuth 302), 응답 헤더(여러 Set-Cookie)는 그대로 전달한다.
// /api/*만 이 코드가 먼저 받는다(wrangler.jsonc run_worker_first). 나머지는 정적 자산이 바로 응답한다.

interface Env {
  ASSETS: Fetcher;
  API_ORIGIN: string;
  PROXY_SECRET: string;
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) {
      return env.ASSETS.fetch(request);
    }

    // 설정이 빠지면 예외(1101) 대신 원인이 보이는 503 — 화면은 "서버 깨우는 중" 흐름으로 처리된다(architecture §5.3)
    if (!env.API_ORIGIN || !env.PROXY_SECRET) {
      console.error('프록시 설정 누락', {
        API_ORIGIN: Boolean(env.API_ORIGIN),
        PROXY_SECRET: Boolean(env.PROXY_SECRET),
      });
      return new Response('proxy not configured', {
        status: 503,
        headers: { 'cache-control': 'no-store' },
      });
    }

    const target = new URL(url.pathname + url.search, env.API_ORIGIN); // /api 접두사 유지

    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.set('x-proxy-secret', env.PROXY_SECRET);
    headers.set('x-forwarded-for', request.headers.get('cf-connecting-ip') ?? '');
    headers.set('x-forwarded-proto', 'https');
    headers.set('x-forwarded-host', url.host);

    const hasBody = !['GET', 'HEAD'].includes(request.method);
    const res = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? request.body : undefined,
      redirect: 'manual',
    });
    return new Response(res.body, res);
  },
} satisfies ExportedHandler<Env>;
