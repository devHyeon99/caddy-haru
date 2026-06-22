import { style } from "@vanilla-extract/css";
import { vars } from "@/shared/theme/theme.css";

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

export const navLink = style({
  minWidth: 0,
  minHeight: 56,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 3,
  borderRadius: vars.radius.md,
  color: vars.color.textSecondary,
  textDecoration: "none",
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

export const activeNavLink = style({
  color: vars.color.brandStrong,
});
