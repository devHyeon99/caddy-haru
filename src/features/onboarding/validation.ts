import { parseManInput } from "@/shared/lib/format";

export type OnboardingValues = {
  courseName: string;
  defaultCaddieFee: number;
};

export type OnboardingValidationResult =
  | { success: true; data: OnboardingValues }
  | { success: false; error: string };

export function validateOnboarding(
  courseNameValue: FormDataEntryValue | null,
  defaultCaddieFeeValue: FormDataEntryValue | null,
): OnboardingValidationResult {
  const courseName =
    typeof courseNameValue === "string" ? courseNameValue.trim() : "";
  const feeText =
    typeof defaultCaddieFeeValue === "string"
      ? defaultCaddieFeeValue.replaceAll(",", "").trim()
      : "";

  if (courseName.length < 1 || courseName.length > 100) {
    return {
      success: false,
      error: "골프장 이름을 100자 이내로 입력해 주세요.",
    };
  }

  // 입력은 "만원" 단위(소수 허용): "15" → 150,000원, "15.5" → 155,000원
  if (!/^\d+(\.\d+)?$/.test(feeText)) {
    return { success: false, error: "기본 캐디피를 숫자로 입력해 주세요." };
  }

  const defaultCaddieFee = parseManInput(feeText);
  if (
    !Number.isSafeInteger(defaultCaddieFee) ||
    defaultCaddieFee > 10_000_000
  ) {
    return {
      success: false,
      error: "기본 캐디피는 1,000만원 이하로 입력해 주세요.",
    };
  }

  return { success: true, data: { courseName, defaultCaddieFee } };
}
