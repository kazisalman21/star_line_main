import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Clock, MapPin, Wifi, CreditCard, Headphones, ChevronRight, Star, Bus, Navigation, Ticket, Users } from 'lucide-react';
import SearchForm from '@/components/SearchForm';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { popularRoutes } from '@/data/mockData';
import heroBg from '@/assets/hero-starline.jpg';

const features = [
  { icon: Navigation, title: 'Live Tracking', desc: 'Track your coach in real-time from departure to destination' },
  { icon: Bus, title: 'Premium Fleet', desc: 'AC Sleeper, Business & Economy with modern amenities' },
  { icon: MapPin, title: 'Seat Selection', desc: 'Choose your preferred seat with interactive coach maps' },
  { icon: CreditCard, title: 'Easy Payments', desc: 'Pay with bKash, Nagad, card, or at counter' },
  { icon: Clock, title: 'On-Time Promise', desc: '94% on-time performance across all routes' },
  { icon: Shield, title: 'Safe & Insured', desc: 'GPS tracked coaches with full passenger insurance' },
];

const trustItems = [
  { value: '94%', label: 'On-Time Performance' },
  { value: '24/7', label: 'Customer Support' },
  { value: '100%', label: 'Digital Ticketing' },
  { value: '45+', label: 'Active Routes' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[100vh] flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover object-right-top" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="container relative z-10 pt-28 pb-16 md:pt-32 md:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/15 rounded-full px-4 py-1.5 mb-8">
                <Star className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs font-semibold tracking-wide text-accent uppercase">Star Line Group</span>
              </div>

              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6 tracking-tight">
                Your Journey,{' '}
                <span className="text-gradient-primary">Our Pride.</span>
              </h1>

              <p className="text-base md:text-lg text-muted-foreground max-w-md leading-relaxed mb-10">
                Book intercity bus tickets with Star Line — premium coaches, live tracking, and reliable schedules across Bangladesh.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <Link
                  to="/search"
                  className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all btn-primary-glow"
                >
                  <Ticket className="w-4 h-4" />
                  Search Trips
                </Link>
                <Link
                  to="/routes"
                  className="inline-flex items-center justify-center gap-2 bg-secondary border border-border text-foreground px-7 py-3.5 rounded-xl font-semibold text-sm hover:bg-secondary/80 transition-all"
                >
                  Explore Routes
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="flex items-center gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-success" /> Verified Operator</span>
                <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-accent" /> 2M+ Passengers</span>
              </div>
            </motion.div>

            {/* Right - stays empty for hero image to show through */}
            <div className="hidden lg:block" />
          </div>

          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8 lg:mt-12"
          >
            <SearchForm variant="hero" />
          </motion.div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="border-y border-border/50 bg-card/40">
        <div className="container py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {trustItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="font-display text-3xl md:text-4xl font-bold text-gradient-primary mb-1">{item.value}</div>
                <div className="text-sm text-muted-foreground">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-spacing">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="text-xs font-semibold tracking-widest text-accent uppercase mb-3 block">Why Star Line</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">A Better Way to Travel</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Premium service, dependable schedules, and a world-class booking experience.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card-elevated p-7 card-hover group"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="section-spacing bg-card/20">
        <div className="container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-xs font-semibold tracking-widest text-accent uppercase mb-3 block">Popular</span>
              <h2 className="font-display text-3xl font-bold">Top Routes</h2>
            </div>
            <Link to="/routes" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
              All routes <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularRoutes.slice(0, 8).map((route, i) => (
              <motion.div
                key={route.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/search?from=${encodeURIComponent(route.from)}&to=${encodeURIComponent(route.to)}&date=2026-03-25&passengers=1`}
                  className="glass-card p-5 block card-hover group"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-display font-semibold">{route.from}</span>
                    <ChevronRight className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="font-display font-semibold">{route.to}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{route.duration}</span>
                    <span className="text-accent font-bold">৳{route.basePrice}+</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-spacing">
        <div className="container">
          <div className="glass-card-elevated p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            <div className="relative z-10">
              <span className="text-xs font-semibold tracking-widest text-accent uppercase mb-4 block">Ready?</span>
              <h2 className="font-display text-3xl md:text-5xl font-bold mb-5 tracking-tight">Book Your Next Trip</h2>
              <p className="text-muted-foreground mb-10 max-w-md mx-auto">Experience premium intercity travel with Star Line. Your seat is waiting.</p>
              <Link
                to="/search"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-9 py-4 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all btn-primary-glow"
              >
                <Ticket className="w-4 h-4" />
                Search Trips
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
