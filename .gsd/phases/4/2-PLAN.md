---
phase: 4
plan: 2
wave: 2
---

# Plan 4.2: Connect Seat Selection Page to Live Data

## Objective
Replace the hardcoded seat layout and mock `unavailable` array in `SeatSelection.tsx` with real-time seat data from Supabase, and create a booking record when the user proceeds to checkout.

## Context
- `src/pages/SeatSelection.tsx` — Currently: hardcoded `seatLayout` (L12-23), hardcoded `unavailable` (L25), passes all data via URL params to checkout (L80)
- `src/services/bookingService.ts` — `getSeatAvailability()`, `getScheduleDetails()`, `createBooking()`
- `src/contexts/AuthContext.tsx` — `useAuth()` for checking login state and getting `user.id`
- `src/services/routeService.ts` — Pattern for `useEffect` data fetching

## Tasks

<task type="auto">
  <name>Replace hardcoded seats with live seat availability</name>
  <files>src/pages/SeatSelection.tsx</files>
  <action>
    **Current state:** The page receives route info (from, to, fare, coachName, dep, arr) via URL search params. It has a **hardcoded** 2+2 seat layout array (lines 12-23) and a hardcoded `unavailable` array (line 25).

    **Changes:**
    1. Add `scheduleId` to the URL params (it will be passed from SearchResults when the user clicks "Select Seats"). Read it with `params.get('scheduleId')`.
    2. Import `useState, useEffect` and `useAuth` from AuthContext.
    3. Import `getSeatAvailability, getScheduleDetails, createBooking` from bookingService.
    4. Remove the hardcoded `seatLayout` and `unavailable` consts.
    5. Add state:
       ```typescript
       const [seatData, setSeatData] = useState<SeatInfo[]>([]);
       const [bookedSeatIds, setBookedSeatIds] = useState<Set<string>>(new Set());
       const [scheduleInfo, setScheduleInfo] = useState<any>(null);
       const [loading, setLoading] = useState(true);
       const [bookingLoading, setBookingLoading] = useState(false);
       ```
    6. `useEffect` to fetch data:
       ```typescript
       useEffect(() => {
         const scheduleId = params.get('scheduleId');
         if (!scheduleId) return;
         setLoading(true);
         Promise.all([
           getSeatAvailability(scheduleId, date),
           getScheduleDetails(scheduleId),
         ]).then(([avail, schedule]) => {
           setSeatData(avail.seats);
           setBookedSeatIds(avail.bookedSeatIds);
           setScheduleInfo(schedule);
         }).finally(() => setLoading(false));
       }, []);
       ```
    7. **Generate seat layout** from `seatData`: group by `rowLabel`, create the 2+2+aisle matrix dynamically. If `seatData` is empty (loading), show a skeleton.
    8. **Toggle seat logic** — check `bookedSeatIds.has(seat.id)` instead of `unavailable.includes()`.
    9. Show a **loading skeleton** for the seat map while `loading` is true.
    10. **Ladies seats** — check `seat.seatType === 'ladies'` from the DB instead of the hardcoded `ladies` array.
  </action>
  <verify>npx tsc --noEmit 2>&1 | Select-Object -First 20</verify>
  <done>Seat map renders real seats from Supabase. Booked seats show as disabled. Loading skeleton displays while fetching.</done>
</task>

<task type="auto">
  <name>Create booking on "Proceed to Checkout"</name>
  <files>src/pages/SeatSelection.tsx</files>
  <action>
    **Current state:** The `proceed()` function (L65-81) validates passenger details, then navigates to `/checkout` with ALL data crammed into URL search params.

    **Changes:**
    1. Get `user` from `useAuth()`.
    2. If user is NOT logged in when they click "Proceed":
       - Navigate to `/login?redirect=${encodeURIComponent(window.location.href)}`.
       - Return early.
    3. If user IS logged in:
       - Set `bookingLoading = true`.
       - Call `createBooking({...})` with the selected seat IDs, schedule ID, fare, passenger details.
       - On success: navigate to `/checkout?bookingId=${bookingId}`.
       - On error: show a toast/alert.
       - Set `bookingLoading = false`.
    4. Update the "Proceed to Checkout" button to show a spinner when `bookingLoading` is true.
    5. The URL params to checkout are now JUST `bookingId` — all other data is fetched from the DB at the Checkout page.
  </action>
  <verify>npx tsc --noEmit 2>&1 | Select-Object -First 20</verify>
  <done>
    - Clicking "Proceed" creates a pending booking in Supabase with the correct seats.
    - Unauthenticated users are redirected to login.
    - The booking ID is passed to Checkout via URL.
  </done>
</task>

<task type="auto">
  <name>Pass scheduleId from SearchResults to SeatSelection</name>
  <files>src/pages/SearchResults.tsx</files>
  <action>
    **Current state:** The "Select Seats" button on each bus card navigates to `/seats?from=...&to=...&fare=...` with NO `scheduleId`.

    **Change:** Add `scheduleId=${bus.scheduleId}` to the URL params in the navigate call on the bus card's click handler. The `BusResult` interface already includes `scheduleId`.
  </action>
  <verify>npx tsc --noEmit 2>&1 | Select-Object -First 20</verify>
  <done>Clicking "Select Seats" in SearchResults passes the scheduleId to the SeatSelection page.</done>
</task>

## Success Criteria
- [ ] Seat map shows real seats from the database, dynamically laid out by row
- [ ] Booked seats are visually disabled (not selectable)
- [ ] Clicking "Proceed" creates a DB booking (visible in Supabase dashboard)
- [ ] Unauthenticated users are redirected to login before booking
- [ ] scheduleId flows correctly from SearchResults → SeatSelection
