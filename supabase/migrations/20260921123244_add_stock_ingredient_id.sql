ALTER TABLE public.recipes 
ADD COLUMN stock_ingredient_id uuid NULL REFERENCES public.ingredients(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_recipes_stock_ingredient_id ON public.recipes(stock_ingredient_id);
