
-- 0. Añadir published_at a recipes y crear trigger para registrar la primera vez que se publica
ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

CREATE OR REPLACE FUNCTION public.set_recipe_published_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.status = 'PUBLISHED' AND OLD.status IS DISTINCT FROM 'PUBLISHED' AND OLD.published_at IS NULL THEN
        NEW.published_at = now();
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_recipe_published_at ON public.recipes;
CREATE TRIGGER trg_set_recipe_published_at
BEFORE UPDATE ON public.recipes
FOR EACH ROW
EXECUTE FUNCTION public.set_recipe_published_at();

-- 1. Crear tabla founders
CREATE TABLE IF NOT EXISTS public.founders (
    founder_number INTEGER PRIMARY KEY CHECK (founder_number BETWEEN 0 AND 99),
    user_id UUID NOT NULL REFERENCES public.profiles(id) UNIQUE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    welcome_email_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

ALTER TABLE public.founders ADD COLUMN IF NOT EXISTS welcome_email_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 2. Habilitar RLS y políticas
ALTER TABLE public.founders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on founders"
ON public.founders FOR SELECT
TO public
USING (true);

-- 3. Insertar los 8 fundadores fijos (0 al 7)
-- Omitimos a misarroces (ADMIN) por completo
INSERT INTO public.founders (founder_number, user_id) VALUES
(0, '259dce9b-8dc1-42b7-8c26-c2ab55f189f0'), -- Arrocero Alicantino
(1, '6adede4a-47b6-48ea-9af2-50bc6e56b6ed'), -- Marichus
(2, '74f9e5f3-f4b0-4b01-8597-b387a8774c32'), -- Ximo
(3, '09ed5acf-5402-484e-9e00-8501961d30ec'), -- Agustín Almodóvar
(4, '854ea7aa-bf72-40ff-9c09-987a9792a371'), -- David Blanco
(5, '3ad29209-30e2-4367-944f-e47fa3dce4a8'), -- Chef R Montoya
(6, '9c3613aa-b712-4e89-a96d-da2b66f79641'), -- Paelladehoje
(7, '1dc0479a-dd03-41ab-b2e6-75de6f2c4634')  -- Juanitoentrefuegos
ON CONFLICT (founder_number) DO NOTHING;

-- 4. Asignar cronológicamente (desde el 8) a los usuarios existentes con recetas publicadas
DO $$
DECLARE
    rec RECORD;
    v_next_num INTEGER;
BEGIN
    SELECT COALESCE(MAX(founder_number), -1) + 1 INTO v_next_num FROM public.founders;
    IF v_next_num < 8 THEN v_next_num := 8; END IF;

    FOR rec IN 
        SELECT r.owner_id 
        FROM public.recipes r
        LEFT JOIN public.founders f ON r.owner_id = f.user_id
        WHERE r.status = 'PUBLISHED' 
          AND r.owner_id IS NOT NULL 
          AND f.user_id IS NULL
          AND r.owner_id != 'd5e0c178-49d0-4160-b122-d518f5d46036' -- Omitimos a misarroces explícitamente
        GROUP BY r.owner_id
        ORDER BY MIN(r.created_at) ASC
    LOOP
        IF v_next_num > 99 THEN
            EXIT;
        END IF;
        
        INSERT INTO public.founders (founder_number, user_id)
        VALUES (v_next_num, rec.owner_id);
        
        v_next_num := v_next_num + 1;
    END LOOP;
END;
$$;

-- 5. Crear la función segura RPC para reclamar plaza dinámicamente
CREATE OR REPLACE FUNCTION public.claim_founder_spot(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_founder_number INTEGER;
    v_has_recipe BOOLEAN;
BEGIN
-- Seguridad: Verificar que quien ejecuta es el propio usuario
    IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
        RAISE EXCEPTION 'Acceso denegado: no puedes reclamar una plaza para otro usuario.';
    END IF;

    -- Excluir explícitamente al ADMIN (misarroces)
    IF p_user_id = 'd5e0c178-49d0-4160-b122-d518f5d46036' THEN
        RETURN -1;
    END IF;

    -- Comprobar si ya es fundador
    SELECT founder_number INTO v_founder_number FROM public.founders WHERE user_id = p_user_id;
    IF v_founder_number IS NOT NULL THEN
        -- Retornamos -1 para indicar que ya era fundador y así evitar que el backend envíe el email repetido
        RETURN -1;
    END IF;

    -- Validar que tiene receta publicada
    SELECT EXISTS (
        SELECT 1 FROM public.recipes 
        WHERE owner_id = p_user_id AND status = 'PUBLISHED'
    ) INTO v_has_recipe;
    
    IF NOT v_has_recipe THEN
        RETURN NULL;
    END IF;

    -- Candado para evitar asignaciones duplicadas simultáneas
    LOCK TABLE public.founders IN EXCLUSIVE MODE;

    -- Buscar siguiente plaza (0 a 99)
    SELECT COALESCE(MAX(founder_number), -1) + 1 INTO v_founder_number FROM public.founders;
    
    -- Si hemos pasado del 99, abortar y devolver null
    IF v_founder_number > 99 THEN
        RETURN NULL;
    END IF;

    -- Asignar y devolver el número EXACTO ganado para enviar el email
    INSERT INTO public.founders (founder_number, user_id) VALUES (v_founder_number, p_user_id);
    
    RETURN v_founder_number;
END;
$$;

-- 6. Crear tabla user_identities (QR / ID permanente e independiente de @username)
CREATE TABLE IF NOT EXISTS public.user_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    public_code VARCHAR(32) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    revoked_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    revoked_reason TEXT DEFAULT NULL
);

-- Habilitar RLS estricta
ALTER TABLE public.user_identities ENABLE ROW LEVEL SECURITY;

-- Lectura pública solo de identidades activas (para resolución de /id/[code])
DROP POLICY IF EXISTS "Allow public read access on active user_identities" ON public.user_identities;
CREATE POLICY "Allow public read access on active user_identities"
ON public.user_identities FOR SELECT
TO public
USING (is_active = true);

-- Bloqueo total de escritura directa desde cliente (sin INSERT/UPDATE/DELETE para public ni authenticated)
REVOKE INSERT, UPDATE, DELETE ON public.user_identities FROM public, authenticated;

-- Función criptográfica segura para generar el identificador (16 hex chars)
CREATE OR REPLACE FUNCTION public.generate_public_identity_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_code TEXT;
    v_exists BOOLEAN;
BEGIN
    LOOP
        v_code := encode(gen_random_bytes(8), 'hex');
        SELECT EXISTS(SELECT 1 FROM public.user_identities WHERE public_code = v_code) INTO v_exists;
        IF NOT v_exists THEN
            RETURN v_code;
        END IF;
    END LOOP;
END;
$$;

-- Función RPC auditada y blindada: get_or_create_user_identity
CREATE OR REPLACE FUNCTION public.get_or_create_user_identity(p_user_id UUID DEFAULT NULL)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_target_user_id UUID;
    v_public_code TEXT;
BEGIN
    -- Control de Acceso:
    -- 1. Si es service_role o superadmin (postgres/supabase_admin), puede especificar p_user_id.
    -- 2. Si es usuario autenticado vía JWT, SOLO puede gestionar su propia identidad (auth.uid()).
    IF auth.role() = 'service_role' OR current_user IN ('postgres', 'supabase_admin') THEN
        IF p_user_id IS NULL THEN
            RAISE EXCEPTION 'service_role o admin debe proporcionar un p_user_id válido.';
        END IF;
        v_target_user_id := p_user_id;
    ELSIF auth.uid() IS NOT NULL THEN
        -- Si un usuario intenta enviar el UUID de otro, se rechaza
        IF p_user_id IS NOT NULL AND p_user_id != auth.uid() THEN
            RAISE EXCEPTION 'Acceso denegado: no puedes obtener ni generar la identidad de otro usuario.';
        END IF;
        v_target_user_id := auth.uid();
    ELSE
        RAISE EXCEPTION 'No autorizado: se requiere sesión de usuario o service_role.';
    END IF;

    -- Validar que el usuario existe en profiles
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_target_user_id) THEN
        RAISE EXCEPTION 'El perfil de usuario especificado no existe.';
    END IF;

    -- Comprobar si ya tiene identidad permanente asignada
    SELECT public_code INTO v_public_code 
    FROM public.user_identities 
    WHERE user_id = v_target_user_id;
    
    IF v_public_code IS NOT NULL THEN
        RETURN v_public_code;
    END IF;

    -- Candado para evitar condición de carrera en creación simultánea
    PERFORM pg_advisory_xact_lock(hashtext('user_identities_' || v_target_user_id::text));

    -- Re-comprobar tras adquirir el candado
    SELECT public_code INTO v_public_code 
    FROM public.user_identities 
    WHERE user_id = v_target_user_id;
    
    IF v_public_code IS NOT NULL THEN
        RETURN v_public_code;
    END IF;

    -- Generar código aleatorio criptográfico
    v_public_code := public.generate_public_identity_code();

    -- Insertar la identidad permanente
    INSERT INTO public.user_identities (user_id, public_code)
    VALUES (v_target_user_id, v_public_code)
    ON CONFLICT (user_id) DO NOTHING;

    -- Retornar el código efectivo
    SELECT public_code INTO v_public_code 
    FROM public.user_identities 
    WHERE user_id = v_target_user_id;

    RETURN v_public_code;
END;
$$;

-- Restricción de permisos EXECUTE
REVOKE ALL ON FUNCTION public.get_or_create_user_identity(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_or_create_user_identity(UUID) TO authenticated, service_role;

-- 7. Backfill seguro: Crear identidades para perfiles existentes (solo en la migración inicial)
DO $$
DECLARE
    p RECORD;
    v_code TEXT;
BEGIN
    FOR p IN SELECT id FROM public.profiles WHERE id NOT IN (SELECT user_id FROM public.user_identities)
    LOOP
        v_code := public.generate_public_identity_code();
        INSERT INTO public.user_identities (user_id, public_code)
        VALUES (p.id, v_code)
        ON CONFLICT (user_id) DO NOTHING;
    END LOOP;
END;
$$;

-- 8. Tabla para registro interno de recomendaciones de Fundadores
CREATE TABLE IF NOT EXISTS public.founder_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_founder_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    referred_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    referral_code VARCHAR(32) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

ALTER TABLE public.founder_referrals ENABLE ROW LEVEL SECURITY;

-- No exponer públicamente: solo accesible por service_role / backend
REVOKE ALL ON public.founder_referrals FROM public, authenticated;
GRANT ALL ON public.founder_referrals TO service_role;


