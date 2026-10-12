import { ResetDialog } from "@/components/ResetDialog";
import { StreakCounter } from "@/components/StreakCounter";
import {
  streakKeys,
  useCheckInToday,
  useRelapse,
  useStartStreak,
  useStreakSummary,
} from "@/hooks/useQueries";
import { formatDuration, secondsToDays } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Flame,
  Loader2,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { type ReactNode, useState } from "react";

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="animate-rise rounded-[2rem] border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="mt-3 font-display text-2xl font-bold text-foreground">
        {value}
      </p>
    </div>
  );
}

export function DashboardPage() {
  const summaryQuery = useStreakSummary();
  const startStreak = useStartStreak();
  const checkIn = useCheckInToday();
  const relapse = useRelapse();
  const queryClient = useQueryClient();
  const [resetOpen, setResetOpen] = useState(false);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);

  const summary = summaryQuery.data ?? null;
  const current = summary?.current ?? null;

  const handleCheckIn = () => {
    checkIn.mutate(undefined, {
      onSuccess: (updated) => {
        // Reflect the returned summary immediately so the button switches
        // to its checked-in state without waiting on a refetch.
        queryClient.setQueryData(streakKeys.summary, updated);
      },
    });
  };

  const handleToggleTrigger = (trigger: string) => {
    setSelectedTriggers((prev) =>
      prev.includes(trigger)
        ? prev.filter((item) => item !== trigger)
        : [...prev, trigger],
    );
  };

  const handleConfirmReset = () => {
    relapse.mutate(selectedTriggers, {
      onSuccess: () => {
        setSelectedTriggers([]);
        setResetOpen(false);
      },
    });
  };

  if (summaryQuery.isPending) {
    return (
      <section
        data-ocid="dashboard.loading_state"
        aria-label="Loading your streak"
        className="space-y-5"
      >
        <div className="h-56 animate-pulse rounded-[2.5rem] bg-secondary" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-28 animate-pulse rounded-[2rem] bg-secondary" />
          <div className="h-28 animate-pulse rounded-[2rem] bg-secondary" />
        </div>
      </section>
    );
  }

  if (summaryQuery.isError) {
    return (
      <section
        data-ocid="dashboard.error_state"
        aria-label="Could not load your streak"
        className="rounded-[2rem] border border-border bg-card p-6 text-center"
      >
        <p className="font-display text-lg font-semibold">
          We couldn't load your streak
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Check your connection and try again.
        </p>
        <button
          type="button"
          data-ocid="dashboard.retry_button"
          onClick={() => void summaryQuery.refetch()}
          className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-6 font-semibold text-primary-foreground transition-smooth hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
        >
          Try again
        </button>
      </section>
    );
  }

  if (!current) {
    return (
      <section
        data-ocid="dashboard.empty_state"
        aria-label="Start your first streak"
        className="animate-rise rounded-[2.5rem] border border-border bg-card p-8 text-center"
      >
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground">
          <Flame className="size-10" aria-hidden="true" />
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold">
          Start your clean streak
        </h1>
        <p className="mt-3 text-muted-foreground">
          Your timer begins the moment you start. Check in each day to keep your
          progress honest and private.
        </p>
        <button
          type="button"
          data-ocid="dashboard.start_button"
          onClick={() => startStreak.mutate()}
          disabled={startStreak.isPending}
          className="mt-7 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-primary px-6 font-semibold text-primary-foreground shadow-streak transition-smooth hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {startStreak.isPending ? (
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          ) : (
            <Sparkles className="size-5" aria-hidden="true" />
          )}
          {startStreak.isPending ? "Starting…" : "Start my streak"}
        </button>
        {startStreak.isError ? (
          <p
            data-ocid="dashboard.start.error_state"
            className="mt-4 text-sm text-destructive"
          >
            Couldn't start your streak. Please try again.
          </p>
        ) : null}
      </section>
    );
  }

  const checkedInToday = summary?.checkedInToday ?? false;

  return (
    <section
      data-ocid="dashboard.page"
      aria-label="Dashboard"
      className="space-y-6"
    >
      <header className="space-y-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Your streak
        </h1>
        <p className="text-muted-foreground">
          Every second counts. Stay present, stay kind to yourself.
        </p>
      </header>

      <StreakCounter startedAt={current.startedAt} />

      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Longest"
          value={formatDuration(summary?.longestStreakSeconds ?? 0n)}
          icon={<Flame className="size-4" aria-hidden="true" />}
        />
        <StatCard
          label="Total clean"
          value={`${secondsToDays(summary?.totalCleanSeconds ?? 0n)} days`}
          icon={<Sparkles className="size-4" aria-hidden="true" />}
        />
      </div>

      <div className="space-y-3">
        <button
          type="button"
          data-ocid="dashboard.checkin_button"
          onClick={handleCheckIn}
          disabled={checkIn.isPending || checkedInToday}
          className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground transition-smooth hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {checkIn.isPending ? (
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="size-5" aria-hidden="true" />
          )}
          {checkedInToday
            ? "Checked in today"
            : checkIn.isPending
              ? "Checking in…"
              : "Check in today"}
        </button>

        {checkedInToday ? (
          <p
            data-ocid="dashboard.checkin.success_state"
            className="text-center text-sm text-success"
          >
            You're checked in for today. See you tomorrow.
          </p>
        ) : null}

        {checkIn.isError ? (
          <p
            data-ocid="dashboard.checkin.error_state"
            className="text-center text-sm text-destructive"
          >
            Check-in didn't go through. Please try again.
          </p>
        ) : null}

        <button
          type="button"
          data-ocid="dashboard.reset_button"
          onClick={() => setResetOpen(true)}
          className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full border border-destructive/40 bg-destructive/10 px-6 font-semibold text-destructive transition-smooth hover:bg-destructive/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
        >
          <RotateCcw className="size-5" aria-hidden="true" />I relapsed — reset
        </button>
      </div>

      <ResetDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        onConfirm={handleConfirmReset}
        isPending={relapse.isPending}
        isError={relapse.isError}
        selectedTriggers={selectedTriggers}
        onToggleTrigger={handleToggleTrigger}
      />
    </section>
  );
}
