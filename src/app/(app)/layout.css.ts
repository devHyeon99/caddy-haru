import { style } from "@vanilla-extract/css";
import { vars } from "@/shared/theme/theme.css";

export const app = style({
  minHeight: "100vh",
  background: vars.color.background,
  color: vars.color.textPrimary,
});

export const shell = style({
  width: "100%",
  maxWidth: 760,
  minHeight: "100vh",
  margin: "0 auto",
  paddingBottom: 92,
  background: vars.color.surface,
  borderLeft: `1px solid ${vars.color.border}`,
  borderRight: `1px solid ${vars.color.border}`,
  "@media": {
    "screen and (max-width: 760px)": {
      borderLeft: 0,
      borderRight: 0,
    },
  },
});

export const content = style({
  padding: `${vars.space[5]} ${vars.space[5]} ${vars.space[8]}`,
  "@media": {
    "screen and (max-width: 480px)": {
      paddingLeft: vars.space[4],
      paddingRight: vars.space[4],
    },
  },
});
