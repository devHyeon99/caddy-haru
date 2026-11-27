import { ApiRequestError, readApiErrorBody } from './errors';
import {
  ensureAwake,
  isServerProbablyAsleep,
  markServerResponded,
  WakeCancelledError,
} from './server-wake';

/**
 * fetch 래퍼 — architecture §5.3·§7 `shared/api/`, ui-design §1.3, ADR-0008, ADR-0009 "Query 기본값"
 *
 * - 같은 도메인(Worker 프록시)이므로 `credentials: 'same-origin'`으로 `__Host-sid` 쿠키를 보낸다(ADR-0004).
 * - 에러는 ADR-0008 본문을 읽어 `ApiRequestError`로 던진다. 화면은 `error.code`로만 분기한다.
 * - 401 → `onUnauthorized`(캐시 비우고 `/login` replace, AC-040-3·4). 이 처리는 여기 한 곳에서만 한다.
 * - 502·503·504·시간 초과·네트워크 오류:
 *   - 조회(GET): 깨우기 흐름(SCR-00o) 뒤 **1회** 다시 보낸다.
 *   - 저장(POST·PATCH·DELETE): 이미 보낸 요청은 다시 보내지 않는다 → `unavailable`("다시 저장" 배너).
 * - 마지막 응답에서 14분 넘게 지났으면 요청을 보내기 **전에** 깨우기 흐름을 거친다.
 *   저장 요청은 깨어난 뒤 한 번만 보낸다(아직 보내지 않은 요청이라 자동 재시도가 아님, ui-design §4.2).
 */

export type ApiMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export interface ApiRequestOptions {
  method?: ApiMethod;
  /** JSON으로 보낸다 */
  body?: unknown;
  /** TanStack Query의 취소 신호 */
  signal?: AbortSignal;
  /**
   * 깨우는 중 오버레이에 "깨어나면 자동으로 저장할게요"를 보일지. 기본값은 GET이 아니면 true.
   * 로그아웃처럼 저장이 아닌 POST는 false.
   */
  pendingSave?: boolean;
}

export interface ApiClientConfig {
  /** 401을 받았을 때 — 캐시 비우기 + `/login` replace (features/auth/session.ts) */
  onUnauthorized: () => void;
}

/** 일반 API 요청 하나의 제한 시간. 넘으면 깨우기 흐름으로 본다 */
export const REQUEST_TIMEOUT_MS = 10_000;

const GATEWAY_STATUSES = new Set([502, 503, 504]);

let config: ApiClientConfig = { onUnauthorized: () => {} };

export function configureApiClient(next: ApiClientConfig) {
  config = next;
}

export async function apiFetch<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const method = options.method ?? 'GET';
  const isRead = method === 'GET';
  const pendingSave = options.pendingSave ?? !isRead;

  if (isServerProbablyAsleep()) {
    await wakeOrThrow(pendingSave);
  }

  let outcome = await send(path, method, options);
  if (outcome.type === 'unreachable') {
    if (!isRead) throw new ApiRequestError('unavailable', outcome.status);
    await wakeOrThrow(false);
    outcome = await send(path, method, options);
    if (outcome.type === 'unreachable') throw new ApiRequestError('unavailable', outcome.status);
  }

  const res = outcome.response;
  markServerResponded();

  if (res.status === 401) {
    const detail = await readApiErrorBody(res);
    config.onUnauthorized();
    throw new ApiRequestError('http', 401, detail);
  }
  if (!res.ok) {
    throw new ApiRequestError('http', res.status, await readApiErrorBody(res));
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

async function wakeOrThrow(pendingSave: boolean) {
  try {
    await ensureAwake({ mode: 'overlay', pendingSave });
  } catch (error) {
    if (error instanceof WakeCancelledError) throw new ApiRequestError('cancelled', null);
    throw error;
  }
}

type SendOutcome =
  { type: 'response'; response: Response } | { type: 'unreachable'; status: number | null };

async function send(
  path: string,
  method: ApiMethod,
  options: ApiRequestOptions,
): Promise<SendOutcome> {
  const controller = new AbortController();
  const onAbort = () => controller.abort(options.signal?.reason);
  options.signal?.addEventListener('abort', onAbort);
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const headers: Record<string, string> = { accept: 'application/json' };
  if (options.body !== undefined) headers['content-type'] = 'application/json';

  try {
    const response = await fetch(path, {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      credentials: 'same-origin',
      cache: 'no-store',
      signal: controller.signal,
    });
    if (GATEWAY_STATUSES.has(response.status))
      return { type: 'unreachable', status: response.status };
    return { type: 'response', response };
  } catch (error) {
    // 호출한 쪽(Query)이 취소한 것은 그대로 전달한다
    if (options.signal?.aborted) throw error;
    return { type: 'unreachable', status: null };
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener('abort', onAbort);
  }
}
