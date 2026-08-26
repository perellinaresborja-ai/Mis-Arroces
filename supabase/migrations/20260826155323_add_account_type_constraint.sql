-- Ensure account_type is NOT NULL
ALTER TABLE public.profiles ALTER COLUMN account_type SET NOT NULL;

-- Ensure professional_type is NULL when account_type is PERSONAL
ALTER TABLE public.profiles ADD CONSTRAINT chk_professional_type_null CHECK (
  (account_type = 'PERSONAL' AND professional_type IS NULL) OR 
  (account_type = 'PROFESSIONAL')
);
