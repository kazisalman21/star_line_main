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
