-- Migration: Enforce Display Name Uniqueness and Mandatory Identity
-- Ensures display_name is unique (case-insensitive, normalized whitespace) for all new inserts and updates,
-- while preserving legacy unchanged accounts.

-- 1. Index on lower(trim(display_name)) for fast availability checks
CREATE INDEX IF NOT EXISTS idx_profiles_display_name_lower 
ON public.profiles (LOWER(TRIM(display_name)));

-- 2. Trigger function to enforce unique display_name without breaking historical duplicates
CREATE OR REPLACE FUNCTION public.check_profile_identity_rules()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_norm_new text;
  v_norm_old text;
BEGIN
  -- Validate presence of display_name
  IF NEW.display_name IS NULL OR TRIM(NEW.display_name) = '' THEN
    RAISE EXCEPTION 'El nombre es obligatorio' USING ERRCODE = '23502';
  END IF;

  -- Validate presence of username
  IF NEW.username IS NULL OR TRIM(NEW.username) = '' THEN
    RAISE EXCEPTION 'El nombre de usuario es obligatorio' USING ERRCODE = '23502';
  END IF;

  -- Normalize display names: trim and collapse multiple internal whitespaces, lowercase
  v_norm_new := LOWER(REGEXP_REPLACE(TRIM(NEW.display_name), '\s+', ' ', 'g'));

  IF TG_OP = 'UPDATE' THEN
    IF OLD.display_name IS NOT NULL THEN
      v_norm_old := LOWER(REGEXP_REPLACE(TRIM(OLD.display_name), '\s+', ' ', 'g'));
      -- If display_name hasn't changed, allow the update (preserves existing accounts)
      IF v_norm_new = v_norm_old THEN
        RETURN NEW;
      END IF;
    END IF;
  END IF;

  -- Check if another profile already has this normalized display_name
  IF EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id <> NEW.id 
      AND display_name IS NOT NULL 
      AND LOWER(REGEXP_REPLACE(TRIM(display_name), '\s+', ' ', 'g')) = v_norm_new
  ) THEN
    RAISE EXCEPTION 'El nombre "%" ya está en uso por otra cuenta', NEW.display_name USING ERRCODE = '23505';
  END IF;

  RETURN NEW;
END;
$$;

-- 3. Create or replace trigger on public.profiles
DROP TRIGGER IF EXISTS trg_check_profile_identity ON public.profiles;

CREATE TRIGGER trg_check_profile_identity
BEFORE INSERT OR UPDATE OF display_name, username
ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.check_profile_identity_rules();
