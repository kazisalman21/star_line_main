import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Users, Star, Ticket, ChevronRight } from 'lucide-react';

import heroBg from '@/assets/hero-main-theme.jpg';
import travelerImg from '@/assets/travler.png';

export default function AnimatedHero() {
  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden">
      {/* Background — main theme image */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <img
          src={heroBg}
          alt="Star Line terminal at night"
          className="w-full h-full object-cover"
          draggable={false}
        />
      </motion.div>

      {/* Traveler overlay — positioned on the right, blended into the scene */}
      <motion.div
        className="absolute bottom-0 right-[8%] z-[5] hidden md:block"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <img
          src={travelerImg}
          alt="Traveler checking ticket"
          className="h-[70vh] w-auto object-contain drop-shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
          style={{ filter: 'brightness(0.85) contrast(1.1) saturate(0.9)' }}
          draggable={false}
        />
        {/* Ground shadow for realism */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-4 bg-black/20 rounded-[50%] blur-md" />
      </motion.div>

      {/* Ambient Effects */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 6 }}>
        <div className="lamppost-glow" />
        <div className="fog-drift" />
        <div className="headlight-bloom" />
        <div className="road-shimmer" />
      </div>

      {/* Gradient overlays for text readability */}
      <div className="absolute inset-0" style={{ zIndex: 7 }}>
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(220,28%,6%)] via-[hsl(220,28%,6%,0.85)] to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(220,28%,6%)] via-transparent to-[hsl(220,28%,6%,0.4)]" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Content */}
      <div className="container relative pt-28 pb-16 md:pt-32 md:pb-24 text-[hsl(40,10%,92%)]" style={{ zIndex: 8 }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
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

          <div className="hidden lg:block" />
        </div>
      </div>
    </section>
  );
}
