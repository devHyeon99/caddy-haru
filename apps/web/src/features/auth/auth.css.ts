import { keyframes, style } from '@vanilla-extract/css';
import { vars } from '../../shared/styles/theme.css';

// SCR-00·SCR-00o·SCR-06 — ui-design §4.1·§4.2·§4.3 (360px, 좌우 16px)

export const screen = style({
  minHeight: '100dvh',
  maxWidth: vars.size.contentMax,
  margin: '0 auto',
  padding: `${vars.space.xl} ${vars.size.gutter}`,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  gap: vars.space.md,
});

export const appName = style({
  fontSize: '28px',
  fontWeight: 700,
  margin: 0,
});

export const heading = style({
  fontSize: vars.font.sizeTitle,
  fontWeight: 700,
  margin: 0,
});

export const description = style({
  fontSize: '15px',
  color: vars.color.textMuted,
  margin: 0,
  lineHeight: 1.5,
  wordBreak: 'keep-all',
});

export const note = style({
  fontSize: '13px',
  color: vars.color.textMuted,
  margin: 0,
  lineHeight: 1.5,
  wordBreak: 'keep-all',
});

const spin = keyframes({ to: { transform: 'rotate(360deg)' } });

export const spinner = style({
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  border: `4px solid ${vars.color.border}`,
  borderTopColor: vars.color.primary,
  animation: `${spin} 0.9s linear infinite`,
  '@media': { '(prefers-reduced-motion: reduce)': { animation: 'none' } },
});

export const progressRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.sm,
  width: '100%',
});

export const progressTrack = style({
  flex: 1,
  height: '6px',
  borderRadius: '3px',
  background: vars.color.surface,
  overflow: 'hidden',
  position: 'relative',
});

export const progressBar = style({
  height: '100%',
  background: vars.color.primary,
  transition: 'width 1s linear',
});

const flow = keyframes({
  from: { transform: 'translateX(-100%)' },
  to: { transform: 'translateX(250%)' },
});

/** 1분이 넘으면 막대는 계속 흐른다 (ui-design §4.1) */
export const progressFlowing = style({
  width: '40%',
  height: '100%',
  background: vars.color.primary,
  animation: `${flow} 1.4s ease-in-out infinite`,
  '@media': { '(prefers-reduced-motion: reduce)': { animation: 'none', width: '100%' } },
});

export const elapsed = style({
  fontVariantNumeric: 'tabular-nums',
  color: vars.color.textMuted,
  minWidth: '3em',
  textAlign: 'right',
});

export const actions = style({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.sm,
  marginTop: vars.space.md,
});

export const errorBanner = style({
  width: '100%',
  padding: `${vars.space.sm} ${vars.space.md}`,
  borderRadius: vars.radius.md,
  background: '#fdecea',
  color: vars.color.danger,
  textAlign: 'left',
  fontSize: '15px',
  lineHeight: 1.5,
  wordBreak: 'keep-all',
});

export const loginBody = style({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.md,
  marginTop: vars.space.lg,
});

/**
 * 카카오 로그인 버튼 — ui-design §8, 카카오 로그인 디자인 가이드
 * 배경 #FEE500, 심볼 #000000, 레이블 #000000 85%, 모서리 12px, 문구 "카카오 로그인"
 */
export const kakaoButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space.sm,
  width: '100%',
  height: '52px',
  border: 'none',
  borderRadius: '12px',
  background: '#FEE500',
  color: 'rgba(0, 0, 0, 0.85)',
  font: 'inherit',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
  selectors: {
    '&:disabled': { cursor: 'default', opacity: 0.6 },
    '&:focus-visible': { outline: `3px solid ${vars.color.text}`, outlineOffset: '2px' },
  },
});

export const kakaoSymbol = style({ width: '20px', height: '20px', flexShrink: 0 });

// SCR-00o 오버레이
export const overlay = style({
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.45)',
  zIndex: 100,
});

export const overlayCard = style({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: `calc(100% - ${vars.size.gutter} * 2 - 32px)`,
  maxWidth: '360px',
  padding: vars.space.lg,
  borderRadius: vars.radius.md,
  background: vars.color.bg,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: vars.space.sm,
  textAlign: 'center',
  zIndex: 101,
  ':focus': { outline: 'none' },
});
