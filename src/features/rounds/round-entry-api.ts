import type { RoundEntry } from "@/lib/calendar";
import { createClient } from "@/shared/api/supabase/client";

const roundEntryColumns =
  "id, work_date, caddie_fee, over_fee, payment_method, memo";

export type RoundEntryInput = Omit<RoundEntry, "id">;

export type RoundEntryRow = {
  id: string;
  work_date: string;
  caddie_fee: number;
  over_fee: number;
  payment_method: "cash" | "transfer";
  memo: string | null;
};

export function mapRoundEntry(row: RoundEntryRow): RoundEntry {
  return {
    id: row.id,
    workDate: row.work_date,
    caddieFee: row.caddie_fee,
    overFee: row.over_fee,
    paymentMethod: row.payment_method,
    memo: row.memo ?? undefined,
  };
}

export function toRoundEntryPayload(
  entry: RoundEntryInput,
  courseName: string,
) {
  return {
    work_date: entry.workDate,
    caddie_fee: entry.caddieFee,
    over_fee: entry.overFee,
    payment_method: entry.paymentMethod,
    course_name_snapshot: courseName,
    memo: entry.memo ?? null,
  };
}

export async function listRoundEntries(year: number) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("round_entries")
    .select(roundEntryColumns)
    .gte("work_date", `${year}-01-01`)
    .lte("work_date", `${year}-12-31`)
    .order("work_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data as RoundEntryRow[]).map(mapRoundEntry);
}

export async function createRoundEntry(
  entry: RoundEntryInput,
  courseName: string,
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("round_entries")
    .insert(toRoundEntryPayload(entry, courseName))
    .select(roundEntryColumns)
    .single();

  if (error) {
    throw error;
  }

  return mapRoundEntry(data as RoundEntryRow);
}

export async function updateRoundEntry(
  entry: RoundEntryInput & { id: string },
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("round_entries")
    .update({
      caddie_fee: entry.caddieFee,
      over_fee: entry.overFee,
      payment_method: entry.paymentMethod,
      memo: entry.memo ?? null,
    })
    .eq("id", entry.id)
    .select(roundEntryColumns)
    .single();

  if (error) {
    throw error;
  }

  return mapRoundEntry(data as RoundEntryRow);
}

export async function deleteRoundEntry(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("round_entries").delete().eq("id", id);

  if (error) {
    throw error;
  }

  return id;
}
