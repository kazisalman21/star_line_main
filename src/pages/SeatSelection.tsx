import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, User, MapPin } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getToday } from '@/lib/utils';

const seatLayout = [
  ['A1','','A2','A3'],
  ['B1','','B2','B3'],
  ['C1','','C2','C3'],
  ['D1','','D2','D3'],
  ['E1','','E2','E3'],
  ['F1','','F2','F3'],
  ['G1','','G2','G3'],
  ['H1','H2','H3','H4','H5'],
];

const unavailable = ['B2', 'C1', 'D3', 'F2', 'G1', 'H3'];
const ladies = ['A2', 'A3'];

export default function SeatSelection() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const from = params.get('from') || 'Dhaka';
  const to = params.get('to') || 'Chattogram';
  const date = params.get('date') || getToday();
  const fare = Number(params.get('fare') || 850);
  const coachName = params.get('coachName') || 'Starline Platinum';
  const coachType = params.get('coachType') || 'AC Sleeper';
  const dep = params.get('dep') || '22:00';
  const arr = params.get('arr') || '03:30';
  const duration = params.get('duration') || '5h 30m';
  const passengers = Number(params.get('passengers') || 1);

  const [selected, setSelected] = useState<string[]>([]);
  const [boardingPoint, setBoardingPoint] = useState(`${from} Terminal`);
  const [droppingPoint, setDroppingPoint] = useState(`${to} Terminal`);
  const [passengerName, setPassengerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleSeat = (seat: string) => {
    if (unavailable.includes(seat)) return;
    if (selected.includes(seat)) {
      setSelected(selected.filter(s => s !== seat));
    } else if (selected.length < passengers) {
      setSelected([...selected, seat]);
    }
  };

  const totalFare = selected.length * fare;

  const clearError = (field: string) => {
    setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
  };

  const proceed = () => {
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
    navigate(`/checkout?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}&seats=${selected.join(',')}&fare=${totalFare}&coachName=${encodeURIComponent(coachName)}&coachType=${encodeURIComponent(coachType)}&dep=${dep}&arr=${arr}&duration=${encodeURIComponent(duration)}&boarding=${encodeURIComponent(boardingPoint)}&dropping=${encodeURIComponent(droppingPoint)}&name=${encodeURIComponent(passengerName)}&phone=${encodeURIComponent(phone)}&email=${encodeURIComponent(email)}`);
  };


  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container">
          <h1 className="font-display text-2xl font-bold mb-2">Select Your Seats</h1>
          <p className="text-muted-foreground text-sm mb-8">{from} → {to} • {coachName} ({coachType}) • {dep} - {arr}</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Seat Map */}
            <div className="lg:col-span-2">
              <div className="glass-card p-6">
                <div className="flex items-center gap-4 mb-6 text-xs">
                  <div className="flex items-center gap-1.5"><div className="w-6 h-6 rounded-md bg-secondary border border-border" /> Available</div>
                  <div className="flex items-center gap-1.5"><div className="w-6 h-6 rounded-md bg-primary" /> Selected</div>
                  <div className="flex items-center gap-1.5"><div className="w-6 h-6 rounded-md bg-muted opacity-40" /> Sold</div>
                  <div className="flex items-center gap-1.5"><div className="w-6 h-6 rounded-md bg-pink-900/30 border border-pink-700/30" /> Ladies</div>
                </div>

                <div className="bg-secondary/50 rounded-xl p-6">
                  <div className="text-center text-xs text-muted-foreground mb-4">Front</div>
                  <div className="flex flex-col gap-2 max-w-xs mx-auto">
                    {seatLayout.map((row, ri) => (
                      <div key={ri} className="flex gap-2 justify-center">
                        {row.map((seat, si) => {
                          if (!seat) return <div key={si} className="w-10 h-10" />;
                          const isUnavailable = unavailable.includes(seat);
                          const isSelected = selected.includes(seat);
                          const isLadies = ladies.includes(seat);
                          return (
                            <button
                              key={si}
                              onClick={() => toggleSeat(seat)}
                              disabled={isUnavailable}
                              className={`w-10 h-10 rounded-md text-xs font-medium transition-all flex items-center justify-center ${
                                isUnavailable
                                  ? 'bg-muted/40 text-muted-foreground/30 cursor-not-allowed'
                                  : isSelected
                                  ? 'bg-primary text-primary-foreground scale-105 shadow-lg'
                                  : isLadies
                                  ? 'bg-pink-900/30 border border-pink-700/30 text-pink-300 hover:bg-pink-900/50'
                                  : 'bg-secondary border border-border text-foreground hover:bg-secondary/80 hover:border-primary/50'
                              }`}
                            >
                              {seat}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  <div className="text-center text-xs text-muted-foreground mt-4">Rear</div>
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
                      <select value={boardingPoint} onChange={e => setBoardingPoint(e.target.value)} className="w-full bg-secondary text-foreground rounded-lg pl-10 pr-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50">
                        {[`${from} Terminal`, `${from} Bypass`, `${from} Central`].map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Dropping Point</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                      <select value={droppingPoint} onChange={e => setDroppingPoint(e.target.value)} className="w-full bg-secondary text-foreground rounded-lg pl-10 pr-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50">
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
                  <div className="flex justify-between"><span className="text-muted-foreground">Selected Seats</span><span>{selected.length > 0 ? selected.join(', ') : 'None'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Fare per seat</span><span>৳{fare}</span></div>
                  <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-accent">৳{totalFare}</span>
                  </div>
                </div>
                <button
                  onClick={proceed}
                  disabled={selected.length === 0 || !passengerName || !phone}
                  className="w-full mt-6 bg-primary text-primary-foreground rounded-lg py-3 font-semibold text-sm hover:bg-primary/90 transition-colors btn-primary-glow disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <ChevronRight className="w-4 h-4" />
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
