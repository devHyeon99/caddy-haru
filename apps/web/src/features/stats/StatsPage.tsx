import * as layout from '../../shared/ui/layout.css';

// SCR-04 통계 자리 — FR-011. 지연 로딩 확인용(architecture §9 NFR-002). Must 구현 때 교체한다.
export function StatsPage() {
  return (
    <main className={layout.page}>
      <h1 className={layout.title}>통계</h1>
    </main>
  );
}
