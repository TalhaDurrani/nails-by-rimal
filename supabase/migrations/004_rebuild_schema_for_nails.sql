-- COMPREHENSIVE SCHEMA REBUILD for Nails by Rimal
-- This migration rebuilds the entire database schema to support:
-- 1. Product variants (shape + length + finish combinations)
-- 2. Cash on Delivery (COD) only checkout
-- 3. Guest checkout support
-- 4. Pakistani addresses

-- DROP existing problematic tables in dependency order
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS finishes CASCADE;
DROP TABLE IF EXISTS lengths CASCADE;
DROP TABLE IF EXISTS shapes CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- ========== VARIANT LOOKUP TABLES ==========
-- These tables allow admins to manage variant options dynamically

CREATE TABLE shapes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE lengths (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE finishes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  swatch_hex VARCHAR(7),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ========== CATEGORIES ==========
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT NOT NULL,
  parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ========== PRODUCTS ==========
-- Core product table with base pricing (variants override per combination)
CREATE TABLE products (
  product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  base_price NUMERIC NOT NULL CHECK (base_price > 0),
  image VARCHAR,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ========== PRODUCT VARIANTS ==========
-- Each product can have many variants (shape × length × finish combinations)
-- Stock is tracked per variant, not per product
CREATE TABLE product_variants (
  id SERIAL PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  shape_id INTEGER NOT NULL REFERENCES shapes(id) ON DELETE RESTRICT,
  length_id INTEGER NOT NULL REFERENCES lengths(id) ON DELETE RESTRICT,
  finish_id INTEGER NOT NULL REFERENCES finishes(id) ON DELETE RESTRICT,
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  price_override NUMERIC, -- Optional: if variant costs more/less than base_price
  sku VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, shape_id, length_id, finish_id)
);

-- ========== ADDRESSES ==========
CREATE TABLE addresses (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(profile_id) ON DELETE CASCADE,
  street VARCHAR NOT NULL,
  city VARCHAR NOT NULL,
  postal_code VARCHAR,
  country VARCHAR DEFAULT 'Pakistan',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ========== ORDERS ==========
-- Support for COD (Cash on Delivery) and guest checkout
-- user_id is NULLABLE for guest orders
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(20) UNIQUE,
  user_id UUID REFERENCES profiles(profile_id) ON DELETE CASCADE,
  customer_name VARCHAR NOT NULL,
  customer_email VARCHAR,
  customer_phone VARCHAR NOT NULL,
  address_street VARCHAR NOT NULL,
  address_city VARCHAR NOT NULL,
  address_postal_code VARCHAR,
  address_province VARCHAR NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  payment_method VARCHAR DEFAULT 'cod',
  subtotal NUMERIC NOT NULL CHECK (subtotal >= 0),
  shipping_fee NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL CHECK (total >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ========== ORDER ITEMS ==========
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_variant_id INTEGER NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_at_purchase NUMERIC NOT NULL CHECK (price_at_purchase >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ========== REVIEWS ==========
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(profile_id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ========== SHOPPING CARTS ==========
CREATE TABLE carts (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(profile_id) ON DELETE CASCADE,
  status cart_status NOT NULL DEFAULT 'active',
  total_items INTEGER NOT NULL DEFAULT 0,
  total_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ========== CART ITEMS ==========
CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_variant_id INTEGER NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ========== INDEXES ==========
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_published ON products(is_published);
CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_product_variants_shape ON product_variants(shape_id);
CREATE INDEX idx_product_variants_length ON product_variants(length_id);
CREATE INDEX idx_product_variants_finish ON product_variants(finish_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);
CREATE INDEX idx_shapes_active ON shapes(is_active);
CREATE INDEX idx_lengths_active ON lengths(is_active);
CREATE INDEX idx_finishes_active ON finishes(is_active);
CREATE INDEX idx_addresses_user ON addresses(user_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_variant ON order_items(product_variant_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_carts_user ON carts(user_id);
CREATE INDEX idx_carts_status ON carts(status);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_cart_items_variant ON cart_items(product_variant_id);

-- ========== ENABLE ROW LEVEL SECURITY ==========
ALTER TABLE shapes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lengths ENABLE ROW LEVEL SECURITY;
ALTER TABLE finishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- ========== RLS POLICIES: VARIANT LOOKUP TABLES ==========
-- Public can see active shapes only
CREATE POLICY "Public views active shapes"
  ON shapes FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins manage all shapes"
  ON shapes FOR SELECT
  USING (auth.uid() IN (SELECT profile_id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Admins insert shapes"
  ON shapes FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT profile_id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Admins update shapes"
  ON shapes FOR UPDATE
  USING (auth.uid() IN (SELECT profile_id FROM profiles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT profile_id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Admins delete shapes"
  ON shapes FOR DELETE
  USING (auth.uid() IN (SELECT profile_id FROM profiles WHERE role = 'admin'));

-- Lengths (same pattern)
CREATE POLICY "Public views active lengths"
  ON lengths FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins manage all lengths"
  ON lengths FOR SELECT
  USING (auth.uid() IN (SELECT profile_id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Admins insert lengths"
  ON lengths FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT profile_id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Admins update lengths"
  ON lengths FOR UPDATE
  USING (auth.uid() IN (SELECT profile_id FROM profiles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT profile_id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Admins delete lengths"
  ON lengths FOR DELETE
  USING (auth.uid() IN (SELECT profile_id FROM profiles WHERE role = 'admin'));

-- Finishes (same pattern)
CREATE POLICY "Public views active finishes"
  ON finishes FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins manage all finishes"
  ON finishes FOR SELECT
  USING (auth.uid() IN (SELECT profile_id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Admins insert finishes"
  ON finishes FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT profile_id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Admins update finishes"
  ON finishes FOR UPDATE
  USING (auth.uid() IN (SELECT profile_id FROM profiles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT profile_id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Admins delete finishes"
  ON finishes FOR DELETE
  USING (auth.uid() IN (SELECT profile_id FROM profiles WHERE role = 'admin'));

-- ========== RLS POLICIES: PRODUCTS & VARIANTS ==========
CREATE POLICY "Everyone views published products"
  ON products FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins view all products"
  ON products FOR SELECT
  USING (auth.uid() IN (SELECT profile_id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Admins insert products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT profile_id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Admins update products"
  ON products FOR UPDATE
  USING (auth.uid() IN (SELECT profile_id FROM profiles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT profile_id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Admins delete products"
  ON products FOR DELETE
  USING (auth.uid() IN (SELECT profile_id FROM profiles WHERE role = 'admin'));

-- Product variants
CREATE POLICY "Everyone views variants for published products"
  ON product_variants FOR SELECT
  USING (product_id IN (SELECT product_id FROM products WHERE is_published = true));

CREATE POLICY "Admins view all variants"
  ON product_variants FOR SELECT
  USING (auth.uid() IN (SELECT profile_id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Admins insert variants"
  ON product_variants FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT profile_id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Admins update variants"
  ON product_variants FOR UPDATE
  USING (auth.uid() IN (SELECT profile_id FROM profiles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT profile_id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Admins delete variants"
  ON product_variants FOR DELETE
  USING (auth.uid() IN (SELECT profile_id FROM profiles WHERE role = 'admin'));

-- ========== RLS POLICIES: CATEGORIES ==========
CREATE POLICY "Everyone views categories"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Admins manage categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT profile_id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Admins update categories"
  ON categories FOR UPDATE
  USING (auth.uid() IN (SELECT profile_id FROM profiles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT profile_id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Admins delete categories"
  ON categories FOR DELETE
  USING (auth.uid() IN (SELECT profile_id FROM profiles WHERE role = 'admin'));

-- ========== RLS POLICIES: ADDRESSES ==========
CREATE POLICY "Users view own addresses"
  ON addresses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own addresses"
  ON addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own addresses"
  ON addresses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ========== RLS POLICIES: ORDERS ==========
-- Anyone can create an order (guest checkout)
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Authenticated users can view their own orders, admins can view all
CREATE POLICY "Users view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IN (SELECT profile_id FROM profiles WHERE role = 'admin'));

-- Admins can update orders
CREATE POLICY "Admins update orders"
  ON orders FOR UPDATE
  USING (auth.uid() IN (SELECT profile_id FROM profiles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT profile_id FROM profiles WHERE role = 'admin'));

-- ========== RLS POLICIES: ORDER ITEMS ==========
CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users view own order items"
  ON order_items FOR SELECT
  USING (auth.uid() = (SELECT user_id FROM orders WHERE id = order_id) OR auth.uid() IN (SELECT profile_id FROM profiles WHERE role = 'admin'));

-- ========== RLS POLICIES: REVIEWS ==========
CREATE POLICY "Everyone views reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Users insert own reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ========== RLS POLICIES: CARTS & CART ITEMS ==========
CREATE POLICY "Users view own carts"
  ON carts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users manage own carts"
  ON carts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own carts"
  ON carts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own carts"
  ON carts FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users view own cart items"
  ON cart_items FOR SELECT
  USING (auth.uid() = (SELECT user_id FROM carts WHERE id = cart_id));

CREATE POLICY "Users manage own cart items"
  ON cart_items FOR INSERT
  WITH CHECK (auth.uid() = (SELECT user_id FROM carts WHERE id = cart_id));

CREATE POLICY "Users update own cart items"
  ON cart_items FOR UPDATE
  USING (auth.uid() = (SELECT user_id FROM carts WHERE id = cart_id))
  WITH CHECK (auth.uid() = (SELECT user_id FROM carts WHERE id = cart_id));

CREATE POLICY "Users delete own cart items"
  ON cart_items FOR DELETE
  USING (auth.uid() = (SELECT user_id FROM carts WHERE id = cart_id));

-- ========== SEED INITIAL DATA ==========
-- Variant options
INSERT INTO shapes (name, is_active) VALUES
  ('Almond', true),
  ('Coffin', true),
  ('Square', true),
  ('Stiletto', true)
ON CONFLICT DO NOTHING;

INSERT INTO lengths (name, is_active) VALUES
  ('Short', true),
  ('Medium', true),
  ('Long', true)
ON CONFLICT DO NOTHING;

INSERT INTO finishes (name, swatch_hex, is_active) VALUES
  ('Blush Almond', '#FFB6C1', true),
  ('Champagne Chrome', '#F0E68C', true),
  ('Midnight Bloom', '#191970', true)
ON CONFLICT DO NOTHING;
