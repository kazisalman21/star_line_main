---
phase: 4
plan: 3
wave: 3
---

# Plan 4.3: Connect Checkout & Confirmation Pages

## Objective
Update `Checkout.tsx` and `TicketConfirmation.tsx` to read the live booking details created in the previous step, completing the v1 booking flow.

## Context
- `src/pages/Checkout.tsx`
- `src/pages/TicketConfirmation.tsx`
- `src/services/bookingService.ts`

## Tasks

<task type="auto">
  <name>Update Checkout Page</name>
  <files>src/pages/Checkout.tsx</files>
  <action>
    - Read `bookingId` from URL params.
    - Fetch details via `getBookingDetails(bookingId)`.
    - Display the actual route, time, selected seats, passenger details, and total fare.
    - *Note*: Payment processing is Phase 5. For now, the "Pay Now" button should just update the booking status to 'confirmed' and navigate to `/confirmation?bookingId=X`.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Checkout page displays real pending booking details.</done>
</task>

<task type="auto">
  <name>Update Ticket Confirmation Page</name>
  <files>src/pages/TicketConfirmation.tsx</files>
  <action>
    - Read `bookingId` from URL params.
    - Fetch details via `getBookingDetails`.
    - Display the PNR (booking short code/ID), QR code data (use booking ID), and real schedule details.
    - Remove all mock data imports.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Confirmation page displays real confirmed booking details.</done>
</task>

## Success Criteria
- [ ] Checkout reads from the `bookings` table instead of URL params.
- [ ] Completing checkout marks the booking as confirmed.
- [ ] Ticket Confirmation shows the real booking UUID/PNR.
