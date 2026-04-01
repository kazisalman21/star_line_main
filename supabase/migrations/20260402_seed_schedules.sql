-- ================================================================
-- Seed Starline Schedules
-- Creates multiple daily schedules linking buses to routes
-- Run this in Supabase SQL Editor after routes + buses exist
-- ================================================================

-- Helper: create a schedule only if route + bus exist and no duplicate exists
-- Each schedule has: route_id, bus_id, departure_time, arrival_time, days_of_week, status

DO $$
DECLARE
  v_route RECORD;
  v_bus   RECORD;
  bus_count INT;
  schedule_count INT := 0;
BEGIN
  -- For each active route, assign buses at staggered departure times
  FOR v_route IN
    SELECT id, origin, destination, duration_minutes, base_fare
    FROM routes
    WHERE status = 'active'
    ORDER BY origin, destination
  LOOP
    bus_count := 0;

    FOR v_bus IN
      SELECT id, name, type, total_seats
      FROM buses
      WHERE status = 'active'
      ORDER BY name
    LOOP
      -- Skip if this exact combo already exists
      IF NOT EXISTS (
        SELECT 1 FROM schedules
        WHERE route_id = v_route.id AND bus_id = v_bus.id
      ) THEN
        -- Assign different departure times based on bus index
        -- Morning departures: 06:00, 07:30, 09:00, 10:30
        -- Afternoon: 12:00, 14:00, 15:30
        -- Evening/Night: 18:00, 20:00, 21:30, 22:00, 23:00

        DECLARE
          dep_times TEXT[] := ARRAY[
            '06:00', '07:30', '09:00', '10:30', '12:00',
            '14:00', '15:30', '18:00', '20:00', '21:30',
            '22:00', '23:00'
          ];
          dep_time TEXT;
          arr_time TEXT;
          dep_interval INTERVAL;
          arr_interval INTERVAL;
        BEGIN
          -- Pick departure time based on bus position (cycling through the array)
          dep_time := dep_times[1 + (bus_count % array_length(dep_times, 1))];
          
          -- Calculate arrival time from departure + route duration
          dep_interval := dep_time::INTERVAL;
          arr_interval := dep_interval + (v_route.duration_minutes || ' minutes')::INTERVAL;
          arr_time := TO_CHAR(arr_interval, 'HH24:MI');

          INSERT INTO schedules (route_id, bus_id, departure_time, arrival_time, days_of_week, status)
          VALUES (
            v_route.id,
            v_bus.id,
            dep_time::TIME,
            arr_time::TIME,
            ARRAY[0,1,2,3,4,5,6],  -- runs every day of the week
            'active'
          );

          schedule_count := schedule_count + 1;
        END;
      END IF;

      bus_count := bus_count + 1;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Created % new schedules', schedule_count;
END $$;

-- Verify results
SELECT 
  s.id,
  r.origin || ' → ' || r.destination AS route,
  b.name AS bus,
  b.type,
  s.departure_time,
  s.arrival_time,
  s.days_of_week,
  s.status
FROM schedules s
JOIN routes r ON r.id = s.route_id
JOIN buses b ON b.id = s.bus_id
ORDER BY r.origin, r.destination, s.departure_time;
