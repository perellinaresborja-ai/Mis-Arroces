-- Create story_reactions table
CREATE TABLE IF NOT EXISTS public.story_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(story_id, user_id)
);

-- RLS
ALTER TABLE public.story_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Story reactions are visible to owner"
ON public.story_reactions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.stories s
    WHERE s.id = story_id AND s.owner_id = auth.uid()
  )
  OR user_id = auth.uid()
);

CREATE POLICY "Users can create their own reactions"
ON public.story_reactions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reactions"
ON public.story_reactions FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own reactions"
ON public.story_reactions FOR DELETE
TO authenticated
USING (user_id = auth.uid());
