import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, Star, Ticket, ChevronRight } from 'lucide-react';
import gsap from 'gsap';
import { useTheme } from 'next-themes';

import heroBgDark from '@/assets/hero-main-theme.webp';
import heroBgLight from '@/assets/hero-day-theme.webp';
import travelerImg from '@/assets/travler.png';

export default function AnimatedHero() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLImageElement>(null);
  const travelerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);
  const ambientRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ── Cinematic entry timeline ──
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Background: Ken Burns zoom-in reveal (ends at 1.1 to match scroll parallax scale)
      tl.fromTo(bgRef.current,
        { scale: 1.3, opacity: 0 },
        { scale: 1.1, opacity: 1, duration: 2 }
      );

      // Overlay fades in
      tl.fromTo(overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1.2 },
        '-=1.4'
      );

      // Traveler slides up from below
      tl.fromTo(travelerRef.current,
        { y: 80, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out' },
        '-=0.8'
      );

      // Ambient effects fade in (only in dark mode)
      if (ambientRef.current) {
        tl.fromTo(ambientRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 1 },
          '-=0.6'
        );
      }

      // Content stagger: badge → heading → description → CTA → trust badges
      tl.fromTo(badgeRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        '-=0.8'
      )
      .fromTo(headingRef.current,
        { y: 40, opacity: 0, clipPath: 'inset(0 0 100% 0)' },
        { y: 0, opacity: 1, clipPath: 'inset(0 0 0% 0)', duration: 0.8, ease: 'power4.out' },
        '-=0.3'
      )
      .fromTo(descRef.current,
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        '-=0.3'
      )
      .fromTo(ctaRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        '-=0.2'
      )
      .fromTo(trustRef.current,
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4 },
        '-=0.2'
      );

      // ── Manual scroll parallax (starts after entry completes) ──
      const handleScroll = () => {
        if (!bgRef.current) return;
        const scrollY = window.scrollY;
        bgRef.current.style.transform = `translateY(${scrollY * 0.3}px) scale(1.1)`;
      };

      // Only attach scroll parallax after entry animation finishes
      tl.call(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
      });

      // Store reference for cleanup
      (sectionRef.current as any).__scrollHandler = handleScroll;

    }, sectionRef);

    return () => {
      ctx.revert();
      const handler = (sectionRef.current as any)?.__scrollHandler;
      if (handler) window.removeEventListener('scroll', handler);
    };
  }, []);

  // Choose hero background based on theme
  const heroBg = mounted ? (isDark ? heroBgDark : heroBgLight) : heroBgDark;

  // Theme-aware text colors
  const textColor = isDark ? 'text-[hsl(40,10%,92%)]' : 'text-[hsl(220,28%,12%)]';

  return (
    <section ref={sectionRef} className="relative min-h-[100vh] flex items-center overflow-hidden">
      {/* Background — swaps with theme */}
      <img
        ref={bgRef}
        src={heroBg}
        alt={isDark ? 'Star Line terminal at night' : 'Star Line terminal in daylight'}
        className="absolute inset-0 w-full h-full object-cover will-change-transform transition-none"
        style={{ opacity: 0 }}
        draggable={false}
      />

      {/* Traveler overlay — same in both themes */}
      <div
        ref={travelerRef}
        className="absolute bottom-0 right-[6%] z-[5] hidden md:block"
        style={{ opacity: 0 }}
      >
        <img
          src={travelerImg}
          alt="Traveler checking ticket"
          className="h-[72vh] w-auto object-contain drop-shadow-[0_8px_40px_rgba(0,0,0,0.6)]"
          style={{ filter: isDark ? 'brightness(0.82) contrast(1.12) saturate(0.85)' : 'brightness(1.05) contrast(1.05) saturate(1.0)' }}
          draggable={false}
        />
        {/* Ground contact shadow */}
        <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] h-5 rounded-[50%] blur-lg ${isDark ? 'bg-black/30' : 'bg-black/15'}`} />
      </div>

      {/* Ambient Effects — only in dark mode */}
      {isDark && (
        <div ref={ambientRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 6, opacity: 0 }}>
          <div className="lamppost-glow" />
          <div className="fog-drift" />
          <div className="headlight-bloom" />
          <div className="road-shimmer" />
        </div>
      )}

      {/* Gradient overlays — theme-aware */}
      <div ref={overlayRef} className="absolute inset-0" style={{ zIndex: 7, opacity: 0 }}>
        {isDark ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(220,28%,6%)] via-[hsl(220,28%,6%,0.88)] to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[hsl(220,28%,6%)] via-transparent to-[hsl(220,28%,6%,0.35)]" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-white via-[hsl(0,0%,100%,0.92)] to-[hsl(0,0%,100%,0.1)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-[hsl(0,0%,100%,0.4)] to-[hsl(0,0%,100%,0.5)]" />
          </>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Content */}
      <div ref={contentRef} className={`container relative pt-28 pb-16 md:pt-32 md:pb-24 ${textColor}`} style={{ zIndex: 8 }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div ref={badgeRef} className="inline-flex items-center gap-2 bg-primary/8 border border-primary/15 rounded-full px-4 py-1.5 mb-8" style={{ opacity: 0 }}>
              <Star className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs font-semibold tracking-wide text-accent uppercase">Star Line Group</span>
            </div>

            <h1 ref={headingRef} className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6 tracking-tight" style={{ opacity: 0 }}>
              Your Journey,{' '}
              <span className="text-gradient-primary">Our Pride.</span>
            </h1>

            <p ref={descRef} className={`text-base md:text-lg max-w-md leading-relaxed mb-10 ${isDark ? 'text-muted-foreground' : 'text-[hsl(220,15%,40%)]'}`} style={{ opacity: 0 }}>
              Book intercity bus tickets with Star Line — premium coaches, live tracking, and reliable schedules across Bangladesh.
            </p>

            <div ref={ctaRef} className="flex flex-col sm:flex-row gap-3 mb-6" style={{ opacity: 0 }}>
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

            <div ref={trustRef} className="flex items-center gap-6 text-xs text-muted-foreground" style={{ opacity: 0 }}>
              <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-success" /> Verified Operator</span>
              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-accent" /> 2M+ Passengers</span>
            </div>
          </div>

          <div className="hidden lg:block" />
        </div>
      </div>
    </section>
  );
}
