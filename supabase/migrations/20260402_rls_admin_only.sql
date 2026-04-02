-- ============================================================
-- BUG-10 FIX: Restrict personnel tables to admin-only access
-- Previously these had USING (true) WITH CHECK (true) which
-- allowed any authenticated user to CRUD driver/staff/supervisor data.
-- ============================================================

-- Drop overly permissive policies
DROP POLICY IF EXISTS drivers_all ON drivers;
DROP POLICY IF EXISTS staff_all ON staff;
DROP POLICY IF EXISTS supervisors_all ON supervisors;

-- Read access for all authenticated users (needed for bus detail views)
CREATE POLICY drivers_read ON drivers FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY staff_read ON staff FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY supervisors_read ON supervisors FOR SELECT
  USING (auth.role() = 'authenticated');

-- Write access restricted to admin role only
CREATE POLICY drivers_admin_write ON drivers FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY drivers_admin_update ON drivers FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY drivers_admin_delete ON drivers FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY staff_admin_write ON staff FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY staff_admin_update ON staff FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY staff_admin_delete ON staff FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY supervisors_admin_write ON supervisors FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY supervisors_admin_update ON supervisors FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY supervisors_admin_delete ON supervisors FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
