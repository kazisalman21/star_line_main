import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Ticket, MapPin, Clock, Bus, Calendar, ChevronRight, User, Phone, Mail,
  Shield, CreditCard, Star, Navigation, CheckCircle2, XCircle,
  Edit3, Download, QrCode, Headphones, Settings, Bell,
  MapPinned, Fuel, Timer, Route, LogOut
} from 'lucide-react';
import { sampleBooking } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHead from '@/components/PageHead';
import { getToday } from '@/lib/utils';

const tabs = [
  { id: 'bookings', label: 'My Bookings', icon: Ticket },
  { id: 'tracking', label: 'Live Tracking', icon: Navigation },
] as const;

type TabId = typeof tabs[number]['id'];

/* ── Mock Data ─────────────────────────────────── */
const mockBookings = [
  {
    ...sampleBooking, id: '1', bookingId: 'STR-2026-48291', status: 'confirmed' as const,
    date: '2026-03-29', departureTime: '22:00', arrivalTime: '03:30',
  },
  {
    ...sampleBooking, id: '2', bookingId: 'STR-2026-47103', status: 'completed' as const,
    from: 'Dhaka', to: "Cox's Bazar", date: '2026-03-20', departureTime: '20:00', arrivalTime: '04:00',
    coachType: 'AC Business', coachName: 'Starline Gold', seats: ['B3'], totalFare: 2240,
    boardingPoint: 'Dhaka Terminal', droppingPoint: "Cox's Bazar City Center",
  },
  {
    ...sampleBooking, id: '3', bookingId: 'STR-2026-45890', status: 'cancelled' as const,
    from: 'Chattogram', to: 'Dhaka', date: '2026-03-15', departureTime: '08:00', arrivalTime: '13:30',
    coachType: 'AC Economy', coachName: 'Starline Silver', seats: ['C2', 'C3'], totalFare: 2040,
    boardingPoint: 'Chattogram Terminal', droppingPoint: 'Dhaka Central',
  },
];

const liveTrip = {
  bookingId: 'STR-2026-48291', from: 'Dhaka', to: 'Chattogram',
  coachName: 'Starline Platinum', coachNumber: 'PLT-07',
  driver: 'Md. Jamal Hossain', departureTime: '22:00', eta: '03:15',
  status: 'In Transit', progress: 42, currentLocation: 'Near Daudkandi',
  speed: '62 km/h', nextStop: 'Comilla Rest Stop', nextStopEta: '15 min',
  stops: [
    { name: 'Dhaka Terminal', time: '22:00', status: 'departed' },
    { name: 'Gazipur Bypass', time: '22:35', status: 'departed' },
    { name: 'Daudkandi', time: '23:45', status: 'current' },
    { name: 'Comilla Rest Stop', time: '00:15', status: 'upcoming' },
    { name: 'Feni Junction', time: '01:30', status: 'upcoming' },
    { name: 'Chattogram Terminal', time: '03:15', status: 'upcoming' },
  ],
};

const statusConfig = {
  confirmed: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2, label: 'Confirmed' },
  completed: { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', icon: CheckCircle2, label: 'Completed' },
  cancelled: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: XCircle, label: 'Cancelled' },
};

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
};

export default function PassengerDashboard() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('bookings');
  const [bookingFilter, setBookingFilter] = useState<'all' | 'confirmed' | 'completed' | 'cancelled'>('all');

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || 'Traveller';
  const firstName = displayName.split(' ')[0];
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  const filteredBookings = bookingFilter === 'all'
    ? mockBookings
    : mockBookings.filter(b => b.status === bookingFilter);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHead title="Dashboard — Star Line Group" description="Manage your bookings, track live trips, and update your Star Line profile." />
      <Navbar />

      <div className="pt-20 pb-16">
        {/* Header */}
        <div className="container mb-8">
          <motion.div {...fadeUp} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight">
                Welcome back, <span className="text-primary">{firstName}</span>
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Manage your trips, track live buses, and update your profile
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2.5 rounded-xl bg-secondary/60 border border-border/50 hover:bg-secondary transition-colors">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background" />
              </button>
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-secondary/60 border border-border/50">
                <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stat Cards */}
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
            {[
              { label: 'Upcoming Trips', value: '1', icon: Calendar, accent: 'text-accent' },
              { label: 'Total Trips', value: '14', icon: Route, accent: 'text-primary' },
              { label: 'Active Tracking', value: '1', icon: Navigation, accent: 'text-emerald-400' },
              { label: 'Member Since', value: 'Jan 2025', icon: Shield, accent: 'text-blue-400' },
            ].map((stat, i) => (
              <div key={i} className="p-4 rounded-2xl bg-card/60 border border-border/40 backdrop-blur-sm hover:border-border/60 transition-all">
                <div className={`p-2 rounded-xl bg-secondary/80 ${stat.accent} w-fit mb-3`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <p className="text-xl sm:text-2xl font-bold font-display">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="container mb-6">
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }}
            className="flex gap-1 p-1 rounded-2xl bg-secondary/40 border border-border/30 w-fit"
          >
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="dashTab"
                    className="absolute inset-0 bg-primary rounded-xl"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </span>
              </button>
            ))}
          </motion.div>
        </div>

        {/* Tab Content */}
        <div className="container">
          <AnimatePresence mode="wait">
            {/* ─── BOOKINGS TAB ─── */}
            {activeTab === 'bookings' && (
              <motion.div key="bookings" {...fadeUp}>
                <div className="flex gap-2 mb-5 flex-wrap">
                  {(['all', 'confirmed', 'completed', 'cancelled'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setBookingFilter(f)}
                      className={`px-4 py-2 rounded-xl text-xs font-medium capitalize border transition-all ${
                        bookingFilter === f
                          ? 'bg-primary/10 border-primary/30 text-primary'
                          : 'bg-secondary/40 border-border/30 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {f === 'all' ? 'All Bookings' : f}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  {filteredBookings.map((booking, i) => {
                    const sc = statusConfig[booking.status];
                    return (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="group relative rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden hover:border-border/70 transition-all"
                      >
                        <div className={`absolute top-0 left-0 w-1 h-full ${
                          booking.status === 'confirmed' ? 'bg-emerald-500' :
                          booking.status === 'completed' ? 'bg-blue-500' : 'bg-red-500'
                        }`} />

                        <div className="p-5 pl-6">
                          {/* Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 rounded-xl bg-secondary/80">
                                <Bus className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-bold">{booking.coachName}</p>
                                <p className="text-xs text-muted-foreground">{booking.bookingId} • {booking.coachType}</p>
                              </div>
                            </div>
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${sc.bg} ${sc.color}`}>
                              <sc.icon className="w-3 h-3" />
                              {sc.label}
                            </div>
                          </div>

                          {/* Route */}
                          <div className="flex items-center gap-3 mb-4">
                            <div className="text-center">
                              <p className="text-lg font-bold font-display">{booking.departureTime}</p>
                              <p className="text-xs text-muted-foreground">{booking.from}</p>
                            </div>
                            <div className="flex-1 flex items-center gap-2 px-2">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              <div className="flex-1 h-px bg-border relative">
                                <Bus className="w-3.5 h-3.5 text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                              </div>
                              <div className="w-2 h-2 rounded-full bg-accent" />
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold font-display">{booking.arrivalTime}</p>
                              <p className="text-xs text-muted-foreground">{booking.to}</p>
                            </div>
                          </div>

                          {/* Details */}
                          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground mb-4">
                            <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" />{booking.date}</span>
                            <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />Seats: {booking.seats.join(', ')}</span>
                            <span className="flex items-center gap-1.5"><CreditCard className="w-3 h-3" />৳{booking.totalFare.toLocaleString()}</span>
                            <span className="flex items-center gap-1.5"><MapPinned className="w-3 h-3" />{booking.boardingPoint}</span>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2">
                            {booking.status === 'confirmed' && (
                              <>
                                <Link to="/ticket" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity">
                                  <QrCode className="w-3.5 h-3.5" /> View E-Ticket
                                </Link>
                                <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary/60 border border-border/40 text-xs font-medium hover:bg-secondary transition-colors">
                                  <Download className="w-3.5 h-3.5" /> Download PDF
                                </button>
                                <Link to="/live-tracking" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400 hover:bg-emerald-500/15 transition-colors">
                                  <Navigation className="w-3.5 h-3.5" /> Track Bus
                                </Link>
                              </>
                            )}
                            {booking.status === 'completed' && (
                              <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary/60 border border-border/40 text-xs font-medium hover:bg-secondary transition-colors">
                                <Star className="w-3.5 h-3.5" /> Rate Trip
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {filteredBookings.length === 0 && (
                    <div className="text-center py-16">
                      <Ticket className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No {bookingFilter} bookings found</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ─── TRACKING TAB ─── */}
            {activeTab === 'tracking' && (
              <motion.div key="tracking" {...fadeUp}>
                <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
                  <div className="p-5 border-b border-border/30">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <Bus className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{liveTrip.coachName} • {liveTrip.coachNumber}</p>
                          <p className="text-xs text-muted-foreground">{liveTrip.from} → {liveTrip.to} • {liveTrip.bookingId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-xs font-semibold text-emerald-400">{liveTrip.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    {/* Progress Bar */}
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-muted-foreground">{liveTrip.from}</span>
                      <span className="text-muted-foreground">{liveTrip.to}</span>
                    </div>
                    <div className="relative h-2.5 rounded-full bg-secondary/80 overflow-hidden mb-5">
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-emerald-500 rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: `${liveTrip.progress}%` }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                      />
                    </div>

                    {/* Live Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                      {[
                        { label: 'Location', value: liveTrip.currentLocation, icon: MapPin },
                        { label: 'Speed', value: liveTrip.speed, icon: Fuel },
                        { label: 'Next Stop', value: liveTrip.nextStop, icon: MapPinned },
                        { label: 'ETA', value: liveTrip.eta, icon: Timer },
                      ].map((s, i) => (
                        <div key={i} className="p-3 rounded-xl bg-secondary/40 border border-border/30">
                          <div className="flex items-center gap-1.5 mb-1">
                            <s.icon className="w-3 h-3 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</span>
                          </div>
                          <p className="text-sm font-semibold">{s.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Stop Timeline */}
                    <div className="space-y-0">
                      {liveTrip.stops.map((stop, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                              stop.status === 'departed' ? 'bg-primary border-primary' :
                              stop.status === 'current' ? 'bg-emerald-500 border-emerald-500 animate-pulse' :
                              'bg-transparent border-muted-foreground/30'
                            }`}>
                              {stop.status === 'departed' && <CheckCircle2 className="w-2 h-2 text-primary-foreground" />}
                            </div>
                            {i < liveTrip.stops.length - 1 && (
                              <div className={`w-0.5 h-8 ${stop.status === 'departed' ? 'bg-primary/50' : 'bg-border/50'}`} />
                            )}
                          </div>
                          <div className="flex-1 -mt-0.5 pb-2">
                            <div className="flex items-center justify-between">
                              <p className={`text-sm font-medium ${
                                stop.status === 'current' ? 'text-emerald-400' :
                                stop.status === 'departed' ? 'text-foreground' : 'text-muted-foreground'
                              }`}>
                                {stop.name}
                                {stop.status === 'current' && (
                                  <span className="ml-2 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">Now</span>
                                )}
                              </p>
                              <span className="text-xs text-muted-foreground">{stop.time}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="px-5 pb-5">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-border/30">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Driver</p>
                          <p className="text-sm font-medium">{liveTrip.driver}</p>
                        </div>
                      </div>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/15 transition-colors">
                        <Headphones className="w-3 h-3" /> Contact
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </div>
  );
}
