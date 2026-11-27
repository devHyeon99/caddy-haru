import { style } from '@vanilla-extract/css';
import { vars } from '../styles/theme.css';

// 버튼 — ui-design §1.1: 주요 버튼 높이 52px·폭 100%, 누르는 요소 최소 44px (AC-N001-2)
const base = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: vars.space.sm,
  width: '100%',
  minHeight: vars.size.touchMin,
  padding: `0 ${vars.space.md}`,
  border: 'none',
  borderRadius: vars.radius.md,
  font: 'inherit',
  fontWeight: 600,
  cursor: 'pointer',
  selectors: {
    '&:disabled': { cursor: 'default', opacity: 0.6 },
    '&:focus-visible': { outline: `3px solid ${vars.color.primary}`, outlineOffset: '2px' },
  },
});

export const primary = style([
  base,
  { height: '52px', background: vars.color.primary, color: vars.color.onPrimary },
]);

export const secondary = style([
  base,
  {
    height: '52px',
    background: vars.color.surface,
    color: vars.color.text,
    border: `1px solid ${vars.color.border}`,
  },
]);
