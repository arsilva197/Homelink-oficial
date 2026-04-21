-- ═══════════════════════════════════════════════════════════════
--  HomeLink — Migration 002: Row Level Security (RLS)
--
--  Roles used via JWT claim  auth.jwt() ->> 'app_role':
--    'admin'   → full access
--    'broker'  → own listings + opportunities where broker_id matches
--    'agency'  → own listings + opportunities where agency_id matches
--    'usuario' → own listings + interests
--
--  Demo / anon access:
--    Rows with user_id IS NULL are treated as demo data.
--    The anon role can read + write demo rows (user_id IS NULL).
--    In production, remove the anon policies and require auth.
-- ═══════════════════════════════════════════════════════════════

-- ── Enable RLS on every table ─────────────────────────────────
ALTER TABLE properties    ENABLE ROW LEVEL SECURITY;
ALTER TABLE interests     ENABLE ROW LEVEL SECURITY;
ALTER TABLE chains        ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions   ENABLE ROW LEVEL SECURITY;

-- ── Helper: is the current user an admin? ─────────────────────
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
  SELECT COALESCE(auth.jwt() ->> 'app_role', '') = 'admin'
$$;

-- ── Helper: is the current user a broker? ─────────────────────
CREATE OR REPLACE FUNCTION is_broker()
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
  SELECT COALESCE(auth.jwt() ->> 'app_role', '') = 'broker'
$$;

-- ═══════════════════════════════════════════════════════════════
--  PROPERTIES
-- ═══════════════════════════════════════════════════════════════

-- 1. Public marketplace: anyone (including anon) reads approved+active
CREATE POLICY "marketplace_public_read"
  ON properties FOR SELECT
  USING (status = 'ativo' AND approval_status = 'approved');

-- 2. Authenticated users read their own properties (all statuses)
CREATE POLICY "owner_read_own_properties"
  ON properties FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 3. Admin reads everything
CREATE POLICY "admin_read_all_properties"
  ON properties FOR SELECT
  TO authenticated
  USING (is_admin());

-- 4. Owner inserts their own properties
CREATE POLICY "owner_insert_property"
  ON properties FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 5. Owner updates their own properties
CREATE POLICY "owner_update_property"
  ON properties FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 6. Admin updates any property (approval, status changes, etc.)
CREATE POLICY "admin_update_any_property"
  ON properties FOR UPDATE
  TO authenticated
  USING (is_admin());

-- 7. Owner hard-deletes their own cancelled properties
CREATE POLICY "owner_delete_property"
  ON properties FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() AND status = 'cancelado');

-- ── DEMO: anon role works with rows that have no owner (user_id IS NULL)
CREATE POLICY "demo_anon_read_all"
  ON properties FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "demo_anon_insert"
  ON properties FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

CREATE POLICY "demo_anon_update"
  ON properties FOR UPDATE
  TO anon
  USING (user_id IS NULL);

-- ═══════════════════════════════════════════════════════════════
--  INTERESTS
-- ═══════════════════════════════════════════════════════════════

-- 1. Owner reads own interests
CREATE POLICY "owner_read_own_interests"
  ON interests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 2. Admin reads all interests
CREATE POLICY "admin_read_all_interests"
  ON interests FOR SELECT
  TO authenticated
  USING (is_admin());

-- 3. Owner inserts
CREATE POLICY "owner_insert_interest"
  ON interests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 4. Owner updates
CREATE POLICY "owner_update_interest"
  ON interests FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 5. Admin updates any (sourcing_status changes)
CREATE POLICY "admin_update_any_interest"
  ON interests FOR UPDATE
  TO authenticated
  USING (is_admin());

-- 6. Owner deletes (soft delete via status preferred)
CREATE POLICY "owner_delete_interest"
  ON interests FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() AND status = 'CANCELADO');

-- ── DEMO
CREATE POLICY "demo_anon_read_interests"  ON interests FOR SELECT TO anon USING (true);
CREATE POLICY "demo_anon_insert_interest" ON interests FOR INSERT TO anon WITH CHECK (user_id IS NULL);
CREATE POLICY "demo_anon_update_interest" ON interests FOR UPDATE TO anon USING (user_id IS NULL);

-- ═══════════════════════════════════════════════════════════════
--  CHAINS
-- ═══════════════════════════════════════════════════════════════

-- All authenticated users can read chains (needed for opportunity detail)
CREATE POLICY "auth_read_chains"
  ON chains FOR SELECT
  TO authenticated
  USING (true);

-- Only admin creates/modifies chains
CREATE POLICY "admin_all_chains"
  ON chains FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- DEMO
CREATE POLICY "demo_anon_read_chains"  ON chains FOR SELECT TO anon USING (true);
CREATE POLICY "demo_anon_write_chains" ON chains FOR ALL   TO anon WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════
--  OPPORTUNITIES
-- ═══════════════════════════════════════════════════════════════

-- All authenticated users can read opportunities (needed for pipeline)
CREATE POLICY "auth_read_opportunities"
  ON opportunities FOR SELECT
  TO authenticated
  USING (true);

-- Broker reads their own opportunities
CREATE POLICY "broker_read_own_opps"
  ON opportunities FOR SELECT
  TO authenticated
  USING (
    is_broker()
    AND broker_id = COALESCE(auth.jwt() ->> 'broker_id', '')
  );

-- Admin full access
CREATE POLICY "admin_all_opportunities"
  ON opportunities FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- DEMO
CREATE POLICY "demo_anon_read_opps"  ON opportunities FOR SELECT TO anon USING (true);
CREATE POLICY "demo_anon_write_opps" ON opportunities FOR ALL   TO anon WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════
--  COMMISSIONS
-- ═══════════════════════════════════════════════════════════════

-- All authenticated users can read commissions
CREATE POLICY "auth_read_commissions"
  ON commissions FOR SELECT
  TO authenticated
  USING (true);

-- Admin full access
CREATE POLICY "admin_all_commissions"
  ON commissions FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- DEMO
CREATE POLICY "demo_anon_read_comms"  ON commissions FOR SELECT TO anon USING (true);
CREATE POLICY "demo_anon_write_comms" ON commissions FOR ALL   TO anon WITH CHECK (true);
