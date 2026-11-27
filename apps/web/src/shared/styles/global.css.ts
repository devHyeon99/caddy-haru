import { globalStyle } from '@vanilla-extract/css';
import { vars } from './theme.css';

globalStyle('*, *::before, *::after', { boxSizing: 'border-box' });

globalStyle('html, body', {
  margin: 0,
  background: vars.color.bg,
  color: vars.color.text,
  fontFamily: vars.font.body,
  fontSize: vars.font.sizeBody,
  // 가로 스크롤 금지 — AC-N001-1
  overflowX: 'hidden',
  WebkitTextSizeAdjust: '100%',
});

// 금액 숫자 폭 고정 — ui-design §1.2
globalStyle('[data-money]', { fontVariantNumeric: 'tabular-nums' });
