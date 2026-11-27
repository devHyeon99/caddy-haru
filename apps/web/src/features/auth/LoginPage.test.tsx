import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetWakeForTest } from '../../shared/api/server-wake';
import { redirectTo } from '../../shared/lib/browser';
import { apiError, healthOk, installFakeApi, json } from '../../test/fake-api';
import { renderApp } from '../../test/render-app';

vi.mock('../../shared/lib/browser', () => ({ redirectTo: vi.fn() }));

// SCR-06 로그인 — FR-040, ui-design §4.3
describe('LoginPage (SCR-06)', () => {
  let loggedIn = false;
  beforeEach(() => {
    resetWakeForTest();
    loggedIn = false;
    vi.mocked(redirectTo).mockReset();
    installFakeApi((req) => {
      if (req.path === '/api/health') return healthOk();
      if (req.path === '/api/auth/me') {
        return loggedIn
          ? json(200, { id: 1, createdAt: '2026-11-28T00:00:00.000Z' })
          : apiError(401, 'UNAUTHENTICATED');
      }
      return apiError(404, 'NOT_FOUND');
    });
  });
  afterEach(() => {
    resetWakeForTest();
    vi.unstubAllGlobals();
  });

  it.each([
    ['cancelled', '카카오 로그인을 취소했어요. 다시 시도해 주세요.'],
    ['state', '로그인 확인 시간이 지났어요. 다시 시도해 주세요.'],
    ['kakao', '카카오 연결에 문제가 있어요. 잠시 후 다시 시도해 주세요.'],
    ['xyz', '카카오 연결에 문제가 있어요. 잠시 후 다시 시도해 주세요.'],
  ])(
    'T-W09: /login?error=%s → 배너 문구, 주소에서 error 제거 (AC-040-5)',
    async (code, message) => {
      const { router } = renderApp([`/login?error=${code}`]);
      expect(await screen.findByRole('alert')).toHaveProperty('textContent', `⚠ ${message}`);
      await waitFor(() => expect(router.state.location.search).toBe(''));
      expect(screen.getByRole('alert').textContent).toContain(message); // 지운 뒤에도 유지
    },
  );

  it('error가 없으면 배너 없음', async () => {
    renderApp(['/login']);
    await screen.findByRole('button', { name: '카카오 로그인' });
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('카카오 로그인 → B1으로 페이지 이동, 버튼 비활성 + "카카오로 이동 중…" (FR-040)', async () => {
    renderApp(['/login']);
    fireEvent.click(await screen.findByRole('button', { name: '카카오 로그인' }));
    expect(redirectTo).toHaveBeenCalledWith('/api/auth/kakao/login');
    const button = screen.getByRole('button', { name: '카카오로 이동 중…' });
    expect(button).toHaveProperty('disabled', true);
  });

  it('카카오 화면에서 뒤로 와서 bfcache로 복원되면 버튼을 다시 살린다', async () => {
    renderApp(['/login']);
    fireEvent.click(await screen.findByRole('button', { name: '카카오 로그인' }));
    const event = new Event('pageshow') as PageTransitionEvent;
    Object.defineProperty(event, 'persisted', { value: true });
    fireEvent(window, event);
    expect(await screen.findByRole('button', { name: '카카오 로그인' })).toHaveProperty(
      'disabled',
      false,
    );
  });

  it('이미 로그인한 상태로 /login에 오면 / 로 (ui-design §2)', async () => {
    loggedIn = true;
    const { router } = renderApp(['/login']);
    await waitFor(() => expect(router.state.location.pathname).toBe('/'));
    expect(await screen.findByText(/로그인됨/)).toBeTruthy();
  });
});
