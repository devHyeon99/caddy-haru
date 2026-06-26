import { style } from "@vanilla-extract/css";
import { vars } from "@/shared/theme/theme.css";

export const overlay = style({
  position: "fixed",
  zIndex: 50,
  inset: 0,
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
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


export const segment = style({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 4,
  padding: 4,
  borderRadius: vars.radius.md,
  background: vars.color.surfaceSubtle,
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

export const formError = style({
  marginTop: vars.space[3],
  color: vars.color.error,
  fontSize: 13,
  lineHeight: 1.5,
});
