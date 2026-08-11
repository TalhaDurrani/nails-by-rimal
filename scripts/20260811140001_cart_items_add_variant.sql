-- Adds product_variant_id to cart_items so a cart line item records 
-- exactly which shape/length/finish combination was selected. 
-- Right now cart_items only stores product_id, so the cart cannot 
-- tell "Rose Petal, Almond, Medium" apart from "Rose Petal, 
-- Stiletto, Long" — this is the fix.
--
-- ASSUMPTION: cart_items is pre-launch/test data, safe to clear.
-- Check query #1 in 00_inspect_before_migrating.sql first.
-- If that returned a count you actually care about (real customer 
-- carts), do NOT run the TRUNCATE below — instead add the column 
-- as nullable, backfill it row by row, then run 
-- "ALTER TABLE ... ALTER COLUMN product_variant_id SET NOT NULL" 
-- as a separate step once every row has a value.

truncate public.cart_items;

alter table public.cart_items
  add column product_variant_id integer not null
    references public.product_variants(id);

-- product_id on cart_items is now redundant (product_variants 
-- already links to products) but left in place — check whether 
-- your cart queries read it directly before removing it later.
