import App from "@/App";
import type { backendInterface } from "@/backend";
import type { InternetIdentityContext } from "@caffeineai/core-infrastructure";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { setIdentityForTest } from "./setup";
import { renderWithActor } from "./test-utils";

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
  // The router keeps its location across tests in this file, so return to the
  // dashboard explicitly before asserting on the default route.
  const dashboardTab = await screen.findByTestId("nav.dashboard.tab");
  if (dashboardTab.getAttribute("aria-current") !== "page") {
    await userEvent.setup().click(dashboardTab);
  }
  await screen.findByTestId("dashboard.page");
}

describe("Settings", () => {
  it("shows a settings icon in the header on the default route", async () => {
    await renderApp();

    const link = screen.getByTestId("settings.link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAccessibleName("Open settings");
  });

  it("opens the settings page when the header icon is clicked", async () => {
    const user = userEvent.setup();
    await renderApp();

    await user.click(screen.getByTestId("settings.link"));

    const page = await screen.findByTestId("settings.page");
    expect(page).toBeInTheDocument();
    expect(page).toHaveAccessibleName("Settings");
    expect(
      screen.getByRole("heading", { name: "Settings" }),
    ).toBeInTheDocument();
  });

  it("keeps the header and bottom navigation on the settings page", async () => {
    const user = userEvent.setup();
    await renderApp();

    await user.click(screen.getByTestId("settings.link"));
    await screen.findByTestId("settings.page");

    expect(screen.getByText("Forest Discipline")).toBeInTheDocument();
    expect(screen.getByTestId("theme.toggle")).toBeInTheDocument();
    expect(screen.getByTestId("nav.dashboard.tab")).toBeInTheDocument();
    expect(screen.getByTestId("nav.stats.tab")).toBeInTheDocument();
    expect(screen.getByTestId("nav.sos.tab")).toBeInTheDocument();
  });

  it("toggles the theme from the settings page", async () => {
    const user = userEvent.setup();
    await renderApp();

    await user.click(screen.getByTestId("settings.link"));
    await screen.findByTestId("settings.page");

    const toggle = screen.getByTestId("settings.theme.toggle");
    // The jsdom matchMedia mock reports light, so the app starts light.
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(window.localStorage.getItem("forest-discipline-theme")).toBe("dark");
  });

  it("navigates back to the dashboard from the settings page", async () => {
    const user = userEvent.setup();
    await renderApp();

    await user.click(screen.getByTestId("settings.link"));
    await screen.findByTestId("settings.page");

    await user.click(screen.getByTestId("nav.dashboard.tab"));

    expect(await screen.findByTestId("dashboard.page")).toBeInTheDocument();
  });
});
