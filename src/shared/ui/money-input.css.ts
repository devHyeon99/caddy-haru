import { style } from "@vanilla-extract/css";
import { vars } from "@/shared/theme/theme.css";
import { inputShell } from "./input.css";

export const wrapper = style({
  position: "relative",
  display: "flex",
  alignItems: "center",
});

export const input = style([
  inputShell,
  {
    minHeight: 50,
    padding: `0 ${vars.space[4]}`,
    paddingRight: "4rem",
    fontSize: vars.font.size.xl,
    fontWeight: vars.font.weight.extrabold,
    fontVariantNumeric: "tabular-nums",
  },
]);

export const suffix = style({
  position: "absolute",
  right: vars.space[4],
  fontSize: vars.font.size.md,
  fontWeight: vars.font.weight.extrabold,
  color: vars.color.textSecondary,
  pointerEvents: "none",
  userSelect: "none",
});
