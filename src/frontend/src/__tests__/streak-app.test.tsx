import App from "@/App";
import type { StreakSummary, backendInterface } from "@/backend";
import { DashboardPage } from "@/pages/DashboardPage";
import SosPage from "@/pages/SosPage";
import { StatsPage } from "@/pages/StatsPage";
import type { InternetIdentityContext } from "@caffeineai/core-infrastructure";
import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { setIdentityForTest } from "./setup";
import { renderWithActor } from "./test-utils";

const DAY_NS = 86_400_000_000_000n;

function summary(overrides: Partial<StreakSummary> = {}): StreakSummary {
  return {
    current: undefined,
    totalCleanSeconds: 0n,
    longestStreakSeconds: 0n,
    milestones: [],
    logs: [],
    checkedInToday: false,
    ...overrides,
  };
}

type ActorMethods = Pick<
  backendInterface,
  "getStreakSummary" | "startStreak" | "checkInToday" | "relapse"
>;

function makeActor(overrides: Partial<ActorMethods> = {}): ActorMethods {
  return {
    getStreakSummary: vi.fn<backendInterface["getStreakSummary"]>(),
    startStreak: vi.fn<backendInterface["startStreak"]>(),
    checkInToday: vi.fn<backendInterface["checkInToday"]>(),
    relapse: vi.fn<backendInterface["relapse"]>(),
    ...overrides,
  };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("DashboardPage", () => {
  it("shows the empty state and starts a streak through the actor", async () => {
    const user = userEvent.setup();
    let current: StreakSummary = summary();
    const actor = makeActor({
      getStreakSummary: vi.fn(async () => structuredClone(current)),
      startStreak: vi.fn(async () => {
        current = summary({ current: { startedAt: 0n } });
        return structuredClone(current);
      }),
    });

    renderWithActor(<DashboardPage />, actor);

    const empty = await screen.findByTestId("dashboard.empty_state");
    expect(empty).toBeInTheDocument();

    await user.click(within(empty).getByTestId("dashboard.start_button"));

    await waitFor(() => expect(actor.startStreak).toHaveBeenCalledTimes(1));
    expect(await screen.findByTestId("dashboard.page")).toBeInTheDocument();
  });

  it("ticks the live counter every second from the stored start time", async () => {
    vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
    const now = Date.now();
    const startedAt = BigInt(now - 3_000) * 1_000_000n;
    const actor = makeActor({
      getStreakSummary: vi.fn(async () => summary({ current: { startedAt } })),
    });

    renderWithActor(<DashboardPage />, actor);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    const counter = await screen.findByTestId("streak.counter");
    expect(
      within(counter).getByTestId("streak.unit.seconds"),
    ).toHaveTextContent("03");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1_000);
    });

    expect(
      within(counter).getByTestId("streak.unit.seconds"),
    ).toHaveTextContent("04");
  });

  it("requires confirmation before resetting and leaves the streak unchanged on cancel", async () => {
    const user = userEvent.setup();
    const actor = makeActor({
      getStreakSummary: vi.fn(async () =>
        summary({ current: { startedAt: 0n } }),
      ),
      relapse: vi.fn(async () => summary({ current: { startedAt: 0n } })),
    });

    renderWithActor(<DashboardPage />, actor);

    await user.click(await screen.findByTestId("dashboard.reset_button"));

    const dialog = await screen.findByTestId("reset.dialog");
    expect(dialog).toBeInTheDocument();
    expect(actor.relapse).not.toHaveBeenCalled();

    await user.click(within(dialog).getByTestId("reset.cancel_button"));

    await waitFor(() =>
      expect(screen.queryByTestId("reset.dialog")).not.toBeInTheDocument(),
    );
    expect(actor.relapse).not.toHaveBeenCalled();
  });

  it("saves the streak to history on a confirmed reset", async () => {
    const user = userEvent.setup();
    const actor = makeActor({
      getStreakSummary: vi.fn(async () =>
        summary({ current: { startedAt: 0n } }),
      ),
      relapse: vi.fn(async () =>
        summary({
          current: { startedAt: 0n },
          logs: [
            {
              id: 0n,
              startedAt: 0n,
              endedAt: DAY_NS,
              durationSeconds: 86_400n,
              triggers: ["stress"],
            },
          ],
        }),
      ),
    });

    renderWithActor(<DashboardPage />, actor);

    await user.click(await screen.findByTestId("dashboard.reset_button"));
    const dialog = await screen.findByTestId("reset.dialog");
    await user.click(within(dialog).getByTestId("reset.confirm_button"));

    await waitFor(() => expect(actor.relapse).toHaveBeenCalledWith([]));
  });

  it("records the triggers selected in the reset dialog", async () => {
    const user = userEvent.setup();
    const actor = makeActor({
      getStreakSummary: vi.fn(async () =>
        summary({ current: { startedAt: 0n } }),
      ),
      relapse: vi.fn(async () => summary({ current: { startedAt: 0n } })),
    });

    renderWithActor(<DashboardPage />, actor);

    await user.click(await screen.findByTestId("dashboard.reset_button"));
    const dialog = await screen.findByTestId("reset.dialog");

    const stress = within(dialog).getByTestId("reset.trigger.stress");
    const boredom = within(dialog).getByTestId("reset.trigger.boredom");
    expect(stress).toHaveAttribute("aria-pressed", "false");

    await user.click(stress);
    expect(stress).toHaveAttribute("aria-pressed", "true");
    await user.click(boredom);
    // Toggling the same trigger off removes it from the selection.
    await user.click(stress);
    expect(stress).toHaveAttribute("aria-pressed", "false");

    await user.click(within(dialog).getByTestId("reset.confirm_button"));

    await waitFor(() =>
      expect(actor.relapse).toHaveBeenCalledWith(["boredom"]),
    );
  });

  it("reflects and persists today's check-in state", async () => {
    const user = userEvent.setup();
    let current: StreakSummary = summary({ current: { startedAt: 0n } });
    const actor = makeActor({
      getStreakSummary: vi.fn(async () => structuredClone(current)),
      checkInToday: vi.fn(async () => {
        current = summary({ current: { startedAt: 0n }, checkedInToday: true });
        return structuredClone(current);
      }),
    });

    renderWithActor(<DashboardPage />, actor);

    const button = await screen.findByTestId("dashboard.checkin_button");
    expect(button).toHaveTextContent("Check in today");

    await user.click(button);

    await waitFor(() => expect(actor.checkInToday).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(screen.getByTestId("dashboard.checkin_button")).toHaveTextContent(
        "Checked in today",
      ),
    );
    expect(
      screen.getByTestId("dashboard.checkin.success_state"),
    ).toBeInTheDocument();
  });

  it("shows an already-checked-in day as disabled on load", async () => {
    const actor = makeActor({
      getStreakSummary: vi.fn(async () =>
        summary({ current: { startedAt: 0n }, checkedInToday: true }),
      ),
    });

    renderWithActor(<DashboardPage />, actor);

    const button = await screen.findByTestId("dashboard.checkin_button");
    expect(button).toHaveTextContent("Checked in today");
    expect(button).toBeDisabled();
    expect(
      screen.getByTestId("dashboard.checkin.success_state"),
    ).toBeInTheDocument();
  });
});

describe("StatsPage", () => {
  it("shows earned and locked milestones plus history entries", async () => {
    const actor = makeActor({
      getStreakSummary: vi.fn(async () =>
        summary({
          totalCleanSeconds: 3n * 86_400n,
          longestStreakSeconds: 2n * 86_400n,
          milestones: [
            { days: 1n, earned: true },
            { days: 3n, earned: false },
          ],
          logs: [
            {
              id: 0n,
              startedAt: 0n,
              endedAt: 2n * DAY_NS,
              durationSeconds: 2n * 86_400n,
              triggers: ["boredom"],
            },
          ],
        }),
      ),
    });

    renderWithActor(<StatsPage />, actor);

    expect(await screen.findByTestId("stats.total_days")).toHaveTextContent(
      "3",
    );

    const earned = await screen.findByTestId("milestones.item.1");
    expect(earned).toHaveAttribute("data-earned", "true");
    const locked = screen.getByTestId("milestones.item.3");
    expect(locked).toHaveAttribute("data-earned", "false");

    const history = screen.getByTestId("history.list");
    expect(within(history).getByText("boredom")).toBeInTheDocument();
  });

  it("shows the history empty state when no streaks are logged", async () => {
    const actor = makeActor({
      getStreakSummary: vi.fn(async () => summary()),
    });

    renderWithActor(<StatsPage />, actor);

    expect(
      await screen.findByTestId("history.empty_state"),
    ).toBeInTheDocument();
  });

  it("fills every milestone threshold and counts the earned ones", async () => {
    const actor = makeActor({
      getStreakSummary: vi.fn(async () =>
        summary({
          longestStreakSeconds: 7n * 86_400n,
          // The backend omits thresholds it does not award; the page must
          // still render the full badge set with the omitted ones locked.
          milestones: [
            { days: 1n, earned: true },
            { days: 3n, earned: true },
            { days: 7n, earned: true },
          ],
        }),
      ),
    });

    renderWithActor(<StatsPage />, actor);

    expect(await screen.findByTestId("milestones.count")).toHaveTextContent(
      "3/8",
    );

    for (const days of [1, 3, 7, 14, 30, 90, 180, 365]) {
      expect(screen.getByTestId(`milestones.item.${days}`)).toBeInTheDocument();
    }
    expect(screen.getByTestId("milestones.item.7")).toHaveAttribute(
      "data-earned",
      "true",
    );
    expect(screen.getByTestId("milestones.item.14")).toHaveAttribute(
      "data-earned",
      "false",
    );
  });
});

describe("SosPage", () => {
  it("starts and stops the breathing exercise", async () => {
    vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    });
    const actor = makeActor();

    renderWithActor(<SosPage />, actor);

    const toggle = await screen.findByTestId("sos.breathing.toggle_button");
    expect(toggle).toHaveTextContent("Start breathing");

    await user.click(toggle);
    expect(toggle).toHaveTextContent("Pause");
    expect(screen.getByTestId("sos.breathing.countdown")).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1_000);
    });

    await user.click(toggle);
    expect(toggle).toHaveTextContent("Resume");
    expect(
      screen.queryByTestId("sos.breathing.countdown"),
    ).not.toBeInTheDocument();
  });

  it("renders the urge-coping tips list", async () => {
    const actor = makeActor();
    renderWithActor(<SosPage />, actor);

    const tips = await screen.findByTestId("sos.tips.list");
    expect(within(tips).getAllByRole("listitem").length).toBeGreaterThan(0);
  });
});

describe("Navigation", () => {
  /** Minimal signed-in identity: the app only reads the principal. */
  function signedInIdentity(): NonNullable<
    InternetIdentityContext["identity"]
  > {
    const principal = {
      isAnonymous: () => false,
      toText: () => "2vxsx-fae",
    };
    return {
      getPrincipal: () => principal,
    } as unknown as NonNullable<InternetIdentityContext["identity"]>;
  }

  it("switches between the three tabs and highlights the active one", async () => {
    const user = userEvent.setup();
    setIdentityForTest({ identity: signedInIdentity() });
    const actor = makeActor({
      getStreakSummary: vi.fn(async () =>
        summary({ current: { startedAt: 0n } }),
      ),
    });

    renderWithActor(<App />, actor);

    const dashboardTab = await screen.findByTestId("nav.dashboard.tab");
    const statsTab = screen.getByTestId("nav.stats.tab");
    const sosTab = screen.getByTestId("nav.sos.tab");

    expect(dashboardTab).toHaveAttribute("aria-current", "page");
    expect(statsTab).not.toHaveAttribute("aria-current");

    await user.click(statsTab);
    expect(await screen.findByTestId("stats.page")).toBeInTheDocument();
    expect(screen.getByTestId("nav.stats.tab")).toHaveAttribute(
      "aria-current",
      "page",
    );

    await user.click(sosTab);
    expect(await screen.findByTestId("sos.page")).toBeInTheDocument();
    expect(screen.getByTestId("nav.sos.tab")).toHaveAttribute(
      "aria-current",
      "page",
    );

    await user.click(screen.getByTestId("nav.dashboard.tab"));
    expect(await screen.findByTestId("dashboard.page")).toBeInTheDocument();
  });
});
