-- Migration: Mi Admin Roles and Audit Logs (Bloque 1)

-- 1. Create admin_role_enum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'admin_role_enum'
  ) THEN
    CREATE TYPE public.admin_role_enum AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MODERATOR');
  END IF;
END $$;

-- 2. Create admin_roles table
CREATE TABLE IF NOT EXISTS public.admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.admin_role_enum NOT NULL DEFAULT 'ADMIN',
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Index
CREATE INDEX IF NOT EXISTS idx_admin_roles_user_id ON public.admin_roles(user_id);

-- RLS: Strict security. No direct client access (only service_role or server-side)
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- 3. Initial Super Admin seed via profile lookup
INSERT INTO public.admin_roles (user_id, role)
SELECT id, 'SUPER_ADMIN'::public.admin_role_enum
FROM public.profiles
WHERE username = 'perellinares'
ON CONFLICT (user_id) DO UPDATE SET role = 'SUPER_ADMIN';

-- 4. Create admin_audit_logs table
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_type text,
  target_id text,
  details jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for audit queries
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_id ON public.admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON public.admin_audit_logs(action);

-- RLS: Strict security. Only server-side can insert/read
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- 5. Helper RPC to check admin role safely
CREATE OR REPLACE FUNCTION public.get_admin_role(p_user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM public.admin_roles WHERE user_id = p_user_id;
$$;
