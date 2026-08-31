-- 20260831000000_nutrition_sugar_fat.sql

ALTER TABLE public.ingredients
ADD COLUMN IF NOT EXISTS sugar_g_per_100 NUMERIC,
ADD COLUMN IF NOT EXISTS saturated_fat_g_per_100 NUMERIC;
