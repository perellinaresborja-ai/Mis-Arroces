-- Simplify conversation members policy
DROP POLICY IF EXISTS "View conversation members" ON conversation_members;
CREATE POLICY "View conversation members" ON conversation_members FOR SELECT USING (
  user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = conversation_members.conversation_id
      AND c.participant_hash LIKE '%' || auth.uid()::text || '%'
  )
);
