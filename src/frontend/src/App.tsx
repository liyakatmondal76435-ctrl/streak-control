import { AuthenticatedApp } from "@/components/InternetIdentity";
import { Layout, ThemeProvider } from "@/components/Layout";
import { DashboardPage } from "@/pages/DashboardPage";
import { SettingsPage } from "@/pages/SettingsPage";
import SosPage from "@/pages/SosPage";
import { StatsPage } from "@/pages/StatsPage";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});

const statsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/stats",
  component: StatsPage,
});

const sosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sos",
  component: SosPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  statsRoute,
  sosRoute,
  settingsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthenticatedApp
        title="Your private streak"
        description="Sign in with Internet Identity to keep your progress private to you."
        buttonClassName="rounded-full bg-gradient-primary px-6 py-3 font-semibold text-primary-foreground shadow-streak transition-smooth hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-95"
      >
        <RouterProvider router={router} />
      </AuthenticatedApp>
    </ThemeProvider>
  );
}
