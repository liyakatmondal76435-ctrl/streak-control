import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Loader2 } from "lucide-react";

/** Common relapse triggers the user can tag a reset with. */
export const RELAPSE_TRIGGERS = [
  "stress",
  "boredom",
  "late night",
  "loneliness",
  "social media",
  "tiredness",
] as const;

interface ResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
  isError: boolean;
  /** Triggers currently selected for this reset. */
  selectedTriggers: string[];
  /** Toggle a trigger on or off. */
  onToggleTrigger: (trigger: string) => void;
}

/**
 * Confirmation dialog shown before a streak is reset. The reset only runs
 * after the user explicitly confirms, and any selected triggers are recorded
 * with the completed streak.
 */
export function ResetDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
  isError,
  selectedTriggers,
  onToggleTrigger,
}: ResetDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="reset.dialog"
        className="rounded-[2rem] border-border bg-card"
      >
        <DialogHeader className="gap-3">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/15 text-destructive">
            <AlertTriangle className="size-7" aria-hidden="true" />
          </div>
          <DialogTitle className="text-center font-display text-xl">
            Reset your streak?
          </DialogTitle>
          <DialogDescription className="text-center">
            This ends your current streak, saves it to your history, and starts
            a fresh one right away. This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <fieldset
          data-ocid="reset.triggers.fieldset"
          className="space-y-3 border-0 p-0"
        >
          <legend className="text-sm font-semibold text-foreground">
            What led to this?{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {RELAPSE_TRIGGERS.map((trigger) => {
              const selected = selectedTriggers.includes(trigger);
              return (
                <button
                  key={trigger}
                  type="button"
                  data-ocid={`reset.trigger.${trigger.replace(/\s+/g, "_")}`}
                  aria-pressed={selected}
                  onClick={() => onToggleTrigger(trigger)}
                  disabled={isPending}
                  className={`inline-flex min-h-9 items-center rounded-full border px-4 text-sm font-semibold capitalize transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-secondary text-secondary-foreground hover:bg-secondary/70"
                  }`}
                >
                  {trigger}
                </button>
              );
            })}
          </div>
        </fieldset>

        {isError ? (
          <p
            data-ocid="reset.error_state"
            className="rounded-2xl bg-destructive/10 px-4 py-3 text-center text-sm text-destructive"
          >
            Something went wrong. Your streak is unchanged — please try again.
          </p>
        ) : null}

        <DialogFooter className="mt-2 gap-2 sm:flex-col">
          <button
            type="button"
            data-ocid="reset.confirm_button"
            onClick={onConfirm}
            disabled={isPending}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-destructive px-6 font-semibold text-destructive-foreground transition-smooth hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            {isPending ? "Resetting…" : "Yes, reset my streak"}
          </button>
          <button
            type="button"
            data-ocid="reset.cancel_button"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-secondary px-6 font-semibold text-secondary-foreground transition-smooth hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Keep my streak
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
