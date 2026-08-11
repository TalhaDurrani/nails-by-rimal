-- ============================================================
-- RUN THIS FIRST. It only reads data — nothing here changes 
-- anything. Paste into the Supabase SQL Editor, run each query, 
-- and note the results before applying any migration file.
-- ============================================================

-- 1. Does cart_items have any real rows? (cart_items is transient 
--    session data — if this is 0 or just test junk, migration 01 
--    can safely wipe it before adding the required variant column)
select count(*) as cart_items_row_count from public.cart_items;

-- 2. Any order_items rows with no variant on record? These orders 
--    don't know exactly what was ordered — a real problem if > 0.
select count(*) as order_items_missing_variant
from public.order_items
where product_variant_id is null;

-- 3. Any duplicate variant combinations in product_variants? 
--    Should return 0 rows. If it returns rows, migration 03 will 
--    fail until you delete the extra duplicate(s) per group.
select product_id, shape_id, length_id, finish_id, count(*)
from public.product_variants
group by product_id, shape_id, length_id, finish_id
having count(*) > 1;

-- 4. Is the addresses table actually used anywhere yet?
select count(*) as addresses_row_count from public.addresses;
select count(*) as orders_using_shipping_address_id
from public.orders
where shipping_address_id is not null;

-- 5. What are the REAL order_status enum values? (the docs you had 
--    disagreed with each other — this is the ground truth)
select enumlabel
from pg_enum
join pg_type on pg_enum.enumtypid = pg_type.oid
where pg_type.typname = 'order_status'
order by enumsortorder;

-- 6. Current RLS policies on orders and order_items — specifically 
--    check the "roles" column for each INSERT policy. If "anon" 
--    never appears for an INSERT policy, true guests (not logged 
--    in) currently cannot place an order.
select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where tablename in ('orders', 'order_items')
order by tablename, cmd;
