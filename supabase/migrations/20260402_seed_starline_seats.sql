-- ═══════════════════════════════════════════════════════════════
-- Seed: Starline Bus Seat Formations
-- 
-- Supports 3 configurations based on bus total_seats:
--   36 seats → A1-A4 through I1-I4 (9 rows × 4)
--   40 seats → A1-A4 through J1-J4 (10 rows × 4)
--   41 seats → A1-A4 through J1-J4 + J5 (10 rows × 4 + 1 back)
--
-- All rows: 2+2 layout [X1, X2, aisle, X3, X4]
-- Back row (41 only): 5 seats [J1, J2, J3, J4, J5]
--
-- Run after buses table has data. Safe to re-run (skips buses
-- that already have seats).
-- ═══════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_bus RECORD;
  v_row_labels text[] := ARRAY['A','B','C','D','E','F','G','H','I','J'];
  v_row_count int;
  v_has_back_5 boolean;
  i int;
  v_label text;
  v_row_prefix text;
BEGIN
  FOR v_bus IN
    SELECT id, total_seats FROM buses
    WHERE status = 'active'
    AND id NOT IN (SELECT DISTINCT bus_id FROM seats)
  LOOP

    -- Determine config from total_seats
    IF v_bus.total_seats = 36 THEN
      v_row_count := 9;   -- A through I
      v_has_back_5 := false;
    ELSIF v_bus.total_seats = 40 THEN
      v_row_count := 10;  -- A through J
      v_has_back_5 := false;
    ELSIF v_bus.total_seats = 41 THEN
      v_row_count := 10;  -- A through J, with J5
      v_has_back_5 := true;
    ELSE
      -- Default: treat as 40-seat
      v_row_count := 10;
      v_has_back_5 := false;
    END IF;

    -- Insert 2+2 rows
    FOR i IN 1..v_row_count LOOP
      v_label := v_row_labels[i];
      -- Zero-padded prefix for proper sort order: 01-A, 02-B, etc.
      v_row_prefix := lpad(i::text, 2, '0') || '-' || v_label;

      -- For the last row of a 41-seat bus, insert 5 seats
      IF i = v_row_count AND v_has_back_5 THEN
        INSERT INTO seats (bus_id, seat_number, row_label, seat_type, is_active) VALUES
          (v_bus.id, v_label || '1', v_row_prefix, 'standard', true),
          (v_bus.id, v_label || '2', v_row_prefix, 'standard', true),
          (v_bus.id, v_label || '3', v_row_prefix, 'standard', true),
          (v_bus.id, v_label || '4', v_row_prefix, 'standard', true),
          (v_bus.id, v_label || '5', v_row_prefix, 'standard', true);
      ELSE
        -- Standard 2+2 row (4 seats)
        INSERT INTO seats (bus_id, seat_number, row_label, seat_type, is_active) VALUES
          (v_bus.id, v_label || '1', v_row_prefix, 'standard', true),
          (v_bus.id, v_label || '2', v_row_prefix, 'standard', true),
          (v_bus.id, v_label || '3', v_row_prefix, 'standard', true),
          (v_bus.id, v_label || '4', v_row_prefix, 'standard', true);
      END IF;
    END LOOP;

    RAISE NOTICE 'Seeded % seats for bus %', v_bus.total_seats, v_bus.id;
  END LOOP;
END $$;
