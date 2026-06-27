import { style } from "@vanilla-extract/css";
import { vars } from "@/shared/theme/theme.css";
import { inputShell } from "@/shared/ui/input.css";

export const overlay = style({
  position: "fixed",
  zIndex: 50,
  inset: 0,
  background: vars.color.overlay,
});

export const sheet = style({
  position: "fixed",
  zIndex: 51,
  left: 0,
  right: 0,
  bottom: 0,
  width: "min(100%, 760px)",
  margin: "0 auto",
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

export { field, fieldLabel } from "@/shared/ui/field.css";

export const segment = style({
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 4,
  padding: 4,
  borderRadius: vars.radius.md,
  background: vars.color.surfaceSubtle,
});

export const textarea = style([
  inputShell,
  {
    minHeight: 76,
    resize: "vertical",
    padding: vars.space[3],
  },
]);

export const sheetTotal = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: `${vars.space[4]} 0`,
  marginTop: vars.space[2],
  borderTop: `1px solid ${vars.color.border}`,
  fontWeight: vars.font.weight.extrabold,
});

export const sheetTotalAmount = style({
  color: vars.color.brandText,
  fontSize: vars.font.size["2xl"],
  fontWeight: vars.font.weight.black,
  fontVariantNumeric: "tabular-nums",
});

export const formError = style({
  marginTop: vars.space[3],
  color: vars.color.error,
  fontSize: vars.font.size.base,
  lineHeight: vars.font.lineHeight.relaxed,
});
