---
phase: 4
plan: 2
wave: 2
---

# Plan 4.2: Connect Seat Selection Page

## Objective
Update `SeatSelection.tsx` to use `bookingService.ts` for real-time seat rendering and to create a booking hold when proceeding to checkout.

## Context
- `src/pages/SeatSelection.tsx`
- `src/services/bookingService.ts`
- `src/services/routeService.ts`

## Tasks

<task type="auto">
  <name>Integrate Live Seat Data</name>
  <files>src/pages/SeatSelection.tsx</files>
  <action>
    - Remove imports of `generateBusResults` / mock data.
    - Use `useSearchParams` to get `scheduleId` and `date`.
    - `useEffect` 1: Fetch schedule/bus details via `getRouteDetails` (or a new helper to get schedule info) to know the coach layout.
    - `useEffect` 2: Fetch seat availability via `getSeatAvailability`.
    - Map the real seat data to the UI matrix (A1, A2, etc.). Set seats that are 'booked' or 'locked' as unselectable.
    - Add loading skeletons while fetching seat data.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>SeatSelection correctly fetches and displays live seat availability from Supabase.</done>
</task>

<task type="auto">
  <name>Implement Booking Hold</name>
  <files>src/pages/SeatSelection.tsx</files>
  <action>
    - Update the "Proceed to Details" / "Continue" button handler.
    - Before navigating, call `createBookingHold()` from the service.
    - *Note:* We need the user to be logged in to create a booking. If not logged in, redirect to `/login?redirect=/seats...`. If logged in, create the hold and navigate to `/checkout?bookingId=X`.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Continuing from seat selection creates a pending booking and passes the ID to checkout.</done>
</task>

## Success Criteria
- [ ] Seat Selection shows real seats from the DB, not mock arrays.
- [ ] Clicking continue creates a pending booking record in Supabase.
- [ ] Unauthenticated users are prompted to login before holding seats.
