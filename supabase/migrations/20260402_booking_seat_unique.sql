-- ============================================================
-- BUG-03 FIX: Prevent double bookings via RPC function
-- Creates a transactional booking function that checks seat
-- availability with row-level locking before inserting.
-- ============================================================

-- 1. Helper function: check if a seat is already booked for a date
CREATE OR REPLACE FUNCTION is_seat_available(
  p_seat_id UUID,
  p_travel_date DATE
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1
    FROM booking_seats bs
    JOIN bookings b ON b.id = bs.booking_id
    WHERE bs.seat_id = p_seat_id
      AND b.travel_date = p_travel_date
      AND b.status IN ('pending', 'confirmed')
    FOR UPDATE OF bs  -- Lock the rows to prevent concurrent inserts
  );
END;
$$ LANGUAGE plpgsql;

-- 2. RPC: Atomic booking creation with seat locking
CREATE OR REPLACE FUNCTION create_booking_atomic(
  p_user_id UUID,
  p_schedule_id UUID,
  p_travel_date DATE,
  p_seat_ids UUID[],
  p_boarding_point TEXT,
  p_dropping_point TEXT,
  p_total_fare NUMERIC,
  p_passenger_name TEXT,
  p_passenger_phone TEXT,
  p_passenger_email TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_booking_id UUID;
  v_seat_id UUID;
  v_fare_per_seat NUMERIC;
  v_unavailable TEXT[];
BEGIN
  -- Check all seats are available (with row locking)
  FOREACH v_seat_id IN ARRAY p_seat_ids LOOP
    IF NOT is_seat_available(v_seat_id, p_travel_date) THEN
      v_unavailable := array_append(v_unavailable, v_seat_id::TEXT);
    END IF;
  END LOOP;

  IF array_length(v_unavailable, 1) > 0 THEN
    RAISE EXCEPTION 'Seats already booked: %', array_to_string(v_unavailable, ', ')
      USING ERRCODE = 'unique_violation';
  END IF;

  -- Create the booking
  INSERT INTO bookings (
    user_id, schedule_id, travel_date, status,
    total_fare, boarding_point, dropping_point,
    passenger_name, passenger_phone, passenger_email
  ) VALUES (
    p_user_id, p_schedule_id, p_travel_date, 'pending',
    p_total_fare, p_boarding_point, p_dropping_point,
    p_passenger_name, p_passenger_phone, p_passenger_email
  ) RETURNING id INTO v_booking_id;

  -- Insert seat assignments
  v_fare_per_seat := ROUND(p_total_fare / array_length(p_seat_ids, 1));

  FOREACH v_seat_id IN ARRAY p_seat_ids LOOP
    INSERT INTO booking_seats (booking_id, seat_id, fare)
    VALUES (v_booking_id, v_seat_id, v_fare_per_seat);
  END LOOP;

  RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION create_booking_atomic TO authenticated;
