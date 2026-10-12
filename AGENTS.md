# Project Guidance

## User Preferences

- Expressive shapes with extra-large and large corner radii on cards
- Dynamic colors and high-contrast containers
- Scale/pulse animation on the main streak counter
- Animated visibility for buttons and stats
- Clean, distraction-free, private UI
- Dark mode support

## Verified Commands

- **typecheck**: `mops check --fix`
- **build**: `mops build`

## Learnings

- Frontend verified commands from src/frontend/: pnpm install --prefer-offline, pnpm typecheck, pnpm fix, pnpm build.
- Backend verified commands from src/backend/: mops install, mops check --fix, mops build; pnpm bindgen from root.
- The app is 'Forest Discipline': three routes (/, /stats, /sos) in src/frontend/src/App.tsx, Layout with bottom navigation and theme toggle in src/frontend/src/components/Layout.tsx, React Query hooks in src/frontend/src/hooks/useQueries.ts, shared types in src/frontend/src/types/index.ts.
- The backend main.mo exports getStreakSummary, startStreak, checkInToday, relapse, getApiDoc with a per-user states map and an OQL streakState entity; the migration 00000000_000000.mo initializes accessControlState and states.
- A mutation's returned summary written via queryClient.setQueryData under the query's own key flips the UI immediately and survives reload once the backend persists the flag.
- An OQL Entity.manual sample record must be annotated to the exact stored type; an unannotated record infers Null/[None] and fails M0096.
- The tester owns src/frontend/src/__tests__/streak-app.test.tsx and test/pocketic/backend.test.ts; leave them alone even when a change makes them fail to compile.
- The app is 'Forest Discipline': routes (/, /stats, /sos, /settings) in src/frontend/src/App.tsx; Layout with sticky header (title + settings icon + ThemeToggle) and BottomNav in src/frontend/src/components/Layout.tsx.
- SettingsPage consumes useTheme from Layout, so it must render inside ThemeProvider (already wrapping the router in App.tsx).
- The tester owns src/frontend/src/__tests__/ and test/pocketic/; leave them alone even when a change makes them fail to compile.
