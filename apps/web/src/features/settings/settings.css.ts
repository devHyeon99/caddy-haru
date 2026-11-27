import { style } from '@vanilla-extract/css';
import { vars } from '../../shared/styles/theme.css';

export const sectionTitle = style({
  fontSize: '15px',
  fontWeight: 600,
  color: vars.color.textMuted,
  margin: `${vars.space.lg} 0 ${vars.space.sm}`,
});

export const group = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.sm,
});

export const row = style({
  margin: 0,
  minHeight: vars.size.touchMin,
  display: 'flex',
  alignItems: 'center',
});

export const version = style({
  marginTop: vars.space.xl,
  textAlign: 'right',
  fontSize: '13px',
  color: vars.color.textMuted,
});
