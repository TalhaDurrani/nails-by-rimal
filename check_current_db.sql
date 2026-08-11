-- Check what's actually in your Supabase database right now
-- Run this in Supabase SQL Editor to see current state

-- 1. Check categories
SELECT id, name, description, parent_id FROM categories ORDER BY id;

-- 2. Check products
SELECT product_id, title, base_price, category_id, is_published FROM products ORDER BY created_at;

-- 3. Check product count by category
SELECT 
  c.name as category_name,
  COUNT(p.product_id) as product_count
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
GROUP BY c.id, c.name
ORDER BY c.id;

-- 4. Check if migration 009 actually ran
SELECT COUNT(*) as total_products FROM products;
SELECT COUNT(*) as total_categories FROM categories;
SELECT COUNT(*) as total_variants FROM product_variants;