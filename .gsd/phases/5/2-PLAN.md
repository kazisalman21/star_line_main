---
phase: 5
plan: 2
wave: 2
---

# Plan 5.2: Connect Checkout Page to Real Payment Flow

## Objective
Replace the instant `confirmBooking()` call in `Checkout.tsx` with the real SSLCommerz redirect flow. Add payment return pages for success/fail/cancel callbacks.

## Context
- `src/pages/Checkout.tsx` — Currently calls `confirmBooking(bookingId, paymentMethod)` directly (L40-50), which instantly marks booking confirmed. Must change to call `initiatePayment()` and redirect to SSLCommerz.
- `src/services/paymentService.ts` — `initiatePayment()` returns a gateway URL.
- SSLCommerz redirects back to: `success_url`, `fail_url`, `cancel_url`.
- The "Pay at Counter" option should SKIP SSLCommerz and keep the booking as 'pending'.

## Tasks

<task type="auto">
  <name>Update Checkout to use SSLCommerz redirect</name>
  <files>src/pages/Checkout.tsx</files>
  <action>
    **Current `handleConfirm` (L40-50):**
    ```typescript
    const ok = await confirmBooking(bookingId, paymentMethod);
    if (ok) navigate(`/ticket?bookingId=${bookingId}`);
    ```

    **New `handleConfirm`:**
    ```typescript
    if (paymentMethod === 'counter') {
      // counter payment — keep as pending, go to ticket
      navigate(`/ticket?bookingId=${bookingId}`);
      return;
    }

    setConfirming(true);
    const gatewayUrl = await initiatePayment(bookingId, paymentMethod);
    if (gatewayUrl) {
      window.location.replace(gatewayUrl); // redirect to SSLCommerz
    } else {
      setError('Payment gateway unavailable. Please try again.');
    }
    setConfirming(false);
    ```

    **Other changes:**
    1. Import `initiatePayment` from `paymentService` instead of `confirmBooking` from `bookingService`.
    2. Update button text: "Pay ৳{total}" for MFS/card, "Reserve & Pay Later" for counter.
    3. Add a note under counter option: "Your booking will be held for 2 hours."
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Checkout redirects to SSLCommerz for bKash/Nagad/Rocket/card, or keeps pending for counter.</done>
</task>

<task type="auto">
  <name>Create payment return pages</name>
  <files>src/pages/PaymentSuccess.tsx, src/pages/PaymentFail.tsx, src/pages/PaymentCancel.tsx</files>
  <action>
    Create 3 lightweight return pages that SSLCommerz redirects to:

    **PaymentSuccess.tsx:**
    - Read `bookingId` from URL params (SSLCommerz passes it back via `value_a` or query string).
    - Show a success animation (checkmark + confetti effect).
    - Poll `getPaymentStatus(bookingId)` every 2 seconds (up to 5 times) until `status === 'success'`.
    - Once confirmed, redirect to `/ticket?bookingId=xxx`.
    - If not confirmed after 10s, show "Payment received. Your ticket is being generated..." with a manual link.

    **PaymentFail.tsx:**
    - Show an error state with retry option.
    - "Your payment could not be processed."
    - Button: "Try Again" → navigate back to `/checkout?bookingId=xxx`.
    - Button: "Pay at Counter" → navigate to `/ticket?bookingId=xxx`.

    **PaymentCancel.tsx:**
    - Show a neutral cancellation message.
    - "You cancelled the payment."
    - Button: "Try Again" → `/checkout?bookingId=xxx`.
    - Button: "Go Home" → `/`.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>All 3 return pages exist and handle SSLCommerz redirects.</done>
</task>

<task type="auto">
  <name>Add routes for payment return pages</name>
  <files>src/App.tsx</files>
  <action>
    Add 3 routes:
    ```tsx
    <Route path="/payment/success" element={<PaymentSuccess />} />
    <Route path="/payment/fail" element={<PaymentFail />} />
    <Route path="/payment/cancel" element={<PaymentCancel />} />
    ```
    Import the 3 new page components.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Routes registered and accessible.</done>
</task>

## Success Criteria
- [ ] Selecting bKash/Nagad/Rocket/card redirects to SSLCommerz
- [ ] Selecting "Pay at Counter" keeps booking as pending and shows ticket
- [ ] SSLCommerz success callback redirects to PaymentSuccess → ticket
- [ ] SSLCommerz fail/cancel callbacks show appropriate UI with retry
