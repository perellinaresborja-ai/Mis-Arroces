-- 1. Create the secure RPC function to handle legal acceptances
CREATE OR REPLACE FUNCTION accept_current_legal_documents()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    INSERT INTO user_legal_acceptances (user_id, document_id, accepted_at)
    SELECT v_user_id, id, NOW()
    FROM legal_documents
    WHERE is_active = true
    ON CONFLICT (user_id, document_id) DO NOTHING;
END;
$$;

-- Grant execution to authenticated and anon users (anon is needed if signup flow hasn't fully upgraded the role yet but has auth.uid())
GRANT EXECUTE ON FUNCTION accept_current_legal_documents() TO authenticated, anon;

-- 2. Revoke direct INSERT from clients by dropping the permissive policy
DROP POLICY IF EXISTS "Users can insert their own acceptances" ON user_legal_acceptances;
