import { cn } from "@/lib/utils";
import { Check, Lock } from "lucide-react";

export interface MilestoneBadge {
  days: number;
  earned: boolean;
}

interface MilestoneBadgesProps {
  milestones: MilestoneBadge[];
  className?: string;
}

/** Human label for a milestone threshold, e.g. 1 → "1 day", 30 → "30 days". */
function milestoneLabel(days: number): string {
  return `${days} ${days === 1 ? "day" : "days"}`;
}

/**
 * Milestone badges shown as earned or locked based on the longest streak
 * the caller has reached. Earned badges glow emerald; locked badges stay muted.
 */
export function MilestoneBadges({
  milestones,
  className,
}: MilestoneBadgesProps) {
  const earnedCount = milestones.filter((m) => m.earned).length;

  return (
    <section
      data-ocid="milestones.section"
      aria-label="Milestone badges"
      className={cn("space-y-4", className)}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Milestones
        </h2>
        <span
          data-ocid="milestones.count"
          className="font-mono text-sm text-muted-foreground"
        >
          {earnedCount}/{milestones.length}
        </span>
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {milestones.map((milestone) => (
          <li key={milestone.days}>
            <div
              data-ocid={`milestones.item.${milestone.days}`}
              data-earned={milestone.earned}
              className={cn(
                "flex h-full flex-col items-center justify-center gap-2 rounded-3xl px-3 py-5 text-center transition-smooth",
                milestone.earned
                  ? "bg-primary/15 text-primary shadow-streak"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "flex size-11 items-center justify-center rounded-full",
                  milestone.earned
                    ? "bg-primary text-primary-foreground"
                    : "bg-background/60 text-muted-foreground",
                )}
                aria-hidden="true"
              >
                {milestone.earned ? (
                  <Check className="size-5" />
                ) : (
                  <Lock className="size-5" />
                )}
              </span>
              <span className="font-display text-lg font-bold tracking-tight">
                {milestone.days}
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest">
                {milestone.earned ? "Earned" : "Locked"}
              </span>
              <span className="sr-only">
                {milestoneLabel(milestone.days)} milestone,{" "}
                {milestone.earned ? "earned" : "locked"}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
