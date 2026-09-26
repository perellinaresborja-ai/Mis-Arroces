-- Migration: Create user_private_contacts table for secure, private phone and contact matching
-- Ensures user phones are strictly private, isolated from public profiles, and protected by RLS.

CREATE TABLE IF NOT EXISTS public.user_private_contacts (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT,
  phone_e164 TEXT,
  country_code TEXT DEFAULT 'ES',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_private_contacts ENABLE ROW LEVEL SECURITY;

-- 1. Users can only select their own private contact record
DROP POLICY IF EXISTS "Users can view own private contact" ON public.user_private_contacts;
CREATE POLICY "Users can view own private contact"
  ON public.user_private_contacts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. Users can only insert their own private contact record
DROP POLICY IF EXISTS "Users can insert own private contact" ON public.user_private_contacts;
CREATE POLICY "Users can insert own private contact"
  ON public.user_private_contacts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 3. Users can only update their own private contact record
DROP POLICY IF EXISTS "Users can update own private contact" ON public.user_private_contacts;
CREATE POLICY "Users can update own private contact"
  ON public.user_private_contacts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Users can only delete their own private contact record
DROP POLICY IF EXISTS "Users can delete own private contact" ON public.user_private_contacts;
CREATE POLICY "Users can delete own private contact"
  ON public.user_private_contacts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Index for instant E.164 phone matching in Find Friends
CREATE INDEX IF NOT EXISTS idx_user_private_contacts_phone_e164 
  ON public.user_private_contacts(phone_e164);
