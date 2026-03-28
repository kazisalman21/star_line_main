// supabase/functions/init-payment/index.ts
// Initiates an SSLCommerz payment session for a booking.
// Called from the frontend via supabase.functions.invoke('init-payment', { body: { bookingId, method } })

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { bookingId, method } = await req.json();

    if (!bookingId || !method) {
      return new Response(
        JSON.stringify({ error: 'bookingId and method are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // SSLCommerz credentials
    const storeId = Deno.env.get('SSLCOMMERZ_STORE_ID')!;
    const storePassword = Deno.env.get('SSLCOMMERZ_STORE_PASSWORD')!;
    const isSandbox = Deno.env.get('SSLCOMMERZ_IS_SANDBOX') === 'true';
    const siteUrl = Deno.env.get('SITE_URL') || 'https://star-line-main.vercel.app';

    const sslBaseUrl = isSandbox
      ? 'https://sandbox.sslcommerz.com'
      : 'https://securepay.sslcommerz.com';

    // 1. Fetch booking details
    const { data: booking, error: bookingErr } = await supabase
      .from('bookings')
      .select(`
        *,
        schedules (
          *,
          routes (origin, destination),
          buses (name)
        )
      `)
      .eq('id', bookingId)
      .single();

    if (bookingErr || !booking) {
      return new Response(
        JSON.stringify({ error: 'Booking not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (booking.status !== 'pending') {
      return new Response(
        JSON.stringify({ error: `Booking is already ${booking.status}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Create a pending payment record
    const { data: payment, error: payErr } = await supabase
      .from('payments')
      .insert({
        booking_id: bookingId,
        amount: booking.total_fare,
        method: method,
        status: 'pending',
      })
      .select('id')
      .single();

    if (payErr || !payment) {
      return new Response(
        JSON.stringify({ error: 'Failed to create payment record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tranId = payment.id;
    const schedule = booking.schedules;
    const route = schedule?.routes;
    const bus = schedule?.buses;
    const productName = `Bus Ticket: ${route?.origin || 'Unknown'} → ${route?.destination || 'Unknown'} | ${bus?.name || 'Starline'}`;

    // Callback URLs — these hit the payment-callback edge function
    const callbackBase = `${supabaseUrl}/functions/v1/payment-callback`;
    const successUrl = `${callbackBase}?type=success&bookingId=${bookingId}`;
    const failUrl = `${callbackBase}?type=fail&bookingId=${bookingId}`;
    const cancelUrl = `${callbackBase}?type=cancel&bookingId=${bookingId}`;
    const ipnUrl = `${callbackBase}?type=ipn&bookingId=${bookingId}`;

    // 3. Build SSLCommerz payload
    const params = new URLSearchParams({
      store_id: storeId,
      store_passwd: storePassword,
      total_amount: String(booking.total_fare),
      currency: 'BDT',
      tran_id: tranId,
      success_url: successUrl,
      fail_url: failUrl,
      cancel_url: cancelUrl,
      ipn_url: ipnUrl,
      cus_name: booking.passenger_name || 'Customer',
      cus_email: booking.passenger_email || 'noreply@starlinegroup.com',
      cus_phone: booking.passenger_phone || '01700000000',
      cus_add1: 'Bangladesh',
      cus_city: route?.origin || 'Dhaka',
      cus_country: 'Bangladesh',
      product_name: productName,
      product_category: 'Travel',
      product_profile: 'non-physical-goods',
      shipping_method: 'NO',
      num_of_item: '1',
      // Pass bookingId back via value_a for callback identification
      value_a: bookingId,
      value_b: tranId,
    });

    // 4. Call SSLCommerz session API
    const sslResponse = await fetch(`${sslBaseUrl}/gwprocess/v4/api.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const sslData = await sslResponse.json();

    if (sslData.status !== 'SUCCESS' || !sslData.GatewayPageURL) {
      console.error('SSLCommerz session failed:', sslData);
      // Clean up the payment record
      await supabase.from('payments').delete().eq('id', tranId);
      return new Response(
        JSON.stringify({ error: 'Payment gateway unavailable', details: sslData.failedreason }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Return gateway URL to frontend
    return new Response(
      JSON.stringify({
        gatewayUrl: sslData.GatewayPageURL,
        sessionKey: sslData.sessionkey,
        paymentId: tranId,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('init-payment error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
