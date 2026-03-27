import { supabase } from '@/lib/supabase';
import type { Route, Bus, Schedule } from '@/types/database';

// ============================================================
// Types — matches the existing BusResult interface from mockData
// so the UI components don't need changes
// ============================================================
export interface BusResult {
  id: string;
  scheduleId: string;
  routeId: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  coachType: string;
  coachName: string;
  amenities: string[];
  availableSeats: number;
  totalSeats: number;
  fare: number;
  boardingPoints: string[];
  droppingPoints: string[];
  date: string;
}

export interface PopularRoute {
  id: string;
  from: string;
  to: string;
  distance: string;
  duration: string;
  basePrice: number;
  popularity: number;
}

// ============================================================
// Helper — convert duration_minutes to "5h 30m" format
// ============================================================
function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m.toString().padStart(2, '0')}m` : `${h}h 00m`;
}

// ============================================================
// Helper — map bus.type to coach type label
// ============================================================
function mapBusType(bus: Bus): string {
  if (bus.name.includes('Platinum')) return 'AC Sleeper';
  if (bus.name.includes('Gold')) return 'AC Business';
  if (bus.name.includes('Silver')) return 'AC Economy';
  return 'Non-AC';
}

// ============================================================
// 1. getPopularRoutes — fetch active routes sorted by schedule count
// ============================================================
export async function getPopularRoutes(): Promise<PopularRoute[]> {
  try {
    const { data: routes, error } = await supabase
      .from('routes')
      .select('*')
      .eq('status', 'active')
      .order('base_fare', { ascending: false });

    if (error) {
      console.error('Error fetching routes:', error);
      return [];
    }

    // Count schedules per route for popularity ranking
    const { data: schedules } = await supabase
      .from('schedules')
      .select('route_id')
      .eq('status', 'active');

    const scheduleCounts: Record<string, number> = {};
    schedules?.forEach((s: { route_id: string }) => {
      scheduleCounts[s.route_id] = (scheduleCounts[s.route_id] || 0) + 1;
    });

    return (routes || []).map((r: Route) => ({
      id: r.id,
      from: r.origin,
      to: r.destination,
      distance: `${r.distance_km} km`,
      duration: formatDuration(r.duration_minutes),
      basePrice: r.base_fare,
      popularity: Math.min(100, (scheduleCounts[r.id] || 0) * 15 + 50),
    }))
    .sort((a, b) => b.popularity - a.popularity);
  } catch (err) {
    console.error('Error in getPopularRoutes:', err);
    return [];
  }
}

// ============================================================
// 2. searchTrips — find matching schedules for a route + date
// ============================================================
export async function searchTrips(
  from: string,
  to: string,
  date: string
): Promise<BusResult[]> {
  try {
    // Get the day of week (0 = Sunday, 6 = Saturday)
    const dayOfWeek = new Date(date).getDay();

    // Find matching route
    const { data: routes, error: routeError } = await supabase
      .from('routes')
      .select('*')
      .eq('origin', from)
      .eq('destination', to)
      .eq('status', 'active');

    if (routeError || !routes || routes.length === 0) {
      console.log('No routes found for', from, '→', to);
      return [];
    }

    const route = routes[0] as Route;

    // Get schedules for this route, with bus details
    const { data: schedules, error: schedError } = await supabase
      .from('schedules')
      .select(`
        *,
        buses (*)
      `)
      .eq('route_id', route.id)
      .eq('status', 'active')
      .contains('days_of_week', [dayOfWeek]);

    if (schedError || !schedules) {
      console.error('Error fetching schedules:', schedError);
      return [];
    }

    // Get booked seat counts for this date to calculate availability
    const scheduleIds = schedules.map((s: any) => s.id);
    const { data: bookings } = await supabase
      .from('bookings')
      .select('schedule_id, booking_seats(count)')
      .in('schedule_id', scheduleIds)
      .eq('travel_date', date)
      .in('status', ['pending', 'confirmed']);

    const bookedCounts: Record<string, number> = {};
    bookings?.forEach((b: any) => {
      const count = b.booking_seats?.[0]?.count || 0;
      bookedCounts[b.schedule_id] = (bookedCounts[b.schedule_id] || 0) + count;
    });

    // Transform to BusResult format
    return schedules.map((schedule: any) => {
      const bus = schedule.buses as Bus;
      const fare = schedule.fare_override || route.base_fare;
      const fareMultiplier = bus.name.includes('Platinum') ? 2.2
        : bus.name.includes('Gold') ? 1.6
        : bus.name.includes('Silver') ? 1.2
        : 1;

      const booked = bookedCounts[schedule.id] || 0;
      const available = Math.max(0, bus.total_seats - booked);

      // Parse amenities
      const amenities: string[] = Array.isArray(bus.amenities)
        ? bus.amenities as string[]
        : [];

      return {
        id: schedule.id,
        scheduleId: schedule.id,
        routeId: route.id,
        from: route.origin,
        to: route.destination,
        departureTime: schedule.departure_time.substring(0, 5), // "HH:MM"
        arrivalTime: schedule.arrival_time.substring(0, 5),
        duration: formatDuration(route.duration_minutes),
        coachType: mapBusType(bus),
        coachName: bus.name,
        amenities,
        availableSeats: available,
        totalSeats: bus.total_seats,
        fare: Math.round(fare * fareMultiplier),
        boardingPoints: [`${route.origin} Terminal`, `${route.origin} Bypass`, `${route.origin} Central`],
        droppingPoints: [`${route.destination} Terminal`, `${route.destination} Main Stand`, `${route.destination} City Center`],
        date,
      };
    }).sort((a: BusResult, b: BusResult) => a.departureTime.localeCompare(b.departureTime));
  } catch (err) {
    console.error('Error in searchTrips:', err);
    return [];
  }
}

// ============================================================
// 3. getCities — distinct origin + destination city names
// ============================================================
let citiesCache: string[] | null = null;

export async function getCities(): Promise<string[]> {
  if (citiesCache) return citiesCache;

  try {
    const { data: routes, error } = await supabase
      .from('routes')
      .select('origin, destination')
      .eq('status', 'active');

    if (error || !routes) {
      console.error('Error fetching cities:', error);
      return [];
    }

    const citySet = new Set<string>();
    routes.forEach((r: { origin: string; destination: string }) => {
      citySet.add(r.origin);
      citySet.add(r.destination);
    });

    citiesCache = Array.from(citySet).sort();
    return citiesCache;
  } catch (err) {
    console.error('Error in getCities:', err);
    return [];
  }
}

// ============================================================
// 4. getRouteDetails — single route with its schedules and buses
// ============================================================
export async function getRouteDetails(routeId: string) {
  try {
    const { data: route, error } = await supabase
      .from('routes')
      .select(`
        *,
        schedules (
          *,
          buses (*)
        )
      `)
      .eq('id', routeId)
      .single();

    if (error) {
      console.error('Error fetching route details:', error);
      return null;
    }

    return route;
  } catch (err) {
    console.error('Error in getRouteDetails:', err);
    return null;
  }
}

// ============================================================
// 5. getBusTypes — distinct bus types for fleet display
// ============================================================
export async function getBusTypes() {
  try {
    const { data: buses, error } = await supabase
      .from('buses')
      .select('*')
      .eq('status', 'active')
      .order('total_seats', { ascending: true });

    if (error || !buses) {
      console.error('Error fetching bus types:', error);
      return [];
    }

    return buses.map((bus: Bus) => ({
      name: bus.name,
      type: mapBusType(bus),
      seats: bus.total_seats,
      amenities: Array.isArray(bus.amenities) ? bus.amenities as string[] : [],
    }));
  } catch (err) {
    console.error('Error in getBusTypes:', err);
    return [];
  }
}
