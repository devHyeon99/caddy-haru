import type { HealthResponse } from '@caddy-haru/shared';

/**
 * "서버 깨우는 중" 흐름 — NFR-002, architecture §5.3, ui-design §4.1(SCR-00)·§4.2(SCR-00o)
 *
 * Render 무료 서버는 15분 동안 요청이 없으면 잠들고, 첫 요청에 약 1분이 걸린다.
 * A1 `GET /api/health`(요청당 8초 제한)를 3초 간격으로 보내 200을 받을 때까지 기다린다.
 * - 1.5초 안에 200이면 화면을 그리지 않는다(`visible: false`, 깜빡임 없음).
 * - 3분이 지나면 실패 상태 → [다시 시도]로 처음부터.
 * - 브라우저가 오프라인이면 재시도를 멈추고 `online` 이벤트에 다시 시작한다(NFR-008).
 *
 * 상태는 이 모듈 하나에만 있고(동시에 여러 요청이 기다려도 A1 반복은 하나), React는
 * `useSyncExternalStore`로 읽는다(`use-wake-state.ts`).
 */

export const WAKE_TIMING = {
  /** 이 시간 안에 깨어나면 화면을 띄우지 않는다 */
  showAfterMs: 1_500,
  /** A1 재시도 간격 */
  retryIntervalMs: 3_000,
  /** A1 요청 하나의 제한 시간 */
  healthTimeoutMs: 8_000,
  /** "조금 더 걸리고 있어요" 문구 */
  slowAfterMs: 60_000,
  /** 이 시간이 지나면 실패 상태 */
  giveUpAfterMs: 180_000,
  /** 마지막 응답 뒤 이 시간이 지났으면 요청 전에 A1부터 (Render는 15분 뒤 잠듦) */
  staleAfterMs: 14 * 60_000,
} as const;

/** boot = SCR-00(앱 시작, 전체 화면), overlay = SCR-00o(사용 중, 현재 화면 위) */
export type WakeMode = 'boot' | 'overlay';

export type WakeState =
  | { status: 'idle' }
  | {
      status: 'waking';
      mode: WakeMode;
      startedAt: number;
      /** 1.5초가 지나 화면에 보여야 하는가 */
      visible: boolean;
      offline: boolean;
      /** 깨어나면 보낼 저장 요청이 기다리는 중("깨어나면 자동으로 저장할게요") */
      pendingSave: boolean;
    }
  | { status: 'failed'; mode: WakeMode; pendingSave: boolean };

/** 사용자가 오버레이에서 취소·닫기를 눌렀다 */
export class WakeCancelledError extends Error {
  constructor() {
    super('서버 깨우기를 취소했습니다');
    this.name = 'WakeCancelledError';
  }
}

interface Deferred {
  promise: Promise<void>;
  resolve: () => void;
  reject: (reason: unknown) => void;
}

let state: WakeState = { status: 'idle' };
const listeners = new Set<() => void>();
let deferred: Deferred | null = null;
let run: AbortController | null = null;
let lastResponseAt: number | null = null;
let serverVersion: string | null = null;

function setState(next: WakeState) {
  state = next;
  for (const listener of listeners) listener();
}

export function subscribeWake(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getWakeState(): WakeState {
  return state;
}

/** 서버(NestJS)가 실제로 응답했음을 기록한다. 게이트웨이 오류(502·503·504)는 응답으로 치지 않는다 */
export function markServerResponded(now: number = Date.now()) {
  lastResponseAt = now;
}

/** 마지막 응답에서 14분 넘게 지났으면 잠들었을 수 있다 — ui-design §4.2 */
export function isServerProbablyAsleep(now: number = Date.now()): boolean {
  return lastResponseAt === null || now - lastResponseAt > WAKE_TIMING.staleAfterMs;
}

/** 마지막 A1의 `version`(설정 화면 "버전", ui-design §4.10) */
export function getServerVersion(): string | null {
  return serverVersion;
}

/**
 * 서버가 깨어날 때까지 기다린다. 이미 깨우는 중이면 같은 Promise를 돌려준다(A1 반복은 하나).
 * overlay 모드에서 사용자가 취소하면 `WakeCancelledError`로 거부된다. boot 모드는 거부되지 않는다.
 */
export function ensureAwake(options: { mode: WakeMode; pendingSave?: boolean }): Promise<void> {
  const pendingSave = options.pendingSave ?? false;
  if (deferred) {
    if (pendingSave && state.status !== 'idle' && !state.pendingSave) {
      setState({ ...state, pendingSave: true });
    }
    return deferred.promise;
  }
  let resolve!: () => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  deferred = { promise, resolve, reject };
  start(options.mode, pendingSave);
  return promise;
}

/** 실패 상태에서 [다시 시도] — 경과 시간 0부터 (ui-design §4.1) */
export function retryWake() {
  if (state.status !== 'failed' || !deferred) return;
  start(state.mode, state.pendingSave);
}

/** 오버레이 [취소]·[닫기] — 기다리던 요청은 보내지 않는다(입력값은 화면에 그대로) */
export function cancelWake() {
  run?.abort();
  run = null;
  const pending = deferred;
  deferred = null;
  setState({ status: 'idle' });
  pending?.reject(new WakeCancelledError());
}

function start(mode: WakeMode, pendingSave: boolean) {
  run?.abort();
  const controller = new AbortController();
  run = controller;
  setState({
    status: 'waking',
    mode,
    startedAt: Date.now(),
    visible: false,
    offline: false,
    pendingSave,
  });
  const showTimer = setTimeout(() => {
    if (!controller.signal.aborted && state.status === 'waking') {
      setState({ ...state, visible: true });
    }
  }, WAKE_TIMING.showAfterMs);
  void loop(controller.signal).finally(() => clearTimeout(showTimer));
}

async function loop(signal: AbortSignal) {
  while (!signal.aborted) {
    if (isOffline()) {
      patch({ offline: true, visible: true });
      await waitForOnline(signal);
      if (signal.aborted) return;
      // 다시 연결되면 경과 시간을 0부터 센다
      patch({ offline: false, startedAt: Date.now() });
    }

    const ok = await pingHealth(signal);
    if (signal.aborted) return;
    if (ok) {
      succeed();
      return;
    }

    const startedAt = state.status === 'waking' ? state.startedAt : Date.now();
    if (Date.now() - startedAt >= WAKE_TIMING.giveUpAfterMs) {
      const current = state;
      setState({
        status: 'failed',
        mode: current.status === 'idle' ? 'boot' : current.mode,
        pendingSave: current.status === 'idle' ? false : current.pendingSave,
      });
      run = null;
      return;
    }
    await sleep(WAKE_TIMING.retryIntervalMs, signal);
  }
}

function patch(partial: Partial<Extract<WakeState, { status: 'waking' }>>) {
  if (state.status === 'waking') setState({ ...state, ...partial });
}

function succeed() {
  run = null;
  const pending = deferred;
  deferred = null;
  setState({ status: 'idle' });
  pending?.resolve();
}

async function pingHealth(signal: AbortSignal): Promise<boolean> {
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  signal.addEventListener('abort', onAbort);
  const timer = setTimeout(() => controller.abort(), WAKE_TIMING.healthTimeoutMs);
  try {
    const res = await fetch('/api/health', {
      cache: 'no-store',
      credentials: 'same-origin',
      signal: controller.signal,
    });
    if (!res.ok) return false;
    const body = (await res.json()) as HealthResponse;
    serverVersion = body.version;
    markServerResponded();
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
    signal.removeEventListener('abort', onAbort);
  }
}

function isOffline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}

function waitForOnline(signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const done = () => {
      window.removeEventListener('online', done);
      signal.removeEventListener('abort', done);
      resolve();
    };
    window.addEventListener('online', done);
    signal.addEventListener('abort', done);
  });
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(done, ms);
    function done() {
      clearTimeout(timer);
      signal.removeEventListener('abort', done);
      resolve();
    }
    signal.addEventListener('abort', done);
  });
}

/** 테스트 전용: 모듈 상태 초기화 */
export function resetWakeForTest() {
  run?.abort();
  run = null;
  deferred = null;
  lastResponseAt = null;
  serverVersion = null;
  state = { status: 'idle' };
}
