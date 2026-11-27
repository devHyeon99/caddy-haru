import type { RouteObject } from 'react-router';
import { LoginPage } from '../features/auth/LoginPage';
import { RequireAuth } from '../features/auth/RequireAuth';
import { RootLayout } from '../features/auth/RootLayout';
import { HomePage } from '../features/home/HomePage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { NotFoundPage } from './NotFoundPage';

// 라우트 표 — ui-design §2·§3.1. 통계·CSV는 지연 로딩(ADR-0009, NFR-002)
// RootLayout(SCR-00 깨우기) → /login(SCR-06) | RequireAuth(B4, AC-040-4) → 데이터 화면
export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      {
        element: <RequireAuth />,
        children: [
          { path: '/', element: <HomePage /> },
          {
            path: '/stats',
            lazy: async () => {
              const { StatsPage } = await import('../features/stats/StatsPage');
              return { Component: StatsPage };
            },
          },
          { path: '/settings', element: <SettingsPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
