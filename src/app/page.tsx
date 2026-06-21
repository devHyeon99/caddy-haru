import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { CalendarDashboard } from "@/features/dashboard/calendar-dashboard";
import { fetchRoundEntriesOnServer } from "@/features/rounds/round-entries.server";
import { roundEntriesQueryKey } from "@/features/rounds/round-entry-api";
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
    .select("course_name, default_caddie_fee, over_fee_presets")
    .eq("user_id", userId)
    .maybeSingle();

  if (!profile) {
    redirect("/onboarding");
  }

  const dateParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .formatToParts(new Date())
    .reduce<Record<string, string>>((parts, part) => {
      parts[part.type] = part.value;
      return parts;
    }, {});
  const initialDate = `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
  const initialYear = Number(dateParts.year);

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: roundEntriesQueryKey(initialYear),
    queryFn: () => fetchRoundEntriesOnServer(initialYear),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CalendarDashboard
        courseName={profile.course_name}
        defaultCaddieFee={profile.default_caddie_fee}
        overFeePresets={profile.over_fee_presets}
        initialDate={initialDate}
      />
    </HydrationBoundary>
  );
}
