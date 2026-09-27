-- Migration: 20260927030000_post_giveaways.sql
-- Description: Sistema profesional de Sorteos V1 integrado en misarroces
-- Incluye: configuración, snapshot inmutable de cierre, ganadores, suplentes, sustitución, certificado público y auditoría.

-- 1. Secuencia para códigos de certificado únicos y humanos (MR-YYYY-XXXXXX)
CREATE SEQUENCE IF NOT EXISTS public.giveaway_certificate_seq START WITH 1;

CREATE OR REPLACE FUNCTION public.generate_giveaway_certificate_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_year TEXT := to_char(now(), 'YYYY');
    v_num BIGINT;
    v_code TEXT;
BEGIN
    v_num := nextval('public.giveaway_certificate_seq');
    v_code := 'MR-' || v_year || '-' || lpad(v_num::TEXT, 6, '0');
    RETURN v_code;
END;
$$;

-- 2. Tabla principal de sorteos vinculados a publicaciones
CREATE TABLE IF NOT EXISTS public.post_giveaways (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.social_posts(id) ON DELETE SET NULL, -- SET NULL preserva el certificado si el post se borra
    organizer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    certificate_code VARCHAR(32) NOT NULL UNIQUE DEFAULT public.generate_giveaway_certificate_code(),
    title TEXT NOT NULL,
    prize TEXT NOT NULL,
    description TEXT,
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    num_winners INTEGER NOT NULL DEFAULT 1 CHECK (num_winners >= 1 AND num_winners <= 50),
    num_alternates INTEGER NOT NULL DEFAULT 1 CHECK (num_alternates >= 0 AND num_alternates <= 50),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CLOSED', 'DRAWN', 'CANCELLED')),
    require_follow BOOLEAN NOT NULL DEFAULT false,
    require_like BOOLEAN NOT NULL DEFAULT false,
    require_comment BOOLEAN NOT NULL DEFAULT false,
    min_mentions INTEGER NOT NULL DEFAULT 0 CHECK (min_mentions >= 0 AND min_mentions <= 10),
    required_keyword TEXT DEFAULT NULL,
    excluded_usernames TEXT[] NOT NULL DEFAULT '{}',
    terms_and_conditions TEXT NOT NULL,
    organizer_disclaimer_accepted BOOLEAN NOT NULL DEFAULT false,
    closed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    drawn_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    cancelled_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    cancel_reason TEXT DEFAULT NULL,
    total_eligible_count INTEGER DEFAULT 0,
    total_evaluated_count INTEGER DEFAULT 0,
    selection_hash TEXT DEFAULT NULL,
    post_snapshot JSONB DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_post_giveaways_post_id ON public.post_giveaways(post_id);
CREATE INDEX IF NOT EXISTS idx_post_giveaways_organizer_id ON public.post_giveaways(organizer_id);
CREATE INDEX IF NOT EXISTS idx_post_giveaways_status_ends_at ON public.post_giveaways(status, ends_at);
CREATE INDEX IF NOT EXISTS idx_post_giveaways_certificate_code ON public.post_giveaways(certificate_code);

-- 3. Tabla de snapshot inmutable de participantes al momento del cierre
CREATE TABLE IF NOT EXISTS public.giveaway_participants_snapshot (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    giveaway_id UUID NOT NULL REFERENCES public.post_giveaways(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    has_follow BOOLEAN NOT NULL DEFAULT false,
    has_like BOOLEAN NOT NULL DEFAULT false,
    has_comment BOOLEAN NOT NULL DEFAULT false,
    mentions_count INTEGER NOT NULL DEFAULT 0,
    has_keyword BOOLEAN NOT NULL DEFAULT true,
    is_excluded BOOLEAN NOT NULL DEFAULT false,
    is_eligible BOOLEAN NOT NULL DEFAULT false,
    missing_criteria TEXT[] NOT NULL DEFAULT '{}',
    snapshot_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(giveaway_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_giveaway_participants_giveaway_id ON public.giveaway_participants_snapshot(giveaway_id);
CREATE INDEX IF NOT EXISTS idx_giveaway_participants_eligible ON public.giveaway_participants_snapshot(giveaway_id, is_eligible);

-- 4. Tabla de ganadores y suplentes oficiales certificados
CREATE TABLE IF NOT EXISTS public.giveaway_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    giveaway_id UUID NOT NULL REFERENCES public.post_giveaways(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('WINNER', 'ALTERNATE')),
    position INTEGER NOT NULL, -- 1, 2, 3...
    status TEXT NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'REPLACED', 'CLAIMED')),
    selected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    replaced_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    replacement_reason TEXT DEFAULT NULL,
    replaced_by_user_id UUID REFERENCES public.profiles(id) DEFAULT NULL,
    UNIQUE(giveaway_id, role, position)
);

CREATE INDEX IF NOT EXISTS idx_giveaway_results_giveaway_id ON public.giveaway_results(giveaway_id);
CREATE INDEX IF NOT EXISTS idx_giveaway_results_user_id ON public.giveaway_results(user_id);

-- 5. Tabla de auditoría inmutable de acciones del sorteo
CREATE TABLE IF NOT EXISTS public.giveaway_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    giveaway_id UUID NOT NULL REFERENCES public.post_giveaways(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('CREATE', 'CLOSE', 'DRAW', 'CANCEL', 'WINNER_REPLACE', 'TERMS_VIEW')),
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_giveaway_audit_giveaway_id ON public.giveaway_audit_log(giveaway_id);

-- 6. Habilitar RLS estricta en todas las tablas
ALTER TABLE public.post_giveaways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.giveaway_participants_snapshot ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.giveaway_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.giveaway_audit_log ENABLE ROW LEVEL SECURITY;

-- Políticas para post_giveaways
DROP POLICY IF EXISTS "Lectura pública de sorteos" ON public.post_giveaways;
CREATE POLICY "Lectura pública de sorteos"
ON public.post_giveaways FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Organizadores pueden crear sorteos" ON public.post_giveaways;
CREATE POLICY "Organizadores pueden crear sorteos"
ON public.post_giveaways FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = organizer_id);

DROP POLICY IF EXISTS "Organizadores pueden actualizar sus sorteos" ON public.post_giveaways;
CREATE POLICY "Organizadores pueden actualizar sus sorteos"
ON public.post_giveaways FOR UPDATE
TO authenticated
USING (auth.uid() = organizer_id)
WITH CHECK (auth.uid() = organizer_id);

DROP POLICY IF EXISTS "Organizadores pueden eliminar sus sorteos no sorteados" ON public.post_giveaways;
CREATE POLICY "Organizadores pueden eliminar sus sorteos no sorteados"
ON public.post_giveaways FOR DELETE
TO authenticated
USING (auth.uid() = organizer_id AND status != 'DRAWN');

-- Políticas para giveaway_participants_snapshot (Lectura pública para transparencia del sorteo)
DROP POLICY IF EXISTS "Lectura pública de snapshot de participantes" ON public.giveaway_participants_snapshot;
CREATE POLICY "Lectura pública de snapshot de participantes"
ON public.giveaway_participants_snapshot FOR SELECT
TO public
USING (true);

-- Políticas para giveaway_results (Lectura pública para verificación de certificado)
DROP POLICY IF EXISTS "Lectura pública de resultados certificados" ON public.giveaway_results;
CREATE POLICY "Lectura pública de resultados certificados"
ON public.giveaway_results FOR SELECT
TO public
USING (true);

-- Políticas para giveaway_audit_log (Lectura pública para trazabilidad de sorteos certificados)
DROP POLICY IF EXISTS "Lectura pública de auditoría de sorteos" ON public.giveaway_audit_log;
CREATE POLICY "Lectura pública de auditoría de sorteos"
ON public.giveaway_audit_log FOR SELECT
TO public
USING (true);
