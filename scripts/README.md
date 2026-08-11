# Nails by Rimal — Supabase schema fixes

Before running anything: **take a backup / confirm you have point-in-time
recovery** on your Supabase project. These are `ALTER`/`DROP` statements
against a real database — cheap insurance if anything goes sideways.

## How to run these

Easiest option: open your Supabase project → **SQL Editor** → paste each
file's contents → Run, one file at a time, in order.

If you're using the Supabase CLI with local migrations instead, just move
the timestamped files into your `supabase/migrations/` folder and run
`supabase db push`.

## Order of operations

1. **`00_inspect_before_migrating.sql`** — read-only, run every query,
   note the results. This tells you whether the numbered migrations
   below can run as-is or need a tweak first.

2. **`20260811140001` → `20260811140006`** — run in numeric order.
   Each file's top comment says exactly what to check beforehand and
   what to do if the inspection query came back non-empty.

3. **`needs_review_products_legacy_columns.sql`** — don't run directly.
   Do the `grep` search described inside it first, then uncomment
   only what's actually safe.

4. **`needs_review_addresses_decision.sql`** — don't run directly.
   Pick Option A or B based on whether you're actually using saved
   addresses anywhere yet, then uncomment just that option.

5. After all of the above, **test guest checkout end-to-end** — place
   a test order while logged out. That's the one migration (06) fixing
   something that won't show up as an error until a real guest tries
   to check out.

## What's intentionally NOT included

- Fixing the frontend/API code that reads `orders`/`cart_items` — these
  files only fix the database. Your checkout and cart logic in Next.js
  still needs to be updated to actually send `product_variant_id` once
  the column exists.
- SELECT/UPDATE/DELETE RLS policies for orders — file `06` only adds
  the INSERT policies needed for guest checkout. If query #6 in the
  inspect file shows other gaps, tell me and I'll write those too.
