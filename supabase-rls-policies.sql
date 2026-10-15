-- =============================================================
-- Supabase RLS Policies for Ecommerce App
-- Role-Based Access Control: Admin vs Regular User
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- =============================================================
-- 
-- ROLES:
--   ADMIN  (is_admin = true)  → Full access to all tables
--   USER   (authenticated)    → Limited access (own data + public reads)
--   ANON   (not logged in)    → Read-only on public data (products, categories, brands)
-- =============================================================


-- ==================== HELPER FUNCTION ====================
-- Returns TRUE if the current authenticated user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = TRUE
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- ==================== DROP ALL EXISTING POLICIES ====================
-- Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Service role full access on profiles" ON profiles;

-- Categories
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
DROP POLICY IF EXISTS "Service role full access on categories" ON categories;

-- Products
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Service role full access on products" ON products;

-- Orders
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Service role full access on orders" ON orders;

-- Payments
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Service role full access on payments" ON payments;

-- Addresses
DROP POLICY IF EXISTS "Users can view own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can insert own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can update own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can delete own addresses" ON addresses;
DROP POLICY IF EXISTS "Service role full access on addresses" ON addresses;

-- Brands
DROP POLICY IF EXISTS "Anyone can view brands" ON brands;
DROP POLICY IF EXISTS "Service role full access on brands" ON brands;


-- =============================================================
--                    PROFILES TABLE
-- =============================================================
-- Admin: Can SELECT all profiles (see all users)
-- Admin: Can UPDATE any profile (promote/demote, verify users)
-- Admin: Can DELETE any profile
-- User:  Can SELECT own profile only
-- User:  Can UPDATE own profile only (name, email, etc.)
-- =============================================================

-- SELECT
CREATE POLICY "admin_select_all_profiles" ON profiles
  FOR SELECT
  USING (
    public.is_admin()          -- Admin sees ALL users
    OR auth.uid() = id         -- User sees ONLY their own profile
  );

-- UPDATE
CREATE POLICY "admin_update_all_profiles" ON profiles
  FOR UPDATE
  USING (
    public.is_admin()          -- Admin can update any profile
    OR auth.uid() = id         -- User can update only their own
  )
  WITH CHECK (
    public.is_admin()
    OR auth.uid() = id
  );

-- INSERT (handled by trigger on auth.users, but keep service_role open)
CREATE POLICY "service_role_insert_profiles" ON profiles
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- DELETE (admin only)
CREATE POLICY "admin_delete_profiles" ON profiles
  FOR DELETE
  USING (public.is_admin());

-- Service role bypass (for server-side operations like signup trigger)
CREATE POLICY "service_role_all_profiles" ON profiles
  FOR ALL
  USING (auth.role() = 'service_role');


-- =============================================================
--                   CATEGORIES TABLE
-- =============================================================
-- Admin: Full CRUD (create, read, update, delete categories)
-- User:  SELECT only (browse categories)
-- Anon:  SELECT only (browse categories)
-- =============================================================

-- SELECT (public — anyone can browse categories)
CREATE POLICY "anyone_select_categories" ON categories
  FOR SELECT
  USING (true);

-- INSERT (admin only)
CREATE POLICY "admin_insert_categories" ON categories
  FOR INSERT
  WITH CHECK (public.is_admin());

-- UPDATE (admin only)
CREATE POLICY "admin_update_categories" ON categories
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- DELETE (admin only)
CREATE POLICY "admin_delete_categories" ON categories
  FOR DELETE
  USING (public.is_admin());

-- Service role bypass
CREATE POLICY "service_role_all_categories" ON categories
  FOR ALL
  USING (auth.role() = 'service_role');


-- =============================================================
--                    PRODUCTS TABLE
-- =============================================================
-- Admin: Full CRUD (add, edit, remove products)
-- User:  SELECT only (view active products)
-- Anon:  SELECT only (view active products)
-- =============================================================

-- SELECT (public — anyone can view active products; admin sees all including inactive)
CREATE POLICY "anyone_select_products" ON products
  FOR SELECT
  USING (
    is_active = true           -- Public/User sees only active products
    OR public.is_admin()       -- Admin sees ALL products (active + inactive)
  );

-- INSERT (admin only)
CREATE POLICY "admin_insert_products" ON products
  FOR INSERT
  WITH CHECK (public.is_admin());

-- UPDATE (admin only — edit price, stock, status, etc.)
CREATE POLICY "admin_update_products" ON products
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- DELETE (admin only)
CREATE POLICY "admin_delete_products" ON products
  FOR DELETE
  USING (public.is_admin());

-- Service role bypass
CREATE POLICY "service_role_all_products" ON products
  FOR ALL
  USING (auth.role() = 'service_role');


-- =============================================================
--                     ORDERS TABLE
-- =============================================================
-- Admin: SELECT all orders (view all customer orders)
-- Admin: UPDATE any order (change status: pending → shipped → delivered)
-- User:  SELECT own orders only
-- User:  INSERT own orders only (place an order)
-- =============================================================

-- SELECT
CREATE POLICY "select_orders" ON orders
  FOR SELECT
  USING (
    public.is_admin()          -- Admin sees ALL orders
    OR auth.uid() = user_id    -- User sees only their own orders
  );

-- INSERT (authenticated users can place orders for themselves)
CREATE POLICY "user_insert_orders" ON orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE (admin can update order status; user cannot modify orders)
CREATE POLICY "admin_update_orders" ON orders
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- DELETE (admin only — cancel/remove orders)
CREATE POLICY "admin_delete_orders" ON orders
  FOR DELETE
  USING (public.is_admin());

-- Service role bypass
CREATE POLICY "service_role_all_orders" ON orders
  FOR ALL
  USING (auth.role() = 'service_role');


-- =============================================================
--                    PAYMENTS TABLE
-- =============================================================
-- Admin: SELECT all payments (view all transactions)
-- Admin: UPDATE payment status
-- User:  SELECT payments linked to their own orders only
-- User:  INSERT payments for their own orders only
-- =============================================================

-- SELECT
CREATE POLICY "select_payments" ON payments
  FOR SELECT
  USING (
    public.is_admin()          -- Admin sees ALL transactions
    OR EXISTS (                 -- User sees only payments for their orders
      SELECT 1 FROM orders
      WHERE orders.id = payments.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- INSERT (user can create payment record for their own order)
CREATE POLICY "user_insert_payments" ON payments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = payments.order_id
        AND orders.user_id = auth.uid()
    )
    OR public.is_admin()
  );

-- UPDATE (admin only — mark payment as captured/failed/etc.)
CREATE POLICY "admin_update_payments" ON payments
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- DELETE (admin only)
CREATE POLICY "admin_delete_payments" ON payments
  FOR DELETE
  USING (public.is_admin());

-- Service role bypass
CREATE POLICY "service_role_all_payments" ON payments
  FOR ALL
  USING (auth.role() = 'service_role');


-- =============================================================
--                    ADDRESSES TABLE
-- =============================================================
-- Admin: SELECT all addresses (for order fulfillment/support)
-- User:  Full CRUD on own addresses only
-- =============================================================

-- SELECT
CREATE POLICY "select_addresses" ON addresses
  FOR SELECT
  USING (
    public.is_admin()          -- Admin sees all addresses
    OR auth.uid() = user_id    -- User sees only their own
  );

-- INSERT (user creates their own address)
CREATE POLICY "user_insert_addresses" ON addresses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE (user updates their own address)
CREATE POLICY "user_update_addresses" ON addresses
  FOR UPDATE
  USING (
    auth.uid() = user_id
    OR public.is_admin()
  )
  WITH CHECK (
    auth.uid() = user_id
    OR public.is_admin()
  );

-- DELETE (user deletes their own address; admin can also delete)
CREATE POLICY "delete_addresses" ON addresses
  FOR DELETE
  USING (
    auth.uid() = user_id
    OR public.is_admin()
  );

-- Service role bypass
CREATE POLICY "service_role_all_addresses" ON addresses
  FOR ALL
  USING (auth.role() = 'service_role');


-- =============================================================
--                     BRANDS TABLE
-- =============================================================
-- Admin: Full CRUD (manage brands)
-- User:  SELECT only (view brands)
-- Anon:  SELECT only (view brands)
-- =============================================================

-- SELECT (public)
CREATE POLICY "anyone_select_brands" ON brands
  FOR SELECT
  USING (true);

-- INSERT (admin only)
CREATE POLICY "admin_insert_brands" ON brands
  FOR INSERT
  WITH CHECK (public.is_admin());

-- UPDATE (admin only)
CREATE POLICY "admin_update_brands" ON brands
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- DELETE (admin only)
CREATE POLICY "admin_delete_brands" ON brands
  FOR DELETE
  USING (public.is_admin());

-- Service role bypass
CREATE POLICY "service_role_all_brands" ON brands
  FOR ALL
  USING (auth.role() = 'service_role');


-- =============================================================
--              SUMMARY OF ACCESS MATRIX
-- =============================================================
--
-- ┌────────────────┬──────────────────────────────────────────────────────────┬────────────────────────────────────────────────┐
-- │   TABLE        │              ADMIN (is_admin=true)                      │              USER (authenticated)               │
-- ├────────────────┼──────────────────────────────────────────────────────────┼────────────────────────────────────────────────┤
-- │ profiles       │ SELECT all, UPDATE all, DELETE any                      │ SELECT own, UPDATE own                         │
-- │ categories     │ SELECT, INSERT, UPDATE, DELETE                          │ SELECT only                                    │
-- │ products       │ SELECT all (active+inactive), INSERT, UPDATE, DELETE    │ SELECT active only                             │
-- │ orders         │ SELECT all, UPDATE status, DELETE                       │ SELECT own, INSERT own                         │
-- │ payments       │ SELECT all, INSERT, UPDATE, DELETE                      │ SELECT own, INSERT own                         │
-- │ addresses      │ SELECT all, UPDATE any, DELETE any                      │ SELECT own, INSERT own, UPDATE own, DELETE own │
-- │ brands         │ SELECT, INSERT, UPDATE, DELETE                          │ SELECT only                                    │
-- └────────────────┴──────────────────────────────────────────────────────────┴────────────────────────────────────────────────┘
--
-- ANON (not logged in): Can SELECT categories, products (active), brands only.
-- SERVICE_ROLE: Full bypass on all tables (for server-side API routes).
-- =============================================================
