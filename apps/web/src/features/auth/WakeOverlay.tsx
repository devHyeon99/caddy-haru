import * as Dialog from '@radix-ui/react-dialog';
import { cancelWake, retryWake } from '../../shared/api/server-wake';
import { useElapsedSeconds, useWakeState } from '../../shared/api/use-wake-state';
import * as button from '../../shared/ui/button.css';
import * as s from './auth.css';
import { WakeProgress } from './WakeProgress';

/**
 * SCR-00o 서버 깨우는 중 (사용 중 오버레이) — NFR-002, ui-design §4.2
 * 뒤 화면과 입력값은 그대로 두고 위에 띄운다. [취소]·Esc = 기다리던 요청을 보내지 않음.
 */
export function WakeOverlay() {
  const state = useWakeState();
  const startedAt = state.status === 'waking' ? state.startedAt : null;
  const seconds = useElapsedSeconds(startedAt);

  const open =
    state.status !== 'idle' &&
    state.mode === 'overlay' &&
    (state.status === 'failed' || state.visible);
  if (!open) return null;

  const failed = state.status === 'failed';
  const offline = state.status === 'waking' && state.offline;

  return (
    <Dialog.Root open onOpenChange={(next) => !next && cancelWake()}>
      <Dialog.Portal>
        <Dialog.Overlay className={s.overlay} />
        <Dialog.Content
          className={s.overlayCard}
          onPointerDownOutside={(event) => event.preventDefault()}
          aria-describedby={undefined}
        >
          {failed ? (
            <>
              <Dialog.Title className={s.heading}>서버가 응답하지 않아요</Dialog.Title>
              <p className={s.description}>잠시 후 다시 시도해 주세요.</p>
              <div className={s.actions}>
                <button type="button" className={button.primary} onClick={retryWake}>
                  다시 시도
                </button>
                <button type="button" className={button.secondary} onClick={cancelWake}>
                  닫기
                </button>
              </div>
            </>
          ) : (
            <>
              <div className={s.spinner} aria-hidden="true" />
              <Dialog.Title className={s.heading}>
                {offline ? '인터넷에 연결돼 있지 않아요' : '서버를 깨우는 중이에요'}
              </Dialog.Title>
              {state.pendingSave && <p className={s.description}>깨어나면 자동으로 저장할게요.</p>}
              {!offline && <WakeProgress seconds={seconds} />}
              <div className={s.actions}>
                <button type="button" className={button.secondary} onClick={cancelWake}>
                  취소
                </button>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
