---
phase: 4
plan: 3
wave: 3
---

# Plan 4.3: Connect Checkout & Ticket Confirmation to Live Bookings

## Objective
Replace the URL-param-driven Checkout and TicketConfirmation pages with DB-backed booking retrieval. Checkout reads the pending booking, displays a summary, and confirms it. Confirmation shows the confirmed ticket with a real booking ID and QR code.

## Context
- `src/pages/Checkout.tsx` — Currently reads ALL trip data from URL params (L19-33), generates a random booking ID (L42), and passes ALL data again via URL to ticket page (L43)
- `src/pages/TicketConfirmation.tsx` — Currently reads ALL trip data from URL params (L14-28), generates QR from those params, and generates a PDF ticket
- `src/services/bookingService.ts` — `getBookingDetails()`, `confirmBooking()`
- `src/types/database.ts` — `Booking`, `Payment` types

## Tasks

<task type="auto">
  <name>Rewrite Checkout to use DB booking</name>
  <files>src/pages/Checkout.tsx</files>
  <action>
    **Current state:** Lines 19-33 extract 13 URL params. Line 42 generates a fake booking ID. Line 43 navigates to /ticket with all params re-encoded.

    **Changes:**
    1. Read ONLY `bookingId` from URL params: `params.get('bookingId')`.
    2. Add state:
       ```typescript
       const [booking, setBooking] = useState<BookingDetails | null>(null);
       const [loading, setLoading] = useState(true);
       const [confirming, setConfirming] = useState(false);
       ```
    3. `useEffect` → call `getBookingDetails(bookingId)`, set state.
    4. If no bookingId or booking not found after loading: show an error state ("Booking not found — try again from search").
    5. Replace all inline variables (`from`, `to`, `seats`, `fare`, etc.) with `booking?.route.origin`, `booking?.route.destination`, `booking?.seats`, `booking?.totalFare`, etc.
    6. Service fee: `Math.round(booking.totalFare * 0.03)`.
    7. **`confirmBooking` handler:**
       ```typescript
       const handleConfirm = async () => {
         setConfirming(true);
         const ok = await confirmBooking(bookingId, paymentMethod);
         if (ok) {
           navigate(`/ticket?bookingId=${bookingId}`);
         } else {
           // show error
         }
         setConfirming(false);
       };
       ```
    8. Update the "Confirm & Pay" button to show a spinner when `confirming` is true.
    9. Add a loading skeleton while fetching booking details.
    10. Remove ALL old URL param reads (lines 19-33).
  </action>
  <verify>npx tsc --noEmit 2>&1 | Select-Object -First 20</verify>
  <done>
    - Checkout reads from DB, not URL params.
    - Confirming updates the booking status to 'confirmed' and creates a payment record.
    - User navigates to confirmation with just the bookingId.
  </done>
</task>

<task type="auto">
  <name>Rewrite TicketConfirmation to use DB booking</name>
  <files>src/pages/TicketConfirmation.tsx</files>
  <action>
    **Current state:** Lines 14-28 extract 13+ URL params. QR code data is built from these params (L33-42).

    **Changes:**
    1. Read ONLY `bookingId` from URL params.
    2. Add state: `booking`, `loading`.
    3. `useEffect` → call `getBookingDetails(bookingId)`.
    4. Replace all inline values with `booking?.` references:
       - `from` → `booking.route.origin`
       - `to` → `booking.route.destination`
       - `dep` → `booking.schedule.departureTime`
       - `arr` → `booking.schedule.arrivalTime`
       - `seats` → `booking.seats.map(s => s.seatNumber)`
       - `fare` → `booking.totalFare`
       - `name` → `booking.passengerName`
       - `coachName` → `booking.bus.name`
       - `boarding` → `booking.boardingPoint`
       - `dropping` → `booking.droppingPoint`
       - `payment` → `booking.payment?.method`
    5. The `bookingId` displayed on the ticket should be the REAL booking UUID (or use a short PNR format: `STR-${booking.id.slice(0, 8).toUpperCase()}`).
    6. QR code data: `JSON.stringify({ id: booking.id, from, to, date, seats, passenger })`.
    7. PDF download: works as-is since it captures the DOM — just make sure the booking data is loaded before allowing the download button.
    8. Add a loading skeleton while booking data loads.
    9. Remove ALL old URL param reads (lines 14-28).
  </action>
  <verify>npx tsc --noEmit 2>&1 | Select-Object -First 20</verify>
  <done>
    - Ticket page shows real booking details from Supabase.
    - QR code contains real booking data.
    - PDF download generates a ticket with real data.
  </done>
</task>

## Success Criteria
- [ ] Checkout reads booking from DB, not URL params
- [ ] Confirming a booking creates a payment record and updates booking status
- [ ] Ticket Confirmation displays the real booking UUID/PNR
- [ ] QR code contains real booking data
- [ ] PDF download works with real booking data
- [ ] Both pages show loading skeleton while fetching
- [ ] Error state when bookingId is invalid
