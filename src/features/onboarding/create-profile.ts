"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/shared/api/supabase/server";
import { validateOnboarding } from "./validation";

export type OnboardingActionState = {
  error: string | null;
};

export async function createProfile(
  _state: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const result = validateOnboarding(
    formData.get("courseName"),
    formData.get("defaultCaddieFee"),
  );

  if (!result.success) {
    return { error: result.error };
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    redirect("/login");
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: userId,
      course_name: result.data.courseName,
      default_caddie_fee: result.data.defaultCaddieFee,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return {
      error: "프로필을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  redirect("/");
}
