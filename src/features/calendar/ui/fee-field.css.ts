import { style } from "@vanilla-extract/css";
import { vars } from "@/shared/theme/theme.css";

export const field = style({
  display: "grid",
  gap: vars.space[2],
  marginBottom: vars.space[5],
});

export const label = style({
  fontSize: 13,
  fontWeight: 750,
});
