import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Ticket, XCircle, RefreshCw, Send, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { sampleBooking } from '@/data/mockData';
import PageHead from '@/components/PageHead';

export default function ManageBooking() {
  const [lookupId, setLookupId] = useState('');
  const [lookupPhone, setLookupPhone] = useState('');
  const [booking, setBooking] = useState<typeof sampleBooking | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    setSearched(true);
    if (lookupId || lookupPhone) setBooking(sampleBooking);
    else setBooking(null);
  };

  const statusColors = {
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
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Booking ID</label>
                <input value={lookupId} onChange={e => setLookupId(e.target.value)} placeholder="STR-2026-XXXXX" className="w-full bg-secondary text-foreground rounded-lg px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Phone or Email</label>
                <input value={lookupPhone} onChange={e => setLookupPhone(e.target.value)} placeholder="+8801XXXXXXXXX" className="w-full bg-secondary text-foreground rounded-lg px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>
            <button onClick={handleSearch} className="mt-4 bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold text-sm hover:bg-primary/90 transition-colors btn-primary-glow flex items-center gap-2">
              <Search className="w-4 h-4" /> Look Up Booking
            </button>
          </div>

          {searched && !booking && (
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
                    <div className="font-display font-bold text-lg">{booking.bookingId}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[booking.status]}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-secondary/50 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Route</div>
                    <div className="font-medium">{booking.from} → {booking.to}</div>
                  </div>
                  <div className="bg-secondary/50 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Date & Time</div>
                    <div className="font-medium">{booking.date} • {booking.departureTime}</div>
                  </div>
                  <div className="bg-secondary/50 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Coach</div>
                    <div className="font-medium">{booking.coachName}</div>
                  </div>
                  <div className="bg-secondary/50 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Seats</div>
                    <div className="font-medium">{booking.seats.join(', ')}</div>
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
                <button className="glass-card p-4 flex items-center justify-center gap-2 text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors">
                  <XCircle className="w-4 h-4" /> Cancel Booking
                </button>
                <button className="glass-card p-4 flex items-center justify-center gap-2 text-sm font-medium text-info hover:bg-info/5 transition-colors">
                  <RefreshCw className="w-4 h-4" /> Reschedule
                </button>
                <button className="glass-card p-4 flex items-center justify-center gap-2 text-sm font-medium text-foreground hover:bg-card transition-colors">
                  <Send className="w-4 h-4" /> Resend Ticket
                </button>
              </div>

              {/* Refund Status */}
              <div className="glass-card p-6">
                <h3 className="font-display font-semibold mb-3">Refund Status</h3>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                  <span className="text-muted-foreground">No refund request pending. Booking is active.</span>
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
