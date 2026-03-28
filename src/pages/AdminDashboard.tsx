import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line,
} from 'recharts';
import {
  Bus, Users, DollarSign, TrendingUp, MapPin, Package, Clock, AlertTriangle,
  Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight, X, Check, Loader2,
  LayoutDashboard, Route, Ticket, BarChart3, Radio, RefreshCw,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHead from '@/components/PageHead';
import {
  getDashboardStats, getRevenueChart, getUpcomingDepartures, getRecentBookings,
  getRoutePerformance, getFleetStatus, getPaymentBreakdown, getBookingTrends,
  getAllRoutes, createRoute, updateRoute, deleteRoute,
  getAllBuses, createBus, updateBus, deleteBus,
  getAllSchedules, createSchedule, updateSchedule, deleteSchedule,
  getAdminBookings, updateBookingStatus,
  DashboardStats, RevenueDataPoint, DepartureInfo, RecentBooking,
  RoutePerformance, PaymentMethodBreakdown, FleetStatus,
} from '@/services/adminService';

// ─── Tab Definitions ──────────────────────────────────
const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'routes', label: 'Routes & Fleet', icon: Route },
  { id: 'bookings', label: 'Bookings', icon: Ticket },
  { id: 'revenue', label: 'Revenue', icon: BarChart3 },
] as const;

type TabId = (typeof tabs)[number]['id'];

const PIE_COLORS = ['#e11d48', '#f97316', '#8b5cf6', '#3b82f6', '#10b981'];
const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  completed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  active: 'bg-emerald-500/10 text-emerald-400',
  maintenance: 'bg-amber-500/10 text-amber-400',
  retired: 'bg-red-500/10 text-red-400',
  inactive: 'bg-gray-500/10 text-gray-400',
};

// ─── Animated Counter ──────────────────────────────────
function AnimatedCount({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 800;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{prefix}{display.toLocaleString()}{suffix}</span>;
}

// ─── Main Component ──────────────────────────────────
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  return (
    <div className="min-h-screen bg-background">
      <PageHead title="Operations Dashboard" description="Star Line Group operations command center — real-time analytics and management." />
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight">Operations Center</h1>
              <p className="text-muted-foreground text-sm">Starline command center — real-time operational overview</p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-medium text-emerald-400">Live</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 mb-8 p-1 bg-secondary/40 rounded-xl w-fit border border-border/30">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && <OverviewTab />}
              {activeTab === 'routes' && <RoutesFleetTab />}
              {activeTab === 'bookings' && <BookingsTab />}
              {activeTab === 'revenue' && <RevenueTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// ═══════════════════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════════════════
function OverviewTab() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenue, setRevenue] = useState<RevenueDataPoint[]>([]);
  const [departures, setDepartures] = useState<DepartureInfo[]>([]);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [routePerf, setRoutePerf] = useState<RoutePerformance[]>([]);
  const [paymentBreakdown, setPaymentBreakdown] = useState<PaymentMethodBreakdown[]>([]);
  const [revDays, setRevDays] = useState(7);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [s, r, d, rb, rp, pb] = await Promise.all([
      getDashboardStats(),
      getRevenueChart(revDays),
      getUpcomingDepartures(),
      getRecentBookings(8),
      getRoutePerformance(),
      getPaymentBreakdown(),
    ]);
    setStats(s); setRevenue(r); setDepartures(d);
    setRecentBookings(rb); setRoutePerf(rp); setPaymentBreakdown(pb);
    setLoading(false);
  }, [revDays]);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 60s
  useEffect(() => {
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass-card p-5 animate-pulse">
              <div className="h-4 w-8 bg-secondary rounded mb-3" />
              <div className="h-8 w-20 bg-secondary rounded mb-1" />
              <div className="h-3 w-16 bg-secondary rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 glass-card p-6 h-72 animate-pulse"><div className="h-full bg-secondary/50 rounded" /></div>
          <div className="lg:col-span-3 glass-card p-6 h-72 animate-pulse"><div className="h-full bg-secondary/50 rounded" /></div>
        </div>
      </div>
    );
  }

  const kpiCards = stats ? [
    { icon: Bus, label: "Today's Trips", value: stats.todayTrips, color: 'text-primary' },
    { icon: Ticket, label: 'Active Bookings', value: stats.activeBookings, color: 'text-emerald-400' },
    { icon: Users, label: 'Passengers', value: stats.totalPassengers, color: 'text-blue-400' },
    { icon: DollarSign, label: 'Today Revenue', value: stats.revenue, prefix: '৳', color: 'text-accent' },
    { icon: TrendingUp, label: 'Weekly Revenue', value: stats.weeklyRevenue, prefix: '৳', color: 'text-primary' },
    { icon: Package, label: 'Occupancy', value: stats.occupancyRate, suffix: '%', color: 'text-emerald-400' },
    { icon: AlertTriangle, label: 'Pending', value: stats.pendingPayments, color: 'text-amber-400' },
    { icon: MapPin, label: 'Routes', value: stats.totalRoutes, color: 'text-blue-400' },
  ] : [];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-5 card-hover group"
          >
            <card.icon className={`w-5 h-5 ${card.color} mb-3 group-hover:scale-110 transition-transform`} />
            <div className="font-display text-2xl font-bold">
              <AnimatedCount value={card.value} prefix={card.prefix} suffix={card.suffix} />
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart + Departures */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Revenue Trend</h3>
            <div className="flex gap-1 p-0.5 bg-secondary/50 rounded-lg">
              {[7, 30].map(d => (
                <button key={d} onClick={() => setRevDays(d)} className={`px-2 py-1 rounded text-xs font-medium transition-colors ${revDays === d ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                  {d}d
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenue}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(350,72%,45%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(350,72%,45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 20% 18%)" />
              <XAxis dataKey="date" stroke="hsl(220 10% 45%)" fontSize={10} tickFormatter={v => v.slice(5)} />
              <YAxis stroke="hsl(220 10% 45%)" fontSize={10} tickFormatter={v => `${(v as number / 1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ background: 'hsl(222 25% 10%)', border: '1px solid hsl(222 20% 20%)', borderRadius: '8px', color: '#fff', fontSize: '12px' }} formatter={(v: number) => [`৳${v.toLocaleString()}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(350,72%,45%)" fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-3 glass-card p-6">
          <h3 className="font-display font-semibold mb-4">Today's Departures</h3>
          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
            {departures.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No departures scheduled today</p>
            ) : departures.map(dep => (
              <div key={dep.id} className="flex items-center gap-3 bg-secondary/30 p-3 rounded-xl">
                <div className="text-center min-w-[45px]">
                  <div className="font-display font-bold text-sm">{dep.time}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{dep.route}</div>
                  <div className="text-xs text-muted-foreground">{dep.coach} • {dep.passengers}/{dep.totalSeats} pax</div>
                </div>
                <div className="hidden sm:block w-16">
                  <div className="w-full bg-secondary rounded-full h-1.5">
                    <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${Math.min(dep.occupancy, 100)}%` }} />
                  </div>
                  <div className="text-[10px] text-muted-foreground text-center mt-0.5">{dep.occupancy}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Payment Breakdown + Route Performance + Recent Bookings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Payment Breakdown */}
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold mb-4">Payment Methods</h3>
          {paymentBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No payment data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={paymentBreakdown} dataKey="amount" nameKey="method" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} strokeWidth={0}>
                  {paymentBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(222 25% 10%)', border: '1px solid hsl(222 20% 20%)', borderRadius: '8px', color: '#fff', fontSize: '12px' }} formatter={(v: number) => [`৳${v.toLocaleString()}`]} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {paymentBreakdown.map((m, i) => (
              <span key={m.method} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                {m.method}
              </span>
            ))}
          </div>
        </div>

        {/* Route Performance */}
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold mb-4">Top Routes</h3>
          {routePerf.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No route data yet</p>
          ) : (
            <div className="space-y-3">
              {routePerf.slice(0, 5).map((r, i) => (
                <div key={r.route}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="truncate max-w-[140px] text-muted-foreground">{r.route}</span>
                    <span className="font-medium">৳{(r.revenue / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5">
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${routePerf[0].revenue > 0 ? (r.revenue / routePerf[0].revenue) * 100 : 0}%`, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold mb-4">Recent Bookings</h3>
          <div className="space-y-2 max-h-[220px] overflow-y-auto">
            {recentBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No bookings yet</p>
            ) : recentBookings.map(b => (
              <div key={b.id} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{b.passengerName}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{b.route}</div>
                </div>
                <div className="text-right ml-2 shrink-0">
                  <div className="text-sm font-medium">৳{b.fare}</div>
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-medium border ${STATUS_COLORS[b.status] || 'bg-secondary text-muted-foreground'}`}>
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// ROUTES & FLEET TAB
// ═══════════════════════════════════════════════════
function RoutesFleetTab() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [fleet, setFleet] = useState<FleetStatus>({ active: 0, maintenance: 0, retired: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<'routes' | 'fleet' | 'schedules'>('routes');

  useEffect(() => {
    Promise.all([getAllRoutes(), getAllBuses(), getAllSchedules(), getFleetStatus()])
      .then(([r, b, s, f]) => { setRoutes(r); setBuses(b); setSchedules(s); setFleet(f); setLoading(false); });
  }, []);

  const handleDeleteRoute = async (id: string) => {
    if (!confirm('Delete this route?')) return;
    await deleteRoute(id);
    setRoutes(routes.filter(r => r.id !== id));
  };

  const handleDeleteBus = async (id: string) => {
    if (!confirm('Delete this bus?')) return;
    await deleteBus(id);
    setBuses(buses.filter(b => b.id !== id));
  };

  const handleToggleBusStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'maintenance' : 'active';
    await updateBus(id, { status: newStatus });
    setBuses(buses.map(b => b.id === id ? { ...b, status: newStatus } : b));
  };

  const handleToggleRouteStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    await updateRoute(id, { status: newStatus });
    setRoutes(routes.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Fleet Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Fleet', value: fleet.total, color: 'text-foreground', icon: Bus },
          { label: 'Active', value: fleet.active, color: 'text-emerald-400', icon: Check },
          { label: 'Maintenance', value: fleet.maintenance, color: 'text-amber-400', icon: Clock },
          { label: 'Retired', value: fleet.retired, color: 'text-red-400', icon: X },
        ].map(s => (
          <div key={s.label} className="glass-card p-4">
            <s.icon className={`w-4 h-4 ${s.color} mb-2`} />
            <div className="font-display text-xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2">
        {(['routes', 'fleet', 'schedules'] as const).map(s => (
          <button key={s} onClick={() => setSection(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${section === s ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            {s === 'routes' ? `Routes (${routes.length})` : s === 'fleet' ? `Buses (${buses.length})` : `Schedules (${schedules.length})`}
          </button>
        ))}
      </div>

      {/* Routes Table */}
      {section === 'routes' && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left p-3 font-medium text-muted-foreground">Route</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Distance</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Duration</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Base Fare</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {routes.map(r => (
                  <tr key={r.id} className="border-b border-border/10 hover:bg-secondary/20 transition-colors">
                    <td className="p-3 font-medium">{r.origin} → {r.destination}</td>
                    <td className="p-3 text-muted-foreground">{r.distance_km} km</td>
                    <td className="p-3 text-muted-foreground">{Math.floor(r.duration_minutes / 60)}h {r.duration_minutes % 60}m</td>
                    <td className="p-3">৳{r.base_fare}</td>
                    <td className="p-3">
                      <button onClick={() => handleToggleRouteStatus(r.id, r.status)} className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[r.status] || ''}`}>
                        {r.status}
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <button onClick={() => handleDeleteRoute(r.id)} className="text-red-400 hover:text-red-300 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {routes.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">No routes configured</p>}
          </div>
        </div>
      )}

      {/* Fleet Grid */}
      {section === 'fleet' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buses.map(b => (
            <div key={b.id} className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-display font-semibold">{b.name}</div>
                <button onClick={() => handleToggleBusStatus(b.id, b.status)} className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[b.status] || ''}`}>
                  {b.status}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>Type: <span className="text-foreground">{b.type}</span></div>
                <div>Seats: <span className="text-foreground">{b.total_seats}</span></div>
                <div className="col-span-2">Reg: <span className="text-foreground font-mono text-[10px]">{b.registration_number}</span></div>
              </div>
              <div className="flex justify-end mt-3 gap-1">
                <button onClick={() => handleDeleteBus(b.id)} className="text-red-400 hover:text-red-300 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
          {buses.length === 0 && <p className="text-muted-foreground text-sm col-span-3 text-center py-8">No buses in fleet</p>}
        </div>
      )}

      {/* Schedules Table */}
      {section === 'schedules' && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left p-3 font-medium text-muted-foreground">Route</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Bus</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Departure</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Arrival</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Days</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map(s => {
                  const route = s.routes as any;
                  const bus = s.buses as any;
                  const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
                  return (
                    <tr key={s.id} className="border-b border-border/10 hover:bg-secondary/20 transition-colors">
                      <td className="p-3 font-medium">{route?.origin} → {route?.destination}</td>
                      <td className="p-3 text-muted-foreground">{bus?.name}</td>
                      <td className="p-3">{s.departure_time?.slice(0, 5)}</td>
                      <td className="p-3">{s.arrival_time?.slice(0, 5)}</td>
                      <td className="p-3">
                        <div className="flex gap-0.5">
                          {dayLabels.map((d, i) => (
                            <span key={d} className={`text-[9px] w-4 h-4 rounded flex items-center justify-center ${(s.days_of_week || []).includes(i) ? 'bg-primary/20 text-primary font-bold' : 'bg-secondary/30 text-muted-foreground/40'}`}>
                              {d}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[s.status] || ''}`}>{s.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {schedules.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">No schedules configured</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// BOOKINGS TAB
// ═══════════════════════════════════════════════════
function BookingsTab() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [trends, setTrends] = useState<{ date: string; count: number }[]>([]);
  const limit = 12;

  const load = useCallback(async () => {
    setLoading(true);
    const [result, t] = await Promise.all([
      getAdminBookings({ page, limit, status, search }),
      page === 1 ? getBookingTrends(30) : Promise.resolve(trends),
    ]);
    setBookings(result.bookings);
    setTotal(result.total);
    if (page === 1) setTrends(t as any);
    setLoading(false);
  }, [page, status, search]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateBookingStatus(id, newStatus);
    setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Booking Trend Mini Chart */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display font-semibold text-sm">Booking Trend (30 days)</h3>
          <span className="text-xs text-muted-foreground">{total} total bookings</span>
        </div>
        <ResponsiveContainer width="100%" height={60}>
          <LineChart data={trends}>
            <Line type="monotone" dataKey="count" stroke="hsl(350,72%,45%)" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or PNR..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-secondary/50 border border-border/30 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex gap-1 p-0.5 bg-secondary/40 rounded-lg">
          {['all', 'pending', 'confirmed', 'cancelled', 'completed'].map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }} className={`px-2.5 py-1 rounded text-xs font-medium transition-colors capitalize ${status === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left p-3 font-medium text-muted-foreground">PNR</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Passenger</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Route</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Fare</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => {
                  const schedule = b.schedules as any;
                  const route = schedule?.routes;
                  return (
                    <tr key={b.id} className="border-b border-border/10 hover:bg-secondary/20 transition-colors">
                      <td className="p-3 font-mono text-xs">STR-{b.id.slice(0, 8).toUpperCase()}</td>
                      <td className="p-3">
                        <div className="font-medium">{b.passenger_name}</div>
                        <div className="text-[10px] text-muted-foreground">{b.passenger_phone}</div>
                      </td>
                      <td className="p-3 text-muted-foreground">{route?.origin} → {route?.destination}</td>
                      <td className="p-3 text-muted-foreground">{b.travel_date}</td>
                      <td className="p-3 font-medium">৳{b.total_fare}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[b.status] || ''}`}>{b.status}</span>
                      </td>
                      <td className="p-3 text-right">
                        {b.status === 'pending' && (
                          <button onClick={() => handleStatusChange(b.id, 'cancelled')} className="text-red-400 hover:text-red-300 text-xs">Cancel</button>
                        )}
                        {b.status === 'confirmed' && (
                          <button onClick={() => handleStatusChange(b.id, 'completed')} className="text-emerald-400 hover:text-emerald-300 text-xs">Complete</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {bookings.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">No bookings found</p>}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-3 border-t border-border/20">
            <span className="text-xs text-muted-foreground">Page {page} of {totalPages} ({total} results)</span>
            <div className="flex gap-1">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="p-1.5 rounded hover:bg-secondary disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="p-1.5 rounded hover:bg-secondary disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// REVENUE TAB
// ═══════════════════════════════════════════════════
function RevenueTab() {
  const [revenue30, setRevenue30] = useState<RevenueDataPoint[]>([]);
  const [routePerf, setRoutePerf] = useState<RoutePerformance[]>([]);
  const [paymentBreakdown, setPaymentBreakdown] = useState<PaymentMethodBreakdown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getRevenueChart(30), getRoutePerformance(), getPaymentBreakdown()])
      .then(([r, rp, pb]) => { setRevenue30(r); setRoutePerf(rp); setPaymentBreakdown(pb); setLoading(false); });
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  const totalRevenue = revenue30.reduce((sum, d) => sum + d.revenue, 0);
  const totalBookings = revenue30.reduce((sum, d) => sum + d.bookings, 0);
  const avgDaily = revenue30.length > 0 ? Math.round(totalRevenue / revenue30.length) : 0;
  const peakDay = revenue30.reduce((max, d) => d.revenue > max.revenue ? d : max, { date: '', revenue: 0 });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Monthly Revenue', value: totalRevenue, prefix: '৳' },
          { label: 'Avg Daily', value: avgDaily, prefix: '৳' },
          { label: 'Total Bookings', value: totalBookings },
          { label: 'Peak Day', value: peakDay.revenue, prefix: '৳', sub: peakDay.date?.slice(5) },
        ].map(c => (
          <div key={c.label} className="glass-card p-5">
            <div className="text-xs text-muted-foreground mb-1">{c.label}</div>
            <div className="font-display text-xl font-bold">
              <AnimatedCount value={c.value} prefix={c.prefix} />
            </div>
            {c.sub && <div className="text-[10px] text-muted-foreground mt-0.5">{c.sub}</div>}
          </div>
        ))}
      </div>

      {/* 30-Day Revenue Chart */}
      <div className="glass-card p-6">
        <h3 className="font-display font-semibold mb-4">30-Day Revenue</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={revenue30}>
            <defs>
              <linearGradient id="revGrad30" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(350,72%,45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(350,72%,45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 20% 18%)" />
            <XAxis dataKey="date" stroke="hsl(220 10% 45%)" fontSize={10} tickFormatter={v => v.slice(8)} />
            <YAxis stroke="hsl(220 10% 45%)" fontSize={10} tickFormatter={v => `${(v as number / 1000).toFixed(0)}K`} />
            <Tooltip contentStyle={{ background: 'hsl(222 25% 10%)', border: '1px solid hsl(222 20% 20%)', borderRadius: '8px', color: '#fff', fontSize: '12px' }} formatter={(v: number) => [`৳${v.toLocaleString()}`, 'Revenue']} />
            <Area type="monotone" dataKey="revenue" stroke="hsl(350,72%,45%)" fill="url(#revGrad30)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom: Payment + Route */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Method Breakdown */}
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold mb-4">Revenue by Payment Method</h3>
          {paymentBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No data</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={paymentBreakdown} dataKey="amount" nameKey="method" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} strokeWidth={0}>
                    {paymentBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(222 25% 10%)', border: '1px solid hsl(222 20% 20%)', borderRadius: '8px', color: '#fff', fontSize: '12px' }} formatter={(v: number) => [`৳${v.toLocaleString()}`]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {paymentBreakdown.map((m, i) => (
                  <div key={m.method} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      {m.method}
                    </span>
                    <span className="font-medium">৳{m.amount.toLocaleString()} ({m.count})</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Revenue by Route */}
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold mb-4">Revenue by Route</h3>
          {routePerf.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={routePerf} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 20% 18%)" />
                <XAxis type="number" stroke="hsl(220 10% 45%)" fontSize={10} tickFormatter={v => `${(v as number / 1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="route" stroke="hsl(220 10% 45%)" fontSize={9} width={120} />
                <Tooltip contentStyle={{ background: 'hsl(222 25% 10%)', border: '1px solid hsl(222 20% 20%)', borderRadius: '8px', color: '#fff', fontSize: '12px' }} formatter={(v: number) => [`৳${v.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="hsl(350,72%,45%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
