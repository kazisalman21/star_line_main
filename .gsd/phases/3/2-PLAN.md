---
phase: 3
plan: 2
wave: 2
---

# Plan 3.2: Connect Frontend Pages to Live Supabase Data

## Objective
Replace all mock data imports in `SearchResults.tsx`, `Index.tsx`, and `RoutesFleet.tsx` with live Supabase queries via the `routeService.ts` created in Plan 3.1. The UI rendering stays the same — only the data source changes.

## Context
- src/services/routeService.ts (created in Plan 3.1)
- src/pages/SearchResults.tsx (uses `generateBusResults()` from mockData)
- src/pages/Index.tsx (uses `popularRoutes` from mockData)
- src/pages/RoutesFleet.tsx (uses `popularRoutes`, `coachTypes` from mockData)
- src/components/SearchForm.tsx (uses hardcoded `cities` array from mockData)
- src/data/mockData.ts (to be preserved as fallback but no longer primary)

## Tasks

<task type="auto">
  <name>Connect SearchResults page to live data</name>
  <files>src/pages/SearchResults.tsx</files>
  <action>
    1. Replace `import { generateBusResults, BusResult } from '@/data/mockData'` with `import { searchTrips } from '@/services/routeService'`
    2. Keep the `BusResult` type — either re-export it from routeService.ts or keep importing from mockData.ts for the interface only
    3. Replace the `useMemo(() => generateBusResults(...))` with a `useEffect` + `useState` pattern:
       - `const [results, setResults] = useState<BusResult[]>([])`
       - `useEffect(() => { searchTrips(from, to, date).then(setResults).finally(() => setLoading(false)); }, [from, to, date])`
    4. Remove the artificial 300ms loading timeout — real network latency replaces it
    5. Add an empty-state message when no results are found: "No trips found for this route"
    6. Keep all existing sorting, filtering, and UI rendering logic unchanged
  </action>
  <verify>
    1. Navigate to /search?from=Dhaka&to=Chattogram&date=2026-03-28
    2. Verify bus results load from Supabase (check Network tab for supabase.co requests)
    3. Verify sorting and filtering still work
    4. Test with a route that doesn't exist — verify empty state appears
  </verify>
  <done>SearchResults.tsx fetches and displays live schedule data from Supabase</done>
</task>

<task type="auto">
  <name>Connect Index and RoutesFleet pages to live data</name>
  <files>src/pages/Index.tsx, src/pages/RoutesFleet.tsx, src/components/SearchForm.tsx</files>
  <action>
    1. **Index.tsx**: Replace `import { popularRoutes } from '@/data/mockData'` with `useEffect` that calls `getPopularRoutes()` from routeService. Map the DB `Route` type to the display format (convert `distance_km` → "264 km", `duration_minutes` → "5h 30m"). Add loading skeleton while fetching.

    2. **RoutesFleet.tsx**: Same approach — fetch routes and bus types from Supabase. For coach types, either create a `getBusTypes()` service function or keep the static `coachTypes` array (these rarely change). Replace `popularRoutes` with live data.

    3. **SearchForm.tsx**: Replace the hardcoded `cities` array import with a `getCities()` call from routeService. Cache the result so it doesn't re-fetch on every render.

    All pages must show loading states during fetch and handle errors gracefully (fallback to empty arrays).
  </action>
  <verify>
    1. Navigate to / — verify popular routes section shows live data
    2. Navigate to /routes — verify routes and fleet data loads from DB
    3. Open SearchForm — verify city autocomplete shows DB cities
    4. Check browser Network tab for supabase.co requests on each page
  </verify>
  <done>Index, RoutesFleet, and SearchForm all consume live Supabase data instead of mock data</done>
</task>

## Success Criteria
- [ ] SearchResults shows real schedules from Supabase
- [ ] Index homepage shows real popular routes
- [ ] RoutesFleet shows real routes and fleet info
- [ ] SearchForm city dropdown populated from database
- [ ] All pages have proper loading states
- [ ] All pages handle empty/error states gracefully
- [ ] No console errors on any of these pages
