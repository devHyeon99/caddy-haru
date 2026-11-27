import { createGlobalTheme } from '@vanilla-extract/css';

// 디자인 토큰 — ui-design §1.1 (360px 기준, 터치 44px 이상), ADR-0009
// 색은 구현하면서 다듬는다(ui-design 범위). 크기 규칙은 여기서만 정의한다.
export const vars = createGlobalTheme(':root', {
  color: {
    bg: '#ffffff',
    surface: '#f5f6f7',
    text: '#1a1c1e',
    textMuted: '#5f656b',
    primary: '#1f7a4d',
    onPrimary: '#ffffff',
    danger: '#c62828',
    border: '#d9dde1',
  },
  space: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  size: {
    /** 누르는 요소 최소 크기 — AC-N001-2 */
    touchMin: '44px',
    /** 화면 좌우 여백 */
    gutter: '16px',
    contentMax: '480px',
  },
  font: {
    body: '-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Pretendard", "Noto Sans KR", sans-serif',
    sizeBody: '16px',
    sizeTitle: '20px',
  },
  radius: {
    md: '12px',
  },
});
