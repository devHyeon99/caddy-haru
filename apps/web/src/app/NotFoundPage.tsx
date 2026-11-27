import { Link } from 'react-router';
import * as layout from '../shared/ui/layout.css';

export function NotFoundPage() {
  return (
    <main className={layout.page}>
      <h1 className={layout.title}>페이지를 찾을 수 없어요</h1>
      <Link to="/" replace>
        홈으로
      </Link>
    </main>
  );
}
