import { style } from "@vanilla-extract/css";
import { vars } from "@/shared/theme/theme.css";

/** 섹션 위 작은 라벨(eyebrow). */
export const eyebrow = style({
  marginBottom: vars.space[2],
  color: vars.color.textSecondary,
  fontSize: vars.font.size.base,
  fontWeight: vars.font.weight.semibold,
  letterSpacing: 0,
});

/** 섹션 제목. */
export const sectionTitle = style({
  fontSize: vars.font.size.lg,
  fontWeight: vars.font.weight.heavy,
  letterSpacing: 0,
});

/** 화면 상단 헤더 묶음. */
export const viewHeader = style({
  marginBottom: vars.space[6],
});

/** 화면 큰 제목. */
export const viewTitle = style({
  marginBottom: vars.space[2],
  fontSize: vars.font.size["3xl"],
  fontWeight: vars.font.weight.black,
  letterSpacing: 0,
});

/** 화면 제목 아래 설명문. */
export const viewDescription = style({
  color: vars.color.textSecondary,
  fontSize: vars.font.size.md,
  lineHeight: vars.font.lineHeight.relaxed,
});
