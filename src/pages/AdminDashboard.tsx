import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Bus, Users, DollarSign, Clock, AlertTriangle, Headphones, TrendingUp, MapPin } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { adminStats } from '@/data/mockData';
import PageHead from '@/components/PageHead';

const statCards = [
  { icon: Bus, label: "Today's Trips", value: adminStats.todayTrips, color: 'text-primary' },
  { icon: MapPin, label: 'Active Trips', value: adminStats.activeTrips, color: 'text-success' },
  { icon: Users, label: 'Passengers', value: adminStats.totalPassengers.toLocaleString(), color: 'text-info' },
  { icon: DollarSign, label: 'Revenue (৳)', value: `${(adminStats.revenue / 1000).toFixed(0)}K`, color: 'text-accent' },
  { icon: TrendingUp, label: 'Occupancy', value: `${adminStats.occupancyRate}%`, color: 'text-primary' },
  { icon: Clock, label: 'On-Time', value: `${adminStats.onTimeRate}%`, color: 'text-success' },
  { icon: AlertTriangle, label: 'Delayed', value: adminStats.delayedTrips, color: 'text-warning' },
  { icon: Headphones, label: 'Support Issues', value: adminStats.supportTickets, color: 'text-destructive' },
];

const statusColors: Record<string, string> = {
  'On Time': 'bg-success/10 text-success',
  'Delayed 15m': 'bg-warning/10 text-warning',
  'Boarding': 'bg-info/10 text-info',
  'Departed': 'bg-primary/10 text-primary',
};

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <PageHead title="Operations Dashboard" description="Star Line Group operations command center — real-time analytics and management." />
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold">Operations Dashboard</h1>
              <p className="text-muted-foreground text-sm">Starline command center — real-time operational overview</p>
            </div>
            <div className="hidden md:block text-right">
              <div className="text-xs text-muted-foreground">Last updated</div>
              <div className="text-sm font-medium text-success">Live • Just now</div>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-5 card-hover"
              >
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="font-display text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Revenue Chart */}
            <div className="lg:col-span-2 glass-card p-6">
              <h3 className="font-display font-semibold mb-4">Weekly Revenue</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={adminStats.revenueChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 20% 18%)" />
                  <XAxis dataKey="day" stroke="hsl(220 10% 55%)" fontSize={12} />
                  <YAxis stroke="hsl(220 10% 55%)" fontSize={12} tickFormatter={v => `${v / 1000}K`} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(222 25% 10%)', border: '1px solid hsl(222 20% 18%)', borderRadius: '8px', color: 'hsl(0 0% 95%)' }}
                    formatter={(value: number) => [`৳${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="hsl(350 72% 45%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Departures */}
            <div className="lg:col-span-3 glass-card p-6">
              <h3 className="font-display font-semibold mb-4">Upcoming Departures</h3>
              <div className="space-y-3">
                {adminStats.departures.map((dep) => (
                  <div key={dep.id} className="flex items-center gap-4 bg-secondary/30 p-4 rounded-xl">
                    <div className="text-center min-w-[50px]">
                      <div className="font-display font-bold">{dep.time}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{dep.route}</div>
                      <div className="text-xs text-muted-foreground">{dep.coach} • {dep.passengers} pax</div>
                    </div>
                    <div className="hidden sm:block">
                      <div className="w-16 bg-secondary rounded-full h-1.5">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: `${dep.occupancy}%` }} />
                      </div>
                      <div className="text-xs text-muted-foreground text-center mt-0.5">{dep.occupancy}%</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusColors[dep.status] || 'bg-secondary text-muted-foreground'}`}>
                      {dep.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
