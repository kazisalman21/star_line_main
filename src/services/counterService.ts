import { supabase } from '@/lib/supabase';

// ============================================================
// Counter Service — Terminals & Route Counters (DB-driven)
// ============================================================

export interface TerminalData {
  id: string;
  name: string;
  shortName: string;
  location: string;
  district: string;
  phone: string;
  isMainTerminal: boolean;
}

export interface CounterData {
  id: string;
  routeId: string;
  name: string;
  location: string;
  district: string;
  phone: string;
  type: string;
  status: string;
  sortOrder: number;
}

export interface RouteWithCounters {
  id: string;
  from: string;
  to: string;
  counters: CounterData[];
}

// ────────────────────────────────────────────────
// Public: get all terminals
// ────────────────────────────────────────────────
export async function getTerminals(): Promise<TerminalData[]> {
  const { data } = await supabase
    .from('terminals')
    .select('*')
    .eq('status', 'active')
    .order('sort_order', { ascending: true });

  return (data || []).map(t => ({
    id: t.id,
    name: t.name,
    shortName: t.short_name,
    location: t.location,
    district: t.district,
    phone: t.phone,
    isMainTerminal: t.is_main_terminal,
  }));
}

// ────────────────────────────────────────────────
// Public: get routes with counters
// ────────────────────────────────────────────────
export async function getRoutesWithCounters(): Promise<RouteWithCounters[]> {
  const { data: routes } = await supabase
    .from('routes')
    .select('id, origin, destination')
    .eq('status', 'active')
    .order('created_at', { ascending: true });

  if (!routes || routes.length === 0) return [];

  const routeIds = routes.map(r => r.id);
  const { data: counters } = await supabase
    .from('route_counters')
    .select('*')
    .in('route_id', routeIds)
    .order('sort_order', { ascending: true });

  const countersByRoute: Record<string, CounterData[]> = {};
  (counters || []).forEach(c => {
    if (!countersByRoute[c.route_id]) countersByRoute[c.route_id] = [];
    countersByRoute[c.route_id].push({
      id: c.id,
      routeId: c.route_id,
      name: c.name,
      location: c.location,
      district: c.district,
      phone: c.phone,
      type: c.counter_type,
      status: c.status,
      sortOrder: c.sort_order,
    });
  });

  return routes.map(r => ({
    id: r.id,
    from: r.origin,
    to: r.destination,
    counters: countersByRoute[r.id] || [],
  }));
}

// ────────────────────────────────────────────────
// Public: get counters for a specific route
// ────────────────────────────────────────────────
export async function getRouteCounters(routeId: string): Promise<CounterData[]> {
  const { data } = await supabase
    .from('route_counters')
    .select('*')
    .eq('route_id', routeId)
    .order('sort_order', { ascending: true });

  return (data || []).map(c => ({
    id: c.id,
    routeId: c.route_id,
    name: c.name,
    location: c.location,
    district: c.district,
    phone: c.phone,
    type: c.counter_type,
    status: c.status,
    sortOrder: c.sort_order,
  }));
}

// ────────────────────────────────────────────────
// Admin: CRUD Terminals
// ────────────────────────────────────────────────
export async function getAllTerminals() {
  const { data } = await supabase
    .from('terminals')
    .select('*')
    .order('sort_order', { ascending: true });
  return data || [];
}

export async function createTerminal(terminal: {
  name: string; short_name: string; location: string;
  district: string; phone: string; is_main_terminal: boolean;
  sort_order?: number;
}) {
  return supabase.from('terminals').insert(terminal).select().single();
}

export async function updateTerminal(id: string, updates: Record<string, any>) {
  return supabase.from('terminals').update(updates).eq('id', id);
}

export async function deleteTerminal(id: string) {
  return supabase.from('terminals').delete().eq('id', id);
}

// ────────────────────────────────────────────────
// Admin: CRUD Route Counters
// ────────────────────────────────────────────────
export async function getAllRouteCounters(routeId: string) {
  const { data } = await supabase
    .from('route_counters')
    .select('*')
    .eq('route_id', routeId)
    .order('sort_order', { ascending: true });
  return data || [];
}

export async function createRouteCounter(counter: {
  route_id: string; name: string; location: string;
  district: string; phone?: string;
  counter_type: 'Starting Point' | 'Counter' | 'Break (20 min)' | 'Last Stop';
  status?: 'Active' | 'Unverified' | 'Unconfirmed';
  sort_order: number;
}) {
  return supabase.from('route_counters').insert(counter).select().single();
}

export async function updateRouteCounter(id: string, updates: Record<string, any>) {
  return supabase.from('route_counters').update(updates).eq('id', id);
}

export async function deleteRouteCounter(id: string) {
  return supabase.from('route_counters').delete().eq('id', id);
}
