# TASK 1: AUDIT REPORT — Current State Analysis

**Status:** AUDIT COMPLETE — Waiting for confirmation before proceeding to TASK 2+

---

## 1. EXISTING TABLES AND COLUMNS

### Current Database Schema (from migrations)

**Active Tables:**
1. `profiles` — User profiles
   - `profile_id` (UUID, PK) → links to auth.users(id)
   - `username` (TEXT, nullable)
   - `avatar_url` (TEXT, nullable)
   - `email` (TEXT, NOT NULL)
   - `role` (TEXT, DEFAULT 'user') → 'admin' | 'user'
   - `created_at`, `updated_at` (TIMESTAMPTZ)

2. `products` — Product catalog
   - `product_id` (UUID, PK)
   - `title` (VARCHAR, NOT NULL)
   - `description` (TEXT, NOT NULL)
   - `price` (NUMERIC, NOT NULL) — SINGLE price per product
   - `image` (VARCHAR, nullable) — Single image per product
   - `stock` (INTEGER, default 0) — Stock at PRODUCT level
   - `sku` (VARCHAR, nullable)
   - `category_id` (FK → categories)
   - `created_at`, `updated_at` (TIMESTAMPTZ)

3. `categories` — Product categories
   - `id` (SERIAL, PK)
   - `name` (VARCHAR, NOT NULL)
   - `description` (TEXT, NOT NULL)
   - `parent_id` (INT, nullable) — Hierarchical categories
   - `created_at` (TIMESTAMPTZ)

4. `orders` — Order header
   - `id` (SERIAL, PK)
   - `user_id` (UUID, FK → profiles) — NOT NULLABLE (requires auth)
   - `status` (order_status ENUM: pending, processing, shipped, delivered, cancelled)
   - `total` (NUMERIC, NOT NULL)
   - `shipping_address_id` (INT, FK → addresses, NOT NULL)
   - `payment_method` (VARCHAR, nullable)
   - `payment_id` (VARCHAR, nullable) — Polar checkout ID
   - `created_at`, `updated_at` (TIMESTAMPTZ)

5. `order_items` — Items in an order
   - `id` (SERIAL, PK)
   - `order_id` (INT, FK → orders, ON DELETE CASCADE)
   - `product_id` (UUID, FK → products, ON DELETE RESTRICT)
   - `quantity` (INT, NOT NULL, > 0)
   - `price` (NUMERIC, NOT NULL) — Price at purchase time (snapshot)
   - `created_at` (TIMESTAMPTZ)

6. `addresses` — Shipping addresses
   - `id` (SERIAL, PK)
   - `user_id` (UUID, FK → profiles, ON DELETE CASCADE)
   - `street` (VARCHAR, NOT NULL)
   - `city` (VARCHAR, NOT NULL)
   - `state` (VARCHAR, nullable)
   - `zip_code` (VARCHAR, NOT NULL)
   - `country` (VARCHAR, NOT NULL)
   - `is_default` (BOOLEAN, DEFAULT FALSE)
   - `created_at`, `updated_at` (TIMESTAMPTZ)

7. `reviews` — Product reviews
   - `id` (SERIAL, PK)
   - `product_id` (UUID, FK → products, ON DELETE CASCADE)
   - `user_id` (UUID, FK → profiles, ON DELETE CASCADE)
   - `rating` (INT, 1-5)
   - `comment` (TEXT, nullable)
   - `created_at` (TIMESTAMPTZ)

8. `carts` — Shopping carts (for authenticated users)
   - `id` (SERIAL, PK)
   - `user_id` (UUID, FK → profiles, NOT NULL)
   - `status` (cart_status ENUM: active, abandoned, converted)
   - `total_items` (INT, DEFAULT 0)
   - `total_price` (NUMERIC, DEFAULT 0)
   - `created_at`, `updated_at` (TIMESTAMPTZ)

9. `cart_items` — Items in a cart
   - `id` (SERIAL, PK)
   - `cart_id` (INT, FK → carts, ON DELETE CASCADE)
   - `product_id` (UUID, FK → products, ON DELETE CASCADE)
   - `quantity` (INT, NOT NULL, > 0)
   - `price` (NUMERIC, NOT NULL)
   - `created_at`, `updated_at` (TIMESTAMPTZ)

**Enums Defined:**
- `order_status` → pending, processing, shipped, delivered, cancelled
- `cart_status` → active, abandoned, converted

**Indexes Created:**
- idx_products_category, idx_orders_user, idx_order_items_order, idx_order_items_product
- idx_reviews_product, idx_reviews_user, idx_addresses_user
- idx_carts_user, idx_cart_items_cart, idx_cart_items_product
- idx_orders_payment_id (from migration 20250101)

---

## 2. POLAR REFERENCES — COMPLETE INVENTORY

### A. Package Dependencies
**File:** `package.json`
- `"@polar-sh/sdk": "^0.47.0"` — Polar SDK dependency

### B. Environment Variables
**Files:** `.env.example`, `src/env.d.ts`
- `POLAR_ACCESS_TOKEN` (referenced in env.d.ts, not in .env.example yet)
- `POLAR_WEBHOOK_SECRET` (referenced in env.d.ts)
- `POLAR_PRODUCT_ID` (optional, in checkout/actions.ts)
- `POLAR_ORG_ID` (optional, in checkout/actions.ts)

**Status:** Env vars NOT listed in `.env.example`, only referenced in code.

### C. Checkout Flow (Main Polar Integration)
**File:** `src/app/checkout/actions.ts`
```typescript
import { Polar } from '@polar-sh/sdk'
const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: 'sandbox',
})

export async function createPolarCheckout() {
  // Gets user from auth
  // Fetches active cart
  // Calls getPolarProduct() to find/get a Polar product
  // Combines all cart items into ONE price entry with metadata
  // Calls polar.checkouts.create({ products, prices, externalCustomerId, successUrl, customerEmail })
  // Returns checkout.url for redirect OR error
}
```

**Functionality:**
- Fetches Polar products using `polar.products.list()`
- Creates a checkout session with `polar.checkouts.create()`
- Stores cart items as JSON in metadata for later webhook processing
- REQUIRES authenticated user (cart lookup depends on user.id)

### D. Checkout Pages
**Files:**
- `src/app/checkout/page.tsx` — Server component, redirects unauthenticated users to signin
- `src/app/checkout/CheckoutRedirect.tsx` — Client component that calls `createPolarCheckout()` and redirects to `result.checkoutUrl` (Polar hosted checkout)
- `src/app/checkout/success/page.tsx` — Polar redirects here after payment; displays "Order created successfully" with checkout_id
- `src/app/checkout/cancel/page.tsx` — Polar redirects here if user cancels; allows returning to cart

### E. Webhook Handler (Polar Payment Events)
**File:** `src/app/api/webhooks/polar/route.ts`
```typescript
POST /api/webhooks/polar

Function: mapPolarStatusToOrderStatus(polarStatus)
  - 'paid' → 'processing'
  - 'pending' → 'pending'
  - 'failed' / 'canceled' → 'cancelled'

On checkout.succeeded event:
  1. Verifies HMAC signature using process.env.POLAR_WEBHOOK_SECRET
  2. Extracts user_id from customer.external_id (Supabase user UUID)
  3. Idempotency check: SELECT * FROM orders WHERE payment_id = checkout.id AND user_id
  4. Creates shipping address from customer.address
  5. Creates order with status = mapPolarStatusToOrderStatus(checkout.payment_status)
  6. Creates order_items from cart_items stored in metadata
  7. Clears cart after successful order
  8. Returns order.id
```

**Key Detail:** The webhook REQUIRES an existing order status enum check and relies on:
- `checkout.payment_status` (maps to order_status enum)
- `customer.external_id` (expects Supabase user UUID)
- `order_items` parsed from `firstLineItem.price.metadata.cart_items` (JSON string)

### F. Helper Functions
**File:** `src/services/order/orderService.ts`
```typescript
export function mapPolarStatusToOrderStatus(polarStatus: string): OrderStatus
  - Converts Polar payment status to local order_status enum
```

**File:** `src/app/api/webhooks/polar/route.ts`
```typescript
function mapPolarStatusToOrderStatus(polarStatus: string): OrderStatus
  - Duplicate of above, should be consolidated
```

### G. Types/Env Declarations
**File:** `src/env.d.ts`
```typescript
declare namespace NodeJS {
  interface ProcessEnv {
    readonly POLAR_ACCESS_TOKEN: string;
    readonly POLAR_WEBHOOK_SECRET: string;
  }
}
```

### H. Components That Reference Polar/Checkout
- `src/components/dashboard/PaymentDistributionChart.tsx` — Shows "Payment Methods" chart (generic, not Polar-specific)
- `src/components/admin/OrderDetailsModal.tsx` — Shows `order.payment_method` field
- `src/components/dashboard/DashboardCharts.tsx` — Includes PaymentDistributionChart
- `src/app/cart/CartShoppingPage.tsx` — "Proceed to Checkout" button → `/checkout`

**Status:** Generic payment display components; not tightly coupled to Polar SDK.

---

## 3. CURRENT ORDER/CHECKOUT FLOW (END-TO-END)

### **Current User Flow (with Polar)**

1. **User Authentication** (Optional)
   - User can sign up/login OR skip (cart is user-based though)
   - If not authenticated, redirected away from checkout

2. **Add to Cart** (Requires Auth)
   - `src/services/cart/cartService.ts` — uses `getClientUser()` to fetch current user
   - Inserts into `carts` table (user must exist)
   - Inserts into `cart_items` table with product_id, quantity, price

3. **Proceed to Checkout**
   - Click "Proceed to Checkout" → `/checkout`
   - Server component checks auth; redirects to signin if not authenticated
   - Renders `<CheckoutRedirect />` component

4. **Checkout Redirect (Client-Side)**
   - `CheckoutRedirect.tsx` calls `createPolarCheckout()` (server action)
   - `createPolarCheckout()` action:
     - Gets authenticated user (fails if not auth)
     - Fetches active cart and cart_items
     - Calls `getPolarProduct()` to find a Polar product
     - Combines ALL cart items into ONE price entry (in Polar)
     - Calls `polar.checkouts.create()` with externalCustomerId = user.id
     - Returns `{ success: true, checkoutUrl }`
   - Browser redirects to `result.checkoutUrl` (Hosted Polar Checkout)

5. **Customer Fills Payment/Address Form (On Polar)**
   - Polar handles the form UI
   - Collects: email, address (line1, city, postal_code, country, state)
   - Handles payment (card, bank transfer, etc.)

6. **Post-Payment Webhook**
   - Polar sends `checkout.succeeded` webhook to `/api/webhooks/polar`
   - Handler:
     - Verifies signature (HMAC-SHA256)
     - Gets user_id from `customer.external_id`
     - Creates `addresses` row from customer.address
     - Creates `orders` row with:
       - user_id (from external_id)
       - status = 'processing' (if payment.status = 'paid')
       - total = sum of line_items
       - shipping_address_id = newly created address
       - payment_id = checkout.id
       - payment_method = 'polar'
     - Creates `order_items` from metadata
     - Clears cart

7. **Redirect to Success Page**
   - Polar redirects browser to `/checkout/success?checkout_id={CHECKOUT_ID}`
   - Page displays "Order confirmed, pay nothing here" messaging
   - Shows checkout_id as order reference

8. **Cancel Path**
   - User clicks "Cancel" on Polar checkout
   - Polar redirects to `/checkout/cancel`
   - Page offers "Return to Cart"

### **Problems with Current Flow (for Nails by Rimal)**

1. ❌ **Requires Authentication**
   - Cart operations need `getClientUser()`
   - Checkout page redirects unauthenticated users to signin
   - **Requirement:** Guest checkout with no account needed

2. ❌ **Single Price Per Product**
   - `products.price` is a single numeric value
   - No product variants (shape, length, finish)
   - **Requirement:** Dynamic variants with optional price overrides

3. ❌ **Polar-Specific Implementation**
   - Heavy coupling to Polar SDK
   - Webhook assumes Polar payment event structure
   - **Requirement:** Cash on Delivery, no payment gateway

4. ❌ **Cart Architecture**
   - Cart is tied to authenticated user
   - Cannot support guest checkout
   - **Requirement:** Guest + auth checkout support

5. ❌ **No Order Number**
   - Orders identified only by auto-increment ID
   - No human-readable order reference shown to customer
   - **Requirement:** Order number like "NBR-1024"

---

## 4. ADMIN VS CUSTOMER ROLE ENFORCEMENT

### Current Role System

**Table:** `profiles.role` (TEXT)
- Values: 'admin' | 'user'
- Default: 'user'
- Set during auth signup via trigger: `handle_new_user()` function

### Enforcement Points

**1. RLS Policies (Database Level)**

**Products Table:**
```sql
-- Everyone can read published products
CREATE POLICY "Everyone can view products" ON products FOR SELECT USING (true);

-- Only admins can write
CREATE POLICY "Only admins can insert products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT profile_id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Only admins can update products"
  ON products FOR UPDATE
  USING (auth.uid() IN (SELECT profile_id FROM profiles WHERE role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT profile_id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Only admins can delete products"
  ON products FOR DELETE
  USING (auth.uid() IN (SELECT profile_id FROM profiles WHERE role = 'admin'));
```

**Categories Table:** Same pattern — anyone reads, only admins write

**Orders Table:**
```sql
-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert (place orders)
CREATE POLICY "Users can insert own orders" ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only admins can update orders (status changes)
CREATE POLICY "Only admins can update orders" ON orders FOR UPDATE
  USING (auth.uid() IN (SELECT profile_id FROM profiles WHERE role = 'admin'));
```

**Status:** ✓ RLS policies enforce role at the database level.

**2. Application Level Checks**

**File:** `src/services/auth/authServerService.ts`
```typescript
export const getCurrentUser = async (): Promise<ProfileType | null> => {
  const supabase = await createServerSupabase();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return null;
  
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("profile_id", user.id)
    .single();
  
  return profile;  // Includes role field
}
```

**File:** `src/app/admin/users/actions.ts`
```typescript
export async function updateUserRoleAction(userId: string, role: "admin" | "user") {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }
  // ... proceed with update
}

export async function deleteUserAction(userId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }
  // ... proceed with delete
}
```

**Status:** ✓ Server actions check admin role before operations.

**3. Admin Panel Access**

**File:** `src/app/admin/layout.tsx`
- Not shown, but referenced in codebase
- Likely protects `/admin/*` routes

**Status:** ✓ Role is available for frontend route guards (not yet audited if actually guarded).

---

## SUMMARY FOR TASK 2+

### What Must Be Removed (TASK 2)
1. ✂️ `@polar-sh/sdk` dependency from package.json
2. ✂️ `src/app/checkout/actions.ts` — entire file (Polar checkout logic)
3. ✂️ `src/app/checkout/CheckoutRedirect.tsx` — replace with COD form
4. ✂️ `src/app/checkout/success/page.tsx` — replace with COD confirmation
5. ✂️ `src/app/checkout/cancel/page.tsx` — remove (no "cancel" in COD)
6. ✂️ `src/app/api/webhooks/polar/route.ts` — entire webhook handler
7. ✂️ `POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET`, `POLAR_PRODUCT_ID`, `POLAR_ORG_ID` from env
8. ✂️ `mapPolarStatusToOrderStatus()` functions (both copies)
9. ✂️ `src/env.d.ts` — remove Polar env declarations
10. ✂️ Remove Polar references from `src/services/order/orderService.ts`

### What Must Be Rebuilt (TASK 3+)
1. **Schema Changes:**
   - Remove `carts` and `cart_items` tables (guest checkout doesn't need them)
   - Add `product_variants` table with shape/length/finish FKs
   - Add `shapes`, `lengths`, `finishes` lookup tables
   - Modify `orders` table:
     - Make `user_id` NULLABLE (guest checkout)
     - Add `order_number` VARCHAR column
     - Add `customer_name`, `customer_phone` fields
     - Remove `shipping_address_id` FK; instead store address inline (city, postal_code, province, street)
   - Modify `order_items` to reference `product_variants` instead of `products`
   - Remove `reviews` table (out of scope for now)
   - Update `order_status` enum to: pending, confirmed, shipped, delivered, cancelled

2. **Order Flow:**
   - Build `/checkout` form (no auth required)
   - Server action to validate + create order (recompute prices server-side)
   - No webhook needed (no external payment service)
   - Generate human-readable order number
   - Redirect to confirmation page

3. **Admin Panel:**
   - Add `/admin/options` to manage shapes/lengths/finishes
   - Update product form to manage variants

### Role System (TASK 4)
- ✓ Keep existing `profiles.role` system
- ✓ Extend RLS policies for new tables (shapes, lengths, finishes, product_variants)
- ✓ Ensure admin can manage options and orders

---

## ✅ AUDIT COMPLETE

**Confirm to proceed to TASK 2 (Polar Removal)**

Please review this audit and confirm:
- [  ] Schema overview is accurate
- [  ] Polar reference inventory is complete
- [  ] Current flow understanding is correct
- [  ] Role system is clear
- [  ] Ready to proceed with Polar removal

---

*Generated: 2025-01-XX*
*Project: Nails by Rimal (ecommerce-supabase-Nextjs)*
*Status: Awaiting confirmation before destructive changes*
