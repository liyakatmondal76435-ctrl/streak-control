import { HistoryList } from "@/components/HistoryList";
import { MilestoneBadges } from "@/components/MilestoneBadges";
import { useStreakSummary } from "@/hooks/useQueries";
import { MILESTONE_DAYS, type Milestone, secondsToDays } from "@/types";
import { Clock, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

/** Build the full milestone list, filling in any thresholds the backend omits. */
function buildMilestones(milestones: Milestone[]): {
  days: number;
  earned: boolean;
}[] {
  const earnedByDays = new Map<number, boolean>();
  for (const milestone of milestones) {
    earnedByDays.set(Number(milestone.days), milestone.earned);
  }
  return MILESTONE_DAYS.map((days) => ({
    days,
    earned: earnedByDays.get(days) ?? false,
  }));
}

function StatTile({
  icon,
  label,
  value,
  ocid,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  ocid: string;
}) {
  return (
    <div
      data-ocid={ocid}
      className="flex flex-col gap-2 rounded-3xl bg-card p-5 shadow-elevated"
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary">
        {icon}
      </span>
      <span className="font-display text-3xl font-bold tracking-tight">
        {value}
      </span>
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function StatsSkeleton() {
  const ids = Array.from({ length: 3 }, (_, i) => `stats-skeleton-${i}`);
  return (
    <div data-ocid="stats.loading_state" className="space-y-4">
      {ids.map((id) => (
        <div
          key={id}
          className="h-28 animate-pulse rounded-3xl bg-muted"
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export function StatsPage() {
  const { data, isLoading, isError, refetch } = useStreakSummary();

  if (isLoading) {
    return (
      <section
        data-ocid="stats.page"
        aria-label="Stats and history"
        className="space-y-6"
      >
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Stats
        </h1>
        <StatsSkeleton />
      </section>
    );
  }

  if (isError || !data) {
    return (
      <section
        data-ocid="stats.page"
        aria-label="Stats and history"
        className="space-y-6"
      >
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Stats
        </h1>
        <div
          data-ocid="stats.error_state"
          className="space-y-4 rounded-3xl bg-card p-6 text-center shadow-elevated"
        >
          <p className="font-display text-lg font-bold">
            We couldn&apos;t load your stats
          </p>
          <p className="text-sm text-muted-foreground">
            Your progress is safe. Check your connection and try again.
          </p>
          <button
            type="button"
            data-ocid="stats.retry_button"
            onClick={() => void refetch()}
            className="rounded-full bg-gradient-primary px-6 py-3 font-semibold text-primary-foreground transition-smooth hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
          >
            Try again
          </button>
        </div>
      </section>
    );
  }

  const totalCleanDays = secondsToDays(data.totalCleanSeconds);
  const longestDays = secondsToDays(data.longestStreakSeconds);
  const milestones = buildMilestones(data.milestones);

  return (
    <section
      data-ocid="stats.page"
      aria-label="Stats and history"
      className="space-y-8"
    >
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Stats
        </h1>
        <p className="text-muted-foreground">
          Every clean day you&apos;ve earned, and the moments you started over.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <StatTile
          ocid="stats.total_days"
          icon={<Sparkles className="size-5" aria-hidden="true" />}
          label="Total clean days"
          value={String(totalCleanDays)}
        />
        <StatTile
          ocid="stats.longest_streak"
          icon={<Clock className="size-5" aria-hidden="true" />}
          label="Longest streak"
          value={`${longestDays}d`}
        />
      </div>

      <MilestoneBadges milestones={milestones} />

      <HistoryList logs={data.logs} />
    </section>
  );
}
