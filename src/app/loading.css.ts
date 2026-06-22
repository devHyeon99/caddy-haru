import { keyframes, style } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";

const reduceMotion = "(prefers-reduced-motion: reduce)";

const float = keyframes({
  "0%, 100%": { transform: "translateY(0)" },
  "50%": { transform: "translateY(-6px)" },
});

const dotBounce = keyframes({
  "0%, 80%, 100%": { transform: "scale(0.6)", opacity: 0.35 },
  "40%": { transform: "scale(1)", opacity: 1 },
});

// Reduced-motion fallback: opacity-only pulse (no transform) so the
// loading state still reads as "active" without vestibular-triggering motion.
const dotFade = keyframes({
  "0%, 100%": { opacity: 0.3 },
  "50%": { opacity: 1 },
});

const fadeIn = keyframes({
  from: { opacity: 0, transform: "translateY(4px)" },
  to: { opacity: 1, transform: "translateY(0)" },
});

export const screen = style({
  minHeight: "100dvh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: vars.space[6],
  padding: vars.space[6],
  background: vars.color.background,
  color: vars.color.textPrimary,
  animation: `${fadeIn} 0.4s ease-out both`,
  "@media": {
    [reduceMotion]: { animation: "none" },
  },
});

export const logo = style({
  position: "relative",
  width: 38,
  height: 38,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export const mark = style({
  position: "relative",
  zIndex: 1,
  width: 38,
  height: 38,
  flex: "0 0 auto",
  overflow: "hidden",
  borderRadius: vars.radius.md,
  background: vars.color.actionPrimary,
  boxShadow: vars.shadow.raised,
  animation: `${float} 2.4s ease-in-out infinite`,
  "@media": {
    [reduceMotion]: { animation: "none" },
  },
});

export const markHat = style({
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

export const markHead = style({
  position: "absolute",
  top: 12,
  left: 14,
  width: 10,
  height: 10,
  borderRadius: vars.radius.full,
  background: vars.color.textInverse,
});

export const markBody = style({
  position: "absolute",
  left: 9,
  bottom: 5,
  width: 20,
  height: 11,
  borderRadius: "11px 11px 4px 4px",
  background: vars.color.textInverse,
});

export const textGroup = style({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: vars.space[1],
});

export const brandName = style({
  fontSize: 20,
  fontWeight: 800,
  letterSpacing: 0,
});

export const caption = style({
  color: vars.color.textSecondary,
  fontSize: 13,
});

export const dots = style({
  display: "flex",
  gap: vars.space[2],
});

export const dot = style({
  width: 8,
  height: 8,
  borderRadius: vars.radius.full,
  background: vars.color.actionPrimary,
  animation: `${dotBounce} 1.4s ease-in-out infinite`,
  selectors: {
    "&:nth-child(2)": { animationDelay: "0.16s" },
    "&:nth-child(3)": { animationDelay: "0.32s" },
  },
  "@media": {
    [reduceMotion]: { animation: `${dotFade} 1.6s ease-in-out infinite` },
  },
});
