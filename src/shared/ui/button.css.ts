import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "@/shared/theme/theme.css";

export const button = recipe({
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: 0,
    borderRadius: vars.radius.md,
    cursor: "pointer",
    selectors: {
      "&:disabled": { cursor: "not-allowed" },
    },
  },
  variants: {
    variant: {
      primary: {
        width: "100%",
        minHeight: 52,
        gap: vars.space[2],
        marginTop: vars.space[5],
        color: vars.color.textInverse,
        background: vars.color.actionPrimary,
        fontWeight: vars.font.weight.heavy,
        selectors: {
          "&:hover": { background: vars.color.actionPrimaryHover },
          "&:disabled": { opacity: 0.55 },
          "&:focus-visible": {
            outline: `3px solid ${vars.color.brandSoft}`,
            outlineOffset: 2,
          },
        },
      },
      outline: {
        minHeight: 44,
        padding: `0 ${vars.space[4]}`,
        border: `1px solid ${vars.color.borderStrong}`,
        color: vars.color.textPrimary,
        background: vars.color.surface,
        fontWeight: vars.font.weight.extrabold,
        selectors: {
          "&:hover": { background: vars.color.surfaceSubtle },
          "&:disabled": { opacity: 0.45 },
          "&:focus-visible": {
            outline: `3px solid ${vars.color.brandSoft}`,
            outlineOffset: 2,
          },
        },
      },
      icon: {
        width: 36,
        height: 36,
        padding: 0,
        color: vars.color.textSecondary,
        background: "transparent",
        selectors: {
          "&:hover": { background: vars.color.surface },
          "&:disabled": { opacity: 0.45 },
          "&:focus-visible": {
            outline: `3px solid ${vars.color.border}`,
            outlineOffset: 1,
          },
        },
      },
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});

export type ButtonVariants = NonNullable<RecipeVariants<typeof button>>;
