# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite HMR)
npm run build     # Type-check + build for production
npm run lint      # Run ESLint
npm run preview   # Preview production build locally
```

No test framework is configured in this project.

## Architecture Overview

This is an F1 race predictions web app using **React 19 + TypeScript + Vite**, **Supabase** (auth + database), **React Router v7**, and **Bootstrap 5**.

### Auth & Session Flow

- `src/supabase-client.ts` — exports the single `supabase` client instance used everywhere.
- `src/App.tsx` — listens to `supabase.auth.onAuthStateChange` and conditionally renders either `<SignIn />` or the authenticated route tree.
- `src/AuthContext.tsx` — provides `{ account, setAccount }` via React context. On mount it fetches the Supabase session and constructs the appropriate class instance based on `profile.role`. Wrap components with `useAuth()` to access the current account.

### Role-Based Class Hierarchy

Users have one of three roles stored in the `Account` Supabase table. Each maps to a TypeScript class:

```
Account (base)        — userId, email, name, role
├── Player            — leagueId, totalPoints, gainedPoints
├── Organizer         — leagueId, leagueName, players[]
└── Admin             — currentRaceNum (extends Account directly)
```

Classes live in `src/classes/`. The `account` object from `useAuth()` is one of these instances; call getters like `account.getRole()`, `account.getLeagueId()`, etc. to read data.

### Routes & Pages

| Route | Component | Who sees it |
|---|---|---|
| `/` | `Home` | All authenticated |
| `/league` | `League` | Players & Organizers |
| `/league/join` | `JoinLeague` | Players not in a league |
| `/prediction` | `Prediction` | Players in a league |
| `/prediction/make` | `MakePrediction` | Players in a league |
| `/result` | `Result` | Admins only |

### Supabase Database Tables

| Table | Purpose |
|---|---|
| `Account` | Base user record (userId, email, name, role) |
| `Player` | Player-specific data (leagueId, totalPoints, gainedPoints) |
| `Organizer` | Organizer + league info (leagueId auto-generated, leagueName, currentRaceNumber) |
| `Driver` | F1 drivers (driverId, name, points) |
| `Team` | F1 teams (name, driverIdA, driverIdB, points) |
| `driversRace` | Per-race driver order predictions (userId, raceNumber, position, driverName) |
| `leaderboard` | Ranked view per league (leagueId, userId, position, name, totalPoints, gainedPoints) |
| `players` | Junction table (leagueId, playerId) |
| `CurrentRaceNum` | Singleton row (id=1, currentRaceNum) tracking the active race |

### Scoring Logic (`Result.tsx`)

The admin uses `/result` to submit the actual race finishing order. On submit:
1. `scorePoints()` — iterates through each driver's position; awards 4 pts (exact), 2 pts (±1 position), 1 pt (±2 positions) by comparing against `driversRace` predictions.
2. `updateLeaderboard()` — re-ranks all leagues using insertion sort via the recursive `placePlayer()` helper.

### One-Time Setup Functions

- `src/functions/loadDatabase.ts` — seeds the F1 2025 driver and team lineup into Supabase. Called once on app mount in `App.tsx` (guarded by `useRef` to prevent double-run in strict mode).
- `src/functions/loadAdmin.ts` — creates the admin account in Supabase. Called manually during initial setup.
