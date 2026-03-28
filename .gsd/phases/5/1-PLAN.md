---
phase: 5
plan: 1
wave: 1
---

# Plan 5.1: Payment Service Layer + Supabase Edge Function

## Objective
Create the server-side payment initiation and validation infrastructure using Supabase Edge Functions (Deno), and a client-side `paymentService.ts` that calls them. SSLCommerz requires a backend — Edge Functions are our serverless backend.

## Context
- SSLCommerz requires a **server-side** call with `store_id` + `store_passwd` — can NEVER be exposed to the frontend.
- Supabase Edge Functions run on Deno and can be deployed alongside the project.
- Current `confirmBooking()` in `bookingService.ts` (L233-282) instantly marks the booking confirmed — this must change to only confirm AFTER payment is validated.
- `payments` table already has `transaction_id`, `status`, `method` columns.
- The `Checkout.tsx` page already has payment method selection UI.

## Architecture

```
User clicks "Confirm & Pay"
        │
        ▼
Frontend → POST /functions/v1/init-payment { bookingId, method }
        │
        ▼
Edge Function → SSLCommerz API (init session)
        │ returns GatewayPageURL
        ▼
Frontend → window.location.replace(GatewayPageURL)
        │
        ▼ (User pays on SSLCommerz hosted page)
        │
SSLCommerz → redirect to success_url / fail_url / cancel_url
        │
        ▼
Edge Function (IPN) → Validate transaction → Update booking + payment in DB
        │
        ▼
Frontend success page → /ticket?bookingId=xxx
```

## Tasks

<task type="auto">
  <name>Create Supabase Edge Function: init-payment</name>
  <files>supabase/functions/init-payment/index.ts</files>
  <action>
    Create a Deno edge function that:

    1. Receives POST body: `{ bookingId: string, method: string }`.
    2. Validates the booking exists and is in 'pending' status.
    3. Reads booking details (total_fare, passenger_name, passenger_phone, passenger_email, route info).
    4. Creates a payment record in `payments` table with status='pending'.
    5. Calls SSLCommerz session API:
       ```
       POST https://sandbox.sslcommerz.com/gwprocess/v4/api.php
       Content-Type: application/x-www-form-urlencoded

       store_id=<ENV>
       store_passwd=<ENV>
       total_amount=<booking.total_fare>
       currency=BDT
       tran_id=<payment.id>
       success_url=<SITE_URL>/api/payment/success
       fail_url=<SITE_URL>/api/payment/fail
       cancel_url=<SITE_URL>/api/payment/cancel
       ipn_url=<SUPABASE_URL>/functions/v1/payment-ipn
       cus_name=<passenger_name>
       cus_email=<passenger_email or noreply@starlinegroup.com>
       cus_phone=<passenger_phone>
       product_name=Bus Ticket
       product_category=Travel
       product_profile=non-physical-goods
       shipping_method=NO
       ```
    6. Return `{ gatewayUrl: response.GatewayPageURL }`.
    7. Environment variables (set via Supabase dashboard):
       - `SSLCOMMERZ_STORE_ID`
       - `SSLCOMMERZ_STORE_PASSWORD`
       - `SSLCOMMERZ_IS_SANDBOX` (true for dev, false for prod)
       - `SITE_URL` (Vercel deployment URL)
  </action>
  <verify>Manual: deploy to Supabase and test with sandbox credentials</verify>
  <done>Edge function created, handles payment initiation, returns gateway URL.</done>
</task>

<task type="auto">
  <name>Create Supabase Edge Function: payment-ipn</name>
  <files>supabase/functions/payment-ipn/index.ts</files>
  <action>
    Create a Deno edge function for SSLCommerz IPN (Instant Payment Notification):

    1. Receives POST from SSLCommerz with transaction result.
    2. Extracts `tran_id`, `val_id`, `amount`, `status` from the body.
    3. Validates the transaction via SSLCommerz Order Validation API:
       ```
       GET https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php
       ?val_id=<val_id>&store_id=<ENV>&store_passwd=<ENV>&format=json
       ```
    4. If validation succeeds and `status === 'VALID'`:
       - Update `payments` SET `status='success'`, `transaction_id=val_id`, `paid_at=now()`.
       - Update `bookings` SET `status='confirmed'` WHERE booking matches the payment.
    5. If validation fails:
       - Update `payments` SET `status='failed'`.
       - Keep booking as 'pending'.
    6. Return 200 OK.
  </action>
  <verify>Manual: test with SSLCommerz sandbox IPN simulator</verify>
  <done>IPN handler validates payments and updates booking status automatically.</done>
</task>

<task type="auto">
  <name>Create client-side paymentService.ts</name>
  <files>src/services/paymentService.ts</files>
  <action>
    Create the frontend service:

    ```typescript
    import { supabase } from '@/lib/supabase';

    export async function initiatePayment(bookingId: string, method: string): Promise<string | null> {
      const { data, error } = await supabase.functions.invoke('init-payment', {
        body: { bookingId, method },
      });

      if (error || !data?.gatewayUrl) {
        console.error('Error initiating payment:', error);
        return null;
      }

      return data.gatewayUrl;
    }

    export async function getPaymentStatus(bookingId: string) {
      const { data } = await supabase
        .from('payments')
        .select('status, method, transaction_id, paid_at')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return data;
    }
    ```
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>Payment service compiles and exports 2 functions.</done>
</task>

## Success Criteria
- [ ] `init-payment` edge function initiates SSLCommerz session
- [ ] `payment-ipn` edge function validates and confirms bookings
- [ ] `paymentService.ts` compiles and calls edge functions
- [ ] Payment secrets are in Supabase env vars, never in frontend code
