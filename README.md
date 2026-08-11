# 💅 Nails by Rimal - E-Commerce Platform

A specialized e-commerce platform for **Nails by Rimal**, a handmade press-on nail business in Pakistan. Built with Next.js 14, Supabase, and TypeScript.

## 🎯 Business Overview

**Nails by Rimal** creates beautiful handcrafted press-on nails with:
- Multiple shapes: Almond, Coffin, Square, Stiletto  
- Different lengths: Short, Medium, Long
- Various finishes: Custom colors and designs
- Pakistani market focus with COD payment
- Guest checkout for easy ordering

## ✨ Features

- 🛍️ **Product Catalog**: Browse press-on nail collections
- 🎨 **Variant System**: Choose shape, length, and finish combinations
- 💰 **Cash on Delivery**: COD payment for Pakistani customers
- 🛒 **Guest Checkout**: Order without creating account
- 📱 **Mobile Responsive**: Optimized for mobile shopping
- 👑 **Admin Panel**: Manage products, orders, and inventory
- 🔐 **Secure Authentication**: User accounts with role-based access
- 📦 **Order Tracking**: Order status management

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **UI Components**: Shadcn/UI, Radix UI
- **State Management**: TanStack Query, Context API
- **Styling**: Tailwind CSS, CSS Variables
- **Payment**: Cash on Delivery (COD)

## 🚀 Quick Start

1. **Clone & Install**
   ```bash
   git clone https://github.com/TalhaDurrani/nails-by-rimal.git
   cd nails-by-rimal
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Add your Supabase credentials
   ```

3. **Database Setup**
   - Run migrations in `supabase/migrations/` in Supabase Dashboard
   - Database will be clean and ready for nail products

4. **Start Development**
   ```bash
   npm run dev
   ```

## 📊 Database Structure

**14 Tables** including:
- **Products & Variants**: Flexible variant system (shape × length × finish)
- **Orders & Items**: COD orders with guest checkout support  
- **Categories**: Press-On Nails, Accessories, Gift Sets, Seasonal
- **Cart System**: Persistent for users, localStorage for guests
- **User Management**: Profiles with admin/customer roles

## 🔐 Security Features

- **Row Level Security (RLS)** policies on all tables
- **Role-based access control** (Admin vs Customer vs Guest)
- **Input validation** with TypeScript and Zod schemas
- **Server-side price calculation** (never trust client prices)

## 🌟 Business Logic

### Product Variants
- Each nail set has multiple combinations
- Stock tracked per specific variant
- Dynamic pricing based on complexity
- SKU generation: `NBR-[PRODUCT]-[SHAPE]-[LENGTH]`

### Order Processing
1. **Cart Management** (Database or localStorage)
2. **Guest/User Checkout** with Pakistani address format
3. **COD Order Creation** with phone verification
4. **Admin Order Management** through dashboard

## 🔄 Development Status

- ✅ **Backend**: Complete and production-ready
- ✅ **Database**: Clean nail business structure  
- ✅ **Authentication**: Working with guest checkout
- ✅ **API**: All endpoints connected to Supabase
- 🔄 **Frontend**: Ready for new design implementation

## 📁 Project Structure

```
src/
├── app/                 # Next.js 14 App Router
│   ├── (auth)/         # Authentication pages
│   ├── admin/          # Admin dashboard
│   ├── api/            # API endpoints
│   └── cart/           # Shopping cart
├── components/         # Reusable UI components
├── services/           # Business logic & API calls
├── hooks/              # Custom React hooks
├── context/            # Global state management
└── types/              # TypeScript type definitions
```

## 🎨 Ready for New Design

The codebase is **clean and ready** for your new frontend design:
- All backend services working with Supabase
- Clean database with nail business structure
- No hardcoded data or old electronics/clothing references
- Flexible component architecture for easy styling

## 🤖 AI Development

See **[AI_CODEBASE_GUIDE.md](./AI_CODEBASE_GUIDE.md)** for comprehensive AI assistant guidelines including:
- Complete codebase understanding
- Database schema details  
- Business logic patterns
- Development best practices

## 📝 License

Private project for Nails by Rimal business.

---

**Ready for your new design!** 🎨✨