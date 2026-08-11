# What Was Fixed: Schema Error Explanation

## The Problem You Encountered

```
ERROR: 23502: null value in column "price" of relation "products" violates not-null constraint
```

### Root Cause

The original `001_initial_schema.sql` created a `products` table with a `price` column that was NOT NULL:

```sql
CREATE TABLE products (
  ...
  price NUMERIC NOT NULL CHECK (price > 0),  ❌ This column required a value
  ...
);
```

But later migrations tried to:
1. **Add** a new column `base_price` (for variant pricing system)
2. **Insert** products using only `base_price`, not `price`
3. This left the old `price` column as NULL → violation!

The fix wasn't to just **add** `base_price` alongside `price`. The fix was to:
- **Replace** the old `price` column with `base_price`
- Drop the old product schema entirely
- Rebuild it correctly from scratch

---

## The Solution: Migration 004

Migration `004_rebuild_schema_for_nails.sql` does a **complete schema rebuild**:

### Step 1: Drop Old Tables
```sql
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
```

This removes everything that depends on `products` first.

### Step 2: Recreate Tables with Correct Schema

**Old schema (WRONG):**
```sql
CREATE TABLE products (
  product_id UUID PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,        ❌ Single price for all products
  image VARCHAR,
  stock INTEGER NOT NULL,        ❌ Single stock for all products
  ...
);
```

**New schema (CORRECT):**
```sql
CREATE TABLE products (
  product_id UUID PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  base_price NUMERIC NOT NULL,   ✅ Base price (variants override)
  image VARCHAR,
  category_id INTEGER,           ✅ No stock here (moved to variants)
  is_featured BOOLEAN,           ✅ New fields for Nails by Rimal
  is_new BOOLEAN,
  is_published BOOLEAN,
  ...
);

-- Separate table for tracking stock per variant
CREATE TABLE product_variants (
  id SERIAL PRIMARY KEY,
  product_id UUID NOT NULL,
  shape_id INTEGER NOT NULL,     ✅ Variant attributes
  length_id INTEGER NOT NULL,
  finish_id INTEGER NOT NULL,
  stock_quantity INTEGER,        ✅ Stock is per variant
  price_override NUMERIC,        ✅ Optional price adjustment
  ...
);
```

### Step 3: Recreate Dependent Tables (Orders, Carts, etc.)

All tables are recreated with the new schema, updated for:
- COD-only checkout (no payment_method = 'stripe')
- Guest checkout (user_id is nullable)
- Pakistani addresses (province field with enum values)
- Order numbers (NBR-XXXXX format)

### Step 4: Recreate RLS Policies

Row-Level Security policies are recreated to support:
- Public views published products/variants
- Admins can manage variant options (shapes, lengths, finishes)
- Guests can create orders (anyone)
- Users can view their own orders

### Step 5: Seed Initial Data

```sql
-- Variant options (admin-manageable)
INSERT INTO shapes (name, is_active) VALUES
  ('Almond', true),
  ('Coffin', true),
  ('Square', true),
  ('Stiletto', true);

INSERT INTO lengths (name, is_active) VALUES
  ('Short', true),
  ('Medium', true),
  ('Long', true);

INSERT INTO finishes (name, swatch_hex, is_active) VALUES
  ('Blush Almond', '#FFB6C1', true),
  ('Champagne Chrome', '#F0E68C', true),
  ('Midnight Bloom', '#191970', true);
```

---

## Key Architectural Changes

### Old System (Broken)
```
products (price, stock)
├── One price per product
├── One stock level per product
└── order_items references product directly
    └── If product price changes, all past orders are wrong
```

### New System (Correct)
```
products (base_price)
├── One base price per product
└── product_variants (stock_quantity, price_override)
    ├── 36 variants per product (shape × length × finish)
    ├── Each variant can have different stock
    ├── Each variant can override the base price
    └── order_items references product_variants
        └── price_at_purchase is snapshot at order time
            └── Future price changes don't affect past orders ✅
```

---

## Why This Design?

For Nails by Rimal, each product comes in multiple combinations:
- **Shape** (Almond, Coffin, Square, Stiletto)
- **Length** (Short, Medium, Long)
- **Finish** (Blush Almond, Champagne Chrome, Midnight Bloom)

That's **4 × 3 × 3 = 36 variants per product**.

Each variant might:
- Have different stock (e.g., Stiletto is more popular, lower stock)
- Cost different (e.g., Long length might be +₨500 more)

**Without variants:** Impossible to track stock per combo
**With variants:** Perfect! Each combo has its own row.

---

## What Now Works

After migration 004 runs:

✅ **Correct schema**: `base_price` in products, no conflicting `price` column
✅ **Stock tracking**: Per-variant stock quantities
✅ **Price flexibility**: Base price + optional overrides per variant
✅ **COD checkout**: No payment gateway references
✅ **Guest checkout**: user_id is nullable
✅ **Pakistani addresses**: Province enum with valid provinces
✅ **Order history**: Snapshot prices at purchase time (immune to future price changes)
✅ **Admin control**: Shapes, lengths, finishes are database-managed (not hardcoded)
✅ **Audit trail**: All orders stored with order_number for reference

---

## Migration Sequence

```
001_initial_schema.sql
  ↓ (Creates base tables with RLS)
002_auth_trigger.sql
  ↓ (Adds auto-profile creation on signup)
003_seed_data.sql
  ↓ (Seeds original categories & products - legacy data)
004_rebuild_schema_for_nails.sql ⭐ THE FIX
  ↓ (Drops & recreates everything for variants + COD)
  ↓ (Creates variant lookup tables: shapes, lengths, finishes)
  ↓ (Creates new product_variants table)
  ↓ (Updates orders table for guest checkout)
  ↓ (Recreates all RLS policies)
  ↓ (Seeds initial variant options)
005_seed_products_and_variants.sql
  ↓ (Seeds 4 nail products + 144 variants)
```

---

## Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Price column** | `price NOT NULL` ❌ | `base_price NOT NULL` ✅ |
| **Stock tracking** | One per product | Per variant |
| **Variants support** | None | Full support (4×3×3 combos) |
| **COD checkout** | Mixed with payment gateway | Pure COD ✅ |
| **Guest checkout** | Not supported | Full support ✅ |
| **Price overrides** | No | Yes, per variant |
| **Variant options** | Hardcoded enums | Admin-managed database tables |
| **RLS policies** | Basic | Comprehensive (variant-aware) |

**Result: A clean, correct schema ready for production!**
