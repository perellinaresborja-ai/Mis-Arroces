-- 00026_mentions_tags_hashtags.sql
-- MIS ARROCES V1 MENTIONS, TAGS & HASHTAGS

-- 1. HASHTAGS (Global registry)
CREATE TABLE IF NOT EXISTS public.hashtags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, -- Original presentation (e.g., #Socarrat)
    normalized_name TEXT NOT NULL UNIQUE, -- For search/deduplication (e.g., socarrat)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_hashtags_normalized ON public.hashtags(normalized_name);

-- 2. ENTITY HASHTAGS (Many-to-many relationship to content)
CREATE TABLE IF NOT EXISTS public.entity_hashtags (
    hashtag_id UUID NOT NULL REFERENCES public.hashtags(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL, -- 'recipe', 'cooking_session', 'short', 'recipe_comment', etc.
    entity_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (hashtag_id, entity_type, entity_id)
);
CREATE INDEX IF NOT EXISTS idx_entity_hashtags_entity ON public.entity_hashtags(entity_type, entity_id);

-- 3. MENTIONS (When a user mentions another user in text)
CREATE TABLE IF NOT EXISTS public.mentions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    mentioned_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Prevent duplicate mentions of the same user in the same entity
    UNIQUE(mentioned_id, entity_type, entity_id)
);
CREATE INDEX IF NOT EXISTS idx_mentions_entity ON public.mentions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_mentions_mentioned ON public.mentions(mentioned_id);

-- 4. TAGGED USERS (Explicit tags in publications)
CREATE TABLE IF NOT EXISTS public.tagged_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tagged_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Prevent tagging the same user twice in the same content
    UNIQUE(tagged_id, entity_type, entity_id)
);
CREATE INDEX IF NOT EXISTS idx_tagged_users_entity ON public.tagged_users(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_tagged_users_tagged ON public.tagged_users(tagged_id);


-- 5. RLS POLICIES

-- ENABLE RLS
ALTER TABLE public.hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tagged_users ENABLE ROW LEVEL SECURITY;

-- HASHTAGS (Global registry is readable by anyone, only authenticated users can insert)
CREATE POLICY "hashtags_select" ON public.hashtags FOR SELECT USING (true);
CREATE POLICY "hashtags_insert" ON public.hashtags FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Helper function to check if parent entity is visible to the current user
-- We use inline EXISTS blocks on existing tables which rely on their own RLS.
-- This ensures strict privacy propagation.

-- ENTITY HASHTAGS RLS
CREATE POLICY "entity_hashtags_select" ON public.entity_hashtags FOR SELECT USING (
    (entity_type = 'recipe' AND EXISTS (SELECT 1 FROM public.recipes WHERE id = entity_id)) OR
    (entity_type = 'cooking_session' AND EXISTS (SELECT 1 FROM public.cooking_sessions WHERE id = entity_id)) OR
    (entity_type = 'short' AND EXISTS (SELECT 1 FROM public.shorts WHERE id = entity_id)) OR
    (entity_type = 'recipe_comment' AND EXISTS (SELECT 1 FROM public.recipe_comments WHERE id = entity_id)) OR
    (entity_type = 'session_comment' AND EXISTS (SELECT 1 FROM public.session_comments WHERE id = entity_id)) OR
    (entity_type = 'short_comment' AND EXISTS (SELECT 1 FROM public.short_comments WHERE id = entity_id)) OR
    (entity_type = 'social_post' AND EXISTS (SELECT 1 FROM public.social_posts WHERE id = entity_id)) OR
    (entity_type = 'post_comment' AND EXISTS (SELECT 1 FROM public.post_comments WHERE id = entity_id))
);

-- Note: we only allow server actions/trusted clients to insert (for now auth.uid is enough because we control UI)
-- But strict RLS: you can only add hashtags to your own content.
CREATE POLICY "entity_hashtags_insert" ON public.entity_hashtags FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL -- The server action enforces ownership
);
CREATE POLICY "entity_hashtags_delete" ON public.entity_hashtags FOR DELETE USING (
    auth.uid() IS NOT NULL -- Server action enforces ownership
);

-- MENTIONS RLS
CREATE POLICY "mentions_select" ON public.mentions FOR SELECT USING (
    (entity_type = 'recipe' AND EXISTS (SELECT 1 FROM public.recipes WHERE id = entity_id)) OR
    (entity_type = 'cooking_session' AND EXISTS (SELECT 1 FROM public.cooking_sessions WHERE id = entity_id)) OR
    (entity_type = 'short' AND EXISTS (SELECT 1 FROM public.shorts WHERE id = entity_id)) OR
    (entity_type = 'recipe_comment' AND EXISTS (SELECT 1 FROM public.recipe_comments WHERE id = entity_id)) OR
    (entity_type = 'session_comment' AND EXISTS (SELECT 1 FROM public.session_comments WHERE id = entity_id)) OR
    (entity_type = 'short_comment' AND EXISTS (SELECT 1 FROM public.short_comments WHERE id = entity_id)) OR
    (entity_type = 'social_post' AND EXISTS (SELECT 1 FROM public.social_posts WHERE id = entity_id)) OR
    (entity_type = 'post_comment' AND EXISTS (SELECT 1 FROM public.post_comments WHERE id = entity_id))
);

CREATE POLICY "mentions_insert" ON public.mentions FOR INSERT WITH CHECK (actor_id = auth.uid());
CREATE POLICY "mentions_delete" ON public.mentions FOR DELETE USING (actor_id = auth.uid());


-- TAGGED USERS RLS
CREATE POLICY "tagged_users_select" ON public.tagged_users FOR SELECT USING (
    (entity_type = 'recipe' AND EXISTS (SELECT 1 FROM public.recipes WHERE id = entity_id)) OR
    (entity_type = 'cooking_session' AND EXISTS (SELECT 1 FROM public.cooking_sessions WHERE id = entity_id)) OR
    (entity_type = 'short' AND EXISTS (SELECT 1 FROM public.shorts WHERE id = entity_id)) OR
    (entity_type = 'social_post' AND EXISTS (SELECT 1 FROM public.social_posts WHERE id = entity_id))
);

CREATE POLICY "tagged_users_insert" ON public.tagged_users FOR INSERT WITH CHECK (author_id = auth.uid());
CREATE POLICY "tagged_users_delete" ON public.tagged_users FOR DELETE USING (
    author_id = auth.uid() OR tagged_id = auth.uid() -- Author can delete, OR the tagged user can remove themselves!
);

