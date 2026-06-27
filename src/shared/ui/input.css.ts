import { style } from "@vanilla-extract/css";
import { vars } from "@/shared/theme/theme.css";

/**
 * 모든 입력 컴포넌트가 공유하는 외형(skin).
 *
 * 테두리·배경·포커스 링 등 "생김새"만 정의한다. 크기·패딩·폰트 등
 * 동작/용도별 차이는 각 컴포넌트가 style([inputShell, { ... }]) 로 덧붙인다.
 * 포커스 링 색을 바꾸려면 여기 한 곳만 고치면 모든 입력에 반영된다.
 */
export const inputShell = style({
  width: "100%",
  border: `1px solid ${vars.color.borderStrong}`,
  borderRadius: vars.radius.md,
  color: vars.color.textPrimary,
  background: vars.color.surface,
  outline: 0,
  selectors: {
    "&:focus, &:focus-within": {
      borderColor: vars.color.actionPrimary,
      boxShadow: `0 0 0 3px ${vars.color.brandSoft}`,
    },
  },
});
