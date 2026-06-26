import { style, styleVariants } from "@vanilla-extract/css";
import { vars } from "@/shared/theme/theme.css";

export const base = style({
  padding: "3px 5px",
  borderRadius: vars.radius.sm,
  fontSize: 11,
  fontWeight: 700,
});

export const variant = styleVariants({
  default: [
    base,
    {
      color: vars.color.textSecondary,
      background: vars.color.surfaceSubtle,
    },
  ],
  cash: [
    base,
    {
      color: vars.color.cash,
      background: "transparent",
      boxShadow: `inset 0 0 0 1.5px ${vars.color.cash}`,
    },
  ],
  transfer: [
    base,
    {
      color: vars.color.transfer,
      background: "transparent",
      boxShadow: `inset 0 0 0 1.5px ${vars.color.transfer}`,
    },
  ],
  nine: [
    base,
    {
      color: vars.color.nine,
      background: "transparent",
      boxShadow: `inset 0 0 0 1.5px ${vars.color.nine}`,
    },
  ],
});
