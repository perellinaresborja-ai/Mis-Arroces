-- Fix security vulnerability where users could fake their accepted_at timestamp

CREATE OR REPLACE FUNCTION enforce_legal_acceptance_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  -- Always enforce the server timestamp to prevent client manipulation
  NEW.accepted_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_legal_acceptance_timestamp ON user_legal_acceptances;
CREATE TRIGGER ensure_legal_acceptance_timestamp
  BEFORE INSERT OR UPDATE ON user_legal_acceptances
  FOR EACH ROW
  EXECUTE FUNCTION enforce_legal_acceptance_timestamp();
