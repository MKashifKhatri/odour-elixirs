-- =============================================================
-- Supabase SQL Schema for Ecommerce App
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- =============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== ENUMS ====================
CREATE TYPE order_status AS ENUM ('pending', 'shipped', 'delivered');
CREATE TYPE payment_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'AUTHORIZED', 'CAPTURED');
CREATE TYPE payment_method AS ENUM ('CASHFREE', 'RAZORPAY');

-- ==================== PROFILES TABLE ====================
-- This extends the auth.users table (Supabase Auth handles password, email, etc.)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  is_admin BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  verify_code TEXT,
  verify_code_expiry TIMESTAMPTZ,
  forgot_password_token TEXT,
  forgot_password_token_expiry TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, verify_code, verify_code_expiry)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'verify_code', ''),
    COALESCE(
      (NEW.raw_user_meta_data->>'verify_code_expiry')::TIMESTAMPTZ,
      NOW() + INTERVAL '7 days'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = pg_catalog.now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = '';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==================== CATEGORIES TABLE ====================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  slug TEXT NOT NULL,
  featured BOOLEAN DEFAULT FALSE,
  image TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==================== PRODUCTS TABLE ====================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  description TEXT NOT NULL,
  featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  image TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  slug TEXT NOT NULL,
  size TEXT,
  fabric TEXT,
  color TEXT[] DEFAULT '{}',
  weight TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==================== ORDERS TABLE ====================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  products JSONB NOT NULL DEFAULT '[]',
  shipping_info JSONB NOT NULL DEFAULT '{}',
  total NUMERIC(10,2) DEFAULT 0,
  status order_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'PENDING',
  payment_method payment_method DEFAULT 'RAZORPAY',
  transaction_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==================== PAYMENTS TABLE ====================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  razorpay_payment_id TEXT NOT NULL,
  razorpay_order_id TEXT NOT NULL,
  razorpay_signature TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status payment_status DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==================== ADDRESSES TABLE ====================
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  address TEXT,
  phone_number TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  zip_code TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_addresses_updated_at
  BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==================== BRANDS TABLE ====================
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  slug TEXT UNIQUE,
  description TEXT,
  image TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==================== ROW LEVEL SECURITY ====================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own, admins can read all
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Service role full access on profiles" ON profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Categories: Public read, admin write
CREATE POLICY "Anyone can view categories" ON categories
  FOR SELECT USING (true);
CREATE POLICY "Service role full access on categories" ON categories
  FOR ALL USING (auth.role() = 'service_role');

-- Products: Public read, admin write
CREATE POLICY "Anyone can view products" ON products
  FOR SELECT USING (true);
CREATE POLICY "Service role full access on products" ON products
  FOR ALL USING (auth.role() = 'service_role');

-- Orders: Users can read their own
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role full access on orders" ON orders
  FOR ALL USING (auth.role() = 'service_role');

-- Payments: Users see payments for their orders
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = payments.order_id AND orders.user_id = auth.uid()
    )
  );
CREATE POLICY "Service role full access on payments" ON payments
  FOR ALL USING (auth.role() = 'service_role');

-- Addresses: Users can manage their own
CREATE POLICY "Users can view own addresses" ON addresses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own addresses" ON addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own addresses" ON addresses
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own addresses" ON addresses
  FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Service role full access on addresses" ON addresses
  FOR ALL USING (auth.role() = 'service_role');

-- Brands: Public read
CREATE POLICY "Anyone can view brands" ON brands
  FOR SELECT USING (true);
CREATE POLICY "Service role full access on brands" ON brands
  FOR ALL USING (auth.role() = 'service_role');

-- ==================== INDEXES ====================
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_brands_slug ON brands(slug);

CREATE UNIQUE INDEX payments_razorpay_payment_id_key ON payments (razorpay_payment_id);
CREATE INDEX orders_user_created_at_idx ON orders (user_id, created_at DESC);
CREATE INDEX orders_transaction_id_idx ON orders (transaction_id);
