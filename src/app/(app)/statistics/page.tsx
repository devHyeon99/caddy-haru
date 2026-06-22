import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { roundEntriesQueryKey } from "@/entities/round";
import { fetchRoundEntriesOnServer } from "@/entities/round/api/round-api.server";
import { StatisticsView } from "@/features/statistics";
import { getProfile } from "@/shared/api/profile";

export const dynamic = "force-dynamic";

export default async function StatisticsPage() {
  const profile = await getProfile();

  const now = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
  })
    .formatToParts(new Date())
    .reduce<Record<string, string>>((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});
  const year = Number(now.year);
  const month = Number(now.month) - 1;

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: roundEntriesQueryKey(year),
    queryFn: () => fetchRoundEntriesOnServer(year),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StatisticsView
        courseName={profile.courseName}
        year={year}
        month={month}
      />
    </HydrationBoundary>
  );
}
