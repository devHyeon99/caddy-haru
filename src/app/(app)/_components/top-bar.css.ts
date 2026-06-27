import { style } from "@vanilla-extract/css";
import { vars } from "@/shared/theme/theme.css";

export const topBar = style({
  minHeight: 68,
  display: "flex",
  alignItems: "center",
  padding: `0 ${vars.space[5]}`,
  borderBottom: `1px solid ${vars.color.border}`,
});

export const brand = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space[3],
});

export const brandMark = style({
  position: "relative",
  width: 38,
  height: 38,
  flex: "0 0 auto",
  overflow: "hidden",
  borderRadius: vars.radius.md,
  background: vars.color.actionPrimary,
});

export const brandHead = style({
  position: "absolute",
  top: 12,
  left: 14,
  width: 10,
  height: 10,
  borderRadius: vars.radius.full,
  background: vars.color.textInverse,
});

export const brandHat = style({
  position: "absolute",
  top: 8,
  left: 9,
  width: 20,
  height: 7,
  borderRadius: "9px 9px 3px 3px",
  background: vars.color.textInverse,
  selectors: {
    "&::after": {
      content: "",
      position: "absolute",
      right: -4,
      bottom: -2,
      width: 13,
      height: 3,
      borderRadius: vars.radius.full,
      background: vars.color.textInverse,
    },
  },
});

export const brandBody = style({
  position: "absolute",
  left: 9,
  bottom: 5,
  width: 20,
  height: 11,
  borderRadius: "11px 11px 4px 4px",
  background: vars.color.textInverse,
});

export const brandName = style({
  fontSize: vars.font.size.xl,
  fontWeight: vars.font.weight.heavy,
  letterSpacing: 0,
});

export const courseName = style({
  marginTop: 2,
  color: vars.color.textSecondary,
  fontSize: vars.font.size.sm,
  letterSpacing: 0,
});
