import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, CreditCard, Smartphone, Building2, ChevronRight, Lock, Loader2, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHead from '@/components/PageHead';
import { getBookingDetails, BookingDetails } from '@/services/bookingService';
import { initiatePayment } from '@/services/paymentService';

const paymentMethods = [
  { id: 'bkash', name: 'bKash', desc: 'Pay with bKash mobile wallet', icon: Smartphone, color: 'text-pink-400' },
  { id: 'nagad', name: 'Nagad', desc: 'Pay with Nagad mobile wallet', icon: Smartphone, color: 'text-orange-400' },
  { id: 'rocket', name: 'Rocket', desc: 'Pay with Rocket mobile wallet', icon: Smartphone, color: 'text-purple-400' },
  { id: 'card', name: 'Credit/Debit Card', desc: 'Visa, Mastercard, DBBL', icon: CreditCard, color: 'text-blue-400' },
  { id: 'counter', name: 'Pay at Counter', desc: 'Reserve now, pay at boarding', icon: Building2, color: 'text-muted-foreground' },
];

export default function Checkout() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = params.get('bookingId') || '';

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [agreed, setAgreed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!bookingId) { setLoading(false); return; }
    getBookingDetails(bookingId)
      .then(setBooking)
      .finally(() => setLoading(false));
  }, [bookingId]);

  const serviceFee = booking ? Math.round(booking.totalFare * 0.03) : 0;
  const total = booking ? booking.totalFare + serviceFee : 0;

  const handleConfirm = async () => {
    if (!booking) return;
    setConfirming(true);
    setError('');

    // Counter payment — skip SSLCommerz, keep booking pending
    if (paymentMethod === 'counter') {
      navigate(`/ticket?bookingId=${bookingId}`);
      return;
    }

    // Online payment — redirect to SSLCommerz gateway
    const gatewayUrl = await initiatePayment(bookingId, paymentMethod);
    if (gatewayUrl) {
      window.location.replace(gatewayUrl);
    } else {
      setError('Payment gateway unavailable. Please try again or pay at counter.');
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 pb-12">
          <div className="container max-w-4xl">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-secondary rounded w-1/3" />
              <div className="h-4 bg-secondary rounded w-1/4" />
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 space-y-6">
                  <div className="glass-card p-6 space-y-3">
                    {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-secondary rounded-xl" />)}
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <div className="glass-card p-6 space-y-3">
                    {[1,2,3,4,5].map(i => <div key={i} className="h-5 bg-secondary rounded" />)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 pb-12">
          <div className="container max-w-lg text-center">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold mb-2">Booking Not Found</h1>
            <p className="text-muted-foreground mb-6">We couldn't find this booking. It may have expired.</p>
            <button onClick={() => navigate('/search')} className="bg-primary text-primary-foreground rounded-lg px-6 py-3 text-sm font-semibold">
              Search Trips
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHead title="Secure Checkout" description="Complete your bus ticket booking securely with bKash, Nagad, Rocket, or card payment." />
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container max-w-4xl">
          <h1 className="font-display text-2xl font-bold mb-2">Secure Checkout</h1>
          <p className="text-muted-foreground text-sm mb-8">Complete your booking for {booking.route.origin} → {booking.route.destination}</p>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-6">
              {/* Payment Methods */}
              <div className="glass-card p-6">
                <h3 className="font-display font-semibold mb-4">Payment Method</h3>
                <div className="space-y-3">
                  {paymentMethods.map(pm => (
                    <button
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                        paymentMethod === pm.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-secondary/50 hover:border-border/80'
                      }`}
                    >
                      <pm.icon className={`w-6 h-6 ${pm.color}`} />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{pm.name}</div>
                        <div className="text-xs text-muted-foreground">{pm.desc}</div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === pm.id ? 'border-primary' : 'border-border'}`}>
                        {paymentMethod === pm.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Terms */}
              <div className="glass-card p-6">
                <h3 className="font-display font-semibold mb-3">Cancellation Policy</h3>
                <ul className="text-sm text-muted-foreground space-y-1.5 mb-4 list-disc list-inside">
                  <li>Free cancellation up to 6 hours before departure</li>
                  <li>50% refund between 6-2 hours before departure</li>
                  <li>No refund within 2 hours of departure</li>
                </ul>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 w-4 h-4 rounded accent-primary" />
                  <span className="text-sm text-muted-foreground">I agree to the terms and cancellation policy</span>
                </label>
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-2">
              <div className="glass-card-accent p-6 sticky top-24">
                <h3 className="font-display font-semibold mb-4">Booking Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Passenger</span><span>{booking.passengerName}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Route</span><span>{booking.route.origin} → {booking.route.destination}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{booking.travelDate}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span>{booking.schedule.departureTime} - {booking.schedule.arrivalTime}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Coach</span><span>{booking.bus.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Seats</span><span>{booking.seats.map(s => s.seatNumber).join(', ')}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Boarding</span><span className="text-right text-xs">{booking.boardingPoint}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Dropping</span><span className="text-right text-xs">{booking.droppingPoint}</span></div>
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between"><span className="text-muted-foreground">Ticket fare</span><span>৳{booking.totalFare}</span></div>
                    <div className="flex justify-between mt-1"><span className="text-muted-foreground">Service fee</span><span>৳{serviceFee}</span></div>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                    <span>Total</span><span className="text-accent">৳{total}</span>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                  </div>
                )}

                <button
                  onClick={handleConfirm}
                  disabled={!agreed || confirming}
                  className="w-full mt-6 bg-primary text-primary-foreground rounded-lg py-3 font-semibold text-sm hover:bg-primary/90 transition-colors btn-primary-glow disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {confirming ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                  ) : (
                    <><Lock className="w-4 h-4" /> Confirm & Pay ৳{total}</>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                  <Shield className="w-3.5 h-3.5 text-success" />
                  <span>Secured by SSL encryption</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
