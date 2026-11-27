import { useEffect, useState } from 'react';
import { Outlet } from 'react-router';
import { ensureAwake } from '../../shared/api/server-wake';
import { WakeOverlay } from './WakeOverlay';
import { WakeScreen } from './WakeScreen';

/**
 * 모든 라우트의 바깥 — ui-design §3.1 "앱 열기 → A1 → B4"
 * 앱 시작 시 A1이 200을 받기 전에는 SCR-00만 그린다. 그 뒤로는 SCR-00o 오버레이가 필요할 때만 뜬다.
 */
export function RootLayout() {
  const [awake, setAwake] = useState(false);

  useEffect(() => {
    let active = true;
    // boot 모드는 취소되지 않는다(실패 상태에서 [다시 시도]로만 이어짐). 같은 Promise라 StrictMode에서 A1이 두 번 시작되지 않는다
    ensureAwake({ mode: 'boot' }).then(
      () => active && setAwake(true),
      () => {},
    );
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      {awake ? <Outlet /> : <WakeScreen />}
      <WakeOverlay />
    </>
  );
}
