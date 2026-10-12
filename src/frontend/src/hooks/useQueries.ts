import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const streakKeys = {
  summary: ["streak", "summary"] as const,
};

/** The signed-in caller's streak summary: current streak, totals, milestones and logs. */
export function useStreakSummary() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: streakKeys.summary,
    queryFn: async () => {
      if (!actor) return null;
      return actor.getStreakSummary();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Begin a new streak for the caller. */
export function useStartStreak() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.startStreak();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: streakKeys.summary });
    },
  });
}

/** Record today's check-in on the active streak. */
export function useCheckInToday() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.checkInToday();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: streakKeys.summary });
    },
  });
}

/** End the current streak, recording the triggers that caused the relapse. */
export function useRelapse() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (triggers: string[]) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.relapse(triggers);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: streakKeys.summary });
    },
  });
}
