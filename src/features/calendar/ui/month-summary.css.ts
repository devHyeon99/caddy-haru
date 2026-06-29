import { style } from "@vanilla-extract/css";
import { vars } from "@/shared/theme/theme.css";

export const summary = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[4],
  padding: `${vars.space[5]} ${vars.space[5]}`,
  marginBottom: vars.space[5],
  background: vars.color.surfaceSubtle,
  borderLeft: `4px solid ${vars.color.actionPrimary}`,
  borderRadius: vars.radius.md,
  "@media": {
    "screen and (min-width: 580px)": {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
    },
  },
});

export const summaryAmountRow = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: vars.space[1],
});

export const summaryAmount = style({
  fontSize: vars.font.size["4xl"],
  lineHeight: 1.15,
  fontWeight: vars.font.weight.heavy,
  letterSpacing: 0,
  fontVariantNumeric: "tabular-nums",
  "@media": {
    "screen and (max-width: 380px)": {
      fontSize: vars.font.size["3xl"],
    },
  },
});

export const incomeBreakdown = style({
  display: "flex",
  flexDirection: "row",
  gap: vars.space[2],
  margin: 0,
  marginTop: vars.space[2],
  padding: 0,
  listStyle: "none",
  color: vars.color.textSecondary,
  fontSize: vars.font.size.sm,
  fontWeight: vars.font.weight.medium,
  fontVariantNumeric: "tabular-nums",
});

export const roundCount = style({
  display: "flex",
  flexDirection: "row",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: vars.space[2],
  backgroundColor: vars.color.cardBg,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.md,
  color: vars.color.brandText,
  fontSize: vars.font.size["2xl"],
  fontWeight: vars.font.weight.heavy,
  letterSpacing: 0,
});

export const roundStat = style({
  margin: 0,
  padding: `${vars.space[3]} ${vars.space[3]}`,
});

export const roundCountLabel = style({
  margin: 0,
  marginBottom: vars.space[1],
  color: vars.color.textSecondary,
  fontSize: vars.font.size.xs,
  fontWeight: vars.font.weight.semibold,
  textAlign: "left",
});
