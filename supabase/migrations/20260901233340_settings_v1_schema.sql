-- Settings V1 Schema
-- 1. user_mutes
CREATE TABLE IF NOT EXISTS public.user_mutes (
    muter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    muted_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (muter_id, muted_id)
);

ALTER TABLE public.user_mutes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own mutes" ON public.user_mutes;
CREATE POLICY "Users can view their own mutes" 
ON public.user_mutes FOR SELECT 
USING (auth.uid() = muter_id);

DROP POLICY IF EXISTS "Users can insert their own mutes" ON public.user_mutes;
CREATE POLICY "Users can insert their own mutes" 
ON public.user_mutes FOR INSERT 
WITH CHECK (auth.uid() = muter_id);

DROP POLICY IF EXISTS "Users can delete their own mutes" ON public.user_mutes;
CREATE POLICY "Users can delete their own mutes" 
ON public.user_mutes FOR DELETE 
USING (auth.uid() = muter_id);

-- Cannot mute oneself
DO $
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_mutes_cannot_mute_self') THEN
        ALTER TABLE public.user_mutes ADD CONSTRAINT user_mutes_cannot_mute_self CHECK (muter_id != muted_id);
    END IF;
END $;

-- 2. hidden_words
CREATE TABLE IF NOT EXISTS public.hidden_words (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    word TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS hidden_words_user_id_word_idx ON public.hidden_words (user_id, lower(word));

ALTER TABLE public.hidden_words ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own hidden words" ON public.hidden_words;
CREATE POLICY "Users can view their own hidden words" 
ON public.hidden_words FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own hidden words" ON public.hidden_words;
CREATE POLICY "Users can insert their own hidden words" 
ON public.hidden_words FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own hidden words" ON public.hidden_words;
CREATE POLICY "Users can delete their own hidden words" 
ON public.hidden_words FOR DELETE 
USING (auth.uid() = user_id);

-- 3. notification_preferences
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    follows BOOLEAN DEFAULT true NOT NULL,
    likes BOOLEAN DEFAULT true NOT NULL,
    comments BOOLEAN DEFAULT true NOT NULL,
    mentions BOOLEAN DEFAULT true NOT NULL,
    messages BOOLEAN DEFAULT true NOT NULL,
    system BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notification preferences" ON public.notification_preferences;
CREATE POLICY "Users can view their own notification preferences" 
ON public.notification_preferences FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notification preferences" ON public.notification_preferences;
CREATE POLICY "Users can update their own notification preferences" 
ON public.notification_preferences FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own notification preferences" ON public.notification_preferences;
CREATE POLICY "Users can insert their own notification preferences" 
ON public.notification_preferences FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Ensure blocks constraints
DO $
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'blocks_cannot_block_self') THEN
        ALTER TABLE public.blocks ADD CONSTRAINT blocks_cannot_block_self CHECK (blocker_id != blocked_id);
    END IF;
END $;
