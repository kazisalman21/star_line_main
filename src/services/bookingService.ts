import { supabase } from '@/lib/supabase';
import type { Booking, Seat, Schedule, Route, Bus } from '@/types/database';

// ============================================================
// Types
// ============================================================

export interface SeatInfo {
  id: string;
  seatNumber: string;
  rowLabel: string;
  seatType: 'standard' | 'premium' | 'ladies';
  isBooked: boolean;
}

export interface BookingDetails {
  id: string;
  status: string;
  travelDate: string;
  totalFare: number;
  passengerName: string;
  passengerPhone: string;
  passengerEmail: string | null;
  boardingPoint: string;
  droppingPoint: string;
  createdAt: string;
  route: { origin: string; destination: string; distanceKm: number; durationMinutes: number };
  schedule: { departureTime: string; arrivalTime: string };
  bus: { name: string; type: string; amenities: string[] };
  seats: { seatNumber: string; fare: number }[];
  payment: { method: string; status: string; paidAt: string | null } | null;
}

export interface UserBooking {
  id: string;
  bookingId: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  from: string;
  to: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  coachName: string;
  coachType: string;
  seats: string[];
  totalFare: number;
  boardingPoint: string;
  droppingPoint: string;
}

export interface CreateBookingParams {
  userId: string;
  scheduleId: string;
  travelDate: string;
  seatIds: string[];
  boarding: string;
  dropping: string;
  totalFare: number;
  passengerName: string;
  passengerPhone: string;
  passengerEmail?: string;
}

// ============================================================
// Helper — map bus name to coach type label
// ============================================================
function mapBusType(busName: string): string {
  if (busName.includes('Platinum')) return 'AC Sleeper';
  if (busName.includes('Gold')) return 'AC Business';
  if (busName.includes('Silver')) return 'AC Economy';
  return 'Non-AC';
}

// ============================================================
// 1. getSeatAvailability — real-time seat status for a schedule + date
// ============================================================
export async function getSeatAvailability(
  scheduleId: string,
  date: string
): Promise<{ seats: SeatInfo[]; bookedSeatIds: Set<string> }> {
  try {
    // Get bus_id from the schedule
    const { data: schedule, error: schedErr } = await supabase
      .from('schedules')
      .select('bus_id')
      .eq('id', scheduleId)
      .single();

    if (schedErr || !schedule) {
      console.error('Error fetching schedule:', schedErr);
      return { seats: [], bookedSeatIds: new Set() };
    }

    // Get all active seats for this bus
    const { data: seats, error: seatsErr } = await supabase
      .from('seats')
      .select('*')
      .eq('bus_id', schedule.bus_id)
      .eq('is_active', true)
      .order('row_label')
      .order('seat_number');

    if (seatsErr || !seats) {
      console.error('Error fetching seats:', seatsErr);
      return { seats: [], bookedSeatIds: new Set() };
    }

    // Get booked seat IDs for this schedule + date
    const { data: bookings } = await supabase
      .from('bookings')
      .select('id')
      .eq('schedule_id', scheduleId)
      .eq('travel_date', date)
      .in('status', ['pending', 'confirmed']);

    const bookingIds = bookings?.map((b: { id: string }) => b.id) || [];
    const bookedSeatIds = new Set<string>();

    if (bookingIds.length > 0) {
      const { data: bookedSeats } = await supabase
        .from('booking_seats')
        .select('seat_id')
        .in('booking_id', bookingIds);

      bookedSeats?.forEach((bs: { seat_id: string }) => bookedSeatIds.add(bs.seat_id));
    }

    const seatInfos: SeatInfo[] = (seats as Seat[]).map(s => ({
      id: s.id,
      seatNumber: s.seat_number,
      rowLabel: s.row_label,
      seatType: s.seat_type,
      isBooked: bookedSeatIds.has(s.id),
    }));

    return { seats: seatInfos, bookedSeatIds };
  } catch (err) {
    console.error('Error in getSeatAvailability:', err);
    return { seats: [], bookedSeatIds: new Set() };
  }
}

// ============================================================
// 2. getScheduleDetails — schedule with route + bus info
// ============================================================
export async function getScheduleDetails(scheduleId: string) {
  try {
    const { data, error } = await supabase
      .from('schedules')
      .select(`
        *,
        routes (*),
        buses (*)
      `)
      .eq('id', scheduleId)
      .single();

    if (error || !data) {
      console.error('Error fetching schedule details:', error);
      return null;
    }

    return data as Schedule & { routes: Route; buses: Bus };
  } catch (err) {
    console.error('Error in getScheduleDetails:', err);
    return null;
  }
}

// ============================================================
// 3. createBooking — create a pending booking with seat assignments
// ============================================================
export async function createBooking(params: CreateBookingParams): Promise<string | null> {
  try {
    const {
      userId, scheduleId, travelDate, seatIds,
      boarding, dropping, totalFare,
      passengerName, passengerPhone, passengerEmail,
    } = params;

    // Insert booking
    const { data: booking, error: bookingErr } = await supabase
      .from('bookings')
      .insert({
        user_id: userId,
        schedule_id: scheduleId,
        travel_date: travelDate,
        status: 'pending',
        total_fare: totalFare,
        boarding_point: boarding,
        dropping_point: dropping,
        passenger_name: passengerName,
        passenger_phone: passengerPhone,
        passenger_email: passengerEmail || null,
      })
      .select('id')
      .single();

    if (bookingErr || !booking) {
      console.error('Error creating booking:', bookingErr);
      return null;
    }

    // Insert booking_seats
    const farePerSeat = Math.round(totalFare / seatIds.length);
    const seatRows = seatIds.map(seatId => ({
      booking_id: booking.id,
      seat_id: seatId,
      fare: farePerSeat,
    }));

    const { error: seatsErr } = await supabase
      .from('booking_seats')
      .insert(seatRows);

    if (seatsErr) {
      console.error('Error creating booking_seats:', seatsErr);
      // Rollback: delete the booking
      await supabase.from('bookings').delete().eq('id', booking.id);
      return null;
    }

    return booking.id;
  } catch (err) {
    console.error('Error in createBooking:', err);
    return null;
  }
}

// ============================================================
// 4. confirmBooking — mark booking confirmed + create payment record
// ============================================================
export async function confirmBooking(
  bookingId: string,
  paymentMethod: string
): Promise<boolean> {
  try {
    // Get booking to get total_fare
    const { data: booking, error: fetchErr } = await supabase
      .from('bookings')
      .select('total_fare')
      .eq('id', bookingId)
      .single();

    if (fetchErr || !booking) {
      console.error('Error fetching booking for confirm:', fetchErr);
      return false;
    }

    // Update booking status
    const { error: updateErr } = await supabase
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', bookingId);

    if (updateErr) {
      console.error('Error confirming booking:', updateErr);
      return false;
    }

    // Create payment record
    const { error: payErr } = await supabase
      .from('payments')
      .insert({
        booking_id: bookingId,
        amount: booking.total_fare,
        method: paymentMethod as 'bkash' | 'nagad' | 'rocket' | 'card',
        status: 'success',
        paid_at: new Date().toISOString(),
      });

    if (payErr) {
      console.error('Error creating payment:', payErr);
      // Booking is still confirmed, payment just failed to record
    }

    return true;
  } catch (err) {
    console.error('Error in confirmBooking:', err);
    return false;
  }
}

// ============================================================
// 5. getBookingDetails — full booking with all joined data
// ============================================================
export async function getBookingDetails(bookingId: string): Promise<BookingDetails | null> {
  try {
    // Fetch booking with schedule+route+bus
    const { data: booking, error: bookingErr } = await supabase
      .from('bookings')
      .select(`
        *,
        schedules (
          *,
          routes (*),
          buses (*)
        )
      `)
      .eq('id', bookingId)
      .single();

    if (bookingErr || !booking) {
      console.error('Error fetching booking details:', bookingErr);
      return null;
    }

    // Fetch booking seats with seat info
    const { data: bookingSeats } = await supabase
      .from('booking_seats')
      .select(`
        fare,
        seats (seat_number)
      `)
      .eq('booking_id', bookingId);

    // Fetch payment
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false })
      .limit(1);

    const schedule = (booking as any).schedules;
    const route = schedule?.routes;
    const bus = schedule?.buses;
    const payment = payments && payments.length > 0 ? payments[0] : null;

    return {
      id: booking.id,
      status: booking.status,
      travelDate: booking.travel_date,
      totalFare: booking.total_fare,
      passengerName: booking.passenger_name,
      passengerPhone: booking.passenger_phone,
      passengerEmail: booking.passenger_email,
      boardingPoint: booking.boarding_point,
      droppingPoint: booking.dropping_point,
      createdAt: booking.created_at,
      route: {
        origin: route?.origin || '',
        destination: route?.destination || '',
        distanceKm: route?.distance_km || 0,
        durationMinutes: route?.duration_minutes || 0,
      },
      schedule: {
        departureTime: schedule?.departure_time?.substring(0, 5) || '',
        arrivalTime: schedule?.arrival_time?.substring(0, 5) || '',
      },
      bus: {
        name: bus?.name || '',
        type: mapBusType(bus?.name || ''),
        amenities: Array.isArray(bus?.amenities) ? bus.amenities as string[] : [],
      },
      seats: (bookingSeats || []).map((bs: any) => ({
        seatNumber: bs.seats?.seat_number || '',
        fare: bs.fare,
      })),
      payment: payment ? {
        method: payment.method,
        status: payment.status,
        paidAt: payment.paid_at,
      } : null,
    };
  } catch (err) {
    console.error('Error in getBookingDetails:', err);
    return null;
  }
}

// ============================================================
// 6. getUserBookings — all bookings for a user (dashboard)
// ============================================================
export async function getUserBookings(userId: string): Promise<UserBooking[]> {
  try {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        schedules (
          departure_time,
          arrival_time,
          buses (name)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !bookings) {
      console.error('Error fetching user bookings:', error);
      return [];
    }

    // For each booking, get the route info and seat numbers
    const results: UserBooking[] = [];

    for (const b of bookings) {
      const schedule = (b as any).schedules;
      const busName = schedule?.buses?.name || 'Unknown';

      // Get route for this schedule
      const { data: schedWithRoute } = await supabase
        .from('schedules')
        .select('routes(origin, destination)')
        .eq('id', b.schedule_id)
        .single();

      const route = (schedWithRoute as any)?.routes;

      // Get seat numbers
      const { data: seatRows } = await supabase
        .from('booking_seats')
        .select('seats(seat_number)')
        .eq('booking_id', b.id);

      const seatNumbers = (seatRows || []).map((sr: any) => sr.seats?.seat_number || '');

      results.push({
        id: b.id,
        bookingId: `STR-${b.id.slice(0, 8).toUpperCase()}`,
        status: b.status as UserBooking['status'],
        from: route?.origin || '',
        to: route?.destination || '',
        date: b.travel_date,
        departureTime: schedule?.departure_time?.substring(0, 5) || '',
        arrivalTime: schedule?.arrival_time?.substring(0, 5) || '',
        coachName: busName,
        coachType: mapBusType(busName),
        seats: seatNumbers,
        totalFare: b.total_fare,
        boardingPoint: b.boarding_point,
        droppingPoint: b.dropping_point,
      });
    }

    return results;
  } catch (err) {
    console.error('Error in getUserBookings:', err);
    return [];
  }
}

// ============================================================
// 7. cancelBooking — update status to cancelled
// ============================================================
export async function cancelBooking(bookingId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    if (error) {
      console.error('Error cancelling booking:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error in cancelBooking:', err);
    return false;
  }
}
