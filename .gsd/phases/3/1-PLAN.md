---
phase: 3
plan: 1
wave: 1
---

# Plan 3.1: Database Seeding & Data Service Layer

## Objective
Seed the Supabase database with real route, bus, and schedule data so the frontend has actual records to query. Create a typed data service layer (`src/services/routeService.ts`) that abstracts all Supabase queries for routes, buses, and schedules, replacing the mock `generateBusResults()` function.

## Context
- .gsd/SPEC.md
- .gsd/ARCHITECTURE.md
- src/data/mockData.ts (current mock data — the source of truth for seed values)
- src/types/database.ts (typed Supabase schema)
- src/lib/supabase.ts (Supabase client)
- supabase/schema.sql (DB schema — routes, buses, schedules, seats tables)

## Tasks

<task type="auto">
  <name>Create seed SQL script</name>
  <files>supabase/seed.sql</files>
  <action>
    Create `supabase/seed.sql` with INSERT statements to populate:
    1. **routes** — 8 popular routes matching mockData.ts (Dhaka→Chattogram, Dhaka→Cox's Bazar, etc.) with real distances, durations, and base fares
    2. **buses** — 4 bus types (Starline Platinum/Gold/Silver/Express) with proper amenities JSONB, registration numbers, seat counts
    3. **schedules** — 12 schedules per major route (matching the departure times in mockData.ts), linking routes to buses with departure/arrival times
    4. **seats** — Standard bus layout (41 seats) for each bus, with proper row labels (A-K) and seat numbers

    Use the exact city names, prices, and coach names from mockData.ts to ensure data continuity.
    Do NOT insert profiles, bookings, or payments — those are user-generated.
  </action>
  <verify>
    Run the seed SQL in Supabase SQL Editor. Then run:
    ```sql
    SELECT COUNT(*) FROM routes;
    SELECT COUNT(*) FROM buses;
    SELECT COUNT(*) FROM schedules;
    SELECT COUNT(*) FROM seats;
    ```
    Expect: routes ≥ 8, buses ≥ 4, schedules ≥ 24, seats ≥ 160
  </verify>
  <done>All core tables populated with realistic Star Line data</done>
</task>

<task type="auto">
  <name>Create route service layer</name>
  <files>src/services/routeService.ts</files>
  <action>
    Create `src/services/routeService.ts` with these async functions:

    1. `getPopularRoutes()` → Fetches active routes from Supabase, sorted by some popularity metric (most schedules). Returns `Route[]` from database.ts types.

    2. `searchTrips(from: string, to: string, date: string)` → Finds matching schedules by joining `schedules` + `routes` + `buses` where `routes.origin = from` AND `routes.destination = to` AND schedule is active AND date's day-of-week matches `schedules.days_of_week`. Returns a transformed array matching the `BusResult` interface shape from mockData.ts so the UI doesn't need changes.

    3. `getCities()` → Fetches distinct origin + destination city names from active routes.

    4. `getRouteDetails(routeId: string)` → Fetches a single route with its schedules and assigned buses.

    All functions must handle errors gracefully (return empty arrays on failure, log errors to console).
    The `searchTrips` return type should match the existing `BusResult` interface so SearchResults.tsx needs minimal changes.
  </action>
  <verify>
    Import and call `getPopularRoutes()` in browser console after connecting. Verify it returns route data from DB.
  </verify>
  <done>A complete typed service layer for route/schedule queries exists at src/services/routeService.ts</done>
</task>

## Success Criteria
- [ ] Supabase database has real route, bus, schedule, and seat data
- [ ] `routeService.ts` exports typed functions for all route/search queries
- [ ] `searchTrips()` returns data in `BusResult`-compatible shape
- [ ] All service functions handle errors gracefully
