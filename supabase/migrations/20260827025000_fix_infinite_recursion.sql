-- Drop all possible policies on conversation_members
DROP POLICY IF EXISTS "View conversation members" ON conversation_members;
DROP POLICY IF EXISTS "Users can view conversation members" ON conversation_members;

-- The safest way to avoid infinite recursion on join tables is to use a security definer function
CREATE OR REPLACE FUNCTION auth_is_member_of_conversation(conv_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM conversation_members
    WHERE conversation_id = conv_id AND user_id = auth.uid()
  );
$$;

CREATE POLICY "View conversation members" ON conversation_members FOR SELECT USING (
  user_id = auth.uid() OR auth_is_member_of_conversation(conversation_id)
);
