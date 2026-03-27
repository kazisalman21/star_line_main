---
phase: 4
plan: 1
wave: 1
---

# Plan 4.1: Booking Service Layer

## Objective
Create the core service layer (`bookingService.ts`) to handle seat availability checking, creating bookings, and releasing expired holds. This bridges the frontend UI with the Supabase schema (`bookings`, `booking_seats`, `seats`).

## Context
- `.gsd/SPEC.md`
- `supabase/schema.sql` (Tables: bookings, booking_seats, seats)
- `src/types/database.ts`

## Tasks

<task type="auto">
  <name>Create Booking Service</name>
  <files>src/services/bookingService.ts</files>
  <action>
    Create a new service file with the following functions:
    
    1. `getSeatAvailability(scheduleId, date)`
       - Fetch all `seats` for the bus associated with the schedule.
       - Fetch all `booking_seats` for `bookings` on that `schedule_id` and `travel_date` where status is NOT 'failed' or 'cancelled' or expired.
       - Return a map or array of seat statuses ('available', 'booked', 'selected', 'locked').
       
    2. `createBookingHold(userId, scheduleId, date, seatNumbers, boarding, dropping, fare)`
       - Create a new record in `bookings` with status 'pending' and an `expires_at` timestamp (e.g., 10 minutes from now).
       - Create corresponding records in `booking_seats`.
       - Return the `booking_id`.
       
    3. `getBookingDetails(bookingId)`
       - Fetch the booking, its seats, the schedule, route, and bus details.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>The bookingService.ts file exists, compiles cleanly, and exposes the 3 core functions.</done>
</task>

## Success Criteria
- [ ] `src/services/bookingService.ts` is created and type-safe.
- [ ] Functions handle Supabase errors gracefully.
