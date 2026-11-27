import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { redirectTo } from '../../shared/lib/browser';
import * as s from './auth.css';
import { loginErrorMessage } from './login-error';
import { fetchMe, KAKAO_LOGIN_URL } from './session';

/**
 * SCR-06 로그인 — FR-040, ui-design §4.3, AC-040-1·5
 * 카카오 버튼은 B1로 페이지 이동한다. B2 실패는 `/login?error=cancelled|state|kakao`로 돌아온다.
 */
export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  // 처음 들어올 때의 error 값으로 배너를 고정한다(주소에서 지운 뒤에도 보이게)
  const [errorMessage] = useState(() => loginErrorMessage(searchParams.get('error')));
  const [redirecting, setRedirecting] = useState(false);

  // 배너를 보여준 뒤 주소에서 error를 지운다 → 새로고침해도 다시 뜨지 않음
  const hasErrorParam = searchParams.has('error');
  useEffect(() => {
    if (!hasErrorParam) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('error');
        return next;
      },
      { replace: true },
    );
  }, [hasErrorParam, setSearchParams]);

  // 이미 로그인한 상태로 /login에 오면 / 로 (ui-design §2)
  useEffect(() => {
    const controller = new AbortController();
    fetchMe(controller.signal).then(
      () => void navigate('/', { replace: true }),
      () => {},
    );
    return () => controller.abort();
  }, [navigate]);

  // 카카오 화면에서 뒤로 가기로 돌아오면(bfcache) 버튼을 다시 살린다
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setRedirecting(false);
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  const startLogin = () => {
    setRedirecting(true); // 두 번 누름 방지
    redirectTo(KAKAO_LOGIN_URL);
  };

  return (
    <main className={s.screen}>
      <h1 className={s.appName}>캐디하루</h1>
      <p className={s.description}>
        라운드마다 캐디피·오버피를 기록하고
        <br />
        월·연 수입을 한눈에 확인하세요.
      </p>

      <div className={s.loginBody}>
        {errorMessage && (
          <p className={s.errorBanner} role="alert">
            <span aria-hidden="true">⚠ </span>
            {errorMessage}
          </p>
        )}
        <button type="button" className={s.kakaoButton} onClick={startLogin} disabled={redirecting}>
          <KakaoSymbol />
          {redirecting ? '카카오로 이동 중…' : '카카오 로그인'}
        </button>
        <p className={s.note}>
          처음이면 자동으로 가입돼요.
          <br />
          이메일 등 개인정보는 받지 않아요.
        </p>
      </div>
    </main>
  );
}

/** 카카오 말풍선 심볼 (#000000) — ui-design §8 */
function KakaoSymbol() {
  return (
    <svg className={s.kakaoSymbol} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="#000000"
        d="M12 3.5C6.75 3.5 2.5 6.86 2.5 11c0 2.68 1.78 5.03 4.46 6.36l-.9 3.3c-.08.3.26.54.52.37l3.94-2.6c.48.05.97.08 1.48.08 5.25 0 9.5-3.36 9.5-7.51S17.25 3.5 12 3.5Z"
      />
    </svg>
  );
}
