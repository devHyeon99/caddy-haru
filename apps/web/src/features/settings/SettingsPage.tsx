import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { getServerVersion } from '../../shared/api/server-wake';
import * as button from '../../shared/ui/button.css';
import * as layout from '../../shared/ui/layout.css';
import { logout } from '../auth/session';
import * as s from './settings.css';

/**
 * SCR-05 설정 — ui-design §4.10. 이번에는 "계정" 묶음(로그아웃, FR-040)만.
 * 골프장 목록(FR-004·006)은 골프장 구현 때 위에 추가한다.
 */
export function SettingsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const version = getServerVersion();

  // 로그아웃은 확인 창 없이 바로 (AC-040-3)
  const onLogout = async () => {
    setPending(true);
    await logout(queryClient, navigate);
  };

  return (
    <main className={layout.page}>
      <h1 className={layout.title}>설정</h1>

      <section aria-labelledby="account-heading">
        <h2 id="account-heading" className={s.sectionTitle}>
          계정
        </h2>
        <div className={s.group}>
          <p className={s.row}>카카오 계정으로 로그인됨</p>
          <button
            type="button"
            className={button.secondary}
            onClick={() => void onLogout()}
            disabled={pending}
          >
            로그아웃
          </button>
        </div>
      </section>

      {version && <p className={s.version}>버전 {version}</p>}
    </main>
  );
}
