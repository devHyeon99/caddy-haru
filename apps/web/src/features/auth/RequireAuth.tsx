import { useQuery } from '@tanstack/react-query';
import { Outlet } from 'react-router';
import { isUnauthenticated } from '../../shared/api/errors';
import { queryKeys } from '../../shared/api/query-keys';
import * as button from '../../shared/ui/button.css';
import * as s from './auth.css';
import { fetchMe } from './session';

/**
 * 인증 가드 — B4로 로그인 여부를 확인한다 (AC-040-4, ui-design §2)
 * 401이면 fetch 래퍼가 캐시를 비우고 `/login`으로 보낸다. 확인 전에는 아무 데이터 화면도 그리지 않는다(AC-040-3).
 */
export function RequireAuth() {
  const me = useQuery({
    queryKey: queryKeys.me(),
    queryFn: ({ signal }) => fetchMe(signal),
    staleTime: Infinity,
  });

  if (me.isSuccess) return <Outlet />;
  if (me.isError && !isUnauthenticated(me.error)) {
    return (
      <main className={s.screen}>
        <h1 className={s.heading} role="alert">
          서버에 연결하지 못했어요
        </h1>
        <p className={s.description}>인터넷 연결을 확인하고 다시 시도해 주세요.</p>
        <div className={s.actions}>
          <button type="button" className={button.primary} onClick={() => void me.refetch()}>
            다시 시도
          </button>
        </div>
      </main>
    );
  }
  return null;
}
