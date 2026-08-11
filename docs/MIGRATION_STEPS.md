# Complete Migration Setup Guide for Nails by Rimal

## Overview

Your Supabase database is currently empty. Follow these steps to populate it with the correct schema and sample data.

## Migration Files (In Order)

| # | File | Purpose | Status |
|---|------|---------|--------|
| 1 | `001_initial_schema.sql` | Original tables (profiles, carts, reviews, etc.) | Ready |
| 2 | `002_auth_trigger.sql` | Auto-create profile on signup | Ready |
| 3 | `003_seed_data.sql` | Sample categories & products (old data) | Ready |
| 4 | `004_rebuild_schema_for_nails.sql` | **Main rebuild**: product variants, COD orders, guest checkout | ✅ **THIS IS KEY** |
| 5 | `005_seed_products_and_variants.sql` | Seed 4 nail products with 144 variants | Ready |

---

## Important: Fresh Start Recommended

**The new migration `004_rebuild_schema_for_nails.sql` DROPS and RECREATES the entire schema.** This is intentional to fix the NULL price bug you encountered.

If you have any existing data you want to keep, back it up BEFORE running these migrations.

---

## How to Apply Migrations

### **Option A: Using Supabase Dashboard (Easiest)**

1. Open your Supabase project: https://app.supabase.com
2. Go to **SQL Editor** (left sidebar)
3. For each migration file, in order (001 → 005):
   - Click **New Query**
   - Open the file from your editor
   - Copy the entire SQL
   - Paste into Supabase SQL Editor
   - Click **Run**
   - Wait for ✓ Success (should see green checkmark)

#### Progress Checklist:
- [ ] `001_initial_schema.sql` — Creates initial tables, RLS, indexes
- [ ] `002_auth_trigger.sql` — Creates profile auto-creation function & trigger
- [ ] `003_seed_data.sql` — Seeds original categories & products
- [ ] `004_rebuild_schema_for_nails.sql` — **Rebuilds everything** for variants + COD
- [ ] `005_seed_products_and_variants.sql` — Seeds 4 nail products + 144 variants

---

### **Option B: Using Supabase CLI (Faster)**

If you have the Supabase CLI installed:

```bash
# Navigate to your project directory
cd d:\Rimal\ecommerce-supabase-Nextjs

# Link to your Supabase project (one-time setup)
supabase link --project-id YOUR_PROJECT_ID

# Run all migrations automatically
supabase db push
```

To find your `PROJECT_ID`:
1. Go to Supabase dashboard
2. Click Settings (gear icon)
3. Copy the Project ID from the URL or dashboard

---

## What Gets Created

### Tables Created by Migration 004:
- **shapes** — Nail shapes (Almond, Coffin, Square, Stiletto)
- **lengths** — Nail lengths (Short, Medium, Long)
- **finishes** — Nail finishes (Blush Almond, Champagne Chrome, Midnight Bloom)
- **products** — Product catalog with `base_price` (fixed column)
- **product_variants** — Stock + optional price override per variant combo
- **orders** — COD orders with guest checkout support
- **order_items** — Items in each order
- **carts** — Shopping carts
- **cart_items** — Items in carts
- **categories**, **addresses**, **reviews** — Standard e-commerce tables

### Sample Data Created by Migration 005:
- **4 nail products**:
  - Classic Press-On Nail Set (₨2,500)
  - Luxury Bridal Collection (₨4,500)
  - Casual Everyday Nails (₨1,999)
  - Artistic Design Nails (₨3,999)

- **144 product variants** (36 per product):
  - Each variant = 1 shape × 1 length × 1 finish combo
  - Stock quantities vary (5–25 per variant)
  - Premium variants (Long length, Stiletto) have price overrides

---

## Troubleshooting

### Error: "column "price" does not exist"
✅ **FIXED** — The new migration 004 handles this by rebuilding the schema properly.

### Error: "Relation already exists"
- This means a previous migration attempt partially succeeded
- Go to Supabase > **Authentication > Sessions** and sign out
- Then go to **SQL Editor** and run this cleanup:
  ```sql
  -- Clean up for a fresh start
  DROP TABLE IF EXISTS cart_items CASCADE;
  DROP TABLE IF EXISTS carts CASCADE;
  DROP TABLE IF EXISTS order_items CASCADE;
  DROP TABLE IF EXISTS orders CASCADE;
  DROP TABLE IF EXISTS reviews CASCADE;
  DROP TABLE IF EXISTS addresses CASCADE;
  DROP TABLE IF EXISTS product_variants CASCADE;
  DROP TABLE IF EXISTS products CASCADE;
  DROP TABLE IF EXISTS finishes CASCADE;
  DROP TABLE IF EXISTS lengths CASCADE;
  DROP TABLE IF EXISTS shapes CASCADE;
  DROP TABLE IF EXISTS categories CASCADE;
  ```
- Then re-run all migrations in order

### Error: "Foreign key constraint violation"
- This usually happens if you're running migrations out of order
- Check that you ran migrations 001 → 002 → 003 → 004 → 005 in that exact order
- If you skipped any, clean up and start over

### Tables not appearing after running migration
- Refresh the Supabase dashboard (F5 or Cmd+R)
- Go to **Table Editor** to verify tables exist
- Check **SQL Editor > Queries** history to see if there were errors

---

## Verify Your Setup

After running all migrations, verify everything is correct:

### Check 1: View Products
In Supabase **SQL Editor**, run:
```sql
SELECT COUNT(*) as product_count FROM products;
SELECT COUNT(*) as variant_count FROM product_variants;
```

Expected results:
- `product_count` = 4
- `variant_count` = 144

### Check 2: View Variant Options
```sql
SELECT name FROM shapes WHERE is_active = true;
SELECT name FROM lengths WHERE is_active = true;
SELECT name FROM finishes WHERE is_active = true;
```

Expected results:
- Shapes: Almond, Coffin, Square, Stiletto
- Lengths: Short, Medium, Long
- Finishes: Blush Almond, Champagne Chrome, Midnight Bloom

### Check 3: View a Product with Variants
```sql
SELECT 
  p.title,
  p.base_price,
  COUNT(pv.id) as variant_count,
  MIN(pv.stock_quantity) as min_stock,
  MAX(pv.stock_quantity) as max_stock
FROM products p
LEFT JOIN product_variants pv ON p.product_id = pv.product_id
GROUP BY p.product_id, p.title, p.base_price
ORDER BY p.title;
```

Expected: 4 products, each with 36 variants, varying stock

### Check 4: Test COD Order Creation
```sql
-- Verify order table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;
```

Expected columns: `order_number`, `customer_name`, `customer_phone`, `address_*`, `status = 'pending'`, etc.

---

## Next Steps After Migration

Once migrations complete successfully:

1. **Verify Environment Variables**
   - Check `.env.local` has correct `SUPABASE_URL` and keys
   - Restart your dev server: `npm run dev`

2. **Test Auth Trigger**
   - Sign up for an account in your app
   - Go to Supabase > **Authentication > Users**
   - Check that a new profile was created with `role = 'user'`

3. **View Admin Panel**
   - Sign in as admin (you'll need to promote yourself)
   - In Supabase SQL Editor:
     ```sql
     UPDATE profiles SET role = 'admin' 
     WHERE profile_id = 'YOUR_USER_ID_HERE';
     ```
   - Replace `YOUR_USER_ID_HERE` with the ID from Auth > Users
   - Then visit http://localhost:3000/admin

4. **Test Variant API** (After implementing)
   - The checkout form needs an `/api/variants` endpoint
   - This endpoint fetches variant details (price, shape, length, finish)
   - We'll implement this next

---

## File Structure

```
supabase/
└── migrations/
    ├── 001_initial_schema.sql          (Original tables)
    ├── 002_auth_trigger.sql           (Auth trigger)
    ├── 003_seed_data.sql              (Seed categories & products)
    ├── 004_rebuild_schema_for_nails.sql  (⭐ Main rebuild for variants + COD)
    └── 005_seed_products_and_variants.sql (Seed nail products + 144 variants)
```

---

## Questions?

If you encounter any issues:

1. **Check the error message** carefully
2. **Compare column names** with what's in the migration file
3. **Verify your Supabase project ID** is correct
4. **Try running migrations one at a time** and check after each

If you need to start over, just run the cleanup SQL above and start from migration 001.

---

## Summary

**The schema is now fixed.** Migration 004 rebuilds everything from scratch to support:
- ✅ Product variants (shape + length + finish)
- ✅ Stock per variant (not per product)
- ✅ COD-only checkout
- ✅ Guest checkout (no account required)
- ✅ Pakistani address fields & provinces
- ✅ Order numbers (NBR-XXXXX format)
- ✅ Comprehensive RLS policies
- ✅ Admin-manageable variant options

Run migrations 001 → 005 in order, and you're done!
