-- Migration: user_acquisition table
CREATE TABLE IF NOT EXISTS public.user_acquisition (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_content TEXT,
    utm_term TEXT,
    referrer TEXT,
    landing_path TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_acquisition ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own acquisition" 
ON public.user_acquisition 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own acquisition" 
ON public.user_acquisition 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);
