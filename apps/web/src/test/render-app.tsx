import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { routes } from '../app/routes';
import { createUnauthorizedHandler } from '../features/auth/session';
import { configureApiClient } from '../shared/api/client';
import { createQueryClient } from '../shared/api/query-client';

/** App.tsx와 같은 연결(라우트·Query·401 처리)을 메모리 라우터로 띄운다 */
export function renderApp(initialEntries: string[], initialIndex = initialEntries.length - 1) {
  const queryClient = createQueryClient();
  const router = createMemoryRouter(routes, { initialEntries, initialIndex });
  configureApiClient({ onUnauthorized: createUnauthorizedHandler(router, queryClient) });
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return { router, queryClient };
}
