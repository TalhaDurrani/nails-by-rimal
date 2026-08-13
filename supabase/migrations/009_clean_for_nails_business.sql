-- Migration 009: Clean database for Nails by Rimal business ONLY
-- This removes all irrelevant data and creates a clean nail-focused database

-- ========== CLEAN UP OLD DATA ==========
-- Delete all existing products and related data
DELETE FROM cart_items;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM reviews;
DELETE FROM product_variants;
DELETE FROM products;
DELETE FROM categories;

-- Keep user profiles, addresses, and carts structure (but empty carts)
UPDATE carts SET total_items = 0, total_price = 0;

-- ========== CREATE NAIL CATEGORIES ==========
INSERT INTO categories (name, description, parent_id) VALUES
  ('Press-On Nails', 'Handcrafted press-on nail sets in various designs', NULL),
  ('Nail Accessories', 'Tools, glue, and accessories for nail application', NULL), 
  ('Gift Sets', 'Curated nail gift packages and combo deals', NULL),
  ('Seasonal Collections', 'Limited edition seasonal and holiday designs', NULL),
  ('Classic Styles', 'Timeless everyday nail designs', 1),
  ('Bridal Collection', 'Elegant designs for special occasions', 1),
  ('Artistic Designs', 'Creative and unique artistic nail art', 1),
  ('Application Tools', 'Professional nail application tools', 2),
  ('Care Products', 'Nail care and maintenance products', 2);

-- ========== SEED NAIL PRODUCTS ==========
-- Get category IDs for use in products
INSERT INTO products (
  title, 
  description, 
  base_price, 
  image,
  category_id,
  is_featured,
  is_new,
  is_published,
  created_at,
  updated_at
) VALUES
  -- Classic Collection
  (
    'Classic Nude Press-On Set',
    'Elegant nude press-on nails perfect for everyday wear. Professional quality with a natural finish that complements any outfit.',
    1999,
    'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500',
    (SELECT id FROM categories WHERE name = 'Classic Styles'),
    true,
    false,
    true,
    now(),
    now()
  ),
  (
    'French Manicure Press-On Set',
    'Timeless French manicure design with a modern twist. Clean white tips on a natural base for a sophisticated look.',
    2299,
    'https://images.unsplash.com/photo-1610992015732-2449ec28227b?w=500',
    (SELECT id FROM categories WHERE name = 'Classic Styles'),
    true,
    false,
    true,
    now(),
    now()
  ),
  
  -- Bridal Collection
  (
    'Luxury Bridal Collection',
    'Premium press-on nails designed for your special day. Intricate details with pearl and crystal accents.',
    4500,
    'https://images.unsplash.com/photo-1583847411156-40fcf838ba90?w=500',
    (SELECT id FROM categories WHERE name = 'Bridal Collection'),
    true,
    true,
    true,
    now(),
    now()
  ),
  (
    'Rose Gold Wedding Set',
    'Romantic rose gold themed nails with delicate floral patterns. Perfect for modern brides.',
    3999,
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500',
    (SELECT id FROM categories WHERE name = 'Bridal Collection'),
    false,
    true,
    true,
    now(),
    now()
  ),
  
  -- Artistic Collection
  (
    'Galaxy Dreamscape Set',
    'Stunning galaxy-inspired nail art with holographic elements. Each nail features unique cosmic patterns.',
    3499,
    'https://images.unsplash.com/photo-1562887284-8a6ea0f7c58b?w=500',
    (SELECT id FROM categories WHERE name = 'Artistic Designs'),
    false,
    false,
    true,
    now(),
    now()
  ),
  (
    'Marble Masterpiece Set',
    'Sophisticated marble patterns in various color combinations. Hand-painted for unique results.',
    2999,
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500',
    (SELECT id FROM categories WHERE name = 'Artistic Designs'),
    false,
    false,
    true,
    now(),
    now()
  ),
  
  -- Seasonal Collection
  (
    'Winter Wonderland Set',
    'Festive winter-themed designs with snowflakes and icy blue tones. Limited edition seasonal collection.',
    2799,
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500',
    (SELECT id FROM categories WHERE name = 'Seasonal Collections'),
    false,
    true,
    true,
    now(),
    now()
  ),
  (
    'Summer Sunset Set',
    'Vibrant summer colors with tropical sunset gradients. Perfect for vacation vibes.',
    2599,
    'https://images.unsplash.com/photo-1611095973362-6ca3c5b06e3c?w=500',
    (SELECT id FROM categories WHERE name = 'Seasonal Collections'),
    false,
    false,
    true,
    now(),
    now()
  ),
  
  -- Gift Sets
  (
    'Complete Starter Kit',
    'Everything you need to start your press-on nail journey. Includes 3 nail sets, application tools, and care guide.',
    6999,
    'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500',
    (SELECT id FROM categories WHERE name = 'Gift Sets'),
    true,
    false,
    true,
    now(),
    now()
  ),
  (
    'Monthly Subscription Box',
    'Curated monthly nail sets delivered to your door. Includes 2 sets plus surprise accessories.',
    4999,
    'https://images.unsplash.com/photo-1610992015732-2449ec28227b?w=500',
    (SELECT id FROM categories WHERE name = 'Gift Sets'),
    false,
    false,
    true,
    now(),
    now()
  ),
  
  -- Nail Accessories
  (
    'Professional Application Kit',
    'Complete set of professional tools: nail file, cuticle pusher, nail glue, and prep pads.',
    899,
    'https://images.unsplash.com/photo-1588476822726-6ee2fb5dd7fd?w=500',
    (SELECT id FROM categories WHERE name = 'Application Tools'),
    false,
    false,
    true,
    now(),
    now()
  ),
  (
    'Premium Nail Glue Set',
    'Long-lasting nail adhesive for secure application. Includes 3 tubes plus remover.',
    599,
    'https://images.unsplash.com/photo-1583847411156-40fcf838ba90?w=500',
    (SELECT id FROM categories WHERE name = 'Application Tools'),
    false,
    false,
    true,
    now(),
    now()
  );

-- ========== CREATE VARIANTS FOR NAIL PRODUCTS ==========
-- Only create variants for actual nail sets (not accessories)
INSERT INTO product_variants (
  product_id,
  shape_id,
  length_id,
  finish_id,
  stock_quantity,
  price_override,
  sku,
  created_at,
  updated_at
) 
SELECT 
  p.product_id,
  s.id as shape_id,
  l.id as length_id,
  f.id as finish_id,
  CASE 
    -- Premium collections have lower stock
    WHEN p.base_price > 3000 THEN 8
    -- Popular classic styles have higher stock
    WHEN p.title LIKE '%Classic%' OR p.title LIKE '%French%' THEN 25
    -- Regular collections
    ELSE 15
  END as stock_quantity,
  CASE 
    -- Long nails cost extra for most products
    WHEN l.name = 'Long' AND p.base_price < 3000 THEN p.base_price + 500
    -- Stiletto shape premium for artistic collections
    WHEN s.name = 'Stiletto' AND p.base_price > 2500 THEN p.base_price + 300
    ELSE NULL
  END as price_override,
  'NBR-' || UPPER(LEFT(REPLACE(p.title, ' ', ''), 3)) || '-' || UPPER(s.name) || '-' || UPPER(l.name) as sku,
  now(),
  now()
FROM products p
CROSS JOIN shapes s
CROSS JOIN lengths l
CROSS JOIN finishes f
WHERE p.category_id IN (
  SELECT id FROM categories 
  WHERE name IN ('Classic Styles', 'Bridal Collection', 'Artistic Designs', 'Seasonal Collections')
)
  AND s.is_active = true
  AND l.is_active = true
  AND f.is_active = true;

-- ========== VERIFICATION ==========
-- Check results
-- SELECT COUNT(*) as total_products FROM products WHERE is_published = true;
-- SELECT COUNT(*) as total_variants FROM product_variants;
-- SELECT c.name, COUNT(p.product_id) as product_count
-- FROM categories c
-- LEFT JOIN products p ON c.id = p.category_id
-- GROUP BY c.name
-- ORDER BY c.name;

COMMENT ON TABLE products IS 'Clean nail business products only - electronics/clothing removed';
COMMENT ON TABLE categories IS 'Nail business categories: Press-On Nails, Accessories, Gift Sets, Seasonal';