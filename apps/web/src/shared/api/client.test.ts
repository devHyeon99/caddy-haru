import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiError, gateway, hang, healthOk, installFakeApi, json } from '../../test/fake-api';
import { apiFetch, configureApiClient, REQUEST_TIMEOUT_MS } from './client';
import { ApiRequestError } from './errors';
import { cancelWake, getWakeState, markServerResponded, resetWakeForTest } from './server-wake';

// fetch 래퍼 — ui-design §1.3, architecture §5.3, ADR-0008
describe('apiFetch', () => {
  const onUnauthorized = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    resetWakeForTest();
    markServerResponded(); // 방금 깨어 있던 상태
    onUnauthorized.mockReset();
    configureApiClient({ onUnauthorized });
  });
  afterEach(() => {
    resetWakeForTest();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('쿠키를 보내고(same-origin) JSON을 돌려준다', async () => {
    const api = installFakeApi(() => json(200, { id: 1, createdAt: '2026-11-28T00:00:00.000Z' }));
    await expect(apiFetch('/api/auth/me')).resolves.toEqual({
      id: 1,
      createdAt: '2026-11-28T00:00:00.000Z',
    });
    expect(api.calls[0]?.init?.credentials).toBe('same-origin');
  });

  it('204는 undefined', async () => {
    installFakeApi(() => new Response(null, { status: 204 }));
    await expect(apiFetch('/api/auth/logout', { method: 'POST' })).resolves.toBeUndefined();
  });

  it('ADR-0008 에러 본문을 code·requestId로 꺼낸다', async () => {
    installFakeApi(() => apiError(409, 'DUPLICATE_ROUND', '이미 1부 기록이 있습니다.'));
    const error = (await apiFetch('/api/rounds', { method: 'POST', body: {} }).catch(
      (e: unknown) => e,
    )) as ApiRequestError;
    expect(error).toBeInstanceOf(ApiRequestError);
    expect(error).toMatchObject({ kind: 'http', status: 409, code: 'DUPLICATE_ROUND' });
    expect(error.requestId).toBe('req-test');
    expect(error.message).toBe('이미 1부 기록이 있습니다.');
  });

  it('401 → onUnauthorized(캐시 비우기 + /login) 후 에러 (AC-040-4)', async () => {
    installFakeApi(() => apiError(401, 'UNAUTHENTICATED'));
    const error = await apiFetch('/api/auth/me').catch((e) => e);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    expect(error).toMatchObject({ status: 401, code: 'UNAUTHENTICATED' });
  });

  it('조회가 503이면 깨운 뒤 1회만 다시 보낸다 (architecture §5.3)', async () => {
    let first = true;
    const api = installFakeApi((req) => {
      if (req.path === '/api/health') return healthOk();
      if (first) {
        first = false;
        return gateway(503);
      }
      return json(200, { ok: true });
    });
    await expect(apiFetch('/api/rounds?month=2026-11')).resolves.toEqual({ ok: true });
    expect(api.paths()).toEqual([
      'GET /api/rounds?month=2026-11',
      'GET /api/health',
      'GET /api/rounds?month=2026-11',
    ]);
  });

  it('조회가 다시 보낸 뒤에도 502면 unavailable', async () => {
    const api = installFakeApi((req) => (req.path === '/api/health' ? healthOk() : gateway(502)));
    const error = await apiFetch('/api/rounds').catch((e) => e);
    expect(error).toMatchObject({ kind: 'unavailable', status: 502 });
    expect(api.calls.filter((c) => c.path === '/api/rounds')).toHaveLength(2);
  });

  it('조회가 시간 초과면 깨우기 흐름으로 간다', async () => {
    let first = true;
    const api = installFakeApi((req) => {
      if (req.path === '/api/health') return healthOk();
      if (first) {
        first = false;
        return hang(req.init);
      }
      return json(200, []);
    });
    const result = apiFetch('/api/golf-clubs');
    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS);
    await expect(result).resolves.toEqual([]);
    expect(api.paths()).toEqual(['GET /api/golf-clubs', 'GET /api/health', 'GET /api/golf-clubs']);
  });

  it('이미 보낸 저장이 503이면 다시 보내지 않는다 → unavailable("다시 저장")', async () => {
    const api = installFakeApi(() => gateway(503));
    const error = await apiFetch('/api/rounds', { method: 'POST', body: { a: 1 } }).catch((e) => e);
    expect(error).toMatchObject({ kind: 'unavailable', status: 503 });
    expect(api.paths()).toEqual(['POST /api/rounds']);
  });

  // T-W05 오버레이 저장 (NFR-002, ui-design §4.2): 마지막 응답 15분 전 → 저장 → A1 200 후 D3가 한 번만
  it('T-W05: 마지막 응답이 15분 전이면 A1부터, 깨어난 뒤 저장을 한 번만 보낸다', async () => {
    markServerResponded(Date.now() - 15 * 60_000);
    let healthCalls = 0;
    const api = installFakeApi((req) => {
      if (req.path === '/api/health') return ++healthCalls < 3 ? gateway(503) : healthOk();
      return json(201, { id: 10 });
    });

    const saving = apiFetch('/api/rounds', { method: 'POST', body: { slot: 1 } });
    await vi.advanceTimersByTimeAsync(1_500);
    expect(getWakeState()).toMatchObject({ mode: 'overlay', visible: true, pendingSave: true });
    expect(api.paths()).not.toContain('POST /api/rounds');

    await vi.advanceTimersByTimeAsync(6_000);
    await expect(saving).resolves.toEqual({ id: 10 });
    expect(api.paths()).toEqual([
      'GET /api/health',
      'GET /api/health',
      'GET /api/health',
      'POST /api/rounds',
    ]);
    expect(api.calls.at(-1)?.body).toEqual({ slot: 1 });
  });

  it('T-W05: 오버레이에서 취소하면 저장을 보내지 않는다 (cancelled)', async () => {
    markServerResponded(Date.now() - 15 * 60_000);
    const api = installFakeApi(() => gateway(503));
    const saving = apiFetch('/api/rounds', { method: 'POST', body: {} }).catch((e) => e);
    await vi.advanceTimersByTimeAsync(2_000);
    cancelWake();
    expect(await saving).toMatchObject({ kind: 'cancelled' });
    await vi.advanceTimersByTimeAsync(10_000);
    expect(api.paths()).not.toContain('POST /api/rounds');
  });
});
