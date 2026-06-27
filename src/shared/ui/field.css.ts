import { style } from "@vanilla-extract/css";
import { vars } from "@/shared/theme/theme.css";

/** 폼 필드 묶음: 라벨(위) + 컨트롤(아래) 세로 스택. */
export const field = style({
  display: "grid",
  gap: vars.space[2],
  marginBottom: vars.space[5],
});

/** 필드 라벨 타이포. */
export const fieldLabel = style({
  fontSize: vars.font.size.base,
  fontWeight: vars.font.weight.extrabold,
});
