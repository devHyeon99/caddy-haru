import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { queryKeys } from '../../shared/api/query-keys';
import { resetWakeForTest } from '../../shared/api/server-wake';
import { apiError, gateway, healthOk, installFakeApi, json } from '../../test/fake-api';
import { renderApp } from '../../test/render-app';

const ME = { id: 1, createdAt: '2026-11-28T00:00:00.000Z' };
const DATA_SCREEN_TEXT = '카카오 계정으로 로그인됨';

// 인증 가드·로그아웃 — FR-040, ui-design §1.3·§4.10
describe('인증 흐름', () => {
  let loggedIn = true;
  let logoutFails = false;
  let api: ReturnType<typeof installFakeApi>;

  beforeEach(() => {
    resetWakeForTest();
    loggedIn = true;
    logoutFails = false;
    api = installFakeApi((req) => {
      if (req.path === '/api/health') return healthOk();
      if (req.path === '/api/auth/me') {
        return loggedIn ? json(200, ME) : apiError(401, 'UNAUTHENTICATED');
      }
      if (req.path === '/api/auth/logout' && req.method === 'POST') {
        if (logoutFails) return Promise.reject(new TypeError('Failed to fetch'));
        loggedIn = false;
        return new Response(null, { status: 204 });
      }
      return apiError(404, 'NOT_FOUND');
    });
  });
  afterEach(() => {
    resetWakeForTest();
    vi.unstubAllGlobals();
  });

  it('AC-040-4: 로그인하지 않고 보호 주소에 들어오면 /login으로, 데이터 화면은 그리지 않는다', async () => {
    loggedIn = false;
    const { router } = renderApp(['/settings']);
    await screen.findByRole('button', { name: '카카오 로그인' });
    expect(router.state.location.pathname).toBe('/login');
    expect(screen.queryByText(DATA_SCREEN_TEXT)).toBeNull();
    // 앱 시작 순서: A1 → B4 (ui-design §3.1)
    expect(api.paths().slice(0, 2)).toEqual(['GET /api/health', 'GET /api/auth/me']);
  });

  it('로그인 상태면 B4 200 → 보호 화면', async () => {
    renderApp(['/settings']);
    expect(await screen.findByText(DATA_SCREEN_TEXT)).toBeTruthy();
    expect(screen.getByText('버전 abc1234')).toBeTruthy(); // A1 version
  });

  it('T-W08 (AC-040-3): 로그아웃 → B3 204 → 캐시 비움 → /login replace → 뒤로 가기에도 데이터 없음', async () => {
    const { router, queryClient } = renderApp(['/', '/settings']);
    await screen.findByText(DATA_SCREEN_TEXT);
    queryClient.setQueryData(queryKeys.golfClubs(), [{ id: 1, name: '가나 CC' }]);

    fireEvent.click(screen.getByRole('button', { name: '로그아웃' }));
    await screen.findByRole('button', { name: '카카오 로그인' });

    expect(api.paths()).toContain('POST /api/auth/logout');
    expect(router.state.location.pathname).toBe('/login');
    expect(router.state.historyAction).toBe('REPLACE');
    expect(queryClient.getQueryData(queryKeys.golfClubs())).toBeUndefined();
    expect(queryClient.getQueryData(queryKeys.me())).toBeUndefined();

    // history.back() → '/' → B4 401 → 다시 로그인 화면
    await act(() => router.navigate(-1));
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'));
    await screen.findByRole('button', { name: '카카오 로그인' });
    expect(screen.queryByText(DATA_SCREEN_TEXT)).toBeNull();
    expect(screen.queryByText('가나 CC')).toBeNull();
    expect(screen.queryByText(/로그인됨/)).toBeNull();
  });

  it('B3가 네트워크 오류여도 캐시를 비우고 /login으로 간다 (ui-design §4.10)', async () => {
    logoutFails = true;
    const { router, queryClient } = renderApp(['/settings']);
    await screen.findByText(DATA_SCREEN_TEXT);
    queryClient.setQueryData(queryKeys.golfClubs(), [{ id: 1 }]);

    fireEvent.click(screen.getByRole('button', { name: '로그아웃' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'), { timeout: 3_000 });
    expect(queryClient.getQueryData(queryKeys.golfClubs())).toBeUndefined();
  });

  it('B4가 401이 아닌 오류면 다시 시도 화면 (ui-design §1.3)', async () => {
    let fail = true;
    installFakeApi((req) => {
      if (req.path === '/api/health') return healthOk();
      if (fail) return apiError(500, 'INTERNAL_ERROR');
      return json(200, ME);
    });
    renderApp(['/settings']);
    expect((await screen.findByRole('alert')).textContent).toBe('서버에 연결하지 못했어요');
    fail = false;
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(await screen.findByText(DATA_SCREEN_TEXT)).toBeTruthy();
  });
});

// T-W04 깨우기 화면 (NFR-002, ui-design §4.1) — 화면 표시 단계
describe('SCR-00 서버 깨우는 중 (T-W04)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetWakeForTest();
  });
  afterEach(() => {
    resetWakeForTest();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  const advance = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms));

  it('1.5초 전 안 보임 → 보임 → 1분 뒤 추가 문구 → 3분 뒤 실패 → [다시 시도] → B4', async () => {
    let up = false;
    const api = installFakeApi((req) => {
      if (req.path === '/api/health') return up ? healthOk() : gateway(503);
      return apiError(401, 'UNAUTHENTICATED');
    });
    renderApp(['/']);

    await advance(1_400);
    expect(screen.getByText('캐디하루')).toBeTruthy();
    expect(screen.queryByText('서버를 깨우는 중이에요')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull(); // 깨어나기 전에는 서버가 필요한 버튼 없음

    await advance(200);
    expect(screen.getByText('서버를 깨우는 중이에요')).toBeTruthy();
    expect(screen.queryByText(/조금 더 걸리고 있어요/)).toBeNull();

    await advance(60_000);
    expect(screen.getByText(/조금 더 걸리고 있어요/)).toBeTruthy();

    await advance(120_000);
    expect(screen.getByRole('alert').textContent).toBe('서버가 응답하지 않아요');
    expect(api.paths()).not.toContain('GET /api/auth/me');

    up = true;
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    await advance(0);
    await advance(0);
    expect(screen.getByRole('button', { name: '카카오 로그인' })).toBeTruthy();
    expect(api.paths().at(-1)).toBe('GET /api/auth/me');
  });
});
