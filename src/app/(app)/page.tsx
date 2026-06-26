import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { roundEntriesQueryKey } from "@/entities/round";
import { fetchRoundEntriesOnServer } from "@/entities/round/api/round-api.server";
import { CalendarView } from "@/features/calendar";
import { getProfile } from "@/shared/api/profile";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const profile = await getProfile();

  const dateParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .formatToParts(new Date())
    .reduce<Record<string, string>>((acc, part) => {
      acc[part.type] = part.value;
      return acc;
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
      <CalendarView
        courseName={profile.courseName}
        defaultCaddieFee={profile.defaultCaddieFee}
        initialDate={initialDate}
      />
    </HydrationBoundary>
  );
}
