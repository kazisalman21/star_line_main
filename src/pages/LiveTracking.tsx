import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bus, MapPin, Clock, CheckCircle2, AlertTriangle, Navigation, Search, Loader2, Radio, Wifi } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHead from '@/components/PageHead';
import { getTripStatus, subscribeToTripUpdates, TripTrackingData } from '@/services/trackingService';
import { supabase } from '@/lib/supabase';

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: typeof Bus }> = {
  scheduled: { label: 'Scheduled', color: 'text-gray-400', bg: 'bg-gray-500/10', icon: Clock },
  boarding: { label: 'Boarding', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Bus },
  in_transit: { label: 'In Transit', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: Navigation },
  delayed: { label: 'Delayed', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: AlertTriangle },
  arrived: { label: 'Arrived', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-500/10', icon: AlertTriangle },
};

export default function LiveTracking() {
  const [params] = useSearchParams();
  const scheduleId = params.get('scheduleId') || '';
  const date = params.get('date') || new Date().toISOString().split('T')[0];

  const [pnrInput, setPnrInput] = useState('');
  const [trip, setTrip] = useState<TripTrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [lastUpdateAgo, setLastUpdateAgo] = useState('');
  const unsubRef = useRef<(() => void) | null>(null);

  // Load trip by scheduleId from URL
  useEffect(() => {
    if (!scheduleId) return;
    setLoading(true);
    setNotFound(false);
    getTripStatus(scheduleId, date).then(data => {
      if (data) {
        setTrip(data);
        setNotFound(false);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    });
  }, [scheduleId, date]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!trip?.scheduleId) return;
    unsubRef.current = subscribeToTripUpdates(trip.scheduleId, trip.travelDate, (update) => {
      setTrip(prev => prev ? { ...prev, ...update } : prev);
    });
    return () => { unsubRef.current?.(); };
  }, [trip?.scheduleId, trip?.travelDate]);

  // "Updated X ago" timer
  useEffect(() => {
    if (!trip?.lastUpdated) return;
    const tick = () => {
      const diff = Math.floor((Date.now() - new Date(trip.lastUpdated).getTime()) / 1000);
      if (diff < 60) setLastUpdateAgo(`${diff}s ago`);
      else if (diff < 3600) setLastUpdateAgo(`${Math.floor(diff / 60)}m ago`);
      else setLastUpdateAgo(`${Math.floor(diff / 3600)}h ago`);
    };
    tick();
    const interval = setInterval(tick, 5000);
    return () => clearInterval(interval);
  }, [trip?.lastUpdated]);

  // Search by PNR → get booking → get schedule_id → get trip
  const handlePnrSearch = async () => {
    if (!pnrInput.trim()) return;
    setLoading(true);
    setNotFound(false);
    setTrip(null);

    // Extract booking ID from PNR format "STR-XXXXXXXX"
    const bookingIdPrefix = pnrInput.replace('STR-', '').toLowerCase();

    const { data: bookings } = await supabase
      .from('bookings')
      .select('schedule_id, travel_date')
      .ilike('id', `${bookingIdPrefix}%`)
      .limit(1);

    if (!bookings || bookings.length === 0) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const booking = bookings[0];
    const data = await getTripStatus(booking.schedule_id, booking.travel_date);
    if (data) {
      setTrip(data);
    } else {
      setNotFound(true);
    }
    setLoading(false);
  };

  const statusMeta = trip ? STATUS_META[trip.status] || STATUS_META.scheduled : null;

  // Generate stop indicators from progress
  const stops = trip ? Array.from({ length: trip.totalStops }, (_, i) => {
    if (i < trip.stopsCompleted) return 'completed';
    if (i === trip.stopsCompleted) return 'current';
    return 'upcoming';
  }) : [];

  return (
    <div className="min-h-screen bg-background">
      <PageHead title="Live Trip Tracking" description="Track your Star Line Group bus in real-time. View current location, ETA, and route progress." />
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container max-w-3xl">
          <h1 className="font-display text-3xl font-bold mb-2">Live Trip Tracking</h1>
          <p className="text-muted-foreground text-sm mb-8">Real-time status for your trip</p>

          {/* PNR Search (shown when no trip is loaded) */}
          {!trip && !loading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-8">
              <h3 className="font-display font-semibold mb-3">Track Your Bus</h3>
              <p className="text-sm text-muted-foreground mb-4">Enter your PNR to see live trip status</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Enter PNR (e.g. STR-A1B2C3D4)"
                    value={pnrInput}
                    onChange={e => setPnrInput(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && handlePnrSearch()}
                    className="w-full bg-secondary/50 border border-border/30 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <button
                  onClick={handlePnrSearch}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors btn-primary-glow"
                >
                  Track
                </button>
              </div>
              {notFound && (
                <p className="text-sm text-red-400 mt-3">No live tracking available for this booking. The bus may not have departed yet.</p>
              )}
            </motion.div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}

          {/* Trip Data */}
          {trip && statusMeta && (
            <div className="space-y-6">
              {/* Status Card */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card-accent p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${statusMeta.bg} flex items-center justify-center`}>
                      <statusMeta.icon className={`w-5 h-5 ${statusMeta.color}`} />
                    </div>
                    <div>
                      <div className="font-display font-bold">{trip.coachName || 'Unknown Coach'}</div>
                      <div className="text-xs text-muted-foreground">{trip.coachType} • {trip.route}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 ${statusMeta.bg} ${statusMeta.color} text-xs font-medium rounded-full`}>
                      {statusMeta.label}
                    </span>
                    <div className="flex items-center gap-1 justify-end mt-1">
                      <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                      <span className="text-xs text-muted-foreground">{lastUpdateAgo}</span>
                    </div>
                  </div>
                </div>

                {/* Current Location */}
                {trip.currentStop && (
                  <div className="bg-secondary/30 rounded-xl p-4 mb-4">
                    <div className="text-xs text-muted-foreground mb-1">Current Location</div>
                    <div className="font-display text-lg font-bold flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      {trip.currentStop}
                    </div>
                    {trip.nextStop && (
                      <div className="text-xs text-muted-foreground mt-1">Next: {trip.nextStop}</div>
                    )}
                  </div>
                )}

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{trip.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-primary to-accent h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${trip.progressPercent}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Times */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground">Departure</div>
                    <div className="font-display font-bold">{trip.departureTime || '--:--'}</div>
                  </div>
                  {trip.eta && (
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">ETA</div>
                      <div className="font-display font-bold text-primary">{trip.eta}</div>
                    </div>
                  )}
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Scheduled Arrival</div>
                    <div className="font-display font-bold">{trip.arrivalTime || '--:--'}</div>
                  </div>
                </div>
              </motion.div>

              {/* Route Progress (Visual Stops) */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
                <h3 className="font-display font-semibold mb-4">Route Progress</h3>
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />
                  <div className="absolute left-[11px] top-2 w-0.5 bg-primary transition-all duration-1000" style={{ height: `${(trip.stopsCompleted / Math.max(trip.totalStops - 1, 1)) * 100}%` }} />

                  <div className="space-y-4">
                    {stops.map((status, i) => (
                      <div key={i} className="flex items-center gap-4 relative">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 shrink-0 ${
                          status === 'completed' ? 'bg-primary' :
                          status === 'current' ? 'bg-primary ring-4 ring-primary/20 animate-pulse' :
                          'bg-secondary border-2 border-border'
                        }`}>
                          {status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                          {status === 'current' && <Navigation className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1">
                          <div className={`text-sm font-medium ${status === 'upcoming' ? 'text-muted-foreground' : 'text-foreground'}`}>
                            {status === 'current' && trip.currentStop ? trip.currentStop :
                             status === 'completed' && i === 0 ? 'Departure Point' :
                             i === trip.totalStops - 1 ? 'Destination' :
                             `Stop ${i + 1}`}
                          </div>
                          {status === 'current' && (
                            <span className="text-[10px] text-emerald-400 font-medium">● Currently here</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Notes / Alerts */}
              {trip.notes && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-4 border-l-4 border-amber-500">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm font-medium mb-0.5">Driver Note</div>
                      <div className="text-sm text-muted-foreground">{trip.notes}</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => { setTrip(null); setPnrInput(''); setNotFound(false); }}
                  className="flex-1 glass-card px-4 py-3 text-sm font-medium text-center hover:bg-card transition-colors"
                >
                  Track Another Trip
                </button>
                <Link to="/support" className="flex-1 glass-card px-4 py-3 text-sm font-medium text-center hover:bg-card transition-colors">
                  Contact Support
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
