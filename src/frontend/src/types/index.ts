import type { Milestone, Streak, StreakLog, StreakSummary } from "@/backend";

export type { Milestone, Streak, StreakLog, StreakSummary };

/** Milestone thresholds (days) the backend awards badges for. */
export const MILESTONE_DAYS = [1, 3, 7, 14, 30, 90, 180, 365] as const;

/** Convert a Motoko nanosecond timestamp into a JavaScript Date. */
export function timestampToDate(timestamp: bigint): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Whole days represented by a duration in seconds. */
export function secondsToDays(seconds: bigint): number {
  return Number(seconds / 86_400n);
}

/** Break a duration in seconds into days, hours, minutes and seconds. */
export function splitDuration(seconds: bigint): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const total = Number(seconds);
  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor((total % 86_400) / 3_600),
    minutes: Math.floor((total % 3_600) / 60),
    seconds: total % 60,
  };
}

/** Human-readable duration such as "23 days" or "14 hours". */
export function formatDuration(seconds: bigint): string {
  const { days, hours, minutes } = splitDuration(seconds);
  if (days > 0) return `${days} ${days === 1 ? "day" : "days"}`;
  if (hours > 0) return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  if (minutes > 0) return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
  return `${Number(seconds)}s`;
}

/** Seconds elapsed since a streak started, never negative. */
export function elapsedSeconds(
  startedAt: bigint,
  now: number = Date.now(),
): bigint {
  const startedMs = Number(startedAt / 1_000_000n);
  return BigInt(Math.max(0, Math.floor((now - startedMs) / 1000)));
}
