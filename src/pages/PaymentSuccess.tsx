import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Ticket, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import PageHead from '@/components/PageHead';
import { getBookingStatus } from '@/services/paymentService';

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = params.get('bookingId') || '';
  const [confirmed, setConfirmed] = useState(false);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    if (!bookingId || confirmed) return;
    const interval = setInterval(async () => {
      setPollCount(prev => prev + 1);
      const status = await getBookingStatus(bookingId);
      if (status === 'confirmed') {
        setConfirmed(true);
        clearInterval(interval);
      }
    }, 2000);

    // Stop polling after 5 attempts (10 seconds)
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setConfirmed(true); // Assume confirmed, IPN may be delayed
    }, 12000);

    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [bookingId, confirmed]);

  return (
    <div className="min-h-screen bg-background">
      <PageHead title="Payment Successful" description="Your payment has been processed successfully." />
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="container max-w-lg">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            {/* Success Animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
              className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center"
            >
              <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            </motion.div>

            <h1 className="font-display text-3xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-muted-foreground mb-8">
              Your booking has been confirmed. Your e-ticket is ready.
            </p>

            {!confirmed ? (
              <div className="glass-card p-6 mb-6">
                <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Confirming your booking...</p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <Link
                  to={`/ticket?bookingId=${bookingId}`}
                  className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground rounded-xl px-6 py-4 font-semibold hover:bg-primary/90 transition-colors btn-primary-glow"
                >
                  <Ticket className="w-5 h-5" /> View Your E-Ticket
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/dashboard"
                  className="flex items-center justify-center gap-2 w-full bg-secondary/60 text-foreground rounded-xl px-6 py-3 text-sm font-medium hover:bg-secondary transition-colors border border-border/40"
                >
                  Go to Dashboard
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
