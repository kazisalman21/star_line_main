---
phase: 4
plan: 4
wave: 4
---

# Plan 4.4: Connect Profile Booking History

## Objective
Update `PassengerDashboard.tsx` to fetch and display the user's real booking history from Supabase.

## Context
- `src/pages/PassengerDashboard.tsx`
- `src/services/bookingService.ts`
- `supabase/schema.sql` (Tables: bookings, booking_seats, routes, schedules)

## Tasks

<task type="auto">
  <name>Add User Bookings Fetcher</name>
  <files>src/services/bookingService.ts</files>
  <action>
    - Add a function `getUserBookings(userId: string)` that fetches all `bookings` for a user.
    - It should join with `schedules` -> `routes` to get origin/destination, and `booking_seats` to get the seat count/numbers.
    - Sort by `created_at` descending.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>bookingService exports getUserBookings returning typed booking History.</done>
</task>

<task type="auto">
  <name>Integrate Profile Booking History</name>
  <files>src/pages/PassengerDashboard.tsx</files>
  <action>
    - Replace the `bookings` mock array with live data from `getUserBookings(user.id)`.
    - Use `useEffect` to fetch bookings on mount.
    - Show an empty state if the user has no bookings.
    - Map the DB's `status` ('pending', 'confirmed', 'cancelled') to the component's status badge colors.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>PassengerDashboard fetches and displays real booking records from the user.</done>
</task>

## Success Criteria
- [ ] Profile page shows the user's past and upcoming trips based on database records.
- [ ] No more mock data (`bookings` array) is hardcoded in the dashboard.
