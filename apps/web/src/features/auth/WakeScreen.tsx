import { retryWake, WAKE_TIMING, type WakeState } from '../../shared/api/server-wake';
import { useElapsedSeconds, useWakeState } from '../../shared/api/use-wake-state';
import * as button from '../../shared/ui/button.css';
import * as s from './auth.css';
import { WakeProgress } from './WakeProgress';

/**
 * SCR-00 서버 깨우는 중 (앱 시작) — NFR-002, ui-design §4.1, architecture §5.3
 * 1.5초 전에는 앱 이름만(깜빡임 없음). 깨어나기 전에는 로그인 등 서버가 필요한 버튼을 보여주지 않는다.
 */
export function WakeScreen() {
  const state = useWakeState();
  const startedAt = state.status === 'waking' ? state.startedAt : null;
  const seconds = useElapsedSeconds(startedAt);

  return (
    <main className={s.screen}>
      <p className={s.appName}>캐디하루</p>
      <WakeBody state={state} seconds={seconds} />
    </main>
  );
}

function WakeBody({ state, seconds }: { state: WakeState; seconds: number }) {
  if (state.status === 'failed') {
    return (
      <>
        <span aria-hidden="true">⚠</span>
        <h1 className={s.heading} role="alert">
          서버가 응답하지 않아요
        </h1>
        <p className={s.description}>
          잠시 후 다시 시도해 주세요.
          <br />
          계속 안 되면 인터넷 연결을 확인해 주세요.
        </p>
        <div className={s.actions}>
          <button type="button" className={button.primary} onClick={retryWake}>
            다시 시도
          </button>
        </div>
      </>
    );
  }

  if (state.status !== 'waking' || !state.visible) return null;

  if (state.offline) {
    return (
      <>
        <h1 className={s.heading} aria-live="polite">
          인터넷에 연결돼 있지 않아요
        </h1>
        <p className={s.description}>연결되면 자동으로 다시 시도할게요.</p>
      </>
    );
  }

  return (
    <>
      <div className={s.spinner} aria-hidden="true" />
      <h1 className={s.heading} aria-live="polite">
        서버를 깨우는 중이에요
      </h1>
      <p className={s.description}>
        무료 서버라 한동안 안 쓰면 잠들어요.
        <br />
        보통 1분 안에 깨어나요.
      </p>
      <WakeProgress seconds={seconds} />
      {seconds * 1_000 >= WAKE_TIMING.slowAfterMs && (
        <p className={s.description}>
          조금 더 걸리고 있어요.
          <br />
          창을 닫지 말고 기다려 주세요.
        </p>
      )}
    </>
  );
}
