-- Migration: Moderation and Security Reports System V1
-- Table: moderation_reports

CREATE TABLE IF NOT EXISTS public.moderation_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('POST', 'COMMENT', 'COMMENT_REPLY', 'RECIPE', 'STORY', 'USER', 'MESSAGE')),
    target_id TEXT NOT NULL,
    reported_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    details TEXT NULL,
    content_snapshot JSONB NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'REVIEWED', 'ACTIONED', 'DISMISSED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMPTZ NULL,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Index for anti-spam: unique pending report per user per target
CREATE UNIQUE INDEX IF NOT EXISTS idx_moderation_reports_unique_pending 
ON public.moderation_reports(reporter_id, target_type, target_id) 
WHERE status = 'PENDING';

-- Index for querying targets by status/type
CREATE INDEX IF NOT EXISTS idx_moderation_reports_target 
ON public.moderation_reports(target_type, target_id);

CREATE INDEX IF NOT EXISTS idx_moderation_reports_status 
ON public.moderation_reports(status, created_at DESC);

-- Enable RLS
ALTER TABLE public.moderation_reports ENABLE ROW LEVEL SECURITY;

-- Reporters can create reports (must be their own UID)
CREATE POLICY Users can create own reports
ON public.moderation_reports
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = reporter_id);

-- Reporters can view their own reports
CREATE POLICY Users can view own reports
ON public.moderation_reports
FOR SELECT
TO authenticated
USING (auth.uid() = reporter_id);
