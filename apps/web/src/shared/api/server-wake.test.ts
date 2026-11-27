import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { gateway, hang, healthOk, installFakeApi } from '../../test/fake-api';
import {
  cancelWake,
  ensureAwake,
  getServerVersion,
  getWakeState,
  isServerProbablyAsleep,
  markServerResponded,
  resetWakeForTest,
  retryWake,
  WakeCancelledError,
} from './server-wake';

// T-W04 깨우기 흐름 (NFR-002, architecture §5.3, ui-design §4.1): 1.5초 뒤 표시, 3초 간격, 8초 제한, 3분 뒤 실패
describe('server-wake (T-W04, NFR-002)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetWakeForTest();
  });
  afterEach(() => {
    resetWakeForTest();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const visible = () => {
    const s = getWakeState();
    return s.status === 'waking' && s.visible;
  };

  it('1.5초 안에 A1이 200이면 화면을 띄우지 않는다', async () => {
    installFakeApi(() => new Promise((resolve) => setTimeout(() => resolve(healthOk()), 1_000)));
    const done = vi.fn();
    void ensureAwake({ mode: 'boot' }).then(done);

    await vi.advanceTimersByTimeAsync(1_000);
    expect(done).toHaveBeenCalled();
    expect(getWakeState()).toEqual({ status: 'idle' });
    await vi.advanceTimersByTimeAsync(1_000);
    expect(getWakeState()).toEqual({ status: 'idle' });
    expect(getServerVersion()).toBe('abc1234');
    expect(isServerProbablyAsleep()).toBe(false);
  });

  it('1.5초 전에는 안 보이고, 이후 보이며, 3초 간격으로 A1을 다시 보낸다', async () => {
    const api = installFakeApi(() => gateway(503));
    void ensureAwake({ mode: 'boot' });

    await vi.advanceTimersByTimeAsync(1_499);
    expect(visible()).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(visible()).toBe(true);

    expect(api.calls).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(1_500); // t = 3s
    expect(api.calls).toHaveLength(2);
    await vi.advanceTimersByTimeAsync(3_000); // t = 6s
    expect(api.calls).toHaveLength(3);
    expect(api.calls.every((c) => c.path === '/api/health')).toBe(true);
  });

  it('A1 하나가 8초 넘게 걸리면 시간 초과로 보고 다시 보낸다', async () => {
    const api = installFakeApi((req) => hang(req.init));
    void ensureAwake({ mode: 'boot' });
    await vi.advanceTimersByTimeAsync(7_999);
    expect(api.calls).toHaveLength(1);
    await vi.advanceTimersByTimeAsync(1 + 3_000); // 8초 시간 초과 + 3초 간격
    expect(api.calls).toHaveLength(2);
  });

  it('3분이 지나면 실패 상태, [다시 시도]는 경과 시간 0부터 다시 시작한다', async () => {
    let up = false;
    installFakeApi(() => (up ? healthOk() : gateway(502)));
    const done = vi.fn();
    void ensureAwake({ mode: 'boot' }).then(done);

    await vi.advanceTimersByTimeAsync(179_000);
    expect(getWakeState().status).toBe('waking');
    await vi.advanceTimersByTimeAsync(1_000);
    expect(getWakeState()).toEqual({ status: 'failed', mode: 'boot', pendingSave: false });

    up = true;
    retryWake();
    const s = getWakeState();
    expect(s.status === 'waking' && s.startedAt).toBe(Date.now());
    await vi.advanceTimersByTimeAsync(0);
    expect(done).toHaveBeenCalled();
    expect(getWakeState().status).toBe('idle');
  });

  it('오프라인이면 A1을 보내지 않고 online 이벤트에 다시 시작한다 (NFR-008)', async () => {
    const onLine = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    const api = installFakeApi(() => healthOk());
    const done = vi.fn();
    void ensureAwake({ mode: 'boot' }).then(done);

    await vi.advanceTimersByTimeAsync(10_000);
    expect(api.calls).toHaveLength(0);
    expect(getWakeState()).toMatchObject({ status: 'waking', offline: true, visible: true });

    onLine.mockReturnValue(true);
    window.dispatchEvent(new Event('online'));
    await vi.advanceTimersByTimeAsync(0);
    expect(api.calls).toHaveLength(1);
    expect(done).toHaveBeenCalled();
  });

  it('동시에 기다려도 A1 반복은 하나, 저장이 끼면 pendingSave가 켜진다', async () => {
    let up = false;
    const api = installFakeApi(() => (up ? healthOk() : gateway()));
    const a = ensureAwake({ mode: 'overlay' });
    const b = ensureAwake({ mode: 'overlay', pendingSave: true });
    expect(a).toBe(b);
    expect(getWakeState()).toMatchObject({ pendingSave: true });
    up = true;
    await vi.advanceTimersByTimeAsync(3_000);
    await expect(a).resolves.toBeUndefined();
    expect(api.calls).toHaveLength(2);
  });

  it('오버레이 [취소]는 기다리던 요청을 WakeCancelledError로 끝낸다', async () => {
    const api = installFakeApi(() => gateway());
    const waiting = ensureAwake({ mode: 'overlay', pendingSave: true });
    cancelWake();
    await expect(waiting).rejects.toBeInstanceOf(WakeCancelledError);
    expect(getWakeState()).toEqual({ status: 'idle' });
    await vi.advanceTimersByTimeAsync(10_000);
    expect(api.calls).toHaveLength(1); // 취소 뒤에는 A1을 더 보내지 않는다
  });

  it('마지막 응답에서 14분이 넘으면 잠들었을 수 있다고 본다 (ui-design §4.2)', () => {
    expect(isServerProbablyAsleep()).toBe(true); // 응답 기록 없음
    markServerResponded(Date.now() - 14 * 60_000);
    expect(isServerProbablyAsleep()).toBe(false);
    markServerResponded(Date.now() - 14 * 60_000 - 1);
    expect(isServerProbablyAsleep()).toBe(true);
  });
});
