-- Migration for V1 Functional Closure

-- 1. story_views
CREATE TABLE IF NOT EXISTS public.story_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id uuid NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  viewer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(story_id, viewer_id)
);

ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can see story views" ON public.story_views FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.stories WHERE stories.id = story_views.story_id AND stories.owner_id = auth.uid())
);

CREATE POLICY "Users can insert own view" ON public.story_views FOR INSERT WITH CHECK (
  auth.uid() = viewer_id
);


-- 2. recipe_ingredient_costs (Private cost tracking)
CREATE TABLE IF NOT EXISTS public.recipe_ingredient_costs (
  id uuid PRIMARY KEY REFERENCES public.recipe_ingredients(id) ON DELETE CASCADE,
  recipe_id uuid NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  purchase_amount numeric,
  purchase_unit_id uuid REFERENCES public.units(id),
  purchase_price numeric
);

ALTER TABLE public.recipe_ingredient_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage ingredient costs" ON public.recipe_ingredient_costs FOR ALL USING (
  auth.uid() = owner_id
) WITH CHECK (
  auth.uid() = owner_id
);


-- 3. notifications
CREATE TYPE public.notification_type_enum AS ENUM (
  'LIKE',
  'COMMENT',
  'REPLY',
  'MENTION',
  'TAG',
  'FOLLOW',
  'FOLLOW_REQUEST',
  'FOLLOW_ACCEPT',
  'COOKED_RECIPE',
  'PUBLISHED_RESULT'
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  type public.notification_type_enum NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  is_read boolean DEFAULT false NOT NULL,
  payload jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see own notifications" ON public.notifications FOR SELECT USING (
  auth.uid() = recipient_id
);

CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (
  auth.uid() = recipient_id
) WITH CHECK (
  auth.uid() = recipient_id
);

CREATE POLICY "Anyone can insert notifications" ON public.notifications FOR INSERT WITH CHECK (
  true
);

-- Realtime replication for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
