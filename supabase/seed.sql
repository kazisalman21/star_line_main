-- ============================================================
-- Starline Wayfinder — Seed Data
-- Run this in Supabase SQL Editor AFTER schema.sql
-- ============================================================

-- ============================================================
-- 1. ROUTES — 8 popular intercity routes
-- ============================================================
INSERT INTO routes (id, origin, destination, distance_km, duration_minutes, base_fare, status) VALUES
  (gen_random_uuid(), 'Dhaka', 'Chattogram', 264, 330, 850, 'active'),
  (gen_random_uuid(), 'Dhaka', 'Cox''s Bazar', 392, 480, 1400, 'active'),
  (gen_random_uuid(), 'Dhaka', 'Sylhet', 240, 300, 800, 'active'),
  (gen_random_uuid(), 'Dhaka', 'Rajshahi', 254, 330, 750, 'active'),
  (gen_random_uuid(), 'Dhaka', 'Khulna', 280, 360, 900, 'active'),
  (gen_random_uuid(), 'Chattogram', 'Cox''s Bazar', 152, 210, 600, 'active'),
  (gen_random_uuid(), 'Dhaka', 'Feni', 157, 210, 550, 'active'),
  (gen_random_uuid(), 'Dhaka', 'Comilla', 97, 150, 400, 'active');

-- ============================================================
-- 2. BUSES — 4 coach types with amenities
-- ============================================================
INSERT INTO buses (id, name, type, total_seats, amenities, registration_number, status) VALUES
  (gen_random_uuid(), 'Starline Platinum', 'Sleeper', 24,
   '["AC", "WiFi", "USB Charging", "Blanket", "Snacks", "Entertainment"]'::jsonb,
   'DHAKA-METRO-P01', 'active'),

  (gen_random_uuid(), 'Starline Gold', 'AC', 36,
   '["AC", "USB Charging", "Reclining Seats", "Water"]'::jsonb,
   'DHAKA-METRO-G01', 'active'),

  (gen_random_uuid(), 'Starline Silver', 'AC', 40,
   '["AC", "USB Charging", "Water"]'::jsonb,
   'DHAKA-METRO-S01', 'active'),

  (gen_random_uuid(), 'Starline Express', 'Non-AC', 44,
   '["Fan", "Water"]'::jsonb,
   'DHAKA-METRO-E01', 'active');

-- ============================================================
-- 3. SCHEDULES — assign buses to routes with departure times
-- We need to reference the IDs we just created, so use a DO block
-- ============================================================
DO $$
DECLARE
  -- Route IDs
  r_dhk_ctg UUID;
  r_dhk_cox UUID;
  r_dhk_syl UUID;
  r_dhk_raj UUID;
  r_dhk_khl UUID;
  r_ctg_cox UUID;
  r_dhk_fen UUID;
  r_dhk_com UUID;
  -- Bus IDs
  b_platinum UUID;
  b_gold UUID;
  b_silver UUID;
  b_express UUID;
BEGIN
  -- Fetch route IDs
  SELECT id INTO r_dhk_ctg FROM routes WHERE origin = 'Dhaka' AND destination = 'Chattogram' LIMIT 1;
  SELECT id INTO r_dhk_cox FROM routes WHERE origin = 'Dhaka' AND destination = 'Cox''s Bazar' LIMIT 1;
  SELECT id INTO r_dhk_syl FROM routes WHERE origin = 'Dhaka' AND destination = 'Sylhet' LIMIT 1;
  SELECT id INTO r_dhk_raj FROM routes WHERE origin = 'Dhaka' AND destination = 'Rajshahi' LIMIT 1;
  SELECT id INTO r_dhk_khl FROM routes WHERE origin = 'Dhaka' AND destination = 'Khulna' LIMIT 1;
  SELECT id INTO r_ctg_cox FROM routes WHERE origin = 'Chattogram' AND destination = 'Cox''s Bazar' LIMIT 1;
  SELECT id INTO r_dhk_fen FROM routes WHERE origin = 'Dhaka' AND destination = 'Feni' LIMIT 1;
  SELECT id INTO r_dhk_com FROM routes WHERE origin = 'Dhaka' AND destination = 'Comilla' LIMIT 1;

  -- Fetch bus IDs
  SELECT id INTO b_platinum FROM buses WHERE name = 'Starline Platinum' LIMIT 1;
  SELECT id INTO b_gold FROM buses WHERE name = 'Starline Gold' LIMIT 1;
  SELECT id INTO b_silver FROM buses WHERE name = 'Starline Silver' LIMIT 1;
  SELECT id INTO b_express FROM buses WHERE name = 'Starline Express' LIMIT 1;

  -- ============================================================
  -- Dhaka → Chattogram (most popular — 6 daily departures)
  -- ============================================================
  INSERT INTO schedules (route_id, bus_id, departure_time, arrival_time, days_of_week, status) VALUES
    (r_dhk_ctg, b_platinum, '06:00', '11:30', '{0,1,2,3,4,5,6}', 'active'),
    (r_dhk_ctg, b_gold,     '08:00', '13:30', '{0,1,2,3,4,5,6}', 'active'),
    (r_dhk_ctg, b_silver,   '10:00', '15:30', '{0,1,2,3,4,5,6}', 'active'),
    (r_dhk_ctg, b_express,  '14:00', '19:30', '{0,1,2,3,4,5,6}', 'active'),
    (r_dhk_ctg, b_platinum, '18:00', '23:30', '{0,1,2,3,4,5,6}', 'active'),
    (r_dhk_ctg, b_gold,     '22:00', '03:30', '{0,1,2,3,4,5,6}', 'active');

  -- ============================================================
  -- Dhaka → Cox's Bazar (4 departures)
  -- ============================================================
  INSERT INTO schedules (route_id, bus_id, departure_time, arrival_time, days_of_week, status) VALUES
    (r_dhk_cox, b_platinum, '07:30', '15:30', '{0,1,2,3,4,5,6}', 'active'),
    (r_dhk_cox, b_gold,     '09:30', '17:30', '{0,1,2,3,4,5,6}', 'active'),
    (r_dhk_cox, b_silver,   '20:00', '04:00', '{0,1,2,3,4,5,6}', 'active'),
    (r_dhk_cox, b_express,  '22:00', '06:00', '{0,1,2,3,4,5,6}', 'active');

  -- ============================================================
  -- Dhaka → Sylhet (4 departures)
  -- ============================================================
  INSERT INTO schedules (route_id, bus_id, departure_time, arrival_time, days_of_week, status) VALUES
    (r_dhk_syl, b_gold,     '06:00', '11:00', '{0,1,2,3,4,5,6}', 'active'),
    (r_dhk_syl, b_silver,   '08:00', '13:00', '{0,1,2,3,4,5,6}', 'active'),
    (r_dhk_syl, b_platinum, '16:00', '21:00', '{0,1,2,3,4,5,6}', 'active'),
    (r_dhk_syl, b_express,  '23:30', '04:30', '{0,1,2,3,4,5,6}', 'active');

  -- ============================================================
  -- Dhaka → Rajshahi (3 departures)
  -- ============================================================
  INSERT INTO schedules (route_id, bus_id, departure_time, arrival_time, days_of_week, status) VALUES
    (r_dhk_raj, b_gold,    '07:30', '13:00', '{0,1,2,3,4,5,6}', 'active'),
    (r_dhk_raj, b_silver,  '11:30', '17:00', '{0,1,2,3,4,5,6}', 'active'),
    (r_dhk_raj, b_express, '20:00', '01:30', '{0,1,2,3,4,5,6}', 'active');

  -- ============================================================
  -- Dhaka → Khulna (3 departures)
  -- ============================================================
  INSERT INTO schedules (route_id, bus_id, departure_time, arrival_time, days_of_week, status) VALUES
    (r_dhk_khl, b_gold,     '06:00', '12:00', '{0,1,2,3,4,5,6}', 'active'),
    (r_dhk_khl, b_silver,   '10:00', '16:00', '{0,1,2,3,4,5,6}', 'active'),
    (r_dhk_khl, b_platinum, '22:00', '04:00', '{0,1,2,3,4,5,6}', 'active');

  -- ============================================================
  -- Chattogram → Cox's Bazar (3 departures)
  -- ============================================================
  INSERT INTO schedules (route_id, bus_id, departure_time, arrival_time, days_of_week, status) VALUES
    (r_ctg_cox, b_gold,    '08:00', '11:30', '{0,1,2,3,4,5,6}', 'active'),
    (r_ctg_cox, b_silver,  '14:00', '17:30', '{0,1,2,3,4,5,6}', 'active'),
    (r_ctg_cox, b_express, '18:00', '21:30', '{0,1,2,3,4,5,6}', 'active');

  -- ============================================================
  -- Dhaka → Feni (2 departures)
  -- ============================================================
  INSERT INTO schedules (route_id, bus_id, departure_time, arrival_time, days_of_week, status) VALUES
    (r_dhk_fen, b_silver,  '09:30', '13:00', '{0,1,2,3,4,5,6}', 'active'),
    (r_dhk_fen, b_express, '16:00', '19:30', '{0,1,2,3,4,5,6}', 'active');

  -- ============================================================
  -- Dhaka → Comilla (2 departures)
  -- ============================================================
  INSERT INTO schedules (route_id, bus_id, departure_time, arrival_time, days_of_week, status) VALUES
    (r_dhk_com, b_silver,  '07:30', '10:00', '{0,1,2,3,4,5,6}', 'active'),
    (r_dhk_com, b_express, '11:30', '14:00', '{0,1,2,3,4,5,6}', 'active');

  -- ============================================================
  -- 4. SEATS — generate seats for each bus
  -- ============================================================
  -- Platinum (24 seats: rows A-F, 4 per row)
  INSERT INTO seats (bus_id, seat_number, row_label, seat_type, is_active)
  SELECT b_platinum, row_label || col::text, row_label,
    CASE WHEN row_label IN ('A', 'B') THEN 'premium' ELSE 'standard' END,
    true
  FROM unnest(ARRAY['A','B','C','D','E','F']) AS row_label,
       generate_series(1, 4) AS col;

  -- Gold (36 seats: rows A-I, 4 per row)
  INSERT INTO seats (bus_id, seat_number, row_label, seat_type, is_active)
  SELECT b_gold, row_label || col::text, row_label,
    CASE WHEN row_label IN ('A', 'B') THEN 'premium' ELSE 'standard' END,
    true
  FROM unnest(ARRAY['A','B','C','D','E','F','G','H','I']) AS row_label,
       generate_series(1, 4) AS col;

  -- Silver (40 seats: rows A-J, 4 per row)
  INSERT INTO seats (bus_id, seat_number, row_label, seat_type, is_active)
  SELECT b_silver, row_label || col::text, row_label, 'standard', true
  FROM unnest(ARRAY['A','B','C','D','E','F','G','H','I','J']) AS row_label,
       generate_series(1, 4) AS col;

  -- Express (44 seats: rows A-K, 4 per row)
  INSERT INTO seats (bus_id, seat_number, row_label, seat_type, is_active)
  SELECT b_express, row_label || col::text, row_label, 'standard', true
  FROM unnest(ARRAY['A','B','C','D','E','F','G','H','I','J','K']) AS row_label,
       generate_series(1, 4) AS col;

END $$;

-- ============================================================
-- Verify seed data
-- ============================================================
SELECT 'routes' AS table_name, COUNT(*) AS row_count FROM routes
UNION ALL
SELECT 'buses', COUNT(*) FROM buses
UNION ALL
SELECT 'schedules', COUNT(*) FROM schedules
UNION ALL
SELECT 'seats', COUNT(*) FROM seats;
