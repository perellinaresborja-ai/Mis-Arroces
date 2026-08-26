-- 1. CREATE NEW ENUMS
CREATE TYPE public.base_account_type_enum AS ENUM ('PERSONAL', 'PROFESSIONAL');
CREATE TYPE public.professional_type_enum AS ENUM ('CHEF', 'RESTAURANT', 'CREATOR', 'BRAND', 'OTHER');

-- 2. ADD COLUMNS
ALTER TABLE public.profiles ADD COLUMN new_account_type public.base_account_type_enum DEFAULT 'PERSONAL'::public.base_account_type_enum;
ALTER TABLE public.profiles ADD COLUMN professional_type public.professional_type_enum;

-- 3. MIGRATE DATA (Map old values to new structure)
UPDATE public.profiles 
SET 
  new_account_type = CASE 
    WHEN account_type::text IN ('CHEF', 'RESTAURANT', 'PRODUCER') THEN 'PROFESSIONAL'::public.base_account_type_enum 
    ELSE 'PERSONAL'::public.base_account_type_enum 
  END,
  professional_type = CASE 
    WHEN account_type::text = 'CHEF' THEN 'CHEF'::public.professional_type_enum 
    WHEN account_type::text = 'RESTAURANT' THEN 'RESTAURANT'::public.professional_type_enum 
    WHEN account_type::text = 'PRODUCER' THEN 'OTHER'::public.professional_type_enum 
    ELSE NULL 
  END;

-- 4. REPLACE OLD COLUMN
-- Drop views or references if necessary. 
-- In our schema, only application logic uses it, so we can drop it.
ALTER TABLE public.profiles DROP COLUMN account_type;
ALTER TABLE public.profiles RENAME COLUMN new_account_type TO account_type;

-- Optional: Drop the old enum type if we are sure it's unused
DROP TYPE IF EXISTS public.account_type_enum;
