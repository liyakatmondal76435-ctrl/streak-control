import { elapsedSeconds, splitDuration } from "@/types";
import { useEffect, useState } from "react";

interface StreakCounterProps {
  /** Nanosecond timestamp when the current streak began. */
  startedAt: bigint;
}

const UNITS = ["days", "hours", "minutes", "seconds"] as const;

/**
 * Live clean-streak counter that ticks every second from the stored start time.
 */
export function StreakCounter({ startedAt }: StreakCounterProps) {
  const [seconds, setSeconds] = useState(() => elapsedSeconds(startedAt));

  useEffect(() => {
    setSeconds(elapsedSeconds(startedAt));
    const interval = window.setInterval(() => {
      setSeconds(elapsedSeconds(startedAt));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [startedAt]);

  const parts = splitDuration(seconds);

  return (
    <div
      data-ocid="streak.counter"
      className="animate-streak-pulse rounded-[2.5rem] bg-gradient-primary p-1 shadow-streak"
    >
      <div className="rounded-[2.25rem] bg-card/95 px-6 py-8">
        <p className="text-center font-display text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Clean for
        </p>
        <div className="mt-5 grid grid-cols-4 gap-2">
          {UNITS.map((unit) => (
            <div
              key={unit}
              data-ocid={`streak.unit.${unit}`}
              className="flex flex-col items-center gap-1 rounded-3xl bg-secondary/70 px-1 py-3"
            >
              <span className="font-mono text-2xl font-bold tabular-nums text-primary sm:text-3xl">
                {String(parts[unit]).padStart(2, "0")}
              </span>
              <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                {unit}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
