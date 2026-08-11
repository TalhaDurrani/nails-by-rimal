-- DO NOT RUN YET.
--
-- addresses uses different field names (zip_code, state, country) 
-- than the Pakistan-specific fields already snapshotted on orders 
-- (address_postal_code, address_province — which has a working 
-- is_valid_pakistani_province() check). Run query #4 in 
-- 00_inspect_before_migrating.sql first, then pick ONE option below.

-- ============================================================
-- OPTION A — addresses is unused right now / you don't need a 
-- "saved addresses" feature yet. Drop it and the dangling FK.
-- ============================================================

-- alter table public.orders drop column if exists shipping_address_id;
-- drop table if exists public.addresses;

-- ============================================================
-- OPTION B — you DO want logged-in customers to save/reuse an 
-- address at checkout. Bring it in line with the orders table 
-- instead of dropping it.
-- ============================================================

-- alter table public.addresses rename column zip_code to postal_code;
-- alter table public.addresses rename column state to province;
-- alter table public.addresses
--   add constraint addresses_province_check
--   check (is_valid_pakistani_province(province));
-- alter table public.addresses drop column if exists country;  -- always Pakistan, redundant
