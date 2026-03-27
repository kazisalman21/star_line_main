import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, Shield, Snowflake, Wifi, Zap, Coffee, Users, Armchair, Star, Bus } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getPopularRoutes, getBusTypes, PopularRoute } from '@/services/routeService';
import PageHead from '@/components/PageHead';
import { getToday } from '@/lib/utils';

const safetyFeatures = [
  { icon: Shield, title: 'GPS Tracked', desc: 'All coaches are GPS tracked 24/7' },
  { icon: Users, title: 'Trained Drivers', desc: 'Professional drivers with 10+ years experience' },
  { icon: Star, title: 'Regular Maintenance', desc: 'Coaches serviced every 5,000 km' },
  { icon: Bus, title: 'Insurance Coverage', desc: 'Full passenger insurance on every trip' },
];

const amenityMap: Record<string, typeof Wifi> = {
  'AC': Snowflake, 'WiFi': Wifi, 'USB Charging': Zap, 'Snacks': Coffee,
  'Blanket': Armchair, 'Entertainment': Star, 'Reclining Seats': Armchair,
  'Water': Coffee, 'Fan': Snowflake,
};

export default function RoutesFleet() {
  const [routes, setRoutes] = useState<PopularRoute[]>([]);
  const [coachTypes, setCoachTypes] = useState<{ name: string; type: string; seats: number; amenities: string[] }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPopularRoutes(), getBusTypes()])
      .then(([r, b]) => { setRoutes(r); setCoachTypes(b); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <PageHead title="Routes & Fleet" description="Explore Star Line Group's intercity bus routes across Bangladesh and our premium coach fleet." />
      <Navbar />
      <div className="pt-20 pb-12">
        <div className="container">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Routes & Fleet</h1>
          <p className="text-muted-foreground mb-12">Explore our popular routes and premium coach fleet</p>

          {/* Routes */}
          <section className="mb-16">
            <h2 className="font-display text-2xl font-bold mb-6">Popular Routes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="glass-card p-5 animate-pulse">
                    <div className="h-5 bg-secondary rounded w-3/4 mb-3" />
                    <div className="h-4 bg-secondary rounded w-full mb-2" />
                    <div className="h-1.5 bg-secondary rounded w-full" />
                  </div>
                ))
              ) : routes.map((route, i) => (
                <motion.div
                  key={route.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/search?from=${encodeURIComponent(route.from)}&to=${encodeURIComponent(route.to)}&date=${getToday()}&passengers=1`}
                    className="glass-card p-5 block card-hover group"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-semibold">{route.from}</span>
                      <ChevronRight className="w-4 h-4 text-primary" />
                      <span className="font-semibold">{route.to}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                      <span>{route.duration} • {route.distance}</span>
                      <span className="text-accent font-semibold">৳{route.basePrice}+</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-1.5">
                      <div className="bg-primary h-1.5 rounded-full" style={{ width: `${route.popularity}%` }} />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{route.popularity}% popularity</div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Fleet */}
          <section className="mb-16">
            <h2 className="font-display text-2xl font-bold mb-6">Our Fleet</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {coachTypes.map((coach, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-6 card-hover"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-display font-bold text-lg">{coach.name}</h3>
                      <span className="text-xs text-primary">{coach.type}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">{coach.seats} seats</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {coach.amenities.map(a => {
                      const Icon = amenityMap[a] || Star;
                      return (
                        <span key={a} className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-full text-xs text-muted-foreground">
                          <Icon className="w-3 h-3" /> {a}
                        </span>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Safety */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-6">Safety & Reliability</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {safetyFeatures.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-6 text-center card-hover"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-1">{f.title}</h4>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
