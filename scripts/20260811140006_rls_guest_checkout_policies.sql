-- Guest checkout requires the Postgres "anon" role (a real visitor 
-- who never logs in) to be allowed to INSERT into orders and 
-- order_items. This file ONLY ADDS insert policies — it does not 
-- touch or remove any existing SELECT/UPDATE/DELETE policies you 
-- already have. Compare against query #6 in 
-- 00_inspect_before_migrating.sql: if "anon" already appears on an 
-- INSERT policy for these tables, you may not need this file at all.

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Guests (not logged in): can create an order, but ONLY as long as 
-- it isn't attached to somebody else's account.
drop policy if exists "guests can create orders" on public.orders;
create policy "guests can create orders"
  on public.orders
  for insert
  to anon
  with check (user_id is null);

-- Logged-in users: can create an order, but only attached to their 
-- own account (can't set user_id to someone else's id).
drop policy if exists "users can create their own orders" on public.orders;
create policy "users can create their own orders"
  on public.orders
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- order_items has no direct user_id — it's only allowed in if the 
-- order it's attached to was legitimately just created above 
-- (either a guest order, or the current user's own order).
drop policy if exists "order items follow their parent order" on public.order_items;
create policy "order items follow their parent order"
  on public.order_items
  for insert
  to anon, authenticated
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.user_id is null or o.user_id = auth.uid())
    )
  );

-- If inserts still fail with a permissions error (not an RLS 
-- rejection) after this, double-check the anon/authenticated roles 
-- actually have base INSERT grants on these tables at the Postgres 
-- level, not just RLS policies — Supabase usually sets this up 
-- automatically, but worth a quick check in Table Editor > Policies.
