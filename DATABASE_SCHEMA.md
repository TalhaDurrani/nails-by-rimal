# 🗄️ Database Schema - Nails by Rimal

## Quick Reference

### Total Tables: 14
- **Core Tables:** 14
- **Variant Tables:** 3 (shapes, lengths, finishes)
- **Product Tables:** 2 (products, product_variants)
- **Order Tables:** 2 (orders, order_items)
- **User Tables:** 1 (profiles)
- **Cart Tables:** 2 (carts, cart_items)
- **Support Tables:** 2 (categories, addresses)
- **Review Tables:** 1 (reviews)

---

## 1️⃣ profiles
**User profiles (auto-created on signup)**

| Column | Type | Constraints |
|--------|------|-------------|
| profile_id | UUID | PRIMARY KEY (FK to auth.users.id) |
| username | TEXT | |
| avatar_url | TEXT | |
| email | TEXT | NOT NULL |
| role | TEXT | NOT NULL DEFAULT 'user' (admin/user) |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |

---

## 2️⃣ categories
**Product categories**

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| name | VARCHAR | NOT NULL |
| description | TEXT | NOT NULL |
| parent_id | INTEGER | FK to categories(id) |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |

---

## 3️⃣ products
**Product catalog (base pricing only)**

| Column | Type | Constraints |
|--------|------|-------------|
| product_id | UUID | PRIMARY KEY DEFAULT gen_random_uuid() |
| title | VARCHAR | NOT NULL |
| description | TEXT | NOT NULL |
| base_price | NUMERIC | NOT NULL (> 0) |
| image | VARCHAR | |
| category_id | INTEGER | FK to categories(id) |
| is_featured | BOOLEAN | DEFAULT false |
| is_new | BOOLEAN | DEFAULT false |
| is_published | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |

---

## 4️⃣ product_variants
**Stock & pricing per variant (shape + length + finish)**

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| product_id | UUID | NOT NULL (FK to products) |
| shape_id | INTEGER | NOT NULL (FK to shapes) |
| length_id | INTEGER | NOT NULL (FK to lengths) |
| finish_id | INTEGER | NOT NULL (FK to finishes) |
| stock_quantity | INTEGER | NOT NULL DEFAULT 0 (>= 0) |
| price_override | NUMERIC | (optional, overrides base_price) |
| sku | VARCHAR(255) | (e.g. "NBR-ALM-SHO-BLU") |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |
| **UNIQUE** | (product_id, shape_id, length_id, finish_id) | |

---

## 5️⃣ shapes
**Nail shapes (admin-manageable)**

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| name | VARCHAR(100) | NOT NULL UNIQUE |
| is_active | BOOLEAN | NOT NULL DEFAULT true |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |

**Default Values:**
- Almond, Coffin, Square, Stiletto

---

## 6️⃣ lengths
**Nail lengths (admin-manageable)**

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| name | VARCHAR(100) | NOT NULL UNIQUE |
| is_active | BOOLEAN | NOT NULL DEFAULT true |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |

**Default Values:**
- Short, Medium, Long

---

## 7️⃣ finishes
**Nail finishes/colors (admin-manageable)**

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| name | VARCHAR(100) | NOT NULL UNIQUE |
| swatch_hex | VARCHAR(7) | (optional, e.g. "#FFB6C1") |
| is_active | BOOLEAN | NOT NULL DEFAULT true |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |

**Default Values:**
- Blush Almond (#FFB6C1)
- Champagne Chrome (#F0E68C)
- Midnight Bloom (#191970)

---

## 8️⃣ addresses
**Shipping addresses**

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| user_id | UUID | NOT NULL (FK to profiles) |
| street | VARCHAR | NOT NULL |
| city | VARCHAR | NOT NULL |
| postal_code | VARCHAR | |
| country | VARCHAR | DEFAULT 'Pakistan' |
| is_default | BOOLEAN | NOT NULL DEFAULT false |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |

---

## 9️⃣ orders
**Customer orders (COD + Guest checkout)**

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| order_number | VARCHAR(20) | UNIQUE (NBR-01000, NBR-01001, etc.) |
| user_id | UUID | (nullable, for authenticated users) |
| customer_name | VARCHAR | NOT NULL |
| customer_email | VARCHAR | (nullable) |
| customer_phone | VARCHAR | NOT NULL |
| address_street | VARCHAR | NOT NULL |
| address_city | VARCHAR | NOT NULL |
| address_postal_code | VARCHAR | |
| address_province | VARCHAR | NOT NULL (Pakistani province) |
| status | order_status | NOT NULL DEFAULT 'pending' |
| payment_method | VARCHAR | DEFAULT 'cod' |
| subtotal | NUMERIC | NOT NULL (>= 0) |
| shipping_fee | NUMERIC | NOT NULL DEFAULT 0 |
| total | NUMERIC | NOT NULL (>= 0) |
| notes | TEXT | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |

**Order Status Enum:**
- pending → confirmed → shipped → delivered → cancelled

---

## 🔟 order_items
**Items in each order**

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| order_id | INTEGER | NOT NULL (FK to orders) |
| product_variant_id | INTEGER | NOT NULL (FK to product_variants) |
| quantity | INTEGER | NOT NULL (> 0) |
| price_at_purchase | NUMERIC | NOT NULL (>= 0) |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |

---

## 1️⃣1️⃣ reviews
**Product reviews**

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| product_id | UUID | NOT NULL (FK to products) |
| user_id | UUID | NOT NULL (FK to profiles) |
| rating | INTEGER | NOT NULL (1-5) |
| comment | TEXT | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |

---

## 1️⃣2️⃣ carts
**Shopping carts**

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| user_id | UUID | NOT NULL (FK to profiles) |
| status | cart_status | NOT NULL DEFAULT 'active' |
| total_items | INTEGER | NOT NULL DEFAULT 0 |
| total_price | NUMERIC | NOT NULL DEFAULT 0 |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |

**Cart Status Enum:**
- active, abandoned, converted

---

## 1️⃣3️⃣ cart_items
**Items in cart**

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| cart_id | INTEGER | NOT NULL (FK to carts) |
| product_variant_id | INTEGER | NOT NULL (FK to product_variants) |
| quantity | INTEGER | NOT NULL (> 0) |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |

---

## 1️⃣4️⃣ order_items (backup reference)
**Order items with product reference**

| Column | Type | Constraints |
|--------|------|-------------|
| id | SERIAL | PRIMARY KEY |
| order_id | INTEGER | NOT NULL (FK to orders) |
| product_id | UUID | NOT NULL (FK to products) |
| quantity | INTEGER | NOT NULL (> 0) |
| price | NUMERIC | NOT NULL (>= 0) |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() |

---

## 🔑 Key Relationships

```
profiles (user accounts)
  ↓ (user_id)
orders (customer orders)
  ↓ (id)
order_items (order details)
  ↓ (product_variant_id)
product_variants (specific combinations)
  ↓ (product_id)
products (product catalog)
  ↓ (base_price, is_published)

profiles
  ↓ (user_id)
carts (shopping carts)
  ↓ (cart_id)
cart_items (cart contents)
  ↓ (product_variant_id)
product_variants

profiles
  ↓ (user_id)
addresses (shipping addresses)

categories (product categories)
  ↓ (parent_id, hierarchical)
  ↑ (category_id)
products

shapes + lengths + finishes → product_variants
```

---

## 🎯 Sample Data

### Shapes (4)
- Almond, Coffin, Square, Stiletto

### Lengths (3)
- Short, Medium, Long

### Finishes (3)
- Blush Almond (#FFB6C1)
- Champagne Chrome (#F0E68C)
- Midnight Bloom (#191970)

### Products (4)
1. Classic Press-On Nail Set (₨2,500)
2. Luxury Bridal Collection (₨4,500)
3. Casual Everyday Nails (₨1,999)
4. Artistic Design Nails (₨3,999)

### Variants (144 total)
- 4 shapes × 3 lengths × 3 finishes = 36 per product × 4 products = **144**

---

## 🚀 Auto-Generated Values

### Order Number
- Format: `NBR-XXXXX` (NBR + 5-digit number)
- Example: NBR-01000, NBR-01001, NBR-01024
- Auto-generated by PostgreSQL trigger

### Timestamps
- `created_at`: Auto-set to current time on insert
- `updated_at`: Auto-updated on every change

### Default Values
- `is_active`: true (for shapes/lengths/finishes)
- `is_published`: true (for products)
- `stock_quantity`: 0 (for variants)
- `shipping_fee`: 0 (for orders)
- `status`: 'pending' (for orders)

---

## 🔒 Row Level Security (RLS)

### Public Access
- ✅ Everyone can view published products
- ✅ Everyone can view active shapes/lengths/finishes
- ✅ Everyone can view categories
- ✅ Everyone can view reviews

### Admin Access
- ✅ Admins can view all products (including unpublished)
- ✅ Admins can view all variant options (active + inactive)
- ✅ Admins can insert/update/delete products
- ✅ Admins can manage variant options

### Authenticated Users
- ✅ Users can view their own orders
- ✅ Users can view their own carts
- ✅ Users can insert orders (guest checkout allowed)
- ✅ Users can insert their own cart items

---

## 📊 Important Constraints

| Table | Constraint |
|-------|------------|
| products | base_price > 0 |
| product_variants | stock_quantity >= 0 |
| order_items | quantity > 0, price_at_purchase >= 0 |
| reviews | rating BETWEEN 1 AND 5 |
| profiles | role IN ('admin', 'user') |
| cart_items | UNIQUE(cart_id, product_variant_id) |
| product_variants | UNIQUE(product_id, shape_id, length_id, finish_id) |

---

## 🎨 Type Definitions

```sql
-- Order status enum
CREATE TYPE order_status AS ENUM (
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
);

-- Cart status enum
CREATE TYPE cart_status AS ENUM (
  'active',
  'abandoned',
  'converted'
);
```

---

## 📝 Notes

1. **Price Tracking**: Products have `base_price`, variants can override with `price_override`
2. **Stock Management**: Stock is tracked per variant, NOT per product
3. **Guest Checkout**: `user_id` is nullable in orders table
4. **Order Numbers**: Auto-generated format NBR-XXXXX
5. **Pakistani Provinces**: Hardcoded list (not in DB enum - stored as plain text)
6. **Variant Options**: Shapes/Lengths/Finishes are admin-managed (not hardcoded)

---

**Total: 14 Tables | 144 Variants | 4 Sample Products | 100% Production Ready**
