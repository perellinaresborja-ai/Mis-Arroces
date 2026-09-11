-- 20260911221500_que_tengo_matching_rpc.sql
-- RPC for "¿Qué tengo?" feature: matching recipes by user available ingredients

CREATE OR REPLACE FUNCTION public.find_recipes_by_ingredients(
    p_user_ingredient_ids UUID[],
    p_only_exact BOOLEAN DEFAULT false
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    slug TEXT,
    author JSONB,
    cover_image TEXT,
    variety_name TEXT,
    style_name TEXT,
    total_relevant INT,
    match_count INT,
    missing_count INT,
    missing_ingredients TEXT[],
    match_pct INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_basic_ids UUID[];
BEGIN
    -- 1. Identify verified basic pantry ingredients dynamically by exact normalized name
    -- Only essential basics: sal, aceite de oliva virgen extra, aceite de girasol, agua, pimienta
    SELECT array_agg(i.id)
    INTO v_basic_ids
    FROM ingredients i
    WHERE i.normalized_name IN (
        'sal',
        'sal en escamas',
        'aceite de oliva virgen extra',
        'aceite de girasol',
        'agua',
        'pimienta negra',
        'pimienta blanca',
        'pimienta verde'
    );

    IF v_basic_ids IS NULL THEN
        v_basic_ids := '{}'::UUID[];
    END IF;

    -- 2. Query eligible published recipes and compute matching metrics
    RETURN QUERY
    WITH eligible_recipes AS (
        SELECT r.id AS recipe_id, r.name, r.slug, r.owner_id, r.variety_id, r.style_id
        FROM recipes r
        WHERE r.status = 'PUBLISHED'
          AND r.deleted_at IS NULL
          AND (r.scheduled_for IS NULL OR r.scheduled_for <= now())
    ),
    recipe_rel_ings AS (
        SELECT 
            er.recipe_id,
            ri.canonical_ingredient_id,
            COALESCE(ing.canonical_name, ri.display_text) AS ing_name,
            (ri.canonical_ingredient_id = ANY(p_user_ingredient_ids)) AS is_matched
        FROM eligible_recipes er
        JOIN recipe_ingredients ri ON ri.recipe_id = er.recipe_id
        LEFT JOIN ingredients ing ON ing.id = ri.canonical_ingredient_id
        -- Exclude basics from relevant recipe requirements
        WHERE ri.canonical_ingredient_id IS NULL OR NOT (ri.canonical_ingredient_id = ANY(v_basic_ids))
    ),
    recipe_metrics AS (
        SELECT 
            er.recipe_id,
            er.name AS r_name,
            er.slug AS r_slug,
            er.owner_id AS r_owner_id,
            er.variety_id AS r_variety_id,
            er.style_id AS r_style_id,
            COUNT(rri.canonical_ingredient_id)::INT AS total_relevant,
            COUNT(CASE WHEN rri.is_matched THEN 1 END)::INT AS match_count,
            COUNT(CASE WHEN NOT rri.is_matched THEN 1 END)::INT AS missing_count,
            COALESCE(
                array_agg(rri.ing_name ORDER BY rri.ing_name) FILTER (WHERE NOT rri.is_matched),
                '{}'::TEXT[]
            ) AS missing_ingredients
        FROM eligible_recipes er
        JOIN recipe_rel_ings rri ON rri.recipe_id = er.recipe_id
        GROUP BY er.recipe_id, er.name, er.slug, er.owner_id, er.variety_id, er.style_id
        HAVING COUNT(rri.canonical_ingredient_id) > 0
    ),
    calculated AS (
        SELECT 
            rm.recipe_id,
            rm.r_name,
            rm.r_slug,
            rm.r_owner_id,
            rm.r_variety_id,
            rm.r_style_id,
            rm.total_relevant,
            rm.match_count,
            rm.missing_count,
            rm.missing_ingredients,
            ROUND((rm.match_count::NUMERIC / rm.total_relevant::NUMERIC) * 100)::INT AS match_pct
        FROM recipe_metrics rm
        WHERE rm.match_count > 0 -- At least 1 relevant ingredient matched
          AND (
              -- If p_only_exact is true, missing_count MUST be 0
              (p_only_exact AND rm.missing_count = 0)
              OR
              -- Otherwise, apply deterministic relevance threshold:
              -- (missing_count = 0) OR (match_pct >= 25%) OR (match_count >= 2)
              (NOT p_only_exact AND (
                  rm.missing_count = 0
                  OR (ROUND((rm.match_count::NUMERIC / rm.total_relevant::NUMERIC) * 100)::INT >= 25)
                  OR rm.match_count >= 2
              ))
          )
    )
    SELECT 
        c.recipe_id AS id,
        c.r_name AS name,
        c.r_slug AS slug,
        jsonb_build_object(
            'id', p.id,
            'username', p.username,
            'display_name', p.display_name,
            'avatar_path', ma_p.storage_path
        ) AS author,
        ma_r.storage_path AS cover_image,
        rv.name AS variety_name,
        rs.name AS style_name,
        c.total_relevant,
        c.match_count,
        c.missing_count,
        c.missing_ingredients,
        c.match_pct
    FROM calculated c
    LEFT JOIN profiles p ON p.id = c.r_owner_id
    LEFT JOIN media_assets ma_p ON ma_p.id = p.avatar_media_id
    LEFT JOIN LATERAL (
        SELECT ma.storage_path
        FROM recipe_media rm_sub
        JOIN media_assets ma ON ma.id = rm_sub.media_id
        WHERE rm_sub.recipe_id = c.recipe_id
        ORDER BY rm_sub.is_primary DESC, rm_sub.display_order ASC
        LIMIT 1
    ) ma_r ON true
    LEFT JOIN rice_varieties rv ON rv.id = c.r_variety_id
    LEFT JOIN rice_styles rs ON rs.id = c.r_style_id
    ORDER BY 
        c.missing_count ASC,
        c.match_pct DESC,
        c.match_count DESC,
        c.r_name ASC;
END;
$$;

-- Grant execution to public / authenticated / anon
GRANT EXECUTE ON FUNCTION public.find_recipes_by_ingredients(UUID[], BOOLEAN) TO anon, authenticated, service_role;
