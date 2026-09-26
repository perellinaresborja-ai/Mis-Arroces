-- Migration: 20260926190000_fix_recipe_delete_rls.sql
-- Fix RLS policy on recipes so owners can soft-delete (set deleted_at) or hard-delete without policy violation

DROP POLICY IF EXISTS "Users can update own recipes" ON public.recipes;
CREATE POLICY "Users can update own recipes" ON public.recipes
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete own recipes" ON public.recipes;
CREATE POLICY "Users can delete own recipes" ON public.recipes
  FOR DELETE
  USING (auth.uid() = owner_id);
