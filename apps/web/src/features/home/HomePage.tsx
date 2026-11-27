import { Link } from 'react-router';
import * as layout from '../../shared/ui/layout.css';

// 임시 홈: 인증 가드(AC-040-4) 뒤에 보이는 자리. SCR-01 홈(FR-001·011)은 라운드 구현 때 교체한다.
export function HomePage() {
  return (
    <main className={layout.page}>
      <h1 className={layout.title}>캐디하루</h1>
      <p className={layout.muted}>로그인됨. 라운드 기록 화면은 준비 중이에요.</p>
      <nav className={layout.links}>
        <Link to="/stats">통계</Link>
        <Link to="/settings">설정</Link>
      </nav>
    </main>
  );
}
