-- Migration: push_subscriptions and SYSTEM notification enum
-- Phase 1 Web Push & Badging for misarroces

-- 1. Ensure 'SYSTEM' exists in notification_type_enum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type typ
    JOIN pg_enum enm ON enm.enumtypid = typ.oid
    WHERE typ.typname = 'notification_type_enum' AND enm.enumlabel = 'SYSTEM'
  ) THEN
    ALTER TYPE public.notification_type_enum ADD VALUE 'SYSTEM';
  END IF;
END $$;

-- 2. Create push_subscriptions table
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- 5. Policies (Scoped strictly to the authenticated user)
DROP POLICY IF EXISTS "Users can view own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can view own push subscriptions"
  ON public.push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can insert own push subscriptions"
  ON public.push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can update own push subscriptions"
  ON public.push_subscriptions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can delete own push subscriptions"
  ON public.push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);
