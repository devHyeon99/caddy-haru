import { redirect } from "next/navigation";
import { CalendarDashboard } from "@/features/dashboard/calendar-dashboard";
import { createClient } from "@/shared/api/supabase/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("course_name, default_caddie_fee")
    .eq("user_id", userId)
    .maybeSingle();

  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <CalendarDashboard
      courseName={profile.course_name}
      defaultCaddieFee={profile.default_caddie_fee}
    />
  );
}
