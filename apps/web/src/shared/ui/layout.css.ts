import { style } from '@vanilla-extract/css';
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
