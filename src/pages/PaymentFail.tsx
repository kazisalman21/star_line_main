import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, RefreshCw, Building2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import PageHead from '@/components/PageHead';

export default function PaymentFail() {
  const [params] = useSearchParams();
  const bookingId = params.get('bookingId') || '';

  return (
    <div className="min-h-screen bg-background">
      <PageHead title="Payment Failed" description="Your payment could not be processed." />
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
              className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center"
            >
              <XCircle className="w-12 h-12 text-red-400" />
            </motion.div>

            <h1 className="font-display text-3xl font-bold mb-2">Payment Failed</h1>
            <p className="text-muted-foreground mb-8">
              Your payment could not be processed. Your booking is still reserved — you can try again.
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
              {bookingId && (
                <Link
                  to={`/ticket?bookingId=${bookingId}`}
                  className="flex items-center justify-center gap-2 w-full bg-secondary/60 text-foreground rounded-xl px-6 py-3 text-sm font-medium hover:bg-secondary transition-colors border border-border/40"
                >
                  <Building2 className="w-4 h-4" /> Pay at Counter Instead
                </Link>
              )}
              <Link
                to="/"
                className="flex items-center justify-center w-full text-muted-foreground text-sm py-3 hover:text-foreground transition-colors"
              >
                Go Home
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
