-- Migration: 20260927023000_fix_claim_founder_spot.sql
-- Description: Corrige la asignación automática de plazas de Arrocero Fundador (#000-#099)
-- 1. Permite ejecución vía service_role / backend server actions además del usuario autenticado
-- 2. Elimina la restricción obsoleta de receta publicada (v_has_recipe), permitiendo asignación a usuarios elegibles en registro/onboarding
-- 3. Mantiene exclusión de cuenta oficial misarroces y exclusión mutua estricta con LOCK TABLE

CREATE OR REPLACE FUNCTION public.claim_founder_spot(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_founder_number INTEGER;
BEGIN
    -- 1. Seguridad y Autorización
    -- Permitir si es service_role, superadmin (postgres/supabase_admin) o el propio usuario autenticado
    IF auth.role() = 'service_role' OR current_user IN ('postgres', 'supabase_admin') THEN
        -- Permitido para service_role / admin
        NULL;
    ELSIF auth.uid() IS NOT NULL AND auth.uid() = p_user_id THEN
        -- Permitido para el propio usuario
        NULL;
    ELSE
        RAISE EXCEPTION 'Acceso denegado: no puedes reclamar una plaza para otro usuario.';
    END IF;

    -- 2. Excluir explícitamente a la cuenta oficial ADMIN de misarroces
    IF p_user_id = 'd5e0c178-49d0-4160-b122-d518f5d46036' THEN
        RETURN -1;
    END IF;

    -- 3. Validar que el usuario existe en profiles
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id) THEN
        RETURN NULL;
    END IF;

    -- 4. Comprobar si ya es fundador
    SELECT founder_number INTO v_founder_number FROM public.founders WHERE user_id = p_user_id;
    IF v_founder_number IS NOT NULL THEN
        -- Retornamos -1 para indicar que ya era fundador y evitar reenvíos duplicados
        RETURN -1;
    END IF;

    -- 5. Candado para evitar condiciones de carrera en asignaciones concurrentes
    LOCK TABLE public.founders IN EXCLUSIVE MODE;

    -- Re-verificar tras el bloqueo por si otra transacción concurrente asignó la plaza justo antes
    SELECT founder_number INTO v_founder_number FROM public.founders WHERE user_id = p_user_id;
    IF v_founder_number IS NOT NULL THEN
        RETURN -1;
    END IF;

    -- 6. Buscar siguiente plaza correlativa (0 a 99)
    SELECT COALESCE(MAX(founder_number), -1) + 1 INTO v_founder_number FROM public.founders;
    
    -- Si se alcanzaron las 100 plazas (0 a 99), no asignar más
    IF v_founder_number > 99 THEN
        RETURN NULL;
    END IF;

    -- 7. Asignar la plaza de Arrocero Fundador
    INSERT INTO public.founders (founder_number, user_id, granted_at)
    VALUES (v_founder_number, p_user_id, now());
    
    RETURN v_founder_number;
END;
$$;
