import { style } from "@vanilla-extract/css";
import { vars } from "@/shared/theme/theme.css";

export const wrapper = style({
  position: "relative",
  display: "flex",
  alignItems: "center",
});

export const input = style({
  width: "100%",
  minHeight: 50,
  padding: `0 ${vars.space[4]}`,
  paddingRight: "4rem",
  border: `1px solid ${vars.color.borderStrong}`,
  borderRadius: vars.radius.md,
  color: vars.color.textPrimary,
  background: vars.color.surface,
  fontSize: vars.font.size.xl,
  fontWeight: vars.font.weight.extrabold,
  fontVariantNumeric: "tabular-nums",
  outline: 0,
  selectors: {
    "&:focus": {
      borderColor: vars.color.actionPrimary,
      boxShadow: `0 0 0 3px ${vars.color.brandSoft}`,
    },
  },
});

export const suffix = style({
  position: "absolute",
  right: vars.space[4],
  fontSize: vars.font.size.md,
  fontWeight: vars.font.weight.extrabold,
  color: vars.color.textSecondary,
  pointerEvents: "none",
  userSelect: "none",
});
