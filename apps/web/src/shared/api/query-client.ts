import { QueryClient } from '@tanstack/react-query';

/**
 * 서버 상태 캐시 기본값 — ADR-0009 "Query 기본값", ui-design §1.3·§1.4
 * - 메모리 캐시만 쓴다. persister를 붙이지 않는다(AC-040-3: 로그아웃 시 데이터가 남지 않게).
 * - 저장·수정·삭제는 자동 재시도하지 않는다.
 * - 서버 깨우기(502·503·504)는 Query 재시도가 아니라 fetch 래퍼가 맡는다(architecture §5.3).
 * - 앱으로 돌아올 때 다시 불러오지 않는다(잠든 서버를 괜히 깨우지 않게).
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 60_000,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
