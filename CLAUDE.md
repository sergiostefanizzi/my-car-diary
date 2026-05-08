# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**My Car Diary** — Android-first vehicle maintenance tracker built with Expo + TypeScript. See `README.md` for the product feature list (mileage tracking, service reminders, maintenance/fuel records, intervals, expense tracking).

UI language is currently **English only**, but i18n is wired through `src/i18n/` so adding locales later is mechanical.

## Stack

- **Expo SDK 54** (managed workflow), React Native 0.81, React 19, New Architecture enabled
- **TypeScript strict** (`tsconfig.json` extends `expo/tsconfig.base`)
- **expo-router 6** (file-based, anchor `(tabs)`). `experiments.typedRoutes` is currently **off** — re-enable once the route surface is stable (planned for M6).
- **react-native-paper** (Material 3) — `PaperProvider` mounted in `app/_layout.tsx`
- **Drizzle ORM** on **expo-sqlite** — schema in `src/db/schema.ts`, migrations generated with `drizzle-kit` into `src/db/migrations/`, applied at app boot via `useDbMigrations()` in the root layout
- **Zustand** (with `persist` + AsyncStorage) for cross-screen UI state
- **react-hook-form + zod** for forms and validation
- **@react-native-community/datetimepicker** (Android native dialog, opened imperatively via `DateTimePickerAndroid.open`)
- Android package: `com.sergiostefanizzi.mycardiary`, `minSdkVersion: 26` (set via `expo-build-properties` plugin in `app.json`)

Notifications, fuel-specific UI, reminders, and backup/restore land in later milestones — not yet installed.

## Commands

```bash
npm run start         # Expo dev server
npm run android       # Build & launch on connected Android device/emulator
npm run typecheck     # tsc --noEmit
npm run lint          # expo lint (eslint-config-expo + eslint-config-prettier)
npm run format        # prettier --write across ts/tsx/js/json/md
npm run format:check  # prettier --check (CI-friendly)
npm run reset-project # Expo template's "blank slate" script — DO NOT run, it moves app/ to app-example/

# Drizzle:
npx drizzle-kit generate   # diff schema.ts against last snapshot, emit a new SQL migration + update migrations.js
```

After editing `babel.config.js`, `metro.config.js`, `app.json` plugins, or generating a new migration, restart Metro with `npx expo start --clear`.

There are no tests yet. When tests are added, prefer the milestone in which they land rather than retrofitting.

## Architecture

```
app/                     # expo-router routes (file = route)
  _layout.tsx            # Root: SafeAreaProvider > PaperProvider > useDbMigrations gate > <CurrentVehicleSync /> + <Stack>
  (tabs)/_layout.tsx     # Tab bar: Dashboard / History / Reminders / Stats
  (tabs)/index.tsx       # Dashboard
  (tabs)/history.tsx     # Filterable record history (chips + month grouping)
  vehicles/              # Vehicles list, new, [id]/edit
  records/               # Records new, [id], [id]/edit
  modal.tsx              # Default modal route from template

src/                     # All non-route code lives here
  db/                    # schema.ts (vehicles, maintenance_records), client.ts, useDbMigrations.ts, migrations/
  repositories/          # vehicleRepo, recordRepo — only place that touches db/
  services/              # Domain logic: reminderEngine, notifications (M5)
  stores/                # Zustand stores (currentVehicle persisted via AsyncStorage)
  hooks/                 # useVehicles, useVehicle, useCurrentVehicle, useRecords, useRecord
  components/            # VehicleForm, RecordForm, CurrentVehicleSync
  i18n/                  # en.ts dictionary + type-safe t(key) helper
  theme/                 # Paper MD3 light/dark themes
  utils/                 # date.ts (ISO date helpers), recordType.ts (icon map)

components/, hooks/, constants/  # From Expo template (themed-text, color-scheme hook, etc.).
                                  # Prefer adding new code under src/. Template files may be pruned later.
assets/                  # Icons, splash images
```

**Path alias**: `@/*` resolves to repo root (see `tsconfig.json`). Use `@/src/...` for our code, `@/components/...` for the template's leftovers.

### Layered data flow

```
screen (app/**)  →  hook (src/hooks, useLiveQuery)  →  Drizzle  →  SQLite
                  ↘  zustand store (src/stores) for cross-screen UI state
                  ↘  repository (src/repositories) for writes (create/update/delete)
service (src/services)  ←  scheduled work (reminder engine, notifications) [M5]
```

Hooks use `useLiveQuery` from `drizzle-orm/expo-sqlite` for reactive reads. Writes go through repositories. Screens never call Drizzle directly. Repositories never import from `app/` or `components/`.

### Current-vehicle selection

`useCurrentVehicle()` is **read-only**: it returns the vehicle pointed to by `currentVehicleId` in the Zustand store. The auto-selection logic (pick first vehicle if none selected, clear if deleted) lives in a single `<CurrentVehicleSync />` component mounted once in the root layout. **Do not** add `useEffect`-based auto-selection inside `useCurrentVehicle` — `useLiveQuery` returns a fresh array reference each tick and consumer-side effects depending on it caused infinite update loops. The sync component depends on a stable `idsKey` string built from row IDs to avoid this.

### Migrations

`drizzle.config.ts` writes generated SQL into `src/db/migrations/` plus a `migrations.js` index. The babel plugin `babel-plugin-inline-import` (configured in `babel.config.js` with extension `.sql`) inlines the SQL files at bundle time, and Metro's `sourceExts` is extended in `metro.config.js` to include `sql`. After adding/changing tables in `schema.ts`, run `npx drizzle-kit generate` to create the next ordered migration; on next app launch `useDbMigrations` applies whatever's missing. Do not edit existing migration SQL by hand — generate a new one.

### i18n

`src/i18n/index.ts` exports `t(key)` with a recursively-typed `TranslationKey` derived from `en.ts` — adding a key in `en.ts` immediately makes it autocompletable. Calling `t('foo.bar')` with a key that doesn't exist is a compile error. Don't hardcode user-facing strings; add them to `en.ts`. For dynamically-built keys (e.g. `t(\`records.types.\${type}\`)`), cast the key as `TranslationKey`.

### Theme

`src/theme/index.ts` exports `lightTheme`/`darkTheme` (Paper MD3). The root layout passes one to `PaperProvider` based on `useColorScheme()`. Do not introduce a second theme system — extend these.

## Development workflow

The project is built **milestone-by-milestone**. Roadmap:

- **M1** ✅ Bootstrap: Expo + Paper + i18n + tabs
- **M2** ✅ DB + Vehicles: Drizzle schema, multi-vehicle CRUD, current-vehicle store
- **M3** ✅ Maintenance records: CRUD, type picker, filterable history, dashboard recents
- **M4** Fuel + stats (fuel entries table, consumption math, stats screen)
- **M5** Intervals + reminders + local notifications (`expo-notifications`, reminder engine)
- **M6** Settings, backup/restore JSON, re-enable typed routes, EAS Android build

Between milestones the user commits and pushes manually — do not auto-commit. Finish the milestone, summarize, then stop and wait for approval before starting the next one. When asking the user to test, always include explicit Expo CLI commands (e.g. `npx expo start --clear`, `npm run android`) — and add `--clear` whenever babel/metro/plugin config or DB schema changed.

## Notes

- `predictiveBackGestureEnabled: false` in `app.json` is intentional (Expo template default) — flip it deliberately if/when gesture nav is wanted.
- `reactCompiler: true` is enabled — avoid manual `useMemo`/`useCallback` micro-optimizations; the compiler handles it.
- `newArchEnabled: true` — any third-party native lib added must support the New Architecture (Fabric/TurboModules).
- `expo-sqlite` is opened with `enableChangeListener: true` so `useLiveQuery` updates reactively after writes.
- `@react-native-community/datetimepicker` and `expo-sqlite` are both bundled in Expo Go, so `prebuild` is **not** required for current milestones; it'll be needed when `expo-notifications` lands in M5 or for EAS release builds in M6.
