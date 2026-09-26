-- Migration: Admin Communications Campaigns History
-- Table: admin_campaigns

CREATE TABLE IF NOT EXISTS public.admin_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  subject TEXT,
  cta_url TEXT,
  cta_text TEXT,
  channels TEXT[] NOT NULL DEFAULT '{}',
  segment TEXT NOT NULL DEFAULT 'ALL',
  recipient_count INT NOT NULL DEFAULT 0,
  sent_count INT NOT NULL DEFAULT 0,
  failed_count INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'COMPLETED',
  error_details JSONB
);

CREATE INDEX IF NOT EXISTS idx_admin_campaigns_created_at ON public.admin_campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_campaigns_admin_id ON public.admin_campaigns(admin_id);

ALTER TABLE public.admin_campaigns ENABLE ROW LEVEL SECURITY;
