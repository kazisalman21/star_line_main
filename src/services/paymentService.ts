import { supabase } from '@/lib/supabase';

// ============================================================
// Payment Service — client-side helpers for SSLCommerz flow
// ============================================================

/**
 * Initiate a payment session via the Supabase Edge Function.
 * Returns the SSLCommerz gateway URL for browser redirect.
 */
export async function initiatePayment(
  bookingId: string,
  method: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke('init-payment', {
      body: { bookingId, method },
    });

    if (error || !data?.gatewayUrl) {
      console.error('Error initiating payment:', error, data);
      return null;
    }

    return data.gatewayUrl;
  } catch (err) {
    console.error('Error in initiatePayment:', err);
    return null;
  }
}

/**
 * Get the latest payment status for a booking.
 * Used on the PaymentSuccess page to poll for confirmation.
 */
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

/**
 * Get the booking status directly (for polling on success page).
 */
export async function getBookingStatus(bookingId: string): Promise<string | null> {
  const { data } = await supabase
    .from('bookings')
    .select('status')
    .eq('id', bookingId)
    .single();

  return data?.status || null;
}
