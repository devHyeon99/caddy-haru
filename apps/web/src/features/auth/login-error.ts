import type { LoginErrorCode } from '@caddy-haru/shared';

/** `/login?error=` 값별 배너 문구 — ui-design §4.3, api-spec B2 (AC-040-5) */
export const LOGIN_ERROR_MESSAGES: Record<LoginErrorCode, string> = {
  cancelled: '카카오 로그인을 취소했어요. 다시 시도해 주세요.',
  state: '로그인 확인 시간이 지났어요. 다시 시도해 주세요.',
  kakao: '카카오 연결에 문제가 있어요. 잠시 후 다시 시도해 주세요.',
};

/** 그 밖의 값은 `kakao`와 같은 문구, 값이 없으면 null */
export function loginErrorMessage(value: string | null): string | null {
  if (value === null) return null;
  return isLoginErrorCode(value) ? LOGIN_ERROR_MESSAGES[value] : LOGIN_ERROR_MESSAGES.kakao;
}

function isLoginErrorCode(value: string): value is LoginErrorCode {
  return Object.hasOwn(LOGIN_ERROR_MESSAGES, value);
}
