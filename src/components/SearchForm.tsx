import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, ArrowRightLeft, Search } from 'lucide-react';
import { cities } from '@/data/mockData';

interface Props {
  variant?: 'hero' | 'compact';
  initialFrom?: string;
  initialTo?: string;
  initialDate?: string;
}

export default function SearchForm({ variant = 'hero', initialFrom = '', initialTo = '', initialDate = '' }: Props) {
  const navigate = useNavigate();
  const [from, setFrom] = useState(initialFrom || 'Dhaka');
  const [to, setTo] = useState(initialTo || 'Chattogram');
  const [date, setDate] = useState(initialDate || '2026-03-25');
  const [passengers, setPassengers] = useState(1);

  const swap = () => { setFrom(to); setTo(from); };

  const handleSearch = () => {
    navigate(`/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}&passengers=${passengers}`);
  };

  const isHero = variant === 'hero';

  return (
    <div className={`${isHero ? 'glass-card p-6 md:p-8' : 'bg-card border border-border rounded-xl p-4'}`}>
      <div className={`grid gap-4 ${isHero ? 'md:grid-cols-[1fr_auto_1fr_1fr_auto_auto]' : 'md:grid-cols-[1fr_auto_1fr_1fr_auto_auto]'} items-end`}>
        {/* From */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">From</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
            <select
              value={from}
              onChange={e => setFrom(e.target.value)}
              className="w-full bg-secondary text-foreground rounded-lg pl-10 pr-4 py-3 text-sm font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Swap */}
        <button onClick={swap} className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary hover:bg-primary/20 transition-colors self-end mb-0.5">
          <ArrowRightLeft className="w-4 h-4 text-primary" />
        </button>

        {/* To */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">To</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
            <select
              value={to}
              onChange={e => setTo(e.target.value)}
              className="w-full bg-secondary text-foreground rounded-lg pl-10 pr-4 py-3 text-sm font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-secondary text-foreground rounded-lg pl-10 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Passengers */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Passengers</label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              value={passengers}
              onChange={e => setPassengers(Number(e.target.value))}
              className="w-full bg-secondary text-foreground rounded-lg pl-10 pr-4 py-3 text-sm font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        {/* Search */}
        <button
          onClick={handleSearch}
          className="bg-primary text-primary-foreground rounded-lg px-6 py-3 font-semibold text-sm hover:bg-primary/90 transition-colors btn-primary-glow flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          Search
        </button>
      </div>
    </div>
  );
}
