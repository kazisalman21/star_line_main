import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, MapPin, Users, Wifi, Snowflake, Zap, ChevronRight, Filter, ArrowUpDown, Coffee, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SearchForm from '@/components/SearchForm';
import { searchTrips, BusResult } from '@/services/routeService';
import { getToday } from '@/lib/utils';
import SearchResultsSkeleton from '@/components/SearchResultsSkeleton';
import PageHead from '@/components/PageHead';

const amenityIcons: Record<string, typeof Wifi> = {
  'AC': Snowflake, 'WiFi': Wifi, 'USB Charging': Zap, 'Snacks': Coffee,
};

export default function SearchResults() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const from = params.get('from') || 'Dhaka';
  const to = params.get('to') || 'Chattogram';
  const date = params.get('date') || getToday();
  const passengers = Number(params.get('passengers') || 1);

  const [sortBy, setSortBy] = useState<'price' | 'departure' | 'duration'>('departure');
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<BusResult[]>([]);

  useEffect(() => {
    setLoading(true);
    searchTrips(from, to, date)
      .then(setResults)
      .finally(() => setLoading(false));
  }, [from, to, date]);

  const filtered = useMemo(() => {
    let r = filterType === 'all' ? results : results.filter(b => b.coachType === filterType);
    if (sortBy === 'price') r = [...r].sort((a, b) => a.fare - b.fare);
    if (sortBy === 'departure') r = [...r].sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    return r;
  }, [results, sortBy, filterType]);

  const selectBus = (bus: BusResult) => {
    navigate(`/seat-selection?busId=${bus.id}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}&passengers=${passengers}&fare=${bus.fare}&coachName=${encodeURIComponent(bus.coachName)}&coachType=${encodeURIComponent(bus.coachType)}&dep=${bus.departureTime}&arr=${bus.arrivalTime}&duration=${encodeURIComponent(bus.duration)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHead title={`${from} to ${to} Buses`} description={`Find and book buses from ${from} to ${to}. Compare fares, timings, and seat availability.`} />
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container">
          <SearchForm variant="compact" initialFrom={from} initialTo={to} initialDate={date} />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-8 mb-6">
            <div>
              <h1 className="font-display text-2xl font-bold">{from} → {to}</h1>
              <p className="text-sm text-muted-foreground">{filtered.length} trips available • {date}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select value={filterType} onChange={e => setFilterType(e.target.value)} className="bg-secondary text-foreground text-sm rounded-lg px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="all">All Classes</option>
                  <option value="AC Sleeper">AC Sleeper</option>
                  <option value="AC Business">AC Business</option>
                  <option value="AC Economy">AC Economy</option>
                  <option value="Non-AC">Non-AC</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="bg-secondary text-foreground text-sm rounded-lg px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="departure">Departure</option>
                  <option value="price">Price</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <SearchResultsSkeleton />
          ) : filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-12 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold mb-2">No trips found</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                We couldn't find any available trips from <span className="text-foreground font-medium">{from}</span> to <span className="text-foreground font-medium">{to}</span> on {date}. Try a different date or route.
              </p>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-4">
              {filtered.map((bus, i) => (
                <motion.div
                  key={bus.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-5 card-hover"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-primary">{bus.coachName}</span>
                        <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{bus.coachType}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="text-center">
                          <div className="font-display text-xl font-bold">{bus.departureTime}</div>
                          <div className="text-xs text-muted-foreground">{from}</div>
                        </div>
                        <div className="flex-1 flex flex-col items-center">
                          <div className="text-xs text-muted-foreground mb-1">{bus.duration}</div>
                          <div className="w-full h-px bg-border relative">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent" />
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="font-display text-xl font-bold">{bus.arrivalTime}</div>
                          <div className="text-xs text-muted-foreground">{to}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        {bus.amenities.slice(0, 4).map(a => {
                          const Icon = amenityIcons[a] || Clock;
                          return (
                            <span key={a} className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Icon className="w-3 h-3" /> {a}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-end gap-4 md:gap-2">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{bus.availableSeats} seats left</span>
                      </div>
                      <div className="font-display text-2xl font-bold text-accent">৳{bus.fare}</div>
                      <button
                        onClick={() => selectBus(bus)}
                        className="bg-primary text-primary-foreground rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors btn-primary-glow flex items-center gap-1"
                      >
                        Select Seats <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
