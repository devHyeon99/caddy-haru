import { style } from "@vanilla-extract/css";
import { vars } from "@/shared/theme/theme.css";

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
