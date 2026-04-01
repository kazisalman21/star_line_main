-- ═══════════════════════════════════════════════════════════════
-- Migration: Create personnel tables (drivers, staff, supervisors)
-- ═══════════════════════════════════════════════════════════════

-- 1. Drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  photo_url text DEFAULT '',
  license text DEFAULT '',
  experience text DEFAULT '',
  rating numeric(3,1) DEFAULT 0,
  trips integer DEFAULT 0,
  status text NOT NULL DEFAULT 'off-duty' CHECK (status IN ('on-duty', 'off-duty', 'on-leave')),
  assigned_bus text DEFAULT 'Unassigned',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Staff table
CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  photo_url text DEFAULT '',
  experience text DEFAULT '',
  rating numeric(3,1) DEFAULT 0,
  trips integer DEFAULT 0,
  status text NOT NULL DEFAULT 'off-duty' CHECK (status IN ('on-duty', 'off-duty', 'on-leave')),
  assigned_bus text DEFAULT 'Unassigned',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Supervisors table
CREATE TABLE IF NOT EXISTS supervisors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  photo_url text DEFAULT '',
  experience text DEFAULT '',
  rating numeric(3,1) DEFAULT 0,
  trips integer DEFAULT 0,
  status text NOT NULL DEFAULT 'off-duty' CHECK (status IN ('on-duty', 'off-duty', 'on-leave')),
  assigned_bus text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Auto-update triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_drivers_updated_at') THEN
    CREATE TRIGGER trg_drivers_updated_at BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_staff_updated_at') THEN
    CREATE TRIGGER trg_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_supervisors_updated_at') THEN
    CREATE TRIGGER trg_supervisors_updated_at BEFORE UPDATE ON supervisors FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

-- 5. Add assignment columns to buses table
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'buses' AND column_name = 'assigned_driver_id') THEN
    ALTER TABLE buses ADD COLUMN assigned_driver_id uuid REFERENCES drivers(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'buses' AND column_name = 'assigned_staff_id') THEN
    ALTER TABLE buses ADD COLUMN assigned_staff_id uuid REFERENCES staff(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'buses' AND column_name = 'assigned_supervisor_id') THEN
    ALTER TABLE buses ADD COLUMN assigned_supervisor_id uuid REFERENCES supervisors(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'buses' AND column_name = 'fuel_type') THEN
    ALTER TABLE buses ADD COLUMN fuel_type text DEFAULT 'Diesel';
  END IF;
END $$;

-- 6. Enable RLS (but allow all for admin)
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE supervisors ENABLE ROW LEVEL SECURITY;

-- Policies: allow all for authenticated users (admin-only pages)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'drivers_all' AND tablename = 'drivers') THEN
    CREATE POLICY drivers_all ON drivers FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'staff_all' AND tablename = 'staff') THEN
    CREATE POLICY staff_all ON staff FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'supervisors_all' AND tablename = 'supervisors') THEN
    CREATE POLICY supervisors_all ON supervisors FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 7. Seed initial data
INSERT INTO drivers (name, phone, license, experience, rating, trips, status, assigned_bus) VALUES
  ('Karim Uddin', '01712000001', 'DM-2024-001234', '12 years', 4.8, 2340, 'on-duty', 'Platinum-01'),
  ('Rafiq Hossain', '01712000002', 'DM-2023-005678', '8 years', 4.6, 1560, 'on-duty', 'Gold-03'),
  ('Alam Sheikh', '01712000003', 'DM-2022-009012', '15 years', 4.9, 3100, 'off-duty', 'Silver-05'),
  ('Hasan Ali', '01712000004', 'DM-2025-003456', '5 years', 4.5, 890, 'on-duty', 'Gold-02'),
  ('Jamal Mia', '01712000005', 'DM-2021-007890', '18 years', 4.7, 4200, 'on-leave', 'Platinum-04'),
  ('Belal Hossain', '01712000006', 'DM-2024-002345', '6 years', 4.4, 720, 'on-duty', 'Silver-11')
ON CONFLICT DO NOTHING;

INSERT INTO staff (name, phone, experience, rating, trips, status, assigned_bus) VALUES
  ('Arif Rahman', '01812000001', '5 years', 4.5, 1200, 'on-duty', 'Platinum-01'),
  ('Sabbir Hasan', '01812000002', '3 years', 4.3, 900, 'on-duty', 'Gold-03'),
  ('Jubayer Ali', '01812000003', '7 years', 4.6, 2100, 'off-duty', 'Silver-05'),
  ('Ripon Das', '01812000004', '4 years', 4.4, 800, 'on-duty', 'Gold-02'),
  ('Sohel Rana', '01812000005', '6 years', 4.7, 1800, 'on-duty', 'Platinum-04')
ON CONFLICT DO NOTHING;

INSERT INTO supervisors (name, phone, experience, rating, trips, status) VALUES
  ('Md. Nasir', '01912000001', '20 years', 4.9, 5000, 'on-duty'),
  ('Tariq Uddin', '01912000002', '15 years', 4.8, 4200, 'on-duty'),
  ('Shahidul Islam', '01912000003', '10 years', 4.6, 3000, 'off-duty')
ON CONFLICT DO NOTHING;
