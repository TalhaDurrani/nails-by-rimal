# 🤖 AI Codebase Guide - Nails by Rimal E-Commerce

> **For AI Assistants:** This guide helps you understand the complete codebase structure, database design, and business logic for the "Nails by Rimal" e-commerce platform.

## 📋 Project Overview

**Business:** Nails by Rimal - Handmade press-on nail business in Pakistan  
**Tech Stack:** Next.js 14 + Supabase + TypeScript + Tailwind CSS  
**Payment:** Cash on Delivery (COD) with guest checkout support  
**Target:** Pakistani market with Urdu/English support  

---

## 🗄️ Database Architecture (Supabase)

### Core Tables (14 total)

#### 1. **profiles** - User accounts
- `profile_id` (UUID, PK) - Links to auth.users.id
- `username`, `avatar_url`, `email` 
- `role` ('admin' | 'user') - Role-based access control
- Auto-created on user signup

#### 2. **categories** - Product categories
- `id` (SERIAL, PK)
- `name`, `description`, `parent_id` (hierarchical)
- Current: Press-On Nails, Accessories, Gift Sets, Seasonal

#### 3. **products** - Main product catalog
- `product_id` (UUID, PK)
- `title`, `description`, `base_price`
- `category_id` (FK), `image` (URL)
- `is_featured`, `is_new`, `is_published` (boolean flags)

#### 4. **product_variants** - Stock & pricing per variant
- Unique combinations: `product_id` + `shape_id` + `length_id` + `finish_id`
- `stock_quantity`, `price_override` (optional)
- `sku` format: "NBR-[PRODUCT]-[SHAPE]-[LENGTH]"

#### 5-7. **Variant Options** (Admin manageable)
- **shapes**: Almond, Coffin, Square, Stiletto
- **lengths**: Short, Medium, Long  
- **finishes**: Colors with hex codes (e.g., Blush Almond #FFB6C1)
- All have `is_active` for soft delete

#### 8. **orders** - Customer orders
- `order_number` format: "NBR-XXXXX" (auto-generated)
- `user_id` (nullable for guest checkout)
- Customer info: `customer_name`, `customer_email`, `customer_phone`
- Address: `address_street`, `address_city`, `address_province`
- `status` enum: pending → confirmed → shipped → delivered → cancelled
- `payment_method` default: 'cod'
- `subtotal`, `shipping_fee`, `total`

#### 9. **order_items** - Order line items
- `order_id` (FK), `product_variant_id` (FK)
- `quantity`, `price_at_purchase` (price snapshot)

#### 10-11. **Cart System**
- **carts**: `user_id`, `status`, `total_items`, `total_price`
- **cart_items**: `cart_id`, `product_variant_id`, `quantity`

#### 12. **addresses** - Shipping addresses
- `user_id` (FK), address fields, `is_default`
- Country defaults to 'Pakistan'

#### 13. **reviews** - Product reviews
- `product_id` (FK), `user_id` (FK)
- `rating` (1-5), `comment`

---

## 🏗️ Frontend Architecture

### App Structure (Next.js 14 App Router)
```
src/app/
├── (auth)/           # Authentication pages
│   ├── signin/       # Login page
│   ├── signup/       # Registration page
│   └── reset-password/ # Password reset flow
├── admin/            # Admin panel (role-protected)
│   ├── products/     # Product management
│   ├── orders/       # Order management
│   └── users/        # User management
├── cart/             # Shopping cart page
├── checkout/         # Checkout flow (guest + auth)
├── api/              # API routes
│   └── variants/     # Product variants endpoint
└── [category]/       # Dynamic category pages
```

### Key Components
```
src/components/
├── ProductCard.tsx   # Product display card
├── CategoryPage.tsx  # Generic category listing
├── ErrorState.tsx   # Error handling UI
├── LoadingSpinner.tsx # Loading states
└── ui/              # Shadcn UI components
```

### Services Layer
```
src/services/
├── product/          # Product-related operations
├── cart/             # Cart management
├── order/            # Order processing
└── admin/           # Admin operations
```

### State Management
- **TanStack Query** for server state
- **Context API** for auth state
- **localStorage** for guest cart persistence

---

## 🔐 Authentication & Security

### Row Level Security (RLS) Policies
- **Public access:** Published products, categories, reviews
- **Authenticated users:** Own orders, cart items, addresses
- **Admin access:** All products, user management, order management
- **Guest checkout:** Orders can be created without authentication

### Role-Based Access
- `profiles.role` determines access level
- Admin routes protected by middleware
- Frontend role checks in components

---

## 🛍️ Business Logic

### Product Variants System
- Each product can have multiple variants (shape × length × finish)
- Stock tracked per variant, not per product
- Pricing: `base_price` or `price_override` from variant
- SKU auto-generated for tracking

### Order Flow
1. **Cart Management:** 
   - Authenticated: Database-persisted cart
   - Guest: localStorage with GuestCartContext
2. **Checkout:** Guest or authenticated users
3. **Order Creation:** COD payment, address collection
4. **Order Processing:** Admin manages order status

### Pakistani Localization
- Provinces: Punjab, Sindh, KP, Balochistan, ICT, GB, AJK
- Currency: Pakistani Rupees (₨)
- Phone number format validation
- Urdu language support capability

---

## 📱 Key Features

### Customer Features
- Product browsing with category filtering
- Variant selection (shape, length, finish)
- Guest checkout with COD
- Order tracking
- User account management
- Product reviews & ratings

### Admin Features  
- Product management (CRUD)
- Variant option management (shapes/lengths/finishes)
- Order management & status updates
- User management
- Inventory tracking per variant

### Technical Features
- Server-side rendering (SSR)
- Responsive design (mobile-first)
- Image optimization
- Error boundary handling
- Type safety with TypeScript
- API rate limiting & caching

---

## 🔧 Environment Setup

### Required Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Migrations
Located in `supabase/migrations/`:
- `001_initial_schema.sql` - Core tables
- `002_auth_trigger.sql` - User profile trigger  
- `003_seed_data.sql` - Initial categories & variant options
- `004_rebuild_schema_for_nails.sql` - Nail-specific updates
- `005_seed_products_and_variants.sql` - Sample products

---

## 🧪 Testing & Development

### Development Server
```bash
npm run dev        # Start development server
npm run build      # Production build
npm run lint       # ESLint check
```

### Database Management
- Supabase Dashboard for GUI management
- SQL queries in `scripts/` folder for inspection
- Migration files for schema changes

---

## 🚀 Deployment Considerations

### Performance
- Image optimization with Next.js Image component
- TanStack Query for caching & background updates
- Database indexes on frequently queried columns

### Security
- RLS policies protect data access
- Server-side validation on all mutations
- CORS configuration for API endpoints
- Input sanitization & validation

### Scalability
- Supabase handles database scaling
- Vercel/Netlify for frontend deployment
- CDN for static assets
- Pagination for large product catalogs

---

## 💡 AI Assistant Guidelines

### When Adding Features:
1. **Check existing services** - Don't duplicate logic
2. **Follow TypeScript patterns** - Use existing types
3. **Implement RLS policies** - Security first
4. **Add proper error handling** - Use existing error patterns
5. **Test with different user roles** - Admin vs User vs Guest

### When Modifying Database:
1. **Create migration files** - Don't modify existing ones
2. **Update TypeScript types** - Keep `src/types/` synchronized  
3. **Consider RLS impact** - Security implications
4. **Test data integrity** - Foreign key constraints

### Code Patterns to Follow:
- **Server Components** for data fetching
- **Client Components** for interactivity  
- **TanStack Query** for server state
- **Zod schemas** for validation
- **Error boundaries** for graceful failures

---

**Last Updated:** January 2024  
**Codebase Status:** Production-ready backend, clean for new frontend design  
**Database Status:** Clean structure with nail categories, ready for products