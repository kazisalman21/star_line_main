import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Ticket, ArrowRight, AlertTriangle, RefreshCw } from 'lucide-react';
import Navbar from '@/components/Navbar';
import PageHead from '@/components/PageHead';
import { getBookingStatus } from '@/services/paymentService';

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = params.get('bookingId') || '';
  const [confirmed, setConfirmed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [pollCount, setPollCount] = useState(0);

  const startPolling = () => {
    setTimedOut(false);
    setConfirmed(false);
    setPollCount(0);
  };

  useEffect(() => {
    if (!bookingId || confirmed || timedOut) return;
    const interval = setInterval(async () => {
      setPollCount(prev => prev + 1);
      const status = await getBookingStatus(bookingId);
      if (status === 'confirmed') {
        setConfirmed(true);
        clearInterval(interval);
      }
    }, 2000);

    // Stop polling after 6 attempts (12 seconds) — do NOT assume confirmed
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setTimedOut(true);
    }, 12000);

    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [bookingId, confirmed, timedOut]);

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
            {/* ─── Confirmed State ─── */}
            {confirmed && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center"
                >
                  <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                </motion.div>
                <h1 className="font-display text-3xl font-bold mb-2">Booking Confirmed!</h1>
                <p className="text-muted-foreground mb-8">
                  Your payment was processed and booking is confirmed. Your e-ticket is ready.
                </p>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <Link
                    to={`/ticket?bookingId=${bookingId}`}
                    className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground rounded-xl px-6 py-4 font-semibold hover:bg-primary/90 transition-colors btn-primary-glow"
                  >
                    <Ticket className="w-5 h-5" /> View Your E-Ticket <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/dashboard"
                    className="flex items-center justify-center gap-2 w-full bg-secondary/60 text-foreground rounded-xl px-6 py-3 text-sm font-medium hover:bg-secondary transition-colors border border-border/40"
                  >
                    Go to Dashboard
                  </Link>
                </motion.div>
              </>
            )}

            {/* ─── Polling / Loading State ─── */}
            {!confirmed && !timedOut && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center"
                >
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                </motion.div>
                <h1 className="font-display text-3xl font-bold mb-2">Payment Successful!</h1>
                <p className="text-muted-foreground mb-8">
                  Confirming your booking — this may take a moment...
                </p>
                <div className="glass-card p-6 mb-6">
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          className="w-2.5 h-2.5 rounded-full bg-primary"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Verifying payment with gateway{pollCount > 2 ? '...' : ''}
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* ─── Timed Out (Unconfirmed) State ─── */}
            {!confirmed && timedOut && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-24 h-24 mx-auto mb-6 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center"
                >
                  <AlertTriangle className="w-12 h-12 text-amber-400" />
                </motion.div>
                <h1 className="font-display text-3xl font-bold mb-2">Payment Received</h1>
                <p className="text-muted-foreground mb-4">
                  Your payment was received but booking confirmation is taking longer than expected.
                  This usually resolves within a few minutes.
                </p>
                <div className="glass-card p-5 mb-6 text-left">
                  <p className="text-sm text-muted-foreground mb-3">What you can do:</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary flex-shrink-0 mt-0.5">1</span>
                      Wait a moment and check your dashboard for the updated status
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary flex-shrink-0 mt-0.5">2</span>
                      Retry the confirmation check below
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary flex-shrink-0 mt-0.5">3</span>
                      Contact support if the issue persists
                    </li>
                  </ul>
                </div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <button
                    onClick={startPolling}
                    className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground rounded-xl px-6 py-4 font-semibold hover:bg-primary/90 transition-colors btn-primary-glow"
                  >
                    <RefreshCw className="w-4 h-4" /> Retry Confirmation Check
                  </button>
                  <Link
                    to={`/ticket?bookingId=${bookingId}`}
                    className="flex items-center justify-center gap-2 w-full bg-secondary/60 text-foreground rounded-xl px-6 py-3 text-sm font-medium hover:bg-secondary transition-colors border border-border/40"
                  >
                    <Ticket className="w-5 h-5" /> View Ticket (may show pending)
                  </Link>
                  <Link
                    to="/dashboard"
                    className="flex items-center justify-center gap-2 w-full text-muted-foreground rounded-xl px-6 py-3 text-sm font-medium hover:text-foreground transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                </motion.div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
