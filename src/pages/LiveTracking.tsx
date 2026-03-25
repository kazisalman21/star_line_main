import { motion } from 'framer-motion';
import { Bus, MapPin, Clock, CheckCircle2, AlertTriangle, Navigation, Phone, Wifi, Coffee } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHead from '@/components/PageHead';

const tripData = {
  bookingId: 'STR-2026-48291',
  coachName: 'Starline Platinum',
  coachNumber: 'Platinum-07',
  from: 'Dhaka',
  to: 'Chattogram',
  departureTime: '22:00',
  arrivalTime: '03:30',
  date: '2026-03-25',
  status: 'In Transit',
  currentLocation: 'Passed Comilla — approaching Feni',
  eta: '03:15 AM',
  completedPercentage: 62,
  boardingPoint: 'Dhaka Terminal',
  lastUpdate: '2 min ago',
  stops: [
    { name: 'Dhaka Terminal', time: '22:00', status: 'completed' as const },
    { name: 'Dhaka Bypass', time: '22:15', status: 'completed' as const },
    { name: 'Comilla Rest Stop', time: '00:30', status: 'completed' as const },
    { name: 'Feni', time: '01:45', status: 'current' as const },
    { name: 'Chattogram City Gate', time: '02:50', status: 'upcoming' as const },
    { name: 'Chattogram Terminal', time: '03:15', status: 'upcoming' as const },
  ],
  alerts: [
    { type: 'info' as const, message: 'Coach is running 15 minutes ahead of schedule' },
  ],
};

export default function LiveTracking() {
  return (
    <div className="min-h-screen bg-background">
      <PageHead title="Live Trip Tracking" description="Track your Star Line Group bus in real-time. View current location, ETA, and route progress." />
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container max-w-3xl">
          <h1 className="font-display text-3xl font-bold mb-2">Live Trip Tracking</h1>
          <p className="text-muted-foreground text-sm mb-8">Real-time status for your trip</p>

          {/* Status Card */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card-accent p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-success" />
                </div>
                <div>
                  <div className="font-display font-bold">{tripData.coachName}</div>
                  <div className="text-xs text-muted-foreground">{tripData.coachNumber} • {tripData.bookingId}</div>
                </div>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-success/10 text-success text-xs font-medium rounded-full">{tripData.status}</span>
                <div className="text-xs text-muted-foreground mt-1">Updated {tripData.lastUpdate}</div>
              </div>
            </div>

            <div className="bg-secondary/50 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-primary animate-pulse-glow" />
                <span className="text-sm font-medium">{tripData.currentLocation}</span>
              </div>
              <div className="text-xs text-muted-foreground">ETA: {tripData.eta}</div>
            </div>

            {/* Progress Bar */}
            <div className="relative">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium">{tripData.from}</span>
                <span className="font-medium">{tripData.to}</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${tripData.completedPercentage}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-muted-foreground">{tripData.departureTime}</span>
                <span className="text-xs text-accent font-medium">{tripData.completedPercentage}%</span>
                <span className="text-xs text-muted-foreground">{tripData.eta}</span>
              </div>
            </div>
          </motion.div>

          {/* Alerts */}
          {tripData.alerts.map((alert, i) => (
            <div key={i} className="glass-card p-4 mb-4 flex items-center gap-3 border-l-2 border-info">
              <AlertTriangle className="w-4 h-4 text-info" />
              <span className="text-sm">{alert.message}</span>
            </div>
          ))}

          {/* Route Progress */}
          <div className="glass-card p-6 mb-6">
            <h3 className="font-display font-semibold mb-6">Route Progress</h3>
            <div className="space-y-0">
              {tripData.stops.map((stop, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      stop.status === 'completed' ? 'bg-success border-success' :
                      stop.status === 'current' ? 'bg-primary border-primary animate-pulse-glow' :
                      'bg-transparent border-border'
                    }`}>
                      {stop.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-success-foreground" />}
                    </div>
                    {i < tripData.stops.length - 1 && (
                      <div className={`w-0.5 h-12 ${stop.status === 'completed' ? 'bg-success' : 'bg-border'}`} />
                    )}
                  </div>
                  <div className="pb-8">
                    <div className={`font-medium text-sm ${stop.status === 'current' ? 'text-primary' : stop.status === 'completed' ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {stop.name}
                    </div>
                    <div className="text-xs text-muted-foreground">{stop.status === 'current' ? `Arriving ~${stop.time}` : stop.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Boarding Card */}
          <div className="glass-card p-6 mb-6">
            <h3 className="font-display font-semibold mb-4">Boarding Point</h3>
            <div className="bg-secondary/50 p-4 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="font-medium">{tripData.boardingPoint}</span>
              </div>
              <p className="text-xs text-muted-foreground ml-8">Counter 3, Gate B — Arrive 15 mins before departure</p>
            </div>
          </div>

          {/* Service Info */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Wifi, label: 'WiFi: Connected' },
              { icon: Coffee, label: 'Refreshments' },
              { icon: Phone, label: 'Driver: Available' },
            ].map((item, i) => (
              <div key={i} className="glass-card p-4 text-center">
                <item.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <div className="text-xs text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
