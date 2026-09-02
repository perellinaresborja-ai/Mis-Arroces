-- ==========================================
-- BADGE ENGINE V1 - TRIGGERS & PROGRESS
-- ==========================================

-- 1. ADD target_value TO badge_definitions
ALTER TABLE public.badge_definitions ADD COLUMN IF NOT EXISTS target_value INTEGER;

UPDATE public.badge_definitions SET target_value = 1 WHERE id = 'COOK_1';
UPDATE public.badge_definitions SET target_value = 10 WHERE id = 'COOK_10';
UPDATE public.badge_definitions SET target_value = 25 WHERE id = 'COOK_25';
UPDATE public.badge_definitions SET target_value = 50 WHERE id = 'COOK_50';
UPDATE public.badge_definitions SET target_value = 100 WHERE id = 'COOK_100';
UPDATE public.badge_definitions SET target_value = 250 WHERE id = 'COOK_250';
UPDATE public.badge_definitions SET target_value = 500 WHERE id = 'COOK_500';
UPDATE public.badge_definitions SET target_value = 2 WHERE id = 'FIRST_REPEAT';
UPDATE public.badge_definitions SET target_value = 5 WHERE id = 'REPEAT_5';
UPDATE public.badge_definitions SET target_value = 10 WHERE id = 'REPEAT_10';
UPDATE public.badge_definitions SET target_value = 3 WHERE id IN ('EXPLORER_STYLES_3', 'EXPLORER_VARIETIES_3', 'EXPLORER_HEAT_3');
UPDATE public.badge_definitions SET target_value = 1 WHERE id = 'CREATOR_FIRST_RECIPE';
UPDATE public.badge_definitions SET target_value = 1 WHERE id = 'CREATOR_COOKED_1';
UPDATE public.badge_definitions SET target_value = 10 WHERE id = 'CREATOR_COOKED_10';
UPDATE public.badge_definitions SET target_value = 50 WHERE id = 'CREATOR_COOKED_50';
UPDATE public.badge_definitions SET target_value = 1 WHERE id = 'ANNIVERSARY_1_YEAR';
UPDATE public.badge_definitions SET target_value = 2 WHERE id = 'ANNIVERSARY_2_YEARS';
UPDATE public.badge_definitions SET target_value = 5 WHERE id = 'ANNIVERSARY_5_YEARS';

-- 2. DYNAMIC PROGRESS EVALUATION (RPC)
CREATE OR REPLACE FUNCTION public.get_user_badge_progress(p_user_id UUID)
RETURNS TABLE (
    badge_id VARCHAR,
    name VARCHAR,
    category public.badge_category_enum,
    is_earned BOOLEAN,
    current_value INTEGER,
    target_value INTEGER,
    progress_percentage NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$$
DECLARE
    v_total_cooks INT;
    v_max_repeats INT;
    v_unique_styles INT;
    v_unique_varieties INT;
    v_unique_heats INT;
    v_total_published INT;
    v_community_cooks INT;
    v_years_active NUMERIC;
BEGIN
    IF auth.uid() != p_user_id AND (current_setting('role', true) IS NULL OR current_setting('role', true) != 'service_role') THEN
        RAISE EXCEPTION 'Unauthorized to view progress of another user';
    END IF;

    SELECT COUNT(*) INTO v_total_cooks FROM public.cooking_sessions WHERE user_id = p_user_id AND status = 'COMPLETED';
    
    SELECT COALESCE(MAX(cnt), 0) INTO v_max_repeats FROM (SELECT COUNT(*) as cnt FROM public.cooking_sessions WHERE user_id = p_user_id AND status = 'COMPLETED' GROUP BY recipe_id) t;

    SELECT COUNT(DISTINCT r.style_id) INTO v_unique_styles FROM public.cooking_sessions cs JOIN public.recipes r ON cs.recipe_id = r.id WHERE cs.user_id = p_user_id AND cs.status = 'COMPLETED' AND r.style_id IS NOT NULL;
    SELECT COUNT(DISTINCT cs.rice_variety_id) INTO v_unique_varieties FROM public.cooking_sessions cs WHERE cs.user_id = p_user_id AND cs.status = 'COMPLETED' AND cs.rice_variety_id IS NOT NULL;
    SELECT COUNT(DISTINCT cs.heat_source) INTO v_unique_heats FROM public.cooking_sessions cs WHERE cs.user_id = p_user_id AND cs.status = 'COMPLETED' AND cs.heat_source IS NOT NULL;

    SELECT COUNT(*) INTO v_total_published FROM public.recipes WHERE owner_id = p_user_id AND status = 'PUBLISHED';
    SELECT COUNT(DISTINCT cs.user_id) INTO v_community_cooks FROM public.cooking_sessions cs JOIN public.recipes r ON cs.recipe_id = r.id WHERE r.owner_id = p_user_id AND cs.status = 'COMPLETED' AND cs.user_id != p_user_id;

    SELECT EXTRACT(EPOCH FROM (NOW() - created_at)) / 31536000.0 INTO v_years_active FROM public.profiles WHERE id = p_user_id;

    RETURN QUERY
    WITH stats AS (
        SELECT bd.id as badge_id, bd.name, bd.category, bd.target_value,
        CASE
            WHEN bd.id LIKE 'COOK_%' THEN v_total_cooks
            WHEN bd.id IN ('FIRST_REPEAT', 'REPEAT_5', 'REPEAT_10') THEN v_max_repeats
            WHEN bd.id = 'EXPLORER_STYLES_3' THEN v_unique_styles
            WHEN bd.id = 'EXPLORER_VARIETIES_3' THEN v_unique_varieties
            WHEN bd.id = 'EXPLORER_HEAT_3' THEN v_unique_heats
            WHEN bd.id = 'CREATOR_FIRST_RECIPE' THEN v_total_published
            WHEN bd.id LIKE 'CREATOR_COOKED_%' THEN v_community_cooks
            WHEN bd.id = 'ANNIVERSARY_1_YEAR' THEN LEAST(FLOOR(v_years_active), 1)::INT
            WHEN bd.id = 'ANNIVERSARY_2_YEARS' THEN LEAST(FLOOR(v_years_active), 2)::INT
            WHEN bd.id = 'ANNIVERSARY_5_YEARS' THEN LEAST(FLOOR(v_years_active), 5)::INT
            ELSE 0
        END as current_val
        FROM public.badge_definitions bd
        WHERE bd.type = 'TRAJECTORY' AND bd.target_value IS NOT NULL
    )
    SELECT 
        s.badge_id,
        s.name,
        s.category,
        EXISTS(SELECT 1 FROM public.user_badges ub WHERE ub.user_id = p_user_id AND ub.badge_id = s.badge_id) as is_earned,
        LEAST(s.current_val, s.target_value) as current_value,
        s.target_value,
        ROUND((LEAST(s.current_val, s.target_value)::NUMERIC / s.target_value) * 100, 2) as progress_percentage
    FROM stats s;
END;
$$$;

-- 3. TRIGGERS FOR AUTOMATIC EVALUATION
-- Trigger function for when a user cooks a recipe (evaluates cook and recipe owner)
CREATE OR REPLACE FUNCTION public.trigger_evaluate_badges_on_cook()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$$
DECLARE
    v_recipe_owner UUID;
BEGIN
    -- Only run evaluation if status becomes COMPLETED
    IF NEW.status = 'COMPLETED' AND (OLD.status IS DISTINCT FROM 'COMPLETED') THEN
        -- Evaluate the user who cooked
        PERFORM public.evaluate_user_badges(NEW.user_id);
        
        -- Find the recipe creator to evaluate them too (creator milestones)
        SELECT owner_id INTO v_recipe_owner FROM public.recipes WHERE id = NEW.recipe_id;
        IF v_recipe_owner IS NOT NULL AND v_recipe_owner != NEW.user_id THEN
            PERFORM public.evaluate_user_badges(v_recipe_owner);
        END IF;
    END IF;
    RETURN NEW;
END;
$$$;

-- Attach trigger to cooking_sessions
DROP TRIGGER IF EXISTS evaluate_badges_on_cook_trigger ON public.cooking_sessions;
CREATE TRIGGER evaluate_badges_on_cook_trigger
AFTER UPDATE ON public.cooking_sessions
FOR EACH ROW
EXECUTE FUNCTION public.trigger_evaluate_badges_on_cook();

-- Trigger function for when a user publishes a recipe
CREATE OR REPLACE FUNCTION public.trigger_evaluate_badges_on_publish()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$$
BEGIN
    -- Only run evaluation if status becomes PUBLISHED
    IF NEW.status = 'PUBLISHED' AND (OLD.status IS DISTINCT FROM 'PUBLISHED') THEN
        IF NEW.owner_id IS NOT NULL THEN
            PERFORM public.evaluate_user_badges(NEW.owner_id);
        END IF;
    END IF;
    RETURN NEW;
END;
$$$;

-- Attach trigger to recipes
DROP TRIGGER IF EXISTS evaluate_badges_on_publish_trigger ON public.recipes;
CREATE TRIGGER evaluate_badges_on_publish_trigger
AFTER UPDATE ON public.recipes
FOR EACH ROW
EXECUTE FUNCTION public.trigger_evaluate_badges_on_publish();

REVOKE EXECUTE ON FUNCTION public.get_user_badge_progress(UUID) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_user_badge_progress(UUID) TO authenticated;
