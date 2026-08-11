# Quick Start: Apply Migrations to Supabase

## 🚀 Fastest Way (5 minutes)

### Step 1: Open Supabase Dashboard
1. Go to https://app.supabase.com
2. Click on your Nails by Rimal project
3. Click **SQL Editor** in the left sidebar

### Step 2: Run Migration 001

1. Click **New Query**
2. Copy all the SQL from: `supabase/migrations/001_initial_schema.sql`
3. Paste into the Supabase editor
4. Click **Run**
5. Wait for ✓ Success (green checkmark appears at bottom)

### Step 3: Run Migration 002

1. Click **New Query**
2. Copy all the SQL from: `supabase/migrations/002_auth_trigger.sql`
3. Paste into the Supabase editor
4. Click **Run**
5. Wait for ✓ Success

### Step 4: Run Migration 003

1. Click **New Query**
2. Copy all the SQL from: `supabase/migrations/003_seed_data.sql`
3. Paste into the Supabase editor
4. Click **Run**
5. Wait for ✓ Success

### Step 5: Run Migration 004 (THE BIG ONE)

**⚠️ This migration drops and recreates all tables. This is intentional to fix the schema.**

1. Click **New Query**
2. Copy all the SQL from: `supabase/migrations/004_rebuild_schema_for_nails.sql`
3. Paste into the Supabase editor
4. Click **Run**
5. Wait for ✓ Success

### Step 6: Run Migration 005

1. Click **New Query**
2. Copy all the SQL from: `supabase/migrations/005_seed_products_and_variants.sql`
3. Paste into the Supabase editor
4. Click **Run**
5. Wait for ✓ Success

---

## ✅ Verify Everything Worked

After all 5 migrations complete, verify in Supabase:

1. Go to **Table Editor** (left sidebar)
2. You should see these tables:
   - ✅ shapes
   - ✅ lengths
   - ✅ finishes
   - ✅ categories
   - ✅ products
   - ✅ product_variants
   - ✅ addresses
   - ✅ orders
   - ✅ order_items
   - ✅ reviews
   - ✅ carts
   - ✅ cart_items
   - ✅ profiles

3. Click on **products** table → should see 4 rows:
   - Classic Press-On Nail Set
   - Luxury Bridal Collection
   - Casual Everyday Nails
   - Artistic Design Nails

4. Click on **product_variants** table → should see 144 rows

---

## 🆘 If Something Goes Wrong

### Error: "Relation already exists"

This means a previous attempt partially succeeded.

**Fix:**
1. Go to **SQL Editor**
2. Click **New Query**
3. Paste this cleanup SQL:
   ```sql
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
4. Click **Run**
5. Start over from Step 2 above (Migration 001)

### Error: "Foreign key constraint violation"

You're probably running migrations out of order.

**Fix:**
1. Run the cleanup SQL above
2. Make sure you run migrations 001 → 002 → 003 → 004 → 005 in that exact order
3. Don't skip any

### Error: "column does not exist"

Check that you:
1. Copied the **entire** SQL file (not just part of it)
2. There are no typos in the table/column names
3. You're running migrations in the correct order

---

## 📱 Verify from Your App

After migrations complete:

### Check 1: Sign Up
1. Go to http://localhost:3000
2. Click **Sign Up**
3. Create an account
4. In Supabase, go to **Authentication > Users** → should see your user
5. Go to **Table Editor > profiles** → should see your profile with `role = 'user'`

### Check 2: View Products
1. Go to http://localhost:3000
2. You should see the 4 nail products on the homepage
3. Click on one product
4. You should see variant options (Shape, Length, Finish dropdowns)

### Check 3: Checkout Flow (COD)
1. Add a product to cart
2. Go to `/checkout`
3. Fill in name, phone, address, province
4. Click "Place Order"
5. Should see "Order Confirmed" with an order number (NBR-XXXXX format)

---

## 🎯 Next: Test as Admin

To access the admin panel:

1. Sign up for an account (or use existing one)
2. Get your `profile_id` from Supabase **Authentication > Users**
3. In Supabase **SQL Editor**, run:
   ```sql
   UPDATE profiles 
   SET role = 'admin' 
   WHERE profile_id = 'PASTE_YOUR_USER_ID_HERE';
   ```
4. Replace `PASTE_YOUR_USER_ID_HERE` with your actual user ID
5. Sign out and back in
6. Go to http://localhost:3000/admin
7. You should see:
   - Admin Dashboard
   - Products page (with admin options)
   - Users page
   - Orders page

---

## 📋 Checklist

- [ ] Migration 001 ran successfully
- [ ] Migration 002 ran successfully
- [ ] Migration 003 ran successfully
- [ ] Migration 004 ran successfully (takes ~5 seconds)
- [ ] Migration 005 ran successfully (creates 144 variants, takes ~2 seconds)
- [ ] Verified 4 products exist in **Table Editor > products**
- [ ] Verified 144 variants exist in **Table Editor > product_variants**
- [ ] Tested signup flow (profile created automatically)
- [ ] Tested product view
- [ ] Tested checkout (COD order created)
- [ ] Tested admin promotion (role updated to 'admin')
- [ ] Accessed admin panel at /admin

---

## 🎉 You're Done!

Your Supabase database is now ready. The schema supports:

✅ Product variants (shape × length × finish)
✅ Stock per variant
✅ COD-only checkout
✅ Guest checkout
✅ Pakistani addresses
✅ Order numbers (NBR-XXXXX)
✅ Admin-managed variant options
✅ Full RLS security

Now you can:
1. ✏️ Build the admin panel to manage products/variants
2. 🛒 Build the cart system UI
3. 💳 Implement the checkout form
4. 📧 Set up order confirmation emails
5. 📊 Build the order management dashboard

**Questions?** See `docs/FIX_EXPLAINED.md` for schema details or `docs/MIGRATION_STEPS.md` for troubleshooting.
