import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, User, MapPin, Loader2, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getToday } from '@/lib/utils';
import PageHead from '@/components/PageHead';
import { useAuth } from '@/contexts/AuthContext';
import {
  getSeatAvailability, getScheduleDetails, createBooking,
  SeatInfo,
} from '@/services/bookingService';

export default function SeatSelection() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // URL params
  const scheduleId = params.get('scheduleId') || '';
  const from = params.get('from') || 'Dhaka';
  const to = params.get('to') || 'Chattogram';
  const date = params.get('date') || getToday();
  const fare = Number(params.get('fare') || 850);
  const coachName = params.get('coachName') || 'Starline Platinum';
  const coachType = params.get('coachType') || 'AC Sleeper';
  const dep = params.get('dep') || '22:00';
  const arr = params.get('arr') || '03:30';
  const duration = params.get('duration') || '5h 30m';
  const passengers = Math.min(Number(params.get('passengers') || 1), 5);

  // State
  const [seatData, setSeatData] = useState<SeatInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]); // seat IDs
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]); // seat numbers for display
  const [boardingPoint, setBoardingPoint] = useState(`${from} Terminal`);
  const [droppingPoint, setDroppingPoint] = useState(`${to} Terminal`);
  const [passengerName, setPassengerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Pre-fill passenger details from auth profile
  useEffect(() => {
    if (user) {
      setPassengerName(user.user_metadata?.full_name || '');
      setPhone(user.user_metadata?.phone || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Fetch seat availability
  useEffect(() => {
    if (!scheduleId) return;
    setLoading(true);
    getSeatAvailability(scheduleId, date)
      .then(({ seats }) => setSeatData(seats))
      .finally(() => setLoading(false));
  }, [scheduleId, date]);

  // Build seat layout from live data
  // Starline formation: 2+2 rows (A-I or A-J) + optional 5-seat back row
  const seatLayout = useMemo(() => {
    if (seatData.length === 0) return [];
    // Group by row label
    const rows: Record<string, SeatInfo[]> = {};
    seatData.forEach(s => {
      if (!rows[s.rowLabel]) rows[s.rowLabel] = [];
      rows[s.rowLabel].push(s);
    });

    // Sort rows alphabetically, seats within each row by seat number
    const sortedRowLabels = Object.keys(rows).sort();
    return sortedRowLabels.map(label => {
      const rowSeats = rows[label].sort((a, b) => a.seatNumber.localeCompare(b.seatNumber));

      // Standard 2+2 layout with aisle in the middle
      if (rowSeats.length === 4) {
        return [rowSeats[0], rowSeats[1], null, rowSeats[2], rowSeats[3]];
      }
      // Back row — 5 seats, no aisle gap
      if (rowSeats.length === 5) {
        return [rowSeats[0], rowSeats[1], rowSeats[2], rowSeats[3], rowSeats[4]];
      }
      // Fallback
      return rowSeats;
    });
  }, [seatData]);

  const toggleSeat = (seat: SeatInfo) => {
    if (seat.isBooked) return;
    if (selected.includes(seat.id)) {
      setSelected(selected.filter(id => id !== seat.id));
      setSelectedLabels(selectedLabels.filter(l => l !== seat.seatNumber));
    } else if (selected.length < passengers) {
      setSelected([...selected, seat.id]);
      setSelectedLabels([...selectedLabels, seat.seatNumber]);
    }
  };

  const totalFare = selected.length * fare;
  const clearError = (field: string) => {
    setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
  };

  const proceed = async () => {
    // Validate
    const newErrors: Record<string, string> = {};
    if (!passengerName.trim()) newErrors.name = 'Full name is required';
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^(\+?880|0)1[3-9]\d{8}$/.test(phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Enter a valid BD phone number';
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Auth check
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    // Create booking
    setBookingLoading(true);
    setBookingError('');
    const bookingId = await createBooking({
      userId: user.id,
      scheduleId,
      travelDate: date,
      seatIds: selected,
      boarding: boardingPoint,
      dropping: droppingPoint,
      totalFare,
      passengerName: passengerName.trim(),
      passengerPhone: phone.trim(),
      passengerEmail: email || undefined,
    });

    if (bookingId) {
      navigate(`/checkout?bookingId=${bookingId}`);
    } else {
      setBookingError('Failed to create booking. Please try again.');
    }
    setBookingLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHead title="Select Your Seats" description="Choose your preferred seats for your Star Line Group bus journey." />
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container">
          <h1 className="font-display text-2xl font-bold mb-2">Select Your Seats</h1>
          <p className="text-muted-foreground text-sm mb-8">{from} → {to} • {coachName} ({coachType}) • {dep} - {arr}</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Seat Map */}
            <div className="lg:col-span-2">
              <div className="glass-card p-6">
                {/* Legend */}
                <div className="flex items-center gap-4 mb-6 text-xs flex-wrap">
                  <div className="flex items-center gap-1.5"><div className="w-7 h-7 rounded-lg bg-secondary border border-border" /> Available</div>
                  <div className="flex items-center gap-1.5"><div className="w-7 h-7 rounded-lg bg-primary" /> Selected</div>
                  <div className="flex items-center gap-1.5"><div className="w-7 h-7 rounded-lg bg-muted opacity-40" /> Sold</div>
                  <div className="flex items-center gap-1.5"><div className="w-7 h-7 rounded-lg bg-pink-900/30 border border-pink-700/30" /> Ladies</div>
                </div>

                {/* Bus Shape Container */}
                <div className="flex justify-center">
                  <div className="relative w-[280px]">
                    <div className="bg-secondary/30 border-2 border-border/60 rounded-t-[60px] rounded-b-2xl overflow-hidden">
                      {/* Driver area */}
                      <div className="bg-secondary/50 border-b border-border/40 px-6 pt-8 pb-4 rounded-t-[58px]">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-7 rounded-md bg-muted/50 border border-border/50 flex items-center justify-center">
                            <span className="text-[8px] text-muted-foreground">🚪</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">Driver</span>
                          <div className="w-8 h-8 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
                          </div>
                        </div>
                      </div>

                      {/* Seat rows */}
                      <div className="px-4 py-3 flex flex-col gap-1.5">
                        {loading ? (
                          // Loading skeleton
                          Array.from({ length: 10 }).map((_, ri) => (
                            <div key={ri} className="flex items-center justify-center gap-1">
                              {[0,1,2,3,4].map(si => (
                                si === 2 ? (
                                  <div key={si} className="w-11 flex items-center justify-center">
                                    <div className="w-[2px] h-8 bg-border/30 rounded-full" />
                                  </div>
                                ) : (
                                  <div key={si} className="w-11 h-10 rounded-lg bg-secondary/50 animate-pulse" />
                                )
                              ))}
                            </div>
                          ))
                        ) : seatLayout.map((row, ri) => (
                          <div key={ri} className="flex items-center justify-center gap-1">
                            {row.map((seat, si) => {
                              if (!seat) return (
                                <div key={si} className="w-11 flex items-center justify-center">
                                  <div className="w-[2px] h-8 bg-border/30 rounded-full" />
                                </div>
                              );
                              const isBooked = seat.isBooked;
                              const isSelected = selected.includes(seat.id);
                              const isLadies = seat.seatType === 'ladies';
                              return (
                                <motion.button
                                  key={si}
                                  whileTap={{ scale: 0.92 }}
                                  whileHover={!isBooked ? { scale: 1.08 } : {}}
                                  onClick={() => toggleSeat(seat)}
                                  disabled={isBooked}
                                  className={`w-11 h-10 rounded-lg text-[10px] font-semibold transition-all flex flex-col items-center justify-center relative ${
                                    isBooked
                                      ? 'bg-muted/30 text-muted-foreground/20 cursor-not-allowed'
                                      : isSelected
                                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-2 ring-primary/50'
                                      : isLadies
                                      ? 'bg-pink-900/25 border border-pink-700/30 text-pink-300 hover:bg-pink-900/40'
                                      : 'bg-secondary border border-border text-foreground hover:border-primary/50 hover:bg-secondary/80'
                                  }`}
                                >
                                  <div className={`absolute top-0 left-1 right-1 h-[3px] rounded-t-lg ${
                                    isBooked ? 'bg-muted-foreground/10' : isSelected ? 'bg-primary-foreground/30' : 'bg-border'
                                  }`} />
                                  <span className="mt-1">{seat.seatNumber}</span>
                                </motion.button>
                              );
                            })}
                          </div>
                        ))}
                      </div>

                      <div className="h-3 bg-secondary/50 border-t border-border/40" />
                    </div>

                    {/* Side mirrors */}
                    <div className="absolute -left-3 top-[52px] w-3 h-8 bg-secondary/60 border border-border/40 rounded-l-full" />
                    <div className="absolute -right-3 top-[52px] w-3 h-8 bg-secondary/60 border border-border/40 rounded-r-full" />

                    {/* Wheels */}
                    <div className="absolute -left-2 top-[120px] w-3 h-10 bg-muted-foreground/30 rounded-full" />
                    <div className="absolute -right-2 top-[120px] w-3 h-10 bg-muted-foreground/30 rounded-full" />
                    <div className="absolute -left-2 bottom-[40px] w-3 h-10 bg-muted-foreground/30 rounded-full" />
                    <div className="absolute -right-2 bottom-[40px] w-3 h-10 bg-muted-foreground/30 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Boarding/Dropping */}
              <div className="glass-card p-6 mt-6">
                <h3 className="font-display font-semibold mb-4">Boarding & Dropping Points</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Boarding Point</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                      <select title="Select boarding point" value={boardingPoint} onChange={e => setBoardingPoint(e.target.value)} className="w-full bg-secondary text-foreground rounded-lg pl-10 pr-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50">
                        {[`${from} Terminal`, `${from} Bypass`, `${from} Central`].map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Dropping Point</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                      <select title="Select dropping point" value={droppingPoint} onChange={e => setDroppingPoint(e.target.value)} className="w-full bg-secondary text-foreground rounded-lg pl-10 pr-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50">
                        {[`${to} Terminal`, `${to} Main Stand`, `${to} City Center`].map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Passenger Details */}
              <div className="glass-card p-6 mt-6">
                <h3 className="font-display font-semibold mb-4">Passenger Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input value={passengerName} onChange={e => { setPassengerName(e.target.value); clearError('name'); }} placeholder="Rahim Uddin" className={`w-full bg-secondary text-foreground rounded-lg pl-10 pr-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 ${errors.name ? 'ring-2 ring-destructive/50' : 'focus:ring-primary/50'}`} />
                    </div>
                    {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Phone *</label>
                    <input value={phone} onChange={e => { setPhone(e.target.value); clearError('phone'); }} placeholder="+8801XXXXXXXXX" className={`w-full bg-secondary text-foreground rounded-lg px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 ${errors.phone ? 'ring-2 ring-destructive/50' : 'focus:ring-primary/50'}`} />
                    {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
                    <input value={email} onChange={e => { setEmail(e.target.value); clearError('email'); }} placeholder="rahim@email.com" className={`w-full bg-secondary text-foreground rounded-lg px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 ${errors.email ? 'ring-2 ring-destructive/50' : 'focus:ring-primary/50'}`} />
                    {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Fare Summary */}
            <div>
              <div className="glass-card-accent p-6 sticky top-24">
                <h3 className="font-display font-semibold mb-4">Fare Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Coach</span><span>{coachName}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Route</span><span>{from} → {to}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{date}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span>{dep} - {arr}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Selected Seats</span><span>{selectedLabels.length > 0 ? selectedLabels.join(', ') : 'None'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Fare per seat</span><span>৳{fare}</span></div>
                  <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-accent">৳{totalFare}</span>
                  </div>
                </div>

                {bookingError && (
                  <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {bookingError}
                  </div>
                )}

                <button
                  onClick={proceed}
                  disabled={selected.length === 0 || !passengerName || !phone || bookingLoading}
                  className="w-full mt-6 bg-primary text-primary-foreground rounded-lg py-3 font-semibold text-sm hover:bg-primary/90 transition-colors btn-primary-glow disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {bookingLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Creating Booking...</>
                  ) : (
                    <>Proceed to Checkout <ChevronRight className="w-4 h-4" /></>
                  )}
                </button>
                {selected.length === 0 && <p className="text-xs text-muted-foreground mt-2 text-center">Select at least one seat</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
