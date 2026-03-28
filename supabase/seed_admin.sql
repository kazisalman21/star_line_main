-- ============================================================
-- Starline Admin Dashboard — Seed Data
-- Run this in Supabase SQL Editor AFTER schema.sql
-- This populates buses, routes, and schedules from the reference
-- ============================================================

-- ============================
-- BUSES (Fleet from reference)
-- ============================
INSERT INTO buses (name, type, total_seats, registration_number, status) VALUES
  ('Starline Platinum-01', 'Sleeper', 24, 'DHAKA-METRO-P01', 'active'),
  ('Starline Gold-03',     'AC',      36, 'DHAKA-METRO-G01', 'active'),
  ('Starline Silver-05',   'AC',      40, 'DHAKA-METRO-S01', 'maintenance'),
  ('Starline Gold-02',     'AC',      36, 'DHAKA-METRO-G02', 'active'),
  ('Starline Platinum-04', 'Sleeper', 24, 'DHAKA-METRO-P04', 'active'),
  ('Starline Express-08',  'Non-AC',  44, 'DHAKA-METRO-F01', 'retired'),
  ('Starline Silver-11',   'AC',      40, 'DHAKA-METRO-S11', 'active'),
  ('Starline Gold-06',     'AC',      36, 'DHAKA-METRO-G06', 'active')
ON CONFLICT (registration_number) DO NOTHING;

-- ============================
-- ROUTES (from reference)
-- ============================
INSERT INTO routes (origin, destination, distance_km, duration_minutes, base_fare, status) VALUES
  ('Dhaka',      'Chattogram',   264, 360, 1870, 'active'),
  ('Dhaka',      'Cox''s Bazar', 393, 540, 1400, 'active'),
  ('Dhaka',      'Sylhet',       240, 300, 800,  'active'),
  ('Dhaka',      'Rajshahi',     254, 330, 750,  'active'),
  ('Dhaka',      'Feni',         156, 240, 550,  'active'),
  ('Feni',       'Chittagong',   140, 180, 600,  'active'),
  ('Feni',       'Lakshmipur',    60, 90,  250,  'active'),
  ('Chattogram', 'Cox''s Bazar', 152, 210, 600,  'active'),
  ('Feni',       'Dhaka',        156, 240, 550,  'active'),
  ('Feni',       'Cox''s Bazar', 175, 240, 650,  'active')
ON CONFLICT DO NOTHING;

-- ============================
-- SCHEDULES (assign buses to routes)
-- ============================
-- We use subqueries to reference route and bus IDs dynamically

-- Dhaka → Chattogram at 08:00 with Platinum-01
INSERT INTO schedules (route_id, bus_id, departure_time, arrival_time, days_of_week, status)
SELECT r.id, b.id, '08:00'::TIME, '14:00'::TIME, '{0,1,2,3,4,5,6}', 'active'
FROM routes r, buses b
WHERE r.origin = 'Dhaka' AND r.destination = 'Chattogram' AND b.name = 'Starline Platinum-01'
ON CONFLICT DO NOTHING;

-- Dhaka → Chattogram at 22:00 with Gold-02
INSERT INTO schedules (route_id, bus_id, departure_time, arrival_time, days_of_week, status)
SELECT r.id, b.id, '22:00'::TIME, '04:00'::TIME, '{0,1,2,3,4,5,6}', 'active'
FROM routes r, buses b
WHERE r.origin = 'Dhaka' AND r.destination = 'Chattogram' AND b.name = 'Starline Gold-02'
ON CONFLICT DO NOTHING;

-- Dhaka → Cox's Bazar at 21:00 with Gold-03
INSERT INTO schedules (route_id, bus_id, departure_time, arrival_time, days_of_week, status)
SELECT r.id, b.id, '21:00'::TIME, '06:00'::TIME, '{0,1,2,3,4,5,6}', 'active'
FROM routes r, buses b
WHERE r.origin = 'Dhaka' AND r.destination = 'Cox''s Bazar' AND b.name = 'Starline Gold-03'
ON CONFLICT DO NOTHING;

-- Dhaka → Sylhet at 07:30 with Silver-11
INSERT INTO schedules (route_id, bus_id, departure_time, arrival_time, days_of_week, status)
SELECT r.id, b.id, '07:30'::TIME, '12:30'::TIME, '{0,1,2,3,4,5,6}', 'active'
FROM routes r, buses b
WHERE r.origin = 'Dhaka' AND r.destination = 'Sylhet' AND b.name = 'Starline Silver-11'
ON CONFLICT DO NOTHING;

-- Dhaka → Feni at 10:00 with Express-08
INSERT INTO schedules (route_id, bus_id, departure_time, arrival_time, days_of_week, status)
SELECT r.id, b.id, '10:00'::TIME, '14:00'::TIME, '{0,1,2,3,4,5,6}', 'active'
FROM routes r, buses b
WHERE r.origin = 'Dhaka' AND r.destination = 'Feni' AND b.name = 'Starline Express-08'
ON CONFLICT DO NOTHING;

-- Feni → Chittagong at 09:00 with Silver-05
INSERT INTO schedules (route_id, bus_id, departure_time, arrival_time, days_of_week, status)
SELECT r.id, b.id, '09:00'::TIME, '12:00'::TIME, '{0,1,2,3,4,5,6}', 'active'
FROM routes r, buses b
WHERE r.origin = 'Feni' AND r.destination = 'Chittagong' AND b.name = 'Starline Silver-05'
ON CONFLICT DO NOTHING;

-- Feni → Lakshmipur at 14:00 with Gold-06
INSERT INTO schedules (route_id, bus_id, departure_time, arrival_time, days_of_week, status)
SELECT r.id, b.id, '14:00'::TIME, '15:30'::TIME, '{0,1,2,3,4,5,6}', 'active'
FROM routes r, buses b
WHERE r.origin = 'Feni' AND r.destination = 'Lakshmipur' AND b.name = 'Starline Gold-06'
ON CONFLICT DO NOTHING;

-- Chattogram → Cox's Bazar at 15:00 with Platinum-04
INSERT INTO schedules (route_id, bus_id, departure_time, arrival_time, days_of_week, status)
SELECT r.id, b.id, '15:00'::TIME, '18:30'::TIME, '{0,1,2,3,4,5,6}', 'active'
FROM routes r, buses b
WHERE r.origin = 'Chattogram' AND r.destination = 'Cox''s Bazar' AND b.name = 'Starline Platinum-04'
ON CONFLICT DO NOTHING;

-- Dhaka → Rajshahi at 23:00 with Gold-02
INSERT INTO schedules (route_id, bus_id, departure_time, arrival_time, days_of_week, status)
SELECT r.id, b.id, '23:00'::TIME, '04:30'::TIME, '{1,2,3,4,5}', 'active'
FROM routes r, buses b
WHERE r.origin = 'Dhaka' AND r.destination = 'Rajshahi' AND b.name = 'Starline Gold-02'
ON CONFLICT DO NOTHING;

-- Feni → Dhaka at 20:00 with Gold-06
INSERT INTO schedules (route_id, bus_id, departure_time, arrival_time, days_of_week, status)
SELECT r.id, b.id, '20:00'::TIME, '00:00'::TIME, '{0,1,2,3,4,5,6}', 'active'
FROM routes r, buses b
WHERE r.origin = 'Feni' AND r.destination = 'Dhaka' AND b.name = 'Starline Gold-06'
ON CONFLICT DO NOTHING;

-- ============================
-- TERMINALS
-- ============================
INSERT INTO terminals (name, short_name, location, district, phone, is_main_terminal, sort_order) VALUES
  ('Dhaka (Fakirapul) Terminal', 'Dhaka',       'Fakirapul, Motijheel',      'Dhaka',        '01700-000001', true,  1),
  ('Chattogram Terminal',        'Chattogram',  'Dampara, Chattogram',       'Chattogram',   '01700-000002', true,  2),
  ('Cox''s Bazar Terminal',      'Cox''s Bazar','Bus Stand, Kolatoli',       'Cox''s Bazar', '01700-000003', true,  3),
  ('Sylhet Terminal',            'Sylhet',      'Kadamtali Bus Stand',       'Sylhet',       '01700-000004', true,  4),
  ('Comilla Counter',            'Comilla',     'Kandirpar Bus Stand',       'Comilla',      '01700-000005', false, 5),
  ('Feni Counter',               'Feni',        'Feni Bus Terminal',         'Feni',         '01700-000006', false, 6),
  ('Noakhali Counter',           'Noakhali',    'Maijdee Bus Stand',         'Noakhali',     '01700-000007', false, 7),
  ('Lakshmipur Counter',         'Lakshmipur',  'Lakshmipur Bus Stand',      'Lakshmipur',   '01700-000008', false, 8),
  ('Brahmanbaria Counter',       'B.Baria',     'Brahmanbaria Bus Terminal', 'Brahmanbaria', '01700-000009', false, 9),
  ('Chandpur Counter',           'Chandpur',    'Chandpur Bus Stand',        'Chandpur',     '01700-000010', false, 10)
ON CONFLICT DO NOTHING;

-- ============================
-- ROUTE COUNTERS (Stops along routes)
-- ============================
-- Route 1: Dhaka → Chattogram
INSERT INTO route_counters (route_id, name, location, district, phone, counter_type, status, sort_order)
SELECT id, 'Dhaka (Fakirapul)', 'Fakirapul, Motijheel', 'Dhaka', '01700-000001', 'Starting Point', 'Active', 1 FROM routes WHERE origin = 'Dhaka' AND destination = 'Chattogram'
UNION ALL SELECT id, 'Dhaka (Sayedabad Bypass)', 'Sayedabad', 'Dhaka', '—', 'Counter', 'Active', 2 FROM routes WHERE origin = 'Dhaka' AND destination = 'Chattogram'
UNION ALL SELECT id, 'Daudkandi Counter', 'Daudkandi Highway', 'Comilla', '01700-100001', 'Counter', 'Active', 3 FROM routes WHERE origin = 'Dhaka' AND destination = 'Chattogram'
UNION ALL SELECT id, 'Comilla Counter', 'Kandirpar', 'Comilla', '01700-000005', 'Counter', 'Active', 4 FROM routes WHERE origin = 'Dhaka' AND destination = 'Chattogram'
UNION ALL SELECT id, 'Comilla Rest Stop', 'Comilla Highway', 'Comilla', '—', 'Break (20 min)', 'Active', 5 FROM routes WHERE origin = 'Dhaka' AND destination = 'Chattogram'
UNION ALL SELECT id, 'Feni Counter', 'Feni Bus Terminal', 'Feni', '01700-000006', 'Counter', 'Active', 6 FROM routes WHERE origin = 'Dhaka' AND destination = 'Chattogram'
UNION ALL SELECT id, 'Sitakunda Counter', 'Sitakunda Bazar', 'Chattogram', '01700-100002', 'Counter', 'Unverified', 7 FROM routes WHERE origin = 'Dhaka' AND destination = 'Chattogram'
UNION ALL SELECT id, 'Chattogram Terminal', 'Dampara', 'Chattogram', '01700-000002', 'Last Stop', 'Active', 8 FROM routes WHERE origin = 'Dhaka' AND destination = 'Chattogram';

-- Route 2: Dhaka → Cox's Bazar
INSERT INTO route_counters (route_id, name, location, district, phone, counter_type, status, sort_order)
SELECT id, 'Dhaka (Fakirapul)', 'Fakirapul, Motijheel', 'Dhaka', '01700-000001', 'Starting Point', 'Active', 1 FROM routes WHERE origin = 'Dhaka' AND destination = 'Cox''s Bazar'
UNION ALL SELECT id, 'Comilla Counter', 'Kandirpar', 'Comilla', '01700-000005', 'Counter', 'Active', 2 FROM routes WHERE origin = 'Dhaka' AND destination = 'Cox''s Bazar'
UNION ALL SELECT id, 'Feni Counter', 'Feni Bus Terminal', 'Feni', '01700-000006', 'Counter', 'Active', 3 FROM routes WHERE origin = 'Dhaka' AND destination = 'Cox''s Bazar'
UNION ALL SELECT id, 'Feni Rest Stop', 'Feni Highway', 'Feni', '—', 'Break (20 min)', 'Active', 4 FROM routes WHERE origin = 'Dhaka' AND destination = 'Cox''s Bazar'
UNION ALL SELECT id, 'Chattogram (Bypass)', 'Kaptai Road Bypass', 'Chattogram', '—', 'Counter', 'Active', 5 FROM routes WHERE origin = 'Dhaka' AND destination = 'Cox''s Bazar'
UNION ALL SELECT id, 'Dohazari Counter', 'Dohazari Bazar', 'Chattogram', '01700-100003', 'Counter', 'Unverified', 6 FROM routes WHERE origin = 'Dhaka' AND destination = 'Cox''s Bazar'
UNION ALL SELECT id, 'Chakaria Counter', 'Chakaria Bus Stand', 'Cox''s Bazar', '01700-100004', 'Counter', 'Active', 7 FROM routes WHERE origin = 'Dhaka' AND destination = 'Cox''s Bazar'
UNION ALL SELECT id, 'Cox''s Bazar Terminal', 'Kolatoli Bus Stand', 'Cox''s Bazar', '01700-000003', 'Last Stop', 'Active', 8 FROM routes WHERE origin = 'Dhaka' AND destination = 'Cox''s Bazar';

-- Route 3: Dhaka → Sylhet
INSERT INTO route_counters (route_id, name, location, district, phone, counter_type, status, sort_order)
SELECT id, 'Dhaka (Fakirapul)', 'Fakirapul, Motijheel', 'Dhaka', '01700-000001', 'Starting Point', 'Active', 1 FROM routes WHERE origin = 'Dhaka' AND destination = 'Sylhet'
UNION ALL SELECT id, 'Kanchpur Toll', 'Kanchpur Bridge', 'Narayanganj', '—', 'Counter', 'Active', 2 FROM routes WHERE origin = 'Dhaka' AND destination = 'Sylhet'
UNION ALL SELECT id, 'Brahmanbaria Counter', 'B.Baria Bus Terminal', 'Brahmanbaria', '01700-000009', 'Counter', 'Active', 3 FROM routes WHERE origin = 'Dhaka' AND destination = 'Sylhet'
UNION ALL SELECT id, 'Habiganj Rest Stop', 'Habiganj Highway', 'Habiganj', '—', 'Break (20 min)', 'Active', 4 FROM routes WHERE origin = 'Dhaka' AND destination = 'Sylhet'
UNION ALL SELECT id, 'Habiganj Counter', 'Habiganj Bus Stand', 'Habiganj', '01700-100005', 'Counter', 'Unverified', 5 FROM routes WHERE origin = 'Dhaka' AND destination = 'Sylhet'
UNION ALL SELECT id, 'Sylhet Terminal', 'Kadamtali', 'Sylhet', '01700-000004', 'Last Stop', 'Active', 6 FROM routes WHERE origin = 'Dhaka' AND destination = 'Sylhet';

-- Route 4: Chattogram → Cox's Bazar
INSERT INTO route_counters (route_id, name, location, district, phone, counter_type, status, sort_order)
SELECT id, 'Chattogram Terminal', 'Dampara', 'Chattogram', '01700-000002', 'Starting Point', 'Active', 1 FROM routes WHERE origin = 'Chattogram' AND destination = 'Cox''s Bazar'
UNION ALL SELECT id, 'Patiya Counter', 'Patiya Bazar', 'Chattogram', '01700-100006', 'Counter', 'Unconfirmed', 2 FROM routes WHERE origin = 'Chattogram' AND destination = 'Cox''s Bazar'
UNION ALL SELECT id, 'Dohazari Counter', 'Dohazari Bazar', 'Chattogram', '01700-100003', 'Counter', 'Active', 3 FROM routes WHERE origin = 'Chattogram' AND destination = 'Cox''s Bazar'
UNION ALL SELECT id, 'Chakaria Counter', 'Chakaria Bus Stand', 'Cox''s Bazar', '01700-100004', 'Counter', 'Active', 4 FROM routes WHERE origin = 'Chattogram' AND destination = 'Cox''s Bazar'
UNION ALL SELECT id, 'Cox''s Bazar Terminal', 'Kolatoli Bus Stand', 'Cox''s Bazar', '01700-000003', 'Last Stop', 'Active', 5 FROM routes WHERE origin = 'Chattogram' AND destination = 'Cox''s Bazar';

-- Route 5: Dhaka → Noakhali (Need to make sure this route exists, currently in original routes list we added some, let's insert if missing)
INSERT INTO routes (origin, destination, distance_km, duration_minutes, base_fare, status) VALUES
  ('Dhaka', 'Noakhali', 165, 270, 500, 'active'),
  ('Dhaka', 'Chandpur', 115, 210, 450, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO route_counters (route_id, name, location, district, phone, counter_type, status, sort_order)
SELECT id, 'Dhaka (Fakirapul)', 'Fakirapul, Motijheel', 'Dhaka', '01700-000001', 'Starting Point', 'Active', 1 FROM routes WHERE origin = 'Dhaka' AND destination = 'Noakhali'
UNION ALL SELECT id, 'Comilla Counter', 'Kandirpar', 'Comilla', '01700-000005', 'Counter', 'Active', 2 FROM routes WHERE origin = 'Dhaka' AND destination = 'Noakhali'
UNION ALL SELECT id, 'Laksham Counter', 'Laksham Bazar', 'Comilla', '01700-100007', 'Counter', 'Unverified', 3 FROM routes WHERE origin = 'Dhaka' AND destination = 'Noakhali'
UNION ALL SELECT id, 'Begumganj Counter', 'Begumganj Bus Stand', 'Noakhali', '01700-100008', 'Counter', 'Active', 4 FROM routes WHERE origin = 'Dhaka' AND destination = 'Noakhali'
UNION ALL SELECT id, 'Noakhali (Maijdee)', 'Maijdee Bus Stand', 'Noakhali', '01700-000007', 'Last Stop', 'Active', 5 FROM routes WHERE origin = 'Dhaka' AND destination = 'Noakhali';

-- Route 6: Dhaka → Chandpur
INSERT INTO route_counters (route_id, name, location, district, phone, counter_type, status, sort_order)
SELECT id, 'Dhaka (Fakirapul)', 'Fakirapul, Motijheel', 'Dhaka', '01700-000001', 'Starting Point', 'Active', 1 FROM routes WHERE origin = 'Dhaka' AND destination = 'Chandpur'
UNION ALL SELECT id, 'Daudkandi Counter', 'Daudkandi Highway', 'Comilla', '01700-100001', 'Counter', 'Active', 2 FROM routes WHERE origin = 'Dhaka' AND destination = 'Chandpur'
UNION ALL SELECT id, 'Chandpur', 'Chandpur Bus Stand', 'Chandpur', '01700-000010', 'Last Stop', 'Unconfirmed', 3 FROM routes WHERE origin = 'Dhaka' AND destination = 'Chandpur';
