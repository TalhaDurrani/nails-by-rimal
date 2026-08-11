# 🚀 Nails by Rimal Database Setup

## ⚡ TL;DR (Too Long; Didn't Read)

Your Supabase database is empty. Apply these 5 migrations in order:

1. `001_initial_schema.sql`
2. `002_auth_trigger.sql`
3. `003_seed_data.sql`
4. `004_rebuild_schema_for_nails.sql` ⭐ **THE FIX** (drops & recreates everything)
5. `005_seed_products_and_variants.sql`

**See `docs/QUICK_START_SUPABASE.md` for copy-paste instructions.**

---

## ✅ What You're About To Do

- **Migration 004** fixes the schema error you encountered
- **Migration 005** seeds 4 nail products + 144 variants
- **Result:** Your Supabase database will have a production-ready schema

---

## 📋 File Locations

```
supabase/migrations/
├── 001_initial_schema.sql          ← Run first
├── 002_auth_trigger.sql            ← Run second
├── 003_seed_data.sql               ← Run third
├── 004_rebuild_schema_for_nails.sql ← Run fourth ⭐ KEY FILE
└── 005_seed_products_and_variants.sql ← Run fifth

docs/
├── QUICK_START_SUPABASE.md         ← START HERE (5 min guide)
├── MIGRATION_STEPS.md              ← Detailed guide
├── FIX_EXPLAINED.md                ← Why it was broken
└── STATUS_REPORT.md                ← Full project status
```

---

## 🎯 Quick Start

### Option A: Dashboard (Easiest)
1. Open https://app.supabase.com
2. Go to **SQL Editor**
3. For each file (001 → 005):
   - New Query → Copy file → Paste → Run
4. Done!

### Option B: CLI (Faster)
```bash
supabase link --project-id YOUR_PROJECT_ID
supabase db push
```

**See `docs/QUICK_START_SUPABASE.md` for detailed steps.**

---

## ⚠️ Important Notes

- **Migration 004 is a complete rebuild** — It drops and recreates all tables to fix the schema
- **All your old data will be gone** — This is intentional (it was broken anyway)
- **No existing customer data at risk** — Your Supabase is empty
- **Fresh start recommended** — This is your chance to build it right

---

## ✨ What Gets Created

After all 5 migrations:

### Tables
- ✅ products (4 seed products)
- ✅ product_variants (144 total variants)
- ✅ shapes, lengths, finishes (variant options)
- ✅ orders (COD orders with guest checkout)
- ✅ order_items (items in orders)
- ✅ profiles (user accounts)
- ✅ carts, cart_items (shopping carts)
- ✅ categories, addresses, reviews

### Features
- ✅ Product variants (shape × length × finish)
- ✅ Stock per variant
- ✅ COD-only checkout
- ✅ Guest checkout (no account needed)
- ✅ Order numbers (NBR-XXXXX format)
- ✅ Pakistani addresses (7 provinces)
- ✅ Admin role system
- ✅ Full RLS security

---

## 🚨 If Something Goes Wrong

### Error: "Relation already exists"
Run cleanup SQL (see `docs/QUICK_START_SUPABASE.md`) then retry

### Error: "Foreign key constraint violation"
Make sure you're running migrations in exact order: 001 → 002 → 003 → 004 → 005

### Other errors?
See `docs/MIGRATION_STEPS.md` for troubleshooting

---

## ✅ Verify It Worked

After migrations complete:

1. **Check tables exist:**
   - Go to Supabase > **Table Editor**
   - Should see all 12 tables listed

2. **Check data:**
   - Click **products** → Should see 4 rows
   - Click **product_variants** → Should see 144 rows

3. **Test auth:**
   - Sign up at http://localhost:3000
   - Check Supabase > **Authentication > Users** → Your user exists
   - Check Supabase > **profiles** table → Your profile exists with `role = 'user'`

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| `QUICK_START_SUPABASE.md` | **Start here!** Step-by-step instructions |
| `MIGRATION_STEPS.md` | Detailed guide + troubleshooting |
| `FIX_EXPLAINED.md` | Why the schema was broken + what was fixed |
| `STATUS_REPORT.md` | Full project status + next steps |

---

## 🎯 Next After Migrations

Once migrations are applied to Supabase:

1. Build `/api/variants` endpoint (checkout needs it)
2. Build admin panel for product management
3. Build admin panel for variant options management
4. Add order confirmation emails
5. Deploy to production

---

## 💡 Key Concepts

### Product Variants System
- Each product has 36 variants (4 shapes × 3 lengths × 3 finishes)
- Stock is tracked **per variant**, not per product
- Price can be overridden **per variant**

### COD Checkout
- No payment gateway (Polar removed)
- Customers pay when order arrives
- Guests don't need to create account
- Order number auto-generated (NBR-XXXXX)

### Admin Control
- Variant options (shapes, lengths, finishes) are in database (not hardcoded)
- Admins can add, rename, or deactivate options anytime
- No code changes needed

---

## 🏁 You're Ready!

Next step: Open `docs/QUICK_START_SUPABASE.md` and follow the steps.

Takes about **5-10 minutes** to apply all migrations.

**After that, your database will be ready for production!** 🚀

---

## 📞 Questions?

- **Schema details:** See `docs/FIX_EXPLAINED.md`
- **Troubleshooting:** See `docs/MIGRATION_STEPS.md`
- **Project status:** See `docs/STATUS_REPORT.md`
- **General setup:** See `docs/SUPABASE_SETUP.md`

**Go to `docs/QUICK_START_SUPABASE.md` now! ➡️**
