import { style } from "@vanilla-extract/css";
import { vars } from "@/shared/theme/theme.css";

export const page = style({
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  color: vars.color.textPrimary,
  background: vars.color.background,
});

export const panel = style({
  width: "100%",
  maxWidth: 420,
  padding: `${vars.space[8]} ${vars.space[6]}`,
  background: vars.color.surface,
  boxShadow: vars.shadow.raised,
  "@media": {
    "screen and (max-width: 480px)": {
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      border: 0,
      boxShadow: "none",
    },
  },
});

export const loginPanel = style({
  width: "min(100%, 480px)",
  minWidth: 0,
  minHeight: "100vh",
  display: "grid",
  gridTemplateRows: "auto 1fr auto",
  justifyItems: "center",
  padding: `${vars.space[8]} ${vars.space[6]}`,
  background: vars.color.surface,
});

export const loginAction = style({
  width: "100%",
});

export const loginFooter = style({
  width: "min(100%, 420px)",
  alignSelf: "end",
});

export const onboardingPanel = style({
  width: "min(100%, 480px)",
  minWidth: 0,
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: `${vars.space[8]} ${vars.space[6]}`,
  background: vars.color.surface,
});

export const onboardingContent = style({
  width: "min(100%, 420px)",
});

export const onboardingBrand = style({
  marginBottom: vars.space[8],
});

export const onboardingDescription = style({
  marginBottom: vars.space[8],
});

export const brand = style({
  width: "min(100%, 420px)",
  alignSelf: "start",
});

export const brandName = style({
  marginBottom: vars.space[2],
  color: vars.color.brandText,
  fontSize: vars.font.size["4xl"],
  fontWeight: vars.font.weight.black,
  letterSpacing: 0,
});

export const title = style({
  marginBottom: vars.space[3],
  fontSize: vars.font.size["3xl"],
  lineHeight: 1.3,
  fontWeight: vars.font.weight.black,
  letterSpacing: 0,
});

export const description = style({
  color: vars.color.textSecondary,
  fontSize: vars.font.size.md,
  lineHeight: 1.65,
});

export const kakaoButton = style({
  width: "100%",
  minHeight: 52,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: vars.space[3],
  border: 0,
  borderRadius: vars.radius.md,
  color: "#191919",
  background: "#FEE500",
  cursor: "pointer",
  fontSize: vars.font.size.lg,
  fontWeight: vars.font.weight.heavy,
  selectors: {
    "&:hover": { background: "#F4DC00" },
    "&:disabled": { cursor: "wait", opacity: 0.7 },
    "&:focus-visible": {
      outline: `3px solid ${vars.color.borderStrong}`,
      outlineOffset: 2,
    },
  },
});

export const error = style({
  marginTop: vars.space[4],
  color: vars.color.error,
  fontSize: vars.font.size.base,
  lineHeight: vars.font.lineHeight.relaxed,
});

export const field = style({
  display: "grid",
  gap: vars.space[2],
  marginBottom: vars.space[5],
});

export const label = style({
  fontSize: vars.font.size.base,
  fontWeight: vars.font.weight.extrabold,
});

export const helpText = style({
  color: vars.color.textSecondary,
  fontSize: vars.font.size.sm,
  lineHeight: vars.font.lineHeight.relaxed,
});

export const input = style({
  width: "100%",
  minHeight: 50,
  padding: `0 ${vars.space[4]}`,
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

export const primaryButton = style({
  width: "100%",
  minHeight: 52,
  border: 0,
  borderRadius: vars.radius.md,
  color: vars.color.textInverse,
  background: vars.color.actionPrimary,
  cursor: "pointer",
  fontWeight: vars.font.weight.heavy,
  selectors: {
    "&:hover": { background: vars.color.actionPrimaryHover },
    "&:disabled": { cursor: "wait", opacity: 0.7 },
  },
});

export const footnote = style({
  width: "100%",
  marginTop: vars.space[4],
  color: vars.color.textSecondary,
  textAlign: "center",
  fontSize: vars.font.size.sm,
  lineHeight: 1.6,
});
