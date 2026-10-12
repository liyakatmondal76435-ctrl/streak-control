import { cn } from "@/lib/utils";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type Phase = "inhale" | "hold" | "exhale";

interface PhaseConfig {
  phase: Phase;
  label: string;
  hint: string;
  duration: number;
}

const CYCLE: PhaseConfig[] = [
  {
    phase: "inhale",
    label: "Breathe in",
    hint: "Slowly fill your lungs",
    duration: 4,
  },
  { phase: "hold", label: "Hold", hint: "Stay steady", duration: 4 },
  {
    phase: "exhale",
    label: "Breathe out",
    hint: "Let the urge leave you",
    duration: 6,
  },
];

const CYCLE_SECONDS = CYCLE.reduce((total, step) => total + step.duration, 0);

const PHASE_STYLES: Record<Phase, string> = {
  inhale: "scale-100",
  hold: "scale-100",
  exhale: "scale-[0.62]",
};

function phaseAt(elapsed: number): { config: PhaseConfig; remaining: number } {
  const position = elapsed % CYCLE_SECONDS;
  let cursor = 0;
  for (const config of CYCLE) {
    if (position < cursor + config.duration) {
      return { config, remaining: cursor + config.duration - position };
    }
    cursor += config.duration;
  }
  return { config: CYCLE[0], remaining: CYCLE[0].duration };
}

export function BreathingCircle() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [cycles, setCycles] = useState(0);
  const elapsedRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => {
      elapsedRef.current += 1;
      setElapsed(elapsedRef.current);
      setCycles(Math.floor(elapsedRef.current / CYCLE_SECONDS));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [running]);

  const { config, remaining } = useMemo(() => phaseAt(elapsed), [elapsed]);

  const handleToggle = () => {
    if (running) {
      setRunning(false);
      return;
    }
    if (elapsedRef.current === 0) {
      elapsedRef.current = 0;
      setElapsed(0);
      setCycles(0);
    }
    setRunning(true);
  };

  const handleReset = () => {
    setRunning(false);
    elapsedRef.current = 0;
    setElapsed(0);
    setCycles(0);
  };

  const started = elapsed > 0;

  return (
    <section
      data-ocid="sos.breathing.section"
      aria-label="Guided breathing exercise"
      className="flex flex-col items-center gap-6 rounded-[2rem] bg-card p-6 shadow-elevated"
    >
      <div className="flex flex-col items-center gap-1 text-center">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Urge breaker
        </h2>
        <p className="text-sm text-muted-foreground">
          Follow the circle. Inhale 4, hold 4, exhale 6.
        </p>
      </div>

      <div className="relative flex size-64 items-center justify-center">
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-0 rounded-full bg-gradient-primary opacity-20 blur-2xl transition-transform duration-1000 ease-in-out",
            running ? PHASE_STYLES[config.phase] : "scale-90",
          )}
        />
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-6 rounded-full border border-primary/30 bg-primary/10 transition-transform duration-1000 ease-in-out",
            running ? PHASE_STYLES[config.phase] : "scale-90",
          )}
        />
        <div
          data-ocid="sos.breathing.phase"
          className="relative z-10 flex flex-col items-center gap-1 text-center"
        >
          <span className="font-display text-2xl font-bold tracking-tight text-primary">
            {running ? config.label : "Ready"}
          </span>
          <span className="text-sm text-muted-foreground">
            {running ? config.hint : "Press start when the urge hits"}
          </span>
          {running ? (
            <span
              data-ocid="sos.breathing.countdown"
              className="font-mono text-4xl font-bold tabular-nums"
            >
              {remaining}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-3">
        <button
          type="button"
          data-ocid="sos.breathing.toggle_button"
          onClick={handleToggle}
          aria-pressed={running}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-primary px-6 py-3 font-semibold text-primary-foreground shadow-streak transition-smooth hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
        >
          {running ? (
            <Pause className="size-5" aria-hidden="true" />
          ) : (
            <Play className="size-5" aria-hidden="true" />
          )}
          {running ? "Pause" : started ? "Resume" : "Start breathing"}
        </button>

        {started ? (
          <div className="flex w-full items-center justify-between gap-3">
            <span
              data-ocid="sos.breathing.cycles"
              className="text-sm text-muted-foreground"
            >
              {cycles} {cycles === 1 ? "cycle" : "cycles"} complete
            </span>
            <button
              type="button"
              data-ocid="sos.breathing.reset_button"
              onClick={handleReset}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-secondary px-5 py-2 text-sm font-semibold text-secondary-foreground transition-smooth hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
