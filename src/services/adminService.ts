import { supabase } from '@/lib/supabase';

// ============================================================
// Admin Service — Real-time analytics & management
// ============================================================

export interface DashboardStats {
  todayTrips: number;
  activeBookings: number;
  totalPassengers: number;
  revenue: number;
  weeklyRevenue: number;
  occupancyRate: number;
  pendingPayments: number;
  totalRoutes: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  bookings: number;
}

export interface DepartureInfo {
  id: string;
  route: string;
  time: string;
  coach: string;
  coachType: string;
  occupancy: number;
  passengers: number;
  totalSeats: number;
}

export interface RecentBooking {
  id: string;
  pnr: string;
  passengerName: string;
  route: string;
  date: string;
  fare: number;
  status: string;
  paymentStatus: string | null;
}

export interface RoutePerformance {
  route: string;
  revenue: number;
  bookings: number;
}

export interface PaymentMethodBreakdown {
  method: string;
  amount: number;
  count: number;
}

export interface FleetStatus {
  active: number;
  maintenance: number;
  retired: number;
  total: number;
}

// ────────────────────────────────────────────────
// 1. getDashboardStats
// ────────────────────────────────────────────────
export async function getDashboardStats(): Promise<DashboardStats> {
  const today = new Date().toISOString().split('T')[0];
  const dayOfWeek = new Date().getDay(); // 0=Sun, 1=Mon...
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

  // Run queries in parallel
  const [
    schedulesRes,
    activeBookingsRes,
    revenueRes,
    weeklyRevenueRes,
    pendingRes,
    routesRes,
  ] = await Promise.all([
    // Today's scheduled trips
    supabase
      .from('schedules')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')
      .contains('days_of_week', [dayOfWeek]),

    // Active bookings (confirmed, travelling today)
    supabase
      .from('bookings')
      .select('id, total_fare', { count: 'exact' })
      .eq('status', 'confirmed')
      .eq('travel_date', today),

    // Today's revenue
    supabase
      .from('payments')
      .select('amount')
      .eq('status', 'success')
      .gte('paid_at', `${today}T00:00:00`),

    // Weekly revenue
    supabase
      .from('payments')
      .select('amount')
      .eq('status', 'success')
      .gte('paid_at', `${weekAgo}T00:00:00`),

    // Pending payments
    supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),

    // Total active routes
    supabase
      .from('routes')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active'),
  ]);

  const todayRevenue = (revenueRes.data || []).reduce((sum, p) => sum + (p.amount || 0), 0);
  const weekRevenue = (weeklyRevenueRes.data || []).reduce((sum, p) => sum + (p.amount || 0), 0);
  const activeBookings = activeBookingsRes.data || [];
  const totalPassengers = activeBookings.length;

  // Occupancy: booked seats / total available seats for today
  let occupancyRate = 0;
  if (schedulesRes.count && schedulesRes.count > 0) {
    const { data: todayBookings } = await supabase
      .from('booking_seats')
      .select('id', { count: 'exact', head: true })
      .in('booking_id', activeBookings.map(b => b.id));

    const { data: buses } = await supabase
      .from('buses')
      .select('total_seats')
      .eq('status', 'active');

    const totalSeats = (buses || []).reduce((sum, b) => sum + b.total_seats, 0);
    const bookedSeats = todayBookings?.length || 0;
    occupancyRate = totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0;
  }

  return {
    todayTrips: schedulesRes.count || 0,
    activeBookings: activeBookings.length,
    totalPassengers,
    revenue: todayRevenue,
    weeklyRevenue: weekRevenue,
    occupancyRate,
    pendingPayments: pendingRes.count || 0,
    totalRoutes: routesRes.count || 0,
  };
}

// ────────────────────────────────────────────────
// 2. getRevenueChart
// ────────────────────────────────────────────────
export async function getRevenueChart(days = 7): Promise<RevenueDataPoint[]> {
  const startDate = new Date(Date.now() - days * 86400000).toISOString();

  const [paymentsRes, bookingsRes] = await Promise.all([
    supabase
      .from('payments')
      .select('amount, paid_at')
      .eq('status', 'success')
      .gte('paid_at', startDate)
      .order('paid_at', { ascending: true }),

    supabase
      .from('bookings')
      .select('id, created_at')
      .gte('created_at', startDate)
      .order('created_at', { ascending: true }),
  ]);

  // Group by date
  const dateMap: Record<string, { revenue: number; bookings: number }> = {};

  // Initialize all dates
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - (days - 1 - i) * 86400000);
    const key = d.toISOString().split('T')[0];
    dateMap[key] = { revenue: 0, bookings: 0 };
  }

  (paymentsRes.data || []).forEach(p => {
    if (p.paid_at) {
      const key = p.paid_at.split('T')[0];
      if (dateMap[key]) dateMap[key].revenue += p.amount;
    }
  });

  (bookingsRes.data || []).forEach(b => {
    const key = b.created_at.split('T')[0];
    if (dateMap[key]) dateMap[key].bookings += 1;
  });

  return Object.entries(dateMap).map(([date, data]) => ({
    date,
    ...data,
  }));
}

// ────────────────────────────────────────────────
// 3. getUpcomingDepartures
// ────────────────────────────────────────────────
export async function getUpcomingDepartures(): Promise<DepartureInfo[]> {
  const dayOfWeek = new Date().getDay();
  const today = new Date().toISOString().split('T')[0];

  const { data: schedules } = await supabase
    .from('schedules')
    .select(`
      id,
      departure_time,
      routes (origin, destination),
      buses (name, type, total_seats)
    `)
    .eq('status', 'active')
    .contains('days_of_week', [dayOfWeek])
    .order('departure_time', { ascending: true })
    .limit(10);

  if (!schedules || schedules.length === 0) return [];

  // Get booking counts per schedule for today
  const scheduleIds = schedules.map(s => s.id);
  const { data: bookings } = await supabase
    .from('bookings')
    .select('schedule_id, id')
    .in('schedule_id', scheduleIds)
    .eq('travel_date', today)
    .in('status', ['confirmed', 'pending']);

  const bookingCounts: Record<string, number> = {};
  (bookings || []).forEach(b => {
    bookingCounts[b.schedule_id] = (bookingCounts[b.schedule_id] || 0) + 1;
  });

  return schedules.map(s => {
    const route = s.routes as any;
    const bus = s.buses as any;
    const totalSeats = bus?.total_seats || 40;
    const passengers = bookingCounts[s.id] || 0;

    return {
      id: s.id,
      route: `${route?.origin || '?'} → ${route?.destination || '?'}`,
      time: s.departure_time?.slice(0, 5) || '',
      coach: bus?.name || 'Unknown',
      coachType: bus?.type || 'AC',
      occupancy: Math.round((passengers / totalSeats) * 100),
      passengers,
      totalSeats,
    };
  });
}

// ────────────────────────────────────────────────
// 4. getRecentBookings
// ────────────────────────────────────────────────
export async function getRecentBookings(limit = 10): Promise<RecentBooking[]> {
  const { data } = await supabase
    .from('bookings')
    .select(`
      id, passenger_name, travel_date, total_fare, status,
      schedules (
        routes (origin, destination)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (!data) return [];

  // Get payment statuses
  const bookingIds = data.map(b => b.id);
  const { data: payments } = await supabase
    .from('payments')
    .select('booking_id, status')
    .in('booking_id', bookingIds)
    .order('created_at', { ascending: false });

  const paymentMap: Record<string, string> = {};
  (payments || []).forEach(p => {
    if (!paymentMap[p.booking_id]) paymentMap[p.booking_id] = p.status;
  });

  return data.map(b => {
    const schedule = b.schedules as any;
    const route = schedule?.routes;

    return {
      id: b.id,
      pnr: `STR-${b.id.slice(0, 8).toUpperCase()}`,
      passengerName: b.passenger_name,
      route: `${route?.origin || '?'} → ${route?.destination || '?'}`,
      date: b.travel_date,
      fare: b.total_fare,
      status: b.status,
      paymentStatus: paymentMap[b.id] || null,
    };
  });
}

// ────────────────────────────────────────────────
// 5. getRoutePerformance
// ────────────────────────────────────────────────
export async function getRoutePerformance(): Promise<RoutePerformance[]> {
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString();

  const { data } = await supabase
    .from('bookings')
    .select(`
      total_fare,
      schedules (
        routes (origin, destination)
      )
    `)
    .in('status', ['confirmed', 'completed'])
    .gte('created_at', monthAgo);

  if (!data) return [];

  const routeMap: Record<string, { revenue: number; bookings: number }> = {};
  data.forEach(b => {
    const schedule = b.schedules as any;
    const route = schedule?.routes;
    const key = `${route?.origin || '?'} → ${route?.destination || '?'}`;
    if (!routeMap[key]) routeMap[key] = { revenue: 0, bookings: 0 };
    routeMap[key].revenue += b.total_fare;
    routeMap[key].bookings += 1;
  });

  return Object.entries(routeMap)
    .map(([route, data]) => ({ route, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);
}

// ────────────────────────────────────────────────
// 6. getFleetStatus
// ────────────────────────────────────────────────
export async function getFleetStatus(): Promise<FleetStatus> {
  const { data } = await supabase
    .from('buses')
    .select('status');

  if (!data) return { active: 0, maintenance: 0, retired: 0, total: 0 };

  const counts = { active: 0, maintenance: 0, retired: 0 };
  data.forEach(b => {
    const s = b.status as keyof typeof counts;
    if (counts[s] !== undefined) counts[s]++;
  });

  return { ...counts, total: data.length };
}

// ────────────────────────────────────────────────
// 7. getBookingTrends
// ────────────────────────────────────────────────
export async function getBookingTrends(days = 30): Promise<{ date: string; count: number }[]> {
  const startDate = new Date(Date.now() - days * 86400000).toISOString();

  const { data } = await supabase
    .from('bookings')
    .select('created_at')
    .gte('created_at', startDate)
    .order('created_at', { ascending: true });

  const dateMap: Record<string, number> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - (days - 1 - i) * 86400000);
    dateMap[d.toISOString().split('T')[0]] = 0;
  }

  (data || []).forEach(b => {
    const key = b.created_at.split('T')[0];
    if (dateMap[key] !== undefined) dateMap[key]++;
  });

  return Object.entries(dateMap).map(([date, count]) => ({ date, count }));
}

// ────────────────────────────────────────────────
// 8. getPaymentBreakdown
// ────────────────────────────────────────────────
export async function getPaymentBreakdown(): Promise<PaymentMethodBreakdown[]> {
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString();

  const { data } = await supabase
    .from('payments')
    .select('method, amount')
    .eq('status', 'success')
    .gte('paid_at', monthAgo);

  if (!data) return [];

  const methodMap: Record<string, { amount: number; count: number }> = {};
  data.forEach(p => {
    if (!methodMap[p.method]) methodMap[p.method] = { amount: 0, count: 0 };
    methodMap[p.method].amount += p.amount;
    methodMap[p.method].count += 1;
  });

  const labels: Record<string, string> = {
    bkash: 'bKash',
    nagad: 'Nagad',
    rocket: 'Rocket',
    card: 'Card',
  };

  return Object.entries(methodMap)
    .map(([method, data]) => ({
      method: labels[method] || method,
      ...data,
    }))
    .sort((a, b) => b.amount - a.amount);
}

// ────────────────────────────────────────────────
// CRUD: Routes
// ────────────────────────────────────────────────
export async function getAllRoutes() {
  const { data } = await supabase
    .from('routes')
    .select('*')
    .order('created_at', { ascending: false });
  return data || [];
}

export async function createRoute(route: { origin: string; destination: string; distance_km: number; duration_minutes: number; base_fare: number }) {
  return supabase.from('routes').insert(route).select().single();
}

export async function updateRoute(id: string, updates: Record<string, any>) {
  return supabase.from('routes').update(updates).eq('id', id);
}

export async function deleteRoute(id: string) {
  return supabase.from('routes').delete().eq('id', id);
}

// ────────────────────────────────────────────────
// CRUD: Buses
// ────────────────────────────────────────────────
export async function getAllBuses() {
  const { data } = await supabase
    .from('buses')
    .select('*')
    .order('created_at', { ascending: false });
  return data || [];
}

export async function createBus(bus: { name: string; type: string; total_seats: number; registration_number: string; amenities?: any }) {
  return supabase.from('buses').insert(bus).select().single();
}

export async function updateBus(id: string, updates: Record<string, any>) {
  return supabase.from('buses').update(updates).eq('id', id);
}

export async function deleteBus(id: string) {
  return supabase.from('buses').delete().eq('id', id);
}

// ────────────────────────────────────────────────
// CRUD: Schedules
// ────────────────────────────────────────────────
export async function getAllSchedules() {
  const { data } = await supabase
    .from('schedules')
    .select(`
      *,
      routes (origin, destination),
      buses (name, type)
    `)
    .order('departure_time', { ascending: true });
  return data || [];
}

export async function createSchedule(schedule: {
  route_id: string;
  bus_id: string;
  departure_time: string;
  arrival_time: string;
  days_of_week: number[];
  fare_override?: number;
}) {
  return supabase.from('schedules').insert(schedule).select().single();
}

export async function updateSchedule(id: string, updates: Record<string, any>) {
  return supabase.from('schedules').update(updates).eq('id', id);
}

export async function deleteSchedule(id: string) {
  return supabase.from('schedules').delete().eq('id', id);
}

// ────────────────────────────────────────────────
// Admin Bookings (with pagination)
// ────────────────────────────────────────────────
export async function getAdminBookings(options: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
} = {}) {
  const { page = 1, limit = 15, status, search } = options;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('bookings')
    .select(`
      id, passenger_name, passenger_phone, passenger_email,
      travel_date, total_fare, status, boarding_point, dropping_point, created_at,
      schedules (
        departure_time, arrival_time,
        routes (origin, destination),
        buses (name, type)
      )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.or(`passenger_name.ilike.%${search}%,id.ilike.%${search}%`);
  }

  const { data, count } = await query;
  return { bookings: data || [], total: count || 0, page, limit };
}

export async function updateBookingStatus(id: string, status: string) {
  return supabase.from('bookings').update({ status }).eq('id', id);
}
