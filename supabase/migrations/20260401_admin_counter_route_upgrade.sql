-- ═══════════════════════════════════════════════════════════════
-- Migration: Advanced Counter & Route Management
-- Date: 2026-04-01
-- Description: Adds extended columns for the upgraded admin 
--              Counter Management + Route Builder features.
-- ═══════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────
-- 1. TERMINALS TABLE — new columns
-- ────────────────────────────────────────────────

-- Extended type beyond just is_main_terminal boolean
-- Values: 'Main Terminal', 'Counter', 'Pickup Point', 'Drop Point', 'Break Point', 'Restaurant Point'
ALTER TABLE terminals
  ADD COLUMN IF NOT EXISTS counter_type text DEFAULT 'Counter';

-- Optional notes field
ALTER TABLE terminals
  ADD COLUMN IF NOT EXISTS notes text DEFAULT '';

-- Optional map/location text (e.g. Google Maps link or coordinates)
ALTER TABLE terminals
  ADD COLUMN IF NOT EXISTS map_location text DEFAULT '';

-- Extend status to support hold/removed (stored as text, app maps to enum)
-- Current values: 'active', 'inactive'
-- New values also supported: 'hold', 'removed'
-- We change the column type from the enum constraint to text
ALTER TABLE terminals
  DROP CONSTRAINT IF EXISTS terminals_status_check;
ALTER TABLE terminals
  ALTER COLUMN status TYPE text USING status::text;
ALTER TABLE terminals
  ADD CONSTRAINT terminals_status_check 
  CHECK (status IN ('active', 'inactive', 'hold', 'removed'));

-- Track last update
ALTER TABLE terminals
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- ────────────────────────────────────────────────
-- 2. ROUTES TABLE — new columns
-- ────────────────────────────────────────────────

-- Unique route code (e.g. 'DHK-FNI-01')
ALTER TABLE routes
  ADD COLUMN IF NOT EXISTS route_code text DEFAULT '';

-- Human-friendly route name (e.g. 'Dhaka → Feni Express')
ALTER TABLE routes
  ADD COLUMN IF NOT EXISTS route_name text DEFAULT '';

-- Direction: 'Outbound' or 'Return'
ALTER TABLE routes
  ADD COLUMN IF NOT EXISTS direction text DEFAULT 'Outbound';

-- Optional notes
ALTER TABLE routes
  ADD COLUMN IF NOT EXISTS notes text DEFAULT '';

-- Extend route status to support draft/hold/archived
ALTER TABLE routes
  DROP CONSTRAINT IF EXISTS routes_status_check;
ALTER TABLE routes
  ALTER COLUMN status TYPE text USING status::text;
ALTER TABLE routes
  ADD CONSTRAINT routes_status_check
  CHECK (status IN ('active', 'inactive', 'draft', 'hold', 'archived'));

-- Track last update
ALTER TABLE routes
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- ────────────────────────────────────────────────
-- 3. ROUTE_COUNTERS TABLE — new columns
-- ────────────────────────────────────────────────

-- Link route point to a registered terminal (nullable — custom points don't link)
ALTER TABLE route_counters
  ADD COLUMN IF NOT EXISTS terminal_id uuid REFERENCES terminals(id) ON DELETE SET NULL;

-- Custom point name for non-terminal stops (e.g. 'Highway Rest Stop')
ALTER TABLE route_counters
  ADD COLUMN IF NOT EXISTS custom_point_name text DEFAULT '';

-- How long the bus halts at this stop (minutes)
ALTER TABLE route_counters
  ADD COLUMN IF NOT EXISTS halt_minutes integer DEFAULT 5;

-- Break duration for break/restaurant stops (minutes)
ALTER TABLE route_counters
  ADD COLUMN IF NOT EXISTS break_minutes integer DEFAULT 0;

-- Boarding/dropping flags
ALTER TABLE route_counters
  ADD COLUMN IF NOT EXISTS is_boarding_allowed boolean DEFAULT true;

ALTER TABLE route_counters
  ADD COLUMN IF NOT EXISTS is_dropping_allowed boolean DEFAULT true;

-- Whether this stop is visible to customers in the booking flow
ALTER TABLE route_counters
  ADD COLUMN IF NOT EXISTS is_visible_to_customer boolean DEFAULT true;

-- Optional notes per route point
ALTER TABLE route_counters
  ADD COLUMN IF NOT EXISTS notes text DEFAULT '';

-- Extend counter_type to support more point types
ALTER TABLE route_counters
  DROP CONSTRAINT IF EXISTS route_counters_counter_type_check;
ALTER TABLE route_counters
  ALTER COLUMN counter_type TYPE text USING counter_type::text;
ALTER TABLE route_counters
  ADD CONSTRAINT route_counters_counter_type_check
  CHECK (counter_type IN (
    'Starting Point', 'Counter', 'Break (20 min)', 'Last Stop',
    'Origin Terminal', 'Destination Terminal', 'Pickup Point',
    'Drop Point', 'Intermediate Stop', 'Break Point', 'Restaurant Break'
  ));

-- Extend status
ALTER TABLE route_counters
  DROP CONSTRAINT IF EXISTS route_counters_status_check;
ALTER TABLE route_counters
  ALTER COLUMN status TYPE text USING status::text;
ALTER TABLE route_counters
  ADD CONSTRAINT route_counters_status_check
  CHECK (status IN ('Active', 'Unverified', 'Unconfirmed', 'Hold', 'Inactive'));

-- Track last update
ALTER TABLE route_counters
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- ────────────────────────────────────────────────
-- 4. Auto-update updated_at triggers
-- ────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Terminals
DROP TRIGGER IF EXISTS update_terminals_updated_at ON terminals;
CREATE TRIGGER update_terminals_updated_at
  BEFORE UPDATE ON terminals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Routes
DROP TRIGGER IF EXISTS update_routes_updated_at ON routes;
CREATE TRIGGER update_routes_updated_at
  BEFORE UPDATE ON routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Route Counters
DROP TRIGGER IF EXISTS update_route_counters_updated_at ON route_counters;
CREATE TRIGGER update_route_counters_updated_at
  BEFORE UPDATE ON route_counters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ────────────────────────────────────────────────
-- 5. Backfill existing data
-- ────────────────────────────────────────────────

-- Set route_code from origin-destination for existing routes
UPDATE routes
SET route_code = UPPER(REPLACE(origin, ' ', '') || '-' || REPLACE(destination, ' ', ''))
WHERE route_code = '' OR route_code IS NULL;

-- Set route_name from origin → destination
UPDATE routes
SET route_name = origin || ' → ' || destination
WHERE route_name = '' OR route_name IS NULL;

-- Set terminal counter_type based on is_main_terminal
UPDATE terminals
SET counter_type = CASE 
  WHEN is_main_terminal = true THEN 'Main Terminal'
  ELSE 'Counter'
END
WHERE counter_type = 'Counter' OR counter_type IS NULL;
