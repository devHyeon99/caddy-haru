import { style } from "@vanilla-extract/css";
import { vars } from "@/shared/theme/theme.css";

export const eyebrow = style({
  marginBottom: vars.space[2],
  color: vars.color.textSecondary,
  fontSize: vars.font.size.base,
  fontWeight: vars.font.weight.semibold,
  letterSpacing: 0,
});

export const sectionTitle = style({
  fontSize: vars.font.size.lg,
  fontWeight: vars.font.weight.heavy,
  letterSpacing: 0,
});

export const viewHeader = style({
  marginBottom: vars.space[6],
});

export const viewTitle = style({
  marginBottom: vars.space[2],
  fontSize: vars.font.size["3xl"],
  fontWeight: vars.font.weight.black,
  letterSpacing: 0,
});

export const viewDescription = style({
  color: vars.color.textSecondary,
  fontSize: vars.font.size.md,
  lineHeight: vars.font.lineHeight.relaxed,
});

export const segmentButton = style({
  minHeight: 44,
  border: 0,
  borderRadius: vars.radius.sm,
  color: vars.color.textSecondary,
  background: "transparent",
  cursor: "pointer",
  fontWeight: vars.font.weight.extrabold,
});

export const selectedSegment = style({
  color: vars.color.textPrimary,
  background: vars.color.surface,
  boxShadow: vars.shadow.raised,
});
