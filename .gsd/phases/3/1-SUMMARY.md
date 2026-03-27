## Plan 3.1 Summary: Database Seeding & Service Layer

### What was done
1. **Created `supabase/seed.sql`** — Comprehensive seed script with:
   - 8 intercity routes (Dhaka→Chattogram, Dhaka→Cox's Bazar, etc.)
   - 4 bus types (Platinum, Gold, Silver, Express) with JSONB amenities
   - 27 schedules across all routes with daily departures
   - 144 seats (24+36+40+44) with row labels and seat types

2. **Created `src/services/routeService.ts`** — Typed service layer with 5 functions:
   - `getPopularRoutes()` — Active routes ranked by schedule count
   - `searchTrips(from, to, date)` — Schedule lookup with bus details & availability
   - `getCities()` — Distinct city names with in-memory cache
   - `getRouteDetails(routeId)` — Single route with nested schedules/buses
   - `getBusTypes()` — Fleet information for display

### Verification
- TypeScript compiles with 0 errors
- All functions return data matching existing UI interfaces
