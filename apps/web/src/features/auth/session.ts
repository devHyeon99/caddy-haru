import type { MeResponse } from '@caddy-haru/shared';
import type { QueryClient } from '@tanstack/react-query';
import type { createBrowserRouter } from 'react-router';
import { apiFetch } from '../../shared/api/client';

type AppRouter = ReturnType<typeof createBrowserRouter>;

export const LOGIN_PATH = '/login';
/** B1 — fetch가 아니라 페이지 이동 (ui-design §4.3) */
export const KAKAO_LOGIN_URL = '/api/auth/kakao/login';

/** B4 `GET /api/auth/me` */
export function fetchMe(signal?: AbortSignal): Promise<MeResponse> {
  return apiFetch<MeResponse>('/api/auth/me', { signal });
}

/**
 * 401 `UNAUTHENTICATED` → 메모리 캐시 비우고 `/login`으로 replace (ui-design §1.3, AC-040-3·4, ADR-0009)
 * 이미 `/login`이면 아무것도 하지 않는다(로그인 화면의 "이미 로그인했나" 확인이 401을 받는 경우).
 */
export function createUnauthorizedHandler(router: AppRouter, queryClient: QueryClient) {
  return () => {
    if (router.state.location.pathname === LOGIN_PATH) return;
    queryClient.clear();
    void router.navigate(LOGIN_PATH, { replace: true });
  };
}

/**
 * B3 `POST /api/auth/logout` — 204 → 캐시 비우기 → `/login` replace (AC-040-3)
 * B3가 실패해도(네트워크 등) 캐시를 비우고 `/login`으로 간다(ui-design §4.10).
 */
export async function logout(
  queryClient: QueryClient,
  navigate: (to: string, options: { replace: boolean }) => unknown,
) {
  try {
    await apiFetch<void>('/api/auth/logout', { method: 'POST', pendingSave: false });
  } catch {
    // 진행한다
  }
  queryClient.clear();
  await navigate(LOGIN_PATH, { replace: true });
}
