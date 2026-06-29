import { recipe, type RecipeVariants } from "@vanilla-extract/recipes";
import { vars } from "@/shared/theme/theme.css";

export const badge = recipe({
  base: {
    padding: "3px 5px",
    borderRadius: vars.radius.sm,
    fontSize: vars.font.size.xs,
    fontWeight: vars.font.weight.bold,
  },
  variants: {
    variant: {
      default: {
        color: vars.color.textSecondary,
        background: vars.color.surfaceSubtle,
      },
      cash: {
        color: vars.color.payment.cash,
        background: "transparent",
        boxShadow: `inset 0 0 0 1.5px ${vars.color.payment.cash}`,
      },
      transfer: {
        color: vars.color.payment.transfer,
        background: "transparent",
        boxShadow: `inset 0 0 0 1.5px ${vars.color.payment.transfer}`,
      },
      nine: {
        color: vars.color.payment.nine,
        background: "transparent",
        boxShadow: `inset 0 0 0 1.5px ${vars.color.payment.nine}`,
      },
      success: {
        color: vars.color.success,
        background: vars.color.successSoft,
        boxShadow: `inset 0 0 0 1.5px ${vars.color.success}`,
      },
      error: {
        color: vars.color.error,
        background: vars.color.errorSoft,
        boxShadow: `inset 0 0 0 1.5px ${vars.color.error}`,
      },
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export type BadgeVariants = NonNullable<RecipeVariants<typeof badge>>;
