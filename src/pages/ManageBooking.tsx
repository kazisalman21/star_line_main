import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Ticket, XCircle, RefreshCw, Send, CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHead from '@/components/PageHead';
import { getBookingDetails, cancelBooking, BookingDetails } from '@/services/bookingService';
import { supabase } from '@/lib/supabase';

export default function ManageBooking() {
  const navigate = useNavigate();
  const [lookupId, setLookupId] = useState('');
  const [lookupPhone, setLookupPhone] = useState('');
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleSearch = async () => {
    if (!lookupId.trim()) return;
    setSearching(true);
    setSearched(true);

    let bookingId = lookupId.trim();
    
    // If the user typed a PNR like "STR-XXXXXXXX", extract the UUID prefix
    if (bookingId.toUpperCase().startsWith('STR-')) {
      const idFragment = bookingId.slice(4).toLowerCase();
      // Search for bookings whose ID starts with this fragment
      const { data: matches } = await supabase
        .from('bookings')
        .select('id')
        .ilike('id', `${idFragment}%`)
        .limit(1);
      
      if (matches && matches.length > 0) {
        bookingId = matches[0].id;
      } else {
        setBooking(null);
        setSearching(false);
        return;
      }
    }

    const result = await getBookingDetails(bookingId);

    // Optionally verify phone matches
    if (result && lookupPhone.trim()) {
      if (result.passengerPhone !== lookupPhone.trim()) {
        setBooking(null);
        setSearching(false);
        return;
      }
    }

    setBooking(result);
    setSearching(false);
  };

  const handleCancel = async () => {
    if (!booking) return;
    setCancelling(true);
    const ok = await cancelBooking(booking.id);
    if (ok) {
      setBooking({ ...booking, status: 'cancelled' });
    }
    setCancelling(false);
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    confirmed: 'bg-success/10 text-success border-success/20',
    cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
    completed: 'bg-info/10 text-info border-info/20',
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHead title="Manage Your Booking" description="Look up, manage, cancel, or reschedule your Star Line Group bus booking." />
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container max-w-2xl">
          <h1 className="font-display text-3xl font-bold mb-2">Manage Booking</h1>
          <p className="text-muted-foreground mb-8">Look up your booking to view details, cancel, or resend your ticket</p>

          <div className="glass-card p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Booking ID *</label>
                <input value={lookupId} onChange={e => setLookupId(e.target.value)} placeholder="Paste your Booking ID" className="w-full bg-secondary text-foreground rounded-lg px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Phone (optional)</label>
                <input value={lookupPhone} onChange={e => setLookupPhone(e.target.value)} placeholder="+8801XXXXXXXXX" className="w-full bg-secondary text-foreground rounded-lg px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>
            <button
              onClick={handleSearch}
              disabled={searching || !lookupId.trim()}
              className="mt-4 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold text-sm hover:bg-primary/90 transition-colors btn-primary-glow flex items-center gap-2 disabled:opacity-40"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {searching ? 'Searching...' : 'Look Up Booking'}
            </button>
          </div>

          {searched && !searching && !booking && (
            <div className="glass-card p-10 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No booking found. Please check your booking ID and try again.</p>
            </div>
          )}

          {booking && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs text-muted-foreground">Booking ID</div>
                    <div className="font-display font-bold text-lg">STR-{booking.id.slice(0, 8).toUpperCase()}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[booking.status] || ''}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-secondary/50 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Route</div>
                    <div className="font-medium">{booking.route.origin} → {booking.route.destination}</div>
                  </div>
                  <div className="bg-secondary/50 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Date & Time</div>
                    <div className="font-medium">{booking.travelDate} • {booking.schedule.departureTime}</div>
                  </div>
                  <div className="bg-secondary/50 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Coach</div>
                    <div className="font-medium">{booking.bus.name}</div>
                  </div>
                  <div className="bg-secondary/50 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Seats</div>
                    <div className="font-medium">{booking.seats.map(s => s.seatNumber).join(', ')}</div>
                  </div>
                  <div className="bg-secondary/50 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Passenger</div>
                    <div className="font-medium">{booking.passengerName}</div>
                  </div>
                  <div className="bg-secondary/50 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Total Paid</div>
                    <div className="font-medium text-accent">৳{booking.totalFare}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(booking.status === 'pending' || booking.status === 'confirmed') && (
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="glass-card p-4 flex items-center justify-center gap-2 text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors disabled:opacity-40"
                  >
                    {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    {cancelling ? 'Cancelling...' : 'Cancel Booking'}
                  </button>
                )}
                <button
                  onClick={() => navigate(`/ticket?bookingId=${booking.id}`)}
                  className="glass-card p-4 flex items-center justify-center gap-2 text-sm font-medium text-foreground hover:bg-card transition-colors"
                >
                  <Ticket className="w-4 h-4" /> View Ticket
                </button>
                <button className="glass-card p-4 flex items-center justify-center gap-2 text-sm font-medium text-foreground hover:bg-card transition-colors">
                  <Send className="w-4 h-4" /> Resend Ticket
                </button>
              </div>

              {/* Refund Status */}
              <div className="glass-card p-6">
                <h3 className="font-display font-semibold mb-3">Booking Status</h3>
                <div className="flex items-center gap-3 text-sm">
                  {booking.status === 'cancelled' ? (
                    <>
                      <XCircle className="w-5 h-5 text-destructive" />
                      <span className="text-muted-foreground">This booking has been cancelled.</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-success" />
                      <span className="text-muted-foreground">Booking is {booking.status}. No refund request pending.</span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
