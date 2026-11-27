import { vi } from 'vitest';

// 테스트용 가짜 API — fetch를 바꿔 끼우고 호출 기록을 남긴다
export interface FakeRequest {
  method: string;
  path: string;
  body: unknown;
  init: RequestInit | undefined;
}

export type FakeHandler = (req: FakeRequest) => Response | Promise<Response>;

export function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export function apiError(status: number, code: string, message = code): Response {
  return json(status, { error: { code, message, requestId: 'req-test' } });
}

export const healthOk = () => json(200, { status: 'ok', version: 'abc1234', uptimeSec: 1 });
export const gateway = (status = 503) => new Response('proxy error', { status });

/** 응답하지 않다가 abort되면 거부되는 fetch (시간 초과 재현) */
export function hang(init: RequestInit | undefined): Promise<Response> {
  return new Promise((_, reject) => {
    init?.signal?.addEventListener('abort', () =>
      reject(new DOMException('The operation was aborted.', 'AbortError')),
    );
  });
}

export function installFakeApi(handler: FakeHandler) {
  const calls: FakeRequest[] = [];
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const path = typeof input === 'string' ? input : input.toString();
    const req: FakeRequest = {
      method: init?.method ?? 'GET',
      path,
      body: typeof init?.body === 'string' ? JSON.parse(init.body) : undefined,
      init,
    };
    calls.push(req);
    return handler(req);
  });
  vi.stubGlobal('fetch', fetchMock);
  return {
    calls,
    paths: () => calls.map((c) => `${c.method} ${c.path}`),
    fetchMock,
  };
}
