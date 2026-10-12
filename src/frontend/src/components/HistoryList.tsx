import {
  type StreakLog,
  formatDuration,
  secondsToDays,
  timestampToDate,
} from "@/types";
import { CalendarDays, Clock, Tag } from "lucide-react";

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  year: "numeric",
};

function formatDate(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "Unknown date";
  return date.toLocaleDateString(undefined, DATE_FORMAT);
}

function TriggerTags({ triggers }: { triggers: string[] }) {
  if (triggers.length === 0) {
    return (
      <span className="text-xs text-muted-foreground">
        No triggers recorded
      </span>
    );
  }
  return (
    <ul className="flex flex-wrap gap-2">
      {triggers.map((trigger) => (
        <li
          key={trigger}
          className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground"
        >
          <Tag className="size-3" aria-hidden="true" />
          {trigger}
        </li>
      ))}
    </ul>
  );
}

function HistoryEntry({ log, index }: { log: StreakLog; index: number }) {
  const days = secondsToDays(log.durationSeconds);
  return (
    <li
      data-ocid={`history.item.${index + 1}`}
      className="space-y-3 rounded-3xl bg-card p-5 shadow-elevated"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
            <CalendarDays className="size-4 text-primary" aria-hidden="true" />
            {formatDate(log.startedAt)}
          </p>
          <p className="text-sm text-muted-foreground">
            Ended {formatDate(log.endedAt)}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-primary/15 px-3 py-1 font-mono text-sm font-semibold text-primary">
          {days} {days === 1 ? "day" : "days"}
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="size-4" aria-hidden="true" />
        <span>{formatDuration(log.durationSeconds)}</span>
      </div>
      <TriggerTags triggers={log.triggers} />
    </li>
  );
}

interface HistoryListProps {
  logs: StreakLog[];
}

/** Completed streaks with start date, end date, duration and trigger tags. */
export function HistoryList({ logs }: HistoryListProps) {
  const sorted = [...logs].sort((a, b) => Number(b.endedAt - a.endedAt));

  return (
    <section
      data-ocid="history.section"
      aria-label="Streak history"
      className="space-y-4"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          History
        </h2>
        {sorted.length > 0 && (
          <span className="font-mono text-sm text-muted-foreground">
            {sorted.length} {sorted.length === 1 ? "entry" : "entries"}
          </span>
        )}
      </div>

      {sorted.length === 0 ? (
        <div
          data-ocid="history.empty_state"
          className="space-y-3 rounded-3xl bg-card p-8 text-center shadow-elevated"
        >
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/15 text-primary">
            <CalendarDays className="size-6" aria-hidden="true" />
          </span>
          <p className="font-display text-lg font-bold">No history yet</p>
          <p className="text-sm text-muted-foreground">
            Your completed streaks will appear here with their duration and the
            triggers you logged.
          </p>
        </div>
      ) : (
        <ul data-ocid="history.list" className="space-y-4">
          {sorted.map((log, index) => (
            <HistoryEntry key={String(log.id)} log={log} index={index} />
          ))}
        </ul>
      )}
    </section>
  );
}
