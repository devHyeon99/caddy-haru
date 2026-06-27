import { style } from "@vanilla-extract/css";
import { vars } from "@/shared/theme/theme.css";

export const sectionHeader = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.space[4],
  marginBottom: vars.space[3],
});

export const sectionTotal = style({
  color: vars.color.brandStrong,
  fontSize: 16,
  fontWeight: 800,
  fontVariantNumeric: "tabular-nums",
});

export const roundList = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[3],
});

export const roundCard = style({
  display: "flex",
  flexDirection: "column",
  gap: vars.space[2],
  padding: `${vars.space[2]} ${vars.space[4]} ${vars.space[4]}`,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.md,
  background: vars.color.surfaceSubtle,
});

export const cardHeader = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space[2],
});

export const cardHeaderLeft = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space[2],
  marginRight: "auto",
});

export const roundLabel = style({
  fontSize: 14,
  fontWeight: 750,
});

export const feeBreakdown = style({
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  gap: "0 6px",
  color: vars.color.textSecondary,
  fontSize: 12,
  lineHeight: 1.45,
  fontVariantNumeric: "tabular-nums",
});

export const roundMemo = style({
  backgroundColor: vars.color.surfaceRaised,
  padding: `${vars.space[2]} ${vars.space[3]}`,
  borderLeft: `3px solid ${vars.color.actionPrimary}`,
  color: vars.color.textSecondary,
  fontSize: 12,
  lineHeight: 1.6,
  whiteSpace: "pre-wrap",
  wordBreak: "break-all",
});

export const cardFooter = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  paddingTop: vars.space[2],
  borderTop: `1px solid ${vars.color.border}`,
});

export const incomeLabel = style({
  color: vars.color.textSecondary,
  fontSize: 13,
  fontWeight: 600,
});

export const roundIncome = style({
  fontSize: 15,
  fontWeight: 800,
  fontVariantNumeric: "tabular-nums",
});

export const emptyState = style({
  padding: `${vars.space[8]} 0`,
  color: vars.color.textSecondary,
  textAlign: "center",
  fontSize: 14,
});
