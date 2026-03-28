import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, ChevronRight, Coffee, Building2, Navigation, Search, Bus, Clock, AlertTriangle, CircleDot, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHead from '@/components/PageHead';
import { getTerminals, getRoutesWithCounters, type TerminalData, type RouteWithCounters, type CounterData } from '@/services/counterService';
import { terminals as staticTerminals, routes as staticRoutes, routeConnections } from '@/data/routeCounters';

const statusColors: Record<string, string> = {
  Active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  Unverified: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  Unconfirmed: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
};

const typeIcons: Record<string, typeof MapPin> = {
  'Starting Point': Navigation,
  'Counter': CircleDot,
  'Break (20 min)': Coffee,
  'Last Stop': Building2,
};

function TerminalCard({ terminal, isSelected, onClick }: { terminal: TerminalData; isSelected: boolean; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full text-left glass-card p-5 card-hover transition-all duration-300 ${
        isSelected ? 'ring-2 ring-primary/60 border-primary/30' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          terminal.isMainTerminal ? 'bg-primary/15' : 'bg-accent/15'
        }`}>
          {terminal.isMainTerminal ? <Building2 className="w-5 h-5 text-primary" /> : <MapPin className="w-5 h-5 text-accent" />}
        </div>
        <div className="min-w-0">
          <h3 className="font-display font-semibold text-sm leading-tight">{terminal.name}</h3>
          <p className="text-xs text-muted-foreground mt-1">{terminal.location}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <Phone className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{terminal.phone}</span>
          </div>
        </div>
      </div>
      {terminal.isMainTerminal && (
        <span className="inline-block mt-3 text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
          Main Terminal
        </span>
      )}
    </motion.button>
  );
}

function RouteTimeline({ route }: { route: RouteWithCounters }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass-card-elevated p-6 md:p-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
          <Bus className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-bold text-lg">{route.from} → {route.to}</h3>
          <p className="text-xs text-muted-foreground">{route.counters.length} stops along this route</p>
        </div>
      </div>

      <div className="relative">
        {route.counters.map((counter, i) => {
          const Icon = typeIcons[counter.type] || CircleDot;
          const isFirst = i === 0;
          const isLast = i === route.counters.length - 1;
          const isBreak = counter.type === 'Break (20 min)';

          return (
            <motion.div
              key={counter.id || i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="relative flex gap-4 group"
            >
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 border-2 transition-colors ${
                  isFirst ? 'bg-emerald-500/20 border-emerald-500/50' :
                  isLast ? 'bg-primary/20 border-primary/50' :
                  isBreak ? 'bg-amber-500/20 border-amber-500/50' :
                  'bg-secondary border-border/60 group-hover:border-primary/40'
                }`}>
                  <Icon className={`w-4 h-4 ${
                    isFirst ? 'text-emerald-400' :
                    isLast ? 'text-primary' :
                    isBreak ? 'text-amber-400' :
                    'text-muted-foreground group-hover:text-foreground'
                  }`} />
                </div>
                {!isLast && (
                  <div className={`w-0.5 flex-1 min-h-[24px] ${
                    isBreak ? 'border-l-2 border-dashed border-amber-500/30' : 'bg-border/40'
                  }`} />
                )}
              </div>

              <div className={`pb-5 flex-1 min-w-0 ${isLast ? 'pb-0' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-sm">{counter.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{counter.location}, {counter.district}</p>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${statusColors[counter.status] || statusColors.Active}`}>
                    {counter.status}
                  </span>
                </div>
                {counter.phone !== '—' && (
                  <a href={`tel:${counter.phone}`} className="flex items-center gap-1.5 mt-1.5 text-xs text-primary hover:underline">
                    <Phone className="w-3 h-3" /> {counter.phone}
                  </a>
                )}
                {isBreak && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-amber-400">
                    <Clock className="w-3 h-3" /> 20 min rest break
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Google Maps embed */}
      {route.counters.length >= 2 && (
        <div className="mt-6 rounded-xl overflow-hidden border border-border/30">
          <iframe
            title={`Map: ${route.from} to ${route.to}`}
            width="100%"
            height="280"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps/embed/v1/directions?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&origin=${encodeURIComponent(route.counters[0].location + ', ' + route.counters[0].district + ', Bangladesh')}&destination=${encodeURIComponent(route.counters[route.counters.length - 1].location + ', ' + route.counters[route.counters.length - 1].district + ', Bangladesh')}&mode=driving`}
            className="w-full"
          />
        </div>
      )}
    </motion.div>
  );
}

export default function Counters() {
  const [terminals, setTerminals] = useState<TerminalData[]>([]);
  const [routes, setRoutes] = useState<RouteWithCounters[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTerminal, setSelectedTerminal] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load from DB, fallback to static
  useEffect(() => {
    async function load() {
      setLoading(true);
      const [dbTerminals, dbRoutes] = await Promise.all([
        getTerminals(),
        getRoutesWithCounters(),
      ]);

      if (dbTerminals.length > 0) {
        setTerminals(dbTerminals);
      } else {
        // Fallback to static data
        setTerminals(staticTerminals.map(t => ({
          id: t.id,
          name: t.name,
          shortName: t.shortName,
          location: t.location,
          district: t.district,
          phone: t.phone,
          isMainTerminal: t.isMainTerminal,
        })));
      }

      if (dbRoutes.length > 0 && dbRoutes.some(r => r.counters.length > 0)) {
        setRoutes(dbRoutes);
      } else {
        // Fallback to static routes
        setRoutes(staticRoutes.map(r => ({
          id: r.id,
          from: r.from,
          to: r.to,
          counters: r.counters.map((c, i) => ({
            id: `${r.id}-${i}`,
            routeId: r.id,
            name: c.name,
            location: c.location,
            district: c.district,
            phone: c.phone,
            type: c.type,
            status: c.status,
            sortOrder: i,
          })),
        })));
      }
      setLoading(false);
    }
    load();
  }, []);

  const filteredTerminals = useMemo(() => {
    if (!searchQuery) return terminals;
    const q = searchQuery.toLowerCase();
    return terminals.filter(t =>
      t.name.toLowerCase().includes(q) || t.district.toLowerCase().includes(q) || t.location.toLowerCase().includes(q)
    );
  }, [searchQuery, terminals]);

  const terminalRoutes = useMemo(() => {
    if (!selectedTerminal) return [];
    const terminal = terminals.find(t => t.id === selectedTerminal);
    if (!terminal) return [];
    // Match routes that involve this terminal's district/name
    const matched = routes.filter(r =>
      r.from.includes(terminal.shortName) || r.to.includes(terminal.shortName) ||
      r.from.includes(terminal.district) || r.to.includes(terminal.district)
    );
    // Also check static route connections as fallback
    const staticConns = routeConnections.filter(rc =>
      rc.from.includes(terminal.shortName) || rc.from.includes(terminal.name)
    );
    // Merge: prefer DB routes, fill gaps with static connections
    const routeIds = new Set(matched.map(r => r.id));
    const extra = staticConns
      .filter(rc => rc.routeId && !routeIds.has(rc.routeId))
      .map(rc => {
        const route = routes.find(r => r.id === rc.routeId);
        return route || null;
      })
      .filter(Boolean) as RouteWithCounters[];
    return [...matched, ...extra];
  }, [selectedTerminal, terminals, routes]);

  const activeRoute = useMemo(() => {
    if (!selectedRoute) return null;
    return routes.find(r => r.id === selectedRoute) || null;
  }, [selectedRoute, routes]);

  const handleTerminalClick = (id: string) => {
    setSelectedTerminal(prev => prev === id ? null : id);
    setSelectedRoute(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 pb-12 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHead title="Terminals & Counters" description="Explore Star Line Group's complete counter network across Bangladesh. View terminals, routes, and every stop along the way." />
      <Navbar />
      <div className="pt-20 pb-16">
        {/* Hero header */}
        <div className="container mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">Network & Counters</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
              Our <span className="text-gradient-primary">Terminals & Routes</span>
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Explore Star Line's complete counter network across Bangladesh. Select a terminal to see all available routes and every stop along the way.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 max-w-md"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search terminals by name or district..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/60 border border-border/40 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <div className="container mb-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Terminals', value: terminals.filter(t => t.isMainTerminal).length, icon: Building2 },
              { label: 'Counter Points', value: terminals.length, icon: MapPin },
              { label: 'Active Routes', value: routes.length, icon: Bus },
              { label: 'Districts Covered', value: new Set(terminals.map(t => t.district)).size, icon: Navigation },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                className="glass-card p-4 text-center"
              >
                <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <div className="font-display text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Terminals sidebar */}
            <div className="lg:col-span-4 space-y-3">
              <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" /> Terminals
              </h2>
              <div className="space-y-2.5 max-h-[70vh] overflow-y-auto scrollbar-hide pr-1">
                {filteredTerminals.map((terminal, i) => (
                  <motion.div
                    key={terminal.id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <TerminalCard
                      terminal={terminal}
                      isSelected={selectedTerminal === terminal.id}
                      onClick={() => handleTerminalClick(terminal.id)}
                    />
                  </motion.div>
                ))}
                {filteredTerminals.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground text-sm">No terminals found</div>
                )}
              </div>
            </div>

            {/* Routes + Detail */}
            <div className="lg:col-span-8 space-y-4">
              <AnimatePresence mode="wait">
                {!selectedTerminal ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="glass-card p-12 text-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                      <Navigation className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-display font-semibold text-lg mb-2">Select a Terminal</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                      Choose a terminal from the left to explore available routes and all counter stops along the way.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key={selectedTerminal}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="glass-card p-5">
                      <h3 className="font-display font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wider">
                        Routes from {terminals.find(t => t.id === selectedTerminal)?.shortName}
                      </h3>
                      {terminalRoutes.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No routes available from this terminal yet.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {terminalRoutes.map((route, i) => (
                            <motion.button
                              key={route.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.05 }}
                              onClick={() => setSelectedRoute(route.id)}
                              className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                                selectedRoute === route.id
                                  ? 'bg-primary/15 border border-primary/30'
                                  : 'bg-secondary/50 border border-border/30 hover:bg-secondary'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                selectedRoute === route.id ? 'bg-primary/20' : 'bg-muted'
                              }`}>
                                <ChevronRight className={`w-4 h-4 ${selectedRoute === route.id ? 'text-primary' : 'text-muted-foreground'}`} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-medium truncate">{route.from} → {route.to}</p>
                                <p className="text-[10px] text-muted-foreground">{route.counters.length} stops</p>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </div>

                    <AnimatePresence mode="wait">
                      {activeRoute && <RouteTimeline key={activeRoute.id} route={activeRoute} />}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="container mt-12">
          <div className="glass-card p-5">
            <h3 className="font-display font-semibold text-sm mb-3 uppercase tracking-wider text-muted-foreground">Legend</h3>
            <div className="flex flex-wrap gap-4">
              {[
                { icon: Navigation, label: 'Starting Point', color: 'text-emerald-400' },
                { icon: CircleDot, label: 'Counter Stop', color: 'text-muted-foreground' },
                { icon: Coffee, label: 'Rest Break', color: 'text-amber-400' },
                { icon: Building2, label: 'Last Stop / Terminal', color: 'text-primary' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  {item.label}
                </div>
              ))}
              <div className="w-px h-4 bg-border" />
              {[
                { label: 'Active', cls: statusColors.Active },
                { label: 'Unverified', cls: statusColors.Unverified },
                { label: 'Unconfirmed', cls: statusColors.Unconfirmed },
              ].map(s => (
                <span key={s.label} className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${s.cls}`}>{s.label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
