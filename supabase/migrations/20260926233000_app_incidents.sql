-- Migration: App Incidents & Telemetry System
-- Table: app_incidents

CREATE TABLE IF NOT EXISTS public.app_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_type TEXT NOT NULL DEFAULT 'CLIENT_ERROR',
  message TEXT NOT NULL,
  stack TEXT,
  url TEXT,
  user_agent TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  context JSONB,
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'INVESTIGATING', 'RESOLVED', 'IGNORED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_app_incidents_created_at ON public.app_incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_incidents_status ON public.app_incidents(status);

ALTER TABLE public.app_incidents ENABLE ROW LEVEL SECURITY;

-- Allow insert by client error boundaries (both anonymous and authenticated users)
CREATE POLICY "Allow public insert to app_incidents" ON public.app_incidents
  FOR INSERT
  WITH CHECK (true);
