"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { RoundEntry } from "@/lib/calendar";
import {
  createRoundEntry,
  deleteRoundEntry,
  listRoundEntries,
  updateRoundEntry,
  type RoundEntryInput,
} from "./round-entry-api";

function sortEntries(entries: RoundEntry[]) {
  return [...entries].sort((a, b) => a.workDate.localeCompare(b.workDate));
}

export function useRoundEntries(year: number, courseName: string) {
  const queryClient = useQueryClient();
  const queryKey = ["round-entries", year] as const;

  const query = useQuery({
    queryKey,
    queryFn: () => listRoundEntries(year),
  });

  const createMutation = useMutation({
    mutationFn: (entry: RoundEntryInput) => createRoundEntry(entry, courseName),
    onSuccess: (createdEntry) => {
      queryClient.setQueryData<RoundEntry[]>(queryKey, (current = []) =>
        sortEntries([...current, createdEntry]),
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateRoundEntry,
    onSuccess: (updatedEntry) => {
      queryClient.setQueryData<RoundEntry[]>(queryKey, (current = []) =>
        sortEntries(
          current.map((entry) =>
            entry.id === updatedEntry.id ? updatedEntry : entry,
          ),
        ),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRoundEntry,
    onSuccess: (deletedId) => {
      queryClient.setQueryData<RoundEntry[]>(queryKey, (current = []) =>
        current.filter((entry) => entry.id !== deletedId),
      );
    },
  });

  return {
    entries: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    createEntry: createMutation.mutateAsync,
    updateEntry: updateMutation.mutateAsync,
    deleteEntry: deleteMutation.mutateAsync,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
