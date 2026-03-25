import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Download, Headphones, QrCode, Bus, MapPin, Clock, User, CreditCard, ChevronRight, Ticket } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getToday } from '@/lib/utils';
import PageHead from '@/components/PageHead';

export default function TicketConfirmation() {
  const [params] = useSearchParams();
  const bookingId = params.get('bookingId') || 'STR-2026-48291';
  const from = params.get('from') || 'Dhaka';
  const to = params.get('to') || 'Chattogram';
  const date = params.get('date') || getToday();
  const seats = params.get('seats')?.split(',') || ['A1', 'A2'];
  const fare = params.get('fare') || '3740';
  const coachName = params.get('coachName') || 'Starline Platinum';
  const dep = params.get('dep') || '22:00';
  const arr = params.get('arr') || '03:30';
  const boarding = params.get('boarding') || 'Dhaka Terminal';
  const dropping = params.get('dropping') || 'Chattogram Terminal';
  const name = params.get('name') || 'Rahim Uddin';
  const phone = params.get('phone') || '+8801712345678';
  const payment = params.get('payment') || 'bKash';

  return (
    <div className="min-h-screen bg-background">
      <PageHead title="Booking Confirmed" description="Your Star Line Group bus ticket has been confirmed. View your digital ticket and QR code." />
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container max-w-2xl">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-2">Booking Confirmed!</h1>
            <p className="text-muted-foreground">Your ticket has been booked successfully</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/20 to-accent/10 p-6 flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Booking ID</div>
                <div className="font-display font-bold text-lg">{bookingId}</div>
              </div>
              <div className="w-20 h-20 bg-secondary/80 rounded-xl flex items-center justify-center">
                <QrCode className="w-12 h-12 text-muted-foreground" />
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Trip */}
              <div className="flex items-center gap-4">
                <div className="text-center flex-1">
                  <div className="font-display text-2xl font-bold">{dep}</div>
                  <div className="text-sm text-muted-foreground">{from}</div>
                </div>
                <div className="flex flex-col items-center">
                  <Bus className="w-5 h-5 text-primary mb-1" />
                  <div className="w-24 h-px bg-border" />
                </div>
                <div className="text-center flex-1">
                  <div className="font-display text-2xl font-bold">{arr}</div>
                  <div className="text-sm text-muted-foreground">{to}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-secondary/50 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Date</div>
                  <div className="font-medium">{date}</div>
                </div>
                <div className="bg-secondary/50 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Coach</div>
                  <div className="font-medium">{coachName}</div>
                </div>
                <div className="bg-secondary/50 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Seats</div>
                  <div className="font-medium">{seats.join(', ')}</div>
                </div>
                <div className="bg-secondary/50 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Passenger</div>
                  <div className="font-medium">{name}</div>
                </div>
                <div className="bg-secondary/50 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Boarding</div>
                  <div className="font-medium">{boarding}</div>
                </div>
                <div className="bg-secondary/50 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Dropping</div>
                  <div className="font-medium">{dropping}</div>
                </div>
              </div>

              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Total Paid ({payment})</div>
                  <div className="font-display font-bold text-xl text-accent">৳{fare}</div>
                </div>
                <CreditCard className="w-6 h-6 text-accent" />
              </div>

              {/* Boarding Info */}
              <div className="bg-secondary/30 rounded-lg p-4 text-sm space-y-2">
                <h4 className="font-semibold text-foreground">Boarding Instructions</h4>
                <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Arrive at {boarding} at least 15 minutes before departure</li>
                  <li>Carry a valid photo ID</li>
                  <li>Show this digital ticket or QR code to the conductor</li>
                  <li>Max baggage: 2 bags (20kg each) + 1 carry-on</li>
                </ul>
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button className="flex-1 glass-card px-5 py-3 flex items-center justify-center gap-2 text-sm font-medium hover:bg-card transition-colors">
              <Download className="w-4 h-4" /> Download Ticket
            </button>
            <Link to="/manage-booking" className="flex-1 glass-card px-5 py-3 flex items-center justify-center gap-2 text-sm font-medium hover:bg-card transition-colors">
              <Ticket className="w-4 h-4" /> Manage Booking
            </Link>
            <Link to="/support" className="flex-1 glass-card px-5 py-3 flex items-center justify-center gap-2 text-sm font-medium hover:bg-card transition-colors">
              <Headphones className="w-4 h-4" /> Support
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
