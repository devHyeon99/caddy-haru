import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/shared/api/supabase/server";

export type Profile = {
  courseName: string;
  defaultCaddieFee: number;
  overFeePresets: number[];
};

// cache() deduplicates calls within a single request —
// layout and page can both call this without hitting the DB twice.
export const getProfile = cache(async (): Promise<Profile> => {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) redirect("/login");

  const { data } = await supabase
    .from("profiles")
    .select("course_name, default_caddie_fee, over_fee_presets")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) redirect("/onboarding");

  return {
    courseName: data.course_name,
    defaultCaddieFee: data.default_caddie_fee,
    overFeePresets: data.over_fee_presets as number[],
  };
});
