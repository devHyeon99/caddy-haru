import { style } from "@vanilla-extract/css";
import { vars } from "@/shared/theme/theme.css";

export const eyebrow = style({
  marginBottom: vars.space[2],
  color: vars.color.textSecondary,
  fontSize: 13,
  fontWeight: 650,
  letterSpacing: 0,
});

export const sectionTitle = style({
  fontSize: 17,
  fontWeight: 800,
  letterSpacing: 0,
});

export const viewHeader = style({
  marginBottom: vars.space[6],
});

export const viewTitle = style({
  marginBottom: vars.space[2],
  fontSize: 24,
  fontWeight: 850,
  letterSpacing: 0,
});

export const viewDescription = style({
  color: vars.color.textSecondary,
  fontSize: 14,
  lineHeight: 1.5,
});

export const segmentButton = style({
  minHeight: 44,
  border: 0,
  borderRadius: vars.radius.sm,
  color: vars.color.textSecondary,
  background: "transparent",
  cursor: "pointer",
  fontWeight: 750,
});

export const selectedSegment = style({
  color: vars.color.textPrimary,
  background: vars.color.surface,
  boxShadow: vars.shadow.raised,
});
