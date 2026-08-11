# TASK 3: SCHEMA REBUILD FOR NAILS BY RIMAL — MIGRATION GUIDE

**Status:** Ready for Review (No changes applied yet)

---

## Overview

Four new migration files have been created to rebuild the Supabase schema for **Nails by Rimal** — a Pakistan-based handmade press-on nails store with:
- Dynamic product variants (shape + length + finish combinations)
- Admin-manageable variant options (no hardcoding)
- Guest checkout with Cash on Delivery
- Human-readable order numbers

---

## New Migration Files

### 1. `004_add_variant_lookup_tables.sql`

**Purpose:** Create admin-manageable variant option tables

**Tables Created:**
- `shapes` — Nail shapes (Almond, Coffin, Square, Stiletto)
- `lengths` — Nail lengths (Short, Medium, Long)
- `finishes` — Nail finishes/colors (Blush Almond, Champagne Chrome, Midnight Bloom)

**Features:**
- ✨ Admin can INSERT/UPDATE/DELETE options anytime
- ✨ Soft delete via `is_active = false` (preserves historical data)
- ✨ Optional `swatch_hex` column for finish colors (e.g., #FFB6C1)
- ✨ Initial seed data included
- ✨ RLS policies: public reads active only, admins see all + write

**Example Usage:**
```sql
-- Admin deactivates "Stiletto" without deleting
UPDATE shapes SET is_active = false WHERE name = 'Stiletto';

-- Admin adds new seasonal finish
INSERT INTO finishes (name, swatch_hex, is_active) 
VALUES ('Rose Gold Sparkle', '#B76E79', true);
```

### 2. `005_add_product_variants.sql`

**Purpose:** Add product variant tracking with variant-specific stock and pricing

**Tables Created:**
- `product_variants` — Individual variant combinations (shape + length + finish)

**Key Fields:**
- `product_id` → FK to products
- `shape_id`, `length_id`, `finish_id` → FKs to lookup tables
- `stock_quantity` — Stock for THIS variant only (not product-level)
- `price_override` — NULLABLE; use if variant costs different than base_price
- `sku` — Optional (e.g., "NBR-ALM-SHO-BLU")

**Features:**
- ✨ UNIQUE constraint on (product_id, shape_id, length_id, finish_id)
- ✨ Stock tracked PER variant (independent from other variants)
- ✨ Optional price override for premium variants
- ✨ RLS policies: public reads published products only

**Example Schema Flow:**
```
Product: "Luxury Nail Set"
├── Variant 1: Almond + Short + Blush Almond (stock: 15, price: base)
├── Variant 2: Coffin + Medium + Champagne Chrome (stock: 8, price: base)
└── Variant 3: Square + Long + Midnight Bloom (stock: 5, price: base + 500 override)
```

### 3. `006_update_orders_for_guest_checkout.sql`

**Purpose:** Restructure orders table for guest COD checkout

**Changes to `orders` Table:**
- `user_id` → NOW NULLABLE (guest orders don't have auth)
- NEW: `order_number` → VARCHAR, auto-generated (NBR-01024 format)
- NEW: `customer_name` → VARCHAR (collected from form)
- NEW: `customer_phone` → VARCHAR (collected from form)
- NEW: `customer_email` → VARCHAR (for order confirmation)
- NEW: `address_street`, `address_city`, `address_postal_code`, `address_province` → Inline address fields
- `shipping_address_id` → NOW NULLABLE (can use inline fields instead)
- `payment_method` → DEFAULT 'cod'

**Features:**
- ✨ Auto-generates `order_number` via trigger + sequence
- ✨ Function: `generate_order_number()` returns "NBR-" + 5-digit ID
- ✨ Updated RLS policies for guest + admin access
- ✨ Trigger: `set_order_number_trigger` auto-fills order_number on INSERT

**Changes to `order_items` Table:**
- NEW: `product_variant_id` → FK to product_variants (for variant tracking)
- OLD: `product_id` → Kept for backward compatibility (can migrate later)

**Example Order Creation (Guest):**
```sql
INSERT INTO orders (
  customer_name, customer_phone, customer_email,
  address_street, address_city, address_postal_code, address_province,
  subtotal, shipping_fee, total, status, payment_method
) VALUES (
  'Amina Ahmed', '0300-1234567', 'amina@example.com',
  '123 Mall Road', 'Lahore', '54000', 'Punjab',
  2500, 500, 3000, 'pending', 'cod'
);
-- order_number auto-generated: "NBR-01001"
```

### 4. `007_add_pakistan_provinces_and_notes.sql`

**Purpose:** Add Pakistani province validation and documentation

**Enums Created:**
- `pakistani_province` — Fixed list of provinces (never changes)

**Provinces:**
- Punjab
- Sindh
- Khyber Pakhtunkhwa
- Balochistan
- Islamabad Capital Territory
- Gilgit-Baltistan
- Azad Kashmir

**Features:**
- ✨ Function: `is_valid_pakistani_province()` for validation
- ✨ Constraint on orders.address_province using above function
- ✨ Schema migration log table
- ✨ Comprehensive comments for future developers

---

## RLS Policy Changes

### Guest Checkout Access

**Old RLS (auth-only):**
```sql
-- Only authenticated users could insert orders
CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

**New RLS (guest + auth):**
```sql
-- Guests can create orders (anyone)
CREATE POLICY "Guests can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Authenticated users can create their own
CREATE POLICY "Authenticated users can create their own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Authenticated users view only their own
CREATE POLICY "Authenticated users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Admins see all + can update/delete
CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (auth.uid() IN (SELECT profile_id FROM profiles WHERE role = 'admin'));
```

### Variant Lookup Access

**shapes, lengths, finishes tables:**
- Public reads active options only (`is_active = true`)
- Admins read + write + delete all options
- Prevents frontend hardcoding
- Allows seasonal options, deactivations, renamings

---

## Migration Execution Order

**IMPORTANT:** Run migrations in this order:

1. ✅ `004_add_variant_lookup_tables.sql` — Creates lookup tables + seeds initial data
2. ✅ `005_add_product_variants.sql` — Adds product_variants table
3. ✅ `006_update_orders_for_guest_checkout.sql` — Restructures orders for COD
4. ✅ `007_add_pakistan_provinces_and_notes.sql` — Adds validation + documentation

---

## What's Preserved

### Existing Tables (No Changes)
- ✓ `profiles` — Unchanged
- ✓ `categories` — Unchanged
- ✓ `addresses` — Unchanged
- ✓ `reviews` — Unchanged (can remove later if not needed)

### Backward Compatibility
- ✓ `orders.product_id` in order_items — Kept alongside new `product_variant_id`
- ✓ `orders.shipping_address_id` — Made nullable but preserved
- ✓ `carts` + `cart_items` — Left untouched (future: can deprecate for guest checkout)

---

## Breaking Changes

### For Existing Code

1. **Cart-Based Checkout → Form-Based Checkout**
   - Old: Authenticated users → add to cart → checkout → Polar redirect
   - New: Anyone → fill form → server-side price check → create order
   - Impact: Checkout pages must be rebuilt (TASK 5)

2. **Orders Now Accept NULLable user_id**
   - Old code expecting `user_id` NOT NULL might break
   - Mitigation: Application checks `user_id IS NULL` for guest orders

3. **New Required Fields for Guest Orders**
   - `customer_name`, `customer_phone` must be provided
   - `address_*` fields must be provided (or use FK `shipping_address_id`)
   - Server-side validation required

---

## Example: Creating a Product with Variants

### Step 1: Create Product (unchanged)
```sql
INSERT INTO products (
  title, description, base_price, image, category_id, is_published
) VALUES (
  'Luxury Press-On Nail Set',
  'Handcrafted premium press-on nails with 14-day wear',
  2500,  -- Base price in PKR
  'https://cdn.example.com/product.jpg',
  1,
  true
);
```

### Step 2: Create Variants
```sql
INSERT INTO product_variants (product_id, shape_id, length_id, finish_id, stock_quantity, sku)
SELECT 
  p.product_id,
  s.id, l.id, f.id,
  10,  -- Stock
  'NBR-' || s.name || '-' || l.name || '-' || f.name
FROM products p
CROSS JOIN shapes s
CROSS JOIN lengths l
CROSS JOIN finishes f
WHERE p.title = 'Luxury Press-On Nail Set'
  AND s.is_active = true
  AND l.is_active = true
  AND f.is_active = true;
```

This creates **4 × 3 × 3 = 36 variants** (all combinations of active shapes, lengths, finishes).

---

## Admin Panel Integration (TASK 7)

### Manage Variant Options at `/admin/options`

**Admins can:**
- ✏️ CREATE new shape/length/finish
- ✏️ RENAME existing options (update name)
- ✏️ DEACTIVATE options (set `is_active = false`)
- ❌ Cannot DELETE (soft delete via is_active)

**Frontend Dropdowns (TASK 6):**
- Load dynamically from shapes/lengths/finishes tables
- Filter: `WHERE is_active = true`
- No hardcoding!

---

## Testing Checklist

Before applying these migrations:

- [ ] Review SQL syntax (use `pg_dump` to check)
- [ ] Verify RLS policies make sense
- [ ] Check FK relationships (no circular deps)
- [ ] Test order number generation
- [ ] Test province validation
- [ ] Backup existing database
- [ ] Test migrations in dev environment first

---

## Rollback Plan

If something goes wrong:

```sql
-- Rollback migration order (reverse):
DROP TABLE product_variants CASCADE;
DROP TABLE shapes CASCADE;
DROP TABLE lengths CASCADE;
DROP TABLE finishes CASCADE;
-- ... restore old orders structure
```

---

## Next Steps (TASK 4+)

Once these migrations are approved and applied:

**TASK 4** — Update RLS policies if needed (likely complete after these migrations)

**TASK 5** — Build COD checkout flow (form + server action to create orders)

**TASK 6** — Admin panel: manage products + variants (dynamic dropdowns)

**TASK 7** — Admin panel: manage variant options (/admin/options)

---

## Questions/Concerns?

Before applying, please review:

1. ✅ Do the new columns cover all requirements?
2. ✅ Is the order number generation acceptable (NBR-XXXXX format)?
3. ✅ Should we keep carts table or remove it?
4. ✅ Is soft delete (is_active = false) the right approach for options?
5. ✅ Any other Pakistani-specific fields needed?

---

*Migration files ready for review*
*No changes applied to live database yet*
*Awaiting confirmation to proceed with execution*
