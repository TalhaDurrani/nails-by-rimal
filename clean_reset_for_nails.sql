-- COMPLETE CLEAN RESET FOR NAILS BY RIMAL
-- This will wipe EVERYTHING and start fresh with only nail products

-- ========== STEP 1: WIPE ALL DATA ==========
DELETE FROM cart_items;
DELETE FROM order_items;  
DELETE FROM orders;
DELETE FROM reviews;
DELETE FROM product_variants;
DELETE FROM products;
DELETE FROM categories;
DELETE FROM carts;

-- Reset auto-increment sequences
SELECT setval('categories_id_seq', 1, false);

-- ========== STEP 2: CREATE NAIL CATEGORIES ==========
INSERT INTO categories (name, description, parent_id) VALUES
  ('Press-On Nails', 'Handcrafted press-on nail sets', NULL),
  ('Nail Accessories', 'Tools and accessories for nails', NULL),
  ('Gift Sets', 'Nail gift packages and combos', NULL),
  ('Seasonal Collections', 'Limited edition seasonal designs', NULL);

-- ========== STEP 3: ADD NAIL PRODUCTS ==========
INSERT INTO products (
  title, 
  description, 
  base_price, 
  image,
  category_id,
  is_featured,
  is_new,
  is_published
) VALUES
  -- Press-On Nails
  (
    'Classic Nude Press-On Set',
    'Elegant nude press-on nails perfect for everyday wear',
    1999,
    'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500',
    1,
    true,
    false,
    true
  ),
  (
    'French Manicure Set',
    'Timeless French manicure design with modern twist',
    2299,
    'https://images.unsplash.com/photo-1610992015732-2449ec28227b?w=500',
    1,
    true,
    false,
    true
  ),
  (
    'Luxury Bridal Collection',
    'Premium press-on nails for your special day',
    4500,
    'https://images.unsplash.com/photo-1583847411156-40fcf838ba90?w=500',
    1,
    true,
    true,
    true
  ),
  (
    'Galaxy Design Set',
    'Stunning galaxy-inspired nail art with holographic elements',
    3499,
    'https://images.unsplash.com/photo-1562887284-8a6ea0f7c58b?w=500',
    1,
    false,
    false,
    true
  ),
  (
    'Marble Pattern Set',
    'Sophisticated marble patterns in various colors',
    2999,
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500',
    1,
    false,
    false,
    true
  ),
  
  -- Gift Sets
  (
    'Complete Starter Kit',
    'Everything you need: 3 nail sets + tools + guide',
    6999,
    'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500',
    3,
    true,
    false,
    true
  ),
  (
    'Monthly Subscription Box',
    'Curated monthly nail sets delivered to your door',
    4999,
    'https://images.unsplash.com/photo-1610992015732-2449ec28227b?w=500',
    3,
    false,
    false,
    true
  ),
  
  -- Accessories
  (
    'Professional Application Kit',
    'Complete tools: file, pusher, glue, prep pads',
    899,
    'https://images.unsplash.com/photo-1588476822726-6ee2fb5dd7fd?w=500',
    2,
    false,
    false,
    true
  ),
  (
    'Premium Nail Glue Set',
    'Long-lasting adhesive - 3 tubes plus remover',
    599,
    'https://images.unsplash.com/photo-1583847411156-40fcf838ba90?w=500',
    2,
    false,
    false,
    true
  ),
  
  -- Seasonal
  (
    'Winter Wonderland Set',
    'Festive winter designs with snowflakes',
    2799,
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500',
    4,
    false,
    true,
    true
  ),
  (
    'Summer Sunset Set', 
    'Vibrant summer colors with tropical gradients',
    2599,
    'https://images.unsplash.com/photo-1611095973362-6ca3c5b06e3c?w=500',
    4,
    false,
    false,
    true
  ),
  (
    'Eid Special Collection',
    'Elegant designs perfect for Eid celebrations',
    3299,
    'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500',
    4,
    false,
    true,
    true
  );

-- ========== STEP 4: CREATE VARIANTS ==========
-- Only for nail sets (category 1 and 4), not accessories or gift sets
INSERT INTO product_variants (
  product_id,
  shape_id,
  length_id,
  finish_id,
  stock_quantity,
  price_override,
  sku
) 
SELECT 
  p.product_id,
  s.id as shape_id,
  l.id as length_id,
  f.id as finish_id,
  CASE 
    WHEN p.base_price > 3000 THEN 8   -- Premium = less stock
    WHEN p.title LIKE '%Classic%' OR p.title LIKE '%French%' THEN 25  -- Popular = more stock
    ELSE 15  -- Regular stock
  END as stock_quantity,
  CASE 
    WHEN l.name = 'Long' AND p.base_price < 3000 THEN p.base_price + 500  -- Long nails cost extra
    WHEN s.name = 'Stiletto' AND p.base_price > 2500 THEN p.base_price + 300  -- Stiletto premium
    ELSE NULL
  END as price_override,
  'NBR-' || UPPER(LEFT(REPLACE(p.title, ' ', ''), 3)) || '-' || UPPER(LEFT(s.name, 3)) || '-' || UPPER(LEFT(l.name, 3)) as sku
FROM products p
CROSS JOIN shapes s
CROSS JOIN lengths l  
CROSS JOIN finishes f
WHERE p.category_id IN (1, 4)  -- Only Press-On Nails and Seasonal
  AND s.is_active = true
  AND l.is_active = true
  AND f.is_active = true;

-- ========== VERIFICATION ==========
SELECT 'CATEGORIES:' as section, COUNT(*) as count FROM categories
UNION ALL
SELECT 'PRODUCTS:', COUNT(*) FROM products WHERE is_published = true
UNION ALL  
SELECT 'VARIANTS:', COUNT(*) FROM product_variants;

-- Show final result
SELECT 
  c.name as category,
  COUNT(p.product_id) as products
FROM categories c
LEFT JOIN products p ON c.id = p.category_id AND p.is_published = true
GROUP BY c.id, c.name
ORDER BY c.id;