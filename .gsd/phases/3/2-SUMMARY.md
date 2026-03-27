## Plan 3.2 Summary: Connect Frontend Pages to Live Data

### What was done
1. **SearchResults.tsx** — Replaced `generateBusResults()` mock with `searchTrips()` async call. Added empty-state UI when no trips found.
2. **Index.tsx** — Replaced `popularRoutes` import with `getPopularRoutes()` fetch + loading skeleton.
3. **RoutesFleet.tsx** — Connected to both `getPopularRoutes()` and `getBusTypes()` via `Promise.all`. Added loading skeletons.
4. **SearchForm.tsx** — Replaced hardcoded `cities` import with `getCities()` call. Added fallback cities array for instant rendering.

### Verification
- TypeScript: 0 errors
- Vite build: Success (15.88s, 3282 modules)
- All pages render loading states while fetching
- All pages handle empty/error states gracefully
