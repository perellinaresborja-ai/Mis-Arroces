-- Migration: 20260923220000_user_activity_history.sql
-- Architecture for User ID Activity History: events, tastings (catas), check-ins, contests, raffles, awards/recognitions.
-- Linked strictly via user_id. Private to each user. Extensible via metadata jsonb.

CREATE TABLE IF NOT EXISTS public.user_activity_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'EVENT', 'TASTING', 'CHECKIN', 'CONTEST', 'RAFFLE', 'AWARD', 'OTHER'
    title TEXT NOT NULL,
    description TEXT,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata JSONB DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'COMPLETED', -- 'REGISTERED', 'CHECKED_IN', 'COMPLETED', 'AWARDED', 'CANCELLED'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast user queries ordered by date
CREATE INDEX IF NOT EXISTS idx_user_activity_history_user_id ON public.user_activity_history(user_id, occurred_at DESC);

-- Enable RLS
ALTER TABLE public.user_activity_history ENABLE ROW LEVEL SECURITY;

-- Each user can only view their own private history
DROP POLICY IF EXISTS "Users can view only their own activity history" ON public.user_activity_history;
CREATE POLICY "Users can view only their own activity history"
ON public.user_activity_history FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Restrict direct modifications from clients (only service_role or future secure RPCs)
REVOKE INSERT, UPDATE, DELETE ON public.user_activity_history FROM public, authenticated;
