import App from "@/App";
import type { backendInterface } from "@/backend";
import type { InternetIdentityContext } from "@caffeineai/core-infrastructure";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { setIdentityForTest } from "./setup";
import { renderWithActor } from "./test-utils";

const STORAGE_KEY = "forest-discipline-theme";

type ActorMethods = Pick<backendInterface, "getStreakSummary">;

function makeActor(overrides: Partial<ActorMethods> = {}): ActorMethods {
  return {
    getStreakSummary: vi.fn(async () => ({
      current: { startedAt: 0n },
      totalCleanSeconds: 0n,
      longestStreakSeconds: 0n,
      milestones: [],
      logs: [],
      checkedInToday: false,
    })),
    ...overrides,
  };
}

/** Minimal signed-in identity: the app only reads the principal. */
function signedInIdentity(): NonNullable<InternetIdentityContext["identity"]> {
  const principal = {
    isAnonymous: () => false,
    toText: () => "2vxsx-fae",
  };
  return {
    getPrincipal: () => principal,
  } as unknown as NonNullable<InternetIdentityContext["identity"]>;
}

async function renderApp() {
  setIdentityForTest({ identity: signedInIdentity() });
  renderWithActor(<App />, makeActor());
  await screen.findByTestId("dashboard.page");
}

describe("Layout header", () => {
  it("renders the app title and the theme toggle in the header", async () => {
    await renderApp();

    expect(screen.getByText("Forest Discipline")).toBeInTheDocument();
    expect(screen.getByTestId("theme.toggle")).toBeInTheDocument();
  });

  it("toggles the theme and persists the choice", async () => {
    const user = userEvent.setup();
    await renderApp();

    const toggle = screen.getByTestId("theme.toggle");
    // The jsdom matchMedia mock reports light, so the app starts light.
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(toggle).toHaveAccessibleName("Switch to dark mode");

    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(toggle).toHaveAccessibleName("Switch to light mode");
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("dark");
  });

  it("keeps the header and all three tabs visible on the dashboard route", async () => {
    await renderApp();

    expect(screen.getByText("Forest Discipline")).toBeInTheDocument();
    expect(screen.getByTestId("theme.toggle")).toBeInTheDocument();
    expect(screen.getByTestId("nav.dashboard.tab")).toBeInTheDocument();
    expect(screen.getByTestId("nav.stats.tab")).toBeInTheDocument();
    expect(screen.getByTestId("nav.sos.tab")).toBeInTheDocument();
  });

  it("renders the header on the stats route", async () => {
    const user = userEvent.setup();
    await renderApp();

    await user.click(screen.getByTestId("nav.stats.tab"));

    await screen.findByTestId("stats.page");
    expect(screen.getByText("Forest Discipline")).toBeInTheDocument();
    expect(screen.getByTestId("theme.toggle")).toBeInTheDocument();
  });
});
