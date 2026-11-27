import { globalStyle, style } from '@vanilla-extract/css';
import { vars } from '../styles/theme.css';

export const page = style({
  maxWidth: vars.size.contentMax,
  margin: '0 auto',
  padding: `${vars.space.md} ${vars.size.gutter}`,
});

export const title = style({
  fontSize: vars.font.sizeTitle,
  margin: `${vars.space.sm} 0 ${vars.space.md}`,
});

export const muted = style({ color: vars.color.textMuted });

/** 임시 링크 목록 — 링크도 누르는 영역 44px (AC-N001-2) */
export const links = style({
  display: 'flex',
  gap: vars.space.sm,
});

globalStyle(`${links} > a`, {
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: vars.size.touchMin,
  minWidth: vars.size.touchMin,
  padding: `0 ${vars.space.sm}`,
});
