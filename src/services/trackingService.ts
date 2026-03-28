import { supabase } from '@/lib/supabase';
import type { TripTracking } from '@/types/database';

// ============================================================
// Tracking Service — Live bus tracking via Supabase Realtime
// ============================================================

export interface TripTrackingData {
  id: string;
  scheduleId: string;
  travelDate: string;
  currentStop: string;
  nextStop: string | null;
  stopsCompleted: number;
  totalStops: number;
  progressPercent: number;
  status: TripTracking['status'];
  eta: string | null;
  lastUpdated: string;
  notes: string | null;
  // Joined data
  route?: string;
  coachName?: string;
  coachType?: string;
  departureTime?: string;
  arrivalTime?: string;
}

function mapRow(row: any): TripTrackingData {
  const schedule = row.schedules;
  const route = schedule?.routes;
  const bus = schedule?.buses;
  return {
    id: row.id,
    scheduleId: row.schedule_id,
    travelDate: row.travel_date,
    currentStop: row.current_stop,
    nextStop: row.next_stop,
    stopsCompleted: row.stops_completed,
    totalStops: row.total_stops,
    progressPercent: row.progress_percent,
    status: row.status,
    eta: row.eta,
    lastUpdated: row.last_updated,
    notes: row.notes,
    route: route ? `${route.origin} → ${route.destination}` : undefined,
    coachName: bus?.name,
    coachType: bus?.type,
    departureTime: schedule?.departure_time?.slice(0, 5),
    arrivalTime: schedule?.arrival_time?.slice(0, 5),
  };
}

// ────────────────────────────────────────────────
// Admin: get all active trips for today
// ────────────────────────────────────────────────
export async function getActiveTrips(date?: string): Promise<TripTrackingData[]> {
  const today = date || new Date().toISOString().split('T')[0];

  const { data } = await supabase
    .from('trip_tracking')
    .select(`
      *,
      schedules (
        departure_time, arrival_time,
        routes (origin, destination),
        buses (name, type)
      )
    `)
    .eq('travel_date', today)
    .order('last_updated', { ascending: false });

  return (data || []).map(mapRow);
}

// ────────────────────────────────────────────────
// Admin: create a new tracking entry for a schedule
// ────────────────────────────────────────────────
export async function createTripTracking(
  scheduleId: string,
  totalStops: number = 6
): Promise<TripTrackingData | null> {
  const { data, error } = await supabase
    .from('trip_tracking')
    .upsert({
      schedule_id: scheduleId,
      travel_date: new Date().toISOString().split('T')[0],
      status: 'scheduled',
      total_stops: totalStops,
      stops_completed: 0,
      progress_percent: 0,
      current_stop: '',
      last_updated: new Date().toISOString(),
    }, { onConflict: 'schedule_id,travel_date' })
    .select(`
      *,
      schedules (
        departure_time, arrival_time,
        routes (origin, destination),
        buses (name, type)
      )
    `)
    .single();

  if (error || !data) {
    console.error('Failed to create trip tracking:', error);
    return null;
  }

  return mapRow(data);
}

// ────────────────────────────────────────────────
// Admin: update trip status
// ────────────────────────────────────────────────
export async function updateTripStatus(
  trackingId: string,
  update: {
    current_stop?: string;
    next_stop?: string | null;
    stops_completed?: number;
    progress_percent?: number;
    status?: TripTracking['status'];
    eta?: string | null;
    notes?: string | null;
  }
): Promise<boolean> {
  const { error } = await supabase
    .from('trip_tracking')
    .update({
      ...update,
      last_updated: new Date().toISOString(),
    })
    .eq('id', trackingId);

  return !error;
}

// ────────────────────────────────────────────────
// Passenger: get trip status for a schedule + date
// ────────────────────────────────────────────────
export async function getTripStatus(
  scheduleId: string,
  date?: string
): Promise<TripTrackingData | null> {
  const today = date || new Date().toISOString().split('T')[0];

  const { data } = await supabase
    .from('trip_tracking')
    .select(`
      *,
      schedules (
        departure_time, arrival_time,
        routes (origin, destination),
        buses (name, type)
      )
    `)
    .eq('schedule_id', scheduleId)
    .eq('travel_date', today)
    .single();

  return data ? mapRow(data) : null;
}

// ────────────────────────────────────────────────
// Passenger: subscribe to real-time trip updates
// ────────────────────────────────────────────────
export function subscribeToTripUpdates(
  scheduleId: string,
  date: string,
  callback: (update: Partial<TripTrackingData>) => void
) {
  const channel = supabase
    .channel(`trip-${scheduleId}-${date}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'trip_tracking',
        filter: `schedule_id=eq.${scheduleId}`,
      },
      (payload) => {
        const row = payload.new as any;
        if (row.travel_date === date) {
          callback({
            currentStop: row.current_stop,
            nextStop: row.next_stop,
            stopsCompleted: row.stops_completed,
            progressPercent: row.progress_percent,
            status: row.status,
            eta: row.eta,
            lastUpdated: row.last_updated,
            notes: row.notes,
          });
        }
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}

// ────────────────────────────────────────────────
// Get today's schedules that don't have tracking yet
// ────────────────────────────────────────────────
export async function getSchedulesWithoutTracking() {
  const dayOfWeek = new Date().getDay();
  const today = new Date().toISOString().split('T')[0];

  const { data: schedules } = await supabase
    .from('schedules')
    .select(`
      id, departure_time, arrival_time,
      routes (origin, destination),
      buses (name, type)
    `)
    .eq('status', 'active')
    .contains('days_of_week', [dayOfWeek]);

  const { data: tracked } = await supabase
    .from('trip_tracking')
    .select('schedule_id')
    .eq('travel_date', today);

  const trackedIds = new Set((tracked || []).map(t => t.schedule_id));

  return (schedules || []).filter(s => !trackedIds.has(s.id));
}
