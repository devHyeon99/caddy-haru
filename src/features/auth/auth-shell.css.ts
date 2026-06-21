import { style } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";

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

export const brand = style({
  width: "min(100%, 420px)",
  alignSelf: "start",
});

export const brandName = style({
  marginBottom: vars.space[2],
  color: vars.color.brandStrong,
  fontSize: 30,
  fontWeight: 850,
  letterSpacing: 0,
});

export const title = style({
  marginBottom: vars.space[3],
  fontSize: 24,
  lineHeight: 1.3,
  fontWeight: 850,
  letterSpacing: 0,
});

export const description = style({
  color: vars.color.textSecondary,
  fontSize: 14,
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
  fontSize: 15,
  fontWeight: 800,
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
  fontSize: 13,
  lineHeight: 1.5,
});

export const field = style({
  display: "grid",
  gap: vars.space[2],
  marginBottom: vars.space[5],
});

export const label = style({
  fontSize: 13,
  fontWeight: 750,
});

export const helpText = style({
  color: vars.color.textSecondary,
  fontSize: 12,
  lineHeight: 1.5,
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
  fontWeight: 800,
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
  fontSize: 12,
  lineHeight: 1.6,
});
