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
  fontSize: vars.font.size.md,
});

export const errorMessage = style({
  padding: vars.space[3],
  marginBottom: vars.space[4],
  borderLeft: `3px solid ${vars.color.error}`,
  color: vars.color.error,
  background: vars.color.surfaceSubtle,
  fontSize: vars.font.size.base,
  lineHeight: vars.font.lineHeight.relaxed,
});

export const calendarCard = style({
  marginBottom: vars.space[6],
  padding: vars.space[4],
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius["2xl"],
  background: vars.color.surface,
  boxShadow: vars.shadow.card,
  touchAction: "pan-y",
});

export const monthHeader = style({
  height: 48,
  display: "grid",
  gridTemplateColumns: "44px 1fr 44px",
  alignItems: "center",
  marginBottom: vars.space[2],
});

export const monthTitle = style({
  textAlign: "center",
  fontSize: vars.font.size.xl,
  fontWeight: vars.font.weight.heavy,
  letterSpacing: 0,
});

export const weekdays = style({
  display: "grid",
  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
  marginBottom: vars.space[1],
});

export const weekday = style({
  padding: `${vars.space[2]} 0`,
  color: vars.color.textSecondary,
  textAlign: "center",
  fontSize: vars.font.size.sm,
  fontWeight: vars.font.weight.bold,
});

export const calendarGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
  gap: vars.space[1],
});

export const dayCell = style({
  minWidth: 0,
  minHeight: 64,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 4,
  padding: "8px 2px",
  border: 0,
  borderRadius: vars.radius.sm,
  color: vars.color.textPrimary,
  background: "transparent",
  cursor: "pointer",
  transition: "background 120ms ease",
  selectors: {
    "&:hover": { background: vars.color.surfaceSubtle },
    "&:focus-visible": {
      position: "relative",
      zIndex: 1,
      outline: `3px solid ${vars.color.brandSoft}`,
      outlineOffset: -3,
    },
  },
});

export const emptyDayCell = style({
  minHeight: 64,
});

export const incomeDay = style({
  background: vars.color.actionPrimarySubtle,
  selectors: {
    "&:hover": { background: vars.color.brandSoft },
  },
});

export const selectedDay = style({
  color: vars.color.textInverse,
  background: vars.color.actionPrimary,
  selectors: {
    "&:hover": { background: vars.color.actionPrimaryHover },
  },
});

export const dayNumber = style({
  width: 26,
  height: 24,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: vars.font.size.base,
  fontWeight: vars.font.weight.bold,
  fontVariantNumeric: "tabular-nums",
  selectors: {
    [`${selectedDay} &`]: { color: vars.color.textInverse },
  },
});

export const sundayNumber = style({
  color: vars.color.error,
});

export const saturdayNumber = style({
  color: vars.color.payment.transfer,
});

export const dayAmount = style({
  width: "100%",
  overflow: "hidden",
  color: vars.color.brandText,
  textAlign: "center",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: vars.font.size.xs,
  fontWeight: vars.font.weight.heavy,
  fontVariantNumeric: "tabular-nums",
  selectors: {
    [`${selectedDay} &`]: { color: vars.color.textInverse },
  },
});
