-- payment_id was used by the old Polar payment integration. Now that 
-- checkout is COD-only, it's dead weight. Low priority, but safe and 
-- one line — drop it whenever.

alter table public.orders
  drop column if exists payment_id;
