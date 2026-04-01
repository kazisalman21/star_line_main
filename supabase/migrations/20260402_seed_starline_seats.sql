-- ═══════════════════════════════════════════════════════════════
-- Seed: Starline Bus Seat Formation
-- Layout: 1 door-side seat + 9 rows of 2+2 + 1 back row of 5
-- Total: 1 + 36 + 5 = 42 seats per bus
--
-- Row A (row 0): single door-side seat [A]
-- Rows A-I (rows 1-9): 2+2 layout [X1, X2, aisle, X3, X4]
-- Row J (row 10): back row 5 seats [J1, J2, J3, J4, J5]
--
-- USAGE: Replace 'YOUR_BUS_ID' with an actual bus UUID from your buses table.
-- Run once per bus that uses this seat formation.
-- ═══════════════════════════════════════════════════════════════

-- Helper: delete existing seats for the bus first (if re-seeding)
-- DELETE FROM seats WHERE bus_id = 'YOUR_BUS_ID';

DO $$
DECLARE
  v_bus_id uuid;
  v_bus RECORD;
BEGIN
  -- Seed seats for ALL active buses that don't have seats yet
  FOR v_bus IN
    SELECT id FROM buses
    WHERE status = 'active'
    AND id NOT IN (SELECT DISTINCT bus_id FROM seats)
  LOOP
    v_bus_id := v_bus.id;

    -- Row 0: Single door-side seat "A"
    INSERT INTO seats (bus_id, seat_number, row_label, seat_type, is_active)
    VALUES (v_bus_id, 'A', '00-A', 'standard', true);

    -- Rows A through I: 2+2 layout (seats X1, X2, X3, X4)
    INSERT INTO seats (bus_id, seat_number, row_label, seat_type, is_active) VALUES
      (v_bus_id, 'A1', '01-A', 'standard', true),
      (v_bus_id, 'A2', '01-A', 'standard', true),
      (v_bus_id, 'A3', '01-A', 'ladies', true),
      (v_bus_id, 'A4', '01-A', 'ladies', true),

      (v_bus_id, 'B1', '02-B', 'standard', true),
      (v_bus_id, 'B2', '02-B', 'standard', true),
      (v_bus_id, 'B3', '02-B', 'standard', true),
      (v_bus_id, 'B4', '02-B', 'standard', true),

      (v_bus_id, 'C1', '03-C', 'standard', true),
      (v_bus_id, 'C2', '03-C', 'standard', true),
      (v_bus_id, 'C3', '03-C', 'standard', true),
      (v_bus_id, 'C4', '03-C', 'standard', true),

      (v_bus_id, 'D1', '04-D', 'standard', true),
      (v_bus_id, 'D2', '04-D', 'standard', true),
      (v_bus_id, 'D3', '04-D', 'standard', true),
      (v_bus_id, 'D4', '04-D', 'standard', true),

      (v_bus_id, 'E1', '05-E', 'standard', true),
      (v_bus_id, 'E2', '05-E', 'standard', true),
      (v_bus_id, 'E3', '05-E', 'standard', true),
      (v_bus_id, 'E4', '05-E', 'standard', true),

      (v_bus_id, 'F1', '06-F', 'standard', true),
      (v_bus_id, 'F2', '06-F', 'standard', true),
      (v_bus_id, 'F3', '06-F', 'standard', true),
      (v_bus_id, 'F4', '06-F', 'standard', true),

      (v_bus_id, 'G1', '07-G', 'standard', true),
      (v_bus_id, 'G2', '07-G', 'standard', true),
      (v_bus_id, 'G3', '07-G', 'standard', true),
      (v_bus_id, 'G4', '07-G', 'standard', true),

      (v_bus_id, 'H1', '08-H', 'standard', true),
      (v_bus_id, 'H2', '08-H', 'standard', true),
      (v_bus_id, 'H3', '08-H', 'standard', true),
      (v_bus_id, 'H4', '08-H', 'standard', true),

      (v_bus_id, 'I1', '09-I', 'standard', true),
      (v_bus_id, 'I2', '09-I', 'standard', true),
      (v_bus_id, 'I3', '09-I', 'standard', true),
      (v_bus_id, 'I4', '09-I', 'standard', true);

    -- Row J: Back row — 5 seats (no aisle)
    INSERT INTO seats (bus_id, seat_number, row_label, seat_type, is_active) VALUES
      (v_bus_id, 'J1', '10-J', 'standard', true),
      (v_bus_id, 'J2', '10-J', 'standard', true),
      (v_bus_id, 'J3', '10-J', 'standard', true),
      (v_bus_id, 'J4', '10-J', 'standard', true),
      (v_bus_id, 'J5', '10-J', 'standard', true);

    RAISE NOTICE 'Seeded 42 seats for bus %', v_bus_id;
  END LOOP;
END $$;
