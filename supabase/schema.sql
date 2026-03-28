-- ============================================================
-- Starline Wayfinder — Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES — extends Supabase auth.users
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'passenger' CHECK (role IN ('passenger', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 2. ROUTES — bus routes
-- ============================================================
CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  distance_km INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  base_fare INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. BUSES — fleet
-- ============================================================
CREATE TABLE buses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('AC', 'Non-AC', 'Sleeper')),
  total_seats INTEGER NOT NULL DEFAULT 41,
  amenities JSONB DEFAULT '{}',
  registration_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'retired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. SCHEDULES — bus assigned to route with times
-- ============================================================
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  bus_id UUID NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  fare_override INTEGER,
  days_of_week INTEGER[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 5. SEATS — per-bus seat layout
-- ============================================================
CREATE TABLE seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bus_id UUID NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
  seat_number TEXT NOT NULL,
  row_label TEXT NOT NULL,
  seat_type TEXT NOT NULL DEFAULT 'standard' CHECK (seat_type IN ('standard', 'premium', 'ladies')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(bus_id, seat_number)
);

-- ============================================================
-- 6. BOOKINGS — passenger bookings
-- ============================================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL DEFAULT CURRENT_DATE,
  travel_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  total_fare INTEGER NOT NULL,
  boarding_point TEXT NOT NULL,
  dropping_point TEXT NOT NULL,
  passenger_name TEXT NOT NULL,
  passenger_phone TEXT NOT NULL,
  passenger_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 7. BOOKING_SEATS — junction table
-- ============================================================
CREATE TABLE booking_seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  seat_id UUID NOT NULL REFERENCES seats(id) ON DELETE CASCADE,
  fare INTEGER NOT NULL,
  UNIQUE(booking_id, seat_id)
);

-- ============================================================
-- 8. PAYMENTS — payment records
-- ============================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('bkash', 'nagad', 'rocket', 'card')),
  transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- PROFILES: users read/update own, admins read all
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ROUTES: public read, admin write
CREATE POLICY "Anyone can view active routes"
  ON routes FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage routes"
  ON routes FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- BUSES: public read, admin write
CREATE POLICY "Anyone can view active buses"
  ON buses FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage buses"
  ON buses FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- SCHEDULES: public read, admin write
CREATE POLICY "Anyone can view schedules"
  ON schedules FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage schedules"
  ON schedules FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- SEATS: public read, admin write
CREATE POLICY "Anyone can view seats"
  ON seats FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage seats"
  ON seats FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- BOOKINGS: users read own, admins read all
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings"
  ON bookings FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update bookings"
  ON bookings FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- BOOKING_SEATS: follows booking access
CREATE POLICY "Users can view own booking seats"
  ON booking_seats FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_id AND bookings.user_id = auth.uid())
  );

CREATE POLICY "Users can create booking seats"
  ON booking_seats FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_id AND bookings.user_id = auth.uid())
  );

CREATE POLICY "Admins can view all booking seats"
  ON booking_seats FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- PAYMENTS: users read own, admins read all
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_id AND bookings.user_id = auth.uid())
  );

CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage payments"
  ON payments FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX idx_schedules_route ON schedules(route_id);
CREATE INDEX idx_schedules_bus ON schedules(bus_id);
CREATE INDEX idx_seats_bus ON seats(bus_id);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_schedule ON bookings(schedule_id);
CREATE INDEX idx_bookings_travel_date ON bookings(travel_date);
CREATE INDEX idx_booking_seats_booking ON booking_seats(booking_id);
CREATE INDEX idx_booking_seats_seat ON booking_seats(seat_id);
CREATE INDEX idx_payments_booking ON payments(booking_id);

-- ============================================================
-- 9. TRIP_TRACKING — live bus position tracking
-- ============================================================
CREATE TABLE trip_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  travel_date DATE NOT NULL DEFAULT CURRENT_DATE,
  current_stop TEXT NOT NULL DEFAULT '',
  next_stop TEXT,
  stops_completed INTEGER NOT NULL DEFAULT 0,
  total_stops INTEGER NOT NULL DEFAULT 6,
  progress_percent INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','boarding','in_transit','delayed','arrived','cancelled')),
  eta TEXT,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  UNIQUE(schedule_id, travel_date)
);

-- Enable Supabase Realtime for trip_tracking
ALTER PUBLICATION supabase_realtime ADD TABLE trip_tracking;

-- RLS for trip_tracking
ALTER TABLE trip_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view trip tracking"
  ON trip_tracking FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage trip tracking"
  ON trip_tracking FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE INDEX idx_trip_tracking_schedule ON trip_tracking(schedule_id);
CREATE INDEX idx_trip_tracking_date ON trip_tracking(travel_date);

-- ============================================================
-- 10. TERMINALS — counter locations
-- ============================================================
CREATE TABLE terminals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  location TEXT NOT NULL,
  district TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '—',
  is_main_terminal BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE terminals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view terminals"
  ON terminals FOR SELECT USING (true);

CREATE POLICY "Admins can manage terminals"
  ON terminals FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- 11. ROUTE_COUNTERS — stops along a route (ordered)
-- ============================================================
CREATE TABLE route_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  district TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '—',
  counter_type TEXT NOT NULL DEFAULT 'Counter' CHECK (counter_type IN ('Starting Point', 'Counter', 'Break (20 min)', 'Last Stop')),
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Unverified', 'Unconfirmed')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE route_counters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view route counters"
  ON route_counters FOR SELECT USING (true);

CREATE POLICY "Admins can manage route counters"
  ON route_counters FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE INDEX idx_route_counters_route ON route_counters(route_id);
