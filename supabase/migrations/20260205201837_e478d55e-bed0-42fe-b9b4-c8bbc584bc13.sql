-- Add location columns to products table for geographical search
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS latitude numeric,
ADD COLUMN IF NOT EXISTS longitude numeric,
ADD COLUMN IF NOT EXISTS seller_location text;