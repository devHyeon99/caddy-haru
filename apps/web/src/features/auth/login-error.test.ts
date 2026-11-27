import { describe, expect, it } from 'vitest';
import { loginErrorMessage } from './login-error';

// T-W09 로그인 오류 문구 (AC-040-5, ui-design §4.3)
describe('loginErrorMessage (T-W09, AC-040-5)', () => {
  it.each([
    ['cancelled', '카카오 로그인을 취소했어요. 다시 시도해 주세요.'],
    ['state', '로그인 확인 시간이 지났어요. 다시 시도해 주세요.'],
    ['kakao', '카카오 연결에 문제가 있어요. 잠시 후 다시 시도해 주세요.'],
    ['xyz', '카카오 연결에 문제가 있어요. 잠시 후 다시 시도해 주세요.'],
    ['toString', '카카오 연결에 문제가 있어요. 잠시 후 다시 시도해 주세요.'],
  ])('%s → %s', (value, message) => {
    expect(loginErrorMessage(value)).toBe(message);
  });

  it('error가 없으면 배너 없음', () => {
    expect(loginErrorMessage(null)).toBeNull();
  });
});
