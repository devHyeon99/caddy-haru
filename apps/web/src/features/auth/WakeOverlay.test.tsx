import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiFetch, configureApiClient } from '../../shared/api/client';
import { markServerResponded, resetWakeForTest } from '../../shared/api/server-wake';
import { gateway, healthOk, installFakeApi, json } from '../../test/fake-api';
import { WakeOverlay } from './WakeOverlay';

// T-W05 SCR-00o 오버레이 저장 (NFR-002, ui-design §4.2)
describe('SCR-00o 오버레이 (T-W05)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetWakeForTest();
    configureApiClient({ onUnauthorized: () => {} });
    markServerResponded(Date.now() - 15 * 60_000); // 마지막 응답 15분 전
  });
  afterEach(() => {
    resetWakeForTest();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  const advance = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms));

  it('저장 → 1.5초 뒤 오버레이 "깨어나면 자동으로 저장할게요" → A1 200 → 저장 한 번 → 오버레이 닫힘', async () => {
    let up = false;
    const api = installFakeApi((req) => {
      if (req.path === '/api/health') return up ? healthOk() : gateway(503);
      return json(201, { id: 1 });
    });
    render(<WakeOverlay />);
    const saving = apiFetch('/api/rounds', { method: 'POST', body: {} });

    await advance(1_400);
    expect(screen.queryByRole('dialog')).toBeNull();
    await advance(200);
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('깨어나면 자동으로 저장할게요.')).toBeTruthy();

    up = true;
    await advance(3_000);
    await expect(saving).resolves.toEqual({ id: 1 });
    expect(api.paths().filter((p) => p === 'POST /api/rounds')).toHaveLength(1);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('[취소] → 저장 안 함, 오버레이 닫힘', async () => {
    const api = installFakeApi(() => gateway(503));
    render(<WakeOverlay />);
    const saving = apiFetch('/api/rounds', { method: 'POST', body: {} }).catch((e) => e);
    await advance(1_600);
    fireEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(await saving).toMatchObject({ kind: 'cancelled' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(api.paths()).not.toContain('POST /api/rounds');
  });

  it('3분 초과 → "서버가 응답하지 않아요" + [다시 시도] [닫기]', async () => {
    installFakeApi(() => gateway(504));
    render(<WakeOverlay />);
    const saving = apiFetch('/api/rounds', { method: 'POST', body: {} }).catch((e) => e);
    await advance(181_000);
    expect(screen.getByText('서버가 응답하지 않아요')).toBeTruthy();
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '닫기' }));
    expect(await saving).toMatchObject({ kind: 'cancelled' });
  });

  it('앱 시작(boot) 중에는 오버레이를 띄우지 않는다 (SCR-00이 맡음)', async () => {
    installFakeApi(() => gateway(503));
    render(<WakeOverlay />);
    const { ensureAwake } = await import('../../shared/api/server-wake');
    void ensureAwake({ mode: 'boot' });
    await advance(2_000);
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
