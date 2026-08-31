-- 20260831000003_ingredient_expansion.sql

-- 1. Add metadata columns to ingredients
ALTER TABLE public.ingredients 
ADD COLUMN IF NOT EXISTS nutrition_source TEXT,
ADD COLUMN IF NOT EXISTS source_food_id TEXT,
ADD COLUMN IF NOT EXISTS nutrition_updated_at TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS nutrition_quality TEXT DEFAULT 'UNKNOWN' CHECK (nutrition_quality IN ('EXACT', 'REFERENCE', 'ESTIMATED', 'UNKNOWN'));

-- 2. Create unmatched_ingredients table for auto-growth
CREATE TABLE IF NOT EXISTS public.unmatched_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_text TEXT NOT NULL UNIQUE,
    normalized_text TEXT NOT NULL,
    frequency_count INT NOT NULL DEFAULT 1,
    first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for unmatched_ingredients
ALTER TABLE public.unmatched_ingredients ENABLE ROW LEVEL SECURITY;

-- Allow anyone (or authenticated users) to insert/update unmatched_ingredients, but restrict deletes to admins
CREATE POLICY "Anyone can insert unmatched" ON public.unmatched_ingredients FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update unmatched" ON public.unmatched_ingredients FOR UPDATE USING (true);
CREATE POLICY "Anyone can select unmatched" ON public.unmatched_ingredients FOR SELECT USING (true);

