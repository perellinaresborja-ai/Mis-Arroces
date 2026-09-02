-- ==========================================
-- SHADOW PERSONALIZATION ENGINE V1
-- ==========================================

-- 1. CONFIGURATION & VERSIONING
CREATE TABLE IF NOT EXISTS public.shadow_ranking_config (
    version_id TEXT PRIMARY KEY,
    description TEXT,
    event_weights JSONB NOT NULL,
    affinity_weights JSONB NOT NULL,
    exploration_ratio NUMERIC DEFAULT 0.1,
    diversity_penalty NUMERIC DEFAULT 0.2,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT false
);

INSERT INTO public.shadow_ranking_config (version_id, description, event_weights, affinity_weights)
VALUES (
    'ranking-v1',
    'Initial shadow ranking weights',
    '{
        "impression": 0.0,
        "view": 1.0,
        "reaction": 3.0,
        "comment": 5.0,
        "share": 10.0,
        "save": 15.0,
        "start_cook": 20.0,
        "complete_cook": 30.0,
        "positive_rating": 40.0,
        "repeat_cook": 50.0
    }'::jsonb,
    '{
        "follow": 10.0,
        "reaction": 1.0,
        "comment": 3.0,
        "save_recipe": 5.0,
        "cook_recipe": 10.0,
        "repeat_cook": 20.0
    }'::jsonb
) ON CONFLICT (version_id) DO NOTHING;

-- Enable RLS on the config table to prevent arbitrary reads from the client
ALTER TABLE public.shadow_ranking_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read for authenticated internal" ON public.shadow_ranking_config
FOR SELECT TO authenticated USING (true);


-- 2. REPEAT COOK AGGREGATION (VIEW)
CREATE OR REPLACE VIEW public.shadow_repeat_cooks AS
SELECT 
    user_id,
    recipe_id,
    COUNT(*) as total_cooks,
    MIN(created_at) as first_cooked_at,
    MAX(created_at) as last_cooked_at,
    AVG(rating) as average_rating,
    MAX(rating) as best_rating,
    COUNT(*) - 1 as repeat_count
FROM public.cooking_sessions
WHERE status = 'COMPLETED' OR rating IS NOT NULL
GROUP BY user_id, recipe_id;


-- 3. COOKING SCORE POR RECETA (VIEW)
CREATE OR REPLACE VIEW public.shadow_recipe_cooking_scores AS
SELECT 
    r.id as recipe_id,
    COUNT(DISTINCT cs.user_id) as unique_cooks,
    COUNT(cs.id) as total_cooks,
    SUM(CASE WHEN rc.repeat_count > 0 THEN 1 ELSE 0 END) as users_repeated,
    COALESCE(AVG(cs.rating), 0) as average_rating,
    COALESCE(
        SUM(CASE WHEN rc.repeat_count > 0 THEN 1 ELSE 0 END)::NUMERIC / NULLIF(COUNT(DISTINCT cs.user_id), 0),
        0
    ) as repeat_ratio
FROM public.recipes r
LEFT JOIN public.cooking_sessions cs ON r.id = cs.recipe_id
LEFT JOIN public.shadow_repeat_cooks rc ON r.id = rc.recipe_id AND cs.user_id = rc.user_id
GROUP BY r.id;


-- 4. TASTE PROFILE (VIVINO STYLE) INTERNO (RPC)
CREATE OR REPLACE FUNCTION public.get_shadow_taste_profile(p_user_id UUID, p_version TEXT DEFAULT 'taste-profile-v1')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$$
DECLARE
    result JSONB;
BEGIN
    WITH session_data AS (
        SELECT 
            cs.id,
            cs.rating,
            cs.heat_source,
            cs.rice_variety_id,
            r.difficulty
        FROM public.cooking_sessions cs
        JOIN public.recipes r ON cs.recipe_id = r.id
        WHERE cs.user_id = p_user_id
    ),
    heat_aggs AS (
        SELECT heat_source, COUNT(*) as count, AVG(rating) as avg_rating
        FROM session_data
        WHERE heat_source IS NOT NULL
        GROUP BY heat_source
        ORDER BY count DESC, avg_rating DESC NULLS LAST
        LIMIT 3
    ),
    stats AS (
        SELECT 
            COUNT(*) as sample_size,
            CASE 
                WHEN COUNT(*) < 3 THEN 'low'
                WHEN COUNT(*) < 10 THEN 'medium'
                ELSE 'high'
            END as confidence
        FROM session_data
    )
    SELECT jsonb_build_object(
        'version', p_version,
        'sample_size', (SELECT sample_size FROM stats),
        'confidence', (SELECT confidence FROM stats),
        'top_heat_sources', COALESCE((SELECT jsonb_agg(row_to_json(h)) FROM heat_aggs h), '[]'::jsonb)
    ) INTO result;
    
    RETURN COALESCE(result, '{}'::jsonb);
END;
$$$;


-- 5. CONTENT SCORE (VIEW)
CREATE OR REPLACE VIEW public.shadow_content_scores AS
SELECT 
    e.entity_id as content_id,
    e.entity_type,
    COUNT(CASE WHEN e.event_type = 'view' THEN 1 END) as views,
    COUNT(CASE WHEN e.event_type = 'reaction' THEN 1 END) as reactions,
    COUNT(CASE WHEN e.event_type = 'comment' THEN 1 END) as comments,
    COUNT(CASE WHEN e.event_type = 'save' THEN 1 END) as saves,
    COUNT(CASE WHEN e.event_type = 'share' THEN 1 END) as shares
FROM public.analytics_events e
GROUP BY e.entity_id, e.entity_type;


-- 6. USER AFFINITY (RPC)
CREATE OR REPLACE FUNCTION public.get_shadow_user_affinity(p_viewer_id UUID, p_target_id UUID, p_version TEXT DEFAULT 'ranking-v1')
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$$
DECLARE
    affinity_score NUMERIC := 0;
    config JSONB;
BEGIN
    SELECT affinity_weights INTO config FROM public.shadow_ranking_config WHERE version_id = p_version;
    IF config IS NULL THEN RETURN 0; END IF;

    -- Follows
    IF EXISTS (SELECT 1 FROM public.follows WHERE follower_id = p_viewer_id AND following_id = p_target_id) THEN
        affinity_score := affinity_score + COALESCE((config->>'follow')::NUMERIC, 10.0);
    END IF;

    -- Interactions (Reactions/Comments)
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

    -- Recipes cooked
    affinity_score := affinity_score + (
        SELECT COUNT(*) * COALESCE((config->>'cook_recipe')::NUMERIC, 10.0)
        FROM public.cooking_sessions cs
        JOIN public.recipes r ON cs.recipe_id = r.id
        WHERE cs.user_id = p_viewer_id AND r.owner_id = p_target_id
    );

    RETURN affinity_score;
END;
$$$;


-- 7. SHADOW RANKING FEED (RPC)
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
AS $$$
BEGIN
    RETURN QUERY
    WITH candidate_items AS (
        SELECT id as entity_id, 'recipe' as entity_type, owner_id as author_id, created_at FROM public.recipes WHERE status = 'PUBLISHED'
        UNION ALL
        SELECT id as entity_id, 'post' as entity_type, author_id, created_at FROM public.social_posts WHERE visibility = 'PUBLIC'
        UNION ALL
        SELECT id as entity_id, 'session' as entity_type, user_id as author_id, created_at FROM public.cooking_sessions WHERE status = 'COMPLETED'
        ORDER BY created_at DESC
        LIMIT 100
    )
    SELECT 
        c.entity_id,
        c.entity_type,
        c.author_id,
        (
            public.get_shadow_user_affinity(p_user_id, c.author_id, p_version) + 
            COALESCE(scs.saves * 15, 0) + 
            COALESCE(scs.comments * 5, 0)
        ) as final_score,
        public.get_shadow_user_affinity(p_user_id, c.author_id, p_version) as affinity,
        COALESCE(scs.saves * 15, 0) + COALESCE(scs.comments * 5, 0) as content_score,
        EXTRACT(EPOCH FROM (NOW() - c.created_at)) / 3600 as freshness 
    FROM candidate_items c
    LEFT JOIN public.shadow_content_scores scs ON c.entity_id = scs.content_id
    ORDER BY final_score DESC
    LIMIT p_limit;
END;
$$$;
