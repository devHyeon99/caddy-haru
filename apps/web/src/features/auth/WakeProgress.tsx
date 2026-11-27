import { WAKE_TIMING } from '../../shared/api/server-wake';
import { formatElapsed } from '../../shared/api/use-wake-state';
import * as s from './auth.css';

/** 경과 시간 + 1분 기준 진행 막대 (1분이 넘으면 막대는 계속 흐름) — ui-design §4.1 */
export function WakeProgress({ seconds }: { seconds: number }) {
  const slow = seconds * 1_000 >= WAKE_TIMING.slowAfterMs;
  const percent = Math.min(100, (seconds * 1_000 * 100) / WAKE_TIMING.slowAfterMs);
  return (
    <div className={s.progressRow}>
      <div className={s.progressTrack} aria-hidden="true">
        {slow ? (
          <div className={s.progressFlowing} />
        ) : (
          <div className={s.progressBar} style={{ width: `${percent}%` }} />
        )}
      </div>
      <span className={s.elapsed} aria-label={`경과 시간 ${formatElapsed(seconds)}`}>
        {formatElapsed(seconds)}
      </span>
    </div>
  );
}
