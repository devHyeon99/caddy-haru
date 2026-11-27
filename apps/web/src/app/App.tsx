import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';
import { configureApiClient } from '../shared/api/client';
import { createQueryClient } from '../shared/api/query-client';
import { createUnauthorizedHandler } from '../features/auth/session';
import { router } from './router';

const queryClient = createQueryClient();
// 401 → 캐시 비우고 /login replace (AC-040-3·4) — fetch 래퍼 한 곳에서 처리
configureApiClient({ onUnauthorized: createUnauthorizedHandler(router, queryClient) });

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
