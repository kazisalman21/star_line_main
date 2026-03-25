import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, Star, Ticket, ChevronRight } from 'lucide-react';
import SearchForm from '@/components/SearchForm';

import layerSky from '@/assets/hero-layer-sky.png';
import layerTerminal from '@/assets/hero-layer-terminal.png';
import layerBus from '@/assets/hero-layer-bus.png';
import layerTraveler from '@/assets/hero-layer-traveler.png';
import layerForeground from '@/assets/hero-layer-foreground.png';

const PARALLAX_LAYERS = [
  { src: layerSky, alt: 'Night sky', depth: 0.01, className: 'inset-0 object-cover' },
  { src: layerTerminal, alt: 'Terminal', depth: 0.03, className: 'absolute right-0 bottom-0 h-[85%] w-auto object-contain object-right-bottom' },
  { src: layerBus, alt: 'Starline Bus', depth: 0.05, className: 'absolute right-[8%] bottom-[8%] h-[48%] w-auto object-contain' },
  { src: layerTraveler, alt: 'Traveler', depth: 0.06, className: 'absolute right-[32%] bottom-[6%] h-[52%] w-auto object-contain traveler-idle' },
  { src: layerForeground, alt: 'Road', depth: 0.02, className: 'absolute bottom-0 left-0 w-full h-[45%] object-cover object-bottom' },
];

interface ParallaxLayerProps {
  layer: typeof PARALLAX_LAYERS[number];
  index: number;
  smoothX: ReturnType<typeof useSpring>;
  smoothY: ReturnType<typeof useSpring>;
  loaded: boolean;
}

function ParallaxLayer({ layer, index, smoothX, smoothY, loaded }: ParallaxLayerProps) {
  const x = useTransform(smoothX, (v) => v * layer.depth * -120);
  const y = useTransform(smoothY, (v) => v * layer.depth * -80);

  return (
    <motion.div
      className="absolute inset-0 will-change-transform"
      style={{ x, y, zIndex: index }}
      initial={{ opacity: 0, scale: 1.08 }}
      animate={loaded ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 1.2, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
    >
      <img
        src={layer.src}
        alt={layer.alt}
        className={layer.className}
        width={1920}
        height={1080}
        draggable={false}
      />
    </motion.div>
  );
}

export default function AnimatedHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 30 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 30 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / rect.width - 0.5;
      const cy = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(cx);
      mouseY.set(cy);
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, [mouseX, mouseY]);

  return (
    <section ref={containerRef} className="relative min-h-[100vh] flex items-center overflow-hidden">
      {/* Parallax Layers */}
      {PARALLAX_LAYERS.map((layer, i) => (
        <ParallaxLayer
          key={i}
          layer={layer}
          index={i}
          smoothX={smoothX}
          smoothY={smoothY}
          loaded={loaded}
        />
      ))}

      {/* Ambient Effects */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 6 }}>
        {/* Lamppost glow pulse */}
        <div className="lamppost-glow" />
        {/* Fog drift */}
        <div className="fog-drift" />
        {/* Bus headlight bloom */}
        <div className="headlight-bloom" />
      </div>

      {/* Gradient overlays for text readability */}
      <div className="absolute inset-0" style={{ zIndex: 7 }}>
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Content */}
      <div className="container relative pt-28 pb-16 md:pt-32 md:pb-24" style={{ zIndex: 8 }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
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

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-8 lg:mt-12"
        >
          <SearchForm variant="hero" />
        </motion.div>
      </div>
    </section>
  );
}
