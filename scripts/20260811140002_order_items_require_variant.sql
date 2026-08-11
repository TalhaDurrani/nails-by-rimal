-- Makes product_variant_id required on order_items. Every order line 
-- item must record exactly which variant was ordered — otherwise 
-- there's no way to know what to actually pack and ship.
--
-- Run query #2 in 00_inspect_before_migrating.sql FIRST.
--   - If it returned 0: safe to run this file as-is.
--   - If it returned rows > 0: STOP. You have order line items with 
--     no variant on record. Either figure out per-row what was 
--     actually ordered and UPDATE those rows, or if they're test 
--     data, DELETE those specific rows — then run this.

alter table public.order_items
  alter column product_variant_id set not null;
