import { useState, useRef, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Download, Headphones, Bus, MapPin, Clock, User, CreditCard, ChevronRight, Ticket, Loader2, AlertCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHead from '@/components/PageHead';
import { getBookingDetails, BookingDetails } from '@/services/bookingService';

export default function TicketConfirmation() {
  const [params] = useSearchParams();
  const bookingId = params.get('bookingId') || '';

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const ticketRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!bookingId) { setLoading(false); return; }
    getBookingDetails(bookingId)
      .then(setBooking)
      .finally(() => setLoading(false));
  }, [bookingId]);

  // Derived values
  const pnr = booking ? `STR-${booking.id.slice(0, 8).toUpperCase()}` : '';
  const seatLabels = booking?.seats.map(s => s.seatNumber) || [];

  const qrData = booking ? JSON.stringify({
    id: booking.id,
    pnr,
    from: booking.route.origin,
    to: booking.route.destination,
    date: booking.travelDate,
    dep: booking.schedule.departureTime,
    seats: seatLabels.join(','),
    passenger: booking.passengerName,
    fare: booking.totalFare,
  }) : '';

  const downloadTicket = async () => {
    if (!ticketRef.current || downloading || !booking) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: '#0f1117',
        scale: 2,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (canvas.height * pdfW) / canvas.width;

      // Header
      pdf.setFillColor(180, 30, 50);
      pdf.rect(0, 0, pdfW, 14, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.text('STAR LINE GROUP', pdfW / 2, 9, { align: 'center' });

      // Ticket image
      pdf.addImage(imgData, 'PNG', 4, 18, pdfW - 8, pdfH - 8);

      // Footer
      const footerY = 18 + pdfH - 4;
      pdf.setFontSize(7);
      pdf.setTextColor(120, 120, 120);
      pdf.text('This is a digitally generated ticket. Valid with photo ID.', pdfW / 2, footerY, { align: 'center' });

      pdf.save(`StarLine-${pnr}.pdf`);
    } catch (e) {
      console.error('PDF generation failed:', e);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 pb-12">
          <div className="container max-w-2xl">
            <div className="animate-pulse space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary mx-auto" />
              <div className="h-8 bg-secondary rounded w-1/2 mx-auto" />
              <div className="glass-card p-6 space-y-4">
                {[1,2,3,4,5,6].map(i => <div key={i} className="h-12 bg-secondary rounded-lg" />)}
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
            <p className="text-muted-foreground mb-6">We couldn't find this booking.</p>
            <Link to="/search" className="bg-primary text-primary-foreground rounded-lg px-6 py-3 text-sm font-semibold">
              Search Trips
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
            <h1 className="font-display text-3xl font-bold mb-2">
              {booking.status === 'confirmed' ? 'Booking Confirmed!' :
               booking.status === 'pending' ? 'Booking Reserved' :
               booking.status === 'cancelled' ? 'Booking Cancelled' : 'Your Ticket'}
            </h1>
            <p className="text-muted-foreground">
              {booking.status === 'pending'
                ? 'Complete payment to confirm your booking'
                : 'Your ticket has been booked successfully'}
            </p>
          </motion.div>

          <motion.div ref={ticketRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/20 to-accent/10 p-6 flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Booking ID</div>
                <div className="font-display font-bold text-lg">{pnr}</div>
                {/* Payment status badge */}
                {booking.payment?.status === 'success' ? (
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Paid via {booking.payment.method}
                  </span>
                ) : booking.status === 'cancelled' ? (
                  <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                    Cancelled
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Clock className="w-3 h-3" /> Payment Pending
                  </span>
                )}
              </div>
              <div className="bg-white p-2 rounded-xl">
                <QRCodeSVG value={qrData} size={72} level="M" />
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Trip */}
              <div className="flex items-center gap-4">
                <div className="text-center flex-1">
                  <div className="font-display text-2xl font-bold">{booking.schedule.departureTime}</div>
                  <div className="text-sm text-muted-foreground">{booking.route.origin}</div>
                </div>
                <div className="flex flex-col items-center">
                  <Bus className="w-5 h-5 text-primary mb-1" />
                  <div className="w-24 h-px bg-border" />
                </div>
                <div className="text-center flex-1">
                  <div className="font-display text-2xl font-bold">{booking.schedule.arrivalTime}</div>
                  <div className="text-sm text-muted-foreground">{booking.route.destination}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-secondary/50 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Date</div>
                  <div className="font-medium">{booking.travelDate}</div>
                </div>
                <div className="bg-secondary/50 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Coach</div>
                  <div className="font-medium">{booking.bus.name}</div>
                </div>
                <div className="bg-secondary/50 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Seats</div>
                  <div className="font-medium">{seatLabels.join(', ')}</div>
                </div>
                <div className="bg-secondary/50 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Passenger</div>
                  <div className="font-medium">{booking.passengerName}</div>
                </div>
                <div className="bg-secondary/50 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Boarding</div>
                  <div className="font-medium">{booking.boardingPoint}</div>
                </div>
                <div className="bg-secondary/50 p-3 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Dropping</div>
                  <div className="font-medium">{booking.droppingPoint}</div>
                </div>
              </div>

              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">
                    {booking.payment?.status === 'success' ? `Total Paid (${booking.payment.method})` : 'Total Due'}
                  </div>
                  <div className="font-display font-bold text-xl text-accent">৳{booking.totalFare}</div>
                  {booking.payment?.transactionId && (
                    <div className="text-[10px] text-muted-foreground mt-0.5">TXN: {booking.payment.transactionId}</div>
                  )}
                </div>
                <CreditCard className="w-6 h-6 text-accent" />
              </div>

              {/* Pay Now button for pending bookings */}
              {booking.status === 'pending' && !booking.payment?.status && (
                <Link
                  to={`/checkout?bookingId=${booking.id}`}
                  className="block w-full text-center bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold text-sm hover:bg-primary/90 transition-colors btn-primary-glow"
                >
                  Pay Now — ৳{booking.totalFare}
                </Link>
              )}

              {/* Boarding Info */}
              <div className="bg-secondary/30 rounded-lg p-4 text-sm space-y-2">
                <h4 className="font-semibold text-foreground">Boarding Instructions</h4>
                <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Arrive at {booking.boardingPoint} at least 15 minutes before departure</li>
                  <li>Carry a valid photo ID</li>
                  <li>Show this digital ticket or QR code to the conductor</li>
                  <li>Max baggage: 2 bags (20kg each) + 1 carry-on</li>
                </ul>
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={downloadTicket}
              disabled={downloading}
              className="flex-1 glass-card px-5 py-3 flex items-center justify-center gap-2 text-sm font-medium hover:bg-card transition-colors disabled:opacity-50"
            >
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {downloading ? 'Generating...' : 'Download Ticket'}
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
