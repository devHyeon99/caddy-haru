import { style } from "@vanilla-extract/css";
import { vars } from "@/shared/theme/theme.css";

export const dataState = style({
  minHeight: 320,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: vars.space[4],
  color: vars.color.textSecondary,
  textAlign: "center",
  fontSize: 14,
});

export const tabList = style({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 4,
  padding: 4,
  marginBottom: vars.space[5],
  background: vars.color.surfaceSubtle,
  borderRadius: vars.radius.md,
});

export const metricGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  marginBottom: vars.space[6],
  borderTop: `1px solid ${vars.color.border}`,
  borderLeft: `1px solid ${vars.color.border}`,
});

export const metric = style({
  minWidth: 0,
  padding: vars.space[4],
  borderRight: `1px solid ${vars.color.border}`,
  borderBottom: `1px solid ${vars.color.border}`,
});

export const metricLabel = style({
  marginBottom: vars.space[2],
  color: vars.color.textSecondary,
  fontSize: 12,
  fontWeight: 700,
});

export const metricValue = style({
  overflowWrap: "anywhere",
  fontSize: 18,
  fontWeight: 820,
  fontVariantNumeric: "tabular-nums",
});

export const chart = style({
  height: 220,
  display: "flex",
  alignItems: "flex-end",
  gap: vars.space[2],
  padding: `${vars.space[4]} 0`,
  borderTop: `1px solid ${vars.color.border}`,
  borderBottom: `1px solid ${vars.color.border}`,
});

export const barGroup = style({
  flex: 1,
  minWidth: 0,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 6,
});

export const barTrack = style({
  width: "min(24px, 74%)",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-end",
  overflow: "hidden",
  borderRadius: "4px 4px 0 0",
  background: vars.color.surfaceSubtle,
});

export const bar = style({
  width: "100%",
  minHeight: 3,
  background: vars.color.actionPrimary,
});

export const barLabel = style({
  color: vars.color.textSecondary,
  fontSize: 10,
  fontVariantNumeric: "tabular-nums",
});
