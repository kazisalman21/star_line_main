import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Counter, CounterStatus, RouteData, RouteStatus, RoutePoint } from '@/data/types';

// ═══════════════════════════════════════════════════════════════
//  Supabase-backed store
//  DB tables used: terminals, routes, route_counters
//  Only references columns that actually exist in the schema.
//  Extended fields (notes, breakMinutes, etc.) map to existing
//  columns where possible or use sensible defaults.
// ═══════════════════════════════════════════════════════════════

export function generatePointId(): string {
  return `rp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── DB row → App type mappers ─────────────────────────────────

function dbTerminalToCounter(t: any): Counter {
  return {
    id: t.id,
    code: t.short_name || '',
    name: t.name,
    type: t.is_main_terminal ? 'Main Terminal' : 'Counter',
    district: t.district || '',
    address: t.location || '',
    phone: t.phone || '',
    notes: '',
    mapLocation: '',
    status: (t.status === 'active' ? 'active' : 'inactive') as CounterStatus,
    isMainTerminal: t.is_main_terminal || false,
    createdAt: t.created_at || new Date().toISOString(),
    updatedAt: t.created_at || new Date().toISOString(),
  };
}

function dbRouteToAppRoute(r: any, routeCounters: any[]): RouteData {
  const myCounters = routeCounters
    .filter(c => c.route_id === r.id)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const points: RoutePoint[] = myCounters.map((c, idx) => ({
    id: c.id,
    routeId: r.id,
    orderIndex: idx + 1,
    pointType: mapDbCounterType(c.counter_type),
    counterId: null, // route_counters doesn't have terminal_id column yet
    customPointName: c.name,
    haltMinutes: 5,
    breakMinutes: c.counter_type === 'Break (20 min)' ? 20 : 0,
    isBoardingAllowed: c.counter_type !== 'Break (20 min)',
    isDroppingAllowed: c.counter_type !== 'Break (20 min)',
    isVisibleToCustomer: true,
    status: (c.status === 'Active' ? 'active' : 'hold') as 'active' | 'hold',
    notes: '',
  }));

  return {
    id: r.id,
    code: `${r.origin}-${r.destination}`.substring(0, 16).toUpperCase().replace(/\s/g, ''),
    name: `${r.origin} → ${r.destination}`,
    from: r.origin,
    to: r.destination,
    direction: 'Outbound',
    estimatedDuration: r.duration_minutes
      ? `${Math.floor(r.duration_minutes / 60)}h ${r.duration_minutes % 60}m`
      : '',
    baseFare: r.base_fare || 0,
    status: (r.status === 'active' ? 'active' : 'hold') as RouteStatus,
    notes: '',
    points,
    createdAt: r.created_at || new Date().toISOString(),
    updatedAt: r.created_at || new Date().toISOString(),
  };
}

function mapDbCounterType(t: string): RoutePoint['pointType'] {
  const map: Record<string, RoutePoint['pointType']> = {
    'Starting Point': 'Origin Terminal',
    'Counter': 'Counter',
    'Break (20 min)': 'Break Point',
    'Last Stop': 'Destination Terminal',
  };
  return map[t] || 'Counter';
}

function mapPointTypeToDb(t: string): 'Starting Point' | 'Counter' | 'Break (20 min)' | 'Last Stop' {
  const map: Record<string, 'Starting Point' | 'Counter' | 'Break (20 min)' | 'Last Stop'> = {
    'Origin Terminal': 'Starting Point',
    'Destination Terminal': 'Last Stop',
    'Counter': 'Counter',
    'Pickup Point': 'Counter',
    'Drop Point': 'Counter',
    'Intermediate Stop': 'Counter',
    'Break Point': 'Break (20 min)',
    'Restaurant Break': 'Break (20 min)',
  };
  return map[t] || 'Counter';
}

// ── Store ─────────────────────────────────────────────────────

interface CounterStoreState {
  counters: Counter[];
  routes: RouteData[];
  loading: boolean;
  error: string | null;

  loadCounters: () => Promise<void>;
  loadRoutes: () => Promise<void>;
  loadAll: () => Promise<void>;

  addCounter: (data: Omit<Counter, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCounter: (id: string, data: Partial<Counter>) => Promise<void>;
  setCounterStatus: (id: string, status: CounterStatus) => Promise<void>;
  getCounterById: (id: string) => Counter | undefined;
  getCounterUsageCount: (counterId: string) => number;

  addRoute: (data: Omit<RouteData, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateRoute: (id: string, data: Partial<RouteData>) => Promise<void>;
  deleteRoute: (id: string) => Promise<void>;
  setRouteStatus: (id: string, status: RouteStatus) => Promise<void>;
  duplicateRoute: (id: string) => Promise<void>;
}

export const useStore = create<CounterStoreState>((set, get) => ({
  counters: [],
  routes: [],
  loading: false,
  error: null,

  // ── Load from Supabase ──────────────────────────────────────

  loadCounters: async () => {
    try {
      const { data, error } = await supabase
        .from('terminals')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      set({ counters: (data || []).map(dbTerminalToCounter) });
    } catch (e: any) {
      console.error('Failed to load counters:', e);
      set({ error: e.message });
    }
  },

  loadRoutes: async () => {
    try {
      const [routesRes, countersRes] = await Promise.all([
        supabase.from('routes').select('*').order('created_at', { ascending: false }),
        supabase.from('route_counters').select('*').order('sort_order', { ascending: true }),
      ]);
      if (routesRes.error) throw routesRes.error;
      if (countersRes.error) throw countersRes.error;

      const routes = (routesRes.data || []).map(r =>
        dbRouteToAppRoute(r, countersRes.data || [])
      );
      set({ routes });
    } catch (e: any) {
      console.error('Failed to load routes:', e);
      set({ error: e.message });
    }
  },

  loadAll: async () => {
    set({ loading: true });
    await Promise.all([get().loadCounters(), get().loadRoutes()]);
    set({ loading: false });
  },

  // ── Counter CRUD (terminals table) ──────────────────────────

  addCounter: async (data) => {
    try {
      const { error } = await supabase.from('terminals').insert({
        name: data.name,
        short_name: data.code,
        location: data.address,
        district: data.district,
        phone: data.phone,
        is_main_terminal: data.isMainTerminal,
        status: data.status === 'active' ? 'active' : 'inactive',
      });
      if (error) throw error;
      await get().loadCounters();
    } catch (e: any) {
      console.error('Failed to add counter:', e);
      set({ error: e.message });
    }
  },

  updateCounter: async (id, data) => {
    try {
      const updates: Record<string, any> = {};
      if (data.name !== undefined) updates.name = data.name;
      if (data.code !== undefined) updates.short_name = data.code;
      if (data.address !== undefined) updates.location = data.address;
      if (data.district !== undefined) updates.district = data.district;
      if (data.phone !== undefined) updates.phone = data.phone;
      if (data.isMainTerminal !== undefined) updates.is_main_terminal = data.isMainTerminal;
      if (data.status !== undefined) updates.status = data.status === 'active' ? 'active' : 'inactive';

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase.from('terminals').update(updates).eq('id', id);
        if (error) throw error;
      }
      await get().loadCounters();
    } catch (e: any) {
      console.error('Failed to update counter:', e);
      set({ error: e.message });
    }
  },

  setCounterStatus: async (id, status) => {
    try {
      const dbStatus = status === 'active' ? 'active' : 'inactive';
      const { error } = await supabase.from('terminals').update({ status: dbStatus }).eq('id', id);
      if (error) throw error;
      await get().loadCounters();
    } catch (e: any) {
      console.error('Failed to set counter status:', e);
      set({ error: e.message });
    }
  },

  getCounterById: (id) => get().counters.find(c => c.id === id),

  getCounterUsageCount: (counterId) => {
    // Since route_counters doesn't link to terminals by ID yet,
    // match by name as a best-effort approach
    const counter = get().counters.find(c => c.id === counterId);
    if (!counter) return 0;
    return get().routes.reduce((count, route) => {
      return count + route.points.filter(p =>
        p.customPointName?.toLowerCase() === counter.name.toLowerCase()
      ).length;
    }, 0);
  },

  // ── Route CRUD (routes + route_counters tables) ─────────────

  addRoute: async (data) => {
    try {
      let durationMinutes = 0;
      if (data.estimatedDuration) {
        const h = data.estimatedDuration.match(/(\d+)\s*h/);
        const m = data.estimatedDuration.match(/(\d+)\s*m/);
        durationMinutes = (h ? parseInt(h[1]) * 60 : 0) + (m ? parseInt(m[1]) : 0);
      }

      const { data: newRoute, error } = await supabase
        .from('routes')
        .insert({
          origin: data.from,
          destination: data.to,
          distance_km: 0,
          duration_minutes: durationMinutes,
          base_fare: data.baseFare,
          status: data.status === 'active' ? 'active' : 'inactive',
        })
        .select()
        .single();

      if (error) throw error;
      if (!newRoute) throw new Error('No route returned');

      // Insert route points as route_counters
      if (data.points && data.points.length > 0) {
        const rows = data.points.map((p, idx) => {
          const counter = p.counterId ? get().getCounterById(p.counterId) : null;
          return {
            route_id: newRoute.id,
            name: counter?.name || p.customPointName || 'Unnamed',
            location: counter?.address || '',
            district: counter?.district || '',
            phone: counter?.phone || '',
            counter_type: mapPointTypeToDb(p.pointType),
            status: 'Active' as const,
            sort_order: idx + 1,
          };
        });

        const { error: cErr } = await supabase.from('route_counters').insert(rows);
        if (cErr) console.warn('Failed to insert route counters:', cErr);
      }

      await get().loadRoutes();
    } catch (e: any) {
      console.error('Failed to add route:', e);
      set({ error: e.message });
    }
  },

  updateRoute: async (id, data) => {
    try {
      const updates: Record<string, any> = {};
      if (data.from !== undefined) updates.origin = data.from;
      if (data.to !== undefined) updates.destination = data.to;
      if (data.baseFare !== undefined) updates.base_fare = data.baseFare;
      if (data.status !== undefined) updates.status = data.status === 'active' ? 'active' : 'inactive';
      if (data.estimatedDuration !== undefined) {
        const h = data.estimatedDuration.match(/(\d+)\s*h/);
        const m = data.estimatedDuration.match(/(\d+)\s*m/);
        updates.duration_minutes = (h ? parseInt(h[1]) * 60 : 0) + (m ? parseInt(m[1]) : 0);
      }

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase.from('routes').update(updates).eq('id', id);
        if (error) throw error;
      }

      // Replace route_counters if points changed
      if (data.points !== undefined) {
        await supabase.from('route_counters').delete().eq('route_id', id);

        if (data.points.length > 0) {
          const rows = data.points.map((p, idx) => {
            const counter = p.counterId ? get().getCounterById(p.counterId) : null;
            return {
              route_id: id,
              name: counter?.name || p.customPointName || 'Unnamed',
              location: counter?.address || '',
              district: counter?.district || '',
              phone: counter?.phone || '',
              counter_type: mapPointTypeToDb(p.pointType),
              status: 'Active' as const,
              sort_order: idx + 1,
            };
          });

          const { error: cErr } = await supabase.from('route_counters').insert(rows);
          if (cErr) console.warn('Failed to update route counters:', cErr);
        }
      }

      await get().loadRoutes();
    } catch (e: any) {
      console.error('Failed to update route:', e);
      set({ error: e.message });
    }
  },

  deleteRoute: async (id) => {
    try {
      await supabase.from('route_counters').delete().eq('route_id', id);
      const { error } = await supabase.from('routes').delete().eq('id', id);
      if (error) throw error;
      await get().loadRoutes();
    } catch (e: any) {
      console.error('Failed to delete route:', e);
      set({ error: e.message });
    }
  },

  setRouteStatus: async (id, status) => {
    try {
      const dbStatus = status === 'active' ? 'active' : 'inactive';
      const { error } = await supabase.from('routes').update({ status: dbStatus }).eq('id', id);
      if (error) throw error;
      await get().loadRoutes();
    } catch (e: any) {
      console.error('Failed to set route status:', e);
      set({ error: e.message });
    }
  },

  duplicateRoute: async (id) => {
    try {
      const route = get().routes.find(r => r.id === id);
      if (!route) return;
      await get().addRoute({
        code: `${route.code}-COPY`,
        name: `${route.name} (Copy)`,
        from: route.from,
        to: route.to,
        direction: route.direction,
        estimatedDuration: route.estimatedDuration,
        baseFare: route.baseFare,
        status: 'draft',
        notes: route.notes,
        points: route.points.map(p => ({ ...p, id: generatePointId() })),
      });
    } catch (e: any) {
      console.error('Failed to duplicate route:', e);
      set({ error: e.message });
    }
  },
}));
