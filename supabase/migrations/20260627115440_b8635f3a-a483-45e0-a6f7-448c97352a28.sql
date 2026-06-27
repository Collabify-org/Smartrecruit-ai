ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS company_name text,
  ADD COLUMN IF NOT EXISTS notif_product boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notif_weekly boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notif_billing boolean NOT NULL DEFAULT true;