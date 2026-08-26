-- 1. Create analytics_events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    actor_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type text NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT analytics_events_pkey PRIMARY KEY (id)
);

-- 2. Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_analytics_owner_id ON public.analytics_events USING btree (owner_id);
CREATE INDEX IF NOT EXISTS idx_analytics_entity ON public.analytics_events USING btree (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics_events USING btree (created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics_events USING btree (event_type);

-- 3. Row Level Security
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow inserts from authenticated and unauthenticated (guests). We use an open policy for insert to not block tracking.
CREATE POLICY "Enable insert for everyone" ON public.analytics_events FOR INSERT WITH CHECK (true);

-- Only owners can select their own events
CREATE POLICY "Enable select for owners" ON public.analytics_events FOR SELECT USING (auth.uid() = owner_id);

-- 4. RPCs for aggregations

-- A. get_profile_insights
-- Returns aggregated stats for a profile over a given number of days.
CREATE OR REPLACE FUNCTION public.get_profile_insights(owner_id_param uuid, days_param integer)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
    start_date timestamp with time zone;
BEGIN
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
            SELECT count(DISTINCT actor_id) 
            FROM public.analytics_events 
            WHERE owner_id = owner_id_param 
              AND created_at >= start_date 
              AND actor_id IS NOT NULL
        ),
        'interactions', (
            -- Calculate interactions dynamically from analytics_events
            SELECT count(*) 
            FROM public.analytics_events 
            WHERE owner_id = owner_id_param 
              AND created_at >= start_date 
              AND event_type IN ('PAELLA_LIKE', 'COMMENT', 'REPLY', 'SAVE', 'SHARE')
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


-- B. get_top_content
-- Returns top 5 entities (recipes or sessions) for a profile over a period, sorted by a metric ('views', 'cooked', 'saved')
CREATE OR REPLACE FUNCTION public.get_top_content(owner_id_param uuid, days_param integer, metric_param text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
    start_date timestamp with time zone;
BEGIN
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


-- C. get_entity_insights
CREATE OR REPLACE FUNCTION public.get_entity_insights(entity_type_param text, entity_id_param uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
BEGIN
    SELECT json_build_object(
        'views', (
            SELECT count(*) 
            FROM public.analytics_events 
            WHERE entity_type = entity_type_param 
              AND entity_id = entity_id_param 
              AND event_type IN ('RECIPE_VIEW', 'SESSION_VIEW', 'STORY_VIEW')
        ),
        'reach', (
            SELECT count(DISTINCT actor_id) 
            FROM public.analytics_events 
            WHERE entity_type = entity_type_param 
              AND entity_id = entity_id_param 
              AND actor_id IS NOT NULL
        ),
        'shares', (
            SELECT count(*) 
            FROM public.analytics_events 
            WHERE entity_type = entity_type_param 
              AND entity_id = entity_id_param 
              AND event_type = 'SHARE'
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
