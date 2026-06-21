// Imports the server Supabase client, which uses `next/headers` and therefore
// can only be bundled into Server Components / server code.
import { createClient } from "@/shared/api/supabase/server";
import { fetchRoundEntries } from "./round-entry-api";

// Server-side fetch for prefetching round entries during SSR.
export async function fetchRoundEntriesOnServer(year: number) {
  const supabase = await createClient();
  return fetchRoundEntries(supabase, year);
}
