-- Seed Categories
INSERT INTO categories (name, description, parent_id) VALUES
  ('Electronics', 'Electronic devices and accessories', NULL),
  ('Clothing', 'Apparel and fashion items', NULL),
  ('Accessories', 'Accessories and add-ons', NULL),
  ('Smartphones', 'Mobile phones and devices', 1),
  ('Laptops', 'Computers and laptops', 1),
  ('Headphones', 'Audio equipment', 1),
  ('Men Clothing', 'Mens apparel', 2),
  ('Women Clothing', 'Womens apparel', 2)
ON CONFLICT DO NOTHING;

-- Seed Sample Products
INSERT INTO products (product_id, title, description, price, stock, sku, category_id, created_at, updated_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'Wireless Headphones', 'High-quality wireless headphones with noise cancellation', 79.99, 50, 'WH-001', 6, now(), now()),
  ('550e8400-e29b-41d4-a716-446655440002'::uuid, 'USB-C Cable', 'Durable USB-C charging cable (2 pack)', 12.99, 200, 'USBC-002', 3, now(), now()),
  ('550e8400-e29b-41d4-a716-446655440003'::uuid, 'Phone Stand', 'Adjustable phone stand for desk', 19.99, 100, 'PS-003', 3, now(), now()),
  ('550e8400-e29b-41d4-a716-446655440004'::uuid, 'Screen Protector', 'Tempered glass screen protector', 9.99, 300, 'SP-004', 3, now(), now()),
  ('550e8400-e29b-41d4-a716-446655440005'::uuid, 'Phone Case', 'Protective phone case (multiple colors)', 24.99, 150, 'PC-005', 3, now(), now()),
  ('550e8400-e29b-41d4-a716-446655440006'::uuid, 'Laptop Stand', 'Ergonomic laptop stand for desk', 39.99, 75, 'LS-006', 3, now(), now()),
  ('550e8400-e29b-41d4-a716-446655440007'::uuid, 'Wireless Mouse', 'Ergonomic wireless mouse with USB receiver', 34.99, 80, 'WM-007', 3, now(), now()),
  ('550e8400-e29b-41d4-a716-446655440008'::uuid, 'Mechanical Keyboard', 'RGB mechanical keyboard for gaming', 99.99, 40, 'MK-008', 3, now(), now()),
  ('550e8400-e29b-41d4-a716-446655440009'::uuid, 'Cotton T-Shirt', 'Comfortable 100% cotton t-shirt', 19.99, 200, 'CT-009', 7, now(), now()),
  ('550e8400-e29b-41d4-a716-446655440010'::uuid, 'Denim Jeans', 'Classic blue denim jeans', 49.99, 120, 'DJ-010', 7, now(), now())
ON CONFLICT (product_id) DO NOTHING;

-- Note: You can add an admin user manually in the Supabase dashboard:
-- 1. Go to Authentication > Users
-- 2. Create a new user or note an existing user's ID
-- 3. Run this query to make them admin (replace with real user_id):
-- UPDATE profiles SET role = 'admin' WHERE profile_id = 'YOUR_USER_ID_HERE';
