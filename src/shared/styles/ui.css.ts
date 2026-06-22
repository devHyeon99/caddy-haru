import { style } from "@vanilla-extract/css";
import { vars } from "@/shared/theme/theme.css";

export const iconButton = style({
  width: 44,
  height: 44,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
  border: 0,
  borderRadius: vars.radius.md,
  color: vars.color.textSecondary,
  background: "transparent",
  cursor: "pointer",
  selectors: {
    "&:hover": { background: vars.color.surfaceSubtle },
    "&:disabled": { cursor: "not-allowed", opacity: 0.45 },
    "&:focus-visible": {
      outline: `3px solid ${vars.color.brandSoft}`,
      outlineOffset: 1,
    },
  },
});

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

export const addButton = style({
  width: "100%",
  minHeight: 52,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: vars.space[2],
  marginTop: vars.space[5],
  border: 0,
  borderRadius: vars.radius.md,
  color: vars.color.textInverse,
  background: vars.color.actionPrimary,
  fontWeight: 800,
  cursor: "pointer",
  selectors: {
    "&:hover": { background: vars.color.actionPrimaryHover },
    "&:disabled": { cursor: "not-allowed", opacity: 0.55 },
    "&:focus-visible": {
      outline: `3px solid ${vars.color.brandSoft}`,
      outlineOffset: 2,
    },
  },
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
