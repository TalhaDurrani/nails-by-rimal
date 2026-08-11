-- orders currently only has a single "total" column — no way to 
-- show an itemized "Subtotal / Shipping / Total" breakdown anywhere 
-- (confirmation page, admin view, etc). This adds both, and backfills 
-- existing rows by assuming their current total was 100% subtotal 
-- with Rs 0 shipping. Adjust the backfill values manually afterward 
-- if any existing test orders actually had a shipping fee baked in.

alter table public.orders
  add column subtotal numeric not null default 0,
  add column shipping_fee numeric not null default 0;

update public.orders
  set subtotal = total, shipping_fee = 0
  where subtotal = 0 and total > 0;

-- Going forward: your checkout code must compute subtotal 
-- server-side from real product_variants prices × quantities, add 
-- shipping_fee, and store that sum as total. Never accept a 
-- subtotal or total sent directly from the client/browser.
