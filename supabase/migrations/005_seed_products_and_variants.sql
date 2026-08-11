-- Migration 005: Seed sample products and variants for Nails by Rimal
-- This creates realistic test data for development

-- Insert sample products
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
  (
    'Classic Press-On Nail Set',
    'Beautiful handcrafted press-on nails perfect for everyday wear. Comfortable fit, durable, and reusable for up to 2-3 weeks.',
    2500,
    'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500',
    NULL,
    true,
    false,
    true,
    now(),
    now()
  ),
  (
    'Luxury Bridal Collection',
    'Premium press-on nails designed for special occasions. Elegant designs with intricate details and premium finishes.',
    4500,
    'https://images.unsplash.com/photo-1610992015732-2449ec28227b?w=500',
    NULL,
    true,
    true,
    true,
    now(),
    now()
  ),
  (
    'Casual Everyday Nails',
    'Minimalist and versatile press-on nails for everyday use. Comfortable, lightweight, and easy to apply.',
    1999,
    'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500',
    NULL,
    false,
    true,
    true,
    now(),
    now()
  ),
  (
    'Artistic Design Nails',
    'Unique artistic designs hand-painted by our artisans. Each set is one-of-a-kind with intricate patterns.',
    3999,
    'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500',
    NULL,
    false,
    false,
    true,
    now(),
    now()
  );

-- Create variants for "Classic Press-On Nail Set"
-- All combinations of shapes x lengths x finishes (4 x 3 x 3 = 36 variants)
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
    -- Give some variants higher stock
    WHEN s.name = 'Almond' AND l.name = 'Medium' THEN 25
    WHEN s.name = 'Coffin' AND l.name = 'Short' THEN 20
    WHEN s.name = 'Square' AND l.name = 'Long' THEN 15
    ELSE 10
  END as stock_quantity,
  CASE 
    -- Premium variants (Long length) cost 500 more
    WHEN l.name = 'Long' THEN 3000
    ELSE NULL
  END as price_override,
  'NBR-CLASSIC-' || UPPER(s.name) || '-' || UPPER(l.name) || '-' || COALESCE(NULLIF(f.name, ''), 'STD') as sku,
  now(),
  now()
FROM products p
CROSS JOIN shapes s
CROSS JOIN lengths l
CROSS JOIN finishes f
WHERE p.title = 'Classic Press-On Nail Set'
  AND s.is_active = true
  AND l.is_active = true
  AND f.is_active = true;

-- Create variants for "Luxury Bridal Collection"
-- Also all combinations, but with higher base stock
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
    WHEN l.name = 'Long' THEN 12
    WHEN l.name = 'Medium' THEN 15
    ELSE 8
  END as stock_quantity,
  CASE 
    WHEN l.name = 'Long' THEN 5000
    ELSE NULL
  END as price_override,
  'NBR-LUXURY-' || UPPER(s.name) || '-' || UPPER(l.name) as sku,
  now(),
  now()
FROM products p
CROSS JOIN shapes s
CROSS JOIN lengths l
CROSS JOIN finishes f
WHERE p.title = 'Luxury Bridal Collection'
  AND s.is_active = true
  AND l.is_active = true
  AND f.is_active = true;

-- Create variants for "Casual Everyday Nails"
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
    WHEN s.name IN ('Square', 'Almond') THEN 20
    ELSE 12
  END as stock_quantity,
  NULL as price_override, -- No price override, use base_price
  'NBR-CASUAL-' || UPPER(s.name) || '-' || UPPER(l.name) as sku,
  now(),
  now()
FROM products p
CROSS JOIN shapes s
CROSS JOIN lengths l
CROSS JOIN finishes f
WHERE p.title = 'Casual Everyday Nails'
  AND s.is_active = true
  AND l.is_active = true
  AND f.is_active = true;

-- Create variants for "Artistic Design Nails"
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
    WHEN s.name = 'Stiletto' THEN 5 -- Limited stock for premium shape
    ELSE 8
  END as stock_quantity,
  CASE 
    WHEN l.name = 'Long' THEN 4500
    WHEN s.name = 'Stiletto' THEN 4200
    ELSE NULL
  END as price_override,
  'NBR-ART-' || UPPER(s.name) || '-' || UPPER(l.name) as sku,
  now(),
  now()
FROM products p
CROSS JOIN shapes s
CROSS JOIN lengths l
CROSS JOIN finishes f
WHERE p.title = 'Artistic Design Nails'
  AND s.is_active = true
  AND l.is_active = true
  AND f.is_active = true;

-- Verification queries (uncomment to debug)
-- SELECT COUNT(*) as total_variants FROM product_variants;
-- SELECT COUNT(*) as total_products FROM products WHERE is_published = true;
-- SELECT 
--   p.title,
--   (SELECT COUNT(*) FROM product_variants WHERE product_id = p.product_id) as variant_count
-- FROM products p
-- WHERE is_published = true;
