import { useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Download, Headphones, Bus, MapPin, Clock, User, CreditCard, ChevronRight, Ticket, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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

  const ticketRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const qrData = JSON.stringify({
    id: bookingId,
    from,
    to,
    date,
    dep,
    seats: seats.join(','),
    passenger: name,
    fare,
  });

  const downloadTicket = async () => {
    if (!ticketRef.current || downloading) return;
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

      pdf.save(`StarLine-${bookingId}.pdf`);
    } catch (e) {
      console.error('PDF generation failed:', e);
    } finally {
      setDownloading(false);
    }
  };

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

          <motion.div ref={ticketRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/20 to-accent/10 p-6 flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Booking ID</div>
                <div className="font-display font-bold text-lg">{bookingId}</div>
              </div>
              <div className="bg-white p-2 rounded-xl">
                <QRCodeSVG value={qrData} size={72} level="M" />
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
