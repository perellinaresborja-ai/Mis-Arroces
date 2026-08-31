-- Create message reactions table
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(message_id, user_id)
);

-- Enable RLS
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view reactions in conversations they are part of
CREATE POLICY "Users can view message reactions in their conversations"
  ON public.message_reactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      JOIN public.conversation_participants cp ON cp.conversation_id = m.conversation_id
      WHERE m.id = message_reactions.message_id
      AND cp.user_id = auth.uid()
    )
  );

-- Policy: Users can insert reactions in conversations they are part of
CREATE POLICY "Users can insert reactions in their conversations"
  ON public.message_reactions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.messages m
      JOIN public.conversation_participants cp ON cp.conversation_id = m.conversation_id
      WHERE m.id = message_id
      AND cp.user_id = auth.uid()
    )
  );

-- Policy: Users can update their own reactions
CREATE POLICY "Users can update their own reactions"
  ON public.message_reactions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own reactions
CREATE POLICY "Users can delete their own reactions"
  ON public.message_reactions FOR DELETE
  USING (auth.uid() = user_id);
