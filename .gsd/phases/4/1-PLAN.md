---
phase: 4
plan: 1
wave: 1
---

# Plan 4.1: Booking Service Layer

## Objective
Create `src/services/bookingService.ts` — the core backend bridge for the entire booking pipeline. This service handles seat availability queries, booking creation with seat locking, booking retrieval, confirmation, and user booking history.

## Context
- `supabase/schema.sql` — Tables: `bookings` (L116-130), `booking_seats` (L135-141), `seats` (L103-111), `payments` (L146-155)
- `src/types/database.ts` — All types already defined: `Booking`, `BookingSeat`, `Seat`, `Payment`
- `src/lib/supabase.ts` — Typed Supabase client already exports `supabase`
- `src/services/routeService.ts` — Pattern to follow (error handling, try/catch, typed returns)

## Tasks

<task type="auto">
  <name>Create bookingService.ts with 6 core functions</name>
  <files>src/services/bookingService.ts</files>
  <action>
    Create the file with these functions:

    ### 1. `getSeatAvailability(scheduleId: string, date: string)`
    - Query the `schedules` table to get the `bus_id` for this schedule.
    - Fetch all rows from `seats` table where `bus_id` matches and `is_active = true`.
    - Fetch all `booking_seats` that belong to `bookings` on this `schedule_id` + `travel_date = date` where booking `status` IN ('pending', 'confirmed').
    - Return: `{ seats: SeatInfo[], bookedSeatIds: Set<string> }` where `SeatInfo = { id, seat_number, row_label, seat_type }`.
    - Generate the seat layout matrix dynamically from the `row_label` and seat numbers (e.g., group by row_label, sort by seat_number within each row).

    ### 2. `getScheduleDetails(scheduleId: string)`
    - Fetch the schedule with joined `routes(*)` and `buses(*)`.
    - Return the schedule object with nested route and bus, or null.
    - This provides: origin, destination, departure_time, arrival_time, coach name, fare, duration.

    ### 3. `createBooking(params: CreateBookingParams)`
    Where `CreateBookingParams = { userId, scheduleId, travelDate, seatIds, boarding, dropping, fare, passengerName, passengerPhone, passengerEmail? }`.
    - INSERT into `bookings` with status='pending'.
    - INSERT into `booking_seats` — one row per seat_id with fare = totalFare / seatIds.length.
    - Return the new booking ID or throw on error.
    - **Important:** Use a Supabase RPC or sequential inserts (the schema has `user_id = auth.uid()` RLS check on bookings INSERT, so the user must be authenticated).

    ### 4. `confirmBooking(bookingId: string, paymentMethod: string)`
    - UPDATE `bookings` SET `status = 'confirmed'` WHERE `id = bookingId`.
    - INSERT into `payments` with `amount = total_fare`, `method = paymentMethod`, `status = 'success'`, `paid_at = now()`.
    - Return success/failure.

    ### 5. `getBookingDetails(bookingId: string)`
    - Fetch booking with joins: `schedules(*, routes(*), buses(*))`, `booking_seats(*, seats(*))`, `payments(*)`.
    - Return complete booking object with all nested details for the Checkout and Confirmation pages.
    - Map the data into a clean `BookingDetails` type.

    ### 6. `getUserBookings(userId: string)`
    - Fetch all bookings for this user, ordered by `created_at DESC`.
    - Join with `schedules(*, routes(*))` and `booking_seats(count)` for seat count.
    - Return typed array for the PassengerDashboard.

    ### Type definitions (at top of file):
    ```typescript
    export interface SeatInfo {
      id: string;
      seatNumber: string;
      rowLabel: string;
      seatType: 'standard' | 'premium' | 'ladies';
      isBooked: boolean;
    }

    export interface BookingDetails {
      id: string;
      status: string;
      travelDate: string;
      totalFare: number;
      passengerName: string;
      passengerPhone: string;
      passengerEmail: string | null;
      boardingPoint: string;
      droppingPoint: string;
      createdAt: string;
      route: { origin: string; destination: string; distanceKm: number; durationMinutes: number };
      schedule: { departureTime: string; arrivalTime: string };
      bus: { name: string; type: string; amenities: string[] };
      seats: { seatNumber: string; fare: number }[];
      payment: { method: string; status: string; paidAt: string | null } | null;
    }

    export interface UserBooking {
      id: string;
      bookingId: string;
      status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
      from: string;
      to: string;
      date: string;
      departureTime: string;
      arrivalTime: string;
      coachName: string;
      coachType: string;
      seats: string[];
      totalFare: number;
      boardingPoint: string;
      droppingPoint: string;
    }
    ```
  </action>
  <verify>npx tsc --noEmit 2>&1 | Select-Object -First 20</verify>
  <done>
    - bookingService.ts exists at src/services/bookingService.ts
    - TypeScript compiles with 0 errors
    - Exports 6 functions + 3 interfaces
  </done>
</task>

## Success Criteria
- [ ] `src/services/bookingService.ts` compiles cleanly
- [ ] All 6 functions follow the error-handling pattern from `routeService.ts`
- [ ] Types match the DB schema exactly (column names, nullable fields)
- [ ] RLS-aware: user_id comes from the authenticated session
