-- Migration: Discovery & Shopping List V1

-- 1. SHOPPING LISTS
CREATE TABLE IF NOT EXISTS public.shopping_lists (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Mi compra',
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their shopping lists" ON public.shopping_lists FOR ALL USING (
  auth.uid() = user_id
) WITH CHECK (
  auth.uid() = user_id
);

-- 2. SHOPPING LIST ITEMS
CREATE TABLE IF NOT EXISTS public.shopping_list_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id uuid NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
  ingredient_name text NOT NULL,
  quantity numeric,
  unit_id uuid REFERENCES public.units(id) ON DELETE SET NULL,
  is_checked boolean NOT NULL DEFAULT false,
  recipe_id uuid REFERENCES public.recipes(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their shopping items" ON public.shopping_list_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.shopping_lists WHERE shopping_lists.id = list_id AND shopping_lists.user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.shopping_lists WHERE shopping_lists.id = list_id AND shopping_lists.user_id = auth.uid())
);

-- 3. RPC: GET MOST COOKED RECIPES
-- Devuelve recetas con mas sesiones de cocinado PUBLICAS y PUBLICADAS
CREATE OR REPLACE FUNCTION public.get_most_cooked_recipes(time_filter text DEFAULT 'all_time', limit_val int DEFAULT 10)
RETURNS TABLE (
  recipe_id uuid,
  cook_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cs.recipe_id,
    COUNT(cs.id) as cook_count
  FROM public.cooking_sessions cs
  WHERE cs.status = 'PUBLISHED' 
    AND cs.visibility = 'PUBLIC'
    AND (
      time_filter = 'all_time' OR
      (time_filter = 'week' AND cs.published_at >= (now() - interval '7 days')) OR
      (time_filter = 'month' AND cs.published_at >= (now() - interval '30 days'))
    )
  GROUP BY cs.recipe_id
  ORDER BY cook_count DESC
  LIMIT limit_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. RPC: GET TRENDING RECIPES
-- Score basado en ultimos 7 dias: 
-- Cooking Session (5), Comment (3) [NO TENEMOS COMMENTS INDEPENDIENTES, EN COMMENTS SON RECIPE_COMMENTS], Save (2), Like (1)
CREATE OR REPLACE FUNCTION public.get_trending_recipes(limit_val int DEFAULT 10)
RETURNS TABLE (
  recipe_id uuid,
  trend_score numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH recent_sessions AS (
    SELECT cs.recipe_id, COUNT(*) * 5 AS score
    FROM public.cooking_sessions cs
    WHERE cs.published_at >= (now() - interval '7 days')
      AND cs.status = 'PUBLISHED' AND cs.visibility = 'PUBLIC'
    GROUP BY cs.recipe_id
  ),
  recent_saves AS (
    SELECT sr.recipe_id, COUNT(*) * 2 AS score
    FROM public.saved_recipes sr
    WHERE sr.created_at >= (now() - interval '7 days')
    GROUP BY sr.recipe_id
  ),
  recent_likes AS (
    SELECT l.recipe_id, COUNT(*) * 1 AS score
    FROM public.recipe_likes l
    WHERE l.created_at >= (now() - interval '7 days')
    GROUP BY l.recipe_id
  ),
  recent_comments AS (
    SELECT c.recipe_id, COUNT(*) * 3 AS score
    FROM public.recipe_comments c
    WHERE c.created_at >= (now() - interval '7 days')
    GROUP BY c.recipe_id
  )
  SELECT 
    r.id AS recipe_id,
    COALESCE(s.score, 0) + COALESCE(sv.score, 0) + COALESCE(l.score, 0) + COALESCE(c.score, 0) AS trend_score
  FROM public.recipes r
  LEFT JOIN recent_sessions s ON s.recipe_id = r.id
  LEFT JOIN recent_saves sv ON sv.recipe_id = r.id
  LEFT JOIN recent_likes l ON l.recipe_id = r.id
  LEFT JOIN recent_comments c ON c.recipe_id = r.id
  WHERE r.status = 'PUBLISHED' AND r.visibility = 'PUBLIC'
  ORDER BY trend_score DESC, r.published_at DESC
  LIMIT limit_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
