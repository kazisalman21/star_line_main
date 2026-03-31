import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Counter, CounterStatus, RouteData, RouteStatus, RoutePoint } from '@/data/types';

// ═══════════════════════════════════════════════════════════════
//  Supabase-backed store — uses `terminals` + `routes` + `route_counters`
//  tables from database.ts as the authoritative data source.
// ═══════════════════════════════════════════════════════════════

export function generatePointId(): string {
  return `rp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── Helpers: map DB rows ↔ app types ──────────────────────────

function dbTerminalToCounter(t: any): Counter {
  return {
    id: t.id,
    code: t.short_name || '',
    name: t.name,
    type: mapDbTypeToAppType(t.counter_type_ext || (t.is_main_terminal ? 'Main Terminal' : 'Counter')),
    district: t.district || '',
    address: t.location || '',
    phone: t.phone || '',
    notes: t.notes || '',
    mapLocation: t.map_location || '',
    status: mapDbStatusToAppStatus(t.status),
    isMainTerminal: t.is_main_terminal || false,
    createdAt: t.created_at || new Date().toISOString(),
    updatedAt: t.updated_at || t.created_at || new Date().toISOString(),
  };
}

function counterToDbTerminal(c: Omit<Counter, 'id' | 'createdAt' | 'updatedAt'>) {
  return {
    name: c.name,
    short_name: c.code,
    location: c.address,
    district: c.district,
    phone: c.phone,
    is_main_terminal: c.isMainTerminal,
    status: c.status === 'removed' ? 'inactive' : c.status === 'hold' ? 'inactive' : c.status,
    notes: c.notes || null,
    map_location: c.mapLocation || null,
    counter_type_ext: c.type,
  };
}

function mapDbTypeToAppType(t: string): Counter['type'] {
  const map: Record<string, Counter['type']> = {
    'Starting Point': 'Main Terminal',
    'Counter': 'Counter',
    'Break (20 min)': 'Break Point',
    'Last Stop': 'Main Terminal',
  };
  return map[t] || (t as Counter['type']) || 'Counter';
}

function mapDbStatusToAppStatus(s: string): CounterStatus {
  const map: Record<string, CounterStatus> = {
    'active': 'active',
    'Active': 'active',
    'inactive': 'inactive',
    'Inactive': 'inactive',
    'hold': 'hold',
    'Hold': 'hold',
    'removed': 'removed',
    'Removed': 'removed',
    'Unverified': 'hold',
    'Unconfirmed': 'hold',
  };
  return map[s] || 'active';
}

function dbRouteToAppRoute(r: any, counters: any[]): RouteData {
  const points: RoutePoint[] = counters
    .filter(c => c.route_id === r.id)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .map((c, idx) => ({
      id: c.id,
      routeId: r.id,
      orderIndex: idx + 1,
      pointType: mapDbCounterTypeToPointType(c.counter_type),
      counterId: c.terminal_id || null,
      customPointName: c.terminal_id ? null : c.name,
      haltMinutes: c.halt_minutes || 5,
      breakMinutes: c.break_minutes || 0,
      isBoardingAllowed: c.is_boarding_allowed ?? true,
      isDroppingAllowed: c.is_dropping_allowed ?? true,
      isVisibleToCustomer: c.is_visible_to_customer ?? true,
      status: (c.status === 'Active' ? 'active' : 'hold') as 'active' | 'hold',
      notes: c.notes || '',
    }));

  return {
    id: r.id,
    code: r.route_code || `${r.origin}-${r.destination}`.toUpperCase().replace(/\s/g, ''),
    name: r.route_name || `${r.origin} → ${r.destination}`,
    from: r.origin,
    to: r.destination,
    direction: r.direction || 'Outbound',
    estimatedDuration: r.duration_minutes ? `${Math.floor(r.duration_minutes / 60)}h ${r.duration_minutes % 60}m` : '',
    baseFare: r.base_fare || 0,
    status: (r.status === 'active' ? 'active' : r.status === 'inactive' ? 'hold' : r.status || 'draft') as RouteStatus,
    notes: r.notes || '',
    points,
    createdAt: r.created_at || new Date().toISOString(),
    updatedAt: r.updated_at || r.created_at || new Date().toISOString(),
  };
}

function mapDbCounterTypeToPointType(t: string): RoutePoint['pointType'] {
  const map: Record<string, RoutePoint['pointType']> = {
    'Starting Point': 'Origin Terminal',
    'Counter': 'Counter',
    'Break (20 min)': 'Break Point',
    'Last Stop': 'Destination Terminal',
  };
  return map[t] || (t as RoutePoint['pointType']) || 'Counter';
}

function mapPointTypeToDbCounterType(t: string): string {
  const map: Record<string, string> = {
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

// ── Store interface ───────────────────────────────────────────

interface CounterStoreState {
  counters: Counter[];
  routes: RouteData[];
  loading: boolean;
  error: string | null;

  // Load from Supabase
  loadCounters: () => Promise<void>;
  loadRoutes: () => Promise<void>;
  loadAll: () => Promise<void>;

  // Counter CRUD
  addCounter: (data: Omit<Counter, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCounter: (id: string, data: Partial<Counter>) => Promise<void>;
  setCounterStatus: (id: string, status: CounterStatus) => Promise<void>;
  getCounterById: (id: string) => Counter | undefined;
  getCounterUsageCount: (counterId: string) => number;

  // Route CRUD
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

  // ── Load counters from Supabase `terminals` table ──────────
  loadCounters: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('terminals')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      set({ counters: (data || []).map(dbTerminalToCounter), loading: false });
    } catch (e: any) {
      console.error('Failed to load counters:', e);
      set({ error: e.message, loading: false });
    }
  },

  // ── Load routes from Supabase `routes` + `route_counters` ──
  loadRoutes: async () => {
    set({ loading: true, error: null });
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
      set({ routes, loading: false });
    } catch (e: any) {
      console.error('Failed to load routes:', e);
      set({ error: e.message, loading: false });
    }
  },

  loadAll: async () => {
    await Promise.all([get().loadCounters(), get().loadRoutes()]);
  },

  // ── Counter CRUD ────────────────────────────────────────────
  addCounter: async (data) => {
    try {
      const dbData = counterToDbTerminal(data);
      const { error } = await supabase.from('terminals').insert(dbData);
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
      if (data.status !== undefined) updates.status = data.status === 'removed' ? 'inactive' : data.status === 'hold' ? 'inactive' : data.status;
      if (data.notes !== undefined) updates.notes = data.notes;
      if (data.mapLocation !== undefined) updates.map_location = data.mapLocation;
      if (data.type !== undefined) updates.counter_type_ext = data.type;

      const { error } = await supabase.from('terminals').update(updates).eq('id', id);
      if (error) throw error;
      await get().loadCounters();
    } catch (e: any) {
      console.error('Failed to update counter:', e);
      set({ error: e.message });
    }
  },

  setCounterStatus: async (id, status) => {
    try {
      const dbStatus = status === 'removed' ? 'inactive' : status === 'hold' ? 'inactive' : status;
      const { error } = await supabase.from('terminals').update({ status: dbStatus }).eq('id', id);
      if (error) throw error;
      await get().loadCounters();
    } catch (e: any) {
      console.error('Failed to set counter status:', e);
      set({ error: e.message });
    }
  },

  getCounterById: (id) => {
    return get().counters.find(c => c.id === id);
  },

  getCounterUsageCount: (counterId) => {
    return get().routes.reduce((count, route) => {
      return count + route.points.filter(p => p.counterId === counterId).length;
    }, 0);
  },

  // ── Route CRUD ──────────────────────────────────────────────
  addRoute: async (data) => {
    try {
      // Parse duration string to minutes
      let durationMinutes = 0;
      if (data.estimatedDuration) {
        const hMatch = data.estimatedDuration.match(/(\d+)\s*h/);
        const mMatch = data.estimatedDuration.match(/(\d+)\s*m/);
        durationMinutes = (hMatch ? parseInt(hMatch[1]) * 60 : 0) + (mMatch ? parseInt(mMatch[1]) : 0);
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
      if (!newRoute) throw new Error('No route returned after insert');

      // Insert route_counters for each point
      if (data.points && data.points.length > 0) {
        const counterRows = data.points.map((p, idx) => ({
          route_id: newRoute.id,
          name: p.customPointName || get().getCounterById(p.counterId || '')?.name || 'Unnamed',
          location: get().getCounterById(p.counterId || '')?.address || '',
          district: get().getCounterById(p.counterId || '')?.district || '',
          phone: get().getCounterById(p.counterId || '')?.phone || '',
          counter_type: mapPointTypeToDbCounterType(p.pointType) as any,
          status: (p.status === 'active' ? 'Active' : 'Unverified') as any,
          sort_order: idx + 1,
          terminal_id: p.counterId || null,
          halt_minutes: p.haltMinutes,
          break_minutes: p.breakMinutes,
          is_boarding_allowed: p.isBoardingAllowed,
          is_dropping_allowed: p.isDroppingAllowed,
          is_visible_to_customer: p.isVisibleToCustomer,
          notes: p.notes || null,
        }));

        const { error: cError } = await supabase.from('route_counters').insert(counterRows);
        if (cError) console.warn('Failed to insert route counters:', cError);
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
        const hMatch = data.estimatedDuration.match(/(\d+)\s*h/);
        const mMatch = data.estimatedDuration.match(/(\d+)\s*m/);
        updates.duration_minutes = (hMatch ? parseInt(hMatch[1]) * 60 : 0) + (mMatch ? parseInt(mMatch[1]) : 0);
      }

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase.from('routes').update(updates).eq('id', id);
        if (error) throw error;
      }

      // If points changed, replace route_counters
      if (data.points !== undefined) {
        await supabase.from('route_counters').delete().eq('route_id', id);

        if (data.points.length > 0) {
          const counterRows = data.points.map((p, idx) => ({
            route_id: id,
            name: p.customPointName || get().getCounterById(p.counterId || '')?.name || 'Unnamed',
            location: get().getCounterById(p.counterId || '')?.address || '',
            district: get().getCounterById(p.counterId || '')?.district || '',
            phone: get().getCounterById(p.counterId || '')?.phone || '',
            counter_type: mapPointTypeToDbCounterType(p.pointType) as any,
            status: (p.status === 'active' ? 'Active' : 'Unverified') as any,
            sort_order: idx + 1,
            terminal_id: p.counterId || null,
            halt_minutes: p.haltMinutes,
            break_minutes: p.breakMinutes,
            is_boarding_allowed: p.isBoardingAllowed,
            is_dropping_allowed: p.isDroppingAllowed,
            is_visible_to_customer: p.isVisibleToCustomer,
            notes: p.notes || null,
          }));

          const { error: cError } = await supabase.from('route_counters').insert(counterRows);
          if (cError) console.warn('Failed to update route counters:', cError);
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
