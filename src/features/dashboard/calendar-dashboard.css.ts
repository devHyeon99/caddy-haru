import { style } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";

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

export const topBar = style({
  minHeight: 68,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
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
  fontSize: 19,
  fontWeight: 800,
  letterSpacing: 0,
});

export const courseName = style({
  marginTop: 2,
  color: vars.color.textSecondary,
  fontSize: 12,
  letterSpacing: 0,
});

export const prototypeBadge = style({
  padding: "5px 8px",
  color: vars.color.brandStrong,
  background: vars.color.brandSoft,
  borderRadius: vars.radius.sm,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 0,
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

export const eyebrow = style({
  marginBottom: vars.space[2],
  color: vars.color.textSecondary,
  fontSize: 13,
  fontWeight: 650,
  letterSpacing: 0,
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

export const roundCount = style({
  flex: "0 0 auto",
  color: vars.color.brandStrong,
  fontSize: 14,
  fontWeight: 750,
  letterSpacing: 0,
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

export const iconButton = style({
  width: 44,
  height: 44,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
  border: 0,
  borderRadius: vars.radius.md,
  color: vars.color.textSecondary,
  background: "transparent",
  cursor: "pointer",
  selectors: {
    "&:hover": { background: vars.color.surfaceSubtle },
    "&:focus-visible": {
      outline: `3px solid ${vars.color.brandSoft}`,
      outlineOffset: 1,
    },
  },
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

export const sectionHeader = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.space[4],
  marginBottom: vars.space[3],
});

export const sectionTitle = style({
  fontSize: 17,
  fontWeight: 800,
  letterSpacing: 0,
});

export const sectionTotal = style({
  color: vars.color.brandStrong,
  fontSize: 16,
  fontWeight: 800,
  fontVariantNumeric: "tabular-nums",
});

export const roundList = style({
  borderTop: `1px solid ${vars.color.border}`,
});

export const roundRow = style({
  minHeight: 74,
  display: "grid",
  gridTemplateColumns: "1fr auto auto",
  alignItems: "center",
  gap: vars.space[3],
  borderBottom: `1px solid ${vars.color.border}`,
});

export const roundMeta = style({
  minWidth: 0,
});

export const roundLabel = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space[2],
  marginBottom: 4,
  fontSize: 14,
  fontWeight: 750,
});

export const payment = style({
  padding: "3px 5px",
  borderRadius: vars.radius.sm,
  color: vars.color.textSecondary,
  background: vars.color.surfaceSubtle,
  fontSize: 10,
  fontWeight: 700,
});

export const feeBreakdown = style({
  color: vars.color.textSecondary,
  fontSize: 12,
  lineHeight: 1.45,
  fontVariantNumeric: "tabular-nums",
});

export const roundIncome = style({
  fontSize: 15,
  fontWeight: 800,
  fontVariantNumeric: "tabular-nums",
});

export const rowActions = style({
  display: "flex",
});

export const emptyState = style({
  padding: `${vars.space[8]} 0`,
  borderTop: `1px solid ${vars.color.border}`,
  borderBottom: `1px solid ${vars.color.border}`,
  color: vars.color.textSecondary,
  textAlign: "center",
  fontSize: 14,
});

export const addButton = style({
  width: "100%",
  minHeight: 52,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: vars.space[2],
  marginTop: vars.space[5],
  border: 0,
  borderRadius: vars.radius.md,
  color: vars.color.textInverse,
  background: vars.color.actionPrimary,
  fontWeight: 800,
  cursor: "pointer",
  selectors: {
    "&:hover": { background: vars.color.actionPrimaryHover },
    "&:focus-visible": {
      outline: `3px solid ${vars.color.brandSoft}`,
      outlineOffset: 2,
    },
  },
});

export const bottomNav = style({
  position: "fixed",
  zIndex: 20,
  right: 0,
  bottom: 0,
  left: 0,
  height: 72,
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  width: "min(100%, 760px)",
  margin: "0 auto",
  padding: "6px 12px max(6px, env(safe-area-inset-bottom))",
  borderTop: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
});

export const navButton = style({
  minWidth: 0,
  minHeight: 56,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 3,
  padding: 0,
  border: 0,
  borderRadius: vars.radius.md,
  color: vars.color.textSecondary,
  background: "transparent",
  cursor: "pointer",
  fontSize: 11,
  fontWeight: 700,
  selectors: {
    "&:hover": { background: vars.color.surfaceSubtle },
    "&:focus-visible": {
      outline: `3px solid ${vars.color.brandSoft}`,
      outlineOffset: -2,
    },
  },
});

export const activeNavButton = style({
  color: vars.color.brandStrong,
});

export const overlay = style({
  position: "fixed",
  zIndex: 50,
  inset: 0,
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
  padding: 0,
  border: 0,
  background: vars.color.overlay,
});

export const sheet = style({
  width: "min(100%, 760px)",
  maxHeight: "92vh",
  overflowY: "auto",
  padding: `${vars.space[5]} ${vars.space[5]} calc(${vars.space[6]} + env(safe-area-inset-bottom))`,
  borderRadius: "8px 8px 0 0",
  background: vars.color.surfaceRaised,
  boxShadow: vars.shadow.sheet,
});

export const sheetHandle = style({
  width: 42,
  height: 4,
  margin: `0 auto ${vars.space[4]}`,
  borderRadius: vars.radius.full,
  background: vars.color.borderStrong,
});

export const sheetHeader = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: vars.space[5],
});

export const field = style({
  display: "grid",
  gap: vars.space[2],
  marginBottom: vars.space[5],
});

export const fieldLabel = style({
  fontSize: 13,
  fontWeight: 750,
});

export const moneyInput = style({
  width: "100%",
  minHeight: 50,
  padding: `0 ${vars.space[4]}`,
  border: `1px solid ${vars.color.borderStrong}`,
  borderRadius: vars.radius.md,
  color: vars.color.textPrimary,
  background: vars.color.surface,
  fontSize: 18,
  fontWeight: 750,
  fontVariantNumeric: "tabular-nums",
  outline: 0,
  selectors: {
    "&:focus": {
      borderColor: vars.color.actionPrimary,
      boxShadow: `0 0 0 3px ${vars.color.brandSoft}`,
    },
  },
});

export const chips = style({
  display: "grid",
  gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
  gap: 6,
  "@media": {
    "screen and (max-width: 420px)": {
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    },
  },
});

export const chip = style({
  minHeight: 44,
  padding: "0 6px",
  border: `1px solid ${vars.color.borderStrong}`,
  borderRadius: vars.radius.md,
  color: vars.color.textSecondary,
  background: vars.color.surface,
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 750,
});

export const selectedChip = style({
  borderColor: vars.color.actionPrimary,
  color: vars.color.brandStrong,
  background: vars.color.brandSoft,
});

export const segment = style({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 4,
  padding: 4,
  borderRadius: vars.radius.md,
  background: vars.color.surfaceSubtle,
});

export const segmentButton = style({
  minHeight: 44,
  border: 0,
  borderRadius: vars.radius.sm,
  color: vars.color.textSecondary,
  background: "transparent",
  cursor: "pointer",
  fontWeight: 750,
});

export const selectedSegment = style({
  color: vars.color.textPrimary,
  background: vars.color.surface,
  boxShadow: vars.shadow.raised,
});

export const textarea = style({
  width: "100%",
  minHeight: 76,
  resize: "vertical",
  padding: vars.space[3],
  border: `1px solid ${vars.color.borderStrong}`,
  borderRadius: vars.radius.md,
  color: vars.color.textPrimary,
  background: vars.color.surface,
  outline: 0,
  selectors: {
    "&:focus": {
      borderColor: vars.color.actionPrimary,
      boxShadow: `0 0 0 3px ${vars.color.brandSoft}`,
    },
  },
});

export const sheetTotal = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: `${vars.space[4]} 0`,
  marginTop: vars.space[2],
  borderTop: `1px solid ${vars.color.border}`,
  fontWeight: 750,
});

export const sheetTotalAmount = style({
  color: vars.color.brandStrong,
  fontSize: 21,
  fontWeight: 850,
  fontVariantNumeric: "tabular-nums",
});

export const viewHeader = style({
  marginBottom: vars.space[6],
});

export const viewTitle = style({
  marginBottom: vars.space[2],
  fontSize: 24,
  fontWeight: 850,
  letterSpacing: 0,
});

export const viewDescription = style({
  color: vars.color.textSecondary,
  fontSize: 14,
  lineHeight: 1.5,
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

export const settingsList = style({
  borderTop: `1px solid ${vars.color.border}`,
});

export const settingRow = style({
  minHeight: 64,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.space[4],
  borderBottom: `1px solid ${vars.color.border}`,
});

export const settingLabel = style({
  fontSize: 14,
  fontWeight: 750,
});

export const settingValue = style({
  color: vars.color.textSecondary,
  textAlign: "right",
  fontSize: 13,
});

export const settingButton = style({
  width: "100%",
  minHeight: 64,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: 0,
  border: 0,
  borderBottom: `1px solid ${vars.color.border}`,
  color: vars.color.textPrimary,
  background: "transparent",
  cursor: "pointer",
  selectors: {
    "&:hover": { color: vars.color.brandStrong },
    "&:focus-visible": {
      outline: `3px solid ${vars.color.brandSoft}`,
      outlineOffset: -3,
    },
  },
});

export const themeControls = style({
  display: "flex",
  flexWrap: "wrap",
  gap: vars.space[2],
  padding: `${vars.space[4]} 0 ${vars.space[6]}`,
});

export const themeButton = style({
  minHeight: 44,
  padding: `0 ${vars.space[4]}`,
  border: `1px solid ${vars.color.borderStrong}`,
  borderRadius: vars.radius.md,
  color: vars.color.textSecondary,
  background: vars.color.surface,
  cursor: "pointer",
  fontWeight: 750,
});

export const selectedThemeButton = style({
  borderColor: vars.color.actionPrimary,
  color: vars.color.brandStrong,
  background: vars.color.brandSoft,
});
