# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**My Car Diary** — Android-first vehicle maintenance tracker built with Expo + TypeScript. See `README.md` for the product feature list (mileage tracking, service reminders, maintenance/fuel records, intervals, expense tracking).

UI language is currently **English only**, but i18n is wired through `src/i18n/` so adding locales later is mechanical.

## Stack

- **Expo SDK 54** (managed workflow), React Native 0.81, React 19, New Architecture enabled
- **TypeScript strict** (`tsconfig.json` extends `expo/tsconfig.base`)
- **expo-router 6** with **typed routes** (file-based, anchor `(tabs)`)
- **react-native-paper** (Material 3) — `PaperProvider` mounted in `app/_layout.tsx`
- Android package: `com.sergiostefanizzi.mycardiary`, `minSdkVersion: 26` (set via `expo-build-properties` plugin in `app.json`)

Persistence (Drizzle + expo-sqlite), state (Zustand), notifications, and form/validation libs land in later milestones — not yet installed.

## Commands

```bash
npm run start         # Expo dev server
npm run android       # Build & launch on connected Android device/emulator
npm run typecheck     # tsc --noEmit
npm run lint          # expo lint (eslint-config-expo + eslint-config-prettier)
npm run format        # prettier --write across ts/tsx/js/json/md
npm run format:check  # prettier --check (CI-friendly)
npm run reset-project # Expo template's "blank slate" script — DO NOT run, it moves app/ to app-example/
```

There are no tests yet. When tests are added, prefer the milestone in which they land rather than retrofitting.

## Architecture

```
app/                     # expo-router routes (file = route)
  _layout.tsx            # Root: SafeAreaProvider > PaperProvider > Stack
  (tabs)/_layout.tsx     # Tab bar: Dashboard / History / Reminders / Stats
  (tabs)/index.tsx       # Dashboard (placeholder in M1)
  modal.tsx              # Default modal route from template

src/                     # All non-route code lives here
  db/                    # Drizzle schema + SQLite client (M2+)
  repositories/          # CRUD + queries — only place that touches db/
  services/              # Domain logic: reminderEngine, notifications
  stores/                # Zustand stores (currentVehicle, settings)
  hooks/                 # React hooks built on repositories
  components/            # Shared UI
  i18n/                  # en.ts dictionary + type-safe t(key) helper
  theme/                 # Paper MD3 light/dark themes
  utils/                 # Formatters

components/, hooks/, constants/  # From Expo template (themed-text, color-scheme hook, etc.).
                                  # Prefer adding new code under src/. Template files may be pruned later.
assets/                  # Icons, splash images
```

**Path alias**: `@/*` resolves to repo root (see `tsconfig.json`). Use `@/src/...` for our code, `@/components/...` for the template's leftovers.

### Layered data flow (target shape)

```
screen (app/**)  →  hook (src/hooks)  →  repository (src/repositories)  →  Drizzle  →  SQLite
                  ↘  zustand store (src/stores) for cross-screen UI state
service (src/services)  ←  scheduled work (reminder engine, notifications)
```

Screens never call Drizzle directly. Repositories never import from `app/` or `components/`.

### i18n

`src/i18n/index.ts` exports `t(key)` with a recursively-typed `TranslationKey` derived from `en.ts` — adding a key in `en.ts` immediately makes it autocompletable. Calling `t('foo.bar')` with a key that doesn't exist is a compile error. Don't hardcode user-facing strings; add them to `en.ts`.

### Theme

`src/theme/index.ts` exports `lightTheme`/`darkTheme` (Paper MD3). The root layout passes one to `PaperProvider` based on `useColorScheme()`. Do not introduce a second theme system — extend these.

## Development workflow

The project is built **milestone-by-milestone**. Roadmap (high-level, may evolve):

- **M1** ✅ Bootstrap (this commit): Expo + Paper + i18n + tabs
- **M2** DB + Vehicles (Drizzle schema, multi-vehicle CRUD, current-vehicle store)
- **M3** Maintenance records (CRUD, type picker, history list)
- **M4** Fuel + stats
- **M5** Intervals + reminders + local notifications
- **M6** Settings, backup/restore JSON, EAS Android build

Between milestones the user commits and pushes manually — do not auto-commit. Finish the milestone, summarize, then stop and wait for approval before starting the next one.

## Notes

- `predictiveBackGestureEnabled: false` in `app.json` is intentional (Expo template default) — flip it deliberately if/when gesture nav is wanted.
- `reactCompiler: true` is enabled — avoid manual `useMemo`/`useCallback` micro-optimizations; the compiler handles it.
- `newArchEnabled: true` — any third-party native lib added must support the New Architecture (Fabric/TurboModules).
