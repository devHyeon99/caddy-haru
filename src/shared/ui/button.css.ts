import { style } from "@vanilla-extract/css";
import { vars } from "@/shared/theme/theme.css";

export const icon = style({
  width: 36,
  height: 36,
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
    "&:hover": { background: vars.color.surface },
    "&:disabled": { cursor: "not-allowed", opacity: 0.45 },
    "&:focus-visible": {
      outline: `3px solid ${vars.color.border}`,
      outlineOffset: 1,
    },
  },
});

export const outline = style({
  minHeight: 44,
  padding: `0 ${vars.space[4]}`,
  border: `1px solid ${vars.color.borderStrong}`,
  borderRadius: vars.radius.md,
  color: vars.color.textPrimary,
  background: vars.color.surface,
  cursor: "pointer",
  fontWeight: 750,
  selectors: {
    "&:hover": { background: vars.color.surfaceSubtle },
    "&:disabled": { cursor: "not-allowed", opacity: 0.45 },
    "&:focus-visible": {
      outline: `3px solid ${vars.color.brandSoft}`,
      outlineOffset: 2,
    },
  },
});

export const primary = style({
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
