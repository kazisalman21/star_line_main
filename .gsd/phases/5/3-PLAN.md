---
phase: 5
plan: 3
wave: 3
---

# Plan 5.3: Ticket Enhancement + Payment Status Display

## Objective
Enhance the TicketConfirmation page to show payment status, upgrade the QR code to contain a verifiable booking reference, and update the booking dashboard to reflect payment states.

## Context
- `src/pages/TicketConfirmation.tsx` — Shows booking details and QR code. Currently doesn't show payment method/status.
- `src/pages/PassengerDashboard.tsx` — Shows booking cards. Currently doesn't differentiate between "paid" and "pending payment".
- `src/services/bookingService.ts` — `getBookingDetails()` already returns `payment` object.

## Tasks

<task type="auto">
  <name>Add payment status to TicketConfirmation</name>
  <files>src/pages/TicketConfirmation.tsx</files>
  <action>
    1. Show payment badge on the ticket:
       - If `booking.payment?.status === 'success'`: green badge "✓ Paid via {method}"
       - If `booking.status === 'pending'` and no payment: amber badge "⏳ Payment Pending — Pay at Counter"
       - If `booking.status === 'cancelled'`: red badge "✗ Cancelled"
    2. Show transaction ID on ticket if available: `TXN: {booking.payment.transactionId}`.
    3. Update the "Total Paid" section to show "Total Due" for pending payments.
    4. For pending bookings, add a "Pay Now" button that navigates to `/checkout?bookingId=xxx`.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Ticket page shows accurate payment status and allows pending bookings to pay.</done>
</task>

<task type="auto">
  <name>Add payment indicators to Dashboard booking cards</name>
  <files>src/pages/PassengerDashboard.tsx</files>
  <action>
    1. Add a secondary badge on each booking card:
       - Confirmed + paid: small "Paid" chip in green
       - Pending: small "Unpaid" chip in amber with a "Pay Now" link
    2. This requires extending `UserBooking` type to include `paymentStatus`.
    3. Update `getUserBookings()` in `bookingService.ts` to also fetch the latest payment status for each booking.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Dashboard booking cards show payment status.</done>
</task>

<task type="auto">
  <name>Update bookingService to remove instant confirm</name>
  <files>src/services/bookingService.ts</files>
  <action>
    1. Remove or deprecate the old `confirmBooking()` function (L233-282).
       - It directly sets status='confirmed' without payment validation.
       - Replace with a simple comment: `// Booking confirmation is now handled by the payment-ipn edge function`.
    2. Keep the function signature but make it only work for counter payments:
       ```typescript
       export async function confirmCounterBooking(bookingId: string): Promise<boolean> {
         // Only for "pay at counter" — marks booking as confirmed without payment
         // Real payments are confirmed via the payment-ipn edge function
       }
       ```
    3. Add `paymentStatus` field to `UserBooking` interface.
    4. In `getUserBookings()`, join with the latest payment for each booking.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Booking service no longer instantly confirms — payment flow is authoritative.</done>
</task>

## Success Criteria
- [ ] Ticket page shows "Paid via bKash" or "Payment Pending" clearly
- [ ] Dashboard cards show payment status per booking
- [ ] Old instant-confirm path is removed for online payments
- [ ] Counter payments still work without SSLCommerz
