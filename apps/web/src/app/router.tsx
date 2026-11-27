import { createBrowserRouter } from 'react-router';
import { HomePage } from '../features/home/HomePage';
import { NotFoundPage } from './NotFoundPage';

// 라우트 표 — ui-design §2. 통계·CSV는 지연 로딩(ADR-0009, NFR-002)
export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  {
    path: '/stats',
    lazy: async () => {
      const { StatsPage } = await import('../features/stats/StatsPage');
      return { Component: StatsPage };
    },
  },
  { path: '*', element: <NotFoundPage /> },
]);
