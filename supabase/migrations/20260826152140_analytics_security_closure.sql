-- 1. DROP Direct Insert Policies on analytics_events
DO $$ 
DECLARE 
    pol record;
BEGIN 
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'analytics_events' AND cmd = 'INSERT'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.analytics_events', pol.policyname);
    END LOOP;
END $$;

-- Optional: ensure RLS is enabled (it should be)
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- 2. CREATE SECURITY DEFINER RPC to handle inserts & deduplication securely
CREATE OR REPLACE FUNCTION public.track_analytics_event(
    event_type_param text,
    entity_type_param text,
    entity_id_param uuid,
    visitor_id_param text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    real_owner_id uuid;
    current_actor_id uuid;
    recent_count int;
BEGIN
    current_actor_id := auth.uid();

    -- 1. Resolve Owner Securely on DB level
    IF entity_type_param = 'RECIPE' THEN
        SELECT owner_id INTO real_owner_id FROM public.recipes WHERE id = entity_id_param;
    ELSIF entity_type_param = 'SESSION' THEN
        SELECT user_id INTO real_owner_id FROM public.cooking_sessions WHERE id = entity_id_param;
    ELSIF entity_type_param = 'STORY' THEN
        SELECT owner_id INTO real_owner_id FROM public.stories WHERE id = entity_id_param;
    ELSIF entity_type_param = 'PROFILE' THEN
        real_owner_id := entity_id_param;
    ELSIF entity_type_param IN ('POST', 'SHORT') THEN
        -- Safely ignore or expand later if needed
        RETURN;
    END IF;

    -- Cannot track if there is no owner or entity doesn't exist
    IF real_owner_id IS NULL THEN
        RETURN;
    END IF;

    -- 2. Deduplication (30 minutes) for Views only
    IF event_type_param LIKE '%_VIEW' THEN
        SELECT count(*) INTO recent_count
        FROM public.analytics_events
        WHERE entity_id = entity_id_param
          AND event_type = event_type_param
          AND created_at >= NOW() - INTERVAL '30 minutes'
          AND (
              (current_actor_id IS NOT NULL AND actor_id = current_actor_id) OR
              (current_actor_id IS NULL AND visitor_id = visitor_id_param)
          );

        IF recent_count > 0 THEN
            RETURN; -- Deduplicated
        END IF;
    END IF;

    -- 3. Insert securely
    INSERT INTO public.analytics_events (
        actor_id, visitor_id, owner_id, event_type, entity_type, entity_id
    ) VALUES (
        current_actor_id, visitor_id_param, real_owner_id, event_type_param, entity_type_param, entity_id_param
    );
END;
$$;

-- 3. HARDEN EXISTING RPCs (SET search_path = public)
ALTER FUNCTION public.get_profile_insights(uuid, integer) SET search_path = public;
ALTER FUNCTION public.get_top_content(uuid, integer, text) SET search_path = public;
ALTER FUNCTION public.get_entity_insights(text, uuid) SET search_path = public;

