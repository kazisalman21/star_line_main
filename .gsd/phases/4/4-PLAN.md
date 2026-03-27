---
phase: 4
plan: 4
wave: 4
---

# Plan 4.4: Connect Passenger Dashboard & Manage Booking

## Objective
Replace mock booking data in `PassengerDashboard.tsx` and `ManageBooking.tsx` with real user booking history from Supabase.

## Context
- `src/pages/PassengerDashboard.tsx` — Currently imports `sampleBooking` from mockData (L10), creates 3 hardcoded `mockBookings` (L25-42), and renders them in the Bookings tab
- `src/pages/ManageBooking.tsx` — Currently a lookup form that doesn't do anything real
- `src/services/bookingService.ts` — `getUserBookings()`, `getBookingDetails()`
- `src/contexts/AuthContext.tsx` — `useAuth()` for user.id
- `src/data/mockData.ts` — `sampleBooking` export to be removed from imports

## Tasks

<task type="auto">
  <name>Connect PassengerDashboard to live bookings</name>
  <files>src/pages/PassengerDashboard.tsx</files>
  <action>
    **Current state:** Lines 10, 25-42 define mock bookings. The component renders them with `statusConfig` colors and filter logic.

    **Changes:**
    1. Remove `import { sampleBooking } from '@/data/mockData'` (L10).
    2. Remove the entire `mockBookings` array (L24-42).
    3. Import `getUserBookings, UserBooking` from `bookingService`.
    4. Add state:
       ```typescript
       const [bookings, setBookings] = useState<UserBooking[]>([]);
       const [bookingsLoading, setBookingsLoading] = useState(true);
       ```
    5. `useEffect` (when `user` is available):
       ```typescript
       useEffect(() => {
         if (!user) return;
         setBookingsLoading(true);
         getUserBookings(user.id)
           .then(setBookings)
           .finally(() => setBookingsLoading(false));
       }, [user]);
       ```
    6. Replace `mockBookings` with `bookings` everywhere in the JSX.
    7. Update the filter logic: `const filtered = bookingFilter === 'all' ? bookings : bookings.filter(b => b.status === bookingFilter)`.
    8. Add a loading skeleton inside the bookings tab while `bookingsLoading`.
    9. Add an empty state: "No bookings yet — search for a trip to get started" with a Link to `/search`.
    10. Map the `UserBooking` fields to the card's display (the `UserBooking` type from Plan 4.1 already matches the shape the cards expect: from, to, date, coachName, seats, totalFare, status).
    11. Update `statusConfig` to also include `pending`: `{ color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: Clock, label: 'Pending' }`.
  </action>
  <verify>npx tsc --noEmit 2>&1 | Select-Object -First 20</verify>
  <done>
    - Dashboard fetches real bookings for the logged-in user.
    - No mock data imports remain.
    - Empty state shows for new users.
    - Filter tabs work on real data.
  </done>
</task>

<task type="auto">
  <name>Connect ManageBooking to live lookup</name>
  <files>src/pages/ManageBooking.tsx</files>
  <action>
    **Current state:** The page has a booking ID + phone lookup form but the "Look Up" button doesn't actually fetch anything.

    **Changes:**
    1. Import `getBookingDetails` from `bookingService`.
    2. On form submit, call `getBookingDetails(bookingId)`.
    3. If found AND phone matches `booking.passengerPhone`: display the booking card with status, route, seats, and fare.
    4. If not found: show "Booking not found" error.
    5. Add a "View Ticket" button that navigates to `/ticket?bookingId=${id}`.
    6. Add a "Cancel Booking" button (only if status is 'pending' or 'confirmed') that updates the booking status to 'cancelled'.
  </action>
  <verify>npx tsc --noEmit 2>&1 | Select-Object -First 20</verify>
  <done>
    - Users can look up a booking by ID.
    - Found bookings display full details.
    - Users can cancel pending/confirmed bookings.
  </done>
</task>

## Success Criteria
- [ ] PassengerDashboard shows real bookings from Supabase for the logged-in user
- [ ] Zero mock data imports (`sampleBooking`) remain in the dashboard
- [ ] Empty state for users with no bookings
- [ ] ManageBooking can fetch and display a real booking by ID
- [ ] Cancel functionality updates the booking status in the database
