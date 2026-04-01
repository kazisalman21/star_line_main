import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bus, MapPin, Users, DollarSign, TrendingUp, Clock, AlertTriangle, Headphones } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { getDashboardStats, getUpcomingDepartures, getRevenueChart, getBookingTrends } from '@/services/adminService';

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    'On Time': 'bg-success/10 text-success',
    'Delayed 15m': 'bg-warning/10 text-warning',
    'Boarding': 'bg-info/10 text-info',
    'Departed': 'bg-primary/10 text-primary',
  };
  return map[status] || 'bg-secondary text-muted-foreground';
};

const fleetTypePie = [
  { name: 'AC', value: 7, color: 'hsl(355, 70%, 42%)' },
  { name: 'Non-AC', value: 1, color: 'hsl(220, 10%, 50%)' },
];

export function OverviewTab() {
  const [stats, setStats] = useState<any>(null);
  const [departures, setDepartures] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [occupancyTrend, setOccupancyTrend] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getUpcomingDepartures(),
      getRevenueChart(7),
      getBookingTrends(7)
    ]).then(([s, d, r, t]) => {
      setStats(s);
      setDepartures(d);
      setRevenue(r.map(x => ({ day: new Date(x.date).toLocaleDateString('en-US', { weekday: 'short' }), revenue: x.revenue })));
      // Fake occupancy trend based on bookings for now
      setOccupancyTrend(t.map(x => ({ day: new Date(x.date).toLocaleDateString('en-US', { weekday: 'short' }), rate: Math.min(100, x.count * 15) })));
    });
  }, []);

  if (!stats) return <div className="py-12 flex justify-center text-muted-foreground">Loading overview stats...</div>;

  const statCards = [
    { icon: Bus, label: "Today's Trips", value: stats.todayTrips, color: 'text-primary' },
    { icon: MapPin, label: 'Active Trips', value: Math.floor(stats.todayTrips * 0.4), color: 'text-success' },
    { icon: Users, label: 'Passengers', value: stats.totalPassengers, color: 'text-info' },
    { icon: DollarSign, label: 'Revenue (৳)', value: `${(stats.revenue / 1000).toFixed(0)}K`, color: 'text-accent' },
    { icon: TrendingUp, label: 'Occupancy', value: `${stats.occupancyRate}%`, color: 'text-primary' },
    { icon: Clock, label: 'On-Time', value: `94%`, color: 'text-success' },
    { icon: AlertTriangle, label: 'Delayed', value: 0, color: 'text-warning' },
    { icon: Headphones, label: 'Support Issues', value: 0, color: 'text-destructive' },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass-card p-5 card-hover">
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="font-display text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold mb-4">Weekly Revenue</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 20% 18%)" />
              <XAxis dataKey="day" stroke="hsl(220 10% 55%)" fontSize={12} />
              <YAxis stroke="hsl(220 10% 55%)" fontSize={12} tickFormatter={v => `${v / 1000}K`} />
              <Tooltip contentStyle={{ background: 'hsl(222 25% 10%)', border: '1px solid hsl(222 20% 18%)', borderRadius: '8px', color: 'hsl(0 0% 95%)' }} formatter={(value: number) => [`৳${value.toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="hsl(355 70% 42%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Fleet Composition */}
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold mb-4">Fleet Composition</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={fleetTypePie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {fleetTypePie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'hsl(222 25% 10%)', border: '1px solid hsl(222 20% 18%)', borderRadius: '8px', color: 'hsl(0 0% 95%)' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2">
            {fleetTypePie.map((t, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: t.color }} />
                {t.name} ({t.value})
              </div>
            ))}
          </div>
        </div>

        {/* Occupancy Trend */}
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold mb-4">Occupancy Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={occupancyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 20% 18%)" />
              <XAxis dataKey="day" stroke="hsl(220 10% 55%)" fontSize={12} />
              <YAxis stroke="hsl(220 10% 55%)" fontSize={12} tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={{ background: 'hsl(222 25% 10%)', border: '1px solid hsl(222 20% 18%)', borderRadius: '8px', color: 'hsl(0 0% 95%)' }} />
              <Line type="monotone" dataKey="rate" stroke="hsl(42 85% 52%)" strokeWidth={2} dot={{ fill: 'hsl(42 85% 52%)', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Departures */}
      <div className="glass-card p-6">
        <h3 className="font-display font-semibold mb-4">Upcoming Departures</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {departures.length === 0 ? <p className="text-muted-foreground col-span-2 text-sm">No scheduled departures for today.</p> : departures.map((dep) => (
            <div key={dep.id} className="flex items-center gap-4 bg-secondary/30 p-4 rounded-xl">
              <div className="text-center min-w-[50px]"><div className="font-display font-bold">{dep.time}</div></div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{dep.route}</div>
                <div className="text-xs text-muted-foreground">{dep.coach} • {dep.passengers} pax</div>
              </div>
              <div className="hidden sm:block">
                <div className="w-16 bg-secondary rounded-full h-1.5"><div className="bg-primary h-1.5 rounded-full" style={{ width: `${dep.occupancy}%` }} /></div>
                <div className="text-xs text-muted-foreground text-center mt-0.5">{dep.occupancy}%</div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusBadge('On Time')}`}>On Time</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
