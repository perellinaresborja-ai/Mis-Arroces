-- Add custom_variety text column to recipes
ALTER TABLE public.recipes 
ADD COLUMN IF NOT EXISTS custom_variety TEXT;

-- Drop the insert policy on rice_varieties so regular users cannot insert global varieties
DROP POLICY IF EXISTS "Authenticated users can insert rice varieties" ON public.rice_varieties;
