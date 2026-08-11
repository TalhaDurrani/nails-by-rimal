# Supabase Setup Guide

This guide walks you through setting up your Supabase database for the e-commerce application.

## Prerequisites

- Supabase project created
- Environment variables configured in `.env.local`:
  - `SUPABASE_URL`
  - `SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_SECRET_KEY`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## Setup Steps

### Option 1: Using Supabase Dashboard (Easiest)

#### Step 1: Create Tables and Schema

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Create a new query
4. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
5. Click **Run** to execute

This creates:
- All required tables (profiles, products, categories, orders, carts, etc.)
- Custom types (order_status, cart_status)
- Row Level Security (RLS) policies
- Indexes for performance

#### Step 2: Create Auth Trigger

1. In **SQL Editor**, create a new query
2. Copy and paste `supabase/migrations/002_auth_trigger.sql`
3. Click **Run**

This creates an automatic trigger that:
- Creates a user profile when someone signs up
- Sets their role to 'user' by default
- Stores their email in the profiles table

#### Step 3: Seed Sample Data (Optional)

1. In **SQL Editor**, create a new query
2. Copy and paste `supabase/migrations/003_seed_data.sql`
3. Click **Run**

This adds:
- 8 product categories
- 10 sample products for testing

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Link to your project (if not already done)
supabase link --project-id YOUR_PROJECT_ID

# Push migrations
supabase db push
```

## Critical Configuration

### Enable Row Level Security (RLS)

All tables have RLS enabled. Verify in Supabase Dashboard:

1. Go to **Authentication** > **Policies**
2. Check that policies exist for each table
3. Policies should be automatically created by the migration

### Set Up Authentication Providers

1. Go to **Authentication** > **Providers**
2. Configure OAuth providers (Google, GitHub, etc.) if needed
3. Set redirect URLs to your application domain

## Database Schema Overview

### Core Tables

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `profiles` | User profile info | profile_id, email, role, username, avatar_url |
| `products` | Product catalog | product_id, title, price, stock, category_id |
| `categories` | Product categories | id, name, description, parent_id |
| `orders` | Customer orders | id, user_id, status, total, payment_id |
| `order_items` | Items in orders | id, order_id, product_id, quantity, price |
| `addresses` | Shipping addresses | id, user_id, street, city, country |
| `carts` | Shopping carts | id, user_id, status, total_price |
| `cart_items` | Items in carts | id, cart_id, product_id, quantity, price |
| `reviews` | Product reviews | id, product_id, user_id, rating, comment |

### User Roles

- **user** (default) - Regular customer
- **admin** - Can manage products, categories, orders

### Order Status Enum

- `pending` - Order placed, awaiting payment
- `processing` - Payment received, preparing to ship
- `shipped` - Order sent to customer
- `delivered` - Delivered successfully
- `cancelled` - Order cancelled

## Making a User Admin

To promote a user to admin role:

1. Go to **Authentication** > **Users** in Supabase dashboard
2. Find the user you want to promote
3. Go to **SQL Editor** and run:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE profile_id = 'USER_ID_HERE';
```

Replace `USER_ID_HERE` with the actual user UUID.

## Testing the Setup

### Test Auth Trigger

1. Sign up for a new account in your app
2. Go to Supabase dashboard > **Table Editor** > **profiles**
3. Verify a new profile row was created with:
   - `profile_id` matching the auth user ID
   - `email` from signup
   - `role` = 'user'

### Test RLS Policies

1. Sign in as a user
2. Try to:
   - **View products**: Should work (RLS allows)
   - **Insert product**: Should fail (not admin)
   - **Update own profile**: Should work
   - **Update another user's profile**: Should fail

## Troubleshooting

### Tables Not Visible

- Check SQL Editor for execution errors
- Verify you're in the correct project
- Refresh the page

### Auth Trigger Not Working

- Go to **SQL Editor** and check for errors
- Verify the trigger was created: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`
- Check the function: `SELECT * FROM pg_proc WHERE proname = 'handle_new_user';`

### RLS Denying Access

- Verify you're authenticated (check auth token)
- Check RLS policies in **Authentication** > **Policies**
- Enable RLS enforcement: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`

### Storage Issues

If you need to store images later:

1. Go to **Storage** in Supabase dashboard
2. Create a new bucket called `product-images`
3. Set it to public (if serving public images)
4. Configure RLS policies for the bucket

## Performance Notes

- Indexes created on commonly-queried fields
- Profile queries optimized for cart/order lookups
- Category tree supports hierarchical navigation
- Cart operations are optimized for read/write speed

## Security Notes

- All tables enforce RLS (Row Level Security)
- Users can only access their own data
- Admin operations protected by role-based policies
- Sensitive queries validated server-side
- Webhook endpoints use HMAC signature verification

## Next Steps

1. Configure payment processor (Polar/Stripe)
2. Set up email notifications
3. Configure storage for product images
4. Set up backup strategy
5. Configure monitoring and logging

## Useful SQL Queries

### Get user by email
```sql
SELECT * FROM profiles WHERE email = 'user@example.com';
```

### Get all admin users
```sql
SELECT * FROM profiles WHERE role = 'admin';
```

### Get user's recent orders
```sql
SELECT * FROM orders 
WHERE user_id = 'USER_ID' 
ORDER BY created_at DESC 
LIMIT 10;
```

### Get product inventory
```sql
SELECT product_id, title, stock FROM products WHERE stock < 10;
```

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
