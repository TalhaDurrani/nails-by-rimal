-- COMPLETELY CLEAN APP - NO PRODUCTS
-- Just clean structure ready for your new design

-- ========== WIPE ALL DATA ==========
DELETE FROM cart_items;
DELETE FROM order_items;  
DELETE FROM orders;
DELETE FROM reviews;
DELETE FROM product_variants;
DELETE FROM products;
DELETE FROM categories;
DELETE FROM carts;

-- Reset sequences
SELECT setval('categories_id_seq', 1, false);

-- ========== CREATE BASIC NAIL CATEGORIES (EMPTY) ==========
INSERT INTO categories (name, description, parent_id) VALUES
  ('Press-On Nails', 'Handcrafted press-on nail sets', NULL),
  ('Nail Accessories', 'Tools and accessories for nails', NULL),
  ('Gift Sets', 'Nail gift packages and combos', NULL),
  ('Seasonal Collections', 'Limited edition seasonal designs', NULL);

-- ========== VERIFICATION ==========
SELECT 'Database is now completely clean!' as status;
SELECT 'Categories created:', COUNT(*) as count FROM categories;
SELECT 'Products:', COUNT(*) as count FROM products;
SELECT 'Ready for your new design!' as message;