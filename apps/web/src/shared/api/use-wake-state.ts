import { useEffect, useState, useSyncExternalStore } from 'react';
import { getWakeState, subscribeWake, type WakeState } from './server-wake';

export function useWakeState(): WakeState {
  return useSyncExternalStore(subscribeWake, getWakeState, getWakeState);
}

/** `startedAt`부터 지난 초 — 1초마다 갱신 (깨우기 화면의 경과 시간) */
export function useElapsedSeconds(startedAt: number | null): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (startedAt === null) return;
    const timer = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(timer);
  }, [startedAt]);
  if (startedAt === null) return 0;
  return Math.max(0, Math.floor((now - startedAt) / 1_000));
}

/** 0:34, 2:05 */
export function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
