import { useQuery } from '@tanstack/react-query';
import type { HealthResponse } from '@caddy-haru/shared';
import * as layout from '../../shared/ui/layout.css';

// 뼈대용 임시 화면: 프록시·API 연결 확인. SCR-01 홈(FR-001 등)은 Must 구현 때 교체한다.
export function HomePage() {
  const health = useQuery({
    queryKey: ['health'],
    queryFn: async (): Promise<HealthResponse> => {
      const res = await fetch('/api/health', { cache: 'no-store' });
      if (!res.ok) throw new Error(String(res.status));
      return res.json() as Promise<HealthResponse>;
    },
  });

  return (
    <main className={layout.page}>
      <h1 className={layout.title}>캐디하루</h1>
      <p className={layout.muted}>
        서버 상태:{' '}
        {health.isPending
          ? '확인 중…'
          : health.isError
            ? '연결 안 됨'
            : `정상 (${health.data.version})`}
      </p>
    </main>
  );
}
