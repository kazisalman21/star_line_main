import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Ticket, MapPin, Clock, Bus, Calendar, ChevronRight, User, Phone, Mail,
  Shield, CreditCard, Star, Navigation, CheckCircle2, XCircle,
  Edit3, Download, QrCode, Headphones, Settings, Bell,
  MapPinned, Fuel, Timer, Route, LogOut, Loader2, Search
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserBookings, UserBooking } from '@/services/bookingService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHead from '@/components/PageHead';
import { getToday } from '@/lib/utils';

const tabs = [
  { id: 'bookings', label: 'My Bookings', icon: Ticket },
  { id: 'tracking', label: 'Live Tracking', icon: Navigation },
] as const;

type TabId = typeof tabs[number]['id'];

/* ── Live tracking derived from actual bookings ─── */

const statusConfig: Record<string, { color: string; bg: string; icon: typeof CheckCircle2; label: string }> = {
  pending: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: Clock, label: 'Pending' },
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
  const [bookingFilter, setBookingFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setBookingsLoading(true);
    getUserBookings(user.id)
      .then(setBookings)
      .finally(() => setBookingsLoading(false));
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || 'Traveller';
  const firstName = displayName.split(' ')[0];
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  const upcomingCount = bookings.filter(b => b.status === 'confirmed').length;
  const totalTrips = bookings.length;
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A';

  const filteredBookings = bookingFilter === 'all'
    ? bookings
    : bookings.filter(b => b.status === bookingFilter);

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
              <button title="Notifications" className="relative p-2.5 rounded-xl bg-secondary/60 border border-border/50 hover:bg-secondary transition-colors">
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
              { label: 'Upcoming Trips', value: String(upcomingCount), icon: Calendar, accent: 'text-accent' },
              { label: 'Total Trips', value: String(totalTrips), icon: Route, accent: 'text-primary' },
              { label: 'Active Tracking', value: '—', icon: Navigation, accent: 'text-emerald-400' },
              { label: 'Member Since', value: memberSince, icon: Shield, accent: 'text-blue-400' },
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
                  {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map(f => (
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

                {bookingsLoading ? (
                  <div className="space-y-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="animate-pulse rounded-2xl border border-border/40 bg-card/50 p-5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-secondary" />
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-secondary rounded w-1/3" />
                            <div className="h-3 bg-secondary rounded w-1/4" />
                          </div>
                        </div>
                        <div className="h-16 bg-secondary rounded-xl" />
                      </div>
                    ))}
                  </div>
                ) : filteredBookings.length === 0 ? (
                  <div className="text-center py-16">
                    <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="font-display font-semibold text-lg mb-1">No bookings found</h3>
                    <p className="text-muted-foreground text-sm mb-6">Start your journey by searching for a trip</p>
                    <Link to="/search" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                      <Search className="w-4 h-4" /> Search Trips
                    </Link>
                  </div>
                ) : (
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
                          booking.status === 'completed' ? 'bg-blue-500' :
                          booking.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
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
                                <Link to={`/ticket?bookingId=${booking.id}`} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity">
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
                </div>
                )}
              </motion.div>
            )}

            {/* ─── TRACKING TAB ─── */}
            {activeTab === 'tracking' && (
              <motion.div key="tracking" {...fadeUp}>
                {(() => {
                  // Find the user's current/most-recent confirmed booking
                  const today = new Date().toISOString().split('T')[0];
                  const activeBooking = bookings.find(b =>
                    (b.status === 'confirmed') && b.date >= today
                  );

                  if (!activeBooking) {
                    return (
                      <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-8 text-center">
                        <div className="w-20 h-20 rounded-full bg-secondary/60 flex items-center justify-center mx-auto mb-5">
                          <Navigation className="w-8 h-8 text-muted-foreground/40" />
                        </div>
                        <h3 className="font-display font-semibold text-lg mb-2">No Active Trips</h3>
                        <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
                          Live tracking will appear here when you have an ongoing or upcoming confirmed trip.
                        </p>
                        <Link
                          to="/search"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                          <Search className="w-4 h-4" /> Book a Trip
                        </Link>
                      </div>
                    );
                  }

                  // Calculate trip progress from departure & arrival times
                  const now = new Date();
                  const [depH, depM] = activeBooking.departureTime.split(':').map(Number);
                  const [arrH, arrM] = activeBooking.arrivalTime.split(':').map(Number);
                  const depMinutes = depH * 60 + depM;
                  let arrMinutes = arrH * 60 + arrM;
                  if (arrMinutes <= depMinutes) arrMinutes += 1440; // next day
                  const nowMinutes = now.getHours() * 60 + now.getMinutes();
                  let currentMin = nowMinutes;
                  if (currentMin < depMinutes && depMinutes > 720) currentMin += 1440;
                  const totalDuration = arrMinutes - depMinutes;
                  const elapsed = currentMin - depMinutes;
                  const progress = Math.max(0, Math.min(100, Math.round((elapsed / totalDuration) * 100)));
                  const isInTransit = progress > 0 && progress < 100;
                  const tripStatus = progress <= 0 ? 'Scheduled' : progress >= 100 ? 'Arrived' : 'In Transit';

                  return (
                    <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
                      <div className="p-5 border-b border-border/30">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                <Bus className="w-5 h-5 text-emerald-400" />
                              </div>
                              {isInTransit && (
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-bold">{activeBooking.coachName}</p>
                              <p className="text-xs text-muted-foreground">{activeBooking.from} → {activeBooking.to} • {activeBooking.bookingId}</p>
                            </div>
                          </div>
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                            tripStatus === 'In Transit' ? 'bg-emerald-500/10 border border-emerald-500/20' :
                            tripStatus === 'Arrived' ? 'bg-blue-500/10 border border-blue-500/20' :
                            'bg-amber-500/10 border border-amber-500/20'
                          }`}>
                            {isInTransit && <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />}
                            <span className={`text-xs font-semibold ${
                              tripStatus === 'In Transit' ? 'text-emerald-400' :
                              tripStatus === 'Arrived' ? 'text-blue-400' : 'text-amber-400'
                            }`}>{tripStatus}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-5">
                        {/* Progress Bar */}
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-muted-foreground">{activeBooking.from}</span>
                          <span className="text-muted-foreground">{activeBooking.to}</span>
                        </div>
                        <div className="relative h-2.5 rounded-full bg-secondary/80 overflow-hidden mb-5">
                          <motion.div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-emerald-500 rounded-full"
                            initial={{ width: '0%' }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                          />
                          {isInTransit && (
                            <motion.div
                              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg border-2 border-primary"
                              initial={{ left: '0%' }}
                              animate={{ left: `${Math.max(1, progress - 2)}%` }}
                              transition={{ duration: 1.5, ease: 'easeOut' }}
                            />
                          )}
                        </div>

                        {/* Trip Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                          {[
                            { label: 'Departure', value: activeBooking.departureTime, icon: Clock },
                            { label: 'Arrival (ETA)', value: activeBooking.arrivalTime, icon: Timer },
                            { label: 'Boarding', value: activeBooking.boardingPoint, icon: MapPin },
                            { label: 'Progress', value: `${progress}%`, icon: Navigation },
                          ].map((s, i) => (
                            <div key={i} className="p-3 rounded-xl bg-secondary/40 border border-border/30">
                              <div className="flex items-center gap-1.5 mb-1">
                                <s.icon className="w-3 h-3 text-muted-foreground" />
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</span>
                              </div>
                              <p className="text-sm font-semibold truncate">{s.value}</p>
                            </div>
                          ))}
                        </div>

                        {/* Trip Details */}
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground p-3 rounded-xl bg-secondary/30 border border-border/20">
                          <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {activeBooking.date}</span>
                          <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Seats: {activeBooking.seats.join(', ')}</span>
                          <span className="flex items-center gap-1.5"><CreditCard className="w-3 h-3" /> ৳{activeBooking.totalFare.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="px-5 pb-5">
                        <div className="flex items-center gap-3">
                          <Link
                            to={`/ticket?bookingId=${activeBooking.id}`}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-primary text-xs font-medium hover:bg-primary/15 transition-colors"
                          >
                            <Ticket className="w-3.5 h-3.5" /> View E-Ticket
                          </Link>
                          <Link
                            to="/support"
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-secondary/40 border border-border/30 text-xs font-medium hover:bg-secondary/60 transition-colors"
                          >
                            <Headphones className="w-3.5 h-3.5" /> Support
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </div>
  );
}
