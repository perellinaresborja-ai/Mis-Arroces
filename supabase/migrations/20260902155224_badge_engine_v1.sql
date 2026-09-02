-- ==========================================
-- BADGE ENGINE V1
-- ==========================================

DO $$$ BEGIN
    CREATE TYPE public.badge_type_enum AS ENUM ('TRAJECTORY', 'RECOGNITION');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$$;

DO $$$ BEGIN
    CREATE TYPE public.badge_category_enum AS ENUM ('COOKING', 'CREATOR', 'EXPLORATION', 'ANNIVERSARY', 'OFFICIAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$$;

CREATE TABLE IF NOT EXISTS public.badge_definitions (
    id VARCHAR(50) PRIMARY KEY,
    type public.badge_type_enum NOT NULL,
    category public.badge_category_enum NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    version VARCHAR(20) DEFAULT 'badge-engine-v1',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_badges (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_id VARCHAR(50) REFERENCES public.badge_definitions(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    progress JSONB,
    source_version VARCHAR(20) DEFAULT 'badge-engine-v1',
    PRIMARY KEY (user_id, badge_id)
);

-- RLS
ALTER TABLE public.badge_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for authenticated" ON public.badge_definitions FOR SELECT TO authenticated USING (true);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read own badges" ON public.user_badges FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Insert Default Badges
INSERT INTO public.badge_definitions (id, type, category, name, description) VALUES
('COOK_1', 'TRAJECTORY', 'COOKING', 'Primer Arroz', 'Completaste tu primera elaboración.'),
('COOK_10', 'TRAJECTORY', 'COOKING', '10 Arroces', 'Has cocinado 10 arroces.'),
('COOK_25', 'TRAJECTORY', 'COOKING', '25 Arroces', 'Has cocinado 25 arroces.'),
('COOK_50', 'TRAJECTORY', 'COOKING', '50 Arroces', 'Has cocinado 50 arroces.'),
('COOK_100', 'TRAJECTORY', 'COOKING', '100 Arroces', 'Has cocinado 100 arroces.'),
('COOK_250', 'TRAJECTORY', 'COOKING', '250 Arroces', 'Has cocinado 250 arroces.'),
('COOK_500', 'TRAJECTORY', 'COOKING', '500 Arroces', 'Has cocinado 500 arroces.'),
('FIRST_REPEAT', 'TRAJECTORY', 'COOKING', 'Mejorando la técnica', 'Has repetido una receta por primera vez.'),
('REPEAT_5', 'TRAJECTORY', 'COOKING', 'Perfeccionista', 'Has cocinado la misma receta 5 veces.'),
('REPEAT_10', 'TRAJECTORY', 'COOKING', 'Obsesión arrocera', 'Has cocinado la misma receta 10 veces.'),
('EXPLORER_STYLES_3', 'TRAJECTORY', 'EXPLORATION', 'Explorador de Estilos', 'Has cocinado 3 estilos de arroz diferentes.'),
('EXPLORER_VARIETIES_3', 'TRAJECTORY', 'EXPLORATION', 'Explorador de Variedades', 'Has cocinado 3 variedades de arroz diferentes.'),
('EXPLORER_HEAT_3', 'TRAJECTORY', 'EXPLORATION', 'Dominador del Fuego', 'Has utilizado 3 fuentes de calor diferentes.'),
('CREATOR_FIRST_RECIPE', 'TRAJECTORY', 'CREATOR', 'Creador', 'Publicaste tu primera receta.'),
('CREATOR_COOKED_1', 'TRAJECTORY', 'CREATOR', 'Inspiración', 'Alguien más cocinó tu receta.'),
('CREATOR_COOKED_10', 'TRAJECTORY', 'CREATOR', 'Referente', '10 usuarios diferentes cocinaron tus recetas.'),
('CREATOR_COOKED_50', 'TRAJECTORY', 'CREATOR', 'Maestro creador', '50 usuarios diferentes cocinaron tus recetas.'),
('ANNIVERSARY_1_YEAR', 'TRAJECTORY', 'ANNIVERSARY', '1 Año', 'Llevas 1 año en misarroces.'),
('ANNIVERSARY_2_YEARS', 'TRAJECTORY', 'ANNIVERSARY', '2 Años', 'Llevas 2 años en misarroces.'),
('ANNIVERSARY_5_YEARS', 'TRAJECTORY', 'ANNIVERSARY', '5 Años', 'Llevas 5 años en misarroces.'),
('CHEF', 'RECOGNITION', 'OFFICIAL', 'Chef', 'Reconocimiento oficial de Chef misarroces.'),
('MAESTRO', 'RECOGNITION', 'OFFICIAL', 'Maestro Arrocero', 'Reconocimiento oficial de Maestro Arrocero.'),
('EVALUADOR', 'RECOGNITION', 'OFFICIAL', 'Evaluador Guía', 'Miembro de la Guía misarroces.')
ON CONFLICT (id) DO NOTHING;

-- EVALUATION ENGINE (RPC)
CREATE OR REPLACE FUNCTION public.evaluate_user_badges(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$$
DECLARE
    v_version VARCHAR := 'badge-engine-v1';
BEGIN
    IF auth.uid() != p_user_id AND (current_setting('role', true) IS NULL OR current_setting('role', true) != 'service_role') THEN
        RAISE EXCEPTION 'Unauthorized to evaluate badges for another user';
    END IF;

    -- 1. COOKING MILESTONES
    WITH user_cooks AS (
        SELECT created_at, ROW_NUMBER() OVER (ORDER BY created_at) as rn
        FROM public.cooking_sessions
        WHERE user_id = p_user_id AND status = 'COMPLETED'
    ),
    earned AS (
        SELECT 'COOK_1' as badge_id, created_at FROM user_cooks WHERE rn = 1
        UNION ALL SELECT 'COOK_10', created_at FROM user_cooks WHERE rn = 10
        UNION ALL SELECT 'COOK_25', created_at FROM user_cooks WHERE rn = 25
        UNION ALL SELECT 'COOK_50', created_at FROM user_cooks WHERE rn = 50
        UNION ALL SELECT 'COOK_100', created_at FROM user_cooks WHERE rn = 100
        UNION ALL SELECT 'COOK_250', created_at FROM user_cooks WHERE rn = 250
        UNION ALL SELECT 'COOK_500', created_at FROM user_cooks WHERE rn = 500
    )
    INSERT INTO public.user_badges (user_id, badge_id, earned_at, source_version)
    SELECT p_user_id, badge_id, created_at, v_version FROM earned
    ON CONFLICT (user_id, badge_id) DO NOTHING;

    -- 2. REPEAT MILESTONES
    WITH repeat_cooks AS (
        SELECT recipe_id, created_at,
               ROW_NUMBER() OVER (PARTITION BY recipe_id ORDER BY created_at) as cook_num
        FROM public.cooking_sessions
        WHERE user_id = p_user_id AND status = 'COMPLETED'
    ),
    repeat_earned AS (
        SELECT 'FIRST_REPEAT' as badge_id, MIN(created_at) as created_at FROM repeat_cooks WHERE cook_num = 2 GROUP BY recipe_id
        UNION ALL
        SELECT 'REPEAT_5', MIN(created_at) FROM repeat_cooks WHERE cook_num = 5 GROUP BY recipe_id
        UNION ALL
        SELECT 'REPEAT_10', MIN(created_at) FROM repeat_cooks WHERE cook_num = 10 GROUP BY recipe_id
    ),
    repeat_final AS (
        SELECT badge_id, MIN(created_at) as created_at FROM repeat_earned GROUP BY badge_id
    )
    INSERT INTO public.user_badges (user_id, badge_id, earned_at, source_version)
    SELECT p_user_id, badge_id, created_at, v_version FROM repeat_final
    ON CONFLICT (user_id, badge_id) DO NOTHING;

    -- 3. EXPLORATION MILESTONES
    WITH styles AS (
        SELECT r.style_id, MIN(cs.created_at) as first_time
        FROM public.cooking_sessions cs JOIN public.recipes r ON cs.recipe_id = r.id
        WHERE cs.user_id = p_user_id AND cs.status = 'COMPLETED' AND r.style_id IS NOT NULL
        GROUP BY r.style_id
    ), styles_rn AS ( SELECT first_time, ROW_NUMBER() OVER (ORDER BY first_time) as rn FROM styles ),
    varieties AS (
        SELECT cs.rice_variety_id, MIN(cs.created_at) as first_time
        FROM public.cooking_sessions cs 
        WHERE cs.user_id = p_user_id AND cs.status = 'COMPLETED' AND cs.rice_variety_id IS NOT NULL
        GROUP BY cs.rice_variety_id
    ), varieties_rn AS ( SELECT first_time, ROW_NUMBER() OVER (ORDER BY first_time) as rn FROM varieties ),
    heats AS (
        SELECT cs.heat_source, MIN(cs.created_at) as first_time
        FROM public.cooking_sessions cs 
        WHERE cs.user_id = p_user_id AND cs.status = 'COMPLETED' AND cs.heat_source IS NOT NULL
        GROUP BY cs.heat_source
    ), heats_rn AS ( SELECT first_time, ROW_NUMBER() OVER (ORDER BY first_time) as rn FROM heats ),
    exploration_earned AS (
        SELECT 'EXPLORER_STYLES_3' as badge_id, first_time FROM styles_rn WHERE rn = 3
        UNION ALL SELECT 'EXPLORER_VARIETIES_3', first_time FROM varieties_rn WHERE rn = 3
        UNION ALL SELECT 'EXPLORER_HEAT_3', first_time FROM heats_rn WHERE rn = 3
    )
    INSERT INTO public.user_badges (user_id, badge_id, earned_at, source_version)
    SELECT p_user_id, badge_id, first_time, v_version FROM exploration_earned
    ON CONFLICT (user_id, badge_id) DO NOTHING;

    -- 4. CREATOR MILESTONES
    WITH published AS (
        SELECT created_at, ROW_NUMBER() OVER (ORDER BY created_at) as rn
        FROM public.recipes WHERE owner_id = p_user_id AND status = 'PUBLISHED'
    ),
    community_cooks AS (
        SELECT cs.user_id, MIN(cs.created_at) as first_cook_at
        FROM public.cooking_sessions cs
        JOIN public.recipes r ON cs.recipe_id = r.id
        WHERE r.owner_id = p_user_id AND cs.status = 'COMPLETED' AND cs.user_id != p_user_id
        GROUP BY cs.user_id
    ),
    unique_community AS (
        SELECT first_cook_at, ROW_NUMBER() OVER (ORDER BY first_cook_at) as rn FROM community_cooks
    ),
    creator_earned AS (
        SELECT 'CREATOR_FIRST_RECIPE' as badge_id, created_at FROM published WHERE rn = 1
        UNION ALL SELECT 'CREATOR_COOKED_1', first_cook_at FROM unique_community WHERE rn = 1
        UNION ALL SELECT 'CREATOR_COOKED_10', first_cook_at FROM unique_community WHERE rn = 10
        UNION ALL SELECT 'CREATOR_COOKED_50', first_cook_at FROM unique_community WHERE rn = 50
    )
    INSERT INTO public.user_badges (user_id, badge_id, earned_at, source_version)
    SELECT p_user_id, badge_id, created_at, v_version FROM creator_earned
    ON CONFLICT (user_id, badge_id) DO NOTHING;

    -- 5. ANNIVERSARY MILESTONES
    WITH prof AS (
        SELECT created_at FROM public.profiles WHERE id = p_user_id
    ),
    anniv_earned AS (
        SELECT 'ANNIVERSARY_1_YEAR' as badge_id, created_at + interval '1 year' as earned_at FROM prof WHERE NOW() >= created_at + interval '1 year'
        UNION ALL SELECT 'ANNIVERSARY_2_YEARS', created_at + interval '2 years' as earned_at FROM prof WHERE NOW() >= created_at + interval '2 years'
        UNION ALL SELECT 'ANNIVERSARY_5_YEARS', created_at + interval '5 years' as earned_at FROM prof WHERE NOW() >= created_at + interval '5 years'
    )
    INSERT INTO public.user_badges (user_id, badge_id, earned_at, source_version)
    SELECT p_user_id, badge_id, earned_at, v_version FROM anniv_earned
    ON CONFLICT (user_id, badge_id) DO NOTHING;

END;
$$$;

-- GRANT RECOGNITION (ADMIN/SERVICE ONLY)
CREATE OR REPLACE FUNCTION public.grant_recognition_badge(p_user_id UUID, p_badge_id VARCHAR, p_metadata JSONB DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$$
DECLARE
    v_type public.badge_type_enum;
BEGIN
    IF current_setting('role', true) IS NULL OR current_setting('role', true) != 'service_role' THEN
        RAISE EXCEPTION 'Only service_role can grant recognition badges';
    END IF;

    SELECT type INTO v_type FROM public.badge_definitions WHERE id = p_badge_id;
    IF v_type != 'RECOGNITION' THEN
        RAISE EXCEPTION 'This function is only for RECOGNITION badges';
    END IF;

    INSERT INTO public.user_badges (user_id, badge_id, progress, source_version)
    VALUES (p_user_id, p_badge_id, p_metadata, 'badge-engine-v1')
    ON CONFLICT (user_id, badge_id) DO UPDATE SET progress = p_metadata;
END;
$$$;

-- BACKFILL ALL
CREATE OR REPLACE FUNCTION public.backfill_all_user_badges()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$$
DECLARE
    r RECORD;
BEGIN
    IF current_setting('role', true) IS NULL OR current_setting('role', true) != 'service_role' THEN
        RAISE EXCEPTION 'Only service_role can run backfill';
    END IF;

    FOR r IN SELECT id FROM public.profiles LOOP
        PERFORM public.evaluate_user_badges(r.id);
    END LOOP;
END;
$$$;

-- RESTRICT EXECUTION TO AUTHENTICATED OR SERVICE ROLE
REVOKE EXECUTE ON FUNCTION public.evaluate_user_badges(UUID) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.evaluate_user_badges(UUID) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.grant_recognition_badge(UUID, VARCHAR, JSONB) FROM public, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.backfill_all_user_badges() FROM public, anon, authenticated;

