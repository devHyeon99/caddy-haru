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

export const errorMessage = style({
  padding: vars.space[3],
  marginBottom: vars.space[4],
  borderLeft: `3px solid ${vars.color.error}`,
  color: vars.color.error,
  background: vars.color.surfaceSubtle,
  fontSize: 13,
  lineHeight: 1.5,
});

export const summary = style({
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: vars.space[4],
  padding: `${vars.space[5]} ${vars.space[5]}`,
  marginBottom: vars.space[5],
  background: vars.color.surfaceSubtle,
  borderLeft: `4px solid ${vars.color.actionPrimary}`,
  borderRadius: vars.radius.md,
});

export const summaryAmount = style({
  fontSize: 28,
  lineHeight: 1.15,
  fontWeight: 800,
  letterSpacing: 0,
  fontVariantNumeric: "tabular-nums",
  "@media": {
    "screen and (max-width: 380px)": {
      fontSize: 24,
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
  fontSize: 12,
  fontWeight: 500,
  fontVariantNumeric: "tabular-nums",
});

export const roundCount = style({
  flex: "0 0 auto",
  display: "flex",
  flexDirection: "row",
  alignItems: "flex-end",
  gap: vars.space[4],
  textAlign: "right",
  color: vars.color.brandStrong,
  fontSize: 20,
  fontWeight: 800,
  letterSpacing: 0,
});

export const roundCountLabel = style({
  margin: 0,
  color: vars.color.textSecondary,
  fontSize: 11,
  fontWeight: 600,
  marginBottom: vars.space[1],
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
  fontSize: 18,
  fontWeight: 800,
  letterSpacing: 0,
});

export const weekdays = style({
  display: "grid",
  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
  borderBottom: `1px solid ${vars.color.border}`,
});

export const weekday = style({
  padding: `${vars.space[2]} 0`,
  color: vars.color.textSecondary,
  textAlign: "center",
  fontSize: 12,
  fontWeight: 700,
});

export const calendarGrid = style({
  display: "grid",
  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
  marginBottom: vars.space[6],
});

export const dayCell = style({
  minWidth: 0,
  minHeight: 66,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 6,
  padding: "8px 2px 5px",
  border: 0,
  borderBottom: `1px solid ${vars.color.border}`,
  color: vars.color.textPrimary,
  background: "transparent",
  cursor: "pointer",
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
  minHeight: 66,
  borderBottom: `1px solid ${vars.color.border}`,
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
  fontSize: 13,
  fontWeight: 700,
  fontVariantNumeric: "tabular-nums",
});

export const dayAmount = style({
  width: "100%",
  overflow: "hidden",
  color: vars.color.brandStrong,
  textAlign: "center",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: 11,
  fontWeight: 800,
  fontVariantNumeric: "tabular-nums",
  selectors: {
    [`${selectedDay} &`]: { color: vars.color.textInverse },
  },
});


