-- ==========================================
-- SHADOW PERSONALIZATION ENGINE V1 - FIXES
-- ==========================================

-- 1. FIX COOKING SCORE (MATHEMATICALLY CORRECT)
CREATE OR REPLACE VIEW public.shadow_recipe_cooking_scores AS
SELECT 
    recipe_id,
    COUNT(user_id) as unique_cooks,
    SUM(total_cooks) as total_cooks,
    SUM(CASE WHEN repeat_count > 0 THEN 1 ELSE 0 END) as users_repeated,
    COALESCE(AVG(average_rating), 0) as average_rating,
    COALESCE(SUM(CASE WHEN repeat_count > 0 THEN 1 ELSE 0 END)::NUMERIC / NULLIF(COUNT(user_id), 0), 0) as repeat_ratio
FROM public.shadow_repeat_cooks
GROUP BY recipe_id;


-- 2. COMPLETE TASTE PROFILE V1 WITH WEIGHTS & SECURITY
CREATE OR REPLACE FUNCTION public.get_shadow_taste_profile(p_user_id UUID, p_version TEXT DEFAULT 'taste-profile-v1')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$$
DECLARE
    result JSONB;
BEGIN
    -- SECURITY: Only the user can check their own taste profile
    IF auth.uid() != p_user_id THEN
        RAISE EXCEPTION 'Unauthorized to view this taste profile';
    END IF;

    WITH user_signals AS (
        -- High signal: Cooks and Repeats
        SELECT 
            cs.recipe_id, 
            cs.heat_source,
            r.style_id,
            r.variety_id,
            CASE 
                WHEN rc.repeat_count > 0 THEN 50
                WHEN cs.rating >= 4 THEN 40
                ELSE 20 
            END as weight
        FROM public.cooking_sessions cs
        JOIN public.recipes r ON cs.recipe_id = r.id
        LEFT JOIN public.shadow_repeat_cooks rc ON cs.user_id = rc.user_id AND cs.recipe_id = rc.recipe_id
        WHERE cs.user_id = p_user_id AND cs.status = 'COMPLETED'
        
        UNION ALL
        
        -- Lower signal: Analytics events (saves, reactions, views)
        SELECT 
            e.entity_id::uuid as recipe_id,
            NULL as heat_source,
            r.style_id,
            r.variety_id,
            CASE e.event_type
                WHEN 'save' THEN 15
                WHEN 'reaction' THEN 3
                WHEN 'comment' THEN 5
                WHEN 'view' THEN 1
                ELSE 0
            END as weight
        FROM public.analytics_events e
        JOIN public.recipes r ON e.entity_id::uuid = r.id
        WHERE e.actor_id = p_user_id AND e.entity_type = 'recipe'
    ),
    aggregated_signals AS (
        SELECT 
            heat_source,
            style_id,
            variety_id,
            SUM(weight) as total_weight
        FROM user_signals
        GROUP BY heat_source, style_id, variety_id
    ),
    heat_aggs AS (
        SELECT heat_source, SUM(total_weight) as score FROM aggregated_signals WHERE heat_source IS NOT NULL GROUP BY heat_source ORDER BY score DESC LIMIT 3
    ),
    style_aggs AS (
        SELECT rs.name as style_name, SUM(a.total_weight) as score 
        FROM aggregated_signals a 
        JOIN public.rice_styles rs ON a.style_id = rs.id 
        GROUP BY rs.name ORDER BY score DESC LIMIT 3
    ),
    variety_aggs AS (
        SELECT rv.name as variety_name, SUM(a.total_weight) as score 
        FROM aggregated_signals a 
        JOIN public.rice_varieties rv ON a.variety_id = rv.id 
        GROUP BY rv.name ORDER BY score DESC LIMIT 3
    ),
    stats AS (
        SELECT 
            COUNT(DISTINCT recipe_id) as sample_size,
            CASE 
                WHEN COUNT(DISTINCT recipe_id) < 3 THEN 'low'
                WHEN COUNT(DISTINCT recipe_id) < 10 THEN 'medium'
                ELSE 'high'
            END as confidence
        FROM user_signals WHERE weight >= 20 -- only count actual cooks for sample size confidence
    )
    SELECT jsonb_build_object(
        'version', p_version,
        'sample_size', COALESCE((SELECT sample_size FROM stats), 0),
        'confidence', COALESCE((SELECT confidence FROM stats), 'low'),
        'top_heat_sources', COALESCE((SELECT jsonb_agg(row_to_json(h)) FROM heat_aggs h), '[]'::jsonb),
        'top_styles', COALESCE((SELECT jsonb_agg(row_to_json(s)) FROM style_aggs s), '[]'::jsonb),
        'top_varieties', COALESCE((SELECT jsonb_agg(row_to_json(v)) FROM variety_aggs v), '[]'::jsonb),
        'top_ingredients', 'DEFERRED'
    ) INTO result;
    
    RETURN COALESCE(result, '{}'::jsonb);
END;
$$$;


-- 3. SECURE USER AFFINITY
CREATE OR REPLACE FUNCTION public.get_shadow_user_affinity(p_viewer_id UUID, p_target_id UUID, p_version TEXT DEFAULT 'ranking-v1')
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$$
DECLARE
    affinity_score NUMERIC := 0;
    config JSONB;
BEGIN
    IF auth.uid() != p_viewer_id THEN
        RAISE EXCEPTION 'Unauthorized to calculate affinity on behalf of another user';
    END IF;

    SELECT affinity_weights INTO config FROM public.shadow_ranking_config WHERE version_id = p_version;
    IF config IS NULL THEN RETURN 0; END IF;

    IF EXISTS (SELECT 1 FROM public.follows WHERE follower_id = p_viewer_id AND following_id = p_target_id) THEN
        affinity_score := affinity_score + COALESCE((config->>'follow')::NUMERIC, 10.0);
    END IF;

    affinity_score := affinity_score + (
        SELECT COUNT(*) * COALESCE((config->>'reaction')::NUMERIC, 1.0)
        FROM public.analytics_events 
        WHERE actor_id = p_viewer_id AND owner_id = p_target_id AND event_type = 'reaction'
    );
    
    affinity_score := affinity_score + (
        SELECT COUNT(*) * COALESCE((config->>'comment')::NUMERIC, 3.0)
        FROM public.analytics_events 
        WHERE actor_id = p_viewer_id AND owner_id = p_target_id AND event_type = 'comment'
    );

    affinity_score := affinity_score + (
        SELECT COUNT(*) * COALESCE((config->>'cook_recipe')::NUMERIC, 10.0)
        FROM public.cooking_sessions cs
        JOIN public.recipes r ON cs.recipe_id = r.id
        WHERE cs.user_id = p_viewer_id AND r.owner_id = p_target_id
    );

    RETURN affinity_score;
END;
$$$;


-- 4. FIX FEED SHADOW RANKING: REAL CONFIG WEIGHTS, FRESHNESS DECAY, N+1 FIXED
CREATE OR REPLACE FUNCTION public.get_shadow_feed(p_user_id UUID, p_limit INT DEFAULT 20, p_version TEXT DEFAULT 'ranking-v1')
RETURNS TABLE (
    entity_id UUID,
    entity_type TEXT,
    author_id UUID,
    final_score NUMERIC,
    affinity NUMERIC,
    content_score NUMERIC,
    freshness NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$$
DECLARE
    config_evt JSONB;
    config_aff JSONB;
BEGIN
    IF auth.uid() != p_user_id THEN
        RAISE EXCEPTION 'Unauthorized to view shadow feed of another user';
    END IF;

    SELECT event_weights, affinity_weights INTO config_evt, config_aff 
    FROM public.shadow_ranking_config WHERE version_id = p_version;

    RETURN QUERY
    WITH candidate_items AS (
        SELECT id as entity_id, 'recipe' as entity_type, owner_id as author_id, created_at FROM public.recipes WHERE status = 'PUBLISHED'
        UNION ALL
        SELECT id as entity_id, 'post' as entity_type, author_id, created_at FROM public.social_posts WHERE visibility = 'PUBLIC'
        UNION ALL
        SELECT id as entity_id, 'session' as entity_type, user_id as author_id, created_at FROM public.cooking_sessions WHERE status = 'COMPLETED'
        ORDER BY created_at DESC
        LIMIT 100
    ),
    unique_authors AS (
        SELECT DISTINCT c.author_id FROM candidate_items c WHERE c.author_id IS NOT NULL
    ),
    author_affinities AS (
        SELECT 
            u.author_id,
            (
                (CASE WHEN EXISTS (SELECT 1 FROM public.follows f WHERE f.follower_id = p_user_id AND f.following_id = u.author_id) THEN COALESCE((config_aff->>'follow')::NUMERIC, 10.0) ELSE 0 END) +
                (SELECT COUNT(*) * COALESCE((config_aff->>'reaction')::NUMERIC, 1.0) FROM public.analytics_events WHERE actor_id = p_user_id AND owner_id = u.author_id AND event_type = 'reaction') +
                (SELECT COUNT(*) * COALESCE((config_aff->>'comment')::NUMERIC, 3.0) FROM public.analytics_events WHERE actor_id = p_user_id AND owner_id = u.author_id AND event_type = 'comment') +
                (SELECT COUNT(*) * COALESCE((config_aff->>'cook_recipe')::NUMERIC, 10.0) FROM public.cooking_sessions cs JOIN public.recipes r ON cs.recipe_id = r.id WHERE cs.user_id = p_user_id AND r.owner_id = u.author_id)
            ) as affinity_score
        FROM unique_authors u
    ),
    feed_scores AS (
        SELECT 
            c.entity_id, c.entity_type, c.author_id,
            COALESCE(a.affinity_score, 0) as affinity,
            (
                COALESCE(scs.views * (config_evt->>'view')::numeric, 0) +
                COALESCE(scs.reactions * (config_evt->>'reaction')::numeric, 0) +
                COALESCE(scs.comments * (config_evt->>'comment')::numeric, 0) +
                COALESCE(scs.saves * (config_evt->>'save')::numeric, 0) +
                COALESCE(scs.shares * (config_evt->>'share')::numeric, 0)
            ) as content_score,
            EXTRACT(EPOCH FROM (NOW() - c.created_at)) / 3600 as freshness
        FROM candidate_items c
        LEFT JOIN public.shadow_content_scores scs ON c.entity_id = scs.content_id
        LEFT JOIN author_affinities a ON c.author_id = a.author_id
    )
    SELECT 
        fs.entity_id, fs.entity_type, fs.author_id,
        -- freshness acts as a gravity penalty (hours ago ^ 1.2)
        (fs.affinity + fs.content_score) / NULLIF(POWER(GREATEST(fs.freshness, 1.0), 1.2), 0) as final_score,
        fs.affinity, fs.content_score, fs.freshness
    FROM feed_scores fs
    ORDER BY final_score DESC
    LIMIT p_limit;
END;
$$$;

REVOKE EXECUTE ON FUNCTION public.get_shadow_taste_profile(UUID, TEXT) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_shadow_taste_profile(UUID, TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_shadow_user_affinity(UUID, UUID, TEXT) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_shadow_user_affinity(UUID, UUID, TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_shadow_feed(UUID, INT, TEXT) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_shadow_feed(UUID, INT, TEXT) TO authenticated;

