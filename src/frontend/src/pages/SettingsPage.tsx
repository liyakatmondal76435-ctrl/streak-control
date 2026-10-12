import { useTheme } from "@/components/Layout";
import { Moon, Sun } from "lucide-react";

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section
      data-ocid="settings.page"
      aria-label="Settings"
      className="space-y-8"
    >
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Tune how Forest Discipline looks and feels. Your choices stay on this
          device.
        </p>
      </header>

      <div
        data-ocid="settings.appearance.card"
        className="rounded-3xl bg-card p-6 shadow-elevated"
      >
        <h2 className="font-display text-lg font-bold tracking-tight">
          Appearance
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Switch between a bright daylight theme and a low-light theme for
          late-night check-ins.
        </p>
        <button
          type="button"
          data-ocid="settings.theme.toggle"
          aria-pressed={isDark}
          onClick={toggleTheme}
          className="mt-5 inline-flex min-h-14 w-full items-center justify-between gap-3 rounded-full bg-secondary px-6 font-semibold text-secondary-foreground transition-smooth hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
        >
          <span className="flex items-center gap-3">
            {isDark ? (
              <Moon className="size-5" aria-hidden="true" />
            ) : (
              <Sun className="size-5" aria-hidden="true" />
            )}
            {isDark ? "Dark mode" : "Light mode"}
          </span>
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {isDark ? "On" : "Off"}
          </span>
        </button>
      </div>

      <div
        data-ocid="settings.privacy.card"
        className="rounded-3xl bg-card p-6 shadow-elevated"
      >
        <h2 className="font-display text-lg font-bold tracking-tight">
          Privacy
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your streak, check-ins, and history are tied to your Internet Identity
          and are never shared. Only you can see them.
        </p>
      </div>
    </section>
  );
}
