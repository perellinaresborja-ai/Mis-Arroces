-- Add visitor_id and checks
ALTER TABLE public.analytics_events ADD COLUMN visitor_id text;

ALTER TABLE public.analytics_events ADD CONSTRAINT chk_event_type CHECK (event_type IN (
    'RECIPE_VIEW', 'SESSION_VIEW', 'PROFILE_VIEW', 'STORY_VIEW', 
    'PAELLA_LIKE', 'COMMENT', 'REPLY', 'SAVE', 'SHARE', 'FOLLOW', 
    'COOK_RECIPE', 'ADD_TO_SHOPPING_LIST', 'STORY_LINK_CLICK', 'STORY_SHARE'
));

ALTER TABLE public.analytics_events ADD CONSTRAINT chk_entity_type CHECK (entity_type IN (
    'RECIPE', 'SESSION', 'POST', 'SHORT', 'STORY', 'PROFILE'
));

-- Re-create get_profile_insights with security and true sources of truth
CREATE OR REPLACE FUNCTION public.get_profile_insights(owner_id_param uuid, days_param integer)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
    start_date timestamp with time zone;
BEGIN
    IF auth.uid() != owner_id_param THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    start_date := now() - (days_param || ' days')::interval;

    SELECT json_build_object(
        'views', (
            SELECT count(*) 
            FROM public.analytics_events 
            WHERE owner_id = owner_id_param 
              AND created_at >= start_date 
              AND event_type IN ('RECIPE_VIEW', 'SESSION_VIEW', 'PROFILE_VIEW', 'STORY_VIEW')
        ),
        'reach', (
            SELECT count(DISTINCT COALESCE(actor_id::text, visitor_id))
            FROM public.analytics_events 
            WHERE owner_id = owner_id_param 
              AND created_at >= start_date 
        ),
        'interactions', (
            (SELECT count(*) FROM public.recipe_likes WHERE user_id != owner_id_param AND recipe_id IN (SELECT id FROM public.recipes WHERE owner_id = owner_id_param) AND created_at >= start_date) +
            (SELECT count(*) FROM public.recipe_comments WHERE user_id != owner_id_param AND recipe_id IN (SELECT id FROM public.recipes WHERE owner_id = owner_id_param) AND created_at >= start_date) +
            (SELECT count(*) FROM public.saved_recipes WHERE user_id != owner_id_param AND recipe_id IN (SELECT id FROM public.recipes WHERE owner_id = owner_id_param) AND created_at >= start_date) +
            (SELECT count(*) FROM public.analytics_events WHERE owner_id = owner_id_param AND created_at >= start_date AND event_type IN ('SHARE', 'STORY_SHARE'))
        ),
        'followers_gained', (
            SELECT count(*) 
            FROM public.follows 
            WHERE following_id = owner_id_param 
              AND created_at >= start_date
        ),
        'impact', json_build_object(
            'cooked_times', (
                SELECT count(*) 
                FROM public.cooking_sessions 
                WHERE recipe_id IN (SELECT id FROM public.recipes WHERE owner_id = owner_id_param)
                  AND created_at >= start_date
            ),
            'saved_times', (
                SELECT count(*) 
                FROM public.saved_recipes 
                WHERE recipe_id IN (SELECT id FROM public.recipes WHERE owner_id = owner_id_param)
                  AND created_at >= start_date
            ),
            'shopping_list_adds', (
                SELECT count(*) 
                FROM public.analytics_events 
                WHERE owner_id = owner_id_param 
                  AND created_at >= start_date 
                  AND event_type = 'ADD_TO_SHOPPING_LIST'
            )
        )
    ) INTO result;

    RETURN result;
END;
$$;


-- Re-create get_top_content with security
CREATE OR REPLACE FUNCTION public.get_top_content(owner_id_param uuid, days_param integer, metric_param text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
    start_date timestamp with time zone;
BEGIN
    IF auth.uid() != owner_id_param THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    start_date := now() - (days_param || ' days')::interval;

    IF metric_param = 'views' THEN
        SELECT json_agg(row_to_json(t)) INTO result
        FROM (
            SELECT entity_type, entity_id, count(*) as count
            FROM public.analytics_events
            WHERE owner_id = owner_id_param 
              AND created_at >= start_date 
              AND event_type IN ('RECIPE_VIEW', 'SESSION_VIEW')
            GROUP BY entity_type, entity_id
            ORDER BY count DESC
            LIMIT 5
        ) t;
    ELSIF metric_param = 'cooked' THEN
        SELECT json_agg(row_to_json(t)) INTO result
        FROM (
            SELECT 'recipe' as entity_type, recipe_id as entity_id, count(*) as count
            FROM public.cooking_sessions
            WHERE recipe_id IN (SELECT id FROM public.recipes WHERE owner_id = owner_id_param)
              AND created_at >= start_date
            GROUP BY recipe_id
            ORDER BY count DESC
            LIMIT 5
        ) t;
    ELSIF metric_param = 'saved' THEN
        SELECT json_agg(row_to_json(t)) INTO result
        FROM (
            SELECT 'recipe' as entity_type, recipe_id as entity_id, count(*) as count
            FROM public.saved_recipes
            WHERE recipe_id IN (SELECT id FROM public.recipes WHERE owner_id = owner_id_param)
              AND created_at >= start_date
            GROUP BY recipe_id
            ORDER BY count DESC
            LIMIT 5
        ) t;
    ELSE
        result := '[]'::json;
    END IF;

    RETURN COALESCE(result, '[]'::json);
END;
$$;


-- Re-create get_entity_insights with security and true sources
CREATE OR REPLACE FUNCTION public.get_entity_insights(entity_type_param text, entity_id_param uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
    real_owner_id uuid;
BEGIN
    -- Verify ownership first
    IF entity_type_param = 'RECIPE' THEN
        SELECT owner_id INTO real_owner_id FROM public.recipes WHERE id = entity_id_param;
    ELSIF entity_type_param = 'SESSION' THEN
        SELECT user_id INTO real_owner_id FROM public.cooking_sessions WHERE id = entity_id_param;
    ELSIF entity_type_param = 'STORY' THEN
        SELECT owner_id INTO real_owner_id FROM public.stories WHERE id = entity_id_param;
    END IF;

    IF auth.uid() != real_owner_id THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    SELECT json_build_object(
        'views', (
            SELECT count(*) 
            FROM public.analytics_events 
            WHERE entity_type = entity_type_param 
              AND entity_id = entity_id_param 
              AND event_type IN ('RECIPE_VIEW', 'SESSION_VIEW', 'STORY_VIEW')
        ),
        'reach', (
            SELECT count(DISTINCT COALESCE(actor_id::text, visitor_id))
            FROM public.analytics_events 
            WHERE entity_type = entity_type_param 
              AND entity_id = entity_id_param 
        ),
        'shares', (
            SELECT count(*) 
            FROM public.analytics_events 
            WHERE entity_type = entity_type_param 
              AND entity_id = entity_id_param 
              AND event_type = 'SHARE'
        ),
        'likes', (
            CASE 
                WHEN entity_type_param = 'RECIPE' THEN (SELECT count(*) FROM public.recipe_likes WHERE recipe_id = entity_id_param)
                WHEN entity_type_param = 'SESSION' THEN (SELECT count(*) FROM public.session_likes WHERE session_id = entity_id_param)
                ELSE 0
            END
        ),
        'saves', (
            CASE 
                WHEN entity_type_param = 'RECIPE' THEN (SELECT count(*) FROM public.saved_recipes WHERE recipe_id = entity_id_param)
                ELSE 0
            END
        ),
        'comments', (
            CASE 
                WHEN entity_type_param = 'RECIPE' THEN (SELECT count(*) FROM public.recipe_comments WHERE recipe_id = entity_id_param)
                WHEN entity_type_param = 'SESSION' THEN (SELECT count(*) FROM public.session_comments WHERE session_id = entity_id_param)
                ELSE 0
            END
        ),
        'cooked', (
            CASE 
                WHEN entity_type_param = 'RECIPE' THEN (SELECT count(*) FROM public.cooking_sessions WHERE recipe_id = entity_id_param)
                ELSE 0
            END
        ),
        'link_clicks', (
            SELECT count(*) 
            FROM public.analytics_events 
            WHERE entity_type = entity_type_param 
              AND entity_id = entity_id_param 
              AND event_type = 'STORY_LINK_CLICK'
        ),
        'shopping_adds', (
            SELECT count(*) 
            FROM public.analytics_events 
            WHERE entity_type = entity_type_param 
              AND entity_id = entity_id_param 
              AND event_type = 'ADD_TO_SHOPPING_LIST'
        )
    ) INTO result;

    RETURN result;
END;
$$;
