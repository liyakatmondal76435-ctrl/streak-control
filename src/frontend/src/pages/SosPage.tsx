import { BreathingCircle } from "@/components/BreathingCircle";
import { Lightbulb, Quote } from "lucide-react";
import { useEffect, useState } from "react";

const QUOTES = [
  "This feeling is a wave. It rises, peaks, and always falls.",
  "You are not your urge. You are the one watching it pass.",
  "Every minute you breathe through is a minute you win back.",
  "Discomfort is temporary. The choice you make now is not.",
  "You have survived every urge before this one.",
  "Calm is not the absence of the urge — it is how you meet it.",
];

const TIPS = [
  "Splash cold water on your face to reset your nervous system.",
  "Change rooms — move away from whatever is pulling at you.",
  "Text someone you trust and say what is happening.",
  "Drink a full glass of water, slowly.",
  "Do 20 push-ups or hold a wall sit until it burns.",
  "Put your phone in another room for 10 minutes.",
];

const QUOTE_INTERVAL_MS = 8000;

export default function SosPage() {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setQuoteIndex((current) => (current + 1) % QUOTES.length);
    }, QUOTE_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section
      data-ocid="sos.page"
      aria-label="SOS urge breaker"
      className="space-y-6"
    >
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-tight">SOS</h1>
        <p className="text-muted-foreground">
          Ride out the urge. Breathe, read, and let it pass.
        </p>
      </header>

      <BreathingCircle />

      <figure
        data-ocid="sos.quote.card"
        className="animate-rise rounded-3xl bg-card p-6 shadow-elevated"
      >
        <Quote className="mb-3 size-6 text-accent" aria-hidden="true" />
        <blockquote
          key={quoteIndex}
          data-ocid="sos.quote.text"
          className="animate-rise font-display text-xl font-semibold leading-snug tracking-tight"
        >
          {QUOTES[quoteIndex]}
        </blockquote>
      </figure>

      <div
        data-ocid="sos.tips.card"
        className="rounded-3xl bg-card p-6 shadow-elevated"
      >
        <div className="mb-4 flex items-center gap-2">
          <Lightbulb className="size-5 text-accent" aria-hidden="true" />
          <h2 className="font-display text-lg font-bold tracking-tight">
            Coping tips
          </h2>
        </div>
        <ul data-ocid="sos.tips.list" className="space-y-3">
          {TIPS.map((tip, index) => (
            <li
              key={tip}
              data-ocid={`sos.tips.item.${index + 1}`}
              className="flex items-start gap-3 rounded-2xl bg-secondary px-4 py-3 text-sm text-secondary-foreground"
            >
              <span
                aria-hidden="true"
                className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-xs font-bold text-primary"
              >
                {index + 1}
              </span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
