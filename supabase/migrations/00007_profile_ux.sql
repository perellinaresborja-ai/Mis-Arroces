-- MIS ARROCES — BLOCK 5.2 (PROFILE UX CORRECTION)

-- 1. UPDATE USERNAME CONSTRAINT
-- Postgres auto-names constraints if not provided. Usually table_column_check.
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_username_check;

-- Add the new constraint allowing dot (.)
ALTER TABLE profiles ADD CONSTRAINT profiles_username_check 
  CHECK (username ~ '^[a-z0-9_.]{3,30}$');
