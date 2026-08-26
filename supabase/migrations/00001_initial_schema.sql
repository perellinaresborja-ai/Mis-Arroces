-- 00001_initial_schema.sql
-- MIS ARROCES — BLOCK 0 MIGRATION

-- ==============================================================================
-- 1. ENUMS
-- ==============================================================================
CREATE TYPE account_type_enum AS ENUM ('USER', 'CHEF', 'RESTAURANT', 'PRODUCER');
CREATE TYPE privacy_level_enum AS ENUM ('PUBLIC', 'PRIVATE');
CREATE TYPE account_status_enum AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED');
CREATE TYPE recipe_status_enum AS ENUM ('DRAFT', 'PUBLISHED');
CREATE TYPE visibility_level_enum AS ENUM ('PUBLIC', 'FOLLOWERS', 'PRIVATE');
CREATE TYPE difficulty_level_enum AS ENUM ('EASY', 'MEDIUM', 'HARD');
CREATE TYPE media_type_enum AS ENUM ('IMAGE', 'VIDEO');
CREATE TYPE follow_status_enum AS ENUM ('PENDING', 'ACCEPTED');

-- ==============================================================================
-- 2. HELPER FUNCTIONS
-- ==============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 3. CORE IDENTITY & MEDIA (BLOCK 0)
-- ==============================================================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL CHECK (username ~ '^[a-z0-9_]{3,30}$'),
    display_name TEXT,
    avatar_media_id UUID, -- FK added later
    bio TEXT,
    location TEXT,
    account_type account_type_enum NOT NULL DEFAULT 'USER',
    privacy_level privacy_level_enum NOT NULL DEFAULT 'PUBLIC',
    account_status account_status_enum NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE username_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    old_username TEXT NOT NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    storage_path TEXT UNIQUE NOT NULL,
    media_type media_type_enum NOT NULL DEFAULT 'IMAGE',
    mime_type TEXT NOT NULL,
    width INT,
    height INT,
    alt_text TEXT,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles
    ADD CONSTRAINT fk_profiles_avatar FOREIGN KEY (avatar_media_id) REFERENCES media_assets(id) ON DELETE SET NULL;

-- ==============================================================================
-- 4. CATALOGS (BLOCK 0)
-- ==============================================================================
CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    is_scalable BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_name TEXT UNIQUE NOT NULL,
    normalized_name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE rice_styles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE rice_varieties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE vessel_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE heat_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 5. RECIPE DOMAIN (BLOCK 0)
-- ==============================================================================
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Nullable to allow retaining community recipes if user deletes account
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    status recipe_status_enum NOT NULL DEFAULT 'DRAFT',
    visibility visibility_level_enum NOT NULL DEFAULT 'PUBLIC',
    style_id UUID REFERENCES rice_styles(id) ON DELETE RESTRICT,
    variety_id UUID REFERENCES rice_varieties(id) ON DELETE RESTRICT,
    heat_source_id UUID REFERENCES heat_sources(id) ON DELETE RESTRICT,
    base_servings NUMERIC NOT NULL DEFAULT 1 CHECK (base_servings > 0),
    rice_qty NUMERIC CHECK (rice_qty >= 0),
    stock_qty NUMERIC CHECK (stock_qty >= 0),
    cook_time INT CHECK (cook_time >= 0),
    rest_time INT CHECK (rest_time >= 0),
    difficulty difficulty_level_enum,
    allow_comments BOOLEAN NOT NULL DEFAULT true,
    derived_from_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX unq_owner_slug ON recipes(owner_id, slug) WHERE owner_id IS NOT NULL;

CREATE TABLE recipe_vessels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    vessel_type_id UUID NOT NULL REFERENCES vessel_types(id) ON DELETE RESTRICT,
    diameter_cm NUMERIC CHECK (diameter_cm > 0),
    capacity_liters NUMERIC CHECK (capacity_liters > 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE recipe_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    step_number INT NOT NULL CHECK (step_number > 0),
    instruction TEXT NOT NULL,
    duration_minutes INT CHECK (duration_minutes >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unq_recipe_step UNIQUE(recipe_id, step_number)
);

CREATE TABLE recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    canonical_ingredient_id UUID REFERENCES ingredients(id) ON DELETE SET NULL,
    unit_id UUID REFERENCES units(id) ON DELETE RESTRICT,
    normalized_quantity NUMERIC CHECK (normalized_quantity >= 0),
    display_text TEXT NOT NULL,
    display_order INT NOT NULL CHECK (display_order > 0),
    is_scalable BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE recipe_tags (
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (recipe_id, tag_id)
);

CREATE TABLE recipe_media (
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    media_id UUID NOT NULL UNIQUE REFERENCES media_assets(id) ON DELETE CASCADE, -- UNIQUE ensures media is only used by ONE recipe
    display_order INT NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (recipe_id, media_id)
);
CREATE UNIQUE INDEX unq_primary_recipe_media ON recipe_media (recipe_id) WHERE is_primary = true;

CREATE TABLE recipe_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    revision_number INT NOT NULL CHECK (revision_number > 0),
    snapshot JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unq_recipe_revision UNIQUE(recipe_id, revision_number)
);

-- ==============================================================================
-- 6. COOKING HISTORY (BLOCK 0)
-- ==============================================================================
CREATE TABLE cooking_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE, -- if recipe is deleted, session is deleted (unless recipe is soft deleted)
    date DATE NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    socarrat_level INT CHECK (socarrat_level >= 1 AND socarrat_level <= 5),
    notes TEXT,
    modifications TEXT,
    actual_servings NUMERIC CHECK (actual_servings > 0),
    visibility visibility_level_enum NOT NULL DEFAULT 'PUBLIC',
    allow_comments BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE session_media (
    session_id UUID NOT NULL REFERENCES cooking_sessions(id) ON DELETE CASCADE,
    media_id UUID NOT NULL UNIQUE REFERENCES media_assets(id) ON DELETE CASCADE, -- UNIQUE ensures media is only used by ONE session
    display_order INT NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (session_id, media_id)
);
CREATE UNIQUE INDEX unq_primary_session_media ON session_media (session_id) WHERE is_primary = true;

-- ==============================================================================
-- 7. SOCIAL & ORGANIZATION (BLOCK 0)
-- ==============================================================================
CREATE TABLE collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    visibility visibility_level_enum NOT NULL DEFAULT 'PRIVATE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE collection_recipes (
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (collection_id, recipe_id)
);

CREATE TABLE saves (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, recipe_id)
);

CREATE TABLE want_to_cook (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, recipe_id)
);

CREATE TABLE follows (
    follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status follow_status_enum NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (follower_id, following_id),
    CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

CREATE TABLE blocks (
    blocker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (blocker_id, blocked_id),
    CONSTRAINT no_self_block CHECK (blocker_id != blocked_id)
);

-- ==============================================================================
-- 8. TRIGGERS FOR UPDATED_AT
-- ==============================================================================
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_media_assets_updated_at BEFORE UPDATE ON media_assets FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_recipes_updated_at BEFORE UPDATE ON recipes FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_recipe_steps_updated_at BEFORE UPDATE ON recipe_steps FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_cooking_sessions_updated_at BEFORE UPDATE ON cooking_sessions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_collections_updated_at BEFORE UPDATE ON collections FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_follows_updated_at BEFORE UPDATE ON follows FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ==============================================================================
-- 9. INDEXES
-- ==============================================================================
CREATE INDEX idx_recipes_owner_status_vis ON recipes (owner_id, status, visibility);
CREATE INDEX idx_cooking_sessions_user_recipe ON cooking_sessions (user_id, recipe_id);
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_recipes_name_trgm ON recipes USING GIN (name gin_trgm_ops);
CREATE INDEX idx_ingredients_name_trgm ON ingredients USING GIN (normalized_name gin_trgm_ops);

-- ==============================================================================
-- 10. RLS & AUTHORIZATION HELPERS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.is_blocked(uid1 UUID, uid2 UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM blocks 
    WHERE (blocker_id = uid1 AND blocked_id = uid2) 
       OR (blocker_id = uid2 AND blocked_id = uid1)
  );
$$;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE username_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_vessels ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE want_to_cook ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE rice_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rice_varieties ENABLE ROW LEVEL SECURITY;
ALTER TABLE vessel_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE heat_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON units FOR SELECT USING (true);
CREATE POLICY "Public read access" ON ingredients FOR SELECT USING (true);
CREATE POLICY "Public read access" ON rice_styles FOR SELECT USING (true);
CREATE POLICY "Public read access" ON rice_varieties FOR SELECT USING (true);
CREATE POLICY "Public read access" ON vessel_types FOR SELECT USING (true);
CREATE POLICY "Public read access" ON heat_sources FOR SELECT USING (true);
CREATE POLICY "Public read access" ON tags FOR SELECT USING (true);

