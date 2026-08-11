-- Prevents two rows existing for the same product+shape+length+finish 
-- combination — without this, stock for one "real" variant can end 
-- up silently split across two rows, and the admin dropdown has no 
-- way to know which one is the "correct" one.
--
-- Run query #3 in 00_inspect_before_migrating.sql FIRST.
--   - If it returned 0 rows: safe to run this file as-is.
--   - If it returned duplicates: for each group, decide which row 
--     to keep (e.g. the one with real stock_quantity/price_override 
--     set), delete the other(s), then run this.

alter table public.product_variants
  add constraint product_variants_unique_combo
    unique (product_id, shape_id, length_id, finish_id);
