import { globalStyle, style } from "@vanilla-extract/css";
import { vars } from "@/shared/theme/theme.css";

export const region = style({
  position: "relative",
  width: "min(100%, 420px)",
  minWidth: 0,
  minHeight: 0,
  display: "flex",
  alignItems: "center",
  overflow: "hidden",
});

export const carousel = style({
  width: "100%",
  minWidth: 0,
  height: 270,
  paddingBottom: vars.space[6],
  "@media": {
    "screen and (max-height: 700px)": {
      height: 230,
    },
  },
});

export const slide = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 48px",
  textAlign: "center",
});

const navigationButton = style({
  position: "absolute",
  zIndex: 2,
  top: "50%",
  width: 44,
  height: 44,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.full,
  color: vars.color.textSecondary,
  background: vars.color.surface,
  cursor: "pointer",
  transform: "translateY(-50%)",
  selectors: {
    "&:hover": {
      color: vars.color.brandText,
      background: vars.color.surfaceSubtle,
    },
    "&:focus-visible": {
      outline: `3px solid ${vars.color.brandSoft}`,
      outlineOffset: 2,
    },
  },
});

export const previousButton = style([
  navigationButton,
  {
    left: 0,
  },
]);

export const nextButton = style([
  navigationButton,
  {
    right: 0,
  },
]);

export const icon = style({
  width: 64,
  height: 64,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: vars.space[5],
  borderRadius: vars.radius.full,
  color: vars.color.brandText,
  background: vars.color.brandSoft,
});

export const title = style({
  marginBottom: vars.space[2],
  fontSize: vars.font.size["2xl"],
  lineHeight: 1.35,
  fontWeight: vars.font.weight.black,
  letterSpacing: 0,
});

export const description = style({
  maxWidth: 300,
  color: vars.color.textSecondary,
  fontSize: vars.font.size.md,
  lineHeight: 1.65,
});

globalStyle(`${carousel} .swiper-pagination`, {
  bottom: 0,
});

globalStyle(`${carousel} .swiper-pagination-bullet`, {
  width: 7,
  height: 7,
  margin: "0 4px",
  borderRadius: vars.radius.full,
  background: vars.color.textSecondary,
  opacity: 0.28,
  transition: "width 180ms ease, opacity 180ms ease",
});

globalStyle(`${carousel} .swiper-pagination-bullet-active`, {
  width: 22,
  background: vars.color.actionPrimary,
  opacity: 1,
});

globalStyle(`${carousel} .swiper-pagination-bullet:focus-visible`, {
  outline: `3px solid ${vars.color.brandSoft}`,
  outlineOffset: 2,
});
