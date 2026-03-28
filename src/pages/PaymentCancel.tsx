import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Navbar from '@/components/Navbar';
import PageHead from '@/components/PageHead';

export default function PaymentCancel() {
  const [params] = useSearchParams();
  const bookingId = params.get('bookingId') || '';

  return (
    <div className="min-h-screen bg-background">
      <PageHead title="Payment Cancelled" description="You cancelled the payment process." />
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="container max-w-lg">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
              className="w-24 h-24 mx-auto mb-6 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center"
            >
              <AlertCircle className="w-12 h-12 text-amber-400" />
            </motion.div>

            <h1 className="font-display text-3xl font-bold mb-2">Payment Cancelled</h1>
            <p className="text-muted-foreground mb-8">
              You cancelled the payment. Your booking is still reserved — you can complete the payment anytime.
            </p>

            <div className="space-y-3">
              {bookingId && (
                <Link
                  to={`/checkout?bookingId=${bookingId}`}
                  className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground rounded-xl px-6 py-4 font-semibold hover:bg-primary/90 transition-colors btn-primary-glow"
                >
                  <RefreshCw className="w-5 h-5" /> Try Again
                </Link>
              )}
              <Link
                to="/"
                className="flex items-center justify-center gap-2 w-full bg-secondary/60 text-foreground rounded-xl px-6 py-3 text-sm font-medium hover:bg-secondary transition-colors border border-border/40"
              >
                <Home className="w-4 h-4" /> Go Home
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
