// supabase/functions/payment-callback/index.ts
// Handles SSLCommerz callbacks: success, fail, cancel, and IPN.
// SSLCommerz POSTs to these URLs after payment. This function validates
// the transaction and redirects the user to the appropriate frontend page.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const type = url.searchParams.get('type') || 'unknown';
    const bookingId = url.searchParams.get('bookingId') || '';

    // Parse the POST body from SSLCommerz
    let body: Record<string, string> = {};
    if (req.method === 'POST') {
      const text = await req.text();
      const params = new URLSearchParams(text);
      for (const [k, v] of params.entries()) {
        body[k] = v;
      }
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const storeId = Deno.env.get('SSLCOMMERZ_STORE_ID')!;
    const storePassword = Deno.env.get('SSLCOMMERZ_STORE_PASSWORD')!;
    const isSandbox = Deno.env.get('SSLCOMMERZ_IS_SANDBOX') === 'true';
    const siteUrl = Deno.env.get('SITE_URL') || 'https://star-line-main.vercel.app';

    const sslBaseUrl = isSandbox
      ? 'https://sandbox.sslcommerz.com'
      : 'https://securepay.sslcommerz.com';

    const tranId = body.tran_id || '';
    const valId = body.val_id || '';
    const status = body.status || '';
    const amount = body.amount || body.currency_amount || '';

    // Resolve bookingId from body if not in query
    const resolvedBookingId = bookingId || body.value_a || '';

    console.log(`Payment callback [${type}]: tran_id=${tranId}, status=${status}, bookingId=${resolvedBookingId}`);

    // ─── HANDLE IPN (server-to-server, no redirect) ───
    if (type === 'ipn') {
      if (status === 'VALID' || status === 'VALIDATED') {
        // Validate with SSLCommerz
        const validationUrl = `${sslBaseUrl}/validator/api/validationserverAPI.php?val_id=${valId}&store_id=${storeId}&store_passwd=${storePassword}&format=json`;
        const valRes = await fetch(validationUrl);
        const valData = await valRes.json();

        if (valData.status === 'VALID' || valData.status === 'VALIDATED') {
          // Update payment record
          await supabase
            .from('payments')
            .update({
              status: 'success',
              transaction_id: valId,
              paid_at: new Date().toISOString(),
            })
            .eq('id', tranId);

          // Confirm booking
          await supabase
            .from('bookings')
            .update({ status: 'confirmed' })
            .eq('id', resolvedBookingId);

          console.log(`IPN validated: booking ${resolvedBookingId} confirmed`);
        } else {
          // Validation failed
          await supabase
            .from('payments')
            .update({ status: 'failed' })
            .eq('id', tranId);

          console.log(`IPN validation failed for tran_id=${tranId}`);
        }
      } else {
        // Payment was not successful
        if (tranId) {
          await supabase
            .from('payments')
            .update({ status: 'failed' })
            .eq('id', tranId);
        }
      }

      return new Response('IPN received', {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
      });
    }

    // ─── HANDLE SUCCESS ───
    if (type === 'success') {
      if (valId) {
        // Validate the transaction
        const validationUrl = `${sslBaseUrl}/validator/api/validationserverAPI.php?val_id=${valId}&store_id=${storeId}&store_passwd=${storePassword}&format=json`;
        const valRes = await fetch(validationUrl);
        const valData = await valRes.json();

        if (valData.status === 'VALID' || valData.status === 'VALIDATED') {
          await supabase
            .from('payments')
            .update({
              status: 'success',
              transaction_id: valId,
              paid_at: new Date().toISOString(),
            })
            .eq('id', tranId);

          await supabase
            .from('bookings')
            .update({ status: 'confirmed' })
            .eq('id', resolvedBookingId);
        }
      }

      // Redirect user to frontend success page
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${siteUrl}/payment/success?bookingId=${resolvedBookingId}`,
        },
      });
    }

    // ─── HANDLE FAIL ───
    if (type === 'fail') {
      if (tranId) {
        await supabase
          .from('payments')
          .update({ status: 'failed' })
          .eq('id', tranId);
      }

      return new Response(null, {
        status: 302,
        headers: {
          Location: `${siteUrl}/payment/fail?bookingId=${resolvedBookingId}`,
        },
      });
    }

    // ─── HANDLE CANCEL ───
    if (type === 'cancel') {
      if (tranId) {
        await supabase
          .from('payments')
          .update({ status: 'failed' })
          .eq('id', tranId);
      }

      return new Response(null, {
        status: 302,
        headers: {
          Location: `${siteUrl}/payment/cancel?bookingId=${resolvedBookingId}`,
        },
      });
    }

    // Unknown type
    return new Response(null, {
      status: 302,
      headers: { Location: siteUrl },
    });
  } catch (err) {
    console.error('payment-callback error:', err);
    const siteUrl = Deno.env.get('SITE_URL') || 'https://star-line-main.vercel.app';
    return new Response(null, {
      status: 302,
      headers: { Location: `${siteUrl}/payment/fail` },
    });
  }
});
