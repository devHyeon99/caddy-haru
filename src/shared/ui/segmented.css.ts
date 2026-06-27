import { style } from "@vanilla-extract/css";
import { vars } from "@/shared/theme/theme.css";

/** 세그먼트 컨트롤의 개별 버튼. */
export const segmentButton = style({
  minHeight: 44,
  border: 0,
  borderRadius: vars.radius.sm,
  color: vars.color.textSecondary,
  background: "transparent",
  cursor: "pointer",
  fontWeight: vars.font.weight.extrabold,
});

/** 선택된 세그먼트 버튼. */
export const selectedSegment = style({
  color: vars.color.textPrimary,
  background: vars.color.surface,
  boxShadow: vars.shadow.raised,
});
